# Laravel 13 Architecture Standards

**Source :** https://laravel.com/docs/13.x/architecture

## Clean Architecture Principles

### Layer Structure

```
app/
├── Domain/                        # Core business logic
│   ├── {Module}/                  # e.g., User, Order, Product
│   │   ├── Models/                # Eloquent models (entities)
│   │   ├── ValueObjects/          # Immutable value types
│   │   ├── Events/                # Domain events
│   │   ├── Exceptions/            # Domain exceptions
│   │   ├── Contracts/             # Repository interfaces
│   │   └── Services/              # Domain services
│   └── Shared/                    # Shared domain concepts
│
├── Application/                   # Use cases & orchestration
│   ├── {Module}/
│   │   ├── Actions/               # Single-purpose action classes
│   │   ├── Commands/              # CQRS commands (write)
│   │   ├── Queries/               # CQRS queries (read)
│   │   ├── DTOs/                  # Data Transfer Objects
│   │   └── Handlers/              # Command/Query handlers
│   └── Contracts/                 # Application interfaces
│
├── Infrastructure/                # External concerns
│   ├── Persistence/               # Repository implementations
│   │   ├── Eloquent/              # Eloquent repositories
│   │   └── Cache/                 # Cache repositories
│   ├── Services/                  # External service implementations
│   ├── Mail/                      # Mail implementations
│   └── Queue/                     # Queue job implementations
│
└── Interfaces/                    # Presentation layer
    ├── Http/
    │   ├── Controllers/           # API/Web controllers
    │   ├── Requests/              # Form requests (validation)
    │   ├── Resources/             # API resources (transformers)
    │   └── Middleware/            # HTTP middleware
    ├── Console/                   # Artisan commands
    └── Jobs/                      # Queue jobs
```

### Alternative: Modular Monolith Structure

```
app/
├── Modules/
│   ├── User/
│   │   ├── Domain/
│   │   │   ├── Models/
│   │   │   ├── Events/
│   │   │   └── Contracts/
│   │   ├── Application/
│   │   │   ├── Actions/
│   │   │   └── DTOs/
│   │   ├── Infrastructure/
│   │   │   └── Repositories/
│   │   └── Interfaces/
│   │       ├── Http/
│   │       │   ├── Controllers/
│   │       │   ├── Requests/
│   │       │   └── Resources/
│   │       └── routes.php
│   │
│   └── Order/
│       └── ... (same structure)
│
├── Shared/                        # Cross-module shared code
│   ├── Domain/
│   ├── Application/
│   └── Infrastructure/
│
└── Support/                       # Framework utilities
```

### Dependency Rules

```
┌─────────────────────────────────────────────────────────┐
│                    Interfaces                            │
│         (Controllers, Commands, Resources)               │
└────────────────────────┬────────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────────┐
│                   Infrastructure                         │
│       (Repositories, External Services, Mail)            │
└────────────────────────┬────────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────────┐
│                    Application                           │
│            (Actions, DTOs, Handlers)                     │
└────────────────────────┬────────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────────┐
│                      Domain                              │
│     (Models, Value Objects, Repository Interfaces)       │
└─────────────────────────────────────────────────────────┘
```

**CRITICAL**: Dependencies MUST flow inward only. Domain has NO external dependencies.

## Domain Layer

### Eloquent Models as Entities

```php
<?php

namespace App\Domain\Order\Models;

use App\Domain\Order\Events\OrderCreated;
use App\Domain\Order\Events\OrderShipped;
use App\Domain\Order\ValueObjects\Money;
use App\Domain\Shared\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends BaseModel
{
    protected $fillable = ['customer_id', 'status'];

    protected $casts = [
        'total_amount' => Money::class,
        'status' => OrderStatus::class,
        'shipped_at' => 'datetime',
    ];

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Factory method
    public static function create(array $attributes = []): static
    {
        $order = new static($attributes);
        $order->status = OrderStatus::Draft;
        $order->save();

        event(new OrderCreated($order));

        return $order;
    }

    // Domain methods
    public function addItem(Product $product, int $quantity): OrderItem
    {
        $item = $this->items()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => $product->price,
        ]);

        $this->recalculateTotal();

        return $item;
    }

    public function ship(): void
    {
        if (!$this->canBeShipped()) {
            throw new OrderCannotBeShippedException($this);
        }

        $this->status = OrderStatus::Shipped;
        $this->shipped_at = now();
        $this->save();

        event(new OrderShipped($this));
    }

    public function canBeShipped(): bool
    {
        return $this->status === OrderStatus::Confirmed
            && $this->items()->exists();
    }

    private function recalculateTotal(): void
    {
        $this->total_amount = $this->items->sum(
            fn (OrderItem $item) => $item->total->amount
        );
        $this->save();
    }
}
```

