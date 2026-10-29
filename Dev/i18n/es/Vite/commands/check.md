---
description: "Auditoría Vite por eje: architecture, code-quality, security, testing, o all (agregado con puntuación)"
argument-hint: "<architecture|code-quality|security|testing|all> [ruta]"
---

# Verificación Vite

## Argumentos

$ARGUMENTS

El primer argumento es el eje; el resto (por ejemplo, la ruta de un proyecto) se transmite tal cual. Sin eje, ejecuta `all`.

| Eje | Checklist que seguir |
|-----|----------------------|
| `architecture` | `.claude/references/vite/checks/architecture.md` |
| `code-quality` | `.claude/references/vite/checks/code-quality.md` |
| `security` | `.claude/references/vite/checks/security.md` |
| `testing` | `.claude/references/vite/checks/testing.md` |
| `all` | `.claude/references/vite/checks/all.md`: los 4 ejes y luego un informe consolidado puntuado sobre 100 |

## MISIÓN

1. Lee el primer argumento. Si no corresponde a ninguno de los 5 ejes anteriores, enuméralos con un ejemplo (`/vite:check security src/`) y detente.
2. Lee el archivo de checklist de ese eje y síguelo paso a paso. En ese archivo, `$ARGUMENTS` designa los argumentos que siguen al eje.
3. Genera el informe en el formato de salida que define la checklist.

Ejemplos: `/vite:check architecture`, `/vite:check testing ./app`, `/vite:check all`.
