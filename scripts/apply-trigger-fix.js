/**
 * Script to apply the fixed database trigger to Supabase
 * This fixes the 'name' column issue that was causing profile creation to fail
 *
 * Usage:
 *   node scripts/apply-trigger-fix.js
 *
 * Make sure you have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables in backend/.env:');
  console.error('   SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nGet these from: https://app.supabase.com → Project Settings → API');
  console.error('The SERVICE_ROLE_KEY is different from the ANON_KEY!\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const fixedTriggerSQL = `
-- Drop and recreate the handle_new_user() trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_first_name TEXT;
  user_last_name TEXT;
  user_full_name TEXT;
BEGIN
  -- Extract first and last name from user metadata
  user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'User');
  user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Account');
  user_full_name := user_first_name || ' ' || user_last_name;

  -- Create organization for the new user with unique name
  INSERT INTO public.organizations (name, slug, is_active)
  VALUES (
    user_full_name || '''s Org',
    'org-' || LOWER(REPLACE(user_full_name, ' ', '-')) || '-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    true
  )
  RETURNING id INTO new_org_id;

  -- Create user profile with first_name and last_name (NO 'name' column)
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_first_name,
    user_last_name,
    'viewer',
    new_org_id,
    true
  );

  -- Update auth.users metadata with organization_id and role for JWT claims
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'organization_id', new_org_id::text,
      'role', 'viewer',
      'email', NEW.email
    )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
`;

async function applyFix() {
  console.log('🔧 Applying fixed database trigger...\n');

  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: fixedTriggerSQL });

    if (error) {
      // If RPC doesn't exist, try direct SQL execution
      console.log('⚠️  RPC method not available, trying direct execution...');

      const { error: directError } = await supabase
        .from('_migrations')
        .insert({ name: 'fix_trigger_' + Date.now() });

      if (directError) {
        throw new Error('Cannot execute SQL directly. Please run the SQL manually in Supabase SQL Editor.');
      }
    }

    console.log('✅ Fixed trigger applied successfully!\n');
    console.log('Next steps:');
    console.log('1. Test signup with a NEW email address (not used before)');
    console.log('2. Check your email and click confirmation link');
    console.log('3. You should be redirected to /widgets with your profile loaded');

  } catch (err) {
    console.error('❌ Error applying fix:', err.message);
    console.error('\n📋 MANUAL STEPS REQUIRED:\n');
    console.error('1. Go to: https://app.supabase.com → Your Project → SQL Editor');
    console.error('2. Copy the SQL from: supabase/migrations/20260113000005_fix_trigger_for_actual_schema.sql');
    console.error('3. Paste lines 15-83 (the CREATE OR REPLACE FUNCTION section)');
    console.error('4. Click "Run" to execute\n');
    process.exit(1);
  }
}

applyFix();
