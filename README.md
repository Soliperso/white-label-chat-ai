# ChatForge

[![CI](https://github.com/Soliperso/white-label-chat-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/Soliperso/white-label-chat-ai/actions/workflows/ci.yml)
[![CD](https://github.com/Soliperso/white-label-chat-ai/actions/workflows/cd.yml/badge.svg)](https://github.com/Soliperso/white-label-chat-ai/actions/workflows/cd.yml)
[![Security](https://github.com/Soliperso/white-label-chat-ai/actions/workflows/security.yml/badge.svg)](https://github.com/Soliperso/white-label-chat-ai/actions/workflows/security.yml)
[![License](https://img.shields.io/badge/license-TBD-blue.svg)](LICENSE)

White-Label AI Chat Widget Platform - A SaaS platform that allows agencies, SaaS companies, and enterprises to embed AI-powered chat widgets into their websites with full white-label branding.

## Project Structure

```
chatforge/
├── frontend/          # Next.js frontend dashboard
├── backend/           # NestJS backend API
├── docker-compose.yml # Docker services (PostgreSQL, Redis)
└── README.md
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: TBD (shadcn/ui, Radix UI, or custom)

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Authentication**: JWT (to be implemented)

### Infrastructure
- **Containerization**: Docker
- **Cloud**: TBD (AWS/GCP/Azure)
- **AI Provider**: TBD (OpenAI/Anthropic)
- **Vector DB**: TBD (Pinecone/Qdrant/Weaviate)

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd chatforge
```

### 2. Set up environment variables

```bash
# Copy root environment file
cp .env.example .env

# Copy backend environment file
cp backend/.env.example backend/.env

# Copy frontend environment file
cp frontend/.env.example frontend/.env
```

Edit the `.env` files as needed. The defaults will work for local development.

### 3. Start the databases

Start PostgreSQL and Redis using Docker:

```bash
docker-compose up -d
```

Verify the services are running:

```bash
docker-compose ps
```

### 4. Install dependencies

```bash
# Install root dependencies
npm install

# Or install for each workspace
npm install --workspace=frontend
npm install --workspace=backend
```

### 5. Run the development servers

Start both frontend and backend in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Frontend only (runs on http://localhost:3000)
npm run dev:frontend

# Backend only (runs on http://localhost:3001)
npm run dev:backend
```

### 6. Access the application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## Available Scripts

### Root Level

- `npm run dev` - Run both frontend and backend in development mode
- `npm run build` - Build both frontend and backend
- `npm run dev:frontend` - Run frontend only
- `npm run dev:backend` - Run backend only

### Frontend

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend

```bash
cd backend
npm run start:dev    # Start development server with watch mode
npm run build        # Build for production
npm run start:prod   # Start production server
npm test             # Run tests
```

## Database Management

### Access PostgreSQL

```bash
# Using docker exec
docker exec -it chatforge-postgres psql -U postgres -d chatforge

# Or using a PostgreSQL client
# Host: localhost
# Port: 5432
# Database: chatforge
# Username: postgres
# Password: postgres
```

### Access Redis

```bash
# Using docker exec
docker exec -it chatforge-redis redis-cli

# Test connection
docker exec -it chatforge-redis redis-cli ping
```

### Stop and Clean Up

```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Project Roadmap

### MVP Phase (Current)
- [x] Project setup and infrastructure
- [x] Basic frontend and backend scaffolding
- [ ] Authentication system
- [ ] Multi-tenant architecture
- [ ] Organization and client management
- [ ] Widget creation and configuration
- [ ] AI training pipeline
- [ ] Chat widget (embeddable)
- [ ] Basic analytics and chat history

### Post-MVP
- [ ] Advanced analytics and funnels
- [ ] Deep white-labeling (custom domains)
- [ ] Multiple AI provider support
- [ ] Advanced lead capture and CRM integration
- [ ] Voice AI support
- [ ] Mobile SDK

## Architecture

### Multi-Tenant Design

The platform supports multiple organizations (agencies) and their client sub-accounts. Each tenant has isolated data, branding, and configurations.

### Key Features
1. **Multi-tenant dashboard** - Agencies manage multiple client accounts
2. **White-label branding** - Custom logos, colors, and domain support
3. **AI-powered chat** - RAG-based responses using custom knowledge bases
4. **Widget embedding** - Simple JavaScript snippet for any website
5. **Analytics** - Conversation tracking, lead capture, and usage metrics

## CI/CD

ChatForge uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline includes:

- **Automated testing** - Unit, integration, and e2e tests
- **Code quality checks** - Linting, formatting, and complexity analysis
- **Security scanning** - CodeQL, dependency scanning, and secret detection
- **Docker builds** - Multi-stage optimized images
- **Automated deployments** - Staging and production environments
- **Dependency updates** - Automated PRs via Dependabot

For detailed documentation, see [CI/CD Documentation](docs/CI-CD.md).

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages (conventional commits)

### Security
- Never commit `.env` files
- Use environment variables for all secrets
- Validate all user inputs
- Implement proper RBAC (Role-Based Access Control)

## Contributing

TBD - Contribution guidelines to be added

## License

TBD - License to be determined

## Support

For questions or issues, please contact the development team.

---

Built with ❤️ by the ChatForge team
