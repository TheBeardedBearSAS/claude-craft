---
description: "Exécuter n'importe quelle porte qualité : portes documentaires (PRD, spec technique, backlog, sprint, story, alignement), portes de code (commit, merge, release), le rapport complet ou un checkpoint de phase"
argument-hint: "<prd|spec|backlog|sprint|story|alignment|commit|merge|release|all> [--phase=pre-sprint|pre-impl|post-impl|pre-merge] [target]"
---

# Vérification des portes qualité

Point d'entrée unique pour toutes les portes qualité BMAD. Les portes documentaires notent les artefacts de planification (PRD, spec technique, backlog, sprint, story, alignement spec-code) ; les portes de code vérifient le dépôt avant un commit, un merge ou une release. `all` agrège les portes documentaires dans un seul rapport, et `--phase` exécute les contrôles propres à une phase du cycle de vie.

## Utilisation

| Invocation | Ce qu'elle fait | Remplace |
|------------|-----------------|----------|
| `/gate:check prd [file]` | Porte qualité PRD (seuil 80 %) | `/gate:check prd` |
| `/gate:check spec [file]` | Porte qualité Spec Technique (seuil 90 %) | `/gate:check spec` |
| `/gate:check backlog [story-id] [--no-gate]` | Porte INVEST, 6/6 par story | `/gate:check backlog` |
| `/gate:check sprint [N] [--verbose]` | Porte Sprint Ready (tous les critères requis) | `/gate:check sprint` |
| `/gate:check story <story-id>` | Porte Definition of Done (100 %) | `/gate:check story` |
| `/gate:check alignment [story-id]` | Porte d'alignement spec-code (seuil 85 %) | `/gate:check alignment` |
| `/gate:check commit [--fix] [--staged]` | Vérification pre-commit des fichiers modifiés | `/gate:check commit` |
| `/gate:check merge [source] [target]` | Vérification pre-merge d'une branche | `/gate:check merge` |
| `/gate:check release <version> [patch\|minor\|major]` | Checklist de release | `/gate:check release` |
| `/gate:check all [--detailed]` | Rapport de toutes les portes documentaires | `/gate:check all` |
| `/gate:check --phase=<phase> [story-or-sprint]` | Checkpoint d'une phase du cycle de vie : `pre-sprint`, `pre-impl`, `post-impl`, `pre-merge` | `/gate:check --phase` |

## Arguments

$ARGUMENTS (format : `<gate> [target] [flags]` ou `--phase=<phase> [target]`)

1. Le premier mot positionnel sélectionne la porte : `prd`, `spec`, `backlog`, `sprint`, `story`, `alignment`, `commit`, `merge`, `release` ou `all`.
2. Les autres mots positionnels constituent la `target` de la porte (un fichier, un identifiant de story, un numéro de sprint, une branche ou une version, voir chaque section) ; les autres flags sont documentés par porte.
3. `--phase=<phase>` remplace le mot de la porte : exécuter le checkpoint de cette phase (voir `## --phase`). `pre-sprint` et `post-impl` prennent un sprint ou une story, `pre-impl` prend une story.
4. Aucun argument : afficher le tableau d'utilisation ci-dessus et s'arrêter. Porte inconnue : lister les portes valides.

## Règles communes

