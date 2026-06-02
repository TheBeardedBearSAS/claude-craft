# Plantilla: Aggregate Root (DDD)

> **Patrón DDD** - Raíz de un agregado que garantiza la coherencia de negocio
> Referencia: `.claude/rules/01-architecture-ddd.md`

## ¿Qué es un Aggregate Root?

Un Aggregate Root es:
- ✅ **Punto de entrada único** para modificar el agregado
- ✅ **Guardián de los invariantes de negocio** (reglas de coherencia)
- ✅ **Emisor de eventos de dominio**
- ✅ **Propietario de sus entidades hijas**
- ✅ **Referenciado únicamente por su ID** (sin navegación directa)

**Ejemplo Atoll Tourisme:**
- `Reservation` es el Aggregate Root
- `Participant` es una entidad hija
- No podemos modificar un `Participant` sin pasar por `Reservation`

---

## Plantilla PHP 8.2+ (Doctrine ORM)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use App\Domain\Event\[DomainEvent];
use App\Domain\ValueObject\[ValueObject];
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

/**
 * Aggregate Root: [NombreAggregate]
 *
 * Responsabilidad: [Descripción de la responsabilidad de negocio]
 *
 * Invariantes protegidos:
 * - [Invariante 1: regla de negocio que siempre debe respetarse]
 * - [Invariante 2: ...]
 *
 * Eventos de dominio:
 * - [DomainEvent1]: Cuando [condición]
 * - [DomainEvent2]: Cuando [condición]
 */
