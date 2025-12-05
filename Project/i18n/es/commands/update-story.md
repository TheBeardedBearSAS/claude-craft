# Actualizar una User Story

Modificar información de una User Story existente.

## Argumentos

$ARGUMENTS (formato: US-XXX [campo] [valor])
- **US-ID** (obligatorio): ID de la User Story (ej., US-001)
- **Campo** (opcional): Campo a modificar
- **Valor** (opcional): Nuevo valor

## Campos Modificables

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `name` | Nombre de la US | "Nuevo nombre" |
| `points` | Story points | 1, 2, 3, 5, 8 |
| `epic` | EPIC padre | EPIC-002 |
| `persona` | Persona relacionada | P-001 |
| `story` | Texto de la US | "Como..." |
| `criteria` | Criterios de aceptación | (modo interactivo) |

## Proceso

### Modo Interactivo (sin argumentos de campo)

```
/project:update-story US-001
```

Mostrar información y ofrecer modificaciones:

```
📖 US-001: Inicio de sesión de usuario

Campos actuales:
1. Nombre: Inicio de sesión de usuario
2. EPIC: EPIC-001
3. Puntos: 5
4. Persona: P-001 (Usuario Estándar)
5. Story: Como usuario, quiero...
6. Criterios de aceptación: [3 criterios]

¿Qué campo modificar? (1-6, o 'q' para salir)
>
```

### Modo Directo

```
/project:update-story US-001 points 8
```

### Modificar Criterios de Aceptación

En modo interactivo, opción para:
- Agregar un criterio
- Modificar criterio existente
- Eliminar un criterio

```
Criterios de aceptación actuales:
1. CA-1: Inicio de sesión con email/password
2. CA-2: Mensaje de error en fallo
3. CA-3: Redirección tras éxito

¿Acción? (a)gregar, (m)odificar, (e)liminar, (q) salir
> a

Nuevo criterio (formato Gherkin):
DADO:
CUANDO:
ENTONCES:
```

### Pasos

1. Validar que la US existe
2. Leer archivo actual
3. Modificar campo solicitado
4. Actualizar fecha de modificación
5. Guardar archivo
6. Actualizar EPIC padre si cambió
7. Actualizar índice

## Formato de salida

```
✅ User Story actualizada!

📖 US-001: Inicio de sesión de usuario

Modificación:
  Puntos: 5 → 8

⚠️ Advertencia: 8 puntos es el máximo recomendado.
   Considere dividir esta US si es demasiado compleja.

Archivo: project-management/backlog/user-stories/US-001-user-login.md
```

## Cambio de EPIC

Si se cambia el EPIC padre:

```
✅ User Story movida!

📖 US-001: Inicio de sesión de usuario

Modificación:
  EPIC: EPIC-001 → EPIC-002

Actualizaciones:
  - EPIC-001: US eliminada de la lista
  - EPIC-002: US agregada a la lista
  - Índice: Actualizado
```

## Ejemplos

```
# Modo interactivo
/project:update-story US-001

# Cambiar puntos
/project:update-story US-001 points 3

# Cambiar EPIC
/project:update-story US-001 epic EPIC-002

# Cambiar nombre
/project:update-story US-001 name "Inicio de sesión con SSO"
```

## Validación

- Puntos: Fibonacci (1, 2, 3, 5, 8)
- Si puntos > 8: Advertencia para dividir
- EPIC: Debe existir
- Persona: Debe estar definida en personas.md
