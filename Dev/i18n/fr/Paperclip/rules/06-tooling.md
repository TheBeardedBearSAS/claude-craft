# Outillage — Paperclip

> Référence faisant autorité pour l'outillage Paperclip. Voir aussi `docs.paperclip.ing/cli` et `docs.paperclip.ing/deployment`.

## Runtime & Gestionnaire de packages

| Outil | Version | Pourquoi |
|---|---|---|
| Node.js | 20+ LTS | Minimum Paperclip (README) |
| pnpm | 9.15+ | Gestionnaire d'espaces de travail officiel |
| tsx | latest | Exécution de fichiers TS en dev |
| PostgreSQL | 15+ (ou embarqué) | Store principal |

**Corepack active la version pnpm épinglée :**

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

---

## Scripts projet

Inspectés depuis le dépôt Paperclip (adapter si votre projet diffère) :

```bash
# Installation
pnpm install

# Dev
pnpm dev               # Lance server + web en mode watch

# Build
pnpm build             # Build server + web + shared
pnpm build:server
pnpm build:web

# Test
pnpm test              # Vitest, tous les packages
pnpm test:watch
pnpm test:coverage

# Qualité
pnpm lint              # ESLint
pnpm lint:fix
pnpm typecheck         # tsc --noEmit à travers espaces de travail
pnpm format            # Prettier --write

# Base de données
pnpm db:migrate        # Exécute les migrations
pnpm db:rollback
pnpm db:seed           # Données de seed dev
pnpm db:reset          # Drop + migrate + seed (dev uniquement)

# Onboarding / setup (flux propriétaire projet)
pnpm paperclip:onboard # Équivalent de `npx paperclipai onboard`
```

---

## CLI Paperclip (`paperclipai`)

D'après la documentation : https://docs.paperclip.ing/cli

```bash
# Onboarding initial
npx paperclipai onboard --yes

# Cycle de vie du control-plane
paperclipai start                  # Démarre control plane (server + web)
paperclipai stop
paperclipai status
paperclipai logs --tail

# Enregistrement adaptateur
paperclipai plugin list
paperclipai plugin install <package>
paperclipai plugin enable <pluginKey>
paperclipai plugin disable <pluginKey>
paperclipai plugin inspect <pluginKey>
paperclipai plugin examples

# Opérations agent / company / approval (sous-commandes par module)
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai company list
paperclipai company get --id <companyId>
paperclipai company export|import|delete
paperclipai approval list|approve|reject|request-revision|comment
paperclipai activity list
paperclipai worktree ...
```

> Le CLI est un client léger au-dessus de l'API control-plane. Tout ce qu'il fait peut aussi être fait via HTTP contre la spécification OpenAPI.

---

## Éditeur

- VS Code avec ces extensions :
  - ESLint (`dbaeumer.vscode-eslint`) — flat-config aware
  - Prettier (`esbenp.prettier-vscode`)
  - Vitest (`vitest.explorer`)
  - Error Lens (`usernamehw.errorlens`)
- Activer "Format on save"
- `.vscode/settings.json` doit définir `"editor.defaultFormatter": "esbenp.prettier-vscode"` et `"eslint.experimental.useFlatConfig": true`.

---

## Linting & Formatage

**ESLint flat config** (`eslint.config.js`) — template minimal :

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

**Prettier** (`.prettierrc`) :

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

| Cible | Outil |
|---|---|
| server | `tsc` (emit) ou `tsup` (bundle pour déploiement) |
| web | Vite 5+ |
| shared | `tsc` emit (types + JS compilé) |

Pas de webpack, pas de configs ESBuild brutes en userland — Vite couvre l'UI ; `tsc`/`tsup` couvrent le serveur.

---

## Hooks Git

Utiliser `simple-git-hooks` ou `husky` pour appliquer :

```
pre-commit:  pnpm lint-staged
commit-msg:  npx --no-install commitlint --edit "$1"
pre-push:    pnpm typecheck && pnpm test --changed
```

---

## CI

Matrice minimale GitHub Actions :

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

Paperclip fournit un Dockerfile (voir `docs.paperclip.ing/deployment/docker`). Pour déploiements personnalisés :

- Build multi-stage (builder → runtime).
- Utilisateur non-root dans l'image runtime.
- Endpoint de health check : `/api/health`.
- Exposer uniquement le port API ; web est servi depuis le même processus Node.
- Monter les secrets via env ou un volume secrets, jamais les cuire dans l'image.

---

## Checklist

- [ ] Node 20+, pnpm 9.15+, Corepack activé
- [ ] ESLint flat config + Prettier configurés
- [ ] Hook pre-commit exécute lint-staged
- [ ] CI exécute lint, typecheck, test, build
- [ ] Pas de churn du lockfile (`pnpm install --frozen-lockfile` passe)
- [ ] CLI `paperclipai` installé ou accessible via `npx`

---

**Dernière mise à jour :** 2026-04 | **Version :** 1.0.0 | **Auteur :** The Bearded CTO
