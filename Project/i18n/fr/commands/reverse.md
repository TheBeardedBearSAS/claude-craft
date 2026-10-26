---
description: "Pipeline de rétro-ingénierie brownfield : scanner le code, puis dériver un PRD brouillon, des user stories et une analyse d'écarts spec vs code"
argument-hint: "[scan|prd|stories|gaps|all] [--scope=<scope>] [--module=<name>] [--output=<path>]"
---

# /project:reverse

## Mission

Rétro-concevoir des spécifications à partir d'un code existant (projets brownfield). Une seule commande couvre tout le pipeline : inventorier le code (`scan`), inférer un PRD brouillon (`prd`), inférer des user stories (`stories`) et comparer les spécifications au code (`gaps`). `all` enchaîne les quatre dans l'ordre.

## Usage

| Commande | Rôle | Remplace |
|----------|------|----------|
| `/project:reverse scan` | Inventaire des modules, endpoints, modèles, services, tests, infrastructure | `/project:reverse scan` |
| `/project:reverse prd` | PRD BROUILLON inféré du code | `/project:reverse prd` |
| `/project:reverse stories` | User stories BROUILLON inférées du code et des tests | `/project:reverse stories` |
| `/project:reverse gaps` | Analyse d'écarts spec vs code, classée par sévérité | `/project:reverse gaps` |
| `/project:reverse all` | `scan` -> `prd` -> `stories` -> `gaps`, dans cet ordre | les quatre |

## Arguments

Analyser `$ARGUMENTS` : premier jeton = sous-commande (`scan`, `prd`, `stories`, `gaps`, `all`). Sans sous-commande, demander laquelle (recommander `all` à la première exécution). Flags :

| Flag | S'applique à | Description |
|------|-------------|-------------|
| `--scope=<scope>` | `scan` : all, backend, frontend, api, tests / `stories` : all, module, endpoint / `gaps` : full, requirements, stories, code | Limite l'analyse |
| `--module=<name>` | `stories` | Génère les stories d'un seul module |
| `--output=<path>` | `scan`, `prd` | Chemin de sortie (valeurs par défaut ci-dessous) |

## Règles communes

**Le mode plan est obligatoire.** Avant d'exécuter, activer le mode plan, proposer le plan et attendre la validation avant de modifier un fichier. Avec `all`, un seul plan couvre les quatre étapes.

**Règles d'inférence des personas (utilisées par `prd` et `stories`) :**

| Pattern d'authentification | Persona inféré |
|----------------------------|----------------|
| `ROLE_ADMIN` + routes d'administration | Administrateur |
| `ROLE_USER` + routes authentifiées | Utilisateur enregistré |
| `ROLE_MANAGER` + routes de gestion | Manager / superviseur |
| Endpoints publics (sans auth) | Visiteur / anonyme |
| Authentification par clé d'API | Système externe |

**Tout ce qui est inféré est un BROUILLON.** Le code montre ce que le système fait, pas ce qu'il devrait faire. Marquer chaque artefact inféré `INFERRED` et exiger une validation humaine avant de le considérer comme faisant autorité. Marqueur à insérer dans chaque section ou story inférée :

```
> INFERRED -- Généré par analyse du code existant.
> Une validation humaine est requise avant de le considérer comme faisant autorité.
```

**Règle de statut :** `.bmad/sprint-status.yaml` est l'unique source de vérité du STATUT des stories/tâches. Les stories générées ne contiennent que du contenu (pas de champ de statut) ; les enregistrer dans `.bmad/sprint-status.yaml` (schéma : `.claude/templates/project/sprint-status.md`) une fois validées.

**Chemins par défaut :**

```
project-management/
+-- scan-report.md                  # scan
+-- prd.md                          # prd (BROUILLON)
+-- backlog/user-stories/US-*.md    # stories
+-- analysis/
    +-- reverse-engineering.md      # prd : notes d'analyse et niveaux de confiance
    +-- gap-analysis.md             # gaps
```

**Prérequis :** code source accessible ; `README.md`, `docker-compose.yml`, `./docs/` optionnels. `prd`, `stories` et `gaps` nécessitent `project-management/scan-report.md` -- s'il manque, lancer `scan` d'abord (automatique avec `all`). `gaps` nécessite aussi un PRD (`project-management/prd.md`, issu de `/project:generate-prd` ou de `prd`) ; `stories` et `gaps` l'utilisent pour la traçabilité FR-xxx lorsqu'il existe.

