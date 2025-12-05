# Análisis pre-implementación

> **Obligatorio antes de cualquier implementación** - Referencia: `.claude/rules/03-coding-standards.md`

## Objetivo

**¿Cuál es la funcionalidad a implementar?**

[Describir claramente el objetivo de negocio y técnico]

**Valor de negocio:**
- [¿En qué mejora la experiencia del usuario o el negocio?]

**Criterios de aceptación:**
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

---

## Archivos impactados

### Nuevos archivos a crear

```
src/
├── Entity/
│   └── [NombreEntity].php
├── Repository/
│   └── [NombreEntity]Repository.php
├── Service/
│   └── [NombreService].php
└── Controller/
    └── [NombreController].php

tests/
├── Unit/
│   └── [NombreTest].php
└── Integration/
    └── [NombreIntegrationTest].php
```

### Archivos existentes a modificar

- `src/Entity/Reservation.php` - [Razón de modificación]
- `src/Controller/Admin/DashboardController.php` - [Razón de modificación]
- `config/services.yaml` - [Configuración a agregar]

---

## Impactos

### Breaking Changes

**¿Hay breaking changes?** ☐ SÍ ☑ NO

Si SÍ:
- [ ] Impacto en API pública
- [ ] Impacto en formularios existentes
- [ ] Impacto en comandos CLI
- [ ] Migración de datos necesaria

**Plan de migración:**
```
[Describir la estrategia de migración si es necesario]
```

### Migración de base de datos

**¿Requiere una migración?** ☐ SÍ ☑ NO

Si SÍ:
```php
// Version20YYMMDDHHMMSS.php
public function up(Schema $schema): void
{
    // SQL DDL
    $this->addSql('ALTER TABLE reservation ADD COLUMN ...');
}

public function down(Schema $schema): void
{
    // Rollback
    $this->addSql('ALTER TABLE reservation DROP COLUMN ...');
}
```

**Datos de prueba:**
```bash
make fixtures-load
```

### Rendimiento

**¿Impacto en rendimiento?** ☐ SÍ ☑ NO

Si SÍ:
- [ ] Consultas N+1 potenciales → Verificar con Symfony Profiler
- [ ] Índices faltantes → `CREATE INDEX idx_xxx ON table(column)`
- [ ] Caché necesaria → Redis/Symfony Cache
- [ ] Paginación requerida → Pagerfanta

**Benchmark:**
```bash
# Antes
ab -n 1000 -c 10 https://atoll.local/api/endpoint

# Después
ab -n 1000 -c 10 https://atoll.local/api/endpoint
```

### RGPD / Datos personales

**¿Trata datos personales?** ☐ SÍ ☑ NO

Referencia: `.claude/rules/07-security-rgpd.md`

Si SÍ:
- [ ] Datos recopilados: [nombre, apellido, email, teléfono, etc.]
- [ ] Consentimiento explícito obtenido
- [ ] Duración de conservación definida: [X meses/años]
- [ ] Derecho al olvido implementado
- [ ] Cifrado en base de datos: `doctrine-encrypt-bundle`
- [ ] Anonimización en los logs

**Ejemplo:**
```php
use Doctrine\ORM\Mapping as ORM;
use DoctrineEncryptBundle\Configuration\Encrypted;

class Participant
{
    #[ORM\Column(type: 'string')]
    #[Encrypted]
    private string $nom; // Cifrado en BD
}
```

---

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|------------|
| Pérdida de datos durante la migración | Baja | Crítico | Backup BD antes de la migración + migración reversible |
| Rendimiento degradado | Media | Medio | Índices BD + caché Redis + pruebas de carga |
| Regresión funcional | Media | Alto | Tests automatizados exhaustivos (>80% cobertura) |
| Incumplimiento RGPD | Baja | Crítico | Revisión de seguridad + cifrado + audit logs |

---

## Enfoque TDD

Referencia: `.claude/rules/01-architecture-ddd.md` y `.claude/rules/04-testing-tdd.md`

### 1. Tests a escribir ANTES de la implementación

