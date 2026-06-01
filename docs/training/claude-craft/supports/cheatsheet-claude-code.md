# Cheat Sheet : Claude Code 2.1.154

## Installation

```bash
npm install -g @anthropic-ai/claude-code
claude --version  # 2.1.154+
```

## Configuration

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Lancer une session

```bash
cd mon-projet
claude
```

---

## Commandes de base

| Commande | Description |
|----------|-------------|
| `/help` | Afficher l'aide |
| `/exit` ou `/quit` | Quitter Claude |
| `/clear` | Effacer le contexte |
| `/cost` | Afficher cout session |
| `/history` | Historique conversations |

## Commandes 2.1.154

| Commande | Description |
|----------|-------------|
| `/plan` | Mode exploration (lecture seule) |
| `/compact` | Compacter le contexte |
| `/doctor` | Diagnostiquer problemes |
| `/debug` | Troubleshoot session (v2.1.30+) |
| `/mcp` | Gerer serveurs MCP |
| `/config` | Configuration |
| `/teleport` | Teleporter session |
| `/release-notes` | Notes de version |
| `/skills` | Skills disponibles |
| `/keybindings` | Raccourcis clavier |
| `/tasks` | Gestion de taches |
| `/fast` | Toggle Fast Mode (Opus 4.6) |
| `/memory` | Apprentissages persistants (v2.1.59+) |
| `/effort` | Ajuster effort low/medium/high (v2.1.72+) |
| `/context` | Suggestions optimisation contexte (v2.1.74+) |
| `/loop` | Taches recurrentes (v2.1.71+) |
| `/model` | Changer de modele en session |

## Gestion du modele

| Commande | Description |
|----------|-------------|
| `/model` | Voir modele actif |
| `/model sonnet` | Sonnet (rapide) |
| `/model opus` | Opus (puissant) |
| `/model haiku` | Haiku (leger) |

## Gestion du contexte

| Commande | Description |
|----------|-------------|
| `/add fichier.php` | Ajouter fichier |
| `/add src/` | Ajouter repertoire |
| `/context` | Lister fichiers |
| `/remove fichier.php` | Retirer fichier |
| `/flatten src/` | Optimiser contexte |

---

## Plan Mode

```bash
/plan          # Activer (exploration)
/plan off      # Desactiver (normal)
```

Peut : lire fichiers, analyser, proposer plans.
Ne peut pas : modifier fichiers, executer bash.

> **Claude-Craft** : les commandes classifient automatiquement le plan mode requis (MANDATORY / RECOMMENDED / CONDITIONAL).

---

## Extended Thinking

```
think          # Reflexion legere
think hard     # Reflexion approfondie
think harder   # Reflexion intensive
ultrathink     # Reflexion maximale
```

---

## Background Tasks

```bash
/tasks run "Genere la doc API"
/tasks list
/tasks status <task-id>
/tasks output <task-id>
/tasks stop <task-id>
```

---

## Sub-agents

```
Task tool -> Agents en parallele
subagent_type: Explore, Plan, Bash,
               general-purpose
```

---

## Task Management (v2.1.19+)

| Outil | Description |
|-------|-------------|
| `TaskCreate` | Creer tache |
| `TaskGet` | Details tache |
| `TaskUpdate` | Mettre a jour / `deleted` |
| `TaskList` | Lister taches |

```
pending -> in_progress -> completed
                |
             deleted  (v2.1.20+)
Dependencies: blocks / blockedBy
```

---

## CLI Options

```bash
claude                   # Lancer
claude --add-dir /path   # CLAUDE.md additionnel
claude --from-pr 123     # Session liee PR
claude --from-pr <url>   # Session liee PR URL
```

---

## PR Integration (v2.1.27+)

| Statut PR | Indicateur |
|-----------|------------|
| Approved | approved |
| Pending | pending |
| Changes Requested | changes requested |
| Draft | draft |
| Merged | merged |

Auto-link via `gh pr create`.

---

## spinnerVerbs (v2.1.23+)

```json
{
  "spinnerVerbs": {
    "default": ["Thinking", "Processing"],
    "Edit": ["Editing", "Modifying"],
    "Bash": ["Running", "Executing"]
  }
}
```

