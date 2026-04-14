#!/usr/bin/env bash
# validate-skills-spec.sh — Verify all .claude/skills/* conform to Anthropic Agent Skills spec.
# v8.0.0+ : failure blocks CI.
#
# Spec: https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md
# Rules enforced:
#   1. Each skill is a directory under .claude/skills/
#   2. Each skill has a SKILL.md file at its root
#   3. SKILL.md starts with YAML frontmatter (---)
#   4. Frontmatter contains `name:` (matches dir name) and `description:` (non-empty)
#   5. No absolute paths (/home/, /Users/, C:\) in any skill file
#   6. Skill name is lowercase kebab-case

set -euo pipefail

SKILLS_DIR="${1:-.claude/skills}"
ERRORS=0
WARNINGS=0

fail() {
  echo "❌ FAIL: $1" >&2
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo "⚠️  WARN: $1" >&2
  WARNINGS=$((WARNINGS + 1))
}

pass() {
  echo "✅ $1"
}

if [[ ! -d "$SKILLS_DIR" ]]; then
  fail "Skills directory not found: $SKILLS_DIR"
  exit 1
fi

echo "🔍 Validating skills in $SKILLS_DIR"
echo ""

SKILL_COUNT=0
for skill_path in "$SKILLS_DIR"/*/; do
  [[ -d "$skill_path" ]] || continue
  skill_name=$(basename "$skill_path")
  SKILL_COUNT=$((SKILL_COUNT + 1))

  # Rule 6: kebab-case
  if [[ ! "$skill_name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    fail "[$skill_name] name must be lowercase kebab-case"
    continue
  fi

  skill_md="${skill_path}SKILL.md"

  # Rule 2: SKILL.md exists
  if [[ ! -f "$skill_md" ]]; then
    fail "[$skill_name] missing SKILL.md"
    continue
  fi

  # Rule 3: starts with ---
  first_line=$(head -1 "$skill_md")
  if [[ "$first_line" != "---" ]]; then
    fail "[$skill_name] SKILL.md must start with --- (YAML frontmatter)"
    continue
  fi

  # Extract frontmatter (between first two --- lines)
  frontmatter=$(awk '/^---$/{c++; next} c==1{print} c==2{exit}' "$skill_md")

  # Rule 4a: name field present
  if ! echo "$frontmatter" | grep -q "^name:"; then
    fail "[$skill_name] frontmatter missing 'name:' field"
    continue
  fi

  declared_name=$(echo "$frontmatter" | grep "^name:" | head -1 | sed 's/^name:[[:space:]]*//' | tr -d '"' | tr -d "'")
  if [[ "$declared_name" != "$skill_name" ]]; then
    fail "[$skill_name] frontmatter name '$declared_name' does not match directory name"
    continue
  fi

  # Rule 4b: description field present and non-empty
  if ! echo "$frontmatter" | grep -q "^description:"; then
    fail "[$skill_name] frontmatter missing 'description:' field"
    continue
  fi

  description=$(echo "$frontmatter" | grep "^description:" | head -1 | sed 's/^description:[[:space:]]*//')
  if [[ -z "$description" ]]; then
    fail "[$skill_name] description is empty"
    continue
  fi

  # Warn if description too short (< 30 chars) — won't help Claude decide
  if [[ ${#description} -lt 30 ]]; then
    warn "[$skill_name] description too short (${#description} chars). Aim for >= 80 chars with 'Use when...'"
  fi

  # Rule 5: no absolute paths in any file of the skill
  if grep -rn "/home/\|/Users/\|C:\\\\" "$skill_path" 2>/dev/null | grep -v '\.git' | head -1 &>/dev/null; then
    fail "[$skill_name] contains absolute path (forbidden by spec)"
    continue
  fi

  pass "[$skill_name]"
done

echo ""
echo "───────────────────────────────────────────"
echo "Summary: $SKILL_COUNT skills | $ERRORS errors | $WARNINGS warnings"
echo "───────────────────────────────────────────"

if [[ "$ERRORS" -gt 0 ]]; then
  echo "❌ Validation FAILED"
  exit 1
fi

echo "✅ All skills conform to Anthropic Agent Skills spec"
exit 0
