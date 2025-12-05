# Règle 05 : Aggregates et Aggregate Roots

## Définition

Un **Aggregate** est un cluster d'objets (Entities + Value Objects) traités comme une unité pour les changements de données. L'**Aggregate Root** est le point d'entrée unique.

## Règles fondamentales

1. **Une transaction = Un Aggregate** - Jamais modifier 2 ARs en une transaction
2. **Références par ID** - Les ARs se référencent via IDs typés, pas objets complets
3. **Invariants** - L'AR garantit la cohérence de toutes ses entités internes
4. **Événements** - Toute mutation émet un Domain Event

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

    // ✅ Mutations via méthodes métier
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

    // ✅ Getters (lecture seule)
    public function getId(): ClientId { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getEmail(): Email { return $this->email; }
    public function getStatus(): ClientStatus { return $this->status; }
    public function getAddresses(): Collection { return $this->addresses; }
    
    // ❌ PAS de setters génériques
}
```

## Checklist Aggregates

- [ ] Extend `AggregateRoot` base class
- [ ] Constructor `private`, factory `create()` statique
- [ ] Toute mutation via méthode métier nommée
- [ ] Événements émis pour chaque changement
- [ ] Collections d'entités internes uniquement
- [ ] Références externes via IDs
- [ ] Invariants validés dans les méthodes
- [ ] Pas de setters génériques
