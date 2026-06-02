# Service Container 2026 - Symfony 8.1

## Overview

Le Service Container de Symfony 8.1 apporte des améliorations majeures pour 2026:
- **Autowiring "Secure by Default"**
- **Lazy Objects natifs PHP 8.4**
- **AsDecorator amélioré**
- **Attributed Services**
- **Configuration PHP Pure** (préférée vs YAML/XML pour bundles)
- **Console Invokables** (attributs PHP)

**Sources:**
- https://symfony.com/releases/8.1
- https://symfony.com/blog/new-in-symfony-8-0-wizard-forms

## Autowiring Secure by Default

### Principe

Symfony 8.1 applique le principe du moindre privilège: les services ne sont plus publics par défaut et l'autowiring est plus strict.

```yaml
# config/services.yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true
        public: false  # Par défaut dans Symfony 8.1

    App\:
        resource: '../src/'
        exclude:
            - '../src/Domain/Entity/'
            - '../src/Kernel.php'
```

### Interfaces Obligatoires

```php
<?php

declare(strict_types=1);

namespace App\Domain\Repository;

// ✅ Symfony 8.1: Interface obligatoire pour autowiring
interface OrderRepositoryInterface
{
    public function findById(OrderId $id): ?Order;
    public function save(Order $order): void;
}
```

```yaml
# config/services.yaml
services:
    # Binding interface → implémentation
    App\Domain\Repository\OrderRepositoryInterface:
        class: App\Infrastructure\Persistence\Doctrine\DoctrineOrderRepository
```

### Autowiring par Attribut

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine;

use App\Domain\Repository\OrderRepositoryInterface;
use Symfony\Component\DependencyInjection\Attribute\AsAlias;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsAlias(OrderRepositoryInterface::class)]
final readonly class DoctrineOrderRepository implements OrderRepositoryInterface
{
    public function __construct(
        #[Autowire(service: 'doctrine.orm.default_entity_manager')]
        private EntityManagerInterface $entityManager,
    ) {}

    // Implémentation...
}
```

## Lazy Objects Natifs PHP 8.4

### Configuration Automatique

Symfony 8.1 utilise les lazy objects natifs de PHP 8.4 pour les services coûteux.

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Service;

use Symfony\Component\DependencyInjection\Attribute\Lazy;

// ✅ Service lazy automatique avec PHP 8.4
#[Lazy]
final class ExpensiveApiClient
{
    public function __construct()
    {
        // Connexion coûteuse - différée jusqu'à l'usage
        $this->connection = $this->initializeConnection();
    }

    public function fetch(string $endpoint): array
    {
        return $this->connection->get($endpoint);
    }
}
```

### Lazy avec Conditions

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Cache;

use Symfony\Component\DependencyInjection\Attribute\Lazy;
use Symfony\Component\DependencyInjection\Attribute\When;

// Lazy seulement en production
#[Lazy]
#[When(env: 'prod')]
final class RedisCache implements CacheInterface
{
    public function __construct(
        private string $redisUrl,
    ) {
        // Connexion Redis différée
    }
}

// En dev, pas de lazy (debug plus facile)
#[When(env: 'dev')]
final class ArrayCache implements CacheInterface
{
    private array $cache = [];

    // Pas de lazy, instantiation immédiate
}
```

### Comparaison avec l'ancienne méthode

```php
// Avant PHP 8.4 (Symfony 6.x/7.x) - Proxies générés
// vendor/symfony/.../Proxy/ExpensiveApiClientProxy.php

// PHP 8.4+ / Symfony 8.1 - Lazy natif
$reflector = new ReflectionClass(ExpensiveApiClient::class);
$proxy = $reflector->newLazyProxy(function () {
    return new ExpensiveApiClient(); // Créé à la demande
});
```

## AsDecorator Amélioré

### Décorateur Simple

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Cache;

use App\Domain\Repository\OrderRepositoryInterface;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Contracts\Cache\CacheInterface;

#[AsDecorator(decorates: OrderRepositoryInterface::class)]
final readonly class CachedOrderRepository implements OrderRepositoryInterface
{
    public function __construct(
        private OrderRepositoryInterface $inner,
        private CacheInterface $cache,
    ) {}

    public function findById(OrderId $id): ?Order
    {
        $cacheKey = 'order_' . (string) $id;

        return $this->cache->get($cacheKey, function () use ($id) {
            return $this->inner->findById($id);
        });
    }

    public function save(Order $order): void
    {
        $this->inner->save($order);
        $this->cache->delete('order_' . (string) $order->getId());
    }
}
```

### Décorateurs Chaînés avec Priorité

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Logging;

