# Template: CQRS Projection (Read Model)

> **Pattern** - Projection pour transformer les événements en read models
> Référence: `.claude/rules/21-cqrs.md`, `.claude/rules/17-async.md`

## Principe

Une projection écoute les événements et construit/met à jour un read model dénormalisé optimisé pour les requêtes.

---

## Template Doctrine (Symfony)

```php
<?php

declare(strict_types=1);

namespace App\Projection;

use App\Message\[DomainEvent];
use App\ReadModel\[ReadModel];
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Psr\Log\LoggerInterface;

/**
 * Projection: [NomProjection]
 *
 * Responsabilité: Construire le read model [ReadModel]
 *
 * Événements écoutés:
 * - [Event1]
 * - [Event2]
 * - [Event3]
 */
#[AsMessageHandler]
final readonly class [NomProjection]
{
    public function __construct(
        private EntityManagerInterface $em,
        private LoggerInterface $logger,
    ) {
    }

    public function __invoke([DomainEvent] $event): void
    {
        // 1. Récupérer ou créer le read model
        $readModel = $this->em->getRepository([ReadModel]::class)
            ->find($event->getId());

        if (!$readModel) {
            $readModel = new [ReadModel]();
            $readModel->setId($event->getId());
        }

        // 2. Appliquer l'événement
        $this->apply($readModel, $event);

        // 3. Persister
        $this->em->persist($readModel);
        $this->em->flush();

        $this->logger->info('[Projection] updated', [
            'read_model_id' => $readModel->getId(),
            'event' => $event::class,
        ]);
    }

    private function apply([ReadModel] $readModel, [DomainEvent] $event): void
    {
        // Mettre à jour le read model selon l'événement
        match ($event::class) {
            [Event1]::class => $this->applyEvent1($readModel, $event),
            [Event2]::class => $this->applyEvent2($readModel, $event),
            default => null,
        };
    }

    private function applyEvent1([ReadModel] $readModel, $event): void
    {
        // Logique spécifique à Event1
    }

    private function applyEvent2([ReadModel] $readModel, $event): void
    {
        // Logique spécifique à Event2
    }
}
```

### Exemple: Order Projection

```php
<?php

declare(strict_types=1);

namespace App\Projection;

use App\Message\OrderCreatedEvent;
use App\Message\OrderPaidEvent;
use App\Message\OrderShippedEvent;
use App\ReadModel\OrderReadModel;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final readonly class OrderProjection
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {
    }

    public function __invoke(
        OrderCreatedEvent|OrderPaidEvent|OrderShippedEvent $event
    ): void {
        $readModel = $this->em->getRepository(OrderReadModel::class)
            ->find($event->getOrderId());

        if (!$readModel && $event instanceof OrderCreatedEvent) {
            $readModel = new OrderReadModel();
            $readModel->setId($event->getOrderId());
            $readModel->setCustomerName($event->getCustomerName());
            $readModel->setTotalAmount($event->getTotalAmount());
            $readModel->setStatus('pending');
            $readModel->setCreatedAt(new \DateTimeImmutable());
        }

        match (true) {
            $event instanceof OrderPaidEvent => $this->applyPaid($readModel),
            $event instanceof OrderShippedEvent => $this->applyShipped($readModel),
            default => null,
        };

        $this->em->persist($readModel);
        $this->em->flush();
    }

    private function applyPaid(OrderReadModel $readModel): void
    {
        $readModel->setStatus('paid');
        $readModel->setPaidAt(new \DateTimeImmutable());
    }

    private function applyShipped(OrderReadModel $readModel): void
    {
        $readModel->setStatus('shipped');
        $readModel->setShippedAt(new \DateTimeImmutable());
    }
}
```

---

## Template Eloquent (Laravel)

```php
<?php

namespace App\Projections;

use App\Events\[DomainEvent];
use App\ReadModels\[ReadModel];
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Projection: [NomProjection]
 *
 * Responsabilité: Construire le read model [ReadModel]
 *
 * Événements écoutés:
 * - [Event1]
 * - [Event2]
 */
class [NomProjection] implements ShouldQueue
{
    public function handle([DomainEvent] $event): void
    {
        // 1. Récupérer ou créer le read model
        $readModel = [ReadModel]::firstOrNew(['id' => $event->id]);

        // 2. Appliquer l'événement
        $this->apply($readModel, $event);

        // 3. Sauvegarder
        $readModel->save();

        Log::info('[Projection] updated', [
            'read_model_id' => $readModel->id,
            'event' => get_class($event),
        ]);
    }

    private function apply([ReadModel] $readModel, [DomainEvent] $event): void
    {
        match (get_class($event)) {
            [Event1]::class => $this->applyEvent1($readModel, $event),
            [Event2]::class => $this->applyEvent2($readModel, $event),
        };
    }

    private function applyEvent1([ReadModel] $readModel, $event): void
    {
        // Logique spécifique à Event1
    }

    private function applyEvent2([ReadModel] $readModel, $event): void
    {
        // Logique spécifique à Event2
    }
}
```

### Exemple: User Stats Projection

```php
<?php

namespace App\Projections;

use App\Events\UserRegistered;
use App\Events\OrderPlaced;
use App\ReadModels\UserStats;

class UserStatsProjection
{
    public function handleUserRegistered(UserRegistered $event): void
    {
        UserStats::create([
            'user_id' => $event->userId,
            'total_orders' => 0,
            'total_spent' => 0,
            'first_order_at' => null,
            'last_order_at' => null,
        ]);
    }

    public function handleOrderPlaced(OrderPlaced $event): void
    {
        $stats = UserStats::where('user_id', $event->userId)->first();

        $stats->increment('total_orders');
        $stats->increment('total_spent', $event->amount);

        if (!$stats->first_order_at) {
            $stats->first_order_at = now();
        }

        $stats->last_order_at = now();
        $stats->save();
    }
}
```

## Bonnes pratiques

- **Idempotence**: Une projection doit être rejouable
- **Dénormalisation**: Optimiser pour les requêtes fréquentes
- **Eventual consistency**: Accepter le délai de mise à jour
- **Rebuild**: Prévoir un mécanisme de rebuild complet
