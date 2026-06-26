# FAQ - Foire Aux Questions

Questions et réponses courantes sur Claude Craft.

---

## Installation

### Quels sont les prérequis minimum ?

- **Node.js 20+** - Pour NPX et CLI
- **Bash** - Pour les scripts d'installation
- **yq v4+** - Pour la configuration YAML
- **Git** - Pour le contrôle de version

Voir [Prérequis](PREREQUISITES.md) pour les détails complets.

### Comment installer Claude Craft ?

**Méthode la plus rapide (NPX) :**
```bash
npx @the-bearded-bear/claude-craft install ~/mon-projet --tech=symfony --lang=fr
```

**Alternative (Makefile) :**
```bash
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft
make install-symfony TARGET=~/mon-projet RULES_LANG=fr
```

### Puis-je installer plusieurs technologies ?

Oui ! Exécutez plusieurs commandes d'installation ou utilisez la configuration YAML :

```bash
make install-symfony TARGET=~/projet
make install-react TARGET=~/projet
```

Ou avec YAML :
```yaml
modules:
  - path: "."
    tech: [symfony, react]
```

### Comment mettre à jour une installation existante ?

```bash
make install-symfony TARGET=~/projet OPTIONS="--update"
# ou
./Dev/scripts/install-symfony-rules.sh --update ~/projet
```

### Comment réinstaller complètement ?

```bash
make install-symfony TARGET=~/projet OPTIONS="--force --backup"
```

---

## Configuration

### Où se trouve le fichier de configuration ?

- **Niveau projet :** `~/mon-projet/.claude/CLAUDE.md`
- **Index :** `~/mon-projet/.claude/INDEX.md`
- **Déclencheurs de contexte :** `~/mon-projet/.claude/context.yaml`

### Comment personnaliser le contexte du projet ?

Éditez `.claude/rules/00-project-context.md` ou exécutez :
```
/common:setup-project-context
```

### Comment changer la langue de la documentation ?

Utilisez l'option `--lang` ou `RULES_LANG` lors de l'installation :
```bash
make install-symfony TARGET=~/projet RULES_LANG=fr
```

Disponibles : `en`, `fr`, `es`, `de`, `pt`

### Quelle est la différence entre CLAUDE.md et INDEX.md ?

