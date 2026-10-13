# Checklist: Antes de cada commit

> **Obligatorio antes de git commit** - Garantizar la calidad del código
> Referencia: `.claude/rules/04-testing-tdd.md`, `.claude/rules/03-coding-standards.md`

## Comando rápido

```bash
# Validar todo en un comando
make quality && make test

# O si Makefile no disponible:
composer phpstan && composer cs-fix && docker compose exec php bin/phpunit
```

---

## 1. Tests automatizados

### ✅ Todos los tests pasan

```bash
# Tests unitarios
make test-unit
# o: docker compose exec php bin/phpunit --testsuite=unit

# Tests de integración
make test-integration
# o: docker compose exec php bin/phpunit --testsuite=integration

# Tests Behat (BDD)
make test-behat
# o: docker compose exec php vendor/bin/behat

# TODOS los tests
make test
```

**Criterio de éxito:**
- ✅ Todos los tests pasan (0 failed)
- ✅ Sin tests skipped (salvo razón válida)
- ✅ Sin warnings

**Si hay fallo:**
- ❌ NO commit
- 🔧 Corregir los tests o el código
- 🔁 Re-ejecutar los tests

---

## 2. Análisis estático (PHPStan)

### ✅ Nivel 8 PHPStan sin errores

```bash
make phpstan
# o: docker compose exec php vendor/bin/phpstan analyse
```

**Criterio de éxito:**
- ✅ 0 errores PHPStan nivel 8
- ✅ Tipos correctos en todas partes
- ✅ Sin código muerto detectado

**Errores frecuentes a verificar:**
```php
// ❌ Tipo faltante
public function calculate($amount) { }

// ✅ Tipo explícito
public function calculate(Money $amount): Money { }

// ❌ Array sin tipo
/** @var array */
private $items;

// ✅ Array tipado
/** @var array<int, Participant> */
private array $participants;
```

**Si hay fallo:**
- 🔧 Añadir los tipos faltantes
- 🔧 Corregir las inconsistencias de tipos
- 📖 Referencia: `.claude/rules/03-coding-standards.md`

---

## 3. Coding Standards (PHP CS Fixer)

### ✅ Código formateado según PER-CS 3.0

```bash
make cs-fix
# o: docker compose exec php vendor/bin/php-cs-fixer fix
```

**Criterio de éxito:**
- ✅ Código formateado automáticamente
- ✅ PER-CS 3.0 respetado
- ✅ Sin trailing whitespace
- ✅ Indentación coherente (4 espacios)

**Verificaciones automáticas:**
- Declaración de tipos estricta (`declare(strict_types=1);`)
- Imports ordenados alfabéticamente
- Línea vacía antes de `return`
- Sin `else` innecesarios
- `final` en todas las clases

**Si hay fallo:**
- ✅ El fixer corrige automáticamente
- ✅ Revisar los cambios con `git diff`
- ✅ Commitear las correcciones de estilo

---

## 4. Docker (Hadolint)

### ✅ Dockerfile válido (si modificado)

```bash
make hadolint
# o: docker run --rm -i hadolint/hadolint < Dockerfile
```

**Criterio de éxito:**
- ✅ Sin errores Hadolint
- ✅ Buenas prácticas Docker respetadas
- ✅ Imágenes con versión fija (no `:latest`)

**Verificaciones clave:**
```dockerfile
# ❌ Versión no fijada
FROM php:fpm

# ✅ Versión explícita
FROM php:8.5-fpm-alpine

# ❌ apt-get sin cleanup
RUN apt-get install -y curl

# ✅ Cleanup en la misma capa
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

**Si hay fallo:**
- 🔧 Corregir el Dockerfile
- 📖 Referencia: `.claude/rules/03-coding-standards.md` (sección Docker)

---

## 5. Coverage de tests

### ✅ Coverage mínimo 80%

```bash
make test-coverage
# o: docker compose exec php bin/phpunit --coverage-html build/coverage

# Abrir el reporte
open build/coverage/index.html
```

**Criterio de éxito:**
- ✅ Coverage global ≥ 80%
- ✅ Nuevas clases/métodos testeados
- ✅ Ramas principales cubiertas

**Si coverage < 80%:**
- ⚠️ Aceptable si:
  - Código legacy no tocado
  - Getters/setters simples
  - Configuración/bootstrap
- ❌ No aceptable si:
  - Nueva lógica de negocio no testeada
  - Nuevos métodos públicos no testeados

**Acciones:**
- 🔧 Añadir tests unitarios faltantes
- 🔧 Añadir tests de integración si es necesario
- 📖 Referencia: `.claude/rules/04-testing-tdd.md`

---

## 6. Mensaje de commit (Conventional Commits)

### ✅ Mensaje conforme a la convención

```bash
# Formato:
<type>(<scope>): <description>

