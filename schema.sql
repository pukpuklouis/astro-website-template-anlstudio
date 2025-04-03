-- Better Auth Schema for Cloudflare D1
-- This schema creates the necessary tables for authentication

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT, -- Hashed password for email/password authentication
  email_verified INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  token TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verification tokens table (for email verification)
CREATE TABLE IF NOT EXISTS verification_tokens (
  token TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login attempts table (for rate limiting)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL, -- Email or IP address
  timestamp TIMESTAMP NOT NULL,
  success INTEGER DEFAULT 0, -- 0 for failed, 1 for successful
  ip_address TEXT, -- Optional: store IP for additional security analysis
  user_agent TEXT -- Optional: store user agent for additional security analysis
);

-- User roles table (for role-based access control)
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL, -- e.g., 'user', 'admin', 'editor'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_provider_provider_account_id ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier);
CREATE INDEX IF NOT EXISTS idx_login_attempts_timestamp ON login_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
