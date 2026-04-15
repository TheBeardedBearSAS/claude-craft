# Phase 4 — Domination (6-12 mois, ~1380h)

> **Source** : `audit/00-SYNTHESIS.md` §"6-12 Mois : Domination (Outil Incontournable)"
> **Objectif** : Atteindre 10K stars GitHub, 100K downloads/semaine NPM, 1000+ membres Discord, revenue €200K+/an.
> **Owner-types requis** : Équipe 4-5 personnes temps plein (Dev, DevOps, Marketing, BD, Community, Formation).
> **Rapports sources** : tous (14 rapports) — phase de scaling + expansion.

## Pourquoi cette phase

- **Effets réseau consolidés** (phase 3) → capacité à scaler.
- **Fenêtre vs Anthropic Skills** se ferme → besoin d'être ancré communauté + enterprise.
- **Revenue actuel €2K/mois** → cible €16K+/mois pour soutenir équipe 4-5 FTE.
- **TAM €194M/an identifié** — capter 0.1% = €200K/an (objectif réaliste).
- **Certifications (ISO 27001 / SOC 2)** → débloquent marchés enterprise + publics EU.

## Prérequis

- [ ] Phase 3 ≥80% DoD (MRR €2K, marketplace 50+ skills, plugin system).
- [ ] Équipe 4-5 FTE stable avec rôles définis (CTO, Product, Marketing, Community, QA).
- [ ] Budget ISO 27001 / SOC 2 audit (~€15-30K).
- [ ] Partenariats en cours (Anthropic, Cursor Directory, Symfony SAS, Vercel).
- [ ] Entité légale commerciale opérationnelle.

## Actions (10)

| ID | Action | Effort | Impact | Rapport | Agent principal |
|----|--------|--------|--------|---------|-----------------|
| P4-31 | Open-core pivot : MIT base + Enterprise features payantes | 80h | Revenue €200K+/an | P3-26 | `@api-designer` + humain (Product/Legal) |
| P4-32 | Expansion Tier 1 : Go, Rust, Svelte (7 stacks total) | 200h | TAM ×1.5 | 04 FEAT-001 | équipe dev par stack |
| P4-33 | Anthropic Skills marketplace Top 10 position | 120h | Visibilité ×100 | P2-20, P3-23 | humain (Marketing) + `@research-assistant` |
| P4-34 | Communauté 1000+ membres Discord actifs | 160h | Effets réseau | P1-09, P2-17 | humain (Community Manager) |
| P4-35 | 100+ contributeurs externes (vs 1 actuel) | 200h | Bus factor 10+ | P2-19 | humain + `@research-assistant` |
| P4-36 | Partenariat Cursor Directory (rules publishing) | 40h | TAM ×2 | 03 COMP-003 | humain (BD) |
| P4-37 | Certification ISO 27001 / SOC 2 | 300h audit | Enterprise trust, marchés publics EU | 13 LEG-031 | `@devops-engineer` + `@security-auditor` + humain (Legal/CTO) |
| P4-38 | AI-agentic expansion (prompt eval, red-team LLM) | 120h | Différenciation vs concurrents | 04 FEAT-008 | `@api-designer` + `@security-auditor` |
| P4-39 | Monorepo tooling (Turborepo, Nx, pnpm workspaces) | 60h | Adoption monorepos enterprise | 04 FEAT-013 | `@refactoring-specialist` + `@devops-engineer` |
| P4-40 | Live coding / pair programming interactif | 100h | UX révolutionnaire, viralité | 04 FEAT-022 | `@api-designer` + `@ui-designer` |

**Total** : ~1380h.

## Batches parallèles

### Batch A — Scaling produit (parallèle, 3 agents)

```
Agent({
  subagent_type: "api-designer",
  description: "Open-core architecture",
  prompt: `
Contexte : pivot open-core. MIT base + enterprise features payantes. Cible €200K+/an.
Scope :
  1. Séparer repo en :
     - claude-craft (MIT, public) : BMAD base, 10 stacks Tier 1, skills, CLI.
     - claude-craft-enterprise (proprietary, license commerciale) :
       * SSO SAML/OIDC
       * Audit log immuable + export SIEM (Splunk, Elastic)
       * Multi-tenant dashboard
       * Priority support SLA
       * Advanced analytics (Posthog Enterprise feed)
  2. Mechanism : plugin loader charge enterprise si license key valide.
  3. License key serveur : Stripe Customer → JWT signé, vérification offline possible.
  4. Documentation claire de la séparation dans README + LICENSE.
DoD : repo enterprise créé, 3 features enterprise shipped, 2 clients payants confirmés.
Review obligatoire : @security-auditor (license mechanism), @tech-lead (architecture), avocat IP (licensing).
Recherches :
  - WebSearch "open core pivot open source 2026 GitLab Sentry model"
  - WebSearch "license key server Stripe JWT 2026"
