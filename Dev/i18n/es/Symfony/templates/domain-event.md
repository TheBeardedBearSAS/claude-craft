# Plantilla: Domain Event (DDD)

> **Patrón DDD** - Evento de negocio que representa un hecho que ha ocurrido
> Referencia: `.claude/rules/01-architecture-ddd.md`

## ¿Qué es un Domain Event?

Un Domain Event es:
- ✅ **Inmutable** (clase readonly)
- ✅ **Nombrado en pasado** (ReservationCreated, no CreateReservation)
- ✅ **Contiene los datos necesarios** (ID del agregado + contexto)
- ✅ **Con marca temporal** (occurredOn timestamp)
- ✅ **Publicado por el aggregate root**

**¿Por qué usar Domain Events?**
- Desacoplamiento entre agregados
- Trazabilidad (audit log)
- Comunicación asíncrona (message bus)
- Event Sourcing (opcional)

---

## Plantilla PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\Domain\Event;

use Symfony\Component\Uid\Uuid;

/**
 * Domain Event: [NombreEvento]
 *
 * Disparado cuando: [Condición de disparo]
 *
 * Alcance: [Descripción de lo que representa este evento]
 *
 * Suscriptores potenciales:
 * - [Suscriptor 1]: [Acción realizada]
 * - [Suscriptor 2]: [Acción realizada]
 */
final readonly class [NombreEvento]
{
    private \DateTimeImmutable $occurredOn;

    public function __construct(
        private Uuid $aggregateId,
        // Otros datos del contexto...
    ) {
        $this->occurredOn = new \DateTimeImmutable();
    }

    public function getAggregateId(): Uuid
    {
        return $this->aggregateId;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }

    /**
     * Devuelve los datos del evento (para serialización)
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'aggregate_id' => $this->aggregateId->toRfc4122(),
            'occurred_on' => $this->occurredOn->format(\DateTimeInterface::ATOM),
            // Otros campos...
        ];
    }
}
```

---

## Ejemplos concretos Atoll Tourisme

### 1. ReservationCreated

```php
<?php

declare(strict_types=1);

namespace App\Domain\Event;

use App\Domain\Entity\Reservation;
use Symfony\Component\Uid\Uuid;

/**
 * Domain Event: ReservationCreated
 *
 * Disparado cuando: Se crea una nueva reserva
 *
 * Alcance: Representa la creación inicial de una reserva
 *
 * Suscriptores potenciales:
 * - ReservationNotificationSubscriber: Envía email de confirmación al cliente
 * - AdminNotificationSubscriber: Notifica al admin de una nueva reserva
 * - AuditLogSubscriber: Registra el evento en los logs
 */
final readonly class ReservationCreated
{
    private Uuid $reservationId;
    private Uuid $sejourId;
    private string $emailContact;
    private int $nbParticipants;
    private \DateTimeImmutable $occurredOn;

    public function __construct(Reservation $reservation)
    {
        $this->reservationId = $reservation->getId();
        $this->sejourId = $reservation->getSejour()->getId();
        $this->emailContact = $reservation->getEmailContact();
        $this->nbParticipants = $reservation->getNbParticipants();
        $this->occurredOn = new \DateTimeImmutable();
    }

    public function getReservationId(): Uuid
    {
        return $this->reservationId;
    }

    public function getSejourId(): Uuid
    {
        return $this->sejourId;
    }

    public function getEmailContact(): string
    {
        return $this->emailContact;
    }

    public function getNbParticipants(): int
    {
        return $this->nbParticipants;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'event_type' => 'reservation.created',
            'reservation_id' => $this->reservationId->toRfc4122(),
            'sejour_id' => $this->sejourId->toRfc4122(),
            'email_contact' => $this->emailContact,
            'nb_participants' => $this->nbParticipants,
            'occurred_on' => $this->occurredOn->format(\DateTimeInterface::ATOM),
        ];
    }
}
```

**Suscriptor (Event Handler):**
```php
<?php

declare(strict_types=1);

