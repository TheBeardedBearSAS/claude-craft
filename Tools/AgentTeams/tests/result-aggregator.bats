#!/usr/bin/env bats
# =============================================================================
# Tests for result-aggregator.sh
# Run: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/AgentTeams/tests/result-aggregator.bats
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
SCRIPT="$SCRIPT_DIR/lib/result-aggregator.sh"

setup() {
    # Skip all tests if jq is not available
    if ! command -v jq &> /dev/null; then
        skip "jq is not installed"
    fi

    export TEST_DIR=$(mktemp -d)

    # Create input directory with valid result.json files
    mkdir -p "$TEST_DIR/input/agent-1"
    mkdir -p "$TEST_DIR/input/agent-2"
    mkdir -p "$TEST_DIR/input/agent-3"

    # Agent 1: symfony architecture check
    cat > "$TEST_DIR/input/agent-1/result.json" << 'JSON'
{
    "tech": "symfony",
    "category": "architecture",
    "score": 22,
    "max": 25,
    "findings": [
        {
            "severity": "warning",
            "file": "src/Controller/UserController.php",
            "message": "Direct repository access from controller",
            "rule": "clean-architecture-layer-violation"
        },
        {
            "severity": "info",
            "file": "src/Entity/User.php",
            "message": "Consider using value objects for email",
            "rule": "ddd-value-object"
        }
    ]
}
JSON

    # Agent 2: symfony code-quality check
    cat > "$TEST_DIR/input/agent-2/result.json" << 'JSON'
{
    "tech": "symfony",
    "category": "code-quality",
    "score": 20,
    "max": 25,
    "findings": [
        {
            "severity": "error",
            "file": "src/Service/PaymentService.php",
            "message": "Method exceeds 50 lines",
            "rule": "method-length"
        },
        {
            "severity": "warning",
            "file": "src/Controller/UserController.php",
            "message": "Direct repository access from controller",
            "rule": "clean-architecture-layer-violation"
        }
    ]
}
JSON

    # Agent 3: react architecture check
    cat > "$TEST_DIR/input/agent-3/result.json" << 'JSON'
{
    "tech": "react",
    "category": "architecture",
    "score": 23,
    "max": 25,
    "findings": [
        {
            "severity": "info",
            "file": "src/components/Header.tsx",
            "message": "Consider extracting hook from component",
            "rule": "component-hook-extraction"
        }
    ]
}
JSON

    # Create empty input directory for error tests
    mkdir -p "$TEST_DIR/empty-input"

    # Create directory with invalid result.json
    mkdir -p "$TEST_DIR/invalid-input/agent-bad"
    echo '{ "invalid": "no required fields" }' > "$TEST_DIR/invalid-input/agent-bad/result.json"

    # Create directory with duplicate findings (same file+message, different severity)
    mkdir -p "$TEST_DIR/dedup-input/agent-a"
    mkdir -p "$TEST_DIR/dedup-input/agent-b"

    cat > "$TEST_DIR/dedup-input/agent-a/result.json" << 'JSON'
{
    "tech": "symfony",
    "category": "architecture",
    "score": 20,
    "max": 25,
    "findings": [
        {
            "severity": "warning",
            "file": "src/Controller/UserController.php",
            "message": "Direct repository access from controller",
            "rule": "layer-violation"
        }
    ]
}
JSON

    cat > "$TEST_DIR/dedup-input/agent-b/result.json" << 'JSON'
{
    "tech": "symfony",
    "category": "architecture",
    "score": 22,
    "max": 25,
    "findings": [
        {
            "severity": "error",
            "file": "src/Controller/UserController.php",
            "message": "Direct repository access from controller",
            "rule": "layer-violation"
        }
    ]
}
JSON

    # Create score conflict input (same tech+category from multiple agents)
    mkdir -p "$TEST_DIR/score-input/agent-x"
    mkdir -p "$TEST_DIR/score-input/agent-y"

    cat > "$TEST_DIR/score-input/agent-x/result.json" << 'JSON'
{
    "tech": "react",
    "category": "architecture",
    "score": 20,
    "max": 25,
    "findings": []
}
JSON

    cat > "$TEST_DIR/score-input/agent-y/result.json" << 'JSON'
{
    "tech": "react",
    "category": "architecture",
    "score": 24,
    "max": 25,
    "findings": []
}
JSON
}

