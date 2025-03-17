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
    session: Session | null;
  }
}

// User and Session types
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

interface Session {
  user: User;
  expires: Date;
}

// Add D1Database type
type D1Database = import('@cloudflare/workers-types').D1Database;
