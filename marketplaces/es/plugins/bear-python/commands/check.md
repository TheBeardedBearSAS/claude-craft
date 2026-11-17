---
description: "Auditoría Python por eje: architecture, code-quality, security, testing, o all (agregado con puntuación)"
argument-hint: "<architecture|code-quality|security|testing|all> [ruta]"
---

# Verificación Python

## Argumentos

$ARGUMENTS

El primer argumento es el eje; el resto (por ejemplo, la ruta de un proyecto) se transmite tal cual. Sin eje, ejecuta `all`.

| Eje | Checklist que seguir |
|-----|----------------------|
| `architecture` | `${CLAUDE_PLUGIN_ROOT}/references/python/checks/architecture.md` |
| `code-quality` | `${CLAUDE_PLUGIN_ROOT}/references/python/checks/code-quality.md` |
| `security` | `${CLAUDE_PLUGIN_ROOT}/references/python/checks/security.md` |
| `testing` | `${CLAUDE_PLUGIN_ROOT}/references/python/checks/testing.md` |
| `all` | `${CLAUDE_PLUGIN_ROOT}/references/python/checks/all.md`: los 4 ejes y luego un informe consolidado puntuado sobre 100 |

## MISIÓN

1. Lee el primer argumento. Si no corresponde a ninguno de los 5 ejes anteriores, enuméralos con un ejemplo (`/bear-python:check security src/`) y detente.
2. Lee el archivo de checklist de ese eje y síguelo paso a paso. En ese archivo, `$ARGUMENTS` designa los argumentos que siguen al eje.
3. Genera el informe en el formato de salida que define la checklist.

Ejemplos: `/bear-python:check architecture`, `/bear-python:check testing ./app`, `/bear-python:check all`.
