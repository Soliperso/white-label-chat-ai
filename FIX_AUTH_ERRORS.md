# Fix Authentication Errors - Step-by-Step Guide

## Problem Summary

You're experiencing authentication errors with these symptoms:
- **404 errors** on `/favicon.ico` and user profile endpoints
- **406 (Not Acceptable) errors** when fetching user profiles from Supabase
- **PGRST116 error**: "The result contains 0 rows" or "Cannot coerce the result to a single JSON object"
- **Login fails** with "Failed to load user profile. Please contact support."

## Root Cause

The issue is caused by **Row Level Security (RLS) policy conflicts** in your Supabase database. Multiple migrations have created overlapping or incorrect policies that prevent authenticated users from reading their own profile data from the `users` table.

## Solution Overview

I've created a comprehensive fix that includes:

1. ✅ **New migration file** that consolidates and fixes all RLS policies
2. ✅ **Updated auth-context.tsx** with better error handling and retry logic
3. 📋 **This guide** with step-by-step instructions

## Step-by-Step Fix

### Step 1: Apply the RLS Policy Fix Migration

You need to run the new migration to fix the database policies.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **+ New Query**
4. Open the file: `supabase/migrations/20260110000007_final_rls_fix.sql`
5. Copy the entire contents (all 174 lines)
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for "Success. No rows returned" message

**Option B: Using CLI (if you have Supabase CLI installed)**

```bash
# If you have the Supabase CLI
supabase db push

# Or apply the specific migration
supabase migration up
```

**Option C: Using Node.js Script (if you prefer)**

```bash
# Set your Supabase service role key
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
export SUPABASE_URL="https://lyqzfwusfkkvkaaacosx.supabase.co"

# Run the migration script (if you have one in scripts/)
node scripts/apply-migration-simple.js supabase/migrations/20260110000007_final_rls_fix.sql
```

### Step 2: Verify the Policies Were Created

After running the migration, verify it worked:

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this query to check policies on the `users` table:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```

You should see these policies:
- `users_read_own_profile` (SELECT)
- `users_update_own_profile` (UPDATE)
- `users_insert_on_signup` (INSERT)
- `users_read_same_org` (SELECT)
- `admins_manage_org_users` (ALL)

3. Check organizations table policies:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'organizations';
```

You should see:
- `orgs_insert_on_signup` (INSERT)
- `orgs_read_own` (SELECT)
- `orgs_admins_update` (UPDATE)

### Step 3: Test the Login Flow

The frontend code has been updated with better error handling. Now test:

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Try logging in with an existing user

4. **Check the browser console** for detailed logs:
   - You should see `[fetchUserProfile] Fetching profile for user: <uuid>`
   - Then `[fetchUserProfile] Profile fetched successfully`
   - If there's still an error, the console will show detailed diagnostic info

### Step 4: If Login Still Fails - Check User Profile Exists

If you still get errors, the user might exist in `auth.users` but not in the `users` table. Check:

```sql
-- In Supabase SQL Editor, run this query (replace with your email):
SELECT
  au.id as auth_user_id,
  au.email as auth_email,
  u.id as profile_user_id,
  u.email as profile_email,
  u.organization_id,
  u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'your-email@example.com';
```

**If the `profile_user_id` is NULL**, the user profile doesn't exist. This means the signup trigger didn't run. To fix:

1. Delete the auth user (they'll need to re-register):
   ```sql
   -- BE CAREFUL! This deletes the user permanently
   DELETE FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. Register a new account at http://localhost:3000/register
3. The trigger should now create both the organization and user profile

### Step 5: Verify Trigger is Working

Make sure the auto-create trigger is installed:

```sql
-- Check if the trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if the function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';
```

If either is missing, you need to apply migration: `20260110000005_auto_create_user_profile.sql`

## What Was Fixed

### 1. Database Migration (`20260110000007_final_rls_fix.sql`)

- ✅ Dropped ALL conflicting RLS policies
- ✅ Created clean, minimal policies for `users` table
- ✅ Created clean policies for `organizations` table
- ✅ Granted necessary permissions to authenticated users
- ✅ Added comprehensive comments and verification queries

### 2. Auth Context (`frontend/lib/auth-context.tsx`)

- ✅ Changed from `.single()` to `.maybeSingle()` to avoid throwing on 0 rows
- ✅ Added detailed error logging with error codes and messages
- ✅ Added automatic retry logic (waits 2 seconds for trigger to complete)
- ✅ Added better diagnostic messages to help debug issues
- ✅ Fixed TypeScript errors

## Common Issues and Solutions

### Issue: "No data returned. Row count: 0"

**Cause**: RLS policies are blocking access or user profile doesn't exist

**Solution**:
1. Verify RLS policies were created (Step 2)
2. Check if user profile exists (Step 4)
3. Make sure you applied the latest migration

### Issue: "Cannot coerce the result to a single JSON object"

**Cause**: Using `.single()` when 0 rows are returned

**Solution**: Already fixed in updated auth-context.tsx (uses `.maybeSingle()`)

### Issue: User can register but can't login

**Cause**: Signup trigger created the auth user but failed to create the profile

**Solution**:
1. Check Supabase logs: Dashboard > Logs > select "Database"
2. Look for errors in the `handle_new_user()` function
3. Make sure organizations table allows INSERT with the `orgs_insert_on_signup` policy

### Issue: 404 on favicon.ico

**Cause**: This is unrelated to the auth issue - Next.js is looking for favicon

**Solution**: Create a favicon:
```bash
# Add a favicon to public folder
cp /path/to/favicon.ico frontend/public/favicon.ico
```

## Verification Checklist

After following all steps, verify:

- [ ] Migration applied successfully (no errors in SQL Editor)
- [ ] RLS policies exist on users table (5 policies)
- [ ] RLS policies exist on organizations table (3 policies)
- [ ] Can register a new account
- [ ] Can login with the new account
- [ ] No PGRST116 errors in browser console
- [ ] User profile loads successfully
- [ ] Redirects to /widgets after login

## Still Having Issues?

If you're still experiencing problems:

1. **Check Supabase Logs**:
   - Go to Dashboard > Logs
   - Select "Database" logs
   - Look for errors during login/registration

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for detailed error messages from `[fetchUserProfile]`

3. **Verify Environment Variables**:
   ```bash
   # Make sure these are set correctly in frontend/.env
   cat frontend/.env | grep SUPABASE
   ```

4. **Test Direct Database Query**:
   ```sql
   -- Login to your account first, then run this in SQL Editor
   -- It should show your user profile
   SELECT * FROM users WHERE id = auth.uid();
   ```

## Need Help?

If you're still stuck, provide these details:
1. Screenshot of browser console errors
2. Output of the RLS policy verification query (Step 2)
3. Output of the user profile check query (Step 4)
4. Supabase database logs (if available)

---

**Last Updated**: 2026-01-10
**Status**: Ready to apply
