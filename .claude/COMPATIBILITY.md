# Claude Code Compatibility — Claude Craft v8.3.0

**Minimum Version:** 2.1.97 (elevated from 2.1.47 — see [rationale](#why-we-elevated-minimum-from-2147-to-2197))
**Recommended Version:** 2.1.117
**Last Updated:** 2026-05-06

---

## Table des matières

1. [Version Requirements](#version-requirements)
2. [OS Support](#os-support)
3. [Node.js Support](#nodejs-support)
4. [Why We Elevated Minimum from 2.1.47 to 2.1.97](#why-we-elevated-minimum-from-2147-to-2197)
5. [Feature Adoption Status](#feature-adoption-status)
6. [Features 2.1.105–2.1.117 Available](#features-21105-21117-available)
7. [Migration from < 2.1.97](#migration-from--2197)
8. [Version History Summary](#version-history-summary)

---

## Version Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Minimum** | 2.1.97 | Security baseline — CVE-2025-59536 patched |
| **Recommended** | 2.1.117 | Full feature set, forked subagents, native CLI binary |
| **MCP + Hooks production** | 2.1.97+ | Mandatory for secure MCP usage |
| **Agent Teams** | 2.1.32+ (experimental) | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| **Auto Mode** | 2.1.94+ | Team plan required |
| **Opus 4.7** | 2.1.111+ | xhigh effort, adaptive thinking |
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

Statut d'adoption des 15 principales features Claude Code 2.1.x dans Claude Craft :

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
| Push Notifications | 2.1.110+ | **Planned** | Non encore intégré aux agents |
| Forked Subagents | 2.1.117 | **Planned** | `CLAUDE_CODE_FORK_SUBAGENT=1` — prévu v8.3 |
| Skill `context: fork` | 2.1.105+ | **N/A** | Évaluation en cours — isolement contexte |

**Légende :**
- **Adopted** : Intégré et documenté dans Claude Craft
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
| Forked Subagents | `CLAUDE_CODE_FORK_SUBAGENT=1` — contextes isolés | Prévu pour team:sprint v8.3 |
| `/resume` 67% faster | Sessions > 40 MB | Reprise sessions longues |
| Concurrent MCP connections | Par défaut — démarrage plus rapide | Multi-MCP setups |
| Native `Glob`/`Grep` (bfs/ugrep) | Embedded binaires | Performance recherche fichiers |
| Forked skill `context: fork` | Combiné avec forked subagents | Isolation complète contexte skill |

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
| **2.1.117** | **2026-04-22** | **Forked subagents, concurrent MCP, native bfs/ugrep — RECOMMANDÉ** |

---

## Références

- [CVE-2025-59536 — Check Point Research](https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/)
- [Claude Code Changelog officiel](https://code.claude.com/docs/en/changelog)
- [Anthropic Claude Opus 4.7 announcement](https://www.anthropic.com/news/claude-opus-4-7)
- [Claude Code Cost Optimization](https://code.claude.com/docs/en/costs)
- [CLAUDE.md Authoring Guide](https://www.builder.io/blog/claude-md-guide)

---

**Fichier source :** `.claude/COMPATIBILITY.md` — version de référence du projet
**Ce fichier :** Template révisé pour le marketplace Anthropic (audit 2026-05-06)
**Auteur :** The Bearded CTO
