#!/bin/bash
# =============================================================================
# Claude Code Status Line v2.0.0
#
# Displays: Profile | Model | Git | Project | Agent | Vim | Context | Cost | Time
# Modes: compact (1 line) or detailed (2 lines)
#
# Usage: Receives JSON from Claude Code via stdin
# Flags: --version, --help
# =============================================================================

VERSION="2.0.0"

# Handle --version and --help before reading stdin
case "${1:-}" in
    --version|-v)
        echo "claude-statusline $VERSION"
        exit 0
        ;;
    --help|-h)
        cat <<'HELP'
Claude Code Status Line v2.0.0

Displays contextual information in Claude Code's status bar.

USAGE:
  Configured in ~/.claude/settings.json:
    { "statusLine": { "type": "command", "command": "~/.claude/statusline.sh" } }

  Claude Code pipes JSON data to stdin automatically.

CONFIGURATION:
  Copy statusline.conf.example to ~/.claude/statusline.conf
  and adjust values for your subscription plan.

OPTIONS:
  --version, -v    Show version
  --help, -h       Show this help

ENVIRONMENT:
  CLAUDE_CONFIG_DIR    Override Claude config directory
  STATUSLINE_MODE      compact (default) or detailed
  CONTEXT_BAR_STYLE    percentage (default), bar, or both
  SHOW_*               Toggle individual elements (true/false)

See README.md for full documentation.
HELP
        exit 0
        ;;
esac

set -o pipefail

# -----------------------------------------------------------------------------
# Configuration defaults
# -----------------------------------------------------------------------------
CONTEXT_WARN_THRESHOLD="${CONTEXT_WARN_THRESHOLD:-60}"
CONTEXT_CRIT_THRESHOLD="${CONTEXT_CRIT_THRESHOLD:-80}"

# Usage limits (can be overridden by statusline.conf)
SESSION_COST_LIMIT="${SESSION_COST_LIMIT:-500.00}"
WEEKLY_COST_LIMIT="${WEEKLY_COST_LIMIT:-3000.00}"
USAGE_WARN_THRESHOLD="${USAGE_WARN_THRESHOLD:-60}"
USAGE_CRIT_THRESHOLD="${USAGE_CRIT_THRESHOLD:-80}"
SESSION_CACHE_TTL="${SESSION_CACHE_TTL:-60}"
WEEKLY_CACHE_TTL="${WEEKLY_CACHE_TTL:-300}"

# Element toggles (all true by default except burn rate and lines)
SHOW_PROFILE="${SHOW_PROFILE:-true}"
SHOW_MODEL="${SHOW_MODEL:-true}"
SHOW_GIT="${SHOW_GIT:-true}"
SHOW_PROJECT="${SHOW_PROJECT:-true}"
SHOW_CONTEXT="${SHOW_CONTEXT:-true}"
SHOW_COST="${SHOW_COST:-true}"
SHOW_TIME="${SHOW_TIME:-true}"
SHOW_BURN_RATE="${SHOW_BURN_RATE:-false}"
SHOW_LINES_CHANGED="${SHOW_LINES_CHANGED:-false}"
SHOW_VIM_MODE="${SHOW_VIM_MODE:-true}"
SHOW_AGENT="${SHOW_AGENT:-true}"
SHOW_SESSION_LIMIT="${SHOW_SESSION_LIMIT:-true}"
SHOW_WEEKLY_LIMIT="${SHOW_WEEKLY_LIMIT:-true}"

# Display options
STATUSLINE_MODE="${STATUSLINE_MODE:-compact}"
CONTEXT_BAR_STYLE="${CONTEXT_BAR_STYLE:-percentage}"
GIT_CACHE_TTL="${GIT_CACHE_TTL:-5}"

# Labels
SESSION_LABEL="${SESSION_LABEL:-⏱️ 5h}"
WEEKLY_LABEL="${WEEKLY_LABEL:-📅 Sem}"

