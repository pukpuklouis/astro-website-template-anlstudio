@ts-nocheck

// src/lib/auth.ts
// Better Auth configuration with Cloudflare D1

import { betterAuth } from 'better-auth';
import type { D1Database } from '@cloudflare/workers-types';
import type { User } from '../types';
import { getActiveProviders } from './auth/providers';



/**
 * Better Auth configuration with Cloudflare D1
 * 
 * This file sets up the authentication system using Better Auth with Cloudflare D1 as the database.
 * You can configure various authentication providers here.
 */
export const createAuth = (env: Env) => {
  // Initialize Better Auth with D1 adapter
  return betterAuth({
    adapter: {
      type: 'd1',
      database: env.DB
    },
    secret: env.AUTH_SECRET,
    // Get active providers based on environment variables
    providers: getActiveProviders(),
    session: {
      // Session configuration
      expiresIn: '7d' // 7 days
    },
    pages: {
      // Custom pages (optional)
      signIn: '/login',
      signOut: '/',
      error: '/error',
      verifyRequest: '/verify'
    }
  });
};

// We don't need to export a pre-initialized auth instance since we're creating it in each context
// with the correct environment variables. The middleware and API routes are already correctly
// creating their own instances.
// 
// If you need to use auth in other parts of your application, create a new instance using createAuth
// and the appropriate environment.
