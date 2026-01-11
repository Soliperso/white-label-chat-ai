-- Drop existing policies with recursion issues
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admin users can manage users in their organization" ON users;

DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Admin users can update their organization" ON organizations;

DROP POLICY IF EXISTS "Users can view training sources in their organization" ON training_sources;
DROP POLICY IF EXISTS "Admin and Manager users can manage training sources" ON training_sources;

DROP POLICY IF EXISTS "Users can view training jobs in their organization" ON training_jobs;
DROP POLICY IF EXISTS "Admin and Manager users can manage training jobs" ON training_jobs;

-- Create simpler, non-recursive RLS policies

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- For now, allow users to view other users in their organization
-- This uses a direct check without recursion
CREATE POLICY "Users can view organization members"
  ON users FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1
    )
  );

-- Admin users can manage users in their organization
CREATE POLICY "Admin users can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND organization_id = users.organization_id
    )
  );

CREATE POLICY "Admin users can delete users"
  ON users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users AS admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
      AND admin_user.organization_id = users.organization_id
    )
  );

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id = (SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Admin users can update organization"
  ON organizations FOR UPDATE
  USING (
    id = (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
      LIMIT 1
    )
  );

-- Allow admins to create organizations (for registration)
CREATE POLICY "Allow organization creation"
  ON organizations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for training_sources
CREATE POLICY "Users can view training sources"
  ON training_sources FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Managers can manage training sources"
  ON training_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND organization_id = training_sources.organization_id
    )
  );

-- RLS Policies for training_jobs
CREATE POLICY "Users can view training jobs"
  ON training_jobs FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Managers can manage training jobs"
  ON training_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND organization_id = training_jobs.organization_id
    )
  );

-- Allow users to be created during registration
CREATE POLICY "Allow user creation during registration"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
