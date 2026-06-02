# Plantilla: Test BDD Behat (Behavior-Driven Development)

> **Patrón BDD** - Tests funcionales en lenguaje natural (Gherkin)
> Referencia: `.claude/rules/04-testing-tdd.md`

## ¿Qué es un test Behat?

Un test Behat:
- ✅ **Lenguaje natural** (Gherkin: Given/When/Then)
- ✅ **Legible por negocio** (Product Owner, clientes)
- ✅ **Tests end-to-end** (UI, API, BD)
- ✅ **Especificaciones ejecutables**
- ✅ **Documentación viva**

---

## Estructura de un test Behat

### 1. Feature File (`.feature`)

```gherkin
# features/[nombre_feature].feature
# language: es

Funcionalidad: [Título de la funcionalidad]
  Como [rol]
  Quiero [acción]
  Para [beneficio de negocio]

  Contexto:
    Dado [precondiciones comunes a todos los escenarios]

  Escenario: [Título del escenario nominal]
    Dado [estado inicial]
    Y [otra precondición]
    Cuando [acción disparada]
    Y [otra acción]
    Entonces [resultado esperado]
    Y [otro resultado]

  Esquema del escenario: [Título del escenario parametrizado]
    Dado [estado con <parametro>]
    Cuando [acción con <parametro>]
    Entonces [resultado con <parametro>]

    Ejemplos:
      | parametro1 | parametro2 | resultado |
      | valor1     | valor2     | esperado1 |
      | valor3     | valor4     | esperado2 |
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
 * Implementa los steps Gherkin para [feature]
 */
final class [Feature]Context implements Context
{
    private EntityManagerInterface $entityManager;
    private KernelInterface $kernel;

    // Estado compartido entre steps
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
        // Iniciar una transacción antes de cada escenario
        $this->entityManager->beginTransaction();
    }

    /**
     * @AfterScenario
     */
    public function tearDown(): void
    {
        // Rollback después de cada escenario
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }
    }

    /**
     * @Given /patrón regex del step/
     */
    public function stepImplementation(): void
    {
        // Implementación del step
    }
}
```

---

## Ejemplo 1: Reserva de estancia (Feature completa)

### Feature File

