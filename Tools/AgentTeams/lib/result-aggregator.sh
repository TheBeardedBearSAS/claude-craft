#!/usr/bin/env bash
# =============================================================================
# Agent Teams - Result Aggregator
# Merges results from N isolated audit directories into a unified report.
#
# Each worker produces a result.json with:
#   { "score": <number>, "findings": [...], "tech": "<string>", "category": "<string>" }
#
# The aggregator:
#   - Collects all result.json files from isolated directories
#   - Deduplicates findings (same file + message = duplicate)
#   - Resolves score conflicts (weighted average per category)
#   - Produces a unified aggregated report
#
# Supports --dry-run to preview without writing.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Defaults
INPUT_DIR=""
OUTPUT_FILE=""
DRY_RUN="false"
VERBOSE="false"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# =============================================================================
# Logging
# =============================================================================

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_verbose() { [[ "$VERBOSE" == "true" ]] && echo -e "${CYAN}[DEBUG]${NC} $1" || true; }

# =============================================================================
# Help
# =============================================================================

show_help() {
    cat << 'EOF'
Agent Teams - Result Aggregator

Merges results from N isolated audit directories into a unified report.

USAGE:
    result-aggregator.sh --input-dir <dir> [--output-file <file>] [options]

REQUIRED:
    --input-dir <dir>       Directory containing isolated audit results.
                            Each subdirectory should contain a result.json.

OPTIONS:
    --output-file <file>    Output file for the merged report (default: stdout)
    --dry-run               Preview what would be merged without writing
    --verbose               Show detailed processing information
    -h, --help              Show this help message

INPUT FORMAT:
    Each result.json must follow this schema:

    {
      "tech": "symfony",
      "category": "architecture",
      "score": 22,
      "max": 25,
      "findings": [
        {
          "severity": "warning|error|info",
          "file": "src/Controller/UserController.php",
          "message": "Direct repository access from controller",
          "rule": "clean-architecture-layer-violation"
        }
      ]
    }

    The input directory structure should be:

    <input-dir>/
      <agent-id-1>/result.json
      <agent-id-2>/result.json
      ...

OUTPUT FORMAT:
    The merged report is a JSON object:

    {
      "generated_at": "2026-02-07T10:00:00Z",
      "technologies": {
        "symfony": {
          "categories": {
            "architecture": { "score": 22, "max": 25 },
            "code-quality": { "score": 20, "max": 25 },
            ...
          },
          "total_score": 82,
          "max_score": 100
        }
      },
      "findings": [...],
      "summary": {
        "total_technologies": 2,
        "global_score": 80,
        "global_max": 100,
        "total_findings": 15,
        "by_severity": { "error": 2, "warning": 8, "info": 5 }
      }
    }

EXAMPLES:
    # Merge audit results and write to file
    result-aggregator.sh --input-dir .audit-output --output-file report.json

    # Preview what would be merged
    result-aggregator.sh --input-dir .audit-output --dry-run

    # Merge and print to stdout
    result-aggregator.sh --input-dir .audit-output
EOF
}

# =============================================================================
# Validation
# =============================================================================

check_dependencies() {
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed."
        log_error "Install with: apt-get install jq (Linux) or brew install jq (macOS)"
        return 1
    fi
}

validate_result_file() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    # Check it's valid JSON with required fields
    if ! jq -e '.tech and .category and (.score != null) and .findings' "$file" > /dev/null 2>&1; then
        log_warning "Invalid result file (missing required fields): $file"
        return 1
    fi

    return 0
}

# =============================================================================
# Core Aggregation
# =============================================================================

