// API Configuration for Sabi Ride
export const API_CONFIG = {
  BASE_URL: 'https://tmp.sabirideweb.com.ng',
  ENDPOINTS: {
    // Authentication endpoints
    LOGIN: '/api/v1/users/login/sabi-passenger',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY_TOKEN: '/auth/token/verify',
    
    // User points and rewards endpoints
    GET_USER_POINTS: '/api/user/points',
    UPDATE_USER_POINTS: '/api/user/points/update',
    CONVERT_POINTS: '/api/user/points/convert',
    GET_CONVERSION_HISTORY: '/api/user/points/history',
    
    // Rewards and tasks endpoints
    GET_AVAILABLE_TASKS: '/api/tasks',
    COMPLETE_TASK: '/api/tasks/complete',
    GET_TASK_HISTORY: '/api/tasks/history',
    CLAIM_REWARD: '/api/rewards/claim',
    
    // Mining endpoints
    START_MINING: '/api/mining/start',
    STOP_MINING: '/api/mining/stop',
    GET_MINING_STATUS: '/api/mining/status',
    CLAIM_MINING_REWARDS: '/api/mining/claim',
    
    // Staking endpoints
    CREATE_STAKE: '/api/staking/create',
    GET_STAKES: '/api/staking/list',
    CLAIM_STAKING_REWARDS: '/api/staking/claim',
    
    // Wallet endpoints
    LINK_WALLET: '/api/wallet/link',
    GET_WALLET_INFO: '/api/wallet/info',
    
    // Admin endpoints
    ADMIN_USERS: '/api/admin/users',
    ADMIN_TASKS: '/api/admin/tasks',
    ADMIN_ANALYTICS: '/api/admin/analytics',
  }
};

// Create full URL helper function
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API request headers
export const getApiHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// API request helper function
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const token = localStorage.getItem('sabiride_auth_token');
  
  const defaultOptions = {
    headers: getApiHeaders(token),
  };
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Specific API functions for common operations
export const authApi = {
  login: async (credentials) => {
    return apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (userData) => {
    return apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  verifyToken: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.VERIFY_TOKEN, {
      method: 'GET',
    });
  },
};

export const pointsApi = {
  getUserPoints: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.GET_USER_POINTS, {
      method: 'GET',
    });
  },
  
  convertPoints: async (pointsToConvert) => {
    return apiRequest(API_CONFIG.ENDPOINTS.CONVERT_POINTS, {
      method: 'POST',
      body: JSON.stringify({ points: pointsToConvert }),
    });
  },
  
  getConversionHistory: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.GET_CONVERSION_HISTORY, {
      method: 'GET',
    });
  },
};

export const tasksApi = {
  getAvailableTasks: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.GET_AVAILABLE_TASKS, {
      method: 'GET',
    });
  },
  
  completeTask: async (taskId, taskData) => {
    return apiRequest(API_CONFIG.ENDPOINTS.COMPLETE_TASK, {
      method: 'POST',
      body: JSON.stringify({ taskId, ...taskData }),
    });
  },
  
  getTaskHistory: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.GET_TASK_HISTORY, {
      method: 'GET',
    });
  },
};

export const walletApi = {
  linkWallet: async (walletAddress, signature) => {
    return apiRequest(API_CONFIG.ENDPOINTS.LINK_WALLET, {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
    });
  },
  
  getWalletInfo: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.GET_WALLET_INFO, {
      method: 'GET',
    });
  },
};