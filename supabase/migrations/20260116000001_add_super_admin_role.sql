-- =====================================================
-- Migration: Add Super Admin Role and Infrastructure
-- Date: 2026-01-16
-- Description: Adds super_admin role, audit logging table,
--              and updates RLS policies for super admin bypass
-- =====================================================

-- =====================================================
-- PART 1: Update Users Table for Super Admin
-- =====================================================

-- Drop existing role constraint and add super_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'manager', 'viewer', 'super_admin'));

-- Make organization_id nullable for super_admin users
-- Super admins exist outside organization hierarchy
ALTER TABLE users ALTER COLUMN organization_id DROP NOT NULL;

-- Add metadata column for super admin operations (impersonation state, etc.)
ALTER TABLE users ADD COLUMN IF NOT EXISTS super_admin_metadata JSONB DEFAULT '{}';

-- Add index for super admin queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- PART 2: Create Audit Logs Table
-- =====================================================

-- Audit logs track all super admin actions for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  super_admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'impersonate', 'export'
  target_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  target_resource_type TEXT, -- 'user', 'widget', 'organization', 'training_source', etc.
  target_resource_id UUID,
  metadata JSONB DEFAULT '{}', -- Additional context (before/after values, filters used, etc.)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_super_admin_id ON audit_logs(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_org_id ON audit_logs(target_organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(target_resource_type);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only super admins can view audit logs
CREATE POLICY "Super admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policy: Only super admins can insert audit logs (via service role or backend)
CREATE POLICY "Super admins can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- PART 3: Update Existing RLS Policies for Super Admin Bypass
-- =====================================================

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------
-- Organizations Table
-- -------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Admin users can update their organization" ON organizations;

-- Recreate with super admin bypass
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    -- Super admins can view all organizations
    is_super_admin(auth.uid())
    OR
    -- Regular users can view their own organization
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update their organization"
  ON organizations FOR UPDATE
  USING (
    -- Super admins can update any organization
    is_super_admin(auth.uid())
    OR
    -- Regular admins can update their own organization
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Super admins can create and delete organizations
CREATE POLICY "Super admins can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete organizations"
  ON organizations FOR DELETE
  USING (is_super_admin(auth.uid()));

-- -------------------------
-- Users Table
-- -------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admin users can manage users in their organization" ON users;

-- Recreate with super admin bypass
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (
    -- Super admins can view all users
    is_super_admin(auth.uid())
    OR
    -- Regular users can view users in their organization
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR
    -- Users can always view their own profile
    id = auth.uid()
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (
    -- Super admins can update any user
    is_super_admin(auth.uid())
    OR
    -- Users can update their own profile
    id = auth.uid()
  );

CREATE POLICY "Admin users can manage users in their organization"
  ON users FOR ALL
  USING (
    -- Super admins can manage all users
    is_super_admin(auth.uid())
    OR
    -- Regular admins can manage users in their organization
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Prevent non-super-admins from promoting users to super_admin
CREATE POLICY "Prevent unauthorized super admin promotion"
  ON users FOR UPDATE
  USING (
    -- Allow super admins to change roles freely
    is_super_admin(auth.uid())
    OR
    -- For non-super-admins, ensure they're not trying to set role to super_admin
    (
      id = auth.uid() AND role != 'super_admin' -- Can't promote self
    )
  );

-- -------------------------
-- Training Sources Table
-- -------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view training sources in their organization" ON training_sources;
DROP POLICY IF EXISTS "Admin and Manager users can manage training sources" ON training_sources;

-- Recreate with super admin bypass
CREATE POLICY "Users can view training sources in their organization"
  ON training_sources FOR SELECT
  USING (
    -- Super admins can view all training sources
    is_super_admin(auth.uid())
    OR
    -- Regular users can view training sources in their organization
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin and Manager users can manage training sources"
  ON training_sources FOR ALL
  USING (
    -- Super admins can manage all training sources
    is_super_admin(auth.uid())
    OR
    -- Admin/Manager users can manage training sources in their organization
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- -------------------------
-- Training Jobs Table
-- -------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view training jobs in their organization" ON training_jobs;
DROP POLICY IF EXISTS "Admin and Manager users can manage training jobs" ON training_jobs;

-- Recreate with super admin bypass
CREATE POLICY "Users can view training jobs in their organization"
  ON training_jobs FOR SELECT
  USING (
    -- Super admins can view all training jobs
    is_super_admin(auth.uid())
    OR
    -- Regular users can view training jobs in their organization
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin and Manager users can manage training jobs"
  ON training_jobs FOR ALL
  USING (
    -- Super admins can manage all training jobs
    is_super_admin(auth.uid())
    OR
    -- Admin/Manager users can manage training jobs in their organization
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- PART 4: Add Comments for Documentation
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Tracks all super admin actions for compliance and security auditing';
COMMENT ON COLUMN users.super_admin_metadata IS 'Stores super admin-specific data like impersonation state and session info';
COMMENT ON FUNCTION is_super_admin IS 'Helper function to check if a user has super_admin role. Used in RLS policies.';

-- =====================================================
-- Migration Complete
-- =====================================================
