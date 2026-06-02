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

## Bounded Contexts

El sistema Atoll Tourisme está dividido en 3 **Bounded Contexts** principales:

### 1. Catalog (Catálogo)

**Responsabilidad:** Gestión de las estancias, destinos, disponibilidades

**Lenguaje ubicuo:**
- **Séjour (Estancia):** Viaje organizado con fechas, destino, precio
- **Destination (Destino):** Lugar de la estancia (ciudad, país, región)
- **Disponibilité (Disponibilidad):** Plazas disponibles para una estancia
- **Saison (Temporada):** Período de validez de las tarifas

**Entidades principales:**
- `Sejour` (Aggregate Root)
- `Destination` (Value Object)
- `DateRange` (Value Object)

**Casos de uso:**
- Publicar una nueva estancia
- Buscar estancias
- Verificar disponibilidades
- Gestionar tarifas estacionales

### 2. Reservation (Reserva)

**Responsabilidad:** Gestión de reservas, participantes, pagos

**Lenguaje ubicuo:**
- **Réservation (Reserva):** Solicitud de participación en una estancia
- **Participant (Participante):** Persona inscrita (niño/adulto)
- **Statut (Estado):** Estado de la reserva (en espera, confirmada, cancelada)
- **Montant (Monto):** Precio total de la reserva
- **Remise (Descuento):** Reducción aplicada (familia numerosa, anticipado)

**Entidades principales:**
- `Reservation` (Aggregate Root)
- `Participant` (Entity)
- `Money` (Value Object)
- `ReservationStatus` (Value Object / Enum)

**Casos de uso:**
- Crear una reserva
- Confirmar una reserva
- Cancelar una reserva
- Calcular el precio total
- Aplicar descuentos

### 3. Notification (Notificación)

**Responsabilidad:** Envío de emails, notificaciones

**Lenguaje ubicuo:**
- **Notification (Notificación):** Mensaje enviado al cliente
- **Template (Plantilla):** Modelo de mensaje (confirmación, cancelación)
- **Canal:** Medio de envío (email, SMS futuro)

**Servicios:**
- `NotificationServiceInterface`
- `EmailNotificationService`

**Casos de uso:**
- Enviar confirmación de reserva
- Enviar cancelación de reserva
- Enviar recordatorio de pago

### Anti-Corruption Layer (ACL)

Comunicación entre Bounded Contexts vía **interfaces** y **DTOs**:

```php
<?php

namespace App\Application\Reservation\UseCase\CreateReservation;

use App\Domain\Catalog\Repository\SejourRepositoryInterface;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;

// ✅ El BC Reservation se comunica con el BC Catalog a través de interfaces
final readonly class CreateReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private SejourRepositoryInterface $sejourRepository, // ACL
    ) {}

    public function execute(CreateReservationCommand $command): void
    {
        // Recupera el Sejour (Catalog BC)
        $sejour = $this->sejourRepository->findById($command->sejourId);

        // Crea la Reservation (Reservation BC)
        $reservation = Reservation::create(
            // ...
            $sejour, // Referencia al Sejour
        );

        $this->reservationRepository->save($reservation);
    }
}
```

---

## Capas de la arquitectura

### CAPA 1: Domain (Dominio)

**Responsabilidad:** Lógica de negocio pura, reglas de gestión

**Contenido:**
- Entities (Aggregate Roots)
- Value Objects
- Domain Services
- Repository Interfaces
- Domain Events
- Excepciones de negocio

**Reglas:**
- ✅ PHP puro (sin dependencia de framework)
- ✅ Testable unitariamente sin base de datos
- ✅ Contiene la lógica de negocio crítica
- ❌ Sin anotaciones Doctrine
- ❌ Sin dependencia Symfony
- ❌ Sin lógica de persistencia

**Ejemplo:**

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Reservation\ValueObject\ReservationId;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\ValueObject\ReservationStatus;
use App\Domain\Reservation\Event\ReservationConfirmedEvent;

