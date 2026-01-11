# Supabase Backend Setup Guide

## Step 1: Apply Database Migration

You need to apply the database migration to create all necessary tables and Row Level Security policies.

### Instructions:

1. **Go to Supabase SQL Editor**
   - Navigate to: https://supabase.com/dashboard/project/lyqzfwusfkkvkaaacosx/sql
   - Or click on "SQL Editor" in the left sidebar

2. **Create a New Query**
   - Click the "+ New Query" button

3. **Copy the Migration SQL**
   - Open the file: `supabase/migrations/20260110000001_initial_schema.sql`
   - Copy ALL the contents (188 lines)

4. **Paste and Execute**
   - Paste the SQL into the editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for the query to complete

5. **Verify Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `organizations`
     - `users`
     - `training_sources`
     - `training_jobs`

## Step 2: Verify Row Level Security (RLS)

After running the migration:

1. Go to each table in the Table Editor
2. Click on the table name
3. Check that "Enable RLS" is turned ON
4. Click on "Policies" to see the security policies

## Step 3: Test the Connection

Once the migration is applied, you can test the application:

```bash
npm run dev
```

Then try to:
1. Register a new account at http://localhost:3000/register
2. Login at http://localhost:3000/login

## Troubleshooting

### If you see "relation does not exist" errors:
- The migration hasn't been applied yet
- Re-run the migration SQL in the SQL Editor

### If you see "permission denied" errors:
- RLS policies might not be set up correctly
- Check that all tables have RLS enabled
- Verify policies exist for each table

### If registration fails:
- Check the browser console for errors
- Check Supabase logs in Dashboard > Logs
- Ensure email confirmations are disabled (see below)

## Step 4: Configure Email Settings (Optional)

For development, you may want to disable email confirmations:

1. Go to Authentication > Settings
2. Under "Email Auth", disable "Confirm email"
3. This allows users to sign up without email verification

## Step 5: Get Service Role Key (Optional)

If you want to use the automated migration script:

1. Go to Settings > API
2. Copy the `service_role` key (not the anon key)
3. Run: `SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/apply-migration-simple.js`

## Database Schema Overview

### Tables Created:

1. **organizations** - Multi-tenant organization data
   - Stores company info, branding, subscription plan

2. **users** - User profiles (extends auth.users)
   - Links to organizations
   - Stores role (admin/manager/viewer)
   - Profile information

3. **training_sources** - AI training data sources
   - URLs, files, or Q&A pairs
   - Tracks processing status

4. **training_jobs** - Background job tracking
   - Monitors training pipeline progress

### Security:

All tables have Row Level Security (RLS) enabled with policies ensuring:
- Users can only see data from their own organization
- Admin users have full access to their organization's data
- Manager users can manage training data
- Viewer users have read-only access

## Next Steps

After the migration is successful:
1. Start the frontend development server
2. Register a new account
3. Start building features!
