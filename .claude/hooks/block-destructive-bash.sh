#!/usr/bin/env bash
# PreToolUse(Bash) : bloque `rm` récursif + forcé et quelques commandes système
# destructrices. Payload JSON lu sur stdin (règle 11). Exit 2 = commande bloquée.
#
# `rm` n'est reconnu qu'en position de commande (début de segment, après sudo/xargs/…
# ou find -exec) et ses drapeaux ne sont lus que dans SES arguments : `docker run --rm`,
# `ai-craft`, `remove --force` ou `2>/dev/null` ne déclenchent plus rien.
set -u

CMD=$(jq -r '.tool_input.command // empty')

block() {
  printf 'BLOCKED: %s\n' "$1" >&2
  exit 2
}

# Segments : ; & | ( ) ` { et quotes (pour `sh -c 'rm -rf x'`) deviennent des fins de ligne.
segments=$(printf '%s\n' "$CMD" | tr ";&|()\`{'\"" '\n\n\n\n\n\n\n\n\n')

rm_args=$(printf '%s\n' "$segments" | sed -nE \
  -e 's/^[[:space:]]*((sudo|xargs|env|nohup|command|exec|time)([[:space:]]+-[^[:space:]]+)*[[:space:]]+)*rm[[:space:]]+(.*)$/\4/p' \
  -e 's/.*[[:space:]]-exec(dir)?[[:space:]]+rm[[:space:]]+(.*)$/\2/p')

if printf '%s\n' "$rm_args" | awk '
  { r = 0; f = 0
    for (i = 1; i <= NF; i++) {
      if ($i == "--") break
      if ($i == "--recursive" || $i ~ /^-[a-zA-Z]*[rR]/) r = 1
      if ($i == "--force" || $i ~ /^-[a-zA-Z]*f/) f = 1
    }
    if (r && f) hit = 1 }
  END { exit !hit }'; then
  block "Destructive rm command detected (recursive+force)"
fi

if printf '%s' "$CMD" | grep -qE '(^|[^[:alnum:]_.-])(mkfs|dd[[:space:]]+if=)|:[[:space:]]*\(\)[[:space:]]*\{[[:space:]]*:|chmod[[:space:]]+(-R[[:space:]]+)?777|>[[:space:]]*/dev/(sd|hd|nvme|mmcblk|disk)'; then
  block "Dangerous system command detected"
fi

exit 0
