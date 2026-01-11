-- Complete RLS fix for users and organizations tables
-- This migration completely rebuilds RLS policies from scratch
-- Run date: 2026-01-11

-- ============================================================================
-- STEP 1: Clean slate - drop ALL existing policies
-- ============================================================================

-- Drop all users policies
DROP POLICY IF EXISTS "users_read_own_profile" ON users;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_insert_on_signup" ON users;
DROP POLICY IF EXISTS "users_read_same_org" ON users;
DROP POLICY IF EXISTS "users_read_same_org_simple" ON users;
DROP POLICY IF EXISTS "admins_manage_org_users" ON users;
DROP POLICY IF EXISTS "admins_update_org_users" ON users;
DROP POLICY IF EXISTS "admins_delete_org_users" ON users;

-- Drop all organizations policies
DROP POLICY IF EXISTS "orgs_insert_on_signup" ON organizations;
DROP POLICY IF EXISTS "orgs_read_own" ON organizations;
DROP POLICY IF EXISTS "orgs_admins_update" ON organizations;

-- ============================================================================
-- STEP 2: Ensure table permissions are granted
-- ============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions (base access - RLS will filter rows)
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.organizations TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.organizations TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================================
-- STEP 3: Enable RLS on tables
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create simple, working RLS policies for USERS table
-- ============================================================================

-- Policy 1: Users can read their OWN profile (CRITICAL for login!)
-- This is the most important policy - without it, users can't read their profile
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy 2: Users can update their OWN profile
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy 3: Allow user creation during signup (for the trigger)
-- This must use service_role or be permissive since auth.uid() doesn't exist yet
CREATE POLICY "users_insert_new"
  ON public.users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy 4: Users can read other users in their organization (optional - for team features)
-- IMPORTANT: This policy is safe because it doesn't self-reference
-- We'll enable this only after metadata sync is working
-- For now, comment it out to avoid any recursion issues
-- CREATE POLICY "users_select_org"
--   ON public.users
--   FOR SELECT
--   TO authenticated
--   USING (
--     organization_id = (
--       SELECT raw_app_meta_data->>'organization_id'
--       FROM auth.users
--       WHERE id = auth.uid()
--     )::uuid
--   );

-- ============================================================================
-- STEP 5: Create simple RLS policies for ORGANIZATIONS table
-- ============================================================================

-- Policy 1: Allow organization creation during signup
CREATE POLICY "orgs_insert_new"
  ON public.organizations
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy 2: Users can read their own organization
-- SAFE: Uses join through users table, not self-referencing
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

-- Policy 3: Admins can update their organization
CREATE POLICY "orgs_update_admin"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id
      FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id
      FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- STEP 6: Create metadata sync function and trigger
-- ============================================================================

-- Function to sync user data to auth.users metadata (for JWT claims)
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users raw_app_meta_data with organization_id and role
  -- This allows us to use these values in policies without querying users table
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'organization_id', NEW.organization_id::text,
      'role', NEW.role,
      'email', NEW.email
    )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-sync on insert/update
DROP TRIGGER IF EXISTS sync_user_metadata_trigger ON public.users;
CREATE TRIGGER sync_user_metadata_trigger
  AFTER INSERT OR UPDATE OF organization_id, role, email ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_metadata();

-- ============================================================================
-- STEP 7: Backfill existing users' metadata
-- ============================================================================

-- Sync all existing users to auth.users metadata
DO $$
DECLARE
  user_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  FOR user_record IN SELECT id, organization_id, role, email FROM public.users LOOP
    BEGIN
      UPDATE auth.users
      SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
        jsonb_build_object(
          'organization_id', COALESCE(user_record.organization_id::text, ''),
          'role', COALESCE(user_record.role, 'viewer'),
          'email', COALESCE(user_record.email, '')
        )
      WHERE id = user_record.id;

      updated_count := updated_count + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to update metadata for user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Successfully updated metadata for % users', updated_count;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the migration worked:
--
-- 1. Check policies exist:
--    SELECT schemaname, tablename, policyname, cmd, qual
--    FROM pg_policies
--    WHERE tablename IN ('users', 'organizations')
--    ORDER BY tablename, policyname;
--
-- 2. Check table permissions:
--    SELECT grantee, privilege_type
--    FROM information_schema.role_table_grants
--    WHERE table_name = 'users' AND grantee IN ('authenticated', 'anon');
--
-- 3. Check RLS is enabled:
--    SELECT tablename, rowsecurity
--    FROM pg_tables
--    WHERE schemaname = 'public' AND tablename IN ('users', 'organizations');
--
-- 4. Test reading your own profile (should work):
--    SELECT * FROM users WHERE id = auth.uid();
--
-- 5. Check metadata was synced:
--    SELECT id, email, raw_app_meta_data->>'organization_id', raw_app_meta_data->>'role'
--    FROM auth.users
--    LIMIT 5;
--
-- ============================================================================

-- Success! Users should now be able to:
-- ✅ Sign up (creates user + org)
-- ✅ Log in (reads their own profile)
-- ✅ Read their organization
-- ✅ Update their profile
-- No more infinite recursion or permission denied errors!
