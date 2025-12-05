# Git Workflow - Atoll Tourisme

## Visión General

El flujo de trabajo Git se basa en **GitHub Flow** con **Conventional Commits** obligatorios.

**Principios:**
- ✅ Rama `main` siempre desplegable
- ✅ Ramas de funcionalidades cortas (< 3 días)
- ✅ Pull Requests obligatorios
- ✅ Revisión de código antes del merge
- ✅ CI debe pasar (pruebas + calidad)

> **Referencias:**
> - `08-quality-tools.md` - Pipeline CI
> - `07-testing-tdd-bdd.md` - Pruebas obligatorias

---

## Tabla de contenidos

1. [GitHub Flow](#github-flow)
2. [Conventional Commits](#conventional-commits)
3. [Ramas](#ramas)
4. [Pull Requests](#pull-requests)
5. [Revisión de Código](#revisión-de-código)
6. [Checklist PR](#checklist-pr)

---

## GitHub Flow

### Flujo de trabajo

```
main (production-ready)
  │
  ├─> feature/add-reservation-pricing
  │   │
  │   ├─ commit: feat: add Money value object
  │   ├─ commit: feat: add pricing service
  │   ├─ commit: test: add pricing service tests
  │   │
  │   └─> Pull Request → Code Review → Merge
  │
  └─> main (updated)
```

### Reglas

1. **`main` siempre está desplegable**
2. **Nueva funcionalidad = nueva rama**
3. **Commits atómicos y probados**
4. **PR + Review obligatorios**
5. **CI debe pasar antes del merge**
6. **Squash merge para historial limpio**

---

## Conventional Commits

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipos obligatorios

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(reservation): add discount calculation` |
| `fix` | Corrección de bug | `fix(pricing): correct family discount rate` |
| `docs` | Solo documentación | `docs(readme): update installation steps` |
| `style` | Formato (sin cambio de código) | `style: apply php-cs-fixer` |
| `refactor` | Refactorización (ni feat ni fix) | `refactor(reservation): extract pricing logic` |
| `perf` | Mejora de rendimiento | `perf(query): add index on reservation_date` |
| `test` | Añadir/corregir pruebas | `test(reservation): add edge cases` |
| `build` | Build system, deps externas | `build: upgrade to symfony 6.4.2` |
| `ci` | Configuración CI/CD | `ci: add phpstan to github actions` |
| `chore` | Otros (sin código prod) | `chore: update .gitignore` |

### Scopes recomendados

- `reservation` - Bounded Context Reserva
- `catalog` - Bounded Context Catálogo
- `notification` - Bounded Context Notificación
- `pricing` - Subdominio Pricing
- `infrastructure` - Capa Infrastructure
- `domain` - Capa Domain
- `application` - Capa Application

### Ejemplos de commits

#### ✅ BUENO

```bash
# Feature
git commit -m "feat(reservation): add Money value object

Implement immutable Money value object with:
- Creation from euros (float to cents conversion)
- Addition and multiplication operations
- Currency validation (EUR only for now)

Closes #123"

# Fix
git commit -m "fix(pricing): correct family discount calculation

Family discount was applied before age discount,
causing incorrect total. Now applies age discount first,
then family discount on the subtotal.

Fixes #456"

# Test
git commit -m "test(reservation): add participant age validation tests

Add edge cases:
- Age = 0 (valid)
- Age = -1 (invalid)
- Age = 121 (invalid)"

# Refactor
git commit -m "refactor(pricing): extract discount policies

Extract discount calculation logic into separate
policy classes following Strategy pattern:
- FamilyDiscountPolicy
- EarlyBookingDiscountPolicy
- LoyaltyDiscountPolicy"
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
git commit -m "feat(reservation): implement the complete reservation system with pricing, discounts, participants management and email notifications"

# ❌ Varios cambios no relacionados
git commit -m "feat: add reservation + fix email + update docs"
```

### Herramientas de validación

#### Commitlint

```bash
# Instalación
npm install --save-dev @commitlint/{cli,config-conventional}

# Configuración (.commitlintrc.json)
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "perf", "test", "build", "ci", "chore"
    ]],
    "scope-enum": [2, "always", [
      "reservation", "catalog", "notification",
      "pricing", "domain", "infrastructure", "application"
    ]],
    "subject-max-length": [2, "always", 72]
  }
}
```

#### Git hooks (Husky)

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.0.0",
    "@commitlint/config-conventional": "^18.0.0",
    "husky": "^8.0.0"
  }
}
```

```bash
# .husky/commit-msg
#!/bin/sh
npx --no-install commitlint --edit "$1"
```

---

## Ramas

### Nomenclatura

```
<type>/<description-courte>
```

**Tipos:**
- `feature/` - Nueva funcionalidad
- `fix/` - Corrección de bug
- `refactor/` - Refactorización
- `docs/` - Documentación
- `chore/` - Mantenimiento

### Ejemplos

```bash
# ✅ BUENO
feature/add-reservation-pricing
feature/participant-age-validation
fix/discount-calculation-error
refactor/extract-pricing-policies
docs/update-readme-installation
chore/upgrade-symfony-6.4

# ❌ MALO
dev-branch
my-work
bug-fix
feature123
```

### Creación de rama

```bash
# Siempre partir de main actualizado
git checkout main
git pull origin main

# Crear la rama de feature
git checkout -b feature/add-reservation-pricing

# Trabajar en la feature
# ... commits ...

# Push de la rama
git push -u origin feature/add-reservation-pricing
```

### Duración de vida

- ⏱️ **Máximo 3 días** de desarrollo
- Si > 3 días → **dividir** en varios PRs
- Merge en cuanto esté funcional (aunque incompleto)
- Usar **feature flags** si es necesario

---

## Pull Requests

### Template PR (.github/pull_request_template.md)

```markdown
## Descripción

<!-- Describe los cambios de este PR -->

Closes #[numero_issue]

## Tipo de cambio

- [ ] 🚀 Nueva funcionalidad (feat)
- [ ] 🐛 Corrección de bug (fix)
- [ ] 📝 Documentación (docs)
- [ ] ♻️ Refactorización (refactor)
- [ ] ⚡ Rendimiento (perf)
- [ ] ✅ Pruebas (test)

## Checklist

### Código

- [ ] El código sigue los estándares del proyecto (PSR-12, Symfony)
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado las partes complejas
- [ ] PHPStan nivel max pasa (0 errores)
- [ ] PHP-CS-Fixer aplicado
- [ ] Rector sugerencias aplicadas
- [ ] Validación Deptrac pasada

### Pruebas

- [ ] Pruebas unitarias añadidas/actualizadas
- [ ] Pruebas de integración añadidas si es necesario
- [ ] Pruebas funcionales añadidas si es necesario
- [ ] Escenarios Behat añadidos para features de negocio
- [ ] Cobertura de código ≥ 80%
- [ ] Mutation score (Infection) ≥ 80%
- [ ] Todas las pruebas pasan

### Documentación

- [ ] README actualizado si es necesario
- [ ] PHPDoc actualizado
- [ ] CHANGELOG.md actualizado
- [ ] ADR creado si hay decisión arquitectónica

### Arquitectura

- [ ] Respeto Clean Architecture (Domain → Application → Infrastructure)
- [ ] Principios SOLID aplicados
- [ ] DRY respetado (sin duplicación)
- [ ] YAGNI respetado (sin código inútil)
- [ ] Value Objects utilizados para valores de negocio
- [ ] Domain Events para eventos de negocio

### Seguridad

- [ ] Sin datos sensibles en claro
- [ ] Validación de inputs
- [ ] Protección CSRF si hay formularios
- [ ] Sin secretos en el código

### Rendimiento

- [ ] Sin N+1 queries
- [ ] Índices DB creados si es necesario
- [ ] Cache utilizado si es pertinente

## Impactos

### Base de datos

- [ ] Migración creada
- [ ] Migración probada (up + down)
- [ ] Plan de rollback documentado

### API

- [ ] Breaking changes documentados
- [ ] Backward compatibility mantenida
- [ ] Versionado API respetado

## Screenshots

<!-- Si hay cambio UI, añadir screenshots -->

## Comandos de prueba

```bash
# Pruebas
make test
make test-coverage

# Calidad
make quality

# Migración
make migration-diff
make migration-migrate
```

## Notas para los revisores

<!-- Indicar los puntos a verificar particularmente -->
```

### Creación PR

```bash
# Via GitHub CLI (recomendado)
gh pr create \
  --title "feat(reservation): add pricing calculation" \
  --body "Implement Money value object and pricing service" \
  --base main \
  --head feature/add-reservation-pricing

# Via interfaz GitHub
# → New Pull Request
```

### Labels

| Label | Utilización |
|-------|-------------|
| `enhancement` | Nueva funcionalidad |
| `bug` | Corrección de bug |
| `documentation` | Solo documentación |
| `refactoring` | Refactorización |
| `performance` | Mejora de rendimiento |
| `security` | Seguridad |
| `breaking-change` | Cambio con ruptura |
| `needs-review` | Esperando revisión |
| `work-in-progress` | WIP |
| `ready-to-merge` | Listo para merge |

---

## Revisión de Código

### Checklist Revisor

#### Arquitectura

- [ ] Respeto de Clean Architecture + DDD
- [ ] Capas bien separadas (Domain/Application/Infrastructure)
- [ ] Sin dependencias invertidas
- [ ] Value Objects para valores de negocio
- [ ] Aggregates bien definidos

#### Calidad de Código

- [ ] Principios SOLID respetados
- [ ] KISS / DRY / YAGNI aplicados
- [ ] Nomenclatura explícita (variables, métodos, clases)
- [ ] Sin duplicación de código
- [ ] Complejidad ciclomática aceptable (< 10)
- [ ] Métodos cortos (< 20 líneas)

#### Pruebas

- [ ] Pruebas unitarias para lógica de negocio
- [ ] Pruebas de integración para repositorios
- [ ] Pruebas funcionales para casos de uso
- [ ] Behat para escenarios de negocio
- [ ] Cobertura ≥ 80%
- [ ] Todas las pruebas pasan
- [ ] Sin pruebas comentadas

#### Seguridad

- [ ] Sin secretos hardcodeados
- [ ] Validación de inputs
- [ ] Protección XSS
- [ ] Protección CSRF
- [ ] Datos sensibles cifrados (RGPD)

#### Rendimiento

- [ ] Sin N+1 queries
- [ ] Eager loading si es necesario
- [ ] Índices DB apropiados
- [ ] Cache utilizado si es pertinente
- [ ] Paginación para listas grandes

#### Documentación

- [ ] PHPDoc completo
- [ ] README actualizado
- [ ] CHANGELOG actualizado
- [ ] ADR si hay decisión arquitectónica

### Proceso de revisión

1. **Auto-revisión** (autor)
   - Releer su propio código
   - Check la checklist PR
   - Probar manualmente

2. **Primera pasada** (revisor)
   - Arquitectura global
   - Lógica de negocio
   - Pruebas

3. **Segunda pasada** (revisor)
   - Detalles de implementación
   - Nomenclatura
   - Optimizaciones

4. **Comentarios**
   - Constructivos y amables
   - Sugerir soluciones
   - Explicar el "por qué"

5. **Aprobación**
   - ✅ Approve → Listo para merge
   - 💬 Comment → Sugerencias no bloqueantes
   - 🔴 Request changes → Correcciones necesarias

### Ejemplos de comentarios

#### ✅ BUENO (constructivo)

```
Sugerencia: Este método hace varias cosas (cálculo + validación).
¿Qué te parece dividirlo en dos métodos distintos para respetar SRP?

Ejemplo:
```php
public function calculate(Reservation $r): Money
{
    $this->validate($r);
    return $this->doCalculate($r);
}

private function validate(Reservation $r): void { /* ... */ }
private function doCalculate(Reservation $r): Money { /* ... */ }
```
```

#### ❌ MALO (no constructivo)

```
Este código es malo, hay que rehacerlo todo.
```

---

## Checklist PR

### Antes de crear el PR

```bash
# 1. Pruebas pasan
make test

# 2. Cobertura OK
make test-coverage
# Verificar: ≥ 80%

# 3. Calidad OK
make quality
# PHPStan: 0 error
# CS-Fixer: 0 violación
# Rector: 0 sugerencia
# Deptrac: 0 violación

# 4. Mutation score OK
make infection
# MSI ≥ 80%

# 5. Self-review
git diff main...HEAD
```

### Durante la revisión

```bash
# Aplicar sugerencias del revisor
git add .
git commit -m "fix: apply code review suggestions"
git push

# Rebase si es necesario
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### Antes del merge

```bash
# 1. Rama actualizada
git fetch origin
git rebase origin/main

# 2. Squash si es necesario (commits intermedios)
git rebase -i origin/main

# 3. CI pasa
# → Verificar GitHub Actions

# 4. Review aprobada
# → Al menos 1 approve

# 5. Merge
# → Squash and merge (historial limpio)
```

---

## Ejemplos de flujo de trabajo

### Feature completa

```bash
# 1. Crear rama
git checkout main
git pull
git checkout -b feature/add-reservation-confirmation

# 2. TDD: Test primero (RED)
# Escribir test que falla
git add tests/
git commit -m "test(reservation): add confirmation tests"

# 3. Implementación (GREEN)
# Código mínimo para pasar el test
git add src/
git commit -m "feat(reservation): add confirmation logic"

# 4. Refactor
# Mejorar el código
git add src/
git commit -m "refactor(reservation): extract confirmation rules"

# 5. Documentación
git add README.md
git commit -m "docs(reservation): document confirmation process"

# 6. Push + PR
git push -u origin feature/add-reservation-confirmation
gh pr create --fill

# 7. Review + correcciones
# ... aplicar feedback ...
git add .
git commit -m "fix: apply review suggestions"
git push

# 8. Merge
# → Via GitHub UI (Squash and merge)

# 9. Limpieza
git checkout main
git pull
git branch -d feature/add-reservation-confirmation
```

### Hotfix urgente

```bash
# 1. Crear rama desde main
git checkout main
git pull
git checkout -b fix/critical-pricing-bug

# 2. Fix + test
git add src/ tests/
git commit -m "fix(pricing): correct discount calculation

Family discount was doubled due to loop error.
Added test to prevent regression.

Fixes #789"

# 3. Push + PR express
git push -u origin fix/critical-pricing-bug
gh pr create --fill --label "bug,urgent"

# 4. Review rápida + merge
# → Priority review
# → Fast-track merge

# 5. Limpieza
git checkout main
git pull
git branch -d fix/critical-pricing-bug
```

---

## Recursos

- **GitHub Flow:** [Guía](https://docs.github.com/en/get-started/quickstart/github-flow)
- **Conventional Commits:** [Especificación](https://www.conventionalcommits.org/)
- **Commitlint:** [Documentación](https://commitlint.js.org/)
- **Git Best Practices:** [Guía Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
