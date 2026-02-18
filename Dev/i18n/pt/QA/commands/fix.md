---
description: Correcao automatizada de bugs identificados pela QA Recette
argument-hint: --session=<session-id> [--dry-run|--skip-fix|--severity=<level>|--auto-commit]
---

# QA Recette Fix - Correcao Automatizada de Bugs

Complemento do `/qa:recette`. Le um relatorio/sessao de recette, refina cada erro para torna-lo processavel, gera documentos de gestao de projeto (stories BMAD, backlog, sprint), e entao lanca a correcao TDD para cada bug. Implementa a **Regra de Ouro**: Um bug corrigido NUNCA deve reaparecer.

## Argumentos

**$ARGUMENTS**

- `--session=<id>` : ID de sessao recette (ex: REC-20260130-143022) **[obrigatorio]**
- `--dry-run` : Refinar erros e gerar documentos BMAD sem corrigir
- `--severity=<level>` : Filtrar por severidade minima (critical, high, medium, low)
- `--skip-fix` : Gerar apenas documentos, sem correcao TDD
- `--auto-commit` : Commit automatico apos cada bug corrigido

## Funcionalidades Principais

| Funcionalidade | Descricao |
|----------------|-----------|
| **Refinamento de Erros** | Analisa a causa raiz, reproduz via Chrome se disponivel |
| **Agrupamento Inteligente** | Deduplica erros por causa raiz comum |
| **Documentos BMAD** | Gera bug stories, atualiza backlog e sprint |
| **Correcao TDD** | Workflow RED → GREEN → REFACTOR para cada bug |
| **Testes de Regressao** | Geracao automatica e atualizacao do registro |
| **Acompanhamento de Progresso** | fix-state.yaml para retomada e monitoramento |

## Processo em 7 Fases

```
Sessao recette (.recette/sessions/{id}/)
        |
        v
  Fase 1: Carregar a sessao e os erros
        |
        v
  Fase 2: Refinar as descricoes de erros
        |     - Reproduzir via Chrome se necessario
        |     - Identificar a causa raiz
        |     - Classificar severidade
        |
        v
  Fase 3: Agrupar por causa raiz
        |     - Deduplicacao
        |     - Priorizacao
        |
        v
  Fase 4: Gerar os documentos BMAD
        |     - Bug stories (US-XXX-bug-YYY)
        |     - Atualizacao do backlog
        |     - Atualizacao do sprint-status.yaml
        |
        v
  Fase 5: Correcao TDD por bug
        |     - RED: teste que reproduz o bug
        |     - GREEN: correcao minima
        |     - REFACTOR: melhoria
        |
        v
  Fase 6: Verificacao
        |     - Todos os testes passam
        |     - Testes de regressao gerados
        |     - Registro de regressao atualizado
        |
        v
  Fase 7: Relatorio de sintese
```

### Fase 1: Carregamento da Sessao

```
┌─────────────────────────────────────────┐
│  1. load_session(session_id)            │
│     - Ler .recette/sessions/{id}/       │
│     - Carregar state.yaml               │
│     - Extrair os erros (failed)         │
│     - Carregar screenshots/logs         │
└─────────────────────────────────────────┘
```

### Fase 2: Refinamento de Erros

Para cada erro detectado:

1. Reler o screenshot/log do erro na sessao
2. Se o Chrome MCP esta disponivel: reproduzir o erro para confirmar
3. Analisar o codigo fonte para identificar a causa raiz
4. Reformular a descricao com: comportamento atual, comportamento esperado, arquivos afetados, causa raiz suposta

**Matriz de severidade:**

| Tipo erro | Impacto usuario | Frequencia | Severidade |
|-----------|-----------------|------------|------------|
| security | Qualquer | Qualquer | critical |
| logic | Bloqueante | Qualquer | critical |
| logic | Nao bloqueante | Frequente | high |
| validation | Bloqueante | Qualquer | high |
| validation | Nao bloqueante | Rara | medium |
| interaction | Qualquer | Qualquer | high |
| visual | Degradacao maior | Qualquer | medium |
| visual | Cosmetico | Qualquer | low |
| api | Erro 5xx | Qualquer | critical |
| api | Erro 4xx inesperado | Qualquer | high |

### Fase 3: Agrupamento por Causa Raiz

Varios erros de recette podem ter a mesma causa raiz:

- Erro de validacao de formulario + erro de exibicao de mensagem = mesmo componente de validacao
- Erro API em 3 endpoints = mesmo middleware de autenticacao

O agrupamento cria **uma unica bug story** por causa raiz em vez de uma por erro.

### Fase 4: Geracao de Documentos BMAD

Para cada bug agrupado:

1. Gerar a bug story a partir do template `bug-story.md`
2. Adicionar ao `.bmad/sprint-status.yaml` com status `ready-for-dev`
3. Se um sprint esta ativo: adicionar ao sprint atual
4. Senao: adicionar ao backlog

### Fase 5: Correcao TDD

Para cada bug story (por ordem de severidade):

