@ts-nocheck

// src/lib/auth.ts
// Better Auth configuration with Cloudflare D1

import { betterAuth } from 'better-auth';
import type { D1Database } from '@cloudflare/workers-types';
import type { User, Session } from '../types';
import { argon2id } from 'hash-wasm';

// Constants for security configuration
const SESSION_EXPIRY = '7d'; // 7 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Authentication providers configuration
 * Returns an array of configured authentication providers based on environment variables
 */
export function getActiveProviders() {
  const providers = [];

  // Email provider (always enabled)
  providers.push({
    id: 'email',
    type: 'email',
    // Custom email templates can be configured here
    server: {
      from: 'noreply@yourdomain.com',
      // You can customize email templates here
    }
  });

  // Add Google provider if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push({
      id: 'google',
      type: 'oauth',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
      // Additional OAuth configuration
      authorization: {
        params: {
          scope: 'openid email profile'
        }
      }
    });
  }

  // Add GitHub provider if credentials are available
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push({
      id: 'github',
      type: 'oauth',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        url: 'https://github.com/login/oauth/authorize',
        params: {
          scope: 'read:user user:email'
        }
      },
      token: 'https://github.com/login/oauth/access_token',
      userinfo: {
        url: 'https://api.github.com/user',
        // GitHub requires the Accept header
        async request({ tokens, provider }) {
          const response = await fetch(provider.userinfo.url, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              Accept: 'application/json'
            }
          });
          return await response.json();
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url
        };
      }
    });
  }

  return providers;
}

/**
 * Rate limiting helper functions
 */
