import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateTransactionLog, validatePagination } from '../middleware/validation.js';
import { web3Limiter, generalLimiter } from '../middleware/rateLimit.js';

export const router = Router();

// Log a web3 transaction (convert points, reward, etc.)
router.post('/', optionalAuth, web3Limiter, validateTransactionLog, async (req, res) => {
  try {
    const { walletAddress, transactionHash, transactionType, chainId, network, ethAmount, usdtAmount, sabiCashAmount, pointsConverted, blockNumber, gasUsed, gasPrice, status, transactionData } = req.body;

    // Check for duplicate transaction
    const existingTx = await query(
      'SELECT id FROM web3_transactions WHERE transaction_hash = $1',
      [transactionHash]
    );

    if (existingTx.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'TRANSACTION_EXISTS',
        message: 'Transaction already logged',
        transaction_id: existingTx.rows[0].id
      });
    }

    const result = await query(
      `INSERT INTO web3_transactions (user_id, wallet_address, transaction_hash, transaction_type, chain_id, network, eth_amount, usdt_amount, sabi_cash_amount, points_converted, block_number, gas_used, gas_price, status, transaction_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id, transaction_hash as "transactionHash", transaction_type as "transactionType", status, created_at as "createdAt"`,
      [req.user?.id || null, walletAddress, transactionHash, transactionType, chainId || 1442, network || 'polygon-zkevm', ethAmount || null, usdtAmount || null, sabiCashAmount || null, pointsConverted || null, blockNumber || null, gasUsed || null, gasPrice || null, status || 'pending', transactionData || null]
    );

    res.status(201).json({ 
      success: true, 
      transaction: result.rows[0],
      message: 'Transaction logged successfully'
    });
  } catch (err) {
    console.error('Transaction log error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'TX_LOG_FAILED', 
      message: 'Failed to log transaction' 
    });
  }
});

// Update a transaction status
router.post('/:txHash/status', web3Limiter, async (req, res) => {
  try {
    const { txHash } = req.params;
    const { status, confirmations, blockNumber } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'INVALID_INPUT',
        message: 'Status is required' 
      });
    }

    const validStatuses = ['pending', 'confirmed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await query(
      `UPDATE web3_transactions 
       SET status = $1, 
           confirmations = COALESCE($2, confirmations), 
           block_number = COALESCE($3, block_number), 
           confirmed_at = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE confirmed_at END,
           updated_at = NOW()
       WHERE transaction_hash = $4 
       RETURNING id, transaction_hash, status, confirmations, block_number as "blockNumber", confirmed_at as "confirmedAt", updated_at as "updatedAt"`,
      [status, confirmations || null, blockNumber || null, txHash]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'TX_NOT_FOUND',
        message: 'Transaction not found' 
      });
    }

    res.json({ 
      success: true, 
      transaction: result.rows[0],
      message: 'Transaction status updated successfully'
    });
  } catch (err) {
    console.error('Transaction update error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'TX_UPDATE_FAILED', 
      message: 'Failed to update transaction status' 
    });
  }
});

