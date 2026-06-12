# Symfony 8.1 / PHP 8.5 (8.4+ min) - Quick Reference

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| PHP | 8.4+ (8.5 recommandé) | Symfony 8.1 requiert PHP 8.4+ minimum ; PHP 8.5 recommandé (stable nov. 2025 — pipe operator, clone with, #[\NoDiscard]) |
| Symfony | 8.1.x (ou 7.4 LTS) | Stable 8.1 (mai 2026, recommandée) — https://symfony.com/releases/8.1 |
| Doctrine ORM | 3.x | |
| PHPStan | 2.2.x | |
| Rector | 2.4.x | |
| Deptrac | v4.x | |

## Support Timeline Symfony

| Version | Type | Fin de maintenance | Fin de sécurité | Recommandation |
|---------|------|--------------------|-----------------|----------------|
| **7.4** | LTS | Nov. 2028 | Nov. 2029 | ✅ Recommandée (LTS) |
| **8.0** | Standard | Juil. 2026 | Juil. 2026 | ❌ EOS imminent — ne pas démarrer |
| **8.1** | Standard | Jan. 2027 | Jan. 2027 | ✅ Recommandée (dernière stable) |
| **8.4** | LTS (attendue) | ~Nov. 2030 | ~Nov. 2031 | ⏳ Sortie prévue nov. 2027 |

**Règle :** démarrer un nouveau projet sur **7.4 LTS** (support jusqu'à 2029) ou **8.1** (dernière stable). Ne jamais choisir **8.0** (EOS juillet 2026).

**Source:** https://symfony.com/releases

## Architecture Clean + DDD

```
src/
├── Domain/           # Entités pures, Value Objects, Interfaces
├── Application/      # Use Cases, Commands, Queries, DTOs
├── Infrastructure/   # Doctrine, Services externes, Cache
└── Presentation/     # Controllers, Forms, CLI
```

**Règle d'or**: Domain ne dépend de RIEN d'externe.

## Nouvelles Features Symfony 8.1

> **Source:** [Symfony 8.1 curated new features](https://symfony.com/blog/symfony-8-1-curated-new-features)

### DeepCloner

Composant de clonage profond rapide et économe en mémoire pour les graphes d'objets PHP complexes.
4× plus rapide sur les graphes typiques, jusqu'à 15× sur les graphes denses en propriétés. Utilisé en interne par DependencyInjection, FrameworkBundle, Form et Cache.

```php
use Symfony\Component\DeepClone\DeepCloner;

$cloner = new DeepCloner();
$copy = $cloner->deepClone($original); // Graphe cloné sans sérialisation
```

**Source:** https://symfony.com/blog/new-in-symfony-8-1-deep-cloner

### Console Argument Resolvers

Résolution automatique des arguments CLI vers des types PHP fortement typés (enums, UUIDs, ULIDs, Value Objects, services), identique au pattern des argument resolvers HTTP.

```php
#[AsCommand(name: 'app:process')]
final class ProcessCommand
{
    public function __invoke(
        #[Autowire] OrderId $orderId,    // Résolu depuis l'argument CLI
        UserStatus $status,              // Enum résolu automatiquement
        OrderRepositoryInterface $repo,  // Service injecté
    ): int {
        // Plus besoin de $input->getArgument('order-id')
        return Command::SUCCESS;
    }
}
```

**Source:** https://symfony.com/blog/new-in-symfony-8-1-console-argument-resolvers

### Composant TUI (Terminal UI)

Nouveau composant pour construire des interfaces utilisateur interactives dans le terminal : widgets, layouts, gestion des inputs, support de la souris, rendu temps réel. Basé sur PHP Fibers et la boucle d'événements Revolt (pure PHP 8.4+, sans extensions).

```php
use Symfony\Component\Tui\Application;
use Symfony\Component\Tui\Widget\Text;

$app = new Application();
$app->run(fn() => new Text('Hello, TUI!'));
```

**Source:** https://symfony.com/blog/introducing-the-symfony-tui-component

### Améliorations Console 8.1

- Image pasting dans les inputs interactifs
- Questions à choix avec validation de réponse
- Raw input forwarding
- Améliorations progress bar et tests

**Source:** https://symfony.com/blog/new-in-symfony-8-1-console-progress-and-testing-improvements

---

## Nouvelles Features Symfony 8

### HTTP-Less Applications (8.1+)
```php
// Kernel/Bundle infrastructure extraite dans DependencyInjection :
// commandes console, message consumers et workers sans couche HTTP.
// Nouveaux : ServicesBundle, ConsoleBundle, attribut #[RequiredBundle].
// Commandes groupées : plusieurs méthodes d'une classe = autant de commandes,
// dépendances partagées injectées une seule fois.
```
**Source:** https://symfony.com/blog/new-in-symfony-8-1-http-less-symfony-applications
Voir aussi : nouveau composant **TUI** (Terminal UI) en 8.1.

### JSON Streamer Component (7.3+, amélioré en 8.0/8.1)
```php
use Symfony\Component\JsonStreamer\Read\StreamReaderInterface;

// Streaming haute performance pour gros JSON (>100MB)
// Injecter StreamReaderInterface par DI (service: json_streamer.stream_reader)
final readonly class MyImporter {
    public function __construct(private StreamReaderInterface $reader) {}
    public function stream(mixed $stream): iterable {
        foreach ($this->reader->read($stream) as $item) {
            yield $item; // Consommation mémoire constante
        }
    }
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

- [ ] PHP 8.4+, Symfony 8.1.x
- [ ] Domain sans dépendances framework
- [ ] PHPStan niveau max, 0 erreur
- [ ] Deptrac v4 passe
- [ ] Tests coverage > 80%
- [ ] Configuration PHP pure pour bundles
- [ ] OPcache + APCu/Redis multi-couches
