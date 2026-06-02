# Plantilla: Servicio (Application/Domain)

> **Patrón DDD** - Servicio que contiene lógica de negocio u orquestación
> Referencia: `.claude/rules/01-architecture-ddd.md`

## Tipos de servicios

### Servicio de Dominio
- Lógica de negocio que no pertenece a una entidad específica
- Operaciones sobre múltiples agregados
- Dominio puro (sin dependencias de infraestructura)

### Servicio de Aplicación
- Orquestación de casos de uso
- Gestión de transacciones
- Llamada a servicios de dominio
- Interacción con repositorios

---

## Plantilla PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\[Domain|Application]\Service;

use App\Domain\Entity\[Entity];
use App\Domain\Repository\[Entity]RepositoryInterface;
use App\Domain\Exception\[DomainException];
use Psr\Log\LoggerInterface;

/**
 * Servicio: [NombreServicio]
 *
 * Responsabilidad: [Descripción de la responsabilidad única]
 *
 * Casos de uso:
 * - [Caso de uso 1]
 * - [Caso de uso 2]
 *
 * @see [Enlace a documentación de negocio si aplica]
 */
final readonly class [NombreServicio]
{
    /**
     * Inyección de constructor (Symfony autowiring)
     */
    public function __construct(
        private [Entity]RepositoryInterface $[entity]Repository,
        private LoggerInterface $logger,
        // Otras dependencias...
    ) {
    }

    /**
     * [Descripción del método]
     *
     * @param array<string, mixed> $data Datos de entrada
     * @return [Entity] Entidad creada/modificada
     * @throws [DomainException] Si [condición de error]
     */
    public function [nombreMetodo](array $data): [Entity]
    {
        // 1. Validación de datos de entrada
        $this->validateData($data);

        // 2. Lógica de negocio
        $entity = $this->buildEntity($data);

        // 3. Persistencia
        $this->[entity]Repository->save($entity, true);

        // 4. Logging
        $this->logger->info('[Acción realizada]', [
            'entity_id' => $entity->getId(),
            'context' => 'additional_info',
        ]);

        // 5. Retorno
        return $entity;
    }

    /**
     * Validación de datos de negocio
     *
     * @throws [DomainException]
     */
    private function validateData(array $data): void
    {
        if (/* condición inválida */) {
            throw new [DomainException]('Mensaje de error de negocio');
        }
    }

    /**
     * Construcción de la entidad
     */
    private function buildEntity(array $data): [Entity]
    {
        $entity = new [Entity]();
        // Hidratación...
        return $entity;
    }
}
```

---

## Ejemplo 1: ReservationService (Servicio de Aplicación)

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
 * Servicio: Gestión de reservas
 *
 * Responsabilidad: Orquestar la creación/modificación de reservas
 *
 * Casos de uso:
 * - Crear una reserva con participantes
 * - Validar la disponibilidad de la estancia
 * - Enviar los emails de confirmación
 * - Calcular el precio total
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
     * Crea una nueva reserva
     *
     * @param array{
     *     sejour_id: int,
     *     email_contact: string,
     *     telephone_contact: string,
     *     participants: array<array{nom: string, prenom: string, date_naissance: string}>
     * } $data
     *
     * @throws SejourCompletException Si no hay suficientes plazas
     * @throws ParticipantInvalideException Si el participante es inválido
     */
    public function createReservation(array $data): Reservation
    {
        // 1. Recuperar la estancia
        $sejour = $this->sejourRepository->find($data['sejour_id']);
        if (!$sejour) {
            throw new \InvalidArgumentException('Séjour non trouvé');
        }

        // 2. Verificar la disponibilidad
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

        // 3. Transacción para garantizar la coherencia
        $this->entityManager->beginTransaction();

        try {
            // 4. Crear la reserva
            $reservation = new Reservation();
            $reservation->setSejour($sejour);
            $reservation->setEmailContact($data['email_contact']);
            $reservation->setTelephoneContact($data['telephone_contact']);
            $reservation->setStatut('en_attente');

            // 5. Añadir los participantes
            foreach ($data['participants'] as $participantData) {
                $participant = $this->createParticipant($participantData);
                $reservation->addParticipant($participant);
            }

            // 6. Calcular el precio total
            $reservation->calculerMontantTotal();

            // 7. Guardar
            $this->reservationRepository->save($reservation, true);

            // 8. Commit transacción
            $this->entityManager->commit();

            // 9. Enviar emails (fuera de la transacción)
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
     * Confirma una reserva (pago recibido)
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
     * Cancela una reserva
     */
    public function cancelReservation(Reservation $reservation, string $motif): void
    {
        // Liberar las plazas
        $sejour = $reservation->getSejour();
        $sejour->libererPlaces($reservation->getNbParticipants());

        // Marcar como cancelada
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
     * Crea un participante a partir de los datos
     *
     * @throws ParticipantInvalideException
     */
    private function createParticipant(array $data): Participant
    {
        // Validación
        if (empty($data['nom']) || empty($data['prenom'])) {
            throw new ParticipantInvalideException('Nom et prénom obligatoires');
        }

        // Validación edad (ejemplo: solo mayores)
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
        $sejour = $this->createSejour('Martinique', 1); // 1 sola plaza
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
        $this->assertEmailCount(2); // Cliente + Admin
        $this->assertEmailAddressContains($emails[0], 'to', 'client@example.com');
        $this->assertEmailAddressContains($emails[1], 'to', 'admin@atoll-tourisme.com');
    }
}
```

