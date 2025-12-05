# Template: Padrão Repository

## Padrão Repository

O padrão Repository:
- Abstrai o acesso a dados
- Separa domínio da infraestrutura
- Permite mudar BD sem afetar domínio
- Facilita testes (mocks)

## Estrutura

1. **Interface (Protocol)** em `domain/repositories/`
2. **Implementação** em `infrastructure/database/repositories/`
3. **Modelo ORM** em `infrastructure/database/models/`

## Template: Interface (Domínio)

```python
# src/myproject/domain/repositories/[entity]_repository.py
"""Interface para repository de [Entity]."""

from typing import Optional, Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]


class [Entity]Repository(Protocol):
    """
    Porta (interface) para repository de [Entity].

    O domínio define o contrato, infraestrutura fornece implementação.
    Usa Protocol (PEP 544) para subtipagem estrutural.

    Esta interface define todas as operações de persistência
    para a entidade [Entity].
    """

    def save(self, entity: [Entity]) -> [Entity]:
        """
        Salvar um [entity].

        Cria novo [entity] ou atualiza existente.

        Args:
            entity: O [entity] a salvar

        Returns:
            [Entity] salvo (com ID gerado se novo)

        Raises:
            RepositoryError: Se salvamento falhar
        """
        ...

    def find_by_id(self, entity_id: UUID) -> Optional[[Entity]]:
        """
        Encontrar [entity] por ID.

        Args:
            entity_id: O ID do [entity]

        Returns:
            [Entity] encontrado ou None se não encontrado
        """
        ...

    def find_all(self) -> list[[Entity]]:
        """
        Recuperar todos os [entities].

        Returns:
            Lista de todos os [entities]
        """
        ...

    def delete(self, entity_id: UUID) -> None:
        """
        Deletar [entity].

        Args:
            entity_id: O ID do [entity] a deletar

        Raises:
            RepositoryError: Se deleção falhar
            [Entity]NotFoundError: Se [entity] não existir
        """
        ...
```

## Template: Implementação (Infraestrutura)

[Implementação completa de repository com SQLAlchemy]

## Template: Modelo ORM

[Modelo SQLAlchemy com colunas apropriadas, índices, timestamps]

## Exemplo Concreto: UserRepository

[Exemplo completo funcionando com entidade User]

## Testes

[Exemplos de testes unitários e de integração]

## Checklist

- [ ] Interface (Protocol) em domain/repositories/
- [ ] Implementação em infrastructure/database/repositories/
- [ ] Modelo ORM em infrastructure/database/models/
- [ ] Métodos CRUD base (save, find_by_id, find_all, delete)
- [ ] Métodos de busca específicos da entidade
- [ ] Conversão Entidade <-> modelo em métodos privados
- [ ] Tratamento de erros com try/catch
- [ ] Rollback em caso de erro
- [ ] Testes unitários com mocks
- [ ] Testes de integração com BD real
- [ ] Docstrings completas
