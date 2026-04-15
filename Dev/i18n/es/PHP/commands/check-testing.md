---
description: Análisis de Cobertura de Tests PHP
argument-hint: [argumentos]
---

# Análisis de Cobertura de Tests PHP

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto PHP a auditar, por defecto el directorio actual)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca múltiples módulos o requiere una investigación transversal.

## MISIÓN

Auditar la estrategia de testing, cobertura y calidad de un proyecto PHP nativo. Evaluar la pirámide de tests (unitarios, integración, end-to-end), prácticas de Pest / PHPUnit, mutation score e higiene de fixtures. Producir un informe con una puntuación sobre 25.

**Reglas de referencia**: `.claude/rules/php-testing.md`

### Paso 1: Inventario de Suite de Tests

- [ ] Leer `phpunit.xml` / `phpunit.xml.dist` o configuración de Pest
- [ ] Verificar Pest 4.5+ (`pestphp/pest`) o PHPUnit 12+
- [ ] Verificar Infection (`infection/infection`) para mutation testing
- [ ] Verificar Mockery, Prophecy, o dobles nativos de PHPUnit
- [ ] Leer estructura de `tests/`: Unit / Integration / Feature / Browser

**Diseño esperado**:

```
tests/
├── Unit/           # Rápidos, sin IO, Domain + Application
├── Integration/    # DB, filesystem, adaptadores externos
├── Feature/        # Nivel de caso de uso, end-to-end dentro del límite de la app
└── Fixtures/       # Factories de datos de test, builders
```

### Paso 2: Cobertura (7 pts)

```bash
docker compose exec app vendor/bin/pest --coverage --min=80
# o
docker compose exec app vendor/bin/phpunit --coverage-text --coverage-html=var/coverage
```

Verificar:
- [ ] Cobertura de línea global ≥ 80%
- [ ] Cobertura de capa Domain ≥ 95% (la lógica de negocio es donde los bugs duelen más)
- [ ] Cobertura de capa Application ≥ 90%
- [ ] Cobertura de Infrastructure ≥ 70% (testeado con integración)
- [ ] Informe de cobertura publicado en CI

**Puntuación**:
- ≥ 90%: 7 pts
- 80–89%: 5 pts
- 70–79%: 3 pts
- < 70%: 0 pts

### Paso 3: Tests Unitarios — Domain (6 pts)

- [ ] Cada Value Object tiene tests de invariantes (entradas inválidas lanzan excepción)
- [ ] Cada Entity tiene tests de identidad + comportamiento
- [ ] Aggregates testeados para aplicación de invariantes
- [ ] Emisión de domain events testeada
- [ ] Sin IO / sin mocks necesarios (tests unitarios verdaderos)
- [ ] Patrón AAA (Arrange-Act-Assert) respetado

### Paso 4: Tests de Integración (4 pts)

- [ ] Adaptadores de base de datos testeados contra una BD real (Postgres/MySQL en Docker)
- [ ] Adaptadores HTTP testeados con fixtures grabados (patrón VCR) o un servidor mock
- [ ] Adaptadores de filesystem testeados con directorios temporales
- [ ] **Sin mocks para el adaptador bajo test** — los mocks enmascaran roturas de contrato (ref: feedback de usuario para testing con BD real)

### Paso 5: Calidad de Tests — Pest / PHPUnit (3 pts)

- [ ] Nombres de tests describen comportamiento: `it('rechaza email vacío')` / `testRejectsEmptyEmail`
- [ ] Un grupo de assertions por test (múltiples `expect()` OK si es mismo comportamiento)
- [ ] Sin `$this->markTestSkipped()` sin referencia a ticket
- [ ] Sin tests comentados
- [ ] `setUp` / `beforeEach` mantenidos mínimos; preferir factories/builders

### Paso 6: Fixtures y Data Builders (3 pts)

- [ ] Existen factories para aggregates (ej., `UserFactory::make()->withEmail(...)`)
- [ ] Sin datos mágicos en tests — constantes nombradas o builders
- [ ] Fixtures reiniciados entre tests (rollback de transacción para tests de BD)
- [ ] Faker o datos fake determinísticos

### Paso 7: Mutation Testing y Aislamiento (2 pts)

```bash
docker compose exec app vendor/bin/infection --min-msi=70 --min-covered-msi=80
```

Verificar:
- [ ] Mutation Score Indicator (MSI) ≥ 70% (objetivo 80%)
- [ ] Los tests son independientes (orden aleatorio debe pasar)
- [ ] Sin estado mutable compartido entre tests
- [ ] Tiempo y aleatoriedad inyectados (sin `time()` / `rand()` directamente)

## FORMATO DE SALIDA

```
AUDITORÍA DE TESTING PHP
========================

PUNTUACIÓN: XX/25

COBERTURA (X/7)
  Global      : XX%
  Domain      : XX%
  Application : XX%
  Infrastructure: XX%
  Brechas:
  - src/Domain/... : 0% cobertura

TESTS UNITARIOS — DOMAIN (X/6)
  Entities testeadas: N/M
  Value Objects testeados: N/M
  Faltantes:
  - src/Domain/ValueObject/Email.php

INTEGRACIÓN (X/4)
  BD real usada: sí/no
  Adaptadores mockeados (señal de alerta): N

CALIDAD DE TESTS (X/3)
  Tests omitidos sin ticket: N
  Tests comentados: N

FIXTURES (X/3)
  Factories presentes: sí/no
  Cuenta de datos mágicos: N

MUTATION Y AISLAMIENTO (X/2)
  MSI: XX%
  Tests flaky detectados: N

TOP 3 ACCIONES:
1. [CRÍTICO] Agregar tests unitarios para src/Domain/...
2. Configurar Infection con MSI ≥ 70
3. Reemplazar mocks de adaptadores con BD real en tests/Integration/
```

## NOTAS IMPORTANTES

- **Regla de oro**: un bug corregido nunca debe regresar → agregar un test de regresión ANTES de corregir
- Cobertura sola no es calidad → reportar mutation score (Infection)
- Los tests de integración NO DEBEN mockear el adaptador bajo test — los mocks ocultan roturas de contrato
- Pest 4.5+ incluye Browser Testing (respaldado por Playwright) — útil para escenarios end-to-end HTTP/CLI
- Usar Docker para todo el pipeline de tests para evitar deriva del entorno local
