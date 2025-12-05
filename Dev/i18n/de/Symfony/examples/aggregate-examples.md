# Exemples d'Aggregates - Atoll Tourisme

## Vue d'ensemble

Ce document présente une **implémentation complète** de l'Aggregate `Reservation` avec son entité enfant `Participant` pour le projet Atoll Tourisme.

> **Références:**
> - `.claude/rules/13-ddd-patterns.md` - Patterns DDD
> - `.claude/rules/02-architecture-clean-ddd.md` - Architecture
> - `.claude/examples/value-object-examples.md` - Value Objects utilisés

---

## Table des matières

1. [Principes des Aggregates](#principes-des-aggregates)
2. [Reservation (Aggregate Root)](#reservation-aggregate-root)
3. [Participant (Entity)](#participant-entity)
4. [Invariants métier](#invariants-métier)
5. [Domain Events](#domain-events)
6. [Factory](#factory)
7. [Repository Interface](#repository-interface)

---

## Principes des Aggregates

### Règles fondamentales

1. **Aggregate Root:** Point d'entrée unique pour modifications
2. **Cohérence transactionnelle:** Un Aggregate = Une transaction
3. **Invariants:** Règles métier toujours respectées
4. **Domain Events:** Enregistrés dans l'Aggregate Root
5. **Limite de taille:** Éviter les Aggregates trop gros (max 10-15 entités)

### Aggregate Reservation

**Responsabilités:**
- Gérer la liste des participants
- Valider règles métier (max participants, statut, etc.)
- Calculer montant total
- Enregistrer Domain Events

**Invariants:**
- Au moins 1 participant
- Maximum 10 participants
- Statut valide (EN_ATTENTE → CONFIRMEE → TERMINEE ou ANNULEE)
- Réservation confirmée = participants non modifiables
- Montant positif

---

## Reservation (Aggregate Root)

**Localisation:** `src/Domain/Reservation/Entity/Reservation.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\Event\ParticipantAddedEvent;
use App\Domain\Reservation\Event\ParticipantRemovedEvent;
use App\Domain\Reservation\Event\ReservationCancelledEvent;
use App\Domain\Reservation\Event\ReservationConfirmedEvent;
use App\Domain\Reservation\Event\ReservationCreatedEvent;
use App\Domain\Reservation\Exception\InvalidReservationException;
use App\Domain\Reservation\Exception\MaxParticipantsExceededException;
use App\Domain\Reservation\Exception\ParticipantNotFoundException;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ParticipantId;
use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Reservation\ValueObject\ReservationStatus;
use App\Domain\Shared\Interface\AggregateRootInterface;
use App\Domain\Shared\Interface\DomainEventInterface;
use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\PhoneNumber;

/**
 * Reservation Aggregate Root
 *
 * Responsabilités:
 * - Gérer les participants (ajout/suppression)
 * - Maintenir les invariants métier
 * - Enregistrer les Domain Events
 * - Calculer le montant total
 */
final class Reservation implements AggregateRootInterface
{
    private const MAX_PARTICIPANTS = 10;

    private ReservationId $id;
    private string $sejourId; // Référence vers Catalog BC (pas d'objet Sejour ici)
    private Email $contactEmail;
    private PhoneNumber $contactPhone;
    private string $contactName;
    private ReservationStatus $status;
    private Money $totalAmount;
    private bool $rgpdAccepted;
    private bool $newsletterAccepted;
    private ?string $comments;
    private \DateTimeImmutable $requestedAt;
    private \DateTimeImmutable $createdAt;
    private \DateTimeImmutable $updatedAt;

    /** @var array<Participant> */
    private array $participants = [];

    /** @var array<DomainEventInterface> */
    private array $domainEvents = [];

    /**
     * Constructeur privé: utiliser factory methods
     */
    private function __construct(
        ReservationId $id,
        string $sejourId,
        Email $contactEmail,
        PhoneNumber $contactPhone,
        string $contactName,
        bool $rgpdAccepted
    ) {
        $this->id = $id;
        $this->sejourId = $sejourId;
        $this->contactEmail = $contactEmail;
        $this->contactPhone = $contactPhone;
        $this->contactName = $contactName;
        $this->status = ReservationStatus::EN_ATTENTE;
        $this->totalAmount = Money::zero();
        $this->rgpdAccepted = $rgpdAccepted;
        $this->newsletterAccepted = false;
        $this->comments = null;
        $this->requestedAt = new \DateTimeImmutable();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Factory method: Créer une nouvelle réservation
     */
    public static function create(
        ReservationId $id,
        string $sejourId,
        Email $contactEmail,
        PhoneNumber $contactPhone,
        string $contactName,
        bool $rgpdAccepted
    ): self {
        if (!$rgpdAccepted) {
            throw new InvalidReservationException('RGPD consent is required');
        }

        $reservation = new self(
            $id,
            $sejourId,
            $contactEmail,
            $contactPhone,
            $contactName,
            $rgpdAccepted
        );

        // Enregistre événement domaine
        $reservation->recordEvent(new ReservationCreatedEvent(
            $id,
            $sejourId,
            $contactEmail,
            new \DateTimeImmutable()
        ));

        return $reservation;
    }

    /**
     * Ajouter un participant à la réservation
     *
     * @throws MaxParticipantsExceededException
     * @throws InvalidReservationException
     */
    public function addParticipant(Participant $participant): void
    {
        // ✅ INVARIANT: Maximum 10 participants
        if (count($this->participants) >= self::MAX_PARTICIPANTS) {
            throw new MaxParticipantsExceededException(
                sprintf('Cannot add more than %d participants', self::MAX_PARTICIPANTS)
            );
        }

        // ✅ INVARIANT: Ne peut pas modifier réservation confirmée
        if ($this->status->isConfirmed() || $this->status->isCompleted()) {
            throw new InvalidReservationException(
                'Cannot add participant to confirmed or completed reservation'
            );
        }

        // ✅ INVARIANT: Ne peut pas ajouter si annulée
        if ($this->status->isCancelled()) {
            throw new InvalidReservationException(
                'Cannot add participant to cancelled reservation'
            );
        }

        // Assigner participant à cette réservation
        $participant->assignToReservation($this);

        // Ajouter à la collection
        $this->participants[] = $participant;

        // Mettre à jour timestamp
        $this->updatedAt = new \DateTimeImmutable();

        // Enregistrer événement
        $this->recordEvent(new ParticipantAddedEvent(
            $this->id,
            $participant->getId(),
            new \DateTimeImmutable()
        ));
    }

    /**
     * Retirer un participant de la réservation
     *
     * @throws ParticipantNotFoundException
     * @throws InvalidReservationException
     */
    public function removeParticipant(ParticipantId $participantId): void
    {
        // ✅ INVARIANT: Ne peut pas modifier réservation confirmée
        if ($this->status->isConfirmed() || $this->status->isCompleted()) {
            throw new InvalidReservationException(
                'Cannot remove participant from confirmed or completed reservation'
            );
        }

        // Chercher le participant
        $found = false;
        foreach ($this->participants as $key => $participant) {
            if ($participant->getId()->equals($participantId)) {
                unset($this->participants[$key]);
                $found = true;
                break;
            }
        }

        if (!$found) {
            throw ParticipantNotFoundException::withId($participantId);
        }

        // Réindexer tableau
        $this->participants = array_values($this->participants);

        // Mettre à jour timestamp
        $this->updatedAt = new \DateTimeImmutable();

        // Enregistrer événement
        $this->recordEvent(new ParticipantRemovedEvent(
            $this->id,
            $participantId,
            new \DateTimeImmutable()
        ));
    }

    /**
     * Confirmer la réservation
     *
     * @throws InvalidReservationException
     */
    public function confirm(): void
    {
        // ✅ INVARIANT: Seulement si EN_ATTENTE
        if (!$this->status->canBeConfirmed()) {
            throw new InvalidReservationException(
                sprintf('Cannot confirm reservation with status: %s', $this->status->value)
            );
        }

        // ✅ INVARIANT: Au moins 1 participant
        if (count($this->participants) === 0) {
            throw new InvalidReservationException('At least one participant is required');
        }

        // ✅ INVARIANT: Montant positif
        if (!$this->totalAmount->isPositive()) {
            throw new InvalidReservationException('Total amount must be positive');
        }

        // Changer statut
        $this->status = ReservationStatus::CONFIRMEE;
        $this->updatedAt = new \DateTimeImmutable();

        // Enregistrer événement
        $this->recordEvent(new ReservationConfirmedEvent(
            $this->id,
            $this->totalAmount,
            count($this->participants),
            new \DateTimeImmutable()
        ));
    }

    /**
     * Annuler la réservation
     *
     * @throws InvalidReservationException
     */
    public function cancel(string $reason): void
    {
        // ✅ INVARIANT: Seulement si EN_ATTENTE ou CONFIRMEE
        if (!$this->status->canBeCancelled()) {
            throw new InvalidReservationException(
                sprintf('Cannot cancel reservation with status: %s', $this->status->value)
            );
        }

        if (empty($reason)) {
            throw new InvalidReservationException('Cancellation reason is required');
        }

        // Changer statut
        $this->status = ReservationStatus::ANNULEE;
        $this->updatedAt = new \DateTimeImmutable();

        // Enregistrer événement
        $this->recordEvent(new ReservationCancelledEvent(
            $this->id,
            $reason,
            new \DateTimeImmutable()
        ));
    }

    /**
     * Marquer comme terminée (après le séjour)
     *
     * @throws InvalidReservationException
     */
    public function complete(): void
    {
        if (!$this->status->isConfirmed()) {
            throw new InvalidReservationException(
                'Only confirmed reservations can be completed'
            );
        }

        $this->status = ReservationStatus::TERMINEE;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Définir le montant total (calculé par ReservationPricingService)
     */
    public function setTotalAmount(Money $amount): void
    {
        if (!$amount->isPositive() && !$amount->isZero()) {
            throw new InvalidReservationException('Total amount must be positive or zero');
        }

        $this->totalAmount = $amount;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Définir les préférences newsletter
     */
    public function setNewsletterAccepted(bool $accepted): void
    {
        $this->newsletterAccepted = $accepted;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Ajouter des commentaires
     */
    public function setComments(?string $comments): void
    {
        $this->comments = $comments;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Vérifier si la réservation est valide
     */
    public function isValid(): bool
    {
        return count($this->participants) > 0
            && $this->totalAmount->isPositive()
            && $this->rgpdAccepted;
    }

    // ========================================
    // Domain Events Management
    // ========================================

    private function recordEvent(DomainEventInterface $event): void
    {
        $this->domainEvents[] = $event;
    }

    /**
     * Récupère et vide les événements domaine (pour dispatch)
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
    // Getters
    // ========================================

    public function getId(): ReservationId
    {
        return $this->id;
    }

    public function getSejourId(): string
    {
        return $this->sejourId;
    }

    public function getContactEmail(): Email
    {
        return $this->contactEmail;
    }

    public function getContactPhone(): PhoneNumber
    {
        return $this->contactPhone;
    }

    public function getContactName(): string
    {
        return $this->contactName;
    }

    public function getStatus(): ReservationStatus
    {
        return $this->status;
    }

    public function getTotalAmount(): Money
    {
        return $this->totalAmount;
    }

    public function isRgpdAccepted(): bool
    {
        return $this->rgpdAccepted;
    }

    public function isNewsletterAccepted(): bool
    {
        return $this->newsletterAccepted;
    }

    public function getComments(): ?string
    {
        return $this->comments;
    }

    public function getRequestedAt(): \DateTimeImmutable
    {
        return $this->requestedAt;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    /**
     * @return array<Participant>
     */
    public function getParticipants(): array
    {
        return $this->participants;
    }

    public function getParticipantCount(): int
    {
        return count($this->participants);
    }

    /**
     * Trouver un participant par ID
     */
    public function findParticipant(ParticipantId $id): ?Participant
    {
        foreach ($this->participants as $participant) {
            if ($participant->getId()->equals($id)) {
                return $participant;
            }
        }

        return null;
    }
}
```

---

## Participant (Entity)

**Localisation:** `src/Domain/Reservation/Entity/Participant.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\EmergencyContact;
use App\Domain\Reservation\ValueObject\Gender;
use App\Domain\Reservation\ValueObject\MedicalInfo;
use App\Domain\Reservation\ValueObject\ParticipantId;
use App\Domain\Shared\ValueObject\PersonName;

/**
 * Participant Entity (partie de l'Aggregate Reservation)
 *
 * Responsabilités:
 * - Stocker informations participant
 * - Calculer l'âge
 * - Déterminer catégorie (bébé/enfant/adulte)
 */
final class Participant
{
    private ParticipantId $id;
    private PersonName $name;
    private \DateTimeImmutable $birthDate;
    private Gender $gender;
    private ?MedicalInfo $medicalInfo;
    private ?EmergencyContact $emergencyContact;
    private bool $photoAuthorization;
    private bool $exitAuthorization;
    private \DateTimeImmutable $createdAt;
    private \DateTimeImmutable $updatedAt;

    /** @var Reservation|null Référence vers l'Aggregate Root */
    private ?Reservation $reservation = null;

    private function __construct(
        ParticipantId $id,
        PersonName $name,
        \DateTimeImmutable $birthDate,
        Gender $gender
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->birthDate = $birthDate;
        $this->gender = $gender;
        $this->medicalInfo = null;
        $this->emergencyContact = null;
        $this->photoAuthorization = false;
        $this->exitAuthorization = false;
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Factory method
     */
    public static function create(
        ParticipantId $id,
        PersonName $name,
        \DateTimeImmutable $birthDate,
        Gender $gender
    ): self {
        // Validation: pas de date dans le futur
        if ($birthDate > new \DateTimeImmutable()) {
            throw new \InvalidArgumentException('Birth date cannot be in the future');
        }

        // Validation: âge maximum 120 ans
        $age = self::calculateAge($birthDate);
        if ($age > 120) {
            throw new \InvalidArgumentException('Invalid birth date (age > 120)');
        }

        return new self($id, $name, $birthDate, $gender);
    }

    /**
     * Assigner à une réservation (appelé par Reservation::addParticipant)
     */
    public function assignToReservation(Reservation $reservation): void
    {
        $this->reservation = $reservation;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Définir informations médicales (chiffrées en Infrastructure)
     */
    public function setMedicalInfo(MedicalInfo $medicalInfo): void
    {
        $this->medicalInfo = $medicalInfo;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Définir contact d'urgence
     */
    public function setEmergencyContact(EmergencyContact $contact): void
    {
        $this->emergencyContact = $contact;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Définir autorisations
     */
    public function setAuthorizations(bool $photo, bool $exit): void
    {
        $this->photoAuthorization = $photo;
        $this->exitAuthorization = $exit;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Calculer l'âge actuel
     */
    public function getAge(): int
    {
        return self::calculateAge($this->birthDate);
    }

    private static function calculateAge(\DateTimeImmutable $birthDate): int
    {
        $now = new \DateTimeImmutable();
        $interval = $birthDate->diff($now);

        return (int) $interval->y;
    }

    /**
     * Est un bébé (< 3 ans) - Gratuit
     */
    public function isInfant(): bool
    {
        return $this->getAge() < 3;
    }

    /**
     * Est un enfant (< 18 ans) - Réduction 50%
     */
    public function isChild(): bool
    {
        return $this->getAge() < 18;
    }

    /**
     * Est un adulte (>= 18 ans) - Plein tarif
     */
    public function isAdult(): bool
    {
        return $this->getAge() >= 18;
    }

    /**
     * Catégorie pour tarification
     */
    public function getPricingCategory(): string
    {
        if ($this->isInfant()) {
            return 'infant';
        }

        if ($this->isChild()) {
            return 'child';
        }

        return 'adult';
    }

    // ========================================
    // Getters
    // ========================================

    public function getId(): ParticipantId
    {
        return $this->id;
    }

    public function getName(): PersonName
    {
        return $this->name;
    }

    public function getBirthDate(): \DateTimeImmutable
    {
        return $this->birthDate;
    }

    public function getGender(): Gender
    {
        return $this->gender;
    }

    public function getMedicalInfo(): ?MedicalInfo
    {
        return $this->medicalInfo;
    }

    public function getEmergencyContact(): ?EmergencyContact
    {
        return $this->emergencyContact;
    }

    public function hasPhotoAuthorization(): bool
    {
        return $this->photoAuthorization;
    }

    public function hasExitAuthorization(): bool
    {
        return $this->exitAuthorization;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getReservation(): ?Reservation
    {
        return $this->reservation;
    }
}
```

---

## Invariants métier

### Invariants de Reservation

| Invariant | Validation | Exception |
|-----------|-----------|-----------|
| **Max participants** | <= 10 | `MaxParticipantsExceededException` |
| **Min participants** | >= 1 (pour confirmation) | `InvalidReservationException` |
| **Statut valide** | EN_ATTENTE → CONFIRMEE → TERMINEE/ANNULEE | `InvalidReservationException` |
| **Réservation confirmée** | Participants non modifiables | `InvalidReservationException` |
| **Montant positif** | > 0 (pour confirmation) | `InvalidReservationException` |
| **RGPD obligatoire** | `true` | `InvalidReservationException` |

### Machine à états

```
┌─────────────┐
│ EN_ATTENTE  │
└──────┬──────┘
       │
       │ confirm()
       ▼
┌─────────────┐
│  CONFIRMEE  │──────────┐
└──────┬──────┘          │
       │                 │ cancel()
       │ complete()      │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  TERMINEE   │   │   ANNULEE   │
└─────────────┘   └─────────────┘
```

---

## Domain Events

### ReservationCreatedEvent

**Localisation:** `src/Domain/Reservation/Event/ReservationCreatedEvent.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Event;

use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Shared\Interface\DomainEventInterface;
use App\Domain\Shared\ValueObject\Email;

final readonly class ReservationCreatedEvent implements DomainEventInterface
{
    public function __construct(
        private ReservationId $reservationId,
        private string $sejourId,
        private Email $contactEmail,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getReservationId(): ReservationId
    {
        return $this->reservationId;
    }

    public function getSejourId(): string
    {
        return $this->sejourId;
    }

    public function getContactEmail(): Email
    {
        return $this->contactEmail;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
```

### ReservationConfirmedEvent

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Event;

use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Shared\Interface\DomainEventInterface;

final readonly class ReservationConfirmedEvent implements DomainEventInterface
{
    public function __construct(
        private ReservationId $reservationId,
        private Money $totalAmount,
        private int $participantCount,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getReservationId(): ReservationId
    {
        return $this->reservationId;
    }

    public function getTotalAmount(): Money
    {
        return $this->totalAmount;
    }

    public function getParticipantCount(): int
    {
        return $this->participantCount;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
```

### ReservationCancelledEvent

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Event;

use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Shared\Interface\DomainEventInterface;

final readonly class ReservationCancelledEvent implements DomainEventInterface
{
    public function __construct(
        private ReservationId $reservationId,
        private string $reason,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getReservationId(): ReservationId
    {
        return $this->reservationId;
    }

    public function getReason(): string
    {
        return $this->reason;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
```

### ParticipantAddedEvent

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Event;

use App\Domain\Reservation\ValueObject\ParticipantId;
use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Shared\Interface\DomainEventInterface;

final readonly class ParticipantAddedEvent implements DomainEventInterface
{
    public function __construct(
        private ReservationId $reservationId,
        private ParticipantId $participantId,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getReservationId(): ReservationId
    {
        return $this->reservationId;
    }

    public function getParticipantId(): ParticipantId
    {
        return $this->participantId;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
```

---

## Factory

**Localisation:** `src/Domain/Reservation/Factory/ReservationFactory.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Factory;

use App\Domain\Reservation\Entity\Participant;
use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Gender;
use App\Domain\Reservation\ValueObject\ParticipantId;
use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\PersonName;
use App\Domain\Shared\ValueObject\PhoneNumber;

final readonly class ReservationFactory
{
    /**
     * Créer une réservation complète avec participants
     *
     * @param array<array{firstName: string, lastName: string, birthDate: string, gender: string}> $participantsData
     */
    public function createFromData(
        string $sejourId,
        string $contactEmail,
        string $contactPhone,
        string $contactName,
        array $participantsData,
        bool $rgpdAccepted = true
    ): Reservation {
        // Créer la réservation
        $reservation = Reservation::create(
            ReservationId::generate(),
            $sejourId,
            Email::fromString($contactEmail),
            PhoneNumber::fromString($contactPhone),
            $contactName,
            $rgpdAccepted
        );

        // Ajouter les participants
        foreach ($participantsData as $data) {
            $participant = Participant::create(
                ParticipantId::generate(),
                PersonName::fromParts($data['firstName'], $data['lastName']),
                new \DateTimeImmutable($data['birthDate']),
                Gender::from($data['gender'])
            );

            $reservation->addParticipant($participant);
        }

        return $reservation;
    }
}
```

---

## Repository Interface

**Localisation:** `src/Domain/Reservation/Repository/ReservationRepositoryInterface.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Exception\ReservationNotFoundException;
use App\Domain\Reservation\ValueObject\ReservationId;

interface ReservationRepositoryInterface
{
    /**
     * @throws ReservationNotFoundException
     */
    public function findById(ReservationId $id): Reservation;

    /**
     * @return Reservation|null
     */
    public function findByIdOrNull(ReservationId $id): ?Reservation;

    /**
     * Sauvegarder (create ou update)
     */
    public function save(Reservation $reservation): void;

    /**
     * Supprimer
     */
    public function delete(Reservation $reservation): void;

    /**
     * Générer un nouvel ID unique
     */
    public function nextIdentity(): ReservationId;
}
```

---

## Exemple d'utilisation

```php
<?php

// Use Case: CreateReservation

use App\Domain\Reservation\Factory\ReservationFactory;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\Service\ReservationPricingService;

final readonly class CreateReservationUseCase
{
    public function __construct(
        private ReservationFactory $factory,
        private ReservationRepositoryInterface $repository,
        private ReservationPricingService $pricingService,
        private MessageBusInterface $eventBus,
    ) {}

    public function execute(CreateReservationCommand $command): ReservationId
    {
        // 1. Créer la réservation avec participants
        $reservation = $this->factory->createFromData(
            $command->sejourId,
            $command->contactEmail,
            $command->contactPhone,
            $command->contactName,
            $command->participants,
            $command->rgpdAccepted
        );

        // 2. Calculer le prix (Domain Service)
        $totalAmount = $this->pricingService->calculateTotalPrice($reservation);
        $reservation->setTotalAmount($totalAmount);

        // 3. Sauvegarder
        $this->repository->save($reservation);

        // 4. Dispatcher les événements
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventBus->dispatch($event);
        }

        return $reservation->getId();
    }
}
```

---

## Checklist Aggregate

- [ ] **Aggregate Root:** Unique point d'entrée
- [ ] **Invariants:** Validés dans les méthodes
- [ ] **Domain Events:** Enregistrés et dispatchés
- [ ] **Factory:** Pour création complexe
- [ ] **Repository Interface:** Dans Domain layer
- [ ] **Tests unitaires:** 100% couverture
- [ ] **Taille raisonnable:** < 15 entités

---

**Date de création:** 2025-11-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
