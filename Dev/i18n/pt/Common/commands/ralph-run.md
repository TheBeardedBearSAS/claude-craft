---
description: Executar Claude em loop contínuo até a conclusão da tarefa (Ralph Wiggum v2.0)
argument-hint: <task-description> [--auto-detect|--init|--interactive]
---

# Ralph Run - Loop Contínuo de Agente IA v2.0

Executa o Claude em loop contínuo até que a tarefa seja concluída ou os critérios da Definição de Pronto (DoD) sejam atendidos.

## Argumentos

**$ARGUMENTS**

- `<task-description>`: A tarefa a ser concluída pelo Claude
- `--auto-detect`: Detectar automaticamente o tipo de projeto e configurar o DoD
- `--init`: Gerar configuração sem executar
- `--interactive`: Assistente de configuração interativo

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de fazer qualquer alteração.

## Novidades v2.0

| Funcionalidade | Descrição |
|----------------|-----------|
| **Integração de Hooks** | Integração bidirecional com Claude Code 2.1.23+ |
| **Detecção Automática** | Detecção automática do tipo de projeto (Symfony, Flutter, React, etc.) |
| **Painel** | Exibição em terminal em tempo real com barra de progresso |
| **Exportação de Métricas** | Métricas nos formatos JSON e Prometheus |
| **Circuit Breaker Adaptativo** | 5 perfis com aprendizado por histórico |
| **Monitor de Saúde** | Detecção de estagnação, espiral de erros e inchaço de contexto |
| **Templates de DoD** | Templates pré-configurados para 8 tecnologias |

## Processo

### 1. Inicialização da Sessão

1. **Verificar pré-requisitos**:
   - Verificar se o Claude está disponível
   - Verificar configuração `ralph.yml`
   - Inicializar diretório da sessão (`.ralph/`)

2. **Detecção automática do projeto** (se `--auto-detect`):
   - Detectar tipo de projeto (Symfony, Flutter, React, Python, .NET, Go, Rust)
   - Carregar o template de DoD adequado
   - Configurar comandos de teste e lint

3. **Carregar configuração**:
   - Ler `ralph.yml` ou `.claude/ralph.yml`
   - Definir máximo de iterações, timeouts e critérios de DoD
   - Inicializar hooks se habilitados

#### Isolamento de sessões e workers paralelos

- **Sessão Claude explícita**: cada sessão Ralph fixa seu próprio identificador de conversa Claude — `claude --session-id <uuid>` na primeira iteração e depois `claude --resume <uuid>`. O UUID é armazenado em `.ralph/sessions/<session>/claude_session_id`, para que `--continue=<session>` retome a conversa correta. O Ralph não usa mais `claude --continue`, que retomava "a conversa mais recente do diretório" (compartilhada entre workers, ou até com a sessão interativa do usuário).
- **Um worktree git por worker** (modo paralelo, `lib/parallel-manager.sh`): cada história é executada em um worktree dedicado `.ralph/parallel/worktrees/<session>` na branch `ralph/<session>`, com seu estado Ralph em `.ralph/parallel/sessions/<session>/ralph/`. No fim da execução, as alterações restantes são commitadas como `wip(ralph): <story>` nessa branch e o worktree é removido (`git worktree remove`). Se esse commit falhar, o worktree é mantido (sem perda de dados) e sinalizado em `output.log`. O trabalho é recuperado fazendo merge das branches `ralph/*`.
- **Fora de um repositório git**: sem worktree; o worker é executado no diretório atual (um aviso é exibido) e o isolamento das sessões Claude continua garantido.

### 2. Loop Principal com Painel

```
╔═══════════════════════════════════════════════════════════════╗
║  RALPH WIGGUM - Session: ralph-xxx           PHASE: GREEN     ║
╠═══════════════════════════════════════════════════════════════╣
║  ITERATION 8/25              ELAPSED: 12:34                   ║
║  PROGRESS ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  32%  ║
║                                                               ║
║  Circuit Breaker: ░░ (0/4)    Context: ████████░░ 78%        ║
╚═══════════════════════════════════════════════════════════════╝
```

### 3. Validação da Definição de Pronto

O sistema de DoD valida a conclusão por meio de múltiplos critérios:

| Validador | Descrição |
|-----------|-----------|
| `command` | Executar comando shell (testes, lint, build) |
| `output_contains` | Verificar padrão na saída do Claude |
| `file_changed` | Verificar se arquivos foram modificados |
| `hook` | Executar hook existente do Claude |
| `human` | Validação humana interativa |

#### Limite do validador `command` → usar `type: hook`