- **Chemins par défaut** : PRD `project-management/prd.md`, spec technique `project-management/tech-spec.md`, stories `project-management/backlog/`, sprints `project-management/sprints/sprint-{N}-{slug}/`, constitution `project-management/constitution.md` (optionnelle). Les seuils des portes sont configurés dans `.bmad/gates/*.yaml` (`prd-gate`, `techspec-gate`, `backlog-gate`, `sprint-ready-gate`, `story-gate`).
- **Source de vérité du statut** : `.bmad/sprint-status.yaml` contient le statut des stories et des tâches (`backlog -> ready-for-dev -> in-progress -> review -> done`, tout -> `blocked`). Les portes lisent le statut dans ce fichier et jamais dans les fichiers markdown, qui ne portent que le contenu. Schéma : `.claude/templates/project/sprint-status.md`.
- **Notation** : critères pondérés ; un critère validé ajoute son poids au score (score final = somme des poids validés). Tous les critères « requis » doivent être validés pour que la porte passe. Symboles : ✅ validé, ⚠️ partiel, ❌ manquant ou en échec, ⏳ ignoré ou non vérifié.
- **Rapport** : toujours lister chaque critère avec ce qui a été trouvé ou ce qui manque, le score face au seuil, le verdict (`GATE PASSED` / `GATE FAILED (need X%, got Y%)`), puis des « Required Actions » numérotées avec un exemple concret pour chaque échec et la commande à relancer (`/gate:check <gate>`).
- **Docker** : les portes de code exécutent les outils du projet via Docker (`docker compose exec <service> ...` ou `docker run --rm ...`), jamais sur l'environnement local.

## prd

Valide un PRD (argument : `[prd-file]`, par défaut `project-management/prd.md`). Seuil : **80 %**.

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Problem Statement | 15 % | Oui | Formulation claire du problème |
| Target Users | 15 % | Oui | Audience/personas définis |
| Goals/Objectives | 15 % | Oui | Objectifs mesurables |
| Success Metrics | 15 % | Oui | KPI et mesures |
| Scope/Boundaries | 10 % | Oui | Ce qui est dans/hors du périmètre |
| User Stories Overview | 10 % | Oui | Liste de fonctionnalités de haut niveau |
| Assumptions | 10 % | Non | Hypothèses documentées |
| Risks | 10 % | Non | Identification des risques (avec mitigations) |

**Processus** : localiser et charger le fichier (échec s'il est absent) ; pour chaque critère, vérifier que la section existe avec les mots-clés pertinents et une longueur minimale de contenu ; additionner les poids des critères validés ; produire le rapport.

```
PRD Quality Gate Validation
File: project-management/prd.md   Threshold: 80%
✅ Problem Statement (15%)   Found: clear problem definition in "Overview"
❌ Goals/Objectives (15%)    Missing: no measurable goals found
⚠️ Risks (10%)               Partial: risks listed but no mitigations
Score: 90/100 (90%)
✅ PRD GATE PASSED — Next: /workflow:design
```

En cas d'échec, proposer un exemple par manque (p. ex. objectif « Réduire le temps de checkout de 30 % », KPI « Taux de conversion > 5 % », risque « Limites de débit de l'API ; Mitigation : cache »). La porte est aussi vérifiée avant `/workflow:design` et lors de la transition du workflow BMAD.

## spec

Valide une Spec Technique (argument : `[techspec-file]`, par défaut `project-management/tech-spec.md`). Seuil : **90 %**.

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Architecture Overview | 12 % | Oui | Description de la conception du système |
| Architecture Diagram | 10 % | Oui | Représentation visuelle (mermaid, PNG, SVG) |
| Components | 12 % | Oui | Définition des modules/services |
| Data Model | 10 % | Oui | Conception de la base de données/des entités |
| API Contracts | 10 % | Oui | Spécifications des endpoints avec schémas |
| Security | 12 % | Oui | Authentification et mesures de sécurité |
| Performance | 8 % | Non | Exigences de performance |
| Error Handling | 8 % | Non | Stratégie de gestion des erreurs |
| Testing Strategy | 10 % | Oui | Approche de test |
| Deployment | 8 % | Non | CI/CD et livraison |

**Processus** : localiser et charger le fichier ; vérifier les sections et les mots-clés, contrôler que les diagrammes existent et que la profondeur technique est suffisante ; calculer le score ; produire le rapport.

```
Tech Spec Quality Gate Validation
File: project-management/tech-spec.md   Threshold: 90%
❌ Architecture Diagram (10%)  Missing: no diagram found (mermaid, PNG, SVG)
⚠️ API Contracts (10%)         Partial: endpoints listed but no schemas
Score: 68/100 (68%)
❌ TECH SPEC GATE FAILED (need 90%, got 68%)
```

