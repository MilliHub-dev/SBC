# Sabi Ride Web3 Deployment Guide

## Overview

This guide walks through deploying the complete Sabi Ride Web3 platform with ThirdWeb contract integration, Neon database, and API backend.

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (Neon recommended)
- ThirdWeb account and deployed contract
- Polygon zkEVM testnet/mainnet access
- Domain name for production deployment

## 1. Environment Configuration

Create `.env` file in project root:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_ENV=production

# Web3 Configuration
VITE_WALLETCONNECT_PROJECT_ID=2f05ae7f1116030fde2d36508f472bfb
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# Contract Addresses (Your ThirdWeb Contract)
VITE_SABI_CASH_CONTRACT=0x53308b85F0Fceadfc0a474eb0c196F0F02CD4983
VITE_USDT_CONTRACT=0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035

# Network Configuration
VITE_DEFAULT_CHAIN_ID=1442
VITE_NETWORK_NAME=polygon-zkevm-testnet

# Database (Neon)
DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/sabiride
NEON_DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/sabiride

# Authentication
JWT_SECRET_KEY=generate_a_strong_secret_key_here
JWT_EXPIRY_HOURS=24

# Admin Wallets
ADMIN_WALLET_ADDRESSES=0x1234567890123456789012345678901234567890

# Point System
POINTS_PER_KM=1
MIN_POINT_CONVERSION=500
POINT_TO_SABI_RATE=0.5
```

## 2. Database Setup (Neon)

### Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create new project: "Sabi Ride Web3"
3. Note the connection string
4. Create database: `sabiride`

### Step 2: Initialize Database Schema

```bash
# Connect to your Neon database
psql "postgresql://username:password@ep-hostname.region.neon.tech/sabiride"

# Run the schema creation
\i database/neon-schema.sql
```

### Step 3: Verify Database Setup

```sql
-- Check tables
\dt

-- Verify sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM tasks WHERE is_active = true;
```

## 3. Frontend Deployment

### Development Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Or use CLI:
vercel env add VITE_API_BASE_URL
vercel env add VITE_SABI_CASH_CONTRACT
# ... add all environment variables
```

### Deploy to Netlify

```bash
# Build project
npm run build

# Deploy dist folder to Netlify
# Or connect GitHub repo for automatic deployments
```

## 4. Backend API Implementation

### Framework Options

#### Option A: Django/Python (Recommended)
```bash
# Create Django project
django-admin startproject sabiride_api
cd sabiride_api

# Install dependencies
pip install django djangorestframework django-cors-headers
pip install psycopg2-binary python-decouple PyJWT

# Configure settings.py with Neon database
# Implement API endpoints from doc/BACKEND_API_INTEGRATION.md
```

#### Option B: Node.js/Express
```bash
# Create Node.js API
mkdir sabiride-api && cd sabiride-api
npm init -y

# Install dependencies
npm install express cors helmet dotenv
npm install pg jsonwebtoken bcryptjs
npm install express-rate-limit

# Implement API endpoints
# Use the database schema from database/neon-schema.sql
```

#### Option C: FastAPI/Python
```bash
# Create FastAPI project
pip install fastapi uvicorn sqlalchemy psycopg2-binary
pip install python-jose[cryptography] passlib[bcrypt]

# Implement API using the provided schema
```

### Key Implementation Points

1. **Authentication**: JWT-based auth with driver/passenger roles
2. **Points System**: Award 1 point per km traveled
3. **Task Management**: CRUD operations for social media tasks
4. **Web3 Integration**: Log blockchain transactions
5. **Admin Panel**: User management and analytics

## 5. Smart Contract Integration

### ThirdWeb Configuration

Your contract is already deployed at: `0x53308b85F0Fceadfc0a474eb0c196F0F02CD4983`

#### Verify Contract Functions

```javascript
// Test basic ERC20 functions
const contract = new ethers.Contract(
  '0x53308b85F0Fceadfc0a474eb0c196F0F02CD4983',
  SABI_CASH_ABI,
  provider
);

// Check contract info
const name = await contract.name();
const symbol = await contract.symbol();
const totalSupply = await contract.totalSupply();
console.log(`${name} (${symbol}) - Supply: ${totalSupply}`);
```

