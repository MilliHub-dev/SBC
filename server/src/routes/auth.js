import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/pool.js';
import { generateTokens, verifyToken, requireAuth } from '../middleware/auth.js';
import { validateLogin, validateRegister, validateWalletUpdate } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';

export const router = Router();

// Registration disabled - users must exist in Sabi Ride system
router.post('/register', (req, res) => {
  res.status(403).json({
    success: false,
    error: 'REGISTRATION_DISABLED',
    message: 'Registration is disabled. Please use your existing Sabi Ride account to login.'
  });
});

// Login with Sabi Ride token (primary method)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { sabiRideToken, walletAddress } = req.body;

    if (!sabiRideToken) {
      return res.status(400).json({
        success: false,
        error: 'SABI_RIDE_TOKEN_REQUIRED',
        message: 'Sabi Ride authentication token is required'
      });
    }

    // Here you would verify the Sabi Ride token with their API
    // For now, we'll simulate this - replace with actual Sabi Ride API call
    let sabiRideUserData;
    try {
      // TODO: Replace with actual Sabi Ride API call
      // const response = await fetch(`${process.env.SABI_RIDE_API_URL}/auth/verify`, {
      //   headers: { Authorization: `Bearer ${sabiRideToken}` }
      // });
      // sabiRideUserData = await response.json();
      
      // Simulated response for development
      sabiRideUserData = {
        id: 'sabi_user_123',
        email: 'user@sabiride.com',
        username: 'sabiuser',
        first_name: 'John',
        last_name: 'Doe',
        user_type: 'passenger', // or 'driver'
        total_points: 1500,
        is_verified: true
      };
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_SABI_RIDE_TOKEN',
        message: 'Invalid Sabi Ride token'
      });
    }

    // Check if user exists in our system
    let userResult = await query(
      'SELECT id, email, username, first_name, last_name, user_type, wallet_address, total_points, sabi_cash_balance, is_active, is_verified, driver_status FROM users WHERE email = $1',
      [sabiRideUserData.email]
    );

    let user;
    if (userResult.rowCount === 0) {
      // Create new user from Sabi Ride data
      const userId = uuidv4();
      const insertResult = await query(
        `INSERT INTO users (id, email, username, first_name, last_name, user_type, wallet_address, total_points, sabi_cash_balance, is_active, is_verified, external_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, true, $9, $10)
         RETURNING id, email, username, first_name, last_name, user_type, wallet_address, total_points, sabi_cash_balance, is_active, is_verified, driver_status`,
        [
          userId, 
          sabiRideUserData.email, 
          sabiRideUserData.username, 
          sabiRideUserData.first_name, 
          sabiRideUserData.last_name, 
          sabiRideUserData.user_type, 
          walletAddress || null, 
          sabiRideUserData.total_points || 0, 
          sabiRideUserData.is_verified || false, 
          sabiRideUserData.id
        ]
      );
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
      
      // Update user data from Sabi Ride (sync points, verification status, etc.)
      await query(
        `UPDATE users SET 
           total_points = $1, 
           is_verified = $2, 
           wallet_address = COALESCE($3, wallet_address),
           last_login = NOW(),
           updated_at = NOW()
         WHERE id = $4`,
        [sabiRideUserData.total_points || user.total_points, sabiRideUserData.is_verified, walletAddress, user.id]
      );
      
      // Update local user object
      user.total_points = sabiRideUserData.total_points || user.total_points;
      user.is_verified = sabiRideUserData.is_verified;
      if (walletAddress) user.wallet_address = walletAddress;
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'ACCOUNT_DISABLED',
        message: 'Account has been disabled'
      });
    }

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

// Legacy login with email/password (for testing only)
router.post('/login-legacy', authLimiter, validateLogin, async (req, res) => {
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
    console.error('Legacy login error:', error);
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