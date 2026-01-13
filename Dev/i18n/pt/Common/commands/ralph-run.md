---
description: Executar Claude em loop continuo ate completar tarefa (Ralph Wiggum)
argument-hint: <descricao-tarefa> [--auto|--full]
---

# Ralph Run - Loop Continuo de Agente IA

Executar Claude em loop continuo ate que a tarefa esteja completa ou os criterios de Definition of Done (DoD) sejam atendidos.

## Argumentos

**$ARGUMENTS**

- `<descricao-tarefa>`: A tarefa para Claude completar
- `--auto`: Deteccao automatica maxima, perguntas minimas
- `--full`: Modo completo com todas as verificacoes DoD

## Processo

### 1. Inicializacao de Sessao

1. **Verificar pre-requisitos**:
   - Verificar se Claude esta disponivel
   - Procurar configuracao `ralph.yml`
   - Inicializar diretorio de sessao (`.ralph/`)

2. **Carregar configuracao**:
   - Ler `ralph.yml` ou `.claude/ralph.yml`
   - Definir iteracoes max, timeouts, criterios DoD

### 2. Loop Principal

```
┌─────────────────────────────────────────────────────────────┐
│  LOOP RALPH                                                  │
│                                                              │
│  while (iteracoes < max && !DoD_aprovado) {                  │
│      1. Verificar disjuntor                                  │
│      2. Invocar Claude com prompt atual                      │
│      3. Processar saida                                      │
│      4. Validar Definition of Done                           │
│      5. Criar checkpoint (commit git)                        │
│      6. Se DoD nao atendido, usar resposta como prompt       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 3. Validacao Definition of Done

O sistema DoD valida conclusao atraves de multiplos criterios:

| Validador | Descricao |
|-----------|-----------|
| `command` | Executar comando shell (tests, lint, build) |
| `output_contains` | Verificar padrao na saida do Claude |
| `file_changed` | Verificar se arquivos foram modificados |
| `hook` | Executar hook Claude existente |
| `human` | Validacao humana interativa |

Exemplo DoD em `ralph.yml`:

```yaml
definition_of_done:
  checklist:
    - id: tests
      name: "Todos os testes passam"
      type: command
      command: "docker compose exec app npm test"
      required: true

    - id: completion
      name: "Claude sinaliza conclusao"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

### 4. Disjuntor (Circuit Breaker)

Mecanismo de seguranca para prevenir loops infinitos:

| Gatilho | Limite | Acao |
|---------|--------|------|
| Sem alteracoes de arquivos | 3 iteracoes | Parar |
| Erros repetidos | 5 iteracoes | Parar |
| Declinio de saida | 70% | Parar |
| Max iteracoes | 25 (padrao) | Parar |

### 5. Checkpointing

Checkpoints Git sao criados apos cada iteracao para:
- **Recuperacao**: Restaurar estado anterior se necessario
- **Historico**: Acompanhar progresso atraves das iteracoes
- **Revisao**: Inspecionar o que mudou em cada passo

## Saida

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Loop Continuo de Agente IA            ║
╚════════════════════════════════════════════════════════════╝

✓ Sessao criada: ralph-1704067200-a1b2

ℹ Iniciando loop Ralph...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteracao 1 de 25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Invocando Claude...
ℹ Verificando criterios DoD...
  ✓ [tests] Todos os testes passam - OK
  ✓ [lint] Sem erros lint - OK
  ✓ [completion] Claude sinaliza conclusao - OK

  Todos os criterios obrigatorios aprovados!

✓ DoD APROVADO

╔════════════════════════════════════════════════════════════╗
║     📊 Resumo da Sessao                                     ║
╚════════════════════════════════════════════════════════════╝

  ID da sessao:        ralph-1704067200-a1b2
  Total de iteracoes:  3
  Duracao:             45s
  Status DoD:          APROVADO
  Motivo de saida:     dod_complete
```

## Configuracao

Criar `ralph.yml` na raiz do projeto:

```yaml
version: "1.0"

session:
  max_iterations: 25
  timeout: 600000

circuit_breaker:
  enabled: true
  no_file_changes_threshold: 3

definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Boas Praticas

1. **Descricao clara**: Fornecer tarefas especificas e acionaveis
2. **Configurar DoD**: Definir criterios de conclusao em `ralph.yml`
3. **Usar TDD**: Escrever testes primeiro, deixar Ralph implementar
4. **Monitorar progresso**: Observar saidas de iteracao
5. **Limites razoaveis**: Ajustar max_iterations conforme complexidade

## Ver tambem

- `@ralph-conductor` - Agente para orquestracao Ralph
- `/common:fix-bug-tdd` - Correcao de bugs com TDD
- `/project:sprint-dev` - Desenvolvimento de sprint com TDD
