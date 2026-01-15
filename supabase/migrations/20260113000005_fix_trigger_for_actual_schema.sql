-- FIX TRIGGER FOR ACTUAL DATABASE SCHEMA
-- This migration fixes the trigger to work with the ACTUAL schema in the database
-- Run date: 2026-01-13
-- Updated: 2026-01-14 - Removed 'name' column (does not exist in schema)
--
-- Actual schema discovered:
-- organizations: id, name, slug, logo_url, is_active, created_at, updated_at (NO plan column!)
-- users: id, email, first_name, last_name, organization_id, role, profile_picture_url, phone, is_active, last_login_at, created_at, updated_at (NO 'name' column!)

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
  user_full_name TEXT;
BEGIN
  -- Extract first and last name from user metadata
  user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'User');
  user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Account');
  user_full_name := user_first_name || ' ' || user_last_name;

  -- Create organization for the new user with unique name
  -- NOTE: Using actual schema (NO plan column, has slug column)
  INSERT INTO public.organizations (name, slug, is_active)
  VALUES (
    user_full_name || '''s Org',
    'org-' || LOWER(REPLACE(user_full_name, ' ', '-')) || '-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    true
  )
  RETURNING id INTO new_org_id;

  -- Create user profile with 'viewer' role
  -- NOTE: Schema has 'first_name' and 'last_name' columns (NO 'name' column)
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
    'viewer',  -- FIXED: Use 'viewer' role (matches constraint)
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

-- ============================================================================
-- STEP 2: Recreate trigger
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 3: Ensure RLS policies allow signup (keep existing from previous migration)
-- ============================================================================

-- These should already exist from the comprehensive migration, but recreate just in case

DROP POLICY IF EXISTS "users_insert_signup" ON public.users;
DROP POLICY IF EXISTS "orgs_insert_signup" ON public.organizations;

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
-- SUMMARY
-- ============================================================================

-- This migration fixes:
-- ✅ Trigger uses 'viewer' role (matches constraint)
-- ✅ Trigger inserts into ACTUAL columns (first_name, last_name - NO 'name' column)
-- ✅ Creates user with 'first_name' and 'last_name' (matches database schema)
-- ✅ RLS policies allow INSERT during signup
-- ✅ Fixed on 2026-01-14: Removed non-existent 'name' column that was causing trigger failures
