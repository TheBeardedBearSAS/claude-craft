# JSON Streamer Component - Symfony 8.0

## Overview

Le **JSON Streamer Component** de Symfony 8.0 permet le streaming haute performance de données JSON volumineuses sans charger l'intégralité en mémoire.

**Cas d'usage:**
- Import/export de fichiers JSON volumineux (> 100 Mo)
- APIs paginées avec streaming
- Traitement de logs JSON
- ETL pipelines

## Installation

```bash
composer require symfony/json-streamer
```

## Lecture Streaming

### JsonStreamReader - Lecture élément par élément

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Import;

use Symfony\Component\JsonStreamer\JsonStreamReader;
use Symfony\Component\JsonStreamer\Read\LazyObjectReader;

final readonly class LargeJsonImporter
{
    public function __construct(
        private string $uploadDirectory,
    ) {}

    /**
     * Importe un fichier JSON volumineux sans saturer la mémoire.
     *
     * @return iterable<array<string, mixed>>
     */
    public function importFromFile(string $filename): iterable
    {
        $filePath = $this->uploadDirectory . '/' . $filename;
        $stream = fopen($filePath, 'rb');

        if ($stream === false) {
            throw new ImportException("Cannot open file: {$filename}");
        }

        try {
            $reader = new JsonStreamReader($stream);

            // Stream chaque élément du tableau JSON
            foreach ($reader->readItems() as $item) {
                yield $item;
            }
        } finally {
            fclose($stream);
        }
    }
}
```

### Lecture avec Mapping vers DTO

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Import;

use App\Application\Dto\ProductImportDto;
use Symfony\Component\JsonStreamer\JsonStreamReader;
use Symfony\Component\Serializer\SerializerInterface;

final readonly class ProductStreamImporter
{
    public function __construct(
        private SerializerInterface $serializer,
    ) {}

    /**
     * @return iterable<ProductImportDto>
     */
    public function streamProducts(string $jsonPath): iterable
    {
        $stream = fopen($jsonPath, 'rb');

        try {
            $reader = new JsonStreamReader($stream);

            foreach ($reader->readItems() as $rawItem) {
                // Désérialisation avec type safety
                yield $this->serializer->denormalize(
                    $rawItem,
                    ProductImportDto::class,
                );
            }
        } finally {
            fclose($stream);
        }
    }
}
```

## Écriture Streaming

### JsonStreamWriter - Écriture progressive

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Export;

use Symfony\Component\JsonStreamer\JsonStreamWriter;

final readonly class LargeJsonExporter
{
    public function __construct(
        private string $exportDirectory,
    ) {}

    /**
     * Exporte des données en streaming vers un fichier JSON.
     *
     * @param iterable<array<string, mixed>> $items
     */
    public function exportToFile(iterable $items, string $filename): void
    {
        $filePath = $this->exportDirectory . '/' . $filename;
        $stream = fopen($filePath, 'wb');

        if ($stream === false) {
            throw new ExportException("Cannot create file: {$filename}");
        }

        try {
            $writer = new JsonStreamWriter($stream);
            $writer->beginArray();

            foreach ($items as $item) {
                $writer->writeItem($item);
            }

            $writer->endArray();
        } finally {
            fclose($stream);
        }
    }
}
```

### Écriture avec Objets Nested

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Export;

use App\Domain\Entity\Order;
use Symfony\Component\JsonStreamer\JsonStreamWriter;
use Symfony\Component\Serializer\SerializerInterface;

final readonly class OrderExporter
{
    public function __construct(
        private SerializerInterface $serializer,
    ) {}

    /**
     * @param iterable<Order> $orders
     */
    public function exportOrders(iterable $orders, resource $stream): void
    {
        $writer = new JsonStreamWriter($stream);
        $writer->beginObject();

        $writer->writeKey('metadata');
        $writer->writeValue([
            'exported_at' => (new \DateTimeImmutable())->format(\DATE_ATOM),
            'version' => '1.0',
        ]);

        $writer->writeKey('orders');
        $writer->beginArray();

        foreach ($orders as $order) {
            $serialized = $this->serializer->normalize($order, 'json', [
                'groups' => ['export'],
            ]);
            $writer->writeItem($serialized);
        }

        $writer->endArray();
        $writer->endObject();
    }
}
```

## Streaming HTTP Response

### Controller avec Response Streaming

```php
<?php

declare(strict_types=1);

namespace App\Presentation\Controller\Api;

use App\Domain\Repository\OrderRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\StreamedJsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class OrderExportController extends AbstractController
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
    ) {}

    #[Route('/api/orders/export', name: 'api_orders_export', methods: ['GET'])]
    public function export(): StreamedJsonResponse
    {
        // StreamedJsonResponse pour gros volumes
        return new StreamedJsonResponse(
            function () {
                yield '[';

                $first = true;
                foreach ($this->orderRepository->streamAll() as $order) {
                    if (!$first) {
                        yield ',';
                    }
                    $first = false;

                    yield json_encode([
                        'id' => (string) $order->getId(),
                        'status' => $order->getStatus()->value,
                        'total' => $order->getTotal()->getAmount(),
                    ], JSON_THROW_ON_ERROR);
                }

                yield ']';
            },
            headers: [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="orders.json"',
            ],
        );
    }
}
```

## Intégration Doctrine

### Repository avec Streaming

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Domain\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;