export const rateLimiting = {
  /**
   * Check if a user is rate limited
   * @param db D1Database instance
   * @param identifier User identifier (email or IP)
   * @returns Boolean indicating if the user is rate limited
   */
  async isRateLimited(db: D1Database, identifier: string): Promise<boolean> {
    try {
      const attempts = await db.prepare(
        "SELECT COUNT(*) as count, MAX(timestamp) as last_attempt FROM login_attempts WHERE identifier = ? AND timestamp > ?"
      ).bind(
        identifier, 
        new Date(Date.now() - LOCKOUT_DURATION).toISOString()
      ).first();
      
      return attempts && attempts.count >= MAX_LOGIN_ATTEMPTS;
    } catch (error) {
      console.error(JSON.stringify({
        event: "rate_limit_check_failed",
        identifier,
        error: error.message,
        timestamp: new Date().toISOString()
      }));
      // Default to not rate limited if there's an error checking
      return false;
    }
  },

  /**
   * Record a failed login attempt
   * @param db D1Database instance
   * @param identifier User identifier (email or IP)
   */
  async recordFailedAttempt(db: D1Database, identifier: string): Promise<void> {
    try {
      await db.prepare(
        "INSERT INTO login_attempts (identifier, timestamp, success) VALUES (?, ?, ?)"
      ).bind(
        identifier,
        new Date().toISOString(),
        0
      ).run();
    } catch (error) {
      console.error(JSON.stringify({
        event: "record_attempt_failed",
        identifier,
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  },

  /**
   * Clear login attempts for a user after successful login
   * @param db D1Database instance
   * @param identifier User identifier (email or IP)
   */
  async clearAttempts(db: D1Database, identifier: string): Promise<void> {
    try {
      await db.prepare(
        "DELETE FROM login_attempts WHERE identifier = ?"
      ).bind(identifier).run();
    } catch (error) {
      console.error(JSON.stringify({
        event: "clear_attempts_failed",
        identifier,
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  }
};

/**
 * Password utilities
 */
export const passwordUtils = {
  /**
   * Hash a password using Argon2id
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return await argon2id.hash({
      password,
      salt: crypto.getRandomValues(new Uint8Array(16)),
      parallelism: 1,
      iterations: 3,
      memorySize: 4096,
      hashLength: 32,
      outputType: 'encoded'
    });
  },

  /**
   * Verify a password against a hash
   * @param password Plain text password
   * @param hash Hashed password
   * @returns Boolean indicating if the password is correct
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await argon2id.verify({
      password,
      hash
    });
  }
};

/**
 * Session management utilities
 */
export const sessionUtils = {
  /**
   * Generate a secure random token
   * @returns Secure random token as a hex string
   */
  generateSecureToken(): string {
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    return Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Store a session in the database
   * @param db D1Database instance
   * @param token Session token
   * @param userEmail User email
   * @param expiresIn Expiration time in seconds (default: 7 days)
   */
  async storeSession(
    db: D1Database, 
    token: string, 
    userEmail: string, 
    expiresIn: number = 60 * 60 * 24 * 7 // 7 days in seconds
  ): Promise<void> {
    const now = new Date();
    const expires = new Date(now.getTime() + expiresIn * 1000);
    
    try {
      await db.prepare(
        "INSERT INTO sessions (token, user_email, created_at, expires_at) VALUES (?, ?, ?, ?)"
      ).bind(
        token,
        userEmail,
        now.toISOString(),
        expires.toISOString()
      ).run();
    } catch (error) {
      console.error(JSON.stringify({
        event: "session_storage_failed",
        userEmail,
        error: error.message,
        timestamp: now.toISOString()
      }));
      throw new Error('Failed to store session');
    }
  },

  /**
   * Invalidate a session in the database
   * @param db D1Database instance
   * @param token Session token
   */
  async invalidateSession(db: D1Database, token: string): Promise<void> {
    try {
      await db.prepare(
        "DELETE FROM sessions WHERE token = ?"
      ).bind(token).run();
    } catch (error) {
      console.error(JSON.stringify({
        event: "session_invalidation_failed",
        token: token.substring(0, 8) + '...',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
      throw new Error('Failed to invalidate session');
    }
  },

  /**
   * Clean up expired sessions
   * @param db D1Database instance
   */
  async cleanupExpiredSessions(db: D1Database): Promise<void> {
    try {
      const result = await db.prepare(
        "DELETE FROM sessions WHERE expires_at < ?"
      ).bind(new Date().toISOString()).run();
      
      if (result.changes > 0) {
        console.log(JSON.stringify({
          event: "expired_sessions_cleanup",
          count: result.changes,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error(JSON.stringify({
        event: "sessions_cleanup_failed",
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  }
};

/**
 * User management utilities
 */
export const userUtils = {
  /**
   * Create a new user
   * @param db D1Database instance
   * @param email User email
   * @param password User password (will be hashed)
   * @param name User name
   * @returns Object with success status and user data or error
   */
  async createUser(
    db: D1Database, 
    email: string, 
    password: string, 
    name: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check if user already exists
      const existingUser = await db.prepare(
        "SELECT * FROM users WHERE email = ?"
      ).bind(email).first();
      
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }
      
      // Hash password
      const hashedPassword = await passwordUtils.hashPassword(password);
      const now = new Date().toISOString();
      const userId = crypto.randomUUID();
      
      // Use a transaction to ensure data consistency
      await db.batch([
        db.prepare(
          "INSERT INTO users (id, email, password, name, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(userId, email, hashedPassword, name, now),
        db.prepare(
          "INSERT INTO user_roles (user_id, role) VALUES (?, ?)"
        ).bind(userId, 'user')
      ]);
      
      const user: User = {
        id: userId,
        email,
        name,
        emailVerified: null,
        roles: ['user']
      };
      
      return { success: true, user };
    } catch (error) {
      console.error(JSON.stringify({
        event: "user_creation_failed",
        email,
        error: error.message,
        timestamp: new Date().toISOString()
      }));
      return { success: false, error: 'Failed to create user' };
    }
  },

  /**
   * Get a user by email
   * @param db D1Database instance
   * @param email User email
   * @returns User object or null
   */
  async getUserByEmail(db: D1Database, email: string): Promise<User | null> {
    try {
      const user = await db.prepare(
        "SELECT u.*, GROUP_CONCAT(ur.role) as roles FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.email = ? GROUP BY u.id"
      ).bind(email).first();
      
      if (!user) return null;
      
      // Parse roles from comma-separated string
      const roles = user.roles ? user.roles.split(',') : [];
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.email_verified ? new Date(user.email_verified) : null,
        roles
      };
    } catch (error) {
      console.error(JSON.stringify({
        event: "get_user_failed",
        email,
        error: error.message,
        timestamp: new Date().toISOString()
      }));
      return null;
    }
  },

  /**
   * Verify user credentials
   * @param db D1Database instance
   * @param email User email
   * @param password User password
   * @returns Object with success status and user data or error
   */
  async verifyUser(
    db: D1Database, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check rate limiting first
      if (await rateLimiting.isRateLimited(db, email)) {
        return { 
          success: false, 
          error: 'Too many login attempts. Please try again later.' 
        };
      }
      
      const userData = await db.prepare(
        "SELECT * FROM users WHERE email = ?"
      ).bind(email).first();
      
      if (!userData || !(await passwordUtils.verifyPassword(password, userData.password))) {
        // Record failed attempt
        await rateLimiting.recordFailedAttempt(db, email);
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Get user with roles
      const user = await this.getUserByEmail(db, email);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      // Clear failed attempts on successful login
      await rateLimiting.clearAttempts(db, email);
      
      return { success: true, user };
    } catch (error) {
      console.error(JSON.stringify({
        event: "user_verification_failed",
        email,
        error: error.message,
        timestamp: new Date().toISOString()
      }));
      return { success: false, error: 'Verification failed' };
    }
  }
};

/**
 * Better Auth configuration with Cloudflare D1
 * 
 * This function creates and configures the Better Auth instance with Cloudflare D1 as the database.
 * It includes configuration for authentication providers, session management, and custom pages.
 * 
 * @param env Cloudflare environment with D1 database and secrets
 * @returns Configured Better Auth instance
 */
export const createAuth = (env: Env) => {
  // Initialize Better Auth with D1 adapter
  const auth = betterAuth({
    adapter: {
      type: 'd1',
      database: env.DB,
      // Add custom D1 adapter options
      options: {
        // Enable transaction support for better data consistency
        useTransactions: true,
        // Custom table names if needed
        tables: {
          users: 'users',
          sessions: 'sessions',
          accounts: 'accounts',
          verification_tokens: 'verification_tokens'
        }
      }
    },
    secret: env.AUTH_SECRET,
    // Get active providers based on environment variables
    providers: getActiveProviders(),
    session: {
      // Session configuration
      expiresIn: SESSION_EXPIRY,
      // Use secure cookies in production
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
      }
    },
    pages: {
      // Custom pages (optional)
      signIn: '/login',
      signOut: '/',
      error: '/error',
      verifyRequest: '/verify'
    },
    // Custom callbacks
    callbacks: {
      // Customize JWT token contents
      jwt: async ({ token, user }) => {
        if (user) {
          token.userId = user.id;
          token.roles = user.roles || ['user'];
        }
        return token;
      },
      // Customize session contents
      session: async ({ session, token }) => {
        if (token) {
          session.user.id = token.userId;
          session.user.roles = token.roles;
        }
        return session;
      }
    },
    // Add custom events
    events: {
      async signIn({ user }) {
        console.log(JSON.stringify({
          event: "user_signed_in",
          userId: user.id,
          email: user.email,
          timestamp: new Date().toISOString()
        }));
        
        // Clean up expired sessions on sign in
        await sessionUtils.cleanupExpiredSessions(env.DB);
      },
      async signOut({ session }) {
        console.log(JSON.stringify({
          event: "user_signed_out",
          sessionToken: session?.sessionToken ? session.sessionToken.substring(0, 8) + '...' : 'unknown',
          timestamp: new Date().toISOString()
        }));
      },
      async createUser({ user }) {
        console.log(JSON.stringify({
          event: "user_created",
          userId: user.id,
          email: user.email,
          timestamp: new Date().toISOString()
        }));
      }
    }
  });

  return auth;
};

// Export utility functions for use in other parts of the application
export {
  rateLimiting,
  passwordUtils,
  sessionUtils,
  userUtils
};
