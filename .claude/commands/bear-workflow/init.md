---
name: workflow-init
description: "Analyser le contexte du projet et recommander le track de workflow optimal"
arguments:
  - name: scope
    description: Indication de périmètre optionnelle (bug, feature, platform, migration)
    required: false
  - name: track
    description: Forcer un track spécifique (--quick, --standard, --enterprise)
    required: false
---

# /bear-workflow:init

## Mission

Analyser le contexte du projet actuel et recommander le track de workflow de développement optimal. Initialiser le suivi du workflow et guider l'utilisateur à travers les phases appropriées.

## Workflow

### Étape 1 : Découverte du contexte

```
╔══════════════════════════════════════════════════════════╗
║             INITIALISATION DU WORKFLOW                    ║
╠══════════════════════════════════════════════════════════╣
║ Analyse du contexte du projet...                          ║
╚══════════════════════════════════════════════════════════╝
```

**Analyser :**

1. **Structure du projet**
   - Vérifier la présence du répertoire `.claude/`
   - Détecter la stack technologique à partir des fichiers
   - Identifier le framework (Symfony, Flutter, React, etc.)

2. **Documentation existante**
   - `project-management/prd.md` - Le PRD existe-t-il ?
   - `project-management/tech-spec.md` - La Spécification Technique existe-t-elle ?
   - `project-management/backlog/` - Le backlog existe-t-il ?
   - `README.md` - Description du projet

3. **Taille du codebase**
   - Compter les fichiers source
   - Estimer la complexité
   - Identifier les composants/modules

4. **Contexte Git**
   - Branche actuelle
   - Commits récents
   - Modifications en cours

### Étape 2 : Évaluation de la complexité

**Matrice de scoring :**

| Facteur | Quick (1) | Standard (2) | Enterprise (3) |
|---------|-----------|--------------|----------------|
| Fichiers à modifier | 1-5 | 5-50 | 50+ |
| Nouvelles entités/tables | 0 | 1-3 | 4+ |
| Intégrations externes | 0 | 1 | 2+ |
| User stories estimées | 1-3 | 3-15 | 15+ |
| Équipes impliquées | 1 | 1 | 2+ |
| Implications sécurité | Faible | Moyen | Élevé |

**Calcul du score :**
- Score 6-8 : Quick Flow
- Score 9-14 : Standard
- Score 15+ : Enterprise

### Étape 3 : Recommandation du track

```
╔══════════════════════════════════════════════════════════╗
║               ANALYSE DU PROJET TERMINÉE                  ║
╠══════════════════════════════════════════════════════════╣
║ Projet : my-awesome-app                                   ║
║ Stack : Symfony 7.x + React 18                            ║
║ Statut : Projet existant avec backlog                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ ÉVALUATION DE LA COMPLEXITÉ :                             ║
║ ├── Fichiers impactés :     ~25        [Standard]         ║
║ ├── Nouvelles entités :     2          [Standard]         ║
║ ├── Intégrations :          1 (Stripe) [Standard]         ║
║ ├── Stories estimées :      8          [Standard]         ║
║ ├── Équipes :               1          [Quick]            ║
║ └── Sécurité :              Élevé      [Enterprise]       ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║ TRACK RECOMMANDÉ : STANDARD                               ║
║ ═══════════════════════════════════════════════════════  ║
║                                                           ║
║ Justification :                                           ║
║ • Le périmètre fonctionnel nécessite une planification    ║
║   (8 stories)                                             ║
║ • L'intégration externe nécessite une conception technique║
║ • Les implications de sécurité nécessitent une            ║
║   architecture soignée                                    ║
║ • Une seule équipe peut gérer sans processus Enterprise   ║
║   complet                                                 ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 4 : Planification des phases

En fonction du track, afficher le workflow :

**Quick Flow :**
```
╔══════════════════════════════════════════════════════════╗
║              WORKFLOW QUICK FLOW                         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────────────┐                                     ║
║  │  IMPLÉMENTATION  │ ← Démarrer ici                      ║
║  └──────────────────┘                                     ║
║                                                           ║
║ Pas de documentation requise. Directement au code.        ║
║                                                           ║
║ Commandes :                                               ║
║ • /bear-qa:tdd    - Corriger avec TDD              ║
║ • /bear-project:backlog add task      - Suivre le travail              ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Standard :**
```
╔══════════════════════════════════════════════════════════╗
║              WORKFLOW STANDARD                           ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    ║
║  │PLANIFICATION │→ │  CONCEPTION  │→ │IMPLÉMENTATION│    ║
║  └──────────────┘  └──────────────┘  └──────────────┘    ║
║       ↑                                                   ║
║   Démarrer ici                                            ║
║                                                           ║
║ Phase 1 - Planification :                                 ║
║ • /bear-workflow:plan --only=prd    - Créer/mettre à jour le PRD   ║
║ • /bear-workflow:plan --only=backlog - Créer les user stories      ║
║                                                           ║
║ Phase 2 - Conception :                                    ║
║ • /bear-workflow:design - Conception technique      ║
║                                                           ║
║ Phase 3 - Implémentation :                                ║
║ • /bear-workflow:start N      - Préparation du sprint  ║
║ • /bear-workflow:implement    - Développement TDD/BDD  ║
║ • /bear-workflow:auto-sprint N - Sprint de bout en bout║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Enterprise :**
```
╔══════════════════════════════════════════════════════════╗
║              WORKFLOW ENTERPRISE                         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐  ║
║  │ ANALYSE  │→ │PLANIFICATION │→ │CONCEPTION│→ │IMPLÉMENTATION│ ║
║  └──────────┘  └──────────────┘  └──────────┘  └────────────┘  ║
║       ↑                                                   ║
║   Démarrer ici                                            ║
║                                                           ║
║ Phase 1 - Analyse :                                       ║
║ • /bear-workflow:plan --research        - Recherche et exploration     ║
║                                                           ║
║ Phase 2 - Planification :                                 ║
║ • /bear-workflow:plan --only=prd    - PRD complet                  ║
║ • /bear-workflow:plan --only=backlog - Backlog complet             ║
║                                                           ║
║ Phase 3 - Conception :                                    ║
║ • /bear-workflow:design - Spécification technique   ║
║   complète                                                ║
║ • /bear-common:architecture-decision - ADR                     ║
║                                                           ║
║ Phase 4 - Implémentation :                                ║
║ • /bear-workflow:start N      - Préparation du sprint  ║
║ • /bear-workflow:implement    - Développement TDD/BDD  ║
║ • /bear-workflow:auto-sprint N - Sprint de bout en bout║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 5 : Initialiser le suivi

