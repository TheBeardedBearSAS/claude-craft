# JSON Streamer + JsonPath Components - Symfony 7.3+

## Overview

Symfony introduit deux composants complémentaires pour le traitement JSON haute performance
(JSON Streamer disponible depuis **7.3**, stabilisé et amélioré en **8.0/8.1**) :

1. **JSON Streamer Component** : streaming de données JSON volumineuses sans charger l'intégralité en mémoire
2. **JsonPath Component** : navigation et requêtes JSON via expressions (RFC 9535)

**Cas d'usage:**
- Import/export de fichiers JSON volumineux (> 100 Mo)
- APIs paginées avec streaming
- Traitement de logs JSON
- ETL pipelines
- Extraction sélective de données JSON complexes

**Sources:**
- https://symfony.com/blog/new-in-symfony-8-0-jsonstreamer-component
- https://symfony.com/blog/new-in-symfony-8-0-jsonpath-component

## Installation

```bash
# JSON Streamer
composer require symfony/json-streamer

# JsonPath
composer require symfony/json-path
```

> **Pattern d'injection recommandé :** ne pas instancier `JsonStreamReader`/`JsonStreamWriter` directement. Injecter `StreamReaderInterface` (service id `json_streamer.stream_reader`) et `StreamWriterInterface` (`json_streamer.stream_writer`) par autowiring. Symfony résout automatiquement l'implémentation.

