---
description: Optimización de Consultas Doctrine
argument-hint: [arguments]
---

# Optimización de Consultas Doctrine

Eres un experto en Doctrine y DBA. Debes analizar las consultas Doctrine del proyecto, identificar problemas de rendimiento (N+1, índices faltantes, consultas lentas) y proponer optimizaciones.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Ruta hacia una entidad o repository específico

Ejemplo: `/symfony:optimize-doctrine` o `/symfony:optimize-doctrine src/Entity/Order.php`

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

### Paso 1: Activar el Profiling

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

### Paso 2: Identificar los Problemas

#### Detectar N+1 Queries

```php
// PROBLEMA: N+1
$orders = $orderRepository->findAll();
foreach ($orders as $order) {
    echo $order->getCustomer()->getName(); // ¡1 consulta por order!
}

// SOLUCIÓN: Eager Loading
$orders = $orderRepository->createQueryBuilder('o')
    ->leftJoin('o.customer', 'c')
    ->addSelect('c')
    ->getQuery()
    ->getResult();
```

#### Analizar con el Debug Toolbar

```bash
# Verificar número de consultas
docker compose exec php php bin/console doctrine:query:sql "SELECT 1"

# Profiler
docker compose exec php php bin/console debug:container doctrine.dbal.default_connection
```

### Paso 3: Optimizaciones Comunes

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

#### 3.2 Selecciones Parciales (reducir los datos)

```php
// Recuperar solo los campos necesarios
$results = $this->createQueryBuilder('u')
    ->select('partial u.{id, email, name}')
    ->getQuery()
    ->getResult();

// O usar un DTO
$results = $this->createQueryBuilder('u')
    ->select('NEW App\DTO\UserListDTO(u.id, u.email, u.name)')
    ->getQuery()
    ->getResult();
```

#### 3.3 Paginación Eficiente

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

#### 3.4 Paginación por Cursor (mejor rendimiento)

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

#### 3.5 Procesamiento por Lotes

```php
public function processLargeDataset(): void
{
    $batchSize = 100;
    $i = 0;

    $query = $this->createQueryBuilder('o')
        ->getQuery()
        ->iterate(); // Usa un cursor

    foreach ($query as $row) {
        $order = $row[0];
        $this->process($order);

        if (++$i % $batchSize === 0) {
            $this->getEntityManager()->flush();
            $this->getEntityManager()->clear(); // Libera la memoria
        }
    }

    $this->getEntityManager()->flush();
}
```

#### 3.6 Índices Estratégicos

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

#### 3.7 Caché de Resultados

```php
// Second Level Cache (config)
doctrine:
    orm:
        second_level_cache:
            enabled: true
            region_cache_driver:
                type: pool
                pool: cache.doctrine.orm.second_level

// Entidad con caché
#[ORM\Cache(usage: 'READ_ONLY')]
class Country
{
    // Datos raramente modificados
}

// Query cache
$results = $this->createQueryBuilder('c')
    ->getQuery()
    ->enableResultCache(3600, 'countries_list')
    ->getResult();
```

### Paso 4: Análisis de Índices

```sql
-- PostgreSQL: Índices no utilizados
SELECT schemaname, tablename, indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- PostgreSQL: Tablas sin índices (excepto PK)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT DISTINCT tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
);

-- MySQL: Consultas lentas
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

### Paso 5: Generar el Informe

```
══════════════════════════════════════════════════════════════
📊 INFORME DE OPTIMIZACIÓN DOCTRINE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔍 PROBLEMAS DETECTADOS
──────────────────────────────────────────────────────────────

### N+1 Queries (Crítico)

| Archivo | Línea | Relación | Impacto |
|---------|-------|----------|---------|
| OrderController.php | 45 | order→customer | 100+ req/página |
| ProductService.php | 78 | product→category | 50+ req/página |

### Índices Faltantes (Importante)

| Tabla | Columnas | Consultas afectadas |
|-------|----------|-------------------|
| orders | status | findByStatus() |
| products | category_id, active | findActiveByCategory() |

### Consultas Lentas (> 100ms)

| Consulta | Tiempo medio | Llamadas/día |
|---------|-------------|-------------|
| SELECT * FROM orders... | 250ms | 1500 |
| SELECT * FROM products... | 180ms | 3000 |

──────────────────────────────────────────────────────────────
🔧 SOLUCIONES PROPUESTAS
──────────────────────────────────────────────────────────────

### 1. Corregir N+1 - OrderController.php

```php
// ANTES
$orders = $this->orderRepository->findAll();

// DESPUÉS
$orders = $this->orderRepository->findWithCustomer();
```

### 2. Añadir Índice

```php
#[ORM\Index(columns: ['status'], name: 'idx_order_status')]
```

### 3. Activar el Query Cache

```php
->enableResultCache(3600, 'orders_list')
```

──────────────────────────────────────────────────────────────
📈 IMPACTO ESTIMADO
──────────────────────────────────────────────────────────────

| Optimización | Antes | Después | Ganancia |
|--------------|-------|---------|---------|
| Página Orders | 102 req | 3 req | -97% |
| Tiempo medio | 450ms | 80ms | -82% |
| Carga DB | 100% | 30% | -70% |

──────────────────────────────────────────────────────────────
🎯 PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar los eager loadings
2. [ ] Crear las migraciones para los índices
3. [ ] Configurar el Second Level Cache
4. [ ] Monitorear con Blackfire/Profiler
```

## Comandos Útiles

```bash
# Validar el esquema
docker compose exec php php bin/console doctrine:schema:validate

# Ver las consultas generadas
docker compose exec php php bin/console doctrine:query:dql "SELECT o FROM App\Entity\Order o" --dump-sql

# Crear migración para índices
docker compose exec php php bin/console make:migration

# Stats de entidades
docker compose exec php php bin/console doctrine:mapping:info
```
