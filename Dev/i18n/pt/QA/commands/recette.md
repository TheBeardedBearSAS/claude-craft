---
description: Testes de aceitacao automatizados com Claude in Chrome
argument-hint: --scope=<story|epic|sprint|task> --id=<target-id> [--resume|--record-gif|--dry-run]
---

# QA Recette - Testes de Aceitacao Automatizados

Executa testes de aceitacao automatizados (recette) em aplicacoes web usando Claude in Chrome para automacao de navegador. Este sistema implementa a **Regra de Ouro**: Um bug corrigido NUNCA deve reaparecer.

## Argumentos

**$ARGUMENTS**

- `--scope=<type>`: Escopo do teste (story, epic, sprint, task)
- `--id=<target-id>`: Identificador alvo (ex: US-001, EPIC-01, Sprint-3)
- `--resume=<session-id>`: Retomar de uma sessao anterior
- `--record-gif`: Gravar GIF da execucao
- `--dry-run`: Gerar plano sem executar testes
- `--base-url=<url>`: Sobrescrever URL base

## Modo Plano

> **O modo plano é obrigatório.** Antes de executar, Claude ativa o modo plano para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## Funcionalidades Principais

| Funcionalidade | Descricao |
|----------------|-----------|
| **Planos Abrangentes** | Gera planos de teste exaustivos a partir de criterios de aceitacao |
| **Automacao de Navegador** | Usa Claude in Chrome para testes reais de navegador |
| **Recuperacao de Sessao** | Retomada baseada em checkpoints para sessoes interrompidas |
| **Regra de Ouro** | Geracao automatica de testes de regressao para todos os erros |
| **Documentacao Viva** | Mantem documentacao de testes com rastreabilidade |
| **Deteccao de Regressoes** | Compara execucoes para detectar regressoes |

## Pre-requisitos

1. **Extensao Claude in Chrome**: Versao 1.0.36 ou superior
2. **Navegador Chrome**: Aberto com a extensao ativa
3. **Claude Code**: Iniciado com a flag `--chrome` ou comando `/chrome`

```bash
# Iniciar Claude Code com suporte Chrome
claude --chrome

# Ou ativar Chrome em uma sessao existente
/chrome
```

## Processo

### 1. Verificacao

O comando primeiro verifica se o MCP Chrome esta disponivel:

```
┌─────────────────────────────────────────┐
│  1. check_chrome_mcp()                  │
│     - MCP claude-in-chrome presente?    │
│     - Extensao conectada?               │
│     - Permissoes do site OK?            │
└─────────────────────────────────────────┘
```

### 2. Geracao do Plano de Testes

Gera um plano de testes abrangente cobrindo:

| Categoria | Descricao |
|-----------|-----------|
| `acceptance_criteria_validation` | Testes para cada AC |
| `edge_cases` | Condicoes limite |
| `error_scenarios` | Tratamento de erros |
| `ui_ux_verification` | Consistencia UI/UX |
| `performance_checks` | Tempos de carregamento |
| `security_basics` | XSS, CSRF, injecao |

### 3. Execucao de Testes

Cada teste e executado via Chrome:

```
Test TC-001
├── Passo 1: navigate → /login
├── Passo 2: type → #email = "user@test.com"
├── Passo 3: click → button[type='submit']
└── Assercoes
    ├── url_matches → ^.*/dashboard$
    └── element_visible → .welcome-message
```

### 4. Erro → Teste → Regressao

Quando um erro e detectado:

```
1. Erro detectado durante recette
         │
         ▼
2. Classificacao (visual, interaction, validation, logic, security, API)
         │
         ▼
3. Gerar testes conforme tipo:
   - Logic/Validation → Teste unitario
   - API/Service → Teste funcional
   - Fluxo de usuario → Feature Behat
         │
         ▼
4. Adicionar ao registro de regressao com tag @regression
         │
         ▼
5. Corrigir o bug (workflow TDD)
         │
         ▼
6. Verificar: todos os testes de regressao passam
```

## Exemplos Rapidos

