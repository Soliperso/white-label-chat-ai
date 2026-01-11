#!/usr/bin/env node

/**
 * Fix Authentication RLS Policies
 *
 * This script applies the consolidated RLS policy migration to fix
 * PGRST116 errors and 406 (Not Acceptable) authentication issues.
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-auth-rls.js
 *
 * Or with .env file:
 *   npm run fix:auth
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
  console.error('  SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> npm run fix:auth\n');
  console.error('Or create a .env file in the project root with these variables.\n');
  console.error('To get your service role key:');
  console.error('  1. Go to https://app.supabase.com');
  console.error('  2. Select your project');
  console.error('  3. Go to Settings → API');
  console.error('  4. Copy the "service_role" key (NOT the anon key)');
  process.exit(1);
}

async function applySQLMigration() {
  try {
    console.log('🔧 Fixing Supabase RLS policies for authentication...\n');

    // Read the migration file
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20260110000007_final_rls_fix.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('   ✅ Loaded migration: 20260110000007_final_rls_fix.sql\n');

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🚀 Executing SQL migration...\n');

    // Split SQL into individual statements
    // We need to execute them one by one because some DROP statements might fail
    // if the policies don't exist yet
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const statement of statements) {
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      try {
        // Execute the SQL statement using the RPC endpoint
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          // Ignore errors for DROP IF EXISTS statements - they're expected
          if (statement.includes('DROP POLICY IF EXISTS') || statement.includes('DROP TRIGGER IF EXISTS')) {
            // Silent ignore - this is expected
            successCount++;
          } else {
            console.error(`   ⚠️  Warning: ${error.message}`);
            errorCount++;
            errors.push({ statement: statement.substring(0, 50) + '...', error: error.message });
          }
        } else {
          successCount++;

          // Show progress for CREATE statements
          if (statement.includes('CREATE POLICY')) {
            const policyMatch = statement.match(/CREATE POLICY "([^"]+)"/);
            if (policyMatch) {
              console.log(`   ✅ Created policy: ${policyMatch[1]}`);
            }
          } else if (statement.includes('GRANT')) {
            console.log(`   ✅ Granted permissions`);
          }
        }
      } catch (err) {
        // If exec_sql RPC doesn't exist, we need to use a different approach
        if (err.message && err.message.includes('exec_sql')) {
          console.error('\n❌ The exec_sql RPC function is not available.');
          console.error('   You need to apply this migration manually via the Supabase Dashboard.\n');
          console.error('   Steps:');
          console.error('   1. Go to https://app.supabase.com');
          console.error('   2. Navigate to SQL Editor');
          console.error('   3. Copy the contents of:');
          console.error(`      ${migrationPath}`);
          console.error('   4. Paste into SQL Editor and click Run\n');
          process.exit(1);
        }

        errorCount++;
        errors.push({ statement: statement.substring(0, 50) + '...', error: err.message });
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful operations: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Warnings/Errors: ${errorCount}`);
      console.log('\n⚠️  Some statements had errors:');
      errors.forEach(({ statement, error }) => {
        console.log(`   - ${statement}`);
        console.log(`     Error: ${error}`);
      });
      console.log('\n💡 If these are DROP IF EXISTS errors, they can be safely ignored.');
    }

    console.log('\n✅ Migration process complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Run verification script: npm run verify:auth');
    console.log('   2. Test login at http://localhost:3000/login');
    console.log('   3. Check browser console for errors\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Alternative approaches:');
    console.error('   1. Apply manually via Supabase Dashboard SQL Editor');
    console.error('   2. Use Supabase CLI: supabase db push');
    console.error('   3. Check that your SUPABASE_URL and SERVICE_ROLE_KEY are correct\n');
    process.exit(1);
  }
}

applySQLMigration();
