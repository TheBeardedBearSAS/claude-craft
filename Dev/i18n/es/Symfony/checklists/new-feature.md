# Checklist: Nueva funcionalidad

> **Proceso completo** para implementar una nueva feature
> Referencia: `.claude/rules/01-architecture-ddd.md`, `.claude/rules/04-testing-tdd.md`

## Overview

```
1. ANÁLISIS (30 min)     → Template: .claude/templates/analysis.md
2. TDD RED (1h)         → Template: .claude/templates/test-*.md
3. TDD GREEN (2h)       → Templates: .claude/templates/*.md
4. TDD REFACTOR (1h)    → Principios SOLID
5. VALIDACIÓN (30 min)  → Checklist pre-commit
```

**Tiempo total estimado:** 5 horas para una feature mediana

---

## Fase 1: Análisis pre-implementación

### ✅ Análisis completo documentado

**Template:** `.claude/templates/analysis.md`

```bash
# Crear el documento de análisis
vim docs/analysis/[YYYY-MM-DD]-[feature-name].md
```

**Contenido obligatorio:**
- [ ] **Objetivo de negocio** claramente definido
- [ ] **Criterios de aceptación** (3-5 criterios comprobables)
- [ ] **Archivos impactados** (nuevos + modificados)
- [ ] **Impactos identificados:**
  - [ ] Breaking changes (sí/no + detalles)
  - [ ] Migración BD (sí/no + script)
  - [ ] Rendimiento (benchmarks si es necesario)
  - [ ] RGPD (datos personales + cifrado)
- [ ] **Riesgos + mitigaciones** (tabla)
- [ ] **Enfoque TDD** (tests a escribir ANTES)
- [ ] **Validación** (revisión del equipo)

**Ejemplo concreto:**
```markdown
# Análisis: Suplemento single en reservas

## Objetivo
Añadir un suplemento del 30% sobre el precio total si la reserva
contiene solo un participante.

## Criterios de aceptación
- [ ] 1 participante → precio × 1.30
- [ ] 2+ participantes → sin suplemento
- [ ] Visualización del detalle en el resumen
- [ ] Email de confirmación incluye el detalle

## Archivos impactados
Nuevos:
- tests/Unit/Service/PrixCalculatorServiceTest.php

Modificados:
- src/Service/PrixCalculatorService.php
- src/Entity/Reservation.php
- templates/emails/confirmation_client.html.twig

## Impactos
- Breaking changes: NO
- Migración BD: NO
- Rendimiento: OK (cálculo simple)
- RGPD: NO (sin datos personales)

## Tests TDD
1. it_applies_single_supplement_when_one_participant()
2. it_does_not_apply_supplement_when_multiple_participants()
3. it_calculates_correct_total_with_supplement()
```

**Validación antes de continuar:**
- [ ] Análisis revisado por al menos 1 persona
- [ ] Enfoque técnico validado
- [ ] Tests TDD definidos

---

## Fase 2: TDD - RED (Tests que fallan)

### ✅ Tests escritos ANTES de la implementación

**Templates:**
- `.claude/templates/test-unit.md`
- `.claude/templates/test-integration.md`
- `.claude/templates/test-behat.md`

### 2.1 Tests unitarios

```bash
# Crear el test ANTES del código
vim tests/Unit/Service/PrixCalculatorServiceTest.php
```

```php
<?php
// Test que va a fallar (la clase no existe todavía)

class PrixCalculatorServiceTest extends TestCase
{
    /** @test */
    public function it_applies_single_supplement_when_one_participant(): void
    {
        // ARRANGE
        $calculator = new PrixCalculatorService();
        $reservation = $this->createReservation(1); // 1 participante

        // ACT
        $total = $calculator->calculate($reservation);

        // ASSERT
        $basePrice = 1000.00;
        $expectedWithSupplement = 1300.00; // +30%
        $this->assertEquals($expectedWithSupplement, $total->toEuros());
    }
}
```

