---
name: monorepo
description: Monorepo management (Nx, Turborepo, pnpm workspaces) — task orchestration, caching, code sharing. Use when setting up monorepo, optimizing builds, or managing multi-package projects.
triggers:
  files: ["**/nx.json", "**/turbo.json", "**/pnpm-workspace.yaml", "**/lerna.json"]
  keywords: ["monorepo", "nx", "turborepo", "pnpm workspaces", "lerna", "task orchestration", "build cache", "workspace", "packages"]
auto_suggest: true
---

# Monorepo — Nx, Turborepo, pnpm Workspaces

Monorepo moderne avec caching distribué, task orchestration.

## Tools

**Nx** — Graph-based, plugins, enterprise  
**Turborepo** — Simple, fast, Vercel  
**pnpm workspaces** — Léger, fast  
**Lerna** — Legacy (migrer)

## Turborepo

```json
{ "pipeline": {
  "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
  "test": { "cache": true }
}}
```

```bash
pnpm turbo build                 # Cache
pnpm turbo test --filter=...@main
```

## Nx

```bash
nx affected --target=build
nx graph
```

## Code Sharing

```
monorepo/
├── packages/ (ui, utils, config)
├── apps/ (web, api, mobile)
```

```typescript
import { Button } from '@monorepo/ui';
```

## Caching

**Local** — Dev | **Remote** — Team (Vercel, Nx Cloud) | **Distributed** — CI

```bash
npx turbo login && npx turbo link  # Turborepo
npx nx connect-to-nx-cloud         # Nx
```

## pnpm Workspaces

```yaml
packages: ['packages/*', 'apps/*']
```

## Best Practices

**Atomic commits** | **Versioning** (`changesets`) | **CI** (affected) | **Shared configs** (root)

---

Voir `@.claude/skills/tooling/SKILL.md`
