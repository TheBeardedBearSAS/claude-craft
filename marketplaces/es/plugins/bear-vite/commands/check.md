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
| `architecture` | `${CLAUDE_PLUGIN_ROOT}/references/vite/checks/architecture.md` |
| `code-quality` | `${CLAUDE_PLUGIN_ROOT}/references/vite/checks/code-quality.md` |
| `security` | `${CLAUDE_PLUGIN_ROOT}/references/vite/checks/security.md` |
| `testing` | `${CLAUDE_PLUGIN_ROOT}/references/vite/checks/testing.md` |
| `all` | `${CLAUDE_PLUGIN_ROOT}/references/vite/checks/all.md`: los 4 ejes y luego un informe consolidado puntuado sobre 100 |

## MISIÓN

1. Lee el primer argumento. Si no corresponde a ninguno de los 5 ejes anteriores, enuméralos con un ejemplo (`/bear-vite:check security src/`) y detente.
2. Lee el archivo de checklist de ese eje y síguelo paso a paso. En ese archivo, `$ARGUMENTS` designa los argumentos que siguen al eje.
3. Genera el informe en el formato de salida que define la checklist.

Ejemplos: `/bear-vite:check architecture`, `/bear-vite:check testing ./app`, `/bear-vite:check all`.
