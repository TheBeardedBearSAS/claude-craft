---
description: Validar la preparacion del sprint antes de iniciar
argument-hint: "[N] [--verbose]"
---

# Validar Sprint Gate

Valida que el sprint esta correctamente planificado y listo para iniciar.
Todos los criterios requeridos deben cumplirse.

## Argumentos

$ARGUMENTS (format: [N] [--verbose])
- **N** (opcional): número del sprint (`1`, `001` o `sprint-001`); por defecto: `metadata.sprint_id`, si no, la carpeta `project-management/sprints/sprint-*/` más reciente
- **--verbose** (opcional): Mostrar el detalle por story

## Criterios Sprint Ready

| Criterio | Peso | Requerido | Descripcion |
|----------|------|-----------|-------------|
| Metadatos Sprint | 20% | Si | ID, nombre, fechas definidos |
| Sprint Goal | 15% | Si | Objetivo claro definido |
| Stories listas | 25% | Si | Stories en ready-for-dev |
| Stories estimadas | 20% | Si | Todas tienen puntos |
| Verificacion capacidad | 10% | No | Puntos dentro de la capacidad |
| Dependencias resueltas | 10% | No | Sin stories bloqueadas en ready |

**Umbral: Todos los criterios requeridos**

## Proceso

### Paso 1: Cargar el estado del sprint

Fuente, en este orden:

1. **`.bmad/sprint-status.yaml`** si existe y su `metadata.sprint_id` corresponde al sprint `N`: extraer los metadatos y contar las stories por estado.
2. **Si no, respaldo Markdown** desde `project-management/sprints/sprint-{N}-*/` (escrito por `/workflow:start`):
   - metadatos, objetivo, capacidad: `sprint-goal.md` (inicio, fin, capacidad, objetivo);
   - stories: la tabla de US seleccionadas de `sprint-goal.md` y las fichas `project-management/backlog/user-stories/US-*.md` (puntos, estado). Una story planificada y no iniciada cuenta como `ready-for-dev`;
   - dependencias bloqueantes: `sprint-dependencies.md`.
3. Ninguno de los dos: fallar con «No existe el sprint {N}: ejecute `/workflow:start {N}`».

En modo respaldo el gate se evalúa igualmente, pero el informe añade una advertencia no bloqueante: los comandos `/sprint:*` necesitan `.bmad/sprint-status.yaml`, ejecute `/workflow:start {N}` o `/project:migrate-backlog`.

### Paso 2: Validar los metadatos

Verificar los campos requeridos:
- `metadata.sprint_id` - Identificador del sprint
- `metadata.name` - Nombre del sprint
- `metadata.start_date` - Fecha de inicio
- `metadata.end_date` - Fecha de fin
- `metadata.goal` - Objetivo del sprint (min 10 caracteres)

### Paso 3: Validar las stories

Verificar la preparacion de las stories:
- Al menos 1 story en `ready-for-dev`
- Todas las stories tienen story points
- Sin stories bloqueadas en estado ready

### Paso 4: Verificacion de capacidad opcional

Si `metadata.capacity_points` esta definido:
- Suma de puntos stories ready ≤ capacidad + 20%

### Paso 5: Generar el informe

Mostrar el estado de preparacion del sprint.
Empezar el informe con la fuente utilizada: `Fuente: .bmad/sprint-status.yaml` o `Fuente: Markdown (project-management/sprints/sprint-{N}-*/)`.

## Formato de salida

### Sprint listo

```
═══════════════════════════════════════════════════════
           Validacion Sprint Ready Gate
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestion de Usuarios
Periodo: 2026-01-29 → 2026-02-12 (14 dias)

Resultados de validacion:
──────────────────────────────────────────────────────
✅ Metadatos Sprint (20%)
   ID: sprint-3
   Nombre: Gestion de Usuarios
   Inicio: 2026-01-29
   Fin: 2026-02-12

✅ Sprint Goal (15%)
   "Implementar las funcionalidades de gestion de usuarios
    incluyendo registro, inicio de sesion y gestion de perfil"

✅ Stories listas (25%)
   5 stories en estado ready-for-dev
   Total puntos: 21

✅ Stories estimadas (20%)
   Las 8 stories tienen story points

✅ Verificacion capacidad (10%)
   Planificado: 21 puntos
   Capacidad: 25 puntos
   Utilizacion: 84%

✅ Dependencias resueltas (10%)
   Ninguna story bloqueada en estado ready

Puntuacion: 100/100
──────────────────────────────────────────────────────

✅ SPRINT READY GATE VALIDADO

El sprint puede iniciarse.

Stories listas:
  📖 US-010: Registro de usuario (5 pts)
  📖 US-011: Inicio de sesion de usuario (5 pts)
  📖 US-012: Pagina de perfil (5 pts)
  📖 US-013: Restablecimiento de contrasena (3 pts)
  📖 US-014: Verificacion de email (3 pts)

Comandos:
  /workflow:start           Iniciar el sprint
  /sprint:next-story     Tomar la primera story
═══════════════════════════════════════════════════════
```

### Sprint no listo

```
═══════════════════════════════════════════════════════
           Validacion Sprint Ready Gate
═══════════════════════════════════════════════════════

Sprint: (no configurado)

Resultados de validacion:
──────────────────────────────────────────────────────
❌ Metadatos Sprint (20%)
   Faltante: sprint_id
   Faltante: start_date
   Faltante: end_date

❌ Sprint Goal (15%)
   Faltante: Ningun objetivo definido

⚠️ Stories listas (25%)
   Solo 1 story en ready-for-dev
   Recomendado: al menos 3 stories

❌ Stories estimadas (20%)
   3 stories sin story points:
   - US-010: Registro de usuario
   - US-012: Pagina de perfil
   - US-015: Pagina de configuracion

⏳ Verificacion capacidad (10%)
   Omitido: Sin capacidad definida

⚠️ Dependencias resueltas (10%)
   1 story ready esta bloqueada:
   - US-011: Bloqueada por API externa

Puntuacion: 35/100
──────────────────────────────────────────────────────

❌ SPRINT READY GATE FALLIDO

Acciones requeridas:
──────────────────────────────────────────────────────
1. Configurar los metadatos del sprint
   Editar .bmad/sprint-status.yaml:
   ```yaml
   metadata:
     sprint_id: "sprint-3"
     name: "Gestion de Usuarios"
     start_date: "2026-01-29"
     end_date: "2026-02-12"
     goal: "Implementar las funcionalidades de gestion de usuarios"
   ```

2. Definir el objetivo del sprint
   Agregar un objetivo claro y medible

3. Estimar las stories faltantes
   /project:update-story US-010 --points 5
   /project:update-story US-012 --points 5
   /project:update-story US-015 --points 3

4. Resolver las stories bloqueadas
   US-011 bloqueada por: dependencia API externa
   Opciones:
   - Retirar del sprint
   - Desbloquear la dependencia
   - Reordenar las stories

Relanzar: /gate:validate-sprint
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/gate:validate-sprint
/gate:validate-sprint --verbose
```

## Configuracion Sprint

Configurar el sprint en `.bmad/sprint-status.yaml`:

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "Gestion de Usuarios"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implementar las funcionalidades de gestion de usuarios"
  capacity_points: 25  # Opcional: capacidad del equipo
```

Configuracion del gate: `.bmad/gates/sprint-ready-gate.yaml`
