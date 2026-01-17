import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAdmin } from '../middleware/admin.js';
import { validateAdminReward, validatePagination } from '../middleware/validation.js';
import { adminLimiter, generalLimiter } from '../middleware/rateLimit.js';

export const router = Router();

// Get system analytics
router.get('/analytics', requireAdmin, generalLimiter, async (req, res) => {
  try {
    // Get user statistics
    console.log('Fetching user stats...');
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE user_type = 'passenger') as total_passengers,
        COUNT(*) FILTER (WHERE user_type = 'driver') as total_drivers,
        COUNT(*) FILTER (WHERE user_type = 'admin') as total_admins,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '24 hours') as active_users_24h,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d
      FROM users
    `);

    // Get points statistics
    const pointsStats = await query(`
      SELECT 
        COALESCE(SUM(total_points), 0) as total_points_in_system,
        COALESCE(AVG(total_points), 0) as avg_points_per_user,
        COUNT(*) FILTER (WHERE total_points > 0) as users_with_points
      FROM users
    `);

    // Get Sabi Cash statistics
    const sabiCashStats = await query(`
      SELECT 
        COALESCE(SUM(sabi_cash_balance), 0) as total_sabi_cash_in_system,
        COALESCE(AVG(sabi_cash_balance), 0) as avg_sabi_cash_per_user,
        COUNT(*) FILTER (WHERE sabi_cash_balance > 0) as users_with_sabi_cash
      FROM users
    `);

    // Get task statistics
    console.log('Fetching task stats...');
    const taskStats = await query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE is_active = true) as active_tasks,
        (SELECT COUNT(*) FROM task_completions) as total_completions,
        (SELECT COUNT(*) FROM task_completions WHERE status = 'verified') as verified_completions,
        (SELECT COUNT(*) FROM task_completions WHERE status = 'pending') as pending_completions,
        (SELECT COUNT(*) FROM task_completions WHERE completed_at >= CURRENT_DATE) as completed_today,
        (SELECT COALESCE(SUM(points_awarded), 0) FROM task_completions WHERE status = 'verified') as total_points_distributed,
        (SELECT COALESCE(SUM(sabi_cash_awarded), 0) FROM task_completions WHERE status = 'verified') as total_cash_distributed,
        (SELECT COALESCE(SUM(t.reward_points), 0) FROM task_completions tc JOIN tasks t ON tc.task_id = t.id WHERE tc.status = 'pending') as pending_points
      FROM tasks
    `);

    // Get mining statistics
    const miningStats = await query(`
      SELECT 
        COUNT(*) as total_stakes,
        COUNT(*) FILTER (WHERE is_active = true) as active_stakes,
        COALESCE(SUM(staked_amount) FILTER (WHERE is_active = true), 0) as total_staked_amount,
        COALESCE(SUM(total_claimed), 0) as total_rewards_claimed,
        COUNT(*) FILTER (WHERE plan_type = 'basic') as basic_stakes,
        COUNT(*) FILTER (WHERE plan_type = 'premium') as premium_stakes
      FROM staking_records
    `);

    // Get transaction statistics
    const transactionStats = await query(`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_transactions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_transactions,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions,
        COALESCE(SUM(sabi_cash_amount) FILTER (WHERE status = 'confirmed'), 0) as total_sabi_cash_transacted,
        COALESCE(SUM(points_converted) FILTER (WHERE status = 'confirmed'), 0) as total_points_converted
      FROM web3_transactions
    `);

    // Get recent activity
    const recentActivity = await query(`
      (SELECT 'user_registration' as type, created_at, 
              json_build_object('email', email, 'user_type', user_type) as data
       FROM users WHERE created_at > NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'task_completion' as type, tc.completed_at as created_at,
              json_build_object('task_id', tc.task_id, 'status', tc.status, 'email', u.email, 'title', t.title) as data
       FROM task_completions tc
       JOIN users u ON tc.user_id = u.id
       LEFT JOIN tasks t ON tc.task_id = t.id
       WHERE tc.completed_at > NOW() - INTERVAL '7 days'
       ORDER BY tc.completed_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'mining_stake' as type, ms.start_time as created_at,
              json_build_object('plan_type', ms.plan_type, 'amount', ms.staked_amount, 'email', u.email) as data
       FROM staking_records ms
       JOIN users u ON ms.user_id = u.id
       WHERE ms.start_time > NOW() - INTERVAL '7 days'
       ORDER BY ms.start_time DESC LIMIT 5)
      ORDER BY created_at DESC LIMIT 10
    `);

    // Get top users
    const topUsers = await query(`
      SELECT 
        id, username, email, total_points as "totalEarned", 
        (SELECT COUNT(*) FROM task_completions WHERE user_id = users.id) as "tasksCompleted"
      FROM users
      ORDER BY total_points DESC
      LIMIT 5
    `);

    // Get task performance
    const taskPerformance = await query(`
      SELECT 
        t.title as "taskName",
        COUNT(tc.id) as completions,
        COALESCE((COUNT(CASE WHEN tc.status = 'verified' THEN 1 END)::float / NULLIF(COUNT(tc.id), 0) * 100), 0) as "successRate",
        COALESCE(SUM(tc.points_awarded), 0) as "totalRewards"
      FROM tasks t
      LEFT JOIN task_completions tc ON t.id = tc.task_id
      GROUP BY t.id, t.title
      ORDER BY completions DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      analytics: {
        users: userStats.rows[0],
        points: pointsStats.rows[0],
        sabi_cash: sabiCashStats.rows[0],
        tasks: taskStats.rows[0],
        mining: miningStats.rows[0],
        transactions: transactionStats.rows[0],
        recent_activity: recentActivity.rows,
        top_users: topUsers.rows,
        task_performance: taskPerformance.rows
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'ANALYTICS_FAILED',
      message: 'Failed to fetch analytics data'
    });
  }
});

// Get all users (admin)
router.get('/users', requireAdmin, generalLimiter, validatePagination, async (req, res) => {
  try {

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const userType = req.query.user_type;
    const isActive = req.query.is_active;
    const search = req.query.search;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (userType) {
      whereClause += ` AND user_type = $${params.length + 1}`;
      params.push(userType);
    }

    if (isActive !== undefined) {
      whereClause += ` AND is_active = $${params.length + 1}`;
      params.push(isActive === 'true');
    }

    if (search) {
      whereClause += ` AND (email ILIKE $${params.length + 1} OR username ILIKE $${params.length + 1} OR first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    const result = await query(
      `SELECT id, email, username, first_name, last_name, user_type, total_points, 
              sabi_cash_balance, wallet_address, is_active, is_verified, created_at, 
              last_login, driver_status
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    res.json({
      success: true,
      count: parseInt(countResult.rows[0].total),
      results: result.rows.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        total_points: user.total_points,
        sabi_cash_balance: parseFloat(user.sabi_cash_balance),
        wallet_address: user.wallet_address,
        is_active: user.is_active,
        is_verified: user.is_verified,
        created_at: user.created_at,
        last_login: user.last_login,
        driver_status: user.driver_status
      }))
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      error: 'ADMIN_USERS_FAILED',
      message: 'Failed to fetch users'
    });
  }
});

// Get user details (admin)
router.get('/users/:userId', requireAdmin, generalLimiter, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user details
    const userResult = await query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Get user statistics
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM points_history WHERE user_id = $1) as total_point_transactions,
        (SELECT COUNT(*) FROM task_completions WHERE user_id = $1) as total_task_completions,
        (SELECT COUNT(*) FROM mining_stakes WHERE user_id = $1) as total_mining_stakes,
        (SELECT COUNT(*) FROM web3_transactions WHERE user_id = $1) as total_web3_transactions,
        (SELECT COALESCE(SUM(total_claimed), 0) FROM mining_stakes WHERE user_id = $1) as total_mining_rewards
    `, [userId]);

    const stats = statsResult.rows[0];

    // Get recent activity
    const activityResult = await query(`
      (SELECT 'points' as type, created_at, points_earned as amount, description
       FROM points_history WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'task' as type, completed_at as created_at, points_awarded as amount, 
              CONCAT('Task: ', (SELECT title FROM tasks WHERE id = task_id)) as description
       FROM task_completions WHERE user_id = $1 AND completed_at IS NOT NULL
       ORDER BY completed_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'mining' as type, claimed_at as created_at, amount_claimed as amount,
              CONCAT('Mining claim: ', claim_type) as description
       FROM mining_claims WHERE user_id = $1
       ORDER BY claimed_at DESC LIMIT 5)
      ORDER BY created_at DESC LIMIT 10
    `, [userId]);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        user_type: user.user_type,
        total_points: user.total_points,
        sabi_cash_balance: parseFloat(user.sabi_cash_balance),
        wallet_address: user.wallet_address,
        is_active: user.is_active,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
        driver_status: user.driver_status,
        license_number: user.license_number,
        vehicle_info: user.vehicle_info
      },
      statistics: {
        total_point_transactions: parseInt(stats.total_point_transactions),
        total_task_completions: parseInt(stats.total_task_completions),
        total_mining_stakes: parseInt(stats.total_mining_stakes),
        total_web3_transactions: parseInt(stats.total_web3_transactions),
        total_mining_rewards: parseFloat(stats.total_mining_rewards)
      },
      recent_activity: activityResult.rows
    });
  } catch (error) {
    console.error('Admin user details error:', error);
    res.status(500).json({
      success: false,
      error: 'ADMIN_USER_DETAILS_FAILED',
      message: 'Failed to fetch user details'
    });
  }
});

