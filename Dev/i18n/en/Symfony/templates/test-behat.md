# Template: Test BDD Behat (Behavior-Driven Development)

> **Pattern BDD** - Tests fonctionnels en langage naturel (Gherkin)
> Reference: `.claude/rules/04-testing-tdd.md`

## Qu'est-ce qu'un test Behat ?

Un test Behat:
- ✅ **Langage naturel** (Gherkin: Given/When/Then)
- ✅ **Lisible par métier** (Product Owner, clients)
- ✅ **Tests bout-en-bout** (UI, API, BDD)
- ✅ **Spécifications exécutables**
- ✅ **Living documentation**

---

## Structure d'un test Behat

### 1. Feature File (`.feature`)

```gherkin
# features/[nom_feature].feature
# language: fr

Fonctionnalité: [Titre de la fonctionnalité]
  En tant que [rôle]
  Je veux [action]
  Afin de [bénéfice métier]

  Contexte:
    Étant donné [préconditions communes à tous les scénarios]

  Scénario: [Titre du scénario nominal]
    Étant donné [état initial]
    Et [autre précondition]
    Quand [action déclenchée]
    Et [autre action]
    Alors [résultat attendu]
    Et [autre résultat]

  Plan du scénario: [Titre du scénario paramétré]
    Étant donné [état avec <paramètre>]
    Quand [action avec <paramètre>]
    Alors [résultat avec <paramètre>]

    Exemples:
      | paramètre1 | paramètre2 | résultat |
      | valeur1    | valeur2    | attendu1 |
      | valeur3    | valeur4    | attendu2 |
```

### 2. Context Class (PHP)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use PHPUnit\Framework\Assert;

/**
 * Behat Context: [Feature]
 *
 * Implémente les steps Gherkin pour [feature]
 */
final class [Feature]Context implements Context
{
    private EntityManagerInterface $entityManager;
    private KernelInterface $kernel;

    // État partagé entre les steps
    private mixed $result;
    private ?\Exception $lastException = null;

    public function __construct(
        EntityManagerInterface $entityManager,
        KernelInterface $kernel
    ) {
        $this->entityManager = $entityManager;
        $this->kernel = $kernel;
    }

    /**
     * @BeforeScenario
     */
    public function setUp(): void
    {
        // Démarrer une transaction avant chaque scénario
        $this->entityManager->beginTransaction();
    }

    /**
     * @AfterScenario
     */
    public function tearDown(): void
    {
        // Rollback après chaque scénario
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }
    }

    /**
     * @Given /step pattern regex/
     */
    public function stepImplementation(): void
    {
        // Implémentation du step
    }
}
```

---

## Example 1: Réservation de séjour (Feature complète)

### Feature File

```gherkin
# features/reservation.feature
# language: fr

