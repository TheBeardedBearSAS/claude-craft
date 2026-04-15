# Phase 2 — Actions humaines restantes

> Ces actions ne peuvent pas être entièrement automatisées par des agents. Les livrables techniques (P2-11, P2-12, P2-13, P2-15, P2-16, P2-17 template, P2-18 template, P2-20 audit) sont présents dans ce commit. Cette page liste ce qui reste sous responsabilité humaine.

## P2-14 — Refactor install scripts DRY (32h)

**Status** : **non exécuté cette session**.

**Raison** : l'audit impose explicitement que les E2E tests (P2-11) soient en place et verts **avant** le refactor. Cette session a livré le squelette E2E (bats + Docker) mais pas encore une suite exhaustive couvrant tous les chemins des 23 install scripts (~250 KB de bash). Faire le refactor dans la foulée = régression silencieuse garantie.

**Plan recommandé** (session dédiée) :

1. Étoffer `tests/e2e/tools/` avec une suite bats pour chaque famille (`tech-with-refs`, `infra`, `skill-pack`).
2. Vérifier que la suite passe dans la CI (workflow `.github/workflows/e2e-tools.yml` déjà créé).
3. Créer les 3 scripts génériques dans `Tools/` :
   - `install-tech-with-refs.sh` (stacks avec CLAUDE.md + references/).
   - `install-infra.sh` (agents devops / coolify / k8s / etc.).
   - `install-skill-pack.sh` (packs de skills).
4. Remplacer les 23 install-*.sh par des wrappers 3-5 lignes.
5. Commit séparé par famille (Dev/, Infra/, Tools/) pour faciliter le review.
6. Deprecation cycle : garder les wrappers pendant 1 release, puis supprimer en v9.0.

**Effort estimé** : 32h focus.

**DoD** : `wc -l Dev/scripts/install-*.sh Infra/install-*.sh` divisé par ≥ 3, suite E2E verte, aucun usage cassé.

## P2-19 — Recruter 2 co-mainteneurs (80h humain)

**Status** : humain uniquement (décision CEO). Pas automatisable.

**Ce qui peut aider** :

1. Rédiger une job description publique (à mettre dans `docs/HIRING.md` ou GitHub Discussions > Announcements).
   - Template : "Co-Maintainer Claude Craft — OSS MIT, part-time ou sponsor-funded".
   - Scope : review PRs, triage issues, 1 release/2 semaines, Discord office hours.
   - Compensation suggérée : €35-60K/an/personne selon séniorité (via GitHub Sponsors, subvention OSS, ou salariat direct).
2. Canaux de diffusion :
   - Post LinkedIn personnel (Flavien) : **plus fort ROI**.
   - Reddit r/ClaudeCode, r/LLMDevs.
   - Discord communauté (après P1-09).
   - Twitter/X @thebearedcto.
3. Grille d'entretien (90 min) :
   - Fit valeurs (KISS, DRY, pragmatism).
   - Expérience OSS (au moins 1 projet public actif).
   - Stack match (au moins 1 des 11 techs supportées).
   - Capacité à dire "non" (maintainer = gatekeeper).
4. Période d'essai 3 mois : write access limité à `.claude/skills/` et docs, extension après 5 merges validés.

**Risques** :
- Pool restreint de candidats qualifiés + disponibles + alignés.
- Plan B : sponsor payant via GitHub Sponsors (pay-per-feature) si aucun candidat stable trouvé en 3 mois.
- Plan C : pivot vers "lead contributors" (droits triage mais pas merge) comme palier intermédiaire.

**DoD** : 2 personnes avec write access + ≥ 5 commits chacune sur 3 mois.

## P2-15 — Traduire le top 20 website/ (~50-80h)

**Status** : audit produit (`audit/phases/i18n-gap.csv`, `i18n-gap-top20.md`). Traduction = humaine.

**Workflow recommandé** :

1. Pour chaque fichier du top 20 :
   - Pré-traduction machine (DeepL API, Claude Sonnet, ou Google Translate pro).
   - Review native obligatoire (3 freelances ES/DE/PT, budget estimé €3.5K — ~50h × €25/h/langue).
