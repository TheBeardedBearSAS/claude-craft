# Laravel 13 Testing Standards

**Source :** https://laravel.com/docs/13.x/testing | https://pestphp.com/docs/pest3-now-available

## Testing Frameworks

### Pest 3 (Recommended) avec Mutation Testing

**Pest 3** introduit le Mutation Testing natif pour garantir que les tests tuent réellement les bugs (https://pestphp.com/docs/pest3-now-available).

```bash
# Install Pest 3
composer require pestphp/pest --dev --with-all-dependencies
composer require pestphp/pest-plugin-laravel --dev
composer require pestphp/pest-plugin-mutate --dev
php artisan pest:install
```

### Test File Structure

```
tests/
├── Feature/                           # Feature/Integration tests
│   ├── Http/
│   │   └── Controllers/
│   │       └── OrderControllerTest.php
│   ├── Jobs/
│   │   └── ProcessOrderTest.php
│   └── Console/
│       └── PruneOrdersCommandTest.php
│
├── Unit/                              # Unit tests
│   ├── Domain/
│   │   ├── Models/
│   │   │   └── OrderTest.php
│   │   └── ValueObjects/
│   │       └── MoneyTest.php
│   └── Services/
│       └── OrderServiceTest.php
│
├── Architecture/                      # Architecture tests
│   └── ArchitectureTest.php
│
├── Pest.php                          # Pest configuration
└── TestCase.php                      # Base test class
```

## Pest Configuration

```php
<?php
// tests/Pest.php

uses(Tests\TestCase::class)
    ->in('Feature', 'Unit');

uses(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

// Global helpers
expect()->extend('toBeOrderStatus', function (string $status) {
    return $this->toBeInstanceOf(\App\Enums\OrderStatus::class)
        ->and($this->value->value)->toBe($status);
});

// Custom assertions
function assertDatabaseHasOrder(array $attributes): void
{
    test()->assertDatabaseHas('orders', $attributes);
}
```

## Unit Tests

### Testing Models

```php
<?php
// tests/Unit/Domain/Models/OrderTest.php

use App\Domain\Order\Models\Order;
use App\Domain\Order\OrderStatus;
use App\Domain\Order\Events\OrderShipped;

describe('Order', function () {
    it('creates an order with draft status', function () {
        $order = Order::factory()->create();

        expect($order->status)->toBe(OrderStatus::Draft);
    });

    it('calculates total from items', function () {
        $order = Order::factory()
            ->has(OrderItem::factory()->count(3)->state(['unit_price' => 1000]))
            ->create();

        expect($order->total_amount)->toBe(3000);
    });

    it('can be shipped when confirmed', function () {
        $order = Order::factory()->confirmed()->create();

        $order->ship();

        expect($order->status)->toBe(OrderStatus::Shipped)
            ->and($order->shipped_at)->not->toBeNull();
    });

    it('cannot be shipped when draft', function () {
        $order = Order::factory()->draft()->create();

        expect(fn () => $order->ship())
            ->toThrow(OrderCannotBeShippedException::class);
    });

    it('dispatches event when shipped', function () {
        Event::fake([OrderShipped::class]);

        $order = Order::factory()->confirmed()->create();
        $order->ship();

        Event::assertDispatched(OrderShipped::class, function ($event) use ($order) {
            return $event->order->id === $order->id;
        });
    });
});
```

### Testing Value Objects

```php
<?php
// tests/Unit/Domain/ValueObjects/MoneyTest.php

use App\Domain\Shared\ValueObjects\Money;

describe('Money', function () {
    it('creates money from cents', function () {
        $money = Money::fromCents(1000);

        expect($money->amount)->toBe(1000)
            ->and($money->currency)->toBe('EUR');
    });

    it('adds two money values', function () {
        $a = Money::fromCents(1000);
        $b = Money::fromCents(500);

        $result = $a->add($b);

        expect($result->amount)->toBe(1500);
    });

    it('throws when adding different currencies', function () {
        $eur = Money::fromCents(1000, 'EUR');
        $usd = Money::fromCents(500, 'USD');

        expect(fn () => $eur->add($usd))
            ->toThrow(InvalidArgumentException::class);
    });

    it('formats correctly', function () {
        $money = Money::fromCents(1234, 'EUR');

        expect($money->format())->toBe('12.34 EUR');
    });
});
```

### Testing Services

```php
<?php
// tests/Unit/Services/OrderServiceTest.php

use App\Services\OrderService;
use App\Models\Order;

beforeEach(function () {
    $this->paymentGateway = Mockery::mock(PaymentGateway::class);
    $this->notifications = Mockery::mock(NotificationService::class);

    $this->service = new OrderService(
        $this->paymentGateway,
        $this->notifications,
    );
});

describe('OrderService', function () {
    it('processes order successfully', function () {
        $order = Order::factory()->pending()->create();

        $this->paymentGateway
            ->shouldReceive('charge')
            ->with($order)
            ->once();

        $this->notifications
            ->shouldReceive('sendOrderConfirmation')
            ->with($order)
            ->once();

        $this->service->processOrder($order);

        expect($order->fresh()->status)->toBe(OrderStatus::Paid);
    });

    it('rolls back on payment failure', function () {
        $order = Order::factory()->pending()->create();

        $this->paymentGateway
            ->shouldReceive('charge')
            ->andThrow(new PaymentFailedException());

        expect(fn () => $this->service->processOrder($order))
            ->toThrow(PaymentFailedException::class);

        expect($order->fresh()->status)->toBe(OrderStatus::Pending);
    });
});
```

## Feature Tests

### Testing API Endpoints

```php
<?php
// tests/Feature/Http/Controllers/OrderControllerTest.php

use App\Models\Order;
use App\Models\User;

describe('OrderController', function () {
    describe('GET /api/orders', function () {
        it('returns orders for authenticated user', function () {
            $user = User::factory()->create();
            $orders = Order::factory()->for($user, 'customer')->count(3)->create();
            Order::factory()->count(2)->create(); // Other user's orders

            $response = $this->actingAs($user)
                ->getJson('/api/orders');

            $response->assertOk()
                ->assertJsonCount(3, 'data')
                ->assertJsonStructure([
                    'data' => [
                        '*' => ['id', 'status', 'total_amount', 'created_at'],
                    ],
                ]);
        });

        it('requires authentication', function () {
            $response = $this->getJson('/api/orders');

            $response->assertUnauthorized();
        });
    });

    describe('POST /api/orders', function () {
        it('creates an order', function () {
            $user = User::factory()->create();
            $product = Product::factory()->create(['price' => 2500]);

            $response = $this->actingAs($user)
                ->postJson('/api/orders', [
                    'items' => [
                        ['product_id' => $product->id, 'quantity' => 2],
                    ],
                ]);

            $response->assertCreated()
                ->assertJson([
                    'data' => [
                        'status' => 'draft',
                        'total_amount' => '50.00 EUR',
                    ],
                ]);

            $this->assertDatabaseHas('orders', [
                'customer_id' => $user->id,
                'status' => 'draft',
            ]);
        });

        it('validates required fields', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/api/orders', []);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items']);
        });

        it('validates item quantity', function () {
            $user = User::factory()->create();
            $product = Product::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/api/orders', [
                    'items' => [
                        ['product_id' => $product->id, 'quantity' => 0],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.quantity']);
        });
    });

    describe('POST /api/orders/{order}/ship', function () {
        it('ships a confirmed order', function () {
            $user = User::factory()->admin()->create();
            $order = Order::factory()->confirmed()->create();

            $response = $this->actingAs($user)
                ->postJson("/api/orders/{$order->id}/ship");

            $response->assertOk()
                ->assertJson([
                    'data' => ['status' => 'shipped'],
                ]);
        });

        it('forbids non-admin users', function () {
            $user = User::factory()->create();
            $order = Order::factory()->confirmed()->create();

            $response = $this->actingAs($user)
                ->postJson("/api/orders/{$order->id}/ship");

            $response->assertForbidden();
        });
    });
});
```

### Testing Jobs

```php
<?php
// tests/Feature/Jobs/ProcessOrderTest.php

use App\Jobs\ProcessOrder;
use App\Models\Order;

describe('ProcessOrder Job', function () {
    it('processes pending orders', function () {
        $order = Order::factory()->pending()->create();

        ProcessOrder::dispatch($order);

        expect($order->fresh()->status)->toBe(OrderStatus::Processing);
    });

    it('can be queued', function () {
        Queue::fake();

        $order = Order::factory()->pending()->create();

        ProcessOrder::dispatch($order);

        Queue::assertPushed(ProcessOrder::class, function ($job) use ($order) {
            return $job->order->id === $order->id;
        });
    });

    it('retries on failure', function () {
        $order = Order::factory()->pending()->create();

        // Simulate failure
        $job = new ProcessOrder($order);
        $job->failed(new Exception('Payment failed'));

        expect($order->fresh()->status)->toBe(OrderStatus::Failed);
    });
});
```

### Testing Console Commands

```php
<?php
// tests/Feature/Console/PruneOrdersCommandTest.php

use App\Models\Order;

describe('prune:orders command', function () {
    it('deletes old draft orders', function () {
        $oldDraft = Order::factory()->draft()->create([
            'created_at' => now()->subDays(31),
        ]);
        $recentDraft = Order::factory()->draft()->create();
        $oldConfirmed = Order::factory()->confirmed()->create([
            'created_at' => now()->subDays(31),
        ]);

        $this->artisan('prune:orders')
            ->expectsOutput('Pruned 1 draft orders.')
            ->assertExitCode(0);

        $this->assertDatabaseMissing('orders', ['id' => $oldDraft->id]);
        $this->assertDatabaseHas('orders', ['id' => $recentDraft->id]);
        $this->assertDatabaseHas('orders', ['id' => $oldConfirmed->id]);
    });

    it('respects --days option', function () {
        Order::factory()->draft()->create(['created_at' => now()->subDays(8)]);

        $this->artisan('prune:orders --days=7')
            ->expectsOutput('Pruned 1 draft orders.')
            ->assertExitCode(0);
    });
});
```

## Architecture Tests avec Pest Arch Presets

**Laravel 13** introduit des **Arch Presets** préconfigurés pour Laravel (https://laravel.com/docs/13.x/testing#architecture-presets).

```php
<?php
// tests/Architecture/ArchitectureTest.php

use Pest\Arch\Preset;

// Utiliser les presets Laravel (nouveauté Laravel 13)
uses(Preset::laravel());

// Tests personnalisés supplémentaires
arch('Domain has no external dependencies')
    ->expect('App\Domain')
    ->toOnlyUse([
        'App\Domain',
        'Illuminate\Database\Eloquent',
        'Illuminate\Support',
    ]);

arch('Controllers are invokable or extend base')
    ->expect('App\Http\Controllers')
    ->toExtend('App\Http\Controllers\Controller')
    ->or()
    ->toHaveMethod('__invoke');

arch('Actions are final classes')
    ->expect('App\Actions')
    ->toBeFinal();

arch('Models extend Eloquent Model')
    ->expect('App\Models')
    ->toExtend('Illuminate\Database\Eloquent\Model');

arch('Requests extend FormRequest')
    ->expect('App\Http\Requests')
    ->toExtend('Illuminate\Foundation\Http\FormRequest');

arch('No debugging statements')
    ->expect(['dd', 'dump', 'ray', 'var_dump'])
    ->not->toBeUsed();

arch('Strict types declared')
    ->expect('App')
    ->toUseStrictTypes();
```

## Mutation Testing avec Pest 3

**Nouveauté Pest 3 :** Mutation Testing natif (https://pestphp.com/docs/mutation-testing).

```bash
# Lancer le mutation testing
./vendor/bin/pest --mutate

# Avec minimum de mutation score
./vendor/bin/pest --mutate --min=80
```

**Principe :** Pest 3 mute le code (change les opérateurs, supprime des lignes) et vérifie que les tests échouent. Si un test passe sur du code muté, le test est insuffisant.

## Model Factories

```php
<?php
// database/factories/OrderFactory.php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Customer;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'status' => OrderStatus::Draft,
            'total_amount' => $this->faker->numberBetween(1000, 50000),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Draft]);
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Pending]);
    }

    public function confirmed(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Confirmed]);
    }

    public function shipped(): static
    {
        return $this->state(fn () => [
            'status' => OrderStatus::Shipped,
            'shipped_at' => now(),
        ]);
    }

    public function withItems(int $count = 3): static
    {
        return $this->has(
            OrderItem::factory()->count($count),
            'items'
        );
    }
}
```

## Testing Checklist

- [ ] Unit tests for Domain models and value objects
- [ ] Unit tests for Services with mocked dependencies
- [ ] Feature tests for all API endpoints
- [ ] Feature tests for Jobs and Commands
- [ ] Architecture tests for layer boundaries (Pest Arch Presets Laravel 13)
- [ ] Factories for all models
- [ ] RefreshDatabase for feature tests
- [ ] Event/Queue faking where appropriate
- [ ] Coverage > 80%
- [ ] No debugging statements in code
- [ ] Mutation Testing score >= 80% (Pest 3)
