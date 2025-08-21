import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAdmin } from '../middleware/admin.js';

export const router = Router();

// List active tasks
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT id, slug, title, description, task_type as "taskType", category, reward_points as "rewardPoints", reward_sabi_cash as "rewardSabiCash", max_completions as "maxCompletions", completion_count as "completionCount", verification_method as "verificationMethod", external_url as "externalUrl", is_active as "isActive", created_at as "createdAt" FROM tasks WHERE is_active = TRUE ORDER BY created_at DESC');
    res.json({ success: true, results: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'TASK_LIST_FAILED', details: err.message });
  }
});

// Create task (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { slug, title, description, taskType, category, rewardPoints, rewardSabiCash, maxCompletions, verificationMethod, externalUrl, isActive, taskData } = req.body;
    const result = await query(
      `INSERT INTO tasks (slug, title, description, task_type, category, reward_points, reward_sabi_cash, max_completions, verification_method, external_url, is_active, task_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id, slug, title, description, task_type as "taskType", category, reward_points as "rewardPoints", reward_sabi_cash as "rewardSabiCash", max_completions as "maxCompletions", verification_method as "verificationMethod", external_url as "externalUrl", is_active as "isActive", created_at as "createdAt"`,
      [slug, title, description || null, taskType, category || null, rewardPoints || 0, rewardSabiCash || 0, maxCompletions || null, verificationMethod || 'manual', externalUrl || null, isActive ?? true, taskData || null]
    );
    res.status(201).json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'TASK_CREATE_FAILED', details: err.message });
  }
});

// Submit completion (user)
router.post('/:taskId/complete', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { externalUserId, walletAddress, verificationData } = req.body;
    if (!externalUserId && !walletAddress) return res.status(400).json({ success: false, error: 'INVALID_INPUT' });

    const taskRes = await query('SELECT id, is_active as "isActive" FROM tasks WHERE id = $1', [taskId]);
    if (taskRes.rowCount === 0 || !taskRes.rows[0].isActive) return res.status(404).json({ success: false, error: 'TASK_NOT_FOUND' });

    const completeRes = await query(
      `INSERT INTO task_completions (external_user_id, wallet_address, task_id, status, verification_data)
       VALUES ($1,$2,$3,'pending',$4)
       ON CONFLICT (external_user_id, wallet_address, task_id) DO NOTHING
       RETURNING id, status, completed_at as "completedAt"`,
      [externalUserId || '', walletAddress || '', taskId, verificationData || null]
    );

    if (completeRes.rowCount === 0) {
      return res.status(200).json({ success: true, message: 'ALREADY_SUBMITTED' });
    }

    res.status(201).json({ success: true, completion: completeRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'TASK_COMPLETE_FAILED', details: err.message });
  }
});

// Verify completion (admin)
router.post('/:taskId/verify', requireAdmin, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completionId, approve, pointsAwarded, sabiCashAwarded, adminNotes } = req.body;
    if (!completionId) return res.status(400).json({ success: false, error: 'INVALID_INPUT' });

    const status = approve ? 'verified' : 'rejected';
    const result = await query(
      `UPDATE task_completions
       SET status = $1, points_awarded = $2, sabi_cash_awarded = $3, admin_notes = $4, verified_at = NOW()
       WHERE id = $5 AND task_id = $6
       RETURNING id, status, points_awarded as "pointsAwarded", sabi_cash_awarded as "sabiCashAwarded", verified_at as "verifiedAt"`,
      [status, pointsAwarded || 0, sabiCashAwarded || 0, adminNotes || null, completionId, taskId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'COMPLETION_NOT_FOUND' });
    res.json({ success: true, completion: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'TASK_VERIFY_FAILED', details: err.message });
  }
});


