# Règle 06 : Domain Events

## Définition

Un **Domain Event** représente quelque chose qui s'est passé dans le domaine et qui intéresse d'autres parties du système.

## Structure d'un Event

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

## Enregistrement des Events

```php
// Dans l'Aggregate Root
class Client extends AggregateRoot
{
    public function activate(): void
    {
        $this->status = ClientStatus::ACTIVE;
        $this->recordEvent(new ClientActivated($this->id));
    }
}

// Base class AggregateRoot
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

## Dispatch des Events

```php
// Dans le Command Handler
final class CreateClientHandler
{
    public function __invoke(CreateClientCommand $command): void
    {
        $client = Client::create(...);
        $this->repository->save($client);

        // Dispatcher tous les événements
        foreach ($client->releaseEvents() as $event) {
            $this->eventBus->dispatch($event);
        }
    }
}
```

## Checklist Domain Events

- [ ] Classe `final readonly`
- [ ] Implements `DomainEvent`
- [ ] Nom au passé (`ClientCreated`, `EmailUpdated`)
- [ ] Contient données minimales nécessaires
- [ ] `occurredOn` timestamp
- [ ] Méthode `toArray()` pour serialization
- [ ] Handler dans Application layer
- [ ] Async via Symfony Messenger si approprié
