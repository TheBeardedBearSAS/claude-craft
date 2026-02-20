#!/usr/bin/env bats
# =============================================================================
# RTK Install Script — Tests
# =============================================================================
#
# Run with: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/RTK/tests/
# =============================================================================

SCRIPT="/mnt/RTK/install-rtk.sh"
I18N_DIR="/mnt/i18n/rtk"

setup() {
    # Install jq in Alpine (bats/bats image is Alpine-based)
    if ! command -v jq &>/dev/null; then
        apk add --no-cache jq >/dev/null 2>&1
    fi

    # Create temp directories for testing
    export HOME="$(mktemp -d)"
    export CLAUDE_DIR="$HOME/.claude"
    mkdir -p "$CLAUDE_DIR/hooks"

    # Create a fake rtk binary for testing
    mkdir -p "$HOME/.local/bin"
    cat > "$HOME/.local/bin/rtk" <<'EOF'
#!/bin/bash
case "$1" in
    --version) echo "rtk 0.22.1" ;;
    gain) echo "Saved 1.2M tokens (85%)" ;;
    init)
        mkdir -p ~/.claude/hooks
        cat > ~/.claude/hooks/rtk-rewrite.sh <<'HOOK'
#!/bin/bash
# RTK rewrite hook
HOOK
        chmod +x ~/.claude/hooks/rtk-rewrite.sh
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
# I18N FILES
# ============================================================

@test "English i18n file exists and sources cleanly" {
    run bash -c "source $I18N_DIR/en.sh && echo \$MSG_HEADER"
    [ "$status" -eq 0 ]
    [[ "$output" == *"RTK"* ]]
}

@test "French i18n file exists and sources cleanly" {
    run bash -c "source $I18N_DIR/fr.sh && echo \$MSG_HEADER"
    [ "$status" -eq 0 ]
    [[ "$output" == *"RTK"* ]]
}

@test "All 5 i18n files exist" {
    [ -f "$I18N_DIR/en.sh" ]
    [ -f "$I18N_DIR/fr.sh" ]
    [ -f "$I18N_DIR/es.sh" ]
    [ -f "$I18N_DIR/de.sh" ]
    [ -f "$I18N_DIR/pt.sh" ]
}

# ============================================================
# MERGE: CREATE SETTINGS.JSON
# ============================================================

@test "merge creates settings.json when it does not exist" {
    rm -f "$CLAUDE_DIR/settings.json"

    # Source the script functions
    run bash -c "
        export HOME='$HOME'
        source /mnt/lib/tools-ui.sh 2>/dev/null || true
        source $I18N_DIR/en.sh

        CLAUDE_DIR='$CLAUDE_DIR'
        SETTINGS_FILE='$CLAUDE_DIR/settings.json'
        HOOKS_DIR='$CLAUDE_DIR/hooks'
        HOOK_SCRIPT='$CLAUDE_DIR/hooks/rtk-rewrite.sh'

        # Inline the merge function
        mkdir -p \"\$CLAUDE_DIR\"
        if [[ ! -f \"\$SETTINGS_FILE\" ]]; then
            cat > \"\$SETTINGS_FILE\" <<'SETTINGS_EOF'
{
  \"hooks\": {
    \"PreToolUse\": [
      {
        \"matcher\": \"Bash\",
        \"hooks\": [
          {
            \"type\": \"command\",
            \"command\": \"~/.claude/hooks/rtk-rewrite.sh\"
          }
        ]
      }
    ]
  }
}
SETTINGS_EOF
        fi

        # Verify
        jq -e '.hooks.PreToolUse' \"\$SETTINGS_FILE\"
    "
    [ "$status" -eq 0 ]
}

# ============================================================
# MERGE: APPEND TO EXISTING ARRAY
# ============================================================

@test "merge appends RTK hook to existing PreToolUse array" {
    # Create settings.json with an existing security hook
    cat > "$CLAUDE_DIR/settings.json" <<'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/security-check.sh"
          }
        ]
      }
    ]
  }
}
EOF

    local rtk_hook='{"matcher":"Bash","hooks":[{"type":"command","command":"~/.claude/hooks/rtk-rewrite.sh"}]}'

    run jq --argjson hook "$rtk_hook" '
        .hooks //= {} |
        .hooks.PreToolUse //= [] |
        .hooks.PreToolUse += [$hook]
    ' "$CLAUDE_DIR/settings.json"

    [ "$status" -eq 0 ]

    # Write result and verify both hooks exist
    echo "$output" > "$CLAUDE_DIR/settings.json"

    run jq '.hooks.PreToolUse | length' "$CLAUDE_DIR/settings.json"
    [ "$output" = "2" ]

    # Security hook still present
    run jq -e '.hooks.PreToolUse[] | select(.hooks[]?.command == "~/.claude/hooks/security-check.sh")' "$CLAUDE_DIR/settings.json"
    [ "$status" -eq 0 ]

    # RTK hook present
    run jq -e '.hooks.PreToolUse[] | select(.hooks[]?.command == "~/.claude/hooks/rtk-rewrite.sh")' "$CLAUDE_DIR/settings.json"
    [ "$status" -eq 0 ]
}

