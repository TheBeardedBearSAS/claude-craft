---
description: Validar la preparacion del sprint antes de iniciar
argument-hint: [--verbose]
---

# Validar Sprint Gate

Valida que el sprint esta correctamente planificado y listo para iniciar.
Todos los criterios requeridos deben cumplirse.

## Argumentos

$ARGUMENTS (format: [--verbose])
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

1. Leer `.bmad/sprint-status.yaml`
2. Extraer los metadatos
3. Contar las stories por estado

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
  /sprint:start           Iniciar el sprint
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
