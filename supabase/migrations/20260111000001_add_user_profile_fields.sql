-- Add user profile fields to users table
-- This migration adds phone, bio, and preferences columns for enhanced user profiles
-- Run date: 2026-01-11

-- ============================================================================
-- STEP 1: Add new columns to users table
-- ============================================================================

-- Add phone number field (nullable)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add bio/biography field (nullable, for user description)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add preferences field (JSONB for flexible user preferences storage)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- ============================================================================
-- STEP 2: Create indexes for performance
-- ============================================================================

-- Index for phone lookups (useful for searching users by phone)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- GIN index for JSONB preferences (enables efficient JSONB queries)
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN (preferences);

-- ============================================================================
-- STEP 3: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN users.phone IS 'User phone number (nullable)';
COMMENT ON COLUMN users.bio IS 'User biography or description (nullable)';
COMMENT ON COLUMN users.preferences IS 'User preferences stored as JSONB (theme, notifications, etc.)';

-- ============================================================================
-- STEP 4: Verify RLS policies are still in place
-- ============================================================================

-- RLS policies from previous migrations already cover these new fields:
-- 1. users_read_own_profile - allows users to read their own profile
-- 2. users_update_own_profile - allows users to update their own profile
-- 3. users_read_same_org - allows users to read profiles in their org
-- 4. admins_manage_org_users - allows admins to manage org users
--
-- No additional RLS policies needed since these columns are part of the users table
-- and existing policies apply to ALL columns in the table.

-- ============================================================================
-- STEP 5: Grant permissions (ensure authenticated users can access)
-- ============================================================================

-- Ensure authenticated users maintain their permissions on the users table
-- (These should already exist from previous migrations, but we re-grant to be safe)
GRANT SELECT, UPDATE ON users TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- To verify this migration worked, run these queries in SQL Editor:
--
-- 1. Check new columns exist:
--    SELECT column_name, data_type, is_nullable, column_default
--    FROM information_schema.columns
--    WHERE table_name = 'users'
--      AND column_name IN ('phone', 'bio', 'preferences');
--
-- 2. Test updating your profile with new fields:
--    UPDATE users
--    SET phone = '+1234567890',
--        bio = 'Test bio',
--        preferences = '{"theme": "dark", "notifications": true}'::jsonb
--    WHERE id = auth.uid();
--
-- 3. Test reading your profile:
--    SELECT id, email, first_name, last_name, phone, bio, preferences
--    FROM users
--    WHERE id = auth.uid();
--
-- ============================================================================

-- Migration Notes:
-- - phone: Can store international phone numbers in any format (E.164 recommended)
-- - bio: Can store user biography, description, or about section
-- - preferences: Flexible JSONB field for storing user settings like:
--   * theme: 'light' | 'dark'
--   * notifications: boolean
--   * language: string
--   * timezone: string
--   * any other app-specific preferences
-- - All fields are nullable for backward compatibility
-- - Existing users will have NULL for new fields until they update their profiles
-- - The updated_at trigger already exists and will update timestamp on any UPDATE
