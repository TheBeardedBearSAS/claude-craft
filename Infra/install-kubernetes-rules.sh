#!/bin/bash
set -euo pipefail
IFS=$'\n\t'
# Multilingual installation script for Claude Code Infrastructure rules (Kubernetes)
# Version: 1.0.0
# Usage: ./install-kubernetes-rules.sh [OPTIONS] [PROJECT_DIR]
#
# Installs Kubernetes agents and commands for cloud-native infrastructure

set -e

# ============================================================================
# CONSTANTS
# ============================================================================
VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="${SCRIPT_DIR}/i18n"
TECH_NAME="Kubernetes"
TECH_NAMESPACE="kubernetes"
lang="en"

# Shared UI library
source "${SCRIPT_DIR}/../Dev/scripts/lib/shell-ui.sh"

# ============================================================================
# FUNCTIONS
# ============================================================================

show_help() {
    cat << 'EOF'
Usage: install-kubernetes-rules.sh [OPTIONS] [PROJECT_DIR]

Install/Update Kubernetes agents and commands for Claude Code.

Options:
    --install       Full installation (new files)
    --update        Update agents and commands only
    --force         Overwrite all files (automatic backup)
    --dry-run       Show actions without executing
    --backup        Create backup before modifications
    --lang=XX       Language (en, fr, es, de, pt)
    --version       Show version
    --help          Show this help

Arguments:
    PROJECT_DIR     Project directory (default: current directory)

Examples:
    ./install-kubernetes-rules.sh --install ./my-project
    ./install-kubernetes-rules.sh --update
    ./install-kubernetes-rules.sh --lang=fr --install ./project
    ./install-kubernetes-rules.sh --dry-run

Description:
    This script installs Kubernetes agents and commands for Claude Code.

    5 agents:
    - @kubernetes-architect     - Kubernetes cluster architecture designer
    - @kubernetes-deployment    - GitOps and deployment specialist
    - @kubernetes-debug         - Kubernetes troubleshooting specialist
    - @kubernetes-security      - Kubernetes security hardening specialist
    - @kubernetes-monitoring    - Kubernetes observability specialist

    5 commands:
    - /kubernetes:architecture     - Design complete Kubernetes architecture
    - /kubernetes:deploy-setup     - Setup GitOps deployment pipeline
    - /kubernetes:debug            - Diagnose Kubernetes issues
    - /kubernetes:security-audit   - Kubernetes security audit
    - /kubernetes:optimize         - Optimize Kubernetes resources
EOF
}

show_version() {
    echo "install-kubernetes-rules.sh version ${VERSION}"
    echo "Kubernetes agents and commands for Claude Code"
}

# Backward-compat aliases (delegate to shell-ui.sh)
log_info() { ui_info "$@"; }
log_success() { ui_success "$@"; }
log_warning() { ui_warning "$@"; }
log_error() { ui_error "$@"; }
log_dry_run() { ui_dry_run "$@"; }

# Get source directory (i18n)
get_source_dir() {
    local i18n_src="$I18N_DIR/$lang/$TECH_NAME"
    if [[ -d "$i18n_src" ]]; then
        echo "$i18n_src"
    else
        # Fallback to English
        echo "$I18N_DIR/en/$TECH_NAME"
    fi
}

# Verify source files exist
verify_source_files() {
    local src_dir
    src_dir=$(get_source_dir)

    if [ ! -d "$src_dir/agents" ]; then
        log_error "Source directory missing: $src_dir/agents"
        exit 1
    fi

    if [ ! -d "$src_dir/commands" ]; then
        log_error "Source directory missing: $src_dir/commands"
        exit 1
    fi

    log_success "Source files verified: $src_dir"
}

# Detect existing installation
detect_installation() {
    local target_dir="$1"

    if [ -d "${target_dir}/.claude/commands/${TECH_NAMESPACE}" ]; then
        echo "existing"
    elif [ -d "${target_dir}/.claude" ]; then
        echo "partial"
    else
        echo "none"
    fi
}