// ✅ Entidad de dominio pura (sin anotaciones Doctrine aquí)
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

    // ✅ Lógica de negocio en el dominio
    public function confirmer(): void
    {
        if ($this->statut === ReservationStatus::ANNULEE) {
            throw new InvalidReservationException('Cannot confirm cancelled reservation');
        }

        $this->statut = ReservationStatus::CONFIRMEE;

        // Registra un evento de dominio
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

### CAPA 2: Application (Casos de uso)

**Responsabilidad:** Orquestación, coordinación de los use cases

**Contenido:**
- Use Cases
- Commands / Queries (CQRS)
- Command/Query Handlers
- DTOs
- Event Handlers

**Reglas:**
- ✅ Coordina las entidades del dominio
- ✅ Gestiona las transacciones
- ✅ Despacha los eventos
- ❌ Sin lógica de negocio
- ❌ Sin acceso directo a la BD (a través de repositorios)

**Ejemplo:**

```php
<?php

namespace App\Application\Reservation\UseCase\ConfirmReservation;

use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Symfony\Component\Messenger\MessageBusInterface;

// ✅ Use Case: orquesta el dominio
final readonly class ConfirmReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $repository,
        private MessageBusInterface $eventBus,
    ) {}

    public function execute(ConfirmReservationCommand $command): void
    {
        // 1. Recuperación
        $reservation = $this->repository->findById(
            ReservationId::fromString($command->reservationId)
        );

        // 2. Lógica de negocio (en el dominio)
        $reservation->confirmer();

        // 3. Persistencia
        $this->repository->save($reservation);

        // 4. Eventos de dominio
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

### CAPA 3: Infrastructure (Técnica)

**Responsabilidad:** Implementación técnica, frameworks, BD

**Contenido:**
- Repository Implementations (Doctrine)
- Doctrine Types
- ORM Mappings
- Email Services
- Cache Adapters
- HTTP Clients

**Reglas:**
- ✅ Implementa las interfaces del dominio
- ✅ Usa Doctrine, Symfony, etc.
- ✅ Gestiona la persistencia
- ❌ Sin lógica de negocio

**Ejemplo:**

```php
<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\Repository\ReservationRepositoryInterface;
use App\Domain\Reservation\ValueObject\ReservationId;
use Doctrine\ORM\EntityManagerInterface;

// ✅ Implementación Doctrine (Infrastructure)
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

### CAPA 4: Presentation (UI)

**Responsabilidad:** Interfaz de usuario, API, CLI

**Contenido:**
- Controllers (Web, API, Admin)
- Forms
- Commands (Console)
- Twig Components

**Reglas:**
- ✅ Delega a los use cases
- ✅ Valida las entradas del usuario
- ✅ Transforma las respuestas en HTTP/JSON
- ❌ Sin lógica de negocio
- ❌ Sin acceso directo a los repositorios

**Ejemplo:**

```php
<?php

namespace App\Presentation\Controller\Web;

use App\Application\Reservation\UseCase\ConfirmReservation\ConfirmReservationCommand;
use App\Application\Reservation\UseCase\ConfirmReservation\ConfirmReservationUseCase;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

// ✅ Controller: delega al use case
final class ReservationController extends AbstractController
{
    public function __construct(
        private readonly ConfirmReservationUseCase $confirmReservationUseCase,
    ) {}

    #[Route('/reservations/{id}/confirm', name: 'reservation_confirm', methods: ['POST'])]
    public function confirm(string $id): Response
    {
        // Validación básica
        if (empty($id)) {
            throw $this->createNotFoundException();
        }

        // Delega al use case
        $command = new ConfirmReservationCommand($id);
        $this->confirmReservationUseCase->execute($command);

        $this->addFlash('success', 'Reserva confirmada con éxito');

        return $this->redirectToRoute('reservation_show', ['id' => $id]);
    }
}
```

---

## Flujo de datos

### Flujo de creación de una reserva

```
1. PRESENTACIÓN
   │
   ├─> ReservationController::create(Request)
   │   └─> Validación del formulario
   │
2. APPLICATION
   │
   ├─> CreateReservationUseCase::execute(Command)
   │   ├─> Repository::findSejour()
   │   ├─> Reservation::create()           (Dominio)
   │   ├─> ReservationPricingService       (Dominio)
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

### Código completo del flujo

```php
<?php

// 1. PRESENTACIÓN - Controller
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

            // ✅ Crea un Command a partir del formulario
            $command = new CreateReservationCommand(
                sejourId: $data['sejourId'],
                clientEmail: $data['email'],
                participants: $data['participants'],
            );

            // ✅ Delega al use case
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
        // ✅ Recupera la estancia (Catalog BC)
        $sejour = $this->sejourRepository->findById(
            SejourId::fromString($command->sejourId)
        );

        // ✅ Crea la reserva (Dominio)
        $reservation = Reservation::create(
            ReservationId::generate(),
            $sejour,
            Email::fromString($command->clientEmail)
        );

        // Añade los participantes
        foreach ($command->participants as $participantData) {
            $reservation->addParticipant(
                Participant::create(
                    PersonName::fromString($participantData['nom']),
                    $participantData['age']
                )
            );
        }

        // ✅ Calcula el precio (Domain Service)
        $montant = $this->pricingService->calculateTotalPrice($reservation);
        $reservation->setMontantTotal($montant);

        // ✅ Guarda
        $this->reservationRepository->save($reservation);

        // ✅ Despacha los eventos de dominio
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
        // ✅ Envía el email de confirmación
        $this->notificationService->sendReservationConfirmation(
            $event->reservationId
        );
    }
}
```

---

## Reglas de dependencias

### Validación con Deptrac

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

        # ✅ Presentation depende de Application e Infrastructure
        Presentation:
            - Application
            - Infrastructure
            - Domain  # Solo para VOs en los DTOs
```

