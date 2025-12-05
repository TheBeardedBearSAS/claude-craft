# Generate SQLAlchemy Model

You are a senior Python developer. You must generate a complete SQLAlchemy model with relations, validations, and Alembic migration.

## Arguments
$ARGUMENTS

Arguments:
- Model name (e.g., `User`, `Product`, `Order`)
- (Optional) Fields in format field:type (e.g., `name:str email:str:unique`)

Example: `/python:generate-model Product name:str price:decimal category_id:uuid:fk`

## MISSION

### Step 1: Analyze Requirements

Identify:
- Model and table name
- Fields and their types
- Relations (ForeignKey, OneToMany, ManyToMany)
- Indexes and constraints
- Validations

### Step 2: SQLAlchemy 2.0 Model

[Create complete model with Mapped, relationships, constraints]

### Step 3: Common Column Types

[Reference for SQLAlchemy types: Integer, String, Text, DateTime, UUID, JSONB, etc.]

### Step 4: Relations

[Examples: OneToMany, ManyToMany with association table]

### Step 5: Alembic Migration

[Create migration file with upgrade/downgrade functions]

### Step 6: Commands

```bash
# Generate migration automatically
alembic revision --autogenerate -m "Create {model}s table"

# Verify migration
alembic upgrade --sql head

# Apply migration
alembic upgrade head

# Rollback if necessary
alembic downgrade -1
```

### Summary

```
══════════════════════════════════════════════════════════════
✅ MODEL GENERATED - {Model}
══════════════════════════════════════════════════════════════

📁 Files Created:
- app/models/{model}.py

📊 Table Structure:
| Column | Type | Constraints |
|--------|------|-------------|
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

🔗 Relations:
- category: ManyToOne -> Category
- order_items: OneToMany -> OrderItem

🔧 Commands:
# Generate migration
alembic revision --autogenerate -m "Create {model}s table"

# Apply
alembic upgrade head
```
