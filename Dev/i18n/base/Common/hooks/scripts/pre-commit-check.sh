#!/usr/bin/env bash
# PreToolUse(Bash) : avant un `git [-C dir] commit`, refuse les fichiers sensibles
# (.env, clés, credentials…) et les secrets à fort signal (clé privée, AWS, GitHub, Slack).
# La détection du commit se fait ici (position de commande, corps de heredoc ignorés) :
# un matcher `Bash(git commit:*)` ne correspond jamais au nom d'outil.
# Si la commande contient aussi `git add` ou `commit -a`, les fichiers modifiés et non
# suivis sont examinés en plus de l'index (ils seront committés par cette même commande).
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_require_parser
hook_input
CMD=$(hook_get tool_input.command)
[ -n "$CMD" ] || exit 0
cwd=$(hook_get cwd)
[ -z "$cwd" ] || cd "$cwd" 2>/dev/null || exit 0

# Lignes émises : `commit`, `all` (commit -a), `add` (git add), `dir <chemin>` (git -C).
facts=$(printf '%s\n' "$CMD" | hook_strip_heredocs | tr "'\"" '  ' | awk '
  { buf = buf $0 ";" }
  END {
    ns = split(buf, stmts, /[;&|()`{}]/)
    for (s = 1; s <= ns; s++) {
      nt = split(stmts[s], t); i = 1
      while (i <= nt && (t[i] ~ /^(sudo|env|nohup|command|exec|time|nice)$/ || t[i] ~ /^[A-Za-z_][A-Za-z0-9_]*=/)) i++
      if (i > nt || t[i] != "git") continue
      dir = ""; j = i + 1
      while (j <= nt && t[j] ~ /^-/) {
        if (t[j] == "-C" && j < nt) { dir = t[j + 1]; j += 2 } else if (t[j] == "-c") j += 2; else j++
      }
      if (j > nt) continue
      if (t[j] == "add") print "add"
      if (t[j] != "commit") continue
      print "commit"
      if (dir != "") print "dir " dir
      for (k = j + 1; k <= nt; k++) if (t[k] == "--all" || t[k] ~ /^-[a-zA-Z]*a/ && t[k] !~ /^--/) print "all"
    }
  }')

case "$facts" in *commit*) ;; *) exit 0 ;; esac

dir=$(printf '%s\n' "$facts" | sed -n 's/^dir //p' | head -n 1)
[ -z "$dir" ] || cd "$dir" 2>/dev/null || exit 0
top=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$top" || exit 0

files=$(git diff --cached --name-only 2>/dev/null)
if printf '%s\n' "$facts" | grep -qxE 'add|all'; then
  files=$(printf '%s\n%s\n%s\n' "$files" "$(git diff --name-only HEAD 2>/dev/null)" "$(git ls-files -o --exclude-standard 2>/dev/null)")
fi
files=$(printf '%s\n' "$files" | sed '/^$/d' | sort -u)
[ -n "$files" ] || exit 0

existing=()
while IFS= read -r f; do
  if is_sensitive_path "$f"; then hook_block "Attempting to commit a sensitive file: $f"; fi
  [ -f "$f" ] && existing+=("$f")
done <<EOF
$files
EOF
[ ${#existing[@]} -gt 0 ] || exit 0

for p in '-----BEGIN [A-Z ]*PRIVATE KEY-----' 'AKIA[0-9A-Z]{16}' 'ghp_[A-Za-z0-9]{36}' 'xox[baprs]-[A-Za-z0-9-]{10,}'; do
  hit=$(grep -lIE -e "$p" -- "${existing[@]}" 2>/dev/null | head -n 1)
  [ -z "$hit" ] || hook_block "Potential secret detected in $hit"
done
exit 0
