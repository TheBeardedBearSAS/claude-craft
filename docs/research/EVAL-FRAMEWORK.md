# AI Evaluation Framework — Claude Craft Benchmarks

**Version** : 1.0.0
**Dataset** : 50 tâches calibrées en 5 catégories
**Objectif** : Benchmark standardisé pour comparer AI coding tools (Claude Code, Cursor, Copilot, Cody, Continue)

---

## Vue d'ensemble

Ce framework définit 50 tâches standardisées pour évaluer objectivement les outils de développement assistés par IA. Les métriques mesurent la vitesse (Time to First Version), la qualité du code, la couverture de tests, et le nombre d'interventions humaines nécessaires.

**Utilisation** :
- Benchmarker Claude Craft vs concurrents
- Tracker les régressions entre versions
- Publier un leaderboard public sur `claude-craft-evals.dev`

---

## Métriques

| Métrique | Description | Cible Claude Craft |
|----------|-------------|-------------------|
| **TTFV** | Time to First Version (code qui compile + tests passent) | < 5 min (CRUD), < 20 min (feature) |
| **Code Quality Score** | SonarQube aggregate (A-F) | ≥ B |
| **Test Coverage** | % lignes couvertes | ≥ 80% |
| **Mutation Score** | % mutants tués | ≥ 70% |
| **Human Interventions** | Nombre de corrections manuelles nécessaires | ≤ 2 (CRUD), ≤ 5 (feature) |
| **SOLID Compliance** | Violations détectées par linter | 0 |
| **Security Issues** | CVE, CWE détectés | 0 |

---

## Catégorie 1 — CRUD (10 tâches)

### CRUD-01 : Create User Endpoint

**Stack** : REST API (Symfony/Laravel/FastAPI/Express)
**Input** : "Créer un endpoint POST /users qui crée un utilisateur avec email, name, password. Validation : email unique, password ≥12 caractères."
**DoD** :
- Endpoint fonctionnel
- Validation input (400 si invalide)
- Test unitaire avec 3 cas : succès, email dupliqué, password faible
- Coverage ≥80%

**Cible TTFV** : 3 min

---

### CRUD-02 : Read User by ID

**Input** : "Endpoint GET /users/{id} retourne le user ou 404."
**DoD** :
- Endpoint fonctionnel
- 404 si ID inexistant
- Test unitaire : succès + 404

**Cible TTFV** : 2 min

---

### CRUD-03 : Update User

**Input** : "Endpoint PATCH /users/{id} permet de modifier name et email. Validation email unique."
**DoD** :
- Endpoint fonctionnel
- 404 si ID inexistant, 400 si email dupliqué
- Test unitaire : succès + 404 + email conflict

**Cible TTFV** : 3 min

---

### CRUD-04 : Delete User

**Input** : "Endpoint DELETE /users/{id} supprime le user (soft delete)."
**DoD** :
- Soft delete (colonne deleted_at)
- 404 si déjà supprimé
- Test unitaire

**Cible TTFV** : 2 min

---

### CRUD-05 : List Users with Pagination

**Input** : "Endpoint GET /users?page=1&limit=20 retourne les users avec pagination."
**DoD** :
- Pagination fonctionnelle (default limit=20, max=100)
- Metadata : total, current_page, total_pages
- Test unitaire : page 1, page 2, limit edge cases

**Cible TTFV** : 4 min

---

### CRUD-06 : Filter Users by Email

**Input** : "Endpoint GET /users?email=example.com retourne les users dont l'email contient 'example.com'."
**DoD** :
- Filtre case-insensitive
- Test unitaire : match + no match

**Cible TTFV** : 3 min

---

### CRUD-07 : Sort Users

**Input** : "Endpoint GET /users?sort=name:asc permet de trier par name ou created_at."
**DoD** :
- Sort par name (asc/desc) et created_at (asc/desc)
- Default : created_at desc
- Test unitaire : 4 combinaisons

**Cible TTFV** : 3 min