**Source:** [Symfony Docs — Streaming JSON](https://symfony.com/doc/current/serializer/streaming_json.html)

---

## JsonPath Component

### Sélection de Données JSON

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\DataAccess;

use Symfony\Component\JsonPath\JsonPath;

final readonly class JsonDataExtractor
{
    /**
     * Extrait les livres dont le prix est inférieur à 10€.
     *
     * Expression JsonPath RFC 9535: $.store.book[?@.price<10]
     */
    public function extractCheapBooks(string $jsonData): array
    {
        return JsonPath::select($jsonData, '$.store.book[?@.price<10]');
    }

    /**
     * Récupère tous les auteurs du catalogue.
     */
    public function getAllAuthors(string $jsonData): array
    {
        return JsonPath::select($jsonData, '$.store.book[*].author');
    }

    /**
     * Filtre les produits en stock uniquement.
     */
    public function getInStockProducts(string $jsonData): array
    {
        return JsonPath::select($jsonData, '$.products[?@.stock>0]');
    }
}
```

### Requêtes Complexes

```php
<?php

declare(strict_types=1);

namespace App\Application\Query;

use Symfony\Component\JsonPath\JsonPath;

final readonly class JsonQueryService
{
    /**
     * Extrait les commandes d'un utilisateur spécifique avec montant > 100€.
     */
    public function findHighValueOrders(string $jsonOrders, string $userId): array
    {
        return JsonPath::select(
            $jsonOrders,
            sprintf('$.orders[?@.userId=="%s" && @.total>100]', $userId)
        );
    }

    /**
     * Récupère les logs d'erreur des 24 dernières heures.
     */
    public function getRecentErrors(string $jsonLogs, int $timestamp): array
    {
        return JsonPath::select(
            $jsonLogs,
            sprintf('$.logs[?@.level=="error" && @.timestamp>%d]', $timestamp)
        );
    }
}
```

### Intégration avec Streaming

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Import;

use Symfony\Component\JsonPath\JsonPath;
use Symfony\Component\JsonStreamer\Read\StreamReaderInterface;

final readonly class SelectiveJsonImporter
{
    public function __construct(
        private StreamReaderInterface $streamReader,
    ) {}

    /**
     * Streame uniquement les éléments qui matchent un critère JsonPath.
     */
    public function streamFiltered(string $jsonPath, string $expression): iterable
    {
        $stream = fopen($jsonPath, 'rb');

        try {
            foreach ($this->streamReader->read($stream) as $item) {
                // Applique le filtre JsonPath sur chaque item
                $itemJson = json_encode($item, JSON_THROW_ON_ERROR);
                $matches = JsonPath::select($itemJson, $expression);

                if (count($matches) > 0) {
                    yield $item;
                }
            }
        } finally {
            fclose($stream);
        }
    }
}
```

---

## JSON Streamer Component

## Lecture Streaming

### JsonStreamReader - Lecture élément par élément

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Import;

use Symfony\Component\JsonStreamer\Read\StreamReaderInterface;

final readonly class LargeJsonImporter
{
    public function __construct(
        private StreamReaderInterface $streamReader,
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
            // Stream chaque élément du tableau JSON
            foreach ($this->streamReader->read($stream) as $item) {
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
use Symfony\Component\JsonStreamer\Read\StreamReaderInterface;
use Symfony\Component\Serializer\SerializerInterface;

final readonly class ProductStreamImporter
{
    public function __construct(
        private StreamReaderInterface $streamReader,
        private SerializerInterface $serializer,
    ) {}

    /**
     * @return iterable<ProductImportDto>
     */
    public function streamProducts(string $jsonPath): iterable
    {
        $stream = fopen($jsonPath, 'rb');

        try {
            foreach ($this->streamReader->read($stream) as $rawItem) {
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

use Symfony\Component\JsonStreamer\Write\StreamWriterInterface;

final readonly class LargeJsonExporter
{
    public function __construct(
        private StreamWriterInterface $streamWriter,
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
            $this->streamWriter->write($items, $stream);
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
use Symfony\Component\JsonStreamer\Write\StreamWriterInterface;
use Symfony\Component\Serializer\SerializerInterface;

final readonly class OrderExporter
{
    public function __construct(
        private StreamWriterInterface $streamWriter,
        private SerializerInterface $serializer,
    ) {}

    /**
     * Exporte les commandes en streaming avec métadonnées.
     * Utilise le serializer pour normaliser chaque Order avant écriture.
     *
     * @param iterable<Order> $orders
     */
    public function exportOrders(iterable $orders, mixed $stream): void
    {
        $payload = (function () use ($orders): iterable {
            yield ['metadata' => [
                'exported_at' => (new \DateTimeImmutable())->format(\DATE_ATOM),
                'version' => '1.0',
            ]];

            foreach ($orders as $order) {
                yield $this->serializer->normalize($order, 'json', [
                    'groups' => ['export'],
                ]);
            }
        })();

        $this->streamWriter->write($payload, $stream);
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
use Symfony\Component\JsonStreamer\Read\StreamReaderInterface;
use Symfony\Component\JsonStreamer\Exception\StreamException;

final readonly class RobustJsonImporter
{
    public function __construct(
        private StreamReaderInterface $streamReader,
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
            foreach ($this->streamReader->read($stream) as $index => $item) {
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

## Améliorations Symfony 8.1

> **Source:** [New in Symfony 8.1: Improved JSON Streaming and Querying](https://symfony.com/blog/new-in-symfony-8-1-improved-json-streaming-and-querying)

- Support natif des **Value Objects génériques** (mécanisme `ValueObjectInterface`)
- **DateInterval** et **DateTimeZone** supportés nativement comme value objects dans les streams
- `StreamReaderInterface` et `StreamWriterInterface` stables (non-expérimental depuis Symfony 7.4)
- Meilleure intégration avec le composant **ObjectMapper** pour le mapping typé

## Ressources

- [Symfony JSON Streamer Blog](https://symfony.com/blog/new-in-symfony-8-0-jsonstreamer-component)
- [Symfony Streaming JSON Docs](https://symfony.com/doc/current/serializer/streaming_json.html)
- [Symfony 8.1 Improved JSON Streaming](https://symfony.com/blog/new-in-symfony-8-1-improved-json-streaming-and-querying)
- [Symfony JsonPath Blog](https://symfony.com/blog/new-in-symfony-8-0-jsonpath-component)
- [RFC 9535 - JsonPath](https://www.rfc-editor.org/rfc/rfc9535.html)
- [PHP Generators](https://www.php.net/manual/en/language.generators.php)
- [Doctrine Batch Processing](https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/batch-processing.html)

---

**Date de dernière mise à jour:** 2026-06-08
**Version:** 1.2.0
