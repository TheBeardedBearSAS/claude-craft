# SOLID-Prinzipien - Atoll Tourisme

## Überblick

Die SOLID-Prinzipien sind **obligatorisch** für den gesamten PHP-Code des Projekts Atoll Tourisme. Diese Prinzipien gewährleisten wartbaren, testbaren und erweiterbaren Code.

> **Referenzen:**
> - `01-symfony-best-practices.md` - Struktur und Symfony-Patterns
> - `02-architecture-clean-ddd.md` - Gesamtarchitektur
> - `03-coding-standards.md` - Code-Standards
> - `13-ddd-patterns.md` - Ergänzende DDD-Patterns

---

## Inhaltsverzeichnis

1. [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
2. [OCP - Open/Closed Principle](#ocp---openclosed-principle)
3. [LSP - Liskov Substitution Principle](#lsp---liskov-substitution-principle)
4. [ISP - Interface Segregation Principle](#isp---interface-segregation-principle)
5. [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
6. [Validierungs-Checkliste](#validierungs-checkliste)

---

## SRP - Single Responsibility Principle

### Definition

**Eine Klasse sollte nur einen einzigen Grund zur Änderung haben.**

Jede Klasse, Methode oder Modul sollte eine einzige, klar definierte Verantwortung haben.

### Anwendung in Atoll Tourisme

#### ❌ SCHLECHT - Mehrere Verantwortlichkeiten

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

    // ❌ SRP-VERLETZUNG: Entity verwaltet Geschäftslogik UND E-Mail-Versand
    public function confirmer(MailerInterface $mailer): void
    {
        $this->statut = 'confirmee';

        // ❌ E-Mail-Verantwortung in der Entity
        $email = (new Email())
            ->to($this->client->email)
            ->subject('Confirmation de réservation')
            ->html('<p>Votre réservation est confirmée</p>');

        $mailer->send($email);
    }

    // ❌ SRP-VERLETZUNG: Geschäftsberechnung in der Entity
    public function calculerMontantTotal(): void
    {
        $total = 0;

        foreach ($this->participants as $participant) {
            $total += $this->sejour->getPrixUnitaire();

            // Familienrabatt
            if (count($this->participants) >= 4) {
                $total *= 0.9;
            }

            // Stornoschutz-Zuschlag
            if ($participant->hasAssuranceAnnulation()) {
                $total += 50;
            }
        }

        $this->montantTotal = $total;
    }

    // ❌ SRP-VERLETZUNG: Validierung in der Entity
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

#### ✅ GUT - Trennung der Verantwortlichkeiten

```php
<?php

// 1. ENTITY - Nur Datendarstellung
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

// 2. SERVICE - Gesamtpreisberechnung
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

        // Basispreis pro Teilnehmer
        foreach ($reservation->getParticipants() as $participant) {
            $total = $total->add($reservation->getSejour()->getPrixUnitaire());
        }

        // Anwendung der Preisrichtlinien
        $total = $this->remiseFamillePolicy->apply($total, $reservation);
        $total = $this->assurancePolicy->apply($total, $reservation);

        return $total;
    }
}

// 3. VALIDATOR - Geschäftsvalidierung
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

// 4. EVENT HANDLER - E-Mail-Benachrichtigung
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

// 5. USE CASE - Orchestrierung
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

        // Validierung
        $this->validator->validate($reservation);

        // Betragsberechnung
        $montant = $this->pricingService->calculerMontantTotal($reservation);

        // Aktualisierung
        $reservation->confirmer();
        $this->repository->save($reservation);

        // Event
        $this->eventBus->dispatch(new ReservationConfirmedEvent($reservation->getId()));
    }
}
```

### SRP-Vorteile

- ✅ **Testbarkeit:** Jede Klasse kann isoliert getestet werden
- ✅ **Wartbarkeit:** Änderungen sind lokalisiert
- ✅ **Wiederverwendbarkeit:** Komponenten sind unabhängig
- ✅ **Lesbarkeit:** Jede Klasse hat ein klares Ziel

---

## OCP - Open/Closed Principle

### Definition

**Software-Entitäten sollten offen für Erweiterungen, aber geschlossen für Änderungen sein.**

Man sollte neue Funktionalitäten hinzufügen können, ohne bestehenden Code zu ändern.

### Anwendung in Atoll Tourisme

#### ❌ SCHLECHT - Änderung von bestehendem Code

```php
<?php

namespace App\Service;

use App\Entity\Reservation;

class ReservationDiscountCalculator
{
    // ❌ OCP-VERLETZUNG: Für neue Rabattart muss diese Klasse geändert werden
    public function calculateDiscount(Reservation $reservation): float
    {
        $discount = 0;

        // Familienrabatt
        if (count($reservation->getParticipants()) >= 4) {
            $discount += $reservation->getMontantTotal() * 0.1;
        }

        // Frühbucherrabatt
        $daysUntilTrip = $reservation->getSejour()
            ->getDateDebut()
            ->diff(new \DateTime())
            ->days;

        if ($daysUntilTrip > 90) {
            $discount += $reservation->getMontantTotal() * 0.05;
        }

        // ❌ Hinzufügen eines neuen Rabatts = Änderung dieser Methode
        // Treuerabatt (später hinzugefügt)
        if ($reservation->getClient()->getNombreReservations() > 3) {
            $discount += $reservation->getMontantTotal() * 0.08;
        }

        return $discount;
    }
}
```

#### ✅ GUT - Erweiterung durch Interfaces und Strategy Pattern

```php
<?php

// 1. INTERFACE - Stabiler Vertrag
namespace App\Domain\Reservation\Pricing;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;

interface DiscountPolicyInterface
{
    public function apply(Money $amount, Reservation $reservation): Money;

    public function isApplicable(Reservation $reservation): bool;

    public function getPriority(): int;
}

// 2. IMPLEMENTIERUNG - Familienrabatt
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

// 3. IMPLEMENTIERUNG - Frühbucherrabatt
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

// 4. NEUE IMPLEMENTIERUNG - Erweiterung ohne Änderung
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

// 5. ORCHESTRATOR - Geschlossen für Änderungen
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

        // Anwendung der Rabattrichtlinien nach Priorität
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

// 6. KONFIGURATION - Injection der Richtlinien
// config/services.yaml
namespace Symfony\Component\DependencyInjection\Loader\Configurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    // Auto-Tagging aller Richtlinien
    $services->instanceof(DiscountPolicyInterface::class)
        ->tag('app.discount_policy');

    // Injection der Richtlinien in den Service
    $services->set(ReservationPricingService::class)
        ->args([
            tagged_iterator('app.discount_policy'),
        ]);
};
```

### OCP-Vorteile

- ✅ **Einfache Erweiterung:** Neue Funktionalitäten = neue Klassen
- ✅ **Stabilität:** Bestehender Code wird nicht geändert
- ✅ **Tests:** Keine Regression bei bestehendem Code
- ✅ **Skalierbarkeit:** Hinzufügen von Funktionalitäten ohne Risiko

---

## LSP - Liskov Substitution Principle

### Definition

**Objekte einer abgeleiteten Klasse müssen Objekte der Basisklasse ersetzen können, ohne die Kohärenz des Programms zu beeinträchtigen.**

Subtypen müssen durch ihre Basistypen ersetzbar sein.

### Anwendung in Atoll Tourisme

#### ❌ SCHLECHT - Verletzung des Vertrags

```php
<?php

namespace App\Service;

use App\Entity\Sejour;

abstract class SejourPricingStrategy
{
    /**
     * Berechnet den Einzelpreis eines Aufenthalts
     * @return float Preis in Euro (immer positiv)
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

// ❌ LSP-VERLETZUNG: Ändert den Vertrag (kann 0 oder negativ zurückgeben)
class PromoSejourPricing extends SejourPricingStrategy
{
    public function calculatePrice(Sejour $sejour): float
    {
        $price = $sejour->getPrixBase();

        // ❌ Kann 0 zurückgeben, obwohl der Vertrag "immer positiv" sagt
        if ($sejour->isPromoGratuite()) {
            return 0;
        }

        // ❌ Kann eine nicht dokumentierte Exception werfen
        if ($sejour->getDateDebut() < new \DateTime()) {
            throw new \RuntimeException('Séjour passé');
        }

        return $price * 0.8;
    }
}

// ❌ LSP-VERLETZUNG: Lehnt bestimmte gültige Parameter ab
class WeekendSejourPricing extends SejourPricingStrategy
{
    public function calculatePrice(Sejour $sejour): float
    {
        // ❌ Stärkere Vorbedingung als die Basisklasse
        if ($sejour->getDureeJours() !== 2) {
            throw new \InvalidArgumentException('Uniquement pour les weekends (2 jours)');
        }

        return $sejour->getPrixBase() * 1.2;
    }
}
```

#### ✅ GUT - Respektierung des Vertrags

```php
<?php

// 1. INTERFACE - Klarer und dokumentierter Vertrag
namespace App\Domain\Sejour\Pricing;

use App\Domain\Sejour\Entity\Sejour;
use App\Domain\Sejour\ValueObject\Money;
use App\Domain\Sejour\Exception\PricingException;

/**
 * Strategie zur Berechnung des Aufenthaltspreises
 */
interface SejourPricingStrategyInterface
{
    /**
     * Berechnet den Einzelpreis eines Aufenthalts
     *
     * @param Sejour $sejour Der zu bepreisende Aufenthalt
     * @return Money Der berechnete Preis (immer > 0€)
     * @throws PricingException Wenn die Berechnung nicht möglich ist
     *
     * Vorbedingungen:
     * - Der Aufenthalt muss gültig sein (kohärente Daten, Basispreis > 0)
     *
     * Nachbedingungen:
     * - Der zurückgegebene Preis ist strikt positiv
     * - Keine Seiteneffekte auf den Aufenthalt
     */
    public function calculatePrice(Sejour $sejour): Money;

    /**
     * Prüft, ob diese Strategie auf den Aufenthalt anwendbar ist
     *
     * @param Sejour $sejour Der zu prüfende Aufenthalt
     * @return bool True, wenn die Strategie angewendet werden kann
     */
    public function supports(Sejour $sejour): bool;
}

// 2. IMPLEMENTIERUNG - Standardpreis (respektiert den Vertrag)
namespace App\Domain\Sejour\Pricing\Strategy;

use App\Domain\Sejour\Entity\Sejour;
use App\Domain\Sejour\Pricing\SejourPricingStrategyInterface;
use App\Domain\Sejour\ValueObject\Money;

final readonly class StandardSejourPricingStrategy implements SejourPricingStrategyInterface
{
    public function calculatePrice(Sejour $sejour): Money
    {
        // ✅ Gibt immer einen positiven Money zurück
        return $sejour->getPrixBase();
    }

    public function supports(Sejour $sejour): bool
    {
        // ✅ Unterstützt alle gültigen Aufenthalte
        return true;
    }
}

// 3. IMPLEMENTIERUNG - Aktionspreis (respektiert den Vertrag)
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

        // ✅ Garantiert einen Preis immer > 0 (max. 80% Rabatt)
        return $basePrice->multiply(1 - $discountRate);
    }

    public function supports(Sejour $sejour): bool
    {
        // ✅ Prüft explizit die Anwendbarkeit
        return $sejour->hasActivePromotion()
            && !$sejour->getDateDebut()->isPast();
    }

    private function calculateDiscountRate(Sejour $sejour): float
    {
        $rate = $sejour->getPromotion()?->getDiscountRate() ?? 0;

        // ✅ Begrenzt den Rabatt, um Preis > 0 zu garantieren
        return max(self::MIN_DISCOUNT_RATE, min($rate, self::MAX_DISCOUNT_RATE));
    }
}

// 4. IMPLEMENTIERUNG - Wochenendpreis (respektiert den Vertrag)
namespace App\Domain\Sejour\Pricing\Strategy;

final readonly class WeekendSejourPricingStrategy implements SejourPricingStrategyInterface
{
    private const int WEEKEND_DURATION = 2;
    private const float WEEKEND_MULTIPLIER = 1.2;

    public function calculatePrice(Sejour $sejour): Money
    {
        // ✅ Keine stärkere Vorbedingung - geprüft in supports()
        $basePrice = $sejour->getPrixBase();

        // ✅ Gibt immer einen positiven Preis zurück
        return $basePrice->multiply(self::WEEKEND_MULTIPLIER);
    }

    public function supports(Sejour $sejour): bool
    {
        // ✅ Die spezifischen Bedingungen sind in supports(), nicht in calculatePrice()
        return $sejour->getDureeJours() === self::WEEKEND_DURATION
            && $sejour->isWeekend();
    }
}

// 5. ORCHESTRATOR - Verwendet LSP-Substitution
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
        // ✅ Alle Strategien sind ersetzbar
        foreach ($this->strategies as $strategy) {
            if ($strategy->supports($sejour)) {
                return $strategy->calculatePrice($sejour);
            }
        }

        // Fallback auf die Standardstrategie
        return $this->defaultStrategy->calculatePrice($sejour);
    }
}

// 6. VALUE OBJECT - Money garantiert Positivität
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

### LSP-Vorteile

- ✅ **Sicherer Polymorphismus:** Substitutionen funktionieren immer
- ✅ **Klare Verträge:** Gut dokumentierte Interfaces
- ✅ **Vorhersehbarkeit:** Keine Überraschungen mit Subtypen
- ✅ **Testbarkeit:** Mocks respektieren Verträge

---

## ISP - Interface Segregation Principle

### Definition

**Clients sollten nicht von Interfaces abhängen, die sie nicht verwenden.**

Mehrere spezifische Interfaces sind besser als ein allgemeines Interface.

### Anwendung in Atoll Tourisme

#### ❌ SCHLECHT - Zu breites Interface

```php
<?php

namespace App\Repository;

use App\Entity\Reservation;

// ❌ ISP-VERLETZUNG: Zu breites Interface mit zu vielen Verantwortlichkeiten
interface ReservationRepositoryInterface
{
    // Basis-CRUD-Operationen
    public function find(int $id): ?Reservation;
    public function findAll(): array;
    public function save(Reservation $reservation): void;
    public function delete(Reservation $reservation): void;

    // Erweiterte Suchen
    public function findByClient(int $clientId): array;
    public function findBySejour(int $sejourId): array;
    public function findByDateRange(\DateTime $start, \DateTime $end): array;
    public function findByStatut(string $statut): array;

    // Statistiken
    public function countByMonth(int $year, int $month): int;
    public function getTotalRevenue(int $year): float;
    public function getAverageReservationAmount(): float;

    // Exporte
    public function exportToCsv(string $filename): void;
    public function exportToPdf(string $filename): void;

    // Benachrichtigungen
    public function findReservationsNeedingConfirmation(): array;
    public function findReservationsExpiringSoon(): array;

    // Cache
    public function clearCache(): void;
    public function warmUpCache(): void;
}

// ❌ Clients müssen das GESAMTE Interface implementieren, auch wenn sie nur einen Teil verwenden
class SimpleReservationRepository implements ReservationRepositoryInterface
{
    // ❌ Muss unnötige Methoden implementieren
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
        // Leer - kein Cache
    }

    // ... etc
}
```

#### ✅ GUT - Segregierte Interfaces

```php
<?php

// 1. INTERFACE - Basis-Leseoperationen
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

// 2. INTERFACE - Schreiboperationen
namespace App\Domain\Reservation\Repository;

interface ReservationPersisterInterface
{
    public function save(Reservation $reservation): void;

    public function delete(Reservation $reservation): void;
}

// 3. INTERFACE - Geschäftssuchen
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

// 4. INTERFACE - Statistiken
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

// 6. INTERFACE - Abfragen für Benachrichtigungen
namespace App\Domain\Reservation\Repository;

interface ReservationNotificationQueryInterface
{
    /**
     * Findet Reservierungen, die seit mehr als 48 Stunden auf Bestätigung warten
     *
     * @return array<Reservation>
     */
    public function findPendingConfirmation(): array;

    /**
     * Findet Reservierungen, die in 7 Tagen ablaufen
     *
     * @return array<Reservation>
     */
    public function findExpiringSoon(): array;
}

// 7. IMPLEMENTIERUNG - Kombiniert die notwendigen Interfaces
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

    // Implementiert nur die notwendigen Methoden
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

    // ... andere Methoden
}

// 8. IMPLEMENTIERUNG - Separater Statistik-Service
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

    // ... andere statistische Methoden
}

// 9. VERWENDUNG - Use Cases hängen nur von dem ab, was sie benötigen
namespace App\Application\Reservation\UseCase;

use App\Domain\Reservation\Repository\ReservationFinderInterface;
use App\Domain\Reservation\Repository\ReservationPersisterInterface;

final readonly class ConfirmerReservationUseCase
{
    // ✅ Hängt nur von Finder und Persister ab
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
    // ✅ Hängt nur von Statistics ab
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

### ISP-Vorteile

- ✅ **Lose Kopplung:** Clients hängen vom notwendigen Minimum ab
- ✅ **Flexibilität:** Teilweise Implementierungen möglich
- ✅ **Testbarkeit:** Einfachere Mocks (weniger Methoden)
- ✅ **Skalierbarkeit:** Hinzufügen von Interfaces ohne Auswirkungen auf Bestehendes

---

## DIP - Dependency Inversion Principle

### Definition

**Module hoher Ebene sollten nicht von Modulen niedriger Ebene abhängen. Beide sollten von Abstraktionen abhängen.**

**Abstraktionen sollten nicht von Details abhängen. Details sollten von Abstraktionen abhängen.**

### Anwendung in Atoll Tourisme

#### ❌ SCHLECHT - Direkte Abhängigkeit von Implementierungen

```php
<?php

namespace App\Service;

use App\Repository\DoctrineReservationRepository;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport\Smtp\SmtpTransport;
use Psr\Log\Logger;

// ❌ DIP-VERLETZUNG: Abhängig von konkreten Implementierungen
class ReservationService
{
    private DoctrineReservationRepository $repository;
    private Mailer $mailer;
    private Logger $logger;

    public function __construct()
    {
        // ❌ Direkte Instanziierung der Abhängigkeiten
        $this->repository = new DoctrineReservationRepository();

        // ❌ Abhängigkeit von einer spezifischen SMTP-Implementierung
        $transport = new SmtpTransport('smtp.example.com');
        $this->mailer = new Mailer($transport);

        // ❌ Abhängigkeit von einer konkreten Implementierung
        $this->logger = new Logger('reservation');
    }

    public function confirmer(int $reservationId): void
    {
        // ❌ Starke Kopplung mit Doctrine
        $reservation = $this->repository->findByIdUsingDoctrine($reservationId);

        $reservation->setStatut('confirmee');

        // ❌ Starke Kopplung mit SMTP-Versand
        $this->mailer->sendEmailViaSmtp($reservation->getClient()->getEmail());

        // ❌ Starke Kopplung mit dem Logger
        $this->logger->logToFile('Reservation confirmed: ' . $reservationId);
    }
}
```

#### ✅ GUT - Abhängigkeit von Abstraktionen

```php
<?php

// 1. DOMÄNEN-SCHICHT - Interfaces (Abstraktionen)
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

// 2. ANWENDUNGS-SCHICHT - Use Case hängt von Abstraktionen ab
namespace App\Application\Reservation\UseCase;

use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\Service\NotificationServiceInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Psr\Log\LoggerInterface;

final readonly class ConfirmerReservationUseCase
{
    // ✅ Hängt von INTERFACES (Abstraktionen) ab, nicht von Implementierungen
    public function __construct(
        private ReservationRepositoryInterface $repository,
        private NotificationServiceInterface $notificationService,
        private LoggerInterface $logger,
    ) {}

    public function execute(ConfirmerReservationCommand $command): void
    {
        // ✅ Verwendet den Vertrag, nicht die Implementierung
        $reservation = $this->repository->findById($command->reservationId);

        $reservation->confirmer();

        // ✅ Speicherung über das Interface
        $this->repository->save($reservation);

        // ✅ Benachrichtigung über das Interface
        $this->notificationService->notifyReservationConfirmed($reservation->getId());

        // ✅ Logging über das PSR-3 Interface
        $this->logger->info('Reservation confirmed', [
            'reservation_id' => (string) $reservation->getId(),
        ]);
    }
}

// 3. INFRASTRUKTUR-SCHICHT - Implementierungen der Abstraktionen
namespace App\Infrastructure\Reservation\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Doctrine\ORM\EntityManagerInterface;

// ✅ Die Infrastruktur IMPLEMENTIERT die Domänen-Interfaces
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

// ✅ Die Infrastruktur IMPLEMENTIERT die Domänen-Interfaces
final readonly class EmailNotificationService implements NotificationServiceInterface
{
    public function __construct(
        private MessageBusInterface $messageBus,
        // ✅ Verwendet das Symfony-Interface, nicht eine konkrete Implementierung
        private MailerInterface $mailer,
    ) {}

    public function notifyReservationConfirmed(ReservationId $reservationId): void
    {
        // Delegiert an eine asynchrone Nachricht
        $this->messageBus->dispatch(
            new SendReservationConfirmationEmail($reservationId)
        );
    }
}

// 4. KONFIGURATION - Dependency Injection
// config/services.yaml
namespace Symfony\Component\DependencyInjection\Loader\Configurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    // ✅ Bindet Interfaces an Implementierungen
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

    // ✅ Der Use Case erhält die Implementierungen automatisch
    $services->set(ConfirmerReservationUseCase::class)
        ->autowire();
};

// 5. TESTS - Einfach dank Abstraktionen
namespace App\Tests\Application\Reservation\UseCase;

use App\Application\Reservation\UseCase\ConfirmerReservationUseCase;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\Service\NotificationServiceInterface;
use PHPUnit\Framework\TestCase;

final class ConfirmerReservationUseCaseTest extends TestCase
{
    public function testExecute(): void
    {
        // ✅ Mocks basierend auf Interfaces
        $repository = $this->createMock(ReservationRepositoryInterface::class);
        $notificationService = $this->createMock(NotificationServiceInterface::class);
        $logger = $this->createMock(LoggerInterface::class);

        // ✅ Einfache Injection für Tests
        $useCase = new ConfirmerReservationUseCase(
            $repository,
            $notificationService,
            $logger
        );

        // Test...
    }
}

// 6. ALTERNATIVE - In-Memory-Repository für Tests
namespace App\Tests\Infrastructure\Reservation\Repository;

use App\Domain\Reservation\Repository\ReservationRepositoryInterface;

// ✅ Alternative Implementierung für Tests (gleiches Interface)
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

### Schichtenarchitektur (DIP)

```
┌─────────────────────────────────────────────────────┐
│        PRÄSENTATIONS-SCHICHT (UI)                   │
│   Controllers, Commands, API, Forms                 │
│                       │                              │
│                       ▼                              │
├─────────────────────────────────────────────────────┤
│      ANWENDUNGS-SCHICHT (Use Cases)                 │
│   ConfirmerReservationUseCase                       │
│   AnnulerReservationUseCase                         │
│                       │                              │
│       Hängt ab von    ▼   (Interfaces)              │
├─────────────────────────────────────────────────────┤
│         DOMÄNEN-SCHICHT (Business)                  │
│   ReservationRepositoryInterface                    │
│   NotificationServiceInterface                      │
│   Entities, Value Objects, Domain Services          │
│                       ▲                              │
│      Implementiert von (Inversion)                  │
├─────────────────────────────────────────────────────┤
│     INFRASTRUKTUR-SCHICHT (Technisch)               │
│   DoctrineReservationRepository                     │
│   EmailNotificationService                          │
│   Doctrine, Mailer, Redis, etc.                     │
└─────────────────────────────────────────────────────┘

✅ Höhere Schichten hängen von Abstraktionen ab
✅ Niedrigere Schichten implementieren diese Abstraktionen
✅ Die Geschäftslogik ist von technischen Details isoliert
```

### DIP-Vorteile

- ✅ **Testbarkeit:** Mocks und Stubs sind einfach zu erstellen
- ✅ **Flexibilität:** Änderung der Implementierung ohne Auswirkungen
- ✅ **Isolation:** Die Geschäftslogik hängt nicht von der Infrastruktur ab
- ✅ **Wiederverwendbarkeit:** Die Abstraktionen sind wiederverwendbar

---

## Validierungs-Checkliste

### Vor jedem Commit

- [ ] **SRP:** Jede Klasse hat eine einzige klar definierte Verantwortung
- [ ] **SRP:** Methoden tun eine einzige Sache (< 20 Zeilen)
- [ ] **SRP:** Keine Methoden mit "und" oder "oder" im Namen
- [ ] **OCP:** Neue Funktionalitäten durch Erweiterung hinzugefügt, nicht durch Änderung
- [ ] **OCP:** Verwendung von Interfaces und Strategy/Chain of Responsibility-Patterns
- [ ] **OCP:** Keine switch/if auf Typen zur Bestimmung des Verhaltens
- [ ] **LSP:** Subtypen respektieren die Verträge ihrer Eltern
- [ ] **LSP:** Keine verschärften Vorbedingungen in Subklassen
- [ ] **LSP:** Keine geschwächten Nachbedingungen in Subklassen
- [ ] **LSP:** Keine neuen nicht dokumentierten Exceptions
- [ ] **ISP:** Interfaces sind klein und fokussiert (< 5 Methoden)
- [ ] **ISP:** Clients hängen nur von den Methoden ab, die sie verwenden
- [ ] **ISP:** Keine Methoden "throw new BadMethodCallException()"
- [ ] **DIP:** Use Cases hängen von Interfaces ab, nicht von Implementierungen
- [ ] **DIP:** Interfaces sind in der Domäne, nicht in der Infrastruktur
- [ ] **DIP:** Dependency Injection über Konstruktor (readonly)

### PHPStan-Validierung

```bash
# SOLID-Überprüfung mit PHPStan
make phpstan

# Muss ohne Fehler durchlaufen:
# - No unused parameters (SRP)
# - No mixed types (DIP)
# - No violations of interface contracts (LSP)
```

### Code Review

- [ ] Abstraktionen sind in `src/Domain/`
- [ ] Implementierungen sind in `src/Infrastructure/`
- [ ] Use Cases sind in `src/Application/`
- [ ] Jedes Interface hat mindestens 2 Implementierungen (real + Test)
- [ ] Value Objects sind unveränderlich und garantieren ihre Invarianten
- [ ] Domänen-Services haben keine technischen Abhängigkeiten
- [ ] Entities haben keine Persistenz-Logik

### Tests

```php
// Test SRP: Eine Klasse = ein einfacher Test
final class ReservationPricingServiceTest extends TestCase
{
    // ✅ Test konzentriert auf EINE Verantwortung
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

// Test DIP: Injection von Mocks
final class ConfirmerReservationUseCaseTest extends TestCase
{
    public function testExecute(): void
    {
        // ✅ Hängt von Interfaces ab = einfaches Mocking
        $repository = $this->createMock(ReservationRepositoryInterface::class);
        $notifier = $this->createMock(NotificationServiceInterface::class);

        $useCase = new ConfirmerReservationUseCase($repository, $notifier);

        // Test...
    }
}
```

---

## Metriken und Tools

### PHPStan - Maximales Level

```yaml
# phpstan.neon
parameters:
    level: max

    # Erkennung von SOLID-Verletzungen
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true

    # ISP: Erkennt zu breite Interfaces
    reportUnmatchedIgnoredErrors: true
```

### Deptrac - Architekturgrenzen

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
        # DIP: Application hängt von Domain ab, nicht von Infrastructure
        Application:
            - Domain

        # DIP: Infrastructure hängt von Domain ab
        Infrastructure:
            - Domain

        # DIP: Domain hängt von nichts ab
        Domain: []
```

### Rector - Automatisches Refactoring

```php
// rector.php
use Rector\Config\RectorConfig;
use Rector\SOLID\Rector\Class_\FinalizeClassesWithoutChildrenRector;

return RectorConfig::configure()
    ->withRules([
        // SRP: Finalisiert Klassen ohne Kinder
        FinalizeClassesWithoutChildrenRector::class,
    ]);
```

---

## Ressourcen

- **Buch:** *Clean Architecture* - Robert C. Martin
- **Buch:** *SOLID Principles* - Uncle Bob
- **Artikel:** [SOLID in Symfony](https://symfony.com/doc/current/best_practices.html)
- **Video:** [SOLID Principles Explained](https://www.youtube.com/watch?v=pTB30aXS77U)

---

**Datum der letzten Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
