# Plantilla: Test de Integración (PHPUnit)

> **Patrón TDD** - Tests de integración para validar la interacción entre componentes
> Referencia: `.claude/rules/04-testing-tdd.md`

## ¿Qué es un test de integración?

Un test de integración:
- ✅ **Prueba la interacción** entre varios componentes
- ✅ **Usa la infraestructura real** (BD, Symfony Kernel)
- ✅ **Más lento** que los tests unitarios (< 1s por test)
- ✅ **Transacciones automáticas** (rollback después de cada test)
- ✅ **Fixtures de datos** para setup

---

## Plantilla PHPUnit 10+ (Symfony WebTestCase)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Integration\[Namespace];

use App\Entity\[Entity];
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tests de integración: [Feature]
 *
 * Lo que se prueba:
 * - [Interacción componente 1 + componente 2]
 * - [Persistencia en base de datos]
 * - [Workflow completo]
 *
 * @group integration
 */
class [Feature]IntegrationTest extends WebTestCase
{
    private ?EntityManagerInterface $entityManager;

    /**
     * Setup ejecutado antes de cada test
     */
    protected function setUp(): void
    {
        // Iniciar el kernel de Symfony
        self::bootKernel();

        // Obtener el EntityManager
        $this->entityManager = self::getContainer()
            ->get('doctrine')
            ->getManager();

        // Iniciar una transacción (auto-rollback)
        $this->entityManager->beginTransaction();
    }

    /**
     * Cleanup después de cada test
     */
    protected function tearDown(): void
    {
        // Rollback automático de la transacción
        if ($this->entityManager && $this->entityManager->getConnection()->isTransactionActive()) {
            $this->entityManager->rollback();
        }

        // Cerrar el EntityManager
        if ($this->entityManager) {
            $this->entityManager->close();
            $this->entityManager = null;
        }

        parent::tearDown();
    }

    /**
     * @test
     */
    public function it_[comportamiento]_with_real_database(): void
    {
        // ========================================
        // ARRANGE - Fixtures
        // ========================================
        $entity = new [Entity]();
        // Configuración...

        $this->entityManager->persist($entity);
        $this->entityManager->flush();

        // ========================================
        // ACT - Ejecución
        // ========================================
        $result = $this->entityManager
            ->getRepository([Entity]::class)
            ->find($entity->getId());

        // ========================================
        // ASSERT - Verificación
        // ========================================
        $this->assertNotNull($result);
        $this->assertEquals($entity->getId(), $result->getId());
    }
}
```

---

## Checklist Test de Integración

- [ ] Extiende `WebTestCase` o `KernelTestCase`
- [ ] Transacción en `setUp()` + rollback en `tearDown()`
- [ ] Fixtures de datos claras
- [ ] Prueba la interacción entre componentes
- [ ] Verifica la persistencia en BD
- [ ] Prueba los casos de error (restricciones BD, etc.)
- [ ] Aserciones sobre emails enviados (si aplica)
- [ ] Rendimiento aceptable (< 1s por test)
- [ ] Limpieza completa en `tearDown()`
- [ ] Grupo `@group integration` para aislamiento