- **CLAUDE.md** : Config minimale chargée automatiquement (~200 tokens)
- **INDEX.md** : Référence rapide chargée à la demande via `@` (~1,300 tokens)
- **references/** : Documentation complète chargée explicitement

---

## Commandes

### Comment lister toutes les commandes disponibles ?

Dans Claude Code :
```
/help
```

Ou voir [Référence des Commandes](../COMMANDS.md).

### Quelle est la différence entre `/common:` et `/symfony:` ?

- `/common:` - Commandes transversales pour toute technologie
- `/symfony:`, `/react:`, etc. - Commandes spécifiques à une technologie

### Comment créer une commande personnalisée ?

Ajoutez un fichier markdown dans `.claude/commands/{namespace}/` :

```markdown
---
description: Ce que fait cette commande
argument-hint: <arg1> [arg2]
---

# Ma Commande Personnalisée

Instructions pour Claude...
```

### Pourquoi ma commande n'apparaît pas ?

1. Vérifiez que l'extension du fichier est `.md`
2. Vérifiez que le frontmatter YAML est valide
3. Redémarrez la session Claude Code

---

## Agents

### Comment invoquer un agent ?

Utilisez la mention `@` :
```
@api-designer Aide-moi à concevoir une API REST
@symfony-reviewer Passe en revue ce code
```

### Puis-je utiliser plusieurs agents ensemble ?

Oui :
```
@tdd-coach @react-reviewer Aide-moi à faire du TDD sur ce composant
```

### Comment créer un agent personnalisé ?

Ajoutez un fichier markdown dans `.claude/agents/` :

```markdown
---
name: mon-agent
description: Expert en X. À utiliser quand Y.
---

# Mon Agent

## Identité
...

## Capacités
...
```

---

## Framework BMAD

### Qu'est-ce que BMAD ?

BMAD v6 est le framework de gestion de projet de Claude Craft avec :
- Rôles intégrés aux commandes workflow et sprint (pm, ba, architect, po, sm, dev, qa, qa-recette, ux, bmad-master)
- Routage de stories basé sur le statut
- 5 quality gates
- 3 tracks : Quick Flow, Standard, Enterprise

### Comment commencer à utiliser BMAD ?

```bash
# Initialiser BMAD dans votre projet
/workflow:init

# Vérifier le statut
/workflow:status
```

### Quels sont les quality gates ?

| Gate | Seuil | Objectif |
|------|-------|----------|
| PRD Gate | ≥80% | Vision → PRD |
| Tech Spec Gate | ≥90% | PRD → Tech Spec |
| Backlog Gate | INVEST 6/6 | Tech Spec → Backlog |
| Sprint Ready | 100% | Backlog → Sprint |
| Story DoD | 100% | Dev → Done |

Voir [Guide Pratique BMAD](../BMAD-PRACTICAL-GUIDE.md).

---

## Ralph Wiggum

### Qu'est-ce que Ralph Wiggum ?

Ralph Wiggum est une boucle d'agent IA continue qui exécute Claude de manière itérative jusqu'à ce que :
- Tous les validateurs de Definition of Done (DoD) passent
- Le nombre maximum d'itérations est atteint
- Le circuit breaker se déclenche

### Comment utiliser Ralph ?

```bash
/common:ralph-run "Implémenter l'authentification utilisateur"
# ou
npx @the-bearded-bear/claude-craft ralph "Corriger le bug de connexion"
```

### Quels validateurs DoD sont disponibles ?

| Validateur | Description |
|------------|-------------|
| `command` | Exécuter des commandes shell (tests, lint) |
| `output_contains` | Vérifier des patterns dans la sortie |
| `file_changed` | Vérifier que des fichiers ont été modifiés |
| `hook` | Intégrer avec quality-gate.sh |
| `human` | Approbation manuelle |

Voir [Guide Ralph](../RALPH-GUIDE.md).

---

## Workflow

### Quelles pistes de workflow sont disponibles ?

| Piste | Temps | Idéal Pour |
|-------|-------|------------|
| Quick Flow | < 5 min | Corrections de bugs, hotfixes |
| Standard | < 15 min | Nouvelles fonctionnalités |
| Enterprise | < 30 min | Plateformes, migrations |

### Comment démarrer un workflow ?

```
/workflow:init              # Auto-détection
/workflow:init --quick      # Mode correction de bug
/workflow:init --enterprise # Méthodologie complète
```

### Quelles sont les phases du workflow ?

1. **Analyser** - Recherche et exploration (Enterprise uniquement)
2. **Planifier** - Générer PRD, personas, backlog
3. **Concevoir** - Tech spec, architecture, ADRs
4. **Implémenter** - Développement sprint avec TDD/BDD

---

## Dépannage

### "yq: command not found"

Installez yq v4 :
```bash
brew install yq      # macOS
sudo apt install yq  # Ubuntu
```

Assurez-vous que c'est la version de Mike Farah :
```bash
yq --version
# Doit afficher : yq (https://github.com/mikefarah/yq/)
```

### "Permission denied" sur les scripts

```bash
chmod +x Dev/scripts/*.sh
# ou
make fix-permissions
```

### Commandes non reconnues dans Claude Code

1. Redémarrez la session Claude Code
2. Vérifiez que les fichiers sont dans `.claude/commands/`
3. Vérifiez la syntaxe du frontmatter YAML

### L'installation échoue avec "directory not found"

Créez d'abord le répertoire :
```bash
mkdir -p ~/mon-projet
make install-symfony TARGET=~/mon-projet
```

### Fichiers écrasés de manière inattendue

Utilisez `--preserve-config` pour conserver vos personnalisations :
```bash
make install-symfony TARGET=~/projet OPTIONS="--force --preserve-config"
```

Voir [Guide de Dépannage](TROUBLESHOOTING.md) pour plus de solutions.

---

## Gestion de Projet

### Comment créer une user story ?

```
/project:add-story EPIC-001 "En tant qu'utilisateur, je veux..."
```

### Comment suivre la progression du sprint ?

```
/sprint:status
/project:board
```

### Comment exécuter un sprint TDD ?

```
/sprint:dev next
```

---

## Intégration

### Claude Craft fonctionne-t-il avec d'autres outils IA ?

Oui ! Utilisez les bundles web :
- `bundles/chatgpt/` - Pour ChatGPT
- `bundles/claude/` - Pour Claude Projects
- `bundles/gemini/` - Pour Gemini Gems

### Puis-je utiliser des serveurs MCP ?

Oui, Claude Craft inclut des templates MCP :
```bash
# Copier les templates MCP
cp .claude/mcp/* ~/.claude/mcp/
```

Disponibles : Context7, GitHub, PostgreSQL, Slack

### Est-ce que ça fonctionne dans les monorepos ?

Oui ! Utilisez la configuration YAML :
```yaml
projects:
  - name: "mon-monorepo"
    root: "~/Projets/mon-monorepo"
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
```

---

## Migration

### Comment migrer de v3 vers v4 ?

Voir [Guide de Migration](MIGRATION-v4.md).

### Qu'est-ce qui change en v4 ?

Changements principaux :
- Structure TCL (Tiered Context Loading)
- Changements de format BMAD v6
- Quelques renommages de commandes

### Puis-je utiliser v3 et v4 côte à côte ?

Non recommandé. Migrez les projets un par un.

---

## Optimisation des Tokens

### Comment réduire ma consommation de tokens ?

Utilisez la commande intégrée pour configurer automatiquement toutes les optimisations :

```bash
/common:setup-rtk
```

Cela installe **RTK** (Rust Token Killer), un proxy CLI qui réduit la consommation de tokens de 60-90% sur les commandes dev. Combiné avec les hooks et `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`, vous obtenez une réduction globale de 55-65%.

### Quelles commandes de gestion de contexte sont disponibles ?

| Commande | Description |
|----------|-------------|
| `/effort low\|medium\|high` | Ajuster le niveau d'effort selon la complexité |
| `/context` | Suggestions d'optimisation du contexte |
| `/compact` | Compacter proactivement le contexte |
| `/clear` | Nettoyer le contexte entre tâches non liées |
| `/memory` | Sauvegarder des apprentissages persistants |
| `/loop 5m /commande` | Planifier des tâches récurrentes |
| `/model haiku\|sonnet\|opus` | Changer de modèle selon la complexité |

### RTK ne fonctionne pas, que faire ?

Vérifiez que vous avez le bon binaire :

```bash
rtk --version    # Doit afficher : rtk X.Y.Z
rtk gain         # Doit fonctionner

# Si "command not found" : installer RTK
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | bash
rtk init -g
```

**Attention :** Si `rtk gain` échoue, vous avez peut-être `reachingforthejack/rtk` (Rust Type Kit) installé au lieu de `rtk-ai/rtk`.

---

## Bonnes Pratiques

### Quel est le workflow recommandé pour une nouvelle fonctionnalité ?

1. Démarrer avec `/workflow:init`
2. Utiliser `@api-designer` pour la conception d'API
3. Générer le code avec `/symfony:generate-crud`
4. Écrire les tests avec `@tdd-coach`
5. Faire la revue avec `@symfony-reviewer`
6. Valider avec `/common:pre-commit-check`

### À quelle fréquence exécuter les audits ?

- **Pré-commit** : Toujours (`/common:pre-commit-check`)
- **Audit complet** : Hebdomadaire ou avant les releases
- **Audit de sécurité** : Avant chaque release

### Dois-je commiter le dossier .claude ?

Oui ! Le dossier `.claude/` doit être commité dans le contrôle de version pour que tous les membres de l'équipe utilisent les mêmes règles et commandes.

---

## Contribuer

### Comment ajouter une nouvelle technologie ?

Utilisez la commande :
```
/common:add-technology "nextjs"
```

Cela génère tous les fichiers pour 5 langues.

### Comment signaler un bug ?

[Ouvrir une issue sur GitHub](https://github.com/TheBeardedBearSAS/claude-craft/issues)

### Puis-je contribuer aux traductions ?

Oui ! Les traductions sont dans `Dev/i18n/{lang}/`. Les PRs sont les bienvenues !

---

## Encore des questions ?

- Consultez [Dépannage](TROUBLESHOOTING.md)
- Lisez la [Documentation Complète](../COMMANDS-FULL-REFERENCE.md)
- [Ouvrez une issue GitHub](https://github.com/TheBeardedBearSAS/claude-craft/issues)
