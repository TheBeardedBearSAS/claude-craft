#!/usr/bin/env bats
# scripts/verify-i18n-parity.sh on a read-only checkout.
#
# Why: the script always wrote its gap report to audit/phases/i18n-gap.csv
# under the repo, so on a read-only mount (this e2e runner mounts the repo
# `:ro`) `mkdir -p` / the CSV write failed and set -e aborted the check.

setup() {
    PROJECT_ROOT="$(cd "$BATS_TEST_DIRNAME/../../.." && pwd)"
    export PROJECT_ROOT
    SCRATCH="$BATS_TMPDIR/i18n-parity-$$-${BATS_TEST_NUMBER:-0}"
    mkdir -p "$SCRATCH"
    export SCRATCH
    # Writable checkout (local run): the read-only case cannot be reproduced.
    if [ -w "$PROJECT_ROOT" ]; then
        skip "repository is writable — run through docker-compose.test.yml (read-only mount)"
    fi
}

teardown() {
    [ -d "$SCRATCH" ] && rm -rf "$SCRATCH"
}

@test "i18n parity: succeeds on a read-only repository" {
    run bash "$PROJECT_ROOT/scripts/verify-i18n-parity.sh"
    echo "$output"
    [ "$status" -eq 0 ]
    echo "$output" | grep -q "All languages at parity"
}

@test "i18n parity: I18N_GAP_CSV writes the gap report outside the repository" {
    I18N_GAP_CSV="$SCRATCH/report/gap.csv" run bash "$PROJECT_ROOT/scripts/verify-i18n-parity.sh"
    echo "$output"
    [ "$status" -eq 0 ]
    [ "$(head -1 "$SCRATCH/report/gap.csv")" = "file,locale,size_en,size_locale,ratio" ]
}
