# Template: Saga / Process Manager

> **Pattern** - Saga pour orchestrer des transactions distribuées
> Référence: `.claude/rules/17-async.md`, `.claude/rules/21-cqrs.md`

## Principe

Un saga orchestre une transaction longue via une séquence d'étapes compensables. Si une étape échoue, les compensations sont exécutées pour revenir à un état cohérent.

---

## Template Symfony Messenger

```php
<?php

declare(strict_types=1);

namespace App\Saga;

use App\Message\[Event1];
use App\Message\[Event2];
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Psr\Log\LoggerInterface;

/**
 * Saga: [NomSaga]
 *
 * Responsabilité: Orchestrer [processus métier]
 *
 * Étapes:
 * 1. [Étape 1]
 * 2. [Étape 2]
 * 3. [Étape 3]
 *
 * Compensations:
 * - Si étape 2 échoue → compenser étape 1
 * - Si étape 3 échoue → compenser étapes 2 et 1
 */
#[AsMessageHandler]
final readonly class [NomSaga]
{
    public function __construct(
        private MessageBusInterface $eventBus,
        private LoggerInterface $logger,
    ) {
    }

    public function __invoke([Event1] $event): void
    {
        try {
            // Étape 1
            $this->step1($event);

            // Étape 2
            $this->step2($event);

            // Étape 3
            $this->step3($event);

            $this->logger->info('[Saga] completed successfully', [
                'saga_id' => $event->getSagaId(),
            ]);

        } catch (\Throwable $e) {
            $this->logger->error('[Saga] failed, compensating', [
                'saga_id' => $event->getSagaId(),
                'error' => $e->getMessage(),
            ]);

            $this->compensate($event);
            throw $e;
        }
    }

    private function step1([Event1] $event): void
    {
        // Logique étape 1
        $this->logger->info('[Saga] step1 completed');
    }

    private function step2([Event1] $event): void
    {
        // Logique étape 2
        $this->logger->info('[Saga] step2 completed');
    }

    private function step3([Event1] $event): void
    {
        // Logique étape 3
        $this->logger->info('[Saga] step3 completed');
    }

    private function compensate([Event1] $event): void
    {
        // Compenser dans l'ordre inverse
        $this->compensateStep3($event);
        $this->compensateStep2($event);
        $this->compensateStep1($event);

        $this->logger->info('[Saga] compensation completed');
    }

    private function compensateStep1([Event1] $event): void
    {
        // Annuler étape 1
    }

    private function compensateStep2([Event1] $event): void
    {
        // Annuler étape 2
    }

    private function compensateStep3([Event1] $event): void
    {
        // Annuler étape 3
    }
}
```

### Exemple: Order Saga

```php
<?php

declare(strict_types=1);

namespace App\Saga;

use App\Message\OrderCreatedEvent;
use App\Service\PaymentService;
use App\Service\InventoryService;
use App\Service\ShippingService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Psr\Log\LoggerInterface;

#[AsMessageHandler]
final readonly class OrderSaga
{
    public function __construct(
        private PaymentService $paymentService,
        private InventoryService $inventoryService,
        private ShippingService $shippingService,
        private LoggerInterface $logger,
    ) {
    }

    public function __invoke(OrderCreatedEvent $event): void
    {
        $orderId = $event->getOrderId();

        try {
            // Étape 1: Réserver le stock
            $this->inventoryService->reserve($orderId);
            $this->logger->info('Inventory reserved', ['order_id' => $orderId]);

            // Étape 2: Traiter le paiement
            $this->paymentService->charge($orderId);
            $this->logger->info('Payment charged', ['order_id' => $orderId]);

            // Étape 3: Créer l'expédition
            $this->shippingService->createShipment($orderId);
            $this->logger->info('Shipment created', ['order_id' => $orderId]);

        } catch (\Throwable $e) {
            $this->logger->error('Order saga failed, compensating', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            // Compenser dans l'ordre inverse
            try {
                $this->shippingService->cancelShipment($orderId);
            } catch (\Throwable) {}

            try {
                $this->paymentService->refund($orderId);
            } catch (\Throwable) {}

            try {
                $this->inventoryService->release($orderId);
            } catch (\Throwable) {}

            throw $e;
        }
    }
}
```

---

## Template Ecotone Framework

```php
<?php

declare(strict_types=1);

namespace App\Saga;

use Ecotone\Modelling\Attribute\Saga;
use Ecotone\Modelling\Attribute\EventHandler;

#[Saga]
final class [NomSaga]
{
    private string $sagaId;
    private array $completedSteps = [];

    #[EventHandler]
    public function start([Event1] $event): void
    {
        $this->sagaId = $event->getSagaId();
        $this->executeStep1($event);
    }

    #[EventHandler]
    public function onStep1Completed([Step1CompletedEvent] $event): void
    {
        $this->completedSteps[] = 'step1';
        $this->executeStep2($event);
    }

    #[EventHandler]
    public function onFailure([FailureEvent] $event): void
    {
        // Compenser les étapes complétées
        foreach (array_reverse($this->completedSteps) as $step) {
            $this->compensate($step);
        }
    }

    private function executeStep1([Event1] $event): void
    {
        // Logique étape 1
    }

    private function executeStep2($event): void
    {
        // Logique étape 2
    }

    private function compensate(string $step): void
    {
        match ($step) {
            'step1' => $this->compensateStep1(),
            'step2' => $this->compensateStep2(),
        };
    }
}
```

## Bonnes pratiques

- **Idempotence**: Chaque étape doit être rejouable
- **Timeout**: Prévoir des timeouts pour chaque étape
- **Compensation**: Toujours compenser dans l'ordre inverse
- **Logging**: Logger chaque étape + compensations
