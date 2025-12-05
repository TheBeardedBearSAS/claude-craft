# Structure Clean Architecture + DDD - Atoll Tourisme

## Vue d'ensemble

Ce document présente la structure **complète** des répertoires pour une migration vers Clean Architecture + DDD du projet Atoll Tourisme.

> **Références:**
> - `.claude/rules/02-architecture-clean-ddd.md` - Architecture globale
> - `.claude/rules/13-ddd-patterns.md` - Patterns DDD détaillés
> - `.claude/examples/aggregate-examples.md` - Exemples d'Aggregates
> - `.claude/examples/value-object-examples.md` - Exemples de Value Objects

---

## Table des matières

1. [Architecture complète](#architecture-complète)
2. [Bounded Contexts détaillés](#bounded-contexts-détaillés)
3. [Principes d'organisation](#principes-dorganisation)
4. [Migration progressive](#migration-progressive)
5. [Estimation des fichiers](#estimation-des-fichiers)

---

## Architecture complète

### Structure src/ complète

```
src/
├── Domain/                                    # COUCHE DOMAINE (Pur PHP, 0 dépendance)
│   ├── Catalog/                              # BC: Catalogue des séjours
│   │   ├── Entity/
│   │   │   └── Sejour.php                    # Aggregate Root
│   │   ├── ValueObject/
│   │   │   ├── SejourId.php
│   │   │   ├── Destination.php
│   │   │   ├── DateRange.php
│   │   │   ├── Price.php
│   │   │   ├── Capacity.php
│   │   │   └── SlugValue.php
│   │   ├── Repository/
│   │   │   ├── SejourRepositoryInterface.php
│   │   │   └── SejourFinderInterface.php     # Pour queries read-only
│   │   ├── Service/
│   │   │   ├── SejourAvailabilityService.php # Calcul disponibilités
│   │   │   └── SejourPricingService.php      # Calcul tarifs saisonniers
│   │   ├── Event/
│   │   │   ├── SejourPublishedEvent.php
│   │   │   ├── SejourUnpublishedEvent.php
│   │   │   └── SejourCapacityChangedEvent.php
│   │   └── Exception/
│   │       ├── SejourNotFoundException.php
│   │       ├── SejourFullyBookedException.php
│   │       └── InvalidSejourException.php
│   │
│   ├── Reservation/                          # BC: Réservations
│   │   ├── Entity/
│   │   │   ├── Reservation.php               # Aggregate Root
│   │   │   └── Participant.php               # Entity (partie de l'Aggregate)
│   │   ├── ValueObject/
│   │   │   ├── ReservationId.php
│   │   │   ├── ParticipantId.php
│   │   │   ├── ReservationStatus.php         # Enum: EN_ATTENTE, CONFIRMEE, ANNULEE
│   │   │   ├── Money.php
│   │   │   ├── PersonName.php
│   │   │   ├── Gender.php                    # Enum: MALE, FEMALE, OTHER
│   │   │   ├── MedicalInfo.php               # Données médicales chiffrées
│   │   │   └── EmergencyContact.php
│   │   ├── Repository/
│   │   │   ├── ReservationRepositoryInterface.php
│   │   │   └── ReservationFinderInterface.php
│   │   ├── Service/
│   │   │   ├── ReservationPricingService.php # Calcul prix total
│   │   │   ├── ReservationValidator.php      # Validation règles métier
│   │   │   └── DiscountCalculator.php        # Calcul remises
│   │   ├── Pricing/                          # Sous-domaine: Politiques de remise
│   │   │   ├── DiscountPolicyInterface.php
│   │   │   └── Policy/
│   │   │       ├── FamilyDiscountPolicy.php  # Remise famille nombreuse
│   │   │       ├── EarlyBookingDiscountPolicy.php
│   │   │       ├── ChildDiscountPolicy.php   # -50% enfants
│   │   │       └── InfantDiscountPolicy.php  # Gratuit < 3 ans
│   │   ├── Event/
│   │   │   ├── ReservationCreatedEvent.php
│   │   │   ├── ReservationConfirmedEvent.php
│   │   │   ├── ReservationCancelledEvent.php
│   │   │   ├── ParticipantAddedEvent.php
│   │   │   └── ParticipantRemovedEvent.php
│   │   ├── Specification/
│   │   │   ├── ConfirmedReservationSpecification.php
│   │   │   ├── HighAmountReservationSpecification.php
│   │   │   └── PendingPaymentSpecification.php
│   │   └── Exception/
│   │       ├── ReservationNotFoundException.php
│   │       ├── InvalidReservationException.php
│   │       ├── ParticipantNotFoundException.php
│   │       └── MaxParticipantsExceededException.php
│   │
│   ├── Notification/                         # BC: Notifications
│   │   ├── Service/
│   │   │   └── NotificationServiceInterface.php
│   │   ├── ValueObject/
│   │   │   ├── EmailTemplate.php             # Enum: CONFIRMATION, CANCELLATION
│   │   │   ├── NotificationChannel.php       # Enum: EMAIL, SMS (futur)
│   │   │   └── NotificationStatus.php        # Enum: PENDING, SENT, FAILED
│   │   ├── Event/
│   │   │   ├── NotificationSentEvent.php
│   │   │   └── NotificationFailedEvent.php
│   │   └── Exception/
│   │       └── NotificationFailedException.php
│   │
│   └── Shared/                               # SHARED KERNEL (partagé entre BCs)
│       ├── ValueObject/
│       │   ├── Email.php                     # Validation email
│       │   ├── PhoneNumber.php               # Format FR: +33 ou 06/07
│       │   ├── PostalAddress.php             # Adresse postale complète
│       │   ├── PersonName.php                # Nom + Prénom
│       │   └── DateTimeValueObject.php       # Wrapper DateTimeImmutable
│       ├── Exception/
│       │   ├── DomainException.php           # Exception de base
│       │   ├── ValidationException.php
│       │   └── NotFoundException.php
│       └── Interface/
│           ├── AggregateRootInterface.php    # Marker interface
│           ├── DomainEventInterface.php      # getOccurredOn()
│           └── ValueObjectInterface.php      # equals()
│
├── Application/                              # COUCHE APPLICATION (Use Cases)
│   ├── Reservation/
│   │   ├── UseCase/
│   │   │   ├── CreateReservation/
│   │   │   │   ├── CreateReservationUseCase.php
│   │   │   │   ├── CreateReservationCommand.php
│   │   │   │   └── CreateReservationCommandHandler.php
│   │   │   ├── ConfirmReservation/
│   │   │   │   ├── ConfirmReservationUseCase.php
│   │   │   │   ├── ConfirmReservationCommand.php
│   │   │   │   └── ConfirmReservationCommandHandler.php
│   │   │   ├── CancelReservation/
│   │   │   │   ├── CancelReservationUseCase.php
│   │   │   │   ├── CancelReservationCommand.php
│   │   │   │   └── CancelReservationCommandHandler.php
│   │   │   ├── AddParticipant/
│   │   │   │   ├── AddParticipantUseCase.php
│   │   │   │   └── AddParticipantCommand.php
│   │   │   └── RemoveParticipant/
│   │   │       ├── RemoveParticipantUseCase.php
│   │   │       └── RemoveParticipantCommand.php
│   │   ├── Query/                            # CQRS: Read side
│   │   │   ├── GetReservationDetails/
│   │   │   │   ├── GetReservationDetailsQuery.php
│   │   │   │   ├── GetReservationDetailsQueryHandler.php
│   │   │   │   └── ReservationDetailsDTO.php
│   │   │   ├── ListReservations/
│   │   │   │   ├── ListReservationsQuery.php
│   │   │   │   ├── ListReservationsQueryHandler.php
│   │   │   │   └── ReservationListItemDTO.php
│   │   │   └── GetReservationStats/
│   │   │       ├── GetReservationStatsQuery.php
│   │   │       └── ReservationStatsDTO.php
│   │   └── EventHandler/
│   │       ├── SendConfirmationEmailOnReservationConfirmed.php
│   │       ├── SendCancellationEmailOnReservationCancelled.php
│   │       ├── UpdateSejourCapacityOnReservationConfirmed.php
│   │       └── UpdateStatisticsOnReservationCreated.php
│   │
│   ├── Catalog/
│   │   ├── UseCase/
│   │   │   ├── PublishSejour/
│   │   │   │   ├── PublishSejourUseCase.php
│   │   │   │   └── PublishSejourCommand.php
│   │   │   ├── UnpublishSejour/
│   │   │   │   ├── UnpublishSejourUseCase.php
│   │   │   │   └── UnpublishSejourCommand.php
│   │   │   └── UpdateSejourCapacity/
│   │   │       ├── UpdateSejourCapacityUseCase.php
│   │   │       └── UpdateSejourCapacityCommand.php
│   │   ├── Query/
│   │   │   ├── SearchSejours/
│   │   │   │   ├── SearchSejoursQuery.php
│   │   │   │   ├── SearchSejoursQueryHandler.php
│   │   │   │   └── SejourSearchResultDTO.php
│   │   │   └── GetSejourDetails/
│   │   │       ├── GetSejourDetailsQuery.php
│   │   │       └── SejourDetailsDTO.php
│   │   └── EventHandler/
│   │       └── InvalidateCacheOnSejourPublished.php
│   │
│   └── Notification/
│       ├── UseCase/
│       │   └── SendEmail/
│       │       ├── SendEmailUseCase.php
│       │       └── SendEmailCommand.php
│       └── EventHandler/
│           └── LogNotificationFailure.php
│
├── Infrastructure/                           # COUCHE INFRASTRUCTURE (Technique)
│   ├── Persistence/
│   │   ├── Doctrine/
│   │   │   ├── Repository/
│   │   │   │   ├── DoctrineReservationRepository.php
│   │   │   │   ├── DoctrineReservationFinder.php
│   │   │   │   ├── DoctrineSejourRepository.php
│   │   │   │   └── DoctrineSejourFinder.php
│   │   │   ├── Type/                         # Custom Doctrine Types
│   │   │   │   ├── EmailType.php
│   │   │   │   ├── MoneyType.php
│   │   │   │   ├── ReservationIdType.php
│   │   │   │   ├── SejourIdType.php
│   │   │   │   ├── ParticipantIdType.php
│   │   │   │   ├── PhoneNumberType.php
│   │   │   │   ├── ReservationStatusType.php
│   │   │   │   └── GenderType.php
│   │   │   ├── Mapping/                      # XML/YAML Mappings (pas annotations)
│   │   │   │   ├── Reservation.orm.xml
│   │   │   │   ├── Participant.orm.xml
│   │   │   │   └── Sejour.orm.xml
│   │   │   └── Migration/                    # Migrations Doctrine
│   │   │       └── Version20250126000000.php
│   │   └── InMemory/                         # Pour tests unitaires
│   │       ├── InMemoryReservationRepository.php
│   │       └── InMemorySejourRepository.php
│   │
│   ├── Notification/
│   │   ├── EmailNotificationService.php      # Implémentation NotificationServiceInterface
│   │   ├── Mailer/
│   │   │   ├── SymfonyMailerAdapter.php
│   │   │   └── Template/
│   │   │       ├── ReservationConfirmationTemplate.php
│   │   │       ├── ReservationCancellationTemplate.php
│   │   │       └── AdminNotificationTemplate.php
│   │   └── Message/                          # Symfony Messenger
│   │       ├── SendReservationConfirmationEmail.php
│   │       ├── SendReservationCancellationEmail.php
│   │       └── Handler/
│   │           ├── SendReservationConfirmationEmailHandler.php
│   │           └── SendReservationCancellationEmailHandler.php
│   │
│   ├── Cache/
│   │   ├── RedisSejourCacheAdapter.php
│   │   ├── RedisReservationCacheAdapter.php
│   │   └── RedisCacheWarmer.php
│   │
│   ├── EventBus/
│   │   ├── SymfonyEventBusAdapter.php        # Wrapper Symfony EventDispatcher
│   │   └── Middleware/
│   │       └── DomainEventDispatcherMiddleware.php
│   │
│   ├── Http/
│   │   └── Client/
│   │       └── ExternalApiClient.php         # Pour intégrations futures
│   │
│   └── Security/
│       ├── Encryption/
│       │   ├── MedicalDataEncryptor.php      # Chiffrement données médicales (RGPD)
│       │   └── EncryptionKeyProvider.php
│       └── Voter/
│           └── ReservationVoter.php          # Security voters Symfony
│
└── Presentation/                             # COUCHE PRÉSENTATION (UI)
    ├── Controller/
    │   ├── Web/
    │   │   ├── HomeController.php
    │   │   ├── SejourController.php          # Liste, détails séjours
    │   │   ├── ReservationController.php     # Formulaire réservation
    │   │   └── AvantApresController.php      # Page Avant/Après
    │   ├── Api/                              # REST API (futur)
    │   │   ├── ReservationApiController.php
    │   │   └── SejourApiController.php
    │   └── Admin/
    │       ├── DashboardController.php       # EasyAdmin Dashboard
    │       ├── ReservationCrudController.php
    │       ├── ParticipantCrudController.php
    │       ├── SejourCrudController.php
    │       └── AvisSejourCrudController.php
    │
    ├── Form/
    │   ├── ReservationFormType.php
    │   ├── ParticipantType.php
    │   └── DataTransformer/
    │       ├── MoneyTransformer.php
    │       └── EmailTransformer.php
    │
    ├── Twig/
    │   ├── Component/
    │   │   ├── ReservationForm.php           # LiveComponent
    │   │   └── SejourCard.php
    │   ├── Extension/
    │   │   ├── MoneyExtension.php            # {{ money|euros }}
    │   │   └── DateRangeExtension.php
    │   └── Runtime/
    │       └── SejourRuntime.php
    │
    ├── Command/                              # CLI Symfony Console
    │   ├── ImportSejoursCommand.php
    │   ├── SendPendingNotificationsCommand.php
    │   └── GenerateReservationReportCommand.php
    │
    └── Validator/                            # Contraintes Symfony Validator
        ├── Constraints/
        │   ├── ValidReservation.php
        │   ├── ValidParticipant.php
        │   └── ValidSejourDates.php
        └── ConstraintsValidator/
            ├── ValidReservationValidator.php
            ├── ValidParticipantValidator.php
            └── ValidSejourDatesValidator.php
```

---

## Bounded Contexts détaillés

### 1. Catalog (Catalogue des séjours)

**Responsabilité:** Gestion du catalogue des séjours, destinations, tarifs, disponibilités.

**Ubiquitous Language:**
- **Séjour** : Voyage organisé avec dates, destination, capacité
- **Destination** : Lieu du séjour (ville, pays, région)
- **Capacité** : Nombre de places disponibles
- **Tarif** : Prix par personne selon saison
- **Publication** : Rendre un séjour visible/réservable

**Entities:**
- `Sejour` (Aggregate Root)

**Value Objects:**
- `SejourId`, `Destination`, `DateRange`, `Price`, `Capacity`, `SlugValue`

**Domain Services:**
- `SejourAvailabilityService` : Calcul places restantes
- `SejourPricingService` : Calcul tarifs saisonniers

**Events:**
- `SejourPublishedEvent`, `SejourUnpublishedEvent`, `SejourCapacityChangedEvent`

**Use Cases:**
- Publier un séjour
- Retirer un séjour de la vente
- Mettre à jour la capacité
- Rechercher des séjours (Query)

---

### 2. Reservation (Réservations)

**Responsabilité:** Gestion complète des réservations et participants.

**Ubiquitous Language:**
- **Réservation** : Demande de participation à un séjour
- **Participant** : Personne inscrite (identité, infos médicales)
- **Statut** : EN_ATTENTE, CONFIRMEE, ANNULEE, TERMINEE
- **Montant** : Prix total calculé avec remises
- **Remise** : Réduction (famille nombreuse, anticipée, enfant)

**Entities:**
- `Reservation` (Aggregate Root)
- `Participant` (Entity, partie de l'Aggregate)

**Value Objects:**
- `ReservationId`, `ParticipantId`, `ReservationStatus`, `Money`, `PersonName`, `Gender`, `MedicalInfo`, `EmergencyContact`

**Domain Services:**
- `ReservationPricingService` : Calcul prix total
- `ReservationValidator` : Validation règles métier
- `DiscountCalculator` : Calcul remises

**Pricing Policies:**
- `FamilyDiscountPolicy` : -10% si 3+ participants
- `EarlyBookingDiscountPolicy` : -15% si réservation > 2 mois avant
- `ChildDiscountPolicy` : -50% pour enfants (< 18 ans)
- `InfantDiscountPolicy` : Gratuit pour bébés (< 3 ans)

**Events:**
- `ReservationCreatedEvent`, `ReservationConfirmedEvent`, `ReservationCancelledEvent`
- `ParticipantAddedEvent`, `ParticipantRemovedEvent`

**Use Cases:**
- Créer une réservation
- Confirmer une réservation
- Annuler une réservation
- Ajouter/Retirer un participant
- Consulter détails réservation (Query)
- Lister réservations avec filtres (Query)

---

### 3. Notification (Notifications)

**Responsabilité:** Envoi d'emails, notifications clients et admin.

**Ubiquitous Language:**
- **Notification** : Message envoyé à un destinataire
- **Template** : Modèle de message (confirmation, annulation)
- **Canal** : Email (SMS futur)
- **Statut** : PENDING, SENT, FAILED

**Value Objects:**
- `EmailTemplate`, `NotificationChannel`, `NotificationStatus`

**Services:**
- `NotificationServiceInterface` (Domain)
- `EmailNotificationService` (Infrastructure)

**Events:**
- `NotificationSentEvent`, `NotificationFailedEvent`

**Use Cases:**
- Envoyer email de confirmation
- Envoyer email d'annulation
- Envoyer notification admin (nouvelle réservation)

---

## Principes d'organisation

### 1. Règle de dépendance

```
Domain (0 dépendance)
  ↑
Application (dépend de Domain)
  ↑
Infrastructure (dépend de Domain + Application)
  ↑
Presentation (dépend de Application + Infrastructure)
```

### 2. Testabilité par couche

| Couche | Type de test | Isolement |
|--------|-------------|-----------|
| **Domain** | Unit (PHPUnit) | Complet (0 dépendance) |
| **Application** | Integration (mocks) | Use Cases avec repo mocks |
| **Infrastructure** | Integration (DB) | Avec base de données test |
| **Presentation** | Functional (Behat) | E2E avec navigateur |

### 3. Nommage strict

| Type | Suffixe | Exemple |
|------|---------|---------|
| Aggregate Root | Aucun | `Reservation`, `Sejour` |
| Entity | Aucun | `Participant` |
| Value Object | Aucun | `Money`, `Email`, `ReservationId` |
| Repository Interface | `Interface` | `ReservationRepositoryInterface` |
| Repository Impl | `Repository` | `DoctrineReservationRepository` |
| Finder Interface | `Interface` | `ReservationFinderInterface` |
| Finder Impl | `Finder` | `DoctrineReservationFinder` |
| Domain Service | `Service` | `ReservationPricingService` |
| Use Case | `UseCase` | `CreateReservationUseCase` |
| Command | `Command` | `CreateReservationCommand` |
| Query | `Query` | `GetReservationDetailsQuery` |
| Handler | `Handler` ou `QueryHandler` | `CreateReservationCommandHandler` |
| Event | `Event` | `ReservationConfirmedEvent` |
| DTO | `DTO` | `ReservationDetailsDTO` |
| Exception | `Exception` | `ReservationNotFoundException` |

---

## Migration progressive

### Phase 1: Shared Kernel (Semaine 1)

Créer les Value Objects partagés en priorité:

```
Domain/Shared/ValueObject/
├── Email.php
├── PhoneNumber.php
├── PersonName.php
└── PostalAddress.php
```

**Avantage:** Utilisables immédiatement dans le code existant.

### Phase 2: Reservation Bounded Context (Semaine 2-3)

Migrer `Reservation` et `Participant` vers DDD:

1. Créer `Domain/Reservation/Entity/` avec Aggregate Root
2. Créer Value Objects (`ReservationId`, `Money`, `ReservationStatus`)
3. Créer Repository Interface
4. Implémenter `Infrastructure/Persistence/Doctrine/Repository/`
5. Migrer Use Cases

### Phase 3: Catalog Bounded Context (Semaine 4)

Migrer `Sejour`:

1. Créer `Domain/Catalog/Entity/Sejour.php`
2. Créer Value Objects (`SejourId`, `Destination`, `DateRange`)
3. Domain Services (`SejourAvailabilityService`)

### Phase 4: Application Layer (Semaine 5-6)

Créer les Use Cases:

- Commands (write): `CreateReservation`, `ConfirmReservation`, etc.
- Queries (read): `GetReservationDetails`, `ListReservations`
- Event Handlers

### Phase 5: Notification Bounded Context (Semaine 7)

Migrer système de notifications:

- Async avec Symfony Messenger
- Domain Events → Event Handlers → Notifications

---

## Estimation des fichiers

### Nombre de fichiers par couche

| Couche | Répertoire | Fichiers estimés |
|--------|-----------|------------------|
| **Domain** | | **~120 fichiers** |
| | Domain/Catalog/ | 15 |
| | Domain/Reservation/ | 35 |
| | Domain/Notification/ | 10 |
| | Domain/Shared/ | 15 |
| **Application** | | **~50 fichiers** |
| | Application/Reservation/ | 30 |
| | Application/Catalog/ | 15 |
| | Application/Notification/ | 5 |
| **Infrastructure** | | **~40 fichiers** |
| | Infrastructure/Persistence/ | 20 |
| | Infrastructure/Notification/ | 10 |
| | Infrastructure/Cache/ | 3 |
| | Infrastructure/EventBus/ | 2 |
| | Infrastructure/Security/ | 5 |
| **Presentation** | | **~30 fichiers** |
| | Presentation/Controller/ | 10 |
| | Presentation/Form/ | 5 |
| | Presentation/Twig/ | 8 |
| | Presentation/Command/ | 3 |
| | Presentation/Validator/ | 4 |
| **TOTAL** | | **~240 fichiers** |

### Ratio Code actuel vs Clean Architecture

- **Code actuel:** ~50 fichiers (MVC classique)
- **Clean Architecture:** ~240 fichiers
- **Ratio:** 5x plus de fichiers

**Pourquoi?**
- Séparation stricte des responsabilités
- Interfaces + Implémentations
- Commands/Queries CQRS
- Value Objects explicites
- Event Handlers dédiés

**Bénéfices:**
- ✅ Testabilité unitaire complète
- ✅ Évolutivité facilitée
- ✅ Maintenance simplifiée (SRP)
- ✅ Logique métier protégée
- ✅ Migration progressive possible

---

## Validation architecture

### Deptrac

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

        # ✅ Presentation dépend de tout
        Presentation:
            - Application
            - Infrastructure
            - Domain  # Pour VOs dans DTOs
```

**Commande:**
```bash
make deptrac
```

---

## Checklist migration

### Avant de créer un nouveau fichier

- [ ] **Couche:** Identifier la couche correcte (Domain/Application/Infrastructure/Presentation)
- [ ] **Bounded Context:** Identifier le BC (Catalog, Reservation, Notification, Shared)
- [ ] **Type:** Entity, VO, Service, Repository, UseCase, etc.
- [ ] **Nommage:** Respecter le suffixe obligatoire
- [ ] **Dépendances:** Vérifier règle de dépendance
- [ ] **Tests:** Créer test unitaire AVANT implémentation (TDD)

### Après création

- [ ] **PHPStan:** `make phpstan` (niveau max)
- [ ] **CS-Fixer:** `make cs-fix`
- [ ] **Deptrac:** `make deptrac`
- [ ] **Tests:** `make test`
- [ ] **Couverture:** Vérifier couverture > 80%

---

**Date de création:** 2025-11-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
