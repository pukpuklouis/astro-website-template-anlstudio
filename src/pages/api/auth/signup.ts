import type { APIRoute } from 'astro';
import { userUtils, sessionUtils } from '../../../lib/auth';

// Disable prerendering for this API route
export const prerender = false;

interface SignupBody {
  email: string;
  password: string;
  name: string;
}

export const post: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as SignupBody;
    const { email, password, name } = body;

    // Input validation
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          message: 'Email, password, and name are required.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the Cloudflare environment
    const env = locals.runtime.env;

    // Create user
    const result = await userUtils.createUser(env.DB, email, password, name);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Registration failed',
          message: result.error || 'Failed to create user account.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate session token
    const token = sessionUtils.generateSecureToken();
    
    // Store session
    await sessionUtils.storeSession(env.DB, token, email);

    return new Response(
      JSON.stringify({
        success: true,
        user: result.user,
        token
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`
        }
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred during registration.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