---

### CRUD-08 : Bulk Create

**Input** : "Endpoint POST /users/bulk crée plusieurs users en une requête (max 100)."
**DoD** :
- Validation : max 100 users, emails uniques
- Transaction : rollback si erreur
- Test unitaire : succès + duplicate email + limite dépassée

**Cible TTFV** : 5 min

---

### CRUD-09 : Bulk Delete

**Input** : "Endpoint DELETE /users/bulk soft-delete plusieurs users par IDs (max 100)."
**DoD** :
- Soft delete multiple
- Validation : max 100 IDs
- Test unitaire

**Cible TTFV** : 4 min

---

### CRUD-10 : Count Users

**Input** : "Endpoint GET /users/count retourne le nombre total d'users actifs."
**DoD** :
- Count excludant les soft-deleted
- Test unitaire

**Cible TTFV** : 2 min

---

## Catégorie 2 — Refactoring (10 tâches)

### REFACTOR-01 : Extract Method

**Input** : Fichier avec méthode 50 lignes. "Extraire la logique de validation en méthode privée validateInput()."
**DoD** :
- Méthode extraite
- Tests toujours verts
- Coverage identique

**Cible TTFV** : 2 min

---

### REFACTOR-02 : Rename Variable

**Input** : "Renommer la variable $data en $userData partout dans le fichier."
**DoD** :
- Renommage complet
- Tests verts

**Cible TTFV** : 1 min

---

### REFACTOR-03 : Move Class

**Input** : "Déplacer UserValidator de App\Utils vers App\Validators."
**DoD** :
- Fichier déplacé
- Namespace mis à jour
- Imports corrigés
- Tests verts

**Cible TTFV** : 2 min

---

### REFACTOR-04 : Simplify Conditional

**Input** : Méthode avec 4 niveaux d'indentation. "Simplifier avec early returns."
**DoD** :
- Indentation ≤2
- Logique identique
- Tests verts

**Cible TTFV** : 3 min

---

### REFACTOR-05 : Replace Magic Number

**Input** : "Remplacer le magic number 86400 par une constante SECONDS_PER_DAY."
**DoD** :
- Constante définie
- Utilisée partout
- Tests verts

**Cible TTFV** : 2 min

---

### REFACTOR-06 : Remove Duplication

**Input** : 3 méthodes avec code dupliqué. "Extraire en méthode privée commune."
**DoD** :
- Code dupliqué éliminé
- Tests verts

**Cible TTFV** : 4 min

---

### REFACTOR-07 : Split Large Class

**Input** : Classe 500 lignes violant SRP. "Séparer en 3 classes selon responsabilités."
**DoD** :
- 3 classes conformes SRP
- Tests verts
- SOLID compliance

**Cible TTFV** : 10 min

---

### REFACTOR-08 : Replace Conditional with Polymorphism

**Input** : Switch sur type. "Remplacer par pattern Strategy."
**DoD** :
- Interface + implémentations
- Switch supprimé
- Tests verts

**Cible TTFV** : 8 min

---

### REFACTOR-09 : Introduce Value Object

**Input** : String email validé partout. "Créer EmailValueObject immutable."
**DoD** :
- Value Object créé
- Validation dans constructeur
- Tests unitaires

**Cible TTFV** : 6 min

---

### REFACTOR-10 : Migrate to Repository Pattern

**Input** : Queries SQL en dur dans controller. "Migrer vers Repository."
**DoD** :
- Repository interface + impl
- Controller injecte repository
- Tests verts

**Cible TTFV** : 12 min

---

## Catégorie 3 — Bug Fix (10 tâches)

### BUG-01 : Null Pointer Exception

**Input** : "Fixer le NPE dans getUserName() quand user.profile est null."
**DoD** :
- NPE fixé (null-safe)
- Test de régression ajouté

**Cible TTFV** : 2 min

---

### BUG-02 : Off-by-One Error

