---
name: workflow-design
description: "Exécuter la phase de Conception (Solutioning) - générer la spécification technique (défaut) ou la constitution du projet (--constitution)"
argument-hint: "[--constitution] [--continue]"
arguments:
  - name: constitution
    description: Générer la constitution du projet (project-management/constitution.md) au lieu de la spec technique
    required: false
  - name: continue
    description: Reprendre là où on s'est arrêté
    required: false
---

# /workflow:design

## Mission

Exécuter la phase de Conception (Solutioning) : transformer le PRD en spécification technique, diagrammes d'architecture, modèle de données, conception d'API et ADR. Avec `--constitution`, consigner à la place les décisions immuables du projet dans une Constitution de projet.

## Usage

| Invocation | Action | Remplace |
|------------|--------|----------|
| `/workflow:design` | Lit `project-management/prd.md`, écrit `project-management/tech-spec.md` + fichiers d'architecture + ADR | `/workflow:design` |
| `/workflow:design --constitution` | Écrit `project-management/constitution.md` (décisions immuables, utilisée par `/gate:check alignment`) | `/workflow:design --constitution` |
| `/workflow:design --continue` | Reprend une session de conception interrompue | - |

Ordre canonique des documents : PRD → spec technique → backlog → sprint.

## Quand utiliser

- Tracks **Standard** et **Enterprise**
- Après `/workflow:plan --only=prd`
- `--constitution` : au démarrage du projet (ou dès que des décisions doivent être verrouillées)

## Prérequis

- Le PRD existe dans `project-management/prd.md` (`--constitution` : uniquement des sources optionnelles, voir ci-dessous)
- Stack technique identifiée (demandée de façon interactive pour un nouveau projet)

## Plan Mode

> **Le plan mode est obligatoire.** Claude active le plan mode pour analyser le code impacté, proposer une stratégie de génération et attendre votre validation avant de créer des artefacts.

## Workflow : Spec technique (défaut)

### Étape 1 : Analyse du PRD

```
╔══════════════════════════════════════════════════════════╗
║           PHASE DE CONCEPTION - DÉMARRAGE                 ║
║ Track : Standard | Phase : 3 sur 4 - Design (Solutioning) ║
║ Chargement de project-management/prd.md ...               ║
║ ├── Exigences fonctionnelles : 12                         ║
║ ├── Exigences non fonctionnelles : 8                      ║
║ └── Intégrations requises : 2                             ║
╚══════════════════════════════════════════════════════════╝
```

Extraire du PRD : exigences fonctionnelles (`FR-xxx`), exigences non fonctionnelles (performance, sécurité, scalabilité), personas et parcours, contraintes et hypothèses, intégrations. Si `project-management/analysis/constraints.md` existe (Enterprise), le charger aussi.

### Étape 2 : Analyse de la codebase

