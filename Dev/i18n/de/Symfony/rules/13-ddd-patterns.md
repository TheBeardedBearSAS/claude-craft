# DDD-Patterns - Atoll Tourisme

## Übersicht

Dieses Dokument beschreibt die **Domain-Driven Design Patterns**, die für das Projekt Atoll Tourisme verpflichtend sind.

> **Referenzen:**
> - `02-architecture-clean-ddd.md` - Globale Architektur
> - `04-solid-principles.md` - SOLID-Prinzipien
> - `01-symfony-best-practices.md` - Symfony-Standards

---

## Inhaltsverzeichnis

1. [Aggregates (Aggregate)](#aggregates-aggregate)
2. [Entities vs Value Objects](#entities-vs-value-objects)
3. [Value Objects](#value-objects)
4. [Domain Events](#domain-events)
5. [Domain Services](#domain-services)
6. [Repositories](#repositories)
7. [Factories](#factories)
8. [Specifications](#specifications)

---

## Aggregates (Aggregate)

### Definition

Ein **Aggregate** ist ein Cluster von Domain-Objekten, die als kohärente Einheit für Datenänderungen behandelt werden.

**Regeln:**
1. Ein Aggregate hat eine **Aggregate Root** (Wurzel)
2. Externe Entitäten können nur auf die Aggregate Root verweisen
3. Änderungen gehen IMMER über die Aggregate Root
4. Eine Transaktion ändert EIN EINZIGES Aggregate

### Aggregate: Reservation

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationStatus;
use App\Domain\Shared\ValueObject\Email;

// ✅ AGGREGATE ROOT
final class Reservation
{
    private ReservationId $id;
    private Email $clientEmail;
    private Money $montantTotal;
    private ReservationStatus $statut;

    // ✅ Collection von Kind-Entitäten (Teil des Aggregats)
    /** @var list<Participant> */
    private array $participants = [];

    /** @var list<DomainEventInterface> */
    private array $domainEvents = [];

    private function __construct(
        ReservationId $id,
        Email $clientEmail,
        Money $montantTotal
    ) {
        $this->id = $id;
        $this->clientEmail = $clientEmail;
        $this->montantTotal = $montantTotal;
        $this->statut = ReservationStatus::EN_ATTENTE;
    }

    public static function create(
        ReservationId $id,
        Email $clientEmail,
        Money $montantTotal
    ): self {
        $reservation = new self($id, $clientEmail, $montantTotal);

        // ✅ Domain-Event
        $reservation->recordEvent(
            new ReservationCreatedEvent($id, $clientEmail)
        );

        return $reservation;
    }

    // ✅ Änderung über Aggregate Root
    public function addParticipant(Participant $participant): void
    {
        // ✅ Validierung der Geschäftsregeln
        if (count($this->participants) >= 10) {
            throw new InvalidReservationException('Maximum 10 participants');
        }

        // ✅ Der Teilnehmer gehört zur Reservierung
        $participant->assignToReservation($this);

        $this->participants[] = $participant;

        $this->recordEvent(
            new ParticipantAddedEvent($this->id, $participant->getId())
        );
    }

    // ✅ Löschung über Aggregate Root
    public function removeParticipant(ParticipantId $participantId): void
    {
        foreach ($this->participants as $key => $participant) {
            if ($participant->getId()->equals($participantId)) {
                unset($this->participants[$key]);

                $this->recordEvent(
                    new ParticipantRemovedEvent($this->id, $participantId)
                );

                return;
            }
        }

        throw ParticipantNotFoundException::withId($participantId);
    }

    // ✅ Geschäftslogik im Aggregat
    public function confirmer(): void
    {
        if ($this->statut === ReservationStatus::ANNULEE) {
            throw new InvalidReservationException('Cannot confirm cancelled reservation');
        }

        if (count($this->participants) === 0) {
            throw new InvalidReservationException('At least one participant required');
        }

        $this->statut = ReservationStatus::CONFIRMEE;

        $this->recordEvent(new ReservationConfirmedEvent($this->id));
    }

    public function annuler(string $raison): void
    {
        if ($this->statut === ReservationStatus::TERMINEE) {
            throw new InvalidReservationException('Cannot cancel completed reservation');
        }

        $this->statut = ReservationStatus::ANNULEE;

        $this->recordEvent(
            new ReservationCancelledEvent($this->id, $raison)
        );
    }

    // ✅ Invarianten des Aggregats
    public function isValid(): bool
    {
        return count($this->participants) > 0
            && $this->montantTotal->isPositive();
    }

    private function recordEvent(DomainEventInterface $event): void
    {
        $this->domainEvents[] = $event;
    }

    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];
        return $events;
    }

    // Getters
    public function getId(): ReservationId
    {
        return $this->id;
    }

    /**
     * @return list<Participant>
     */
    public function getParticipants(): array
    {
        return $this->participants;
    }

    public function getMontantTotal(): Money
    {
        return $this->montantTotal;
    }

    public function getStatut(): ReservationStatus
    {
        return $this->statut;
    }
}
```

### Kind-Entität: Participant

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\ParticipantId;
use App\Domain\Shared\ValueObject\PersonName;

// ✅ Entität (nicht Aggregate Root)
final class Participant
{
    private ParticipantId $id;
    private PersonName $nom;
    private int $age;
    private ?Reservation $reservation = null;

    private function __construct(
        ParticipantId $id,
        PersonName $nom,
        int $age
    ) {
        $this->id = $id;
        $this->nom = $nom;
        $this->setAge($age);
    }

    public static function create(
        ParticipantId $id,
        PersonName $nom,
        int $age
    ): self {
        return new self($id, $nom, $age);
    }

    // ✅ Zuweisung über Aggregate Root
    public function assignToReservation(Reservation $reservation): void
    {
        $this->reservation = $reservation;
    }

    private function setAge(int $age): void
    {
        if ($age < 0 || $age > 120) {
            throw new \InvalidArgumentException('Age must be between 0 and 120');
        }

        $this->age = $age;
    }

    public function getId(): ParticipantId
    {
        return $this->id;
    }

    public function getNom(): PersonName
    {
        return $this->nom;
    }

    public function getAge(): int
    {
        return $this->age;
    }

    public function isEnfant(): bool
    {
        return $this->age < 18;
    }

    public function isBebe(): bool
    {
        return $this->age < 3;
    }
}
```

### Regeln für Aggregates

1. **Externer Zugriff nur über Aggregate Root**

```php
// ❌ FALSCH: Direkter Zugriff auf Teilnehmer
$participant = $participantRepository->find($participantId);
$participant->setAge(25);
$participantRepository->save($participant);

// ✅ RICHTIG: Änderung über Aggregate Root
$reservation = $reservationRepository->find($reservationId);
$reservation->updateParticipantAge($participantId, 25);
$reservationRepository->save($reservation);
```

2. **Eine Transaktion = Ein Aggregate**

```php
// ❌ FALSCH: 2 Aggregates in einer Transaktion ändern
public function transferParticipant(
    ReservationId $fromId,
    ReservationId $toId,
    ParticipantId $participantId
): void {
    $from = $this->repository->find($fromId);
    $to = $this->repository->find($toId);

    $participant = $from->removeParticipant($participantId);
    $to->addParticipant($participant);

    $this->repository->save($from);
    $this->repository->save($to); // ❌ 2 Aggregates geändert
}

// ✅ RICHTIG: Domain Event verwenden
public function removeParticipant(ParticipantId $id): void
{
    $reservation = $this->repository->find($reservationId);
    $reservation->removeParticipant($participantId);
    $this->repository->save($reservation);

    // Event für möglichen Transfer
    $this->eventBus->dispatch(
        new ParticipantRemovedFromReservationEvent($reservationId, $participantId)
    );
}
```

3. **Angemessene Größe der Aggregates**

```php
// ❌ ZU GROSS: Aggregate mit 1000+ Teilnehmern
class Sejour // Aggregate Root
{
    private array $reservations = []; // 100 Reservierungen
    // Jede Reservierung hat 10 Teilnehmer
    // = 1000+ geladene Objekte!
}

// ✅ RICHTIG: Kleinere Aggregates
class Sejour // Aggregate Root
{
    // Referenziert nur IDs
    private array $reservationIds = [];
}

class Reservation // Separates Aggregate Root
{
    private SejourId $sejourId; // Referenz per ID
    private array $participants = []; // Max 10
}
```

---

## Entities vs Value Objects

### Entities (Entitäten)

**Definition:** Objekt identifiziert durch seine Identität, nicht seine Attribute.

**Eigenschaften:**
- ✅ Eindeutige Identität (ID)
- ✅ Änderbar (kann sich ändern)
- ✅ Vergleichbar per ID
- ✅ Lebenszyklus

**Beispiele Atoll Tourisme:**
- `Reservation` (Eindeutige ID)
- `Participant` (Eindeutige ID)
- `Sejour` (Eindeutige ID)

```php
<?php

namespace App\Domain\Reservation\Entity;

// ✅ ENTITÄT: Identität = ID
final class Reservation
{
    private ReservationId $id; // ✅ Eindeutige Identität

    // ✅ Änderbar: Status kann sich ändern
    private ReservationStatus $statut;

    public function confirmer(): void
    {
        $this->statut = ReservationStatus::CONFIRMEE;
    }

    // ✅ Gleichheit basiert auf ID
    public function equals(self $other): bool
    {
        return $this->id->equals($other->id);
    }
}
```

### Value Objects (Wertobjekte)

**Definition:** Objekt identifiziert durch seine Attribute, nicht seine Identität.

**Eigenschaften:**
- ✅ Unveränderlich (readonly)
- ✅ Vergleichbar per Wert
- ✅ Keine Identität
- ✅ Ersetzbar

**Beispiele Atoll Tourisme:**
- `Money` (Betrag)
- `Email` (E-Mail-Adresse)
- `DateRange` (Zeitraum)
- `ReservationId` (Bezeichner)

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ VALUE OBJECT: Identität = Wert
final readonly class Money
{
    private function __construct(
        private int $amountCents,
        private string $currency = 'EUR',
    ) {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }
    }

    public static function fromEuros(float $amount): self
    {
        return new self((int) round($amount * 100));
    }

    // ✅ Unveränderlich: gibt NEUE Instanz zurück
    public function add(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amountCents + $other->amountCents);
    }

    public function multiply(float $multiplier): self
    {
        return new self((int) round($this->amountCents * $multiplier));
    }

    // ✅ Gleichheit per Wert
    public function equals(self $other): bool
    {
        return $this->amountCents === $other->amountCents
            && $this->currency === $other->currency;
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }

    private function ensureSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException('Currency mismatch');
        }
    }
}
```

### Wann was verwenden?

| Kriterium | Entity | Value Object |
|-----------|--------|--------------|
| **Identität** | Wichtig | Nicht wichtig |
| **Veränderbarkeit** | Kann sich ändern | Unveränderlich |
| **Gleichheit** | Per ID | Per Wert |
| **Beispiel** | `Reservation`, `Participant` | `Money`, `Email`, `DateRange` |

```php
// ❌ FALSCH: Money als Entität
class Money
{
    private int $id; // ❌ Keine Identität notwendig
    private float $amount;

    public function setAmount(float $amount): void // ❌ Veränderlich
    {
        $this->amount = $amount;
    }
}

// ✅ RICHTIG: Money als Value Object
final readonly class Money
{
    private function __construct(
        private int $amountCents
    ) {}

    public function add(self $other): self // ✅ Unveränderlich
    {
        return new self($this->amountCents + $other->amountCents);
    }
}
```

---

## Value Objects

### Money (Geld)

```php
<?php

namespace App\Domain\Reservation\ValueObject;

final readonly class Money
{
    private function __construct(
        private int $amountCents,
        private string $currency = 'EUR',
    ) {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        if (empty($currency)) {
            throw new \InvalidArgumentException('Currency cannot be empty');
        }
    }

    public static function fromEuros(float $amount): self
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        return new self((int) round($amount * 100), 'EUR');
    }

    public static function fromCents(int $cents): self
    {
        return new self($cents);
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
        return new self(
            (int) round($this->amountCents * $multiplier),
            $this->currency
        );
    }

    public function isPositive(): bool
    {
        return $this->amountCents > 0;
    }

    public function isZero(): bool
    {
        return $this->amountCents === 0;
    }

    public function isGreaterThan(self $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amountCents > $other->amountCents;
    }

    public function equals(self $other): bool
    {
        return $this->amountCents === $other->amountCents
            && $this->currency === $other->currency;
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }

    public function getAmountCents(): int
    {
        return $this->amountCents;
    }

    public function getCurrency(): string
    {
        return $this->currency;
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

### Email

```php
<?php

namespace App\Domain\Shared\ValueObject;

final readonly class Email
{
    private function __construct(
        private string $value,
    ) {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid email address: %s', $value)
            );
        }
    }

    public static function fromString(string $email): self
    {
        return new self(strtolower(trim($email)));
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function getDomain(): string
    {
        return explode('@', $this->value)[1];
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

### DateRange (Zeitraum)

```php
<?php

namespace App\Domain\Sejour\ValueObject;

final readonly class DateRange
{
    private function __construct(
        private \DateTimeImmutable $start,
        private \DateTimeImmutable $end,
    ) {
        if ($start >= $end) {
            throw new \InvalidArgumentException('Start date must be before end date');
        }
    }

    public static function fromDates(
        \DateTimeImmutable $start,
        \DateTimeImmutable $end
    ): self {
        return new self($start, $end);
    }

    public static function fromStrings(string $start, string $end): self
    {
        return new self(
            new \DateTimeImmutable($start),
            new \DateTimeImmutable($end)
        );
    }

    public function getStart(): \DateTimeImmutable
    {
        return $this->start;
    }

    public function getEnd(): \DateTimeImmutable
    {
        return $this->end;
    }

    public function getDurationDays(): int
    {
        return $this->start->diff($this->end)->days;
    }

    public function contains(\DateTimeImmutable $date): bool
    {
        return $date >= $this->start && $date <= $this->end;
    }

    public function overlaps(self $other): bool
    {
        return $this->start < $other->end && $other->start < $this->end;
    }

    public function equals(self $other): bool
    {
        return $this->start == $other->start && $this->end == $other->end;
    }
}
```

### ReservationId (Identity VO)

```php
<?php

namespace App\Domain\Reservation\ValueObject;

use Symfony\Component\Uid\Uuid;

final readonly class ReservationId
{
    private function __construct(
        private string $value,
    ) {
        if (!Uuid::isValid($value)) {
            throw new \InvalidArgumentException('Invalid UUID format');
        }
    }

    public static function generate(): self
    {
        return new self(Uuid::v4()->toRfc4122());
    }

    public static function fromString(string $id): self
    {
        return new self($id);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

---

## Domain Events

### Definition

Ein **Domain Event** stellt etwas dar, das in der Domain passiert ist und für andere Teile des Systems von Interesse ist.

### Eigenschaften

- ✅ Unveränderlich
- ✅ Vergangenheit (bereits eingetreten)
- ✅ Benannt mit Verb in der Vergangenheit
- ✅ Enthält notwendige Daten

### Beispiel: ReservationConfirmedEvent

```php
<?php

namespace App\Domain\Reservation\Event;

use App\Domain\Reservation\ValueObject\ReservationId;

final readonly class ReservationConfirmedEvent implements DomainEventInterface
{
    public function __construct(
        private ReservationId $reservationId,
        private \DateTimeImmutable $occurredOn = new \DateTimeImmutable(),
    ) {}

    public function getReservationId(): ReservationId
    {
        return $this->reservationId;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
```

### DomainEvent Interface

```php
<?php

namespace App\Domain\Shared\Interface;

interface DomainEventInterface
{
    public function getOccurredOn(): \DateTimeImmutable;
}
```

### Aufzeichnung und Versand

```php
<?php

// In der Aggregate Root
final class Reservation
{
    /** @var list<DomainEventInterface> */
    private array $domainEvents = [];

    public function confirmer(): void
    {
        $this->statut = ReservationStatus::CONFIRMEE;

        // ✅ Event aufzeichnen
        $this->recordEvent(new ReservationConfirmedEvent($this->id));
    }

    private function recordEvent(DomainEventInterface $event): void
    {
        $this->domainEvents[] = $event;
    }

    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];
        return $events;
    }
}

// Im Use Case
final readonly class ConfirmReservationUseCase
{
    public function execute(ConfirmReservationCommand $command): void
    {
        $reservation = $this->repository->findById($command->reservationId);

        $reservation->confirmer();

        $this->repository->save($reservation);

        // ✅ Events versenden
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventBus->dispatch($event);
        }
    }
}
```

### Event Handlers

```php
<?php

namespace App\Application\Reservation\EventHandler;

use App\Domain\Reservation\Event\ReservationConfirmedEvent;
use App\Domain\Notification\Service\NotificationServiceInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final readonly class SendConfirmationEmailOnReservationConfirmed
{
    public function __construct(
        private NotificationServiceInterface $notificationService,
    ) {}

    public function __invoke(ReservationConfirmedEvent $event): void
    {
        $this->notificationService->sendReservationConfirmation(
            $event->getReservationId()
        );
    }
}
```

---

## Domain Services

### Wann einen Domain Service verwenden?

Verwenden Sie einen Domain Service wenn:
1. Die Logik keiner spezifischen Entität "gehört"
2. Die Operation mehrere Aggregates benötigt
3. Komplexe Berechnung mit mehreren Value Objects

### Beispiel: ReservationPricingService

```php
<?php

namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\Pricing\DiscountPolicyInterface;

// ✅ DOMAIN SERVICE: Geschäftslogik gehört keiner Entität
final readonly class ReservationPricingService
{
    /**
     * @param iterable<DiscountPolicyInterface> $discountPolicies
     */
    public function __construct(
        private iterable $discountPolicies,
    ) {}

    public function calculateTotalPrice(Reservation $reservation): Money
    {
        $basePrice = $this->calculateBasePrice($reservation);

        return $this->applyDiscounts($basePrice, $reservation);
    }

    private function calculateBasePrice(Reservation $reservation): Money
    {
        $total = Money::zero();

        foreach ($reservation->getParticipants() as $participant) {
            $participantPrice = $this->calculateParticipantPrice(
                $participant,
                $reservation->getSejour()->getPrixBase()
            );

            $total = $total->add($participantPrice);
        }

        return $total;
    }

    private function calculateParticipantPrice(
        Participant $participant,
        Money $basePrice
    ): Money {
        // Kostenlos für Babys (< 3 Jahre)
        if ($participant->isBebe()) {
            return Money::zero();
        }

        // 50% für Kinder (< 18 Jahre)
        if ($participant->isEnfant()) {
            return $basePrice->multiply(0.5);
        }

        return $basePrice;
    }

    private function applyDiscounts(Money $amount, Reservation $reservation): Money
    {
        foreach ($this->discountPolicies as $policy) {
            if ($policy->isApplicable($reservation)) {
                $amount = $policy->apply($amount, $reservation);
            }
        }

        return $amount;
    }
}
```

---

## Repositories

### Interface (Domain)

```php
<?php

namespace App\Domain\Reservation\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\ReservationId;

// ✅ Interface in der Domain
interface ReservationRepositoryInterface
{
    /**
     * @throws ReservationNotFoundException
     */
    public function findById(ReservationId $id): Reservation;

    public function save(Reservation $reservation): void;

    public function delete(Reservation $reservation): void;
}
```

### Implementation (Infrastructure)

```php
<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Doctrine\ORM\EntityManagerInterface;

// ✅ Doctrine-Implementierung in der Infrastruktur
final readonly class DoctrineReservationRepository implements ReservationRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function findById(ReservationId $id): Reservation
    {
        $reservation = $this->entityManager->find(
            Reservation::class,
            $id->getValue()
        );

        if (!$reservation) {
            throw ReservationNotFoundException::withId($id);
        }

        return $reservation;
    }

    public function save(Reservation $reservation): void
    {
        $this->entityManager->persist($reservation);
        $this->entityManager->flush();
    }

    public function delete(Reservation $reservation): void
    {
        $this->entityManager->remove($reservation);
        $this->entityManager->flush();
    }
}
```

---

## Factories

### Wann eine Factory verwenden?

- Komplexe Erstellung von Aggregates
- Wiederherstellung aus Persistenz
- Geschäftslogik für Erstellung

```php
<?php

namespace App\Domain\Reservation\Factory;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Entity\Participant;
use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Shared\ValueObject\Email;
use App\Domain\Sejour\Entity\Sejour;

final readonly class ReservationFactory
{
    public function __construct(
        private ReservationPricingService $pricingService,
    ) {}

    /**
     * @param array<array{nom: string, age: int}> $participantsData
     */
    public function createFromData(
        Email $clientEmail,
        Sejour $sejour,
        array $participantsData
    ): Reservation {
        $reservation = Reservation::create(
            ReservationId::generate(),
            $clientEmail,
            Money::zero()
        );

        // Teilnehmer hinzufügen
        foreach ($participantsData as $data) {
            $participant = Participant::create(
                ParticipantId::generate(),
                PersonName::fromString($data['nom']),
                $data['age']
            );

            $reservation->addParticipant($participant);
        }

        // Preis berechnen
        $montant = $this->pricingService->calculateTotalPrice($reservation);
        $reservation->setMontantTotal($montant);

        return $reservation;
    }
}
```

---

## Specifications

### Specification Pattern

Geschäftsregeln für Auswahl kapseln.

```php
<?php

namespace App\Domain\Reservation\Specification;

use App\Domain\Reservation\Entity\Reservation;

interface ReservationSpecificationInterface
{
    public function isSatisfiedBy(Reservation $reservation): bool;
}

// Spezifikation: Bestätigte Reservierung
final readonly class ConfirmedReservationSpecification implements ReservationSpecificationInterface
{
    public function isSatisfiedBy(Reservation $reservation): bool
    {
        return $reservation->getStatut() === ReservationStatus::CONFIRMEE;
    }
}

// Spezifikation: Hoher Betrag
final readonly class HighAmountReservationSpecification implements ReservationSpecificationInterface
{
    public function __construct(
        private Money $threshold,
    ) {}

    public function isSatisfiedBy(Reservation $reservation): bool
    {
        return $reservation->getMontantTotal()->isGreaterThan($this->threshold);
    }
}

// Zusammengesetzte Spezifikation: AND
final readonly class AndSpecification implements ReservationSpecificationInterface
{
    public function __construct(
        private ReservationSpecificationInterface $spec1,
        private ReservationSpecificationInterface $spec2,
    ) {}

    public function isSatisfiedBy(Reservation $reservation): bool
    {
        return $this->spec1->isSatisfiedBy($reservation)
            && $this->spec2->isSatisfiedBy($reservation);
    }
}

// Verwendung
$confirmedAndHighAmount = new AndSpecification(
    new ConfirmedReservationSpecification(),
    new HighAmountReservationSpecification(Money::fromEuros(1000))
);

if ($confirmedAndHighAmount->isSatisfiedBy($reservation)) {
    // ...
}
```

---

## DDD Checkliste

- [ ] **Aggregates:** Mit Aggregate Roots identifiziert
- [ ] **Entities:** Haben Identität (ID Value Object)
- [ ] **Value Objects:** Unveränderlich (readonly)
- [ ] **Domain Events:** In Aggregates aufgezeichnet
- [ ] **Domain Services:** Für Logik, die keiner Entität gehört
- [ ] **Repositories:** Interfaces in Domain, Implementierung in Infrastructure
- [ ] **Factories:** Für komplexe Aggregate-Erstellung
- [ ] **Specifications:** Um Auswahlregeln zu kapseln

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
