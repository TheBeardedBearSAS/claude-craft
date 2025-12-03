# Template: Domain Event (DDD)

> **Pattern DDD** - Événement métier représentant un fait qui s'est produit
> Référence: `.claude/rules/01-architecture-ddd.md`

## Qu'est-ce qu'un Domain Event ?

Un Domain Event est:
- ✅ **Immuable** (readonly class)
- ✅ **Nommé au passé** (ReservationCreated, not CreateReservation)
- ✅ **Porte les données nécessaires** (aggregate ID + contexte)
- ✅ **Horodaté** (occurredOn timestamp)
- ✅ **Publié par l'aggregate root**

**Pourquoi utiliser des Domain Events ?**
- Découplage entre aggregates
- Traçabilité (audit log)
- Communication asynchrone (message bus)
- Event Sourcing (optionnel)

---

## Template PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\Domain\Event;

use Symfony\Component\Uid\Uuid;

/**
 * Domain Event: [NomEvent]
 *
 * Déclenché quand: [Condition de déclenchement]
 *
 * Portée: [Description de ce que représente cet événement]
 *
 * Subscribers potentiels:
 * - [Subscriber 1]: [Action effectuée]
 * - [Subscriber 2]: [Action effectuée]
 */
final readonly class [NomEvent]
{
    private \DateTimeImmutable $occurredOn;

    public function __construct(
        private Uuid $aggregateId,
        // Autres données du contexte...
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
     * Retourne les données de l'événement (pour sérialisation)
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'aggregate_id' => $this->aggregateId->toRfc4122(),
            'occurred_on' => $this->occurredOn->format(\DateTimeInterface::ATOM),
            // Autres champs...
        ];
    }
}
```

---

## Exemples concrets Atoll Tourisme

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
 * Déclenché quand: Une nouvelle réservation est créée
 *
 * Portée: Représente la création initiale d'une réservation
 *
 * Subscribers potentiels:
 * - ReservationNotificationSubscriber: Envoie email de confirmation client
 * - AdminNotificationSubscriber: Notifie l'admin d'une nouvelle réservation
 * - AuditLogSubscriber: Enregistre l'événement dans les logs
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

**Subscriber (Event Handler):**
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
 * Subscriber: Notification client lors de la création d'une réservation
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
        // Récupérer la réservation complète
        $reservation = $this->reservationRepository->find($event->getReservationId());

        if (!$reservation) {
            $this->logger->error('Reservation not found for event', [
                'reservation_id' => $event->getReservationId()->toRfc4122(),
            ]);
            return;
        }

        // Envoyer l'email de confirmation
        $this->mailer->sendConfirmationClient($reservation);

        $this->logger->info('Email de confirmation envoyé', [
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
 * Déclenché quand: Le paiement d'une réservation est confirmé
 *
 * Portée: Représente la validation définitive de la réservation
 *
 * Subscribers potentiels:
 * - ReservationConfirmedMailer: Envoie email de confirmation paiement
 * - SejourCapacityUpdater: Met à jour les places restantes
 * - InvoiceGenerator: Génère la facture PDF
 * - CalendarSynchronizer: Ajoute au calendrier partagé
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
 * Déclenché quand: Une réservation est annulée
 *
 * Portée: Représente l'annulation d'une réservation (client ou admin)
 *
 * Subscribers potentiels:
 * - ReservationCancelledMailer: Envoie email d'annulation
 * - SejourCapacityUpdater: Libère les places réservées
 * - RefundProcessor: Traite le remboursement si applicable
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
 * Déclenché quand: Un participant est ajouté à une réservation
 *
 * Portée: Représente l'ajout d'un participant (impact sur le prix)
 *
 * Subscribers potentiels:
 * - PriceRecalculationSubscriber: Recalcule le prix total
 * - ParticipantDataValidator: Valide les données RGPD
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

## Publication des événements (Event Dispatcher)

### Configuration Symfony

```yaml
# config/services.yaml
services:
    # Event subscribers auto-tagging
    App\Application\EventSubscriber\:
        resource: '../src/Application/EventSubscriber'
        tags: ['kernel.event_subscriber']

    # Event dispatcher
    Symfony\Contracts\EventDispatcher\EventDispatcherInterface: '@event_dispatcher'
```

### Dispatcher dans un service

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

        // Sauvegarder
        $this->reservationRepository->save($reservation, true);

        // Publier les événements de domaine
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventDispatcher->dispatch($event);
        }

        return $reservation;
    }
}
```

### Alternative: Event Listener Doctrine

```php
<?php

namespace App\Infrastructure\EventListener;

use App\Domain\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Events;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

/**
 * Listener Doctrine: Publie automatiquement les domain events après persist
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
        // Publier tous les événements de domaine
        foreach ($reservation->pullDomainEvents() as $domainEvent) {
            $this->eventDispatcher->dispatch($domainEvent);
        }
    }
}
```

---

## Tests des Domain Events

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

- [ ] Classe `final readonly`
- [ ] Nommé au passé (ReservationCreated, not CreateReservation)
- [ ] Propriété `occurredOn` (timestamp)
- [ ] Référence l'aggregate ID (Uuid)
- [ ] Constructeur prend l'entité complète
- [ ] Méthode `toArray()` pour sérialisation
- [ ] Pas de logique métier (juste des données)
- [ ] Documentation du contexte et subscribers potentiels
- [ ] Tests unitaires (création, sérialisation)
- [ ] Tests d'intégration (subscribers)
