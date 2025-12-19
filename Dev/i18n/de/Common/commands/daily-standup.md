---
description: Daily Stand-up Zusammenfassung
argument-hint: [arguments]
---

# Daily Stand-up Zusammenfassung

Sie sind ein Scrum-Assistent. Sie müssen eine Zusammenfassung der Entwicklungsaktivitäten erstellen, um das tägliche Stand-up zu erleichtern.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Zeitraum (Standard: seit gestern)

Beispiel: `/common:daily-standup` oder `/common:daily-standup "2024-01-15"`

## MISSION

### Schritt 1: Daten sammeln

```bash
# Commits seit gestern
git log --since="yesterday" --oneline --all

# Aktive Branches
git branch -a --sort=-committerdate | head -10

# Offene PRs
gh pr list --state open

# Aktuelle Issues
gh issue list --assignee @me --state open

# Lokal geänderte Dateien
git status --short
```

### Schritt 2: Zusammenfassung erstellen

```
══════════════════════════════════════════════════════════════
📅 DAILY STAND-UP - {YYYY-MM-DD}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 SPRINT-ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

Sprint: {N}
Tag: {X}/10
Verbleibende Punkte: {Y}
Burndown: 📉 Im Plan / 📈 Voraus / 📊 Verzögert

──────────────────────────────────────────────────────────────
✅ WAS ERLEDIGT WURDE (GESTERN)
──────────────────────────────────────────────────────────────

### Commits
- {hash} {Nachricht} (@autor)
- {hash} {Nachricht} (@autor)

### Gemergte PRs
- PR #123: {Titel} (@autor)

### Geschlossene Issues
- Issue #456: {Titel}

──────────────────────────────────────────────────────────────
🎯 WAS GEPLANT IST (HEUTE)
──────────────────────────────────────────────────────────────

### In Bearbeitung
| Branch | Issue | Zugewiesen | Status |
|---------|-------|-----------|--------|
| feature/auth | #45 | @dev1 | 🟡 70% |
| fix/login | #48 | @dev2 | 🟢 90% |

### Zu starten
- Issue #50: {Titel} (nicht zugewiesen)

──────────────────────────────────────────────────────────────
🚧 BLOCKER / RISIKEN
──────────────────────────────────────────────────────────────

| Blocker | Auswirkung | Erforderliche Aktion |
|----------|------------|---------------------|
| Externe API ausgefallen | PR #123 blockiert | Support kontaktieren |
| Review ausstehend | PR #125 seit 2 Tagen | @dev3 verfügbar? |

──────────────────────────────────────────────────────────────
📈 AKTIVE PULL REQUESTS
──────────────────────────────────────────────────────────────

| PR | Titel | Autor | Alter | Reviews |
|----|-------|-------|-------|---------|
| #125 | OAuth-Login hinzufügen | @dev1 | 2d | 1/2 ✅ |
| #127 | Benutzerprofil reparieren | @dev2 | 1d | 0/2 ⏳ |
| #128 | Abhängigkeiten aktualisieren | @bot | 3d | 0/1 ⏳ |

──────────────────────────────────────────────────────────────
💡 NOTIZEN / ERINNERUNGEN
──────────────────────────────────────────────────────────────

- 🗓️ Backlog-Refinement morgen 14 Uhr
- ⚠️ Feature X Deadline: Freitag
- 📣 Sprint Review: {Datum}
```

### Schritt 3: Kurzformat (für Slack/Teams)

```markdown
**📅 Daily - {YYYY-MM-DD}**

**Gestern:**
• PR #123 gemergt (Google OAuth)
• 5 Commits auf feature/auth

**Heute:**
• PR #125 fertigstellen (GitHub OAuth)
• Issue #50 starten (Passwort zurücksetzen)

**Blocker:**
• ⚠️ Review ausstehend PR #125 (@dev3)

**PRs zum Review:**
• PR #127 - Benutzerprofil reparieren (0/2)
```

### Schritt 4: Team-Metriken

```
══════════════════════════════════════════════════════════════
👥 TEAM-AKTIVITÄT (Letzte 7 Tage)
══════════════════════════════════════════════════════════════

| Mitglied | Commits | PRs | Reviews | Issues |
|----------|---------|-----|---------|--------|
| @dev1 | 12 | 3 | 5 | 4 |
| @dev2 | 8 | 2 | 3 | 3 |
| @dev3 | 15 | 4 | 8 | 5 |

──────────────────────────────────────────────────────────────
📊 AKTUELLE VELOCITY
──────────────────────────────────────────────────────────────

| Tag | Gelieferte Punkte | Kumulativ | Ideal |
|------|------------------|-----------|-------|
| T1 | 3 | 3 | 2.1 |
| T2 | 5 | 8 | 4.2 |
| T3 | 2 | 10 | 6.3 |
| T4 | 0 | 10 | 8.4 |
| T5 | ... | ... | 10.5 |

Status: 📈 1,6 Punkte voraus
```

## Daily Stand-up Tipps

### Die 3 klassischen Fragen
1. Was habe ich gestern gemacht?
2. Was werde ich heute machen?
3. Gibt es Hindernisse?

### Best Practices
- **15 Minuten max** für das gesamte Team
- **Im Stehen** (fördert Kürze)
- **Gleiche Zeit** jeden Tag
- **Keine Problemlösung** (Parking Lot)
- **Fokus auf Sprint-Ziel**

### Zu vermeidende Anti-Patterns
- ❌ Berichterstattung an Scrum Master (sprechen Sie mit dem Team)
- ❌ Lange technische Diskussionen
- ❌ Auf die eigene Reihe warten ohne zuzuhören
- ❌ "Ich habe an X gearbeitet" (zu vage)

### Alternatives Format: Walk the Board
1. Beginnen Sie mit der "Done"-Spalte
2. Gehen Sie zu "In Progress"
3. Dann "To Do"
4. Fokus auf was den Fortschritt blockiert

## Automatisierung

### GitHub Action für Daily Digest

```yaml
name: Daily Digest
on:
  schedule:
    - cron: '0 7 * * 1-5'  # 7 Uhr Montag bis Freitag
  workflow_dispatch:

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Digest erstellen
        run: |
          echo "# Daily Digest - $(date +%Y-%m-%d)" > digest.md
          echo "" >> digest.md
          echo "## Commits (24h)" >> digest.md
          git log --since="24 hours ago" --oneline >> digest.md
          echo "" >> digest.md
          echo "## Offene PRs" >> digest.md
          gh pr list --state open --json number,title,author >> digest.md

      - name: Zu Slack posten
        uses: slackapi/slack-github-action@v1
        with:
          channel-id: 'daily-standup'
          payload-file-path: digest.md
```
