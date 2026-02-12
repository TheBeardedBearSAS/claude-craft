# Template: Domain Entity

## Basic Structure

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use App\Domain\Event\EntityCreatedEvent;
use App\Domain\Exception\InvalidEntityStateException;
use App\Domain\ValueObject\EntityId;

/**
 * Entity description and purpose.
 */
final class EntityName
{
    /** @var DomainEvent[] */
    private array $domainEvents = [];

    private function __construct(
        private readonly EntityId $id,
        private string $name,
        private EntityStatus $status,
        private readonly \DateTimeImmutable $createdAt,
    ) {}

    /**
     * Factory method for creating a new entity.
     */
    public static function create(EntityId $id, string $name): self
    {
        $entity = new self(
            id: $id,
            name: $name,
            status: EntityStatus::DRAFT,
            createdAt: new \DateTimeImmutable(),
        );

        $entity->recordDomainEvent(new EntityCreatedEvent($id));

        return $entity;
    }

    /**
     * Reconstitute entity from persistence.
     */
    public static function reconstitute(
        EntityId $id,
        string $name,
        EntityStatus $status,
        \DateTimeImmutable $createdAt,
    ): self {
        return new self($id, $name, $status, $createdAt);
    }

    // Getters

    public function getId(): EntityId
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getStatus(): EntityStatus
    {
        return $this->status;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    // Business Logic Methods

    public function rename(string $newName): void
    {
        if (empty($newName)) {
            throw new \InvalidArgumentException('Name cannot be empty');
        }

        $this->name = $newName;
    }

    public function activate(): void
    {
        if ($this->status !== EntityStatus::DRAFT) {
            throw new InvalidEntityStateException(
                'Only draft entities can be activated'
            );
        }

        $this->status = EntityStatus::ACTIVE;
    }

    // Domain Events

    /** @return DomainEvent[] */
    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];

        return $events;
    }

    private function recordDomainEvent(DomainEvent $event): void
    {
        $this->domainEvents[] = $event;
    }
}
```

## With Aggregate Root

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use App\Domain\Event\OrderCreatedEvent;
use App\Domain\Event\OrderItemAddedEvent;
use App\Domain\Exception\EmptyOrderException;
use App\Domain\Exception\InvalidOrderStateException;
use App\Domain\ValueObject\CustomerId;
use App\Domain\ValueObject\Money;
use App\Domain\ValueObject\OrderId;
use App\Domain\ValueObject\ProductId;

/**
 * Order aggregate root.
 *
 * Invariants:
 * - Order must have at least one item to be submitted
 * - Total amount must equal sum of item totals
 * - Only draft orders can be modified
 */
final class Order
{
    /** @var OrderItem[] */
    private array $items = [];

    /** @var DomainEvent[] */
    private array $domainEvents = [];

    private function __construct(
        private readonly OrderId $id,
        private readonly CustomerId $customerId,
        private OrderStatus $status,
        private Money $totalAmount,
        private readonly \DateTimeImmutable $createdAt,
    ) {}

    public static function create(OrderId $id, CustomerId $customerId): self
    {
        $order = new self(
            id: $id,
            customerId: $customerId,
            status: OrderStatus::DRAFT,
            totalAmount: Money::zero(),
            createdAt: new \DateTimeImmutable(),
        );

        $order->recordDomainEvent(new OrderCreatedEvent($id));

        return $order;
    }

    // Aggregate methods

    public function addItem(ProductId $productId, Money $unitPrice, int $quantity): void
    {
        $this->assertCanModify();

        $item = new OrderItem($productId, $unitPrice, $quantity);
        $this->items[] = $item;
        $this->recalculateTotal();

        $this->recordDomainEvent(new OrderItemAddedEvent($this->id, $productId));
    }

    public function removeItem(ProductId $productId): void
    {
        $this->assertCanModify();

        $this->items = array_filter(
            $this->items,
            fn(OrderItem $item) => !$item->getProductId()->equals($productId)
        );
        $this->recalculateTotal();
    }

    public function submit(): void
    {
        $this->assertCanModify();

        if (empty($this->items)) {
            throw new EmptyOrderException('Cannot submit an empty order');
        }

        $this->status = OrderStatus::SUBMITTED;
        $this->recordDomainEvent(new OrderSubmittedEvent($this->id));
    }

    // Private methods

    private function assertCanModify(): void
    {
        if ($this->status !== OrderStatus::DRAFT) {
            throw new InvalidOrderStateException(
                'Only draft orders can be modified'
            );
        }
    }

    private function recalculateTotal(): void
    {
        $this->totalAmount = array_reduce(
            $this->items,
            fn(Money $carry, OrderItem $item) => $carry->add($item->getTotal()),
            Money::zero()
        );
    }

    // Getters

    public function getId(): OrderId
    {
        return $this->id;
    }

    public function getCustomerId(): CustomerId
    {
        return $this->customerId;
    }

    public function getStatus(): OrderStatus
    {
        return $this->status;
    }

    public function getTotalAmount(): Money
    {
        return $this->totalAmount;
    }

    /** @return OrderItem[] */
    public function getItems(): array
    {
        return $this->items;
    }

    /** @return DomainEvent[] */
    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];

        return $events;
    }

    private function recordDomainEvent(DomainEvent $event): void
    {
        $this->domainEvents[] = $event;
    }
}
```

