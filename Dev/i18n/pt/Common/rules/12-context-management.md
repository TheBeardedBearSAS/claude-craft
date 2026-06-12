# Gestao de Contexto

## Visao Geral

A janela de contexto e **O recurso critico** no Claude Code. Cada token conta. Uma gestao eficaz do contexto e a diferenca entre um assistente produtivo e um que perde o fio.

> **Fonte:** Recomendacao #1 da Anthropic — "The context window is the single most important resource to manage."

**Principios:**
- O contexto e um recurso finito e precioso
- CLAUDE.md e as regras competem pela atencao do modelo
- Usar sub-agentes para as investigacoes
- Limpar o contexto entre tarefas

---

## Sumario

1. [Regras de tamanho CLAUDE.md](#regras-de-tamanho-claudemd)
2. [Limpeza do contexto](#limpeza-do-contexto)
3. [Sub-agentes para investigacoes](#sub-agentes-para-investigacoes)
4. [Context compaction](#context-compaction)
5. [Loops de verificacao](#loops-de-verificacao)
6. [Plan Mode](#plan-mode)
7. [Rastreamento de tokens](#rastreamento-de-tokens)
8. [Checklist](#checklist)
9. [Compaction hints no CLAUDE.md](#compaction-hints-no-claudemd)
10. [CLAUDE.local.md para preferencias pessoais](#claudelocalmd-para-preferencias-pessoais)
11. [Anti-padroes de contexto](#anti-padroes-de-contexto)
12. [Boas praticas de redacao CLAUDE.md](#boas-praticas-de-redacao-claudemd)
13. [Otimizacao de desempenho](#otimizacao-de-desempenho)
14. [Padroes de comunicacao](#padroes-de-comunicacao)
15. [Novos comandos de contexto](#novos-comandos-de-contexto)
16. [Agent frontmatter](#agent-frontmatter)
17. [Managed settings](#managed-settings)
18. [Monitor e eventos em segundo plano](#monitor-e-eventos-em-segundo-plano)

---

## Regras de tamanho CLAUDE.md

### Limite recomendado

> **CLAUDE.md principal: 150-200 linhas maximo.**
> Cada instrucao adicional dilui a atencao nas instrucoes existentes.

### Estrategia de modularidade

```
.claude/
  CLAUDE.md              <- Resumo (150-200 linhas max)
  rules/                 <- Regras detalhadas (carregadas sob demanda)
    01-workflow-analysis.md
    04-solid-principles.md
    05-kiss-dry-yagni.md
    ...
  references/            <- Documentacao tecnica
  skills/                <- Competencias sob demanda
```

### Boas praticas

| Pratica | Descricao |
|---------|-----------|
| **CLAUDE.md curto** | Visao geral, links para regras |
| **Regras modulares** | Um arquivo por tema em `.claude/rules/` |
| **Referencias separadas** | Docs tecnicos em `.claude/references/` |
| **Skills sob demanda** | Competencias carregadas apenas quando necessarias |

### O que vai no CLAUDE.md vs Rules

| Conteudo | Localizacao |
|----------|-------------|
| Tecnologias suportadas | CLAUDE.md |
| Comandos disponiveis | CLAUDE.md |
| Agentes disponiveis | CLAUDE.md |
| Compatibilidade Claude Code | CLAUDE.md |
| Principios SOLID detalhados | `.claude/rules/04-solid-principles.md` |
| Regras de seguranca | `.claude/rules/11-security.md` |
| Workflow de analise | `.claude/rules/01-workflow-analysis.md` |

---

## Limpeza do contexto

### Quando usar `/clear`

```
Usar /clear:
- Entre duas tarefas NAO relacionadas
- Apos uma longa investigacao
- Quando o contexto ultrapassa 50% da janela
- Antes de comecar uma nova feature

NAO usar /clear:
- No meio de uma tarefa em andamento
- Se o contexto anterior e necessario
- Logo apos carregar arquivos relevantes
```

### Sinais de poluicao do contexto

- Claude repete informacoes ja fornecidas
- As respostas tornam-se menos precisas
- Claude confunde elementos de tarefas diferentes
- Os erros aumentam apesar de instrucoes claras

### Padrao: Investigacao depois implementacao

```
Sessao 1: Investigacao
  -> Ler codigo, entender a arquitetura
  -> Documentar descobertas
  -> /clear

Sessao 2: Implementacao
  -> Carregar apenas os arquivos necessarios
  -> Implementar com um contexto limpo
```

---

## Sub-agentes para investigacoes

### Principio

> **Delegar pesquisas aos sub-agentes para manter o contexto principal limpo.**

Os sub-agentes (ferramenta Task) tem sua propria janela de contexto. Usar um sub-agente para explorar o codebase evita poluir o contexto principal.

### Quando usar um sub-agente

| Situacao | Acao |
|----------|------|
| Buscar arquivo/padrao especifico | Glob/Grep diretamente |
| Explorar arquitetura desconhecida | Sub-agente Explore |
| Investigacao multi-arquivo (> 3) | Sub-agente Explore |
| Planejar uma implementacao | Sub-agente Plan |
| Tarefa independente em paralelo | Sub-agente general-purpose |

### Exemplo

```
# Em vez de ler 20 arquivos no contexto principal:

Task(Explore): "Como funciona a autenticacao neste projeto?
  Liste os arquivos, padroes e dependencias."

# O sub-agente explora e retorna um resumo
# O contexto principal permanece limpo
```

### Agent frontmatter (v2.1.78+)

Os agentes personalizados suportam campos frontmatter para controlar seu comportamento:

```yaml
---
effort: low          # Nivel de esforco (low/medium/high)
maxTurns: 10         # Numero maximo de turnos
disallowedTools:     # Ferramentas nao permitidas
  - Edit
  - Write
---
```

Esses campos permitem otimizar os custos e o escopo dos sub-agentes.

---

## Context compaction

### Funcionamento

O Claude Code compacta automaticamente o contexto quando se aproxima dos limites da janela. Mensagens antigas sao resumidas para liberar espaco.

### Compactacao proativa

A partir de 70% de contexto usado, executar `/compact` proativamente para evitar uma compactacao automatica nao controlada.

O comando `/memory` (v2.1.59+) permite salvar aprendizados persistentes de sessao que sobrevivem as compactacoes e novas sessoes.

### Hook PreCompact

Usar o hook `PreCompact` para salvar o contexto critico antes de uma compactacao:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Hook PostCompact

Usar o hook `PostCompact` (v2.1.76+) para re-injetar o contexto critico apos uma compactacao:

```json
{
  "hooks": {
    "PostCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

A partir da v2.1.105, o hook `PreCompact` pode **bloquear** a compactacao via codigo de saida 2, permitindo controlar quando a compactacao ocorre.

### Hooks de re-injecao

Usar o hook `SessionStart` com o matcher `compact` para re-injetar o contexto critico apos uma compactacao:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Preparar o contexto essencial

Criar um arquivo `.claude/context-essentials.md` com:
- Decisoes arquiteturais chave
- Convencoes do projeto
- Tarefas em andamento
- Restricoes criticas

---

## Loops de verificacao

### Principio

> **Sempre fornecer meios de verificacao: testes, screenshots, outputs esperados.**
> Fonte: "2-3x improvement in final result quality" (Anthropic)

### Padrao: Especificacao-Implementacao-Verificacao

```
1. ESPECIFICACAO
   -> Definir o comportamento esperado
   -> Fornecer exemplos de input/output
   -> Escrever testes primeiro (TDD)

2. IMPLEMENTACAO
   -> Codificar a solucao

3. VERIFICACAO
   -> Executar testes
   -> Comparar com outputs esperados
   -> Corrigir se necessario
   -> Repetir ate satisfacao
```

### Exemplos de loops eficazes

```
Loop TDD:
  teste (RED) -> codigo (GREEN) -> refactor -> teste (GREEN)

Loop UI:
  screenshot antes -> modificacao -> screenshot depois -> comparar

Loop API:
  spec OpenAPI -> implementacao -> teste curl -> comparar resposta

Loop CI:
  modificar codigo -> executar testes -> corrigir falhas -> re-executar
```

### Anti-padroes

```
NAO FAZER:
- Implementar sem testes
- Supor que funciona sem verificar
- Ignorar erros de testes
- Passar para a proxima tarefa sem verificacao
```

---

## Plan Mode

### Quando investir em planejamento

| Situacao | Acao |
|----------|------|
| Bug simples, 1 arquivo | Corrigir diretamente |
| Feature simples, < 3 arquivos | Implementar diretamente |
| Feature complexa, > 3 arquivos | Plan Mode |
| Refactoring arquitetural | Plan Mode |
| Escolha tecnologica | Plan Mode |
| Impacto incerto | Plan Mode |

### Vantagens do Plan Mode

- Explorar o codebase antes de agir
- Identificar arquivos impactados
- Propor uma abordagem antes de implementar
- Evitar retrabalho

---

## Rastreamento de tokens

### Linha de status

A linha de status do Claude Code exibe a porcentagem de contexto utilizado. Monitorar este indicador para antecipar compactacoes.

### Limites de acao

| Contexto usado | Acao |
|----------------|------|
| < 30% | Normal, continuar |
| 30-60% | Monitorar, evitar leituras desnecessarias |
| 60-80% | Delegar a sub-agentes, considerar /clear |
| > 80% | Compactacao iminente, salvar contexto critico |

### Comando /context (v2.1.74+)

O comando `/context` fornece sugestoes acionaveis para otimizar o uso do contexto. Usar regularmente para identificar fontes de desperdicio.

### Comando /effort (v2.1.72+)

Ajustar o nível de esforço do modelo de acordo com a complexidade da tarefa:

| Comando | Modelo | Uso |
|---------|--------|-----|
| `/effort low` | Haiku 4.5 | Tarefas simples, lookups, classificação |
| `/effort medium` | Sonnet 4.6 | Implementação padrão |
| `/effort high` | Opus 4.8 | Raciocínio complexo, arquitetura |
| `/effort xhigh` | Opus 4.8 (extended thinking, v2.1.111+) | Decisões críticas, migrações complexas, ADR |
| `/effort ultracode` | Opus 4.8 (v2.1.154+, Dynamic Workflows) | Modo de máximo débito de código — pipelines automatizados, geração massiva |

### Alerta de inatividade (v2.1.84+)

Apos 75+ minutos de inatividade, Claude sugere automaticamente `/clear` para evitar um contexto obsoleto.

### Estrategia multi-sessao

Para tarefas complexas, dividir o trabalho em sessoes curtas e focadas. Cada sessao usa um contexto fresco, reduzindo o consumo de tokens em aproximadamente 55%:

```
Sessao 1: Investigacao (ler, analisar, documentar)
  -> /memory para salvar conclusoes
  -> /clear

Sessao 2: Implementacao (codificar, testar)
  -> O /memory anterior e carregado automaticamente
  -> Contexto fresco, sem poluicao
```

### Tarefas agendadas /loop (v2.1.71+)

O comando `/loop` permite agendar tarefas recorrentes:

```bash
/loop 5m /common:pre-commit-check    # Verificar a cada 5 minutos
/loop "Monitorar testes CI"           # Auto-cadencia pelo modelo
```

Alias: `/proactive` (v2.1.105+).

---

## Worktrees paralelas

### Principio

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

Usar `git worktree` para trabalhar em multiplas branches simultaneamente com sessoes Claude independentes.

### Setup

Desde v2.1.53+, Claude Code suporta o flag nativo `--worktree` (`-w`) para criar e trabalhar em worktrees isoladas:

```bash
# Flag nativo (v2.1.53+) — cria uma worktree isolada automaticamente
claude --worktree "Implementar autenticacao JWT"
claude -w "Revisar o codigo de autenticacao"

# Metodo manual (todas as versoes)
git worktree add ../feature-auth feature/auth
cd ../feature-auth && claude

git worktree add ../review-auth feature/auth
cd ../review-auth && claude
```

### Padrao Writer/Reviewer

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "Implementar autenticacao JWT"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Revisar o codigo de autenticacao"
  # Contexto fresco, sem vies de autor
```

### Limpeza

```bash
git worktree remove ../feature-auth
git worktree remove ../review-auth
```

### Recomendacoes

- 3-5 worktrees maximo
- Uma worktree = uma tarefa
- Remover worktrees concluidas
- Nao compartilhar sessoes entre worktrees

---

## Checklist

### Antes de cada sessao

- [ ] CLAUDE.md < 200 linhas
- [ ] Regras modulares em `.claude/rules/`
- [ ] Contexto limpo (sem residuos de tarefas anteriores)

### Durante a sessao

- [ ] Monitorar % de contexto
- [ ] Delegar investigacoes a sub-agentes
- [ ] `/clear` entre tarefas nao relacionadas
- [ ] Fornecer testes/outputs esperados

### Para tarefas complexas

- [ ] Usar Plan Mode
- [ ] Decompor em sub-tarefas
- [ ] Worktrees para paralelismo
- [ ] Loops de verificacao

---

## Compaction hints no CLAUDE.md

### Principio

> **Indicar ao Claude o que deve preservar durante uma compactacao.**

Adicionar instrucoes de compactacao no CLAUDE.md para guiar o resumo durante a compactacao automatica:

```markdown
# No CLAUDE.md:
Durante a compactacao, sempre preservar:
- A lista de arquivos modificados
- Os comandos de teste
- As decisoes de arquitetura
```

### Variáveis de ambiente úteis

| Variável | Descrição |
|----------|-----------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Modelo **padrão** para sub-agentes sem tipo (ex: `sonnet`). **O frontmatter `model:` de um agente tem prioridade**: 11 revisores com `model: haiku` permanecem no Haiku mesmo com esta variável em `sonnet`. |
| `CLAUDE_CODE_FORK_SUBAGENT` | `1` para isolar o contexto dos sub-agentes (forked subagents, v2.1.117+) |
| `ENABLE_PROMPT_CACHING_1H` / `FORCE_PROMPT_CACHING_5M` | Ampliar/forçar o prompt caching (−40 % em sessões repetitivas) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Definir como `1` para desativar a memória automática |

> **Precedência de modelos (auditoria 2026-06-08):** `model:` no frontmatter do agente > `CLAUDE_CODE_SUBAGENT_MODEL` > modelo de sessão. A variável `SUBAGENT_MODEL=sonnet` NÃO sobrescreve agentes explicitamente com `model: haiku` — aplica-se apenas a sub-agentes sem `model:` definido.

---

## CLAUDE.local.md para preferencias pessoais

### Principio

Criar um arquivo `CLAUDE.local.md` na raiz do projeto (gitignore) para preferencias pessoais que nao devem ser compartilhadas com a equipe.

```
projeto/
  .claude/CLAUDE.md      <- Compartilhado (git)
  CLAUDE.local.md        <- Pessoal (gitignore)
```

### Conteudo tipico

- Preferencias de estilo pessoal
- Caminhos locais especificos
- Ferramentas pessoais preferidas

### Configuracao

Adicionar no `.gitignore`:
```
CLAUDE.local.md
```

---

## Anti-padroes de contexto

| Anti-padrao | Descricao | Solucao |
|-------------|-----------|---------|
| **Kitchen-sink session** | Fazer tudo em uma unica sessao | `/clear` entre tarefas, sub-agentes |
| **CLAUDE.md sobrecarregado** | > 200 linhas dilui a atencao | Modularizar em `.claude/rules/` |
| **Sobre-correcao** | Correcoes sucessivas poluem o contexto | Apos 2 falhas, `/clear` e reformular |
| **Trust-then-verify gap** | Implementar sem verificar | Loops TDD, testes antes do codigo |
| **Exploracao infinita** | Ler muitos arquivos sem objetivo | Definir o escopo antes de explorar |

---

## Boas praticas de redacao CLAUDE.md

### Preferir ponteiros sobre copias

Nao copiar codigo no CLAUDE.md — ele se torna obsoleto. Usar a sintaxe `@caminho` para referenciar arquivos:

```markdown
# No CLAUDE.md:
Ver @.claude/references/symfony/CLAUDE.md para as convencoes Symfony.
Ver @docs/API.md para a documentacao da API.
```

### Enfase para regras criticas

Usar `IMPORTANT`, `VOCE DEVE`, `NUNCA` para restricoes nao negociaveis:

```markdown
IMPORTANT: Nunca modificar as migracoes existentes.
VOCE DEVE executar os testes antes de cada commit.
NUNCA secrets no codigo fonte.
```

### Hierarquia de arquivos CLAUDE.md

| Arquivo | Escopo | Uso |
|---------|--------|-----|
| `~/.claude/CLAUDE.md` | Global (todos os projetos) | Preferencias pessoais universais |
| `.claude/CLAUDE.md` ou `./CLAUDE.md` | Projeto (git) | Convencoes da equipe |
| `CLAUDE.local.md` | Projeto (gitignore) | Preferencias pessoais do projeto |

### Manutencao regular

- Revisar CLAUDE.md a cada trimestre
- Para cada linha, perguntar: "Se eu remover esta linha, Claude cometera erros?"
- Se nao, remover a linha
- Tratar CLAUDE.md como codigo de producao

---

## Otimizacao de desempenho

### CLI nativos em vez de MCPs

Preferir ferramentas CLI nativas (Glob, Grep, Read, Edit) sobre equivalentes MCP. Os servidores MCP adicionam definicoes de ferramentas persistentes a cada turno, consumindo contexto permanentemente.

| Abordagem | Custo de contexto |
|-----------|-------------------|
| Ferramenta nativa (Glob, Grep) | 0 tokens adicionais |
| Servidor MCP | ~500-2000 tokens/ferramenta/turno |
| CLI externo (gh, aws) | Pontual, via Bash |

### MCP Tool Search (v2.1.80+)

`ToolSearch` permite o carregamento preguicoso (lazy loading) de ferramentas MCP, reduzindo o consumo de contexto em **95%**:

| Abordagem | Custo de contexto |
|-----------|-------------------|
| MCP classico (todas as ferramentas carregadas) | ~500-2000 tokens/ferramenta/turno |
| MCP com Tool Search (lazy loading) | ~50 tokens no total |

Usar `ToolSearch` com `query: "select:tool_name"` para carregar uma ferramenta sob demanda.

### Flag --bare (v2.1.81+)

Para chamadas com scripts usando `-p`, usar `--bare` para ignorar hooks, LSP e sincronizacao de plugins:

```bash
claude --bare -p "Analisar este arquivo" < input.txt
```

Reducao significativa do tempo de inicializacao para automacao.

### Monitor tool (v2.1.98+)

A ferramenta `Monitor` permite fazer streaming de eventos de um processo em segundo plano. Cada linha stdout e uma notificacao. Usar em vez de `sleep` + poll para aguardar a finalizacao de um processo.

### Troca de modelo em sessao

Usar `/model` para trocar de modelo de acordo com a complexidade da tarefa:

| Comando | Modelo | Uso |
|---------|--------|-----|
| `/model haiku` | Haiku 4.5 | Tarefas simples, classificação |
| `/model sonnet` | Sonnet 4.6 | Tarefas padrão, implementação |
| `/model opus` | Opus 4.8 | Raciocínio complexo, arquitetura |
| `/model opusplan` | Opus 4.8 (plano) / Sonnet 4.6 (execução) | **Tiering dinâmico**: Opus para o Plan Mode, Sonnet para a execução — otimiza a relação custo/qualidade em tarefas longas |

### Filtragem de saida via hooks PostToolUse

Usar hooks PostToolUse para filtrar saidas verbosas antes que Claude as processe:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "command": "echo '$TOOL_OUTPUT' | grep -A 5 -E '(FAIL|ERROR|WARN)' || echo 'All clear'"
    }]
  }
}
```

Reducao potencial: 90%+ para logs verbosos.

### Plugins Code Intelligence

Para linguagens tipadas, uma unica chamada `go-to-definition` substitui multiplos grep + leituras de arquivos:

- PHP: `php-lsp` (Intelephense)
- TypeScript: `typescript-lsp` (vtsls)
- Python: `pyright-lsp`
- Dart: `dart-analyzer`
- C#: `csharp-lsp`

---

## Padroes de comunicacao

### Padrao Entrevista

Para features complexas, pedir ao Claude para entrevista-lo antes de codificar:

```
"Quero implementar [descricao]. Entreviste-me em detalhe.
Faca perguntas sobre a implementacao tecnica, casos limites,
restricoes e compromissos. Continue ate ter uma visao
completa, depois escreva a especificacao em SPEC.md."
```

Resultado: especificacao completa antes da implementacao, contexto limpo.

### Estrutura CIF (Context, Intent, Format)

Estruturar os prompts para maximizar a precisao:

| Elemento | Descricao | Exemplo |
|----------|-----------|---------|
| **Context** | Situacao atual | "No modulo auth, o token JWT expira apos 15min" |
| **Intent** | Objetivo preciso | "Adicionar refresh token com rotacao" |
| **Format** | Formato de saida esperado | "Gerar o servico + testes unitarios" |

### Padrao Writer/Reviewer

Usar duas sessoes para melhor qualidade (ver tambem [Worktrees paralelas](#worktrees-paralelas)):

- **Sessao A (Writer):** Implementa a feature
- **Sessao B (Reviewer):** Revisa com contexto fresco (sem vies de autor)
- **Sessao A:** Integra o feedback

---

## Managed settings (v2.1.83+)

### Diretorio managed-settings.d/

O diretorio `managed-settings.d/` permite uma configuracao modular por fusao alfabetica:

```
.claude/
  managed-settings.d/
    00-base.json          <- Configuracao base
    10-security.json      <- Regras de seguranca
    20-team.json          <- Preferencias da equipe
```

Os arquivos sao fundidos em ordem alfabetica, permitindo que as equipes sobreponham configuracoes sem conflitos.

---

## Novos comandos (v2.1.105+)

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/btw` | Perguntas rápidas sem troca de contexto | Lookups, sintaxe, esclarecimentos |
| `/hooks` | Gestão interativa de hooks | Ativar/desativar, testar, depurar |
| `/reload-plugins` | Recarregamento manual de plugins | Após atualização de plugins |
| `/reload-skills` (v2.1.157+) | Re-varredura de skills sem reinício (distinto de `/reload-plugins`) | Após adicionar/modificar um skill |
| `/proactive` | Alias para `/loop` | Monitoramento proativo recorrente |

> **⚠️ Trigger Dynamic Workflows renomeado (v2.1.160):** A palavra-chave acionadora mudou de `workflow` para **`ultracode`**. Pedir um workflow "com suas próprias palavras" continua funcionando. O nível `/effort ultracode` (acima) permanece válido.

> **Hook `MessageDisplay` (v2.1.157+):** Novo evento para transformar/ocultar o texto do assistente na exibição — útil para filtragem de saída no estilo RTK. `SessionStart` pode retornar `reloadSkills: true` para disponibilizar os skills que instala na mesma sessão.

---

## Variáveis de ambiente adicionais (v2.1.105+)

| Variável | Descrição |
|----------|-----------|
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | Carregar CLAUDE.md de `--add-dir` |
| `MAX_THINKING_TOKENS=8000` | Limite de tokens de reflexão |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Orçamento de caracteres para slash commands |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` | PowerShell em vez de Bash (Windows, v2.1.84+) |
| `OTEL_LOG_USER_PROMPTS` | Log de prompts em traces (beta) |
| `OTEL_LOG_TOOL_DETAILS` | Log de detalhes de ferramentas (beta) |
| `OTEL_LOG_TOOL_CONTENT` | Log de conteúdo de ferramentas (beta, verboso) |

### `fallbackModel` — fallback automático (settings.json, v2.1.166+)

Configuração de **confiabilidade + custo**: até 3 modelos de fallback tentados em ordem quando o primário está sobrecarregado/indisponível (flag equivalente `--fallback-model`, aplica-se também a sessões interativas).

```json
{ "fallbackModel": ["claude-sonnet-4-6", "claude-haiku-4-5"] }
```

Para os 5 agentes `opus` (security-auditor, database-architect, migration-specialist, ralph-conductor, tdd-coach), este fallback `opus → sonnet → haiku` evita interrupções em picos de carga do Opus sem degradar o trabalho atual. Exemplo pronto em `.claude/settings.local.json.example`.

---

## Skills avancados (v2.1.105+)

| Frontmatter | Descricao |
|-------------|-----------|
| `context: fork` | Execucao em contexto isolado (sem poluicao) |
| `disable-model-invocation: true` | Impede invocacao automatica pelo Claude |
| `claudeMdExcludes` (setting) | Excluir CLAUDE.md especificos em monorepos |

**Auto-compactacao e skills:** Apos compactacao, os skills recarregam automaticamente (5K tokens/skill, 25K total max).

---

## Otimização de tokens — Configuração rápida

> **Comando:** `/common:setup-rtk` para configurar automaticamente todas as otimizações.

**RTK (Rust Token Killer):** Proxy CLI que reduz o consumo de tokens em 60-90 % nos comandos de desenvolvimento. Instalação: `rtk init -g`.

**Modelo sub-agentes:** `export CLAUDE_CODE_SUBAGENT_MODEL="sonnet"` — redução de custo de 40-60 %.

**Hooks de otimização:**

| Hook | Arquivo | Impacto |
|------|---------|---------|
| **PostToolUse** (Bash) | `~/.claude/hooks/post-tool-filter.sh` | Orienta o Claude a resumir outputs >10 KB |
| **PreCompact** | `~/.claude/hooks/pre-compact.sh` | Preserva o contexto crítico antes da compactação |
| **SessionStart** (compact) | Template `context-reinject.json` | Reinjeta `context-essentials.md` após a compactação |

Templates disponíveis em `.claude/templates/hooks/`: `output-filter.json`, `pre-compact.json`, `context-reinject.json`.

| Otimização | Economia |
|---|---|
| RTK + ultra-compact | 60-90 % em outputs CLI |
| SUBAGENT_MODEL=sonnet | 40-60 % custo sub-agentes |
| Hook PostToolUse | Reduz poluição do contexto |
| Hook PreCompact | Evita perda de contexto |
| **Total combinado** | **55-65 % de redução global** |

> Exemplos detalhados e templates: ver `@.claude/references/base/context-management.md`

---

## Ferramentas de terceiros do ecossistema (tokens e contexto)

Além do RTK e dos hooks nativos, o ecossistema do Claude Code oferece ferramentas que cobrem ângulos não tratados nativamente. Nenhuma é incorporada ao Claude Craft: são documentadas e recomendadas.

| Ferramenta | Licença | Ângulo | Rec |
|------------|---------|--------|-----|
| **caveman** | MIT | Compressão das respostas (output) ~65 % | ✅ Integrar |
| **code-review-graph** | MIT | Grafo AST, leitura do blast radius (−38× a −528×) | ✅ Integrar |
| **token-savior** | MIT | Índice simbólico + compactação do Bash (−80 %) | ✅ Integrar |
| **claude-token-efficient** | MIT | Regras CLAUDE.md anti-verbosidade (~63 % output) | ✅ Integrar |
| **context-mode** | ELv2 | Sandbox dos outputs, continuidade pós-compactação | 🔶 Referenciar (licença) |
| **claude-context** | MIT | Busca semântica (requer banco vetorial) | 🔶 Referenciar (infra) |

> Catálogo completo, licenças e receitas de ativação: `@docs/ECOSYSTEM.md`. Auditar e fixar a versão de qualquer ferramenta de terceiros antes de instalar (regra 11).

---

## Recursos

- **Anthropic Best Practices:** [code.claude.com](https://code.claude.com/docs/en/overview)
- **Boris Cherny Workflow:** Worktrees paralelas + loops de verificacao
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agentes
- **`/init`:** Gera automaticamente um CLAUDE.md a partir da analise do projeto
- **CLAUDE.md Authoring:** [Builder.io Guide](https://www.builder.io/blog/claude-md-guide), [HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- **Cost Optimization:** [Anthropic Costs Docs](https://code.claude.com/docs/en/costs)

---

**Ultima atualizacao:** 2026-04
**Versao:** 1.2.0
**Autor:** The Bearded CTO
