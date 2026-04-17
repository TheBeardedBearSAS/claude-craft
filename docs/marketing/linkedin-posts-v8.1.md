# Claude-Craft v7.27 -> v8.1.0 -- Posts LinkedIn

**Deux posts** | **Langue** : Français | **Date cible** : semaines du 15 et 22 avril 2026

- **Post 1** : cycle v7.27 -> v7.35 (fondations IA-first, optimisations, audit 2026)
- **Post 2** : v8.0.0 + v8.1.0 (refonte spec Anthropic et UI Kanban locale)

---

# Post 1 -- v7.27 -> v7.35 : "Le cycle IA-first"

## Texte du post

9 versions en 3 semaines. Un seul fil rouge : transformer la façon dont Claude Code écrit du code.

Claude-Craft v7.27 à v7.35 a empilé cinq chantiers simultanés -- mémoire persistante, alignement 2026, principes Karpathy, pack-repo, lifecycle hooks -- sans jamais casser la compatibilité. Voici ce que ça change concrètement.

-- Mémoire et gouvernance des agents (v7.27-v7.28) --

Les 22 agents ont maintenant une mémoire persistante (`memory: user` ou `memory: project`) qui survit aux sessions. `settings.local.json` est passé de 49 KB (480 permissions accumulées) à ~1 KB via wildcards. 66 nouveaux tests, BATS intégré à la CI, parité i18n vérifiée automatiquement. Compatibilité Claude Code 2.1.107 : `/btw`, `/hooks`, `/reload-plugins`, `/proactive`, PreCompact blocking, WebFetch qui strippe `<style>/<script>` (-50 à -80% tokens).

-- Audit de fraîcheur 2026 (v7.29-v7.30) --

Les 10 stacks alignés sur l'état de l'art avril 2026 :
- React 19.2 + Compiler 1.0, Angular 20 LTS zoneless, Vue 3.5
- Python 3.14+ (free-threading, JIT), PHP 8.5, Laravel 13, Symfony 8
- Flutter 3.41 / Dart 3.11, React Native 0.85 New Architecture

19e stack ajouté : **Paperclip** (AI-workforce orchestration). Sécurité OWASP Top 10:2025, SLSA 1.0, Sigstore, Argon2id 2026, EdDSA/DPoP, CSP Level 3. Testing 2026 : Vitest 4 Browser Mode, Pest 4 browser testing, mutation testing (Stryker, Infection, Mutmut).

-- Cinq phases IA-first (v7.31-v7.35) --

Un plan structuré issu de l'analyse de 12 ressources LinkedIn Claude Code :

**Phase 1** : principes Karpathy codifiés en règle -- `state assumptions explicitly`, `minimal code no speculation`, `surface confusion`. Pattern GSD atomic-tasks (combat le context rot après 50%). Convention DESIGN.md pour design systems AI-friendly.

