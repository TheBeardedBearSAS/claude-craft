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

echo ""
if [[ $ERRORS -gt 0 ]]; then
    print_fail "${C_BOLD}Parity check failed with $ERRORS error(s)${C_RESET}"
    exit 1
else
    print_ok "${C_BOLD}All languages at parity${C_RESET}"
    exit 0
fi
