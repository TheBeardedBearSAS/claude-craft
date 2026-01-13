---
description: Architecture Validation
---

# Architecture Validation

Validate Clean Architecture implementation in PHP project.

## What This Command Does

1. **Layer Analysis**
   - Verify Domain layer independence
   - Check Application layer dependencies
   - Validate Infrastructure implementations
   - Analyze Presentation layer structure

2. **Dependency Verification**
   - Check dependency direction (inward only)
   - Identify circular dependencies
   - Verify interface segregation
   - Validate dependency injection

3. **Pattern Compliance**
   - Repository pattern verification
   - CQRS/Command pattern analysis
   - Event-driven architecture check
   - Value Object validation

## Architecture Layers

### Expected Structure

```
src/
├── Domain/                    # Core business logic (no dependencies)
│   ├── Entity/                # Business entities
│   ├── ValueObject/           # Immutable value types
│   ├── Repository/            # Repository interfaces (contracts)
│   ├── Service/               # Domain services
│   ├── Event/                 # Domain events
│   └── Exception/             # Domain exceptions
│
├── Application/               # Use cases & orchestration
│   ├── UseCase/               # Application use cases
│   ├── DTO/                   # Data Transfer Objects
│   ├── Service/               # Application services
│   └── Exception/             # Application exceptions
│
├── Infrastructure/            # External concerns
│   ├── Persistence/           # Database implementations
│   ├── Http/                  # HTTP client implementations
│   ├── Mailer/                # Email service implementations
│   └── Cache/                 # Cache implementations
│
└── Presentation/              # UI & API layer
    ├── Controller/            # HTTP controllers
    ├── Console/               # CLI commands
    └── Middleware/            # HTTP middleware
```

### Dependency Rules

```
┌─────────────────────────────────────────────────────┐
│                    Presentation                      │
│            (Controllers, CLI Commands)               │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                   Infrastructure                     │
│          (Doctrine, Mailers, Caches)                 │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                    Application                       │
│          (Use Cases, DTOs, Services)                 │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                      Domain                          │
│     (Entities, Value Objects, Interfaces)            │
└─────────────────────────────────────────────────────┘

CRITICAL: Dependencies MUST flow inward only.
Domain layer has NO external dependencies.
```

## Domain Layer Checks

### Entity Design

```php
<?php
// ✅ Good - Rich domain model
final class Order
{
    private array $items = [];

    private function __construct(
        private readonly OrderId $id,
        private readonly CustomerId $customerId,
        private OrderStatus $status,
        private Money $totalAmount,
    ) {}

    public static function create(OrderId $id, CustomerId $customerId): self
    {
        return new self($id, $customerId, OrderStatus::DRAFT, Money::zero());
    }

    public function addItem(Product $product, int $quantity): void
    {
        // Business logic in entity
        if ($this->status !== OrderStatus::DRAFT) {
            throw new OrderNotEditableException();
        }
        $this->items[] = OrderItem::create($product, $quantity);
        $this->recalculateTotal();
    }
}

// ❌ Bad - Anemic domain model
final class Order
{
    public OrderId $id;
    public CustomerId $customerId;
    public OrderStatus $status;
    public Money $totalAmount;
    // No behavior, just data container
}
```

### Value Objects

```php
<?php
// ✅ Good - Self-validating, immutable
readonly class Email
{
    private function __construct(
        public string $value,
    ) {}

    public static function fromString(string $email): self
    {
        $normalized = strtolower(trim($email));

        if (!filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidEmailException($email);
        }

        return new self($normalized);
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }
}

// ❌ Bad - Not self-validating
class Email
{
    public string $value;  // Can be set to invalid value
}
```

### Repository Interfaces