final readonly class DoctrineOrderRepository
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    /**
     * Stream orders sans charger tous en mémoire.
     *
     * @return iterable<Order>
     */
    public function streamAll(): iterable
    {
        $query = $this->entityManager
            ->createQuery('SELECT o FROM App\Domain\Entity\Order o')
            ->toIterable();

        foreach ($query as $order) {
            yield $order;

            // Libère la mémoire après chaque entité
            $this->entityManager->detach($order);
        }
    }

    /**
     * Stream avec critères.
     *
     * @return iterable<Order>
     */
    public function streamByStatus(string $status): iterable
    {
        $query = $this->entityManager
            ->createQuery('SELECT o FROM App\Domain\Entity\Order o WHERE o.status = :status')
            ->setParameter('status', $status)
            ->toIterable();

        foreach ($query as $order) {
            yield $order;
            $this->entityManager->detach($order);
        }
    }
}
```

## Traitement par Batch

### Batch Processing avec Streaming

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\Import;

use App\Infrastructure\Import\LargeJsonImporter;
use Doctrine\ORM\EntityManagerInterface;

final readonly class BatchImportUseCase
{
    private const BATCH_SIZE = 100;

    public function __construct(
        private LargeJsonImporter $importer,
        private EntityManagerInterface $entityManager,
    ) {}

    public function execute(string $filename): ImportResult
    {
        $imported = 0;
        $failed = 0;
        $batch = [];

        foreach ($this->importer->importFromFile($filename) as $item) {
            try {
                $entity = $this->createEntity($item);
                $this->entityManager->persist($entity);
                $batch[] = $entity;
                $imported++;

                // Flush par batch pour éviter saturation mémoire
                if (count($batch) >= self::BATCH_SIZE) {
                    $this->entityManager->flush();
                    $this->clearBatch($batch);
                    $batch = [];
                }
            } catch (\Throwable $e) {
                $failed++;
            }
        }

        // Flush le reste
        if (count($batch) > 0) {
            $this->entityManager->flush();
            $this->clearBatch($batch);
        }

        return new ImportResult($imported, $failed);
    }

    private function clearBatch(array $entities): void
    {
        foreach ($entities as $entity) {
            $this->entityManager->detach($entity);
        }
    }
}
```

## Gestion des Erreurs

### Robust Streaming avec Recovery

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Import;

use Psr\Log\LoggerInterface;
use Symfony\Component\JsonStreamer\JsonStreamReader;
use Symfony\Component\JsonStreamer\Exception\StreamException;

final readonly class RobustJsonImporter
{
    public function __construct(
        private LoggerInterface $logger,
    ) {}

    /**
     * @return iterable<array<string, mixed>>
     */
    public function importWithRecovery(string $jsonPath): iterable
    {
        $stream = fopen($jsonPath, 'rb');
        $position = 0;

        try {
            $reader = new JsonStreamReader($stream);

            foreach ($reader->readItems() as $index => $item) {
                $position = ftell($stream);

                try {
                    $this->validateItem($item);
                    yield $item;
                } catch (\Throwable $e) {
                    $this->logger->warning('Invalid item at index {index}', [
                        'index' => $index,
                        'position' => $position,
                        'error' => $e->getMessage(),
                    ]);
                    // Continue avec l'élément suivant
                }
            }
        } catch (StreamException $e) {
            $this->logger->error('Stream error at position {position}', [
                'position' => $position,
                'error' => $e->getMessage(),
            ]);
            throw new ImportException('Stream corrupted', previous: $e);
        } finally {
            fclose($stream);
        }
    }

    private function validateItem(array $item): void
    {
        if (!isset($item['id'])) {
            throw new \InvalidArgumentException('Missing required field: id');
        }
    }
}
```

## Performance Tips

### 1. Utiliser les Générateurs

```php
// ✅ BON - Générateur, mémoire O(1)
public function streamLargeData(): iterable
{
    foreach ($this->reader->readItems() as $item) {
        yield $this->transform($item);
    }
}

// ❌ MAUVAIS - Tableau, mémoire O(n)
public function loadAllData(): array
{
    $result = [];
    foreach ($this->reader->readItems() as $item) {
        $result[] = $this->transform($item);
    }
    return $result;
}
```

### 2. Détacher les Entités Doctrine

```php
// ✅ BON - Détacher après traitement
foreach ($query->toIterable() as $entity) {
    yield $entity;
    $this->entityManager->detach($entity);
}

// ❌ MAUVAIS - Entités restent en mémoire
foreach ($query->getResult() as $entity) {
    yield $entity;
}
```

### 3. Buffer pour I/O

```php
// ✅ BON - Buffer pour écriture
$stream = fopen($path, 'wb');
stream_set_write_buffer($stream, 65536); // 64 KB buffer
```

## Métriques

| Scénario | Sans Streaming | Avec Streaming |
|----------|----------------|----------------|
| 100 Mo JSON | ~400 Mo RAM | ~10 Mo RAM |
| 1 Go JSON | OOM | ~10 Mo RAM |
| 10k objets/sec | N/A | Stable |

## Ressources

- [Symfony JSON Streamer Docs](https://symfony.com/doc/8.0/components/json_streamer.html)
- [PHP Generators](https://www.php.net/manual/en/language.generators.php)
- [Doctrine Batch Processing](https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/batch-processing.html)

---

**Date de dernière mise à jour:** 2026-01-29
**Version:** 1.0.0
