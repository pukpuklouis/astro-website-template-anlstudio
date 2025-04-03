import type { APIRoute } from 'astro';
import { Database } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = new Database(locals.runtime.env.DB);
    const testUser = await db.createUser({
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      image: null
    });

    return new Response(JSON.stringify({ success: true, user: testUser }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: unknown) {
    console.error('Database test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