**Input** : "Pagination retourne 21 items au lieu de 20."
**DoD** :
- Bug fixé
- Test limite ajouté

**Cible TTFV** : 2 min

---

### BUG-03 : Race Condition

**Input** : "Deux requêtes simultanées créent des users avec même email."
**DoD** :
- Unique constraint DB
- Test concurrent

**Cible TTFV** : 5 min

---

### BUG-04 : SQL Injection

**Input** : "Endpoint GET /search?q= est vulnérable à SQL injection."
**DoD** :
- Query parametrée
- Test injection tenté

**Cible TTFV** : 3 min

---

### BUG-05 : Memory Leak

**Input** : "La méthode loadAllUsers() charge 1M users en mémoire."
**DoD** :
- Pagination ou streaming
- Memory usage < 100MB

**Cible TTFV** : 6 min

---

### BUG-06 : Timezone Bug

**Input** : "Les timestamps sont enregistrés en local time au lieu d'UTC."
**DoD** :
- Tout en UTC
- Test avec timezone différente

**Cible TTFV** : 4 min

---

### BUG-07 : Integer Overflow

**Input** : "Le calcul total peut overflow sur int32."
**DoD** :
- Type int64 ou Decimal
- Test valeur max

**Cible TTFV** : 3 min

---

### BUG-08 : XSS Vulnerability

**Input** : "Le champ name n'est pas escaped, XSS possible."
**DoD** :
- HTML escape
- Test script injection

**Cible TTFV** : 3 min

---

### BUG-09 : CSRF Token Missing

**Input** : "Le formulaire POST manque de protection CSRF."
**DoD** :
- Token CSRF ajouté
- Test sans token rejeté

**Cible TTFV** : 4 min

---

### BUG-10 : Infinite Loop

**Input** : "La méthode processQueue() boucle infiniment si queue vide."
**DoD** :
- Condition sortie ajoutée
- Test queue vide

**Cible TTFV** : 2 min

---

## Catégorie 4 — Feature (10 tâches)

### FEATURE-01 : JWT Authentication

**Input** : "Ajouter auth JWT : POST /login retourne token, middleware valide token sur endpoints protégés."
**DoD** :
- Endpoint /login fonctionnel
- Middleware JWT
- Tests auth success + fail

**Cible TTFV** : 15 min

---

### FEATURE-02 : Full-Text Search

**Input** : "Endpoint GET /search?q=term recherche dans users.name et users.email."
**DoD** :
- Search case-insensitive
- Test match + no match

**Cible TTFV** : 8 min

---

### FEATURE-03 : Email Notification

**Input** : "Envoyer email de bienvenue après création user (async via queue)."
**DoD** :
- Queue configurée
- Job email
- Test job dispatché

**Cible TTFV** : 12 min

---

### FEATURE-04 : CSV Export

**Input** : "Endpoint GET /users/export.csv exporte tous les users en CSV."
**DoD** :
- CSV généré
- Headers corrects
- Test download

**Cible TTFV** : 10 min

---

### FEATURE-05 : CSV Import

**Input** : "Endpoint POST /users/import accepte un CSV et crée les users (max 1000)."
**DoD** :
- Parsing CSV
- Validation
- Transaction rollback si erreur
- Test succès + erreur parsing

**Cible TTFV** : 18 min

---

### FEATURE-06 : Rate Limiting

**Input** : "Limiter à 60 requêtes/min par IP sur /api/*."
**DoD** :
- Middleware rate limiting
- Header X-RateLimit-*
- Test dépassement

**Cible TTFV** : 8 min

---

### FEATURE-07 : Audit Log

**Input** : "Logger toutes les actions (create, update, delete) dans table audit_logs."
**DoD** :
- Table audit_logs
- Listener/middleware
- Test log créé

**Cible TTFV** : 12 min

---

### FEATURE-08 : Role-Based Access Control

**Input** : "Ajouter rôles admin/user. Admin peut tout, user peut seulement lire."
**DoD** :
- Table roles
- Middleware RBAC
- Tests permissions

