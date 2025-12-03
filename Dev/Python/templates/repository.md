# Template: Repository Pattern

## Repository Pattern

Le pattern Repository:
- Abstrait l'accès aux données
- Sépare le domain de l'infrastructure
- Permet de changer de DB sans affecter le domain
- Facilite les tests (mocks)

## Structure

1. **Interface (Protocol)** dans `domain/repositories/`
2. **Implémentation** dans `infrastructure/database/repositories/`
3. **ORM Model** dans `infrastructure/database/models/`

## Template: Interface (Domain)

```python
# src/myproject/domain/repositories/[entity]_repository.py
"""Interface du repository pour [Entity]."""

from typing import Optional, Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]


class [Entity]Repository(Protocol):
    """
    Port (interface) pour le repository [Entity].

    Le domain définit le contrat, l'infrastructure fournit l'implémentation.
    Utilise Protocol (PEP 544) pour structural subtyping.

    Cette interface définit toutes les opérations de persistence
    pour l'entité [Entity].
    """

    def save(self, entity: [Entity]) -> [Entity]:
        """
        Sauvegarde une [entity].

        Crée une nouvelle [entity] ou met à jour une existante.

        Args:
            entity: L'[entity] à sauvegarder

        Returns:
            L'[entity] sauvegardée (avec ID généré si nouveau)

        Raises:
            RepositoryError: Si la sauvegarde échoue
        """
        ...

    def find_by_id(self, entity_id: UUID) -> Optional[[Entity]]:
        """
        Trouve une [entity] par son ID.

        Args:
            entity_id: L'ID de l'[entity]

        Returns:
            L'[entity] trouvée ou None si non trouvée
        """
        ...

    def find_all(self) -> list[[Entity]]:
        """
        Récupère toutes les [entities].

        Returns:
            Liste de toutes les [entities]
        """
        ...

    def delete(self, entity_id: UUID) -> None:
        """
        Supprime une [entity].

        Args:
            entity_id: L'ID de l'[entity] à supprimer

        Raises:
            RepositoryError: Si la suppression échoue
            [Entity]NotFoundError: Si l'[entity] n'existe pas
        """
        ...

    # Méthodes de recherche spécifiques
    def find_by_[attribute](self, [attribute]: Type) -> Optional[[Entity]]:
        """
        Trouve une [entity] par [attribute].

        Args:
            [attribute]: La valeur de [attribute]

        Returns:
            L'[entity] trouvée ou None
        """
        ...

    def find_all_by_[criteria](self, [criteria]: Type) -> list[[Entity]]:
        """
        Trouve toutes les [entities] correspondant à [criteria].

        Args:
            [criteria]: Le critère de recherche

        Returns:
            Liste des [entities] trouvées
        """
        ...

    def exists_with_[attribute](self, [attribute]: Type) -> bool:
        """
        Vérifie si une [entity] existe avec [attribute].

        Args:
            [attribute]: La valeur de [attribute]

        Returns:
            True si une [entity] existe
        """
        ...

    def count(self) -> int:
        """
        Compte le nombre total d'[entities].

        Returns:
            Le nombre d'[entities]
        """
        ...
```

## Template: Implémentation (Infrastructure)