### Ejecución

```bash
# Validar la arquitectura
vendor/bin/deptrac analyze

# Debe mostrar: ✅ All rules validated successfully
```

### Violaciones comunes

#### ❌ VIOLACIÓN: Domain depende de Symfony

```php
<?php

namespace App\Domain\Reservation\Entity;

use Doctrine\ORM\Mapping as ORM; // ❌ VIOLACIÓN

#[ORM\Entity] // ❌ Doctrine en el Domain
class Reservation
{
    // ...
}
```

#### ✅ CORRECCIÓN: Mapping XML separado

```php
<?php

namespace App\Domain\Reservation\Entity;

// ✅ Entidad pura
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

## Checklist de validación

### Antes de cada commit

- [ ] **Domain:** Sin dependencias externas (Symfony, Doctrine)
- [ ] **Domain:** Entidades testables unitariamente
- [ ] **Application:** Los use cases coordinan, no contienen lógica de negocio
- [ ] **Infrastructure:** Implementa las interfaces del dominio
- [ ] **Presentation:** Delega a los use cases
- [ ] **Deptrac:** `vendor/bin/deptrac analyze` pasa
- [ ] **Tests:** Cada capa testada independientemente

### PHPStan

```bash
# Nivel máximo + reglas estrictas
vendor/bin/phpstan analyse -l max src/
```

### Architecture Decision Records

Documentar las decisiones arquitectónicas importantes en `docs/adr/`:

```markdown
# ADR-001: Uso de Value Objects para Money

**Estado:** Aceptado

**Contexto:**
Gestión de los montos monetarios con precisión (céntimos).

**Decisión:**
Usar un Value Object `Money` con almacenamiento en céntimos (int).

**Consecuencias:**
- ✅ Precisión garantizada (sin float)
- ✅ Inmutabilidad
- ✅ Type safety
- ❌ Ligeramente más verboso
```

---

## Recursos

- **Libro:** *Clean Architecture* - Robert C. Martin
- **Libro:** *Domain-Driven Design* - Eric Evans
- **Libro:** *Implementing Domain-Driven Design* - Vaughn Vernon
- **Artículo:** [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- **Herramienta:** [Deptrac](https://github.com/qossmic/deptrac)

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
