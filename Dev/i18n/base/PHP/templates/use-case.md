# Template: Use Case (Command/Query)

## Command Structure

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\Order\CreateOrder;

/**
 * Command to create a new order.
 *
 * Commands are immutable data objects that represent user intent.
 */
final readonly class CreateOrderCommand
{
    /**
     * @param string $customerId Customer identifier
     * @param array<array{productId: string, quantity: int}> $items Order items
     */
    public function __construct(
        public string $customerId,
        public array $items,
    ) {}
}
```

## Command Handler

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\Order\CreateOrder;

use App\Domain\Entity\Order;
use App\Domain\Exception\CustomerNotFoundException;
use App\Domain\Repository\CustomerRepositoryInterface;
use App\Domain\Repository\OrderRepositoryInterface;
use App\Domain\Repository\ProductRepositoryInterface;
use App\Domain\ValueObject\CustomerId;
use App\Domain\ValueObject\ProductId;
use App\Infrastructure\Persistence\UnitOfWorkInterface;

/**
 * Handler for CreateOrderCommand.
 *
 * Orchestrates the order creation process.
 */
final readonly class CreateOrderHandler
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private CustomerRepositoryInterface $customerRepository,
        private ProductRepositoryInterface $productRepository,
        private UnitOfWorkInterface $unitOfWork,
    ) {}

    /**
     * Handle the command and return the created order ID.
     *
     * @throws CustomerNotFoundException
     * @throws ProductNotFoundException
     */
    public function __invoke(CreateOrderCommand $command): string
    {
        // Validate customer exists
        $customerId = CustomerId::fromString($command->customerId);
        $customer = $this->customerRepository->find($customerId)
            ?? throw new CustomerNotFoundException($customerId);

        // Create order
        $order = Order::create(
            $this->orderRepository->nextIdentity(),
            $customerId
        );

        // Add items
        foreach ($command->items as $item) {
            $productId = ProductId::fromString($item['productId']);
            $product = $this->productRepository->find($productId)
                ?? throw new ProductNotFoundException($productId);

            $order->addItem(
                $productId,
                $product->getPrice(),
                $item['quantity']
            );
        }

        // Persist
        $this->orderRepository->save($order);
        $this->unitOfWork->commit();

        return $order->getId()->getValue();
    }
}
```

## Command Validator

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\Order\CreateOrder;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Validator for CreateOrderCommand using Symfony Validator.
 */
final readonly class CreateOrderCommandValidator
{
    public function __construct(
        private ValidatorInterface $validator,
    ) {}

    /**
     * @throws ValidationException
     */
    public function validate(CreateOrderCommand $command): void
    {
        $violations = $this->validator->validate($command, [
            new Assert\Collection([
                'customerId' => [
                    new Assert\NotBlank(),
                    new Assert\Uuid(),
                ],
                'items' => [
                    new Assert\NotBlank(),
                    new Assert\Count(['min' => 1]),
                    new Assert\All([
                        new Assert\Collection([
                            'productId' => [
                                new Assert\NotBlank(),
                                new Assert\Uuid(),
                            ],
                            'quantity' => [
                                new Assert\NotBlank(),
                                new Assert\Positive(),
                            ],
                        ]),
                    ]),
                ],
            ]),
        ]);

        if (count($violations) > 0) {
            throw new ValidationException($violations);
        }
    }
}
```

## Query Structure

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\Order\GetOrderById;

/**
 * Query to retrieve an order by its ID.
 *
 * Queries are read-only operations that return data.
 */
final readonly class GetOrderByIdQuery
{
    public function __construct(
        public string $orderId,
    ) {}
}
```

## Query Handler

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\Order\GetOrderById;

use App\Application\DTO\OrderDto;

/**
 * Handler for GetOrderByIdQuery.
 *
 * Returns a DTO optimized for the client.
 */
