# Claude Code Compatibility — Claude Craft v8.19.2

**Minimum Version:** 2.1.97 (elevated from 2.1.47 — see [rationale](#why-we-elevated-minimum-from-2147-to-2197))
**Recommended Version:** 2.1.193 (Opus 4.8, Artifacts, `claude mcp login`, `/cd`, nested subagents — Week 26, June 26, 2026)
**Tested up to:** 2.1.193 (June 26, 2026)
**Last Updated:** 2026-06-30

---

## Table des matières

1. [Version Requirements](#version-requirements)
2. [OS Support](#os-support)
3. [Node.js Support](#nodejs-support)
4. [Why We Elevated Minimum from 2.1.47 to 2.1.97](#why-we-elevated-minimum-from-2147-to-2197)
5. [Feature Adoption Status](#feature-adoption-status)
6. [Features 2.1.105–2.1.117 Available](#features-21105-21117-available)
7. [Features 2.1.119 → 2.1.145 (May 2026)](#features-21119--21145-may-2026)
8. [Migration from < 2.1.97](#migration-from--2197)
9. [Version History Summary](#version-history-summary)

---

## Version Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Minimum** | 2.1.97 | Security baseline — CVE-2025-59536 patched |
| **Recommended** | 2.1.193 | Full feature set, Opus 4.8, Artifacts, `claude mcp login/logout`, `/cd`, nested subagents (5 levels), `/rewind` post-`/clear`, `fallbackModel`, native CLI binary |
| **`claude mcp login` / `logout`** | 2.1.185+ | Authenticate/clear an MCP server's credentials from the shell instead of `/mcp` |
| **Artifacts** | 2.1.178+ | Live shareable page from a session (beta, Team/Enterprise) |
| **`/cd`** | 2.1.166+ | Move session working dir without rebuilding the prompt cache |
| **Nested subagents** | 2.1.166+ | A subagent can spawn its own subagents (background chains capped at 5 levels) |
| **`fallbackModel`** | 2.1.166+ | Up to 3 fallback models when primary overloaded/unavailable |
| **`ultracode` trigger** | 2.1.160+ | ⚠️ BREAKING — renamed from `workflow` (Dynamic Workflows) |
| **Managed `requiredMinimum/MaximumVersion`** | 2.1.163+ | Enterprise version enforcement |
| **MCP + Hooks production** | 2.1.97+ | Mandatory for secure MCP usage |
| **Agent Teams** | 2.1.32+ (experimental) | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| **Auto Mode** | 2.1.94+ | Team plan required |
| **Opus 4.7** | 2.1.111+ | xhigh effort, adaptive thinking |
| **Opus 4.8** | 2.1.154+ | Flagship (28 mai 2026), high effort par défaut, fast mode, Dynamic Workflows |
| **Sonnet 5** | 2026-06-30 | `claude-sonnet-5` — modèle agentique, comble l'écart avec Opus 4.8 ; **Sonnet courant** (remplace 4.6). Intro $2/$10 → $3/$15 au 2026-08-31. Défaut Free/Pro, dispo Claude Code |
| **Fable 5 / Mythos 5** | ⚠️ SUSPENDUS | Access coupé le 2026-06-12 par une directive export-control US (toujours offline). **Ne pas recommander `claude-fable-5` / `claude-mythos-5`.** Router les agents créatifs vers Opus 4.8 / Sonnet 5. |
| **Forked subagents** | 2.1.117 | `CLAUDE_CODE_FORK_SUBAGENT=1` |

---

## OS Support

| Operating System | Status | Notes |
|-----------------|--------|-------|
| **Linux** (Ubuntu 20.04+, Debian 11+, Fedora 36+) | Supported | Recommended for CI/CD |
| **macOS** (12 Monterey+) | Supported | Native ARM64 + x86_64 |
| **Windows** | WSL only | WSL2 + Ubuntu recommended. Native Windows support is experimental and incomplete. PowerShell tool opt-in via `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` (v2.1.84+). |
| **Windows ARM64** | WSL only | Native win32-arm64 binary exists (v2.1.41+) but Claude Craft scripts require POSIX shell. |

> **Note WSL:** Toutes les commandes shell du framework supposent un environnement POSIX (bash/zsh). Sur Windows natif sans WSL, les scripts `.sh` ne s'exécutent pas correctement.

---

## Node.js Support

| Version | Status | Notes |
|---------|--------|-------|
| **Node.js 18.x** | Not supported | EOL depuis avril 2025 |
| **Node.js 20.x LTS** | Supported | Version minimale (`engines.node: >=20.0.0`) |
| **Node.js 22.x LTS** | Recommended | CI/CD cible principale depuis claude-craft v8.2.1 |
| **Node.js 24.x** | Cutting-edge | Compatible, non testé en CI — peut présenter des breaking changes |

---

## Why We Elevated Minimum from 2.1.47 to 2.1.97

### CVE-2025-59536 — RCE via Claude Code Project Files

**Sévérité :** Critique (CVSS 9.1)
**Source :** [Check Point Research — avril 2026](https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/)
**Patché dans :** v2.1.51 (initial) → v2.1.97 (hardening complet)

#### Description de la vulnérabilité

CVE-2025-59536 permet à un fichier de projet malveillant (CLAUDE.md, `.claude/agents/`, fichiers MCP) d'injecter des commandes arbitraires dans le pipeline de hooks de Claude Code, conduisant à :

- **Remote Code Execution (RCE)** : exécution de commandes système lors de l'ouverture d'un projet compromis
- **API Token Exfiltration** : vol du token Anthropic via des redirections réseau dans les hooks PostToolUse
- **Path Traversal** : accès à des fichiers hors du répertoire de travail via des références de hooks malformées

#### Vecteur d'attaque

```
Projet malveillant cloné (GitHub, npm install)
  → CLAUDE.md contient des instructions d'injection de hook
  → Hook pipeline exécute commandes sans sanitization
  → RCE / exfiltration token API
```

#### Fixes cumulatifs (v2.1.51 → v2.1.97)

| Version | Fix |
|---------|-----|
| v2.1.51 | Hook command injection initial fix — input sanitization |
| v2.1.51 | CVE-2026-21852 — Path traversal dans la résolution des fichiers hooks |
| v2.1.97 | Compound command bypass dans Bash tool (contournait les règles de permission) |
| v2.1.97 | Network redirect bypass dans Bash tool |
| v2.1.97 | Prototype pollution dans les règles de permission |
| v2.1.98 | Env-var prefix injection dans Bash tool |
| v2.1.98 | Subprocess sandboxing avec PID namespace isolation (Linux) |
| v2.1.101 | POSIX `which` fallback command injection |

#### Pourquoi 2.1.97 et non 2.1.51 ?

Le fix initial (v2.1.51) était incomplet : les versions v2.1.52–v2.1.96 présentaient encore des vecteurs de contournement documentés. v2.1.97 représente le point où **l'ensemble du surface d'attaque identifié est couvert** avec des tests de régression en place.

#### Recommandation

**Si vous utilisez MCP servers, hooks, ou chargez des projets tiers : v2.1.97 minimum est non-négociable.**

---

## Feature Adoption Status

Statut d'adoption des principales features Claude Code 2.1.x dans Claude Craft :

| Feature | Version CC | Status | Notes |
|---------|-----------|--------|-------|
| LSP Plugins (php-lsp, typescript-lsp, etc.) | 2.1.46+ | **Adopted** | Documenté dans PREREQUISITES.md |
| Hook Events (TeammateIdle, TaskCompleted) | 2.1.33+ | **Adopted** | Utilisé dans team:delivery |
| Agent Frontmatter (effort, maxTurns) | 2.1.78+ | **Adopted** | Agents `.claude/agents/*.md` |
| PostCompact Hook | 2.1.76+ | **Adopted** | Template hooks/pre-compact.sh |
| `/memory` command | 2.1.59+ | **Adopted** | Documenté dans context-management |
| `/effort` command | 2.1.70+ | **Adopted** | Référencé dans training docs |
| Auto Mode | 2.1.94+ | **Adopted** | Référencé dans CLAUDE.md |
| Monitor Tool | 2.1.97+ | **Adopted** | Background process events |
| `/btw` command | 2.1.105+ | **Adopted** | Documenté dans context-management |
| `/hooks` command | 2.1.105+ | **Adopted** | Documenté dans context-management |
| `/reload-plugins` | 2.1.105+ | **Adopted** | Documenté dans context-management |
| `/proactive` alias | 2.1.105+ | **Adopted** | Alias pour `/loop` |
| Push Notifications | 2.1.110+ | **Adopted** | Intégré — alertes fin de tâche longue (ralph-run) ; version exacte confirmée : 2.1.110 |
| Forked Subagents | 2.1.117 | **Adopted** | `CLAUDE_CODE_FORK_SUBAGENT=1` activé dans setup-rtk (audit 2026-05-18 QW-06) |
| Skill `context: fork` | 2.1.105+ | **Adopted** | 17 skills lourds utilisent `context: fork` (cf. rules/12-context-management.md) |
| Auto-load plugins `.claude/skills/` | 2.1.157+ | **Partially Adopted** | Le framework installe dans `.claude/skills/` ; auto-load à documenter (CLI-REFERENCE) |
| `/reload-skills` + `reloadSkills:true` | 2.1.157+ | **Not Adopted** | Distinct de `/reload-plugins` ; documenter (rule 12, templates hooks) |
| Hook `MessageDisplay` | 2.1.157+ | **Not Documented** | Filtrage/transformation output assistant (cas RTK-style) |
| Trigger `ultracode` (ex-`workflow`) | 2.1.160+ | **Action** | ⚠️ BREAKING — renommage du déclencheur Dynamic Workflows |
| `requiredMinimum/MaximumVersion` | 2.1.163+ | **Not Documented** | Enforcement de version (enterprise) |
| **`fallbackModel`** | 2.1.166+ | **Adopted** | Jusqu'à 3 modèles de repli — `settings.local.json.example` + rule 12 |

**Légende :**
- **Adopted** : Intégré et documenté dans Claude Craft
- **Partially Adopted** : Mécanisme présent mais pas pleinement documenté
- **Not Documented / Not Adopted** : Disponible côté CC, pas encore repris ici
- **Action** : Changement (souvent breaking) nécessitant une mise à jour du contenu
- **Planned** : Sur la roadmap, pas encore intégré
- **N/A** : Évalué, non retenu ou sans cas d'usage pertinent

---

## Features 2.1.105–2.1.117 Available

Détail des features disponibles dans la fenêtre 2.1.105–2.1.117 pour les utilisateurs de Claude Craft :

### 2.1.105 — Commandes et skills avancés

| Feature | Commande / Config | Usage Claude Craft |
|---------|------------------|-------------------|
| `/btw` | `/btw <question>` | Questions rapides sans changer le contexte (syntaxe, lookups) |
| `/hooks` | `/hooks` | Gérer et déboguer les hooks interactivement |
| `/reload-plugins` | `/reload-plugins` | Recharger les plugins après mise à jour |
| `context: fork` | Frontmatter skill | Exécuter une skill dans un contexte isolé |
| `disable-model-invocation: true` | Frontmatter skill | Empêcher l'invocation automatique |
| `claudeMdExcludes` | settings.json | Exclure des CLAUDE.md dans les monorepos |
| PreCompact hook blocking | Exit code 2 | Bloquer la compaction pour préserver le contexte critique |
| Auto-compaction skill reload | Automatique | Les skills se rechargent (5K tokens/skill, 25K total max) |

### 2.1.108 — Prompt caching et session

| Feature | Config / Commande | Usage Claude Craft |
|---------|------------------|-------------------|
| `ENABLE_PROMPT_CACHING_1H` | Variable d'env | Cache prompt 1 heure — réduction coût token |
| `FORCE_PROMPT_CACHING_5M` | Variable d'env | Force cache 5 min — sessions courtes |
| `/recap` | `/recap` | Résumé de progression de session |
| `/undo` | `/undo` | Alias pour `/rewind` |

### 2.1.110 — Push Notifications et sécurité

| Feature | Description | Usage Claude Craft |
|---------|-------------|-------------------|
| Push Notifications Tool | Notifications système natives | Alertes fin de tâche longue (ralph-run) |
| `/tui` command | Terminal UI configurée | Interface TUI optionnelle |
| PermissionRequest hook re-check | Sécurité renforcée | Hooks de permission plus fiables |

### 2.1.111 — Opus 4.7 et `xhigh` effort

| Feature | Description | Usage Claude Craft |
|---------|-------------|-------------------|
| Opus 4.7 (`claude-opus-4-7`) | Nouveau flagship | Agents architecture, sécurité |
| `xhigh` effort level | Nouveau palier au-dessus de `high` | Agents complexes (ralph-conductor) |
| `/effort` slider interactif | Picker effort niveau | Adapté aux tâches complexes |
| `/ultrareview` | Code review multi-agent parallèle | Complète `/team:audit` |
| Auto Mode sur Opus 4.7 | Max subscribers | Classifier de permissions |

### 2.1.113 — Native CLI et sécurité renforcée

| Feature | Description | Usage Claude Craft |
|---------|-------------|-------------------|
| Native CLI binary | Binaire natif (remplace JS bundle) | Démarrage plus rapide |
| `/btw`, `/hooks`, `/reload-plugins`, `/proactive` | Nouvelles commandes | Voir 2.1.105 (backport release) |
| Bash deny rules renforcées | `env`/`sudo`/`watch` wrappers protégés | Sécurité hooks |
| `sandbox.network.deniedDomains` | Nouveau setting | Filtrage réseau granulaire |

### 2.1.117 — Forked Subagents et optimisations

| Feature | Description | Usage Claude Craft |
|---------|-------------|-------------------|
| Forked Subagents | `CLAUDE_CODE_FORK_SUBAGENT=1` — contextes isolés | **Activé** via `/common:setup-rtk` (audit 2026-05-18 QW-06) |
| `/resume` 67% faster | Sessions > 40 MB | Reprise sessions longues |
| Concurrent MCP connections | Par défaut — démarrage plus rapide | Multi-MCP setups |
| Native `Glob`/`Grep` (bfs/ugrep) | Embedded binaires | Performance recherche fichiers |
| Forked skill `context: fork` | Combiné avec forked subagents | Isolation complète contexte skill |

### 2.1.118 — Env vars complémentaires (avril 2026)

| Variable / Feature | Description | Usage Claude Craft |
|---------|-------------|-------------------|
| `CLAUDE_CODE_FORK_SUBAGENT=1` | Active les sous-agents avec contextes isolés (forked) | Recommandé via `/common:setup-rtk` |
| `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` | Bascule les sous-agents vers Sonnet 4.6 (cost saving) | Recommandé via `/common:setup-rtk` |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` | Désactive la mémoire automatique inter-sessions | Utile si `/memory` est géré manuellement |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | Charge CLAUDE.md depuis `--add-dir` | Monorepos |
| `MAX_THINKING_TOKENS=8000` | Limite tokens de reflexion adaptive | Tâches simples → coût réduit |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Budget caractères slash commands | Commands longues (`/team:audit`) |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` | PowerShell au lieu de Bash (Windows, ajouté v2.1.84+) | WSL2 fallback Windows |
| `ENABLE_PROMPT_CACHING_1H` | Cache prompt 1 heure | Sessions répétitives, -40% coût |
| `FORCE_PROMPT_CACHING_5M` | Force cache 5 min | Sessions courtes |
| `OTEL_LOG_USER_PROMPTS` | Log prompts dans traces (beta) | Observabilité |
| `OTEL_LOG_TOOL_DETAILS` / `OTEL_LOG_TOOL_CONTENT` | Log détails/contenu outils (beta, verbose) | Audit / debug |

---

## Features 2.1.119 → 2.1.145 (May 2026)

Features available in Claude Code 2.1.119–2.1.145 and their adoption status in Claude Craft v8.7.1.

### 2.1.119 (April 23, 2026) — Settings persistence & hooks enrichis

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `/config` settings persist | Theme, editor mode, verbose → `~/.claude/settings.json` avec override precedence | **Documented** |
| `prUrlTemplate` setting | URL custom pour code-review | **Not exploited** |
| `CLAUDE_CODE_HIDE_CWD` | Masque le répertoire courant | **Not documented** |
| `--from-pr` étendu | GitLab MR + Bitbucket PR + GitHub Enterprise | **N/A** (feature CLI) |
| `--print` honors frontmatter | Respecte `tools:` et `disallowedTools:` en mode non-interactif | **Not documented** |
| Hooks `duration_ms` | Durée d'exécution dans PostToolUse | **Not exploited** |
| OTel: `stop_reason`, `finish_reasons`, `user_system_prompt` | Enrichissement spans LLM | **Not documented** |

### 2.1.120 (April 28, 2026) — ultrareview CI & skills effort

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `claude ultrareview [target]` | Sous-commande non-interactive pour CI/scripts (`--json`) | **Documented** in COMPATIBILITY.md — not in `/team:*` commands |
| `${CLAUDE_EFFORT}` dans skills | Skills peuvent référencer le niveau d'effort courant | **Not exploited** — opportunities in adaptive skills |
| Git for Windows non requis | PowerShell fallback automatique | **N/A** (user env) |
| `AI_AGENT` env var | Positionné pour les sous-processus | **Not documented** |

### 2.1.121 (April 28, 2026) — MCP `alwaysLoad` & PostToolUse enrichi

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `alwaysLoad` MCP server config | Servers non-différés (chargement immédiat) | **Not documented** |
| PostToolUse replace tool output | Hooks peuvent remplacer l'output de **tous** les outils | **Adopté** (v8.19.1) — `templates/hooks/output-filter.json` tronque réellement les outputs >50KB via `hookSpecificOutput.updatedToolOutput` |
| `claude plugin prune` | Nettoyer les dépendances orphelines | **N/A** (user CLI) |
| Type-to-filter dans `/skills` | Recherche dans le picker de skills | **N/A** (user feature) |

### 2.1.126 (May 1, 2026) — OTEL skill tracking & project purge

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `claude.skill_activated` OTEL event | Event avec `invocation_trigger` attribute | **NOT EXPLOITED** — P1 : `@observability-engineer` devrait le documenter |
| `claude project purge [path]` | Supprime tout l'état Claude Code d'un projet | **Not documented** |
| Auto mode spinner rouge | Indicateur visuel sur stall permission | **N/A** (user feature) |

### 2.1.129 (May 6, 2026) — skillOverrides & OTEL metrics

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `skillOverrides` setting | `off` \| `user-invocable-only` \| `name-only` — contrôle visibilité skills dans les sessions Claude Code. `off` = tous les skills visibles (défaut). `user-invocable-only` = seuls les skills avec `invocable: user` sont proposés à l'utilisateur. `name-only` = affiche uniquement le nom sans description. Configurer dans `settings.json` : `{"skillOverrides": "user-invocable-only"}` | **DOCUMENTED HERE** — Voir aussi `rules/12-context-management.md` (P1 ouvert) |
| `--plugin-url <url>` | Installer plugin depuis URL directe | **N/A** (user CLI) |
| `ENABLE_GATEWAY_MODEL_DISCOVERY=1` | Découverte modèles via gateway `/v1/models` | **Not documented** |
| `claude_code.pull_request.count` OTel | Comptage PRs via MCP | **Not exploited** |

### 2.1.133 (May 7, 2026) — parentSettingsBehavior & hooks effort

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `parentSettingsBehavior` | Admin key : `'first-wins'` \| `'merge'` pour hiérarchie settings | **NOT DOCUMENTED** — P2 |
| Hooks `effort.level` JSON + `$CLAUDE_EFFORT` | Hooks reçoivent le niveau d'effort courant | **NOT EXPLOITED** — P2 : permet des hooks adaptatifs selon la complexité |
| `worktree.baseRef` | `fresh` \| `head` pour stratégie worktree | **Not documented** |
| `sandbox.bwrapPath` / `sandbox.socatPath` | Chemins binaires custom sandbox | **N/A** |

### 2.1.139 (May 11, 2026) — /goal & Agent View

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| **`/goal` command** | Définir condition de completion — Claude travaille jusqu'à ce qu'elle soit atteinte | **NOT INTEGRATED** — P1 : intégrer dans `ralph-run.md` comme alternative native aux DoD validators |
| **`claude agents` command** | Agent View : liste unique de toutes les sessions actives | **NOT DOCUMENTED** — P1 : pertinent pour `/team:*` et `/team:sprint` |
| `/scroll-speed` | Tuning vitesse scroll souris | **N/A** |
| `claude plugin details <name>` | Inventaire composants + coût token | **N/A** |
| Hook `args: string[]` field | Exec form sans shell | **Not documented** |

### 2.1.141 (May 13, 2026) — terminalSequence & ANTHROPIC_WORKSPACE_ID

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `terminalSequence` field | Champ dans hook JSON output pour notifications desktop | **NOT DOCUMENTED** — P2 |
| `ANTHROPIC_WORKSPACE_ID` | Workload identity federation | **Not documented** |
| `claude agents --cwd <path>` | Filtrer sessions par répertoire | **N/A** |
| "Summarize up to here" (Rewind) | Compression contexte à un point précis | **N/A** |

### 2.1.143 (May 15, 2026) — worktree.bgIsolation & plugin deps

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `worktree.bgIsolation: "none"` | Sessions background éditent directement le working copy (sans worktree auto) | **NOT DOCUMENTED** — P2 : mentionner dans `parallel-worktrees` skill |
| Plugin dependency enforcement | `claude plugin disable` refuse si dépendances existent | **N/A** |
| `/plugin` marketplace avec coûts | Context cost estimates dans marketplace | **N/A** |
| `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` | Cap de 8 blocs pour les stop hooks | **Not documented** |
| PowerShell `-ExecutionPolicy Bypass` | Auto-approuve les scripts PS | **N/A** |

### 2.1.145 (May 19, 2026) — JSON agents & OTEL spans

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `claude agents --json` | Lister sessions actives comme JSON | **NOT DOCUMENTED** — P1 : utile pour `/team:*` automation |
| Agent + parent agent IDs dans spans OTEL | Traçabilité multi-agents | **NOT EXPLOITED** — P2 : `@observability-engineer` |
| Stop/SubagentStop hooks : `background_tasks`, `session_crons` | Champs additionnels dans hook input | **NOT DOCUMENTED** — P2 |
| `/plugin` Discover/Browse enrichi | Commandes, agents, skills, hooks, MCP/LSP visibles | **N/A** |

### 2.1.147 (May 22, 2026) — /code-review rename & background sessions

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `/code-review` (rename de `/simplify`) | `/code-review --fix` applique les corrections au working tree ; `/code-review ultra` lance une revue cloud multi-agents | **Documented** — alias `/ultrareview` déprécié, voir README |
| Sessions background pinned | Les sessions en arrière-plan restent épinglées dans l'UI | **N/A** (user feature) |

### 2.1.149 (May 25, 2026) — /usage

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `/usage` | Affiche la consommation de tokens/coût de la session courante (attribution par composant depuis 2.1.149) | **Documenté** — `rules/12` (Suivi des tokens) + `docs/CLI-REFERENCE.md` |

### 2.1.152 (May 27, 2026) — disallowed-tools frontmatter & /code-review --fix

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| `disallowed-tools` (kebab-case) frontmatter | Variante kebab-case de `disallowedTools` (camelCase) — les deux formes sont acceptées ; les agents Claude Craft utilisent `disallowedTools` | **Documented** — voir docs/AGENTS.md |
| `/code-review --fix` | Applique automatiquement les findings de la revue | **N/A** (user CLI) |

### 2.1.154 (May 28, 2026) — Opus 4.8 & Dynamic Workflows ⭐

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| **Claude Opus 4.8** (`claude-opus-4-8`) | Nouveau modèle flagship, même prix qu'Opus 4.7, **défaut effort `high`** + `/effort xhigh` pour les tâches les plus dures. Disponible API/Bedrock/Vertex/Foundry | **Recommandé** — modèle cible pour agents `effort: xhigh`/`max` (security-auditor, migration-specialist, database-architect, ralph-conductor) |
| **Dynamic Workflows** | Demander à Claude de créer un workflow qui orchestre **des dizaines à des centaines d'agents** en arrière-plan (cap 1000 subagents). Visible via `/workflows` | **Adopté** (v8.19.1) — skill [`dynamic-workflows`](../skills/dynamic-workflows/SKILL.md) : 3 paliers d'orchestration, patterns (fan-out, vérification adversariale, pipeline, loop-until-dry), monitoring `/workflows` |
| Fast mode moins cher sur Opus 4.8 | 2× le tarif standard pour 2,5× la vitesse | **N/A** (user pricing) |
| `effort: max` | 5ᵉ niveau d'effort (au-dessus de `xhigh`), disponible sur Opus 4.8 | **Documented** — voir docs/AGENTS.md tableau effort |
| `/effort ultracode` | Nouveau palier effort introduit avec Dynamic Workflows / Opus 4.8 — mode optimisé débit code (vitesse maximale, idéal pipelines automatisés) ; équivalent `effort: max` en CLI | **Documented** — documenter dans `rules/12-context-management.md` tableau efforts |

> **Note Opus 4.8 :** L'ID de modèle est `claude-opus-4-8`. Pour les agents critiques (audits sécurité, migrations, décisions schéma, boucles autonomes), `model: opus` + `effort: xhigh` route désormais vers Opus 4.8. Le `model: sonnet` des reviewers tech reste optimal pour le ratio coût/qualité (routing économe).

> **Note Dynamic Workflows vs `/team:*` :** Les commandes `/team:audit`, `/team:sprint`, `/team:security` restent valides (orchestration documentée déclarative). Dynamic Workflows offre en plus une orchestration **programmatique** (boucles, fan-out conditionnel, pipelines, vérification adversariale) pour les tâches dépassant un seul contexte. À évaluer pour v8.8.

---

### 2.1.157 → 2.1.168 (June 2026)

| Version | Feature | Description | Adoption Claude Craft |
|---------|---------|-------------|----------------------|
| **2.1.157** | Auto-load plugins `.claude/skills/` | Les plugins déposés dans `.claude/skills/` sont chargés automatiquement (sans marketplace) ; `claude plugin init <name>` scaffolde un plugin | **Partially Adopted** — le framework installe déjà dans `.claude/skills/` ; documenter l'auto-load dans CLI-REFERENCE |
| **2.1.157** | `/reload-skills` + `SessionStart reloadSkills:true` | Re-scan des skills sans redémarrage ; un hook SessionStart peut rendre disponibles les skills qu'il installe dans la même session | **Not Adopted** — distinct de `/reload-plugins` ; documenter dans rule 12 + templates hooks |
| **2.1.157** | Hook `MessageDisplay` | Nouvel événement permettant de transformer/masquer le texte assistant à l'affichage | **Not Documented** — pertinent pour un filtrage RTK-style ; ajouter à la matrice Hooks × Surfaces |
| **2.1.160** ⚠️ | **BREAKING : trigger `workflow` → `ultracode`** | Le mot-clé déclencheur des Dynamic Workflows passe de `workflow` à **`ultracode`**. Demander un workflow « avec ses propres mots » fonctionne toujours. `/effort ultracode` corrigé (ne blâme plus le réglage Dynamic Workflows quand le modèle ne supporte pas xhigh) | **Action** — toute doc/skill mentionnant le trigger `workflow` doit utiliser `ultracode` |
| **2.1.160** | grep satisfait read-before-edit | Les fichiers vus via grep/egrep/fgrep satisfont le contrôle read-before-edit (édition directe après confirmation de la section) | **N/A** (comportement runtime) |
| **2.1.160** | Confirmation écriture shell startup | Prompt de confirmation avant d'écrire dans les fichiers d'init shell (`.bashrc`, etc.) | **Sécurité** — cohérent avec les hooks PreToolUse du framework |
| **2.1.163** | `requiredMinimumVersion` / `requiredMaximumVersion` | Managed settings d'enforcement de version (déploiements enterprise/équipe) | **Not Documented** — alternative au minimum manuel ; mentionner en Version Requirements |
| **2.1.166** | **`fallbackModel`** | Configurer jusqu'à **3 modèles de repli** essayés dans l'ordre quand le primaire est surchargé/indisponible ; `--fallback-model` s'applique aussi aux sessions interactives ; retry une fois sur le fallback en cas d'erreur non-retryable inattendue | **Adopted** — voir `settings.local.json.example` + rule 12 (repli `opus → sonnet → haiku` recommandé pour les agents critiques) |
| **2.1.168** | Stable recommandée | Durcissement sécurité des messages cross-session (les messages relayés via `SendMessage` ne portent plus l'autorité utilisateur), retries améliorés, filtrage agents | **Recommended** — version cible Claude Craft v8.9.x |

> **⚠️ Migration `workflow` → `ultracode` (2.1.160) :** le déclencheur des Dynamic Workflows a été renommé. Claude Craft mentionne `/effort ultracode` (palier effort) — cohérent. Tout contenu invitant à « lancer un workflow » par le mot-clé `workflow` doit être mis à jour vers `ultracode`.

> **Note `fallbackModel` :** réglage de fiabilité ET de coût. Pour les 4 agents `opus` (security-auditor, database-architect, migration-specialist, ralph-conductor), un repli `["claude-sonnet-5", "claude-haiku-4-5-20251001"]` évite les interruptions en cas de surcharge Opus sans dégrader le travail courant. Voir `rules/12-context-management.md`.

---

## Migration from < 2.1.97

### Checklist de migration

Avant de mettre à jour, vérifiez chaque point :

#### Sécurité (critique)

- [ ] Mettre à jour Claude Code vers 2.1.97 minimum : `npm install -g @anthropic-ai/claude-code@latest`
- [ ] Vérifier la version : `claude --version` → doit afficher `2.1.97` ou supérieur
- [ ] Si vous utilisez des MCP servers : auditer les serveurs installés (privilégier les sources officielles)
- [ ] Si vous avez des hooks personnalisés : tester que leur comportement n'a pas changé après la mise à jour
- [ ] Supprimer les MCP servers tiers non audités (surface d'attaque CVE-2025-59536)

#### Compatibilité hooks

- [ ] Vérifier vos hooks `PostToolUse` : le format d'input a changé en v2.1.47+ (`last_assistant_message`)
- [ ] Hooks `PreCompact` : tester le comportement exit code 2 (v2.1.105+) si vous utilisez des hooks de compaction
- [ ] Hooks `ConfigChange` (v2.1.49+) : nouveau event — ajouter si pertinent pour votre workflow

#### Compatibilité agents

- [ ] Agents avec `effort` frontmatter : disponible depuis v2.1.78 — compatible 2.1.97+
- [ ] Agents avec `context: fork` : disponible depuis v2.1.105 — compatible 2.1.105+
- [ ] Agents avec `maxTurns` : disponible depuis v2.1.78 — compatible 2.1.97+

#### Modèles

- [ ] Si vous utilisez Opus 4.6 avec `temperature`/`top_p`/`top_k` : ces paramètres fonctionnent toujours sur 4.6
- [ ] Si vous migrez vers Opus 4.7 (v2.1.111+) : **supprimer** `temperature`/`top_p`/`top_k` de vos appels (HTTP 400 sinon)
- [ ] Budgets de tokens : Opus 4.7 peut produire jusqu'à 35% de tokens supplémentaires pour le même input

#### Commandes

- [ ] `/memory` : disponible depuis v2.1.59 — compatible 2.1.97+
- [ ] `/effort` : disponible depuis v2.1.70 — compatible 2.1.97+
- [ ] `/btw`, `/hooks`, `/reload-plugins`, `/proactive` : disponibles depuis v2.1.105+ — nécessite mise à jour

#### Node.js

- [ ] Vérifier la version Node : `node --version` → doit être >= 20.0.0
- [ ] Recommandé : migrer vers Node.js 22 LTS (cible CI Claude Craft depuis v8.2.1)

### Commandes de mise à jour

```bash
# Mettre à jour Claude Code
npm install -g @anthropic-ai/claude-code@latest

# Vérifier la version
claude --version

# Mettre à jour Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=<votre-tech> --lang=<votre-lang>

# Vérifier que les plugins se chargent
/reload-plugins

# Tester les hooks
/hooks
```

---

## Version History Summary

Récapitulatif des versions clés et leurs apports pour les utilisateurs de Claude Craft :

| Version | Date | Impact Claude Craft |
|---------|------|---------------------|
| 2.1.20 | 2025-11 | Background agent permissions — base |
| 2.1.32 | 2026-01 | Agent Teams (expérimental), Opus 4.6, Auto Memory |
| 2.1.46 | 2026-02 | LSP Plugins — intelligence de code native |
| **2.1.51** | **2026-03** | **CVE-2025-59536 fix initial** |
| 2.1.59 | 2026-03 | `/memory` — persistance inter-sessions |
| 2.1.70 | 2026-03 | `/effort`, `/loop`, ExitWorktree |
| 2.1.76 | 2026-03 | PostCompact hook, MCP elicitation |
| 2.1.78 | 2026-03 | Agent frontmatter (effort, maxTurns, disallowedTools) |
| 2.1.84 | 2026-03 | PowerShell (Windows), TaskCreated hook, idle prompt |
| 2.1.94 | 2026-03 | Auto Mode (Team plans), default effort `high` |
| **2.1.97** | **2026-04** | **Security hardening complet — MINIMUM REQUIS** |
| 2.1.101 | 2026-04 | POSIX `which` injection fix, `/team-onboarding` |
| **2.1.105** | **2026-04** | **`/btw`, `/hooks`, `/reload-plugins`, `context: fork`** |
| 2.1.108 | 2026-04 | Prompt caching env vars, `/recap`, `/undo` |
| 2.1.110 | 2026-04 | Push Notifications, `/tui`, sécurité PermissionRequest |
| **2.1.111** | **2026-04-16** | **Opus 4.7, `xhigh` effort, `/ultrareview`** |
| 2.1.113 | 2026-04-17 | Native CLI binary, `/proactive`, sécurité Bash renforcée |
| 2.1.116 | 2026-04-20 | `/resume` 67% faster, thinking spinner |
| 2.1.117 | 2026-04-22 | Forked subagents, concurrent MCP, native bfs/ugrep |
| **2.1.118** | **2026-04-26** | **10 nouvelles env vars (FORK_SUBAGENT, SUBAGENT_MODEL, OTEL_*…) — RECOMMANDÉ** |
| 2.1.145 | 2026-05-19 | `claude agents --json`, spans OTEL agent+parent, Stop hooks enrichis |
| 2.1.147 | 2026-05-22 | `/code-review` (rename `/simplify`), `/code-review --fix`, sessions background |
| 2.1.149 | 2026-05-25 | `/usage` — consommation tokens/coût session courante |
| 2.1.152 | 2026-05-27 | `disallowed-tools` kebab-case frontmatter, `/code-review --fix` GA |
| **2.1.154** | **2026-05-28** | **Opus 4.8 (`claude-opus-4-8`), Dynamic Workflows, `effort: max`, `/effort ultracode`** |
| 2.1.155 | 2026-05-29 | Correctifs stabilité Dynamic Workflows |
| 2.1.157 | 2026-05-30 | Auto-load des plugins `.claude/skills/` sans marketplace — `EnterWorktree`, `/reload-skills`, `SessionStart reloadSkills:true`, hook `MessageDisplay` |
| 2.1.158 | 2026-05-30 | `CLAUDE_CODE_ENABLE_AUTO_MODE=1` — Auto Mode sur Bedrock/Vertex/Foundry |
| 2.1.159 | 2026-05-31 | Correctifs finaux |
| **2.1.160** | **2026-06-02** | **⚠️ BREAKING : trigger Dynamic Workflows `workflow` → `ultracode` ; grep satisfait read-before-edit ; confirmation écriture shell startup** |
| 2.1.163 | 2026-06-04 | Managed settings `requiredMinimumVersion` / `requiredMaximumVersion` |
| **2.1.166** | **2026-06-06** | **`fallbackModel` (jusqu'à 3 modèles de repli), `--fallback-model` interactif, retry sur fallback** |
| **2.1.168** | **2026-06-06** | Durcissement messages cross-session (SendMessage), retries |
| **2.1.176** | **2026-06-12** | `/cd`, sous-agents imbriqués (5 niveaux), `--safe-mode`, `fallbackModel` (jusqu'à 3) |
| **2.1.183** | **2026-06-19** | Artifacts (beta Team/Enterprise), deny/ask rules sur paramètres `Tool(param:value)`, `/config key=value` |
| **2.1.193** | **2026-06-26** | **`claude mcp login/logout`, `/rewind` post-`/clear`, background subagents → prompts de permission, shell mode répond à l'output — version stable RECOMMANDÉE** |
| **Sonnet 5** | **2026-06-30** | Modèle `claude-sonnet-5` dispo dans Claude Code (défaut Free/Pro) — agentique, intro $2/$10 |

---

## Références

- [CVE-2025-59536 — Check Point Research](https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/)
- [Claude Code Changelog officiel](https://code.claude.com/docs/en/changelog)
- [Anthropic Claude Opus 4.7 announcement](https://www.anthropic.com/news/claude-opus-4-7)
- [Statement on the US government directive to suspend Fable 5 & Mythos 5 (2026-06-12)](https://www.anthropic.com/news/fable-mythos-access)
- [Claude Code What's new — Week 26 (2.1.193)](https://code.claude.com/docs/en/whats-new)
- [Claude Code Cost Optimization](https://code.claude.com/docs/en/costs)
- [CLAUDE.md Authoring Guide](https://www.builder.io/blog/claude-md-guide)

---

**Fichier source :** `.claude/COMPATIBILITY.md` — version de référence du projet
**Ce fichier :** Template révisé pour le marketplace Anthropic (audit 2026-05-06)
**Auteur :** The Bearded CTO

---

## Surfaces × Hooks compatibility matrix

> À compléter — données partielles basées sur la documentation officielle disponible. Voir https://code.claude.com/docs/en/hooks pour les mises à jour.

**Légende :** ✅ Supporté | ⚠️ Partiel / expérimental | ❌ Non supporté | ? Inconnu

| Hook | CLI | VS Code Extension | JetBrains | Desktop App | Web (Claude.ai) |
|------|-----|-------------------|-----------|-------------|-----------------|
| **PreToolUse** | ✅ | ✅ | ? | ✅ | ❌ |
| **PostToolUse** | ✅ | ✅ | ? | ✅ | ❌ |
| **PreCompact** | ✅ | ✅ | ? | ✅ | ❌ |
| **PostCompact** | ✅ | ✅ | ? | ✅ | ❌ |
| **SessionStart** | ✅ | ✅ | ? | ✅ | ❌ |
| **SessionEnd** (Stop) | ✅ | ⚠️ | ? | ✅ | ❌ |
| **UserPromptSubmit** | ✅ | ⚠️ | ? | ✅ | ❌ |
| **Stop** | ✅ | ⚠️ | ? | ✅ | ❌ |

**Notes :**
- **CLI** : surface principale — tous les hooks sont pleinement supportés (v2.1.97+).
- **VS Code Extension** : les hooks `SessionEnd`, `UserPromptSubmit` et `Stop` sont partiellement supportés selon la version de l'extension ; comportement identique à la CLI depuis les versions récentes.
- **JetBrains** : plugin Claude Code en beta — support des hooks à confirmer sur la documentation officielle.
- **Desktop App** : support identique à la CLI pour les hooks core ; hooks expérimentaux peuvent varier.
- **Web (Claude.ai)** : pas de support hooks — Claude Code hooks sont exclusifs aux environnements disposant d'un shell local.
