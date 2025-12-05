# Testing TDD & BDD - Atoll Tourisme

## Descripción General

El desarrollo **TDD (Test-Driven Development)** es **OBLIGATORIO** para todo el proyecto Atoll Tourisme. El ciclo RED → GREEN → REFACTOR debe respetarse estrictamente.

**Objetivos:**
- ✅ Cobertura de código: **80% mínimo**
- ✅ Mutation Score (Infection): **80% mínimo**
- ✅ Tests antes de la implementación (TDD estricto)
- ✅ BDD con Behat para escenarios de negocio

> **Referencias:**
> - `06-docker-hadolint.md` - Comandos Docker para tests
> - `08-quality-tools.md` - Herramientas de calidad (PHPUnit, Infection)
> - `04-solid-principles.md` - Código testeable

---

## Tabla de contenidos

1. [TDD - Test-Driven Development](#tdd---test-driven-development)
2. [Estructura de tests](#estructura-de-tests)
3. [Configuración PHPUnit](#configuracion-phpunit)
4. [Tests unitarios](#tests-unitarios)
5. [Tests de integración](#tests-de-integracion)
6. [Tests funcionales](#tests-funcionales)
7. [BDD con Behat](#bdd-con-behat)
8. [Mutation Testing con Infection](#mutation-testing-con-infection)
9. [Checklist de validación](#checklist-de-validacion)

---

## TDD - Test-Driven Development

### Ciclo TDD obligatorio

```
┌─────────────────────────────────────────┐
│  1. RED: Escribir un test que falla     │
│     - Test unitario                     │
│     - Test funcional                    │
│     - Especificación Behat              │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  2. GREEN: Código mínimo para pasar     │
│     - Implementación mínima             │
│     - Sin optimización                  │
│     - Solo hacer pasar el test          │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. REFACTOR: Mejorar el código         │
│     - Eliminar duplicación              │
│     - Aplicar SOLID                     │
│     - Tests siempre en verde            │
└─────────────┬───────────────────────────┘
              │
              └──────┐
                     │ Reiniciar
                     ▼
```

### Reglas TDD estrictas

1. **Nunca código de producción sin test que falla primero**
2. **Tests unitarios para lógica de negocio (Domain)**
3. **Tests de integración para repositories (Infrastructure)**
4. **Tests funcionales para use cases (Application)**
5. **BDD/Behat para escenarios de negocio de usuario**

---

## Estructura de tests

```
tests/
├── Unit/                               # Tests unitarios (lógica pura)
│   ├── Domain/
│   │   ├── Reservation/
│   │   │   ├── Entity/
│   │   │   │   ├── ReservationTest.php
│   │   │   │   └── ParticipantTest.php
│   │   │   ├── ValueObject/
│   │   │   │   ├── MoneyTest.php
│   │   │   │   ├── ReservationIdTest.php
│   │   │   │   └── ReservationStatusTest.php
│   │   │   └── Service/
│   │   │       └── ReservationPricingServiceTest.php
│   │   └── Shared/
│   │       └── ValueObject/
│   │           ├── EmailTest.php
│   │           └── PhoneNumberTest.php
│   │
├── Integration/                        # Tests de integración (BDD, repositories)
│   ├── Infrastructure/
│   │   ├── Persistence/
│   │   │   └── Doctrine/
│   │   │       └── Repository/
│   │   │           └── DoctrineReservationRepositoryTest.php
│   │   └── Notification/
│   │       └── EmailNotificationServiceTest.php
│   │
├── Functional/                         # Tests funcionales (use cases, HTTP)
│   ├── Application/
│   │   └── Reservation/
│   │       └── UseCase/
│   │           ├── CreateReservationUseCaseTest.php
│   │           └── ConfirmReservationUseCaseTest.php
│   ├── Controller/
│   │   └── ReservationControllerTest.php
│   │
├── Behat/                             # Tests BDD (escenarios de negocio)
│   ├── bootstrap.php
│   └── Context/
│       ├── ReservationContext.php
│       └── SejourContext.php
│
├── Fixtures/                          # Datos de test
│   ├── ReservationFixtures.php
│   └── SejourFixtures.php
│
└── bootstrap.php
```

---

## Configuración PHPUnit

### Comandos de test

```bash
# Todos los tests
make test

# Tests unitarios únicamente
make test-unit

# Tests de integración
make test-integration

# Tests funcionales
make test-functional

# Con coverage
make test-coverage

# Archivo HTML generado en: var/coverage/html/index.html
```

---

## Tests unitarios

### Características

- ✅ **Rápidos** (< 100ms por test)
- ✅ **Aislados** (sin base de datos, sin red)
- ✅ **Deterministas** (siempre el mismo resultado)
- ✅ **Independientes** (orden de ejecución aleatorio)

---

## Tests de integración

### Características

- ✅ Base de datos real (PostgreSQL en test)
- ✅ Transacciones rollback después de cada test
- ✅ Fixtures para datos de test
- ✅ Tests de repositories Doctrine

---

## Tests funcionales

### Características

- ✅ Tests completos de use cases
- ✅ Simulan comportamiento de usuario
- ✅ Verifican emails enviados
- ✅ Testean controllers HTTP

---

## BDD con Behat

### Configuración behat.yml

```yaml
default:
    suites:
        reservation:
            paths: ['%paths.base%/features/reservation']
            contexts:
                - App\Tests\Behat\Context\ReservationContext

    extensions:
        FriendsOfBehat\SymfonyExtension:
            bootstrap: tests/bootstrap.php
```

### Feature: Creación de reserva

```gherkin
# features/reservation/create_reservation.feature

Feature: Crear una reserva
    Como cliente
    Quiero reservar una estancia
    Para participar en las actividades

    Background:
        Given las siguientes estancias existen:
            | id          | titulo                 | precio | fecha_inicio | fecha_fin  |
            | sejour-ski  | Estancia esquí Alpes   | 500€   | 2025-02-01   | 2025-02-07 |
            | sejour-surf | Estancia surf Biarritz | 450€   | 2025-03-15   | 2025-03-22 |

    Scenario: Crear una reserva con 2 participantes
        When creo una reserva para la estancia "sejour-ski" con:
            | nombre       | edad |
            | Jean Dupont  | 30   |
            | Marie Dupont | 28   |
        Then la reserva está creada
        And el monto total es de "1000€"
        And recibo un email de confirmación

    Scenario: Aplicar descuento familia numerosa
        When creo una reserva para la estancia "sejour-ski" con:
            | nombre    | edad |
            | Padre 1   | 35   |
            | Padre 2   | 33   |
            | Hijo 1    | 10   |
            | Hijo 2    | 8    |
        Then la reserva está creada
        And se aplica un descuento de "10%"
        And el monto total es de "1350€"
        # Base: (500 + 500 + 250 + 250) = 1500
        # Descuento 10%: 1500 * 0.9 = 1350

    Scenario: Rechazar reserva sin participante
        When creo una reserva para la estancia "sejour-ski" sin participante
        Then recibo un error "At least one participant required"
```

### Ejecución Behat

```bash
# Todos los escenarios
make behat

# Escenario específico
make behat ARGS="--name='Crear una reserva con 2 participantes'"

# Salida esperada:
# Feature: Crear una reserva
#   Scenario: Crear una reserva con 2 participantes
#     ✓ When creo una reserva...
#     ✓ Then la reserva está creada
#     ✓ And el monto total es de "1000€"
#
# 1 scenario (1 passed)
# 3 steps (3 passed)
```

---

## Mutation Testing con Infection

### Configuración infection.json5

```json5
{
    "$schema": "vendor/infection/infection/resources/schema.json",
    "source": {
        "directories": ["src"]
    },
    "logs": {
        "text": "var/infection/infection.log",
        "html": "var/infection/index.html"
    },
    "mutators": {
        "@default": true
    },
    "minMsi": 80,
    "minCoveredMsi": 90
}
```

### Ejecución Infection

```bash
# Mutation testing
make infection

# Salida esperada:
# Infection - PHP Mutation Testing Framework
#
# Ejecutando mutation tests...
#
# Mutations: 150
# Killed: 120 (80%)
# Escaped: 20 (13.3%)
# Errors: 5 (3.3%)
# Timed Out: 5 (3.3%)
#
# Mutation Score Indicator (MSI): 80%
# Covered Code MSI: 92%
```

**Si una mutación sobrevive = test faltante o débil!**

---

## Checklist de validación

### Antes de cada commit

- [ ] **TDD:** Tests escritos ANTES de la implementación
- [ ] **RED:** Test falla inicialmente
- [ ] **GREEN:** Implementación mínima hace pasar el test
- [ ] **REFACTOR:** Código mejorado, tests siempre en verde
- [ ] **Cobertura:** `make test-coverage` → 80% mínimo
- [ ] **Mutation:** `make infection` → MSI 80% mínimo
- [ ] **BDD:** Escenarios Behat para funcionalidades de negocio
- [ ] **Fast:** Tests unitarios < 100ms cada uno
- [ ] **Isolated:** Tests independientes (orden aleatorio OK)

### Métricas objetivo

| Métrica | Objetivo | Mínimo |
|----------|-------|---------|
| Code Coverage | 85% | 80% |
| Mutation Score (MSI) | 85% | 80% |
| Covered Code MSI | 95% | 90% |
| Tests unitarios | < 100ms | < 200ms |
| Tests integración | < 1s | < 2s |
| Tests funcionales | < 5s | < 10s |

### Comandos de validación

```bash
# Pipeline completa
make test              # Todos los tests
make test-coverage     # Con coverage
make infection         # Mutation testing
make behat             # Tests BDD

# Validación CI
make ci
```

---

## Recursos

- **Libro:** *Test-Driven Development by Example* - Kent Beck
- **Libro:** *Growing Object-Oriented Software, Guided by Tests* - Steve Freeman
- **PHPUnit:** [Documentación](https://phpunit.de/documentation.html)
- **Behat:** [Documentación](https://docs.behat.org/)
- **Infection:** [Documentación](https://infection.github.io/)

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
