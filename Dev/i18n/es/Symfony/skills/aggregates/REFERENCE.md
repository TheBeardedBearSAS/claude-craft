# Regla 05: Aggregates y Aggregate Roots

## Definición

Un **Aggregate** es un cluster de objetos (Entities + Value Objects) tratados como una unidad para los cambios de datos. El **Aggregate Root** es el punto de entrada único.

## Reglas fundamentales

1. **Una transacción = Un Aggregate** - Nunca modificar 2 ARs en una transacción
2. **Referencias por ID** - Los ARs se referencian vía IDs tipados, no objetos completos
3. **Invariantes** - El AR garantiza la coherencia de todas sus entidades internas
4. **Eventos** - Toda mutación emite un Domain Event

## Template Aggregate Root

```php
<?php

declare(strict_types=1);

namespace App\Commercial\Domain\Client;

use App\Shared\Domain\AggregateRoot;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class Client extends AggregateRoot
{
    private ClientId $id;
    private string $name;
    private Email $email;
    private ClientStatus $status;

    /** @var Collection<int, Adresse> */
    private Collection $addresses;

    /** @var Collection<int, Contact> */
    private Collection $contacts;

    private DateTimeImmutable $createdAt;

    private function __construct(
        ClientId $id,
        string $name,
        Email $email
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->status = ClientStatus::PROSPECT;
        $this->addresses = new ArrayCollection();
        $this->contacts = new ArrayCollection();
        $this->createdAt = new DateTimeImmutable();

        $this->recordEvent(new ClientCreated($id, $email));
    }

    public static function create(
        ClientId $id,
        string $name,
        Email $email
    ): self {
        return new self($id, $name, $email);
    }

    // ✅ Mutaciones vía métodos de negocio
    public function addAddress(Adresse $address): void
    {
        if ($this->addresses->count() >= 10) {
            throw new TooManyAddressesException();
        }

        $this->addresses->add($address);
        $this->recordEvent(new AddressAdded($this->id, $address->getId()));
    }

    public function updateEmail(Email $newEmail): void
    {
        $oldEmail = $this->email;
        $this->email = $newEmail;

        $this->recordEvent(new EmailUpdated($this->id, $oldEmail, $newEmail));
    }

    public function activate(): void
    {
        if ($this->status === ClientStatus::ACTIVE) {
            return;
        }

        $this->status = ClientStatus::ACTIVE;
        $this->recordEvent(new ClientActivated($this->id));
    }

    // ✅ Getters (solo lectura)
    public function getId(): ClientId { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getEmail(): Email { return $this->email; }
    public function getStatus(): ClientStatus { return $this->status; }
    public function getAddresses(): Collection { return $this->addresses; }

    // ❌ NO setters genéricos
}
```

## Checklist Aggregates

- [ ] Extend `AggregateRoot` base class
- [ ] Constructor `private`, factory `create()` estático
- [ ] Toda mutación vía método de negocio nombrado
- [ ] Eventos emitidos para cada cambio
- [ ] Colecciones de entidades internas únicamente
- [ ] Referencias externas vía IDs
- [ ] Invariantes validados en los métodos
- [ ] No setters genéricos
