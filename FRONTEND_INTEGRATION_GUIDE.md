# SabiCash Frontend Integration Guide

## 🔄 Overview

This guide explains how to integrate your React frontend with the new SabiCash backend that works with existing Sabi Ride users.

## 🔑 Admin API Key Usage

The `ADMIN_API_KEY` is used for:
- **System maintenance endpoints** (health checks, monitoring)
- **Background processes** (cron jobs, automated tasks)
- **External integrations** (webhooks from payment providers)
- **Internal services** that need admin access without user login

For regular admin users in the dashboard, they should login normally with their admin account and use JWT tokens.

## 🏗️ Authentication Flow

### No Registration - Sabi Ride Users Only

Users **cannot register** in the dApp. They must use existing Sabi Ride accounts.

### Login Process

1. **User enters Sabi Ride credentials** in your dApp
2. **Frontend calls Sabi Ride API** to get authentication token
3. **Frontend calls SabiCash backend** with Sabi Ride token
4. **SabiCash backend verifies token** with Sabi Ride
5. **SabiCash backend creates/syncs user** and returns JWT token
6. **Frontend stores JWT token** for subsequent requests

## 🔧 Updated Configuration

### Environment Variables (.env)
```env
# SabiCash Backend
VITE_API_BASE_URL=http://localhost:8787/api

# Sabi Ride API (for authentication)
VITE_SABI_RIDE_API_URL=https://tmp.sabirideweb.com.ng/api/v1

# Web3 Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 📱 Frontend Integration

### 1. Updated API Configuration

The `src/config/apiConfig.js` has been updated with new endpoints:

```javascript
// New API structure
export const API_ENDPOINTS = {
  // SabiCash Authentication
  AUTH: {
    LOGIN: '/auth/login',              // Login with Sabi Ride token
    LOGIN_LEGACY: '/auth/login-legacy', // For testing only
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    UPDATE_WALLET: '/auth/wallet',
  },

  // Sabi Ride API (for getting tokens)
  SABI_RIDE: {
    LOGIN_DRIVER: '/auth/login',
    LOGIN_PASSENGER: '/auth/login',
    // ... other endpoints
  },

  // Points, Tasks, Mining, Transactions, Admin...
};
```

### 2. New Auth Service

Use the new `src/services/authService.js`:

```javascript
import authService from '../services/authService.js';

// Login process (2 steps)
const loginResult = await authService.login(email, password, 'passenger', walletAddress);

if (loginResult.success) {
  console.log('User logged in:', loginResult.user);
  console.log('Points:', loginResult.points);
  console.log('Sabi Cash Balance:', loginResult.sabiCashBalance);
} else {
  console.error('Login failed:', loginResult.error);
}

// For testing with seeded accounts
const legacyLogin = await authService.loginLegacy(email, password, walletAddress);
```

### 3. Updated API Functions

All API functions have been updated:

```javascript
import { pointsAPI, tasksAPI, miningAPI, transactionsAPI, adminAPI } from '../config/apiConfig.js';

// Points
const balance = await pointsAPI.getBalance();
const history = await pointsAPI.getHistory({ limit: 20, type: 'trip' });
const conversion = await pointsAPI.convertPoints(1000, walletAddress);

// Tasks
const tasks = await tasksAPI.getTasks({ category: 'social_media' });
const completion = await tasksAPI.completeTask(taskId, { screenshot_url: 'url' });
const userTasks = await tasksAPI.getUserTasks();

// Mining
const plans = await miningAPI.getPlans();
const status = await miningAPI.getStatus();
const stake = await miningAPI.stake('basic', 100, walletAddress);
const claim = await miningAPI.claimFree(walletAddress);

// Transactions
const log = await transactionsAPI.log(transactionData);
const userTx = await transactionsAPI.getUserTransactions();

// Admin (requires admin JWT token)
const analytics = await adminAPI.getAnalytics();
const users = await adminAPI.getUsers({ user_type: 'driver' });
```

## 🔄 Migration Steps

### Step 1: Update Dependencies
```bash
# No new dependencies needed - all existing dependencies work
npm install
```

### Step 2: Update Environment Variables
```bash
# Copy the new environment template
cp .env.example .env

# Update with your backend URL
VITE_API_BASE_URL=http://localhost:8787/api
```

### Step 3: Update Login Components

Replace your existing login logic:

```javascript
// OLD - Direct API calls
const loginUser = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// NEW - Using auth service
import authService from '../services/authService.js';

const loginUser = async (email, password, userType, walletAddress) => {
  const result = await authService.login(email, password, userType, walletAddress);
  
  if (result.success) {
    // User is now logged in to both Sabi Ride and SabiCash
    setUser(result.user);
    setPoints(result.points);
    setSabiCashBalance(result.sabiCashBalance);
  } else {
    // Handle login error
    setError(result.error);
  }
  
  return result;
};
```

### Step 4: Update API Calls

Replace existing API calls with new ones:

```javascript
// OLD
import { pointsAPI } from '../config/apiConfig.js';
const points = await pointsAPI.convertPoints({ points: 1000, walletAddress });