**Convention de sortie :** chaque étape affiche une bannière de progression encadrée, se termine par un court résumé et propose les prochaines étapes (valider de façon interactive, lancer la sous-commande suivante). Avec `all`, marquer une pause de validation humaine après `prd` et `stories` avant de continuer vers `gaps`.

## scan

Point d'entrée du pipeline : un inventaire structuré du code.

**1. Détection de la stack.** Parcourir la racine à la recherche de marqueurs de framework, lire le manifeste (`composer.json`, `package.json`, `pubspec.yaml`, `*.csproj`, `pyproject.toml`), identifier la version du framework et les dépendances clés, détecter l'infrastructure (Docker, CI/CD, Redis, files de messages) et choisir l'agent reviewer adapté (`@symfony-reviewer`, `@react-reviewer`...).

| Pattern de fichier | Stack |
|--------------------|-------|
| `*.php` + `symfony.lock` | Symfony |
| `*.php` + `artisan` | Laravel |
| `*.php` + `composer.json` | PHP (générique) |
| `*.dart` + `pubspec.yaml` | Flutter |
| `*.tsx` / `*.jsx` + `next.config.*` | React (Next.js) |
| `*.tsx` / `*.jsx` + `package.json` | React |
| `*.vue` + `package.json` | Vue.js |
| `angular.json` | Angular |
| `*.cs` + `*.csproj` | .NET / C# |
| `*.py` + `pyproject.toml` | Python |
| `Dockerfile` / `docker-compose.yml` | Docker (infra) |

