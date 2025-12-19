---
description: Actualizar un EPIC
argument-hint: [arguments]
---

# Actualizar un EPIC

Modificar información de un EPIC existente.

## Argumentos

$ARGUMENTS (formato: EPIC-XXX [campo] [valor])
- **EPIC-ID** (obligatorio): ID del EPIC (ej., EPIC-001)
- **Campo** (opcional): Campo a modificar
- **Valor** (opcional): Nuevo valor

## Campos Modificables

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `name` | Nombre del EPIC | "Nuevo nombre" |
| `priority` | Prioridad | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "Descripción MMF" |
| `description` | Descripción | "Nueva descripción" |

## Proceso

### Modo Interactivo (sin argumentos de campo)

Si solo se proporciona el ID:

```
/project:update-epic EPIC-001
```

Mostrar información actual y ofrecer modificaciones:

```
📋 EPIC-001: Sistema de autenticación

Campos actuales:
1. Nombre: Sistema de autenticación
2. Prioridad: High
3. MMF: Permitir a los usuarios iniciar sesión
4. Descripción: [...]

¿Qué campo modificar? (1-4, o 'q' para salir)
>
```

### Modo Directo (con argumentos)

```
/project:update-epic EPIC-001 priority Medium
```

Modificar directamente el campo especificado.

### Pasos

1. Validar que el EPIC existe
2. Leer archivo actual
3. Modificar campo solicitado
4. Actualizar fecha de modificación
5. Guardar archivo
6. Actualizar índice si es necesario

## Formato de salida

```
✅ EPIC actualizado!

📋 EPIC-001: Sistema de autenticación

Modificación:
  Prioridad: High → Medium

Archivo: project-management/backlog/epics/EPIC-001-authentication-system.md
```

## Ejemplos

```
# Modo interactivo
/project:update-epic EPIC-001

# Cambiar nombre
/project:update-epic EPIC-001 name "Autenticación y Autorización"

# Cambiar prioridad
/project:update-epic EPIC-001 priority Low

# Cambiar MMF
/project:update-epic EPIC-001 mmf "Permitir SSO y 2FA"
```

## Validación

- El campo debe ser modificable
- La prioridad debe ser High, Medium o Low
- El nombre no puede estar vacío
