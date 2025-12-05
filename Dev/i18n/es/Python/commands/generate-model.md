# Generar Modelo SQLAlchemy

Eres un desarrollador senior de Python. Debes generar un modelo completo de SQLAlchemy con relaciones, validaciones y migración de Alembic.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre del modelo (ej: `User`, `Product`, `Order`)
- (Opcional) Campos en formato field:type (ej: `name:str email:str:unique`)

Ejemplo: `/python:generate-model Product name:str price:decimal category_id:uuid:fk`

## MISIÓN

### Paso 1: Analizar Requisitos

Identificar:
- Nombre del modelo y tabla
- Campos y sus tipos
- Relaciones (ForeignKey, OneToMany, ManyToMany)
- Índices y restricciones
- Validaciones

### Paso 2: Modelo SQLAlchemy 2.0

[Crear modelo completo con Mapped, relationships, restricciones]

### Paso 3: Tipos de Columna Comunes

[Referencia para tipos SQLAlchemy: Integer, String, Text, DateTime, UUID, JSONB, etc.]

### Paso 4: Relaciones

[Ejemplos: OneToMany, ManyToMany con tabla de asociación]

### Paso 5: Migración de Alembic

[Crear archivo de migración con funciones upgrade/downgrade]

### Paso 6: Comandos

```bash
# Generar migración automáticamente
alembic revision --autogenerate -m "Create {model}s table"

# Verificar migración
alembic upgrade --sql head

# Aplicar migración
alembic upgrade head

# Rollback si es necesario
alembic downgrade -1
```

### Resumen

```
══════════════════════════════════════════════════════════════
✅ MODELO GENERADO - {Model}
══════════════════════════════════════════════════════════════

📁 Archivos Creados:
- app/models/{model}.py

📊 Estructura de Tabla:
| Columna | Tipo | Restricciones |
|---------|------|---------------|
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

🔗 Relaciones:
- category: ManyToOne -> Category
- order_items: OneToMany -> OrderItem

🔧 Comandos:
# Generar migración
alembic revision --autogenerate -m "Create {model}s table"

# Aplicar
alembic upgrade head
```
