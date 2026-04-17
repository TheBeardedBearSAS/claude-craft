# Phase 4 — Différenciation & Écosystème (3-6 mois, ~450h)

## Objectif
Construire des moats défendables : Skills Hub, multi-IDE, plugin system, accessibilité. Revenue MRR cible : €2K. Score compétitif cible : 7.5 → 9.0.

## Statut actuel
- Phase 3 différenciation (`audit/phases/phase-3-differenciation.md`) : prompts agents livrés pour QA Recette standalone, marketplace, plugin system
- Actions compétitives rapports 03/04/10 à exécuter
- Accessibilité Kanban (rapport 02 DX-25/26/27) non commencée

## Prérequis
- Phase 2 ≥80% DoD (qualité code, bus factor ≥3)
- Phase 3 ≥60% DoD (auto-complétion, recherche)
- Entité légale pour commercialisation (si dual licensing)
- Compte marketplace Anthropic (si disponible)

## Actions restantes

### Sprint 4.1 — Skills Hub & Multi-IDE (semaine 1-4)

#### Batch parallèle A — Marketplace & Distribution (2 agents)

**Agent 1: `@api-designer`**

Prompt:
```
Contexte : Menace commoditisation Anthropic Skills Hub (probabilité 60% sous 12 mois). Rapport 03 R1.

Tâche :
1. Identifier le spec officiel : WebSearch "Anthropic Skills marketplace publish specification 2026"
2. Sélectionner 10 skills les plus universels :
   - architect, testing, security, git-workflow, documentation
   - solid-principles, kiss-dry-yagni, debug-methodical, socratic-brainstorm, atomic-tasks
3. Adapter frontmatter pour marketplace (spec officiel)
4. Publier sous namespace 'claude-craft/' avec attribution 'by The Bearded CTO'
5. README marketplace avec lien GitHub, Discord, showcases

Fichiers : .claude/skills/*/SKILL.md, skills-marketplace/
DoD : 10 skills publiés (ou prêts à publier si marketplace pas encore GA)
```

**Agent 2: `@refactoring-specialist`**

Prompt:
```
Contexte : Lock-in Claude Code = marché limité. Cursor et Windsurf représentent 40%+ du marché IDE AI. Rapport 03 R2, rapport 04 FUNC-18, rapport 10 OPP-08.

Tâche :
1. Étudier les formats requis :
   - Cursor : .cursorrules format (WebSearch "Cursor rules file format 2026")
   - Windsurf : .windsurfrules format (WebSearch "Windsurf rules format 2026")
2. Créer un exporteur automatique : scripts/export-multi-ide.sh
   - Input : .claude/CLAUDE.md + .claude/rules/*.md + .claude/skills/*/SKILL.md
   - Output : bundles/cursor/rules.md, bundles/windsurf/rules.md
3. Exporter pour les 4 stacks Tier 1 (Symfony, React, Flutter, Python)
4. Documenter dans docs/guides/MULTI-IDE.md

Recherches :
  WebSearch "Cursor rules format specification 2026"
  WebSearch "Windsurf rules configuration 2026"
  WebSearch "Claude Code to Cursor rules converter 2026"

Fichiers : scripts/export-multi-ide.sh, bundles/cursor/, bundles/windsurf/, docs/guides/MULTI-IDE.md
DoD : bundles Cursor et Windsurf générés pour 4 stacks, export automatisé
```

#### Batch parallèle B — Communication & Positionnement (1 agent + humain)

**Agent 3: `@research-assistant`**

Prompt:
```
Contexte : Communiquer méthodologie > features. Rapport 03 R7. Réduire à 4 stacks Tier 1. Rapport 03 R4.

Tâche :
1. Rédiger document de positionnement : docs/marketing/POSITIONING.md
   - Lead : "AI-first TDD methodology framework"
   - Différenciateurs : QA Recette, BMAD v6, RTK, Agent Teams
   - Comparaison honnête vs Cursor, SuperClaude, Claude-Flow
2. Formaliser tiers de stacks :
   - Tier 1 (production-ready, SLA) : Symfony, React, Flutter, Python
   - Tier 2 (stable, community-maintained) : Angular, Vue.js, Laravel, React Native, C#, PHP
   - Tier 3 (experimental) : Go, Rust, Svelte, Paperclip
3. Documenter dans CLAUDE.md et README.md
4. Créer programme Champions (R6) : docs/community/CHAMPIONS.md
   - 3-5 contributeurs actifs, badge GitHub, accès preview releases

Fichiers : docs/marketing/POSITIONING.md, docs/community/CHAMPIONS.md, .claude/CLAUDE.md
DoD : positionnement documenté, tiers formalisés, programme Champions lancé
```

