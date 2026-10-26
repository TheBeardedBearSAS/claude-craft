---
description: "Mostrar o status e progresso das sessões QA Recette, ou gerar relatórios (--report)"
argument-hint: "[--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>] [--report] [--format=<md|html|json>] [--output=<path>] [--compare=<id>]"
---

# QA Recette Status - Status e Progresso das Sessoes

Exibe o status e progresso das sessoes QA Recette. Consulte os detalhes de uma sessao individual ou liste todas as sessoes com filtragem.

## Argumentos

**$ARGUMENTS**

- `--session=<id>` : Mostrar status detalhado de uma sessao especifica (ex: REC-20260130-143022)
- `--all` : Listar todas as sessoes com resumo
- `--scope=<type>` : Filtrar por escopo (story, sprint)
- `--status=<status>` : Filtrar por status (running, completed, paused, failed)
- `--format=<type>` : Formato de saida (table, yaml, json) — padrao: table
- `--watch` : Modo de atualizacao ao vivo (a cada 5 segundos)
- `--report`: Modo relatório (antigo `/qa:status --report`): gerar um relatório a partir de uma sessão; requer `--session=<id>`
- `--format=<type>`: com `--report`: md, html, json (padrão: md)
- `--output=<path>`: com `--report`: caminho de saída personalizado (padrão: `.recette/reports/`)
- `--include-screenshots`: com `--report`: incorporar as capturas de tela no relatório HTML
- `--compare=<id>`: com `--report`: comparar com outra sessão para obter um diferencial de regressão

## Funcionalidades Principais

| Funcionalidade | Descricao |
|----------------|-----------|
| **Lista de Sessoes** | Listar todas as sessoes com status, progresso e datas |
| **Vista Detalhada** | Sessao individual com detalhamento de testes, erros, tempos |
| **Barras de Progresso** | Indicadores visuais de progresso para sessoes em execucao |
| **Filtragem** | Filtrar por escopo, status ou intervalo de datas |
| **Modo ao Vivo** | Modo watch para monitoramento em tempo real |
| **Estado de Correcao** | Mostra o status fix-state.yaml se recette-fix foi executado |

## Processo

### 1. Descoberta de Sessoes

```
┌─────────────────────────────────────────┐
│  1. scan_sessions()                     │
│     - Ler .recette/sessions/            │
│     - Carregar state.yaml por sessao    │
│     - Carregar fix-state.yaml se pres.  │
│     - Aplicar filtros                   │
└─────────────────────────────────────────┘
```

### 2. Lista de Sessoes (--all)

Exibe uma tabela resumo:

```
┌──────────────────────┬────────┬──────────┬───────────┬──────────┬────────────┐
│ ID Sessao            │ Scope  │ Alvo     │ Status    │ Progresso│ Data       │
├──────────────────────┼────────┼──────────┼───────────┼──────────┼────────────┤
│ REC-20260130-143022  │ story  │ US-001   │ completed │ 15/15    │ 2026-01-30 │
│ REC-20260131-091500  │ sprint │ Sprint-3 │ paused    │ 8/23     │ 2026-01-31 │
│ REC-20260201-140000  │ story  │ US-005   │ running   │ 3/10     │ 2026-02-01 │
└──────────────────────┴────────┴──────────┴───────────┴──────────┴────────────┘
```

### 3. Detalhe de uma Sessao (--session=<id>)

Exibe informacoes completas:

```
Sessao:   REC-20260130-143022
Status:   completed
Scope:    story → US-001
Inicio:   2026-01-30 14:30:22
Fim:      2026-01-30 14:45:10
Duracao:  14m 48s

Testes:
  Total:     15
  Aprovados: 12  ████████████░░░  80%
  Falhados:   2  ██░░░░░░░░░░░░░  13%
  Ignorados:  1  █░░░░░░░░░░░░░░   7%

Erros:
  - ERR-001: Validacao de formulario login nao exibida (visual)
  - ERR-002: Timeout API em /api/users (api)

Testes de Regressao Gerados: 3
Estado de Correcao: completed (2/2 bugs corrigidos)
```

## Uso

| Modo / opção | O que faz | Substitui |
|---|---|---|
| `/qa:status --all` / `--session=<id>` | Listar as sessões ou mostrar o detalhe de uma sessão | — |
| `/qa:status --report --session=<id>` | Gerar um relatório Markdown/HTML/JSON (`--format`, `--output`, `--include-screenshots`) | `/qa:status --report` |
| `/qa:status --report --session=<id> --compare=<id>` | Comparar duas sessões para detectar regressões | `/qa:status --report --compare` |

## Modo Relatório (--report)

Gera relatórios detalhados a partir dos dados da sessão. Saída em vários formatos (Markdown, HTML, JSON), seção de conformidade com a Golden Rule, incorporação de capturas de tela, rastreabilidade dos critérios de aceitação até os testes e métricas de sucesso/falha. Sem `--format`, o relatório é Markdown.

### Processo do Relatório

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Read .recette/sessions/{id}/      │
│     - Load state.yaml                   │
│     - Load fix-state.yaml if present    │
│     - Collect screenshots and logs      │
│     - Load regression registry          │
├─────────────────────────────────────────┤
│  2. generate_report(format)             │
│     - Build summary, test results,      │
│       error details, regression tests   │
│     - Build Golden Rule statement       │
│     - Apply format template             │
│     - Write to output path              │
└─────────────────────────────────────────┘
```

### Estrutura do Relatório

```markdown
# QA Recette Report — REC-20260130-143022

