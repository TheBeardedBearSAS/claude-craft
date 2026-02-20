---
description: Instalar e configurar RTK (Rust Token Killer) para otimizacao de tokens
argument-hint: [--install|--check|--uninstall]
---

# Setup RTK (Otimizador de Tokens)

Instalar e configurar RTK para reduzir o consumo de tokens do Claude Code em 60-90%.

## Plan Mode

> **Nao requer plan mode.** Este comando executa um script de instalacao deterministico.

## Execucao

### Fase 1: Verificacao de pre-requisitos

Verificar que as ferramentas necessarias estao disponiveis:

```
╔══════════════════════════════════════════════════════════════╗
║              RTK - Configuracao Otimizador de Tokens         ║
╚══════════════════════════════════════════════════════════════╝

Pre-requisitos:
  ✓ jq instalado
  ✓ curl instalado
```

Se faltarem pre-requisitos, mostrar instrucoes de instalacao e parar.

### Fase 2: Instalacao do binario RTK

Verificar se RTK ja esta instalado (`command -v rtk`). Se nao, instalar via instalador oficial:

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

Verificar instalacao com `rtk --version`.

### Fase 3: Configuracao dos hooks

Executar `rtk init -g --no-patch` para criar:
- `~/.claude/hooks/rtk-rewrite.sh` — O script hook PreToolUse
- `~/.claude/RTK.md` — Referencia de configuracao RTK

Depois **mesclar com seguranca** o hook em `~/.claude/settings.json`:
- Backup de settings.json antes da modificacao
- Adicionar hook RTK ao array `.hooks.PreToolUse[]`
- Preservar todos os hooks existentes (seguranca, etc.)
- Pular se ja presente (idempotente)

### Fase 4: Verificacao

Verificar que todos os componentes estao corretamente instalados.

## Modos

| Modo | Comportamento |
|------|--------------|
| `--install` (padrao) | Instalacao completa: binario + hooks + mesclagem settings |
| `--check` | Verificar status de instalacao RTK e economias |
| `--uninstall` | Remover hooks RTK do settings.json (mantem binario) |

## Exemplos

```bash
/common:setup-rtk
/common:setup-rtk --check
/common:setup-rtk --uninstall
```

## Implementacao

```bash
bash Tools/RTK/install-rtk.sh --lang=$RULES_LANG $ARGUMENTS
```
