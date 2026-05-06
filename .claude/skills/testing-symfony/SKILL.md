---
name: testing-symfony
description: Stratégie de Tests Symfony 8.0 / PHP 8.5. Use when writing tests, reviewing test coverage, or setting up testing.
context: fork
---

# Stratégie de Tests Symfony 8.0 / PHP 8.5

**Versions :** Symfony 8.0+ | PHP 8.5 | Pest 4.5+ | PHPUnit 13+ | Playwright

## Stack recommandée 2026

| Type | Outil | Usage |
|------|-------|-------|
| **Unit/Integration** | **Pest 4.5+** (PHPUnit 13, arch tests) | Tests backend Symfony |
| **Browser/E2E** | **Pest 4 Browser Testing** (Playwright natif) | Tests frontend intégrés |
| **Mutation** | **Infection** | Qualité des tests (MSI >= 80%) |
| **Static Analysis** | **PHPStan Level 10** | Vérification statique |

**Abandonner :** Panther (lourd, complexe) et Behat (verbeux). Pest 4 intègre tout.

**Sources :** [Pest 4](https://pestphp.com/docs/pest-v4-is-here-now-with-browser-testing), [Infection](https://infection.github.io/)

## Configuration Pest 4

```php
// Pest.php
<?php

use Symfony\Component\Panther\PantherTestCase;

pest()->extend(Tests\TestCase::class)->in('Feature');
pest()->extend(Tests\TestCase::class)->in('Unit');

// Browser testing
pest()->extend(PantherTestCase::class)->in('Browser');

// Arch tests
pest()->arch('strict types')
    ->expect('App')
    ->toUseStrictTypes();

pest()->arch('no helpers')
    ->expect('App')
    ->not->toUse(['dd', 'dump']);
```

**Source :** [Pest 4 Configuration](https://pestphp.com/docs/configuring-tests)

## Tests Unit avec Pest 4

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

## Pest 4 Browser Testing (Playwright intégré)

Plus besoin de Panther ou configuration externe — Playwright natif dans Pest 4.

```php
// tests/Browser/LoginTest.php
<?php

test('user can login', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/login')
            ->type('email', 'alice@example.com')
            ->type('password', 'secret')
            ->press('Login')
            ->assertPathIs('/dashboard')
            ->assertSee('Welcome Alice');
    });
});

test('login validates email format', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/login')
            ->type('email', 'invalid-email')
            ->type('password', 'secret')
            ->press('Login')
            ->assertSee('Please provide a valid email');
    });
});
```

**Source :** [Pest 4 Browser Testing](https://pestphp.com/docs/pest-v4-is-here-now-with-browser-testing)

## Pest 4 Arch Tests améliorés

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
