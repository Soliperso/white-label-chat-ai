-- COMPREHENSIVE FIX: Resolve all signup issues
-- This migration combines all necessary fixes for user registration
-- Run date: 2026-01-13
--
-- Issues fixed:
-- 1. Role constraint violation ('user' not in allowed list)
-- 2. RLS policies for signup
-- 3. Metadata sync for JWT claims
-- 4. Proper permissions

-- ============================================================================
-- STEP 1: Drop and recreate the handle_new_user() trigger function
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_first_name TEXT;
  user_last_name TEXT;
BEGIN
  -- Extract first and last name from user metadata
  user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'User');
  user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Account');

  -- Create organization for the new user with unique name
  INSERT INTO public.organizations (name, plan, is_active)
  VALUES (
    user_first_name || ' ' || user_last_name || '''s Org ' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'starter',
    true
  )
  RETURNING id INTO new_org_id;

  -- Create user profile with 'viewer' role (matches table constraint)
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    is_email_verified,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_first_name,
    user_last_name,
    'viewer',  -- Use 'viewer' (allowed by constraint: 'admin', 'manager', 'viewer')
    new_org_id,
    false,
    true
  );

  -- Update auth.users metadata with organization_id and role for JWT claims
  -- This allows RLS policies to access these values without querying users table
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

-- ============================================================================
-- STEP 2: Recreate trigger
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 3: Ensure RLS policies allow signup
-- ============================================================================

-- Drop ALL possible INSERT policy variations (from all previous migrations)
DROP POLICY IF EXISTS "users_insert_new" ON public.users;
DROP POLICY IF EXISTS "users_insert_signup" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during registration" ON public.users;
DROP POLICY IF EXISTS "users_insert_on_signup" ON public.users;
DROP POLICY IF EXISTS "orgs_insert_new" ON public.organizations;
DROP POLICY IF EXISTS "orgs_insert_signup" ON public.organizations;
DROP POLICY IF EXISTS "Allow organization creation" ON public.organizations;
DROP POLICY IF EXISTS "orgs_insert_on_signup" ON public.organizations;

-- Create permissive INSERT policies for signup
-- These allow the SECURITY DEFINER trigger to insert rows
CREATE POLICY "users_insert_signup"
  ON public.users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "orgs_insert_signup"
  ON public.organizations
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ============================================================================
-- STEP 4: Ensure proper permissions are granted
-- ============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON public.users TO postgres, service_role;
GRANT ALL ON public.organizations TO postgres, service_role;
GRANT SELECT, INSERT ON public.users TO authenticated;
GRANT SELECT, INSERT ON public.organizations TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.organizations TO anon;

-- Grant sequence permissions
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- ============================================================================
-- STEP 5: Ensure SELECT policies exist for authenticated users
-- ============================================================================

-- Drop ALL possible SELECT policy variations
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_read_own_profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "orgs_select_own" ON public.organizations;
DROP POLICY IF EXISTS "orgs_read_own" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;

-- Users can read their own profile (CRITICAL for login)
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can read their organization
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

-- ============================================================================
-- STEP 6: Ensure UPDATE policies exist
-- ============================================================================

-- Drop ALL possible UPDATE policy variations
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- STEP 7: Create metadata sync trigger (for future updates)
-- ============================================================================

DROP FUNCTION IF EXISTS public.sync_user_metadata() CASCADE;

CREATE OR REPLACE FUNCTION public.sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync changes to auth.users metadata
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

-- Create trigger to auto-sync on update
DROP TRIGGER IF EXISTS sync_user_metadata_trigger ON public.users;
CREATE TRIGGER sync_user_metadata_trigger
  AFTER UPDATE OF organization_id, role, email ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_metadata();

-- ============================================================================
-- VERIFICATION QUERIES (commented out - run manually if needed)
-- ============================================================================

-- To verify the migration:
--
-- 1. Check trigger function exists:
--    SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_new_user';
--
-- 2. Check policies exist:
--    SELECT tablename, policyname, cmd
--    FROM pg_policies
--    WHERE tablename IN ('users', 'organizations')
--    ORDER BY tablename, cmd;
--
-- 3. Test signup with new email address
--
-- 4. After signup, check user was created:
--    SELECT email, role, organization_id FROM public.users ORDER BY created_at DESC LIMIT 1;
--
-- 5. Check metadata was set:
--    SELECT email, raw_app_meta_data->>'role', raw_app_meta_data->>'organization_id'
--    FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- This migration ensures:
-- ✅ Trigger uses 'viewer' role (matches constraint)
-- ✅ RLS policies allow INSERT during signup
-- ✅ Metadata is synced to auth.users for JWT claims
-- ✅ Proper permissions are granted
-- ✅ Users can read their own profile after signup
-- ✅ No infinite recursion in RLS policies
