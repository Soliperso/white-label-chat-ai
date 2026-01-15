-- Fix: Change default role from 'admin' to 'user' for new signups
-- This ensures proper RBAC where only the platform owner is admin

-- Drop existing trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate with 'user' as default role
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

  -- Create user profile with 'user' role (changed from 'admin')
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
    'user',  -- CHANGED FROM 'admin' TO 'user'
    new_org_id,
    false,
    true
  );

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
