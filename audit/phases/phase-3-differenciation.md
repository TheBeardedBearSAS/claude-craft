# Phase 3 — Différenciation (3-6 mois, ~668h)

> **Source** : `audit/00-SYNTHESIS.md` §"3-6 Mois : Différenciation (Produit Unique + Revenue)"
> **Objectif** : Créer des moats défendables vs commoditisation Anthropic + amorcer un revenue stream (€50-100K/an cible).
> **Owner-types requis** : Dev senior, Product, Marketing/BD, Formation, Legal, DevOps.
> **Rapports sources** : 03 (Concurrentiel), 04 (Features), 06 (Performance), 10 (Communauté), 13 (Légal).

## Pourquoi cette phase

- **Commoditisation Anthropic imminente** (probabilité 60% sous 12 mois). Besoin de moats défendables.
- **Bus factor stabilisé** (phase 2) → capacité à construire du produit et non juste maintenir.
- **Communauté amorcée** (phase 2) → effets réseau activables (marketplace skills, plugin ecosystem).
- **Revenue stream nécessaire** pour financer équipe (€155K/an budget).
- **QA Recette** = killer feature extractible en produit standalone.

## Prérequis

- [ ] Phase 2 ≥80% DoD (bus factor 3, coverage 60%, i18n top 20).
- [ ] 10 skills déjà sur marketplace Anthropic (P2-20).
- [ ] Budget extension Chrome dev ($5/mois store fee + dev time).
- [ ] Stripe/Paddle/LemonSqueezy account setup (monétisation).
- [ ] Entité légale adaptée (SAS/SASU/SARL FR ou équivalent) pour commercialisation.
- [ ] Conseil juridique dual license confirmé (avocat IP, ~€2-5K).

## Actions (10)

| ID | Action | Effort | Impact | Rapport | Agent principal |
|----|--------|--------|--------|---------|-----------------|
| P3-21 | Extraction QA Recette en produit standalone | 120h | Moat + revenue | 03, 04 | `@api-designer` + `@refactoring-specialist` |
| P3-22 | Chrome extension QA Recette payante ($9/mois, cible €5-10K MRR) | 80h | Revenue recurrent | P3-21 | `@ui-designer` + dev |
| P3-23 | Skills marketplace communautaire (skills.claude-craft.dev) | 60h | Effets réseau | 10 COMM-015 | `@api-designer` + `@devops-engineer` |
| P3-24 | Partenariat Anthropic officiel (BMAD natif) | 40h négociation | Légitimité | 03 COMP-002 | humain (CEO/BD) |
| P3-25 | Formation certifiante européenne (€500/personne) | 80h création | Revenue €20-50K/an | 03 opportunité | humain + `@research-assistant` |
| P3-26 | Dual licensing MIT / Commercial (SLA enterprise) | 24h | Revenue €5-20K/contrat | 13 LEG-009 | humain (legal) + `@research-assistant` |
| P3-27 | Talks conférences (Devoxx FR/BE, Symfony Live, React Conf) | 60h | Visibilité ×10 | 10 COMM-008 | humain (marketing+dev) |
| P3-28 | Blog posts techniques (DEV.to, Medium, HashNode) 1/sem × 20 | 80h | SEO, inbound | 10 COMM-009 | humain + `@research-assistant` |
| P3-29 | Plugin system + template extensibility | 100h | Écosystème tiers, lock-in | 04 FEAT-017 | `@api-designer` + `@refactoring-specialist` |
| P3-30 | Observability utilisateur opt-in (Sentry, Posthog) | 24h | Données data-driven | 05 C-25 / 02 E-22 | `@devops-engineer` |

**Total** : ~668h.

## Batches parallèles

### Batch A — Produit standalone QA Recette (séquentiel interne, parallèle vs autres batches)

```
Agent({
  subagent_type: "api-designer",
  description: "QA Recette architecture standalone",
  prompt: `
Contexte : QA Recette est un killer feature de Claude Craft (acceptance testing via Chrome + Claude).
Objectif : extraire en produit indépendant (moat + revenue). Rapports 03, 04.
Scope phase 1 (architecture) :
  1. Identifier le code actuel (probablement .claude/commands/qa/ + chrome extension v1.0.36+).
  2. Concevoir API publique : qa-recette-sdk (npm package) exposant :
     - createSession({ scope, id }): Session
     - runTests(config): Report
     - resume(sessionId): Session
  3. Séparation claire : SDK open-source MIT (public) vs extension Chrome propriétaire (payante).
  4. Spec OpenAPI 3.2 pour l'API cloud (backend minimal : stockage sessions, auth).
  5. Schema : rôle du backend vs local-first (privilégier local, cloud optionnel).
