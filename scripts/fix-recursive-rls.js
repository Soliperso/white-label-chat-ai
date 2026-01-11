#!/usr/bin/env node

/**
 * Fix Recursive RLS Policies
 *
 * This script applies the migration to fix infinite recursion in RLS policies.
 * The issue was that policies were querying the users table within users table policies.
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-recursive-rls.js
 *
 * Or with .env file:
 *   npm run fix:recursive-rls
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables\n');
  console.error('Required:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY\n');
  console.error('Usage:');
  console.error('  SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> npm run fix:recursive-rls\n');
  console.error('Or set these in your .env file.\n');
  console.error('To get your service role key:');
  console.error('  1. Go to https://app.supabase.com');
  console.error('  2. Select your project');
  console.error('  3. Go to Settings → API');
  console.error('  4. Copy the "service_role" key (NOT the anon key)');
  process.exit(1);
}

async function applySQLMigration() {
  try {
    console.log('🔧 Fixing recursive RLS policies...\n');

    // Read the migration file
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20260111000002_fix_recursive_rls.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('   ✅ Loaded migration: 20260111000002_fix_recursive_rls.sql\n');

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🚀 Applying migration via Supabase SQL Editor API...\n');
    console.log('⚠️  Note: This script will execute SQL directly.');
    console.log('   If you prefer, you can manually copy the SQL to Supabase Dashboard.\n');

    // Use the pg-meta API or direct SQL execution
    // Since we can't use RPC, we'll provide instructions for manual application
    console.log('📋 MANUAL MIGRATION STEPS:');
    console.log('   Due to RLS policy complexity, please apply this migration manually:\n');
    console.log('   1. Go to https://app.supabase.com');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Create a new query');
    console.log('   5. Copy and paste the following file:');
    console.log(`      ${migrationPath}`);
    console.log('   6. Click "Run" to execute\n');

    console.log('📄 Migration Preview (first 1000 chars):');
    console.log('━'.repeat(80));
    console.log(sql.substring(0, 1000) + '...\n');
    console.log('━'.repeat(80));

    console.log('\n💡 What this migration does:');
    console.log('   ✓ Removes policies with infinite recursion');
    console.log('   ✓ Creates new policies using auth.users metadata');
    console.log('   ✓ Adds trigger to sync user data to JWT claims');
    console.log('   ✓ Backfills existing users with metadata');
    console.log('   ✓ Updates organization policies\n');

    console.log('⚠️  IMPORTANT: After applying:');
    console.log('   1. Users may need to log out and log back in');
    console.log('   2. This refreshes their JWT with new metadata');
    console.log('   3. Test the profile endpoint after login\n');

    // Check if we should attempt automatic application
    console.log('🤔 Would you like to try automatic application? (Experimental)');
    console.log('   Press Ctrl+C to cancel and apply manually instead.\n');

    // Try to execute using admin API
    console.log('🔄 Attempting to execute migration...\n');

    try {
      // Try using the REST API to execute SQL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log('✅ Migration executed successfully!\n');
    } catch (execError) {
      console.log('⚠️  Automatic execution failed:', execError.message);
      console.log('\n📋 Please apply the migration manually using the steps above.\n');
      console.log('   The migration file is located at:');
      console.log(`   ${migrationPath}\n`);
    }

    console.log('📋 After Migration:');
    console.log('   1. Test user signup/login');
    console.log('   2. Check that profile loads without recursion error');
    console.log('   3. Verify JWT contains organization_id and role');
    console.log('   4. Run: npm run verify:auth\n');

  } catch (error) {
    console.error('\n❌ Migration process failed:', error.message);
    console.error('\n💡 Please apply the migration manually:');
    console.error('   File: supabase/migrations/20260111000002_fix_recursive_rls.sql');
    console.error('   Via: Supabase Dashboard → SQL Editor\n');
    process.exit(1);
  }
}

applySQLMigration();
