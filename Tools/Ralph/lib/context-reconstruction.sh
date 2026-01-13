#!/bin/bash
# =============================================================================
# Ralph Wiggum - Context Reconstruction Module
# Intelligent context rebuilding after compact or session continuation
# =============================================================================
# Based on Anthropic's "Effective Context Engineering for AI Agents"
# https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
# =============================================================================

# Configuration
CONTEXT_INCLUDE_GIT_DIFF="${CONTEXT_INCLUDE_GIT_DIFF:-true}"
CONTEXT_INCLUDE_TEST_STATUS="${CONTEXT_INCLUDE_TEST_STATUS:-true}"
CONTEXT_SMART_RECONSTRUCTION="${CONTEXT_SMART_RECONSTRUCTION:-true}"
CONTEXT_MAX_PROMPT_TOKENS="${CONTEXT_MAX_PROMPT_TOKENS:-5000}"

# =============================================================================
# Main Reconstruction Function
# =============================================================================

reconstruct_context() {
    local session_id="$1"

    if [[ "$CONTEXT_SMART_RECONSTRUCTION" != "true" ]]; then
        print_verbose "Smart context reconstruction disabled"
        return 0
    fi

    print_info "${MSG_CONTEXT_RECONSTRUCTING:-Reconstructing context from progress file}..."

    local context=""

    # 1. Sprint Progress (primary source of truth)
    context+=$(build_progress_section)

    # 2. Git Changes Summary
    if [[ "$CONTEXT_INCLUDE_GIT_DIFF" == "true" ]]; then
        context+="\n\n"
        context+=$(build_git_section)
    fi

    # 3. Test Status
    if [[ "$CONTEXT_INCLUDE_TEST_STATUS" == "true" ]]; then
        context+="\n\n"
        context+=$(build_test_section)
    fi

    # 4. Current Task Details
    context+="\n\n"
    context+=$(build_current_task_section)

    echo -e "$context"
}

# =============================================================================
# Section Builders
# =============================================================================

build_progress_section() {
    echo "## Sprint Progress"
    echo ""

    if [[ -f "$SPRINT_PROGRESS_FILE" ]]; then
        # Extract key sections only (not the entire file)
        echo "### Current State"
        grep -A4 "^## Current State" "$SPRINT_PROGRESS_FILE" 2>/dev/null | tail -n +2 || echo "- Unknown"

        echo ""
        echo "### Completed Tasks"
        # Show last 5 completed tasks
        grep '^\- \[x\]' "$SPRINT_PROGRESS_FILE" 2>/dev/null | tail -5 || echo "- None yet"

        echo ""
        echo "### Key Decisions"
        grep -A10 "^## Key Decisions" "$SPRINT_PROGRESS_FILE" 2>/dev/null | grep '^-' | head -5 || echo "- None recorded"
    else
        echo "No sprint progress file found."
    fi
}

build_git_section() {
    echo "## Recent Changes"
    echo ""

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Not in a git repository."
        return
    fi

    # Get summary of changes
    echo "### Modified Files (last 5 commits)"
    git diff --stat HEAD~5 2>/dev/null | tail -15 || echo "No recent changes"

    echo ""
    echo "### Recent Commits"
    git log --oneline -5 2>/dev/null || echo "No commits found"

    echo ""
    echo "### Uncommitted Changes"
    local status=$(git status --porcelain 2>/dev/null | head -10)
    if [[ -n "$status" ]]; then
        echo "\`\`\`"
        echo "$status"
        echo "\`\`\`"
    else
        echo "No uncommitted changes."
    fi
}

