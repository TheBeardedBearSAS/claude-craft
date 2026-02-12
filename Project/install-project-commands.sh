#!/bin/bash
# Multilingual installation of Project commands and agents for Claude Code
# Version 2.1.0 - Full tracking (EPIC, US, Tasks) with i18n support
# Usage: ./install-project-commands.sh [OPTIONS] [PROJECT_DIR]

set -e

VERSION="2.1.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$SCRIPT_DIR/i18n"
lang="en"

# Parse arguments
PROJECT_DIR="."
skip_common=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --lang=*) lang="${1#--lang=}"; shift ;;
        --skip-common) skip_common=true; shift ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] [PROJECT_DIR]"
            echo ""
            echo "Options:"
            echo "  --lang=XX      Language (en, fr, es, de, pt) - default: en"
            echo "  --skip-common  Skip common rules installation (for multi-tech modules)"
            echo "  --help         Show this help"
            echo ""
            echo "Example:"
            echo "  $0 --lang=fr ~/my-project"
            exit 0
            ;;
        -*) echo "Unknown option: $1"; exit 1 ;;
        *) PROJECT_DIR="$1"; shift ;;
    esac
done

CLAUDE_DIR="$PROJECT_DIR/.claude"

# Get i18n source directory
get_source_dir() {
    local i18n_src="$I18N_DIR/$lang"
    if [[ -d "$i18n_src" ]]; then
        echo "$i18n_src"
    else
        echo "$SCRIPT_DIR"
    fi
}

SRC_DIR=$(get_source_dir)

echo "🚀 Installing Project commands for Claude Code"
echo "=================================================="
echo "Version: $VERSION"
echo "Language: $lang"
echo "Project directory: $PROJECT_DIR"
echo "Source: $SRC_DIR"
echo ""

# Créer la structure .claude
mkdir -p "$CLAUDE_DIR/commands/project"
mkdir -p "$CLAUDE_DIR/agents"
mkdir -p "$CLAUDE_DIR/templates/project"

# Créer la structure project-management
mkdir -p "$PROJECT_DIR/project-management/backlog/epics"
mkdir -p "$PROJECT_DIR/project-management/backlog/user-stories"
mkdir -p "$PROJECT_DIR/project-management/backlog/tasks"
mkdir -p "$PROJECT_DIR/project-management/sprints"
mkdir -p "$PROJECT_DIR/project-management/metrics"

echo "📁 Création de la structure..."

# Migration : déplacer les anciens fichiers de commands/ vers commands/project/
if ls "$CLAUDE_DIR/commands/"*.md 1>/dev/null 2>&1; then
    echo "🔄 Migration des anciennes commandes vers commands/project/..."
    mv "$CLAUDE_DIR/commands/"*.md "$CLAUDE_DIR/commands/project/" 2>/dev/null || true
    echo "✅ Migration effectuée"
fi

# Copy commands from i18n source
CMD_SRC="$SRC_DIR/commands"
if [ ! -d "$CMD_SRC" ]; then
    CMD_SRC="$SCRIPT_DIR/claude-commands"
fi
if [ -d "$CMD_SRC" ]; then
    cp "$CMD_SRC/"*.md "$CLAUDE_DIR/commands/project/" 2>/dev/null || true
    COMMANDS_COUNT=$(ls -1 "$CMD_SRC/"*.md 2>/dev/null | wc -l)
    echo "✅ $COMMANDS_COUNT commands copied"
fi

# Copy agents from i18n source
AGT_SRC="$SRC_DIR/agents"
if [ ! -d "$AGT_SRC" ]; then
    AGT_SRC="$SCRIPT_DIR/claude-agents"
fi
if [ -d "$AGT_SRC" ]; then
    cp "$AGT_SRC/"*.md "$CLAUDE_DIR/agents/" 2>/dev/null || true
    AGENTS_COUNT=$(ls -1 "$AGT_SRC/"*.md 2>/dev/null | wc -l)
    echo "✅ $AGENTS_COUNT agents copied"
fi

