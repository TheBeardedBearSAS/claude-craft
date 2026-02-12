#!/bin/bash
# TCL (Tiered Context Loading) Common Functions
# Version: 3.5.0
# Shared by all install-*-rules.sh scripts

# ============================================================================
# VERSION
# ============================================================================

# Read version from package.json
get_claude_craft_version() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[1]}")" && pwd)"
    node -p "require('${script_dir}/../../package.json').version" 2>/dev/null || echo "0.0.0"
}

# ============================================================================
# DIRECTORY STRUCTURE
# ============================================================================

create_tcl_directory_structure() {
    local target_dir="$1"
    local tech_namespace="$2"
    local dry_run="$3"

    local dirs=(
        ".claude"
        ".claude/references"
        ".claude/references/base"
        ".claude/references/${tech_namespace}"
        ".claude/skills"
        ".claude/commands"
        ".claude/commands/common"
        ".claude/commands/workflow"
        ".claude/commands/team"
        ".claude/commands/qa"
        ".claude/commands/uiux"
        ".claude/commands/${tech_namespace}"
        ".claude/agents"
        ".claude/templates"
        ".claude/checklists"
    )

    for dir in "${dirs[@]}"; do
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Creer: ${dir}/"
        else
            mkdir -p "${target_dir}/${dir}"
        fi
    done

    if [ "$dry_run" = "false" ]; then
        log_success "TCL directory structure created"
    fi
}

# ============================================================================
# REFERENCE COPYING
# ============================================================================

copy_base_references() {
    local target_dir="$1"
    local i18n_dir="$2"
    local lang="$3"
    local dry_run="$4"

    local common_rules_lang="${i18n_dir}/${lang}/Common/rules"
    local common_rules_base="${i18n_dir}/base/Common/rules"

    if [ ! -d "$common_rules_lang" ] && [ ! -d "$common_rules_base" ]; then
        log_warning "Common rules directory not found in lang or base"
        return 0
    fi

    # Base reference mappings (universal principles)
    local base_mappings=(
        "01-workflow-analysis.md:workflow-analysis.md"
        "04-solid-principles.md:solid-principles.md"
        "05-kiss-dry-yagni.md:kiss-dry-yagni.md"
        "09-git-workflow.md:git-workflow.md"
        "10-documentation.md:documentation.md"
    )

    local count=0
    for mapping in "${base_mappings[@]}"; do
        local old_name="${mapping%%:*}"
        local new_name="${mapping##*:}"
        local dest_file="${target_dir}/.claude/references/base/${new_name}"

        # Resolve: lang takes precedence over base
        local src_file=""
        if [ -f "${common_rules_lang}/${old_name}" ]; then
            src_file="${common_rules_lang}/${old_name}"
        elif [ -f "${common_rules_base}/${old_name}" ]; then
            src_file="${common_rules_base}/${old_name}"
        fi

        if [ -n "$src_file" ]; then
            if [ "$dry_run" = "true" ]; then
                log_dry_run "Copy: references/base/${new_name}"
            else
                cp "$src_file" "$dest_file"
            fi
            ((count++)) || true
        fi
    done

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "${count} base references copied"
    fi
}

copy_tech_references() {
    local target_dir="$1"
    local src_dir="$2"
    local tech_namespace="$3"
    local dry_run="$4"
    shift 4
    local mappings=("$@")

    local rules_dir="${src_dir}/rules"
    # Base fallback rules dir (I18N_DIR and TECH_NAME set by caller)
    local base_rules_dir=""
    if [[ -n "${I18N_DIR:-}" ]] && [[ -n "${TECH_NAME:-}" ]]; then
        base_rules_dir="${I18N_DIR}/base/${TECH_NAME}/rules"
    fi
    local dest_dir="${target_dir}/.claude/references/${tech_namespace}"

    if [ ! -d "$rules_dir" ] && [ ! -d "${base_rules_dir:-}" ]; then
        log_warning "Rules directory not found: $rules_dir"
        return 0
    fi

    local count=0
    for mapping in "${mappings[@]}"; do
        local old_name="${mapping%%:*}"
        local new_name="${mapping##*:}"
        local dest_file="${dest_dir}/${new_name}"

        # Resolve: lang dir takes precedence over base
        local src_file=""
        if [ -f "${rules_dir}/${old_name}" ]; then
            src_file="${rules_dir}/${old_name}"
        elif [ -n "${base_rules_dir:-}" ] && [ -f "${base_rules_dir}/${old_name}" ]; then
            src_file="${base_rules_dir}/${old_name}"
        fi

        if [ -n "$src_file" ]; then
            if [ "$dry_run" = "true" ]; then
                log_dry_run "Copy: references/${tech_namespace}/${new_name}"
            else
                cp "$src_file" "$dest_file"
            fi
            ((count++)) || true
        fi
    done

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "${count} tech-specific references copied to ${tech_namespace}/"
    fi
}

# ============================================================================
# FILE GENERATION
# ============================================================================

