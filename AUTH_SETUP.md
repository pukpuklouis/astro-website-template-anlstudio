# Better Auth Setup Guide for Astro

This guide explains how to use the Better Auth authentication system integrated with Cloudflare D1 in this Astro website template.

## Overview

This template includes a complete authentication system with:

- User registration and login
- Protected routes
- Session management
- TypeScript type safety
- Cloudflare D1 database integration

## Setup Steps

### 1. Configure Cloudflare D1 Database

First, create a D1 database using Wrangler CLI:

```bash
wrangler d1 create auth_db
```

Update the `wrangler.jsonc` file with your database ID:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "auth_db",
    "database_id": "YOUR_DATABASE_ID_HERE"
  }
]
```

### 2. Set Environment Variables

The authentication system requires a secret key for secure operations. For security reasons, we don't store this directly in the `wrangler.jsonc` file.

#### For Local Development:

Create a `.dev.vars` file in your project root (this file should be in your .gitignore):

```bash
AUTH_SECRET=your-long-secure-random-string
```

#### For Production:

Set the secret using Wrangler CLI:

```bash
wrangler secret put AUTH_SECRET
```

For production, use a strong, randomly generated string at least 32 characters long.

### 3. Initialize Database Schema

The schema for the authentication system is defined in `schema.sql`. Apply it to your D1 database:

```bash
bun run db:setup
```

This command will create the necessary tables for users, accounts, sessions, and verification tokens.

### 4. Start Development Server

```bash
bun run dev
```

## Using Authentication Features

### Protected Routes

To create a protected route that requires authentication:

```astro
---
// src/pages/dashboard.astro
import Layout from '../layouts/Layout.astro';
import { UserProfile } from '../components/auth/UserProfile.astro';

// Redirect unauthenticated users to login
if (!Astro.locals.user) {
  return Astro.redirect('/login');
}

const user = Astro.locals.user;
---

<Layout title="Dashboard">
  <h1>Dashboard</h1>
  <p>Welcome, {user.name}!</p>
  <UserProfile />
</Layout>
```

### Access User Data

The current user is available in `Astro.locals.user`:

```astro
---
const { user } = Astro.locals;
---

{user ? (
  <p>Welcome back, {user.name}!</p>
) : (
  <p>Please <a href="/login">log in</a> to continue.</p>
)}
```

### Authentication Components

The template includes ready-to-use authentication components:

- `LoginForm.astro` - For user login
- `RegisterForm.astro` - For user registration
- `UserProfile.astro` - To display user information and logout button

Example usage:

```astro
---
import Layout from '../layouts/Layout.astro';
import LoginForm from '../components/auth/LoginForm.astro';
---

<Layout title="Login">
  <h1>Login</h1>
  <LoginForm />
  <p>Don't have an account? <a href="/register">Register</a></p>
</Layout>
```

### Sign Out

To sign out a user, submit a POST request to the auth API:

```html
<form action="/api/auth/signout" method="post">
  <button type="submit">Sign Out</button>
</form>
```

## Type Safety

The authentication system is fully typed with TypeScript. The main types are defined in `src/types.ts`:

- `User` - User data structure
- `Session` - Session data structure
- `Account` - Account data structure

Use these types when working with authentication data:

```typescript
import type { User } from '../types';

const user = Astro.locals.user as User;
```

## Customization

### Authentication Configuration

The authentication system is configured in `src/lib/auth.ts`. You can modify this file to:

- Change session duration
- Add additional authentication providers
- Customize user data handling

### Database Schema

If you need to modify the database schema, edit the `schema.sql` file and rerun the setup command.

## Deployment

When deploying to Cloudflare Pages, make sure to:

1. Set the `AUTH_SECRET` environment variable
2. Bind your D1 database to your application
3. Deploy your application with `wrangler deploy`

## Troubleshooting

- **Database Connection Issues**: Ensure your D1 database ID is correctly set in `wrangler.jsonc`
- **Authentication Errors**: Check that `AUTH_SECRET` is properly configured
- **Type Errors**: Make sure you're using the correct type imports from `src/types.ts`
