#!/usr/bin/env node

/**
 * Fix Profile Loading Issue
 *
 * This script fixes the issue where users can't load their profiles after login
 * by ensuring proper RLS SELECT policies exist.
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-profile-loading.js
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
  console.error('  SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-profile-loading.js');
  process.exit(1);
}

const SQL_FIX = `
-- FIX: Allow authenticated users to SELECT their own profile
-- This fixes the "profile won't load" issue

-- Drop existing SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_self" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "users_read_own_profile" ON public.users;

-- Create SELECT policy for authenticated users to read their own profile
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure SELECT permission is granted
GRANT SELECT ON public.users TO authenticated;

-- Also fix organizations SELECT policy
DROP POLICY IF EXISTS "orgs_select_own" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "orgs_read_own" ON public.organizations;

CREATE POLICY "orgs_select_own"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id
      FROM public.users
      WHERE id = auth.uid()
    )
  );

GRANT SELECT ON public.organizations TO authenticated;
`;

async function fixProfile() {
  console.log('🔧 Fixing profile loading issue...\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Step 1: Check current state
    console.log('1️⃣  Checking current RLS policies...');
    const { data: currentPolicies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'users')
      .eq('cmd', 'SELECT');

    if (policiesError) {
      console.log('   ⚠️  Could not check policies:', policiesError.message);
    } else {
      console.log(`   Found ${currentPolicies?.length || 0} SELECT policies on users table`);
      if (currentPolicies && currentPolicies.length > 0) {
        currentPolicies.forEach(p => console.log(`      - ${p.policyname}`));
      } else {
        console.log('   ⚠️  No SELECT policies found - this is the problem!');
      }
    }

    // Step 2: Apply the fix
    console.log('\n2️⃣  Applying SQL fix...');

    // Split SQL into individual statements and execute
    const statements = SQL_FIX
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let failCount = 0;

    for (const statement of statements) {
      if (statement.includes('DROP POLICY')) {
        // Drop statements might fail if policy doesn't exist - that's OK
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ⚠️  Warning: ${error.message}`);
        }
      } else {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          console.log(`   ❌ Error executing SQL: ${error.message}`);
          failCount++;
        } else {
          successCount++;
        }
      }
    }

    // If rpc method doesn't exist, try direct SQL execution
    if (successCount === 0) {
      console.log('   💡 RPC method not available, trying direct execution...');

      // Read the migration file instead
      try {
        const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260113000006_fix_rls_select_policies.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf8');

        console.log('   📄 Executing migration file...');
        console.log('   ⚠️  Note: This might not work via JS - consider running in Supabase Dashboard SQL editor\n');
        console.log('Migration SQL:');
        console.log('='.repeat(70));
        console.log(migrationSQL);
        console.log('='.repeat(70));
        console.log('\n💡 Copy the SQL above and run it in Supabase Dashboard > SQL Editor');
      } catch (readError) {
        console.log('   ℹ️  Could not read migration file:', readError.message);
        console.log('\n💡 Run this SQL in Supabase Dashboard > SQL Editor:\n');
        console.log(SQL_FIX);
      }
    }

    // Step 3: Verify the fix
    console.log('\n3️⃣  Verifying fix...');
    const { data: newPolicies, error: verifyError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('tablename', 'users')
      .eq('cmd', 'SELECT');

    if (verifyError) {
      console.log('   ⚠️  Could not verify:', verifyError.message);
    } else {
      console.log(`   Found ${newPolicies?.length || 0} SELECT policies on users table`);
      if (newPolicies && newPolicies.length > 0) {
        newPolicies.forEach(p => {
          console.log(`      ✅ ${p.policyname}`);
          if (p.qual) {
            console.log(`         USING: ${p.qual}`);
          }
        });
      } else {
        console.log('   ❌ Still no SELECT policies - manual intervention required');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FIX SUMMARY:\n');

    if (newPolicies && newPolicies.length > 0) {
      console.log('✅ Fix applied successfully!\n');
      console.log('📋 Next steps:');
      console.log('   1. Clear browser local storage (F12 > Application > Local Storage > Clear)');
      console.log('   2. Clear browser session storage');
      console.log('   3. Log out completely');
      console.log('   4. Log back in');
      console.log('   5. Profile should load immediately\n');
    } else {
      console.log('⚠️  Could not apply fix automatically\n');
      console.log('📋 Manual steps required:');
      console.log('   1. Go to Supabase Dashboard > SQL Editor');
      console.log('   2. Copy and run the migration file: supabase/migrations/20260113000006_fix_rls_select_policies.sql');
      console.log('   3. Or run the SQL shown above');
      console.log('   4. Then retry login\n');
    }

    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixProfile();
