# Guide de Gestion du Backlog

Workflow complet pour creer et gerer un backlog SCRUM avec Claude-Craft.

---

## Vue d'ensemble

Claude-Craft fournit un ensemble complet de commandes pour gerer votre product backlog selon la methodologie SCRUM (parmi les **204+ commandes** et **26 namespaces** disponibles) :

- **34 commandes `/project:`** pour les operations de backlog et gestion de projet
- **5 commandes `/sprint:`** pour le suivi des sprints
- **7 commandes `/gate:`** pour la validation qualite
- **Vertical slicing** obligatoire sur toutes les couches tech
- **Validation INVEST** pour les User Stories

### Philosophie

Base sur :
- Les principes du Manifeste Agile
- Les 12 Principes Agile
- Les fondamentaux SCRUM
- Le vertical slicing (chaque US traverse toutes les couches)

---

## Generation Initiale du Backlog

### Depuis les Specifications

Placez vos specifications projet dans `./docs/` puis executez :

```bash
/project:generate-backlog symfony+flutter
```

### Structure Generee

```
project-management/
├── README.md                    # Vue d'ensemble du projet
├── personas.md                  # Personas utilisateurs (min. 3)
├── definition-of-done.md        # Niveaux DoD progressifs
├── dependencies-matrix.md       # Dependances Epic et US
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
- **Identite** : Nom, role, demographiques
- **Objectifs** : Ce qu'ils veulent accomplir
- **Frustrations** : Points de douleur a resoudre

Format : `P-001`, `P-002`, `P-003`...

### EPICs

Grandes fonctionnalites contenant plusieurs User Stories :

| Champ | Description |
|-------|-------------|
| ID | Identifiant unique (EPIC-001, EPIC-002...) |
| MMF | Minimum Marketable Feature |
| Statut | Draft, Ready, In Progress, Done |
| Objectifs Business | Pourquoi cet EPIC est important |
| Criteres de Succes | Comment mesurer le succes |

### User Stories

Suivent le modele **INVEST** :

| Lettre | Signification | Validation |
|--------|---------------|------------|
| **I** | Independent | Pas de dependances avec d'autres US |
| **N** | Negotiable | Les details peuvent etre discutes |
| **V** | Valuable | Apporte de la valeur utilisateur |
| **E** | Estimable | Peut etre dimensionnee en points |
| **S** | Sized | Max 8 story points |
| **T** | Testable | A des criteres d'acceptation clairs |

#### Les 3 Cs

1. **Card** : Description breve
2. **Conversation** : Details de discussion
3. **Confirmation** : Criteres d'acceptation

#### Criteres d'Acceptation (Gherkin)

Chaque US requiert :
- 1 scenario nominal (happy path)
- 2 scenarios alternatifs
- 2 scenarios d'erreur

```gherkin
Scenario: L'utilisateur se connecte avec succes
  Given un utilisateur enregistre avec des identifiants valides
  When il soumet le formulaire de connexion
  Then il devrait voir son tableau de bord
  And une session devrait etre creee
