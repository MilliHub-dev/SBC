# Sabi Ride Web3 DApp - Deployment Guide

## Overview
This is a Web3 decentralized application (DApp) built with React, Vite, Chakra UI v3, and wagmi for Ethereum interaction. The app includes features for cryptocurrency mining, staking, rewards, and points conversion.

## API Configuration
- **Base URL**: `https://dev.sabirideweb.com.ng`
- **Login Endpoint**: `/api/auth/login`
- **Points Endpoint**: `/api/user/points`
- **Full API configuration**: See `src/config/apiConfig.js`

## Pre-deployment Checklist

### 1. Environment Variables
Make sure to set up the following environment variables in your deployment platform:

```bash
# Required for Wallet Connect integration
REACT_APP_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# Production environment
NODE_ENV=production
```

### 2. Smart Contract Configuration
Update the contract addresses in `src/config/web3Config.js`:
- `SABI_CASH_CONTRACT_ADDRESS`: Deploy your ERC20 token contract
- `USDT_CONTRACT_ADDRESS`: Set the USDT contract address for your network

### 3. Backend API
Ensure your backend API at `dev.sabirideweb.com.ng` is:
- Properly configured and running
- CORS enabled for your deployment domain
- All endpoints returning expected JSON responses

## Deployment Options

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build the project**
   ```bash
   npm install
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add the required environment variables
   - Redeploy if needed

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Configure redirects** (add to `netlify.toml`):
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Deploy to Other Platforms

The app can be deployed to any static hosting platform that supports SPAs:
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- DigitalOcean App Platform

## Post-deployment Configuration

1. **Test Wallet Connection**
   - Verify RainbowKit wallet connection works
   - Test with MetaMask, WalletConnect, etc.

2. **Test API Integration**
   - Verify login functionality
   - Test points fetching and conversion
   - Check mining and staking features

3. **Verify Web3 Features**
   - Test buying tokens with ETH/USDT
   - Verify staking functionality
   - Test reward claiming

## Known Issues & Fixes Applied

- ✅ Fixed Chakra UI v3 compatibility issues
- ✅ Updated Modal to Dialog components
- ✅ Fixed FormControl to Field components
- ✅ Updated useToast to toaster system
- ✅ Fixed Divider to Separator components
- ✅ Integrated API endpoints with proper error handling

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Runtime Errors
- Check browser console for Web3 connection issues
- Verify API endpoints are accessible
- Ensure environment variables are properly set

### Performance Issues
- The app includes code splitting and lazy loading
- Static assets are optimized for caching
- Consider enabling gzip compression on your hosting platform

## Support

For issues related to:
- **Web3 functionality**: Check wagmi and RainbowKit documentation
- **UI components**: Refer to Chakra UI v3 documentation
- **API integration**: Verify backend API responses
- **Deployment**: Check your hosting platform's documentation

## Security Considerations

- Never commit private keys or sensitive data
- Use environment variables for all configuration
- Implement proper CORS policies on your backend
- Consider rate limiting for API endpoints
- Regularly update dependencies for security patches