Codebase existante : détecter la stack (backend, frontend, base de données, cache, infrastructure) et les patterns existants (architecture, style d'API, auth, tests) et rester cohérent avec eux.

Nouveau projet : poser les questions technologiques.

```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Stack technique                              │
├─────────────────────────────────────────────────────────┤
│ 1. Framework backend préféré ? (Symfony/Laravel/Node)    │
│ 2. Framework frontend ? (React/Vue/Angular/Aucun)        │
│ 3. Base de données préférée ? (PostgreSQL/MySQL/MongoDB) │
│ 4. Cible de déploiement ? (Docker/K8s/Serverless/VPS)    │
│ 5. Des intégrations existantes à prendre en compte ?     │
└─────────────────────────────────────────────────────────┘
```

### Étape 3 : Questions d'architecture

```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Décisions d'architecture                     │
├─────────────────────────────────────────────────────────┤
│ 1. Monolithe ou microservices ?                          │
│ 2. Style d'API préféré ? (REST/GraphQL/gRPC)             │
│ 3. Échelle attendue ? (utilisateurs, requêtes/s)         │
│ 4. Fonctionnalités temps réel ? (WebSockets/SSE)         │
│ 5. Besoins de stockage de fichiers ? (S3/local/CDN)      │
│ 6. Besoins de traitement de jobs en arrière-plan ?       │
│ 7. Intégrations tierces ? (paiement, e-mail, etc.)       │
└─────────────────────────────────────────────────────────┘
```

### Étape 4 : Tâches de conception

Exécuter dans l'ordre :

| # | Tâche | Sortie |
|---|-------|--------|
| 1 | Spec technique (template `.claude/templates/project/tech-spec.md`) | `project-management/tech-spec.md` |
| 2 | Diagrammes C4 (contexte, conteneur, composant) | `project-management/architecture/c4-*.md` |
| 3 | Modèle de données : ERD (Mermaid `erDiagram`) + schémas ; valider les relations, les entités manquantes, l'indexation | `project-management/architecture/erd.md` |
| 4 | Conception d'API : endpoints dérivés des FR-xxx et des personas, payloads, erreurs, auth | `project-management/architecture/api.md` |
| 5 | Sécurité et performance : mitigations OWASP, authN/authZ, chiffrement, rate limiting, écarts RGPD | `project-management/architecture/security.md` |
| 6 | ADR pour les décisions clés (base de données, style d'API, authentification) | `docs/adr/ADR-00x-*.md` |
| 7 | Stratégie de tests (cible de couverture 80 %), CI/CD et déploiement, monitoring | dans `tech-spec.md` |

Exemple de checklist sécurité :

```
✅ Authentification : JWT avec cookies HttpOnly
✅ Autorisation : RBAC avec policies
✅ Chiffrement des données : AES-256 au repos, TLS 1.3 en transit
✅ Validation des entrées : validation DTO + sanitisation
✅ Rate limiting : 100 req/min par utilisateur
⚠️  Conformité RGPD : politique de rétention des données à définir
```

### Étape 5 : Gate de revue de conception

- La spec technique couvre toutes les exigences du PRD (chaque `FR-xxx` est traçable)
- L'architecture supporte les NFR (performance, sécurité)
- Le modèle de données gère toutes les entités ; la conception d'API couvre toutes les user stories
- Sécurité, stratégie de tests et approche de déploiement documentées
- ADR complets et justifiés

Proposer des itérations : stratégie de cache, documentation d'API détaillée, pipeline de déploiement.

### Étape 6 : Finalisation

```
╔══════════════════════════════════════════════════════════╗
║           PHASE DE CONCEPTION TERMINÉE                    ║
║ ✅ project-management/tech-spec.md                        ║
║ ✅ project-management/architecture/ (c4, erd, api, sec.)  ║
║ ✅ docs/adr/ (3 ADR)                                      ║
║ • 24 endpoints d'API • 8 entités • 3 intégrations         ║
║                                                           ║
║ SUIVANT : /workflow:plan --only=backlog                   ║
║ PUIS : /workflow:start 1                                  ║
╚══════════════════════════════════════════════════════════╝
```

Le backlog lit `project-management/prd.md` et, une fois créée, `project-management/tech-spec.md`. Après la conception, recommander `/workflow:plan --only=backlog` puis `/workflow:start 1`.

## Workflow : Constitution (`--constitution`)

### Phase 1 : Découverte du contexte

Analyse automatique de : `README.md`, `project-management/prd.md`, `project-management/tech-spec.md`, structure de la codebase (patterns, conventions) et configuration `.claude/`. Lister les sources trouvées.

### Phase 2 : Clarification interactive

Interroger l'utilisateur, par thème, pour combler les lacunes :

| Thème | Questions |
|-------|-----------|
| Vision & Mission | Vision en une phrase ; quoi, pour qui, pourquoi ; objectifs non négociables ; ce qui ferait échouer le projet |
| Contraintes techniques | Technologies verrouillées ; pattern d'architecture obligatoire ; contraintes d'infrastructure ; intégrations tierces obligatoires |
| Principes de conception | Patterns obligatoires ; patterns/pratiques interdits ; standards de code ; stratégie de tests requise |
| Exigences non fonctionnelles | Objectifs de performance (latence, charge) ; sécurité ; conformité (RGPD, SOC2) ; disponibilité/uptime |
| Périmètre | Hors périmètre ; systèmes externes ; frontières d'équipe et responsabilités ; qui peut amender la constitution |

### Phase 3 : Génération

1. Charger le template `.claude/templates/project/constitution.md`
2. Renseigner la vision, la mission et les objectifs non négociables
3. Verrouiller la stack technique (technologies et versions)
4. Consigner les patterns obligatoires et interdits
5. Enregistrer les objectifs de performance, de sécurité et de conformité
6. Documenter les exclusions, les frontières d'intégration et le processus d'amendement

### Phase 4 : Revue et ratification

Sortie : `project-management/constitution.md` avec les sections Vision & Mission, Contraintes techniques, Principes de conception, Exigences non fonctionnelles, Périmètre, Processus d'amendement. Proposer d'ajuster les décisions verrouillées, d'ajouter des contraintes ou d'affiner le périmètre. Les notes de découverte optionnelles vont dans `project-management/analysis/discovery-notes.md`.

La constitution est la référence utilisée par `/gate:check alignment`. Étapes suivantes : `/workflow:plan --only=prd` s'il n'y a pas encore de PRD, sinon lancer le `/workflow:design` par défaut.

## Agents impliqués

- **tech-lead** : conception technique globale et création des ADR
- **api-designer** : conception d'API REST/GraphQL
- **database-architect** : modèle de données et conception du schéma
- **ui-designer** : architecture frontend (le cas échéant)
- **devops-engineer** : conception du déploiement et de l'infrastructure

## Fichiers de sortie

| Fichier | Rôle |
|---------|------|
| `project-management/tech-spec.md` | Spécification technique complète |
| `project-management/constitution.md` | Constitution du projet (`--constitution`) |
| `project-management/architecture/c4-*.md` | Diagrammes d'architecture C4 |
| `project-management/architecture/erd.md` | Diagramme entité-relation |
| `project-management/architecture/api.md` | Documentation des endpoints d'API |
| `project-management/architecture/security.md` | Conception de la sécurité |
| `docs/adr/*.md` | Architecture Decision Records |

## Exemple de session

```
User: /workflow:design

Claude: Chargement de project-management/prd.md : 12 FR, 8 NFR.
Détecté : Symfony + React + PostgreSQL.
❓ L'API actuelle est REST. Garder REST ou migrer vers GraphQL ?
> Garder REST
[... Q&R interactives ...]
✅ Spec technique générée : project-management/tech-spec.md
Suivant : /workflow:plan --only=backlog, puis /workflow:start 1
```

## Commandes associées

- `/workflow:plan` - Phase précédente (`--only=prd`, `--only=backlog`)
- `/workflow:start` - Démarrer le premier sprint
- `/workflow:implement` - Phase d'implémentation
- `/workflow:status` - Vérifier la progression
- `/gate:check` - Quality gates (`alignment` utilise la constitution)
- `/common:architecture-decision` - Créer des ADR individuels
