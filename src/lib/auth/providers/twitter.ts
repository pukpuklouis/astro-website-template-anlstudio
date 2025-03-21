// src/lib/auth/providers/twitter.ts
// Twitter OAuth 2.0 provider configuration for Better Auth

/**
 * Twitter OAuth 2.0 provider configuration
 * 
 * To use this provider:
 * 1. Create a Twitter Developer account and project at: https://developer.twitter.com/
 * 2. Create a new app in the Twitter Developer Portal
 * 3. Enable OAuth 2.0 and set the callback URL: https://your-domain.com/api/auth/callback/twitter
 * 4. Get your Client ID and Client Secret
 * 5. Ensure you have "offline.access" scope to get refresh tokens
 */

interface TwitterUserData {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

interface TwitterProfile {
  data?: TwitterUserData;
  id?: string;
  name?: string;
  username?: string;
  profile_image_url?: string;
}

export const twitterProvider = {
  id: 'twitter',
  type: 'oauth',
  // Replace with your Twitter OAuth credentials
  clientId: import.meta.env.TWITTER_CLIENT_ID || '',
  clientSecret: import.meta.env.TWITTER_CLIENT_SECRET || '',
  // Twitter OAuth 2.0 endpoints
  authorization: {
    url: 'https://twitter.com/i/oauth2/authorize',
    params: {
      // Scopes to request from Twitter
      scope: 'users.read tweet.read offline.access',
    }
  },
  token: {
    url: 'https://api.twitter.com/2/oauth2/token',
  },
  userinfo: {
    url: 'https://api.twitter.com/2/users/me',
    params: {
      'user.fields': 'id,name,username,profile_image_url',
    },
  },
  // Map Twitter profile to user data
  profile(profile: TwitterProfile) {
    const userData = profile.data || profile;
    
    return {
      id: userData.id,
      name: userData.name,
      // Twitter doesn't provide email by default
      email: null,
      // Use profile image URL if available
      image: userData.profile_image_url?.replace('_normal', ''),
      // Set username as additional data
      username: userData.username,
      // Twitter doesn't provide email verification status
      emailVerified: null,
    };
  },
};
