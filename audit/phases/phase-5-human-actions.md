# Phase 5 — Actions humaines restantes

> Le scope automatisable (rétrospective chiffrée, playbooks expansion, scaffolding stacks Tier 2, gap analysis compliance, drafts gouvernance) est livré dans ce commit. Cette page liste ce qui reste sous responsabilité humaine, dépendances externes, ou développement itératif multi-trimestres.
>
> **Prérequis global** : phase 4 ≥80% DoD (WAU 10K, ARR €200K, 100+ contributeurs, ISO 27001 audit démarré). Si non atteint, **ne PAS lancer phase 5** → déclencher plan B phase 4 (consolidation).
>
> Livrables présents dans ce commit :
> - **P5-41** : `audit/phases/retrospective-12-mois.md` (template chiffré, à remplir avec métriques réelles)
> - **P5-42** : `audit/phases/freshness-annuel.md` (script + tableau stack/versions/CVEs)
> - **P5-43** : `docs/expansion/INTERNATIONAL-PLAYBOOK.md` (US + SG + JP roadmap)
> - **P5-44** : `.claude/references/{kotlin,ruby,elixir,zig}/CLAUDE.md` + `rules/01-architecture.md`, `02-testing.md`, `03-security.md`, `04-performance.md` (16 fichiers)
> - **P5-46** : `docs/compliance/HIPAA-GAP-ANALYSIS.md` + 3 policies DRAFT (BAA, PHI handling, breach notification)
> - **P5-47** : `docs/adr/0042-capital-strategy-year-2.md` (DRAFT, 4 options comparées)
> - **P5-48** : `CHARTER.md` v2 + `docs/governance/TRADEMARK-POLICY.md` + `docs/governance/BOARD-ADVISORY.md` (DRAFTS)
> - **P5-49** : `docs/research/DX-LAB-ARCHITECTURE.md` (dataset claude-craft-evals + leaderboard design)
> - **P5-50** : `docs/academy/ACADEMY-V2-PROPOSAL.md` (partenariats universités + MOOC design)

## P5-41 — Rétrospective 12 mois (80h restant ~40h analyse humaine)

**Status** : template livré, données à injecter depuis télémétrie réelle.

**Actions humaines** :
1. Exporter données Posthog (WAU, activation funnel, retention cohorts) sur 12 mois
2. Exporter Stripe (MRR évolution, churn cohorts, clients par tier)
3. Exporter GitHub Insights (PRs mergées, contributors unique, stars, forks)
4. Exporter Discord Statbot (membres actifs, messages/semaine, rétention J+7)
5. Calculer ROI : revenue généré / €155K budget initial, CAC, LTV, LTV/CAC
6. Animation atelier rétrospective (équipe complète, 2×4h) — facilitation externe
7. Synthèse CTO : verdict succès/partiel/échec par phase, 10 lessons learned
8. Publication interne board + blog post public "Year 1 in review" (marketing)

**Dépendances externes** : aucune (exécution interne).

**DoD** : `retrospective-12-mois.md` publié, blog post live, board briefing fait.

## P5-42 — Audit freshness annuel (120h, semi-automatisé)

**Status** : script automation + template livrés.

**Actions humaines** :
1. Exécution `/common:audit-freshness --comprehensive` (scan 11 stacks, ~3h runtime)
2. Triage CVEs : P0 <48h patch, P1 <2 semaines, P2 backlog prochain sprint
3. Plan remédiation : tickets GitHub Issues générés automatiquement, assignation maintainer par stack
4. i18n audit : comparer EN (source) vs FR/ES/DE/PT, commander traductions pour drift >15%
5. Docs obsolètes : purge ou refresh des fichiers non modifiés depuis 9 mois
6. Communication publique : blog post "State of claude-craft dependencies 2027"

**Dépendances externes** :
- Traducteurs professionnels pour drift i18n (budget €3-8K annuel)
- Abonnements scanning CVE (Snyk, Socket.dev, GitHub Advanced Security : €3-10K/an)

**DoD** : 0 CVE P0 non traité, drift i18n <15%, rapport signé CTO, issues remédiation créées.

## P5-43 — Expansion internationale US + APAC (240h restant ~180h)

**Status** : playbook livré (stratégie, timeline, budget, entités, fiscalité).

