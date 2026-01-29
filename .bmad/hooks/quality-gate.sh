#!/bin/bash
# BMAD v6 - Quality Gate Hook (Stop)
# Validates quality gates before completing a session
#
# Exit codes:
#   0 - Pass (allow completion)
#   1 - Warning (allow with warning)
#   2 - Block (prevent completion - Claude Code specific)
#
# Usage in .claude/settings.json:
# {
#   "hooks": {
#     "Stop": [{
#       "command": ".bmad/hooks/quality-gate.sh",
#       "timeout": 10000
#     }]
#   }
# }

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BMAD_DIR="$(dirname "$SCRIPT_DIR")"
LIB_DIR="${BMAD_DIR}/lib"
SPRINT_STATUS_FILE="${BMAD_DIR}/sprint-status.yaml"

# Configuration
ENFORCE_GATES="${BMAD_ENFORCE_GATES:-true}"
CURRENT_GATE="${BMAD_CURRENT_GATE:-story_complete}"

# Colors (for terminal output)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if enforcement is enabled
if [[ "$ENFORCE_GATES" != "true" ]]; then
    echo "ℹ️ Quality gates disabled (BMAD_ENFORCE_GATES=false)"
    exit 0
fi

# Check if sprint-status.yaml exists
if [[ ! -f "$SPRINT_STATUS_FILE" ]]; then
    echo "ℹ️ No BMAD sprint tracking - skipping gates"
    exit 0
fi

# Check for yq
if ! command -v yq &> /dev/null; then
    echo "⚠️ yq not installed - cannot validate gates"
    exit 1
fi

echo "────────────────────────────────────────"
echo "🔒 BMAD Quality Gate Check"
echo "────────────────────────────────────────"
echo ""

# Get current in-progress story
story_id=$(yq '.stories | to_entries[] | select(.value.status == "in-progress") | .key' "$SPRINT_STATUS_FILE" 2>/dev/null | head -1)

if [[ -z "$story_id" || "$story_id" == "null" ]]; then
    echo "ℹ️ No story in progress - gate check skipped"
    exit 0
fi

echo "Checking: $story_id"
echo ""

# Run gate validation
warnings=0
errors=0

# Check 1: Tasks completion
tasks_total=$(yq ".stories.${story_id}.tasks.total // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)
tasks_completed=$(yq ".stories.${story_id}.tasks.completed // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)

if [[ "$tasks_total" -gt 0 ]]; then
    if [[ "$tasks_completed" -lt "$tasks_total" ]]; then
        echo -e "${YELLOW}⚠️ Tasks incomplete: $tasks_completed/$tasks_total${NC}"
        ((warnings++))
    else
        echo -e "${GREEN}✅ Tasks complete: $tasks_completed/$tasks_total${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ No tasks defined${NC}"
    ((warnings++))
fi

# Check 2: TDD phase
tdd_phase=$(yq ".stories.${story_id}.tdd_phase // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)

case "$tdd_phase" in
    "refactor"|"done")
        echo -e "${GREEN}✅ TDD cycle complete: $tdd_phase${NC}"
        ;;
    "green")
        echo -e "${YELLOW}⚠️ TDD in green phase - consider refactoring${NC}"
        ((warnings++))
        ;;
    "red")
        echo -e "${RED}❌ TDD in red phase - tests should pass first${NC}"
        ((errors++))
        ;;
    *)
        echo -e "${YELLOW}⚠️ TDD phase not set${NC}"
        ((warnings++))
        ;;
esac

# Check 3: Acceptance criteria
ac_total=$(yq ".stories.${story_id}.acceptance_criteria.total // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)
ac_validated=$(yq ".stories.${story_id}.acceptance_criteria.validated // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)

if [[ "$ac_total" -gt 0 ]]; then
    if [[ "$ac_validated" -lt "$ac_total" ]]; then
        echo -e "${YELLOW}⚠️ AC not validated: $ac_validated/$ac_total${NC}"
        ((warnings++))
    else
        echo -e "${GREEN}✅ All AC validated: $ac_validated/$ac_total${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ No acceptance criteria defined${NC}"
    ((warnings++))
fi

# Check 4: Blocked status
blocked_reason=$(yq ".stories.${story_id}.blocked_reason // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)

if [[ -n "$blocked_reason" && "$blocked_reason" != "null" ]]; then
    echo -e "${RED}❌ Story is blocked: $blocked_reason${NC}"
    ((errors++))
else
    echo -e "${GREEN}✅ No blockers${NC}"
fi

echo ""
echo "────────────────────────────────────────"

# Determine exit code
if [[ $errors -gt 0 ]]; then
    echo -e "${RED}Gate FAILED: $errors errors, $warnings warnings${NC}"
    echo ""
    echo "Fix errors before completing. Use /sprint:status for details."

    # Exit 2 blocks Claude Code completion
    exit 2
elif [[ $warnings -gt 0 ]]; then
    echo -e "${YELLOW}Gate PASSED with $warnings warnings${NC}"
    echo ""
    echo "Consider addressing warnings before completion."

    # Exit 0 allows completion but shows warning
    exit 0
else
    echo -e "${GREEN}Gate PASSED - All checks passed${NC}"
    exit 0
fi