generate_minimal_claude_md() {
    local target_dir="$1"
    local project_name="$2"
    local tech_display_name="$3"
    local tech_stack="$4"
    local tech_namespace="$5"
    local available_commands="$6"
    local dry_run="$7"
    local preserve_config="${8:-false}"

    local dest_file="${target_dir}/.claude/CLAUDE.md"

    # Skip if preserve_config and file exists
    if [ "$preserve_config" = "true" ] && [ -f "$dest_file" ]; then
        if [ "$dry_run" = "false" ]; then
            log_info "CLAUDE.md preserved (--preserve-config)"
        fi
        return 0
    fi

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generate: CLAUDE.md"
        return 0
    fi

    cat > "$dest_file" << EOF
# ${project_name} - ${tech_display_name} Project

**Stack**: ${tech_stack}

## Quick Reference

See \`@.claude/INDEX.md\` for condensed checklists and patterns.

## Full Documentation

For detailed rules and examples: \`@.claude/references/<topic>.md\`

## Available Commands

${available_commands}

## Docker Requirement

Always use Docker for commands to abstract from local environment.
EOF

    log_success "CLAUDE.md generated (~180 tokens)"
}

generate_index_md() {
    local target_dir="$1"
    local tech_display_name="$2"
    local tech_stack="$3"
    local tech_namespace="$4"
    local architecture_summary="$5"
    local coding_standards_summary="$6"
    local testing_stack="$7"
    local tech_references="$8"
    local dry_run="$9"
    local preserve_config="${10:-false}"

    local dest_file="${target_dir}/.claude/INDEX.md"

    # Skip if preserve_config and file exists
    if [ "$preserve_config" = "true" ] && [ -f "$dest_file" ]; then
        if [ "$dry_run" = "false" ]; then
            log_info "INDEX.md preserved (--preserve-config)"
        fi
        return 0
    fi

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generate: INDEX.md"
        return 0
    fi

    cat > "$dest_file" << EOF
# Claude-Craft Rules Index - ${tech_display_name}

> Condensed reference for ${tech_stack}

## Architecture Quick Reference

${architecture_summary}

## Coding Standards

${coding_standards_summary}

## Testing Quick Reference

**TDD Cycle**: RED → GREEN → REFACTOR

${testing_stack}

**Coverage Target**: ≥80% | **Key Metrics**: Branch, Statement, Integration

## Security Essentials

- **Input Validation**: ALWAYS validate at boundaries
- **No Secrets in Code**: Use environment variables
- **Parameterized Queries**: Never concatenate SQL
- **OWASP Top 10**: Be aware of common vulnerabilities

## Universal Principles

| Principle | Key Points |
|-----------|------------|
| **SOLID** | Single responsibility, Open/closed, Liskov, Interface segregation, Dependency inversion |
| **KISS** | Keep it simple, avoid over-engineering |
| **DRY** | Don't repeat yourself, extract common logic |
| **YAGNI** | Don't add functionality until needed |

## Full Reference Documentation

### Base (Universal)
- \`base/solid-principles.md\` - SOLID principles in depth
- \`base/kiss-dry-yagni.md\` - Simplicity principles
- \`base/workflow-analysis.md\` - Development workflow
- \`base/git-workflow.md\` - Git best practices
- \`base/documentation.md\` - Documentation standards

### ${tech_display_name} Specific
${tech_references}
EOF

    log_success "INDEX.md generated (~830 tokens)"
}

generate_context_yaml() {
    local target_dir="$1"
    local file_contexts="$2"
    local dry_run="$3"
    local preserve_config="${4:-false}"

    local dest_file="${target_dir}/.claude/context.yaml"

    # Skip if preserve_config and file exists
    if [ "$preserve_config" = "true" ] && [ -f "$dest_file" ]; then
        if [ "$dry_run" = "false" ]; then
            log_info "context.yaml preserved (--preserve-config)"
        fi
        return 0
    fi

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generate: context.yaml"
        return 0
    fi

    cat > "$dest_file" << EOF
# Claude-Craft Context Configuration
# Auto-suggest skills based on file patterns (no auto-loading)

file_contexts:
${file_contexts}
EOF

    log_success "context.yaml generated"
}

# ============================================================================
# SUMMARY
# ============================================================================

show_tcl_summary() {
    local target_dir="$1"
    local tech_name="$2"
    local tech_namespace="$3"

    echo ""
    echo "========================================"
    echo "Installation TCL terminee avec succes!"
    echo "========================================"
    echo ""
    echo "Structure creee:"
    echo "  .claude/"
    echo "  ├── CLAUDE.md         (~180 tokens - auto-loaded)"
    echo "  ├── INDEX.md          (~830 tokens - quick reference)"
    echo "  ├── context.yaml      (skill suggestions)"
    echo "  ├── references/"
    echo "  │   ├── base/         (universal principles)"
    echo "  │   └── ${tech_namespace}/        (${tech_name} specific)"
    echo "  ├── skills/           (on-demand loading)"
    echo "  ├── commands/${tech_namespace}/   (slash commands)"
    echo "  └── agents/           (AI reviewers)"
    echo ""
    echo "Token reduction: ~95% (from ~70K to ~3.5K)"
    echo ""
    echo "Commandes disponibles:"
    echo "  /${tech_namespace}:check-compliance"
    echo "  /${tech_namespace}:check-architecture"
    echo "  /${tech_namespace}:check-code-quality"
    echo "  /${tech_namespace}:check-testing"
    echo "  /${tech_namespace}:check-security"
    echo ""
}