### Value Objects with Casts

```php
<?php

namespace App\Domain\Order\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use InvalidArgumentException;

final class Money implements CastsAttributes
{
    public function __construct(
        public readonly int $amount,
        public readonly string $currency = 'EUR'
    ) {
        if ($amount < 0) {
            throw new InvalidArgumentException('Amount cannot be negative');
        }
    }

    public static function fromCents(int $cents, string $currency = 'EUR'): self
    {
        return new self($cents, $currency);
    }

    public static function zero(string $currency = 'EUR'): self
    {
        return new self(0, $currency);
    }

    public function add(Money $other): self
    {
        $this->ensureSameCurrency($other);
        return new self($this->amount + $other->amount, $this->currency);
    }

    public function multiply(int $factor): self
    {
        return new self($this->amount * $factor, $this->currency);
    }

    public function format(): string
    {
        return number_format($this->amount / 100, 2) . ' ' . $this->currency;
    }

    // CastsAttributes implementation
    public function get($model, string $key, $value, array $attributes): ?self
    {
        if ($value === null) {
            return null;
        }
        return new self(
            (int) $value,
            $attributes[$key . '_currency'] ?? 'EUR'
        );
    }

    public function set($model, string $key, $value, array $attributes): array
    {
        if ($value === null) {
            return [$key => null];
        }
        return [
            $key => $value->amount,
            $key . '_currency' => $value->currency,
        ];
    }

    private function ensureSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Currency mismatch');
        }
    }
}
```

### Repository Interfaces (Contracts)

```php
<?php

namespace App\Domain\Order\Contracts;

use App\Domain\Order\Models\Order;
use Illuminate\Support\Collection;

interface OrderRepositoryInterface
{
    public function find(int $id): ?Order;

    public function findOrFail(int $id): Order;

    public function findByCustomer(int $customerId): Collection;

    public function findPending(): Collection;

    public function save(Order $order): void;

    public function delete(Order $order): void;
}
```

## Application Layer

### Action Classes (Single Responsibility)

```php
<?php

namespace App\Application\Order\Actions;

use App\Application\Order\DTOs\CreateOrderData;
use App\Domain\Order\Contracts\OrderRepositoryInterface;
use App\Domain\Order\Models\Order;
use App\Domain\Product\Contracts\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;

final class CreateOrderAction
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository,
    ) {}

    public function execute(CreateOrderData $data): Order
    {
        return DB::transaction(function () use ($data) {
            $order = Order::create([
                'customer_id' => $data->customerId,
            ]);

            foreach ($data->items as $itemData) {
                $product = $this->productRepository->findOrFail($itemData->productId);
                $order->addItem($product, $itemData->quantity);
            }

            return $order->fresh(['items']);
        });
    }
}
```

### Data Transfer Objects (DTOs)

```php
<?php

namespace App\Application\Order\DTOs;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Min;

final class CreateOrderData extends Data
{
    public function __construct(
        #[Required]
        public readonly int $customerId,

        /** @var OrderItemData[] */
        #[Required, Min(1)]
        public readonly array $items,
    ) {}
}

final class OrderItemData extends Data
{
    public function __construct(
        #[Required]
        public readonly int $productId,

        #[Required, Min(1)]
        public readonly int $quantity,
    ) {}
}
```

### CQRS Pattern (Optional)

