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
- `/sprint:dev` - Desenvolvimento de sprint com TDD
