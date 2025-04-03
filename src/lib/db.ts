import type { D1Database } from '@cloudflare/workers-types';

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
}

export class Database {
  constructor(private db: D1Database) {}

  // User operations
  async getUserById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first();
    return result ? this.mapUser(result) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();
    return result ? this.mapUser(result) : null;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        `INSERT INTO users (id, name, email, email_verified, image)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(id, user.name, user.email, user.emailVerified ? 1 : 0, user.image)
      .run();
    return this.getUserById(id) as Promise<User>;
  }

  // Account operations
  async getAccountByProvider(provider: string, providerAccountId: string): Promise<Account | null> {
    const result = await this.db
      .prepare('SELECT * FROM accounts WHERE provider = ? AND provider_account_id = ?')
      .bind(provider, providerAccountId)
      .first();
    return result ? this.mapAccount(result) : null;
  }

  async createAccount(account: Omit<Account, 'id'>): Promise<Account> {
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        `INSERT INTO accounts (id, user_id, provider, provider_account_id)
         VALUES (?, ?, ?, ?)`
      )
      .bind(id, account.userId, account.provider, account.providerAccountId)
      .run();
    return {
      id,
      ...account
    };
  }

  // Helper functions
  private mapUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      emailVerified: Boolean(row.email_verified),
      image: row.image,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapAccount(row: any): Account {
    return {
      id: row.id,
      userId: row.user_id,
      provider: row.provider,
      providerAccountId: row.provider_account_id
    };
  }
}
