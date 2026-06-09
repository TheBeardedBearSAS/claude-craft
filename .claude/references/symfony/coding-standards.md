# Standards de Code - PHP 8.4+ / Symfony 8.1

## Principes Generaux

### PSR-12 + Symfony Coding Standards

Le projet suit strictement :
1. **PSR-12** : Standard PHP officiel
2. **@Symfony** : Conventions Symfony
3. **@Symfony:risky** : Regles strictes Symfony
4. **@PHP84Migration** : Modernisation PHP 8.4+

Configuration : `.php-cs-fixer.dist.php`

### Versions Requises (2026)

- **PHP**: 8.4+ (Symfony 8.1 requiert PHP 8.4+, recommandé pour Lazy Objects natifs et Property Hooks)
- **Symfony**: 8.1.x (stable 8.1 (mai 2026, recommandée)) ou 7.4 LTS

**Source:** https://symfony.com/releases/8.1

### Support Timeline Symfony

| Version | Type | Fin de maintenance | Fin de sécurité | Recommandation |
|---------|------|--------------------|-----------------|----------------|
| **7.4** | LTS | Nov. 2028 | Nov. 2029 | ✅ Recommandée (LTS) |
| **8.0** | Standard | Juil. 2026 | Juil. 2026 | ❌ EOS imminent — ne pas démarrer |
| **8.1** | Standard | Jan. 2027 | Jan. 2027 | ✅ Recommandée (dernière stable) |
| **8.4** | LTS (attendue) | ~Nov. 2030 | ~Nov. 2031 | ⏳ Sortie prévue nov. 2027 |

