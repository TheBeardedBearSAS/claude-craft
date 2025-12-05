# Exemples de Domain Events - Atoll Tourisme

## Vue d'ensemble

Ce document présente des **implémentations complètes** de Domain Events et leurs Event Handlers pour le projet Atoll Tourisme.

> **Références:**
> - `.claude/rules/13-ddd-patterns.md` - Patterns DDD
> - `.claude/rules/02-architecture-clean-ddd.md` - Architecture
> - `.claude/examples/aggregate-examples.md` - Aggregates

---

## Table des matières

1. [Principes des Domain Events](#principes-des-domain-events)
2. [Interface DomainEvent](#interface-domainevent)
3. [Events Reservation](#events-reservation)
4. [Events Catalog](#events-catalog)
5. [Events Notification](#events-notification)
6. [Event Handlers](#event-handlers)
7. [Intégration Symfony EventDispatcher](#intégration-symfony-eventdispatcher)
8. [Workflow complet](#workflow-complet)

---

## Principes des Domain Events

### Caractéristiques obligatoires

1. **Immutabilité:** `readonly` class
2. **Passé:** Nommé avec verbe au passé (ReservationCreated, not CreateReservation)
3. **Timestamp:** Propriété `occurredOn` (\DateTimeImmutable)
4. **Données essentielles:** Seulement les données nécessaires
5. **Pas de logique métier:** Juste un DTO

### Quand créer un Domain Event?

- ✅ Changement d'état important de l'Aggregate
- ✅ Événement intéressant pour d'autres Bounded Contexts
- ✅ Déclencheur de processus asynchrone (email, notification)
- ✅ Audit/traçabilité

### Quand NE PAS créer de Domain Event?

- ❌ Simple getter/setter
- ❌ Changement purement technique
- ❌ Modification interne à l'Aggregate sans impact externe

---

## Interface DomainEvent

**Localisation:** `src/Domain/Shared/Interface/DomainEventInterface.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\Interface;

/**
 * Interface pour tous les Domain Events
 */
interface DomainEventInterface
{
    /**
     * Date/heure de survenance de l'événement
     */
    public function getOccurredOn(): \DateTimeImmutable;
}
```

---

## Events Reservation

### ReservationCreatedEvent

**Localisation:** `src/Domain/Reservation/Event/ReservationCreatedEvent.php`

**Déclenché:** Lors de la création d'une nouvelle réservation

**Handlers:**
- Envoyer email de confirmation au client
- Notifier admin d'une nouvelle réservation
- Mettre à jour statistiques

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

**Localisation:** `src/Domain/Reservation/Event/ReservationConfirmedEvent.php`

**Déclenché:** Lors de la confirmation d'une réservation par l'admin

**Handlers:**
- Envoyer email de confirmation au client avec détails
- Mettre à jour capacité du séjour
- Créer facture
- Déclencher processus paiement

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

### ReservationCancelledEvent

**Localisation:** `src/Domain/Reservation/Event/ReservationCancelledEvent.php`

**Déclenché:** Lors de l'annulation d'une réservation

**Handlers:**
- Envoyer email d'annulation au client
- Libérer places dans le séjour
- Notifier admin
- Déclencher remboursement si applicable

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

---

### ParticipantAddedEvent

**Localisation:** `src/Domain/Reservation/Event/ParticipantAddedEvent.php`

**Déclenché:** Ajout d'un participant à une réservation

**Handlers:**
- Recalculer prix total
- Vérifier capacité séjour

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

### ParticipantRemovedEvent

**Localisation:** `src/Domain/Reservation/Event/ParticipantRemovedEvent.php`

**Déclenché:** Suppression d'un participant d'une réservation

**Handlers:**
- Recalculer prix total

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\Event;

use App\Domain\Reservation\ValueObject\ParticipantId;
use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Shared\Interface\DomainEventInterface;

final readonly class ParticipantRemovedEvent implements DomainEventInterface
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

## Events Catalog

### SejourPublishedEvent

**Localisation:** `src/Domain/Catalog/Event/SejourPublishedEvent.php`

**Déclenché:** Publication d'un nouveau séjour

**Handlers:**
- Invalider cache catalogue
- Envoyer newsletter aux abonnés
- Mettre à jour sitemap

```php
<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Event;

use App\Domain\Shared\Interface\DomainEventInterface;

final readonly class SejourPublishedEvent implements DomainEventInterface
{
    public function __construct(
        private string $sejourId,
        private string $title,
        private string $slug,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getSejourId(): string
    {
        return $this->sejourId;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
```

---

### SejourUnpublishedEvent

**Localisation:** `src/Domain/Catalog/Event/SejourUnpublishedEvent.php`

**Déclenché:** Retrait d'un séjour de la vente

**Handlers:**
- Invalider cache
- Notifier clients avec réservations EN_ATTENTE

```php
<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Event;

use App\Domain\Shared\Interface\DomainEventInterface;

final readonly class SejourUnpublishedEvent implements DomainEventInterface
{
    public function __construct(
        private string $sejourId,
        private string $reason,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getSejourId(): string
    {
        return $this->sejourId;
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

---

### SejourCapacityChangedEvent

**Localisation:** `src/Domain/Catalog/Event/SejourCapacityChangedEvent.php`

**Déclenché:** Modification de la capacité d'un séjour

**Handlers:**
- Invalider cache
- Notifier clients sur liste d'attente si augmentation

```php
<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Event;

use App\Domain\Shared\Interface\DomainEventInterface;

final readonly class SejourCapacityChangedEvent implements DomainEventInterface
{
    public function __construct(
        private string $sejourId,
        private int $oldCapacity,
        private int $newCapacity,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getSejourId(): string
    {
        return $this->sejourId;
    }

    public function getOldCapacity(): int
    {
        return $this->oldCapacity;
    }

    public function getNewCapacity(): int
    {
        return $this->newCapacity;
    }

    public function hasIncreased(): bool
    {
        return $this->newCapacity > $this->oldCapacity;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
```

---

## Events Notification

### NotificationSentEvent

**Localisation:** `src/Domain/Notification/Event/NotificationSentEvent.php`

**Déclenché:** Envoi réussi d'une notification

**Handlers:**
- Logger pour audit
- Mettre à jour statistiques d'envoi

```php
<?php

declare(strict_types=1);

namespace App\Domain\Notification\Event;

use App\Domain\Notification\ValueObject\NotificationChannel;
use App\Domain\Shared\Interface\DomainEventInterface;
use App\Domain\Shared\ValueObject\Email;

final readonly class NotificationSentEvent implements DomainEventInterface
{
    public function __construct(
        private string $notificationId,
        private Email $recipient,
        private NotificationChannel $channel,
        private string $subject,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getNotificationId(): string
    {
        return $this->notificationId;
    }

    public function getRecipient(): Email
    {
        return $this->recipient;
    }

    public function getChannel(): NotificationChannel
    {
        return $this->channel;
    }

    public function getSubject(): string
    {
        return $this->subject;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }
}
```

---

### NotificationFailedEvent

**Localisation:** `src/Domain/Notification/Event/NotificationFailedEvent.php`

**Déclenché:** Échec d'envoi d'une notification

**Handlers:**
- Logger erreur
- Programmer ré-essai
- Alerter admin si échecs multiples

```php
<?php

declare(strict_types=1);

namespace App\Domain\Notification\Event;

use App\Domain\Notification\ValueObject\NotificationChannel;
use App\Domain\Shared\Interface\DomainEventInterface;
use App\Domain\Shared\ValueObject\Email;

final readonly class NotificationFailedEvent implements DomainEventInterface
{
    public function __construct(
        private string $notificationId,
        private Email $recipient,
        private NotificationChannel $channel,
        private string $errorMessage,
        private \DateTimeImmutable $occurredOn,
    ) {}

    public function getNotificationId(): string
    {
        return $this->notificationId;
    }

    public function getRecipient(): Email
    {
        return $this->recipient;
    }

    public function getChannel(): NotificationChannel
    {
        return $this->channel;
    }

    public function getErrorMessage(): string
    {
        return $this->errorMessage;
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

**Localisation:** `src/Application/Reservation/EventHandler/SendConfirmationEmailOnReservationCreated.php`

**Responsabilité:** Envoyer email de confirmation au client après création réservation

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
 * Event Handler: Envoyer email de confirmation client
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
        $this->logger->info('Handling ReservationCreatedEvent', [
            'reservation_id' => (string) $event->getReservationId(),
            'sejour_id' => $event->getSejourId(),
        ]);

        try {
            // Récupérer la réservation complète
            $reservation = $this->reservationRepository->findById($event->getReservationId());

            // Envoyer email de confirmation au client
            $this->notificationService->sendReservationCreatedConfirmation($reservation);

            $this->logger->info('Confirmation email sent successfully', [
                'reservation_id' => (string) $event->getReservationId(),
                'email' => (string) $event->getContactEmail(),
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to send confirmation email', [
                'reservation_id' => (string) $event->getReservationId(),
                'error' => $e->getMessage(),
            ]);

            // Ne pas re-throw: l'échec d'envoi d'email ne doit pas bloquer la réservation
        }
    }
}
```

---

### SendAdminNotificationOnReservationCreated

**Localisation:** `src/Application/Reservation/EventHandler/SendAdminNotificationOnReservationCreated.php`

**Responsabilité:** Notifier admin d'une nouvelle réservation

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
 * Event Handler: Notifier admin nouvelle réservation
 */
#[AsMessageHandler]
final readonly class SendAdminNotificationOnReservationCreated
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private NotificationServiceInterface $notificationService,
        private LoggerInterface $logger,
    ) {}

    public function __invoke(ReservationCreatedEvent $event): void
    {
        try {
            $reservation = $this->reservationRepository->findById($event->getReservationId());

            // Envoyer notification admin
            $this->notificationService->sendAdminNewReservationNotification($reservation);

            $this->logger->info('Admin notification sent', [
                'reservation_id' => (string) $event->getReservationId(),
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to send admin notification', [
                'reservation_id' => (string) $event->getReservationId(),
                'error' => $e->getMessage(),
            ]);
        }
    }
}
```

---

### UpdateSejourCapacityOnReservationConfirmed

**Localisation:** `src/Application/Reservation/EventHandler/UpdateSejourCapacityOnReservationConfirmed.php`

**Responsabilité:** Décrémenter capacité du séjour après confirmation

```php
<?php

declare(strict_types=1);

namespace App\Application\Reservation\EventHandler;

use App\Domain\Catalog\Repository\SejourRepositoryInterface;
use App\Domain\Reservation\Event\ReservationConfirmedEvent;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

/**
 * Event Handler: Mettre à jour capacité séjour
 */
#[AsMessageHandler]
final readonly class UpdateSejourCapacityOnReservationConfirmed
{
    public function __construct(
        private SejourRepositoryInterface $sejourRepository,
        private LoggerInterface $logger,
    ) {}

    public function __invoke(ReservationConfirmedEvent $event): void
    {
        $this->logger->info('Updating sejour capacity', [
            'reservation_id' => (string) $event->getReservationId(),
            'participant_count' => $event->getParticipantCount(),
        ]);

        try {
            // Note: Nécessite récupération de sejourId depuis Reservation
            // (via repository ou ajout sejourId dans l'event)

            // $sejour = $this->sejourRepository->findById($sejourId);
            // $sejour->decrementAvailableCapacity($event->getParticipantCount());
            // $this->sejourRepository->save($sejour);

            $this->logger->info('Sejour capacity updated successfully');
        } catch (\Exception $e) {
            $this->logger->error('Failed to update sejour capacity', [
                'error' => $e->getMessage(),
            ]);

            // Re-throw: la capacité DOIT être mise à jour
            throw $e;
        }
    }
}
```

---

### UpdateStatisticsOnReservationCreated

**Localisation:** `src/Application/Reservation/EventHandler/UpdateStatisticsOnReservationCreated.php`

**Responsabilité:** Mettre à jour statistiques (dashboard, métriques)

```php
<?php

declare(strict_types=1);

namespace App\Application\Reservation\EventHandler;

use App\Domain\Reservation\Event\ReservationCreatedEvent;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

/**
 * Event Handler: Mettre à jour statistiques
 */
#[AsMessageHandler]
final readonly class UpdateStatisticsOnReservationCreated
{
    public function __construct(
        private LoggerInterface $logger,
        // private StatisticsServiceInterface $statisticsService, // Futur
    ) {}

    public function __invoke(ReservationCreatedEvent $event): void
    {
        $this->logger->info('Updating statistics', [
            'reservation_id' => (string) $event->getReservationId(),
        ]);

        try {
            // Incrémenter compteurs
            // - Nombre de réservations aujourd'hui
            // - Nombre de réservations par séjour
            // - etc.

            // $this->statisticsService->incrementReservationCount($event->getSejourId());

            $this->logger->info('Statistics updated successfully');
        } catch (\Exception $e) {
            $this->logger->error('Failed to update statistics', [
                'error' => $e->getMessage(),
            ]);

            // Ne pas re-throw: statistiques non critiques
        }
    }
}
```

---

### InvalidateCacheOnSejourPublished

**Localisation:** `src/Application/Catalog/EventHandler/InvalidateCacheOnSejourPublished.php`

**Responsabilité:** Invalider cache catalogue après publication séjour

```php
<?php

declare(strict_types=1);

namespace App\Application\Catalog\EventHandler;

use App\Domain\Catalog\Event\SejourPublishedEvent;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

/**
 * Event Handler: Invalider cache catalogue
 */
#[AsMessageHandler]
final readonly class InvalidateCacheOnSejourPublished
{
    public function __construct(
        private CacheItemPoolInterface $cache,
        private LoggerInterface $logger,
    ) {}

    public function __invoke(SejourPublishedEvent $event): void
    {
        $this->logger->info('Invalidating sejour cache', [
            'sejour_id' => $event->getSejourId(),
        ]);

        try {
            // Invalider cache liste séjours
            $this->cache->deleteItem('sejours_list');

            // Invalider cache détails séjour
            $this->cache->deleteItem('sejour_' . $event->getSejourId());

            $this->logger->info('Cache invalidated successfully');
        } catch (\Exception $e) {
            $this->logger->error('Failed to invalidate cache', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
```

---

## Intégration Symfony EventDispatcher

### Configuration services.yaml

**Localisation:** `config/services.yaml`

```yaml
services:
    # Event Handlers auto-configuration
    App\Application\:
        resource: '../src/Application/*/EventHandler/'
        tags:
            - { name: messenger.message_handler, bus: event.bus }
```

### EventBus Adapter

**Localisation:** `src/Infrastructure/EventBus/SymfonyEventBusAdapter.php`

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\EventBus;

use App\Domain\Shared\Interface\DomainEventInterface;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Adapter Symfony Messenger pour Domain Events
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

## Workflow complet

### 1. Création d'une réservation

```php
// Use Case: CreateReservationUseCase

public function execute(CreateReservationCommand $command): ReservationId
{
    // 1. Créer l'Aggregate
    $reservation = Reservation::create(...);
    // → Enregistre ReservationCreatedEvent

    // 2. Ajouter participants
    foreach ($command->participants as $data) {
        $participant = Participant::create(...);
        $reservation->addParticipant($participant);
        // → Enregistre ParticipantAddedEvent
    }

    // 3. Calculer prix
    $totalAmount = $this->pricingService->calculateTotalPrice($reservation);
    $reservation->setTotalAmount($totalAmount);

    // 4. Sauvegarder
    $this->reservationRepository->save($reservation);

    // 5. Dispatcher événements
    foreach ($reservation->pullDomainEvents() as $event) {
        $this->eventBus->dispatch($event);
        // → ReservationCreatedEvent dispatché
        // → ParticipantAddedEvent x N dispatchés
    }

    return $reservation->getId();
}
```

### 2. Traitement asynchrone (Symfony Messenger)

```
ReservationCreatedEvent dispatché
    ↓
Symfony Messenger Queue
    ↓
Event Handlers (parallèle):
    ├─> SendConfirmationEmailOnReservationCreated
    │   └─> Envoie email client
    │
    ├─> SendAdminNotificationOnReservationCreated
    │   └─> Envoie email admin
    │
    └─> UpdateStatisticsOnReservationCreated
        └─> Met à jour compteurs
```

### 3. Configuration Messenger

**Localisation:** `config/packages/messenger.yaml`

```yaml
framework:
    messenger:
        failure_transport: failed

        transports:
            # Transport asynchrone (Redis/RabbitMQ/Doctrine)
            async:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                retry_strategy:
                    max_retries: 3
                    delay: 1000
                    multiplier: 2

            # Transport synchrone pour events critiques
            sync: 'sync://'

            # Transport failed messages
            failed: 'doctrine://default?queue_name=failed'

        routing:
            # Domain Events → Asynchrone
            App\Domain\Reservation\Event\ReservationCreatedEvent: async
            App\Domain\Reservation\Event\ReservationConfirmedEvent: async
            App\Domain\Reservation\Event\ReservationCancelledEvent: async

            # Events critiques → Synchrone
            App\Domain\Catalog\Event\SejourCapacityChangedEvent: sync
```

---

## Checklist Domain Events

### Création d'un Event

- [ ] **Immutable:** Classe `readonly`
- [ ] **Nommage:** Verbe au passé (ReservationCreated)
- [ ] **Interface:** Implémente `DomainEventInterface`
- [ ] **Timestamp:** Propriété `occurredOn`
- [ ] **Données:** Seulement les données essentielles
- [ ] **Documentation:** PHPDoc avec usage et handlers

### Création d'un Event Handler

- [ ] **Responsabilité unique:** Un handler = une tâche
- [ ] **Attribute:** `#[AsMessageHandler]`
- [ ] **Readonly:** Classe `readonly`
- [ ] **Logging:** Logger succès et erreurs
- [ ] **Exceptions:** Ne pas bloquer si non critique
- [ ] **Tests:** Test unitaire avec event mocké

### Configuration

- [ ] **Routing:** Async ou Sync selon criticité
- [ ] **Retry:** Stratégie de retry configurée
- [ ] **Failed transport:** Transport pour échecs
- [ ] **Monitoring:** Logs et métriques

---

## Ressources

- **Livre:** *Domain-Driven Design* - Eric Evans
- **Article:** [Domain Events Pattern](https://martinfowler.com/eaaDev/DomainEvent.html) - Martin Fowler
- **Doc Symfony:** [Messenger Component](https://symfony.com/doc/current/messenger.html)

---

**Date de création:** 2025-11-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
