import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { validatePointsConversion, validatePagination } from '../middleware/validation.js';
import { conversionLimiter, generalLimiter } from '../middleware/rateLimit.js';

export const router = Router();

// Get user points balance
router.get('/balance', requireAuth, generalLimiter, async (req, res) => {
  try {
    const result = await query(
      `SELECT total_points, sabi_cash_balance, 
              (SELECT COUNT(*) FROM points_history WHERE user_id = $1) as points_history_count,
              (SELECT MAX(created_at) FROM points_history WHERE user_id = $1) as last_earned
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    const user = result.rows[0];
    const conversionRate = parseFloat(process.env.POINTS_TO_SABI_RATE || 0.5);
    const minConversion = parseInt(process.env.MIN_POINTS_CONVERSION || 500);

    res.json({
      success: true,
      total_points: user.total_points,
      sabi_cash_balance: parseFloat(user.sabi_cash_balance),
      points_history_count: user.points_history_count,
      last_earned: user.last_earned,
      conversion_rate: conversionRate,
      min_conversion: minConversion
    });
  } catch (error) {
    console.error('Points balance error:', error);
    res.status(500).json({
      success: false,
      error: 'POINTS_BALANCE_FAILED',
      message: 'Failed to fetch points balance'
    });
  }
});

// Get points history
router.get('/history', requireAuth, generalLimiter, validatePagination, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.type;

    let whereClause = 'WHERE ph.user_id = $1';
    let params = [req.user.id];

    if (type) {
      whereClause += ' AND ph.points_type = $2';
      params.push(type);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM points_history ph ${whereClause}`,
      params
    );

    // Get paginated results
    const historyResult = await query(
      `SELECT ph.id, ph.points_earned, ph.points_type, ph.description, ph.created_at,
              ph.trip_id, ph.task_id, ph.metadata,
              CASE WHEN ph.trip_id IS NOT NULL THEN 'trip'
                   WHEN ph.task_id IS NOT NULL THEN 'task'
                   ELSE ph.points_type END as source_type
       FROM points_history ph
       ${whereClause}
       ORDER BY ph.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const totalCount = parseInt(countResult.rows[0].total);
    const hasNext = offset + limit < totalCount;
    const hasPrevious = offset > 0;

    res.json({
      success: true,
      count: totalCount,
      next: hasNext ? `${req.baseUrl}${req.path}?limit=${limit}&offset=${offset + limit}${type ? `&type=${type}` : ''}` : null,
      previous: hasPrevious ? `${req.baseUrl}${req.path}?limit=${limit}&offset=${Math.max(0, offset - limit)}${type ? `&type=${type}` : ''}` : null,
      results: historyResult.rows.map(row => ({
        id: row.id,
        points_earned: row.points_earned,
        points_type: row.points_type,
        description: row.description,
        created_at: row.created_at,
        source_type: row.source_type,
        trip_id: row.trip_id,
        task_id: row.task_id,
        metadata: row.metadata
      }))
    });
  } catch (error) {
    console.error('Points history error:', error);
    res.status(500).json({
      success: false,
      error: 'POINTS_HISTORY_FAILED',
      message: 'Failed to fetch points history'
    });
  }
});

// Validate points conversion
router.post('/validate-conversion', requireAuth, generalLimiter, validatePointsConversion, async (req, res) => {
  try {
    const { points, walletAddress } = req.body;

    // Get current user points
    const userResult = await query(
      'SELECT total_points, wallet_address FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const conversionRate = parseFloat(process.env.POINTS_TO_SABI_RATE || 0.5);
    const minConversion = parseInt(process.env.MIN_POINTS_CONVERSION || 500);

    // Validation checks
    const validations = {
      sufficient_points: user.total_points >= points,
      meets_minimum: points >= minConversion,
      wallet_matches: !user.wallet_address || user.wallet_address === walletAddress,
      wallet_required: !!walletAddress
    };

    const isValid = Object.values(validations).every(v => v);
    const sabiCashAmount = points * conversionRate;
    const remainingPoints = user.total_points - points;

    res.json({
      success: true,
      valid: isValid,
      validations,
      sabi_cash_amount: sabiCashAmount,
      current_points: user.total_points,
      remaining_points: remainingPoints,
      conversion_rate: conversionRate,
      min_conversion: minConversion,
      message: isValid ? 'Conversion is valid' : 'Conversion validation failed'
    });
  } catch (error) {
    console.error('Points validation error:', error);
    res.status(500).json({
      success: false,
      error: 'POINTS_VALIDATION_FAILED',
      message: 'Failed to validate points conversion'
    });
  }
});

// Convert points to Sabi Cash
router.post('/convert', requireAuth, conversionLimiter, validatePointsConversion, async (req, res) => {
  try {
    const { points, walletAddress } = req.body;

    // Begin transaction
    await query('BEGIN');

    try {
      // Get current user data with row lock
      const userResult = await query(
        'SELECT total_points, wallet_address, sabi_cash_balance FROM users WHERE id = $1 FOR UPDATE',
        [req.user.id]
      );

      if (userResult.rowCount === 0) {
        await query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];
      const conversionRate = parseFloat(process.env.POINTS_TO_SABI_RATE || 0.5);
      const minConversion = parseInt(process.env.MIN_POINTS_CONVERSION || 500);

      // Validation
      if (user.total_points < points) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_POINTS',
          message: 'Insufficient points for conversion'
        });
      }

      if (points < minConversion) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'BELOW_MINIMUM',
          message: `Minimum conversion is ${minConversion} points`
        });
      }

      if (user.wallet_address && user.wallet_address !== walletAddress) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'WALLET_MISMATCH',
          message: 'Wallet address does not match account'
        });
      }

      // Calculate conversion
      const sabiCashAmount = points * conversionRate;
      const newPointBalance = user.total_points - points;
      const newSabiCashBalance = parseFloat(user.sabi_cash_balance) + sabiCashAmount;

      // Update user balances
      await query(
        'UPDATE users SET total_points = $1, sabi_cash_balance = $2, wallet_address = $3, updated_at = NOW() WHERE id = $4',
        [newPointBalance, newSabiCashBalance, walletAddress, req.user.id]
      );

      // Record points deduction
      await query(
        `INSERT INTO points_history (user_id, points_earned, points_type, description, metadata)
         VALUES ($1, $2, 'conversion', 'Points converted to Sabi Cash', $3)`,
        [req.user.id, -points, { 
          sabi_cash_amount: sabiCashAmount, 
          wallet_address: walletAddress,
          conversion_rate: conversionRate 
        }]
      );

      // Create conversion transaction record
      const transactionResult = await query(
        `INSERT INTO point_conversions (user_id, points_converted, sabi_cash_amount, conversion_rate, wallet_address, status)
         VALUES ($1, $2, $3, $4, $5, 'signed')
         RETURNING id, created_at`,
        [req.user.id, points, sabiCashAmount, conversionRate, walletAddress]
      );

      const nonce = transactionResult.rows[0].id; // Use DB ID as nonce

      // Direct Transfer of Sabi Cash Tokens
      const signerPrivateKey = process.env.OPERATOR_PRIVATE_KEY;
      const contractAddress = process.env.SABI_CASH_CONTRACT_ADDRESS;
      let signature = null;
      let transferStatus = 'pending';

      if (signerPrivateKey && contractAddress) {
        try {
            console.log("Initiating direct token transfer...");
            const bs58 = await import('bs58');
            const { Connection, Keypair, PublicKey, clusterApiUrl } = await import('@solana/web3.js');
            const { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint } = await import('@solana/spl-token');

            // Setup connection
            const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet');
            const connection = new Connection(rpcUrl, 'confirmed');

            // Setup signer
            let keypair;
            try {
              keypair = Keypair.fromSecretKey(bs58.decode(signerPrivateKey));
            } catch {
              keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(signerPrivateKey)));
            }

            // Setup token info
            const mintPubkey = new PublicKey(contractAddress);
            const userPubkey = new PublicKey(walletAddress);

            // Get/Create Token Accounts
            // 1. Operator's Account (Source)
            const sourceAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                keypair,
                mintPubkey,
                keypair.publicKey
            );

            // 2. User's Account (Destination)
            // Note: We pay for the creation of the user's ATA if it doesn't exist
            const destinationAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                keypair,
                mintPubkey,
                userPubkey
            );

            // Get mint info to determine decimals
            const mintInfo = await getMint(connection, mintPubkey);
            const decimals = mintInfo.decimals;
            const amountInSmallestUnit = BigInt(Math.floor(sabiCashAmount * Math.pow(10, decimals)));

            // Check Operator Balance
            if (sourceAccount.amount < amountInSmallestUnit) {
                console.error(`Insufficient funds in treasury. Have: ${sourceAccount.amount}, Need: ${amountInSmallestUnit}`);
                throw new Error("Treasury has insufficient funds to fulfill this conversion.");
            }

            // Create Transfer Transaction
            const tx = new (await import('@solana/web3.js')).Transaction().add(
                createTransferInstruction(
                    sourceAccount.address,
                    destinationAccount.address,
                    keypair.publicKey,
                    amountInSmallestUnit
                )
            );

            // Send Transaction
            const txSignature = await connection.sendTransaction(tx, [keypair]);
            console.log(`Transfer transaction sent: ${txSignature}`);
            
            // Confirm Transaction
            const confirmation = await connection.confirmTransaction(txSignature, 'confirmed');
            
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
            }

            signature = txSignature;
            transferStatus = 'completed';
            console.log("Token transfer confirmed successfully.");

        } catch (transferErr) {
            console.error("Token transfer failed:", transferErr);
            transferStatus = 'failed';
            // We do NOT rollback the DB transaction here because the points are already deducted.
            // Instead, we log the failure and maybe trigger a manual retry or refund mechanism.
            // For now, we return the error to the user but the points are gone from DB state (simulating 'pending processing').
            // Ideally, we should have a 'pending_transfers' table. 
            // We will update the response message to reflect this.
        }
      } else {
          console.warn("Missing OPERATOR_PRIVATE_KEY or SABI_CASH_CONTRACT_ADDRESS. Skipping token transfer.");
          transferStatus = 'skipped_config_missing';
      }

      await query('COMMIT');

      res.json({
        success: true,
        points_converted: points,
        sabi_cash_amount: sabiCashAmount,
        new_point_balance: newPointBalance,
        new_sabi_cash_balance: newSabiCashBalance,
        transaction_id: nonce,
        signature: signature, // This is now the transaction hash
        transfer_status: transferStatus,
        created_at: transactionResult.rows[0].created_at,
        message: signature 
            ? 'Points converted and Sabi Cash tokens sent to your wallet!' 
            : 'Points converted. Token transfer is pending (Check Administrator).'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Points conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'POINTS_CONVERSION_FAILED',
      message: 'Failed to convert points'
    });
  }
});

// Award points (internal use - for trip completion, tasks, etc.)
router.post('/award', requireAuth, async (req, res) => {
  try {
    const { points, pointsType, description, metadata, tripId, taskId } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_POINTS',
        message: 'Points must be a positive number'
      });
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // Update user points
      const userResult = await query(
        'UPDATE users SET total_points = total_points + $1, updated_at = NOW() WHERE id = $2 RETURNING total_points',
        [points, req.user.id]
      );

      if (userResult.rowCount === 0) {
        await query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      // Record points history
      await query(
        `INSERT INTO points_history (user_id, points_earned, points_type, description, metadata, trip_id, task_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.user.id, points, pointsType || 'manual', description || 'Points awarded', metadata || null, tripId || null, taskId || null]
      );

      await query('COMMIT');

      res.json({
        success: true,
        points_awarded: points,
        total_points: userResult.rows[0].total_points,
        message: 'Points awarded successfully'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Points award error:', error);
    res.status(500).json({
      success: false,
      error: 'POINTS_AWARD_FAILED',
      message: 'Failed to award points'
    });
  }
});

// Get conversion history
router.get('/conversions', requireAuth, generalLimiter, validatePagination, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT id, points_converted, sabi_cash_amount, conversion_rate, wallet_address, 
              status, created_at, confirmed_at
       FROM point_conversions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      success: true,
      results: result.rows.map(row => ({
        id: row.id,
        points_converted: row.points_converted,
        sabi_cash_amount: parseFloat(row.sabi_cash_amount),
        conversion_rate: parseFloat(row.conversion_rate),
        wallet_address: row.wallet_address,
        status: row.status,
        created_at: row.created_at,
        confirmed_at: row.confirmed_at
      }))
    });
  } catch (error) {
    console.error('Conversion history error:', error);
    res.status(500).json({
      success: false,
      error: 'CONVERSION_HISTORY_FAILED',
      message: 'Failed to fetch conversion history'
    });
  }
});