```php
<?php
// ✅ Good - Interface in Domain layer
namespace App\Domain\Repository;

interface OrderRepositoryInterface
{
    public function nextIdentity(): OrderId;
    public function find(OrderId $id): ?Order;
    public function findByCustomer(CustomerId $customerId): array;
    public function save(Order $order): void;
    public function remove(Order $order): void;
}

// ❌ Bad - Interface depends on implementation details
namespace App\Domain\Repository;

use Doctrine\ORM\EntityManagerInterface;  // BAD!

interface OrderRepositoryInterface
{
    public function getEntityManager(): EntityManagerInterface;  // BAD!
}
```

## Application Layer Checks

### Command/Handler Pattern

```php
<?php
// ✅ Good - Immutable command
final readonly class CreateOrderCommand
{
    public function __construct(
        public string $customerId,
        public array $items,
    ) {}
}

// ✅ Good - Single responsibility handler
final readonly class CreateOrderHandler
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private CustomerRepositoryInterface $customerRepository,
        private EventDispatcherInterface $eventDispatcher,
    ) {}

    public function handle(CreateOrderCommand $command): OrderId
    {
        $customerId = CustomerId::fromString($command->customerId);
        $customer = $this->customerRepository->find($customerId)
            ?? throw new CustomerNotFoundException($customerId);

        $order = Order::create(
            $this->orderRepository->nextIdentity(),
            $customerId,
        );

        foreach ($command->items as $item) {
            $order->addItem($item['productId'], $item['quantity']);
        }

        $this->orderRepository->save($order);

        foreach ($order->pullDomainEvents() as $event) {
            $this->eventDispatcher->dispatch($event);
        }

        return $order->getId();
    }
}
```

### Query Pattern

```php
<?php
// ✅ Good - Query returning DTO
final readonly class GetOrderByIdQuery
{
    public function __construct(
        public string $orderId,
    ) {}
}

final readonly class GetOrderByIdHandler
{
    public function __construct(
        private OrderQueryServiceInterface $queryService,
    ) {}

    public function handle(GetOrderByIdQuery $query): ?OrderDto
    {
        return $this->queryService->findById(
            OrderId::fromString($query->orderId)
        );
    }
}
```

## Infrastructure Layer Checks

### Repository Implementation

```php
<?php
// ✅ Good - Implementation in Infrastructure
namespace App\Infrastructure\Persistence\Doctrine;

use App\Domain\Entity\Order;
use App\Domain\Repository\OrderRepositoryInterface;
use App\Domain\ValueObject\OrderId;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineOrderRepository implements OrderRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function nextIdentity(): OrderId
    {
        return OrderId::generate();
    }

    public function find(OrderId $id): ?Order
    {
        return $this->entityManager->find(Order::class, $id->getValue());
    }

    public function save(Order $order): void
    {
        $this->entityManager->persist($order);
        $this->entityManager->flush();
    }
}
```

### External Service Adapters

```php
<?php
// ✅ Good - Adapter pattern for external services
namespace App\Infrastructure\Payment;

use App\Domain\Payment\PaymentGatewayInterface;
use App\Domain\ValueObject\Money;
use Stripe\StripeClient;

final readonly class StripePaymentGateway implements PaymentGatewayInterface
{
    public function __construct(
        private StripeClient $stripe,
    ) {}

    public function charge(Money $amount, string $token): PaymentResult
    {
        $charge = $this->stripe->charges->create([
            'amount' => $amount->getAmountInCents(),
            'currency' => $amount->getCurrency(),
            'source' => $token,
        ]);

        return PaymentResult::fromStripeCharge($charge);
    }
}
```

## Presentation Layer Checks

### Controller Structure

