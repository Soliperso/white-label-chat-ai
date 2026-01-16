# How to Run and Test the Application

## Quick Start Guide

This guide will help you get the ChatForge application running locally and test the super admin functionality we just built.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm
- Supabase account (https://supabase.com)
- Git

## 🚀 Step-by-Step Setup

### Step 1: Environment Configuration

#### 1.1 Create Backend Environment File

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# API Configuration
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

**Where to find these values:**

1. Go to https://app.supabase.com
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **SUPABASE_URL**: Project URL (e.g., `https://abcdefgh.supabase.co`)
   - **SUPABASE_SERVICE_ROLE_KEY**: `service_role` key (under "Project API keys")
   - **SUPABASE_JWT_SECRET**: JWT Secret (under "JWT Settings")

#### 1.2 Create Frontend Environment File

Create `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find:**
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: `anon` key from Supabase API settings (same page as before)

### Step 2: Apply Database Migration

#### Option A: Using Supabase Dashboard (Recommended)

1. Open https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of:
   ```
   supabase/migrations/20260116000001_add_super_admin_role.sql
   ```
6. Paste into the SQL editor
7. Click "Run" (or press Ctrl+Enter)
8. Wait for "Success. No rows returned" message

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

#### Verify Migration Success

Run these queries in SQL Editor to verify:

```sql
-- Check super_admin role exists
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'users_role_check';
-- Should show: role IN ('admin', 'manager', 'viewer', 'super_admin')

-- Check audit_logs table exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'audit_logs';
-- Should return: audit_logs

-- Check is_super_admin function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'is_super_admin';
-- Should return: is_super_admin
```

### Step 3: Install Dependencies

From the project root:

```bash
# Install all dependencies (frontend + backend)
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

### Step 4: Create Your Super Admin User

#### 4.1 Create Auth User in Supabase

1. Go to Supabase Dashboard → "Authentication" → "Users"
2. Click "Add User" → "Create new user"
3. Enter:
   - **Email**: `admin@yourplatform.com` (or your preferred email)
   - **Password**: (create a strong password)
   - **Auto Confirm User**: ✅ (check this)
4. Click "Create user"
5. **Copy the User UID** (you'll need this in the next step)

#### 4.2 Insert User into Users Table

1. Go to Supabase Dashboard → "SQL Editor"
2. Run this query (replace `<USER_UID>` with the UID from step 4.1):

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
  '<USER_UID>',  -- Replace with the UID from Supabase Auth
  'admin@yourplatform.com',
  'Platform',
  'Admin',
  'super_admin',
  NULL,  -- Super admins have no organization
  true,
  true
);
```

3. Verify the insert:

```sql
SELECT id, email, role, organization_id FROM users WHERE role = 'super_admin';
```

You should see your super admin user with `organization_id` = NULL.

### Step 5: Start the Application

#### Option A: Start Both (Frontend + Backend)

From project root:

```bash
npm run dev
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

#### Option B: Start Individually

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Verify Backend Started

You should see:
```
[Nest] Starting Nest application...
[Nest] SupabaseService initialized
[Nest] Application is running on: http://localhost:3001
```

#### Verify Frontend Started

You should see:
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
- Ready in Xs
```

## 🌐 Accessing the Application

### Frontend (Dashboard)

1. Open browser: **http://localhost:3000**
2. You should see the login page
3. Login with your super admin credentials:
   - Email: `admin@yourplatform.com`
   - Password: (the password you created)

### Backend API

The API is running at: **http://localhost:3001**

#### Check API Health

```bash
curl http://localhost:3001
```

Expected: Server response (could be 404 for root, that's OK)

## 🧪 Testing Super Admin Functionality

### Test 1: Login as Super Admin

1. Go to http://localhost:3000
2. Click "Login"
3. Enter your super admin email and password
4. Click "Sign In"
5. You should be redirected to the dashboard

### Test 2: Test Admin API Endpoints

First, get your JWT token:

**Option A: From Browser DevTools**
1. Open DevTools (F12)
2. Go to "Application" → "Local Storage" → http://localhost:3000
3. Find the Supabase auth token
4. Copy the `access_token` value

**Option B: Login via API**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourplatform.com",
    "password": "your-password"
  }'
```

Copy the `access_token` from the response.

#### Test Admin Endpoints

```bash
# Set your JWT token
export JWT="your-jwt-token-here"

# 1. Test Platform Statistics
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/analytics/platform | jq

# Expected response:
# {
#   "organizations": { "total": X, "active": Y, ... },
#   "users": { "total": X, "active": Y, ... },
#   "training": { ... }
# }

# 2. List All Organizations
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/organizations | jq

# Expected: List of all organizations across the platform

# 3. List All Users
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/users | jq

# Expected: List of all users across all organizations

# 4. Get Organization Statistics
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/organizations/stats | jq

# Expected:
# {
#   "total": X,
#   "active": Y,
#   "suspended": Z,
#   "newThisMonth": N
# }

# 5. Get User Statistics
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/users/stats | jq

# Expected:
# {
#   "total": X,
#   "active": Y,
#   "suspended": Z,
#   "roleBreakdown": { ... },
#   "newThisMonth": N
# }

# 6. View Audit Logs
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/audit-logs | jq

# Expected: All actions you just performed should be logged!
```

### Test 3: Verify Authorization Works

Try accessing admin endpoint with a regular user (should fail):

```bash
# Create a regular user first (via Supabase dashboard)
# Then login as that user and get their JWT

export REGULAR_JWT="regular-user-jwt-here"

# Try to access admin endpoint
curl -H "Authorization: Bearer $REGULAR_JWT" \
  http://localhost:3001/admin/organizations

# Expected response: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Access denied. This resource is restricted to platform administrators only."
# }
```

### Test 4: Create an Organization (Super Admin)

```bash
curl -X POST http://localhost:3001/admin/organizations \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Organization",
    "slug": "test-org",
    "primaryColor": "#3B82F6"
  }' | jq

# Expected: New organization created
# Then check audit logs to see it was logged
```

### Test 5: Update a User

```bash
# First, get a user ID
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/users | jq '.data[0].id'

# Copy the ID, then update that user
export USER_ID="user-id-here"

curl -X PATCH http://localhost:3001/admin/users/$USER_ID \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "role": "admin"
  }' | jq

# Check audit logs again - should show the update
```

## 🎨 View Changes in Browser

### Frontend Development

When you make changes to frontend files:

1. **Changes auto-reload** - Next.js has hot module replacement
2. Open http://localhost:3000 in your browser
3. Edit any file in `frontend/src/` or `frontend/app/`
4. Save the file
5. Browser automatically refreshes with changes

**Example: Try changing the login page**

1. Open `frontend/app/login/page.tsx`
2. Change some text
3. Save
4. Watch the browser update automatically

### Backend Development

When you make changes to backend files:

1. **NestJS watches files** - automatically recompiles
2. See console output for compilation status
3. API endpoints update automatically
4. Test changes with curl or Postman

**Example: Add a new admin endpoint**

1. Edit `backend/src/admin/controllers/admin-organizations.controller.ts`
2. Add a new endpoint
3. Save - watch backend recompile
4. Test the new endpoint immediately

## 🔍 Viewing Logs

### Backend Logs

Watch the terminal where you ran `npm run dev:backend`. You'll see:
- Request logs
- Audit log entries
- SQL queries (if debug mode enabled)
- Error messages

### Frontend Logs

- Check browser DevTools Console (F12)
- Check terminal where you ran `npm run dev:frontend`

### Database Logs

View in Supabase Dashboard → "Database" → "Logs"

## 📱 API Documentation (Swagger)

If Swagger is configured (check `backend/src/main.ts`):

1. Go to: http://localhost:3001/api/docs
2. You'll see interactive API documentation
3. Can test endpoints directly from the browser

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required"
- **Fix**: Check `backend/.env` file exists and has correct values
- **Verify**: `cat backend/.env` should show your Supabase credentials

**Error**: "Cannot find module '@nestjs/common'"
- **Fix**: Run `npm install` from project root
- **Verify**: `ls node_modules/@nestjs/common` should exist

### Frontend Won't Start

**Error**: Port 3000 already in use
- **Fix**: `lsof -ti:3000 | xargs kill -9`
- Or change port: `PORT=3001 npm run dev`

**Error**: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- **Fix**: Check `frontend/.env.local` exists
- **Note**: Must be `.env.local` not just `.env`

### Can't Login

**Error**: "Invalid login credentials"
- **Fix**: Check that you created the user in Supabase Auth
- **Fix**: Check password is correct
- **Fix**: Verify user is in `users` table with `role = 'super_admin'`

**Error**: "User profile not found in database"
- **Fix**: Run the INSERT query from Step 4.2 again
- **Verify**: `SELECT * FROM users WHERE email = 'admin@yourplatform.com'`

### Admin Endpoints Return 403

**Error**: "Access denied. This resource is restricted to platform administrators only."
- **Fix**: Verify your user has `role = 'super_admin'` in database
- **Query**: `SELECT id, email, role FROM users WHERE id = 'your-user-id'`
- **If wrong role**: `UPDATE users SET role = 'super_admin', organization_id = NULL WHERE id = 'your-user-id'`

### Migration Didn't Apply

**Symptoms**: Column doesn't exist, table doesn't exist
- **Fix**: Re-run the migration SQL in Supabase SQL Editor
- **Verify**: Run the verification queries from Step 2
- **Check**: Supabase Dashboard → "Database" → "Tables" - should see `audit_logs`

## 📊 Monitoring Your Application

### Check Backend Health

```bash
# Check if backend is running
curl http://localhost:3001

# Check specific endpoint health
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/analytics/platform
```

### Check Frontend Health

1. Open http://localhost:3000
2. Should see login page (or dashboard if logged in)
3. Check DevTools Console for errors

### Check Database Connection

```bash
# From backend directory
npm run start:dev

# Look for: "[Nest] SupabaseService initialized"
# If you see this, database connection is working
```

## 🎉 Success Criteria

You've successfully set up the application when:

- ✅ Backend starts without errors
- ✅ Frontend loads at http://localhost:3000
- ✅ You can login as super admin
- ✅ `/admin/analytics/platform` returns data
- ✅ `/admin/organizations` returns list
- ✅ `/admin/audit-logs` shows your actions
- ✅ Regular users get 403 on admin endpoints

## 🚀 Next Steps

Now that your app is running:

1. **Explore the Admin APIs** - Test all 20 endpoints
2. **Check Audit Logs** - See every action logged
3. **Create Test Data** - Add organizations and users
4. **Test Authorization** - Try with different user roles
5. **Start Phase 3** - Build the frontend admin panel UI

## 📞 Need Help?

If you're stuck:
1. Check the logs (backend terminal + browser console)
2. Verify environment variables are set
3. Confirm migration was applied
4. Ensure super admin user exists
5. Check Supabase dashboard for any errors

Happy coding! 🎊
