#!/bin/bash
# =============================================================================
# Recette - Test Plan Generator Module
# Generates comprehensive test plans from acceptance criteria
# =============================================================================

# Plan output directory
RECETTE_PLANS_DIR="${RECETTE_BASE:-.recette}/plans"

# Test categories for comprehensive coverage
declare -a TEST_CATEGORIES=(
    "acceptance_criteria_validation"
    "edge_cases"
    "error_scenarios"
    "ui_ux_verification"
    "performance_checks"
    "security_basics"
)

# =============================================================================
# Plan Generation
# =============================================================================

# Generate a test plan for a scope/target
generate_test_plan() {
    local scope="$1"
    local target_id="$2"
    local output_file="${3:-}"

    mkdir -p "$RECETTE_PLANS_DIR"

    # Generate plan ID
    local plan_id
    plan_id="TP-$(date +%Y%m%d)-$(echo "$target_id" | tr '[:lower:]' '[:upper:]' | sed 's/[^A-Z0-9]//g')"

    # Default output file
    if [[ -z "$output_file" ]]; then
        output_file="$RECETTE_PLANS_DIR/${scope}-${target_id}-plan.yaml"
    fi

    # Load target data based on scope
    local target_data=""
    case "$scope" in
        story)
            target_data=$(load_story_data "$target_id")
            ;;
        epic)
            target_data=$(load_epic_data "$target_id")
            ;;
        sprint)
            target_data=$(load_sprint_data "$target_id")
            ;;
        task)
            target_data=$(load_task_data "$target_id")
            ;;
    esac

    # Extract acceptance criteria
    local acceptance_criteria=""
    if command -v yq &>/dev/null && [[ -n "$target_data" ]]; then
        acceptance_criteria=$(echo "$target_data" | yq e '.acceptance_criteria // []' -)
    fi

    # Generate plan structure
    cat > "$output_file" << EOF
# Recette Test Plan
# Generated: $(date -Iseconds)
# Scope: $scope
# Target: $target_id

metadata:
  plan_id: "$plan_id"
  scope: "$scope"
  target_id: "$target_id"
  generated_at: "$(date -Iseconds)"
  version: "1.0"

target:
  type: "$scope"
  id: "$target_id"
  title: ""
  description: ""

test_categories:
  acceptance_criteria_validation:
    description: "Tests validating each acceptance criterion"
    priority: "critical"
    tests: []

  edge_cases:
    description: "Boundary conditions and edge cases"
    priority: "high"
    tests: []

  error_scenarios:
    description: "Error handling and recovery"
    priority: "high"
    tests: []

  ui_ux_verification:
    description: "UI/UX consistency and usability"
    priority: "medium"
    tests: []

  performance_checks:
    description: "Page load and response times"
    priority: "medium"
    tests: []

  security_basics:
    description: "Basic security validations"
    priority: "high"
    tests: []

tests: []

execution:
  base_url: ""
  browser: "chrome"
  viewport:
    width: 1920
    height: 1080
  timeout_seconds: 30
  screenshot_on_failure: true
  record_gif: false
EOF

    # Generate tests from acceptance criteria if available
    if [[ -n "$acceptance_criteria" && "$acceptance_criteria" != "[]" ]]; then
        generate_ac_tests "$output_file" "$acceptance_criteria"
    fi

    echo "$output_file"
}

# =============================================================================
# Data Loading from BMAD
# =============================================================================

load_story_data() {
    local story_id="$1"
    local sprint_status_file=".bmad/sprint-status.yaml"

    if [[ ! -f "$sprint_status_file" ]]; then
        echo "{}"
        return
    fi

    if command -v yq &>/dev/null; then
        yq e ".stories[\"$story_id\"] // {}" "$sprint_status_file"
    else
        echo "{}"
    fi
}

load_epic_data() {
    local epic_id="$1"
    local epics_dir=".bmad/epics"

    if [[ -f "$epics_dir/$epic_id.yaml" ]]; then
        cat "$epics_dir/$epic_id.yaml"
    else
        echo "{}"
    fi
}

load_sprint_data() {
    local sprint_name="$1"
    local sprint_status_file=".bmad/sprint-status.yaml"

    if [[ -f "$sprint_status_file" ]] && command -v yq &>/dev/null; then
        yq e '.' "$sprint_status_file"
    else
        echo "{}"
    fi
}