```python
# src/myproject/infrastructure/database/repositories/[entity]_repository_impl.py
"""Implémentation du repository [Entity] avec SQLAlchemy."""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from myproject.domain.entities.[entity] import [Entity]
from myproject.domain.repositories.[entity]_repository import [Entity]Repository
from myproject.infrastructure.database.models.[entity]_model import [Entity]Model
from myproject.infrastructure.database.exceptions import (
    RepositoryError,
    [Entity]NotFoundError
)


class [Entity]RepositoryImpl:
    """
    Implémentation SQLAlchemy du [Entity]Repository.

    Cette classe adapte l'interface domain au modèle ORM SQLAlchemy.
    Elle gère:
    - La conversion Entity <-> ORM Model
    - Les transactions DB
    - La gestion des erreurs
    """

    def __init__(self, session: Session) -> None:
        """
        Initialise le repository.

        Args:
            session: Session SQLAlchemy
        """
        self._session = session

    def save(self, entity: [Entity]) -> [Entity]:
        """
        Sauvegarde une [entity].

        Args:
            entity: L'[entity] à sauvegarder

        Returns:
            L'[entity] sauvegardée

        Raises:
            RepositoryError: Si la sauvegarde échoue
        """
        try:
            # Convertir entity domain -> ORM model
            model = self._to_model(entity)

            # Merge (insert ou update selon si ID existe)
            self._session.merge(model)
            self._session.commit()

            # Refresh pour obtenir les valeurs générées par la DB
            self._session.refresh(model)

            # Convertir ORM model -> entity domain
            return self._to_entity(model)

        except SQLAlchemyError as e:
            self._session.rollback()
            raise RepositoryError(f"Failed to save [entity]: {e}") from e

    def find_by_id(self, entity_id: UUID) -> Optional[[Entity]]:
        """
        Trouve une [entity] par ID.

        Args:
            entity_id: L'ID de l'[entity]

        Returns:
            L'[entity] ou None
        """
        model = (
            self._session.query([Entity]Model)
            .filter([Entity]Model.id == entity_id)
            .first()
        )

        return self._to_entity(model) if model else None

    def find_all(self) -> list[[Entity]]:
        """
        Récupère toutes les [entities].

        Returns:
            Liste des [entities]
        """
        models = self._session.query([Entity]Model).all()
        return [self._to_entity(model) for model in models]

    def delete(self, entity_id: UUID) -> None:
        """
        Supprime une [entity].

        Args:
            entity_id: L'ID de l'[entity]

        Raises:
            RepositoryError: Si la suppression échoue
            [Entity]NotFoundError: Si non trouvée
        """
        try:
            model = (
                self._session.query([Entity]Model)
                .filter([Entity]Model.id == entity_id)
                .first()
            )

            if not model:
                raise [Entity]NotFoundError(f"[Entity] {entity_id} not found")

            self._session.delete(model)
            self._session.commit()

        except SQLAlchemyError as e:
            self._session.rollback()
            raise RepositoryError(f"Failed to delete [entity]: {e}") from e

    def find_by_[attribute](self, [attribute]: Type) -> Optional[[Entity]]:
        """Trouve par [attribute]."""
        model = (
            self._session.query([Entity]Model)
            .filter([Entity]Model.[attribute] == [attribute])
            .first()
        )

        return self._to_entity(model) if model else None

    def find_all_by_[criteria](self, [criteria]: Type) -> list[[Entity]]:
        """Trouve tous par [criteria]."""
        models = (
            self._session.query([Entity]Model)
            .filter([Entity]Model.[criteria] == [criteria])
            .all()
        )

        return [self._to_entity(model) for model in models]

    def exists_with_[attribute](self, [attribute]: Type) -> bool:
        """Vérifie existence par [attribute]."""
        count = (
            self._session.query([Entity]Model)
            .filter([Entity]Model.[attribute] == [attribute])
            .count()
        )

        return count > 0

    def count(self) -> int:
        """Compte les [entities]."""
        return self._session.query([Entity]Model).count()

    # Méthodes privées de conversion

    def _to_entity(self, model: [Entity]Model) -> [Entity]:
        """
        Convertit ORM model -> domain entity.

        Args:
            model: Le modèle ORM

        Returns:
            L'entité domain
        """
        return [Entity](
            id=model.id,
            [attribute]=model.[attribute],
            # ... autres attributs
            created_at=model.created_at,
            updated_at=model.updated_at
        )

    def _to_model(self, entity: [Entity]) -> [Entity]Model:
        """
        Convertit domain entity -> ORM model.

        Args:
            entity: L'entité domain

        Returns:
            Le modèle ORM
        """
        return [Entity]Model(
            id=entity.id,
            [attribute]=entity.[attribute],
            # ... autres attributs
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
```

## Template: ORM Model

