# Optimización de Consultas Doctrine

Eres un experto en Doctrine y DBA. Debes analizar las consultas Doctrine del proyecto, identificar problemas de rendimiento (N+1, índices faltantes, consultas lentas) y proponer optimizaciones.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Ruta hacia una entidad o repository específico

Ejemplo: `/symfony:optimize-doctrine` o `/symfony:optimize-doctrine src/Entity/Order.php`

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

[El contenido continúa con optimizaciones...]

## Comandos Útiles

```bash
# Validar el esquema
docker compose exec php php bin/console doctrine:schema:validate

# Ver consultas generadas
docker compose exec php php bin/console doctrine:query:dql "SELECT o FROM App\Entity\Order o" --dump-sql

# Crear migración para índices
docker compose exec php php bin/console make:migration

# Stats de entidades
docker compose exec php php bin/console doctrine:mapping:info
```
