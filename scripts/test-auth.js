#!/usr/bin/env node

/**
 * Test authentication flow with Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Required: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_ANON_KEY=<anon_key> SUPABASE_SERVICE_ROLE_KEY=<service_key> node scripts/test-auth.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAuth() {
  console.log('🧪 Testing Supabase Authentication Flow\n');

  // Test 1: Sign up a test user
  console.log('1️⃣  Testing user registration...');

  const testEmail = `user.test.${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  const firstName = 'Test';
  const lastName = 'User';

  try {
    // Sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      console.log(`   ❌ Sign up failed: ${authError.message}`);
      return;
    }

    console.log(`   ✅ User created in auth.users: ${authData.user?.id}`);

    // Check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    console.log(`   Session exists: ${!!sessionData.session}`);

    // Create organization (using admin client to bypass RLS during test)
    console.log('\n2️⃣  Creating organization...');
    const orgName = `${firstName} ${lastName}'s Org ${Date.now()}`;
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: orgName,
        plan: 'starter',
      })
      .select()
      .single();

    if (orgError) {
      console.log(`   ❌ Organization creation failed: ${orgError.message}`);
      return;
    }

    console.log(`   ✅ Organization created: ${orgData.id}`);

    // Create user profile (using admin client to bypass RLS during test)
    console.log('\n3️⃣  Creating user profile...');
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
        organization_id: orgData.id,
        is_email_verified: false,
        is_active: true,
      });

    if (profileError) {
      console.log(`   ❌ Profile creation failed: ${profileError.message}`);
      return;
    }

    console.log(`   ✅ User profile created`);

    // Confirm email (using admin client)
    console.log('\n4️⃣  Confirming email...');
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
      authData.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.log(`   ❌ Email confirmation failed: ${confirmError.message}`);
      return;
    }

    console.log(`   ✅ Email confirmed`);

    // Test sign in
    console.log('\n5️⃣  Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log(`   ❌ Sign in failed: ${signInError.message}`);
      return;
    }

    console.log(`   ✅ Sign in successful`);

    // Fetch user profile
    console.log('\n6️⃣  Fetching user profile...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (userError) {
      console.log(`   ❌ Profile fetch failed: ${userError.message}`);
      return;
    }

    console.log(`   ✅ Profile fetched successfully`);
    console.log(`      Name: ${userData.first_name} ${userData.last_name}`);
    console.log(`      Role: ${userData.role}`);
    console.log(`      Organization ID: ${userData.organization_id}`);

    // Sign out
    console.log('\n7️⃣  Testing sign out...');
    await supabase.auth.signOut();
    console.log(`   ✅ Sign out successful`);

    console.log('\n✨ All authentication tests passed!\n');
    console.log('🎉 Your Supabase backend is fully configured and working!\n');
    console.log('Next steps:');
    console.log('  1. Open http://localhost:3000/register in your browser');
    console.log('  2. Create your first account');
    console.log('  3. Start building features!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

testAuth();
