---
description: "Auditoría Ruby/Rails por eje: architecture, code-quality, security, testing, o all (agregado con puntuación)"
argument-hint: "<architecture|code-quality|security|testing|all> [ruta]"
---

# Verificación Ruby

## Argumentos

$ARGUMENTS

El primer argumento es el eje; el resto (por ejemplo, la ruta de un proyecto) se transmite tal cual. Sin eje, ejecuta `all`.

| Eje | Checklist que seguir |
|-----|----------------------|
| `architecture` | `.claude/references/ruby/checks/architecture.md` |
| `code-quality` | `.claude/references/ruby/checks/code-quality.md` |
| `security` | `.claude/references/ruby/checks/security.md` |
| `testing` | `.claude/references/ruby/checks/testing.md` |
| `all` | `.claude/references/ruby/checks/all.md`: los 4 ejes y luego un informe consolidado puntuado sobre 100 |

## MISIÓN

1. Lee el primer argumento. Si no corresponde a ninguno de los 5 ejes anteriores, enuméralos con un ejemplo (`/ruby:check security app/`) y detente.
2. Lee el archivo de checklist de ese eje y síguelo paso a paso. En ese archivo, `$ARGUMENTS` designa los argumentos que siguen al eje.
3. Genera el informe en el formato de salida que define la checklist.

Ejemplos: `/ruby:check architecture`, `/ruby:check testing ./app`, `/ruby:check all`.
