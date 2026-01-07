# CI/CD Setup Summary

This document provides a quick reference for the CI/CD infrastructure implemented for ChatForge.

## What Was Implemented

### 1. GitHub Actions Workflows

Six comprehensive workflows were created in [.github/workflows/](.github/workflows/):

#### [ci.yml](.github/workflows/ci.yml) - Continuous Integration
- **Triggers:** Push/PR to main/develop
- **Features:**
  - Backend CI (Node 20.x, 22.x)
  - Frontend CI (Node 20.x, 22.x)
  - E2E tests with Playwright
  - Security audit
  - Test coverage upload to Codecov
  - PostgreSQL & Redis integration

#### [cd.yml](.github/workflows/cd.yml) - Continuous Deployment
- **Triggers:** Push to main, version tags, manual dispatch
- **Features:**
  - Docker image builds (backend & frontend)
  - Push to GitHub Container Registry
  - Staging deployment
  - Production deployment (on version tags)
  - Database migrations
  - Smoke tests

#### [pr-checks.yml](.github/workflows/pr-checks.yml) - PR Validation
- **Triggers:** PR events
- **Features:**
  - Conventional commit validation
  - Merge conflict detection
  - File size limits
  - Code quality checks
  - Dependency review
  - Bundle size analysis
  - Auto-labeling

#### [security.yml](.github/workflows/security.yml) - Security Scanning
- **Triggers:** Push/PR, daily at 2 AM UTC
- **Features:**
  - CodeQL analysis
  - Dependency scanning
  - Secret detection (TruffleHog)
  - Container scanning (Trivy)
  - License compliance

#### [release.yml](.github/workflows/release.yml) - Release Automation
- **Triggers:** Version tags (v*.*.*)
- **Features:**
  - Automated release creation
  - Changelog generation
  - Docker image tagging
  - Release notifications
  - Pre-release detection

#### [code-review.yml](.github/workflows/code-review.yml) - Code Review Automation
- **Triggers:** PR events
- **Features:**
  - ESLint annotations
  - Hardcoded secret detection
  - Large file detection
  - Test coverage reporting
  - Performance impact analysis
  - Complexity analysis

### 2. Configuration Files

#### [.github/dependabot.yml](.github/dependabot.yml)
- Weekly dependency updates for:
  - npm (root, backend, frontend)
  - GitHub Actions
  - Docker base images
- Auto-labeling and conventional commits

#### [.github/labeler.yml](.github/labeler.yml)
- Auto-labels PRs based on changed files:
  - backend, frontend, documentation
  - dependencies, ci/cd, tests, config

#### [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)
- Standardized PR template with:
  - Change description
  - Type of change
  - Testing checklist
  - Breaking changes section

### 3. Docker Configuration

#### Backend
- [backend/Dockerfile](backend/Dockerfile)
- [backend/.dockerignore](backend/.dockerignore)
- Multi-stage build with Node 22 Alpine
- Non-root user (nestjs:1001)
- Health check on /health endpoint

#### Frontend
- [frontend/Dockerfile](frontend/Dockerfile)
- [frontend/.dockerignore](frontend/.dockerignore)
- Multi-stage build optimized for Next.js
- Non-root user (nextjs:1001)
- Health check on root endpoint

### 4. Documentation

#### [docs/CI-CD.md](docs/CI-CD.md)
Comprehensive documentation covering:
- Workflow descriptions
- Environment variables
- Deployment environments
- Best practices
- Troubleshooting guide

#### [README.md](README.md)
Updated with:
- Workflow status badges
- CI/CD overview section
- Link to detailed documentation

## Quick Start

### Prerequisites

1. **GitHub Repository Settings:**
   - Enable GitHub Actions
   - Allow GitHub Actions to create PRs (for Dependabot)
   - Configure branch protection rules

2. **GitHub Secrets (Required for CD):**
   ```
   NEXT_PUBLIC_API_URL
   STAGING_DB_HOST
   STAGING_DB_PORT
   STAGING_DB_USERNAME
   STAGING_DB_PASSWORD
   STAGING_DB_NAME
   ```

3. **Optional Secrets (Notifications):**
   ```
   SLACK_WEBHOOK_URL
   DISCORD_WEBHOOK_URL
   CODECOV_TOKEN (if using private repo)
   ```

### Setting Up Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret listed above

### Enabling Workflows

All workflows are automatically enabled when pushed to GitHub. First run happens on:
- **CI:** Next push or PR
- **CD:** Next push to main or version tag
- **Security:** Next push or at scheduled time
- **PR Checks:** Next PR opened

