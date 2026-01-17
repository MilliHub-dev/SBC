import { Router } from 'express';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/pool.js';
import { generateTokens, verifyToken, requireAuth } from '../middleware/auth.js';
import { validateLogin, validateWalletUpdate } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';

export const router = Router();

// Proxy Login to Sabi Ride (Bypasses Frontend CORS/Proxy issues)
router.post('/proxy-login', authLimiter, async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    console.log(`Proxy login attempt for: ${email} (${userType})`);
    
    const apiUrl = process.env.SABI_RIDE_API_URL || 'https://tmp.sabirideweb.com.ng/api/v1';
    let loginUrl;
    
    if (userType === 'driver' || userType === 'sabi-rider') {
      loginUrl = `${apiUrl}/users/login/sabi-rider`;
    } else {
      loginUrl = `${apiUrl}/users/login/sabi-passenger`;
    }

    console.log(`Forwarding login to: ${loginUrl}`);

    try {
      const response = await axios.post(loginUrl, { email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('External API response status:', response.status);
      return res.json(response.data);
    } catch (apiError) {
      console.error('External API Error:', apiError.message);
      if (apiError.response) {
        console.error('External API Response Data:', apiError.response.data);
        return res.status(apiError.response.status).json(apiError.response.data);
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Proxy Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Proxy Error',
      error: error.message
    });
  }
});

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
    const { sabiRideToken, walletAddress, userType } = req.body;

    if (!sabiRideToken) {
      return res.status(400).json({
        success: false,
        error: 'SABI_RIDE_TOKEN_REQUIRED',
        message: 'Sabi Ride authentication token is required'
      });
    }

    // Verify with Sabi Ride API
    let sabiRideUserData;
    try {
      const apiUrl = process.env.SABI_RIDE_API_URL || 'https://tmp.sabirideweb.com.ng/api/v1';
      
      // Determine verification endpoint based on user type
      // Default to passenger if not specified, but try to handle both if needed
      let verifyUrl;
      if (userType === 'driver' || userType === 'sabi-rider') {
        verifyUrl = `${apiUrl}/users/me/sabi-rider`;
      } else {
        verifyUrl = `${apiUrl}/users/me/sabi-passenger`;
      }

      const response = await axios.get(verifyUrl, {
        headers: { 
          Authorization: `Bearer ${sabiRideToken}`,
          'Accept': 'application/json'
        }
      });
      
      // Assume API returns { success: true, data: { ...user } } or just the user object
      // Adjusting to handle likely response structures
      const apiResponse = response.data;
      
      // Handle nested user object structure
      // Support: { data: { user: { ... } } }, { data: { ... } }, { user: { ... } }
      let remoteUser = apiResponse;
      if (remoteUser.data) remoteUser = remoteUser.data;
      if (remoteUser.user) remoteUser = remoteUser.user;

      // Helper to map user type
      const mapUserType = (type, fallback) => {
        if (!type && fallback) return fallback;
        if (!type) return 'passenger';
        const t = String(type).toLowerCase();
        if (t.includes('driver') || t.includes('rider')) return 'driver';
        if (t.includes('admin')) return 'admin';
        return 'passenger';
      };

      // Helper to generate unique username
      const generateUsername = (username, email) => {
        if (username) return username;
        const prefix = email.split('@')[0];
        // Append 4 random chars to ensure uniqueness if falling back to email
        const suffix = Math.random().toString(36).substring(2, 6);
        return `${prefix}_${suffix}`;
      };

      sabiRideUserData = {
        id: remoteUser.id || remoteUser._id,
        email: remoteUser.email,
        username: generateUsername(remoteUser.username, remoteUser.email),
        first_name: remoteUser.first_name || remoteUser.firstName || 'Sabi',
        last_name: remoteUser.last_name || remoteUser.lastName || 'User',
        user_type: mapUserType(remoteUser.user_type || remoteUser.role, userType),
        total_points: remoteUser.total_points || remoteUser.points || 0,
        is_verified: remoteUser.is_verified || remoteUser.isVerified || false
      };

    } catch (error) {
      console.error('Sabi Ride API verification failed:', error.message);
      return res.status(401).json({
        success: false,
        error: 'INVALID_SABI_RIDE_TOKEN',
        message: 'Invalid Sabi Ride token or API error'
      });
    }

    // Check if user exists in our system
    let userResult = await query(
      'SELECT id, email, username, first_name, last_name, user_type, wallet_address, total_points, sabi_cash_balance, is_active, is_verified, driver_status FROM users WHERE email = $1',
      [sabiRideUserData.email]
    );

    let user;
    if (userResult.rowCount === 0) {
      console.log(`Creating new user for email: ${sabiRideUserData.email}`);
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
      console.log(`Updating existing user: ${sabiRideUserData.email}`);
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
      console.warn(`Login blocked: Account disabled for ${user.email}`);
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

    console.log(`Login successful for user: ${user.email} (${user.id})`);

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
  } catch {
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
  } catch {
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