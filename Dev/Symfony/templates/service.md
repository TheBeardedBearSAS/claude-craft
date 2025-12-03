# Template: Service (Application/Domain)

> **Pattern DDD** - Service contenant la logique métier ou orchestration
> Référence: `.claude/rules/01-architecture-ddd.md`

## Types de services

### Domain Service
- Logique métier qui ne relève pas d'une entité spécifique
- Opérations sur plusieurs aggregates
- Pur domaine (pas de dépendances infra)

### Application Service
- Orchestration de use cases
- Transaction management
- Appel de domain services
- Interaction avec repositories

---

## Template PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\[Domain|Application]\Service;

use App\Domain\Entity\[Entity];
use App\Domain\Repository\[Entity]RepositoryInterface;
use App\Domain\Exception\[DomainException];
use Psr\Log\LoggerInterface;

/**
 * Service: [NomService]
 *
 * Responsabilité: [Description de la responsabilité unique]
 *
 * Use cases:
 * - [Use case 1]
 * - [Use case 2]
 *
 * @see [Lien vers documentation métier si applicable]
 */
final readonly class [NomService]
{
    /**
     * Constructor injection (Symfony autowiring)
     */
    public function __construct(
        private [Entity]RepositoryInterface $[entity]Repository,
        private LoggerInterface $logger,
        // Autres dépendances...
    ) {
    }

    /**
     * [Description de la méthode]
     *
     * @param array<string, mixed> $data Données d'entrée
     * @return [Entity] Entité créée/modifiée
     * @throws [DomainException] Si [condition d'erreur]
     */
    public function [nomMethode](array $data): [Entity]
    {
        // 1. Validation des données d'entrée
        $this->validateData($data);

        // 2. Logique métier
        $entity = $this->buildEntity($data);

        // 3. Persistance
        $this->[entity]Repository->save($entity, true);

        // 4. Logging
        $this->logger->info('[Action effectuée]', [
            'entity_id' => $entity->getId(),
            'context' => 'additional_info',
        ]);

        // 5. Retour
        return $entity;
    }

    /**
     * Validation des données métier
     *
     * @throws [DomainException]
     */
    private function validateData(array $data): void
    {
        if (/* condition invalide */) {
            throw new [DomainException]('Message d\'erreur métier');
        }
    }

    /**
     * Construction de l'entité
     */
    private function buildEntity(array $data): [Entity]
    {
        $entity = new [Entity]();
        // Hydratation...
        return $entity;
    }
}
```

---

## Exemple 1: ReservationService (Application Service)

```php
<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\Reservation;
use App\Domain\Entity\Sejour;
use App\Domain\Entity\Participant;
use App\Domain\Repository\ReservationRepositoryInterface;
use App\Domain\Repository\SejourRepositoryInterface;
use App\Domain\Exception\SejourCompletException;
use App\Domain\Exception\ParticipantInvalideException;
use App\Application\Mailer\ReservationMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Service: Gestion des réservations
 *
 * Responsabilité: Orchestrer la création/modification de réservations
 *
 * Use cases:
 * - Créer une réservation avec participants
 * - Valider la disponibilité du séjour
 * - Envoyer les emails de confirmation
 * - Calculer le prix total
 */
