# shellcheck shell=bash
# Bibliothèque commune des hooks Claude Code (sourcée, jamais exécutée).
#
# Contrat Claude Code : payload JSON sur stdin ; exit 2 + stderr = blocage ;
# seul hookSpecificOutput.additionalContext atteint le modèle (systemMessage = UI).
# jq est utilisé s'il est présent, sinon node (toujours là pour claude-craft).

HOOK_INPUT=""

hook_input() { HOOK_INPUT=$(cat); }

hook_has_jq() { command -v jq >/dev/null 2>&1; }

hook_has_parser() { hook_has_jq || command -v node >/dev/null 2>&1; }

# Valeur au chemin pointé (`tool_input.command`) ; objet/tableau => JSON compact.
hook_get() {
  if hook_has_jq; then
    printf '%s' "$HOOK_INPUT" | jq -r --arg p "$1" \
      'getpath($p | split(".")) // empty | if type == "string" then . else tojson end'
  else
    printf '%s' "$HOOK_INPUT" | node -e '
      let s = "";
      process.stdin.on("data", (d) => (s += d)).on("end", () => {
        let v = JSON.parse(s || "{}");
        for (const k of process.argv[1].split(".")) v = v == null ? undefined : v[k];
        if (v == null || v === false) return;
        process.stdout.write(typeof v === "string" ? v : JSON.stringify(v));
      });' "$1"
  fi
}

# hook_context <Event> <texte> : contexte additionnel visible par le modèle.
hook_context() {
  if hook_has_jq; then
    jq -cn --arg e "$1" --arg c "$2" '{hookSpecificOutput: {hookEventName: $e, additionalContext: $c}}'
  else
    node -e 'process.stdout.write(JSON.stringify({hookSpecificOutput: {hookEventName: process.argv[1], additionalContext: process.argv[2]}}) + "\n")' "$1" "$2"
  fi
}

# hook_replace_bash_output <stdout> <stderr> <interrupted:true|false> : PostToolUse(Bash),
# remplace ce que voit le modèle. updatedToolOutput doit avoir la forme de la sortie de
# l'outil : pour Bash {stdout, stderr, interrupted, isImage}.
hook_replace_bash_output() {
  if hook_has_jq; then
    jq -cn --arg o "$1" --arg e "$2" --argjson i "$3" \
      '{hookSpecificOutput: {hookEventName: "PostToolUse", updatedToolOutput: {stdout: $o, stderr: $e, interrupted: $i, isImage: false}}}'
  else
    node -e 'process.stdout.write(JSON.stringify({hookSpecificOutput: {hookEventName: "PostToolUse", updatedToolOutput: {stdout: process.argv[1], stderr: process.argv[2], interrupted: process.argv[3] === "true", isImage: false}}}) + "\n")' "$1" "$2" "$3"
  fi
}

# hook_stop_block <raison> : Stop/SubagentStop — empêche l'arrêt (JSON sur stdout, exit 0).
hook_stop_block() {
  if hook_has_jq; then
    jq -cn --arg r "$1" '{decision: "block", reason: $r}'
  else
    node -e 'process.stdout.write(JSON.stringify({decision: "block", reason: process.argv[1]}) + "\n")' "$1"
  fi
}

# hook_object <clé> <valeur> [<clé> <valeur>…] : objet JSON compact sur une ligne.
# Une valeur entière (^-?[0-9]+$) devient un nombre, le reste une chaîne échappée.
hook_object() {
  if hook_has_jq; then
    jq -cn '$ARGS.positional as $a | reduce range(0; $a | length; 2) as $i ({};
      .[$a[$i]] = ($a[$i + 1] | if test("^-?[0-9]+$") then tonumber else . end))' --args "$@"
  else
    node -e '
      const a = process.argv.slice(1), o = {};
      for (let i = 0; i < a.length; i += 2) o[a[i]] = /^-?[0-9]+$/.test(a[i + 1]) ? Number(a[i + 1]) : a[i + 1];
      process.stdout.write(JSON.stringify(o) + "\n");' "$@"
  fi
}

hook_block() {
  printf 'BLOCKED: %s\n' "$1" >&2
  exit 2
}

# Garde de sécurité sans parseur JSON : on bloque plutôt que de tout laisser passer.
hook_require_parser() {
  hook_has_parser || hook_block "hook requires jq or node to inspect the tool input"
}

