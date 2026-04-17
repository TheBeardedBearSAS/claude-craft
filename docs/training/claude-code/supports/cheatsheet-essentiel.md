# Cheatsheet Essentiel — Claude Code

> Aide-memoire des commandes et raccourcis fondamentaux (Modules 1-4)

---

## Installation

```bash
# macOS (Homebrew — recommande)
brew install claude-code

# Linux / macOS (curl)
curl -fsSL https://cli.anthropic.com/install.sh | sh

# Windows (WinGet)
winget install Anthropic.ClaudeCode

# npm (fallback, deprecie)
npm install -g @anthropic-ai/claude-code

# Verification
claude --version        # Doit afficher 2.1.105+
claude                  # Premier lancement
```

---

## Commandes CLI essentielles

| Commande | Description |
|----------|-------------|
| `/help` | Aide et liste des commandes |
| `/status` | Etat de la session (modele, tokens, cout) |
| `/clear` | Vider le contexte de conversation |
| `/compact` | Resumer le contexte sans le perdre |
| `/cost` | Cout detaille de la session |
| `/model` | Changer de modele en cours de session |
| `/fast` | Basculer en mode rapide (Opus 4.6 2.5x, cout 6x) |
| `/plan` | Activer le mode planification |
| `/think` | Forcer la reflexion approfondie |
| `/effort` | Controler la profondeur (`low` / `medium` / `high`) |
| `/doctor` | Diagnostiquer l'installation |
| `/exit` | Quitter Claude Code |
| `/history` | Historique des sessions |
| `/permissions` | Gerer les autorisations |
| `/mcp` | Configuration des serveurs MCP |
| `/skills` | Lister les skills disponibles |
| `/keybindings` | Personnaliser les raccourcis |
| `/tasks` | Gestion multi-taches |
| `/sandbox` | Activer l'isolation OS |
| `/rename` | Renommer la session courante |
| `/rewind` | Revenir en arriere |
| `/login` | Se connecter a son compte Anthropic |

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Enter` | Envoyer le message |
| `Shift+Enter` | Nouvelle ligne dans le message |
| `Ctrl+C` | Annuler la generation en cours |
| `Esc` | Annuler l'action en cours |
| `Esc+Esc` | Rewind au checkpoint precedent |
| `Shift+Tab` | Basculer en Plan Mode |
| `Tab` | Accepter une suggestion/completion |
| `Up/Down` | Naviguer dans l'historique des prompts |

---

## Modeles disponibles

| Modele | ID | Usage | Prix (in/out) | Context |
|--------|-----|-------|---------------|---------|
| **Sonnet 4.6** | `claude-sonnet-4-6` | Quotidien (defaut) | $3 / $15 par M tokens | 200K |
| **Opus 4.6** | `claude-opus-4-6` | Raisonnement complexe | $5 / $25 par M tokens | 1M |
| **Haiku 4.5** | `claude-haiku-4-5` | Taches simples, economique | $1 / $5 par M tokens | 200K |

```bash
# Changer de modele
/model opus              # En session interactive
/fast                    # Toggle Opus en mode rapide
claude --model opus "prompt"  # En ligne de commande
```

---

## Flags CLI utiles

| Flag | Description | Exemple |
|------|-------------|---------|
| `-p` | Mode headless (non-interactif) | `claude -p "Liste les fichiers"` |
| `--output-format` | Format de sortie | `text`, `json`, `stream-json` |
| `--model` | Choisir le modele | `claude --model opus "prompt"` |
| `--continue` / `-c` | Reprendre la derniere session | `claude --continue` |
| `--resume` | Reprendre une session par ID | `claude --resume <id>` |
| `--effort` | Profondeur de reflexion | `low`, `medium`, `high` |
| `--allowedTools` | Restreindre les outils | `claude -p "..." --allowedTools Read,Grep` |
| `--dangerously-skip-permissions` | Ignorer les permissions | Usage CI/CD uniquement |
| `--sandbox` | Activer l'isolation OS | `claude --sandbox` |
| `--from-pr` | Analyser une PR | `claude --from-pr 123` |

---

## Extended Thinking

| Methode | Description |
|---------|-------------|
| Automatique | Opus 4.6 ajuste sa reflexion automatiquement |
| `/effort low` | Taches simples, rapides, economiques |
| `/effort medium` | Taches courantes (defaut) |
| `/effort high` | Problemes complexes, architecture |
| `/think` | Forcer la reflexion approfondie |

> Les mots-cles `think`, `think hard`, `ultrathink` sont deprecies mais fonctionnels.

---

## Modes de permission

| Mode | Comportement | Quand l'utiliser |
|------|-------------|-----------------|
| **Ask** (defaut) | Demande confirmation | Operations sensibles |
| **Allow** | Execute sans confirmation | Operations de confiance |
| **Deny** | Bloque completement | Operations dangereuses |

---

## Gestion du contexte

### Seuils d'action

| Contexte utilise | Action recommandee |
|------------------|-------------------|
| < 30% | Normal, continuez |
| 30-60% | Surveillez, evitez les lectures inutiles |
| 60-80% | Deleguez aux sub-agents, envisagez `/clear` |
| > 80% | Compaction imminente, sauvegardez le contexte |

### Commandes contexte

| Commande | Quand l'utiliser |
|----------|-----------------|
| `/clear` | Entre deux taches non liees |
| `/compact` | Contexte utile mais trop volumineux |

### Sub-agents

| Type | Usage |
|------|-------|
| **Explore** | Investigation multi-fichiers (> 3 fichiers) |
| **Plan** | Planification d'implementation |
| **General-purpose** | Tache independante en parallele |

---

## Prompt patterns — Structure d'un bon prompt

```
1. CONTEXTE    → Qu'est-ce qui existe deja ?
2. OBJECTIF    → Que voulez-vous accomplir ?
3. CONTRAINTES → Quelles regles respecter ?
4. RESULTAT    → Comment verifier le succes ?
```

### Exemples

```
# BON
> Notre API utilise JWT (contexte). Ajoute un endpoint
> de refresh token (objectif). Le refresh token expire
> apres 7 jours, stocke en base de donnees (contraintes).
> Ajoute des tests couvrant les cas d'erreur (resultat).

