# Architecture Clean + DDD + Hexagonal - Atoll Tourisme

## Vue d'ensemble

Ce document définit l'architecture **obligatoire** du projet Atoll Tourisme, basée sur:
- **Clean Architecture** (Uncle Bob)
- **Domain-Driven Design** (Eric Evans)
- **Hexagonal Architecture / Ports & Adapters** (Alistair Cockburn)

> **Références:**
> - `01-symfony-best-practices.md` - Standards Symfony
> - `04-solid-principles.md` - Principes SOLID
> - `13-ddd-patterns.md` - Patterns DDD détaillés
> - `08-quality-tools.md` - Validation architecture (Deptrac)

---

## Table des matières

1. [Principes architecturaux](#principes-architecturaux)
2. [Structure des répertoires](#structure-des-répertoires)
3. [Bounded Contexts](#bounded-contexts)
4. [Couches de l'architecture](#couches-de-larchitecture)
5. [Flux de données](#flux-de-données)
6. [Règles de dépendances](#règles-de-dépendances)
7. [Checklist de validation](#checklist-de-validation)

---

## Principes architecturaux

### 1. Indépendance du domaine métier

Le code métier **ne doit pas dépendre** de:
- ❌ Frameworks (Symfony, Doctrine)
- ❌ UI (Controllers, Forms, Templates)
- ❌ Base de données (PostgreSQL, MySQL)
- ❌ Services externes (APIs, Email, SMS)

### 2. Règle de dépendance

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   DOMAINE (Business Logic)                      │
│   ↑                                              │
│   │ dépend de                                    │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   APPLICATION (Use Cases)                        │
│   ↑                                              │
│   │ dépend de                                    │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   INFRASTRUCTURE (Technique)                     │
│   ↑                                              │
│   │ utilisé par                                  │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   PRÉSENTATION (UI)                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Règle d'or:** Les dépendances pointent toujours vers l'intérieur (vers le domaine).

### 3. Testabilité

Chaque couche doit être testable **indépendamment**:
- **Domaine:** Tests unitaires sans Symfony/Doctrine
- **Application:** Tests d'intégration avec mocks
- **Infrastructure:** Tests d'intégration avec base de données
- **Présentation:** Tests fonctionnels E2E

---

## Structure des répertoires

### Structure actuelle Atoll Tourisme

```
src/
├── Domain/                          # COUCHE DOMAINE (Business Logic)
│   ├── Catalog/                     # Bounded Context: Catalogue
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
│   ├── Reservation/                 # Bounded Context: Réservation
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
│   │   ├── Pricing/                 # Sous-domaine Pricing
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
│   ├── Notification/                # Bounded Context: Notifications
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
├── Application/                     # COUCHE APPLICATION (Use Cases)
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
├── Infrastructure/                  # COUCHE INFRASTRUCTURE (Technique)
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
│   │   └── InMemory/                # Pour tests
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
└── Presentation/                    # COUCHE PRÉSENTATION (UI)
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

### Règles de nommage

| Couche | Suffixe | Exemple |
|--------|---------|---------|
| Entity | Pas de suffixe | `Reservation`, `Sejour` |
| Value Object | Pas de suffixe | `Money`, `Email`, `ReservationId` |
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

Le système Atoll Tourisme est divisé en 3 **Bounded Contexts** principaux:

### 1. Catalog (Catalogue)

**Responsabilité:** Gestion des séjours, destinations, disponibilités

**Ubiquitous Language:**
- **Séjour:** Voyage organisé avec dates, destination, prix
- **Destination:** Lieu du séjour (ville, pays, région)
- **Disponibilité:** Places disponibles pour un séjour
- **Saison:** Période de validité des tarifs

**Entités principales:**
- `Sejour` (Aggregate Root)
- `Destination` (Value Object)
- `DateRange` (Value Object)

**Cas d'usage:**
- Publier un nouveau séjour
- Rechercher des séjours
- Vérifier les disponibilités
- Gérer les tarifs saisonniers

### 2. Reservation (Réservation)

**Responsabilité:** Gestion des réservations, participants, paiements

**Ubiquitous Language:**
- **Réservation:** Demande de participation à un séjour
- **Participant:** Personne inscrite (enfant/adulte)
- **Statut:** État de la réservation (en attente, confirmée, annulée)
- **Montant:** Prix total de la réservation
- **Remise:** Réduction appliquée (famille nombreuse, anticipée)

**Entités principales:**
- `Reservation` (Aggregate Root)
- `Participant` (Entity)
- `Money` (Value Object)
- `ReservationStatus` (Value Object / Enum)

**Cas d'usage:**
- Créer une réservation
- Confirmer une réservation
- Annuler une réservation
- Calculer le prix total
- Appliquer des remises

### 3. Notification (Notification)

**Responsabilité:** Envoi d'emails, notifications

**Ubiquitous Language:**
- **Notification:** Message envoyé au client
- **Template:** Modèle de message (confirmation, annulation)
- **Canal:** Moyen d'envoi (email, SMS futur)

**Services:**
- `NotificationServiceInterface`
- `EmailNotificationService`

**Cas d'usage:**
- Envoyer confirmation de réservation
- Envoyer annulation de réservation
- Envoyer rappel de paiement

### Anti-Corruption Layer (ACL)

Communication entre Bounded Contexts via **interfaces** et **DTOs**:

```php
<?php

namespace App\Application\Reservation\UseCase\CreateReservation;

use App\Domain\Catalog\Repository\SejourRepositoryInterface;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;

// ✅ Reservation BC communique avec Catalog BC via interfaces
final readonly class CreateReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private SejourRepositoryInterface $sejourRepository, // ACL
    ) {}

    public function execute(CreateReservationCommand $command): void
    {
        // Récupère le Sejour (Catalog BC)
        $sejour = $this->sejourRepository->findById($command->sejourId);

        // Crée la Reservation (Reservation BC)
        $reservation = Reservation::create(
            // ...
            $sejour, // Référence au Sejour
        );

        $this->reservationRepository->save($reservation);
    }
}
```

---

## Couches de l'architecture

### COUCHE 1: Domain (Domaine)

**Responsabilité:** Logique métier pure, règles de gestion

**Contenu:**
- Entities (Aggregate Roots)
- Value Objects
- Domain Services
- Repository Interfaces
- Domain Events
- Exceptions métier

**Règles:**
- ✅ Pur PHP (pas de dépendance framework)
- ✅ Testable unitairement sans base de données
- ✅ Contient la logique métier critique
- ❌ Pas d'annotations Doctrine
- ❌ Pas de dépendance Symfony
- ❌ Pas de logique de persistance

**Exemple:**

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationStatus;
use App\Domain\Reservation\Event\ReservationConfirmedEvent;

// ✅ Entité domaine pure (pas d'annotations Doctrine ici)
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

    // ✅ Logique métier dans le domaine
    public function confirmer(): void
    {
        if ($this->statut === ReservationStatus::ANNULEE) {
            throw new InvalidReservationException('Cannot confirm cancelled reservation');
        }

        $this->statut = ReservationStatus::CONFIRMEE;

        // Enregistre un événement domaine
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

### COUCHE 2: Application (Cas d'usage)

**Responsabilité:** Orchestration, coordination des use cases

**Contenu:**
- Use Cases
- Commands / Queries (CQRS)
- Command/Query Handlers
- DTOs
- Event Handlers

**Règles:**
- ✅ Coordonne les entités domaine
- ✅ Gère les transactions
- ✅ Dispatche les événements
- ❌ Pas de logique métier
- ❌ Pas d'accès direct à la BDD (via repositories)

**Exemple:**

```php
<?php

namespace App\Application\Reservation\UseCase\ConfirmReservation;

use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Symfony\Component\Messenger\MessageBusInterface;

// ✅ Use Case: orchestre le domaine
final readonly class ConfirmReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $repository,
        private MessageBusInterface $eventBus,
    ) {}

    public function execute(ConfirmReservationCommand $command): void
    {
        // 1. Récupération
        $reservation = $this->repository->findById(
            ReservationId::fromString($command->reservationId)
        );

        // 2. Logique métier (dans le domaine)
        $reservation->confirmer();

        // 3. Persistance
        $this->repository->save($reservation);

        // 4. Événements domaine
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventBus->dispatch($event);
        }
    }
}

// ✅ Command: DTO simple
final readonly class ConfirmReservationCommand
{
    public function __construct(
        public string $reservationId,
    ) {}
}
```

### COUCHE 3: Infrastructure (Technique)

**Responsabilité:** Implémentation technique, frameworks, BDD

**Contenu:**
- Repository Implementations (Doctrine)
- Doctrine Types
- ORM Mappings
- Email Services
- Cache Adapters
- HTTP Clients

**Règles:**
- ✅ Implémente les interfaces du domaine
- ✅ Utilise Doctrine, Symfony, etc.
- ✅ Gère la persistance
- ❌ Pas de logique métier

**Exemple:**

```php
<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Doctrine\ORM\EntityManagerInterface;

// ✅ Implémentation Doctrine (Infrastructure)
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

### COUCHE 4: Presentation (UI)

**Responsabilité:** Interface utilisateur, API, CLI

**Contenu:**
- Controllers (Web, API, Admin)
- Forms
- Commands (Console)
- Twig Components

**Règles:**
- ✅ Délègue aux use cases
- ✅ Valide les entrées utilisateur
- ✅ Transforme les réponses en HTTP/JSON
- ❌ Pas de logique métier
- ❌ Pas d'accès direct aux repositories

**Exemple:**

```php
<?php

namespace App\Presentation\Controller\Web;

use App\Application\Reservation\UseCase\ConfirmReservation\ConfirmReservationCommand;
use App\Application\Reservation\UseCase\ConfirmReservation\ConfirmReservationUseCase;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

// ✅ Controller: délègue au use case
final class ReservationController extends AbstractController
{
    public function __construct(
        private readonly ConfirmReservationUseCase $confirmReservationUseCase,
    ) {}

    #[Route('/reservations/{id}/confirm', name: 'reservation_confirm', methods: ['POST'])]
    public function confirm(string $id): Response
    {
        // Validation basique
        if (empty($id)) {
            throw $this->createNotFoundException();
        }

        // Délègue au use case
        $command = new ConfirmReservationCommand($id);
        $this->confirmReservationUseCase->execute($command);

        $this->addFlash('success', 'Réservation confirmée avec succès');

        return $this->redirectToRoute('reservation_show', ['id' => $id]);
    }
}
```

---

## Flux de données

### Flux de création d'une réservation

```
1. PRÉSENTATION
   │
   ├─> ReservationController::create(Request)
   │   └─> Validation formulaire
   │
2. APPLICATION
   │
   ├─> CreateReservationUseCase::execute(Command)
   │   ├─> Repository::findSejour()
   │   ├─> Reservation::create()           (Domaine)
   │   ├─> ReservationPricingService       (Domaine)
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

### Code complet du flux

```php
<?php

// 1. PRÉSENTATION - Controller
namespace App\Presentation\Controller\Web;

final class ReservationController extends AbstractController
{
    public function __construct(
        private readonly CreateReservationUseCase $createReservation,
    ) {}

    #[Route('/reservations/create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $form = $this->createForm(ReservationFormType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();

            // ✅ Crée un Command à partir du formulaire
            $command = new CreateReservationCommand(
                sejourId: $data['sejourId'],
                clientEmail: $data['email'],
                participants: $data['participants'],
            );

            // ✅ Délègue au use case
            $reservationId = $this->createReservation->execute($command);

            return $this->redirectToRoute('reservation_confirmation', [
                'id' => (string) $reservationId,
            ]);
        }

        return $this->render('reservation/create.html.twig', [
            'form' => $form,
        ]);
    }
}

