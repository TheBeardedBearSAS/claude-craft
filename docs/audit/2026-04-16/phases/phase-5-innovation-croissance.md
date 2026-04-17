# Phase 5 — Innovation & Croissance (6-24 mois, ~2000h)

## Objectif
Scaler vers €1M ARR : MCP servers, mode Autonomous Sprint, QA Recette standalone, expansion internationale, compliance enterprise. Score innovation cible : 6.5 → 8.5.

## Statut actuel
- Phases 4 et 5 des audits existants (`audit/phases/phase-4-domination.md`, `phase-5-evolution.md`) couvrent ce scope avec 2380h d'effort
- Focus ici : consolider les items innovation (rapport 10) + items long terme (rapports 03/08)
- Divisé en 3 horizons : court terme (6-9 mois), moyen terme (9-15 mois), long terme (15-24 mois)

## Prérequis
- Phase 4 ≥80% DoD (marketplace, multi-IDE, plugins, accessibility)
- MRR ≥ €500
- Bus factor ≥ 5
- Équipe 3-4 FTE stable

## Horizon 1 — Produit & Revenue (6-9 mois, ~500h)

### Sprint 5.1 — MCP Servers & QA Recette (mois 7-8)

#### Batch parallèle A — MCP Servers (2 agents)

Agent 1: `@api-designer`
Prompt:
```
Contexte : Publier les outils Claude Craft comme MCP servers = x10 marché adressable. Rapport 10 OPP-01, rapport 03 R5.

Tâche :
1. Architecturer les MCP servers :
   - Ralph MCP : orchestration tâches, DoD validators
   - RTK MCP : optimisation tokens, commandes proxy
   - QA Recette MCP : tests d'acceptance via Chrome
   - Kanban MCP : gestion tâches, board
2. Créer le package npm @claude-craft/mcp-servers
3. Spec MCP conforme : tools, resources, prompts
4. Tests unitaires pour chaque server
5. Documentation : docs/mcp/MCP-SERVERS.md

Recherches :
  WebSearch "MCP server specification TypeScript 2026"
  WebSearch "Anthropic MCP server publish marketplace 2026"
  context7 resolve-library-id '@modelcontextprotocol/sdk'
  context7 query-docs pour MCP server implementation

Fichiers : packages/mcp-servers/, docs/mcp/
DoD : 4 MCP servers fonctionnels, publiés sur npm, testés
```

Agent 2: `@api-designer` + `@refactoring-specialist`
Prompt:
```
Contexte : QA Recette = killer feature unique, potentiel produit standalone. Rapport 03 R3, rapport 10 OPP-04.

Tâche :
1. Architecture QA Recette standalone :
   - Séparer en repo github.com/the-bearded-cto/qa-recette
   - SDK : npm package @claude-craft/qa-recette
   - API : OpenAPI 3.2 spec pour intégration CI/CD
   - Chrome extension : publier sur Chrome Web Store
2. Rédiger RFC : docs/rfc/RFC-001-QA-RECETTE-STANDALONE.md
   - Scope, architecture, API, pricing (freemium + $9/mois)
   - Migration path depuis Claude Craft intégré
3. Préparer Stripe/Paddle integration
4. Tests E2E pour la séparation

Fichiers : docs/rfc/RFC-001-QA-RECETTE-STANDALONE.md, packages/qa-recette/
DoD : RFC publié, architecture validée, repo séparé initialisé
```

### Sprint 5.2 — Autonomous Sprint & Open-Core (mois 8-9)

#### Batch parallèle B — Features avancées (2 agents)

Agent 3: `@api-designer`
Prompt:
```
Contexte : Mode Autonomous Sprint = différenciateur radical. Rapport 10 OPP-02.

Tâche :
1. Concevoir le mode Autonomous Sprint :
   - Input : user story INVEST-compliant
   - Output : code implémenté + tests + PR
   - Human-in-the-loop : quality gates uniquement (PRD review, Tech Spec review, Code review)
   - Phases automatiques : analyse → plan → design → implement → test → PR
2. Prototype v0.1 :
   - Basé sur Ralph + BMAD v6
   - 1 story simple end-to-end (CRUD)
   - Métriques : temps total, interventions humaines, qualité code
3. Documentation : docs/guides/AUTONOMOUS-SPRINT.md

Fichiers : Project/AutonomousSprint/, docs/guides/AUTONOMOUS-SPRINT.md
DoD : 1 story complétée en mode autonomous (prototype), documenté
```

Agent 4: `@api-designer`
Prompt:
```
Contexte : Pivot open-core pour revenue enterprise. Rapport 03 R4 long terme.

Tâche :
1. Séparer features open-source vs enterprise :
   - MIT (gratuit) : toutes les commandes, agents, skills actuels
   - Enterprise (payant) : SSO/SAML, audit log, multi-tenant, SLA, support dédié
2. Créer repo github.com/the-bearded-cto/claude-craft-enterprise
3. Définir pricing tiers :
   - Community : gratuit (MIT)
   - Pro : €49/mois (support email, private skills)
   - Enterprise : €499/mois (SSO, audit, SLA 99.9%)
4. Documentation : docs/enterprise/PRICING.md, docs/enterprise/FEATURES.md

Fichiers : docs/enterprise/
DoD : séparation documentée, pricing défini, repo enterprise initialisé
```