**Règle :** démarrer un nouveau projet sur **7.4 LTS** (support jusqu'à 2029) ou **8.1** (dernière stable). Ne jamais choisir **8.0** (EOS juillet 2026).

**Source:** https://symfony.com/releases

### Nouvelles Features PHP 8.4

#### Property Hooks (PHP 8.4)

```php
<?php

// ✅ PHP 8.4 Property Hooks - getters/setters natifs
class User {
    public string $name {
        get => strtoupper($this->name);
        set => ucfirst($value);
    }
    
    public private(set) string $email; // Asymmetric Visibility
}

$user = new User();
$user->name = 'john'; // set hook appelé
echo $user->name;     // "JOHN" (get hook appelé)
```

**Source:** https://www.php.net/releases/8.4/en.php

#### Lazy Objects (natifs depuis PHP 8.4)

```php
<?php

// ✅ Lazy objects natifs - chargement différé automatique
$reflector = new ReflectionClass(ExpensiveService::class);
$lazyService = $reflector->newLazyProxy(function () {
    return new ExpensiveService(); // Créé seulement à l'usage
});
```

#### Asymmetric Visibility (PHP 8.4)

```php
<?php

// ✅ Visibilité asymétrique - lecture publique, écriture privée
class Order {
    public private(set) string $status = 'pending';
    
    public function confirm(): void {
        $this->status = 'confirmed'; // OK en interne
    }
}

$order = new Order();
echo $order->status; // OK
$order->status = 'x'; // ERREUR : private(set)
```

### Nouvelles Features PHP 8.5 (stable, nov. 2025)

PHP 8.5 est sorti le 20 novembre 2025 (dernière patch : 8.5.7, avril 2026) — **production-ready**.

**Source:** https://www.php.net/releases/8.5/en.php

#### Pipe Operator (|>)

```php
<?php

// ✅ PHP 8.5 Pipe operator - chainage fonctionnel lisible
$result = $input
    |> trim(...)
    |> strtolower(...)
    |> fn($s) => str_replace(' ', '-', $s)
    |> htmlspecialchars(...);

// Équivalent sans pipe (moins lisible)
$result = htmlspecialchars(str_replace(' ', '-', strtolower(trim($input))));
```

#### clone with — Clonage partiel immutable

```php
<?php

// ✅ PHP 8.5 clone with - modifier des propriétés à la création d'un clone
$updated = clone $order with { status: 'confirmed', updatedAt: new \DateTimeImmutable() };
```

#### Attribut #[\NoDiscard]

```php
<?php

// ✅ PHP 8.5 #[\NoDiscard] - avertissement si la valeur de retour est ignorée
#[\NoDiscard]
public function save(): Result { ... }

// Déclenche un warning si appelé sans utiliser la valeur retournée
$this->save(); // Warning : valeur de retour ignorée
```

### Verification Automatique

```bash
# Verifier conformite
make cs-check

# Corriger automatiquement
make cs-fix
```

## Langues OBLIGATOIRES

### Regle Absolue

| Element | Langue | Justification |
|---------|--------|---------------|
| **Code** (classes, methodes, variables, constantes) | 🇬🇧 **ANGLAIS** | Standard international, interoperabilite |
| **Commits** | 🇬🇧 **ANGLAIS** | Historique Git lisible internationalement |
| **Commentaires code** | 🇬🇧 **ANGLAIS** | Code partageable, maintenable |
| **Documentation** (.md, README, guides) | 🇫🇷 **FRANÇAIS** | Equipe et clients francophones |
| **Messages UI** (labels, erreurs, emails) | 🇫🇷 **FRANÇAIS** | Utilisateurs finaux francophones |
| **Logs applicatifs** | 🇫🇷 **FRANÇAIS** | Debug et support client |

### Examples Conformes

#### ✅ Code EN + Doc FR
```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

/**
 * Represents a monetary amount with currency.
 * Immutable value object following DDD principles.
 */
final readonly class Money
{
    public function __construct(
        private float $amount,
        private Currency $currency
    ) {
        if ($amount < 0) {
            throw new InvalidArgumentException('Amount cannot be negative');
        }
    }

    public function add(Money $other): self
    {
        if (!$this->currency->equals($other->currency)) {
            throw new CurrencyMismatchException('Cannot add different currencies');
        }

        return new self($this->amount + $other->amount, $this->currency);
    }

    public function format(): string
    {
        return number_format($this->amount, 2) . ' ' . $this->currency->code();
    }
}
```

#### ✅ Message UI FR
```php
<?php

// Controller
$this->addFlash('success', 'Votre reservation a ete confirmee avec succes.');
$this->addFlash('error', 'Le sejour n\'a plus de places disponibles.');

// Validation
#[Assert\NotBlank(message: 'Le nom est obligatoire')]
#[Assert\Email(message: 'L\'adresse email n\'est pas valide')]
private string $email;

// Exception pour utilisateur final
throw new InsufficientSlotsException('Il ne reste que 2 places pour ce sejour.');
```

#### ✅ Log FR
```php
<?php

$this->logger->info('Nouvelle reservation creee', [
    'reservation_id' => $reservation->getId(),
    'sejour' => $reservation->getSejour()->getTitle(),
    'participants' => count($reservation->getParticipants()),
]);

$this->logger->error('Echec envoi email de confirmation', [
    'reservation_id' => $reservationId,
    'error' => $exception->getMessage(),
]);
```

#### ❌ Melange de Langues (INTERDIT)
```php
<?php

// MAUVAIS : Code en francais
class GestionReservation { // ❌ Francais
    public function creerReservation() { // ❌ Francais
        $sejour = $this->trouverSejour($id); // ❌ Francais
    }
}

// MAUVAIS : Message UI en anglais
$this->addFlash('success', 'Your booking has been confirmed'); // ❌ Anglais
```

## Conventions de Nommage

### Classes

```php
<?php

// ✅ CORRECT : PascalCase, nom singulier, suffixe explicite
class ReservationRepository { }
class CreateReservationCommand { }
class ReservationCreatedEvent { }
class MoneyValueObject { }
class InsufficientSlotsException { }

// ❌ INCORRECT
class reservationRepository { } // Pas PascalCase
class Reservations { } // Pluriel
class Reservation_Repository { } // Snake_case
```

### Methodes et Variables

```php
<?php

// ✅ CORRECT : camelCase, verbes pour actions, noms pour getters
public function createReservation(CreateReservationCommand $command): Reservation { }
public function findAvailableTrips(DateRange $dateRange): array { }
public function isConfirmed(): bool { }
public function getParticipants(): Collection { }

private string $primaryContactEmail;
private int $availableSlots;

// ❌ INCORRECT
public function CreateReservation() { } // PascalCase interdit
public function get_participants() { } // Snake_case interdit
private $email; // Pas de type
```

### Constantes

```php
<?php

// ✅ CORRECT : SCREAMING_SNAKE_CASE
final class ReservationStatus
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';

    public const MAX_PARTICIPANTS_PER_BOOKING = 10;
}

// ❌ INCORRECT
const status_pending = 'pending'; // Pas SCREAMING_SNAKE_CASE
const StatusPending = 'pending'; // Pas le bon format
```

## Documentation PHPDoc

### Regles

1. **Obligatoire** sur methodes publiques et proprietes
2. **Types stricts** avec generics PHPStan
3. **Anglais** uniquement
4. **Descriptions utiles** (pas de paraphrase)

### Examples

#### ✅ PHPDoc Conforme
```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\Common\Collections\Collection;

class Reservation
{
    /**
     * @var Collection<int, Participant>
     */
    private Collection $participants;

    /**
     * Adds a participant to this reservation.
     *
     * @throws InsufficientSlotsException if no slots available
     * @throws InvalidParticipantException if participant data is invalid
     */
    public function addParticipant(Participant $participant): void
    {
        if ($this->isFull()) {
            throw new InsufficientSlotsException();
        }

        $this->participants->add($participant);
    }

    /**
     * Checks if this reservation can still accept participants.
     *
     * @return bool true if slots available, false otherwise
     */
    public function hasAvailableSlots(): bool
    {
        return $this->participants->count() < $this->maxParticipants;
    }
}
```

#### ❌ PHPDoc Incorrect
```php
<?php

// MAUVAIS : Pas de generics
/** @var Collection */
private Collection $participants; // ❌ Type incomplet

// MAUVAIS : Paraphrase inutile
/** Adds a participant */ // ❌ Repete le nom de methode
public function addParticipant(Participant $participant): void { }

// MAUVAIS : Francais
/** Verifie si la reservation est pleine */ // ❌ Francais
public function isFull(): bool { }
```

## Strict Types

### Obligatoire sur TOUS les fichiers PHP

```php
<?php

declare(strict_types=1);

// Reste du code...
```

Configuration PHP-CS-Fixer :
```php
'declare_strict_types' => true,
```

## Imports

### Ordre Alphabetique + Groupes

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

// 1. Classes externes (vendors)
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

// 2. Classes internes (App\)
use App\Domain\Event\ReservationCreatedEvent;
use App\Domain\Exception\InsufficientSlotsException;
use App\Domain\ValueObject\Money;

// Code de la classe...
```

Configuration PHP-CS-Fixer :
```php
'no_unused_imports' => true,
'ordered_imports' => [
    'imports_order' => ['class', 'function', 'const'],
    'sort_algorithm' => 'alpha',
],
```

## Indentation et Formatage

### Regles PSR-12

```php
<?php

// ✅ Indentation 4 espaces (pas de tabs)
class Example
{
    public function method(
        string $param1,
        int $param2,
        bool $param3
    ): void {
        if ($condition) {
            // Code...
        }
    }
}

// ✅ Accolades sur nouvelle ligne pour classes/methodes
class Reservation
{
    public function __construct()
    {
        // ...
    }
}

// ✅ Accolades sur meme ligne pour structures de controle
if ($reservation->isConfirmed()) {
    $this->sendEmail($reservation);
}

// ✅ Concatenation avec espaces
$message = 'Bonjour ' . $participant->getFirstName() . ' !';
```

## Commentaires

### Quand Commenter ?

```php
<?php

// ✅ Commenter le "pourquoi", pas le "quoi"
// We use bcrypt instead of argon2 for compatibility with legacy systems
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// ✅ Commenter les hacks temporaires avec TODO
// TODO: Remove this workaround when Doctrine 3.0 is released
$query->setHint('knp_paginator.count', $countQuery);

// ✅ Commenter la logique metier complexe
// RGPD: Data must be encrypted before storage and automatically
// deleted 3 years after trip completion (Article 5 GDPR)
$this->encryptSensitiveData($participant);

// ❌ Paraphraser le code (inutile)
// Set status to confirmed
$reservation->setStatus('confirmed'); // ❌ Evidence
```

## Outils de Verification

### PHP-CS-Fixer (Automatique)

```bash
# Verifier sans modifier
make cs-check

# Corriger automatiquement
make cs-fix
```

### PHPStan (Analysis Statique)

```bash
# Verifier types et standards
make phpstan
```

### Integration Pre-Commit

Voir `.claude/checklists/pre-commit.md` pour checklist complete.

## References

- **PSR-12** : https://www.php-fig.org/psr/psr-12/
- **Symfony Coding Standards** : https://symfony.com/doc/current/contributing/code/standards.html
- **PHP-CS-Fixer** : https://github.com/PHP-CS-Fixer/PHP-CS-Fixer
- **PHPStan** : https://phpstan.org/
