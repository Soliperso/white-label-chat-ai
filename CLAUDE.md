# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ChatForge** is a white-label AI chat widget SaaS platform that allows agencies, SaaS companies, and enterprises to embed AI-powered chat widgets into their websites. The platform uses retrieval-augmented generation (RAG) to answer user questions based on website content, uploaded documents, and custom knowledge bases.

**Key Product Concepts:**
- **Multi-tenant architecture**: Agencies (organizations) manage multiple client sub-accounts
- **White-label branding**: Clients can customize logos, colors, and remove platform branding
- **Widget embedding**: Simple JavaScript snippet for any website
- **AI training**: Upload URLs, documents (PDF, DOCX, TXT), or manual Q&A pairs
- **RAG pipeline**: Vector DB retrieval + LLM generation with confidence scoring and fallback

See [PRD.md](PRD.md) for complete product requirements.

## Architecture

### Monorepo Structure

This is an **npm workspaces** monorepo with two main applications:

```
chatforge/
├── frontend/          # Next.js dashboard (port 3000)
├── backend/           # NestJS API (port 3001)
└── docker-compose.yml # PostgreSQL + Redis
```

### Frontend (Next.js)
- **Framework**: Next.js 16 with App Router (NOT Pages Router)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **Import alias**: `@/*` maps to root of frontend directory

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL via TypeORM
- **ORM**: TypeORM with `synchronize: true` in development (auto-sync schema)
- **Caching**: Redis (configured but not yet implemented)
- **Validation**: Global ValidationPipe with `whitelist: true` and `transform: true`
- **CORS**: Enabled for frontend URL (default: `http://localhost:3000`)
- **Import alias**: `@/*` maps to `src/*`

### Database Design Considerations

When implementing the database schema, keep in mind:

1. **Multi-tenancy**: Use `organizationId` foreign keys on all tenant-scoped tables
2. **Hierarchy**: Organizations (agencies) → Clients → Widgets → Conversations
3. **RBAC**: Four roles: Super Admin (platform owner), Admin, Manager, Viewer (see PRD section 7.5)
4. **Soft deletes**: Consider for organizations, widgets, and user data (GDPR compliance)
5. **Data isolation**: Critical for security - tenant data must never leak across organizations (except for super admin)

### AI Integration (Future)

When implementing AI features:
- **Provider abstraction layer**: Design for swappable LLM providers (OpenAI, Anthropic, etc.)
- **Vector DB**: Will use Pinecone, Qdrant, or Weaviate (TBD)
- **RAG pipeline**: Document chunking → Embeddings → Vector storage → Retrieval → LLM generation
- **Confidence scoring**: Track confidence and implement fallback responses

## Development Commands

### Initial Setup

```bash
# Set up environment variables (required for first run)
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start databases
docker compose up -d

# Install all dependencies
npm install
```

### Running Development Servers

```bash
# Run both frontend and backend concurrently
npm run dev

# Run individually
npm run dev:frontend    # Frontend only (port 3000)
npm run dev:backend     # Backend only (port 3001)
```

### Building

```bash
# Build both workspaces
npm run build

# Build individually
npm run build:frontend
npm run build:backend
```

### Backend-Specific Commands

```bash
cd backend

# Development
npm run start:dev       # Watch mode with auto-reload
npm run start:debug     # Debug mode with watch

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:cov        # With coverage
npm run test:e2e        # End-to-end tests

# Linting & Formatting
npm run lint            # ESLint with auto-fix
npm run format          # Prettier
```

### Frontend-Specific Commands

```bash
cd frontend

# Development
npm run dev             # Development server with hot reload

# Linting
npm run lint            # Next.js ESLint
```

### Database Management

```bash
# Access PostgreSQL
docker exec -it chatforge-postgres psql -U postgres -d chatforge

# Access Redis
docker exec -it chatforge-redis redis-cli

# Check database services
docker compose ps

# Stop services
docker compose down

# Reset databases (WARNING: deletes all data)
docker compose down -v
```

## Configuration

### Environment Variables

