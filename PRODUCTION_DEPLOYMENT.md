# Sabi Cash Production Deployment Guide

This guide will help you deploy the Sabi Cash application to production with all real endpoints and integrations.

## Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL database
- Redis instance (optional, for caching)
- Domain name and SSL certificate
- ThirdWeb account and project
- Sabi Ride API access

## Environment Setup

### 1. Frontend Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=production
VITE_DEMO_MODE=false

# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SABI_RIDE_API_URL=https://tmp.sabirideweb.com.ng/api/v1

# ThirdWeb Configuration
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
VITE_THIRDWEB_SECRET_KEY=your-thirdweb-secret-key
VITE_THIRDWEB_TOKEN_DROP_ADDRESS=your-deployed-token-drop-address

# Contract Addresses
VITE_SABI_CASH_CONTRACT_ADDRESS=your-sabi-cash-contract-address
VITE_USDT_CONTRACT_ADDRESS=0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035
```

### 2. Backend Environment Variables

Create a `.env` file in the `server/` directory:

```env
NODE_ENV=production
PORT=8787

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://host:port

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-at-least-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Blockchain Configuration
POLYGON_ZKEVM_RPC_URL=https://rpc.public.zkevm-test.net
PRIVATE_KEY=your-backend-wallet-private-key

# External Services
COINGECKO_API_KEY=your-coingecko-api-key
INFURA_PROJECT_ID=your-infura-project-id
```

## Deployment Steps

### 1. Database Setup

1. **Create PostgreSQL Database**
   ```bash
   createdb sabicash_production
   ```

2. **Run Database Migration**
   ```bash
   cd server
   npm run db:migrate
   ```

3. **Verify Database Setup**
   ```bash
   npm run db:setup
   ```

### 2. ThirdWeb Token Drop Setup

1. **Create ThirdWeb Project**
   - Go to [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
   - Create a new project
   - Deploy a Token Drop contract on Polygon zkEVM Testnet

2. **Configure Token Drop**
   - Set claim conditions (price, supply, etc.)
   - Configure allowlists if needed
   - Update `VITE_THIRDWEB_TOKEN_DROP_ADDRESS` with deployed address

### 3. Smart Contract Deployment

1. **Deploy Sabi Cash Token Contract**
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network polygon-zkevm-testnet
   ```

2. **Update Contract Addresses**
   - Update `VITE_SABI_CASH_CONTRACT_ADDRESS` in frontend env
   - Verify contract on block explorer

### 4. Backend Deployment

#### Option A: Traditional Server (VPS/Dedicated)

1. **Install Dependencies**
   ```bash
   cd server
   npm ci --production
   ```

2. **Create Logs Directory**
   ```bash
   mkdir -p logs
   ```

3. **Start with PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name "sabicash-backend"
   pm2 save
   pm2 startup
   ```

#### Option B: Docker Deployment

1. **Create Dockerfile for Backend**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY . .
   EXPOSE 8787
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t sabicash-backend .
   docker run -d --name sabicash-backend -p 8787:8787 --env-file .env sabicash-backend
   ```

#### Option C: Cloud Platform (Railway, Heroku, etc.)

1. **Connect Repository**
   - Link your GitHub repository
   - Set environment variables in platform dashboard

2. **Configure Build Settings**
   - Build command: `npm ci`
   - Start command: `npm start`
   - Root directory: `server`

### 5. Frontend Deployment

#### Option A: Static Hosting (Vercel, Netlify)

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Platform**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables

#### Option B: Traditional Web Server (Nginx)

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/your/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:8787;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Post-Deployment Configuration

### 1. SSL Certificate Setup

```bash
# Using Certbot for Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 2. Database Backup Setup

```bash
# Create daily backup script
#!/bin/bash
pg_dump $DATABASE_URL > /backups/sabicash_$(date +%Y%m%d).sql
find /backups -name "sabicash_*.sql" -mtime +7 -delete

# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### 3. Monitoring Setup

1. **Application Monitoring**
   - Set up error tracking (Sentry, LogRocket)
   - Configure uptime monitoring
   - Set up performance monitoring

2. **Server Monitoring**
   - CPU, Memory, Disk usage
   - Database performance
   - API response times

### 4. Security Configuration

1. **Firewall Setup**
   ```bash
   ufw allow ssh
   ufw allow http
   ufw allow https
   ufw enable
   ```

2. **Rate Limiting**
   - Configure Cloudflare or similar CDN
   - Set up DDoS protection
   - Enable bot protection

## Testing Production Deployment

### 1. Smoke Tests

1. **Frontend Tests**
   - [ ] Application loads correctly
   - [ ] Wallet connection works
   - [ ] Login functionality works
   - [ ] All pages load without errors

2. **Backend Tests**
   - [ ] Health check endpoint responds
   - [ ] Authentication endpoints work
   - [ ] Database connections are stable
   - [ ] External API integrations work

3. **Integration Tests**
   - [ ] Point conversion works with real API
   - [ ] ThirdWeb token purchase works
   - [ ] Admin panel functions correctly
   - [ ] Task creation and management works

### 2. Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
artillery quick --count 10 --num 5 https://your-api-domain.com/api/health
```

## Maintenance

### 1. Regular Updates

1. **Security Updates**
   ```bash
   npm audit
   npm update
   ```

2. **Database Maintenance**
   ```bash
   # Run monthly
   npm run db:analyze
   npm run db:vacuum
   ```

### 2. Log Rotation

```bash
# Configure logrotate for application logs
sudo nano /etc/logrotate.d/sabicash

/path/to/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 user user
    postrotate
        pm2 reload sabicash-backend
    endscript
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGIN` environment variable
   - Verify domain names match exactly
   - Ensure protocol (http/https) is correct

2. **Database Connection Issues**
   - Verify `DATABASE_URL` format
   - Check firewall settings
   - Ensure SSL settings match database configuration

3. **ThirdWeb Integration Issues**
   - Verify client ID and secret key
   - Check contract addresses
   - Ensure wallet has sufficient funds for gas

4. **API Integration Issues**
   - Test Sabi Ride API endpoints directly
   - Check authentication tokens
   - Verify API rate limits

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Configure CDN for static assets
   - Implement service worker for caching

2. **Backend**
   - Enable Redis caching
   - Optimize database queries
   - Configure connection pooling

3. **Database**
   - Add appropriate indexes
   - Configure query optimization
   - Set up read replicas if needed

## Security Checklist

- [ ] All environment variables are secure
- [ ] Database uses strong passwords
- [ ] SSL certificates are properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] Error messages don't expose sensitive data
- [ ] Backup and recovery procedures are tested
- [ ] Monitoring and alerting are configured

## Support and Monitoring

1. **Error Tracking**
   - Integrate Sentry or similar service
   - Set up error alerts
   - Configure error reporting

2. **Performance Monitoring**
   - Set up APM (Application Performance Monitoring)
   - Monitor API response times
   - Track user interactions

3. **Uptime Monitoring**
   - Configure external uptime checks
   - Set up alerts for downtime
   - Monitor SSL certificate expiration

## Rollback Plan

In case of deployment issues:

1. **Frontend Rollback**
   - Keep previous build artifacts
   - Use platform rollback features
   - Update DNS if needed

2. **Backend Rollback**
   - Use PM2 or container rollback
   - Restore database from backup if needed
   - Update load balancer configuration

3. **Database Rollback**
   - Have migration rollback scripts ready
   - Test backup restoration procedures
   - Document rollback steps

---

For additional support or questions about production deployment, please refer to the project documentation or contact the development team.