# Collect all valid result.json files from input directory.
# Outputs file paths to stdout (one per line). Log messages go to stderr.
collect_results() {
    local input_dir="$1"
    local results=()

    # Search for result.json in subdirectories
    while IFS= read -r -d '' file; do
        if validate_result_file "$file"; then
            results+=("$file")
            log_verbose "Found valid result: $file" >&2
        else
            log_warning "Skipping invalid result: $file" >&2
        fi
    done < <(find "$input_dir" -name "result.json" -type f -print0 2>/dev/null)

    if [[ ${#results[@]} -eq 0 ]]; then
        log_warning "No valid result.json files found in $input_dir" >&2
        return 1
    fi

    log_info "Found ${#results[@]} result files" >&2

    # Output only file paths to stdout
    printf '%s\n' "${results[@]}"
}

# Deduplicate findings: same file + message = duplicate.
# When duplicates exist, keep the one with the higher severity.
deduplicate_findings() {
    local findings_json="$1"

    jq '
        # Group by file+message to detect duplicates
        group_by(.file + "|" + .message) |
        map(
            # For each group, sort by severity (error > warning > info) and take first
            sort_by(
                if .severity == "error" then 0
                elif .severity == "warning" then 1
                else 2
                end
            ) | .[0]
        )
    ' <<< "$findings_json"
}

# Resolve score conflicts: when multiple results exist for the same
# tech+category, use weighted average.
resolve_score_conflicts() {
    local results_json="$1"

    jq '
        # Group by tech+category
        group_by(.tech + "|" + .category) |
        map({
            tech: .[0].tech,
            category: .[0].category,
            score: (map(.score) | add / length | floor),
            max: (.[0].max // 25),
            findings: ([.[].findings] | flatten)
        })
    ' <<< "$results_json"
}

# Build the final aggregated report
build_report() {
    local resolved_json="$1"
    local all_findings_deduped="$2"

    jq --arg ts "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" --argjson findings "$all_findings_deduped" '
        # Build technologies map
        (group_by(.tech) | map({
            key: .[0].tech,
            value: {
                categories: (map({key: .category, value: {score: .score, max: .max}}) | from_entries),
                total_score: (map(.score) | add),
                max_score: (map(.max) | add)
            }
        }) | from_entries) as $techs |

        # Count findings by severity
        ($findings | group_by(.severity) | map({key: .[0].severity, value: length}) | from_entries) as $by_severity |

        # Calculate global score
        (($techs | to_entries | map(.value.total_score) | add) // 0) as $global_score |
        (($techs | to_entries | map(.value.max_score) | add) // 0) as $global_max |

        {
            generated_at: $ts,
            technologies: $techs,
            findings: $findings,
            summary: {
                total_technologies: ($techs | keys | length),
                global_score: (if ($techs | keys | length) > 0
                    then ($global_score / ($techs | keys | length) | floor)
                    else 0 end),
                global_max: (if ($techs | keys | length) > 0
                    then ($global_max / ($techs | keys | length) | floor)
                    else 0 end),
                total_findings: ($findings | length),
                by_severity: (($by_severity) // {})
            }
        }
    ' <<< "$resolved_json"
}

# =============================================================================
# Main Aggregation Pipeline
# =============================================================================

aggregate() {
    local input_dir="$1"
    local output_file="${2:-}"
    local dry_run="${3:-false}"

    log_info "Aggregating results from: $input_dir"

    # Step 1: Collect all valid result files
    local result_files
    result_files=$(collect_results "$input_dir") || {
        log_error "No results to aggregate"
        return 1
    }

    local file_count
    file_count=$(echo "$result_files" | wc -l | tr -d ' ')

    if [[ "$dry_run" == "true" ]]; then
        log_info "DRY RUN - Would aggregate $file_count result files:"
        echo "$result_files" | while IFS= read -r f; do
            local tech category score
            tech=$(jq -r '.tech' "$f" 2>/dev/null)
            category=$(jq -r '.category' "$f" 2>/dev/null)
            score=$(jq -r '.score' "$f" 2>/dev/null)
            local max
            max=$(jq -r '.max // 25' "$f" 2>/dev/null)
            local finding_count
            finding_count=$(jq '.findings | length' "$f" 2>/dev/null)
            log_info "  $tech/$category: $score/$max ($finding_count findings)"
        done

        if [[ -n "$output_file" ]]; then
            log_info "DRY RUN - Would write merged report to: $output_file"
        else
            log_info "DRY RUN - Would output merged report to stdout"
        fi
        return 0
    fi

    # Step 2: Concatenate all results into a JSON array
    local all_results="[]"
    while IFS= read -r file; do
        local content
        content=$(jq '.' "$file" 2>/dev/null) || {
            log_warning "Failed to parse: $file"
            continue
        }
        all_results=$(jq --argjson item "$content" '. + [$item]' <<< "$all_results")
    done <<< "$result_files"

    log_verbose "Combined $(jq 'length' <<< "$all_results") results"

    # Step 3: Resolve score conflicts (weighted average for same tech+category)
    local resolved
    resolved=$(resolve_score_conflicts "$all_results")
    log_verbose "Resolved to $(jq 'length' <<< "$resolved") unique tech/category entries"

    # Step 4: Collect and deduplicate all findings
    local all_findings
    all_findings=$(jq '[.[].findings] | flatten' <<< "$all_results")
    local original_count
    original_count=$(jq 'length' <<< "$all_findings")

    local deduped_findings
    deduped_findings=$(deduplicate_findings "$all_findings")
    local deduped_count
    deduped_count=$(jq 'length' <<< "$deduped_findings")

    if [[ "$original_count" -ne "$deduped_count" ]]; then
        local removed=$((original_count - deduped_count))
        log_info "Deduplicated findings: $original_count -> $deduped_count ($removed duplicates removed)"
    fi

    # Step 5: Build final report
    local report
    report=$(build_report "$resolved" "$deduped_findings")

    # Step 6: Output
    if [[ -n "$output_file" ]]; then
        local output_dir
        output_dir=$(dirname "$output_file")
        mkdir -p "$output_dir"
        echo "$report" | jq '.' > "$output_file"
        log_success "Merged report written to: $output_file"
    else
        echo "$report" | jq '.'
    fi

    # Summary
    local tech_count score_avg
    tech_count=$(jq '.summary.total_technologies' <<< "$report")
    score_avg=$(jq '.summary.global_score' <<< "$report")
    log_success "Aggregation complete: $tech_count technologies, average score: $score_avg"
}

# =============================================================================
# CLI
# =============================================================================

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --input-dir)
                INPUT_DIR="$2"
                shift 2
                ;;
            --output-file)
                OUTPUT_FILE="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --verbose)
                VERBOSE="true"
                shift
                ;;
            -h|--help|help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo ""
                show_help
                exit 1
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$INPUT_DIR" ]]; then
        log_error "Missing required argument: --input-dir"
        echo ""
        show_help
        exit 1
    fi

    if [[ ! -d "$INPUT_DIR" ]]; then
        log_error "Input directory does not exist: $INPUT_DIR"
        exit 1
    fi

    # Check dependencies
    check_dependencies || exit 1

    # Run aggregation
    aggregate "$INPUT_DIR" "$OUTPUT_FILE" "$DRY_RUN"
}

main "$@"
