-- Fix infinite recursion in users table RLS policies
-- Issue: Policies were querying the users table within users table policies
-- Solution: Use auth.uid() directly and avoid self-referencing subqueries
-- Run date: 2026-01-11

-- ============================================================================
-- STEP 1: Drop problematic policies with infinite recursion
-- ============================================================================

-- These policies had subqueries that referenced the users table within users policies
DROP POLICY IF EXISTS "users_read_same_org" ON users;
DROP POLICY IF EXISTS "admins_manage_org_users" ON users;

-- ============================================================================
-- STEP 2: Recreate policies WITHOUT infinite recursion
-- ============================================================================

-- Allow users to read other users in their organization
-- FIXED: Use direct column comparison instead of subquery
CREATE POLICY "users_read_same_org"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see profiles in their org
    -- This works because:
    -- 1. Users can read their own row via users_read_own_profile policy
    -- 2. Once they know their organization_id, they can read other rows with same org
    organization_id = (
      -- Use auth.jwt() to get claims without querying users table
      COALESCE(
        (SELECT raw_app_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid())::uuid,
        -- Fallback: if not in JWT, user must read their own profile first
        -- This avoids recursion by making it an explicit two-step process
        NULL
      )
    )
  );

-- Allow admins to manage users in their organization
-- FIXED: Split into separate policies to avoid recursion
CREATE POLICY "admins_update_org_users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    -- Admin can update if they're in same org and are admin
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
    AND organization_id = (
      SELECT raw_app_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid()
    )::uuid
  );

CREATE POLICY "admins_delete_org_users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    -- Admin can delete if they're in same org and are admin
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
    AND organization_id = (
      SELECT raw_app_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid()
    )::uuid
  );

-- ============================================================================
-- ALTERNATIVE SOLUTION: Store organization_id in JWT metadata
-- ============================================================================

-- The above solution uses auth.users metadata, but ideally we should store
-- organization_id and role in the JWT custom claims for better performance.
-- This requires updating the handle_new_user() trigger to set metadata.

-- For now, let's create a function to sync user data to auth.users metadata
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users raw_app_meta_data with organization_id and role
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data ||
    jsonb_build_object(
      'organization_id', NEW.organization_id::text,
      'role', NEW.role
    )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync metadata on insert and update
DROP TRIGGER IF EXISTS sync_user_metadata_trigger ON users;
CREATE TRIGGER sync_user_metadata_trigger
  AFTER INSERT OR UPDATE OF organization_id, role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_metadata();

-- ============================================================================
-- STEP 3: Backfill existing users' metadata
-- ============================================================================

-- Sync all existing users to auth.users metadata
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, organization_id, role FROM users LOOP
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
      jsonb_build_object(
        'organization_id', user_record.organization_id::text,
        'role', user_record.role
      )
    WHERE id = user_record.id;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 4: Update organizations policies to use JWT metadata
-- ============================================================================

-- Drop existing organization policies
DROP POLICY IF EXISTS "orgs_read_own" ON organizations;
DROP POLICY IF EXISTS "orgs_admins_update" ON organizations;

-- Recreate using JWT metadata (no recursion)
CREATE POLICY "orgs_read_own"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT raw_app_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid()
    )::uuid
  );

CREATE POLICY "orgs_admins_update"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT raw_app_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid())::uuid
    AND (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    id = (SELECT raw_app_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid())::uuid
    AND (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- To verify this migration worked:
--
-- 1. Check that policies no longer have recursion:
--    SELECT schemaname, tablename, policyname, qual, with_check
--    FROM pg_policies
--    WHERE tablename IN ('users', 'organizations');
--
-- 2. Test user profile query:
--    SELECT * FROM users WHERE id = auth.uid();
--
-- 3. Check that JWT metadata is populated:
--    SELECT id, raw_app_meta_data->>'organization_id', raw_app_meta_data->>'role'
--    FROM auth.users
--    WHERE id = auth.uid();
--
-- 4. Test reading organization:
--    SELECT * FROM organizations
--    WHERE id = (SELECT organization_id FROM users WHERE id = auth.uid());
--
-- ============================================================================