# Copy templates from i18n source
TPL_SRC="$SRC_DIR/templates"
if [ ! -d "$TPL_SRC" ]; then
    TPL_SRC="$SCRIPT_DIR/templates"
fi
if [ -d "$TPL_SRC" ]; then
    cp "$TPL_SRC/"*.md "$CLAUDE_DIR/templates/project/" 2>/dev/null || true
    TEMPLATES_COUNT=$(ls -1 "$TPL_SRC/"*.md 2>/dev/null | wc -l)
    echo "✅ $TEMPLATES_COUNT templates copied"
fi

# Créer l'index initial du backlog
cat > "$PROJECT_DIR/project-management/backlog/index.md" << 'INDEXMD'
# Backlog Index

> Dernière mise à jour: $(date +%Y-%m-%d)

---

## Résumé Global

| Type | 🔴 To Do | 🟡 In Progress | ⏸️ Blocked | 🟢 Done | Total |
|------|----------|----------------|------------|---------|-------|
| EPICs | 0 | 0 | 0 | 0 | 0 |
| User Stories | 0 | 0 | 0 | 0 | 0 |
| Tasks | 0 | 0 | 0 | 0 | 0 |

---

## EPICs

| ID | Nom | Statut | Priorité | US | Progression |
|----|-----|--------|----------|-----|-------------|
| - | Aucun EPIC créé | - | - | - | - |

---

## Sprint Actuel

_Aucun sprint actif_

---

## Backlog Priorisé (Hors Sprint)

| US | EPIC | Points | Priorité | Statut |
|----|------|--------|----------|--------|
| - | - | - | - | - |

---

## Légende Statuts

| Icône | Statut | Description |
|-------|--------|-------------|
| 🔴 | To Do | Pas encore commencé |
| 🟡 | In Progress | En cours de réalisation |
| ⏸️ | Blocked | Bloqué par un obstacle |
| 🟢 | Done | Terminé |

### Workflow

```
🔴 To Do ──→ 🟡 In Progress ──→ 🟢 Done
     │              │
     │              ↓
     └────→ ⏸️ Blocked ←────┘
                │
                ↓
           🟡 In Progress
```
INDEXMD
echo "✅ Index backlog créé"

# Créer CLAUDE.md
cat > "$PROJECT_DIR/CLAUDE.md" << 'CLAUDEMD'
# Configuration Claude Code - Gestion de Projet

## Agents disponibles

### 🎯 Product Owner (`@po`)
Expert en gestion de backlog, personas, User Stories et priorisation.
- Certifié CSPO (Certified Scrum Product Owner)
- Maîtrise : INVEST, 3C, Gherkin, SMART, MoSCoW, MMF

### 🔧 Tech Lead (`@tech`)
Expert en architecture, décomposition technique et facilitation Scrum.
- Certifié CSM (Certified Scrum Master)
- Maîtrise : Symfony, Flutter, API Platform, Architecture hexagonale

## Commandes personnalisées

### Génération & Validation

| Commande | Description |
|----------|-------------|
| `/project:generate-backlog` | Génère le backlog complet |
| `/gate:validate-backlog` | Valide la conformité du backlog (score /100) |
| `/project:decompose-tasks N` | Décompose le sprint N en tâches |

### Gestion des EPICs

| Commande | Description |
|----------|-------------|
| `/project:add-epic "Nom"` | Créer un nouvel EPIC |
| `/project:list-epics` | Lister tous les EPICs |
| `/project:update-epic EPIC-XXX` | Modifier un EPIC |

### Gestion des User Stories

| Commande | Description |
|----------|-------------|
| `/project:add-story EPIC-XXX "Nom"` | Créer une User Story |
| `/project:list-stories` | Lister les User Stories |
| `/project:update-story US-XXX` | Modifier une US |

### Gestion des Tasks

| Commande | Description |
|----------|-------------|
| `/project:add-task US-XXX "[TYPE] Desc" Xh` | Créer une tâche |
| `/project:list-tasks` | Lister les tâches |
| `/project:move-task TASK-XXX statut` | Changer le statut |

### Visualisation

