# Template: Aggregate Root (DDD)

> **DDD-Pattern** - Zentrale Entität, die ein Aggregate verwaltet und Invarianten sichert
> Referenz: `.claude/rules/13-ddd-patterns.md`

## Charakteristiken eines Aggregate Root

- ✅ **Einziger Einstiegspunkt** für Änderungen am Aggregate
- ✅ **Sichert Geschäftsinvarianten**
- ✅ **Registriert Domain Events**
- ✅ **Verwaltet Kind-Entitäten**
- ✅ **Globale Identität** (UUID)
- ✅ **Transaktionale Grenze**

---

## Template PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\Domain\[BoundedContext]\Entity;

use App\Domain\[BoundedContext]\Event\[Entity]CreatedEvent;
use App\Domain\[BoundedContext]\Event\[Entity]UpdatedEvent;
use App\Domain\[BoundedContext]\Exception\[Entity]Exception;
use App\Domain\[BoundedContext]\ValueObject\[Entity]Id;
use App\Domain\Shared\Interface\AggregateRootInterface;
use App\Domain\Shared\Interface\DomainEventInterface;

/**
 * Aggregate Root: [Entity]
 *
 * Verantwortlichkeiten:
 * - [Verantwortlichkeit 1]
 * - [Verantwortlichkeit 2]
 * - Geschäftsinvarianten aufrechterhalten
 * - Domain Events registrieren
 *
 * Invarianten:
 * - [Invariante 1]
 * - [Invariante 2]
 */
final class [Entity] implements AggregateRootInterface
{
    private [Entity]Id $id;

    /** @var array<ChildEntity> */
    private array $childEntities = [];

    /** @var array<DomainEventInterface> */
    private array $domainEvents = [];

    private \DateTimeImmutable $createdAt;
    private \DateTimeImmutable $updatedAt;

