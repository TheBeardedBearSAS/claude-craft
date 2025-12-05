# Template: Test Unitaire (PHPUnit)

> **Pattern TDD** - Tests unitaires pour valider la logique métier en isolation
> Reference: `.claude/rules/04-testing-tdd.md`

## Qu'est-ce qu'un test unitaire ?

Un test unitaire:
- ✅ **Teste une unité isolée** (classe, méthode)
- ✅ **Rapide** (< 10ms par test)
- ✅ **Pas de dépendances externes** (BDD, filesystem, HTTP)
- ✅ **Utilise des mocks** pour les dépendances
- ✅ **Pattern AAA** (Arrange, Act, Assert)

---

## Template PHPUnit 10+

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\[Namespace];

use App\[Namespace]\[ClassToTest];
use App\[Namespace]\[Dependency];
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Tests unitaires: [ClassToTest]
 *
 * Ce qui est testé:
 * - [Comportement 1]
 * - [Comportement 2]
 * - [Cas limites]
 *
 * @covers \App\[Namespace]\[ClassToTest]
 */
class [ClassToTest]Test extends TestCase
{
    private [ClassToTest] $sut; // System Under Test
    private [Dependency]|MockObject $dependencyMock;

    /**
     * Setup exécuté avant chaque test
     */
    protected function setUp(): void
    {
        // Créer les mocks
        $this->dependencyMock = $this->createMock([Dependency]::class);

        // Créer le SUT (System Under Test)
        $this->sut = new [ClassToTest]($this->dependencyMock);
    }

    /**
     * Cleanup après chaque test (optionnel)
     */
    protected function tearDown(): void
    {
        // Libérer les ressources si nécessaire
    }

    /**
     * @test
     * Convention de nommage: it_[comportement_attendu]_when_[condition]
     */
    public function it_[comportement]_when_[condition](): void
    {
        // ========================================
        // ARRANGE - Préparation des données
        // ========================================
        $input = 'valeur de test';

        // Configuration du mock
        $this->dependencyMock
            ->expects($this->once())
            ->method('someMethod')
            ->with($input)
            ->willReturn('mocked result');

        // ========================================
        // ACT - Exécution de l'action
        // ========================================
        $result = $this->sut->methodToTest($input);

        // ========================================
        // ASSERT - Vérification du résultat
        // ========================================
        $this->assertEquals('expected result', $result);
    }

    /**
     * @test
     * @dataProvider invalidDataProvider
     */
    public function it_throws_exception_when_invalid_data($invalidData, string $expectedMessage): void
    {
        // ASSERT
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage($expectedMessage);

        // ACT
        $this->sut->methodToTest($invalidData);
    }

