# Scripts Directory

This directory contains utility scripts for managing Supabase database migrations and testing.

## ⚠️ Security Notice

**All scripts require environment variables for Supabase credentials. NEVER hardcode secrets in these files.**

## Required Environment Variables

Create a `.env` file in the project root or pass variables directly when running scripts:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Admin access - keep secret!
```

### How to Get These Values

1. Login to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (found under "Project API keys")

## Available Scripts

### Database Migration Scripts

#### `apply-migration.js`
Apply migrations using Supabase service role key (recommended approach).

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/apply-migration.js
```

#### `test-supabase-connection.js`
Test Supabase connection and verify tables exist.

```bash
SUPABASE_URL=<url> SUPABASE_ANON_KEY=<key> node scripts/test-supabase-connection.js
```

### User Management Scripts

#### `check-user-by-email.js`
Check if a user exists in both auth.users and public.users tables.

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/check-user-by-email.js
```

#### `check-specific-user.js`
Check a specific user by ID.

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/check-specific-user.js
```

#### `fix-existing-users.js`
Fix users that exist in auth but are missing profiles in public.users.

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-existing-users.js
```

### Testing Scripts

#### `test-auth.js`
Complete end-to-end authentication test (signup, login, profile creation).

```bash
SUPABASE_URL=<url> SUPABASE_ANON_KEY=<key> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/test-auth.js
```

#### `check-rls-policies.js`
Check Row Level Security policies on tables.

```bash
SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/check-rls-policies.js
```

## Using with .env file

If you have a `.env` file in the project root with the required variables, you can use `dotenv`:

```bash
# Install dotenv-cli if not already installed
npm install -g dotenv-cli

# Run any script with env vars loaded
dotenv node scripts/test-supabase-connection.js
```

Or use this in package.json:

```json
{
  "scripts": {
    "test:supabase": "dotenv node scripts/test-supabase-connection.js"
  }
}
```

## Security Best Practices

1. ✅ **NEVER commit `.env` files** - already in `.gitignore`
2. ✅ **NEVER hardcode credentials** in script files
3. ✅ **Rotate service role key** if it was ever exposed
4. ✅ **Use anon key** for client-side operations
5. ✅ **Use service role key** ONLY for server-side admin operations
6. ⚠️ **Service role key bypasses RLS** - use with caution

## Troubleshooting

### "Missing required environment variables"

Make sure you've set all required environment variables. Each script will tell you which ones it needs.

### "401 Unauthorized"

- Check that your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify it hasn't been rotated in the Supabase dashboard

### "404 Not Found" or table errors

- Run migrations first using the Supabase SQL Editor
- See `SUPABASE_SETUP.md` for migration instructions

## Migration Workflow

1. **Create migration SQL** in `supabase/migrations/`
2. **Apply via Dashboard**: Copy SQL to Supabase SQL Editor and run
3. **Verify**: Run `test-supabase-connection.js` to confirm tables exist
4. **Test auth**: Run `test-auth.js` to verify full authentication flow
