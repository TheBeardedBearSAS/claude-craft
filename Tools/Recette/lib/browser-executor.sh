#!/bin/bash
# =============================================================================
# Recette - Browser Executor Module
# Executes test steps via Claude in Chrome MCP
# =============================================================================

# Executor state
EXECUTOR_CURRENT_URL=""
EXECUTOR_LAST_ACTION=""
EXECUTOR_LAST_RESULT=""

# Timeouts (in seconds)
EXECUTOR_DEFAULT_TIMEOUT=30
EXECUTOR_NAVIGATION_TIMEOUT=60
EXECUTOR_ACTION_TIMEOUT=10

# =============================================================================
# Core Execution Functions
# =============================================================================

# Execute a single test step
execute_step() {
    local step_json="$1"
    local context="${2:-}"

    if ! command -v yq &>/dev/null; then
        echo '{"success": false, "error": "yq not available"}'
        return 1
    fi

    local action
    action=$(echo "$step_json" | yq e '.action' -)

    EXECUTOR_LAST_ACTION="$action"

    case "$action" in
        navigate)
            execute_navigate "$step_json"
            ;;
        click)
            execute_click "$step_json"
            ;;
        type)
            execute_type "$step_json"
            ;;
        fill_form)
            execute_fill_form "$step_json"
            ;;
        scroll)
            execute_scroll "$step_json"
            ;;
        wait)
            execute_wait "$step_json"
            ;;
        screenshot)
            execute_screenshot "$step_json"
            ;;
        hover)
            execute_hover "$step_json"
            ;;
        select)
            execute_select "$step_json"
            ;;
        check)
            execute_check "$step_json"
            ;;
        upload)
            execute_upload "$step_json"
            ;;
        read_text)
            execute_read_text "$step_json"
            ;;
        read_console)
            execute_read_console "$step_json"
            ;;
        *)
            echo "{\"success\": false, \"error\": \"Unknown action: $action\"}"
            return 1
            ;;
    esac
}

# =============================================================================
# Navigation Actions
# =============================================================================

execute_navigate() {
    local step="$1"
    local target
    local timeout

    target=$(echo "$step" | yq e '.target' -)
    timeout=$(echo "$step" | yq e '.timeout // 30' -)

    log_recette "INFO" "Navigating to: $target"

    # Call Claude in Chrome MCP
    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome navigate_to_url \
            --url "$target" \
            --timeout "$timeout" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_CURRENT_URL="$target"
    EXECUTOR_LAST_RESULT="$result"

    if echo "$result" | grep -qi "error\|failed"; then
        echo "{\"success\": false, \"error\": \"Navigation failed\", \"details\": $(echo "$result" | jq -Rs .)}"
        return 1
    fi

    echo '{"success": true, "action": "navigate", "url": "'"$target"'"}'
    return 0
}

# =============================================================================
# Click Actions
# =============================================================================

execute_click() {
    local step="$1"
    local selector wait_nav

    selector=$(echo "$step" | yq e '.selector' -)
    wait_nav=$(echo "$step" | yq e '.wait_for_navigation // false' -)

    log_recette "INFO" "Clicking: $selector"

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome click_element \
            --selector "$selector" \
            --wait_for_navigation "$wait_nav" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    if echo "$result" | grep -qi "error\|failed\|not found"; then
        echo "{\"success\": false, \"error\": \"Click failed\", \"selector\": \"$selector\", \"details\": $(echo "$result" | jq -Rs .)}"
        return 1
    fi

    echo '{"success": true, "action": "click", "selector": "'"$selector"'"}'
    return 0
}

# =============================================================================
# Type Actions
# =============================================================================

