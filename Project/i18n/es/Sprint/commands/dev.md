---
name: sprint-dev
description: Iniciar el desarrollo TDD/BDD de un sprint con actualizaciones automáticas de estado
arguments:
  - name: sprint
    description: Número de sprint, "next" para el siguiente sprint incompleto, o "current"
    required: true
---

# /sprint:dev

## Propósito

Orquestar el desarrollo completo de un sprint en modo TDD/BDD con:
- **Modo plan obligatorio** antes de cada implementación de tarea
- **Ciclo TDD** (RED → GREEN → REFACTOR)
- **Actualizaciones automáticas de estado** (Tarea → Historia de Usuario → Sprint)
- **Seguimiento de progreso** y métricas

## Prerrequisitos

- El sprint existe con tareas descompuestas
- Archivos presentes: `sprint-backlog.md`, `tasks/*.md`
- Ejecutar `/project:decompose-tasks N` primero si es necesario

## Argumentos

```bash
/sprint:dev 1        # Sprint 1
/sprint:dev next     # Siguiente sprint incompleto
/sprint:dev current  # Sprint actualmente activo
```

---

## Flujo de Trabajo

### Fase 1: Inicialización

1. Cargar el sprint desde `project-management/sprints/sprint-N-*/`
2. Leer `sprint-backlog.md` para obtener las Historias de Usuario
3. Listar tareas por HU (ordenadas por dependencias)
4. Mostrar el tablero inicial

```
📋 Sprint 1: Walking Skeleton
   Objetivo: Completar el flujo de autenticación de extremo a extremo

   3 Historias de Usuario, 17 Tareas

   🔴 Por Hacer: 15 | 🟡 En Progreso: 2 | 🟢 Hecho: 0
```

### Fase 2: Bucle de Historias de Usuario

Para cada Historia de Usuario en estado Por Hacer o En Progreso:

1. **Marcar HU → En Progreso** (si estaba Por Hacer)
2. **Mostrar los criterios de aceptación** (formato Gherkin)
3. **Procesar cada tarea** de esta HU

```
🎯 HU-001: Autenticación de Usuario (5 pts)
   Estado: 🟡 En Progreso

   Criterios de Aceptación:
   ┌─────────────────────────────────────────────────────┐
   │ DADO un usuario registrado con credenciales válidas │
   │ CUANDO envía el formulario de inicio de sesión      │
   │ ENTONCES debería ver su panel de control            │
   │ Y se debería crear una sesión                       │
   └─────────────────────────────────────────────────────┘

   Tareas:
   └─ TAREA-001 [DB] Crear entidad User .............. 🔴 Por Hacer
   └─ TAREA-002 [BE] Servicio de autenticación ....... 🔴 Por Hacer
   └─ TAREA-003 [FE-WEB] Formulario de inicio de sesión 🔴 Por Hacer
   └─ TAREA-004 [TEST] Pruebas E2E de autenticación .. 🔴 Por Hacer
```

### Fase 3: Bucle de Tareas (Flujo de Trabajo TDD)

Para cada tarea en Por Hacer:

#### 3.1 Mostrar Detalles de la Tarea

```
▶️ Iniciando TAREA-001 [DB] Crear entidad User

   Estimación: 2h
   Descripción: Crear entidad User con email, password_hash, roles
   Archivos a modificar: src/Entity/User.php, migrations/

   Definición de Hecho:
   - [ ] Código escrito y funcional
   - [ ] Las pruebas pasan
   - [ ] Código revisado (si existe tarea [REV])
```

#### 3.2 Modo Plan (OBLIGATORIO)

⚠️ **SIEMPRE activar el modo plan antes de implementar**

```
⚠️ MODO PLAN ACTIVADO

   Analizando tarea TAREA-001...

   📁 Archivos a analizar:
   - src/Entity/ (patrón de entidades existentes)
   - config/packages/doctrine.yaml
   - migrations/ (última migración)

   🔍 Análisis en progreso...
```

El modo plan DEBE:
1. **Explorar** el código impactado y las dependencias
2. **Documentar** los hallazgos del análisis
3. **Proponer** un plan de implementación con:
   - Archivos a crear/modificar
   - Pruebas a escribir (TDD)
   - Riesgos y mitigaciones
4. **Esperar** la validación del usuario antes de proceder

