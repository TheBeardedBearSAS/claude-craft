# Guide de Gestion du Backlog

Workflow complet pour créer et gérer un backlog SCRUM avec Bear-Craft.

---

## Vue d'ensemble

Bear-Craft fournit un ensemble complet de commandes pour gérer votre product backlog selon la méthodologie SCRUM :

- **Une commande `/bear-project:backlog`** (`add`, `list`, `edit`, `move`, plus `next story` et `move story --auto` pour le routage des stories) ainsi que `/bear-workflow:plan --only=backlog`, `/bear-workflow:start`, `/bear-workflow:status --board`, `/bear-project:reverse`, `/bear-project:trace`, `/bear-project:report` et `/bear-project:migrate` pour le backlog et la gestion de projet ; les anciennes commandes par entité (add-*, list-*, update-*, move-task, generate-backlog, decompose-tasks, board) et le namespace sprint ont été retirées en 9.0 (voir MIGRATION-v9)
- **Le chemin `/workflow:`** (`init`, `plan`, `design`, `start`, `implement`, `review`, `retro`, `status`) pour le cycle de sprint 
- **Une commande `/bear-gate:check`** (`prd`, `spec`, `backlog`, `sprint`, `story`, `alignment`, `all`, `commit`, `merge`, `release`) pour la validation qualité
- **Vertical slicing** obligatoire sur toutes les couches tech
- **Validation INVEST** pour les User Stories

### Philosophie

Basé sur :
- Les principes du Manifeste Agile
- Les 12 Principes Agile
- Les fondamentaux SCRUM
- Le vertical slicing (chaque US traverse toutes les couches)

---

## Génération Initiale du Backlog

### Depuis les Spécifications

Placez vos spécifications projet dans `./docs/` puis exécutez :

```bash
/bear-workflow:plan --only=backlog symfony+flutter
```

### Structure Générée

```
project-management/
├── README.md                    # Vue d'ensemble du projet
├── personas.md                  # Personas utilisateurs (min. 3)
├── definition-of-done.md        # Niveaux DoD progressifs
├── dependencies-matrix.md       # Dépendances Epic et US
├── backlog/
│   ├── epics/                   # Fichiers EPIC-XXX-nom.md
│   └── user-stories/            # Fichiers US-XXX-nom.md
└── sprints/
    └── sprint-XXX-objectif/     # Plans de sprint
```

---

## Structure SCRUM

### Personas

Minimum 3 personas requis, chacun avec :
- **Identité** : Nom, rôle, démographiques
- **Objectifs** : Ce qu'ils veulent accomplir
- **Frustrations** : Points de douleur à résoudre

Format : `P-001`, `P-002`, `P-003`...

### EPICs

Grandes fonctionnalités contenant plusieurs User Stories :

| Champ | Description |
|-------|-------------|
| ID | Identifiant unique (EPIC-001, EPIC-002...) |
| MMF | Minimum Marketable Feature |
| Statut | Draft, Ready, In Progress, Done |
| Objectifs Business | Pourquoi cet EPIC est important |
| Critères de Succès | Comment mesurer le succès |

### User Stories

Suivent le modèle **INVEST** :

| Lettre | Signification | Validation |
|--------|---------------|------------|
| **I** | Independent | Pas de dépendances avec d'autres US |
| **N** | Négociable | Les détails peuvent être discutés |
| **V** | Valuable | Apporte de la valeur utilisateur |
| **E** | Estimable | Peut être dimensionnée en points |
| **S** | Sized | Max 8 story points |
| **T** | Testable | A des critères d'acceptation clairs |

#### Les 3 Cs

1. **Card** : Description breve
2. **Conversation** : Détails de discussion
3. **Confirmation** : Critères d'acceptation

#### Critères d'Acceptation (Gherkin)

Chaque US requiert :
- 1 scenario nominal (happy path)
- 2 scenarios alternatifs
- 2 scenarios d'erreur

```gherkin
Scenario: L'utilisateur se connecte avec succès
  Given un utilisateur enregistré avec des identifiants valides
  When il soumet le formulaire de connexion
  Then il devrait voir son tableau de bord
  And une session devrait être créée
```

### Tasks (Tâches)

Éléments de travail technique dans une User Story :

| Type | Description | Durée Typique |
|------|-------------|---------------|
| `[DB]` | Base de données (entités, migrations) | 1-3h |
| `[BE]` | Backend (services, APIs) | 2-4h |
| `[FE-WEB]` | Frontend Web (contrôleurs, templates) | 2-4h |
| `[FE-MOB]` | Frontend Mobile (écrans, blocs) | 3-5h |
| `[TEST]` | Tests (unitaires, intégration, E2E) | 2-4h |
| `[DOC]` | Documentation | 0.5-1h |
| `[OPS]` | DevOps (CI/CD, déploiement) | 1-2h |
| `[REV]` | Revue de code | 1-2h |

**Règles d'estimation :**
- Durée de tâche : 0.5h - 8h max
- Story points (Fibonacci) : 1, 2, 3, 5, 8, 13, 21
- Taille max US : 8 points (découper si plus)

---

## Workflow

### Flux de Statuts

```
┌─────────┐     ┌─────────────┐     ┌──────┐
│  To Do  │ ──→ │ In Progress │ ──→ │ Done │
└─────────┘     └─────────────┘     └──────┘
     │                │
     │                ↓
     └────────→ ┌─────────┐
                │ Blocked │
                └─────────┘
                     │
                     ↓
              ┌─────────────┐
              │ In Progress │
              └─────────────┘
```

**Transitions interdites :**
- To Do → Done (doit passer par In Progress)
- Any → To Do (sauf réouverture manuelle)

