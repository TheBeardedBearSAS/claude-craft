---
description: Installer et configurer RTK (Rust Token Killer) pour l'optimisation des tokens
argument-hint: [--install|--check|--uninstall]
---

# Setup RTK (Optimiseur de Tokens)

Installer et configurer RTK pour reduire la consommation de tokens Claude Code de 60-90%.

## Plan Mode

> **Pas de plan mode requis.** Cette commande execute un script d'installation deterministe.

## Execution

### Phase 1 : Verification des prerequis

Verifier la disponibilite des outils requis :

```
╔══════════════════════════════════════════════════════════════╗
║              RTK - Configuration Optimiseur de Tokens        ║
╚══════════════════════════════════════════════════════════════╝

Prerequis :
  ✓ jq installe
  ✓ curl installe
```

Si des prerequis manquent, afficher les instructions d'installation et arreter.

### Phase 2 : Installation du binaire RTK

Verifier si RTK est deja installe (`command -v rtk`). Sinon, installer via l'installeur officiel :

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

Verifier l'installation avec `rtk --version`.

### Phase 3 : Configuration des hooks

Executer `rtk init -g --no-patch` pour creer :
- `~/.claude/hooks/rtk-rewrite.sh` — Le script hook PreToolUse
- `~/.claude/RTK.md` — Reference de configuration RTK

Puis **fusionner de maniere sure** le hook dans `~/.claude/settings.json` :
- Sauvegarde de settings.json avant modification
- Ajout du hook RTK au tableau `.hooks.PreToolUse[]`
- Conservation de tous les hooks existants (securite, etc.)
- Saut si deja present (idempotent)

### Phase 4 : Verification

Verifier que tous les composants sont correctement installes :

```
Verification :
  ✓ Binaire RTK (rtk 0.22.1)
  ✓ Script hook (~/.claude/hooks/rtk-rewrite.sh)
  ✓ Entree hook settings.json
```

Afficher les economies de tokens si disponibles (`rtk gain`).

## Modes

| Mode | Comportement |
|------|-------------|
| `--install` (defaut) | Installation complete : binaire + hooks + fusion settings |
| `--check` | Verifier le statut d'installation RTK et les economies |
| `--uninstall` | Supprimer les hooks RTK de settings.json (conserve le binaire) |

## Exemples

```bash
# Installer RTK
/common:setup-rtk

# Verifier le statut
/common:setup-rtk --check

# Supprimer les hooks RTK
/common:setup-rtk --uninstall
```

## Implementation

Executer le script d'installation :

```bash
bash Tools/RTK/install-rtk.sh --lang=$RULES_LANG $ARGUMENTS
```
