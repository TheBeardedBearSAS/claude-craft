# Plantilla: Test Unitario (PHPUnit)

> **Patrón TDD** - Tests unitarios para validar la lógica de negocio en aislamiento
> Referencia: `.claude/rules/04-testing-tdd.md`

## ¿Qué es un test unitario?

Un test unitario:
- ✅ **Prueba una unidad aislada** (clase, método)
- ✅ **Rápido** (< 10ms por test)
- ✅ **Sin dependencias externas** (BD, filesystem, HTTP)
- ✅ **Usa mocks** para las dependencias
- ✅ **Patrón AAA** (Arrange, Act, Assert)

---

## Plantilla PHPUnit 10+

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\[Namespace];

use App\[Namespace]\[ClassToTest];
use App\[Namespace]\[Dependency];
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Tests unitarios: [ClassToTest]
 *
 * Lo que se prueba:
 * - [Comportamiento 1]
 * - [Comportamiento 2]
 * - [Casos límite]
 *
 * @covers \App\[Namespace]\[ClassToTest]
 */
class [ClassToTest]Test extends TestCase
{
    private [ClassToTest] $sut; // System Under Test
    private [Dependency]|MockObject $dependencyMock;

    /**
     * Setup ejecutado antes de cada test
     */
    protected function setUp(): void
    {
        // Crear los mocks
        $this->dependencyMock = $this->createMock([Dependency]::class);

        // Crear el SUT (System Under Test)
        $this->sut = new [ClassToTest]($this->dependencyMock);
    }

    /**
     * Cleanup después de cada test (opcional)
     */
    protected function tearDown(): void
    {
        // Liberar recursos si es necesario
    }

    /**
     * @test
     * Convención de nombres: it_[comportamiento_esperado]_when_[condicion]
     */
    public function it_[comportamiento]_when_[condicion](): void
    {
        // ========================================
        // ARRANGE - Preparación de datos
        // ========================================
        $input = 'valor de prueba';

        // Configuración del mock
        $this->dependencyMock
            ->expects($this->once())
            ->method('someMethod')
            ->with($input)
            ->willReturn('resultado mockeado');

        // ========================================
        // ACT - Ejecución de la acción
        // ========================================
        $result = $this->sut->methodToTest($input);

        // ========================================
        // ASSERT - Verificación del resultado
        // ========================================
        $this->assertEquals('resultado esperado', $result);
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
     * Data Provider para tests parametrizados
     *
     * @return array<string, array{0: mixed, 1: string}>
     */
    public static function invalidDataProvider(): array
    {
        return [
            'cadena vacía' => ['', 'No puede estar vacío'],
            'valor nulo' => [null, 'No puede ser nulo'],
            'número negativo' => [-5, 'Debe ser positivo'],
        ];
    }
}
```

---

## Ejemplo 1: Test de un Value Object (Money)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Domain\ValueObject;

use App\Domain\ValueObject\Money;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitarios: Money Value Object
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
        $withTax = $basePrice->multiply(1.20); // +20% IVA

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
            'cero' => [0.00, 0],
            'cantidad pequeña' => [9.99, 999],
            'número redondo' => [100.00, 10000],
            'precio típico de estancia' => [1299.99, 129999],
            'cantidad máxima' => [999999.99, 99999999],
        ];
    }
}
```

---

## Ejemplo 2: Test de un Servicio (con mocks)

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
 * Tests unitarios: ReservationService
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
        // Crear todos los mocks
        $this->reservationRepositoryMock = $this->createMock(ReservationRepositoryInterface::class);
        $this->sejourRepositoryMock = $this->createMock(SejourRepositoryInterface::class);
        $this->mailerMock = $this->createMock(ReservationMailer::class);
        $this->entityManagerMock = $this->createMock(EntityManagerInterface::class);
        $this->loggerMock = $this->createMock(LoggerInterface::class);

