# Backend API Integration Guide

## Overview

This document outlines the backend API endpoints needed to integrate the Sabi Ride points system with the SabiCash Web3 platform. The APIs support both driver and passenger authentication and points management.

## Environment Setup

```bash
# Environment Variables (.env)
VITE_API_BASE_URL=http://localhost:8000/api
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
JWT_SECRET_KEY=your_jwt_secret_key_here
NEON_DB_CONNECTION_STRING=your_neon_connection_string
```

## Database Schema

Use the provided `database/neon-schema.sql` file to set up your Neon database with all required tables for users, points, tasks, transactions, and Web3 integration.

## Required API Endpoints

### 1. Authentication Endpoints

#### Login Driver
```http
POST /api/auth/login/driver/
Content-Type: application/json

{
  "email": "driver@sabiride.com",
  "password": "password123",
  "walletAddress": "0x1234...5678" // Optional
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid-here",
    "email": "driver@sabiride.com",
    "username": "driver001",
    "first_name": "John",
    "last_name": "Driver",
    "user_type": "driver",
    "wallet_address": "0x1234...5678",
    "is_verified": true,
    "driver_status": "available"
  },
  "points": 2500,
  "sabi_cash_balance": 125.50
}
```

#### Login Passenger
```http
POST /api/auth/login/passenger/
Content-Type: application/json

{
  "email": "passenger@sabiride.com",
  "password": "password123",
  "walletAddress": "0x1234...5678" // Optional
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid-here",
    "email": "passenger@sabiride.com",
    "username": "passenger001",
    "first_name": "Jane",
    "last_name": "Passenger",
    "user_type": "passenger",
    "wallet_address": "0x1234...5678",
    "is_verified": true
  },
  "points": 1250,
  "sabi_cash_balance": 45.75
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2. User Management Endpoints

#### Get User Profile
```http
GET /api/users/profile/
Authorization: Bearer {token}

Response:
{
  "id": "uuid-here",
  "email": "user@sabiride.com",
  "username": "user001",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "passenger",
  "total_points": 1250,
  "sabi_cash_balance": 45.75,
  "wallet_address": "0x1234...5678",
  "is_verified": true,
  "created_at": "2025-01-01T00:00:00Z",
  "last_login": "2025-01-28T12:00:00Z"
}
```

#### Update Wallet Address
```http
PUT /api/users/update-wallet/
Authorization: Bearer {token}
Content-Type: application/json

{
  "wallet_address": "0x1234...5678"
}

Response:
{
  "success": true,
  "message": "Wallet address updated successfully",
  "wallet_address": "0x1234...5678"
}
```

### 3. Points System Endpoints

#### Get Points Balance
```http
GET /api/points/balance/
Authorization: Bearer {token}

Response:
{
  "total_points": 1250,
  "points_history_count": 25,
  "last_earned": "2025-01-28T10:30:00Z",
  "conversion_rate": 0.5,
  "min_conversion": 500
}
```

#### Get Points History
```http
GET /api/points/history/
Authorization: Bearer {token}
Query Parameters:
- limit: number (default: 50)
- offset: number (default: 0)
- type: string (optional: 'trip', 'task', 'referral', 'bonus')

Response:
{
  "count": 100,
  "next": "http://api/points/history/?offset=50",
  "previous": null,
  "results": [
    {
      "id": "uuid-here",
      "points_earned": 10,
      "points_type": "trip",
      "description": "Trip completed: 10km ride",
      "created_at": "2025-01-28T10:30:00Z",
      "trip_id": "trip-uuid",
      "metadata": {
        "distance_km": 10.5,
        "fare_amount": 25.00
      }
    }
  ]
}
```

#### Convert Points to SabiCash
```http
POST /api/points/convert/
Authorization: Bearer {token}
Content-Type: application/json

{
  "points": 1000,
  "wallet_address": "0x1234...5678"
}

Response:
{
  "success": true,
  "points_converted": 1000,
  "sabi_cash_amount": 500.0,
  "new_point_balance": 250,
  "transaction_id": "uuid-here",
  "message": "Points converted successfully"
}
```

#### Validate Point Conversion
```http
POST /api/points/validate-conversion/
Authorization: Bearer {token}
Content-Type: application/json

{
  "points": 1000,
  "wallet_address": "0x1234...5678"
}

Response:
{
  "valid": true,
  "sabi_cash_amount": 500.0,
  "current_points": 1250,
  "remaining_points": 250,
  "conversion_rate": 0.5,
  "message": "Conversion is valid"
}
```

### 4. Trip Management Endpoints

#### Complete Trip (Awards Points)
```http
POST /api/trips/{trip_id}/complete/
Authorization: Bearer {token}
Content-Type: application/json

{
  "distance_km": 10.5,
  "duration_minutes": 25,
  "fare_amount": 30.00
}

Response:
{
  "success": true,
  "trip_id": "uuid-here",
  "points_earned": 10,
  "total_points": 1260,
  "sabi_cash_reward": 0.0,
  "message": "Trip completed successfully"
}
```

### 5. Tasks & Rewards Endpoints

#### Get Available Tasks
```http
GET /api/tasks/
Authorization: Bearer {token}
Query Parameters:
- active_only: boolean (default: true)
- category: string (optional)

