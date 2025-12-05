# Performance & Optimierung - Atoll Tourisme

## Übersicht

Die Leistungsoptimierung ist **VERPFLICHTEND**, um ein reibungsloses Benutzererlebnis zu gewährleisten.

**Ziele:**
- ✅ Antwortzeit < 200ms (Seiten)
- ✅ Antwortzeit < 100ms (API)
- ✅ Redis-Cache für häufige Abfragen
- ✅ Symfony Messenger für asynchrone Aufgaben
- ✅ Systematische Paginierung
- ✅ Lazy Loading Doctrine
- ✅ Vermeidung von N+1 Queries

> **Referenzen:**
> - `01-symfony-best-practices.md` - Symfony Cache
> - `06-docker-hadolint.md` - Optimiertes Docker
> - `07-testing-tdd-bdd.md` - Performance-Tests

---

## Inhaltsverzeichnis

1. [Redis Cache](#redis-cache)
2. [Symfony Messenger - Async](#symfony-messenger---async)
3. [Paginierung](#paginierung)
4. [Doctrine Optimierungen](#doctrine-optimierungen)
5. [N+1 Query Vermeidung](#n1-query-vermeidung)
6. [Lazy Loading](#lazy-loading)
7. [HTTP Cache](#http-cache)
8. [Metriken und Monitoring](#metriken-und-monitoring)

---

## Redis Cache

### Redis Konfiguration

```yaml
# config/packages/cache.yaml

framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'

        pools:
            # ✅ Cache Aufenthalte (selten geänderte Daten)
            cache.sejours:
                adapter: cache.adapter.redis
                default_lifetime: 3600 # 1 Stunde
                tags: true

            # ✅ Cache Statistiken (regelmäßig neu berechnet)
            cache.statistics:
                adapter: cache.adapter.redis
                default_lifetime: 300 # 5 Minuten
                tags: true

            # ✅ Cache externe API (Rate Limiting vermeiden)
            cache.external_api:
                adapter: cache.adapter.redis
                default_lifetime: 7200 # 2 Stunden
```

```bash
# .env
REDIS_URL=redis://redis:6379/0
```

### Cache-Verwendung

```php
<?php

namespace App\Domain\Catalog\Repository;

use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

final readonly class CachedSejourRepository implements SejourRepositoryInterface
{
    public function __construct(
        private SejourRepositoryInterface $decorated,
        private CacheInterface $sejoursCache,
    ) {}

    public function findById(SejourId $id): Sejour
    {
        // ✅ Cache nach ID
        return $this->sejoursCache->get(
            'sejour_' . $id->getValue(),
            function (ItemInterface $item) use ($id): Sejour {
                // ✅ TTL: 1 Stunde
                $item->expiresAfter(3600);

                // ✅ Tags für gezielte Invalidierung
                $item->tag(['sejours', 'sejour_' . $id->getValue()]);

                // ✅ Berechnung nur bei Cache-Miss
                return $this->decorated->findById($id);
            }
        );
    }

    public function findAvailable(\DateTimeImmutable $dateDebut): array
    {
        $cacheKey = sprintf(
            'sejours_available_%s',
            $dateDebut->format('Y-m-d')
        );

        return $this->sejoursCache->get(
            $cacheKey,
            function (ItemInterface $item) use ($dateDebut): array {
                $item->expiresAfter(300); // 5 Minuten (sich ändernde Daten)
                $item->tag(['sejours', 'sejours_available']);

                return $this->decorated->findAvailable($dateDebut);
            }
        );
    }

    public function save(Sejour $sejour): void
    {
        $this->decorated->save($sejour);

        // ✅ Cache-Invalidierung nach Änderung
        $this->sejoursCache->invalidateTags([
            'sejours',
            'sejour_' . $sejour->getId()->getValue(),
        ]);
    }
}
```

### Cache Warming

```php
<?php

namespace App\Infrastructure\Cache\Warmer;

use Symfony\Component\HttpKernel\CacheWarmer\CacheWarmerInterface;

final readonly class SejourCacheWarmer implements CacheWarmerInterface
{
    public function __construct(
        private SejourRepositoryInterface $sejourRepository,
        private CacheInterface $sejoursCache,
    ) {}

    public function isOptional(): bool
    {
        return true;
    }

    public function warmUp(string $cacheDir, ?string $buildDir = null): array
    {
        // ✅ Vorladen aktiver Aufenthalte in den Cache
        $sejours = $this->sejourRepository->findActive();

        foreach ($sejours as $sejour) {
            $this->sejoursCache->get(
                'sejour_' . $sejour->getId()->getValue(),
                fn() => $sejour
            );
        }

        return [];
    }
}
```

---

## Symfony Messenger - Async

### Messenger Konfiguration

```yaml
# config/packages/messenger.yaml

framework:
    messenger:
        failure_transport: failed

        transports:
            # ✅ Async Transport für E-Mails
            async_emails:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                options:
                    queue_name: emails
                retry_strategy:
                    max_retries: 3
                    delay: 1000 # 1 Sekunde
                    multiplier: 2 # Exponentieller Backoff
                    max_delay: 10000 # Max 10 Sekunden

            # ✅ Async Transport für Statistiken
            async_statistics:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                options:
                    queue_name: statistics
                retry_strategy:
                    max_retries: 5

            # ✅ Failed Messages (für manuelles Retry)
            failed: 'doctrine://default?queue_name=failed'

        routing:
            # ✅ Asynchrone E-Mails
            'App\Infrastructure\Notification\Message\SendReservationConfirmationEmail': async_emails

            # ✅ Asynchrone Statistiken
            'App\Application\Statistics\Message\UpdateMonthlyStatistics': async_statistics

            # ✅ Domain Events standardmäßig synchron
            'App\Domain\*\Event\*': sync
```

```bash
# .env
MESSENGER_TRANSPORT_DSN=redis://redis:6379/messages
```

### Asynchrone Nachricht für E-Mails

```php
<?php

namespace App\Infrastructure\Notification\Message;

use App\Domain\Reservation\ValueObject\ReservationId;

// ✅ Einfache Nachricht (DTO)
final readonly class SendReservationConfirmationEmail
{
    public function __construct(
        public ReservationId $reservationId,
    ) {}
}
```

### Asynchroner Handler

```php
<?php

namespace App\Infrastructure\Notification\MessageHandler;

use Symfony\Component\Messenger\Attribute\AsMessageHandler;

// ✅ Handler wird asynchron verarbeitet
#[AsMessageHandler]
final readonly class SendReservationConfirmationEmailHandler
{
    public function __construct(
        private ReservationRepositoryInterface $reservationRepository,
        private MailerInterface $mailer,
    ) {}

    public function __invoke(SendReservationConfirmationEmail $message): void
    {
        $reservation = $this->reservationRepository->findById($message->reservationId);

        // ✅ E-Mail-Versand (im Hintergrund verarbeitet)
        $email = (new Email())
            ->to((string) $reservation->getClientEmail())
            ->subject('Confirmation de réservation')
            ->htmlTemplate('emails/confirmation_client.html.twig')
            ->context(['reservation' => $reservation]);

        $this->mailer->send($email);
    }
}
```

### Nachricht versenden

```php
<?php

namespace App\Application\Reservation\UseCase;

use Symfony\Component\Messenger\MessageBusInterface;

final readonly class CreateReservationUseCase
{
    public function __construct(
        private ReservationRepositoryInterface $repository,
        private MessageBusInterface $messageBus,
    ) {}

    public function execute(CreateReservationCommand $command): ReservationId
    {
        // 1. Reservierung erstellen
        $reservation = Reservation::create(/* ... */);
        $this->repository->save($reservation);

        // 2. ✅ Asynchrone Nachricht versenden (nicht blockierend)
        $this->messageBus->dispatch(
            new SendReservationConfirmationEmail($reservation->getId())
        );

        // 3. Sofortige Rückgabe (E-Mail wird im Hintergrund gesendet)
        return $reservation->getId();
    }
}
```

### Messenger Worker

```bash
# Nachrichten konsumieren (im Hintergrund)
make console CMD="messenger:consume async_emails async_statistics -vv"

# ✅ Produktion: Supervisord
# /etc/supervisor/conf.d/messenger-worker.conf
[program:messenger-consume]
command=php /app/bin/console messenger:consume async_emails async_statistics --time-limit=3600
numprocs=2
autostart=true
autorestart=true
```

---

## Paginierung

### Doctrine Paginierung

```php
<?php

namespace App\Domain\Reservation\Repository;

use Doctrine\ORM\Tools\Pagination\Paginator;

interface ReservationRepositoryInterface
{
    /**
     * @return Paginator<Reservation>
     */
    public function findPaginated(int $page = 1, int $limit = 20): Paginator;
}
```

```php
<?php

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use Doctrine\ORM\Tools\Pagination\Paginator;

final class DoctrineReservationRepository implements ReservationRepositoryInterface
{
    public function findPaginated(int $page = 1, int $limit = 20): Paginator
    {
        $query = $this->createQueryBuilder('r')
            ->orderBy('r.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit) // ✅ Offset
            ->setMaxResults($limit) // ✅ Limit
            ->getQuery();

        // ✅ Doctrine Paginator (verwaltet COUNT automatisch)
        return new Paginator($query, fetchJoinCollection: true);
    }
}
```

### Controller mit Paginierung

```php
<?php

namespace App\Presentation\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

final class ReservationController extends AbstractController
{
    #[Route('/admin/reservations', name: 'admin_reservations')]
    public function list(Request $request, ReservationRepositoryInterface $repository): Response
    {
        // ✅ Seite aus Query-String (?page=2)
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = 20;

        $paginator = $repository->findPaginated($page, $limit);

        return $this->render('admin/reservations/list.html.twig', [
            'reservations' => $paginator,
            'page' => $page,
            'limit' => $limit,
            'total' => count($paginator), // ✅ Gesamtanzahl Items
            'pages' => (int) ceil(count($paginator) / $limit), // ✅ Gesamtanzahl Seiten
        ]);
    }
}
```

### Paginierungs-Template

```twig
{# templates/admin/reservations/list.html.twig #}

<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Montant</th>
            <th>Statut</th>
        </tr>
    </thead>
    <tbody>
        {% for reservation in reservations %}
            <tr>
                <td>{{ reservation.id }}</td>
                <td>{{ reservation.clientEmail }}</td>
                <td>{{ reservation.montantTotal.amountEuros }}€</td>
                <td>{{ reservation.statut.value }}</td>
            </tr>
        {% endfor %}
    </tbody>
</table>

{# ✅ Paginierungs-Links #}
<nav>
    <ul class="pagination">
        {% if page > 1 %}
            <li><a href="{{ path('admin_reservations', {page: page - 1}) }}">Vorherige</a></li>
        {% endif %}

        {% for p in 1..pages %}
            <li class="{{ p == page ? 'active' : '' }}">
                <a href="{{ path('admin_reservations', {page: p}) }}">{{ p }}</a>
            </li>
        {% endfor %}

        {% if page < pages %}
            <li><a href="{{ path('admin_reservations', {page: page + 1}) }}">Nächste</a></li>
        {% endif %}
    </ul>
</nav>
```

---

## Doctrine Optimierungen

### Fetch JOIN zur Vermeidung von N+1

```php
<?php

// ❌ LANGSAM: N+1 Queries
$reservations = $this->createQueryBuilder('r')
    ->getQuery()
    ->getResult();

foreach ($reservations as $reservation) {
    // ✅ Jeder Zugriff = 1 zusätzliche Query!
    echo $reservation->getSejour()->getTitre(); // +1 Query
    foreach ($reservation->getParticipants() as $participant) { // +1 Query pro Reservierung
        echo $participant->getNom();
    }
}
// Gesamt: 1 + N + (N * M) Queries

// ✅ SCHNELL: Fetch JOIN (nur 1 Query)
$reservations = $this->createQueryBuilder('r')
    ->leftJoin('r.sejour', 's')
    ->addSelect('s') // ✅ Lädt Sejour gleichzeitig
    ->leftJoin('r.participants', 'p')
    ->addSelect('p') // ✅ Lädt Participants gleichzeitig
    ->getQuery()
    ->getResult();

foreach ($reservations as $reservation) {
    // ✅ Keine zusätzliche Query (bereits im Speicher)
    echo $reservation->getSejour()->getTitre();
    foreach ($reservation->getParticipants() as $participant) {
        echo $participant->getNom();
    }
}
// Gesamt: 1 Query
```

### Partial Objects (DTO)

```php
<?php

// ❌ LANGSAM: Lädt gesamte Entität
$reservations = $this->createQueryBuilder('r')
    ->getQuery()
    ->getResult(); // Hydratisiert alle Felder

// ✅ SCHNELL: Lädt nur benötigte Felder
$results = $this->createQueryBuilder('r')
    ->select('r.id', 'r.montantTotal', 's.titre')
    ->leftJoin('r.sejour', 's')
    ->getQuery()
    ->getArrayResult(); // ✅ Array, kein Doctrine-Objekt

// Oder mit DTO
$results = $this->createQueryBuilder('r')
    ->select('NEW App\Application\Reservation\DTO\ReservationListDTO(r.id, r.montantTotal, s.titre)')
    ->leftJoin('r.sejour', 's')
    ->getQuery()
    ->getResult();
```

### Batch Processing

```php
<?php

// ❌ LANGSAM: Alles im Speicher
$reservations = $this->repository->findAll(); // ⚠️ 10.000 Reservierungen!

foreach ($reservations as $reservation) {
    $reservation->updateStatistics();
    $this->entityManager->persist($reservation);
}

$this->entityManager->flush(); // ⚠️ Out of Memory!

// ✅ SCHNELL: Batch Processing
$batchSize = 100;
$i = 0;

$query = $this->entityManager->createQuery('SELECT r FROM App\Entity\Reservation r');

foreach ($query->toIterable() as $reservation) {
    $reservation->updateStatistics();
    $this->entityManager->persist($reservation);

    if (($i % $batchSize) === 0) {
        // ✅ Flush + Clear alle 100 Items
        $this->entityManager->flush();
        $this->entityManager->clear(); // ✅ Speicher freigeben
    }

    ++$i;
}

// Finaler Flush
$this->entityManager->flush();
$this->entityManager->clear();
```

---

## N+1 Query Vermeidung

### Doctrine Extension für Logging

```yaml
# config/packages/dev/doctrine.yaml

doctrine:
    dbal:
        logging: true # ✅ SQL-Logging in Dev aktivieren
        profiling: true

# ✅ Symfony Profiler Toolbar nutzen, um Queries zu sehen
```

### N+1 Erkennung mit Tests

```php
<?php

namespace App\Tests\Performance;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class ReservationPerformanceTest extends KernelTestCase
{
    /**
     * @test
     */
    public function it_does_not_generate_n_plus_1_queries_when_listing_reservations(): void
    {
        // Given: 10 Reservierungen mit Teilnehmern
        $this->loadFixtures(10);

        // ✅ Query-Zählung starten
        $this->enableQueryLogger();

        // When: Reservierungen auflisten
        $repository = $this->getContainer()->get(ReservationRepositoryInterface::class);
        $reservations = $repository->findAll();

        foreach ($reservations as $reservation) {
            // Zugriff auf Beziehungen
            $reservation->getSejour()->getTitre();
            foreach ($reservation->getParticipants() as $participant) {
                $participant->getNom();
            }
        }

        // Then: ✅ Maximal 3 Queries (Reservation + Sejour + Participants)
        $queryCount = $this->getQueryCount();
        self::assertLessThanOrEqual(
            3,
            $queryCount,
            "Expected max 3 queries, got {$queryCount} (N+1 detected!)"
        );
    }
}
```

---

## Lazy Loading

### Doctrine Lazy Loading Konfiguration

```yaml
# config/packages/doctrine.yaml

doctrine:
    orm:
        # ✅ Lazy Loading standardmäßig (Proxies)
        auto_generate_proxy_classes: true
        proxy_dir: '%kernel.cache_dir%/doctrine/orm/Proxies'
```

### Lazy Loading Verwendung

```php
<?php

namespace App\Domain\Reservation\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reservation
{
    // ✅ Lazy Loading standardmäßig (fetch="LAZY")
    #[ORM\ManyToOne(targetEntity: Sejour::class, fetch: 'LAZY')]
    private Sejour $sejour;

    // ✅ Eager Loading wenn immer benötigt
    #[ORM\ManyToOne(targetEntity: Client::class, fetch: 'EAGER')]
    private Client $client;

    // ✅ Extra Lazy für Collections (COUNT ohne alle zu laden)
    #[ORM\OneToMany(targetEntity: Participant::class, fetch: 'EXTRA_LAZY')]
    private Collection $participants;

    public function getParticipantCount(): int
    {
        // ✅ SELECT COUNT ohne alle Teilnehmer zu laden
        return $this->participants->count();
    }
}
```

---

## HTTP Cache

### HTTP Cache Konfiguration

```yaml
# config/packages/framework.yaml

framework:
    http_cache:
        enabled: true

    # ✅ ESI (Edge Side Includes) für gecachte Fragmente
    esi: { enabled: true }
    fragments: { path: /_fragment }
```

### Controller mit HTTP Cache

```php
<?php

namespace App\Presentation\Controller;

use Symfony\Component\HttpFoundation\Response;

final class SejourController extends AbstractController
{
    #[Route('/sejours/{id}', name: 'sejour_show')]
    public function show(Sejour $sejour): Response
    {
        $response = $this->render('sejour/show.html.twig', [
            'sejour' => $sejour,
        ]);

        // ✅ Öffentlicher HTTP-Cache (CDN)
        $response->setPublic();

        // ✅ Max Age: 1 Stunde
        $response->setMaxAge(3600);

        // ✅ ETag für Cache-Validierung
        $response->setEtag(md5($sejour->getUpdatedAt()->getTimestamp()));

        // ✅ Last-Modified
        $response->setLastModified($sejour->getUpdatedAt());

        // ✅ Validierung: Gibt 304 Not Modified zurück wenn Cache gültig
        if ($response->isNotModified($this->container->get('request_stack')->getCurrentRequest())) {
            return $response;
        }

        return $response;
    }
}
```

### ESI für Fragmente

```twig
{# templates/sejour/show.html.twig #}

<div class="sejour">
    <h1>{{ sejour.titre }}</h1>

    {# ✅ Unabhängig gecachtes Fragment (5 Minuten) #}
    {{ render_esi(controller('App\\Controller\\SejourController::availabilityWidget', {
        'sejourId': sejour.id
    })) }}
</div>
```

```php
<?php

public function availabilityWidget(string $sejourId): Response
{
    $response = $this->render('sejour/_availability_widget.html.twig', [
        'availability' => $this->getAvailability($sejourId),
    ]);

    // ✅ Fragment-Cache: 5 Minuten
    $response->setPublic();
    $response->setMaxAge(300);

    return $response;
}
```

---

## Metriken und Monitoring

### Blackfire.io (Profiling)

```yaml
# config/packages/blackfire.yaml

blackfire:
    server_id: '%env(BLACKFIRE_SERVER_ID)%'
    server_token: '%env(BLACKFIRE_SERVER_TOKEN)%'
```

```bash
# Profiling einer Anfrage
blackfire curl http://localhost:8080/reservations

# Profiling eines Befehls
blackfire run php bin/console app:update-statistics
```

### Symfony Profiler

```bash
# ✅ Automatisch in Dev aktiv
# Zugriff: http://localhost:8080/_profiler

# Überprüfen:
# - Database Queries (erkennt N+1)
# - Cache Hits/Misses
# - Ausführungszeit
# - Verwendeter Speicher
```

### Produktions-Monitoring

```php
<?php

namespace App\Infrastructure\Monitoring;

use Symfony\Component\HttpKernel\Event\TerminateEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Psr\Log\LoggerInterface;

#[AsEventListener]
final readonly class PerformanceMonitor
{
    public function __construct(
        private LoggerInterface $performanceLogger,
    ) {}

    public function __invoke(TerminateEvent $event): void
    {
        $request = $event->getRequest();
        $response = $event->getResponse();

        $duration = microtime(true) - $request->server->get('REQUEST_TIME_FLOAT');

        // ✅ Performance-Logging
        $this->performanceLogger->info('Request completed', [
            'route' => $request->attributes->get('_route'),
            'method' => $request->getMethod(),
            'status_code' => $response->getStatusCode(),
            'duration_ms' => round($duration * 1000, 2),
            'memory_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
        ]);

        // ✅ Warnung bei zu langsam
        if ($duration > 0.5) { // 500ms
            $this->performanceLogger->warning('Slow request detected', [
                'route' => $request->attributes->get('_route'),
                'duration_ms' => round($duration * 1000, 2),
            ]);
        }
    }
}
```

---

## Performance Checkliste

### Vor jedem Commit

- [ ] **N+1 Queries:** Keine Queries in Schleifen
- [ ] **Fetch JOIN:** Notwendige Beziehungen in 1 Query geladen
- [ ] **Paginierung:** Listen paginiert (max 50 Items/Seite)
- [ ] **Lazy Loading:** Extra Lazy auf Collections
- [ ] **Cache:** Selten geänderte Daten im Redis-Cache
- [ ] **Async:** E-Mails und schwere Aufgaben über Messenger

### Ziel-Metriken

| Metrik | Ziel | Limit |
|--------|------|-------|
| Seitenladezeit | < 200ms | < 500ms |
| API-Antwort | < 100ms | < 200ms |
| DB-Queries pro Seite | < 10 | < 20 |
| Cache-Hit-Ratio | > 80% | > 60% |
| Speichernutzung | < 50MB | < 128MB |

### Validierungswerkzeuge

```bash
# Blackfire Profiling
blackfire curl http://localhost:8080/reservations

# N+1 Query Tests
make test-integration

# Cache Hit Ratio
docker-compose exec redis redis-cli info stats | grep keyspace

# Slow Query Log
docker-compose exec postgres psql -U atoll -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"
```

---

## Ressourcen

- **Symfony Performance:** https://symfony.com/doc/current/performance.html
- **Doctrine Performance:** https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/improving-performance.html
- **Redis:** https://redis.io/documentation
- **Blackfire.io:** https://blackfire.io/docs/introduction

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