**Ejecutar el test (debe FALLAR):**
```bash
make test-unit
# ❌ Class PrixCalculatorService not found (ESPERADO)
```

### 2.2 Tests de integración

```bash
vim tests/Integration/Controller/ReservationControllerTest.php
```

```php
/** @test */
public function it_calculates_price_with_single_supplement(): void
{
    // ARRANGE
    $client = static::createClient();
    $sejour = $this->createSejour(1000.00); // Precio base

    // ACT
    $client->request('POST', '/api/reservation/create', [
        'sejour_id' => $sejour->getId(),
        'participants' => [
            ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
        ],
    ]);

    // ASSERT
    $response = json_decode($client->getResponse()->getContent(), true);
    $this->assertEquals(1300.00, $response['montant_total']);
}
```

### 2.3 Tests BDD (Behat)

```bash
vim features/reservation_pricing.feature
```

```gherkin
Escenario: Suplemento single para 1 participante
  Dado un séjour a "1000.00" €
  Cuando reservo con "1" participante
  Entonces el monto total es de "1300.00 €"
  Y veo el detalle "Suplemento single: +300.00 €"
```

**Ejecutar todos los tests (deben TODOS FALLAR):**
```bash
make test
# ❌ Todos los tests fallan (ESPERADO - fase RED)
```

**Checklist fase RED:**
- [ ] Tests unitarios escritos y fallan
- [ ] Tests de integración escritos y fallan
- [ ] Tests Behat escritos y fallan
- [ ] Al menos 3 tests por funcionalidad
- [ ] Tests cubren casos nominales + errores
- [ ] Commit de los tests (aunque fallen)

```bash
git add tests/ features/
git commit -m "test(reservation): añade tests suplemento single (RED)

Tests TDD fase RED para la funcionalidad suplemento single.
Todos los tests fallan porque la implementación no existe todavía.

- Tests unitarios: PrixCalculatorServiceTest
- Tests integración: ReservationControllerTest
- Tests BDD: reservation_pricing.feature

Ref: #42
"
```

---

## Fase 3: TDD - GREEN (Implementación mínima)

### ✅ Implementar el estricto mínimo para pasar los tests

**Templates:**
- `.claude/templates/value-object.md`
- `.claude/templates/service.md`
- `.claude/templates/aggregate-root.md`

### 3.1 Implementar el código de negocio

```bash
# Crear el servicio
vim src/Service/PrixCalculatorService.php
```

```php
<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Reservation;
use App\ValueObject\Money;

final readonly class PrixCalculatorService
{
    private const SUPPLEMENT_SINGLE_PERCENT = 30;

    public function calculate(Reservation $reservation): Money
    {
        $basePrice = $reservation->getSejour()->getPrixTtc();
        $nbParticipants = $reservation->getNbParticipants();

        $total = $basePrice->multiply($nbParticipants);

        // Suplemento single si solo 1 participante
        if ($nbParticipants === 1) {
            $supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
            $total = $total->add($supplement);
        }

        return $total;
    }
}
```

### 3.2 Integrar en el aggregate

```bash
vim src/Entity/Reservation.php
```

```php
public function calculerMontantTotal(): void
{
    $calculator = new PrixCalculatorService(); // TODO: inyectar vía servicio
    $total = $calculator->calculate($this);
    $this->montantTotalCents = $total->toCents();
}
```

### 3.3 Ejecutar los tests (deben PASAR)

```bash
make test
# ✅ Todos los tests pasan (fase GREEN)
```

**Si los tests fallan:**
- 🔧 Depurar el test que falla
- 🔧 Corregir la implementación
- 🔁 Re-ejecutar hasta GREEN

**Checklist fase GREEN:**
- [ ] Todos los tests unitarios pasan
- [ ] Todos los tests de integración pasan
- [ ] Todos los tests Behat pasan
- [ ] Implementación mínima (sin sobre-ingeniería)
- [ ] Sin código muerto
- [ ] Commit de la implementación

