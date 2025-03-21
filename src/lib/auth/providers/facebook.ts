// src/lib/auth/providers/facebook.ts
// Facebook OAuth provider configuration for Better Auth

/**
 * Facebook OAuth provider configuration
 * 
 * To use this provider:
 * 1. Create a Facebook app at: https://developers.facebook.com/apps/
 * 2. Add Facebook Login product to your app
 * 3. Configure Valid OAuth Redirect URIs: https://your-domain.com/api/auth/callback/facebook
 * 4. Get your App ID and App Secret from the app dashboard
 */

interface FacebookProfile {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    }
  };
}

export const facebookProvider = {
  id: 'facebook',
  type: 'oauth',
  // Replace with your Facebook OAuth credentials
  clientId: import.meta.env.FACEBOOK_CLIENT_ID || '',
  clientSecret: import.meta.env.FACEBOOK_CLIENT_SECRET || '',
  // Facebook OAuth endpoints
  authorization: {
    url: 'https://www.facebook.com/v18.0/dialog/oauth',
    params: {
      // Scopes to request from Facebook
      scope: 'email,public_profile',
    }
  },
  token: {
    url: 'https://graph.facebook.com/v18.0/oauth/access_token',
  },
  userinfo: {
    url: 'https://graph.facebook.com/me',
    params: {
      fields: 'id,name,email,picture.type(large)',
    },
  },
  // Map Facebook profile to user data
  profile(profile: FacebookProfile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      // Extract image URL from picture object
      image: profile.picture?.data?.url,
      // Facebook doesn't explicitly provide email verification status
      // Most Facebook emails are verified, but this is not guaranteed
      emailVerified: true,
    };
  },
};