`type: command` só executa comandos que passam na lista de permissões de `Tools/Ralph/lib/dod-validator.sh`: letras, dígitos, espaço e `_ . / " ' -`. Qualquer comando contendo `=`, `|`, `&` ou `:` (assim como `;`, `>`, `$` etc.) é rejeitado com `ERROR: Invalid command`: o critério **nunca** é validado e o loop roda até o circuit breaker disparar.

| Comando rejeitado | Caractere culpado |
|-------------------|-------------------|
| `dotnet build /p:TreatWarningsAsErrors=true` | `:` e `=` |
| `npm test && npm run lint` | `&` |
| `pytest \| tee out.log` | `\|` |

Nesses casos, colocar o comando em um script e declará-lo como `type: hook`:

```yaml
definition_of_done:
  checklist:
    - id: build
      type: hook
      script: ".ralph/dod/build.sh"
      required: true
```

```bash
#!/usr/bin/env bash
# .ralph/dod/build.sh — recebe {"cwd": ..., "output": ...} em JSON via stdin
dotnet build /p:TreatWarningsAsErrors=true || exit 2
```

O script retorna `0` (critério atendido) ou `2` (critério falhou). Chaves lidas por tipo: `command` → `command:`, `output_contains` e `file_changed` → `pattern:`, `hook` → `script:`, `human` → `prompt:`.

### 4. Circuit Breaker Adaptativo (v2.0)

Seleciona automaticamente o perfil com base nas palavras-chave da tarefa:

| Perfil | Palavras-chave | Sem Mudanças | Erros | Máx. Iter. |
|--------|----------------|--------------|-------|------------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

### 5. Integração de Hooks (Claude Code 2.1.23+)

```
SessionStart → session-restore.sh → Injetar contexto Ralph
     ↓
PreToolUse (uma vez) → status-injector.sh → Injetar status DoD
     ↓
Claude trabalha...
     ↓
Stop → stop-dod-gate.sh → Bloquear se DoD não satisfeito (exit 2)
```

## /goal (interativo) ou Ralph (autônomo/CI)?

`/goal` é um comando nativo do Claude Code digitado dentro de uma sessão: não é uma opção de `ralph.sh`, que não oferece nenhuma para isso e nunca gera um `/goal`. As duas ferramentas são complementares:

| Critério | `/goal` (nativo) | Ralph (`ralph.sh`) |
|----------|------------------|--------------------|
| Critério de conclusão | Julgamento LLM: um modelo pequeno e rápido avalia, após cada turno, o que está visível na conversa — não executa nenhum comando nem lê nenhum arquivo | Determinístico: comandos, padrões e hooks executados por `dod-validator.sh` |
| Limite de iterações | Sem limite fixo: termina quando a condição é atendida ou julgada impossível, com `/goal clear`, ou se Claude encadeia vários turnos sem ferramentas; um limite pode ser escrito na condição | `max_iterations` + circuit breaker adaptativo |
| Headless / CI | `claude -p "/goal ..."` itera até o fim em uma única invocação; uso em CI não documentado | Feito para isso: execução autônoma (`--autonomous`, `--overnight`), dashboard `headless` |
| `disableAllHooks: true` | Indisponível: `/goal` envolve um Stop hook de sessão (idem com `allowManagedHooksOnly`) | O loop e a DoD rodam dentro de `ralph.sh`; só a integração de hooks (`stop-dod-gate.sh`) é desativada |
| Configuração | Nenhuma; um único goal por sessão, apagado por `/clear` | `ralph.yml` |

- **Escolher `/goal`** para uma tarefa interativa cuja conclusão aparece na conversa (exibir a saída dos testes: o avaliador não os executa).
- **Escolher Ralph** quando a conclusão deve ser comprovada por comandos, com limite de iterações, sem supervisão ou em CI.

