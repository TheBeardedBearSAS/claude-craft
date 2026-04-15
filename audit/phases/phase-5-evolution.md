# Phase 5 — Évolution (12-24 mois, ~2000h)

> **Source** : `audit/phases/phase-4-domination.md` §"Post-phase : revue stratégique 12 mois" + `audit/00-SYNTHESIS.md` §"Stratégie Go-to-Market" (phase Enterprise).
> **Objectif** : Boucler la roadmap audit par une rétrospective 12 mois chiffrée, puis projeter l'année 2 — expansion internationale (US + APAC), scaling enterprise (ARR €1M), gouvernance durable (foundation ou Series A), R&D différenciante.
> **Owner-types requis** : Équipe 5-6 personnes temps plein (CTO, Product, 2 Dev, BD, Community) + advisors board + cabinet juridique international.
> **Rapports sources** : tous (14 rapports) + métriques North Star accumulées phases 1-4.

## Pourquoi cette phase

- **Phase 4 close la fenêtre tactique** (0-12 mois vs Anthropic Skills). Année 2 = consolidation stratégique.
- **ARR €200K atteint (phase 4 DoD)** → inflexion : scaler à €1M ARR ou pivoter. Zone de mort entre €200K et €1M si rien change.
- **Fondation open-source vs entreprise commerciale** → décision structurante à prendre au mois 13, pas plus tard.
- **5 langues i18n + 10 stacks** → base internationale prête, mais GTM US/APAC non activé. TAM ×3 possible.
- **Équipe 4-5 FTE** commence à plafonner sur 1380h/6 mois (phase 4) → besoin de capital, acquisition ou gouvernance communautaire.
- **Rétrospective chiffrée obligatoire** avant toute décision : sans données, choix stratégique = biais de confirmation.

## Prérequis

- [ ] Phase 4 ≥80% DoD (WAU ≥10K, ARR ≥€200K, 100+ contributeurs, ISO 27001 audit démarré). **Si <80% → déclencher plan B phase 4 avant phase 5.**
- [ ] Budget année 2 validé (€300-500K bootstrap OU round Series A validé OU fondation chartée).
- [ ] Équipe 5-6 FTE stable (churn <15% sur phase 4).
- [ ] Board advisory constitué (minimum 3 advisors : technique, commercial, legal).
- [ ] Expert-comptable international opérationnel (FR/US/SG).
- [ ] Données télémétrie 12 mois exploitables (WAU, activation, retention, NPS, cost per customer).

## Actions (10)

| ID | Action | Effort | Impact | Rapport | Agent principal |
|----|--------|--------|--------|---------|-----------------|
| P5-41 | Rétrospective 12 mois chiffrée + post-mortem par phase | 80h | Décision capitale éclairée | Tous | `@research-assistant` + `@data-analyst` |
| P5-42 | Audit freshness annuel (versions, CVEs, best practices, drift i18n) | 120h | Dette technique contrôlée | 12 M-* | `@research-assistant` + `@cost-optimizer` |
| P5-43 | Expansion internationale : US (C-Corp Delaware) + APAC (SG/JP) | 240h | TAM ×3 | 03 COMP-* | humain (BD, Legal) + `@research-assistant` |
| P5-44 | Tier 2 stacks : Kotlin, Ruby, Elixir, Zig (4 nouveaux → 11 total) | 320h | TAM ×1.4 | 04 FEAT-001 | `@refactoring-specialist` + stack experts |
| P5-45 | Enterprise scale : 20 clients payants, ARR €1M | 280h | Autonomie financière | P3-26, P4-31 | humain (BD) + `@api-designer` |
| P5-46 | SOC 2 Type II finalisé + HIPAA gap analysis (marchés santé US) | 280h | Marchés régulés US | 13 LEG-031 | `@security-auditor` + `@devops-engineer` |
| P5-47 | Décision stratégique capital : bootstrap / Series A / acquisition / fondation | 100h | Trajectoire 3-5 ans | — | `@research-assistant` + humain (CTO, board) |
| P5-48 | Governance transition : Charter v2, board, trademark policy, voting rights | 160h | Bus factor ≥15, pérennité | 13 LEG-* | `@research-assistant` + humain (Legal) |
| P5-49 | DX research lab : AI-agentic avancé (autonomous coding, multi-agent evals publics) | 200h | Moat R&D | 04 FEAT-008 | `@api-designer` + `@security-auditor` |
| P5-50 | Claude-Craft Academy v2 : certifications ECTS + MOOC Coursera/edX | 220h | Revenue formation ×5 | P3-25 | humain (Formation) + `@research-assistant` |

