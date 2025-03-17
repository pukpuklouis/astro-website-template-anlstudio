// src/types.ts
// Type definitions for the authentication system

/**
 * User type definition
 */
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  // Add any additional user fields you need
  roles?: string[]; // Optional: for role-based access control
}

/**
 * Session type definition
 */
export interface Session {
  user: User;
  expires: Date;
}

/**
 * Account type definition (for OAuth providers)
 */
export interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
}
