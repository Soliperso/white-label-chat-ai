-- FINAL FIX: Consolidate all RLS policies to resolve login issues
-- This migration addresses the PGRST116 error (406 Not Acceptable)
-- Run this migration to fix the "Failed to load user profile" error

-- ============================================================================
-- STEP 1: Drop ALL existing policies to start fresh
-- ============================================================================

-- Drop all users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can update users in their organization" ON users;
DROP POLICY IF EXISTS "Admin can delete users in their organization" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "Admin users can manage users in their organization" ON users;
DROP POLICY IF EXISTS "Allow user creation during registration" ON users;

-- Drop all organizations table policies
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Admin users can update their organization" ON organizations;
DROP POLICY IF EXISTS "Allow organization creation" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- ============================================================================
-- STEP 2: Create clean, minimal RLS policies for USERS table
-- ============================================================================

-- Allow users to read their OWN profile (critical for login!)
CREATE POLICY "users_read_own_profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their OWN profile
CREATE POLICY "users_update_own_profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow user profile creation during registration (triggered by auth.users insert)
-- This is needed for the handle_new_user() trigger to work
CREATE POLICY "users_insert_on_signup"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read other users in their organization (for team features later)
CREATE POLICY "users_read_same_org"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- Allow admins to manage users in their organization
CREATE POLICY "admins_manage_org_users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
        AND organization_id = users.organization_id
    )
  );

-- ============================================================================
-- STEP 3: Create clean RLS policies for ORGANIZATIONS table
-- ============================================================================

-- Allow organization creation during signup (needed for registration trigger)
CREATE POLICY "orgs_insert_on_signup"
  ON organizations
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own organization
CREATE POLICY "orgs_read_own"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- Allow admins to update their organization
CREATE POLICY "orgs_admins_update"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- STEP 4: Verify RLS is enabled
-- ============================================================================

-- Ensure RLS is enabled on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Grant necessary permissions to authenticated users
-- ============================================================================

-- Ensure authenticated users can read from these tables
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON organizations TO authenticated;
GRANT INSERT ON users TO authenticated;
GRANT INSERT ON organizations TO authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT UPDATE ON organizations TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- To verify this migration worked, run these queries in SQL Editor:
--
-- 1. Check policies on users table:
--    SELECT * FROM pg_policies WHERE tablename = 'users';
--
-- 2. Check policies on organizations table:
--    SELECT * FROM pg_policies WHERE tablename = 'organizations';
--
-- 3. Test user profile query (replace USER_ID with actual auth.uid):
--    SELECT * FROM users WHERE id = 'USER_ID';
--
-- ============================================================================
