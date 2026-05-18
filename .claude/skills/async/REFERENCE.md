
# Async-First — Messaging et Queues

## Vue d'ensemble

L'architecture async-first décharge les traitements longs vers des workers en arrière-plan pour améliorer la réactivité.

**Principes :**
- ✅ Requêtes HTTP < 200ms
- ✅ Traitements longs → queue async
- ✅ Idempotence obligatoire
- ✅ Retry policy + Dead Letter Queue
- ✅ Monitoring et observabilité

---

## Table des matières

1. [Quand utiliser l'async](#quand-utiliser-lasync)
2. [Symfony Messenger](#symfony-messenger)
3. [Laravel Queue](#laravel-queue)
4. [Competing Consumers](#competing-consumers)
5. [Lifecycle Tracking](#lifecycle-tracking)
6. [Ecotone Framework](#ecotone-framework)
7. [Patterns avancés](#patterns-avancés)
8. [Checklist](#checklist)

---

## Quand utiliser l'async

| Opération | Sync | Async |
|-----------|------|-------|
| **Envoi email** | ❌ 2-5s | ✅ < 50ms |
| **Upload fichier** | ❌ 10-30s | ✅ < 100ms |
| **Génération PDF** | ❌ 5-10s | ✅ < 50ms |
| **Appel API externe** | ❌ 1-5s | ✅ < 50ms |
| **Calcul complexe** | ❌ > 5s | ✅ < 50ms |
| **Validation simple** | ✅ < 50ms | ❌ Overhead |

**Règle :** Toute opération > 200ms doit être async.

---

## Symfony Messenger

### Configuration

```yaml
# config/packages/messenger.yaml
framework:
    messenger:
        transports:
            async: '%env(MESSENGER_TRANSPORT_DSN)%'
            failed: 'doctrine://default?queue_name=failed'

        routing:
            'App\Message\SendEmailMessage': async
            'App\Message\GeneratePdfMessage': async
```

### Message

```php
final readonly class SendEmailMessage
{
    public function __construct(
        public string $to,
        public string $subject,
        public string $body,
    ) {}
}
```

### Handler

```php
#[AsMessageHandler]
final class SendEmailMessageHandler
{
    public function __construct(private MailerInterface $mailer) {}

    public function __invoke(SendEmailMessage $message): void
    {
        $email = (new Email())
            ->to($message->to)
            ->subject($message->subject)
            ->html($message->body);

        $this->mailer->send($email);
    }
}
```

### Dispatch

```php
// Controller
public function sendEmail(MessageBusInterface $bus): Response
{
    $bus->dispatch(new SendEmailMessage(
        to: 'user@example.com',
        subject: 'Welcome',
        body: 'Hello!',
    ));

    return new JsonResponse(['status' => 'queued']);
}
```

---

## Laravel Queue

### Configuration

```php
// config/queue.php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => null,
    ],
],
```

### Job

```php
class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $to,
        public string $subject,
        public string $body,
    ) {}

    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->to)
            ->send(new WelcomeEmail($this->subject, $this->body));
    }

    public function failed(Throwable $exception): void
    {
        // Loguer l'échec
        Log::error('Email failed', [
            'to' => $this->to,
            'error' => $exception->getMessage(),
        ]);
    }
}
```

### Dispatch

```php
// Controller
public function sendEmail(Request $request): JsonResponse
{
    SendEmailJob::dispatch(
        to: $request->input('email'),
        subject: 'Welcome',
        body: 'Hello!',
    );

    return response()->json(['status' => 'queued']);
}
```

---

## Competing Consumers

### Principe

Plusieurs workers consomment en parallèle la même queue pour augmenter le throughput.

> **Source :** [Message Processing in PHP](https://blog.ecotone.tech/message-processing-in-php-symfony-laravel-ecotone/)

```
Queue: emails (100 messages)
  ↓
Worker 1 → traite messages 1-25
Worker 2 → traite messages 26-50
Worker 3 → traite messages 51-75
Worker 4 → traite messages 76-100

Résultat: 4x plus rapide qu'un seul worker
```

### Symfony Messenger

```bash
# Lancer 4 workers en parallèle
bin/console messenger:consume async --limit=100 &
bin/console messenger:consume async --limit=100 &
bin/console messenger:consume async --limit=100 &
bin/console messenger:consume async --limit=100 &
```

**Docker Compose :**

```yaml
services:
  worker:
    image: app:latest
    command: php bin/console messenger:consume async --limit=100
    deploy:
      replicas: 4  # 4 workers en parallèle
```

### Laravel Queue

```bash
# Lancer 4 workers en parallèle
php artisan queue:work --queue=default --max-jobs=100 &
php artisan queue:work --queue=default --max-jobs=100 &
php artisan queue:work --queue=default --max-jobs=100 &
php artisan queue:work --queue=default --max-jobs=100 &
```

**Supervisor :**

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=4  ; 4 workers en parallèle
```

---

## Lifecycle Tracking

### Laravel Job Events

Laravel émet des events tout au long du cycle de vie d'un job.

**Events disponibles :**

| Event | Quand | Usage |
|-------|-------|-------|
| `JobProcessing` | Job démarre | Logging, metrics |
| `JobProcessed` | Job réussit | Notification, cleanup |
| `JobFailed` | Job échoue | Alerting, rollback |
| `JobRetryRequested` | Retry demandé | Monitoring |

**Exemple :**

```php
// AppServiceProvider
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobFailed;

Queue::after(function (JobProcessed $event) {
    // Loguer succès
    Log::info('Job completed', [
        'job' => $event->job->getName(),
        'duration' => microtime(true) - $event->job->getReservedTime(),
    ]);
});

Queue::failing(function (JobFailed $event) {
    // Alerter équipe
    Notification::route('slack', config('slack.webhook'))
        ->notify(new JobFailedNotification($event->job, $event->exception));
});
```

### Symfony Messenger Events

Symfony Messenger supporte des event subscribers pour tracker le lifecycle.

```php
class MessageLifecycleSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            WorkerMessageReceivedEvent::class => 'onMessageReceived',
            WorkerMessageHandledEvent::class => 'onMessageHandled',
            WorkerMessageFailedEvent::class => 'onMessageFailed',
        ];
    }

    public function onMessageReceived(WorkerMessageReceivedEvent $event): void
    {
        // Loguer début
    }

    public function onMessageHandled(WorkerMessageHandledEvent $event): void
    {
        // Loguer succès
    }

    public function onMessageFailed(WorkerMessageFailedEvent $event): void
    {
        // Alerter équipe
    }
}
```

---

## Ecotone Framework

### Principe

Ecotone est une abstraction messaging framework-agnostic pour PHP (Symfony, Laravel, standalone).

> **Source :** [Ecotone Blog](https://blog.ecotone.tech/message-processing-in-php-symfony-laravel-ecotone/)

**Avantages :**
- ✅ API unifiée (Symfony Messenger, Laravel Queue, RabbitMQ, SQS)
- ✅ Event Sourcing intégré
- ✅ CQRS out-of-the-box
- ✅ Sagas distribuées
- ✅ Testing simplifié

### Installation

```bash
composer require ecotone/laravel
# ou
composer require ecotone/symfony-bundle
```

### Usage

```php
// Message
#[CommandHandler]
class SendEmailHandler
{
    #[Asynchronous('async')]
    public function handle(SendEmail $command, Mailer $mailer): void
    {
        $mailer->send($command->to, $command->subject, $command->body);
    }
}
```

**Comparaison :**

| Framework | Code | Abstraction |
|-----------|------|-------------|
| **Symfony Messenger** | Symfony-specific | Non portable |
| **Laravel Queue** | Laravel-specific | Non portable |
| **Ecotone** | Framework-agnostic | ✅ Portable |

**Quand utiliser :** Projets multi-framework, migration Symfony ↔ Laravel, tests unitaires simplifiés.

---

## Patterns avancés

### Idempotence

**Problème :** Un message peut être traité plusieurs fois (network retry, crash).

**Solution :** Idempotency key.

```php
// Symfony
#[AsMessageHandler]
class ProcessPaymentHandler
{
    public function __invoke(ProcessPaymentMessage $message): void
    {
        // Vérifier si déjà traité
        if ($this->paymentRepo->existsByIdempotencyKey($message->idempotencyKey)) {
            return; // Déjà traité, skip
        }

        // Traiter
        $payment = $this->processPayment($message);

        // Sauvegarder idempotency key
        $payment->setIdempotencyKey($message->idempotencyKey);
        $this->em->flush();
    }
}
```

### Retry Policy

```yaml
# Symfony
framework:
    messenger:
        transports:
            async:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                retry_strategy:
                    max_retries: 3
                    delay: 1000        # 1s
                    multiplier: 2      # 1s, 2s, 4s
                    max_delay: 10000   # 10s max
```

```php
// Laravel
class SendEmailJob implements ShouldQueue
{
    public int $tries = 3;
    public int $backoff = 60; // 60s entre retries

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10); // Retry pendant 10 min max
    }
}
```

### Dead Letter Queue

```yaml
# Symfony
framework:
    messenger:
        transports:
            failed: 'doctrine://default?queue_name=failed'

        failure_transport: failed
```

```bash
# Réessayer les messages failed
bin/console messenger:failed:retry
```

**Laravel :**

```bash
# Voir les jobs failed
php artisan queue:failed

# Réessayer
php artisan queue:retry <id>

# Purger
php artisan queue:flush
```

---

## Checklist

### Configuration async

- [ ] Transport configuré (Redis, RabbitMQ, SQS)
- [ ] Workers configurés (Supervisor, systemd)
- [ ] Retry policy définie (3 retries, backoff exponentiel)
- [ ] Dead Letter Queue activée
- [ ] Monitoring (Prometheus, Datadog)

### Handler

- [ ] Idempotent (peut être rejoué sans effet de bord)
- [ ] Gère les erreurs (try/catch, log)
- [ ] Timeout défini (30s max)
- [ ] Tests unitaires (mock transport)

### Production

- [ ] Competing consumers (4-8 workers)
- [ ] Lifecycle tracking (logging, metrics)
- [ ] Alerting (job failed > 5% taux d'échec)

---

## Ressources

- **Symfony Messenger :** [symfony.com/doc/current/messenger.html](https://symfony.com/doc/current/messenger.html)
- **Laravel Queue :** [laravel.com/docs/queues](https://laravel.com/docs/queues)
- **Ecotone Framework :** [blog.ecotone.tech](https://blog.ecotone.tech/message-processing-in-php-symfony-laravel-ecotone/)
- **Competing Consumers Pattern :** [Microsoft Docs](https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers)

---

**Date de dernière mise à jour :** 2026-04
**Version :** 1.0.0
**Auteur :** The Bearded CTO