// NEW
import { pointsAPI } from '../config/apiConfig.js';
const points = await pointsAPI.convertPoints(1000, walletAddress);
```

### Step 5: Add Mining Integration

Add mining functionality to your components:

```javascript
import { miningAPI } from '../config/apiConfig.js';

// Get mining plans
const MiningPlans = () => {
  const [plans, setPlans] = useState(null);
  
  useEffect(() => {
    const loadPlans = async () => {
      const result = await miningAPI.getPlans();
      setPlans(result.plans);
    };
    loadPlans();
  }, []);

  const handleStake = async (planType, amount) => {
    const walletAddress = getCurrentWalletAddress();
    const result = await miningAPI.stake(planType, amount, walletAddress);
    
    if (result.success) {
      // Update UI
      console.log('Staking successful:', result.stake);
    }
  };

  // Render mining plans...
};
```

## 🧪 Testing

### Test Accounts (after running `npm run db:seed`)

```javascript
// Admin account
await authService.loginLegacy('admin@sabicash.com', 'admin123');

// Driver account
await authService.loginLegacy('driver@sabicash.com', 'driver123');

// Passenger account
await authService.loginLegacy('passenger@sabicash.com', 'passenger123');
```

### Development Testing

```javascript
// For development, you can use legacy login
const devLogin = async () => {
  const result = await authService.loginLegacy(
    'passenger@sabicash.com', 
    'passenger123', 
    '0x1234567890abcdef1234567890abcdef12345678'
  );
  
  if (result.success) {
    console.log('Dev login successful:', result.user);
  }
};
```

## 🔒 Security Considerations

### Token Management
- **Sabi Ride Token**: Used only for initial authentication
- **SabiCash JWT Token**: Used for all API requests
- **Refresh Token**: Used to get new JWT tokens

### Storage
```javascript
// Tokens are automatically stored in localStorage
const tokens = authService.getTokens();
console.log('Sabi Ride Token:', tokens.sabiRideToken);
console.log('SabiCash Token:', tokens.sabiCashToken);
console.log('Refresh Token:', tokens.refreshToken);
```

### Auto Token Refresh
```javascript
// The auth service handles token refresh automatically
// But you can manually refresh if needed
const refreshResult = await authService.refreshToken();
if (!refreshResult.success) {
  // Token refresh failed, redirect to login
  await authService.logout();
  router.push('/login');
}
```

## 🎯 New Features Available

### Points System
- ✅ **Balance tracking** with history
- ✅ **Conversion to Sabi Cash** with validation
- ✅ **Configurable rates** (admin controlled)

### Task Rewards
- ✅ **Task completion** with verification
- ✅ **Admin approval** system
- ✅ **Automatic reward** distribution

### Mining System
- ✅ **Three mining plans** (Free, Basic, Premium)
- ✅ **Staking mechanism** with deposits
- ✅ **Daily rewards** with claim system
- ✅ **Auto-claim** for premium users

### Admin Dashboard
- ✅ **System analytics** and reporting
- ✅ **User management** and status control
- ✅ **Reward distribution** system
- ✅ **Transaction monitoring**

## 🚀 Deployment

### Backend Deployment
1. Deploy the Node.js backend to your hosting service
2. Set up Neon PostgreSQL database
3. Configure environment variables
4. Run database setup: `npm run db:setup`
5. Seed test data: `npm run db:seed`

### Frontend Updates
1. Update `VITE_API_BASE_URL` to your backend URL
2. Test all functionality with new API
3. Deploy frontend with updated configuration

## 🐛 Troubleshooting

### Common Issues

**1. CORS Errors**
```javascript
// Backend CORS is configured for localhost:5173 and localhost:3000
// Update server/src/index.js if using different ports
```

**2. Token Expiration**
```javascript
// JWT tokens expire after 24 hours
// Use refresh token or re-login
const refreshResult = await authService.refreshToken();
```

**3. Sabi Ride Integration**
```javascript
// For production, update the Sabi Ride API verification
// In server/src/routes/auth.js, replace the simulated response
// with actual Sabi Ride API calls
```

**4. Database Connection**
```javascript
// Make sure NEON_DATABASE_URL is set correctly
// Check database connection in server logs
```

## 📞 Support

### Backend API Documentation
- All endpoints return consistent JSON responses
- Error codes are standardized
- Rate limiting is implemented for security

### Frontend Integration Help
- Use the provided `authService` for authentication
- All API functions are promisified and return consistent formats
- Check browser console for detailed error messages

---

**🎉 Your frontend is now ready to work with the new SabiCash backend!**

The integration provides a seamless experience where users login with their existing Sabi Ride accounts and get access to all the new Web3 features including points conversion, task rewards, and mining functionality.