#!/bin/bash

# CI Validation Script
# Run this before pushing to ensure CI will pass

set -e

echo "🚀 ChatForge CI Validation"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "Not in project root directory"
    exit 1
fi

success "In project root directory"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    warning "node_modules not found, running npm install..."
    npm install
fi

success "Dependencies installed"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker."
    exit 1
fi

success "Docker is running"

# Check if databases are running
echo ""
echo "📦 Checking database services..."
if ! docker ps | grep -q chatforge-postgres; then
    warning "PostgreSQL not running, starting with docker-compose..."
    docker-compose up -d postgres
    sleep 5
fi

if ! docker ps | grep -q chatforge-redis; then
    warning "Redis not running, starting with docker-compose..."
    docker-compose up -d redis
    sleep 2
fi

success "Database services are running"

# Lint backend
echo ""
echo "🔍 Linting backend..."
if npm run lint --workspace=backend; then
    success "Backend linting passed"
else
    error "Backend linting failed"
    exit 1
fi

# Lint frontend
echo ""
echo "🔍 Linting frontend..."
if npm run lint --workspace=frontend; then
    success "Frontend linting passed"
else
    error "Frontend linting failed"
    exit 1
fi

# Check backend formatting
echo ""
echo "📝 Checking backend formatting..."
if npm run format --workspace=backend -- --check; then
    success "Backend formatting is correct"
else
    warning "Backend formatting issues found. Run: npm run format --workspace=backend"
fi

# Type check frontend
echo ""
echo "🔎 Type checking frontend..."
if npx tsc --noEmit --project frontend/tsconfig.json; then
    success "Frontend type checking passed"
else
    error "Frontend type checking failed"
    exit 1
fi

# Run backend tests
echo ""
echo "🧪 Running backend tests..."
if npm run test --workspace=backend; then
    success "Backend tests passed"
else
    error "Backend tests failed"
    exit 1
fi

# Build backend
echo ""
echo "🏗️  Building backend..."
if npm run build:backend; then
    success "Backend build successful"
else
    error "Backend build failed"
    exit 1
fi

# Build frontend
echo ""
echo "🏗️  Building frontend..."
if NEXT_PUBLIC_API_URL=http://localhost:3001 npm run build:frontend; then
    success "Frontend build successful"
else
    error "Frontend build failed"
    exit 1
fi

# Check for common issues
echo ""
echo "🔍 Checking for common issues..."

# Check for console.log in frontend
if grep -r "console\.log" frontend/src --exclude-dir=node_modules > /dev/null 2>&1; then
    warning "Found console.log statements in frontend/src"
else
    success "No console.log statements found"
fi

# Check for hardcoded secrets
if grep -r -E "(api[_-]?key|password|secret|token)\s*=\s*['\"]" backend/src frontend/src --exclude-dir=node_modules > /dev/null 2>&1; then
    warning "Found potential hardcoded secrets"
else
    success "No hardcoded secrets detected"
fi

# Check for large files
large_files=$(find . -type f -size +5M ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/.next/*" 2>/dev/null)
if [ -n "$large_files" ]; then
    warning "Large files found:"
    echo "$large_files"
else
    success "No large files detected"
fi

# Security audit
echo ""
echo "🔒 Running security audit..."
if npm audit --audit-level=moderate; then
    success "No moderate or higher vulnerabilities found"
else
    warning "Security vulnerabilities detected. Review with: npm audit"
fi

# Docker build test (optional, can be slow)
if [ "$1" == "--docker" ]; then
    echo ""
    echo "🐳 Testing Docker builds..."

    if docker build -t chatforge-backend:test ./backend; then
        success "Backend Docker build successful"
        docker rmi chatforge-backend:test
    else
        error "Backend Docker build failed"
        exit 1
    fi

    if docker build -t chatforge-frontend:test --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 ./frontend; then
        success "Frontend Docker build successful"
        docker rmi chatforge-frontend:test
    else
        error "Frontend Docker build failed"
        exit 1
    fi
fi

# Summary
echo ""
echo "=========================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Your code is ready to push."
echo ""
echo "Next steps:"
echo "  1. Commit your changes: git add . && git commit -m 'feat: your message'"
echo "  2. Push to remote: git push"
echo "  3. Create a PR on GitHub"
echo ""
echo "Optional flags:"
echo "  --docker    Also test Docker builds (slower)"
echo ""
