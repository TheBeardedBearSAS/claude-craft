# Stratégie de Tests Symfony 8.1 / PHP 8.5 — Référence Complète

**Versions :** Symfony 8.1+ | PHP 8.5 | Pest 5 | PHPUnit 13 | Playwright

## Configuration Pest 5

```php
// Pest.php
<?php

pest()->extend(Tests\TestCase::class)->in('Feature');
pest()->extend(Tests\TestCase::class)->in('Unit');

// Browser testing : plugin navigateur Pest (Playwright), pas de classe de base Panther requise
pest()->extend(Tests\TestCase::class)->in('Browser');

// Arch tests
pest()->arch('strict types')
    ->expect('App')
    ->toUseStrictTypes();

pest()->arch('no helpers')
    ->expect('App')
    ->not->toUse(['dd', 'dump']);
```

**Source :** [Pest Configuration](https://pestphp.com/docs/configuring-tests)

## Tests Unit avec Pest 5

```php
// tests/Unit/Service/OrderServiceTest.php
<?php

use App\Service\OrderService;
use App\Entity\Order;

test('create order returns order with id', function () {
    // Arrange
    $service = new OrderService($this->getEntityManager());
    
    // Act
    $order = $service->create(['customer' => 'Alice']);
    
    // Assert
    expect($order)->toBeInstanceOf(Order::class)
        ->and($order->getId())->not->toBeNull()
        ->and($order->getCustomer())->toBe('Alice');
});
```

## Pest 5 Browser Testing (Playwright intégré)

Plus besoin de Panther pour l'E2E ni de configuration externe — Playwright natif dans Pest 5 (plugin navigateur de Pest, `visit()`).

```php
// tests/Browser/LoginTest.php
<?php

test('user can login', function () {
    visit('/login')
        ->fill('email', 'alice@example.com')
        ->fill('password', 'secret')
        ->click('Login')
        ->assertPathIs('/dashboard')
        ->assertSee('Welcome Alice');
});

test('login validates email format', function () {
    visit('/login')
        ->fill('email', 'invalid-email')
        ->fill('password', 'secret')
        ->click('Login')
        ->assertSee('Please provide a valid email');
});
```

**Source :** [Pest Browser Testing](https://pestphp.com/docs/browser-testing)

## Pest 5 Arch Tests améliorés

Presets réutilisables pour valider l'architecture.

```php
// tests/Arch/ArchitectureTest.php
<?php

// Clean Architecture — Domain ne dépend pas d'Infrastructure
pest()->arch('domain is independent')
    ->expect('App\Domain')
    ->not->toUse(['App\Infrastructure', 'Doctrine\ORM']);

// Use Cases utilisent des interfaces
pest()->arch('use cases depend on abstractions')
    ->expect('App\Application\UseCase')
    ->toOnlyUse(['App\Domain', 'App\Application\Port']);

// Controllers respectent le namespace
pest()->arch('controllers in correct namespace')
    ->expect('App\Presentation\Controller')
    ->toBeClasses()
    ->toHaveSuffix('Controller')
    ->toOnlyBeUsedIn(['App\Presentation']);

// Pas de dd() ou dump() en prod
pest()->arch('no debug helpers')
    ->expect(['dd', 'dump', 'var_dump'])
    ->not->toBeUsedIn('App');
```

**Source :** [Pest Arch Testing](https://pestphp.com/docs/arch-testing)

## Mutation Testing avec Infection

```bash
# composer.json
{
  "require-dev": {
    "infection/infection": "^0.29"
  }
}

# infection.json5
{
  "source": { "directories": ["src"] },
  "logs": { "badge": { "branch": "main" } },
  "mutators": { "@default": true },
  "minMsi": 80,
  "minCoveredMsi": 85
}

# Exécution
vendor/bin/infection --threads=4
```

**Philosophie :** "Code coverage = quantité. MSI (Mutation Score Indicator) = qualité."

**Source :** [Infection](https://infection.github.io/)

## Tests API avec ApiTestCase

```php
// tests/Feature/Api/UserApiTest.php
<?php

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

test('get user returns 200', function () {
    $client = static::createClient();
    $client->request('GET', '/api/users/123');
    
    expect($client->getResponse()->getStatusCode())->toBe(200)
        ->and(json_decode($client->getResponse()->getContent(), true))
        ->toHaveKey('id')
        ->toHaveKey('email');
});

test('create user validates email', function () {
    $client = static::createClient();
    $client->request('POST', '/api/users', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
        'name' => 'Bob',
        'email' => 'invalid',
    ]));
    
    expect($client->getResponse()->getStatusCode())->toBe(422);
});
```

## Doctrine Fixtures pour tests

```php
// tests/Fixtures/UserFixtures.php
<?php

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use App\Entity\User;

class UserFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $user = new User();
        $user->setEmail('alice@example.com');
        $user->setPassword('hashed_password');
        
        $manager->persist($user);
        $manager->flush();
        
        $this->addReference('user_alice', $user);
    }
}
```

## PHPStan Level 10 strict

```neon
# phpstan.neon
parameters:
    level: 10
    paths:
        - src
        - tests
    excludePaths:
        - src/Kernel.php
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    reportUnmatchedIgnoredErrors: true
```

**Source :** [PHPStan](https://phpstan.org/config-reference)

---

Voir `@.claude/rules/07-testing.md` pour principes transverses.
