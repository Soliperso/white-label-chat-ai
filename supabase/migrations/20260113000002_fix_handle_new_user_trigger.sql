-- Fix: Update handle_new_user() trigger to use 'viewer' role (not 'user')
-- The users table constraint only allows: 'admin', 'manager', 'viewer'
-- This was causing "Database error saving new user" on signup

-- Drop existing trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate with 'viewer' as default role (matches table constraint)
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

  -- Create user profile with 'viewer' role (changed from 'user' to match constraint)
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
    'viewer',  -- FIXED: Use 'viewer' instead of 'user' to match table constraint
    new_org_id,
    false,
    true
  );

  -- Update auth.users metadata with organization_id and role for JWT claims
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'organization_id', new_org_id::text,
      'role', 'viewer'
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
