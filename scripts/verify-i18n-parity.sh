#!/bin/bash
# =============================================================================
# Verify i18n Parity
# Checks that all supported languages have identical file counts and structure
# in Dev/i18n/{lang}/ and docs/guides/{lang}/
#
# Usage: bash scripts/verify-i18n-parity.sh
# Exit codes: 0 = parity OK, 1 = parity failure
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

LANGS=("en" "fr" "es" "de" "pt")
REFERENCE_LANG="en"
ERRORS=0
# Size parity threshold: target language file must be >= SIZE_THRESHOLD * en_size
# Overridable via env var; 0.80 means 80% parity required
SIZE_THRESHOLD="${I18N_SIZE_THRESHOLD:-0.80}"
# Set STRICT_SIZE=0 to downgrade size gaps to warnings (default: fail on gaps).
# Flipped to 1 in v8.8.2: the i18n translation debt (101 files < 0.80) is fully
# resorbed, so any new sub-threshold file is now a regression and must block.
STRICT_SIZE="${STRICT_SIZE:-1}"
# Hard blocking threshold: files > BLOCK_SIZE_BYTES with ratio < BLOCK_RATIO trigger exit 1
# regardless of SIZE_THRESHOLD, unless I18N_PARITY_STRICT=0 is set.
BLOCK_SIZE_BYTES="${I18N_BLOCK_SIZE_BYTES:-5000}"
BLOCK_RATIO="${I18N_BLOCK_RATIO:-0.40}"
# Set I18N_PARITY_STRICT=0 to allow transitional PRs (default: hard blocking on).
# Flipped to 1 in v8.8.2: the inherited i18n debt is fully resorbed (gap report
# empty), so a large file dropping below BLOCK_RATIO is now a regression to block.
I18N_PARITY_STRICT="${I18N_PARITY_STRICT:-1}"
SIZE_WARNINGS=0
BLOCK_FAILURES=()
# CSV output file for gap report
GAP_CSV="$ROOT_DIR/audit/phases/i18n-gap.csv"

C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BOLD='\033[1m'

print_ok() { echo -e "  ${C_GREEN}✓${C_RESET} $1"; }
print_fail() { echo -e "  ${C_RED}✗${C_RESET} $1"; }
print_warn() { echo -e "  ${C_YELLOW}⚠${C_RESET} $1"; }

# =============================================================================
# Check a directory tree for parity across languages
# Args: $1 = base path (e.g. Dev/i18n), $2 = label
# =============================================================================
check_parity() {
    local base="$ROOT_DIR/$1"
    local label="$2"

    echo -e "\n${C_BOLD}Checking ${label} ($1)${C_RESET}"

    # Get reference file list (relative paths)
    local ref_dir="$base/$REFERENCE_LANG"
    if [[ ! -d "$ref_dir" ]]; then
        print_fail "Reference directory not found: $ref_dir"
        ERRORS=$((ERRORS + 1))
        return
    fi

    local ref_count
    ref_count=$(find "$ref_dir" -type f | wc -l)
    print_ok "Reference ($REFERENCE_LANG): $ref_count files"

    # Build sorted list of relative paths for reference
    local ref_files
    ref_files=$(cd "$ref_dir" && find . -type f | sort)

    for lang in "${LANGS[@]}"; do
        [[ "$lang" == "$REFERENCE_LANG" ]] && continue

        local lang_dir="$base/$lang"
        if [[ ! -d "$lang_dir" ]]; then
            print_fail "$lang: directory missing"
            ERRORS=$((ERRORS + 1))
            continue
        fi

        local lang_count
        lang_count=$(find "$lang_dir" -type f | wc -l)

        if [[ "$lang_count" -ne "$ref_count" ]]; then
            print_fail "$lang: $lang_count files (expected $ref_count)"
            ERRORS=$((ERRORS + 1))

            # Show missing/extra files
            local lang_files
            lang_files=$(cd "$lang_dir" && find . -type f | sort)

            local missing
            missing=$(comm -23 <(echo "$ref_files") <(echo "$lang_files"))
            if [[ -n "$missing" ]]; then
                echo "    Missing files:"
                echo "$missing" | while IFS= read -r f; do echo "      - $f"; done
            fi

            local extra
            extra=$(comm -13 <(echo "$ref_files") <(echo "$lang_files"))
            if [[ -n "$extra" ]]; then
                echo "    Extra files:"
                echo "$extra" | while IFS= read -r f; do echo "      - $f"; done
            fi
        else
            print_ok "$lang: $lang_count files"
        fi
    done
}

# =============================================================================
# Main
# =============================================================================

echo -e "${C_BOLD}i18n Parity Check${C_RESET}"
echo "Languages: ${LANGS[*]}"
echo "Reference: $REFERENCE_LANG"

check_parity "Dev/i18n" "Dev i18n files"
check_parity "docs/guides" "Documentation guides"
[[ -d "$ROOT_DIR/Infra/i18n" ]] && check_parity "Infra/i18n" "Infra i18n files"
[[ -d "$ROOT_DIR/Project/i18n" ]] && check_parity "Project/i18n" "Project i18n files"

