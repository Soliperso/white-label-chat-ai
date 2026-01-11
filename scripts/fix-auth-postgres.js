#!/usr/bin/env node

/**
 * Fix Authentication RLS Policies - PostgreSQL Direct Connection
 *
 * This script connects directly to PostgreSQL using pg library
 * to execute the migration SQL.
 *
 * Requires: npm install pg (or use the existing one in node_modules)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL && !DATABASE_URL) {
  console.error('❌ Error: Missing required environment variables\n');
  console.error('Required (one of):');
  console.error('  - DATABASE_URL (PostgreSQL connection string)');
  console.error('  OR');
  console.error('  - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY\n');
  console.error('Usage:');
  console.error('  DATABASE_URL=<postgres-url> node scripts/fix-auth-postgres.js');
  console.error('  OR');
  console.error('  SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-auth-postgres.js');
  process.exit(1);
}

// Build connection string from Supabase URL if DATABASE_URL not provided
let connectionString = DATABASE_URL;

if (!connectionString && SUPABASE_URL) {
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef) {
    // Construct the pooler connection string
    // Format: postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
    console.log('⚠️  Note: You need the database password from Supabase Dashboard');
    console.log('   Settings → Database → Connection string → Connection pooling\n');

    if (process.env.DATABASE_PASSWORD) {
      connectionString = `postgres://postgres.${projectRef}:${process.env.DATABASE_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;
    } else {
      console.error('❌ DATABASE_PASSWORD environment variable required when using SUPABASE_URL');
      console.error('\nGet your database password from:');
      console.error('   https://app.supabase.com → Settings → Database → Connection string');
      console.error('\nThen run:');
      console.error('   DATABASE_PASSWORD=<password> SUPABASE_URL=<url> node scripts/fix-auth-postgres.js\n');
      process.exit(1);
    }
  }
}

async function applySQLMigration() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔧 Fixing Supabase RLS policies for authentication...\n');

    // Read the migration file
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20260110000007_final_rls_fix.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('   ✅ Loaded migration: 20260110000007_final_rls_fix.sql\n');

    // Connect to database
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('   ✅ Connected successfully\n');

    // Execute the migration
    console.log('🚀 Executing SQL migration...\n');
    await client.query(sql);

    console.log('✅ Migration applied successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Run verification: npm run verify:auth');
    console.log('   2. Test login at http://localhost:3000/login');
    console.log('   3. Check browser console for errors\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Check your DATABASE_URL or database password');
    console.error('   - Ensure you have network access to Supabase');
    console.error('   - Try the manual SQL Editor approach instead\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySQLMigration();
