# Doctrine Extensions (Gedmo)

> Version: stof/doctrine-extensions-bundle v1.14.0
> Gedmo: doctrine-extensions v3.21.0
> Compatibilite: Symfony ^6.4 || ^7.0, PHP ^8.1

## Installation

```bash
make composer CMD="require stof/doctrine-extensions-bundle"
```

**Dependances installees :**
- `stof/doctrine-extensions-bundle` v1.14.0
- `gedmo/doctrine-extensions` v3.21.0

## Configuration

### config/packages/stof_doctrine_extensions.yaml

```yaml
stof_doctrine_extensions:
    default_locale: '%kernel.default_locale%'
    translation_fallback: true
    orm:
        default:
            timestampable: true    # createdAt, updatedAt automatiques
            sluggable: true        # Slugs pour URLs
            blameable: true        # createdBy, updatedBy automatiques
            softdeleteable: true   # Suppression logique (deletedAt)
            translatable: true     # Contenu multilingue
            loggable: true         # Historique modifications
            tree: false            # Structures arborescentes (desactive)
            sortable: false        # Tri automatique (desactive)
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

## Behaviors OBLIGATOIRES

### Timestampable (OBLIGATOIRE sur toutes les entites)

Gestion automatique des dates de creation et modification.

#### ✅ Methode 1 : Trait (RECOMMANDE)

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
    use TimestampableEntity; // Ajoute createdAt et updatedAt

    // Le trait ajoute automatiquement :
    // - createdAt: \DateTimeInterface
    // - updatedAt: \DateTimeInterface
    // - getCreatedAt(): \DateTimeInterface
    // - setCreatedAt(\DateTimeInterface): void
    // - getUpdatedAt(): \DateTimeInterface
    // - setUpdatedAt(\DateTimeInterface): void
}
```

#### ✅ Methode 2 : Annotations manuelles

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

**Options avancees :**

```php
<?php

// Timestampable conditionnel (seulement si champ specifique change)
#[Gedmo\Timestampable(on: 'change', field: 'status')]
#[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
private ?\DateTimeImmutable $statusChangedAt = null;

// Timestampable sur valeur specifique
#[Gedmo\Timestampable(on: 'change', field: 'status', value: 'published')]
#[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
private ?\DateTimeImmutable $publishedAt = null;
```

**Regle :** TOUTE entite metier DOIT avoir `createdAt` et `updatedAt`.

---

### Blameable (OBLIGATOIRE pour audit)

Tracabilite de qui a cree/modifie l'entite.

#### ✅ Methode 1 : Trait (RECOMMANDE)

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Blameable\Traits\BlameableEntity;

#[ORM\Entity]
class Reservation
{
    use BlameableEntity; // Ajoute createdBy et updatedBy

    // Le trait ajoute automatiquement :
    // - createdBy: ?string
    // - updatedBy: ?string
    // - getCreatedBy(): ?string
    // - setCreatedBy(?string): void
    // - getUpdatedBy(): ?string
    // - setUpdatedBy(?string): void
}
```

#### ✅ Methode 2 : Relation User (RECOMMANDE pour Atoll Tourisme)

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

**Configuration utilisateur :**

```php
<?php

// Dans un EventListener ou Security Voter
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
            // Pour trait string
            $this->blameableListener->setUserValue($user->getUserIdentifier());

            // OU pour relation User
            // $this->blameableListener->setUserValue($user);
        }
    }
}
```

**Regle :** TOUTE entite modifiable par un utilisateur DOIT avoir `createdBy` et `updatedBy`.

---

### SoftDeleteable (RECOMMANDE pour donnees critiques)

Suppression logique au lieu de physique.

#### ✅ Methode 1 : Trait (RECOMMANDE)

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
    use SoftDeleteableEntity; // Ajoute deletedAt

    // Le trait ajoute automatiquement :
    // - deletedAt: ?\DateTimeInterface
    // - getDeletedAt(): ?\DateTimeInterface
    // - setDeletedAt(?\DateTimeInterface): void
    // - isDeleted(): bool (method custom)
}
```

#### ✅ Methode 2 : Manuel

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

**Options avancees :**

- `timeAware: false` - Ne tient pas compte de l'heure dans les comparaisons
- `hardDelete: false` - Interdit la suppression physique (lance exception)
- `hardDelete: true` - Permet suppression physique si `deletedAt` deja set

**Utilisation :**

```php
<?php

// Suppression logique (standard)
$entityManager->remove($participant);
$entityManager->flush();
// → deletedAt est set a maintenant

// Restauration
$participant->setDeletedAt(null);
$entityManager->flush();

// Voir entites supprimees
$em->getFilters()->disable('softdeleteable');
$allParticipants = $participantRepository->findAll(); // Inclut supprimes
$em->getFilters()->enable('softdeleteable');

// Suppression physique (hard delete)
$em->getFilters()->disable('softdeleteable');
$participant = $participantRepository->find($id);
$em->remove($participant);
$em->flush();
```

**Regle :** Entites critiques (Reservation, Participant, Sejour) → SoftDeleteable OBLIGATOIRE.

---

### Sluggable (OBLIGATOIRE pour URLs)

Generation automatique de slugs.

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

**Options avancees :**