#### Tests unitarios (PHPUnit)

```php
// tests/Unit/Service/ReservationServiceTest.php
class ReservationServiceTest extends TestCase
{
    /** @test */
    public function it_creates_reservation_with_valid_data(): void
    {
        // ARRANGE
        $repository = $this->createMock(ReservationRepository::class);
        $service = new ReservationService($repository);

        // ACT
        $reservation = $service->create([...]);

        // ASSERT
        $this->assertInstanceOf(Reservation::class, $reservation);
    }

    /** @test */
    public function it_throws_exception_when_sejour_full(): void
    {
        // ARRANGE
        // ACT
        // ASSERT
        $this->expectException(SejourCompletException::class);
    }
}
```

#### Tests de integración (Symfony Kernel)

```php
// tests/Integration/Controller/ReservationControllerTest.php
class ReservationControllerTest extends WebTestCase
{
    /** @test */
    public function it_submits_reservation_form_successfully(): void
    {
        // ARRANGE
        $client = static::createClient();

        // ACT
        $crawler = $client->request('POST', '/reservation/create', [...]);

        // ASSERT
        $this->assertResponseIsSuccessful();
        $this->assertEmailCount(2); // Cliente + Admin
    }
}
```

#### Tests BDD (Behat)

```gherkin
# features/reservation.feature
Funcionalidad: Creación de reserva
  Como cliente
  Quiero reservar una estancia
  Para irme de vacaciones

  Escenario: Reserva con 2 participantes
    Dado una estancia "Guadalupe" con 10 plazas disponibles
    Cuando creo una reserva para 2 participantes
    Entonces la reserva está confirmada
    Y quedan 8 plazas disponibles
    Y recibo un email de confirmación
```

### 2. Ciclo TDD

```
🔴 RED   → Escribir el test que falla
🟢 GREEN → Implementar el mínimo para pasar el test
🔵 REFACTOR → Mejorar el código (SOLID, Clean Code)
```

**Comandos:**
```bash
# RED: Test falla
make test-unit

# GREEN: Implementación mínima
vim src/Service/ReservationService.php

# Verificar que pasa
make test-unit

# REFACTOR: Mejorar el código
make quality  # PHPStan + CS-Fixer

# Verificar que sigue pasando
make test
```

### 3. Cobertura esperada

**Objetivo:** 80% mínimo (referencia: `.claude/rules/04-testing-tdd.md`)

```bash
make test-coverage
# Abre build/coverage/index.html
```

---

## Checklist de validación

Antes de comenzar la implementación:

- [ ] Análisis completado y revisado
- [ ] Impactos identificados y mitigaciones definidas
- [ ] Tests TDD escritos (RED)
- [ ] Enfoque validado por el equipo
- [ ] Migración BD preparada (si es necesaria)
- [ ] Conformidad RGPD verificada (si datos personales)

**Fecha de análisis:** [YYYY-MM-DD]
**Analista:** [Nombre]
**Revisores:** [Nombres]

---

## Ejemplo concreto Atoll Tourisme

### Objetivo
Agregar la gestión de opciones de pago en las reservas (seguro de cancelación, suplemento individual, etc.)

### Archivos impactados
- `src/Entity/Reservation.php` - Relación OneToMany hacia OptionReservation
- `src/Entity/OptionReservation.php` - Nueva entidad
- `src/Form/ReservationFormType.php` - Agregar CollectionType para opciones

### Migración BD
```sql
CREATE TABLE option_reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    prix_ttc DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservation(id)
);
```

### Tests TDD
```php
/** @test */
public function it_calculates_total_with_options(): void
{
    // ARRANGE
    $reservation = new Reservation();
    $reservation->setPrixBase(1000);
    $reservation->addOption(new OptionReservation('Seguro', 50));

    // ACT
    $total = $reservation->getMontantTotal();

    // ASSERT
    $this->assertEquals(1050, $total);
}
```

### Riesgos
- Rendimiento: consultas N+1 → `$qb->leftJoin('r.options', 'o')`
- RGPD: No afectado (no hay datos personales)
