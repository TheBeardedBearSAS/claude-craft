# Tooling — Paperclip

> Authoritative reference for Paperclip tooling. See also `docs.paperclip.ing/cli` and `docs.paperclip.ing/deployment`.

## Runtime & Package Manager

| Tool | Version | Why |
|---|---|---|
| Node.js | 20+ LTS | Paperclip minimum (README) |
| pnpm | 9.15+ | Official workspace manager |
| tsx | latest | Running TS files during dev |
| PostgreSQL | 15+ (or embedded) | Primary store |

**Corepack enables the pinned pnpm version:**

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

---

## Project Scripts

Inspected from Paperclip repo (adapt if your project differs):

```bash
# Install
pnpm install

# Dev
pnpm dev               # Runs server + web in watch mode

# Build
pnpm build             # Build server + web + shared
pnpm build:server
pnpm build:web

# Test
pnpm test              # Vitest, all packages
pnpm test:watch
pnpm test:coverage

# Quality
pnpm lint              # ESLint
pnpm lint:fix
pnpm typecheck         # tsc --noEmit across workspaces
pnpm format            # Prettier --write

# Database
pnpm db:migrate        # Run migrations
pnpm db:rollback
pnpm db:seed           # Dev seed data
pnpm db:reset          # Drop + migrate + seed (dev only)

# Onboarding / setup (project-owner flow)
pnpm paperclip:onboard # Equivalent of `npx paperclipai onboard`
```

---

## Paperclip CLI (`paperclipai`)

From docs: https://docs.paperclip.ing/cli

```bash
# First-time onboarding
npx paperclipai onboard --yes

# Control-plane lifecycle
paperclipai start                  # Start control plane (server + web)
paperclipai stop
paperclipai status
paperclipai logs --tail

# Adapter registration
paperclipai plugin list
paperclipai plugin install <package>
paperclipai plugin enable <pluginKey>
paperclipai plugin disable <pluginKey>
paperclipai plugin inspect <pluginKey>
paperclipai plugin examples

# Agent / company / approval operations (subcommands per module)
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai company list
paperclipai company get --id <companyId>
paperclipai company export|import|delete
paperclipai approval list|approve|reject|request-revision|comment
paperclipai activity list
paperclipai worktree ...
```

> The CLI is a thin client over the control-plane API. Anything it does can also be done via HTTP against the OpenAPI spec.

---

## Editor

- VS Code with these extensions:
  - ESLint (`dbaeumer.vscode-eslint`) — flat-config aware
  - Prettier (`esbenp.prettier-vscode`)
  - Vitest (`vitest.explorer`)
  - Error Lens (`usernamehw.errorlens`)
- Enable "Format on save"
- `.vscode/settings.json` should set `"editor.defaultFormatter": "esbenp.prettier-vscode"` and `"eslint.experimental.useFlatConfig": true`.

---

## Linting & Formatting

**ESLint flat config** (`eslint.config.js`) — minimal template:

```js
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
);
```

**Prettier** (`.prettierrc`):

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

---

## Build & Bundling

| Target | Tool |
|---|---|
| server | `tsc` (emit) or `tsup` (bundle for deploy) |
| web | Vite 5+ |
| shared | `tsc` emit (types + compiled JS) |

No webpack, no raw ESBuild configs in userland — Vite covers the UI; `tsc`/`tsup` cover the server.

---

## Git Hooks

Use `simple-git-hooks` or `husky` to enforce:

```
pre-commit:  pnpm lint-staged
commit-msg:  npx --no-install commitlint --edit "$1"
pre-push:    pnpm typecheck && pnpm test --changed
```

---

## CI

GitHub Actions minimal matrix:

```yaml
jobs:
  ci:
    strategy:
      matrix:
        node: [20.x, 22.x]
    steps:
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --coverage
      - run: pnpm build
```

---

## Docker

Paperclip ships a Dockerfile (see `docs.paperclip.ing/deployment/docker`). For custom deployments:

- Multi-stage build (builder → runtime).
- Non-root user in runtime image.
- Health check endpoint: `/api/health`.
- Expose only the API port; web is served from the same Node process.
- Mount secrets via env or a secrets volume, never bake them into the image.

---

## Checklist

- [ ] Node 20+, pnpm 9.15+, Corepack enabled
- [ ] ESLint flat config + Prettier configured
- [ ] Pre-commit hook runs lint-staged
- [ ] CI runs lint, typecheck, test, build
- [ ] No lockfile churn (`pnpm install --frozen-lockfile` passes)
- [ ] `paperclipai` CLI installed or accessible via `npx`

---

**Last updated:** 2026-04 | **Version:** 1.0.0 | **Author:** The Bearded CTO