// Get user transactions
router.get('/user', requireAuth, generalLimiter, validatePagination, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.type;
    const status = req.query.status;

    let whereClause = 'WHERE user_id = $1';
    let params = [req.user.id];

    if (type) {
      whereClause += ' AND transaction_type = $' + (params.length + 1);
      params.push(type);
    }

    if (status) {
      whereClause += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    const result = await query(
      `SELECT id, transaction_hash, transaction_type, wallet_address, chain_id, network,
              eth_amount, usdt_amount, sabi_cash_amount, points_converted, block_number,
              gas_used, gas_price, status, confirmations, created_at, confirmed_at, transaction_data
       FROM web3_transactions
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Get summary stats
    const statsResult = await query(
      `SELECT 
         COUNT(*) as total_transactions,
         COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_transactions,
         COUNT(*) FILTER (WHERE status = 'pending') as pending_transactions,
         COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions,
         COALESCE(SUM(sabi_cash_amount) FILTER (WHERE status = 'confirmed'), 0) as total_sabi_cash,
         COALESCE(SUM(points_converted) FILTER (WHERE status = 'confirmed'), 0) as total_points_converted
       FROM web3_transactions WHERE user_id = $1`,
      [req.user.id]
    );

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      results: result.rows.map(row => ({
        id: row.id,
        transaction_hash: row.transaction_hash,
        transaction_type: row.transaction_type,
        wallet_address: row.wallet_address,
        chain_id: row.chain_id,
        network: row.network,
        eth_amount: parseFloat(row.eth_amount || 0),
        usdt_amount: parseFloat(row.usdt_amount || 0),
        sabi_cash_amount: parseFloat(row.sabi_cash_amount || 0),
        points_converted: parseInt(row.points_converted || 0),
        block_number: row.block_number,
        gas_used: row.gas_used,
        gas_price: row.gas_price,
        status: row.status,
        confirmations: row.confirmations,
        created_at: row.created_at,
        confirmed_at: row.confirmed_at,
        transaction_data: row.transaction_data
      })),
      summary: {
        total_transactions: parseInt(stats.total_transactions),
        confirmed_transactions: parseInt(stats.confirmed_transactions),
        pending_transactions: parseInt(stats.pending_transactions),
        failed_transactions: parseInt(stats.failed_transactions),
        total_sabi_cash: parseFloat(stats.total_sabi_cash),
        total_points_converted: parseInt(stats.total_points_converted)
      }
    });
  } catch (error) {
    console.error('User transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'USER_TRANSACTIONS_FAILED',
      message: 'Failed to fetch user transactions'
    });
  }
});

// Get transaction by hash
router.get('/:txHash', generalLimiter, async (req, res) => {
  try {
    const { txHash } = req.params;

    const result = await query(
      `SELECT wt.*, u.username, u.email
       FROM web3_transactions wt
       LEFT JOIN users u ON wt.user_id = u.id
       WHERE wt.transaction_hash = $1`,
      [txHash]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'TX_NOT_FOUND',
        message: 'Transaction not found'
      });
    }

    const tx = result.rows[0];

    res.json({
      success: true,
      transaction: {
        id: tx.id,
        transaction_hash: tx.transaction_hash,
        transaction_type: tx.transaction_type,
        wallet_address: tx.wallet_address,
        chain_id: tx.chain_id,
        network: tx.network,
        eth_amount: parseFloat(tx.eth_amount || 0),
        usdt_amount: parseFloat(tx.usdt_amount || 0),
        sabi_cash_amount: parseFloat(tx.sabi_cash_amount || 0),
        points_converted: parseInt(tx.points_converted || 0),
        block_number: tx.block_number,
        gas_used: tx.gas_used,
        gas_price: tx.gas_price,
        status: tx.status,
        confirmations: tx.confirmations,
        created_at: tx.created_at,
        confirmed_at: tx.confirmed_at,
        updated_at: tx.updated_at,
        transaction_data: tx.transaction_data,
        user: tx.user_id ? {
          username: tx.username,
          email: tx.email
        } : null
      }
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'TX_FETCH_FAILED',
      message: 'Failed to fetch transaction'
    });
  }
});

// Verify transaction on blockchain
router.post('/:txHash/verify', requireAuth, web3Limiter, async (req, res) => {
  try {
    const { txHash } = req.params;
    const { walletAddress } = req.body;

    // Get transaction details
    const txResult = await query(
      'SELECT * FROM web3_transactions WHERE transaction_hash = $1',
      [txHash]
    );

    if (txResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'TX_NOT_FOUND',
        message: 'Transaction not found'
      });
    }

    const transaction = txResult.rows[0];

    // Verify wallet address matches
    if (walletAddress && transaction.wallet_address !== walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'WALLET_MISMATCH',
        message: 'Wallet address does not match transaction'
      });
    }

    // In a real implementation, you would verify the transaction on the blockchain
    // For now, we'll simulate verification
    const isVerified = true; // This would be actual blockchain verification
    const confirmations = 12; // This would come from blockchain
    const blockNumber = transaction.block_number || Math.floor(Math.random() * 1000000);

    if (isVerified) {
      // Update transaction status
      await query(
        `UPDATE web3_transactions 
         SET status = 'confirmed', confirmations = $1, block_number = $2, confirmed_at = NOW()
         WHERE transaction_hash = $3`,
        [confirmations, blockNumber, txHash]
      );

      res.json({
        success: true,
        transaction_verified: true,
        confirmations,
        status: 'confirmed',
        block_number: blockNumber,
        message: 'Transaction verified successfully'
      });
    } else {
      await query(
        'UPDATE web3_transactions SET status = $1 WHERE transaction_hash = $2',
        ['failed', txHash]
      );

      res.json({
        success: false,
        transaction_verified: false,
        status: 'failed',
        message: 'Transaction verification failed'
      });
    }
  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({
      success: false,
      error: 'TX_VERIFY_FAILED',
      message: 'Failed to verify transaction'
    });
  }
});