final readonly class GetOrderByIdHandler
{
    public function __construct(
        private OrderQueryServiceInterface $queryService,
    ) {}

    public function __invoke(GetOrderByIdQuery $query): ?OrderDto
    {
        return $this->queryService->findById($query->orderId);
    }
}
```

## DTO Structure

```php
<?php

declare(strict_types=1);

namespace App\Application\DTO;

/**
 * Data Transfer Object for Order.
 *
 * Optimized structure for API responses.
 */
final readonly class OrderDto implements \JsonSerializable
{
    /**
     * @param OrderItemDto[] $items
     */
    public function __construct(
        public string $id,
        public string $customerId,
        public string $customerName,
        public string $status,
        public float $totalAmount,
        public string $currency,
        public array $items,
        public string $createdAt,
    ) {}

    /**
     * Create from domain entity.
     */
    public static function fromEntity(Order $order, Customer $customer): self
    {
        return new self(
            id: $order->getId()->getValue(),
            customerId: $order->getCustomerId()->getValue(),
            customerName: $customer->getName(),
            status: $order->getStatus()->value,
            totalAmount: $order->getTotalAmount()->getAmount(),
            currency: $order->getTotalAmount()->getCurrency(),
            items: array_map(
                fn(OrderItem $item) => OrderItemDto::fromEntity($item),
                $order->getItems()
            ),
            createdAt: $order->getCreatedAt()->format('c'),
        );
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'customerId' => $this->customerId,
            'customerName' => $this->customerName,
            'status' => $this->status,
            'totalAmount' => $this->totalAmount,
            'currency' => $this->currency,
            'items' => $this->items,
            'createdAt' => $this->createdAt,
        ];
    }
}

/**
 * DTO for order item.
 */
final readonly class OrderItemDto implements \JsonSerializable
{
    public function __construct(
        public string $productId,
        public string $productName,
        public float $unitPrice,
        public int $quantity,
        public float $total,
    ) {}

    public static function fromEntity(OrderItem $item, Product $product): self
    {
        return new self(
            productId: $item->getProductId()->getValue(),
            productName: $product->getName(),
            unitPrice: $item->getUnitPrice()->getAmount(),
            quantity: $item->getQuantity(),
            total: $item->getTotal()->getAmount(),
        );
    }

    public function jsonSerialize(): array
    {
        return [
            'productId' => $this->productId,
            'productName' => $this->productName,
            'unitPrice' => $this->unitPrice,
            'quantity' => $this->quantity,
            'total' => $this->total,
        ];
    }
}
```

## With Symfony Messenger

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\Order\CreateOrder;

use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final readonly class CreateOrderHandler
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private CustomerRepositoryInterface $customerRepository,
        private ProductRepositoryInterface $productRepository,
        private UnitOfWorkInterface $unitOfWork,
        private EventDispatcherInterface $eventDispatcher,
    ) {}

    public function __invoke(CreateOrderCommand $command): string
    {
        // ... implementation

        // Dispatch domain events
        foreach ($order->pullDomainEvents() as $event) {
            $this->eventDispatcher->dispatch($event);
        }

        return $order->getId()->getValue();
    }
}
```

## Associated Tests

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCase\Order\CreateOrder;

use App\Application\UseCase\Order\CreateOrder\CreateOrderCommand;
use App\Application\UseCase\Order\CreateOrder\CreateOrderHandler;
use App\Domain\Entity\Customer;
use App\Domain\Entity\Order;
use App\Domain\Entity\Product;
use App\Domain\Repository\CustomerRepositoryInterface;
use App\Domain\Repository\OrderRepositoryInterface;
use App\Domain\Repository\ProductRepositoryInterface;
use App\Domain\ValueObject\CustomerId;
use App\Domain\ValueObject\Money;
use App\Domain\ValueObject\OrderId;
use App\Domain\ValueObject\ProductId;
use App\Infrastructure\Persistence\UnitOfWorkInterface;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

