# Phase 1: Super Admin Testing Guide

## ✅ What We've Accomplished

Phase 1 implementation is **COMPLETE** and verified:

### Code Implementation
- ✅ **TypeScript Compilation**: 0 errors - all code compiles successfully
- ✅ **Database Migration**: Complete SQL file ready to apply
- ✅ **Backend Guards**: SuperAdminGuard and updated RolesGuard
- ✅ **Authentication**: Updated SupabaseJwtStrategy for super_admin
- ✅ **Entities**: User and AuditLog entities updated
- ✅ **Unit Tests**: 20 test cases created
- ✅ **Documentation**: Complete implementation guide

### File Changes
```
New Files:
✓ supabase/migrations/20260116000001_add_super_admin_role.sql
✓ backend/src/auth/decorators/is-super-admin.decorator.ts
✓ backend/src/auth/guards/super-admin.guard.ts
✓ backend/src/auth/guards/super-admin.guard.spec.ts
✓ backend/src/auth/guards/roles.guard.spec.ts
✓ backend/src/users/entities/audit-log.entity.ts
✓ docs/phase1-super-admin-implementation.md
✓ docs/apply-migration-supabase.md

Modified Files:
✓ backend/src/users/entities/user.entity.ts
✓ backend/src/auth/guards/roles.guard.ts
✓ backend/src/auth/strategies/supabase-jwt.strategy.ts
✓ CLAUDE.md
```

## 🚀 Next Steps to Test

### Step 1: Configure Environment Variables

Create or update `backend/.env`:

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# API Configuration
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

**Where to find these values:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (under "Project API keys")
   - `SUPABASE_JWT_SECRET`: JWT Secret (under "JWT Settings")

### Step 2: Apply the Migration

**Option A: Supabase Dashboard (Easiest)**
1. Open https://app.supabase.com → Your Project
2. Click "SQL Editor" → "New Query"
3. Copy entire contents of `supabase/migrations/20260116000001_add_super_admin_role.sql`
4. Paste and click "Run"
5. Should see: ✅ "Success. No rows returned"

**Option B: Supabase CLI**
```bash
supabase db push
```

### Step 3: Create Your Super Admin User

After migration is applied:

1. **Create Auth User** (via Supabase Dashboard):
   - Go to Authentication → Users → Add User
   - Email: admin@yourplatform.com
   - Password: (create a strong password)
   - Copy the generated UUID

2. **Insert into Users Table** (via SQL Editor):
```sql
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  organization_id,
  is_active,
  is_email_verified
) VALUES (
  '<paste-uuid-from-step-1>',
  'admin@yourplatform.com',
  'Platform',
  'Admin',
  'super_admin',
  NULL,
  true,
  true
);
```

### Step 4: Start the Backend

```bash
# From project root
npm run dev:backend

# Or from backend directory
cd backend
npm run start:dev
```

Expected output:
```
[Nest] Starting Nest application...
[Nest] SupabaseService initialized
[Nest] Application is running on: http://localhost:3001
```

### Step 5: Test Super Admin Authentication

#### Test 1: Login as Super Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourplatform.com",
    "password": "your-password"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbG...",
  "user": {
    "id": "...",
    "email": "admin@yourplatform.com",
    "role": "super_admin",
    "organizationId": null,
    "isActive": true
  }
}
```

#### Test 2: Verify Super Admin Can Access All Organizations

```bash
# Save the JWT from Test 1
export JWT="eyJhbG..."

# Try to get all organizations (super admin should see ALL)
curl -X GET http://localhost:3001/api/organizations \
  -H "Authorization: Bearer $JWT"
```

Expected: Returns ALL organizations, not filtered by organizationId

#### Test 3: Test RolesGuard Bypass

Create a test endpoint (or use existing admin-only endpoint):

```typescript
// In any controller
@Get('test-admin-only')
@Roles('admin')  // Only admins can access
async testAdminRoute(@CurrentUser() user: User) {
  return { message: 'You are an admin', user };
}
```

Test with super admin JWT:
```bash
curl -X GET http://localhost:3001/api/test-admin-only \
  -H "Authorization: Bearer $JWT"
```

Expected: ✅ Success (even though super_admin !== 'admin', the RolesGuard should bypass)

#### Test 4: Test SuperAdminGuard

Create super admin-only endpoint:

```typescript
@Get('admin/platform-stats')
@IsSuperAdmin()  // Only super admins can access
async getPlatformStats(@CurrentUser() user: User) {
  return {
    totalOrganizations: 10,
    totalUsers: 50,
    message: 'Platform-wide statistics'
  };
}
```

Test with regular admin JWT:
```bash
# Should return 403 Forbidden
```

Test with super admin JWT:
```bash
# Should return 200 OK with stats
```

### Step 6: Verify Database Changes

Run these verification queries in Supabase SQL Editor:

```sql
-- Check role enum includes super_admin
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'users_role_check';
-- Should show: role IN ('admin', 'manager', 'viewer', 'super_admin')

-- Check organization_id is nullable
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'organization_id';
-- Should show: YES

-- Check super_admin_metadata column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'super_admin_metadata';
-- Should show: jsonb

-- Check audit_logs table exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'audit_logs';
-- Should return: audit_logs

-- Check is_super_admin function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'is_super_admin';
-- Should return: is_super_admin

-- View RLS policies for super admin
SELECT tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%super%';
-- Should show multiple policies with 'super' in name
```

## 🐛 Troubleshooting

### Error: "Environment variables are required"
- Check `backend/.env` file exists
- Verify Supabase credentials are correct
- Restart backend server after adding .env

### Error: "role must be one of: admin, manager, viewer"
- Migration not applied yet
- Re-run the migration SQL in Supabase

### Error: "User profile not found in database"
- User exists in Supabase Auth but not in users table
- Run the INSERT query from Step 3

### Error: "organizationId is null"
- This is correct for super_admin users!
- Regular users must have organizationId
- Super admins have organizationId = null

### Backend won't start
- Check all environment variables are set
- Check Supabase is accessible
- Check backend/package.json has all dependencies
- Run `npm install` if needed

## ✅ Success Criteria

Phase 1 is successfully tested when:

- ✅ Backend compiles with 0 TypeScript errors
- ✅ Backend starts without errors
- ✅ Migration applied successfully
- ✅ Super admin user created
- ✅ Super admin can authenticate
- ✅ Super admin has null organizationId
- ✅ Super admin can access all organizations
- ✅ RolesGuard allows super admin through all role checks
- ✅ SuperAdminGuard blocks non-super-admins
- ✅ Database schema includes all new fields and tables

## 📊 Current Status

**Compilation**: ✅ PASSED (0 errors)
**Migration**: ⏳ Ready to apply
**Backend Server**: ⏳ Needs Supabase credentials
**Testing**: ⏳ Waiting for migration + credentials

## 🎯 Next Phase

Once Phase 1 testing is complete, we can proceed to:

**Phase 2: Backend API - Platform Admin Endpoints**
- Create AdminModule
- Implement AuditLogService
- Build /admin/* endpoints
- Platform-wide organization management
- User impersonation API
- Platform analytics

Ready to proceed when you:
1. Apply the migration
2. Configure Supabase credentials
3. Create super admin user
4. Verify authentication works
