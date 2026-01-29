# Code Quality Tools

## ESLint - JavaScript/TypeScript Linting

### Complete Installation

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D eslint-plugin-jsx-a11y
npm install -D eslint-plugin-import eslint-import-resolver-typescript
npm install -D eslint-config-prettier
npm install -D @tanstack/eslint-plugin-query
```

### .eslintrc.cjs Configuration

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    '@tanstack/eslint-plugin-query/recommended',
    'prettier' // Always last
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
    '@typescript-eslint',
    'jsx-a11y',
    'import',
    '@tanstack/query'
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  rules: {
    // ========== TypeScript ==========
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true
      }
    ],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false
      }
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false
      }
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',

    // ========== React ==========
    'react/prop-types': 'off', // Use TypeScript instead
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/jsx-no-target-blank': 'error',
    'react/jsx-curly-brace-presence': [
      'error',
      {
        props: 'never',
        children: 'never'
      }
    ],
    'react/self-closing-comp': 'error',
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-sort-props': [
      'warn',
      {
        callbacksLast: true,
        shorthandFirst: true,
        reservedFirst: true
      }
    ],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function'
      }
    ],

    // ========== React Hooks ==========
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ========== React Refresh ==========
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],

    // ========== Accessibility ==========
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',

    // ========== Import ==========
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'type'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        },
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before'
          },
          {
            pattern: '@/**',
            group: 'internal'
          }
        ],
        pathGroupsExcludedImportTypes: ['react']
      }
    ],
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/newline-after-import': 'error',
    'import/no-default-export': 'warn', // Prefer named exports

    // ========== General ==========
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'quote-props': ['error', 'as-needed'],
    'prefer-template': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all']
  },
  overrides: [
    // Allow default exports for pages (Next.js, Vite routes, etc.)
    {
      files: ['**/pages/**/*', '**/app/**/*', '*.config.*'],
      rules: {
        'import/no-default-export': 'off'
      }
    }
  ]
};
```

### .eslintignore

```
node_modules
dist
build
.next
coverage
*.min.js
*.min.css
public
vite.config.ts
tailwind.config.ts
postcss.config.js
```

## Prettier - Code Formatting

### Installation

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

### .prettierrc Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 90,
  "trailingComma": "none",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### .prettierignore

```
node_modules
dist
build
.next
coverage
*.min.js
*.min.css
package-lock.json
pnpm-lock.yaml
yarn.lock
public
```

## TypeScript Strict Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    // ========== Strict Type-Checking ==========
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // ========== Additional Checks ==========
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    // ========== Module Resolution ==========
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    // ========== Emit ==========
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noEmit": true,
    "jsx": "react-jsx",

    // ========== Interop Constraints ==========
    "allowSyntheticDefaultImports": true,
    "verbatimModuleSyntax": false,

    // ========== Paths ==========
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/services/*": ["./src/services/*"],
      "@/config/*": ["./src/config/*"]
    },

    // ========== Advanced ==========
    "skipLibCheck": true,
    "incremental": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build", "**/*.spec.ts", "**/*.test.ts"]
}
```

## Husky - Git Hooks

### Installation

```bash
npm install -D husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
```

### .husky/pre-commit Configuration

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### .husky/pre-push Configuration

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run type-check
npm run test:run
```

### .husky/commit-msg Configuration

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

## Lint-Staged

### .lintstagedrc.cjs Configuration

```javascript
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit' // Type check
  ],
  '*.{json,css,md}': ['prettier --write'],
  '*.{test,spec}.{ts,tsx}': ['vitest run --related']
};
```

## Commitlint - Conventional Commits

### Installation

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

### commitlint.config.cjs Configuration

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting, missing semi colons, etc
        'refactor', // Code refactoring
        'perf', // Performance improvement
        'test', // Adding tests
        'build', // Build changes
        'ci', // CI changes
        'chore', // Other changes
        'revert' // Revert previous commit
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always']
  }
};
```

### Valid Commit Examples

```bash
feat: add user authentication
feat(auth): implement JWT token validation
fix: resolve memory leak in UserList component
fix(api): handle 404 errors gracefully
docs: update README with installation steps
docs(contributing): add code review guidelines
style: format code with prettier
refactor: extract validation logic to separate hook
perf: optimize bundle size with code splitting
test: add unit tests for useAuth hook
build: upgrade react to v18
ci: add GitHub Actions workflow
chore: update dependencies
revert: revert "feat: add user authentication"
```

## SonarQube / SonarLint

### sonar-project.properties Configuration

```properties
# Project Information
sonar.projectKey=my-react-app
sonar.projectName=My React App
sonar.projectVersion=1.0

# Source Code
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx
sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/coverage/**

# TypeScript
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Code Coverage
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/*.config.ts,**/test/**

# Code Duplication
sonar.cpd.exclusions=**/*.test.ts,**/*.test.tsx

# Encoding
sonar.sourceEncoding=UTF-8
```

## EditorConfig - Consistency Across IDEs

### .editorconfig

```ini
# EditorConfig is awesome: https://EditorConfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{ts,tsx,js,jsx,json}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

## VS Code Configuration

### .vscode/settings.json

```json
{
  // ========== Editor ==========
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,

  // ========== TypeScript ==========
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "non-relative",

  // ========== ESLint ==========
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": ["./"],

  // ========== Files ==========
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true
  },

  // ========== Search ==========
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true,
    "**/coverage": true,
    "**/package-lock.json": true,
    "**/pnpm-lock.yaml": true
  },

  // ========== Specific extensions ==========
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on"
  }
}
```

### .vscode/extensions.json

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "ms-playwright.playwright",
    "orta.vscode-jest",
    "ZixuanChen.vitest-explorer",
    "mikestead.dotenv",
    "christian-kohler.path-intellisense",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",

    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",

    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",

    "type-check": "tsc --noEmit",

    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage",

    "quality": "npm run lint && npm run type-check && npm run test:run",

    "prepare": "husky install",

    "pre-commit": "lint-staged"
  }
}
```

## CI/CD Pipeline - GitHub Actions

### .github/workflows/ci.yml

```yaml
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
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Type check
        run: pnpm run type-check

      - name: Format check
        run: pnpm run format:check

      - name: Test
        run: pnpm run test:run

      - name: Test coverage
        run: pnpm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Build
        run: pnpm run build

      - name: E2E tests
        run: pnpm run test:e2e
```

## Quality Checklist

### Before Each Commit

- [ ] Code formatted with Prettier
- [ ] No ESLint errors
- [ ] No TypeScript errors
- [ ] Tests pass
- [ ] Commit message follows Conventional Commits

### Before Each Push

- [ ] All tests pass
- [ ] Sufficient coverage
- [ ] Build succeeds
- [ ] No ESLint warnings

### Before Merge Pull Request

- [ ] Code reviewed
- [ ] E2E tests pass
- [ ] Documentation updated
- [ ] No dead code
- [ ] Performance verified

## Quality Metrics

### Goals

- **Test Coverage**: > 80%
- **TypeScript Strict**: 100%
- **ESLint Warnings**: 0
- **Build Size**: < 500kb (initial)
- **Performance**: Lighthouse > 90

## Conclusion

Quality tools enable:

1. ✅ **Consistency**: Uniform code across the team
2. ✅ **Quality**: Early error detection
3. ✅ **Maintainability**: Easy-to-maintain code
4. ✅ **Productivity**: Automation of repetitive tasks
5. ✅ **Confidence**: Deploy with confidence

**Golden rule**: Code quality must be automated and non-negotiable.
