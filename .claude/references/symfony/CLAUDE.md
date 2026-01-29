# Symfony 8.0 / PHP 8.5 - Quick Reference

## Versions Requises (2026)

| Composant | Version |
|-----------|---------|
| PHP | 8.5.x |
| Symfony | 8.0.x (ou 7.4 LTS) |
| Doctrine ORM | 3.x |
| PHPStan | 2.1.x |
| Rector | 2.3.x |
| Deptrac | v4.x |

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

### JSON Streamer Component
```php
use Symfony\Component\JsonStreamer\JsonStreamReader;

// Streaming haute performance pour gros JSON
$reader = new JsonStreamReader($stream);
foreach ($reader->readItems() as $item) {
    yield $item;
}
```
Voir: `json-streamer.md`

### ObjectMapper Component
```php
use Symfony\Component\ObjectMapper\ObjectMapper;

// Mapping DTOs type-safe
$dto = $mapper->map($entity, OrderDto::class);
```
Voir: `object-mapper.md`

### Service Container 2026
- Autowiring "Secure by Default"
- Lazy Objects natifs PHP 8.4
- AsDecorator amélioré
Voir: `service-container-2026.md`

## PHP 8.5 Features

```php
// Pipe operator
$result = $input |> trim(...) |> strtolower(...);

// Lazy objects natifs
$lazyService = $reflector->newLazyProxy(fn() => new Service());
```

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

## Documentation Complète

- `architecture.md` - Clean Architecture détaillée
- `coding-standards.md` - Standards PHP 8.5
- `quality-tools.md` - Outils qualité
- `json-streamer.md` - JSON Streamer Component
- `object-mapper.md` - ObjectMapper Component
- `service-container-2026.md` - Container 2026

## Checklist Rapide

- [ ] PHP 8.5, Symfony 8.0
- [ ] Domain sans dépendances framework
- [ ] PHPStan niveau max, 0 erreur
- [ ] Deptrac v4 passe
- [ ] Tests coverage > 80%
