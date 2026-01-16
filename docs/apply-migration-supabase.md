# How to Apply Super Admin Migration to Supabase

## Method 1: Supabase Dashboard (Recommended for Development)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the Migration SQL**
   - Open: `supabase/migrations/20260116000001_add_super_admin_role.sql`
   - Copy the entire contents

4. **Run the Migration**
   - Paste the SQL into the query editor
   - Click "Run" or press Ctrl+Enter
   - Wait for confirmation "Success. No rows returned"

5. **Verify the Changes**
   Run these verification queries one by one:

   ```sql
   -- Check users table has super_admin role
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'users' AND column_name IN ('role', 'organization_id', 'super_admin_metadata');

   -- Check audit_logs table exists
   SELECT * FROM information_schema.tables WHERE table_name = 'audit_logs';

   -- Check is_super_admin function exists
   SELECT routine_name FROM information_schema.routines WHERE routine_name = 'is_super_admin';

   -- View RLS policies (should include super admin bypass)
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE policyname LIKE '%super%';
   ```

## Method 2: Supabase CLI (Recommended for Production)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Apply migrations
supabase db push

# Or apply specific migration
supabase db execute --file supabase/migrations/20260116000001_add_super_admin_role.sql
```

## Method 3: Direct PostgreSQL Connection

If you have the Supabase database connection string:

```bash
# Connect using psql
psql "<your-supabase-connection-string>"

# Run the migration file
\i supabase/migrations/20260116000001_add_super_admin_role.sql

# Or copy-paste the SQL directly
```

## Create Your First Super Admin

After the migration is applied, create your super admin user:

```sql
-- First, create the user in Supabase Auth (via Dashboard or API)
-- Then insert into users table:

INSERT INTO users (
  id,                          -- Must match Supabase Auth UID
  email,
  first_name,
  last_name,
  role,
  organization_id,             -- NULL for super admins
  is_active,
  is_email_verified
) VALUES (
  '<your-supabase-auth-uid>',  -- Get this from Supabase Auth dashboard
  'admin@yourplatform.com',
  'Platform',
  'Admin',
  'super_admin',               -- The super admin role
  NULL,                        -- No organization for super admins
  true,
  true
);
```

## Troubleshooting

### Error: "role must be one of: admin, manager, viewer"
This means the role constraint wasn't updated. Re-run this part of the migration:
```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'manager', 'viewer', 'super_admin'));
```

### Error: "column super_admin_metadata does not exist"
Add the column:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS super_admin_metadata JSONB DEFAULT '{}';
```

### Error: "function is_super_admin does not exist"
Create the function:
```sql
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Next Steps

After applying the migration:
1. Create your super admin user
2. Start the backend server
3. Test authentication with super admin
4. Proceed to Phase 2 implementation
