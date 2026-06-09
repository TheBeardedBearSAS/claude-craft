# Laravel 13 Coding Standards

**Source :** https://laravel.com/docs/13.x/contributions#coding-style

## Naming Conventions

### General Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Controllers | Singular, PascalCase | `OrderController`, `UserController` |
| Models | Singular, PascalCase | `Order`, `User`, `OrderItem` |
| Tables | Plural, snake_case | `orders`, `users`, `order_items` |
| Columns | snake_case | `created_at`, `customer_id` |
| Migrations | date_action_table | `2024_01_15_create_orders_table` |
| Methods | camelCase | `getUserOrders()`, `calculateTotal()` |
| Variables | camelCase | `$orderTotal`, `$customerName` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS`, `DEFAULT_STATUS` |
| Traits | Adjective or ability | `HasOrders`, `Searchable` |
| Interfaces | Adjective + Interface | `OrderRepositoryInterface` |
| Enums | PascalCase | `OrderStatus`, `PaymentMethod` |

### Route Naming

```php
// Resource routes (RESTful)
Route::apiResource('orders', OrderController::class);
// Generates: orders.index, orders.store, orders.show, orders.update, orders.destroy

// Custom routes
Route::post('orders/{order}/ship', [OrderController::class, 'ship'])
    ->name('orders.ship');

Route::get('orders/{order}/invoice', [OrderController::class, 'invoice'])
    ->name('orders.invoice');
```

### Blade Views

```
resources/views/
├── layouts/
│   └── app.blade.php
├── components/
│   ├── button.blade.php
│   └── forms/
│       └── input.blade.php
├── orders/
│   ├── index.blade.php
│   ├── show.blade.php
│   ├── create.blade.php
│   ├── edit.blade.php
│   └── partials/
│       └── _order-item.blade.php
└── emails/
    └── orders/
        └── shipped.blade.php
```

## Modern PHP Features (PHP 8.3+ requis, 8.5 recommandé)

### Constructor Property Promotion

```php
// Modern approach
final class CreateOrderAction
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository,
    ) {}
}

// Avoid: Traditional assignment
class CreateOrderAction
{
    private OrderRepositoryInterface $orderRepository;

    public function __construct(OrderRepositoryInterface $orderRepository)
    {
        $this->orderRepository = $orderRepository;
    }
}
```

### Readonly Properties and Classes

```php
// Readonly class (all properties are readonly)
final readonly class OrderDTO
{
    public function __construct(
        public int $customerId,
        public array $items,
    ) {}
}

// Readonly properties
final class Money
{
    public function __construct(
        public readonly int $amount,
        public readonly string $currency = 'EUR',
    ) {}
}
```

### Enums

```php
<?php

namespace App\Domain\Order;

enum OrderStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Draft => 'Draft',
            self::Pending => 'Pending Payment',
            self::Confirmed => 'Confirmed',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
        };
    }

    public function canTransitionTo(OrderStatus $newStatus): bool
    {
        return match($this) {
            self::Draft => in_array($newStatus, [self::Pending, self::Cancelled]),
            self::Pending => in_array($newStatus, [self::Confirmed, self::Cancelled]),
            self::Confirmed => in_array($newStatus, [self::Shipped, self::Cancelled]),
            self::Shipped => $newStatus === self::Delivered,
            default => false,
        };
    }
}
```

### Match Expressions

```php
// Use match instead of switch
$discount = match($customerType) {
    'vip' => 0.20,
    'regular' => 0.10,
    'new' => 0.05,
    default => 0.00,
};

// Match with conditions
$shippingCost = match(true) {
    $total >= 100 => 0,
    $total >= 50 => 5.99,
    default => 9.99,
};
```

### Named Arguments

```php
// Clearer intent with named arguments
Order::create(
    customerId: $request->customer_id,
    status: OrderStatus::Draft,
);

// In method calls
$order->ship(
    carrier: 'DHL',
    trackingNumber: 'DHL123456',
    notifyCustomer: true,
);
```

### Nullsafe Operator

```php
// Nullsafe operator
$customerCity = $order->customer?->address?->city;

