# Template: Event Handler / Listener

> **Pattern** - Event-driven architecture pour découplage et réactivité
> Référence: `.claude/rules/17-async.md`, `.claude/rules/21-cqrs.md`

## Principe

Les event handlers réagissent aux événements domaine/application pour déclencher des actions secondaires (notifications, projections, etc.).

---

## Template Symfony Messenger

```php
<?php

declare(strict_types=1);

namespace App\MessageHandler;

use App\Message\[EventName];
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Psr\Log\LoggerInterface;

/**
 * Handler: [NomHandler]
 *
 * Responsabilité: [Description de la responsabilité unique]
 *
 * Déclenché par: [EventName]
 *
 * Use cases:
 * - [Use case 1]
 * - [Use case 2]
 */
#[AsMessageHandler]
final readonly class [NomHandler]
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    public function __invoke([EventName] $event): void
    {
        // 1. Traitement de l'événement
        $this->process($event);

        // 2. Logging
        $this->logger->info('[Action effectuée]', [
            'event_id' => $event->getId(),
        ]);
    }

    private function process([EventName] $event): void
    {
        // Logique métier
    }
}
```

### Exemple: OrderCreatedHandler

```php
<?php

declare(strict_types=1);

namespace App\MessageHandler;

use App\Message\OrderCreatedEvent;
use App\Service\NotificationService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Psr\Log\LoggerInterface;

#[AsMessageHandler]
final readonly class SendOrderConfirmationHandler
{
    public function __construct(
        private NotificationService $notificationService,
        private LoggerInterface $logger,
    ) {
    }

    public function __invoke(OrderCreatedEvent $event): void
    {
        // Envoyer email de confirmation
        $this->notificationService->sendEmail(
            to: $event->getCustomerEmail(),
            subject: 'Commande confirmée',
            template: 'order_confirmation',
            data: [
                'order_id' => $event->getOrderId(),
                'total' => $event->getTotal(),
            ]
        );

        $this->logger->info('Order confirmation sent', [
            'order_id' => $event->getOrderId(),
        ]);
    }
}
```

---

## Template Laravel Events

```php
<?php

namespace App\Listeners;

use App\Events\[EventName];
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener: [NomListener]
 *
 * Responsabilité: [Description de la responsabilité unique]
 *
 * Déclenché par: [EventName]
 *
 * Use cases:
 * - [Use case 1]
 * - [Use case 2]
 */
class [NomListener] implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle([EventName] $event): void
    {
        // 1. Traitement de l'événement
        $this->process($event);

        // 2. Logging
        Log::info('[Action effectuée]', [
            'event_data' => $event->getData(),
        ]);
    }

    private function process([EventName] $event): void
    {
        // Logique métier
    }

    public function failed([EventName] $event, \Throwable $exception): void
    {
        Log::error('Listener failed', [
            'event' => get_class($event),
            'error' => $exception->getMessage(),
        ]);
    }
}
```

### Exemple: OrderCreatedListener

```php
<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Notifications\OrderConfirmation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendOrderConfirmationListener implements ShouldQueue
{
    public function handle(OrderCreated $event): void
    {
        Notification::send(
            $event->order->customer,
            new OrderConfirmation($event->order)
        );
    }
}
```
