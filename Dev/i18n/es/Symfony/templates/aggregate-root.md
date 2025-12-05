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
