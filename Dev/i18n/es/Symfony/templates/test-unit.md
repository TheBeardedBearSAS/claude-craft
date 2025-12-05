# Plantilla: Test Unitario (PHPUnit)

> **Patrón TDD** - Tests unitarios para validar la lógica de negocio en aislamiento
> Referencia: `.claude/rules/04-testing-tdd.md`

## ¿Qué es un test unitario?

Un test unitario:
- ✅ **Prueba una unidad aislada** (clase, método)
- ✅ **Rápido** (< 10ms por test)
- ✅ **Sin dependencias externas** (BD, filesystem, HTTP)
- ✅ **Usa mocks** para las dependencias
- ✅ **Patrón AAA** (Arrange, Act, Assert)

---

## Plantilla PHPUnit 10+

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\[Namespace];

use App\[Namespace]\[ClassToTest];
use App\[Namespace]\[Dependency];
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Tests unitarios: [ClassToTest]
 *
 * Lo que se prueba:
 * - [Comportamiento 1]
 * - [Comportamiento 2]
 * - [Casos límite]
 *
 * @covers \App\[Namespace]\[ClassToTest]
 */
class [ClassToTest]Test extends TestCase
{
    private [ClassToTest] $sut; // System Under Test
    private [Dependency]|MockObject $dependencyMock;

    /**
     * Setup ejecutado antes de cada test
     */
    protected function setUp(): void
    {
        // Crear los mocks
        $this->dependencyMock = $this->createMock([Dependency]::class);

        // Crear el SUT (System Under Test)
        $this->sut = new [ClassToTest]($this->dependencyMock);
    }

    /**
     * Cleanup después de cada test (opcional)
     */
    protected function tearDown(): void
    {
        // Liberar recursos si es necesario
    }

    /**
     * @test
     * Convención de nombres: it_[comportamiento_esperado]_when_[condicion]
     */
    public function it_[comportamiento]_when_[condicion](): void
    {
        // ========================================
        // ARRANGE - Preparación de datos
        // ========================================
        $input = 'valor de prueba';

        // Configuración del mock
        $this->dependencyMock
            ->expects($this->once())
            ->method('someMethod')
            ->with($input)
            ->willReturn('resultado mockeado');

        // ========================================
        // ACT - Ejecución de la acción
        // ========================================
        $result = $this->sut->methodToTest($input);

        // ========================================
        // ASSERT - Verificación del resultado
        // ========================================
        $this->assertEquals('resultado esperado', $result);
    }

    /**
     * @test
     * @dataProvider invalidDataProvider
     */
    public function it_throws_exception_when_invalid_data($invalidData, string $expectedMessage): void
    {
        // ASSERT
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage($expectedMessage);

        // ACT
        $this->sut->methodToTest($invalidData);
    }

    /**
     * Data Provider para tests parametrizados
     *
     * @return array<string, array{0: mixed, 1: string}>
     */
    public static function invalidDataProvider(): array
    {
        return [
            'cadena vacía' => ['', 'No puede estar vacío'],
            'valor nulo' => [null, 'No puede ser nulo'],
            'número negativo' => [-5, 'Debe ser positivo'],
        ];
    }
}
```

---

## Checklist Test Unitario

- [ ] Patrón AAA (Arrange, Act, Assert)
- [ ] Nombre expresivo `it_[comportamiento]_when_[condicion]`
- [ ] Una sola responsabilidad por test
- [ ] Mocks para todas las dependencias
- [ ] Aserciones claras y precisas
- [ ] Data providers para tests parametrizados
- [ ] Cobertura > 80% del código probado
- [ ] Rápido (< 100ms para todos los tests unitarios)
- [ ] Independiente (sin orden de ejecución)
- [ ] Documentación PHPDoc si la lógica es compleja