```
┌──────────────────────────────────────────────┐
│  BUG-001 (critical)                          │
│                                              │
│  1. RED   : Escrever teste que reproduz o    │
│             bug → Executar → DEVE falhar     │
│                                              │
│  2. GREEN : Correcao minima do codigo        │
│             → Executar → DEVE passar         │
│             → Todos os testes → nao-regressao│
│                                              │
│  3. REFACTOR : Melhorar se necessario        │
│             → Gerar teste de regressao       │
│             → Atualizar registro             │
│             → Atualizar fix-state.yaml       │
│                                              │
│  4. COMMIT (se --auto-commit)                │
│     fix({modulo}): {desc} [recette:{session}]│
└──────────────────────────────────────────────┘
```

**Tipos de testes gerados por classificacao:**

| Tipo erro | Teste unitario | Teste funcional | Feature Behat |
|-----------|:---:|:---:|:---:|
| logic | X | | |
| validation | X | X | |
| api | | X | |
| interaction | | | X |
| visual | | | X |
| security | X | X | |

### Fase 6: Verificacao

1. Executar todos os testes do projeto
2. Verificar que os testes de regressao gerados estao em `.recette/regression/tests/`
3. Verificar que o registro `.recette/regression/registry.yaml` esta atualizado
4. Verificar que o fix-state.yaml reflete o estado correto

### Fase 7: Relatorio de Sintese

Gera um relatorio resumo com:

- Numero total de erros processados
- Numero de bugs agrupados (apos deduplicacao)
- Correcoes bem-sucedidas / falhadas / ignoradas
- Testes de regressao gerados
- Commits realizados (se `--auto-commit`)

## Estado de Progresso (fix-state.yaml)

```yaml
# .recette/sessions/{id}/fix-state.yaml
session_id: "REC-20260130-143022"
started_at: "2026-01-31T10:00:00"
status: "in-progress"  # pending | in-progress | completed | paused

errors:
  total: 8
  grouped: 5
  refined: 5
  fixed: 3
  skipped: 0
  remaining: 2

bugs:
  - id: "BUG-001"
    error_ids: ["ERR-001", "ERR-003"]
    severity: critical
    title: "Autenticacao falha apos timeout de sessao"
    story_id: "US-042-bug-001"
    status: "fixed"  # pending | refining | documented | fixing | fixed | skipped
    tdd_phase: "refactor"
    fix_commit: "abc1234"
    regression_test: "tests/Functional/Auth/SessionTimeoutTest.php"

  - id: "BUG-002"
    error_ids: ["ERR-002"]
    severity: high
    title: "Formulario de contato nao exibe erros de validacao"
    story_id: "US-042-bug-002"
    status: "fixing"
    tdd_phase: "green"
    fix_commit: null
    regression_test: null

current_bug: "BUG-002"
resume_from:
  bug_id: "BUG-002"
  phase: "green"
```

## Exemplos

```bash
# Corrigir todos os bugs de uma sessao recette
/qa:recette-fix --session=REC-20260130-143022

# Dry run: refinar e documentar sem corrigir
/qa:recette-fix --session=REC-20260130-143022 --dry-run

# Corrigir apenas bugs criticos e altos
/qa:recette-fix --session=REC-20260130-143022 --severity=high

# Gerar documentos BMAD sem lancar o TDD
/qa:recette-fix --session=REC-20260130-143022 --skip-fix

# Corrigir com commit automatico
/qa:recette-fix --session=REC-20260130-143022 --auto-commit
```

## Estrutura de Saida

```
.recette/sessions/{session-id}/
├── state.yaml              # Estado da sessao recette
├── fix-state.yaml          # Estado de progresso das correcoes
├── screenshots/            # Capturas de tela dos erros
└── logs/                   # Logs detalhados

.bmad/stories/
├── US-042-bug-001.md       # Bug story BMAD
├── US-042-bug-002.md
└── ...

.recette/regression/
├── registry.yaml           # Registro atualizado
└── tests/
    ├── Unit/
    ├── Functional/
    └── Behat/
```

## Comandos Relacionados

| Comando | Descricao |
|---------|-----------|
| `/qa:recette` | Executar testes de aceitacao |
| `/qa:recette-status` | Mostrar status da sessao |
| `/qa:recette-regression` | Ver testes de regressao |
| `/qa:recette-report` | Gerar relatorio |

## Mensagens de Erro

| Erro | Solucao |
|------|---------|
| "Sessao nao encontrada" | Verifique o ID de sessao em `.recette/sessions/` |
| "Sem erros na sessao" | A sessao nao tem erros a corrigir |
| "sprint-status.yaml nao encontrado" | Inicialize o BMAD com `/bmad:init` |
| "Teste RED nao falha" | O bug pode nao existir mais, verificar manualmente |

## Melhores Praticas

1. **Comecar com dry-run** : Verificar erros refinados e documentos antes de corrigir
2. **Priorizar por severidade** : Comecar pelos bugs criticos
3. **Validar agrupamentos** : Verificar que os erros agrupados compartilham a mesma causa
4. **Revisar stories** : Verificar as bug stories geradas antes de lancar o TDD
5. **Usar auto-commit** : Para manter um historico limpo de correcoes

## Próximo passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Re-testar após as correções                           ║
║                                                          ║
║  Veja também:                                            ║
║  • /qa:regression — Verificar testes de regressão        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
