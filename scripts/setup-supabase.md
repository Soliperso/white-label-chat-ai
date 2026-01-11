# Supabase Setup Instructions

## Apply Database Migration

Since we don't have the service role key yet, you need to apply the migration manually:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/lyqzfwusfkkvkaaacosx
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20260110000001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. Verify that all tables were created successfully

### Option 2: Using psql (if you have database credentials)

```bash
# Get your database connection string from Supabase Dashboard > Settings > Database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.lyqzfwusfkkvkaaacosx.supabase.co:5432/postgres" \
  -f supabase/migrations/20260110000001_initial_schema.sql
```

### Option 3: Using the apply-migration script

If you have the service role key:

```bash
# Add this to frontend/.env.local:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Then run:
SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/apply-migration-simple.js
```

## Verify Migration

After applying the migration, verify in the Supabase Dashboard:

1. Go to **Table Editor**
2. You should see these tables:
   - organizations
   - users
   - training_sources
   - training_jobs

3. Check that RLS (Row Level Security) is enabled on all tables

## Next Steps

Once the migration is applied, we can proceed with:
- Setting up the frontend Supabase client
- Implementing authentication
- Testing the application