**Total** : ~2000h.

## Batches parallèles

### Batch A — Rétrospective & Freshness (séquentiel interne, 1-2 agents)

```
Agent({
  subagent_type: "research-assistant",
  description: "Rétrospective 12 mois chiffrée",
  prompt: `
Contexte : fin année 1 roadmap audit claude-craft. 14 rapports audit initiaux, 4 phases exécutées.
Scope livrable audit/phases/retrospective-12-mois.md :
  1. Exécutif 1 page : verdict 12 mois (succès/partiel/échec) + North Star atteintes.
  2. Métriques vs cibles par phase (tableau) :
     - Phase 1 : DPO bloquers levés, TTFV <10min, EAA conformité.
     - Phase 2 : marketplace 50+ skills, MRR €2K, retention 30J.
     - Phase 3 : différenciation (QA Recette, plugin system, partenariats).
     - Phase 4 : WAU ≥10K, ARR ≥€200K, 100+ contributeurs.
  3. Post-mortem par phase (5 whys sur dérives majeures).
  4. ROI calcul : €155K budget → revenue généré, coût par acquisition, LTV/CAC.
  5. Bus factor évolution (phase 1 = 1, cible phase 4 = 8, réel ?).
  6. Lessons learned : 10 bullets actionnables.
DoD : document 8-12 pages, tableaux chiffrés, graphs Mermaid, pas de wishful thinking.
Sources : télémétrie Posthog, GitHub Insights, Stripe, Discord Statbot, NPM downloads.
Recherches :
  - context7 'posthog/posthog-js' pour extraction métriques
  - WebSearch "open source project retrospective template 2026"
`
})

Agent({
  subagent_type: "research-assistant",
  description: "Audit freshness annuel complet",
  prompt: `
Contexte : P5-42. Vérifier drift sur 12 mois : versions tech, best practices, CVEs, i18n.
Scope :
  1. Exécuter /common:audit-freshness sur 11 stacks (10 actuels + Go/Rust/Svelte phase 4).
  2. Scan CVEs deps : npm audit, composer audit, pip-audit, cargo audit, bundle audit.
  3. Drift i18n 5 langues : diff entre EN (source) et FR/ES/DE/PT, rapport % couverture.
  4. Obsolescence docs : tout fichier .md non modifié depuis 9 mois → flag.
  5. Regénérer i18n-gap.csv + top20 (existants dans audit/phases/).
  6. Produire audit/phases/freshness-annuel.md : tableau par stack (version actuelle, version cible, CVEs P0/P1, action).
DoD : 0 CVE P0 non traité, drift i18n <15% par langue, rapport signé CTO.
Recherches :
  - context7 lookups : chaque stack (derniers breaking changes)
  - WebSearch "OWASP dependency-check 2027"
`
})
```

### Batch B — Expansion produit (parallèle, 2 agents)

```
Agent({
  subagent_type: "refactoring-specialist",
  description: "Tier 2 stacks : Kotlin, Ruby, Elixir, Zig",
  prompt: `
