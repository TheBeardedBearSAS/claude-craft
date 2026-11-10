# Guide de démarrage rapide des hooks

Hooks Claude Code de contrôle qualité et de sécurité automatisés, installés dans votre projet par claude-craft.

## Installation

1. **Installer avec l'installeur** (copie les scripts dans `.claude/hooks/` et fusionne les hooks dans `.claude/settings.json` sans écraser les vôtres) :
   ```bash
   bash Dev/scripts/install-common-rules.sh --hooks=default /chemin/du/projet
   # ou via le CLI : npx @the-bearded-bear/claude-craft install . --hooks=default
   ```
   - `--hooks=default` (défaut) : gardes de sécurité, contrôle des secrets, conseils sur les sorties volumineuses, réinjection du contexte après compaction.
   - `--hooks=full` : `default` plus la porte de tests Stop, le lint post-édition, la notification Slack, les métriques de session et les pistes de récupération après échec d'outil.
   - `--hooks=none` : aucun hook. Ajoutez `,memory` (ex. `--hooks=default,memory`) pour l'add-on de mémoire SQLite inter-sessions (requiert `sqlite3` et `jq`).

2. **Personnaliser** : éditez les scripts de `.claude/hooks/` selon vos outils. Relancer l'installeur ne retire ni ne réécrit jamais vos propres hooks.

3. **Fusionner à la main** si vous préférez : les fragments sont `hooks.default.json`, `hooks.full.json` et `hooks.memory.json` (`node <claude-craft>/Dev/scripts/lib/merge-hooks.mjs add --settings .claude/settings.json --fragment <fragment>`). Des exemples à adapter sont copiés dans `.claude/templates/hooks/`.

## Hooks disponibles

| Hook | Rôle | Événement | Profil |
|------|------|-----------|--------|
| `guard-network.sh` | Bloque télécharger puis exécuter (`curl \| sh`) | PreToolUse | default |
| `block-dangerous-commands.sh` | Bloque `rm -rf /`, `sudo`, `chmod 777`... | PreToolUse | default |
| `pre-commit-check.sh` | Bloque les secrets dans les commits | PreToolUse | default |
| `protect-sensitive-files.sh` | Bloque l'édition de `.env`, clés... | PreToolUse | default |
| `output-size-hint.sh` | Conseille de résumer les grosses sorties | PostToolUse | default |
| `post-edit-lint.sh` | Lint automatique après édition | PostToolUse | full |
| `quality-gate.sh` | Lance les tests avant de terminer | Stop | full |
| `notify-slack.sh` | Notifications Slack | Notification | full |
| `session-init.sh` | Détecte la stack, exporte les variables `.env.local` sûres | SessionStart | full |
| `session-end.sh` | Journal et métriques de session | SessionEnd | full |
| `post-tool-failure.sh` | Pistes de récupération après un échec d'outil | PostToolUseFailure | full |
| `pre-compact.sh` | Sauvegarde l'état BMAD avant compaction | PreCompact | optionnel (non branché) |
| `output-filter.sh` | Tronque les sorties de plus de 50 Ko | PostToolUse | optionnel (exemple) |

## À savoir

- Le payload arrive en **JSON sur stdin** ; seul le **code de sortie 2** bloque (tout autre code non nul est une erreur non bloquante).
- Seul `hookSpecificOutput.additionalContext` atteint le modèle ; le stdout en texte brut de PreCompact est lu comme consignes de compaction.
- Les scripts ont besoin de `jq` ou `node` pour lire le payload : les gardes de sécurité bloquent si aucun n'est disponible, les hooks informatifs ne font rien.

## Pour aller plus loin

Documentation complète : [docs/HOOKS.md](/docs/HOOKS.md) et la référence officielle <https://code.claude.com/docs/en/hooks>.