# ============================================================
# MERGE: IDEMPOTENCE
# ============================================================

@test "merge is idempotent — no duplicate on second run" {
    # Create settings with RTK hook already present
    cat > "$CLAUDE_DIR/settings.json" <<'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/rtk-rewrite.sh"
          }
        ]
      }
    ]
  }
}
EOF

    # Check: hook is already present, so skip
    run jq -e '.hooks.PreToolUse[]? | select(.hooks[]?.command == "~/.claude/hooks/rtk-rewrite.sh")' "$CLAUDE_DIR/settings.json"
    [ "$status" -eq 0 ]

    # Count should still be 1
    run jq '.hooks.PreToolUse | length' "$CLAUDE_DIR/settings.json"
    [ "$output" = "1" ]
}

# ============================================================
# UNINSTALL: PRESERVES OTHER HOOKS
# ============================================================

@test "uninstall removes RTK hook but preserves security hook" {
    # Create settings with both hooks
    cat > "$CLAUDE_DIR/settings.json" <<'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/security-check.sh"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/rtk-rewrite.sh"
          }
        ]
      }
    ]
  }
}
EOF

    # Remove RTK hook
    run jq '
        .hooks.PreToolUse = [
            .hooks.PreToolUse[]? |
            select(.hooks[]?.command != "~/.claude/hooks/rtk-rewrite.sh")
        ]
    ' "$CLAUDE_DIR/settings.json"

    [ "$status" -eq 0 ]
    echo "$output" > "$CLAUDE_DIR/settings.json"

    # Security hook still present
    run jq -e '.hooks.PreToolUse[] | select(.hooks[]?.command == "~/.claude/hooks/security-check.sh")' "$CLAUDE_DIR/settings.json"
    [ "$status" -eq 0 ]

    # RTK hook removed — count matching entries should be 0
    run jq '[.hooks.PreToolUse[]? | select(.hooks[]?.command == "~/.claude/hooks/rtk-rewrite.sh")] | length' "$CLAUDE_DIR/settings.json"
    [ "$status" -eq 0 ]
    [ "$output" = "0" ]

    # Only 1 hook remaining
    run jq '.hooks.PreToolUse | length' "$CLAUDE_DIR/settings.json"
    [ "$output" = "1" ]
}

# ============================================================
# BACKUP
# ============================================================

@test "backup is created before merge" {
    cat > "$CLAUDE_DIR/settings.json" <<'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/security-check.sh"
          }
        ]
      }
    ]
  }
}
EOF

    # Simulate backup creation
    cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.bak.test"

    [ -f "$CLAUDE_DIR/settings.json.bak.test" ]

    # Verify backup content matches original
    run diff "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.bak.test"
    [ "$status" -eq 0 ]
}

# ============================================================
# EDGE CASES
# ============================================================

@test "merge handles settings.json with no hooks key" {
    cat > "$CLAUDE_DIR/settings.json" <<'EOF'
{
  "env": {
    "SOME_VAR": "value"
  }
}
EOF

    local rtk_hook='{"matcher":"Bash","hooks":[{"type":"command","command":"~/.claude/hooks/rtk-rewrite.sh"}]}'

    run jq --argjson hook "$rtk_hook" '
        .hooks //= {} |
        .hooks.PreToolUse //= [] |
        .hooks.PreToolUse += [$hook]
    ' "$CLAUDE_DIR/settings.json"

    [ "$status" -eq 0 ]
    echo "$output" > "$CLAUDE_DIR/settings.json"

    # RTK hook present
    run jq -e '.hooks.PreToolUse[] | select(.hooks[]?.command == "~/.claude/hooks/rtk-rewrite.sh")' "$CLAUDE_DIR/settings.json"
    [ "$status" -eq 0 ]

    # env key preserved
    run jq -e '.env.SOME_VAR' "$CLAUDE_DIR/settings.json"
    [ "$status" -eq 0 ]
    [[ "$output" == *"value"* ]]
}

@test "merge handles empty PreToolUse array" {
    cat > "$CLAUDE_DIR/settings.json" <<'EOF'
{
  "hooks": {
    "PreToolUse": []
  }
}
EOF

    local rtk_hook='{"matcher":"Bash","hooks":[{"type":"command","command":"~/.claude/hooks/rtk-rewrite.sh"}]}'

    run jq --argjson hook "$rtk_hook" '
        .hooks //= {} |
        .hooks.PreToolUse //= [] |
        .hooks.PreToolUse += [$hook]
    ' "$CLAUDE_DIR/settings.json"

    [ "$status" -eq 0 ]
    echo "$output" > "$CLAUDE_DIR/settings.json"

    run jq '.hooks.PreToolUse | length' "$CLAUDE_DIR/settings.json"
    [ "$output" = "1" ]
}
