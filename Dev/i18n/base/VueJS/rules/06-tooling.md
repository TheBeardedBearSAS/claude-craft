# Vue.js Tooling

## Build Tool: Vite

### Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
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
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
})
```

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
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx",
    "lint:fix": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx --fix"
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
    "Vue.vscode-typescript-vue-plugin",
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
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx",
    "lint:fix": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "prepare": "husky install"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.3.0",
    "pinia": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "eslint": "^9.0.0",
    "eslint-plugin-vue": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "~5.4.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0",
    "vue-tsc": "^2.0.0"
  }
}
```

## Git Hooks: Husky + lint-staged

### Setup

```bash
pnpm add -D husky lint-staged
pnpm exec husky install
```

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
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm type-check
pnpm test:unit
```

## Volar Configuration

### Take Over Mode (Recommended)

For best performance, enable Volar's Take Over Mode:

1. Disable built-in TypeScript extension
2. Enable Vue - Official extension
3. Reload VS Code window

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
