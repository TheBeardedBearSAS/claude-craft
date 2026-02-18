---
description: Audit Laravel test coverage and testing practices
---

# Laravel Testing Audit

You are a Laravel testing expert. Your mission is to analyze the test suite, identify gaps, and recommend improvements.

## Testing Analysis

### 1. Test Structure Verification

Check if tests follow the recommended structure:

```
tests/
├── Feature/                    # Integration tests
│   ├── Http/
│   │   └── Controllers/
│   │       └── OrderControllerTest.php
│   ├── Jobs/
│   │   └── ProcessOrderTest.php
│   └── Console/
│       └── CommandsTest.php
│
├── Unit/                       # Unit tests
│   ├── Models/
│   │   └── OrderTest.php
│   ├── Services/
│   │   └── OrderServiceTest.php
│   └── ValueObjects/
│       └── MoneyTest.php
│
├── Architecture/               # Architecture tests
│   └── ArchitectureTest.php
│
├── Pest.php                   # Pest configuration
└── TestCase.php               # Base test class
```

### 2. Test Coverage Analysis

```bash
# Run tests with coverage
php artisan test --coverage

# Check minimum coverage
php artisan test --coverage --min=80

# Generate HTML report
XDEBUG_MODE=coverage php artisan test --coverage-html=coverage/html
```

#### Coverage Targets

| Layer | Target | Minimum |
|-------|--------|---------|
| Domain Models | 90% | 80% |
| Services/Actions | 85% | 75% |
| Controllers | 80% | 70% |
| Overall | 80% | 70% |

### 3. Pest PHP Best Practices

#### Test File Structure

```php
<?php
// tests/Feature/Http/Controllers/OrderControllerTest.php

use App\Models\Order;
use App\Models\User;

describe('OrderController', function () {
    describe('GET /api/orders', function () {
        it('returns orders for authenticated user', function () {
            $user = User::factory()->create();
            $orders = Order::factory()->for($user)->count(3)->create();

            $response = $this->actingAs($user)
                ->getJson('/api/orders');

            $response->assertOk()
                ->assertJsonCount(3, 'data');
        });

        it('requires authentication', function () {
            $this->getJson('/api/orders')
                ->assertUnauthorized();
        });
    });

    describe('POST /api/orders', function () {
        it('creates an order with valid data', function () {
            // Test implementation
        });

        it('validates required fields', function () {
            // Test implementation
        });
    });
});
```

#### Expectations and Assertions

```php
// Use expect() for readable assertions
expect($order->status)->toBe(OrderStatus::Draft);
expect($order->items)->toHaveCount(3);
expect($order->total_amount)->toBeGreaterThan(0);

// Chain expectations
expect($order)
    ->status->toBe(OrderStatus::Confirmed)
    ->shipped_at->not->toBeNull()
    ->items->toHaveCount(2);

// Custom expectations
expect()->extend('toBeValidOrder', function () {
    return $this
        ->toBeInstanceOf(Order::class)
        ->status->not->toBe(OrderStatus::Cancelled);
});
```

### 4. Feature Tests Checklist

#### API Endpoint Tests

For each endpoint, verify:

- [ ] **Happy path**: Returns expected data
- [ ] **Authentication**: Requires auth (if needed)
- [ ] **Authorization**: Checks permissions
- [ ] **Validation**: Rejects invalid input
- [ ] **Edge cases**: Handles empty data, limits
- [ ] **Error responses**: Returns proper error format

```php
describe('POST /api/orders/{order}/ship', function () {
    it('ships a confirmed order', function () {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->confirmed()->create();

        $response = $this->actingAs($admin)
            ->postJson("/api/orders/{$order->id}/ship");

        $response->assertOk()
            ->assertJson(['data' => ['status' => 'shipped']]);
    });

    it('returns 403 for non-admin users', function () {
        $user = User::factory()->create();
        $order = Order::factory()->confirmed()->create();

        $this->actingAs($user)
            ->postJson("/api/orders/{$order->id}/ship")
            ->assertForbidden();
    });

    it('returns 422 for orders that cannot be shipped', function () {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->draft()->create();

        $this->actingAs($admin)
            ->postJson("/api/orders/{$order->id}/ship")
            ->assertUnprocessable();
    });
});
```

### 5. Unit Tests Checklist

#### Model Tests

