# Manual Fix Instructions for Backend Friend

## What Happened

The CLI script couldn't automatically apply the migration because your Supabase project doesn't have the `exec_sql` function. This is normal - not all Supabase projects have it.

## Solution: Copy-Paste into SQL Editor (5 minutes)

Follow these simple steps:

### Step 1: Go to Supabase Dashboard

1. Open your browser and go to: https://app.supabase.com
2. Login if needed
3. Select the **ChatForge** project (ID: `lyqzfwusfkkvkaaacosx`)

### Step 2: Open SQL Editor

1. In the left sidebar, click **SQL Editor** (it has a database icon)
2. Click the **+ New Query** button in the top right

### Step 3: Copy the Migration SQL

You need to copy the contents of this file:
```
/Users/ahmedchebli/Desktop/ChatForge/supabase/migrations/20260110000007_final_rls_fix.sql
```

**On your computer:**
1. Open the file: `supabase/migrations/20260110000007_final_rls_fix.sql`
2. Select all (Cmd+A or Ctrl+A)
3. Copy (Cmd+C or Ctrl+C)

### Step 4: Paste and Execute

1. Back in the Supabase SQL Editor, paste the SQL (Cmd+V or Ctrl+V)
2. You should see ~174 lines of SQL code
3. Click the **Run** button (or press Cmd+Enter / Ctrl+Enter)
4. Wait for it to complete (should take 2-3 seconds)

### Step 5: Verify Success

You should see a message like:
- ✅ "Success. No rows returned"

OR you might see individual success messages for each policy created.

If you see any **errors**, don't worry - some DROP statements might fail if the policies don't exist yet. That's normal.

### Step 6: Verify the Fix Worked

After running the SQL, have the user (Ahmed) test login:

1. Make sure the dev server is running:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/login

3. Login with credentials

4. **Success if:**
   - ✅ Redirects to `/widgets` page
   - ✅ No PGRST116 errors in browser console
   - ✅ Console shows: `[fetchUserProfile] Profile fetched successfully`

---

## Alternative: Run Verification Script

If you want to double-check the policies were created, run this from terminal:

```bash
cd /Users/ahmedchebli/Desktop/ChatForge

SUPABASE_URL="https://lyqzfwusfkkvkaaacosx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>" \
npm run verify:auth
```

Replace `<your-service-role-key>` with the actual key from Supabase Dashboard → Settings → API.

This will show you a checklist of all policies that should exist.

---

## What This Fix Does

The SQL migration:
1. Removes old, conflicting RLS policies
2. Creates 5 new policies on the `users` table
3. Creates 3 new policies on the `organizations` table
4. Grants permissions to authenticated users
5. Ensures Row Level Security is enabled

This fixes the PGRST116 errors and 406 responses that prevent login.

---

## Need Help?

If you get stuck:
1. Take a screenshot of any error messages
2. Share the screenshot with Ahmed
3. Check the browser console for detailed error messages

**Estimated Time:** 5 minutes
**Difficulty:** Easy (just copy-paste)
