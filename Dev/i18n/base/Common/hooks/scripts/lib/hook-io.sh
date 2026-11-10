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
