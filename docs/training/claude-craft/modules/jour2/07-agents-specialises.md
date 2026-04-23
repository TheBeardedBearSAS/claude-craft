# Module 7 : Agents Specialises, BMAD et Docker (Claude Code 2.1.117 + Claude-Craft 8.2.3)

## Objectifs

A la fin de ce module, vous serez capable de :
- Connaitre les 63 agents disponibles dans Claude-Craft 8.2.3, organises en 11 catégories
- Comprendre le systeme de Skills de Claude Code 2.1.117
- Maitriser le workflow BMAD v6 avec ses commandes dediees
- Utiliser les 5 agents Docker pour l'infrastructure
- Comprendre le format YAML frontmatter des agents avec les nouvelles proprietes (effort, maxTurns, disallowedTools)
- Savoir invoquer le bon skill/agent selon le contexte
- Combiner skills et agents efficacement

---

## 1. Skills System (Claude Code 2.1.117)

### Qu'est-ce qu'un Skill ?

Un **Skill** est un ensemble de guidelines et bonnes pratiques que Claude peut charger a la demande. C'est le systeme officiel de Claude Code pour etendre ses capacites.

### Invocation des Skills

```bash
# Charger un skill manuellement
/testing                    # TDD/BDD principles
/security                   # OWASP guidelines
/git-workflow               # Git best practices
/documentation              # Documentation standards
/solid-principles           # SOLID patterns
/kiss-dry-yagni             # Code simplicity

# Lister les skills disponibles
/skills
```

### Chargement automatique (context.yaml)

Les skills peuvent etre charges automatiquement selon le contexte :

```yaml
# .claude/context.yaml
triggers:
  testing:
    keywords: ["test", "TDD", "spec", "PHPUnit", "Jest"]
    auto_load: true
  security:
    keywords: ["security", "auth", "OWASP", "vulnerability"]
    auto_load: true
```

### Skills disponibles (Claude-Craft 8.2.3)

| Skill | Trigger | Contenu |
|-------|---------|---------|
| `testing` | test, TDD, spec | TDD/BDD, couverture 80%+ |
| `security` | security, auth, OWASP | OWASP Top 10, audit |
| `git-workflow` | commit, branch, PR | Conventional Commits |
| `documentation` | docs, README, ADR | Standards documentation |
| `workflow-analysis` | feature, analyse | Workflow obligatoire |
| `solid-principles` | SOLID, refactor | SRP, OCP, LSP, ISP, DIP |
| `kiss-dry-yagni` | simple, duplicate | Principes de simplicite |

---

## 2. Panorama des 63 Agents (11 Catégories)

Claude-Craft 8.2.3 propose **63 agents** repartis en **11 catégories** distinctes. Chaque agent est un expert dans son domaine, invocable via la syntaxe `@agent-name`.

> **Optimisation des modeles** : Les agents utilisent un modele adapte a leur role. Les reviewers et auditors utilisent **haiku** (economique pour les taches de verification), tandis que les engineers et architects utilisent **sonnet** (puissant pour les taches de conception et implementation).

### Common Agents (12)

Les agents transversaux utilisables quel que soit le stack technologique.

| Agent | Expertise |
|-------|-----------|
| `@api-designer` | REST/GraphQL API design |
| `@database-architect` | Database optimization |
| `@devops-engineer` | CI/CD, Docker, deployment |
| `@performance-auditor` | Performance analysis |
| `@refactoring-specialist` | Safe code refactoring |
| `@tdd-coach` | Test-Driven Development |
| `@uiux-orchestrator` | UI/UX coordination |
| `@ui-designer` | Design systems, tokens |
| `@ux-ergonome` | User flows, cognitive ergonomics |
| `@accessibility-expert` | WCAG 2.2 AAA compliance |
| `@research-assistant` | Technical research |
| `@ralph-conductor` | Continuous loop orchestration |

**Exemples d'utilisation :**

```bash
# Design d'API REST
@api-designer "Concois l'API REST pour la gestion d'un panier e-commerce"

# Audit de performance
@performance-auditor "Analyse les goulots d'etranglement de ce service"

# Refactoring guide
@refactoring-specialist "Refactore cette classe en appliquant le pattern Strategy"

# Accessibilite
@accessibility-expert "Verifie la conformite WCAG 2.2 AAA de ce formulaire"
```