// Update user status (admin)
router.put('/users/:userId/status', requireAdmin, adminLimiter, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, isVerified, userType } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    if (isVerified !== undefined) {
      updates.push(`is_verified = $${paramIndex}`);
      params.push(isVerified);
      paramIndex++;
    }

    if (userType !== undefined) {
      updates.push(`user_type = $${paramIndex}`);
      params.push(userType);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'NO_UPDATES',
        message: 'No valid updates provided'
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, is_active, is_verified, user_type`,
      params
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Admin user status update error:', error);
    res.status(500).json({
      success: false,
      error: 'ADMIN_USER_STATUS_UPDATE_FAILED',
      message: 'Failed to update user status'
    });
  }
});

// Send reward to user (admin)
router.post('/users/:userId/reward', requireAdmin, adminLimiter, validateAdminReward, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, type, reason } = req.body;

    // Begin transaction
    await query('BEGIN');

    try {
      // Check if user exists
      const userResult = await query(
        'SELECT id, total_points, sabi_cash_balance FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );

      if (userResult.rowCount === 0) {
        await query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      let newBalance;

      if (type === 'points') {
        // Update points
        const updateResult = await query(
          'UPDATE users SET total_points = total_points + $1, updated_at = NOW() WHERE id = $2 RETURNING total_points',
          [amount, userId]
        );
        newBalance = updateResult.rows[0].total_points;

        // Record points history
        await query(
          `INSERT INTO points_history (user_id, points_earned, points_type, description, metadata)
           VALUES ($1, $2, 'admin_reward', $3, $4)`,
          [userId, amount, reason, { admin_id: req.user.id, admin_username: req.user.username }]
        );
      } else if (type === 'sabi_cash') {
        // Update Sabi Cash
        const updateResult = await query(
          'UPDATE users SET sabi_cash_balance = sabi_cash_balance + $1, updated_at = NOW() WHERE id = $2 RETURNING sabi_cash_balance',
          [amount, userId]
        );
        newBalance = parseFloat(updateResult.rows[0].sabi_cash_balance);
      }

      await query('COMMIT');

      res.json({
        success: true,
        reward_sent: true,
        user_id: userId,
        amount,
        type,
        reason,
        new_balance: type === 'points' ? newBalance : parseFloat(newBalance),
        message: `Successfully sent ${amount} ${type} to user`
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Admin send reward error:', error);
    res.status(500).json({
      success: false,
      error: 'ADMIN_SEND_REWARD_FAILED',
      message: 'Failed to send reward'
    });
  }
});

// Get all transactions (admin)
router.get('/transactions', requireAdmin, generalLimiter, validatePagination, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status;
    const type = req.query.type;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (status) {
      whereClause += ` AND wt.status = $${params.length + 1}`;
      params.push(status);
    }

    if (type) {
      whereClause += ` AND wt.transaction_type = $${params.length + 1}`;
      params.push(type);
    }

    const result = await query(
      `SELECT wt.*, u.username, u.email
       FROM web3_transactions wt
       LEFT JOIN users u ON wt.user_id = u.id
       ${whereClause}
       ORDER BY wt.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM web3_transactions wt ${whereClause}`,
      params
    );

    res.json({
      success: true,
      count: parseInt(countResult.rows[0].total),
      results: result.rows.map(tx => ({
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
        status: tx.status,
        confirmations: tx.confirmations,
        created_at: tx.created_at,
        confirmed_at: tx.confirmed_at,
        user: tx.user_id ? {
          id: tx.user_id,
          username: tx.username,
          email: tx.email
        } : null
      }))
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'ADMIN_TRANSACTIONS_FAILED',
      message: 'Failed to fetch transactions'
    });
  }
});

// System configuration endpoints
router.get('/config', requireAdmin, generalLimiter, async (req, res) => {
  try {
    const config = {
      mining: {
        free_rate: parseFloat(process.env.MINING_FREE_RATE || 0.9),
        basic_deposit: parseFloat(process.env.MINING_BASIC_DEPOSIT || 100),
        basic_rate: parseFloat(process.env.MINING_BASIC_RATE || 15),
        premium_deposit: parseFloat(process.env.MINING_PREMIUM_DEPOSIT || 1000),
        premium_rate: parseFloat(process.env.MINING_PREMIUM_RATE || 170)
      },
      points: {
        conversion_rate: parseFloat(process.env.POINTS_TO_SABI_RATE || 0.5),
        min_conversion: parseInt(process.env.MIN_POINTS_CONVERSION || 500)
      },
      system: {
        jwt_expires_in: process.env.JWT_EXPIRES_IN || '24h',
        jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      }
    };

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Admin config error:', error);
    res.status(500).json({
      success: false,
      error: 'ADMIN_CONFIG_FAILED',
      message: 'Failed to fetch system configuration'
    });
  }
});