execute_type() {
    local step="$1"
    local selector value clear_first

    selector=$(echo "$step" | yq e '.selector' -)
    value=$(echo "$step" | yq e '.value' -)
    clear_first=$(echo "$step" | yq e '.clear_first // true' -)

    log_recette "INFO" "Typing in: $selector"

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome type_text \
            --selector "$selector" \
            --text "$value" \
            --clear_first "$clear_first" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    if echo "$result" | grep -qi "error\|failed"; then
        echo "{\"success\": false, \"error\": \"Type failed\", \"selector\": \"$selector\"}"
        return 1
    fi

    echo '{"success": true, "action": "type", "selector": "'"$selector"'"}'
    return 0
}

# =============================================================================
# Form Actions
# =============================================================================

execute_fill_form() {
    local step="$1"
    local form_selector

    form_selector=$(echo "$step" | yq e '.form_selector // "form"' -)

    log_recette "INFO" "Filling form: $form_selector"

    # Get fields
    local fields
    fields=$(echo "$step" | yq e '.fields' - -o json)

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome fill_form \
            --form_selector "$form_selector" \
            --fields "$fields" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    if echo "$result" | grep -qi "error\|failed"; then
        echo "{\"success\": false, \"error\": \"Fill form failed\", \"selector\": \"$form_selector\"}"
        return 1
    fi

    echo '{"success": true, "action": "fill_form", "selector": "'"$form_selector"'"}'
    return 0
}

# =============================================================================
# Scroll Actions
# =============================================================================

execute_scroll() {
    local step="$1"
    local direction amount selector

    direction=$(echo "$step" | yq e '.direction // "down"' -)
    amount=$(echo "$step" | yq e '.amount // 300' -)
    selector=$(echo "$step" | yq e '.selector // ""' -)

    log_recette "INFO" "Scrolling $direction by $amount"

    local result
    if command -v claude &>/dev/null; then
        if [[ -n "$selector" ]]; then
            result=$(claude mcp call claude-in-chrome scroll \
                --selector "$selector" \
                --direction "$direction" \
                --amount "$amount" 2>&1)
        else
            result=$(claude mcp call claude-in-chrome scroll \
                --direction "$direction" \
                --amount "$amount" 2>&1)
        fi
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    echo '{"success": true, "action": "scroll", "direction": "'"$direction"'"}'
    return 0
}

# =============================================================================
# Wait Actions
# =============================================================================

execute_wait() {
    local step="$1"
    local wait_type selector timeout

    wait_type=$(echo "$step" | yq e '.wait_for // "time"' -)
    selector=$(echo "$step" | yq e '.selector // ""' -)
    timeout=$(echo "$step" | yq e '.timeout // 5' -)

    log_recette "INFO" "Waiting: $wait_type"

    case "$wait_type" in
        time)
            sleep "$timeout"
            ;;
        element)
            local start_time elapsed
            start_time=$(date +%s)
            while true; do
                if command -v claude &>/dev/null; then
                    local exists
                    exists=$(claude mcp call claude-in-chrome read_dom_state \
                        --selector "$selector" 2>&1)
                    if [[ -n "$exists" ]] && ! echo "$exists" | grep -qi "not found"; then
                        break
                    fi
                fi
                elapsed=$(($(date +%s) - start_time))
                if [[ $elapsed -ge $timeout ]]; then
                    echo "{\"success\": false, \"error\": \"Wait timeout\", \"selector\": \"$selector\"}"
                    return 1
                fi
                sleep 0.5
            done
            ;;
        navigation)
            sleep 2  # Basic wait for navigation
            ;;
    esac

    echo '{"success": true, "action": "wait", "type": "'"$wait_type"'"}'
    return 0
}

# =============================================================================
# Screenshot Actions
# =============================================================================

