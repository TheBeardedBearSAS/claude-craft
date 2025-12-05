# Clean Architecture + DDD + Hexagonal - Atoll Tourisme

## Überblick

Dieses Dokument definiert die **obligatorische** Architektur des Atoll Tourisme Projekts, basierend auf:
- **Clean Architecture** (Uncle Bob)
- **Domain-Driven Design** (Eric Evans)
- **Hexagonal Architecture / Ports & Adapters** (Alistair Cockburn)

> **Referenzen:**
> - `01-symfony-best-practices.md` - Symfony Standards
> - `04-solid-principles.md` - SOLID Prinzipien
> - `13-ddd-patterns.md` - Detaillierte DDD Patterns
> - `08-quality-tools.md` - Architektur-Validierung (Deptrac)

---

## Inhaltsverzeichnis

1. [Architekturprinzipien](#architekturprinzipien)
2. [Verzeichnisstruktur](#verzeichnisstruktur)
3. [Bounded Contexts](#bounded-contexts)
4. [Architektur-Schichten](#architektur-schichten)
5. [Datenfluss](#datenfluss)
6. [Abhängigkeitsregeln](#abhängigkeitsregeln)
7. [Validierungs-Checkliste](#validierungs-checkliste)

---

## Architekturprinzipien

### 1. Unabhängigkeit der Geschäftslogik

Der Geschäftscode **darf NICHT abhängen von**:
- ❌ Frameworks (Symfony, Doctrine)
- ❌ UI (Controllers, Forms, Templates)
- ❌ Datenbank (PostgreSQL, MySQL)
- ❌ Externe Services (APIs, Email, SMS)

### 2. Abhängigkeitsregel

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   DOMAIN (Business Logic)                       │
│   ↑                                              │
│   │ abhängig von                                 │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   APPLICATION (Use Cases)                        │
│   ↑                                              │
│   │ abhängig von                                 │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   INFRASTRUCTURE (Technik)                       │
│   ↑                                              │
│   │ genutzt von                                  │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   PRESENTATION (UI)                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Goldene Regel:** Abhängigkeiten zeigen immer nach innen (zur Domain).

### 3. Testbarkeit

Jede Schicht muss **unabhängig** testbar sein:
- **Domain:** Unit-Tests ohne Symfony/Doctrine
- **Application:** Integrationstests mit Mocks
- **Infrastructure:** Integrationstests mit Datenbank
- **Presentation:** Funktionale E2E-Tests

---

## Verzeichnisstruktur

### Aktuelle Atoll Tourisme Struktur

```
src/
├── Domain/                          # DOMAIN SCHICHT (Business Logic)
│   ├── Catalog/                     # Bounded Context: Katalog
│   │   ├── Entity/
│   │   │   └── Sejour.php
│   │   ├── ValueObject/
│   │   │   ├── SejourId.php
│   │   │   ├── DateRange.php
│   │   │   └── Destination.php
│   │   ├── Repository/
│   │   │   └── SejourRepositoryInterface.php
│   │   ├── Service/
│   │   │   └── SejourAvailabilityService.php
│   │   ├── Event/
│   │   │   └── SejourPublishedEvent.php
│   │   └── Exception/
│   │       └── SejourNotFoundException.php
│   │
│   ├── Reservation/                 # Bounded Context: Reservierung
│   │   ├── Entity/
│   │   │   ├── Reservation.php      # Aggregate Root
│   │   │   └── Participant.php      # Entity
│   │   ├── ValueObject/
│   │   │   ├── ReservationId.php
│   │   │   ├── ReservationStatus.php
│   │   │   └── Money.php
│   │   ├── Repository/
│   │   │   ├── ReservationRepositoryInterface.php
│   │   │   └── ReservationFinderInterface.php
│   │   ├── Service/                 # Domain Services
│   │   │   ├── ReservationPricingService.php
│   │   │   └── ReservationValidator.php
│   │   ├── Pricing/                 # Sub-Domain Pricing
│   │   │   ├── DiscountPolicyInterface.php
│   │   │   └── Policy/
│   │   │       ├── FamilyDiscountPolicy.php
│   │   │       └── EarlyBookingDiscountPolicy.php
│   │   ├── Event/
│   │   │   ├── ReservationCreatedEvent.php
│   │   │   ├── ReservationConfirmedEvent.php
│   │   │   └── ReservationCancelledEvent.php
│   │   └── Exception/
│   │       ├── ReservationNotFoundException.php
│   │       └── InvalidReservationException.php
│   │
│   ├── Notification/                # Bounded Context: Benachrichtigungen
│   │   ├── Service/
│   │   │   └── NotificationServiceInterface.php
│   │   ├── ValueObject/
│   │   │   ├── EmailTemplate.php
│   │   │   └── NotificationChannel.php
│   │   └── Exception/
│   │       └── NotificationFailedException.php
│   │
│   └── Shared/                      # Shared Kernel
│       ├── ValueObject/
│       │   ├── Email.php
│       │   ├── PhoneNumber.php
│       │   ├── PostalAddress.php
│       │   └── PersonName.php
│       ├── Exception/
│       │   └── DomainException.php
│       └── Interface/
│           ├── AggregateRootInterface.php
│           └── DomainEventInterface.php
│
├── Application/                     # APPLICATION SCHICHT (Use Cases)
│   ├── Reservation/
│   │   ├── UseCase/
│   │   │   ├── CreateReservation/
│   │   │   │   ├── CreateReservationUseCase.php
│   │   │   │   ├── CreateReservationCommand.php
│   │   │   │   └── CreateReservationCommandHandler.php
│   │   │   ├── ConfirmReservation/
│   │   │   │   ├── ConfirmReservationUseCase.php
│   │   │   │   └── ConfirmReservationCommand.php
│   │   │   └── CancelReservation/
│   │   │       ├── CancelReservationUseCase.php
│   │   │       └── CancelReservationCommand.php
│   │   ├── Query/
│   │   │   ├── GetReservationDetails/
│   │   │   │   ├── GetReservationDetailsQuery.php
│   │   │   │   ├── GetReservationDetailsQueryHandler.php
│   │   │   │   └── ReservationDetailsDTO.php
│   │   │   └── ListReservations/
│   │   │       └── ListReservationsQuery.php
│   │   └── EventHandler/
│   │       ├── SendConfirmationEmailOnReservationConfirmed.php
│   │       └── UpdateStatisticsOnReservationCreated.php
│   │
│   └── Catalog/
│       ├── UseCase/
│       │   └── PublishSejour/
│       └── Query/
│           └── SearchSejours/
│
├── Infrastructure/                  # INFRASTRUCTURE SCHICHT (Technik)
│   ├── Persistence/
│   │   ├── Doctrine/
│   │   │   ├── Repository/
│   │   │   │   ├── DoctrineReservationRepository.php
│   │   │   │   └── DoctrineSejourRepository.php
│   │   │   ├── Type/
│   │   │   │   ├── EmailType.php
│   │   │   │   ├── MoneyType.php
│   │   │   │   └── ReservationIdType.php
│   │   │   └── Mapping/
│   │   │       ├── Reservation.orm.xml
│   │   │       └── Sejour.orm.xml
│   │   └── InMemory/                # Für Tests
│   │       └── InMemoryReservationRepository.php
│   │
│   ├── Notification/
│   │   ├── EmailNotificationService.php
│   │   ├── Mailer/
│   │   │   ├── SymfonyMailerAdapter.php
│   │   │   └── Template/
│   │   │       ├── ReservationConfirmationTemplate.php
│   │   │       └── ReservationCancellationTemplate.php
│   │   └── Message/                 # Symfony Messenger
│   │       ├── SendReservationConfirmationEmail.php
│   │       └── Handler/
│   │           └── SendReservationConfirmationEmailHandler.php
│   │
│   ├── Cache/
│   │   ├── RedisSejourCacheAdapter.php
│   │   └── RedisCacheWarmer.php
│   │
│   ├── EventBus/
│   │   └── SymfonyEventBusAdapter.php
│   │
│   └── Http/
│       └── Client/
│           └── ExternalApiClient.php
│
└── Presentation/                    # PRESENTATION SCHICHT (UI)
    ├── Controller/
    │   ├── Web/
    │   │   ├── ReservationController.php
    │   │   ├── HomeController.php
    │   │   └── SejourController.php
    │   ├── Api/
    │   │   └── ReservationApiController.php
    │   └── Admin/
    │       ├── DashboardController.php
    │       ├── ReservationCrudController.php
    │       └── SejourCrudController.php
    │
    ├── Form/
    │   ├── ReservationFormType.php
    │   └── ParticipantType.php
    │
    ├── Twig/
    │   ├── Component/
    │   │   └── ReservationForm.php
    │   └── Extension/
    │       └── MoneyExtension.php
    │
    └── Command/                     # CLI
        ├── ImportSejoursCommand.php
        └── SendPendingNotificationsCommand.php
```

### Namenskonventionen

| Schicht | Suffix | Beispiel |
|---------|--------|----------|
| Entity | Kein Suffix | `Reservation`, `Sejour` |
| Value Object | Kein Suffix | `Money`, `Email`, `ReservationId` |
| Repository Interface | `Interface` | `ReservationRepositoryInterface` |
| Repository Impl | `Repository` | `DoctrineReservationRepository` |
| Domain Service | `Service` | `ReservationPricingService` |
| Use Case | `UseCase` | `CreateReservationUseCase` |
| Command | `Command` | `CreateReservationCommand` |
| Query | `Query` | `GetReservationDetailsQuery` |
| Handler | `Handler` | `CreateReservationCommandHandler` |
| Event | `Event` | `ReservationConfirmedEvent` |
| Exception | `Exception` | `ReservationNotFoundException` |
| DTO | `DTO` | `ReservationDetailsDTO` |

---

## Bounded Contexts

Das Atoll Tourisme System ist in 3 Haupt-**Bounded Contexts** unterteilt:

### 1. Catalog (Katalog)

**Verantwortlichkeit:** Verwaltung von Reisen, Zielen, Verfügbarkeiten

**Ubiquitous Language:**
- **Séjour (Reise):** Organisierte Reise mit Daten, Ziel, Preis
- **Destination (Ziel):** Reiseort (Stadt, Land, Region)
- **Disponibilité (Verfügbarkeit):** Verfügbare Plätze für eine Reise
- **Saison (Saison):** Gültigkeitszeitraum der Tarife

**Haupt-Entities:**
- `Sejour` (Aggregate Root)
- `Destination` (Value Object)
- `DateRange` (Value Object)

**Use Cases:**
- Neue Reise veröffentlichen
- Reisen suchen
- Verfügbarkeiten prüfen
- Saisonale Preise verwalten

### 2. Reservation (Reservierung)

**Verantwortlichkeit:** Verwaltung von Reservierungen, Teilnehmern, Zahlungen

**Ubiquitous Language:**
- **Réservation (Reservierung):** Anfrage zur Teilnahme an einer Reise
- **Participant (Teilnehmer):** Angemeldete Person (Kind/Erwachsener)
- **Statut (Status):** Zustand der Reservierung (ausstehend, bestätigt, storniert)
- **Montant (Betrag):** Gesamtpreis der Reservierung
- **Remise (Rabatt):** Angewendete Ermäßigung (Großfamilie, Frühbucher)

**Haupt-Entities:**
- `Reservation` (Aggregate Root)
- `Participant` (Entity)
- `Money` (Value Object)
- `ReservationStatus` (Value Object / Enum)

**Use Cases:**
- Reservierung erstellen
- Reservierung bestätigen
- Reservierung stornieren
- Gesamtpreis berechnen
- Rabatte anwenden

### 3. Notification (Benachrichtigung)

**Verantwortlichkeit:** Versenden von E-Mails, Benachrichtigungen

**Ubiquitous Language:**
- **Notification (Benachrichtigung):** An Kunden gesendete Nachricht
- **Template (Vorlage):** Nachrichtenvorlage (Bestätigung, Stornierung)
- **Canal (Kanal):** Versandweg (E-Mail, zukünftig SMS)

**Services:**
- `NotificationServiceInterface`
- `EmailNotificationService`

**Use Cases:**
- Reservierungsbestätigung senden
- Reservierungsstornierung senden
- Zahlungserinnerung senden

### Anti-Corruption Layer (ACL)

Kommunikation zwischen Bounded Contexts über **Interfaces** und **DTOs**:

```php
<?php

namespace App\Application\Reservation\UseCase\CreateReservation;

use App\Domain\Catalog\Repository\SejourRepositoryInterface;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;

// ✅ Reservation BC kommuniziert mit Catalog BC über Interfaces
final readonly class CreateReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private SejourRepositoryInterface $sejourRepository, // ACL
    ) {}

    public function execute(CreateReservationCommand $command): void
    {
        // Holt Sejour (Catalog BC)
        $sejour = $this->sejourRepository->findById($command->sejourId);

        // Erstellt Reservation (Reservation BC)
        $reservation = Reservation::create(
            // ...
            $sejour, // Referenz zum Sejour
        );

        $this->reservationRepository->save($reservation);
    }
}
```

---

## Architektur-Schichten

### SCHICHT 1: Domain (Domain)

**Verantwortlichkeit:** Reine Geschäftslogik, Geschäftsregeln

**Inhalt:**
- Entities (Aggregate Roots)
- Value Objects
- Domain Services
- Repository Interfaces
- Domain Events
- Geschäfts-Exceptions

**Regeln:**
- ✅ Reines PHP (keine Framework-Abhängigkeit)
- ✅ Unit-testbar ohne Datenbank
- ✅ Enthält kritische Geschäftslogik
- ❌ Keine Doctrine-Annotationen
- ❌ Keine Symfony-Abhängigkeiten
- ❌ Keine Persistenz-Logik

**Beispiel:**

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationStatus;
use App\Domain\Reservation\Event\ReservationConfirmedEvent;

// ✅ Reine Domain-Entity (keine Doctrine-Annotationen hier)
final class Reservation
{
    private ReservationId $id;
    private Money $montantTotal;
    private ReservationStatus $statut;
    /** @var list<DomainEventInterface> */
    private array $domainEvents = [];

    private function __construct(
        ReservationId $id,
        Money $montantTotal,
        ReservationStatus $statut
    ) {
        $this->id = $id;
        $this->montantTotal = $montantTotal;
        $this->statut = $statut;
    }

    public static function create(
        ReservationId $id,
        Money $montantTotal
    ): self {
        return new self(
            $id,
            $montantTotal,
            ReservationStatus::EN_ATTENTE
        );
    }

    // ✅ Geschäftslogik in der Domain
    public function confirmer(): void
    {
        if ($this->statut === ReservationStatus::ANNULEE) {
            throw new InvalidReservationException('Cannot confirm cancelled reservation');
        }

        $this->statut = ReservationStatus::CONFIRMEE;

        // Registriert Domain-Event
        $this->recordEvent(new ReservationConfirmedEvent($this->id));
    }

    public function annuler(string $raison): void
    {
        if ($this->statut === ReservationStatus::TERMINEE) {
            throw new InvalidReservationException('Cannot cancel completed reservation');
        }

        $this->statut = ReservationStatus::ANNULEE;
        $this->recordEvent(new ReservationCancelledEvent($this->id, $raison));
    }

    private function recordEvent(DomainEventInterface $event): void
    {
        $this->domainEvents[] = $event;
    }

    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];
        return $events;
    }

    // Getters
    public function getId(): ReservationId
    {
        return $this->id;
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
```

### SCHICHT 2: Application (Use Cases)

**Verantwortlichkeit:** Orchestrierung, Koordination der Use Cases

**Inhalt:**
- Use Cases
- Commands / Queries (CQRS)
- Command/Query Handlers
- DTOs
- Event Handlers

**Regeln:**
- ✅ Koordiniert Domain-Entities
- ✅ Verwaltet Transaktionen
- ✅ Verteilt Events
- ❌ Keine Geschäftslogik
- ❌ Kein direkter DB-Zugriff (über Repositories)

**Beispiel:**

```php
<?php

namespace App\Application\Reservation\UseCase\ConfirmReservation;

use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Symfony\Component\Messenger\MessageBusInterface;

// ✅ Use Case: orchestriert die Domain
final readonly class ConfirmReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $repository,
        private MessageBusInterface $eventBus,
    ) {}

    public function execute(ConfirmReservationCommand $command): void
    {
        // 1. Abrufen
        $reservation = $this->repository->findById(
            ReservationId::fromString($command->reservationId)
        );

        // 2. Geschäftslogik (in der Domain)
        $reservation->confirmer();

        // 3. Persistierung
        $this->repository->save($reservation);

        // 4. Domain-Events
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventBus->dispatch($event);
        }
    }
}

// ✅ Command: Einfaches DTO
final readonly class ConfirmReservationCommand
{
    public function __construct(
        public string $reservationId,
    ) {}
}
```

### SCHICHT 3: Infrastructure (Technik)

**Verantwortlichkeit:** Technische Implementation, Frameworks, DB

**Inhalt:**
- Repository Implementations (Doctrine)
- Doctrine Types
- ORM Mappings
- Email Services
- Cache Adapters
- HTTP Clients

**Regeln:**
- ✅ Implementiert Domain-Interfaces
- ✅ Nutzt Doctrine, Symfony, etc.
- ✅ Verwaltet Persistenz
- ❌ Keine Geschäftslogik

**Beispiel:**

```php
<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Doctrine\ORM\EntityManagerInterface;

// ✅ Doctrine-Implementation (Infrastructure)
final readonly class DoctrineReservationRepository implements ReservationRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function findById(ReservationId $id): Reservation
    {
        $reservation = $this->entityManager->find(Reservation::class, $id->getValue());

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
```

### SCHICHT 4: Presentation (UI)

**Verantwortlichkeit:** Benutzeroberfläche, API, CLI

**Inhalt:**
- Controllers (Web, API, Admin)
- Forms
- Commands (Console)
- Twig Components

**Regeln:**
- ✅ Delegiert an Use Cases
- ✅ Validiert Benutzereingaben
- ✅ Transformiert Antworten in HTTP/JSON
- ❌ Keine Geschäftslogik
- ❌ Kein direkter Zugriff auf Repositories

**Beispiel:**

```php
<?php

namespace App\Presentation\Controller\Web;

use App\Application\Reservation\UseCase\ConfirmReservation\ConfirmReservationCommand;
use App\Application\Reservation\UseCase\ConfirmReservation\ConfirmReservationUseCase;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

// ✅ Controller: delegiert an Use Case
final class ReservationController extends AbstractController
{
    public function __construct(
        private readonly ConfirmReservationUseCase $confirmReservationUseCase,
    ) {}

    #[Route('/reservations/{id}/confirm', name: 'reservation_confirm', methods: ['POST'])]
    public function confirm(string $id): Response
    {
        // Basis-Validierung
        if (empty($id)) {
            throw $this->createNotFoundException();
        }

        // Delegiert an Use Case
        $command = new ConfirmReservationCommand($id);
        $this->confirmReservationUseCase->execute($command);

        $this->addFlash('success', 'Reservierung erfolgreich bestätigt');

        return $this->redirectToRoute('reservation_show', ['id' => $id]);
    }
}
```

---

## Datenfluss

### Ablauf einer Reservierungserstellung

```
1. PRESENTATION
   │
   ├─> ReservationController::create(Request)
   │   └─> Formular-Validierung
   │
2. APPLICATION
   │
   ├─> CreateReservationUseCase::execute(Command)
   │   ├─> Repository::findSejour()
   │   ├─> Reservation::create()           (Domain)
   │   ├─> ReservationPricingService       (Domain)
   │   ├─> Repository::save()
   │   └─> EventBus::dispatch(Event)
   │
3. EVENT HANDLERS
   │
   ├─> SendConfirmationEmailHandler
   │   └─> NotificationService::send()     (Infrastructure)
   │
   └─> UpdateStatisticsHandler
       └─> StatisticsService::update()     (Infrastructure)
```

---

## Abhängigkeitsregeln

### Validierung mit Deptrac

```yaml
# deptrac.yaml
deptrac:
    paths:
        - src/

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

        - name: Presentation
          collectors:
              - type: directory
                value: src/Presentation/.*

    ruleset:
        # ✅ Domain hängt von NICHTS ab
        Domain: []

        # ✅ Application hängt nur von Domain ab
        Application:
            - Domain

        # ✅ Infrastructure hängt von Domain und Application ab
        Infrastructure:
            - Domain
            - Application

        # ✅ Presentation hängt von Application und Infrastructure ab
        Presentation:
            - Application
            - Infrastructure
            - Domain  # Nur für VOs in DTOs
```

### Ausführung

```bash
# Architektur validieren
vendor/bin/deptrac analyze

# Sollte anzeigen: ✅ All rules validated successfully
```

---

## Validierungs-Checkliste

### Vor jedem Commit

- [ ] **Domain:** Keine externen Abhängigkeiten (Symfony, Doctrine)
- [ ] **Domain:** Entities sind unit-testbar
- [ ] **Application:** Use Cases koordinieren, enthalten keine Geschäftslogik
- [ ] **Infrastructure:** Implementiert Domain-Interfaces
- [ ] **Presentation:** Delegiert an Use Cases
- [ ] **Deptrac:** `vendor/bin/deptrac analyze` läuft durch
- [ ] **Tests:** Jede Schicht unabhängig getestet

### PHPStan

```bash
# Max-Level + strikte Regeln
vendor/bin/phpstan analyse -l max src/
```

### Architecture Decision Records

Wichtige Architekturentscheidungen in `docs/adr/` dokumentieren:

```markdown
# ADR-001: Verwendung von Value Objects für Money

**Status:** Akzeptiert

**Kontext:**
Verwaltung von Geldbeträgen mit Präzision (Cents).

**Entscheidung:**
Verwendung eines Value Objects `Money` mit Speicherung in Cents (int).

**Konsequenzen:**
- ✅ Garantierte Präzision (kein Float)
- ✅ Unveränderlichkeit
- ✅ Typsicherheit
- ❌ Etwas verbos
```

---

## Ressourcen

- **Buch:** *Clean Architecture* - Robert C. Martin
- **Buch:** *Domain-Driven Design* - Eric Evans
- **Buch:** *Implementing Domain-Driven Design* - Vaughn Vernon
- **Artikel:** [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- **Tool:** [Deptrac](https://github.com/qossmic/deptrac)

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