Fonctionnalité: Réservation de séjour
  En tant que client
  Je veux réserver un séjour avec plusieurs participants
  Afin de partir en vacances aux Antilles

  Contexte:
    Étant donné les séjours suivants:
      | destination  | date_debut | date_fin   | capacite | prix_ttc |
      | Guadeloupe   | 2025-02-15 | 2025-02-22 | 10       | 1299.99  |
      | Martinique   | 2025-03-10 | 2025-03-17 | 8        | 1499.99  |
      | Saint-Martin | 2025-04-05 | 2025-04-12 | 5        | 1799.99  |

  Scénario: Réservation réussie avec 2 participants
    Étant donné que je suis sur la page de réservation
    Quand je sélectionne le séjour "Guadeloupe"
    Et je remplis mes coordonnées:
      | email     | client@example.com |
      | telephone | 0612345678         |
    Et j'ajoute les participants suivants:
      | nom    | prenom | date_naissance |
      | Dupont | Jean   | 1990-01-15     |
      | Martin | Marie  | 1985-05-20     |
    Et je soumets le formulaire de réservation
    Alors ma réservation est enregistrée avec le statut "en_attente"
    Et je reçois un email de confirmation à "client@example.com"
    Et l'administrateur reçoit une notification
    Et le montant total est de "2599.98 €"
    Et il reste "8" places disponibles pour le séjour "Guadeloupe"

  Scénario: Réservation avec supplément single (1 participant)
    Étant donné que je suis sur la page de réservation
    Quand je sélectionne le séjour "Martinique"
    Et je remplis mes coordonnées:
      | email     | solo@example.com |
      | telephone | 0687654321       |
    Et j'ajoute les participants suivants:
      | nom    | prenom | date_naissance |
      | Dupont | Jean   | 1990-01-15     |
    Et je soumets le formulaire de réservation
    Alors ma réservation est enregistrée
    Et le montant total est de "1949.99 €"
    # 1499.99 + 30% supplément single = 1949.99

  Scénario: Erreur quand le séjour est complet
    Étant donné que le séjour "Saint-Martin" a 0 places disponibles
    Quand je tente de réserver le séjour "Saint-Martin" avec 2 participants
    Alors je vois le message d'erreur "Séjour complet"
    Et ma réservation n'est pas enregistrée

  Scénario: Erreur avec données invalides
    Étant donné que je suis sur la page de réservation
    Quand je soumets le formulaire avec un email invalide "pas-un-email"
    Alors je vois le message d'erreur "Adresse email invalide"
    Et ma réservation n'est pas enregistrée

  Plan du scénario: Calcul du prix selon le nombre de participants
    Étant donné un séjour à "<prix_base>" €
    Quand je réserve avec "<nb_participants>" participants
    Alors le montant total est de "<montant_total>" €

    Exemples:
      | prix_base | nb_participants | montant_total |
      | 1000.00   | 1               | 1300.00       |
      | 1000.00   | 2               | 2000.00       |
      | 1000.00   | 3               | 3000.00       |
      | 1500.00   | 1               | 1950.00       |
      | 1500.00   | 2               | 3000.00       |

  Scénario: Confirmation d'une réservation (paiement reçu)
    Étant donné une réservation en attente avec la référence "RES-001"
    Quand l'administrateur confirme la réservation "RES-001"
    Alors le statut de la réservation devient "confirmee"
    Et la date de confirmation est enregistrée
    Et le client reçoit un email de confirmation de paiement
    Et les places sont réservées sur le séjour

  Scénario: Annulation d'une réservation
    Étant donné une réservation confirmée avec 2 participants
    Quand le client annule sa réservation avec le motif "Changement de dates"
    Alors le statut de la réservation devient "annulee"
    Et les 2 places sont libérées sur le séjour
    Et le client reçoit un email d'annulation
```

### Context Class

```php
<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use App\Entity\Reservation;
use App\Entity\Sejour;
use App\Entity\Participant;
use App\Domain\ValueObject\Money;
use App\Application\Service\ReservationService;
use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\Assert;
use Symfony\Component\Mailer\MailerInterface;

/**
 * Behat Context: Réservation
 */
final class ReservationContext implements Context
{
    private EntityManagerInterface $entityManager;
    private ReservationService $reservationService;
    private MailerInterface $mailer;

    // État du scénario
    private ?Sejour $currentSejour = null;
    private array $currentData = [];
    private ?Reservation $currentReservation = null;
    private ?\Exception $lastException = null;

    public function __construct(
        EntityManagerInterface $entityManager,
        ReservationService $reservationService,
        MailerInterface $mailer
    ) {
        $this->entityManager = $entityManager;
        $this->reservationService = $reservationService;
        $this->mailer = $mailer;
    }

    /**
     * @BeforeScenario
     */
    public function setUp(): void
    {
        $this->entityManager->beginTransaction();
        $this->currentData = [];
        $this->currentReservation = null;
        $this->lastException = null;
    }

