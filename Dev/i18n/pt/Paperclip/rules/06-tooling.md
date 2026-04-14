# Tooling — Paperclip

> Referencia autoritativa para ferramentas Paperclip. Veja tambem `docs.paperclip.ing/cli` e `docs.paperclip.ing/deployment`.

## Runtime & Package Manager

| Tool | Version | Why |
|---|---|---|
| Node.js | 20+ LTS | Minimo Paperclip (README) |
| pnpm | 9.15+ | Gerenciador oficial de workspaces |
| tsx | latest | Executar arquivos TS durante dev |
| PostgreSQL | 15+ (or embedded) | Store primario |

**Corepack habilita a versao fixa do pnpm:**

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

---

## Project Scripts

Inspecionados do repositorio Paperclip (adapte se seu projeto for diferente):

```bash
# Install
pnpm install

# Dev
pnpm dev               # Executa server + web em modo watch

# Build
pnpm build             # Build server + web + shared
pnpm build:server
pnpm build:web

# Test
pnpm test              # Vitest, todos pacotes
pnpm test:watch
pnpm test:coverage

# Quality
pnpm lint              # ESLint
pnpm lint:fix
pnpm typecheck         # tsc --noEmit nos workspaces
pnpm format            # Prettier --write

# Database
pnpm db:migrate        # Executar migrations
pnpm db:rollback
pnpm db:seed           # Dados seed dev
pnpm db:reset          # Drop + migrate + seed (dev only)

# Onboarding / setup (project-owner flow)
pnpm paperclip:onboard # Equivalente de `npx paperclipai onboard`
```

---

## Paperclip CLI (`paperclipai`)

Da documentacao: https://docs.paperclip.ing/cli

```bash
# First-time onboarding
npx paperclipai onboard --yes

# Control-plane lifecycle
paperclipai start                  # Inicia control plane (server + web)
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

# Agent / company / approval operations (subcomandos por modulo)
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai company list
paperclipai company get --id <companyId>
paperclipai company export|import|delete
paperclipai approval list|approve|reject|request-revision|comment
paperclipai activity list
paperclipai worktree ...
```

> A CLI e um cliente leve sobre a API control-plane. Qualquer coisa que ela faz pode tambem ser feita via HTTP contra a spec OpenAPI.

---

## Editor

- VS Code com estas extensoes:
  - ESLint (`dbaeumer.vscode-eslint`) — flat-config aware
  - Prettier (`esbenp.prettier-vscode`)
  - Vitest (`vitest.explorer`)
  - Error Lens (`usernamehw.errorlens`)
- Habilitar "Format on save"
- `.vscode/settings.json` deve definir `"editor.defaultFormatter": "esbenp.prettier-vscode"` e `"eslint.experimental.useFlatConfig": true`.

---

## Linting & Formatting

**ESLint flat config** (`eslint.config.js`) — template minimo:

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
| server | `tsc` (emit) ou `tsup` (bundle para deploy) |
| web | Vite 5+ |
| shared | `tsc` emit (tipos + JS compilado) |

Sem webpack, sem configs raw ESBuild em userland — Vite cobre a UI; `tsc`/`tsup` cobre o server.

---

## Git Hooks

Use `simple-git-hooks` ou `husky` para forcar:

```
pre-commit:  pnpm lint-staged
commit-msg:  npx --no-install commitlint --edit "$1"
pre-push:    pnpm typecheck && pnpm test --changed
```

---

## CI

GitHub Actions matriz minima:

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

Paperclip vem com um Dockerfile (veja `docs.paperclip.ing/deployment/docker`). Para deploys customizados:

- Build multi-stage (builder → runtime).
- Usuario nao-root na imagem runtime.
- Endpoint health check: `/api/health`.
- Expor apenas a porta API; web e servido do mesmo processo Node.
- Montar secrets via env ou volume de secrets, nunca incluir na imagem.

---

## Checklist

- [ ] Node 20+, pnpm 9.15+, Corepack habilitado
- [ ] ESLint flat config + Prettier configurados
- [ ] Hook pre-commit executa lint-staged
- [ ] CI executa lint, typecheck, test, build
- [ ] Sem churn de lockfile (`pnpm install --frozen-lockfile` passa)
- [ ] CLI `paperclipai` instalado ou acessivel via `npx`

---

**Ultima atualizacao:** 2026-04 | **Versao:** 1.0.0 | **Autor:** The Bearded CTO