```bash
# Testar uma story especifica
/qa:recette --scope=story --id=US-001

# Testar todas as stories de um sprint
/qa:recette --scope=sprint --id=Sprint-3

# Dry run para ver o plano de testes
/qa:recette --scope=story --id=US-001 --dry-run

# Retomar uma sessao interrompida
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022

# Gravar execucao em GIF
/qa:recette --scope=story --id=US-001 --record-gif
```

## Recuperacao de Sessao

As sessoes sao salvas apos cada teste:

```yaml
# .recette/sessions/{session-id}/state.yaml
session:
  id: "REC-20260130-143022"
  status: "paused"

progress:
  current_test_index: 5
  tests:
    total: 15
    passed: 4
    failed: 1
    pending: 10

recovery:
  resumable: true
  resume_from:
    test_id: "TC-005"
    step_index: 0
```

Para retomar:

```bash
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022
```

## Registro de Regressao

Todos os erros detectados sao rastreados:

```yaml
# .recette/regression/registry.yaml
entries:
  - id: "REG-001"
    error_id: "ERR-001"
    source:
      scope: "story"
      target_id: "US-001"
    generated_tests:
      - type: "unit"
        path: "tests/Unit/Auth/LoginErrorTest.php"
      - type: "behat"
        path: "features/auth/login_error.feature"
    fix:
      status: "verified"
```

## Estrutura de Saida

```
.recette/
├── plans/              # Planos de teste (YAML)
│   └── story-US-001-plan.yaml
├── sessions/           # Estados de sessao
│   └── REC-20260130-143022/
│       ├── state.yaml
│       ├── screenshots/
│       ├── checkpoints/
│       └── logs/
├── regression/         # Suite de regressao
│   ├── registry.yaml
│   └── tests/
│       ├── Unit/
│       ├── Functional/
│       └── Behat/
├── metrics/            # Dados historicos
│   └── history.jsonl
└── reports/            # Relatorios gerados
    └── REC-20260130-143022-report.md
```

## Comandos Relacionados

| Comando | Descricao |
|---------|-----------|
| `/qa:recette-fix` | Corrigir bugs de uma sessao |
| `/qa:recette-status` | Mostrar status da sessao |
| `/qa:recette-regression` | Ver testes de regressao |
| `/qa:recette-report` | Gerar relatorio |
| `/qa:validate` | Validar AC de uma story |
| `/qa:automate` | Criar testes automatizados |

## Capacidades do Chrome

| Categoria | Acoes |
|-----------|-------|
| **Navegacao** | navigate, back, forward, refresh |
| **Interacao** | click, type, fill_form, scroll, hover |
| **Leitura** | Estado DOM, texto de elemento, atributos |
| **Depuracao** | Logs de console, requisicoes de rede, erros |
| **Captura** | Screenshot, gravacao GIF |

## Mensagens de Erro

| Erro | Solucao |
|------|---------|
| "MCP nao detectado" | Executar `claude --chrome` ou `/chrome` |
| "Extensao nao conectada" | Abrir Chrome, verificar extensao |
| "Permissao necessaria" | Autorizar extensao no dominio |
| "Versao desatualizada" | Atualizar extensao Chrome para v1.0.36+ |

## Melhores Praticas

1. **Comecar com dry-run**: Verificar o plano de testes antes de executar
2. **Usar escopos especificos**: Testar stories individualmente para melhor rastreamento
3. **Revisar regressoes**: Consultar `.recette/regression/` apos cada execucao
4. **Ativar gravacao GIF**: Para depurar falhas complexas
5. **Manter URL base**: Configurar no plano para testes consistentes

## Próximo passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Se bugs foram encontrados:                              ║
║  → /qa:fix                                               ║
║    Correção automatizada de bugs                         ║
║  → /qa:tdd                                               ║
║    Correção com abordagem TDD                            ║
║                                                          ║
║  Se todos os testes passam:                              ║
║  → /qa:report                                            ║
║    Gerar o relatório de recette                          ║
║  → /sprint:transition done                               ║
║    Marcar a story como concluída                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
