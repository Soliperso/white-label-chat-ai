#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/check-user-by-email.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkUser() {
  const email = 'chah762002@yahoo.fr';

  console.log(`\nChecking user: ${email}\n`);

  // List all users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error('❌ Auth user not found');
    return;
  }

  console.log('✅ Auth user exists:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Created:', user.created_at);
  console.log('   Email confirmed:', !!user.email_confirmed_at);

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('\n❌ Profile not found:', profileError.message);
    return;
  }

  console.log('\n✅ Profile exists:');
  console.log('   Name:', profile.first_name, profile.last_name);
  console.log('   Email:', profile.email);
  console.log('   Role:', profile.role);
  console.log('   Org ID:', profile.organization_id);

  // Check organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  if (orgError) {
    console.error('\n❌ Organization not found:', orgError.message);
    return;
  }

  console.log('\n✅ Organization exists:');
  console.log('   ID:', org.id);
  console.log('   Name:', org.name);
  console.log('   Plan:', org.plan);

  console.log('\n✨ Everything looks good! You can log in with this account.\n');
}

checkUser();
