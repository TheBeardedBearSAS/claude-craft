# Estándares de Código

> **Referencia de stack:** Symfony 8.1 / PHP 8.5+ | API Platform 4.3 | JsonStreamer (Symfony 8.1, estable) | PHPStan Level 10 | Pest 4.7+

## Principios Generales

### PSR-12 + Symfony Coding Standards

El proyecto sigue estrictamente:
1. **PSR-12**: Estándar PHP oficial
2. **@Symfony**: Convenciones Symfony
3. **@Symfony:risky**: Reglas estrictas Symfony
4. **@PHP85Migration**: Modernización PHP 8.5+ (property hooks, pipe operator, `#[\NoDiscard]`)

Configuración: `.php-cs-fixer.dist.php`

### Verificación Automática

```bash
# Verificar conformidad
make cs-check

# Corregir automáticamente
make cs-fix
```

## Idiomas OBLIGATORIOS

### Regla Absoluta

| Elemento | Idioma | Justificación |
|---------|--------|---------------|
| **Código** (clases, métodos, variables, constantes) | 🇬🇧 **INGLÉS** | Estándar internacional, interoperabilidad |
| **Commits** | 🇬🇧 **INGLÉS** | Historial Git legible internacionalmente |
| **Comentarios código** | 🇬🇧 **INGLÉS** | Código compartible, mantenible |
| **Documentación** (.md, README, guías) | 🇪🇸 **ESPAÑOL** | Equipo y clientes hispanohablantes |
| **Mensajes UI** (labels, errores, emails) | 🇪🇸 **ESPAÑOL** | Usuarios finales hispanohablantes |
| **Logs aplicativos** | 🇪🇸 **ESPAÑOL** | Debug y soporte cliente |

### Ejemplos Conformes

#### ✅ Código EN + Doc ES
```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

/**
 * Represents a monetary amount with currency.
 * Immutable value object following DDD principles.
 */
final readonly class Money
{
    public function __construct(
        private float $amount,
        private Currency $currency
    ) {
        if ($amount < 0) {
            throw new InvalidArgumentException('Amount cannot be negative');
        }
    }

    public function add(Money $other): self
    {
        if (!$this->currency->equals($other->currency)) {
            throw new CurrencyMismatchException('Cannot add different currencies');
        }

        return new self($this->amount + $other->amount, $this->currency);
    }

    public function format(): string
    {
        return number_format($this->amount, 2) . ' ' . $this->currency->code();
    }
}
```

#### ✅ Mensaje UI ES
```php
<?php

// Controller
$this->addFlash('success', 'Su reserva ha sido confirmada con éxito.');
$this->addFlash('error', 'El viaje ya no tiene plazas disponibles.');

// Validación
#[Assert\NotBlank(message: 'El nombre es obligatorio')]
#[Assert\Email(message: 'La dirección de email no es válida')]
private string $email;

// Excepción para usuario final
throw new InsufficientSlotsException('Solo quedan 2 plazas para este viaje.');
```

#### ✅ Log ES
```php
<?php

$this->logger->info('Nueva reserva creada', [
    'reservation_id' => $reservation->getId(),
    'sejour' => $reservation->getSejour()->getTitle(),
    'participants' => count($reservation->getParticipants()),
]);

$this->logger->error('Fallo envío email de confirmación', [
    'reservation_id' => $reservationId,
    'error' => $exception->getMessage(),
]);
```

#### ❌ Mezcla de Idiomas (PROHIBIDO)
```php
<?php

// MALO: Código en español
class GestionReservacion { // ❌ Español
    public function crearReservacion() { // ❌ Español
        $viaje = $this->buscarViaje($id); // ❌ Español
    }
}

// MALO: Mensaje UI en inglés
$this->addFlash('success', 'Your booking has been confirmed'); // ❌ Inglés
```

## Convenciones de Nomenclatura

### Clases

```php
<?php

// ✅ CORRECTO: PascalCase, nombre singular, sufijo explícito
class ReservationRepository { }
class CreateReservationCommand { }
class ReservationCreatedEvent { }
class MoneyValueObject { }
class InsufficientSlotsException { }

// ❌ INCORRECTO
class reservationRepository { } // No es PascalCase
class Reservations { } // Plural
class Reservation_Repository { } // Snake_case
```

### Métodos y Variables

```php
<?php

// ✅ CORRECTO: camelCase, verbos para acciones, nombres para getters
public function createReservation(CreateReservationCommand $command): Reservation { }
public function findAvailableTrips(DateRange $dateRange): array { }
public function isConfirmed(): bool { }
public function getParticipants(): Collection { }

private string $primaryContactEmail;
private int $availableSlots;

// ❌ INCORRECTO
public function CreateReservation() { } // PascalCase prohibido
public function get_participants() { } // Snake_case prohibido
private $email; // Sin tipo
```