Livrables :
  - docs/qa-recette/ARCHITECTURE.md
  - docs/qa-recette/api-spec.yaml (OpenAPI 3.2)
  - Proposition de repo séparé : github.com/the-bearded-cto/qa-recette
DoD : architecture validée par @tech-lead, RFC publié sur GitHub Discussions pour feedback communauté.
`
})

// APRÈS l'architecture validée
Agent({
  subagent_type: "ui-designer",
  description: "Chrome extension UX monétisation",
  prompt: `
Contexte : Chrome extension QA Recette payante $9/mois, cible €5-10K MRR.
Scope :
  1. Refonte UI extension (basée sur v1.0.36+) avec design system DESIGN.md.
  2. Intégration licence : free tier (5 sessions/mois) + paid tier (illimité, cloud sync).
  3. Paiement via Stripe Checkout + Stripe Customer Portal.
  4. Onboarding 3 étapes : install → authentifier Claude API → première session (TTFV <5 min).
  5. Respecter a11y (WCAG 2.2 AA) et i18n (EN + FR minimum).
Recherches :
  - WebSearch "Chrome extension Manifest V3 monetization Stripe 2026"
  - WebSearch "SaaS freemium conversion rate dev tools 2026"
DoD : Design Figma validé, prototype navigable, pricing page publiée sur qa-recette.com.
`
})
```

### Batch B — Marketplace & Plugins (parallèle, 2 agents)

```
Agent({
  subagent_type: "api-designer",
  description: "Skills marketplace communautaire",
  prompt: `
Contexte : Effets réseau à construire. Communauté peut publier skills customs. COMM-015.
Scope :
  1. Site skills.claude-craft.dev (Astro/Next.js statique) :
     - Catalogue skills avec tags (stack, domain, rating).
     - Recherche full-text (Pagefind ou FlexSearch).
     - Profils contributeurs, stats downloads.
  2. Backend minimal : hébergement skills (peut être GitHub raw + index JSON généré CI).
  3. CLI : 'claude-craft skill install <name>' clone + registre local.
  4. Review workflow : PR skills/<name>/SKILL.md validée par 2 mainteneurs.
  5. Rewards contributeurs : badge 'Top Contributor', mention AUTHORS.md.
DoD : site live, catalogue de 30+ skills (10 officiels + 20 communautaires), CLI fonctionnel.
Références :
  - WebSearch "Cursor directory rules community 2026"
  - WebSearch "NPM registry alternative skills plugins 2026"
`
})

Agent({
  subagent_type: "refactoring-specialist",
  description: "Plugin system + template extensibility",
  prompt: `
Contexte : FEAT-017 — plugin architecture permet lock-in et écosystème tiers.
Scope :
  1. Définir API plugin (.claude/plugins/<name>/plugin.json + hooks).
  2. Hooks exposés : beforeCommand, afterCommand, onAudit, onReport, beforeRelease.
  3. Sandboxing : limiter accès filesystem + réseau par permissions déclarées.
  4. Template starter : 'npx create-claude-craft-plugin'.
  5. Docs/plugins/README.md avec 3 examples (lint-custom, notify-slack, export-pdf).
DoD : plugin system versionné v1.0.0, 3 examples fonctionnels, starter template publié NPM.
Respect SOLID/KISS (rapport 07). Review par @tech-lead avant merge.
`
})
```

### Batch C — Revenue & Partenariats (parallèle, 1 agent + humains)

```
// P3-24 humain : négociation Anthropic
// Action CEO : prise de contact Anthropic partnerships
// - Pitch : BMAD intégration native Claude Code, co-marketing, revenue share
// - Asset : skills marketplace top 10 (phase 2), showcases, métriques adoption
// - Objectif : annonce officielle dans blog Anthropic + mention keynote

Agent({
  subagent_type: "research-assistant",
  description: "Formation certifiante + Dual license draft",
  prompt: `
