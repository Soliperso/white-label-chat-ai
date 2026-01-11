# Complete RLS Fix - Apply This Now

## The Problem
You're getting `permission denied for table users` because the RLS policies are incomplete.

## The Solution
Apply the complete RLS fix migration that:
1. Drops all existing policies (clean slate)
2. Grants proper table permissions
3. Creates simple, working policies
4. Syncs metadata to JWT claims

---

## How to Apply (2 minutes)

### Step 1: Open Supabase SQL Editor
Go to: https://app.supabase.com/project/lyqzfwusfkkvkaaacosx/sql/new

### Step 2: Copy the Migration
Open this file in your editor:
```
supabase/migrations/20260111000004_complete_rls_fix.sql
```

Copy **all 232 lines** of SQL.

### Step 3: Paste and Run
1. Paste the SQL into the Supabase SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success. No rows returned"

### Step 4: Verify
Run this query to verify policies were created:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('users', 'organizations')
ORDER BY tablename, policyname;
```

You should see:
- `users_select_own` (SELECT)
- `users_update_own` (UPDATE)
- `users_insert_new` (INSERT)
- `orgs_select_own` (SELECT)
- `orgs_insert_new` (INSERT)
- `orgs_update_admin` (UPDATE)

### Step 5: Test Login
1. Go to your app: http://localhost:3000/login
2. Try logging in with your credentials
3. You should successfully log in and see your profile!

---

## What This Migration Does

### ✅ Fixed Issues
- Removes all policies with infinite recursion
- Grants base table permissions (GRANT ALL)
- Creates simple policy: users can read their own profile
- Enables metadata sync to JWT claims
- No more self-referencing subqueries

### ✅ Key Policies Created
1. **users_select_own**: Users can read their own profile (id = auth.uid())
2. **users_update_own**: Users can update their own profile
3. **users_insert_new**: Allows user creation during signup
4. **orgs_select_own**: Users can read their organization
5. **orgs_insert_new**: Allows org creation during signup

### ✅ Metadata Sync
- Syncs `organization_id` and `role` to `auth.users.raw_app_meta_data`
- Enables future policies to use JWT claims without recursion
- Auto-backfills existing users

---

## After Applying

**You must log out and log back in** to refresh your JWT with the new metadata.

Then test:
1. ✅ Signup should work
2. ✅ Login should work
3. ✅ Profile should load
4. ✅ No more 403 or 500 errors

---

## Troubleshooting

**If you still get errors:**

1. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public' AND tablename = 'users';
   ```
   Should show: `rowsecurity = true`

2. **Check permissions:**
   ```sql
   SELECT grantee, privilege_type
   FROM information_schema.role_table_grants
   WHERE table_name = 'users' AND grantee = 'authenticated';
   ```
   Should show: SELECT, INSERT, UPDATE, DELETE

3. **Test direct query:**
   ```sql
   -- This should return your user row
   SELECT * FROM users WHERE id = auth.uid();
   ```

4. **Clear browser cache** and try again

---

## Need Help?

If this doesn't work, run these debug queries and share the output:

```sql
-- 1. List all policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 2. Check your user exists
SELECT id, email, organization_id, role FROM users;

-- 3. Check auth.uid() works
SELECT auth.uid();

-- 4. Check permissions
\dp users
```