Les actions requises fournissent un modèle par manque : un squelette de diagramme mermaid, la stratégie de sécurité (méthode d'authentification, modèle d'autorisation, chiffrement), des schémas de requête/réponse avec formats d'erreur et versionnement, des étapes CI/CD avec promotion et rollback. Pour les décisions importantes, suggérer un ADR : `/common:architecture-decision "JWT vs Session-based authentication"`. En cas de succès : étape suivante `/workflow:plan --only=backlog`, puis `/gate:check backlog`.

## backlog

Valide les stories selon INVEST (arguments : `[story-id] [--no-gate]`). Par défaut : toutes les stories. `--no-gate` exécute uniquement la vérification INVEST simple (pas de seuils, pas de verdict réussite/échec), utile pendant le raffinement. Seuil : **6/6 pour chaque story**.

| Lettre | Critère | Vérification |
|--------|---------|--------------|
| **I** | Independent | `blocked_by` est vide |
| **N** | Negotiable | Possède une description de longueur raisonnable, non sur-spécifiée (nombre de tâches) |
| **V** | Valuable | Possède des critères d'acceptation et un énoncé du bénéfice |
| **E** | Estimable | Story points > 0 |
| **S** | Small | Story points ≤ 8 |
| **T** | Testable | Nombre de critères d'acceptation > 0 (Gherkin) |

**Processus** : lire `.bmad/sprint-status.yaml` et charger la story demandée ou toutes les stories ; évaluer les 6 critères par story (0-6) ; produire le rapport par story et agrégé (conformes 6/6, avertissements 4-5/6, en échec < 4/6). Un critère impossible à évaluer (p. ex. S sans points) est affiché avec `?`.

```
✅ US-001: User login          Score: 6/6 ✅
⚠️ US-002: User registration   [E] ✗ Estimable - No story points   Score: 4/6 ⚠️
❌ US-003: Rewrite of auth     [I] ✗ blocked by US-001, US-002  [S] ✗ 13 > 8 points   Score: 3/6 ❌
Summary: validated 8 | passing 6 | warnings 1 | failing 1
❌ BACKLOG GATE FAILED
```

Correction des problèmes courants : story trop grosse (S) → `/project:backlog edit story US-003` pour réduire le périmètre et `/project:backlog add story` pour le reste ; points manquants (E) → `/project:backlog edit story US-002 --points 3` ; critères d'acceptation manquants (V, T) → `/project:backlog edit story US-002 "Given... When... Then..."`. En cas de succès : suite avec `/gate:check sprint`.

## sprint

Valide la préparation du sprint (arguments : `[N] [--verbose]`). `N` est le numéro du sprint et accepte `1`, `001` ou `sprint-001` ; par défaut : `metadata.sprint_id` de `.bmad/sprint-status.yaml`, sinon le dossier `project-management/sprints/sprint-*/` le plus récent. `--verbose` affiche le détail des stories. Seuil : **tous les critères requis**.

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Sprint Metadata | 20 % | Oui | ID, nom, dates définis |
| Sprint Goal | 15 % | Oui | Objectif clairement formulé (10 caractères min.) |
| Stories Ready | 25 % | Oui | Au moins 1 story en `ready-for-dev` (recommandé : 3) |
| Stories Estimated | 20 % | Oui | Toutes les stories ont des points |
| Capacity Check | 10 % | Non | Points prêts ≤ `metadata.capacity_points` + 20 % (ignoré si non défini) |
| Dependencies Resolved | 10 % | Non | Aucune story bloquée au statut prêt |

**Processus**
1. Charger l'état du sprint, dans cet ordre :
   1. `.bmad/sprint-status.yaml` s'il existe et que son `metadata.sprint_id` correspond au sprint `N` : extraire les métadonnées et compter les stories par statut.
   2. Sinon, repli sur le markdown depuis `project-management/sprints/sprint-{N}-*/` (écrit par `/workflow:start`) : métadonnées, objectif et capacité depuis `sprint-goal.md` (début, fin, capacité, objectif) ; stories depuis le tableau des US sélectionnées de `sprint-goal.md` et les fichiers `project-management/backlog/user-stories/US-*.md` (points, statut), une story planifiée non encore démarrée comptant comme `ready-for-dev` ; dépendances bloquantes depuis `sprint-dependencies.md`.
   3. Aucun des deux trouvé : échouer avec « No sprint {N}: run `/workflow:start {N}` ».