```php
describe('Order', function () {
    // State tests
    it('creates with draft status by default', function () {
        $order = Order::factory()->create();
        expect($order->status)->toBe(OrderStatus::Draft);
    });

    // Behavior tests
    it('calculates total from items', function () {
        $order = Order::factory()
            ->has(OrderItem::factory()->count(3)->state(['unit_price' => 1000]))
            ->create();

        expect($order->total_amount)->toBe(3000);
    });

    // Business rule tests
    it('can be shipped when confirmed', function () {
        $order = Order::factory()->confirmed()->create();
        $order->ship();
        expect($order->status)->toBe(OrderStatus::Shipped);
    });

    it('cannot be shipped when draft', function () {
        $order = Order::factory()->draft()->create();
        expect(fn () => $order->ship())
            ->toThrow(OrderCannotBeShippedException::class);
    });

    // Event tests
    it('dispatches event when shipped', function () {
        Event::fake([OrderShipped::class]);
        $order = Order::factory()->confirmed()->create();

        $order->ship();

        Event::assertDispatched(OrderShipped::class);
    });
});
```

#### Service/Action Tests

```php
describe('CreateOrderAction', function () {
    beforeEach(function () {
        $this->action = app(CreateOrderAction::class);
    });

    it('creates order with items', function () {
        $customer = Customer::factory()->create();
        $products = Product::factory()->count(2)->create();

        $data = new CreateOrderData(
            customerId: $customer->id,
            items: [
                new OrderItemData($products[0]->id, 2),
                new OrderItemData($products[1]->id, 1),
            ]
        );

        $order = $this->action->execute($data);

        expect($order)
            ->customer_id->toBe($customer->id)
            ->items->toHaveCount(2);
    });

    it('rolls back on failure', function () {
        // Test transaction rollback
    });
});
```

### 6. Architecture Tests

```php
// tests/Architecture/ArchitectureTest.php

arch('domain has no external dependencies')
    ->expect('App\Domain')
    ->toOnlyUse([
        'App\Domain',
        'Illuminate\Database\Eloquent',
        'Illuminate\Support',
    ]);

arch('controllers extend base controller')
    ->expect('App\Http\Controllers')
    ->toExtend('App\Http\Controllers\Controller')
    ->or()
    ->toHaveMethod('__invoke');

arch('actions are final')
    ->expect('App\Actions')
    ->toBeFinal();

arch('no debugging statements')
    ->expect(['dd', 'dump', 'ray'])
    ->not->toBeUsed();
```

### 7. Factory Quality

Check factories have proper states:

```php
// database/factories/OrderFactory.php
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'status' => OrderStatus::Draft,
            'total_amount' => $this->faker->numberBetween(1000, 50000),
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => OrderStatus::Draft]);
    }

    public function pending(): static
    {
        return $this->state(['status' => OrderStatus::Pending]);
    }

    public function confirmed(): static
    {
        return $this->state(['status' => OrderStatus::Confirmed]);
    }

    public function shipped(): static
    {
        return $this->state([
            'status' => OrderStatus::Shipped,
            'shipped_at' => now(),
        ]);
    }

    public function withItems(int $count = 3): static
    {
        return $this->has(OrderItem::factory()->count($count), 'items');
    }
}
```

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## Report Format

```markdown
# Testing Audit Report

## Summary
- **Total Tests**: 150
- **Passing**: 148
- **Failing**: 2
- **Coverage**: 82%

## Coverage by Layer

| Layer | Coverage | Target | Status |
|-------|----------|--------|--------|
| Models | 88% | 80% | ✅ |
| Services | 79% | 75% | ✅ |
| Controllers | 72% | 70% | ✅ |
| Jobs | 65% | 70% | ⚠️ |

## Missing Tests

### Critical (Must Add)
1. `OrderController::destroy` - No tests for deletion
2. `PaymentService::refund` - No refund tests

### Recommended
1. `Order::cancel` - Edge cases not covered
2. `UserController::update` - Validation tests missing

## Test Quality Issues

### Anti-Patterns Found
1. **Test interdependence** in `OrderTest.php`
2. **Missing assertions** in `ReportTest.php:45`
3. **Hardcoded dates** in `SubscriptionTest.php`

## Factory Assessment

| Model | Factory | States | Status |
|-------|---------|--------|--------|
| Order | ✅ | 5 states | ✅ Good |
| User | ✅ | 2 states | ⚠️ Add admin state |
| Product | ❌ | - | ❌ Missing |

## Recommendations

1. Add missing tests for critical paths
2. Increase Job test coverage to 70%
3. Add factory states for common scenarios
4. Fix test interdependence issues
```

## Commands

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage --min=80

# Run specific suite
php artisan test --testsuite=Feature

# Run in parallel
php artisan test --parallel

# Run architecture tests
php artisan test tests/Architecture
```
