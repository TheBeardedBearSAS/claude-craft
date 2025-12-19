---
description: Planificación de Migración de Base de Datos
argument-hint: [arguments]
---

# Planificación de Migración de Base de Datos

Eres un DBA y arquitecto senior de Symfony. Debes planificar una migración de base de datos compleja con una estrategia zero-downtime, incluyendo el rollback y los tests.

## Argumentos
$ARGUMENTS

Argumentos:
- Descripción de la migración (ej: "Añadir tabla audit_log", "Renombrar columna user.name a full_name")

Ejemplo: `/symfony:migration-plan "Añadir sistema de versionado en los documentos"`

## MISIÓN

### Paso 1: Analizar el Cambio

```
══════════════════════════════════════════════════════════════
📋 ANÁLISIS DE MIGRACIÓN
══════════════════════════════════════════════════════════════

Descripción: {Descripción de la migración}
Fecha prevista: {YYYY-MM-DD}
Entornos: dev → staging → producción

──────────────────────────────────────────────────────────────
🔍 ESTADO ACTUAL
──────────────────────────────────────────────────────────────

Tablas impactadas:
- table_1 (X filas)
- table_2 (Y filas)

Dependencias:
- Entidades: Entity1, Entity2
- Services: Service1, Service2
- Controladores: Controller1

──────────────────────────────────────────────────────────────
⚠️ EVALUACIÓN DE RIESGOS
──────────────────────────────────────────────────────────────

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Lock table largo | Media | Alta | Migración en etapas |
| Pérdida de datos | Baja | Crítica | Backup + test restore |
| Downtime | Media | Alta | Blue/Green + feature flags |
```

### Paso 2: Estrategia de Migración

#### Pattern Expand/Contract (Zero-Downtime)

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: EXPAND (Adición)                                    │
│ - Añadir nueva columna/tabla                                │
│ - Columna nullable o con valor por defecto                  │
│ - Sin eliminación                                           │
│ - App continúa funcionando                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: MIGRATE (Datos)                                     │
│ - Copiar/transformar los datos                              │
│ - Batch processing para grandes volúmenes                   │
│ - Validación de datos migrados                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: UPDATE (Aplicación)                                 │
│ - Desplegar código usando la nueva estructura               │
│ - Escritura en antiguo Y nuevo durante la transición        │
│ - Feature flag si necesario                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: CONTRACT (Limpieza)                                 │
│ - Eliminar antigua columna/tabla                            │
│ - Eliminar código de compatibilidad                         │
│ - Puede hacerse más tarde, con seguridad                    │
└─────────────────────────────────────────────────────────────┘
```

### Paso 3: Generar las Migraciones

[El contenido continúa con las migraciones en español...]

### Comandos Útiles

```bash
# Estado de migraciones
docker compose exec php php bin/console doctrine:migrations:status

# Ver migraciones pendientes
docker compose exec php php bin/console doctrine:migrations:list

# Ejecutar una migración específica
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --up

# Rollback de una migración
docker compose exec php php bin/console doctrine:migrations:execute 'DoctrineMigrations\VersionXXX' --down

# Validar el esquema
docker compose exec php php bin/console doctrine:schema:validate
```
