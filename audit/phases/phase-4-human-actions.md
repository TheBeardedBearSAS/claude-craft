# Phase 4 — Actions humaines restantes

> Le scope automatisable (architectures, drafts, policies, scaffolding, playbooks) est livré dans ce commit. Cette page liste ce qui reste sous responsabilité humaine, dépendances externes, ou développement itératif multi-sprints.
>
> **Prérequis global** : phase 3 ≥80% DoD atteint (MRR €2K, marketplace 50+ skills, plugin system). Si non atteint, voir plan B dans `phase-3-human-actions.md`.
>
> Livrables présents dans ce commit :
> - **P4-31** : `CHARTER.md`, `LICENSE-ENTERPRISE.md` (DRAFT), `docs/enterprise/ARCHITECTURE.md`, `docs/enterprise/FEATURES.md`
> - **P4-32** : `.claude/references/{go,rust,svelte}/CLAUDE.md` + `rules/01-architecture.md`, `rules/02-testing.md`, `rules/03-security.md` (12 fichiers)
> - **P4-33** : `audit/phases/phase-4-marketing/ANTHROPIC-TOP10.md` (playbook + 20 skills gaps)
> - **P4-34** : `docs/community/COMMUNITY-PLAYBOOK.md`
> - **P4-35** : `docs/community/CONTRIBUTOR-PROGRAM.md`
> - **P4-36** : `audit/phases/phase-4-marketing/CURSOR-DIRECTORY.md` (+ 1 rule draft)
> - **P4-37** : `docs/compliance/ISO27001-GAP-ANALYSIS.md` + 5 policies (InfoSec, Access Control, Incident Response, BCP, Supplier Mgmt) — toutes DRAFT
> - **P4-38** : `docs/ai-agentic/ARCHITECTURE.md` (eval-prompt + red-team LLM + OWASP LLM Top 10)
> - **P4-39** : `docs/monorepo/ARCHITECTURE.md`
> - **P4-40** : `docs/live-coding/ARCHITECTURE.md`

## P4-31 — Open-core pivot (80h restant ~60h)

**Status** : architecture + drafts légaux livrés. **Ne rien publier sans review avocat IP**.