```php
<?php

// Slug base sur plusieurs champs
#[Gedmo\Slug(fields: ['titre', 'destination'], separator: '-')]
private string $slug;

// Slug mis a jour si titre change
#[Gedmo\Slug(fields: ['titre'], updatable: true)]
private string $slug;

// Slug avec prefixe/suffixe
#[Gedmo\Slug(fields: ['titre'], prefix: 'sejour-', suffix: '-2025')]
private string $slug;

// Style de slug
#[Gedmo\Slug(fields: ['titre'], style: 'camel')] // camelCase
#[Gedmo\Slug(fields: ['titre'], style: 'lower')] // lowercase (default)
#[Gedmo\Slug(fields: ['titre'], style: 'upper')] // UPPERCASE
```

**Regles :**
- `unique: true` → TOUJOURS pour eviter les collisions
- `updatable: false` → RECOMMANDE pour SEO (URLs stables)
- Utiliser pour toute entite exposee via URL (Sejour, etc.)

---

### Translatable (pour entites i18n)

Traduction des champs d'entites.

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

**Utilisation :**

```php
<?php

// Creer traductions
$sejour = new Sejour();
$sejour->setTitre('Séjour en Corse');
$sejour->setDescription('Découvrez la Corse...');
$em->persist($sejour);
$em->flush();

// Ajouter traduction anglaise
$sejour->setTranslatableLocale('en');
$sejour->setTitre('Trip in Corsica');
$sejour->setDescription('Discover Corsica...');
$em->flush();

// Recuperer traduction
$sejour->setTranslatableLocale('en');
$em->refresh($sejour);
echo $sejour->getTitre(); // "Trip in Corsica"

// Repository avec locale
$query = $em->createQuery('SELECT s FROM App\Entity\Sejour s');
$query->setHint(
    \Gedmo\Translatable\TranslatableListener::HINT_TRANSLATABLE_LOCALE,
    'en'
);
$sejours = $query->getResult();
```

**Configuration :**

```yaml
# config/packages/stof_doctrine_extensions.yaml
stof_doctrine_extensions:
    default_locale: fr
    translation_fallback: true  # Fallback vers locale par defaut
```

**Regle :** Utiliser pour les entites avec contenu multilingue (Sejour, Page, etc.).

---

### Loggable (pour historique)

Historique des modifications.

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

**Voir l'historique :**

```php
<?php

use Gedmo\Loggable\Entity\Repository\LogEntryRepository;

$logRepo = $em->getRepository('Gedmo\Loggable\Entity\LogEntry');
$logs = $logRepo->getLogEntries($reservation);

foreach ($logs as $log) {
    echo sprintf(
        "Version %d: %s a %s (par %s)\n",
        $log->getVersion(),
        $log->getAction(),
        $log->getLoggedAt()->format('Y-m-d H:i:s'),
        $log->getUsername()
    );

    print_r($log->getData()); // Donnees modifiees
}

// Revenir a une version precedente
$logRepo->revert($reservation, 3); // Version 3
$em->flush();
```

**Regle :** Utiliser pour les entites necessitant un audit trail (Reservation, etc.).

---

## Trait combine recommande (AuditableEntity)

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

**Usage :**

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

    // Ajoute automatiquement :
    // - createdAt: \DateTimeInterface
    // - updatedAt: \DateTimeInterface
    // - createdBy: ?string
    // - updatedBy: ?string
    // - deletedAt: ?\DateTimeInterface

    // + Getters/Setters associes
}
```

---

## Tests avec Doctrine Extensions

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

## Checklist nouvelle entite

- [ ] `TimestampableEntity` trait ajoute (ou champs manuels createdAt/updatedAt)
- [ ] `BlameableEntity` trait ajoute si modifiable par utilisateur
- [ ] `SoftDeleteable` configure si donnees critiques
- [ ] `Sluggable` configure si exposee via URL
- [ ] `Translatable` configure si contenu multilingue
- [ ] `Loggable` configure si audit trail requis
- [ ] Tests des behaviors inclus (timestampable, soft delete, slug)
- [ ] `make quality` passe sans erreur

---

## Commands utiles

```bash
# Voir configuration
make console CMD="debug:config stof_doctrine_extensions"

# Lister les filtres Doctrine
make console CMD="doctrine:mapping:info"

# Generer migration
make console CMD="doctrine:migrations:diff"

# Executer migration
make db-migrate

# Tests
make test
make test-coverage
```

---

## Troubleshooting

### Probleme : Slug non genere

**Cause :** Listener Sluggable non configure ou champ source vide

**Solution :**
```php
// Verifier que le champ source est rempli
$sejour->setTitre('Mon titre'); // AVANT persist

// Verifier annotation
#[Gedmo\Slug(fields: ['titre'])]
```

### Probleme : SoftDeleteable ne filtre pas

**Cause :** Filtre desactive

**Solution :**
```php
// Verifier doctrine.yaml
doctrine:
    orm:
        filters:
            softdeleteable:
                enabled: true  # IMPORTANT

// Ou activer manuellement
$em->getFilters()->enable('softdeleteable');
```

### Probleme : Blameable ne set pas l'utilisateur

**Cause :** User value non configure

**Solution :**
```php
// Dans un EventListener
$blameableListener->setUserValue($user->getUserIdentifier());
```

---

## References

- [StofDoctrineExtensionsBundle Documentation](https://symfony.com/bundles/StofDoctrineExtensionsBundle/current/index.html)
- [Gedmo Doctrine Extensions](https://github.com/doctrine-extensions/doctrineextensions)
- [Timestampable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/timestampable.md)
- [SoftDeleteable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/softdeleteable.md)
- [Sluggable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/sluggable.md)
- [Blameable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/blameable.md)
- [Translatable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/translatable.md)
- [Loggable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/loggable.md)