use App\Domain\Repository\OrderRepositoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;

// Priorité 10: Logging en premier (extérieur)
#[AsDecorator(decorates: OrderRepositoryInterface::class, priority: 10)]
final readonly class LoggingOrderRepository implements OrderRepositoryInterface
{
    public function __construct(
        private OrderRepositoryInterface $inner,
        private LoggerInterface $logger,
    ) {}

    public function findById(OrderId $id): ?Order
    {
        $this->logger->debug('Finding order', ['id' => (string) $id]);

        $order = $this->inner->findById($id);

        $this->logger->debug('Order found', ['found' => $order !== null]);

        return $order;
    }

    public function save(Order $order): void
    {
        $this->logger->info('Saving order', ['id' => (string) $order->getId()]);
        $this->inner->save($order);
    }
}
```

```php
<?php

// Priorité 5: Cache ensuite (intérieur)
#[AsDecorator(decorates: OrderRepositoryInterface::class, priority: 5)]
final readonly class CachedOrderRepository implements OrderRepositoryInterface
{
    // Cache decorator...
}

// Résultat: Logging → Cache → DoctrineRepository
```

### Décorateur Conditionnel

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Metrics;

use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\When;

// Métriques seulement en production
#[AsDecorator(decorates: OrderRepositoryInterface::class, priority: 15)]
#[When(env: 'prod')]
final readonly class MetricsOrderRepository implements OrderRepositoryInterface
{
    public function __construct(
        private OrderRepositoryInterface $inner,
        private MetricsCollector $metrics,
    ) {}

    public function findById(OrderId $id): ?Order
    {
        $start = microtime(true);

        try {
            return $this->inner->findById($id);
        } finally {
            $duration = microtime(true) - $start;
            $this->metrics->timing('order.repository.find', $duration);
        }
    }
}
```

## Attributed Services

### Service Tags par Attribut

```php
<?php

declare(strict_types=1);

namespace App\Application\EventHandler;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('app.domain_event_handler')]
abstract class AbstractDomainEventHandler
{
    abstract public function handle(DomainEvent $event): void;
}
```

```php
<?php

#[AsTaggedItem(index: 'order.created')]
final class SendOrderConfirmationHandler extends AbstractDomainEventHandler
{
    public function handle(DomainEvent $event): void
    {
        // Envoyer email de confirmation
    }
}
```

### Service Locator par Attribut

```php
<?php

declare(strict_types=1);

namespace App\Application\Bus;

use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;

final readonly class DomainEventBus
{
    public function __construct(
        #[AutowireLocator('app.domain_event_handler')]
        private ServiceLocator $handlers,
    ) {}

    public function dispatch(DomainEvent $event): void
    {
        $handlerKey = $this->getHandlerKey($event);

        if ($this->handlers->has($handlerKey)) {
            $this->handlers->get($handlerKey)->handle($event);
        }
    }
}
```

## Configuration Environnementale

### Services par Environnement

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Email;

use Symfony\Component\DependencyInjection\Attribute\When;

// Production: vrai service email
#[When(env: 'prod')]
final class SmtpEmailSender implements EmailSenderInterface
{
    public function send(Email $email): void
    {
        // Envoi SMTP réel
    }
}

// Dev/Test: fake qui log
#[When(env: 'dev')]
#[When(env: 'test')]
final class LoggingEmailSender implements EmailSenderInterface
{
    public function __construct(
        private LoggerInterface $logger,
    ) {}

    public function send(Email $email): void
    {
        $this->logger->info('Email would be sent', [
            'to' => $email->getTo(),
            'subject' => $email->getSubject(),
        ]);
    }
}
```

## Best Practices 2026

### 1. Toujours Utiliser des Interfaces

```php
// ✅ BON
public function __construct(
    private OrderRepositoryInterface $repository,
) {}

// ❌ MAUVAIS
public function __construct(
    private DoctrineOrderRepository $repository,
) {}
```

### 2. Lazy pour Services Coûteux

```php
// ✅ Services qui font I/O ou connexions réseau
#[Lazy]
final class ExternalApiClient { }

#[Lazy]
final class DatabaseConnection { }

// ❌ Services légers - pas de lazy
final class OrderValidator { }  // Pure logique
final class PriceCalculator { } // Pure logique
```

### 3. Décorateurs pour Cross-Cutting Concerns

```php
// ✅ BON - Décorateurs pour logging, cache, metrics
#[AsDecorator(decorates: OrderRepositoryInterface::class)]
final class CachedOrderRepository { }

#[AsDecorator(decorates: OrderRepositoryInterface::class)]
final class LoggingOrderRepository { }