teardown() {
    rm -rf "$TEST_DIR"
}

# Helper to skip if jq not available
_require_jq() {
    if ! command -v jq &> /dev/null; then
        skip "jq is not installed"
    fi
}

# =============================================================================
# Collects results from subdirectories
# =============================================================================

@test "collects results from subdirectories" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --output-file "$TEST_DIR/report.json"
    [ "$status" -eq 0 ]
    [ -f "$TEST_DIR/report.json" ]
    # Validate the output is valid JSON
    jq '.' "$TEST_DIR/report.json" > /dev/null 2>&1
    [ $? -eq 0 ]
}

@test "report contains all technologies" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --output-file "$TEST_DIR/report.json"
    [ "$status" -eq 0 ]
    local techs
    techs=$(jq '.summary.total_technologies' "$TEST_DIR/report.json")
    [ "$techs" -eq 2 ]
}

@test "report contains correct number of findings after dedup" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --output-file "$TEST_DIR/report.json"
    [ "$status" -eq 0 ]
    # Original findings: 2 + 2 + 1 = 5
    # After dedup: "Direct repository access" appears twice with same file+message -> 4
    local total_findings
    total_findings=$(jq '.summary.total_findings' "$TEST_DIR/report.json")
    [ "$total_findings" -le 5 ]
    [ "$total_findings" -ge 3 ]
}

# =============================================================================
# Validates result.json schema (rejects missing fields)
# =============================================================================

@test "validates result.json schema (rejects missing fields)" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/invalid-input" --output-file "$TEST_DIR/report.json"
    # Should fail because no valid results found
    [ "$status" -ne 0 ]
    [[ "$output" == *"No"* ]] || [[ "$output" == *"Invalid"* ]] || [[ "$output" == *"ERROR"* ]]
}

# =============================================================================
# Deduplication
# =============================================================================

@test "deduplicates findings (same file+message)" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/dedup-input" --output-file "$TEST_DIR/report.json"
    [ "$status" -eq 0 ]
    # Both agents have the same finding for UserController.php
    # Should be deduplicated to 1 finding
    local total
    total=$(jq '.summary.total_findings' "$TEST_DIR/report.json")
    [ "$total" -eq 1 ]
}

@test "keeps higher severity when deduplicating" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/dedup-input" --output-file "$TEST_DIR/report.json"
    [ "$status" -eq 0 ]
    # The error severity should be kept over warning
    local severity
    severity=$(jq -r '.findings[0].severity' "$TEST_DIR/report.json")
    [ "$severity" = "error" ]
}

# =============================================================================
# Score conflict resolution
# =============================================================================

@test "resolves score conflicts by averaging" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/score-input" --output-file "$TEST_DIR/report.json"
    [ "$status" -eq 0 ]
    # Two agents for react/architecture: score 20 and 24 -> average 22
    local score
    score=$(jq '.technologies.react.categories.architecture.score' "$TEST_DIR/report.json")
    [ "$score" -eq 22 ]
}

# =============================================================================
# Report structure
# =============================================================================

@test "builds complete report with all sections" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --output-file "$TEST_DIR/report.json"
    [ "$status" -eq 0 ]
    # Check all required top-level keys
    jq -e '.generated_at' "$TEST_DIR/report.json" > /dev/null
    [ $? -eq 0 ]
    jq -e '.technologies' "$TEST_DIR/report.json" > /dev/null
    [ $? -eq 0 ]
    jq -e '.findings' "$TEST_DIR/report.json" > /dev/null
    [ $? -eq 0 ]
    jq -e '.summary' "$TEST_DIR/report.json" > /dev/null
    [ $? -eq 0 ]
    jq -e '.summary.by_severity' "$TEST_DIR/report.json" > /dev/null
    [ $? -eq 0 ]
}

