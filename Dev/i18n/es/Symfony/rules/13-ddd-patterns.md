# Patrones DDD - Atoll Tourisme

## Descripción General

Este documento detalla los **patrones Domain-Driven Design** obligatorios para el proyecto Atoll Tourisme.

> **Referencias:**
> - `02-architecture-clean-ddd.md` - Arquitectura global
> - `04-solid-principles.md` - Principios SOLID
> - `01-symfony-best-practices.md` - Estándares Symfony

---

## Tabla de Contenidos

1. [Aggregates (Agregados)](#aggregates-agregados)
2. [Entities vs Value Objects](#entities-vs-value-objects)
3. [Value Objects](#value-objects)
4. [Domain Events](#domain-events)
5. [Domain Services](#domain-services)
6. [Repositories](#repositories)
7. [Factories](#factories)
8. [Specifications](#specifications)

---

## Aggregates (Agregados)

### Definición

Un **Aggregate** es un cluster de objetos del dominio tratados como una unidad cohesiva para las modificaciones de datos.

**Reglas:**
1. Un Aggregate tiene una **Aggregate Root** (raíz)
2. Las entidades externas solo pueden referenciar el Aggregate Root
3. Las modificaciones pasan SIEMPRE por el Aggregate Root
4. Una transacción modifica UN SOLO Aggregate

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

    // ✅ Colección de entidades hijas (partes del agregado)
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

        // ✅ Evento de dominio
        $reservation->recordEvent(
            new ReservationCreatedEvent($id, $clientEmail)
        );

        return $reservation;
    }

    // ✅ Modificación vía Aggregate Root
    public function addParticipant(Participant $participant): void
    {
        // ✅ Validación de reglas de negocio
        if (count($this->participants) >= 10) {
            throw new InvalidReservationException('Maximum 10 participantes');
        }

        // ✅ El participante pertenece a la reserva
        $participant->assignToReservation($this);

        $this->participants[] = $participant;

        $this->recordEvent(
            new ParticipantAddedEvent($this->id, $participant->getId())
        );
    }

    // ✅ Eliminación vía Aggregate Root
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

    // ✅ Lógica de negocio en el agregado
    public function confirmer(): void
    {
        if ($this->statut === ReservationStatus::ANNULEE) {
            throw new InvalidReservationException('No se puede confirmar una reserva cancelada');
        }

        if (count($this->participants) === 0) {
            throw new InvalidReservationException('Se requiere al menos un participante');
        }

        $this->statut = ReservationStatus::CONFIRMEE;

        $this->recordEvent(new ReservationConfirmedEvent($this->id));
    }

    public function annuler(string $raison): void
    {
        if ($this->statut === ReservationStatus::TERMINEE) {
            throw new InvalidReservationException('No se puede cancelar una reserva completada');
        }

        $this->statut = ReservationStatus::ANNULEE;

        $this->recordEvent(
            new ReservationCancelledEvent($this->id, $raison)
        );
    }

    // ✅ Invariantes del agregado
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

### Entidad hija: Participant

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\ParticipantId;
use App\Domain\Shared\ValueObject\PersonName;

// ✅ Entidad (no Aggregate Root)
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

    // ✅ Asignación vía Aggregate Root
    public function assignToReservation(Reservation $reservation): void
    {
        $this->reservation = $reservation;
    }

    private function setAge(int $age): void
    {
        if ($age < 0 || $age > 120) {
            throw new \InvalidArgumentException('La edad debe estar entre 0 y 120');
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

### Reglas de los Aggregates

1. **Acceso externo solo por Aggregate Root**

```php
// ❌ MALO: Acceso directo al participante
$participant = $participantRepository->find($participantId);
$participant->setAge(25);
$participantRepository->save($participant);

// ✅ BUENO: Modificación vía Aggregate Root
$reservation = $reservationRepository->find($reservationId);
$reservation->updateParticipantAge($participantId, 25);
$reservationRepository->save($reservation);
```

2. **Una transacción = Un aggregate**

```php
// ❌ MALO: Modificar 2 aggregates en una transacción
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
    $this->repository->save($to); // ❌ 2 aggregates modificados
}

// ✅ BUENO: Usar un Domain Event
public function removeParticipant(ParticipantId $id): void
{
    $reservation = $this->repository->find($reservationId);
    $reservation->removeParticipant($participantId);
    $this->repository->save($reservation);

    // Evento para transferencia eventual
    $this->eventBus->dispatch(
        new ParticipantRemovedFromReservationEvent($reservationId, $participantId)
    );
}
```

3. **Tamaño razonable de aggregates**

```php
// ❌ DEMASIADO GRANDE: Aggregate con 1000+ participantes
class Sejour // Aggregate Root
{
    private array $reservations = []; // 100 reservas
    // Cada reserva tiene 10 participantes
    // = ¡1000+ objetos cargados!
}

// ✅ BUENO: Aggregates más pequeños
class Sejour // Aggregate Root
{
    // Referencia solo los IDs
    private array $reservationIds = [];
}

class Reservation // Aggregate Root separado
{
    private SejourId $sejourId; // Referencia por ID
    private array $participants = []; // Máx 10
}
```

---

## Entities vs Value Objects

### Entities (Entidades)

**Definición:** Objeto identificado por su identidad, no sus atributos.

**Características:**
- ✅ Identidad única (ID)
- ✅ Mutable (puede cambiar)
- ✅ Comparable por ID
- ✅ Ciclo de vida

**Ejemplos Atoll Tourisme:**
- `Reservation` (ID único)
- `Participant` (ID único)
- `Sejour` (ID único)

```php
<?php

namespace App\Domain\Reservation\Entity;

// ✅ ENTIDAD: Identidad = ID
final class Reservation
{
    private ReservationId $id; // ✅ Identidad única

    // ✅ Mutable: el estado puede cambiar
    private ReservationStatus $statut;

    public function confirmer(): void
    {
        $this->statut = ReservationStatus::CONFIRMEE;
    }

    // ✅ Igualdad basada en ID
    public function equals(self $other): bool
    {
        return $this->id->equals($other->id);
    }
}
```

### Value Objects (Objetos Valor)

**Definición:** Objeto identificado por sus atributos, no su identidad.

**Características:**
- ✅ Immutable (readonly)
- ✅ Comparable por valor
- ✅ Sin identidad
- ✅ Reemplazable

**Ejemplos Atoll Tourisme:**
- `Money` (monto)
- `Email` (dirección email)
- `DateRange` (período)
- `ReservationId` (identificador)

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ VALUE OBJECT: Identidad = valor
final readonly class Money
{
    private function __construct(
        private int $amountCents,
        private string $currency = 'EUR',
    ) {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('El monto no puede ser negativo');
        }
    }

    public static function fromEuros(float $amount): self
    {
        return new self((int) round($amount * 100));
    }

    // ✅ Immutable: devuelve una NUEVA instancia
    public function add(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amountCents + $other->amountCents);
    }

    public function multiply(float $multiplier): self
    {
        return new self((int) round($this->amountCents * $multiplier));
    }

    // ✅ Igualdad por valor
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
            throw new \InvalidArgumentException('Monedas no coinciden');
        }
    }
}
```

### ¿Cuándo usar qué?

| Criterio | Entity | Value Object |
|----------|--------|--------------|
| **Identidad** | Importante | No importante |
| **Mutabilidad** | Puede cambiar | Immutable |
| **Igualdad** | Por ID | Por valor |
| **Ejemplo** | `Reservation`, `Participant` | `Money`, `Email`, `DateRange` |

```php
// ❌ MALO: Money como entidad
class Money
{
    private int $id; // ❌ No se necesita identidad
    private float $amount;

    public function setAmount(float $amount): void // ❌ Mutable
    {
        $this->amount = $amount;
    }
}

// ✅ BUENO: Money como Value Object
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

### Money (Dinero)

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
            throw new \InvalidArgumentException('El monto no puede ser negativo');
        }

        if (empty($currency)) {
            throw new \InvalidArgumentException('La moneda no puede estar vacía');
        }
    }

    public static function fromEuros(float $amount): self
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('El monto no puede ser negativo');
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
                sprintf('Monedas no coinciden: %s vs %s', $this->currency, $other->currency)
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
                sprintf('Dirección de email inválida: %s', $value)
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

### DateRange (Período)

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
            throw new \InvalidArgumentException('La fecha de inicio debe ser antes de la fecha de fin');
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
            throw new \InvalidArgumentException('Formato UUID inválido');
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

### Definición

Un **Domain Event** representa algo que ha sucedido en el dominio y que interesa a otras partes del sistema.

### Características

- ✅ Immutable
- ✅ Pasado (evento ya producido)
- ✅ Nombrado con verbo en pasado
- ✅ Contiene datos necesarios

### Ejemplo: ReservationConfirmedEvent

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

### Registro y dispatch

```php
<?php

// En el Aggregate Root
final class Reservation
{
    /** @var list<DomainEventInterface> */
    private array $domainEvents = [];

    public function confirmer(): void
    {
        $this->statut = ReservationStatus::CONFIRMEE;

        // ✅ Registra el evento
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

// En el Use Case
final readonly class ConfirmReservationUseCase
{
    public function execute(ConfirmReservationCommand $command): void
    {
        $reservation = $this->repository->findById($command->reservationId);

        $reservation->confirmer();

        $this->repository->save($reservation);

        // ✅ Despacha los eventos
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

### ¿Cuándo usar un Domain Service?

Usar un Domain Service cuando:
1. La lógica no "pertenece" a ninguna entidad específica
2. La operación necesita múltiples aggregates
3. Cálculo complejo que involucra múltiples Value Objects

### Ejemplo: ReservationPricingService

```php
<?php

namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\Pricing\DiscountPolicyInterface;

// ✅ DOMAIN SERVICE: Lógica de negocio que no pertenece a ninguna entidad
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
        // Gratis para bebés (< 3 años)
        if ($participant->isBebe()) {
            return Money::zero();
        }

        // 50% para niños (< 18 años)
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

// ✅ Interface en el dominio
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

### Implementación (Infrastructure)

```php
<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Doctrine\ORM\EntityManagerInterface;

// ✅ Implementación Doctrine en infraestructura
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

### ¿Cuándo usar una Factory?

- Creación compleja de aggregates
- Reconstitución desde persistencia
- Lógica de creación de negocio

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

        // Agregar participantes
        foreach ($participantsData as $data) {
            $participant = Participant::create(
                ParticipantId::generate(),
                PersonName::fromString($data['nom']),
                $data['age']
            );

            $reservation->addParticipant($participant);
        }

        // Calcular precio
        $montant = $this->pricingService->calculateTotalPrice($reservation);
        $reservation->setMontantTotal($montant);

        return $reservation;
    }
}
```

---

## Specifications

### Patrón Specification

Encapsular las reglas de negocio de selección.

```php
<?php

namespace App\Domain\Reservation\Specification;

use App\Domain\Reservation\Entity\Reservation;

interface ReservationSpecificationInterface
{
    public function isSatisfiedBy(Reservation $reservation): bool;
}

// Especificación: Reserva confirmada
final readonly class ConfirmedReservationSpecification implements ReservationSpecificationInterface
{
    public function isSatisfiedBy(Reservation $reservation): bool
    {
        return $reservation->getStatut() === ReservationStatus::CONFIRMEE;
    }
}

// Especificación: Monto alto
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

// Especificación compuesta: AND
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

// Uso
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

- [ ] **Aggregates:** Identificados con Aggregate Roots
- [ ] **Entities:** Tienen identidad (ID Value Object)
- [ ] **Value Objects:** Immutables (readonly)
- [ ] **Domain Events:** Registrados en los aggregates
- [ ] **Domain Services:** Para lógica que no pertenece a ninguna entidad
- [ ] **Repositories:** Interfaces en Domain, implementación en Infrastructure
- [ ] **Factories:** Para creación compleja de aggregates
- [ ] **Specifications:** Para encapsular reglas de selección

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
