#!/usr/bin/env bats
# =============================================================================
# Tests for compatibility-check.sh
# Run: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/AgentTeams/tests/compatibility-check.bats
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
SCRIPT="$SCRIPT_DIR/lib/compatibility-check.sh"

setup() {
    export TEST_DIR=$(mktemp -d)

    # Create test agent file: restricted tools + haiku model
    cat > "$TEST_DIR/agent-restricted.md" << 'AGENT'
---
name: restricted-agent
model: haiku
tools: [Read, Glob, Grep]
description: A restricted agent for testing
---

# Restricted Agent

This agent has limited tools.
AGENT

    # Create test agent file: no tools restriction (all tools available)
    cat > "$TEST_DIR/agent-unrestricted.md" << 'AGENT'
---
name: unrestricted-agent
model: sonnet
description: An unrestricted agent
---

# Unrestricted Agent

This agent has no tool restrictions.
AGENT

    # Create test agent file: with disallowedTools
    cat > "$TEST_DIR/agent-disallowed.md" << 'AGENT'
---
name: disallowed-agent
model: sonnet
tools: [Read, Write, Edit, Glob, Grep, Bash]
disallowedTools: [Bash]
description: Agent with disallowed tools
---

# Disallowed Agent

This agent has Bash in its disallowed list.
AGENT

    # Create test agent file: opus model
    cat > "$TEST_DIR/agent-opus.md" << 'AGENT'
---
name: opus-agent
model: opus
tools: [Read, Write, Edit, Glob, Grep, Bash]
description: An opus-tier agent
---

# Opus Agent

High-capability agent.
AGENT

    # Create test agent file: haiku model with many tools
    cat > "$TEST_DIR/agent-haiku-full.md" << 'AGENT'
---
name: haiku-full-agent
model: haiku
tools: [Read, Write, Edit, Glob, Grep, Bash]
description: Haiku agent with full tools
---

# Haiku Full Agent

Low-tier model but all tools.
AGENT

    # Create test agent file: no frontmatter
    cat > "$TEST_DIR/agent-no-frontmatter.md" << 'AGENT'
# No Frontmatter Agent

This file has no YAML frontmatter.
AGENT

    # Create agent directory for batch mode
    mkdir -p "$TEST_DIR/agents"
    cp "$TEST_DIR/agent-restricted.md" "$TEST_DIR/agents/"
    cp "$TEST_DIR/agent-unrestricted.md" "$TEST_DIR/agents/"
    cp "$TEST_DIR/agent-opus.md" "$TEST_DIR/agents/"
}

teardown() {
    rm -rf "$TEST_DIR"
}

# =============================================================================
# Tool checks: agent with required tools passes
# =============================================================================

@test "agent with required tools passes" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-restricted.md" --require-tools "Read,Glob,Grep"
    [ "$status" -eq 0 ]
    [[ "$output" == *"COMPATIBLE"* ]]
}

@test "agent with subset of required tools passes" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-restricted.md" --require-tools "Read"
    [ "$status" -eq 0 ]
    [[ "$output" == *"COMPATIBLE"* ]]
}

# =============================================================================
# Tool checks: agent missing required tool fails
# =============================================================================

@test "agent missing a required tool fails (exit 1)" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-restricted.md" --require-tools "Read,Write,Bash"
    [ "$status" -eq 1 ]
    [[ "$output" == *"INCOMPATIBLE"* ]]
    [[ "$output" == *"MISSING"* ]]
}

@test "agent missing Write tool specifically" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-restricted.md" --require-tools "Write"
    [ "$status" -eq 1 ]
    [[ "$output" == *"FAIL"* ]]
    [[ "$output" == *"Write"* ]]
}

# =============================================================================
# Tool checks: disallowed tool
# =============================================================================

@test "agent with disallowed required tool fails" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-disallowed.md" --require-tools "Bash"
    [ "$status" -eq 1 ]
    [[ "$output" == *"INCOMPATIBLE"* ]]
    [[ "$output" == *"disallowedTools"* ]]
}

# =============================================================================
# Tool checks: no tools restriction (all tools available)
# =============================================================================

@test "agent with no tools restriction passes any tool check" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-unrestricted.md" --require-tools "Read,Write,Edit,Bash,Glob,Grep"
    [ "$status" -eq 0 ]
    [[ "$output" == *"COMPATIBLE"* ]]
}

# =============================================================================
# Model tier checks
# =============================================================================

@test "model tier check passes when agent >= required (opus >= sonnet)" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-opus.md" --require-tools "Read" --require-model "sonnet"
    [ "$status" -eq 0 ]
    [[ "$output" == *"COMPATIBLE"* ]]
    [[ "$output" == *"meets minimum"* ]]
}

