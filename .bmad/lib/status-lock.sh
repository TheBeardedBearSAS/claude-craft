#!/usr/bin/env bash
# BMAD v6 - Advisory lock around writes of .bmad/sprint-status.yaml
#
# Same protocol as the Kanban server (cli/kanban/server/services/lock.js), so
# scripts and the server never write the file at the same time:
#   - lock file "<yaml>.lock", created exclusively (noclobber = O_EXCL);
#   - content {"pid":<int>,"ts":<epoch ms>};
#   - stale when ts is older than 10 s or pid is gone; unreadable content is
#     judged on the file mtime; a stale lock is removed and retried.
#
# Usage (sourced):
#   with_status_lock "$SPRINT_STATUS_FILE" some_function args...
#   status_lock_acquire "$SPRINT_STATUS_FILE" || return 1; ...; status_lock_release
# Re-entrant within one process: a locked function may call another one.
# No `declare` here: this file may be sourced from inside a function.

# Every caller already runs in strict mode; stated here so the file is also safe on its own.
set -euo pipefail

STATUS_LOCK_TTL_MS=10000
STATUS_LOCK_RETRIES="${STATUS_LOCK_RETRIES:-25}"   # x 0.1 s; the scripts hold it longer than the server
STATUS_LOCK_DELAY=0.1

_STATUS_LOCK_PATH=""
_STATUS_LOCK_TOKEN=""
_STATUS_LOCK_DEPTH=0
_STATUS_LOCK_SAVED_TRAPS=""
_STATUS_LOCK_SEEN=""
_STATUS_LOCK_JSON_RE='^[[:space:]]*\{[[:space:]]*"pid"[[:space:]]*:[[:space:]]*([0-9]+)[[:space:]]*,[[:space:]]*"ts"[[:space:]]*:[[:space:]]*([0-9]+)(\.[0-9]+)?[[:space:]]*\}[[:space:]]*$'

