# Supabase Authentication Setup

This project uses **Supabase Auth** for authentication. The backend validates Supabase JWT tokens to protect routes.

## Required Environment Variables

### Backend (`backend/.env`)

```env
# Supabase Configuration
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
```

### Frontend (`frontend/.env.local` or `.env`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## How to Get Supabase Credentials

1. **Login to Supabase Dashboard**: https://app.supabase.com
2. **Select Your Project**
3. **Go to Settings** → **API**
4. Copy the following values:
   - **Project URL** → Use for `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **JWT Secret** → Use for `SUPABASE_JWT_SECRET` (found under "JWT Settings")

## Authentication Flow

### Frontend
1. User registers/logs in via Supabase Auth (`/login`, `/register` pages)
2. Supabase manages the JWT token in cookies
3. Frontend fetches user profile from `public.users` table
4. All API calls include `Authorization: Bearer <token>` header

### Backend
1. Supabase JWT guard validates tokens on all endpoints (except `@Public()`)
2. JWT strategy decodes token and fetches user from database
3. User object attached to `request.user` with role and organizationId
4. Roles guard enforces RBAC based on `@Roles()` decorator
5. Multi-tenant isolation via `organizationId` filtering

## User Roles

- **admin**: Full access to all organization data
- **manager**: Can manage training data, widgets, users
- **viewer**: Read-only access

## Protected Routes

All backend endpoints are protected by default unless marked with `@Public()`:

### Public Endpoints
- `GET /` - Hello world
- `GET /health` - Health check
- Widget chat endpoint (for embedded widgets)

### Protected Endpoints
All other endpoints require authentication:
- `GET /users/:id` - Viewer+
- `PATCH /users/:id/profile` - Viewer+ (own profile) / Admin (any profile)
- `GET /widgets/:widgetId/training/sources` - Viewer+
- `POST /widgets/:widgetId/training/sources/*` - Manager+
- `DELETE /training/sources/:sourceId` - Manager+

## Testing Authentication

1. Start the backend: `cd backend && npm run start:dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Register a new user at http://localhost:3000/register
4. Check Supabase dashboard to verify:
   - User created in `auth.users` table
   - Profile auto-created in `public.users` table (via trigger)
5. Login and make API calls from the dashboard
6. Check browser DevTools Network tab to see `Authorization` header

## Troubleshooting

### 401 Unauthorized Errors
- **Cause**: JWT token missing or invalid
- **Fix**: Check that frontend is sending `Authorization: Bearer <token>` header
- **Fix**: Verify `SUPABASE_JWT_SECRET` matches between Supabase dashboard and backend .env

### 403 Forbidden Errors
- **Cause**: User role doesn't match required roles for endpoint
- **Fix**: Check user role in database (`SELECT role FROM public.users WHERE id = 'user-id'`)
- **Fix**: Verify `@Roles()` decorator on endpoint allows your role

### User Not Found
- **Cause**: User exists in `auth.users` but not in `public.users`
- **Fix**: Check Supabase trigger is enabled: `/supabase/migrations/20260110000005_auto_create_user_profile.sql`
- **Fix**: Manually insert user in `public.users` table if needed

### CORS Errors
- **Cause**: Backend doesn't allow frontend origin
- **Fix**: Verify CORS config in `backend/src/main.ts` includes frontend URL

## Database Schema

### auth.users (Supabase managed)
- Stores authentication data (email, encrypted password, email verification status)
- Managed automatically by Supabase

### public.users (Custom table)
- Extends auth.users with app-specific data
- Fields: `id`, `email`, `firstName`, `lastName`, `role`, `organizationId`, `profilePictureUrl`, `isActive`
- Auto-created via database trigger when user signs up

### public.organizations
- Multi-tenant organization data
- Each user belongs to one organization

## Security Notes

1. **JWT Secret**: Never commit `SUPABASE_JWT_SECRET` to version control
2. **Row Level Security (RLS)**: Enabled on all tables to prevent data leaks
3. **Multi-tenancy**: All queries filter by `organizationId` from JWT
4. **Password Storage**: Passwords never stored in backend (Supabase handles)
5. **Token Refresh**: Supabase automatically refreshes tokens before expiry

## Migration from NestJS Auth

This project previously had a NestJS-based auth system that has been **removed** in favor of Supabase:

### Removed
- ❌ Mock NestJS auth endpoints (`/auth/login`, `/auth/register`)
- ❌ Password hashing with bcrypt
- ❌ JWT generation in backend
- ❌ `RefreshToken` entity
- ❌ Email verification logic in backend
- ❌ Password reset logic in backend

### New Supabase-Based System
- ✅ Supabase Auth handles all authentication
- ✅ Backend validates Supabase JWTs
- ✅ Guards protect routes automatically
- ✅ RBAC enforced via user roles
- ✅ Multi-tenant data isolation
