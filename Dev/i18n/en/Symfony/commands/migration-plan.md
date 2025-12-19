---
description: Planification Migration Base de Données
argument-hint: [arguments]
---

# Planification Migration Base de Données

Tu es un DBA et architecte Symfony senior. Tu dois planifier une migration de base de données complexe avec une stratégie zero-downtime, incluant le rollback et les tests.

## Arguments
$ARGUMENTS

Arguments :
- Description de la migration (ex: "Ajouter table audit_log", "Renommer colonne user.name vers full_name")

Exemple : `/symfony:migration-plan "Ajouter système de versioning sur les documents"`

## MISSION

### Step 1 : Analysisr le Changement

```
══════════════════════════════════════════════════════════════
📋 ANALYSE MIGRATION
══════════════════════════════════════════════════════════════

Description : {Description de la migration}
Date prévue : {YYYY-MM-DD}
Environnements : dev → staging → production

──────────────────────────────────────────────────────────────
🔍 ÉTAT ACTUEL
──────────────────────────────────────────────────────────────

Tables impactées :
- table_1 (X lignes)
- table_2 (Y lignes)

Dépendances :
- Entités : Entity1, Entity2
- Services : Service1, Service2
- Contrôleurs : Controller1

──────────────────────────────────────────────────────────────
⚠️ ÉVALUATION DES RISQUES
──────────────────────────────────────────────────────────────

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Lock table long | Moyenne | Haute | Migration en étapes |
| Perte de données | Faible | Critique | Backup + test restore |
| Downtime | Moyenne | Haute | Blue/Green + feature flags |
```

### Step 2 : Stratégie de Migration

#### Pattern Expand/Contract (Zero-Downtime)

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: EXPAND (Ajout)                                     │
│ - Ajouter nouvelle colonne/table                            │
│ - Colonne nullable ou avec valeur par défaut                │
│ - Pas de suppression                                        │
│ - App continue de fonctionner                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: MIGRATE (Données)                                  │
│ - Copier/transformer les données                            │
│ - Batch processing pour gros volumes                        │
│ - Validation des données migrées                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: UPDATE (Application)                               │
│ - Déployer le code utilisant la nouvelle structure          │
│ - Écriture dans ancien ET nouveau pendant la transition     │
│ - Feature flag si nécessaire                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: CONTRACT (Nettoyage)                               │
│ - Supprimer l'ancienne colonne/table                        │
│ - Supprimer le code de compatibilité                        │
│ - Peut être fait plus tard, en toute sécurité               │
└─────────────────────────────────────────────────────────────┘
```

### Step 3 : Générer les Migrations

#### Migration 1 : Expand (ajout structure)

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
        return 'Phase 1: Ajouter la nouvelle structure';
    }

    public function up(Schema $schema): void
    {
        // Ajouter nouvelle colonne (nullable pour compatibilité)
        $this->addSql('ALTER TABLE {table} ADD COLUMN {new_column} VARCHAR(255) DEFAULT NULL');

        // Ajouter nouvelle table
        $this->addSql('CREATE TABLE {new_table} (
            id UUID PRIMARY KEY,
            {table}_id UUID NOT NULL REFERENCES {table}(id),
            version INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )');

        // Ajouter index (CONCURRENTLY pour PostgreSQL)
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

#### Migration 2 : Data Migration

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
        return 'Phase 2: Migrer les données existantes';
    }

    public function up(Schema $schema): void
    {
        // Migration par batch pour éviter les locks longs
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

#### Migration 3 : Contract (nettoyage)

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
        return 'Phase 4: Supprimer l\'ancienne structure (À exécuter APRÈS validation complète)';
    }

    public function up(Schema $schema): void
    {
        // Vérifier que toutes les données sont migrées
        $count = $this->connection->fetchOne('SELECT COUNT(*) FROM {table} WHERE {new_column} IS NULL');
        if ($count > 0) {
            throw new \RuntimeException("Migration incomplète: $count lignes non migrées");
        }

        // Rendre la colonne NOT NULL
        $this->addSql('ALTER TABLE {table} ALTER COLUMN {new_column} SET NOT NULL');

        // Supprimer l'ancienne colonne
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

### Step 4 : Plan de Déploiement

```
══════════════════════════════════════════════════════════════
📅 PLAN DE DÉPLOIEMENT
══════════════════════════════════════════════════════════════

## Pré-requis

- [ ] Backup base de données
- [ ] Test de restauration backup
- [ ] Fenêtre de maintenance communiquée
- [ ] Équipe disponible

## J-1 : Préparation

- [ ] Merger les migrations dans main
- [ ] Déployer en staging
- [ ] Exécuter les migrations staging
- [ ] Tests E2E complets

## Jour J : Production

### 09:00 - Phase 1 : Expand
```bash
# Backup
docker compose exec db pg_dump -U user db > backup_$(date +%Y%m%d_%H%M%S).sql

# Migration expand
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Expand' --up
```

### 09:15 - Phase 2 : Data Migration
```bash
# Exécuter en monitoring
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_MigrateData' --up
```

### 09:30 - Phase 3 : Deploy New Code
```bash
# Déployer l'application avec le nouveau code
./deploy.sh production
```

### 10:00 - Validation
- [ ] Smoke tests
- [ ] Vérifier les logs (pas d'erreurs)
- [ ] Vérifier les métriques
- [ ] Tester les fonctionnalités impactées

### J+7 - Phase 4 : Contract (optionnel)
```bash
# Après validation complète
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Contract' --up
```

══════════════════════════════════════════════════════════════
🔙 PLAN DE ROLLBACK
══════════════════════════════════════════════════════════════

### Rollback Phase 1 (Expand)
```bash
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_Expand' --down
```

### Rollback Phase 2 (Data)
```bash
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version{TIMESTAMP}_MigrateData' --down
```

### Rollback Complet (si critique)
```bash
# Restaurer le backup
docker compose exec db psql -U user db < backup_YYYYMMDD_HHMMSS.sql

# Redéployer l'ancienne version
git checkout {previous_tag}
./deploy.sh production
```

══════════════════════════════════════════════════════════════
✅ CHECKLIST POST-MIGRATION
══════════════════════════════════════════════════════════════

- [ ] Toutes les migrations exécutées avec succès
- [ ] Pas d'erreurs dans les logs
- [ ] Métriques de performance nominales
- [ ] Tests fonctionnels OK
- [ ] Utilisateurs informés (si impact visible)
- [ ] Documentation mise à jour
- [ ] Backup supprimé après validation (J+30)
```

### Commands Utiles

```bash
# Statut des migrations
docker compose exec php php bin/console doctrine:migrations:status

# Voir les migrations en attente
docker compose exec php php bin/console doctrine:migrations:list

# Exécuter une migration spécifique
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --up

# Rollback d'une migration
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --down

# Valider le schéma
docker compose exec php php bin/console doctrine:schema:validate
```