## Entity Status Enum

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

enum OrderStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case CONFIRMED = 'confirmed';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    public function canTransitionTo(self $newStatus): bool
    {
        return match ($this) {
            self::DRAFT => in_array($newStatus, [self::SUBMITTED, self::CANCELLED]),
            self::SUBMITTED => in_array($newStatus, [self::CONFIRMED, self::CANCELLED]),
            self::CONFIRMED => in_array($newStatus, [self::SHIPPED, self::CANCELLED]),
            self::SHIPPED => in_array($newStatus, [self::DELIVERED]),
            self::DELIVERED, self::CANCELLED => false,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::CONFIRMED => 'Confirmed',
            self::SHIPPED => 'Shipped',
            self::DELIVERED => 'Delivered',
            self::CANCELLED => 'Cancelled',
        };
    }
}
```

## Associated Tests

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Domain\Entity;

use App\Domain\Entity\Order;
use App\Domain\Entity\OrderStatus;
use App\Domain\Exception\EmptyOrderException;
use App\Domain\Exception\InvalidOrderStateException;
use App\Domain\ValueObject\CustomerId;
use App\Domain\ValueObject\Money;
use App\Domain\ValueObject\OrderId;
use App\Domain\ValueObject\ProductId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class OrderTest extends TestCase
{
    #[Test]
    public function it_can_be_created_with_valid_data(): void
    {
        // Arrange
        $id = OrderId::generate();
        $customerId = CustomerId::generate();

        // Act
        $order = Order::create($id, $customerId);

        // Assert
        $this->assertTrue($order->getId()->equals($id));
        $this->assertTrue($order->getCustomerId()->equals($customerId));
        $this->assertSame(OrderStatus::DRAFT, $order->getStatus());
        $this->assertTrue($order->getTotalAmount()->equals(Money::zero()));
    }

    #[Test]
    public function it_can_add_items(): void
    {
        // Arrange
        $order = $this->createOrder();
        $productId = ProductId::generate();
        $unitPrice = Money::create(100, 'EUR');

        // Act
        $order->addItem($productId, $unitPrice, 2);

        // Assert
        $this->assertCount(1, $order->getItems());
        $this->assertTrue($order->getTotalAmount()->equals(Money::create(200, 'EUR')));
    }

    #[Test]
    public function it_cannot_add_items_when_submitted(): void
    {
        // Arrange
        $order = $this->createOrder();
        $order->addItem(ProductId::generate(), Money::create(100, 'EUR'), 1);
        $order->submit();

        // Assert
        $this->expectException(InvalidOrderStateException::class);

        // Act
        $order->addItem(ProductId::generate(), Money::create(50, 'EUR'), 1);
    }

    #[Test]
    public function it_cannot_be_submitted_when_empty(): void
    {
        // Arrange
        $order = $this->createOrder();

        // Assert
        $this->expectException(EmptyOrderException::class);

        // Act
        $order->submit();
    }

    private function createOrder(): Order
    {
        return Order::create(
            OrderId::generate(),
            CustomerId::generate()
        );
    }
}
```

## Folder Organization

```
src/Domain/
├── Entity/
│   ├── Order.php           # Aggregate root
│   ├── OrderItem.php       # Entity within aggregate
│   └── OrderStatus.php     # Status enum
├── ValueObject/
│   ├── OrderId.php
│   ├── CustomerId.php
│   └── Money.php
├── Event/
│   ├── OrderCreatedEvent.php
│   └── OrderItemAddedEvent.php
├── Exception/
│   ├── EmptyOrderException.php
│   └── InvalidOrderStateException.php
└── Repository/
    └── OrderRepositoryInterface.php
```
