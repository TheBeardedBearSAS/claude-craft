---
description: Génération Endpoint FastAPI
argument-hint: [arguments]
---

# Génération Endpoint FastAPI

Tu es un développeur Python senior. Tu dois générer un endpoint FastAPI complet avec validation Pydantic, gestion d'erreurs et tests.

## Arguments
$ARGUMENTS

Arguments :
- Nom de la ressource (ex: `user`, `product`, `order`)
- (Optionnel) Type (crud, list, detail, action)

Exemple : `/python:generate-endpoint user crud`

## MISSION

### Étape 1 : Structure de l'Endpoint

```
app/
├── api/
│   └── v1/
│       └── endpoints/
│           └── {resource}.py
├── schemas/
│   └── {resource}.py
├── crud/
│   └── {resource}.py
├── models/
│   └── {resource}.py
└── tests/
    └── api/
        └── v1/
            └── test_{resource}.py
```

### Étape 2 : Modèle SQLAlchemy

```python
# app/models/{resource}.py
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base_class import Base


class {Resource}(Base):
    __tablename__ = "{resource}s"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<{Resource}(id={self.id}, name={self.name})>"
```

### Étape 3 : Schémas Pydantic

```python
# app/schemas/{resource}.py
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class {Resource}Base(BaseModel):
    """Schéma de base pour {Resource}."""
    name: str = Field(..., min_length=1, max_length=255, description="Nom de la ressource")
    description: Optional[str] = Field(None, description="Description optionnelle")
    is_active: bool = Field(True, description="Statut actif/inactif")


class {Resource}Create({Resource}Base):
    """Schéma pour la création."""
    pass


class {Resource}Update(BaseModel):
    """Schéma pour la mise à jour (tous les champs optionnels)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class {Resource}InDB({Resource}Base):
    """Schéma pour la lecture depuis la DB."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class {Resource}Response({Resource}InDB):
    """Schéma de réponse API."""
    pass


class {Resource}List(BaseModel):
    """Schéma pour la liste paginée."""
    items: list[{Resource}Response]
    total: int
    page: int
    size: int
    pages: int
```

### Étape 4 : CRUD Operations

```python
# app/crud/{resource}.py
from typing import Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.{resource} import {Resource}
from app.schemas.{resource} import {Resource}Create, {Resource}Update


class CRUD{Resource}(CRUDBase[{Resource}, {Resource}Create, {Resource}Update]):
    """CRUD operations pour {Resource}."""

    async def get_by_name(
        self, db: AsyncSession, *, name: str
    ) -> Optional[{Resource}]:
        """Récupère par nom."""
        result = await db.execute(
            select({Resource}).where({Resource}.name == name)
        )
        return result.scalar_one_or_none()

    async def get_active(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> list[{Resource}]:
        """Récupère uniquement les actifs."""
        result = await db.execute(
            select({Resource})
            .where({Resource}.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_multi_paginated(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        size: int = 20,
        is_active: Optional[bool] = None,
    ) -> tuple[list[{Resource}], int]:
        """Récupère avec pagination."""
        query = select({Resource})
        count_query = select(func.count()).select_from({Resource})

        if is_active is not None:
            query = query.where({Resource}.is_active == is_active)
            count_query = count_query.where({Resource}.is_active == is_active)

        # Count total
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Get items
        result = await db.execute(
            query.offset((page - 1) * size).limit(size)
        )
        items = list(result.scalars().all())

        return items, total


{resource} = CRUD{Resource}({Resource})
```

### Étape 5 : Endpoint FastAPI

```python
# app/api/v1/endpoints/{resource}.py
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.crud.{resource} import {resource} as crud_{resource}
from app.models.user import User
from app.schemas.{resource} import (
    {Resource}Create,
    {Resource}Update,
    {Resource}Response,
    {Resource}List,
)

router = APIRouter()


@router.get("/", response_model={Resource}List, summary="Liste les {resource}s")
async def list_{resource}s(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1, description="Numéro de page"),
    size: int = Query(20, ge=1, le=100, description="Taille de page"),
    is_active: Optional[bool] = Query(None, description="Filtrer par statut"),
    current_user: User = Depends(get_current_user),
) -> {Resource}List:
    """
    Récupère la liste paginée des {resource}s.

    - **page**: Numéro de page (défaut: 1)
    - **size**: Nombre d'éléments par page (défaut: 20, max: 100)
    - **is_active**: Filtrer par statut actif/inactif
    """
    items, total = await crud_{resource}.get_multi_paginated(
        db, page=page, size=size, is_active=is_active
    )
    pages = (total + size - 1) // size

    return {Resource}List(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.post(
    "/",
    response_model={Resource}Response,
    status_code=status.HTTP_201_CREATED,
    summary="Crée un {resource}",
)
async def create_{resource}(
    *,
    db: AsyncSession = Depends(get_db),
    {resource}_in: {Resource}Create,
    current_user: User = Depends(get_current_user),
) -> {Resource}Response:
    """
    Crée un nouveau {resource}.
    """
    # Vérifier unicité si nécessaire
    existing = await crud_{resource}.get_by_name(db, name={resource}_in.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un {resource} avec ce nom existe déjà",
        )

    {resource} = await crud_{resource}.create(db, obj_in={resource}_in)
    return {resource}


@router.get("/{id}", response_model={Resource}Response, summary="Récupère un {resource}")
async def get_{resource}(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> {Resource}Response:
    """
    Récupère un {resource} par son ID.
    """
    {resource} = await crud_{resource}.get(db, id=id)
    if not {resource}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{Resource} non trouvé",
        )
    return {resource}


@router.patch("/{id}", response_model={Resource}Response, summary="Met à jour un {resource}")
async def update_{resource}(
    id: UUID,
    *,
    db: AsyncSession = Depends(get_db),
    {resource}_in: {Resource}Update,
    current_user: User = Depends(get_current_user),
) -> {Resource}Response:
    """
    Met à jour un {resource} existant.
    """
    {resource} = await crud_{resource}.get(db, id=id)
    if not {resource}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{Resource} non trouvé",
        )

    # Vérifier unicité du nom si modifié
    if {resource}_in.name and {resource}_in.name != {resource}.name:
        existing = await crud_{resource}.get_by_name(db, name={resource}_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un {resource} avec ce nom existe déjà",
            )

    {resource} = await crud_{resource}.update(db, db_obj={resource}, obj_in={resource}_in)
    return {resource}


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprime un {resource}")
async def delete_{resource}(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Supprime un {resource}.
    """
    {resource} = await crud_{resource}.get(db, id=id)
    if not {resource}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{Resource} non trouvé",
        )

    await crud_{resource}.remove(db, id=id)
```