#[ORM\Entity(repositoryClass: [Aggregate]Repository::class)]
#[ORM\Table(name: '[table_name]')]
class [NombreAggregate]
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    // Propiedades de negocio...

    /**
     * Entidades hijas (owned por el aggregate)
     *
     * @var Collection<int, [ChildEntity]>
     */
    #[ORM\OneToMany(
        mappedBy: '[aggregate]',
        targetEntity: [ChildEntity]::class,
        cascade: ['persist', 'remove'],
        orphanRemoval: true
    )]
    private Collection $[children];

    /**
     * Eventos de dominio a publicar
     *
     * @var array<DomainEvent>
     */
    private array $domainEvents = [];

    public function __construct()
    {
        $this->id = Uuid::v4();
        $this->[children] = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    // ========================================
    // MÉTODOS DE NEGOCIO (API pública)
    // ========================================

    /**
     * [Descripción del método de negocio]
     *
     * Invariantes verificados:
     * - [Invariante 1]
     *
     * Eventos emitidos:
     * - [DomainEvent] si [condición]
     *
     * @throws [DomainException] Si [condición de error]
     */
    public function [businessMethod]([params]): void
    {
        // 1. Verificar los invariantes
        $this->ensureInvariant[X]();

        // 2. Aplicar la lógica de negocio
        // ...

        // 3. Emitir el evento de dominio
        $this->recordEvent(new [DomainEvent]($this));
    }

    /**
     * Añade una entidad hija
     *
     * @throws [DomainException] Si [regla de negocio violada]
     */
    public function add[Child]([ChildEntity] $child): void
    {
        // Verificar los invariantes
        $this->ensureCanAdd[Child]();

        // Establecer la relación bidireccional
        if (!$this->[children]->contains($child)) {
            $this->[children]->add($child);
            $child->set[Aggregate]($this);
        }

        // Evento
        $this->recordEvent(new [Child]Added($this, $child));
    }

    /**
     * Elimina una entidad hija
     */
    public function remove[Child]([ChildEntity] $child): void
    {
        if ($this->[children]->removeElement($child)) {
            // Romper la relación
            $child->set[Aggregate](null);

            // Evento
            $this->recordEvent(new [Child]Removed($this, $child));
        }
    }

    // ========================================
    // PROTECCIÓN DE INVARIANTES
    // ========================================

    /**
     * Invariante: [Descripción de la regla de negocio]
     *
     * @throws [DomainException]
     */
    private function ensureInvariant[X](): void
    {
        if (/* condición violada */) {
            throw new [DomainException]('[Mensaje de error de negocio]');
        }
    }

    // ========================================
    // EVENTOS DE DOMINIO
    // ========================================

    /**
     * Registra un evento de dominio
     */
    private function recordEvent(object $event): void
    {
        $this->domainEvents[] = $event;
    }

    /**
     * Recupera y vacía los eventos de dominio
     *
     * @return array<object>
     */
    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];

        return $events;
    }

    // ========================================
    // GETTERS (ACCESO DE SOLO LECTURA)
    // ========================================

    public function getId(): Uuid
    {
        return $this->id;
    }

    /**
     * Devuelve una copia inmutable de la colección
     *
     * @return Collection<int, [ChildEntity]>
     */
    public function get[Children](): Collection
    {
        return $this->[children];
    }

    // Otros getters...
}
```

---

## Ejemplo concreto: Reservation (Aggregate Root)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use App\Domain\Event\ReservationCreated;
use App\Domain\Event\ReservationConfirmed;
use App\Domain\Event\ReservationCancelled;
use App\Domain\Event\ParticipantAdded;
use App\Domain\Exception\SejourCompletException;
use App\Domain\Exception\ReservationInvalideException;
use App\Domain\ValueObject\Money;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

/**
 * Aggregate Root: Reservation
 *
 * Responsabilidad: Gestionar una reserva de estancia con sus participantes
 *
 * Invariantes protegidos:
 * - Una reserva debe tener al menos 1 participante
 * - El número de participantes no puede superar la capacidad de la estancia
 * - Una reserva confirmada no puede ser modificada
 * - El monto total debe ser siempre coherente con los participantes
 *
 * Eventos de dominio:
 * - ReservationCreated: En el momento de la creación
 * - ParticipantAdded: Adición de un participante
 * - ReservationConfirmed: Confirmación del pago
 * - ReservationCancelled: Cancelación
 */
#[ORM\Entity(repositoryClass: ReservationRepository::class)]
#[ORM\Table(name: 'reservation')]
class Reservation
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\ManyToOne(targetEntity: Sejour::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Sejour $sejour;

    /**
     * @var Collection<int, Participant>
     */
    #[ORM\OneToMany(
        mappedBy: 'reservation',
        targetEntity: Participant::class,
        cascade: ['persist', 'remove'],
        orphanRemoval: true
    )]
    private Collection $participants;

    #[ORM\Column(type: 'string', length: 20)]
    private string $statut = 'en_attente'; // en_attente, confirmee, annulee

    #[ORM\Column(type: 'integer')]
    private int $montantTotalCents = 0;

    #[ORM\Column(type: 'string', length: 255)]
    private string $emailContact;

    #[ORM\Column(type: 'string', length: 20)]
    private string $telephoneContact;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $confirmedAt = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $motifAnnulation = null;

    /**
     * @var array<object>
     */
    private array $domainEvents = [];

    public function __construct(
        Sejour $sejour,
        string $emailContact,
        string $telephoneContact
    ) {
        $this->id = Uuid::v4();
        $this->sejour = $sejour;
        $this->emailContact = $emailContact;
        $this->telephoneContact = $telephoneContact;
        $this->participants = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();

        $this->recordEvent(new ReservationCreated($this));
    }

    // ========================================
    // MÉTODOS DE NEGOCIO
    // ========================================

    /**
     * Añade un participante a la reserva
     *
     * Invariantes verificados:
     * - La reserva no debe estar confirmada
     * - La estancia debe tener plazas disponibles
     *
     * Eventos emitidos:
     * - ParticipantAdded
     *
     * @throws ReservationInvalideException Si la reserva está confirmada
     * @throws SejourCompletException Si la estancia está completa
     */
    public function addParticipant(Participant $participant): void
    {
        // Invariantes
        $this->ensureNotConfirmed();
        $this->ensureSejourHasAvailablePlaces();

        // Adición
        if (!$this->participants->contains($participant)) {
            $this->participants->add($participant);
            $participant->setReservation($this);

            // Recalcular el precio
            $this->recalculateMontantTotal();

            // Evento
            $this->recordEvent(new ParticipantAdded($this, $participant));
        }
    }

    /**
     * Confirma la reserva (pago recibido)
     *
     * Invariantes verificados:
     * - Debe tener al menos 1 participante
     * - No debe estar ya confirmada
     *
     * @throws ReservationInvalideException
     */
    public function confirm(): void
    {
        // Invariantes
        $this->ensureHasParticipants();
        $this->ensureNotConfirmed();

        // Confirmación
        $this->statut = 'confirmee';
        $this->confirmedAt = new \DateTimeImmutable();

        // Reservar las plazas en la estancia
        $this->sejour->reserverPlaces($this->getNbParticipants());

        // Evento
        $this->recordEvent(new ReservationConfirmed($this));
    }

    /**
     * Cancela la reserva
     *
     * @throws ReservationInvalideException Si ya está cancelada
     */
    public function cancel(string $motif): void
    {
        if ($this->statut === 'annulee') {
            throw new ReservationInvalideException('Réservation déjà annulée');
        }

        // Si está confirmada, liberar las plazas
        if ($this->statut === 'confirmee') {
            $this->sejour->libererPlaces($this->getNbParticipants());
        }

        // Cancelación
        $this->statut = 'annulee';
        $this->motifAnnulation = $motif;

        // Evento
        $this->recordEvent(new ReservationCancelled($this, $motif));
    }

    /**
     * Recalcula el monto total según las reglas de negocio
     *
     * Reglas:
     * - Precio base × número de participantes
     * - + 30% de suplemento individual si 1 solo participante
     */
    public function recalculateMontantTotal(): void
    {
        $nbParticipants = $this->getNbParticipants();

        if ($nbParticipants === 0) {
            $this->montantTotalCents = 0;
            return;
        }

        // Precio base
        $prixUnitaire = $this->sejour->getPrixTtc();
        $total = $prixUnitaire->multiply($nbParticipants);

        // Suplemento individual (+30% si 1 participante)
        if ($nbParticipants === 1) {
            $supplement = $total->multiply(0.30);
            $total = $total->add($supplement);
        }

        $this->montantTotalCents = $total->toCents();
    }

    // ========================================
    // PROTECCIÓN DE INVARIANTES
    // ========================================

    /**
     * Invariante: Una reserva debe tener al menos 1 participante
     *
     * @throws ReservationInvalideException
     */
    private function ensureHasParticipants(): void
    {
        if ($this->participants->isEmpty()) {
            throw new ReservationInvalideException(
                'Une réservation doit avoir au moins 1 participant'
            );
        }
    }

    /**
     * Invariante: Una reserva confirmada no puede ser modificada
     *
     * @throws ReservationInvalideException
     */
    private function ensureNotConfirmed(): void
    {
        if ($this->statut === 'confirmee') {
            throw new ReservationInvalideException(
                'Impossible de modifier une réservation confirmée'
            );
        }
    }

    /**
     * Invariante: La estancia debe tener plazas disponibles
     *
     * @throws SejourCompletException
     */
    private function ensureSejourHasAvailablePlaces(): void
    {
        $nbParticipantsActuels = $this->getNbParticipants();

        if (!$this->sejour->hasAvailablePlaces($nbParticipantsActuels + 1)) {
            throw new SejourCompletException(
                sprintf(
                    'Séjour %s complet: %d places restantes',
                    $this->sejour->getDestination(),
                    $this->sejour->getPlacesRestantes()
                )
            );
        }
    }

    // ========================================
    // EVENTOS DE DOMINIO
    // ========================================

    private function recordEvent(object $event): void
    {
        $this->domainEvents[] = $event;
    }

    /**
     * @return array<object>
     */
    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];

        return $events;
    }

    // ========================================
    // GETTERS
    // ========================================

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getSejour(): Sejour
    {
        return $this->sejour;
    }

    /**
     * @return Collection<int, Participant>
     */
    public function getParticipants(): Collection
    {
        return $this->participants;
    }

    public function getNbParticipants(): int
    {
        return $this->participants->count();
    }

    public function getMontantTotal(): Money
    {
        return Money::fromCents($this->montantTotalCents);
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function isConfirmee(): bool
    {
        return $this->statut === 'confirmee';
    }

    public function isAnnulee(): bool
    {
        return $this->statut === 'annulee';
    }

    public function getEmailContact(): string
    {
        return $this->emailContact;
    }

    public function getTelephoneContact(): string
    {
        return $this->telephoneContact;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getConfirmedAt(): ?\DateTimeImmutable
    {
        return $this->confirmedAt;
    }
}
```

