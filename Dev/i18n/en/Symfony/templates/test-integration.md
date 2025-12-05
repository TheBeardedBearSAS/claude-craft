# Template: Test d'Intégration (PHPUnit)

> **Pattern TDD** - Tests d'intégration pour valider l'interaction entre composants
> Reference: `.claude/rules/04-testing-tdd.md`

## Qu'est-ce qu'un test d'intégration ?

Un test d'intégration:
- ✅ **Teste l'interaction** entre plusieurs composants
- ✅ **Utilise la vraie infrastructure** (BDD, Symfony Kernel)
- ✅ **Plus lent** que les tests unitaires (< 1s par test)
- ✅ **Transactions automatiques** (rollback après chaque test)
- ✅ **Fixtures de données** pour setup

---

## Template PHPUnit 10+ (Symfony WebTestCase)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Integration\[Namespace];

use App\Entity\[Entity];
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tests d'intégration: [Feature]
 *
 * Ce qui est testé:
 * - [Interaction composant 1 + composant 2]
 * - [Persistance en base de données]
 * - [Workflow complet]
 *
 * @group integration
 */
class [Feature]IntegrationTest extends WebTestCase
{
    private ?EntityManagerInterface $entityManager;

    /**
     * Setup exécuté avant chaque test
     */
    protected function setUp(): void
    {
        // Booter le kernel Symfony
        self::bootKernel();

        // Récupérer l'EntityManager
        $this->entityManager = self::getContainer()
            ->get('doctrine')
            ->getManager();

        // Démarrer une transaction (auto-rollback)
        $this->entityManager->beginTransaction();
    }

    /**
     * Cleanup après chaque test
     */
    protected function tearDown(): void
    {
        // Rollback automatique de la transaction
        if ($this->entityManager && $this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }

        // Fermer l'EntityManager
        if ($this->entityManager) {
            $this->entityManager->close();
            $this->entityManager = null;
        }

        parent::tearDown();
    }