## Horizon 2 — Expansion & Compliance (9-15 mois, ~700h)

### Sprint 5.3 — Stacks Expansion (mois 10-12)

#### Batch parallèle C — Nouveaux stacks (agents par stack)

Agent 5: `@refactoring-specialist` + stack experts
Prompt:
```
Contexte : Expansion vers Go, Rust, Svelte. Rapport 04 FUNC-01 long terme, rapport 03 R4.

Tâche :
1. Pour chaque stack (Go, Rust, Svelte) :
   - CLAUDE.md stack-specific dans .claude/references/{stack}/
   - 10 commandes (/stack:check-testing, check-code-quality, check-architecture, check-security, check-compliance, generate-component, + 4 spécifiques)
   - 1 agent reviewer (@{stack}-reviewer)
   - i18n EN + FR
2. Utiliser les stacks existants comme template

Recherches :
  context7 pour Go 1.24+, Rust 2024 edition, Svelte 5+
  WebSearch "Go best practices 2026"
  WebSearch "Rust 2024 edition patterns"
  WebSearch "Svelte 5 runes patterns 2026"

Fichiers : .claude/references/{go,rust,svelte}/, .claude/commands/{go,rust,svelte}/
DoD : 3 stacks × 10 commandes + 1 reviewer = 33 nouveaux fichiers
```

### Sprint 5.4 — Compliance Enterprise (mois 12-15)

#### Batch parallèle D — ISO & SOC (2 agents)

Agent 6: `@security-auditor` + `@devops-engineer`
Prompt:
```
Contexte : ISO 27001 et SOC 2 débloquent marchés enterprise et publics EU. Phase 4 audit rapport 13.

Tâche :
1. Gap analysis ISO 27001 :
   - Documenter dans docs/compliance/ISO27001-GAP-ANALYSIS.md
   - Identifier les 114 contrôles applicables
   - Évaluer conformité actuelle (estimée 40-50%)
   - Plan de remédiation avec effort par contrôle
2. Gap analysis SOC 2 Type I :
   - Trust Service Criteria (Security, Availability, Confidentiality)
   - Documenter dans docs/compliance/SOC2-GAP-ANALYSIS.md
3. Policies framework :
   - Information Security Policy
   - Access Control Policy
   - Incident Response Plan
   - Business Continuity Plan

Fichiers : docs/compliance/
DoD : 2 gap analysis publiés, 4 policies rédigées
```

Agent 7: `@devops-engineer`
Prompt:
```
Contexte : Consolider 41 agents infrastructure en skills plus maintenables. Rapport 04 FUNC-05.

Tâche :
1. Analyser les 41 agents infra dans .claude/agents/ liés à Infra/
2. Identifier lesquels sont réellement utilisés (grep dans commandes/skills)
3. Convertir les agents peu utilisés en skills
4. Garder comme agents : les plus complexes nécessitant un contexte dédié
5. Cible : réduire de 41 à ~15 agents infra + 26 skills

Fichiers : .claude/agents/*-engineer.md, .claude/skills/
DoD : agents infra réduits à ≤20, skills correspondants créés
```

## Horizon 3 — Scale & Gouvernance (15-24 mois, ~800h)

### Sprint 5.5 — International & Capital (mois 15-18)

#### Actions principalement humaines

| Action | Description | Effort | Agent support |
|--------|-------------|--------|---------------|
| P5-43 | Expansion US (Delaware C-Corp) + APAC (Singapour) | 240h | `@research-assistant` (drafts) |
| P5-45 | 20 clients enterprise, ARR €1M | 280h | humain (BD/Sales) |
| P5-47 | Décision capital : bootstrap / Series A / fondation | 100h | `@research-assistant` (ADR) |
| P5-48 | Governance transition : Charter v2, board | 160h | humain (Legal) |

#### Batch E — R&D (1 agent)

Agent 8: `@api-designer` + `@security-auditor`
Prompt:
```
Contexte : DX research lab pour maintenir l'avance. Rapport 10 OPP-02 long terme.

Tâche :
1. Framework d'évaluation public :
   - Benchmarks standardisés pour comparer AI coding tools
   - Métriques : TTFV, code quality, test coverage, bug rate
   - Dataset public : 50 tâches calibrées (CRUD, refactor, bug fix, feature)
2. Red-team LLM testing :
   - Prompt injection resistance tests
   - Hallucination detection patterns
   - Safety boundary testing
3. Publier sur claude-craft-evals.dev (ou GitHub Pages)

Fichiers : packages/evals/, docs/research/
DoD : 50 tâches benchmark publiées, 10 red-team tests, leaderboard public
```

### Sprint 5.6 — Formation & Communauté (mois 18-24)

#### Batch F — Academy v2 (1 agent + humain)

