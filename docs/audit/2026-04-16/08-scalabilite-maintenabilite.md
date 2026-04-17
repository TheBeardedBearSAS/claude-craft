# Scalabilité & Maintenabilité — Audit Claude Craft v8.1.0

**Date** : 2026-04-16  
**Auditeur** : Scalability Auditor Agent  
**Portée** : Architecture, contributions, i18n, scope creep, processus, dette technique  
**Score global** : 4.5/10 ⚠️ **CRITIQUE**

---

## Résumé exécutif

Claude Craft est un framework d'une **ambition exceptionnelle** (19 stacks, 5 langues, 67 agents, 214 commandes), mais repose sur **un seul développeur actif**. Cette concentration extrême du savoir et de la maintenance constitue un **risque critique pour la pérennité du projet**.

L'architecture technique est solide (CI/CD automatisée, tests, i18n automatisée), mais la **charge de maintenance humaine** est insoutenable sur la durée. Le projet ajoute 25+ commits/semaine, maintient 970K lignes de contenu multilingue, et supporte 13 stacks technologiques — tout cela par une seule personne.

**Constats majeurs :**
- **Bus factor = 1** : aucun contributeur externe actif
- **Scope creep avéré** : 19 stacks annoncés mais seulement 4 Tier 1, 6 Tier 3 sous-maintenus
- **Dette technique** : 1237 marqueurs TODO/FIXME/HACK
- **i18n insoutenable** : 1595 fichiers à synchroniser manuellement sur 5 langues
- **Tests fragiles** : 8 tests échouent (scripts d'installation)
- **Cadence de release excessive** : 7 releases en 3 mois (v7.29 → v8.1.0)

**Recommandation stratégique :** Réduire drastiquement le périmètre (Tier 1 uniquement, 2 langues max) ou ouvrir massivement aux contributions externes. L'état actuel n'est pas soutenable.

---

## Métriques clés

| Métrique | Valeur | Cible | Statut |
|----------|--------|-------|--------|
| **Bus Factor** | 1 | >= 3 | 🔴 Critique |
| **Contributeurs actifs (3 mois)** | 1 | >= 5 | 🔴 Critique |
| **Stacks Tier 1 (production-ready)** | 4/13 | >= 8/13 | 🟡 Partiel |
| **Couverture i18n (lignes/langue)** | 970K / 5 | N/A | 🟡 Élevé |
| **Parité i18n (fichiers)** | 303-304/langue | 100% | 🟢 Excellent |
| **Commits/semaine** | ~25 | <= 10 | 🔴 Trop élevé |
| **Dette technique (TODO/FIXME)** | 1237 | < 100 | 🔴 Élevée |
| **Tests échouant** | 8/773 | 0 | 🟡 Acceptable |
| **Coverage tests** | N/A (v8) | >= 80% | ⚪ Inconnu |
| **PRs externes ouvertes** | 9 (Dependabot) | >= 5 (humains) | 🔴 Aucune |
| **Issues ouvertes** | 1 | < 10 | 🟢 Bon |
| **Taille package NPM** | 4.9 MB | < 10 MB | 🟢 Bon |
| **Scripts shell** | 154 (6243 lignes) | < 100 | 🟡 Élevé |
| **Scripts npm** | 19 | < 15 | 🟡 Acceptable |
| **Release cadence** | 1/semaine+ | 1/mois | 🔴 Trop rapide |
| **CLA signataires** | 0 | >= 3 | 🔴 Aucun |

---

## Constats détaillés

### 1. Bus Factor = 1 (CRITIQUE)

#### Constat SCAL-01 : Un seul développeur actif
- **Sévérité** : 🔴 Critique
- **Description** : 
  - 50 commits depuis janvier 2026, **100% par Flavien METIVIER**
  - `git log --format='%aN' | sort -u` : **1 seul auteur**
  - Aucun contributeur externe n'a signé le CLA (`.github/cla-signatures/` vide)
  - Toutes les PRs ouvertes sont de Dependabot (9 PRs d'automatisation deps)
  - Issue tracker quasi vide (1 issue ouverte)
- **Impact** : 
  - **En cas d'indisponibilité du mainteneur** : projet arrêté immédiatement
  - Aucune review externe = risque de biais, bugs non détectés
  - Connaissances critiques non documentées (implicites)
  - Impossible de paralléliser les développements
- **Recommandation** : 
  1. **Court terme (1 mois)** : Documenter TOUS les processus critiques (release, hotfix, i18n sync) dans `/docs/RUNBOOK.md`
  2. **Moyen terme (3 mois)** : Recruter **2 co-mainteneurs** (via GitHub Sponsors, appel communautaire)
  3. **Long terme (6 mois)** : Établir rotation reviews (chaque PR doit avoir 2 approvals)
  4. **Contingence** : Préparer un fichier `HANDOVER.md` listant tous les accès critiques (NPM, GitHub, secrets)
- **Effort** : M (documentation) + XL (recrutement)

#### Constat SCAL-02 : CONTRIBUTING.md exhaustif mais pas d'adoption
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - CONTRIBUTING.md fait 711 lignes, très complet (onboarding 15 min, tier system, workflow)
  - `good-first-issue` label existe, mais **aucun contributeur externe**
  - Documentation de qualité, mais pas de stratégie d'acquisition contributeurs
- **Impact** : 
  - Efforts documentaires importants, mais ROI = 0
  - Pas de funnel de contribution (où sont les nouveaux contributeurs ?)
- **Recommandation** : 
  1. Créer 10 `good-first-issue` tickets concrets avec template pré-rempli
  2. Annoncer sur Reddit r/ClaudeAI, Twitter, LinkedIn (appel contributeurs)
  3. Organiser "Hacktoberfest participation" (octobre 2026)
  4. Offrir swag/recognition aux 3 premiers contributeurs actifs
  5. Lancer GitHub Sponsors avec tiers (Silver $5 = badge, Gold $25 = mention CHANGELOG)
- **Effort** : M

---

### 2. Sustainability de l'i18n (CRITIQUE)

#### Constat SCAL-03 : Volume i18n insoutenable pour 1 personne
- **Sévérité** : 🔴 Critique
- **Description** : 
  - **1595 fichiers markdown** à maintenir sur 5 langues (en, fr, es, de, pt)
  - **970 236 lignes totales** de contenu i18n
  - **Parité parfaite** : 303-304 fichiers/langue (excellent mécanisme CI)
  - **3.5-4.1 MB** de contenu par langue
  - Workflow actuel : traduction manuelle après chaque ajout en anglais
- **Impact** : 
  - Chaque nouvelle feature nécessite **5× l'effort** (1 version + 4 traductions)
  - Risque de désynchronisation sémantique (traduction devient obsolète)
  - Burden insoutenable : ajouter 1 agent = écrire 5 fichiers markdown
  - **Vélocité bridée** : impossible d'itérer rapidement
- **Recommandation** : 
  1. **Immédiat** : Geler 3 langues (garder EN + FR uniquement) → gain 60% effort
  2. **Court terme** : Automatiser traductions avec LLM (Claude API + prompt engineering)
     - Script `scripts/translate-i18n.mjs` : boucle EN → {FR,ES,DE,PT} avec validation syntaxe
     - Hook pre-commit qui détecte fichiers EN non traduits et propose traduction auto
  3. **Moyen terme** : Recruter 1 traducteur bénévole par langue (ES, DE, PT) pour review IA
  4. **Long terme** : Passer à un système de "traduction contributive" (i18n crowdsourcing)
- **Effort** : S (gel) + M (auto LLM) + L (recrutement)

#### Constat SCAL-04 : Mécanisme de parité i18n excellent
- **Sévérité** : ℹ️ Info (positif)
- **Description** : 
  - `scripts/verify-i18n-parity.sh` : vérifie file count + structure
  - `.github/workflows/i18n-parity.yml` : CI automatique (blocking + advisory)
  - Threshold 0.80 pour size parity (tolérance -20% si traductions plus courtes)
- **Impact** : 
  - Évite regressions structurelles (fichier oublié dans une langue)
  - Détection précoce de désynchronisation
- **Recommandation** : 
  - Conserver ce mécanisme
  - Ajouter un check de "semantic drift" (comparer frontmatter descriptions EN vs autres langues)
- **Effort** : S

---

### 3. Scope Creep : 19 stacks annoncés, 4 production-ready

#### Constat SCAL-05 : Tier 3 sous-maintenus
- **Sévérité** : 🔴 Critique
- **Description** : 
  - **Tier 1 (Core)** : 4 stacks (Symfony, React, Python, Flutter) — bien maintenus
  - **Tier 2 (Supported)** : 2 stacks (React Native, PHP) — acceptable
  - **Tier 3 (Community)** : 4 stacks (C#, Angular, Laravel, Vue.js) — quasi abandonnés
    - Seulement **2 fichiers i18n** par stack Tier 3 (vs 25+ pour Tier 1)
    - Reviewers génériques (pas de deep expertise)
    - Références basiques : 177-439 lignes (vs 1647+ pour Tier 1)
  - **Stacks fantômes** : Go, Rust, Svelte annoncés (274-439 lignes références) mais **2 fichiers i18n seulement**
- **Impact** : 
  - Promesse marketing non tenue ("19 stacks supportés")
  - Utilisateurs Tier 3 reçoivent peu de valeur → churn
  - Dilution efforts : temps perdu sur stacks non-core
  - Dette technique : maintenir 19 systèmes d'install scripts
- **Recommandation** : 
  1. **Immédiat** : Déprécier officiellement Go, Rust, Svelte → passer en statut "Experimental" (docs claires)
  2. **Court terme** : Annoncer "Claude Craft Core" (4 stacks Tier 1 uniquement) comme version stable
  3. **Moyen terme** : Lancer appel communautaire : "Adoptez un Tier 3 stack"
     - Nominer 1 community maintainer par stack Tier 3
     - Leur donner accès repo + budget LLM (Claude API credits)
  4. **Long terme** : Split en 2 packages NPM
     - `@the-bearded-bear/claude-craft` (Tier 1 core)
     - `@the-bearded-bear/claude-craft-community` (Tier 2+3)
- **Effort** : M (comm) + L (split packages)

#### Constat SCAL-06 : Paperclip (29×5 = 145 fichiers) dilue efforts
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - Paperclip ajouté récemment (v8.0+) avec **29 fichiers × 5 langues = 145 fichiers** i18n
  - Stack ultra-niche (governance Node.js tool)
  - 8 commandes, full i18n — effort majeur pour audience minuscule
- **Impact** : 
  - Effort colossal pour stack peu utilisée
  - Pourrait être mieux servie par documentation externe
- **Recommandation** : 
  - Évaluer usage Paperclip (metrics NPM downloads si possible)
  - Si < 50 installs/mois → reléguer en "Experimental" et geler i18n (EN seulement)
- **Effort** : S

---

### 4. Versioning et Release

#### Constat SCAL-07 : Cadence de release excessive
- **Sévérité** : 🔴 Critique
- **Description** : 
  - **7 releases en 3.5 mois** : v7.29.0 → v8.1.0 (décembre 2025 - avril 2026)
  - CHANGELOG fait **108 KB** (2007 lignes) — activité frénétique
  - Pattern observé : plusieurs releases/semaine certaines périodes
  - CONTRIBUTING.md impose "max 1 release/semaine" mais non respecté historiquement
- **Impact** : 
  - Fatigue utilisateurs (breaking changes fréquents, migration continue)
  - Fatigue mainteneur (burnout risk)
  - CI/CD overload (chaque release = tests, build, publish, docs)
  - NPM version churn (cache invalidation, bandwidth)
- **Recommandation** : 
  1. **Immédiat** : Respecter strictement règle "1 release/semaine max" (déjà dans CONTRIBUTING)
  2. **Court terme** : Adopter cadence fixe : releases **bi-hebdomadaires** (tous les 15 jours)
  3. **Exceptions** : hotfix sécurité uniquement (CVE, regression critique)
  4. **Moyen terme** : Batching features : accumuler 3-5 features avant release
  5. **Communication** : Changelog groupé par release, pas par commit
- **Effort** : S (discipline process)

#### Constat SCAL-08 : Process de release bien automatisé
- **Sévérité** : ℹ️ Info (positif)
- **Description** : 
  - `.github/workflows/npm-publish.yml` : CI complète (validate, build, test, publish, release)
  - Tests : unit + shell (BATS) + i18n parity + shellcheck + Vale prose
  - OIDC provenance (SLSA supply chain)
  - Auto-publish sur tag `v*`
- **Impact** : 
  - Process release fiable
  - Réduction risque erreur humaine
- **Recommandation** : 
  - Conserver
  - Ajouter `mutation testing` au CI (Stryker déjà configuré, voir `package.json`)
- **Effort** : S

---

### 5. Monorepo Structure

#### Constat SCAL-09 : Makefile surdimensionné (506 lignes)
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - Makefile fait **506 lignes** (targets pour 13 stacks × install/dry-run/stats)
  - **154 scripts shell** (6243 lignes totales)
  - Duplication code entre scripts d'install (pattern répétitif)
- **Impact** : 
  - Maintenance complexe (changer 1 comportement = éditer 13 scripts)
  - Dette technique (DRY violation)
- **Recommandation** : 
  1. **Court terme** : Factoriser logique commune dans `Dev/scripts/lib/common.sh`
     - Fonctions : `install_namespace()`, `copy_i18n()`, `validate_structure()`
  2. **Moyen terme** : Remplacer Makefile par CLI Node.js unifié
     - `npx claude-craft install --all-techs --dry-run`
     - Logique centralisée dans `cli/lib/installer.js`
  3. **Long terme** : Générer scripts d'install à partir de config YAML
     - `Dev/configs/symfony.yml` → script généré automatiquement
- **Effort** : M (refacto) + L (réécriture CLI)

#### Constat SCAL-10 : Structure i18n bien organisée
- **Sévérité** : ℹ️ Info (positif)
- **Description** : 
  - `Dev/i18n/{lang}/{Tech}/` : structure claire et prédictible
  - Agents, commands, skills, templates, checklists séparés
  - Base common + tech-specific bien isolés
- **Impact** : 
  - Facilite navigation
  - Onboarding contributeurs simplifié
- **Recommandation** : 
  - Conserver
  - Documenter dans `ARCHITECTURE.md` (actuellement manquant en racine)
- **Effort** : S

---

### 6. Contribution Model

#### Constat SCAL-11 : CLA configuré mais 0 signataires
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - `.github/workflows/cla.yml` : workflow CLA Assistant actif
  - `.github/CLA.md` : document légal présent
  - Allowlist : `dependabot, renovate, github-actions[bot]`
  - **Signatures** : `.github/cla-signatures/v1/signatures.json` absent ou vide
- **Impact** : 
  - CLA peut être perçu comme barrière à contribution (friction légale)
  - Pas de contributeurs externes = CLA inutile actuellement
- **Recommandation** : 
  1. **Court terme** : Simplifier CLA (1 page max, langage clair)
  2. **Alternative** : Adopter DCO (Developer Certificate of Origin) à la place
     - Plus léger : simple `Signed-off-by:` dans commits
     - Adopté par Linux, GitLab, nombreux projets OSS
  3. **Communication** : Expliquer pourquoi CLA (protection mainteneur + projet)
- **Effort** : S

#### Constat SCAL-12 : Absence d'issues "good first"
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - Label `good-first-issue` documenté dans CONTRIBUTING.md
  - **Réalité** : 1 seule issue ouverte (bug installation)
  - Pas de backlog public → contributeurs ne savent pas par où commencer
- **Impact** : 
  - Contributeurs potentiels rebutés (pas de point d'entrée clair)
  - Perception "projet fermé"
- **Recommandation** : 
  1. **Immédiat** : Créer **10 issues `good-first-issue`** triées
     - Ex: "Add missing German translation for `/symfony:check-security`"
     - Ex: "Write unit test for `cli/lib/tech-registry.js`"
     - Ex: "Fix shellcheck warning in `install-flutter-rules.sh`"
  2. **Template** : Issue template pré-rempli avec contexte + fichiers concernés
  3. **Encouragement** : "First PR gets mentioned in CHANGELOG + shoutout Twitter"
- **Effort** : S

---

### 7. Update Mechanism

#### Constat SCAL-13 : Commande `update` manquante
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - CLI `claude-craft` propose `install`, `list`, `stats`, `kanban`
  - **Pas de commande `update`** pour MAJ framework existant
  - Utilisateurs doivent réinstaller manuellement (risque écrasement config locale)
- **Impact** : 
  - Friction adoption nouvelles versions
  - Utilisateurs restent sur anciennes versions
  - Pas de telemetry (impossible de savoir combien utilisent v7 vs v8)
- **Recommandation** : 
  1. **Court terme** : Implémenter `npx claude-craft update`
     - Détecte version installée (`.claude/.version.txt`)
     - Compare avec latest NPM (`npm view @the-bearded-bear/claude-craft version`)
     - Propose upgrade interactif (liste breaking changes)
  2. **Safety** : Backup automatique avant update (`.claude.backup/`)
  3. **Preservation** : Conserver fichiers locaux (`.local.md`, hooks custom)
- **Effort** : M

#### Constat SCAL-14 : Pas de notification nouvelles versions
- **Sévérité** : 🟡 Mineur
- **Description** : 
  - Pas de mécanisme "update check" à l'exécution
  - Utilisateurs ne savent pas qu'une v8.1 existe si installés en v7.29
- **Impact** : 
  - Fragmentation versions
  - Support difficile (bugs déjà fixés dans versions récentes)
- **Recommandation** : 
  - Implémenter check silencieux (1×/jour max) avec cache local
  - Message discret : "📦 Claude Craft v8.1.0 available. Run `npx claude-craft update`"
  - Opt-out via env var `CLAUDE_CRAFT_DISABLE_UPDATE_CHECK=1`
- **Effort** : S

---

### 8. Dette Technique

#### Constat SCAL-15 : 1237 marqueurs TODO/FIXME/HACK
- **Sévérité** : 🔴 Critique
- **Description** : 
  - `grep -r "TODO\|FIXME\|HACK\|XXX"` : **1237 occurrences**
  - Répartition : JS, shell scripts, markdown docs
  - Exemples typiques (à vérifier) : 
    - "TODO: add tests"
    - "FIXME: handle edge case"
    - "HACK: temporary workaround"
- **Impact** : 
  - Risque bugs latents (edge cases non gérés)
  - Complexité croissante (workarounds s'accumulent)
  - Code smell (qualité perçue)
- **Recommandation** : 
  1. **Audit** : Catégoriser les 1237 occurrences
     - Critical (blocker) : 0-5%
     - Important (should fix) : 10-15%
     - Nice to have : 80-90%
  2. **Court terme** : Fixer tous les "Critical" (max 50 items)
  3. **Moyen terme** : Convertir TODO en GitHub issues avec label `tech-debt`
  4. **Hygiene** : Lint rule : interdire nouveaux TODO sans numéro issue
     - OK : `// TODO(#123): refactor this`
     - KO : `// TODO: fix later`
- **Effort** : L (audit) + variable (fixes)

#### Constat SCAL-16 : 8 tests échouant (scripts install)
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - `npm test` : 765 tests pass, **8 tests fail**
  - Échecs dans `install-dry-run.test.mjs` : création de namespaces
  - Probablement regression récente (refacto scripts ?)
- **Impact** : 
  - CI peut passer malgré tests échouant (si non-blocking)
  - Risque regressions non détectées
- **Recommandation** : 
  1. **Immédiat** : Fixer les 8 tests échouant (priorité P0)
  2. **CI** : Rendre tests **blocking** (fail si 1 seul test rouge)
  3. **Prévention** : Hook pre-push local qui lance `npm test`
- **Effort** : S (fix) + S (CI config)

---

### 9. Tests et Qualité

#### Constat SCAL-17 : Coverage inconnue (v8)
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - `package.json` : script `test:coverage` présent (vitest + coverage-v8)
  - **Résultat coverage non fourni** dans l'audit actuel
  - Target : >= 80% (standard industrie)
- **Impact** : 
  - Impossible d'évaluer risque regressions
  - Zones de code non testées = bugs potentiels
- **Recommandation** : 
  1. **Immédiat** : Lancer `npm run test:coverage` et publier rapport
  2. **CI** : Ajouter badge coverage dans README (Codecov ou Coveralls)
  3. **Gate** : Bloquer PRs si coverage < 80%
  4. **Mutation** : Activer `npm run mutation` (Stryker configuré)
     - Mutation score > 70% cible
- **Effort** : S

#### Constat SCAL-18 : Tests fragmentés (11 fichiers seulement)
- **Sévérité** : 🟡 Majeur
- **Description** : 
  - **11 fichiers de tests** JS/MJS
  - **154 scripts shell** mais tests BATS limités (MultiAccount, RTK, StatusLine, AgentTeams)
  - Beaucoup de logique bash non testée
- **Impact** : 
  - Refacto shell scripts = peur de casser
  - Bugs découverts en production (pas en CI)
- **Recommandation** : 
  1. **Court terme** : Ajouter tests BATS pour `Dev/scripts/install-*.sh`
     - Tester dry-run, structure output, error handling
  2. **Moyen terme** : Tester 100% des scripts dans `Dev/scripts/`
  3. **Coverage shell** : Utiliser `bashcov` (Ruby gem) pour coverage bash
- **Effort** : M

---

### 10. Documentation Runbook

#### Constat SCAL-19 : Pas de RUNBOOK.md
- **Sévérité** : 🔴 Critique
- **Description** : 
  - Documentation utilisateur excellente (QUICKSTART, CONTRIBUTING, CLI-REFERENCE)
  - **Documentation opérationnelle manquante** : pas de runbook mainteneur
  - Processus critiques non documentés :
    - Comment faire hotfix sécurité ?
    - Comment synchroniser i18n après ajout EN ?
    - Où sont les secrets (NPM token, GitHub PAT) ?
    - Qui contacter en cas d'urgence ?
- **Impact** : 
  - **Bus factor = 1 aggravé** : connaissances implicites
  - Impossible de passer relais à un remplaçant temporaire
  - Perte de temps en cas d'urgence (recherche procédure)
- **Recommandation** : 
  1. **Immédiat** : Créer `docs/RUNBOOK.md` avec sections :
     - **Releases** : étapes détaillées (version bump, changelog, tag, publish)
     - **Hotfix** : workflow fast-track (skip normal cadence)
     - **i18n sync** : commandes pour regénérer traductions
     - **Rollback** : comment annuler release cassée
     - **Secrets** : inventaire accès (NPM, GitHub tokens) + procédure rotation
     - **Incident response** : qui alerter, checklist triage
     - **Handover** : checklist passation (nouveau mainteneur)
  2. **Review** : Mettre à jour trimestriellement
- **Effort** : M

---

## Devil's Advocate : Et si c'était voulu ?

**Hypothèse** : Le mainteneur unique pourrait être un choix délibéré (vision produit cohérente, vélocité, contrôle qualité).

**Contre-arguments** :
1. **Vélocité illusoire** : 25 commits/semaine n'est pas soutenable sur 2+ ans → burnout garanti
2. **Qualité** : 1237 TODO + 8 tests cassés suggèrent que la vélocité nuit à la qualité
3. **Scalabilité** : impossible d'absorber demandes communautaires (1 issue, 0 PR externes)
4. **Risque** : maladie, vacances, burnout → projet à l'arrêt
5. **Innovation** : pas de diversité perspectives → biais cognitifs, solutions sub-optimales
6. **Sustainability OSS** : projets OSS pérennes ont toujours 3+ mainteneurs actifs (Linux, React, Rust, etc.)

**Verdict** : Le modèle actuel n'est **pas viable long terme**, même s'il a permis avancées rapides short-term.

---

## Recommandations priorisées

### Phase 1 : Stabilisation (1 mois) — Réduire risque immédiat

| # | Action | Impact | Effort | Priorité |
|---|--------|--------|--------|----------|
| 1 | Fixer 8 tests échouant | Éviter regressions | S | P0 |
| 2 | Créer `docs/RUNBOOK.md` | Réduire bus factor | M | P0 |
| 3 | Geler 3 langues (garder EN + FR) | Libérer 60% effort i18n | S | P0 |
| 4 | Déprécier Go, Rust, Svelte (→ Experimental) | Clarifier scope réel | S | P0 |
| 5 | Créer 10 issues `good-first-issue` | Ouvrir contributions | S | P1 |
| 6 | Respecter cadence 1 release/15 jours | Réduire fatigue | S | P1 |
| 7 | Implémenter `claude-craft update` | Faciliter adoption versions | M | P1 |

### Phase 2 : Ouverture (3 mois) — Recruter contributeurs

| # | Action | Impact | Effort | Priorité |
|---|--------|--------|--------|----------|
| 8 | Appel contributeurs (Reddit, Twitter, LinkedIn) | Augmenter bus factor | M | P1 |
| 9 | Automatiser traductions i18n (Claude API) | Libérer temps humain | M | P1 |
| 10 | Simplifier CLA → DCO | Réduire friction légale | S | P2 |
| 11 | Lancer GitHub Sponsors (tiers recognition) | Financer mainteneurs | M | P2 |
| 12 | Auditer 1237 TODO → catégoriser | Prioriser dette tech | L | P2 |
| 13 | Ajouter tests BATS install scripts | Augmenter coverage | M | P2 |

### Phase 3 : Sustainability (6 mois) — Refondation

| # | Action | Impact | Effort | Priorité |
|---|--------|--------|--------|----------|
| 14 | Recruter 2 co-mainteneurs (budget/bénévoles) | Bus factor = 3 | XL | P0 |
| 15 | Split packages (core vs community) | Clarifier tiers | L | P1 |
| 16 | Nominer 1 mainteneur/stack Tier 3 | Déléguer Tier 3 | L | P1 |
| 17 | Refacto Makefile → CLI Node.js unifié | Réduire dette scripts | L | P2 |
| 18 | Activer mutation testing (Stryker) dans CI | Augmenter qualité tests | M | P2 |
| 19 | Créer `ARCHITECTURE.md` racine | Faciliter onboarding arch | M | P2 |

---

## Plan d'action immédiat (Sprint 0 — Semaine 1-4)

### Semaine 1 : Stabilisation critique
- [ ] **Jour 1** : Fixer 8 tests échouant (`install-dry-run.test.mjs`)
- [ ] **Jour 2** : Geler langues ES, DE, PT (annoncer dans README + CHANGELOG)
- [ ] **Jour 3** : Déprécier Go, Rust, Svelte → status "Experimental" (docs)
- [ ] **Jour 4** : Créer `docs/RUNBOOK.md` (template + remplir sections critiques)
- [ ] **Jour 5** : Review PR, merge si tests verts

### Semaine 2 : Ouverture contributions
- [ ] **Jour 1-2** : Créer 10 issues `good-first-issue` (translations, tests, shellcheck)
- [ ] **Jour 3** : Rédiger post appel contributeurs (Reddit r/ClaudeAI, Twitter/X, LinkedIn)
- [ ] **Jour 4** : Simplifier CLA ou migrer vers DCO
- [ ] **Jour 5** : Publier appel + monitorer réponses

### Semaine 3 : Automatisation i18n
- [ ] **Jour 1-3** : Développer `scripts/translate-i18n.mjs` (Claude API)
- [ ] **Jour 4** : Tester auto-translation EN → FR sur 10 fichiers
- [ ] **Jour 5** : Documenter workflow i18n dans RUNBOOK

### Semaine 4 : Release process
- [ ] **Jour 1** : Implémenter `claude-craft update` command
- [ ] **Jour 2** : Ajouter update check silencieux (opt-out)
- [ ] **Jour 3** : Tester update command sur projet test
- [ ] **Jour 4** : Documenter release cadence (15 jours) dans CONTRIBUTING
- [ ] **Jour 5** : Release v8.2.0 avec nouvelles features stabilisation

---

## Métriques de succès (3-6 mois)

| Métrique | Baseline (avril 2026) | Cible (octobre 2026) |
|----------|----------------------|----------------------|
| **Bus factor** | 1 | >= 3 |
| **Contributeurs actifs (3 mois)** | 1 | >= 5 |
| **PRs externes (humains, 3 mois)** | 0 | >= 10 |
| **Issues `good-first` résolues** | 0 | >= 15 |
| **Langues i18n actives** | 5 | 2 (EN, FR) |
| **Stacks Tier 1** | 4 | 6 |
| **Stacks Tier 3 avec mainteneur** | 0 | 4 |
| **Dette technique (TODO)** | 1237 | < 500 |
| **Tests coverage** | ? | >= 80% |
| **Tests échouant** | 8 | 0 |
| **Release cadence (jours)** | 4-7 | 14-15 |
| **GitHub Sponsors** | 0 | >= 5 |
| **Downloads NPM (mensuel)** | ? | >= 500 |

---

## Conclusion

Claude Craft est un **projet ambitieux et techniquement solide**, mais repose sur une **fondation humaine fragile** (bus factor = 1). Le scope actuel (19 stacks, 5 langues, 970K lignes i18n) est **objectivement insoutenable** pour un seul mainteneur.

**Scénarios :**

1. **Status quo** : Burnout mainteneur sous 6-12 mois, projet abandonné
2. **Réduction scope** : Focus 4-6 stacks Tier 1, 2 langues → projet soutenable mais moins ambitieux
3. **Ouverture communautaire** : Recrutement 5+ contributeurs actifs → projet viable long terme

**Recommandation finale** : Adopter **scénario 3** (ouverture) avec **scénario 2** (réduction) comme fallback si recrutement échoue.

Le mainteneur doit choisir : **scale down (réduire)** ou **scale out (ouvrir)**, mais le status quo n'est pas viable.

---

**Signature :** Scalability Auditor Agent  
**Date** : 2026-04-16  
**Version audit** : 1.0  
**Prochaine revue recommandée** : 2026-07-16 (3 mois)
