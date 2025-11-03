# Ark Monorepo

Monorepo for Ark project applications.

## Structure

```
apps/
  chronoperates-api/    # Python FastAPI backend
  chronoperates-web/    # React frontend
libs/                   # Shared libraries (future)
```

## Build System

- **Monorepo tool:** Turborepo (task orchestration)
- **Package manager:** npm (independent packages, no workspaces)
- **CI/CD:** GitHub Actions

Each app is completely independent with its own `package.json`, `package-lock.json`, and `node_modules`. Apps can use different versions of the same packages without conflicts.

## Commands

```bash
npm install           # Install all dependencies
npm run build         # Build all apps
npm run test          # Run tests for all apps
npm run lint          # Lint all apps
npm run dev           # Start all dev servers
```

## CI/CD

- **PRs:** Run tests, linting, and build validation
- **Main branch:** Build and push Docker images to `ghcr.io/indie-ark/*`
  - Tags: `latest` and `<commit-sha>`

## Deployment

```bash
docker pull ghcr.io/indie-ark/chronoperates-api:latest
docker pull ghcr.io/indie-ark/chronoperates-web:latest
```