@test "model tier check passes when agent == required (sonnet >= sonnet)" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-unrestricted.md" --require-tools "Read" --require-model "sonnet"
    [ "$status" -eq 0 ]
    [[ "$output" == *"COMPATIBLE"* ]]
}

@test "model tier check fails when agent < required (haiku < sonnet)" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-haiku-full.md" --require-tools "Read" --require-model "sonnet"
    [ "$status" -eq 1 ]
    [[ "$output" == *"INCOMPATIBLE"* ]]
    [[ "$output" == *"below minimum"* ]]
}

@test "model tier check fails when haiku < opus" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-restricted.md" --require-tools "Read" --require-model "opus"
    [ "$status" -eq 1 ]
    [[ "$output" == *"INCOMPATIBLE"* ]]
}

# =============================================================================
# Dry-run mode
# =============================================================================

@test "--dry-run shows info without validating" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-restricted.md" --require-tools "Read,Write,Bash" --dry-run
    [ "$status" -eq 0 ]
    [[ "$output" == *"DRY RUN"* ]]
    [[ "$output" == *"Would perform"* ]]
    [[ "$output" == *"No validation performed"* ]]
}

@test "--dry-run shows agent details" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-restricted.md" --require-tools "Read" --dry-run
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent name:"* ]]
    [[ "$output" == *"Agent model:"* ]]
    [[ "$output" == *"Agent tools:"* ]]
}

# =============================================================================
# Batch mode
# =============================================================================

@test "--batch mode checks multiple agents" {
    run bash "$SCRIPT" --agent-dir "$TEST_DIR/agents" --require-tools "Read" --batch
    [ "$status" -eq 0 ]
    [[ "$output" == *"Batch Compatibility Summary"* ]]
    [[ "$output" == *"Total agents:"* ]]
    [[ "$output" == *"Compatible:"* ]]
}

@test "--batch mode detects incompatible agents" {
    # agent-restricted only has Read,Glob,Grep -- requiring Write should fail it
    run bash "$SCRIPT" --agent-dir "$TEST_DIR/agents" --require-tools "Read,Write" --batch
    # Exit code 1 because at least one agent is incompatible
    [ "$status" -eq 1 ]
    [[ "$output" == *"Incompatible:"* ]]
}

# =============================================================================
# Error handling
# =============================================================================

@test "missing agent file returns exit code 3" {
    run bash "$SCRIPT" --agent "$TEST_DIR/nonexistent.md" --require-tools "Read"
    [ "$status" -eq 3 ]
    [[ "$output" == *"not found"* ]] || [[ "$output" == *"ERROR"* ]]
}

@test "missing requirements returns exit code 2" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-restricted.md"
    [ "$status" -eq 2 ]
    [[ "$output" == *"Must specify at least one requirement"* ]]
}

@test "no --agent and no --agent-dir returns exit code 2" {
    run bash "$SCRIPT" --require-tools "Read"
    [ "$status" -eq 2 ]
    [[ "$output" == *"Must specify --agent"* ]]
}

@test "agent file with no frontmatter returns exit code 3" {
    run bash "$SCRIPT" --agent "$TEST_DIR/agent-no-frontmatter.md" --require-tools "Read"
    [ "$status" -eq 3 ]
    [[ "$output" == *"No YAML frontmatter"* ]] || [[ "$output" == *"parse"* ]] || [[ "$output" == *"ERROR"* ]]
}

# =============================================================================
# CLI: --help and --version
# =============================================================================

@test "CLI: --help shows usage" {
    run bash "$SCRIPT" --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Compatibility Checker"* ]]
    [[ "$output" == *"USAGE"* ]]
    [[ "$output" == *"OPTIONS"* ]]
    [[ "$output" == *"EXIT CODES"* ]]
}

@test "CLI: -h shows usage" {
    run bash "$SCRIPT" -h
    [ "$status" -eq 0 ]
    [[ "$output" == *"Compatibility Checker"* ]]
}

@test "CLI: --version shows version" {
    run bash "$SCRIPT" --version
    [ "$status" -eq 0 ]
    [[ "$output" == *"v1.0.0"* ]]
}

@test "CLI: -v shows version" {
    run bash "$SCRIPT" -v
    [ "$status" -eq 0 ]
    [[ "$output" == *"v1.0.0"* ]]
}

@test "CLI: unknown option returns error" {
    run bash "$SCRIPT" --unknown-flag
    [ "$status" -eq 2 ]
    [[ "$output" == *"Unknown option"* ]]
}
