-- SIMPLE FIX: Only fix the trigger function to use 'viewer' role
-- This is the minimal change needed to fix the signup issue
-- Run date: 2026-01-13

-- Drop and recreate ONLY the trigger function
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

  -- Create user profile with 'viewer' role (NOT 'user')
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
    'viewer',  -- FIXED: Changed from 'user' to 'viewer'
    new_org_id,
    false,
    true
  );

  -- Update auth.users metadata
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
