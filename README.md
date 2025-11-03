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

- **Monorepo tool:** Turborepo
- **Package manager:** npm with workspaces (nested dependencies for complete app isolation)
- **CI/CD:** GitHub Actions

Dependencies are configured to be independent per app (no hoisting) via `.npmrc`. Each app maintains its own `node_modules` and can use different versions of the same packages.

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