### Technology Reviewers (10)

Un reviewer dedie pour chaque stack technologique supporte.

| Agent | Technology |
|-------|------------|
| `@symfony-reviewer` | Symfony/PHP |
| `@flutter-reviewer` | Flutter/Dart |
| `@react-reviewer` | React |
| `@python-reviewer` | Python |
| `@angular-reviewer` | Angular |
| `@laravel-reviewer` | Laravel |
| `@vuejs-reviewer` | Vue.js |
| `@reactnative-reviewer` | React Native |
| `@csharp-reviewer` | C#/.NET |
| `@php-reviewer` | PHP |

**Exemples d'utilisation :**

```bash
# Review Symfony
@symfony-reviewer "Revois ce controller et verifie le respect de Clean Architecture"

# Review React
@react-reviewer "Verifie ce composant pour les bonnes pratiques React 19"

# Review Python
@python-reviewer "Analyse ce service FastAPI pour les conventions Python 3.13"

# Review Flutter
@flutter-reviewer "Valide ce widget BLoC pour les patterns Flutter 3.38"
```

### Project Agents (2)

Les agents projet pour la gestion technique et produit.

| Agent | Role |
|-------|------|
| `@product-owner` | Product management (CSPO) |
| `@tech-lead` | Technical leadership |

> **Note BMAD v6 :** Les roles BMAD (bmad-master, pm, ba, architect, po, sm, dev, qa, qa-recette, ux) sont integres dans les commandes `/workflow:*` et `/sprint:*`, pas en agents autonomes. Cette integration permet un workflow plus fluide ou chaque commande active le role BMAD adapte.

### Docker Agents (5)

Les agents specialises dans l'ecosysteme Docker et l'infrastructure.

| Agent | Expertise |
|-------|-----------|
| `@docker-dockerfile` | Dockerfile optimization |
| `@docker-compose` | Compose orchestration |
| `@docker-debug` | Container troubleshooting |
| `@docker-cicd` | CI/CD pipelines |
| `@docker-architect` | Docker architecture |

---

## 3. BMAD Workflow in Action

### Le Workflow BMAD v6

BMAD v6 utilise des **commandes dediees** qui activent le role BMAD adapte a chaque phase du cycle de developpement :

```
/workflow:plan (PRD) --> /workflow:design (Tech Spec) --> /sprint:next-story (Backlog)
        |                       |                              |
        v                       v                              v
      Vision               Architecture                   Priorites
      Produit              & Design                        & Stories

--> /workflow:implement (Code) --> /qa:recette (Tests)
            |                           |
            v                           v
        TDD/Code                     Qualite
        & Review                     & Recette
```

### Etape 1 : Initialisation du projet

```bash
# Initialiser le workflow (auto-detect track)
/workflow:init "Implement user authentication with OAuth2, magic links, and 2FA"

# Claude configure la structure BMAD :
# - Cree le dossier .bmad/
# - Initialise les templates
# - Configure les quality gates
# - Recommande le track adapte (Quick Flow, Standard ou Enterprise)
```

### Etape 2 : Generer le PRD

```bash
/workflow:plan

# Output :
# --- PRD : User Authentication System ---
#
# 1. Vision
#    Systeme d'authentification moderne, securise et frictionless
#
# 2. Objectifs
#    - Support OAuth2 (Google, GitHub, Microsoft)
#    - Magic links par email
#    - 2FA via TOTP (Google Authenticator)
#
# 3. User Stories
#    US-001: En tant qu'utilisateur, je veux me connecter via Google
#    US-002: En tant qu'utilisateur, je veux recevoir un magic link
#    US-003: En tant qu'utilisateur, je veux activer la 2FA
#    ...
```

### Etape 3 : Validation Quality Gate

```bash
# Valider le PRD avant de passer a l'architecture
/gate:validate-prd

# Output :
# --- PRD Quality Gate ---
# Score : 87% (seuil : 80%)
#
# [PASS] Vision claire et mesurable
# [PASS] User stories au format standard
# [PASS] Criteres d'acceptation definis
# [WARN] Metriques de succes a preciser
# [PASS] Contraintes techniques identifiees
#
# Resultat : PASSE - Pret pour la phase Design
```

### Etape 4 : Concevoir l'architecture

