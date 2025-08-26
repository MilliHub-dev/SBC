import { SABI_RIDE_API_CONFIG } from '../config/web3Config';
import axios from 'axios';

/**
 * Points Service for Sabi Ride Integration
 * Handles all points-related operations using production Sabi Ride API
 */

class PointsService {
  constructor() {
    this.baseURL = SABI_RIDE_API_CONFIG.BASE_URL;
    this.endpoints = SABI_RIDE_API_CONFIG.ENDPOINTS;
  }

  /**
   * Create axios instance with authentication
   * @param {string} token - JWT token from Sabi Ride
   * @returns {Object} Configured axios instance
   */
  createAuthenticatedAxios(token) {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Get user's current points balance
   * @param {string} token - JWT token from Sabi Ride
   * @returns {Promise<Object>} Points balance and history info
   */
  async getPointsBalance(token) {
    try {
      const api = this.createAuthenticatedAxios(token);
      const response = await api.get(this.endpoints.POINTS_BALANCE);
      
      return {
        success: true,
        totalPoints: response.data.total_points || 0,
        pointsHistory: response.data.points_history || [],
        lastEarned: response.data.last_earned,
        conversionRate: 0.5, // 1 point = 0.5 SabiCash
        minConversion: 500,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching points balance:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        totalPoints: 0,
      };
    }
  }

  /**
   * Get user's points history
   * @param {string} token - JWT token from Sabi Ride
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Points history data
   */
  async getPointsHistory(token, options = {}) {
    try {
      const api = this.createAuthenticatedAxios(token);
      const queryParams = new URLSearchParams({
        limit: options.limit || 50,
        offset: options.offset || 0,
        ...(options.type && { type: options.type }),
      });

      const response = await api.get(`${this.endpoints.POINTS_HISTORY}?${queryParams}`);

      return {
        success: true,
        count: response.data.count || 0,
        results: response.data.results || [],
        next: response.data.next,
        previous: response.data.previous,
      };
    } catch (error) {
      console.error('Error fetching points history:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        results: [],
        count: 0,
      };
    }
  }

  /**
   * Validate point conversion request
   * @param {string} token - JWT token from Sabi Ride
   * @param {number} points - Points to convert
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Validation result
   */
  async validateConversion(token, points, walletAddress) {
    try {
      const api = this.createAuthenticatedAxios(token);
      const response = await api.post(`${this.endpoints.POINTS_CONVERT}/validate`, {
        points,
        wallet_address: walletAddress,
      });

      return {
        success: true,
        valid: response.data.valid || false,
        sabiCashAmount: response.data.sabi_cash_amount || 0,
        currentPoints: response.data.current_points || 0,
        remainingPoints: response.data.remaining_points || 0,
        conversionRate: response.data.conversion_rate || 0.5,
        message: response.data.message || 'Conversion validation completed',
      };
    } catch (error) {
      console.error('Error validating conversion:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        valid: false,
      };
    }
  }

  /**
   * Convert points to SabiCash tokens
   * @param {string} token - JWT token from Sabi Ride
   * @param {number} points - Points to convert
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Conversion result
   */
  async convertPoints(token, points, walletAddress) {
    try {
      const api = this.createAuthenticatedAxios(token);
      const response = await api.post(this.endpoints.POINTS_CONVERT, {
        points,
        wallet_address: walletAddress,
      });

      return {
        success: true,
        pointsConverted: response.data.points_converted || 0,
        sabiCashAmount: response.data.sabi_cash_amount || 0,
        newPointBalance: response.data.new_point_balance || 0,
        transactionId: response.data.transaction_id,
        message: response.data.message || 'Points converted successfully',
      };
    } catch (error) {
      console.error('Error converting points:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Complete a trip and earn points
   * @param {string} token - JWT token from Sabi Ride
   * @param {Object} tripData - Trip completion data
   * @returns {Promise<Object>} Trip completion result
   */
  async completeTrip(token, tripData) {
    try {
      const api = this.createAuthenticatedAxios(token);
      const response = await api.post(this.endpoints.TRIPS_COMPLETE, {
        distance_km: tripData.distanceKm,
        duration_minutes: tripData.durationMinutes,
        fare_amount: tripData.fareAmount,
        pickup_location: tripData.pickupLocation,
        destination_location: tripData.destinationLocation,
      });

      return {
        success: true,
        tripId: response.data.trip_id,
        pointsEarned: response.data.points_earned || 0,
        totalPoints: response.data.total_points || 0,
        message: response.data.message || 'Trip completed successfully',
      };
    } catch (error) {
      console.error('Error completing trip:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get user profile with points information
   * @param {string} token - JWT token from Sabi Ride
   * @returns {Promise<Object>} User profile with points
   */
  async getUserProfile(token) {
    try {
      const api = this.createAuthenticatedAxios(token);
      const response = await api.get('/users/me');

      return {
        success: true,
        user: response.data,
        totalPoints: response.data.total_points || 0,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        user: null,
        totalPoints: 0,
      };
    }
  }

  /**
   * Get points earning rate and rules
   * @returns {Object} Points system configuration
   */
  getPointsConfig() {
    return {
      pointsPerKm: 1, // 1 point per kilometer
      minConversion: 500, // Minimum points for conversion
      conversionRate: 0.5, // 1 point = 0.5 SabiCash
      taskRewards: {
        follow: 7,
        like: 7,
        comment: 7,
        referral: 7,
      },
    };
  }

  /**
   * Calculate points for a given distance
   * @param {number} distanceKm - Distance in kilometers
   * @returns {number} Points earned
   */
  calculatePointsForDistance(distanceKm) {
    const config = this.getPointsConfig();
    return Math.round(distanceKm * config.pointsPerKm);
  }

  /**
   * Calculate SabiCash for given points
   * @param {number} points - Points to convert
   * @returns {number} SabiCash amount
   */
  calculateSabiCashForPoints(points) {
    const config = this.getPointsConfig();
    return points * config.conversionRate;
  }

  /**
   * Check if user can convert points
   * @param {number} points - Points to convert
   * @returns {Object} Conversion eligibility
   */
  canConvertPoints(points) {
    const config = this.getPointsConfig();
    const eligible = points >= config.minConversion;
    
    return {
      eligible,
      minRequired: config.minConversion,
      currentPoints: points,
      canConvert: eligible,
      message: eligible 
        ? `You can convert ${points} points to ${this.calculateSabiCashForPoints(points)} SabiCash`
        : `You need at least ${config.minConversion} points to convert. You have ${points} points.`,
    };
  }

  /**
   * Award points to user (Admin function)
   * @param {string} token - Admin JWT token
   * @param {string} userId - User ID to award points to
   * @param {number} points - Points to award
   * @param {string} reason - Reason for awarding points
   * @returns {Promise<Object>} Award result
   */
  async awardPoints(token, userId, points, reason) {
    try {
      const api = this.createAuthenticatedAxios(token);
      const response = await api.post('/admin/award-points', {
        user_id: userId,
        points,
        reason,
      });

      return {
        success: true,
        pointsAwarded: response.data.points_awarded || 0,
        newBalance: response.data.new_balance || 0,
        message: response.data.message || 'Points awarded successfully',
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

// Export singleton instance
export const pointsService = new PointsService();

// Export class for testing
export { PointsService };
