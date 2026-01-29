# Patterns DDD - Atoll Tourisme

## Overview

Ce document détaille les **patterns Domain-Driven Design** obligatoires pour le projet Atoll Tourisme.

> **Références:**
> - `02-architecture-clean-ddd.md` - Architecture globale
> - `04-solid-principles.md` - Principes SOLID
> - `01-symfony-best-practices.md` - Standards Symfony

---

## Table des matières

1. [Aggregates (Agrégats)](#aggregates-agrégats)
2. [Entities vs Value Objects](#entities-vs-value-objects)
3. [Value Objects](#value-objects)
4. [Domain Events](#domain-events)
5. [Domain Services](#domain-services)
6. [Repositories](#repositories)
7. [Factories](#factories)
8. [Specifications](#specifications)

---

## Aggregates (Agrégats)

### Définition

Un **Aggregate** est un cluster d'objets du domaine traités comme une unité cohérente pour les modifications de données.

**Règles:**
1. Un Aggregate a une **Aggregate Root** (racine)
2. Les entités externes ne peuvent référencer que l'Aggregate Root
3. Les modifications passent TOUJOURS par l'Aggregate Root
4. Une transaction modifie UN SEUL Aggregate

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

    // ✅ Collection d'entités enfants (parties de l'agrégat)
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

        // ✅ Événement domaine
        $reservation->recordEvent(
            new ReservationCreatedEvent($id, $clientEmail)
        );

        return $reservation;
    }

    // ✅ Modification via l'Aggregate Root
    public function addParticipant(Participant $participant): void
    {
        // ✅ Validation des règles métier
        if (count($this->participants) >= 10) {
            throw new InvalidReservationException('Maximum 10 participants');
        }

        // ✅ Le participant appartient à la réservation
        $participant->assignToReservation($this);

        $this->participants[] = $participant;

        $this->recordEvent(
            new ParticipantAddedEvent($this->id, $participant->getId())
        );
    }

    // ✅ Suppression via l'Aggregate Root
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

    // ✅ Logique métier dans l'agrégat
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

    // ✅ Invariants de l'agrégat
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

### Entité enfant: Participant

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\ParticipantId;
use App\Domain\Shared\ValueObject\PersonName;

// ✅ Entité (pas Aggregate Root)
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

    // ✅ Assignation via l'Aggregate Root
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

### Règles des Aggregates

1. **Accès externe uniquement par l'Aggregate Root**

```php
// ❌ MAUVAIS: Accès direct au participant
$participant = $participantRepository->find($participantId);
$participant->setAge(25);
$participantRepository->save($participant);

// ✅ BON: Modification via l'Aggregate Root
$reservation = $reservationRepository->find($reservationId);
$reservation->updateParticipantAge($participantId, 25);
$reservationRepository->save($reservation);
```

2. **Une transaction = Un aggregate**

```php
// ❌ MAUVAIS: Modifier 2 aggregates dans une transaction
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
    $this->repository->save($to); // ❌ 2 aggregates modifiés
}

// ✅ BON: Utiliser un Domain Event
public function removeParticipant(ParticipantId $id): void
{
    $reservation = $this->repository->find($reservationId);
    $reservation->removeParticipant($participantId);
    $this->repository->save($reservation);

    // Événement pour transfert éventuel
    $this->eventBus->dispatch(
        new ParticipantRemovedFromReservationEvent($reservationId, $participantId)
    );
}
```

3. **Taille raisonnable des aggregates**

```php
// ❌ TROP GROS: Aggregate avec 1000+ participants
class Sejour // Aggregate Root
{
    private array $reservations = []; // 100 reservations
    // Chaque reservation a 10 participants
    // = 1000+ objets chargés !
}

// ✅ BON: Aggregates plus petits
class Sejour // Aggregate Root
{
    // Référence les IDs uniquement
    private array $reservationIds = [];
}

class Reservation // Aggregate Root séparé
{
    private SejourId $sejourId; // Référence par ID
    private array $participants = []; // Max 10
}
```

---

## Entities vs Value Objects

### Entities (Entités)

**Définition:** Objet identifié par son identité, pas ses attributs.

**Caractéristiques:**
- ✅ Identité unique (ID)
- ✅ Mutable (peut changer)
- ✅ Comparable par ID
- ✅ Cycle de vie

**Exemples Atoll Tourisme:**
- `Reservation` (ID unique)
- `Participant` (ID unique)
- `Sejour` (ID unique)

```php
<?php

namespace App\Domain\Reservation\Entity;

// ✅ ENTITÉ: Identité = ID
final class Reservation
{
    private ReservationId $id; // ✅ Identité unique

    // ✅ Mutable: le statut peut changer
    private ReservationStatus $statut;

    public function confirmer(): void
    {
        $this->statut = ReservationStatus::CONFIRMEE;
    }

    // ✅ Égalité basée sur l'ID
    public function equals(self $other): bool
    {
        return $this->id->equals($other->id);
    }
}
```

### Value Objects (Objets Valeur)

**Définition:** Objet identifié par ses attributs, pas son identité.

**Caractéristiques:**
- ✅ Immutable (readonly)
- ✅ Comparable par valeur
- ✅ Pas d'identité
- ✅ Remplaçable

**Exemples Atoll Tourisme:**
- `Money` (montant)
- `Email` (adresse email)
- `DateRange` (période)
- `ReservationId` (identifiant)

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ VALUE OBJECT: Identité = valeur
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

    // ✅ Immutable: retourne une NOUVELLE instance
    public function add(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amountCents + $other->amountCents);
    }

    public function multiply(float $multiplier): self
    {
        return new self((int) round($this->amountCents * $multiplier));
    }

    // ✅ Égalité par valeur
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

### Quand utiliser quoi?

| Critère | Entity | Value Object |
|---------|--------|--------------|
| **Identité** | Important | Non important |
| **Mutabilité** | Peut changer | Immutable |
| **Égalité** | Par ID | Par valeur |
| **Exemple** | `Reservation`, `Participant` | `Money`, `Email`, `DateRange` |

```php
// ❌ MAUVAIS: Money comme entité
class Money
{
    private int $id; // ❌ Pas d'identité nécessaire
    private float $amount;

    public function setAmount(float $amount): void // ❌ Mutable
    {
        $this->amount = $amount;
    }
}

// ✅ BON: Money comme Value Object
final readonly class Money
{
    private function __construct(
        private int $amountCents
    ) {}

    public function add(self $other): self // ✅ Immutable
    {
        return new self($this->amountCents + $other->amountCents);
    }
}
```

---

## Value Objects

### Money (Argent)

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

### DateRange (Période)

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

### Définition

Un **Domain Event** représente quelque chose qui s'est produit dans le domaine et qui intéresse d'autres parties du système.

### Caractéristiques

- ✅ Immutable
- ✅ Passed (événement déjà produit)
- ✅ Nommé avec un verbe au passé
- ✅ Contient les données nécessaires

### Example: ReservationConfirmedEvent

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

### Interface DomainEvent

```php
<?php

namespace App\Domain\Shared\Interface;

interface DomainEventInterface
{
    public function getOccurredOn(): \DateTimeImmutable;
}
```

### Enregistrement et dispatch

```php
<?php

// Dans l'Aggregate Root
final class Reservation
{
    /** @var list<DomainEventInterface> */
    private array $domainEvents = [];

    public function confirmer(): void
    {
        $this->statut = ReservationStatus::CONFIRMEE;

        // ✅ Enregistre l'événement
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

// Dans le Use Case
final readonly class ConfirmReservationUseCase
{
    public function execute(ConfirmReservationCommand $command): void
    {
        $reservation = $this->repository->findById($command->reservationId);

        $reservation->confirmer();

        $this->repository->save($reservation);

        // ✅ Dispatche les événements
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

### Quand utiliser un Domain Service?

Utilisez un Domain Service quand:
1. La logique ne "appartient" à aucune entité spécifique
2. L'opération nécessite plusieurs aggregates
3. Calcul complexe impliquant plusieurs Value Objects

### Example: ReservationPricingService

```php
<?php

namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\Pricing\DiscountPolicyInterface;

// ✅ DOMAIN SERVICE: Logique métier n'appartenant à aucune entité
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
        // Gratuit pour les bébés (< 3 ans)
        if ($participant->isBebe()) {
            return Money::zero();
        }

        // 50% pour les enfants (< 18 ans)
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

// ✅ Interface dans le domaine
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

// ✅ Implémentation Doctrine dans l'infrastructure
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

### Quand utiliser une Factory?

- Création complexe d'aggregates
- Reconstitution depuis la persistance
- Logique de création métier

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

        // Ajoute les participants
        foreach ($participantsData as $data) {
            $participant = Participant::create(
                ParticipantId::generate(),
                PersonName::fromString($data['nom']),
                $data['age']
            );

            $reservation->addParticipant($participant);
        }

        // Calcule le prix
        $montant = $this->pricingService->calculateTotalPrice($reservation);
        $reservation->setMontantTotal($montant);

        return $reservation;
    }
}
```

---

## Specifications

### Pattern Specification

Encapsuler les règles métier de sélection.

```php
<?php

namespace App\Domain\Reservation\Specification;

use App\Domain\Reservation\Entity\Reservation;

interface ReservationSpecificationInterface
{
    public function isSatisfiedBy(Reservation $reservation): bool;
}

// Spécification: Réservation confirmée
final readonly class ConfirmedReservationSpecification implements ReservationSpecificationInterface
{
    public function isSatisfiedBy(Reservation $reservation): bool
    {
        return $reservation->getStatut() === ReservationStatus::CONFIRMEE;
    }
}

// Spécification: Montant élevé
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

// Spécification composite: AND
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

// Utilisation
$confirmedAndHighAmount = new AndSpecification(
    new ConfirmedReservationSpecification(),
    new HighAmountReservationSpecification(Money::fromEuros(1000))
);

if ($confirmedAndHighAmount->isSatisfiedBy($reservation)) {
    // ...
}
```

---

## Checklist DDD

- [ ] **Aggregates:** Identifiés avec Aggregate Roots
- [ ] **Entities:** Ont une identité (ID Value Object)
- [ ] **Value Objects:** Immutables (readonly)
- [ ] **Domain Events:** Enregistrés dans les aggregates
- [ ] **Domain Services:** Pour logique n'appartenant à aucune entité
- [ ] **Repositories:** Interfaces dans Domain, implémentation dans Infrastructure
- [ ] **Factories:** Pour création complexe d'aggregates
- [ ] **Specifications:** Pour encapsuler les règles de sélection

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
