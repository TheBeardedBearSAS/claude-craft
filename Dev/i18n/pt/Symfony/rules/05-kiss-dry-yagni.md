# Principes KISS, DRY, YAGNI - Atoll Tourisme

## Overview

Les principes **KISS** (Keep It Simple, Stupid), **DRY** (Don't Repeat Yourself) et **YAGNI** (You Aren't Gonna Need It) sont **obligatoires** pour maintenir un code simple, maintenable et évolutif.

> **Références:**
> - `04-solid-principles.md` - Principes SOLID complémentaires
> - `03-coding-standards.md` - Standards de code
> - `07-testing-tdd-bdd.md` - Tests et simplicité
> - `02-architecture-clean-ddd.md` - Architecture simple

---

## Table des matières

1. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Anti-patterns courants](#anti-patterns-courants)
5. [Checklist de validation](#checklist-de-validation)

---

## KISS - Keep It Simple, Stupid

### Définition

**La simplicité doit être un objectif clé de la conception. La complexité doit être évitée.**

Le code le plus simple est souvent le meilleur code.

### Règles KISS pour Atoll Tourisme

1. **Méthodes courtes:** Maximum 20 lignes par méthode
2. **Complexité cyclomatique:** Maximum 10 par méthode
3. **Profondeur d'indentation:** Maximum 3 niveaux
4. **Paramètres:** Maximum 4 paramètres par méthode
5. **Classes:** Maximum 200 lignes par classe

### Application

#### ❌ MAUVAIS - Code complexe

```php
<?php

namespace App\Service;

use App\Entity\Reservation;

class ReservationPriceCalculator
{
    // ❌ VIOLATION KISS: Méthode trop longue (50+ lignes), logique imbriquée
    public function calculateTotalPrice(Reservation $reservation): float
    {
        $total = 0;
        $participants = $reservation->getParticipants();
        $sejour = $reservation->getSejour();

        // Calcul de base
        foreach ($participants as $participant) {
            $basePrice = $sejour->getPrixBase();

            // Age-based pricing
            $age = $participant->getAge();
            if ($age < 3) {
                $basePrice = 0;
            } elseif ($age >= 3 && $age < 12) {
                $basePrice = $basePrice * 0.5;
            } elseif ($age >= 12 && $age < 18) {
                $basePrice = $basePrice * 0.75;
            }

            // Supplément chambre individuelle
            if ($participant->wantsSingleRoom()) {
                if ($sejour->getDuree() <= 7) {
                    $basePrice += 50;
                } else {
                    $basePrice += 100;
                }
            }

            $total += $basePrice;
        }

        // Remises
        $nbParticipants = count($participants);
        if ($nbParticipants >= 2 && $nbParticipants < 4) {
            $total = $total * 0.95;
        } elseif ($nbParticipants >= 4 && $nbParticipants < 6) {
            $total = $total * 0.90;
        } elseif ($nbParticipants >= 6) {
            $total = $total * 0.85;
        }

        // Remise anticipée
        $daysUntilTrip = $sejour->getDateDebut()->diff(new \DateTime())->days;
        if ($daysUntilTrip > 90) {
            $total = $total * 0.95;
        } elseif ($daysUntilTrip > 60) {
            $total = $total * 0.97;
        }

        // Remise fidélité
        $client = $reservation->getClient();
        $previousReservations = $client->getReservations()->count();
        if ($previousReservations >= 5) {
            $total = $total * 0.90;
        } elseif ($previousReservations >= 3) {
            $total = $total * 0.95;
        }

        // Assurance annulation
        if ($reservation->hasAssuranceAnnulation()) {
            $assurancePrice = 0;
            if ($total < 500) {
                $assurancePrice = 30;
            } elseif ($total >= 500 && $total < 1000) {
                $assurancePrice = 50;
            } else {
                $assurancePrice = 80;
            }
            $total += $assurancePrice;
        }

        return round($total, 2);
    }
}
```

#### ✅ BON - Code simple et décomposé

```php
<?php

// 1. VALUE OBJECT - Encapsulation simple
namespace App\Domain\Reservation\ValueObject;

final readonly class Money
{
    private function __construct(
        private int $amountCents,
    ) {}

    public static function fromEuros(float $amount): self
    {
        return new self((int) round($amount * 100));
    }

    public function add(self $other): self
    {
        return new self($this->amountCents + $other->amountCents);
    }

    public function multiply(float $multiplier): self
    {
        return new self((int) round($this->amountCents * $multiplier));
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }
}

// 2. POLITIQUE - Une responsabilité simple
namespace App\Domain\Reservation\Pricing\Policy;

final readonly class AgePricingPolicy
{
    public function calculatePrice(Money $basePrice, int $age): Money
    {
        return match (true) {
            $age < 3 => Money::fromEuros(0),
            $age < 12 => $basePrice->multiply(0.5),
            $age < 18 => $basePrice->multiply(0.75),
            default => $basePrice,
        };
    }
}

// 3. POLITIQUE - Logique isolée et simple
namespace App\Domain\Reservation\Pricing\Policy;

final readonly class SingleRoomSupplementPolicy
{
    private const int SHORT_STAY_DAYS = 7;
    private const float SHORT_STAY_SUPPLEMENT = 50.00;
    private const float LONG_STAY_SUPPLEMENT = 100.00;

    public function calculate(int $durationDays): Money
    {
        $supplement = $durationDays <= self::SHORT_STAY_DAYS
            ? self::SHORT_STAY_SUPPLEMENT
            : self::LONG_STAY_SUPPLEMENT;

        return Money::fromEuros($supplement);
    }
}

// 4. SERVICE - Orchestration simple
namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;

final readonly class ReservationPricingService
{
    public function __construct(
        private ParticipantPricingCalculator $participantCalculator,
        private DiscountCalculator $discountCalculator,
    ) {}

    // ✅ Méthode courte (< 10 lignes)
    public function calculateTotalPrice(Reservation $reservation): Money
    {
        $baseTotal = $this->participantCalculator->calculateTotal($reservation);
        $withDiscounts = $this->discountCalculator->applyDiscounts($baseTotal, $reservation);

        return $withDiscounts;
    }
}

// 5. CALCULATOR - Logique focalisée
namespace App\Domain\Reservation\Service;

final readonly class ParticipantPricingCalculator
{
    public function __construct(
        private AgePricingPolicy $agePolicy,
        private SingleRoomSupplementPolicy $singleRoomPolicy,
    ) {}

    public function calculateTotal(Reservation $reservation): Money
    {
        $total = Money::fromEuros(0);

        foreach ($reservation->getParticipants() as $participant) {
            $total = $total->add($this->calculateParticipantPrice($participant, $reservation));
        }

        return $total;
    }

    // ✅ Méthode simple et lisible
    private function calculateParticipantPrice(Participant $participant, Reservation $reservation): Money
    {
        $basePrice = $reservation->getSejour()->getPrixBase();
        $priceWithAge = $this->agePolicy->calculatePrice($basePrice, $participant->getAge());

        if ($participant->wantsSingleRoom()) {
            $supplement = $this->singleRoomPolicy->calculate($reservation->getSejour()->getDuree());
            return $priceWithAge->add($supplement);
        }

        return $priceWithAge;
    }
}
```

### Métriques KISS

```bash
# Complexité cyclomatique (max 10)
vendor/bin/phpmetrics --report-violations=phpmetrics.xml src/

# Lignes par méthode (max 20)
vendor/bin/phpmd src/ text cleancode

# PHPStan niveau max
vendor/bin/phpstan analyse -l max src/
```

### Règles de simplicité

1. **Un seul return par méthode** (sauf early returns pour validation)
2. **Pas de else** quand possible (early returns, guard clauses)
3. **Nommage explicite** (pas besoin de commentaires)
4. **Composition > Héritage**
5. **Immutabilité par défaut** (readonly)

#### ✅ BON - Early returns

```php
public function calculateDiscount(Reservation $reservation): Money
{
    // ✅ Guard clauses = pas de else imbriqués
    if (!$reservation->isEligibleForDiscount()) {
        return Money::fromEuros(0);
    }

    if ($reservation->getParticipantCount() < 2) {
        return Money::fromEuros(0);
    }

    return $this->discountPolicy->calculate($reservation);
}
```

---

## DRY - Don't Repeat Yourself

### Définition

**Chaque connaissance doit avoir une représentation unique, non ambiguë et faisant autorité dans le système.**

Ne dupliquez pas la logique métier, les règles de validation ou les algorithmes.

### Types de duplication

1. **Duplication de logique** ❌ Même code à plusieurs endroits
2. **Duplication de connaissance** ❌ Mêmes règles métier redéfinies
3. **Duplication structurelle** ❌ Mêmes patterns répétés
4. **Duplication de documentation** ❌ Mêmes informations en plusieurs formats

### Application

#### ❌ MAUVAIS - Duplication de validation

```php
<?php

namespace App\Controller;

class ReservationController
{
    public function create(Request $request): Response
    {
        $data = $request->request->all();

        // ❌ VIOLATION DRY: Validation dupliquée
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Email invalide');
        }

        if (empty($data['telephone']) || !preg_match('/^[0-9]{10}$/', $data['telephone'])) {
            throw new \InvalidArgumentException('Téléphone invalide');
        }

        // ...
    }
}

namespace App\Form\Type;

class ReservationFormType
{
    public function configureOptions(OptionsResolver $resolver): void
    {
        // ❌ DUPLICATION: Mêmes règles de validation
        $resolver->setDefaults([
            'constraints' => [
                new Assert\Email(message: 'Email invalide'),
                new Assert\Regex(pattern: '/^[0-9]{10}$/', message: 'Téléphone invalide'),
            ],
        ]);
    }
}

namespace App\Entity;

class Reservation
{
    // ❌ DUPLICATION: Encore les mêmes règles
    #[Assert\Email(message: 'Email invalide')]
    private string $email;

    #[Assert\Regex(pattern: '/^[0-9]{10}$/')]
    private string $telephone;
}
```

#### ✅ BON - Validation centralisée

```php
<?php

// 1. VALUE OBJECT - Source unique de vérité
namespace App\Domain\Shared\ValueObject;

final readonly class Email
{
    private function __construct(
        private string $value,
    ) {
        // ✅ Validation en UN SEUL endroit
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException(
                sprintf('Email invalide: %s', $value)
            );
        }
    }

    public static function fromString(string $email): self
    {
        return new self($email);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}

// 2. VALUE OBJECT - Téléphone
namespace App\Domain\Shared\ValueObject;

final readonly class PhoneNumber
{
    private const string PATTERN = '/^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/';

    private function __construct(
        private string $value,
    ) {
        // ✅ Validation centralisée
        if (!preg_match(self::PATTERN, $value)) {
            throw new \InvalidArgumentException(
                sprintf('Numéro de téléphone invalide: %s', $value)
            );
        }
    }

    public static function fromString(string $phone): self
    {
        return new self($phone);
    }

    public function getValue(): string
    {
        return $this->value;
    }
}

// 3. ENTITÉ - Utilise les Value Objects
namespace App\Domain\Reservation\Entity;

use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\PhoneNumber;

class Reservation
{
    // ✅ Pas de duplication - délègue aux VOs
    private Email $email;
    private PhoneNumber $telephone;

    public function __construct(Email $email, PhoneNumber $telephone)
    {
        $this->email = $email;
        $this->telephone = $telephone;
    }
}

// 4. FORMULAIRE - Utilise les VOs
namespace App\Form\Type;

use App\Domain\Shared\ValueObject\Email;
use Symfony\Component\Form\DataTransformerInterface;

final class EmailTransformer implements DataTransformerInterface
{
    public function transform($value): string
    {
        return $value instanceof Email ? $value->getValue() : '';
    }

    public function reverseTransform($value): ?Email
    {
        if (empty($value)) {
            return null;
        }

        // ✅ Utilise la validation du VO
        return Email::fromString($value);
    }
}

// 5. DOCTRINE TYPE - Persistance
namespace App\Infrastructure\Doctrine\Type;

use App\Domain\Shared\ValueObject\Email;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;

final class EmailType extends Type
{
    public function convertToDatabaseValue($value, AbstractPlatform $platform): ?string
    {
        return $value instanceof Email ? $value->getValue() : null;
    }

    public function convertToPHPValue($value, AbstractPlatform $platform): ?Email
    {
        // ✅ Réutilise la logique du VO
        return $value !== null ? Email::fromString($value) : null;
    }

    public function getName(): string
    {
        return 'email';
    }

    public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
    {
        return $platform->getStringTypeDeclarationSQL($column);
    }
}
```

### DRY vs WET (Write Everything Twice)

#### ⚠️ Warning: Duplication acceptable

```php
<?php

// ✅ OK: Duplication de structure, pas de logique
namespace App\Domain\Reservation\ValueObject;

final readonly class ReservationId
{
    private function __construct(
        private string $value,
    ) {
        if (empty($value)) {
            throw new \InvalidArgumentException('ReservationId cannot be empty');
        }
    }

    public static function fromString(string $id): self
    {
        return new self($id);
    }

    public function getValue(): string
    {
        return $this->value;
    }
}

namespace App\Domain\Sejour\ValueObject;

final readonly class SejourId
{
    // ✅ OK: Même structure mais types différents (type safety)
    private function __construct(
        private string $value,
    ) {
        if (empty($value)) {
            throw new \InvalidArgumentException('SejourId cannot be empty');
        }
    }

    public static function fromString(string $id): self
    {
        return new self($id);
    }

    public function getValue(): string
    {
        return $this->value;
    }
}
```

### Règle des 3

> **Ne pas abstraire avant d'avoir vu le pattern 3 fois.**

```php
// ❌ Abstraction prématurée (vu 1 fois)
abstract class AbstractIdValueObject
{
    // Trop tôt pour abstraire
}

// ✅ Attendre 3 occurrences similaires avant d'extraire
// Après 3-4 IDs similaires → créer un trait ou classe de base
```

---

## YAGNI - You Aren't Gonna Need It

### Définition

**N'implémentez pas de fonctionnalité tant qu'elle n'est pas nécessaire.**

Ne codez pas pour des besoins hypothétiques futurs.

### Application

#### ❌ MAUVAIS - Over-engineering

```php
<?php

namespace App\Service;

// ❌ VIOLATION YAGNI: Fonctionnalités non requises
class ReservationService
{
    // ❌ Support multi-devises (pas dans les specs)
    public function calculatePriceInCurrency(
        Reservation $reservation,
        string $targetCurrency
    ): float {
        // Conversion EUR -> USD, GBP, JPY, etc.
        // YAGNI: On travaille uniquement en EUR
    }

    // ❌ Support réservations récurrentes (pas demandé)
    public function createRecurringReservation(
        Reservation $template,
        string $frequency, // daily, weekly, monthly
        int $occurrences
    ): array {
        // YAGNI: Pas de réservations récurrentes dans Atoll Tourisme
    }

    // ❌ Export vers 10 formats différents (seul CSV demandé)
    public function export(
        array $reservations,
        string $format // csv, xml, json, yaml, pdf, xlsx, ods...
    ): string {
        // YAGNI: Seul CSV est requis actuellement
    }

    // ❌ Système de points de fidélité complexe (pas dans MVP)
    public function calculateLoyaltyPoints(Reservation $reservation): int
    {
        // YAGNI: Pas de programme de fidélité prévu
    }

    // ❌ Machine à états complexe (statuts actuels suffisent)
    public function transitionToState(
        Reservation $reservation,
        string $targetState,
        array $context = []
    ): void {
        // YAGNI: Les 4 statuts simples suffisent (en_attente, confirmee, annulee, terminee)
    }
}
```

#### ✅ BON - Implementation minimale fonctionnelle

```php
<?php

// 1. SERVICE - Juste ce qui est nécessaire maintenant
namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;

final readonly class ReservationPricingService
{
    public function __construct(
        private iterable $pricingPolicies,
    ) {}

    // ✅ Uniquement calcul en EUR (besoin actuel)
    public function calculateTotalPrice(Reservation $reservation): Money
    {
        $basePrice = $this->calculateBasePrice($reservation);

        foreach ($this->pricingPolicies as $policy) {
            $basePrice = $policy->apply($basePrice, $reservation);
        }

        return $basePrice;
    }

    private function calculateBasePrice(Reservation $reservation): Money
    {
        $total = Money::fromEuros(0);

        foreach ($reservation->getParticipants() as $participant) {
            $total = $total->add($reservation->getSejour()->getPrixBase());
        }

        return $total;
    }
}

// 2. EXPORT - Uniquement CSV (requis maintenant)
namespace App\Infrastructure\Reservation\Export;

use App\Domain\Reservation\Entity\Reservation;

final readonly class CsvReservationExporter
{
    // ✅ Implémente UNIQUEMENT le format requis
    public function export(array $reservations, string $filename): void
    {
        $handle = fopen($filename, 'w');

        // Headers
        fputcsv($handle, ['ID', 'Client', 'Séjour', 'Montant', 'Statut']);

        // Data
        foreach ($reservations as $reservation) {
            fputcsv($handle, [
                $reservation->getId(),
                $reservation->getClient()->getNom(),
                $reservation->getSejour()->getTitre(),
                $reservation->getMontantTotal()->getAmountEuros(),
                $reservation->getStatut()->value,
            ]);
        }

        fclose($handle);
    }
}

// 3. STATUTS - Enum simple (besoin actuel)
namespace App\Domain\Reservation\ValueObject;

// ✅ Uniquement les 4 statuts requis
enum ReservationStatus: string
{
    case EN_ATTENTE = 'en_attente';
    case CONFIRMEE = 'confirmee';
    case ANNULEE = 'annulee';
    case TERMINEE = 'terminee';
}

// ❌ PAS de machine à états complexe tant que pas nécessaire
// ❌ PAS de workflow Symfony Workflow tant que pas requis
```

### YAGNI vs Extension future

#### ✅ Bon équilibre: Extensibilité sans complexité

```php
<?php

// ✅ Interface simple, extensible si besoin
namespace App\Domain\Reservation\Pricing;

interface DiscountPolicyInterface
{
    public function apply(Money $amount, Reservation $reservation): Money;
}

// ✅ Implémentation actuelle simple
final readonly class FamilyDiscountPolicy implements DiscountPolicyInterface
{
    public function apply(Money $amount, Reservation $reservation): Money
    {
        if (count($reservation->getParticipants()) >= 4) {
            return $amount->multiply(0.9);
        }

        return $amount;
    }
}

// ✅ Si besoin futur: nouvelle implémentation (OCP)
// Sans modifier le code existant
final readonly class LoyaltyDiscountPolicy implements DiscountPolicyInterface
{
    public function apply(Money $amount, Reservation $reservation): Money
    {
        // Implémentation future SI nécessaire
    }
}
```

### Checklist YAGNI

Avant d'ajouter une fonctionnalité, demandez-vous:

- [ ] **Est-ce requis MAINTENANT?** (dans le ticket/user story actuel)
- [ ] **Est-ce testé?** (test existant qui échoue)
- [ ] **Est-ce dans le MVP?** (scope défini)
- [ ] **Le client l'a-t-il demandé explicitement?**

Si **NON** à l'une de ces questions → **YAGNI: Ne pas implémenter**

---

## Anti-patterns courants

### 1. Premature Optimization

#### ❌ MAUVAIS

```php
<?php

// ❌ Optimisation prématurée: cache complexe avant d'avoir un problème de perf
class ReservationRepository
{
    private array $cache = [];
    private array $cacheTimestamps = [];
    private const CACHE_TTL = 300;

    public function find(int $id): ?Reservation
    {
        // Cache multi-niveaux avant même de mesurer un problème
        if (isset($this->cache[$id])) {
            if (time() - $this->cacheTimestamps[$id] < self::CACHE_TTL) {
                return $this->cache[$id];
            }
        }

        // ...
    }
}
```

#### ✅ BON

```php
<?php

// ✅ Implémentation simple d'abord
class DoctrineReservationRepository
{
    public function find(ReservationId $id): ?Reservation
    {
        return $this->entityManager->find(Reservation::class, $id);
    }
}

// ✅ Cache ajouté SEULEMENT si profiling montre un problème
// Avec mesures concrètes (N+1 queries, temps de réponse > 200ms)
```

### 2. Gold Plating

#### ❌ MAUVAIS - Fonctionnalités non demandées

```php
<?php

// ❌ Fonctionnalités "cool" mais non requises
class ReservationNotifier
{
    // ❌ Support SMS (pas demandé)
    public function sendSmsConfirmation(Reservation $r): void { }

    // ❌ Support notifications push (pas demandé)
    public function sendPushNotification(Reservation $r): void { }

    // ❌ Support WhatsApp (pas demandé)
    public function sendWhatsAppMessage(Reservation $r): void { }

    // ✅ Seul email requis
    public function sendEmailConfirmation(Reservation $r): void { }
}
```

#### ✅ BON - Juste ce qui est nécessaire

```php
<?php

// ✅ Implémente uniquement email (requis)
final readonly class EmailNotificationService
{
    public function __construct(
        private MailerInterface $mailer,
    ) {}

    public function sendReservationConfirmation(ReservationId $id): void
    {
        // Implémentation email uniquement
    }
}

// ✅ Si SMS nécessaire plus tard: nouvelle classe
// final readonly class SmsNotificationService
```

### 3. Speculative Generality

#### ❌ MAUVAIS - Généricité excessive

```php
<?php

// ❌ Framework interne générique (on a Symfony!)
abstract class AbstractEntityManager
{
    abstract protected function getEntityClass(): string;

    public function findAll(): array
    {
        return $this->repository->findAll();
    }

    public function findById(int $id): ?object
    {
        return $this->repository->find($id);
    }

    // ... 50 méthodes génériques
}

// ❌ Utilisation forcée du framework maison
class ReservationManager extends AbstractEntityManager
{
    protected function getEntityClass(): string
    {
        return Reservation::class;
    }
}
```

#### ✅ BON - Utiliser Symfony/Doctrine directement

```php
<?php

// ✅ Utilise les outils Symfony sans abstraction inutile
final readonly class DoctrineReservationRepository implements ReservationRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function findById(ReservationId $id): Reservation
    {
        // Direct, simple, clair
        $reservation = $this->entityManager->find(Reservation::class, $id);

        if (!$reservation) {
            throw ReservationNotFoundException::withId($id);
        }

        return $reservation;
    }
}
```

### 4. Lasagna Code

#### ❌ MAUVAIS - Couches d'abstraction inutiles

```php
<?php

// ❌ Trop de couches pour une opération simple
interface ReservationFinderInterface { }

interface ReservationSearchInterface extends ReservationFinderInterface { }

interface ReservationQueryInterface extends ReservationSearchInterface { }

abstract class AbstractReservationFinder implements ReservationQueryInterface { }

class BaseReservationRepository extends AbstractReservationFinder { }

class DoctrineReservationRepository extends BaseReservationRepository { }

// Pour faire: $repo->find($id) 😱
```

#### ✅ BON - Couches justifiées uniquement

```php
<?php

// ✅ Architecture en couches DDD (justifiée)
// Domain: Interface
interface ReservationRepositoryInterface
{
    public function findById(ReservationId $id): Reservation;
}

// Infrastructure: Implémentation
final class DoctrineReservationRepository implements ReservationRepositoryInterface
{
    public function findById(ReservationId $id): Reservation
    {
        // Implémentation
    }
}

// ✅ 2 couches suffisent (contrat + implémentation)
```

---

## Checklist de validation

### Before chaque commit

#### KISS
- [ ] Méthodes < 20 lignes
- [ ] Complexité cyclomatique < 10
- [ ] Indentation max 3 niveaux
- [ ] Paramètres max 4 par méthode
- [ ] Pas de else imbriqués (early returns)
- [ ] Nommage explicite (pas de commentaires nécessaires)

#### DRY
- [ ] Pas de code dupliqué (> 3 lignes identiques)
- [ ] Validation centralisée (Value Objects)
- [ ] Règles métier en un seul endroit
- [ ] Pas de duplication de connaissance

#### YAGNI
- [ ] Fonctionnalité demandée explicitement
- [ ] Test qui échoue existe
- [ ] Dans le scope du ticket actuel
- [ ] Pas de code "au cas où"
- [ ] Pas d'abstraction prématurée

### Outils de validation

```bash
# Détection duplication (DRY)
vendor/bin/phpcpd src/

# Complexité (KISS)
vendor/bin/phpmetrics --report-html=metrics src/

# Code mort (YAGNI)
vendor/bin/phpstan analyse --level=max src/

# Méthodes longues
vendor/bin/phpmd src/ text cleancode,codesize

# Tout en un
make quality
```

### Métriques cibles

| Métrique | Cible | Limite |
|----------|-------|--------|
| Lignes par méthode | < 10 | < 20 |
| Complexité cyclomatique | < 5 | < 10 |
| Lignes par classe | < 150 | < 200 |
| Duplication | 0% | < 3% |
| Couverture tests | > 80% | > 70% |
| Dépendances par classe | < 5 | < 7 |

---

## Examples Atoll Tourisme

### Calcul de prix (KISS + DRY)

```php
<?php

namespace App\Domain\Reservation\Service;

// ✅ KISS: Service simple avec une responsabilité
// ✅ DRY: Délègue aux politiques (pas de duplication)
final readonly class ReservationPricingService
{
    /**
     * @param iterable<DiscountPolicyInterface> $discountPolicies
     */
    public function __construct(
        private ParticipantPricingCalculator $participantCalculator,
        private iterable $discountPolicies,
    ) {}

    public function calculateTotalPrice(Reservation $reservation): Money
    {
        $baseTotal = $this->participantCalculator->calculateTotal($reservation);

        return $this->applyDiscounts($baseTotal, $reservation);
    }

    private function applyDiscounts(Money $amount, Reservation $reservation): Money
    {
        foreach ($this->discountPolicies as $policy) {
            if ($policy->isApplicable($reservation)) {
                $amount = $policy->apply($amount, $reservation);
            }
        }

        return $amount;
    }
}
```

### Validation (DRY avec Value Objects)

```php
<?php

namespace App\Domain\Shared\ValueObject;

// ✅ DRY: Validation email centralisée
final readonly class Email
{
    private function __construct(
        private string $value,
    ) {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("Invalid email: {$value}");
        }
    }

    public static function fromString(string $email): self
    {
        return new self($email);
    }

    public function getValue(): string
    {
        return $this->value;
    }
}

// ✅ Utilisé partout: Entity, Form, API, etc.
// ✅ Une seule source de vérité pour la validation email
```

### Export (YAGNI)

```php
<?php

namespace App\Infrastructure\Reservation\Export;

// ✅ YAGNI: Uniquement CSV (besoin actuel)
// ✅ KISS: Implémentation simple et directe
final readonly class CsvReservationExporter
{
    public function export(array $reservations, string $filepath): void
    {
        $handle = fopen($filepath, 'w');

        fputcsv($handle, ['ID', 'Client', 'Séjour', 'Montant', 'Statut']);

        foreach ($reservations as $reservation) {
            fputcsv($handle, [
                (string) $reservation->getId(),
                $reservation->getClient()->getNom(),
                $reservation->getSejour()->getTitre(),
                $reservation->getMontantTotal()->getAmountEuros(),
                $reservation->getStatut()->value,
            ]);
        }

        fclose($handle);
    }
}

// ❌ PAS de: XmlExporter, JsonExporter, PdfExporter
// ✅ On les ajoutera SI nécessaire (YAGNI)
```

---

## Ressources

- **Livre:** *The Pragmatic Programmer* - Andy Hunt & Dave Thomas
- **Livre:** *Clean Code* - Robert C. Martin
- **Article:** [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- **Article:** [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- **Article:** [YAGNI](https://martinfowler.com/bliki/Yagni.html)

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