# Epoch milliseconds. EPOCHREALTIME (bash 5) first: GNU date has %N but BSD
# (macOS) and busybox date do not (busybox silently prints seconds only).
_status_lock_now_ms() {
    local t="${EPOCHREALTIME:-}"
    if [[ -n "$t" ]]; then
        t="${t//[.,]/}"   # decimal separator follows the locale
        echo $((10#$t / 1000))
        return
    fi
    t="$(date +%s%3N 2>/dev/null || true)"
    if [[ "$t" =~ ^[0-9]{13}$ ]]; then
        echo "$t"
    else
        echo $(($(date +%s) * 1000))
    fi
}

# Like lock.js: alive unless the kernel says ESRCH (EPERM = alive, not ours).
_status_lock_pid_alive() {
    local err
    err="$( (export LC_ALL=C; kill -0 "$1") 2>&1 )" && return 0
    [[ "$err" != *"No such process"* ]]
}

# Sets _STATUS_LOCK_SEEN to the content it judged, for _status_lock_remove_stale.
_status_lock_is_stale() {
    local lock="$1" now content mtime
    now="$(_status_lock_now_ms)"
    content="$(cat "$lock" 2>/dev/null)" || content=""
    _STATUS_LOCK_SEEN="$content"
    if [[ "$content" =~ $_STATUS_LOCK_JSON_RE ]]; then
        local pid=$((10#${BASH_REMATCH[1]})) ts=$((10#${BASH_REMATCH[2]}))
        if ((now - ts > STATUS_LOCK_TTL_MS)); then
            return 0
        fi
        ! _status_lock_pid_alive "$pid"
        return
    fi
    # Half-written or foreign content: judge on mtime (GNU/busybox, then BSD stat).
    # Vanished meanwhile: not stale. Its holder released it and another writer may already hold a new one, which a
    # removal would destroy; the caller waits and retries.
    mtime="$(stat -c %Y "$lock" 2>/dev/null || stat -f %m "$lock" 2>/dev/null)" || return 1
    ((now - mtime * 1000 > STATUS_LOCK_TTL_MS))
}

# Remove a lock judged stale only if it still holds what was judged: its holder may have released it meanwhile (a
# gone pid is also a writer that just finished) and another writer may hold a new one.
_status_lock_remove_stale() {
    local current
    current="$(cat "$1" 2>/dev/null)" || return 0 # vanished: nothing to remove
    if [[ "$current" == "$_STATUS_LOCK_SEEN" ]]; then
        rm -f "$1"
    fi
}

# Release unconditionally (also run by the traps), never removing a lock that
# another writer took over.
_status_lock_drop() {
    [[ -n "$_STATUS_LOCK_PATH" ]] || return 0
    local current
    current="$(cat "$_STATUS_LOCK_PATH" 2>/dev/null)" || current=""
    if [[ "$current" == "$_STATUS_LOCK_TOKEN" ]]; then
        rm -f "$_STATUS_LOCK_PATH"
    fi
    _STATUS_LOCK_PATH=""
    _STATUS_LOCK_TOKEN=""
    _STATUS_LOCK_DEPTH=0
    trap - EXIT INT TERM HUP
    eval "$_STATUS_LOCK_SAVED_TRAPS"
}

status_lock_acquire() {
    local lock="$1.lock" attempt content
    if [[ "$_STATUS_LOCK_PATH" == "$lock" ]]; then
        _STATUS_LOCK_DEPTH=$((_STATUS_LOCK_DEPTH + 1))
        return 0
    fi
    if [[ -n "$_STATUS_LOCK_PATH" ]]; then
        echo "[ERROR] already holding $_STATUS_LOCK_PATH, cannot also lock $lock" >&2
        return 1
    fi
    for ((attempt = 0; attempt <= STATUS_LOCK_RETRIES; attempt++)); do
        # Only a regular file is a lock. noclobber still opens an existing FIFO or
        # device for writing, and cat would read it: a symlink committed in a
        # branch (to a FIFO, /dev/zero...) would block or fill memory. Drop it.
        if [[ -L "$lock" || (-e "$lock" && ! -f "$lock") ]]; then
            rm -f "$lock"
        fi
        # BASHPID, not $$: the owner may be a subshell of the script.
        content="{\"pid\":${BASHPID:-$$},\"ts\":$(_status_lock_now_ms)}"
        if (set -C; printf '%s' "$content" > "$lock") 2>/dev/null; then
            _STATUS_LOCK_PATH="$lock"
            _STATUS_LOCK_TOKEN="$content"
            _STATUS_LOCK_DEPTH=1
            _STATUS_LOCK_SAVED_TRAPS="$(trap -p EXIT INT TERM HUP)"
            trap '_status_lock_drop' EXIT
            trap '_status_lock_drop; exit 130' INT
            trap '_status_lock_drop; exit 143' TERM
            trap '_status_lock_drop; exit 129' HUP
            return 0
        fi
        if _status_lock_is_stale "$lock"; then
            _status_lock_remove_stale "$lock"
            continue
        fi
        if ((attempt < STATUS_LOCK_RETRIES)); then
            sleep "$STATUS_LOCK_DELAY"
        fi
    done
    echo "[ERROR] $1 is locked by another writer (lock: $lock); nothing written, retry later" >&2
    return 1
}

status_lock_release() {
    [[ -n "$_STATUS_LOCK_PATH" ]] || return 0
    _STATUS_LOCK_DEPTH=$((_STATUS_LOCK_DEPTH - 1))
    if ((_STATUS_LOCK_DEPTH > 0)); then
        return 0
    fi
    _status_lock_drop
}

# with_status_lock <yaml> <command...>: run the command holding the lock.
# The command is NOT run in a `||` list, so `set -e` keeps aborting it on the
# first failing yq; that exit runs the EXIT trap, which releases the lock.
with_status_lock() {
    local yaml="$1" rc
    shift
    status_lock_acquire "$yaml" || return 1
    "$@"
    rc=$?
    status_lock_release
    return "$rc"
}