// Without nullsafe (verbose)
$customerCity = null;
if ($order->customer !== null && $order->customer->address !== null) {
    $customerCity = $order->customer->address->city;
}
```

### First-Class Callable Syntax

```php
// Modern: First-class callable
$orders->map($this->formatOrder(...));

// Alternative: Traditional closure
$orders->map(fn ($order) => $this->formatOrder($order));
```

### PHP 8.5 Enhancements

Ces fonctionnalités nécessitent PHP 8.5 et sont optionnelles (PHP 8.3+ suffit pour Laravel 13) :

```php
// Property hooks (PHP 8.4+) — getters/setters sans boilerplate
class Order extends Model
{
    public string $formattedTotal {
        get => number_format($this->total_amount, 2) . ' €';
    }
}

// Asymmetric visibility (PHP 8.4+)
class User extends Model
{
    public private(set) int $loginCount = 0;
}
```

## Native PHP Attributes Eloquent (Laravel 13)

Laravel 13 introduit les **PHP native attributes** pour configurer les modèles Eloquent de façon déclarative, en alternative non-breaking aux propriétés de classe.

**Source :** https://laravel.com/docs/13.x/eloquent

### Attributs disponibles

| Attribut | Équivalent propriété | Description |
|----------|---------------------|-------------|
| `#[Table('orders')]` | `$table = 'orders'` | Nom de table personnalisé |
| `#[Fillable(['name', 'email'])]` | `$fillable = [...]` | Champs mass-assignable |
| `#[Guarded(['id'])]` | `$guarded = [...]` | Champs protégés du mass-assignment |
| `#[Hidden(['password'])]` | `$hidden = [...]` | Champs cachés à la sérialisation |
| `#[Visible(['name'])]` | `$visible = [...]` | Champs visibles à la sérialisation |
| `#[Appends(['full_name'])]` | `$appends = [...]` | Accesseurs ajoutés à la sérialisation |
| `#[ObservedBy(UserObserver::class)]` | `observe()` dans boot | Attacher un observer |
| `#[ScopedBy(ActiveScope::class)]` | `booted()` + addGlobalScope | Appliquer un global scope |
| `#[UseFactory(UserFactory::class)]` | Résolution automatique | Lier une factory explicite |

### Exemple avant / après

```php
// AVANT : propriétés de classe (toujours valide)
class User extends Authenticatable
{
    protected $table = 'users';

    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];
}

// APRÈS : PHP native attributes (Laravel 13, alternative non-breaking)
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;

#[Table('users')]
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
#[ObservedBy(UserObserver::class)]
class User extends Authenticatable
{
    // Plus de propriétés $fillable / $hidden nécessaires
}
```

> **Note :** Les deux styles sont compatibles et peuvent coexister. Préférer la cohérence au sein d'un projet. Les propriétés de classe ont priorité si les deux sont définis.

## Laravel Conventions

### Eloquent Best Practices

```php
<?php

namespace App\Domain\Order\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    // Explicitly define fillable (not guarded)
    protected $fillable = [
        'customer_id',
        'status',
        'total_amount',
        'notes',
    ];

    // Use casts instead of accessors for type conversion
    protected $casts = [
        'status' => OrderStatus::class,
        'total_amount' => 'decimal:2',
        'shipped_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Default values
    protected $attributes = [
        'status' => 'draft',
    ];

    // Relationships (always define return types)
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes (prefix with scope)
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', OrderStatus::Pending);
    }

    public function scopeForCustomer(Builder $query, int $customerId): Builder
    {
        return $query->where('customer_id', $customerId);
    }

    // Accessors (new syntax)
    protected function formattedTotal(): Attribute
    {
        return Attribute::get(
            fn () => number_format($this->total_amount, 2) . ' €'
        );
    }
}
```

### Controllers

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

// Single-action controller (preferred for complex actions)
class ShipOrderController extends Controller
{
    public function __invoke(Order $order): JsonResponse
    {
        $this->authorize('ship', $order);

        $order->ship();

        return response()->json([
            'message' => 'Order shipped successfully',
            'order' => OrderResource::make($order),
        ]);
    }
}