```
📋 Plan de Implementación para TAREA-001

   1. Crear entidad User con propiedades:
      - id (UUID)
      - email (único)
      - password_hash
      - roles (array JSON)
      - created_at, updated_at

   2. Pruebas a escribir PRIMERO (TDD):
      - UserTest::test_user_creation()
      - UserTest::test_email_validation()
      - UserTest::test_password_hashing()

   3. Archivos a crear:
      - src/Entity/User.php
      - tests/Unit/Entity/UserTest.php
      - migrations/VersionXXX.php

   ⏳ Esperando validación...

   [continue] Proceder con la implementación
   [skip] Omitir esta tarea
   [block] Marcar como bloqueada
   [stop] Detener sprint-dev
```

#### 3.3 Marcar Tarea → En Progreso

Después de la validación del plan:
- Actualizar el estado de la tarea a En Progreso
- Actualizar board.md
- Actualizar index.md

#### 3.4 Ciclo TDD

```
🧪 CICLO TDD - TAREA-001

🔴 Fase RED: Escribir pruebas que fallen
   Creando tests/Unit/Entity/UserTest.php...

   Ejecutando pruebas... FALLIDO (esperado)
   ✗ test_user_creation
   ✗ test_email_validation
   ✗ test_password_hashing

🟢 Fase GREEN: Implementar el código mínimo
   Creando src/Entity/User.php...

   Ejecutando pruebas... APROBADO
   ✓ test_user_creation
   ✓ test_email_validation
   ✓ test_password_hashing

🔧 Fase REFACTOR: Mejorar la calidad del código
   - ¿Extraer la validación de email a un ValueObject? [s/n]
   - ¿Agregar método factory? [s/n]

   Ejecutando pruebas... APROBADO (sin regresión)
```

#### 3.5 Verificación de la Definición de Hecho

```
✅ Definición de Hecho - TAREA-001

- [x] Código escrito y funcional
- [x] Las pruebas pasan (3/3)
- [ ] Código revisado → Gestionado por TAREA-XXX [REV]

¡Todas las verificaciones superadas!
```

#### 3.6 Marcar Tarea → Hecho

```
📊 Finalización de Tarea

TAREA-001 [DB] Crear entidad User
├─ Estado: 🟢 Hecho
├─ Estimado: 2h
├─ Real: 1.5h
└─ Eficiencia: 133%

Introduzca el tiempo real empleado (horas): 1.5
```

Actualizaciones:
- Metadatos del archivo de tarea (estado, time_spent, updated_at)
- board.md
- index.md
- Métricas del sprint

#### 3.7 Commit Convencional

```
📝 Creando commit...

feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add UUID primary key strategy
- Add timestamps (created_at, updated_at)
- Add unit tests for User entity

Refs: TAREA-001, HU-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Fase 4: Validación de la Historia de Usuario

Cuando todas las tareas de una HU estén Hechas:

```
🎯 Validación HU-001

Todas las tareas completadas (4/4)

Verificando criterios de aceptación:
┌─────────────────────────────────────────────────────┐
│ ✓ DADO un usuario registrado con credenciales válidas│
│ ✓ CUANDO envía el formulario de inicio de sesión     │
│ ✓ ENTONCES debería ver su panel de control           │
│ ✓ Y se debería crear una sesión                      │
└─────────────────────────────────────────────────────┘

Ejecutando pruebas E2E si están presentes...
✓ tests/E2E/AuthenticationTest.php aprobado

HU-001 → 🟢 Hecho

Actualizando progreso de EPIC-001: 1/3 HU completadas (33%)
```

### Fase 5: Finalización del Sprint

Cuando todas las Historias de Usuario estén Hechas:

```
🏁 ¡Sprint 1 Completado!

📊 Resumen
├─ Duración: 8 días (planificado: 10)
├─ Velocidad: 15 puntos
├─ Tareas: 17/17 completadas
└─ Horas: 38h real vs 42h estimado (110% eficiencia)

📈 Métricas por Tipo
├─ [DB]: 4 tareas, 6h
├─ [BE]: 5 tareas, 12h
├─ [FE-WEB]: 4 tareas, 10h
├─ [TEST]: 3 tareas, 8h
└─ [DOC]: 1 tarea, 2h

📝 Generando sprint-review.md...
📝 Generando plantilla sprint-retro.md...

