#!/usr/bin/env node

/**
 * Better Auth Verification Script
 * 
 * This script verifies that the Better Auth setup is working correctly.
 * It checks for necessary files, configuration, and database setup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Files to check
const requiredFiles = [
  { path: 'schema.sql', description: 'Database schema' },
  { path: 'wrangler.jsonc', description: 'Cloudflare configuration' },
  { path: 'src/lib/auth.ts', description: 'Auth configuration' },
  { path: 'src/middleware.ts', description: 'Auth middleware' },
  { path: 'src/pages/api/auth/[...auth].ts', description: 'Auth API routes' },
  { path: 'src/components/auth/LoginForm.astro', description: 'Login component' },
  { path: 'src/components/auth/RegisterForm.astro', description: 'Registration component' },
  { path: 'src/components/auth/UserProfile.astro', description: 'User profile component' }
];

console.log('🔍 Verifying Better Auth setup...');
console.log('');

// Check required files
let missingFiles = false;
console.log('Checking required files:');
for (const file of requiredFiles) {
  const filePath = path.join(rootDir, file.path);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file.path} (${file.description})`);
  } else {
    console.log(`❌ ${file.path} (${file.description}) - MISSING`);
    missingFiles = true;
  }
}

// Check wrangler configuration
console.log('');
console.log('Checking wrangler.jsonc configuration:');
try {
  const wranglerPath = path.join(rootDir, 'wrangler.jsonc');
  const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
  
  // Check for D1 database configuration
  if (wranglerContent.includes('"d1_databases"') && wranglerContent.includes('"binding": "DB"')) {
    console.log('✅ D1 database configuration found');
  } else {
    console.log('❌ D1 database configuration missing or incorrect');
  }
  
  // Check for AUTH_SECRET
  if (wranglerContent.includes('"AUTH_SECRET"')) {
    console.log('✅ AUTH_SECRET environment variable found');
  } else {
    console.log('❌ AUTH_SECRET environment variable missing');
  }
} catch (error) {
  console.log('❌ Error reading wrangler.jsonc:', error.message);
}

// Final summary
console.log('');
if (missingFiles) {
  console.log('⚠️ Some required files are missing. Please check the setup guide.');
} else {
  console.log('✅ All required files are present.');
}

console.log('');
console.log('Next steps:');
console.log('1. Run "bun run db:setup" to initialize the database');
console.log('2. Run "bun run dev" to start the development server');
console.log('3. Visit http://localhost:4321/login to test the authentication');
console.log('');
console.log('For more information, see the AUTH_SETUP.md file.');
