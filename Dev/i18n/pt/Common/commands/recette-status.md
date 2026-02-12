---
description: Mostrar o status e progresso das sessoes QA Recette
argument-hint: [--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>]
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
/qa:recette-status --all

# Mostrar status detalhado de uma sessao
/qa:recette-status --session=REC-20260130-143022

# Filtrar sessoes em execucao
/qa:recette-status --all --status=running

# Filtrar por escopo
/qa:recette-status --all --scope=sprint

# Monitoramento ao vivo de uma sessao
/qa:recette-status --session=REC-20260130-143022 --watch

# Saida em YAML
/qa:recette-status --session=REC-20260130-143022 --format=yaml

# Saida em JSON (para scripting)
/qa:recette-status --all --format=json
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
| `/qa:recette-fix` | Corrigir bugs de uma sessao |
| `/qa:recette-regression` | Ver testes de regressao |
| `/qa:recette-report` | Gerar relatorio |

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
