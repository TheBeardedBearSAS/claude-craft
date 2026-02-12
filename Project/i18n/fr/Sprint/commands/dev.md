---
name: sprint-dev
description: Lance le développement TDD/BDD d'un sprint avec mise à jour automatique des statuts
arguments:
  - name: sprint
    description: Numéro du sprint, "next" pour le prochain incomplet, ou "current"
    required: true
---

# /sprint:dev

## Objectif

Orchestrer le développement complet d'un sprint en mode TDD/BDD avec :
- **Plan mode obligatoire** avant chaque implémentation de tâche
- **Cycle TDD** (RED → GREEN → REFACTOR)
- **Mise à jour automatique** des statuts (Tâche → User Story → Sprint)
- **Suivi de progression** et métriques

## Prérequis

- Sprint existant avec tâches décomposées
- Fichiers présents : `sprint-backlog.md`, `tasks/*.md`
- Exécuter `/project:decompose-tasks N` d'abord si nécessaire

## Arguments

```bash
/sprint:dev 1        # Sprint 1
/sprint:dev next     # Prochain sprint incomplet
/sprint:dev current  # Sprint actuellement actif
```

---

## Workflow

### Phase 1 : Initialisation

1. Charger sprint depuis `project-management/sprints/sprint-N-*/`
2. Lire `sprint-backlog.md` pour obtenir les User Stories
3. Lister les tâches par US (triées par dépendances)
4. Afficher le board initial

```
📋 Sprint 1 : Walking Skeleton
   Objectif : Flux d'authentification complet de bout en bout

   3 User Stories, 17 Tâches

   🔴 To Do : 15 | 🟡 In Progress : 2 | 🟢 Done : 0
```

### Phase 2 : Boucle User Story

Pour chaque User Story en statut To Do ou In Progress :

1. **Marquer US → In Progress** (si To Do)
2. **Afficher critères d'acceptation** (format Gherkin)
3. **Traiter chaque tâche** de cette US

```
🎯 US-001 : Authentification Utilisateur (5 pts)
   Statut : 🟡 In Progress

   Critères d'Acceptation :
   ┌─────────────────────────────────────────────────────┐
   │ GIVEN un utilisateur enregistré avec identifiants  │
   │ WHEN il soumet le formulaire de connexion          │
   │ THEN il devrait voir son tableau de bord           │
   │ AND une session devrait être créée                 │
   └─────────────────────────────────────────────────────┘

   Tâches :
   └─ TASK-001 [DB] Créer entité User ............... 🔴 To Do
   └─ TASK-002 [BE] Service d'authentification ...... 🔴 To Do
   └─ TASK-003 [FE-WEB] Formulaire de connexion ..... 🔴 To Do
   └─ TASK-004 [TEST] Tests E2E authentification .... 🔴 To Do
```

### Phase 3 : Boucle Tâche (Workflow TDD)

Pour chaque tâche en To Do :

#### 3.1 Afficher Détails de la Tâche

```
▶️ Démarrage TASK-001 [DB] Créer entité User

   Estimation : 2h
   Description : Créer entité User avec email, password_hash, roles
   Fichiers à modifier : src/Entity/User.php, migrations/

   Definition of Done :
   - [ ] Code écrit et fonctionnel
   - [ ] Tests passent
   - [ ] Code reviewé (si tâche [REV] existe)
```

#### 3.2 Plan Mode (OBLIGATOIRE)

⚠️ **TOUJOURS activer le plan mode avant d'implémenter**

```
⚠️ PLAN MODE ACTIVÉ

   Analyse de la tâche TASK-001...

   📁 Fichiers à analyser :
   - src/Entity/ (pattern entités existantes)
   - config/packages/doctrine.yaml
   - migrations/ (dernière migration)

   🔍 Analyse en cours...
```

Le plan mode DOIT :
1. **Explorer** le code impacté et les dépendances
2. **Documenter** les résultats de l'analyse
3. **Proposer** un plan d'implémentation avec :
   - Fichiers à créer/modifier
   - Tests à écrire (TDD)
   - Risques et mitigations
4. **Attendre** la validation utilisateur avant de continuer

