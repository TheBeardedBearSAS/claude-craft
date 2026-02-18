---
description: Datenbankmigrationsplanung
argument-hint: [arguments]
---

# Datenbankmigrationsplanung

Du bist ein DBA und erfahrener Symfony-Architekt. Du musst eine komplexe Datenbankmigration mit einer Zero-Downtime-Strategie planen, einschließlich Rollback und Tests.

## Argumente
$ARGUMENTS

Argumente:
- Beschreibung der Migration (z.B. "audit_log-Tabelle hinzufügen", "Spalte user.name in full_name umbenennen")

Beispiel: `/symfony:migration-plan "Versionierungssystem für Dokumente hinzufügen"`

## MISSION

### Schritt 1: Änderung analysieren

```
══════════════════════════════════════════════════════════════
📋 MIGRATIONSANALYSE
══════════════════════════════════════════════════════════════

Beschreibung: {Migrationsbeschreibung}
Geplantes Datum: {YYYY-MM-DD}
Umgebungen: dev → staging → production

──────────────────────────────────────────────────────────────
🔍 AKTUELLER ZUSTAND
──────────────────────────────────────────────────────────────

Betroffene Tabellen:
- table_1 (X Zeilen)
- table_2 (Y Zeilen)

Abhängigkeiten:
- Entities: Entity1, Entity2
- Services: Service1, Service2
- Controller: Controller1

──────────────────────────────────────────────────────────────
⚠️ RISIKOBEWERTUNG
──────────────────────────────────────────────────────────────

| Risiko | Wahrscheinlichkeit | Auswirkung | Risikominderung |
|--------|-------------------|------------|-----------------|
| Langer Table-Lock | Mittel | Hoch | Migration in Schritten |
| Datenverlust | Niedrig | Kritisch | Backup + Wiederherstellungstest |
| Downtime | Mittel | Hoch | Blue/Green + Feature Flags |
```

### Schritt 2: Migrationsstrategie

#### Expand/Contract-Muster (Zero-Downtime)

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: EXPAND (Hinzufügen)                                │
│ - Neue Spalte/Tabelle hinzufügen                            │
│ - Spalte nullable oder mit Standardwert                     │
│ - Keine Löschung                                            │
│ - App funktioniert weiter                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: MIGRATE (Daten)                                    │
│ - Daten kopieren/transformieren                             │
│ - Batch-Verarbeitung für große Mengen                       │
│ - Validierung der migrierten Daten                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: UPDATE (Anwendung)                                 │
│ - Code deployen, der neue Struktur verwendet                │
│ - Schreiben in alt UND neu während der Umstellung           │
│ - Feature Flag bei Bedarf                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: CONTRACT (Aufräumen)                               │
│ - Alte Spalte/Tabelle entfernen                             │
│ - Kompatibilitätscode entfernen                             │
│ - Kann später sicher durchgeführt werden                    │
└─────────────────────────────────────────────────────────────┘
```

### Schritt 3: Migrationen generieren

#### Migration 1: Expand (Struktur hinzufügen)

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
        return 'Phase 1: Neue Struktur hinzufügen';
    }

    public function up(Schema $schema): void
    {
        // Neue Spalte hinzufügen (nullable für Kompatibilität)
        $this->addSql('ALTER TABLE {table} ADD COLUMN {new_column} VARCHAR(255) DEFAULT NULL');

        // Neue Tabelle hinzufügen
        $this->addSql('CREATE TABLE {new_table} (
            id UUID PRIMARY KEY,
            {table}_id UUID NOT NULL REFERENCES {table}(id),
            version INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )');

        // Index hinzufügen (CONCURRENTLY für PostgreSQL)
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

#### Migration 2: Datenmigration

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
        return 'Phase 2: Vorhandene Daten migrieren';
    }

    public function up(Schema $schema): void
    {
        // Migration in Batches, um lange Locks zu vermeiden
        $connection = $this->connection;

        $totalRows = (int) $connection->fetchOne('SELECT COUNT(*) FROM {table} WHERE {new_column} IS NULL');
        $processed = 0;

        $this->write("Migriere $totalRows Zeilen...");

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
            $this->write("Verarbeitet $processed / $totalRows");
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE {table} SET {new_column} = NULL");
    }
}
```

