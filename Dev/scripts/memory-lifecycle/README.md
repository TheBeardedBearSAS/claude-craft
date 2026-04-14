# Memory Lifecycle — Persistent memory across Claude Code sessions

**Inspiré de** [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) (49.6k stars).

Système de mémoire persistante **100% local** qui capture sessions, prompts, et utilisation d'outils dans une base SQLite locale, permettant le rappel cross-sessions sans cloud ni télémétrie.

## Architecture

```
Session lifecycle
  ├─ SessionStart      → init DB + recall previous session summary
  ├─ UserPromptSubmit  → log prompt preview (200 chars max)
  ├─ PostToolUse       → log Edit/Write/Bash events (target + summary)
  ├─ PreCompact        → preserve context + re-inject before compaction
  └─ SessionEnd        → compute session summary
```

## Schéma SQLite

```sql
sessions     (id, started_at, ended_at, project_dir, git_branch, git_commit, summary)
prompts      (id, session_id, submitted_at, prompt_preview, token_estimate)
tool_events  (id, session_id, occurred_at, tool_name, target_path, summary)
compactions  (id, session_id, compacted_at, preserved_context)
```

## Installation

### 1. Prérequis

- `sqlite3` (package système : `apt install sqlite3` / `brew install sqlite3`)
- `jq` (package système : `apt install jq` / `brew install jq`)
- `bash` 4+

### 2. Activer les hooks

Copier le contenu de `.claude/templates/hooks/memory-lifecycle.json` dans votre `.claude/settings.json` :

```bash
# Fusion manuelle dans .claude/settings.json
cat .claude/templates/hooks/memory-lifecycle.json
```

Ou via la commande Claude Craft (à venir) : `/common:setup-memory-lifecycle`.

### 3. Vérifier

Démarrer une nouvelle session Claude Code. La base est créée automatiquement :

```bash
ls -la .claude/memory.db
sqlite3 .claude/memory.db "SELECT * FROM sessions LIMIT 1;"
```

## Usage

### Consulter les sessions passées

```bash
sqlite3 .claude/memory.db \
  "SELECT id, started_at, summary FROM sessions ORDER BY started_at DESC LIMIT 10;"
```

### Top fichiers édités cette semaine

```bash
sqlite3 .claude/memory.db <<SQL
SELECT target_path, COUNT(*) as edits
FROM tool_events
WHERE tool_name IN ('Edit', 'Write')
  AND occurred_at > datetime('now', '-7 days')
GROUP BY target_path
ORDER BY edits DESC
LIMIT 10;
SQL
```

### Recall depuis une autre session

Automatique via `SessionStart` — le résumé de la dernière session est injecté en `systemMessage`.

## Confidentialité

- **100% local** — base SQLite dans `.claude/memory.db`
- **Zéro télémétrie** — pas de network call
- **Gitignored** — jamais commité (`.claude/memory.db` dans `.gitignore`)
- **Previews only** — prompts tronqués à 200 chars, tool output à 300 chars
- **Hash projet** — session ID contient un hash SHA1 du path, pas le path complet

## Nettoyage

Purger les sessions de plus de 90 jours :

```bash
sqlite3 .claude/memory.db \
  "DELETE FROM sessions WHERE started_at < datetime('now', '-90 days');
   DELETE FROM prompts WHERE session_id NOT IN (SELECT id FROM sessions);
   DELETE FROM tool_events WHERE session_id NOT IN (SELECT id FROM sessions);
   VACUUM;"
```

## Désactivation

Retirer les hooks de `.claude/settings.json`. La base `.claude/memory.db` peut être supprimée sans impact.

## Limitations (v7.35.0)

- Pas de compression IA des sessions (claude-mem original utilise Anthropic API pour summarize → hors scope local-first)
- Pas de Web UI (prévu en v8+ si demande)
- Pas de recherche sémantique (SQL LIKE uniquement)
- Un session ID par jour par projet (simplicité vs granularité)

## Ressources

- [claude-mem](https://github.com/thedotmack/claude-mem) — implémentation originale
- `.claude/templates/hooks/memory-lifecycle.json` — template hook
- `.claude/rules/12-context-management.md` — stratégie contexte