execute_screenshot() {
    local step="$1"
    local filename selector

    filename=$(echo "$step" | yq e '.filename // "screenshot.png"' -)
    selector=$(echo "$step" | yq e '.selector // ""' -)

    log_recette "INFO" "Taking screenshot: $filename"

    local result
    if command -v claude &>/dev/null; then
        if [[ -n "$selector" ]]; then
            result=$(claude mcp call claude-in-chrome take_screenshot \
                --selector "$selector" 2>&1)
        else
            result=$(claude mcp call claude-in-chrome take_screenshot 2>&1)
        fi
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    # Save screenshot data if available
    if [[ -n "$RECETTE_SESSION_DIR" ]] && [[ -n "$result" ]]; then
        local screenshot_path="$RECETTE_SESSION_DIR/screenshots/$filename"
        echo "$result" | grep -o '"data":"[^"]*"' | cut -d'"' -f4 | base64 -d > "$screenshot_path" 2>/dev/null || true
    fi

    echo '{"success": true, "action": "screenshot", "filename": "'"$filename"'"}'
    return 0
}

# =============================================================================
# Hover Actions
# =============================================================================

execute_hover() {
    local step="$1"
    local selector

    selector=$(echo "$step" | yq e '.selector' -)

    log_recette "INFO" "Hovering: $selector"

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome hover \
            --selector "$selector" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    echo '{"success": true, "action": "hover", "selector": "'"$selector"'"}'
    return 0
}

# =============================================================================
# Select Actions (Dropdowns)
# =============================================================================

execute_select() {
    local step="$1"
    local selector value

    selector=$(echo "$step" | yq e '.selector' -)
    value=$(echo "$step" | yq e '.value' -)

    log_recette "INFO" "Selecting: $value in $selector"

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome select_option \
            --selector "$selector" \
            --value "$value" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    if echo "$result" | grep -qi "error\|failed"; then
        echo "{\"success\": false, \"error\": \"Select failed\", \"selector\": \"$selector\"}"
        return 1
    fi

    echo '{"success": true, "action": "select", "selector": "'"$selector"'", "value": "'"$value"'"}'
    return 0
}

# =============================================================================
# Checkbox Actions
# =============================================================================

execute_check() {
    local step="$1"
    local selector checked

    selector=$(echo "$step" | yq e '.selector' -)
    checked=$(echo "$step" | yq e '.checked // true' -)

    log_recette "INFO" "Checking: $selector ($checked)"

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome check_checkbox \
            --selector "$selector" \
            --checked "$checked" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    echo '{"success": true, "action": "check", "selector": "'"$selector"'"}'
    return 0
}

# =============================================================================
# File Upload Actions
# =============================================================================

execute_upload() {
    local step="$1"
    local selector file_path

    selector=$(echo "$step" | yq e '.selector' -)
    file_path=$(echo "$step" | yq e '.file_path' -)

    log_recette "INFO" "Uploading to: $selector"

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome upload_file \
            --selector "$selector" \
            --file_path "$file_path" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    if echo "$result" | grep -qi "error\|failed"; then
        echo "{\"success\": false, \"error\": \"Upload failed\", \"selector\": \"$selector\"}"
        return 1
    fi

    echo '{"success": true, "action": "upload", "selector": "'"$selector"'"}'
    return 0
}

# =============================================================================
# Read Actions
# =============================================================================

execute_read_text() {
    local step="$1"
    local selector

    selector=$(echo "$step" | yq e '.selector' -)

    log_recette "INFO" "Reading text from: $selector"

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome get_element_text \
            --selector "$selector" 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    echo "{\"success\": true, \"action\": \"read_text\", \"selector\": \"$selector\", \"text\": $(echo "$result" | jq -Rs .)}"
    return 0
}

execute_read_console() {
    local step="$1"
    local level

    level=$(echo "$step" | yq e '.level // "all"' -)

    log_recette "INFO" "Reading console logs: $level"

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome read_console_logs 2>&1)
    else
        result='{"error": "Claude CLI not available"}'
    fi

    EXECUTOR_LAST_RESULT="$result"

    echo "{\"success\": true, \"action\": \"read_console\", \"logs\": $(echo "$result" | jq -Rs .)}"
    return 0
}

# =============================================================================
# Assertion Execution
# =============================================================================

