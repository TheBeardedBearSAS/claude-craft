# Plantilla: Domain Event (DDD)

> **Patrón DDD** - Evento de negocio que representa un hecho que ha ocurrido
> Referencia: `.claude/rules/01-architecture-ddd.md`

## ¿Qué es un Domain Event?

Un Domain Event es:
- ✅ **Inmutable** (clase readonly)
- ✅ **Nombrado en pasado** (ReservationCreated, no CreateReservation)
- ✅ **Contiene los datos necesarios** (ID del agregado + contexto)
- ✅ **Con marca temporal** (occurredOn timestamp)
- ✅ **Publicado por el aggregate root**

**¿Por qué usar Domain Events?**
- Desacoplamiento entre agregados
- Trazabilidad (audit log)
- Comunicación asíncrona (message bus)
- Event Sourcing (opcional)

---

## Plantilla PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\Domain\Event;

use Symfony\Component\Uid\Uuid;

/**
 * Domain Event: [NombreEvento]
 *
 * Disparado cuando: [Condición de disparo]
 *
 * Alcance: [Descripción de lo que representa este evento]
 *
 * Suscriptores potenciales:
 * - [Suscriptor 1]: [Acción realizada]
 * - [Suscriptor 2]: [Acción realizada]
 */
final readonly class [NombreEvento]
{
    private \DateTimeImmutable $occurredOn;

    public function __construct(
        private Uuid $aggregateId,
        // Otros datos del contexto...
    ) {
        $this->occurredOn = new \DateTimeImmutable();
    }

    public function getAggregateId(): Uuid
    {
        return $this->aggregateId;
    }

    public function getOccurredOn(): \DateTimeImmutable
    {
        return $this->occurredOn;
    }

    /**
     * Devuelve los datos del evento (para serialización)
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'aggregate_id' => $this->aggregateId->toRfc4122(),
            'occurred_on' => $this->occurredOn->format(\DateTimeInterface::ATOM),
            // Otros campos...
        ];
    }
}
```

---

## Checklist Domain Event

- [ ] Clase `final readonly`
- [ ] Nombrado en pasado (ReservationCreated, no CreateReservation)
- [ ] Propiedad `occurredOn` (timestamp)
- [ ] Referencia al ID del agregado (Uuid)
- [ ] Constructor toma la entidad completa
- [ ] Método `toArray()` para serialización
- [ ] Sin lógica de negocio (solo datos)
- [ ] Documentación del contexto y suscriptores potenciales
- [ ] Tests unitarios (creación, serialización)
- [ ] Tests de integración (suscriptores)
