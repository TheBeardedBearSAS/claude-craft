# Cheatsheet Configuration — Claude Code

> Reference configuration CLAUDE.md, hooks et permissions (Modules 2, 5)

---

## Structure `.claude/`

```
projet/
├── CLAUDE.md                  ← Instructions projet (equipe, commite)
├── CLAUDE.local.md            ← Instructions privees (non commite)
├── .claudeignore              ← Fichiers exclus du contexte
├── .claude/
│   ├── CLAUDE.md              ← Instructions detaillees (equipe)
│   ├── CLAUDE.local.md        ← Instructions privees detaillees
│   ├── settings.json          ← Permissions, hooks, MCP (equipe)
│   ├── rules/                 ← Regles detaillees (un fichier par sujet)
│   │   ├── 01-architecture.md
│   │   ├── 02-conventions.md
│   │   └── ...
│   ├── references/            ← Documentation technique
│   ├── commands/              ← Slash commands custom
│   └── context-essentials.md  ← Contexte critique (re-injection)
└── .gitignore                 ← Inclure CLAUDE.local.md
```

---

## 3 Niveaux CLAUDE.md

| Niveau | Emplacement | Portee | Taille max |
|--------|-------------|--------|------------|
| **Global** | `~/.claude/CLAUDE.md` | Tous les projets | < 50 lignes |
| **Projet** | `./CLAUDE.md` | Ce projet (commite) | < 100 lignes |
| **Detaille** | `./.claude/CLAUDE.md` | Ce projet (technique) | < 200 lignes |

**Priorite :** Global < Projet < Detaille (tous concatenes)

> **Regle d'or :** Chaque ligne supplementaire dans CLAUDE.md **dilue l'attention** sur les instructions existantes.

### CLAUDE.local.md

Instructions **privees**, NON commitees (ajouter au `.gitignore`).

Cas d'usage : chemins locaux, preferences IDE, overrides temporaires.

---

## References `@`

| Reference | Syntaxe | Description |
|-----------|---------|-------------|
| **Fichier** | `@fichier.ts` | Injecte le contenu du fichier |
| **Dossier** | `@src/components/` | Injecte l'arborescence du dossier |
| **URL** | `@https://example.com` | Injecte le contenu de la page web |

```bash
> Refactorise @src/services/auth.ts en suivant le pattern Strategy
> Implemente un composant selon @https://ui.shadcn.com/docs
```

---

## `.claudeignore`

Syntaxe identique a `.gitignore`. Exclut des fichiers du contexte Claude.

```gitignore
# Dependances
node_modules/
vendor/
.venv/

# Build
dist/
build/

# Fichiers volumineux
*.min.js
*.min.css
*.map
*.lock

# Secrets
.env
.env.*
*.key
*.pem
```

---

## Permissions (`settings.json`)

### 3 niveaux de settings

| Niveau | Emplacement | Priorite |
|--------|-------------|----------|
| **Entreprise** | `/etc/claude/settings.json` | Maximale |
| **Projet** | `.claude/settings.json` | Moyenne |
| **Global** | `~/.claude/settings.json` | Basse |

### Syntaxe des permissions

```
Outil(pattern)
```

| Outil | Description | Exemples |
|-------|-------------|----------|
| `Bash` | Commandes shell | `Bash(docker*)`, `Bash(npm test)` |
| `Write` | Ecriture fichiers | `Write(src/**)`, `Write(*.md)` |
| `Read` | Lecture fichiers | `Read(.env)` |
| `Edit` | Modification fichiers | `Edit(src/**)` |

### Wildcards

| Pattern | Signification |
|---------|--------------|
| `*` | N'importe quoi (1 niveau) |
| `**` | N'importe quoi (multi-niveaux) |
| `?` | Un seul caractere |

### Exemple complet settings.json

```json
{
  "permissions": {
    "allow": [
      "Bash(docker*)",
      "Bash(npm*)",
      "Bash(git status*)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Write(src/**)",
      "Write(tests/**)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(sudo*)",
      "Bash(git push --force*)",
      "Write(.env*)",
      "Write(*.key)"
    ]
  }
}
```

---

## Les 23 Evenements Hooks (v2.1.105)