Contexte : P5-44. TAM +40% avec 4 nouveaux stacks (demande enterprise + scale-ups).
Scope par stack (Kotlin / Ruby / Elixir / Zig) — scaffolding uniquement, itération avec experts ensuite :
  1. .claude/references/<stack>/ :
     - CLAUDE.md (150-200L vue d'ensemble).
     - rules/01-architecture.md, 02-testing.md, 03-security.md, 04-performance.md.
  2. Skills /<stack>/check-testing, check-architecture, check-security, generate-*.
  3. Agent <stack>-reviewer (scoring 100 points).
  4. Update agents-menu, docs/AGENTS.md, CLAUDE.md principal (table Supported Technologies passe à 11 stacks).
Spécificités par stack :
  - Kotlin : Spring Boot 3.5, Ktor 3, coroutines, Arrow-kt fonctionnel, Gradle Kotlin DSL.
  - Ruby : Rails 8, Hotwire, Sidekiq, RSpec, Sorbet typing, Bundler 2.
  - Elixir : Phoenix 1.8 + LiveView, OTP patterns, Ecto, ExUnit, Mix.
  - Zig : Zig 0.14, stdlib patterns, build system, cross-compile, no-hidden-alloc.
DoD : 4 stacks scaffoldés, docs EN+FR, tests unitaires scoring, mention docs principales.
Review obligatoire : experts recrutés (Kotlin/Ruby/Elixir/Zig) + @tech-lead.
Recherches par stack : WebSearch "<stack> clean architecture 2026 best practices".
`
})

Agent({
  subagent_type: "api-designer",
  description: "DX research lab : AI-agentic avancé",
  prompt: `
Contexte : P5-49. Moat R&D : publier benchmarks publics multi-agent pour établir leadership thought.
Scope :
  1. Autonomous coding agents :
     - Framework interne evaluating agents Claude/GPT/Gemini/Grok sur tâches codebase réelles.
     - Dataset public claude-craft-evals (100+ scenarios : refactor, bug-fix, new feature, security fix).
     - Métriques : task success, correctness, cost, time-to-solution, hallucination rate.
  2. Multi-agent orchestration :
     - Command /multi-agent-run : orchestre 3-5 agents spécialisés sur story complexe.
     - Benchmark vs agent monolithique (Opus solo).
  3. Evals publics :
     - Leaderboard claude-craft-evals.dev (comparaison modèles).
     - Rapport trimestriel "State of AI coding agents" (PR magnet).
  4. Partenariats recherche : Anthropic research, Stanford HAI, MILA, LightOn.
DoD : dataset public 100 scenarios, 1 leaderboard live, 2 rapports publiés, 1 paper coAuthored (ArXiv).
Review : @security-auditor (prompt injection dans evals), @data-analyst (méthodo stats).
Recherches :
  - WebSearch "SWE-bench verified 2027 autonomous coding agents"
  - WebSearch "multi-agent LLM orchestration benchmarks 2026"
  - context7 'anthropics/anthropic-cookbook'
`
})
```

### Batch C — GTM & Enterprise scale (1 agent + humains)

```
Agent({
  subagent_type: "research-assistant",
  description: "Expansion internationale US + APAC playbook",
  prompt: `
Contexte : P5-43. TAM ×3 via US (C-Corp Delaware) + APAC (Singapour hub, entrée Japon).
Scope livrable docs/expansion/INTERNATIONAL-PLAYBOOK.md :
  1. US :
     - Entité : Stripe Atlas C-Corp Delaware (€500, 1 semaine).
     - Fiscalité : sales tax states nexus (Avalara/TaxJar), 1099 si contractors, Federal EIN.
     - GTM : focus Y Combinator alumni + Next.js/Vercel audience (Tier 1 React).
     - Pricing USD conversion, ACH + wire + credit card via Stripe.
     - Legal : DMCA agent, privacy (CCPA California, Virginia, Colorado, Utah, Connecticut).
  2. APAC Singapour :
     - Entité : Pte Ltd (minimum 1 director local via Osome/Sleek, €1500).
     - GST 9% (seuil S$1M).
     - GTM : PHP (Laravel) community fort JP/KR/TW.
     - Partenariat SG startups (StartupSG, Enterprise SG grants).
  3. APAC Japon (après SG) :
     - KK (Kabushiki Kaisha) ou branch via SG.
     - Consumption tax 10% (seuil ¥10M).
     - GTM : Zenn / Qiita developers, localisation JP (6e langue).
  4. Budget année 2 : €50-80K entités + legal + comptable international.
  5. Timeline : M13-M15 US, M16-M20 SG, M21-M24 JP.
DoD : playbook 15 pages, 3 entités chemins validés, devis légaux obtenus.
Humain : BD + Legal décide activation par région.
Recherches :
  - WebSearch "Stripe Atlas Delaware C-Corp SaaS 2026"
  - WebSearch "Singapore Pte Ltd fintech SaaS 2026 GST"
  - WebSearch "Japan market entry developer tool 2026"
`
})

// Humain : P5-45 Enterprise scale (pipeline BD) — pas d'agent, suivi CRM manuel.
// Cibles : 20 clients payants, ARR €1M, CAC <€5K, LTV >€30K, churn <5% annuel.
```

### Batch D — Compliance scale (parallèle, 2 agents)

```
Agent({
  subagent_type: "security-auditor",
  description: "SOC 2 Type II finalisation + HIPAA gap analysis",
  prompt: `
Contexte : P5-46. ISO 27001 certifié (phase 4), SOC 2 Type II démarré, HIPAA requis pour santé US.
Scope :
  1. SOC 2 Type II (observation 6 mois) :
     - Policies alignées phase 4 (InfoSec, Access, Incident, BCP, Supplier) : maintenance évidences.
     - Trust Service Criteria : Security, Availability, Confidentiality (scope minimum).
     - Cabinet audit : Vanta/Drata tooling pour collect automatique evidences.
     - Audit Stage 1 (doc review) M18, Stage 2 (testing) M22-M24.
  2. HIPAA gap analysis (US santé) :
     - Privacy Rule, Security Rule (admin/physical/technical safeguards).
     - BAA templates (Business Associate Agreement).
     - Gaps vs ISO 27001 : PHI data flow mapping, access audit logs 6 ans, breach notification 60j.
     - Produire docs/compliance/HIPAA-GAP-ANALYSIS.md + 3 policies draft.
  3. ISO 27001 surveillance annuelle : préparation audit M15 (moins lourd que cert initiale).
DoD : SOC 2 Type II rapport clean, HIPAA gap analysis exhaustif, ISO 27001 surveillance passée.
Humain : Legal valide HIPAA, CTO budget cabinet audit (€25-40K SOC 2).
Recherches :
  - WebSearch "SOC 2 Type II Vanta Drata 2026 cost"
  - WebSearch "HIPAA compliance SaaS developer tool 2026"
  - WebSearch "ISO 27001 surveillance audit year 2 2026"
`
})

Agent({
  subagent_type: "devops-engineer",
  description: "SLSA L3 + supply chain hardening année 2",
  prompt: `
Contexte : SLSA L2 atteint phase 4. Passer à SLSA L3 (hermetic builds, reproducible, provenance signée).
Scope :
  1. Builds hermétiques : isolated network, pinned dependencies (hash-verified).
  2. Provenance : SLSA provenance v1.0 signée Sigstore Fulcio, stockée Rekor.
  3. Reproducible builds : 2 builders indépendants (GitHub Actions + self-hosted ou BuildBuddy), diff byte-level.
  4. SBOM 2.0 (SPDX 3 ou CycloneDX 1.6) par release + vérification consommateurs (in-toto attestations).
  5. Continuous fuzzing OSS-Fuzz enrollment (Google).
DoD : SLSA L3 attestations par release, OSS-Fuzz actif, 0 CVE critique non patché <48h.
Review : @security-auditor (chain of custody).
Recherches :
  - WebSearch "SLSA v1.1 hermetic build reproducible 2027"
  - context7 'slsa-framework/slsa-github-generator'
  - context7 'google/oss-fuzz'
`
})
```

### Batch E — Governance & capital (1 agent + humains)

```
Agent({
  subagent_type: "research-assistant",
  description: "Décision capital + Governance transition + Academy v2",
  prompt: `
Contexte : P5-47, P5-48, P5-50. Trajectoire 3-5 ans dépend de cette phase.
Scope 1 — Décision capital (ADR obligatoire) :
  docs/adr/0042-capital-strategy-year-2.md comparant 4 options :
    a) Bootstrap scale : réinvestir €200K ARR, croissance organique 2x/an.
    b) Series A : €2-5M, valo 10-15M€, dilution 20-30%, investisseurs spécialisés DevTools (Accel, Sequoia, Bessemer, Elaia, Accel London).
    c) Acquisition : cibles potentielles (GitLab, Sourcegraph, Cursor, Replit, ou stratégique Anthropic).
    d) Fondation Apache-style : gouvernance communautaire, sustainability via sponsorships corporate.
  Pour chaque option : pros/cons, timeline, fit culturel, impact équipe, scenarios output 3 ans.
