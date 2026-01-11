#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/check-specific-user.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkUser() {
  const userId = 'fb051898-2abc-462a-a82e-1bad5af97041';

  console.log(`Checking user: ${userId}\n`);

  // Check auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

  if (authError) {
    console.error('❌ Auth user not found:', authError.message);
    return;
  }

  console.log('✅ Auth user exists:');
  console.log('   Email:', authUser.user.email);
  console.log('   Created:', authUser.user.created_at);

  // Check users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('\n❌ Profile not found:', profileError.message);
    console.error('   Code:', profileError.code);
    return;
  }

  console.log('\n✅ Profile exists:');
  console.log('   Name:', profile.first_name, profile.last_name);
  console.log('   Email:', profile.email);
  console.log('   Role:', profile.role);
  console.log('   Org ID:', profile.organization_id);
}

checkUser();
