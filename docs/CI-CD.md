# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipelines for ChatForge.

## Overview

ChatForge uses GitHub Actions for automated testing, building, and deployment. The CI/CD pipeline ensures code quality, security, and reliable deployments.

## Workflows

### 1. CI Workflow ([ci.yml](../.github/workflows/ci.yml))

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Backend CI
- Runs on Node.js 20.x and 22.x
- Sets up PostgreSQL and Redis test databases
- Steps:
  - Lint backend code
  - Check code formatting
  - Run unit tests
  - Run e2e tests
  - Build backend
  - Upload coverage to Codecov

#### Frontend CI
- Runs on Node.js 20.x and 22.x
- Steps:
  - Lint frontend code
  - Build frontend
  - Check TypeScript types

#### E2E Tests
- Runs after backend and frontend CI pass
- Sets up full stack with PostgreSQL and Redis
- Uses Playwright for end-to-end testing
- Uploads test results as artifacts

#### Security Audit
- Runs npm audit
- Checks for outdated dependencies
- Continues on error (non-blocking)

### 2. CD Workflow ([cd.yml](../.github/workflows/cd.yml))

**Triggers:**
- Push to `main` branch
- Git tags starting with `v*`
- Manual workflow dispatch

**Jobs:**

#### Build and Push Docker Images
- Builds backend and frontend Docker images
- Pushes to GitHub Container Registry (ghcr.io)
- Uses Docker layer caching for faster builds
- Tags images with:
  - Branch name
  - Git SHA
  - Semantic version (for tags)

#### Deploy to Staging
- Runs on push to `main` or manual trigger
- Deploys to staging environment
- Runs smoke tests
- Sends deployment notifications

#### Deploy to Production
- Runs on version tags (`v*.*.*`)
- Deploys to production environment
- Creates GitHub release
- Runs smoke tests
- Sends deployment notifications

#### Database Migrations
- Runs after staging deployment
- Executes database migrations
- Uses environment-specific credentials

### 3. PR Checks Workflow ([pr-checks.yml](../.github/workflows/pr-checks.yml))

**Triggers:**
- Pull request events (opened, synchronize, reopened, ready_for_review)

**Jobs:**

#### PR Validation
- Validates PR title format (conventional commits)
- Checks for merge conflicts
- Checks file size limits (max 5MB)

#### Code Quality
- Runs linters for backend and frontend
- Checks code formatting
- Warns about console.log statements
- Lists TODO/FIXME comments

#### Dependency Review
- Reviews new dependencies for security issues
- Blocks GPL-3.0 and AGPL-3.0 licenses
- Fails on moderate or higher severity vulnerabilities

#### Bundle Size Check
- Builds frontend and analyzes bundle size
- Reports bundle size impact

#### Auto Label
- Automatically labels PRs based on changed files
- Uses [labeler.yml](../.github/labeler.yml) configuration

### 4. Security Workflow ([security.yml](../.github/workflows/security.yml))

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Daily scheduled scan at 2 AM UTC

**Jobs:**

#### CodeQL Analysis
- Runs static code analysis
- Scans for security vulnerabilities
- Supports JavaScript and TypeScript
- Uses security-extended queries

#### Dependency Scanning
- Runs npm audit
- Checks for known vulnerabilities
- Uploads audit results as artifacts

#### Secret Scanning
- Uses TruffleHog to detect secrets in code
- Scans commit history
- Finds API keys, tokens, credentials

#### Container Scanning
- Builds Docker images
- Scans with Trivy for vulnerabilities
- Reports critical and high severity issues
- Uploads results to GitHub Security

#### License Compliance
- Checks dependency licenses
- Ensures compliance with allowed licenses
- Blocks copyleft licenses (GPL, AGPL)

### 5. Release Workflow ([release.yml](../.github/workflows/release.yml))

**Triggers:**
- Push tags matching `v*.*.*` pattern

**Jobs:**

#### Create Release
- Extracts version from tag
- Generates changelog from commits
- Creates GitHub release with:
  - Changelog
  - Docker image tags
  - Installation instructions
- Marks alpha/beta/rc as pre-release

#### Build and Test
- Runs full test suite
- Ensures release builds successfully

#### Build Release Images
- Builds and pushes Docker images with version tags
- Tags images as `latest`
- Adds OCI labels with metadata

#### Notify
- Sends release notifications
- Can integrate with Slack, Discord, email

## Dependabot

**Configuration:** [dependabot.yml](../.github/dependabot.yml)

Dependabot automatically creates PRs for dependency updates:

- **npm dependencies** (root, backend, frontend): Weekly on Mondays
- **GitHub Actions**: Weekly on Mondays
- **Docker base images**: Weekly on Mondays

