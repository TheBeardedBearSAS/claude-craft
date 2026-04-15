# Phase 3 — Actions humaines restantes

> Le scope automatisable (architecture, drafts, scaffolding) est livré dans ce commit. Cette page liste ce qui reste sous responsabilité humaine, dépendances externes, ou développement itératif multi-sprints.
>
> Livrables présents dans ce commit :
> - **P3-21** (partiel) : `docs/qa-recette/ARCHITECTURE.md`, `api-spec.yaml`, `RFC.md`
> - **P3-23** (partiel) : `skills-marketplace/` scaffolding (Astro + index JSON + template + CLI spec)
> - **P3-26** (partiel) : `LICENSE-COMMERCIAL.md` (DRAFT), `docs/dual-license/SLA-TEMPLATE.md`, `docs/dual-license/README.md`
> - **P3-28** (partiel) : `audit/phases/phase-3-marketing/EDITORIAL.md` (20 outlines) + 5 drafts blog + 3 abstracts conf (`docs/marketing/` étant gitignored, les livrables audit vivent sous `audit/phases/phase-3-marketing/`)
> - **P3-29** (partiel) : `docs/plugins/ARCHITECTURE.md`, `README.md` + 3 examples plugins scaffoldés
> - **P3-30** (partiel) : `.claude/telemetry.json.template`, `docs/telemetry/CONSENT-UX.md`, `PRIVACY.md` mise à jour

## P3-21 — Extraction QA Recette standalone (120h restant ~100h)

**Status** : architecture livrée, implémentation à réaliser.

**Plan recommandé (4 sprints de 2 semaines)** :

1. Sprint 1 : créer `github.com/the-bearded-cto/qa-recette`, migrer `.claude/commands/qa/` → `cli/` du nouveau repo.
2. Sprint 2 : publier `@claude-craft/qa-recette-sdk@1.0.0` sur NPM, Vitest 4 tests.
3. Sprint 3 : refactor Chrome extension v2.0 avec SDK, bundle Manifest V3.
4. Sprint 4 : backend cloud minimal (Hono + Postgres EU) + Stripe checkout + domaine `qa-recette.com`.

**Dépendances humaines** :
- RFC communautaire publié GitHub Discussions `qa-recette` (14 jours comment period)
- Review `@tech-lead` validation architecture
- Compte Stripe Atlas ou équivalent (France entity)

**DoD** : Repo live, NPM package, extension Chrome publiée, 10 sessions cloud réelles.

## P3-22 — Chrome extension payante (80h, 100% humain)

**Status** : pas démarré (besoin P3-21 sprint 3 terminé).

**Actions** :
1. Figma : design UI basée sur DESIGN.md design system
2. Dev Manifest V3 + Stripe checkout + customer portal integration
3. Publication Chrome Web Store ($5 fee + review ~7 jours)
4. Onboarding 3 étapes (install → auth Claude API → première session)
5. Analytics conversion free → paid (via P3-30 télémétrie)

**Dépendances** :
- P3-21 sprint 3 (SDK stable)
- Stripe account validé (KYC France)
- Conformité accessibilité WCAG 2.2 AA

**DoD** : Extension publiée, 10 subscriptions payantes actives à 60 jours.

## P3-23 — Skills marketplace (60h restant ~35h)

**Status** : scaffolding livré (site Astro, index, template, CLI spec). Live production = humain.

**Actions restantes** :
1. Implémenter `claude-craft skill install/search/list` dans `cli/src/commands/skill.ts`
2. GitHub Actions pour regen `index.json` à chaque merge
3. Déployer Cloudflare Pages sur `skills.claude-craft.dev`
4. Seeder catalogue : 10 skills officielles (migrer depuis `.claude/skills/`) + appel communauté
5. Communiquer sur Discord + LinkedIn pour attirer 20 contributions externes

**DoD** : site live, 30+ skills catalog, 100+ installs cumulés via CLI.

## P3-24 — Partenariat Anthropic (40h, 100% humain CEO)

**Status** : pas démarré.

**Actions** :
1. Préparer pitch deck (10 slides max)
2. Contact LinkedIn partnerships@anthropic.com + réseau existant
3. Négociation : co-marketing, revenue share, annonce blog Anthropic
4. Alternative plan B : top 10 skills marketplace Anthropic = légitimité équivalente

**DoD** : MoU signé OU position top 10 skills marketplace.

## P3-25 — Formation certifiante (80h, humain principalement)

**Status** : pas démarré.

**Actions** :
1. Rédiger curriculum 2 jours dans `docs/training/CERTIFIED.md`
2. Choisir plateforme (Teachable €39/mois, ou self-hosted)
3. Produire 6-8h vidéo (budget studio ou home rec DaVinci Resolve)
4. Créer examen 30 questions + projet pratique
5. Session pilote 5 participants gratuits (capture témoignages + NPS)
6. Landing page `formation.claude-craft.dev`

