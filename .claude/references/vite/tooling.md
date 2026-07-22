# Vite Tooling (Framework-Agnostic)

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## Migrations majeures

### Vite 6 → 8

- **Vite 6 (Environment API)** : nouvelle API multi-environment (`createEnvironment`) pour orchestrer plusieurs cibles de build (client, edge, custom runtimes) dans un seul `vite.config`. Optionnelle, rétrocompatible pour les shapes framework-agnostic couverts ici.
- **Vite 7** : dernière version majeure avec esbuild comme bundler de production par défaut ; Rolldown disponible en opt-in (`rolldown-vite`).
- **Vite 8 (Rolldown bundler par défaut)** : **Rolldown** (port Rust de Rollup, par l'équipe Vite/VoidZero) remplace esbuild par défaut. Build 3-5× plus rapide, sortie fonctionnellement équivalente. Voir `rolldown.md` pour le détail des breaking changes (ex : `manualChunks` objet supprimé).

Référence : https://vite.dev/blog/

## Build Tool: Vite

### Configuration de base

```typescript
// vite.config.ts — vanilla SPA
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    // Vite 8 / Rolldown (default): object form of manualChunks removed — use codeSplitting.groups
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
})
```

> **Vite 8 / Rolldown (défaut)** : la forme objet de `manualChunks` est **supprimée** (non supportée). Utiliser `build.rolldownOptions.output.codeSplitting.groups`.
> **Vite 7 / Rolldown désactivé (legacy)** : utiliser `build.rollupOptions.output.manualChunks` — uniquement si Rolldown est explicitement désactivé.

### Environment Variables

```bash
# .env
VITE_APP_TITLE=My App
VITE_API_URL=http://localhost:8000

# .env.production
VITE_APP_TITLE=My App
VITE_API_URL=https://api.example.com
```

```typescript
// Usage in code
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

Voir `security.md` pour le modèle de menace complet sur `envPrefix` et `define()`.

## Library Tooling: `vite-plugin-dts`

```bash
npm install -D vite-plugin-dts
```

```typescript
// vite.config.ts — library shape
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true, // Bundles all .d.ts into a single file
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
    },
  },
})
```

| Option | Effect |
|--------|--------|
| `rollupTypes: true` | Bundles every `.d.ts` into a single `dist/my-lib.d.ts` (recommended for public libraries) |
| `insertTypesEntry: true` | Ensures `package.json` `types`/`exports.types` points to a valid entry file |
| `include` / `exclude` | Must match the actual `src/` tree — a stale glob silently drops declarations (see `check-library-build.md`) |

## Linting: ESLint (Flat Config)

```javascript
// eslint.config.js (Flat config - ESLint 9+)
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-globals': ['error', 'process'], // use import.meta.env instead in client code
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['vite.config.ts', 'build-plugins/**/*.ts'],
    rules: {
      // process is legitimate in Node-context config/plugin files
      'no-restricted-globals': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.d.ts'],
  },
]
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## Formatting: Prettier

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

```json
// .prettierignore
dist
node_modules
*.md
package-lock.json
```

## Type Checking: `tsc --noEmit`

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "vite.config.ts"]
}
```

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

## IDE Configuration

### VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "antfu.vite"
  ]
}
```

### VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Package Manager: npm

### Common Commands

```bash
# Install dependencies
npm install

# Add dependency
npm install some-runtime-dep

# Add dev dependency
npm install -D vitest vite-plugin-dts

# Update dependencies
npm update

# Run scripts
npm run dev
npm run build
npm run test
```

## Project Scripts

### Recommended package.json (vanilla SPA)

```json
{
  "name": "vite-vanilla-project",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write src/"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.6.0",
    "vite": "^8.1.0",
    "vitest": "^4.1.0"
  }
}
```

### Recommended package.json (library)

```json
{
  "name": "my-lib",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "types": "./dist/my-lib.d.ts",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs",
      "types": "./dist/my-lib.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "test:dist": "npm run build && vitest run tests/dist.smoke.test.ts"
  },
  "devDependencies": {
    "vite": "^8.1.0",
    "vite-plugin-dts": "^4.0.0",
    "vitest": "^4.1.0"
  }
}
```

## Git Hooks: Husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

> **Husky >=9** est supposé (par défaut lors d'une installation sans version pinnée). `husky install` a été retiré en v9 — utiliser `husky init` pour la première installation et `"prepare": "husky"` dans `package.json`.

```json
// package.json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md,json}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit  (Husky v9 — no wrapper sourcing needed)
npx lint-staged
```

```bash
# .husky/pre-push  (Husky v9 — no wrapper sourcing needed)
npx tsc --noEmit
npx vitest run
```

## DevTools

### Vite Inspect Plugin

```bash
npm install -D vite-plugin-inspect
```

```typescript
// vite.config.ts
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [Inspect()],
})
```

Exposes `/__inspect/` on the dev server — visualizes every plugin transform applied to each module, invaluable when debugging a custom `vite-plugin-*` interacting badly with another plugin.

---

## Claude Code LSP Plugin

The LSP plugin gives Claude structural code understanding via the Language Server Protocol: automatic diagnostics after each edit, go-to-definition, find references, and type information on hover.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Automatic diagnostics** | TypeScript errors and warnings detected after each modification |
| **Go to Definition** | Navigate to the exact definition of a symbol |
| **Find References** | All usages of a symbol across the project |
| **Hover** | Type information and documentation |
| **Workspace Symbols** | Search symbols across the entire project |
| **Call Hierarchy** | Trace incoming/outgoing calls |

### Installation

```bash
# 1. Install the language server
npm install -g @vtsls/language-server typescript

# 2. Install the Claude Code plugin (official marketplace)
/plugins install typescript-lsp@claude-plugins-official
```

### Benefits for Vite (framework-agnostic)

- Real-time TypeScript diagnostics in `vite.config.ts` and custom plugin files
- Navigation through `Plugin` hook implementations (`transform`, `resolveId`, `load`)
- Accurate typing for `import.meta.env` once `ImportMetaEnv` is extended
- Go-to-definition across `?worker`/`?init` import-suffixed modules