final class CreateOrderHandlerTest extends TestCase
{
    private MockObject&OrderRepositoryInterface $orderRepository;
    private MockObject&CustomerRepositoryInterface $customerRepository;
    private MockObject&ProductRepositoryInterface $productRepository;
    private MockObject&UnitOfWorkInterface $unitOfWork;
    private CreateOrderHandler $handler;

    protected function setUp(): void
    {
        $this->orderRepository = $this->createMock(OrderRepositoryInterface::class);
        $this->customerRepository = $this->createMock(CustomerRepositoryInterface::class);
        $this->productRepository = $this->createMock(ProductRepositoryInterface::class);
        $this->unitOfWork = $this->createMock(UnitOfWorkInterface::class);

        $this->handler = new CreateOrderHandler(
            $this->orderRepository,
            $this->customerRepository,
            $this->productRepository,
            $this->unitOfWork,
        );
    }

    #[Test]
    public function it_creates_order_successfully(): void
    {
        // Arrange
        $customerId = CustomerId::generate();
        $productId = ProductId::generate();
        $orderId = OrderId::generate();

        $command = new CreateOrderCommand(
            customerId: $customerId->getValue(),
            items: [
                ['productId' => $productId->getValue(), 'quantity' => 2],
            ],
        );

        $customer = $this->createCustomer($customerId);
        $product = $this->createProduct($productId, Money::create(100, 'EUR'));

        $this->customerRepository
            ->expects($this->once())
            ->method('find')
            ->with($this->callback(fn($id) => $id->equals($customerId)))
            ->willReturn($customer);

        $this->productRepository
            ->expects($this->once())
            ->method('find')
            ->with($this->callback(fn($id) => $id->equals($productId)))
            ->willReturn($product);

        $this->orderRepository
            ->expects($this->once())
            ->method('nextIdentity')
            ->willReturn($orderId);

        $this->orderRepository
            ->expects($this->once())
            ->method('save')
            ->with($this->isInstanceOf(Order::class));

        $this->unitOfWork
            ->expects($this->once())
            ->method('commit');

        // Act
        $result = ($this->handler)($command);

        // Assert
        $this->assertSame($orderId->getValue(), $result);
    }

    #[Test]
    public function it_throws_when_customer_not_found(): void
    {
        // Arrange
        $command = new CreateOrderCommand(
            customerId: CustomerId::generate()->getValue(),
            items: [],
        );

        $this->customerRepository
            ->method('find')
            ->willReturn(null);

        // Assert
        $this->expectException(CustomerNotFoundException::class);

        // Act
        ($this->handler)($command);
    }

    private function createCustomer(CustomerId $id): Customer
    {
        return Customer::create($id, 'Test Customer', Email::fromString('test@example.com'));
    }

    private function createProduct(ProductId $id, Money $price): Product
    {
        return Product::create($id, 'Test Product', $price);
    }
}
```

## Folder Organization

```
src/Application/
├── UseCase/
│   └── Order/
│       ├── CreateOrder/
│       │   ├── CreateOrderCommand.php
│       │   ├── CreateOrderHandler.php
│       │   └── CreateOrderCommandValidator.php
│       ├── GetOrderById/
│       │   ├── GetOrderByIdQuery.php
│       │   └── GetOrderByIdHandler.php
│       └── SubmitOrder/
│           ├── SubmitOrderCommand.php
│           └── SubmitOrderHandler.php
├── DTO/
│   ├── OrderDto.php
│   └── OrderItemDto.php
├── Service/
│   └── OrderQueryServiceInterface.php
└── Exception/
    └── ValidationException.php

tests/Unit/Application/UseCase/Order/
├── CreateOrder/
│   └── CreateOrderHandlerTest.php
├── GetOrderById/
│   └── GetOrderByIdHandlerTest.php
└── SubmitOrder/
    └── SubmitOrderHandlerTest.php
```
