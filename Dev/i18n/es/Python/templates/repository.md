# Template: Patrón Repository

## Patrón Repository

El patrón Repository:
- Abstrae el acceso a datos
- Separa el dominio de la infraestructura
- Permite cambiar BD sin afectar el dominio
- Facilita las pruebas (mocks)

## Estructura

1. **Interfaz (Protocol)** en `domain/repositories/`
2. **Implementación** en `infrastructure/database/repositories/`
3. **Modelo ORM** en `infrastructure/database/models/`

## Template: Interfaz (Dominio)

```python
# src/myproject/domain/repositories/[entity]_repository.py
"""Interfaz para repositorio de [Entity]."""

from typing import Optional, Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]


class [Entity]Repository(Protocol):
    """
    Port (interfaz) para repositorio de [Entity].

    El dominio define el contrato, la infraestructura proporciona la implementación.
    Usa Protocol (PEP 544) para tipado estructural.

    Esta interfaz define todas las operaciones de persistencia
    para la entidad [Entity].
    """

    def save(self, entity: [Entity]) -> [Entity]:
        """
        Guarda un [entity].

        Crea nuevo [entity] o actualiza existente.

        Args:
            entity: El [entity] a guardar

        Returns:
            [Entity] guardado (con ID generado si es nuevo)

        Raises:
            RepositoryError: Si el guardado falla
        """
        ...

    def find_by_id(self, entity_id: UUID) -> Optional[[Entity]]:
        """
        Encuentra [entity] por ID.

        Args:
            entity_id: El ID del [entity]

        Returns:
            [Entity] encontrado o None si no se encuentra
        """
        ...

    def find_all(self) -> list[[Entity]]:
        """
        Recupera todos los [entities].

        Returns:
            Lista de todos los [entities]
        """
        ...

    def delete(self, entity_id: UUID) -> None:
        """
        Elimina [entity].

        Args:
            entity_id: El ID del [entity] a eliminar

        Raises:
            RepositoryError: Si la eliminación falla
            [Entity]NotFoundError: Si el [entity] no existe
        """
        ...
```

## Template: Implementación (Infraestructura)

[Implementación completa de repositorio con SQLAlchemy]

## Template: Modelo ORM

[Modelo SQLAlchemy con columnas apropiadas, índices, timestamps]

## Ejemplo Concreto: UserRepository

[Ejemplo completo funcional con entidad User]

## Pruebas

[Ejemplos de pruebas unitarias y de integración]

## Lista de Verificación

- [ ] Interfaz (Protocol) en domain/repositories/
- [ ] Implementación en infrastructure/database/repositories/
- [ ] Modelo ORM en infrastructure/database/models/
- [ ] Métodos CRUD base (save, find_by_id, find_all, delete)
- [ ] Métodos de búsqueda específicos de entidad
- [ ] Conversión Entity <-> model en métodos privados
- [ ] Manejo de errores con try/catch
- [ ] Rollback en error
- [ ] Pruebas unitarias con mocks
- [ ] Pruebas de integración con BD real
- [ ] Docstrings completos
