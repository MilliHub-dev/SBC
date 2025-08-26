
// API Configuration for SabiCash Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
const SABI_RIDE_API_URL = import.meta.env.VITE_SABI_RIDE_API_URL || 'https://tmp.sabirideweb.com.ng/api/v1';


export const API_ENDPOINTS = {
  // Authentication - SabiCash backend with Sabi Ride integration
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`, // Login with Sabi Ride token
    LOGIN_LEGACY: `${API_BASE_URL}/auth/login-legacy`, // For testing with email/password
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
    ME: `${API_BASE_URL}/auth/me`,
    UPDATE_WALLET: `${API_BASE_URL}/auth/wallet`,
  },

  // Sabi Ride API endpoints (for getting user token)
  SABI_RIDE: {
    LOGIN_DRIVER: `${SABI_RIDE_API_URL}/auth/login`,
    LOGIN_PASSENGER: `${SABI_RIDE_API_URL}/auth/login`,
    DRIVER_PROFILE: `${SABI_RIDE_API_URL}/users/me/sabi-rider`,
    PASSENGER_PROFILE: `${SABI_RIDE_API_URL}/users/me/sabi-passenger`,
  },

  // Points System
  POINTS: {
    BALANCE: `${API_BASE_URL}/points/balance`,
    HISTORY: `${API_BASE_URL}/points/history`,
    CONVERT: `${API_BASE_URL}/points/convert`,
    VALIDATE_CONVERSION: `${API_BASE_URL}/points/validate-conversion`,
    CONVERSIONS: `${API_BASE_URL}/points/conversions`,
    AWARD: `${API_BASE_URL}/points/award`,
  },

  // Tasks & Rewards
  TASKS: {
    LIST: `${API_BASE_URL}/tasks`,
    CREATE: `${API_BASE_URL}/tasks`,
    COMPLETE: (taskId) => `${API_BASE_URL}/tasks/${taskId}/complete`,
    VERIFY: (taskId) => `${API_BASE_URL}/tasks/${taskId}/verify`,
    USER_TASKS: `${API_BASE_URL}/tasks/user`,
    PENDING: `${API_BASE_URL}/tasks/pending`,
  },

  // Mining System
  MINING: {
    PLANS: `${API_BASE_URL}/mining/plans`,
    STATUS: `${API_BASE_URL}/mining/status`,
    STAKE: `${API_BASE_URL}/mining/stake`,
    CLAIM_FREE: `${API_BASE_URL}/mining/claim-free`,
    CLAIM_STAKE: (stakeId) => `${API_BASE_URL}/mining/claim/${stakeId}`,
    UNSTAKE: (stakeId) => `${API_BASE_URL}/mining/unstake/${stakeId}`,
    HISTORY: `${API_BASE_URL}/mining/history`,
  },

  // Web3 Transactions
  TRANSACTIONS: {
    LOG: `${API_BASE_URL}/transactions`,
    UPDATE_STATUS: (txHash) => `${API_BASE_URL}/transactions/${txHash}/status`,
    USER: `${API_BASE_URL}/transactions/user`,
    GET: (txHash) => `${API_BASE_URL}/transactions/${txHash}`,
    VERIFY: (txHash) => `${API_BASE_URL}/transactions/${txHash}/verify`,
  },

  // Admin
  ADMIN: {
    ANALYTICS: `${API_BASE_URL}/admin/analytics`,
    USERS: `${API_BASE_URL}/admin/users`,
    USER_DETAILS: (userId) => `${API_BASE_URL}/admin/users/${userId}`,
    UPDATE_USER_STATUS: (userId) => `${API_BASE_URL}/admin/users/${userId}/status`,
    SEND_REWARD: (userId) => `${API_BASE_URL}/admin/users/${userId}/reward`,
    TRANSACTIONS: `${API_BASE_URL}/admin/transactions`,
    CONFIG: `${API_BASE_URL}/admin/config`,
  },

  // Sessions (for Sabi Ride integration)
  SESSIONS: {
    CREATE: `${API_BASE_URL}/sessions`,
    TOUCH: `${API_BASE_URL}/sessions/touch`,
    DELETE: `${API_BASE_URL}/sessions`,
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
  // Login with Sabi Ride token
  login: (sabiRideToken, walletAddress) => apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ sabiRideToken, walletAddress }),
  }),

  // Legacy login for testing
  loginLegacy: (credentials) => apiRequest(API_ENDPOINTS.AUTH.LOGIN_LEGACY, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  // Get current user profile
  getProfile: () => apiRequest(API_ENDPOINTS.AUTH.ME, {
    method: 'GET',
  }),

  // Update wallet address
  updateWallet: (walletAddress) => apiRequest(API_ENDPOINTS.AUTH.UPDATE_WALLET, {
    method: 'PUT',
    body: JSON.stringify({ walletAddress }),
  }),

  // Refresh token
  refreshToken: (refreshToken) => apiRequest(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  }),

  logout: () => apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
    method: 'POST',
  }),
};

// Sabi Ride API functions (for getting user token)
export const sabiRideAPI = {
  loginDriver: (credentials) => apiRequest(API_ENDPOINTS.SABI_RIDE.LOGIN_DRIVER, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  loginPassenger: (credentials) => apiRequest(API_ENDPOINTS.SABI_RIDE.LOGIN_PASSENGER, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getDriverProfile: (token) => fetch(API_ENDPOINTS.SABI_RIDE.DRIVER_PROFILE, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.json()),

  getPassengerProfile: (token) => fetch(API_ENDPOINTS.SABI_RIDE.PASSENGER_PROFILE, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.json()),
};

export const pointsAPI = {
  getBalance: () => apiRequest(API_ENDPOINTS.POINTS.BALANCE),
  
  getHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.POINTS.HISTORY}?${queryString}`);
  },
  
  convertPoints: (points, walletAddress) => apiRequest(API_ENDPOINTS.POINTS.CONVERT, {
    method: 'POST',
    body: JSON.stringify({ points, walletAddress }),
  }),
  
  validateConversion: (points, walletAddress) => apiRequest(API_ENDPOINTS.POINTS.VALIDATE_CONVERSION, {
    method: 'POST',
    body: JSON.stringify({ points, walletAddress }),
  }),

  getConversions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.POINTS.CONVERSIONS}?${queryString}`);
  },

  awardPoints: (points, pointsType, description, metadata = {}) => apiRequest(API_ENDPOINTS.POINTS.AWARD, {
    method: 'POST',
    body: JSON.stringify({ points, pointsType, description, metadata }),
  }),
};

export const tasksAPI = {
  getTasks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.TASKS.LIST}?${queryString}`);
  },
  
  createTask: (taskData) => apiRequest(API_ENDPOINTS.TASKS.CREATE, {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  
  completeTask: (taskId, verificationData = {}) => apiRequest(API_ENDPOINTS.TASKS.COMPLETE(taskId), {
    method: 'POST',
    body: JSON.stringify({ verificationData }),
  }),

  verifyTask: (taskId, completionId, approve, pointsAwarded, sabiCashAwarded, adminNotes) => 
    apiRequest(API_ENDPOINTS.TASKS.VERIFY(taskId), {
      method: 'POST',
      body: JSON.stringify({ completionId, approve, pointsAwarded, sabiCashAwarded, adminNotes }),
    }),
  
  getUserTasks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.TASKS.USER_TASKS}?${queryString}`);
  },

  getPendingTasks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.TASKS.PENDING}?${queryString}`);
  },
};

