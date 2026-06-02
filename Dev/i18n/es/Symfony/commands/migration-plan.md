---
description: Planificación de Migración de Base de Datos
argument-hint: [arguments]
---

# Planificación de Migración de Base de Datos

Eres un DBA y arquitecto Symfony senior. Debes planificar una migración de base de datos compleja con una estrategia de zero-downtime, incluyendo el rollback y las pruebas.

## Argumentos
$ARGUMENTS

Argumentos:
- Descripción de la migración (ej: "Añadir tabla audit_log", "Renombrar columna user.name a full_name")

Ejemplo: `/symfony:migration-plan "Añadir sistema de versionado en los documentos"`

## MISIÓN

### Paso 1: Analizar el Cambio

```
══════════════════════════════════════════════════════════════
📋 ANÁLISIS DE MIGRACIÓN
══════════════════════════════════════════════════════════════

Descripción : {Descripción de la migración}
Fecha prevista : {YYYY-MM-DD}
Entornos : dev → staging → production

──────────────────────────────────────────────────────────────
🔍 ESTADO ACTUAL
──────────────────────────────────────────────────────────────

Tablas afectadas :
- tabla_1 (X filas)
- tabla_2 (Y filas)

Dependencias :
- Entidades : Entity1, Entity2
- Servicios : Service1, Service2
- Controladores : Controller1

──────────────────────────────────────────────────────────────
⚠️ EVALUACIÓN DE RIESGOS
──────────────────────────────────────────────────────────────

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Bloqueo largo de tabla | Media | Alto | Migración por etapas |
| Pérdida de datos | Baja | Crítico | Backup + test de restauración |
| Downtime | Media | Alto | Blue/Green + feature flags |
```

### Paso 2: Estrategia de Migración

#### Patrón Expand/Contract (Zero-Downtime)

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: EXPAND (Añadir)                                     │
│ - Añadir nueva columna/tabla                                │
│ - Columna nullable o con valor por defecto                  │
│ - Sin eliminaciones                                         │
│ - La app continúa funcionando                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: MIGRATE (Datos)                                     │
│ - Copiar/transformar los datos                              │
│ - Procesamiento por lotes para grandes volúmenes            │
│ - Validación de los datos migrados                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: UPDATE (Aplicación)                                 │
│ - Desplegar el código que usa la nueva estructura           │
│ - Escritura en la antigua Y en la nueva durante la transición│
│ - Feature flag si es necesario                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: CONTRACT (Limpieza)                                 │
│ - Eliminar la antigua columna/tabla                         │
│ - Eliminar el código de compatibilidad                      │
│ - Puede realizarse más tarde, con total seguridad           │
└─────────────────────────────────────────────────────────────┘
```

### Paso 3: Generar las Migraciones

#### Migración 1: Expand (añadir estructura)

```php
<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version{TIMESTAMP}_Expand extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fase 1: Añadir la nueva estructura';
    }

    public function up(Schema $schema): void
    {
        // Añadir nueva columna (nullable para compatibilidad)
        $this->addSql('ALTER TABLE {table} ADD COLUMN {new_column} VARCHAR(255) DEFAULT NULL');

        // Añadir nueva tabla
        $this->addSql('CREATE TABLE {new_table} (
            id UUID PRIMARY KEY,
            {table}_id UUID NOT NULL REFERENCES {table}(id),
            version INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )');

        // Añadir índice (CONCURRENTLY para PostgreSQL)
        $this->addSql('CREATE INDEX CONCURRENTLY idx_{table}_{column} ON {table}({column})');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IF EXISTS idx_{table}_{column}');
        $this->addSql('DROP TABLE IF EXISTS {new_table}');
        $this->addSql('ALTER TABLE {table} DROP COLUMN IF EXISTS {new_column}');
    }
}
```

#### Migración 2: Migración de Datos

```php
<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version{TIMESTAMP}_MigrateData extends AbstractMigration
{
    private const BATCH_SIZE = 1000;

    public function getDescription(): string
    {
        return 'Fase 2: Migrar los datos existentes';
    }

    public function up(Schema $schema): void
    {
        // Migración por lotes para evitar bloqueos prolongados
        $connection = $this->connection;

        $totalRows = (int) $connection->fetchOne('SELECT COUNT(*) FROM {table} WHERE {new_column} IS NULL');
        $processed = 0;

        $this->write("Migrating $totalRows rows...");

        while ($processed < $totalRows) {
            $this->addSql("
                UPDATE {table}
                SET {new_column} = {transformation}
                WHERE id IN (
                    SELECT id FROM {table}
                    WHERE {new_column} IS NULL
                    LIMIT " . self::BATCH_SIZE . "
                )
            ");

            $processed += self::BATCH_SIZE;
            $this->write("Processed $processed / $totalRows");
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE {table} SET {new_column} = NULL");
    }
}
```

#### Migración 3: Contract (limpieza)

```php
<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version{TIMESTAMP}_Contract extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fase 4: Eliminar la antigua estructura (Ejecutar DESPUÉS de la validación completa)';
    }

    public function up(Schema $schema): void
    {
        // Verificar que todos los datos están migrados
        $count = $this->connection->fetchOne('SELECT COUNT(*) FROM {table} WHERE {new_column} IS NULL');
        if ($count > 0) {
            throw new \RuntimeException("Migración incompleta: $count filas no migradas");
        }

        // Convertir la columna a NOT NULL
        $this->addSql('ALTER TABLE {table} ALTER COLUMN {new_column} SET NOT NULL');

        // Eliminar la antigua columna
        $this->addSql('ALTER TABLE {table} DROP COLUMN {old_column}');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE {table} ADD COLUMN {old_column} VARCHAR(255)');
        $this->addSql('UPDATE {table} SET {old_column} = {reverse_transformation}');
        $this->addSql('ALTER TABLE {table} ALTER COLUMN {new_column} DROP NOT NULL');
    }
}
```

### Paso 4: Plan de Despliegue

```
══════════════════════════════════════════════════════════════
📅 PLAN DE DESPLIEGUE
══════════════════════════════════════════════════════════════

