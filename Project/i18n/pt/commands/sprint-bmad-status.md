---
description: Exibir o status do sprint BMAD com informacoes de roteamento
argument-hint: [--verbose]
---

# Status Sprint BMAD

Exibir o status completo do sprint utilizando o rastreamento BMAD v6 com roteamento baseado em maquina de estados.

## Argumentos

$ARGUMENTS (formato: [--verbose])
- **--verbose** (opcional): Exibir o detalhe das tarefas por story

## Processo

### Etapa 1: Carregar sprint-status.yaml

1. Ler `.bmad/sprint-status.yaml`
2. Analisar metadados, stories, regras de roteamento
3. Se o arquivo nao existir, sugerir `/project:migrate-backlog`

### Etapa 2: Extrair os metadados

Exibir as informacoes do sprint:
- ID e nome do sprint
- Datas de inicio e fim
- Objetivo do sprint
- Dias restantes

### Etapa 3: Contar as stories por status

Agregar as stories por estado:
- 📋 Backlog
- 🎯 Pronto para Dev
- 🔄 Em Andamento
- 👀 Review
- ✅ Concluido
- ⛔ Bloqueado

Calcular:
- Total de story points planejados
- Story points concluidos
- Velocidade (se historico disponivel)
- Progresso do burndown

### Etapa 4: Exibir a maquina de estados

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

### Etapa 5: Exibir a visao detalhada (se --verbose)

Para cada story:
- ID e titulo
- Status atual e fase TDD
- Detalhe das tarefas (concluidas/total)
- Status dos criterios de aceitacao
- Tarefa em andamento
- Tempo no status atual

### Etapa 6: Sugestoes de auto-roteamento

Verificar se transicoes automaticas deveriam ocorrer:
- Stories com todas as tarefas completas → sugerir passagem para review
- Stories desbloqueadas → sugerir retomada do status anterior

## Formato de Saida

```
═══════════════════════════════════════════════════════
                  Status Sprint BMAD
═══════════════════════════════════════════════════════

Sprint: {SPRINT_ID} - {NOME_SPRINT}
Periodo: {DATA_INICIO} → {DATA_FIM} ({DIAS_RESTANTES} dias restantes)
Objetivo: {OBJETIVO_SPRINT}

Progresso: ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 40% (24/60 pts)

Stories por Status:
──────────────────────────────────────────────────────
📋 Backlog:        2
🎯 Pronto para Dev: 3
🔄 Em Andamento:   2
👀 Review:         1
✅ Concluido:      4
⛔ Bloqueado:      1

Em Andamento:
──────────────────────────────────────────────────────
🔄 US-005: Autenticacao de usuario
   TDD: 🟢 Green | Tarefas: 3/5 | CA: 1/3
   Em andamento: TASK-015 - Implementar validacao JWT

Bloqueado:
──────────────────────────────────────────────────────
⛔ US-003: Integracao OAuth
   Motivo: Aguardando credenciais da API
   Bloqueado desde: 2026-01-27 (2 dias)

Sugestoes de auto-roteamento:
──────────────────────────────────────────────────────
💡 US-008 tem todas as tarefas completas → /sprint:transition US-008 review

Comandos:
  /sprint:next-story         Pegar a proxima story
  /sprint:transition <ID>    Alterar o status
  /sprint:auto-route        Aplicar as transicoes automaticas
═══════════════════════════════════════════════════════
```

## Exemplo

```
/sprint:bmad-status
/sprint:bmad-status --verbose
```
