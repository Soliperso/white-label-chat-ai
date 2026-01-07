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
3. **RBAC**: Three roles planned: Admin, Manager, Viewer (see PRD section 7.5)
4. **Soft deletes**: Consider for organizations, widgets, and user data (GDPR compliance)
5. **Data isolation**: Critical for security - tenant data must never leak across organizations

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
- User management and RBAC
- Multi-tenant database schema
- Organization/client management
- Widget creation and configuration
- AI training pipeline
- Chat widget (embeddable JS bundle)
- Analytics and chat history
- Stripe billing integration

**Next Steps (see PRD section 5.1 for MVP scope):**
1. Authentication & authorization (JWT + RBAC)
2. Database schema for multi-tenancy
3. Organization and client management
4. Widget configuration and embed code generation
5. AI training pipeline (URL crawling, file uploads, vector DB)
6. Chat widget frontend (standalone JS bundle)
7. Basic analytics and lead capture

## Important Notes

- **TypeScript strict mode**: Both frontend and backend use strict TypeScript
- **CORS**: Backend pre-configured for frontend at `http://localhost:3000`
- **Port defaults**: Frontend (3000), Backend (3001), PostgreSQL (5432), Redis (6379)
- **Database auto-sync**: TypeORM synchronize is ON in development - schema changes auto-apply
- **Workspace commands**: Use `npm run <script> --workspace=<frontend|backend>` from root