### Sprint 4.2 — Agents, Templates & Skills (semaine 5-8)

#### Batch parallèle C — Enrichissement fonctionnel (3 agents)

**Agent 4: `@api-designer`**

Prompt:
```
Contexte : 4 agents manquants pour couverture complète. Rapport 04 FUNC-06.

Tâche : Créer 4 agents avec frontmatter, description, tools, instructions :
1. @observability-engineer : monitoring, logging, tracing (OpenTelemetry, Grafana, Datadog)
2. @chaos-engineer : resilience testing, fault injection (Litmus, Gremlin)
3. @ml-ops-engineer : ML pipelines, model deployment, feature stores
4. @devex-engineer : developer experience, tooling, onboarding

Fichiers : .claude/agents/{observability,chaos,mlops,devex}-engineer.md
DoD : 4 agents créés, référencés dans docs/AGENTS.md, testables via @agent-name
```

**Agent 5: `@api-designer`**

Prompt:
```
Contexte : 7 skills manquants pour pratiques 2026. Rapport 04 FUNC-08.

Tâche : Créer 7 skills (SKILL.md < 80 lignes + REFERENCE.md détaillé) :
1. observability : OpenTelemetry, structured logging, distributed tracing
2. api-gateway : Kong, Traefik, API Gateway patterns
3. event-driven : Event Sourcing, CQRS events, Saga patterns
4. graphql-federation : Apollo Federation, schema stitching
5. wasm : WebAssembly integration patterns
6. edge-computing : Cloudflare Workers, Deno Deploy, edge patterns
7. monorepo : Nx, Turborepo, pnpm workspaces, shared configs

Recherches : context7 pour chaque sujet (versions actuelles)
Fichiers : .claude/skills/{observability,api-gateway,event-driven,graphql,wasm,edge,monorepo}/SKILL.md
DoD : 7 skills créés, < 80 lignes chacun, REFERENCE.md associé
```

**Agent 6: `@api-designer`**

Prompt:
```
Contexte : 8 templates manquants. Rapport 04 FUNC-21.

Tâche : Créer 8 templates dans .claude/templates/ :
1. middleware.md : middleware/interceptor pattern (Express, Symfony, Laravel)
2. event-handler.md : event listener/subscriber pattern
3. migration.md : database migration template (up/down)
4. interceptor.md : HTTP interceptor (Angular, Axios)
5. decorator.md : decorator pattern (Python, TypeScript)
6. factory.md : factory/abstract factory pattern
7. saga.md : saga/process manager pattern (async)
8. projection.md : CQRS read model projection

Fichiers : .claude/templates/*.md
DoD : 8 templates créés, exemples pour au moins 2 stacks chacun
```

### Sprint 4.3 — Accessibilité & UI (semaine 9-12)

#### Batch parallèle D — Kanban UI (2 agents)

**Agent 7: `@accessibility-expert`**

Prompt:
```
Contexte : Kanban UI manque d'accessibilité. Rapport 02 DX-25. EAA 2025 (juin) obligation légale EU.

Tâche :
1. Audit accessibilité complet du Kanban :
   - Tester avec axe-core ou pa11y
   - Identifier toutes les violations WCAG 2.1 AA
2. Corriger :
   - Navigation clavier complète (Tab, Enter, Escape, Flèches)
   - Menu contextuel clavier (Alt+M) pour déplacer cartes
   - aria-labels sur tous les éléments interactifs
   - aria-live pour annoncer les déplacements de cartes
   - Focus visible (outline) sur tous les éléments
   - Screen reader compatible
3. Responsive mobile (DX-26) : breakpoints 768px et 480px
4. Dark mode (DX-27) : CSS variables + media query prefers-color-scheme

Recherches :
  WebSearch "WCAG 2.2 AA kanban drag drop keyboard navigation 2026"
  WebSearch "European Accessibility Act 2025 software compliance"

Fichiers : website/kanban/ (ou équivalent)
DoD : axe-core 0 violation AA, navigation clavier 100%, responsive OK, dark mode OK
```

**Agent 8: `@security-auditor`**

Prompt:
```
Contexte : Kanban server sans authentification ni rate limiting. Rapport 01 SEC-07/08.

Tâche :
1. Ajouter token auth au Kanban server (SEC-07) :
   - Token généré au démarrage, affiché dans le terminal
   - Header Authorization: Bearer <token> requis
   - Token stocké en mémoire (pas de fichier)
2. Rate limiter (SEC-08) :
   - 100 requêtes/minute par IP
   - 429 Too Many Requests si dépassé
3. Sécurité headers HTTP supplémentaires (SEC-03 partiellement)

Fichiers : cli/kanban-server.js (ou équivalent)
DoD : Kanban nécessite token, rate limiter actif, tests sécurité passent
```

