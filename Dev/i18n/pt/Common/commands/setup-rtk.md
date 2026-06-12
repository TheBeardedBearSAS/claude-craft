---
description: Configurar RTK e otimização de tokens para o Claude Code
argument-hint: [--check]
---

# Configuração de Otimização de Tokens

Configurar RTK (Rust Token Killer) e otimização abrangente de tokens para sessões do Claude Code.

## Passos

### 1. Verificar instalação do RTK

```bash
# Verificar se o RTK está instalado
if command -v rtk &>/dev/null; then
  echo "RTK instalado: $(rtk --version)"
  echo ""
  rtk gain 2>/dev/null || echo "Sem dados de economia ainda"
else
  echo "RTK NÃO está instalado"
  echo ""
  echo "Opções de instalação (o padrão curl|bash é BLOQUEADO pelos hooks do Claude Craft):"
  echo "  1. (Recomendado) make install-rtk    # da raiz do claude-craft"
  echo "  2. cargo install rtk-cli            # se tiver a toolchain Rust"
  echo "  3. Baixar o binário manualmente: https://github.com/rtk-ai/rtk/releases"
fi
```

### 2. Configurar otimizações RTK

Se o RTK estiver instalado, aplicar estas otimizações:

#### a) Ativar modo ultra-compact

Verificar o hook em `~/.claude/hooks/rtk-rewrite.sh`. O comando de reescrita deve usar `--ultra-compact`:

```bash
REWRITTEN=$(rtk rewrite --ultra-compact "$CMD" 2>/dev/null)
```

Se não tiver `--ultra-compact`, atualizar o ficheiro de hook.

#### b) Otimizar limites do RTK

Verificar `~/.config/rtk/config.toml` e recomendar estes limites:

```toml
[limits]
grep_max_results = 100
grep_max_per_file = 10
status_max_files = 10
status_max_untracked = 5
passthrough_max_chars = 1500
```

#### c) Adicionar filtros personalizados

Verificar `~/.config/rtk/filters.toml`. Se contiver apenas comentários de template, sugerir filtros com base no stack do projeto detectado:

- **Projetos Docker**: Adicionar filtros docker exec, compose, logs
- **Projetos Node.js**: Adicionar filtros npm/npx install
- **Projetos PHP**: Adicionar filtros composer
- **Projetos Python**: Adicionar filtros pip install

### 3. Configurar modelo de Sub-Agent e Forked Subagents

Verificar se ambas as variáveis de ambiente estão definidas:

```bash
echo "CLAUDE_CODE_SUBAGENT_MODEL=${CLAUDE_CODE_SUBAGENT_MODEL:-NÃO DEFINIDO}"
echo "CLAUDE_CODE_FORK_SUBAGENT=${CLAUDE_CODE_FORK_SUBAGENT:-NÃO DEFINIDO}"
```

Se não estiverem definidas, recomendar adicionar a `~/.bashrc` (ou `~/.zshrc`):

```bash
# Usar Sonnet 4.6 para sub-agents (exploração, grep, leitura de ficheiros) em vez de Opus
# → 40-60% de redução de custo nas invocações de sub-agents
export CLAUDE_CODE_SUBAGENT_MODEL="sonnet"

# Executar sub-agents em contextos isolados (Claude Code 2.1.117+, ver COMPATIBILITY.md)
# → Evita poluir a janela de contexto principal com o estado intermédio dos sub-agents
# → Combina com context: fork em skills (~8-15K tokens poupados por sessão longa)
export CLAUDE_CODE_FORK_SUBAGENT=1

# Ativar TTL de cache de prompt de 1 hora (Claude Code 2.1.108+)
# → -40% de custo em sessões repetitivas (sprints BMAD, loops /team:*)
# → A mesma chave de cache de prompt é reutilizada até 1h em vez do padrão 5min
export ENABLE_PROMPT_CACHING_1H=1

# Forçar escritas de cache de 5 minutos em cada turno (Claude Code 2.1.108+)
# → Útil para loops de desenvolvimento curtos que atingem o cache repetidamente
# → Trade-off: pequena sobrecarga de escrita, grandes ganhos na taxa de acerto em trabalho iterativo
export FORCE_PROMPT_CACHING_5M=1
```

Após atualizar, recarregar o shell: `source ~/.bashrc`.

### 4. Configurar Hooks

Verificar os hooks atuais no settings.json:

| Hook | Propósito | Estado |
|------|-----------|--------|
| **PreToolUse** (Bash) | Reescrita RTK | Verificar se configurado |
| **PostToolUse** (Bash) | Filtragem de output | Verificar se configurado |
| **PreCompact** | Preservação de contexto | Verificar se configurado |
| **SessionStart** (compact) | Reinjection de contexto | Verificar se configurado |

Para hooks em falta, referenciar os templates em `.claude/templates/hooks/`:
- `output-filter.json` — PostToolUse para filtragem de outputs grandes
- `pre-compact.json` — PreCompact para preservação de contexto
- `context-reinject.json` — SessionStart para reinjection pós-compaction
- `post-compact.json` — PostCompact para restauração de contexto após compaction

#### Hook PostCompact — Restauração de Contexto

O hook **PostCompact** (Claude Code v2.1.76+) reinjecta contexto crítico após um evento de compaction automático. Sem ele, o Claude pode perder o rasto de tarefas ativas, caminhos de ficheiros e decisões tomadas anteriormente na sessão.

Template: `.claude/templates/hooks/post-compact.json`

O hook lê `context-essentials.md` (um ficheiro mantido com o estado da sessão atual) e injeta-o como mensagem de sistema após a compaction. Combinar com o hook **PreCompact** (`pre-compact.json`) que guarda os essenciais antes da compaction.

Economia estimada: evita 5-15 turnos de re-explicação por sessão longa (~3-8K tokens).

### 5. Resumo

Mostrar uma tabela de resumo de todas as otimizações com o seu estado:

| Otimização | Economia Esperada | Estado |
|---|---|---|
| RTK instalado + hooks | 60-90% no output CLI | ? |
| RTK ultra-compact | +5-10% adicional | ? |
| RTK limites otimizados | grep 19% -> 40-50% | ? |
| RTK filtros personalizados | +30-50% em docker/npm | ? |
| Modelo sub-agent (Sonnet) | 40-60% redução de custo | ? |
| Sub-agents isolados (`CLAUDE_CODE_FORK_SUBAGENT=1`) | 8-15K tokens/sessão longa | ? |
| Cache prompts 1h (`ENABLE_PROMPT_CACHING_1H=1`) | -40% custo em sessões repetitivas | ? |
| Forçar escritas cache 5min (`FORCE_PROMPT_CACHING_5M=1`) | Maior taxa de acerto em loops iterativos | ? |
| Hook PostToolUse | Reduz poluição de contexto | ? |
| Hook PreCompact | Preserva contexto crítico | ? |
| Hook PostCompact | Restaura contexto após compaction | ? |

**Objetivo: 60-75% de eficiência total de tokens (com cache 1h + ultra-compact + forked subagents)**

## Argumentos

- `$ARGUMENTS` — Passar `--check` para apenas mostrar o estado atual sem fazer alterações