**Settings:**
- Ignores major version updates by default
- Limits to 10 open PRs per ecosystem
- Auto-labels with `dependencies` and component tags
- Uses conventional commit prefixes

## Auto Labeling

**Configuration:** [labeler.yml](../.github/labeler.yml)

PRs are automatically labeled based on changed files:
- `backend` - Backend code changes
- `frontend` - Frontend code changes
- `documentation` - Markdown files
- `dependencies` - Package files
- `ci/cd` - GitHub Actions and Docker files
- `tests` - Test files
- `config` - Configuration files

## Docker Images

### Backend Image
- **Base:** `node:22-alpine`
- **Multi-stage build:** Builder → Production
- **Size:** Optimized with production-only dependencies
- **User:** Non-root user (nestjs:1001)
- **Health check:** `/health` endpoint
- **Port:** 3001

### Frontend Image
- **Base:** `node:22-alpine`
- **Multi-stage build:** Dependencies → Builder → Production
- **Size:** Optimized with Next.js standalone output
- **User:** Non-root user (nextjs:1001)
- **Health check:** Root endpoint
- **Port:** 3000

### Registry
- **Location:** GitHub Container Registry (ghcr.io)
- **Public:** No (requires authentication)
- **Tagging strategy:**
  - `latest` - Latest successful build from main
  - `main` - Latest build from main branch
  - `v1.2.3` - Semantic version tags
  - `main-abc123` - Branch + short SHA

## Environment Variables

### Required for CI
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### Required for CD (Secrets)
- `NEXT_PUBLIC_API_URL` - Frontend API URL
- `STAGING_DB_HOST` - Staging database host
- `STAGING_DB_PORT` - Staging database port
- `STAGING_DB_USERNAME` - Staging database username
- `STAGING_DB_PASSWORD` - Staging database password
- `STAGING_DB_NAME` - Staging database name

### Optional (Notifications)
- `SLACK_WEBHOOK_URL` - Slack webhook for notifications
- `DISCORD_WEBHOOK_URL` - Discord webhook for notifications

## Deployment Environments

### Staging
- **URL:** https://staging.chatforge.app
- **Deploy trigger:** Push to `main` branch
- **Database:** Separate staging database
- **Purpose:** Pre-production testing

### Production
- **URL:** https://chatforge.app
- **Deploy trigger:** Version tags (`v*.*.*`)
- **Database:** Production database
- **Purpose:** Live customer-facing environment
- **Protection:** Requires manual approval

## Best Practices

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Messages
Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes
- `ci:` - CI/CD changes

### Pull Requests
- PR title must follow conventional commit format
- All CI checks must pass
- Code review required
- No merge conflicts
- Bundle size impact reviewed

### Releases
1. Update version in `package.json`
2. Create changelog entry
3. Merge to `main`
4. Create and push version tag: `git tag v1.2.3 && git push origin v1.2.3`
5. Release workflow automatically creates GitHub release
6. Docker images built and pushed
7. Deployment can be triggered manually or automatically

### Security
- Never commit secrets or API keys
- Use GitHub Secrets for sensitive data
- Review Dependabot PRs promptly
- Monitor security scan results
- Update dependencies regularly

## Monitoring

### GitHub Actions Dashboard
- View workflow runs: `https://github.com/YOUR_ORG/chatforge/actions`
- Check workflow status badges in README
- Review failed runs and logs

### Security Alerts
- Navigate to Security → Code scanning alerts
- Navigate to Security → Dependabot alerts
- Navigate to Security → Secret scanning alerts

### Codecov
- View coverage reports at codecov.io
- Track coverage trends over time
- Review coverage for PRs

## Troubleshooting

### CI Failures

**Tests failing:**
1. Check test logs in GitHub Actions
2. Reproduce locally: `npm test`
3. Verify database services are running

**Build failing:**
1. Check build logs
2. Verify all dependencies are installed
3. Check for TypeScript errors

**Lint failing:**
1. Run locally: `npm run lint`
2. Auto-fix: `npm run lint -- --fix`
3. Check formatting: `npm run format`

### Deployment Issues

**Docker build failing:**
1. Check Dockerfile syntax
2. Verify all files are included (check .dockerignore)
3. Build locally: `docker build -t test .`

**Deployment failing:**
1. Check deployment logs
2. Verify environment variables are set
3. Check health check endpoints

**Database migration failing:**
1. Check migration scripts
2. Verify database credentials
3. Test migration locally

## Future Improvements

- [ ] Add performance testing to CI
- [ ] Implement blue-green deployments
- [ ] Add canary deployments
- [ ] Integrate with monitoring tools (DataDog, Sentry)
- [ ] Add automated rollback on failed health checks
- [ ] Implement infrastructure as code (Terraform/Pulumi)
- [ ] Add multi-region deployment
- [ ] Implement feature flags