`
})

Agent({
  subagent_type: "refactoring-specialist",
  description: "Expansion Tier 1 : Go, Rust, Svelte",
  prompt: `
Contexte : TAM +50% avec 3 nouveaux stacks. FEAT-001.
Scope par stack (Go / Rust / Svelte) :
  1. .claude/references/<stack>/ avec :
     - CLAUDE.md (150-200L vue d'ensemble)
     - rules/ (architecture, testing, security, perf, patterns idiomatiques).
  2. Skills /<stack>/ (check-testing, check-architecture, check-security, generate-*).
  3. Agent <stack>-reviewer avec scoring 100 points.
  4. Update agents-menu et docs/AGENTS.md.
  5. Traduction EN + FR minimum.
Pour chaque stack, déléguer à un sous-agent dédié (expertise profonde) :
  - Go : idiomatique, goroutines, context, net/http, gorilla/mux ou chi.
  - Rust : ownership, tokio, axum ou actix, serde.
  - Svelte 5 : runes, SvelteKit, stores, transitions.
DoD : 3 stacks Tier 1 publiés, docs EN+FR, reviewers scorent 100 points sur projet test.
Recherches par stack : WebSearch "<stack> best practices 2026 clean architecture".
`
})

Agent({
  subagent_type: "api-designer",
  description: "Live coding + AI-agentic expansion",
  prompt: `
Contexte : FEAT-022 (live coding) + FEAT-008 (prompt eval, red-team LLM). Différenciation vs concurrents.
Scope :
  1. Live coding : /live-coding command + WebSocket bridge Claude Code ↔ browser.
     - Partager session avec un pair (URL read-only).
     - Voir les steps Claude live (diff streaming).
  2. Prompt eval : /eval-prompt command :
     - Compare outputs de plusieurs prompts sur dataset.
     - Métriques : accuracy, latency, cost, hallucination rate.
  3. Red-team LLM : /red-team command :
     - Génère attaques prompt injection, jailbreak, data exfiltration.
     - Rapport vulnérabilités + mitigations.
  4. Intégration avec security-auditor agent.
DoD : 3 features shipped, docs + demos videos.
Research :
  - WebSearch "LLM red teaming framework 2026 OWASP LLM Top 10"
  - context7 : 'anthropics/anthropic-cookbook' red team examples
`
})
```

### Batch B — Compliance & trust (séquentiel interne, parallèle vs autres batches)

```
Agent({
  subagent_type: "security-auditor",
  description: "ISO 27001 / SOC 2 préparation",
  prompt: `
Contexte : marchés publics EU et enterprise exigent ISO 27001 ou SOC 2. LEG-031.
Scope préparation (avant audit externe) :
  1. Gap analysis vs ISO 27001:2022 Annex A controls :
     - A.5 policies, A.6 org, A.7 HR, A.8 asset mgmt, A.9 access control, A.10 crypto, A.11 physical, A.12 operations, A.13 comms, A.14 acquisition, A.15 suppliers, A.16 incident mgmt, A.17 BCP, A.18 compliance.
  2. Rédiger politiques manquantes (templates) :
     - Information Security Policy
     - Access Control Policy
     - Incident Response Plan
     - Business Continuity Plan
     - Supplier Management Policy
  3. Registre risques (risk treatment plan).
  4. Plan formation sensibilisation sécurité équipe.
  5. Choix cabinet audit (TÜV, BSI, DNV, Bureau Veritas, LNE) — 3 devis.
DoD : Gap analysis complet, 5 politiques draftées, registre risques, 3 devis audit.
Humain : Legal/CTO valide, avocat révise politiques, sélection cabinet.
Recherches :
  - WebSearch "ISO 27001 2022 open source SaaS checklist 2026"
  - WebSearch "SOC 2 Type II audit cost SaaS startup 2026"
`
})

// SUITE : audit externe (humain + cabinet)
// SÉQUENTIEL après gap analysis : 3-6 mois d'audit (hors périmètre phase 4 si trop long).
```

### Batch C — Communauté & Marketing scale (parallèle, 2 agents + humains)

```
Agent({
  subagent_type: "research-assistant",
  description: "Community scaling 1000+ Discord",
  prompt: `
Contexte : P4-34, P4-35 — scaler communauté Discord + contributeurs externes.
Scope recommandations (humain exécute) :
  1. Structure Discord escalable :
     - Salons par stack (#symfony, #react, #flutter, ...), par domaine (#help, #showcase, #contrib, #jobs).
     - Rôles : Contributor (≥1 PR), Top Contributor (≥10 PR), Certified (formation passée), Partner.
     - Bots : Statbot (welcome), Mee6 (modération), DiscordBot custom (annonces releases).
  2. Programme "Month of Contributors" :
     - 1 mois par stack : challenges, office hours live, rewards.
     - Rewards : badges Discord, mention AUTHORS.md, stickers, t-shirts.
  3. Good first issues → 50 actives en permanence (auto-refill via CI bot).
  4. Mentorship program : Top Contributors parrainent newbies.
  5. KPIs hebdo : new members, active members (J+7), PR externes, messages/sem.
DoD : docs/COMMUNITY-PLAYBOOK.md exhaustif (procédures, templates, scripts onboarding).
Community Manager humain exécute le playbook.
`
})

Agent({
  subagent_type: "research-assistant",
  description: "Anthropic Marketplace Top 10 + Cursor Directory",
  prompt: `
Contexte : P4-33, P4-36. Visibilité ×100.
Scope :
  1. Anthropic Top 10 stratégie :
     - Monitorer rankings, identifier top skills concurrents.
     - Publier 20+ skills additionnels ciblant gaps (ex. AWS, GCP, Azure helpers).
     - Case study officiel Anthropic blog (pitch aux relations publiques).
     - Webinar co-organisé si possible.
  2. Cursor Directory rules :
     - Identifier rules top 10 Cursor Directory.
     - Adapter/republier rules Claude-Craft compatibles Cursor.
     - Backlink mutuel.
  3. Packaging :
     - Badge "Featured on Anthropic Marketplace"
     - Badge "Featured on Cursor Directory"
     - Hero section landing page claude-craft.dev.
DoD : Top 10 position ≥1 marketplace, 3 rules publiées Cursor Directory, landing page à jour.
Recherches :
  - WebSearch "Anthropic marketplace skills ranking algorithm 2026"
  - WebSearch "Cursor directory community rules top 2026"
`
})
```

### Batch D — Features enterprise & monorepo (parallèle, 2 agents)

```
Agent({
  subagent_type: "refactoring-specialist",
  description: "Monorepo tooling integration",
  prompt: `
Contexte : FEAT-013 — enterprise utilise monorepos (Nx, Turborepo, pnpm workspaces, Lerna). Besoin support natif.
Scope :
  1. Détection auto monorepo : nx.json, turbo.json, pnpm-workspace.yaml, lerna.json.
  2. Commands adaptés : /team:audit --monorepo → parallèle par workspace.
  3. Partial audits : auditer uniquement packages affectés par PR (git diff).
  4. Cache audit results par workspace (speed up CI).
  5. Documentation guide 'Claude Craft in Monorepos'.
DoD : 3 types monorepos supportés, tests E2E par type, doc guide publié.
Références :
  - context7 : 'nrwl/nx', 'vercel/turborepo', 'pnpm/pnpm'
  - WebSearch "monorepo architecture 2026 affected projects CI"
`
})

Agent({
  subagent_type: "api-designer",
  description: "Enterprise features (SSO, audit log)",
  prompt: `
Contexte : Open-core (P4-31) nécessite features enterprise réelles.
Scope (claude-craft-enterprise repo) :
  1. SSO :
     - SAML 2.0 (Okta, Azure AD, OneLogin).
     - OIDC (Google Workspace, Auth0).
     - SCIM provisioning pour auto-sync users.
  2. Audit log :
     - Tous events : command, agent invocation, skill install, auth.
     - Immutable storage (append-only, hash chain).
     - Export formats : JSON Lines, CEF, LEEF (SIEM compat).
     - Retention configurable (90j-7ans).
  3. Multi-tenant dashboard :
     - Admin vue centralisée : users, usage, costs, audit events.
     - RBAC fine-grained.
  4. Priority support : Intercom ou Zendesk intégré avec SLA tracking.
DoD : 4 features enterprise shippées, 2 clients payants actifs, dashboard prod.
Security review obligatoire : @security-auditor (SSO, audit log integrity).
Legal review : retention policies GDPR compliance.
`
})
```

## Équipe d'agents recommandée

| Rôle | Agent | Scope |
|------|-------|-------|
| Architecture produit | `@api-designer` | P4-31, P4-38, P4-40 |
| Refactor scaling | `@refactoring-specialist` | P4-32, P4-39 |
| Sécurité/compliance | `@security-auditor` | P4-37, review P4-31, P4-38 |
| DevOps/compliance | `@devops-engineer` | P4-37, P4-39 |
| Research & drafts | `@research-assistant` | P4-33, P4-34, P4-35 |
| Review stack | `@{symfony,react,flutter,python,go,rust}-reviewer` | Validation P4-32 |
| Tech leadership | `@tech-lead` | Arbitrage multi-batches, review critique |
| Ralph autonomous | `@ralph-conductor` | Orchestration boucle 1-week sprints |

## Recherches web / MCP pré-rédigées

```javascript
WebSearch({ query: "open core pivot 2026 GitLab Sentry Element model" })
WebSearch({ query: "ISO 27001 2022 SaaS startup gap analysis 2026" })
WebSearch({ query: "SOC 2 Type II audit cost startup 2026" })
WebSearch({ query: "SAML SCIM SSO implementation NodeJS 2026" })
WebSearch({ query: "monorepo tooling Nx Turborepo pnpm 2026 enterprise" })
WebSearch({ query: "LLM red teaming OWASP Top 10 2026 framework" })
WebSearch({ query: "live coding collaboration session WebSocket 2026" })
WebSearch({ query: "Go idiomatic patterns 2026 clean architecture" })
WebSearch({ query: "Rust axum clean architecture 2026" })
WebSearch({ query: "Svelte 5 runes SvelteKit 2026 best practices" })

// Context7 lookups
// - nrwl/nx
// - vercel/turborepo
// - pnpm/pnpm
// - anthropics/anthropic-cookbook (red team)
// - passport-saml / node-saml
// - siem-cef / elastic-common-schema
```

## DoD & Validation

### Par action

- **P4-31** : Repo enterprise live, 2 clients payants, ARR ≥ €50K.
- **P4-32** : 3 stacks Tier 1 (Go, Rust, Svelte) en prod, reviewers scorent 100.
- **P4-33** : Top 10 Anthropic marketplace ≥ 1 mois consécutif.
- **P4-34** : Discord ≥ 1000 membres, ≥200 WAU messages.
- **P4-35** : ≥100 contributeurs externes avec ≥1 PR mergée chacun.
- **P4-36** : 3 rules publiées Cursor Directory, backlinks actifs.
- **P4-37** : Audit cabinet démarré (Phase 1 certification), gap analysis 100% couvert.
- **P4-38** : 3 features AI-agentic en prod (live coding, eval, red-team).
- **P4-39** : 3 types monorepos supportés, guide publié, ≥5 enterprise utilisent.
- **P4-40** : Live coding shipped, ≥50 sessions créées par mois.

### Validation globale

```bash
# North Star metrics
# - WAU ≥ 10 000
# - Activation Rate ≥ 75%
# - Retention 30J ≥ 55%
# - Bus Factor ≥ 8
# - NPS ≥ 50
# - Contributors externes ≥ 100

# Revenue
# - MRR ≥ €16K (€200K ARR)
# - Dual license clients ≥ 5
# - Formation sessions ≥ 4 trimestre

# Compliance
# - ISO 27001 audit démarré
# - SBOM + SLSA L3 automatisé
# - PRIVACY.md, CLA, Dual License à jour

/team:audit --scope=phase-4 --parallel --output=audit/phases/phase-4-results.md
```

## Risques & rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Anthropic lance marketplace natif concurrent | Moyenne | Moats : QA Recette standalone + plugin system + communauté 1000+ |
| ISO 27001 audit échoue | Basse | Gap analysis interne rigoureuse phase 4, consultant externe en amont |
| Open-core perçu comme bait-and-switch | Moyenne | Transparence totale : MIT core garanti à vie dans CHARTER.md |
| Expansion 3 stacks sans expertise suffisante | Haute | Recruter experts Go/Rust/Svelte contributeurs avant publication |
| Discord 1000 membres non atteints | Moyenne | Plan B : focus qualité (DAU/MAU) plutôt que taille absolue |
| Burnout équipe 1380h sur 6 mois | Haute | 4-5 FTE réels, pas 3 ; backlog priorisé strict ; rotation |
| Cursor Directory rejet | Basse | Alternative : Aider Rules, Cline Rules, propres canaux |

## Post-phase : revue stratégique 12 mois

À la fin de phase 4, produire `audit/phases/12-month-review.md` avec :
- Métriques vs cibles (toutes phases).
- Leçons apprises (post-mortem par phase).
- Roadmap 12-24 mois (année 2) : expansion internationale (US, APAC), IPO preparation ou acquisition strategy.
- Décision stratégique : continuer solo open-core vs levée fonds vs acquisition vs fondation (type Apache Foundation).

## Références croisées

- `audit/00-SYNTHESIS.md` §"North Star Metrics" — cibles 12 mois à valider.
- `audit/00-SYNTHESIS.md` §"Moats Défendables" — 6 moats à consolider phase 4.
- `audit/00-SYNTHESIS.md` §"Stratégie Go-to-Market" — phases PLG → CLG → Enterprise.
- `audit/00-SYNTHESIS.md` §"Budget & Ressources" — €155K budget 12 mois pour équipe 3-4 FTE.

**Fin de roadmap audit.** 🏁
