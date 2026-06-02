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
3. [Configuración PHPUnit](#configuración-phpunit)
4. [Tests unitarios](#tests-unitarios)
5. [Tests de integración](#tests-de-integración)
6. [Tests funcionales](#tests-funcionales)
7. [BDD con Behat](#bdd-con-behat)
8. [Mutation Testing con Infection](#mutation-testing-con-infection)
9. [Checklist de validación](#checklist-de-validación)

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

### Ejemplo TDD: Money Value Object

#### 1. RED - Test que falla

```php
<?php

namespace App\Tests\Unit\Domain\Reservation\ValueObject;

use App\Domain\Reservation\ValueObject\Money;
use PHPUnit\Framework\TestCase;

final class MoneyTest extends TestCase
{
    /**
     * @test
     */
    public function it_creates_money_from_euros(): void
    {
        // Given (RED - La clase aún no existe)
        $amount = 100.50;

        // When
        $money = Money::fromEuros($amount);

        // Then
        self::assertEquals(10050, $money->getAmountCents());
        self::assertEquals(100.50, $money->getAmountEuros());
    }

    /**
     * @test
     */
    public function it_adds_two_money_amounts(): void
    {
        // Given
        $money1 = Money::fromEuros(100);
        $money2 = Money::fromEuros(50);

        // When
        $result = $money1->add($money2);

        // Then
        self::assertEquals(150.00, $result->getAmountEuros());
    }

    /**
     * @test
     */
    public function it_throws_exception_for_negative_amount(): void
    {
        // Expect
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Amount cannot be negative');

        // When
        Money::fromEuros(-10);
    }
}
```

```bash
# Ejecución (RED)
make test

# ❌ Salida esperada:
# Error: Class "App\Domain\Reservation\ValueObject\Money" not found
```

#### 2. GREEN - Implementación mínima

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ GREEN: Código mínimo para pasar los tests
final readonly class Money
{
    private function __construct(
        private int $amountCents,
    ) {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }
    }

    public static function fromEuros(float $amount): self
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        return new self((int) round($amount * 100));
    }

    public function add(self $other): self
    {
        return new self($this->amountCents + $other->amountCents);
    }

    public function getAmountCents(): int
    {
        return $this->amountCents;
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }
}
```

```bash
# Ejecución (GREEN)
make test

# ✅ Salida esperada:
# OK (3 tests, 5 assertions)
```

#### 3. REFACTOR - Mejora

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ REFACTOR: Adición de métodos útiles, clarificación
final readonly class Money
{
    private const string DEFAULT_CURRENCY = 'EUR';

    private function __construct(
        private int $amountCents,
        private string $currency = self::DEFAULT_CURRENCY,
    ) {
        $this->validateAmount($amountCents);
        $this->validateCurrency($currency);
    }

    public static function fromEuros(float $amount): self
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        return new self((int) round($amount * 100));
    }

    public static function zero(): self
    {
        return new self(0);
    }

    public function add(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amountCents + $other->amountCents, $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amountCents - $other->amountCents, $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        return new self((int) round($this->amountCents * $multiplier), $this->currency);
    }

    public function isPositive(): bool
    {
        return $this->amountCents > 0;
    }

    public function equals(self $other): bool
    {
        return $this->amountCents === $other->amountCents
            && $this->currency === $other->currency;
    }

    public function getAmountCents(): int
    {
        return $this->amountCents;
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }

    private function validateAmount(int $amountCents): void
    {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }
    }

    private function validateCurrency(string $currency): void
    {
        if (empty($currency)) {
            throw new \InvalidArgumentException('Currency cannot be empty');
        }
    }

    private function ensureSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException(
                sprintf('Currency mismatch: %s vs %s', $this->currency, $other->currency)
            );
        }
    }
}
```

```bash
# Tests siempre en verde después del refactor
make test

# ✅ OK (3 tests, 5 assertions)
```

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
├── Integration/                        # Tests de integración (BD, repositories)
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

### phpunit.xml.dist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true"
         executionOrder="random"
         beStrictAboutCoverageMetadata="true"
         beStrictAboutOutputDuringTests="true"
         failOnRisky="true"
         failOnWarning="true">

    <php>
        <ini name="display_errors" value="1"/>
        <ini name="error_reporting" value="-1"/>
        <server name="APP_ENV" value="test" force="true"/>
        <server name="SHELL_VERBOSITY" value="-1"/>
        <server name="SYMFONY_PHPUNIT_REMOVE" value=""/>
        <server name="SYMFONY_PHPUNIT_VERSION" value="10.5"/>
    </php>

    <testsuites>
        <!-- Tests unitarios: Lógica pura, sin dependencias -->
        <testsuite name="unit">
            <directory>tests/Unit</directory>
        </testsuite>

        <!-- Tests de integración: Repositories, servicios técnicos -->
        <testsuite name="integration">
            <directory>tests/Integration</directory>
        </testsuite>

        <!-- Tests funcionales: Use cases, controllers -->
        <testsuite name="functional">
            <directory>tests/Functional</directory>
        </testsuite>
    </testsuites>

    <source>
        <include>
            <directory suffix=".php">src</directory>
        </include>
        <exclude>
            <directory>src/DataFixtures</directory>
            <file>src/Kernel.php</file>
        </exclude>
    </source>

    <coverage pathCoverage="false"
              includeUncoveredFiles="true"
              processUncoveredFiles="true"
              ignoreDeprecatedCodeUnits="true"
              disableCodeCoverageIgnore="false">
        <report>
            <html outputDirectory="var/coverage/html"/>
            <text outputFile="php://stdout" showUncoveredFiles="false"/>
        </report>
    </coverage>
</phpunit>
```

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

### Ejemplo: ReservationTest

```php
<?php

namespace App\Tests\Unit\Domain\Reservation\Entity;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Entity\Participant;
use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationStatus;
use App\Domain\Shared\ValueObject\Email;
use PHPUnit\Framework\TestCase;

final class ReservationTest extends TestCase
{
    /**
     * @test
     */
    public function it_creates_a_reservation(): void
    {
        // Given
        $id = ReservationId::generate();
        $email = Email::fromString('client@example.com');
        $montant = Money::fromEuros(500);

        // When
        $reservation = Reservation::create($id, $email, $montant);

        // Then
        self::assertEquals($id, $reservation->getId());
        self::assertEquals($email, $reservation->getClientEmail());
        self::assertEquals($montant, $reservation->getMontantTotal());
        self::assertEquals(ReservationStatus::EN_ATTENTE, $reservation->getStatut());
    }

    /**
     * @test
     */
    public function it_adds_a_participant(): void
    {
        // Given
        $reservation = $this->createReservation();
        $participant = $this->createParticipant('Jean Dupont', 30);

        // When
        $reservation->addParticipant($participant);

        // Then
        self::assertCount(1, $reservation->getParticipants());
        self::assertContains($participant, $reservation->getParticipants());
    }

    /**
     * @test
     */
    public function it_cannot_add_more_than_10_participants(): void
    {
        // Given
        $reservation = $this->createReservation();

        for ($i = 0; $i < 10; $i++) {
            $reservation->addParticipant($this->createParticipant("Participant $i", 25));
        }

        // Expect
        $this->expectException(InvalidReservationException::class);
        $this->expectExceptionMessage('Maximum 10 participants');

        // When
        $reservation->addParticipant($this->createParticipant('Participant 11', 25));
    }

    /**
     * @test
     */
    public function it_confirms_a_reservation(): void
    {
        // Given
        $reservation = $this->createReservation();
        $reservation->addParticipant($this->createParticipant('Jean', 30));

        // When
        $reservation->confirmer();

        // Then
        self::assertEquals(ReservationStatus::CONFIRMEE, $reservation->getStatut());
    }

    /**
     * @test
     */
    public function it_cannot_confirm_without_participants(): void
    {
        // Given
        $reservation = $this->createReservation();

        // Expect
        $this->expectException(InvalidReservationException::class);
        $this->expectExceptionMessage('At least one participant required');

        // When
        $reservation->confirmer();
    }

    /**
     * @test
     */
    public function it_cannot_confirm_a_cancelled_reservation(): void
    {
        // Given
        $reservation = $this->createReservation();
        $reservation->addParticipant($this->createParticipant('Jean', 30));
        $reservation->annuler('Client request');

        // Expect
        $this->expectException(InvalidReservationException::class);
        $this->expectExceptionMessage('Cannot confirm cancelled reservation');

        // When
        $reservation->confirmer();
    }

    /**
     * @test
     */
    public function it_cancels_a_reservation(): void
    {
        // Given
        $reservation = $this->createReservation();
        $raison = 'Client changed plans';

        // When
        $reservation->annuler($raison);

        // Then
        self::assertEquals(ReservationStatus::ANNULEE, $reservation->getStatut());
    }

    /**
     * @test
     */
    public function it_records_domain_events(): void
    {
        // Given
        $reservation = $this->createReservation();
        $reservation->addParticipant($this->createParticipant('Jean', 30));

        // When
        $reservation->confirmer();

        // Then
        $events = $reservation->pullDomainEvents();
        self::assertCount(1, $events);
        self::assertInstanceOf(ReservationConfirmedEvent::class, $events[0]);
    }

    // Métodos helper
    private function createReservation(): Reservation
    {
        return Reservation::create(
            ReservationId::generate(),
            Email::fromString('test@example.com'),
            Money::fromEuros(500)
        );
    }

    private function createParticipant(string $nom, int $age): Participant
    {
        return Participant::create(
            ParticipantId::generate(),
            PersonName::fromString($nom),
            $age
        );
    }
}
```

---

## Tests de integración

### Características

- ✅ Base de datos real (PostgreSQL en test)
- ✅ Transacciones rollback después de cada test
- ✅ Fixtures para datos de test
- ✅ Tests de repositories Doctrine

### Ejemplo: DoctrineReservationRepositoryTest

```php
<?php

namespace App\Tests\Integration\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\ReservationId;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineReservationRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class DoctrineReservationRepositoryTest extends KernelTestCase
{
    private DoctrineReservationRepository $repository;

    protected function setUp(): void
    {
        self::bootKernel();

        $this->repository = self::getContainer()->get(DoctrineReservationRepository::class);
    }

    /**
     * @test
     */
    public function it_saves_and_finds_a_reservation(): void
    {
        // Given
        $reservation = $this->createReservation();

        // When
        $this->repository->save($reservation);

        // Limpiar el entity manager para asegurar una carga fresca desde la BD
        self::getContainer()->get('doctrine')->getManager()->clear();

        $found = $this->repository->findById($reservation->getId());

        // Then
        self::assertNotNull($found);
        self::assertEquals($reservation->getId(), $found->getId());
        self::assertEquals($reservation->getClientEmail(), $found->getClientEmail());
    }

    /**
     * @test
     */
    public function it_throws_exception_when_reservation_not_found(): void
    {
        // Given
        $nonExistentId = ReservationId::generate();

        // Expect
        $this->expectException(ReservationNotFoundException::class);

        // When
        $this->repository->findById($nonExistentId);
    }

    /**
     * @test
     */
    public function it_deletes_a_reservation(): void
    {
        // Given
        $reservation = $this->createReservation();
        $this->repository->save($reservation);

        // When
        $this->repository->delete($reservation);

        // Then
        $this->expectException(ReservationNotFoundException::class);
        $this->repository->findById($reservation->getId());
    }

    private function createReservation(): Reservation
    {
        return Reservation::create(
            ReservationId::generate(),
            Email::fromString('integration@test.com'),
            Money::fromEuros(750)
        );
    }
}
```

---

## Tests funcionales

### Características

- ✅ Tests completos de use cases
- ✅ Simulan comportamiento de usuario
- ✅ Verifican emails enviados
- ✅ Testean controllers HTTP

### Ejemplo: CreateReservationUseCaseTest

```php
<?php

namespace App\Tests\Functional\Application\Reservation\UseCase;

use App\Application\Reservation\UseCase\CreateReservation\CreateReservationCommand;
use App\Application\Reservation\UseCase\CreateReservation\CreateReservationUseCase;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class CreateReservationUseCaseTest extends KernelTestCase
{
    private CreateReservationUseCase $useCase;
    private ReservationRepositoryInterface $repository;

    protected function setUp(): void
    {
        self::bootKernel();

        $this->useCase = self::getContainer()->get(CreateReservationUseCase::class);
        $this->repository = self::getContainer()->get(ReservationRepositoryInterface::class);
    }

    /**
     * @test
     */
    public function it_creates_a_reservation(): void
    {
        // Given
        $command = new CreateReservationCommand(
            sejourId: 'sejour-123',
            clientEmail: 'client@example.com',
            participants: [
                ['nom' => 'Jean Dupont', 'age' => 30],
                ['nom' => 'Marie Dupont', 'age' => 28],
            ]
        );

        // When
        $reservationId = $this->useCase->execute($command);

        // Then
        $reservation = $this->repository->findById($reservationId);
        self::assertNotNull($reservation);
        self::assertCount(2, $reservation->getParticipants());
        self::assertTrue($reservation->getMontantTotal()->isPositive());
    }

    /**
     * @test
     */
    public function it_sends_confirmation_email(): void
    {
        // Given
        $command = new CreateReservationCommand(
            sejourId: 'sejour-123',
            clientEmail: 'client@example.com',
            participants: [['nom' => 'Jean', 'age' => 30]]
        );

        // When
        $this->useCase->execute($command);

        // Then
        self::assertEmailCount(1);

        $email = self::getMailerMessage();
        self::assertEmailAddressContains($email, 'to', 'client@example.com');
        self::assertEmailHtmlBodyContains($email, 'Confirmación de reserva');
    }
}
```

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

### Context Behat

```php
<?php

namespace App\Tests\Behat\Context;

use App\Application\Reservation\UseCase\CreateReservation\CreateReservationCommand;
use App\Application\Reservation\UseCase\CreateReservation\CreateReservationUseCase;
use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;
use Symfony\Component\HttpKernel\KernelInterface;

final class ReservationContext implements Context
{
    private ?string $reservationId = null;
    private ?\Throwable $exception = null;

    public function __construct(
        private readonly KernelInterface $kernel,
    ) {}

    /**
     * @Given las siguientes estancias existen:
     */
    public function lasSiguientesEstanciasExisten(TableNode $table): void
    {
        // Creación de fixtures
        foreach ($table->getHash() as $row) {
            // Crear fixtures de Sejour...
        }
    }

    /**
     * @When creo una reserva para la estancia :sejourId con:
     */
    public function creoUnaReservaParaLaEstanciaConParticipantes(string $sejourId, TableNode $table): void
    {
        $participants = [];

        foreach ($table->getHash() as $row) {
            $participants[] = [
                'nom' => $row['nombre'],
                'age' => (int) $row['edad'],
            ];
        }

        $command = new CreateReservationCommand(
            sejourId: $sejourId,
            clientEmail: 'behat@test.com',
            participants: $participants
        );

        try {
            $useCase = $this->kernel->getContainer()->get(CreateReservationUseCase::class);
            $this->reservationId = (string) $useCase->execute($command);
        } catch (\Throwable $e) {
            $this->exception = $e;
        }
    }

    /**
     * @Then la reserva está creada
     */
    public function laReservaEstaCreada(): void
    {
        if ($this->exception) {
            throw $this->exception;
        }

        if (!$this->reservationId) {
            throw new \RuntimeException('No reservation created');
        }
    }

    /**
     * @Then el monto total es de :montant
     */
    public function elMontoTotalEsDe(string $montant): void
    {
        $repository = $this->kernel->getContainer()->get(ReservationRepositoryInterface::class);
        $reservation = $repository->findById(ReservationId::fromString($this->reservationId));

        $expectedAmount = (float) str_replace('€', '', $montant);
        $actualAmount = $reservation->getMontantTotal()->getAmountEuros();

        if ($actualAmount !== $expectedAmount) {
            throw new \RuntimeException(
                sprintf('Expected %s€, got %s€', $expectedAmount, $actualAmount)
            );
        }
    }
}
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

### Ejemplos de mutaciones

```php
// Código original
if ($amount > 0) {
    return true;
}

// Mutación 1: Operador cambiado
if ($amount >= 0) {  // ❌ Debe ser eliminada por un test
    return true;
}

// Mutación 2: Condición invertida
if ($amount < 0) {   // ❌ Debe ser eliminada por un test
    return true;
}

// Mutación 3: Valor de retorno cambiado
if ($amount > 0) {
    return false;    // ❌ Debe ser eliminada por un test
}
```

**¡Si una mutación sobrevive = test faltante o débil!**

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
