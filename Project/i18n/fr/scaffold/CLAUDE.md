# Configuration Claude Code - Gestion de Projet

## Agents disponibles

### 🎯 Product Owner (`@po`)
Expert en gestion de backlog, personas, User Stories et priorisation.
- Certifié CSPO (Certified Scrum Product Owner)
- Maîtrise : INVEST, 3C, Gherkin, SMART, MoSCoW, MMF

### 🔧 Tech Lead (`@tech`)
Expert en architecture, décomposition technique et facilitation Scrum.
- Certifié CSM (Certified Scrum Master)
- Maîtrise : Architecture hexagonale{{STACK_SKILLS}}

## Commandes personnalisées

### Génération & Gestion de Backlog (`/project:`)

| Commande | Description |
|----------|-------------|
| `/bear-workflow:plan --only=backlog` | Génère le backlog complet |
| `/bear-workflow:start N` | Décompose le sprint N en tâches |
| `/bear-project:migrate --analyze` | Analyser le backlog existant |
| `/bear-project:migrate` | Migrer un backlog existant |
| `/bear-project:migrate --resync` | Synchroniser l'index du backlog |

### Gestion des EPICs (`/project:`)

| Commande | Description |
|----------|-------------|
| `/bear-project:backlog add epic "Nom"` | Créer un nouvel EPIC |
| `/bear-project:backlog list epic` | Lister tous les EPICs |
| `/bear-project:backlog edit epic EPIC-XXX` | Modifier un EPIC |

### Gestion des User Stories (`/project:`)

| Commande | Description |
|----------|-------------|
| `/bear-project:backlog add story EPIC-XXX "Nom"` | Créer une User Story |
| `/bear-project:backlog list story` | Lister les User Stories |
| `/bear-project:backlog edit story US-XXX` | Modifier une US |
| `/bear-project:migrate --stories` | Mettre à jour plusieurs US |

### Gestion des Tasks (`/project:`)

| Commande | Description |
|----------|-------------|
| `/bear-project:backlog add task US-XXX "[TYPE] Desc" Xh` | Créer une tâche |
| `/bear-project:backlog list task` | Lister les tâches |
| `/bear-project:backlog move task TASK-XXX statut` | Changer le statut |

### Visualisation & Exécution (`/project:`)

| Commande | Description |
|----------|-------------|
| `/bear-workflow:status --board` | Afficher le Kanban du sprint |
| `/bear-workflow:status --queue` | Statut par lot des éléments |
| `/bear-workflow:implement N` | Exécuter un sprint complet |
| `/bear-workflow:implement --epic EPIC-XXX` | Exécuter un EPIC complet |
| `/bear-workflow:implement --queue` | Exécuter la file d'attente |
| `/bear-workflow:plan --only=prd` | Générer le PRD |
| `/bear-workflow:design` | Générer la spécification technique |

### Sprint

| Commande | Description |
|----------|-------------|
| `/bear-workflow:status` | Métriques détaillées du sprint |
| `/bear-project:backlog move story US-XXX statut` | Changer statut/sprint d'une US |
| `/bear-project:backlog next story` | Prochaine story prête pour le dev |
| `/bear-project:backlog move story --auto` | Routage automatique des stories |
| `/bear-workflow:implement US-XXX` | Développer une story |

### Quality Gates (`/gate:`)

| Commande | Description |
|----------|-------------|
| `/bear-gate:check backlog` | Valide la conformité du backlog (score /100) |
| `/bear-gate:check prd` | Valider le PRD |
| `/bear-gate:check spec` | Valider la spécification technique |
| `/bear-gate:check story US-XXX` | Valider une User Story (DoD) |
| `/bear-gate:check sprint N` | Valider un sprint |
| `/bear-gate:check all` | Rapport de qualité complet |

## Stack technique

```yaml
{{STACK_BLOCK}}
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
    └── sprint-{N}-{slug}/
        ├── sprint-goal.md        # Sprint Goal + Cérémonies + Rétro
        ├── sprint-dependencies.md
        ├── board.md              # Kanban
        └── tasks/
            ├── README.md
            └── TASK-XXX.md       # Un fichier par tâche
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
- **Vertical Slicing** : {{STACK_SLICE}}

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
/bear-workflow:plan --only=backlog

# 2. Valider la conformité
/bear-gate:check backlog

# 3. Planifier le sprint 1
/bear-workflow:start 001

# 4. Obtenir la prochaine story
/bear-project:backlog next story

# 5. Développer une story
/bear-workflow:implement US-XXX

# 6. Suivre le sprint
/bear-workflow:status

# 7. Préparer le sprint suivant
/bear-workflow:start 002
```

## Conventions de nommage

| Élément | Format | Exemple |
|---------|--------|---------|
| Epic | EPIC-XXX-nom | EPIC-001-authentification |
| User Story | US-XXX-nom | US-001-inscription |
| Persona | P-XXX | P-001 |
| Sprint | sprint-{N}-{slug} | sprint-1-walking_skeleton   |
| Tâche | TASK-XXX | TASK-005 |

## Qualité du code

- Tests > 80% couverture

{{QUALITY_BLOCK}}
