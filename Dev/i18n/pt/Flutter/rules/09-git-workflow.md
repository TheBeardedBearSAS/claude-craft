# Fluxo de Trabalho Git Flutter

## Conventional Commits

### Formato

```
<tipo>(<escopo>): <assunto>

<corpo>

<rodapé>
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação, ponto e vírgula faltando
- **refactor**: Refatoração de código
- **perf**: Melhoria de performance
- **test**: Adição ou correção de testes
- **build**: Mudanças no sistema de build
- **ci**: Mudanças de CI/CD
- **chore**: Tarefas diversas

### Exemplos

```bash
feat(auth): adicionar login com Google

Implementar fluxo OAuth2 para Google Sign-In usando firebase_auth.

Closes #123

fix(cart): prevenir itens duplicados

Corrige bug onde adicionar o mesmo produto duas vezes criava entradas duplicadas.

Fixes #456

docs(readme): atualizar instruções de instalação

test(user): adicionar testes unitários para UserRepository

refactor(api): extrair cliente API para classe separada

perf(images): implementar lazy loading para imagens de produtos
```

---

## Estratégia de Branches

### GitFlow Simplificado

```
main
  └─ develop
      ├─ feature/user-authentication
      ├─ feature/product-catalog
      └─ feature/shopping-cart
  ├─ hotfix/critical-bug-fix
  └─ release/v1.0.0
```

### Nomes de Branches

```bash
# Features
feature/login-screen
feature/product-detail-page
feature/payment-integration

# Bugfixes
fix/cart-calculation-error
fix/image-loading-crash

# Hotfixes
hotfix/critical-security-patch

# Releases
release/v1.0.0
release/v1.1.0
```

---

## Pre-commit Hooks

### Husky + lint-staged (com npm)

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.dart": [
      "dart format",
      "flutter analyze",
      "flutter test --no-pub"
    ]
  }
}
```

### Lefthook (alternativa pura Dart)

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.dart"
      run: dart format {staged_files}
    analyze:
      run: flutter analyze
    test:
      run: flutter test
```

---

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test --coverage
      - uses: codecov/codecov-action@v3
```

---

## Comandos Git Úteis

```bash
# Criar branch de feature
git checkout -b feature/my-feature develop

# Commit com Conventional Commits
git commit -m "feat(auth): adicionar autenticação biométrica"

# Rebase interativo para limpar histórico
git rebase -i develop

# Squash commits
git rebase -i HEAD~3

# Cherry-pick
git cherry-pick abc123

# Stash
git stash
git stash pop
git stash list
```

---

*Um fluxo de trabalho Git estruturado melhora a colaboração e rastreabilidade.*
