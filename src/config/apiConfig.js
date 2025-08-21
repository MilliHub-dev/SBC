// API Configuration for Sabi Ride Backend Integration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://tmp.sabirideweb.com.ng/api/v1';

export const API_ENDPOINTS = {
  // Authentication - Using existing Sabi Ride endpoints
  AUTH: {
    LOGIN_DRIVER: `${API_BASE_URL}/auth/login`, // Use existing Sabi Ride login
    LOGIN_PASSENGER: `${API_BASE_URL}/auth/login`, // Use existing Sabi Ride login
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
    // User profile endpoints for existing users
    DRIVER_PROFILE: `${API_BASE_URL}/users/me/sabi-rider`,
    PASSENGER_PROFILE: `${API_BASE_URL}/users/me/sabi-passenger`,
  },

  // User Management
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile/`,
    POINTS: `${API_BASE_URL}/users/points/`,
    POINTS_HISTORY: `${API_BASE_URL}/users/points/history/`,
    UPDATE_WALLET: `${API_BASE_URL}/users/update-wallet/`,
  },

  // Points System - Using existing Sabi Ride points endpoints
  POINTS: {
    CONVERT: `${API_BASE_URL}/points/convert`,
    BALANCE: `${API_BASE_URL}/points/balance`,
    HISTORY: `${API_BASE_URL}/points/history`,
    VALIDATE_CONVERSION: `${API_BASE_URL}/points/validate-conversion`,
    // Trip completion for earning points
    COMPLETE_TRIP: `${API_BASE_URL}/trips/complete`,
  },

  // Trips
  TRIPS: {
    LIST: `${API_BASE_URL}/trips/`,
    COMPLETE: (tripId) => `${API_BASE_URL}/trips/${tripId}/complete/`,
    DETAILS: (tripId) => `${API_BASE_URL}/trips/${tripId}/`,
  },

  // Tasks & Rewards
  TASKS: {
    LIST: `${API_BASE_URL}/tasks/`,
    COMPLETE: (taskId) => `${API_BASE_URL}/tasks/${taskId}/complete/`,
    VERIFY: (taskId) => `${API_BASE_URL}/tasks/${taskId}/verify/`,
    USER_TASKS: `${API_BASE_URL}/tasks/user/`,
  },

  // Web3 Integration
  WEB3: {
    VERIFY_TRANSACTION: `${API_BASE_URL}/web3/verify-transaction/`,
    LOG_TRANSACTION: `${API_BASE_URL}/web3/log-transaction/`,
    SYNC_BALANCE: `${API_BASE_URL}/web3/sync-balance/`,
  },

  // Admin
  ADMIN: {
    USERS: `${API_BASE_URL}/admin/users/`,
    TASKS: `${API_BASE_URL}/admin/tasks/`,
    TRANSACTIONS: `${API_BASE_URL}/admin/transactions/`,
    REWARDS: `${API_BASE_URL}/admin/rewards/`,
    ANALYTICS: `${API_BASE_URL}/admin/analytics/`,
    SEND_REWARD: `${API_BASE_URL}/admin/send-reward/`,
  },
};

// Request configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request wrapper
export const apiRequest = async (url, options = {}) => {
  const config = {
    ...API_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Specific API functions
export const authAPI = {
  // Use existing Sabi Ride login endpoint
  login: (credentials) => apiRequest(API_ENDPOINTS.AUTH.LOGIN_DRIVER, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  // Get user profile based on type
  getDriverProfile: () => apiRequest(API_ENDPOINTS.AUTH.DRIVER_PROFILE, {
    method: 'GET',
  }),

  getPassengerProfile: () => apiRequest(API_ENDPOINTS.AUTH.PASSENGER_PROFILE, {
    method: 'GET',
  }),

  logout: () => apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
    method: 'POST',
  }),
};

export const pointsAPI = {
  getBalance: () => apiRequest(API_ENDPOINTS.POINTS.BALANCE),
  
  getHistory: () => apiRequest(API_ENDPOINTS.POINTS.HISTORY),
  
  convertPoints: (data) => apiRequest(API_ENDPOINTS.POINTS.CONVERT, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  validateConversion: (points, walletAddress) => apiRequest(API_ENDPOINTS.POINTS.VALIDATE_CONVERSION, {
    method: 'POST',
    body: JSON.stringify({ points, walletAddress }),
  }),
};

export const tasksAPI = {
  getTasks: () => apiRequest(API_ENDPOINTS.TASKS.LIST),
  
  completeTask: (taskId, data) => apiRequest(API_ENDPOINTS.TASKS.COMPLETE(taskId), {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getUserTasks: () => apiRequest(API_ENDPOINTS.TASKS.USER_TASKS),
};

export const web3API = {
  verifyTransaction: (txHash, walletAddress) => apiRequest(API_ENDPOINTS.WEB3.VERIFY_TRANSACTION, {
    method: 'POST',
    body: JSON.stringify({ txHash, walletAddress }),
  }),
  
  logTransaction: (transactionData) => apiRequest(API_ENDPOINTS.WEB3.LOG_TRANSACTION, {
    method: 'POST',
    body: JSON.stringify(transactionData),
  }),
  
  syncBalance: (walletAddress) => apiRequest(API_ENDPOINTS.WEB3.SYNC_BALANCE, {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  }),
};

export const adminAPI = {
  getUsers: (filters = {}) => apiRequest(`${API_ENDPOINTS.ADMIN.USERS}?${new URLSearchParams(filters)}`),
  
  getTasks: () => apiRequest(API_ENDPOINTS.ADMIN.TASKS),
  
  getTransactions: (filters = {}) => apiRequest(`${API_ENDPOINTS.ADMIN.TRANSACTIONS}?${new URLSearchParams(filters)}`),
  
  getAnalytics: () => apiRequest(API_ENDPOINTS.ADMIN.ANALYTICS),
  
  sendReward: (userId, amount, type) => apiRequest(API_ENDPOINTS.ADMIN.SEND_REWARD, {
    method: 'POST',
    body: JSON.stringify({ userId, amount, type }),
  }),
};