```bash
/workflow:design

# Output :
# --- Tech Spec : Authentication Architecture ---
#
# 1. Architecture
#    Clean Architecture avec 4 couches
#
# 2. Composants
#    - AuthenticationService (Domain)
#    - OAuth2Provider (Infrastructure)
#    - MagicLinkGenerator (Application)
#    - TwoFactorValidator (Domain)
#
# 3. Diagramme de sequence
#    ...
```

### Etape 5 : Sprint et implementation TDD

```bash
# Recuperer la prochaine story prete
/sprint:next-story

# Implementer en TDD
/workflow:implement

# Le workflow suit le cycle TDD :
# Phase RED : Ecrit les tests qui echouent
# Phase GREEN : Implemente le minimum pour passer les tests
# Phase REFACTOR : Ameliore le code
```

### Etape 6 : Validation et tests d'acceptance

```bash
# Valider la Definition of Done
/gate:validate-story US-001

# Tests d'acceptation automatises via Chrome
/qa:recette --scope=story --id=US-001
```

### Utiliser les Project Agents

```bash
# Product Owner pour la gestion produit
@product-owner "Prioritize the authentication backlog for Sprint 1"

# Tech Lead pour les decisions techniques
@tech-lead "Review the authentication architecture decisions"
```

### Enchainer les commandes BMAD

```bash
# Workflow complet en une session
/workflow:init "Notification system"
/workflow:plan
/gate:validate-prd
/workflow:design
/sprint:next-story
/workflow:implement
/gate:validate-story
```

---

## 4. Docker Agents

### Pourquoi des agents Docker dedies ?

Claude-Craft 8.2.3 inclut 5 agents specialises Docker car l'infrastructure as code est un pilier du developpement moderne. Chaque agent couvre un aspect specifique de l'ecosysteme Docker.

### @docker-architect : Conception d'architecture

```bash
@docker-architect "Design Docker architecture for a microservices e-commerce platform"

# Output :
# --- Docker Architecture : E-Commerce Microservices ---
#
# Services :
# - api-gateway (Nginx/Traefik)
# - auth-service (Node.js)
# - catalog-service (Python/FastAPI)
# - order-service (Symfony)
# - payment-service (.NET)
# - notification-service (Go)
#
# Infrastructure :
# - PostgreSQL (primary DB)
# - Redis (cache + sessions)
# - RabbitMQ (message broker)
# - MinIO (object storage)
#
# Reseau :
# - frontend-network (gateway + services publics)
# - backend-network (services internes + BDD)
# - monitoring-network (Prometheus + Grafana)
```

### @docker-compose : Orchestration

```bash
# Generer un docker-compose complet
/docker:compose-setup

# Ou via l'agent directement
@docker-compose "Create docker-compose.yml for Symfony + PostgreSQL + Redis + Mailpit"

# Output :
# Genere docker-compose.yml avec :
# - Service PHP-FPM 8.5 (Symfony)
# - Nginx reverse proxy
# - PostgreSQL 17
# - Redis 7.4
# - Mailpit pour les emails
# - Volumes pour la persistance
# - Healthchecks pour chaque service
```

### @docker-debug : Diagnostic

```bash
# Diagnostic automatise
/docker:debug

# Ou via l'agent pour un probleme precis
@docker-debug "Le container PHP retourne une erreur 502 Bad Gateway"

# Output :
# --- DIAGNOSTIC DOCKER ---
#
# Analyse en cours...
#
# Probleme identifie :
# Le container php-fpm n'est pas accessible depuis nginx
#
# Causes possibles :
# 1. php-fpm n'ecoute pas sur le bon socket/port
# 2. Les containers ne sont pas sur le meme reseau
# 3. Healthcheck php-fpm en echec
#
# Solution recommandee :
# 1. Verifier fastcgi_pass dans nginx.conf
# 2. S'assurer que les deux services partagent le meme network
# 3. Verifier les logs : docker compose logs php
```

### @docker-dockerfile : Optimisation

```bash
@docker-dockerfile "Optimize this Dockerfile for production PHP 8.5"

# Output :
# --- DOCKERFILE OPTIMIZATION ---
#
# Problemes detectes :
# 1. Image de base trop volumineuse (1.2 GB)
# 2. Pas de multi-stage build
# 3. Cache layers non optimise
# 4. Secrets en dur dans le build
#
# Dockerfile optimise :
# - Multi-stage : builder + runtime
# - Image alpine (120 MB)
# - OPcache configure
# - Non-root user
# - Healthcheck integre
```

