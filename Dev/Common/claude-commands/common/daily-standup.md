# Génération Résumé Daily Stand-up

Tu es un assistant Scrum. Tu dois générer un résumé des activités de développement pour faciliter le daily stand-up.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Période (défaut: depuis hier)

Exemple : `/common:daily-standup` ou `/common:daily-standup "2024-01-15"`

## MISSION

### Étape 1 : Collecter les Données

```bash
# Commits depuis hier
git log --since="yesterday" --oneline --all

# Branches actives
git branch -a --sort=-committerdate | head -10

# PRs ouvertes
gh pr list --state open

# Issues en cours
gh issue list --assignee @me --state open

# Fichiers modifiés localement
git status --short
```

### Étape 2 : Générer le Résumé

```
══════════════════════════════════════════════════════════════
📅 DAILY STAND-UP - {YYYY-MM-DD}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 RÉSUMÉ SPRINT
──────────────────────────────────────────────────────────────

Sprint : {N}
Jour : {X}/10
Points restants : {Y}
Burndown : 📉 On track / 📈 En avance / 📊 En retard

──────────────────────────────────────────────────────────────
✅ CE QUI A ÉTÉ FAIT (HIER)
──────────────────────────────────────────────────────────────

### Commits
- {hash} {message} (@author)
- {hash} {message} (@author)

### PRs Mergées
- PR #123: {title} (@author)

### Issues Fermées
- Issue #456: {title}

──────────────────────────────────────────────────────────────
🎯 CE QUI EST PRÉVU (AUJOURD'HUI)
──────────────────────────────────────────────────────────────

### En cours
| Branche | Issue | Assigné | Status |
|---------|-------|---------|--------|
| feature/auth | #45 | @dev1 | 🟡 70% |
| fix/login | #48 | @dev2 | 🟢 90% |

### À commencer
- Issue #50: {title} (non assignée)

──────────────────────────────────────────────────────────────
🚧 BLOQUEURS / RISQUES
──────────────────────────────────────────────────────────────

| Bloqueur | Impact | Action requise |
|----------|--------|----------------|
| API externe down | PR #123 bloquée | Contacter support |
| Review en attente | PR #125 depuis 2j | @dev3 dispo ? |

──────────────────────────────────────────────────────────────
📈 PULL REQUESTS ACTIVES
──────────────────────────────────────────────────────────────

| PR | Titre | Auteur | Age | Reviews |
|----|-------|--------|-----|---------|
| #125 | Add OAuth login | @dev1 | 2j | 1/2 ✅ |
| #127 | Fix user profile | @dev2 | 1j | 0/2 ⏳ |
| #128 | Update deps | @bot | 3j | 0/1 ⏳ |

──────────────────────────────────────────────────────────────
💡 NOTES / RAPPELS
──────────────────────────────────────────────────────────────

- 🗓️ Backlog refinement demain 14h
- ⚠️ Deadline feature X : vendredi
- 📣 Sprint Review : {date}
```

### Étape 3 : Format Court (pour Slack/Teams)

```markdown
**📅 Daily - {YYYY-MM-DD}**

**Hier :**
• PR #123 mergée (OAuth Google)
• 5 commits sur feature/auth

**Aujourd'hui :**
• Finir PR #125 (OAuth GitHub)
• Commencer Issue #50 (Reset password)

**Bloqueurs :**
• ⚠️ Review en attente PR #125 (@dev3)

**PRs à review :**
• PR #127 - Fix user profile (0/2)
```

### Étape 4 : Métriques Équipe

```
══════════════════════════════════════════════════════════════
👥 ACTIVITÉ ÉQUIPE (7 derniers jours)
══════════════════════════════════════════════════════════════

| Membre | Commits | PRs | Reviews | Issues |
|--------|---------|-----|---------|--------|
| @dev1 | 12 | 3 | 5 | 4 |
| @dev2 | 8 | 2 | 3 | 3 |
| @dev3 | 15 | 4 | 8 | 5 |

──────────────────────────────────────────────────────────────
📊 VÉLOCITÉ ACTUELLE
──────────────────────────────────────────────────────────────

| Jour | Points livrés | Cumulé | Idéal |
|------|---------------|--------|-------|
| J1 | 3 | 3 | 2.1 |
| J2 | 5 | 8 | 4.2 |
| J3 | 2 | 10 | 6.3 |
| J4 | 0 | 10 | 8.4 |
| J5 | ... | ... | 10.5 |

Status : 📈 En avance de 1.6 points
```

## Conseils Daily Stand-up

### Les 3 Questions Classiques
1. Qu'ai-je fait hier ?
2. Que vais-je faire aujourd'hui ?
3. Y a-t-il des obstacles ?

### Bonnes Pratiques
- **15 minutes max** pour toute l'équipe
- **Debout** (encourage la brièveté)
- **Même heure** chaque jour
- **Pas de résolution de problème** (parking lot)
- **Focus sur le Sprint Goal**

### Anti-Patterns à Éviter
- ❌ Rapport au Scrum Master (parler à l'équipe)
- ❌ Discussions techniques longues
- ❌ Attendre son tour sans écouter
- ❌ "J'ai travaillé sur X" (trop vague)

### Format Alternatif : Walk the Board
1. Partir de la colonne "Done"
2. Remonter vers "In Progress"
3. Puis "To Do"
4. Focus sur ce qui bloque l'avancement

## Automatisation

### GitHub Action pour Daily Digest

```yaml
name: Daily Digest
on:
  schedule:
    - cron: '0 7 * * 1-5'  # 7h du lundi au vendredi
  workflow_dispatch:

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate Digest
        run: |
          echo "# Daily Digest - $(date +%Y-%m-%d)" > digest.md
          echo "" >> digest.md
          echo "## Commits (24h)" >> digest.md
          git log --since="24 hours ago" --oneline >> digest.md
          echo "" >> digest.md
          echo "## Open PRs" >> digest.md
          gh pr list --state open --json number,title,author >> digest.md

      - name: Post to Slack
        uses: slackapi/slack-github-action@v1
        with:
          channel-id: 'daily-standup'
          payload-file-path: digest.md
```
