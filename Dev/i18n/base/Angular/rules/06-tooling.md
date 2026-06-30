# Angular Tooling and CLI

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
            "polyfills": ["zone.js"],
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

### Vitest (Recommended for Angular 22+)

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
// Angular 22 — zoneless (do NOT import setup-zone: it re-introduces Zone.js and masks
// signal timing bugs in tests. setup-zone is ONLY for zone-based apps.)
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
setupTestBed({ zoneless: true });
```

> **Important:** Never use `import '@analogjs/vitest-angular/setup-zone'` in an Angular 21+
> zoneless project. It re-activates Zone.js in tests and makes change-detection behavior
> inconsistent with the real app.

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

### Playwright for E2E (claude-craft standard)

> **claude-craft standard:** Playwright is the required E2E tool for all JS/TS projects.
> Cypress remains compatible for legacy projects but should not be used for new Angular projects.

```bash
npm install -D @playwright/test
npx playwright install chromium
```

**playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'html',
  webServer: {
    command: 'ng serve',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
  },
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
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

## Summary

Essential Angular tooling:

| Tool | Purpose |
|------|---------|
| Angular CLI | Project management |
| ESLint + Angular ESLint | Code linting |
| Prettier | Code formatting |
| Vitest/Jest | Unit testing |
| Playwright | E2E testing |
| NgRx/Signals | State management |
| Webpack Bundle Analyzer | Bundle analysis |
| Angular DevTools | Debugging |
