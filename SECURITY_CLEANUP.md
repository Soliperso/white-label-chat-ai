# Security Cleanup - January 2026

## ⚠️ CRITICAL: Exposed Secrets Removed

This document tracks the security remediation performed to remove hardcoded Supabase credentials from the codebase.

## What Was Found

**11 script files** contained hardcoded production Supabase credentials:

### Exposed Secrets (NOW REMOVED ✅)
- **Supabase Service Role Key** (admin bypass key with full database access)
- **Supabase Anon Key** (public key for client-side operations)
- **Production Supabase URL**

### Affected Files (All Fixed ✅)
1. `scripts/check-specific-user.js`
2. `scripts/apply-migration-direct.js`
3. `scripts/apply-migration-now.js`
4. `scripts/fix-existing-users.js`
5. `scripts/check-rls-policies.js`
6. `scripts/auto-migrate.js`
7. `scripts/migrate-via-api.js`
8. `scripts/check-user-by-email.js`
9. `scripts/test-auth.js`
10. `scripts/test-supabase-connection.js`
11. `scripts/apply-migration-simple.js`
12. `scripts/apply-migration.js`

## Actions Taken

### ✅ 1. Removed All Hardcoded Credentials
All scripts now require environment variables:
- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

### ✅ 2. Added Environment Variable Validation
Every script now validates that required env vars are set and provides clear error messages with usage examples.

### ✅ 3. Created Documentation
- Added `scripts/README.md` with comprehensive usage instructions
- Documents security best practices
- Explains how to obtain and use credentials safely

### ✅ 4. Verified Removal
Confirmed via grep search that no hardcoded secrets remain in:
- `.js` files
- `.ts` files
- `.tsx` files

## 🚨 IMMEDIATE ACTION REQUIRED

### If These Credentials Were Committed to Git:

**You MUST rotate your Supabase credentials immediately:**

1. **Rotate Service Role Key** (CRITICAL):
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Navigate to Settings → API
   - Click "Generate new service role key"
   - Update your `.env` files with the new key
   - **The old key is now permanently compromised**

2. **Consider Rotating Anon Key** (if concerned):
   - The anon key is less critical (it's meant to be public)
   - But if you want extra security, you can rotate it too

3. **Review Access Logs**:
   - Check Supabase logs for any suspicious activity
   - Look for unexpected database queries or auth attempts

### If These Credentials Were NEVER Committed:

You're safe! The secrets were removed before being committed to version control.

## Prevention Measures

### ✅ Already Implemented:
1. `.env` files in `.gitignore`
2. All scripts require environment variables
3. Clear documentation on security best practices

### 📋 Additional Recommendations:

1. **Add Pre-commit Hook** (optional but recommended):
   ```bash
   npm install --save-dev @commitlint/cli husky
   # Configure to scan for common secret patterns
   ```

2. **Use Secret Scanning** (recommended for teams):
   - Enable GitHub's secret scanning (if using GitHub)
   - Or use tools like `gitleaks` or `trufflehog`

3. **Rotate Credentials Regularly**:
   - Service role keys: Every 90 days
   - Check Supabase access logs monthly

4. **Principle of Least Privilege**:
   - Only use service role key when absolutely necessary
   - Prefer anon key + RLS policies for most operations

## How to Use Scripts Now

### Option 1: Pass Environment Variables Directly
```bash
SUPABASE_URL=<your-url> SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/test-auth.js
```

### Option 2: Use .env File (Recommended)
Create a `.env` file in project root:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then use with `dotenv`:
```bash
npm install -g dotenv-cli
dotenv node scripts/test-auth.js
```

### Option 3: Add to package.json
```json
{
  "scripts": {
    "test:supabase": "dotenv node scripts/test-supabase-connection.js",
    "test:auth": "dotenv node scripts/test-auth.js"
  }
}
```

## Verification

Run this command to verify no secrets remain:
```bash
# Should return no results
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" scripts/
grep -r "sb_publishable" scripts/
```

## Status: ✅ REMEDIATED

All hardcoded secrets have been removed and replaced with environment variable references.

**Date**: January 10, 2026
**Action Required**: Rotate credentials if they were ever committed to git history