Agent 9: `@research-assistant`
Prompt:
```
Contexte : Formation certifiante à scaler. Rapport 10 OPP-05 long terme.

Tâche :
1. Curriculum MOOC "AI-First Development with Claude Craft" :
   - Module 1 : Introduction AI-first (2h)
   - Module 2 : TDD/BDD avec agents (4h)
   - Module 3 : Architecture Clean + DDD (4h)
   - Module 4 : Agent Teams & Orchestration (3h)
   - Module 5 : QA Recette & Continuous Testing (3h)
   - Module 6 : Production & DevOps (2h)
   - Examen final : projet intégré (8h)
2. Partenariat Coursera/edX : draft de proposition
3. Certifications : "Claude Craft Practitioner" et "Claude Craft Expert"

Fichiers : docs/training/MOOC-CURRICULUM.md, docs/training/CERTIFICATION.md
DoD : curriculum rédigé, proposition partenariat prête
```

#### Batch G — Rétrospective (1 agent)

Agent 10: `@data-analyst` + `@research-assistant`
Prompt:
```
Contexte : Rétrospective 12 mois obligatoire avant décision capital. Phase 5 rapport.

Tâche :
1. Template rétrospective : audit/phases/retrospective-12-mois.md
   - Métriques vs cibles par phase (tableau)
   - ROI par investissement
   - Leçons apprises (top 10)
   - What worked / What didn't / What to change
2. Audit freshness annuel : audit/phases/freshness-annuel.md
   - CVEs actifs
   - Versions driftées
   - I18n drift
   - Skills marketplace performance
3. ADR décision capital : docs/adr/0042-capital-strategy-year-2.md

Fichiers : audit/phases/retrospective-12-mois.md, audit/phases/freshness-annuel.md
DoD : templates rétrospective et freshness prêts, ADR structuré
```

## Recherches web/MCP pré-rédigées

```javascript
WebSearch({ query: "MCP server TypeScript SDK publish marketplace 2026" })
WebSearch({ query: "Chrome Web Store extension publish developer 2026" })
WebSearch({ query: "ISO 27001 gap analysis template software company 2026" })
WebSearch({ query: "SOC 2 Type I software startup requirements 2026" })
WebSearch({ query: "Go 1.24 best practices testing 2026" })
WebSearch({ query: "Rust 2024 edition testing framework 2026" })
WebSearch({ query: "Svelte 5 runes patterns testing 2026" })
WebSearch({ query: "AI coding tools benchmark evaluation framework 2026" })
WebSearch({ query: "Coursera university partnership MOOC proposal template" })
WebSearch({ query: "Delaware C-Corp formation SaaS startup 2026" })
mcp__context7__resolve-library-id({ libraryName: "@modelcontextprotocol/sdk" })
```

## DoD & Validation par horizon

### Horizon 1 (mois 9)
```bash
# MCP Servers
npm ls @claude-craft/mcp-servers  # Package existe
test -f docs/rfc/RFC-001-QA-RECETTE-STANDALONE.md  # RFC publié
test -f docs/enterprise/PRICING.md  # Pricing défini
```

### Horizon 2 (mois 15)
```bash
# Stacks
ls .claude/commands/go/ | wc -l  # ≥10
ls .claude/commands/rust/ | wc -l  # ≥10
ls .claude/commands/svelte/ | wc -l  # ≥10

# Compliance
test -f docs/compliance/ISO27001-GAP-ANALYSIS.md
test -f docs/compliance/SOC2-GAP-ANALYSIS.md
```

### Horizon 3 (mois 24)
```bash
test -f docs/adr/0042-capital-strategy-year-2.md
test -f docs/training/MOOC-CURRICULUM.md
test -f audit/phases/retrospective-12-mois.md
```

## Risques & Rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| MCP spec change avant release | Moyenne | Versionner SDK, adapter |
| QA Recette standalone cannibalise le framework | Faible | Bundling : QA Recette inclus dans Enterprise |
| ISO 27001 audit échoue | Moyenne | Pre-audit avec consultant |
| Autonomous Sprint pas assez fiable | Haute | Release en "beta", human-in-the-loop obligatoire |
| Expansion US trop coûteuse | Moyenne | Remote-first, Stripe Atlas pour C-Corp |
| Series A refusée | Haute | Plan B : bootstrap + GitHub Sponsors + corporate sponsors |

## Métriques de succès Phase 5

| Métrique | Cible Horizon 1 | Cible Horizon 2 | Cible Horizon 3 |
|----------|-----------------|-----------------|-----------------|
| ARR | €50K | €200K | €1M |
| WAU | 1K | 5K | 20K |
| Stars GitHub | 2K | 5K | 10K |
| Discord | 500 | 1K | 3K |
| Contributeurs | 20 | 50 | 100+ |
| Stacks Tier 1 | 4 | 7 | 11 |
| MCP servers | 4 | 6 | 10 |

---

> Cette phase est la plus ambitieuse et la plus dépendante de facteurs externes (marché, recrutement, financement). Réévaluer trimestriellement les priorités selon les métriques réelles.

← [phase-4-differenciation-ecosysteme.md](phase-4-differenciation-ecosysteme.md)