final readonly class ReservationService
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private SejourRepositoryInterface $sejourRepository,
        private ReservationMailer $mailer,
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * Crée une nouvelle réservation
     *
     * @param array{
     *     sejour_id: int,
     *     email_contact: string,
     *     telephone_contact: string,
     *     participants: array<array{nom: string, prenom: string, date_naissance: string}>
     * } $data
     *
     * @throws SejourCompletException Si pas assez de places
     * @throws ParticipantInvalideException Si participant invalide
     */
    public function createReservation(array $data): Reservation
    {
        // 1. Récupérer le séjour
        $sejour = $this->sejourRepository->find($data['sejour_id']);
        if (!$sejour) {
            throw new \InvalidArgumentException('Séjour non trouvé');
        }

        // 2. Vérifier la disponibilité
        $nbParticipants = count($data['participants']);
        if (!$sejour->hasAvailablePlaces($nbParticipants)) {
            throw new SejourCompletException(
                sprintf(
                    'Séjour complet: %d places demandées, %d disponibles',
                    $nbParticipants,
                    $sejour->getPlacesRestantes()
                )
            );
        }

        // 3. Transaction pour garantir la cohérence
        $this->entityManager->beginTransaction();

        try {
            // 4. Créer la réservation
            $reservation = new Reservation();
            $reservation->setSejour($sejour);
            $reservation->setEmailContact($data['email_contact']);
            $reservation->setTelephoneContact($data['telephone_contact']);
            $reservation->setStatut('en_attente');

            // 5. Ajouter les participants
            foreach ($data['participants'] as $participantData) {
                $participant = $this->createParticipant($participantData);
                $reservation->addParticipant($participant);
            }

            // 6. Calculer le prix total
            $reservation->calculerMontantTotal();

            // 7. Sauvegarder
            $this->reservationRepository->save($reservation, true);

            // 8. Commit transaction
            $this->entityManager->commit();

            // 9. Envoyer emails (hors transaction)
            $this->mailer->sendConfirmationClient($reservation);
            $this->mailer->sendNotificationAdmin($reservation);

            // 10. Log
            $this->logger->info('Réservation créée avec succès', [
                'reservation_id' => $reservation->getId(),
                'sejour_id' => $sejour->getId(),
                'nb_participants' => $nbParticipants,
            ]);

            return $reservation;

        } catch (\Exception $e) {
            $this->entityManager->rollback();
            $this->logger->error('Erreur création réservation', [
                'error' => $e->getMessage(),
                'sejour_id' => $data['sejour_id'],
            ]);
            throw $e;
        }
    }

    /**
     * Confirme une réservation (paiement reçu)
     */
    public function confirmReservation(Reservation $reservation): void
    {
        $reservation->setStatut('confirmee');
        $reservation->setDateConfirmation(new \DateTimeImmutable());

        $this->reservationRepository->save($reservation, true);

        $this->mailer->sendReservationConfirmee($reservation);

        $this->logger->info('Réservation confirmée', [
            'reservation_id' => $reservation->getId(),
        ]);
    }

    /**
     * Annule une réservation
     */
    public function cancelReservation(Reservation $reservation, string $motif): void
    {
        // Libérer les places
        $sejour = $reservation->getSejour();
        $sejour->libererPlaces($reservation->getNbParticipants());

        // Marquer comme annulée
        $reservation->setStatut('annulee');
        $reservation->setMotifAnnulation($motif);
        $reservation->setDateAnnulation(new \DateTimeImmutable());

        $this->reservationRepository->save($reservation, true);

        $this->mailer->sendReservationAnnulee($reservation);

        $this->logger->warning('Réservation annulée', [
            'reservation_id' => $reservation->getId(),
            'motif' => $motif,
        ]);
    }

    /**
     * Crée un participant à partir des données
     *
     * @throws ParticipantInvalideException
     */
    private function createParticipant(array $data): Participant
    {
        // Validation
        if (empty($data['nom']) || empty($data['prenom'])) {
            throw new ParticipantInvalideException('Nom et prénom obligatoires');
        }

        // Validation âge (exemple: majeur uniquement)
        $dateNaissance = new \DateTimeImmutable($data['date_naissance']);
        $age = $dateNaissance->diff(new \DateTimeImmutable())->y;

        if ($age < 18) {
            throw new ParticipantInvalideException('Participant doit être majeur');
        }

        $participant = new Participant();
        $participant->setNom($data['nom']);
        $participant->setPrenom($data['prenom']);
        $participant->setDateNaissance($dateNaissance);

        return $participant;
    }
}
```

**Tests:**
```php
class ReservationServiceTest extends KernelTestCase
{
    private ReservationService $service;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->service = self::getContainer()->get(ReservationService::class);
        $this->entityManager = self::getContainer()->get(EntityManagerInterface::class);
    }

    /** @test */
    public function it_creates_reservation_successfully(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe', 10);
        $data = [
            'sejour_id' => $sejour->getId(),
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
                ['nom' => 'Martin', 'prenom' => 'Marie', 'date_naissance' => '1985-05-20'],
            ],
        ];

        // ACT
        $reservation = $this->service->createReservation($data);

        // ASSERT
        $this->assertInstanceOf(Reservation::class, $reservation);
        $this->assertCount(2, $reservation->getParticipants());
        $this->assertEquals('en_attente', $reservation->getStatut());
        $this->assertEquals(8, $sejour->getPlacesRestantes()); // 10 - 2
    }

    /** @test */
    public function it_throws_exception_when_sejour_full(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Martinique', 1); // 1 seule place
        $data = [
            'sejour_id' => $sejour->getId(),
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
                ['nom' => 'Martin', 'prenom' => 'Marie', 'date_naissance' => '1985-05-20'],
            ],
        ];

        // ASSERT
        $this->expectException(SejourCompletException::class);
        $this->expectExceptionMessage('Séjour complet: 2 places demandées, 1 disponibles');

        // ACT
        $this->service->createReservation($data);
    }

    /** @test */
    public function it_sends_emails_after_reservation(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe', 10);
        $data = [...];

        // ACT
        $this->service->createReservation($data);

        // ASSERT
        $this->assertEmailCount(2); // Client + Admin
        $this->assertEmailAddressContains($emails[0], 'to', 'client@example.com');
        $this->assertEmailAddressContains($emails[1], 'to', 'admin@atoll-tourisme.com');
    }
}
```

---

## Exemple 2: PrixCalculatorService (Domain Service)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Service;

use App\Domain\Entity\Reservation;
use App\Domain\ValueObject\Money;

/**
 * Service: Calcul du prix des réservations
 *
 * Responsabilité: Calculer le prix total selon les règles métier
 *
 * Règles:
 * - Prix de base × nombre de participants
 * - + Supplément single si 1 participant
 * - + Options (assurance, etc.)
 * - - Réduction code promo
 */
final readonly class PrixCalculatorService
{
    private const SUPPLEMENT_SINGLE_PERCENT = 30; // +30% si 1 participant

    public function calculate(Reservation $reservation): Money
    {
        $total = $this->calculateBasePrice($reservation);
        $total = $this->applySingleSupplement($reservation, $total);
        $total = $this->addOptions($reservation, $total);
        $total = $this->applyPromoCode($reservation, $total);

        return $total;
    }

    private function calculateBasePrice(Reservation $reservation): Money
    {
        $prixUnitaire = $reservation->getSejour()->getPrixTtc();
        $nbParticipants = $reservation->getNbParticipants();

        return $prixUnitaire->multiply($nbParticipants);
    }

    private function applySingleSupplement(Reservation $reservation, Money $current): Money
    {
        if ($reservation->getNbParticipants() === 1) {
            $supplement = $current->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
            return $current->add($supplement);
        }

        return $current;
    }

    private function addOptions(Reservation $reservation, Money $current): Money
    {
        $total = $current;

        foreach ($reservation->getOptions() as $option) {
            $total = $total->add($option->getPrix());
        }

        return $total;
    }

    private function applyPromoCode(Reservation $reservation, Money $current): Money
    {
        if ($codePromo = $reservation->getCodePromo()) {
            $reduction = $current->multiply($codePromo->getPourcentageReduction() / 100);
            return $current->subtract($reduction);
        }

        return $current;
    }
}
```

