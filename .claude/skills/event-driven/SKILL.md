---
name: event-driven
description: Event Sourcing, CQRS, Saga patterns, event bus (Kafka, RabbitMQ, AWS EventBridge). Use when implementing event-driven architecture, distributed transactions, or event sourcing.
context: fork
triggers:
  files: ["**/events/**", "**/sagas/**", "**/event-store/**"]
  keywords: ["event sourcing", "event-driven", "saga", "cqrs", "kafka", "rabbitmq", "event bus", "domain events", "event store", "choreography", "orchestration"]
auto_suggest: true
disable-model-invocation: true
---

# Event-Driven — Event Sourcing, Saga, CQRS

Architecture événementielle pour découplage et scalabilité.

## Patterns

**Event Sourcing** — Stocker events, pas état (audit, replay)  
**CQRS** — Séparer Read/Write models (projections)  
**Saga** — Transaction distribuée (microservices)  
**Event Bus** — Pub/Sub découplé (Kafka, RabbitMQ)

## Event Sourcing

```python
events = [OrderCreated(...), OrderPaid(...), OrderShipped(...)]

def rebuild(events):
    state = {}
    for e in events: state = apply(state, e)
    return state
```

## Saga — Choreography vs Orchestration

**Choreography** — Events chain services (découplé, debug dur)  
**Orchestration** — Central coordinator (visible, couplé)

```
Choreo: OrderCreated → Payment → Shipping
Orchestrator: ProcessPayment() → ShipOrder()
```

## Kafka Event Bus

```javascript
// Producer
producer.send({ topic: 'orders', messages: [{ ... }] });

// Consumer
consumer.run({
  eachMessage: async ({ message }) => {
    handleEvent(JSON.parse(message.value));
  }
});
```

## Domain Events (Symfony)

```php
class OrderCreatedEvent {
    public function __construct(public Order $order) {}
}

class SendEmail {
    public function __invoke(OrderCreatedEvent $e) {
        $this->mailer->send($e->order->email, 'Confirmation');
    }
}
```

---

Voir `@.claude/rules/21-cqrs.md`, `@.claude/skills/async/SKILL.md`
