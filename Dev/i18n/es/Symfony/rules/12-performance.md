# Rendimiento & Optimización - Atoll Tourisme

## Descripción General

La optimización del rendimiento es **OBLIGATORIA** para garantizar una experiencia de usuario fluida.

**Objetivos:**
- ✅ Tiempo de respuesta < 200ms (páginas)
- ✅ Tiempo de respuesta < 100ms (API)
- ✅ Caché Redis para consultas frecuentes
- ✅ Symfony Messenger para tareas asíncronas
- ✅ Paginación sistemática
- ✅ Lazy loading Doctrine
- ✅ Prevención N+1 queries

> **Referencias:**
> - `01-symfony-best-practices.md` - Caché Symfony
> - `06-docker-hadolint.md` - Docker optimizado
> - `07-testing-tdd-bdd.md` - Tests de rendimiento

---

## Tabla de Contenidos

1. [Caché Redis](#caché-redis)
2. [Symfony Messenger - Async](#symfony-messenger---async)
3. [Paginación](#paginación)
4. [Optimizaciones Doctrine](#optimizaciones-doctrine)
5. [Prevención N+1 Query](#prevención-n1-query)
6. [Lazy Loading](#lazy-loading)
7. [HTTP Cache](#http-cache)
8. [Métricas y monitoreo](#métricas-y-monitoreo)

---

## Caché Redis

### Configuración Redis

```yaml
# config/packages/cache.yaml

framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'

        pools:
            # ✅ Caché séjours (datos raramente modificados)
            cache.sejours:
                adapter: cache.adapter.redis
                default_lifetime: 3600 # 1 hora
                tags: true

            # ✅ Caché estadísticas (recalculadas regularmente)
            cache.statistics:
                adapter: cache.adapter.redis
                default_lifetime: 300 # 5 minutos
                tags: true

            # ✅ Caché API externa (evitar rate limiting)
            cache.external_api:
                adapter: cache.adapter.redis
                default_lifetime: 7200 # 2 horas
```

```bash
# .env
REDIS_URL=redis://redis:6379/0
```

### Uso del caché

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
        // ✅ Caché por ID
        return $this->sejoursCache->get(
            'sejour_' . $id->getValue(),
            function (ItemInterface $item) use ($id): Sejour {
                // ✅ TTL: 1 hora
                $item->expiresAfter(3600);

                // ✅ Tags para invalidación dirigida
                $item->tag(['sejours', 'sejour_' . $id->getValue()]);

                // ✅ Cálculo solo si cache miss
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
                $item->expiresAfter(300); // 5 minutos (datos cambiantes)
                $item->tag(['sejours', 'sejours_available']);

                return $this->decorated->findAvailable($dateDebut);
            }
        );
    }

    public function save(Sejour $sejour): void
    {
        $this->decorated->save($sejour);

        // ✅ Invalidación del caché después de modificación
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
        // ✅ Precarga las estancias activas en caché
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

### Configuración Messenger

```yaml
# config/packages/messenger.yaml

framework:
    messenger:
        failure_transport: failed

        transports:
            # ✅ Transport async para emails
            async_emails:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                options:
                    queue_name: emails
                retry_strategy:
                    max_retries: 3
                    delay: 1000 # 1 segundo
                    multiplier: 2 # Backoff exponencial
                    max_delay: 10000 # Máx 10 segundos

            # ✅ Transport async para estadísticas
            async_statistics:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                options:
                    queue_name: statistics
                retry_strategy:
                    max_retries: 5

            # ✅ Failed messages (para retry manual)
            failed: 'doctrine://default?queue_name=failed'

        routing:
            # ✅ Emails asíncronos
            'App\Infrastructure\Notification\Message\SendReservationConfirmationEmail': async_emails

            # ✅ Estadísticas asíncronas
            'App\Application\Statistics\Message\UpdateMonthlyStatistics': async_statistics

            # ✅ Domain Events síncronos por defecto
            'App\Domain\*\Event\*': sync
```

```bash
# .env
MESSENGER_TRANSPORT_DSN=redis://redis:6379/messages
```

### Mensaje asíncrono para emails

```php
<?php

namespace App\Infrastructure\Notification\Message;

use App\Domain\Reservation\ValueObject\ReservationId;

// ✅ Mensaje simple (DTO)
final readonly class SendReservationConfirmationEmail
{
    public function __construct(
        public ReservationId $reservationId,
    ) {}
}
```

### Handler asíncrono

```php
<?php

namespace App\Infrastructure\Notification\MessageHandler;

use Symfony\Component\Messenger\Attribute\AsMessageHandler;

// ✅ Handler tratado de manera asíncrona
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

        // ✅ Envío email (tratado en segundo plano)
        $email = (new Email())
            ->to((string) $reservation->getClientEmail())
            ->subject('Confirmación de reserva')
            ->htmlTemplate('emails/confirmation_client.html.twig')
            ->context(['reservation' => $reservation]);

        $this->mailer->send($email);
    }
}
```

### Dispatch del mensaje

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
        // 1. Crear la reserva
        $reservation = Reservation::create(/* ... */);
        $this->repository->save($reservation);

        // 2. ✅ Dispatch mensaje asíncrono (no bloqueante)
        $this->messageBus->dispatch(
            new SendReservationConfirmationEmail($reservation->getId())
        );

        // 3. Retorno inmediato (email enviado en segundo plano)
        return $reservation->getId();
    }
}
```

### Worker Messenger

```bash
# Consumir mensajes (en segundo plano)
make console CMD="messenger:consume async_emails async_statistics -vv"

# ✅ Producción: Supervisord
# /etc/supervisor/conf.d/messenger-worker.conf
[program:messenger-consume]
command=php /app/bin/console messenger:consume async_emails async_statistics --time-limit=3600
numprocs=2
autostart=true
autorestart=true
```

---

## Paginación

### Paginación Doctrine

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

        // ✅ Paginator Doctrine (gestiona COUNT automáticamente)
        return new Paginator($query, fetchJoinCollection: true);
    }
}
```

### Controller con paginación

```php
<?php

namespace App\Presentation\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

final class ReservationController extends AbstractController
{
    #[Route('/admin/reservations', name: 'admin_reservations')]
    public function list(Request $request, ReservationRepositoryInterface $repository): Response
    {
        // ✅ Página desde query string (?page=2)
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = 20;

        $paginator = $repository->findPaginated($page, $limit);

        return $this->render('admin/reservations/list.html.twig', [
            'reservations' => $paginator,
            'page' => $page,
            'limit' => $limit,
            'total' => count($paginator), // ✅ Total items
            'pages' => (int) ceil(count($paginator) / $limit), // ✅ Total páginas
        ]);
    }
}
```

### Template paginación

```twig
{# templates/admin/reservations/list.html.twig #}

<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Estado</th>
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

{# ✅ Links de paginación #}
<nav>
    <ul class="pagination">
        {% if page > 1 %}
            <li><a href="{{ path('admin_reservations', {page: page - 1}) }}">Anterior</a></li>
        {% endif %}

        {% for p in 1..pages %}
            <li class="{{ p == page ? 'active' : '' }}">
                <a href="{{ path('admin_reservations', {page: p}) }}">{{ p }}</a>
            </li>
        {% endfor %}

        {% if page < pages %}
            <li><a href="{{ path('admin_reservations', {page: page + 1}) }}">Siguiente</a></li>
        {% endif %}
    </ul>
</nav>
```

---

## Optimizaciones Doctrine

### Fetch JOIN para evitar N+1

```php
<?php

// ❌ LENTO: N+1 queries
$reservations = $this->createQueryBuilder('r')
    ->getQuery()
    ->getResult();

foreach ($reservations as $reservation) {
    // ✅ Cada acceso = 1 query adicional!
    echo $reservation->getSejour()->getTitre(); // +1 query
    foreach ($reservation->getParticipants() as $participant) { // +1 query por reserva
        echo $participant->getNom();
    }
}
// Total: 1 + N + (N * M) queries

// ✅ RÁPIDO: Fetch JOIN (1 sola query)
$reservations = $this->createQueryBuilder('r')
    ->leftJoin('r.sejour', 's')
    ->addSelect('s') // ✅ Carga sejour al mismo tiempo
    ->leftJoin('r.participants', 'p')
    ->addSelect('p') // ✅ Carga participantes al mismo tiempo
    ->getQuery()
    ->getResult();

foreach ($reservations as $reservation) {
    // ✅ Sin query adicional (ya en memoria)
    echo $reservation->getSejour()->getTitre();
    foreach ($reservation->getParticipants() as $participant) {
        echo $participant->getNom();
    }
}
// Total: 1 query
```

### Objetos Parciales (DTO)

```php
<?php

// ❌ LENTO: Carga toda la entity
$reservations = $this->createQueryBuilder('r')
    ->getQuery()
    ->getResult(); // Hidrata todos los campos

// ✅ RÁPIDO: Carga solo los campos necesarios
$results = $this->createQueryBuilder('r')
    ->select('r.id', 'r.montantTotal', 's.titre')
    ->leftJoin('r.sejour', 's')
    ->getQuery()
    ->getArrayResult(); // ✅ Array, no objeto Doctrine

// O con DTO
$results = $this->createQueryBuilder('r')
    ->select('NEW App\Application\Reservation\DTO\ReservationListDTO(r.id, r.montantTotal, s.titre)')
    ->leftJoin('r.sejour', 's')
    ->getQuery()
    ->getResult();
```

### Batch Processing

```php
<?php

// ❌ LENTO: Todo en memoria
$reservations = $this->repository->findAll(); // ⚠️ ¡10,000 reservas!

foreach ($reservations as $reservation) {
    $reservation->updateStatistics();
    $this->entityManager->persist($reservation);
}

$this->entityManager->flush(); // ⚠️ ¡Out of memory!

// ✅ RÁPIDO: Batch processing
$batchSize = 100;
$i = 0;

$query = $this->entityManager->createQuery('SELECT r FROM App\Entity\Reservation r');

foreach ($query->toIterable() as $reservation) {
    $reservation->updateStatistics();
    $this->entityManager->persist($reservation);

    if (($i % $batchSize) === 0) {
        // ✅ Flush + clear cada 100 items
        $this->entityManager->flush();
        $this->entityManager->clear(); // ✅ Libera memoria
    }

    ++$i;
}

// Flush final
$this->entityManager->flush();
$this->entityManager->clear();
```

---

## Prevención N+1 Query

### Doctrine Extension para logging

```yaml
# config/packages/dev/doctrine.yaml

doctrine:
    dbal:
        logging: true # ✅ Activa logging SQL en dev
        profiling: true

# ✅ Usar la Symfony Profiler toolbar para ver las queries
```

### Detección N+1 con tests

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
        // Given: 10 reservas con participantes
        $this->loadFixtures(10);

        // ✅ Comienza a contar queries
        $this->enableQueryLogger();

        // When: Lista las reservas
        $repository = $this->getContainer()->get(ReservationRepositoryInterface::class);
        $reservations = $repository->findAll();

        foreach ($reservations as $reservation) {
            // Acceso a relaciones
            $reservation->getSejour()->getTitre();
            foreach ($reservation->getParticipants() as $participant) {
                $participant->getNom();
            }
        }

        // Then: ✅ Máximo 3 queries (reservation + sejour + participantes)
        $queryCount = $this->getQueryCount();
        self::assertLessThanOrEqual(
            3,
            $queryCount,
            "Expected max 3 queries, got {$queryCount} (N+1 detectado!)"
        );
    }
}
```

---

## Lazy Loading

### Configuración Doctrine Lazy Loading

```yaml
# config/packages/doctrine.yaml

doctrine:
    orm:
        # ✅ Lazy loading por defecto (proxies)
        auto_generate_proxy_classes: true
        proxy_dir: '%kernel.cache_dir%/doctrine/orm/Proxies'
```

### Uso Lazy Loading

```php
<?php

namespace App\Domain\Reservation\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reservation
{
    // ✅ Lazy loading por defecto (fetch="LAZY")
    #[ORM\ManyToOne(targetEntity: Sejour::class, fetch: 'LAZY')]
    private Sejour $sejour;

    // ✅ Eager loading si siempre es necesario
    #[ORM\ManyToOne(targetEntity: Client::class, fetch: 'EAGER')]
    private Client $client;

    // ✅ Extra lazy para colecciones (COUNT sin cargar todos)
    #[ORM\OneToMany(targetEntity: Participant::class, fetch: 'EXTRA_LAZY')]
    private Collection $participants;

    public function getParticipantCount(): int
    {
        // ✅ SELECT COUNT sin cargar todos los participantes
        return $this->participants->count();
    }
}
```

---

## HTTP Cache

### Configuración HTTP Cache

```yaml
# config/packages/framework.yaml

framework:
    http_cache:
        enabled: true

    # ✅ ESI (Edge Side Includes) para fragmentos cacheados
    esi: { enabled: true }
    fragments: { path: /_fragment }
```

### Controller con cache HTTP

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

        // ✅ Cache HTTP público (CDN)
        $response->setPublic();

        // ✅ Max age: 1 hora
        $response->setMaxAge(3600);

        // ✅ ETag para validación cache
        $response->setEtag(md5($sejour->getUpdatedAt()->getTimestamp()));

        // ✅ Last-Modified
        $response->setLastModified($sejour->getUpdatedAt());

        // ✅ Validación: devuelve 304 Not Modified si cache válido
        if ($response->isNotModified($this->container->get('request_stack')->getCurrentRequest())) {
            return $response;
        }

        return $response;
    }
}
```

### ESI para fragmentos

```twig
{# templates/sejour/show.html.twig #}

<div class="sejour">
    <h1>{{ sejour.titre }}</h1>

    {# ✅ Fragmento cacheado independientemente (5 minutos) #}
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

    // ✅ Cache fragmento: 5 minutos
    $response->setPublic();
    $response->setMaxAge(300);

    return $response;
}
```

---

## Métricas y monitoreo

### Blackfire.io (profiling)

```yaml
# config/packages/blackfire.yaml

blackfire:
    server_id: '%env(BLACKFIRE_SERVER_ID)%'
    server_token: '%env(BLACKFIRE_SERVER_TOKEN)%'
```

```bash
# Profiling de una petición
blackfire curl http://localhost:8080/reservations

# Profiling de un comando
blackfire run php bin/console app:update-statistics
```

### Symfony Profiler

```bash
# ✅ Activo en dev automáticamente
# Acceso: http://localhost:8080/_profiler

# Verificar:
# - Database queries (detecta N+1)
# - Cache hits/misses
# - Tiempo de ejecución
# - Memoria utilizada
```

### Monitoreo producción

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

        // ✅ Log rendimiento
        $this->performanceLogger->info('Request completed', [
            'route' => $request->attributes->get('_route'),
            'method' => $request->getMethod(),
            'status_code' => $response->getStatusCode(),
            'duration_ms' => round($duration * 1000, 2),
            'memory_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
        ]);

        // ✅ Alerta si muy lento
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

## Checklist rendimiento

### Antes de cada commit

- [ ] **N+1 Queries:** Sin queries en bucles
- [ ] **Fetch JOIN:** Relaciones necesarias cargadas en 1 query
- [ ] **Paginación:** Listas paginadas (máx 50 items/página)
- [ ] **Lazy Loading:** Extra lazy en colecciones
- [ ] **Cache:** Datos raramente modificados en caché Redis
- [ ] **Async:** Emails y tareas pesadas vía Messenger

### Métricas objetivo

| Métrica | Objetivo | Límite |
|---------|----------|--------|
| Page load | < 200ms | < 500ms |
| API response | < 100ms | < 200ms |
| Database queries por página | < 10 | < 20 |
| Cache hit ratio | > 80% | > 60% |
| Memory usage | < 50MB | < 128MB |

### Herramientas de validación

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

## Recursos

- **Symfony Performance:** https://symfony.com/doc/current/performance.html
- **Doctrine Performance:** https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/improving-performance.html
- **Redis:** https://redis.io/documentation
- **Blackfire.io:** https://blackfire.io/docs/introduction

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
