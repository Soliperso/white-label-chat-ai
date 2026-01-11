-- Grant table permissions to fix "permission denied for table users" error
-- This ensures authenticated users have base permissions to query tables
-- RLS policies will still control what rows they can see
-- Run date: 2026-01-11

-- ============================================================================
-- STEP 1: Grant base permissions on users table
-- ============================================================================

-- Grant SELECT to authenticated users (RLS will filter rows)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
GRANT DELETE ON public.users TO authenticated;

-- Grant SELECT to anonymous users for public operations (if needed)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;

-- ============================================================================
-- STEP 2: Grant permissions on organizations table
-- ============================================================================

GRANT SELECT ON public.organizations TO authenticated;
GRANT INSERT ON public.organizations TO authenticated;
GRANT UPDATE ON public.organizations TO authenticated;
GRANT DELETE ON public.organizations TO authenticated;

GRANT SELECT ON public.organizations TO anon;

-- ============================================================================
-- STEP 3: Grant permissions on auth schema (if needed)
-- ============================================================================

-- Note: auth.users is managed by Supabase and permissions are already set
-- We only need to ensure our custom schema has proper grants

-- ============================================================================
-- STEP 4: Verify RLS is still enabled
-- ============================================================================

-- Double-check that RLS is enabled (it should be from previous migrations)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Grant sequence permissions (for auto-increment IDs if any)
-- ============================================================================

-- Grant usage on all sequences in public schema
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- To verify permissions:
--
-- 1. Check table permissions:
--    SELECT grantee, privilege_type
--    FROM information_schema.role_table_grants
--    WHERE table_name IN ('users', 'organizations')
--      AND grantee IN ('authenticated', 'anon');
--
-- 2. Check RLS is enabled:
--    SELECT tablename, rowsecurity
--    FROM pg_tables
--    WHERE schemaname = 'public'
--      AND tablename IN ('users', 'organizations');
--
-- 3. Test user profile query (should work now):
--    SELECT * FROM users WHERE id = auth.uid();
--
-- ============================================================================

-- Security Notes:
-- - These GRANT statements give base table access
-- - RLS policies (from previous migrations) control row-level access
-- - Users can only see rows allowed by their RLS policies
-- - This is the standard Supabase pattern: GRANT + RLS
-- ============================================================================
