-- FIX RLS SELECT POLICIES
-- This migration adds SELECT policies so users can read their own profiles
-- and their organization data after email confirmation
-- Run date: 2026-01-13

-- ============================================================================
-- STEP 1: Add SELECT policy for users table
-- ============================================================================

-- Drop existing SELECT policies if any
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_self" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Create policy to allow users to SELECT their own profile
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- STEP 2: Add SELECT policy for organizations table
-- ============================================================================

-- Drop existing SELECT policies if any
DROP POLICY IF EXISTS "orgs_select_own" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;

-- Create policy to allow users to SELECT their own organization
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
-- STEP 3: Grant SELECT permissions to authenticated users
-- ============================================================================

GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.organizations TO authenticated;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- This migration fixes:
-- ✅ Users can SELECT their own profile from users table
-- ✅ Users can SELECT their organization from organizations table
-- ✅ Proper GRANT permissions for authenticated role
-- ✅ No more "infinite loading" when fetching user profile after email confirmation