#### Batch parallèle E — Plugin system (1 agent, long)

**Agent 9: `@api-designer` + `@refactoring-specialist`**

Prompt:
```
Contexte : Pas de système de plugins tiers. Rapport 04 FUNC-29 / rapport 07 ARCH-29.

Tâche :
1. Concevoir API plugin system :
   - Hooks : beforeCommand, afterCommand, onAudit, onReport
   - Plugin format : package NPM avec interface standard
   - Configuration dans .claude/plugins/ ou settings.json
2. Implémenter v1.0 :
   - Chargement dynamique des plugins
   - Isolation (pas d'accès aux internals)
   - Commande /plugins list, /plugins install, /plugins remove
3. Créer 3 plugins exemples :
   - plugin-eslint : lint automatique post-generate
   - plugin-notify : notification Slack/Discord post-audit
   - plugin-metrics : collecte métriques usage anonymisées
4. Documentation : docs/plugins/PLUGIN-DEVELOPMENT.md

Fichiers : cli/plugin-loader.js, docs/plugins/, .claude/commands/common/plugins.md
DoD : 3 plugins exemples fonctionnels, API documentée, /plugins list fonctionne
```

## Actions humaines (non automatisables)

| Action | Description | Effort | Owner |
|--------|-------------|--------|-------|
| R6 | Recruter 3-5 Champions communautaires | 40h ongoing | Community Manager |
| R7 | Talks conférences (Devoxx, Symfony Live, React Conf) | 60h | CEO/Dev |
| P3-24 | Partenariat Anthropic officiel | 40h négociation | CEO |
| P3-25 | Formation certifiante €500/personne | 80h création | Formation |
| P3-26 | Dual licensing MIT / Commercial | 24h | Legal |

## Recherches web/MCP pré-rédigées

```javascript
WebSearch({ query: "Anthropic Skills marketplace publish specification 2026" })
WebSearch({ query: "Cursor rules format specification 2026" })
WebSearch({ query: "Windsurf rules configuration format 2026" })
WebSearch({ query: "WCAG 2.2 AA kanban drag drop keyboard 2026" })
WebSearch({ query: "Node.js plugin system architecture 2026" })
WebSearch({ query: "European Accessibility Act 2025 software developer tools" })
mcp__context7__resolve-library-id({ libraryName: "krisk/fuse" })
```

## DoD & Validation globale

```bash
# Skills Hub
ls skills-marketplace/ | wc -l  # ≥10

# Multi-IDE
test -f bundles/cursor/rules.md && echo "OK Cursor"
test -f bundles/windsurf/rules.md && echo "OK Windsurf"

# Agents
ls .claude/agents/ | wc -l  # ≥30 (26 + 4 nouveaux)

# Skills
ls .claude/skills/ | wc -l  # ≥48 (41 + 7 nouveaux)

# Templates
ls .claude/templates/*.md | wc -l  # ≥38 (30 + 8 nouveaux)

# Accessibilité
npx axe-core website/kanban/  # 0 violation AA

# Plugins
/plugins list  # Affiche 3 plugins exemples

# Positionnement
test -f docs/marketing/POSITIONING.md && echo "OK positioning"
```

## Risques & Rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Marketplace Anthropic pas encore ouvert | Haute | Skills prêts, publier dès ouverture |
| Format Cursor/Windsurf change | Moyenne | Exporteur configurable, pas hardcodé |
| Plugin system trop complexe | Moyenne | MVP : hooks simples, pas d'API riche |
| Accessibilité Kanban casse UX existante | Faible | Tests de régression visuels |
| Dual licensing confuse communauté | Moyenne | FAQ claire dans README |

## Condition de passage à Phase 5

- [ ] 10 skills publiés sur marketplace (ou prêts)
- [ ] Bundles Cursor + Windsurf pour 4 stacks
- [ ] Tiers de stacks formalisés (Tier 1/2/3)
- [ ] 4 agents + 7 skills + 8 templates créés
- [ ] Kanban accessible AA + responsive + dark mode
- [ ] Plugin system v1.0 avec 3 exemples
- [ ] Programme Champions lancé
- [ ] MRR ≥ €500 (formation ou SLA)

→ [phase-5-innovation-croissance.md](phase-5-innovation-croissance.md)
