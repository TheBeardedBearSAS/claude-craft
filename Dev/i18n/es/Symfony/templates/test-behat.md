# Plantilla: Test BDD Behat (Behavior-Driven Development)

> **Patrón BDD** - Tests funcionales en lenguaje natural (Gherkin)
> Referencia: `.claude/rules/04-testing-tdd.md`

## ¿Qué es un test Behat?

Un test Behat:
- ✅ **Lenguaje natural** (Gherkin: Given/When/Then)
- ✅ **Legible por negocio** (Product Owner, clientes)
- ✅ **Tests end-to-end** (UI, API, BD)
- ✅ **Especificaciones ejecutables**
- ✅ **Documentación viva**

---

## Estructura de un test Behat

### 1. Feature File (`.feature`)

```gherkin
# features/[nombre_feature].feature
# language: es

Funcionalidad: [Título de la funcionalidad]
  Como [rol]
  Quiero [acción]
  Para [beneficio de negocio]

  Contexto:
    Dado [precondiciones comunes a todos los escenarios]

  Escenario: [Título del escenario nominal]
    Dado [estado inicial]
    Y [otra precondición]
    Cuando [acción disparada]
    Y [otra acción]
    Entonces [resultado esperado]
    Y [otro resultado]

  Esquema del escenario: [Título del escenario parametrizado]
    Dado [estado con <parametro>]
    Cuando [acción con <parametro>]
    Entonces [resultado con <parametro>]

    Ejemplos:
      | parametro1 | parametro2 | resultado |
      | valor1     | valor2     | esperado1 |
      | valor3     | valor4     | esperado2 |
```

### 2. Context Class (PHP)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use PHPUnit\Framework\Assert;

/**
 * Behat Context: [Feature]
 *
 * Implementa los steps Gherkin para [feature]
 */
final class [Feature]Context implements Context
{
    private EntityManagerInterface $entityManager;
    private KernelInterface $kernel;

    // Estado compartido entre steps
    private mixed $result;
    private ?\Exception $lastException = null;

    public function __construct(
        EntityManagerInterface $entityManager,
        KernelInterface $kernel
    ) {
        $this->entityManager = $entityManager;
        $this->kernel = $kernel;
    }

    /**
     * @BeforeScenario
     */
    public function setUp(): void
    {
        // Iniciar una transacción antes de cada escenario
        $this->entityManager->beginTransaction();
    }

    /**
     * @AfterScenario
     */
    public function tearDown(): void
    {
        // Rollback después de cada escenario
        if ($this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }
    }

    /**
     * @Given /patrón regex del step/
     */
    public function stepImplementation(): void
    {
        // Implementación del step
    }
}
```

---

## Configuración Behat

```yaml
# behat.yml
default:
  suites:
    default:
      contexts:
        - App\Tests\Behat\ReservationContext

  extensions:
    Behat\Symfony2Extension:
      kernel:
        bootstrap: features/bootstrap.php
        class: App\Kernel
```

```php
// features/bootstrap.php
<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (file_exists(dirname(__DIR__).'/config/bootstrap.php')) {
    require dirname(__DIR__).'/config/bootstrap.php';
} elseif (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}
```

---

## Ejecutar tests Behat

```bash
# Todos los tests
vendor/bin/behat

# Feature específica
vendor/bin/behat features/reservation.feature

# Escenario específico (por línea)
vendor/bin/behat features/reservation.feature:15

# Con tag
vendor/bin/behat --tags=@wip

# Dry-run (verificar steps)
vendor/bin/behat --dry-run

# Formato de salida
vendor/bin/behat --format=pretty
vendor/bin/behat --format=progress
```

---

## Checklist Test Behat

- [ ] Feature file en español (Gherkin)
- [ ] Escenarios legibles por el negocio
- [ ] Steps reutilizables (DRY)
- [ ] Context con rollback de transacción
- [ ] Aserciones PHPUnit en los Then
- [ ] Datos de prueba realistas
- [ ] Tags para organizar los tests (@wip, @critical, etc.)
- [ ] Documentación viva (especificaciones ejecutables)
- [ ] Rendimiento aceptable (< 5s por escenario)
- [ ] Aislamiento completo entre escenarios