// 2. APPLICATION - Use Case
namespace App\Application\Reservation\UseCase\CreateReservation;

final readonly class CreateReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private SejourRepositoryInterface $sejourRepository,
        private ReservationPricingService $pricingService,
        private MessageBusInterface $eventBus,
    ) {}

    public function execute(CreateReservationCommand $command): ReservationId
    {
        // ✅ Récupère le séjour (Catalog BC)
        $sejour = $this->sejourRepository->findById(
            SejourId::fromString($command->sejourId)
        );

        // ✅ Crée la réservation (Domaine)
        $reservation = Reservation::create(
            ReservationId::generate(),
            $sejour,
            Email::fromString($command->clientEmail)
        );

        // Ajoute les participants
        foreach ($command->participants as $participantData) {
            $reservation->addParticipant(
                Participant::create(
                    PersonName::fromString($participantData['nom']),
                    $participantData['age']
                )
            );
        }

        // ✅ Calcule le prix (Domain Service)
        $montant = $this->pricingService->calculateTotalPrice($reservation);
        $reservation->setMontantTotal($montant);

        // ✅ Sauvegarde
        $this->reservationRepository->save($reservation);

        // ✅ Dispatche les événements domaine
        foreach ($reservation->pullDomainEvents() as $event) {
            $this->eventBus->dispatch($event);
        }

        return $reservation->getId();
    }
}