2. Setup **Crowdin** (optionnel mais recommandé) pour continuous translation : `crowdin.com/project/claude-craft`.
3. Un commit par langue × fichier pour faciliter le review.
4. PR bulk (20-40 fichiers) par langue, review par un mainteneur + le traducteur natif.

**DoD** : `npm run lint:i18n` avec `STRICT_SIZE=1 I18N_SIZE_THRESHOLD=0.80` passe sur `website/**`.

## P2-17 — Rédiger 3 showcases réels

**Status** : templates livrés (`docs/showcases/README.md`, `case-study-TEMPLATE.md`). Contenu = humain.

**Plan** :

1. Identifier 3 early adopters via :
   - Discord (après P1-09).
   - Réseau Flavien (LinkedIn, anciens clients The Bearded CTO).
   - Issues GitHub (qui pose des questions détaillées = potentiel utilisateur avancé).
2. Planifier un call de 45 min par showcase (collecte métriques + quote).
3. Obligatoire : consentement écrit du porteur (email archivé hors repo).
4. Anonymisation possible (pseudonymes "FinTech Series B", "Agence 50 devs").
5. Publier 1 showcase par mois sur 3 mois pour rythme Discord/LinkedIn.

**DoD** : 3 fichiers `docs/showcases/case-study-*.md` avec ≥ 3 métriques quantifiables chacun.

## P2-18 — Activer le GitHub Project Roadmap

**Status** : template `docs/ROADMAP.md` + `.github/ISSUE_TEMPLATE/feature_request.yml` livrés. L'**activation** du project board = humain (UI GitHub).

**Actions** :

```bash
# Créer le project board
gh project create --owner Flavien-Metivier --title "Claude Craft Roadmap"

# Activer Discussions si pas déjà fait
gh api -X PATCH /repos/Flavien-Metivier/claude-craft -f has_discussions=true
```

Puis dans la UI GitHub :

1. Ajouter les 4 colonnes : Backlog / Voting / In Progress / Shipped (+ Dropped archive).
2. Créer les milestones : `v8.2`, `v9.0`, `v10.0`.
3. Ouvrir 10 seed issues à partir de `audit/phases/phase-2/3/4-*.md` pour amorcer le vote.
4. Annoncer dans `#announcements` Discord + README + Twitter.

**DoD** : Project board public avec ≥ 10 issues votables, URL insérée dans `docs/ROADMAP.md` (section "GitHub Project").

## P2-19 + P2-20 — Publier sur marketplace Anthropic Skills

**Status** : audit readiness livré (`audit/phases/phase-2-marketplace-readiness.md`). Publication dépend de l'ouverture du marketplace.

**À faire périodiquement** :

1. Chaque trimestre : `WebSearch "Anthropic Skills marketplace open access 2026"`.
2. Si marketplace en early access : candidater avec les 10 skills identifiés.
3. Suivre la roadmap dans `audit/phases/phase-2-marketplace-readiness.md` (reformater frontmatter, beta test, publication 2/sem).

**DoD** : 10 skills sur marketplace Anthropic, ≥ 100 downloads total après 30 jours.

## Condition de passage à Phase 3

Selon `phase-2-stabilisation.md` §"Prochaine phase" :

- [ ] Bus factor effectif ≥ 3 (dépend P2-19 humain)
- [ ] Coverage E2E Tools/ ≥ 60% (dépend P2-11 étoffé)
- [ ] Mutation score ≥ 50% (dépend Stryker run réel)
- [ ] Parité i18n top 20 ≥ 90% (dépend traduction humaine)
- [ ] 10 skills publiés marketplace (dépend ouverture Anthropic)
- [ ] Discord ≥ 100 membres actifs (dépend P1-09 + croissance)

**Blocage principal** : P2-19 (recrutement) et P2-20 (marketplace) sont des dépendances externes qui peuvent bloquer 3-6 mois. Possible de commencer phase 3 en parallèle sur les axes techniques dès DoD P2-11/14 atteint.

## Après ces actions

1. Re-lancer la validation DoD globale (`/team:audit --scope=phase-2`).
2. Si ≥ 80% DoD atteint → passer à `phase-3-differenciation.md`.
3. Mettre à jour `audit/phases/README.md` pour marquer Phase 2 comme "Achevée".
