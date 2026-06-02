# Plantilla: Test de Integración (PHPUnit)

> **Patrón TDD** - Tests de integración para validar la interacción entre componentes
> Referencia: `.claude/rules/04-testing-tdd.md`

## ¿Qué es un test de integración?

Un test de integración:
- ✅ **Prueba la interacción** entre varios componentes
- ✅ **Usa la infraestructura real** (BD, Symfony Kernel)
- ✅ **Más lento** que los tests unitarios (< 1s por test)
- ✅ **Transacciones automáticas** (rollback después de cada test)
- ✅ **Fixtures de datos** para setup

---

## Plantilla PHPUnit 10+ (Symfony WebTestCase)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Integration\[Namespace];

use App\Entity\[Entity];
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tests de integración: [Feature]
 *
 * Lo que se prueba:
 * - [Interacción componente 1 + componente 2]
 * - [Persistencia en base de datos]
 * - [Workflow completo]
 *
 * @group integration
 */
class [Feature]IntegrationTest extends WebTestCase
{
    private ?EntityManagerInterface $entityManager;

    /**
     * Setup ejecutado antes de cada test
     */
    protected function setUp(): void
    {
        // Iniciar el kernel de Symfony
        self::bootKernel();

        // Obtener el EntityManager
        $this->entityManager = self::getContainer()
            ->get('doctrine')
            ->getManager();

        // Iniciar una transacción (auto-rollback)
        $this->entityManager->beginTransaction();
    }

    /**
     * Cleanup después de cada test
     */
    protected function tearDown(): void
    {
        // Rollback automático de la transacción
        if ($this->entityManager && $this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }

        // Cerrar el EntityManager
        if ($this->entityManager) {
            $this->entityManager->close();
            $this->entityManager = null;
        }

        parent::tearDown();
    }

    /**
     * @test
     */
    public function it_[comportamiento]_with_real_database(): void
    {
        // ========================================
        // ARRANGE - Fixtures
        // ========================================
        $entity = new [Entity]();
        // Configuración...

        $this->entityManager->persist($entity);
        $this->entityManager->flush();

        // ========================================
        // ACT - Ejecución
        // ========================================
        $result = $this->entityManager
            ->getRepository([Entity]::class)
            ->find($entity->getId());

        // ========================================
        // ASSERT - Verificación
        // ========================================
        $this->assertNotNull($result);
        $this->assertEquals($entity->getId(), $result->getId());
    }
}
```

---

## Ejemplo 1: Test Controller + BD (WebTestCase)

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
 * Tests de integración: ReservationController
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

        // Crear una estancia en BD
        $sejour = $this->createSejour('Guadalupe', 10);

        // ACT - Enviar el formulario
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

        // ASSERT - Verificar la redirección
        $this->assertResponseRedirects('/reservation/confirmation');

        $client->followRedirect();
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Réservation confirmée');

        // Verificar en BD
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
        $sejour = $this->createSejour('Martinica', 10);

        // ACT
        $client->request('POST', '/api/reservation/create', [
            'sejour_id' => $sejour->getId(),
            'email_contact' => 'client@example.com',
            'telephone_contact' => '0612345678',
            'participants' => [
                ['nom' => 'Martin', 'prenom' => 'Sophie', 'date_naissance' => '1985-05-20'],
            ],
        ]);

        // ASSERT - Verificar la respuesta
        $this->assertResponseIsSuccessful();

        // Verificar los emails enviados
        $this->assertEmailCount(2); // Cliente + Admin

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

        // Crear una estancia completa
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
        $sejour = $this->createSejour('Guadalupe', 10);

        // ACT - Datos inválidos
        $crawler = $client->request('GET', '/reservation/new');

        $form = $crawler->selectButton('Réserver')->form([
            'reservation_form[sejour]' => $sejour->getId(),
            'reservation_form[emailContact]' => 'invalid-email', // Email inválido
            'reservation_form[telephoneContact]' => '123', // Demasiado corto
            'reservation_form[participants][0][nom]' => '', // Vacío
        ]);

        $client->submit($form);

        // ASSERT - Sin redirección (errores de validación)
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
        $sejour = $this->createSejour('Guadalupe', 10);
        $sejour->setPrixTtc(Money::fromEuros(1000.00));
        $this->entityManager->flush();

        // ACT - 2 participantes
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

        // 1000 € × 2 participantes = 2000 €
        $this->assertEquals(2000.00, $response['montant_total']);

        // Verificar en BD
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
        $sejour = $this->createSejour('Martinica', 10);
        $sejour->setPrixTtc(Money::fromEuros(1000.00));
        $this->entityManager->flush();

        // ACT - 1 solo participante
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

        // 1000 € + 30% suplemento individual = 1300 €
        $this->assertEquals(1300.00, $response['montant_total']);
    }

    // ========================================
    // HELPERS
    // ========================================

    private function createSejour(string $destino, int $capacidad): Sejour
    {
        $sejour = new Sejour();
        $sejour->setDestination($destino);
        $sejour->setDescription('Magnífica estancia en las Antillas');
        $sejour->setDateDebut(new \DateTimeImmutable('2025-02-15'));
        $sejour->setDateFin(new \DateTimeImmutable('2025-02-22'));
        $sejour->setCapacite($capacidad);
        $sejour->setPlacesRestantes($capacidad);
        $sejour->setPrixTtc(Money::fromEuros(1299.99));

        $this->entityManager->persist($sejour);
        $this->entityManager->flush();

        return $sejour;
    }
}
```

