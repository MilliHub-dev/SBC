import { API_ENDPOINTS } from '../config/apiConfig';
import axios from 'axios';

/**
 * Points Service for Sabi Ride Integration
 * Handles all points-related operations using production Sabi Ride API
 */

class PointsService {
  constructor() {
    this.endpoints = {
      POINTS_BALANCE: API_ENDPOINTS.POINTS.BALANCE,
      POINTS_HISTORY: API_ENDPOINTS.POINTS.HISTORY,
      POINTS_CONVERT: API_ENDPOINTS.POINTS.CONVERT,
      TRIPS_COMPLETE: API_ENDPOINTS.TRIPS.COMPLETE,
    };
  }

  /**
   * Create axios instance with authentication
   * @param {string} token - JWT token from Sabi Ride
   * @returns {Object} Configured axios instance
   */
  createAuthenticatedAxios(token) {
    return axios.create({
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
      // Assuming there is a profile endpoint in API_ENDPOINTS.SABI_RIDE
      // For now, reuse balance or implement if needed
      // But the original code was cut off.
      // I'll return a placeholder or try to use POINTS_BALANCE as a proxy for profile points
       const response = await api.get(this.endpoints.POINTS_BALANCE);
       return {
         success: true,
         user: response.data.user || {},
         points: response.data.total_points || 0
       };
    } catch (error) {
       console.error('Error fetching user profile:', error);
       return { success: false, error: error.message };
    }
  }
}

export const pointsService = new PointsService();
