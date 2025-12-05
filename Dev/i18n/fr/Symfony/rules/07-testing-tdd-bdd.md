# Testing TDD & BDD - Atoll Tourisme

## Vue d'ensemble

Le développement **TDD (Test-Driven Development)** est **OBLIGATOIRE** pour tout le projet Atoll Tourisme. Le cycle RED → GREEN → REFACTOR doit être strictement respecté.

**Objectifs:**
- ✅ Couverture de code: **80% minimum**
- ✅ Mutation Score (Infection): **80% minimum**
- ✅ Tests avant implémentation (TDD strict)
- ✅ BDD avec Behat pour les scénarios métier

> **Références:**
> - `06-docker-hadolint.md` - Commandes Docker pour tests
> - `08-quality-tools.md` - Outils qualité (PHPUnit, Infection)
> - `04-solid-principles.md` - Code testable

---

## Table des matières

1. [TDD - Test-Driven Development](#tdd---test-driven-development)
2. [Structure des tests](#structure-des-tests)
3. [PHPUnit configuration](#phpunit-configuration)
4. [Tests unitaires](#tests-unitaires)
5. [Tests d'intégration](#tests-dintégration)
6. [Tests fonctionnels](#tests-fonctionnels)
7. [BDD avec Behat](#bdd-avec-behat)
8. [Mutation Testing avec Infection](#mutation-testing-avec-infection)
9. [Checklist de validation](#checklist-de-validation)

---

## TDD - Test-Driven Development

### Cycle TDD obligatoire

```
┌─────────────────────────────────────────┐
│  1. RED: Écrire un test qui échoue      │
│     - Test unitaire                     │
│     - Test fonctionnel                  │
│     - Spécification Behat               │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  2. GREEN: Code minimal pour passer     │
│     - Implémentation minimale           │
│     - Pas d'optimisation                │
│     - Juste faire passer le test        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. REFACTOR: Améliorer le code         │
│     - Éliminer duplication              │
│     - Appliquer SOLID                   │
│     - Tests toujours verts              │
└─────────────┬───────────────────────────┘
              │
              └──────┐
                     │ Recommencer
                     ▼
```

### Règles TDD strictes

1. **Jamais de code de production sans test qui échoue d'abord**
2. **Tests unitaires pour la logique métier (Domain)**
3. **Tests d'intégration pour les repositories (Infrastructure)**
4. **Tests fonctionnels pour les use cases (Application)**
5. **BDD/Behat pour les scénarios métier utilisateur**

### Exemple TDD: Money Value Object

#### 1. RED - Test qui échoue

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
        // Given (RED - La classe n'existe pas encore)
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
# Exécution (RED)
make test

# ❌ Output attendu:
# Error: Class "App\Domain\Reservation\ValueObject\Money" not found
```

#### 2. GREEN - Implémentation minimale

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ GREEN: Code minimal pour faire passer les tests
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
# Exécution (GREEN)
make test

# ✅ Output attendu:
# OK (3 tests, 5 assertions)
```

#### 3. REFACTOR - Amélioration

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ REFACTOR: Ajout de méthodes utiles, clarification
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
# Tests toujours verts après refactor
make test

# ✅ OK (3 tests, 5 assertions)
```

---

## Structure des tests

```
tests/
├── Unit/                               # Tests unitaires (logique pure)
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
├── Integration/                        # Tests d'intégration (BDD, repositories)
│   ├── Infrastructure/
│   │   ├── Persistence/
│   │   │   └── Doctrine/
│   │   │       └── Repository/
│   │   │           └── DoctrineReservationRepositoryTest.php
│   │   └── Notification/
│   │       └── EmailNotificationServiceTest.php
│   │
├── Functional/                         # Tests fonctionnels (use cases, HTTP)
│   ├── Application/
│   │   └── Reservation/
│   │       └── UseCase/
│   │           ├── CreateReservationUseCaseTest.php
│   │           └── ConfirmReservationUseCaseTest.php
│   ├── Controller/
│   │   └── ReservationControllerTest.php
│   │
├── Behat/                             # Tests BDD (scénarios métier)
│   ├── bootstrap.php
│   └── Context/
│       ├── ReservationContext.php
│       └── SejourContext.php
│
├── Fixtures/                          # Données de test
│   ├── ReservationFixtures.php
│   └── SejourFixtures.php
│
└── bootstrap.php
```

---

## PHPUnit configuration

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
        <!-- Tests unitaires: Logique pure, pas de dépendances -->
        <testsuite name="unit">
            <directory>tests/Unit</directory>
        </testsuite>

        <!-- Tests d'intégration: Repositories, services techniques -->
        <testsuite name="integration">
            <directory>tests/Integration</directory>
        </testsuite>

        <!-- Tests fonctionnels: Use cases, controllers -->
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

### Commandes de test

```bash
# Tous les tests
make test

# Tests unitaires uniquement
make test-unit

# Tests d'intégration
make test-integration

# Tests fonctionnels
make test-functional

# Avec coverage
make test-coverage

# Fichier HTML généré dans: var/coverage/html/index.html
```

---

## Tests unitaires

### Caractéristiques

- ✅ **Rapides** (< 100ms par test)
- ✅ **Isolés** (pas de base de données, pas de réseau)
- ✅ **Déterministes** (toujours le même résultat)
- ✅ **Indépendants** (ordre d'exécution aléatoire)

### Exemple: ReservationTest

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

    // Helper methods
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

## Tests d'intégration

### Caractéristiques

- ✅ Base de données réelle (PostgreSQL en test)
- ✅ Transactions rollback après chaque test
- ✅ Fixtures pour données de test
- ✅ Tests des repositories Doctrine

### Exemple: DoctrineReservationRepositoryTest

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

        // Clear entity manager to ensure fresh load from DB
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

## Tests fonctionnels

### Caractéristiques

- ✅ Tests complets use cases
- ✅ Simulent le comportement utilisateur
- ✅ Vérifient les emails envoyés
- ✅ Testent les controllers HTTP

### Exemple: CreateReservationUseCaseTest

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

## BDD avec Behat

### Configuration behat.yml

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

### Feature: Création de réservation

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
        # Base: (500 + 500 + 250 + 250) = 1500
        # Remise 10%: 1500 * 0.9 = 1350

    Scenario: Refuser une réservation sans participant
        When je crée une réservation pour le séjour "sejour-ski" sans participant
        Then je reçois une erreur "At least one participant required"
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
     * @Given les séjours suivants existent:
     */
    public function lesSejursSuivantsExistent(TableNode $table): void
    {
        // Création des fixtures
        foreach ($table->getHash() as $row) {
            // Create Sejour fixtures...
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

### Exécution Behat

```bash
# Tous les scénarios
make behat

# Scénario spécifique
make behat ARGS="--name='Créer une réservation avec 2 participants'"

# Output attendu:
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

## Mutation Testing avec Infection

### Configuration infection.json5

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

### Exécution Infection

```bash
# Mutation testing
make infection

# Output attendu:
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

### Exemples de mutations

```php
// Code original
if ($amount > 0) {
    return true;
}

// Mutation 1: Opérateur changé
if ($amount >= 0) {  // ❌ Doit être tué par un test
    return true;
}

// Mutation 2: Condition inversée
if ($amount < 0) {   // ❌ Doit être tué par un test
    return true;
}

// Mutation 3: Return value changé
if ($amount > 0) {
    return false;    // ❌ Doit être tué par un test
}
```

**Si une mutation survit = test manquant ou faible!**

---

## Checklist de validation

### Avant chaque commit

- [ ] **TDD:** Tests écrits AVANT l'implémentation
- [ ] **RED:** Test échoue initialement
- [ ] **GREEN:** Implémentation minimale fait passer le test
- [ ] **REFACTOR:** Code amélioré, tests toujours verts
- [ ] **Couverture:** `make test-coverage` → 80% minimum
- [ ] **Mutation:** `make infection` → MSI 80% minimum
- [ ] **BDD:** Scénarios Behat pour les fonctionnalités métier
- [ ] **Fast:** Tests unitaires < 100ms chacun
- [ ] **Isolated:** Tests indépendants (ordre aléatoire OK)

### Métriques cibles

| Métrique | Cible | Minimum |
|----------|-------|---------|
| Code Coverage | 85% | 80% |
| Mutation Score (MSI) | 85% | 80% |
| Covered Code MSI | 95% | 90% |
| Tests unitaires | < 100ms | < 200ms |
| Tests intégration | < 1s | < 2s |
| Tests fonctionnels | < 5s | < 10s |

### Commandes de validation

```bash
# Pipeline complète
make test              # Tous les tests
make test-coverage     # Avec coverage
make infection         # Mutation testing
make behat             # Tests BDD

# Validation CI
make ci
```

---

## Ressources

- **Livre:** *Test-Driven Development by Example* - Kent Beck
- **Livre:** *Growing Object-Oriented Software, Guided by Tests* - Steve Freeman
- **PHPUnit:** [Documentation](https://phpunit.de/documentation.html)
- **Behat:** [Documentation](https://docs.behat.org/)
- **Infection:** [Documentation](https://infection.github.io/)

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