## Summary
| Metric | Value |
|--------|-------|
| Session | REC-20260130-143022 |
| Scope | story → US-001 |
| Duration | 14m 48s |
| Passed / Failed / Skipped | 12 (80%) / 2 (13%) / 1 (7%) |

## Test Results
### Failed Tests (2)
- TC-008: Login validation error display ✗ (ERR-001)

## Error Details
### ERR-001: Login validation not displayed
- Type: visual · Severity: medium · Screenshot: screenshots/err-001.png

## Regression Tests Generated
| ID | Error | Test Type | Path |
|----|-------|-----------|------|
| REG-001 | ERR-001 | behat | features/auth/login_validation.feature |

## Golden Rule Compliance
All detected errors have generated regression tests.
Registry updated: .recette/regression/registry.yaml
```

### Comparação (--compare)

Compara duas execuções: diferenças de métricas, erros resolvidos, novos erros e violações da Golden Rule.

```
## Comparison: REC-20260130-143022 vs REC-20260201-140000

| Metric | Session 1 | Session 2 | Delta |
|--------|-----------|-----------|-------|
| Passed | 12 | 14 | +2 |
| Failed | 2 | 0 | -2 |

### Resolved Errors / New Errors / Regression Status
```

### Fontes de dados do relatório

| Fonte | Caminho | Descrição |
|---|---|---|
| Registro | `.recette/regression/registry.yaml` | Registro de testes de regressão |
| Modelo | `Tools/Recette/templates/report.md.template` | Modelo de relatório |

### Erros do relatório

| Erro | Solução |
|---|---|
| "Template not found" | Verificar se `Tools/Recette/templates/` existe |
| "Compare session not found" | Verificar o ID da sessão a comparar |
| "No test results" | A sessão não tem testes concluídos para relatar |

### Exemplos de Relatório

```bash
# Gerar um relatório Markdown (padrão)
/qa:status --report --session=REC-20260130-143022

# Gerar um relatório HTML com capturas de tela
/qa:status --report --session=REC-20260130-143022 --format=html --include-screenshots

# Gerar um relatório JSON para integração CI
/qa:status --report --session=REC-20260130-143022 --format=json

# Caminho de saída personalizado
/qa:status --report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Comparar duas sessões
/qa:status --report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

### Estrutura de Saída do Relatório

```
.recette/reports/
├── REC-20260130-143022-report.md       # Markdown report
├── REC-20260130-143022-report.html     # HTML report (if --format=html)
├── REC-20260130-143022-report.json     # JSON report (if --format=json)
└── REC-20260201-vs-20260130-diff.md    # Comparison report (if --compare)
```

## Fontes de Dados

| Fonte | Caminho | Descricao |
|-------|---------|-----------|
| Estado da sessao | `.recette/sessions/{id}/state.yaml` | Progresso e resultados |
| Estado de correcao | `.recette/sessions/{id}/fix-state.yaml` | Progresso das correcoes |
| Capturas de tela | `.recette/sessions/{id}/screenshots/` | Capturas de erros |
| Logs | `.recette/sessions/{id}/logs/` | Logs de execucao detalhados |

## Exemplos

```bash
# Listar todas as sessoes
/qa:status --all

# Mostrar status detalhado de uma sessao
/qa:status --session=REC-20260130-143022

# Filtrar sessoes em execucao
/qa:status --all --status=running

# Filtrar por escopo
/qa:status --all --scope=sprint

# Monitoramento ao vivo de uma sessao
/qa:status --session=REC-20260130-143022 --watch

# Saida em YAML
/qa:status --session=REC-20260130-143022 --format=yaml

# Saida em JSON (para scripting)
/qa:status --all --format=json
```

## Estrutura de Saida

```
.recette/
├── sessions/
│   ├── REC-20260130-143022/
│   │   ├── state.yaml          # Estado da sessao (lido por este comando)
│   │   ├── fix-state.yaml      # Progresso correcoes (se recette-fix executado)
│   │   ├── screenshots/
│   │   ├── checkpoints/
│   │   └── logs/
│   └── REC-20260131-091500/
│       ├── state.yaml
│       └── ...
```

## Comandos Relacionados

| Comando | Descricao |
|---------|-----------|
| `/qa:recette` | Executar testes de aceitacao |
| `/qa:fix` | Corrigir bugs de uma sessao |
| `/qa:regression` | Ver testes de regressao |
| `/qa:status --report` | Gerar relatório (`--report`) |

## Mensagens de Erro

| Erro | Solucao |
|------|---------|
| "Nenhuma sessao encontrada" | Execute `/qa:recette` primeiro para criar uma sessao |
| "Sessao nao encontrada" | Verifique o ID de sessao em `.recette/sessions/` |
| "Nenhuma sessao corresponde ao filtro" | Ajuste os criterios de filtragem |

## Melhores Praticas

1. **Use --all primeiro** : Obtenha uma visao geral antes de mergulhar em uma sessao
2. **Monitore com --watch** : Use o modo ao vivo para sessoes em execucao
3. **Verifique o estado de correcao** : Confirme que os bugs foram corrigidos apos recette-fix
4. **Use JSON para automacao** : Direcione a saida JSON para outras ferramentas
5. **Filtre por status** : Concentre-se em sessoes pausadas/falhadas que precisam de atencao

## Próximo passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Se a sessão tem falhas:                                 ║
║  → /qa:fix                                               ║
║    Corrigir os bugs identificados                        ║
║                                                          ║
║  Se a sessão está completa:                              ║
║  → /qa:status --report                                   ║
║    Gerar o relatório de recette                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
