# Vue.js Tooling

## Migrations majeures

### Vue Router 4 → 5

Vue Router 5 est **composition-API-first** : les navigation guards (`beforeEach`, `beforeRouteEnter`, etc.) sont désormais des composables de premier rang utilisables directement dans `<script setup>`. Le hook `onBeforeRouteLeave` / `onBeforeRouteUpdate` remplace les guards d'options. La création du router reste identique (`createRouter` / `createWebHistory`), mais les types internes ont été révisés — les imports depuis `vue-router` sont inchangés côté usage courant.

#### Vue Router 5 — File-Based Routing (nouveau)

Vue Router 5 introduit le **file-based routing** optionnel via le plugin `@vue-router/auto` (basé sur unplugin-vue-router) :

```bash
npm install -D @vue-router/auto unplugin-vue-router
```

```typescript
// vite.config.ts
import VueRouter from 'unplugin-vue-router/vite';

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',  // Convention : src/pages → routes
    }),
    Vue(),
  ],
});
```

```
src/pages/
├── index.vue          → /
├── about.vue          → /about
├── users/
│   ├── index.vue      → /users
│   └── [id].vue       → /users/:id
└── [...404].vue       → /* (404)
```

```typescript
// main.ts — router auto-généré
import { createRouter, createWebHistory } from 'vue-router/auto';

const router = createRouter({ history: createWebHistory() });
```

**Avantages :** routes type-safe (`useRoute()` retourne le type précis), zéro configuration manuelle, hot reload des routes. Compatible avec `definePageMeta()` pour les meta-données.

Référence : https://router.vuejs.org/guide/migration/ | https://uvr.esm.is/

### Vite 5 → 8

- **Vite 6 (Environment API)** : nouvelle API multi-environment (`createEnvironment`) pour orchestrer client, SSR et edge dans un seul `vite.config`. Optionnel et rétrocompatible.
- **Vite 8 (Rolldown bundler par défaut)** : Rolldown (port Rust de Rollup) remplace esbuild en bundler prod. Build 3-5× plus rapide, sortie identique. `rollupOptions` restent supportés.

Référence : https://vite.dev/blog/

## Build Tool: Vite

### Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    // Vue 3.4+ : defineModel et props destructuring stables, plus besoin de flag
  ],
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
    target: 'esnext',
    sourcemap: true,
    // Vite 8 / Rolldown (default): object form of manualChunks removed — use codeSplitting.groups
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vue-vendor', test: /node_modules\/(vue|pinia|vue-router)/ },
          ],
        },
      },
    },
  },
})
```

> **Vite 8 / Rolldown (défaut) :** la forme objet de `manualChunks` est **supprimée** (non supportée). Utiliser `build.rolldownOptions.output.codeSplitting.groups`.
> **Vite 7 / Rolldown désactivé (legacy) :** utiliser `build.rollupOptions.output.manualChunks` — `// Only if Rolldown is explicitly disabled`.

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

## Linting: ESLint

### Configuration

```javascript
// eslint.config.js (Flat config - ESLint 9+)
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
    },
  },
  {
    rules: {
      // Vue specific
      'vue/multi-word-component-names': 'error',
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits', 'defineModel'],
      }],
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style'],
      }],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-props-declaration': ['error', 'type-based'],
      // eslint-plugin-vue v10 — nouvelles règles pertinentes
      'vue/no-deprecated-model-definition': 'error',     // enforce defineModel (Vue 3.4+)
      'vue/vapor-component': 'off',                       // Vapor Mode (beta, opt-in seulement)

      // TypeScript
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_'
      }],

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
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

### Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": true
}
```

```json
// .prettierignore
dist
node_modules
*.md
pnpm-lock.yaml
```

## Type Checking: vue-tsc

### Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Scripts

```json
{
  "scripts": {
    "type-check": "vue-tsc --noEmit",
    "type-check:watch": "vue-tsc --noEmit --watch"
  }
}
```

## IDE Configuration

### VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
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
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "vue.server.hybridMode": true
}
```

## Package Manager: pnpm (Recommended)

### Configuration

```yaml
# .npmrc
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

### Common Commands

```bash
# Install dependencies
pnpm install

# Add dependency
pnpm add vue-router pinia

# Add dev dependency
pnpm add -D vitest @vue/test-utils

# Update dependencies
pnpm update

# Run scripts
pnpm dev
pnpm build
pnpm test
```

## Project Scripts

### Recommended package.json

```json
{
  "name": "vue-project",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "run-p type-check \"build-only {@}\" --",
    "build-only": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:unit": "vitest --run",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "type-check": "vue-tsc --noEmit -p tsconfig.json --composite false",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "prepare": "husky"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^5.0.0",
    "pinia": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitejs/plugin-vue": "^6.0.0",
    "@vue/test-utils": "^2.4.0",
    "eslint": "^9.0.0",
    "eslint-plugin-vue": "^10.0.0",
    "prettier": "^3.0.0",
    "typescript": "~5.4.0",
    "vite": "^8.0.0",
    "vitest": "^4.0.0",
    "vue-tsc": "^2.2.0"
  }
}
```

## Git Hooks: Husky + lint-staged

### Setup

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```
> **Husky >=9** is assumed (default when installing without a pinned version). `husky install` was removed in v9 — use `husky init` for first-time setup and `"prepare": "husky"` in package.json.

### Configuration

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,md,json}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit  (Husky v9 — no wrapper sourcing needed)
pnpm lint-staged
```

```bash
# .husky/pre-push  (Husky v9 — no wrapper sourcing needed)
pnpm type-check
pnpm test:unit
```

## Volar Configuration

### Explicit Component Types

```typescript
// env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

## DevTools

### Vue DevTools (Browser Extension)

- Inspect component hierarchy
- Edit component state
- Track Pinia stores
- Monitor router navigation
- Timeline for events and performance

### Vite Plugin for DevTools

```typescript
// vite.config.ts
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
  ],
})
```

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

### Benefits for Vue.js

- Real-time TypeScript diagnostics in `.vue` SFC files
- Navigation through Composition API composables and Pinia stores
- Template type checking with Vue language features
- Accurate prop and emit type inference