### Étape 6 : Tests

```python
# app/tests/api/v1/test_{resource}.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.tests.utils.{resource} import create_random_{resource}


@pytest.mark.asyncio
class Test{Resource}Endpoints:
    """Tests pour les endpoints {resource}."""

    async def test_create_{resource}(
        self,
        client: AsyncClient,
        db: AsyncSession,
        auth_headers: dict,
    ):
        """Test création d'un {resource}."""
        data = {
            "name": "Test {Resource}",
            "description": "Description test",
            "is_active": True,
        }
        response = await client.post(
            "/api/v1/{resource}s/",
            json=data,
            headers=auth_headers,
        )
        assert response.status_code == 201
        content = response.json()
        assert content["name"] == data["name"]
        assert "id" in content

    async def test_create_{resource}_duplicate_name(
        self,
        client: AsyncClient,
        db: AsyncSession,
        auth_headers: dict,
    ):
        """Test création avec nom dupliqué."""
        {resource} = await create_random_{resource}(db)
        data = {"name": {resource}.name}
        response = await client.post(
            "/api/v1/{resource}s/",
            json=data,
            headers=auth_headers,
        )
        assert response.status_code == 400

    async def test_get_{resource}(
        self,
        client: AsyncClient,
        db: AsyncSession,
        auth_headers: dict,
    ):
        """Test récupération d'un {resource}."""
        {resource} = await create_random_{resource}(db)
        response = await client.get(
            f"/api/v1/{resource}s/{{resource}.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        content = response.json()
        assert content["id"] == str({resource}.id)

    async def test_get_{resource}_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test récupération d'un {resource} inexistant."""
        response = await client.get(
            "/api/v1/{resource}s/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert response.status_code == 404

    async def test_list_{resource}s(
        self,
        client: AsyncClient,
        db: AsyncSession,
        auth_headers: dict,
    ):
        """Test liste des {resource}s."""
        # Créer plusieurs {resource}s
        for _ in range(5):
            await create_random_{resource}(db)

        response = await client.get(
            "/api/v1/{resource}s/",
            headers=auth_headers,
        )
        assert response.status_code == 200
        content = response.json()
        assert "items" in content
        assert "total" in content
        assert len(content["items"]) >= 5

    async def test_list_{resource}s_pagination(
        self,
        client: AsyncClient,
        db: AsyncSession,
        auth_headers: dict,
    ):
        """Test pagination."""
        response = await client.get(
            "/api/v1/{resource}s/?page=1&size=2",
            headers=auth_headers,
        )
        assert response.status_code == 200
        content = response.json()
        assert content["page"] == 1
        assert content["size"] == 2
        assert len(content["items"]) <= 2

    async def test_update_{resource}(
        self,
        client: AsyncClient,
        db: AsyncSession,
        auth_headers: dict,
    ):
        """Test mise à jour d'un {resource}."""
        {resource} = await create_random_{resource}(db)
        data = {"name": "Updated Name"}
        response = await client.patch(
            f"/api/v1/{resource}s/{{resource}.id}",
            json=data,
            headers=auth_headers,
        )
        assert response.status_code == 200
        content = response.json()
        assert content["name"] == "Updated Name"

    async def test_delete_{resource}(
        self,
        client: AsyncClient,
        db: AsyncSession,
        auth_headers: dict,
    ):
        """Test suppression d'un {resource}."""
        {resource} = await create_random_{resource}(db)
        response = await client.delete(
            f"/api/v1/{resource}s/{{resource}.id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

        # Vérifier suppression
        response = await client.get(
            f"/api/v1/{resource}s/{{resource}.id}",
            headers=auth_headers,
        )
        assert response.status_code == 404
```

### Étape 7 : Enregistrement du Router

```python
# app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import {resource}

api_router = APIRouter()

api_router.include_router(
    {resource}.router,
    prefix="/{resource}s",
    tags=["{resource}s"],
)
```

### Résumé

```
══════════════════════════════════════════════════════════════
✅ ENDPOINT GÉNÉRÉ - {resource}
══════════════════════════════════════════════════════════════

📁 Fichiers créés :
- app/models/{resource}.py
- app/schemas/{resource}.py
- app/crud/{resource}.py
- app/api/v1/endpoints/{resource}.py
- app/tests/api/v1/test_{resource}.py

🔗 Endpoints disponibles :
- GET    /api/v1/{resource}s/     - Liste paginée
- POST   /api/v1/{resource}s/     - Création
- GET    /api/v1/{resource}s/{id} - Détail
- PATCH  /api/v1/{resource}s/{id} - Mise à jour
- DELETE /api/v1/{resource}s/{id} - Suppression

🔧 Prochaines étapes :
1. Ajouter le router dans app/api/v1/api.py
2. Créer la migration Alembic
3. Lancer les tests : pytest app/tests/api/v1/test_{resource}.py
```
