import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAdmin } from '../middleware/admin.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateTaskCreation, validateTaskCompletion, validateUUIDParam, validatePagination } from '../middleware/validation.js';
import { taskLimiter, generalLimiter, adminLimiter } from '../middleware/rateLimit.js';

export const router = Router();

// List active tasks
router.get('/', optionalAuth, generalLimiter, validatePagination, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const category = req.query.category;
    const activeOnly = req.query.active_only !== 'false';

    let whereClause = activeOnly ? 'WHERE t.is_active = TRUE' : '';
    const filterParams = [];

    if (category) {
      whereClause += (whereClause ? ' AND' : 'WHERE') + ' t.category = $' + (filterParams.length + 1);
      filterParams.push(category);
    }

    // Get user completion status if authenticated
    let userCompletionJoin = '';
    let userCompletionSelect = ', FALSE as user_completed';
    
    if (req.user) {
      userCompletionJoin = `LEFT JOIN task_completions tc ON t.id = tc.task_id AND tc.user_id = $${filterParams.length + 1}`;
      userCompletionSelect = ', CASE WHEN tc.id IS NOT NULL THEN TRUE ELSE FALSE END as user_completed';
    }

    const listParams = req.user ? [...filterParams, req.user.id] : [...filterParams];

    const result = await query(
      `SELECT t.id, t.title, t.description, t.task_type as "taskType", 
              t.category, t.reward_points as "rewardPoints", t.reward_sabi_cash as "rewardSabiCash", 
              t.max_completions as "maxCompletions", t.completion_count as "completionCount", 
              t.verification_method as "verificationMethod", t.external_url as "externalUrl", 
              t.is_active as "isActive", t.task_data as "taskData", t.created_at as "createdAt"
              ${userCompletionSelect}
       FROM tasks t
       ${userCompletionJoin}
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${listParams.length + 1} OFFSET $${listParams.length + 2}`,
      [...listParams, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM tasks t ${whereClause}`,
      filterParams
    );

    res.json({ 
      success: true, 
      count: parseInt(countResult.rows[0].total),
      results: result.rows 
    });


  } catch (err) {
    console.error('Task list error details:', err.message, err.stack);
    console.error('Task list query params:', req.query);
    console.error('Task list user:', req.user);
    res.status(500).json({ success: false, error: 'TASK_LIST_FAILED', message: 'Failed to fetch tasks: ' + err.message });
  }
});

// Update task (admin)
router.put('/:taskId', requireAdmin, adminLimiter, validateUUIDParam('taskId'), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, taskType, category, rewardPoints, rewardSabiCash, maxCompletions, verificationMethod, externalUrl, isActive, taskData } = req.body;

    const result = await query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           task_type = COALESCE($3, task_type),
           category = COALESCE($4, category),
           reward_points = COALESCE($5, reward_points),
           reward_sabi_cash = COALESCE($6, reward_sabi_cash),
           max_completions = COALESCE($7, max_completions),
           verification_method = COALESCE($8, verification_method),
           external_url = COALESCE($9, external_url),
           is_active = COALESCE($10, is_active),
           task_data = COALESCE($11, task_data),
           updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [title, description, taskType, category, rewardPoints, rewardSabiCash, maxCompletions, verificationMethod, externalUrl, isActive, taskData, taskId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'TASK_NOT_FOUND', message: 'Task not found' });
    }

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error('Task update error:', err);
    res.status(500).json({ success: false, error: 'TASK_UPDATE_FAILED', message: 'Failed to update task' });
  }
});

// Delete task (admin)
router.delete('/:taskId', requireAdmin, adminLimiter, validateUUIDParam('taskId'), async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task has completions
    const completions = await query('SELECT count(*) FROM task_completions WHERE task_id = $1', [taskId]);
    if (parseInt(completions.rows[0].count) > 0) {
        // Soft delete if it has completions
        const result = await query(
            'UPDATE tasks SET is_active = FALSE WHERE id = $1 RETURNING id',
            [taskId]
        );
         if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'TASK_NOT_FOUND', message: 'Task not found' });
         }
         return res.json({ success: true, message: 'Task soft deleted due to existing completions' });
    }

    // Hard delete if no completions
    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [taskId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'TASK_NOT_FOUND', message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Task deletion error:', err);
    res.status(500).json({ success: false, error: 'TASK_DELETE_FAILED', message: 'Failed to delete task' });
  }
});

// Create task (admin)
router.post('/', requireAdmin, adminLimiter, validateTaskCreation, async (req, res) => {
  try {
    const { title, description, taskType, category, rewardPoints, rewardSabiCash, maxCompletions, verificationMethod, externalUrl, isActive, taskData, expiresAt } = req.body;
    
    const result = await query(
      `INSERT INTO tasks (title, description, task_type, category, reward_points, reward_sabi_cash, max_completions, verification_method, external_url, is_active, task_data, expires_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, title, description, task_type as "taskType", category, reward_points as "rewardPoints", reward_sabi_cash as "rewardSabiCash", max_completions as "maxCompletions", verification_method as "verificationMethod", external_url as "externalUrl", is_active as "isActive", created_at as "createdAt", expires_at as "expiresAt"`,
      [title, description || null, taskType, category || null, rewardPoints || 0, rewardSabiCash || 0, maxCompletions || null, verificationMethod || 'manual', externalUrl || null, isActive ?? true, taskData || null, expiresAt || null, req.user.id]
    );
    
    res.status(201).json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error('Task creation error:', err);
    res.status(500).json({ success: false, error: 'TASK_CREATE_FAILED', message: 'Failed to create task' });
  }
});

// Submit completion (user)
router.post('/:taskId/complete', requireAuth, taskLimiter, validateUUIDParam('taskId'), validateTaskCompletion, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { verificationData } = req.body;

    // Begin transaction
    await query('BEGIN');

    try {
      // Get task details
      const taskRes = await query(
        'SELECT id, title, reward_points, reward_sabi_cash, is_active, max_completions, completion_count, expires_at FROM tasks WHERE id = $1',
        [taskId]
      );

      if (taskRes.rowCount === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'TASK_NOT_FOUND', message: 'Task not found' });
      }

      const task = taskRes.rows[0];

      if (!task.is_active) {
        await query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'TASK_INACTIVE', message: 'Task is not active' });
      }

      if (task.max_completions && task.completion_count >= task.max_completions) {
        await query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'TASK_LIMIT_REACHED', message: 'Task completion limit reached' });
      }

      // Check if user already completed this task
      const existingCompletion = await query(
        'SELECT id, status FROM task_completions WHERE user_id = $1 AND task_id = $2',
        [req.user.id, taskId]
      );

      if (existingCompletion.rowCount > 0) {
        await query('ROLLBACK');
        return res.status(409).json({ 
          success: false, 
          error: 'TASK_ALREADY_COMPLETED', 
          message: 'Task already submitted',
          status: existingCompletion.rows[0].status
        });
      }

      // Create task completion
      const completeRes = await query(
        `INSERT INTO task_completions (user_id, task_id, status, verification_data)
         VALUES ($1, $2, 'pending', $3)
         RETURNING id, status, completed_at as "completedAt"`,
        [req.user.id, taskId, verificationData || null]
      );

      // Update task completion count
      await query(
        'UPDATE tasks SET completion_count = completion_count + 1 WHERE id = $1',
        [taskId]
      );

      await query('COMMIT');

      res.status(201).json({ 
        success: true, 
        task_id: taskId,
        completion: completeRes.rows[0],
        status: 'pending',
        points_awarded: 0,
        sabi_cash_awarded: 0.0,
        message: 'Task submitted for verification'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('Task completion error:', err);
    res.status(500).json({ success: false, error: 'TASK_COMPLETE_FAILED', message: 'Failed to complete task' });
  }
});

// Verify completion (admin)
router.post('/:taskId/verify', requireAdmin, adminLimiter, validateUUIDParam('taskId'), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completionId, approve, pointsAwarded, sabiCashAwarded, adminNotes } = req.body;
    
    if (!completionId) {
      return res.status(400).json({ success: false, error: 'INVALID_INPUT', message: 'Completion ID required' });
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // Get completion details
      const completionResult = await query(
        `SELECT tc.id, tc.user_id, tc.status, t.reward_points, t.reward_sabi_cash, t.title
         FROM task_completions tc
         JOIN tasks t ON tc.task_id = t.id
         WHERE tc.id = $1 AND tc.task_id = $2 FOR UPDATE`,
        [completionId, taskId]
      );

      if (completionResult.rowCount === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'COMPLETION_NOT_FOUND', message: 'Task completion not found' });
      }

      const completion = completionResult.rows[0];

      if (completion.status !== 'pending') {
        await query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'ALREADY_VERIFIED', message: 'Task completion already verified' });
      }

      const status = approve ? 'verified' : 'rejected';
      const finalPointsAwarded = approve ? (pointsAwarded || completion.reward_points) : 0;
      const finalSabiCashAwarded = approve ? (sabiCashAwarded || completion.reward_sabi_cash) : 0;

      // Update completion status
      const result = await query(
        `UPDATE task_completions
         SET status = $1, points_awarded = $2, sabi_cash_awarded = $3, admin_notes = $4, verified_at = NOW(), verified_by = $5
         WHERE id = $6
         RETURNING id, status, points_awarded as "pointsAwarded", sabi_cash_awarded as "sabiCashAwarded", verified_at as "verifiedAt"`,
        [status, finalPointsAwarded, finalSabiCashAwarded, adminNotes || null, req.user.id, completionId]
      );

      // If approved, award points and sabi cash
      if (approve && (finalPointsAwarded > 0 || finalSabiCashAwarded > 0)) {
        // Update user balances
        await query(
          'UPDATE users SET total_points = total_points + $1, sabi_cash_balance = sabi_cash_balance + $2 WHERE id = $3',
          [finalPointsAwarded, finalSabiCashAwarded, completion.user_id]
        );

        // Record points history
        if (finalPointsAwarded > 0) {
          await query(
            `INSERT INTO points_history (user_id, points_earned, points_type, description, task_id, metadata)
             VALUES ($1, $2, 'task', $3, $4, $5)`,
            [completion.user_id, finalPointsAwarded, `Task completed: ${completion.title}`, taskId, { admin_verified: true, admin_notes: adminNotes }]
          );
        }
      }

      await query('COMMIT');

      res.json({ 
        success: true, 
        completion: result.rows[0],
        message: approve ? 'Task completion approved' : 'Task completion rejected'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('Task verification error:', err);
    res.status(500).json({ success: false, error: 'TASK_VERIFY_FAILED', message: 'Failed to verify task completion' });
  }
});

// Get user's task completions
router.get('/user', requireAuth, generalLimiter, validatePagination, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status;

    let whereClause = 'WHERE tc.user_id = $1';
    let params = [req.user.id];

    if (status) {
      whereClause += ' AND tc.status = $2';
      params.push(status);
    }

    const result = await query(
      `SELECT tc.id, tc.task_id, tc.status, tc.points_awarded, tc.sabi_cash_awarded,
              tc.completed_at, tc.verified_at, tc.admin_notes,
              t.title as task_title, t.description as task_description, t.reward_points, t.reward_sabi_cash
       FROM task_completions tc
       JOIN tasks t ON tc.task_id = t.id
       ${whereClause}
       ORDER BY tc.completed_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Get summary stats
    const statsResult = await query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'verified') as completed_tasks,
         COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
         COUNT(*) FILTER (WHERE status = 'rejected') as rejected_tasks,
         COALESCE(SUM(points_awarded), 0) as total_task_points,
         COALESCE(SUM(sabi_cash_awarded), 0) as total_task_sabi_cash
       FROM task_completions WHERE user_id = $1`,
      [req.user.id]
    );

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      results: result.rows.map(row => ({
        id: row.id,
        task_id: row.task_id,
        task_title: row.task_title,
        task_description: row.task_description,
        status: row.status,
        points_awarded: row.points_awarded,
        sabi_cash_awarded: parseFloat(row.sabi_cash_awarded || 0),
        reward_points: row.reward_points,
        reward_sabi_cash: parseFloat(row.reward_sabi_cash || 0),
        completed_at: row.completed_at,
        verified_at: row.verified_at,
        admin_notes: row.admin_notes
      })),
      summary: {
        completed_tasks: parseInt(stats.completed_tasks),
        pending_tasks: parseInt(stats.pending_tasks),
        rejected_tasks: parseInt(stats.rejected_tasks),
        total_task_rewards: {
          points: parseInt(stats.total_task_points),
          sabi_cash: parseFloat(stats.total_task_sabi_cash)
        }
      }
    });
  } catch (error) {
    console.error('User tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'USER_TASKS_FAILED',
      message: 'Failed to fetch user tasks'
    });
  }
});

// Get pending task completions (admin)
router.get('/pending', requireAdmin, generalLimiter, validatePagination, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT tc.id, tc.task_id, tc.user_id, tc.verification_data, tc.completed_at,
              t.title as task_title, t.description as task_description, t.reward_points, t.reward_sabi_cash,
              u.username, u.email
       FROM task_completions tc
       JOIN tasks t ON tc.task_id = t.id
       JOIN users u ON tc.user_id = u.id
       WHERE tc.status = 'pending'
       ORDER BY tc.completed_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM task_completions WHERE status = $1',
      ['pending']
    );

    res.json({
      success: true,
      count: parseInt(countResult.rows[0].total),
      results: result.rows.map(row => ({
        completion_id: row.id,
        task_id: row.task_id,
        user_id: row.user_id,
        username: row.username,
        email: row.email,
        task_title: row.task_title,
        task_description: row.task_description,
        reward_points: row.reward_points,
        reward_sabi_cash: parseFloat(row.reward_sabi_cash || 0),
        verification_data: row.verification_data,
        completed_at: row.completed_at
      }))
    });
  } catch (error) {
    console.error('Pending tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'PENDING_TASKS_FAILED',
      message: 'Failed to fetch pending tasks'
    });
  }
});