```php
<?php

// Commands (Write)
namespace App\Application\Order\Commands;

final class CreateOrderCommand
{
    public function __construct(
        public readonly int $customerId,
        public readonly array $items,
    ) {}
}

// Command Handler
namespace App\Application\Order\Handlers;

use App\Application\Order\Commands\CreateOrderCommand;
use App\Domain\Order\Models\Order;

final class CreateOrderHandler
{
    public function __construct(
        private readonly CreateOrderAction $createOrderAction,
    ) {}

    public function handle(CreateOrderCommand $command): Order
    {
        return $this->createOrderAction->execute(
            CreateOrderData::from([
                'customerId' => $command->customerId,
                'items' => $command->items,
            ])
        );
    }
}

// Queries (Read)
namespace App\Application\Order\Queries;

use App\Domain\Order\Models\Order;
use Illuminate\Support\Collection;

final class GetOrdersByCustomerQuery
{
    public function __construct(
        public readonly int $customerId,
    ) {}
}

final class GetOrdersByCustomerHandler
{
    public function handle(GetOrdersByCustomerQuery $query): Collection
    {
        return Order::where('customer_id', $query->customerId)
            ->with(['items.product'])
            ->orderByDesc('created_at')
            ->get();
    }
}
```

## Infrastructure Layer

### Eloquent Repository Implementation

```php
<?php

namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Order\Contracts\OrderRepositoryInterface;
use App\Domain\Order\Models\Order;
use Illuminate\Support\Collection;

final class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function find(int $id): ?Order
    {
        return Order::find($id);
    }

    public function findOrFail(int $id): Order
    {
        return Order::findOrFail($id);
    }

    public function findByCustomer(int $customerId): Collection
    {
        return Order::where('customer_id', $customerId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function findPending(): Collection
    {
        return Order::where('status', OrderStatus::Pending)
            ->with(['items', 'customer'])
            ->get();
    }

    public function save(Order $order): void
    {
        $order->save();
    }

    public function delete(Order $order): void
    {
        $order->delete();
    }
}
```

### Service Provider Bindings

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\Order\Contracts\OrderRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\EloquentOrderRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    public array $bindings = [
        OrderRepositoryInterface::class => EloquentOrderRepository::class,
        ProductRepositoryInterface::class => EloquentProductRepository::class,
        CustomerRepositoryInterface::class => EloquentCustomerRepository::class,
    ];
}
```

## Interfaces Layer

### API Controllers

```php
<?php

namespace App\Interfaces\Http\Controllers\Api;

use App\Application\Order\Actions\CreateOrderAction;
use App\Application\Order\DTOs\CreateOrderData;
use App\Domain\Order\Contracts\OrderRepositoryInterface;
use App\Interfaces\Http\Requests\CreateOrderRequest;
use App\Interfaces\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly CreateOrderAction $createOrderAction,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $orders = $this->orderRepository->findByCustomer(
            auth()->id()
        );

        return OrderResource::collection($orders);
    }

    public function store(CreateOrderRequest $request): JsonResponse
    {
        $order = $this->createOrderAction->execute(
            CreateOrderData::from($request->validated())
        );

        return OrderResource::make($order)
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): OrderResource
    {
        $order = $this->orderRepository->findOrFail($id);

        $this->authorize('view', $order);

        return OrderResource::make($order);
    }
}
```

### Form Requests (Validation)

```php
<?php

namespace App\Interfaces\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.min' => 'At least one item is required.',
            'items.*.quantity.max' => 'Maximum quantity per item is 100.',
        ];
    }
}
```

### API Resources (Transformers)

```php
<?php

namespace App\Interfaces\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'total_amount' => $this->total_amount?->format(),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

## Architecture Checklist

- [ ] Domain layer has NO external dependencies (except Eloquent base)
- [ ] Application layer only depends on Domain
- [ ] Infrastructure implements interfaces from Domain
- [ ] Controllers are thin (delegate to Actions/Services)
- [ ] Business logic lives in Domain or Application layer
- [ ] Repository interfaces defined in Domain
- [ ] DTOs used for data transfer between layers
- [ ] Form Requests handle validation
- [ ] API Resources handle response transformation
- [ ] Events used for cross-cutting concerns
- [ ] Service Providers wire up dependencies
- [ ] AI SDK for LLM integrations (https://laravel.com/docs/13.x/ai-sdk)
- [ ] Vector Search for semantic search (https://laravel.com/docs/13.x/vector-search)
- [ ] Passkey for passwordless authentication (https://laravel.com/docs/13.x/passkey)