# Load user config if it exists
STATUSLINE_CONF="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/statusline.conf"
# shellcheck source=/dev/null
[[ -f "$STATUSLINE_CONF" ]] && source "$STATUSLINE_CONF"

# ANSI colors
C_RESET='\033[00m'
C_RED='\033[01;31m'
C_GREEN='\033[01;32m'
C_YELLOW='\033[01;33m'
C_BLUE='\033[01;34m'
C_MAGENTA='\033[01;35m'
C_CYAN='\033[01;36m'
C_WHITE='\033[01;37m'
C_DIM='\033[02;37m'

# -----------------------------------------------------------------------------
# Cross-platform helpers
# -----------------------------------------------------------------------------
file_mtime() {
    stat -c %Y "$1" 2>/dev/null || stat -f %m "$1" 2>/dev/null || echo 0
}

# Auto-detect ccusage command (prefer global over npx)
detect_ccusage() {
    if command -v ccusage &>/dev/null; then
        echo "ccusage"
    elif command -v npx &>/dev/null; then
        echo "npx --yes ccusage@latest"
    else
        echo ""
    fi
}
CCUSAGE_CMD=$(detect_ccusage)

# -----------------------------------------------------------------------------
# Read JSON input (provided by Claude Code via stdin)
# -----------------------------------------------------------------------------
INPUT=$(cat)

# -----------------------------------------------------------------------------
# Single jq call to extract all fields at once
# -----------------------------------------------------------------------------
# Use unit separator (0x1F) as delimiter — bash read treats tab as whitespace
# and collapses consecutive tabs, losing empty fields
SEP=$'\x1f'

