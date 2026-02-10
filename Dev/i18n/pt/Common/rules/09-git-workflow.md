# Git Workflow

## Visao Geral

O workflow Git e baseado no **GitHub Flow** com **Conventional Commits** obrigatorios.

**Principios:**
- Branch `main` sempre implantavel
- Feature branches curtas (< 3 dias)
- Pull Requests obrigatorios
- Code review antes do merge
- CI deve passar (testes + qualidade)

---

## Sumario

1. [GitHub Flow](#github-flow)
2. [Conventional Commits](#conventional-commits)
3. [Branches](#branches)
4. [Pull Requests](#pull-requests)
5. [Code Review](#code-review)
6. [Checklist PR](#checklist-pr)

---

## GitHub Flow

### Workflow

```
main (production-ready)
  |
  +-> feature/add-user-authentication
  |   |
  |   +- commit: feat: add login form
  |   +- commit: feat: add auth service
  |   +- commit: test: add auth tests
  |   |
  |   +-> Pull Request -> Code Review -> Merge
  |
  +-> main (atualizada)
```

### Regras

1. **`main` e sempre implantavel**
2. **Nova funcionalidade = nova branch**
3. **Commits atomicos e testados**
4. **PR + Review obrigatorios**
5. **CI deve passar antes do merge**
6. **Squash merge para historico limpo**

---

## Conventional Commits

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipos obrigatorios

| Tipo | Descricao | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat(auth): add login endpoint` |
| `fix` | Correcao de bug | `fix(cart): correct total calculation` |
| `docs` | Apenas documentacao | `docs(readme): update installation steps` |
| `style` | Formatacao (sem mudanca de codigo) | `style: apply formatter` |
| `refactor` | Refactoring (nem feat nem fix) | `refactor(user): extract validation logic` |
| `perf` | Melhoria de desempenho | `perf(query): add index on created_at` |
| `test` | Adicao/correcao de testes | `test(auth): add edge cases` |
| `build` | Build system, deps externas | `build: upgrade framework to v2.0` |
| `ci` | Configuracao CI/CD | `ci: add lint step to pipeline` |
| `chore` | Outros (sem codigo de producao) | `chore: update .gitignore` |

### Scopes recomendados

Utilize os bounded contexts ou modulos do seu projeto:
- `auth` - Autenticacao
- `user` - Gestao de usuarios
- `order` - Pedidos
- `payment` - Pagamentos
- `notification` - Notificacoes
- `infra` - Infraestrutura

### Exemplos de commits

#### BOM

```bash
# Feature
git commit -m "feat(auth): add JWT token generation

Implement JWT token generation with:
- Access token (15min expiry)
- Refresh token (7 days expiry)
- Token validation middleware

Closes #123"

# Fix
git commit -m "fix(cart): correct discount calculation

Discount was applied before tax calculation,
causing incorrect total. Now applies tax first,
then discount on the subtotal.

Fixes #456"

# Test
git commit -m "test(user): add email validation tests

Add edge cases:
- Empty email
- Invalid format
- Already existing email"

# Refactor
git commit -m "refactor(payment): extract gateway interface

Extract payment logic into separate gateway classes
following Strategy pattern:
- StripeGateway
- PayPalGateway
- BankTransferGateway"
```

#### RUIM

```bash
# Muito vago
git commit -m "fix bug"

# Sem tipo
git commit -m "add new feature"

# Sem scope
git commit -m "feat: stuff"

# Muito longo (> 72 chars)
git commit -m "feat(user): implement the complete user management system with registration, login, password reset and email notifications"

# Varias mudancas nao relacionadas
git commit -m "feat: add login + fix email + update docs"
```

### Ferramentas de validacao

#### Commitlint

```json
// .commitlintrc.json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "perf", "test", "build", "ci", "chore"
    ]],
    "subject-max-length": [2, "always", 72]
  }
}
```

#### Git hooks

```bash
# .husky/commit-msg
#!/bin/sh
npx --no-install commitlint --edit "$1"
```

---

## Branches

### Nomenclatura

```
<type>/<descricao-curta>
```

**Tipos:**
- `feature/` - Nova funcionalidade
- `fix/` - Correcao de bug
- `refactor/` - Refactoring
- `docs/` - Documentacao
- `chore/` - Manutencao

### Exemplos

```bash
# BOM
feature/add-user-registration
feature/payment-integration
fix/login-validation-error
refactor/extract-auth-service
docs/update-api-documentation
chore/upgrade-dependencies

# RUIM
dev-branch
my-work
bug-fix
feature123
```

### Criacao de branch

```bash
# Sempre partir de main atualizada
git checkout main
git pull origin main

# Criar a feature branch
git checkout -b feature/add-user-registration

# Trabalhar na feature
# ... commits ...

# Push da branch
git push -u origin feature/add-user-registration
```

### Tempo de vida

- **Maximo 3 dias** de desenvolvimento
- Se > 3 dias -> **dividir** em varias PRs
- Merge assim que funcional (mesmo se incompleto)
- Utilizar **feature flags** se necessario

---

## Pull Requests

### Template PR

```markdown
## Descricao

<!-- Descreva as mudancas desta PR -->

Closes #[numero_issue]

## Tipo de mudanca

- [ ] Nova funcionalidade (feat)
- [ ] Correcao de bug (fix)
- [ ] Documentacao (docs)
- [ ] Refactoring (refactor)
- [ ] Desempenho (perf)
- [ ] Testes (test)

## Checklist

### Codigo

- [ ] O codigo segue os padroes do projeto
- [ ] Realizei uma auto-review do meu codigo
- [ ] Comentei as partes complexas
- [ ] Linter passa sem erros
- [ ] Formatter aplicado

### Testes

- [ ] Testes unitarios adicionados/atualizados
- [ ] Testes de integracao se necessario
- [ ] Cobertura de codigo >= 80%
- [ ] Todos os testes passam

### Documentacao

- [ ] README atualizado se necessario
- [ ] Documentacao API atualizada
- [ ] CHANGELOG.md atualizado

### Arquitetura

- [ ] Principios SOLID aplicados
- [ ] DRY respeitado (sem duplicacao)
- [ ] YAGNI respeitado (sem codigo desnecessario)

### Seguranca

- [ ] Sem dados sensiveis em texto plano
- [ ] Validacao dos inputs
- [ ] Sem segredos no codigo

## Screenshots

<!-- Se mudanca de UI, adicionar screenshots -->

## Notas para os revisores

<!-- Indicar os pontos a verificar particularmente -->
```

### Labels

| Label | Utilizacao |
|-------|------------|
| `enhancement` | Nova funcionalidade |
| `bug` | Correcao de bug |
| `documentation` | Apenas documentacao |
| `refactoring` | Refactoring |
| `performance` | Melhoria de desempenho |
| `security` | Seguranca |
| `breaking-change` | Mudanca quebrando compatibilidade |
| `needs-review` | Em espera de review |
| `work-in-progress` | WIP |
| `ready-to-merge` | Pronto para merge |

---

## Code Review

### Checklist do Revisor

#### Arquitetura
- [ ] Principios SOLID respeitados
- [ ] Camadas bem separadas
- [ ] Sem dependencias invertidas

#### Qualidade de Codigo
- [ ] KISS / DRY / YAGNI aplicados
- [ ] Nomenclatura explicita
- [ ] Sem duplicacao de codigo
- [ ] Complexidade aceitavel (< 10)
- [ ] Metodos curtos (< 20 linhas)

#### Testes
- [ ] Testes para a logica de negocio
- [ ] Cobertura >= 80%
- [ ] Todos os testes passam
- [ ] Sem testes comentados

#### Seguranca
- [ ] Sem segredos no codigo
- [ ] Validacao dos inputs
- [ ] Protecao XSS/CSRF

#### Desempenho
- [ ] Sem N+1 queries
- [ ] Indices apropriados
- [ ] Paginacao se necessario

### Processo de review

1. **Auto-review** (autor)
   - Reler seu proprio codigo
   - Verificar a checklist PR
   - Testar manualmente

2. **Primeira passada** (revisor)
   - Arquitetura global
   - Logica de negocio
   - Testes

3. **Segunda passada** (revisor)
   - Detalhes de implementacao
   - Nomenclatura
   - Otimizacoes

4. **Comentarios**
   - Construtivos e respeitosos
   - Sugerir solucoes
   - Explicar o "por que"

5. **Aprovacao**
   - Approve -> Pronto para merge
   - Comment -> Sugestoes nao bloqueantes
   - Request changes -> Correcoes necessarias

### Exemplos de comentarios

#### BOM (construtivo)

```
Sugestao: Este metodo faz varias coisas (calculo + validacao).
O que voce acha de dividi-lo em dois metodos distintos para respeitar SRP?

Exemplo:
- validate(data)
- calculate(data)
```

#### RUIM (nao construtivo)

```
Este codigo e pessimo, precisa refazer tudo.
```

---

## Checklist PR

### Antes de criar a PR

```bash
# 1. Testes passam
make test

# 2. Cobertura OK
make test-coverage
# Verificar: >= 80%

# 3. Qualidade OK
make quality
# Linter: 0 erros
# Formatter: aplicado

# 4. Self-review
git diff main...HEAD
```

### Durante a review

```bash
# Aplicar as sugestoes do revisor
git add .
git commit -m "fix: apply code review suggestions"
git push

# Rebase se necessario
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### Antes do merge

```bash
# 1. Branch atualizada
git fetch origin
git rebase origin/main

# 2. CI passa
# -> Verificar pipeline CI/CD

# 3. Review aprovada
# -> Ao menos 1 approve

# 4. Merge
# -> Squash and merge (historico limpo)
```

---

## Workflow completo

### Feature

```bash
# 1. Criar branch
git checkout main
git pull
git checkout -b feature/add-payment-integration

# 2. TDD: Teste primeiro (RED)
git add tests/
git commit -m "test(payment): add integration tests"

# 3. Implementacao (GREEN)
git add src/
git commit -m "feat(payment): add Stripe gateway"

# 4. Refactor
git add src/
git commit -m "refactor(payment): extract gateway interface"

# 5. Documentacao
git add docs/
git commit -m "docs(payment): document payment flow"

# 6. Push + PR
git push -u origin feature/add-payment-integration
gh pr create --fill

# 7. Review + correcoes
git add .
git commit -m "fix: apply review suggestions"
git push

# 8. Merge via UI (Squash and merge)

# 9. Limpeza
git checkout main
git pull
git branch -d feature/add-payment-integration
```

### Hotfix

```bash
# 1. Criar branch a partir de main
git checkout main
git pull
git checkout -b fix/critical-auth-bug

# 2. Fix + teste
git add src/ tests/
git commit -m "fix(auth): correct token validation

Token expiry check was using wrong timezone.
Added test to prevent regression.

Fixes #789"

# 3. Push + PR express
git push -u origin fix/critical-auth-bug
gh pr create --fill --label "bug,urgent"

# 4. Review rapida + merge

# 5. Limpeza
git checkout main
git pull
git branch -d fix/critical-auth-bug
```

---

## Recursos

- **GitHub Flow:** [Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- **Conventional Commits:** [Specification](https://www.conventionalcommits.org/)
- **Commitlint:** [Documentation](https://commitlint.js.org/)
- **Git Best Practices:** [Atlassian Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Data da ultima atualizacao:** 2025-01
**Versao:** 1.0.0
**Autor:** The Bearded CTO
