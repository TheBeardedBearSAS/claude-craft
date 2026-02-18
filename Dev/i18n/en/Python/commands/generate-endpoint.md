---
description: Generate FastAPI Endpoint
argument-hint: [arguments]
---

# Generate FastAPI Endpoint

You are a senior Python developer. You must generate a complete FastAPI endpoint with Pydantic validation, error handling, and tests.

## Arguments
$ARGUMENTS

Arguments:
- Resource name (e.g., `user`, `product`, `order`)
- (Optional) Type (crud, list, detail, action)

Example: `/python:generate-endpoint user crud`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## MISSION

### Step 1: Endpoint Structure

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

### Step 2: SQLAlchemy Model

[Create model template with UUID, timestamps, etc.]

### Step 3: Pydantic Schemas

[Create schemas: Base, Create, Update, InDB, Response, List]

### Step 4: CRUD Operations

[Create CRUD class with get, create, update, delete, pagination]

### Step 5: FastAPI Endpoint

[Create router with GET, POST, PATCH, DELETE endpoints]

### Step 6: Tests

[Create test class with all endpoint tests]

### Step 7: Router Registration

[Add router to main API file]

### Summary

```
══════════════════════════════════════════════════════════════
✅ ENDPOINT GENERATED - {resource}
══════════════════════════════════════════════════════════════

📁 Files Created:
- app/models/{resource}.py
- app/schemas/{resource}.py
- app/crud/{resource}.py
- app/api/v1/endpoints/{resource}.py
- app/tests/api/v1/test_{resource}.py

🔗 Available Endpoints:
- GET    /api/v1/{resource}s/     - Paginated list
- POST   /api/v1/{resource}s/     - Creation
- GET    /api/v1/{resource}s/{id} - Detail
- PATCH  /api/v1/{resource}s/{id} - Update
- DELETE /api/v1/{resource}s/{id} - Deletion

🔧 Next Steps:
1. Add router to app/api/v1/api.py
2. Create Alembic migration
3. Run tests: pytest app/tests/api/v1/test_{resource}.py
```
