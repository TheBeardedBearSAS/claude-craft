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

# /workflow:init

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
║ • /qa:tdd    - Corriger avec TDD              ║
║ • /project:add-task      - Suivre le travail              ║
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
║ • /project:generate-prd    - Créer/mettre à jour le PRD   ║
║ • /project:generate-backlog - Créer les user stories      ║
║                                                           ║
║ Phase 2 - Conception :                                    ║
║ • /project:generate-tech-spec - Conception technique      ║
║                                                           ║
║ Phase 3 - Implémentation :                                ║
║ • /sprint:dev      - Développement TDD/BDD        ║
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
║ • /workflow:analyze        - Recherche et exploration     ║
║                                                           ║
║ Phase 2 - Planification :                                 ║
║ • /project:generate-prd    - PRD complet                  ║
║ • /project:generate-backlog - Backlog complet             ║
║                                                           ║
║ Phase 3 - Conception :                                    ║
║ • /project:generate-tech-spec - Spécification technique   ║
║   complète                                                ║
║ • /common:architecture-decision - ADR                     ║
║                                                           ║
║ Phase 4 - Implémentation :                                ║
║ • /sprint:dev      - Développement sprint par     ║
║   sprint                                                  ║
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
next_command: "/project:generate-prd"
```

### Étape 6 : Proposer l'action suivante

```
╔══════════════════════════════════════════════════════════╗
║                    PRÊT À DÉMARRER                        ║
╠══════════════════════════════════════════════════════════╣
║ Workflow initialisé : track STANDARD                      ║
║ Fichier de statut : project-management/workflow-status.yaml║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PROCHAINE ÉTAPE : Phase de planification                  ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Commencer avec : /workflow:plan                           ║
║                                                           ║
║ Ou aller directement à des tâches spécifiques :           ║
║ • /project:generate-prd     - Créer le document           ║
║   d'exigences                                             ║
║ • /project:generate-backlog - Créer les user stories      ║
║                                                           ║
║ Vérifier la progression à tout moment : /workflow:status  ║
╚══════════════════════════════════════════════════════════╝
```

## Options de surcharge

```bash
# Forcer un track spécifique
/workflow:init --quick          # Forcer Quick Flow
/workflow:init --standard       # Forcer Standard
/workflow:init --enterprise     # Forcer Enterprise

# Fournir une indication de périmètre
/workflow:init bug              # Indication : c'est une correction de bug
/workflow:init feature          # Indication : nouvelle fonctionnalité
/workflow:init platform         # Indication : travail de plateforme
```

## Commandes associées

- `/workflow:status` - Vérifier la progression du workflow
- `/workflow:plan` - Démarrer la phase de planification
- `/workflow:design` - Démarrer la phase de conception
- `/workflow:implement` - Démarrer la phase d'implémentation
- `/workflow:analyze` - Démarrer la phase d'analyse (Enterprise uniquement)
