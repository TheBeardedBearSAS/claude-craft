# Regel 06: Domain Events

## Definition

Ein **Domain Event** repräsentiert etwas, das in der Domain passiert ist und für andere Teile des Systems von Interesse ist.

## Struktur eines Events

```php
<?php

declare(strict_types=1);

namespace App\Commercial\Domain\Client\Event;

use App\Shared\Domain\DomainEvent;
use DateTimeImmutable;

final readonly class ClientCreated implements DomainEvent
{
    public function __construct(
        public ClientId $clientId,
        public Email $email,
        public DateTimeImmutable $occurredOn = new DateTimeImmutable()
    ) {}

    public function getAggregateId(): string
    {
        return $this->clientId->getValue();
    }

    public function occurredOn(): DateTimeImmutable
    {
        return $this->occurredOn;
    }

    public function toArray(): array
    {
        return [
            'clientId' => $this->clientId->getValue(),
            'email' => $this->email->getValue(),
            'occurredOn' => $this->occurredOn->format(DateTimeInterface::ATOM),
        ];
    }
}
```

## Event-Aufzeichnung

```php
// In der Aggregate Root
class Client extends AggregateRoot
{
    public function activate(): void
    {
        $this->status = ClientStatus::ACTIVE;
        $this->recordEvent(new ClientActivated($this->id));
    }
}

// AggregateRoot Basisklasse
abstract class AggregateRoot
{
    private array $events = [];

    protected function recordEvent(DomainEvent $event): void
    {
        $this->events[] = $event;
    }

    public function releaseEvents(): array
    {
        $events = $this->events;
        $this->events = [];
        return $events;
    }
}
```

## Event Handlers (Application Layer)

```php
// Application/EventHandler/SendWelcomeEmailOnClientCreated.php

final readonly class SendWelcomeEmailOnClientCreated
{
    public function __construct(
        private EmailService $emailService
    ) {}

    public function __invoke(ClientCreated $event): void
    {
        $this->emailService->sendWelcomeEmail(
            $event->email,
            $event->clientId
        );
    }
}
```

## Event-Versand

```php
// Im Command Handler
final class CreateClientHandler
{
    public function __invoke(CreateClientCommand $command): void
    {
        $client = Client::create(...);
        $this->repository->save($client);

        // Alle Events versenden
        foreach ($client->releaseEvents() as $event) {
            $this->eventBus->dispatch($event);
        }
    }
}
```

## Domain Events Checkliste

- [ ] Klasse `final readonly`
- [ ] Implements `DomainEvent`
- [ ] Name in Vergangenheit (`ClientCreated`, `EmailUpdated`)
- [ ] Enthält minimal notwendige Daten
- [ ] `occurredOn` Zeitstempel
- [ ] `toArray()` Methode für Serialisierung
- [ ] Handler in Application Layer
- [ ] Async über Symfony Messenger wenn angemessen
