---
description: Generación CRUD Completo
argument-hint: [arguments]
translation_status: pending
---

> ⚠️ **Translation incomplete.** Please contribute via GitHub PR or refer to the [English version](../../en/Symfony/commands/generate-crud.md).

# Generación CRUD Completo

Eres un desarrollador senior de Symfony. Debes generar un CRUD completo respetando Clean Architecture, incluyendo Entity, Repository, Controller, Templates, Form y Tests.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre de la entidad (ej: `Product`, `BlogPost`)
- (Opcional) Campos en formato `nombre:tipo` separados por comas

Ejemplo: `/symfony:generate-crud Product name:string,price:decimal,description:text`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Paso 1: Análisis de Necesidades

Verificar:
- La entidad no existe ya
- Las convenciones de nomenclatura Symfony
- La estructura del proyecto (DDD o estándar)

### Paso 2: Generación de Archivos

#### Estructura a crear (Clean Architecture)

```
src/
├── Domain/
│   └── {Entity}/
│       ├── Entity/
│       │   └── {Entity}.php
│       ├── Repository/
│       │   └── {Entity}RepositoryInterface.php
│       └── ValueObject/
│           └── {Entity}Id.php
├── Application/
│   └── {Entity}/
│       ├── Command/
│       │   ├── Create{Entity}Command.php
│       │   ├── Update{Entity}Command.php
│       │   └── Delete{Entity}Command.php
│       ├── Handler/
│       │   ├── Create{Entity}Handler.php
│       │   ├── Update{Entity}Handler.php
│       │   └── Delete{Entity}Handler.php
│       ├── Query/
│       │   ├── Get{Entity}Query.php
│       │   └── List{Entities}Query.php
│       └── DTO/
│           └── {Entity}DTO.php
├── Infrastructure/
│   └── Persistence/
│       └── Doctrine/
│           └── {Entity}Repository.php
└── Presentation/
    └── Controller/
        └── {Entity}Controller.php

templates/
└── {entity}/
    ├── index.html.twig
    ├── show.html.twig
    ├── new.html.twig
    ├── edit.html.twig
    └── _form.html.twig

tests/
├── Unit/
│   └── Domain/
│       └── {Entity}/
│           └── {Entity}Test.php
└── Functional/
    └── Controller/
        └── {Entity}ControllerTest.php
```

### Paso 3: Templates de Código

[El contenido continúa con los mismos templates del archivo inglés, traduciendo solo los comentarios y mensajes]

### Paso 4: Migración Doctrine

```bash
docker compose exec php php bin/console make:migration
docker compose exec php php bin/console doctrine:migrations:migrate
```

### Paso 5: Resumen

```
══════════════════════════════════════════════════════════════
✅ CRUD GENERADO - {Entity}
══════════════════════════════════════════════════════════════

📁 Archivos creados:
- src/Domain/{Entity}/Entity/{Entity}.php
- src/Domain/{Entity}/Repository/{Entity}RepositoryInterface.php
- src/Domain/{Entity}/ValueObject/{Entity}Id.php
- src/Infrastructure/Persistence/Doctrine/{Entity}Repository.php
- src/Presentation/Controller/{Entity}Controller.php
- templates/{entity}/index.html.twig
- templates/{entity}/show.html.twig
- templates/{entity}/new.html.twig
- templates/{entity}/edit.html.twig
- tests/Unit/Domain/{Entity}/{Entity}Test.php
- tests/Functional/Controller/{Entity}ControllerTest.php

🔧 Comandos a ejecutar:
docker compose exec php php bin/console make:migration
docker compose exec php php bin/console doctrine:migrations:migrate
docker compose exec php vendor/bin/phpunit tests/Unit/Domain/{Entity}/

📌 Rutas creadas:
- GET    /{entities}              {entity}_index
- GET    /{entities}/new          {entity}_new
- POST   /{entities}              {entity}_new
- GET    /{entities}/{id}         {entity}_show
- GET    /{entities}/{id}/edit    {entity}_edit
- POST   /{entities}/{id}/edit    {entity}_edit
- POST   /{entities}/{id}         {entity}_delete
```