```

### Tasks (Taches)

Elements de travail technique dans une User Story :

| Type | Description | Duree Typique |
|------|-------------|---------------|
| `[DB]` | Base de donnees (entites, migrations) | 1-3h |
| `[BE]` | Backend (services, APIs) | 2-4h |
| `[FE-WEB]` | Frontend Web (controleurs, templates) | 2-4h |
| `[FE-MOB]` | Frontend Mobile (ecrans, blocs) | 3-5h |
| `[TEST]` | Tests (unitaires, integration, E2E) | 2-4h |
| `[DOC]` | Documentation | 0.5-1h |
| `[OPS]` | DevOps (CI/CD, deploiement) | 1-2h |
| `[REV]` | Revue de code | 1-2h |

**Regles d'estimation :**
- Duree de tache : 0.5h - 8h max
- Story points (Fibonacci) : 1, 2, 3, 5, 8, 13, 21
- Taille max US : 8 points (decouper si plus)

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
- Any → To Do (sauf reouverture manuelle)

---

## Reference des Commandes

### Commandes de Creation

| Commande | Description |
|----------|-------------|
| `/project:generate-backlog [stack]` | Generer le backlog complet depuis les specs |
| `/project:add-epic` | Creer un nouvel EPIC |
| `/project:add-story` | Ajouter une User Story a un EPIC |
| `/project:add-task` | Creer une tache technique pour une US |

### Commandes de Visualisation

| Commande | Description |
|----------|-------------|
| `/project:list-epics` | Afficher tous les EPICs avec statut |
| `/project:list-stories [filtre]` | Lister les User Stories (par EPIC, Sprint, Statut) |
| `/project:list-tasks [filtre]` | Lister les taches (par US, Sprint, Type, Statut) |
| `/project:board [sprint]` | Afficher le tableau Kanban |
| `/sprint:status [sprint]` | Rapport detaille de progression du sprint |

### Commandes de Mise a Jour

| Commande | Description |
|----------|-------------|
| `/sprint:transition [id] [statut/sprint]` | Changer le statut de l'US ou assigner au sprint |
| `/project:move-task [id] [statut]` | Changer le statut de la tache |
| `/project:update-epic [id]` | Modifier un EPIC existant |
| `/project:update-story [id]` | Modifier une User Story existante |

### Commandes Avancees

| Commande | Description |
|----------|-------------|
| `/project:decompose-tasks [sprint]` | Decomposer les US du sprint en taches |
| `/gate:validate-backlog` | Auditer la qualite du backlog (conformite SCRUM) |

---

## Exemple Complet : Nouveau Projet

### Etape 1 : Generer le Backlog Initial

```bash
# S'assurer que les specs sont dans ./docs/
/project:generate-backlog symfony+flutter
```

### Etape 2 : Valider la Qualite

```bash
/gate:validate-backlog
```

Cela genere `scrum-validation-report.md` avec :
- Score de conformite INVEST
- Verification des 3 Cs
- Analyse des criteres SMART
- Coherence des estimations

### Etape 3 : Examiner le Sprint 1

```bash
/project:board 1
```

Affiche le tableau Kanban avec les colonnes :
- To Do | In Progress | In Review | Done | Blocked

### Etape 4 : Decomposer en Taches

```bash
/project:decompose-tasks 1
```

Cree une decomposition detaillee des taches :
- Taches groupees par US
- Graphe de dependances (Mermaid)
- Estimations de temps par couche

### Etape 5 : Commencer le Travail

```bash
# Deplacer la premiere tache en cours
/project:move-task TASK-001 in-progress

# Plus tard, marquer comme terminee
/project:move-task TASK-001 done

# Si bloquee
/project:move-task TASK-002 blocked "En attente des specs API"
```

### Etape 6 : Suivre la Progression

```bash
/sprint:status 1
```

Affiche :
- Progression globale et burndown
- Metriques par User Story
- Bloqueurs et risques
- Actions recommandees

---

## Templates

Claude-Craft fournit 5 templates pour une structure de backlog coherente :

| Template | Objectif |
|----------|----------|
| `epic.md` | Structure de fichier EPIC avec metadonnees, objectifs, liste US |
| `user-story.md` | Structure US avec criteres Gherkin, tableau de taches |
| `task.md` | Structure de tache avec checklist DoD |
| `board.md` | Tableau Kanban avec calcul de metriques |
| `index.md` | Index du backlog avec resume global |

---

## Regles SCRUM Appliquees

| Regle | Valeur |
|-------|--------|
| Duree du sprint | 2 semaines (fixe) |
| Velocite | 20-40 points/sprint |
| Taille max US | 8 points (decouper si plus) |
| Echelle d'estimation | Fibonacci (1, 2, 3, 5, 8, 13, 21) |
| Duree des taches | 0.5h - 8h max |

### Sprint 1 : Walking Skeleton

Le premier sprint doit inclure :
- Setup complet de l'infrastructure
- 1 fonctionnalite de bout en bout (pas juste du setup)
- Testable sur Web et Mobile

### Vertical Slicing

**Chaque User Story DOIT traverser toutes les couches :**

```
UI (Web/Mobile) → API → Logique Metier → Base de Donnees
```

Pas de User Stories "Backend uniquement", "Frontend uniquement" ou "Mobile uniquement" autorisees.

---

## Checklist : Backlog Pret

- [ ] Minimum 3 personas definis
- [ ] EPICs ont MMF et criteres de succes
- [ ] User Stories suivent le modele INVEST
- [ ] Criteres d'acceptation au format Gherkin
- [ ] Stories estimees en points Fibonacci
- [ ] Sprint 1 = Walking Skeleton
- [ ] Definition of Done documentee
- [ ] Backlog valide (`/gate:validate-backlog`)

---

[&larr; Resolution de Problemes](06-troubleshooting.md) | [Suivant : Installation Nouveau Projet &rarr;](08-setup-new-project.md)
