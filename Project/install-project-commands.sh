#!/bin/bash
# Multilingual installation of Project commands and agents for Claude Code
# Version 2.1.0 - Full tracking (EPIC, US, Tasks) with i18n support
# Usage: ./install-project-commands.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

VERSION="2.1.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$SCRIPT_DIR/i18n"
lang="en"

# Shared UI library
source "${SCRIPT_DIR}/../Dev/scripts/lib/shell-ui.sh"

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

# Scaffold content (project CLAUDE.md/README/index) sourced per-language with English fallback
SCAFFOLD_DIR="$SRC_DIR/scaffold"
if [ ! -d "$SCAFFOLD_DIR" ]; then SCAFFOLD_DIR="$I18N_DIR/en/scaffold"; fi

ui_box "🚀 Project Commands - v${VERSION}"
echo ""
ui_info "Language: $lang"
ui_info "Project directory: $PROJECT_DIR"
ui_info "Source: $SRC_DIR"
echo ""

# Créer la structure .claude
mkdir -p "$CLAUDE_DIR/commands/project"
mkdir -p "$CLAUDE_DIR/commands/sprint"
mkdir -p "$CLAUDE_DIR/commands/gate"
mkdir -p "$CLAUDE_DIR/agents"
mkdir -p "$CLAUDE_DIR/templates/project"

# Créer la structure project-management
mkdir -p "$PROJECT_DIR/project-management/backlog/epics"
mkdir -p "$PROJECT_DIR/project-management/backlog/user-stories"
mkdir -p "$PROJECT_DIR/project-management/backlog/tasks"
mkdir -p "$PROJECT_DIR/project-management/sprints"
mkdir -p "$PROJECT_DIR/project-management/metrics"

ui_info "Création de la structure..."

# Migration : déplacer les anciens fichiers de commands/ vers commands/project/
if ls "$CLAUDE_DIR/commands/"*.md 1>/dev/null 2>&1; then
    ui_info "Migration des anciennes commandes vers commands/project/..."
    mv "$CLAUDE_DIR/commands/"*.md "$CLAUDE_DIR/commands/project/" 2>/dev/null || true
    ui_success "Migration effectuée"
fi

# Copy project commands from i18n source
CMD_SRC="$SRC_DIR/commands"
if [ ! -d "$CMD_SRC" ]; then
    CMD_SRC="$SCRIPT_DIR/claude-commands"
fi
if [ -d "$CMD_SRC" ]; then
    cp "$CMD_SRC/"*.md "$CLAUDE_DIR/commands/project/" 2>/dev/null || true
    COMMANDS_COUNT=$(ls -1 "$CMD_SRC/"*.md 2>/dev/null | wc -l)
    ui_success "$COMMANDS_COUNT project commands copied"
fi

# Copy sprint commands from i18n source
SPRINT_CMD_SRC="$SRC_DIR/Sprint/commands"
if [ -d "$SPRINT_CMD_SRC" ]; then
    cp "$SPRINT_CMD_SRC/"*.md "$CLAUDE_DIR/commands/sprint/" 2>/dev/null || true
    SPRINT_COUNT=$(ls -1 "$SPRINT_CMD_SRC/"*.md 2>/dev/null | wc -l)
    ui_success "$SPRINT_COUNT sprint commands copied"
fi

# Copy gate commands from i18n source
GATE_CMD_SRC="$SRC_DIR/Gate/commands"
if [ -d "$GATE_CMD_SRC" ]; then
    cp "$GATE_CMD_SRC/"*.md "$CLAUDE_DIR/commands/gate/" 2>/dev/null || true
    GATE_COUNT=$(ls -1 "$GATE_CMD_SRC/"*.md 2>/dev/null | wc -l)
    ui_success "$GATE_COUNT gate commands copied"
fi

# Copy agents from i18n source
AGT_SRC="$SRC_DIR/agents"
if [ ! -d "$AGT_SRC" ]; then
    AGT_SRC="$SCRIPT_DIR/claude-agents"
fi
if [ -d "$AGT_SRC" ]; then
    cp "$AGT_SRC/"*.md "$CLAUDE_DIR/agents/" 2>/dev/null || true
    AGENTS_COUNT=$(ls -1 "$AGT_SRC/"*.md 2>/dev/null | wc -l)
    ui_success "$AGENTS_COUNT agents copied"
fi

# Copy templates from i18n source
TPL_SRC="$SRC_DIR/templates"
if [ ! -d "$TPL_SRC" ]; then
    TPL_SRC="$SCRIPT_DIR/templates"
fi
if [ -d "$TPL_SRC" ]; then
    cp "$TPL_SRC/"*.md "$CLAUDE_DIR/templates/project/" 2>/dev/null || true
    TEMPLATES_COUNT=$(ls -1 "$TPL_SRC/"*.md 2>/dev/null | wc -l)
    ui_success "$TEMPLATES_COUNT templates copied"
fi

# Créer l'index initial du backlog
cat "$SCAFFOLD_DIR/project-management__backlog__index.md" > "$PROJECT_DIR/project-management/backlog/index.md"
ui_success "Index backlog créé"

# Créer CLAUDE.md
cat "$SCAFFOLD_DIR/CLAUDE.md" > "$PROJECT_DIR/CLAUDE.md"

ui_success "CLAUDE.md créé"

# Créer un fichier README dans project-management
cat "$SCAFFOLD_DIR/project-management__README.md" > "$PROJECT_DIR/project-management/README.md"
ui_success "README project-management créé"