```bash
git add src/
git commit -m "feat(reservation): implementa suplemento single (GREEN)

Implementación mínima para pasar los tests TDD.

Lógica:
- 1 participante → precio × 1.30
- 2+ participantes → sin suplemento

Tests: ✅ 8/8 passed

Ref: #42
"
```

---

## Fase 4: TDD - REFACTOR (Mejora del código)

### ✅ Mejorar el código sin cambiar el comportamiento

**Principios a aplicar:**
- SOLID (Single Responsibility, Open/Closed, etc.)
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Clean Code

### 4.1 Refactoring: Dependency Injection

**ANTES (acoplamiento fuerte):**
```php
public function calculerMontantTotal(): void
{
    $calculator = new PrixCalculatorService(); // ❌ New en el método
    $total = $calculator->calculate($this);
}
```

**DESPUÉS (inyección):**
```php
// Reservation.php
public function calculerMontantTotal(PrixCalculatorService $calculator): void
{
    $total = $calculator->calculate($this);
    $this->montantTotalCents = $total->toCents();
}

// ReservationService.php
public function __construct(
    private readonly PrixCalculatorService $calculator
) {}

public function createReservation(array $data): Reservation
{
    // ...
    $reservation->calculerMontantTotal($this->calculator);
}
```

### 4.2 Refactoring: Extraer Value Object

**ANTES (primitive obsession):**
```php
private const SUPPLEMENT_SINGLE_PERCENT = 30;

$supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
```

**DESPUÉS (Value Object):**
```php
final readonly class SupplementRate
{
    public static function single(): self
    {
        return new self(30); // 30%
    }

    private function __construct(private int $percent) {}

    public function apply(Money $amount): Money
    {
        return $amount->multiply($this->percent / 100);
    }
}

// Uso
$supplement = SupplementRate::single()->apply($total);
```

### 4.3 Ejecutar los tests (deben SIEMPRE PASAR)

```bash
make test
# ✅ Todos los tests pasan (sin regresión)
```

**Checklist fase REFACTOR:**
- [ ] Tests siguen pasando (sin regresión)
- [ ] Código más legible/mantenible
- [ ] Principios SOLID respetados
- [ ] Sin duplicación
- [ ] Nombres expresivos (métodos, variables)
- [ ] Complejidad reducida
- [ ] PHPStan nivel 8 OK
- [ ] Commit del refactoring

```bash
git add src/
git commit -m "refactor(reservation): mejora PrixCalculatorService (REFACTOR)

Refactoring TDD sin cambio de comportamiento:

- Inyección de dependencias (sin new)
- Extracción Value Object SupplementRate
- Mejor separación de responsabilidades

Tests: ✅ 8/8 passed (sin regresión)
PHPStan: nivel 8 OK

Ref: #42
"
```

---

## Fase 5: Validación final

### ✅ Checklist completa antes del merge

### 5.1 Calidad del código

```bash
# PHPStan
make phpstan
# ✅ Nivel 8, 0 errores

# CS-Fixer
make cs-fix
# ✅ Código formateado PSR-12

# Hadolint (si se modificó Dockerfile)
make hadolint
# ✅ Sin errores
```

### 5.2 Tests completos

```bash
# Todos los tests
make test
# ✅ Todos pasan

# Coverage
make test-coverage
# ✅ Coverage ≥ 80%
```

**Revisar el reporte de coverage:**
```bash
open build/coverage/index.html
```

- [ ] Nuevas clases/métodos ≥ 80% cubiertos
- [ ] Ramas principales testeadas
- [ ] Casos de error testeados

### 5.3 Clean Architecture respetada

**Revisar la estructura:**
```
src/
├── Domain/               # Entidades, Value Objects, Events
│   ├── Entity/
│   ├── ValueObject/
│   ├── Event/
│   └── Exception/
├── Application/          # Casos de uso, Services
│   └── Service/
└── Infrastructure/       # Repositories, Controllers
    ├── Repository/
    └── Controller/
```

