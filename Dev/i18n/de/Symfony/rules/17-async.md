# Regel 10: Async-First mit Symfony Messenger

## Prinzip

**Jede lang laufende Operation (>500ms) MUSS asynchron sein.**

Vorteile:
- Sofortige HTTP-Antwort (UX)
- Resilienz (automatisches Retry)
- Horizontale Skalierbarkeit (Workers)
- Entkopplung (SRP)

## Messenger Konfiguration

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

            # Lange Commands → Async
            'App\*\Application\Command\SendInvoiceCommand': async
            'App\*\Application\Command\GeneratePdfCommand': async
```

## Message (Async Command)

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

        // PDF-Generierung (5-10 Sekunden)
        $pdf = $this->pdfGenerator->generate($invoice);

        // E-Mail-Versand
        $this->emailService->send(
            to: $invoice->getClient()->getEmail(),
            subject: 'Votre facture',
            attachments: [$pdf]
        );
    }
}
```

## Async Dispatch

```php
// In einem Controller oder State Processor
final readonly class InvoiceProcessor
{
    public function __construct(
        private MessageBusInterface $messageBus
    ) {}

    public function sendInvoice(InvoiceId $invoiceId): void
    {
        // Asynchroner Versand
        $this->messageBus->dispatch(
            new SendInvoiceCommand($invoiceId)
        );

        // SOFORTIGE Rückkehr (Versand erfolgt im Hintergrund)
    }
}
```

## Workers (Verarbeitung)

```bash
# Worker starten
php bin/console messenger:consume async -vv

# Produktion (supervisord)
[program:messenger-worker]
command=php /var/www/bin/console messenger:consume async --time-limit=3600
numprocs=4
autostart=true
autorestart=true
```

## Retry Strategy

```php
// Custom Retry Strategy
final class ExponentialBackoffRetryStrategy implements RetryStrategyInterface
{
    public function isRetryable(
        Envelope $message,
        \Throwable $throwable = null
    ): bool {
        // Keine Wiederholung bei Business-Fehlern
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
// Event Subscriber für Logging
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

## Async Checkliste

- [ ] Operationen >500ms asynchron
- [ ] Nachrichten unveränderlich (readonly)
- [ ] Handler mit `#[AsMessageHandler]`
- [ ] Retry Strategy konfiguriert
- [ ] Workers supervisord in Produktion
- [ ] Monitoring fehlgeschlagener Nachrichten
- [ ] Tests mit `messenger:consume --limit=1`