Scope 2 — Governance transition :
  - CHARTER.md v2 (post-phase 4) : principes inaliénables (MIT core, transparence, plural voix).
  - Board advisory : 3-5 advisors (profils : opérateur SaaS, sécurité, fondation OSS, investisseur).
  - Trademark policy : délimiter usage "Claude Craft" (inspiré Mozilla, Rust, Python).
  - Voting rights : PMC model si fondation (committers, PMC members, emeritus).
  - Succession plan : bus factor ≥15, documentation "onboarding core maintainer".
Scope 3 — Academy v2 :
  - Partenariats universitaires : 2-3 écoles (Epitech, 42, ENSIMAG France + MIT OCW US).
  - Crédits ECTS : dossier accréditation (Crefop France, équivalent EU).
  - MOOC : proposition Coursera/edX (cours "AI-Assisted Dev with Claude Craft").
  - Certification premium : €500-1500 passage examen, taux réussite cible 70%.
  - Revenue model : split partenaire 50/50 (MOOC), 100% direct (exam).
DoD :
  - ADR 0042 mergé, décision board actée.
  - CHARTER.md v2 + trademark policy publiés.
  - 1 partenariat université signé, 1 MOOC en review Coursera.
Humain : CTO/board tranche capital ; Legal révise Charter/trademark ; BD négocie universités.
Recherches :
  - WebSearch "open source foundation vs startup SaaS 2026"
  - WebSearch "DevTools Series A valuation 2026 Y Combinator"
  - WebSearch "Apache Software Foundation project incubation 2026"
  - WebSearch "Coursera MOOC corporate partnership revenue model 2026"