---

## Référence des Commandes

### Commandes de Création

| Commande | Description |
|----------|-------------|
| `/bear-workflow:plan --only=backlog [stack]` | Générer le backlog complet depuis les specs |
| `/bear-project:backlog add epic` | Créer un nouvel EPIC |
| `/bear-project:backlog add story` | Ajouter une User Story à un EPIC |
| `/bear-project:backlog add task` | Créer une tâche technique pour une US |

### Commandes de Visualisation

| Commande | Description |
|----------|-------------|
| `/bear-project:backlog list epic` | Afficher tous les EPICs avec statut |
| `/bear-project:backlog list story [filtre]` | Lister les User Stories (par EPIC, Sprint, Statut) |
| `/bear-project:backlog list task [filtre]` | Lister les tâches (par US, Sprint, Type, Statut) |
| `/bear-workflow:status --board [sprint]` | Afficher le tableau Kanban |
| `/bear-workflow:status [sprint]` | Rapport détaillé de progression du sprint |

### Commandes de Mise à Jour

| Commande | Description |
|----------|-------------|
| `/bear-project:backlog move story [id] [statut/sprint]` | Changer le statut de l'US ou assigner au sprint |
| `/bear-project:backlog move task [id] [statut]` | Changer le statut de la tâche |
| `/bear-project:backlog edit epic [id]` | Modifier un EPIC existant |
| `/bear-project:backlog edit story [id]` | Modifier une User Story existante |

### Commandes Avancées

| Commande | Description |
|----------|-------------|
| `/bear-workflow:start [sprint]` | Décomposer les US du sprint en tâches |
| `/bear-gate:check backlog` | Auditer la qualité du backlog (conformite SCRUM) |

---

## Exemple Complet : Nouveau Projet

### Étape 1 : Générer le Backlog Initial

```bash
# S'assurer que les specs sont dans ./docs/
/bear-workflow:plan --only=backlog symfony+flutter
```

### Étape 2 : Valider la Qualité

```bash
/bear-gate:check backlog
```

Cela génère `scrum-validation-report.md` avec :
- Score de conformité INVEST
- Vérification des 3 Cs
- Analyse des critères SMART
- Cohérence des estimations

### Étape 3 : Examiner le Sprint 1

```bash
/bear-workflow:status --board 1
```

Affiche le tableau Kanban avec les colonnes :
- To Do | In Progress | In Review | Done | Blocked

> On peut aussi gérer le backlog depuis l'interface web Kanban (`npx @the-bearded-bear/bear-craft kanban`) : créer, modifier et supprimer des stories, les planifier dans un sprint, créer, démarrer et clôturer des sprints. Elle complète les commandes `/bear-workflow:*` et `/bear-project:*`, qui restent valables et écrivent le même fichier (`.bmad/sprint-status.yaml`).

### Étape 4 : Décomposer en Tâches

```bash
/bear-workflow:start 1
```

Crée une décomposition détaillée des tâches :
- Tâches groupées par US
- Graphe de dépendances (Mermaid)
- Estimations de temps par couche

### Étape 5 : Commencer le Travail

```bash
# Déplacer la première tâche en cours
/bear-project:backlog move task TASK-001 in-progress

# Plus tard, marquer comme terminée
/bear-project:backlog move task TASK-001 done

# Si bloquée
/bear-project:backlog move task TASK-002 blocked "En attente des specs API"
```

### Étape 6 : Suivre la Progression

```bash
/bear-workflow:status 1
```

Affiche :
- Progression globale et burndown
- Métriques par User Story
- Bloqueurs et risques
- Actions recommandees

---

## Templates

Bear-Craft fournit 5 templates pour une structure de backlog cohérente :

| Template | Objectif |
|----------|----------|
| `epic.md` | Structure de fichier EPIC avec métadonnées, objectifs, liste US |
| `user-story.md` | Structure US avec criteres Gherkin, tableau de tâches |
| `task.md` | Structure de tâche avec checklist DoD |
| `board.md` | Tableau Kanban avec calcul de métriques |
| `index.md` | Index du backlog avec résumé global |

---

## Règles SCRUM Appliquées

| Règle | Valeur |
|-------|--------|
| Durée du sprint | 2 semaines (fixe) |
| Vélocité | 20-40 points/sprint |
| Taille max US | 8 points (découper si plus) |
| Échelle d'estimation | Fibonacci (1, 2, 3, 5, 8, 13, 21) |
| Durée des tâches | 0.5h - 8h max |

### Sprint 1 : Walking Skeleton

Le premier sprint doit inclure :
- Setup complet de l'infrastructure
- 1 fonctionnalité de bout en bout (pas juste du setup)
- Testable sur Web et Mobile

### Vertical Slicing

**Chaque User Story DOIT traverser toutes les couches :**

```
UI (Web/Mobile) → API → Logique Métier → Base de Données
```

Pas de User Stories "Backend uniquement", "Frontend uniquement" ou "Mobile uniquement" autorisées.

---

## Checklist : Backlog Prêt

- [ ] Minimum 3 personas définis
- [ ] EPICs ont MMF et critères de succès
- [ ] User Stories suivent le modele INVEST
- [ ] Critères d'acceptation au format Gherkin
- [ ] Stories estimées en points Fibonacci
- [ ] Sprint 1 = Walking Skeleton
- [ ] Definition of Done documentée
- [ ] Backlog validé (`/bear-gate:check backlog`)

---

[&larr; Résolution de Problèmes](06-troubleshooting.md) | [Suivant : Installation Nouveau Projet &rarr;](08-setup-new-project.md)