---

## Ejemplo 2: Test Repository (Doctrine)

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
 * Tests de integración: ReservationRepository
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
        $sejour = $this->createSejour('Guadalupe');
        $reservation = new Reservation($sejour, 'client@example.com', '0612345678');

        // ACT - Guardar
        $this->repository->save($reservation, true);

        // Recuperar
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
        $sejour1 = $this->createSejour('Guadalupe');
        $sejour2 = $this->createSejour('Martinica');

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
        $sejour = $this->createSejour('Guadalupe');

        $reservation1 = new Reservation($sejour, 'client1@example.com', '0612345678');
        $reservation1->addParticipant($this->createParticipant());
        $reservation1->confirm();

        $reservation2 = new Reservation($sejour, 'client2@example.com', '0687654321');
        // No confirmada

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
        $sejour = $this->createSejour('Martinica');

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
        $sejour = $this->createSejour('Guadalupe');
        $reservation = new Reservation($sejour, 'client@example.com', '0612345678');

        $participant = $this->createParticipant();
        $reservation->addParticipant($participant);

        $this->repository->save($reservation, true);

        $participantId = $participant->getId();

        // ACT - Eliminar la reserva
        $this->repository->remove($reservation, true);

        // ASSERT - Reserva eliminada
        $this->assertNull($this->repository->find($reservation->getId()));

        // Participante también eliminado (cascade + orphanRemoval)
        $participantRepo = $this->entityManager->getRepository(Participant::class);
        $this->assertNull($participantRepo->find($participantId));
    }

    // ========================================
    // HELPERS
    // ========================================

    private function createSejour(string $destino): Sejour
    {
        $sejour = new Sejour();
        $sejour->setDestination($destino);
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

## Ejemplo 3: Test de Servicio con BD real

```php
<?php

declare(strict_types=1);

namespace App\Tests\Integration\Service;

use App\Application\Service\ReservationService;
use App\Entity\Sejour;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Tests de integración: ReservationService (con BD real)
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
        $sejour = $this->createSejour('Guadalupe', 10);

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

        // Refrescar desde la BD
        $this->entityManager->clear();
        $reservationFromDb = $this->entityManager
            ->getRepository(Reservation::class)
            ->find($reservation->getId());

        // ASSERT
        $this->assertNotNull($reservationFromDb);
        $this->assertEquals('en_attente', $reservationFromDb->getStatut());
        $this->assertCount(1, $reservationFromDb->getParticipants());
    }

    private function createSejour(string $destino, int $capacidad): Sejour
    {
        $sejour = new Sejour();
        $sejour->setDestination($destino);
        $sejour->setCapacite($capacidad);
        $sejour->setPlacesRestantes($capacidad);

        $this->entityManager->persist($sejour);
        $this->entityManager->flush();

        return $sejour;
    }
}
```

---

## Fixtures de datos

```php
// Método 1: Fixtures inline
private function loadFixtures(): void
{
    $sejour1 = new Sejour();
    $sejour1->setDestination('Guadalupe');
    // ...
    $this->entityManager->persist($sejour1);

    $sejour2 = new Sejour();
    $sejour2->setDestination('Martinica');
    // ...
    $this->entityManager->persist($sejour2);

    $this->entityManager->flush();
}

// Método 2: Usar DoctrineFixturesBundle
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;

protected function setUp(): void
{
    self::bootKernel();

    // Cargar las fixtures del grupo "test"
    $this->loadFixtures([
        SejourFixtures::class,
    ]);
}
```

---

## Checklist Test de Integración

- [ ] Extiende `WebTestCase` o `KernelTestCase`
- [ ] Transacción en `setUp()` + rollback en `tearDown()`
- [ ] Fixtures de datos claras
- [ ] Prueba la interacción entre componentes
- [ ] Verifica la persistencia en BD
- [ ] Prueba los casos de error (restricciones BD, etc.)
- [ ] Aserciones sobre emails enviados (si aplica)
- [ ] Rendimiento aceptable (< 1s por test)
- [ ] Limpieza completa en `tearDown()`
- [ ] Grupo `@group integration` para aislamiento
