#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum — Dependency check module
#
# Extracted from ralph.sh in audit-driven release v8.3.x (ARCH-002 partial).
# Single responsibility: ensure required CLI tools are present before the
# main loop starts. Optional tools (git, yq) are warned about but not
# treated as failures.
#
# This file is sourced by ralph.sh::load_modules(). It depends on the
# `print_*` helpers and the `MSG_*` strings already loaded by ralph.sh
# before this module runs.
# =============================================================================

ralph_check_dependencies() {
    local missing=()

    # Required: claude — the agent loop literally cannot run without it.
    if ! command -v claude &> /dev/null; then
        missing+=("claude")
    fi

    # Required: jq — used everywhere to parse Claude's JSON output and to read
    # session state files.
    if ! command -v jq &> /dev/null; then
        missing+=("jq")
    fi

    # Optional: git is recommended for the checkpoint/recovery feature but
    # the loop can still run without it (no auto-commit, no rollback).
    if ! command -v git &> /dev/null; then
        print_warning "${MSG_ERROR_GIT_NOT_FOUND:-git not found — checkpoint feature disabled}"
    fi

    # Optional: yq is used by the YAML config loader. Tip-only — the loop
    # falls back to defaults when ralph.yml is absent.
    if ! command -v yq &> /dev/null; then
        print_verbose "${MSG_ERROR_YQ_NOT_FOUND:-yq not found — YAML config disabled}"
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        print_error "${MSG_ERROR:-Error}: Missing required dependencies: ${missing[*]}"
        exit 1
    fi
}

# Backwards-compat alias: ralph.sh originally called `check_dependencies`.
# Keep both names available so we don't break callers that source the lib
# directly.
check_dependencies() {
    ralph_check_dependencies "$@"
}