    /**
     * Data Provider pour tests paramétrés
     *
     * @return array<string, array{0: mixed, 1: string}>
     */
    public static function invalidDataProvider(): array
    {
        return [
            'empty string' => ['', 'Cannot be empty'],
            'null value' => [null, 'Cannot be null'],
            'negative number' => [-5, 'Must be positive'],
        ];
    }
}
```

---

## Example 1: Test d'un Value Object (Money)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Domain\ValueObject;

use App\Domain\ValueObject\Money;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires: Money Value Object
 *
 * @covers \App\Domain\ValueObject\Money
 */
class MoneyTest extends TestCase
{
    /** @test */
    public function it_creates_money_from_euros(): void
    {
        // ACT
        $money = Money::fromEuros(1299.99);

        // ASSERT
        $this->assertEquals(129999, $money->toCents());
        $this->assertEquals(1299.99, $money->toEuros());
    }

    /** @test */
    public function it_creates_money_from_cents(): void
    {
        // ACT
        $money = Money::fromCents(129999);

        // ASSERT
        $this->assertEquals(1299.99, $money->toEuros());
    }

    /** @test */
    public function it_formats_to_string_with_currency(): void
    {
        // ARRANGE
        $money = Money::fromEuros(1299.99);

        // ACT
        $formatted = $money->toString();

        // ASSERT
        $this->assertEquals('1 299,99 €', $formatted);
    }

    /** @test */
    public function it_adds_two_amounts(): void
    {
        // ARRANGE
        $sejourPrice = Money::fromEuros(1299.99);
        $assurancePrice = Money::fromEuros(50.00);

        // ACT
        $total = $sejourPrice->add($assurancePrice);

        // ASSERT
        $this->assertEquals(1349.99, $total->toEuros());
        $this->assertEquals(134999, $total->toCents());
    }

    /** @test */
    public function it_subtracts_two_amounts(): void
    {
        // ARRANGE
        $total = Money::fromEuros(1299.99);
        $reduction = Money::fromEuros(100.00);

        // ACT
        $final = $total->subtract($reduction);

        // ASSERT
        $this->assertEquals(1199.99, $final->toEuros());
    }

    /** @test */
    public function it_multiplies_by_factor(): void
    {
        // ARRANGE
        $basePrice = Money::fromEuros(1000.00);

        // ACT
        $withTax = $basePrice->multiply(1.20); // +20% TVA

        // ASSERT
        $this->assertEquals(1200.00, $withTax->toEuros());
    }

    /** @test */
    public function it_compares_two_amounts(): void
    {
        // ARRANGE
        $price1 = Money::fromEuros(1299.99);
        $price2 = Money::fromEuros(999.99);

        // ASSERT
        $this->assertTrue($price1->isGreaterThan($price2));
        $this->assertFalse($price2->isGreaterThan($price1));
    }

    /** @test */
    public function it_checks_equality(): void
    {
        // ARRANGE
        $money1 = Money::fromEuros(1299.99);
        $money2 = Money::fromCents(129999);
        $money3 = Money::fromEuros(999.99);

        // ASSERT
        $this->assertTrue($money1->equals($money2));
        $this->assertFalse($money1->equals($money3));
    }

    /** @test */
    public function it_detects_zero_amount(): void
    {
        // ARRANGE
        $zero = Money::zero();
        $nonZero = Money::fromEuros(10.00);

        // ASSERT
        $this->assertTrue($zero->isZero());
        $this->assertFalse($nonZero->isZero());
    }

    /** @test */
    public function it_throws_exception_for_negative_amount(): void
    {
        // ASSERT
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Le montant ne peut pas être négatif');

        // ACT
        Money::fromCents(-100);
    }

    /** @test */
    public function it_throws_exception_for_amount_exceeding_limit(): void
    {
        // ASSERT
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Le montant dépasse la limite');

        // ACT
        Money::fromCents(100000000); // > 999 999,99 EUR
    }

    /**
     * @test
     * @dataProvider validAmountsProvider
     */
    public function it_creates_money_with_valid_amounts(float $euros, int $expectedCents): void
    {
        // ACT
        $money = Money::fromEuros($euros);

        // ASSERT
        $this->assertEquals($expectedCents, $money->toCents());
    }

    /**
     * @return array<string, array{0: float, 1: int}>
     */
    public static function validAmountsProvider(): array
    {
        return [
            'zero' => [0.00, 0],
            'small amount' => [9.99, 999],
            'round number' => [100.00, 10000],
            'typical sejour price' => [1299.99, 129999],
            'max amount' => [999999.99, 99999999],
        ];
    }
}
```

---

## Example 2: Test d'un Service (avec mocks)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\Service;

use App\Application\Service\ReservationService;
use App\Domain\Entity\Reservation;
use App\Domain\Entity\Sejour;
use App\Domain\Entity\Participant;
use App\Domain\Repository\ReservationRepositoryInterface;
use App\Domain\Repository\SejourRepositoryInterface;
use App\Domain\Exception\SejourCompletException;
use App\Application\Mailer\ReservationMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Tests unitaires: ReservationService
 *
 * @covers \App\Application\Service\ReservationService
 */
class ReservationServiceTest extends TestCase
{
    private ReservationService $service;
    private ReservationRepositoryInterface|MockObject $reservationRepositoryMock;
    private SejourRepositoryInterface|MockObject $sejourRepositoryMock;
    private ReservationMailer|MockObject $mailerMock;
    private EntityManagerInterface|MockObject $entityManagerMock;
    private LoggerInterface|MockObject $loggerMock;

    protected function setUp(): void
    {
        // Créer tous les mocks
        $this->reservationRepositoryMock = $this->createMock(ReservationRepositoryInterface::class);
        $this->sejourRepositoryMock = $this->createMock(SejourRepositoryInterface::class);
        $this->mailerMock = $this->createMock(ReservationMailer::class);
        $this->entityManagerMock = $this->createMock(EntityManagerInterface::class);
        $this->loggerMock = $this->createMock(LoggerInterface::class);

        // Créer le service avec les mocks
        $this->service = new ReservationService(
            $this->reservationRepositoryMock,
            $this->sejourRepositoryMock,
            $this->mailerMock,
            $this->entityManagerMock,
            $this->loggerMock
        );
    }