```
📋 Plan d'Implémentation pour TASK-001

   1. Créer entité User avec propriétés :
      - id (UUID)
      - email (unique)
      - password_hash
      - roles (tableau JSON)
      - created_at, updated_at

   2. Tests à écrire EN PREMIER (TDD) :
      - UserTest::test_user_creation()
      - UserTest::test_email_validation()
      - UserTest::test_password_hashing()

   3. Fichiers à créer :
      - src/Entity/User.php
      - tests/Unit/Entity/UserTest.php
      - migrations/VersionXXX.php

   ⏳ En attente de validation...

   [continue] Procéder à l'implémentation
   [skip] Passer cette tâche
   [block] Marquer comme bloquée
   [stop] Arrêter sprint-dev
```

#### 3.3 Marquer Tâche → In Progress

Après validation du plan :
- Mettre à jour le statut de la tâche en In Progress
- Mettre à jour board.md
- Mettre à jour index.md

#### 3.4 Cycle TDD

```
🧪 CYCLE TDD - TASK-001

🔴 Phase RED : Écrire tests qui échouent
   Création de tests/Unit/Entity/UserTest.php...

   Exécution des tests... ÉCHEC (attendu)
   ✗ test_user_creation
   ✗ test_email_validation
   ✗ test_password_hashing

🟢 Phase GREEN : Implémenter le code minimum
   Création de src/Entity/User.php...

   Exécution des tests... SUCCÈS
   ✓ test_user_creation
   ✓ test_email_validation
   ✓ test_password_hashing

🔧 Phase REFACTOR : Améliorer la qualité du code
   - Extraire validation email en ValueObject ? [o/n]
   - Ajouter méthode factory ? [o/n]

   Exécution des tests... SUCCÈS (pas de régression)
```

#### 3.5 Vérification Definition of Done

```
✅ Definition of Done - TASK-001

- [x] Code écrit et fonctionnel
- [x] Tests passent (3/3)
- [ ] Code reviewé → Géré par TASK-XXX [REV]

Toutes les vérifications passées !
```

#### 3.6 Marquer Tâche → Done

```
📊 Complétion de la Tâche

TASK-001 [DB] Créer entité User
├─ Statut : 🟢 Done
├─ Estimé : 2h
├─ Réel : 1.5h
└─ Efficacité : 133%

Entrez le temps réel passé (heures) : 1.5
```

Mises à jour :
- Métadonnées du fichier tâche (status, time_spent, updated_at)
- board.md
- index.md
- Métriques du sprint

#### 3.7 Commit Conventionnel

```
📝 Création du commit...

feat(entity): créer entité User avec support authentification

- Ajout entité User avec email, password_hash, roles
- Ajout stratégie clé primaire UUID
- Ajout timestamps (created_at, updated_at)
- Ajout tests unitaires pour entité User

Refs: TASK-001, US-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Phase 4 : Validation User Story

Quand toutes les tâches d'une US sont Done :

```
🎯 Validation US-001

Toutes les tâches complétées (4/4)

Vérification des critères d'acceptation :
┌─────────────────────────────────────────────────────┐
│ ✓ GIVEN un utilisateur enregistré avec identifiants│
│ ✓ WHEN il soumet le formulaire de connexion        │
│ ✓ THEN il devrait voir son tableau de bord         │
│ ✓ AND une session devrait être créée               │
└─────────────────────────────────────────────────────┘

Exécution tests E2E si présents...
✓ tests/E2E/AuthenticationTest.php passé

US-001 → 🟢 Done

Mise à jour progression EPIC-001 : 1/3 US complétées (33%)
```

### Phase 5 : Clôture Sprint

Quand toutes les User Stories sont Done :

```
🏁 Sprint 1 Terminé !

📊 Récapitulatif
├─ Durée : 8 jours (prévu : 10)
├─ Vélocité : 15 points
├─ Tâches : 17/17 complétées
└─ Heures : 38h réel vs 42h estimé (110% efficacité)

📈 Métriques par Type
├─ [DB] : 4 tâches, 6h
├─ [BE] : 5 tâches, 12h
├─ [FE-WEB] : 4 tâches, 10h
├─ [TEST] : 3 tâches, 8h
└─ [DOC] : 1 tâche, 2h

📝 Génération de sprint-review.md...
📝 Génération du template sprint-retro.md...