# Create backup
create_backup() {
    local target_dir="$1"
    local dry_run="$2"
    local backup_dir="${target_dir}/.claude-backup-kubernetes-$(date +%Y%m%d-%H%M%S)"

    if [ -d "${target_dir}/.claude/commands/${TECH_NAMESPACE}" ] || [ -d "${target_dir}/.claude/agents" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Backup Kubernetes files to ${backup_dir}"
        else
            mkdir -p "${backup_dir}/commands"
            mkdir -p "${backup_dir}/agents"
            cp -r "${target_dir}/.claude/commands/${TECH_NAMESPACE}" "${backup_dir}/commands/" 2>/dev/null || true
            # Only backup kubernetes-related agents
            for agent in kubernetes-architect kubernetes-deployment kubernetes-debug kubernetes-security kubernetes-monitoring; do
                if [ -f "${target_dir}/.claude/agents/${agent}.md" ]; then
                    cp "${target_dir}/.claude/agents/${agent}.md" "${backup_dir}/agents/"
                fi
            done
            log_success "Backup created: ${backup_dir}"
        fi
    fi
}

# Create directory structure
create_directory_structure() {
    local target_dir="$1"
    local dry_run="$2"

    local dirs=(
        ".claude"
        ".claude/commands"
        ".claude/commands/${TECH_NAMESPACE}"
        ".claude/agents"
    )

    for dir in "${dirs[@]}"; do
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Create directory: ${target_dir}/${dir}"
        else
            mkdir -p "${target_dir}/${dir}"
        fi
    done
}

# Copy agents
copy_agents() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local agt_dir="${src_dir}/agents"

    if [ -d "$agt_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: agents/*.md"
        else
            local count=0
            for agent_file in "${agt_dir}/"*.md; do
                if [ -f "$agent_file" ]; then
                    cp "$agent_file" "${target_dir}/.claude/agents/"
                    ((++count))
                fi
            done
            log_success "${count} Kubernetes agents copied"
        fi
    fi
}

# Copy commands
copy_commands() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local cmd_dir="${src_dir}/commands"

    if [ -d "$cmd_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: commands/*.md"
        else
            local count=0
            for cmd_file in "${cmd_dir}/"*.md; do
                if [ -f "$cmd_file" ]; then
                    cp "$cmd_file" "${target_dir}/.claude/commands/${TECH_NAMESPACE}/"
                    ((++count))
                fi
            done
            log_success "${count} Kubernetes commands copied"
        fi
    fi
}

# Show installation summary
show_summary() {
    local target_dir="$1"
    local mode="$2"

    # Count installed files
    local commands_count=0
    local agents_count=0
    if [ -d "${target_dir}/.claude/commands/${TECH_NAMESPACE}" ]; then
        commands_count=$(ls -1 "${target_dir}/.claude/commands/${TECH_NAMESPACE}/"*.md 2>/dev/null | wc -l)
    fi
    # Count only Kubernetes agents
    for agent in kubernetes-architect kubernetes-deployment kubernetes-debug kubernetes-security kubernetes-monitoring; do
        if [ -f "${target_dir}/.claude/agents/${agent}.md" ]; then
            ((++agents_count))
        fi
    done

    echo ""
    echo "=========================================="
    echo "Installation complete!"
    echo "=========================================="
    echo ""
    echo "Structure created:"
    echo "  ${target_dir}/"
    echo "  |-- .claude/"
    echo "  |   |-- commands/"
    echo "  |   |   |-- ${TECH_NAMESPACE}/       (${commands_count} commands)"
    echo "  |   |-- agents/             (${agents_count} Kubernetes agents)"
    echo ""

    # List available commands
    if [ $commands_count -gt 0 ]; then
        echo "Available Kubernetes commands:"
        for cmd_file in "${target_dir}/.claude/commands/${TECH_NAMESPACE}/"*.md; do
            if [ -f "$cmd_file" ]; then
                local cmd_name
                cmd_name=$(basename "$cmd_file" .md)
                echo "  - /${TECH_NAMESPACE}:${cmd_name}"
            fi
        done
        echo ""
    fi

    # List available agents
    if [ $agents_count -gt 0 ]; then
        echo "Available Kubernetes agents:"
        for agent in kubernetes-architect kubernetes-deployment kubernetes-debug kubernetes-security kubernetes-monitoring; do
            if [ -f "${target_dir}/.claude/agents/${agent}.md" ]; then
                echo "  - @${agent}"
            fi
        done
        echo ""
    fi

    echo "Usage examples:"
    echo "  @kubernetes-architect     Design Kubernetes cluster architecture"
    echo "  @kubernetes-security      Audit Kubernetes security posture"
    echo "  /kubernetes:architecture  Design complete K8s architecture"
    echo "  /kubernetes:debug         Diagnose Kubernetes issues"
    echo "  /kubernetes:deploy-setup  Setup GitOps pipeline"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Default variables
    local mode=""
    local force="false"
    local dry_run="false"
    local backup="false"
    local target_dir="."

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install)
                mode="install"
                shift
                ;;
            --update)
                mode="update"
                shift
                ;;
            --force)
                force="true"
                shift
                ;;
            --dry-run)
                dry_run="true"
                shift
                ;;
            --backup)
                backup="true"
                shift
                ;;
            --lang=*)
                lang="${1#--lang=}"
                shift
                ;;
            --version)
                show_version
                exit 0
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                echo "Use --help to see available options"
                exit 1
                ;;
            *)
                target_dir="$1"
                shift
                ;;
        esac
    done

    # Resolve absolute path
    if [ "$target_dir" != "." ]; then
        if [ ! -d "$target_dir" ]; then
            log_error "Directory does not exist: $target_dir"
            exit 1
        fi
        target_dir="$(cd "${target_dir}" && pwd)"
    else
        target_dir="$(pwd)"
    fi

    echo ""
    echo "=========================================="
    echo "Installing Kubernetes rules for Claude Code"
    echo "=========================================="
    echo ""
    echo "Version: ${VERSION}"
    echo "Language: ${lang}"
    echo "Target directory: ${target_dir}"

    # Verify source files
    verify_source_files

    # Auto-detect mode if not specified
    if [ -z "$mode" ]; then
        local installation_status
        installation_status=$(detect_installation "$target_dir")
        case $installation_status in
            existing)
                log_info "Existing installation detected -> update mode"
                mode="update"
                ;;
            partial|none)
                log_info "No Kubernetes installation detected -> install mode"
                mode="install"
                ;;
        esac
    fi

    echo "Mode: ${mode}"
    if [ "$dry_run" = "true" ]; then
        echo "Dry-run mode: no modifications will be made"
    fi
    echo ""

    # Create backup if requested or in force mode
    if [ "$backup" = "true" ] || [ "$force" = "true" ]; then
        create_backup "$target_dir" "$dry_run"
    fi

    # Execute according to mode
    case $mode in
        install|update)
            log_info "Installing Kubernetes agents and commands..."
            create_directory_structure "$target_dir" "$dry_run"
            copy_agents "$target_dir" "$dry_run"
            copy_commands "$target_dir" "$dry_run"
            ;;
    esac

    # Show summary
    if [ "$dry_run" = "false" ]; then
        show_summary "$target_dir" "$mode"
    else
        echo ""
        log_dry_run "Simulation complete. No modifications made."
    fi
}

main "$@"
