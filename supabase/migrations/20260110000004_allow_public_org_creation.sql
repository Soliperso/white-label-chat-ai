-- Allow organization creation during registration without authentication
-- This is needed because email confirmation may be enabled

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Allow anyone to create organizations (needed for registration)
-- In production, you may want to add additional checks
CREATE POLICY "Allow organization creation"
  ON organizations FOR INSERT
  WITH CHECK (true);

-- Also update the user insert policy to allow anon users
DROP POLICY IF EXISTS "Allow user creation during registration" ON users;

CREATE POLICY "Allow user creation during registration"
  ON users FOR INSERT
  WITH CHECK (true);