// ❌ MAUVAIS - Tout dans le repository
final class DoctrineOrderRepository {
    public function findById(OrderId $id): ?Order
    {
        $this->logger->debug(...);  // Couplage
        $cached = $this->cache->get(...);  // Couplage
        // ...
    }
}
```

## Debugging

### Voir les Services

```bash
# Liste des services
php bin/console debug:container

# Détails d'un service
php bin/console debug:container App\\Domain\\Repository\\OrderRepositoryInterface

# Voir les décorateurs
php bin/console debug:container --show-private --tag=container.decorator
```

### Vérifier le Lazy Loading

```bash
# Voir les proxies lazy
php bin/console debug:container --show-private --parameter=lazy
```

## Configuration PHP Pure (Recommandé 2026)

### Préférer PHP vs YAML/XML pour Bundles

```php
<?php
// config/services.php — Type-safe, autocomplétion IDE

declare(strict_types=1);

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $container): void {
    $services = $container->services()
        ->defaults()
        ->autowire()
        ->autoconfigure()
        ->private();  // Secure by default

    // Auto-enregistrement namespaces
    $services->load('App\\', '../src/')
        ->exclude([
            '../src/Domain/Entity/',
            '../src/Application/Dto/',
            '../src/Kernel.php',
        ]);

    // Binding explicite interfaces
    $services->set(OrderRepositoryInterface::class)
        ->class(DoctrineOrderRepository::class);

    // Configuration avec types
    $services->set(MailerService::class)
        ->arg('$apiKey', '%env(MAILER_API_KEY)%')
        ->arg('$timeout', 30);
};
```

**Avantages:**
- Vérification types IDE/PHPStan
- Refactoring sûr
- Pas de YAML parsing runtime

### Console Commands Invokables

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Console;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:import-orders',
    description: 'Import orders from JSON file',
)]
final readonly class ImportOrdersCommand
{
    public function __construct(
        private ImportOrdersUseCase $useCase,
    ) {}

    /**
     * Pattern invokable — pas besoin extends Command.
     */
    public function __invoke(InputInterface $input, OutputInterface $output): int
    {
        $result = $this->useCase->execute();
        
        $output->writeln(sprintf('Imported %d orders', $result->count));
        
        return self::SUCCESS;
    }
}
```

**Avantages:**
- Pas de couplage à `Command`
- Testable sans framework
- Configuration via attributs

## Wizard Forms Component (Symfony 8.0+)

### Formulaires Multi-Étapes avec State Management

```php
<?php

declare(strict_types=1);

namespace App\Application\Wizard;

use Symfony\Component\Form\Wizard\FormWizard;
use Symfony\Component\Form\Wizard\Step;

final class OrderWizard extends FormWizard
{
    protected function configure(): void
    {
        $this
            ->addStep('customer', new Step(
                formType: CustomerType::class,
                label: 'Informations Client',
            ))
            ->addStep('products', new Step(
                formType: ProductSelectionType::class,
                label: 'Sélection Produits',
            ))
            ->addStep('payment', new Step(
                formType: PaymentType::class,
                label: 'Paiement',
            ))
            ->onComplete(function (array $data) {
                // Logique finale après toutes les étapes
                $this->orderService->createOrder($data);
            });
    }
}
```

### Controller Wizard

```php
<?php

declare(strict_types=1);

namespace App\Presentation\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class OrderController extends AbstractController
{
    #[Route('/order/wizard', name: 'order_wizard')]
    public function wizard(Request $request): Response
    {
        $wizard = $this->createWizard(OrderWizard::class);
        
        $wizard->handleRequest($request);
        
        if ($wizard->isCompleted()) {
            $this->addFlash('success', 'Commande créée avec succès');
            return $this->redirectToRoute('order_confirmation');
        }
        
        return $this->render('order/wizard.html.twig', [
            'wizard' => $wizard,
            'current_step' => $wizard->getCurrentStep(),
            'progress' => $wizard->getProgress(), // 0-100%
        ]);
    }
}
```

**Source:** https://symfony.com/blog/new-in-symfony-8-0-wizard-forms

## Ressources

- [Symfony DI Component](https://symfony.com/doc/current/components/dependency_injection.html)
- [PHP 8.4 Lazy Objects](https://wiki.php.net/rfc/lazy-objects)
- [Symfony 8.0 Wizard Forms](https://symfony.com/blog/new-in-symfony-8-0-wizard-forms)
- [Decorator Pattern](https://refactoring.guru/design-patterns/decorator)

---

**Date de dernière mise à jour:** 2026-04-14
**Version:** 1.1.0