    /**
     * @test
     */
    public function it_[comportement]_with_real_database(): void
    {
        // ========================================
        // ARRANGE - Fixtures
        // ========================================
        $entity = new [Entity]();
        // Configuration...

        $this->entityManager->persist($entity);
        $this->entityManager->flush();

        // ========================================
        // ACT - Exécution
        // ========================================
        $result = $this->entityManager
            ->getRepository([Entity]::class)
            ->find($entity->getId());

        // ========================================
        // ASSERT - Vérification
        // ========================================
        $this->assertNotNull($result);
        $this->assertEquals($entity->getId(), $result->getId());
    }
}
```

---

## Example 1: Test Controller + BDD (WebTestCase)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Integration\Controller;

use App\Entity\Reservation;
use App\Entity\Sejour;
use App\Entity\Participant;
use App\Domain\ValueObject\Money;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tests d'intégration: ReservationController
 *
 * @group integration
 * @group controller
 */
class ReservationControllerTest extends WebTestCase
{
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->entityManager = self::getContainer()->get('doctrine')->getManager();
        $this->entityManager->beginTransaction();
    }

    protected function tearDown(): void
    {
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }
        $this->entityManager->close();
        parent::tearDown();
    }

    /** @test */
    public function it_creates_reservation_via_form_submission(): void
    {
        // ARRANGE
        $client = static::createClient();

        // Créer un séjour en BDD
        $sejour = $this->createSejour('Guadeloupe', 10);

        // ACT - Soumettre le formulaire
        $crawler = $client->request('GET', '/reservation/new');

        $form = $crawler->selectButton('Réserver')->form([
            'reservation_form[sejour]' => $sejour->getId(),
            'reservation_form[emailContact]' => 'client@example.com',
            'reservation_form[telephoneContact]' => '0612345678',
            'reservation_form[participants][0][nom]' => 'Dupont',
            'reservation_form[participants][0][prenom]' => 'Jean',
            'reservation_form[participants][0][dateNaissance]' => '1990-01-15',
        ]);

        $client->submit($form);

        // ASSERT - Vérifier la redirection
        $this->assertResponseRedirects('/reservation/confirmation');

        $client->followRedirect();
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Réservation confirmée');

        // Vérifier en BDD
        $reservations = $this->entityManager
            ->getRepository(Reservation::class)
            ->findBy(['emailContact' => 'client@example.com']);

        $this->assertCount(1, $reservations);

        $reservation = $reservations[0];
        $this->assertEquals('en_attente', $reservation->getStatut());
        $this->assertCount(1, $reservation->getParticipants());
        $this->assertEquals('Dupont', $reservation->getParticipants()[0]->getNom());
    }

    /** @test */
    public function it_sends_confirmation_emails_after_reservation(): void
    {
        // ARRANGE
        $client = static::createClient();
        $sejour = $this->createSejour('Martinique', 10);

        // ACT
        $client->request('POST', '/api/reservation/create', [
            'sejour_id' => $sejour->getId(),
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Martin', 'prenom' => 'Sophie', 'date_naissance' => '1985-05-20'],
            ],
        ]);

        // ASSERT - Vérifier la réponse
        $this->assertResponseIsSuccessful();

        // Vérifier les emails envoyés
        $this->assertEmailCount(2); // Client + Admin

        $clientEmail = $this->getMailerMessage(0);
        $this->assertEmailAddressContains($clientEmail, 'to', 'client@example.com');
        $this->assertEmailHeaderSame($clientEmail, 'subject', 'Confirmation de réservation');

        $adminEmail = $this->getMailerMessage(1);
        $this->assertEmailAddressContains($adminEmail, 'to', 'admin@atoll-tourisme.com');
    }

    /** @test */
    public function it_returns_error_when_sejour_full(): void
    {
        // ARRANGE
        $client = static::createClient();

        // Créer un séjour complet
        $sejourComplet = $this->createSejour('Saint-Martin', 1);
        $sejourComplet->setPlacesRestantes(0);
        $this->entityManager->flush();

        // ACT
        $client->request('POST', '/api/reservation/create', [
            'sejour_id' => $sejourComplet->getId(),
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
            ],
        ]);

        // ASSERT
        $this->assertResponseStatusCodeSame(Response::HTTP_CONFLICT);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Séjour complet', $response['error']);
    }

    /** @test */
    public function it_validates_form_data(): void
    {
        // ARRANGE
        $client = static::createClient();
        $sejour = $this->createSejour('Guadeloupe', 10);

        // ACT - Données invalides
        $crawler = $client->request('GET', '/reservation/new');

        $form = $crawler->selectButton('Réserver')->form([
            'reservation_form[sejour]' => $sejour->getId(),
            'reservation_form[emailContact]' => 'invalid-email', // Email invalide
            'reservation_form[telephoneContact]' => '123', // Trop court
            'reservation_form[participants][0][nom]' => '', // Vide
        ]);

        $client->submit($form);

        // ASSERT - Pas de redirection (erreurs de validation)
        $this->assertResponseIsUnprocessable();
        $this->assertSelectorExists('.form-error');
        $this->assertSelectorTextContains('.form-error', 'Email invalide');
        $this->assertSelectorTextContains('.form-error', 'Nom obligatoire');
    }

    /** @test */
    public function it_calculates_total_price_correctly(): void
    {
        // ARRANGE
        $client = static::createClient();
        $sejour = $this->createSejour('Guadeloupe', 10);
        $sejour->setPrixTtc(Money::fromEuros(1000.00));
        $this->entityManager->flush();

        // ACT - 2 participants
        $client->request('POST', '/api/reservation/create', [
            'sejour_id' => $sejour->getId(),
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
                ['nom' => 'Martin', 'prenom' => 'Marie', 'date_naissance' => '1985-05-20'],
            ],
        ]);

        // ASSERT
        $response = json_decode($client->getResponse()->getContent(), true);

        // 1000 € × 2 participants = 2000 €
        $this->assertEquals(2000.00, $response['montant_total']);

        // Vérifier en BDD
        $reservation = $this->entityManager
            ->getRepository(Reservation::class)
            ->find($response['id']);

        $this->assertEquals(2000.00, $reservation->getMontantTotal()->toEuros());
    }

    /** @test */
    public function it_applies_single_supplement_for_one_participant(): void
    {
        // ARRANGE
        $client = static::createClient();
        $sejour = $this->createSejour('Martinique', 10);
        $sejour->setPrixTtc(Money::fromEuros(1000.00));
        $this->entityManager->flush();

        // ACT - 1 seul participant
        $client->request('POST', '/api/reservation/create', [
            'sejour_id' => $sejour->getId(),
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
            ],
        ]);

        // ASSERT
        $response = json_decode($client->getResponse()->getContent(), true);

        // 1000 € + 30% supplément single = 1300 €
        $this->assertEquals(1300.00, $response['montant_total']);
    }

    // ========================================
    // HELPERS
    // ========================================

    private function createSejour(string $destination, int $capacite): Sejour
    {
        $sejour = new Sejour();
        $sejour->setDestination($destination);
        $sejour->setDescription('Magnifique séjour aux Antilles');
        $sejour->setDateDebut(new \DateTimeImmutable('2025-02-15'));
        $sejour->setDateFin(new \DateTimeImmutable('2025-02-22'));
        $sejour->setCapacite($capacite);
        $sejour->setPlacesRestantes($capacite);
        $sejour->setPrixTtc(Money::fromEuros(1299.99));

        $this->entityManager->persist($sejour);
        $this->entityManager->flush();

        return $sejour;
    }
}
```