echo ""
echo "=================================================="
if [ "$lang" = "fr" ]; then
echo "✅ Installation terminée !"
echo ""
echo "📋 Commandes disponibles :"
echo ""
echo "   Génération (/project:) :"
echo "   /project:generate-backlog      - Générer le backlog complet"
echo "   /project:decompose-tasks [N]   - Décomposer sprint N en tâches"
echo "   /project:generate-prd          - Générer le PRD"
echo "   /project:generate-tech-spec    - Générer la spécification technique"
echo ""
echo "   EPICs (/project:) :"
echo "   /project:add-epic              - Créer un EPIC"
echo "   /project:list-epics            - Lister les EPICs"
echo "   /project:update-epic           - Modifier un EPIC"
echo ""
echo "   User Stories (/project:) :"
echo "   /project:add-story             - Créer une User Story"
echo "   /project:list-stories          - Lister les US"
echo "   /project:update-story          - Modifier une US"
echo ""
echo "   Tasks (/project:) :"
echo "   /project:add-task              - Créer une tâche"
echo "   /project:list-tasks            - Lister les tâches"
echo "   /project:move-task             - Changer le statut"
echo ""
echo "   Visualisation (/project:) :"
echo "   /project:board                 - Kanban du sprint"
echo "   /project:run-sprint            - Exécuter un sprint"
echo "   /project:run-epic              - Exécuter un EPIC"
echo "   /project:batch-status          - Statut par lot"
echo ""
echo "   Sprint (/sprint:) :"
echo "   /sprint:status                 - Métriques du sprint"
echo "   /sprint:transition             - Changer statut/sprint"
echo "   /sprint:next-story             - Prochaine story prête"
echo "   /sprint:auto-route             - Routage automatique"
echo "   /sprint:dev                    - Développer une story"
echo ""
echo "   Quality Gates (/gate:) :"
echo "   /gate:validate-backlog         - Valider la conformité SCRUM"
echo "   /gate:validate-prd             - Valider le PRD"
echo "   /gate:validate-techspec        - Valider la spécification technique"
echo "   /gate:validate-story           - Valider une User Story (DoD)"
echo "   /gate:validate-sprint          - Valider un sprint"
echo "   /gate:report                   - Rapport de qualité"
echo ""
echo "🤖 Agents disponibles :"
echo "   @po   - Product Owner (backlog, US, priorisation)"
echo "   @tech - Tech Lead (architecture, tâches, estimation)"
echo ""
echo "📁 Structure créée :"
echo "   $PROJECT_DIR/"
echo "   ├── CLAUDE.md"
echo "   ├── .claude/"
echo "   │   ├── commands/project/    (22 commandes)"
echo "   │   ├── commands/sprint/     (5 commandes)"
echo "   │   ├── commands/gate/       (6 commandes)"
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
else
echo "✅ Installation complete!"
echo ""
echo "📋 Available commands:"
echo ""
echo "   Generation (/project:):"
echo "   /project:generate-backlog      - Generate the full backlog"
echo "   /project:decompose-tasks [N]   - Break sprint N into tasks"
echo "   /project:generate-prd          - Generate the PRD"
echo "   /project:generate-tech-spec    - Generate the technical spec"
echo ""
echo "   EPICs (/project:):"
echo "   /project:add-epic              - Create an EPIC"
echo "   /project:list-epics            - List EPICs"
echo "   /project:update-epic           - Edit an EPIC"
echo ""
echo "   User Stories (/project:):"
echo "   /project:add-story             - Create a User Story"
echo "   /project:list-stories          - List User Stories"
echo "   /project:update-story          - Edit a User Story"
echo ""
echo "   Tasks (/project:):"
echo "   /project:add-task              - Create a task"
echo "   /project:list-tasks            - List tasks"
echo "   /project:move-task             - Change status"
echo ""
echo "   Visualization (/project:):"
echo "   /project:board                 - Sprint Kanban"
echo "   /project:run-sprint            - Run a sprint"
echo "   /project:run-epic              - Run an EPIC"
echo "   /project:batch-status          - Batch status"
echo ""
echo "   Sprint (/sprint:):"
echo "   /sprint:status                 - Sprint metrics"
echo "   /sprint:transition             - Change status/sprint"
echo "   /sprint:next-story             - Next ready story"
echo "   /sprint:auto-route             - Automatic routing"
echo "   /sprint:dev                    - Develop a story"
echo ""
echo "   Quality Gates (/gate:):"
echo "   /gate:validate-backlog         - Validate SCRUM compliance"
echo "   /gate:validate-prd             - Validate the PRD"
echo "   /gate:validate-techspec        - Validate the technical spec"
echo "   /gate:validate-story           - Validate a User Story (DoD)"
echo "   /gate:validate-sprint          - Validate a sprint"
echo "   /gate:report                   - Quality report"
echo ""
echo "🤖 Available agents:"
echo "   @po   - Product Owner (backlog, User Stories, prioritization)"
echo "   @tech - Tech Lead (architecture, tasks, estimation)"
echo ""
echo "📁 Structure created:"
echo "   $PROJECT_DIR/"
echo "   ├── CLAUDE.md"
echo "   ├── .claude/"
echo "   │   ├── commands/project/    (22 commands)"
echo "   │   ├── commands/sprint/     (5 commands)"
echo "   │   ├── commands/gate/       (6 commands)"
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
echo "🚀 Getting started:"
echo "   cd $PROJECT_DIR"
echo "   claude"
echo "   > /project:add-epic \"My first EPIC\""
echo ""
echo "📊 Strict status workflow:"
echo "   🔴 To Do → 🟡 In Progress → 🟢 Done"
echo "   (⏸️ Blocked possible at any time)"
fi
