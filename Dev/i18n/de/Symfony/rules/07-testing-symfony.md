# Testing TDD & BDD - Atoll Tourisme

## Überblick

Die **TDD-Entwicklung (Test-Driven Development)** ist für das gesamte Projekt Atoll Tourisme **OBLIGATORISCH**. Der Zyklus RED → GREEN → REFACTOR muss strikt eingehalten werden.

**Ziele:**
- ✅ Codeabdeckung: **mindestens 80 %**
- ✅ Mutation Score (Infection): **mindestens 80 %**
- ✅ Tests vor Implementierung (striktes TDD)
- ✅ BDD mit Behat für fachliche Szenarien

> **Referenzen:**
> - `06-docker-hadolint.md` - Docker-Befehle für Tests
> - `08-quality-tools.md` - Qualitätswerkzeuge (PHPUnit, Infection)
> - `04-solid-principles.md` - Testbarer Code

---

## Inhaltsverzeichnis

1. [TDD - Test-Driven Development](#tdd---test-driven-development)
2. [Teststruktur](#teststruktur)
3. [PHPUnit-Konfiguration](#phpunit-konfiguration)
4. [Unit-Tests](#unit-tests)
5. [Integrationstests](#integrationstests)
6. [Funktionale Tests](#funktionale-tests)
7. [BDD mit Behat](#bdd-mit-behat)
8. [Mutation Testing mit Infection](#mutation-testing-mit-infection)
9. [Validierungs-Checkliste](#validierungs-checkliste)

---

## TDD - Test-Driven Development

### Obligatorischer TDD-Zyklus

```
┌─────────────────────────────────────────┐
│  1. RED: Test schreiben der fehlschlägt │
│     - Unit-Test                         │
│     - Funktionaler Test                 │
│     - Behat-Spezifikation               │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  2. GREEN: Minimaler Code zum Bestehen  │
│     - Minimale Implementierung          │
│     - Keine Optimierung                 │
│     - Nur Test zum Laufen bringen       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. REFACTOR: Code verbessern           │
│     - Duplikation beseitigen            │
│     - SOLID anwenden                    │
│     - Tests bleiben grün                │
└─────────────┬───────────────────────────┘
              │
              └──────┐
                     │ Wiederholen
                     ▼
```

### Strikte TDD-Regeln

1. **Niemals Produktionscode ohne vorher fehlschlagenden Test**
2. **Unit-Tests für Geschäftslogik (Domain)**
3. **Integrationstests für Repositories (Infrastructure)**
4. **Funktionale Tests für Use Cases (Application)**
5. **BDD/Behat für fachliche Benutzerszenarien**

### Beispiel TDD: Money Value Object

#### 1. RED - Fehlschlagender Test

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
        // Given (RED - Die Klasse existiert noch nicht)
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
# Ausführung (RED)
make test

# ❌ Erwartete Ausgabe:
# Error: Class "App\Domain\Reservation\ValueObject\Money" not found
```

#### 2. GREEN - Minimale Implementierung

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ GREEN: Minimaler Code zum Bestehen der Tests
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
# Ausführung (GREEN)
make test

# ✅ Erwartete Ausgabe:
# OK (3 tests, 5 assertions)
```

#### 3. REFACTOR - Verbesserung

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ REFACTOR: Nützliche Methoden hinzufügen, Klarstellung
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
# Tests bleiben grün nach Refactoring
make test

# ✅ OK (3 tests, 5 assertions)
```

---

## Teststruktur

```
tests/
├── Unit/                               # Unit-Tests (reine Logik)
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
├── Integration/                        # Integrationstests (DB, Repositories)
│   ├── Infrastructure/
│   │   ├── Persistence/
│   │   │   └── Doctrine/
│   │   │       └── Repository/
│   │   │           └── DoctrineReservationRepositoryTest.php
│   │   └── Notification/
│   │       └── EmailNotificationServiceTest.php
│   │
├── Functional/                         # Funktionale Tests (Use Cases, HTTP)
│   ├── Application/
│   │   └── Reservation/
│   │       └── UseCase/
│   │           ├── CreateReservationUseCaseTest.php
│   │           └── ConfirmReservationUseCaseTest.php
│   ├── Controller/
│   │   └── ReservationControllerTest.php
│   │
├── Behat/                             # BDD-Tests (Geschäftsszenarien)
│   ├── bootstrap.php
│   └── Context/
│       ├── ReservationContext.php
│       └── SejourContext.php
│
├── Fixtures/                          # Testdaten
│   ├── ReservationFixtures.php
│   └── SejourFixtures.php
│
└── bootstrap.php
```

---

## PHPUnit-Konfiguration

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
        <!-- Unit-Tests: Reine Logik, keine Abhängigkeiten -->
        <testsuite name="unit">
            <directory>tests/Unit</directory>
        </testsuite>

        <!-- Integrationstests: Repositories, technische Services -->
        <testsuite name="integration">
            <directory>tests/Integration</directory>
        </testsuite>

        <!-- Funktionale Tests: Use Cases, Controller -->
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

### Testbefehle

```bash
# Alle Tests
make test

# Nur Unit-Tests
make test-unit

# Integrationstests
make test-integration

# Funktionale Tests
make test-functional

# Mit Coverage
make test-coverage

# Generierte HTML-Datei unter: var/coverage/html/index.html
```

---

## Unit-Tests

### Eigenschaften

- ✅ **Schnell** (< 100 ms pro Test)
- ✅ **Isoliert** (keine Datenbank, kein Netzwerk)
- ✅ **Deterministisch** (immer dasselbe Ergebnis)
- ✅ **Unabhängig** (zufällige Ausführungsreihenfolge)

### Beispiel: ReservationTest

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

    // Hilfsmethoden
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

## Integrationstests

### Eigenschaften

- ✅ Echte Datenbank (PostgreSQL im Test)
- ✅ Transaktionen werden nach jedem Test zurückgerollt
- ✅ Fixtures für Testdaten
- ✅ Tests der Doctrine-Repositories

### Beispiel: DoctrineReservationRepositoryTest

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

        // Entity Manager leeren, um frisches Laden aus der DB sicherzustellen
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

## Funktionale Tests

### Eigenschaften

- ✅ Vollständige Tests der Use Cases
- ✅ Simulieren das Benutzerverhalten
- ✅ Überprüfen gesendete E-Mails
- ✅ Testen HTTP-Controller

### Beispiel: CreateReservationUseCaseTest

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
        self::assertEmailHtmlBodyContains($email, 'Confirmation de réservation');
    }
}
```

---

## BDD mit Behat

### Konfiguration behat.yml

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

### Feature: Reservierung erstellen

```gherkin
# features/reservation/create_reservation.feature

Feature: Créer une réservation
    En tant que client
    Je veux réserver un séjour
    Afin de participer aux activités

    Background:
        Given les séjours suivants existent:
            | id          | titre                  | prix  | date_debut | date_fin   |
            | sejour-ski  | Séjour ski Alpes       | 500€  | 2025-02-01 | 2025-02-07 |
            | sejour-surf | Séjour surf Biarritz   | 450€  | 2025-03-15 | 2025-03-22 |

    Scenario: Créer une réservation avec 2 participants
        When je crée une réservation pour le séjour "sejour-ski" avec:
            | nom           | age |
            | Jean Dupont   | 30  |
            | Marie Dupont  | 28  |
        Then la réservation est créée
        And le montant total est de "1000€"
        And je reçois un email de confirmation

    Scenario: Appliquer une remise famille nombreuse
        When je crée une réservation pour le séjour "sejour-ski" avec:
            | nom             | age |
            | Parent 1        | 35  |
            | Parent 2        | 33  |
            | Enfant 1        | 10  |
            | Enfant 2        | 8   |
        Then la réservation est créée
        And une remise de "10%" est appliquée
        And le montant total est de "1350€"
        # Basis: (500 + 500 + 250 + 250) = 1500
        # Rabatt 10 %: 1500 * 0.9 = 1350

    Scenario: Refuser une réservation sans participant
        When je crée une réservation pour le séjour "sejour-ski" sans participant
        Then je reçois une erreur "At least one participant required"
```

### Behat-Kontext

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
     * @Given les séjours suivants existent:
     */
    public function lesSejursSuivantsExistent(TableNode $table): void
    {
        // Fixtures erstellen
        foreach ($table->getHash() as $row) {
            // Sejour-Fixtures erstellen...
        }
    }

    /**
     * @When je crée une réservation pour le séjour :sejourId avec:
     */
    public function jeCreeuneReservationPourLeSejourAvec(string $sejourId, TableNode $table): void
    {
        $participants = [];

        foreach ($table->getHash() as $row) {
            $participants[] = [
                'nom' => $row['nom'],
                'age' => (int) $row['age'],
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
     * @Then la réservation est créée
     */
    public function laReservationEstCreee(): void
    {
        if ($this->exception) {
            throw $this->exception;
        }

        if (!$this->reservationId) {
            throw new \RuntimeException('No reservation created');
        }
    }

    /**
     * @Then le montant total est de :montant
     */
    public function leMontantTotalEstDe(string $montant): void
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

### Behat ausführen

```bash
# Alle Szenarien
make behat

# Spezifisches Szenario
make behat ARGS="--name='Créer une réservation avec 2 participants'"

# Erwartete Ausgabe:
# Feature: Créer une réservation
#   Scenario: Créer une réservation avec 2 participants
#     ✓ When je crée une réservation...
#     ✓ Then la réservation est créée
#     ✓ And le montant total est de "1000€"
#
# 1 scenario (1 passed)
# 3 steps (3 passed)
```

---

## Mutations-Testing mit Infection

### Konfiguration infection.json5

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

### Infection ausführen

```bash
# Mutations-Testing
make infection

# Erwartete Ausgabe:
# Infection - PHP Mutation Testing Framework
#
# Running mutation tests...
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

### Beispiele für Mutationen

```php
// Originalcode
if ($amount > 0) {
    return true;
}

// Mutation 1: Operator verändert
if ($amount >= 0) {  // ❌ Muss durch einen Test getötet werden
    return true;
}

// Mutation 2: Bedingung umgekehrt
if ($amount < 0) {   // ❌ Muss durch einen Test getötet werden
    return true;
}

// Mutation 3: Rückgabewert verändert
if ($amount > 0) {
    return false;    // ❌ Muss durch einen Test getötet werden
}
```

**Wenn eine Mutation überlebt = fehlender oder schwacher Test!**

---

## Validierungs-Checkliste

### Vor jedem Commit

- [ ] **TDD:** Tests VOR der Implementierung geschrieben
- [ ] **RED:** Test schlägt anfangs fehl
- [ ] **GREEN:** Minimale Implementierung lässt den Test bestehen
- [ ] **REFACTOR:** Code verbessert, Tests bleiben grün
- [ ] **Coverage:** `make test-coverage` → mindestens 80 %
- [ ] **Mutation:** `make infection` → MSI mindestens 80 %
- [ ] **BDD:** Behat-Szenarien für fachliche Funktionalitäten
- [ ] **Fast:** Unit-Tests < 100 ms pro Test
- [ ] **Isolated:** Tests unabhängig (zufällige Reihenfolge OK)

### Zielmetriken

| Metrik | Ziel | Minimum |
|--------|------|---------|
| Code-Coverage | 85 % | 80 % |
| Mutation Score (MSI) | 85 % | 80 % |
| Covered Code MSI | 95 % | 90 % |
| Unit-Tests | < 100 ms | < 200 ms |
| Integrationstests | < 1 s | < 2 s |
| Funktionale Tests | < 5 s | < 10 s |

### Validierungsbefehle

```bash
# Vollständige Pipeline
make test              # Alle Tests
make test-coverage     # Mit Coverage
make infection         # Mutations-Testing
make behat             # BDD-Tests

# CI-Validierung
make ci
```

---

## Ressourcen

- **Buch:** *Test-Driven Development by Example* - Kent Beck
- **Buch:** *Growing Object-Oriented Software, Guided by Tests* - Steve Freeman
- **PHPUnit:** [Dokumentation](https://phpunit.de/documentation.html)
- **Behat:** [Dokumentation](https://docs.behat.org/)
- **Infection:** [Dokumentation](https://infection.github.io/)

---

**Datum der letzten Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
