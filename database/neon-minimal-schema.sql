-- Neon Minimal Schema (No PII)
-- Purpose: Store sessions, wallet connections, tasks, task completions, and web3 transactions
-- Notes:
-- - No user PII is stored. Identify users only by opaque external IDs or wallet addresses
-- - Prefer hashing any bearer tokens before storing

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Opaque user identity coming from Sabi Ride backend or auth provider
-- Never store email, name, phone, etc.
-- You can use one or both identifiers depending on your flow
-- external_user_id: immutable unique id from Sabi Ride API (string/uuid)
-- wallet_address: Solana address used in dApp

-- Sessions for dApp (frontend) login via Sabi Ride auth
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_user_id TEXT, -- opaque id from Sabi Ride (no PII)
    wallet_address VARCHAR(255),
    session_token_hash TEXT NOT NULL, -- store a hash of token, not raw token
    refresh_token_hash TEXT,          -- optional, hashed
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sessions_ext_or_wallet_chk CHECK (external_user_id IS NOT NULL OR wallet_address IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_sessions_ext_user ON sessions(external_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_wallet ON sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Wallet connection events (auditing, last seen wallet per external user)
CREATE TABLE IF NOT EXISTS wallet_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_user_id TEXT,
    wallet_address VARCHAR(44) NOT NULL,
    provider TEXT,                      -- e.g. phantom, solflare
    chain_id TEXT,                      -- e.g. solana-mainnet
    is_current BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disconnected_at TIMESTAMPTZ,
    metadata JSONB,
    CONSTRAINT wallet_conn_ext_or_wallet_chk CHECK (external_user_id IS NOT NULL OR wallet_address IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_wallet_conn_ext_user ON wallet_connections(external_user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_conn_wallet ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_conn_current ON wallet_connections(is_current);

-- Public tasks configuration (no PII)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL,            -- e.g. social_follow, social_like, referral
    category TEXT,                      -- optional category
    reward_points INTEGER DEFAULT 0,
    reward_sabi_cash NUMERIC(38, 18) DEFAULT 0,
    max_completions INTEGER,            -- null = unlimited
    completion_count INTEGER DEFAULT 0,
    verification_method TEXT DEFAULT 'manual', -- manual | api | automatic
    external_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    task_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);

-- Task completions by an external user or a wallet (no PII)
CREATE TABLE IF NOT EXISTS task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_user_id TEXT,
    wallet_address VARCHAR(255),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
    verification_data JSONB,            -- links, screenshots, proofs (no PII)
    admin_notes TEXT,
    points_awarded INTEGER DEFAULT 0,
    sabi_cash_awarded NUMERIC(38, 18) DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    UNIQUE (COALESCE(external_user_id, ''), COALESCE(wallet_address, ''), task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_comp_ext_user ON task_completions(external_user_id);
CREATE INDEX IF NOT EXISTS idx_task_comp_wallet ON task_completions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_task_comp_task ON task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comp_status ON task_completions(status);

-- On-chain transaction log (no PII)
CREATE TABLE IF NOT EXISTS web3_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_user_id TEXT,
    wallet_address VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255) UNIQUE NOT NULL,
    transaction_type TEXT NOT NULL,     -- buy_tokens | stake | claim_rewards | convert_points | admin_reward
    chain_id VARCHAR(20) DEFAULT 'solana-devnet',
    network TEXT DEFAULT 'solana-devnet',
    
    -- amounts
    sol_amount NUMERIC(38, 18),
    usdt_amount NUMERIC(38, 18),
    sabi_cash_amount NUMERIC(38, 18),
    points_converted INTEGER,
    
    -- blockchain details
    block_number BIGINT,
    gas_used BIGINT,
    gas_price NUMERIC(38, 18),
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    transaction_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_tx_ext_user ON web3_transactions(external_user_id);
CREATE INDEX IF NOT EXISTS idx_tx_wallet ON web3_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_tx_type ON web3_transactions(transaction_type);

-- Helper trigger to auto-update updated_at columns where present
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER touch_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Recommended privacy practices:
-- 1) Hash bearer tokens before storage (sessions.*_hash columns)
-- 2) Use opaque external_user_id from Sabi Ride, never emails or names
-- 3) Avoid storing raw proofs that may contain PII in verification_data
-- 4) Apply row-level encryption at application layer if needed
-- 5) Configure strict DB roles and least-privilege access


