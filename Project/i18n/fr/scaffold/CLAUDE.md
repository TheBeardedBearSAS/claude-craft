# Configuration Claude Code - Gestion de Projet

## Agents disponibles

### 🎯 Product Owner (`@po`)
Expert en gestion de backlog, personas, User Stories et priorisation.
- Certifié CSPO (Certified Scrum Product Owner)
- Maîtrise : INVEST, 3C, Gherkin, SMART, MoSCoW, MMF

### 🔧 Tech Lead (`@tech`)
Expert en architecture, décomposition technique et facilitation Scrum.
- Certifié CSM (Certified Scrum Master)
- Maîtrise : Symfony, Flutter, API Platform, Architecture hexagonale

## Commandes personnalisées

### Génération & Gestion de Backlog (`/project:`)

| Commande | Description |
|----------|-------------|
| `/project:generate-backlog` | Génère le backlog complet |
| `/project:decompose-tasks N` | Décompose le sprint N en tâches |
| `/project:analyze-backlog` | Analyser le backlog existant |
| `/project:migrate-backlog` | Migrer un backlog existant |
| `/project:sync-backlog` | Synchroniser l'index du backlog |

### Gestion des EPICs (`/project:`)

| Commande | Description |
|----------|-------------|
| `/project:add-epic "Nom"` | Créer un nouvel EPIC |
| `/project:list-epics` | Lister tous les EPICs |
| `/project:update-epic EPIC-XXX` | Modifier un EPIC |

### Gestion des User Stories (`/project:`)

| Commande | Description |
|----------|-------------|
| `/project:add-story EPIC-XXX "Nom"` | Créer une User Story |
| `/project:list-stories` | Lister les User Stories |
| `/project:update-story US-XXX` | Modifier une US |
| `/project:update-stories` | Mettre à jour plusieurs US |

### Gestion des Tasks (`/project:`)

| Commande | Description |
|----------|-------------|
| `/project:add-task US-XXX "[TYPE] Desc" Xh` | Créer une tâche |
| `/project:list-tasks` | Lister les tâches |
| `/project:move-task TASK-XXX statut` | Changer le statut |

### Visualisation & Exécution (`/project:`)

| Commande | Description |
|----------|-------------|
| `/project:board` | Afficher le Kanban du sprint |
| `/project:batch-status` | Statut par lot des éléments |
| `/project:run-sprint N` | Exécuter un sprint complet |
| `/project:run-epic EPIC-XXX` | Exécuter un EPIC complet |
| `/project:run-queue` | Exécuter la file d'attente |
| `/project:generate-prd` | Générer le PRD |
| `/project:generate-tech-spec` | Générer la spécification technique |

### Sprint (`/sprint:`)

| Commande | Description |
|----------|-------------|
| `/sprint:status` | Métriques détaillées du sprint |
| `/sprint:transition US-XXX statut` | Changer statut/sprint d'une US |
| `/sprint:next-story` | Prochaine story prête pour le dev |
| `/sprint:auto-route` | Routage automatique des stories |
| `/sprint:dev US-XXX` | Développer une story |

### Quality Gates (`/gate:`)

| Commande | Description |
|----------|-------------|
| `/gate:validate-backlog` | Valide la conformité du backlog (score /100) |
| `/gate:validate-prd` | Valider le PRD |
| `/gate:validate-techspec` | Valider la spécification technique |
| `/gate:validate-story US-XXX` | Valider une User Story (DoD) |
| `/gate:validate-sprint N` | Valider un sprint |
| `/gate:report` | Rapport de qualité complet |

## Stack technique

```yaml
web: Symfony UX + Turbo (Twig, Stimulus, Live Components)
mobile: Flutter (Dart, Material/Cupertino)
api: API Platform (REST, OpenAPI)
database: PostgreSQL + Doctrine ORM
infrastructure: Docker
tests: PHPUnit, Flutter Test
quality: PHPStan max, Dart analyzer
```

## Structure projet

```
project-management/
├── README.md                     # Vue d'ensemble
├── personas.md                   # Définition des personas (min 3)
├── definition-of-done.md         # DoD du projet
├── dependencies-matrix.md        # Matrice des dépendances (Mermaid)
├── backlog/
│   ├── epics/
│   │   └── EPIC-XXX-nom.md       # Avec MMF
│   └── user-stories/
│       └── US-XXX-nom.md         # INVEST + 3C + Gherkin SMART
└── sprints/
    └── sprint-XXX-but/
        ├── sprint-goal.md        # Sprint Goal + Cérémonies + Rétro
        ├── sprint-dependencies.md
        ├── tasks/
        │   ├── README.md
        │   └── US-XXX-tasks.md   # Tâches détaillées
        └── task-board.md         # Kanban
```

## Standards SCRUM appliqués

### Fondamentaux
- **3 Piliers** : Transparence, Inspection, Adaptation
- **Manifeste Agile** : 4 valeurs, 12 principes
- **Sprint** : 2 semaines fixe
- **Vélocité** : 20-40 points/sprint

### User Stories
- Format : "En tant que [P-XXX]... Je veux... Afin de..."
- Validation **INVEST** : Independent, Negotiable, Valuable, Estimable, Sized ≤8pts, Testable
- Les **3 C** : Carte, Conversation, Confirmation
- **Vertical Slicing** : Symfony + Flutter + API + PostgreSQL

### Critères d'Acceptance
- Format **Gherkin** : GIVEN [contexte] / WHEN [acteur] [action] / THEN [résultat]
- Validation **SMART** : Spécifique, Mesurable, Atteignable, Réaliste, Temporel
- Minimum : 1 nominal + 2 alternatifs + 2 erreurs

### Epics
- **MMF** (Minimum Marketable Feature) obligatoire
- Dépendances avec graphe **Mermaid**

### Sprints
- Sprint 1 = **Walking Skeleton** (fonctionnalité complète minimale)
- **Sprint Goal** en une phrase
- **Cérémonies** : Planning (Part 1 & 2), Daily, Review, Rétro, Affinage
- **Directive Fondamentale** de la Rétrospective incluse

### Tâches
- Estimation en **heures** (0.5h - 8h max)
- Types : [DB], [BE], [FE-WEB], [FE-MOB], [TEST], [DOC], [REV], [OPS]
- Dépendances avec graphe **Mermaid**
- Statuts : 🔲 À faire | 🔄 En cours | 👀 Review | ✅ Done | 🚫 Bloqué

## Workflow recommandé

```bash
# 1. Initialiser le backlog
/project:generate-backlog

# 2. Valider la conformité
/gate:validate-backlog

# 3. Planifier le sprint 1
/project:decompose-tasks 001

# 4. Obtenir la prochaine story
/sprint:next-story

# 5. Développer une story
/sprint:dev US-XXX

# 6. Suivre le sprint
/sprint:status

# 7. Préparer le sprint suivant
/project:decompose-tasks 002
```

## Conventions de nommage

| Élément | Format | Exemple |
|---------|--------|---------|
| Epic | EPIC-XXX-nom | EPIC-001-authentification |
| User Story | US-XXX-nom | US-001-inscription |
| Persona | P-XXX | P-001 |
| Sprint | sprint-XXX-but | sprint-001-walking_skeleton |
| Tâche | T-XXX-YY | T-001-05 |

## Qualité du code

### Backend (Symfony)
- PHPStan niveau max
- Tests > 80% couverture
- Architecture hexagonale
- PSR-12

### Mobile (Flutter)
- Dart analyzer strict
- Widget tests
- BLoC/Riverpod
- Material Design 3

### API (API Platform)
- OpenAPI auto-généré
- Validation constraints
- Serialization groups
- Security voters
