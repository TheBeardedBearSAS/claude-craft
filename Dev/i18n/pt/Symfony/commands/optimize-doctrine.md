---
description: Optimization Requêtes Doctrine
argument-hint: [arguments]
---

# Optimization Requêtes Doctrine

Tu es un expert Doctrine et DBA. Tu dois analyser les requêtes Doctrine du projet, identifier les problèmes de performance (N+1, index manquants, requêtes lentes) et proposer des optimisations.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Chemin vers une entité ou repository spécifique

Exemple : `/symfony:optimize-doctrine` ou `/symfony:optimize-doctrine src/Entity/Order.php`

## MISSION

### Step 1 : Activer le Profiling

```yaml
# config/packages/dev/doctrine.yaml
doctrine:
    dbal:
        profiling_collect_backtrace: true

when@dev:
    doctrine:
        dbal:
            logging: true
```

### Step 2 : Identifier les Problèmes

#### Détecter les N+1 Queries

```php
// PROBLÈME: N+1
$orders = $orderRepository->findAll();
foreach ($orders as $order) {
    echo $order->getCustomer()->getName(); // 1 requête par order!
}

// SOLUTION: Eager Loading
$orders = $orderRepository->createQueryBuilder('o')
    ->leftJoin('o.customer', 'c')
    ->addSelect('c')
    ->getQuery()
    ->getResult();
```

#### Analysisr avec le Debug Toolbar

```bash
# Vérifier le nombre de requêtes
docker compose exec php php bin/console doctrine:query:sql "SELECT 1"

# Profiler
docker compose exec php php bin/console debug:container doctrine.dbal.default_connection
```

### Step 3 : Optimizations Courantes

#### 3.1 Lazy Loading → Eager Loading

```php
// Repository
class OrderRepository extends ServiceEntityRepository
{
    public function findWithRelations(): array
    {
        return $this->createQueryBuilder('o')
            ->leftJoin('o.customer', 'c')->addSelect('c')
            ->leftJoin('o.items', 'i')->addSelect('i')
            ->leftJoin('i.product', 'p')->addSelect('p')
            ->orderBy('o.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
```

#### 3.2 Partial Selects (réduire les données)

```php
// Ne récupérer que les champs nécessaires
$results = $this->createQueryBuilder('u')
    ->select('partial u.{id, email, name}')
    ->getQuery()
    ->getResult();

// Ou utiliser un DTO
$results = $this->createQueryBuilder('u')
    ->select('NEW App\DTO\UserListDTO(u.id, u.email, u.name)')
    ->getQuery()
    ->getResult();
```

#### 3.3 Pagination Efficace

```php
use Doctrine\ORM\Tools\Pagination\Paginator;

public function findPaginated(int $page, int $limit = 20): Paginator
{
    $query = $this->createQueryBuilder('o')
        ->leftJoin('o.customer', 'c')->addSelect('c')
        ->orderBy('o.createdAt', 'DESC')
        ->setFirstResult(($page - 1) * $limit)
        ->setMaxResults($limit)
        ->getQuery();

    return new Paginator($query, fetchJoinCollection: true);
}
```

#### 3.4 Cursor Pagination (meilleure performance)

```php
public function findAfterCursor(?string $cursor, int $limit = 20): array
{
    $qb = $this->createQueryBuilder('o')
        ->orderBy('o.id', 'ASC')
        ->setMaxResults($limit + 1);

    if ($cursor) {
        $qb->where('o.id > :cursor')
           ->setParameter('cursor', $cursor);
    }

    $results = $qb->getQuery()->getResult();

    $hasMore = count($results) > $limit;
    if ($hasMore) {
        array_pop($results);
    }

    return [
        'items' => $results,
        'nextCursor' => $hasMore ? end($results)->getId() : null,
    ];
}
```

#### 3.5 Batch Processing

