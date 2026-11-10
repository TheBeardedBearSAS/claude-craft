#!/usr/bin/env bash
# PostToolUse (Edit|Write) : formate/lint le fichier modifié selon son extension.
# Payload JSON lu sur stdin ; informatif, ne bloque jamais.
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_has_parser || exit 0
hook_input
FILE_PATH=$(hook_get tool_input.file_path)
[ -n "$FILE_PATH" ] || exit 0

have() { command -v "$1" >/dev/null 2>&1; }

case "${FILE_PATH##*.}" in
  js | jsx | ts | tsx)
    if have npx && [ -f package.json ]; then npx --no-install eslint --fix "$FILE_PATH" >/dev/null 2>&1 || true; fi
    ;;
  php)
    if have php-cs-fixer; then
      php-cs-fixer fix "$FILE_PATH" --quiet >/dev/null 2>&1 || true
    elif [ -x vendor/bin/php-cs-fixer ]; then
      vendor/bin/php-cs-fixer fix "$FILE_PATH" --quiet >/dev/null 2>&1 || true
    fi
    ;;
  py)
    if have black; then black --quiet "$FILE_PATH" >/dev/null 2>&1 || true; fi
    if have isort; then isort --quiet "$FILE_PATH" >/dev/null 2>&1 || true; fi
    ;;
  dart) if have dart; then dart format "$FILE_PATH" >/dev/null 2>&1 || true; fi ;;
  go) if have gofmt; then gofmt -w "$FILE_PATH" >/dev/null 2>&1 || true; fi ;;
  rs) if have rustfmt; then rustfmt "$FILE_PATH" >/dev/null 2>&1 || true; fi ;;
esac
exit 0
