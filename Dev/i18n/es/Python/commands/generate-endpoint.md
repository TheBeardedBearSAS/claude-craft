# Generar Endpoint FastAPI

Eres un desarrollador senior de Python. Debes generar un endpoint completo de FastAPI con validación Pydantic, manejo de errores y pruebas.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre del recurso (ej: `user`, `product`, `order`)
- (Opcional) Tipo (crud, list, detail, action)

Ejemplo: `/python:generate-endpoint user crud`

## MISIÓN

### Paso 1: Estructura de Endpoint

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

### Paso 2: Modelo SQLAlchemy

[Crear template de modelo con UUID, timestamps, etc.]

### Paso 3: Schemas Pydantic

[Crear schemas: Base, Create, Update, InDB, Response, List]

### Paso 4: Operaciones CRUD

[Crear clase CRUD con get, create, update, delete, paginación]

### Paso 5: Endpoint FastAPI

[Crear router con endpoints GET, POST, PATCH, DELETE]

### Paso 6: Pruebas

[Crear clase de prueba con todas las pruebas de endpoint]

### Paso 7: Registro de Router

[Agregar router al archivo principal de API]

### Resumen

```
══════════════════════════════════════════════════════════════
✅ ENDPOINT GENERADO - {resource}
══════════════════════════════════════════════════════════════

📁 Archivos Creados:
- app/models/{resource}.py
- app/schemas/{resource}.py
- app/crud/{resource}.py
- app/api/v1/endpoints/{resource}.py
- app/tests/api/v1/test_{resource}.py

🔗 Endpoints Disponibles:
- GET    /api/v1/{resource}s/     - Lista paginada
- POST   /api/v1/{resource}s/     - Creación
- GET    /api/v1/{resource}s/{id} - Detalle
- PATCH  /api/v1/{resource}s/{id} - Actualización
- DELETE /api/v1/{resource}s/{id} - Eliminación

🔧 Próximos Pasos:
1. Agregar router a app/api/v1/api.py
2. Crear migración de Alembic
3. Ejecutar pruebas: pytest app/tests/api/v1/test_{resource}.py
```
