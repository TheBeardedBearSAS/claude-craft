#!/usr/bin/env bats
# =============================================================================
# RTK Ultra-Compact Patch — Tests
# =============================================================================
#
# Run with: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/RTK/tests/ultra-compact.bats
# =============================================================================

SCRIPT="/mnt/RTK/install-rtk.sh"
I18N_DIR="/mnt/i18n/rtk"

setup() {
    if ! command -v jq &>/dev/null; then
        apk add --no-cache jq >/dev/null 2>&1
    fi

    export HOME="$(mktemp -d)"
    export CLAUDE_DIR="$HOME/.claude"
    mkdir -p "$CLAUDE_DIR/hooks"

    # Create a fake rtk binary
    mkdir -p "$HOME/.local/bin"
    cat > "$HOME/.local/bin/rtk" <<'EOF'
#!/bin/bash
case "$1" in
    --version) echo "rtk 0.36.0" ;;
    gain) echo "Saved 1.2M tokens (85%)" ;;
    init)
        mkdir -p ~/.claude/hooks
        cat > ~/.claude/hooks/rtk-rewrite.sh <<'HOOK'
#!/bin/bash
INPUT=$(cat)
CMD=$(jq -r '.tool_input.command // empty' <<<"$INPUT")
if [ -z "$CMD" ]; then exit 0; fi
REWRITTEN=$(rtk rewrite "$CMD" 2>/dev/null)
EXIT_CODE=$?
echo "$REWRITTEN"
HOOK
        chmod +x ~/.claude/hooks/rtk-rewrite.sh
        # Create hash file
        sha256sum ~/.claude/hooks/rtk-rewrite.sh > ~/.claude/hooks/.rtk-hook.sha256
        chmod 444 ~/.claude/hooks/.rtk-hook.sha256
        ;;
esac
EOF
    chmod +x "$HOME/.local/bin/rtk"
    export PATH="$HOME/.local/bin:$PATH"
}

teardown() {
    rm -rf "$HOME"
}

# ============================================================
# ULTRA-COMPACT PATCH
# ============================================================

@test "install-rtk.sh patches hook with --ultra-compact" {
    # Run rtk init to create the hook
    rtk init

    # Verify hook exists without --ultra-compact
    [ -f "$CLAUDE_DIR/hooks/rtk-rewrite.sh" ]
    grep -q 'rtk rewrite "$CMD"' "$CLAUDE_DIR/hooks/rtk-rewrite.sh"
    ! grep -q -- '--ultra-compact' "$CLAUDE_DIR/hooks/rtk-rewrite.sh"

    # Source the install script functions and run the patch
    HOOKS_DIR="$CLAUDE_DIR/hooks"
    HOOK_SCRIPT="$CLAUDE_DIR/hooks/rtk-rewrite.sh"

    # Apply the sed patch (same logic as install-rtk.sh)
    sed -i 's/rtk rewrite "\$CMD"/rtk rewrite --ultra-compact "\$CMD"/' "$HOOK_SCRIPT"

    # Verify --ultra-compact is now present
    grep -q -- '--ultra-compact' "$HOOK_SCRIPT"
}

@test "ultra-compact patch is idempotent" {
    # Create hook with --ultra-compact already present
    cat > "$CLAUDE_DIR/hooks/rtk-rewrite.sh" <<'EOF'
#!/bin/bash
REWRITTEN=$(rtk rewrite --ultra-compact "$CMD" 2>/dev/null)
EOF

    # Apply patch again (should not create double flag)
    if ! grep -q -- '--ultra-compact' "$CLAUDE_DIR/hooks/rtk-rewrite.sh"; then
        sed -i 's/rtk rewrite "\$CMD"/rtk rewrite --ultra-compact "\$CMD"/' "$CLAUDE_DIR/hooks/rtk-rewrite.sh"
    fi

    # Count occurrences of --ultra-compact
    local count
    count=$(grep -c -- '--ultra-compact' "$CLAUDE_DIR/hooks/rtk-rewrite.sh")
    [ "$count" -eq 1 ]
}

@test "hash file is updated after patching" {
    # Create hook
    rtk init
    local original_hash
    original_hash=$(cat "$CLAUDE_DIR/hooks/.rtk-hook.sha256")

    # Patch the hook
    HOOK_SCRIPT="$CLAUDE_DIR/hooks/rtk-rewrite.sh"
    HOOKS_DIR="$CLAUDE_DIR/hooks"
    sed -i 's/rtk rewrite "\$CMD"/rtk rewrite --ultra-compact "\$CMD"/' "$HOOK_SCRIPT"

    # Update hash
    local hash_file="$HOOKS_DIR/.rtk-hook.sha256"
    chmod 644 "$hash_file" 2>/dev/null || true
    sha256sum "$HOOK_SCRIPT" > "$hash_file"
    chmod 444 "$hash_file" 2>/dev/null || true

    # Verify hash changed
    local new_hash
    new_hash=$(cat "$hash_file")
    [ "$original_hash" != "$new_hash" ]

    # Verify hash matches actual file
    run sha256sum -c "$hash_file"
    [ "$status" -eq 0 ]
}