```gherkin
# features/reservation.feature
# language: es

Funcionalidad: Reserva de estancia
  Como cliente
  Quiero reservar una estancia con varios participantes
  Para irme de vacaciones a las Antillas

  Contexto:
    Dado las siguientes estancias:
      | destino      | fecha_inicio | fecha_fin  | capacidad | precio_ttc |
      | Guadalupe    | 2025-02-15   | 2025-02-22 | 10        | 1299.99    |
      | Martinica    | 2025-03-10   | 2025-03-17 | 8         | 1499.99    |
      | Saint-Martin | 2025-04-05   | 2025-04-12 | 5         | 1799.99    |

  Escenario: Reserva exitosa con 2 participantes
    Dado que estoy en la página de reserva
    Cuando selecciono la estancia "Guadalupe"
    Y relleno mis datos de contacto:
      | email     | cliente@example.com |
      | telefono  | 0612345678          |
    Y añado los siguientes participantes:
      | apellido | nombre | fecha_nacimiento |
      | Dupont   | Jean   | 1990-01-15       |
      | Martin   | Marie  | 1985-05-20       |
    Y envío el formulario de reserva
    Entonces mi reserva está registrada con el estado "en_attente"
    Y recibo un email de confirmación en "cliente@example.com"
    Y el administrador recibe una notificación
    Y el monto total es de "2599.98 €"
    Y quedan "8" plazas disponibles para la estancia "Guadalupe"

  Escenario: Reserva con suplemento individual (1 participante)
    Dado que estoy en la página de reserva
    Cuando selecciono la estancia "Martinica"
    Y relleno mis datos de contacto:
      | email    | solo@example.com |
      | telefono | 0687654321       |
    Y añado los siguientes participantes:
      | apellido | nombre | fecha_nacimiento |
      | Dupont   | Jean   | 1990-01-15       |
    Y envío el formulario de reserva
    Entonces mi reserva está registrada
    Y el monto total es de "1949.99 €"
    # 1499.99 + 30% suplemento individual = 1949.99

  Escenario: Error cuando la estancia está completa
    Dado que la estancia "Saint-Martin" tiene 0 plazas disponibles
    Cuando intento reservar la estancia "Saint-Martin" con 2 participantes
    Entonces veo el mensaje de error "Séjour complet"
    Y mi reserva no está registrada

  Escenario: Error con datos inválidos
    Dado que estoy en la página de reserva
    Cuando envío el formulario con un email inválido "no-es-un-email"
    Entonces veo el mensaje de error "Adresse email invalide"
    Y mi reserva no está registrada

  Esquema del escenario: Cálculo del precio según el número de participantes
    Dado una estancia a "<precio_base>" €
    Cuando reservo con "<nb_participantes>" participantes
    Entonces el monto total es de "<monto_total>" €

    Ejemplos:
      | precio_base | nb_participantes | monto_total |
      | 1000.00     | 1                | 1300.00     |
      | 1000.00     | 2                | 2000.00     |
      | 1000.00     | 3                | 3000.00     |
      | 1500.00     | 1                | 1950.00     |
      | 1500.00     | 2                | 3000.00     |

  Escenario: Confirmación de una reserva (pago recibido)
    Dado una reserva en espera con la referencia "RES-001"
    Cuando el administrador confirma la reserva "RES-001"
    Entonces el estado de la reserva se convierte en "confirmee"
    Y la fecha de confirmación está registrada
    Y el cliente recibe un email de confirmación de pago
    Y las plazas están reservadas en la estancia

  Escenario: Cancelación de una reserva
    Dado una reserva confirmada con 2 participantes
    Cuando el cliente cancela su reserva con el motivo "Cambio de fechas"
    Entonces el estado de la reserva se convierte en "annulee"
    Y las 2 plazas son liberadas en la estancia
    Y el cliente recibe un email de cancelación
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
 * Behat Context: Reserva
 */
final class ReservationContext implements Context
{
    private EntityManagerInterface $entityManager;
    private ReservationService $reservationService;
    private MailerInterface $mailer;

    // Estado del escenario
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
    // GIVEN (Precondiciones)
    // ========================================

    /**
     * @Given las siguientes estancias:
     */
    public function lasSiguientesEstancias(TableNode $table): void
    {
        foreach ($table->getHash() as $row) {
            $sejour = new Sejour();
            $sejour->setDestination($row['destino']);
            $sejour->setDateDebut(new \DateTimeImmutable($row['fecha_inicio']));
            $sejour->setDateFin(new \DateTimeImmutable($row['fecha_fin']));
            $sejour->setCapacite((int) $row['capacidad']);
            $sejour->setPlacesRestantes((int) $row['capacidad']);
            $sejour->setPrixTtc(Money::fromEuros((float) $row['precio_ttc']));

            $this->entityManager->persist($sejour);
        }

        $this->entityManager->flush();
    }

    /**
     * @Given que estoy en la página de reserva
     */
    public function queEstoyEnLaPaginaDeReserva(): void
    {
        // En un test UI (Mink), sería:
        // $this->visitPath('/reservation/new');

        // En test de servicio, solo inicializamos los datos
        $this->currentData = [];
    }

    /**
     * @Given que la estancia :destino tiene :plazas plazas disponibles
     */
    public function queLaEstanciaTienePlazasDisponibles(string $destino, int $plazas): void
    {
        $sejour = $this->entityManager
            ->getRepository(Sejour::class)
            ->findOneBy(['destination' => $destino]);

        Assert::assertNotNull($sejour, "Estancia '$destino' no encontrada");

        $sejour->setPlacesRestantes($plazas);
        $this->entityManager->flush();
    }

    /**
     * @Given una reserva en espera con la referencia :referencia
     */
    public function unaReservaEnEsperaConLaReferencia(string $referencia): void
    {
        $sejour = $this->entityManager
            ->getRepository(Sejour::class)
            ->findOneBy([]);

        $reservation = new Reservation($sejour, 'client@example.com', '0612345678');
        $reservation->setReference($referencia);

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
    // WHEN (Acciones)
    // ========================================

    /**
     * @When selecciono la estancia :destino
     */
    public function seleccionoLaEstancia(string $destino): void
    {
        $sejour = $this->entityManager
            ->getRepository(Sejour::class)
            ->findOneBy(['destination' => $destino]);

        Assert::assertNotNull($sejour, "Estancia '$destino' no encontrada");

        $this->currentSejour = $sejour;
        $this->currentData['sejour_id'] = $sejour->getId();
    }

    /**
     * @When relleno mis datos de contacto:
     */
    public function rellenoMisDatosDeContacto(TableNode $table): void
    {
        $data = $table->getRowsHash();

        $this->currentData['email_contact'] = $data['email'];
        $this->currentData['telephone_contact'] = $data['telefono'];
    }

    /**
     * @When añado los siguientes participantes:
     */
    public function anadoLosSiguientesParticipantes(TableNode $table): void
    {
        $this->currentData['participants'] = [];

        foreach ($table->getHash() as $row) {
            $this->currentData['participants'][] = [
                'nom' => $row['apellido'],
                'prenom' => $row['nombre'],
                'date_naissance' => $row['fecha_nacimiento'],
            ];
        }
    }

    /**
     * @When envío el formulario de reserva
     */
    public function envioElFormularioDeReserva(): void
    {
        try {
            $this->currentReservation = $this->reservationService->createReservation($this->currentData);
        } catch (\Exception $e) {
            $this->lastException = $e;
        }
    }

    /**
     * @When intento reservar la estancia :destino con :nb participantes
     */
    public function intentoReservarLaEstanciaConParticipantes(string $destino, int $nb): void
    {
        $this->seleccionoLaEstancia($destino);

        $this->currentData['email_contact'] = 'client@example.com';
        $this->currentData['telephone_contact'] = '0612345678';
        $this->currentData['participants'] = [];

        for ($i = 0; $i < $nb; $i++) {
            $this->currentData['participants'][] = [
                'nom' => "Participante$i",
                'prenom' => "Nombre$i",
                'date_naissance' => '1990-01-15',
            ];
        }

        $this->envioElFormularioDeReserva();
    }

    /**
     * @When envío el formulario con un email inválido :email
     */
    public function envioElFormularioConUnEmailInvalido(string $email): void
    {
        $this->currentData['email_contact'] = $email;
        $this->currentData['telephone_contact'] = '0612345678';
        $this->currentData['participants'] = [
            ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
        ];

        $this->envioElFormularioDeReserva();
    }

    /**
     * @When el administrador confirma la reserva :referencia
     */
    public function elAdministradorConfirmaLaReserva(string $referencia): void
    {
        $reservation = $this->entityManager
            ->getRepository(Reservation::class)
            ->findOneBy(['reference' => $referencia]);

        Assert::assertNotNull($reservation, "Reserva '$referencia' no encontrada");

        $this->reservationService->confirmReservation($reservation);
        $this->currentReservation = $reservation;
    }

    /**
     * @When el cliente cancela su reserva con el motivo :motivo
     */
    public function elClienteCancelaSuReserva(string $motivo): void
    {
        $this->reservationService->cancelReservation($this->currentReservation, $motivo);
    }

    // ========================================
    // THEN (Aserciones)
    // ========================================

    /**
     * @Then mi reserva está registrada con el estado :estado
     * @Then mi reserva está registrada
     */
    public function miReservaEstaRegistrada(?string $estado = null): void
    {
        Assert::assertNotNull($this->currentReservation, 'Ninguna reserva creada');

        if ($estado) {
            Assert::assertEquals($estado, $this->currentReservation->getStatut());
        }

        // Verificar en BD
        $this->entityManager->refresh($this->currentReservation);
        Assert::assertNotNull($this->currentReservation->getId());
    }

    /**
     * @Then recibo un email de confirmación en :email
     */
    public function reciboUnEmailDeConfirmacion(string $email): void
    {
        // En un test real, verificaríamos los emails enviados
        // vía el mailer de test de Symfony
        // Assert::assertEmailCount(1);
        // Assert::assertEmailAddressContains($message, 'to', $email);

        // Para el ejemplo, verificamos que el email de contacto corresponde
        Assert::assertEquals($email, $this->currentReservation->getEmailContact());
    }

    /**
     * @Then el administrador recibe una notificación
     */
    public function elAdministradorRecibeUnaNotificacion(): void
    {
        // Assert::assertEmailCount(2); // Cliente + Admin
    }

    /**
     * @Then el monto total es de :monto
     */
    public function elMontoTotalEsDe(string $monto): void
    {
        // Quitar espacios y el símbolo €
        $expectedAmount = (float) str_replace([' ', '€'], '', $monto);

        $actualAmount = $this->currentReservation->getMontantTotal()->toEuros();

        Assert::assertEquals($expectedAmount, $actualAmount, '', 0.01);
    }

    /**
     * @Then quedan :plazas plazas disponibles para la estancia :destino
     */
    public function quedanPlazasDisponibles(int $plazas, string $destino): void
    {
        $sejour = $this->entityManager
            ->getRepository(Sejour::class)
            ->findOneBy(['destination' => $destino]);

        $this->entityManager->refresh($sejour);

        Assert::assertEquals($plazas, $sejour->getPlacesRestantes());
    }

    /**
     * @Then veo el mensaje de error :mensaje
     */
    public function veoElMensajeDeError(string $mensaje): void
    {
        Assert::assertNotNull($this->lastException, 'No se lanzó ninguna excepción');
        Assert::assertStringContainsString($mensaje, $this->lastException->getMessage());
    }

    /**
     * @Then mi reserva no está registrada
     */
    public function miReservaNoEstaRegistrada(): void
    {
        Assert::assertNull($this->currentReservation, 'Se creó una reserva cuando no debería');
    }

    /**
     * @Then el estado de la reserva se convierte en :estado
     */
    public function elEstadoDeLaReservaSeConvierteEn(string $estado): void
    {
        $this->entityManager->refresh($this->currentReservation);
        Assert::assertEquals($estado, $this->currentReservation->getStatut());
    }

    /**
     * @Then la fecha de confirmación está registrada
     */
    public function laFechaDeConfirmacionEstaRegistrada(): void
    {
        Assert::assertNotNull($this->currentReservation->getConfirmedAt());
    }

    /**
     * @Then las plazas están reservadas en la estancia
     */
    public function lasPlazasEstanReservadasEnLaEstancia(): void
    {
        $sejour = $this->currentReservation->getSejour();
        $this->entityManager->refresh($sejour);

        $plazasReservadas = $sejour->getCapacite() - $sejour->getPlacesRestantes();
        Assert::assertGreaterThan(0, $plazasReservadas);
    }

    /**
     * @Then las :nb plazas son liberadas en la estancia
     */
    public function lasNPlazasSonLiberadas(int $nb): void
    {
        $sejour = $this->currentReservation->getSejour();
        $this->entityManager->refresh($sejour);

        // Verificar que las plazas han sido liberadas
        // (implementación depende de la lógica de negocio)
    }
}
```

---

## Configuración Behat

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

## Ejecutar tests Behat

```bash
# Todos los tests
vendor/bin/behat

# Feature específica
vendor/bin/behat features/reservation.feature

# Escenario específico (por línea)
vendor/bin/behat features/reservation.feature:15

# Con tag
vendor/bin/behat --tags=@wip

# Dry-run (verificar steps)
vendor/bin/behat --dry-run

# Formato de salida
vendor/bin/behat --format=pretty
vendor/bin/behat --format=progress
```

---

## Checklist Test Behat

- [ ] Feature file en español (Gherkin)
- [ ] Escenarios legibles por el negocio
- [ ] Steps reutilizables (DRY)
- [ ] Context con rollback de transacción
- [ ] Aserciones PHPUnit en los Then
- [ ] Datos de prueba realistas
- [ ] Tags para organizar los tests (@wip, @critical, etc.)
- [ ] Documentación viva (especificaciones ejecutables)
- [ ] Rendimiento aceptable (< 5s por escenario)
- [ ] Aislamiento completo entre escenarios
