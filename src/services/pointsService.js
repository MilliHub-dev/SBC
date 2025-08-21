import { SABI_RIDE_API_CONFIG } from '../config/web3Config';
import { apiRequest } from '../config/apiConfig';

/**
 * Points Service for Sabi Ride Integration
 * Handles all points-related operations using existing Sabi Ride API
 */

class PointsService {
  constructor() {
    this.baseURL = SABI_RIDE_API_CONFIG.BASE_URL;
    this.endpoints = SABI_RIDE_API_CONFIG.ENDPOINTS;
  }

  /**
   * Get user's current points balance
   * @param {string} token - JWT token from Sabi Ride
   * @returns {Promise<Object>} Points balance and history info
   */
  async getPointsBalance(token) {
    try {
      const response = await apiRequest(`${this.baseURL}${this.endpoints.POINTS_BALANCE}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return {
        success: true,
        totalPoints: response.total_points || 0,
        pointsHistory: response.points_history || [],
        lastEarned: response.last_earned,
        conversionRate: 0.5, // 1 point = 0.5 SabiCash
        minConversion: 500,
      };
    } catch (error) {
      console.error('Error fetching points balance:', error);
      return {
        success: false,
        error: error.message,
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
      const queryParams = new URLSearchParams({
        limit: options.limit || 50,
        offset: options.offset || 0,
        ...(options.type && { type: options.type }),
      });

      const response = await apiRequest(
        `${this.baseURL}${this.endpoints.POINTS_HISTORY}?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        count: response.count || 0,
        results: response.results || [],
        next: response.next,
        previous: response.previous,
      };
    } catch (error) {
      console.error('Error fetching points history:', error);
      return {
        success: false,
        error: error.message,
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
      const response = await apiRequest(`${this.baseURL}${this.endpoints.POINTS_CONVERT}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points,
          wallet_address: walletAddress,
        }),
      });

      return {
        success: true,
        valid: response.valid || false,
        sabiCashAmount: response.sabi_cash_amount || 0,
        currentPoints: response.current_points || 0,
        remainingPoints: response.remaining_points || 0,
        conversionRate: response.conversion_rate || 0.5,
        message: response.message || 'Conversion validation completed',
      };
    } catch (error) {
      console.error('Error validating conversion:', error);
      return {
        success: false,
        error: error.message,
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
      const response = await apiRequest(`${this.baseURL}${this.endpoints.POINTS_CONVERT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points,
          wallet_address: walletAddress,
        }),
      });

      return {
        success: true,
        pointsConverted: response.points_converted || 0,
        sabiCashAmount: response.sabi_cash_amount || 0,
        newPointBalance: response.new_point_balance || 0,
        transactionId: response.transaction_id,
        message: response.message || 'Points converted successfully',
      };
    } catch (error) {
      console.error('Error converting points:', error);
      return {
        success: false,
        error: error.message,
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
      const response = await apiRequest(`${this.baseURL}${this.endpoints.TRIPS_COMPLETE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance_km: tripData.distanceKm,
          duration_minutes: tripData.durationMinutes,
          fare_amount: tripData.fareAmount,
          pickup_location: tripData.pickupLocation,
          destination_location: tripData.destinationLocation,
        }),
      });

      return {
        success: true,
        tripId: response.trip_id,
        pointsEarned: response.points_earned || 0,
        totalPoints: response.total_points || 0,
        message: response.message || 'Trip completed successfully',
      };
    } catch (error) {
      console.error('Error completing trip:', error);
      return {
        success: false,
        error: error.message,
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
}

// Export singleton instance
export const pointsService = new PointsService();

// Export class for testing
export { PointsService };
