---
name: workflow-design
description: "Exécuter la phase de Conception (Solutioning) - spécification technique et architecture"
arguments:
  - name: continue
    description: Reprendre là où on s'est arrêté
    required: false
---

# /workflow:design

## Mission

Exécuter la phase de Conception (Solutioning) du workflow de développement. Cette phase se concentre sur la création de la Spécification Technique, la conception de l'architecture et la documentation des décisions techniques clés.

## Quand utiliser

- Tracks **Standard** et **Enterprise**
- Après la complétion de `/workflow:plan`
- Quand le PRD et le backlog sont prêts

## Prérequis

- Le PRD existe dans `project-management/prd.md`
- Le backlog existe dans `project-management/backlog/`

## Mode Plan

> **Le mode plan est recommandé.** Claude active le mode plan pour structurer l'approche, identifier les dépendances et présenter une stratégie de génération avant de créer les artefacts.

## Workflow

### Étape 1 : Mise en place de la conception

```
╔══════════════════════════════════════════════════════════╗
║              PHASE DE CONCEPTION - DÉMARRAGE              ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 3 sur 4 - Conception (Solutioning)                 ║
║                                                           ║
║ Objectifs :                                               ║
║ • Créer la Spécification Technique à partir du PRD        ║
║ • Concevoir l'architecture système (diagrammes C4)        ║
║ • Définir le modèle de données et la conception API       ║
║ • Documenter les Architecture Decision Records (ADR)      ║
║ • Planifier la stratégie de test                          ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 2 : Chargement des artefacts de planification

```
╔══════════════════════════════════════════════════════════╗
║              CHARGEMENT DES ARTEFACTS DE PLANIFICATION    ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Analyse du PRD :                                         ║
║ ├── ✅ prd.md chargé                                     ║
║ ├── Exigences fonctionnelles : 12                         ║
║ ├── Exigences non fonctionnelles : 8                      ║
║ └── Intégrations requises : 2                             ║
║                                                           ║
║ Résumé du backlog :                                      ║
║ ├── ✅ backlog/ chargé                                   ║
║ ├── EPICs : 4                                            ║
║ ├── User Stories : 18                                     ║
║ └── Story Points totaux : 89                              ║
║                                                           ║
║ Contraintes (si Enterprise) :                             ║
║ └── ✅ analysis/constraints.md chargé                    ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 3 : Tâches de conception

Exécuter les tâches de conception dans l'ordre :

```
╔══════════════════════════════════════════════════════════╗
║                 TÂCHES DE CONCEPTION                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Tâche 1 : Générer la Spécification Technique           ║
║   Commande : /project:generate-tech-spec                  ║
║   Résultat : project-management/tech-spec.md              ║
║                                                           ║
║ □ Tâche 2 : Conception de l'architecture                  ║
║   Créer les diagrammes C4 (contexte, conteneur, composant)║
║   Résultat : project-management/architecture/             ║
║                                                           ║
║ □ Tâche 3 : Conception du modèle de données               ║
║   ERD et schéma de base de données                        ║
║   Résultat : project-management/architecture/erd.md       ║
║                                                           ║
║ □ Tâche 4 : Conception de l'API                           ║
║   Endpoints, payloads, authentification                    ║
║   Résultat : project-management/architecture/api.md       ║
║                                                           ║
║ □ Tâche 5 : Créer les ADR                                 ║
║   Documenter les décisions techniques clés                ║
║   Résultat : docs/adr/                                    ║
║                                                           ║
║ □ Tâche 6 : Revue de sécurité                             ║
║   Checklist OWASP, stratégie d'authentification           ║
║   Résultat : project-management/architecture/security.md  ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 4 : Exécution de la génération de la Spécification Technique

```
Démarrage de /project:generate-tech-spec...

Analyse des exigences du PRD...
Détection des patterns du codebase existant...

