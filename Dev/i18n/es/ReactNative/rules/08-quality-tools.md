# Herramientas de Calidad - ESLint, TypeScript, Prettier

## Configuración ESLint

### .eslintrc.js

```javascript
module.exports = {
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### package.json scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\""
  }
}
```

---

## Configuración Prettier

### .prettierrc.js

```javascript
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always',
};
```

---

## TypeScript

### Beneficios del Modo Estricto

- Detectar errores en tiempo de compilación
- Mejor autocompletado del IDE
- Refactorización más segura
- Código auto-documentado

---

## Pre-commit Hooks

### Configuración Husky

```bash
npm install --save-dev husky lint-staged
npx husky init
```

### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### package.json

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## Checklist Herramientas de Calidad

- [ ] ESLint configurado y 0 errores
- [ ] Prettier auto-format activado
- [ ] TypeScript modo estricto
- [ ] Husky pre-commit hooks
- [ ] Scripts npm para lint/format
- [ ] CI/CD verifica calidad

---

**La calidad del código comienza con las herramientas adecuadas.**