---

## Example 2: Test Repository (Doctrine)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Integration\Repository;

use App\Entity\Reservation;
use App\Entity\Sejour;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Tests d'intégration: ReservationRepository
 *
 * @group integration
 * @group repository
 */
class ReservationRepositoryTest extends KernelTestCase
{
    private EntityManagerInterface $entityManager;
    private ReservationRepository $repository;

    protected function setUp(): void
    {
        self::bootKernel();

        $this->entityManager = self::getContainer()->get('doctrine')->getManager();
        $this->repository = $this->entityManager->getRepository(Reservation::class);

        $this->entityManager->beginTransaction();
    }

    protected function tearDown(): void
    {
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }
        $this->entityManager->close();
        parent::tearDown();
    }

    /** @test */
    public function it_saves_and_retrieves_reservation(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe');
        $reservation = new Reservation($sejour, 'client@example.com', '0612345678');

        // ACT - Sauvegarder
        $this->repository->save($reservation, true);

        // Récupérer
        $retrieved = $this->repository->find($reservation->getId());

        // ASSERT
        $this->assertNotNull($retrieved);
        $this->assertEquals($reservation->getId(), $retrieved->getId());
        $this->assertEquals('client@example.com', $retrieved->getEmailContact());
    }

    /** @test */
    public function it_finds_reservations_by_sejour(): void
    {
        // ARRANGE
        $sejour1 = $this->createSejour('Guadeloupe');
        $sejour2 = $this->createSejour('Martinique');

        $reservation1 = new Reservation($sejour1, 'client1@example.com', '0612345678');
        $reservation2 = new Reservation($sejour1, 'client2@example.com', '0687654321');
        $reservation3 = new Reservation($sejour2, 'client3@example.com', '0698765432');

        $this->repository->save($reservation1, true);
        $this->repository->save($reservation2, true);
        $this->repository->save($reservation3, true);

        // ACT
        $reservations = $this->repository->findBy(['sejour' => $sejour1]);

        // ASSERT
        $this->assertCount(2, $reservations);
        $this->assertEquals($sejour1->getId(), $reservations[0]->getSejour()->getId());
    }

    /** @test */
    public function it_finds_confirmed_reservations(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe');

        $reservation1 = new Reservation($sejour, 'client1@example.com', '0612345678');
        $reservation1->addParticipant($this->createParticipant());
        $reservation1->confirm();

        $reservation2 = new Reservation($sejour, 'client2@example.com', '0687654321');
        // Non confirmée

        $this->repository->save($reservation1, true);
        $this->repository->save($reservation2, true);

        // ACT
        $confirmedReservations = $this->repository->findBy(['statut' => 'confirmee']);

        // ASSERT
        $this->assertCount(1, $confirmedReservations);
        $this->assertTrue($confirmedReservations[0]->isConfirmee());
    }

    /** @test */
    public function it_counts_participants_for_sejour(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Martinique');

        $reservation1 = new Reservation($sejour, 'client1@example.com', '0612345678');
        $reservation1->addParticipant($this->createParticipant());
        $reservation1->addParticipant($this->createParticipant());

        $reservation2 = new Reservation($sejour, 'client2@example.com', '0687654321');
        $reservation2->addParticipant($this->createParticipant());

        $this->repository->save($reservation1, true);
        $this->repository->save($reservation2, true);

        // ACT
        $count = $this->repository->countParticipantsBySejour($sejour);

        // ASSERT
        $this->assertEquals(3, $count); // 2 + 1
    }

    /** @test */
    public function it_deletes_reservation_with_cascade(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe');
        $reservation = new Reservation($sejour, 'client@example.com', '0612345678');

        $participant = $this->createParticipant();
        $reservation->addParticipant($participant);

        $this->repository->save($reservation, true);

        $participantId = $participant->getId();

        // ACT - Supprimer la réservation
        $this->repository->remove($reservation, true);

        // ASSERT - Réservation supprimée
        $this->assertNull($this->repository->find($reservation->getId()));

        // Participant aussi supprimé (cascade + orphanRemoval)
        $participantRepo = $this->entityManager->getRepository(Participant::class);
        $this->assertNull($participantRepo->find($participantId));
    }

    // ========================================
    // HELPERS
    // ========================================

    private function createSejour(string $destination): Sejour
    {
        $sejour = new Sejour();
        $sejour->setDestination($destination);
        $sejour->setDateDebut(new \DateTimeImmutable('2025-02-15'));
        $sejour->setDateFin(new \DateTimeImmutable('2025-02-22'));
        $sejour->setCapacite(10);
        $sejour->setPlacesRestantes(10);
        $sejour->setPrixTtc(Money::fromEuros(1299.99));

        $this->entityManager->persist($sejour);
        $this->entityManager->flush();

        return $sejour;
    }

    private function createParticipant(): Participant
    {
        $participant = new Participant();
        $participant->setNom('Dupont');
        $participant->setPrenom('Jean');
        $participant->setDateNaissance(new \DateTimeImmutable('1990-01-15'));

        return $participant;
    }
}
```

---

## Example 3: Test Service avec vraie BDD

```php
<?php

