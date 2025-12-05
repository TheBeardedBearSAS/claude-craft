# Aggregate-Beispiele - Atoll Tourisme

## Überblick

Dieses Dokument präsentiert eine **vollständige Implementierung** des Aggregats `Reservation` mit seiner Kind-Entity `Participant` für das Projekt Atoll Tourisme.

> **Referenzen:**
> - `.claude/rules/13-ddd-patterns.md` - DDD-Patterns
> - `.claude/rules/02-architecture-clean-ddd.md` - Architektur
> - `.claude/examples/value-object-examples.md` - Verwendete Value Objects

---

## Inhaltsverzeichnis

1. [Prinzipien der Aggregates](#prinzipien-der-aggregates)
2. [Reservation (Aggregate Root)](#reservation-aggregate-root)
3. [Participant (Entity)](#participant-entity)
4. [Geschäftsinvarianten](#geschäftsinvarianten)
5. [Domain Events](#domain-events)
6. [Factory](#factory)
7. [Repository Interface](#repository-interface)

---

## Prinzipien der Aggregates

### Grundlegende Regeln

1. **Aggregate Root:** Einziger Einstiegspunkt für Änderungen
2. **Transaktionale Konsistenz:** Ein Aggregate = Eine Transaktion
3. **Invarianten:** Geschäftsregeln immer eingehalten
4. **Domain Events:** Im Aggregate Root registriert
5. **Größenbeschränkung:** Zu große Aggregates vermeiden (max 10-15 Entities)

### Aggregate Reservation

**Verantwortlichkeiten:**
- Teilnehmerliste verwalten
- Geschäftsregeln validieren (max Teilnehmer, Status, etc.)
- Gesamtbetrag berechnen
- Domain Events registrieren

**Invarianten:**
- Mindestens 1 Teilnehmer
- Maximum 10 Teilnehmer
- Gültiger Status (EN_ATTENTE → CONFIRMEE → TERMINEE oder ANNULEE)
- Bestätigte Reservierung = Teilnehmer nicht änderbar
- Positiver Betrag

---

## Reservation (Aggregate Root)

**Speicherort:** `src/Domain/Reservation/Entity/Reservation.php`

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
 * Verantwortlichkeiten:
 * - Teilnehmer verwalten (Hinzufügen/Entfernen)
 * - Geschäftsinvarianten aufrechterhalten
 * - Domain Events registrieren
 * - Gesamtbetrag berechnen
 */
final class Reservation implements AggregateRootInterface
{
    private const MAX_PARTICIPANTS = 10;

    private ReservationId $id;
    private string $sejourId; // Referenz zu Catalog BC (kein Sejour-Objekt hier)
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
     * Privater Konstruktor: Factory-Methoden verwenden
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
     * Factory-Methode: Neue Reservierung erstellen
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

        // Domain-Event registrieren
        $reservation->recordEvent(new ReservationCreatedEvent(
            $id,
            $sejourId,
            $contactEmail,
            new \DateTimeImmutable()
        ));

        return $reservation;
    }

    /**
     * Teilnehmer zur Reservierung hinzufügen
     *
     * @throws MaxParticipantsExceededException
     * @throws InvalidReservationException
     */
    public function addParticipant(Participant $participant): void
    {
        // ✅ INVARIANTE: Maximum 10 Teilnehmer
        if (count($this->participants) >= self::MAX_PARTICIPANTS) {
            throw new MaxParticipantsExceededException(
                sprintf('Cannot add more than %d participants', self::MAX_PARTICIPANTS)
            );
        }

        // ✅ INVARIANTE: Bestätigte Reservierung kann nicht geändert werden
        if ($this->status->isConfirmed() || $this->status->isCompleted()) {
            throw new InvalidReservationException(
                'Cannot add participant to confirmed or completed reservation'
            );
        }

        // ✅ INVARIANTE: Stornierte Reservierung kann nicht geändert werden
        if ($this->status->isCancelled()) {
            throw new InvalidReservationException(
                'Cannot add participant to cancelled reservation'
            );
        }

        // Teilnehmer dieser Reservierung zuweisen
        $participant->assignToReservation($this);

        // Zur Collection hinzufügen
        $this->participants[] = $participant;

        // Zeitstempel aktualisieren
        $this->updatedAt = new \DateTimeImmutable();

        // Event registrieren
        $this->recordEvent(new ParticipantAddedEvent(
            $this->id,
            $participant->getId(),
            new \DateTimeImmutable()
        ));
    }

    /**
     * Teilnehmer aus Reservierung entfernen
     *
     * @throws ParticipantNotFoundException
     * @throws InvalidReservationException
     */
    public function removeParticipant(ParticipantId $participantId): void
    {
        // ✅ INVARIANTE: Bestätigte Reservierung kann nicht geändert werden
        if ($this->status->isConfirmed() || $this->status->isCompleted()) {
            throw new InvalidReservationException(
                'Cannot remove participant from confirmed or completed reservation'
            );
        }

        // Teilnehmer suchen
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

        // Array neu indizieren
        $this->participants = array_values($this->participants);

        // Zeitstempel aktualisieren
        $this->updatedAt = new \DateTimeImmutable();

        // Event registrieren
        $this->recordEvent(new ParticipantRemovedEvent(
            $this->id,
            $participantId,
            new \DateTimeImmutable()
        ));
    }

    /**
     * Reservierung bestätigen
     *
     * @throws InvalidReservationException
     */
    public function confirm(): void
    {
        // ✅ INVARIANTE: Nur wenn EN_ATTENTE
        if (!$this->status->canBeConfirmed()) {
            throw new InvalidReservationException(
                sprintf('Cannot confirm reservation with status: %s', $this->status->value)
            );
        }

        // ✅ INVARIANTE: Mindestens 1 Teilnehmer
        if (count($this->participants) === 0) {
            throw new InvalidReservationException('At least one participant is required');
        }

        // ✅ INVARIANTE: Positiver Betrag
        if (!$this->totalAmount->isPositive()) {
            throw new InvalidReservationException('Total amount must be positive');
        }

        // Status ändern
        $this->status = ReservationStatus::CONFIRMEE;
        $this->updatedAt = new \DateTimeImmutable();

        // Event registrieren
        $this->recordEvent(new ReservationConfirmedEvent(
            $this->id,
            $this->totalAmount,
            count($this->participants),
            new \DateTimeImmutable()
        ));
    }

    /**
     * Reservierung stornieren
     *
     * @throws InvalidReservationException
     */
    public function cancel(string $reason): void
    {
        // ✅ INVARIANTE: Nur wenn EN_ATTENTE oder CONFIRMEE
        if (!$this->status->canBeCancelled()) {
            throw new InvalidReservationException(
                sprintf('Cannot cancel reservation with status: %s', $this->status->value)
            );
        }

        if (empty($reason)) {
            throw new InvalidReservationException('Cancellation reason is required');
        }

        // Status ändern
        $this->status = ReservationStatus::ANNULEE;
        $this->updatedAt = new \DateTimeImmutable();

        // Event registrieren
        $this->recordEvent(new ReservationCancelledEvent(
            $this->id,
            $reason,
            new \DateTimeImmutable()
        ));
    }

    /**
     * Als abgeschlossen markieren (nach der Reise)
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
     * Gesamtbetrag festlegen (berechnet durch ReservationPricingService)
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
     * Newsletter-Präferenzen festlegen
     */
    public function setNewsletterAccepted(bool $accepted): void
    {
        $this->newsletterAccepted = $accepted;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Kommentare hinzufügen
     */
    public function setComments(?string $comments): void
    {
        $this->comments = $comments;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Prüfen ob Reservierung gültig ist
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
     * Domain-Events abrufen und leeren (für Dispatch)
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
     * Teilnehmer nach ID finden
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

**Speicherort:** `src/Domain/Reservation/Entity/Participant.php`

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
 * Participant Entity (Teil des Reservation-Aggregats)
 *
 * Verantwortlichkeiten:
 * - Teilnehmerinformationen speichern
 * - Alter berechnen
 * - Kategorie bestimmen (Baby/Kind/Erwachsener)
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

    /** @var Reservation|null Referenz zum Aggregate Root */
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
     * Factory-Methode
     */
    public static function create(
        ParticipantId $id,
        PersonName $name,
        \DateTimeImmutable $birthDate,
        Gender $gender
    ): self {
        // Validierung: kein Datum in der Zukunft
        if ($birthDate > new \DateTimeImmutable()) {
            throw new \InvalidArgumentException('Birth date cannot be in the future');
        }

        // Validierung: Maximalalter 120 Jahre
        $age = self::calculateAge($birthDate);
        if ($age > 120) {
            throw new \InvalidArgumentException('Invalid birth date (age > 120)');
        }

        return new self($id, $name, $birthDate, $gender);
    }

    /**
     * Einer Reservierung zuweisen (aufgerufen von Reservation::addParticipant)
     */
    public function assignToReservation(Reservation $reservation): void
    {
        $this->reservation = $reservation;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Medizinische Informationen festlegen (verschlüsselt in Infrastructure)
     */
    public function setMedicalInfo(MedicalInfo $medicalInfo): void
    {
        $this->medicalInfo = $medicalInfo;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Notfallkontakt festlegen
     */
    public function setEmergencyContact(EmergencyContact $contact): void
    {
        $this->emergencyContact = $contact;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Berechtigungen festlegen
     */
    public function setAuthorizations(bool $photo, bool $exit): void
    {
        $this->photoAuthorization = $photo;
        $this->exitAuthorization = $exit;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Aktuelles Alter berechnen
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
     * Ist ein Baby (< 3 Jahre) - Kostenlos
     */
    public function isInfant(): bool
    {
        return $this->getAge() < 3;
    }

    /**
     * Ist ein Kind (< 18 Jahre) - 50% Ermäßigung
     */
    public function isChild(): bool
    {
        return $this->getAge() < 18;
    }

    /**
     * Ist ein Erwachsener (>= 18 Jahre) - Voller Preis
     */
    public function isAdult(): bool
    {
        return $this->getAge() >= 18;
    }

    /**
     * Kategorie für Preisberechnung
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

## Geschäftsinvarianten

### Reservation-Invarianten

| Invariante | Validierung | Exception |
|-----------|-----------|-----------|
| **Max Teilnehmer** | <= 10 | `MaxParticipantsExceededException` |
| **Min Teilnehmer** | >= 1 (zur Bestätigung) | `InvalidReservationException` |
| **Gültiger Status** | EN_ATTENTE → CONFIRMEE → TERMINEE/ANNULEE | `InvalidReservationException` |
| **Bestätigte Reservierung** | Teilnehmer nicht änderbar | `InvalidReservationException` |
| **Positiver Betrag** | > 0 (zur Bestätigung) | `InvalidReservationException` |
| **DSGVO erforderlich** | `true` | `InvalidReservationException` |

### Zustandsautomat

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

**Speicherort:** `src/Domain/Reservation/Event/ReservationCreatedEvent.php`

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

**Speicherort:** `src/Domain/Reservation/Factory/ReservationFactory.php`

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
     * Vollständige Reservierung mit Teilnehmern erstellen
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
        // Reservierung erstellen
        $reservation = Reservation::create(
            ReservationId::generate(),
            $sejourId,
            Email::fromString($contactEmail),
            PhoneNumber::fromString($contactPhone),
            $contactName,
            $rgpdAccepted
        );

        // Teilnehmer hinzufügen
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

**Speicherort:** `src/Domain/Reservation/Repository/ReservationRepositoryInterface.php`

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
     * Speichern (create oder update)
     */
    public function save(Reservation $reservation): void;

    /**
     * Löschen
     */
    public function delete(Reservation $reservation): void;

    /**
     * Neue eindeutige ID generieren
     */
    public function nextIdentity(): ReservationId;
}
```

---

## Verwendungsbeispiel

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
        // 1. Reservierung mit Teilnehmern erstellen
        $reservation = $this->factory->createFromData(
            $command->sejourId,
            $command->contactEmail,
            $command->contactPhone,
            $command->contactName,
            $command->participants,
            $command->rgpdAccepted
        );

        // 2. Preis berechnen (Domain Service)
        $totalAmount = $this->pricingService->calculateTotalPrice($reservation);
        $reservation->setTotalAmount($totalAmount);

        // 3. Speichern
        $this->repository->save($reservation);

        // 4. Events dispatchen
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventBus->dispatch($event);
        }

        return $reservation->getId();
    }
}
```

---

## Aggregate-Checkliste

- [ ] **Aggregate Root:** Einziger Einstiegspunkt
- [ ] **Invarianten:** In Methoden validiert
- [ ] **Domain Events:** Registriert und dispatched
- [ ] **Factory:** Für komplexe Erstellung
- [ ] **Repository Interface:** In Domain-Layer
- [ ] **Unit-Tests:** 100% Abdeckung
- [ ] **Angemessene Größe:** < 15 Entities

---

**Erstellungsdatum:** 2025-11-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
