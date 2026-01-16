# ChatForge Super Admin - Quick Start Guide

## 🎉 What's Been Built

You now have a complete **Super Admin** system with **Phase 1** and **Phase 2** implemented!

### Phase 1: Infrastructure ✅
- Super admin role in database
- Authentication and authorization guards
- Audit logging system
- RLS policy bypass for super admins

### Phase 2: Admin API ✅
- **20 REST API endpoints** for platform management
- Organization management (create, update, suspend)
- User management (update, suspend, promote to super admin)
- Platform analytics and reporting
- Complete audit trail
- Export capabilities (CSV/JSON)

## 🚀 Quick Start (5 minutes)

### 1. Setup Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your Supabase credentials
```

### 2. Install Dependencies

```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

### 3. Apply Database Migration

1. Go to https://app.supabase.com
2. SQL Editor → New Query
3. Copy contents of `supabase/migrations/20260116000001_add_super_admin_role.sql`
4. Paste and Run

### 4. Create Super Admin User

1. Supabase Dashboard → Authentication → Users → Add User
2. Copy the user UID
3. SQL Editor → Run:

```sql
INSERT INTO users (id, email, first_name, last_name, role, organization_id, is_active, is_email_verified)
VALUES ('<USER_UID>', 'admin@yourplatform.com', 'Platform', 'Admin', 'super_admin', NULL, true, true);
```

### 5. Start the Application

```bash
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### 6. Test It!

```bash
# Login and get JWT token
export JWT="your-jwt-token"

# Test platform stats
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/admin/analytics/platform | jq
```

## 📚 Complete Documentation

- **`docs/how-to-run-and-test.md`** - Detailed setup guide with troubleshooting
- **`docs/phase1-super-admin-implementation.md`** - Phase 1 technical details
- **`docs/phase2-admin-api-implementation.md`** - Phase 2 API reference
- **`docs/phase1-testing-guide.md`** - Phase 1 testing instructions
- **`docs/apply-migration-supabase.md`** - Migration guide

## 🎯 What Can You Do Now?

### As a Super Admin, you can:

1. **Manage ALL organizations** (not just your own)
   - List, view, create, update, suspend, activate

2. **Manage ALL users** across all organizations
   - List, view, update, suspend, activate
   - **Promote users to super admin**

3. **View platform analytics**
   - Total organizations, users, training data
   - Growth metrics over time
   - Export reports

4. **View complete audit trail**
   - Every action logged with who, what, when
   - Export audit logs to CSV

## 📋 API Endpoints (20 total)

### Organizations (7)
- `GET /admin/organizations` - List all
- `GET /admin/organizations/stats` - Statistics
- `GET /admin/organizations/:id` - Details
- `POST /admin/organizations` - Create
- `PATCH /admin/organizations/:id` - Update
- `POST /admin/organizations/:id/suspend` - Suspend
- `POST /admin/organizations/:id/activate` - Activate

### Users (8)
- `GET /admin/users` - List all
- `GET /admin/users/stats` - Statistics
- `GET /admin/users/:id` - Details
- `PATCH /admin/users/:id` - Update
- `POST /admin/users/:id/suspend` - Suspend
- `POST /admin/users/:id/activate` - Activate
- `POST /admin/users/:id/promote-super-admin` - Promote ⚠️
- `POST /admin/users/:id/impersonate` - Impersonate (Phase 4)

### Analytics (4)
- `GET /admin/analytics/platform` - Dashboard
- `GET /admin/analytics/growth` - Growth metrics
- `GET /admin/analytics/usage` - Usage metrics
- `GET /admin/analytics/export` - Export report

### Audit Logs (2)
- `GET /admin/audit-logs` - View logs
- `GET /admin/audit-logs/export` - Export to CSV

## 🔒 Security Features

- ✅ All endpoints require super admin authentication
- ✅ Every action logged to audit trail
- ✅ Can't suspend own account
- ✅ Can't demote own super admin role
- ✅ 403 Forbidden for non-super-admins
- ✅ Critical actions logged at WARNING level

## 🐛 Troubleshooting

**Backend won't start?**
- Check `backend/.env` has correct Supabase credentials
- Run `npm install` again

**Can't login?**
- Verify user exists in Supabase Auth
- Verify user in `users` table with `role = 'super_admin'`

**Admin endpoints return 403?**
- Check user role: `SELECT role FROM users WHERE email = 'your-email'`
- Should be `'super_admin'` not `'admin'`

**See full troubleshooting guide**: `docs/how-to-run-and-test.md`

## 🎨 View Changes in Browser

### Frontend (Auto-Reload)
1. Open http://localhost:3000
2. Edit any file in `frontend/`
3. Save - browser auto-refreshes

### Backend (Auto-Compile)
1. Backend running at http://localhost:3001
2. Edit any file in `backend/src/`
3. Save - automatically recompiles
4. Test with curl/Postman

### Database (Supabase Dashboard)
1. Go to https://app.supabase.com
2. Select your project
3. View:
   - **Table Editor**: See data in tables
   - **SQL Editor**: Run queries
   - **Database Logs**: See query logs
   - **Auth**: Manage users

## 🚦 Next Steps

### Immediate:
1. **Run and test** - Follow Quick Start above
2. **Explore APIs** - Test all 20 endpoints
3. **Check audit logs** - See your actions logged

### Phase 3 (Frontend):
- Admin dashboard UI
- Organizations management page
- Users management page
- Analytics page
- Audit logs viewer

### Phase 4 (Advanced):
- User impersonation
- Organization switcher
- MFA for super admins
- IP allowlisting

## 📊 Current Status

| Phase | Status | Endpoints | Files |
|-------|--------|-----------|-------|
| Phase 1: Infrastructure | ✅ Complete | - | 15 files |
| Phase 2: Admin API | ✅ Complete | 20 REST APIs | 15 files |
| Phase 3: Frontend UI | ⏳ Pending | - | - |
| Phase 4: Impersonation | ⏳ Pending | - | - |
| Phase 5: Security | ⏳ Pending | - | - |

## 💡 Pro Tips

1. **Use jq for pretty JSON**:
   ```bash
   curl -H "Authorization: Bearer $JWT" http://localhost:3001/admin/users | jq
   ```

2. **Check audit logs after every action**:
   ```bash
   curl -H "Authorization: Bearer $JWT" http://localhost:3001/admin/audit-logs | jq
   ```

3. **Export reports to CSV**:
   ```bash
   curl -H "Authorization: Bearer $JWT" \
     "http://localhost:3001/admin/analytics/export?format=csv" > report.csv
   ```

4. **Monitor backend logs** - Watch the terminal for errors and audit entries

5. **Use Postman/Insomnia** - Import endpoints for easier testing

## 🎓 Learn More

- **CLAUDE.md** - Project overview and hash commands
- **PRD.md** - Product requirements document
- **Phase 1 docs** - Technical implementation details
- **Phase 2 docs** - API reference and examples

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can login as super admin
- [ ] `/admin/analytics/platform` returns data
- [ ] `/admin/organizations` returns list
- [ ] `/admin/users` returns list
- [ ] `/admin/audit-logs` shows actions
- [ ] Regular users get 403 on admin endpoints

When all checked, you're ready to start Phase 3! 🚀

---

**Need help?** Check `docs/how-to-run-and-test.md` for detailed troubleshooting.
