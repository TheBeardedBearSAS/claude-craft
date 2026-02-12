#!/bin/bash
# Bash completion for claude-accounts
# Source this file or copy to /etc/bash_completion.d/

_claude_accounts() {
    local cur prev commands
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    commands="add rm list auth run migrate doctor help"

    # Complete commands
    if [[ $COMP_CWORD -eq 1 ]]; then
        COMPREPLY=( $(compgen -W "$commands --version --json --lang=en --lang=fr --lang=es --lang=de --lang=pt" -- "$cur") )
        return
    fi

    # Complete profile names for commands that take a profile
    case "$prev" in
        add|a)
            # No completion for new profile names
            return
            ;;
        rm|remove|delete|auth|login|run|start|r)
            local profiles_dir="$HOME/.claude-profiles"
            if [[ -d "$profiles_dir" ]]; then
                local profiles
                profiles=$(ls -1 "$profiles_dir" 2>/dev/null)
                COMPREPLY=( $(compgen -W "$profiles" -- "$cur") )
            fi
            return
            ;;
        --lang=*)
            return
            ;;
    esac

    # Complete --force for rm
    if [[ "${COMP_WORDS[1]}" == "rm" || "${COMP_WORDS[1]}" == "remove" || "${COMP_WORDS[1]}" == "delete" ]]; then
        COMPREPLY=( $(compgen -W "--force" -- "$cur") )
        return
    fi
}

complete -F _claude_accounts claude-accounts
