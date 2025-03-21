/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly AUTH_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

declare namespace App {
  interface Locals extends Runtime {
    user: User | null;
    session: BetterAuthSession | null;
  }
}

// User type
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Better Auth session type
interface BetterAuthSession {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: User;
}

// Add D1Database type
type D1Database = import('@cloudflare/workers-types').D1Database;