// 3. INFRASTRUCTURE - Event Handler
namespace App\Application\Reservation\EventHandler;

use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final readonly class SendConfirmationEmailOnReservationCreated
{
    public function __construct(
        private NotificationServiceInterface $notificationService,
    ) {}

    public function __invoke(ReservationCreatedEvent $event): void
    {
        // ✅ Envoie l'email de confirmation
        $this->notificationService->sendReservationConfirmation(
            $event->reservationId
        );
    }
}
```

---

## Règles de dépendances

### Validation avec Deptrac

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
        # ✅ Domain ne dépend de RIEN
        Domain: []

        # ✅ Application dépend uniquement de Domain
        Application:
            - Domain

        # ✅ Infrastructure dépend de Domain et Application
        Infrastructure:
            - Domain
            - Application

        # ✅ Presentation dépend de Application et Infrastructure
        Presentation:
            - Application
            - Infrastructure
            - Domain  # Seulement pour les VOs dans les DTOs
```

### Exécution

```bash
# Valider l'architecture
vendor/bin/deptrac analyze

# Doit afficher: ✅ All rules validated successfully
```

### Violations courantes

#### ❌ VIOLATION: Domain dépend de Symfony

```php
<?php

namespace App\Domain\Reservation\Entity;

use Doctrine\ORM\Mapping as ORM; // ❌ VIOLATION

#[ORM\Entity] // ❌ Doctrine dans le Domain
class Reservation
{
    // ...
}
```

