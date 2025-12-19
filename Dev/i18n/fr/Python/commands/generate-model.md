---
description: Génération Model SQLAlchemy
argument-hint: [arguments]
---

# Génération Model SQLAlchemy

Tu es un développeur Python senior. Tu dois générer un model SQLAlchemy complet avec relations, validations et migration Alembic.

## Arguments
$ARGUMENTS

Arguments :
- Nom du model (ex: `User`, `Product`, `Order`)
- (Optionnel) Champs au format field:type (ex: `name:str email:str:unique`)

Exemple : `/python:generate-model Product name:str price:decimal category_id:uuid:fk`

## MISSION

### Étape 1 : Analyser les Besoins

Identifier :
- Nom du model et de la table
- Champs et leurs types
- Relations (ForeignKey, OneToMany, ManyToMany)
- Index et contraintes
- Validations

### Étape 2 : Model SQLAlchemy 2.0

```python
# app/models/{model}.py
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.order_item import OrderItem


class {Model}(Base):
    """
    Model {Model}.

    Représente {description}.

    Attributes:
        id: Identifiant unique UUID
        name: Nom du {model}
        description: Description optionnelle
        price: Prix du {model}
        is_active: Statut actif/inactif
        category_id: ID de la catégorie parente
        created_at: Date de création
        updated_at: Date de dernière modification
    """
    __tablename__ = "{model}s"

    # Contraintes de table
    __table_args__ = (
        UniqueConstraint("name", "category_id", name="uq_{model}_name_category"),
        CheckConstraint("price >= 0", name="ck_{model}_price_positive"),
        Index("ix_{model}s_category_active", "category_id", "is_active"),
    )

    # Colonnes
    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    slug: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0.00"),
    )
    quantity: Mapped[int] = mapped_column(
        default=0,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        index=True,
    )

    # Foreign Keys
    category_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relations
    category: Mapped[Optional["Category"]] = relationship(
        "Category",
        back_populates="{model}s",
        lazy="selectin",
    )
    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="{model}",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<{Model}(id={self.id}, name={self.name}, price={self.price})>"

    @property
    def is_in_stock(self) -> bool:
        """Vérifie si le {model} est en stock."""
        return self.quantity > 0

    def update_stock(self, quantity_change: int) -> None:
        """Met à jour le stock."""
        new_quantity = self.quantity + quantity_change
        if new_quantity < 0:
            raise ValueError("Stock insuffisant")
        self.quantity = new_quantity
```

### Étape 3 : Types de Colonnes Courants

```python
# Référence des types SQLAlchemy

from sqlalchemy import (
    # Numériques
    Integer,
    BigInteger,
    SmallInteger,
    Numeric,      # Decimal avec précision
    Float,

    # Texte
    String,       # VARCHAR
    Text,         # TEXT (illimité)

    # Date/Heure
    Date,
    Time,
    DateTime,
    Interval,

    # Booléen
    Boolean,

    # Binaire
    LargeBinary,

    # JSON
    JSON,
)

from sqlalchemy.dialects.postgresql import (
    UUID,
    ARRAY,
    JSONB,
    INET,
    CIDR,
    MACADDR,
    TSTZRANGE,
    ENUM,
)

# Exemples de colonnes
class ExampleModel(Base):
    # UUID
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)

    # String avec longueur
    email: Mapped[str] = mapped_column(String(255), unique=True)

    # Decimal précis (pour l'argent)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    # JSON PostgreSQL
    metadata_: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Array PostgreSQL
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    # Enum
    status: Mapped[str] = mapped_column(
        ENUM("pending", "active", "archived", name="status_enum")
    )
```

### Étape 4 : Relations

```python
# Relations courantes

# One-to-Many (Parent)
class Category(Base):
    __tablename__ = "categories"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))

    # Relation vers les enfants
    products: Mapped[list["Product"]] = relationship(
        "Product",
        back_populates="category",
        cascade="all, delete-orphan",  # Supprimer les enfants si parent supprimé
    )

# One-to-Many (Child)
class Product(Base):
    __tablename__ = "products"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    category_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
    )

    # Relation vers le parent
    category: Mapped[Optional["Category"]] = relationship(
        "Category",
        back_populates="products",
    )

# Many-to-Many
class ProductTag(Base):
    """Table d'association."""
    __tablename__ = "product_tags"

    product_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Product(Base):
    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        secondary="product_tags",
        back_populates="products",
    )

class Tag(Base):
    products: Mapped[list["Product"]] = relationship(
        "Product",
        secondary="product_tags",
        back_populates="tags",
    )
```

### Étape 5 : Migration Alembic

```python
# alembic/versions/xxxx_create_{model}s_table.py
"""Create {model}s table

Revision ID: xxxxxxxxxxxx
Revises: previous_revision
Create Date: 2024-01-15 10:30:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'xxxxxxxxxxxx'
down_revision = 'previous_revision'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        '{model}s',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False, server_default='0.00'),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.UniqueConstraint('slug'),
        sa.UniqueConstraint('name', 'category_id', name='uq_{model}_name_category'),
        sa.CheckConstraint('price >= 0', name='ck_{model}_price_positive'),
    )

    # Index
    op.create_index('ix_{model}s_name', '{model}s', ['name'])
    op.create_index('ix_{model}s_slug', '{model}s', ['slug'])
    op.create_index('ix_{model}s_is_active', '{model}s', ['is_active'])
    op.create_index('ix_{model}s_category_id', '{model}s', ['category_id'])
    op.create_index('ix_{model}s_category_active', '{model}s', ['category_id', 'is_active'])


def downgrade() -> None:
    op.drop_index('ix_{model}s_category_active')
    op.drop_index('ix_{model}s_category_id')
    op.drop_index('ix_{model}s_is_active')
    op.drop_index('ix_{model}s_slug')
    op.drop_index('ix_{model}s_name')
    op.drop_table('{model}s')
```

### Étape 6 : Commandes

```bash
# Générer la migration automatiquement
alembic revision --autogenerate -m "Create {model}s table"

# Vérifier la migration
alembic upgrade --sql head

# Appliquer la migration
alembic upgrade head

# Rollback si nécessaire
alembic downgrade -1
```

### Résumé

```
══════════════════════════════════════════════════════════════
✅ MODEL GÉNÉRÉ - {Model}
══════════════════════════════════════════════════════════════

📁 Fichiers créés :
- app/models/{model}.py

📊 Structure de la table :
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL, INDEX |
| slug | VARCHAR(255) | UNIQUE, INDEX |
| description | TEXT | NULLABLE |
| price | NUMERIC(10,2) | DEFAULT 0.00, CHECK >= 0 |
| quantity | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true, INDEX |
| category_id | UUID | FK -> categories.id |
| created_at | DATETIME | DEFAULT now() |
| updated_at | DATETIME | DEFAULT now(), ON UPDATE |

🔗 Relations :
- category: ManyToOne -> Category
- order_items: OneToMany -> OrderItem

🔧 Commandes :
# Générer migration
alembic revision --autogenerate -m "Create {model}s table"

# Appliquer
alembic upgrade head
```
