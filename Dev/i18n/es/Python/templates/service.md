# Template: Servicio de Dominio

## ¿Cuándo Usar un Servicio de Dominio?

Un Servicio de Dominio contiene lógica de negocio que:
- No encaja naturalmente en ninguna entidad
- Opera sobre múltiples entidades
- Requiere dependencias externas (repositorios, otros servicios)

## Template

```python
# src/myproject/domain/services/[service_name]_service.py
"""
Servicio de negocio para [descripción].

Este servicio contiene lógica de negocio para [funcionalidad]
que no puede colocarse en una sola entidad.
"""

from typing import Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]
from myproject.domain.repositories.[repository] import [Repository]
from myproject.domain.exceptions import [DomainException]


class [ServiceName]Service:
    """
    Servicio de negocio para [descripción detallada].

    Este servicio coordina [qué operaciones] respetando
    las siguientes reglas de negocio:
    - [Regla de negocio 1]
    - [Regla de negocio 2]
    - [Regla de negocio 3]

    Attributes:
        _repository: Repositorio para acceder a [entities]

    Example:
        >>> service = [ServiceName]Service(repository)
        >>> result = service.[method_name](param1, param2)
    """

    def __init__(self, repository: [Repository]) -> None:
        """
        Inicializa el servicio.

        Args:
            repository: Repositorio para [descripción]
        """
        self._repository = repository

    def [method_name](
        self,
        param1: Type1,
        param2: Type2
    ) -> ReturnType:
        """
        [Descripción de lo que hace este método].

        Este método:
        1. [Paso 1]
        2. [Paso 2]
        3. [Paso 3]

        Reglas de negocio aplicadas:
        - [Regla 1]
        - [Regla 2]

        Args:
            param1: Descripción del parámetro 1
            param2: Descripción del parámetro 2

        Returns:
            Descripción del valor de retorno

        Raises:
            [DomainException]: Si [condición]
            ValueError: Si [condición]

        Example:
            >>> service.[method_name](value1, value2)
            result_value
        """
        # 1. Validación de reglas de negocio
        self._validate_[rule_name](param1, param2)

        # 2. Recuperar datos necesarios
        entity = self._repository.find_by_id(param1)
        if not entity:
            raise [DomainException](f"[Entity] no encontrado: {param1}")

        # 3. Aplicar lógica de negocio
        result = self._apply_[business_logic](entity, param2)

        # 4. Persistir si es necesario
        self._repository.save(entity)

        # 5. Retornar resultado
        return result
```

## Ejemplo Concreto: PricingService

[Ejemplo completo de servicio de precios con reglas de descuento]

## Pruebas Unitarias

[Ejemplos de pruebas con mocks]

## Lista de Verificación

- [ ] Nombre del servicio como `[Noun]Service` (ej: PricingService, NotificationService)
- [ ] Docstring completo con Example
- [ ] Cada método público documentado
- [ ] Validación de reglas de negocio
- [ ] Sin dependencia de infraestructura
- [ ] Dependencias inyectadas vía constructor
- [ ] Métodos privados con prefijo `_`
- [ ] Excepciones de negocio (DomainException)
- [ ] Pruebas unitarias con mocks
- [ ] Cobertura > 95%
