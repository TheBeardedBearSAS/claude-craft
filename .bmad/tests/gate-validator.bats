#!/usr/bin/env bats
# =============================================================================
# Regression tests for .bmad/lib/gate-validator.sh
#
# Reproduces the Wrandly bug: `set -euo pipefail` + `((score++))`. In bash,
# `((score++))` evaluates the OLD value, so when score == 0 the expression
# returns exit code 1, and under `set -e` the script ABORTS after the first
# check. Symptom: every /gate:* command dies after validating one item.
#
# Before the fix these behavioral tests are RED (script exits non-zero, no
# PASS line). After converting `((score++))` -> `score=$((score + 1))` they
# are GREEN.
#
# Run: docker run --rm -v "$(pwd):/mnt" bats/bats:latest /mnt/.bmad/tests/
# =============================================================================

BMAD_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
VALIDATOR="$BMAD_DIR/lib/gate-validator.sh"

# Build a PRD that satisfies all 8 validate_prd() checks.
write_complete_prd() {
    cat > "$1" <<'EOF'
# Product Requirements Document

## Problem statement
The current challenge / issue is X.

## Target users
Personas: the customer / target user.

## Goals and objectives
Our goal / objective / aim is Y.

## Success metrics
KPI and metric to measure success.

## Scope
In scope and out of scope boundary / limitation.

## User stories
Epic overview: US-001 user story list.

## Assumptions
We assume / assumption Z holds.

## Risks
Risk and mitigation identified.
EOF
}

# Build a tech-spec that satisfies all 10 validate_techspec() checks.
write_complete_techspec() {
    cat > "$1" <<'EOF'
# Technical Specification

## Architecture
System architecture / design / structure overview.

## Diagram
```mermaid
graph TD; A-->B;
```

## Data model
Entity / schema / table data model.

## API contracts
REST api endpoint and graphql contracts.

## Security
Auth, encryption and permission security considerations.

## Performance
Latency, throughput and scale performance requirements.

## Error handling
Exception / failure handling strategy.

## Testing strategy
Test coverage and quality strategy.

## Deployment
CI / CD release / deploy strategy.

## Dependencies
External dependency / require / integration documented.
EOF
}

@test "validate_prd runs ALL checks without aborting (set -e + ((score++)) regression)" {
    prd="$BATS_TEST_TMPDIR/prd.md"
    write_complete_prd "$prd"

    run bash "$VALIDATOR" prd "$prd"

    # Before fix: aborts at first ((score++)) -> status != 0, no final PASS.
    [ "$status" -eq 0 ]
    [[ "$output" == *"PASS"* ]]
    [[ "$output" == *"Score: 8/8"* ]]
    [[ "$output" == *"PRD Gate PASSED"* ]]
}

@test "validate_techspec runs ALL checks without aborting" {
    spec="$BATS_TEST_TMPDIR/tech-spec.md"
    write_complete_techspec "$spec"

    run bash "$VALIDATOR" techspec "$spec"

    [ "$status" -eq 0 ]
    [[ "$output" == *"PASS"* ]]
    [[ "$output" == *"Score: 10/10"* ]]
    [[ "$output" == *"Tech Spec Gate PASSED"* ]]
}

@test "validate_prd reaches the final score line even on a partial PRD" {
    # A PRD missing some sections must still REACH the verdict (FAIL), not die mid-way.
    prd="$BATS_TEST_TMPDIR/partial.md"
    cat > "$prd" <<'EOF'
# PRD
## Problem
There is a problem here.
EOF

    run bash "$VALIDATOR" prd "$prd"

    # Verdict reached (script did not abort) -> output carries the Score line.
    [[ "$output" == *"Score:"* ]]
    [[ "$output" == *"FAIL"* ]]
}
