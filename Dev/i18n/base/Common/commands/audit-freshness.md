---
description: "Audit de fraîcheur multi-stack (versions + best practices) via équipe d'agents parallèles Context7 + Web"
argument-hint: "[--wave=1|2|3|all] [--stack=<nom>]"
---

# Audit de Fraîcheur claude-craft

Orchestre une **équipe de 17 agents parallèles** pour vérifier que l'ensemble des skills, commands, agents, references et rules du projet sont alignés avec les dernières versions stables et best practices 2026 des frameworks/outils déclarés. Utilise le **MCP Context7** (`mcp__context7__resolve-library-id` + `query-docs`) et **WebSearch** pour les release notes officielles.

**Résultat :** rapport consolidé `docs/audit/freshness-YYYY-MM-DD.md` — aucune modification automatique des skills/commands/refs.

## Arguments

$ARGUMENTS

- `--wave=1|2|3|all` (défaut `all`) : exécuter uniquement une vague donnée
- `--stack=<nom>` : limiter la vague 1 à un stack (symfony, react, flutter, python, angular, laravel, vuejs, reactnative, csharp, php)

## MISSION

### Étape 1 — Préparer le rapport cible

1. Déterminer la date du jour (format YYYY-MM-DD)
2. Créer `docs/audit/freshness-<date>.md` avec un en-tête (version claude-craft, date, nombre d'agents lancés, légende écarts : critique/majeur/mineur/aucun)
3. Relire `.claude/CLAUDE.md` (table versions) et `.claude/COMPATIBILITY.md` pour la source de vérité des versions déclarées

### Étape 2 — Vague 1 : Stacks techniques (10 agents EN PARALLÈLE)

**Lancer les 10 agents dans UN SEUL message** (10 tool_use Task/Agent). Chaque agent reçoit ce prompt (adapter `<STACK>`) :

```
Tu audites la fraîcheur du stack <STACK> dans le dépôt claude-craft.

ÉTAPES :
1. Lire la version déclarée du framework/langage <STACK> dans :
   - .claude/CLAUDE.md (table Supported Technologies)
   - .claude/references/<stack>/CLAUDE.md et project-context.md
   - .claude/agents/<stack>-reviewer.md (frontmatter + body)
   - Skills .claude/skills/<stack>-*/SKILL.md
   - Commandes .claude/commands/<stack>/*.md

2. Via mcp__context7__resolve-library-id puis mcp__context7__query-docs,
   récupérer la version stable actuelle + patterns recommandés 2026.

3. Via WebSearch, vérifier les release notes officielles (site officiel,
   GitHub releases) — confirmer version stable, breaking changes, nouvelles
   best practices (ex: signals Angular, async Symfony Messenger, etc.).

4. Identifier :
   - Écart de version (déclarée vs stable)
   - Best practices obsolètes dans les skills/refs/commands
   - Patterns nouveaux absents du repo (ex: React Compiler, Flutter Impeller)

5. Retourner EXACTEMENT ce format Markdown (<300 mots) :

## <STACK>
- **Version déclarée** : X.Y (source: <path>:<line>)
- **Version stable actuelle** : X.Y (source: <context7-lib-id> ou <URL>)
- **Écart** : aucun | mineur | majeur | critique
- **Best practices à revoir** :
  - <finding> — source: <URL ou context7 ID>
- **Patterns manquants** :
  - <pattern> — source: <URL>
- **Fichiers claude-craft impactés** : <path1>, <path2>, ...
- **Sources consultées** : context7=<ids> / web=<urls>

CONTRAINTE : citer systématiquement les sources. Ne rien inventer. Si une
info n'est pas trouvée, écrire "non trouvé" explicitement.
```

**Stacks couverts :** symfony, react, flutter, python, angular, laravel, vuejs, reactnative, csharp, php

### Étape 3 — Vague 2 : Transverse (4 agents EN PARALLÈLE)

Lancer les 4 agents dans un seul message. Chaque agent audite une famille :

| Agent | Cibles |
|-------|--------|
| **Principes** | `.claude/rules/04-solid-principles.md`, `05-kiss-dry-yagni.md`, `01-workflow-analysis.md`, skills `solid-principles`, `kiss-dry-yagni`, `workflow-analysis`. Vérifier : Clean Architecture 2026, Hexagonal evolutions, DDD maturité. |
| **Testing** | `.claude/rules/07-testing.md`, skills `testing`, `testing-{react,reactnative,python,symfony,flutter}`. Vérifier versions Pest 4, Vitest 2+, Jest 29+, pytest 8+, PHPUnit 11+, patterns AAA/BDD Gherkin. |
| **Security** | `.claude/rules/11-security.md`, skills `security`, `security-{react,reactnative,flutter,symfony}`. Vérifier OWASP Top 10 2025, headers CSP Level 3, CVE récentes frameworks, JWT bonnes pratiques 2026. |
| **Git/Docs/DDD** | `.claude/rules/09-git-workflow.md`, `10-documentation.md`, skills `git-workflow`, `documentation`, `ddd-patterns`, `value-objects`, `aggregates`, `domain-events`, `cqrs`, `multitenant`, `i18n`, `async`. Vérifier Conventional Commits v1, OpenAPI 3.1, patterns DDD tactiques. |

Prompt type (adapter la famille) :

```
Tu audites la famille "<FAMILLE>" de claude-craft.

1. Lire tous les fichiers listés : <paths>
2. Via mcp__context7__query-docs + WebSearch, identifier l'état de l'art
   2026 sur ces sujets (versions d'outils, patterns, standards).
3. Lister les obsolescences, références à des versions anciennes, patterns
   dépréciés.
4. Retourner le même format Markdown que la vague 1 (<300 mots, sources citées).
```

### Étape 4 — Vague 3 : Infrastructure (3 agents EN PARALLÈLE)

| Agent | Cibles |
|-------|--------|
| **Conteneurs** | Commandes `/docker:*`, `/kubernetes:*`, `/coolify:*` — Docker Compose spec actuelle, K8s API stable, Coolify version. |
| **IaC** | Commandes `/opentofu:*`, `/ansible:*`, `/hcloud:*` — OpenTofu stable, Ansible core, Hetzner Cloud provider. |
| **Runtime/DB** | Commandes `/frankenphp:*`, `/pgbouncer:*` — FrankenPHP stable, PgBouncer release. |

Même pattern de prompt que vague 2.

### Étape 5 — Agrégation

1. Récupérer les 17 rapports
2. Construire dans `docs/audit/freshness-<date>.md` :

```markdown
# Audit de Fraîcheur claude-craft — <date>

**Version claude-craft** : 8.0.0
**Agents lancés** : 17 (10 stacks + 4 transverse + 3 infra)
**MCP utilisé** : context7
**Sources web** : release notes officielles + CHANGELOG

## Résumé exécutif

| Sévérité | Nombre |
|----------|--------|
| 🔴 Critique | N |
| 🟠 Majeur | N |
| 🟡 Mineur | N |
| ✅ Aucun | N |

## Tableau global — Versions

| Stack | Déclarée | Stable actuelle | Écart |
|-------|----------|-----------------|-------|
| Symfony | ... | ... | ... |
| ... | ... | ... | ... |

## Findings détaillés

### Vague 1 — Stacks techniques
<coller chaque rapport>

### Vague 2 — Transverse
<coller chaque rapport>

### Vague 3 — Infrastructure
<coller chaque rapport>

## Top 10 actions prioritaires

1. [Critique] ...
2. [Majeur] ...
...

## Méthodologie

- Outils : MCP context7 (`resolve-library-id`, `query-docs`), WebSearch
- Sources de vérité pour versions déclarées : `.claude/CLAUDE.md`,
  `.claude/references/*/`, `.claude/agents/*-reviewer.md`
- Aucune modification du dépôt hors `docs/audit/`
```

3. Vérifier que seuls `docs/audit/freshness-<date>.md` (et éventuellement `docs/audit/` créé) apparaissent dans `git status`.

## Règles strictes

- **NE JAMAIS modifier** skills/commands/agents/references/rules/CLAUDE.md existants
- **Toutes les affirmations de version doivent citer une source** (context7 ID ou URL)
- **En cas d'échec d'un sous-agent**, laisser la section correspondante avec `⚠️ audit incomplet : <raison>`
- **Parallélisme obligatoire** au sein de chaque vague (un seul message = N Task calls)
- **Langue du rapport** : français, avec accents

## Exemple

```
/common:audit-freshness
/common:audit-freshness --wave=1 --stack=symfony
```