Three `.env` files are used:

1. **Root `.env`**: Database connection variables (shared context)
2. **`backend/.env`**: Backend-specific config (DB, Redis, JWT, AI providers)
3. **`frontend/.env`**: Frontend-specific (API URL)

**Important**:
- TypeORM `synchronize` is enabled in development (auto-creates tables from entities)
- Switch to migrations before production
- Never commit `.env` files

### TypeORM Entity Registration

When creating new entities in `backend/src/`:
1. Define the entity class with `@Entity()` decorator
2. Register in `app.module.ts` → `TypeOrmModule.forRoot({ entities: [YourEntity] })`
3. TypeORM will auto-sync schema in development

## Key Implementation Patterns

### NestJS Module Organization

Follow NestJS modular architecture:
- Create feature modules (e.g., `OrganizationsModule`, `WidgetsModule`, `AuthModule`)
- Use `@nestjs/cli` to generate: `nest g module <name>`, `nest g controller <name>`, `nest g service <name>`
- Import feature modules in `app.module.ts`
- Use `@Injectable()` for services and dependency injection

### Multi-Tenant Data Access

When implementing data access layers:
- Always filter by `organizationId` in queries
- Use guards/interceptors to inject tenant context from JWT
- Prevent cross-tenant data access in all queries
- Example: `SELECT * FROM widgets WHERE organizationId = $1`

### Next.js App Router Conventions

- **Server Components**: Default in App Router (use for data fetching)
- **Client Components**: Add `'use client'` directive when needed (interactivity, hooks)
- **Layouts**: `app/layout.tsx` wraps all pages
- **Routes**: File-based routing in `app/` directory
- **API Routes**: Use `app/api/` for backend proxy or use backend directly

### Validation

Backend uses `class-validator` decorators:
```typescript
class CreateWidgetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;
}
```

Global ValidationPipe automatically validates all DTOs.

## Current Status (MVP Phase)

**Completed:**
- ✅ Project setup and infrastructure
- ✅ Basic frontend and backend scaffolding
- ✅ Docker setup (PostgreSQL + Redis)

**Not Yet Implemented:**
- Authentication system (JWT planned)
- User management and RBAC (including super admin role)
- Multi-tenant database schema
- Organization/client management
- Widget creation and configuration
- AI training pipeline
- Chat widget (embeddable JS bundle)
- Analytics and chat history
- Stripe billing integration
- Super admin panel and platform-level features

**Next Steps (see PRD section 5.1 for MVP scope):**
1. Authentication & authorization (JWT + RBAC)
2. Database schema for multi-tenancy
3. Organization and client management
4. Widget configuration and embed code generation
5. AI training pipeline (URL crawling, file uploads, vector DB)
6. Chat widget frontend (standalone JS bundle)
7. Basic analytics and lead capture

## Hash Commands (Reusable Patterns)

Hash commands are shortcuts you can use when instructing Claude Code. They enforce consistent patterns across the codebase.

### #strict-ts
- Always use TypeScript strict mode
- Add JSDoc comments to all exported functions
- Prefer composition over inheritance
- Use explicit return types on functions
- No `any` types - use proper typing or `unknown`

### #supabase-auth
For Supabase authentication integration:
- Frontend: Use `createClient()` from `@/lib/supabase/client`
- Backend: Protect routes with `SupabaseJwtGuard` (applied globally)
- Public endpoints: Use `@Public()` decorator to bypass auth
- Access user: `@CurrentUser()` decorator in controllers
- Check roles: Use `@Roles()` decorator with `RolesGuard`
- Available roles: `super_admin`, `admin`, `manager`, `viewer`
- Token in headers: `Authorization: Bearer <supabase-jwt>`
- Super admin: Platform owner role with access to all organizations and tenants

### #api-endpoint
When creating NestJS API endpoints:
- Use proper HTTP method decorators (`@Get()`, `@Post()`, `@Put()`, `@Delete()`)
- Apply validation with DTOs and `class-validator`
- Return consistent response format (data, message, statusCode)
- Add `@ApiTags()` and `@ApiOperation()` for Swagger docs
- Use proper HTTP status codes via `@HttpCode()`
- Protected by default (SupabaseJwtGuard) - use `@Public()` to disable
- Apply `@Roles()` for RBAC when needed

