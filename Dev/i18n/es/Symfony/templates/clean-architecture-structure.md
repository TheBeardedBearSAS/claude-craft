# Estructura Clean Architecture + DDD - Atoll Tourisme

## Descripción General

Este documento presenta la estructura **completa** de directorios para una migración hacia Clean Architecture + DDD del proyecto Atoll Tourisme.

> **Referencias:**
> - `.claude/rules/02-architecture-clean-ddd.md` - Arquitectura global
> - `.claude/rules/13-ddd-patterns.md` - Patrones DDD detallados
> - `.claude/examples/aggregate-examples.md` - Ejemplos de Aggregates
> - `.claude/examples/value-object-examples.md` - Ejemplos de Value Objects

---

## Tabla de contenidos

1. [Arquitectura completa](#arquitectura-completa)
2. [Bounded Contexts detallados](#bounded-contexts-detallados)
3. [Principios de organización](#principios-de-organización)
4. [Migración progresiva](#migración-progresiva)
5. [Estimación de archivos](#estimación-de-archivos)

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
│   │   │   ├── Capacity.php
│   │   │   └── SlugValue.php
│   │   ├── Repository/
│   │   │   ├── SejourRepositoryInterface.php
│   │   │   └── SejourFinderInterface.php     # Para queries de solo lectura
│   │   ├── Service/
│   │   │   ├── SejourAvailabilityService.php # Cálculo de disponibilidades
│   │   │   └── SejourPricingService.php      # Cálculo de tarifas estacionales
│   │   ├── Event/
│   │   │   ├── SejourPublishedEvent.php
│   │   │   ├── SejourUnpublishedEvent.php
│   │   │   └── SejourCapacityChangedEvent.php
│   │   └── Exception/
│   │       ├── SejourNotFoundException.php
│   │       ├── SejourFullyBookedException.php
│   │       └── InvalidSejourException.php
│   │
│   ├── Reservation/                          # BC: Reservas
│   │   ├── Entity/
│   │   │   ├── Reservation.php               # Aggregate Root
│   │   │   └── Participant.php               # Entity (parte del Aggregate)
│   │   ├── ValueObject/
│   │   │   ├── ReservationId.php
│   │   │   ├── ParticipantId.php
│   │   │   ├── ReservationStatus.php         # Enum: EN_ATTENTE, CONFIRMEE, ANNULEE
│   │   │   ├── Money.php
│   │   │   ├── PersonName.php
│   │   │   ├── Gender.php                    # Enum: MALE, FEMALE, OTHER
│   │   │   ├── MedicalInfo.php               # Datos médicos cifrados
│   │   │   └── EmergencyContact.php
│   │   ├── Repository/
│   │   │   ├── ReservationRepositoryInterface.php
│   │   │   └── ReservationFinderInterface.php
│   │   ├── Service/
│   │   │   ├── ReservationPricingService.php # Cálculo de precio total
│   │   │   ├── ReservationValidator.php      # Validación reglas de negocio
│   │   │   └── DiscountCalculator.php        # Cálculo de descuentos
│   │   ├── Pricing/                          # Subdominio: Políticas de descuento
│   │   │   ├── DiscountPolicyInterface.php
│   │   │   └── Policy/
│   │   │       ├── FamilyDiscountPolicy.php  # Descuento familia numerosa
│   │   │       ├── EarlyBookingDiscountPolicy.php
│   │   │       ├── ChildDiscountPolicy.php   # -50% niños
│   │   │       └── InfantDiscountPolicy.php  # Gratuito < 3 años
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
│   ├── Notification/                         # BC: Notificaciones
│   │   ├── Service/
│   │   │   └── NotificationServiceInterface.php
│   │   ├── ValueObject/
│   │   │   ├── EmailTemplate.php             # Enum: CONFIRMATION, CANCELLATION
│   │   │   ├── NotificationChannel.php       # Enum: EMAIL, SMS (futuro)
│   │   │   └── NotificationStatus.php        # Enum: PENDING, SENT, FAILED
│   │   ├── Event/
│   │   │   ├── NotificationSentEvent.php
│   │   │   └── NotificationFailedEvent.php
│   │   └── Exception/
│   │       └── NotificationFailedException.php
│   │
│   └── Shared/                               # SHARED KERNEL (compartido entre BCs)
│       ├── ValueObject/
│       │   ├── Email.php                     # Validación email
│       │   ├── PhoneNumber.php               # Formato FR: +33 o 06/07
│       │   ├── PostalAddress.php             # Dirección postal completa
│       │   ├── PersonName.php                # Nombre + Apellido
│       │   └── DateTimeValueObject.php       # Wrapper DateTimeImmutable
│       ├── Exception/
│       │   ├── DomainException.php           # Excepción base
│       │   ├── ValidationException.php
│       │   └── NotFoundException.php
│       └── Interface/
│           ├── AggregateRootInterface.php    # Marker interface
│           ├── DomainEventInterface.php      # getOccurredOn()
│           └── ValueObjectInterface.php      # equals()
│
├── Application/                              # CAPA APPLICATION (Use Cases)
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
│   │   ├── Query/                            # CQRS: Lado de lectura
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
├── Infrastructure/                           # CAPA INFRASTRUCTURE (Técnica)
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
│   │   │   ├── Mapping/                      # Mappings XML/YAML (sin anotaciones)
│   │   │   │   ├── Reservation.orm.xml
│   │   │   │   ├── Participant.orm.xml
│   │   │   │   └── Sejour.orm.xml
│   │   │   └── Migration/                    # Migraciones Doctrine
│   │   │       └── Version20250126000000.php
│   │   └── InMemory/                         # Para tests unitarios
│   │       ├── InMemoryReservationRepository.php
│   │       └── InMemorySejourRepository.php
│   │
│   ├── Notification/
│   │   ├── EmailNotificationService.php      # Implementación NotificationServiceInterface
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
│   │       └── ExternalApiClient.php         # Para integraciones futuras
│   │
│   └── Security/
│       ├── Encryption/
│       │   ├── MedicalDataEncryptor.php      # Cifrado datos médicos (RGPD)
│       │   └── EncryptionKeyProvider.php
│       └── Voter/
│           └── ReservationVoter.php          # Security voters Symfony
│
└── Presentation/                             # CAPA PRESENTACIÓN (UI)
    ├── Controller/
    │   ├── Web/
    │   │   ├── HomeController.php
    │   │   ├── SejourController.php          # Lista, detalles estancias
    │   │   ├── ReservationController.php     # Formulario de reserva
    │   │   └── AvantApresController.php      # Página Antes/Después
    │   ├── Api/                              # REST API (futuro)
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
    └── Validator/                            # Restricciones Symfony Validator
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

## Bounded Contexts detallados

### 1. Catalog (Catálogo de estancias)

**Responsabilidad:** Gestión del catálogo de estancias, destinos, tarifas, disponibilidades.

**Lenguaje ubicuo:**
- **Séjour (Estancia):** Viaje organizado con fechas, destino, capacidad
- **Destination (Destino):** Lugar de la estancia (ciudad, país, región)
- **Capacité (Capacidad):** Número de plazas disponibles
- **Tarif (Tarifa):** Precio por persona según temporada
- **Publication (Publicación):** Hacer una estancia visible/reservable

**Entidades:**
- `Sejour` (Aggregate Root)

**Value Objects:**
- `SejourId`, `Destination`, `DateRange`, `Price`, `Capacity`, `SlugValue`

**Domain Services:**
- `SejourAvailabilityService` : Cálculo de plazas restantes
- `SejourPricingService` : Cálculo de tarifas estacionales

**Eventos:**
- `SejourPublishedEvent`, `SejourUnpublishedEvent`, `SejourCapacityChangedEvent`

**Casos de uso:**
- Publicar una estancia
- Retirar una estancia de la venta
- Actualizar la capacidad
- Buscar estancias (Query)

---

### 2. Reservation (Reservas)

**Responsabilidad:** Gestión completa de reservas y participantes.

**Lenguaje ubicuo:**
- **Réservation (Reserva):** Solicitud de participación en una estancia
- **Participant (Participante):** Persona inscrita (identidad, info médica)
- **Statut (Estado):** EN_ATTENTE, CONFIRMEE, ANNULEE, TERMINEE
- **Montant (Monto):** Precio total calculado con descuentos
- **Remise (Descuento):** Reducción (familia numerosa, anticipado, niño)

**Entidades:**
- `Reservation` (Aggregate Root)
- `Participant` (Entity, parte del Aggregate)

**Value Objects:**
- `ReservationId`, `ParticipantId`, `ReservationStatus`, `Money`, `PersonName`, `Gender`, `MedicalInfo`, `EmergencyContact`

**Domain Services:**
- `ReservationPricingService` : Cálculo de precio total
- `ReservationValidator` : Validación reglas de negocio
- `DiscountCalculator` : Cálculo de descuentos

**Políticas de Precio:**
- `FamilyDiscountPolicy` : -10% si 3+ participantes
- `EarlyBookingDiscountPolicy` : -15% si reserva > 2 meses antes
- `ChildDiscountPolicy` : -50% para niños (< 18 años)
- `InfantDiscountPolicy` : Gratuito para bebés (< 3 años)

**Eventos:**
- `ReservationCreatedEvent`, `ReservationConfirmedEvent`, `ReservationCancelledEvent`
- `ParticipantAddedEvent`, `ParticipantRemovedEvent`

**Casos de uso:**
- Crear una reserva
- Confirmar una reserva
- Cancelar una reserva
- Añadir/Quitar un participante
- Consultar detalles de reserva (Query)
- Listar reservas con filtros (Query)

---

### 3. Notification (Notificaciones)

**Responsabilidad:** Envío de emails, notificaciones a clientes y admin.

**Lenguaje ubicuo:**
- **Notification (Notificación):** Mensaje enviado a un destinatario
- **Template (Plantilla):** Modelo de mensaje (confirmación, cancelación)
- **Canal:** Email (SMS futuro)
- **Statut (Estado):** PENDING, SENT, FAILED

**Value Objects:**
- `EmailTemplate`, `NotificationChannel`, `NotificationStatus`

**Servicios:**
- `NotificationServiceInterface` (Domain)
- `EmailNotificationService` (Infrastructure)

**Eventos:**
- `NotificationSentEvent`, `NotificationFailedEvent`

**Casos de uso:**
- Enviar email de confirmación
- Enviar email de cancelación
- Enviar notificación admin (nueva reserva)

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

### 2. Testabilidad por capa

| Capa | Tipo de test | Aislamiento |
|--------|-------------|-----------|
| **Domain** | Unit (PHPUnit) | Completo (0 dependencias) |
| **Application** | Integration (mocks) | Use Cases con repo mocks |
| **Infrastructure** | Integration (BD) | Con base de datos test |
| **Presentation** | Functional (Behat) | E2E con navegador |

### 3. Nomenclatura estricta

| Tipo | Sufijo | Ejemplo |
|------|---------|---------|
| Aggregate Root | Ninguno | `Reservation`, `Sejour` |
| Entity | Ninguno | `Participant` |
| Value Object | Ninguno | `Money`, `Email`, `ReservationId` |
| Repository Interface | `Interface` | `ReservationRepositoryInterface` |
| Repository Impl | `Repository` | `DoctrineReservationRepository` |
| Finder Interface | `Interface` | `ReservationFinderInterface` |
| Finder Impl | `Finder` | `DoctrineReservationFinder` |
| Domain Service | `Service` | `ReservationPricingService` |
| Use Case | `UseCase` | `CreateReservationUseCase` |
| Command | `Command` | `CreateReservationCommand` |
| Query | `Query` | `GetReservationDetailsQuery` |
| Handler | `Handler` o `QueryHandler` | `CreateReservationCommandHandler` |
| Event | `Event` | `ReservationConfirmedEvent` |
| DTO | `DTO` | `ReservationDetailsDTO` |
| Exception | `Exception` | `ReservationNotFoundException` |

---

## Migración progresiva

### Fase 1: Shared Kernel (Semana 1)

Crear los Value Objects compartidos prioritariamente:

```
Domain/Shared/ValueObject/
├── Email.php
├── PhoneNumber.php
├── PersonName.php
└── PostalAddress.php
```

**Ventaja:** Utilizables inmediatamente en el código existente.

### Fase 2: Reservation Bounded Context (Semana 2-3)

Migrar `Reservation` y `Participant` hacia DDD:

1. Crear `Domain/Reservation/Entity/` con Aggregate Root
2. Crear Value Objects (`ReservationId`, `Money`, `ReservationStatus`)
3. Crear Repository Interface
4. Implementar `Infrastructure/Persistence/Doctrine/Repository/`
5. Migrar Use Cases

### Fase 3: Catalog Bounded Context (Semana 4)

Migrar `Sejour`:

1. Crear `Domain/Catalog/Entity/Sejour.php`
2. Crear Value Objects (`SejourId`, `Destination`, `DateRange`)
3. Domain Services (`SejourAvailabilityService`)

### Fase 4: Application Layer (Semana 5-6)

Crear los Use Cases:

- Commands (write): `CreateReservation`, `ConfirmReservation`, etc.
- Queries (read): `GetReservationDetails`, `ListReservations`
- Event Handlers

### Fase 5: Notification Bounded Context (Semana 7)

Migrar el sistema de notificaciones:

- Asíncrono con Symfony Messenger
- Domain Events → Event Handlers → Notificaciones

---

## Estimación de archivos

### Número de archivos por capa

| Capa | Directorio | Archivos estimados |
|--------|-----------|------------------|
| **Domain** | | **~120 archivos** |
| | Domain/Catalog/ | 15 |
| | Domain/Reservation/ | 35 |
| | Domain/Notification/ | 10 |
| | Domain/Shared/ | 15 |
| **Application** | | **~50 archivos** |
| | Application/Reservation/ | 30 |
| | Application/Catalog/ | 15 |
| | Application/Notification/ | 5 |
| **Infrastructure** | | **~40 archivos** |
| | Infrastructure/Persistence/ | 20 |
| | Infrastructure/Notification/ | 10 |
| | Infrastructure/Cache/ | 3 |
| | Infrastructure/EventBus/ | 2 |
| | Infrastructure/Security/ | 5 |
| **Presentation** | | **~30 archivos** |
| | Presentation/Controller/ | 10 |
| | Presentation/Form/ | 5 |
| | Presentation/Twig/ | 8 |
| | Presentation/Command/ | 3 |
| | Presentation/Validator/ | 4 |
| **TOTAL** | | **~240 archivos** |

### Ratio Código actual vs Clean Architecture

- **Código actual:** ~50 archivos (MVC clásico)
- **Clean Architecture:** ~240 archivos
- **Ratio:** 5x más archivos

**¿Por qué?**
- Separación estricta de responsabilidades
- Interfaces + Implementaciones
- Commands/Queries CQRS
- Value Objects explícitos
- Event Handlers dedicados

**Beneficios:**
- ✅ Testabilidad unitaria completa
- ✅ Evolución facilitada
- ✅ Mantenimiento simplificado (SRP)
- ✅ Lógica de negocio protegida
- ✅ Migración progresiva posible

---

## Validación arquitectura

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
        # ✅ Domain no depende de NADA
        Domain: []

        # ✅ Application depende solo de Domain
        Application:
            - Domain

        # ✅ Infrastructure depende de Domain y Application
        Infrastructure:
            - Domain
            - Application

        # ✅ Presentation depende de todo
        Presentation:
            - Application
            - Infrastructure
            - Domain  # Para VOs en DTOs
```

**Comando:**
```bash
make deptrac
```

---

## Checklist de migración

### Antes de crear un nuevo archivo

- [ ] **Capa:** Identificar la capa correcta (Domain/Application/Infrastructure/Presentation)
- [ ] **Bounded Context:** Identificar el BC (Catalog, Reservation, Notification, Shared)
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