// Resource controller (standard CRUD)
class OrderController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Order::class, 'order');
    }

    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->forCustomer(auth()->id())
            ->with(['items'])
            ->latest()
            ->paginate();

        return OrderResource::collection($orders)->response();
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = Order::create($request->validated());

        return OrderResource::make($order)
            ->response()
            ->setStatusCode(201);
    }
}
```

### Service Classes

```php
<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

final class OrderService
{
    public function __construct(
        private readonly PaymentGateway $paymentGateway,
        private readonly NotificationService $notifications,
    ) {}

    public function processOrder(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $this->paymentGateway->charge($order);

            $order->markAsPaid();

            $this->notifications->sendOrderConfirmation($order);
        });
    }
}
```

## String Handling

### Str Helper and Stringable

```php
use Illuminate\Support\Str;

// Fluent string manipulation
$slug = Str::of($title)
    ->slug()
    ->limit(50)
    ->toString();

// String helpers
$excerpt = Str::limit($content, 100, '...');
$uuid = Str::uuid()->toString();
$orderId = Str::orderedUuid()->toString();

// Pluralization
$label = Str::plural('order', $count);
```

## Collection Best Practices

```php
use Illuminate\Support\Collection;

// Prefer collection methods over loops
$totals = $orders
    ->filter(fn (Order $order) => $order->isPaid())
    ->map(fn (Order $order) => $order->total_amount)
    ->sum();

// Lazy collections for large datasets
Order::cursor()
    ->filter(fn ($order) => $order->needsProcessing())
    ->each(fn ($order) => $this->process($order));

// Avoid: N+1 queries
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->customer->name; // N+1!
}

// Use: Eager loading
$orders = Order::with('customer')->get();
foreach ($orders as $order) {
    echo $order->customer->name; // No extra queries
}
```

## Error Handling

### Custom Exceptions

```php
<?php

namespace App\Exceptions;

use Exception;
use App\Models\Order;

class OrderCannotBeShippedException extends Exception
{
    public function __construct(
        public readonly Order $order,
        string $message = 'Order cannot be shipped'
    ) {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'error' => $this->message,
            'order_id' => $this->order->id,
            'current_status' => $this->order->status->value,
        ], 422);
    }

    public function report(): void
    {
        Log::warning('Failed to ship order', [
            'order_id' => $this->order->id,
            'status' => $this->order->status,
        ]);
    }
}
```

### Exception Handler

```php
// bootstrap/app.php (Laravel 11+)
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);
    });

    $exceptions->render(function (ModelNotFoundException $e) {
        return response()->json([
            'message' => 'Resource not found',
        ], 404);
    });
})
```

## Configuration and Environment

### Config Files

```php
// config/orders.php
return [
    'max_items_per_order' => env('ORDER_MAX_ITEMS', 50),
    'default_currency' => env('ORDER_CURRENCY', 'EUR'),

    'statuses' => [
        'allow_cancellation' => ['draft', 'pending'],
        'requires_payment' => ['pending'],
    ],

    'notifications' => [
        'email' => env('ORDER_NOTIFY_EMAIL', true),
        'sms' => env('ORDER_NOTIFY_SMS', false),
    ],
];

// Usage
$maxItems = config('orders.max_items_per_order');
```

### Environment Variables

```env
# .env.example
APP_NAME=MyApp
APP_ENV=local
APP_DEBUG=true

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=myapp
DB_USERNAME=root
DB_PASSWORD=

# Order Settings
ORDER_MAX_ITEMS=50
ORDER_CURRENCY=EUR
ORDER_NOTIFY_EMAIL=true
```

## Code Organization

### File Headers (Optional)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Order\Models;
```

### Import Order

```php
<?php

namespace App\Http\Controllers;

// 1. PHP classes
use Exception;
use InvalidArgumentException;

// 2. Laravel classes
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// 3. Third-party packages
use Spatie\LaravelData\Data;

// 4. Application classes
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Services\OrderService;
```

## Coding Standards Checklist

- [ ] Naming follows Laravel conventions
- [ ] Modern PHP features used (8.3+ requis, 8.5 recommandé)
- [ ] Enums for status/type fields
- [ ] Type declarations on all methods
- [ ] Return types specified
- [ ] Readonly properties where applicable
- [ ] Constructor property promotion
- [ ] No unused imports
- [ ] Proper exception handling
- [ ] Configuration via config files, not hardcoded