#### ✅ CORRECTION: Mapping XML séparé

```php
<?php

namespace App\Domain\Reservation\Entity;

// ✅ Entité pure
final class Reservation
{
    private ReservationId $id;
    private Money $montantTotal;
    // ...
}
```

```xml
<!-- Infrastructure/Persistence/Doctrine/Mapping/Reservation.orm.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<doctrine-mapping>
    <entity name="App\Domain\Reservation\Entity\Reservation"
            table="reservation">
        <id name="id" type="reservation_id">
            <generator strategy="NONE"/>
        </id>
        <embedded name="montantTotal" class="App\Domain\Reservation\ValueObject\Money"/>
    </entity>
</doctrine-mapping>
```

---

## Checklist de validation

### Avant chaque commit

- [ ] **Domain:** Pas de dépendance externe (Symfony, Doctrine)
- [ ] **Domain:** Entités testables unitairement
- [ ] **Application:** Use cases coordonnent, ne contiennent pas de logique métier
- [ ] **Infrastructure:** Implémente les interfaces du domaine
- [ ] **Presentation:** Délègue aux use cases
- [ ] **Deptrac:** `vendor/bin/deptrac analyze` passe
- [ ] **Tests:** Chaque couche testée indépendamment

### PHPStan

```bash
# Niveau max + règles strictes
vendor/bin/phpstan analyse -l max src/
```

### Architecture Decision Records

Documenter les choix architecturaux importants dans `docs/adr/`:

```markdown
# ADR-001: Utilisation de Value Objects pour Money

**Statut:** Accepté

**Contexte:**
Gestion des montants monétaires avec précision (centimes).

**Décision:**
Utiliser un Value Object `Money` avec stockage en centimes (int).

**Conséquences:**
- ✅ Précision garantie (pas de float)
- ✅ Immutabilité
- ✅ Type safety
- ❌ Légèrement plus verbeux
```

---

## Ressources

- **Livre:** *Clean Architecture* - Robert C. Martin
- **Livre:** *Domain-Driven Design* - Eric Evans
- **Livre:** *Implementing Domain-Driven Design* - Vaughn Vernon
- **Article:** [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- **Outil:** [Deptrac](https://github.com/qossmic/deptrac)

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