---

## Entidad hija: Participant

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

/**
 * Entidad: Participant (owned por el agregado Reservation)
 *
 * ⚠️ Solo puede ser modificado A TRAVÉS de Reservation (el aggregate root)
 */
#[ORM\Entity]
#[ORM\Table(name: 'participant')]
class Participant
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    /**
     * Referencia hacia el aggregate root (obligatoria)
     */
    #[ORM\ManyToOne(targetEntity: Reservation::class, inversedBy: 'participants')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Reservation $reservation = null;

    #[ORM\Column(type: 'string', length: 100)]
    private string $nom;

    #[ORM\Column(type: 'string', length: 100)]
    private string $prenom;

    #[ORM\Column(type: 'date_immutable')]
    private \DateTimeImmutable $dateNaissance;

    #[ORM\Column(type: 'integer')]
    private int $numeroOrdre;

    public function __construct()
    {
        $this->id = Uuid::v4();
    }

    // ========================================
    // SETTERS DE PAQUETE
    // (accesibles únicamente por Reservation)
    // ========================================

    /**
     * @internal Llamado únicamente por Reservation
     */
    public function setReservation(?Reservation $reservation): void
    {
        $this->reservation = $reservation;
    }

    // ========================================
    // GETTERS
    // ========================================

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): void
    {
        $this->nom = $nom;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): void
    {
        $this->prenom = $prenom;
    }

    public function getDateNaissance(): \DateTimeImmutable
    {
        return $this->dateNaissance;
    }

    public function setDateNaissance(\DateTimeImmutable $dateNaissance): void
    {
        $this->dateNaissance = $dateNaissance;
    }

    public function getNumeroOrdre(): int
    {
        return $this->numeroOrdre;
    }

    public function setNumeroOrdre(int $numeroOrdre): void
    {
        $this->numeroOrdre = $numeroOrdre;
    }

    public function getAge(): int
    {
        return $this->dateNaissance->diff(new \DateTimeImmutable())->y;
    }
}
```

---

## Tests del Aggregate Root

```php
<?php

