import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';

export function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  
  return { accessToken, refreshToken };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error('Invalid token');
  }
}

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    // console.log('Auth Debug:', { token_payload: decoded });
    
    // Get user from database to ensure they still exist and are active
    const userResult = await query(
      'SELECT id, email, username, user_type, wallet_address, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rowCount === 0) {
       console.log('Auth Debug: User not found for ID', decoded.userId);
       return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'User not found or inactive' });
    }
    if (!userResult.rows[0].is_active) {
       console.log('Auth Debug: User inactive', userResult.rows[0].email);
       return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'User not found or inactive' });
    }
    
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: error.message });
  }
}

export async function requireDriver(req, res, next) {
  if (req.user.user_type !== 'driver') {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Driver access required' });
  }
  next();
}

export async function requirePassenger(req, res, next) {
  if (req.user.user_type !== 'passenger') {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Passenger access required' });
  }
  next();
}

export async function requireAdmin(req, res, next) {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Admin access required' });
  }
  next();
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      const userResult = await query(
        'SELECT id, email, username, user_type, wallet_address, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (userResult.rowCount > 0 && userResult.rows[0].is_active) {
        req.user = userResult.rows[0];
      }
    }
    next();
  } catch {
    // Continue without authentication for optional auth
    next();
  }
}