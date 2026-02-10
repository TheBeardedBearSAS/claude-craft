# Git Workflow

## Vision general

El workflow Git esta basado en **GitHub Flow** con **Conventional Commits** obligatorios.

**Principios:**
- ✅ Rama `main` siempre desplegable
- ✅ Feature branches cortas (< 3 dias)
- ✅ Pull Requests obligatorios
- ✅ Code review antes del merge
- ✅ CI debe pasar (tests + calidad)

---

## Tabla de contenidos

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
  │
  ├─> feature/add-user-authentication
  │   │
  │   ├─ commit: feat: add login form
  │   ├─ commit: feat: add auth service
  │   ├─ commit: test: add auth tests
  │   │
  │   └─> Pull Request → Code Review → Merge
  │
  └─> main (updated)
```

### Reglas

1. **`main` siempre esta desplegable**
2. **Nueva funcionalidad = nueva rama**
3. **Commits atomicos y testeados**
4. **PR + Review obligatorios**
5. **CI debe pasar antes del merge**
6. **Squash merge para historico limpio**

---

## Conventional Commits

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipos obligatorios

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add login endpoint` |
| `fix` | Correccion de bug | `fix(cart): correct total calculation` |
| `docs` | Solo documentacion | `docs(readme): update installation steps` |
| `style` | Formateo (sin cambio de codigo) | `style: apply formatter` |
| `refactor` | Refactoring (ni feat ni fix) | `refactor(user): extract validation logic` |
| `perf` | Mejora de rendimiento | `perf(query): add index on created_at` |
| `test` | Agregar/corregir tests | `test(auth): add edge cases` |
| `build` | Build system, deps externas | `build: upgrade framework to v2.0` |
| `ci` | Configuracion CI/CD | `ci: add lint step to pipeline` |
| `chore` | Otros (sin codigo prod) | `chore: update .gitignore` |

### Scopes recomendados

Utiliza los bounded contexts o modulos de tu proyecto:
- `auth` - Autenticacion
- `user` - Gestion de usuarios
- `order` - Pedidos
- `payment` - Pagos
- `notification` - Notificaciones
- `infra` - Infraestructura

### Ejemplos de commits

#### ✅ BUENO

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

#### ❌ MALO

```bash
# ❌ Demasiado vago
git commit -m "fix bug"

# ❌ Sin tipo
git commit -m "add new feature"

# ❌ Sin scope
git commit -m "feat: stuff"

# ❌ Demasiado largo (> 72 chars)
git commit -m "feat(user): implement the complete user management system with registration, login, password reset and email notifications"

# ❌ Varios cambios no relacionados
git commit -m "feat: add login + fix email + update docs"
```

### Herramientas de validacion

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
<type>/<description-corta>
```

**Tipos:**
- `feature/` - Nueva funcionalidad
- `fix/` - Correccion de bug
- `refactor/` - Refactoring
- `docs/` - Documentacion
- `chore/` - Mantenimiento

### Ejemplos

```bash
# ✅ BUENO
feature/add-user-registration
feature/payment-integration
fix/login-validation-error
refactor/extract-auth-service
docs/update-api-documentation
chore/upgrade-dependencies

# ❌ MALO
dev-branch
my-work
bug-fix
feature123
```

### Creacion de rama

```bash
# Siempre partir de main actualizado
git checkout main
git pull origin main

# Crear la feature branch
git checkout -b feature/add-user-registration

# Trabajar en la feature
# ... commits ...

# Push de la rama
git push -u origin feature/add-user-registration
```

### Duracion de vida

- Maximo 3 dias de desarrollo
- Si > 3 dias -> dividir en varias PRs
- Merge en cuanto sea funcional (aunque este incompleto)
- Usar feature flags si es necesario

---

## Pull Requests

### Template PR

```markdown
## Descripcion

<!-- Describe los cambios de esta PR -->

Closes #[numero_issue]

## Tipo de cambio

- [ ] Nueva funcionalidad (feat)
- [ ] Correccion de bug (fix)
- [ ] Documentacion (docs)
- [ ] Refactoring (refactor)
- [ ] Rendimiento (perf)
- [ ] Tests (test)

## Checklist

### Codigo

- [ ] El codigo sigue los estandares del proyecto
- [ ] He realizado una auto-review de mi codigo
- [ ] He comentado las partes complejas
- [ ] Linter pasa sin errores
- [ ] Formatter aplicado

### Tests

- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integracion si es necesario
- [ ] Cobertura de codigo >= 80%
- [ ] Todos los tests pasan

### Documentacion

- [ ] README actualizado si es necesario
- [ ] Documentacion API al dia
- [ ] CHANGELOG.md actualizado

### Arquitectura

- [ ] Principios SOLID aplicados
- [ ] DRY respetado (sin duplicacion)
- [ ] YAGNI respetado (sin codigo innecesario)

### Seguridad