Contexte : Revenue streams complémentaires : formation €500/pers + SLA enterprise €5-20K/contrat.
Scope formation (P3-25) :
  1. Curriculum 'Claude Craft Certified Developer' 2 jours :
     - Jour 1 : BMAD v6, workflow, commands, agents (Symfony/React focus).
     - Jour 2 : Kanban, QA Recette, Ralph, customization (plugins).
  2. Plateforme : Teachable / LearnDash / self-hosted.
  3. Certification : examen 30 questions + projet pratique.
  4. Prix : €500 early bird, €800 standard, discount volume 10+ dev.
  5. Première session pilote : 5 participants gratuits (témoignages).
Scope dual license (P3-26) :
  1. Drafter LICENSE-COMMERCIAL.md (template Sidekiq ou Qt Commercial).
  2. Clause : MIT restant libre pour dev solo/petites entreprises <€1M revenue, Commercial requis au-delà OU si besoin SLA.
  3. SLA template : response time (24h/4h/1h selon tier), dédié support channel, priority bug fix.
  4. Tarifs : Starter €5K/an, Team €12K/an, Enterprise €25K/an.
  5. Contractualisation via Stripe Invoicing ou Paddle.
Recherches :
  - WebSearch "dual license open source SaaS template Sidekiq 2026"
  - WebSearch "open source SLA enterprise pricing 2026"
DoD :
  - Curriculum publié docs/formation/CERTIFIED.md
  - LICENSE-COMMERCIAL.md committed, README explique mode dual
  - Landing page formation.claude-craft.dev
  - 1 client pilote formation + 1 contrat SLA signé (preuve de traction)
IMPORTANT : valider les drafts avec avocat IP avant publication finale.
`
})
```

### Batch D — Marketing & Observability (parallèle, 1 agent + humains)

```
// P3-27 + P3-28 = humain principalement
// Marketing/CEO : soumettre talks, rédiger posts
// Agent aide à draft contenu :

Agent({
  subagent_type: "research-assistant",
  description: "Blog posts + conf talks drafts",
  prompt: `
Contexte : 20 blog posts + 3-5 talks à préparer phase 3.
Actions :
  1. Générer 20 titres + outlines blog posts stratégiques :
     - Techniques : "How Claude Craft reduces sprint planning from 10h to 10min"
     - Comparatifs : "Claude Craft vs Cursor Rules vs BMad-Method"
     - Tutoriels : "Build a Symfony feature with /team:delivery"
     - Case studies : reprendre showcases phase 2
  2. Pour 5 posts prioritaires (les plus SEO-friendly) : rédiger draft complet ~1500 mots.
  3. Draft 3 abstracts conf :
     - Devoxx FR : "AI-first dev : de 3 mois à 3 semaines avec BMAD v6"
     - Symfony Live : "Claude Craft pour Symfony : DDD, CQRS, QA Recette"
     - React Conf : "React 19 + Compiler + Claude Craft"
  4. Calendrier éditorial dans docs/marketing/EDITORIAL.md.
DoD : 20 outlines + 5 drafts + 3 abstracts + calendrier.
`
})

Agent({
  subagent_type: "devops-engineer",
  description: "Observability opt-in Posthog + Sentry",
  prompt: `
Contexte : Aucun data-driven decision possible sans télémétrie (C-25, E-22).
Scope (strict opt-in pour respecter GDPR/PRIVACY.md phase 1) :
  1. Intégrer Posthog self-hosted ou cloud EU (résidence données EU) :
     - Events : command_executed, agent_invoked, audit_completed, error_occurred.
     - Pas d'identifiants personnels, juste UUID anonyme local.
  2. Sentry pour erreurs (self-hosted ou cloud EU) :
     - Source maps, breadcrumbs, scrub PII par défaut.
  3. Opt-in UX : premier run, affiche consentement avec 3 boutons (Accept / Decline / Remind later).
  4. Config .claude/telemetry.json avec override env (CLAUDE_CRAFT_TELEMETRY=off).
  5. Dashboard public stats.claude-craft.dev (WAU, commands top 10, errors rate).
  6. Update PRIVACY.md (phase 1) avec détails télémétrie.
Recherches :
  - WebSearch "Posthog opt-in CLI tool 2026 GDPR"
  - context7 : 'posthog/posthog-node'
DoD : télémétrie opt-in fonctionnelle, dashboard public, PRIVACY.md à jour, zéro PII envoyée (audit RGPD).
`
})
```

## Équipe d'agents recommandée

