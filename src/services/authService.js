import { authAPI, sabiRideAPI } from '../config/apiConfig.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.sabiRideToken = null;
    this.sabiCashToken = null;
  }

  // Step 1: Login to Sabi Ride first
  async loginToSabiRide(email, password, userType = 'passenger') {
    try {
      const credentials = { email, password };
      
      let response;
      if (userType === 'driver') {
        response = await sabiRideAPI.loginDriver(credentials);
      } else {
        response = await sabiRideAPI.loginPassenger(credentials);
      }

      if (response.success && response.token) {
        this.sabiRideToken = response.token;
        return {
          success: true,
          token: response.token,
          user: response.user
        };
      } else {
        throw new Error(response.message || 'Sabi Ride login failed');
      }
    } catch (error) {
      console.error('Sabi Ride login error:', error);
      throw error;
    }
  }

  // Step 2: Login to SabiCash with Sabi Ride token
  async loginToSabiCash(sabiRideToken, walletAddress = null) {
    try {
      const response = await authAPI.login(sabiRideToken, walletAddress);
      
      if (response.success && response.token) {
        this.sabiCashToken = response.token;
        this.currentUser = response.user;
        
        // Store tokens
        localStorage.setItem('sabiRideToken', sabiRideToken);
        localStorage.setItem('sabiCashToken', response.token);
        localStorage.setItem('sabiCashRefreshToken', response.refresh_token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        return {
          success: true,
          user: response.user,
          points: response.points,
          sabiCashBalance: response.sabi_cash_balance
        };
      } else {
        throw new Error(response.message || 'SabiCash login failed');
      }
    } catch (error) {
      console.error('SabiCash login error:', error);
      throw error;
    }
  }

  // Combined login process
  async login(email, password, userType = 'passenger', walletAddress = null) {
    try {
      // Step 1: Login to Sabi Ride
      const sabiRideResult = await this.loginToSabiRide(email, password, userType);
      
      // Step 2: Login to SabiCash with Sabi Ride token
      const sabiCashResult = await this.loginToSabiCash(sabiRideResult.token, walletAddress);
      
      return {
        success: true,
        user: sabiCashResult.user,
        points: sabiCashResult.points,
        sabiCashBalance: sabiCashResult.sabiCashBalance,
        sabiRideToken: sabiRideResult.token,
        sabiCashToken: this.sabiCashToken
      };
    } catch (error) {
      console.error('Login process failed:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  // Legacy login for testing (direct to SabiCash)
  async loginLegacy(email, password, walletAddress = null) {
    try {
      const response = await authAPI.loginLegacy({ email, password, walletAddress });
      
      if (response.success && response.token) {
        this.sabiCashToken = response.token;
        this.currentUser = response.user;
        
        localStorage.setItem('sabiCashToken', response.token);
        localStorage.setItem('sabiCashRefreshToken', response.refresh_token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        return {
          success: true,
          user: response.user,
          points: response.points,
          sabiCashBalance: response.sabi_cash_balance
        };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Legacy login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      if (!this.sabiCashToken) {
        const storedToken = localStorage.getItem('sabiCashToken');
        if (!storedToken) {
          return null;
        }
        this.sabiCashToken = storedToken;
      }

      const response = await authAPI.getProfile();
      if (response.success && response.user) {
        this.currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Update wallet address
  async updateWallet(walletAddress) {
    try {
      const response = await authAPI.updateWallet(walletAddress);
      if (response.success) {
        // Update current user
        if (this.currentUser) {
          this.currentUser.wallet_address = walletAddress;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        return { success: true };
      }
      throw new Error(response.message || 'Failed to update wallet');
    } catch (error) {
      console.error('Update wallet error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update wallet'
      };
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('sabiCashRefreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);
      if (response.success && response.token) {
        this.sabiCashToken = response.token;
        localStorage.setItem('sabiCashToken', response.token);
        localStorage.setItem('sabiCashRefreshToken', response.refresh_token);
        return { success: true };
      }
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return { success: false };
    }
  }

  // Logout
  async logout() {
    try {
      if (this.sabiCashToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      this.currentUser = null;
      this.sabiRideToken = null;
      this.sabiCashToken = null;
      
      localStorage.removeItem('sabiRideToken');
      localStorage.removeItem('sabiCashToken');
      localStorage.removeItem('sabiCashRefreshToken');
      localStorage.removeItem('currentUser');
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.sabiCashToken || !!localStorage.getItem('sabiCashToken');
  }

  // Get stored user
  getStoredUser() {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  }

  // Get tokens
  getTokens() {
    return {
      sabiRideToken: this.sabiRideToken || localStorage.getItem('sabiRideToken'),
      sabiCashToken: this.sabiCashToken || localStorage.getItem('sabiCashToken'),
      refreshToken: localStorage.getItem('sabiCashRefreshToken')
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;