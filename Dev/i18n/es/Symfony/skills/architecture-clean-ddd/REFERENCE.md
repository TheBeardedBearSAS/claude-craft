# Arquitectura Clean + DDD + Hexagonal - Atoll Tourisme

## Descripción General

Este documento define la arquitectura **obligatoria** del proyecto Atoll Tourisme, basada en:
- **Clean Architecture** (Uncle Bob)
- **Domain-Driven Design** (Eric Evans)
- **Arquitectura Hexagonal / Puertos y Adaptadores** (Alistair Cockburn)

> **Referencias:**
> - `01-symfony-best-practices.md` - Estándares Symfony
> - `04-solid-principles.md` - Principios SOLID
> - `13-ddd-patterns.md` - Patrones DDD detallados
> - `08-quality-tools.md` - Validación arquitectura (Deptrac)

---

## Tabla de contenidos

1. [Principios arquitecturales](#principios-arquitecturales)
2. [Estructura de directorios](#estructura-de-directorios)
3. [Bounded Contexts](#bounded-contexts)
4. [Capas de la arquitectura](#capas-de-la-arquitectura)
5. [Flujo de datos](#flujo-de-datos)
6. [Reglas de dependencias](#reglas-de-dependencias)
7. [Checklist de validación](#checklist-de-validación)

---

## Principios arquitecturales

### 1. Independencia del dominio de negocio

El código de negocio **no debe depender** de:
- ❌ Frameworks (Symfony, Doctrine)
- ❌ UI (Controllers, Forms, Templates)
- ❌ Base de datos (PostgreSQL, MySQL)
- ❌ Servicios externos (APIs, Email, SMS)

### 2. Regla de dependencia

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   DOMINIO (Business Logic)                      │
│   ↑                                              │
│   │ depende de                                   │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   APPLICATION (Use Cases)                        │
│   ↑                                              │
│   │ depende de                                   │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   INFRASTRUCTURE (Técnica)                       │
│   ↑                                              │
│   │ utilizado por                                │
│   │                                              │
├───┴──────────────────────────────────────────────┤
│   PRESENTACIÓN (UI)                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Regla de oro:** Las dependencias siempre apuntan hacia el interior (hacia el dominio).

### 3. Testabilidad

Cada capa debe ser testable **independientemente**:
- **Dominio:** Tests unitarios sin Symfony/Doctrine
- **Aplicación:** Tests de integración con mocks
- **Infraestructura:** Tests de integración con base de datos
- **Presentación:** Tests funcionales E2E

---

## Estructura de directorios

### Estructura actual Atoll Tourisme

```
src/
├── Domain/                          # CAPA DOMINIO (Business Logic)
│   ├── Catalog/                     # Bounded Context: Catálogo
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
│   ├── Reservation/                 # Bounded Context: Reserva
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
│   │   ├── Pricing/                 # Subdominio Pricing
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
│   ├── Notification/                # Bounded Context: Notificaciones
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
├── Application/                     # CAPA APPLICATION (Use Cases)
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
├── Infrastructure/                  # CAPA INFRASTRUCTURE (Técnica)
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
│   │   └── InMemory/                # Para tests
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
└── Presentation/                    # CAPA PRESENTACIÓN (UI)
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

### Reglas de nomenclatura

| Capa | Sufijo | Ejemplo |
|--------|---------|---------|
| Entity | Sin sufijo | `Reservation`, `Sejour` |
| Value Object | Sin sufijo | `Money`, `Email`, `ReservationId` |
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

**Nota:** Este es un extracto traducido. El documento completo incluye ejemplos de código detallados, flujos de datos, validación con Deptrac y checklists de validación.

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
