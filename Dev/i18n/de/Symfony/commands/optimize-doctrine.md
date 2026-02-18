---
description: Doctrine-Abfragen optimieren
argument-hint: [arguments]
---

# Doctrine-Abfragen optimieren

Du bist ein Doctrine-Experte und DBA. Du musst die Doctrine-Abfragen des Projekts analysieren, Performance-Probleme identifizieren (N+1, fehlende Indizes, langsame Abfragen) und Optimierungen vorschlagen.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Pfad zu einer bestimmten Entity oder einem Repository

Beispiel: `/symfony:optimize-doctrine` oder `/symfony:optimize-doctrine src/Entity/Order.php`

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

### Schritt 1: Profiling aktivieren

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

### Schritt 2: Probleme identifizieren

#### N+1-Abfragen erkennen

```php
// PROBLEM: N+1
$orders = $orderRepository->findAll();
foreach ($orders as $order) {
    echo $order->getCustomer()->getName(); // 1 Abfrage pro Bestellung!
}

// LÖSUNG: Eager Loading
$orders = $orderRepository->createQueryBuilder('o')
    ->leftJoin('o.customer', 'c')
    ->addSelect('c')
    ->getQuery()
    ->getResult();
```

#### Mit Debug Toolbar analysieren

```bash
# Anzahl der Abfragen prüfen
docker compose exec php php bin/console doctrine:query:sql "SELECT 1"

# Profiler
docker compose exec php php bin/console debug:container doctrine.dbal.default_connection
```

### Schritt 3: Häufige Optimierungen

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

#### 3.2 Partial Selects (Daten reduzieren)

```php
// Nur benötigte Felder abrufen
$results = $this->createQueryBuilder('u')
    ->select('partial u.{id, email, name}')
    ->getQuery()
    ->getResult();

// Oder DTO verwenden
$results = $this->createQueryBuilder('u')
    ->select('NEW App\DTO\UserListDTO(u.id, u.email, u.name)')
    ->getQuery()
    ->getResult();
```

#### 3.3 Effiziente Paginierung

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

#### 3.4 Cursor-Paginierung (bessere Performance)

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

#### 3.5 Batch-Verarbeitung

```php
public function processLargeDataset(): void
{
    $batchSize = 100;
    $i = 0;

    $query = $this->createQueryBuilder('o')
        ->getQuery()
        ->iterate(); // Verwendet Cursor

    foreach ($query as $row) {
        $order = $row[0];
        $this->process($order);

        if (++$i % $batchSize === 0) {
            $this->getEntityManager()->flush();
            $this->getEntityManager()->clear(); // Gibt Speicher frei
        }
    }

    $this->getEntityManager()->flush();
}
```

#### 3.6 Strategische Indizes

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

#### 3.7 Ergebnis-Caching

```php
// Second Level Cache (config)
doctrine:
    orm:
        second_level_cache:
            enabled: true
            region_cache_driver:
                type: pool
                pool: cache.doctrine.orm.second_level

// Entity mit Cache
#[ORM\Cache(usage: 'READ_ONLY')]
class Country
{
    // Selten geänderte Daten
}

// Query-Cache
$results = $this->createQueryBuilder('c')
    ->getQuery()
    ->enableResultCache(3600, 'countries_list')
    ->getResult();
```

### Schritt 4: Index-Analyse

```sql
-- PostgreSQL: Ungenutzte Indizes
SELECT schemaname, tablename, indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- PostgreSQL: Tabellen ohne Index (außer PK)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT DISTINCT tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
);

-- MySQL: Langsame Abfragen
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

### Schritt 5: Bericht generieren

```
══════════════════════════════════════════════════════════════
📊 DOCTRINE-OPTIMIERUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔍 ERKANNTE PROBLEME
──────────────────────────────────────────────────────────────

### N+1-Abfragen (Kritisch)

| Datei | Zeile | Beziehung | Auswirkung |
|-------|-------|-----------|------------|
| OrderController.php | 45 | order→customer | 100+ req/Seite |
| ProductService.php | 78 | product→category | 50+ req/Seite |

### Fehlende Indizes (Wichtig)

| Tabelle | Spalten | Betroffene Abfragen |
|---------|---------|-------------------|
| orders | status | findByStatus() |
| products | category_id, active | findActiveByCategory() |

### Langsame Abfragen (> 100ms)

| Abfrage | Durchschn. Zeit | Aufrufe/Tag |
|---------|-----------------|-------------|
| SELECT * FROM orders... | 250ms | 1500 |
| SELECT * FROM products... | 180ms | 3000 |

──────────────────────────────────────────────────────────────
🔧 VORGESCHLAGENE LÖSUNGEN
──────────────────────────────────────────────────────────────

### 1. N+1 korrigieren - OrderController.php

```php
// VORHER
$orders = $this->orderRepository->findAll();

// NACHHER
$orders = $this->orderRepository->findWithCustomer();
```

### 2. Index hinzufügen

```php
#[ORM\Index(columns: ['status'], name: 'idx_order_status')]
```

### 3. Query-Cache aktivieren

```php
->enableResultCache(3600, 'orders_list')
```

──────────────────────────────────────────────────────────────
📈 GESCHÄTZTE AUSWIRKUNG
──────────────────────────────────────────────────────────────

| Optimierung | Vorher | Nachher | Gewinn |
|-------------|--------|---------|--------|
| Orders-Seite | 102 req | 3 req | -97% |
| Durchschn. Zeit | 450ms | 80ms | -82% |
| DB-Last | 100% | 30% | -70% |

──────────────────────────────────────────────────────────────
🎯 NÄCHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Eager Loadings anwenden
2. [ ] Migrationen für Indizes erstellen
3. [ ] Second Level Cache konfigurieren
4. [ ] Mit Blackfire/Profiler überwachen
```

## Nützliche Befehle

```bash
# Schema validieren
docker compose exec php php bin/console doctrine:schema:validate

# Generierte Abfragen anzeigen
docker compose exec php php bin/console doctrine:query:dql "SELECT o FROM App\Entity\Order o" --dump-sql

# Migration für Index erstellen
docker compose exec php php bin/console make:migration

# Entity-Statistiken
docker compose exec php php bin/console doctrine:mapping:info
```