**Actions humaines** :
1. **US (M13-M15)** :
   - Incorporer C-Corp Delaware via Stripe Atlas (€500 + €100/an registered agent)
   - Federal EIN (IRS, 1 semaine)
   - Compte bancaire US : Mercury ou Brex (fintech, faible délai pour non-résident)
   - Sales tax nexus assessment : Avalara/TaxJar (souscription $300-1000/mois)
   - Registered agent 50 states si expansion nationale
   - DMCA agent registration ($6 Copyright Office)
   - Privacy update : CCPA + 4 autres (Virginia, Colorado, Utah, Connecticut)
2. **SG (M16-M20)** :
   - Pte Ltd via Osome/Sleek (€1500-3000 setup, €150/mois recurring)
   - 1 director local minimum (nominee service ~€2400/an)
   - GST registration (seuil S$1M revenue)
   - Grants exploration : StartupSG Founder, Enterprise SG ICV
3. **JP (M21-M24, conditionnel)** :
   - KK via avocat local (€5000+) ou branch via SG
   - Consumption tax registration (¥10M seuil)
   - Banking : SMBC, MUFG (difficile sans résident) ou Wise Business
   - Localisation 6e langue (JP) : traduction UI + docs (€15-25K)
4. Hiring local : contractor first (Deel, Remote.com), full-time après product-market fit local
5. Marketing régional : press US (TechCrunch, TheNewStack), JP (Zenn, Qiita, ITmedia)

**Dépendances externes** :
- Cabinet juridique international (Gunderson US, Bird & Bird international)
- Expert-comptable multi-juridictions (délai 6-8 semaines onboarding)

**DoD** : 1 entité US incorporée + opérationnelle, 1 entité APAC en cours (SG minimum), €250K+ ARR US après 12 mois.

## P5-44 — Tier 2 stacks (320h, scaffolding + itération experts)

**Status** : scaffolding 4 stacks livré (CLAUDE.md + 4 rules fichiers chacun). Reviewers, skills, commandes = itératif.

**Actions humaines / itératives** :
1. Recruter 4 experts stack (Kotlin, Ruby, Elixir, Zig) — contributeurs OSS connus, freelances, ou sponsoring contributeur
2. Valider references sur 2-3 projets réels par stack (production-grade)
3. Créer agents reviewers : `@kotlin-reviewer`, `@ruby-reviewer`, `@elixir-reviewer`, `@zig-reviewer`
4. Créer commandes : `/kotlin:*`, `/ruby:*`, `/elixir:*`, `/zig:*` (check-testing, check-architecture, check-security, generate-*)
5. Traductions EN + FR minimum par stack
6. Mettre à jour `CLAUDE.md` principal (table Supported Technologies passe à 11 stacks), `docs/AGENTS.md`, `docs/COMMANDS.md`
7. Documentation projets exemples par stack
8. Décision après 6 mois : cut stack si <100 downloads/mois (Zig probable candidat cut)

**Dépendances** :
- Recrutement experts (2-3 mois par stack)
- Tests terrain projets réels (4-6 mois)

**DoD** : ≥3 stacks Tier 2 actifs avec reviewers scoring 100 sur projets test, ≥100 downloads CLI/mois chacun (sinon cut).

## P5-45 — Enterprise scale ARR €1M (280h, 100% humain BD)

**Status** : pas de livrable automatisable. Pipeline CRM pur.

**Actions humaines** :
1. Hire Account Executive (AE) : €60-80K base + commission 8-12% net new ARR
2. Hire Customer Success Manager (CSM) : €55-70K, 1 CSM / €500K ARR
3. Pipeline target : 80 opportunités qualifiées pour 20 clos (25% close rate entreprise)
4. Case studies : 5 publiés (1 par trimestre de phase 5), formats video + PDF
5. References sellers : identifier 5 clients prêts à référencer (en échange discount 10%)
6. Partnerships revenue-share : intégrateurs SaaS, agences DevOps (margin 15-20%)
7. Events : sponsoring ciblé (AWS re:Invent, Google Next, KubeCon) + présence stand
8. Outbound : LinkedIn Sales Navigator + Apollo.io + Clay (budget €500-1500/mois)
9. Contract templates international : MSA, DPA (GDPR), BAA (HIPAA), SCC (cross-border)

**Dépendances externes** :
- Recrutement AE/CSM (3-4 mois chacun)
- Pipeline ramp-up (6-9 mois pour maturité)

**DoD** : ARR ≥ €1M, ≥ 20 clients payants, churn <5% annuel, NRR ≥ 120%.

## P5-46 — SOC 2 Type II + HIPAA gap analysis (280h audit + implémentation)

**Status** : HIPAA gap analysis + 3 policies DRAFT livrés. SOC 2 évidences = process continu.

