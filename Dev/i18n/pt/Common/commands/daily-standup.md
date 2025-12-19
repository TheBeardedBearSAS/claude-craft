---
description: Geração de Resumo de Daily Stand-up
argument-hint: [arguments]
---

# Geração de Resumo de Daily Stand-up

Você é um assistente Scrum. Você deve gerar um resumo das atividades de desenvolvimento para facilitar a daily stand-up.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Período (padrão: desde ontem)

Exemplo: `/common:daily-standup` ou `/common:daily-standup "2024-01-15"`

## MISSÃO

### Etapa 1: Coletar Dados

```bash
# Commits desde ontem
git log --since="yesterday" --oneline --all

# Branches ativos
git branch -a --sort=-committerdate | head -10

# PRs abertos
gh pr list --state open

# Issues atuais
gh issue list --assignee @me --state open

# Arquivos modificados localmente
git status --short
```

### Etapa 2: Gerar Resumo

```
══════════════════════════════════════════════════════════════
📅 DAILY STAND-UP - {AAAA-MM-DD}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 RESUMO DO SPRINT
──────────────────────────────────────────────────────────────

Sprint: {N}
Dia: {X}/10
Pontos restantes: {Y}
Burndown: 📉 No ritmo / 📈 Adiantado / 📊 Atrasado

──────────────────────────────────────────────────────────────
✅ O QUE FOI FEITO (ONTEM)
──────────────────────────────────────────────────────────────

### Commits
- {hash} {mensagem} (@autor)
- {hash} {mensagem} (@autor)

### PRs Mergeados
- PR #123: {título} (@autor)

### Issues Fechados
- Issue #456: {título}

──────────────────────────────────────────────────────────────
🎯 O QUE ESTÁ PLANEJADO (HOJE)
──────────────────────────────────────────────────────────────

### Em Andamento
| Branch | Issue | Atribuído | Status |
|---------|-------|---------|--------|
| feature/auth | #45 | @dev1 | 🟡 70% |
| fix/login | #48 | @dev2 | 🟢 90% |

### Para Iniciar
- Issue #50: {título} (não atribuído)

──────────────────────────────────────────────────────────────
🚧 BLOQUEIOS / RISCOS
──────────────────────────────────────────────────────────────

| Bloqueio | Impacto | Ação Necessária |
|----------|--------|----------------|
| API externa fora do ar | PR #123 bloqueado | Contatar suporte |
| Review pendente | PR #125 há 2 dias | @dev3 disponível? |

──────────────────────────────────────────────────────────────
📈 PULL REQUESTS ATIVOS
──────────────────────────────────────────────────────────────

| PR | Título | Autor | Idade | Reviews |
|----|-------|--------|-----|---------|
| #125 | Adicionar login OAuth | @dev1 | 2d | 1/2 ✅ |
| #127 | Corrigir perfil usuário | @dev2 | 1d | 0/2 ⏳ |
| #128 | Atualizar deps | @bot | 3d | 0/1 ⏳ |

──────────────────────────────────────────────────────────────
💡 NOTAS / LEMBRETES
──────────────────────────────────────────────────────────────

- 🗓️ Refinamento de backlog amanhã 14h
- ⚠️ Prazo feature X: Sexta-feira
- 📣 Sprint Review: {data}
```

### Etapa 3: Formato Curto (para Slack/Teams)

```markdown
**📅 Daily - {AAAA-MM-DD}**

**Ontem:**
• PR #123 mergeado (OAuth Google)
• 5 commits no feature/auth

**Hoje:**
• Finalizar PR #125 (OAuth GitHub)
• Iniciar Issue #50 (Reset de senha)

**Bloqueios:**
• ⚠️ Review pendente PR #125 (@dev3)

**PRs para revisar:**
• PR #127 - Corrigir perfil usuário (0/2)
```

### Etapa 4: Métricas da Equipe

```
══════════════════════════════════════════════════════════════
👥 ATIVIDADE DA EQUIPE (Últimos 7 dias)
══════════════════════════════════════════════════════════════

| Membro | Commits | PRs | Reviews | Issues |
|--------|---------|-----|---------|--------|
| @dev1 | 12 | 3 | 5 | 4 |
| @dev2 | 8 | 2 | 3 | 3 |
| @dev3 | 15 | 4 | 8 | 5 |

──────────────────────────────────────────────────────────────
📊 VELOCIDADE ATUAL
──────────────────────────────────────────────────────────────

| Dia | Pontos Entregues | Acumulado | Ideal |
|------|---------------|--------|-------|
| D1 | 3 | 3 | 2.1 |
| D2 | 5 | 8 | 4.2 |
| D3 | 2 | 10 | 6.3 |
| D4 | 0 | 10 | 8.4 |
| D5 | ... | ... | 10.5 |

Status: 📈 Adiantado em 1.6 pontos
```

## Dicas para Daily Stand-up

### As 3 Perguntas Clássicas
1. O que eu fiz ontem?
2. O que farei hoje?
3. Há algum obstáculo?

### Boas Práticas
- **15 minutos no máximo** para toda a equipe
- **Em pé** (encoraja brevidade)
- **Mesmo horário** todos os dias
- **Sem resolução de problemas** (parking lot)
- **Foco no Objetivo do Sprint**

### Anti-Padrões a Evitar
- ❌ Reportar ao Scrum Master (fale com a equipe)
- ❌ Discussões técnicas longas
- ❌ Esperar sua vez sem ouvir
- ❌ "Trabalhei em X" (muito vago)

### Formato Alternativo: Walk the Board
1. Começar da coluna "Done"
2. Passar para "In Progress"
3. Depois "To Do"
4. Focar no que bloqueia o progresso

## Automação

### GitHub Action para Digest Diário

```yaml
name: Daily Digest
on:
  schedule:
    - cron: '0 7 * * 1-5'  # 7h Segunda a Sexta
  workflow_dispatch:

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Gerar Digest
        run: |
          echo "# Digest Diário - $(date +%Y-%m-%d)" > digest.md
          echo "" >> digest.md
          echo "## Commits (24h)" >> digest.md
          git log --since="24 hours ago" --oneline >> digest.md
          echo "" >> digest.md
          echo "## PRs Abertos" >> digest.md
          gh pr list --state open --json number,title,author >> digest.md

      - name: Postar no Slack
        uses: slackapi/slack-github-action@v1
        with:
          channel-id: 'daily-standup'
          payload-file-path: digest.md
```
