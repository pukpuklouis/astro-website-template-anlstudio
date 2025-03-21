# Social Authentication Setup Guide

This guide explains how to set up social authentication providers (Google, GitHub, Facebook, Twitter) in your Astro website template with Better Auth.

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Provider Setup](#provider-setup)
   - [Google](#google)
   - [GitHub](#github)
   - [Facebook](#facebook)
   - [Twitter](#twitter)
4. [Testing Your Configuration](#testing-your-configuration)
5. [Customizing the UI](#customizing-the-ui)

## Overview

The template includes modular support for multiple social authentication providers. You can enable any combination of these providers by configuring their respective credentials in your environment variables.

## Environment Variables

To use social authentication, you need to set the appropriate environment variables:

1. For development, add them to `.dev.vars`
2. For production, add them to your Cloudflare environment variables

Here's an example of how to configure the environment variables:

```
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Twitter OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

## Provider Setup

### Google

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set the application type to "Web application"
6. Add authorized JavaScript origins:
   - For development: `http://localhost:4321` (or your local development URL)
   - For production: `https://your-domain.com`
7. Add authorized redirect URIs:
   - For development: `http://localhost:4321/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`
8. Copy the Client ID and Client Secret to your environment variables

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: Your app name
   - Homepage URL: Your website URL (e.g., `http://localhost:4321` for development)
   - Authorization callback URL: `http://localhost:4321/api/auth/callback/github` (for development)
4. Register the application
5. Generate a new client secret
6. Copy the Client ID and Client Secret to your environment variables

### Facebook

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app (choose "Consumer" or "Business" type)
3. Add the "Facebook Login" product to your app
4. In the Facebook Login settings, add the following OAuth Redirect URI:
   - For development: `http://localhost:4321/api/auth/callback/facebook`
   - For production: `https://your-domain.com/api/auth/callback/facebook`
5. In Basic Settings, copy the App ID and App Secret to your environment variables

### Twitter

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. In the app settings, enable OAuth 2.0
4. Set the redirect URI:
   - For development: `http://localhost:4321/api/auth/callback/twitter`
   - For production: `https://your-domain.com/api/auth/callback/twitter`
5. Under "App permissions", ensure you have "Read" permissions at minimum
6. Copy the Client ID and Client Secret to your environment variables

## Testing Your Configuration

After setting up your providers and environment variables:

1. Restart your development server: `bun run dev`
2. Visit your login page
3. You should see buttons for each configured provider
4. Test the authentication flow by clicking on a provider button

## Customizing the UI

The login form is located at `src/components/auth/LoginForm.astro`. You can customize the appearance of the social login buttons by editing this file.

To add or remove social login buttons, update the form to include buttons for the providers you've configured.

Example button for Google login:

```html
<button type="submit" name="provider" value="google" class="btn btn-google">
  Sign in with Google
</button>
```