| Commande | Description |
|----------|-------------|
| `/project:board` | Afficher le Kanban du sprint |
| `/project:sprint-status` | Métriques détaillées du sprint |

## Stack technique

```yaml
web: Symfony UX + Turbo (Twig, Stimulus, Live Components)
mobile: Flutter (Dart, Material/Cupertino)
api: API Platform (REST, OpenAPI)
database: PostgreSQL + Doctrine ORM
infrastructure: Docker
tests: PHPUnit, Flutter Test
quality: PHPStan max, Dart analyzer
```

## Structure projet

```
project-management/
├── README.md                     # Vue d'ensemble
├── personas.md                   # Définition des personas (min 3)
├── definition-of-done.md         # DoD du projet
├── dependencies-matrix.md        # Matrice des dépendances (Mermaid)
├── backlog/
│   ├── epics/
│   │   └── EPIC-XXX-nom.md       # Avec MMF
│   └── user-stories/
│       └── US-XXX-nom.md         # INVEST + 3C + Gherkin SMART
└── sprints/
    └── sprint-XXX-but/
        ├── sprint-goal.md        # Sprint Goal + Cérémonies + Rétro
        ├── sprint-dependencies.md
        ├── tasks/
        │   ├── README.md
        │   └── US-XXX-tasks.md   # Tâches détaillées
        └── task-board.md         # Kanban
```

## Standards SCRUM appliqués

### Fondamentaux
- **3 Piliers** : Transparence, Inspection, Adaptation
- **Manifeste Agile** : 4 valeurs, 12 principes
- **Sprint** : 2 semaines fixe
- **Vélocité** : 20-40 points/sprint

### User Stories
- Format : "En tant que [P-XXX]... Je veux... Afin de..."
- Validation **INVEST** : Independent, Negotiable, Valuable, Estimable, Sized ≤8pts, Testable
- Les **3 C** : Carte, Conversation, Confirmation
- **Vertical Slicing** : Symfony + Flutter + API + PostgreSQL

### Critères d'Acceptance
- Format **Gherkin** : GIVEN [contexte] / WHEN [acteur] [action] / THEN [résultat]
- Validation **SMART** : Spécifique, Mesurable, Atteignable, Réaliste, Temporel
- Minimum : 1 nominal + 2 alternatifs + 2 erreurs

### Epics
- **MMF** (Minimum Marketable Feature) obligatoire
- Dépendances avec graphe **Mermaid**

### Sprints
- Sprint 1 = **Walking Skeleton** (fonctionnalité complète minimale)
- **Sprint Goal** en une phrase
- **Cérémonies** : Planning (Part 1 & 2), Daily, Review, Rétro, Affinage
- **Directive Fondamentale** de la Rétrospective incluse

### Tâches
- Estimation en **heures** (0.5h - 8h max)
- Types : [DB], [BE], [FE-WEB], [FE-MOB], [TEST], [DOC], [REV], [OPS]
- Dépendances avec graphe **Mermaid**
- Statuts : 🔲 À faire | 🔄 En cours | 👀 Review | ✅ Done | 🚫 Bloqué

## Workflow recommandé

```bash
# 1. Initialiser le backlog
/project:generate-backlog

# 2. Valider la conformité
/gate:validate-backlog

# 3. Planifier le sprint 1
/project:decompose-tasks 001

# 4. Développer...

# 5. Préparer le sprint suivant
/project:decompose-tasks 002
```

## Conventions de nommage

| Élément | Format | Exemple |
|---------|--------|---------|
| Epic | EPIC-XXX-nom | EPIC-001-authentification |
| User Story | US-XXX-nom | US-001-inscription |
| Persona | P-XXX | P-001 |
| Sprint | sprint-XXX-but | sprint-001-walking_skeleton |
| Tâche | T-XXX-YY | T-001-05 |

## Qualité du code

### Backend (Symfony)
- PHPStan niveau max
- Tests > 80% couverture
- Architecture hexagonale
- PSR-12

### Mobile (Flutter)
- Dart analyzer strict
- Widget tests
- BLoC/Riverpod
- Material Design 3

