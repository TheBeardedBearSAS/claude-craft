# Doctrine Extensions (Gedmo)

> Versión: stof/doctrine-extensions-bundle v1.14.0
> Gedmo: doctrine-extensions v3.21.0
> Compatibilidad: Symfony ^6.4 || ^7.0, PHP ^8.1

## Instalación

```bash
make composer CMD="require stof/doctrine-extensions-bundle"
```

**Dependencias instaladas:**
- `stof/doctrine-extensions-bundle` v1.14.0
- `gedmo/doctrine-extensions` v3.21.0

## Configuración

### config/packages/stof_doctrine_extensions.yaml

```yaml
stof_doctrine_extensions:
    default_locale: '%kernel.default_locale%'
    translation_fallback: true
    orm:
        default:
            timestampable: true    # createdAt, updatedAt automáticos
            sluggable: true        # Slugs para URLs
            blameable: true        # createdBy, updatedBy automáticos
            softdeleteable: true   # Eliminación lógica (deletedAt)
            translatable: true     # Contenido multilingüe
            loggable: true         # Historial de modificaciones
            tree: false            # Estructuras de árbol (desactivado)
            sortable: false        # Orden automático (desactivado)
```

### config/packages/doctrine.yaml

```yaml
doctrine:
    orm:
        filters:
            softdeleteable:
                class: Gedmo\SoftDeleteable\Filter\SoftDeleteableFilter
                enabled: true
```

## Behaviors OBLIGATORIOS

### Timestampable (OBLIGATORIO en todas las entidades)

Gestión automática de las fechas de creación y modificación.

#### ✅ Método 1: Trait (RECOMENDADO)

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Traits\TimestampableEntity;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Sejour
{
    use TimestampableEntity; // Añade createdAt y updatedAt

    // El trait añade automáticamente:
    // - createdAt: \DateTimeInterface
    // - updatedAt: \DateTimeInterface
    // - getCreatedAt(): \DateTimeInterface
    // - setCreatedAt(\DateTimeInterface): void
    // - getUpdatedAt(): \DateTimeInterface
    // - setUpdatedAt(\DateTimeInterface): void
}
```

#### ✅ Método 2: Anotaciones manuales

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity]
class Sejour
{
    #[Gedmo\Timestampable(on: 'create')]
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[Gedmo\Timestampable(on: 'update')]
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
```

**Opciones avanzadas:**

```php
<?php

// Timestampable condicional (solo si cambia un campo específico)
#[Gedmo\Timestampable(on: 'change', field: 'status')]
#[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
private ?\DateTimeImmutable $statusChangedAt = null;

// Timestampable en valor específico
#[Gedmo\Timestampable(on: 'change', field: 'status', value: 'published')]
#[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
private ?\DateTimeImmutable $publishedAt = null;
```

**Regla:** TODA entidad de negocio DEBE tener `createdAt` y `updatedAt`.

---

### Blameable (OBLIGATORIO para auditoría)

Trazabilidad de quién creó/modificó la entidad.

#### ✅ Método 1: Trait (RECOMENDADO)

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Blameable\Traits\BlameableEntity;

#[ORM\Entity]
class Reservation
{
    use BlameableEntity; // Añade createdBy y updatedBy

    // El trait añade automáticamente:
    // - createdBy: ?string
    // - updatedBy: ?string
    // - getCreatedBy(): ?string
    // - setCreatedBy(?string): void
    // - getUpdatedBy(): ?string
    // - setUpdatedBy(?string): void
}
```

#### ✅ Método 2: Relación User (RECOMENDADO para Atoll Tourisme)

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity]
class Reservation
{
    #[Gedmo\Blameable(on: 'create')]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $createdBy = null;

    #[Gedmo\Blameable(on: 'update')]
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $updatedBy = null;

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function getUpdatedBy(): ?User
    {
        return $this->updatedBy;
    }
}
```

**Configuración de usuario:**

```php
<?php

// En un EventListener o Security Voter
use Symfony\Component\Security\Core\Security;
use Gedmo\Blameable\BlameableListener;

class BlameableUserListener
{
    public function __construct(
        private BlameableListener $blameableListener,
        private Security $security
    ) {
    }

    public function onKernelRequest(): void
    {
        $user = $this->security->getUser();
        if ($user) {
            // Para trait string
            $this->blameableListener->setUserValue($user->getUserIdentifier());

            // O para relación User
            // $this->blameableListener->setUserValue($user);
        }
    }
}
```

**Regla:** TODA entidad modificable por un usuario DEBE tener `createdBy` y `updatedBy`.

---

### SoftDeleteable (RECOMENDADO para datos críticos)

Eliminación lógica en lugar de física.

