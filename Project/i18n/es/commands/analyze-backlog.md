---
description: Analizar la estructura del backlog existente para migrar a BMAD
argument-hint: [--format json|yaml|md]
---

# Analizar el Backlog

Analizar la estructura actual del backlog para preparar la migracion a BMAD v6.

## Argumentos

$ARGUMENTS (format: [--format formato_salida])
- **--format** (opcional): Formato de salida (json, yaml, md). Por defecto: md

## Proceso

### Paso 1: Detectar la ubicacion del backlog

Buscar los archivos de backlog en las ubicaciones comunes:
1. `project-management/backlog/` (estandar claude-craft)
2. `docs/backlog/` (alternativo)
3. `backlog/` (simple)
4. `.bmad/` (si ya esta migrado)

### Paso 2: Analizar la estructura

Para cada ubicacion encontrada, identificar:
- **Epics**: Archivos que coinciden con `EPIC-*.md`
- **User Stories**: Archivos que coinciden con `US-*.md`
- **Tareas**: Archivos que coinciden con `TASK-*.md`
- **Archivos indice**: `index.md`, `backlog.md`

### Paso 3: Parsear los metadatos

Para cada archivo, extraer:
- ID (EPIC-XXX, US-XXX, TASK-XXX)
- Titulo/Nombre
- Estado (🔴 Pendiente, 🟡 En curso, 🟢 Completado, ⏸️ Bloqueado)
- Asignacion de sprint
- Story points (para US)
- Relaciones padre (US → EPIC, TASK → US)

### Paso 4: Validar la conformidad INVEST

Para cada User Story, verificar:
- [ ] **I**ndependiente: Sin dependencias bloqueantes
- [ ] **N**egociable: Tiene una descripcion (no solo un titulo)
- [ ] **V**aliosa: Tiene un enunciado de beneficio/valor
- [ ] **E**stimable: Tiene story points
- [ ] **S**uficientemente pequena: ≤ 8 puntos
- [ ] **T**esteable: Tiene criterios de aceptacion

Puntuacion: 0-6 criterios aprobados.

### Paso 5: Identificar las brechas de migracion

Verificar la compatibilidad con BMAD v6:
- [ ] Seguimiento de fase TDD (red/green/refactor)
- [ ] Lista de tareas con seguimiento de completitud
- [ ] Historial de estados
- [ ] Asignacion de sprint
- [ ] Estado de validacion de criterios de aceptacion

### Paso 6: Generar el informe de compatibilidad

Crear un informe con:
1. **Resumen**: Total de epics, stories, tareas encontradas
2. **Estructura**: Organizacion actual de archivos
3. **Puntuaciones INVEST**: Conformidad por story
4. **Brechas**: Campos BMAD v6 faltantes
5. **Recomendaciones**: Acciones sugeridas

## Formato de Salida

```
📊 Informe de Analisis del Backlog
===================================

## Resumen
- Ubicacion: project-management/backlog/
- Formato: Markdown (estandar claude-craft)
- Epics: {CANTIDAD}
- User Stories: {CANTIDAD}
- Tareas: {CANTIDAD}

## Conformidad INVEST

| Story ID | Titulo | Puntuacion | Faltante |
|----------|--------|------------|----------|
| US-001 | Inicio de sesion | 5/6 | Estimable |
| US-002 | Registro | 6/6 | - |

Puntuacion INVEST promedio: {PROM}/6

## Recomendaciones

1. ⚠️ {CANTIDAD} stories sin story points
2. ✅ Estructura compatible con BMAD v6
3. 📝 Ejecutar `/project:migrate-backlog` para migrar
```

## Ejemplo

```
/project:analyze-backlog
/project:analyze-backlog --format yaml
```

## Pasos Siguientes

Despues del analisis:
- `/project:migrate-backlog` - Convertir al formato BMAD v6
- `/project:update-stories` - Agregar los campos faltantes
- `/project:sync-backlog` - Sincronizar con sprint-status.yaml
