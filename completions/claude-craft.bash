#!/usr/bin/env bash
# Claude Craft - Bash Completion
# Installation: source completions/claude-craft.bash

_claude_craft_completions() {
    local cur="${COMP_WORDS[COMP_CWORD]}"
    local prev="${COMP_WORDS[COMP_CWORD-1]}"

    # Namespaces
    local namespaces="angular common csharp flutter laravel php python qa react reactnative symfony team uiux vuejs workflow"

    # Commands by namespace
    local angular_commands="check-architecture check-code-quality check-compliance check-security check-testing generate-component"
    local common_commands="add-technology architecture-decision audit-freshness daily-standup generate-changelog getting-started init pack-repo pre-commit-check pre-merge-check ralph-run release-checklist research-context7 setup-ci setup-project-context setup-rtk sub-agents-patterns"
    local csharp_commands="check-architecture check-code-quality check-compliance check-security check-testing generate-feature"
    local flutter_commands="analyze-performance check-architecture check-code-quality check-compliance check-security check-testing generate-feature generate-widget golden-update localization-check"
    local laravel_commands="check-architecture check-code-quality check-compliance check-security check-testing generate-controller"
    local php_commands="check-architecture check-code-quality check-compliance check-security check-testing"
    local python_commands="async-check check-architecture check-code-quality check-compliance check-security check-testing dependency-audit generate-endpoint generate-model type-coverage"
    local qa_commands="fix recette regression report status tdd"
    local react_commands="accessibility-check bundle-analyze check-architecture check-code-quality check-compliance check-security check-testing generate-component generate-hook storybook-story"
    local reactnative_commands="app-size check-architecture check-code-quality check-compliance check-security check-testing deep-link generate-screen native-module store-prepare"
    local symfony_commands="api-endpoint check-architecture check-code-quality check-compliance check-security check-testing generate-command generate-crud migration-plan optimize-doctrine"
    local team_commands="audit delivery security sprint"
    local uiux_commands="a11y-audit a11y-component audit component-spec design-tokens generate-design-md orchestrator user-flow"
    local vuejs_commands="check-architecture check-code-quality check-compliance check-security check-testing generate-component"
    local workflow_commands="analyze design implement init plan retro review start status"

    # If first argument, suggest namespaces
    if [[ ${COMP_CWORD} -eq 1 ]]; then
        COMPREPLY=($(compgen -W "$namespaces" -- "$cur"))
        return 0
    fi

    # If second argument, suggest commands for the namespace
    if [[ ${COMP_CWORD} -eq 2 ]]; then
        local namespace="${COMP_WORDS[1]}"
        case "$namespace" in
            angular)
                COMPREPLY=($(compgen -W "$angular_commands" -- "$cur"))
                ;;
            common)
                COMPREPLY=($(compgen -W "$common_commands" -- "$cur"))
                ;;
            csharp)
                COMPREPLY=($(compgen -W "$csharp_commands" -- "$cur"))
                ;;
            flutter)
                COMPREPLY=($(compgen -W "$flutter_commands" -- "$cur"))
                ;;
            laravel)
                COMPREPLY=($(compgen -W "$laravel_commands" -- "$cur"))
                ;;
            php)
                COMPREPLY=($(compgen -W "$php_commands" -- "$cur"))
                ;;
            python)
                COMPREPLY=($(compgen -W "$python_commands" -- "$cur"))
                ;;
            qa)
                COMPREPLY=($(compgen -W "$qa_commands" -- "$cur"))
                ;;
            react)
                COMPREPLY=($(compgen -W "$react_commands" -- "$cur"))
                ;;
            reactnative)
                COMPREPLY=($(compgen -W "$reactnative_commands" -- "$cur"))
                ;;
            symfony)
                COMPREPLY=($(compgen -W "$symfony_commands" -- "$cur"))
                ;;
            team)
                COMPREPLY=($(compgen -W "$team_commands" -- "$cur"))
                ;;
            uiux)
                COMPREPLY=($(compgen -W "$uiux_commands" -- "$cur"))
                ;;
            vuejs)
                COMPREPLY=($(compgen -W "$vuejs_commands" -- "$cur"))
                ;;
            workflow)
                COMPREPLY=($(compgen -W "$workflow_commands" -- "$cur"))
                ;;
        esac
        return 0
    fi
}

complete -F _claude_craft_completions claude-craft
