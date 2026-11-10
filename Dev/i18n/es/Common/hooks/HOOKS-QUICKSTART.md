# Guía de inicio rápido de hooks

Hooks de Claude Code para el control de calidad y la seguridad automatizados, instalados en su proyecto por claude-craft.

## Instalación

1. **Instalar con el instalador** (copia los scripts en `.claude/hooks/` y fusiona los hooks en `.claude/settings.json` sin sobrescribir los suyos):
   ```bash
   bash Dev/scripts/install-common-rules.sh --hooks=default /ruta/del/proyecto
   # o mediante el CLI: npx @the-bearded-bear/claude-craft install . --hooks=default
   ```
   - `--hooks=default` (por defecto): guardas de seguridad, control de secretos, avisos sobre salidas voluminosas, reinyección del contexto tras la compactación.
   - `--hooks=full`: `default` más la puerta de tests Stop, el lint posterior a la edición, la notificación de Slack, las métricas de sesión y las pistas de recuperación tras un fallo de herramienta.
   - `--hooks=none`: sin hooks. Añada `,memory` (p. ej. `--hooks=default,memory`) para el add-on de memoria SQLite entre sesiones (requiere `sqlite3` y `jq`).

2. **Personalizar**: edite los scripts de `.claude/hooks/` según sus herramientas. Volver a ejecutar el instalador nunca elimina ni reescribe sus propios hooks.

3. **Fusionar a mano** si lo prefiere: los fragmentos son `hooks.default.json`, `hooks.full.json` y `hooks.memory.json` (`node <claude-craft>/Dev/scripts/lib/merge-hooks.mjs add --settings .claude/settings.json --fragment <fragmento>`). Se copian ejemplos para adaptar en `.claude/templates/hooks/`.

## Hooks disponibles

| Hook | Función | Evento | Perfil |
|------|---------|--------|--------|
| `guard-network.sh` | Bloquea descargar y ejecutar (`curl \| sh`) | PreToolUse | default |
| `block-dangerous-commands.sh` | Bloquea `rm -rf /`, `sudo`, `chmod 777`... | PreToolUse | default |
| `pre-commit-check.sh` | Bloquea secretos en los commits | PreToolUse | default |
| `protect-sensitive-files.sh` | Bloquea la edición de `.env`, claves... | PreToolUse | default |
| `output-size-hint.sh` | Aconseja resumir las salidas grandes | PostToolUse | default |
| `post-edit-lint.sh` | Lint automático tras editar | PostToolUse | full |
| `quality-gate.sh` | Ejecuta los tests antes de terminar | Stop | full |
| `notify-slack.sh` | Notificaciones de Slack | Notification | full |
| `session-init.sh` | Detecta el stack, exporta variables seguras de `.env.local` | SessionStart | full |
| `session-end.sh` | Registro y métricas de sesión | SessionEnd | full |
| `post-tool-failure.sh` | Pistas de recuperación tras un fallo de herramienta | PostToolUseFailure | full |
| `pre-compact.sh` | Respalda el estado BMAD antes de compactar | PreCompact | opcional (no conectado) |
| `output-filter.sh` | Trunca las salidas de más de 50 KB | PostToolUse | opcional (ejemplo) |

## Conviene saber

- El payload llega como **JSON por stdin**; solo el **código de salida 2** bloquea (cualquier otro código distinto de cero es un error no bloqueante).
- Solo `hookSpecificOutput.additionalContext` llega al modelo; el stdout en texto plano de PreCompact se lee como instrucciones de compactación.
- Los scripts necesitan `jq` o `node` para leer el payload: las guardas de seguridad bloquean si no hay ninguno, los hooks informativos no hacen nada.

## Más información

Documentación completa: [docs/HOOKS.md](/docs/HOOKS.md) y la referencia oficial <https://code.claude.com/docs/en/hooks>.
