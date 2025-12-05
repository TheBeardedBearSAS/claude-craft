# Ferramentas de Qualidade de Codigo

## ESLint - Linting JavaScript/TypeScript

### Instalacao Completa

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D eslint-plugin-jsx-a11y
npm install -D eslint-plugin-import eslint-import-resolver-typescript
npm install -D eslint-config-prettier
npm install -D @tanstack/eslint-plugin-query
```

### Configuracao .eslintrc.cjs

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
    'prettier' // Sempre por ultimo
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
    'react/prop-types': 'off', // Usar TypeScript em vez disso
    'react/react-in-jsx-scope': 'off', // Nao necessario com React 17+
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

    // ========== Acessibilidade ==========
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
    'import/no-default-export': 'warn', // Preferir exports nomeados

    // ========== Geral ==========
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
    // Permitir exports default para paginas (Next.js, rotas Vite, etc.)
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

## Prettier - Formatacao de Codigo

### Instalacao

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

### Configuracao .prettierrc

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

## Configuracao Rigorosa do TypeScript

### tsconfig.json

```json
{
  "compilerOptions": {
    // ========== Verificacao Rigorosa de Tipos ==========
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // ========== Verificacoes Adicionais ==========
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    // ========== Resolucao de Modulos ==========
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    // ========== Emissao ==========
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noEmit": true,
    "jsx": "react-jsx",

    // ========== Restricoes de Interoperabilidade ==========
    "allowSyntheticDefaultImports": true,
    "verbatimModuleSyntax": false,

    // ========== Caminhos ==========
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

    // ========== Avancado ==========
    "skipLibCheck": true,
    "incremental": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build", "**/*.spec.ts", "**/*.test.ts"]
}
```

## Husky - Git Hooks

### Instalacao

```bash
npm install -D husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
```

### Configuracao .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### Configuracao .husky/pre-push

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run type-check
npm run test:run
```

### Configuracao .husky/commit-msg

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

## Lint-Staged

### Configuracao .lintstagedrc.cjs

```javascript
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit' // Verificacao de tipos
  ],
  '*.{json,css,md}': ['prettier --write'],
  '*.{test,spec}.{ts,tsx}': ['vitest run --related']
};
```

## Commitlint - Conventional Commits

### Instalacao

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

### Configuracao commitlint.config.cjs

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nova funcionalidade
        'fix', // Correcao de bug
        'docs', // Documentacao
        'style', // Formatacao, ponto e virgula faltando, etc
        'refactor', // Refatoracao de codigo
        'perf', // Melhoria de performance
        'test', // Adicao de testes
        'build', // Mudancas no build
        'ci', // Mudancas no CI
        'chore', // Outras mudancas
        'revert' // Reverter commit anterior
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

### Exemplos de Commits Validos

```bash
feat: adicionar autenticacao de usuario
feat(auth): implementar validacao de token JWT
fix: resolver vazamento de memoria no componente UserList
fix(api): tratar erros 404 graciosamente
docs: atualizar README com passos de instalacao
docs(contributing): adicionar diretrizes de revisao de codigo
style: formatar codigo com prettier
refactor: extrair logica de validacao para hook separado
perf: otimizar tamanho do bundle com code splitting
test: adicionar testes unitarios para hook useAuth
build: atualizar react para v18
ci: adicionar workflow do GitHub Actions
chore: atualizar dependencias
revert: reverter "feat: adicionar autenticacao de usuario"
```

## SonarQube / SonarLint

### Configuracao sonar-project.properties

```properties
# Informacoes do Projeto
sonar.projectKey=meu-app-react
sonar.projectName=Meu App React
sonar.projectVersion=1.0

# Codigo Fonte
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx
sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/coverage/**

# TypeScript
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Cobertura de Codigo
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/*.config.ts,**/test/**

# Duplicacao de Codigo
sonar.cpd.exclusions=**/*.test.ts,**/*.test.tsx

# Codificacao
sonar.sourceEncoding=UTF-8
```

## EditorConfig - Consistencia entre IDEs

### .editorconfig

```ini
# EditorConfig e incrivel: https://EditorConfig.org

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

## Configuracao do VS Code

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

  // ========== Arquivos ==========
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

  // ========== Pesquisa ==========
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true,
    "**/coverage": true,
    "**/package-lock.json": true,
    "**/pnpm-lock.yaml": true
  },

  // ========== Extensoes especificas ==========
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

## Scripts do Package.json

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

## Pipeline CI/CD - GitHub Actions

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

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Instalar pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Instalar dependencias
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Verificar tipos
        run: pnpm run type-check

      - name: Verificar formatacao
        run: pnpm run format:check

      - name: Testes
        run: pnpm run test:run

      - name: Cobertura de testes
        run: pnpm run test:coverage

      - name: Upload de cobertura
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Build
        run: pnpm run build

      - name: Testes E2E
        run: pnpm run test:e2e
```

## Checklist de Qualidade

### Antes de Cada Commit

- [ ] Codigo formatado com Prettier
- [ ] Sem erros de ESLint
- [ ] Sem erros de TypeScript
- [ ] Testes passando
- [ ] Mensagem de commit segue Conventional Commits

### Antes de Cada Push

- [ ] Todos os testes passando
- [ ] Cobertura suficiente
- [ ] Build bem-sucedido
- [ ] Sem warnings de ESLint

### Antes de Merge de Pull Request

- [ ] Codigo revisado
- [ ] Testes E2E passando
- [ ] Documentacao atualizada
- [ ] Sem codigo morto
- [ ] Performance verificada

## Metricas de Qualidade

### Objetivos

- **Cobertura de Testes**: > 80%
- **TypeScript Strict**: 100%
- **Warnings de ESLint**: 0
- **Tamanho do Build**: < 500kb (inicial)
- **Performance**: Lighthouse > 90

## Conclusao

As ferramentas de qualidade permitem:

1. ✅ **Consistencia**: Codigo uniforme em toda a equipe
2. ✅ **Qualidade**: Deteccao precoce de erros
3. ✅ **Manutencao**: Codigo facil de manter
4. ✅ **Produtividade**: Automacao de tarefas repetitivas
5. ✅ **Confianca**: Deploy com confianca

**Regra de ouro**: A qualidade do codigo deve ser automatizada e inegociavel.