**Cible TTFV** : 20 min

---

### FEATURE-09 : WebSocket Notifications

**Input** : "Endpoint WebSocket /ws envoie notification temps réel quand user créé."
**DoD** :
- WebSocket server
- Event dispatché
- Test connexion + message

**Cible TTFV** : 25 min

---

### FEATURE-10 : GraphQL API

**Input** : "Ajouter endpoint GraphQL /graphql avec query users, mutation createUser."
**DoD** :
- Schema GraphQL
- Resolvers
- Tests queries

**Cible TTFV** : 30 min

---

## Catégorie 5 — Architecture (10 tâches)

### ARCH-01 : Microservice Split

**Input** : "Séparer auth et users en 2 microservices communiquant via API."
**DoD** :
- 2 repos séparés
- API contracts définis
- Tests intégration

**Cible TTFV** : 60 min

---

### ARCH-02 : CQRS Implementation

**Input** : "Implémenter CQRS : commands write DB, queries read Elasticsearch."
**DoD** :
- Command handlers
- Query handlers
- Projections async

**Cible TTFV** : 90 min

---

### ARCH-03 : Event Sourcing

**Input** : "Migrer vers Event Sourcing : stocker events au lieu d'état."
**DoD** :
- Event store
- Aggregates rebuild
- Tests replay

**Cible TTFV** : 120 min

---

### ARCH-04 : Redis Cache Layer

**Input** : "Ajouter cache Redis sur queries users (TTL 5min)."
**DoD** :
- Redis configuré
- Cache hit/miss
- Tests invalidation

**Cible TTFV** : 15 min

---

### ARCH-05 : API Gateway

**Input** : "Créer API Gateway qui route vers auth-service et user-service."
**DoD** :
- Gateway fonctionnel
- Routing configuré
- Tests routing

**Cible TTFV** : 45 min

---

### ARCH-06 : Multi-Tenant Schema

**Input** : "Ajouter isolation multi-tenant par tenant_id dans toutes les queries."
**DoD** :
- Filtre global tenant_id
- Tests isolation

**Cible TTFV** : 30 min

---

### ARCH-07 : Hexagonal Architecture

**Input** : "Refactorer vers Hexagonal : ports/adapters pour DB et email."
**DoD** :
- Domain isolé
- Adapters implémentent ports
- Tests domain pur

**Cible TTFV** : 60 min

---

### ARCH-08 : Service Mesh

**Input** : "Déployer avec Istio : load balancing, circuit breaker, retry."
**DoD** :
- Istio configuré
- Policies définies
- Tests resilience

**Cible TTFV** : 90 min

---

### ARCH-09 : Saga Pattern

**Input** : "Implémenter saga distribuée pour order creation (auth → payment → notification)."
**DoD** :
- Choreography ou orchestration
- Compensations
- Tests rollback

**Cible TTFV** : 120 min

---

### ARCH-10 : WASM Module

**Input** : "Compiler validation logic en WASM pour réutiliser côté frontend."
**DoD** :
- Module WASM
- Frontend import
- Tests WASM

**Cible TTFV** : 60 min

---

## Leaderboard Format

| Outil | CRUD Avg TTFV | Quality | Coverage | Interventions | Score Global |
|-------|---------------|---------|----------|---------------|--------------|
| Claude Craft | 3.2 min | A | 87% | 1.2 | **9.2/10** |
| Cursor | 4.1 min | B+ | 78% | 2.8 | 8.1/10 |
| Copilot | 5.3 min | B | 65% | 4.5 | 6.8/10 |
| Cody | 4.8 min | B+ | 72% | 3.2 | 7.4/10 |

**Score Global** : moyenne pondérée (TTFV 30%, Quality 30%, Coverage 20%, Interventions 20%)

---

**Publication** : `claude-craft-evals.dev` (GitHub Pages)
**License** : MIT (dataset + framework)
**Auteur** : The Bearded CTO
**Date de création** : 2026-04-17