### #dto
When creating DTOs (Data Transfer Objects):
- Use `class-validator` decorators (`@IsString()`, `@IsEmail()`, `@IsOptional()`, etc.)
- Separate Create/Update/Response DTOs
- Use `PartialType()` for update DTOs
- Add `@ApiProperty()` decorators for Swagger
- Place in feature's `dto/` directory
- Export from `index.ts` for clean imports

### #entity
When creating TypeORM entities:
- Extend base entity with common fields (id, createdAt, updatedAt)
- Use `@Entity()` decorator with explicit table name
- Add `organizationId` FK for multi-tenant tables
- Use UUID for primary keys (`@PrimaryGeneratedColumn('uuid')`)
- Use proper column types (`@Column()`, `@CreateDateColumn()`, `@UpdateDateColumn()`)
- Define relationships with `@ManyToOne()`, `@OneToMany()`, etc.
- Register in `app.module.ts` TypeORM entities array
- Consider soft deletes with `@DeleteDateColumn()` for GDPR compliance

### #multi-tenant
For multi-tenant data isolation:
- **CRITICAL**: Always filter queries by `organizationId` from `@CurrentUser()`
- Validate user has access to requested organization
- Use scoped repositories or query builders
- Never expose cross-tenant data (except for super admin)
- Example: `where: { organizationId: user.organizationId }`
- **Super admin exception**: If `user.role === 'super_admin'`, skip organization filtering to allow platform-wide access
- For regular admin operations, verify role before cross-org access
- Add database-level RLS policies in Supabase for extra security (with super admin bypass)

### #protected-route
For Next.js protected routes (with Supabase):
- Use middleware to check auth state (`middleware.ts`)
- Redirect to `/login` if unauthenticated
- Fetch user session with `createClient().auth.getSession()`
- Pass user context to client components via props
- Use `'use client'` only when needed for interactivity
- Validate permissions/roles for RBAC
- Protected routes: `/widgets`, `/settings`, `/training`, etc.
- Public routes: `/`, `/login`, `/register`, `/forgot-password`

### #client-component
For Next.js client components:
- Add `'use client'` directive at top of file
- Use React hooks (useState, useEffect, useContext)
- Keep client components small and focused
- Prefer server components when no interactivity needed
- Import from `@/` alias for absolute paths
- Use `useAuth()` context for user state (if available)
- Make API calls with `Authorization` header

### #server-component
For Next.js server components (default):
- NO `'use client'` directive
- Async functions allowed for data fetching
- Direct backend API calls with fetch
- No React hooks (useState, useEffect, etc.)
- Pass data to client components via props
- Use `cookies()` to access Supabase session on server

### #service
For NestJS services:
- Use `@Injectable()` decorator
- Implement business logic (not in controllers)
- Use dependency injection for repositories
- Handle errors with proper exceptions
- Return typed responses
- Add unit tests in `.spec.ts` file
- Accept `user` parameter for multi-tenant filtering
- Never trust client input - always validate

