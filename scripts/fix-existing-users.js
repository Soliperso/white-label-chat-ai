#!/usr/bin/env node

/**
 * Fix existing users that don't have profiles
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-existing-users.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixExistingUsers() {
  console.log('🔧 Fixing existing users without profiles...\n');

  try {
    // Get all users from auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    console.log(`Found ${users.length} auth users\n`);

    for (const user of users) {
      console.log(`Checking user: ${user.email}`);

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('  → Profile missing, creating...');

        const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';
        const lastName = user.user_metadata?.last_name || 'Account';

        // Create organization with unique name
        const orgName = `${firstName} ${lastName}'s Org ${Date.now()}`;
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
            plan: 'starter',
            is_active: true
          })
          .select()
          .single();

        if (orgError) {
          console.error(`  ❌ Error creating organization:`, orgError.message);
          continue;
        }

        console.log(`  ✅ Organization created: ${orgData.id}`);

        // Create user profile
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            role: 'admin',
            organization_id: orgData.id,
            is_email_verified: user.email_confirmed_at ? true : false,
            is_active: true
          });

        if (userError) {
          console.error(`  ❌ Error creating profile:`, userError.message);
          continue;
        }

        console.log(`  ✅ Profile created for ${user.email}\n`);
      } else if (profile) {
        console.log('  ✅ Profile already exists\n');
      } else {
        console.error('  ❌ Error checking profile:', profileError?.message, '\n');
      }
    }

    console.log('✨ Done! All users should now have profiles.\n');
    console.log('Try refreshing the page and logging in again.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixExistingUsers();
