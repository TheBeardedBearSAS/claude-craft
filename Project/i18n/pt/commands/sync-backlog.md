---
description: Sincronizar os arquivos do backlog com sprint-status.yaml
argument-hint: [--direction source] [--dry-run]
---

# Sync Backlog

Sincronizacao bidirecional entre os arquivos markdown do backlog e sprint-status.yaml.

## Argumentos

$ARGUMENTS (formato: [--direction source] [--dry-run])
- **--direction** (opcional): Direcao da sincronizacao
  - `files-to-yaml`: Atualizar sprint-status.yaml a partir dos arquivos markdown
  - `yaml-to-files`: Atualizar os arquivos markdown a partir de sprint-status.yaml
  - `bidirectional`: Mesclar os dois (padrao, o mais recente prevalece)
- **--dry-run** (opcional): Pre-visualizar as mudancas sem aplica-las

## Processo

### Etapa 1: Carregar as duas fontes

1. Analisar `.bmad/sprint-status.yaml`
2. Analisar todos os arquivos de story do diretorio de backlog
3. Construir o mapa de comparacao por story ID

### Etapa 2: Detectar os conflitos

Para cada story, comparar:
- Status
- Contagem de tarefas concluidas
- Validacao dos criterios de aceitacao
- Fase TDD
- Atribuicao

Deteccao de conflitos:
```yaml
conflicts:
  US-001:
    field: status
    yaml_value: "in-progress"
    file_value: "🟢 Done"
    yaml_timestamp: "2026-01-29T09:00:00Z"
    file_timestamp: "2026-01-29T10:00:00Z"
    resolution: "file"  # o mais recente prevalece
```

### Etapa 3: Resolver os conflitos

Estrategias de resolucao:
1. **newest-wins** (padrao): Usar o valor modificado mais recentemente
2. **yaml-wins**: Sempre preferir sprint-status.yaml
3. **files-win**: Sempre preferir os arquivos markdown
4. **prompt**: Perguntar ao usuario para cada conflito

### Etapa 4: Sync arquivos → YAML

Atualizar sprint-status.yaml com:
- Novas stories encontradas nos arquivos
- Mudancas de status dos arquivos
- Atualizacoes de tarefas dos arquivos
- Validacao de AC dos arquivos

### Etapa 5: Sync YAML → arquivos

Atualizar os arquivos markdown com:
- Fase TDD (adicionar ao comentario de metadados)
- Historico (adicionar ao comentario de metadados)
- Pontuacao INVEST (adicionar ao comentario de metadados)
- Timestamp de sincronizacao

### Etapa 6: Tratar os orfaos

- **Stories no YAML mas nao nos arquivos**: Marcar como `archived` ou alertar
- **Stories nos arquivos mas nao no YAML**: Adicionar a sprint-status.yaml

### Etapa 7: Atualizar os timestamps

Adicionar o timestamp de ultima sincronizacao em ambos:
- `.bmad/sprint-status.yaml`: `last_sync: "2026-01-29T10:00:00Z"`
- Arquivos de story: `<!-- last_sync: 2026-01-29T10:00:00Z -->`

## Formato de Saida

```
🔄 Sincronizacao do Backlog
==============================

## Direcao: Bidirecional

## Mudancas Detectadas

### Arquivos → YAML (4 mudancas)
| Story | Campo | Antigo | Novo |
|-------|-------|--------|------|
| US-001 | status | in-progress | done |
| US-002 | tasks.completed | 2 | 3 |

### YAML → Arquivos (2 mudancas)
| Story | Campo | Antigo | Novo |
|-------|-------|--------|------|
| US-003 | tdd_phase | - | green |
| US-004 | invest_score | - | 5/6 |

## Conflitos Resolvidos

| Story | Campo | Resolucao | Valor |
|-------|-------|-----------|-------|
| US-005 | status | newest-wins | done |

## Orfaos

### Apenas no YAML (arquivados):
- US-010: "Funcionalidade antiga" (arquivado em 2026-01-15)

### Apenas nos arquivos (adicionados ao YAML):
- US-015: "Nova funcionalidade"

## Sincronizacao Concluida

✅ sprint-status.yaml atualizado
✅ 12 arquivos de story atualizados
⏰ Ultima sincronizacao: 2026-01-29T10:00:00Z

## Proximas Etapas
- Verificar as mudancas com git diff
- Executar `/sprint:status` para verificar
```

## Saida Dry Run

```
🔄 Sincronizacao do Backlog (DRY RUN)
========================================

⚠️ Nenhuma modificacao sera realizada

## Mudaria:

### sprint-status.yaml
- US-001.status: "in-progress" → "done"
- US-002.tasks.completed: 2 → 3

### Arquivos de Story
- US-003: Adicionar metadado tdd_phase
- US-004: Adicionar metadado invest_score

Executar sem --dry-run para aplicar as mudancas.
```

## Exemplo

```
/project:sync-backlog
/project:sync-backlog --direction files-to-yaml
/project:sync-backlog --direction yaml-to-files --dry-run
```

## Automacao

Adicionar ao hook pre-commit para sincronizacao automatica:
```bash
# .bmad/hooks/pre-commit.sh
/project:sync-backlog --direction files-to-yaml
```
