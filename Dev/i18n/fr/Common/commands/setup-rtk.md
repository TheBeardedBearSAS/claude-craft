---
description: Configurer RTK et l'optimisation des tokens pour Claude Code
argument-hint: [--check]
---

# Configuration de l'optimisation des tokens

Configurer RTK (Rust Token Killer) et l'optimisation complète des tokens pour les sessions Claude Code.

## Étapes

### 1. Vérifier l'installation de RTK

```bash
# Vérifier si RTK est installé
if command -v rtk &>/dev/null; then
  echo "RTK installé : $(rtk --version)"
  echo ""
  rtk gain 2>/dev/null || echo "Pas encore de données d'économies"
else
  echo "RTK N'EST PAS installé"
  echo ""
  echo "Options d'installation (le pattern curl|bash est BLOQUÉ par les hooks Claude Craft) :"
  echo "  1. (Recommandé) make install-rtk    # depuis la racine de claude-craft"
  echo "  2. cargo install rtk-cli            # si vous avez la toolchain Rust"
  echo "  3. Télécharger le binaire manuellement : https://github.com/rtk-ai/rtk/releases"
fi
```

### 2. Configurer les optimisations RTK

Si RTK est installé, appliquer ces optimisations :

#### a) Activer le mode ultra-compact

Vérifier le hook dans `~/.claude/hooks/rtk-rewrite.sh`. La commande de réécriture doit utiliser `--ultra-compact` :

```bash
REWRITTEN=$(rtk rewrite --ultra-compact "$CMD" 2>/dev/null)
```

Si ce n'est pas le cas, mettre à jour le fichier de hook.

#### b) Optimiser les limites RTK

Vérifier `~/.config/rtk/config.toml` et recommander ces limites :

```toml
[limits]
grep_max_results = 100
grep_max_per_file = 10
status_max_files = 10
status_max_untracked = 5
passthrough_max_chars = 1500
```

#### c) Ajouter des filtres personnalisés

Vérifier `~/.config/rtk/filters.toml`. S'il ne contient que des commentaires de template, suggérer des filtres selon la stack du projet détectée :

- **Projets Docker** : Ajouter des filtres docker exec, compose, logs
- **Projets Node.js** : Ajouter des filtres npm/npx install
- **Projets PHP** : Ajouter des filtres composer
- **Projets Python** : Ajouter des filtres pip install

### 3. Configurer le modèle des sous-agents et les sous-agents isolés

Vérifier si les deux variables d'environnement sont définies :

```bash
echo "CLAUDE_CODE_SUBAGENT_MODEL=${CLAUDE_CODE_SUBAGENT_MODEL:-NON DÉFINI}"
echo "CLAUDE_CODE_FORK_SUBAGENT=${CLAUDE_CODE_FORK_SUBAGENT:-NON DÉFINI}"
```

Si non définies, recommander d'ajouter dans `~/.bashrc` (ou `~/.zshrc`) :

```bash
# Utiliser Sonnet 4.6 pour les sous-agents (exploration, grep, lecture de fichiers) au lieu d'Opus
# → 40-60% de réduction de coût sur les invocations de sous-agents
export CLAUDE_CODE_SUBAGENT_MODEL="sonnet"

# Exécuter les sous-agents dans des contextes isolés (Claude Code 2.1.117+, voir COMPATIBILITY.md)
# → Évite de polluer la fenêtre de contexte principale avec l'état intermédiaire des sous-agents
# → Se combine avec context: fork sur les skills (~8-15K tokens économisés par session longue)
export CLAUDE_CODE_FORK_SUBAGENT=1

# Activer le TTL de cache de prompts de 1 heure (Claude Code 2.1.108+)
# → -40% de coût sur les sessions répétitives (sprints BMAD, boucles /team:*)
# → La même clé de cache de prompt est réutilisée jusqu'à 1h au lieu du défaut de 5min
export ENABLE_PROMPT_CACHING_1H=1

# Forcer les écritures de cache de 5 minutes à chaque tour (Claude Code 2.1.108+)
# → Utile pour les boucles de développement courtes qui frappent le cache de manière répétée
# → Compromis : légère surcharge d'écriture, gains importants sur le taux de succès pour le travail itératif
export FORCE_PROMPT_CACHING_5M=1
```

Après la mise à jour, recharger le shell : `source ~/.bashrc`.

### 4. Configurer les hooks

Vérifier les hooks actuels dans settings.json :

| Hook | Objectif | Statut |
|------|---------|--------|
| **PreToolUse** (Bash) | Réécriture RTK | Vérifier si configuré |
| **PostToolUse** (Bash) | Filtrage des sorties | Vérifier si configuré |
| **PreCompact** | Préservation du contexte | Vérifier si configuré |
| **SessionStart** (compact) | Réinjection du contexte | Vérifier si configuré |

Pour les hooks manquants, se référer aux templates dans `.claude/templates/hooks/` :
- `output-filter.json` — PostToolUse pour le filtrage des sorties volumineuses
- `pre-compact.json` — PreCompact pour la préservation du contexte
- `context-reinject.json` — SessionStart pour la réinjection post-compaction
- `post-compact.json` — PostCompact pour la restauration du contexte après compaction

#### Hook PostCompact — Restauration du contexte

Le hook **PostCompact** (Claude Code v2.1.76+) réinjecte le contexte critique après un événement de compaction automatique. Sans lui, Claude peut perdre le fil des tâches actives, des chemins de fichiers et des décisions prises plus tôt dans la session.

Template : `.claude/templates/hooks/post-compact.json`

Le hook lit `context-essentials.md` (un fichier que vous maintenez avec l'état de la session courante) et l'injecte comme message système après la compaction. À coupler avec le hook **PreCompact** (`pre-compact.json`) qui sauvegarde les éléments essentiels avant que la compaction ne se produise.

Économies estimées : évite 5-15 tours de ré-explication par longue session (~3-8K tokens).

### 5. Résumé

Afficher un tableau récapitulatif de toutes les optimisations avec leur statut :

| Optimisation | Économies attendues | Statut |
|---|---|---|
| RTK installé + hooks | 60-90% sur les sorties CLI | ? |
| RTK ultra-compact | +5-10% supplémentaires | ? |
| RTK limites optimisées | grep 19% -> 40-50% | ? |
| RTK filtres personnalisés | +30-50% sur docker/npm | ? |
| Modèle sous-agents (Sonnet) | 40-60% réduction de coût | ? |
| Sous-agents isolés (`CLAUDE_CODE_FORK_SUBAGENT=1`) | 8-15K tokens/session longue | ? |
| Cache prompts 1h (`ENABLE_PROMPT_CACHING_1H=1`) | -40% coût sur sessions répétitives | ? |
| Forcer écritures cache 5min (`FORCE_PROMPT_CACHING_5M=1`) | Taux de succès plus élevé sur boucles itératives | ? |
| Hook PostToolUse | Réduit la pollution du contexte | ? |
| Hook PreCompact | Préserve le contexte critique | ? |
| Hook PostCompact | Restaure le contexte après compaction | ? |

**Cible : 60-75% d'efficacité globale des tokens (avec cache 1h + ultra-compact + sous-agents isolés)**

## Arguments

- `$ARGUMENTS` — Passer `--check` pour afficher uniquement le statut actuel sans effectuer de modifications