        // Crear el servicio con los mocks
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
        $sejour = $this->createSejour('Guadalupe', 10);
        $data = [
            'sejour_id' => 1,
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
            ],
        ];

        // Configuración de los mocks
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
        $sejourComplet = $this->createSejour('Martinica', 10);
        $sejourComplet->setPlacesRestantes(0); // ¡Completo!

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
        $sejour = $this->createSejour('Guadalupe', 10);
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

        // Simular un error durante la guardada
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
        $sejour = $this->createSejour('Guadalupe', 10);
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
            'apellido vacío' => [
                ['nom' => '', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
                'Nom et prénom obligatoires',
            ],
            'nombre vacío' => [
                ['nom' => 'Dupont', 'prenom' => '', 'date_naissance' => '1990-01-15'],
                'Nom et prénom obligatoires',
            ],
            'participante menor de edad' => [
                ['nom' => 'Dupont', 'prenom' => 'Niño', 'date_naissance' => '2020-01-15'],
                'Participant doit être majeur',
            ],
        ];
    }

    // ========================================
    // HELPERS
    // ========================================

    private function createSejour(string $destino, int $capacidad): Sejour
    {
        $sejour = new Sejour();
        $sejour->setDestination($destino);
        $sejour->setCapacite($capacidad);
        $sejour->setPlacesRestantes($capacidad);
        $sejour->setPrixTtc(Money::fromEuros(1299.99));

        return $sejour;
    }
}
```

---

## Aserciones comunes PHPUnit

```php
// Igualdad
$this->assertEquals($expected, $actual);
$this->assertSame($expected, $actual); // Estricto (===)
$this->assertNotEquals($expected, $actual);

// Tipos
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

// Booleanos
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

// Excepciones
$this->expectException(ExceptionClass::class);
$this->expectExceptionMessage('Expected message');
$this->expectExceptionCode(500);

// Floats (con delta)
$this->assertEqualsWithDelta(1.5, 1.51, 0.1);

// Objetos
$this->assertObjectHasProperty('property', $object);
```

---

## Mocking con PHPUnit

```php
// Crear un mock
$mock = $this->createMock(MyInterface::class);

// Stub (retorno de valor)
$mock->method('getValue')->willReturn(42);

// Expectativa (verificación de llamada)
$mock->expects($this->once())
     ->method('save')
     ->with($this->equalTo($expectedArg))
     ->willReturn(true);

// Múltiples retornos
$mock->method('getNext')
     ->willReturnOnConsecutiveCalls(1, 2, 3);

// Excepción
$mock->method('process')
     ->willThrowException(new \RuntimeException('Error'));

// Callback
$mock->method('calculate')
     ->willReturnCallback(fn($x) => $x * 2);

// Matchers
$this->once()           // Llamado exactamente 1 vez
$this->never()          // Nunca llamado
$this->exactly(3)       // Llamado exactamente 3 veces
$this->atLeastOnce()    // Al menos 1 vez
$this->any()            // Cualquier número de veces
```

---

## Buenas prácticas

### ✅ SÍ

```php
// Nombre de test expresivo
public function it_confirms_reservation_when_payment_received(): void

// Patrón AAA claro
public function it_calculates_total_price(): void
{
    // ARRANGE
    $reservation = new Reservation(...);

    // ACT
    $total = $reservation->getMontantTotal();

    // ASSERT
    $this->assertEquals(1299.99, $total->toEuros());
}

// Un solo concepto por test
public function it_adds_participant(): void { /* ... */ }
public function it_throws_exception_when_sejour_full(): void { /* ... */ }
```

### ❌ NO

```php
// Nombre vago
public function test1(): void

// Demasiadas responsabilidades
public function testEverything(): void
{
    // Test de 50 líneas que verifica 10 cosas diferentes
}

// Dependencias reales (ya no es unitario)
public function testWithRealDatabase(): void
{
    $em = new EntityManager(...); // ❌ EntityManager real
}
```

---

## Checklist Test Unitario

- [ ] Patrón AAA (Arrange, Act, Assert)
- [ ] Nombre expresivo `it_[comportamiento]_when_[condicion]`
- [ ] Una sola responsabilidad por test
- [ ] Mocks para todas las dependencias
- [ ] Aserciones claras y precisas
- [ ] Data providers para tests parametrizados
- [ ] Cobertura > 80% del código probado
- [ ] Rápido (< 100ms para todos los tests unitarios)
- [ ] Independiente (sin orden de ejecución)
- [ ] Documentación PHPDoc si la lógica es compleja
