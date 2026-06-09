# Angular Tooling and CLI

**Version documentée :** Angular 22 (stable, sorti le 03/06/2026)

## Prérequis système

| Dépendance | Version requise | Notes |
|------------|----------------|-------|
| **Node.js** | **22.x ou 24.x** | Node 20 non supporté depuis Angular 22 (EOL + supprimé) |
| **npm** | 10.x+ (inclus avec Node 22/24) | — |
| **TypeScript** | **6.x** | TypeScript 5.x non supporté depuis Angular 22 |

> **Note :** `node --version` doit retourner `v22.x.x` ou `v24.x.x`. Si vous utilisez nvm : `nvm install 22 && nvm use 22`.

Source : [Angular version compatibility](https://angular.dev/reference/versions) | [Angular 22 release notes](https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0)

---

## Angular CLI

### Installation

```bash
npm install -g @angular/cli
```

### Common Commands

```bash
# Project
ng new my-app --standalone --style=scss --routing
ng serve --open
ng build --configuration=production

# Generate
ng generate component features/users/components/user-list --standalone
ng generate service core/services/auth
ng generate guard core/guards/auth --functional
ng generate interceptor core/interceptors/auth --functional
ng generate pipe shared/pipes/date-format --standalone
ng generate directive shared/directives/highlight --standalone

# Shortcuts
ng g c features/users/components/user-list --standalone
ng g s core/services/auth
ng g guard core/guards/auth --functional

# Testing
ng test
ng test --no-watch --code-coverage
ng e2e

# Linting
ng lint
ng lint --fix

# Update
ng update
ng update @angular/core @angular/cli
```

### angular.json Configuration

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/my-app",
            "index": "src/index.html",
            "main": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.scss"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all",
              "optimization": true,
              "sourceMap": false
            },
            "development": {
              "optimization": false,
              "sourceMap": true
            }
          }
        },
        "serve": {
          "options": {
            "port": 4200,
            "open": true
          }
        }
      }
    }
  }
}
```

> **Angular 22 zoneless :** la clé `"polyfills": ["zone.js"]` est **supprimée** dans les nouveaux projets générés par le CLI. Zone.js (~33 KB) n'est plus nécessaire grâce à `provideZonelessChangeDetection()` activé par défaut. Si vous migrez un projet existant, retirez `zone.js` de `polyfills` dans `angular.json` **et** de `package.json`.

## Formatting and Linting

### Prettier Configuration

```bash
npm install -D prettier prettier-plugin-organize-imports
```

**.prettierrc**
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "none",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "htmlWhitespaceSensitivity": "ignore",
  "plugins": ["prettier-plugin-organize-imports"]
}
```

**.prettierignore**
```
node_modules
dist
coverage
.angular
*.min.js
*.min.css
package-lock.json
```

### ESLint Configuration

```bash
ng add @angular-eslint/schematics
```

**eslint.config.js**
```javascript
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import templateParser from '@angular-eslint/template-parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      '@angular-eslint': angular
    },
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: templateParser },
    plugins: { '@angular-eslint/template': angularTemplate },
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/use-track-by-function': 'warn'
    }
  }
];
```

### Stylelint Configuration

```bash
npm install -D stylelint stylelint-config-standard-scss stylelint-order
```

**.stylelintrc.json**
```json
{
  "extends": ["stylelint-config-standard-scss"],
  "plugins": ["stylelint-order"],
  "rules": {
    "order/properties-alphabetical-order": true,
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "scss/at-rule-no-unknown": [true, {
      "ignoreAtRules": ["tailwind", "apply", "layer"]
    }]
  }
}
```

## Testing Tools

### Vitest (Recommandé pour Angular 21+)

Vitest est l'outil de test recommandé pour Angular 21+ grâce à sa rapidité (~10x plus rapide que Karma) et son support natif des ES modules.

```bash
npm install -D vitest @analogjs/vitest-angular jsdom
```

**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts']
  }
});
```

**src/test-setup.ts**
```typescript
import '@analogjs/vitest-angular/setup-zone';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
```

### Jest (Alternative)

```bash
npm install -D jest @types/jest jest-preset-angular
```

**jest.config.js**
```javascript
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/main.ts'
  ]
};
```

### Cypress for E2E

```bash
npm install -D cypress @cypress/schematic
ng add @cypress/schematic
```

**cypress.config.ts**
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: true
  }
});
```

## State Management

### NgRx

```bash
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
ng add @ngrx/store
ng add @ngrx/effects
ng add @ngrx/store-devtools
```

### NgRx Signals (Angular 17+)

```bash
npm install @ngrx/signals
```

```typescript
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

type UsersState = {
  users: User[];
  loading: boolean;
  error: string | null;
};

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null
};

export const UsersStore = signalStore(
  withState(initialState),
  withComputed(({ users }) => ({
    usersCount: computed(() => users().length)
  })),
  withMethods((store) => ({
    loadUsers: async () => {
      patchState(store, { loading: true });
      // Load users...
      patchState(store, { users: [], loading: false });
    }
  }))
);
```

## HTTP Client

### Configuration

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
```

## Forms

### Reactive Forms Setup

```typescript
// app.config.ts
import { provideFormsModule } from '@angular/forms';

export const appConfig = {
  providers: [
    // For template-driven forms
    provideFormsModule()
  ]
};
```

### Typed Forms

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number | null>;
}

@Component({...})
export class UserFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group<UserForm>({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    age: this.fb.control(null)
  });
}
```

## Build and Bundle Analysis

### Bundle Analyzer

```bash
npm install -D webpack-bundle-analyzer
ng build --stats-json
npx webpack-bundle-analyzer dist/my-app/stats.json
```

### Source Map Explorer

```bash
npm install -D source-map-explorer
ng build --source-map
npx source-map-explorer dist/my-app/main.*.js
```

## Dev Tools

### Angular DevTools

Install the browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/angular-devtools)
- [Firefox](https://addons.mozilla.org/firefox/addon/angular-devtools/)

### VS Code Extensions

Recommended extensions:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "angular.ng-template",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "streetsidesoftware.code-spell-checker",
    "nrwl.angular-console"
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
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "angular.enable-strict-mode-prompt": false
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test:ci

      - name: Build
        run: npm run build:prod

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
```

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

### Benefits for Angular

- Real-time TypeScript diagnostics with Angular template checking
- Navigation through decorators, dependency injection, and modules
- Signal and standalone component type inference
- RxJS operator chain type tracking

---

## Summary

Essential Angular tooling:

| Tool | Purpose |
|------|---------|
| Angular CLI | Project management |
| ESLint + Angular ESLint | Code linting |
| Prettier | Code formatting |
| Vitest/Jest | Unit testing |
| Cypress | E2E testing |
| NgRx/Signals | State management |
| Webpack Bundle Analyzer | Bundle analysis |
| Angular DevTools | Debugging |