## Prerrequisitos

- [ ] Backup de la base de datos
- [ ] Test de restauración del backup
- [ ] Ventana de mantenimiento comunicada
- [ ] Equipo disponible

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## D-1: Preparación

- [ ] Mergear las migraciones en main
- [ ] Desplegar en staging
- [ ] Ejecutar las migraciones en staging
- [ ] Pruebas E2E completas

## Día D: Producción

### 09:00 - Fase 1: Expand
```bash
# Backup
docker compose exec db pg_dump -U user db > backup_$(date +%Y%m%d_%H%M%S).sql

# Migración expand
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Expand' --up
```

### 09:15 - Fase 2: Migración de Datos
```bash
# Ejecutar con monitorización
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_MigrateData' --up
```

### 09:30 - Fase 3: Desplegar el Nuevo Código
```bash
# Desplegar la aplicación con el nuevo código
./deploy.sh production
```

### 10:00 - Validación
- [ ] Smoke tests
- [ ] Verificar los logs (sin errores)
- [ ] Verificar las métricas
- [ ] Probar las funcionalidades afectadas

### D+7 - Fase 4: Contract (opcional)
```bash
# Después de la validación completa
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Contract' --up
```

══════════════════════════════════════════════════════════════
🔙 PLAN DE ROLLBACK
══════════════════════════════════════════════════════════════

### Rollback Fase 1 (Expand)
```bash
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Expand' --down
```

### Rollback Fase 2 (Datos)
```bash
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_MigrateData' --down
```

### Rollback Completo (si es crítico)
```bash
# Restaurar el backup
docker compose exec db psql -U user db < backup_YYYYMMDD_HHMMSS.sql

# Redesplegar la versión anterior
git checkout {previous_tag}
./deploy.sh production
```

══════════════════════════════════════════════════════════════
✅ CHECKLIST POST-MIGRACIÓN
══════════════════════════════════════════════════════════════

- [ ] Todas las migraciones ejecutadas con éxito
- [ ] Sin errores en los logs
- [ ] Métricas de rendimiento nominales
- [ ] Tests funcionales OK
- [ ] Usuarios informados (si el impacto es visible)
- [ ] Documentación actualizada
- [ ] Backup eliminado tras la validación (D+30)
```

### Comandos Útiles

```bash
# Estado de las migraciones
docker compose exec php php bin/console doctrine:migrations:status

# Ver las migraciones pendientes
docker compose exec php php bin/console doctrine:migrations:list

# Ejecutar una migración específica
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --up

# Rollback de una migración
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --down

# Validar el esquema
docker compose exec php php bin/console doctrine:schema:validate
```