Siguiente: Ejecutar /sprint:dev 2 o /sprint:dev next
```

---

## Orden de Procesamiento de Tareas

Las tareas se procesan por tipo para respetar las dependencias:

| Orden | Tipo | Descripción |
|-------|------|-------------|
| 1 | `[DB]` | Base de datos (entidades, migraciones, repositorios) |
| 2 | `[BE]` | Backend (servicios, APIs, lógica de negocio) |
| 3 | `[FE-WEB]` | Frontend Web (controladores, plantillas, JS) |
| 4 | `[FE-MOB]` | Frontend Móvil (pantallas, blocs, widgets) |
| 5 | `[TEST]` | Pruebas adicionales (E2E, rendimiento) |
| 6 | `[DOC]` | Documentación |
| 7 | `[REV]` | Revisión de Código |

---

## Comandos de Control

Durante la ejecución de sprint-dev:

| Comando | Acción |
|---------|--------|
| `continue` | Validar el plan y proceder con la implementación |
| `skip` | Omitir esta tarea (permanece Por Hacer) |
| `block [razón]` | Marcar la tarea como Bloqueada con razón |
| `stop` | Detener sprint-dev (guarda el estado actual) |
| `status` | Mostrar el progreso actual |
| `board` | Mostrar el tablero Kanban |

---

## Gestión de Bloqueos

```
⚠️ Tarea Bloqueada

TAREA-003 no puede continuar.
Razón: Esperando la especificación de API del equipo de backend

Opciones:
[1] Omitir y continuar con la siguiente tarea desbloqueada
[2] Intentar resolver el bloqueo
[3] Detener sprint-dev

Elección: 1

Marcando TAREA-003 como Bloqueada...
Pasando a TAREA-004...
```

---

## Actualizaciones Automáticas

En cada cambio de estado:

1. **Archivo de tarea**: Actualizar estado, time_spent, updated_at
2. **Archivo de Historia de Usuario**: Actualizar progreso de tareas, estado si todas están hechas
3. **Archivo EPIC**: Actualizar progreso de HU
4. **board.md**: Actualizar columnas del Kanban
5. **index.md**: Actualizar métricas globales
6. **sprint-status**: Recalcular métricas

---

## Reanudar Después de Detener

```bash
/sprint:dev current

📋 Reanudando Sprint 1: Walking Skeleton

Progreso: 8/17 tareas (47%)

Última completada: TAREA-008 [BE] Servicio de Token JWT
Siguiente tarea: TAREA-009 [FE-WEB] Controlador de Inicio de Sesión

¿Continuar desde TAREA-009? [s/n]
```

---

## Sesión de Ejemplo

```bash
> /sprint:dev 1

📋 Sprint 1: Walking Skeleton
   3 HU, 17 tareas
   🔴 Por Hacer: 17 | 🟡 En Progreso: 0 | 🟢 Hecho: 0

🎯 Iniciando HU-001: Autenticación de Usuario (5 pts)
   Marcando como En Progreso...

▶️ TAREA-001 [DB] Crear entidad User

⚠️ MODO PLAN ACTIVADO
   Analizando...

   [Detalles del plan mostrados]

> continue

   Marcando TAREA-001 como En Progreso...

🧪 CICLO TDD

🔴 RED: Escribiendo pruebas...
   [Código de prueba creado]
   Pruebas: 0/3 pasando (esperado)

🟢 GREEN: Implementando...
   [Código de implementación]
   Pruebas: 3/3 pasando

🔧 REFACTOR: ¿Alguna mejora? [omitir]

✅ Definición de Hecho: APROBADA

   Introduzca el tiempo real (estimado 2h): 1.5

📝 Commit creado: feat(entity): create User entity

▶️ TAREA-002 [BE] Servicio de autenticación

⚠️ MODO PLAN ACTIVADO
   ...
```

---

## Archivos Actualizados

| Archivo | Actualizaciones |
|---------|----------------|
| `project-management/backlog/user-stories/HU-XXX.md` | Estado, progreso de tareas |
| `project-management/backlog/epics/EPIC-XXX.md` | Progreso de HU |
| `project-management/sprints/sprint-N-*/board.md` | Columnas del Kanban |
| `project-management/sprints/sprint-N-*/tasks/*.md` | Estado de tarea, tiempo |
| `project-management/backlog/index.md` | Métricas globales |
| `project-management/sprints/sprint-N-*/sprint-review.md` | Generado al final |

---

## Comandos Relacionados

| Comando | Uso |
|---------|-----|
| `/project:decompose-tasks N` | Crear tareas antes de sprint-dev |
| `/project:board N` | Ver tablero Kanban |
| `/sprint:status N` | Ver métricas del sprint |
| `/project:move-task` | Cambiar manualmente el estado de una tarea |
| `/sprint:transition` | Cambiar manualmente el estado de una HU |