Suivant : Exécuter /sprint:dev 2 ou /sprint:dev next
```

---

## Ordre de Traitement des Tâches

Les tâches sont traitées par type pour respecter les dépendances :

| Ordre | Type | Description |
|-------|------|-------------|
| 1 | `[DB]` | Base de données (entités, migrations, repositories) |
| 2 | `[BE]` | Backend (services, APIs, logique métier) |
| 3 | `[FE-WEB]` | Frontend Web (contrôleurs, templates, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (écrans, blocs, widgets) |
| 5 | `[TEST]` | Tests additionnels (E2E, performance) |
| 6 | `[DOC]` | Documentation |
| 7 | `[REV]` | Code Review |

---

## Commandes de Contrôle

Pendant l'exécution de sprint-dev :

| Commande | Action |
|----------|--------|
| `continue` | Valider le plan et procéder à l'implémentation |
| `skip` | Passer cette tâche (reste To Do) |
| `block [raison]` | Marquer la tâche comme Bloquée avec raison |
| `stop` | Arrêter sprint-dev (sauvegarde l'état actuel) |
| `status` | Afficher la progression actuelle |
| `board` | Afficher le tableau Kanban |

---

## Gestion des Blocages

```
⚠️ Tâche Bloquée

TASK-003 ne peut pas continuer.
Raison : En attente des spécifications API de l'équipe backend

Options :
[1] Passer et continuer avec la prochaine tâche non-bloquée
[2] Tenter de résoudre le blocage
[3] Arrêter sprint-dev

Choix : 1

Marquage TASK-003 comme Bloquée...
Passage à TASK-004...
```

---

## Mises à Jour Automatiques

À chaque changement de statut :

1. **Fichier tâche** : Mise à jour status, time_spent, updated_at
2. **Fichier User Story** : Mise à jour progression tâches, statut si toutes done
3. **Fichier EPIC** : Mise à jour progression US
4. **board.md** : Rafraîchissement colonnes Kanban
5. **index.md** : Mise à jour métriques globales
6. **sprint-status** : Recalcul des métriques

---

## Reprise Après Arrêt

```bash
/sprint:dev current

📋 Reprise Sprint 1 : Walking Skeleton

Progression : 8/17 tâches (47%)

Dernière complétée : TASK-008 [BE] Service JWT Token
Prochaine tâche : TASK-009 [FE-WEB] Contrôleur Login

Continuer depuis TASK-009 ? [o/n]
```

---

## Exemple de Session

```bash
> /sprint:dev 1

📋 Sprint 1 : Walking Skeleton
   3 US, 17 tâches
   🔴 To Do : 17 | 🟡 In Progress : 0 | 🟢 Done : 0

🎯 Démarrage US-001 : Authentification Utilisateur (5 pts)
   Marquage comme In Progress...

▶️ TASK-001 [DB] Créer entité User

⚠️ PLAN MODE ACTIVÉ
   Analyse...

   [Détails du plan affichés]

> continue

   Marquage TASK-001 comme In Progress...

🧪 CYCLE TDD

🔴 RED : Écriture des tests...
   [Code des tests créé]
   Tests : 0/3 passent (attendu)

🟢 GREEN : Implémentation...
   [Code d'implémentation]
   Tests : 3/3 passent

🔧 REFACTOR : Des améliorations ? [passer]

✅ Definition of Done : PASSÉ

   Entrez le temps réel (estimé 2h) : 1.5

📝 Commit créé : feat(entity): créer entité User

▶️ TASK-002 [BE] Service d'authentification

⚠️ PLAN MODE ACTIVÉ
   ...
```

---

## Fichiers Mis à Jour

| Fichier | Mises à jour |
|---------|--------------|
| `project-management/backlog/user-stories/US-XXX.md` | Statut, progression tâches |
| `project-management/backlog/epics/EPIC-XXX.md` | Progression US |
| `project-management/sprints/sprint-N-*/board.md` | Colonnes Kanban |
| `project-management/sprints/sprint-N-*/tasks/*.md` | Statut tâche, temps |
| `project-management/backlog/index.md` | Métriques globales |
| `project-management/sprints/sprint-N-*/sprint-review.md` | Généré à la fin |

---

## Commandes Liées

| Commande | Utilisation |
|----------|-------------|
| `/project:decompose-tasks N` | Créer les tâches avant sprint-dev |
| `/project:board N` | Voir le tableau Kanban |
| `/sprint:status N` | Voir les métriques du sprint |
| `/project:move-task` | Changer manuellement le statut d'une tâche |
| `/sprint:transition` | Changer manuellement le statut d'une US |