### Creating Your First Release

1. Update version in package.json:
   ```bash
   npm version patch  # or minor, major
   ```

2. Push the tag:
   ```bash
   git push origin v1.0.0
   ```

3. Release workflow automatically:
   - Creates GitHub release
   - Builds Docker images
   - Tags images with version

## Workflow Status

Check workflow status at:
```
https://github.com/Soliperso/white-label-chat-ai/actions
```

Or view badges in the README.

## GitHub Container Registry

Docker images are published to:
```
ghcr.io/soliperso/white-label-chat-ai/backend:latest
ghcr.io/soliperso/white-label-chat-ai/frontend:latest
```

### Pulling Images

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u Soliperso --password-stdin

# Pull images
docker pull ghcr.io/soliperso/white-label-chat-ai/backend:latest
docker pull ghcr.io/soliperso/white-label-chat-ai/frontend:latest
```

## Customization

### Modify Workflow Triggers

Edit workflow files in `.github/workflows/` to change triggers:
```yaml
on:
  push:
    branches: [main, staging]  # Add/remove branches
  schedule:
    - cron: '0 2 * * *'  # Change schedule
```

### Adjust Node Versions

Update matrix in CI workflows:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Add/remove versions
```

### Change Deployment Strategy

Modify deployment jobs in `cd.yml` to match your infrastructure:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Apps
- Kubernetes
- Railway/Render/Fly.io

### Update Security Scanning

Configure security tools in `security.yml`:
- Add SAST tools (SonarQube, Semgrep)
- Configure DAST scanning
- Add container registry scanning
- Integrate with security platforms

## Best Practices

### For Developers

1. **Before Creating PR:**
   ```bash
   npm run lint          # Check linting
   npm run test          # Run tests
   npm run build         # Verify build
   ```

2. **PR Title Format:**
   ```
   feat(component): add new feature
   fix(bug): resolve issue
   docs(readme): update documentation
   ```

3. **Commit Often:**
   - Small, focused commits
   - Clear commit messages
   - Reference issues

### For Maintainers

1. **Review Dependabot PRs Weekly:**
   - Check for breaking changes
   - Review changelogs
   - Test locally before merging

2. **Monitor Security Alerts:**
   - Review CodeQL findings
   - Address dependency vulnerabilities
   - Investigate secret scanning alerts

3. **Release Process:**
   - Update CHANGELOG.md
   - Tag releases semantically
   - Test in staging first
   - Monitor deployment

## Troubleshooting

### CI Failing

1. **Check logs:**
   - Go to Actions tab
   - Click on failed workflow
   - Review error messages

2. **Common issues:**
   - Missing environment variables
   - Database connection failures
   - Outdated dependencies
   - Test failures

### CD Failing

1. **Docker build errors:**
   - Check Dockerfile syntax
   - Verify .dockerignore
   - Build locally first

2. **Deployment errors:**
   - Verify secrets are set
   - Check deployment scripts
   - Review infrastructure logs

### Security Alerts

1. **Dependabot alerts:**
   - Review vulnerability details
   - Update affected package
   - Run tests after update

2. **CodeQL findings:**
   - Review code location
   - Assess severity
   - Apply recommended fix

## Next Steps

1. **Configure Deployment:**
   - Choose cloud provider
   - Set up environments
   - Configure deployment scripts

2. **Set Up Monitoring:**
   - Add APM (DataDog, New Relic)
   - Configure error tracking (Sentry)
   - Set up log aggregation

3. **Enable Notifications:**
   - Slack integration
   - Discord webhooks
   - Email alerts

4. **Optimize Workflows:**
   - Enable caching
   - Parallelize jobs
   - Use workflow artifacts

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## Support

For issues or questions about CI/CD:
1. Check [docs/CI-CD.md](docs/CI-CD.md)
2. Review workflow logs
3. Create an issue with the `ci/cd` label

---

## Summary Checklist

- [x] CI workflow for testing and linting
- [x] CD workflow for deployments
- [x] PR validation and checks
- [x] Security scanning (CodeQL, Trivy, TruffleHog)
- [x] Release automation
- [x] Code review automation
- [x] Dependabot configuration
- [x] Auto-labeling configuration
- [x] Docker multi-stage builds
- [x] Comprehensive documentation
- [x] PR template
- [x] README badges and updates
- [ ] Configure GitHub secrets (manual step)
- [ ] Set up deployment infrastructure (manual step)
- [ ] Configure notification webhooks (optional)

**Status:** CI/CD infrastructure is complete and ready for use!