---

## Principes SOLID

### Single Responsibility Principle (SRP)
✅ Un service = une responsabilité métier

```php
// ❌ MAUVAIS: Service fourre-tout
class ReservationManager {
    public function create() {}
    public function sendEmail() {}
    public function generatePdf() {}
    public function calculatePrice() {}
}

// ✅ BON: Services séparés
class ReservationService {} // Gestion réservations
class ReservationMailer {} // Envoi emails
class PdfGenerator {} // Génération PDF
class PrixCalculator {} // Calcul prix
```

### Dependency Inversion Principle (DIP)
✅ Dépendre d'interfaces, pas d'implémentations

```php
// Interface (domain)
interface ReservationRepositoryInterface {
    public function save(Reservation $reservation): void;
}

// Service dépend de l'interface
class ReservationService {
    public function __construct(
        private ReservationRepositoryInterface $repository // Interface, pas implémentation
    ) {}
}

// Implémentation (infrastructure)
class DoctrineReservationRepository implements ReservationRepositoryInterface {
    public function save(Reservation $reservation): void {
        // Doctrine ORM
    }
}
```

---

## Checklist Service

- [ ] Classe `final readonly`
- [ ] Constructor injection uniquement
- [ ] Une seule responsabilité (SRP)
- [ ] Pas de logique métier dans le constructeur
- [ ] Méthodes publiques documentées (PHPDoc)
- [ ] Gestion des exceptions métier
- [ ] Logging des opérations importantes
- [ ] Transactions pour garantir la cohérence
- [ ] Tests unitaires + intégration (>80% coverage)
- [ ] Dépendances injectées via interfaces (DIP)