Response:
{
  "count": 4,
  "results": [
    {
      "id": "uuid-here",
      "title": "Follow Sabi Ride on X (Twitter)",
      "description": "Follow our official Twitter account @SabiRide",
      "task_type": "social_media",
      "category": "follow",
      "reward_points": 7,
      "reward_sabi_cash": 7.0,
      "max_completions": null,
      "completion_count": 156,
      "external_url": "https://twitter.com/sabiride",
      "verification_method": "manual",
      "is_active": true,
      "user_completed": false,
      "expires_at": null
    }
  ]
}
```

#### Complete Task
```http
POST /api/tasks/{task_id}/complete/
Authorization: Bearer {token}
Content-Type: application/json

{
  "verification_data": {
    "screenshot_url": "https://example.com/proof.jpg",
    "social_username": "@myusername",
    "proof_text": "I followed @SabiRide on Twitter"
  }
}

Response:
{
  "success": true,
  "task_id": "uuid-here",
  "status": "pending",
  "points_awarded": 0,
  "sabi_cash_awarded": 0.0,
  "message": "Task submitted for verification"
}
```

#### Get User Tasks
```http
GET /api/tasks/user/
Authorization: Bearer {token}

Response:
{
  "completed_tasks": [
    {
      "task_id": "uuid-here",
      "task_title": "Follow Sabi Ride on X",
      "status": "verified",
      "points_awarded": 7,
      "sabi_cash_awarded": 7.0,
      "completed_at": "2025-01-28T10:00:00Z",
      "verified_at": "2025-01-28T11:00:00Z"
    }
  ],
  "pending_tasks": [],
  "total_task_rewards": {
    "points": 28,
    "sabi_cash": 28.0
  }
}
```

### 6. Web3 Integration Endpoints

#### Log Transaction
```http
POST /api/web3/log-transaction/
Authorization: Bearer {token}
Content-Type: application/json

{
  "transaction_hash": "0xabcd...1234",
  "wallet_address": "0x1234...5678",
  "transaction_type": "convert_points",
  "sabi_cash_amount": 500.0,
  "points_converted": 1000,
  "network": "polygon-zkevm"
}

Response:
{
  "success": true,
  "transaction_id": "uuid-here",
  "status": "pending",
  "message": "Transaction logged successfully"
}
```

#### Verify Transaction
```http
POST /api/web3/verify-transaction/
Authorization: Bearer {token}
Content-Type: application/json

{
  "transaction_hash": "0xabcd...1234",
  "wallet_address": "0x1234...5678"
}

Response:
{
  "success": true,
  "transaction_verified": true,
  "confirmations": 12,
  "status": "confirmed",
  "block_number": 1234567
}
```

### 7. Admin Endpoints

#### Get Analytics
```http
GET /api/admin/analytics/
Authorization: Bearer {admin_token}

Response:
{
  "total_users": 1250,
  "active_users_24h": 150,
  "total_points_distributed": 125000,
  "total_sabi_cash_minted": 62500.0,
  "completed_tasks": 3450,
  "recent_transactions": [...]
}
```

#### Send Reward
```http
POST /api/admin/send-reward/
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "user_id": "uuid-here",
  "amount": 100,
  "type": "points", // or "sabi_cash"
  "reason": "Bonus reward for excellent service"
}

Response:
{
  "success": true,
  "reward_sent": true,
  "user_id": "uuid-here",
  "amount": 100,
  "type": "points",
  "new_balance": 1350
}
```

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "details": {
    "field": "email",
    "code": "INVALID_FORMAT"
  }
}
```

## Common Error Codes

- `INVALID_CREDENTIALS`: Wrong email/password
- `INSUFFICIENT_POINTS`: Not enough points for conversion
- `WALLET_NOT_CONNECTED`: Wallet address required
- `TASK_ALREADY_COMPLETED`: User already completed this task
- `INVALID_TRANSACTION`: Transaction hash not found or invalid
- `UNAUTHORIZED`: Invalid or expired token
- `RATE_LIMITED`: Too many requests

## Authentication

Use JWT tokens for authentication. Include in header:
```
Authorization: Bearer {your_jwt_token}
```

Tokens expire after 24 hours. Use refresh token to get new access token.

## Rate Limiting

- Authentication: 5 requests per minute
- Points conversion: 3 requests per hour
- Task completion: 10 requests per hour
- General API: 100 requests per minute

## Testing

Use the demo credentials in development:
- **Passenger**: passenger@sabiride.com / demo123
- **Driver**: driver@sabiride.com / demo123

## Implementation Notes

1. **Database**: Use the provided Neon schema
2. **Authentication**: Implement JWT-based auth with refresh tokens
3. **Points**: Award 1 point per kilometer traveled
4. **Tasks**: Manual verification initially, API verification later
5. **Web3**: Log all blockchain transactions for audit
6. **Security**: Validate all inputs, use rate limiting
7. **Monitoring**: Log all API calls for analytics

This API structure supports the complete integration between the existing Sabi Ride points system and the new SabiCash Web3 platform.