#### ✅ Método 1: Trait (RECOMENDADO)

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\SoftDeleteable\Traits\SoftDeleteableEntity;

#[ORM\Entity]
#[Gedmo\SoftDeleteable(fieldName: 'deletedAt', timeAware: false, hardDelete: false)]
class Participant
{
    use SoftDeleteableEntity; // Añade deletedAt

    // El trait añade automáticamente:
    // - deletedAt: ?\DateTimeInterface
    // - getDeletedAt(): ?\DateTimeInterface
    // - setDeletedAt(?\DateTimeInterface): void
    // - isDeleted(): bool (método custom)
}
```

#### ✅ Método 2: Manual

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity]
#[Gedmo\SoftDeleteable(fieldName: 'deletedAt', timeAware: false, hardDelete: false)]
class Participant
{
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $deletedAt = null;

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTimeImmutable $deletedAt): void
    {
        $this->deletedAt = $deletedAt;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }
}
```

**Opciones avanzadas:**

- `timeAware: false` - No tiene en cuenta la hora en las comparaciones
- `hardDelete: false` - Prohíbe la eliminación física (lanza excepción)
- `hardDelete: true` - Permite eliminación física si `deletedAt` ya está establecido

**Uso:**

```php
<?php

// Eliminación lógica (estándar)
$entityManager->remove($participant);
$entityManager->flush();
// → deletedAt se establece a ahora

// Restauración
$participant->setDeletedAt(null);
$entityManager->flush();

// Ver entidades eliminadas
$em->getFilters()->disable('softdeleteable');
$allParticipants = $participantRepository->findAll(); // Incluye eliminados
$em->getFilters()->enable('softdeleteable');

// Eliminación física (hard delete)
$em->getFilters()->disable('softdeleteable');
$participant = $participantRepository->find($id);
$em->remove($participant);
$em->flush();
```

**Regla:** Entidades críticas (Reservation, Participant, Sejour) → SoftDeleteable OBLIGATORIO.

---

### Sluggable (OBLIGATORIO para URLs)

Generación automática de slugs.

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity]
class Sejour
{
    #[ORM\Column(length: 255)]
    private string $titre;

    #[Gedmo\Slug(fields: ['titre'], unique: true, updatable: false)]
    #[ORM\Column(length: 255, unique: true)]
    private string $slug;

    public function getTitre(): string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): void
    {
        $this->titre = $titre;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }
}
```

**Opciones avanzadas:**

```php
<?php

// Slug basado en varios campos
#[Gedmo\Slug(fields: ['titre', 'destination'], separator: '-')]
private string $slug;

// Slug actualizado si el título cambia
#[Gedmo\Slug(fields: ['titre'], updatable: true)]
private string $slug;

// Slug con prefijo/sufijo
#[Gedmo\Slug(fields: ['titre'], prefix: 'sejour-', suffix: '-2025')]
private string $slug;

// Estilo de slug
#[Gedmo\Slug(fields: ['titre'], style: 'camel')] // camelCase
#[Gedmo\Slug(fields: ['titre'], style: 'lower')] // lowercase (default)
#[Gedmo\Slug(fields: ['titre'], style: 'upper')] // UPPERCASE
```

**Reglas:**
- `unique: true` → SIEMPRE para evitar colisiones
- `updatable: false` → RECOMENDADO para SEO (URLs estables)
- Usar para toda entidad expuesta vía URL (Sejour, etc.)

---

### Translatable (para entidades i18n)

Traducción de campos de entidades.

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Translatable\Translatable;

#[ORM\Entity]
class Sejour implements Translatable
{
    #[Gedmo\Translatable]
    #[ORM\Column(length: 255)]
    private string $titre;

    #[Gedmo\Translatable]
    #[ORM\Column(type: Types::TEXT)]
    private string $description;

    #[Gedmo\Locale]
    private ?string $locale = null;

    public function getTitre(): string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): void
    {
        $this->titre = $titre;
    }

    public function setTranslatableLocale(string $locale): void
    {
        $this->locale = $locale;
    }

    public function getLocale(): ?string
    {
        return $this->locale;
    }
}
```

**Uso:**

```php
<?php

// Crear traducciones
$sejour = new Sejour();
$sejour->setTitre('Séjour en Corse');
$sejour->setDescription('Découvrez la Corse...');
$em->persist($sejour);
$em->flush();

// Añadir traducción en inglés
$sejour->setTranslatableLocale('en');
$sejour->setTitre('Trip in Corsica');
$sejour->setDescription('Discover Corsica...');
$em->flush();

// Recuperar traducción
$sejour->setTranslatableLocale('en');
$em->refresh($sejour);
echo $sejour->getTitre(); // "Trip in Corsica"

// Repository con locale
$query = $em->createQuery('SELECT s FROM App\Entity\Sejour s');
$query->setHint(
    \Gedmo\Translatable\TranslatableListener::HINT_TRANSLATABLE_LOCALE,
    'en'
);
$sejours = $query->getResult();
```

