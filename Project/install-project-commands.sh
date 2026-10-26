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
source "${SCRIPT_DIR}/../Dev/scripts/lib/stack-profiles.sh"

# Parse arguments
PROJECT_DIR="."
skip_common=false
force=false
tech_arg=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --lang=*) lang="${1#--lang=}"; shift ;;
        --skip-common) skip_common=true; shift ;;
        --tech=*) tech_arg="${1#--tech=}"; shift ;;
        --force) force=true; shift ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] [PROJECT_DIR]"
            echo ""
            echo "Options:"
            echo "  --lang=XX      Language (en, fr, es, de, pt) - default: en"
            echo "  --skip-common  Skip common rules installation (for multi-tech modules)"
            echo "  --tech=a,b     Project stack, rendered into CLAUDE.md (e.g. python,react,docker)"
            echo "  --force        Overwrite existing CLAUDE.md and project-management scaffold"
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


# Copy gate commands from i18n source
GATE_CMD_SRC="$SRC_DIR/Gate/commands"
if [ -d "$GATE_CMD_SRC" ]; then
    cp "$GATE_CMD_SRC/"*.md "$CLAUDE_DIR/commands/gate/" 2>/dev/null || true
    GATE_COUNT=$(ls -1 "$GATE_CMD_SRC/"*.md 2>/dev/null | wc -l)
    ui_success "$GATE_COUNT gate commands copied"
fi

# Delete commands retired from the distribution (config/removed-commands.yaml)
bash "$SCRIPT_DIR/../Dev/scripts/prune-removed-commands.sh" "$PROJECT_DIR"

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

# Render the CLAUDE.md scaffold placeholders from the --tech stack profiles
render_claude_md() {
    local techs line
    IFS=' ' read -ra techs <<< "$(parse_tech_list "$tech_arg")"
    local skills="" slice="UI + API + DB"
    if [[ ${#techs[@]} -gt 0 ]]; then
        skills=", $(stack_display_names ', ' "${techs[@]}")"
        slice="$(stack_display_names ' + ' "${techs[@]}")"
    fi
    while IFS= read -r line || [[ -n "$line" ]]; do
        case "$line" in
            '{{STACK_BLOCK}}')
                if [[ ${#techs[@]} -gt 0 ]]; then render_stack_block "${techs[@]}"
                else echo "# → /project:generate-tech-spec"; fi ;;
            '{{QUALITY_BLOCK}}')
                if [[ ${#techs[@]} -gt 0 ]]; then render_quality_block "${techs[@]}"; fi ;;
            *)
                line="${line//\{\{STACK_SKILLS\}\}/$skills}"
                echo "${line//\{\{STACK_SLICE\}\}/$slice}" ;;
        esac
    done < "$SCAFFOLD_DIR/CLAUDE.md"
}

# Write $2 to $1 unless it already exists (never clobber user content without --force)
write_scaffold() {
    local dest="$1" label="$2" content
    content="$(cat)"
    if [[ -f "$dest" ]] && ! $force; then
        ui_info "$label exists (not overwritten, use --force)"
        return
    fi
    printf '%s\n' "$content" > "$dest"
    ui_success "$label created"
}

write_scaffold "$PROJECT_DIR/project-management/backlog/index.md" "Backlog index" \
    < "$SCAFFOLD_DIR/project-management__backlog__index.md"
render_claude_md | write_scaffold "$PROJECT_DIR/CLAUDE.md" "CLAUDE.md"
write_scaffold "$PROJECT_DIR/project-management/README.md" "project-management README" \
    < "$SCAFFOLD_DIR/project-management__README.md"

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
echo "   Backlog et analyse (/project:) :"
echo "   /project:backlog add|list|edit|move epic|story|task - Gérer le backlog"
echo "   /project:reverse [scan|prd|stories|gaps|all]       - Rétro-ingénierie (brownfield)"
echo "   /project:trace [--gaps] [--by-priority]            - Traçabilité exigences → code → tests"
echo "   /project:report burndown|metrics|deps              - Burndown, métriques, dépendances"
echo "   /project:migrate [--analyze|--resync|--stories]    - Migration vers BMAD v6"
echo ""
echo "   Visualisation (/project:) :"
echo "   /project:board                 - Kanban du sprint"
echo "   /project:run-sprint            - Exécuter un sprint"
echo "   /project:run-epic              - Exécuter un EPIC"
echo "   /project:batch-status          - Statut par lot"
echo ""
echo "   Quality Gates (/gate:) :"
echo "   /gate:check prd|spec|backlog|sprint|story|alignment - Portes documentaires"
echo "   /gate:check commit|merge|release                    - Portes de code"
echo "   /gate:check all | --phase=<phase>                   - Rapport complet / checkpoint"
echo ""
echo "🤖 Agents disponibles :"
echo "   @po   - Product Owner (backlog, US, priorisation)"
echo "   @tech - Tech Lead (architecture, tâches, estimation)"
echo ""
echo "📁 Structure créée :"
echo "   $PROJECT_DIR/"
echo "   ├── CLAUDE.md"
echo "   ├── .claude/"
echo "   │   ├── commands/project/"
echo "   │   ├── commands/gate/"
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
echo "   > /project:backlog add epic \"Mon premier EPIC\""
echo ""
echo "📊 Workflow strict des statuts :"
echo "   backlog → ready-for-dev → in-progress → review → done"
echo "   (blocked possible à tout moment ; statut dans .bmad/sprint-status.yaml)"
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
echo "   Backlog and analysis (/project:):"
echo "   /project:backlog add|list|edit|move epic|story|task - Manage the backlog"
echo "   /project:reverse [scan|prd|stories|gaps|all]       - Reverse engineering (brownfield)"
echo "   /project:trace [--gaps] [--by-priority]            - Requirements → code → tests traceability"
echo "   /project:report burndown|metrics|deps              - Burndown, metrics, dependencies"
echo "   /project:migrate [--analyze|--resync|--stories]    - Migrate to BMAD v6"
echo ""
echo "   Visualization (/project:):"
echo "   /project:board                 - Sprint Kanban"
echo "   /project:run-sprint            - Run a sprint"
echo "   /project:run-epic              - Run an EPIC"
echo "   /project:batch-status          - Batch status"
echo ""
echo "   Quality Gates (/gate:):"
echo "   /gate:check prd|spec|backlog|sprint|story|alignment - Document gates"
echo "   /gate:check commit|merge|release                    - Code gates"
echo "   /gate:check all | --phase=<phase>                   - Full report / checkpoint"
echo ""
echo "🤖 Available agents:"
echo "   @po   - Product Owner (backlog, User Stories, prioritization)"
echo "   @tech - Tech Lead (architecture, tasks, estimation)"
echo ""
echo "📁 Structure created:"
echo "   $PROJECT_DIR/"
echo "   ├── CLAUDE.md"
echo "   ├── .claude/"
echo "   │   ├── commands/project/"
echo "   │   ├── commands/gate/"
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
echo "   > /project:backlog add epic \"My first EPIC\""
echo ""
echo "📊 Strict status workflow:"
echo "   backlog → ready-for-dev → in-progress → review → done"
echo "   (blocked possible at any time; status in .bmad/sprint-status.yaml)"
fi