### @docker-cicd : Pipelines

```bash
# Generer un pipeline CI/CD
/docker:cicd-pipeline

@docker-cicd "Create GitHub Actions pipeline with Docker build, test, and deploy"

# Output :
# Genere .github/workflows/ci.yml avec :
# - Build multi-arch (amd64/arm64)
# - Tests dans containers isoles
# - Scan de securite (Trivy)
# - Push vers registry
# - Deploy staging/production
```

---

## 5. Agent YAML Frontmatter

### Structure d'un agent

Chaque agent dans Claude-Craft 8.2.3 est defini par un fichier Markdown avec un **frontmatter YAML** qui configure son comportement :

```yaml
---
name: my-agent
description: Expert in X
model: sonnet
effort: medium
maxTurns: 10
tools: [Read, Write, Bash, Glob, Grep]
disallowedTools: [WebSearch]
skills: [testing, security]
---
```

### Proprietes du frontmatter

| Propriete | Type | Description |
|-----------|------|-------------|
| `name` | string | Identifiant unique de l'agent |
| `description` | string | Description de l'expertise |
| `model` | string | Modele Claude a utiliser (sonnet, opus, haiku) |
| `effort` | string | Niveau d'effort : `low`, `medium`, `high` (v2.1.78+) |
| `maxTurns` | number | Nombre maximum de tours d'interaction (v2.1.78+) |
| `tools` | list | Outils autorises pour l'agent |
| `disallowedTools` | list | Outils explicitement interdits |
| `skills` | list | Skills charges automatiquement |
| `permissionMode` | string | Mode de permissions specifique a l'agent |
| `memory` | string | Type de memoire : `user`, `project`, `local` (v2.1.33+) |

### Nouvelles proprietes v2.1.78+ : Controle des agents

Les proprietes `effort`, `maxTurns` et `disallowedTools` permettent d'optimiser les couts et le scope des sous-agents :

```yaml
---
name: quick-reviewer
description: Fast code review for simple changes
effort: low              # Minimal reasoning effort
maxTurns: 5              # Maximum 5 interactions
disallowedTools:
  - Edit                 # Ne peut pas modifier de code
  - Write                # Lecture seule
---
```

| Effort | Usage | Cout relatif |
|--------|-------|--------------|
| `low` | Taches simples, lookups | Minimal |
| `medium` | Implementation courante | Standard |
| `high` | Raisonnement complexe, architecture | Maximum |

### Exemple complet : Agent @tdd-coach

```yaml
---
name: tdd-coach
description: Expert TDD/BDD. Guides developers through Red-Green-Refactor cycle. Use when writing tests or implementing test-first.
model: sonnet
tools: [Read, Write, Bash, Glob, Grep]
disallowedTools: [WebSearch]
skills: [testing, solid-principles]
---

# TDD Coach

## Methodology
- Always start with a failing test (RED)
- Write the minimum code to pass (GREEN)
- Refactor while keeping tests green (REFACTOR)

## Test Structure
- Arrange / Act / Assert pattern
- One assertion per test
- Descriptive test names

## Coverage Targets
- Unit tests: 80%+
- Integration tests: key paths
- E2E tests: critical workflows
```

### Exemple complet : Agent @docker-debug

```yaml
---
name: docker-debug
description: Container troubleshooting specialist. Diagnoses Docker issues including networking, volumes, permissions, and performance.
model: sonnet
tools: [Read, Bash, Glob, Grep]
disallowedTools: [Write, WebSearch]
skills: []
---

# Docker Debug Agent

## Diagnostic Process
1. Check container status and health
2. Inspect logs for errors
3. Verify network connectivity
4. Check volume mounts and permissions
5. Analyze resource usage

## Common Issues
- Port conflicts
- Volume permission denied
- Network isolation problems
- OOM kills
- Build cache corruption
```

### Exemple complet : Agent @qa

```yaml
---
name: qa
description: QA Engineer for BMAD v6. Validates stories against acceptance criteria, runs test suites, and ensures Definition of Done compliance.
model: sonnet
tools: [Read, Bash, Glob, Grep]
disallowedTools: [Write, WebSearch]
skills: [testing]
---

# QA Engineer

## Validation Process
1. Read acceptance criteria from story
2. Verify each criterion independently
3. Run automated test suite
4. Check edge cases and error handling
5. Validate DoD compliance

## Quality Gates
- All acceptance criteria met
- Test coverage >= 80%
- No critical/high security issues
- Performance within SLA
```

