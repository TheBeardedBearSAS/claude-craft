# Claude Code Compatibility — Claude Craft v8.27.0

**Minimum Version:** 2.1.260 (elevated from 2.1.97 — see [security advisories 2026](#security-advisories-2026--why-the-minimum-is-21260))
**Recommended Version:** 2.1.312 (Opus 5.5 / Sonnet 5.5 / Haiku 5.5, MCP 2026-07-28, hooks `onFailure: "block"`, permission fixes 2.1.288–2.1.309)
**Tested up to:** 2.1.312 (October 2026)
**Last Updated:** 2026-10-28

---

## Table des matières

1. [Version Requirements](#version-requirements)
2. [OS Support](#os-support)
3. [Node.js Support](#nodejs-support)
4. [Security Advisories 2026 — why the minimum is 2.1.260](#security-advisories-2026--why-the-minimum-is-21260)
5. [Why We Elevated Minimum from 2.1.47 to 2.1.97 (historique)](#why-we-elevated-minimum-from-2147-to-2197-historique)
6. [Feature Adoption Status](#feature-adoption-status)
7. [Features 2.1.105–2.1.117 Available](#features-21105-21117-available)
8. [Features 2.1.119 → 2.1.145 (May 2026)](#features-21119--21145-may-2026)
9. [Features 2.1.194 → 2.1.296 (July–October 2026)](#features-21194--21296-julyoctober-2026)
   - [Features 2.1.297 → 2.1.312 (October 2026)](#features-21297--21312-october-2026)
10. [Migration from < 2.1.260](#migration-from--21260)
11. [Version History Summary](#version-history-summary)

---

## Version Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Minimum** | 2.1.260 | Security baseline — CVE-2026-86063 (2.1.179), CVE-2026-103435 (2.1.129), CVE-2026-55607 (2.1.163), CVE-2026-88968 (2.1.251), CVE-2026-103012 (2.1.260) patched |
| **Recommended** | 2.1.312 | Génération 5.5 (Opus/Sonnet/Haiku), Fable 5.1, MCP 2026-07-28, hooks `onFailure: "block"`, `effort` sur l'outil Agent, `autoCompactWindow` sous-agents, correctifs permissions 2.1.288–2.1.309 |
| **Hooks `onFailure: "block"`** | 2.1.295+ | Un hook command/HTTP qui ne démarre pas, timeout ou sort avec un code inattendu bloque l'action |
| **MCP protocole 2026-07-28** | 2.1.292+ | Négocié par défaut pour les serveurs stdio locaux ; retour arrière `MCP_PROTOCOL_NEGOTIATION=legacy` |
| **`claude mcp login` / `logout`** | 2.1.185+ | Authenticate/clear an MCP server's credentials from the shell instead of `/mcp` |
| **Artifacts** | 2.1.178+ | Live shareable page from a session (beta, Team/Enterprise) |
| **`/cd`** | 2.1.166+ | Move session working dir without rebuilding the prompt cache |
| **Nested subagents** | 2.1.166+ | A subagent can spawn its own subagents (background chains capped at 5 levels) |
| **`fallbackModel`** | 2.1.166+ | Up to 3 fallback models when primary overloaded/unavailable |
| **`ultracode` trigger** | 2.1.160+ | ⚠️ BREAKING — renamed from `workflow` (Dynamic Workflows) |
| **Managed `requiredMinimum/MaximumVersion`** | 2.1.163+ | Enterprise version enforcement |
| **MCP + Hooks + plugins production** | 2.1.260+ | Mandatory for secure MCP/plugin usage |
| **Agent Teams** | 2.1.32+ (experimental) | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| **Auto Mode** | 2.1.94+ | Team plan required |
| **Opus 4.7** | 2.1.111+ | xhigh effort, adaptive thinking |
| **Opus 4.8** | 2.1.154+ | *Legacy* (toujours disponible) — remplacé par Opus 5.5 |
| **Sonnet 5** | 2.1.197+ | *Legacy* (toujours disponible) — `claude-sonnet-5`, $2/$10 devenu tarif standard (la hausse à $3/$15 prévue au 2026-09-01 n'a pas eu lieu) |
| **Fable 5.1** | 2.1.257+ | `claude-fable-5-1` — $10/$50 par M tokens, effort `high` par défaut. Fable 5 reste disponible (*legacy*) |
| **Opus 5.5** | 2.1.280+ | `claude-opus-5-5` — flagship courant, $4/$20, effort `medium` par défaut |
| **Sonnet 5.5** | 2.1.284+ | `claude-sonnet-5-5` — Sonnet courant, $2/$10, effort `high` par défaut |
| **Haiku 5.5** | 2.1.293+ | `claude-haiku-5-5` — Haiku par défaut, $0.10/$0.50 (≤ 100K tokens de prompt), effort `medium` par défaut |
| **Mythos 5 / 5.1** | Disponibilité limitée | Réservé aux organisations vérifiées (Cyber Verification Program) — ne pas recommander par défaut |
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

## Security Advisories 2026 — why the minimum is 2.1.260

Source : [GitHub Security Advisories — anthropics/claude-code](https://github.com/anthropics/claude-code/security/advisories) (relevé du 2026-10-13, complété le 2026-10-28).

| GHSA | CVE | Sévérité | Publié | Description | Corrigé dans |
|------|-----|----------|--------|-------------|--------------|
| GHSA-5xjx-9qx6-jcrv | CVE-2026-88968 | High | 2026-10-26 | Course TOCTOU dans l'outil Edit → écriture de fichiers hors du workspace | 2.1.251 (couvert par le minimum 2.1.260) |
| GHSA-4p2j-qj3c-6x84 | CVE-2026-88066 | High | 2026-10-13 | Claude Desktop (Windows) : `git.exe` résolu depuis le répertoire courant → exécution de code via un dépôt cloné. **Hors périmètre CLI** (corrigé Desktop 1.8089.0) | — |
| GHSA-q5hj-mxqh-vv77 | CVE-2026-40068 | High | 2026-04-24 | Contournement du dialogue de confiance via usurpation de git worktree → exécution de code | 2.1.84 |
| GHSA-5j29-h97v-84ch | CVE-2026-103435 | High | 2026-10-05 | Écriture arbitraire de fichier via suivi de symlink au moment de l'écriture (TOCTOU) | 2.1.129 |
| GHSA-7835-87q9-rgvv | CVE-2026-55607 | High | 2026-06-25 | Évasion du sandbox via confusion de chemin git worktree | 2.1.163 |
| GHSA-pq7j-f95f-qfcv | CVE-2026-86063 | High | 2026-10-09 | Contournement du pin SHA de commit des plugins → installation de code contrôlé par l'attaquant | 2.1.179 |
| GHSA-gfvf-j8jh-jxxw | CVE-2026-103012 | Low | 2026-09-29 | Managed settings non appliqués quand une clé API stockée est préférée à la connexion entreprise | 2.1.260 |
| GHSA-v234-4jrq-mgg6 | — | High | 2026-09-25 | Claude Desktop (macOS) : fichier malveillant d'un dossier Cowork → commandes sur l'hôte. **Hors périmètre CLI** (corrigé Desktop 1.15962.0) | — |

**Pertinence Claude Craft :** le framework distribue des plugins, hooks et agents. CVE-2026-86063 (pin SHA plugins) et CVE-2026-103435 (symlink TOCTOU) touchent directement ce modèle de distribution ; 2.1.260 couvre en plus l'application des managed settings en entreprise.

**Correctifs permissions postérieurs (non CVE, inclus dans le recommandé 2.1.312) :** contournement Bash masquant une partie de la commande (2.1.223), `$PSDefaultParameterValues` PowerShell (2.1.232), chemins NT `\??\` rejetés (2.1.234), `CLAUDE_CODE_DISABLE_ATTACHMENTS` et activation de Claude in Chrome ignorés dans les settings projet (2.1.290), lectures de chemins UNC réseau soumises au prompt même après approbation PreToolUse/auto mode (2.1.292), règles deny `Edit` appliquées à davantage de redirections Bash, prompt sur certaines commandes composées `cd`/git, fichier `--mcp-config` protégé des commandes sandboxées, fichiers de démarrage du shell plus exécutés hors sandbox, hooks Windows/PowerShell qui ne laissent plus passer l'outil (2.1.309-2.1.310).

---

## Why We Elevated Minimum from 2.1.47 to 2.1.97 (historique)

> **Correction (audit 2026-10-13) :** selon l'avis officiel [GHSA-4fgq-fpq9-mr3g](https://github.com/anthropics/claude-code/security/advisories/GHSA-4fgq-fpq9-mr3g), CVE-2025-59536 est une **exécution de commandes avant le dialogue de confiance au démarrage**, corrigée en **v1.0.111** (sévérité high). CVE-2026-21852 ([GHSA-jh7p-qr78-84p7](https://github.com/anthropics/claude-code/security/advisories/GHSA-jh7p-qr78-84p7)) est une **fuite de données via la configuration d'environnement du dépôt lue avant confirmation de confiance**, corrigée en **v2.0.65**. La description ci-dessous reprend l'analyse Check Point de l'époque et la chronologie de durcissement 2.1.51 → 2.1.97 ; elle est conservée à titre historique.

### CVE-2025-59536 — RCE via Claude Code Project Files

**Sévérité :** High (CVSS 8.7)
**Source :** [Check Point Research — avril 2026](https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/)
**Patché dans :** v1.0.111 (avis officiel) ; durcissement complémentaire jusqu'à v2.1.97

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
| v2.0.65 | CVE-2026-21852 — fuite de configuration d'environnement avant confirmation de confiance |
| v2.1.97 | Compound command bypass dans Bash tool (contournait les règles de permission) |
| v2.1.97 | Network redirect bypass dans Bash tool |
| v2.1.97 | Prototype pollution dans les règles de permission |
| v2.1.98 | Env-var prefix injection dans Bash tool |
| v2.1.98 | Subprocess sandboxing avec PID namespace isolation (Linux) |
| v2.1.101 | POSIX `which` fallback command injection |

#### Pourquoi 2.1.97 et non 2.1.51 ?

Le fix initial (v2.1.51) était incomplet : les versions v2.1.52–v2.1.96 présentaient encore des vecteurs de contournement documentés. v2.1.97 représente le point où **l'ensemble du surface d'attaque identifié est couvert** avec des tests de régression en place.

#### Recommandation

**Historique :** v2.1.97 était le plancher jusqu'en octobre 2026. **Le minimum actuel est 2.1.260** (voir section précédente).

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
| Hook `MessageDisplay` | 2.1.157+ | **Documented** (officiel) | Filtrage/transformation output assistant (cas RTK-style) — voir https://code.claude.com/docs/en/hooks |
| Trigger `ultracode` (ex-`workflow`) | 2.1.160+ | **Action** | ⚠️ BREAKING — renommage du déclencheur Dynamic Workflows |
| `requiredMinimum/MaximumVersion` | 2.1.163+ | **Documented** | Enforcement de version via managed settings — ex. `"requiredMinimumVersion": "2.1.260"` aligne l'équipe sur le plancher sécurité Claude Craft |
| Hooks `onFailure: "block"` | 2.1.295+ | **Not Adopted** | Fail-closed pour hooks de sécurité ; à évaluer pour les hooks PreToolUse du template (risque : blocage si `jq` absent) |
| `effort` sur l'outil Agent | 2.1.292+ | **Not Adopted** | Effort par appel de sous-agent ; le frontmatter `effort:` des agents reste la voie principale |
| `autoCompactWindow` (frontmatter sous-agent) | 2.1.296+ | **Not Adopted** | Fenêtre d'auto-compaction par agent — à évaluer pour `ralph-conductor` (sessions longues) |
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
| `claude project purge [path]` → **`claude purge`** (2.1.288) | Supprime tout l'état Claude Code d'un projet ; l'ancien nom fonctionne encore avec un avertissement | **Documented** |
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
| `disallowed-tools` (kebab-case) frontmatter | Variante kebab-case annoncée dans le changelog, **absente de la documentation officielle** (audit 2026-10-13) — utiliser exclusivement `disallowedTools` (camelCase, documenté) | **Non documenté officiellement** |
| `/code-review --fix` | Applique automatiquement les findings de la revue | **N/A** (user CLI) |

### 2.1.154 (May 28, 2026) — Opus 4.8 & Dynamic Workflows ⭐

| Feature | Description | Adoption Claude Craft |
|---------|-------------|----------------------|
| **Claude Opus 4.8** (`claude-opus-4-8`) | Nouveau modèle flagship, même prix qu'Opus 4.7, **défaut effort `high`** + `/effort xhigh` pour les tâches les plus dures. Disponible API/Bedrock/Vertex/Foundry | **Recommandé** — modèle cible pour agents `effort: xhigh`/`max` (security-auditor, migration-specialist, database-architect, ralph-conductor) |
| **Dynamic Workflows** | Demander à Claude de créer un workflow qui orchestre **des dizaines à des centaines d'agents** en arrière-plan (cap 1000 subagents). Visible via `/workflows` | **Adopté** (v8.19.1) — skill [`dynamic-workflows`](../skills/dynamic-workflows/SKILL.md) : 3 paliers d'orchestration, patterns (fan-out, vérification adversariale, pipeline, loop-until-dry), monitoring `/workflows` |
| Fast mode moins cher sur Opus 4.8 | 2× le tarif standard pour 2,5× la vitesse | **N/A** (user pricing) |
| `effort: max` | 5ᵉ niveau d'effort (au-dessus de `xhigh`), disponible sur Opus 4.8 | **Documented** — voir docs/AGENTS.md tableau effort |
| `/effort ultracode` | Nouveau palier effort introduit avec Dynamic Workflows / Opus 4.8 — mode optimisé débit code (vitesse maximale, idéal pipelines automatisés) ; équivalent `effort: max` en CLI | **Documented** — documenter dans `rules/12-context-management.md` tableau efforts |

> **Note Opus 4.8 :** L'ID de modèle est `claude-opus-4-8`. Pour les agents critiques (audits sécurité, migrations, décisions schéma, boucles autonomes), `model: opus` + `effort: xhigh` routait alors vers Opus 4.8 — **depuis 2.1.280, l'alias `opus` route vers Opus 5.5** (`claude-opus-5-5`, Opus 4.8 devenu *legacy*). Le `model: sonnet` des reviewers tech reste optimal pour le ratio coût/qualité (routing économe).

> **Note Dynamic Workflows vs `/team:*` :** Les commandes `/team:audit`, `/team:sprint`, `/team:security` restent valides (orchestration documentée déclarative). Dynamic Workflows offre en plus une orchestration **programmatique** (boucles, fan-out conditionnel, pipelines, vérification adversariale) pour les tâches dépassant un seul contexte. À évaluer pour v8.8.

---

### 2.1.157 → 2.1.168 (June 2026)

| Version | Feature | Description | Adoption Claude Craft |
|---------|---------|-------------|----------------------|
| **2.1.157** | Auto-load plugins `.claude/skills/` | Les plugins déposés dans `.claude/skills/` sont chargés automatiquement (sans marketplace) ; `claude plugin init <name>` scaffolde un plugin | **Partially Adopted** — le framework installe déjà dans `.claude/skills/` ; documenter l'auto-load dans CLI-REFERENCE |
| **2.1.157** | `/reload-skills` + `SessionStart reloadSkills:true` | Re-scan des skills sans redémarrage ; un hook SessionStart peut rendre disponibles les skills qu'il installe dans la même session | **Not Adopted** — distinct de `/reload-plugins` ; documenter dans rule 12 + templates hooks |
| **2.1.157** | Hook `MessageDisplay` | Nouvel événement permettant de transformer/masquer le texte assistant à l'affichage | **Documented** (doc officielle hooks) — pertinent pour un filtrage RTK-style |
| **2.1.160** ⚠️ | **BREAKING : trigger `workflow` → `ultracode`** | Le mot-clé déclencheur des Dynamic Workflows passe de `workflow` à **`ultracode`**. Demander un workflow « avec ses propres mots » fonctionne toujours. `/effort ultracode` corrigé (ne blâme plus le réglage Dynamic Workflows quand le modèle ne supporte pas xhigh) | **Action** — toute doc/skill mentionnant le trigger `workflow` doit utiliser `ultracode` |
| **2.1.160** | grep satisfait read-before-edit | Les fichiers vus via grep/egrep/fgrep satisfont le contrôle read-before-edit (édition directe après confirmation de la section) | **N/A** (comportement runtime) |
| **2.1.160** | Confirmation écriture shell startup | Prompt de confirmation avant d'écrire dans les fichiers d'init shell (`.bashrc`, etc.) | **Sécurité** — cohérent avec les hooks PreToolUse du framework |
| **2.1.163** | `requiredMinimumVersion` / `requiredMaximumVersion` | Managed settings d'enforcement de version (déploiements enterprise/équipe) | **Not Documented** — alternative au minimum manuel ; mentionner en Version Requirements |
| **2.1.166** | **`fallbackModel`** | Configurer jusqu'à **3 modèles de repli** essayés dans l'ordre quand le primaire est surchargé/indisponible ; `--fallback-model` s'applique aussi aux sessions interactives ; retry une fois sur le fallback en cas d'erreur non-retryable inattendue | **Adopted** — voir `settings.local.json.example` + rule 12 (repli `opus → sonnet → haiku` recommandé pour les agents critiques) |
| **2.1.168** | Stable recommandée | Durcissement sécurité des messages cross-session (les messages relayés via `SendMessage` ne portent plus l'autorité utilisateur), retries améliorés, filtrage agents | **Recommended** — version cible Claude Craft v8.9.x |

> **⚠️ Migration `workflow` → `ultracode` (2.1.160) :** le déclencheur des Dynamic Workflows a été renommé. Claude Craft mentionne `/effort ultracode` (palier effort) — cohérent. Tout contenu invitant à « lancer un workflow » par le mot-clé `workflow` doit être mis à jour vers `ultracode`.

> **Note `fallbackModel` :** réglage de fiabilité ET de coût. Pour les 4 agents `opus` (security-auditor, database-architect, migration-specialist, ralph-conductor), un repli `["claude-sonnet-5-5", "claude-haiku-5-5"]` évite les interruptions en cas de surcharge Opus sans dégrader le travail courant. Voir `rules/12-context-management.md`.

---

## Features 2.1.194 → 2.1.296 (July–October 2026)

Source : [CHANGELOG officiel](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) (lu le 2026-10-13).

| Version | Feature | Description | Adoption Claude Craft |
|---------|---------|-------------|----------------------|
| 2.1.196 | MCP auto-approuvé par repo | `claude mcp list/get` ne lancent plus les serveurs `.mcp.json` qu'un dépôt s'auto-approuve via un `.claude/settings.json` commité | **Sécurité** — cohérent avec la règle 11 (vetting MCP) |
| 2.1.197 | Sonnet 5 par défaut | Fenêtre 1M | Remplacé par Sonnet 5.5 (2.1.284) |
| 2.1.198 | Hook `Notification` pour agents background | `agent_needs_input` / `agent_completed` | **Not Adopted** |
| 2.1.219 | Hook `DirectoryAdded` ; Opus 5 | Nouvel événement de hook | **Not Adopted** |
| 2.1.251 | Hooks `PreModelSwitch` / `PostModelSwitch` | Réagir aux changements de modèle | **Not Adopted** |
| 2.1.257 | Fable 5.1 | `claude-fable-5-1` | **Documented** — règle 12 |
| 2.1.274 | MCP v2 client sur Bedrock/Vertex/Foundry | Négociation 2026-07-28 ; opt-out `MCP_SDK_GENERATION=v1` / `MCP_PROTOCOL_NEGOTIATION=legacy` | **Documented** — `docs/MCP.md` |
| 2.1.280 | Opus 5.5 ; `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` | Défaut Pro/Team Standard → Opus | **Documented** |
| 2.1.284 | Sonnet 5.5 ; Ultracode = toggle `/effort` | Ultracode ne force plus xhigh | **Documented** — règle 12 |
| 2.1.288 | `claude project purge` → `claude purge` | Ancien nom encore accepté | **Documented** |
| 2.1.290 | Settings projet restreints | `CLAUDE_CODE_DISABLE_ATTACHMENTS` et activation Claude in Chrome ignorés dans `.claude/settings*.json` (utiliser shell/user/managed ou `--chrome`) | **Action** — ne pas les placer dans les templates projet |
| 2.1.292 | MCP stdio 2026-07-28 par défaut ; `effort` sur l'outil Agent ; UNC | Opt-out `MCP_PROTOCOL_NEGOTIATION=legacy` | **Documented** |
| 2.1.293 | Haiku 5.5 par défaut | `claude-haiku-5-5` | **Adopted** — `fallbackModel` |
| 2.1.295 | Hooks `onFailure: "block"` ; connecteurs claude.ai en 2026-07-28 | Fail-closed hooks | **Not Adopted** (voir Feature Adoption Status) |
| 2.1.296 | Description d'outil MCP plafonnée à 4 096 caractères (au lieu de 2 048) ; `autoCompactWindow` sous-agents ; Esc pendant `UserPromptSubmit` ne laisse plus passer le prompt | | **Documented** |

---

## Features 2.1.297 → 2.1.312 (October 2026)

Source : [CHANGELOG officiel](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) (lu le 2026-10-28). Aucune CVE publiée sur cette plage : le minimum reste 2.1.260.

| Version | Feature | Description | Adoption Claude Craft |
|---------|---------|-------------|----------------------|
| 2.1.300 | `advisorModel` / `--advisor` ; `DISABLE_COMPACT` ne peut que désactiver | `/advisor` sur Claude Platform on AWS ; `CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1` | **Not Adopted** |
| 2.1.300 | **Breaking** : `claude remote-control` refuse `--sandbox` / `--no-sandbox` ; `updatedInput` des hooks validé | Utiliser `sandbox.enabled` dans les settings | **Documented** |
| 2.1.302 | Fork subagents activés par défaut en `-p`, SDK, desktop, VS Code | `CLAUDE_CODE_FORK_SUBAGENT=0` pour désactiver ; appels `Agent` au premier plan en `-p`/SDK | **Documented** — règle 12 ; moteur `--engine=subagents` des `/team:*` (8.27.0) |
| 2.1.302 | **Breaking** : `claude -p` sans mode de permission démarre en `default` sur les fournisseurs tiers | `--permission-mode auto` conserve auto | **Documented** |
| 2.1.304 | `/auto-mode-setup` ; hooks d'agent ne passent plus en fail-open | Repli sur le modèle de l'appelant | **Not Adopted** |
| 2.1.305 | **Breaking** : `allowedMcpServers` ne filtre plus les serveurs stdio `managed-mcp.json` utilisant `${VAR}` seulement dans `env` | Utiliser `deniedMcpServers` pour les bloquer | **Documented** — règle 11 (vetting MCP) |
| 2.1.307 | `axScreenReader` / `CLAUDE_AX_SCREEN_READER` (bloc `env`) lus seulement depuis les settings user, managed ou `--settings` | Ignorés dans les settings projet | **Documented** |
| 2.1.309 | Correctifs permissions (deny `Edit` sur redirections Bash, `cd`/git composés, `--mcp-config`, shell hors sandbox) ; **Breaking** : `claude ultrareview` exige la confiance du workspace | `--trust-workspace` pour les scripts | **Adopted** — version recommandée |
| 2.1.311 | `ultrathink` = effort xhigh sur la génération 5.5 ; `SubagentStop` émis une seule fois ; worktree d'un sous-agent background conservé | `--output-format json` / `stream-json` échappent certains caractères de contrôle en `\uXXXX` ; `DISABLE_COMPACT` des settings ne peut que désactiver | **Documented** |
| 2.1.312 | `autoCompactWindow` d'un sous-agent peut abaisser `CLAUDE_CODE_AUTO_COMPACT_WINDOW` ; 24 hooks prompt/agent concurrents max ; `CLAUDE_CODE_DISABLE_REFUSAL_FALLBACK=1` | Prompt système raccourci sur Bedrock, Vertex, Foundry et Mantle (`CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT=0` pour le complet) | **Documented** — version RECOMMANDÉE |

---

## Migration from < 2.1.260

### Checklist de migration

Avant de mettre à jour, vérifiez chaque point :

#### Sécurité (critique)

- [ ] Mettre à jour Claude Code vers 2.1.260 minimum : `npm install -g @anthropic-ai/claude-code@latest`
- [ ] Vérifier la version : `claude --version` → doit afficher `2.1.260` ou supérieur
- [ ] Équipes : imposer le plancher via managed settings `"requiredMinimumVersion": "2.1.260"`
- [ ] Hooks : `timeout` est en **secondes** (défaut 600 pour `command`) — corriger toute valeur écrite en millisecondes (ex. `5000` = 83 min)
- [ ] Si vous utilisez des MCP servers : auditer les serveurs installés (privilégier les sources officielles)
- [ ] Si vous avez des hooks personnalisés : tester que leur comportement n'a pas changé après la mise à jour
- [ ] Supprimer les MCP servers tiers non audités (surface d'attaque CVE-2025-59536)

#### Compatibilité hooks

- [ ] Vérifier vos hooks `PostToolUse` : le format d'input a changé en v2.1.47+ (`last_assistant_message`)
- [ ] Hooks `PreCompact` : tester le comportement exit code 2 (v2.1.105+) si vous utilisez des hooks de compaction
- [ ] Hooks `ConfigChange` (v2.1.49+) : nouveau event — ajouter si pertinent pour votre workflow

#### Compatibilité agents

- [ ] Agents avec `effort` frontmatter : disponible depuis v2.1.78 — compatible 2.1.260+
- [ ] Agents avec `context: fork` : disponible depuis v2.1.105 — compatible 2.1.105+
- [ ] Agents avec `maxTurns` : disponible depuis v2.1.78 — compatible 2.1.260+

#### Modèles

- [ ] Si vous utilisez Opus 4.6 avec `temperature`/`top_p`/`top_k` : ces paramètres fonctionnent toujours sur 4.6
- [ ] Si vous migrez vers Opus 4.7 (v2.1.111+) : **supprimer** `temperature`/`top_p`/`top_k` de vos appels (HTTP 400 sinon)
- [ ] Budgets de tokens : Opus 4.7 peut produire jusqu'à 35% de tokens supplémentaires pour le même input

#### Commandes

- [ ] `/memory` : disponible depuis v2.1.59 — compatible 2.1.260+
- [ ] `/effort` : disponible depuis v2.1.70 — compatible 2.1.260+
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
| **2.1.97** | **2026-04** | **Security hardening complet — ancien minimum (jusqu'en octobre 2026)** |
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
| 2.1.193 | 2026-06-26 | `claude mcp login/logout`, `/rewind` post-`/clear`, background subagents → prompts de permission, shell mode répond à l'output |
| 2.1.197 | 2026-07 | Sonnet 5 par défaut (1M) |
| 2.1.257 | 2026-09 | Fable 5.1 |
| **2.1.260** | **2026-09** | **Managed settings appliqués avec clé API stockée (CVE-2026-103012) — MINIMUM REQUIS** |
| 2.1.280 | 2026-09 | Opus 5.5 |
| 2.1.284 | 2026-10 | Sonnet 5.5, Ultracode toggle |
| 2.1.288 | 2026-10 | `claude purge` |
| 2.1.290 | 2026-10 | Settings projet restreints (attachments, Chrome) |
| 2.1.292 | 2026-10 | MCP stdio 2026-07-28, `effort` outil Agent, UNC |
| 2.1.293 | 2026-10 | Haiku 5.5 par défaut |
| 2.1.295 | 2026-10 | Hooks `onFailure: "block"` |
| 2.1.296 | 2026-10 | Description MCP 4 096 car., `autoCompactWindow` sous-agents |
| 2.1.302 | 2026-10 | Fork subagents par défaut en `-p`/SDK/desktop/VS Code |
| 2.1.309 | 2026-10 | Correctifs permissions (deny Edit, sandbox, hooks Windows), `ultrareview` exige la confiance du workspace |
| **2.1.312** | **2026-10** | **`autoCompactWindow` sous-agent abaisse le global, plafond 24 hooks prompt/agent — version RECOMMANDÉE** |

---

## Références

- [CVE-2025-59536 — Check Point Research](https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/)
- [Claude Code Changelog officiel](https://code.claude.com/docs/en/changelog)
- [Anthropic Claude Opus 4.7 announcement](https://www.anthropic.com/news/claude-opus-4-7)
- [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Claude Code security advisories](https://github.com/anthropics/claude-code/security/advisories)
- [Claude Code What's new](https://code.claude.com/docs/en/whats-new)
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
- **CLI** : surface principale — tous les hooks sont pleinement supportés (v2.1.260+ minimum Claude Craft).
- **VS Code Extension** : les hooks `SessionEnd`, `UserPromptSubmit` et `Stop` sont partiellement supportés selon la version de l'extension ; comportement identique à la CLI depuis les versions récentes.
- **JetBrains** : plugin Claude Code en beta — support des hooks à confirmer sur la documentation officielle.
- **Desktop App** : support identique à la CLI pour les hooks core ; hooks expérimentaux peuvent varier.
- **Web (Claude.ai)** : pas de support hooks — Claude Code hooks sont exclusifs aux environnements disposant d'un shell local.