| Rôle | Agent | Scope |
|------|-------|-------|
| Architecture produit | `@api-designer` | P3-21, P3-23, P3-29 |
| Refactor | `@refactoring-specialist` | P3-21, P3-29 |
| UI/UX | `@ui-designer` + `@ux-ergonome` + `@accessibility-expert` | P3-22 |
| DevOps | `@devops-engineer` | P3-23 backend, P3-30 |
| Legal/drafts | `@research-assistant` | P3-25, P3-26 |
| Marketing drafts | `@research-assistant` | P3-27, P3-28 |
| Coordination | `@ralph-conductor` | Orchestration multi-batches |
| Tech leadership | `@tech-lead` | Review architectures, arbitrage |
| Sécurité review | `@security-auditor` | Review observability (pas de PII), dual license |

## Recherches web / MCP pré-rédigées

```javascript
WebSearch({ query: "Anthropic partnerships program 2026 startup" })
WebSearch({ query: "Chrome extension Stripe monetization Manifest V3 2026" })
WebSearch({ query: "dual license open source commercial SLA template 2026" })
WebSearch({ query: "developer certification program monetization 2026" })
WebSearch({ query: "Devoxx France 2026 call for papers AI" })
WebSearch({ query: "Symfony Live 2026 speaker submission" })
WebSearch({ query: "Posthog GDPR opt-in CLI developer tool 2026" })
WebSearch({ query: "plugin system NPM extensibility sandbox 2026" })
WebSearch({ query: "skills marketplace Cursor directory model 2026" })

// Context7
// - posthog/posthog-node
// - stripe/stripe-node (pour billing)
// - cloudflare/pages (hosting skills.claude-craft.dev)
```

## DoD & Validation

### Par action

- **P3-21** : Repo github.com/the-bearded-cto/qa-recette créé + RFC public + architecture validée.
- **P3-22** : Extension publiée Chrome Web Store + 10 souscriptions payantes actives.
- **P3-23** : skills.claude-craft.dev live + 30 skills catalogués + 100 installs CLI total.
- **P3-24** : Lettre d'intention ou MoU Anthropic signé, ou à défaut, skills marketplace Top 10.
- **P3-25** : 1 session pilote tenue avec ≥5 participants, NPS ≥40.
- **P3-26** : LICENSE-COMMERCIAL.md en place, 1 contrat SLA signé.
- **P3-27** : 1 talk accepté conf majeure (Devoxx, Symfony Live, React Conf).
- **P3-28** : 20 blog posts publiés (1/semaine), ≥2000 views total cumulés.
- **P3-29** : Plugin system v1.0.0, 3 plugins communautaires externes.
- **P3-30** : Télémétrie opt-in en prod, dashboard public, ≥500 users opt-in.

### Validation globale

```bash
# Revenue tracking
/team:audit --scope=phase-3 --focus=revenue,moats
# Attendu : MRR Chrome ≥ €500, pipeline SLA ≥ 3 leads

# Métriques North Star phase 3
# - MRR ≥ €1000 (Chrome ext + SLA)
# - Marketplace skills ≥ 30
# - Contributors externes ≥ 30
# - Discord ≥ 500 membres
# - 20 blog posts + 1 talk conf
# - Plugin system 3 plugins tiers
```

## Risques & rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Anthropic refuse partenariat | Moyenne | Plan B : rester communauté-first, skills marketplace top position |
| Chrome extension MRR <€500 après 3 mois | Moyenne | Pivot modèle : lifetime license €99, ou free avec upsell cloud |
| Dual license confusion communauté | Haute | Communication claire README : MIT reste par défaut, commercial opt-in |
| Formation pas assez d'inscriptions | Moyenne | Pilote gratuit + témoignages, réduire prix early cohort |
| Plugin system mal designé (complexité) | Moyenne | RFC communautaire avant release v1.0, dogfood sur 3 plugins internes |
| Surcharge équipe (668h en 3 mois) | Haute | Strict prioritisation : produit (A) > Marketplace (B) > Revenue (C) > Marketing (D) |

## Prochaine phase

**Conditions de passage vers phase 4** :
- [ ] MRR ≥ €2000/mois (Chrome + SLA + formation)
- [ ] Marketplace skills ≥ 50 skills, ≥1000 installs cumulés
- [ ] Plugin system adopté : ≥5 plugins tiers
- [ ] Télémétrie : WAU ≥ 500 users opt-in
- [ ] Partenariat Anthropic formalisé OU skills marketplace Top 10 position
- [ ] Équipe stable : 3-4 personnes temps plein

→ [phase-4-domination.md](phase-4-domination.md)