namespace App\Tests\Unit\Domain\Entity;

use App\Domain\Entity\Reservation;
use App\Domain\Entity\Participant;
use App\Domain\Entity\Sejour;
use App\Domain\Event\ReservationCreated;
use App\Domain\Event\ParticipantAdded;
use App\Domain\Event\ReservationConfirmed;
use App\Domain\Exception\ReservationInvalideException;
use App\Domain\Exception\SejourCompletException;
use PHPUnit\Framework\TestCase;

class ReservationTest extends TestCase
{
    private Sejour $sejour;

    protected function setUp(): void
    {
        $this->sejour = new Sejour();
        $this->sejour->setDestination('Guadeloupe');
        $this->sejour->setCapacite(10);
        $this->sejour->setPrixTtc(Money::fromEuros(1299.99));
    }

    /** @test */
    public function it_creates_reservation_with_domain_event(): void
    {
        // ACT
        $reservation = new Reservation(
            $this->sejour,
            'client@example.com',
            '0612345678'
        );

        // ASSERT
        $events = $reservation->pullDomainEvents();
        $this->assertCount(1, $events);
        $this->assertInstanceOf(ReservationCreated::class, $events[0]);
    }

    /** @test */
    public function it_adds_participant_and_recalculates_total(): void
    {
        // ARRANGE
        $reservation = new Reservation($this->sejour, 'client@example.com', '0612345678');
        $participant = new Participant();
        $participant->setNom('Dupont');
        $participant->setPrenom('Jean');

        // ACT
        $reservation->addParticipant($participant);

        // ASSERT
        $this->assertCount(1, $reservation->getParticipants());
        // 1299.99 + 30% suplemento individual
        $this->assertEquals(1689.99, $reservation->getMontantTotal()->toEuros(), '', 0.01);

        $events = $reservation->pullDomainEvents();
        $this->assertInstanceOf(ParticipantAdded::class, $events[1]); // events[0] = ReservationCreated
    }