2. Valider les champs de métadonnées `sprint_id`, `name`, `start_date`, `end_date`, `goal`.
3. Valider les stories (prêtes, estimées, aucune bloquée) et la capacité optionnelle.
4. Produire le rapport, en commençant par la source utilisée : `Source: .bmad/sprint-status.yaml` ou `Source: markdown (project-management/sprints/sprint-{N}-*/)`.

En mode repli, la porte est tout de même évaluée, mais le rapport ajoute un avertissement non bloquant : les commandes `/workflow:*` nécessitent `.bmad/sprint-status.yaml`, lancer `/workflow:start {N}`, ou `/project:migrate` pour créer `.bmad/sprint-status.yaml` à partir d'un backlog existant.

```
Sprint Ready Gate Validation
Sprint: sprint-3 - User Management   Period: 2026-01-29 → 2026-02-12 (14 days)
✅ Sprint Metadata (20%)  ✅ Sprint Goal (15%)  ✅ Stories Ready (25%): 5 stories, 21 points
✅ Stories Estimated (20%)  ✅ Capacity Check (10%): 21/25 = 84%  ✅ Dependencies Resolved (10%)
Score: 100/100 — ✅ SPRINT READY GATE PASSED
Commands: /workflow:start (start the sprint), /project:backlog next story (pick the first story)
```

En cas d'échec, les actions requises montrent le bloc `metadata` à ajouter à `.bmad/sprint-status.yaml` :

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "User Management"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implement core user management features"
  capacity_points: 25  # Optional: team capacity
```

puis les estimations manquantes (`/project:backlog edit story US-010 --points 5`) et les stories prêtes bloquées (les retirer du sprint, débloquer la dépendance ou réordonner).

## story

Valide une story selon la Definition of Done (argument : `<story-id>`, requis, p. ex. `US-005`). Seuil : **100 % (tous les critères requis)**.

| Critère | Poids | Requis | Vérification |
|---------|-------|--------|--------------|
| Tasks Complete | 20 % | Oui | `tasks.completed == tasks.total` |
| Tests Passing | 20 % | Oui | `tdd_phase in ['green', 'refactor', 'done']` |
| AC Validated | 20 % | Oui | `acceptance_criteria.validated == acceptance_criteria.total` |
| Code Reviewed | 15 % | Oui | `status == 'review'` ou `review.approved == true` (PR approuvée) |
| No Blockers | 10 % | Oui | `blocked_reason == null` |
| Documentation | 10 % | Non | Documentation mise à jour si nécessaire |
| Security Review | 5 % | Non | Implications de sécurité vérifiées |

**Processus** : lire `.bmad/sprint-status.yaml`, trouver la story par son ID et charger ses champs ; vérifier chaque critère ; lister les tâches et les critères d'acceptation avec leur état ; produire le rapport.

```
Story DoD Gate: US-005 — Email verification   Status: in-progress
❌ Tasks Complete (20%)   2/4 done   ✓ TASK-021 ✓ TASK-022 □ TASK-023 (in-progress) □ TASK-024 (pending)
❌ Tests Passing (20%)    TDD Phase: red
⚠️ Acceptance Criteria    1/3 validated
❌ Code Reviewed (15%)    No PR created yet
Score: 25/100 — ❌ STORY DoD GATE FAILED. Resume work: /workflow:implement US-005
```

En cas de succès : la story peut passer à `done` avec `/project:backlog move story US-005 done`. La porte est aussi vérifiée par le hook Stop (`quality-gate.sh`) et avant `/project:backlog move story <id> done`.

| Phase TDD | Signification | Étape suivante |
|-----------|---------------|----------------|
| red | Tests en échec | Implémenter le code |
| green | Tests au vert | Refactorer |
| refactor | Nettoyage en cours | Terminer ou passer à la tâche suivante |
| done | Cycle terminé | Passer en revue |

## alignment

Valide que l'implémentation correspond aux spécifications, c'est-à-dire l'absence de dérive par rapport à la spec (argument : `[story-id]`, par défaut : toutes les stories du sprint courant). Seuil : **85 %**.

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Requirement coverage | 20 % | Oui | Tous les FR-xxx du PRD sont couverts par des stories |
| Story-code mapping | 20 % | Oui | Toutes les stories ont des références de code correspondantes |
| AC-test mapping | 20 % | Oui | Tous les critères d'acceptation ont des tests |
| Tech spec adherence | 15 % | Oui | L'implémentation suit la conception de la spec technique |
| Constitution compliance | 15 % | Oui | Le code respecte la constitution du projet |
| Scope drift detection | 10 % | Non | Aucune modification de code non référencée |

**Processus**
1. Charger le PRD (identifiants FR-xxx), les stories (références `Implements:`), la spec technique et, si présente, `project-management/constitution.md`.
2. Tracer vers l'avant (spec → code) : pour chaque FR-xxx, trouver les stories qui l'implémentent, pour chaque story les fichiers de code balisés `// Story: US-xxx`, pour chaque critère d'acceptation le test correspondant.
3. Tracer vers l'arrière (code → spec) : vérifier que chaque référence de story existe dans le backlog et appartient au bon sprint ; signaler les modifications de code sans référence de story (dérive de périmètre).
4. Valider la constitution : contraintes techniques, principes de conception, cibles NFR.
5. Calculer le score et produire le rapport.