# stdin -> stdout sans le corps des heredocs (`<<EOF`, `<<-'EOF'`) : ce sont des
# données (message de commit, fichier écrit), pas des commandes à analyser.
# Les here-strings `<<<` ne sont pas concernées.
hook_strip_heredocs() {
  awk '
    skip { t = $0; sub(/^[\t]+/, "", t); if (t == delim) skip = 0; next }
    {
      print
      rest = $0
      while (match(rest, /<<-?[ \t]*["\047]?[A-Za-z_][A-Za-z0-9_]*/)) {
        pre = substr(rest, RSTART - 1, 1); tok = substr(rest, RSTART, RLENGTH)
        rest = substr(rest, RSTART + RLENGTH)
        if (RSTART > 1 && pre == "<") continue
        if (substr(rest, 1, 1) == "<") continue
        sub(/^<<-?[ \t]*["\047]?/, "", tok); delim = tok; skip = 1
      }
    }'
}

# stdin (commande shell, heredocs déjà retirés) -> une ligne par segment :
#   "<sep>\t<segment>"  avec sep = ";" (nouvelle instruction), "|" (étage de pipe),
#   "(" (contenu d'une substitution $(…), <(…), `…` ; le segment parent porte __SUB__).
# Une chaîne citée est une donnée : ses blancs et séparateurs deviennent \037 et ne
# découpent rien (`grep 'rm -rf' f`, `git commit -m "a; sudo b"`). Elle redevient du
# code après `sh|bash|… -c` ou `eval`, et dans $(…) / `…` même entre guillemets doubles.
hook_shell_segments() {
  awk '
    function shell(w) { sub(/.*\//, "", w); return w ~ /^(sh|bash|zsh|dash|ksh)$/ }
    function code_quote(   w, k) {
      k = split(seg, w)
      return (k >= 1 && w[k] == "eval") || (k >= 2 && w[k] ~ /^-[a-z]*c$/ && shell(w[k - 1]))
    }
    function emit(next_sep) { print sep "\t" seg; seg = ""; sep = next_sep }
    function push(s) { st[++sp] = s }
    function pop() { if (sp > 0) sp-- }
    function data(ch) { seg = seg (ch ~ /[ \t\n;&|(){}<>`]/ ? "\037" : ch) }
    function open_sub(kind) { seg = seg " __SUB__ "; emit("("); push(kind) }
    { src = src $0 "\n" }
    END {
      sep = ";"; seg = ""; sp = 0; n = length(src); prev = ""; invar = 0
      for (i = 1; i <= n; i++) {
        c = substr(src, i, 1); nx = substr(src, i + 1, 1); ctx = sp ? st[sp] : "top"
        if (ctx == "sq") { if (c == "\047") pop(); else data(c); continue }
        if (ctx == "dq") {
          if (c == "\\") { data(nx); i++ }
          else if (c == "\"") pop()
          else if (c == "$" && nx == "(") { open_sub("sub"); i++ }
          else if (c == "`") open_sub("bt")
          else data(c)
          continue
        }
        # Contextes de code : top, sub (…), bt `…`, csq / cdq (quotes après -c / eval).
        if (c == "\\") { seg = seg nx; i++; continue }
        if (c == "\047") { if (ctx == "csq") pop(); else push(code_quote() ? "csq" : "sq"); continue }
        if (c == "\"") { if (ctx == "cdq") pop(); else push(code_quote() ? "cdq" : "dq"); continue }
        if (c == "`") { if (ctx == "bt") { pop(); emit(";") } else open_sub("bt"); continue }
        if ((c == "$" || c == "<" || c == ">") && nx == "(") { open_sub("sub"); i++; continue }
        if (c == "$" && nx == "{") { seg = seg "$"; invar = 1; i++; continue }
        if (c == "}" && invar) { invar = 0; continue }
        if (c == "(") { emit(";"); push("sub"); continue }
        if (c == ")") { if (ctx == "sub") pop(); emit(";"); continue }
        if (c == "|") { if (nx == "|") { i++; emit(";") } else emit("|"); continue }
        if (c == "&" && (prev == ">" || prev == "<" || nx == ">")) { seg = seg c; prev = c; continue }
        if (c == "&") { if (nx == "&") i++; emit(";"); continue }
        if (c == ";" || c == "\n" || c == "{" || c == "}") { emit(";"); continue }
        seg = seg c; prev = c
      }
      emit(";")
    }'
}

# Chemin sensible (secrets) ? Basename en minuscules + quelques dossiers connus.
# Les variantes d'exemple (.example, .sample, .template, .dist, .pub) sont sûres.
is_sensitive_path() {
  local p b
  p=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')
  b=${p##*/}
  case "$b" in
    *.example | *.sample | *.template | *.dist | *.defaults | *.pub) return 1 ;;
  esac
  case "$b" in
    .env | .env.* | .envrc | .npmrc | .netrc | .pgpass | .htpasswd | kubeconfig) return 0 ;;
    id_rsa | id_dsa | id_ecdsa | id_ed25519) return 0 ;;
    *.pem | *.key | *.p12 | *.pfx | *.jks | *.keystore) return 0 ;;
    credentials | credentials.json | secrets.yml | secrets.yaml | secrets.json | secrets.toml | secrets.env) return 0 ;;
  esac
  case "$p" in
    */.ssh/* | */.aws/* | */.gnupg/* | */.kube/config | */.docker/config.json) return 0 ;;
  esac
  return 1
}