    /** @test */
    public function it_creates_reservation_successfully(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe', 10);
        $data = [
            'sejour_id' => 1,
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
            ],
        ];

        // Configuration des mocks
        $this->sejourRepositoryMock
            ->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($sejour);

        $this->entityManagerMock
            ->expects($this->once())
            ->method('beginTransaction');

        $this->entityManagerMock
            ->expects($this->once())
            ->method('commit');

        $this->reservationRepositoryMock
            ->expects($this->once())
            ->method('save')
            ->with($this->isInstanceOf(Reservation::class), true);

        $this->mailerMock
            ->expects($this->exactly(2))
            ->method('sendConfirmationClient')
            ->willReturnCallback(function (Reservation $reservation) {
                $this->assertEquals('client@example.com', $reservation->getEmailContact());
            });

        $this->loggerMock
            ->expects($this->once())
            ->method('info')
            ->with(
                'Réservation créée avec succès',
                $this->arrayHasKey('reservation_id')
            );

        // ACT
        $reservation = $this->service->createReservation($data);

        // ASSERT
        $this->assertInstanceOf(Reservation::class, $reservation);
        $this->assertEquals('en_attente', $reservation->getStatut());
        $this->assertCount(1, $reservation->getParticipants());
    }

    /** @test */
    public function it_throws_exception_when_sejour_not_found(): void
    {
        // ARRANGE
        $data = [
            'sejour_id' => 999,
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [],
        ];

        $this->sejourRepositoryMock
            ->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        // ASSERT
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Séjour non trouvé');

        // ACT
        $this->service->createReservation($data);
    }

    /** @test */
    public function it_throws_exception_when_sejour_full(): void
    {
        // ARRANGE
        $sejourComplet = $this->createSejour('Martinique', 10);
        $sejourComplet->setPlacesRestantes(0); // Complet !

        $data = [
            'sejour_id' => 1,
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
            ],
        ];

        $this->sejourRepositoryMock
            ->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($sejourComplet);

        // ASSERT
        $this->expectException(SejourCompletException::class);

        // ACT
        $this->service->createReservation($data);
    }

    /** @test */
    public function it_rollbacks_transaction_on_error(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe', 10);
        $data = [
            'sejour_id' => 1,
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
            ],
        ];

        $this->sejourRepositoryMock
            ->method('find')
            ->willReturn($sejour);

        $this->entityManagerMock
            ->expects($this->once())
            ->method('beginTransaction');

        // Simuler une erreur lors de la sauvegarde
        $this->reservationRepositoryMock
            ->method('save')
            ->willThrowException(new \RuntimeException('Database error'));

        $this->entityManagerMock
            ->expects($this->once())
            ->method('rollback');

        $this->loggerMock
            ->expects($this->once())
            ->method('error')
            ->with('Erreur création réservation', $this->anything());

        // ASSERT
        $this->expectException(\RuntimeException::class);

        // ACT
        $this->service->createReservation($data);
    }

    /**
     * @test
     * @dataProvider invalidParticipantDataProvider
     */
    public function it_throws_exception_for_invalid_participant_data(array $participantData, string $expectedMessage): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe', 10);
        $data = [
            'sejour_id' => 1,
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [$participantData],
        ];

        $this->sejourRepositoryMock
            ->method('find')
            ->willReturn($sejour);

        // ASSERT
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage($expectedMessage);

        // ACT
        $this->service->createReservation($data);
    }

    /**
     * @return array<string, array{0: array<string, mixed>, 1: string}>
     */
    public static function invalidParticipantDataProvider(): array
    {
        return [
            'empty nom' => [
                ['nom' => '', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
                'Nom et prénom obligatoires',
            ],
            'empty prenom' => [
                ['nom' => 'Dupont', 'prenom' => '', 'date_naissance' => '1990-01-15'],
                'Nom et prénom obligatoires',
            ],
            'underage participant' => [
                ['nom' => 'Dupont', 'prenom' => 'Enfant', 'date_naissance' => '2020-01-15'],
                'Participant doit être majeur',
            ],
        ];
    }

    // ========================================
    // HELPERS
    // ========================================

    private function createSejour(string $destination, int $capacite): Sejour
    {
        $sejour = new Sejour();
        $sejour->setDestination($destination);
        $sejour->setCapacite($capacite);
        $sejour->setPlacesRestantes($capacite);
        $sejour->setPrixTtc(Money::fromEuros(1299.99));

        return $sejour;
    }
}
```

---

## Assertions courantes PHPUnit

```php
// Égalité
$this->assertEquals($expected, $actual);
$this->assertSame($expected, $actual); // Strict (===)
$this->assertNotEquals($expected, $actual);