---

## Ejemplo 2: PrixCalculatorService (Servicio de Dominio)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Service;

use App\Domain\Entity\Reservation;
use App\Domain\ValueObject\Money;

/**
 * Servicio: Cálculo del precio de las reservas
 *
 * Responsabilidad: Calcular el precio total según las reglas de negocio
 *
 * Reglas:
 * - Precio base × número de participantes
 * - + Suplemento individual si 1 participante
 * - + Opciones (seguro, etc.)
 * - - Reducción código promocional
 */
final readonly class PrixCalculatorService
{
    private const SUPPLEMENT_SINGLE_PERCENT = 30; // +30% si 1 participante

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

## Principios SOLID

### Single Responsibility Principle (SRP)
✅ Un servicio = una responsabilidad de negocio

```php
// ❌ MALO: Servicio que hace de todo
class ReservationManager {
    public function create() {}
    public function sendEmail() {}
    public function generatePdf() {}
    public function calculatePrice() {}
}

// ✅ BUENO: Servicios separados
class ReservationService {} // Gestión de reservas
class ReservationMailer {} // Envío de emails
class PdfGenerator {} // Generación de PDF
class PrixCalculator {} // Cálculo de precios
```

### Dependency Inversion Principle (DIP)
✅ Depender de interfaces, no de implementaciones

```php
// Interfaz (dominio)
interface ReservationRepositoryInterface {
    public function save(Reservation $reservation): void;
}

// Servicio depende de la interfaz
class ReservationService {
    public function __construct(
        private ReservationRepositoryInterface $repository // Interfaz, no implementación
    ) {}
}

// Implementación (infraestructura)
class DoctrineReservationRepository implements ReservationRepositoryInterface {
    public function save(Reservation $reservation): void {
        // Doctrine ORM
    }
}
```

---

## Checklist de Servicio

- [ ] Clase `final readonly`
- [ ] Inyección de constructor únicamente
- [ ] Una sola responsabilidad (SRP)
- [ ] Sin lógica de negocio en el constructor
- [ ] Métodos públicos documentados (PHPDoc)
- [ ] Gestión de excepciones de negocio
- [ ] Logging de operaciones importantes
- [ ] Transacciones para garantizar coherencia
- [ ] Tests unitarios + integración (>80% cobertura)
- [ ] Dependencias inyectadas vía interfaces (DIP)