[cuerpo opcional]

[footer opcional]
```

**Tipos autorizados:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactoring (sin cambio funcional)
- `test`: Añadir/modificar tests
- `docs`: Solo documentación
- `style`: Formateo (sin cambio de código)
- `perf`: Mejora de rendimiento
- `chore`: Tareas técnicas (deps, config, etc.)

**Ejemplos VÁLIDOS:**

```bash
feat(reservation): añade suplemento single para 1 participante

Implementa la regla de negocio de +30% sobre el precio si solo un participante.

Closes #42
```

```bash
fix(participant): corrige validación edad mínima

Añade la verificación de que el participante sea mayor de edad (≥18 años).

BREAKING CHANGE: Los participantes menores no son aceptados.
```

```bash
test(reservation): añade tests cálculo precio total

Cubre los casos:
- 1 participante (con suplemento)
- 2+ participantes (sin suplemento)
- Con opciones de pago
```

```bash
refactor(value-object): extrae Money en un VO

Reemplaza los int/float por el objeto Money para evitar errores
de cálculo con los montos.
```

**Ejemplos INVÁLIDOS:**

```bash
❌ "update code"  (muy vago)
❌ "fix bug"      (¿qué bug?)
❌ "WIP"          (no commitear WIP)
❌ "actualización"  (en español, tipo faltante)
```

**Reglas:**
- Descripción en español (código en inglés)
- Imperativo presente ("añade" no "añadido")
- Primera letra minúscula
- Sin punto final
- Máx 72 caracteres para la primera línea
- Cuerpo detallado si es necesario (después de línea vacía)

**Si no conforme:**
- 🔧 Reformular el mensaje
- 📖 Referencia: https://www.conventionalcommits.org/

---

## 7. Documentación (si aplica)

### ✅ Documentación actualizada

**Verificar si es necesario:**
- [ ] README.md actualizado (nueva feature, cambio de API)
- [ ] PHPDoc completo en métodos públicos
- [ ] ADR (Architecture Decision Record) si decisión importante
- [ ] CHANGELOG.md actualizado (si versionado)

**Ejemplos que requieren doc:**
- Nueva ruta API
- Nuevo comando CLI
- Cambio de configuración (env vars, services.yaml)
- Breaking change

**Si falta documentación:**
- 🔧 Añadir la documentación necesaria
- 📖 Referencia: `.claude/rules/03-coding-standards.md`

---

## 8. Seguridad & RGPD (si datos personales)

### ✅ Conformidad seguridad/RGPD

**Si el commit toca datos personales:**
- [ ] Datos cifrados en BD (`doctrine-encrypt-bundle`)
- [ ] Validación estricta de inputs
- [ ] Sin datos sensibles en logs
- [ ] Consentimiento RGPD si nueva recolección
- [ ] Sin secretos en claro (`.env`, no commitear)

**Verificar:**
```bash
# Buscar secretos potenciales
git diff --cached | grep -i 'password\|secret\|api_key'

# Sin .env commiteado
git diff --cached --name-only | grep '.env$'
```

**Si se detecta violación:**
- ❌ NO commit
- 🔧 Retirar los secretos
- 🔧 Usar variables de entorno
- 📖 Referencia: `.claude/rules/07-security-rgpd.md`

---

## Checklist final antes del commit

```bash
# 1. Estado limpio
git status

# 2. Revisar diff
git diff --cached

# 3. Calidad OK
make quality
✅ PHPStan: 0 errores
✅ CS-Fixer: Código formateado

# 4. Tests OK
make test
✅ Tests unitarios: PASSED
✅ Tests integración: PASSED
✅ Tests Behat: PASSED

# 5. Coverage OK
make test-coverage
✅ Coverage: ≥ 80%

# 6. Mensaje commit preparado
✅ Formato: <type>(<scope>): <description>
✅ Descripción clara y concisa

# 7. Si todo OK → COMMIT
git add .
git commit -m "feat(reservation): añade suplemento single para 1 participante

