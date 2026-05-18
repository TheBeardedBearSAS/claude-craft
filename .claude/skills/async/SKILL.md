---
name: async
description: Architecture async-first avec messaging et queues (Symfony Messenger, Laravel Queue, Ecotone). Use when working with async processing, queues, workers, background jobs.
context: fork
triggers:
  files: ["config/packages/messenger.yaml", "config/queue.php", "app/Jobs/**", "src/Message/**", "src/MessageHandler/**"]
  keywords: ["async", "queue", "worker", "messenger", "job", "background", "message", "handler", "dispatch", "consume"]
auto_suggest: true
disable-model-invocation: true
---

# Async-First — Quick Reference

Décharger les traitements > 200 ms vers des workers en arrière-plan, pour garder l'UI/API réactives.

## Quand activer l'async

| Cas | Async ? |
|-----|---------|
| Envoi d'email transactionnel | ✅ |
| Génération PDF / export CSV | ✅ |
| Appel API tierce > 200 ms | ✅ |
| Traitement batch nocturne | ✅ |
| Lecture base de données triviale | ❌ |

## Cinq invariants non-négociables

1. **HTTP < 200 ms.** Toute opération qui dépasse ce seuil doit être déportée.
2. **Idempotence obligatoire.** Un message peut être rejoué — concevoir comme tel (idempotency keys, dedupe).
3. **Retry + Dead Letter Queue.** 3 tentatives, backoff exponentiel + jitter. Au-delà → DLQ + alerte.
4. **Competing consumers.** 4-8 workers en parallèle pour absorber les pics.
5. **Lifecycle tracking.** Logs structurés, métriques (latence, taux erreur, DLQ depth) et alertes.

## Frameworks recommandés

| Stack | Framework | Notes |
|-------|-----------|-------|
| Symfony | **Symfony Messenger** | Transport AMQP, Redis, Doctrine ; supports Stamps |
| Laravel | **Laravel Queue** (Horizon en prod) | Backed by Redis ou SQS ; supervision native |
| PHP framework-agnostic | **Ecotone** | DDD, sagas, scheduler, messaging unifié |
| Node.js | BullMQ ou RabbitMQ | Redis-backed avec dashboard |

## Pattern minimal (Symfony Messenger)

```php
// Message (immutable DTO)
final class SendWelcomeEmail
{
    public function __construct(public readonly string $userId) {}
}

// Handler
final class SendWelcomeEmailHandler
{
    public function __invoke(SendWelcomeEmail $message): void
    {
        // Idempotency check
        if ($this->emailLog->wasSent($message->userId, 'welcome')) {
            return;
        }
        $this->mailer->sendWelcome($message->userId);
        $this->emailLog->record($message->userId, 'welcome');
    }
}

// Dispatch (controller)
$this->bus->dispatch(new SendWelcomeEmail($user->id));
```

## Anti-patterns critiques

- ❌ Mettre une opération idempotente directement dans le handler sans clé d'idempotency (replay = double effet).
- ❌ `try { ... } catch (\Throwable) { /* swallow */ }` dans un handler → le message est marqué traité alors qu'il a échoué.
- ❌ Stocker la payload complète d'un email/PDF dans le message → préférer un ID + lookup, sinon RabbitMQ explose.
- ❌ Pas de circuit breaker autour des appels tiers : un provider down fait monter la DLQ en flèche.

## Pour aller plus loin

> Détails complets, patterns Laravel/Ecotone, exemples de configuration, observabilité OpenTelemetry, lifecycle events, checklists par phase : voir `@.claude/skills/async/REFERENCE.md`.
