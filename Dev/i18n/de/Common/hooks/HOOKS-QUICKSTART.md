# Hooks-Schnellstart

Claude-Code-Hooks für automatisierte Qualitätskontrolle und Sicherheit, die claude-craft in Ihrem Projekt installiert.

## Installation

1. **Mit dem Installer installieren** (kopiert die Skripte nach `.claude/hooks/` und führt die Hooks in `.claude/settings.json` zusammen, ohne Ihre eigenen zu überschreiben):
   ```bash
   bash Dev/scripts/install-common-rules.sh --hooks=default /pfad/zum/projekt
   # oder über die CLI: npx @the-bearded-bear/claude-craft install . --hooks=default
   ```
   - `--hooks=default` (Standard): Sicherheitswächter, Secrets-Prüfung, Hinweise bei großen Ausgaben, Wiedereinspeisung des Kontexts nach der Compaction.
   - `--hooks=full`: `default` plus Stop-Testschranke, Lint nach Änderungen, Slack-Benachrichtigung, Sitzungsmetriken und Wiederherstellungshinweise nach Tool-Fehlern.
   - `--hooks=none`: keine Hooks. Mit `,memory` (z. B. `--hooks=default,memory`) kommt das SQLite-Gedächtnis über Sitzungen hinweg hinzu (benötigt `sqlite3` und `jq`).

2. **Anpassen**: Bearbeiten Sie die Skripte in `.claude/hooks/` passend zu Ihren Werkzeugen. Ein erneuter Installer-Lauf entfernt oder überschreibt Ihre eigenen Hooks nie.

3. **Manuell zusammenführen**, falls gewünscht: Die Fragmente heißen `hooks.default.json`, `hooks.full.json` und `hooks.memory.json` (`node <claude-craft>/Dev/scripts/lib/merge-hooks.mjs add --settings .claude/settings.json --fragment <Fragment>`). Anpassbare Beispiele werden nach `.claude/templates/hooks/` kopiert.

## Verfügbare Hooks

| Hook | Zweck | Event | Profil |
|------|-------|-------|--------|
| `guard-network.sh` | Blockiert Herunterladen und Ausführen (`curl \| sh`) | PreToolUse | default |
| `block-dangerous-commands.sh` | Blockiert `rm -rf /`, `sudo`, `chmod 777`... | PreToolUse | default |
| `pre-commit-check.sh` | Blockiert Secrets in Commits | PreToolUse | default |
| `protect-sensitive-files.sh` | Blockiert Änderungen an `.env`, Schlüsseln... | PreToolUse | default |
| `output-size-hint.sh` | Rät, große Ausgaben zusammenzufassen | PostToolUse | default |
| `post-edit-lint.sh` | Automatisches Lint nach Änderungen | PostToolUse | full |
| `quality-gate.sh` | Führt Tests vor dem Abschluss aus | Stop | full |
| `notify-slack.sh` | Slack-Benachrichtigungen | Notification | full |
| `session-init.sh` | Erkennt den Stack, exportiert sichere `.env.local`-Variablen | SessionStart | full |
| `session-end.sh` | Sitzungsprotokoll und Metriken | SessionEnd | full |
| `post-tool-failure.sh` | Wiederherstellungshinweise nach Tool-Fehlern | PostToolUseFailure | full |
| `pre-compact.sh` | Sichert den BMAD-Zustand vor der Compaction | PreCompact | optional (nicht eingebunden) |
| `output-filter.sh` | Kürzt Ausgaben über 50 KB | PostToolUse | optional (Beispiel) |

## Gut zu wissen

- Die Nutzdaten kommen als **JSON über stdin**; nur der **Exit-Code 2** blockiert (jeder andere Wert ungleich null ist ein nicht blockierender Fehler).
- Nur `hookSpecificOutput.additionalContext` erreicht das Modell; der Klartext-stdout von PreCompact wird als Compaction-Anweisung gelesen.
- Die Skripte brauchen `jq` oder `node`, um die Nutzdaten zu lesen: Die Sicherheitswächter blockieren, wenn keines verfügbar ist, die informativen Hooks tun nichts.

## Weitere Informationen

Vollständige Dokumentation: [docs/HOOKS.md](/docs/HOOKS.md) und die offizielle Referenz <https://code.claude.com/docs/en/hooks>.
