#!/bin/bash
# Installation/Mise a jour des regles Claude Code pour projets VueJS
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-vuejs-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

VERSION="4.0.1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"
TECH_NAME="VueJS"
TECH_DISPLAY_NAME="Vue.js"
TECH_NAMESPACE="vuejs"
DEFAULT_STACK="Vue 3+, TypeScript 5+, Vite, Pinia, Vue Router, TailwindCSS"
lang="en"

# Source TCL common functions
source "${SCRIPT_DIR}/tcl-common.sh"

# TCL file mappings: "old_name:new_name"
TECH_RULE_MAPPINGS=(
    "02-architecture-vuejs.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-vuejs.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-vuejs.md:security.md"
)

# Legacy rules for backward compatibility detection
TECH_RULES=(
    "02-architecture-vuejs.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-vuejs.md"
    "08-quality-tools.md"
    "11-security-vuejs.md"
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# LOAD I18N MESSAGES
# ============================================================================
load_messages() {
    local lang_file="$I18N_DIR/messages/${lang}.sh"
    if [[ -f "$lang_file" ]]; then
        source "$lang_file"
    elif [[ -f "$I18N_DIR/messages/en.sh" ]]; then
        source "$I18N_DIR/messages/en.sh"
    fi
}

show_help() {
    cat << EOF
Usage: install-vuejs-rules.sh [OPTIONS] [PROJECT_DIR]

Installation/Mise a jour des regles Claude Code pour projets Vue.js.
Utilise l'architecture TCL (Tiered Context Loading) pour optimiser les tokens.

Options:
    --install       Installation complete
    --update        Mise a jour des regles communes uniquement
    --force         Ecraser tous les fichiers (backup automatique)
    --preserve-config  Preserver CLAUDE.md et INDEX.md avec --force
    --dry-run       Afficher les actions sans les executer
    --backup        Creer un backup avant modifications
    --interactive   Demander les valeurs du projet
    --lang=XX       Language for rules (en, fr, es, de, pt)
    --version       Afficher la version
    --help          Afficher cette aide

Description:
    Installation TCL optimisee couvrant :
    - Composition API patterns
    - TypeScript strict mode
    - Pinia state management
    - Vue Router configuration
    - Vitest + Vue Test Utils + Playwright
    - ESLint + Prettier + Vue-specific rules

    Reduction tokens: ~95% (de ~70K a ~3.5K)
EOF
}

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_dry_run() { echo -e "${YELLOW}[DRY-RUN]${NC} $1"; }

get_source_dir() {
    local i18n_src="$I18N_DIR/$lang/$TECH_NAME"
    if [[ -d "$i18n_src" ]]; then
        echo "$i18n_src"
    else
        echo "$SCRIPT_DIR"
    fi
}

verify_source_files() {
    local missing=0
    local src_dir
    src_dir=$(get_source_dir)

    for rule in "${TECH_RULES[@]}"; do
        if [ ! -f "${src_dir}/rules/${rule}" ]; then
            log_error "Fichier source manquant: rules/${rule}"
            missing=1
        fi
    done
    if [ ! -f "${src_dir}/CLAUDE.md.template" ]; then
        log_error "Fichier source manquant: CLAUDE.md.template"
        missing=1
    fi
    if [ $missing -eq 1 ]; then exit 1; fi
}

detect_installation() {
    local target_dir="$1"
    if [ -d "${target_dir}/.claude" ]; then
        # Check for TCL structure
        if [ -d "${target_dir}/.claude/references/${TECH_NAMESPACE}" ]; then
            echo "tcl"
        # Check for legacy structure
        elif [ -f "${target_dir}/.claude/rules/00-project-context.md" ]; then
            echo "legacy"
        else
            echo "partial"
        fi
    else
        echo "none"
    fi
}

create_backup() {
    local target_dir="$1"
    local dry_run="$2"
    local backup_dir="${target_dir}/.claude-backup-$(date +%Y%m%d-%H%M%S)"
    if [ -d "${target_dir}/.claude" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Backup: ${backup_dir}"
        else
            cp -r "${target_dir}/.claude" "${backup_dir}"
            log_success "Backup cree: ${backup_dir}"
        fi
    fi
}

# Copie des skills generiques depuis Common/
copy_generic_skills() {
    local target_dir="$1"
    local dry_run="$2"
    local common_skills_dir="$I18N_DIR/$lang/Common/skills"

    if [[ ! -d "$common_skills_dir" ]]; then
        return 0
    fi

    local count=0
    while IFS= read -r -d '' skill_dir; do
        local skill_name=$(basename "$skill_dir")
        local dest_dir="${target_dir}/.claude/skills/${skill_name}"

        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy skill: skills/${skill_name}/"
        else
            mkdir -p "$dest_dir"
            cp "$skill_dir"/*.md "$dest_dir/" 2>/dev/null || true
        fi
        ((count++)) || true
    done < <(find "$common_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "$count generic skills copied from Common/"
    fi
}

# Copie des skills tech-specifiques
copy_tech_skills() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local tech_skills_dir="${src_dir}/skills"

    if [[ ! -d "$tech_skills_dir" ]]; then
        return 0
    fi

    local count=0
    while IFS= read -r -d '' skill_dir; do
        local skill_name=$(basename "$skill_dir")
        local dest_dir="${target_dir}/.claude/skills/${skill_name}"

        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy skill: skills/${skill_name}/"
        else
            mkdir -p "$dest_dir"
            cp "$skill_dir"/*.md "$dest_dir/" 2>/dev/null || true
        fi
        ((count++)) || true
    done < <(find "$tech_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "$count Vue.js-specific skills copied"
    fi
}

copy_templates() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local tmpl_dir="${src_dir}/templates"
    if [ ! -d "$tmpl_dir" ]; then
        tmpl_dir="${SCRIPT_DIR}/templates"
    fi

    if [ -d "$tmpl_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: templates/*.md"
        else
            cp "${tmpl_dir}/"*.md "${target_dir}/.claude/templates/" 2>/dev/null || true
            log_success "Templates copies"
        fi
    fi
}

copy_checklists() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local chk_dir="${src_dir}/checklists"
    if [ ! -d "$chk_dir" ]; then
        chk_dir="${SCRIPT_DIR}/checklists"
    fi

    if [ -d "$chk_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: checklists/*.md"
        else
            cp "${chk_dir}/"*.md "${target_dir}/.claude/checklists/" 2>/dev/null || true
            log_success "Checklists copiees"
        fi
    fi
}

copy_commands() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local cmd_dir="${src_dir}/commands"
    if [ ! -d "$cmd_dir" ]; then
        cmd_dir="${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}"
    fi

    if [ -d "$cmd_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: commands/${TECH_NAMESPACE}/*.md"
        else
            cp "${cmd_dir}/"*.md "${target_dir}/.claude/commands/${TECH_NAMESPACE}/" 2>/dev/null || true
            local count=$(ls -1 "${cmd_dir}/"*.md 2>/dev/null | wc -l)
            log_success "${count} commandes copiees (/${TECH_NAMESPACE}:*)"
        fi
    fi
}

copy_agents() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local agt_dir="${src_dir}/agents"
    if [ ! -d "$agt_dir" ]; then
        agt_dir="${SCRIPT_DIR}/claude-agents"
    fi

    if [ -d "$agt_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: agents/*.md"
        else
            cp "${agt_dir}/"*.md "${target_dir}/.claude/agents/" 2>/dev/null || true
            log_success "Agents copies"
        fi
    fi
}

prompt_project_info() {
    echo ""
    echo "Configuration du projet ${TECH_NAME}"
    echo "=========================================="
    read -p "Nom du projet [MonProjet]: " PROJECT_NAME
    PROJECT_NAME="${PROJECT_NAME:-MonProjet}"
    read -p "Stack technique [${DEFAULT_STACK}]: " TECH_STACK
    TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"
    echo ""
    read -p "Confirmer? [Y/n]: " CONFIRM
    if [[ ! "${CONFIRM:-Y}" =~ ^[Yy]$ ]]; then
        log_warning "Installation annulee"
        exit 0
    fi
}

# ============================================================================
# TCL INSTALLATION
# ============================================================================
install_tcl() {
    local target_dir="$1"
    local project_name="$2"
    local tech_stack="$3"
    local dry_run="$4"
    local preserve_config="${5:-false}"
    local skip_common="${6:-false}"
    local src_dir
    src_dir=$(get_source_dir)

    # 1. Create TCL directory structure
    create_tcl_directory_structure "$target_dir" "$TECH_NAMESPACE" "$dry_run"

    # 2. Copy base references (universal principles)
    if [ "$skip_common" = "false" ]; then
        copy_base_references "$target_dir" "$I18N_DIR" "$lang" "$dry_run"
    fi

    # 3. Copy tech-specific references
    copy_tech_references "$target_dir" "$src_dir" "$TECH_NAMESPACE" "$dry_run" "${TECH_RULE_MAPPINGS[@]}"

    # 4. Copy project context template
    if [ "$dry_run" = "false" ]; then
        local ctx_template="${src_dir}/rules/00-project-context.md.template"
        if [ -f "$ctx_template" ]; then
            sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
                -e "s/{{TECH_STACK}}/${tech_stack}/g" \
                "$ctx_template" > "${target_dir}/.claude/references/${TECH_NAMESPACE}/project-context.md"
            log_success "project-context.md generated"
        fi
    fi

    # 5. Copy skills
    if [ "$skip_common" = "false" ]; then
        copy_generic_skills "$target_dir" "$dry_run"
    fi
    copy_tech_skills "$target_dir" "$dry_run"

    # 6. Copy templates, checklists, commands, agents
    copy_templates "$target_dir" "$dry_run"
    copy_checklists "$target_dir" "$dry_run"
    copy_commands "$target_dir" "$dry_run"
    copy_agents "$target_dir" "$dry_run"

    # 7. Generate minimal CLAUDE.md
    local available_commands="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit"

    generate_minimal_claude_md "$target_dir" "$project_name" "$TECH_DISPLAY_NAME" \
        "$tech_stack" "$TECH_NAMESPACE" "$available_commands" "$dry_run" "$preserve_config"

    # 8. Generate INDEX.md
    local architecture_summary="\`\`\`
src/
\u251c\u2500\u2500 components/       # Reusable Vue components
\u2502   \u251c\u2500\u2500 common/       # Shared UI components
\u2502   \u2514\u2500\u2500 features/     # Feature-specific components
\u251c\u2500\u2500 composables/      # Composition API functions
\u251c\u2500\u2500 views/            # Page-level components
\u251c\u2500\u2500 stores/           # Pinia stores
\u251c\u2500\u2500 router/           # Vue Router config
\u251c\u2500\u2500 types/            # TypeScript types
\u251c\u2500\u2500 utils/            # Helper functions
\u251c\u2500\u2500 services/         # API services
\u2514\u2500\u2500 assets/           # Static assets
\`\`\`

**Composition API**: Always use \`<script setup lang=\"ts\">\` with Composition API."

    local coding_standards_summary="| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | \`UserCard.vue\` |
| Composables | camelCase + use prefix | \`useAuth.ts\` |
| Stores | camelCase | \`userStore.ts\` |
| Props | camelCase | \`userName: string\` |
| Events | kebab-case | \`@update-user\` |
| CSS Classes | kebab-case / BEM | \`user-card__title\` |

**Always**: TypeScript strict mode, defineProps/defineEmits with types."

    local testing_stack="**Vue.js Stack**: Vitest + Vue Test Utils + Playwright + MSW"

    local tech_references="- \`${TECH_NAMESPACE}/architecture.md\` - Component architecture
- \`${TECH_NAMESPACE}/coding-standards.md\` - TypeScript & Vue conventions
- \`${TECH_NAMESPACE}/testing.md\` - Vitest & Playwright patterns
- \`${TECH_NAMESPACE}/tooling.md\` - Vite, ESLint, Prettier
- \`${TECH_NAMESPACE}/quality-tools.md\` - Code quality tools
- \`${TECH_NAMESPACE}/security.md\` - Vue.js security best practices"

    generate_index_md "$target_dir" "$TECH_DISPLAY_NAME" "$tech_stack" "$TECH_NAMESPACE" \
        "$architecture_summary" "$coding_standards_summary" "$testing_stack" \
        "$tech_references" "$dry_run" "$preserve_config"

    # 9. Generate context.yaml
    local file_contexts="  # Vue Single File Components
  \"*.vue\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Use <script setup lang=\"ts\"> with Composition API.
      Props: defineProps<{}>(), Emits: defineEmits<{}>()
      Keep components small and focused.

  # Composables
  \"**/composables/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Prefix with 'use': useAuth, useUser
      Return reactive refs and computed properties.
      Extract reusable logic from components.

  # Pinia Stores
  \"**/stores/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Use defineStore() with setup syntax.
      Keep state minimal, derive with getters.
      Actions for async operations.

  # Test files
  \"*.spec.ts\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Use @vue/test-utils for component tests.
      Mock composables and stores.
      Test user interactions, not implementation.

  \"*.test.ts\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Router
  \"**/router/**/*.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Use typed routes with vue-router.
      Implement navigation guards for auth.
      Lazy load route components.

  # API Services
  \"**/services/**/*.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Use typed API responses.
      Handle errors consistently.
      Implement request interceptors.

  # TypeScript types
  \"**/types/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Use interfaces for objects, types for unions.
      Export shared types from index.ts.

  # Views (Pages)
  \"**/views/**/*.vue\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Views orchestrate components.
      Fetch data here, pass to children.
      Use Suspense for async components.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

    generate_context_yaml "$target_dir" "$file_contexts" "$dry_run" "$preserve_config"
}

main() {
    local mode="" force="false" dry_run="false" backup="false" interactive="false" preserve_config="false" skip_common="false" target_dir="."

    while [[ $# -gt 0 ]]; do
        case $1 in
            --install) mode="install"; shift ;;
            --update) mode="update"; shift ;;
            --force) force="true"; shift ;;
            --preserve-config) preserve_config="true"; shift ;;
            --dry-run) dry_run="true"; shift ;;
            --backup) backup="true"; shift ;;
            --skip-common) skip_common="true"; shift ;;
            --interactive) interactive="true"; shift ;;
            --lang=*) lang="${1#--lang=}"; shift ;;
            --version) echo "install-vuejs-rules.sh version ${VERSION}"; exit 0 ;;
            --help|-h) show_help; exit 0 ;;
            -*) log_error "Option inconnue: $1"; exit 1 ;;
            *) target_dir="$1"; shift ;;
        esac
    done

    load_messages

    [ "$target_dir" != "." ] && [ -d "$target_dir" ] && target_dir="$(cd "${target_dir}" && pwd)" || target_dir="$(pwd)"

    echo ""
    echo "Installation des regles Claude Code - ${TECH_NAME} (TCL)"
    echo "=========================================="
    echo "Version: ${VERSION}"
    echo "Repertoire: ${target_dir}"

    verify_source_files

    if [ -z "$mode" ]; then
        case $(detect_installation "$target_dir") in
            tcl) log_info "Installation TCL existante -> mode update"; mode="update" ;;
            legacy) log_info "Installation legacy detectee -> migration TCL"; mode="install" ;;
            *) log_info "Nouvelle installation TCL"; mode="install" ;;
        esac
    fi

    [ "$backup" = "true" ] || [ "$force" = "true" ] && create_backup "$target_dir" "$dry_run"

    case $mode in
        install)
            [ "$interactive" = "true" ] && prompt_project_info || { PROJECT_NAME="${PROJECT_NAME:-MonProjet}"; TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"; }
            install_tcl "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run" "$preserve_config" "$skip_common"
            ;;
        update)
            if [ "$force" = "true" ]; then
                log_warning "Mode force: TOUS les fichiers seront ecrases"
                [ "$interactive" = "true" ] && prompt_project_info || { PROJECT_NAME="${PROJECT_NAME:-MonProjet}"; TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"; }
                install_tcl "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run" "$preserve_config" "$skip_common"
            else
                log_info "Mise a jour des references..."
                PROJECT_NAME="${PROJECT_NAME:-MonProjet}"
                TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"
                install_tcl "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run" "true" "$skip_common"
            fi
            ;;
    esac

    if [ "$dry_run" = "false" ]; then
        show_tcl_summary "$target_dir" "$TECH_NAME" "$TECH_NAMESPACE"
    else
        log_dry_run "Fin de la simulation"
    fi
}

main "$@"