| # | Evenement | Declencheur | Usage typique |
|---|-----------|-------------|---------------|
| 1 | `PreToolUse` | Avant execution d'un outil | Validation, securite |
| 2 | `PostToolUse` | Apres succes d'un outil | Lint, format |
| 3 | `PostToolUseFailure` | Apres echec d'un outil | Logging erreurs |
| 4 | `PermissionRequest` | Demande de permission | Controle d'acces |
| 5 | `PermissionDenied` | Permission refusee | Logging, alerting |
| 6 | `UserPromptSubmit` | Soumission prompt | Validation input |
| 7 | `Stop` | Fin de reponse Claude | Cleanup, rapport |
| 8 | `StopFailure` | Fin de reponse avec erreur | Logging, retry |
| 9 | `SubagentStop` | Fin d'un sous-agent | Agregation |
| 10 | `SubagentStart` | Lancement sous-agent | Logging |
| 11 | `TaskCreated` | Creation d'une tache | Tracking |
| 12 | `Notification` | Conditions d'alerte | Alertes Slack/Teams |
| 13 | `PreCompact` | Avant compaction | Sauvegarde etat |
| 14 | `PostCompact` | Apres compaction | Re-injection contexte |
| 15 | `SessionStart` | Debut/reprise session | Initialisation |
| 16 | `SessionEnd` | Fin de session | Cleanup |
| 17 | `Setup` | Premier lancement | Installation |
| 18 | `CwdChanged` | Changement repertoire | Recharge contexte |
| 19 | `FileChanged` | Modification fichier | Lint auto |
| 20 | `Elicitation` | Demande d'info utilisateur | Collecte structuree |
| 21 | `ElicitationResult` | Reponse elicitation | Traitement reponse |
| 22 | `TeammateIdle` | Teammate inactif | Reassignment |
| 23 | `TaskCompleted` | Tache terminee | Chainage |

**Proprietes avancees :** `if` conditionnel (v2.1.85+), `defer` (v2.1.89+), PreCompact blocking exit 2 (v2.1.105+)

### Structure d'un hook

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "php-cs-fixer fix $FILE_PATH"
      }
    ]
  }
}
```

### Variables d'environnement des hooks

| Variable | Description |
|----------|-------------|
| `$TOOL_NAME` | Nom de l'outil |
| `$TOOL_INPUT` | Input JSON de l'outil |
| `$TOOL_OUTPUT` | Output (PostToolUse uniquement) |
| `$SESSION_ID` | Identifiant de session |
| `$PROJECT_DIR` | Repertoire du projet |

### Exit codes

| Code | Signification | Effet |
|------|---------------|-------|
| `0` | Succes | Continue normalement |
| `1` | Echec non bloquant | Claude informe, continue |
| `2` | **Echec bloquant** | **Operation annulee** |

### Sorties

| Sortie | Destinataire |
|--------|-------------|
| **stdout** | Claude (le modele) |
| **stderr** | L'utilisateur (terminal) |

---

## Matchers specialises

### SessionStart

| Matcher | Declencheur |
|---------|-------------|
| `startup` | Nouvelle session |
| `resume` | Reprise session (`--resume`) |
| `clear` | Apres `/clear` |
| `compact` | Apres compaction |

### Notification

| Matcher | Declencheur |
|---------|-------------|
| `permission_prompt` | Claude demande une permission |
| `idle_prompt` | Claude attend une reponse |

### PreCompact

| Matcher | Declencheur |
|---------|-------------|
| `manual` | Via `/compact` |
| `auto` | Compaction automatique |

### Setup

| Matcher | Declencheur |
|---------|-------------|
| `init` | Premier lancement projet |
| `maintenance` | Avec `--init` ou `--maintenance` |

---

## Hooks Prompt-Based

Utilise Haiku 4.5 pour une validation intelligente (semantique) :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "type": "prompt",
        "prompt": "Verifie que le fichier ne contient pas de secrets. Si detecte: BLOCK, sinon: PASS."
      }
    ]
  }
}
```

---

## Cas d'usage hooks courants

### Lint automatique

```json
{
  "PostToolUse": [
    {
      "matcher": "Write",
      "command": "FILE=$(echo $TOOL_INPUT | jq -r '.file_path'); npx eslint --fix \"$FILE\" 2>/dev/null"
    }
  ]
}
```

### Blocage commandes dangereuses

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "command": "COMMAND=$(echo $TOOL_INPUT | jq -r '.command'); if echo \"$COMMAND\" | grep -qE 'rm\\s+-rf'; then echo 'BLOQUE' >&2; exit 2; fi; exit 0"
    }
  ]
}
```

### Re-injection contexte apres compaction

```json
{
  "SessionStart": [
    {
      "matcher": "compact",
      "command": "cat .claude/context-essentials.md"
    }
  ]
}
```

---

## Slash Commands Custom

### Emplacement

```
.claude/commands/
  audit.md           → /project:audit
  review.md          → /project:review
  deploy-check.md    → /project:deploy-check
```

### Variables

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | Texte passe apres la commande |
| `$SELECTION` | Code selectionne dans l'IDE |

### Exemple : `.claude/commands/audit.md`

```markdown
Realise un audit complet du projet :
1. Architecture : structure et separation des couches
2. Qualite : linters et analyseurs statiques
3. Tests : couverture et qualite
4. Securite : vulnerabilites et secrets
5. Documentation : a jour ?

Score sur 10 par categorie + plan d'action.

$ARGUMENTS
```

---

## CLAUDE.md vs Rules vs Hooks

| Mecanisme | Force | Comportement |
|-----------|-------|--------------|
| **CLAUDE.md** | Suggestion | Claude peut ignorer |
| **Rules** | Suggestion forte | Priorise mais pas garanti |
| **Hooks** | **Enforcement** | Execution automatique, bloquant |

> **Regle :** CLAUDE.md = suggestions. **Hooks = requirements.**

---

**Formation Claude Code** | The Bearded Bear | Fevrier 2026