export const miningAPI = {
  getPlans: () => apiRequest(API_ENDPOINTS.MINING.PLANS),

  getStatus: () => apiRequest(API_ENDPOINTS.MINING.STATUS),

  stake: (planType, amount, walletAddress) => apiRequest(API_ENDPOINTS.MINING.STAKE, {
    method: 'POST',
    body: JSON.stringify({ planType, amount, walletAddress }),
  }),

  claimFree: (walletAddress) => apiRequest(API_ENDPOINTS.MINING.CLAIM_FREE, {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  }),

  claimStake: (stakeId, walletAddress) => apiRequest(API_ENDPOINTS.MINING.CLAIM_STAKE(stakeId), {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  }),

  unstake: (stakeId) => apiRequest(API_ENDPOINTS.MINING.UNSTAKE(stakeId), {
    method: 'POST',
  }),

  getHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.MINING.HISTORY}?${queryString}`);
  },
};

export const transactionsAPI = {
  log: (transactionData) => apiRequest(API_ENDPOINTS.TRANSACTIONS.LOG, {
    method: 'POST',
    body: JSON.stringify(transactionData),
  }),

  updateStatus: (txHash, status, confirmations, blockNumber) => 
    apiRequest(API_ENDPOINTS.TRANSACTIONS.UPDATE_STATUS(txHash), {
      method: 'POST',
      body: JSON.stringify({ status, confirmations, blockNumber }),
    }),

  getUserTransactions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.TRANSACTIONS.USER}?${queryString}`);
  },

  getTransaction: (txHash) => apiRequest(API_ENDPOINTS.TRANSACTIONS.GET(txHash)),

  verifyTransaction: (txHash, walletAddress) => apiRequest(API_ENDPOINTS.TRANSACTIONS.VERIFY(txHash), {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  }),
};

export const adminAPI = {
  getAnalytics: () => apiRequest(API_ENDPOINTS.ADMIN.ANALYTICS),
  
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.ADMIN.USERS}?${queryString}`);
  },

  getUserDetails: (userId) => apiRequest(API_ENDPOINTS.ADMIN.USER_DETAILS(userId)),

  updateUserStatus: (userId, isActive, isVerified) => apiRequest(API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(userId), {
    method: 'PUT',
    body: JSON.stringify({ isActive, isVerified }),
  }),

  sendReward: (userId, amount, type, reason) => apiRequest(API_ENDPOINTS.ADMIN.SEND_REWARD(userId), {
    method: 'POST',
    body: JSON.stringify({ amount, type, reason }),
  }),
  
  getTransactions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.ADMIN.TRANSACTIONS}?${queryString}`);
  },

  getConfig: () => apiRequest(API_ENDPOINTS.ADMIN.CONFIG),
};

export const sessionsAPI = {
  create: (sessionData) => apiRequest(API_ENDPOINTS.SESSIONS.CREATE, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  }),

  touch: (sessionToken) => apiRequest(API_ENDPOINTS.SESSIONS.TOUCH, {
    method: 'POST',
    body: JSON.stringify({ sessionToken }),
  }),

  delete: (sessionToken) => apiRequest(API_ENDPOINTS.SESSIONS.DELETE, {
    method: 'DELETE',
    body: JSON.stringify({ sessionToken }),
  }),
};