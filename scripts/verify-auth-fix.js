#!/usr/bin/env node

/**
 * Verify Authentication RLS Policies
 *
 * This script verifies that the RLS policies were correctly applied
 * to fix the authentication issues.
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/verify-auth-fix.js
 *
 * Or with .env file:
 *   npm run verify:auth
 */

import { createClient } from '@supabase/supabase-js';

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables\n');
  console.error('Required:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY\n');
  console.error('Usage:');
  console.error('  SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> npm run verify:auth');
  process.exit(1);
}

// Expected policies
const EXPECTED_POLICIES = {
  users: [
    { name: 'users_read_own_profile', cmd: 'SELECT' },
    { name: 'users_update_own_profile', cmd: 'UPDATE' },
    { name: 'users_insert_on_signup', cmd: 'INSERT' },
    { name: 'users_read_same_org', cmd: 'SELECT' },
    { name: 'admins_manage_org_users', cmd: 'ALL' }
  ],
  organizations: [
    { name: 'orgs_insert_on_signup', cmd: 'INSERT' },
    { name: 'orgs_read_own', cmd: 'SELECT' },
    { name: 'orgs_admins_update', cmd: 'UPDATE' }
  ]
};

async function verifyPolicies() {
  try {
    console.log('🔍 Verifying RLS policies...\n');

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if we can query the database
    console.log('📡 Connecting to Supabase...');

    // Query pg_policies for users table
    const { data: usersPolicies, error: usersError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, tablename')
      .eq('tablename', 'users');

    if (usersError) {
      console.error('❌ Error querying users policies:', usersError.message);
      console.error('\n💡 This might mean:');
      console.error('   1. The service role key is incorrect');
      console.error('   2. The Supabase URL is incorrect');
      console.error('   3. You don\'t have access to the pg_policies table\n');
      process.exit(1);
    }

    // Query pg_policies for organizations table
    const { data: orgsPolicies, error: orgsError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, tablename')
      .eq('tablename', 'organizations');

    if (orgsError) {
      console.error('❌ Error querying organizations policies:', orgsError.message);
      process.exit(1);
    }

    console.log('   ✅ Connected successfully\n');

    // Verify users table policies
    console.log('👥 Users Table Policies:');
    let allPassed = true;

    for (const expected of EXPECTED_POLICIES.users) {
      const found = usersPolicies?.find(p => p.policyname === expected.name);
      if (found) {
        console.log(`   ✅ ${expected.name} (${expected.cmd})`);
      } else {
        console.log(`   ❌ MISSING: ${expected.name} (${expected.cmd})`);
        allPassed = false;
      }
    }

    // Check for unexpected policies
    const unexpectedUsers = usersPolicies?.filter(p =>
      !EXPECTED_POLICIES.users.some(e => e.name === p.policyname)
    );
    if (unexpectedUsers && unexpectedUsers.length > 0) {
      console.log('\n   ⚠️  Unexpected policies found:');
      unexpectedUsers.forEach(p => {
        console.log(`      - ${p.policyname} (${p.cmd})`);
      });
    }

    // Verify organizations table policies
    console.log('\n🏢 Organizations Table Policies:');

    for (const expected of EXPECTED_POLICIES.organizations) {
      const found = orgsPolicies?.find(p => p.policyname === expected.name);
      if (found) {
        console.log(`   ✅ ${expected.name} (${expected.cmd})`);
      } else {
        console.log(`   ❌ MISSING: ${expected.name} (${expected.cmd})`);
        allPassed = false;
      }
    }

    // Check for unexpected policies
    const unexpectedOrgs = orgsPolicies?.filter(p =>
      !EXPECTED_POLICIES.organizations.some(e => e.name === p.policyname)
    );
    if (unexpectedOrgs && unexpectedOrgs.length > 0) {
      console.log('\n   ⚠️  Unexpected policies found:');
      unexpectedOrgs.forEach(p => {
        console.log(`      - ${p.policyname} (${p.cmd})`);
      });
    }

    // Check if RLS is enabled
    console.log('\n🔒 Row Level Security Status:');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['users', 'organizations']);

    if (tablesError) {
      console.log('   ⚠️  Could not verify RLS status:', tablesError.message);
    } else {
      for (const table of tables || []) {
        if (table.rowsecurity) {
          console.log(`   ✅ ${table.tablename}: RLS enabled`);
        } else {
          console.log(`   ❌ ${table.tablename}: RLS DISABLED`);
          allPassed = false;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('✅ All checks passed! RLS policies are correctly configured.');
      console.log('\n📋 Next Steps:');
      console.log('   1. Test login at http://localhost:3000/login');
      console.log('   2. Check browser console - should see "Profile fetched successfully"');
      console.log('   3. Should NOT see PGRST116 or 406 errors\n');
      process.exit(0);
    } else {
      console.log('❌ Some checks failed. Review the output above.');
      console.log('\n💡 Suggested actions:');
      console.log('   1. Re-run the fix script: npm run fix:auth');
      console.log('   2. Check the migration file for errors');
      console.log('   3. Manually apply the migration via Supabase Dashboard\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify your SUPABASE_URL and SERVICE_ROLE_KEY are correct');
    console.error('   2. Check that you have network access to Supabase');
    console.error('   3. Try running the fix script first: npm run fix:auth\n');
    process.exit(1);
  }
}

verifyPolicies();