Lie a `activeForm` dans TaskCreate.

---

## File Tools vs Bash (v2.1.21+)

| Tache | Preferer | Eviter |
|-------|----------|--------|
| Lire | `Read` | `cat/head/tail` |
| Editer | `Edit` | `sed/awk` |
| Ecrire | `Write` | `echo >/cat <<EOF` |
| Chercher fichiers | `Glob` | `find/ls` |
| Chercher contenu | `Grep` | `grep/rg` |

---

## Hooks

### Configuration (.claude/settings.json)

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write",
      "command": "echo 'Avant modification'"
    }],
    "PostToolUse": [{
      "matcher": "Write",
      "command": "php-cs-fixer fix $FILE_PATH"
    }]
  }
}
```

### Evenements disponibles (24 total, principaux ci-dessous)

| Event | Declencheur |
|-------|-------------|
| `PreToolUse` | Avant execution outil |
| `PostToolUse` | Apres succes outil |
| `PostToolUseFailure` | Apres echec outil |
| `PermissionRequest` | Demande permission |
| `UserPromptSubmit` | Soumission prompt |
| `Stop` | Fin reponse Claude |
| `SubagentStop` | Fin sous-agent |
| `SubagentStart` | Lancement sous-agent |
| `Notification` | Alertes |
| `PreCompact` | Avant compaction (exit 2 = bloquer) |
| `PostCompact` | Apres compaction (v2.1.76+) |
| `SessionStart` | Debut/reprise session |
| `SessionEnd` | Fin session |
| `Setup` | Premier lancement |
| `TeammateIdle` | Agent idle (v2.1.33+) |
| `TaskCompleted` | Tache terminee (v2.1.33+) |

### Variables hooks

| Variable | Description |
|----------|-------------|
| `$TOOL_NAME` | Nom de l'outil |
| `$TOOL_INPUT` | Parametres |
| `$FILE_PATH` | Chemin fichier |
| `$SESSION_COST` | Cout session |
| `$TOKEN_COUNT` | Tokens utilises |

---

## LSP Plugins (v2.1.46+)

| Stack | Plugin | Prerequis |
|-------|--------|-----------|
| PHP | `php-lsp` | `npm install -g intelephense` |
| Python | `pyright-lsp` | `pip install pyright` |
| TS/JS | `typescript-lsp` | `npm install -g @vtsls/language-server typescript` |
| Dart | `dart-analyzer` | Flutter SDK |
| C# | `csharp-lsp` | `dotnet tool install -g csharp-ls` |

```bash
/plugins install <name>@claude-plugins-official
```

---

## MCP (Model Context Protocol)

```bash
/mcp                      # Lister serveurs
MCP_TIMEOUT=30000         # Timeout en ms
claude mcp add \
  --client-id <id> \
  --client-secret <secret> \
  <server>                # OAuth (v2.1.30+)
```

---

## Permissions 3-tier

```
Deny  -> Toujours refuser
Allow -> Toujours autoriser
Ask   -> Demander (defaut)