read_fields() {
    echo "$INPUT" | jq -r '[
        (.model.display_name // "Unknown"),
        (.model.id // ""),
        (.workspace.current_dir // .cwd // ""),
        (.workspace.project_dir // ""),
        (.cost.total_cost_usd // 0 | tostring),
        (.context_window.used_percentage // "" | tostring),
        (.cost.total_duration_ms // "" | tostring),
        (.cost.total_lines_added // "" | tostring),
        (.cost.total_lines_removed // "" | tostring),
        (.vim.mode // ""),
        (.agent.name // ""),
        (.transcript_path // "")
    ] | join("\u001f")'
}

IFS="$SEP" read -r MODEL_DISPLAY MODEL_ID CWD PROJECT_DIR SESSION_COST \
    CONTEXT_PCT_NATIVE TOTAL_DURATION_MS \
    LINES_ADDED LINES_REMOVED VIM_MODE AGENT_NAME \
    TRANSCRIPT_PATH <<< "$(read_fields)"

# Clean "null" strings from jq
for var in SESSION_COST CONTEXT_PCT_NATIVE \
    TOTAL_DURATION_MS LINES_ADDED LINES_REMOVED VIM_MODE AGENT_NAME; do
    [[ "${!var}" == "null" ]] && declare "$var="
done

# -----------------------------------------------------------------------------
# 1. PROFILE
# -----------------------------------------------------------------------------
get_profile() {
    if [[ -n "$CLAUDE_CONFIG_DIR" ]]; then
        local profile_name="${CLAUDE_CONFIG_DIR##*/}"
        profile_name="${profile_name#.claude-}"
        profile_name="${profile_name#claude-}"
        echo "$profile_name"
    else
        echo "default"
    fi
}

PROFILE=$(get_profile)

# -----------------------------------------------------------------------------
# 2. MODEL (with emoji based on type)
# -----------------------------------------------------------------------------
get_model_emoji() {
    case "$MODEL_ID" in
        *opus*)   echo "🧠" ;;
        *sonnet*) echo "🎵" ;;
        *haiku*)  echo "🍃" ;;
        *)        echo "🤖" ;;
    esac
}

MODEL_EMOJI=$(get_model_emoji)

# -----------------------------------------------------------------------------
# 3. GIT — Branch + Status (with cache)
# -----------------------------------------------------------------------------
get_git_info() {
    local dir="${1:-$CWD}"
    [[ -z "$dir" ]] && return
    [[ "$SHOW_GIT" != "true" ]] && return

    # Check if it's a git repo
    if ! git -C "$dir" rev-parse --git-dir &>/dev/null; then
        return
    fi

    # Cache mechanism
    local cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}/claude-statusline"
    mkdir -p "$cache_dir" 2>/dev/null
    local cache_file="$cache_dir/git_cache"
    local now
    now=$(date +%s)

    if [[ -f "$cache_file" ]]; then
        local cache_time
        cache_time=$(file_mtime "$cache_file")
        if [[ $((now - cache_time)) -lt $GIT_CACHE_TTL ]]; then
            cat "$cache_file"
            return
        fi
    fi

    local branch
    branch=$(git -C "$dir" branch --show-current 2>/dev/null)
    [[ -z "$branch" ]] && branch=$(git -C "$dir" rev-parse --short HEAD 2>/dev/null)
    [[ -z "$branch" ]] && return

    # Count files
    local staged unstaged untracked
    staged=$(git -C "$dir" diff --cached --numstat 2>/dev/null | wc -l | tr -d ' ')
    unstaged=$(git -C "$dir" diff --numstat 2>/dev/null | wc -l | tr -d ' ')
    untracked=$(git -C "$dir" ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')

    # Build status
    local status=""
    [[ "$staged" -gt 0 ]] && status+="+${staged}"
    [[ "$unstaged" -gt 0 ]] && status+="~${unstaged}"
    [[ "$untracked" -gt 0 ]] && status+="?${untracked}"

    local result
    if [[ -n "$status" ]]; then
        result="${branch} ${status}"
    else
        result="$branch"
    fi

    echo "$result" > "$cache_file"
    echo "$result"
}

GIT_INFO=$(get_git_info "$CWD")

# -----------------------------------------------------------------------------
# 4. PROJECT NAME
# -----------------------------------------------------------------------------
if [[ -n "$PROJECT_DIR" ]]; then
    PROJECT_NAME="${PROJECT_DIR##*/}"
elif [[ -n "$CWD" ]]; then
    PROJECT_NAME="${CWD##*/}"
else
    PROJECT_NAME="?"
fi

# -----------------------------------------------------------------------------
# 5. CONTEXT (%) — native field from Claude Code
# -----------------------------------------------------------------------------
get_context_percent() {
    # Priority 1: Native context_window.used_percentage from Claude Code
    if [[ -n "$CONTEXT_PCT_NATIVE" ]] && [[ "$CONTEXT_PCT_NATIVE" != "0" ]]; then
        # Round to integer
        printf "%.0f" "$CONTEXT_PCT_NATIVE" 2>/dev/null || echo "$CONTEXT_PCT_NATIVE"
        return
    fi

    # Priority 2: Fallback estimation from transcript size (~4MB = 100%)
    local transcript="$TRANSCRIPT_PATH"
    [[ ! -f "$transcript" ]] && return

    local size
    size=$(wc -c < "$transcript" 2>/dev/null || echo 0)
    local max_size=4000000
    local percent=$((size * 100 / max_size))
    [[ $percent -gt 100 ]] && percent=100
    echo "$percent"
}

CONTEXT_PCT=$(get_context_percent)

# Color based on threshold
get_context_color() {
    local pct="$1"
    [[ -z "$pct" ]] && echo "$C_DIM" && return

    if [[ "$pct" -ge "$CONTEXT_CRIT_THRESHOLD" ]]; then
        echo "$C_RED"
    elif [[ "$pct" -ge "$CONTEXT_WARN_THRESHOLD" ]]; then
        echo "$C_YELLOW"
    else
        echo "$C_GREEN"
    fi
}

CONTEXT_COLOR=$(get_context_color "$CONTEXT_PCT")

# Progress bar builder
build_progress_bar() {
    local pct="${1:-0}"
    local width=10
    local filled=$((pct * width / 100))
    [[ $filled -gt $width ]] && filled=$width
    local empty=$((width - filled))

    local bar=""
    local i
    for ((i = 0; i < filled; i++)); do bar+="▓"; done
    for ((i = 0; i < empty; i++)); do bar+="░"; done
    echo "[$bar]"
}

# Format context display based on CONTEXT_BAR_STYLE
format_context() {
    local pct="$1"
    [[ -z "$pct" ]] && return

    case "$CONTEXT_BAR_STYLE" in
        bar)
            echo "📊 $(build_progress_bar "$pct")"
            ;;
        both)
            echo "📊 $(build_progress_bar "$pct") ${pct}%"
            ;;
        *)  # percentage (default)
            echo "📊 ${pct}%"
            ;;
    esac
}

# -----------------------------------------------------------------------------
# 6. SESSION COST ($) — native from Claude Code JSON
# -----------------------------------------------------------------------------
get_session_cost() {
    if [[ -n "$SESSION_COST" ]] && [[ "$SESSION_COST" != "0" ]] && [[ "$SESSION_COST" != "null" ]]; then
        printf "%.2f" "$SESSION_COST"
        return
    fi
    echo "0.00"
}

COST=$(get_session_cost)

# -----------------------------------------------------------------------------
# 7. BURN RATE ($/min) — from cost and duration
# -----------------------------------------------------------------------------
get_burn_rate() {
    [[ "$SHOW_BURN_RATE" != "true" ]] && return
    [[ -z "$TOTAL_DURATION_MS" ]] && return
    [[ -z "$SESSION_COST" || "$SESSION_COST" == "0" ]] && return

    local minutes
    minutes=$(echo "$TOTAL_DURATION_MS" | awk '{if($1>0) printf "%.2f", $1/60000; else print 0}')
    [[ "$minutes" == "0" || "$minutes" == "0.00" ]] && return

    local rate
    rate=$(echo "$SESSION_COST $minutes" | awk '{if($2>0) printf "%.2f", $1/$2; else print 0}')
    [[ "$rate" == "0" || "$rate" == "0.00" ]] && return

    echo "\$${rate}/min"
}

BURN_RATE=$(get_burn_rate)

# -----------------------------------------------------------------------------
# 8. LINES CHANGED (+N -M)
# -----------------------------------------------------------------------------
get_lines_changed() {
    [[ "$SHOW_LINES_CHANGED" != "true" ]] && return
    [[ -z "$LINES_ADDED" && -z "$LINES_REMOVED" ]] && return

    local added="${LINES_ADDED:-0}"
    local removed="${LINES_REMOVED:-0}"
    [[ "$added" == "0" && "$removed" == "0" ]] && return

    echo "+${added} -${removed}"
}

LINES_CHANGED=$(get_lines_changed)

# -----------------------------------------------------------------------------
# 9. USAGE COLOR helper
# -----------------------------------------------------------------------------
get_usage_color() {
    local pct="$1"
    [[ -z "$pct" ]] && echo "$C_DIM" && return

    if [[ "$pct" -ge "$USAGE_CRIT_THRESHOLD" ]]; then
        echo "$C_RED"
    elif [[ "$pct" -ge "$USAGE_WARN_THRESHOLD" ]]; then
        echo "$C_YELLOW"
    else
        echo "$C_GREEN"
    fi
}

# -----------------------------------------------------------------------------
# 10. SESSION USAGE (% of 5h limit) via ccusage
# -----------------------------------------------------------------------------
get_session_usage_pct() {
    [[ "$SHOW_SESSION_LIMIT" != "true" ]] && return
    [[ -z "$CCUSAGE_CMD" ]] && return

    # Cache to avoid repeated calls
    local cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}/claude-statusline"
    mkdir -p "$cache_dir" 2>/dev/null
    local cache_file="$cache_dir/session_cache"
    local now
    now=$(date +%s)

    if [[ -f "$cache_file" ]]; then
        local cache_time
        cache_time=$(file_mtime "$cache_file")
        if [[ $((now - cache_time)) -lt $SESSION_CACHE_TTL ]]; then
            cat "$cache_file"
            return
        fi
    fi

    local today
    today=$(date +%Y%m%d)
    local cost
    # shellcheck disable=SC2086
    cost=$(timeout 5 $CCUSAGE_CMD daily --since "$today" --json 2>/dev/null | jq -r '.summary.totalCost // 0' 2>/dev/null)

    if [[ -z "$cost" ]] || [[ "$cost" == "null" ]]; then
        return
    fi

    local pct
    pct=$(echo "$cost $SESSION_COST_LIMIT" | awk '{if($2>0) printf "%d", ($1/$2)*100; else print 0}')
    [[ "$pct" -gt 100 ]] && pct=100

    echo "$pct" > "$cache_file"
    echo "$pct"
}

# -----------------------------------------------------------------------------
# 11. WEEKLY USAGE (% of weekly limit) via ccusage
# -----------------------------------------------------------------------------
get_weekly_usage_pct() {
    [[ "$SHOW_WEEKLY_LIMIT" != "true" ]] && return
    [[ -z "$CCUSAGE_CMD" ]] && return

    local cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}/claude-statusline"
    mkdir -p "$cache_dir" 2>/dev/null
    local cache_file="$cache_dir/weekly_cache"
    local now
    now=$(date +%s)

    if [[ -f "$cache_file" ]]; then
        local cache_time
        cache_time=$(file_mtime "$cache_file")
        if [[ $((now - cache_time)) -lt $WEEKLY_CACHE_TTL ]]; then
            cat "$cache_file"
            return
        fi
    fi

    local week_ago
    week_ago=$(date -d "7 days ago" +%Y%m%d 2>/dev/null || date -v-7d +%Y%m%d 2>/dev/null)
    [[ -z "$week_ago" ]] && return

    local cost
    # shellcheck disable=SC2086
    cost=$(timeout 8 $CCUSAGE_CMD daily --since "$week_ago" --json 2>/dev/null | jq -r '.summary.totalCost // 0' 2>/dev/null)

    if [[ -z "$cost" ]] || [[ "$cost" == "null" ]]; then
        return
    fi

    local pct
    pct=$(echo "$cost $WEEKLY_COST_LIMIT" | awk '{if($2>0) printf "%d", ($1/$2)*100; else print 0}')
    [[ "$pct" -gt 100 ]] && pct=100

    echo "$pct" > "$cache_file"
    echo "$pct"
}

SESSION_USAGE_PCT=$(get_session_usage_pct)
WEEKLY_USAGE_PCT=$(get_weekly_usage_pct)

# -----------------------------------------------------------------------------
# 12. TIME
# -----------------------------------------------------------------------------
CURRENT_TIME=$(date +"%H:%M")

# -----------------------------------------------------------------------------
# BUILD STATUS LINE — COMPACT MODE (1 line)
# -----------------------------------------------------------------------------
build_compact() {
    local output=""
    local sep=" ${C_DIM}|${C_RESET} "

    # Profile (magenta)
    if [[ "$SHOW_PROFILE" == "true" ]]; then
        output+="${C_MAGENTA}🔑 ${PROFILE}${C_RESET}"
    fi

    # Model (cyan)
    if [[ "$SHOW_MODEL" == "true" ]]; then
        [[ -n "$output" ]] && output+="$sep"
        output+="${C_CYAN}${MODEL_EMOJI} ${MODEL_DISPLAY}${C_RESET}"
    fi

    # Git (green/yellow based on status)
    if [[ "$SHOW_GIT" == "true" ]] && [[ -n "$GIT_INFO" ]]; then
        [[ -n "$output" ]] && output+="$sep"
        if [[ "$GIT_INFO" == *"+"* ]] || [[ "$GIT_INFO" == *"~"* ]] || [[ "$GIT_INFO" == *"?"* ]]; then
            output+="${C_YELLOW}🌿 ${GIT_INFO}${C_RESET}"
        else
            output+="${C_GREEN}🌿 ${GIT_INFO}${C_RESET}"
        fi
    fi

    # Project (blue)
    if [[ "$SHOW_PROJECT" == "true" ]]; then
        [[ -n "$output" ]] && output+="$sep"
        output+="${C_BLUE}📁 ${PROJECT_NAME}${C_RESET}"
    fi

    # Agent name
    if [[ "$SHOW_AGENT" == "true" ]] && [[ -n "$AGENT_NAME" ]]; then
        [[ -n "$output" ]] && output+="$sep"
        output+="${C_CYAN}@${AGENT_NAME}${C_RESET}"
    fi

    # Vim mode
    if [[ "$SHOW_VIM_MODE" == "true" ]] && [[ -n "$VIM_MODE" ]]; then
        [[ -n "$output" ]] && output+="$sep"
        local vim_upper
        vim_upper=$(echo "$VIM_MODE" | tr '[:lower:]' '[:upper:]')
        output+="${C_WHITE}${vim_upper}${C_RESET}"
    fi

    # Context (color based on threshold)
    if [[ "$SHOW_CONTEXT" == "true" ]] && [[ -n "$CONTEXT_PCT" ]]; then
        [[ -n "$output" ]] && output+="$sep"
        output+="${CONTEXT_COLOR}$(format_context "$CONTEXT_PCT")${C_RESET}"
    fi

    # Session usage
    if [[ -n "$SESSION_USAGE_PCT" ]] && [[ "$SESSION_USAGE_PCT" != "0" ]]; then
        local session_color
        session_color=$(get_usage_color "$SESSION_USAGE_PCT")
        [[ -n "$output" ]] && output+="$sep"
        output+="${session_color}${SESSION_LABEL}: ${SESSION_USAGE_PCT}%${C_RESET}"
    fi

    # Weekly usage
    if [[ -n "$WEEKLY_USAGE_PCT" ]] && [[ "$WEEKLY_USAGE_PCT" != "0" ]]; then
        local weekly_color
        weekly_color=$(get_usage_color "$WEEKLY_USAGE_PCT")
        [[ -n "$output" ]] && output+="$sep"
        output+="${weekly_color}${WEEKLY_LABEL}: ${WEEKLY_USAGE_PCT}%${C_RESET}"
    fi

    # Cost (white)
    if [[ "$SHOW_COST" == "true" ]]; then
        [[ -n "$output" ]] && output+="$sep"
        output+="${C_WHITE}💰 \$${COST}${C_RESET}"
        # Burn rate inline
        if [[ -n "$BURN_RATE" ]]; then
            output+=" ${C_DIM}(${BURN_RATE})${C_RESET}"
        fi
    fi

    # Time (dim)
    if [[ "$SHOW_TIME" == "true" ]]; then
        [[ -n "$output" ]] && output+="$sep"
        output+="${C_DIM}🕐 ${CURRENT_TIME}${C_RESET}"
    fi

    printf '%b' "$output"
}

# -----------------------------------------------------------------------------
# BUILD STATUS LINE — DETAILED MODE (2 lines)
# -----------------------------------------------------------------------------
build_detailed() {
    local sep=" ${C_DIM}|${C_RESET} "

    # --- Line 1: identity & workspace ---
    local line1=""

    if [[ "$SHOW_PROFILE" == "true" ]]; then
        line1+="${C_MAGENTA}🔑 ${PROFILE}${C_RESET}"
    fi

    if [[ "$SHOW_MODEL" == "true" ]]; then
        [[ -n "$line1" ]] && line1+="$sep"
        line1+="${C_CYAN}${MODEL_EMOJI} ${MODEL_DISPLAY}${C_RESET}"
    fi

    if [[ "$SHOW_GIT" == "true" ]] && [[ -n "$GIT_INFO" ]]; then
        [[ -n "$line1" ]] && line1+="$sep"
        if [[ "$GIT_INFO" == *"+"* ]] || [[ "$GIT_INFO" == *"~"* ]] || [[ "$GIT_INFO" == *"?"* ]]; then
            line1+="${C_YELLOW}🌿 ${GIT_INFO}${C_RESET}"
        else
            line1+="${C_GREEN}🌿 ${GIT_INFO}${C_RESET}"
        fi
    fi

    if [[ "$SHOW_PROJECT" == "true" ]]; then
        [[ -n "$line1" ]] && line1+="$sep"
        line1+="${C_BLUE}📁 ${PROJECT_NAME}${C_RESET}"
    fi

    if [[ "$SHOW_AGENT" == "true" ]] && [[ -n "$AGENT_NAME" ]]; then
        [[ -n "$line1" ]] && line1+="$sep"
        line1+="${C_CYAN}@${AGENT_NAME}${C_RESET}"
    fi

    if [[ "$SHOW_VIM_MODE" == "true" ]] && [[ -n "$VIM_MODE" ]]; then
        [[ -n "$line1" ]] && line1+="$sep"
        local vim_upper
        vim_upper=$(echo "$VIM_MODE" | tr '[:lower:]' '[:upper:]')
        line1+="${C_WHITE}${vim_upper}${C_RESET}"
    fi

    # --- Line 2: metrics ---
    local line2=""

    if [[ "$SHOW_CONTEXT" == "true" ]] && [[ -n "$CONTEXT_PCT" ]]; then
        line2+="${CONTEXT_COLOR}$(format_context "$CONTEXT_PCT")${C_RESET}"
    fi

    if [[ "$SHOW_COST" == "true" ]]; then
        [[ -n "$line2" ]] && line2+="$sep"
        line2+="${C_WHITE}💰 \$${COST}${C_RESET}"
        if [[ -n "$BURN_RATE" ]]; then
            line2+=" ${C_DIM}(${BURN_RATE})${C_RESET}"
        fi
    fi

    if [[ "$SHOW_LINES_CHANGED" == "true" ]] && [[ -n "$LINES_CHANGED" ]]; then
        [[ -n "$line2" ]] && line2+="$sep"
        line2+="${C_GREEN}${LINES_CHANGED}${C_RESET}"
    fi

    if [[ -n "$SESSION_USAGE_PCT" ]] && [[ "$SESSION_USAGE_PCT" != "0" ]]; then
        local session_color
        session_color=$(get_usage_color "$SESSION_USAGE_PCT")
        [[ -n "$line2" ]] && line2+="$sep"
        line2+="${session_color}${SESSION_LABEL}: ${SESSION_USAGE_PCT}%${C_RESET}"
    fi

    if [[ -n "$WEEKLY_USAGE_PCT" ]] && [[ "$WEEKLY_USAGE_PCT" != "0" ]]; then
        local weekly_color
        weekly_color=$(get_usage_color "$WEEKLY_USAGE_PCT")
        [[ -n "$line2" ]] && line2+="$sep"
        line2+="${weekly_color}${WEEKLY_LABEL}: ${WEEKLY_USAGE_PCT}%${C_RESET}"
    fi

    if [[ "$SHOW_TIME" == "true" ]]; then
        [[ -n "$line2" ]] && line2+="$sep"
        line2+="${C_DIM}🕐 ${CURRENT_TIME}${C_RESET}"
    fi

    # Output both lines
    printf '%b\n%b' "$line1" "$line2"
}

# -----------------------------------------------------------------------------
# OUTPUT
# -----------------------------------------------------------------------------
case "$STATUSLINE_MODE" in
    detailed) build_detailed ;;
    *)        build_compact ;;
esac
