# Template: Middleware / Interceptor

> **Pattern** - Middleware/Interceptor pour intercepter et modifier les requêtes/réponses
> Référence: `.claude/rules/04-solid-principles.md`, `.claude/rules/11-security.md`

## Principe

Le middleware intercepte les requêtes HTTP/messages pour ajouter des comportements transversaux (auth, logging, validation, etc.).

---

## Template Express.js (Node.js)

```typescript
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

/**
 * Middleware: [NomMiddleware]
 *
 * Responsabilité: [Description de la responsabilité unique]
 *
 * Use cases:
 * - [Use case 1]
 * - [Use case 2]
 */
export const [nomMiddleware] = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. Validation/vérification
    if (/* condition invalide */) {
      res.status(400).json({ error: 'Message d\'erreur' });
      return;
    }

    // 2. Logique du middleware
    // Modifier req/res si nécessaire
    req.customData = { ... };

    // 3. Passer au handler suivant
    next();
  } catch (error) {
    Logger.error('[NomMiddleware] error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Exemple: AuthMiddleware

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## Template Symfony (EventSubscriber)

```php
<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Psr\Log\LoggerInterface;

/**
 * Subscriber: [NomSubscriber]
 *
 * Responsabilité: [Description de la responsabilité unique]
 *
 * Use cases:
 * - [Use case 1]
 * - [Use case 2]
 */
final readonly class [NomSubscriber] implements EventSubscriberInterface
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 10],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        // Logique du middleware
        // ...

        $this->logger->info('[Action effectuée]', [
            'route' => $request->attributes->get('_route'),
        ]);
    }
}
```

### Exemple: TenantMiddleware

```php
<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use App\Service\TenantResolver;
use Doctrine\DBAL\Connection;

final readonly class TenantMiddleware implements EventSubscriberInterface
{
    public function __construct(
        private TenantResolver $tenantResolver,
        private Connection $connection,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 20],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $tenantId = $this->tenantResolver->resolve($event->getRequest());
        
        // Switch DB schema
        $this->connection->executeStatement(
            "SET search_path TO tenant_{$tenantId}"
        );
    }
}
```