```
SPEC-CODE ALIGNMENT GATE ❌   Story: US-012 | Score: 65%
✅ Requirement coverage   3/3 FR-xxx covered
❌ Story-code mapping     2 files missing references
❌ AC-test mapping        AC-2 has no test
⚠️ Scope drift            3 unreferenced files
Actions: 1. Add // Story: US-012 to ProfileService.ts  2. Write test for AC-2  → Fix issues before merging
```

Voir aussi : `/project:trace` (matrice de traçabilité), `/project:trace --gaps` (couverture des exigences).

## commit

Vérifie le code avant un commit (flags : `--fix` corrige les problèmes corrigeables, `--staged` ne vérifie que les fichiers indexés).

1. **Identifier les fichiers modifiés** : `git diff --cached --name-only` (indexés) et `git diff --name-only` (non indexés).
2. **Détecter la technologie** par extension : `.php` → php-cs-fixer, phpstan ; `.dart` → dart format, dart analyze ; `.py` → ruff, mypy ; `.ts/.tsx/.js/.jsx` → eslint, prettier (+ `tsc --noEmit`).
3. **Exécuter les contrôles dans Docker** : PHP (`docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff`, `vendor/bin/phpstan analyse`, `lint:twig`, `lint:container`), Dart (`dart format --set-exit-if-changed`, `dart analyze`, `flutter test --coverage`), Python (`ruff check`, `ruff format --check`, `mypy`), JS/TS (`npx eslint`, `npx prettier --check`, `npx tsc --noEmit`).
4. **Contrôles globaux** : motifs de secrets (affectations `password|secret|api_key|token`, `sk_live_`, `pk_live_`, `ghp_`, `gho_`, `AKIA`), fichiers interdits indexés (`.env`, `.pem`, `.key`, `.p12`), fichiers source de plus de 1 Mo.
5. **Rapport** : contrôles réussis, problèmes (`file:line`, outil, message), tableau récapitulatif (formatage, linting, types, secrets), actions requises et `Commit authorized: ✅ YES / ❌ NO`.
6. **`--fix`** : exécuter les correcteurs à la place des contrôles en dry-run (`php-cs-fixer fix`, `dart format`, `ruff check --fix` + `ruff format`, `eslint --fix` + `prettier --write`).

