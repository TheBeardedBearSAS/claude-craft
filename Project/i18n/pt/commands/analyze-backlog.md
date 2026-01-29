---
description: Analisar a estrutura do backlog existente para migracao BMAD
argument-hint: [--format json|yaml|md]
---

# Analisar o Backlog

Analisar a estrutura atual do backlog para preparar a migracao para BMAD v6.

## Argumentos

$ARGUMENTS (formato: [--format formato_saida])
- **--format** (opcional): Formato de saida (json, yaml, md). Padrao: md

## Processo

### Etapa 1: Detectar a localizacao do backlog

Procurar os arquivos de backlog nas localizacoes comuns:
1. `project-management/backlog/` (padrao claude-craft)
2. `docs/backlog/` (alternativo)
3. `backlog/` (simples)
4. `.bmad/` (se ja migrado)

### Etapa 2: Analisar a estrutura

Para cada localizacao encontrada, identificar:
- **Epics**: Arquivos correspondentes a `EPIC-*.md`
- **User Stories**: Arquivos correspondentes a `US-*.md`
- **Tarefas**: Arquivos correspondentes a `TASK-*.md`
- **Arquivos indice**: `index.md`, `backlog.md`

### Etapa 3: Extrair os metadados

Para cada arquivo, extrair:
- ID (EPIC-XXX, US-XXX, TASK-XXX)
- Titulo/Nome
- Status (🔴 A fazer, 🟡 Em andamento, 🟢 Concluido, ⏸️ Bloqueado)
- Atribuicao de sprint
- Story points (para US)
- Relacoes pai (US → EPIC, TASK → US)

### Etapa 4: Validar a conformidade INVEST

Para cada User Story, verificar:
- [ ] **I**ndependente: Sem dependencias bloqueadoras
- [ ] **N**egociavel: Possui uma descricao (nao apenas um titulo)
- [ ] **V**aliosa: Possui uma declaracao de beneficio/valor
- [ ] **E**stimavel: Possui story points
- [ ] **S**uficientemente pequena: ≤ 8 pontos
- [ ] **T**estavel: Possui criterios de aceitacao

Pontuacao: 0-6 criterios aprovados.

### Etapa 5: Identificar as lacunas de migracao

Verificar a compatibilidade BMAD v6:
- [ ] Rastreamento de fase TDD (red/green/refactor)
- [ ] Lista de tarefas com rastreamento de conclusao
- [ ] Historico de status
- [ ] Atribuicao de sprint
- [ ] Estado de validacao dos criterios de aceitacao

### Etapa 6: Gerar o relatorio de compatibilidade

Criar um relatorio com:
1. **Resumo**: Total de epics, stories, tarefas encontradas
2. **Estrutura**: Organizacao atual dos arquivos
3. **Pontuacoes INVEST**: Conformidade por story
4. **Lacunas**: Campos BMAD v6 ausentes
5. **Recomendacoes**: Acoes sugeridas

## Formato de Saida

```
📊 Relatorio de Analise do Backlog
===================================

## Resumo
- Localizacao: project-management/backlog/
- Formato: Markdown (padrao claude-craft)
- Epics: {NUMERO}
- User Stories: {NUMERO}
- Tarefas: {NUMERO}

## Conformidade INVEST

| Story ID | Titulo | Pontuacao | Ausente |
|----------|--------|-----------|---------|
| US-001 | Login | 5/6 | Estimavel |
| US-002 | Cadastro | 6/6 | - |

Pontuacao INVEST media: {MEDIA}/6

## Recomendacoes

1. ⚠️ {NUMERO} stories sem story points
2. ✅ Estrutura compativel com BMAD v6
3. 📝 Executar `/project:migrate-backlog` para migrar
```

## Exemplo

```
/project:analyze-backlog
/project:analyze-backlog --format yaml
```

## Proximas Etapas

Apos a analise:
- `/project:migrate-backlog` - Converter para o formato BMAD v6
- `/project:update-stories` - Adicionar os campos ausentes
- `/project:sync-backlog` - Sincronizar com sprint-status.yaml
