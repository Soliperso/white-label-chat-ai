#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/check-rls-policies.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkRLS() {
  console.log('\n🔍 Checking RLS policies...\n');

  // Query to get all policies for users table
  const { data: policies, error } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'users');

  if (error) {
    console.error('❌ Error fetching policies:', error.message);
    return;
  }

  console.log('Found', policies?.length || 0, 'policies on users table:\n');

  policies?.forEach((policy, index) => {
    console.log(`${index + 1}. ${policy.policyname}`);
    console.log('   Command:', policy.cmd);
    console.log('   Roles:', policy.roles);
    console.log('   USING:', policy.qual);
    console.log('   WITH CHECK:', policy.with_check);
    console.log('');
  });
}

checkRLS();
