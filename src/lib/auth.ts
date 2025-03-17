// src/lib/auth.ts
// Better Auth configuration with Cloudflare D1

import { BetterAuth } from 'better-auth';
import type { D1Database } from '@cloudflare/workers-types';
import type { User } from '../types';

/**
 * Better Auth configuration with Cloudflare D1
 * 
 * This file sets up the authentication system using Better Auth with Cloudflare D1 as the database.
 * You can configure various authentication providers here.
 */
export const createAuth = (env: Env) => {
  // Initialize Better Auth with D1 adapter
  return new BetterAuth({
    adapter: {
      type: 'd1',
      database: env.DB
    },
    secret: env.AUTH_SECRET,
    // Configure your authentication providers here
    providers: [
      // Example Email Provider (uncomment and configure as needed)
      /*
      {
        id: 'email',
        type: 'email',
        // Configure SMTP settings for email sending
        server: {
          host: 'smtp.example.com',
          port: 587,
          auth: {
            user: 'your-email@example.com',
            pass: 'your-password'
          }
        },
        from: 'noreply@yourdomain.com'
      },
      */
      
      // Example OAuth Provider (uncomment and configure as needed)
      /*
      {
        id: 'google',
        type: 'oauth',
        clientId: 'your-client-id',
        clientSecret: 'your-client-secret',
        wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
        authorization: {
          params: {
            scope: 'openid email profile'
          }
        }
      },
      */
    ],
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
