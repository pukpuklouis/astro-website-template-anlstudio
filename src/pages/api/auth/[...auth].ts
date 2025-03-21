// src/pages/api/auth/[...auth].ts
// API routes for Better Auth

import type { APIRoute } from 'astro';
import { createAuth } from '../../../lib/auth';

/**
 * Required for dynamic API routes in SSG mode
 * This tells Astro that this route should be handled at runtime
 */
export function getStaticPaths() {
  return [];
}

/**
 * Handle all authentication API requests
 * 
 * This endpoint handles all authentication-related requests:
 * - /api/auth/signin
 * - /api/auth/signup
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/providers
 * - /api/auth/callback/:provider
 */
export const all: APIRoute = async ({ request, locals }) => {
  try {
    // Get the Cloudflare environment from locals
    const env = locals.runtime.env;
    
    // Create the auth instance with the environment
    const auth = createAuth(env);
    
    // Handle the authentication request
    return await auth.handler(request);
  } catch (error) {
    console.error('Auth API error:', error);
    
    // Return a friendly error response
    return new Response(
      JSON.stringify({ 
        error: 'Authentication failed',
        message: 'There was a problem processing your authentication request.'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