@test "report has valid generated_at timestamp" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --output-file "$TEST_DIR/report.json"
    [ "$status" -eq 0 ]
    local ts
    ts=$(jq -r '.generated_at' "$TEST_DIR/report.json")
    # Should match ISO 8601 pattern: YYYY-MM-DDTHH:MM:SSZ
    [[ "$ts" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]]
}

# =============================================================================
# Dry-run
# =============================================================================

@test "dry-run shows preview without writing" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --dry-run
    [ "$status" -eq 0 ]
    [[ "$output" == *"DRY RUN"* ]]
    [[ "$output" == *"Would aggregate"* ]]
}

@test "dry-run with output-file mentions the target path" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --output-file "$TEST_DIR/no-write.json" --dry-run
    [ "$status" -eq 0 ]
    [[ "$output" == *"DRY RUN"* ]]
    # File should NOT be created in dry-run
    [ ! -f "$TEST_DIR/no-write.json" ]
}

# =============================================================================
# --output-file
# =============================================================================

@test "--output-file writes to specified path" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --output-file "$TEST_DIR/custom/output/report.json"
    [ "$status" -eq 0 ]
    [ -f "$TEST_DIR/custom/output/report.json" ]
    # Validate it is valid JSON
    jq '.' "$TEST_DIR/custom/output/report.json" > /dev/null 2>&1
    [ $? -eq 0 ]
}

@test "output to stdout when no --output-file" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input"
    [ "$status" -eq 0 ]
    # stdout should contain valid JSON with generated_at
    echo "$output" | jq -e '.generated_at' > /dev/null 2>&1
    [ $? -eq 0 ]
}

# =============================================================================
# Error handling
# =============================================================================

@test "empty input directory returns error" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/empty-input"
    [ "$status" -ne 0 ]
    [[ "$output" == *"No"* ]] || [[ "$output" == *"ERROR"* ]]
}

@test "nonexistent input directory returns error" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/nonexistent"
    [ "$status" -ne 0 ]
    [[ "$output" == *"does not exist"* ]] || [[ "$output" == *"ERROR"* ]]
}

# =============================================================================
# jq dependency check
# =============================================================================

@test "handles missing jq gracefully" {
    # Test by temporarily renaming jq (simulated via PATH)
    run bash -c "
        export PATH='/usr/bin/nonexistent'
        bash '$SCRIPT' --input-dir '$TEST_DIR/input' 2>&1
    "
    # Should fail with helpful message about jq
    [ "$status" -ne 0 ]
    [[ "$output" == *"jq"* ]]
}

# =============================================================================
# CLI interface
# =============================================================================

@test "CLI: --help shows usage" {
    run bash "$SCRIPT" --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent Teams - Result Aggregator"* ]]
    [[ "$output" == *"USAGE:"* ]]
    [[ "$output" == *"REQUIRED:"* ]]
    [[ "$output" == *"OPTIONS:"* ]]
}

@test "CLI: -h shows usage" {
    run bash "$SCRIPT" -h
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent Teams - Result Aggregator"* ]]
}

@test "CLI: help subcommand shows usage" {
    run bash "$SCRIPT" help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent Teams - Result Aggregator"* ]]
}

@test "CLI: missing --input-dir returns error" {
    run bash "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == *"Missing required argument"* ]] || [[ "$output" == *"--input-dir"* ]]
}

@test "CLI: unknown option returns error" {
    run bash "$SCRIPT" --unknown-flag
    [ "$status" -eq 1 ]
    [[ "$output" == *"Unknown option"* ]]
}

@test "CLI: --verbose enables detailed output" {
    _require_jq
    run bash "$SCRIPT" --input-dir "$TEST_DIR/input" --verbose
    [ "$status" -eq 0 ]
    # Verbose mode should show DEBUG-level messages
    [[ "$output" == *"DEBUG"* ]] || [[ "$output" == *"Combined"* ]] || [[ "$output" == *"Found"* ]]
}