#### Add Custom Functions (if needed)

If you need mining/staking functions, you can:
1. Deploy a new contract with additional features
2. Or implement staking logic in the backend API

## 6. Testing Checklist

### Frontend Tests
- [ ] Wallet connection (MetaMask, WalletConnect)
- [ ] Token balance display
- [ ] Login system (driver/passenger)
- [ ] Points conversion flow
- [ ] Task completion UI
- [ ] Admin panel access
- [ ] Mobile responsiveness

### Backend Tests
- [ ] User registration/login
- [ ] Points earning on trip completion
- [ ] Task creation and completion
- [ ] Point to SabiCash conversion
- [ ] Admin authentication
- [ ] Database transactions
- [ ] API rate limiting

### Integration Tests
- [ ] Frontend ↔ Backend communication
- [ ] Web3 ↔ Backend synchronization
- [ ] Point conversion ↔ Token minting
- [ ] Task completion ↔ Reward distribution

## 7. Production Deployment

### Security Checklist
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] CORS configured properly
- [ ] JWT secrets rotated
- [ ] Admin wallet addresses verified
- [ ] Contract ownership verified
- [ ] SSL certificates installed

### Performance Optimization
- [ ] Frontend assets minified
- [ ] Database queries optimized
- [ ] API response caching
- [ ] CDN for static assets
- [ ] Database connection pooling
- [ ] Error monitoring (Sentry)

### Monitoring Setup
- [ ] Application logs configured
- [ ] Database monitoring
- [ ] API endpoint monitoring
- [ ] Blockchain transaction tracking
- [ ] User analytics
- [ ] Error alerting

## 8. Launch Sequence

### Phase 1: Beta Testing
1. Deploy to staging environment
2. Test with limited users (10-50)
3. Monitor for issues
4. Gather user feedback
5. Fix critical bugs

### Phase 2: Soft Launch
1. Deploy to production
2. Enable for subset of existing users
3. Monitor performance and usage
4. Gradual rollout to more users
5. Marketing to driver/passenger communities

### Phase 3: Full Launch
1. Public announcement
2. Social media campaigns
3. Influencer partnerships
4. Press releases
5. Monitor scaling needs

## 9. Maintenance

### Regular Tasks
- [ ] Database backups
- [ ] Security updates
- [ ] Performance monitoring
- [ ] User support
- [ ] Feature updates
- [ ] Contract upgrades (if needed)

### Monthly Reviews
- [ ] Analytics review
- [ ] User feedback analysis
- [ ] Performance optimization
- [ ] Security audit
- [ ] Cost optimization
- [ ] Feature roadmap updates

## 10. Support & Documentation

### User Documentation
- [ ] Wallet connection guide
- [ ] Points earning explanation
- [ ] Task completion tutorials
- [ ] Troubleshooting FAQ
- [ ] Video tutorials

### Developer Documentation
- [ ] API documentation
- [ ] Database schema docs
- [ ] Deployment procedures
- [ ] Testing guidelines
- [ ] Contributing guidelines

## Deployment Commands Summary

```bash
# Frontend Deployment
npm install
npm run build
vercel --prod

# Backend Setup (Django example)
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
python manage.py runserver

# Database Setup
psql $NEON_DATABASE_URL < database/neon-schema.sql

# Environment Variables
export VITE_SABI_CASH_CONTRACT=0x53308b85F0Fceadfc0a474eb0c196F0F02CD4983
export VITE_API_BASE_URL=https://your-api.com/api
```

## Success Metrics

### Technical Metrics
- 99.9% uptime
- <2s page load times
- <500ms API response times
- 0 critical security issues

### Business Metrics
- User adoption rate
- Points conversion rate
- Task completion rate
- Daily/monthly active users
- Revenue from token purchases

Your Sabi Ride Web3 platform is now ready for deployment! 🚀