### #error-handling
For consistent error handling:
- Use NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`)
- Provide clear, user-friendly error messages
- Log errors with context using NestJS Logger
- Return proper HTTP status codes
- Don't expose sensitive info (stack traces, DB errors) to clients
- Handle Supabase errors gracefully
- Use try-catch for external API calls

### #validation
For input validation:
- Use DTOs with `class-validator` decorators
- Global ValidationPipe enabled in `main.ts` with `whitelist: true` and `transform: true`
- Use `@IsOptional()` for optional fields
- Custom validators when needed (e.g., `@IsHexColor()` for widget colors)
- Validate at API boundary, trust internal calls
- Sanitize user input to prevent XSS

### #guard
For NestJS guards (auth/permissions):
- `SupabaseJwtGuard`: Validates Supabase JWT tokens (global)
- `RolesGuard`: Enforces role-based access control
- `@Public()`: Bypass authentication (for public endpoints)
- `@Roles('admin', 'manager')`: Require specific roles
- `@Roles('super_admin')`: Restrict to platform owner only
- Super admin automatically passes all role checks (has all permissions)
- Guards extract user from JWT and attach to `request.user`
- Guards run before route handlers
- Return boolean or throw exceptions

### #super-admin
For implementing super admin (platform owner) functionality:
- **Role**: `super_admin` - highest privilege level, platform owner only
- **Access**: Bypass all organization/tenant restrictions
- **Use cases**: Support, debugging, platform analytics, impersonation, global settings
- **Implementation patterns**:
  - In services: Check `if (user.role === 'super_admin')` before filtering by `organizationId`
  - In RolesGuard: Super admin should pass all role checks automatically
  - In queries: Skip tenant filtering when super admin
  - Example: `const where = user.role === 'super_admin' ? {} : { organizationId: user.organizationId }`
- **Security considerations**:
  - Store super admin flag in Supabase user metadata or custom claims
  - Log all super admin actions for audit trail
  - Consider requiring MFA for super admin accounts
  - Never expose super admin status to frontend (check on backend only)
- **API endpoints for super admin**:
  - `/admin/*` routes - platform-level admin panel
  - List all organizations: `GET /admin/organizations`
  - Impersonate user/org: `POST /admin/impersonate`
  - Platform analytics: `GET /admin/analytics`
  - Global settings: `GET/PUT /admin/settings`
- **Frontend considerations**:
  - Hide super admin features from regular users
  - Show organization switcher in UI for super admin
  - Display banner when impersonating
  - Provide "View as Customer" functionality

### #widget-config
For widget configuration:
- Store branding settings (logo, colors, fonts) in widgets table
- Validate hex colors with `@IsHexColor()`
- Support white-label mode (hide ChatForge branding)
- Generate embed code snippet
- Use widget ID for iframe/script tag
- Example: `<script src="https://chatforge.com/widget/{widgetId}.js"></script>`

### #rag-pipeline
For RAG (Retrieval-Augmented Generation):
- **Data sources**: URLs, PDF/DOCX uploads, manual Q&A pairs
- **Pipeline**: Document → Chunking → Embeddings → Vector DB → Retrieval + LLM
- **Vector DB**: TBD (Pinecone, Qdrant, or Weaviate)
- **LLM provider**: Abstract for swappable providers (OpenAI, Anthropic)
- **Confidence scoring**: Track confidence and use fallback responses
- Store training sources in `training_sources` table with `organizationId`

### #test
For testing:
- Unit tests: `.spec.ts` files alongside source
- E2E tests: `test/` directory in backend
- Mock Supabase client in tests
- Mock external dependencies (Vector DB, LLM APIs)
- Test happy path and error cases
- Use descriptive test names (`should return user profile when authenticated`)
- Aim for >80% coverage on business logic
- Test multi-tenant isolation

### #migration
For database migrations (Supabase):
- Create SQL files in `supabase/migrations/` directory
- Use timestamp naming: `YYYYMMDDHHMMSS_description.sql`
- Include RLS policies for security
- Test migrations locally before production
- Use `npm run fix:auth` scripts for applying migrations programmatically
- Document breaking changes
- Always enable RLS on new tables

### #skills
Skill usage rules for quality assurance:
- **After any meaningful code change, always use:**
  - `tester` skill to design and run tests
  - `code-reviewer` skill to review the diff before finalizing
- **For UI or UX changes, use:**
  - `ux-consistency` skill to check alignment with existing patterns
- **Proactive usage:**
  - Use these skills automatically, don't wait for explicit requests
  - Skills should be invoked before claiming a task is complete
  - Skills help catch issues early and ensure quality

### #parallel-dev
Use multiple specialized agents in parallel to maximize development speed:

- **When to use parallel agents:**
  - Frontend + Backend features that are independent
  - Multiple API endpoints in different modules
  - Multiple database entities/migrations
  - Independent bug fixes across different files
  - Simultaneous documentation and code changes
  - Creating multiple similar components/pages

- **Available agent types:**
  - `general-purpose` - Complex multi-step tasks, code searches, research
  - `Bash` - Command execution, git operations, running tests
  - `Explore` - Fast codebase exploration, pattern finding
  - `Plan` - Implementation planning and architecture design

- **Best practices:**
  - Launch all agents in a **single message** for true parallelization
  - Ensure tasks are truly independent (no file conflicts)
  - Each agent should have clear, isolated scope
  - Avoid parallel edits to the same file
  - Combine/review results after all agents complete

- **Example parallel workflows:**
  - **Feature development:**
    - Agent 1: Backend (entity + DTO + service + controller)
    - Agent 2: Frontend (page + components + forms)
    - Agent 3: Database migration + RLS policies
    - Agent 4: Unit tests for backend

  - **Multi-module CRUD:**
    - Agent 1: Widget management endpoints
    - Agent 2: Training sources endpoints
    - Agent 3: Analytics endpoints
    - Agent 4: Organization management endpoints

  - **Bug fixes:**
    - Agent 1: Fix auth issue in backend
    - Agent 2: Fix form validation in frontend
    - Agent 3: Fix migration script

  - **Documentation + Implementation:**
    - Agent 1: Implement feature
    - Agent 2: Write API documentation
    - Agent 3: Update user guide

- **How to request:**
  - Simply say "in parallel" or "using parallel agents"
  - List the independent tasks to be done
  - Reference other hash commands for each task
  - Example: "Build widget CRUD in parallel using #api-endpoint, #entity, #dto, #protected-route"

## Reliability and Honesty Rules

**Never claim a task is complete until:**
- All changed code has been type-checked or compiled if applicable
- All relevant tests have been run or clearly described as missing
- The diff has been carefully reviewed for logic and edge cases

**Always explicitly describe:**
- What was tested
- How it was tested
- The results of testing

**When tests are missing or not runnable:**
- Clearly state this fact
- Propose how to add or run them
- Don't claim completion without testing

**Treat uncertainty as a blocker:**
- Ask clarifying questions instead of assuming
- Don't guess at requirements or implementation details
- Seek user input when multiple valid approaches exist

**Do not state or imply success if:**
- There are known TODOs or unfinished work
- Steps were skipped or simplified
- Assumptions remain unverified
- Tests haven't been run
- Code hasn't been compiled/type-checked

## Consistency Rules

**Follow existing patterns for:**
- Naming conventions (variables, functions, components, files)
- Folder structure and file organization
- Component architecture and composition patterns

**Match the current design system:**
- Colors (use Tailwind theme variables, not hardcoded values)
- Typography (font sizes, weights, line heights)
- Spacing (consistent use of Tailwind spacing scale)
- Component variants (button styles, form inputs, cards)

**Reuse before creating:**
- Check for existing components and utilities before building new ones
- Extend existing components rather than duplicating
- Use shared utilities and helper functions

**Keep user flows consistent:**
- Navigation patterns (breadcrumbs, back buttons, redirects)
- Form validation (error messages, field validation timing)
- Error handling (toast notifications, error states, fallbacks)
- Loading states (spinners, skeletons, progress indicators)

**Match existing patterns:**
- API calling patterns (error handling, response formatting)
- State management (React Context, server state, local state)
- Data fetching (server components vs client, caching strategies)

**When inconsistency is discovered, ask whether to:**
- Conform to the dominant pattern in the codebase, or
- Refactor older code toward the improved pattern

## Important Notes

- **TypeScript strict mode**: Both frontend and backend use strict TypeScript
- **CORS**: Backend pre-configured for frontend at `http://localhost:3000`
- **Port defaults**: Frontend (3000), Backend (3001), PostgreSQL (5432), Redis (6379)
- **Database auto-sync**: TypeORM synchronize is ON in development - schema changes auto-apply
- **Workspace commands**: Use `npm run <script> --workspace=<frontend|backend>` from root
