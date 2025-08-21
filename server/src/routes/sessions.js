import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';

export const router = Router();

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Create or update a session (no PII)
router.post('/', async (req, res) => {
  try {
    const { externalUserId, walletAddress, sessionToken, refreshToken, expiresAt, ip, userAgent } = req.body;

    if (!sessionToken || (!externalUserId && !walletAddress)) {
      return res.status(400).json({ success: false, error: 'INVALID_INPUT' });
    }

    const sessionTokenHash = hashToken(sessionToken);
    const refreshTokenHash = refreshToken ? hashToken(refreshToken) : null;

    const result = await query(
      `INSERT INTO sessions (external_user_id, wallet_address, session_token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, external_user_id as "externalUserId", wallet_address as "walletAddress", expires_at as "expiresAt", created_at as "createdAt"`,
      [externalUserId || null, walletAddress || null, sessionTokenHash, refreshTokenHash, ip || null, userAgent || null, expiresAt]
    );

    res.json({ success: true, session: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SESSION_CREATE_FAILED', details: err.message });
  }
});

// Touch session last_accessed
router.post('/touch', async (req, res) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken) return res.status(400).json({ success: false, error: 'INVALID_INPUT' });
    const sessionTokenHash = hashToken(sessionToken);
    await query('UPDATE sessions SET last_accessed = NOW() WHERE session_token_hash = $1', [sessionTokenHash]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SESSION_TOUCH_FAILED', details: err.message });
  }
});

// Revoke session
router.delete('/', async (req, res) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken) return res.status(400).json({ success: false, error: 'INVALID_INPUT' });
    const sessionTokenHash = hashToken(sessionToken);
    await query('DELETE FROM sessions WHERE session_token_hash = $1', [sessionTokenHash]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SESSION_DELETE_FAILED', details: err.message });
  }
});


