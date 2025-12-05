# Plantilla: Servicio (Application/Domain)

> **Patrón DDD** - Servicio que contiene lógica de negocio u orquestación
> Referencia: `.claude/rules/01-architecture-ddd.md`

## Tipos de servicios

### Servicio de Dominio
- Lógica de negocio que no pertenece a una entidad específica
- Operaciones sobre múltiples agregados
- Dominio puro (sin dependencias de infraestructura)

### Servicio de Aplicación
- Orquestación de casos de uso
- Gestión de transacciones
- Llamada a servicios de dominio
- Interacción con repositorios

---

## Plantilla PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\[Domain|Application]\Service;

use App\Domain\Entity\[Entity];
use App\Domain\Repository\[Entity]RepositoryInterface;
use App\Domain\Exception\[DomainException];
use Psr\Log\LoggerInterface;

/**
 * Servicio: [NombreServicio]
 *
 * Responsabilidad: [Descripción de la responsabilidad única]
 *
 * Casos de uso:
 * - [Caso de uso 1]
 * - [Caso de uso 2]
 *
 * @see [Enlace a documentación de negocio si aplica]
 */
final readonly class [NombreServicio]
{
    /**
     * Inyección de constructor (Symfony autowiring)
     */
    public function __construct(
        private [Entity]RepositoryInterface $[entity]Repository,
        private LoggerInterface $logger,
        // Otras dependencias...
    ) {
    }

    /**
     * [Descripción del método]
     *
     * @param array<string, mixed> $data Datos de entrada
     * @return [Entity] Entidad creada/modificada
     * @throws [DomainException] Si [condición de error]
     */
    public function [nombreMetodo](array $data): [Entity]
    {
        // 1. Validación de datos de entrada
        $this->validateData($data);

        // 2. Lógica de negocio
        $entity = $this->buildEntity($data);

        // 3. Persistencia
        $this->[entity]Repository->save($entity, true);

        // 4. Logging
        $this->logger->info('[Acción realizada]', [
            'entity_id' => $entity->getId(),
            'context' => 'additional_info',
        ]);

        // 5. Retorno
        return $entity;
    }

    /**
     * Validación de datos de negocio
     *
     * @throws [DomainException]
     */
    private function validateData(array $data): void
    {
        if (/* condición inválida */) {
            throw new [DomainException]('Mensaje de error de negocio');
        }
    }

    /**
     * Construcción de la entidad
     */
    private function buildEntity(array $data): [Entity]
    {
        $entity = new [Entity]();
        // Hidratación...
        return $entity;
    }
}
```

---

## Checklist de Servicio

- [ ] Clase `final readonly`
- [ ] Inyección de constructor únicamente
- [ ] Una sola responsabilidad (SRP)
- [ ] Sin lógica de negocio en el constructor
- [ ] Métodos públicos documentados (PHPDoc)
- [ ] Gestión de excepciones de negocio
- [ ] Logging de operaciones importantes
- [ ] Transacciones para garantizar coherencia
- [ ] Tests unitarios + integración (>80% cobertura)
- [ ] Dependencias inyectadas vía interfaces (DIP)