### Constantes

```php
<?php

// ✅ CORRECTO: SCREAMING_SNAKE_CASE
final class ReservationStatus
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';

    public const MAX_PARTICIPANTS_PER_BOOKING = 10;
}

// ❌ INCORRECTO
const status_pending = 'pending'; // No es SCREAMING_SNAKE_CASE
const StatusPending = 'pending'; // No es el formato correcto
```

## Documentación PHPDoc

### Reglas

1. **Obligatorio** en métodos públicos y propiedades
2. **Tipos estrictos** con genéricos PHPStan
3. **Inglés** únicamente
4. **Descripciones útiles** (no parafrasear)

### Ejemplos

#### ✅ PHPDoc Conforme
```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\Common\Collections\Collection;

class Reservation
{
    /**
     * @var Collection<int, Participant>
     */
    private Collection $participants;

    /**
     * Adds a participant to this reservation.
     *
     * @throws InsufficientSlotsException if no slots available
     * @throws InvalidParticipantException if participant data is invalid
     */
    public function addParticipant(Participant $participant): void
    {
        if ($this->isFull()) {
            throw new InsufficientSlotsException();
        }

        $this->participants->add($participant);
    }

    /**
     * Checks if this reservation can still accept participants.
     *
     * @return bool true if slots available, false otherwise
     */
    public function hasAvailableSlots(): bool
    {
        return $this->participants->count() < $this->maxParticipants;
    }
}
```

#### ❌ PHPDoc Incorrecto
```php
<?php

// MALO: Sin genéricos
/** @var Collection */
private Collection $participants; // ❌ Tipo incompleto

// MALO: Paráfrasis inútil
/** Adds a participant */ // ❌ Repite el nombre del método
public function addParticipant(Participant $participant): void { }

// MALO: Español
/** Verifica si la reserva está llena */ // ❌ Español
public function isFull(): bool { }
```

## Strict Types

### Obligatorio en TODOS los archivos PHP

```php
<?php

declare(strict_types=1);

// Resto del código...
```

Configuración PHP-CS-Fixer:
```php
'declare_strict_types' => true,
```

## Imports

### Orden Alfabético + Grupos

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

// 1. Clases externas (vendors)
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

// 2. Clases internas (App\)
use App\Domain\Event\ReservationCreatedEvent;
use App\Domain\Exception\InsufficientSlotsException;
use App\Domain\ValueObject\Money;

// Código de la clase...
```

Configuración PHP-CS-Fixer:
```php
'no_unused_imports' => true,
'ordered_imports' => [
    'imports_order' => ['class', 'function', 'const'],
    'sort_algorithm' => 'alpha',
],
```

## Indentación y Formateo

### Reglas PSR-12

```php
<?php

// ✅ Indentación 4 espacios (no tabs)
class Example
{
    public function method(
        string $param1,
        int $param2,
        bool $param3
    ): void {
        if ($condition) {
            // Código...
        }
    }
}

// ✅ Llaves en nueva línea para clases/métodos
class Reservation
{
    public function __construct()
    {
        // ...
    }
}

// ✅ Llaves en misma línea para estructuras de control
if ($reservation->isConfirmed()) {
    $this->sendEmail($reservation);
}

// ✅ Concatenación con espacios
$message = 'Hola ' . $participant->getFirstName() . '!';
```

## Comentarios

### ¿Cuándo Comentar?

```php
<?php

// ✅ Comentar el "por qué", no el "qué"
// We use bcrypt instead of argon2 for compatibility with legacy systems
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// ✅ Comentar los hacks temporales con TODO
// TODO: Remove this workaround when Doctrine 3.0 is released
$query->setHint('knp_paginator.count', $countQuery);

// ✅ Comentar la lógica de negocio compleja
// RGPD: Data must be encrypted before storage and automatically
// deleted 3 years after trip completion (Article 5 GDPR)
$this->encryptSensitiveData($participant);

// ❌ Parafrasear el código (inútil)
// Set status to confirmed
$reservation->setStatus('confirmed'); // ❌ Evidente
```

## Herramientas de Verificación

### PHP-CS-Fixer (Automático)

```bash
# Verificar sin modificar
make cs-check

# Corregir automáticamente
make cs-fix
```

### PHPStan (Análisis Estático)

```bash
# Verificar tipos y estándares
make phpstan
```

### Integración Pre-Commit

Ver `.claude/checklists/pre-commit.md` para checklist completa.

## Referencias

- **PSR-12**: https://www.php-fig.org/psr/psr-12/
- **Symfony Coding Standards**: https://symfony.com/doc/current/contributing/code/standards.html
- **PHP-CS-Fixer**: https://github.com/PHP-CS-Fixer/PHP-CS-Fixer
- **PHPStan**: https://phpstan.org/
