# Regel 05: Aggregates und Aggregate Roots

## Definition

Ein **Aggregate** ist ein Cluster von Objekten (Entities + Value Objects), die als Einheit für Datenänderungen behandelt werden. Die **Aggregate Root** ist der einzige Einstiegspunkt.

## Grundlegende Regeln

1. **Eine Transaktion = Ein Aggregate** - Nie 2 ARs in einer Transaktion ändern
2. **Referenzen per ID** - ARs referenzieren sich über typisierte IDs, nicht über vollständige Objekte
3. **Invarianten** - Die AR garantiert Konsistenz aller internen Entitäten
4. **Events** - Jede Mutation gibt ein Domain Event aus

## Aggregate Root Template

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

    // ✅ Mutationen über Business-Methoden
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

    // ✅ Getter (nur Lesezugriff)
    public function getId(): ClientId { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getEmail(): Email { return $this->email; }
    public function getStatus(): ClientStatus { return $this->status; }
    public function getAddresses(): Collection { return $this->addresses; }

    // ❌ KEINE generischen Setter
}
```

## Aggregates Checkliste

- [ ] Extend `AggregateRoot` Basisklasse
- [ ] Konstruktor `private`, statische Factory `create()`
- [ ] Jede Mutation über benannte Business-Methode
- [ ] Events für jede Änderung ausgegeben
- [ ] Nur interne Entitäten-Collections
- [ ] Externe Referenzen über IDs
- [ ] Invarianten in Methoden validiert
- [ ] Keine generischen Setter
