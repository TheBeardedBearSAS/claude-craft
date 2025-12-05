# Doctrine Extensions (Gedmo)

> Version: stof/doctrine-extensions-bundle v1.14.0
> Gedmo: doctrine-extensions v3.21.0
> Kompatibilität: Symfony ^6.4 || ^7.0, PHP ^8.1

## Installation

```bash
make composer CMD="require stof/doctrine-extensions-bundle"
```

**Installierte Abhängigkeiten:**
- `stof/doctrine-extensions-bundle` v1.14.0
- `gedmo/doctrine-extensions` v3.21.0

## Konfiguration

### config/packages/stof_doctrine_extensions.yaml

```yaml
stof_doctrine_extensions:
    default_locale: '%kernel.default_locale%'
    translation_fallback: true
    orm:
        default:
            timestampable: true    # Automatische createdAt, updatedAt
            sluggable: true        # Slugs für URLs
            blameable: true        # Automatische createdBy, updatedBy
            softdeleteable: true   # Logisches Löschen (deletedAt)
            translatable: true     # Mehrsprachiger Inhalt
            loggable: true         # Änderungshistorie
            tree: false            # Baumstrukturen (deaktiviert)
            sortable: false        # Automatisches Sortieren (deaktiviert)
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

## VERPFLICHTENDE Behaviors

### Timestampable (VERPFLICHTEND für alle Entitäten)

Automatische Verwaltung von Erstellungs- und Änderungsdaten.

#### ✅ Methode 1: Trait (EMPFOHLEN)

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
    use TimestampableEntity; // Fügt createdAt und updatedAt hinzu

    // Das Trait fügt automatisch hinzu:
    // - createdAt: \DateTimeInterface
    // - updatedAt: \DateTimeInterface
    // - getCreatedAt(): \DateTimeInterface
    // - setCreatedAt(\DateTimeInterface): void
    // - getUpdatedAt(): \DateTimeInterface
    // - setUpdatedAt(\DateTimeInterface): void
}
```

#### ✅ Methode 2: Manuelle Annotations

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

**Erweiterte Optionen:**

```php
<?php

// Bedingtes Timestampable (nur wenn bestimmtes Feld sich ändert)
#[Gedmo\Timestampable(on: 'change', field: 'status')]
#[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
private ?\DateTimeImmutable $statusChangedAt = null;

// Timestampable bei spezifischem Wert
#[Gedmo\Timestampable(on: 'change', field: 'status', value: 'published')]
#[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
private ?\DateTimeImmutable $publishedAt = null;
```

**Regel:** JEDE Business-Entität MUSS `createdAt` und `updatedAt` haben.

---

### Blameable (VERPFLICHTEND für Audit)

Nachverfolgbarkeit wer Entität erstellt/geändert hat.

#### ✅ Methode 1: Trait (EMPFOHLEN)

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Blameable\Traits\BlameableEntity;

#[ORM\Entity]
class Reservation
{
    use BlameableEntity; // Fügt createdBy und updatedBy hinzu

    // Das Trait fügt automatisch hinzu:
    // - createdBy: ?string
    // - updatedBy: ?string
    // - getCreatedBy(): ?string
    // - setCreatedBy(?string): void
    // - getUpdatedBy(): ?string
    // - setUpdatedBy(?string): void
}
```

#### ✅ Methode 2: User Relation (EMPFOHLEN für Atoll Tourisme)

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

**Benutzer-Konfiguration:**

```php
<?php

// In einem EventListener oder Security Voter
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
            // Für String-Trait
            $this->blameableListener->setUserValue($user->getUserIdentifier());

            // ODER für User-Relation
            // $this->blameableListener->setUserValue($user);
        }
    }
}
```

**Regel:** JEDE durch Benutzer änderbare Entität MUSS `createdBy` und `updatedBy` haben.

---

### SoftDeleteable (EMPFOHLEN für kritische Daten)

Logisches statt physisches Löschen.

#### ✅ Methode 1: Trait (EMPFOHLEN)

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
    use SoftDeleteableEntity; // Fügt deletedAt hinzu

    // Das Trait fügt automatisch hinzu:
    // - deletedAt: ?\DateTimeInterface
    // - getDeletedAt(): ?\DateTimeInterface
    // - setDeletedAt(?\DateTimeInterface): void
    // - isDeleted(): bool (custom method)
}
```

