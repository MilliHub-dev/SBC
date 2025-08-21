-- Sabi Ride Neon Database Schema
-- This schema integrates the existing points system with Web3 functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extended for Web3 integration)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('passenger', 'driver', 'admin')),
    
    -- Points system
    total_points INTEGER DEFAULT 0,
    
    -- Web3 integration
    wallet_address VARCHAR(42) UNIQUE,
    sabi_cash_balance DECIMAL(20, 8) DEFAULT 0,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Driver specific fields
    license_number VARCHAR(50),
    vehicle_info JSONB,
    driver_status VARCHAR(20) CHECK (driver_status IN ('available', 'busy', 'offline'))
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    wallet_address VARCHAR(42),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips table (integrated with points system)
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES users(id),
    
    -- Trip details
    pickup_location JSONB NOT NULL, -- {lat, lng, address}
    destination_location JSONB NOT NULL, -- {lat, lng, address}
    distance_km DECIMAL(8, 2),
    duration_minutes INTEGER,
    fare_amount DECIMAL(10, 2),
    
    -- Trip status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    
    -- Points and rewards
    points_awarded INTEGER DEFAULT 0,
    sabi_cash_reward DECIMAL(20, 8) DEFAULT 0,
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    trip_data JSONB -- Additional trip information
);

-- Points history table
CREATE TABLE points_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id),
    task_id UUID REFERENCES tasks(id),
    
    -- Points details
    points_earned INTEGER NOT NULL,
    points_type VARCHAR(50) NOT NULL, -- 'trip', 'task', 'referral', 'bonus'
    description TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Tasks table for rewards system
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- 'referral', 'social_media', 'survey', 'promotion'
    category VARCHAR(50), -- 'follow', 'like', 'comment', 'share', 'refer'
    
    -- Reward configuration
    reward_points INTEGER DEFAULT 0,
    reward_sabi_cash DECIMAL(20, 8) DEFAULT 0,
    
    -- Task configuration
    max_completions INTEGER, -- NULL for unlimited
    completion_count INTEGER DEFAULT 0,
    verification_method VARCHAR(20) DEFAULT 'manual', -- 'manual', 'api', 'automatic'
    external_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    task_data JSONB
);

-- Task completions tracking
CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- Completion details
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verification_data JSONB, -- Screenshots, links, proof, etc.
    admin_notes TEXT,
    
    -- Rewards
    points_awarded INTEGER DEFAULT 0,
    sabi_cash_awarded DECIMAL(20, 8) DEFAULT 0,
    
    -- Timestamps
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent duplicate completions
    UNIQUE(user_id, task_id)
);

-- Web3 transactions table
CREATE TABLE web3_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Transaction details
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'buy_tokens', 'stake', 'claim_rewards', 'convert_points'
    
    -- Amounts
    eth_amount DECIMAL(20, 8),
    usdt_amount DECIMAL(20, 8),
    sabi_cash_amount DECIMAL(20, 8),
    points_converted INTEGER,
    
    -- Blockchain data
    block_number BIGINT,
    gas_used BIGINT,
    gas_price DECIMAL(20, 8),
    network VARCHAR(50) DEFAULT 'polygon-zkevm',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmations INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    transaction_data JSONB
);

-- Staking records table
CREATE TABLE staking_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Staking details
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('FREE', 'BASIC', 'PREMIUM')),
    staked_amount DECIMAL(20, 8) NOT NULL,
    daily_reward DECIMAL(20, 8) NOT NULL,
    duration_days INTEGER NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_claim_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Rewards tracking
    total_claimed DECIMAL(20, 8) DEFAULT 0,
    pending_rewards DECIMAL(20, 8) DEFAULT 0,
    
    -- Blockchain reference
    stake_transaction_hash VARCHAR(66),
    unstake_transaction_hash VARCHAR(66)
);

-- Admin actions log
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    target_user_id UUID REFERENCES users(id),
    
    -- Action details
    action_type VARCHAR(50) NOT NULL, -- 'send_reward', 'ban_user', 'verify_task', 'update_task'
    action_description TEXT NOT NULL,
    
    -- Data affected
    previous_data JSONB,
    new_data JSONB,
    
    -- Metadata
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

CREATE INDEX idx_trips_passenger ON trips(passenger_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_completed_at ON trips(completed_at);

CREATE INDEX idx_points_history_user ON points_history(user_id);
CREATE INDEX idx_points_history_created ON points_history(created_at);
CREATE INDEX idx_points_history_type ON points_history(points_type);

CREATE INDEX idx_tasks_active ON tasks(is_active);
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_created ON tasks(created_at);

CREATE INDEX idx_task_completions_user ON task_completions(user_id);
CREATE INDEX idx_task_completions_task ON task_completions(task_id);
CREATE INDEX idx_task_completions_status ON task_completions(status);

CREATE INDEX idx_web3_transactions_user ON web3_transactions(user_id);
CREATE INDEX idx_web3_transactions_hash ON web3_transactions(transaction_hash);
CREATE INDEX idx_web3_transactions_wallet ON web3_transactions(wallet_address);
CREATE INDEX idx_web3_transactions_type ON web3_transactions(transaction_type);

CREATE INDEX idx_staking_user ON staking_records(user_id);
CREATE INDEX idx_staking_active ON staking_records(is_active);
CREATE INDEX idx_staking_plan ON staking_records(plan_type);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_user_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (update with your actual data)
INSERT INTO users (email, password_hash, username, first_name, last_name, user_type, is_verified, wallet_address) 
VALUES 
    ('admin@sabiride.com', '$2b$12$default_hash_replace_this', 'admin', 'Admin', 'User', 'admin', TRUE, NULL);

-- Insert default tasks
INSERT INTO tasks (title, description, task_type, category, reward_points, reward_sabi_cash, verification_method, external_url) VALUES
    ('Follow Sabi Ride on X (Twitter)', 'Follow our official Twitter account @SabiRide for updates and announcements', 'social_media', 'follow', 7, 7.0, 'manual', 'https://twitter.com/sabiride'),
    ('Like Our Latest Post', 'Like our pinned post on Twitter to show your support', 'social_media', 'like', 7, 7.0, 'manual', 'https://twitter.com/sabiride'),
    ('Comment on Our Post', 'Leave a positive comment on our latest Twitter post', 'social_media', 'comment', 7, 7.0, 'manual', 'https://twitter.com/sabiride'),
    ('Refer a Friend', 'Invite friends to join Sabi Ride and earn rewards when they complete their first trip', 'referral', 'refer', 7, 7.0, 'api', NULL);

-- Sample analytics view
CREATE VIEW user_analytics AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.user_type,
    u.total_points,
    u.sabi_cash_balance,
    u.wallet_address,
    COUNT(DISTINCT t.id) as total_trips,
    COUNT(DISTINCT tc.id) as completed_tasks,
    COALESCE(SUM(wt.sabi_cash_amount), 0) as total_sabi_earned,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN trips t ON (u.id = t.passenger_id OR u.id = t.driver_id)
LEFT JOIN task_completions tc ON u.id = tc.user_id AND tc.status = 'verified'
LEFT JOIN web3_transactions wt ON u.id = wt.user_id
GROUP BY u.id, u.username, u.email, u.user_type, u.total_points, u.sabi_cash_balance, u.wallet_address, u.created_at, u.last_login;