`
})
```

## Équipe d'agents recommandée

| Rôle | Agent | Scope |
|------|-------|-------|
| Rétrospective & analyse | `@research-assistant` + `@data-analyst` | P5-41, P5-47, P5-48, P5-50 |
| Freshness & audit | `@research-assistant` + `@cost-optimizer` | P5-42 |
| Scaling produit | `@refactoring-specialist` | P5-44 |
| R&D différenciation | `@api-designer` + `@security-auditor` | P5-49 |
| GTM international | `@research-assistant` | P5-43 |
| Compliance | `@security-auditor` + `@devops-engineer` | P5-46 |
| Migration governance | `@migration-specialist` | P5-48 (transitions) |
| Review stacks Tier 2 | `@{kotlin,ruby,elixir,zig}-reviewer` (à créer P5-44) | P5-44 validation |
| Orchestration | `@ralph-conductor` | Boucles sprints année 2 |
| Arbitrage stratégique | `@tech-lead` + humain (CTO, board) | P5-47, P5-48 |

## Recherches web / MCP pré-rédigées

```javascript
WebSearch({ query: "open source project retrospective 12 months template 2026" })
WebSearch({ query: "SaaS DevTools Series A valuation 2026 metrics benchmark" })
WebSearch({ query: "Apache Software Foundation incubation process 2026" })
WebSearch({ query: "Stripe Atlas Delaware C-Corp developer tool SaaS 2026" })
WebSearch({ query: "Singapore Pte Ltd incorporation SaaS expansion 2026" })
WebSearch({ query: "SOC 2 Type II Vanta Drata automation cost 2026" })
WebSearch({ query: "HIPAA compliance developer tooling SaaS 2026" })
WebSearch({ query: "SLSA v1.1 hermetic builds reproducible 2027" })
WebSearch({ query: "Kotlin Spring Boot 3.5 clean architecture 2026" })
WebSearch({ query: "Ruby on Rails 8 Hotwire best practices 2026" })
WebSearch({ query: "Elixir Phoenix LiveView 1.8 2026 architecture" })
WebSearch({ query: "Zig 0.14 production deployment 2026" })
WebSearch({ query: "Coursera edX corporate MOOC revenue partnership 2026" })
WebSearch({ query: "multi-agent LLM orchestration benchmarks SWE-bench 2027" })

// Context7 lookups
// - anthropics/anthropic-cookbook (multi-agent patterns)
// - slsa-framework/slsa-github-generator
// - google/oss-fuzz
// - posthog/posthog-js (telemetry analysis)
// - vercel/turborepo (pour comparaison gouvernance DevTools OSS)
```

## DoD & Validation

### Par action

- **P5-41** : `retrospective-12-mois.md` publié, 10 lessons learned, chart Mermaid metrics vs cibles.
- **P5-42** : `freshness-annuel.md` publié, 0 CVE P0 non traité, drift i18n <15% par langue.
- **P5-43** : `INTERNATIONAL-PLAYBOOK.md` publié, entité US incorporée, 1 entité APAC en cours.
- **P5-44** : 4 stacks Tier 2 scaffoldés, 4 reviewers créés, 2 stacks ≥100 downloads CLI.
- **P5-45** : ARR ≥ €1M, ≥20 clients payants, churn <5% annuel, NRR ≥120%.
- **P5-46** : SOC 2 Type II rapport clean, HIPAA gap analysis publié, ISO 27001 surveillance M15 passée.
- **P5-47** : ADR 0042 mergé, décision board formalisée, trajectoire 3 ans documentée.
- **P5-48** : CHARTER.md v2 + trademark policy en prod, board advisory 3+ membres nommés.
- **P5-49** : Dataset public claude-craft-evals live, leaderboard actif, 2 rapports publiés, 1 paper ArXiv.
- **P5-50** : 1 partenariat université signé, 1 MOOC en production Coursera/edX, 50+ certifications délivrées.