# =============================================================================
# Size parity check (advisory unless STRICT_SIZE=1 or hard blocking threshold hit)
# Hard blocking: file > BLOCK_SIZE_BYTES and ratio < BLOCK_RATIO triggers exit 1
# unless I18N_PARITY_STRICT=0 (transitional PRs).
# =============================================================================
echo -e "\n${C_BOLD}Size parity check (threshold: ${SIZE_THRESHOLD}, strict: ${STRICT_SIZE}, block_ratio: ${BLOCK_RATIO})${C_RESET}"
[[ "$I18N_PARITY_STRICT" == "0" ]] && print_warn "I18N_PARITY_STRICT=0 — hard blocking disabled (transitional mode)"

# Ensure CSV output directory exists
mkdir -p "$(dirname "$GAP_CSV")"
# Write CSV header
echo "file,locale,size_en,size_locale,ratio" > "$GAP_CSV"

check_size_parity() {
    local base="$ROOT_DIR/$1"
    local label="$2"
    [[ -d "$base/$REFERENCE_LANG" ]] || return 0

    while IFS= read -r enfile; do
        local rel="${enfile#$base/$REFERENCE_LANG/}"
        local en_size
        en_size=$(wc -c < "$enfile" 2>/dev/null || echo 0)
        [[ "$en_size" -lt 500 ]] && continue  # skip tiny files

        for lang in "${LANGS[@]}"; do
            [[ "$lang" == "$REFERENCE_LANG" ]] && continue
            local target="$base/$lang/$rel"
            [[ -f "$target" ]] || continue
            local t_size
            t_size=$(wc -c < "$target" 2>/dev/null || echo 0)
            local ratio
            ratio=$(awk -v a="$t_size" -v b="$en_size" 'BEGIN{printf "%.2f", a/b}')

            # Write all below-threshold entries to CSV (advisory threshold)
            if awk "BEGIN{exit !($ratio < $SIZE_THRESHOLD)}"; then
                print_warn "$label: $lang/$rel ($ratio vs ref, threshold $SIZE_THRESHOLD)"
                SIZE_WARNINGS=$((SIZE_WARNINGS + 1))
                # Append to gap CSV (escape commas in path with quotes)
                echo "\"$1/$rel\",$lang,$en_size,$t_size,$ratio" >> "$GAP_CSV"

                # Hard blocking: large file with critically low ratio
                if [[ "$en_size" -gt "$BLOCK_SIZE_BYTES" ]] && awk "BEGIN{exit !($ratio < $BLOCK_RATIO)}"; then
                    print_fail "BLOCKING: $lang/$rel — ratio $ratio < $BLOCK_RATIO (file ${en_size}B > ${BLOCK_SIZE_BYTES}B)"
                    BLOCK_FAILURES+=("$lang/$1/$rel (ratio=$ratio)")
                fi
            fi
        done
    done < <(find "$base/$REFERENCE_LANG" -type f \( -name '*.md' -o -name '*.sh' \) 2>/dev/null)
}

check_size_parity "Dev/i18n" "Dev"
check_size_parity "docs/guides" "docs"
[[ -d "$ROOT_DIR/Infra/i18n" ]] && check_size_parity "Infra/i18n" "Infra"
[[ -d "$ROOT_DIR/Project/i18n" ]] && check_size_parity "Project/i18n" "Project"

# Report CSV location
if [[ -s "$GAP_CSV" ]] && [[ "$(wc -l < "$GAP_CSV")" -gt 1 ]]; then
    print_warn "Gap report written to: $GAP_CSV"
fi

if [[ "$SIZE_WARNINGS" -gt 0 ]]; then
    print_warn "$SIZE_WARNINGS file(s) below ${SIZE_THRESHOLD} size ratio"
    if [[ "$STRICT_SIZE" == "1" ]]; then
        ERRORS=$((ERRORS + SIZE_WARNINGS))
    fi
fi

# Hard blocking check (activated unless I18N_PARITY_STRICT=0)
if [[ "${#BLOCK_FAILURES[@]}" -gt 0 ]] && [[ "$I18N_PARITY_STRICT" != "0" ]]; then
    echo ""
    print_fail "${C_BOLD}Hard blocking threshold exceeded (ratio < ${BLOCK_RATIO} on files > ${BLOCK_SIZE_BYTES}B):${C_RESET}"
    for f in "${BLOCK_FAILURES[@]}"; do
        echo "  - $f"
    done
    echo ""
    print_fail "Set I18N_PARITY_STRICT=0 to allow this PR transitionally."
    ERRORS=$((ERRORS + ${#BLOCK_FAILURES[@]}))
fi

echo ""
if [[ $ERRORS -gt 0 ]]; then
    print_fail "${C_BOLD}Parity check failed with $ERRORS error(s)${C_RESET}"
    exit 1
else
    print_ok "${C_BOLD}All languages at parity${C_RESET}"
    exit 0
fi
