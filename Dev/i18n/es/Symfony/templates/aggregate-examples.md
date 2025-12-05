# Ejemplos de Aggregates - Atoll Tourisme

## Overview

Este documento presenta una **implementación completa** del Aggregate `Reservation` con su entidad hija `Participant` para el proyecto Atoll Tourisme.

> **Referencias:**
> - `.claude/rules/13-ddd-patterns.md` - Patrones DDD
> - `.claude/rules/02-architecture-clean-ddd.md` - Arquitectura
> - `.claude/examples/value-object-examples.md` - Value Objects utilizados

---

## Tabla de contenidos

1. [Principios de los Aggregates](#principios-de-los-aggregates)
2. [Reservation (Aggregate Root)](#reservation-aggregate-root)
3. [Participant (Entity)](#participant-entity)
4. [Invariantes de negocio](#invariantes-de-negocio)
5. [Domain Events](#domain-events)
6. [Factory](#factory)
7. [Repository Interface](#repository-interface)

---

## Principios de los Aggregates

### Reglas fundamentales

1. **Aggregate Root:** Punto de entrada único para modificaciones
2. **Consistencia transaccional:** Un Aggregate = Una transacción
3. **Invariantes:** Reglas de negocio siempre respetadas
4. **Domain Events:** Registrados en el Aggregate Root
5. **Límite de tamaño:** Evitar Aggregates demasiado grandes (máx 10-15 entidades)

### Aggregate Reservation

**Responsabilidades:**
- Gestionar la lista de participantes
- Validar reglas de negocio (máx participantes, estado, etc.)
- Calcular monto total
- Registrar Domain Events

**Invariantes:**
- Al menos 1 participante
- Máximo 10 participantes
- Estado válido (EN_ATTENTE → CONFIRMEE → TERMINEE o ANNULEE)
- Reserva confirmada = participantes no modificables
- Monto positivo

---

## Reservation (Aggregate Root)

**Localización:** `src/Domain/Reservation/Entity/Reservation.php`

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
 * Responsabilidades:
 * - Gestionar los participantes (adición/eliminación)
 * - Mantener los invariantes de negocio
 * - Registrar los Domain Events
 * - Calcular el monto total
 */
final class Reservation implements AggregateRootInterface
{
    private const MAX_PARTICIPANTS = 10;

    private ReservationId $id;
    private string $sejourId; // Referencia hacia Catalog BC (no objeto Sejour aquí)
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
     * Constructor privado: usar factory methods
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
     * Factory method: Crear una nueva reserva
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

        // Registrar evento de dominio
        $reservation->recordEvent(new ReservationCreatedEvent(
            $id,
            $sejourId,
            $contactEmail,
            new \DateTimeImmutable()
        ));

        return $reservation;
    }

    /**
     * Añadir un participante a la reserva
     *
     * @throws MaxParticipantsExceededException
     * @throws InvalidReservationException
     */
    public function addParticipant(Participant $participant): void
    {
        // ✅ INVARIANTE: Máximo 10 participantes
        if (count($this->participants) >= self::MAX_PARTICIPANTS) {
            throw new MaxParticipantsExceededException(
                sprintf('Cannot add more than %d participants', self::MAX_PARTICIPANTS)
            );
        }

        // ✅ INVARIANTE: No puede modificar reserva confirmada
        if ($this->status->isConfirmed() || $this->status->isCompleted()) {
            throw new InvalidReservationException(
                'Cannot add participant to confirmed or completed reservation'
            );
        }

        // ✅ INVARIANTE: No puede añadir si cancelada
        if ($this->status->isCancelled()) {
            throw new InvalidReservationException(
                'Cannot add participant to cancelled reservation'
            );
        }

        // Asignar participante a esta reserva
        $participant->assignToReservation($this);

        // Añadir a la colección
        $this->participants[] = $participant;

        // Actualizar timestamp
        $this->updatedAt = new \DateTimeImmutable();

        // Registrar evento
        $this->recordEvent(new ParticipantAddedEvent(
            $this->id,
            $participant->getId(),
            new \DateTimeImmutable()
        ));
    }

    /**
     * Retirar un participante de la reserva
     *
     * @throws ParticipantNotFoundException
     * @throws InvalidReservationException
     */
    public function removeParticipant(ParticipantId $participantId): void
    {
        // ✅ INVARIANTE: No puede modificar reserva confirmada
        if ($this->status->isConfirmed() || $this->status->isCompleted()) {
            throw new InvalidReservationException(
                'Cannot remove participant from confirmed or completed reservation'
            );
        }

        // Buscar el participante
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

        // Reindexar array
        $this->participants = array_values($this->participants);

        // Actualizar timestamp
        $this->updatedAt = new \DateTimeImmutable();

        // Registrar evento
        $this->recordEvent(new ParticipantRemovedEvent(
            $this->id,
            $participantId,
            new \DateTimeImmutable()
        ));
    }

    /**
     * Confirmar la reserva
     *
     * @throws InvalidReservationException
     */
    public function confirm(): void
    {
        // ✅ INVARIANTE: Solo si EN_ATTENTE
        if (!$this->status->canBeConfirmed()) {
            throw new InvalidReservationException(
                sprintf('Cannot confirm reservation with status: %s', $this->status->value)
            );
        }

        // ✅ INVARIANTE: Al menos 1 participante
        if (count($this->participants) === 0) {
            throw new InvalidReservationException('At least one participant is required');
        }

        // ✅ INVARIANTE: Monto positivo
        if (!$this->totalAmount->isPositive()) {
            throw new InvalidReservationException('Total amount must be positive');
        }

        // Cambiar estado
        $this->status = ReservationStatus::CONFIRMEE;
        $this->updatedAt = new \DateTimeImmutable();

        // Registrar evento
        $this->recordEvent(new ReservationConfirmedEvent(
            $this->id,
            $this->totalAmount,
            count($this->participants),
            new \DateTimeImmutable()
        ));
    }

    /**
     * Cancelar la reserva
     *
     * @throws InvalidReservationException
     */
    public function cancel(string $reason): void
    {
        // ✅ INVARIANTE: Solo si EN_ATTENTE o CONFIRMEE
        if (!$this->status->canBeCancelled()) {
            throw new InvalidReservationException(
                sprintf('Cannot cancel reservation with status: %s', $this->status->value)
            );
        }

        if (empty($reason)) {
            throw new InvalidReservationException('Cancellation reason is required');
        }

        // Cambiar estado
        $this->status = ReservationStatus::ANNULEE;
        $this->updatedAt = new \DateTimeImmutable();

        // Registrar evento
        $this->recordEvent(new ReservationCancelledEvent(
            $this->id,
            $reason,
            new \DateTimeImmutable()
        ));
    }

    /**
     * Marcar como terminada (después de la estancia)
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
     * Definir el monto total (calculado por ReservationPricingService)
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
     * Definir las preferencias de newsletter
     */
    public function setNewsletterAccepted(bool $accepted): void
    {
        $this->newsletterAccepted = $accepted;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Añadir comentarios
     */
    public function setComments(?string $comments): void
    {
        $this->comments = $comments;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Verificar si la reserva es válida
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
     * Recupera y vacía los eventos de dominio (para dispatch)
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
     * Encontrar un participante por ID
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

**Localización:** `src/Domain/Reservation/Entity/Participant.php`

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
 * Participant Entity (parte del Aggregate Reservation)
 *
 * Responsabilidades:
 * - Almacenar información del participante
 * - Calcular la edad
 * - Determinar categoría (bebé/niño/adulto)
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

    /** @var Reservation|null Referencia hacia el Aggregate Root */
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
        // Validación: no fecha en el futuro
        if ($birthDate > new \DateTimeImmutable()) {
            throw new \InvalidArgumentException('Birth date cannot be in the future');
        }

        // Validación: edad máxima 120 años
        $age = self::calculateAge($birthDate);
        if ($age > 120) {
            throw new \InvalidArgumentException('Invalid birth date (age > 120)');
        }

        return new self($id, $name, $birthDate, $gender);
    }

    /**
     * Asignar a una reserva (llamado por Reservation::addParticipant)
     */
    public function assignToReservation(Reservation $reservation): void
    {
        $this->reservation = $reservation;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Definir información médica (cifrada en Infrastructure)
     */
    public function setMedicalInfo(MedicalInfo $medicalInfo): void
    {
        $this->medicalInfo = $medicalInfo;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Definir contacto de emergencia
     */
    public function setEmergencyContact(EmergencyContact $contact): void
    {
        $this->emergencyContact = $contact;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Definir autorizaciones
     */
    public function setAuthorizations(bool $photo, bool $exit): void
    {
        $this->photoAuthorization = $photo;
        $this->exitAuthorization = $exit;
        $this->updatedAt = new \DateTimeImmutable();
    }

    /**
     * Calcular la edad actual
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
     * Es un bebé (< 3 años) - Gratis
     */
    public function isInfant(): bool
    {
        return $this->getAge() < 3;
    }

    /**
     * Es un niño (< 18 años) - Descuento 50%
     */
    public function isChild(): bool
    {
        return $this->getAge() < 18;
    }

    /**
     * Es un adulto (>= 18 años) - Tarifa completa
     */
    public function isAdult(): bool
    {
        return $this->getAge() >= 18;
    }

    /**
     * Categoría para tarificación
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

## Invariantes de negocio

### Invariantes de Reservation

| Invariante | Validación | Excepción |
|-----------|-----------|-----------|
| **Máx participantes** | <= 10 | `MaxParticipantsExceededException` |
| **Mín participantes** | >= 1 (para confirmación) | `InvalidReservationException` |
| **Estado válido** | EN_ATTENTE → CONFIRMEE → TERMINEE/ANNULEE | `InvalidReservationException` |
| **Reserva confirmada** | Participantes no modificables | `InvalidReservationException` |
| **Monto positivo** | > 0 (para confirmación) | `InvalidReservationException` |
| **RGPD obligatorio** | `true` | `InvalidReservationException` |

### Máquina de estados

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

**Localización:** `src/Domain/Reservation/Event/ReservationCreatedEvent.php`

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

**Localización:** `src/Domain/Reservation/Factory/ReservationFactory.php`

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
     * Crear una reserva completa con participantes
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
        // Crear la reserva
        $reservation = Reservation::create(
            ReservationId::generate(),
            $sejourId,
            Email::fromString($contactEmail),
            PhoneNumber::fromString($contactPhone),
            $contactName,
            $rgpdAccepted
        );

        // Añadir los participantes
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

**Localización:** `src/Domain/Reservation/Repository/ReservationRepositoryInterface.php`

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
     * Guardar (crear o actualizar)
     */
    public function save(Reservation $reservation): void;

    /**
     * Eliminar
     */
    public function delete(Reservation $reservation): void;

    /**
     * Generar un nuevo ID único
     */
    public function nextIdentity(): ReservationId;
}
```

---

## Ejemplo de uso

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
        // 1. Crear la reserva con participantes
        $reservation = $this->factory->createFromData(
            $command->sejourId,
            $command->contactEmail,
            $command->contactPhone,
            $command->contactName,
            $command->participants,
            $command->rgpdAccepted
        );

        // 2. Calcular el precio (Domain Service)
        $totalAmount = $this->pricingService->calculateTotalPrice($reservation);
        $reservation->setTotalAmount($totalAmount);

        // 3. Guardar
        $this->repository->save($reservation);

        // 4. Despachar los eventos
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventBus->dispatch($event);
        }

        return $reservation->getId();
    }
}
```

---

## Checklist Aggregate

- [ ] **Aggregate Root:** Punto de entrada único
- [ ] **Invariantes:** Validados en los métodos
- [ ] **Domain Events:** Registrados y despachados
- [ ] **Factory:** Para creación compleja
- [ ] **Repository Interface:** En la capa Domain
- [ ] **Pruebas unitarias:** 100% de cobertura
- [ ] **Tamaño razonable:** < 15 entidades

---

**Fecha de creación:** 2025-11-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