namespace App\Application\EventSubscriber;

use App\Domain\Event\ReservationCreated;
use App\Application\Mailer\ReservationMailer;
use App\Domain\Repository\ReservationRepositoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Suscriptor: Notificación al cliente en la creación de una reserva
 */
final readonly class ReservationNotificationSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private ReservationMailer $mailer,
        private LoggerInterface $logger,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ReservationCreated::class => 'onReservationCreated',
        ];
    }

    public function onReservationCreated(ReservationCreated $event): void
    {
        // Recuperar la reserva completa
        $reservation = $this->reservationRepository->find($event->getReservationId());

        if (!$reservation) {
            $this->logger->error('Reservation not found for event', [
                'reservation_id' => $event->getReservationId()->toRfc4122(),
            ]);
            return;
        }

        // Enviar el email de confirmación
        $this->mailer->sendConfirmationClient($reservation);

        $this->logger->info('Email de confirmación enviado', [
            'reservation_id' => $reservation->getId()->toRfc4122(),
            'email' => $event->getEmailContact(),
        ]);
    }
}
```

---

### 2. ReservationConfirmed

```php
<?php

declare(strict_types=1);

namespace App\Domain\Event;

use App\Domain\Entity\Reservation;
use Symfony\Component\Uid\Uuid;

/**
 * Domain Event: ReservationConfirmed
 *
 * Disparado cuando: El pago de una reserva es confirmado
 *
 * Alcance: Representa la validación definitiva de la reserva
 *
 * Suscriptores potenciales:
 * - ReservationConfirmedMailer: Envía email de confirmación de pago
 * - SejourCapacityUpdater: Actualiza las plazas restantes
 * - InvoiceGenerator: Genera la factura PDF
 * - CalendarSynchronizer: Añade al calendario compartido
 */
final readonly class ReservationConfirmed
{
    private Uuid $reservationId;
    private Uuid $sejourId;
    private int $montantTotalCents;
    private \DateTimeImmutable $confirmedAt;
    private \DateTimeImmutable $occurredOn;

    public function __construct(Reservation $reservation)
    {
        $this->reservationId = $reservation->getId();
        $this->sejourId = $reservation->getSejour()->getId();
        $this->montantTotalCents = $reservation->getMontantTotal()->toCents();
        $this->confirmedAt = $reservation->getConfirmedAt() ?? new \DateTimeImmutable();
        $this->occurredOn = new \DateTimeImmutable();
    }

    public function getReservationId(): Uuid
    {
        return $this->reservationId;
    }

    public function getSejourId(): Uuid
    {
        return $this->sejourId;
    }

    public function getMontantTotalCents(): int
    {
        return $this->montantTotalCents;
    }

    public function getConfirmedAt(): \DateTimeImmutable
    {
        return $this->confirmedAt;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'event_type' => 'reservation.confirmed',
            'reservation_id' => $this->reservationId->toRfc4122(),
            'sejour_id' => $this->sejourId->toRfc4122(),
            'montant_total_cents' => $this->montantTotalCents,
            'confirmed_at' => $this->confirmedAt->format(\DateTimeInterface::ATOM),
            'occurred_on' => $this->occurredOn->format(\DateTimeInterface::ATOM),
        ];
    }
}
```

---

### 3. ReservationCancelled

```php
<?php

declare(strict_types=1);

namespace App\Domain\Event;

use App\Domain\Entity\Reservation;
use Symfony\Component\Uid\Uuid;

/**
 * Domain Event: ReservationCancelled
 *
 * Disparado cuando: Se cancela una reserva
 *
 * Alcance: Representa la cancelación de una reserva (cliente o admin)
 *
 * Suscriptores potenciales:
 * - ReservationCancelledMailer: Envía email de cancelación
 * - SejourCapacityUpdater: Libera las plazas reservadas
 * - RefundProcessor: Procesa el reembolso si aplica
 */