[Le workflow de génération de la Spécification Technique s'exécute avec Q&R interactif]

✅ Spécification Technique créée : project-management/tech-spec.md
```

### Étape 5 : Diagrammes d'architecture

Générer les diagrammes d'architecture C4 :

```
╔══════════════════════════════════════════════════════════╗
║             DIAGRAMMES D'ARCHITECTURE                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ C4 Niveau 1 - Contexte système :                         ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │     [Utilisateur] ──► [Notre Système] ──► [Stripe]  │  ║
║ │                            │                        │  ║
║ │                            ▼                        │  ║
║ │                       [SendGrid]                    │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ C4 Niveau 2 - Conteneur :                                ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │  [React SPA] ──► [Symfony API] ──► [PostgreSQL]    │  ║
║ │                       │                             │  ║
║ │                       ▼                             │  ║
║ │                    [Redis]                          │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Fichiers créés :                                         ║
║ ├── architecture/c4-context.md                            ║
║ ├── architecture/c4-container.md                          ║
║ └── architecture/c4-component.md                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 6 : Création des ADR

Documenter les décisions architecturales clés :

```
╔══════════════════════════════════════════════════════════╗
║        ARCHITECTURE DECISION RECORDS (ADR)                ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ ADR créés :                                              ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-001 : Choix de la base de données               │  ║
║ │ Décision : PostgreSQL                               │  ║
║ │ Justification : Conformité ACID, support JSON,      │  ║
║ │ existant                                            │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-002 : Style d'API                               │  ║
║ │ Décision : REST avec JSON:API                       │  ║
║ │ Justification : Expertise de l'équipe, cache,       │  ║
║ │ simplicité                                          │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-003 : Authentification                          │  ║
║ │ Décision : JWT avec refresh tokens                  │  ║
║ │ Justification : Stateless, adapté au mobile,        │  ║
║ │ standard                                            │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Fichiers : docs/adr/ADR-001.md, ADR-002.md, ADR-003.md  ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 7 : Porte de revue de conception

```
╔══════════════════════════════════════════════════════════╗
║              PORTE DE REVUE DE CONCEPTION                 ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Checklist :                                              ║
║ ✅ La Spécification Technique couvre toutes les exigences ║
║    du PRD                                                ║
║ ✅ L'architecture supporte les NFR (performance, sécurité)║
║ ✅ Le modèle de données gère toutes les entités          ║
║ ✅ La conception API couvre toutes les user stories       ║
║ ✅ Les considérations de sécurité sont documentées       ║
║ ✅ La stratégie de test est définie                       ║
║ ✅ L'approche de déploiement est documentée              ║
║                                                           ║
║ Questions de revue :                                     ║
║ 1. L'architecture est-elle appropriée pour l'échelle ?   ║
║ 2. Y a-t-il des intégrations manquantes ?                ║
║ 3. L'approche sécurité est-elle suffisante ?             ║
║ 4. Les ADR sont-ils complets et justifiés ?              ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 8 : Fin de phase

```
╔══════════════════════════════════════════════════════════╗
║              PHASE DE CONCEPTION TERMINÉE                 ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artefacts créés :                                        ║
║ ✅ tech-spec.md            Spécification Technique        ║
║ ✅ architecture/                                          ║
║    ├── c4-context.md       Diagramme de contexte système  ║
║    ├── c4-container.md     Diagramme de conteneurs        ║
║    ├── c4-component.md     Diagramme de composants        ║
║    ├── erd.md              Diagramme Entité-Relation      ║
║    ├── api.md              Conception API                  ║
║    └── security.md         Considérations de sécurité     ║
║ ✅ docs/adr/               3 Architecture Decision Records║
║                                                           ║
║ Résumé :                                                 ║
║ • 24 endpoints API conçus                                ║
║ • 8 entités de base de données définies                  ║
║ • 3 intégrations externes spécifiées                     ║
║ • Objectif de couverture de tests à 80%                  ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PHASE SUIVANTE : Implémentation                          ║
║ Commande : /workflow:implement                           ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Prêt à démarrer le développement du Sprint 1 !           ║
╚══════════════════════════════════════════════════════════╝
```

## Agents impliqués

- **tech-lead** : Conception technique globale et création des ADR
- **api-designer** : Conception d'API REST/GraphQL
- **database-architect** : Modèle de données et conception du schéma
- **ui-designer** : Architecture frontend (si applicable)
- **devops-engineer** : Conception du déploiement et de l'infrastructure

## Fichiers de sortie

| Fichier | Objectif |
|---------|----------|
| `tech-spec.md` | Spécification Technique complète |
| `architecture/c4-*.md` | Diagrammes d'architecture C4 |
| `architecture/erd.md` | Diagramme Entité-Relation |
| `architecture/api.md` | Documentation des endpoints API |
| `architecture/security.md` | Conception de la sécurité |
| `docs/adr/*.md` | Architecture Decision Records |

## Commandes associées

- `/workflow:plan` - Phase précédente
- `/workflow:implement` - Phase suivante
- `/workflow:status` - Vérifier la progression
- `/project:generate-tech-spec` - Génération directe de la spécification technique
- `/common:architecture-decision` - Créer des ADR individuels
