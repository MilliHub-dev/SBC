import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { validateMiningStake, validateMiningClaim, validateUUIDParam } from '../middleware/validation.js';
import { generalLimiter, web3Limiter } from '../middleware/rateLimit.js';

export const router = Router();

// Get mining plans configuration
router.get('/plans', generalLimiter, async (req, res) => {
  try {
    const plans = {
      free: {
        name: 'Free Plan',
        type: 'free',
        deposit_required: 0,
        daily_reward: parseFloat(process.env.MINING_FREE_RATE || 0.9),
        duration_days: null, // Indefinite
        auto_claim: false,
        claim_interval_hours: 24,
        description: 'Earn Sabi Cash daily with manual claims every 24 hours'
      },
      basic: {
        name: 'Basic Plan',
        type: 'basic',
        deposit_required: parseFloat(process.env.MINING_BASIC_DEPOSIT || 100),
        daily_reward: parseFloat(process.env.MINING_BASIC_RATE || 15),
        duration_days: 30,
        auto_claim: false,
        claim_interval_hours: 24,
        description: 'Deposit 100 SABI to earn 15 SABI daily for 30 days'
      },
      premium: {
        name: 'Premium Plan',
        type: 'premium',
        deposit_required: parseFloat(process.env.MINING_PREMIUM_DEPOSIT || 1000),
        daily_reward: parseFloat(process.env.MINING_PREMIUM_RATE || 170),
        duration_days: 30,
        auto_claim: true,
        claim_interval_hours: 24,
        description: 'Deposit 1000 SABI to earn 170 SABI daily for 30 days with auto-trigger'
      }
    };

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Mining plans error:', error);
    res.status(500).json({
      success: false,
      error: 'MINING_PLANS_FAILED',
      message: 'Failed to fetch mining plans'
    });
  }
});

// Get user mining status
router.get('/status', requireAuth, generalLimiter, async (req, res) => {
  try {
    // Get active mining stakes
    const stakesResult = await query(
      `SELECT id, plan_type, amount_staked, daily_reward, start_date, end_date, 
              last_claim_at, total_claimed, is_active, auto_claim,
              CASE 
                WHEN last_claim_at IS NULL THEN start_date + INTERVAL '24 hours'
                ELSE last_claim_at + INTERVAL '24 hours'
              END as next_claim_at,
              CASE 
                WHEN end_date IS NOT NULL AND NOW() > end_date THEN 'expired'
                WHEN is_active = FALSE THEN 'inactive'
                ELSE 'active'
              END as status
       FROM mining_stakes 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    // Get free plan status (always available)
    const freePlanResult = await query(
      `SELECT last_claim_at,
              CASE 
                WHEN last_claim_at IS NULL THEN NOW()
                ELSE last_claim_at + INTERVAL '24 hours'
              END as next_claim_at,
              CASE 
                WHEN last_claim_at IS NULL OR last_claim_at + INTERVAL '24 hours' <= NOW() THEN true
                ELSE false
              END as can_claim
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );

    const freeStatus = freePlanResult.rows[0];
    const currentTime = new Date();

    // Process each stake
    const stakes = stakesResult.rows.map(stake => {
      const nextClaimTime = new Date(stake.next_claim_at);
      const canClaim = currentTime >= nextClaimTime && stake.status === 'active';
      
      let pendingRewards = 0;
      if (canClaim) {
        const daysSinceLastClaim = stake.last_claim_at 
          ? Math.floor((currentTime - new Date(stake.last_claim_at)) / (1000 * 60 * 60 * 24))
          : Math.floor((currentTime - new Date(stake.start_date)) / (1000 * 60 * 60 * 24));
        pendingRewards = Math.min(daysSinceLastClaim, stake.end_date ? Math.ceil((new Date(stake.end_date) - new Date(stake.start_date)) / (1000 * 60 * 60 * 24)) : daysSinceLastClaim) * stake.daily_reward;
      }

      return {
        id: stake.id,
        plan_type: stake.plan_type,
        amount_staked: parseFloat(stake.amount_staked),
        daily_reward: parseFloat(stake.daily_reward),
        start_date: stake.start_date,
        end_date: stake.end_date,
        last_claim_at: stake.last_claim_at,
        next_claim_at: stake.next_claim_at,
        total_claimed: parseFloat(stake.total_claimed),
        pending_rewards: pendingRewards,
        can_claim: canClaim,
        is_active: stake.is_active,
        auto_claim: stake.auto_claim,
        status: stake.status
      };
    });

    res.json({
      success: true,
      free_plan: {
        last_claim_at: freeStatus.last_claim_at,
        next_claim_at: freeStatus.next_claim_at,
        can_claim: freeStatus.can_claim,
        daily_reward: parseFloat(process.env.MINING_FREE_RATE || 0.9)
      },
      stakes,
      summary: {
        active_stakes: stakes.filter(s => s.status === 'active').length,
        total_staked: stakes.filter(s => s.is_active).reduce((sum, s) => sum + s.amount_staked, 0),
        total_daily_rewards: stakes.filter(s => s.is_active).reduce((sum, s) => sum + s.daily_reward, 0),
        total_claimed: stakes.reduce((sum, s) => sum + s.total_claimed, 0)
      }
    });
  } catch (error) {
    console.error('Mining status error:', error);
    res.status(500).json({
      success: false,
      error: 'MINING_STATUS_FAILED',
      message: 'Failed to fetch mining status'
    });
  }
});

