// src/lib/auth/providers/index.ts
// Export all OAuth providers for Better Auth

import { googleProvider } from './google';
import { githubProvider } from './github';
import { facebookProvider } from './facebook';
import { twitterProvider } from './twitter';

// Export all providers
export {
  googleProvider,
  githubProvider,
  facebookProvider,
  twitterProvider
};

// Export provider types
export type SocialProvider = 
  | typeof googleProvider
  | typeof githubProvider
  | typeof facebookProvider
  | typeof twitterProvider;

// Helper function to get active providers based on environment variables
export function getActiveProviders() {
  const providers = [];
  
  // Add Google provider if credentials are available
  if (import.meta.env.GOOGLE_CLIENT_ID && import.meta.env.GOOGLE_CLIENT_SECRET) {
    providers.push(googleProvider);
  }
  
  // Add GitHub provider if credentials are available
  if (import.meta.env.GITHUB_CLIENT_ID && import.meta.env.GITHUB_CLIENT_SECRET) {
    providers.push(githubProvider);
  }
  
  // Add Facebook provider if credentials are available
  if (import.meta.env.FACEBOOK_CLIENT_ID && import.meta.env.FACEBOOK_CLIENT_SECRET) {
    providers.push(facebookProvider);
  }
  
  // Add Twitter provider if credentials are available
  if (import.meta.env.TWITTER_CLIENT_ID && import.meta.env.TWITTER_CLIENT_SECRET) {
    providers.push(twitterProvider);
  }
  
  return providers;
}