```php
public function processLargeDataset(): void
{
    $batchSize = 100;
    $i = 0;

    $query = $this->createQueryBuilder('o')
        ->getQuery()
        ->iterate(); // Utilise un cursor

    foreach ($query as $row) {
        $order = $row[0];
        $this->process($order);

        if (++$i % $batchSize === 0) {
            $this->getEntityManager()->flush();
            $this->getEntityManager()->clear(); // Libère la mémoire
        }
    }

    $this->getEntityManager()->flush();
}
```

#### 3.6 Index Stratégiques

```php
#[ORM\Entity]
#[ORM\Table(name: 'orders')]
#[ORM\Index(columns: ['status'], name: 'idx_order_status')]
#[ORM\Index(columns: ['customer_id', 'created_at'], name: 'idx_order_customer_date')]
#[ORM\Index(columns: ['created_at'], name: 'idx_order_created')]
class Order
{
    // ...
}
```

#### 3.7 Cache des Résultats

```php
// Second Level Cache (config)
doctrine:
    orm:
        second_level_cache:
            enabled: true
            region_cache_driver:
                type: pool
                pool: cache.doctrine.orm.second_level

// Entity avec cache
#[ORM\Cache(usage: 'READ_ONLY')]
class Country
{
    // Données rarement modifiées
}

// Query cache
$results = $this->createQueryBuilder('c')
    ->getQuery()
    ->enableResultCache(3600, 'countries_list')
    ->getResult();
```

### Step 4 : Analysis des Index

```sql
-- PostgreSQL: Index non utilisés
SELECT schemaname, tablename, indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- PostgreSQL: Tables sans index (hors PK)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT DISTINCT tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
);

-- MySQL: Requêtes lentes
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

### Step 5 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
📊 RAPPORT OPTIMISATION DOCTRINE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔍 PROBLÈMES DÉTECTÉS
──────────────────────────────────────────────────────────────

### N+1 Queries (Critique)

| Fichier | Ligne | Relation | Impact |
|---------|-------|----------|--------|
| OrderController.php | 45 | order→customer | 100+ req/page |
| ProductService.php | 78 | product→category | 50+ req/page |

### Index Manquants (Important)

| Table | Colonnes | Requêtes affectées |
|-------|----------|-------------------|
| orders | status | findByStatus() |
| products | category_id, active | findActiveByCategory() |

### Requêtes Lentes (> 100ms)

| Requête | Temps moyen | Appels/jour |
|---------|-------------|-------------|
| SELECT * FROM orders... | 250ms | 1500 |
| SELECT * FROM products... | 180ms | 3000 |

──────────────────────────────────────────────────────────────
🔧 SOLUTIONS PROPOSÉES
──────────────────────────────────────────────────────────────

### 1. Corriger N+1 - OrderController.php

```php
// AVANT
$orders = $this->orderRepository->findAll();

// APRÈS
$orders = $this->orderRepository->findWithCustomer();
```

### 2. Ajouter Index

```php
#[ORM\Index(columns: ['status'], name: 'idx_order_status')]
```

### 3. Activer le Query Cache

```php
->enableResultCache(3600, 'orders_list')
```

──────────────────────────────────────────────────────────────
📈 IMPACT ESTIMÉ
──────────────────────────────────────────────────────────────

| Optimisation | Avant | Après | Gain |
|--------------|-------|-------|------|
| Page Orders | 102 req | 3 req | -97% |
| Temps moyen | 450ms | 80ms | -82% |
| Charge DB | 100% | 30% | -70% |

──────────────────────────────────────────────────────────────
🎯 PROCHAINES ÉTAPES
──────────────────────────────────────────────────────────────

1. [ ] Appliquer les eager loadings
2. [ ] Créer les migrations pour les index
3. [ ] Configurer le Second Level Cache
4. [ ] Monitorer avec Blackfire/Profiler
```

## Commands Utiles

```bash
# Valider le schéma
docker compose exec php php bin/console doctrine:schema:validate

# Voir les requêtes générées
docker compose exec php php bin/console doctrine:query:dql "SELECT o FROM App\Entity\Order o" --dump-sql

# Créer migration pour index
docker compose exec php php bin/console make:migration

# Stats des entités
docker compose exec php php bin/console doctrine:mapping:info
```