    /** @test */
    public function it_confirms_reservation_and_reserves_places(): void
    {
        // ARRANGE
        $reservation = new Reservation($this->sejour, 'client@example.com', '0612345678');
        $reservation->addParticipant(new Participant());
        $reservation->addParticipant(new Participant());

        // ACT
        $reservation->confirm();

        // ASSERT
        $this->assertTrue($reservation->isConfirmee());
        $this->assertNotNull($reservation->getConfirmedAt());
        $this->assertEquals(8, $this->sejour->getPlacesRestantes()); // 10 - 2

        $events = $reservation->pullDomainEvents();
        $lastEvent = end($events);
        $this->assertInstanceOf(ReservationConfirmed::class, $lastEvent);
    }

    /** @test */
    public function it_throws_exception_when_confirming_without_participants(): void
    {
        // ARRANGE
        $reservation = new Reservation($this->sejour, 'client@example.com', '0612345678');

        // ASSERT
        $this->expectException(ReservationInvalideException::class);
        $this->expectExceptionMessage('Une réservation doit avoir au moins 1 participant');

        // ACT
        $reservation->confirm();
    }

    /** @test */
    public function it_throws_exception_when_modifying_confirmed_reservation(): void
    {
        // ARRANGE
        $reservation = new Reservation($this->sejour, 'client@example.com', '0612345678');
        $reservation->addParticipant(new Participant());
        $reservation->confirm();

        // ASSERT
        $this->expectException(ReservationInvalideException::class);
        $this->expectExceptionMessage('Impossible de modifier une réservation confirmée');

        // ACT
        $reservation->addParticipant(new Participant());
    }

    /** @test */
    public function it_throws_exception_when_sejour_full(): void
    {
        // ARRANGE
        $sejourComplet = new Sejour();
        $sejourComplet->setCapacite(1);
        $sejourComplet->setPlacesRestantes(0); // Completo

        $reservation = new Reservation($sejourComplet, 'client@example.com', '0612345678');

        // ASSERT
        $this->expectException(SejourCompletException::class);

        // ACT
        $reservation->addParticipant(new Participant());
    }

    /** @test */
    public function it_cancels_reservation_and_releases_places(): void
    {
        // ARRANGE
        $reservation = new Reservation($this->sejour, 'client@example.com', '0612345678');
        $reservation->addParticipant(new Participant());
        $reservation->confirm(); // Plazas reservadas

        // ACT
        $reservation->cancel('El cliente cambió de opinión');

        // ASSERT
        $this->assertTrue($reservation->isAnnulee());
        $this->assertEquals(10, $this->sejour->getPlacesRestantes()); // Plazas liberadas
    }
}
```

---

## Checklist Aggregate Root

- [ ] Clase con identidad (UUID)
- [ ] Constructor inicializa estado válido
- [ ] Relaciones OneToMany en `cascade: ['persist', 'remove']`
- [ ] `orphanRemoval: true` para entidades hijas
- [ ] Invariantes de negocio protegidos (métodos privados `ensure*()`)
- [ ] Eventos de dominio registrados (`recordEvent()`)
- [ ] Sin setters públicos (encapsulación fuerte)
- [ ] Métodos de negocio expresivos (intención clara)
- [ ] Tests unitarios exhaustivos (invariantes, eventos)
- [ ] Documentación de las reglas de negocio en PHPDoc
