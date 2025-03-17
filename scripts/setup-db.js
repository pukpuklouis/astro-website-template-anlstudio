#!/usr/bin/env node

/**
 * Better Auth Database Setup Script
 * 
 * This script initializes the Cloudflare D1 database for Better Auth.
 * It reads the schema.sql file and applies it to the D1 database.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Path to schema file
const schemaPath = path.join(rootDir, 'schema.sql');

try {
  console.log('🔐 Setting up Better Auth database...');
  
  // Check if schema file exists
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found at:', schemaPath);
    process.exit(1);
  }
  
  // Read wrangler.jsonc to get database info
  const wranglerPath = path.join(rootDir, 'wrangler.jsonc');
  if (!fs.existsSync(wranglerPath)) {
    console.error('❌ wrangler.jsonc not found. Please create it first.');
    process.exit(1);
  }
  
  // Execute wrangler command to apply schema
  console.log('📦 Applying database schema...');
  execSync(`wrangler d1 execute --local --file=${schemaPath}`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ Database setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Make sure AUTH_SECRET is set in wrangler.jsonc');
  console.log('2. Start the development server with: bun run dev');
  
} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  console.error('');
  console.error('Troubleshooting:');
  console.error('1. Make sure wrangler is installed: npm install -g wrangler');
  console.error('2. Check that your D1 database is created and configured in wrangler.jsonc');
  console.error('3. Run this command manually: wrangler d1 execute --local --file=schema.sql');
  process.exit(1);
}
