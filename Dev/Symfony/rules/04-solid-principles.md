# Principes SOLID - Atoll Tourisme

## Vue d'ensemble

Les principes SOLID sont **obligatoires** pour tout le code PHP du projet Atoll Tourisme. Ces principes garantissent un code maintenable, testable et évolutif.

> **Références:**
> - `01-symfony-best-practices.md` - Structure et patterns Symfony
> - `02-architecture-clean-ddd.md` - Architecture globale
> - `03-coding-standards.md` - Standards de code
> - `13-ddd-patterns.md` - Patterns DDD complémentaires

---

## Table des matières

1. [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
2. [OCP - Open/Closed Principle](#ocp---openclosed-principle)
3. [LSP - Liskov Substitution Principle](#lsp---liskov-substitution-principle)
4. [ISP - Interface Segregation Principle](#isp---interface-segregation-principle)
5. [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
6. [Checklist de validation](#checklist-de-validation)

---

## SRP - Single Responsibility Principle

### Définition

**Une classe ne doit avoir qu'une seule raison de changer.**

Chaque classe, méthode ou module doit avoir une responsabilité unique et bien définie.

### Application dans Atoll Tourisme

#### ❌ MAUVAIS - Multiple responsabilités

```php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Mailer\MailerInterface;

#[ORM\Entity]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    private ?int $id = null;

    #[ORM\Column]
    private float $montantTotal = 0;

    // ❌ VIOLATION SRP: L'entité gère la logique métier ET l'envoi d'emails
    public function confirmer(MailerInterface $mailer): void
    {
        $this->statut = 'confirmee';

        // ❌ Responsabilité email dans l'entité
        $email = (new Email())
            ->to($this->client->email)
            ->subject('Confirmation de réservation')
            ->html('<p>Votre réservation est confirmée</p>');

        $mailer->send($email);
    }

    // ❌ VIOLATION SRP: Calcul métier dans l'entité
    public function calculerMontantTotal(): void
    {
        $total = 0;

        foreach ($this->participants as $participant) {
            $total += $this->sejour->getPrixUnitaire();

            // Remise famille nombreuse
            if (count($this->participants) >= 4) {
                $total *= 0.9;
            }

            // Supplément assurance annulation
            if ($participant->hasAssuranceAnnulation()) {
                $total += 50;
            }
        }

        $this->montantTotal = $total;
    }

    // ❌ VIOLATION SRP: Validation dans l'entité
    public function valider(): array
    {
        $errors = [];

        if (empty($this->participants)) {
            $errors[] = 'Au moins un participant requis';
        }

        if ($this->sejour->getDateDebut() < new \DateTimeImmutable()) {
            $errors[] = 'Séjour dans le passé';
        }

        return $errors;
    }
}
```

#### ✅ BON - Séparation des responsabilités

```php
<?php

// 1. ENTITÉ - Uniquement représentation des données
namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationStatus;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reservation
{
    #[ORM\Id]
    #[ORM\Column(type: 'reservation_id')]
    private ReservationId $id;

    #[ORM\Embedded(class: Money::class)]
    private Money $montantTotal;

    #[ORM\Column(type: 'reservation_status', enumType: ReservationStatus::class)]
    private ReservationStatus $statut;

    private function __construct(
        ReservationId $id,
        Money $montantTotal,
        ReservationStatus $statut
    ) {
        $this->id = $id;
        $this->montantTotal = $montantTotal;
        $this->statut = $statut;
    }

    public function confirmer(): void
    {
        $this->statut = ReservationStatus::CONFIRMEE;
    }

    public function getMontantTotal(): Money
    {
        return $this->montantTotal;
    }

    public function getStatut(): ReservationStatus
    {
        return $this->statut;
    }
}

// 2. SERVICE - Calcul du montant total
namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;

final readonly class ReservationPricingService
{
    public function __construct(
        private RemiseFamilleNombreusePolicy $remiseFamillePolicy,
        private AssuranceAnnulationPolicy $assurancePolicy,
    ) {}

    public function calculerMontantTotal(Reservation $reservation): Money
    {
        $total = Money::fromEuros(0);

        // Prix de base par participant
        foreach ($reservation->getParticipants() as $participant) {
            $total = $total->add($reservation->getSejour()->getPrixUnitaire());
        }

        // Application des politiques de prix
        $total = $this->remiseFamillePolicy->apply($total, $reservation);
        $total = $this->assurancePolicy->apply($total, $reservation);

        return $total;
    }
}

// 3. VALIDATOR - Validation métier
namespace App\Domain\Reservation\Validator;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Exception\InvalidReservationException;

final readonly class ReservationValidator
{
    public function validate(Reservation $reservation): void
    {
        if ($reservation->getParticipants()->isEmpty()) {
            throw InvalidReservationException::noParticipants();
        }

        if ($reservation->getSejour()->getDateDebut()->isPast()) {
            throw InvalidReservationException::sejourInPast();
        }
    }
}

// 4. EVENT HANDLER - Notification email
namespace App\Application\Reservation\EventHandler;

use App\Domain\Reservation\Event\ReservationConfirmedEvent;
use App\Infrastructure\Notification\ReservationNotifier;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final readonly class SendConfirmationEmailOnReservationConfirmed
{
    public function __construct(
        private ReservationNotifier $notifier,
    ) {}

    public function __invoke(ReservationConfirmedEvent $event): void
    {
        $this->notifier->sendConfirmationEmail($event->reservationId);
    }
}

// 5. USE CASE - Orchestration
namespace App\Application\Reservation\UseCase;

use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\Service\ReservationPricingService;
use App\Domain\Reservation\Validator\ReservationValidator;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class ConfirmerReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $repository,
        private ReservationPricingService $pricingService,
        private ReservationValidator $validator,
        private MessageBusInterface $eventBus,
    ) {}

    public function execute(ConfirmerReservationCommand $command): void
    {
        $reservation = $this->repository->findById($command->reservationId);

        // Validation
        $this->validator->validate($reservation);

        // Calcul du montant
        $montant = $this->pricingService->calculerMontantTotal($reservation);

        // Mise à jour
        $reservation->confirmer();
        $this->repository->save($reservation);

        // Événement
        $this->eventBus->dispatch(new ReservationConfirmedEvent($reservation->getId()));
    }
}
```

### Avantages SRP

- ✅ **Testabilité:** Chaque classe peut être testée isolément
- ✅ **Maintenabilité:** Les changements sont localisés
- ✅ **Réutilisabilité:** Les composants sont indépendants
- ✅ **Lisibilité:** Chaque classe a un objectif clair

---

## OCP - Open/Closed Principle

### Définition

**Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.**

On doit pouvoir ajouter de nouvelles fonctionnalités sans modifier le code existant.

### Application dans Atoll Tourisme

#### ❌ MAUVAIS - Modification du code existant

```php
<?php

namespace App\Service;

use App\Entity\Reservation;

class ReservationDiscountCalculator
{
    // ❌ VIOLATION OCP: Pour ajouter un nouveau type de remise,
    // il faut modifier cette classe
    public function calculateDiscount(Reservation $reservation): float
    {
        $discount = 0;

        // Remise famille nombreuse
        if (count($reservation->getParticipants()) >= 4) {
            $discount += $reservation->getMontantTotal() * 0.1;
        }

        // Remise anticipée
        $daysUntilTrip = $reservation->getSejour()
            ->getDateDebut()
            ->diff(new \DateTime())
            ->days;

        if ($daysUntilTrip > 90) {
            $discount += $reservation->getMontantTotal() * 0.05;
        }

        // ❌ Ajout d'une nouvelle remise = modification de cette méthode
        // Remise fidélité (ajouté plus tard)
        if ($reservation->getClient()->getNombreReservations() > 3) {
            $discount += $reservation->getMontantTotal() * 0.08;
        }

        return $discount;
    }
}
```

#### ✅ BON - Extension via interfaces et Strategy Pattern

```php
<?php

// 1. INTERFACE - Contrat stable
namespace App\Domain\Reservation\Pricing;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;

interface DiscountPolicyInterface
{
    public function apply(Money $amount, Reservation $reservation): Money;

    public function isApplicable(Reservation $reservation): bool;

    public function getPriority(): int;
}

// 2. IMPLÉMENTATION - Remise famille nombreuse
namespace App\Domain\Reservation\Pricing\Policy;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Pricing\DiscountPolicyInterface;
use App\Domain\Reservation\ValueObject\Money;

final readonly class RemiseFamilleNombreusePolicy implements DiscountPolicyInterface
{
    private const int MIN_PARTICIPANTS = 4;
    private const float DISCOUNT_RATE = 0.10;

    public function apply(Money $amount, Reservation $reservation): Money
    {
        if (!$this->isApplicable($reservation)) {
            return $amount;
        }

        return $amount->multiply(1 - self::DISCOUNT_RATE);
    }

    public function isApplicable(Reservation $reservation): bool
    {
        return count($reservation->getParticipants()) >= self::MIN_PARTICIPANTS;
    }

    public function getPriority(): int
    {
        return 100;
    }
}

// 3. IMPLÉMENTATION - Remise anticipée
namespace App\Domain\Reservation\Pricing\Policy;

final readonly class RemiseReservationAnticipeePolicy implements DiscountPolicyInterface
{
    private const int MIN_DAYS_ADVANCE = 90;
    private const float DISCOUNT_RATE = 0.05;

    public function apply(Money $amount, Reservation $reservation): Money
    {
        if (!$this->isApplicable($reservation)) {
            return $amount;
        }

        return $amount->multiply(1 - self::DISCOUNT_RATE);
    }

    public function isApplicable(Reservation $reservation): bool
    {
        $daysUntilTrip = $reservation->getSejour()
            ->getDateDebut()
            ->diff(new \DateTimeImmutable())
            ->days;

        return $daysUntilTrip > self::MIN_DAYS_ADVANCE;
    }

    public function getPriority(): int
    {
        return 200;
    }
}

// 4. NOUVELLE IMPLÉMENTATION - Extension sans modification
namespace App\Domain\Reservation\Pricing\Policy;

final readonly class RemiseFidelitePolicy implements DiscountPolicyInterface
{
    private const int MIN_RESERVATIONS = 3;
    private const float DISCOUNT_RATE = 0.08;

    public function apply(Money $amount, Reservation $reservation): Money
    {
        if (!$this->isApplicable($reservation)) {
            return $amount;
        }

        return $amount->multiply(1 - self::DISCOUNT_RATE);
    }

    public function isApplicable(Reservation $reservation): bool
    {
        return $reservation->getClient()->getNombreReservations() > self::MIN_RESERVATIONS;
    }

    public function getPriority(): int
    {
        return 150;
    }
}

// 5. ORCHESTRATEUR - Fermé à la modification
namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Pricing\DiscountPolicyInterface;
use App\Domain\Reservation\ValueObject\Money;

final readonly class ReservationPricingService
{
    /**
     * @param iterable<DiscountPolicyInterface> $discountPolicies
     */
    public function __construct(
        private iterable $discountPolicies,
    ) {}

    public function calculerMontantTotal(Reservation $reservation): Money
    {
        $amount = $this->calculateBasePrice($reservation);

        // Application des politiques de remise par ordre de priorité
        $policies = $this->sortPoliciesByPriority($this->discountPolicies);

        foreach ($policies as $policy) {
            if ($policy->isApplicable($reservation)) {
                $amount = $policy->apply($amount, $reservation);
            }
        }

        return $amount;
    }

    private function calculateBasePrice(Reservation $reservation): Money
    {
        $total = Money::fromEuros(0);

        foreach ($reservation->getParticipants() as $participant) {
            $total = $total->add($reservation->getSejour()->getPrixUnitaire());
        }

        return $total;
    }

    /**
     * @param iterable<DiscountPolicyInterface> $policies
     * @return array<DiscountPolicyInterface>
     */
    private function sortPoliciesByPriority(iterable $policies): array
    {
        $sorted = iterator_to_array($policies);

        usort($sorted, fn($a, $b) => $b->getPriority() <=> $a->getPriority());

        return $sorted;
    }
}

// 6. CONFIGURATION - Injection des politiques
// config/services.yaml
namespace Symfony\Component\DependencyInjection\Loader\Configurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    // Auto-tagging de toutes les politiques
    $services->instanceof(DiscountPolicyInterface::class)
        ->tag('app.discount_policy');

    // Injection des politiques dans le service
    $services->set(ReservationPricingService::class)
        ->args([
            tagged_iterator('app.discount_policy'),
        ]);
};
```

### Avantages OCP

- ✅ **Extension facile:** Nouvelles fonctionnalités = nouvelles classes
- ✅ **Stabilité:** Le code existant n'est pas modifié
- ✅ **Tests:** Pas de régression sur le code existant
- ✅ **Évolutivité:** Ajout de fonctionnalités sans risque

---

## LSP - Liskov Substitution Principle

### Définition

**Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer la cohérence du programme.**

Les sous-types doivent être substituables à leurs types de base.

### Application dans Atoll Tourisme

#### ❌ MAUVAIS - Violation du contrat

```php
<?php

namespace App\Service;

use App\Entity\Sejour;

abstract class SejourPricingStrategy
{
    /**
     * Calcule le prix unitaire d'un séjour
     * @return float Prix en euros (toujours positif)
     */
    abstract public function calculatePrice(Sejour $sejour): float;
}

class StandardSejourPricing extends SejourPricingStrategy
{
    public function calculatePrice(Sejour $sejour): float
    {
        return $sejour->getPrixBase();
    }
}

// ❌ VIOLATION LSP: Change le contrat (peut retourner 0 ou négatif)
class PromoSejourPricing extends SejourPricingStrategy
{
    public function calculatePrice(Sejour $sejour): float
    {
        $price = $sejour->getPrixBase();

        // ❌ Peut retourner 0 alors que le contrat dit "toujours positif"
        if ($sejour->isPromoGratuite()) {
            return 0;
        }

        // ❌ Peut lancer une exception non documentée
        if ($sejour->getDateDebut() < new \DateTime()) {
            throw new \RuntimeException('Séjour passé');
        }

        return $price * 0.8;
    }
}

// ❌ VIOLATION LSP: Refuse certains paramètres valides
class WeekendSejourPricing extends SejourPricingStrategy
{
    public function calculatePrice(Sejour $sejour): float
    {
        // ❌ Précondition plus forte que la classe de base
        if ($sejour->getDureeJours() !== 2) {
            throw new \InvalidArgumentException('Uniquement pour les weekends (2 jours)');
        }

        return $sejour->getPrixBase() * 1.2;
    }
}
```

#### ✅ BON - Respect du contrat

```php
<?php

// 1. INTERFACE - Contrat clair et documenté
namespace App\Domain\Sejour\Pricing;

use App\Domain\Sejour\Entity\Sejour;
use App\Domain\Sejour\ValueObject\Money;
use App\Domain\Sejour\Exception\PricingException;

/**
 * Stratégie de calcul du prix d'un séjour
 */
interface SejourPricingStrategyInterface
{
    /**
     * Calcule le prix unitaire d'un séjour
     *
     * @param Sejour $sejour Le séjour à pricer
     * @return Money Le prix calculé (toujours > 0€)
     * @throws PricingException Si le calcul est impossible
     *
     * Préconditions:
     * - Le séjour doit être valide (dates cohérentes, prix base > 0)
     *
     * Postconditions:
     * - Le prix retourné est strictement positif
     * - Aucun effet de bord sur le séjour
     */
    public function calculatePrice(Sejour $sejour): Money;

    /**
     * Vérifie si cette stratégie est applicable au séjour
     *
     * @param Sejour $sejour Le séjour à vérifier
     * @return bool True si la stratégie peut être appliquée
     */
    public function supports(Sejour $sejour): bool;
}

// 2. IMPLÉMENTATION - Prix standard (respecte le contrat)
namespace App\Domain\Sejour\Pricing\Strategy;

use App\Domain\Sejour\Entity\Sejour;
use App\Domain\Sejour\Pricing\SejourPricingStrategyInterface;
use App\Domain\Sejour\ValueObject\Money;

final readonly class StandardSejourPricingStrategy implements SejourPricingStrategyInterface
{
    public function calculatePrice(Sejour $sejour): Money
    {
        // ✅ Retourne toujours un Money positif
        return $sejour->getPrixBase();
    }

    public function supports(Sejour $sejour): bool
    {
        // ✅ Supporte tous les séjours valides
        return true;
    }
}

// 3. IMPLÉMENTATION - Prix promo (respecte le contrat)
namespace App\Domain\Sejour\Pricing\Strategy;

use App\Domain\Sejour\Entity\Sejour;
use App\Domain\Sejour\Pricing\SejourPricingStrategyInterface;
use App\Domain\Sejour\ValueObject\Money;

final readonly class PromoSejourPricingStrategy implements SejourPricingStrategyInterface
{
    private const float MIN_DISCOUNT_RATE = 0.20;
    private const float MAX_DISCOUNT_RATE = 0.80;

    public function calculatePrice(Sejour $sejour): Money
    {
        $basePrice = $sejour->getPrixBase();
        $discountRate = $this->calculateDiscountRate($sejour);

        // ✅ Garantit un prix toujours > 0 (max 80% de remise)
        return $basePrice->multiply(1 - $discountRate);
    }

    public function supports(Sejour $sejour): bool
    {
        // ✅ Vérifie explicitement l'applicabilité
        return $sejour->hasActivePromotion()
            && !$sejour->getDateDebut()->isPast();
    }

    private function calculateDiscountRate(Sejour $sejour): float
    {
        $rate = $sejour->getPromotion()?->getDiscountRate() ?? 0;

        // ✅ Borne la remise pour garantir prix > 0
        return max(self::MIN_DISCOUNT_RATE, min($rate, self::MAX_DISCOUNT_RATE));
    }
}

// 4. IMPLÉMENTATION - Prix weekend (respecte le contrat)
namespace App\Domain\Sejour\Pricing\Strategy;

final readonly class WeekendSejourPricingStrategy implements SejourPricingStrategyInterface
{
    private const int WEEKEND_DURATION = 2;
    private const float WEEKEND_MULTIPLIER = 1.2;

    public function calculatePrice(Sejour $sejour): Money
    {
        // ✅ Pas de précondition plus forte - vérifié dans supports()
        $basePrice = $sejour->getPrixBase();

        // ✅ Retourne toujours un prix positif
        return $basePrice->multiply(self::WEEKEND_MULTIPLIER);
    }

    public function supports(Sejour $sejour): bool
    {
        // ✅ Les conditions spécifiques sont dans supports(), pas dans calculatePrice()
        return $sejour->getDureeJours() === self::WEEKEND_DURATION
            && $sejour->isWeekend();
    }
}

// 5. ORCHESTRATEUR - Utilise la substitution LSP
namespace App\Domain\Sejour\Service;

use App\Domain\Sejour\Entity\Sejour;
use App\Domain\Sejour\Pricing\SejourPricingStrategyInterface;
use App\Domain\Sejour\ValueObject\Money;

final readonly class SejourPricingService
{
    /**
     * @param iterable<SejourPricingStrategyInterface> $strategies
     */
    public function __construct(
        private iterable $strategies,
        private SejourPricingStrategyInterface $defaultStrategy,
    ) {}

    public function calculatePrice(Sejour $sejour): Money
    {
        // ✅ Toutes les stratégies sont substituables
        foreach ($this->strategies as $strategy) {
            if ($strategy->supports($sejour)) {
                return $strategy->calculatePrice($sejour);
            }
        }

        // Fallback sur la stratégie par défaut
        return $this->defaultStrategy->calculatePrice($sejour);
    }
}

// 6. VALUE OBJECT - Money garantit la positivité
namespace App\Domain\Sejour\ValueObject;

final readonly class Money
{
    private function __construct(
        private int $amountCents,
        private string $currency = 'EUR',
    ) {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }
    }

    public static function fromEuros(float $amount): self
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        return new self((int) round($amount * 100));
    }

    public function multiply(float $multiplier): self
    {
        if ($multiplier < 0) {
            throw new \InvalidArgumentException('Multiplier cannot be negative');
        }

        return new self((int) round($this->amountCents * $multiplier));
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }
}
```

### Avantages LSP

- ✅ **Polymorphisme sûr:** Les substitutions fonctionnent toujours
- ✅ **Contrats clairs:** Interfaces bien documentées
- ✅ **Prévisibilité:** Pas de surprises avec les sous-types
- ✅ **Testabilité:** Les mocks respectent les contrats

---

## ISP - Interface Segregation Principle

### Définition

**Les clients ne doivent pas dépendre d'interfaces qu'ils n'utilisent pas.**

Il vaut mieux plusieurs interfaces spécifiques qu'une interface générale.

### Application dans Atoll Tourisme

#### ❌ MAUVAIS - Interface trop large

```php
<?php

namespace App\Repository;

use App\Entity\Reservation;

// ❌ VIOLATION ISP: Interface trop large avec trop de responsabilités
interface ReservationRepositoryInterface
{
    // Opérations CRUD basiques
    public function find(int $id): ?Reservation;
    public function findAll(): array;
    public function save(Reservation $reservation): void;
    public function delete(Reservation $reservation): void;

    // Recherches avancées
    public function findByClient(int $clientId): array;
    public function findBySejour(int $sejourId): array;
    public function findByDateRange(\DateTime $start, \DateTime $end): array;
    public function findByStatut(string $statut): array;

    // Statistiques
    public function countByMonth(int $year, int $month): int;
    public function getTotalRevenue(int $year): float;
    public function getAverageReservationAmount(): float;

    // Exports
    public function exportToCsv(string $filename): void;
    public function exportToPdf(string $filename): void;

    // Notifications
    public function findReservationsNeedingConfirmation(): array;
    public function findReservationsExpiringSoon(): array;

    // Cache
    public function clearCache(): void;
    public function warmUpCache(): void;
}

// ❌ Les clients doivent implémenter TOUTE l'interface même s'ils n'utilisent qu'une partie
class SimpleReservationRepository implements ReservationRepositoryInterface
{
    // ❌ Doit implémenter des méthodes inutiles
    public function exportToCsv(string $filename): void
    {
        throw new \BadMethodCallException('Not supported');
    }

    public function exportToPdf(string $filename): void
    {
        throw new \BadMethodCallException('Not supported');
    }

    public function warmUpCache(): void
    {
        // Vide - pas de cache
    }

    // ... etc
}
```

#### ✅ BON - Interfaces ségrégées

```php
<?php

// 1. INTERFACE - Lecture basique
namespace App\Domain\Reservation\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\ReservationId;

interface ReservationFinderInterface
{
    /**
     * @throws ReservationNotFoundException
     */
    public function findById(ReservationId $id): Reservation;

    /**
     * @return array<Reservation>
     */
    public function findAll(): array;
}

// 2. INTERFACE - Écriture
namespace App\Domain\Reservation\Repository;

interface ReservationPersisterInterface
{
    public function save(Reservation $reservation): void;

    public function delete(Reservation $reservation): void;
}

// 3. INTERFACE - Recherches métier
namespace App\Domain\Reservation\Repository;

use App\Domain\Client\ValueObject\ClientId;
use App\Domain\Sejour\ValueObject\SejourId;
use App\Domain\Reservation\ValueObject\DateRange;
use App\Domain\Reservation\ValueObject\ReservationStatus;

interface ReservationSearchInterface
{
    /**
     * @return array<Reservation>
     */
    public function findByClient(ClientId $clientId): array;

    /**
     * @return array<Reservation>
     */
    public function findBySejour(SejourId $sejourId): array;

    /**
     * @return array<Reservation>
     */
    public function findByDateRange(DateRange $dateRange): array;

    /**
     * @return array<Reservation>
     */
    public function findByStatut(ReservationStatus $statut): array;
}

// 4. INTERFACE - Statistiques
namespace App\Domain\Reservation\Repository;

use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\YearMonth;

interface ReservationStatisticsInterface
{
    public function countByMonth(YearMonth $month): int;

    public function getTotalRevenue(int $year): Money;

    public function getAverageReservationAmount(): Money;
}

// 5. INTERFACE - Export
namespace App\Infrastructure\Reservation\Export;

use App\Domain\Reservation\Entity\Reservation;

interface ReservationExporterInterface
{
    /**
     * @param array<Reservation> $reservations
     */
    public function export(array $reservations, string $filename): void;

    public function getSupportedFormat(): string;
}

// 6. INTERFACE - Requêtes pour notifications
namespace App\Domain\Reservation\Repository;

interface ReservationNotificationQueryInterface
{
    /**
     * Trouve les réservations en attente de confirmation depuis plus de 48h
     *
     * @return array<Reservation>
     */
    public function findPendingConfirmation(): array;

    /**
     * Trouve les réservations expirant dans les 7 jours
     *
     * @return array<Reservation>
     */
    public function findExpiringSoon(): array;
}

// 7. IMPLÉMENTATION - Compose les interfaces nécessaires
namespace App\Infrastructure\Reservation\Repository;

use App\Domain\Reservation\Repository\ReservationFinderInterface;
use App\Domain\Reservation\Repository\ReservationPersisterInterface;
use App\Domain\Reservation\Repository\ReservationSearchInterface;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineReservationRepository implements
    ReservationFinderInterface,
    ReservationPersisterInterface,
    ReservationSearchInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    // Implémente uniquement les méthodes nécessaires
    public function findById(ReservationId $id): Reservation
    {
        $reservation = $this->entityManager->find(Reservation::class, $id);

        if (!$reservation) {
            throw ReservationNotFoundException::withId($id);
        }

        return $reservation;
    }

    public function save(Reservation $reservation): void
    {
        $this->entityManager->persist($reservation);
        $this->entityManager->flush();
    }

    // ... autres méthodes
}

// 8. IMPLÉMENTATION - Service statistiques séparé
namespace App\Infrastructure\Reservation\Repository;

use App\Domain\Reservation\Repository\ReservationStatisticsInterface;
use Doctrine\DBAL\Connection;

final readonly class DoctrineReservationStatistics implements ReservationStatisticsInterface
{
    public function __construct(
        private Connection $connection,
    ) {}

    public function countByMonth(YearMonth $month): int
    {
        $sql = <<<SQL
            SELECT COUNT(*)
            FROM reservation
            WHERE EXTRACT(YEAR FROM created_at) = :year
              AND EXTRACT(MONTH FROM created_at) = :month
        SQL;

        return (int) $this->connection->fetchOne($sql, [
            'year' => $month->getYear(),
            'month' => $month->getMonth(),
        ]);
    }

    // ... autres méthodes statistiques
}

// 9. USAGE - Les use cases ne dépendent que de ce dont ils ont besoin
namespace App\Application\Reservation\UseCase;

use App\Domain\Reservation\Repository\ReservationFinderInterface;
use App\Domain\Reservation\Repository\ReservationPersisterInterface;

final readonly class ConfirmerReservationUseCase
{
    // ✅ Dépend uniquement de Finder et Persister
    public function __construct(
        private ReservationFinderInterface $finder,
        private ReservationPersisterInterface $persister,
    ) {}

    public function execute(ConfirmerReservationCommand $command): void
    {
        $reservation = $this->finder->findById($command->reservationId);
        $reservation->confirmer();
        $this->persister->save($reservation);
    }
}

namespace App\Application\Reservation\Query;

use App\Domain\Reservation\Repository\ReservationStatisticsInterface;

final readonly class GetMonthlyStatisticsQuery
{
    // ✅ Dépend uniquement de Statistics
    public function __construct(
        private ReservationStatisticsInterface $statistics,
    ) {}

    public function execute(int $year, int $month): array
    {
        $yearMonth = YearMonth::fromIntegers($year, $month);

        return [
            'count' => $this->statistics->countByMonth($yearMonth),
            'revenue' => $this->statistics->getTotalRevenue($year),
        ];
    }
}
```

### Avantages ISP

- ✅ **Couplage faible:** Les clients dépendent du minimum nécessaire
- ✅ **Flexibilité:** Implémentations partielles possibles
- ✅ **Testabilité:** Mocks plus simples (moins de méthodes)
- ✅ **Évolutivité:** Ajout d'interfaces sans impacter l'existant

---

## DIP - Dependency Inversion Principle

### Définition

**Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.**

**Les abstractions ne doivent pas dépendre des détails. Les détails doivent dépendre des abstractions.**

### Application dans Atoll Tourisme

#### ❌ MAUVAIS - Dépendance directe aux implémentations

```php
<?php

namespace App\Service;

use App\Repository\DoctrineReservationRepository;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport\Smtp\SmtpTransport;
use Psr\Log\Logger;

// ❌ VIOLATION DIP: Dépend d'implémentations concrètes
class ReservationService
{
    private DoctrineReservationRepository $repository;
    private Mailer $mailer;
    private Logger $logger;

    public function __construct()
    {
        // ❌ Instanciation directe des dépendances
        $this->repository = new DoctrineReservationRepository();

        // ❌ Dépendance à une implémentation SMTP spécifique
        $transport = new SmtpTransport('smtp.example.com');
        $this->mailer = new Mailer($transport);

        // ❌ Dépendance à une implémentation concrète
        $this->logger = new Logger('reservation');
    }

    public function confirmer(int $reservationId): void
    {
        // ❌ Couplage fort avec Doctrine
        $reservation = $this->repository->findByIdUsingDoctrine($reservationId);

        $reservation->setStatut('confirmee');

        // ❌ Couplage fort avec l'envoi SMTP
        $this->mailer->sendEmailViaSmtp($reservation->getClient()->getEmail());

        // ❌ Couplage fort avec le logger
        $this->logger->logToFile('Reservation confirmed: ' . $reservationId);
    }
}
```

#### ✅ BON - Dépendance aux abstractions

```php
<?php

// 1. COUCHE DOMAINE - Interfaces (abstractions)
namespace App\Domain\Reservation\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\ReservationId;

interface ReservationRepositoryInterface
{
    public function findById(ReservationId $id): Reservation;

    public function save(Reservation $reservation): void;
}

namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\ValueObject\ReservationId;

interface NotificationServiceInterface
{
    public function notifyReservationConfirmed(ReservationId $reservationId): void;
}

// 2. COUCHE APPLICATION - Use Case dépend des abstractions
namespace App\Application\Reservation\UseCase;

use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\Service\NotificationServiceInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Psr\Log\LoggerInterface;

final readonly class ConfirmerReservationUseCase
{
    // ✅ Dépend des INTERFACES (abstractions), pas des implémentations
    public function __construct(
        private ReservationRepositoryInterface $repository,
        private NotificationServiceInterface $notificationService,
        private LoggerInterface $logger,
    ) {}

    public function execute(ConfirmerReservationCommand $command): void
    {
        // ✅ Utilise le contrat, pas l'implémentation
        $reservation = $this->repository->findById($command->reservationId);

        $reservation->confirmer();

        // ✅ Sauvegarde via l'interface
        $this->repository->save($reservation);

        // ✅ Notification via l'interface
        $this->notificationService->notifyReservationConfirmed($reservation->getId());

        // ✅ Log via l'interface PSR-3
        $this->logger->info('Reservation confirmed', [
            'reservation_id' => (string) $reservation->getId(),
        ]);
    }
}

// 3. COUCHE INFRASTRUCTURE - Implémentations des abstractions
namespace App\Infrastructure\Reservation\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Doctrine\ORM\EntityManagerInterface;

// ✅ L'infrastructure IMPLÉMENTE les interfaces du domaine
final readonly class DoctrineReservationRepository implements ReservationRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function findById(ReservationId $id): Reservation
    {
        $reservation = $this->entityManager->find(Reservation::class, $id);

        if (!$reservation) {
            throw ReservationNotFoundException::withId($id);
        }

        return $reservation;
    }

    public function save(Reservation $reservation): void
    {
        $this->entityManager->persist($reservation);
        $this->entityManager->flush();
    }
}

namespace App\Infrastructure\Notification;

use App\Domain\Reservation\Service\NotificationServiceInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Messenger\MessageBusInterface;

// ✅ L'infrastructure IMPLÉMENTE les interfaces du domaine
final readonly class EmailNotificationService implements NotificationServiceInterface
{
    public function __construct(
        private MessageBusInterface $messageBus,
        // ✅ Utilise l'interface Symfony, pas une implémentation concrète
        private MailerInterface $mailer,
    ) {}

    public function notifyReservationConfirmed(ReservationId $reservationId): void
    {
        // Délègue à un message asynchrone
        $this->messageBus->dispatch(
            new SendReservationConfirmationEmail($reservationId)
        );
    }
}

// 4. CONFIGURATION - Injection de dépendances
// config/services.yaml
namespace Symfony\Component\DependencyInjection\Loader\Configurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    // ✅ Bind les interfaces aux implémentations
    $services->set(DoctrineReservationRepository::class);

    $services->alias(
        ReservationRepositoryInterface::class,
        DoctrineReservationRepository::class
    );

    $services->set(EmailNotificationService::class);

    $services->alias(
        NotificationServiceInterface::class,
        EmailNotificationService::class
    );

    // ✅ Le use case reçoit les implémentations automatiquement
    $services->set(ConfirmerReservationUseCase::class)
        ->autowire();
};

// 5. TESTS - Facilité grâce aux abstractions
namespace App\Tests\Application\Reservation\UseCase;

use App\Application\Reservation\UseCase\ConfirmerReservationUseCase;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\Service\NotificationServiceInterface;
use PHPUnit\Framework\TestCase;

final class ConfirmerReservationUseCaseTest extends TestCase
{
    public function testExecute(): void
    {
        // ✅ Mocks basés sur les interfaces
        $repository = $this->createMock(ReservationRepositoryInterface::class);
        $notificationService = $this->createMock(NotificationServiceInterface::class);
        $logger = $this->createMock(LoggerInterface::class);

        // ✅ Injection facile pour les tests
        $useCase = new ConfirmerReservationUseCase(
            $repository,
            $notificationService,
            $logger
        );

        // Test...
    }
}

// 6. ALTERNATIVE - Repository en mémoire pour les tests
namespace App\Tests\Infrastructure\Reservation\Repository;

use App\Domain\Reservation\Repository\ReservationRepositoryInterface;

// ✅ Implémentation alternative pour les tests (même interface)
final class InMemoryReservationRepository implements ReservationRepositoryInterface
{
    /** @var array<string, Reservation> */
    private array $reservations = [];

    public function findById(ReservationId $id): Reservation
    {
        $key = (string) $id;

        if (!isset($this->reservations[$key])) {
            throw ReservationNotFoundException::withId($id);
        }

        return $this->reservations[$key];
    }

    public function save(Reservation $reservation): void
    {
        $this->reservations[(string) $reservation->getId()] = $reservation;
    }
}
```

### Architecture en couches (DIP)

```
┌─────────────────────────────────────────────────────┐
│           COUCHE PRÉSENTATION (UI)                  │
│   Controllers, Commands, API, Forms                 │
│                       │                              │
│                       ▼                              │
├─────────────────────────────────────────────────────┤
│         COUCHE APPLICATION (Use Cases)              │
│   ConfirmerReservationUseCase                       │
│   AnnulerReservationUseCase                         │
│                       │                              │
│           Dépend de   ▼   (Interfaces)              │
├─────────────────────────────────────────────────────┤
│            COUCHE DOMAINE (Business)                │
│   ReservationRepositoryInterface                    │
│   NotificationServiceInterface                      │
│   Entities, Value Objects, Domain Services          │
│                       ▲                              │
│           Implémenté par (Inversion)                │
├─────────────────────────────────────────────────────┤
│       COUCHE INFRASTRUCTURE (Technique)             │
│   DoctrineReservationRepository                     │
│   EmailNotificationService                          │
│   Doctrine, Mailer, Redis, etc.                     │
└─────────────────────────────────────────────────────┘

✅ Les couches hautes dépendent d'abstractions
✅ Les couches basses implémentent ces abstractions
✅ La logique métier est isolée des détails techniques
```

### Avantages DIP

- ✅ **Testabilité:** Mocks et stubs faciles à créer
- ✅ **Flexibilité:** Changement d'implémentation sans impact
- ✅ **Isolation:** La logique métier ne dépend pas de l'infrastructure
- ✅ **Réutilisabilité:** Les abstractions sont réutilisables

---

## Checklist de validation

### Avant chaque commit

- [ ] **SRP:** Chaque classe a une seule responsabilité clairement définie
- [ ] **SRP:** Les méthodes font une seule chose (< 20 lignes)
- [ ] **SRP:** Pas de méthodes avec "et" ou "ou" dans le nom
- [ ] **OCP:** Nouvelles fonctionnalités ajoutées par extension, pas modification
- [ ] **OCP:** Utilisation d'interfaces et de patterns Strategy/Chain of Responsibility
- [ ] **OCP:** Pas de switch/if sur des types pour déterminer le comportement
- [ ] **LSP:** Les sous-types respectent les contrats de leurs parents
- [ ] **LSP:** Pas de préconditions renforcées dans les sous-classes
- [ ] **LSP:** Pas de postconditions affaiblies dans les sous-classes
- [ ] **LSP:** Pas d'exceptions nouvelles non documentées
- [ ] **ISP:** Les interfaces sont petites et focalisées (< 5 méthodes)
- [ ] **ISP:** Les clients ne dépendent que des méthodes qu'ils utilisent
- [ ] **ISP:** Pas de méthodes "throw new BadMethodCallException()"
- [ ] **DIP:** Les use cases dépendent d'interfaces, pas d'implémentations
- [ ] **DIP:** Les interfaces sont dans le domaine, pas l'infrastructure
- [ ] **DIP:** Injection de dépendances via constructeur (readonly)

### PHPStan validation

```bash
# Vérification SOLID via PHPStan
make phpstan

# Doit passer sans erreur:
# - No unused parameters (SRP)
# - No mixed types (DIP)
# - No violations of interface contracts (LSP)
```

### Code review

- [ ] Les abstractions sont dans `src/Domain/`
- [ ] Les implémentations sont dans `src/Infrastructure/`
- [ ] Les use cases sont dans `src/Application/`
- [ ] Chaque interface a au moins 2 implémentations (réelle + test)
- [ ] Les Value Objects sont immutables et garantissent leurs invariants
- [ ] Les services domaine n'ont pas de dépendances techniques
- [ ] Les entités n'ont pas de logique de persistance

### Tests

```php
// Test SRP: Une classe = un test facile
final class ReservationPricingServiceTest extends TestCase
{
    // ✅ Test focalisé sur UNE responsabilité
    public function testCalculerMontantTotal(): void
    {
        // Arrange
        $service = new ReservationPricingService(
            new RemiseFamilleNombreusePolicy(),
        );

        // Act
        $montant = $service->calculerMontantTotal($reservation);

        // Assert
        self::assertEquals(Money::fromEuros(900), $montant);
    }
}

// Test DIP: Injection de mocks
final class ConfirmerReservationUseCaseTest extends TestCase
{
    public function testExecute(): void
    {
        // ✅ Dépend d'interfaces = mocking facile
        $repository = $this->createMock(ReservationRepositoryInterface::class);
        $notifier = $this->createMock(NotificationServiceInterface::class);

        $useCase = new ConfirmerReservationUseCase($repository, $notifier);

        // Test...
    }
}
```

---

## Métriques et outils

### PHPStan - Niveau max

```yaml
# phpstan.neon
parameters:
    level: max

    # Détection violations SOLID
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true

    # ISP: Détecte les interfaces trop larges
    reportUnmatchedIgnoredErrors: true
```

### Deptrac - Architecture boundaries

```yaml
# deptrac.yaml
deptrac:
    layers:
        - name: Domain
          collectors:
              - type: directory
                value: src/Domain/.*

        - name: Application
          collectors:
              - type: directory
                value: src/Application/.*

        - name: Infrastructure
          collectors:
              - type: directory
                value: src/Infrastructure/.*

    ruleset:
        # DIP: Application dépend de Domain, pas Infrastructure
        Application:
            - Domain

        # DIP: Infrastructure dépend de Domain
        Infrastructure:
            - Domain

        # DIP: Domain ne dépend de rien
        Domain: []
```

### Rector - Refactoring automatique

```php
// rector.php
use Rector\Config\RectorConfig;
use Rector\SOLID\Rector\Class_\FinalizeClassesWithoutChildrenRector;

return RectorConfig::configure()
    ->withRules([
        // SRP: Finalise les classes sans enfants
        FinalizeClassesWithoutChildrenRector::class,
    ]);
```

---

## Ressources

- **Livre:** *Clean Architecture* - Robert C. Martin
- **Livre:** *SOLID Principles* - Uncle Bob
- **Article:** [SOLID in Symfony](https://symfony.com/doc/current/best_practices.html)
- **Vidéo:** [SOLID Principles Explained](https://www.youtube.com/watch?v=pTB30aXS77U)

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
