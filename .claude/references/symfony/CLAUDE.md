# Symfony 8.0 / PHP 8.4+ - Quick Reference

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| PHP | 8.4+ | Symfony 8.0 requiert PHP 8.2+, mais 8.4 recommandé pour Lazy Objects natifs et Property Hooks |
| Symfony | 8.0.x (ou 7.4 LTS) | Stable 8.0.8 (mars 2026) — https://symfony.com/releases/8.0 |
| Doctrine ORM | 3.x | |
| PHPStan | 2.1.x | |
| Rector | 2.3.x | |
| Deptrac | v4.x | |

## Architecture Clean + DDD

```
src/
├── Domain/           # Entités pures, Value Objects, Interfaces
├── Application/      # Use Cases, Commands, Queries, DTOs
├── Infrastructure/   # Doctrine, Services externes, Cache
└── Presentation/     # Controllers, Forms, CLI
```

**Règle d'or**: Domain ne dépend de RIEN d'externe.

## Nouvelles Features Symfony 8

### JSON Streamer Component (8.0+)
```php
use Symfony\Component\JsonStreamer\JsonStreamReader;

// Streaming haute performance pour gros JSON (>100MB)
$reader = new JsonStreamReader($stream);
foreach ($reader->readItems() as $item) {
    yield $item; // Consommation mémoire constante
}
```
**Source:** https://symfony.com/blog/new-in-symfony-8-0-jsonstreamer-component  
Voir: `json-streamer.md`

### JsonPath Component (8.0+)
```php
use Symfony\Component\JsonPath\JsonPath;

// Navigation JSON via expressions (RFC 9535)
$result = JsonPath::select($json, '$.store.book[?@.price<10]');
```
**Source:** https://symfony.com/blog/new-in-symfony-8-0-jsonpath-component  
Voir: Intégrer dans `json-streamer.md`

### ObjectMapper Component (8.0+)
```php
use Symfony\Component\ObjectMapper\ObjectMapper;

// Mapping DTOs type-safe avec validation
$dto = $mapper->map($entity, OrderDto::class);
```
**Source:** https://symfony.com/blog/new-in-symfony-8-0-objectmapper-component  
Voir: `object-mapper.md`

### Wizard Forms Component (8.0+)
```php
use Symfony\Component\Form\Wizard\FormWizard;

// Formulaires multi-étapes avec state management
$wizard = $this->createWizard(OrderWizard::class);
$wizard->handleRequest($request);
```
**Source:** https://symfony.com/blog/new-in-symfony-8-0-wizard-forms  
Voir: Documentation à créer

### Service Container 2026
- Autowiring "Secure by Default"
- Lazy Objects natifs PHP 8.4
- AsDecorator amélioré
- Configuration PHP pure (arrays type-safe vs XML/YAML)
Voir: `service-container-2026.md`

## PHP 8.4+ Features

```php
// Property Hooks (PHP 8.4) — getters/setters natifs
class User {
    public string $name {
        get => strtoupper($this->name);
        set => ucfirst($value);
    }
}

// Lazy objects natifs (PHP 8.4)
$lazyService = $reflector->newLazyProxy(fn() => new Service());

// Asymmetric Visibility (PHP 8.4)
class Order {
    public private(set) string $status = 'pending';
}
```

**PHP 8.5 (stable, nov 2025)** — Nouvelles features :

```php
// Opérateur pipe |> (pipe vers callable)
$result = $value |> trim(...) |> strtolower(...);

// clone with — clonage partiel immutable
$updated = clone $order with { status: 'confirmed' };

// Attribut #[\NoDiscard] — avertit si la valeur de retour est ignorée
#[\NoDiscard]
public function save(): Result { ... }
```

**Source:** https://www.php.net/releases/8.5/

## Commandes Docker

```bash
# Qualité
make phpstan        # PHPStan niveau max
make cs-fixer       # PHP-CS-Fixer
make rector         # Rector 2.x
make deptrac        # Deptrac v4
make quality        # Tout en un

# Tests
make test           # PHPUnit
make infection      # Mutation testing
make behat          # Tests BDD
```

## Validation Architecture

```bash
# Deptrac v4 - vérifier les dépendances
vendor/bin/deptrac analyze
```

## Best Practices 2026

### Configuration PHP Pure
```php
// config/services.php — Préféré vs YAML/XML pour bundles
return static function (ContainerConfigurator $container): void {
    $services = $container->services()
        ->defaults()
        ->autowire()
        ->autoconfigure();
        
    $services->load('App\\', '../src/')
        ->exclude('../src/{Entity,Tests,Kernel.php}');
};
```

### Console Invokables
```php
#[AsCommand(name: 'app:import')]
class ImportCommand {
    public function __invoke(InputInterface $input): int {
        // Logique directe, pas extends Command
        return self::SUCCESS;
    }
}
```

### Performance Multi-Couches
```yaml
# config/packages/cache.yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'
        pools:
            cache.app:
                adapter: cache.adapter.apcu # Niveau 1 : APCu
                provider: cache.adapter.redis # Niveau 2 : Redis
```
**OPcache activé obligatoire en production** : `opcache.enable=1`, `opcache.memory_consumption=256M`

### Monitoring Inspector/Profiler
```php
// Profiler activé uniquement en dev/staging
// Symfony Inspector pour prod (https://inspector.symfony.com/)
```

## Documentation Complète

- `architecture.md` - Clean Architecture détaillée
- `coding-standards.md` - Standards PHP 8.4+
- `quality-tools.md` - Outils qualité
- `json-streamer.md` - JSON Streamer + JsonPath
- `object-mapper.md` - ObjectMapper Component
- `service-container-2026.md` - Container 2026
- `performance.md` - APCu, Redis, OPcache

## Checklist Rapide

- [ ] PHP 8.4+, Symfony 8.0.x
- [ ] Domain sans dépendances framework
- [ ] PHPStan niveau max, 0 erreur
- [ ] Deptrac v4 passe
- [ ] Tests coverage > 80%
- [ ] Configuration PHP pure pour bundles
- [ ] OPcache + APCu/Redis multi-couches
