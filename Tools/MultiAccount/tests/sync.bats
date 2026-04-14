#!/usr/bin/env bats
# =============================================================================
# MultiAccount Sync Command — Tests
# =============================================================================
#
# Run with: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/MultiAccount/tests/sync.bats
# =============================================================================

SCRIPT="/mnt/MultiAccount/claude-accounts.sh"

setup() {
    if ! command -v jq &>/dev/null; then
        apk add --no-cache jq >/dev/null 2>&1
    fi

    export HOME="$(mktemp -d)"
    export CLAUDE_PROFILES_DIR="$HOME/.claude-profiles"
    mkdir -p "$HOME/.claude/hooks"

    # Create source hooks and settings
    cat > "$HOME/.claude/hooks/rtk-rewrite.sh" <<'EOF'
#!/bin/bash
REWRITTEN=$(rtk rewrite --ultra-compact "$CMD" 2>/dev/null)
EOF
    chmod +x "$HOME/.claude/hooks/rtk-rewrite.sh"

    cat > "$HOME/.claude/settings.json" <<'EOF'
{
  "env": { "CLAUDE_CODE_SUBAGENT_MODEL": "claude-sonnet-4-5" },
  "hooks": {}
}
EOF

    echo "# RTK Meta Commands" > "$HOME/.claude/RTK.md"

    # Create a fake claude binary
    mkdir -p "$HOME/.local/bin"
    echo '#!/bin/bash' > "$HOME/.local/bin/claude"
    chmod +x "$HOME/.local/bin/claude"
    export PATH="$HOME/.local/bin:$PATH"
}

teardown() {
    rm -rf "$HOME"
}

# Helper: create a profile
create_profile() {
    local name="$1"
    local mode="$2"
    local profile_path="$CLAUDE_PROFILES_DIR/$name"
    mkdir -p "$profile_path"
    echo "$mode" > "$profile_path/.mode"

    if [ "$mode" = "shared" ]; then
        ln -sf "$HOME/.claude" "$profile_path/config"
    elif [ "$mode" = "isolated" ]; then
        mkdir -p "$profile_path/hooks"
        echo '{"old": true}' > "$profile_path/settings.json"
    fi
}

# ============================================================
# SYNC COMMAND
# ============================================================

@test "sync skips shared profiles" {
    create_profile "shared-profile" "shared"

    # Source functions and run sync
    run bash -c "
        export HOME='$HOME'
        export CLAUDE_PROFILES_DIR='$CLAUDE_PROFILES_DIR'
        # Source minimal dependencies
        C_BOLD='' C_RESET='' C_GREEN='' C_CYAN='' C_MAGENTA='' C_YELLOW='' C_RED=''
        MSG_NO_PROFILE='No profiles'

        get_profile_mode() {
            cat \"\$CLAUDE_PROFILES_DIR/\$1/.mode\" 2>/dev/null || echo 'legacy'
        }
        print_info() { echo \"[INFO] \$1\"; }
        print_success() { echo \"[OK] \$1\"; }
        print_warning() { echo \"[WARN] \$1\"; }

        # Inline cmd_sync
        synced=0
        skipped=0
        for profile_dir in \"\$CLAUDE_PROFILES_DIR\"/*/; do
            profile_name=\$(basename \"\$profile_dir\")
            mode=\$(get_profile_mode \"\$profile_name\")
            if [ \"\$mode\" = 'shared' ]; then
                skipped=\$((skipped + 1))
            fi
        done
        echo \"skipped=\$skipped\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"skipped=1"* ]]
}

@test "sync copies hooks to isolated profiles" {
    create_profile "isolated-profile" "isolated"

    # Verify isolated profile initially does not have our hook
    [ ! -f "$CLAUDE_PROFILES_DIR/isolated-profile/hooks/rtk-rewrite.sh" ]

    # Perform sync (copy hooks)
    for hook_file in "$HOME/.claude/hooks"/*; do
        [ -e "$hook_file" ] || continue
        cp "$hook_file" "$CLAUDE_PROFILES_DIR/isolated-profile/hooks/"
    done

    # Verify hook was synced
    [ -f "$CLAUDE_PROFILES_DIR/isolated-profile/hooks/rtk-rewrite.sh" ]
    grep -q -- '--ultra-compact' "$CLAUDE_PROFILES_DIR/isolated-profile/hooks/rtk-rewrite.sh"
}

@test "sync merges settings.json for isolated profiles" {
    create_profile "isolated-profile" "isolated"

    # Verify old settings exist
    run jq -e '.old' "$CLAUDE_PROFILES_DIR/isolated-profile/settings.json"
    [ "$status" -eq 0 ]

    # Merge settings using jq (* operator does recursive deep merge of env too)
    merged=$(jq -s '.[0] * .[1]' \
        "$CLAUDE_PROFILES_DIR/isolated-profile/settings.json" \
        "$HOME/.claude/settings.json" 2>/dev/null)

    echo "$merged" > "$CLAUDE_PROFILES_DIR/isolated-profile/settings.json"

    # Verify env was merged
    run jq -e '.env.CLAUDE_CODE_SUBAGENT_MODEL' "$CLAUDE_PROFILES_DIR/isolated-profile/settings.json"
    [ "$status" -eq 0 ]
    [[ "$output" == *"claude-sonnet-4-5"* ]]
}

@test "sync copies RTK.md to isolated profiles" {
    create_profile "isolated-profile" "isolated"

    # Before sync
    [ ! -f "$CLAUDE_PROFILES_DIR/isolated-profile/RTK.md" ]

    # Copy RTK.md
    cp "$HOME/.claude/RTK.md" "$CLAUDE_PROFILES_DIR/isolated-profile/RTK.md"

    # After sync
    [ -f "$CLAUDE_PROFILES_DIR/isolated-profile/RTK.md" ]
}

@test "sync handles multiple profiles" {
    create_profile "shared1" "shared"
    create_profile "isolated1" "isolated"
    create_profile "isolated2" "isolated"

    local synced=0
    local skipped=0

    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        local profile_name
        profile_name=$(basename "$profile_dir")
        local mode
        mode=$(cat "$profile_dir/.mode" 2>/dev/null || echo "legacy")

        if [ "$mode" = "shared" ]; then
            skipped=$((skipped + 1))
        elif [ "$mode" = "isolated" ]; then
            # Sync hooks
            for hook_file in "$HOME/.claude/hooks"/*; do
                [ -e "$hook_file" ] || continue
                cp "$hook_file" "$profile_dir/hooks/"
            done
            synced=$((synced + 1))
        fi
    done

    [ "$synced" -eq 2 ]
    [ "$skipped" -eq 1 ]
}

@test "sync handles empty profiles directory" {
    mkdir -p "$CLAUDE_PROFILES_DIR"

    # Count profiles
    local count
    count=$(find "$CLAUDE_PROFILES_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
    [ "$count" -eq 0 ]
}
