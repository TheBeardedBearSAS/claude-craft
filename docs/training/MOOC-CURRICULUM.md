# MOOC Curriculum — AI-First Development with Claude Craft

**Version** : 1.0.0
**Durée totale** : 26h (18h cours + 8h projet final)
**Niveau** : Intermédiaire (développeurs avec 2+ ans d'expérience)
**Langues** : EN (primaire), FR (secondaire)
**Plateformes cibles** : Coursera, edX, Udemy

---

## Vue d'ensemble

Cette formation certifiante enseigne le développement piloté par IA (AI-First Development) avec Claude Craft, un framework méthodologique pour Claude Code. Les participants apprennent à orchestrer des équipes d'agents IA, automatiser le TDD/BDD, appliquer Clean Architecture avec DDD, et livrer du code production-ready avec une couverture ≥80%.

**Prérequis** :
- Maîtrise d'un langage (PHP, Python, JS/TS, Dart, C#)
- Connaissance Git + CI/CD
- Expérience architecture MVC/Clean minimale
- Claude Code v2.1.90+ installé

---

## Module 1 — Introduction AI-First Development (2h)

### Objectifs pédagogiques

- Comprendre les principes Karpathy (state assumptions, minimal code, surface confusion)
- Installer Claude Craft et configurer son premier projet
- Maîtriser la gestion du contexte (CLAUDE.md < 200 lignes, rules modulaires)

### Contenu

1. **Théorie AI-First** (30min)
   - Software 2.0 : modèle génératif > code manuel
   - Les 3 principes Karpathy : state assumptions explicitly, minimal code (no speculation), surface confusion
   - Workflow optimal : 80% code généré, 20% review humaine

2. **Installation et Setup** (45min)
   - Installation CLI : `npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en`
   - Structure `.claude/` : CLAUDE.md, rules/, skills/, agents/
   - Configuration hooks et RTK pour optimisation tokens (-60%)

3. **Gestion du contexte** (45min)
   - Règle d'or : CLAUDE.md < 200 lignes
   - Rules modulaires dans `.claude/rules/`
   - Sous-agents (Task) pour investigations

### Lab pratique

- Setup Claude Craft sur un projet existant
- Écrire un CLAUDE.md conforme (< 200 lignes)
- Exécuter `/workflow:init` et analyser la sortie

---

## Module 2 — TDD/BDD avec AI Agents (4h)

### Objectifs pédagogiques

- Appliquer Red/Green/Refactor en mode AI-assisted
- Utiliser l'agent `@tdd-coach` pour guider l'implémentation
- Rédiger des tests Gherkin pour BDD

### Contenu

1. **TDD Red/Green/Refactor** (1h30)
   - Écrire un test qui échoue (RED)
   - Code minimal pour passer le test (GREEN)
   - Refactorer sans casser les tests (REFACTOR)
   - Pattern : test first, code second, cleanup third

2. **BDD Given/When/Then** (1h30)
   - Format Gherkin : Feature / Scenario / Given-When-Then
   - Outils : Behat (PHP), Cucumber (JS), Behave (Python)
   - Déléguer à l'agent `@tdd-coach` la rédaction des tests

3. **Mutation Testing** (1h)
   - Coverage > 80% ne garantit pas la qualité
   - Mutation testing avec Stryker (JS), Infection (PHP), Mutmut (Python)
   - Fixer les mutants survivants

### Lab pratique

- Implémenter une fonctionnalité CRUD en TDD avec `@tdd-coach`
- Atteindre 85% de couverture
- Lancer mutation testing et corriger 3 mutants

---

## Module 3 — Clean Architecture + DDD (4h)

### Objectifs pédagogiques

- Appliquer les principes SOLID dans un contexte AI-assisted
- Structurer le code en couches (Presentation, Application, Domain, Infrastructure)
- Modéliser avec DDD : Aggregates, Value Objects, Domain Events

### Contenu

1. **Principes SOLID** (1h30)
   - SRP : 1 classe = 1 responsabilité
   - OCP : extension > modification
   - LSP : sous-types substituables
   - ISP : interfaces ≤5 méthodes
   - DIP : dépendre d'abstractions

2. **Clean Architecture** (1h30)
   - 4 couches : Presentation → Application → Domain ← Infrastructure
   - DIP : Domain au centre, zéro dépendance externe
   - Utiliser `@architect` pour valider la structure

3. **DDD Tactical Patterns** (1h)
   - Aggregates : racine + entités
   - Value Objects : immutables, validation
   - Domain Events : communication inter-agregats

### Lab pratique

- Refactorer un projet legacy vers Clean Architecture avec `@refactoring-specialist`
- Modéliser 2 Aggregates et 3 Value Objects
- Valider avec `/workflow:analyze` et `@architect`

---

## Module 4 — Agent Teams & Orchestration (3h)

### Objectifs pédagogiques

- Orchestrer plusieurs agents en parallèle
- Utiliser `/team:audit` pour déléguer à une équipe d'agents
- Configurer Ralph pour les loops de tâches récurrentes

### Contenu

1. **Agents spécialisés** (1h)
   - 67 agents disponibles : API, DB, DevOps, Security, TDD, UX
   - Comment invoquer : `@agent-name prompt`
   - Frontmatter : `effort`, `maxTurns`, `disallowedTools`

2. **Team Workflows** (1h)
   - `/team:audit --sequential` : équipe d'audit code
   - `/team:sprint` : équipe pour sprint planning
   - Parallel worktrees : `git worktree` pour sessions concurrentes

3. **Ralph — Loops & DoD** (1h)
   - `/common:ralph-run "task"` : loop jusqu'à DoD validé
   - 5 validators : `command`, `output_contains`, `file_changed`, `hook`, `human`
   - Exemple : "Déployer en staging et attendre health check OK"

### Lab pratique

- Lancer `/team:audit --sequential` sur un projet
- Configurer Ralph pour une tâche récurrente (migration DB)
- Créer un worktree pour une feature parallèle

---

## Module 5 — QA Recette & Continuous Testing (3h)

### Objectifs pédagogiques

- Automatiser les tests d'acceptance avec QA Recette (Chrome automation)
- Implémenter la règle "un bug fixé ne doit jamais réapparaître"
- Intégrer QA Recette dans la CI/CD

### Contenu

1. **QA Recette — Automation Chrome** (1h30)
   - Extension Chrome + Claude Code v2.1.36+
   - `/qa:recette --scope=story --id=US-001`
   - Format test : Given-When-Then avec screenshots

2. **Regression Testing** (1h)
   - Règle d'or : 1 bug fixé = 1 test de régression
   - `/qa:fix` : détecter + fixer + tester
   - Intégration CI : tests recette dans pipeline GitHub Actions

3. **TDD + Recette** (30min)
   - Workflow : `/qa:tdd` → implémentation → `/qa:recette`
   - Métriques : coverage ≥80%, mutation score ≥70%, recette 100% passée

### Lab pratique

- Écrire 3 scénarios recette pour un workflow utilisateur
- Fixer un bug avec `/qa:fix` et vérifier la non-régression
- Intégrer les tests recette dans GitHub Actions

---

## Module 6 — Production & DevOps (2h)

### Objectifs pédagogiques

- Configurer Docker et Docker Compose avec `@devops-engineer`
- Déployer sur Coolify (alternative Vercel/Heroku)
- Monitorer avec Observability (logs, metrics, traces)

### Contenu

1. **Docker & Infra as Code** (1h)
   - Hadolint : linter Dockerfile
   - Multi-stage builds : builder + runner
   - `@devops-engineer` pour générer Dockerfile + docker-compose.yml

2. **Déploiement Coolify** (45min)
   - Self-hosted PaaS : Coolify v4.0.0-beta.470+
   - Git push → auto-deploy
   - Zero-downtime avec health checks

3. **Observability** (15min)
   - Logs structurés (JSON)
   - Metrics Prometheus + Grafana
   - Traces OpenTelemetry

### Lab pratique

- Générer un Dockerfile optimisé avec `@devops-engineer`
- Déployer sur Coolify (staging)
- Configurer Grafana dashboard pour métriques clés

---

## Examen final — Projet intégré (8h)

### Description

Implémenter une API REST "Order Management" avec les contraintes suivantes :

- **Stack** : au choix (PHP/Symfony, Python/FastAPI, JS/Express)
- **Fonctionnalités** :
  - CRUD Orders (create, read, update, delete, list avec pagination)
  - Authentification JWT
  - Validation métier : total > 0, items ≥1
  - Async : envoi email de confirmation (queue)
- **Contraintes qualité** :
  - TDD : ≥80% coverage, mutation score ≥70%
  - Clean Architecture : 4 couches respectées
  - Tests recette : 5 scénarios utilisateur automatisés
  - Docker : Dockerfile multi-stage + docker-compose.yml
  - CI/CD : GitHub Actions avec tests + deploy staging
- **Livrables** :
  - Repo GitHub public avec README
  - 3 commits minimum (TDD + implémentation + recette)
  - Video démo 5min (Loom ou équivalent)

### Critères d'évaluation

| Critère | Points | Pondération |
|---------|--------|-------------|
| **Fonctionnalités** (CRUD + Auth + Queue) | /40 | 40% |
| **Qualité code** (SOLID, Clean Arch, coverage ≥80%) | /30 | 30% |
| **Tests** (TDD, mutation ≥70%, recette 5 scénarios) | /20 | 20% |
| **DevOps** (Docker, CI/CD, deploy staging) | /10 | 10% |

**Seuil de réussite** : 70/100

---

## Certifications

### Claude Craft Practitioner

**Modules requis** : 1-3 (10h)
**Examen** : QCM 30 questions (seuil 70%)
**Badge** : Credly digital badge "Claude Craft Practitioner"

### Claude Craft Expert

**Modules requis** : 1-7 (26h)
**Examen** : Projet final (seuil 70/100)
**Badge** : Credly digital badge "Claude Craft Expert"

---

## Partenariats cibles

| Plateforme | Statut | Pricing | Audience |
|------------|--------|---------|----------|
| **Coursera** | Proposition draft | $49/mois abonnement | Universités |
| **edX** | Proposition draft | $199 certification | Professionnels |
| **Udemy** | À contacter | $99 one-time | Autodidactes |

---

## Métriques de succès

| Métrique | Cible Année 1 | Cible Année 2 |
|----------|---------------|---------------|
| Inscrits | 500 | 2000 |
| Certifiés Practitioner | 200 | 800 |
| Certifiés Expert | 50 | 200 |
| Taux complétion | 40% | 50% |
| Note satisfaction | 4.2/5 | 4.5/5 |

---

**Auteur** : The Bearded CTO
**Date de création** : 2026-04-17
**Dernière mise à jour** : 2026-04-17
