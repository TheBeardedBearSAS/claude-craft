# Herramientas — Paperclip

> Referencia autoritativa para herramientas de Paperclip. Ver también `docs.paperclip.ing/cli` y `docs.paperclip.ing/deployment`.

## Runtime y Gestor de Paquetes

| Herramienta | Versión | Por qué |
|---|---|---|
| Node.js | 20+ LTS (22 LTS también soportado y recomendado) | Mínimo de Paperclip; Node.js 22 LTS probado en CI |
| pnpm | 9.15+ | Gestor oficial de workspace |
| tsx | latest | Ejecutar archivos TS durante dev |
| PostgreSQL | 15+ (o embebido) | Store primario |

**Corepack habilita la versión fijada de pnpm:**

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

---

## Scripts del Proyecto

Inspeccionados desde el repo de Paperclip (adaptar si tu proyecto difiere):

```bash
# Instalar
pnpm install

# Dev
pnpm dev               # Ejecuta server + web en modo watch

# Build
pnpm build             # Build server + web + shared
pnpm build:server
pnpm build:web

# Test
pnpm test              # Vitest, todos los paquetes
pnpm test:watch
pnpm test:coverage

# Calidad
pnpm lint              # ESLint
pnpm lint:fix
pnpm typecheck         # tsc --noEmit a través de workspaces
pnpm format            # Prettier --write

# Base de Datos
pnpm db:migrate        # Ejecutar migrations
pnpm db:rollback
pnpm db:seed           # Datos seed de dev
pnpm db:reset          # Drop + migrate + seed (solo dev)

# Onboarding / setup (flujo project-owner)
pnpm paperclip:onboard # Equivalente de `npx paperclipai onboard`
```

---

## Paperclip CLI (`paperclipai`)

De los docs: https://docs.paperclip.ing/cli

```bash
# Onboarding inicial
npx paperclipai onboard --yes

# Ciclo de vida del plano de control
paperclipai start                  # Iniciar plano de control (server + web)
paperclipai stop
paperclipai status
paperclipai logs --tail

# Registro de adapter
paperclipai plugin list
paperclipai plugin install <package>
paperclipai plugin enable <pluginKey>
paperclipai plugin disable <pluginKey>
paperclipai plugin inspect <pluginKey>
paperclipai plugin examples

# Operaciones de agent / company / approval (subcomandos por módulo)
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai company list
paperclipai company get --id <companyId>
paperclipai company export|import|delete
paperclipai approval list|approve|reject|request-revision|comment
paperclipai activity list
paperclipai worktree ...
```

> El CLI es un cliente delgado sobre la API del plano de control. Cualquier cosa que haga también se puede hacer vía HTTP contra la spec OpenAPI.

---

## Editor

- VS Code con estas extensiones:
  - ESLint (`dbaeumer.vscode-eslint`) — consciente de flat-config
  - Prettier (`esbenp.prettier-vscode`)
  - Vitest (`vitest.explorer`)
  - Error Lens (`usernamehw.errorlens`)
- Habilitar "Format on save"
- `.vscode/settings.json` debe establecer `"editor.defaultFormatter": "esbenp.prettier-vscode"` y `"eslint.experimental.useFlatConfig": true`.

---

## Linting y Formateo

**Config flat de ESLint** (`eslint.config.js`) — plantilla mínima:

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

## Build y Bundling

| Objetivo | Herramienta |
|---|---|
| server | `tsc` (emit) o `tsup` (bundle para deploy) |
| web | Vite 5+ |
| shared | `tsc` emit (tipos + JS compilado) |

Sin webpack, sin configs crudos de ESBuild en userland — Vite cubre la UI; `tsc`/`tsup` cubren el servidor.

---

## Git Hooks

Usar `simple-git-hooks` o `husky` para forzar:

```
pre-commit:  pnpm lint-staged
commit-msg:  npx --no-install commitlint --edit "$1"
pre-push:    pnpm typecheck && pnpm test --changed
```

---

## CI

Matriz mínima de GitHub Actions:

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

Paperclip incluye un Dockerfile (ver `docs.paperclip.ing/deployment/docker`). Para despliegues personalizados:

- Build multi-etapa (builder → runtime).
- Usuario no-root en imagen de runtime.
- Endpoint de health check: `/api/health`.
- Exponer solo el puerto de API; web se sirve desde el mismo proceso Node.
- Montar secrets vía env o un volumen de secrets, nunca incorporarlos en la imagen.

---

## Checklist

- [ ] Node 20+, pnpm 9.15+, Corepack habilitado
- [ ] Config flat de ESLint + Prettier configurado
- [ ] Hook pre-commit ejecuta lint-staged
- [ ] CI ejecuta lint, typecheck, test, build
- [ ] Sin cambios en lockfile (`pnpm install --frozen-lockfile` pasa)
- [ ] CLI `paperclipai` instalado o accesible vía `npx`

---

**Última actualización:** 2026-04 | **Versión:** 1.0.0 | **Autor:** The Bearded CTO
