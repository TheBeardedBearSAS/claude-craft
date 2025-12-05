# Estructura Clean Architecture + DDD - Atoll Tourisme

## Overview

Este documento presenta la estructura **completa** de directorios para una migración hacia Clean Architecture + DDD del proyecto Atoll Tourisme.

> **Referencias:**
> - `.claude/rules/02-architecture-clean-ddd.md` - Arquitectura global
> - `.claude/rules/13-ddd-patterns.md` - Patrones DDD detallados
> - `.claude/examples/aggregate-examples.md` - Ejemplos de Aggregates
> - `.claude/examples/value-object-examples.md` - Ejemplos de Value Objects

---

## Arquitectura completa

### Estructura src/ completa

```
src/
├── Domain/                                    # CAPA DOMINIO (PHP puro, 0 dependencias)
│   ├── Catalog/                              # BC: Catálogo de estancias
│   │   ├── Entity/
│   │   │   └── Sejour.php                    # Aggregate Root
│   │   ├── ValueObject/
│   │   │   ├── SejourId.php
│   │   │   ├── Destination.php
│   │   │   ├── DateRange.php
│   │   │   ├── Price.php
│   │   │   └── Capacity.php
│   │   ├── Repository/
│   │   │   ├── SejourRepositoryInterface.php
│   │   │   └── SejourFinderInterface.php
│   │   ├── Service/
│   │   │   ├── SejourAvailabilityService.php
│   │   │   └── SejourPricingService.php
│   │   └── Event/
│   │       ├── SejourPublishedEvent.php
│   │       └── SejourCapacityChangedEvent.php
│   │
│   ├── Reservation/                          # BC: Reservas
│   │   ├── Entity/
│   │   │   ├── Reservation.php               # Aggregate Root
│   │   │   └── Participant.php
│   │   ├── ValueObject/
│   │   │   ├── ReservationId.php
│   │   │   ├── ReservationStatus.php
│   │   │   ├── Money.php
│   │   │   └── PersonName.php
│   │   ├── Repository/
│   │   │   └── ReservationRepositoryInterface.php
│   │   ├── Service/
│   │   │   ├── ReservationPricingService.php
│   │   │   └── DiscountCalculator.php
│   │   └── Event/
│   │       ├── ReservationCreatedEvent.php
│   │       ├── ReservationConfirmedEvent.php
│   │       └── ReservationCancelledEvent.php
│   │
│   └── Shared/                               # SHARED KERNEL
│       ├── ValueObject/
│       │   ├── Email.php
│       │   ├── PhoneNumber.php
│       │   └── PostalAddress.php
│       └── Exception/
│           ├── DomainException.php
│           └── ValidationException.php
│
├── Application/                              # CAPA APLICACIÓN (Casos de uso)
│   ├── Reservation/
│   │   ├── UseCase/
│   │   │   ├── CreateReservation/
│   │   │   │   ├── CreateReservationUseCase.php
│   │   │   │   └── CreateReservationCommand.php
│   │   │   └── ConfirmReservation/
│   │   │       ├── ConfirmReservationUseCase.php
│   │   │       └── ConfirmReservationCommand.php
│   │   ├── Query/
│   │   │   └── GetReservationDetails/
│   │   │       ├── GetReservationDetailsQuery.php
│   │   │       └── ReservationDetailsDTO.php
│   │   └── EventHandler/
│   │       └── SendConfirmationEmailOnReservationCreated.php
│   │
│   └── Catalog/
│       ├── UseCase/
│       │   └── PublishSejour/
│       │       ├── PublishSejourUseCase.php
│       │       └── PublishSejourCommand.php
│       └── Query/
│           └── SearchSejours/
│               ├── SearchSejoursQuery.php
│               └── SejourSearchResultDTO.php
│
├── Infrastructure/                           # CAPA INFRAESTRUCTURA (Técnica)
│   ├── Persistence/
│   │   └── Doctrine/
│   │       ├── Repository/
│   │       │   ├── DoctrineReservationRepository.php
│   │       │   └── DoctrineSejourRepository.php
│   │       ├── Type/
│   │       │   ├── EmailType.php
│   │       │   ├── MoneyType.php
│   │       │   └── ReservationStatusType.php
│   │       └── Mapping/
│   │           ├── Reservation.orm.xml
│   │           └── Sejour.orm.xml
│   │
│   ├── Notification/
│   │   ├── EmailNotificationService.php
│   │   └── Message/
│   │       └── SendReservationConfirmationEmail.php
│   │
│   └── EventBus/
│       └── SymfonyEventBusAdapter.php
│
└── Presentation/                             # CAPA PRESENTACIÓN (UI)
    ├── Controller/
    │   ├── Web/
    │   │   ├── HomeController.php
    │   │   └── ReservationController.php
    │   └── Admin/
    │       └── ReservationCrudController.php
    │
    ├── Form/
    │   ├── ReservationFormType.php
    │   └── ParticipantType.php
    │
    └── Command/
        └── ImportSejoursCommand.php
```