**Configuración:**

```yaml
# config/packages/stof_doctrine_extensions.yaml
stof_doctrine_extensions:
    default_locale: fr
    translation_fallback: true  # Fallback al locale por defecto
```

**Regla:** Usar para entidades con contenido multilingüe (Sejour, Page, etc.).

---

### Loggable (para historial)

Historial de modificaciones.

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Loggable\Loggable;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity]
#[Gedmo\Loggable]
class Reservation implements Loggable
{
    #[Gedmo\Versioned]
    #[ORM\Column(length: 50)]
    private string $statut;

    #[Gedmo\Versioned]
    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private string $montantTotal;

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): void
    {
        $this->statut = $statut;
    }
}
```

**Ver el historial:**

```php
<?php

use Gedmo\Loggable\Entity\Repository\LogEntryRepository;

$logRepo = $em->getRepository('Gedmo\Loggable\Entity\LogEntry');
$logs = $logRepo->getLogEntries($reservation);

foreach ($logs as $log) {
    echo sprintf(
        "Versión %d: %s en %s (por %s)\n",
        $log->getVersion(),
        $log->getAction(),
        $log->getLoggedAt()->format('Y-m-d H:i:s'),
        $log->getUsername()
    );

    print_r($log->getData()); // Datos modificados
}

// Volver a una versión anterior
$logRepo->revert($reservation, 3); // Versión 3
$em->flush();
```

**Regla:** Usar para entidades que requieren un audit trail (Reservation, etc.).

---

## Trait combinado recomendado (AuditableEntity)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\Traits;

use Gedmo\Blameable\Traits\BlameableEntity;
use Gedmo\SoftDeleteable\Traits\SoftDeleteableEntity;
use Gedmo\Timestampable\Traits\TimestampableEntity;

/**
 * Trait combining all audit-related behaviors.
 *
 * Provides:
 * - createdAt, updatedAt (Timestampable)
 * - createdBy, updatedBy (Blameable)
 * - deletedAt (SoftDeleteable)
 *
 * Usage:
 * #[ORM\Entity]
 * #[Gedmo\SoftDeleteable(fieldName: 'deletedAt')]
 * class MyEntity
 * {
 *     use AuditableEntity;
 * }
 */
trait AuditableEntity
{
    use TimestampableEntity;
    use BlameableEntity;
    use SoftDeleteableEntity;
}
```

**Uso:**

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use App\Domain\Shared\Traits\AuditableEntity;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity]
#[Gedmo\SoftDeleteable(fieldName: 'deletedAt')]
class Reservation
{
    use AuditableEntity;

    // Añade automáticamente:
    // - createdAt: \DateTimeInterface
    // - updatedAt: \DateTimeInterface
    // - createdBy: ?string
    // - updatedBy: ?string
    // - deletedAt: ?\DateTimeInterface