**Checklist arquitectura:**
- [ ] Domain no depende de NADA
- [ ] Application depende solo de Domain
- [ ] Infrastructure depende de Domain + Application
- [ ] Sin acoplamiento circular
- [ ] Interfaces en Domain, implementaciones en Infrastructure

### 5.4 SOLID respetado

#### Single Responsibility Principle
- [ ] Cada clase tiene UNA sola responsabilidad
- [ ] Cada método hace UNA sola cosa

#### Open/Closed Principle
- [ ] Extensible sin modificar el código existente
- [ ] Usa interfaces/abstract para extensión

#### Liskov Substitution Principle
- [ ] Las implementaciones respetan el contrato
- [ ] Sin sorpresas en las subclases

#### Interface Segregation Principle
- [ ] Interfaces pequeñas y focalizadas
- [ ] Sin interfaces "cajón de sastre"

#### Dependency Inversion Principle
- [ ] Depende de abstracciones (interfaces)
- [ ] Sin dependencias concretas

### 5.5 Documentación

- [ ] PHPDoc completo en métodos públicos
- [ ] README.md actualizado (si API pública)
- [ ] CHANGELOG.md actualizado
- [ ] ADR si decisión arquitectural importante

**Ejemplo PHPDoc:**
```php
/**
 * Calcula el precio total de una reserva
 *
 * Aplica las reglas de negocio:
 * - Precio base × número de participantes
 * - Suplemento single (+30%) si solo 1 participante
 * - Opciones de pago
 *
 * @param Reservation $reservation Reserva a calcular
 * @return Money Monto total TTC
 *
 * @throws ReservationInvalideException Si reserva sin participantes
 */
public function calculate(Reservation $reservation): Money
{
    // ...
}
```

### 5.6 Seguridad & RGPD

**Si hay datos personales:**
- [ ] Cifrado en BD (`doctrine-encrypt-bundle`)
- [ ] Validación estricta de inputs
- [ ] Sin datos sensibles en logs
- [ ] Consentimiento RGPD
- [ ] Duración de conservación definida

**Si exposición API:**
- [ ] Authentication/Authorization
- [ ] Rate limiting
- [ ] Input validation
- [ ] Output sanitization
- [ ] CORS configurado

---

## Fase 6: Pull Request

### ✅ Crear una PR de calidad

```bash
# Push de la rama
git push origin feature/supplement-single

# Crear la PR (vía GitHub/GitLab)
```

**Template de PR:**
```markdown
## Descripción

Añade un suplemento del 30% sobre el precio total de las reservas
con un solo participante (habitación single).

## Motivación

Alineación con la política tarifaria de los hoteles asociados.

## Cambios

- ✅ `PrixCalculatorService`: Cálculo del suplemento
- ✅ `Reservation::calculerMontantTotal()`: Usa el servicio
- ✅ `SupplementRate` Value Object: Encapsulación de la tasa
- ✅ Templates emails: Visualización del detalle

## Tests

- ✅ 8 tests unitarios (100% coverage)
- ✅ 3 tests de integración
- ✅ 2 escenarios Behat

**Coverage:** 85% (+5%)

## Checklist

- [x] Tests pasan
- [x] PHPStan nivel 8 OK
- [x] Código formateado (PSR-12)
- [x] Documentación actualizada
- [x] Sin breaking changes
- [x] Migración BD: N/A
- [x] RGPD: N/A

## Screenshots

[Capturas de pantalla si UI]

## Closes

Closes #42
```

**Checklist PR:**
- [ ] Título claro y conciso
- [ ] Descripción completa
- [ ] Enlace al ticket/issue
- [ ] Screenshots si UI
- [ ] Tests pasan en CI/CD
- [ ] Reviewers asignados
- [ ] Labels apropiados