**Actions humaines** :
1. Souscription Vanta ou Drata ou Secureframe (€15-30K/an) — automation evidence collection
2. SOC 2 Type II cabinet : sélection RFP 3 cabinets (Prescient Assurance, A-LIGN, Schellman, BARR)
3. Audit Stage 1 (doc review) M18 : préparation dossier 4-6 semaines
4. Audit Stage 2 (testing) M22-M24 : audit on-site ou remote 1-2 semaines
5. HIPAA : Legal valide gap analysis + policies, avocat santé US (McDermott, Hogan Lovells) révise BAA
6. HIPAA : implémenter PHI data flow tagging, audit logs 6 ans, breach notification 60j
7. ISO 27001 surveillance annuelle M15 : préparation dossier 2 semaines
8. Formation équipe : 8h/an × employés (LMS Vanta/Drata inclus) + HIPAA awareness 4h
9. Pentest externe annuel (€8-15K) : cabinet spécialisé (Trail of Bits, NCC, Synopsys)

**Dépendances externes** :
- Cabinet SOC 2 disponibilité (6-9 mois timeline)
- Avocat HIPAA US (délai 4-6 semaines)

**DoD** : SOC 2 Type II rapport clean publié, HIPAA-ready (policies + BAA), ISO 27001 surveillance M15 passée.

## P5-47 — Décision stratégique capital (100h analyse + humain board)

**Status** : ADR draft livré (4 options comparées). Décision = board + facilitation.

**Actions humaines** :
1. Pré-travail CTO : data room complète (finances 12 mois, metrics, cap table, IP)
2. Facilitation externe : consultant DevTools (ex: Ian Hogarth, Andrew Chen, Elaia) — €5-10K session
3. Entretiens préliminaires :
   - Series A : 10-15 fonds (Accel, Sequoia, Bessemer, Elaia, Partech, LocalGlobe, Seedcamp)
   - Acquisition : due diligence légère Cursor/Sourcegraph/Replit (advisor intro)
   - Fondation : discussions ASF incubation, Linux Foundation, CNCF
4. Board session décision (2 jours intensifs) : option choisie, timeline 90j exécution
5. Communication : équipe d'abord, communauté ensuite (transparence proportionnelle)
6. Si Series A : process term sheet + due diligence 3-6 mois (léveé €2-5M, dilution 20-30%)
7. Si acquisition : LOI + DD 6-12 mois, retention packages équipe, earn-out structure
8. Si fondation : proposal ASF incubator (ou alternative), transfert IP, gouvernance committers/PMC

**Dépendances externes** :
- Advisors + board (timing disponibilité)
- Investisseurs / acquéreurs / fondations (process 3-12 mois selon chemin)
- Avocat M&A ou corporate (Gunderson, Wilson Sonsini, Orrick)

**DoD** : ADR 0042 mergé avec décision formelle, timeline 12 mois d'exécution publiée.

## P5-48 — Governance transition (160h, humain + legal)

**Status** : Charter v2, trademark policy, board advisory docs DRAFT livrés.

**Actions humaines** :
1. Review Legal : avocat IP (€3-8K) révise Charter v2 + trademark policy
2. Community comment period : 30j sur Discord + GitHub Discussions, intégrer feedback
3. Vote ratification : communautaire (contributors) + board final
4. Board advisory recrutement : 3-5 advisors (€500-2K/mois ou equity 0.1-0.5% chacun)
   - Profils cibles : 1 opérateur SaaS exit, 1 expert sécurité/compliance, 1 fondateur OSS
5. Trademark enregistrement : USPTO (US, $250-400/classe) + EUIPO (€850/classe) + WIPO Madrid
6. Si fondation : charter réécrit selon modèle ASF/Eclipse/Linux Foundation, IP assignment
7. Succession plan : documentation "onboarding core maintainer" (40-60 pages runbook)
8. Bus factor ≥15 validation : 15 maintainers actifs avec droits merge + on-call rotation

**Dépendances externes** :
- Avocat IP (4-6 semaines)
- Enregistrements trademark (6-18 mois par juridiction)

**DoD** : Charter v2 + trademark policy en prod, board advisory 3+ membres nommés, trademarks déposés 3+ juridictions.

## P5-49 — DX research lab (200h dev + R&D)

**Status** : architecture livrée (dataset, leaderboard, benchmarks).