- [ ] Sin datos sensibles en claro
- [ ] Validacion de inputs
- [ ] Sin secretos en el codigo

## Screenshots

<!-- Si hay cambio UI, agregar screenshots -->

## Notas para los reviewers

<!-- Indicar los puntos a verificar particularmente -->
```

### Labels

| Label | Uso |
|-------|-----|
| `enhancement` | Nueva funcionalidad |
| `bug` | Correccion de bug |
| `documentation` | Solo documentacion |
| `refactoring` | Refactoring |
| `performance` | Mejora de rendimiento |
| `security` | Seguridad |
| `breaking-change` | Cambio incompatible |
| `needs-review` | Esperando review |
| `work-in-progress` | WIP |
| `ready-to-merge` | Listo para merge |

---

## Code Review

### Checklist del Reviewer

#### Arquitectura
- [ ] Principios SOLID respetados
- [ ] Capas bien separadas
- [ ] Sin dependencias invertidas

#### Calidad del Codigo
- [ ] KISS / DRY / YAGNI aplicados
- [ ] Nombrado explicito
- [ ] Sin duplicacion de codigo
- [ ] Complejidad aceptable (< 10)
- [ ] Metodos cortos (< 20 lineas)

#### Tests
- [ ] Tests para la logica de negocio
- [ ] Cobertura >= 80%
- [ ] Todos los tests pasan
- [ ] Sin tests comentados

#### Seguridad
- [ ] Sin secretos hardcodeados
- [ ] Validacion de inputs
- [ ] Proteccion XSS/CSRF

#### Rendimiento
- [ ] Sin N+1 queries
- [ ] Indices apropiados
- [ ] Paginacion si es necesario

### Proceso de review

1. **Auto-review** (autor)
   - Releer su propio codigo
   - Verificar la checklist PR
   - Probar manualmente

2. **Primera pasada** (reviewer)
   - Arquitectura global
   - Logica de negocio
   - Tests

3. **Segunda pasada** (reviewer)
   - Detalles de implementacion
   - Nombrado
   - Optimizaciones

4. **Comentarios**
   - Constructivos y amables
   - Sugerir soluciones
   - Explicar el "por que"

5. **Aprobacion**
   - ✅ Approve -> Listo para merge
   - Comment -> Sugerencias no bloqueantes
   - Request changes -> Correcciones necesarias

### Ejemplos de comentarios

#### ✅ BUENO (constructivo)

```
Sugerencia: Este metodo hace varias cosas (calculo + validacion).
Que opinas de dividirlo en dos metodos distintos para respetar SRP?

Ejemplo:
- validate(data)
- calculate(data)
```

#### ❌ MALO (no constructivo)

```
Este codigo es malo, hay que rehacerlo todo.
```

---

## Checklist PR

### Antes de crear la PR

```bash
# 1. Tests pasan
make test

# 2. Cobertura OK
make test-coverage
# Verificar: >= 80%

# 3. Calidad OK
make quality
# Linter: 0 errores
# Formatter: aplicado

# 4. Self-review
git diff main...HEAD
```

### Durante la review

```bash
# Aplicar las sugerencias del reviewer
git add .
git commit -m "fix: apply code review suggestions"
git push

# Rebasar si es necesario
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### Antes del merge

```bash
# 1. Branch al dia
git fetch origin
git rebase origin/main

# 2. CI pasa
# → Verificar pipeline CI/CD

# 3. Review aprobada
# → Al menos 1 approve

# 4. Merge
# → Squash and merge (historico limpio)
```

---

## Workflow completo

### Feature

```bash
# 1. Crear rama
git checkout main
git pull
git checkout -b feature/add-payment-integration

# 2. TDD: Test primero (RED)
git add tests/
git commit -m "test(payment): add integration tests"

# 3. Implementacion (GREEN)
git add src/
git commit -m "feat(payment): add Stripe gateway"

# 4. Refactor
git add src/
git commit -m "refactor(payment): extract gateway interface"

# 5. Documentacion
git add docs/
git commit -m "docs(payment): document payment flow"

# 6. Push + PR
git push -u origin feature/add-payment-integration
gh pr create --fill

# 7. Review + correcciones
git add .
git commit -m "fix: apply review suggestions"
git push

# 8. Merge via UI (Squash and merge)

# 9. Limpieza
git checkout main
git pull
git branch -d feature/add-payment-integration
```

### Hotfix

```bash
# 1. Crear rama desde main
git checkout main
git pull
git checkout -b fix/critical-auth-bug

# 2. Fix + test
git add src/ tests/
git commit -m "fix(auth): correct token validation

Token expiry check was using wrong timezone.
Added test to prevent regression.

Fixes #789"

# 3. Push + PR express
git push -u origin fix/critical-auth-bug
gh pr create --fill --label "bug,urgent"

# 4. Review rapida + merge

# 5. Limpieza
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

**Fecha de ultima actualizacion:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