final readonly class ReservationCancelled
{
    private Uuid $reservationId;
    private Uuid $sejourId;
    private string $motif;
    private bool $wasConfirmed;
    private \DateTimeImmutable $occurredOn;

    public function __construct(Reservation $reservation, string $motif)
    {
        $this->reservationId = $reservation->getId();
        $this->sejourId = $reservation->getSejour()->getId();
        $this->motif = $motif;
        $this->wasConfirmed = $reservation->isConfirmee();
        $this->occurredOn = new \DateTimeImmutable();
    }

    public function getReservationId(): Uuid
    {
        return $this->reservationId;
    }

    public function getSejourId(): Uuid
    {
        return $this->sejourId;
    }

    public function getMotif(): string
    {
        return $this->motif;
    }

    public function wasConfirmed(): bool
    {
        return $this->wasConfirmed;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'event_type' => 'reservation.cancelled',
            'reservation_id' => $this->reservationId->toRfc4122(),
            'sejour_id' => $this->sejourId->toRfc4122(),
            'motif' => $this->motif,
            'was_confirmed' => $this->wasConfirmed,
            'occurred_on' => $this->occurredOn->format(\DateTimeInterface::ATOM),
        ];
    }
}
```

---

### 4. ParticipantAdded

```php
<?php

declare(strict_types=1);

namespace App\Domain\Event;

use App\Domain\Entity\Reservation;
use App\Domain\Entity\Participant;
use Symfony\Component\Uid\Uuid;

/**
 * Domain Event: ParticipantAdded
 *
 * Disparado cuando: Se añade un participante a una reserva
 *
 * Alcance: Representa la adición de un participante (impacto en el precio)
 *
 * Suscriptores potenciales:
 * - PriceRecalculationSubscriber: Recalcula el precio total
 * - ParticipantDataValidator: Valida los datos RGPD
 */
final readonly class ParticipantAdded
{
    private Uuid $reservationId;
    private Uuid $participantId;
    private string $participantNom;
    private string $participantPrenom;
    private int $numeroOrdre;
    private \DateTimeImmutable $occurredOn;

    public function __construct(Reservation $reservation, Participant $participant)
    {
        $this->reservationId = $reservation->getId();
        $this->participantId = $participant->getId();
        $this->participantNom = $participant->getNom();
        $this->participantPrenom = $participant->getPrenom();
        $this->numeroOrdre = $participant->getNumeroOrdre();
        $this->occurredOn = new \DateTimeImmutable();
    }

    public function getReservationId(): Uuid
    {
        return $this->reservationId;
    }

    public function getParticipantId(): Uuid
    {
        return $this->participantId;
    }

    public function getParticipantNom(): string
    {
        return $this->participantNom;
    }

    public function getParticipantPrenom(): string
    {
        return $this->participantPrenom;
    }

    public function getNumeroOrdre(): int
    {
        return $this->numeroOrdre;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'event_type' => 'participant.added',
            'reservation_id' => $this->reservationId->toRfc4122(),
            'participant_id' => $this->participantId->toRfc4122(),
            'participant_nom' => $this->participantNom,
            'participant_prenom' => $this->participantPrenom,
            'numero_ordre' => $this->numeroOrdre,
            'occurred_on' => $this->occurredOn->format(\DateTimeInterface::ATOM),
        ];
    }
}
```

---

## Publicación de eventos (Event Dispatcher)

### Configuración Symfony

```yaml
# config/services.yaml
services:
    # Auto-tagging de event subscribers
    App\Application\EventSubscriber\:
        resource: '../src/Application/EventSubscriber'
        tags: ['kernel.event_subscriber']

    # Event dispatcher
    Symfony\Contracts\EventDispatcher\EventDispatcherInterface: '@event_dispatcher'
```

### Dispatcher en un servicio

```php
<?php

namespace App\Application\Service;

use App\Domain\Entity\Reservation;
use App\Domain\Repository\ReservationRepositoryInterface;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;
use Doctrine\ORM\EntityManagerInterface;