execute_assertion() {
    local assertion_json="$1"

    if ! command -v yq &>/dev/null; then
        echo '{"passed": false, "error": "yq not available"}'
        return 1
    fi

    local assertion_type
    assertion_type=$(echo "$assertion_json" | yq e '.type' -)

    case "$assertion_type" in
        url_matches)
            assert_url_matches "$assertion_json"
            ;;
        element_visible)
            assert_element_visible "$assertion_json"
            ;;
        element_text)
            assert_element_text "$assertion_json"
            ;;
        element_not_contains)
            assert_element_not_contains "$assertion_json"
            ;;
        no_console_errors)
            assert_no_console_errors "$assertion_json"
            ;;
        response_code)
            assert_response_code "$assertion_json"
            ;;
        *)
            echo "{\"passed\": false, \"error\": \"Unknown assertion type: $assertion_type\"}"
            return 1
            ;;
    esac
}

# =============================================================================
# Assertion Implementations
# =============================================================================

assert_url_matches() {
    local assertion="$1"
    local pattern

    pattern=$(echo "$assertion" | yq e '.pattern' -)

    local current_url
    if command -v claude &>/dev/null; then
        current_url=$(claude mcp call claude-in-chrome get_current_url 2>&1)
    else
        current_url="$EXECUTOR_CURRENT_URL"
    fi

    if echo "$current_url" | grep -qE "$pattern"; then
        echo '{"passed": true, "assertion": "url_matches"}'
        return 0
    else
        echo "{\"passed\": false, \"assertion\": \"url_matches\", \"expected\": \"$pattern\", \"actual\": \"$current_url\"}"
        return 1
    fi
}

assert_element_visible() {
    local assertion="$1"
    local selector

    selector=$(echo "$assertion" | yq e '.selector' -)

    local result
    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome read_dom_state \
            --selector "$selector" 2>&1)
    else
        result=""
    fi

    if [[ -n "$result" ]] && ! echo "$result" | grep -qi "not found\|error"; then
        echo '{"passed": true, "assertion": "element_visible", "selector": "'"$selector"'"}'
        return 0
    else
        echo "{\"passed\": false, \"assertion\": \"element_visible\", \"selector\": \"$selector\"}"
        return 1
    fi
}

assert_element_text() {
    local assertion="$1"
    local selector expected

    selector=$(echo "$assertion" | yq e '.selector' -)
    expected=$(echo "$assertion" | yq e '.expected' -)

    local actual
    if command -v claude &>/dev/null; then
        actual=$(claude mcp call claude-in-chrome get_element_text \
            --selector "$selector" 2>&1)
    else
        actual=""
    fi

    if [[ "$actual" == *"$expected"* ]]; then
        echo '{"passed": true, "assertion": "element_text", "selector": "'"$selector"'"}'
        return 0
    else
        echo "{\"passed\": false, \"assertion\": \"element_text\", \"expected\": \"$expected\", \"actual\": $(echo "$actual" | jq -Rs .)}"
        return 1
    fi
}

assert_element_not_contains() {
    local assertion="$1"
    local selector value

    selector=$(echo "$assertion" | yq e '.selector' -)
    value=$(echo "$assertion" | yq e '.value' -)

    local text
    if command -v claude &>/dev/null; then
        text=$(claude mcp call claude-in-chrome get_element_text \
            --selector "$selector" 2>&1)
    else
        text=""
    fi

    if [[ "$text" != *"$value"* ]]; then
        echo '{"passed": true, "assertion": "element_not_contains", "selector": "'"$selector"'"}'
        return 0
    else
        echo "{\"passed\": false, \"assertion\": \"element_not_contains\", \"value\": \"$value\"}"
        return 1
    fi
}

