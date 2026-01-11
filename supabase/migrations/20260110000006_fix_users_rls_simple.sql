-- Fix RLS policies for users table to allow authenticated users to read their own profile
-- This fixes the 406 error when fetching user profile after login

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can update users in their organization" ON users;
DROP POLICY IF EXISTS "Admin can delete users in their organization" ON users;

-- Create simple, working policies
-- Policy 1: Users can read their own profile (most important for login!)
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can read other users in their organization
-- We'll add this later when we implement organization features
-- For now, just focus on letting users access their own profile
