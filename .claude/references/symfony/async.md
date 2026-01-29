# Règle 10 : Async-First avec Symfony Messenger

## Principe

**Toute opération longue (>500ms) DOIT être asynchrone.**

Avantages :
- Réponse HTTP immédiate (UX)
- Résilience (retry automatique)
- Scalabilité horizontale (workers)
- Découplage (SRP)

## Configuration Messenger

```yaml
# config/packages/messenger.yaml
framework:
    messenger:
        failure_transport: failed

        transports:
            async:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                retry_strategy:
                    max_retries: 3
                    delay: 1000
                    multiplier: 2
                    max_delay: 0
                    
            failed: 'doctrine://default?queue_name=failed'

        routing:
            # Domain Events → Async
            'App\*\Domain\*\Event\*': async
            
            # Commands longs → Async
            'App\*\Application\Command\SendInvoiceCommand': async
            'App\*\Application\Command\GeneratePdfCommand': async
```

## Message (Command Async)

```php
// Application/Command/SendInvoiceCommand.php

final readonly class SendInvoiceCommand
{
    public function __construct(
        public InvoiceId $invoiceId
    ) {}
}
```

## Message Handler

```php
// Application/Handler/SendInvoiceHandler.php

#[AsMessageHandler]
final readonly class SendInvoiceHandler
{
    public function __construct(
        private InvoiceRepositoryInterface $invoiceRepository,
        private PdfGeneratorInterface $pdfGenerator,
        private EmailServiceInterface $emailService
    ) {}

    public function __invoke(SendInvoiceCommand $command): void
    {
        $invoice = $this->invoiceRepository->findById($command->invoiceId);

        if ($invoice === null) {
            throw new InvoiceNotFoundException($command->invoiceId);
        }

        // Génération PDF (5-10 secondes)
        $pdf = $this->pdfGenerator->generate($invoice);

        // Envoi email
        $this->emailService->send(
            to: $invoice->getClient()->getEmail(),
            subject: 'Votre facture',
            attachments: [$pdf]
        );
    }
}
```

## Dispatch Async

```php
// Dans un Controller ou State Processor
final readonly class InvoiceProcessor
{
    public function __construct(
        private MessageBusInterface $messageBus
    ) {}

    public function sendInvoice(InvoiceId $invoiceId): void
    {
        // Dispatch asynchrone
        $this->messageBus->dispatch(
            new SendInvoiceCommand($invoiceId)
        );

        // Retour IMMÉDIAT (l'envoi se fera en background)
    }
}
```

## Workers (Consommation)

```bash
# Lancer un worker
php bin/console messenger:consume async -vv

# Production (supervisord)
[program:messenger-worker]
command=php /var/www/bin/console messenger:consume async --time-limit=3600
numprocs=4
autostart=true
autorestart=true
```

## Retry Strategy

```php
// Custom retry strategy
final class ExponentialBackoffRetryStrategy implements RetryStrategyInterface
{
    public function isRetryable(
        Envelope $message,
        \Throwable $throwable = null
    ): bool {
        // Ne pas retry les erreurs métier
        if ($throwable instanceof DomainException) {
            return false;
        }

        return true;
    }

    public function getWaitingTime(
        Envelope $message,
        \Throwable $throwable = null
    ): int {
        $retries = RedeliveryStamp::getRetryCountFromEnvelope($message);
        return 1000 * (2 ** $retries);  // 1s, 2s, 4s, 8s...
    }
}
```

## Monitoring

```php
// Event Subscriber pour logging
final class MessengerEventSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            WorkerMessageFailedEvent::class => 'onMessageFailed',
            WorkerMessageHandledEvent::class => 'onMessageHandled',
        ];
    }

    public function onMessageFailed(WorkerMessageFailedEvent $event): void
    {
        $this->logger->error('Message failed', [
            'message' => $event->getEnvelope()->getMessage()::class,
            'error' => $event->getThrowable()->getMessage(),
        ]);
    }

    public function onMessageHandled(WorkerMessageHandledEvent $event): void
    {
        $this->logger->info('Message handled successfully');
    }
}
```

## Checklist Async

- [ ] Opérations >500ms en asynchrone
- [ ] Messages immutables (readonly)
- [ ] Handlers avec `#[AsMessageHandler]`
- [ ] Retry strategy configurée
- [ ] Workers supervisord en prod
- [ ] Monitoring des failed messages
- [ ] Tests avec `messenger:consume --limit=1`