**Actions humaines** :
1. Engager avocat IP spécialisé OSS + licences commerciales (budget €3-8K)
2. Revue `LICENSE-ENTERPRISE.md` + `CHARTER.md` (clauses France + juridictions cibles US/UK/DE si expansion)
3. Créer entité commerciale (SASU France ou équivalent) — SIRET, TVA intracommunautaire
4. Compte Stripe Atlas ou Stripe France — KYC, Connect si revenue-share partenaires
5. Créer repo privé `claude-craft-enterprise` (GitHub Org Enterprise ou GitLab Ultimate self-hosted)
6. Décider stratégie build (monorepo privé avec subtree vers public, ou repos séparés avec CI sync)
7. Implémenter runtime license key (clé privée RS256 serveur, vérification CLI, révocation via CRL)
8. Commercialisation : identifier 2 clients pilotes (contacts existants, lettres d'intention)

**Dépendances externes** :
- Avocat IP (délai 2-4 semaines)
- Expert-comptable pour fiscalité SaaS (VAT-OSS EU, sales tax US si applicable)
- Validation CHARTER.md par communauté (30j comment period)

**DoD** : ARR ≥ €50K signé avec 2 clients payants, license mechanism vérifié en prod, audit avocat validé.

## P4-32 — Expansion Tier 1 Go/Rust/Svelte (200h restant ~160h)

**Status** : references scaffolding livré (CLAUDE.md + rules architecture/testing/security pour chaque stack). Agents reviewers, skills, commandes à produire via itération avec vrais projets.

**Actions humaines / itératives** :
1. Recruter 3 experts stack (Go, Rust, Svelte) — contributeurs externes, freelances, ou CDD
2. Valider references sur 2-3 projets réels par stack (production-grade)
3. Créer agents reviewers : `@go-reviewer`, `@rust-reviewer`, `@svelte-reviewer` (scoring 100 points)
4. Créer commandes : `/go:*`, `/rust:*`, `/svelte:*` (check-testing, check-architecture, check-security, generate-*)
5. Ajouter règles manquantes : patterns idiomatiques profonds (goroutines, Rust ownership, Svelte runes), performance, observability
6. Traductions EN + FR minimum (+ DE/ES/PT si budget)
7. Mettre à jour `CLAUDE.md` principal (table "Supported Technologies"), `docs/AGENTS.md`, `docs/COMMANDS.md`
8. Documentation examples projets

**Dépendances** :
- Recrutement experts (2-3 mois)
- Tests terrain projets réels (4-6 mois rétroaction)

**DoD** : 3 stacks Tier 1 publiés, reviewers scorent 100 sur projets test, ≥ 50 downloads CLI par stack.

## P4-33 — Anthropic Marketplace Top 10 (120h, 100% humain marketing)

**Status** : playbook livré (stratégie, 20 skills gaps identifiés, pitch case study draft).

**Actions humaines** :
1. Publier 20 skills additionnels identifiés dans le playbook (prioriser AWS/GCP/K8s)
2. Monitoring hebdomadaire rankings (scraping via Puppeteer ou API si disponible)
3. Pitch Anthropic Developer Relations : email + demo live 30min
4. Co-organiser webinar (target mois M+3)
5. Case study officiel blog Anthropic (angle adoption + stats)
6. Badge "Featured on Anthropic Marketplace" sur landing page
7. Cross-post publications (Twitter/X, LinkedIn, DEV.to) avec tag `@AnthropicAI`

**Dépendances** :
- Relation Anthropic DevRel (cycle 2-6 mois)
- Content marketing ressource (rédacteur, designer)

**DoD** : Top 10 Anthropic marketplace ≥ 1 mois consécutif.

## P4-34 — Communauté Discord 1000+ (160h, 100% humain community manager)

**Status** : playbook livré (structure, rôles, bots, rewards, KPIs, crise management).

**Actions humaines** :
1. Recruter Community Manager temps plein ou freelance 20h/semaine (budget €3-5K/mois)
2. Setup Discord selon playbook : salons, rôles, bots (Mee6 Pro €12/mois, Statbot, custom bot dev)
3. Intégration GitHub → Discord (auto annonces releases, PR mergées)
4. Programme "Month of Contributors" : lancement sur 13 mois
5. Office hours hebdo (Zoom ou Discord Stage) : 1h/semaine, rotation stacks
6. Rewards logistics : fournisseur swag (Printful, Spreadshirt), budget €200/mois
7. Modération : recruter 3-5 modérateurs volontaires (Top Contributors)
8. Marketing communauté : LinkedIn posts mensuels, YouTube Shorts, demos Twitch
9. Dashboard KPIs Grafana/Posthog (cf télémétrie P3-30)

**Dépendances** :
- Budget swag + bots : €100-300/mois
- Engagement long terme (12 mois minimum pour atteindre 1000 actifs)

**DoD** : Discord ≥ 1000 membres, ≥ 200 WAU messages, NPS trimestriel ≥ 40.

## P4-35 — 100+ contributeurs externes (200h, humain + itératif)

**Status** : programme livré (parcours, mentorship, rewards, AUTHORS.md, DCO/CLA).

**Actions humaines** :
1. Setup auto-refill good first issues : GitHub Action hebdo (scan labels, quota 50)
2. Écrire 50 good first issues initiales réparties par stack (2-5h effort chacune)
3. Pairing mentorship : implémenter bot matching Discord (ou manuel initialement)
4. PR template + CI checks : DCO signature, coverage, lint, type-check
5. Review SLA tracking : dashboard PR >48h sans réponse → ping maintainer
6. Programme Certified : formation payante (P3-25) + badge
7. Communication mensuelle : blog post "This month in Claude Craft" (top contributors, stats)
8. Conférences : talks par contributeurs communautaires (CFP réseau meetups locaux)

**Dépendances** :
- Bus factor ≥ 3 maintainers avant échelle (éviter goulet single-reviewer)
- Disponibilité review : 10-15h/semaine sur équipe core

**DoD** : ≥ 100 contributeurs externes avec ≥ 1 PR mergée, ≥ 10 Top Contributors (≥ 10 PR).

## P4-36 — Partenariat Cursor Directory (40h, humain BD)

**Status** : playbook + 1 rule draft (Symfony Clean Architecture) livrés.

**Actions humaines** :
1. Adapter 2 rules additionnelles (React 19 + Compiler, TDD Vitest) au format `.cursorrules`
2. Fork `pontusab/cursor.directory`, créer PRs pour les 3 rules (metadata complets)
3. Rédiger README section "Credits" avec backlinks mutuels
4. Ping relations Cursor (Anysphere) : LinkedIn, Twitter/X
5. Plan B si rejet : publier sur Aider Rules (paul-gauthier/aider), Cline Rules (cline/cline), repo standalone

**Dépendances externes** :
- Review Cursor Directory (3-7 jours)
- Décision acceptation rules qualité

**DoD** : 3 rules publiées Cursor Directory (ou alternatives), backlinks actifs, ≥ 500 stars cumulés.

## P4-37 — ISO 27001 / SOC 2 (300h audit, humain + cabinet)

**Status** : gap analysis complète + 5 policies draftées + short-list 5 cabinets + timeline 6 mois. **DRAFT**, review avocat + CTO obligatoire.

**Actions humaines** :
1. Validation Legal/CTO des 6 documents (gap analysis + policies) — deadline 2 semaines
2. Engager DPO externe ou formation DPO interne (RGPD)
3. Sélection cabinet audit : RFP 5 cabinets (TÜV, BSI, DNV, Bureau Veritas, LNE), décision en 4 semaines
4. Budget provisionné : €70-85K (audit €20-25K + effort interne + outils)
5. M2-M3 mise en conformité : implémenter gaps P0 (MFA obligatoire, PAM, audit logs, backups 3-2-1)
6. Formation équipe : 8h/an × nb employés (LMS : Teachable, Udemy for Business, ou custom)
7. Stage 1 Audit (documentation review) — M4
8. Stage 2 Audit (on-site, tests) — M5-M6
9. Certification délivrée (valide 3 ans, surveillance annuelle)
10. SOC 2 Type II : requiert 6 mois d'observation, démarrer après ISO 27001 validé

**Dépendances externes** :
- Cabinet audit (6 mois timeline serré)
- Budget validé par direction
- Engagement équipe (non-négociable sur sécurité)

**DoD** : ISO 27001 certifié, SOC 2 Type II audit démarré, gap analysis 100% couvert.

## P4-38 — AI-agentic (120h, dev + review sécurité obligatoire)

**Status** : architecture livrée (eval-prompt, red-team, OWASP LLM Top 10). Implémentation runtime = dev.

**Actions humaines / dev** :
1. Implémenter `/eval-prompt` command dans `cli/src/commands/ai/eval-prompt.ts`
2. Implémenter `/red-team` command avec catalogue 50+ attaques
3. Intégrer SDKs : `@anthropic-ai/sdk`, `openai`, `@google/generative-ai`, `ollama`
4. Cache SQLite résultats avec invalidation hash prompt + version modèle
5. Rapports HTML + JSON + markdown
6. Security review obligatoire : `@security-auditor` + audit externe (optionnel mais recommandé)
7. Tests E2E sur datasets publics (HELM, MMLU, AGIEval)
8. Documentation + tutoriels vidéo (YouTube/demos)
9. Intégration agent `@security-auditor` (scoring automatique)

**Dépendances** :
- Budgets LLM API (tests coûtent $50-500/run selon dataset)
- Compétence sécurité LLM (veille OWASP, adversarial ML)

**DoD** : 3 features shipped, 100+ evals lancés par users, ≥ 10 vulnérabilités LLM détectées chez early adopters.

## P4-39 — Monorepo tooling (60h, dev)

**Status** : architecture livrée (détection 7 systèmes, partial audits, cache, CI integration).

**Actions humaines / dev** :
1. Implémenter détecteurs : Nx, Turborepo, pnpm, npm/yarn workspaces, Lerna, Rush, Bazel
2. Intégration `git diff` pour partial audits (`nx affected`, `turbo --filter`)
3. Cache `.claude-craft/cache/monorepo/` avec TTL 7j
4. Worker pool Node.js (respect CPU × 0.75)
5. Tests E2E sur 3 monorepos exemples (Nx, Turborepo, pnpm)
6. Documentation guide "Claude Craft in Monorepos"
7. CI templates (GitHub Actions, CircleCI, GitLab CI) avec matrix workspaces

**Dépendances** :
- Partenariat possible avec Nx/Turborepo (co-marketing)

**DoD** : 3 types monorepos supportés, guide publié, ≥ 5 enterprise utilisent.

## P4-40 — Live coding (100h, dev)

**Status** : architecture WebSocket livrée (protocol, events, sécurité, viewer UI, monétisation).

**Actions humaines / dev** :
1. Backend relay : Hono + ws sur Cloudflare Workers ou Fly.io (region EU)
2. Client CLI hook : intercepter événements Claude Code, émettre vers relay
3. Viewer web (SvelteKit ou React) : timeline events, diff viewer, replay
4. Sanitization secrets : règles détection + redaction (patterns RegExp + entropy check)
5. Auth : JWT session éphémère 4h, Clerk/Auth.js ou custom Lucia
6. Persistence opt-in : S3-compatible (Cloudflare R2, Backblaze B2), purge 30j
7. Monétisation : Stripe checkout (Free 1/mois, Pro illimité, Enterprise custom)
8. Security review : `@security-auditor`, pentest externe (budget €5-10K)
9. Landing page demo : live.claude-craft.dev
10. Documentation : quickstart, privacy policy, conditions utilisation

**Dépendances** :
- Hébergement edge (Cloudflare Workers, Fly.io) : budget €50-200/mois
- Storage R2/B2 : €5-20/mois
- Pentest (annuel) : €5-10K

**DoD** : Live coding shipped, ≥ 50 sessions/mois créées, NPS ≥ 40.

## Condition de passage à la revue 12 mois

Selon `phase-4-domination.md` §"Post-phase : revue stratégique 12 mois" :

- [ ] North Star : WAU ≥ 10 000, Activation Rate ≥ 75%, Retention 30J ≥ 55%
- [ ] Bus Factor ≥ 8, NPS ≥ 50, Contributeurs externes ≥ 100
- [ ] Revenue : MRR ≥ €16K (€200K ARR), Dual license clients ≥ 5
- [ ] Compliance : ISO 27001 audit démarré, SBOM + SLSA L3 automatisé
- [ ] Partenariats : Anthropic MoU OU Top 10 marketplace, Cursor Directory 3 rules
- [ ] Équipe : 4-5 FTE stable

**Blocages principaux** :
- P4-31 legal : review avocat (2-4 semaines) + entity setup (1-2 mois)
- P4-32 recrutement : experts Go/Rust/Svelte rares, budget
- P4-37 audit externe : cabinet disponibilité 3-6 mois, €20-25K
- P4-34 communauté : atteindre 1000 actifs requiert 12 mois minimum
- P4-35 contributeurs : bus factor ≥ 3 pré-requis, goulet review

**Plan B** :
- Si ARR < €200K à 12 mois : report revue, consolidation avant scaling international
- Si audit ISO 27001 échec Stage 2 : remédiation 6 mois, re-audit
- Si équipe burn-out : levée fonds (€500K-1M seed) ou acquisition strategy

## Après ces actions

1. Re-lancer validation DoD globale : `/team:audit --scope=phase-4`
2. Si ≥ 80% DoD atteint → produire `audit/phases/12-month-review.md` (post-mortem, roadmap année 2)
3. Décision stratégique : continuer solo open-core vs levée fonds vs acquisition vs fondation Apache-style
4. Mettre à jour `audit/phases/README.md` pour marquer Phase 4 comme "Achevée" et archiver l'audit