---

## Ejemplo completo: Feature "Opciones de pago"

### Paso 1: Análisis (30 min)

```markdown
# Análisis: Opciones de pago en reservas

## Objetivo
Permitir añadir opciones de pago (seguro, suplemento equipaje)
en las reservas.

## Criterios de aceptación
- [ ] Añadir opciones vía formulario
- [ ] Precio total incluye las opciones
- [ ] Email de confirmación lista las opciones
- [ ] Admin puede gestionar las opciones disponibles

## Archivos impactados
Nuevos:
- src/Entity/OptionReservation.php
- src/Form/OptionType.php
- tests/Unit/Entity/OptionReservationTest.php

Modificados:
- src/Entity/Reservation.php (relación OneToMany)
- src/Service/PrixCalculatorService.php (cálculo con opciones)
- templates/reservation/index.html.twig (formulario)

## Migración BD
```sql
CREATE TABLE option_reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    prix_ttc_cents INT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE
);
```

## Tests TDD
1. it_adds_option_to_reservation()
2. it_calculates_total_with_options()
3. it_removes_option_from_reservation()
```

### Paso 2: TDD RED (1h)

```bash
# Tests unitarios
vim tests/Unit/Entity/ReservationTest.php

# Tests integración
vim tests/Integration/Service/ReservationServiceTest.php

# Tests Behat
vim features/reservation_options.feature

# Ejecutar (deben fallar)
make test
# ❌ 12 tests failed (ESPERADO)

# Commit
git commit -m "test(reservation): añade tests opciones de pago (RED)"
```

### Paso 3: TDD GREEN (2h)

```bash
# Migración
docker compose exec php bin/console make:migration
vim migrations/Version20YYMMDDHHMMSS.php
docker compose exec php bin/console doctrine:migrations:migrate

# Entidad
vim src/Entity/OptionReservation.php

# Relación
vim src/Entity/Reservation.php

# Servicio
vim src/Service/PrixCalculatorService.php

# Ejecutar (deben pasar)
make test
# ✅ 12/12 tests passed

# Commit
git commit -m "feat(reservation): implementa opciones de pago (GREEN)"
```

### Paso 4: TDD REFACTOR (1h)

```bash
# Extraer Value Object
vim src/ValueObject/OptionPrice.php

# Inyección de dependencias
vim src/Service/PrixCalculatorService.php

# Ejecutar (deben seguir pasando)
make test
# ✅ 12/12 tests passed

# Commit
git commit -m "refactor(reservation): mejora gestión opciones (REFACTOR)"
```

### Paso 5: Validación (30 min)

```bash
# Calidad
make quality
# ✅ PHPStan + CS-Fixer OK

# Coverage
make test-coverage
# ✅ 88%

# Pre-commit checklist
make pre-commit
# ✅ Todo OK
```

### Paso 6: PR

```bash
git push origin feature/options-payantes
# Crear PR en GitHub/GitLab
```

---

## Tiempos estimados por tamaño de feature

| Tamaño | Análisis | TDD RED | TDD GREEN | REFACTOR | Validación | Total |
|--------|---------|---------|-----------|----------|------------|-------|
| **Pequeña** (1 archivo) | 15 min | 30 min | 1h | 30 min | 15 min | **2h30** |
| **Mediana** (3-5 archivos) | 30 min | 1h | 2h | 1h | 30 min | **5h** |
| **Grande** (10+ archivos) | 1h | 2h | 4h | 2h | 1h | **10h** |

---

## Checklist final

- [ ] Fase 1: Análisis documentado y validado
- [ ] Fase 2: Tests escritos (RED)
- [ ] Fase 3: Implementación mínima (GREEN)
- [ ] Fase 4: Refactoring SOLID (REFACTOR)
- [ ] Fase 5: Validación completa (calidad + tests)
- [ ] Fase 6: PR creada y revisada

**Si todas las casillas están marcadas → MERGE!**