declare(strict_types=1);

namespace App\Tests\Integration\Service;

use App\Application\Service\ReservationService;
use App\Entity\Sejour;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Tests d'intégration: ReservationService (avec vraie BDD)
 *
 * @group integration
 */
class ReservationServiceIntegrationTest extends KernelTestCase
{
    private ReservationService $service;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        self::bootKernel();

        $this->service = self::getContainer()->get(ReservationService::class);
        $this->entityManager = self::getContainer()->get('doctrine')->getManager();

        $this->entityManager->beginTransaction();
    }

    protected function tearDown(): void
    {
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }
        $this->entityManager->close();
        parent::tearDown();
    }

    /** @test */
    public function it_creates_reservation_with_real_persistence(): void
    {
        // ARRANGE
        $sejour = $this->createSejour('Guadeloupe', 10);

        $data = [
            'sejour_id' => $sejour->getId(),
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
            ],
        ];

        // ACT
        $reservation = $this->service->createReservation($data);

        // Rafraîchir depuis la BDD
        $this->entityManager->clear();
        $reservationFromDb = $this->entityManager
            ->getRepository(Reservation::class)
            ->find($reservation->getId());

        // ASSERT
        $this->assertNotNull($reservationFromDb);
        $this->assertEquals('en_attente', $reservationFromDb->getStatut());
        $this->assertCount(1, $reservationFromDb->getParticipants());
    }

    private function createSejour(string $destination, int $capacite): Sejour
    {
        $sejour = new Sejour();
        $sejour->setDestination($destination);
        $sejour->setCapacite($capacite);
        $sejour->setPlacesRestantes($capacite);

        $this->entityManager->persist($sejour);
        $this->entityManager->flush();

        return $sejour;
    }
}
```

---

## Fixtures de données

```php
// Méthode 1: Fixtures inline
private function loadFixtures(): void
{
    $sejour1 = new Sejour();
    $sejour1->setDestination('Guadeloupe');
    // ...
    $this->entityManager->persist($sejour1);

    $sejour2 = new Sejour();
    $sejour2->setDestination('Martinique');
    // ...
    $this->entityManager->persist($sejour2);

    $this->entityManager->flush();
}

// Méthode 2: Utiliser DoctrineFixturesBundle
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;

protected function setUp(): void
{
    self::bootKernel();

    // Charger les fixtures du groupe "test"
    $this->loadFixtures([
        SejourFixtures::class,
    ]);
}
```

---

## Checklist Test d'Intégration

- [ ] Extends `WebTestCase` ou `KernelTestCase`
- [ ] Transaction en `setUp()` + rollback en `tearDown()`
- [ ] Fixtures de données claires
- [ ] Tester l'interaction entre composants
- [ ] Check la persistance en BDD
- [ ] Tester les cas d'erreur (contraintes BDD, etc.)
- [ ] Assertions sur les emails envoyés (si applicable)
- [ ] Performance acceptable (< 1s par test)
- [ ] Nettoyage complet en `tearDown()`
- [ ] Groupe `@group integration` pour isolation