final readonly class ReservationService
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private EntityManagerInterface $entityManager,
        private EventDispatcherInterface $eventDispatcher,
    ) {
    }

    public function createReservation(array $data): Reservation
    {
        $reservation = new Reservation(...);

        // Guardar
        $this->reservationRepository->save($reservation, true);

        // Publicar los eventos de dominio
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventDispatcher->dispatch($event);
        }

        return $reservation;
    }
}
```

### Alternativa: Event Listener Doctrine

```php
<?php

namespace App\Infrastructure\EventListener;

use App\Domain\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Events;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

/**
 * Listener Doctrine: Publica automáticamente los domain events después del persist
 */
#[AsEntityListener(event: Events::postPersist, entity: Reservation::class)]
final readonly class ReservationDomainEventPublisher
{
    public function __construct(
        private EventDispatcherInterface $eventDispatcher
    ) {
    }

    public function postPersist(Reservation $reservation, PostPersistEventArgs $event): void
    {
        // Publicar todos los eventos de dominio
        foreach ($reservation->pullDomainEvents() as $domainEvent) {
            $this->eventDispatcher->dispatch($domainEvent);
        }
    }
}
```

---

## Tests de los Domain Events

```php
<?php

namespace App\Tests\Unit\Domain\Event;

use App\Domain\Entity\Reservation;
use App\Domain\Entity\Sejour;
use App\Domain\Event\ReservationCreated;
use PHPUnit\Framework\TestCase;

class ReservationCreatedTest extends TestCase
{
    /** @test */
    public function it_creates_event_from_reservation(): void
    {
        // ARRANGE
        $sejour = new Sejour();
        $reservation = new Reservation($sejour, 'client@example.com', '0612345678');

        // ACT
        $event = new ReservationCreated($reservation);

        // ASSERT
        $this->assertEquals($reservation->getId(), $event->getReservationId());
        $this->assertEquals($sejour->getId(), $event->getSejourId());
        $this->assertEquals('client@example.com', $event->getEmailContact());
        $this->assertInstanceOf(\DateTimeImmutable::class, $event->getOccurredOn());
    }

    /** @test */
    public function it_serializes_to_array(): void
    {
        // ARRANGE
        $sejour = new Sejour();
        $reservation = new Reservation($sejour, 'client@example.com', '0612345678');
        $event = new ReservationCreated($reservation);

        // ACT
        $array = $event->toArray();

        // ASSERT
        $this->assertArrayHasKey('event_type', $array);
        $this->assertEquals('reservation.created', $array['event_type']);
        $this->assertArrayHasKey('reservation_id', $array);
        $this->assertArrayHasKey('occurred_on', $array);
    }
}
```

```php
<?php

namespace App\Tests\Integration\EventSubscriber;

use App\Domain\Entity\Reservation;
use App\Domain\Event\ReservationCreated;
use App\Application\EventSubscriber\ReservationNotificationSubscriber;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ReservationNotificationSubscriberTest extends KernelTestCase
{
    /** @test */
    public function it_sends_email_on_reservation_created(): void
    {
        // ARRANGE
        self::bootKernel();
        $container = self::getContainer();

        $reservation = $this->createReservation();
        $event = new ReservationCreated($reservation);

        // ACT
        $container->get('event_dispatcher')->dispatch($event);

        // ASSERT
        $this->assertEmailCount(1);
        $this->assertEmailAddressContains(
            $this->getMailerMessage(0),
            'to',
            'client@example.com'
        );
    }
}
```

---

## Checklist Domain Event

- [ ] Clase `final readonly`
- [ ] Nombrado en pasado (ReservationCreated, no CreateReservation)
- [ ] Propiedad `occurredOn` (timestamp)
- [ ] Referencia al ID del agregado (Uuid)
- [ ] Constructor toma la entidad completa
- [ ] Método `toArray()` para serialización
- [ ] Sin lógica de negocio (solo datos)
- [ ] Documentación del contexto y suscriptores potenciales
- [ ] Tests unitarios (creación, serialización)
- [ ] Tests de integración (suscriptores)