Wildcards: Bash(*-h*), Write(src/**)
```

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+C` | Annuler generation |
| `Ctrl+D` | Quitter |
| `Up/Down` | Navigation historique |
| `Tab` | Autocompletion |
| `Shift+Tab` | Plan mode / Delegate |
| `Shift+Enter` | Nouvelle ligne |
| `Ctrl+B` | Background task |
| `Ctrl+L` | Effacer ecran |
| `Ctrl+R` | Recherche historique |

---

## Modeles disponibles

| Modele | Caracteristiques | Usage |
|--------|------------------|-------|
| **Sonnet 4.6** | Rapide, defaut | Quotidien |
| **Opus 4.8** | Flagship actuel, 1M ctx GA, effort `xhigh` | Complexe |
| **Opus 4.6** | Fast Mode uniquement (/fast) | Urgences |
| **Haiku 4.5** | Leger, economique | Simple |

## Limites de contexte

- Sonnet 4.6 / Haiku 4.5 : ~200K tokens
- Opus 4.8 : 1M tokens (GA, sans premium de prix)
- Opus 4.6 : 1M tokens
- Output max : 128K tokens (Opus 4.6/4.7)

## Tarification (2026)

| Modele | Input | Output |
|--------|-------|--------|
| Sonnet 4.6 | $3/M | $15/M |
| Opus 4.8 | $5/M | $25/M |
| Opus 4.6 | $5/M | $25/M |
| Haiku 4.5 | $1/M | $5/M |
| Opus 4.6 Fast | $30/M | $150/M |

---

## Fast Mode (v2.1.36+)

```bash
/fast    # Toggle on/off
```

Opus 4.6, 2.5x plus rapide, meme intelligence. Persiste entre sessions.

---

## Agent Teams (v2.1.32+)

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

| Outil | Description |
|-------|-------------|
| `TeamCreate` | Creer equipe |
| `SendMessage` | DM, broadcast, shutdown |
| `TaskCreate/Update/List/Get` | Taches partagees |

```
Shift+Up/Down    # Basculer entre agents
Shift+Tab        # Delegate mode
```

---

## Automatic Memory (v2.1.32+)

Declenchement : ~10K tokens. Mise a jour : ~5K tokens ou 3 tool calls.
Stockage : `~/.claude-profiles/<profile>/projects/<hash>/memory/`

---

## Autres nouveautes

| Feature | Version |
|---------|---------|
| Summarize from Here | v2.1.32+ |
| Auto Skill Loading (--add-dir) | v2.1.32+ |
| Skill Budget Scaling (2% ctx) | v2.1.32+ |
| --resume Agent Inheritance | v2.1.32+ |
| Agent Type Restrictions | v2.1.33+ |
| Agent Memory Frontmatter | v2.1.33+ |
| PDF pages: "1-5" (max 100p/20MB) | v2.1.30+ |
| Task Tool Metrics | v2.1.30+ |

---

## Nouveautes v2.1.42-2.1.45

| Feature | Version |
|---------|---------|
| Resume title fix | v2.1.42+ |
| Structured outputs header | v2.1.43+ |
| Auth token refresh | v2.1.44+ |
| Plugin hot-reload | v2.1.44+ |
| Memory improvements | v2.1.44+ |
| spinnerTipsOverride | v2.1.45+ |
| Plugin directory config | v2.1.45+ |
| Claude Sonnet 4.6 | v2.1.45+ |
| Agent SDK rate limiting | v2.1.45+ |

## Nouveautes v2.1.47-2.1.154

| Feature | Version |
|---------|---------|
| `/memory` persistent learnings | v2.1.59+ |
| `/effort` (low/medium/high) | v2.1.72+ |
| `/context` optimization suggestions | v2.1.74+ |
| PostCompact hook | v2.1.76+ |
| Agent frontmatter (effort, maxTurns) | v2.1.78+ |
| MCP Tool Search (lazy loading) | v2.1.80+ |
| `--bare` flag for scripting | v2.1.81+ |
| Managed settings.d/ | v2.1.83+ |
| Auto Mode permissions | v2.1.94+ |
| Subprocess sandboxing | v2.1.98+ |
| Monitor tool | v2.1.98+ |
| `/proactive` alias for `/loop` | v2.1.154+ |
| PreCompact blocking (exit 2) | v2.1.154+ |

## Correctifs v2.1.38-2.1.41

| Fix | Description |
|-----|-------------|
| Plan Mode | Crash si config manque champs |
| temperatureOverride | Plus ignore en streaming |
| LSP | Compatibilite shutdown/exit |
| Heredoc | "Bad substitution" template literals |
| Skills Sandbox | Ecriture `.claude/skills` bloquee |
| VSCode | Scroll, Tab, sessions dupliquees |
| Thai/Lao | Voyelles d'espacement |

---

## Ressources

- Docs : https://docs.anthropic.com/claude-code
- Pricing : https://anthropic.com/pricing
- Releases : https://docs.anthropic.com/claude-code/releases

---

**Formation Claude Code 2.1.154 + Claude-Craft 8.7.1**
**The Bearded CTO - 2026**