    /**
     * Privater Konstruktor: Verwenden Sie Factory-Methoden
     */
    private function __construct(
        [Entity]Id $id,
        // Weitere Eigenschaften...
    ) {
        $this->id = $id;
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Factory-Methode: Neue [Entity] erstellen
     */
    public static function create([Entity]Id $id, /* Weitere Parameter */): self
    {
        // Validierung...
        $entity = new self($id);

        // Domain Event registrieren
        $entity->recordEvent(new [Entity]CreatedEvent($id, new \DateTimeImmutable()));

        return $entity;
    }

    /**
     * Geschäftsmethode: [Beschreibung]
     *
     * @throws [Entity]Exception
     */
    public function [businessMethod](/* Parameter */): void
    {
        // ✅ INVARIANTE prüfen
        $this->ensureInvariant();

        // Änderung durchführen
        // ...

        // Zeitstempel aktualisieren
        $this->updatedAt = new \DateTimeImmutable();

        // Event registrieren
        $this->recordEvent(new [Entity]UpdatedEvent($this->id, new \DateTimeImmutable()));
    }

    /**
     * Kind-Entität hinzufügen
     */
    public function addChild(ChildEntity $child): void
    {
        // Validierung...
        $child->assignToParent($this);

        $this->childEntities[] = $child;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Kind-Entität entfernen
     */
    public function removeChild(ChildEntityId $childId): void
    {
        // Suchen und entfernen...
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Geschäftsinvariante sichern
     *
     * @throws [Entity]Exception
     */
    private function ensureInvariant(): void
    {
        if (/* Invariante verletzt */) {
            throw new [Entity]Exception('Invariant violation: [beschreibung]');
        }
    }

    // ========================================
    // Domain Events Management
    // ========================================

    private function recordEvent(DomainEventInterface $event): void
    {
        $this->domainEvents[] = $event;
    }

    /**
     * Domain Events abrufen und leeren (für Dispatch)
     *
     * @return array<DomainEventInterface>
     */
    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];

        return $events;
    }

    // ========================================
    // Getters (keine Setters!)
    // ========================================

    public function getId(): [Entity]Id
    {
        return $this->id;
    }

    /**
     * @return array<ChildEntity>
     */
    public function getChildren(): array
    {
        return $this->childEntities;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
```

---

## Beispiel: Sejour (Aggregate Root)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Entity;

use App\Domain\Catalog\Event\SejourCreatedEvent;
use App\Domain\Catalog\Event\SejourPublishedEvent;
use App\Domain\Catalog\Exception\InvalidSejourException;
use App\Domain\Catalog\Exception\SejourFullException;
use App\Domain\Catalog\ValueObject\DateRange;
use App\Domain\Catalog\ValueObject\SejourId;
use App\Domain\Catalog\ValueObject\SejourStatus;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Shared\Interface\AggregateRootInterface;
use App\Domain\Shared\Interface\DomainEventInterface;

/**
 * Aggregate Root: Sejour (Reise)
 *
 * Verantwortlichkeiten:
 * - Verfügbarkeit verwalten (Plätze)
 * - Veröffentlichung validieren
 * - Reservierungen verhindern, wenn voll
 * - Preise anpassen
 *
 * Invarianten:
 * - Verfügbare Plätze >= 0
 * - Verfügbare Plätze <= Gesamtkapazität
 * - Veröffentlichtes Sejour hat gültige Daten (Zeitraum, Preis)
 * - Zeitraum Start < Ende
 */
final class Sejour implements AggregateRootInterface
{
    private SejourId $id;
    private string $destination;
    private string $description;
    private DateRange $period;
    private Money $pricePerPerson;
    private int $capacity;
    private int $availablePlaces;
    private SejourStatus $status;
    private ?string $imageUrl;

    /** @var array<DomainEventInterface> */
    private array $domainEvents = [];

    private \DateTimeImmutable $createdAt;
    private \DateTimeImmutable $updatedAt;

    private function __construct(
        SejourId $id,
        string $destination,
        DateRange $period,
        Money $pricePerPerson,
        int $capacity
    ) {
        $this->id = $id;
        $this->destination = $destination;
        $this->description = '';
        $this->period = $period;
        $this->pricePerPerson = $pricePerPerson;
        $this->capacity = $capacity;
        $this->availablePlaces = $capacity;
        $this->status = SejourStatus::DRAFT;
        $this->imageUrl = null;
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Neuen Sejour erstellen (im ENTWURF-Status)
     */
    public static function create(
        SejourId $id,
        string $destination,
        DateRange $period,
        Money $pricePerPerson,
        int $capacity
    ): self {
        if (empty($destination)) {
            throw new InvalidSejourException('Destination cannot be empty');
        }

        if ($capacity <= 0) {
            throw new InvalidSejourException('Capacity must be positive');
        }

        if (!$pricePerPerson->isPositive()) {
            throw new InvalidSejourException('Price must be positive');
        }

        $sejour = new self($id, $destination, $period, $pricePerPerson, $capacity);

        $sejour->recordEvent(new SejourCreatedEvent(
            $id,
            $destination,
            new \DateTimeImmutable()
        ));

        return $sejour;
    }

    /**
     * Sejour veröffentlichen (für Buchung verfügbar machen)
     *
     * @throws InvalidSejourException
     */
    public function publish(): void
    {
        // ✅ INVARIANTE: Gültige Daten erforderlich
        if (empty($this->description)) {
            throw new InvalidSejourException('Description required to publish');
        }

        if (!$this->period->isInFuture()) {
            throw new InvalidSejourException('Cannot publish sejour in the past');
        }

        if (!$this->pricePerPerson->isPositive()) {
            throw new InvalidSejourException('Price must be positive');
        }

        // Status ändern
        $this->status = SejourStatus::PUBLISHED;
        $this->updatedAt = new \DateTimeImmutable();

        // Event registrieren
        $this->recordEvent(new SejourPublishedEvent(
            $this->id,
            $this->period->getStart(),
            new \DateTimeImmutable()
        ));
    }

    /**
     * Sejour archivieren (vorbei oder storniert)
     */
    public function archive(): void
    {
        $this->status = SejourStatus::ARCHIVED;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Plätze reservieren
     *
     * @throws SejourFullException
     * @throws InvalidSejourException
     */
    public function reservePlaces(int $numberOfPlaces): void
    {
        // ✅ INVARIANTE: Muss veröffentlicht sein
        if (!$this->status->isPublished()) {
            throw new InvalidSejourException('Cannot reserve places on unpublished sejour');
        }

        // ✅ INVARIANTE: Genug verfügbare Plätze
        if ($this->availablePlaces < $numberOfPlaces) {
            throw SejourFullException::notEnoughPlaces(
                $this->id,
                $numberOfPlaces,
                $this->availablePlaces
            );
        }

        // ✅ INVARIANTE: Positive Anzahl
        if ($numberOfPlaces <= 0) {
            throw new InvalidSejourException('Number of places must be positive');
        }

        // Plätze reservieren
        $this->availablePlaces -= $numberOfPlaces;

        // ✅ INVARIANTE sichern: availablePlaces >= 0
        $this->ensurePlacesInvariant();

        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Plätze freigeben (Stornierung)
     */
    public function releasePlaces(int $numberOfPlaces): void
    {
        if ($numberOfPlaces <= 0) {
            throw new InvalidSejourException('Number of places must be positive');
        }

        $this->availablePlaces += $numberOfPlaces;

        // ✅ INVARIANTE sichern: availablePlaces <= capacity
        $this->ensurePlacesInvariant();

        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Beschreibung aktualisieren
     */
    public function updateDescription(string $description): void
    {
        if (empty($description)) {
            throw new InvalidSejourException('Description cannot be empty');
        }

        $this->description = $description;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Preis aktualisieren
     */
    public function updatePrice(Money $newPrice): void
    {
        if (!$newPrice->isPositive()) {
            throw new InvalidSejourException('Price must be positive');
        }

        // Veröffentlichte Sejourse können Preisänderungen verhindern (Business-Regel)
        if ($this->status->isPublished() && $this->hasReservations()) {
            throw new InvalidSejourException('Cannot change price with existing reservations');
        }

        $this->pricePerPerson = $newPrice;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Bild festlegen
     */
    public function setImage(?string $imageUrl): void
    {
        $this->imageUrl = $imageUrl;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Prüfen ob voll
     */
    public function isFull(): bool
    {
        return $this->availablePlaces === 0;
    }

    /**
     * Prüfen ob genug Plätze verfügbar sind
     */
    public function hasEnoughPlaces(int $requestedPlaces): bool
    {
        return $this->availablePlaces >= $requestedPlaces;
    }

    /**
     * Prüfen ob Reservierungen existieren
     */
    private function hasReservations(): bool
    {
        return $this->availablePlaces < $this->capacity;
    }

    /**
     * Invariante sichern: 0 <= verfügbare Plätze <= Kapazität
     */
    private function ensurePlacesInvariant(): void
    {
        if ($this->availablePlaces < 0) {
            throw new InvalidSejourException(
                sprintf('Available places cannot be negative: %d', $this->availablePlaces)
            );
        }

        if ($this->availablePlaces > $this->capacity) {
            throw new InvalidSejourException(
                sprintf(
                    'Available places (%d) cannot exceed capacity (%d)',
                    $this->availablePlaces,
                    $this->capacity
                )
            );
        }
    }

    // ========================================
    // Domain Events
    // ========================================

    private function recordEvent(DomainEventInterface $event): void
    {
        $this->domainEvents[] = $event;
    }

    /**
     * @return array<DomainEventInterface>
     */
    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];

        return $events;
    }

    // ========================================
    // Getters
    // ========================================

    public function getId(): SejourId
    {
        return $this->id;
    }

    public function getDestination(): string
    {
        return $this->destination;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getPeriod(): DateRange
    {
        return $this->period;
    }

    public function getPricePerPerson(): Money
    {
        return $this->pricePerPerson;
    }

    public function getCapacity(): int
    {
        return $this->capacity;
    }

    public function getAvailablePlaces(): int
    {
        return $this->availablePlaces;
    }

    public function getStatus(): SejourStatus
    {
        return $this->status;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
```

**Tests:**
```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Domain\Catalog\Entity;

use App\Domain\Catalog\Entity\Sejour;
use App\Domain\Catalog\Exception\InvalidSejourException;
use App\Domain\Catalog\Exception\SejourFullException;
use App\Domain\Catalog\ValueObject\DateRange;
use App\Domain\Catalog\ValueObject\SejourId;
use App\Domain\Reservation\ValueObject\Money;
use PHPUnit\Framework\TestCase;

class SejourTest extends TestCase
{
    /** @test */
    public function it_creates_sejour_in_draft_status(): void
    {
        // ARRANGE
        $id = SejourId::generate();
        $period = DateRange::fromStrings('2025-07-15', '2025-07-22');
        $price = Money::fromEuros(1299.99);

        // ACT
        $sejour = Sejour::create($id, 'Guadeloupe', $period, $price, 10);

        // ASSERT
        $this->assertTrue($sejour->getStatus()->isDraft());
        $this->assertEquals(10, $sejour->getAvailablePlaces());
        $this->assertCount(1, $sejour->pullDomainEvents()); // SejourCreatedEvent
    }

    /** @test */
    public function it_publishes_sejour_when_valid(): void
    {
        // ARRANGE
        $sejour = $this->createValidSejour();
        $sejour->updateDescription('Magnifique séjour en Guadeloupe');

        // ACT
        $sejour->publish();

        // ASSERT
        $this->assertTrue($sejour->getStatus()->isPublished());
        $this->assertCount(1, $sejour->pullDomainEvents()); // SejourPublishedEvent
    }

    /** @test */
    public function it_throws_exception_when_publishing_without_description(): void
    {
        // ARRANGE
        $sejour = $this->createValidSejour();
        // Keine Beschreibung festgelegt

        // ASSERT
        $this->expectException(InvalidSejourException::class);
        $this->expectExceptionMessage('Description required to publish');

        // ACT
        $sejour->publish();
    }

    /** @test */
    public function it_reserves_places_successfully(): void
    {
        // ARRANGE
        $sejour = $this->createPublishedSejour();

        // ACT
        $sejour->reservePlaces(3);

        // ASSERT
        $this->assertEquals(7, $sejour->getAvailablePlaces()); // 10 - 3
    }

    /** @test */
    public function it_throws_exception_when_not_enough_places(): void
    {
        // ARRANGE
        $sejour = $this->createPublishedSejour();

        // ASSERT
        $this->expectException(SejourFullException::class);

        // ACT
        $sejour->reservePlaces(15); // Mehr als Kapazität
    }

    /** @test */
    public function it_releases_places_on_cancellation(): void
    {
        // ARRANGE
        $sejour = $this->createPublishedSejour();
        $sejour->reservePlaces(3); // 10 -> 7

        // ACT
        $sejour->releasePlaces(3); // 7 -> 10

        // ASSERT
        $this->assertEquals(10, $sejour->getAvailablePlaces());
    }

    /** @test */
    public function it_prevents_price_change_with_reservations(): void
    {
        // ARRANGE
        $sejour = $this->createPublishedSejour();
        $sejour->reservePlaces(1); // Hat Reservierungen

        // ASSERT
        $this->expectException(InvalidSejourException::class);
        $this->expectExceptionMessage('Cannot change price with existing reservations');

        // ACT
        $sejour->updatePrice(Money::fromEuros(1499.99));
    }

    /** @test */
    public function it_detects_when_full(): void
    {
        // ARRANGE
        $sejour = $this->createPublishedSejour();
        $sejour->reservePlaces(10); // Alle Plätze

        // ASSERT
        $this->assertTrue($sejour->isFull());
        $this->assertFalse($sejour->hasEnoughPlaces(1));
    }

    private function createValidSejour(): Sejour
    {
        $period = DateRange::fromStrings('2025-07-15', '2025-07-22');
        $price = Money::fromEuros(1299.99);

        return Sejour::create(
            SejourId::generate(),
            'Guadeloupe',
            $period,
            $price,
            10
        );
    }

    private function createPublishedSejour(): Sejour
    {
        $sejour = $this->createValidSejour();
        $sejour->updateDescription('Magnifique séjour en Guadeloupe');
        $sejour->publish();
        $sejour->pullDomainEvents(); // Events leeren für Tests

        return $sejour;
    }
}
```

---

## Aggregate Root Checkliste

- [ ] Implementiert `AggregateRootInterface`
- [ ] Privater Konstruktor (Factory-Methoden verwenden)
- [ ] Globale Identität (UUID via Value Object)
- [ ] Domain Events verwalten (`recordEvent()`, `pullDomainEvents()`)
- [ ] Geschäftsinvarianten validieren (in Methoden)
- [ ] Privates `ensure*Invariant()` für Validierungen
- [ ] Kind-Entitäten nur über Aggregate Root verwalten
- [ ] Keine öffentlichen Setters (nur Business-Methoden)
- [ ] Unit-Tests > 90% Abdeckung
- [ ] Factory für komplexe Erstellung
- [ ] Repository-Interface in Domain-Layer

---

## Best Practices

### ✅ DO

```php
// Geschäftslogik kapseln
public function confirm(): void
{
    $this->ensureCanBeConfirmed();
    $this->status = Status::CONFIRMED;
    $this->recordEvent(new ConfirmedEvent(...));
}

// Invarianten sichern
private function ensureCanBeConfirmed(): void
{
    if (!$this->status->canBeConfirmed()) {
        throw new InvalidStateException();
    }
}
```

### ❌ DON'T

```php
// ❌ Öffentliche Setters vermeiden
public function setStatus(Status $status): void
{
    $this->status = $status; // Keine Validierung!
}

// ❌ Kind-Entitäten direkt exponieren
public function getParticipants(): array
{
    return $this->participants; // Kann extern modifiziert werden!
}

// ✅ Stattdessen: Read-only Kopie zurückgeben
public function getParticipants(): array
{
    return array_map(
        fn(Participant $p) => clone $p,
        $this->participants
    );
}
```

---

**Erstellungsdatum:** 2025-11-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
