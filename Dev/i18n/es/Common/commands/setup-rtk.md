---
description: Instalar y configurar RTK (Rust Token Killer) para optimizacion de tokens
argument-hint: [--install|--check|--uninstall]
---

# Setup RTK (Optimizador de Tokens)

Instalar y configurar RTK para reducir el consumo de tokens de Claude Code en un 60-90%.

## Plan Mode

> **No requiere plan mode.** Este comando ejecuta un script de instalacion determinista.

## Execution

### Fase 1: Verificacion de prerequisitos

Verificar que las herramientas requeridas estan disponibles:

```
╔══════════════════════════════════════════════════════════════╗
║              RTK - Configuracion Optimizador de Tokens       ║
╚══════════════════════════════════════════════════════════════╝

Prerequisitos:
  ✓ jq instalado
  ✓ curl instalado
```

Si faltan prerequisitos, mostrar instrucciones de instalacion y detener.

### Fase 2: Instalacion del binario RTK

Verificar si RTK ya esta instalado (`command -v rtk`). Si no, instalar via el instalador oficial:

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

Verificar la instalacion con `rtk --version`.

### Fase 3: Configuracion de hooks

Ejecutar `rtk init -g --no-patch` para crear:
- `~/.claude/hooks/rtk-rewrite.sh` — El script hook PreToolUse
- `~/.claude/RTK.md` — Referencia de configuracion RTK

Luego **fusionar de forma segura** el hook en `~/.claude/settings.json`:
- Respaldo de settings.json antes de modificar
- Agregar hook RTK al array `.hooks.PreToolUse[]`
- Preservar todos los hooks existentes (seguridad, etc.)
- Omitir si ya esta presente (idempotente)

### Fase 4: Verificacion

Verificar que todos los componentes estan correctamente instalados.

## Modos

| Modo | Comportamiento |
|------|---------------|
| `--install` (defecto) | Instalacion completa: binario + hooks + fusion settings |
| `--check` | Verificar estado de instalacion RTK y ahorros |
| `--uninstall` | Eliminar hooks RTK de settings.json (conserva binario) |

## Ejemplos

```bash
/common:setup-rtk
/common:setup-rtk --check
/common:setup-rtk --uninstall
```

## Implementacion

```bash
bash Tools/RTK/install-rtk.sh --lang=$RULES_LANG $ARGUMENTS
```
