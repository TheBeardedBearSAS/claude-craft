---
name: workflow-plan
description: "Exécuter la phase de Planification - création du PRD, personas et génération du backlog"
arguments:
  - name: continue
    description: Reprendre là où on s'est arrêté
    required: false
---

# /workflow:plan

## Mission

Exécuter la phase de Planification du workflow de développement. Cette phase se concentre sur la création du Document d'Exigences Produit (PRD), la définition des personas et la génération du backlog produit initial.

## Quand utiliser

- Tracks **Standard** et **Enterprise**
- Après `/workflow:init` (ou `/workflow:analyze` pour Enterprise)
- Quand on démarre la planification d'une fonctionnalité

## Workflow

### Étape 1 : Mise en place de la planification

```
╔══════════════════════════════════════════════════════════╗
║             PHASE DE PLANIFICATION - DÉMARRAGE            ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 2 sur 4 - Planification                            ║
║                                                           ║
║ Objectifs :                                               ║
║ • Créer ou mettre à jour le Document d'Exigences Produit  ║
║ • Définir les personas utilisateurs                       ║
║ • Générer le backlog produit avec des user stories        ║
║   priorisées                                              ║
║ • Définir les métriques de succès et les KPI              ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 2 : Vérification des artefacts existants

```
╔══════════════════════════════════════════════════════════╗
║              VÉRIFICATION DES ARTEFACTS EXISTANTS         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Vérification de project-management/ ...                   ║
║                                                           ║
║ PRD :                                                    ║
║ ├── ❌ prd.md                    Non trouvé               ║
║                                                           ║
║ Personas :                                                ║
║ ├── ❌ personas.md               Non trouvé               ║
║                                                           ║
║ Backlog :                                                 ║
║ ├── ❌ backlog/                  Non trouvé               ║
║                                                           ║
║ Analyse (Enterprise) :                                    ║
║ ├── ✅ analysis/constraints.md   Disponible               ║
║ └── ✅ analysis/research.md      Disponible               ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 3 : Tâches de planification

Exécuter les tâches de planification dans l'ordre :

```
╔══════════════════════════════════════════════════════════╗
║               TÂCHES DE PLANIFICATION                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Tâche 1 : Générer le PRD                                ║
║   Commande : /project:generate-prd                        ║
║   Résultat : project-management/prd.md                    ║
║                                                           ║
║ □ Tâche 2 : Définir les personas                          ║
║   (Inclus dans la génération du PRD)                      ║
║   Résultat : project-management/personas.md               ║
║                                                           ║
║ □ Tâche 3 : Générer le backlog                            ║
║   Commande : /project:generate-backlog                    ║
║   Résultat : project-management/backlog/                  ║
║                                                           ║
║ □ Tâche 4 : Valider le backlog                            ║
║   Commande : /project:validate-backlog                    ║
║   Assure la conformité SCRUM                              ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 4 : Exécution de la génération du PRD

Invoquer la commande de génération du PRD :

```
Démarrage de /project:generate-prd...

[Le workflow de génération du PRD s'exécute]

✅ PRD créé : project-management/prd.md
✅ Personas extraits : project-management/personas.md
```

### Étape 5 : Exécution de la génération du backlog

Après la complétion du PRD :

```
Démarrage de /project:generate-backlog...

Utilisation du PRD en entrée :
• 3 personas identifiés
• 12 exigences fonctionnelles extraites
• 8 exigences non fonctionnelles notées

Génération de la structure du backlog...

[Le workflow de génération du backlog s'exécute]

✅ Backlog créé avec :
   • 4 EPIC
   • 18 User Stories
   • Sprint 1 planifié (Walking Skeleton)
```

### Étape 6 : Validation

Exécuter la validation du backlog :

```
╔══════════════════════════════════════════════════════════╗
║              VALIDATION DU BACKLOG                        ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Vérification des critères INVEST :                        ║
║ ├── Indépendant :    18/18 ✅                              ║
║ ├── Négociable :     18/18 ✅                              ║
║ ├── De Valeur :      18/18 ✅                              ║
║ ├── Estimable :      18/18 ✅                              ║
║ ├── Petite (≤8pts) : 16/18 ⚠️  (2 stories à découper)    ║
║ └── Testable :       18/18 ✅                              ║
║                                                           ║
║ Vérification des critères 3C :                            ║
║ ├── Carte :          18/18 ✅                              ║
║ ├── Conversation :   18/18 ✅                              ║
║ └── Confirmation :   18/18 ✅                              ║
║                                                           ║
║ Critères d'acceptation (Gherkin) :                        ║
║ └── Format valide :  18/18 ✅                              ║
║                                                           ║
║ AVERTISSEMENTS :                                          ║
║ • US-007 : 13 points - envisager un découpage             ║
║ • US-012 : 21 points - doit être découpée                 ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 7 : Fin de phase

```
╔══════════════════════════════════════════════════════════╗
║             PHASE DE PLANIFICATION TERMINÉE               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artefacts créés :                                        ║
║ ✅ prd.md              Document d'Exigences Produit       ║
║ ✅ personas.md         3 personas utilisateurs            ║
║ ✅ backlog/            Backlog SCRUM complet               ║
║    ├── epics/          4 EPIC                             ║
║    └── user-stories/   18 User Stories                    ║
║                                                           ║
║ Résumé :                                                  ║
║ • Story Points totaux : 89                                ║
║ • Périmètre Sprint 1 : 21 points (Walking Skeleton)      ║
║ • Sprints estimés : 4-5                                   ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PHASE SUIVANTE : Conception (Solutioning)                 ║
║ Commande : /workflow:design                               ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ La spécification technique sera basée sur les exigences   ║
║ du PRD.                                                   ║
╚══════════════════════════════════════════════════════════╝
```

## Agents impliqués

- **product-owner** : Création du PRD, définition des personas, priorisation
- **tech-lead** : Revue de faisabilité technique, guidance d'estimation

## Fichiers de sortie

| Fichier | Objectif |
|---------|----------|
| `prd.md` | Document d'Exigences Produit |
| `personas.md` | Définitions des personas utilisateurs |
| `backlog/epics/` | Définitions des EPIC |
| `backlog/user-stories/` | Fichiers User Story |
| `sprints/sprint-001/` | Structure du premier sprint |

## Option de reprise

Si interrompu, utiliser `--continue` pour reprendre :

```bash
/workflow:plan --continue

# Détecte :
# ✅ PRD terminé
# ⏳ Backlog en cours (12/18 stories)
# → Reprend à la story 13
```

## Commandes associées

- `/workflow:init` - Initialiser le workflow
- `/workflow:analyze` - Phase précédente (Enterprise)
- `/workflow:design` - Phase suivante
- `/workflow:status` - Vérifier la progression
- `/project:generate-prd` - Génération directe du PRD
- `/project:generate-backlog` - Génération directe du backlog
