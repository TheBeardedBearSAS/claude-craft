#!/usr/bin/env bash
# pack-repo-fallback.sh — Fallback shell natif pour /common:pack-repo
# Utilisé quand repomix (npm) n'est pas disponible.
# Limitations : pas de compression, token count estimé (4 chars ≈ 1 token).
#
# Usage: bash pack-repo-fallback.sh [--format=markdown|plain] [--output=<path>] [--include=<glob>] [--exclude=<pattern>]

set -euo pipefail

FORMAT="markdown"
OUTPUT="./pack-repo-output.md"
INCLUDE=""
EXCLUDE_EXTRA=""

# Exclusions par défaut (couvre 95% des cas)
DEFAULT_EXCLUDES=(
  "node_modules" "vendor" "dist" "build" ".git" "coverage"
  ".next" ".nuxt" ".svelte-kit" "target" "bin" "obj"
  "__pycache__" ".pytest_cache" ".mypy_cache" ".ruff_cache"
  ".claude/scheduled_tasks.lock"
)

# Extensions binaires à exclure
BINARY_EXTS="jpg|jpeg|png|gif|webp|ico|svg|woff|woff2|ttf|eot|mp3|mp4|mov|avi|pdf|zip|tar|gz|7z|rar|exe|dll|so|dylib|class|jar|war|pyc|pyo|o|a"

# Parse args
for arg in "$@"; do
  case $arg in
    --format=*) FORMAT="${arg#*=}" ;;
    --output=*) OUTPUT="${arg#*=}" ;;
    --include=*) INCLUDE="${arg#*=}" ;;
    --exclude=*) EXCLUDE_EXTRA="${arg#*=}" ;;
    *) echo "Unknown arg: $arg" >&2; exit 1 ;;
  esac
done

if [[ "$FORMAT" != "markdown" && "$FORMAT" != "plain" ]]; then
  echo "❌ Format non supporté en fallback : $FORMAT (markdown|plain uniquement)" >&2
  exit 1
fi

# Validate --output: relative path only, no traversal, no shell metachars
if [[ "$OUTPUT" = /* ]] || [[ "$OUTPUT" == *".."* ]] || [[ "$OUTPUT" =~ [[:space:]\;\|\&\$\`\(\)\<\>] ]]; then
  echo "❌ Invalid --output: must be a relative path without '..' or shell metacharacters" >&2
  exit 1
fi

# Validate --exclude and --include: no shell metachars (prevents eval/grep injection)
if [[ -n "$EXCLUDE_EXTRA" && "$EXCLUDE_EXTRA" =~ [[:space:]\;\|\&\$\`\(\)\<\>] ]]; then
  echo "❌ Invalid --exclude: shell metacharacters are not allowed" >&2
  exit 1
fi
if [[ -n "$INCLUDE" && "$INCLUDE" =~ [[:space:]\;\|\&\$\`\(\)\<\>] ]]; then
  echo "❌ Invalid --include: shell metacharacters are not allowed" >&2
  exit 1
fi

echo "📦 Pack repo (fallback shell) → $OUTPUT"
echo "   Format: $FORMAT | Root: $(pwd)"

# Build find args as an array (no eval, no injection)
FIND_ARGS=()
for excl in "${DEFAULT_EXCLUDES[@]}"; do
  FIND_ARGS+=(-not -path "*/$excl/*" -not -path "*/$excl")
done
if [[ -n "$EXCLUDE_EXTRA" ]]; then
  FIND_ARGS+=(-not -path "*$EXCLUDE_EXTRA*")
fi

# Collect files — respect .gitignore si disponible
if command -v git &>/dev/null && git rev-parse --git-dir &>/dev/null; then
  FILES=$(git ls-files --cached --others --exclude-standard 2>/dev/null | grep -Ev "\.($BINARY_EXTS)$" || true)
else
  FILES=$(find . -type f "${FIND_ARGS[@]}" | grep -Ev "\.($BINARY_EXTS)$" | sed 's|^\./||')
fi

if [[ -n "$INCLUDE" ]]; then
  # timeout on grep to prevent ReDoS
  FILES=$(echo "$FILES" | timeout 5 grep -E "$INCLUDE" || true)
fi

FILE_COUNT=$(echo "$FILES" | grep -c . || echo 0)

if [[ "$FILE_COUNT" == "0" ]]; then
  echo "⚠️  Aucun fichier à packer." >&2
  exit 1
fi

# Generate output
{
  if [[ "$FORMAT" == "markdown" ]]; then
    echo "# Repository Pack (fallback)"
    echo ""
    echo "- **Generated:** $(date -Iseconds)"
    echo "- **Root:** $(pwd)"
    echo "- **Files included:** $FILE_COUNT"
    echo "- **Tool:** pack-repo-fallback.sh (native bash)"
    echo ""
    echo "---"
    echo ""
  else
    echo "================================================================"
    echo "REPOSITORY PACK — $(date -Iseconds)"
    echo "Files: $FILE_COUNT | Root: $(pwd)"
    echo "================================================================"
    echo ""
  fi

  while IFS= read -r file; do
    [[ -z "$file" || ! -f "$file" ]] && continue

    # Skip files > 500KB (likely generated/binary)
    size=$(wc -c < "$file" 2>/dev/null || echo 0)
    [[ "$size" -gt 512000 ]] && continue

    if [[ "$FORMAT" == "markdown" ]]; then
      ext="${file##*.}"
      echo "## \`$file\`"
      echo ""
      echo "\`\`\`${ext}"
      cat "$file"
      echo ""
      echo "\`\`\`"
      echo ""
    else
      echo "================================================================"
      echo "FILE: $file"
      echo "================================================================"
      cat "$file"
      echo ""
    fi
  done <<< "$FILES"
} > "$OUTPUT"

# Token estimation (4 chars ≈ 1 token for English code, conservative)
BYTES=$(wc -c < "$OUTPUT")
EST_TOKENS=$((BYTES / 4))

echo "✅ Pack généré : $OUTPUT"
echo "   Files:  $FILE_COUNT"
echo "   Size:   $BYTES bytes"
echo "   Tokens: ~$EST_TOKENS (estimation 4 chars/token)"

if [[ "$EST_TOKENS" -gt 200000 ]]; then
  echo ""
  echo "⚠️  ATTENTION : > 200k tokens estimés. Risque de dépassement contexte LLM."
  echo "    Solutions :"
  echo "    - Installer repomix (npm) pour compression : npm install -g repomix"
  echo "    - Restreindre avec --include=<glob>"
  echo "    - Découper par sous-dossier"
fi