    /**
     * @AfterScenario
     */
    public function tearDown(): void
    {
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }
    }

    // ========================================
    // GIVEN (Préconditions)
    // ========================================

    /**
     * @Given les séjours suivants:
     */
    public function lesSejours(TableNode $table): void
    {
        foreach ($table->getHash() as $row) {
            $sejour = new Sejour();
            $sejour->setDestination($row['destination']);
            $sejour->setDateDebut(new \DateTimeImmutable($row['date_debut']));
            $sejour->setDateFin(new \DateTimeImmutable($row['date_fin']));
            $sejour->setCapacite((int) $row['capacite']);
            $sejour->setPlacesRestantes((int) $row['capacite']);
            $sejour->setPrixTtc(Money::fromEuros((float) $row['prix_ttc']));

            $this->entityManager->persist($sejour);
        }

        $this->entityManager->flush();
    }

    /**
     * @Given que je suis sur la page de réservation
     */
    public function queJeSuisSurLaPageDeReservation(): void
    {
        // Dans un test UI (Mink), ce serait:
        // $this->visitPath('/reservation/new');

        // En test service, on initialise juste les données
        $this->currentData = [];
    }

    /**
     * @Given que le séjour :destination a :places places disponibles
     */
    public function queLeSejourAPlacesDisponibles(string $destination, int $places): void
    {
        $sejour = $this->entityManager
            ->getRepository(Sejour::class)
            ->findOneBy(['destination' => $destination]);

        Assert::assertNotNull($sejour, "Séjour '$destination' non trouvé");

        $sejour->setPlacesRestantes($places);
        $this->entityManager->flush();
    }

    /**
     * @Given une réservation en attente avec la référence :reference
     */
    public function uneReservationEnAttente(string $reference): void
    {
        $sejour = $this->entityManager
            ->getRepository(Sejour::class)
            ->findOneBy([]);

        $reservation = new Reservation($sejour, 'client@example.com', '0612345678');
        $reservation->setReference($reference);

        $participant = new Participant();
        $participant->setNom('Dupont');
        $participant->setPrenom('Jean');
        $participant->setDateNaissance(new \DateTimeImmutable('1990-01-15'));

        $reservation->addParticipant($participant);

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();

        $this->currentReservation = $reservation;
    }

    // ========================================
    // WHEN (Actions)
    // ========================================

    /**
     * @When je sélectionne le séjour :destination
     */
    public function jeSelectionneLeSejour(string $destination): void
    {
        $sejour = $this->entityManager
            ->getRepository(Sejour::class)
            ->findOneBy(['destination' => $destination]);

        Assert::assertNotNull($sejour, "Séjour '$destination' non trouvé");

        $this->currentSejour = $sejour;
        $this->currentData['sejour_id'] = $sejour->getId();
    }

    /**
     * @When je remplis mes coordonnées:
     */
    public function jeRemplisMesCoordonnees(TableNode $table): void
    {
        $data = $table->getRowsHash();

        $this->currentData['email_contact'] = $data['email'];
        $this->currentData['telephone_contact'] = $data['telephone'];
    }

    /**
     * @When j'ajoute les participants suivants:
     */
    public function jAjouteLesParticipants(TableNode $table): void
    {
        $this->currentData['participants'] = [];

        foreach ($table->getHash() as $row) {
            $this->currentData['participants'][] = [
                'nom' => $row['nom'],
                'prenom' => $row['prenom'],
                'date_naissance' => $row['date_naissance'],
            ];
        }
    }

    /**
     * @When je soumets le formulaire de réservation
     */
    public function jeSoumetsLeFormulaire(): void
    {
        try {
            $this->currentReservation = $this->reservationService->createReservation($this->currentData);
        } catch (\Exception $e) {
            $this->lastException = $e;
        }
    }

    /**
     * @When je tente de réserver le séjour :destination avec :nb participants
     */
    public function jeTenteDeReserver(string $destination, int $nb): void
    {
        $this->jeSelectionneLeSejour($destination);

        $this->currentData['email_contact'] = 'client@example.com';
        $this->currentData['telephone_contact'] = '0612345678';
        $this->currentData['participants'] = [];

        for ($i = 0; $i < $nb; $i++) {
            $this->currentData['participants'][] = [
                'nom' => "Participant$i",
                'prenom' => "Prenom$i",
                'date_naissance' => '1990-01-15',
            ];
        }

        $this->jeSoumetsLeFormulaire();
    }

    /**
     * @When je soumets le formulaire avec un email invalide :email
     */
    public function jeSoumetsAvecEmailInvalide(string $email): void
    {
        $this->currentData['email_contact'] = $email;
        $this->currentData['telephone_contact'] = '0612345678';
        $this->currentData['participants'] = [
            ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
        ];

        $this->jeSoumetsLeFormulaire();
    }

    /**
     * @When l'administrateur confirme la réservation :reference
     */
    public function lAdministrateurConfirme(string $reference): void
    {
        $reservation = $this->entityManager
            ->getRepository(Reservation::class)
            ->findOneBy(['reference' => $reference]);

        Assert::assertNotNull($reservation, "Réservation '$reference' non trouvée");

        $this->reservationService->confirmReservation($reservation);
        $this->currentReservation = $reservation;
    }

    /**
     * @When le client annule sa réservation avec le motif :motif
     */
    public function leClientAnnule(string $motif): void
    {
        $this->reservationService->cancelReservation($this->currentReservation, $motif);
    }

    // ========================================
    // THEN (Assertions)
    // ========================================

    /**
     * @Then ma réservation est enregistrée avec le statut :statut
     * @Then ma réservation est enregistrée
     */
    public function maReservationEstEnregistree(?string $statut = null): void
    {
        Assert::assertNotNull($this->currentReservation, 'Aucune réservation créée');

        if ($statut) {
            Assert::assertEquals($statut, $this->currentReservation->getStatut());
        }

        // Vérifier en BDD
        $this->entityManager->refresh($this->currentReservation);
        Assert::assertNotNull($this->currentReservation->getId());
    }

    /**
     * @Then je reçois un email de confirmation à :email
     */
    public function jeRecoisUnEmail(string $email): void
    {
        // Dans un vrai test, on vérifierait les emails envoyés
        // via le mailer de test Symfony
        // Assert::assertEmailCount(1);
        // Assert::assertEmailAddressContains($message, 'to', $email);

        // Pour l'exemple, on vérifie juste que l'email de contact correspond
        Assert::assertEquals($email, $this->currentReservation->getEmailContact());
    }

    /**
     * @Then l'administrateur reçoit une notification
     */
    public function lAdministrateurRecoitUneNotification(): void
    {
        // Assert::assertEmailCount(2); // Client + Admin
    }

    /**
     * @Then le montant total est de :montant
     */
    public function leMontantTotalEst(string $montant): void
    {
        // Supprimer les espaces et le symbole €
        $expectedAmount = (float) str_replace([' ', '€'], '', $montant);

        $actualAmount = $this->currentReservation->getMontantTotal()->toEuros();

        Assert::assertEquals($expectedAmount, $actualAmount, '', 0.01);
    }

    /**
     * @Then il reste :places places disponibles pour le séjour :destination
     */
    public function ilRestePlaces(int $places, string $destination): void
    {
        $sejour = $this->entityManager
            ->getRepository(Sejour::class)
            ->findOneBy(['destination' => $destination]);

        $this->entityManager->refresh($sejour);

        Assert::assertEquals($places, $sejour->getPlacesRestantes());
    }

    /**
     * @Then je vois le message d'erreur :message
     */
    public function jeVoisLeMessageErreur(string $message): void
    {
        Assert::assertNotNull($this->lastException, 'Aucune exception levée');
        Assert::assertStringContainsString($message, $this->lastException->getMessage());
    }

    /**
     * @Then ma réservation n'est pas enregistrée
     */
    public function maReservationNestPasEnregistree(): void
    {
        Assert::assertNull($this->currentReservation, 'Une réservation a été créée alors qu\'elle ne devrait pas');
    }

    /**
     * @Then le statut de la réservation devient :statut
     */
    public function leStatutDevient(string $statut): void
    {
        $this->entityManager->refresh($this->currentReservation);
        Assert::assertEquals($statut, $this->currentReservation->getStatut());
    }

    /**
     * @Then la date de confirmation est enregistrée
     */
    public function laDateDeConfirmationEstEnregistree(): void
    {
        Assert::assertNotNull($this->currentReservation->getConfirmedAt());
    }

    /**
     * @Then les places sont réservées sur le séjour
     */
    public function lesPlacesSontReservees(): void
    {
        $sejour = $this->currentReservation->getSejour();
        $this->entityManager->refresh($sejour);

        $placesReservees = $sejour->getCapacite() - $sejour->getPlacesRestantes();
        Assert::assertGreaterThan(0, $placesReservees);
    }

    /**
     * @Then les :nb places sont libérées sur le séjour
     */
    public function lesPlacesSontLiberees(int $nb): void
    {
        $sejour = $this->currentReservation->getSejour();
        $this->entityManager->refresh($sejour);

        // Vérifier que les places ont bien été libérées
        // (implémentation dépend de la logique métier)
    }
}
```

---

## Configuration Behat

```yaml
# behat.yml
default:
  suites:
    default:
      contexts:
        - App\Tests\Behat\ReservationContext

  extensions:
    Behat\Symfony2Extension:
      kernel:
        bootstrap: features/bootstrap.php
        class: App\Kernel
```

```php
// features/bootstrap.php
<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (file_exists(dirname(__DIR__).'/config/bootstrap.php')) {
    require dirname(__DIR__).'/config/bootstrap.php';
} elseif (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}
```

---

## Lancer les tests Behat

```bash
# Tous les tests
vendor/bin/behat

# Feature spécifique
vendor/bin/behat features/reservation.feature

# Scénario spécifique (par ligne)
vendor/bin/behat features/reservation.feature:15

# Avec tag
vendor/bin/behat --tags=@wip

# Dry-run (vérifier les steps)
vendor/bin/behat --dry-run

# Format de sortie
vendor/bin/behat --format=pretty
vendor/bin/behat --format=progress
```

---

## Checklist Test Behat

- [ ] Feature file en français (Gherkin)
- [ ] Scénarios lisibles par le métier
- [ ] Steps réutilisables (DRY)
- [ ] Context avec transaction rollback
- [ ] Assertions PHPUnit dans les Then
- [ ] Données de test réalistes
- [ ] Tags pour organiser les tests (@wip, @critical, etc.)
- [ ] Documentation living (specs exécutables)
- [ ] Performance acceptable (< 5s par scénario)
- [ ] Isolation complète entre scénarios
