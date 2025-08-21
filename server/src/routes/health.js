import { Router } from 'express';
import { query } from '../db/pool.js';

export const router = Router();

router.get('/', async (req, res) => {
  try {
    const dbOk = await query('SELECT 1 as ok');
    res.json({ success: true, status: 'ok', db: dbOk.rows[0].ok });
  } catch (err) {
    res.status(500).json({ success: false, error: 'HEALTH_CHECK_FAILED', details: err.message });
  }
});


