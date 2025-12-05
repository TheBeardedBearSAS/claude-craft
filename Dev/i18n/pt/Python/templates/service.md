# Template: Serviço de Domínio

## Quando Usar um Serviço de Domínio?

Um Serviço de Domínio contém lógica de negócio que:
- Não se encaixa naturalmente em nenhuma entidade
- Opera em múltiplas entidades
- Requer dependências externas (repositories, outros serviços)

## Template

```python
# src/myproject/domain/services/[service_name]_service.py
"""
Serviço de negócio para [descrição].

Este serviço contém lógica de negócio para [funcionalidade]
que não pode ser colocada em uma única entidade.
"""

from typing import Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]
from myproject.domain.repositories.[repository] import [Repository]
from myproject.domain.exceptions import [DomainException]


class [ServiceName]Service:
    """
    Serviço de negócio para [descrição detalhada].

    Este serviço coordena [quais operações] respeitando
    as seguintes regras de negócio:
    - [Regra de negócio 1]
    - [Regra de negócio 2]
    - [Regra de negócio 3]

    Attributes:
        _repository: Repository para acessar [entities]

    Example:
        >>> service = [ServiceName]Service(repository)
        >>> result = service.[method_name](param1, param2)
    """

    def __init__(self, repository: [Repository]) -> None:
        """
        Inicializar serviço.

        Args:
            repository: Repository para [descrição]
        """
        self._repository = repository

    def [method_name](
        self,
        param1: Type1,
        param2: Type2
    ) -> ReturnType:
        """
        [Descrição do que este método faz].

        Este método:
        1. [Passo 1]
        2. [Passo 2]
        3. [Passo 3]

        Regras de negócio aplicadas:
        - [Regra 1]
        - [Regra 2]

        Args:
            param1: Descrição do parâmetro 1
            param2: Descrição do parâmetro 2

        Returns:
            Descrição do valor de retorno

        Raises:
            [DomainException]: Se [condição]
            ValueError: Se [condição]

        Example:
            >>> service.[method_name](value1, value2)
            result_value
        """
        # 1. Validação de regras de negócio
        self._validate_[rule_name](param1, param2)

        # 2. Recuperar dados necessários
        entity = self._repository.find_by_id(param1)
        if not entity:
            raise [DomainException](f"[Entity] não encontrado: {param1}")

        # 3. Aplicar lógica de negócio
        result = self._apply_[business_logic](entity, param2)

        # 4. Persistir se necessário
        self._repository.save(entity)

        # 5. Retornar resultado
        return result
```

## Exemplo Concreto: PricingService

[Exemplo completo de serviço de precificação com regras de desconto]

## Testes Unitários

[Exemplos de teste com mocks]

## Checklist

- [ ] Nome do serviço como `[Noun]Service` (ex: PricingService, NotificationService)
- [ ] Docstring completa com Example
- [ ] Cada método público documentado
- [ ] Validação de regras de negócio
- [ ] Sem dependência de infraestrutura
- [ ] Dependências injetadas via construtor
- [ ] Métodos privados prefixados com `_`
- [ ] Exceções de negócio (DomainException)
- [ ] Testes unitários com mocks
- [ ] Cobertura > 95%