Referência: [documentação do `/goal`](https://code.claude.com/docs/en/goal).

## Exemplos de Início Rápido

```bash
# Uso básico
ralph.sh "Implement user authentication"

# Detectar projeto automaticamente e gerar config
ralph.sh --auto-detect --init

# Assistente de configuração interativo
ralph.sh --interactive

# Com arquivo de configuração
ralph.sh --config=ralph.yml "Fix the login bug"

# Retomar sessão
ralph.sh --continue=ralph-1704067200-a1b2
```

## Configuração (v2.0)

```yaml
version: "2.0"

# Integração de hooks
hooks:
  enabled: true
  mode: "advanced"  # simple ou advanced

# Detecção automática
auto_detect:
  enabled: true
  interactive: false

# Painel em tempo real
dashboard:
  enabled: true
  mode: "full"  # simple, full, headless

# Exportação de métricas
metrics:
  enabled: true
  format: "both"  # json, prometheus, both

# Monitoramento de saúde
health_monitor:
  enabled: true
  patterns:
    stall_detection: true
    error_spiral: true
    context_bloat: true

# Circuit breaker adaptativo
circuit_breaker:
  adaptive: true
  default_profile: "medium_feature"
  learning:
    enabled: true
    min_samples: 5

# Definição de Pronto
definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "docker compose exec app npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Templates de DoD por Tecnologia

| Tecnologia | Comando de Teste | Comando de Lint |
|------------|------------------|-----------------|
| Symfony | `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` |
| Flutter | `flutter test` | `flutter analyze` |
| React | `npm test` | `npm run lint` |
| Python | `pytest` | `ruff check .` |
| .NET | `dotnet test` | `dotnet build /p:TreatWarningsAsErrors=true` |
| Go | `go test ./...` | `golangci-lint run` |
| Rust | `cargo test` | `cargo clippy` |

## Saída

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Continuous AI Agent Loop v2.0        ║
╚════════════════════════════════════════════════════════════╝

✓ Detected: react-typescript (HIGH confidence)
✓ Session created: ralph-1704067200-a1b2
✓ Hooks initialized (advanced mode)

ℹ Starting Ralph loop...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteration 1 of 25 (Profile: medium_feature)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Invoking Claude...
ℹ Checking DoD criteria...
  ✓ [tests] All tests pass - PASS
  ✓ [lint] No lint errors - PASS
  ✓ [completion] Claude signals completion - PASS

  All required criteria passed!

✓ DoD PASSED

╔════════════════════════════════════════════════════════════╗
║     📊 Session Summary                                      ║
╚════════════════════════════════════════════════════════════╝

  Session ID:        ralph-1704067200-a1b2
  Profile:           medium_feature
  Total iterations:  3
  Duration:          45s
  DoD status:        PASSED
  Exit reason:       dod_complete
  Metrics exported:  .ralph/sessions/.../metrics-export.json
```

## Modos de Falha e Recuperação

### Falhas de Validação de DoD

Quando os validadores de DoD falham repetidamente, o Ralph aplica recuperação progressiva:

| Falhas Consecutivas | Ação |
|--------------------|------|
| 1-2 | Tentar novamente com contexto — Ralph inclui a saída de erro anterior |
| 3 | Acionar verificação do circuit breaker — avaliar se a tarefa está travada |
| 4+ | Circuit breaker ativado — sessão para com `exit_reason: circuit_breaker` |

### Tratamento de Timeout

| Tipo de Timeout | Padrão | Configuração |
|----------------|---------|--------------|
| Por iteração | 5 min | `circuit_breaker.iteration_timeout` |
| Sessão total | 30 min | `circuit_breaker.session_timeout` |
| Comando DoD | 60 seg | `definition_of_done.timeout` |

Quando um timeout ocorre:
1. A iteração atual é cancelada
2. O progresso parcial é preservado no estado da sessão
3. O contador do circuit breaker incrementa
4. Retomar com `--continue=<session-id>` para tentar novamente

### Razões de Saída Comuns

| Razão de Saída | Significado | Recuperação |
|----------------|-------------|-------------|
| `dod_complete` | Todos os critérios de DoD passaram | Sucesso — nenhuma ação necessária |
| `circuit_breaker` | Muitas falhas | Revisar escopo da tarefa, simplificar DoD |
| `max_iterations` | Limite de iterações atingido | Aumentar o limite ou dividir em subtarefas |
| `timeout` | Timeout da sessão expirado | Retomar ou aumentar o timeout |
| `user_abort` | Usuário cancelou (Ctrl+C) | Retomar com `--continue` |

## Boas Práticas

1. **Usar detecção automática**: Deixar o Ralph configurar o DoD para sua stack
2. **Descrição clara da tarefa**: Fornecer tarefas específicas e acionáveis
3. **Usar TDD**: Escrever testes primeiro, deixar o Ralph implementar
4. **Monitorar o painel**: Acompanhar o progresso em tempo real
5. **Revisar métricas**: Analisar métricas da sessão para otimização
6. **Definir timeouts realistas**: Adaptar os timeouts à complexidade da tarefa
7. **Usar perfis do circuit breaker**: Combinar o perfil ao tipo de tarefa (quick_fix vs large_feature)

## Relacionados

- `@ralph-conductor` - Agente para orquestração Ralph
- `/qa:tdd` - Correção de bugs baseada em TDD
- `/workflow:implement` - Desenvolvimento de sprint com TDD