**2. Scan de la structure.** Classer les fichiers en :
1. Modules / domaines (bounded contexts, modules partagés, namespaces)
2. Endpoints (routes, contrôleurs, méthodes HTTP, chemins, middlewares/guards)
3. Modèles / entités (champs, types, relations, migrations)
4. Services (services, use cases, handlers de commandes/requêtes, listeners, subscribers)
5. Tests (unitaires / intégration / E2E, correspondance test-source, frameworks)
6. Infrastructure (Docker, CI/CD, configuration d'environnement, intégrations tierces)

**3. Analyse du code.** Estimer les LOC par module ; identifier le pattern d'architecture (MVC, Clean Architecture, DDD...) ; détecter l'outillage qualité (linting, analyse statique) ; cartographier le graphe de dépendances entre modules ; repérer les marqueurs de dette technique ; utiliser le reviewer spécifique à la stack pour des analyses ciblées.

**4. Rapport** dans `project-management/scan-report.md`, avec les sections : en-tête (projet, stack, taille, modules), Technology Stack, Modules / Bounded Contexts (fichiers, LOC, tests, couverture), Endpoints (méthode, chemin, contrôleur, auth), Models / Entities (champs, relations, migrations), Services (dépendances, type), Tests (type, nombre, framework), Infrastructure (composant, fichier de config, notes) et un Complexity Summary.

```
| Module   | Files | LOC   | Tests | Coverage |
| User     | 24    | 1,800 | 12    | ~65%     |
| Method | Path        | Controller     | Auth |
| GET    | /api/users  | UserController | JWT  |
```

Métriques du Complexity Summary : LOC total, nombre de fichiers, bounded contexts, endpoints d'API, entités en base, fichiers de test, couverture de tests estimée, pattern d'architecture.

## prd

Pendant brownfield de `/project:generate-prd` : un PRD BROUILLON inféré du code.

**1. Charger** le rapport de scan (ainsi que `./docs/` et `README.md`) ; analyser stack, modules, endpoints, entités, services.

**2. Analyse de la logique métier**, pour chaque module : événements de domaine (payloads, listeners, workflows), use cases / commandes / requêtes, règles de validation (entité, requête, assertions métier), machines à états (enums de statuts, configuration de workflow, guards), intégrations externes (paiement, e-mail, stockage, API tierces).

**3. Inférence des exigences.**

| Pattern de code | Exigence inférée |
|-----------------|------------------|
| Middleware d'auth / JWT | Authentification utilisateur requise |
| Guards par rôle | Autorisation par rôles |
| Contrôleurs CRUD | Fonctionnalités de gestion de données |
| Handlers d'upload de fichiers | Gestion de documents/médias |
| Services d'e-mail | Système de notifications |
| Passerelle de paiement | Traitement des paiements |
| Endpoints d'export | Fonctionnalités de reporting/export |
| Logique de recherche/filtre | Recherche et filtrage |
| Pagination | Gestion de gros volumes de données |
| Couches de cache | Exigences de performance |
| Workers de files | Exigences de traitement asynchrone |
| Rate limiting | Exigences de protection de l'API |

| Infrastructure | NFR inférée |
|----------------|-------------|
| Docker / Kubernetes | Scalabilité, conteneurisation |
| Redis / Memcached | Cache de performance |
| Système de files (RabbitMQ...) | Traitement asynchrone, fiabilité |
| Pipelines CI/CD | Automatisation du déploiement |
| Config de load balancer | Haute disponibilité |
| Configuration SSL/TLS | Sécurité |
| Stack de logs (ELK...) | Supervision |

Les personas proviennent du tableau commun ci-dessus.

**4. Générer** `project-management/prd.md` en huit sections : Executive Summary (INFERRED), Problem Statement (INFERRED), Goals & Metrics (**PLACEHOLDER** -- impossible à inférer, saisie humaine requise), Target Users / Personas (INFERRED, chacun en brouillon), Functional Requirements (INFERRED, une par groupe de fonctionnalités/endpoints, priorisée selon la complexité et l'usage, étiquetée avec le module source), Non-Functional Requirements (INFERRED), Scope & Constraints (INFERRED), Risks & Mitigations (INFERRED : dette, zones non testées, risques de dépendances). Écrire les notes d'analyse et la confiance par section (HIGH / MEDIUM / LOW) dans `project-management/analysis/reverse-engineering.md` ; l'en-tête du PRD affiche `Status: DRAFT - Requires human validation` et le tableau de confiance.

**5. Validation humaine.** Présenter un résumé des sections inférées, mettre en évidence celles à faible confiance et celles qui n'ont pu être inférées (Goals, Metrics), demander à l'utilisateur de valider / corriger / compléter chacune, itérer jusqu'à satisfaction.

## stories

User stories BROUILLON inférées des endpoints, services, entités et tests.

**1. Charger** le rapport de scan et le PRD s'il existe (pour la traçabilité FR-xxx) ; déterminer le périmètre (all, un `--module`, un endpoint).

**2. Extraction des fonctionnalités**, par endpoint/fonctionnalité : contrôleur/handler (méthode, route, validation de la requête, réponse et codes de statut, autorisation), service/use case (flux métier, effets de bord, appels externes, chemins d'erreur), entité/modèle (champs et contraintes, relations, transitions d'état, soft delete/timestamps), tests (noms de méthodes, assertions, fixtures, cas limites).

**3. Génération des stories.**

| Route | Action inférée |
|-------|----------------|
| `POST /api/resources` | créer une ressource |
| `GET /api/resources` | lister les ressources |
| `GET /api/resources/{id}` | consulter une ressource |
| `PUT /api/resources/{id}` | modifier une ressource |
| `DELETE /api/resources/{id}` | supprimer une ressource |
| action personnalisée | d'après le nom de méthode et la logique métier |

Inférence du bénéfice : CRUD -> « afin de gérer les données {resource} » ; recherche/filtre -> « trouver rapidement les {resources} pertinentes » ; export -> « utiliser les données {resource} à l'extérieur » ; notifications -> « être informé de {event} » ; auth -> « que mes données soient sécurisées et accessibles à moi seul ». Les critères d'acceptation viennent des tests : fixtures -> Given, actions -> When, résultats attendus -> Then.

```markdown
# US-XXX: [Titre inféré]

> INFERRED -- générée par analyse du code. Validation humaine requise.

## Source
- Module / Endpoint ({method} {path}) / Contrôleur / Implements: FR-XXX (si PRD)

## User Story
As [persona inféré] I want [action inférée] So that [bénéfice inféré]
Conversation: [ ] persona  [ ] l'action correspond à l'intention  [ ] le bénéfice correspond aux objectifs métier
INVEST: [ ] Independent / Negotiable / Valuable / Estimable / Sized / Testable

## Acceptance Criteria (Gherkin)
Scenario: nominal (depuis le cas passant)   Given / When / Then
Scenario: erreur (depuis la validation)     Given / When / Then

## Technical Notes
Entité, règles de validation, exigences d'auth, événements dispatchés

## Estimation
Story Points (selon la complexité), MoSCoW (selon les usages)
```

**4. Traçabilité** (si `project-management/prd.md` existe) : associer chaque story à une FR-xxx (ajouter `implements: FR-xxx`), lister les stories sans exigence (code sans spec) et les exigences sans story (spec sans code).

**5. Sortie et validation.** Enregistrer dans `project-management/backlog/user-stories/US-001-create-user.md`, `US-002-...`, générer un index récapitulatif groupé par module (titre, points, MoSCoW, nombre de stories reliées au PRD, nombre de non reliées), puis demander à l'utilisateur de valider, corriger ou rejeter chaque story.

## gaps

Comparer les spécifications (PRD, stories, spec technique) avec le code réel.

**1. Charger les specs :** `project-management/prd.md`, `project-management/backlog/user-stories/`, `project-management/tech-spec.md` (le cas échéant), le rapport de scan (le rafraîchir en lançant `scan` s'il manque ou est obsolète). Analyser FR-xxx, NFR-xxx et US-xxx.

**2. Scanner le code :** cataloguer endpoints, logique métier, modèles de données, tests, infrastructure dans un inventaire de fonctionnalités indexé par module.

**3. Comparaison à quatre voies :**

| Catégorie | Vérifications |
|-----------|---------------|
| **Spec sans code** (non implémenté) | FR-xxx sans endpoint correspondant ; US-xxx sans fonctionnalité correspondante ; NFR-xxx sans configuration correspondante |
| **Code sans spec** (non documenté) | Endpoints sans référence FR ; services sans référence US ; entités non couvertes par les specs |
| **Écart spec-code** (incohérent) | Différences de champs, de flux de statuts, d'auth, de validation et de format de réponse |
| **Lacunes de tests** (non testé) | Fonctionnalités sans tests unitaires / d'intégration ; critères d'acceptation sans tests E2E ; chemins d'erreur sans tests |

**4. Classer par sévérité :**

| Sévérité | Critères | Action |
|----------|----------|--------|
| **Critical** | Fonctionnalité cœur manquante ou cassée ; faille de sécurité ; risque d'intégrité des données | Correction immédiate |
| **Major** | Écart de fonctionnalité important ; incohérence significative ; tests critiques manquants | Sprint en cours |
| **Minor** | Lacune de documentation ; incohérence non critique ; tests de cas limites manquants | Sprint suivant |
| **Info** | Incohérence de style ; fonctionnalité optionnelle ; amélioration | Backlog |

Règles : spec sans code + P0 = Critical, + P1 = Major, + P2 = Minor ; code sans spec + auth = Major, + CRUD = Minor ; écart + intégrité des données = Critical, + UI/UX = Minor ; lacune de tests + logique métier = Major, + cas limite = Minor.

**5. Rapport** dans `project-management/analysis/gap-analysis.md` : en-tête (projet, date, périmètre), pourcentages de couverture spec / code / tests, nombre d'écarts par sévérité, les quatre tableaux par catégorie avec preuves (chemins de fichiers, références de lignes) et une liste de remédiation classée par priorité avec l'effort (S < 2h, M 2-8h, L > 8h).

```
| # | Action                              | Severity | Effort |
| 1 | Implement FR-005 (password reset)   | Critical | M      |
| 2 | Add integration tests for payment   | Critical | S      |
```

Proposer ensuite : créer des stories pour les fonctionnalités manquantes, générer des tâches pour les éléments de remédiation, ou se concentrer sur une catégorie d'écarts.

## all

Exécuter `scan` -> `prd` -> `stories` -> `gaps` dans l'ordre, en réutilisant chaque sortie comme entrée de l'étape suivante (sans re-scan). Marquer une pause de validation humaine après `prd` et `stories`. Terminer par un récapitulatif : fichiers écrits, nombre de personas / exigences / stories inférés, nombre d'écarts par sévérité et les 3 actions prioritaires.

## Commandes associées

- `/project:generate-prd` - Générer un PRD de façon interactive (greenfield)
- `/project:generate-backlog` - Créer un backlog SCRUM à partir du PRD
- `/project:generate-tech-spec` - Générer une spécification technique
- `/project:backlog` - Gérer epics, stories et tâches