load_task_data() {
    local task_id="$1"
    # Tasks are typically sub-items of stories
    local sprint_status_file=".bmad/sprint-status.yaml"

    if [[ -f "$sprint_status_file" ]] && command -v yq &>/dev/null; then
        yq e ".stories[].tasks[] | select(.id == \"$task_id\")" "$sprint_status_file"
    else
        echo "{}"
    fi
}

# =============================================================================
# Test Generation from Acceptance Criteria
# =============================================================================

generate_ac_tests() {
    local plan_file="$1"
    local acceptance_criteria="$2"

    if ! command -v yq &>/dev/null; then
        return 1
    fi

    local ac_count
    ac_count=$(echo "$acceptance_criteria" | yq e 'length' -)

    local tests=()
    local test_num=1

    for ((i=0; i<ac_count; i++)); do
        local ac
        ac=$(echo "$acceptance_criteria" | yq e ".[$i]" -)

        local ac_id ac_title ac_given ac_when ac_then
        ac_id=$(echo "$ac" | yq e '.id // "AC-'"$((i+1))"'"' -)
        ac_title=$(echo "$ac" | yq e '.title // .description // ""' -)
        ac_given=$(echo "$ac" | yq e '.given // ""' -)
        ac_when=$(echo "$ac" | yq e '.when // ""' -)
        ac_then=$(echo "$ac" | yq e '.then // ""' -)

        local test_id="TC-$(printf '%03d' $test_num)"

        # Create test entry
        local test_entry="
  - id: \"$test_id\"
    name: \"Validate $ac_id: $ac_title\"
    category: \"acceptance_criteria_validation\"
    ac_reference: \"$ac_id\"
    priority: \"critical\"
    preconditions:
      - \"$ac_given\"
    steps: []
    assertions: []
    tags:
      - \"@regression\"
      - \"@ac-validation\"
"
        tests+=("$test_entry")
        test_num=$((test_num + 1))
    done

    # Append tests to plan file
    if [[ ${#tests[@]} -gt 0 ]]; then
        for test in "${tests[@]}"; do
            echo "$test" >> "$plan_file"
        done

        # Update test count in category
        yq e -i ".test_categories.acceptance_criteria_validation.tests = [\"$(seq -s '","' 1 $((test_num-1)) | sed 's/^/"TC-/;s/,/","/g;s/$/"/' | head -c -1)\"]" "$plan_file" 2>/dev/null || true
    fi
}

# =============================================================================
# Test Step Templates
# =============================================================================

# Generate navigation step
generate_step_navigate() {
    local url="$1"
    cat << EOF
    - action: "navigate"
      target: "$url"
      timeout: 30
EOF
}

# Generate click step
generate_step_click() {
    local selector="$1"
    local description="${2:-Click element}"
    cat << EOF
    - action: "click"
      selector: "$selector"
      description: "$description"
      wait_for_navigation: false
EOF
}

# Generate type step
generate_step_type() {
    local selector="$1"
    local value="$2"
    cat << EOF
    - action: "type"
      selector: "$selector"
      value: "$value"
      clear_first: true
EOF
}

# Generate fill form step
generate_step_fill_form() {
    local form_selector="$1"
    shift
    local fields=("$@")

    echo "    - action: \"fill_form\""
    echo "      form_selector: \"$form_selector\""
    echo "      fields:"

    for field in "${fields[@]}"; do
        local name="${field%%=*}"
        local value="${field#*=}"
        echo "        - name: \"$name\""
        echo "          value: \"$value\""
    done
}

# Generate assertion step
generate_assertion_url_matches() {
    local pattern="$1"
    cat << EOF
    - type: "url_matches"
      pattern: "$pattern"
EOF
}

generate_assertion_element_visible() {
    local selector="$1"
    cat << EOF
    - type: "element_visible"
      selector: "$selector"
EOF
}

generate_assertion_element_text() {
    local selector="$1"
    local expected="$2"
    cat << EOF
    - type: "element_text"
      selector: "$selector"
      expected: "$expected"
EOF
}

generate_assertion_no_console_errors() {
    cat << EOF
    - type: "no_console_errors"
      severity: "error"
EOF
}

# =============================================================================
# Plan Loading
# =============================================================================

load_test_plan() {
    local plan_file="$1"

    if [[ ! -f "$plan_file" ]]; then
        echo "{}"
        return 1
    fi

    if command -v yq &>/dev/null; then
        yq e '.' "$plan_file" -o json
    else
        cat "$plan_file"
    fi
}

# Get test count from plan
get_plan_test_count() {
    local plan_file="$1"

    if command -v yq &>/dev/null && [[ -f "$plan_file" ]]; then
        yq e '.tests | length' "$plan_file"
    else
        echo "0"
    fi
}

# Get tests for a category
get_tests_by_category() {
    local plan_file="$1"
    local category="$2"

    if command -v yq &>/dev/null && [[ -f "$plan_file" ]]; then
        yq e ".tests[] | select(.category == \"$category\")" "$plan_file" -o json
    else
        echo "[]"
    fi
}

# =============================================================================
# Plan Validation
# =============================================================================

validate_test_plan() {
    local plan_file="$1"
    local errors=()

    if [[ ! -f "$plan_file" ]]; then
        echo "Plan file not found: $plan_file"
        return 1
    fi

    if ! command -v yq &>/dev/null; then
        echo "yq required for plan validation"
        return 1
    fi

    # Check required fields
    local plan_id
    plan_id=$(yq e '.metadata.plan_id // ""' "$plan_file")
    if [[ -z "$plan_id" ]]; then
        errors+=("Missing plan_id in metadata")
    fi

    local scope
    scope=$(yq e '.metadata.scope // ""' "$plan_file")
    if [[ -z "$scope" ]]; then
        errors+=("Missing scope in metadata")
    fi

    # Check execution config
    local base_url
    base_url=$(yq e '.execution.base_url // ""' "$plan_file")
    if [[ -z "$base_url" ]]; then
        errors+=("Missing base_url in execution config")
    fi

    # Output errors
    if [[ ${#errors[@]} -gt 0 ]]; then
        echo "Plan validation errors:"
        for error in "${errors[@]}"; do
            echo "  - $error"
        done
        return 1
    fi

    echo "Plan validation passed"
    return 0
}

# =============================================================================
# Edge Case Generation
# =============================================================================

generate_edge_case_tests() {
    local plan_file="$1"
    local field_type="$2"
    local selector="$3"

    local tests=()

    case "$field_type" in
        text)
            tests+=("empty_value")
            tests+=("max_length")
            tests+=("special_characters")
            tests+=("unicode")
            tests+=("xss_injection")
            ;;
        number)
            tests+=("zero")
            tests+=("negative")
            tests+=("max_value")
            tests+=("decimal")
            tests+=("non_numeric")
            ;;
        email)
            tests+=("invalid_format")
            tests+=("empty")
            tests+=("max_length")
            tests+=("special_domains")
            ;;
        date)
            tests+=("past_date")
            tests+=("future_date")
            tests+=("invalid_format")
            tests+=("leap_year")
            ;;
    esac

    # Return as JSON array
    printf '[%s]' "$(IFS=,; echo "\"${tests[*]}\"")"
}

# =============================================================================
# Security Test Generation
# =============================================================================

generate_security_tests() {
    local plan_file="$1"
    local test_type="$2"

    case "$test_type" in
        xss)
            cat << 'EOF'
  - id: "SEC-XSS-001"
    name: "XSS Prevention - Script tags"
    category: "security_basics"
    steps:
      - action: "type"
        selector: "input[type='text']"
        value: "<script>alert('xss')</script>"
      - action: "click"
        selector: "button[type='submit']"
    assertions:
      - type: "no_console_errors"
      - type: "element_not_contains"
        selector: "body"
        value: "<script>"
EOF
            ;;
        sql_injection)
            cat << 'EOF'
  - id: "SEC-SQL-001"
    name: "SQL Injection Prevention"
    category: "security_basics"
    steps:
      - action: "type"
        selector: "input[type='text']"
        value: "'; DROP TABLE users; --"
      - action: "click"
        selector: "button[type='submit']"
    assertions:
      - type: "response_code"
        expected: [200, 400, 422]
      - type: "element_not_contains"
        selector: "body"
        value: "SQL syntax"
EOF
            ;;
        csrf)
            cat << 'EOF'
  - id: "SEC-CSRF-001"
    name: "CSRF Token Validation"
    category: "security_basics"
    steps:
      - action: "check_element_exists"
        selector: "input[name='_token'], meta[name='csrf-token']"
    assertions:
      - type: "element_visible"
        selector: "input[name='_token'], meta[name='csrf-token']"
EOF
            ;;
    esac
}

# =============================================================================
# Export
# =============================================================================

export RECETTE_PLANS_DIR