#### ✅ Methode 2: Manuell

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

**Erweiterte Optionen:**

- `timeAware: false` - Berücksichtigt Zeit nicht in Vergleichen
- `hardDelete: false` - Verbietet physisches Löschen (wirft Exception)
- `hardDelete: true` - Erlaubt physisches Löschen wenn `deletedAt` bereits gesetzt

**Verwendung:**

```php
<?php

// Logisches Löschen (Standard)
$entityManager->remove($participant);
$entityManager->flush();
// → deletedAt wird auf jetzt gesetzt

// Wiederherstellen
$participant->setDeletedAt(null);
$entityManager->flush();

// Gelöschte Entitäten anzeigen
$em->getFilters()->disable('softdeleteable');
$allParticipants = $participantRepository->findAll(); // Inkl. gelöschte
$em->getFilters()->enable('softdeleteable');

// Physisches Löschen (Hard Delete)
$em->getFilters()->disable('softdeleteable');
$participant = $participantRepository->find($id);
$em->remove($participant);
$em->flush();
```

**Regel:** Kritische Entitäten (Reservation, Participant, Sejour) → SoftDeleteable VERPFLICHTEND.

---

### Sluggable (VERPFLICHTEND für URLs)

Automatische Slug-Generierung.

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

**Erweiterte Optionen:**

```php
<?php

// Slug basierend auf mehreren Feldern
#[Gedmo\Slug(fields: ['titre', 'destination'], separator: '-')]
private string $slug;

// Slug wird aktualisiert wenn Titel sich ändert
#[Gedmo\Slug(fields: ['titre'], updatable: true)]
private string $slug;

// Slug mit Präfix/Suffix
#[Gedmo\Slug(fields: ['titre'], prefix: 'sejour-', suffix: '-2025')]
private string $slug;

// Slug-Stil
#[Gedmo\Slug(fields: ['titre'], style: 'camel')] // camelCase
#[Gedmo\Slug(fields: ['titre'], style: 'lower')] // lowercase (default)
#[Gedmo\Slug(fields: ['titre'], style: 'upper')] // UPPERCASE
```

**Regeln:**
- `unique: true` → IMMER um Kollisionen zu vermeiden
- `updatable: false` → EMPFOHLEN für SEO (stabile URLs)
- Verwenden für jede URL-exponierte Entität (Sejour, etc.)

---

### Translatable (für i18n Entitäten)

Übersetzung von Entitätsfeldern.

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

**Verwendung:**

```php
<?php

// Übersetzungen erstellen
$sejour = new Sejour();
$sejour->setTitre('Séjour en Corse');
$sejour->setDescription('Découvrez la Corse...');
$em->persist($sejour);
$em->flush();

// Englische Übersetzung hinzufügen
$sejour->setTranslatableLocale('en');
$sejour->setTitre('Trip in Corsica');
$sejour->setDescription('Discover Corsica...');
$em->flush();

// Übersetzung abrufen
$sejour->setTranslatableLocale('en');
$em->refresh($sejour);
echo $sejour->getTitre(); // "Trip in Corsica"

// Repository mit Locale
$query = $em->createQuery('SELECT s FROM App\Entity\Sejour s');
$query->setHint(
    \Gedmo\Translatable\TranslatableListener::HINT_TRANSLATABLE_LOCALE,
    'en'
);
$sejours = $query->getResult();
```

**Konfiguration:**

```yaml
# config/packages/stof_doctrine_extensions.yaml
stof_doctrine_extensions:
    default_locale: fr
    translation_fallback: true  # Fallback zu Standard-Locale
```

**Regel:** Verwenden für Entitäten mit mehrsprachigem Inhalt (Sejour, Page, etc.).

---

### Loggable (für Historie)

Änderungshistorie.

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

**Historie anzeigen:**

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

    print_r($log->getData()); // Geänderte Daten
}

// Zu vorheriger Version zurückkehren
$logRepo->revert($reservation, 3); // Version 3
$em->flush();
```

**Regel:** Verwenden für Entitäten die Audit Trail benötigen (Reservation, etc.).

---

## Empfohlenes kombiniertes Trait (AuditableEntity)

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

**Verwendung:**

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

    // Fügt automatisch hinzu:
    // - createdAt: \DateTimeInterface
    // - updatedAt: \DateTimeInterface
    // - createdBy: ?string
    // - updatedBy: ?string
    // - deletedAt: ?\DateTimeInterface

    // + Zugehörige Getters/Setters
}
```