// Stake for mining (basic/premium plans)
router.post('/stake', requireAuth, web3Limiter, validateMiningStake, async (req, res) => {
  try {
    const { planType, amount, walletAddress } = req.body;

    const requiredAmount = planType === 'basic' 
      ? parseFloat(process.env.MINING_BASIC_DEPOSIT || 100)
      : parseFloat(process.env.MINING_PREMIUM_DEPOSIT || 1000);

    const dailyReward = planType === 'basic'
      ? parseFloat(process.env.MINING_BASIC_RATE || 15)
      : parseFloat(process.env.MINING_PREMIUM_RATE || 170);

    if (amount !== requiredAmount) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_AMOUNT',
        message: `${planType} plan requires exactly ${requiredAmount} SABI`
      });
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // Check user's Sabi Cash balance
      const userResult = await query(
        'SELECT sabi_cash_balance, wallet_address FROM users WHERE id = $1 FOR UPDATE',
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

      if (parseFloat(user.sabi_cash_balance) < amount) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient Sabi Cash balance'
        });
      }

      // Update wallet address if provided
      if (walletAddress && walletAddress !== user.wallet_address) {
        await query('UPDATE users SET wallet_address = $1 WHERE id = $2', [walletAddress, req.user.id]);
      }

      // Deduct amount from user balance
      await query(
        'UPDATE users SET sabi_cash_balance = sabi_cash_balance - $1 WHERE id = $2',
        [amount, req.user.id]
      );

      // Create mining stake
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days from now

      const stakeResult = await query(
        `INSERT INTO mining_stakes (user_id, plan_type, amount_staked, daily_reward, start_date, end_date, is_active, auto_claim)
         VALUES ($1, $2, $3, $4, NOW(), $5, TRUE, $6)
         RETURNING id, start_date, end_date`,
        [req.user.id, planType, amount, dailyReward, endDate, planType === 'premium']
      );

      await query('COMMIT');

      res.json({
        success: true,
        stake: {
          id: stakeResult.rows[0].id,
          plan_type: planType,
          amount_staked: amount,
          daily_reward: dailyReward,
          start_date: stakeResult.rows[0].start_date,
          end_date: stakeResult.rows[0].end_date,
          duration_days: 30
        },
        message: `Successfully staked ${amount} SABI in ${planType} plan`
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Mining stake error:', error);
    res.status(500).json({
      success: false,
      error: 'MINING_STAKE_FAILED',
      message: 'Failed to create mining stake'
    });
  }
});

