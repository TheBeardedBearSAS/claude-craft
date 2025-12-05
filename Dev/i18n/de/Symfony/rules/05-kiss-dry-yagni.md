# KISS, DRY, YAGNI Prinzipien - Atoll Tourisme

## Überblick

Die Prinzipien **KISS** (Keep It Simple, Stupid), **DRY** (Don't Repeat Yourself) und **YAGNI** (You Aren't Gonna Need It) sind **obligatorisch**, um einen einfachen, wartbaren und entwicklungsfähigen Code zu gewährleisten.

> **Referenzen:**
> - `04-solid-principles.md` - Ergänzende SOLID-Prinzipien
> - `03-coding-standards.md` - Code-Standards
> - `07-testing-tdd-bdd.md` - Tests und Einfachheit
> - `02-architecture-clean-ddd.md` - Einfache Architektur

---

## Inhaltsverzeichnis

1. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Häufige Anti-Patterns](#häufige-anti-patterns)
5. [Validierungs-Checkliste](#validierungs-checkliste)

---

## KISS - Keep It Simple, Stupid

### Definition

**Einfachheit sollte ein Hauptziel des Designs sein. Komplexität muss vermieden werden.**

Der einfachste Code ist oft der beste Code.

### KISS-Regeln für Atoll Tourisme

1. **Kurze Methoden:** Maximal 20 Zeilen pro Methode
2. **Zyklomatische Komplexität:** Maximal 10 pro Methode
3. **Verschachtelungstiefe:** Maximal 3 Ebenen
4. **Parameter:** Maximal 4 Parameter pro Methode
5. **Klassen:** Maximal 200 Zeilen pro Klasse

### Anwendung

#### ❌ SCHLECHT - Komplexer Code

```php
<?php

namespace App\Service;

use App\Entity\Reservation;

class ReservationPriceCalculator
{
    // ❌ KISS-VERLETZUNG: Methode zu lang (50+ Zeilen), verschachtelte Logik
    public function calculateTotalPrice(Reservation $reservation): float
    {
        $total = 0;
        $participants = $reservation->getParticipants();
        $sejour = $reservation->getSejour();

        // Basisberechnung
        foreach ($participants as $participant) {
            $basePrice = $sejour->getPrixBase();

            // Altersbasierte Preisgestaltung
            $age = $participant->getAge();
            if ($age < 3) {
                $basePrice = 0;
            } elseif ($age >= 3 && $age < 12) {
                $basePrice = $basePrice * 0.5;
            } elseif ($age >= 12 && $age < 18) {
                $basePrice = $basePrice * 0.75;
            }

            // Einzelzimmerzuschlag
            if ($participant->wantsSingleRoom()) {
                if ($sejour->getDuree() <= 7) {
                    $basePrice += 50;
                } else {
                    $basePrice += 100;
                }
            }

            $total += $basePrice;
        }

        // Rabatte
        $nbParticipants = count($participants);
        if ($nbParticipants >= 2 && $nbParticipants < 4) {
            $total = $total * 0.95;
        } elseif ($nbParticipants >= 4 && $nbParticipants < 6) {
            $total = $total * 0.90;
        } elseif ($nbParticipants >= 6) {
            $total = $total * 0.85;
        }

        // Frühbucherrabatt
        $daysUntilTrip = $sejour->getDateDebut()->diff(new \DateTime())->days;
        if ($daysUntilTrip > 90) {
            $total = $total * 0.95;
        } elseif ($daysUntilTrip > 60) {
            $total = $total * 0.97;
        }

        // Treuerabatt
        $client = $reservation->getClient();
        $previousReservations = $client->getReservations()->count();
        if ($previousReservations >= 5) {
            $total = $total * 0.90;
        } elseif ($previousReservations >= 3) {
            $total = $total * 0.95;
        }

        // Reiserücktrittsversicherung
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

#### ✅ GUT - Einfacher und zerlegter Code

```php
<?php

// 1. VALUE OBJECT - Einfache Kapselung
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

// 2. POLICY - Eine einfache Verantwortung
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

// 3. POLICY - Isolierte und einfache Logik
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

// 4. SERVICE - Einfache Orchestrierung
namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;

final readonly class ReservationPricingService
{
    public function __construct(
        private ParticipantPricingCalculator $participantCalculator,
        private DiscountCalculator $discountCalculator,
    ) {}

    // ✅ Kurze Methode (< 10 Zeilen)
    public function calculateTotalPrice(Reservation $reservation): Money
    {
        $baseTotal = $this->participantCalculator->calculateTotal($reservation);
        $withDiscounts = $this->discountCalculator->applyDiscounts($baseTotal, $reservation);

        return $withDiscounts;
    }
}

// 5. CALCULATOR - Fokussierte Logik
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

    // ✅ Einfache und lesbare Methode
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

### KISS-Metriken

```bash
# Zyklomatische Komplexität (max 10)
vendor/bin/phpmetrics --report-violations=phpmetrics.xml src/

# Zeilen pro Methode (max 20)
vendor/bin/phpmd src/ text cleancode

# PHPStan maximales Level
vendor/bin/phpstan analyse -l max src/
```

### Einfachheitsregeln

1. **Ein return pro Methode** (außer frühe Returns für Validierung)
2. **Kein else** wenn möglich (frühe Returns, Guard-Klauseln)
3. **Explizite Benennung** (keine Kommentare nötig)
4. **Komposition > Vererbung**
5. **Standardmäßig Unveränderlichkeit** (readonly)

#### ✅ GUT - Frühe Returns

```php
public function calculateDiscount(Reservation $reservation): Money
{
    // ✅ Guard-Klauseln = keine verschachtelten else
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

### Definition

**Jedes Wissen muss eine einzige, eindeutige und maßgebliche Darstellung im System haben.**

Duplizieren Sie nicht die Geschäftslogik, Validierungsregeln oder Algorithmen.

### Arten der Duplizierung

1. **Logik-Duplizierung** ❌ Gleicher Code an mehreren Stellen
2. **Wissens-Duplizierung** ❌ Gleiche Geschäftsregeln neu definiert
3. **Strukturelle Duplizierung** ❌ Gleiche Muster wiederholt
4. **Dokumentations-Duplizierung** ❌ Gleiche Informationen in mehreren Formaten

### Anwendung

#### ❌ SCHLECHT - Validierungsduplizierung

```php
<?php

namespace App\Controller;

class ReservationController
{
    public function create(Request $request): Response
    {
        $data = $request->request->all();

        // ❌ DRY-VERLETZUNG: Duplizierte Validierung
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
        // ❌ DUPLIZIERUNG: Gleiche Validierungsregeln
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
    // ❌ DUPLIZIERUNG: Wieder die gleichen Regeln
    #[Assert\Email(message: 'Email invalide')]
    private string $email;

    #[Assert\Regex(pattern: '/^[0-9]{10}$/')]
    private string $telephone;
}
```

#### ✅ GUT - Zentralisierte Validierung

```php
<?php

// 1. VALUE OBJECT - Einzige Quelle der Wahrheit
namespace App\Domain\Shared\ValueObject;

final readonly class Email
{
    private function __construct(
        private string $value,
    ) {
        // ✅ Validierung an EINER STELLE
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

// 2. VALUE OBJECT - Telefon
namespace App\Domain\Shared\ValueObject;

final readonly class PhoneNumber
{
    private const string PATTERN = '/^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/';

    private function __construct(
        private string $value,
    ) {
        // ✅ Zentralisierte Validierung
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

// 3. ENTITY - Verwendet Value Objects
namespace App\Domain\Reservation\Entity;

use App\Domain\Shared\ValueObject\Email;
use App\Domain\Shared\ValueObject\PhoneNumber;

class Reservation
{
    // ✅ Keine Duplizierung - delegiert an VOs
    private Email $email;
    private PhoneNumber $telephone;

    public function __construct(Email $email, PhoneNumber $telephone)
    {
        $this->email = $email;
        $this->telephone = $telephone;
    }
}
```

### DRY vs WET (Write Everything Twice)

#### ⚠️ Warnung: Akzeptable Duplizierung

```php
<?php

// ✅ OK: Strukturduplizierung, keine Logik
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
    // ✅ OK: Gleiche Struktur aber verschiedene Typen (Type Safety)
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

### Regel der 3

> **Nicht abstrahieren, bevor das Muster 3 Mal gesehen wurde.**

```php
// ❌ Vorzeitige Abstraktion (1 Mal gesehen)
abstract class AbstractIdValueObject
{
    // Zu früh zum Abstrahieren
}

// ✅ Warten Sie auf 3 ähnliche Vorkommen vor dem Extrahieren
// Nach 3-4 ähnlichen IDs → Trait oder Basisklasse erstellen
```

---

## YAGNI - You Aren't Gonna Need It

### Definition

**Implementieren Sie keine Funktionalität, solange sie nicht benötigt wird.**

Codieren Sie nicht für hypothetische zukünftige Anforderungen.

### Anwendung

#### ❌ SCHLECHT - Over-Engineering

```php
<?php

namespace App\Service;

// ❌ YAGNI-VERLETZUNG: Nicht erforderliche Funktionen
class ReservationService
{
    // ❌ Multi-Währungsunterstützung (nicht in den Spezifikationen)
    public function calculatePriceInCurrency(
        Reservation $reservation,
        string $targetCurrency
    ): float {
        // Umrechnung EUR -> USD, GBP, JPY, etc.
        // YAGNI: Wir arbeiten nur mit EUR
    }

    // ❌ Unterstützung wiederkehrender Reservierungen (nicht angefordert)
    public function createRecurringReservation(
        Reservation $template,
        string $frequency, // daily, weekly, monthly
        int $occurrences
    ): array {
        // YAGNI: Keine wiederkehrenden Reservierungen bei Atoll Tourisme
    }

    // ❌ Export in 10 verschiedene Formate (nur CSV angefordert)
    public function export(
        array $reservations,
        string $format // csv, xml, json, yaml, pdf, xlsx, ods...
    ): string {
        // YAGNI: Nur CSV ist derzeit erforderlich
    }

    // ❌ Komplexes Treuepunktsystem (nicht im MVP)
    public function calculateLoyaltyPoints(Reservation $reservation): int
    {
        // YAGNI: Kein geplantes Treueprogramm
    }

    // ❌ Komplexe Zustandsmaschine (aktuelle Stati genügen)
    public function transitionToState(
        Reservation $reservation,
        string $targetState,
        array $context = []
    ): void {
        // YAGNI: Die 4 einfachen Stati genügen (en_attente, confirmee, annulee, terminee)
    }
}
```

#### ✅ GUT - Minimale funktionale Implementierung

```php
<?php

// 1. SERVICE - Nur was jetzt benötigt wird
namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;

final readonly class ReservationPricingService
{
    public function __construct(
        private iterable $pricingPolicies,
    ) {}

    // ✅ Nur Berechnung in EUR (aktueller Bedarf)
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

// 2. EXPORT - Nur CSV (jetzt erforderlich)
namespace App\Infrastructure\Reservation\Export;

use App\Domain\Reservation\Entity\Reservation;

final readonly class CsvReservationExporter
{
    // ✅ Implementiert NUR das erforderliche Format
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

// 3. STATUS - Einfaches Enum (aktueller Bedarf)
namespace App\Domain\Reservation\ValueObject;

// ✅ Nur die 4 erforderlichen Stati
enum ReservationStatus: string
{
    case EN_ATTENTE = 'en_attente';
    case CONFIRMEE = 'confirmee';
    case ANNULEE = 'annulee';
    case TERMINEE = 'terminee';
}

// ❌ KEINE komplexe Zustandsmaschine solange nicht erforderlich
// ❌ KEIN Symfony Workflow solange nicht erforderlich
```

### YAGNI vs Zukünftige Erweiterung

#### ✅ Gutes Gleichgewicht: Erweiterbarkeit ohne Komplexität

```php
<?php

// ✅ Einfache, bei Bedarf erweiterbare Schnittstelle
namespace App\Domain\Reservation\Pricing;

interface DiscountPolicyInterface
{
    public function apply(Money $amount, Reservation $reservation): Money;
}

// ✅ Aktuelle Implementierung einfach
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

// ✅ Bei zukünftigem Bedarf: neue Implementierung (OCP)
// Ohne den bestehenden Code zu ändern
final readonly class LoyaltyDiscountPolicy implements DiscountPolicyInterface
{
    public function apply(Money $amount, Reservation $reservation): Money
    {
        // Zukünftige Implementierung WENN erforderlich
    }
}
```

### YAGNI-Checkliste

Bevor Sie eine Funktion hinzufügen, fragen Sie sich:

- [ ] **Wird es JETZT benötigt?** (im aktuellen Ticket/User Story)
- [ ] **Ist es getestet?** (bestehender Test, der fehlschlägt)
- [ ] **Ist es im MVP?** (definierter Umfang)
- [ ] **Hat der Kunde es ausdrücklich angefordert?**

Wenn **NEIN** zu einer dieser Fragen → **YAGNI: Nicht implementieren**

---

## Häufige Anti-Patterns

### 1. Vorzeitige Optimierung

#### ❌ SCHLECHT

```php
<?php

// ❌ Vorzeitige Optimierung: komplexer Cache vor Leistungsproblem
class ReservationRepository
{
    private array $cache = [];
    private array $cacheTimestamps = [];
    private const CACHE_TTL = 300;

    public function find(int $id): ?Reservation
    {
        // Mehrstufiger Cache bevor ein Problem gemessen wird
        if (isset($this->cache[$id])) {
            if (time() - $this->cacheTimestamps[$id] < self::CACHE_TTL) {
                return $this->cache[$id];
            }
        }

        // ...
    }
}
```

#### ✅ GUT

```php
<?php

// ✅ Einfache Implementierung zuerst
class DoctrineReservationRepository
{
    public function find(ReservationId $id): ?Reservation
    {
        return $this->entityManager->find(Reservation::class, $id);
    }
}

// ✅ Cache NUR hinzugefügt wenn Profiling ein Problem zeigt
// Mit konkreten Messungen (N+1 Queries, Antwortzeit > 200ms)
```

### 2. Gold Plating

#### ❌ SCHLECHT - Nicht angeforderte Funktionen

```php
<?php

// ❌ "Coole" aber nicht erforderliche Funktionen
class ReservationNotifier
{
    // ❌ SMS-Unterstützung (nicht angefordert)
    public function sendSmsConfirmation(Reservation $r): void { }

    // ❌ Push-Benachrichtigungen (nicht angefordert)
    public function sendPushNotification(Reservation $r): void { }

    // ❌ WhatsApp-Unterstützung (nicht angefordert)
    public function sendWhatsAppMessage(Reservation $r): void { }

    // ✅ Nur E-Mail erforderlich
    public function sendEmailConfirmation(Reservation $r): void { }
}
```

#### ✅ GUT - Nur was nötig ist

```php
<?php

// ✅ Implementiert nur E-Mail (erforderlich)
final readonly class EmailNotificationService
{
    public function __construct(
        private MailerInterface $mailer,
    ) {}

    public function sendReservationConfirmation(ReservationId $id): void
    {
        // Nur E-Mail-Implementierung
    }
}

// ✅ Falls SMS später benötigt wird: neue Klasse
// final readonly class SmsNotificationService
```

### 3. Speculative Generality

#### ❌ SCHLECHT - Übermäßige Allgemeinheit

```php
<?php

// ❌ Internes generisches Framework (wir haben Symfony!)
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

    // ... 50 generische Methoden
}

// ❌ Erzwungene Nutzung des eigenen Frameworks
class ReservationManager extends AbstractEntityManager
{
    protected function getEntityClass(): string
    {
        return Reservation::class;
    }
}
```

#### ✅ GUT - Direkt Symfony/Doctrine verwenden

```php
<?php

// ✅ Verwendet Symfony-Tools ohne unnötige Abstraktion
final readonly class DoctrineReservationRepository implements ReservationRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function findById(ReservationId $id): Reservation
    {
        // Direkt, einfach, klar
        $reservation = $this->entityManager->find(Reservation::class, $id);

        if (!$reservation) {
            throw ReservationNotFoundException::withId($id);
        }

        return $reservation;
    }
}
```

### 4. Lasagna Code

#### ❌ SCHLECHT - Unnötige Abstraktionsschichten

```php
<?php

// ❌ Zu viele Schichten für eine einfache Operation
interface ReservationFinderInterface { }

interface ReservationSearchInterface extends ReservationFinderInterface { }

interface ReservationQueryInterface extends ReservationSearchInterface { }

abstract class AbstractReservationFinder implements ReservationQueryInterface { }

class BaseReservationRepository extends AbstractReservationFinder { }

class DoctrineReservationRepository extends BaseReservationRepository { }

// Um zu tun: $repo->find($id) 😱
```

#### ✅ GUT - Nur gerechtfertigte Schichten

```php
<?php

// ✅ DDD-Schichtenarchitektur (gerechtfertigt)
// Domain: Interface
interface ReservationRepositoryInterface
{
    public function findById(ReservationId $id): Reservation;
}

// Infrastructure: Implementierung
final class DoctrineReservationRepository implements ReservationRepositoryInterface
{
    public function findById(ReservationId $id): Reservation
    {
        // Implementierung
    }
}

// ✅ 2 Schichten genügen (Vertrag + Implementierung)
```

---

## Validierungs-Checkliste

### Vor jedem Commit

#### KISS
- [ ] Methoden < 20 Zeilen
- [ ] Zyklomatische Komplexität < 10
- [ ] Maximale Verschachtelung 3 Ebenen
- [ ] Maximal 4 Parameter pro Methode
- [ ] Keine verschachtelten else (frühe Returns)
- [ ] Explizite Benennung (keine Kommentare erforderlich)

#### DRY
- [ ] Kein duplizierter Code (> 3 identische Zeilen)
- [ ] Zentralisierte Validierung (Value Objects)
- [ ] Geschäftsregeln an einer Stelle
- [ ] Keine Wissensduplizierung

#### YAGNI
- [ ] Explizit angeforderte Funktionalität
- [ ] Fehlschlagender Test existiert
- [ ] Im Umfang des aktuellen Tickets
- [ ] Kein "Nur-für-den-Fall"-Code
- [ ] Keine vorzeitige Abstraktion

### Validierungstools

```bash
# Duplikaterkennung (DRY)
vendor/bin/phpcpd src/

# Komplexität (KISS)
vendor/bin/phpmetrics --report-html=metrics src/

# Toter Code (YAGNI)
vendor/bin/phpstan analyse --level=max src/

# Lange Methoden
vendor/bin/phpmd src/ text cleancode,codesize

# Alles in einem
make quality
```

### Zielmetriken

| Metrik | Ziel | Limit |
|--------|------|-------|
| Zeilen pro Methode | < 10 | < 20 |
| Zyklomatische Komplexität | < 5 | < 10 |
| Zeilen pro Klasse | < 150 | < 200 |
| Duplizierung | 0% | < 3% |
| Testabdeckung | > 80% | > 70% |
| Abhängigkeiten pro Klasse | < 5 | < 7 |

---

## Ressourcen

- **Buch:** *The Pragmatic Programmer* - Andy Hunt & Dave Thomas
- **Buch:** *Clean Code* - Robert C. Martin
- **Artikel:** [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- **Artikel:** [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- **Artikel:** [YAGNI](https://martinfowler.com/bliki/Yagni.html)

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