// Types
$this->assertIsString($value);
$this->assertIsInt($value);
$this->assertIsBool($value);
$this->assertIsArray($value);
$this->assertInstanceOf(ClassName::class, $object);

// Null/Empty
$this->assertNull($value);
$this->assertNotNull($value);
$this->assertEmpty($array);
$this->assertNotEmpty($array);

// Booléens
$this->assertTrue($condition);
$this->assertFalse($condition);

// Strings
$this->assertStringContainsString('needle', $haystack);
$this->assertStringStartsWith('prefix', $string);
$this->assertStringEndsWith('suffix', $string);
$this->assertMatchesRegularExpression('/pattern/', $string);

// Arrays
$this->assertCount(3, $array);
$this->assertContains('value', $array);
$this->assertArrayHasKey('key', $array);
$this->assertArrayNotHasKey('key', $array);

// Exceptions
$this->expectException(ExceptionClass::class);
$this->expectExceptionMessage('Expected message');
$this->expectExceptionCode(500);

// Floats (avec delta)
$this->assertEqualsWithDelta(1.5, 1.51, 0.1);

// Objects
$this->assertObjectHasProperty('property', $object);
```

---

## Mocking avec PHPUnit

```php
// Créer un mock
$mock = $this->createMock(MyInterface::class);

// Stub (retour de valeur)
$mock->method('getValue')->willReturn(42);

// Expectation (vérification d'appel)
$mock->expects($this->once())
     ->method('save')
     ->with($this->equalTo($expectedArg))
     ->willReturn(true);

// Multiples retours
$mock->method('getNext')
     ->willReturnOnConsecutiveCalls(1, 2, 3);

// Exception
$mock->method('process')
     ->willThrowException(new \RuntimeException('Error'));

// Callback
$mock->method('calculate')
     ->willReturnCallback(fn($x) => $x * 2);

// Matchers
$this->once()           // Appelé exactement 1 fois
$this->never()          // Jamais appelé
$this->exactly(3)       // Appelé exactement 3 fois
$this->atLeastOnce()    // Au moins 1 fois
$this->any()            // N'importe combien de fois
```

---

## Bonnes pratiques

### ✅ DO

```php
// Nom de test expressif
public function it_confirms_reservation_when_payment_received(): void

// Pattern AAA clair
public function it_calculates_total_price(): void
{
    // ARRANGE
    $reservation = new Reservation(...);

    // ACT
    $total = $reservation->getMontantTotal();

    // ASSERT
    $this->assertEquals(1299.99, $total->toEuros());
}

// Un seul concept par test
public function it_adds_participant(): void { /* ... */ }
public function it_throws_exception_when_sejour_full(): void { /* ... */ }
```

### ❌ DON'T

```php
// Nom vague
public function test1(): void

// Trop de responsabilités
public function testEverything(): void
{
    // Test de 50 lignes qui vérifie 10 choses différentes
}

// Dépendances réelles (ce n'est plus unitaire)
public function testWithRealDatabase(): void
{
    $em = new EntityManager(...); // ❌ Vrai EntityManager
}
```

---

## Checklist Test Unitaire

- [ ] Pattern AAA (Arrange, Act, Assert)
- [ ] Nom expressif `it_[comportement]_when_[condition]`
- [ ] Une seule responsabilité par test
- [ ] Mocks pour toutes les dépendances
- [ ] Assertions claires et précises
- [ ] Data providers pour tests paramétrés
- [ ] Coverage > 80% du code testé
- [ ] Rapide (< 100ms pour tous les tests unitaires)
- [ ] Indépendant (pas d'ordre d'exécution)
- [ ] Documentation PHPDoc si logique complexe
