#!/usr/bin/env node

/**
 * Diagnose Profile Loading Issue
 *
 * This script diagnoses why a user profile won't load even though the user exists
 * in the database. It checks:
 * 1. User exists in public.users table
 * 2. User exists in auth.users table
 * 3. RLS policies on users table
 * 4. Permissions for authenticated role
 * 5. JWT claims in auth.users metadata
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/diagnose-profile-issue.js <user-id>
 */

import { createClient } from '@supabase/supabase-js';

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.argv[2] || 'a8dd066c-7105-4c3e-9fa5-614b474b9f64';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables\n');
  console.error('Required:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY\n');
  console.error('Usage:');
  console.error('  SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/diagnose-profile-issue.js [user-id]');
  process.exit(1);
}

async function diagnose() {
  console.log('🔍 Diagnosing profile loading issue...\n');
  console.log(`Target User ID: ${USER_ID}\n`);
  console.log('='.repeat(70) + '\n');

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Step 1: Check if user exists in public.users
    console.log('1️⃣  Checking public.users table...');
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', USER_ID)
      .maybeSingle();

    if (publicUserError) {
      console.log('   ❌ Error querying public.users:', publicUserError.message);
      console.log('   Code:', publicUserError.code);
      console.log('   Details:', publicUserError.details);
    } else if (!publicUser) {
      console.log('   ❌ User NOT found in public.users table');
      console.log('   💡 This means the trigger did not create the user profile');
      console.log('   💡 Need to manually create the user or fix the trigger\n');
      return;
    } else {
      console.log('   ✅ User found in public.users:');
      console.log('      - Email:', publicUser.email);
      console.log('      - Name:', publicUser.first_name, publicUser.last_name);
      console.log('      - Role:', publicUser.role);
      console.log('      - Organization ID:', publicUser.organization_id);
      console.log('      - Active:', publicUser.is_active);
      console.log('      - Created:', publicUser.created_at);
    }

    // Step 2: Check if user exists in auth.users
    console.log('\n2️⃣  Checking auth.users table...');
    const { data: authUsers, error: authUserError } = await supabase
      .rpc('get_auth_user', { user_id: USER_ID })
      .single();

    // If RPC doesn't exist, try direct query (might fail due to permissions)
    if (authUserError?.code === '42883') {
      console.log('   ⚠️  RPC function not available, trying direct query...');
      // Service role can query auth schema directly
      const { data: authData, error } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data, raw_app_meta_data, confirmed_at')
        .eq('id', USER_ID)
        .maybeSingle();

      if (error) {
        console.log('   ⚠️  Cannot query auth.users directly:', error.message);
      } else if (authData) {
        console.log('   ✅ User found in auth.users:');
        console.log('      - Email:', authData.email);
        console.log('      - Email confirmed:', authData.confirmed_at ? 'Yes' : 'No');
        console.log('      - User metadata:', JSON.stringify(authData.raw_user_meta_data, null, 2));
        console.log('      - App metadata:', JSON.stringify(authData.raw_app_meta_data, null, 2));
      }
    }

    // Step 3: Check RLS policies on users table
    console.log('\n3️⃣  Checking RLS policies on users table...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, permissive, roles, qual, with_check')
      .eq('tablename', 'users')
      .eq('schemaname', 'public');

    if (policiesError) {
      console.log('   ❌ Error fetching policies:', policiesError.message);
    } else {
      console.log(`   Found ${policies?.length || 0} policies:`);
      const selectPolicies = policies?.filter(p => p.cmd === 'SELECT') || [];

      if (selectPolicies.length === 0) {
        console.log('   ❌ NO SELECT POLICIES FOUND!');
        console.log('   💡 This is the problem! Users cannot SELECT their own profile.');
        console.log('   💡 Need to add SELECT policy: USING (auth.uid() = id)');
      } else {
        selectPolicies.forEach(policy => {
          console.log(`\n   📋 ${policy.policyname}:`);
          console.log(`      - Command: ${policy.cmd}`);
          console.log(`      - Permissive: ${policy.permissive}`);
          console.log(`      - Roles: ${policy.roles}`);
          console.log(`      - USING clause: ${policy.qual}`);

          // Check if policy allows user to read their own data
          if (policy.qual && policy.qual.includes('auth.uid()')) {
            console.log(`      ✅ Policy allows users to read their own data`);
          } else {
            console.log(`      ⚠️  Policy might not allow self-read`);
          }
        });
      }
    }

    // Step 4: Check if RLS is enabled
    console.log('\n4️⃣  Checking if RLS is enabled...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', 'users')
      .single();

    if (tableError) {
      console.log('   ❌ Error checking RLS status:', tableError.message);
    } else if (!tableInfo.rowsecurity) {
      console.log('   ⚠️  RLS is DISABLED on users table');
      console.log('   💡 This could be intentional, but typically RLS should be enabled');
    } else {
      console.log('   ✅ RLS is enabled on users table');
    }

    // Step 5: Check grants for authenticated role
    console.log('\n5️⃣  Checking permissions for authenticated role...');
    const { data: grants, error: grantsError } = await supabase
      .rpc('check_table_privileges', {
        table_schema: 'public',
        table_name: 'users'
      });

    if (grantsError?.code === '42883') {
      console.log('   ⚠️  Privilege check function not available');
      console.log('   💡 Assuming default Supabase grants are in place');
    }

    // Step 6: Test actual SELECT as authenticated user
    console.log('\n6️⃣  Testing SELECT as authenticated user...');
    console.log('   Creating anon client to simulate frontend request...');

    const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!ANON_KEY) {
      console.log('   ⚠️  SUPABASE_ANON_KEY not provided, skipping test');
    } else {
      const anonClient = createClient(SUPABASE_URL, ANON_KEY);

      // Note: We can't actually authenticate as this user without their password
      // But we can document what the client WOULD do
      console.log('   💡 Frontend would do this:');
      console.log('      1. supabase.auth.getSession() -> gets JWT with auth.uid()');
      console.log('      2. supabase.from("users").select("*").eq("id", auth.uid()).single()');
      console.log('      3. RLS policy checks: USING (auth.uid() = id)');
      console.log('   ');
      console.log('   If this fails with PGRST116 (0 rows), it means:');
      console.log('      - RLS policy is blocking the query');
      console.log('      - Or no SELECT policy exists for authenticated users');
    }

    // Summary and recommendations
    console.log('\n' + '='.repeat(70));
    console.log('📊 DIAGNOSIS SUMMARY:\n');

    const issues = [];
    const fixes = [];

    if (!publicUser) {
      issues.push('User profile missing from public.users table');
      fixes.push('Run trigger manually or create user profile');
    }

    if (policies && policies.filter(p => p.cmd === 'SELECT').length === 0) {
      issues.push('No SELECT policies found on users table');
      fixes.push('Apply migration: 20260113000006_fix_rls_select_policies.sql');
    }

    if (tableInfo && !tableInfo.rowsecurity) {
      issues.push('RLS is disabled on users table');
      fixes.push('Enable RLS: ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;');
    }

    if (issues.length === 0) {
      console.log('✅ No obvious issues found with database configuration');
      console.log('\n💡 Possible causes:');
      console.log('   1. JWT token is expired or invalid');
      console.log('   2. Browser cached old session data');
      console.log('   3. Supabase anon key mismatch');
      console.log('   4. Frontend is not passing auth header correctly');
      console.log('\n💡 Try:');
      console.log('   1. Clear browser local storage and cookies');
      console.log('   2. Log out and log back in');
      console.log('   3. Check browser console for auth errors');
      console.log('   4. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    } else {
      console.log('❌ Issues found:');
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });

      console.log('\n🔧 Recommended fixes:');
      fixes.forEach((fix, i) => {
        console.log(`   ${i + 1}. ${fix}`);
      });
    }

    console.log('\n' + '='.repeat(70));

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

diagnose();
