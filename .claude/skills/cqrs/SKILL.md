---
name: cqrs
description: CQRS - Command Query Responsibility Segregation. Use when implementing DDD patterns, separating read/write models, event sourcing, or building scalable architectures with heterogeneous performance requirements.
context: fork
triggers:
  files: ["**/Command*.php", "**/Query*.php", "**/Handler*.php", "**/Projector*.php", "**/ReadModel*.php", "**/WriteModel*.php"]
  keywords: ["cqrs", "command", "query", "event sourcing", "projection", "read model", "write model", "command handler", "query handler"]
auto_suggest: true
---

# CQRS — Command Query Responsibility Segregation

## Vue d'ensemble

CQRS sépare les opérations de lecture (Query) et d'écriture (Command) dans des modèles distincts.

**Principes :**
- ✅ Optimisation indépendante lecture/écriture
- ✅ Scalabilité différenciée (read replicas)
- ✅ Event Sourcing optionnel
- ❌ Ne PAS utiliser si domaine simple (CRUD classique suffit)

---

## Table des matières

1. [Quand utiliser CQRS](#quand-utiliser-cqrs)
2. [Quand NE PAS utiliser CQRS](#quand-ne-pas-utiliser-cqrs)
3. [Architecture CQRS](#architecture-cqrs)
4. [Implémentation](#implémentation)
5. [Event Sourcing](#event-sourcing)
6. [Trade-offs](#trade-offs)
7. [Checklist](#checklist)

---

## Quand utiliser CQRS

| Situation | Pourquoi CQRS |
|-----------|---------------|
| **Domaine complexe** | Logique métier riche avec règles différentes lecture/écriture |
| **Performance hétérogène** | 95% lectures, 5% écritures → optimiser séparément |
| **Audit/compliance** | Event Sourcing pour traçabilité complète |
| **Scalabilité** | Read replicas multiples, write master unique |
| **Projections multiples** | Même donnée, plusieurs formats (JSON, CSV, Elasticsearch) |

**Exemple :** Système de facturation avec audit légal obligatoire.

---

## Quand NE PAS utiliser CQRS

| Situation | Pourquoi éviter CQRS |
|-----------|----------------------|
| **CRUD simple** | Overhead inutile (double modèle pour rien) |
| **Domaine pauvre** | Pas de logique métier complexe |
| **Petit projet** | Complexité > gain |
| **Équipe junior** | Courbe d'apprentissage élevée |
| **Cohérence immédiate requise** | CQRS introduit eventual consistency |

**Règle :** CQRS est une optimisation. Ne l'utiliser que si le problème justifie la complexité.

> **Quote :** "CQRS is a pattern that should be applied carefully. It's not a silver bullet." — Greg Young

---

## Architecture CQRS

### Principe

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
└───────────┬─────────────────────────────┬───────────────┘
            │                             │
            ▼                             ▼
     ┌──────────────┐             ┌──────────────┐
     │   Command    │             │    Query     │
     │     Side     │             │     Side     │
     └──────┬───────┘             └──────┬───────┘
            │                             │
            ▼                             ▼
     ┌──────────────┐             ┌──────────────┐
     │  Write Model │             │  Read Model  │
     │  (normalized)│             │ (denormalized)│
     └──────┬───────┘             └──────┬───────┘
            │                             │
            ▼                             ▼
     ┌──────────────┐             ┌──────────────┐
     │ Postgres     │──Event──────▶ Elasticsearch│
     │ (master)     │ Projection  │  (replicas)  │
     └──────────────┘             └──────────────┘
```

### Command Side

**Responsabilité :** Valider et exécuter les commandes (create, update, delete).

**Caractéristiques :**
- Modèle normalisé (3NF)
- Validation métier stricte
- Event emission
- Write-optimized

### Query Side

**Responsabilité :** Répondre aux requêtes de lecture (get, list, search).

**Caractéristiques :**
- Modèle dénormalisé (projection)
- Pas de validation (déjà faite côté command)
- Read-optimized (indexes, caching)
- Eventual consistency acceptable

---

## Implémentation

### Symfony (Messenger + Doctrine)

**Command :**

```php
// Command
final readonly class CreateOrderCommand
{
    public function __construct(
        public string $userId,
        public array $items,
        public float $totalAmount,
    ) {}
}

// Handler
final class CreateOrderCommandHandler implements MessageHandlerInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private MessageBusInterface $eventBus,
    ) {}

    public function __invoke(CreateOrderCommand $command): void
    {
        // Validation métier
        if ($command->totalAmount <= 0) {
            throw new InvalidOrderException('Total must be positive');
        }

        // Créer l'entité
        $order = new Order($command->userId, $command->items, $command->totalAmount);
        $this->em->persist($order);
        $this->em->flush();

        // Émettre event
        $this->eventBus->dispatch(new OrderCreatedEvent($order->getId()));
    }
}
```

**Query :**

```php
// Query
final readonly class GetOrderQuery
{
    public function __construct(public string $orderId) {}
}

// Handler
final class GetOrderQueryHandler implements MessageHandlerInterface
{
    public function __construct(private OrderReadRepository $repository) {}

    public function __invoke(GetOrderQuery $query): OrderReadModel
    {
        return $this->repository->findById($query->orderId)
            ?? throw new OrderNotFoundException();
    }
}
```

**Projection (Event Handler) :**

```php
final class OrderProjector implements MessageHandlerInterface
{
    public function __construct(private OrderReadRepository $readRepo) {}

    public function __invoke(OrderCreatedEvent $event): void
    {
        // Créer le read model dénormalisé
        $readModel = new OrderReadModel(
            id: $event->orderId,
            userName: $this->getUserName($event->userId),
            itemsCount: count($event->items),
            totalAmount: $event->totalAmount,
            createdAt: new \DateTimeImmutable(),
        );

        $this->readRepo->save($readModel);
    }
}
```

### Laravel (Action pattern)

**Command :**

```php
class CreateOrderAction
{
    public function execute(CreateOrderDTO $dto): Order
    {
        DB::beginTransaction();

        $order = Order::create([
            'user_id' => $dto->userId,
            'items' => $dto->items,
            'total_amount' => $dto->totalAmount,
        ]);

        event(new OrderCreated($order));

        DB::commit();

        return $order;
    }
}
```

**Query :**

```php
class GetOrderQuery
{
    public function execute(string $orderId): OrderReadModel
    {
        return OrderReadModel::findOrFail($orderId);
    }
}
```

---

## Event Sourcing

### Principe

Au lieu de stocker l'état actuel, stocker tous les events qui ont mené à cet état.

**Exemple :**

```
État classique :
Order { status: "delivered" }

Event Sourcing :
OrderCreated -> OrderPaid -> OrderShipped -> OrderDelivered
```

### Avantages

- ✅ Audit complet (qui a fait quoi, quand)
- ✅ Time travel (reconstruire état passé)
- ✅ Replay events (reconstruire projections)

### Inconvénients

- ❌ Complexité élevée
- ❌ Stockage volumineux
- ❌ Requêtes complexes (reconstruire état)

**Quand utiliser :** Audit légal, finance, santé (compliance stricte).

---

## Trade-offs

| Aspect | CQRS | Architecture classique |
|--------|------|------------------------|
| **Complexité** | Élevée | Faible |
| **Performance lecture** | Très élevée (read replicas) | Moyenne |
| **Performance écriture** | Moyenne (event emission) | Élevée |
| **Cohérence** | Eventual | Immédiate |
| **Scalabilité** | Excellente (read/write indépendants) | Limitée |
| **Maintenance** | Complexe (double modèle) | Simple |

**Règle :** Ne pas utiliser CQRS "par défaut". Commencer par architecture classique, migrer si nécessaire.

---

## Checklist

### Avant d'adopter CQRS

- [ ] Le domaine est-il complexe (logique métier riche) ?
- [ ] Y a-t-il un ratio lecture/écriture déséquilibré (> 10:1) ?
- [ ] L'équipe maîtrise-t-elle les patterns DDD/Event-Driven ?
- [ ] L'eventual consistency est-elle acceptable ?

### Implémentation

- [ ] Séparer command handlers et query handlers
- [ ] Modèle write normalisé, modèle read dénormalisé
- [ ] Event bus pour projections async
- [ ] Tests d'isolation (command ne lit pas, query n'écrit pas)

### Avec Event Sourcing

- [ ] Store d'events (PostgreSQL, EventStore)
- [ ] Snapshot strategy (éviter replay complet)
- [ ] Replay mechanism (reconstruire projections)

---

## Ressources

- **Greg Young - CQRS :** [cqrs.files.wordpress.com](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf)
- **Martin Fowler - CQRS :** [martinfowler.com/bliki/CQRS.html](https://martinfowler.com/bliki/CQRS.html)
- **Microsoft - CQRS Pattern :** [learn.microsoft.com/en-us/azure/architecture/patterns/cqrs](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)

---

**Date de dernière mise à jour :** 2026-04
**Version :** 1.0.0
**Auteur :** The Bearded CTO
