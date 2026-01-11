# Fix Authentication Errors - CLI Guide

## What This Fixes

If you're seeing these errors when trying to login:
- ❌ "Failed to load user profile. Please contact support."
- ❌ PGRST116 errors in browser console
- ❌ 406 (Not Acceptable) responses from Supabase
- ❌ Cannot login even with correct credentials

This guide will help you fix them **without needing access to the Supabase dashboard**.

## Prerequisites

You (or your backend friend) need:
1. ✅ Access to the Supabase dashboard (to get the service role key)
2. ✅ Terminal/command line access to this project
3. ✅ 5-10 minutes

## Quick Start (3 Commands)

If you already have the service role key:

```bash
# 1. Navigate to project
cd /Users/ahmedchebli/Desktop/ChatForge

# 2. Run the fix (replace <key> with your actual service role key)
SUPABASE_URL="https://lyqzfwusfkkvkaaacosx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>" \
npm run fix:auth

# 3. Verify it worked
SUPABASE_URL="https://lyqzfwusfkkvkaaacosx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>" \
npm run verify:auth
```

That's it! Now test login at http://localhost:3000/login

## Step-by-Step Instructions

### Step 1: Get Your Service Role Key

**⚠️ IMPORTANT:** You need the **service_role** key, NOT the anon key!

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your ChatForge project (should be `lyqzfwusfkkvkaaacosx`)
3. Click **Settings** in the left sidebar (gear icon)
4. Click **API** in the settings menu
5. Scroll down to find **Project API keys**
6. Copy the **`service_role`** key (it's a long JWT token)
   - It should start with `eyJhbG...`
   - DO NOT use the `anon` key - that won't work!

**Security Note:** Keep this key secret! Don't commit it to git.

### Step 2: Open Terminal

Open your terminal and navigate to the ChatForge project:

```bash
cd /Users/ahmedchebli/Desktop/ChatForge
```

### Step 3: Run the Fix Script

**Option A: Inline Environment Variables (Quick)**

Run this command (replace `<your-service-role-key>` with the key you copied):

```bash
SUPABASE_URL="https://lyqzfwusfkkvkaaacosx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>" \
npm run fix:auth
```

**Option B: Using .env File (Recommended if running multiple times)**

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add these lines to `.env` (replace `<your-key>` with your actual key):
   ```env
   SUPABASE_URL=https://lyqzfwusfkkvkaaacosx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

3. Now you can just run:
   ```bash
   npm run fix:auth
   ```

### Step 4: Verify Success

You should see output like this:

```
🔧 Fixing Supabase RLS policies for authentication...

📦 Reading migration file...
   ✅ Loaded migration: 20260110000007_final_rls_fix.sql

🚀 Executing SQL migration...

   ✅ Created policy: users_read_own_profile
   ✅ Created policy: users_update_own_profile
   ✅ Created policy: users_insert_on_signup
   ✅ Created policy: users_read_same_org
   ✅ Created policy: admins_manage_org_users
   ✅ Created policy: orgs_insert_on_signup
   ✅ Created policy: orgs_read_own
   ✅ Created policy: orgs_admins_update

📊 Migration Summary:
   ✅ Successful operations: 13

✅ Migration process complete!
```

### Step 5: Run Verification Script

Double-check everything worked correctly:

```bash
# If using inline env vars:
SUPABASE_URL="https://lyqzfwusfkkvkaaacosx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<your-key>" \
npm run verify:auth

# Or if using .env file:
npm run verify:auth
```

Expected output:

```
🔍 Verifying RLS policies...

📡 Connecting to Supabase...
   ✅ Connected successfully

👥 Users Table Policies:
   ✅ users_read_own_profile (SELECT)
   ✅ users_update_own_profile (UPDATE)
   ✅ users_insert_on_signup (INSERT)
   ✅ users_read_same_org (SELECT)
   ✅ admins_manage_org_users (ALL)

🏢 Organizations Table Policies:
   ✅ orgs_insert_on_signup (INSERT)
   ✅ orgs_read_own (SELECT)
   ✅ orgs_admins_update (UPDATE)

🔒 Row Level Security Status:
   ✅ users: RLS enabled
   ✅ organizations: RLS enabled

==================================================
✅ All checks passed! RLS policies are correctly configured.
```

### Step 6: Test Login

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/login in your browser

3. Login with your credentials

4. **Success indicators:**
   - ✅ You get redirected to `/widgets`
   - ✅ No errors in browser console
   - ✅ Console shows: `[fetchUserProfile] Profile fetched successfully`

5. **Still broken if you see:**
   - ❌ PGRST116 errors in console
   - ❌ 406 responses in Network tab
   - ❌ "Failed to load user profile" error

## Troubleshooting

### Error: "Missing required environment variables"

**Problem:** The script can't find your Supabase credentials.

**Solution:**
- Make sure you're using the correct environment variable names
- Double-check you copied the full service role key
- Try the .env file approach instead

### Error: "exec_sql RPC function is not available"

**Problem:** Your Supabase project doesn't have the exec_sql function.

**Solution:** Apply the migration manually via Supabase Dashboard:
1. Go to https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **+ New Query**
4. Open file: `supabase/migrations/20260110000007_final_rls_fix.sql`
5. Copy all contents (174 lines)
6. Paste into SQL Editor
7. Click **Run** button

### Error: "Error querying users policies"

**Problem:** The service role key is incorrect or expired.

**Solution:**
- Go back to Supabase Dashboard → Settings → API
- Copy the service role key again (it might have been rotated)
- Make sure you're using service_role, NOT anon key

### Verification shows "MISSING" policies

**Problem:** The fix script didn't fully complete.

**Solution:**
1. Try running the fix script again: `npm run fix:auth`
2. If that doesn't work, use the manual SQL Editor approach above
3. Check for errors in the script output

### Login still fails after running fix

**Problem:** The user profile might not exist in the database.

**Solution:**

1. Check if your user profile exists:
   - Go to Supabase Dashboard → Table Editor
   - Open the `users` table
   - Search for your email address
   - If it's missing, you'll need to register a new account

2. Check browser console for specific errors:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for `[fetchUserProfile]` logs
   - Share any error messages

## What This Fix Does

The scripts apply a database migration that:

1. **Removes conflicting policies** - Cleans up old, broken RLS policies
2. **Creates new policies** - Adds correct policies that allow users to read their own data
3. **Grants permissions** - Ensures authenticated users can access the tables
4. **Enables RLS** - Confirms Row Level Security is turned on

**This does NOT:**
- Delete any user data
- Change passwords
- Modify existing accounts
- Affect the Supabase Auth system

## Need More Help?

If you're still stuck:

1. **Check the detailed documentation:** See `FIX_AUTH_ERRORS.md` for more comprehensive troubleshooting

2. **Share these details:**
   - Output of `npm run verify:auth`
   - Browser console errors (screenshot)
   - Supabase logs (Dashboard → Logs → Database)

3. **Alternative fix methods:**
   - Manual SQL Editor approach (described above)
   - Use Supabase CLI: `supabase db push`
   - Contact your backend developer for help

## Security Reminder

**⚠️ DO NOT commit your service role key to git!**

- The `.env` file is already in `.gitignore` - keep it there
- Never share your service role key publicly
- Rotate the key if it's ever exposed

---

**Last Updated:** 2026-01-10
**Estimated Time:** 5-10 minutes
**Difficulty:** Easy (just copy-paste commands)
