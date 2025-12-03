# Template: Aggregate Root (DDD)

> **Pattern DDD** - Racine d'un agrégat garantissant la cohérence métier
> Référence: `.claude/rules/01-architecture-ddd.md`

## Qu'est-ce qu'un Aggregate Root ?

Un Aggregate Root est:
- ✅ **Point d'entrée unique** pour modifier l'agrégat
- ✅ **Gardien des invariants métier** (règles de cohérence)
- ✅ **Émetteur d'événements de domaine**
- ✅ **Propriétaire de ses entités enfants**
- ✅ **Référencé par son ID uniquement** (pas de navigation directe)

**Exemple Atoll Tourisme:**
- `Reservation` est l'Aggregate Root
- `Participant` est une entité enfant
- On ne peut pas modifier un `Participant` sans passer par `Reservation`

---

## Template PHP 8.2+ (Doctrine ORM)

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
 * Aggregate Root: [NomAggregate]
 *
 * Responsabilité: [Description de la responsabilité métier]
 *
 * Invariants protégés:
 * - [Invariant 1: règle métier à toujours respecter]
 * - [Invariant 2: ...]
 *
 * Événements de domaine:
 * - [DomainEvent1]: Quand [condition]
 * - [DomainEvent2]: Quand [condition]
 */
#[ORM\Entity(repositoryClass: [Aggregate]Repository::class)]
#[ORM\Table(name: '[table_name]')]
class [NomAggregate]
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    // Propriétés métier...

    /**
     * Entités enfants (owned par l'aggregate)
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
     * Événements de domaine à publier
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
    // BUSINESS METHODS (API publique)
    // ========================================

    /**
     * [Description de la méthode métier]
     *
     * Invariants vérifiés:
     * - [Invariant 1]
     *
     * Événements émis:
     * - [DomainEvent] si [condition]
     *
     * @throws [DomainException] Si [condition d'erreur]
     */
    public function [businessMethod]([params]): void
    {
        // 1. Vérifier les invariants
        $this->ensureInvariant[X]();

        // 2. Appliquer la logique métier
        // ...

        // 3. Émettre l'événement de domaine
        $this->recordEvent(new [DomainEvent]($this));
    }

    /**
     * Ajoute une entité enfant
     *
     * @throws [DomainException] Si [règle métier violée]
     */
    public function add[Child]([ChildEntity] $child): void
    {
        // Vérifier les invariants
        $this->ensureCanAdd[Child]();

        // Établir la relation bidirectionnelle
        if (!$this->[children]->contains($child)) {
            $this->[children]->add($child);
            $child->set[Aggregate]($this);
        }

        // Événement
        $this->recordEvent(new [Child]Added($this, $child));
    }

    /**
     * Supprime une entité enfant
     */
    public function remove[Child]([ChildEntity] $child): void
    {
        if ($this->[children]->removeElement($child)) {
            // Casser la relation
            $child->set[Aggregate](null);

            // Événement
            $this->recordEvent(new [Child]Removed($this, $child));
        }
    }

    // ========================================
    // INVARIANT PROTECTION
    // ========================================

    /**
     * Invariant: [Description de la règle métier]
     *
     * @throws [DomainException]
     */
    private function ensureInvariant[X](): void
    {
        if (/* condition violée */) {
            throw new [DomainException]('[Message erreur métier]');
        }
    }

    // ========================================
    // DOMAIN EVENTS
    // ========================================

    /**
     * Enregistre un événement de domaine
     */
    private function recordEvent(object $event): void
    {
        $this->domainEvents[] = $event;
    }

    /**
     * Récupère et vide les événements de domaine
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
    // GETTERS (READ-ONLY ACCESS)
    // ========================================

    public function getId(): Uuid
    {
        return $this->id;
    }

    /**
     * Retourne une copie immutable de la collection
     *
     * @return Collection<int, [ChildEntity]>
     */
    public function get[Children](): Collection
    {
        return $this->[children];
    }

    // Autres getters...
}
```

---

## Exemple concret: Reservation (Aggregate Root)

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
 * Responsabilité: Gérer une réservation de séjour avec ses participants
 *
 * Invariants protégés:
 * - Une réservation doit avoir au moins 1 participant
 * - Le nombre de participants ne peut pas dépasser la capacité du séjour
 * - Une réservation confirmée ne peut pas être modifiée
 * - Le montant total doit toujours être cohérent avec les participants
 *
 * Événements de domaine:
 * - ReservationCreated: Lors de la création
 * - ParticipantAdded: Ajout d'un participant
 * - ReservationConfirmed: Confirmation du paiement
 * - ReservationCancelled: Annulation
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
    // BUSINESS METHODS
    // ========================================

    /**
     * Ajoute un participant à la réservation
     *
     * Invariants vérifiés:
     * - La réservation ne doit pas être confirmée
     * - Le séjour doit avoir assez de places
     *
     * Événements émis:
     * - ParticipantAdded
     *
     * @throws ReservationInvalideException Si réservation confirmée
     * @throws SejourCompletException Si séjour complet
     */
    public function addParticipant(Participant $participant): void
    {
        // Invariants
        $this->ensureNotConfirmed();
        $this->ensureSejourHasAvailablePlaces();

        // Ajout
        if (!$this->participants->contains($participant)) {
            $this->participants->add($participant);
            $participant->setReservation($this);

            // Recalculer le prix
            $this->recalculateMontantTotal();

            // Événement
            $this->recordEvent(new ParticipantAdded($this, $participant));
        }
    }

    /**
     * Confirme la réservation (paiement reçu)
     *
     * Invariants vérifiés:
     * - Doit avoir au moins 1 participant
     * - Ne doit pas être déjà confirmée
     *
     * @throws ReservationInvalideException
     */
    public function confirm(): void
    {
        // Invariants
        $this->ensureHasParticipants();
        $this->ensureNotConfirmed();

        // Confirmation
        $this->statut = 'confirmee';
        $this->confirmedAt = new \DateTimeImmutable();

        // Réserver les places sur le séjour
        $this->sejour->reserverPlaces($this->getNbParticipants());

        // Événement
        $this->recordEvent(new ReservationConfirmed($this));
    }

    /**
     * Annule la réservation
     *
     * @throws ReservationInvalideException Si déjà annulée
     */
    public function cancel(string $motif): void
    {
        if ($this->statut === 'annulee') {
            throw new ReservationInvalideException('Réservation déjà annulée');
        }

        // Si confirmée, libérer les places
        if ($this->statut === 'confirmee') {
            $this->sejour->libererPlaces($this->getNbParticipants());
        }

        // Annulation
        $this->statut = 'annulee';
        $this->motifAnnulation = $motif;

        // Événement
        $this->recordEvent(new ReservationCancelled($this, $motif));
    }

    /**
     * Recalcule le montant total selon les règles métier
     *
     * Règles:
     * - Prix de base × nombre de participants
     * - + 30% de supplément single si 1 seul participant
     */
    public function recalculateMontantTotal(): void
    {
        $nbParticipants = $this->getNbParticipants();

        if ($nbParticipants === 0) {
            $this->montantTotalCents = 0;
            return;
        }

        // Prix de base
        $prixUnitaire = $this->sejour->getPrixTtc();
        $total = $prixUnitaire->multiply($nbParticipants);

        // Supplément single (+30% si 1 participant)
        if ($nbParticipants === 1) {
            $supplement = $total->multiply(0.30);
            $total = $total->add($supplement);
        }

        $this->montantTotalCents = $total->toCents();
    }

    // ========================================
    // INVARIANTS PROTECTION
    // ========================================

    /**
     * Invariant: Une réservation doit avoir au moins 1 participant
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
     * Invariant: Une réservation confirmée ne peut pas être modifiée
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
     * Invariant: Le séjour doit avoir assez de places
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
    // DOMAIN EVENTS
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

## Entité enfant: Participant

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

/**
 * Entité: Participant (owned by Reservation aggregate)
 *
 * ⚠️ Ne peut être modifié QUE via Reservation (l'aggregate root)
 */
#[ORM\Entity]
#[ORM\Table(name: 'participant')]
class Participant
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    /**
     * Référence vers l'aggregate root (obligatoire)
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
    // PACKAGE-PROTECTED SETTERS
    // (accessible uniquement par Reservation)
    // ========================================

    /**
     * @internal Appelé uniquement par Reservation
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

## Tests de l'Aggregate Root

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
        // 1299.99 + 30% supplément single
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
        $sejourComplet->setPlacesRestantes(0); // Complet

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
        $reservation->confirm(); // Places réservées

        // ACT
        $reservation->cancel('Client a changé d\'avis');

        // ASSERT
        $this->assertTrue($reservation->isAnnulee());
        $this->assertEquals(10, $this->sejour->getPlacesRestantes()); // Places libérées
    }
}
```

---

## Checklist Aggregate Root

- [ ] Classe avec identité (UUID)
- [ ] Constructeur initialise l'état valide
- [ ] Relations OneToMany en `cascade: ['persist', 'remove']`
- [ ] `orphanRemoval: true` pour entités enfants
- [ ] Invariants métier protégés (méthodes privées `ensure*()`)
- [ ] Événements de domaine enregistrés (`recordEvent()`)
- [ ] Pas de setters publics (encapsulation forte)
- [ ] Business methods expressives (intention claire)
- [ ] Tests unitaires exhaustifs (invariants, événements)
- [ ] Documentation des règles métier en PHPDoc
