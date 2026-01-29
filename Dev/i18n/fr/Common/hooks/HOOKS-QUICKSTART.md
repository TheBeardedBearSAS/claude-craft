# Guide de Demarrage Rapide - Hooks

Ce repertoire contient les hooks Claude Code pour le controle qualite automatise.

## Installation

1. **Copier les hooks dans votre projet:**
   ```bash
   cp -r .claude/hooks/scripts/* .claude/hooks/
   chmod +x .claude/hooks/*.sh
   ```

2. **Activer les hooks dans settings.json:**
   Copiez la configuration de `hooks/templates/settings-hooks.json` vers `.claude/settings.json`.

3. **Personnaliser selon vos besoins** - Editez les scripts selon les outils de votre projet.

## Hooks Disponibles

| Hook | Fonction | Evenement |
|------|----------|-----------|
| `pre-commit-check.sh` | Bloquer les secrets dans les commits | PreToolUse |
| `post-edit-lint.sh` | Linter automatique apres edition | PostToolUse |
| `quality-gate.sh` | Executer les tests avant completion | Stop |
| `session-init.sh` | Charger le contexte projet | SessionStart |
| `notify-slack.sh` | Notifications Slack | Notification |
| `block-dangerous-commands.sh` | Bloquer rm -rf, sudo, etc. | PreToolUse |
| `setup-init.sh` | Initialiser le projet au premier lancement | Setup |

## Evenements Hook (11 au total)

- **PreToolUse / PostToolUse** - Avant/apres execution d'outil
- **Stop / SubagentStop** - Quand l'agent termine
- **SessionStart / SessionEnd** - Cycle de vie de session
- **Setup** - Sur `--init`, `--init-only`, `--maintenance` (v2.1.20+)
- **PermissionRequest** - Dialogues de permission
- **UserPromptSubmit** - Saisie utilisateur
- **Notification** - Notifications
- **PreCompact** - Avant compaction du contexte

## Activation Rapide

Ajoutez a votre `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{"type": "command", "command": ".claude/hooks/quality-gate.sh"}]
    }]
  }
}
```

## Plus d'informations

Documentation complete: [docs/HOOKS.md](/docs/HOOKS.md)
