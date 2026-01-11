# Simple CLI Fix - Run This Now

Since the automated script needs additional setup, here's the **fastest way** to fix the auth issue via CLI:

## Option 1: Use Supabase CLI (Recommended if installed)

```bash
# Check if you have Supabase CLI
which supabase

# If installed, simply run:
cd /Users/ahmedchebli/Desktop/ChatForge
supabase db push
```

This will apply all pending migrations including the fix.

## Option 2: Direct PostgreSQL Connection (If you have the connection string)

Your backend friend needs to get the **Database Connection String**:

1. Go to https://app.supabase.com
2. Settings → Database
3. Copy the **Connection string** (under "Connection pooling" or "Direct connection")
   - It looks like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@...`

Then run:

```bash
cd /Users/ahmedchebli/Desktop/ChatForge

# Set the connection string
export DATABASE_URL="<paste-connection-string-here>"

# Run the PostgreSQL script
node scripts/fix-auth-postgres.js
```

## Option 3: Simple Copy-Paste (Most Reliable - 2 minutes)

This is the **easiest and most reliable** method:

### Steps:

1. **Open the migration file:**
   ```bash
   open supabase/migrations/20260110000007_final_rls_fix.sql
   ```
   (This will open it in your default text editor)

2. **Select all and copy** (Cmd+A, then Cmd+C)

3. **Ask your backend friend to:**
   - Go to https://app.supabase.com
   - Click **SQL Editor**
   - Click **+ New Query**
   - **Paste** the SQL (Cmd+V)
   - Click **Run** button

4. **Done!** It should show "Success. No rows returned"

## After Running Any Option Above

### Verify it worked:

```bash
# If you have the service role key:
SUPABASE_URL="https://lyqzfwusfkkvkaaacosx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<your-key>" \
npm run verify:auth
```

### Test login:

1. Make sure dev server is running: `npm run dev`
2. Go to http://localhost:3000/login
3. Login with your credentials
4. Should redirect to `/widgets` without errors!

---

## Which Option Should You Choose?

- **Have Supabase CLI?** → Use Option 1 (fastest)
- **Have database connection string?** → Use Option 2
- **Neither?** → Use Option 3 (ask friend to paste SQL)

**Estimated time:** 2-5 minutes

---

## Still Getting Errors?

If you see PGRST116 errors after applying the fix, check:

1. **Browser console** - Look for `[fetchUserProfile]` logs
2. **User profile exists** - Check if your user is in the `users` table
3. **Try logging out and back in** - Clear the session

Run the verification script to see exactly which policies are missing.
