#!/usr/bin/env bash
# PreToolUse(Bash) : bloque les commandes système destructrices.
#   - rm récursif + forcé : BLOCK_RM_RF=dangerous (défaut) ne bloque que les cibles
#     critiques (/, ~, $HOME, ., .., *, dossiers système) ; BLOCK_RM_RF=all bloque tout
#     rm -rf (utilisé par le dépôt claude-craft lui-même)
#   - mkfs, dd of=/dev/<disque>, redirection vers un disque, fork bomb
#   - sudo / su / doas, chmod 777, chown -R /
#   - lecture de secrets (cat/less/head/… sur .env, clés, credentials)
# Les commandes ne sont reconnues qu'en position de commande (début de segment, après
# sudo/xargs/env/VAR=…, ou find -exec) et les corps de heredoc sont ignorés : `docker run
# --rm … chown -R`, `grep -r mkfs`, un message de commit ou `2>/dev/null` ne déclenchent rien.
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_require_parser
hook_input
CMD=$(hook_get tool_input.command)
[ -n "$CMD" ] || exit 0

MODE=${BLOCK_RM_RF:-dangerous}
TEXT=$(printf '%s\n' "$CMD" | hook_strip_heredocs | tr "'\"" '  ')

if printf '%s' "$TEXT" | grep -qE ':[[:space:]]*\([[:space:]]*\)[[:space:]]*\{[[:space:]]*:'; then
  hook_block "Fork bomb detected"
fi
if printf '%s' "$TEXT" | grep -qE '>[[:space:]]*/dev/(sd|hd|nvme|mmcblk|disk|xvd|vd)'; then
  hook_block "Writing to a block device is not allowed"
fi

# Segments sur ; & | ( ) ` { ; chaque segment est analysé à partir de son premier mot.
verdicts=$(printf '%s\n' "$TEXT" | awk -v mode="$MODE" '
  function base(t) { sub(/.*\//, "", t); return t }
  function dangerous(a) {
    while (length(a) > 1 && substr(a, length(a)) == "/") a = substr(a, 1, length(a) - 1)
    return a ~ /^(\/|\/\*|~|\$HOME|\.|\.\.|\*)$/ || a ~ /^\/(etc|usr|var|bin|boot|home|lib|opt|root|srv|sbin)$/
  }
  function check_rm(from,   j, a, r, f, hit, eod) {
    for (j = from; j <= nt; j++) {
      a = t[j]
      if (!eod && a == "--") { eod = 1; continue }
      if (!eod && a ~ /^-/) {
        if (a == "--recursive" || a ~ /^-[a-zA-Z]*[rR]/) r = 1
        if (a == "--force" || a ~ /^-[a-zA-Z]*f/) f = 1
        continue
      }
      if (dangerous(a)) hit = 1
    }
    if (r && f && (mode == "all" || hit)) { print "BLOCK Destructive rm command detected (recursive+force)"; exit }
  }
  { buf = buf $0 ";" }
  END {
    gsub(/\$\{/, "$", buf); gsub(/\}/, " ", buf)
    ns = split(buf, stmts, /[;&|()`{]/)
    for (s = 1; s <= ns; s++) {
      nt = split(stmts[s], t); i = 1; pre = 0
      while (i <= nt) {
        if (t[i] ~ /^(env|nohup|command|exec|time|nice|xargs)$/) { pre = 1; i++; continue }
        if (pre && t[i] ~ /^-/) { i++; continue }
        if (t[i] ~ /^[A-Za-z_][A-Za-z0-9_]*=/) { i++; continue }
        if (base(t[i]) ~ /^(sh|bash|zsh|dash|ksh)$/ && i < nt && t[i + 1] ~ /^-[a-z]*c$/) { i += 2; pre = 0; continue }
        break
      }
      for (j = 1; j < nt; j++) if (t[j] ~ /^-exec(dir)?$/ && base(t[j + 1]) == "rm") check_rm(j + 2)
      if (i > nt) continue
      cmd = base(t[i])
      if (cmd ~ /^(sudo|su|doas)$/) { print "BLOCK Elevated privilege commands are not allowed"; exit }
      if (cmd ~ /^mkfs/) { print "BLOCK mkfs is not allowed"; exit }
      if (cmd == "rm") check_rm(i + 1)
      if (cmd == "dd") for (j = i + 1; j <= nt; j++) if (t[j] ~ /^of=\/dev\/(sd|hd|nvme|mmcblk|disk|xvd|vd)/) { print "BLOCK dd to a block device is not allowed"; exit }
      if (cmd == "chmod") for (j = i + 1; j <= nt; j++) if (t[j] ~ /^0?777$/) { print "BLOCK chmod 777 is not allowed"; exit }
      if (cmd == "chown") {
        rec = 0; root = 0
        for (j = i + 1; j <= nt; j++) { if (t[j] ~ /^-[a-zA-Z]*R/ || t[j] == "--recursive") rec = 1; if (t[j] == "/") root = 1 }
        if (rec && root) { print "BLOCK chown -R / is not allowed"; exit }
      }
      if (cmd ~ /^(cat|less|more|head|tail|strings|bat)$/)
        for (j = i + 1; j <= nt; j++) if (t[j] !~ /^-/) print "READ " t[j]
    }
  }')

while IFS= read -r line; do
  case "$line" in
    "BLOCK "*) hook_block "${line#BLOCK }" ;;
    "READ "*) is_sensitive_path "${line#READ }" && hook_block "Command might expose secrets (${line#READ })" ;;
  esac
done <<EOF
$verdicts
EOF
exit 0
