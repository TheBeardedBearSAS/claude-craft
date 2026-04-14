# Angular Quality Tools

**Version documentée :** Angular 20 LTS (recommandé production) / Angular 21 (latest)

## Static Analysis

### TypeScript Strict Mode

Enable all strict options in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true
  },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  }
}
```

### Angular Compiler Checks

```json
{
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "extendedDiagnostics": {
      "checks": {
        "invalidBananaInBox": "error",
        "nullishCoalescingNotNullable": "warning",
        "textAttributeNotBinding": "error"
      }
    }
  }
}
```

## ESLint Configuration

### Installation

```bash
ng add @angular-eslint/schematics
npm install -D eslint-plugin-rxjs eslint-plugin-import
```

### Recommended Rules

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports'
      }],

      // Angular
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-conflicting-lifecycle': 'error',

      // Import order
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' }
      }]
    }
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/use-track-by-function': 'warn',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/no-any': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/accessibility-alt-text': 'error',
      '@angular-eslint/template/accessibility-elements-content': 'error',
      '@angular-eslint/template/accessibility-label-for': 'error',
      '@angular-eslint/template/accessibility-valid-aria': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/mouse-events-have-key-events': 'warn'
    }
  }
];
```

## Prettier Configuration

### Setup

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

## Stylelint for SCSS

### Setup

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
    "max-nesting-depth": 3,
    "selector-max-compound-selectors": 4,
    "declaration-block-no-duplicate-properties": true,
    "no-duplicate-selectors": true,
    "scss/at-rule-no-unknown": [true, {
      "ignoreAtRules": ["tailwind", "apply", "layer", "screen"]
    }]
  }
}
```

## Code Coverage

### Configuration

**vitest.config.ts** (for Vitest)
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      include: ['src/app/**/*.ts'],
      exclude: [
        'src/app/**/*.module.ts',
        'src/app/**/*.routes.ts',
        'src/app/**/*.spec.ts',
        'src/app/**/*.mock.ts',
        'src/main.ts',
        'src/polyfills.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
```

### Coverage Badges

```yaml
# .github/workflows/ci.yml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    file: ./coverage/lcov.info
    fail_ci_if_error: true
```

## Bundle Analysis

### Webpack Bundle Analyzer

```bash
npm install -D webpack-bundle-analyzer
```

```json
// package.json
{
  "scripts": {
    "build:stats": "ng build --stats-json",
    "analyze": "webpack-bundle-analyzer dist/my-app/stats.json"
  }
}
```

### Source Map Explorer

```bash
npm install -D source-map-explorer
```

```json
{
  "scripts": {
    "build:sourcemap": "ng build --source-map",
    "explore": "source-map-explorer dist/my-app/main.*.js"
  }
}
```

### Budget Configuration

```json
// angular.json
{
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
        },
        {
          "type": "anyScript",
          "maximumWarning": "100kb",
          "maximumError": "200kb"
        }
      ]
    }
  }
}
```

## Pre-commit Hooks

### Husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

**.husky/pre-commit**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**lint-staged.config.js**
```javascript
export default {
  '*.{ts,html}': ['eslint --fix', 'prettier --write'],
  '*.scss': ['stylelint --fix', 'prettier --write'],
  '*.{json,md}': 'prettier --write'
};
```

### Commitlint

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

**commitlint.config.js**
```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'scope-enum': [1, 'always', [
      'core', 'shared', 'auth', 'users', 'dashboard', 'config'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72]
  }
};
```

**.husky/commit-msg**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Stylelint
        run: npm run lint:styles

      - name: Unit tests
        run: npm run test:ci

      - name: Build
        run: npm run build:prod

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          build: npm run build
          start: npm run serve:ci
          wait-on: 'http://localhost:4200'
```

## Security Scanning

### npm audit

```json
{
  "scripts": {
    "security": "npm audit --production",
    "security:fix": "npm audit fix"
  }
}
```

### OWASP Dependency Check

```yaml
# .github/workflows/security.yml
- name: OWASP Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
  with:
    project: 'my-angular-app'
    path: '.'
    format: 'HTML'
```

## Quality Metrics Dashboard

### SonarQube Integration

**sonar-project.properties**
```properties
sonar.projectKey=my-angular-app
sonar.projectName=My Angular App
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
sonar.exclusions=**/node_modules/**,**/*.spec.ts
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

## NPM Scripts Summary

```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration=production",
    "build:stats": "ng build --stats-json",

    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:watch": "vitest watch",
    "e2e": "cypress run",
    "e2e:open": "cypress open",

    "lint": "ng lint",
    "lint:fix": "ng lint --fix",
    "lint:styles": "stylelint 'src/**/*.scss'",
    "lint:styles:fix": "stylelint 'src/**/*.scss' --fix",

    "format": "prettier --write 'src/**/*.{ts,html,scss,json}'",
    "format:check": "prettier --check 'src/**/*.{ts,html,scss,json}'",

    "type-check": "tsc --noEmit",

    "analyze": "webpack-bundle-analyzer dist/my-app/stats.json",
    "explore": "source-map-explorer dist/my-app/main.*.js",

    "security": "npm audit --production",

    "quality": "npm run lint && npm run lint:styles && npm run type-check && npm run test:ci",
    "prepare": "husky"
  }
}
```

## Quality Checklist

- [ ] TypeScript strict mode enabled
- [ ] Angular strict templates enabled
- [ ] ESLint configured with Angular rules
- [ ] Prettier configured
- [ ] Stylelint configured for SCSS
- [ ] Test coverage > 80%
- [ ] Bundle budgets configured
- [ ] Pre-commit hooks (Husky + lint-staged)
- [ ] Commit message validation (Commitlint)
- [ ] CI/CD pipeline configured
- [ ] Security scanning enabled
- [ ] Code coverage reporting