build_test_section() {
    echo "## Test Status"
    echo ""

    # Try to detect test framework and run quick check
    local test_status=""

    # Check for common test runners
    if [[ -f "package.json" ]] && grep -q '"test"' package.json 2>/dev/null; then
        # Node.js project - check if tests exist
        echo "- Framework: Node.js (npm test)"
        # Don't actually run tests, just note they exist
    elif [[ -f "composer.json" ]] && grep -q 'phpunit' composer.json 2>/dev/null; then
        echo "- Framework: PHP (PHPUnit)"
    elif [[ -f "*.csproj" ]] 2>/dev/null || [[ -f "*.sln" ]] 2>/dev/null; then
        echo "- Framework: .NET (dotnet test)"
    elif [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
        echo "- Framework: Python (pytest/unittest)"
    else
        echo "- Framework: Unknown"
    fi

    # Check sprint progress for recorded test status
    if [[ -f "$SPRINT_PROGRESS_FILE" ]]; then
        local unit_status=$(grep -oP 'Unit: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "unknown")
        local integration_status=$(grep -oP 'Integration: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null || echo "unknown")
        echo "- Unit Tests: $unit_status"
        echo "- Integration Tests: $integration_status"
    fi
}

build_current_task_section() {
    echo "## Current Task"
    echo ""

    # Check for current task file
    if [[ -f ".ralph/current-task.md" ]]; then
        cat ".ralph/current-task.md"
        return
    fi

    # Try to get from sprint progress
    if [[ -f "$SPRINT_PROGRESS_FILE" ]]; then
        local current_task=$(grep -oP '\*\*Current Task\*\*: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null)
        local phase=$(grep -oP '\*\*Phase\*\*: \K.*' "$SPRINT_PROGRESS_FILE" 2>/dev/null)

        if [[ -n "$current_task" && "$current_task" != "none" ]]; then
            echo "**Task**: $current_task"
            echo "**Phase**: ${phase:-unknown}"
            echo ""
            echo "Continue from where you left off in the $phase phase."
        else
            echo "No current task in progress."
        fi
    else
        echo "No current task information available."
    fi
}

# =============================================================================
# Continuation Prompt Generation
# =============================================================================

generate_continuation_prompt() {
    local session_id="${SESSION_ID:-unknown}"
    local context=$(reconstruct_context "$session_id")

    cat << EOF
# Continuation du Sprint

Vous reprenez le travail sur ce sprint apres une compaction de contexte.
Le fichier sprint-progress.md contient l'etat complet du travail effectue.

$context

## Instructions

1. **Lisez** le progres ci-dessus pour comprendre l'etat actuel
2. **Verifiez** les fichiers modifies si necessaire
3. **Reprenez** la tache en cours la ou elle s'est arretee
4. **Continuez** le workflow TDD (RED -> GREEN -> REFACTOR)
5. **Mettez a jour** sprint-progress.md apres chaque tache terminee

## Commandes Importantes

- Apres chaque tache: mettre a jour sprint-progress.md
- Si blocker: noter dans la section Blockers
- Si decision importante: ajouter dans Key Decisions

Continuez l'implementation.
EOF
}

# =============================================================================
# Session Handoff Prompt
# =============================================================================

generate_session_handoff_prompt() {
    local previous_session="$1"
    local context=$(reconstruct_context "$previous_session")

    cat << EOF
# Nouvelle Session de Continuation

Cette session continue le travail de la session precedente ($previous_session).
Le contexte a ete reinitialise mais le fichier sprint-progress.md contient tout le progres.

$context

## Contexte de la Transition

- Session precedente: $previous_session
- Raison: Limite de contexte atteinte (max compacts)
- Le travail a ete sauvegarde dans sprint-progress.md
- Les fichiers sont dans l'etat du dernier checkpoint git

## Instructions

1. **Verifiez** l'etat actuel via git status
2. **Lisez** sprint-progress.md pour le contexte complet
3. **Identifiez** la tache en cours et son etat
4. **Continuez** exactement ou la session precedente s'est arretee

Reprenez le travail.
EOF
}

# =============================================================================
# Quick Summary for Logging
# =============================================================================

get_reconstruction_summary() {
    local has_progress="No"
    local has_git="No"
    local has_tests="No"
    local has_task="No"

    [[ -f "$SPRINT_PROGRESS_FILE" ]] && has_progress="Yes"
    git rev-parse --git-dir > /dev/null 2>&1 && has_git="Yes"
    [[ -f ".ralph/current-task.md" ]] && has_task="Yes"

    cat << EOF
{
    "has_progress_file": "$has_progress",
    "has_git": "$has_git",
    "has_current_task": "$has_task",
    "timestamp": "$(date -Iseconds)"
}
EOF
}

# =============================================================================
# Set Current Task (for tracking)
# =============================================================================

set_current_task() {
    local task_id="$1"
    local task_type="$2"
    local task_description="$3"
    local task_phase="${4:-RED}"

    # Create .ralph directory if needed
    mkdir -p .ralph

    cat > ".ralph/current-task.md" << EOF
# Current Task

- **ID**: $task_id
- **Type**: $task_type
- **Description**: $task_description
- **Phase**: $task_phase
- **Started**: $(date -Iseconds)

## Files to Modify
<!-- Will be filled as work progresses -->

## Notes
<!-- Add implementation notes here -->
EOF

    # Update sprint progress
    if type update_sprint_progress &>/dev/null; then
        update_sprint_progress "state" "{\"current_task\": \"$task_id [$task_type] $task_description\", \"phase\": \"$task_phase\"}"
    fi
}

clear_current_task() {
    if [[ -f ".ralph/current-task.md" ]]; then
        rm ".ralph/current-task.md"
    fi

    # Update sprint progress
    if type update_sprint_progress &>/dev/null; then
        update_sprint_progress "state" "{\"current_task\": \"none\", \"phase\": \"IDLE\"}"
    fi
}
