# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for the Todo app project.

## 📋 Available Workflows

### 1. **lint-and-format.yml** - Code Quality

- **Triggers**: Push/PR to `main` or `staging` branches
- **Purpose**: Ensures code quality and consistent formatting
- **Actions**:
  - Runs ESLint on all TypeScript files
  - Checks Prettier formatting
  - Provides clear error messages and fix suggestions

### 2. **docker-build-and-push.yml** - Container Deployment

- **Triggers**: Push to `main` branch or manual trigger
- **Purpose**: Builds and publishes Docker images
- **Actions**:
  - Builds multi-architecture images (AMD64/ARM64)
  - Pushes to Docker Hub with proper tagging
  - Generates deployment-ready summaries

### 3. **tests.yml** - Testing (Template)

- **Status**: Template ready for when tests are implemented
- **Purpose**: Runs test suites with coverage reporting
- **Features**: Database setup, coverage artifacts, detailed reporting

### 4. **ci-cd.yml** - Complete Pipeline

- **Triggers**: Push/PR to `main` or `staging` branches
- **Purpose**: Combined workflow with all stages
- **Flow**: Lint → Test → Build & Push (on main only)

## 🚀 Setup Instructions

### 1. **Configure Docker Hub Secrets**

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add:

```text
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-password-or-token
```

### 2. **Repository Configuration**

Ensure you have these branches:

- `main` (production)
- `staging` (optional, for staging deployments)

### 3. **Local Development Scripts**

The workflows use these npm scripts (already configured):

```bash
# Linting and formatting
pnpm run lint          # Check for linting issues
pnpm run lint:fix      # Auto-fix linting issues
pnpm run format        # Format code with Prettier
pnpm run format:check  # Check formatting without changes

# Building
pnpm run build         # Build both API and Web apps

# Testing (when implemented)
pnpm run test          # Run all tests
```

## 🔄 Workflow Behavior

### **On Pull Requests:**

1. ✅ **Lint & Format** - Checks code quality
2. ✅ **Test** - Runs test suite (placeholder for now)
3. ❌ **Build & Push** - Skipped (only on main branch)

### **On Push to Main:**

1. ✅ **Lint & Format** - Ensures code quality
2. ✅ **Test** - Validates functionality
3. ✅ **Build & Push** - Publishes Docker images

### **Manual Trigger:**

- Can trigger Docker build/push anytime via GitHub UI

## 🐳 Docker Image Tags

Images are tagged with:

- `latest` - Latest main branch build
- `prod-YYYYMMDD-HHmmss` - Production timestamp
- `main-<commit-sha>` - Specific commit reference
- `staging-<commit-sha>` - Staging builds

## 📊 Features

### ✅ **Code Quality**

- ESLint with TypeScript support
- Prettier formatting checks
- Clear error annotations

### ✅ **Multi-Architecture Support**

- AMD64 (Intel/AMD processors)
- ARM64 (Apple Silicon, ARM servers)

### ✅ **Caching**

- pnpm dependency caching
- Docker layer caching
- Fast subsequent builds

### ✅ **Security**

- Secrets management for Docker Hub
- No credentials in code

### ✅ **Observability Ready**

- Images include full tracing stack
- Prometheus metrics enabled
- Jaeger tracing configured

## 🧪 Adding Tests (Future)

When you're ready to add testing:

1. **Uncomment sections** in `tests.yml` and `ci-cd.yml`
2. **Add test dependencies** to package.json files
3. **Configure test scripts** in each app
4. **Set up test database** (PostgreSQL service in workflow)

### Recommended Testing Stack

#### API Testing

```bash
pnpm add -D jest @types/jest supertest
pnpm add -D @jest/globals ts-jest
```

#### Web Testing

```bash
pnpm add -D @testing-library/react @testing-library/jest-dom
pnpm add -D jest-environment-jsdom
```

#### E2E Testing

```bash
pnpm add -D @playwright/test
```

## 🎯 Benefits

- **Automated Quality Checks** - No broken code reaches main
- **Consistent Deployments** - Standardized Docker images
- **Multi-Platform Support** - Works on Intel and ARM
- **Fast Builds** - Intelligent caching
- **Clear Feedback** - Detailed summaries and error messages
- **Production Ready** - Images include full observability stack

Your Todo app now has enterprise-grade CI/CD! 🎉
