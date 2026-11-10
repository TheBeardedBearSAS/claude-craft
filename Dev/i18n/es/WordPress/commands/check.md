---
description: "Auditoría WordPress por eje: architecture, code-quality, security, testing, o all (agregado con puntuación)"
argument-hint: "<architecture|code-quality|security|testing|all> [ruta]"
---

# Verificación WordPress

## Argumentos

$ARGUMENTS

El primer argumento es el eje; el resto (por ejemplo, la ruta de un proyecto) se transmite tal cual. Sin eje, ejecuta `all`.

| Eje | Lista de verificación a seguir |
|------|---------------------|
| `architecture` | `.claude/references/wordpress/checks/architecture.md` |
| `code-quality` | `.claude/references/wordpress/checks/code-quality.md` |
| `security` | `.claude/references/wordpress/checks/security.md` |
| `testing` | `.claude/references/wordpress/checks/testing.md` |
| `all` | `.claude/references/wordpress/checks/all.md`: los 4 ejes, luego un informe consolidado puntuado sobre 100 |

## MISIÓN

1. Lee el primer argumento. Si no es uno de los 5 ejes anteriores, enuméralos con un ejemplo (`/wordpress:check security wp-content/plugins/my-plugin`) y detente.
2. Lee el archivo de la lista de verificación de ese eje y síguelo paso a paso. En ese archivo, `$ARGUMENTS` representa los argumentos que siguen al eje.
3. Produce el informe en el formato de salida que define la lista de verificación.

Ejemplos: `/wordpress:check architecture`, `/wordpress:check testing ./my-plugin`, `/wordpress:check all`.
