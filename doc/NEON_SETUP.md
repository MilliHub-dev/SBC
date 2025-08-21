# Neon Database Setup (Minimal, No PII)

This guide sets up a minimal Neon (PostgreSQL) database to store only:
- dApp sessions (hashed tokens)
- wallet connections
- tasks and task completions
- on-chain transaction logs

No user PII is stored. Users are referenced by `external_user_id` (opaque ID from Sabi Ride) or by `wallet_address`.

## 1) Provision Neon

1. Go to https://console.neon.tech
2. Create a new project (e.g., `sabicash-minimal`)
3. Create a database (e.g., `sabicash`)
4. Copy the connection string (e.g., `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`)

## 2) Apply Minimal Schema

Run this in your terminal:

```bash
# Replace with your Neon connection string
export NEON_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# Apply minimal schema (no PII)
psql "$NEON_URL" -f database/neon-minimal-schema.sql
```

## 3) Environment Variables (Frontend/Backend)

Create `.env` (or set in your hosting dashboard):

```bash
# API base (existing Sabi Ride)
VITE_API_BASE_URL=https://tmp.sabirideweb.com.ng/api/v1

# Neon (for backend services or serverless functions)
NEON_DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require

# Web3 / Contracts
VITE_SABI_CASH_CONTRACT=0x53308b85F0Fceadfc0a474eb0c196F0F02CD4983
VITE_DEFAULT_CHAIN_ID=1442
```

## 4) Privacy-by-Design

- Do not store names, emails, or phone numbers in Neon
- Use `external_user_id` from Sabi Ride API, not PII
- Hash session tokens before persisting (never store raw tokens)
- Avoid storing raw screenshots or PII-laden proofs in `verification_data`
- Restrict DB access with least-privilege roles

## 5) Tables Overview

- `sessions`: hashed session/refresh tokens, `external_user_id` or `wallet_address`
- `wallet_connections`: audit of wallet connections
- `tasks`: task definitions and rewards
- `task_completions`: user wallet/external id to task mapping and verification status
- `web3_transactions`: blockchain transactions and conversion logs

## 6) Verifying

```sql
-- Run in psql after applying schema
\dt
SELECT COUNT(*) FROM tasks;
```

If you see the tables listed, you’re ready to go.

## 7) Next Steps

- Wire your backend endpoints to use this DB for:
  - creating/updating `sessions` on login/logout
  - recording `wallet_connections` on connect/disconnect
  - managing `tasks` and `task_completions`
  - logging Web3 `web3_transactions` (point conversions, rewards)

- Keep user identity in Sabi Ride backend; treat Neon as a ledger for dApp ops only.
