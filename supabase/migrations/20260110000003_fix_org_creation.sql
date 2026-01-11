-- Fix organization creation policy
-- The current policy requires authentication but new users need to create orgs during registration

DROP POLICY IF EXISTS "Allow organization creation" ON organizations;

-- Allow any authenticated user to create an organization
-- This is needed for the registration flow
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);
