# Architecture Monorepo — Claude Craft

## Vue d'ensemble

Claude Craft Phase 4 (P4-39) introduit le support natif des monorepos pour optimiser les audits, détections et workflows dans les codebases multi-projets. Support de tous les outils majeurs : Nx, Turborepo, pnpm workspaces, npm/yarn workspaces, Lerna, Rush, Bazel.

---

## Table des matières

1. [Détection automatique](#détection-automatique)
2. [Stratégies d'audit](#stratégies-daudit)
3. [Partial audits](#partial-audits)
4. [Cache et invalidation](#cache-et-invalidation)
5. [Parallélisation](#parallélisation)
6. [Compatibilité cross-stack](#compatibilité-cross-stack)
7. [Guide utilisateur](#guide-utilisateur)
8. [CI Integration](#ci-integration)

---

## Détection automatique

Claude Craft détecte automatiquement le type de monorepo au démarrage en analysant les fichiers de configuration racine.

### Fichiers marqueurs

| Outil | Fichier(s) | Détection |
|-------|-----------|-----------|
| **Nx** | `nx.json` | Workspace Nx (Angular, React, Node.js) |
| **Turborepo** | `turbo.json` | Turborepo (Vercel) |
| **pnpm workspaces** | `pnpm-workspace.yaml` | pnpm multi-package |
| **npm/yarn workspaces** | `package.json` avec `"workspaces": [...]` | npm/yarn mono |
| **Lerna** | `lerna.json` | Lerna (legacy, souvent couplé avec npm/yarn) |
| **Rush** | `rush.json` | Rush (Microsoft) |
| **Bazel** | `WORKSPACE` ou `WORKSPACE.bazel` | Bazel (Google) |

### Algorithme de détection

```typescript
function detectMonorepo(rootPath: string): MonorepoConfig | null {
  // Priorité : Nx > Turborepo > pnpm > npm/yarn > Lerna > Rush > Bazel

  if (existsSync(join(rootPath, 'nx.json'))) {
    return {
      type: 'nx',
      configPath: join(rootPath, 'nx.json'),
      workspaces: parseNxWorkspaces(rootPath)
    };
  }

  if (existsSync(join(rootPath, 'turbo.json'))) {
    return {
      type: 'turborepo',
      configPath: join(rootPath, 'turbo.json'),
      workspaces: parseTurboWorkspaces(rootPath)
    };
  }

  if (existsSync(join(rootPath, 'pnpm-workspace.yaml'))) {
    return {
      type: 'pnpm',
      configPath: join(rootPath, 'pnpm-workspace.yaml'),
      workspaces: parsePnpmWorkspaces(rootPath)
    };
  }

  const packageJson = join(rootPath, 'package.json');
  if (existsSync(packageJson)) {
    const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
    if (pkg.workspaces) {
      return {
        type: 'npm', // ou 'yarn' si yarn.lock présent
        configPath: packageJson,
        workspaces: parseNpmWorkspaces(rootPath, pkg.workspaces)
      };
    }
  }

  if (existsSync(join(rootPath, 'lerna.json'))) {
    return {
      type: 'lerna',
      configPath: join(rootPath, 'lerna.json'),
      workspaces: parseLernaWorkspaces(rootPath)
    };
  }

  if (existsSync(join(rootPath, 'rush.json'))) {
    return {
      type: 'rush',
      configPath: join(rootPath, 'rush.json'),
      workspaces: parseRushWorkspaces(rootPath)
    };
  }

  if (existsSync(join(rootPath, 'WORKSPACE')) || existsSync(join(rootPath, 'WORKSPACE.bazel'))) {
    return {
      type: 'bazel',
      configPath: join(rootPath, 'WORKSPACE'),
      workspaces: parseBazelWorkspaces(rootPath)
    };
  }

  return null; // Pas de monorepo
}
```

### Parsing des workspaces

#### Nx

```typescript
function parseNxWorkspaces(rootPath: string): Workspace[] {
  const nxJson = JSON.parse(readFileSync(join(rootPath, 'nx.json'), 'utf-8'));
  const workspaceJson = JSON.parse(readFileSync(join(rootPath, 'workspace.json'), 'utf-8'));

  return Object.entries(workspaceJson.projects).map(([name, config]: [string, any]) => ({
    name,
    path: join(rootPath, config.root),
    tags: config.tags || [],
    type: config.projectType // 'application' | 'library'
  }));
}
```

#### Turborepo

```typescript
function parseTurboWorkspaces(rootPath: string): Workspace[] {
  const turboJson = JSON.parse(readFileSync(join(rootPath, 'turbo.json'), 'utf-8'));
  const packageJson = JSON.parse(readFileSync(join(rootPath, 'package.json'), 'utf-8'));

  // Turborepo utilise workspaces de npm/yarn/pnpm
  return parseNpmWorkspaces(rootPath, packageJson.workspaces);
}
```

#### pnpm

```typescript
function parsePnpmWorkspaces(rootPath: string): Workspace[] {
  const yaml = readFileSync(join(rootPath, 'pnpm-workspace.yaml'), 'utf-8');
  const config = parseYaml(yaml);

  const workspaces: Workspace[] = [];
  for (const pattern of config.packages) {
    const matches = globSync(pattern, { cwd: rootPath, absolute: true });
    for (const match of matches) {
      const pkg = JSON.parse(readFileSync(join(match, 'package.json'), 'utf-8'));
      workspaces.push({
        name: pkg.name,
        path: match,
        dependencies: Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
      });
    }
  }

  return workspaces;
}
```

#### npm/yarn

```typescript
function parseNpmWorkspaces(rootPath: string, patterns: string[]): Workspace[] {
  const workspaces: Workspace[] = [];

  for (const pattern of patterns) {
    const matches = globSync(pattern, { cwd: rootPath, absolute: true });
    for (const match of matches) {
      const pkgPath = join(match, 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        workspaces.push({
          name: pkg.name,
          path: match,
          dependencies: Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
        });
      }
    }
  }

  return workspaces;
}
```

#### Rush

```typescript
function parseRushWorkspaces(rootPath: string): Workspace[] {
  const rushJson = JSON.parse(readFileSync(join(rootPath, 'rush.json'), 'utf-8'));

  return rushJson.projects.map((project: any) => ({
    name: project.packageName,
    path: join(rootPath, project.projectFolder),
    dependencies: [] // Rush gère les dépendances via rush.json
  }));
}
```

#### Bazel

```typescript
function parseBazelWorkspaces(rootPath: string): Workspace[] {
  // Bazel utilise des targets (//path/to:target)
  // Simplification : parser BUILD.bazel dans chaque sous-répertoire
  const buildFiles = globSync('**/BUILD.bazel', { cwd: rootPath, absolute: true });

  return buildFiles.map(buildFile => ({
    name: relative(rootPath, dirname(buildFile)),
    path: dirname(buildFile),
    type: 'bazel-target'
  }));
}
```

---

## Stratégies d'audit

### Audit global (`/team:audit`)

Par défaut, `/team:audit` analyse **tous** les workspaces du monorepo séquentiellement.

```bash
# Audit global (séquentiel)
/team:audit

# Output :
# Analyzing monorepo (Nx, 12 workspaces)...
# [1/12] Auditing @acme/api...
# [2/12] Auditing @acme/web...
# ...
# [12/12] Auditing @acme/utils...
#
# Summary:
#   Total issues: 42
#   Critical: 3
#   High: 12
#   Medium: 27
```

### Audit parallèle (`--monorepo`)

Flag `--monorepo` active la parallélisation intelligente.

```bash
# Audit parallèle (worker pool)
/team:audit --monorepo

# Output :
# Analyzing monorepo (Nx, 12 workspaces)...
# Running parallel audit (8 workers)...
# [████████████████████] 12/12 workspaces (2m 34s)
#
# Summary:
#   Total issues: 42
#   Critical: 3
#   High: 12
#   Medium: 27
```

---

## Partial audits

### Principe

Dans un monorepo, seuls les workspaces affectés par un changement doivent être audités pour optimiser les temps CI/CD.

**Stratégie :**
1. Détecter les fichiers changés (`git diff <base>...<head> --name-only`)
2. Mapper les fichiers aux workspaces
3. Calculer les workspaces affectés (workspace modifié + dépendants)
4. Auditer uniquement ces workspaces

### Détection des workspaces affectés

#### Nx (commande native `affected`)

```bash
# Nx fournit une commande native
nx affected:apps --base=main --head=HEAD
nx affected:libs --base=main --head=HEAD
```

```typescript
function getNxAffected(base: string, head: string): string[] {
  const apps = execSync(`nx affected:apps --base=${base} --head=${head} --plain`).toString().trim().split('\n');
  const libs = execSync(`nx affected:libs --base=${base} --head=${head} --plain`).toString().trim().split('\n');
  return [...apps, ...libs].filter(Boolean);
}
```

#### Turborepo (filtre `--filter`)

```bash
# Turborepo filtre par dépendances
turbo run build --filter=...[HEAD^]
```

```typescript
function getTurboAffected(base: string, head: string): string[] {
  // Turborepo ne fournit pas de commande directe "affected"
  // Fallback : parser git diff + mapper workspaces
  return getAffectedByGitDiff(base, head);
}
```

#### Custom parser (npm/yarn/pnpm/Lerna/Rush/Bazel)

```typescript
function getAffectedByGitDiff(base: string, head: string): string[] {
  const changedFiles = execSync(`git diff ${base}...${head} --name-only`)
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);

  const affectedWorkspaces = new Set<string>();

  for (const file of changedFiles) {
    const workspace = findWorkspaceByFile(file);
    if (workspace) {
      affectedWorkspaces.add(workspace.name);
      // Ajouter les dépendants (workspaces qui dépendent de ce workspace)
      const dependents = findDependents(workspace.name);
      dependents.forEach(dep => affectedWorkspaces.add(dep));
    }
  }

  return Array.from(affectedWorkspaces);
}

function findWorkspaceByFile(filePath: string): Workspace | null {
  // Trouver le workspace contenant ce fichier
  for (const workspace of monorepoConfig.workspaces) {
    if (filePath.startsWith(relative(rootPath, workspace.path))) {
      return workspace;
    }
  }
  return null;
}

function findDependents(workspaceName: string): string[] {
  // Trouver tous les workspaces qui dépendent de workspaceName
  return monorepoConfig.workspaces
    .filter(ws => ws.dependencies.includes(workspaceName))
    .map(ws => ws.name);
}
```

### Usage

```bash
# Audit uniquement les workspaces affectés depuis main
/team:audit --monorepo --affected --base=main --head=HEAD

# Output :
# Analyzing monorepo (Turborepo, 12 workspaces)...
# Detecting affected workspaces (base: main, head: HEAD)...
# Affected: @acme/api, @acme/web (2/12 workspaces)
# Running parallel audit (2 workers)...
# [████████████████████] 2/2 workspaces (12s)
#
# Summary:
#   Total issues: 5
#   Critical: 0
#   High: 2
#   Medium: 3
```

---

## Cache et invalidation

### Principe

Cacher les résultats d'audit par workspace pour éviter de ré-auditer si aucun changement.

**Cache key :** `sha256(workspace_path + dependencies_hash + source_files_hash)`

### Structure cache

```
.claude-craft/
  cache/
    monorepo/
      <workspace-hash>/
        audit.json        # Résultat audit
        metadata.json     # { timestamp, hash, workspace }
```

### Calcul du hash

```typescript
function computeWorkspaceHash(workspace: Workspace): string {
  // Hash des fichiers sources
  const sourceFiles = globSync('**/*.{ts,tsx,js,jsx,py,php}', { cwd: workspace.path });
  const sourceHash = createHash('sha256');
  for (const file of sourceFiles) {
    const content = readFileSync(join(workspace.path, file));
    sourceHash.update(content);
  }

  // Hash des dépendances
  const depsHash = createHash('sha256');
  const pkg = JSON.parse(readFileSync(join(workspace.path, 'package.json'), 'utf-8'));
  depsHash.update(JSON.stringify({ ...pkg.dependencies, ...pkg.devDependencies }));

  // Hash combiné
  return createHash('sha256')
    .update(sourceHash.digest('hex'))
    .update(depsHash.digest('hex'))
    .digest('hex');
}
```

### Invalidation

```typescript
function getCachedAudit(workspace: Workspace): AuditResult | null {
  const hash = computeWorkspaceHash(workspace);
  const cachePath = join('.claude-craft', 'cache', 'monorepo', hash, 'audit.json');

  if (existsSync(cachePath)) {
    const metadata = JSON.parse(readFileSync(join(dirname(cachePath), 'metadata.json'), 'utf-8'));
    // Invalider si > 7 jours
    if (Date.now() - metadata.timestamp > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return JSON.parse(readFileSync(cachePath, 'utf-8'));
  }

  return null;
}

function setCachedAudit(workspace: Workspace, result: AuditResult): void {
  const hash = computeWorkspaceHash(workspace);
  const cachePath = join('.claude-craft', 'cache', 'monorepo', hash);
  mkdirSync(cachePath, { recursive: true });

  writeFileSync(join(cachePath, 'audit.json'), JSON.stringify(result, null, 2));
  writeFileSync(join(cachePath, 'metadata.json'), JSON.stringify({
    timestamp: Date.now(),
    hash,
    workspace: workspace.name
  }, null, 2));
}
```

---

## Parallélisation

### Worker pool

Limiter la concurrence à `CPU_COUNT × 0.75` pour éviter la saturation.

```typescript
import os from 'os';
import pLimit from 'p-limit';

const CPU_COUNT = os.cpus().length;
const MAX_WORKERS = Math.max(1, Math.floor(CPU_COUNT * 0.75));

async function auditMonorepoParallel(workspaces: Workspace[]): Promise<AuditResult[]> {
  const limit = pLimit(MAX_WORKERS);

  const results = await Promise.all(
    workspaces.map(workspace =>
      limit(async () => {
        // Vérifier cache
        const cached = getCachedAudit(workspace);
        if (cached) {
          console.log(`[Cache hit] ${workspace.name}`);
          return cached;
        }

        // Audit
        console.log(`[Auditing] ${workspace.name}`);
        const result = await auditWorkspace(workspace);

        // Sauvegarder cache
        setCachedAudit(workspace, result);

        return result;
      })
    )
  );

  return results;
}
```

### Quota I/O

Limiter les I/O disque simultanées pour éviter la saturation.

```typescript
const ioLimit = pLimit(4); // Max 4 lectures disque simultanées

async function readWorkspaceFiles(workspace: Workspace): Promise<string[]> {
  return ioLimit(async () => {
    return globSync('**/*.{ts,tsx,js,jsx}', { cwd: workspace.path });
  });
}
```

---

## Compatibilité cross-stack

### Monorepo multi-stack

Claude Craft supporte les monorepos mélangeant plusieurs stacks (Symfony + React + Python).

**Exemple :**

```
monorepo/
  apps/
    api/          # Symfony (PHP)
    web/          # React (TypeScript)
    mobile/       # React Native (TypeScript)
  packages/
    ui/           # React components (TypeScript)
    utils/        # Python utilities
```

### Détection stack par workspace

```typescript
function detectWorkspaceStack(workspace: Workspace): string {
  const pkg = JSON.parse(readFileSync(join(workspace.path, 'package.json'), 'utf-8'));

  if (pkg.dependencies?.['react']) return 'react';
  if (pkg.dependencies?.['@angular/core']) return 'angular';
  if (pkg.dependencies?.['vue']) return 'vuejs';
  if (existsSync(join(workspace.path, 'composer.json'))) return 'php';
  if (existsSync(join(workspace.path, 'requirements.txt'))) return 'python';
  if (existsSync(join(workspace.path, 'pubspec.yaml'))) return 'flutter';

  return 'unknown';
}
```

### Audit adapté par stack

```typescript
async function auditWorkspace(workspace: Workspace): Promise<AuditResult> {
  const stack = detectWorkspaceStack(workspace);

  switch (stack) {
    case 'react':
      return auditReact(workspace);
    case 'php':
      return auditPhp(workspace);
    case 'python':
      return auditPython(workspace);
    default:
      return auditGeneric(workspace);
  }
}
```

---

## Guide utilisateur

### Setup

#### Projet existant

```bash
# Claude Craft détecte automatiquement le monorepo
cd my-monorepo
claude-craft --help

# Output :
# Monorepo detected: Nx (12 workspaces)
# Workspaces:
#   - @acme/api (Symfony)
#   - @acme/web (React)
#   - @acme/mobile (React Native)
#   ...
```

#### Nouveau projet

```bash
# Créer un monorepo Nx avec Claude Craft
npx create-nx-workspace@latest my-monorepo --preset=empty
cd my-monorepo
npx @the-bearded-bear/claude-craft install . --tech=react,symfony --lang=en

# Output :
# Installing Claude Craft in monorepo mode (Nx)...
# Detected workspaces: 0 (empty workspace)
# Creating .claude/ structure...
# Done! Run `/team:audit --monorepo` to start.
```

### Commandes

#### Audit global

```bash
# Audit tous les workspaces (séquentiel)
/team:audit

# Audit tous les workspaces (parallèle)
/team:audit --monorepo
```

#### Audit partial (affected)

```bash
# Audit uniquement les workspaces affectés depuis main
/team:audit --monorepo --affected --base=main

# Audit avec cache bypass
/team:audit --monorepo --affected --base=main --no-cache
```

#### Audit workspace spécifique

```bash
# Audit un workspace précis
/team:audit --workspace=@acme/api
```

#### Rapport aggregé

```bash
# Générer un rapport aggregé root + drill-down
/team:audit --monorepo --output=reports/monorepo-audit.html
```

**Rapport HTML :**

```
┌─────────────────────────────────────────────────────────────────┐
│ Claude Craft Audit — Monorepo (Nx, 12 workspaces)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Summary:                                                       │
│    Total issues: 42                                             │
│    Critical: 3                                                  │
│    High: 12                                                     │
│    Medium: 27                                                   │
│                                                                 │
│  Workspaces:                                                    │
│    @acme/api        [6 issues] [Details ▼]                      │
│    @acme/web        [12 issues] [Details ▼]                     │
│    @acme/mobile     [8 issues] [Details ▼]                      │
│    @acme/ui         [4 issues] [Details ▼]                      │
│    ...                                                          │
│                                                                 │
│  Top Issues:                                                    │
│    1. [Critical] SQL Injection in @acme/api (OrderService.php)  │
│    2. [Critical] XSS in @acme/web (CommentForm.tsx)             │
│    3. [High] Missing tests in @acme/mobile (AuthScreen.tsx)     │
│    ...                                                          │
│                                                                 │
│  [Drill-down : cliquer sur workspace pour détails]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## CI Integration

### GitHub Actions

#### Audit complet (scheduled)

```yaml
# .github/workflows/audit-monorepo.yml
name: Audit Monorepo

on:
  schedule:
    - cron: '0 2 * * 1' # Tous les lundis à 2h

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g @the-bearded-bear/claude-craft
      - run: /team:audit --monorepo --output=audit.html
      - uses: actions/upload-artifact@v4
        with:
          name: audit-report
          path: audit.html
```

#### Audit partial (PR)

```yaml
# .github/workflows/audit-affected.yml
name: Audit Affected Workspaces

on:
  pull_request:

jobs:
  audit-affected:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Nécessaire pour git diff
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g @the-bearded-bear/claude-craft
      - run: |
          /team:audit \
            --monorepo \
            --affected \
            --base=origin/${{ github.base_ref }} \
            --head=HEAD \
            --output=audit.json
      - run: |
          # Fail si issues critiques trouvés
          critical=$(jq '[.workspaces[].issues[] | select(.severity == "critical")] | length' audit.json)
          if [ "$critical" -gt 0 ]; then
            echo "Critical issues found: $critical"
            exit 1
          fi
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  audit-monorepo:
    docker:
      - image: cimg/node:20.11
    steps:
      - checkout
      - run:
          name: Install Claude Craft
          command: npm install -g @the-bearded-bear/claude-craft
      - run:
          name: Audit affected workspaces
          command: |
            /team:audit \
              --monorepo \
              --affected \
              --base=origin/main \
              --head=HEAD \
              --output=audit.json
      - store_artifacts:
          path: audit.json

workflows:
  version: 2
  pr-check:
    jobs:
      - audit-monorepo:
          filters:
            branches:
              ignore: main
```

### GitLab CI

```yaml
# .gitlab-ci.yml
audit:monorepo:
  image: node:20
  script:
    - npm install -g @the-bearded-bear/claude-craft
    - |
      /team:audit \
        --monorepo \
        --affected \
        --base=origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME \
        --head=HEAD \
        --output=audit.json
    - |
      critical=$(jq '[.workspaces[].issues[] | select(.severity == "critical")] | length' audit.json)
      if [ "$critical" -gt 0 ]; then
        echo "Critical issues found: $critical"
        exit 1
      fi
  artifacts:
    paths:
      - audit.json
  only:
    - merge_requests
```

---

## Diagramme flux

```
┌────────────────────────────────────────────────────────────────┐
│                     CLI Entry Point                            │
│                   /team:audit --monorepo                       │
└───────────────────┬────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────┐
│                  Monorepo Detector                             │
│  - Check nx.json, turbo.json, pnpm-workspace.yaml, etc.        │
│  - Parse workspace config                                      │
│  - Return: { type, workspaces }                                │
└───────────────────┬────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────┐
│                 Affected Detector (optional)                   │
│  - git diff base...head --name-only                            │
│  - Map files → workspaces                                      │
│  - Compute dependents graph                                    │
│  - Return: affected workspace names                            │
└───────────────────┬────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────┐
│                   Cache Manager                                │
│  - For each workspace: compute hash                            │
│  - Check .claude-craft/cache/monorepo/<hash>/audit.json        │
│  - Return: cached results (if valid) or null                   │
└───────────────────┬────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────┐
│                   Worker Pool                                  │
│  - p-limit(CPU_COUNT * 0.75)                                   │
│  - For each workspace (not cached):                            │
│      * Detect stack (React, PHP, Python, etc.)                 │
│      * Run stack-specific audit                                │
│      * Save to cache                                           │
└───────────────────┬────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────┐
│                  Results Aggregator                            │
│  - Merge workspace results                                     │
│  - Compute summary (total, critical, high, medium)             │
│  - Generate drill-down data                                    │
└───────────────────┬────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────┐
│                   Report Generator                             │
│  - HTML: root summary + per-workspace drill-down               │
│  - JSON: CI/CD integration                                     │
│  - Markdown: README/docs                                       │
└────────────────────────────────────────────────────────────────┘
```

---

**Date de dernière mise à jour :** 2026-04-15  
**Version :** 1.0.0  
**Auteur :** The Bearded CTO