```php
<?php
// ✅ Good - Thin controller delegating to handlers
#[Route('/api/v1/orders')]
final readonly class OrderController
{
    public function __construct(
        private CreateOrderHandler $createHandler,
        private GetOrderByIdHandler $getHandler,
    ) {}

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $command = new CreateOrderCommand(
            customerId: $data['customer_id'],
            items: $data['items'],
        );

        $orderId = $this->createHandler->handle($command);

        return new JsonResponse(['id' => $orderId->getValue()], 201);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $query = new GetOrderByIdQuery($id);
        $order = $this->getHandler->handle($query);

        if ($order === null) {
            return new JsonResponse(['error' => 'Order not found'], 404);
        }

        return new JsonResponse($order);
    }
}

// ❌ Bad - Fat controller with business logic
final class OrderController
{
    public function create(Request $request): JsonResponse
    {
        // BAD: Business logic in controller
        $order = new Order();
        $order->setCustomerId($request->get('customer_id'));

        foreach ($request->get('items') as $item) {
            // Calculation logic here - BAD!
            $total += $item['price'] * $item['quantity'];
        }

        $this->entityManager->persist($order);
        $this->entityManager->flush();

        // BAD: Sending email from controller
        $this->mailer->send($order->getCustomer()->getEmail());
    }
}
```

## Architecture Tests

### Using PHPat

```php
<?php
namespace App\Tests\Architecture;

use PHPat\Selector\Selector;
use PHPat\Test\Builder\Rule;
use PHPat\Test\PHPat;

final class ArchitectureTest
{
    public function test_domain_should_not_depend_on_infrastructure(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('App\Infrastructure'))
            ->because('Domain must be independent of infrastructure');
    }

    public function test_domain_should_not_depend_on_application(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('App\Application'))
            ->because('Domain must not know about application layer');
    }

    public function test_application_should_not_depend_on_infrastructure(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Application'))
            ->shouldNotDependOn()
            ->classes(Selector::inNamespace('App\Infrastructure'))
            ->because('Application should depend on abstractions');
    }

    public function test_entities_should_be_final(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain\Entity'))
            ->shouldBeFinal()
            ->because('Entities should not be extended');
    }

    public function test_value_objects_should_be_readonly(): Rule
    {
        return PHPat::rule()
            ->classes(Selector::inNamespace('App\Domain\ValueObject'))
            ->shouldBeReadonly()
            ->because('Value objects must be immutable');
    }
}
```

### Using Deptrac

```yaml
# deptrac.yaml
deptrac:
  paths:
    - ./src

  layers:
    - name: Domain
      collectors:
        - type: className
          regex: ^App\\Domain\\.*

    - name: Application
      collectors:
        - type: className
          regex: ^App\\Application\\.*

    - name: Infrastructure
      collectors:
        - type: className
          regex: ^App\\Infrastructure\\.*

    - name: Presentation
      collectors:
        - type: className
          regex: ^App\\Presentation\\.*

  ruleset:
    Domain: []
    Application:
      - Domain
    Infrastructure:
      - Domain
      - Application
    Presentation:
      - Application
      - Domain
```

## Architecture Checklist

### Domain Layer
- [ ] No external dependencies (no framework, no ORM)
- [ ] Entities have private setters and factory methods
- [ ] Value Objects are readonly and self-validating
- [ ] Repository interfaces defined in Domain
- [ ] Domain events for state changes
- [ ] Rich domain model (not anemic)

### Application Layer
- [ ] Commands are immutable (readonly)
- [ ] Handlers have single responsibility
- [ ] DTOs for data transfer
- [ ] No direct infrastructure dependencies
- [ ] Event dispatching for side effects

### Infrastructure Layer
- [ ] Implements Domain interfaces
- [ ] Adapter pattern for external services
- [ ] No business logic
- [ ] Proper error handling and mapping

### Presentation Layer
- [ ] Thin controllers
- [ ] Input validation at boundary
- [ ] Proper HTTP status codes
- [ ] No business logic
- [ ] Dependency injection only

## Common Violations

1. **Domain depends on Infrastructure**
   - Using Doctrine annotations in entities
   - Importing framework classes in Domain

2. **Anemic Domain Model**
   - Entities with only getters/setters
   - Business logic in services instead of entities

3. **Fat Controllers**
   - Business logic in controllers
   - Direct database access from controllers

4. **Missing Abstractions**
   - No repository interfaces
   - Concrete implementations in Domain

5. **Circular Dependencies**
   - Application depending on Infrastructure
   - Infrastructure depending on Presentation
