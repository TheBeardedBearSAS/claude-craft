# Ejemplos de Domain Events - Atoll Tourisme

## Overview

Este documento presenta **implementaciones completas** de Domain Events y sus Event Handlers para el proyecto Atoll Tourisme.

> **Referencias:**
> - `.claude/rules/13-ddd-patterns.md` - Patrones DDD
> - `.claude/rules/02-architecture-clean-ddd.md` - Arquitectura
> - `.claude/examples/aggregate-examples.md` - Aggregates

---

## Principios de los Domain Events

### Características obligatorias

1. **Inmutabilidad:** clase `readonly`
2. **Pasado:** Nombrado con verbo en pasado (ReservationCreated, no CreateReservation)
3. **Timestamp:** Propiedad `occurredOn` (\DateTimeImmutable)
4. **Datos esenciales:** Solo los datos necesarios
5. **Sin lógica de negocio:** Solo un DTO

### ¿Cuándo crear un Domain Event?

- ✅ Cambio de estado importante del Aggregate
- ✅ Evento interesante para otros Bounded Contexts
- ✅ Disparador de proceso asíncrono (email, notificación)
- ✅ Auditoría/trazabilidad

---

## Interface DomainEvent

**Ubicación:** `src/Domain/Shared/Interface/DomainEventInterface.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\Interface;

/**
 * Interface para todos los Domain Events
 */
interface DomainEventInterface
{
    /**
     * Fecha/hora de ocurrencia del evento
     */
    public function getOccurredOn(): \DateTimeImmutable;
}
```

---

## Events Reservation

### ReservationCreatedEvent

**Ubicación:** `src/Domain/Reservation/Event/ReservationCreatedEvent.php`

**Disparado:** Durante la creación de una nueva reserva

**Handlers:**
- Enviar email de confirmación al cliente
- Notificar admin de una nueva reserva
- Actualizar estadísticas

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

---

### ReservationConfirmedEvent

**Ubicación:** `src/Domain/Reservation/Event/ReservationConfirmedEvent.php`

**Disparado:** Durante la confirmación de una reserva por el admin

**Handlers:**
- Enviar email de confirmación al cliente con detalles
- Actualizar capacidad de la estancia
- Crear factura
- Disparar proceso de pago

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

---

## Event Handlers

### SendConfirmationEmailOnReservationCreated

**Ubicación:** `src/Application/Reservation/EventHandler/SendConfirmationEmailOnReservationCreated.php`

**Responsabilidad:** Enviar email de confirmación al cliente después de la creación de la reserva

```php
<?php

declare(strict_types=1);

namespace App\Application\Reservation\EventHandler;

use App\Domain\Notification\Service\NotificationServiceInterface;
use App\Domain\Reservation\Event\ReservationCreatedEvent;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

/**
 * Event Handler: Enviar email de confirmación del cliente
 */
#[AsMessageHandler]
final readonly class SendConfirmationEmailOnReservationCreated
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private NotificationServiceInterface $notificationService,
        private LoggerInterface $logger,
    ) {}

    public function __invoke(ReservationCreatedEvent $event): void
    {
        $this->logger->info('Manejando ReservationCreatedEvent', [
            'reservation_id' => (string) $event->getReservationId(),
            'sejour_id' => $event->getSejourId(),
        ]);

        try {
            // Recuperar la reserva completa
            $reservation = $this->reservationRepository->findById($event->getReservationId());

            // Enviar email de confirmación al cliente
            $this->notificationService->sendReservationCreatedConfirmation($reservation);

            $this->logger->info('Email de confirmación enviado exitosamente', [
                'reservation_id' => (string) $event->getReservationId(),
                'email' => (string) $event->getContactEmail(),
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Error al enviar email de confirmación', [
                'reservation_id' => (string) $event->getReservationId(),
                'error' => $e->getMessage(),
            ]);

            // No re-lanzar: el fallo del envío de email no debe bloquear la reserva
        }
    }
}
```

---

## Integración Symfony EventDispatcher

### Configuración services.yaml

**Ubicación:** `config/services.yaml`

```yaml
services:
    # Auto-configuración de Event Handlers
    App\Application\:
        resource: '../src/Application/*/EventHandler/'
        tags:
            - { name: messenger.message_handler, bus: event.bus }
```

### EventBus Adapter

**Ubicación:** `src/Infrastructure/EventBus/SymfonyEventBusAdapter.php`

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\EventBus;

use App\Domain\Shared\Interface\DomainEventInterface;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Adaptador Symfony Messenger para Domain Events
 */
final readonly class SymfonyEventBusAdapter
{
    public function __construct(
        private MessageBusInterface $eventBus,
    ) {}

    public function dispatch(DomainEventInterface $event): void
    {
        $this->eventBus->dispatch($event);
    }

    /**
     * @param array<DomainEventInterface> $events
     */
    public function dispatchMultiple(array $events): void
    {
        foreach ($events as $event) {
            $this->dispatch($event);
        }
    }
}
```

---

## Workflow completo

### 1. Creación de una reserva

```php
// Use Case: CreateReservationUseCase

public function execute(CreateReservationCommand $command): ReservationId
{
    // 1. Crear el Aggregate
    $reservation = Reservation::create(...);
    // → Registra ReservationCreatedEvent

    // 2. Agregar participantes
    foreach ($command->participants as $data) {
        $participant = Participant::create(...);
        $reservation->addParticipant($participant);
        // → Registra ParticipantAddedEvent
    }

    // 3. Calcular precio
    $totalAmount = $this->pricingService->calculateTotalPrice($reservation);
    $reservation->setTotalAmount($totalAmount);

    // 4. Guardar
    $this->reservationRepository->save($reservation);

    // 5. Despachar eventos
    foreach ($reservation->pullDomainEvents() as $event) {
        $this->eventBus->dispatch($event);
        // → ReservationCreatedEvent despachado
        // → ParticipantAddedEvent x N despachados
    }

    return $reservation->getId();
}
```

### 2. Procesamiento asíncrono (Symfony Messenger)

```
ReservationCreatedEvent despachado
    ↓
Cola Symfony Messenger
    ↓
Event Handlers (paralelo):
    ├─> SendConfirmationEmailOnReservationCreated
    │   └─> Envía email al cliente
    │
    ├─> SendAdminNotificationOnReservationCreated
    │   └─> Envía email al admin
    │
    └─> UpdateStatisticsOnReservationCreated
        └─> Actualiza contadores
```

---

## Checklist Domain Events

### Creación de un Event

- [ ] **Inmutable:** Clase `readonly`
- [ ] **Nombres:** Verbo en pasado (ReservationCreated)
- [ ] **Interface:** Implementa `DomainEventInterface`
- [ ] **Timestamp:** Propiedad `occurredOn`
- [ ] **Datos:** Solo datos esenciales
- [ ] **Documentación:** PHPDoc con uso y handlers

### Creación de un Event Handler

- [ ] **Responsabilidad única:** Un handler = una tarea
- [ ] **Atributo:** `#[AsMessageHandler]`
- [ ] **Readonly:** Clase `readonly`
- [ ] **Logging:** Registrar éxitos y errores
- [ ] **Excepciones:** No bloquear si no es crítico
- [ ] **Tests:** Test unitario con evento mockeado

---

**Fecha de creación:** 2025-11-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
