---
description: Gerar relatorios QA Recette a partir de dados de sessao
argument-hint: --session=<session-id> [--format=<md|html|json>] [--output=<path>]
---

# QA Recette Report - Geracao de Relatorios

Gera relatorios detalhados a partir dos dados de sessao QA Recette. Suporta multiplos formatos de saida e comparacao de sessoes.

## Argumentos

**$ARGUMENTS**

- `--session=<id>` : ID de sessao para gerar o relatorio **[obrigatorio]**
- `--format=<type>` : Formato de saida (md, html, json) — padrao: md
- `--output=<path>` : Caminho de saida personalizado (padrao: `.recette/reports/`)
- `--include-screenshots` : Incorporar capturas de tela no relatorio HTML
- `--compare=<id>` : Comparar com outra sessao para relatorio de diferencas

## Funcionalidades Principais

| Funcionalidade | Descricao |
|----------------|-----------|
| **Multi-Formato** | Gerar relatorios Markdown, HTML ou JSON |
| **Comparacao de Sessoes** | Comparar duas execucoes para detectar regressoes |
| **Secao Regra de Ouro** | Secao dedicada de conformidade nos relatorios |
| **Incorporacao de Capturas** | Incorporar capturas de erros em relatorios HTML |
| **Rastreabilidade de Testes** | Rastreabilidade completa de AC aos resultados de testes |
| **Resumo de Metricas** | Taxas de aprovacao/falha, tempos, classificacao de erros |

## Processo

### 1. Coleta de Dados

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Ler .recette/sessions/{id}/       │
│     - Carregar state.yaml               │
│     - Carregar fix-state.yaml se pres.  │
│     - Coletar capturas e logs           │
│     - Carregar registro de regressao    │
└─────────────────────────────────────────┘
```

### 2. Geracao do Relatorio

```
┌─────────────────────────────────────────┐
│  2. generate_report(format)             │
│     - Construir secao resumo            │
│     - Construir resultados de testes    │
│     - Construir detalhes de erros       │
│     - Construir testes de regressao     │
│     - Construir declaracao Regra de Ouro│
│     - Aplicar template de formato       │
│     - Escrever no caminho de saida      │
└─────────────────────────────────────────┘
```

### 3. Modo Comparacao (--compare)

Compara duas sessoes:

```
## Comparacao: REC-20260130-143022 vs REC-20260201-140000

| Metrica   | Sessao 1  | Sessao 2  | Delta   |
|-----------|-----------|-----------|---------|
| Testes    | 15        | 15        | =       |
| Aprovados | 12        | 14        | +2      |
| Falhados  | 2         | 0         | -2      |
| Duracao   | 14m 48s   | 12m 15s   | -2m 33s |

### Erros Resolvidos
- ERR-001: Validacao login — CORRIGIDO
- ERR-002: Timeout API — CORRIGIDO

### Novos Erros
(nenhum)

### Status de Regressao
Nenhuma violacao da Regra de Ouro detectada.
```

## Fontes de Dados

| Fonte | Caminho | Descricao |
|-------|---------|-----------|
| Estado da sessao | `.recette/sessions/{id}/state.yaml` | Resultados e progresso |
| Estado de correcao | `.recette/sessions/{id}/fix-state.yaml` | Status das correcoes |
| Capturas de tela | `.recette/sessions/{id}/screenshots/` | Capturas de erros |
| Logs | `.recette/sessions/{id}/logs/` | Logs de execucao |
| Registro | `.recette/regression/registry.yaml` | Registro de regressao |
| Template | `Tools/Recette/templates/report.md.template` | Template de relatorio |

## Exemplos

```bash
# Gerar relatorio Markdown (padrao)
/qa:recette-report --session=REC-20260130-143022

# Gerar relatorio HTML com capturas
/qa:recette-report --session=REC-20260130-143022 --format=html --include-screenshots

# Gerar relatorio JSON para integracao CI
/qa:recette-report --session=REC-20260130-143022 --format=json

# Caminho de saida personalizado
/qa:recette-report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Comparar duas sessoes
/qa:recette-report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

## Estrutura de Saida

```
.recette/reports/
├── REC-20260130-143022-report.md       # Relatorio Markdown
├── REC-20260130-143022-report.html     # Relatorio HTML (se --format=html)
├── REC-20260130-143022-report.json     # Relatorio JSON (se --format=json)
└── REC-20260201-vs-20260130-diff.md    # Relatorio de comparacao (se --compare)
```

## Comandos Relacionados

| Comando | Descricao |
|---------|-----------|
| `/qa:recette` | Executar testes de aceitacao |
| `/qa:recette-fix` | Corrigir bugs de uma sessao |
| `/qa:recette-status` | Mostrar status da sessao |
| `/qa:recette-regression` | Ver testes de regressao |

## Mensagens de Erro

| Erro | Solucao |
|------|---------|
| "Sessao nao encontrada" | Verifique o ID de sessao em `.recette/sessions/` |
| "Sem resultados de testes" | A sessao nao tem testes concluidos para relatorio |
| "Template nao encontrado" | Verifique se `Tools/Recette/templates/` existe |
| "Sessao de comparacao nao encontrada" | Verifique o ID da sessao de comparacao |

## Melhores Praticas

1. **Gere apos cada execucao** : Crie um relatorio imediatamente apos a recette
2. **Use HTML para stakeholders** : O formato HTML com capturas e ideal para compartilhar
3. **Use JSON para CI** : Integre relatorios JSON no seu pipeline CI/CD
4. **Compare execucoes** : Use --compare para acompanhar o progresso entre iteracoes
5. **Arquive relatorios** : Mantenha os relatorios em controle de versao para trilha de auditoria
