import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/pool.js';
import { generateTokens, verifyToken, requireAuth } from '../middleware/auth.js';
import { validateLogin, validateRegister, validateWalletUpdate } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';

export const router = Router();

// Register new user
router.post('/register', authLimiter, validateRegister, async (req, res) => {
  try {
    const { email, password, username, firstName, lastName, userType, walletAddress, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create user
    const result = await query(
      `INSERT INTO users (id, email, password_hash, username, first_name, last_name, phone_number, user_type, wallet_address, total_points, sabi_cash_balance, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0, true, false)
       RETURNING id, email, username, first_name, last_name, user_type, wallet_address, total_points, sabi_cash_balance, is_verified, created_at`,
      [userId, email, passwordHash, username, firstName || null, lastName || null, phoneNumber || null, userType, walletAddress || null]
    );

    const user = result.rows[0];
    const { accessToken, refreshToken } = generateTokens({ userId: user.id, email: user.email, userType: user.user_type });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        wallet_address: user.wallet_address,
        is_verified: user.is_verified
      },
      points: user.total_points,
      sabi_cash_balance: parseFloat(user.sabi_cash_balance)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Failed to register user'
    });
  }
});

// Login user (compatible with Sabi Ride)
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    // Get user by email
    const userResult = await query(
      'SELECT id, email, password_hash, username, first_name, last_name, user_type, wallet_address, total_points, sabi_cash_balance, is_active, is_verified, driver_status FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'ACCOUNT_DISABLED',
        message: 'Account has been disabled'
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Update wallet address if provided
    if (walletAddress && walletAddress !== user.wallet_address) {
      await query('UPDATE users SET wallet_address = $1 WHERE id = $2', [walletAddress, user.id]);
      user.wallet_address = walletAddress;
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      userType: user.user_type
    });

    res.json({
      success: true,
      token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        wallet_address: user.wallet_address,
        is_verified: user.is_verified,
        driver_status: user.driver_status
      },
      points: user.total_points,
      sabi_cash_balance: parseFloat(user.sabi_cash_balance)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'Login failed'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token is required'
      });
    }

    const decoded = verifyToken(refresh_token);
    
    // Get user to ensure they still exist
    const userResult = await query(
      'SELECT id, email, user_type, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rowCount === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token'
      });
    }

    const user = userResult.rows[0];
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      userType: user.user_type
    });

    res.json({
      success: true,
      token: accessToken,
      refresh_token: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token'
    });
  }
});

// Logout
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // In a production environment, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'LOGOUT_FAILED',
      message: 'Logout failed'
    });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT id, email, username, first_name, last_name, phone_number, user_type, 
              wallet_address, total_points, sabi_cash_balance, is_verified, 
              created_at, last_login, driver_status
       FROM users WHERE id = $1`,
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
        wallet_address: user.wallet_address,
        total_points: user.total_points,
        sabi_cash_balance: parseFloat(user.sabi_cash_balance),
        is_verified: user.is_verified,
        created_at: user.created_at,
        last_login: user.last_login,
        driver_status: user.driver_status
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'PROFILE_FETCH_FAILED',
      message: 'Failed to fetch user profile'
    });
  }
});

// Update wallet address
router.put('/wallet', requireAuth, validateWalletUpdate, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Check if wallet address is already taken
    const existingWallet = await query(
      'SELECT id FROM users WHERE wallet_address = $1 AND id != $2',
      [walletAddress, req.user.id]
    );

    if (existingWallet.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'WALLET_EXISTS',
        message: 'Wallet address is already associated with another account'
      });
    }

    // Update wallet address
    await query(
      'UPDATE users SET wallet_address = $1, updated_at = NOW() WHERE id = $2',
      [walletAddress, req.user.id]
    );

    res.json({
      success: true,
      message: 'Wallet address updated successfully',
      wallet_address: walletAddress
    });
  } catch (error) {
    console.error('Wallet update error:', error);
    res.status(500).json({
      success: false,
      error: 'WALLET_UPDATE_FAILED',
      message: 'Failed to update wallet address'
    });
  }
});