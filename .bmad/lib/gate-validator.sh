#!/bin/bash
# BMAD v6 - Quality Gate Validator
# Validates stories/artifacts against quality gates

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BMAD_DIR="$(dirname "$SCRIPT_DIR")"
SPRINT_STATUS_FILE="${BMAD_DIR}/sprint-status.yaml"
GATES_DIR="${BMAD_DIR}/gates"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Gate thresholds
declare -A GATE_THRESHOLDS
GATE_THRESHOLDS["prd"]=80
GATE_THRESHOLDS["techspec"]=90
GATE_THRESHOLDS["backlog"]=100
GATE_THRESHOLDS["sprint_ready"]=100
GATE_THRESHOLDS["story_complete"]=100

# ============================================
# Helper Functions
# ============================================

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[PASS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[FAIL]${NC} $1"; }

# Calculate percentage
calc_percentage() {
    local passed=$1
    local total=$2
    if [[ $total -eq 0 ]]; then
        echo "0"
    else
        echo $((passed * 100 / total))
    fi
}

# ============================================
# PRD Gate (≥80%)
# ============================================

validate_prd() {
    local prd_file="${1:-docs/prd.md}"
    local score=0
    local total=8
    local checks=()

    echo ""
    echo "════════════════════════════════════════"
    echo "PRD Gate Validation (Threshold: ≥80%)"
    echo "════════════════════════════════════════"
    echo ""

    if [[ ! -f "$prd_file" ]]; then
        log_error "PRD file not found: $prd_file"
        echo "FAIL"
        return 1
    fi

    local content=$(cat "$prd_file")

    # Check 1: Problem statement
    if echo "$content" | grep -qi "problem\|challenge\|issue"; then
        log_success "Problem statement defined"
        score=$((score + 1))
    else
        log_error "Missing problem statement"
    fi

    # Check 2: Target users
    if echo "$content" | grep -qi "user\|persona\|customer\|target"; then
        log_success "Target users defined"
        score=$((score + 1))
    else
        log_error "Missing target users"
    fi

    # Check 3: Goals/Objectives
    if echo "$content" | grep -qi "goal\|objective\|aim"; then
        log_success "Goals/objectives defined"
        score=$((score + 1))
    else
        log_error "Missing goals/objectives"
    fi

    # Check 4: Success metrics
    if echo "$content" | grep -qi "metric\|kpi\|measure\|success"; then
        log_success "Success metrics defined"
        score=$((score + 1))
    else
        log_error "Missing success metrics"
    fi

    # Check 5: Scope defined
    if echo "$content" | grep -qi "scope\|boundary\|limitation"; then
        log_success "Scope defined"
        score=$((score + 1))
    else
        log_error "Missing scope definition"
    fi

    # Check 6: User stories overview
    if echo "$content" | grep -qiE "(user stor|US-|epic)"; then
        log_success "User stories overview present"
        score=$((score + 1))
    else
        log_error "Missing user stories overview"
    fi

    # Check 7: Assumptions documented
    if echo "$content" | grep -qi "assumption\|assume"; then
        log_success "Assumptions documented"
        score=$((score + 1))
    else
        log_warning "Missing assumptions"
    fi

    # Check 8: Risks identified
    if echo "$content" | grep -qi "risk\|mitigation"; then
        log_success "Risks identified"
        score=$((score + 1))
    else
        log_warning "Missing risk assessment"
    fi

    local percentage=$(calc_percentage $score $total)
    local threshold=${GATE_THRESHOLDS["prd"]}

    echo ""
    echo "────────────────────────────────────────"
    echo "Score: $score/$total ($percentage%)"
    echo "Threshold: $threshold%"
    echo ""

    if [[ $percentage -ge $threshold ]]; then
        log_success "PRD Gate PASSED"
        echo "PASS"
        return 0
    else
        log_error "PRD Gate FAILED (need ${threshold}%, got ${percentage}%)"
        echo "FAIL"
        return 1
    fi
}

# ============================================
# Tech Spec Gate (≥90%)
# ============================================

validate_techspec() {
    local techspec_file="${1:-docs/tech-spec.md}"
    local score=0
    local total=10

    echo ""
    echo "════════════════════════════════════════"
    echo "Tech Spec Gate Validation (Threshold: ≥90%)"
    echo "════════════════════════════════════════"
    echo ""

    if [[ ! -f "$techspec_file" ]]; then
        log_error "Tech Spec file not found: $techspec_file"
        echo "FAIL"
        return 1
    fi

    local content=$(cat "$techspec_file")

    # Check 1: Architecture overview
    if echo "$content" | grep -qi "architecture\|design\|structure"; then
        log_success "Architecture overview present"
        score=$((score + 1))
    else
        log_error "Missing architecture overview"
    fi

    # Check 2: Component diagram (mermaid or image)
    if echo "$content" | grep -qiE "(mermaid|diagram|\.png|\.svg|graph)"; then
        log_success "Architecture diagram present"
        score=$((score + 1))
    else
        log_error "Missing architecture diagram"
    fi

    # Check 3: Data model
    if echo "$content" | grep -qi "data\|model\|entity\|schema\|table"; then
        log_success "Data model defined"
        score=$((score + 1))
    else
        log_error "Missing data model"
    fi

    # Check 4: API contracts
    if echo "$content" | grep -qiE "(api|endpoint|rest|graphql|grpc)"; then
        log_success "API contracts defined"
        score=$((score + 1))
    else
        log_error "Missing API contracts"
    fi

    # Check 5: Security considerations
    if echo "$content" | grep -qi "security\|auth\|encrypt\|permission"; then
        log_success "Security considerations addressed"
        score=$((score + 1))
    else
        log_error "Missing security considerations"
    fi

    # Check 6: Performance requirements
    if echo "$content" | grep -qi "performance\|latency\|throughput\|scale"; then
        log_success "Performance requirements defined"
        score=$((score + 1))
    else
        log_warning "Missing performance requirements"
    fi

    # Check 7: Error handling
    if echo "$content" | grep -qi "error\|exception\|handling\|failure"; then
        log_success "Error handling strategy defined"
        score=$((score + 1))
    else
        log_warning "Missing error handling strategy"
    fi

    # Check 8: Testing strategy
    if echo "$content" | grep -qi "test\|quality\|coverage"; then
        log_success "Testing strategy defined"
        score=$((score + 1))
    else
        log_error "Missing testing strategy"
    fi

    # Check 9: Deployment strategy
    if echo "$content" | grep -qi "deploy\|ci\|cd\|release"; then
        log_success "Deployment strategy defined"
        score=$((score + 1))
    else
        log_warning "Missing deployment strategy"
    fi

    # Check 10: Dependencies explicit
    if echo "$content" | grep -qi "dependency\|depend\|require\|integration"; then
        log_success "Dependencies documented"
        score=$((score + 1))
    else
        log_warning "Missing dependency documentation"
    fi

    local percentage=$(calc_percentage $score $total)
    local threshold=${GATE_THRESHOLDS["techspec"]}

    echo ""
    echo "────────────────────────────────────────"
    echo "Score: $score/$total ($percentage%)"
    echo "Threshold: $threshold%"
    echo ""

    if [[ $percentage -ge $threshold ]]; then
        log_success "Tech Spec Gate PASSED"
        echo "PASS"
        return 0
    else
        log_error "Tech Spec Gate FAILED (need ${threshold}%, got ${percentage}%)"
        echo "FAIL"
        return 1
    fi
}

# ============================================
# Backlog Gate (INVEST)
# ============================================

validate_backlog_story() {
    local story_id="$1"
    local score=0
    local total=6

    if ! command -v yq &> /dev/null; then
        log_error "yq required for backlog validation"
        return 1
    fi

    local story=$(yq ".stories.${story_id}" "$SPRINT_STATUS_FILE" 2>/dev/null)

    if [[ "$story" == "null" || -z "$story" ]]; then
        log_error "Story $story_id not found"
        return 1
    fi

    echo "Validating INVEST for $story_id:"

    # Independent: No blocking dependencies
    local blocked_by=$(yq ".stories.${story_id}.blocked_by // []" "$SPRINT_STATUS_FILE" 2>/dev/null)
    if [[ "$blocked_by" == "[]" || -z "$blocked_by" ]]; then
        log_success "  [I] Independent: No blocking dependencies"
        score=$((score + 1))
    else
        log_warning "  [I] Independent: Has dependencies"
    fi

    # Negotiable: Has description
    local title=$(yq ".stories.${story_id}.title // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)
    if [[ -n "$title" && ${#title} -gt 10 ]]; then
        log_success "  [N] Negotiable: Has description"
        score=$((score + 1))
    else
        log_error "  [N] Negotiable: Missing/short description"
    fi

    # Valuable: Has acceptance criteria
    local ac_total=$(yq ".stories.${story_id}.acceptance_criteria.total // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)
    if [[ "$ac_total" -gt 0 ]]; then
        log_success "  [V] Valuable: Has $ac_total acceptance criteria"
        score=$((score + 1))
    else
        log_error "  [V] Valuable: No acceptance criteria"
    fi

    # Estimable: Has story points
    local points=$(yq ".stories.${story_id}.story_points // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)
    if [[ "$points" -gt 0 ]]; then
        log_success "  [E] Estimable: $points story points"
        score=$((score + 1))
    else
        log_error "  [E] Estimable: No story points"
    fi

    # Small: <= 8 points
    if [[ "$points" -le 8 ]]; then
        log_success "  [S] Small: $points points (≤8)"
        score=$((score + 1))
    else
        log_warning "  [S] Small: $points points (>8, consider splitting)"
    fi

    # Testable: Has acceptance criteria
    if [[ "$ac_total" -gt 0 ]]; then
        log_success "  [T] Testable: Has testable criteria"
        score=$((score + 1))
    else
        log_error "  [T] Testable: No testable criteria"
    fi

    echo "  INVEST Score: $score/$total"
    return $((total - score))
}

validate_backlog() {
    echo ""
    echo "════════════════════════════════════════"
    echo "Backlog Gate Validation (INVEST)"
    echo "════════════════════════════════════════"
    echo ""

    if ! command -v yq &> /dev/null; then
        log_error "yq required for backlog validation"
        echo "FAIL"
        return 1
    fi

    local stories=$(yq '.stories | keys | .[]' "$SPRINT_STATUS_FILE" 2>/dev/null)
    local total_stories=0
    local passing_stories=0

    for story_id in $stories; do
        total_stories=$((total_stories + 1))
        echo ""
        if validate_backlog_story "$story_id"; then
            passing_stories=$((passing_stories + 1))
        fi
    done

    echo ""
    echo "────────────────────────────────────────"
    echo "Stories passing INVEST: $passing_stories/$total_stories"
    echo ""

    if [[ $passing_stories -eq $total_stories && $total_stories -gt 0 ]]; then
        log_success "Backlog Gate PASSED"
        echo "PASS"
        return 0
    else
        log_error "Backlog Gate FAILED"
        echo "FAIL"
        return 1
    fi
}

# ============================================
# Story Complete Gate (DoD)
# ============================================

validate_story_complete() {
    local story_id="$1"
    local score=0
    local total=5

    echo ""
    echo "════════════════════════════════════════"
    echo "Story Complete Gate (DoD) - $story_id"
    echo "════════════════════════════════════════"
    echo ""

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        echo "FAIL"
        return 1
    fi

    # Check 1: All tasks completed
    local tasks_total=$(yq ".stories.${story_id}.tasks.total // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)
    local tasks_completed=$(yq ".stories.${story_id}.tasks.completed // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)

    if [[ "$tasks_total" -gt 0 && "$tasks_completed" -eq "$tasks_total" ]]; then
        log_success "All tasks completed ($tasks_completed/$tasks_total)"
        score=$((score + 1))
    else
        log_error "Tasks incomplete ($tasks_completed/$tasks_total)"
    fi

    # Check 2: All AC validated
    local ac_total=$(yq ".stories.${story_id}.acceptance_criteria.total // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)
    local ac_validated=$(yq ".stories.${story_id}.acceptance_criteria.validated // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)

    if [[ "$ac_total" -gt 0 && "$ac_validated" -eq "$ac_total" ]]; then
        log_success "All acceptance criteria validated ($ac_validated/$ac_total)"
        score=$((score + 1))
    else
        log_error "Acceptance criteria not validated ($ac_validated/$ac_total)"
    fi

    # Check 3: TDD cycle complete
    local tdd_phase=$(yq ".stories.${story_id}.tdd_phase // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)

    if [[ "$tdd_phase" == "refactor" || "$tdd_phase" == "done" ]]; then
        log_success "TDD cycle complete ($tdd_phase)"
        score=$((score + 1))
    else
        log_warning "TDD cycle not complete ($tdd_phase)"
    fi

    # Check 4: Code reviewed (status in review or done)
    local status=$(yq ".stories.${story_id}.status // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)

    if [[ "$status" == "review" || "$status" == "done" ]]; then
        log_success "Code review completed"
        score=$((score + 1))
    else
        log_error "Code review pending"
    fi

    # Check 5: Not blocked
    local blocked_reason=$(yq ".stories.${story_id}.blocked_reason // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)

    if [[ -z "$blocked_reason" ]]; then
        log_success "No blockers"
        score=$((score + 1))
    else
        log_error "Story blocked: $blocked_reason"
    fi

    local percentage=$(calc_percentage $score $total)

    echo ""
    echo "────────────────────────────────────────"
    echo "DoD Score: $score/$total ($percentage%)"
    echo ""

    if [[ $score -eq $total ]]; then
        log_success "Story Complete Gate PASSED"
        echo "PASS"
        return 0
    else
        log_error "Story Complete Gate FAILED"
        echo "FAIL"
        return 1
    fi
}

# ============================================
# Sprint Ready Gate
# ============================================

validate_sprint_ready() {
    echo ""
    echo "════════════════════════════════════════"
    echo "Sprint Ready Gate Validation"
    echo "════════════════════════════════════════"
    echo ""

    if ! command -v yq &> /dev/null; then
        log_error "yq required"
        echo "FAIL"
        return 1
    fi

    local ready_stories=$(yq '[.stories[] | select(.status == "ready-for-dev")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")
    local has_sprint_id=$(yq '.metadata.sprint_id // ""' "$SPRINT_STATUS_FILE" 2>/dev/null)
    local has_dates=$(yq '.metadata.start_date // ""' "$SPRINT_STATUS_FILE" 2>/dev/null)

    local score=0
    local total=3

    # Check 1: Sprint metadata
    if [[ -n "$has_sprint_id" && "$has_sprint_id" != "null" ]]; then
        log_success "Sprint ID defined: $has_sprint_id"
        score=$((score + 1))
    else
        log_error "Sprint ID not defined"
    fi

    # Check 2: Sprint dates
    if [[ -n "$has_dates" && "$has_dates" != "null" ]]; then
        log_success "Sprint dates defined"
        score=$((score + 1))
    else
        log_error "Sprint dates not defined"
    fi

    # Check 3: Stories ready
    if [[ "$ready_stories" -gt 0 ]]; then
        log_success "$ready_stories stories ready for development"
        score=$((score + 1))
    else
        log_error "No stories in 'ready-for-dev' status"
    fi

    echo ""
    echo "────────────────────────────────────────"
    echo "Score: $score/$total"
    echo ""

    if [[ $score -eq $total ]]; then
        log_success "Sprint Ready Gate PASSED"
        echo "PASS"
        return 0
    else
        log_error "Sprint Ready Gate FAILED"
        echo "FAIL"
        return 1
    fi
}

# ============================================
# Gate Report
# ============================================

generate_report() {
    echo ""
    echo "════════════════════════════════════════════════════"
    echo "           BMAD Quality Gates Report"
    echo "════════════════════════════════════════════════════"
    echo ""

    echo "| Gate | Threshold | Status |"
    echo "|------|-----------|--------|"

    for gate in "prd" "techspec" "backlog" "sprint_ready"; do
        local threshold="${GATE_THRESHOLDS[$gate]}"
        echo "| $gate | ${threshold}% | ⏳ Run /gate:validate-${gate} |"
    done

    echo ""
    echo "Run individual validations:"
    echo "  /gate:validate-prd [file]"
    echo "  /gate:validate-techspec [file]"
    echo "  /gate:validate-backlog"
    echo "  /gate:validate-sprint"
    echo "  /gate:validate-story <story-id>"
    echo ""
}

# ============================================
# Main
# ============================================

usage() {
    echo "BMAD v6 Gate Validator"
    echo ""
    echo "Usage: gate-validator.sh <gate-type> [args]"
    echo ""
    echo "Gate types:"
    echo "  prd [file]              Validate PRD (≥80%)"
    echo "  techspec [file]         Validate Tech Spec (≥90%)"
    echo "  backlog                 Validate backlog INVEST"
    echo "  sprint-ready            Validate sprint readiness"
    echo "  story-complete <id>     Validate story DoD"
    echo "  report                  Show all gates status"
}

main() {
    local gate_type="${1:-}"
    shift || true

    case "$gate_type" in
        prd)
            validate_prd "$@"
            ;;
        techspec)
            validate_techspec "$@"
            ;;
        backlog)
            validate_backlog
            ;;
        sprint-ready|sprint_ready)
            validate_sprint_ready
            ;;
        story-complete|story_complete|story)
            if [[ -z "${1:-}" ]]; then
                log_error "Usage: gate-validator.sh story-complete <story-id>"
                exit 1
            fi
            validate_story_complete "$1"
            ;;
        report)
            generate_report
            ;;
        -h|--help|help|"")
            usage
            ;;
        *)
            log_error "Unknown gate type: $gate_type"
            usage
            exit 1
            ;;
    esac
}

main "$@"