| Bloquant (commit interdit) | Non bloquant (avertissement) |
|----------------------------|------------------------------|
| Erreurs de syntaxe, erreurs PHPStan/mypy/tsc, secrets détectés, fichiers `.env`, clés privées/certificats | Problèmes de formatage, avertissements ESLint, couverture de tests en baisse, TODO/FIXME ajoutés |

Pour l'automatiser, l'appeler depuis un hook pre-commit : `claude-code "/gate:check commit --staged"`.

## merge

Vérifie une branche avant le merge (arguments : `[source] [target]` ; source par défaut : la branche courante, target par défaut : `main` ou `master`). Exemple : `/gate:check merge feature/auth main`.

1. **Analyser le diff** : commits à fusionner (`git log target..source --oneline`), fichiers modifiés (`--stat`), lignes ajoutées/supprimées (`--shortstat`).
2. **Contrôles qualité** (dans Docker) : la suite de tests complète avec couverture (phpunit, `flutter test --coverage`, `pytest --cov`, `npm run test -- --coverage`) ; l'analyse statique complète (`phpstan analyse -l max`, `dart analyze --fatal-infos`, `mypy --strict .`, `tsc --noEmit`) ; l'audit des dépendances (`composer audit`, `pip-audit`, `npm audit`, `dart pub outdated`).
3. **Contrôles spécifiques** : migrations de base de données (`doctrine:migrations:diff`, `doctrine:schema:validate`, réversibilité), ruptures de compatibilité de l'API (diff de `openapi.yaml` / `docs/api/`), changements de configuration (`config/`, `.env.example`, `docker-compose*.yml`).
4. **Analyse des commits** : chaque message suit les Conventional Commits `type(scope): description`, sinon avertir.
5. **Couverture** : comparer avant/après ; la couverture ne doit pas baisser.
6. **Contrôles de spec** : exécuter le checkpoint `pre-merge` (voir `## --phase`).
7. **Rapport** : statistiques, tableau des tests (suite, réussis, échoués, ignorés, variation de couverture), tableau d'analyse statique, sécurité (audit, secrets, fichiers sensibles), migrations, points d'attention classés HIGH/MEDIUM/LOW/INFO, checklist finale (la code review approuvée et les tests en staging sont des éléments manuels) et `Merge authorized: ✅ YES / ❌ NO`.

| Bloquant (merge interdit) | Non bloquant (avertissement) |
|---------------------------|------------------------------|
| Tests en échec, baisse de couverture > 2 %, erreurs d'analyse statique, vulnérabilités critiques/hautes, secrets dans le code, migrations non réversibles | Avertissements d'analyse statique, TODO/FIXME ajoutés, vulnérabilités faibles/moyennes, baisse de couverture < 2 % |

## release

Guide l'équipe à travers une release (arguments : `<version> [patch|minor|major]`, p. ex. `1.2.0 minor` ou `2.0.0-beta.1`). Exemple : `/gate:check release 1.2.0 minor`.