Créer le fichier de statut du workflow :

```yaml
# project-management/workflow-status.yaml
project: my-awesome-app
track: standard
initialized_at: 2026-01-07T10:00:00Z
current_phase: planning

phases:
  analysis:
    status: skipped
    reason: "Track Standard - analyse non requise"
  planning:
    status: pending
    artifacts:
      prd: pending
      personas: pending
      backlog: pending
  design:
    status: pending
    artifacts:
      tech_spec: pending
      architecture: pending
  implementation:
    status: pending

next_action: "Générer ou mettre à jour le PRD"
next_command: "/bear-workflow:plan --only=prd"
```

Créer le squelette BMAD de statut (source unique de vérité du statut des stories, lu par `/bear-gate:*`, `/sprint:*`, `/bear-workflow:auto-sprint` et le Kanban). Ignorer si `.bmad/sprint-status.yaml` existe déjà ; `/bear-workflow:start` renseigne ensuite `metadata` et `stories` :

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-0"
  name: "Non démarré"
  start_date: ""
  end_date: ""
  goal: ""
stories: {}
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
    rules: []
```

### Étape 6 : Proposer l'action suivante

```
╔══════════════════════════════════════════════════════════╗
║                    PRÊT À DÉMARRER                        ║
╠══════════════════════════════════════════════════════════╣
║ Workflow initialisé : track STANDARD                      ║
║ Fichier de statut : project-management/workflow-status.yaml║
║ Statut sprint : .bmad/sprint-status.yaml                  ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PROCHAINE ÉTAPE : Phase de planification                  ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Commencer avec : /bear-workflow:plan                           ║
║                                                           ║
║ Ou aller directement à des tâches spécifiques :           ║
║ • /bear-workflow:plan --only=prd     - Créer le document           ║
║   d'exigences                                             ║
║ • /bear-workflow:plan --only=backlog - Créer les user stories      ║
║                                                           ║
║ Vérifier la progression à tout moment : /bear-workflow:status  ║
╚══════════════════════════════════════════════════════════╝
```

## Options de surcharge

```bash
# Forcer un track spécifique
/bear-workflow:init --quick          # Forcer Quick Flow
/bear-workflow:init --standard       # Forcer Standard
/bear-workflow:init --enterprise     # Forcer Enterprise

# Fournir une indication de périmètre
/bear-workflow:init bug              # Indication : c'est une correction de bug
/bear-workflow:init feature          # Indication : nouvelle fonctionnalité
/bear-workflow:init platform         # Indication : travail de plateforme
```

## Commandes associées

- `/bear-workflow:status` - Vérifier la progression du workflow
- `/bear-workflow:plan` - Démarrer la phase de planification
- `/bear-workflow:design` - Démarrer la phase de conception
- `/bear-workflow:implement` - Démarrer la phase d'implémentation
- `/bear-workflow:auto-sprint` - Exécuter un sprint complet de bout en bout (démarrage → merge)
- `/bear-workflow:plan --research` - Démarrer la phase d'analyse (Enterprise uniquement)

> Vous hésitez sur le chemin à suivre ? Consultez la page de décision : https://github.com/TheBeardedBearSAS/bear-craft/blob/main/docs/guides/fr/11-which-path.md