### Validation globale année 2

```bash
# North Star année 2
# - WAU ≥ 30 000 (×3 vs phase 4)
# - Activation Rate ≥ 80%
# - Retention 30J ≥ 60%
# - Bus Factor ≥ 15
# - NPS ≥ 60
# - Contributeurs externes ≥ 300

# Revenue
# - ARR ≥ €1M
# - Clients enterprise ≥ 20
# - NRR ≥ 120%
# - Churn <5% annuel

# Compliance
# - SOC 2 Type II certifié
# - ISO 27001 surveillance passée
# - HIPAA-ready (gap analysis + policies)
# - SLSA L3 attestations automatiques

# Gouvernance
# - Charter v2 ratifié
# - Board advisory actif
# - Trademark policy publiée
# - Décision capital actée (ADR 0042)

/team:audit --scope=phase-5 --parallel --output=audit/phases/phase-5-results.md
/common:audit-freshness --comprehensive --output=audit/phases/freshness-annuel.md
```

## Risques & rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Échec décision capital (indécision >3 mois) | Moyenne | Deadline board M14, facilitation externe (consultant DevTools), fallback bootstrap |
| Series A refusée (signals marché) | Haute si marché froid | Plan B bootstrap + sponsorships (GitHub Sponsors Enterprise, OpenCollective, Sentry-style) |
| Entrée US rate (GTM produit-marché non atteint) | Moyenne | Pilot 6 mois avec C-Corp minimale, ne pas hire avant €250K ARR US |
| Expansion APAC trop tôt (ROI <2 ans) | Haute | Reporter Japon à année 3 si SG ROI insuffisant |
| Tier 2 stacks sans traction | Moyenne | Release beta publique, measure downloads/mois, cut stack si <100 après 6 mois |
| Fondation Apache-style = perte contrôle produit | Moyenne | Analyser modèles hybrides (Sentry, GitLab, PostHog) avant décision |
| SOC 2 Type II échoue Stage 2 | Basse | Vanta/Drata préparation continue, audit à blanc M20 avant M24 |
| Burnout équipe cumul (24 mois non-stop) | Haute | Sabbatiques 2 semaines obligatoires, recrutement +2 FTE début année 2, no-meeting Fridays |
| Anthropic change API/pricing (impact cost LLM) | Moyenne | Multi-provider (Anthropic + OpenAI + Gemini) dès eval P5-49, hedge contractuel |
| Concurrent acquisition (Cursor/Sourcegraph rachètent équivalent) | Moyenne | Accélérer moats (QA Recette, plugin system, evals publics) ; plan M&A défensif avec advisors |

## Fin de roadmap — Mode BAU

À l'issue de phase 5 (M24), la roadmap audit est considérée **achevée**. Transition vers mode Business-As-Usual :

- **Revue trimestrielle** : metrics North Star, backlog priorisé, release planning.
- **Audit freshness annuel** : re-exécuter `/common:audit-freshness --comprehensive` chaque M12.
- **Nouveau cycle audit** : à M36, relancer audit complet (14 rapports) pour identifier nouveaux gaps.
- **Archivage** : `audit/` devient historique ; workflow quotidien bascule sur `docs/roadmap/` + issue tracking GitHub.
- **Gouvernance continue** : board advisory se réunit trimestriellement, charter review annuel.

## Références croisées

- `audit/00-SYNTHESIS.md` §"North Star Metrics" — cibles année 2 extrapolées.
- `audit/00-SYNTHESIS.md` §"Moats Défendables" — 6 moats à consolider + nouveaux (evals publics, formation certifiante).
- `audit/00-SYNTHESIS.md` §"Budget & Ressources" — projection budget année 2.
- `audit/phases/phase-4-domination.md` §"Post-phase : revue stratégique 12 mois" — origine de cette phase.
- `audit/phases/phase-4-human-actions.md` §"Condition de passage à la revue 12 mois" — prérequis détaillés.

**Fin de roadmap claude-craft 24 mois.** 🏁🏁
