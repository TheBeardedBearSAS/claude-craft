# Tooling — Paperclip

> Maßgebliche Referenz für Paperclip-Tooling. Siehe auch `docs.paperclip.ing/cli` und `docs.paperclip.ing/deployment`.

## Runtime & Paketmanager

| Tool | Version | Warum |
|---|---|---|
| Node.js | 20+ LTS | Paperclip-Minimum (README) |
| pnpm | 9.15+ | Offizieller Workspace-Manager |
| tsx | latest | Ausführen von TS-Dateien während der Entwicklung |
| PostgreSQL | 15+ (oder embedded) | Primärer Speicher |

**Corepack aktiviert die gepinnte pnpm-Version:**

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

---

## Projekt-Skripte

Aus dem Paperclip-Repo inspiziert (anpassen, falls Ihr Projekt abweicht):

```bash
# Installation
pnpm install

# Entwicklung
pnpm dev               # Startet Server + Web im Watch-Modus

# Build
pnpm build             # Baut Server + Web + Shared
pnpm build:server
pnpm build:web

# Test
pnpm test              # Vitest, alle Pakete
pnpm test:watch
pnpm test:coverage

# Qualität
pnpm lint              # ESLint
pnpm lint:fix
pnpm typecheck         # tsc --noEmit über Workspaces
pnpm format            # Prettier --write

# Datenbank
pnpm db:migrate        # Migrationen ausführen
pnpm db:rollback
pnpm db:seed           # Dev-Seed-Daten
pnpm db:reset          # Drop + Migrate + Seed (nur Dev)

# Onboarding / Setup (Project-Owner-Flow)
pnpm paperclip:onboard # Entspricht `npx paperclipai onboard`
```

---

## Paperclip CLI (`paperclipai`)

Aus der Dokumentation: https://docs.paperclip.ing/cli

```bash
# Erstmaliges Onboarding
npx paperclipai onboard --yes

# Control-Plane-Lebenszyklus
paperclipai start                  # Startet Control-Plane (Server + Web)
paperclipai stop
paperclipai status
paperclipai logs --tail

# Adapter-Registrierung
paperclipai plugin list
paperclipai plugin install <package>
paperclipai plugin enable <pluginKey>
paperclipai plugin disable <pluginKey>
paperclipai plugin inspect <pluginKey>
paperclipai plugin examples

# Agent / Company / Approval-Operationen (Subcommands pro Modul)
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai company list
paperclipai company get --id <companyId>
paperclipai company export|import|delete
paperclipai approval list|approve|reject|request-revision|comment
paperclipai activity list
paperclipai worktree ...
```

> Die CLI ist ein dünner Client über die Control-Plane-API. Alles, was sie tut, kann auch über HTTP gegen die OpenAPI-Spezifikation erfolgen.

---

## Editor

- VS Code mit diesen Extensions:
  - ESLint (`dbaeumer.vscode-eslint`) — Flat-Config-fähig
  - Prettier (`esbenp.prettier-vscode`)
  - Vitest (`vitest.explorer`)
  - Error Lens (`usernamehw.errorlens`)
- Aktivieren Sie „Format on save"
- `.vscode/settings.json` sollte `"editor.defaultFormatter": "esbenp.prettier-vscode"` und `"eslint.experimental.useFlatConfig": true` setzen.

---

## Linting & Formatierung

**ESLint Flat Config** (`eslint.config.js`) — minimale Vorlage:

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

| Ziel | Tool |
|---|---|
| server | `tsc` (emit) oder `tsup` (bundle für Deploy) |
| web | Vite 5+ |
| shared | `tsc` emit (Typen + kompiliertes JS) |

Kein Webpack, keine rohen ESBuild-Configs im Userland — Vite deckt die UI ab; `tsc`/`tsup` decken den Server ab.

---

## Git Hooks

Verwenden Sie `simple-git-hooks` oder `husky`, um Folgendes zu erzwingen:

```
pre-commit:  pnpm lint-staged
commit-msg:  npx --no-install commitlint --edit "$1"
pre-push:    pnpm typecheck && pnpm test --changed
```

---

## CI

GitHub Actions minimale Matrix:

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

Paperclip liefert ein Dockerfile mit (siehe `docs.paperclip.ing/deployment/docker`). Für benutzerdefinierte Deployments:

- Multi-Stage-Build (Builder → Runtime).
- Non-Root-User im Runtime-Image.
- Health-Check-Endpoint: `/api/health`.
- Nur API-Port exponieren; Web wird vom selben Node-Prozess bereitgestellt.
- Secrets über Env oder ein Secrets-Volume einbinden, niemals in das Image einbacken.

---

## Checklist

- [ ] Node 20+, pnpm 9.15+, Corepack aktiviert
- [ ] ESLint Flat Config + Prettier konfiguriert
- [ ] Pre-Commit-Hook führt lint-staged aus
- [ ] CI führt lint, typecheck, test, build aus
- [ ] Kein Lockfile-Churn (`pnpm install --frozen-lockfile` läuft durch)
- [ ] `paperclipai` CLI installiert oder über `npx` zugänglich

---

**Zuletzt aktualisiert:** 2026-04 | **Version:** 1.0.0 | **Autor:** The Bearded CTO
