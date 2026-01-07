# Skills & Specialized Agents

Version: 1.0
Last Updated: 2026-01-04

## Overview

This document defines specialized agents (skills) that help organize and accelerate the development of the White-Label AI Chat Widget platform. Each skill is designed to handle specific aspects of the project, ensuring consistent quality, faster development cycles, and better code organization.

---

## Table of Contents

1. [Frontend Development Skills](#frontend-development-skills)
2. [Backend Development Skills](#backend-development-skills)
3. [AI & RAG Pipeline Skills](#ai--rag-pipeline-skills)
4. [DevOps & Infrastructure Skills](#devops--infrastructure-skills)
5. [Quality Assurance Skills](#quality-assurance-skills)
6. [Documentation Skills](#documentation-skills)
7. [Cross-Functional Skills](#cross-functional-skills)

---

## Frontend Development Skills

### 1. Widget Builder Agent
**Purpose:** Build and maintain the embeddable chat widget
**Responsibilities:**
- Create standalone JavaScript widget bundle
- Implement widget UI components (chat interface, minimized state, animations)
- Handle widget initialization and configuration
- Ensure responsive design for mobile and desktop
- Implement theming system (colors, fonts, positioning)
- Optimize bundle size and load performance

**Key Technologies:** Vanilla JS/TypeScript, CSS-in-JS, Rollup/Webpack
**Output:** Widget bundle, initialization script, configuration schema

**Usage Pattern:**
```bash
# Invoke when working on widget features
Task: "Update widget to support dark mode theme"
Agent: Widget Builder Agent
```

---

### 2. Dashboard UI Agent
**Purpose:** Build and maintain the admin dashboard interface
**Responsibilities:**
- Create React/Next.js components for dashboard pages
- Implement responsive layouts with Tailwind CSS
- Build forms for widget configuration, training data upload
- Create data visualization components for analytics
- Implement client-side validation and error handling
- Ensure accessibility standards (WCAG 2.1)

**Key Technologies:** React, Next.js, Tailwind CSS, shadcn/ui
**Output:** Dashboard pages, reusable components, form schemas

**Usage Pattern:**
```bash
# Invoke when building dashboard features
Task: "Create organization management page with CRUD operations"
Agent: Dashboard UI Agent
```

---

### 3. State Management Agent
**Purpose:** Design and implement client-side state architecture
**Responsibilities:**
- Design state management patterns for dashboard
- Implement context providers or state management library
- Handle API data fetching and caching strategies
- Manage authentication state and session handling
- Implement optimistic updates for better UX
- Handle real-time updates (WebSocket state sync)

**Key Technologies:** React Context, Zustand, TanStack Query, SWR
**Output:** State stores, hooks, data fetching utilities

**Usage Pattern:**
```bash
# Invoke when designing state flows
Task: "Implement real-time chat history updates in dashboard"
Agent: State Management Agent
```

---

## Backend Development Skills

### 4. API Architecture Agent
**Purpose:** Design and implement RESTful API endpoints
**Responsibilities:**
- Design API routes and endpoint structure
- Implement controllers and route handlers
- Create request/response DTOs and validation schemas
- Implement proper error handling and status codes
- Design API versioning strategy
- Create API documentation (OpenAPI/Swagger)

**Key Technologies:** Node.js, NestJS/Express, Zod/Joi
**Output:** API routes, controllers, validation schemas, API docs

**Usage Pattern:**
```bash
# Invoke when creating new API endpoints
Task: "Create RESTful endpoints for widget CRUD operations"
Agent: API Architecture Agent
```

---

### 5. Database Schema Agent
**Purpose:** Design and maintain database schemas and migrations
**Responsibilities:**
- Design multi-tenant database schema
- Create Prisma/TypeORM schemas and models
- Implement database migrations and versioning
- Design indexes for query optimization
- Ensure proper foreign key relationships
- Implement soft deletes and audit trails

**Key Technologies:** PostgreSQL, Prisma, TypeORM
**Output:** Database schemas, migration files, model definitions

**Usage Pattern:**
```bash
# Invoke when modifying database structure
Task: "Add tables for lead capture and analytics tracking"
Agent: Database Schema Agent
```

---

### 6. Multi-Tenancy Agent
**Purpose:** Implement tenant isolation and data segregation
**Responsibilities:**
- Design tenant identification strategy
- Implement tenant context middleware
- Ensure data isolation at query level
- Create tenant-scoped API endpoints
- Implement tenant provisioning and deprovisioning
- Handle cross-tenant security concerns

**Key Technologies:** PostgreSQL row-level security, middleware patterns
**Output:** Tenant middleware, scoped services, security policies

**Usage Pattern:**
```bash
# Invoke when implementing multi-tenant features
Task: "Ensure all API endpoints are properly tenant-scoped"
Agent: Multi-Tenancy Agent
```

---

### 7. Authentication & Authorization Agent
**Purpose:** Implement secure authentication and RBAC
**Responsibilities:**
- Implement JWT-based authentication
- Create role-based access control (Admin, Manager, Viewer)
- Implement password hashing and validation
- Create session management logic
- Implement API key generation for programmatic access
- Design permission checking middleware

**Key Technologies:** JWT, bcrypt, Passport.js
**Output:** Auth middleware, guards, role decorators, JWT utilities

**Usage Pattern:**
```bash
# Invoke when implementing security features
Task: "Add role-based permissions to widget management endpoints"
Agent: Authentication & Authorization Agent
```

---

## AI & RAG Pipeline Skills

### 8. RAG Pipeline Agent
**Purpose:** Build retrieval-augmented generation pipeline
**Responsibilities:**
- Implement document ingestion pipeline (PDFs, URLs, text)
- Create text chunking and preprocessing logic
- Integrate with vector database (Pinecone, Qdrant, Weaviate)
- Implement embedding generation
- Design retrieval and re-ranking strategies
- Implement context assembly for LLM prompts

**Key Technologies:** LangChain, LlamaIndex, Python/Node.js
**Output:** Ingestion pipeline, retrieval service, embedding utilities

**Usage Pattern:**
```bash
# Invoke when working on AI training features
Task: "Implement PDF document ingestion with chunking strategy"
Agent: RAG Pipeline Agent
```

---

### 9. LLM Integration Agent
**Purpose:** Integrate and manage LLM providers
**Responsibilities:**
- Create abstraction layer for multiple LLM providers
- Implement prompt engineering and templates
- Handle streaming responses
- Implement retry logic and fallback mechanisms
- Monitor token usage and costs
- Implement response validation and safety checks

**Key Technologies:** OpenAI SDK, Anthropic SDK, Langchain
**Output:** LLM service abstraction, prompt templates, safety filters

**Usage Pattern:**
```bash
# Invoke when integrating AI providers
Task: "Add support for Anthropic Claude as an alternative LLM provider"
Agent: LLM Integration Agent
```

---

### 10. Training Pipeline Agent
**Purpose:** Manage AI model training and data indexing
**Responsibilities:**
- Create training job queue and processing
- Implement URL crawling with depth limits
- Handle file upload processing (parse PDFs, DOCX)
- Implement manual Q&A pair management
- Create training status tracking and notifications
- Implement re-training and incremental updates

**Key Technologies:** Bull/BullMQ, Puppeteer/Playwright, pdf-parse
**Output:** Job workers, crawlers, file processors, training API

**Usage Pattern:**
```bash
# Invoke when building training features
Task: "Implement website URL crawler with configurable depth"
Agent: Training Pipeline Agent
```

---

### 11. Confidence Scoring Agent
**Purpose:** Implement response quality and confidence mechanisms
**Responsibilities:**
- Design confidence scoring algorithm
- Implement fallback response logic
- Create response validation rules
- Monitor hallucination detection
- Implement user feedback loops
- Create A/B testing for response strategies

**Key Technologies:** Custom scoring algorithms, LLM-based validation
**Output:** Confidence scoring service, fallback handlers

**Usage Pattern:**
```bash
# Invoke when improving AI response quality
Task: "Implement confidence threshold with graceful fallback responses"
Agent: Confidence Scoring Agent
```

---

## DevOps & Infrastructure Skills

### 12. Infrastructure Setup Agent
**Purpose:** Set up cloud infrastructure and deployment pipelines
**Responsibilities:**
- Design cloud architecture (AWS/GCP/Azure)
- Create Infrastructure as Code (Terraform/CloudFormation)
- Set up containerization with Docker
- Configure Kubernetes or container orchestration
- Implement CI/CD pipelines (GitHub Actions, GitLab CI)
- Set up monitoring and alerting

**Key Technologies:** Docker, Kubernetes, Terraform, GitHub Actions
**Output:** IaC files, Dockerfiles, CI/CD configs, deployment scripts

**Usage Pattern:**
```bash
# Invoke when setting up infrastructure
Task: "Create AWS infrastructure for production deployment"
Agent: Infrastructure Setup Agent
```

---

### 13. Performance Optimization Agent
**Purpose:** Optimize application performance and scalability
**Responsibilities:**
- Implement caching strategies (Redis)
- Optimize database queries and indexes
- Set up CDN for widget distribution
- Implement rate limiting and throttling
- Monitor and optimize API response times
- Implement horizontal scaling strategies

**Key Technologies:** Redis, CDN (CloudFront, Cloudflare), APM tools
**Output:** Caching layer, optimized queries, performance configs

**Usage Pattern:**
```bash
# Invoke when addressing performance issues
Task: "Implement Redis caching for frequently accessed widget configurations"
Agent: Performance Optimization Agent
```

---

### 14. Security Hardening Agent
**Purpose:** Implement security best practices and compliance
**Responsibilities:**
- Implement HTTPS/TLS configuration
- Set up SQL injection prevention
- Implement XSS and CSRF protection
- Configure CORS policies
- Implement API rate limiting
- Set up security headers and CSP
- Conduct security audits and penetration testing

**Key Technologies:** Helmet.js, CORS, Rate limiting, OWASP guidelines
**Output:** Security middleware, configs, audit reports

**Usage Pattern:**
```bash
# Invoke when implementing security features
Task: "Audit API endpoints for OWASP Top 10 vulnerabilities"
Agent: Security Hardening Agent
```

---

## Quality Assurance Skills

### 15. Test Automation Agent
**Purpose:** Create comprehensive test suites
**Responsibilities:**
- Write unit tests for business logic
- Create integration tests for API endpoints
- Implement E2E tests for critical user flows
- Set up test fixtures and mocks
- Configure test coverage reporting
- Implement visual regression testing for UI

**Key Technologies:** Jest, Vitest, Playwright, Cypress, React Testing Library
**Output:** Test suites, test configs, coverage reports

**Usage Pattern:**
```bash
# Invoke when implementing tests
Task: "Create E2E tests for widget embedding and chat flow"
Agent: Test Automation Agent
```

---

### 16. Code Review Agent
**Purpose:** Conduct code reviews and ensure quality standards
**Responsibilities:**
- Review code for best practices and patterns
- Check for security vulnerabilities
- Ensure code style consistency
- Validate test coverage
- Identify performance bottlenecks
- Suggest refactoring opportunities

**Key Technologies:** ESLint, Prettier, SonarQube
**Output:** Code review comments, refactoring suggestions

**Usage Pattern:**
```bash
# Invoke after completing features
Task: "Review authentication module implementation"
Agent: Code Review Agent
```

---

## Documentation Skills

### 17. API Documentation Agent
**Purpose:** Create and maintain API documentation
**Responsibilities:**
- Generate OpenAPI/Swagger specifications
- Create API reference documentation
- Write integration guides and examples
- Document authentication and authorization
- Create SDK usage examples
- Maintain versioning documentation

**Key Technologies:** Swagger/OpenAPI, Postman, Redoc
**Output:** API docs, integration guides, code examples

**Usage Pattern:**
```bash
# Invoke when documenting APIs
Task: "Generate comprehensive API documentation for widget endpoints"
Agent: API Documentation Agent
```

---

### 18. User Guide Agent
**Purpose:** Create end-user documentation and guides
**Responsibilities:**
- Write onboarding tutorials
- Create widget integration guides
- Document dashboard features
- Create video script outlines
- Write troubleshooting guides
- Maintain FAQ documentation

**Key Technologies:** Markdown, Notion, GitBook
**Output:** User guides, tutorials, FAQs

**Usage Pattern:**
```bash
# Invoke when creating user-facing docs
Task: "Create step-by-step guide for embedding the widget"
Agent: User Guide Agent
```

---

### 19. Technical Specification Agent
**Purpose:** Create detailed technical specifications
**Responsibilities:**
- Document system architecture
- Create database schema documentation
- Document design patterns and decisions
- Create sequence diagrams and flowcharts
- Document third-party integrations
- Maintain architectural decision records (ADRs)

**Key Technologies:** Markdown, Mermaid, PlantUML
**Output:** Architecture docs, diagrams, ADRs

**Usage Pattern:**
```bash
# Invoke when documenting architecture
Task: "Document RAG pipeline architecture and data flow"
Agent: Technical Specification Agent
```

---

## Cross-Functional Skills

### 20. Feature Planning Agent
**Purpose:** Plan and break down feature implementation
**Responsibilities:**
- Analyze feature requirements
- Break down features into implementable tasks
- Identify technical dependencies
- Estimate complexity and effort
- Create implementation plan with milestones
- Identify potential risks and blockers

**Key Technologies:** Planning methodologies, task breakdown
**Output:** Implementation plans, task lists, dependency graphs

**Usage Pattern:**
```bash
# Invoke when planning new features
Task: "Plan implementation of lead capture and export feature"
Agent: Feature Planning Agent
```

---

### 21. Integration Testing Agent
**Purpose:** Test integrations between system components
**Responsibilities:**
- Test API integrations
- Validate widget-backend communication
- Test LLM provider integrations
- Validate payment gateway integration (Stripe)
- Test vector database operations
- Verify webhook and event handling

**Key Technologies:** Integration test frameworks, mocking tools
**Output:** Integration test suites, validation reports

**Usage Pattern:**
```bash
# Invoke when testing integrations
Task: "Test end-to-end chat flow from widget to LLM response"
Agent: Integration Testing Agent
```

---

### 22. Migration Agent
**Purpose:** Handle data migrations and upgrades
**Responsibilities:**
- Plan database schema migrations
- Create data migration scripts
- Handle backward compatibility
- Implement rollback strategies
- Test migration procedures
- Document migration processes

**Key Technologies:** Prisma Migrate, custom scripts
**Output:** Migration scripts, rollback procedures, migration docs

**Usage Pattern:**
```bash
# Invoke when handling migrations
Task: "Create migration to add analytics tracking tables"
Agent: Migration Agent
```

---

### 23. Monitoring & Observability Agent
**Purpose:** Implement monitoring and logging systems
**Responsibilities:**
- Set up application logging
- Implement metrics collection
- Create dashboards for monitoring
- Set up error tracking (Sentry)
- Implement distributed tracing
- Configure alerts and notifications

**Key Technologies:** Winston, Pino, Prometheus, Grafana, Sentry
**Output:** Logging configs, dashboards, alert rules

**Usage Pattern:**
```bash
# Invoke when setting up monitoring
Task: "Implement comprehensive logging for chat message flow"
Agent: Monitoring & Observability Agent
```

---

### 24. Billing & Subscription Agent
**Purpose:** Implement payment and subscription logic
**Responsibilities:**
- Integrate Stripe for payments
- Implement subscription management
- Create usage tracking and metering
- Handle plan upgrades/downgrades
- Implement billing webhooks
- Create invoice generation

**Key Technologies:** Stripe SDK, webhook handling
**Output:** Payment integration, subscription service, billing webhooks

**Usage Pattern:**
```bash
# Invoke when implementing billing
Task: "Implement usage-based billing with message count tracking"
Agent: Billing & Subscription Agent
```

---

### 25. White-Label Customization Agent
**Purpose:** Implement white-labeling features
**Responsibilities:**
- Create branding customization UI
- Implement theme management system
- Handle custom domain configuration
- Create email template customization
- Implement logo and asset management
- Handle "Powered by" branding removal logic

**Key Technologies:** Dynamic theming, asset storage (S3)
**Output:** Customization UI, theme engine, asset management

**Usage Pattern:**
```bash
# Invoke when implementing white-label features
Task: "Create system for custom dashboard domain configuration"
Agent: White-Label Customization Agent
```

---

## Agent Coordination Patterns

### Sequential Pattern
For features requiring multiple agents in sequence:

1. **Feature Planning Agent** → Plan implementation
2. **Database Schema Agent** → Design data model
3. **API Architecture Agent** → Create endpoints
4. **Dashboard UI Agent** → Build interface
5. **Test Automation Agent** → Create tests
6. **Code Review Agent** → Review quality

### Parallel Pattern
For independent workstreams:

```
Feature Planning Agent
        ↓
    ┌───────┴───────┐
    ↓               ↓
Backend Team    Frontend Team
(API + DB)      (UI + Widget)
    ↓               ↓
    └───────┬───────┘
            ↓
    Integration Testing Agent
```

### Specialized Pattern
For complex features requiring domain expertise:

```
RAG Pipeline Agent + LLM Integration Agent + Training Pipeline Agent
                          ↓
              Confidence Scoring Agent
                          ↓
                Test Automation Agent
```

---

## Best Practices

### 1. Agent Selection
- Choose the most specialized agent for the task
- Use Feature Planning Agent for complex multi-component features
- Coordinate multiple agents for cross-cutting concerns

### 2. Communication Between Agents
- Clearly define interfaces and contracts
- Document shared data structures and APIs
- Use version control for coordination

### 3. Quality Gates
- Always run Test Automation Agent after implementation
- Use Code Review Agent before merging
- Use Security Hardening Agent for security-critical features

### 4. Documentation Flow
- Technical Specification Agent → during planning
- API Documentation Agent → after API implementation
- User Guide Agent → before release

---

## Agent Invocation Examples

### Example 1: Building Chat Widget Feature

```bash
# Step 1: Plan the feature
Agent: Feature Planning Agent
Task: "Plan implementation of chat widget with customizable themes"

# Step 2: Build widget
Agent: Widget Builder Agent
Task: "Implement chat widget with theme system"

# Step 3: Create backend support
Agent: API Architecture Agent
Task: "Create API endpoints for widget configuration retrieval"

# Step 4: Add tests
Agent: Test Automation Agent
Task: "Create E2E tests for widget loading and theming"

# Step 5: Document
Agent: User Guide Agent
Task: "Create guide for customizing widget themes"
```

### Example 2: Implementing RAG Training Pipeline

```bash
# Step 1: Plan
Agent: Feature Planning Agent
Task: "Plan RAG training pipeline with URL crawling and document upload"

# Step 2: Design schema
Agent: Database Schema Agent
Task: "Create schema for training sources and vector embeddings"

# Step 3: Build ingestion
Agent: Training Pipeline Agent
Task: "Implement URL crawler and document processor"

# Step 4: Build RAG
Agent: RAG Pipeline Agent
Task: "Implement chunking, embedding, and vector storage"

# Step 5: Integrate LLM
Agent: LLM Integration Agent
Task: "Connect retrieval pipeline to LLM for response generation"

# Step 6: Add confidence scoring
Agent: Confidence Scoring Agent
Task: "Implement confidence threshold and fallback logic"
```

---

## Maintenance and Updates

This document should be updated when:
- New specialized agents are identified
- Agent responsibilities change significantly
- New technologies are adopted
- Development patterns evolve

**Review Cadence:** Monthly or after major milestones

---

## Quick Reference

| Agent | Primary Use Case | Key Output |
|-------|-----------------|------------|
| Widget Builder | Chat widget development | Widget bundle |
| Dashboard UI | Admin interface | React components |
| API Architecture | Backend endpoints | REST API |
| Database Schema | Data modeling | Migrations |
| RAG Pipeline | AI training | Vector embeddings |
| LLM Integration | AI responses | LLM service |
| Infrastructure Setup | Deployment | Cloud resources |
| Test Automation | Quality assurance | Test suites |
| Security Hardening | Protection | Security configs |
| Documentation | Knowledge base | Docs & guides |

---

**End of Document**