**DoD** : Session pilote tenue, NPS ≥ 40, 1 client payant première cohort.

## P3-26 — Dual licensing finalisation (24h, dépend légal)

**Status** : drafts livrés. **NE PAS PUBLIER sans review avocat IP**.

**Actions** :
1. Engager avocat IP spécialisé OSS (budget €2-5K)
2. Review `LICENSE-COMMERCIAL.md` et `SLA-TEMPLATE.md`
3. Validation fiscale France/UE (VAT-OSS SaaS)
4. CLA vs DCO : décider en fonction du retour avocat
5. Communication claire README (MIT par défaut, opt-in commercial)
6. Contract management (DocuSign / HelloSign)

**DoD** : 1 contrat SLA signé par client réel.

## P3-27 — Talks conférences (60h, humain)

**Status** : 3 abstracts livrés.

**Actions** :
1. Soumettre CFP Devoxx France, Symfony Live, React Conf (+ backups AFUP, React Paris...)
2. Préparer slides (réutiliser blog drafts comme base)
3. Si accepté : répétitions (3 au min), enregistrement dry-run, sortie vidéo
4. Badge sponsor si budget (€2-5K stand conférence)

**Timeline** : CFP ferment octobre-décembre 2025, accepter la visibilité sur 2026.

**DoD** : ≥ 1 talk accepté sur une conf majeure.

## P3-28 — Publication blog (80h restant ~40h)

**Status** : 5 drafts livrés (sur 20). 20 outlines livrés.

**Actions** :
1. Publication cadencée 1/semaine pendant 20 semaines
2. Rédiger les 15 drafts restants (outils AI + revue humaine)
3. Cross-post DEV.to (canonical) + Medium + HashNode + LinkedIn résumé
4. Mesurer : views, subscribers newsletter, stars GitHub uplift
5. Engager commentaires (répondre <48h)

**DoD** : 20 posts publiés, ≥ 2000 views cumulés, ≥ 50 new GitHub stars.

## P3-29 — Plugin system finalisation (100h restant ~65h)

**Status** : architecture + 3 examples scaffoldés. Implémentation runtime = dev.

**Actions** :
1. Publier `claude-craft-plugin-api@1.0.0` NPM (types + helpers)
2. Implémenter loader + sandboxing niveau 1 dans `cli/`
3. Implémenter CLI `plugin install/list/remove/config/disable`
4. Publier starter template `create-claude-craft-plugin`
5. Compléter les 3 examples (code fonctionnel, tests, NPM publish)
6. RFC communautaire GitHub Discussions, 30j comment period
7. Security review par `@security-auditor`

**DoD** : Plugin API v1.0.0 stable, ≥ 3 plugins tiers communautaires.

## P3-30 — Télémétrie opt-in (24h restant ~12h)

**Status** : template config + UX spec livrés, PRIVACY.md mis à jour.

**Actions** :
1. Provisioning Posthog EU + Sentry EU (comptes payants)
2. Implémenter SDK integration dans `cli/`
3. Implémenter prompt consentement premier run (TTY + TTY-less)
4. Implémenter commandes `telemetry status/on/off/purge/debug`
5. Dashboard `stats.claude-craft.dev` (site Astro + Posthog API)
6. Audit interne "zéro PII" : run 100 événements, review manuelle logs

**DoD** : Télémétrie opt-in live, ≥ 500 users opt-in, dashboard public.

## Condition de passage à Phase 4

Selon `phase-3-differenciation.md` §"Prochaine phase" :

- [ ] MRR ≥ €2000/mois (Chrome + SLA + formation)
- [ ] Marketplace skills ≥ 50 skills, ≥1000 installs cumulés
- [ ] Plugin system adopté : ≥5 plugins tiers
- [ ] Télémétrie : WAU ≥ 500 users opt-in
- [ ] Partenariat Anthropic formalisé OU skills marketplace Top 10
- [ ] Équipe stable : 3-4 personnes temps plein

**Blocages principaux** :
- P3-22 Chrome ext : dépendance séquentielle sur P3-21 sprint 3
- P3-24 partenariat : dépendance externe Anthropic (cycle commercial lent)
- P3-26 legal : review avocat (2-4 semaines)
- P3-27 confs : fenêtres CFP rigides (annuelles)

**Plan B phase 4 anticipée** : si MRR n'atteint pas €2000 à 6 mois, pivoter vers plan "services consulting" + "Claude Craft for agencies" (white-label), reporter domination à +6 mois.

## Après ces actions

1. Re-lancer validation DoD globale : `/team:audit --scope=phase-3`
2. Si ≥ 80% DoD atteint → passer à `phase-4-domination.md`
3. Mettre à jour `audit/phases/README.md` pour marquer Phase 3 comme "Achevée"
