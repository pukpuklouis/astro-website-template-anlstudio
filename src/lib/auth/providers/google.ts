// src/lib/auth/providers/google.ts
// Google OAuth provider configuration for Better Auth

/**
 * Google OAuth provider configuration
 * 
 * To use this provider:
 * 1. Create a project in Google Cloud Console: https://console.cloud.google.com/
 * 2. Enable the Google+ API
 * 3. Create OAuth credentials (Client ID and Client Secret)
 * 4. Add authorized redirect URIs: https://your-domain.com/api/auth/callback/google
 */
interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
  email_verified: boolean;
}

interface GoogleProvider {
  id: string;
  type: string;
  clientId: string;
  clientSecret: string;
  wellKnown: string;
  authorization: {
    params: {
      scope: string;
      prompt: string;
    }
  };
  profile(profile: GoogleProfile): {
    id: string;
    name: string;
    email: string;
    image: string;
    emailVerified: boolean;
  };
}

export const googleProvider: GoogleProvider = {
  id: 'google',
  type: 'oauth',
  // Replace with your Google OAuth credentials
  clientId: import.meta.env.GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET || '',
  // Google's OpenID Connect discovery document
  wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
  // Authorization parameters
  authorization: {
    params: {
      // Scopes to request from Google
      scope: 'openid email profile',
      // Prompt user to select account (optional)
      prompt: 'select_account',
    }
  },
  // Optional: Custom profile mapping
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      // Additional fields from Google profile
      emailVerified: profile.email_verified,
    };
  }
};
