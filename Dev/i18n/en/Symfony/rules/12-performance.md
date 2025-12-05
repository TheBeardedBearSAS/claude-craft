# Performance & Optimization - Atoll Tourisme

## Overview

L'optimisation des performances est **OBLIGATOIRE** pour garantir une expérience utilisateur fluide.

**Objectifs:**
- ✅ Temps de réponse < 200ms (pages)
- ✅ Temps de réponse < 100ms (API)
- ✅ Cache Redis pour requêtes fréquentes
- ✅ Symfony Messenger pour tâches asynchrones
- ✅ Pagination systématique
- ✅ Lazy loading Doctrine
- ✅ Prévention N+1 queries

> **Références:**
> - `01-symfony-best-practices.md` - Cache Symfony
> - `06-docker-hadolint.md` - Docker optimisé
> - `07-testing-tdd-bdd.md` - Tests de performance

---

## Table des matières

1. [Cache Redis](#cache-redis)
2. [Symfony Messenger - Async](#symfony-messenger---async)
3. [Pagination](#pagination)
4. [Doctrine Optimizations](#doctrine-optimizations)
5. [N+1 Query Prevention](#n1-query-prevention)
6. [Lazy Loading](#lazy-loading)
7. [HTTP Cache](#http-cache)
8. [Métriques et monitoring](#métriques-et-monitoring)

---

## Cache Redis

### Configuration Redis

```yaml
# config/packages/cache.yaml

framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'

        pools:
            # ✅ Cache séjours (données rarement modifiées)
            cache.sejours:
                adapter: cache.adapter.redis
                default_lifetime: 3600 # 1 heure
                tags: true

            # ✅ Cache statistiques (recalculées régulièrement)
            cache.statistics:
                adapter: cache.adapter.redis
                default_lifetime: 300 # 5 minutes
                tags: true

            # ✅ Cache API externe (éviter rate limiting)
            cache.external_api:
                adapter: cache.adapter.redis
                default_lifetime: 7200 # 2 heures
```

```bash
# .env
REDIS_URL=redis://redis:6379/0
```

### Usage du cache

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
        // ✅ Cache par ID
        return $this->sejoursCache->get(
            'sejour_' . $id->getValue(),
            function (ItemInterface $item) use ($id): Sejour {
                // ✅ TTL: 1 heure
                $item->expiresAfter(3600);

                // ✅ Tags pour invalidation ciblée
                $item->tag(['sejours', 'sejour_' . $id->getValue()]);

                // ✅ Calcul uniquement si cache miss
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
                $item->expiresAfter(300); // 5 minutes (données changeantes)
                $item->tag(['sejours', 'sejours_available']);

                return $this->decorated->findAvailable($dateDebut);
            }
        );
    }

    public function save(Sejour $sejour): void
    {
        $this->decorated->save($sejour);

        // ✅ Invalidation du cache après modification
        $this->sejoursCache->invalidateTags([
            'sejours',
            'sejour_' . $sejour->getId()->getValue(),
        ]);
    }
}
```

### Cache warming

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
        // ✅ Précharge les séjours actifs en cache
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

### Configuration Messenger

```yaml
# config/packages/messenger.yaml

framework:
    messenger:
        failure_transport: failed

        transports:
            # ✅ Transport async pour emails
            async_emails:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                options:
                    queue_name: emails
                retry_strategy:
                    max_retries: 3
                    delay: 1000 # 1 seconde
                    multiplier: 2 # Backoff exponentiel
                    max_delay: 10000 # Max 10 secondes

            # ✅ Transport async pour statistiques
            async_statistics:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                options:
                    queue_name: statistics
                retry_strategy:
                    max_retries: 5

            # ✅ Failed messages (pour retry manuel)
            failed: 'doctrine://default?queue_name=failed'

        routing:
            # ✅ Emails asynchrones
            'App\Infrastructure\Notification\Message\SendReservationConfirmationEmail': async_emails

            # ✅ Statistiques asynchrones
            'App\Application\Statistics\Message\UpdateMonthlyStatistics': async_statistics

            # ✅ Domain Events synchrones par défaut
            'App\Domain\*\Event\*': sync
```

```bash
# .env
MESSENGER_TRANSPORT_DSN=redis://redis:6379/messages
```

### Message asynchrone pour emails

```php
<?php

namespace App\Infrastructure\Notification\Message;

use App\Domain\Reservation\ValueObject\ReservationId;

// ✅ Message simple (DTO)
final readonly class SendReservationConfirmationEmail
{
    public function __construct(
        public ReservationId $reservationId,
    ) {}
}
```

### Handler asynchrone

```php
<?php

namespace App\Infrastructure\Notification\MessageHandler;

use Symfony\Component\Messenger\Attribute\AsMessageHandler;

// ✅ Handler traité de manière asynchrone
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

        // ✅ Envoi email (traité en arrière-plan)
        $email = (new Email())
            ->to((string) $reservation->getClientEmail())
            ->subject('Confirmation de réservation')
            ->htmlTemplate('emails/confirmation_client.html.twig')
            ->context(['reservation' => $reservation]);

        $this->mailer->send($email);
    }
}
```

### Dispatch du message

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
        // 1. Créer la réservation
        $reservation = Reservation::create(/* ... */);
        $this->repository->save($reservation);

        // 2. ✅ Dispatch message asynchrone (non bloquant)
        $this->messageBus->dispatch(
            new SendReservationConfirmationEmail($reservation->getId())
        );

        // 3. Retour immédiat (email envoyé en arrière-plan)
        return $reservation->getId();
    }
}
```

### Worker Messenger

```bash
# Consommer les messages (en arrière-plan)
make console CMD="messenger:consume async_emails async_statistics -vv"

# ✅ Production: Supervisord
# /etc/supervisor/conf.d/messenger-worker.conf
[program:messenger-consume]
command=php /app/bin/console messenger:consume async_emails async_statistics --time-limit=3600
numprocs=2
autostart=true
autorestart=true
```

---

## Pagination

### Pagination Doctrine

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

        // ✅ Paginator Doctrine (gère le COUNT automatiquement)
        return new Paginator($query, fetchJoinCollection: true);
    }
}
```

### Controller avec pagination

```php
<?php

namespace App\Presentation\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

final class ReservationController extends AbstractController
{
    #[Route('/admin/reservations', name: 'admin_reservations')]
    public function list(Request $request, ReservationRepositoryInterface $repository): Response
    {
        // ✅ Page depuis query string (?page=2)
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = 20;

        $paginator = $repository->findPaginated($page, $limit);

        return $this->render('admin/reservations/list.html.twig', [
            'reservations' => $paginator,
            'page' => $page,
            'limit' => $limit,
            'total' => count($paginator), // ✅ Total items
            'pages' => (int) ceil(count($paginator) / $limit), // ✅ Total pages
        ]);
    }
}
```

### Template pagination

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

{# ✅ Pagination links #}
<nav>
    <ul class="pagination">
        {% if page > 1 %}
            <li><a href="{{ path('admin_reservations', {page: page - 1}) }}">Précédent</a></li>
        {% endif %}

        {% for p in 1..pages %}
            <li class="{{ p == page ? 'active' : '' }}">
                <a href="{{ path('admin_reservations', {page: p}) }}">{{ p }}</a>
            </li>
        {% endfor %}

        {% if page < pages %}
            <li><a href="{{ path('admin_reservations', {page: page + 1}) }}">Suivant</a></li>
        {% endif %}
    </ul>
</nav>
```

---

## Doctrine Optimizations

### Fetch JOIN pour éviter N+1

```php
<?php

// ❌ LENT: N+1 queries
$reservations = $this->createQueryBuilder('r')
    ->getQuery()
    ->getResult();

foreach ($reservations as $reservation) {
    // ✅ Chaque accès = 1 query supplémentaire!
    echo $reservation->getSejour()->getTitre(); // +1 query
    foreach ($reservation->getParticipants() as $participant) { // +1 query par reservation
        echo $participant->getNom();
    }
}
// Total: 1 + N + (N * M) queries

// ✅ RAPIDE: Fetch JOIN (1 seule query)
$reservations = $this->createQueryBuilder('r')
    ->leftJoin('r.sejour', 's')
    ->addSelect('s') // ✅ Charge sejour en même temps
    ->leftJoin('r.participants', 'p')
    ->addSelect('p') // ✅ Charge participants en même temps
    ->getQuery()
    ->getResult();

foreach ($reservations as $reservation) {
    // ✅ Pas de query supplémentaire (déjà en mémoire)
    echo $reservation->getSejour()->getTitre();
    foreach ($reservation->getParticipants() as $participant) {
        echo $participant->getNom();
    }
}
// Total: 1 query
```

### Partial Objects (DTO)

```php
<?php

// ❌ LENT: Charge toute l'entité
$reservations = $this->createQueryBuilder('r')
    ->getQuery()
    ->getResult(); // Hydrate tous les champs

// ✅ RAPIDE: Charge uniquement les champs nécessaires
$results = $this->createQueryBuilder('r')
    ->select('r.id', 'r.montantTotal', 's.titre')
    ->leftJoin('r.sejour', 's')
    ->getQuery()
    ->getArrayResult(); // ✅ Array, pas d'objet Doctrine

// Ou avec un DTO
$results = $this->createQueryBuilder('r')
    ->select('NEW App\Application\Reservation\DTO\ReservationListDTO(r.id, r.montantTotal, s.titre)')
    ->leftJoin('r.sejour', 's')
    ->getQuery()
    ->getResult();
```

### Batch Processing

```php
<?php

// ❌ LENT: Tout en mémoire
$reservations = $this->repository->findAll(); // ⚠️ 10,000 réservations!

foreach ($reservations as $reservation) {
    $reservation->updateStatistics();
    $this->entityManager->persist($reservation);
}

$this->entityManager->flush(); // ⚠️ Out of memory!

// ✅ RAPIDE: Batch processing
$batchSize = 100;
$i = 0;

$query = $this->entityManager->createQuery('SELECT r FROM App\Entity\Reservation r');

foreach ($query->toIterable() as $reservation) {
    $reservation->updateStatistics();
    $this->entityManager->persist($reservation);

    if (($i % $batchSize) === 0) {
        // ✅ Flush + clear tous les 100 items
        $this->entityManager->flush();
        $this->entityManager->clear(); // ✅ Libère la mémoire
    }

    ++$i;
}

// Flush final
$this->entityManager->flush();
$this->entityManager->clear();
```

---

## N+1 Query Prevention

### Doctrine Extension pour logging

```yaml
# config/packages/dev/doctrine.yaml

doctrine:
    dbal:
        logging: true # ✅ Active le logging SQL en dev
        profiling: true

# ✅ Utiliser la Symfony Profiler toolbar pour voir les queries
```

### Détection N+1 avec tests

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
        // Given: 10 réservations avec participants
        $this->loadFixtures(10);

        // ✅ Commence à compter les queries
        $this->enableQueryLogger();

        // When: Liste les réservations
        $repository = $this->getContainer()->get(ReservationRepositoryInterface::class);
        $reservations = $repository->findAll();

        foreach ($reservations as $reservation) {
            // Accès aux relations
            $reservation->getSejour()->getTitre();
            foreach ($reservation->getParticipants() as $participant) {
                $participant->getNom();
            }
        }

        // Then: ✅ Maximum 3 queries (reservation + sejour + participants)
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

### Configuration Doctrine Lazy Loading

```yaml
# config/packages/doctrine.yaml

doctrine:
    orm:
        # ✅ Lazy loading par défaut (proxies)
        auto_generate_proxy_classes: true
        proxy_dir: '%kernel.cache_dir%/doctrine/orm/Proxies'
```

### Usage Lazy Loading

```php
<?php

namespace App\Domain\Reservation\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reservation
{
    // ✅ Lazy loading par défaut (fetch="LAZY")
    #[ORM\ManyToOne(targetEntity: Sejour::class, fetch: 'LAZY')]
    private Sejour $sejour;

    // ✅ Eager loading si toujours nécessaire
    #[ORM\ManyToOne(targetEntity: Client::class, fetch: 'EAGER')]
    private Client $client;

    // ✅ Extra lazy pour collections (COUNT sans charger tous)
    #[ORM\OneToMany(targetEntity: Participant::class, fetch: 'EXTRA_LAZY')]
    private Collection $participants;

    public function getParticipantCount(): int
    {
        // ✅ SELECT COUNT sans charger tous les participants
        return $this->participants->count();
    }
}
```

---

## HTTP Cache

### Configuration HTTP Cache

```yaml
# config/packages/framework.yaml

framework:
    http_cache:
        enabled: true

    # ✅ ESI (Edge Side Includes) pour fragments cachés
    esi: { enabled: true }
    fragments: { path: /_fragment }
```

### Controller avec cache HTTP

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

        // ✅ Cache HTTP public (CDN)
        $response->setPublic();

        // ✅ Max age: 1 heure
        $response->setMaxAge(3600);

        // ✅ ETag pour validation cache
        $response->setEtag(md5($sejour->getUpdatedAt()->getTimestamp()));

        // ✅ Last-Modified
        $response->setLastModified($sejour->getUpdatedAt());

        // ✅ Validation: retourne 304 Not Modified si cache valide
        if ($response->isNotModified($this->container->get('request_stack')->getCurrentRequest())) {
            return $response;
        }

        return $response;
    }
}
```

### ESI pour fragments

```twig
{# templates/sejour/show.html.twig #}

<div class="sejour">
    <h1>{{ sejour.titre }}</h1>

    {# ✅ Fragment caché indépendamment (5 minutes) #}
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

    // ✅ Cache fragment: 5 minutes
    $response->setPublic();
    $response->setMaxAge(300);

    return $response;
}
```

---

## Métriques et monitoring

### Blackfire.io (profiling)

```yaml
# config/packages/blackfire.yaml

blackfire:
    server_id: '%env(BLACKFIRE_SERVER_ID)%'
    server_token: '%env(BLACKFIRE_SERVER_TOKEN)%'
```

```bash
# Profiling d'une requête
blackfire curl http://localhost:8080/reservations

# Profiling d'une commande
blackfire run php bin/console app:update-statistics
```

### Symfony Profiler

```bash
# ✅ Actif en dev automatiquement
# Accès: http://localhost:8080/_profiler

# Vérifier:
# - Database queries (détecte N+1)
# - Cache hits/misses
# - Temps d'exécution
# - Mémoire utilisée
```

### Monitoring production

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

        // ✅ Log performances
        $this->performanceLogger->info('Request completed', [
            'route' => $request->attributes->get('_route'),
            'method' => $request->getMethod(),
            'status_code' => $response->getStatusCode(),
            'duration_ms' => round($duration * 1000, 2),
            'memory_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
        ]);

        // ✅ Alerte si trop lent
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

## Checklist performance

### Before chaque commit

- [ ] **N+1 Queries:** Pas de queries dans les boucles
- [ ] **Fetch JOIN:** Relations nécessaires chargées en 1 query
- [ ] **Pagination:** Listes paginées (max 50 items/page)
- [ ] **Lazy Loading:** Extra lazy sur collections
- [ ] **Cache:** Données rarement modifiées en cache Redis
- [ ] **Async:** Emails et tâches lourdes via Messenger

### Métriques cibles

| Métrique | Cible | Limite |
|----------|-------|--------|
| Page load | < 200ms | < 500ms |
| API response | < 100ms | < 200ms |
| Database queries par page | < 10 | < 20 |
| Cache hit ratio | > 80% | > 60% |
| Memory usage | < 50MB | < 128MB |

### Outils de validation

```bash
# Profiling Blackfire
blackfire curl http://localhost:8080/reservations

# Test N+1 queries
make test-integration

# Cache hit ratio
docker-compose exec redis redis-cli info stats | grep keyspace

# Slow query log
docker-compose exec postgres psql -U atoll -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"
```

---

## Ressources

- **Symfony Performance:** https://symfony.com/doc/current/performance.html
- **Doctrine Performance:** https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/improving-performance.html
- **Redis:** https://redis.io/documentation
- **Blackfire.io:** https://blackfire.io/docs/introduction

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