**Phase 2** : trois skills Superpowers -- `architect` (architecture avant TDD), `debug-methodical` (reproduce > isolate > fix > verify), `socratic-brainstorm` (5 familles de questions avant d'écrire une ligne).

**Phase 3** : commande `/common:pack-repo` -- wrapper Repomix avec fallback shell 100% autonome. Pack la codebase en XML/Markdown/JSON. Token counting natif.

**Phase 4** : audit de conformité des 42 skills vs spec Anthropic. 4 nouveaux agents : `@security-auditor` (OWASP/SAST/SBOM), `@data-analyst`, `@migration-specialist` (zero-downtime), `@cost-optimizer` (FinOps LLM). Commande `/uiux:generate-design-md`.

**Phase 5** : memory lifecycle hooks inspirés de claude-mem (49k stars). SQLite 100% local, zéro télémétrie. 5 hooks couvrant SessionStart, UserPromptSubmit, PostToolUse, PreCompact, SessionEnd.

-- Les chiffres --

212 commandes, 63 agents, 26 namespaces, 19 stacks technos, 5 langues. Et dans une semaine, v8.0.0 : la refonte conforme à la spec officielle Anthropic Agent Skills.

Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

#ClaudeCode #AIFirst #DevTools #OpenSource #Karpathy #OWASP2025

## Prompt Gemini (illustration Post 1)

> Create a modern tech illustration for a LinkedIn post about a structured AI-first development framework evolution. The scene shows a horizontal progression with five connected milestone pillars rising from a dark surface. Pillar 1 (shortest, left): memory chip with cyan circuits (agent memory). Pillar 2: stacked tech logos in amber (2026 stack alignment). Pillars 3-4-5 (increasing height): brain-graph hybrid in purple (Karpathy principles), assembled puzzle pieces in teal (Superpowers skills), glowing SQLite database icon in electric green (memory lifecycle). Electric connections of cyan light flow between pillars. Background: dark navy (#0a0a1a) with subtle geometric grid. Color palette: cyan (#00d4ff), amber (#ff6b35), purple (#a78bfa), teal (#14b8a6), green (#16a34a). Style: flat vector, clean, professional, no text overlay. Aspect ratio 1200x627.

## Vérification Post 1

| Élément | Caractères | Limite LinkedIn |
|---------|------------|-----------------|
| Post complet | ~2600 | < 3000 |
| Hook (3 premières lignes) | ~160 | < 210 idéal |

### Correspondance features/CHANGELOG

| Feature citée | Version | Confirmé |
|---------------|---------|----------|
| Agents memory + effort field | v7.27.0 | oui |
| Settings 49 KB -> 1 KB consolidation | v7.27.0 | oui |
| BATS en CI + 66 tests | v7.27.0 | oui |
| Claude Code 2.1.107 (btw, hooks, reload-plugins, proactive) | v7.28.0 | oui |
| WebFetch stripe style/script -50-80% | v7.28.0 | oui |
| 10 stacks bumpés 2026 | v7.29.0 | oui |
| Paperclip 19e stack | v7.30.0 | oui |
| OWASP 2025 / SLSA / Argon2id / EdDSA / DPoP | v7.29.0 | oui |
| Vitest 4 Browser Mode / Pest 4 / mutation testing | v7.29.0 | oui |
| Principes Karpathy (rule 23) | v7.31.0 | oui |
| Skill atomic-tasks GSD | v7.31.0 | oui |
| Convention DESIGN.md | v7.31.0 | oui |
| Skills architect / debug-methodical / socratic-brainstorm | v7.32.0 | oui |
| /common:pack-repo (Repomix wrapper) | v7.33.0 | oui |
| 4 agents security-auditor/data-analyst/migration-specialist/cost-optimizer | v7.34.0 | oui |
| /uiux:generate-design-md | v7.34.0 | oui |
| Memory lifecycle hooks (claude-mem inspired, SQLite) | v7.35.0 | oui |

### FAQ anticipées Post 1

| Question | Réponse suggérée |
|----------|------------------|
| "Les principes Karpathy, c'est théorique ?" | "Non. `state assumptions explicitly` force à documenter les hypothèses avant de coder. `minimal code` interdit le code spéculatif. `surface confusion` : poser la question au lieu de deviner. Les 3 sont des rules du framework." |
| "La mémoire des agents va où ?" | "SQLite local dans `.claude/memory.db` (gitignored). 100% sur votre machine, zéro télémétrie. Inspiré de claude-mem (49k stars GitHub)." |
| "Pack-repo vs git archive ?" | "pack-repo produit du contenu AI-friendly (XML/Markdown avec contexte structuré), respecte .gitignore via git ls-files, skip les binaires et les fichiers > 500KB, compte les tokens (encoding o200k_base). git archive ne fait rien de tout ça." |

### Hashtags Post 1

Primaires : `#ClaudeCode` `#AIFirst` `#DevTools` `#OpenSource`
Secondaires : `#Karpathy` `#OWASP2025`

---

# Post 2 -- v8.0.0 + v8.1.0 : "La refonte et le Kanban local"

## Texte du post

Deux sorties en 48h. La v8.0.0 aligne strictement Claude-Craft sur la spec officielle Anthropic Agent Skills. La v8.1.0 ajoute une commande qui change la façon de piloter un sprint :

```
claude-craft kanban --open
```

-- v8.0.0 -- conformité stricte (breaking) --

Les 42 skills du framework ont été audités et mis en conformité avec la spec Agent Skills publiée par Anthropic. Breaking assumé, pour garantir la portabilité avec tout l'écosystème officiel. 2 écarts mineurs corrigés (`remotion`, `remotion-best-practices`). Migration documentée.

-- v8.1.0 -- Kanban UI locale pour BMAD v6 --

Un serveur local (127.0.0.1 exclusif) qui rend lisible votre dossier `project-management/` en un coup d'œil. Cinq vues :

- **Kanban** 6 colonnes avec drag-and-drop. State machine + gates INVEST/DoD validés côté serveur, jamais contournables.
- **Backlog tree** Epic > Stories avec progression par epic.
- **Burndown** idéal vs réel du sprint actif, indicateur on-track / at-risk / behind.
- **Graphe de dépendances** inter-stories avec détection de cycles en rouge.
- **Viewer markdown** pour PRD, tech-spec, personas, architecture. Les liens `[US-XXX]` ouvrent directement la carte Kanban correspondante.

Côté technique, tout est local-first :

- Écritures atomiques du frontmatter YAML (lock exclusif + backup + rollback + contrôle mtime comme un ETag)
- File-watcher chokidar qui reflète vos éditions VS Code en temps réel via SSE
- CSP stricte, same-origin obligatoire pour toute mutation, zéro appel réseau sortant
- Stack Svelte 5 + Hono, bundle main **19.6 KB gzip**
- Cytoscape.js (graphe) n'est téléchargé qu'à la visite de la route -- code splitting dynamique

Bonus de la release : 4 commandes d'audit PHP 8.5 -- `/php:check-{architecture,code-quality,security,testing}`.

-- Les chiffres v8.1.0 --

214 commandes, 67 agents, 27 namespaces, 19 stacks technos, 5 langues. 154 tests unitaires et d'intégration sur le module Kanban seul, 773 tests totaux verts en CI.

Pour essayer sur un projet BMAD existant :

```
npx @the-bearded-bear/claude-craft@latest kanban --open
```

Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

#ClaudeCode #DevTools #OpenSource #BMAD #Svelte #Kanban

## Prompt Gemini (illustration Post 2)

> Create a modern tech illustration for a LinkedIn post about a local Kanban UI for software development. The scene shows a laptop screen (centered) displaying a stylized Kanban board with 6 columns of floating cards in various colors. One card is mid-drag, leaving a ghost trail of light. Above the laptop, a small floating shield icon (#16a34a green) represents local security (127.0.0.1). Behind the laptop, ambient holograms show subtly: a burndown curve, a dependency graph with nodes and edges, and a markdown document. The Svelte logo glows subtly in the bottom-right corner. Background: dark navy (#0a0a1a) with radial gradient. Color palette: orange (#ff6b35) for Kanban cards, cyan (#00d4ff) for tech elements, green (#16a34a) for security, purple (#a78bfa) for dependency graph nodes. Style: flat vector, clean, professional, no text overlay. Aspect ratio 1200x627.

## Vérification Post 2

| Élément | Caractères | Limite LinkedIn |
|---------|------------|-----------------|
| Post complet | ~2100 | < 3000 |
| Hook (3 premières lignes) | ~170 | < 210 idéal |

### Correspondance features/CHANGELOG

| Feature citée | Version | Confirmé |
|---------------|---------|----------|
| Alignement spec Anthropic Agent Skills (breaking) | v8.0.0 | oui |
| 42 skills audités, 2 écarts remotion corrigés | v8.0.0 | oui |
| claude-craft kanban commande | v8.1.0 | oui |
| Bind 127.0.0.1 exclusif | v8.1.0 | oui |
| State machine + gates INVEST/DoD côté serveur | v8.1.0 | oui |
| 5 vues (Kanban, Backlog, Burndown, Deps, Docs) | v8.1.0 | oui |
| Écritures atomiques frontmatter (lock + backup + mtime) | v8.1.0 | oui |
| File-watcher chokidar + SSE | v8.1.0 | oui |
| Stack Svelte 5 + Hono | v8.1.0 | oui |
| Bundle main 19.6 KB gzip + code-splitting Cytoscape | v8.1.0 | oui |
| 4 commandes /php:check-* | v8.1.0 | oui |
| 214 commandes, 67 agents, 27 namespaces, 19 stacks | v8.1.0 | oui |
| 154 tests kanban, 773 totaux | v8.1.0 | oui |

### FAQ anticipées Post 2

| Question | Réponse suggérée |
|----------|------------------|
| "Le Kanban marche sur un projet non-BMAD ?" | "Il lui faut un dossier `project-management/` avec la structure BMAD v6. Pour un projet classique, générer cette structure via `/workflow:plan`." |
| "Pourquoi Svelte 5 et pas React ?" | "Bundle 3-5x plus petit pour un binaire NPM. Main à 19.6 KB gzip au lieu de ~60 KB avec React. Critique pour un outil CLI installé à la demande." |
| "Breaking change v8.0.0, c'est grave ?" | "Uniquement pour les projets qui utilisaient des skills non conformes. Migration documentée. L'intérêt : portabilité avec l'écosystème officiel Anthropic." |
| "127.0.0.1 c'est sûr ?" | "Même-origine obligatoire, CSP stricte, path traversal bloqué, mutations atomiques avec rollback. Aucun appel réseau sortant. Code ouvert, auditable." |
| "Les gates sont contournables ?" | "Non, la state machine est côté serveur. Le client propose, le serveur dispose. Impossible de passer un INVEST 4/6 en ready-for-dev via l'UI ou même via curl." |
| "Ça remplace Jira ?" | "Non, c'est un outil de revue locale pour un projet solo ou dev-first. Pas de collaboration multi-utilisateurs, pas de persistence externe. Les fichiers `.md` restent la source de vérité versionnable dans Git." |

### Hashtags Post 2

Primaires : `#ClaudeCode` `#DevTools` `#OpenSource`
Secondaires : `#BMAD` `#Svelte` `#Kanban`

---

## Calendrier de publication suggéré

| Post | Semaine cible | Jour optimal |
|------|---------------|--------------|
| Post 1 (cycle IA-first) | Semaine du 15 avril 2026 | Mardi 14h30 CET |
| Post 2 (Kanban + v8.0) | Semaine du 22 avril 2026 | Jeudi 10h00 CET |

Le délai de 7 jours entre les deux laisse le temps au premier post de performer (engagement, partages) sans cannibaliser le second.
