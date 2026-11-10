#!/usr/bin/env bash
# PreToolUse(Bash) : bloque l'exécution directe d'un script téléchargé.
#   1. interpréteur nourri par une substitution : bash <(curl …), sh -c "$(curl …)", eval
#   2. téléchargement suivi d'un interpréteur dans le même pipeline : curl … | [sudo] sh
#   3. interpréteur lancé sur un fichier qui vient d'être téléchargé : curl -O …/i.sh && bash i.sh
# Les commandes ne sont reconnues qu'en position de commande (après sudo/env/VAR=…),
# donc `2>/dev/null`, `grep -o`, un domaine `.pl` ou un message de commit ne comptent pas.
# Télécharger un fichier (`curl -o`) reste du ressort des permissions, pas de ce hook.
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_require_parser
hook_input
CMD=$(hook_get tool_input.command)
[ -n "$CMD" ] || exit 0

# Corps de heredoc retirés (données), quotes neutralisées (sh -c 'curl … | sh' reste
# analysé), `<(curl` / `$(curl` marqués __DLSUB__ dans l'étage qui les reçoit, puis
# instructions séparées sur ; && || & ( ) ` { } et étages sur |.
verdict=$(printf '%s\n' "$CMD" | hook_strip_heredocs | tr "'\"" '  ' | awk '
  function base(t) { sub(/[?#].*$/, "", t); sub(/.*\//, "", t); return t }
  function is_interp(c) {
    return c == "." || c ~ /^(sh|bash|zsh|dash|ksh|fish|python[0-9.]*|perl|ruby|node|deno|bun|php|pwsh|source|eval)$/
  }
  { buf = buf $0 ";" }
  END {
    gsub(/\|\|/, ";", buf); gsub(/&&/, ";", buf)
    gsub(/[<$]\([ \t]*(curl|wget)[ \t]/, " __DLSUB__ ; curl ", buf)
    ns = split(buf, stmts, /[;&()`{}]/)
    for (s = 1; s <= ns; s++) {
      piped = 0
      np = split(stmts[s], stages, /\|/)
      for (k = 1; k <= np; k++) {
        nt = split(stages[k], t); i = 1; pre = 0; first = ""
        while (i <= nt) {
          if (t[i] ~ /^(sudo|doas|env|nohup|command|exec|time|nice|xargs)$/) { pre = 1; i++; continue }
          if (pre && t[i] ~ /^-/) { i++; continue }
          if (t[i] ~ /^[A-Za-z_][A-Za-z0-9_]*=/) { i++; continue }
          if (first == "") first = base(t[i])
          if (base(t[i]) ~ /^(sh|bash|zsh|dash|ksh)$/ && i < nt && t[i + 1] ~ /^-[a-z]*c$/) { i += 2; pre = 0; continue }
          break
        }
        if (is_interp(first)) for (j = 1; j <= nt; j++) if (t[j] == "__DLSUB__") { print "sub"; exit }
        if (i > nt) continue
        cmd = base(t[i])
        if (cmd == "curl" || cmd == "wget") {
          piped = 1
          for (j = i + 1; j <= nt; j++) if (t[j] !~ /^-/ && base(t[j]) != "") dl[base(t[j])] = 1
          continue
        }
        if (!is_interp(cmd)) continue
        if (piped) { print "pipe"; exit }
        for (j = i + 1; j <= nt; j++) if (t[j] !~ /^-/) { if (base(t[j]) in dl) { print "file"; exit } break }
      }
    }
  }')

case "$verdict" in
  sub) hook_block "Feeding a download into an interpreter is not allowed" ;;
  pipe) hook_block "Piping a download into an interpreter is not allowed" ;;
  file) hook_block "Executing a freshly downloaded script is not allowed" ;;
esac
exit 0