1. **Validation pré-release** : bonne branche (`main`/`master` ou `release/*`), aucun changement non commité, tous les tests passent ; `CHANGELOG.md` à jour (changements depuis le dernier tag avec `git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"`) ; fichiers de version mis à jour (`composer.json`, `pyproject.toml`/`__version__.py`, `package.json`, `pubspec.yaml`, `Info.plist`, `build.gradle`).
2. **Tests exhaustifs** : unitaires, intégration, E2E, performance, sécurité.
3. **Documentation** : README, documentation d'API générée, guide de migration en cas de ruptures de compatibilité.
4. **Générer la checklist interactive** `RELEASE CHECKLIST - v{VERSION}` (type, date, branche) avec les sections ci-dessous, chaque élément étant une case `- [ ]` :
   - **Pré-release** : qualité du code (tests au vert, couverture ≥ 80 %, aucune erreur d'analyse statique, toutes les PR relues, aucun TODO/FIXME bloquant), sécurité (aucune CVE critique, aucun secret, tests OWASP, certificats SSL valides), documentation (CHANGELOG, README, documentation d'API, guide de migration, notes de release), versionnement (version incrémentée, tags préparés, branches de release).
   - **Build & package** : backend (build de production, assets, migrations, variables d'environnement documentées), frontend (bundle optimisé, CDN, service worker, sourcemaps non déployées), mobile le cas échéant (builds iOS/Android signés, captures d'écran et métadonnées des stores).
   - **Validation en staging** : déploiement, migrations, smoke tests, tests de régression, performance, monitoring, rollback testé.
   - **Déploiement en production** : pré-déploiement (mode maintenance, sauvegarde de la base, communication au support, fenêtre de déploiement), déploiement (lancement, migrations, health checks), post-déploiement (smoke tests, monitoring, performance, tag git poussé, release GitHub/GitLab).
   - **Communication** : notes de release, support, clients, documentation publique, annonce.
   - **Plan de rollback** : identifier le problème (logs, alertes), seuil de décision (p. ex. > 5 % de 5xx pendant 5 min) et décideur, commande de rollback, rollback de la base (migrations down), communication (équipe, incident, post-mortem).
   - **Validation finale** : toutes les cases cochées, validée par, date/heure de la release, notes.

Commandes utiles : `git tag -a v{VERSION} -m "Release v{VERSION}"` + `git push origin v{VERSION}` ; `gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md` ; `git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md`.

| Type SemVer | Quand | Exemple |
|-------------|-------|---------|
| MAJOR | Ruptures de compatibilité | 1.0.0 → 2.0.0 |
| MINOR | Nouvelle fonctionnalité | 1.0.0 → 1.1.0 |
| PATCH | Correction de bug | 1.0.0 → 1.0.1 |

## all

Rapport agrégé des portes documentaires (argument : `[--detailed]`, qui inclut les détails de validation de chaque porte).

1. **Identifier les portes applicables** : porte PRD si `project-management/prd.md` existe, porte Spec Technique si `project-management/tech-spec.md` existe, porte Backlog si des stories existent dans `.bmad/sprint-status.yaml`, porte Sprint Ready si les métadonnées du sprint existent, portes Story pour chaque story `in-progress` / `review`.
2. **Exécuter chaque porte applicable** (`prd`, `spec`, `backlog`, `sprint`, puis `story` par story) et collecter les scores.
3. **Agréger** dans la synthèse, puis **recommander** des actions priorisées à partir des échecs.

```
BMAD Quality Gates Report   Project: claude-craft   Sprint: sprint-3 - User Management
| Gate | Threshold | Score | Status |
| PRD | 80% | 90% | ✅ PASS |
| Tech Spec | 90% | 92% | ✅ PASS |
| Backlog | 6/6 | 5.8/6 avg | ⚠️ WARN |
| Sprint Ready | 100% | 100% | ✅ PASS |
| Story DoD | 100% | varies | 📊 |
Story DoD Status: US-010 in-progress 45% ⏳ | US-012 review 85% ⚠️ | US-013 done 100% ✅
Overall Health: 🟢 Good — 4/5 gates passing, 8/10 stories on track
Recommendations: 1. ⚠️ US-002 missing story points → /project:backlog edit story US-002 --points 3
```

Le rapport `--detailed` ajoute, pour chaque porte, le fichier, le seuil, le score, le statut et chaque critère, les stories à problèmes (backlog), le détail DoD de chaque story, et les actions par priorité (1 bloquant, 2 à corriger, 3 souhaitable). Le rapport peut être généré à la demande, inclus dans la rétrospective de sprint, utilisé pour le suivi de la santé du projet ou exporté pour les parties prenantes. Les portes de code (`commit`, `merge`, `release`) et `alignment` n'en font pas partie : les lancer séparément.

## --phase

Exécute des checkpoints automatisés aux phases critiques du cycle de vie afin de garantir que les specs sont cohérentes, complètes et alignées avec l'implémentation.

**Prérequis** : `project-management/prd.md` avec des identifiants FR-xxx, `project-management/backlog/` avec des user stories, `.bmad/sprint-status.yaml` pour le contexte du sprint ; `project-management/constitution.md` optionnel.

