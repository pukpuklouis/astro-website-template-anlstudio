// src/middleware.ts
// Authentication middleware for Astro

import { defineMiddleware } from 'astro:middleware';
import { createAuth } from './lib/auth';

/**
 * Authentication middleware
 * 
 * This middleware runs on every request and:
 * 1. Gets the user's session from the request
 * 2. Adds the user and session to Astro.locals for use in all routes
 */
export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  try {
    // Get the Cloudflare environment from locals
    const env = locals.runtime.env;
    
    // Create the auth instance with the environment
    const auth = createAuth(env);
    
    // Get the session from the request
    const authSession = await auth.api.getSession({
      headers: request.headers
    });
    
    // Add user and session to locals for use in all routes
    if (authSession) {
      locals.user = authSession.user;
      locals.session = authSession;
    } else {
      locals.user = null;
      locals.session = null;
    }
    
    // Continue to the next middleware or route handler
    return next();
  } catch (error) {
    // Log the error but don't stop the request
    console.error('Auth middleware error:', error);
    
    // Set user and session to null if there's an error
    locals.user = null;
    locals.session = null;
    
    // Continue to the next middleware or route handler
    return next();
  }
});