### Personnalisation : Creer son propre agent

```bash
# Creer un agent metier personnalise
# .claude/agents/order-specialist.md

---
name: order-specialist
description: Expert in order lifecycle management. Handles order state machines, payment flows, and fulfillment rules.
model: sonnet
tools: [Read, Write, Bash, Glob, Grep]
disallowedTools: [WebSearch]
skills: [testing, security]
---

# Order Specialist

## Domain Rules
- Order statuses: draft -> pending -> confirmed -> shipped -> delivered
- Cancellation only allowed before shipping
- Refund rules depend on delivery status

## Validation
- Total must match sum of line items
- Currency consistency check
- Stock availability verification
```

---

## 6. Skills vs Agents : Quand utiliser quoi ?

### Comparaison

| Aspect | Skills | Agents |
|--------|--------|--------|
| Invocation | `/skill-name` | `@agent-name` ou prompt |
| Nature | Guidelines, principes | Expertise, dialogue, actions |
| Chargement | On-demand ou automatique | A la demande |
| Persistance | Durant la session | Conversation |
| Configuration | Triggers dans context.yaml | YAML frontmatter |
| Usage typique | Appliquer des regles | Resoudre un probleme |

### Guide de selection

```
+-----------------------------------------------------------------+
|              SELECTION SKILL / AGENT                            |
+-----------------------------------------------------------------+
|                                                                 |
|  Besoin de...              ->  Utiliser                         |
|  ---------------              --------                          |
|  Guidelines TDD            ->  /testing                         |
|  Ecriture de tests guidee  ->  @tdd-coach                       |
|  Guidelines securite       ->  /security                        |
|  Audit securite complet    ->  /symfony:check-security           |
|  Design API                ->  @api-designer                    |
|  Review de code            ->  @symfony-reviewer (ou autre)     |
|  Architecture systeme      ->  @tech-lead                       |
|  Optimisation BDD          ->  @database-architect              |
|  Conventions git           ->  /git-workflow                    |
|  Design UI/UX              ->  @uiux-orchestrator               |
|  Accessibilite             ->  @accessibility-expert            |
|  Infra Docker              ->  @docker-architect                |
|  Debug container           ->  @docker-debug                    |
|  Pipeline CI/CD            ->  @docker-cicd                     |
|  Gestion de projet         ->  @product-owner                   |
|  Tests navigateur          ->  /qa:recette                      |
|  Sprint autonome           ->  @ralph-conductor                 |
|                                                                 |
+-----------------------------------------------------------------+
```

---

## 7. Utilisation Pratique des Skills

### Utiliser /security pour audit

```bash
# Charger le skill security
/security

# Puis demander l'audit
"Analyse ce code de paiement"

# Claude repond avec le contexte OWASP :
# AUDIT SECURITE
#
# Vulnerabilites detectees :
# 1. [A03:2021] Injection - Donnees non validees
# 2. [A07:2021] XSS - Pas d'echappement
# ...
```

### Utiliser /git-workflow pour commits

```bash
# Charger le skill
/git-workflow

# Demander aide pour commit
"J'ai ajoute une feature de discount"

# Claude repond avec Conventional Commits :
# Message suggere :
# feat(order): add discount calculation
#
# Details :
# - Support des codes promo
# - Calcul progressif selon montant
```

### Utiliser /testing pour TDD

```bash
# Charger le skill testing
/testing

# Claude repond maintenant avec le contexte TDD :
"Je veux creer un service de notification"

# Claude:
# "D'apres les principes TDD, commencons par ecrire les tests :
#
# ```php
# class NotificationServiceTest extends TestCase
# {
#     public function testSendsEmailOnOrderCreated(): void
#     {
#         // Arrange
#         ...
#     }
# }
# ```
```

---

## 8. Combinaison Skills + Agents

### Workflow multi-etapes

```bash
# 1. Charger le skill d'architecture
/solid-principles

# 2. Design avec contexte SOLID
@api-designer "Concois l'API pour le module Paiement"

# 3. Charger le skill testing
/testing

# 4. Tests avec TDD
@tdd-coach "Ecris les tests pour PaymentService"