Implementa la regla de negocio de +30% sobre el precio si solo un participante.
Tests unitarios y de integración añadidos.
Coverage: 85%

Closes #42
"
```

---

## Ejemplos de workflow completo

### Workflow 1: Nueva feature

```bash
# 1. Desarrollo TDD
vim tests/Unit/Service/ReservationServiceTest.php  # RED
vim src/Service/ReservationService.php             # GREEN
make test-unit                                     # ✅

# 2. Calidad
make cs-fix                                        # Auto-format
make phpstan                                       # ✅ Nivel 8

# 3. Tests completos
make test                                          # ✅ Todos pasan

# 4. Coverage
make test-coverage                                 # ✅ 85%

# 5. Commit
git add .
git commit -m "feat(reservation): añade cálculo precio con opciones

Implementa el cálculo del precio total incluyendo:
- Precio base × nb participantes
- Suplemento single si 1 participante
- Opciones de pago (seguro, etc.)

Tests: 12 tests añadidos (85% coverage)
PHPStan: nivel 8 OK

Closes #45
"
```

### Workflow 2: Fix de bug

```bash
# 1. Test de no-regresión (RED)
vim tests/Unit/ValueObject/MoneyTest.php
make test-unit                                     # ❌ Failed (esperado)

# 2. Fix (GREEN)
vim src/ValueObject/Money.php
make test-unit                                     # ✅ Passed

# 3. Calidad
make quality                                       # ✅ OK

# 4. Commit
git commit -m "fix(value-object): corrige redondeo en Money::multiply

El cálculo multiply() redondeaba incorrectamente los céntimos,
causando diferencias de precio de 0.01€.

Añade round() con PHP_ROUND_HALF_UP.

Fixes #67
"
```

---

## En caso de problema

### Tests fallan

```bash
# Identificar el test que falla
make test-unit --verbose

# Debug
docker compose exec php bin/phpunit --filter=testMethodName --debug

# Verificar las fixtures
docker compose exec php bin/console doctrine:fixtures:load --env=test
```

### PHPStan falla

```bash
# Ver los errores detallados
make phpstan --verbose

# Analizar un archivo específico
docker compose exec php vendor/bin/phpstan analyse src/Service/ReservationService.php -l 8
```

### Coverage muy bajo

```bash
# Ver los archivos no cubiertos
make test-coverage

# Añadir tests faltantes
vim tests/Unit/[ClassToTest]Test.php
```

---

## Comando todo-en-uno

```bash
# Script que hace todo (añadir al Makefile)
make pre-commit
```

```makefile
# Makefile
.PHONY: pre-commit
pre-commit: ## Validación completa antes del commit
	@echo "🔍 PHPStan..."
	@$(MAKE) phpstan
	@echo "✅ PHPStan OK"
	@echo ""
	@echo "🎨 CS-Fixer..."
	@$(MAKE) cs-fix
	@echo "✅ Código formateado"
	@echo ""
	@echo "🧪 Tests..."
	@$(MAKE) test
	@echo "✅ Tests OK"
	@echo ""
	@echo "📊 Coverage..."
	@$(MAKE) test-coverage
	@echo "✅ Coverage OK"
	@echo ""
	@echo "🐳 Hadolint..."
	@$(MAKE) hadolint || true
	@echo ""
	@echo "🎉 Listo para commit!"
```

Uso:
```bash
make pre-commit && git commit
```

---

## Recordatorios importantes

### ⚠️ NUNCA commitear

- ❌ Tests que fallan
- ❌ Código que no compila
- ❌ Errores PHPStan nivel 8
- ❌ Secretos/contraseñas en claro
- ❌ Archivos `.env` (excepto `.env.dist`)
- ❌ Código comentado (eliminar, no comentar)
- ❌ `var_dump()`, `dd()`, `console.log()`
- ❌ `//TODO` sin ticket asociado
- ❌ Código no formateado (CS-Fixer)

### ✅ Siempre commitear

- ✅ Tests que pasan
- ✅ Código formateado (PER-CS 3.0)
- ✅ PHPStan nivel 8 OK
- ✅ Documentación actualizada
- ✅ Mensaje de commit claro
- ✅ Coverage ≥ 80%

---

**Tiempo estimado para esta checklist:** 2-5 minutos

**Si toma más de 5 minutos:** Probablemente hay un problema a corregir antes del commit.