---

## Bounded Contexts detallados

### 1. Catalog (Catálogo de estancias)

**Responsabilidad:** Gestión del catálogo de estancias, destinos, tarifas, disponibilidades.

**Lenguaje ubicuo:**
- **Estancia (Séjour)** : Viaje organizado con fechas, destino, capacidad
- **Destino** : Lugar de la estancia (ciudad, país, región)
- **Capacidad** : Número de plazas disponibles
- **Tarifa** : Precio por persona según temporada

### 2. Reservation (Reservas)

**Responsabilidad:** Gestión completa de reservas y participantes.

**Lenguaje ubicuo:**
- **Reserva** : Solicitud de participación en una estancia
- **Participante** : Persona inscrita (identidad, información médica)
- **Estado** : EN_ESPERA, CONFIRMADA, CANCELADA, TERMINADA
- **Monto** : Precio total calculado con descuentos

---

## Principios de organización

### 1. Regla de dependencia

```
Domain (0 dependencias)
  ↑
Application (depende de Domain)
  ↑
Infrastructure (depende de Domain + Application)
  ↑
Presentation (depende de Application + Infrastructure)
```

### 2. Convención de nombres

| Tipo | Sufijo | Ejemplo |
|------|---------|---------|
| Aggregate Root | Ninguno | `Reservation`, `Sejour` |
| Value Object | Ninguno | `Money`, `Email` |
| Repository Interface | `Interface` | `ReservationRepositoryInterface` |
| Repository Impl | `Repository` | `DoctrineReservationRepository` |
| Use Case | `UseCase` | `CreateReservationUseCase` |
| Command | `Command` | `CreateReservationCommand` |
| Event | `Event` | `ReservationConfirmedEvent` |

---

## Migración progresiva

### Fase 1: Shared Kernel (Semana 1)
Crear los Value Objects compartidos prioritariamente

### Fase 2: Reservation Bounded Context (Semana 2-3)
Migrar `Reservation` y `Participant` hacia DDD

### Fase 3: Catalog Bounded Context (Semana 4)
Migrar `Sejour`

### Fase 4: Application Layer (Semana 5-6)
Crear los casos de uso

---

## Checklist de migración

### Antes de crear un nuevo archivo

- [ ] **Capa:** Identificar la capa correcta (Domain/Application/Infrastructure/Presentation)
- [ ] **Bounded Context:** Identificar el BC (Catalog, Reservation, Shared)
- [ ] **Tipo:** Entity, VO, Service, Repository, UseCase, etc.
- [ ] **Nombres:** Respetar el sufijo obligatorio
- [ ] **Dependencias:** Verificar regla de dependencia
- [ ] **Tests:** Crear test unitario ANTES de la implementación (TDD)

### Después de la creación

- [ ] **PHPStan:** `make phpstan` (nivel máximo)
- [ ] **CS-Fixer:** `make cs-fix`
- [ ] **Deptrac:** `make deptrac`
- [ ] **Tests:** `make test`
- [ ] **Cobertura:** Verificar cobertura > 80%

---

**Fecha de creación:** 2025-11-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