assert_no_console_errors() {
    local assertion="$1"
    local severity

    severity=$(echo "$assertion" | yq e '.severity // "error"' -)

    local logs
    if command -v claude &>/dev/null; then
        logs=$(claude mcp call claude-in-chrome read_console_logs 2>&1)
    else
        logs=""
    fi

    if echo "$logs" | grep -qi "$severity"; then
        echo "{\"passed\": false, \"assertion\": \"no_console_errors\", \"logs\": $(echo "$logs" | jq -Rs .)}"
        return 1
    else
        echo '{"passed": true, "assertion": "no_console_errors"}'
        return 0
    fi
}

assert_response_code() {
    local assertion="$1"
    local expected

    expected=$(echo "$assertion" | yq e '.expected' -)

    # Get network requests
    local requests
    if command -v claude &>/dev/null; then
        requests=$(claude mcp call claude-in-chrome get_network_requests 2>&1)
    else
        requests=""
    fi

    # Check if any response code matches expected
    for code in $(echo "$expected" | tr '[],' ' '); do
        if echo "$requests" | grep -q "\"status\":$code"; then
            echo '{"passed": true, "assertion": "response_code", "expected": '"$expected"'}'
            return 0
        fi
    done

    echo "{\"passed\": false, \"assertion\": \"response_code\", \"expected\": $expected}"
    return 1
}

# =============================================================================
# Test Execution
# =============================================================================

# Execute a complete test
execute_test() {
    local test_json="$1"
    local dry_run="${2:-false}"

    if ! command -v yq &>/dev/null; then
        echo '{"success": false, "error": "yq not available"}'
        return 1
    fi

    local test_id test_name
    test_id=$(echo "$test_json" | yq e '.id' -)
    test_name=$(echo "$test_json" | yq e '.name' -)

    log_recette "INFO" "Executing test: $test_id - $test_name"

    # Get steps
    local steps
    steps=$(echo "$test_json" | yq e '.steps' - -o json)
    local step_count
    step_count=$(echo "$steps" | jq 'length')

    local all_passed=true
    local step_results=()

    # Execute each step
    for ((i=0; i<step_count; i++)); do
        local step
        step=$(echo "$steps" | jq ".[$i]")

        if [[ "$dry_run" == "true" ]]; then
            local action
            action=$(echo "$step" | jq -r '.action')
            step_results+=("{\"step\": $i, \"action\": \"$action\", \"dry_run\": true}")
        else
            # Create checkpoint before step
            create_checkpoint "$test_id" "$i" "executing"

            local result
            result=$(execute_step "$step")

            if echo "$result" | grep -q '"success": false'; then
                all_passed=false
                step_results+=("$result")

                # Take screenshot on failure
                execute_screenshot "{\"filename\": \"${test_id}_step${i}_failure.png\"}"

                break
            else
                step_results+=("$result")
            fi
        fi
    done

    # Execute assertions if all steps passed
    if [[ "$all_passed" == "true" ]] && [[ "$dry_run" != "true" ]]; then
        local assertions
        assertions=$(echo "$test_json" | yq e '.assertions' - -o json)
        local assertion_count
        assertion_count=$(echo "$assertions" | jq 'length')

        for ((i=0; i<assertion_count; i++)); do
            local assertion
            assertion=$(echo "$assertions" | jq ".[$i]")

            local result
            result=$(execute_assertion "$assertion")

            if echo "$result" | grep -q '"passed": false'; then
                all_passed=false
                step_results+=("$result")
                break
            else
                step_results+=("$result")
            fi
        done
    fi

    # Build result
    local status="passed"
    [[ "$all_passed" != "true" ]] && status="failed"

    echo "{\"test_id\": \"$test_id\", \"status\": \"$status\", \"steps\": [$(IFS=,; echo "${step_results[*]}")]}"

    [[ "$all_passed" == "true" ]] && return 0 || return 1
}

# =============================================================================
# Export
# =============================================================================

export EXECUTOR_CURRENT_URL
export EXECUTOR_LAST_ACTION
export EXECUTOR_LAST_RESULT