**Actions humaines / dev** :
1. Hire 1 Research Engineer (profil AI/ML + dev) : €70-90K + equity
2. Implémenter dataset claude-craft-evals : 100 scenarios avec ground truth
3. Infrastructure eval : Docker sandboxes isolés, API multi-LLM (Anthropic, OpenAI, Gemini, xAI, Ollama)
4. Leaderboard public claude-craft-evals.dev : SvelteKit/Next.js + Postgres + API publique
5. Publication rapport trimestriel "State of AI coding agents" (PR magnet, Hacker News)
6. Partenariats recherche : Anthropic Research, Stanford HAI (Percy Liang), MILA, LightOn
7. Paper ArXiv coAuthored : méthodologie + insights (1 paper/an minimum)
8. Security review : @security-auditor + pentest externe adversarial (prompt injection dataset)
9. Budget LLM API : €500-2000/mois (tests datasets)

**Dépendances** :
- Budget R&D dédié (ne pas subsidier depuis revenue produit)
- Compétences ML/evals (veille OWASP LLM, adversarial ML research)

**DoD** : dataset public 100 scenarios, leaderboard live, 2 rapports publiés année 2, 1 paper ArXiv accepté.

## P5-50 — Academy v2 (220h, humain Formation + partenariats)

**Status** : proposal livré (partenariats, MOOC design, revenue model).

**Actions humaines** :
1. Hire Head of Education / Formation : €60-80K (background edtech + dev)
2. Partenariats universités : démarcher 10 écoles France/US, signer 2-3 (Epitech, 42, ENSIMAG, MIT OCW, Berkeley extension)
3. Dossier accréditation ECTS : Crefop France ou équivalent par pays (6-12 mois process)
4. MOOC production :
   - Script + storyboard (50-80h effort scripter)
   - Tournage studio : 8-12h video par cours (€15-25K production)
   - Post-prod + quiz + exercises : 80-120h effort
   - Pitch Coursera/edX : démo + métriques intérêt (30-60j response time)
5. Certification exam design : 100 questions bank + simulateur proctoré (Examity, ProctorU)
6. Tarification : €500 Foundation, €1000 Professional, €1500 Expert
7. Marketing : campaign influenceurs tech (YouTube, Twitch), LinkedIn Learning partnership
8. Success tracking : NPS post-certification ≥60, placement rate alumni (stats recruteurs partenaires)

**Dépendances externes** :
- Accréditation ECTS/ANSSI (12+ mois France)
- Coursera/edX acceptation (3-6 mois pitch cycle)

**DoD** : 1 partenariat université signé actif, 1 cours live Coursera/edX, ≥50 certifications délivrées année 2, revenue formation €50K+.

## Condition de passage à mode BAU (M24)

Selon `phase-5-evolution.md` §"Fin de roadmap" :

- [ ] North Star année 2 : WAU ≥30K, ARR ≥€1M, Bus Factor ≥15, NPS ≥60
- [ ] Compliance : SOC 2 Type II certifié, ISO 27001 surveillance passée, HIPAA-ready
- [ ] Gouvernance : Charter v2 ratifié, board advisory actif, décision capital actée
- [ ] Expansion : 2 entités internationales (US + 1 APAC) opérationnelles
- [ ] R&D : dataset evals public + 2 rapports publiés + 1 paper ArXiv
- [ ] Formation : 1 partenariat université + 1 MOOC live

**Blocages principaux** :
- P5-43 expansion US : entrée marché difficile, GTM fit incertain
- P5-45 ARR €1M : pipeline BD long (cycles 6-12 mois enterprise)
- P5-46 SOC 2 : dépend maturité politiques + automation continue
- P5-47 capital : indécision board peut bloquer trajectoire 6 mois
- P5-48 trademark : délais enregistrement 12-18 mois par juridiction

**Plan B** :
- Si ARR <€500K M24 : consolider au lieu de scaler, reporter expansion APAC à année 3
- Si Series A refusée : bootstrap scale + sponsorships (GitHub Sponsors Enterprise, OpenCollective)
- Si entrée US rate : repli sur EU scale (France/DE/UK/ES), année 3 retry US
- Si SOC 2 échoue : remédiation 6 mois + re-audit (budget supplémentaire €15K)

## Après ces actions

1. Re-lancer validation DoD globale : `/team:audit --scope=phase-5`
2. Si ≥80% DoD atteint → archiver `audit/` comme historique, basculer roadmap sur `docs/roadmap/` + GitHub Projects
3. M36 : relancer cycle audit complet (14 rapports) pour identifier nouveaux gaps — cycle triennal
4. Gouvernance continue : board advisory trimestriel, charter review annuel, freshness audit annuel
5. Communication publique : blog post "Year 2 review : what we learned scaling claude-craft"