    // + Getters/Setters asociados
}
```

---

## Tests con Doctrine Extensions

### Tests Timestampable

```php
<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Sejour;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class SejourTest extends KernelTestCase
{
    private $entityManager;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->entityManager = self::getContainer()->get('doctrine')->getManager();
    }

    public function test_should_set_created_at_on_persist(): void
    {
        $sejour = new Sejour();
        $sejour->setTitre('Test Sejour');

        $this->entityManager->persist($sejour);
        $this->entityManager->flush();

        $this->assertNotNull($sejour->getCreatedAt());
        $this->assertInstanceOf(\DateTimeImmutable::class, $sejour->getCreatedAt());
    }

    public function test_should_update_updated_at_on_modification(): void
    {
        $sejour = new Sejour();
        $sejour->setTitre('Test');
        $this->entityManager->persist($sejour);
        $this->entityManager->flush();

        $originalUpdatedAt = $sejour->getUpdatedAt();

        sleep(1); // Ensure time difference
        $sejour->setTitre('Modified');
        $this->entityManager->flush();

        $this->assertGreaterThan($originalUpdatedAt, $sejour->getUpdatedAt());
    }
}
```

### Tests SoftDeleteable

```php
<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Participant;
use App\Repository\ParticipantRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class ParticipantSoftDeleteTest extends KernelTestCase
{
    private $entityManager;
    private ParticipantRepository $repository;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->entityManager = self::getContainer()->get('doctrine')->getManager();
        $this->repository = $this->entityManager->getRepository(Participant::class);
    }

    public function test_soft_delete_should_set_deleted_at(): void
    {
        $participant = new Participant();
        $participant->setNom('Test');
        $participant->setPrenom('User');

        $this->entityManager->persist($participant);
        $this->entityManager->flush();
        $id = $participant->getId();

        // Soft delete
        $this->entityManager->remove($participant);
        $this->entityManager->flush();
        $this->entityManager->clear();

        // Should not find (filter enabled)
        $found = $this->repository->find($id);
        $this->assertNull($found);

        // Disable filter to see soft-deleted
        $this->entityManager->getFilters()->disable('softdeleteable');
        $found = $this->repository->find($id);

        $this->assertNotNull($found);
        $this->assertNotNull($found->getDeletedAt());
        $this->assertTrue($found->isDeleted());
    }

    public function test_can_restore_soft_deleted_entity(): void
    {
        $participant = new Participant();
        $this->entityManager->persist($participant);
        $this->entityManager->flush();

        // Soft delete
        $this->entityManager->remove($participant);
        $this->entityManager->flush();

        // Restore
        $this->entityManager->getFilters()->disable('softdeleteable');
        $participant->setDeletedAt(null);
        $this->entityManager->flush();
        $this->entityManager->getFilters()->enable('softdeleteable');

        // Should be found again
        $found = $this->repository->find($participant->getId());
        $this->assertNotNull($found);
        $this->assertFalse($found->isDeleted());
    }
}
```

### Tests Sluggable

```php
<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Sejour;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class SejourSlugTest extends KernelTestCase
{
    private $entityManager;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->entityManager = self::getContainer()->get('doctrine')->getManager();
    }

    public function test_should_generate_slug_from_titre(): void
    {
        $sejour = new Sejour();
        $sejour->setTitre('Séjour en Corse du Sud');

        $this->entityManager->persist($sejour);
        $this->entityManager->flush();

        $this->assertEquals('sejour-en-corse-du-sud', $sejour->getSlug());
    }

    public function test_should_make_slug_unique_on_conflict(): void
    {
        $sejour1 = new Sejour();
        $sejour1->setTitre('Test Sejour');
        $this->entityManager->persist($sejour1);
        $this->entityManager->flush();

        $sejour2 = new Sejour();
        $sejour2->setTitre('Test Sejour'); // Same title
        $this->entityManager->persist($sejour2);
        $this->entityManager->flush();

        $this->assertEquals('test-sejour', $sejour1->getSlug());
        $this->assertEquals('test-sejour-1', $sejour2->getSlug()); // Auto-incremented
    }
}
```

---

## Checklist nueva entidad

- [ ] `TimestampableEntity` trait añadido (o campos manuales createdAt/updatedAt)
- [ ] `BlameableEntity` trait añadido si modificable por usuario
- [ ] `SoftDeleteable` configurado si datos críticos
- [ ] `Sluggable` configurado si expuesta vía URL
- [ ] `Translatable` configurado si contenido multilingüe
- [ ] `Loggable` configurado si audit trail requerido
- [ ] Tests de behaviors incluidos (timestampable, soft delete, slug)
- [ ] `make quality` pasa sin error

---

## Comandos útiles

```bash
# Ver configuración
make console CMD="debug:config stof_doctrine_extensions"

# Listar los filtros Doctrine
make console CMD="doctrine:mapping:info"

# Generar migración
make console CMD="doctrine:migrations:diff"

# Ejecutar migración
make db-migrate

# Tests
make test
make test-coverage
```

---

## Troubleshooting

### Problema: Slug no generado

**Causa:** Listener Sluggable no configurado o campo fuente vacío

**Solución:**
```php
// Verificar que el campo fuente está relleno
$sejour->setTitre('Mon titre'); // ANTES del persist

// Verificar anotación
#[Gedmo\Slug(fields: ['titre'])]
```

### Problema: SoftDeleteable no filtra

**Causa:** Filtro desactivado

**Solución:**
```php
// Verificar doctrine.yaml
doctrine:
    orm:
        filters:
            softdeleteable:
                enabled: true  # IMPORTANTE

// O activar manualmente
$em->getFilters()->enable('softdeleteable');
```

### Problema: Blameable no establece el usuario

**Causa:** User value no configurado

**Solución:**
```php
// En un EventListener
$blameableListener->setUserValue($user->getUserIdentifier());
```

---

## Referencias

- [StofDoctrineExtensionsBundle Documentation](https://symfony.com/bundles/StofDoctrineExtensionsBundle/current/index.html)
- [Gedmo Doctrine Extensions](https://github.com/doctrine-extensions/doctrineextensions)
- [Timestampable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/timestampable.md)
- [SoftDeleteable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/softdeleteable.md)
- [Sluggable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/sluggable.md)
- [Blameable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/blameable.md)
- [Translatable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/translatable.md)
- [Loggable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/loggable.md)