#### Migration 3: Contract (Aufräumen)

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
        return 'Phase 4: Alte Struktur entfernen (NACH vollständiger Validierung ausführen)';
    }

    public function up(Schema $schema): void
    {
        // Prüfen, dass alle Daten migriert sind
        $count = $this->connection->fetchOne('SELECT COUNT(*) FROM {table} WHERE {new_column} IS NULL');
        if ($count > 0) {
            throw new \RuntimeException("Migration unvollständig: $count Zeilen nicht migriert");
        }

        // Spalte NOT NULL machen
        $this->addSql('ALTER TABLE {table} ALTER COLUMN {new_column} SET NOT NULL');

        // Alte Spalte entfernen
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

### Schritt 4: Deployment-Plan

```
══════════════════════════════════════════════════════════════
📅 DEPLOYMENT-PLAN
══════════════════════════════════════════════════════════════

## Voraussetzungen

- [ ] Datenbank-Backup
- [ ] Wiederherstellungstest des Backups
- [ ] Wartungsfenster kommuniziert
- [ ] Team verfügbar

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## T-1: Vorbereitung

- [ ] Migrationen in main mergen
- [ ] In staging deployen
- [ ] Migrationen in staging ausführen
- [ ] Vollständige E2E-Tests

## Tag X: Production

### 09:00 - Phase 1: Expand
```bash
# Backup
docker compose exec db pg_dump -U user db > backup_$(date +%Y%m%d_%H%M%S).sql

# Expand-Migration
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Expand' --up
```

### 09:15 - Phase 2: Datenmigration
```bash
# Mit Monitoring ausführen
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_MigrateData' --up
```

### 09:30 - Phase 3: Neuen Code deployen
```bash
# Anwendung mit neuem Code deployen
./deploy.sh production
```

### 10:00 - Validierung
- [ ] Smoke-Tests
- [ ] Logs prüfen (keine Fehler)
- [ ] Metriken prüfen
- [ ] Betroffene Funktionen testen

### T+7 - Phase 4: Contract (optional)
```bash
# Nach vollständiger Validierung
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Contract' --up
```

══════════════════════════════════════════════════════════════
🔙 ROLLBACK-PLAN
══════════════════════════════════════════════════════════════

### Rollback Phase 1 (Expand)
```bash
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Expand' --down
```

### Rollback Phase 2 (Data)
```bash
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_MigrateData' --down
```

### Vollständiger Rollback (bei kritischem Fehler)
```bash
# Backup wiederherstellen
docker compose exec db psql -U user db < backup_YYYYMMDD_HHMMSS.sql

# Alte Version erneut deployen
git checkout {previous_tag}
./deploy.sh production
```

══════════════════════════════════════════════════════════════
✅ CHECKLISTE POST-MIGRATION
══════════════════════════════════════════════════════════════

- [ ] Alle Migrationen erfolgreich ausgeführt
- [ ] Keine Fehler in den Logs
- [ ] Performance-Metriken nominal
- [ ] Funktionstests OK
- [ ] Benutzer informiert (bei sichtbarem Einfluss)
- [ ] Dokumentation aktualisiert
- [ ] Backup nach Validierung gelöscht (T+30)
```

### Nützliche Befehle

```bash
# Migrationsstatus
docker compose exec php php bin/console doctrine:migrations:status

# Ausstehende Migrationen anzeigen
docker compose exec php php bin/console doctrine:migrations:list

# Bestimmte Migration ausführen
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --up

# Migration rückgängig machen
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --down

# Schema validieren
docker compose exec php php bin/console doctrine:schema:validate
```