### API (API Platform)
- OpenAPI auto-généré
- Validation constraints
- Serialization groups
- Security voters
CLAUDEMD

echo "✅ CLAUDE.md créé"

# Créer un fichier README dans project-management
cat > "$PROJECT_DIR/project-management/README.md" << 'READMEMD'
# Gestion de Projet

Ce répertoire contient la gestion de projet.

## Structure

```
project-management/
├── backlog/
│   ├── index.md              # Index avec tous les statuts
│   ├── epics/                # EPICs du projet
│   ├── user-stories/         # User Stories
│   └── tasks/                # Tasks non assignées à un sprint
├── sprints/
│   └── sprint-XXX/
│       ├── sprint-goal.md    # Objectif et infos du sprint
│       ├── board.md          # Kanban board
│       └── tasks/            # Tasks du sprint
└── metrics/
    ├── velocity.md           # Vélocité par sprint
    └── burndown.md           # Burndown charts
```

## Workflow

1. `/project:add-epic` - Créer un EPIC
2. `/project:add-story` - Ajouter des User Stories
3. `/sprint:transition US-XXX sprint-N` - Planifier le sprint
4. `/project:add-task` ou `/project:decompose-tasks` - Créer les tâches
5. `/project:board` - Suivre l'avancement
6. `/project:move-task` - Mettre à jour les statuts

## Statuts

| Icône | Statut | Description |
|-------|--------|-------------|
| 🔴 | To Do | Pas encore commencé |
| 🟡 | In Progress | En cours |
| ⏸️ | Blocked | Bloqué |
| 🟢 | Done | Terminé |
READMEMD
echo "✅ README project-management créé"

echo ""
echo "=================================================="
echo "✅ Installation terminée !"
echo ""
echo "📋 Commandes disponibles :"
echo ""
echo "   Génération :"
echo "   /project:generate-backlog      - Générer le backlog complet"
echo "   /gate:validate-backlog      - Valider la conformité SCRUM"
echo "   /project:decompose-tasks [N]   - Décomposer sprint N en tâches"
echo ""
echo "   EPICs :"
echo "   /project:add-epic              - Créer un EPIC"
echo "   /project:list-epics            - Lister les EPICs"
echo "   /project:update-epic           - Modifier un EPIC"
echo ""
echo "   User Stories :"
echo "   /project:add-story             - Créer une User Story"
echo "   /project:list-stories          - Lister les US"
echo "   /sprint:transition             - Changer statut/sprint"
echo "   /project:update-story          - Modifier une US"
echo ""
echo "   Tasks :"
echo "   /project:add-task              - Créer une tâche"
echo "   /project:list-tasks            - Lister les tâches"
echo "   /project:move-task             - Changer le statut"
echo ""
echo "   Visualisation :"
echo "   /project:board                 - Kanban du sprint"
echo "   /project:sprint-status         - Métriques du sprint"
echo ""
echo "🤖 Agents disponibles :"
echo "   @po   - Product Owner (backlog, US, priorisation)"
echo "   @tech - Tech Lead (architecture, tâches, estimation)"
echo ""
echo "📁 Structure créée :"
echo "   $PROJECT_DIR/"
echo "   ├── CLAUDE.md"
echo "   ├── .claude/"
echo "   │   ├── commands/project/    (15 commandes)"
echo "   │   ├── agents/              (2 agents)"
echo "   │   └── templates/project/   (5 templates)"
echo "   └── project-management/"
echo "       ├── backlog/"
echo "       │   ├── index.md"
echo "       │   ├── epics/"
echo "       │   └── user-stories/"
echo "       ├── sprints/"
echo "       └── metrics/"
echo ""
echo "🚀 Pour commencer :"
echo "   cd $PROJECT_DIR"
echo "   claude"
echo "   > /project:add-epic \"Mon premier EPIC\""
echo ""
echo "📊 Workflow strict des statuts :"
echo "   🔴 To Do → 🟡 In Progress → 🟢 Done"
echo "   (⏸️ Blocked possible à tout moment)"