// Claim free mining rewards
router.post('/claim-free', requireAuth, web3Limiter, validateMiningClaim, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Begin transaction
    await query('BEGIN');

    try {
      // Get user data
      const userResult = await query(
        'SELECT sabi_cash_balance, wallet_address, last_free_claim FROM users WHERE id = $1 FOR UPDATE',
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
      const now = new Date();
      const lastClaim = user.last_free_claim ? new Date(user.last_free_claim) : null;

      // Check if 24 hours have passed since last claim
      if (lastClaim && (now - lastClaim) < 24 * 60 * 60 * 1000) {
        await query('ROLLBACK');
        const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
        return res.status(400).json({
          success: false,
          error: 'CLAIM_TOO_EARLY',
          message: 'Must wait 24 hours between free claims',
          next_claim_at: nextClaimTime
        });
      }

      const dailyReward = parseFloat(process.env.MINING_FREE_RATE || 0.9);

      // Update user balance and last claim time
      await query(
        'UPDATE users SET sabi_cash_balance = sabi_cash_balance + $1, last_free_claim = NOW(), wallet_address = COALESCE($2, wallet_address) WHERE id = $3',
        [dailyReward, walletAddress, req.user.id]
      );

      // Record the claim
      await query(
        `INSERT INTO mining_claims (user_id, claim_type, amount_claimed, claimed_at)
         VALUES ($1, 'free', $2, NOW())`,
        [req.user.id, dailyReward]
      );

      await query('COMMIT');

      const nextClaimTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      res.json({
        success: true,
        amount_claimed: dailyReward,
        claim_type: 'free',
        next_claim_at: nextClaimTime,
        new_balance: parseFloat(user.sabi_cash_balance) + dailyReward,
        message: `Successfully claimed ${dailyReward} SABI from free mining`
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Free claim error:', error);
    res.status(500).json({
      success: false,
      error: 'FREE_CLAIM_FAILED',
      message: 'Failed to claim free mining rewards'
    });
  }
});

// Claim staking rewards
router.post('/claim/:stakeId', requireAuth, web3Limiter, validateUUIDParam('stakeId'), validateMiningClaim, async (req, res) => {
  try {
    const { stakeId } = req.params;
    const { walletAddress } = req.body;

    // Begin transaction
    await query('BEGIN');

    try {
      // Get stake details
      const stakeResult = await query(
        `SELECT ms.*, u.sabi_cash_balance, u.wallet_address
         FROM mining_stakes ms
         JOIN users u ON ms.user_id = u.id
         WHERE ms.id = $1 AND ms.user_id = $2 FOR UPDATE`,
        [stakeId, req.user.id]
      );

      if (stakeResult.rowCount === 0) {
        await query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'STAKE_NOT_FOUND',
          message: 'Mining stake not found'
        });
      }

      const stake = stakeResult.rows[0];
      const now = new Date();

      if (!stake.is_active) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'STAKE_INACTIVE',
          message: 'Mining stake is not active'
        });
      }

      if (stake.end_date && now > new Date(stake.end_date)) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'STAKE_EXPIRED',
          message: 'Mining stake has expired'
        });
      }

      // Check if can claim (24 hours since last claim or start)
      const lastClaimTime = stake.last_claim_at ? new Date(stake.last_claim_at) : new Date(stake.start_date);
      const timeSinceLastClaim = now - lastClaimTime;

      if (timeSinceLastClaim < 24 * 60 * 60 * 1000) {
        await query('ROLLBACK');
        const nextClaimTime = new Date(lastClaimTime.getTime() + 24 * 60 * 60 * 1000);
        return res.status(400).json({
          success: false,
          error: 'CLAIM_TOO_EARLY',
          message: 'Must wait 24 hours between claims',
          next_claim_at: nextClaimTime
        });
      }

      // Calculate claimable amount (days since last claim * daily reward)
      const daysSinceLastClaim = Math.floor(timeSinceLastClaim / (1000 * 60 * 60 * 24));
      const maxDays = stake.end_date 
        ? Math.ceil((new Date(stake.end_date) - new Date(stake.start_date)) / (1000 * 60 * 60 * 24))
        : daysSinceLastClaim;
      
      const claimableDays = Math.min(daysSinceLastClaim, maxDays);
      const claimableAmount = claimableDays * parseFloat(stake.daily_reward);

      if (claimableAmount <= 0) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'NO_REWARDS',
          message: 'No rewards available to claim'
        });
      }

      // Update user balance
      await query(
        'UPDATE users SET sabi_cash_balance = sabi_cash_balance + $1, wallet_address = COALESCE($2, wallet_address) WHERE id = $3',
        [claimableAmount, walletAddress, req.user.id]
      );

      // Update stake
      await query(
        'UPDATE mining_stakes SET last_claim_at = NOW(), total_claimed = total_claimed + $1 WHERE id = $2',
        [claimableAmount, stakeId]
      );

      // Record the claim
      await query(
        `INSERT INTO mining_claims (user_id, stake_id, claim_type, amount_claimed, claimed_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [req.user.id, stakeId, stake.plan_type, claimableAmount]
      );

      await query('COMMIT');

      const nextClaimTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      res.json({
        success: true,
        stake_id: stakeId,
        amount_claimed: claimableAmount,
        days_claimed: claimableDays,
        claim_type: stake.plan_type,
        next_claim_at: nextClaimTime,
        new_balance: parseFloat(stake.sabi_cash_balance) + claimableAmount,
        total_claimed: parseFloat(stake.total_claimed) + claimableAmount,
        message: `Successfully claimed ${claimableAmount} SABI from ${stake.plan_type} mining`
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Stake claim error:', error);
    res.status(500).json({
      success: false,
      error: 'STAKE_CLAIM_FAILED',
      message: 'Failed to claim staking rewards'
    });
  }
});

// Unstake (early withdrawal)
router.post('/unstake/:stakeId', requireAuth, web3Limiter, validateUUIDParam('stakeId'), async (req, res) => {
  try {
    const { stakeId } = req.params;

    // Begin transaction
    await query('BEGIN');

    try {
      // Get stake details
      const stakeResult = await query(
        `SELECT * FROM mining_stakes WHERE id = $1 AND user_id = $2 FOR UPDATE`,
        [stakeId, req.user.id]
      );

      if (stakeResult.rowCount === 0) {
        await query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'STAKE_NOT_FOUND',
          message: 'Mining stake not found'
        });
      }

      const stake = stakeResult.rows[0];

      if (!stake.is_active) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'STAKE_INACTIVE',
          message: 'Mining stake is already inactive'
        });
      }

      // Calculate penalty (e.g., 10% penalty for early withdrawal)
      const penaltyRate = 0.1; // 10%
      const refundAmount = parseFloat(stake.amount_staked) * (1 - penaltyRate);
      const penalty = parseFloat(stake.amount_staked) - refundAmount;

      // Update user balance
      await query(
        'UPDATE users SET sabi_cash_balance = sabi_cash_balance + $1 WHERE id = $2',
        [refundAmount, req.user.id]
      );

      // Deactivate stake
      await query(
        'UPDATE mining_stakes SET is_active = FALSE, unstaked_at = NOW(), refund_amount = $1, penalty_amount = $2 WHERE id = $3',
        [refundAmount, penalty, stakeId]
      );

      await query('COMMIT');

      res.json({
        success: true,
        stake_id: stakeId,
        original_amount: parseFloat(stake.amount_staked),
        refund_amount: refundAmount,
        penalty_amount: penalty,
        penalty_rate: penaltyRate,
        message: `Successfully unstaked with ${penalty} SABI penalty`
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Unstake error:', error);
    res.status(500).json({
      success: false,
      error: 'UNSTAKE_FAILED',
      message: 'Failed to unstake'
    });
  }
});

// Get mining history
router.get('/history', requireAuth, generalLimiter, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT mc.id, mc.stake_id, mc.claim_type, mc.amount_claimed, mc.claimed_at,
              ms.plan_type, ms.daily_reward
       FROM mining_claims mc
       LEFT JOIN mining_stakes ms ON mc.stake_id = ms.id
       WHERE mc.user_id = $1
       ORDER BY mc.claimed_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      success: true,
      results: result.rows.map(row => ({
        id: row.id,
        stake_id: row.stake_id,
        claim_type: row.claim_type,
        plan_type: row.plan_type,
        amount_claimed: parseFloat(row.amount_claimed),
        daily_reward: parseFloat(row.daily_reward || 0),
        claimed_at: row.claimed_at
      }))
    });
  } catch (error) {
    console.error('Mining history error:', error);
    res.status(500).json({
      success: false,
      error: 'MINING_HISTORY_FAILED',
      message: 'Failed to fetch mining history'
    });
  }
});