**Le mode plan est obligatoire** : avant d'exécuter, analyser le code impacté, proposer un plan et attendre la validation avant tout changement.

| Phase | Quand | Cible |
|-------|-------|-------|
| `pre-sprint` | Avant de démarrer un sprint (après `/workflow:start`) | sprint |
| `pre-impl` | Avant de coder une story (après `/project:backlog next story --claim`) | story |
| `post-impl` | Après avoir terminé une story (avant `/project:backlog move story US-xxx review`) | story |
| `pre-merge` | Avant de fusionner dans main (appelé par `merge`) | story ou sprint |

**pre-sprint** : charger les stories assignées au sprint.

| Contrôle | Requis |
|----------|--------|
| Complétude des AC : chaque story a des AC Gherkin | Oui |
| Estimation des stories : toutes les stories ont des points | Oui |
| Traçabilité PRD : `Implements:` référence des identifiants FR-xxx valides | Oui |
| Décomposition en tâches : au moins 1 tâche par story | Oui |
| Contrôle des dépendances : aucun `Depends on:` circulaire ou non résolu | Oui |
| Alignement avec la constitution : aucune contradiction | Non |

**pre-impl** : charger la story et ses sections de spec technique (référence `Tech Spec:`).

| Contrôle | Requis |
|----------|--------|
| Couverture de la spec technique : chaque FR-xxx de la story est couvert | Oui |
| Testabilité des AC : chaque AC a une structure GIVEN/WHEN/THEN | Oui |
| Dépendances résolues : toutes les stories `Depends on` sont `done` | Oui |
| Clarté des tâches : les tâches ont des descriptions claires | Oui |
| Alignement NFR : respecte les NFR de la constitution | Non |

**post-impl** : charger la story et ses tâches.

| Contrôle | Requis |
|----------|--------|
| Traçabilité du code : les fichiers de code référencent `// Story: US-xxx` (ou `# Story: US-xxx`) | Oui |
| Couverture de tests : des tests existent pour chaque AC | Oui |
| Toutes les tâches terminées | Oui |
| Phase TDD : `refactor` ou `done` | Oui |
| Aucune régression : la suite de tests passe toujours | Oui |
| Dérive de la spec : le périmètre implémenté correspond à la spec (pas de scope creep) | Non |

**pre-merge** : exécuter tous les checkpoints précédents, puis :

| Contrôle | Requis |
|----------|--------|
| Validation des AC : tous les critères d'acceptation validés | Oui |
| Code review effectuée | Oui |
| Suite de tests au vert (suite complète) | Oui |
| Respect de la constitution | Oui |
| Traçabilité complète : FR → US → Code → Test, avec `/project:trace` | Oui |
| Documentation mise à jour | Non |

```
CHECKPOINT FAILED ❌   Phase: pre-impl   Story: US-012   Score: 60% (3/5 checks passed)
✅ AC testability  3/3   ✅ Dependencies resolved   ✅ Task clarity  4/4
❌ Tech spec coverage  Missing FR-003 mapping   ❌ NFR alignment  Perf target undefined
Actions required: 1. Add FR-003 coverage to tech spec section 3.2  2. Define performance targets
→ Fix issues before proceeding
```

Exemple : `/gate:check --phase=pre-sprint Sprint-3` → « Score: 83% (5/6 passed) — WARNING: US-015 has no tasks yet ». Intégration : `/workflow:start` déclenche `pre-sprint`, `/project:backlog next story` suggère `pre-impl`, `/project:backlog move story` déclenche `post-impl`, et `merge` déclenche `pre-merge`.

## Commandes associées

- `/project:trace` — matrice de traçabilité et couverture des exigences (`--gaps`)
- `/workflow:design`, `/workflow:plan --only=backlog` — produisent les artefacts que valident les portes
- `/workflow:start` — démarrer le sprint (inclut le checkpoint pre-sprint)
- `/project:backlog move story` — faire passer une story au statut suivant