```python
# src/myproject/infrastructure/database/models/[entity]_model.py
"""Modèle ORM pour [Entity]."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, String, Integer, Text
from sqlalchemy.dialects.postgresql import UUID

from myproject.infrastructure.database.base import Base


class [Entity]Model(Base):
    """
    Modèle ORM SQLAlchemy pour [Entity].

    Ce modèle est séparé de l'entité domain pour:
    - Éviter la pollution du domain par l'ORM
    - Permettre des schémas DB différents de l'entité
    - Faciliter les changements de DB

    Attributes:
        id: Identifiant unique
        [attribute]: Description
        created_at: Date de création
        updated_at: Date de dernière mise à jour
    """

    __tablename__ = "[entities]"  # Nom de la table (pluriel)

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Attributs
    [attribute] = Column(String(255), nullable=False)
    [another_attribute] = Column(Integer, nullable=True)
    [text_attribute] = Column(Text)
    [boolean_attribute] = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    # Index pour optimisation
    # __table_args__ = (
    #     Index('ix_[entity]_[attribute]', '[attribute]'),
    # )

    def __repr__(self) -> str:
        """Représentation string."""
        return f"<[Entity]Model(id={self.id}, [attribute]={self.[attribute]})>"
```

## Exemple Concret: UserRepository

```python
# domain/repositories/user_repository.py
from typing import Optional, Protocol
from uuid import UUID

from myproject.domain.entities.user import User
from myproject.domain.value_objects.email import Email


class UserRepository(Protocol):
    """Repository pour User."""

    def save(self, user: User) -> User: ...
    def find_by_id(self, user_id: UUID) -> Optional[User]: ...
    def find_by_email(self, email: Email) -> Optional[User]: ...
    def exists_with_email(self, email: Email) -> bool: ...
    def find_active_users(self) -> list[User]: ...
    def delete(self, user_id: UUID) -> None: ...


# infrastructure/database/repositories/user_repository_impl.py
class UserRepositoryImpl:
    """Implémentation SQLAlchemy de UserRepository."""

    def __init__(self, session: Session):
        self._session = session

    def save(self, user: User) -> User:
        model = UserModel(
            id=user.id,
            email=str(user.email),
            name=user.name,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        self._session.merge(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_entity(model)

    def find_by_email(self, email: Email) -> Optional[User]:
        model = (
            self._session.query(UserModel)
            .filter(UserModel.email == str(email))
            .first()
        )
        return self._to_entity(model) if model else None

    def find_active_users(self) -> list[User]:
        models = (
            self._session.query(UserModel)
            .filter(UserModel.is_active == True)
            .all()
        )
        return [self._to_entity(m) for m in models]

    def _to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            email=Email(model.email),
            name=model.name,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
```

## Tests

```python
# tests/unit/infrastructure/database/repositories/test_[entity]_repository.py
import pytest
from unittest.mock import Mock

from myproject.infrastructure.database.repositories.[entity]_repository_impl import (
    [Entity]RepositoryImpl
)


class Test[Entity]RepositoryImpl:
    """Tests unitaires pour [Entity]RepositoryImpl."""

    @pytest.fixture
    def mock_session(self):
        """Mock de la session SQLAlchemy."""
        return Mock()

    @pytest.fixture
    def repository(self, mock_session):
        """Fixture repository."""
        return [Entity]RepositoryImpl(mock_session)

    # Tests unitaires avec mocks


# tests/integration/database/test_[entity]_repository.py
class Test[Entity]RepositoryIntegration:
    """Tests d'intégration pour [Entity]Repository avec vraie DB."""

    def test_save_persists_to_database(self, repository, db_session):
        """Test que save persiste en DB."""
        # Arrange
        entity = [Entity](...)

        # Act
        saved = repository.save(entity)

        # Assert
        db_session.commit()
        found = repository.find_by_id(saved.id)
        assert found is not None
        assert found.[attribute] == entity.[attribute]

    def test_find_by_attribute_returns_entity(self, repository):
        """Test find_by_[attribute]."""
        # Test avec vraie DB
        pass
```

## Checklist

- [ ] Interface (Protocol) dans domain/repositories/
- [ ] Implémentation dans infrastructure/database/repositories/
- [ ] ORM Model dans infrastructure/database/models/
- [ ] Méthodes CRUD de base (save, find_by_id, find_all, delete)
- [ ] Méthodes de recherche spécifiques à l'entité
- [ ] Conversion entity <-> model dans des méthodes privées
- [ ] Gestion des erreurs avec try/catch
- [ ] Rollback en cas d'erreur
- [ ] Tests unitaires avec mocks
- [ ] Tests d'intégration avec vraie DB
- [ ] Docstrings complètes