---

## Tests mit Doctrine Extensions

### Timestampable Tests

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

        sleep(1); // Zeitunterschied sicherstellen
        $sejour->setTitre('Modified');
        $this->entityManager->flush();

        $this->assertGreaterThan($originalUpdatedAt, $sejour->getUpdatedAt());
    }
}
```

### SoftDeleteable Tests

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

        // Soft Delete
        $this->entityManager->remove($participant);
        $this->entityManager->flush();
        $this->entityManager->clear();

        // Sollte nicht finden (Filter aktiviert)
        $found = $this->repository->find($id);
        $this->assertNull($found);

        // Filter deaktivieren um gelöschte zu sehen
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

        // Soft Delete
        $this->entityManager->remove($participant);
        $this->entityManager->flush();

        // Wiederherstellen
        $this->entityManager->getFilters()->disable('softdeleteable');
        $participant->setDeletedAt(null);
        $this->entityManager->flush();
        $this->entityManager->getFilters()->enable('softdeleteable');

        // Sollte wieder gefunden werden
        $found = $this->repository->find($participant->getId());
        $this->assertNotNull($found);
        $this->assertFalse($found->isDeleted());
    }
}
```

### Sluggable Tests

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
        $sejour2->setTitre('Test Sejour'); // Gleicher Titel
        $this->entityManager->persist($sejour2);
        $this->entityManager->flush();

        $this->assertEquals('test-sejour', $sejour1->getSlug());
        $this->assertEquals('test-sejour-1', $sejour2->getSlug()); // Auto-inkrementiert
    }
}
```

---

## Checkliste für neue Entität

- [ ] `TimestampableEntity` Trait hinzugefügt (oder manuelle createdAt/updatedAt Felder)
- [ ] `BlameableEntity` Trait hinzugefügt wenn durch Benutzer änderbar
- [ ] `SoftDeleteable` konfiguriert wenn kritische Daten
- [ ] `Sluggable` konfiguriert wenn über URL exponiert
- [ ] `Translatable` konfiguriert wenn mehrsprachiger Inhalt
- [ ] `Loggable` konfiguriert wenn Audit Trail erforderlich
- [ ] Tests der Behaviors enthalten (timestampable, soft delete, slug)
- [ ] `make quality` läuft ohne Fehler

---

## Nützliche Befehle

```bash
# Konfiguration anzeigen
make console CMD="debug:config stof_doctrine_extensions"

# Doctrine Filter auflisten
make console CMD="doctrine:mapping:info"

# Migration generieren
make console CMD="doctrine:migrations:diff"

# Migration ausführen
make db-migrate

# Tests
make test
make test-coverage
```

---

## Troubleshooting

### Problem: Slug nicht generiert

**Ursache:** Sluggable Listener nicht konfiguriert oder Quellfeld leer

**Lösung:**
```php
// Prüfen dass Quellfeld gefüllt ist
$sejour->setTitre('Mon titre'); // VOR persist

// Annotation prüfen
#[Gedmo\Slug(fields: ['titre'])]
```

### Problem: SoftDeleteable filtert nicht

**Ursache:** Filter deaktiviert

**Lösung:**
```php
// doctrine.yaml prüfen
doctrine:
    orm:
        filters:
            softdeleteable:
                enabled: true  # WICHTIG

// Oder manuell aktivieren
$em->getFilters()->enable('softdeleteable');
```

### Problem: Blameable setzt Benutzer nicht

**Ursache:** User Value nicht konfiguriert

**Lösung:**
```php
// In einem EventListener
$blameableListener->setUserValue($user->getUserIdentifier());
```

---

## Referenzen

- [StofDoctrineExtensionsBundle Documentation](https://symfony.com/bundles/StofDoctrineExtensionsBundle/current/index.html)
- [Gedmo Doctrine Extensions](https://github.com/doctrine-extensions/doctrineextensions)
- [Timestampable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/timestampable.md)
- [SoftDeleteable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/softdeleteable.md)
- [Sluggable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/sluggable.md)
- [Blameable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/blameable.md)
- [Translatable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/translatable.md)
- [Loggable Docs](https://github.com/doctrine-extensions/doctrineextensions/blob/main/doc/loggable.md)
