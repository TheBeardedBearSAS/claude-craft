# Template: Database Migration

> **Pattern** - Migrations pour versionner le schéma de base de données
> Référence: `.claude/rules/01-workflow-analysis.md`, `.claude/rules/11-security.md`

## Principe

Les migrations permettent de versionner le schéma de base de données de façon incrémentale et réversible (up/down).

---

## Template Doctrine (Symfony)

```php
<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration: [Description de la modification]
 *
 * Date: [YYYY-MM-DD]
 *
 * Changements:
 * - [Changement 1]
 * - [Changement 2]
 */
final class Version[YYYYMMDDHHIISS] extends AbstractMigration
{
    public function getDescription(): string
    {
        return '[Description courte de la migration]';
    }

    public function up(Schema $schema): void
    {
        // 1. Ajouter les nouvelles colonnes/tables
        $this->addSql('
            CREATE TABLE [table_name] (
                id SERIAL PRIMARY KEY,
                [column_name] VARCHAR(255) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ');

        // 2. Indexes
        $this->addSql('CREATE INDEX idx_[column_name] ON [table_name] ([column_name])');
    }

    public function down(Schema $schema): void
    {
        // Rollback: ordre inverse
        $this->addSql('DROP INDEX idx_[column_name]');
        $this->addSql('DROP TABLE [table_name]');
    }
}
```

### Exemple: Add User Roles

```php
<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260417120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add roles column to users table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('
            ALTER TABLE users 
            ADD COLUMN roles JSON NOT NULL DEFAULT \'["ROLE_USER"]\'
        ');

        $this->addSql('
            CREATE INDEX idx_users_roles 
            ON users USING GIN (roles)
        ');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_users_roles');
        $this->addSql('ALTER TABLE users DROP COLUMN roles');
    }
}
```

---

## Template Laravel

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: [Description de la modification]
 *
 * Date: [YYYY-MM-DD]
 *
 * Changements:
 * - [Changement 1]
 * - [Changement 2]
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('[table_name]', function (Blueprint $table) {
            $table->id();
            $table->string('[column_name]');
            $table->timestamps();

            $table->index('[column_name]');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('[table_name]');
    }
};
```

### Exemple: Create Orders Table

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status', 50);
            $table->decimal('total_amount', 10, 2);
            $table->json('items');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

## Bonnes pratiques

- **Atomic**: Une migration = une seule modification logique
- **Reversible**: Toujours fournir `down()` fonctionnel
- **Safe**: Tester sur copie de prod avant déploiement
- **Data migrations**: Séparer structure vs données