# 5. Implementation
"Implemente PaymentService selon les tests"

# 6. Review avec le skill security charge
/security
@symfony-reviewer "Revois PaymentService"

# 7. Validation BMAD
/gate:validate-story
```

### Workflow Docker complet

```bash
# 1. Architecture
@docker-architect "Design l'infrastructure pour un projet Symfony"

# 2. Generation du compose
/docker:compose-setup

# 3. Debug si necessaire
@docker-debug "Le container PHP ne demarre pas"

# 4. Pipeline CI/CD
@docker-cicd "Configure le pipeline GitHub Actions"
```

---

## 9. Integration avec les Hooks

### Charger un skill automatiquement via hook

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "echo 'Loading testing skill...'",
        "onlyIf": "*Test.php"
      }
    ]
  }
}
```

### Notification apres review

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "if [[ $FILE_PATH == *.php ]]; then echo 'Consider running @symfony-reviewer'; fi"
      }
    ]
  }
}
```

---

## 10. Exercice Pratique

### Objectif

Realiser une code review complete avec skills, agents, BMAD et Docker.

### Scenario

Vous avez un `PaymentController` a reviewer et a deployer :

```php
class PaymentController extends AbstractController
{
    private $em;
    private $stripe;

    public function __construct($em, $stripe) {
        $this->em = $em;
        $this->stripe = $stripe;
    }

    #[Route('/pay', methods: ['POST'])]
    public function pay(Request $request)
    {
        $data = json_decode($request->getContent());
        $order = $this->em->find(Order::class, $data->order_id);

        $charge = $this->stripe->charges->create([
            'amount' => $order->getTotal() * 100,
            'currency' => 'eur',
            'source' => $data->token
        ]);

        $order->setStatus('paid');
        $order->setPaymentId($charge->id);
        $this->em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
```

### Etapes

1. **Charger les skills pertinents**
   ```bash
   /security
   /solid-principles
   ```

2. **Code review avec Technology Reviewer**
   ```bash
   @symfony-reviewer "Revois ce PaymentController"
   ```

3. **Audit securite**
   ```bash
   /symfony:check-security
   ```

4. **Tests manquants avec TDD Coach**
   ```bash
   /testing
   @tdd-coach "Propose les tests necessaires pour PaymentController"
   ```

5. **Proposition de refactoring**
   ```bash
   @refactoring-specialist "Refactore ce controller en appliquant Clean Architecture"
   ```

6. **Diagnostic Docker**
   ```bash
   @docker-debug "Le container Stripe webhook ne recoit pas les events en local"
   ```

7. **Validation finale BMAD**
   ```bash
   /gate:validate-story US-042
   ```

8. **Tests d'acceptation via navigateur**
   ```bash
   /qa:recette --scope=story --id=US-042
   ```

### Criteres de reussite

- [ ] Skills charges : /security, /solid-principles, /testing
- [ ] Issues identifiees par @symfony-reviewer
- [ ] Vulnerabilites listees par /symfony:check-security
- [ ] Tests proposes par @tdd-coach
- [ ] Code refactore par @refactoring-specialist
- [ ] Probleme Docker diagnostique par @docker-debug
- [ ] Story validee par /gate:validate-story
- [ ] Tests navigateur executes par /qa:recette

---

## Points Cles a Retenir

1. **63 agents** organises en **11 catégories** : Common (12), Technology Reviewers (10), Docker (5), Coolify (4), Kubernetes (5), OpenTofu (5), Ansible (5), Hcloud (5), PgBouncer (5), FrankenPHP (5), Project (2)
2. **Skills** = Guidelines chargees on-demand (`/skill-name`)
3. **Agents** = Experts specialises pour dialogue et actions (`@agent-name`)
4. **BMAD workflow** = /workflow:plan -> /workflow:design -> /sprint:next-story -> /workflow:implement avec quality gates
5. **BMAD roles** = Integres dans les commandes /workflow:* et /sprint:*, pas en agents autonomes
6. **Docker agents** = Architecture, Compose, Debug, CI/CD, Dockerfile
7. **YAML frontmatter** = Configuration declarative des agents (name, model, tools, skills, effort, maxTurns)
8. **Combinaison** = Skills + Agents + BMAD + Docker pour workflow complet

---

**Duree estimee :** 1h30
**Prochain module :** Outils Avances et Productivite