# MAUVAIS
> Fais un refresh token
```

---

## Sessions

```bash
claude --continue       # Reprendre la derniere session
claude --resume <id>    # Reprendre une session specifique
/rename "feature-auth"  # Renommer la session courante
/rewind                 # Revenir au checkpoint precedent
```

---

## Mode Headless

```bash
# Prompt simple
claude -p "Liste les fichiers TypeScript" --output-format text

# Piping
cat error.log | claude -p "Analyse ces logs"

# Sortie JSON
claude -p "Liste les dependances" --output-format json

# Integration script
git diff HEAD~1 | claude -p "Resume les changements"
```

---

## Status Line

```
┌─────────────────────────────────────────────────┐
│ claude-opus-4-6 │ 23% ctx │ $0.42 │ fast │ plan │
└─────────────────────────────────────────────────┘
   Modele actif    Context   Cout    Mode   Mode
                   utilise   session rapide plan
```

---

## Plan Mode — Quand l'utiliser ?

| Situation | Plan Mode ? |
|-----------|-------------|
| Bug simple, 1 fichier | Non |
| Renommer une variable | Non |
| Nouvelle feature (2-3 fichiers) | Recommande |
| Refactoring multi-fichiers | Oui |
| Changement d'architecture | Obligatoire |
| Impact incertain | Oui |

**Activation :** `/plan` ou `Shift+Tab`

---

## Optimiser ses couts

| Strategie | Impact |
|-----------|--------|
| Sonnet 4.6 pour les taches courantes | Economie importante |
| `/clear` entre les taches | Reduit le contexte |
| `/compact` quand le contexte grossit | Compresse le contexte |
| Etre precis dans ses prompts | Moins d'iterations |
| Haiku 4.5 pour taches simples | Cout minimal |
| Eviter Fast Mode sauf besoin urgent | 6x le prix normal |

---

**Formation Claude Code** | The Bearded Bear | Fevrier 2026
