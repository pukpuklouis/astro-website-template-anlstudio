// src/lib/auth/providers/github.ts
// GitHub OAuth provider configuration for Better Auth

/**
 * GitHub OAuth provider configuration
 * 
 * To use this provider:
 * 1. Register a new OAuth application at: https://github.com/settings/applications/new
 * 2. Set homepage URL to your website URL
 * 3. Set authorization callback URL to: https://your-domain.com/api/auth/callback/github
 * 4. After creating the app, generate a client secret
 */

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface GitHubProfile {
  id: number;
  name: string;
  login: string;
  email?: string;
  avatar_url: string;
  email_verified?: boolean;
}

interface TokensType {
  access_token: string;
  [key: string]: any;
}

interface ProviderType {
  userinfo?: {
    url: string;
  };
  [key: string]: any;
}

export const githubProvider = {
  id: 'github',
  type: 'oauth',
  // Replace with your GitHub OAuth credentials
  clientId: import.meta.env.GITHUB_CLIENT_ID || '',
  clientSecret: import.meta.env.GITHUB_CLIENT_SECRET || '',
  // GitHub OAuth endpoints
  authorization: {
    url: 'https://github.com/login/oauth/authorize',
    params: {
      // Scopes to request from GitHub
      scope: 'read:user user:email',
    }
  },
  token: {
    url: 'https://github.com/login/oauth/access_token',
  },
  userinfo: {
    url: 'https://api.github.com/user',
    // Add email scope to get verified email
    async request({ tokens, provider }: { tokens: TokensType; provider: ProviderType }) {
      // Get user profile
      const userResponse = await fetch(provider.userinfo?.url as string, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'User-Agent': 'better-auth',
        },
      });
      const profile = await userResponse.json() as GitHubProfile;

      // Get user emails (since email might be private)
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'User-Agent': 'better-auth',
        },
      });
      const emails = await emailsResponse.json() as GitHubEmail[];
      
      // Find primary and verified email
      const primaryEmail = emails.find(
        (email: GitHubEmail) => email.primary && email.verified
      ) || emails.find((email: GitHubEmail) => email.verified);
      
      if (primaryEmail) {
        profile.email = primaryEmail.email;
        profile.email_verified = primaryEmail.verified;
      }
      
      return profile;
    },
  },
  // Map GitHub profile to user data
  profile(profile: GitHubProfile) {
    return {
      id: profile.id.toString(),
      name: profile.name || profile.login,
      email: profile.email,
      image: profile.avatar_url,
      emailVerified: profile.email_verified,
    };
  },
};
