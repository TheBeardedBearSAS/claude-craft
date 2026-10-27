---
description: "Gérer le backlog : ajouter, lister, modifier et déplacer EPICs, User Stories et Tâches, choisir la prochaine story, changer le statut des stories et appliquer les règles de routage"
argument-hint: "<add|list|edit|move|next> <epic|story|task> [args] | move story --auto"
---

# Backlog

Point d'entrée unique pour gérer le backlog du projet : créer, lister, modifier et déplacer des EPICs, des User Stories et des Tâches.

## Usage

| Invocation | Ce qu'elle fait | Remplace |
|------------|-----------------|----------|
| `/project:backlog add epic "Nom" [priorité]` | Créer un EPIC | `/project:backlog add epic` |
| `/project:backlog add story EPIC-XXX "Nom" [points]` | Créer une User Story dans un EPIC | `/project:backlog add story` |
| `/project:backlog add task US-XXX "[TYPE] Description" 4h` | Créer une Tâche dans une User Story | `/project:backlog add task` |
| `/project:backlog list epic [statut] [priorité]` | Lister les EPICs avec statut dérivé et progression | `/project:backlog list epic` |
| `/project:backlog list story [epic EPIC-XXX \| sprint N \| status S \| backlog]` | Lister les User Stories | `/project:backlog list story` |
| `/project:backlog list task [us US-XXX \| sprint N \| type T \| status S]` | Lister les Tâches | `/project:backlog list task` |
| `/project:backlog edit epic EPIC-XXX [champ] [valeur]` | Modifier un EPIC | `/project:backlog edit epic` |
| `/project:backlog edit story US-XXX [champ] [valeur]` | Modifier une User Story | `/project:backlog edit story` |
| `/project:backlog move task TASK-XXX <in-progress\|blocked\|done>` | Changer le statut d'une Tâche | `/project:backlog move task` |
| `/project:backlog next story [--claim]` | Choisir la prochaine story `ready-for-dev` selon la priorité et les dépendances (`--claim` la passe en `in-progress`) | `/project:backlog next story` |
| `/project:backlog move story US-XXX <backlog\|ready-for-dev\|in-progress\|review\|done\|blocked\|sprint-N> ["raison"]` | Changer le statut d'une story via la machine à états BMAD, avec gates | `/project:backlog move story` |
| `/project:backlog move story --auto [--dry-run]` | Évaluer les règles `routing.auto_transitions` de `.bmad/sprint-status.yaml` et appliquer les transitions déclenchées | `/project:backlog move story --auto` |

Il n'existe ni `edit task`, ni `move epic` : les statuts d'EPIC sont dérivés. Les statuts de story se changent avec `move story` (machine à états avec gates) ; les règles `routing.auto_transitions` sont aussi appliquées après chaque transition.

## Arguments

$ARGUMENTS : `<action> <entité> [args]`

1. Premier mot = action : `add`, `list`, `edit`, `move` ou `next`
2. Deuxième mot = entité : `epic`, `story` ou `task` (`move` accepte `task` ou `story`, `next` uniquement `story`)
3. Le reste est transmis à la section correspondante ci-dessous
4. Action ou entité manquante ou inconnue : afficher le tableau Usage et s'arrêter. `move epic` : répondre que le statut d'EPIC est dérivé

## Règles communes

### Source de vérité du statut

- **Le statut vit uniquement dans `.bmad/sprint-status.yaml`** (source de vérité unique, schéma : `.claude/templates/project/sprint-status.md`). Utiliser les chaînes de statut exactes du schéma.
  - Story : `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`
  - Tâche (`stories.<US>.tasks.status.<TASK>`) : `to-do`, `in-progress`, `blocked`, `done`
- **Les fichiers markdown ne contiennent que du contenu** (nom, description, points, critères, estimation, texte du blocage, temps passé). Ne jamais écrire de statut dans un fichier EPIC, US ou tâche, ni dans les tableaux qu'ils contiennent.
- **Le statut d'un EPIC est dérivé, jamais stocké** : toutes les stories `backlog` (ou aucune story) = non démarré ; toutes `done` = terminé ; au moins une `blocked` et aucune en cours = bloqué ; sinon en cours.
- Les boards (`board.md`) sont des vues générées : les régénérer depuis `.bmad/sprint-status.yaml`, ne jamais les éditer à la main.
- Si `.bmad/sprint-status.yaml` est absent, le créer à partir du squelette de `/workflow:init`.

### Chemins et templates

| Élément | Chemin |
|---------|--------|
| EPICs | `project-management/backlog/epics/EPIC-{ID}-{slug}.md` |
| User Stories | `project-management/backlog/user-stories/US-{ID}-{slug}.md` |
| Tâches (US dans un sprint) | `project-management/sprints/sprint-{N}-{slug}/tasks/TASK-{ID}.md` |
| Tâches (sinon) | `project-management/backlog/tasks/TASK-{ID}.md` |
| Index | `project-management/backlog/index.md` |
| Templates | `.claude/templates/project/{epic,user-story,task}.md` |

### Mode Plan (add, edit, move)

> **Le mode plan est obligatoire** pour toute action qui écrit (`add`, `edit`, `move`). Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification. `list` est en lecture seule.

### Icônes de statut (list)

| Icône | Signification |
|-------|---------------|
| 🔴 | À faire / backlog (non démarré) |
| 🟡 | En cours |
| ⏸️ | Bloqué |
| 🟢 | Terminé |

## add epic

`/project:backlog add epic "Nom de l'EPIC" [priorité]`

- **Nom** (obligatoire), **Priorité** (optionnelle) : High, Medium, Low (défaut : Medium)

1. **Générer l'ID** : lire `project-management/backlog/epics/`, trouver le dernier `EPIC-XXX`, incrémenter
2. **Collecter** (si non fournis) : description, MMF (Minimum Marketable Feature), 2-3 objectifs métier, critères de succès
3. **Créer le fichier** depuis `.claude/templates/project/epic.md`, en remplaçant `{ID}`, `{NOM}`, `{PRIORITE}`, `{MINIMUM_MARKETABLE_FEATURE}`, `{DESCRIPTION}`, `{DATE}` (AAAA-MM-JJ), `{OBJECTIF_1}`, `{OBJECTIF_2}`, `{CRITERE_1}`, `{CRITERE_2}`. Aucun statut n'est écrit.
4. **Mettre à jour l'index** : ajouter l'EPIC au tableau des EPICs, mettre à jour les compteurs

```
✅ EPIC créé avec succès !

📋 EPIC-{ID}: {NOM}
   Statut: dérivé de ses stories (aucune pour l'instant)
   Priorité: {PRIORITÉ}
   Fichier: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Prochaines étapes:
  /project:backlog add story EPIC-{ID} "Nom de la User Story"
```

Exemple : `/project:backlog add epic "Système d'authentification" High` crée `project-management/backlog/epics/EPIC-001-systeme-d-authentification.md`.

Validation : nom non vide, priorité parmi High/Medium/Low, `project-management/backlog/epics/` existe, ID unique.

## add story

`/project:backlog add story EPIC-XXX "Nom de l'US" [points]`

- **EPIC-ID** (obligatoire), **Nom** (obligatoire), **Points** (optionnel) : Fibonacci (1, 2, 3, 5, 8)

1. **Valider l'EPIC** : il doit exister dans `project-management/backlog/epics/` ; sinon, afficher une erreur avec les EPICs disponibles
2. **Générer l'ID** : lire `project-management/backlog/user-stories/`, trouver le dernier `US-XXX`, incrémenter
3. **Collecter** : persona (P-XXX ou description), action, bénéfice, au moins 2 critères d'acceptation au format Gherkin, points (estimer si non fournis)
4. **Créer le fichier** depuis `.claude/templates/project/user-story.md`, en remplaçant `{ID}`, `{NOM}`, `{EPIC_ID}`, `{SPRINT}` ("Backlog" = non assignée), `{POINTS}`, `{PERSONA}`, `{PERSONA_ID}`, `{ACTION}`, `{BENEFICE}`, `{DATE}` ; ajouter les critères Gherkin
5. **Enregistrer le statut** dans `.bmad/sprint-status.yaml` : ajouter `stories.US-{ID}` avec `title`, `status: backlog`, `story_points`, `epic_id`, `priority`, `dependencies: []`, `tasks: { total: 0, completed: 0, list: [] }`, `history: []`
6. **Mettre à jour l'EPIC** (ajouter l'US à son tableau de User Stories, sans colonne de statut ; mettre à jour la progression) et l'**index** (section « Backlog priorisé », compteurs)

```
✅ User Story créée avec succès !

📖 US-{ID}: {NOM}
   EPIC: {EPIC_ID}
   Statut: backlog (.bmad/sprint-status.yaml)
   Points: {POINTS}
   Fichier: project-management/backlog/user-stories/US-{ID}-{slug}.md

Prochaines étapes:
  /project:backlog move story US-{ID} sprint-X                # Assigner à un sprint
  /project:backlog add task US-{ID} "[BE] ..." 4h    # Ajouter des tâches
```

Exemple : `/project:backlog add story EPIC-001 "Connexion utilisateur" 5`.

Contrôle INVEST : **I**ndépendante, **N**égociable, **V**aluable, **E**stimable (points fournis), **S**mall/petite (≤ 8 points, sinon suggérer de découper), **T**estable (critères d'acceptation clairs).

## add task

`/project:backlog add task US-XXX "[TYPE] Description" estimation`

- **US-ID** (obligatoire), **Description** avec le type entre crochets (obligatoire), **Estimation** en heures (obligatoire, ex. 4h, 2h, 0.5h)

| Type | Préfixe | Description |
|------|---------|-------------|
| Base de données | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unitaires, Intégration, E2E |
| Documentation | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Revue | `[REV]` | Code Review |

1. **Valider l'US** : elle doit exister dans `project-management/backlog/user-stories/` ; récupérer son sprint (le cas échéant) ; sinon afficher une erreur
2. **Valider l'estimation** : minimum 0.5h, maximum 8h, idéal 2-4h ; si > 8h, suggérer de découper la tâche
3. **Générer l'ID** : trouver le dernier ID de tâche, incrémenter
4. **Créer le fichier** depuis `.claude/templates/project/task.md`, en remplaçant `{ID}`, `{DESCRIPTION}`, `{US_ID}`, `{TYPE}`, `{ESTIMATION}`, `{DATE}`, `{DESCRIPTION_DETAILLEE}` ; chemin : répertoire des tâches du sprint si l'US est dans un sprint, sinon `project-management/backlog/tasks/`
5. **Enregistrer la tâche** dans `.bmad/sprint-status.yaml` : ajouter `TASK-{ID}` à `stories.{US_ID}.tasks.list`, définir `stories.{US_ID}.tasks.status.TASK-{ID}: to-do`, mettre à jour `stories.{US_ID}.tasks.total` (garder `completed` = nombre de tâches `done`)
6. **Mettre à jour l'US** (ajouter la tâche à son tableau de tâches, sans colonne de statut ; mettre à jour la progression)
7. **Mettre à jour le board** si l'US est dans un sprint : régénérer `board.md` depuis `.bmad/sprint-status.yaml` (la tâche apparaît en `to-do`) et mettre à jour les métriques

```
✅ Tâche créée avec succès !

🔧 TASK-{ID}: {DESCRIPTION}
   US: {US_ID}
   Type: {TYPE}
   Statut: to-do (.bmad/sprint-status.yaml)
   Estimation: {ESTIMATION}h
   Fichier: {CHEMIN}

Prochaines étapes:
  /project:backlog move task TASK-{ID} in-progress  # Démarrer la tâche
  /workflow:status --board                                     # Voir le Kanban
```

Exemples : `/project:backlog add task US-001 "[BE] Endpoint API de connexion" 4h`, `/project:backlog add task US-001 "[TEST] Tests unitaires AuthService" 3h`.

Validation : type valide, estimation entre 0.5h et 8h, la User Story existe, ID unique.

## list epic

`/project:backlog list epic [statut] [priorité]`

- **Statut** (dérivé des stories) : todo, in-progress, blocked, done, all (défaut : all)
- **Priorité** : high, medium, low

1. Parcourir `project-management/backlog/epics/`, lire chaque `EPIC-XXX-*.md` pour les métadonnées de contenu (nom, priorité)
2. Lire les statuts de ses stories dans `.bmad/sprint-status.yaml`
3. Appliquer les filtres ; pour chaque EPIC, compter le total d'US, les US par statut et le pourcentage de progression (statut d'EPIC dérivé comme décrit dans les Règles communes)
4. Afficher le tableau

```
📋 EPICs du projet

| ID | Nom | Statut | Priorité | US | Progression |
|----|-----|--------|----------|-----|-------------|
| EPIC-001 | Authentification | 🟡 En cours | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Catalogue | 🔴 À faire | Medium | 8 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Résumé: 2 EPICs | 🔴 1 À faire | 🟡 1 En cours | 🟢 0 Terminé
```

Avec beaucoup d'EPICs (ex. 12), utiliser le format compact : une ligne par groupe de statut (`🔴 À faire (5): EPIC-002, EPIC-003, ...`, `🟡 En cours (4): EPIC-001 (40%), ...`, `⏸️ Bloqué`, `🟢 Terminé`).

Exemples : `/project:backlog list epic`, `/project:backlog list epic in-progress`, `/project:backlog list epic all high`, `/project:backlog list epic blocked`.

Pour le détail d'un EPIC, suggérer : `cat project-management/backlog/epics/EPIC-001-*.md`.

## list story

`/project:backlog list story [filtre] [valeur]`

- `epic EPIC-XXX` : filtrer par EPIC | `sprint N` : filtrer par sprint | `status STATUS` : backlog, ready-for-dev, in-progress, review, done, blocked | `backlog` : uniquement les US non assignées à un sprint

1. Parcourir `project-management/backlog/user-stories/`, lire chaque `US-XXX-*.md` pour les métadonnées de contenu (titre, EPIC, sprint)
2. Lire le statut de chaque US, les statuts et les décomptes de tâches dans `.bmad/sprint-status.yaml`
3. Appliquer les filtres ; par US, compter le total de tâches, les tâches par statut et le pourcentage de progression
4. Afficher un tableau groupé par EPIC ou par sprint selon le contexte

```
📖 User Stories - EPIC-001: Authentification

| ID | Nom | Sprint | Statut | Points | Tâches | Progression |
|----|-----|--------|--------|--------|--------|-------------|
| US-001 | Connexion utilisateur | Sprint 1 | 🟡 En cours | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Inscription | Sprint 1 | 🔴 À faire | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Mot de passe oublié | Backlog | 🔴 À faire | 3 | - | - |

───────────────────────────────────────────────────
Total: 3 US | 11 points | 🔴 2 | 🟡 1 | 🟢 0
```

- Par sprint : colonnes `ID | EPIC | Nom | Statut | Points | Tâches | Progression`, pied `Sprint 1: 3 US | 13 points | Terminé: 5 pts (38%)`
- Backlog (non assignées) : colonnes `ID | EPIC | Nom | Priorité | Points | Statut`, pied `Backlog: 3 US | 16 points à planifier`

Exemples : `/project:backlog list story`, `... list story epic EPIC-001`, `... list story sprint 1`, `... list story status blocked`, `... list story backlog`.

Actions suggérées : `/project:backlog move story US-XXX sprint-2` (assigner à un sprint), `/project:backlog move story US-XXX in-progress` (changer le statut), `/project:backlog add task US-XXX "[BE] ..." 4h`.

## list task

`/project:backlog list task [filtre] [valeur]`

- `us US-XXX` | `sprint N` | `type TYPE` (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV) | `status STATUS` (to-do, in-progress, blocked, done)

1. Parcourir `project-management/sprints/sprint-{N}-{slug}/tasks/` et `project-management/backlog/tasks/` (s'il existe), lire chaque `TASK-XXX.md` pour les métadonnées de contenu (type, description, estimation)
2. Lire le statut de chaque tâche dans `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`)
3. Appliquer les filtres ; calculer le total d'heures estimées, les heures terminées, la répartition par type et par statut
4. Afficher

```
🔧 Tâches - US-001: Connexion utilisateur

| ID | Type | Description | Statut | Est. | Passé |
|----|------|-------------|--------|------|-------|
| TASK-001 | [DB] | Entité User | 🟢 Terminé | 2h | 2h |
| TASK-003 | [BE] | Endpoint API de connexion | 🟡 En cours | 4h | 2h |
| TASK-004 | [FE-WEB] | Contrôleur d'auth | 🔴 À faire | 3h | - |
| TASK-005 | [FE-MOB] | Écran de connexion | ⏸️ Bloqué | 6h | - |

───────────────────────────────────────────────────
US-001: 4 tâches | 15h estimées | 4h terminées (27%)
```

- Par sprint : synthèse par statut (`🔴 À faire (8 tâches, 24h)`, ...) et par type (une barre par `[DB]`, `[BE]`, ...), pied `Sprint 1: 25 tâches | 77h estimées | 35h terminées (45%)`
- Bloquées (`status blocked`) : colonnes `ID | US | Type | Description | Blocage`, pied `2 tâches bloquées | 14h en attente`, puis une liste `Actions:` indiquant comment résoudre chaque blocage

Exemples : `/project:backlog list task`, `... list task us US-001`, `... list task sprint 1`, `... list task type BE`, `... list task status blocked`.

## edit epic

`/project:backlog edit epic EPIC-XXX [champ] [valeur]`

| Champ | Description | Exemple |
|-------|-------------|---------|
| `name` | Nom de l'EPIC | "Nouveau nom" |
| `priority` | Priorité | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "Description du MMF" |
| `description` | Description | "Nouvelle description" |

> **Le statut n'est pas modifiable ici.** Le statut d'un EPIC est dérivé des statuts de ses stories dans `.bmad/sprint-status.yaml`. Pour changer le statut d'une story, utiliser `/project:backlog move story` ; pour celui d'une tâche, `/project:backlog move task`.

- **Mode interactif** (ID seul) : afficher les champs actuels numérotés (Nom, Priorité, MMF, Description) et demander lequel modifier (`1-4`, ou `q` pour quitter)
- **Mode direct** (champ et valeur) : modifier directement le champ

Étapes : valider que l'EPIC existe, lire le fichier, modifier le champ, mettre à jour la date de modification, sauvegarder, mettre à jour l'index si nécessaire.

```
✅ EPIC mis à jour !

📋 EPIC-001: Système d'authentification

Modification:
  Priorité: High → Medium

Fichier: project-management/backlog/epics/EPIC-001-systeme-d-authentification.md
```

Exemples : `/project:backlog edit epic EPIC-001`, `... edit epic EPIC-001 name "Authentification et autorisation"`, `... edit epic EPIC-001 priority Low`, `... edit epic EPIC-001 mmf "Permettre le SSO et la 2FA"`.

Validation : le champ doit être modifiable, priorité High/Medium/Low, nom non vide.

## edit story

`/project:backlog edit story US-XXX [champ] [valeur]`

| Champ | Description | Exemple |
|-------|-------------|---------|
| `name` | Nom de l'US | "Nouveau nom" |
| `points` | Story points | 1, 2, 3, 5, 8 |
| `epic` | EPIC parent | EPIC-002 |
| `persona` | Persona associé | P-001 |
| `story` | Texte de l'US | "En tant que..." |
| `criteria` | Critères d'acceptation | (mode interactif) |

> **Le statut n'est pas modifiable ici.** Les statuts vivent dans `.bmad/sprint-status.yaml`. Pour changer le statut d'une story, utiliser `/project:backlog move story` ; pour celui d'une tâche, `/project:backlog move task`.

- **Mode interactif** (ID seul) : afficher les champs numérotés (Nom, EPIC, Points, Persona, Story, Critères d'acceptation) et demander lequel modifier (`1-6`, ou `q`)
- **Mode direct** : par ex. `/project:backlog edit story US-001 points 8`
- **Critères d'acceptation** (interactif) : lister les critères (CA-1, CA-2, ...) puis demander `(a)jouter, (m)odifier, (s)upprimer, (q)uitter` ; un nouveau critère se saisit en Gherkin (GIVEN / WHEN / THEN)

Étapes : valider que l'US existe, lire le fichier, modifier le champ, mettre à jour la date de modification, sauvegarder, mettre à jour l'EPIC parent s'il a changé, mettre à jour l'index.

```
✅ User Story mise à jour !

📖 US-001: Connexion utilisateur

Modification:
  Points: 5 → 8

⚠️ Attention: 8 points est le maximum recommandé.
   Envisagez de découper cette US si elle est trop complexe.

Fichier: project-management/backlog/user-stories/US-001-connexion-utilisateur.md
```

Si l'EPIC parent change (`EPIC: EPIC-001 → EPIC-002`), indiquer les mises à jour : US retirée de la liste de l'ancien EPIC, ajoutée à celle du nouveau, index mis à jour ; mettre aussi à jour `epic_id` dans `.bmad/sprint-status.yaml`.

Exemples : `/project:backlog edit story US-001`, `... edit story US-001 points 3`, `... edit story US-001 epic EPIC-002`, `... edit story US-001 name "Connexion utilisateur avec SSO"`.

Validation : points Fibonacci (1, 2, 3, 5, 8), avertir de découper si > 8, l'EPIC doit exister, le persona doit être défini dans personas.md.

## move task

`/project:backlog move task TASK-XXX <destination>`

- **TASK-ID** (obligatoire) ; **Destination** (obligatoire) : `in-progress` (démarrer), `blocked`, `done`. Pour le statut d'une **story**, utiliser `/project:backlog move story`.

```
to-do ──→ in-progress ──→ done
   │            │
   │            ↓
   └────→ blocked ←────┘
              │
              ↓
         in-progress
```

| De | Vers | Autorisé |
|----|------|----------|
| to-do | in-progress | ✅ |
| to-do | blocked | ✅ |
| to-do | done | ❌ **Interdit** |
| in-progress | done | ✅ |
| in-progress | blocked | ✅ |
| in-progress | to-do | ✅ (retour arrière) |
| blocked | in-progress | ✅ |
| done | in-progress | ⚠️ (réouverture) |

Processus :

1. **Valider la tâche** : trouver le fichier de la tâche, lire son statut actuel dans `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), identifier l'US et le sprint
2. **Valider la transition** avec le tableau ; to-do → done est bloqué et `in-progress` est suggéré
3. **Vers blocked** : demander le blocage (`Quel est le blocage de TASK-XXX ?`)
4. **Vers done** : demander le temps passé (`Temps passé sur TASK-XXX ? (estimation: 4h)`)
5. **Mettre à jour le statut** : l'écrire dans `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), recalculer `stories.<US>.tasks.completed` (= nombre de tâches `done`) ; jamais dans le fichier de la tâche. Dans le fichier de la tâche, seul le contenu change : texte du blocage si blocked, temps passé si done, date de modification
6. **Mettre à jour le board** : régénérer le `board.md` du sprint depuis `.bmad/sprint-status.yaml` et mettre à jour les métriques
7. **Mettre à jour la User Story** (contenu de la liste des tâches, progression recalculée depuis `.bmad/sprint-status.yaml`) ; si toutes les tâches sont done, suggérer de terminer l'US
8. **Mettre à jour l'index** (compteurs globaux)

Sorties :

```
✅ Tâche déplacée !

🔧 TASK-003: Endpoint API de connexion
   Avant: to-do
   Après: in-progress

📖 US-001: Connexion utilisateur
   Progression: 2/6 → 3/6 (50%)

Prochaines étapes:
  /project:backlog move task TASK-003 done       # Une fois terminée
  /project:backlog move task TASK-003 blocked    # Si bloquée
```

Pour `done`, afficher aussi l'estimation face au temps réel (`Estimation: 4h`, `Temps réel: 3.5h ✓`), la barre de progression de l'US et les totaux du sprint (tâches terminées, heures réalisées). Quand toutes les tâches de l'US sont done :

```
🎉 Toutes les tâches de US-001 sont terminées !

Prochaine étape recommandée:
  /project:backlog move story US-001 done
```

Erreur de workflow :

```
❌ Transition non autorisée !

🔧 TASK-004: Contrôleur d'auth
   Statut actuel: to-do
   Transition demandée: → done

Règle: Une tâche doit passer par "In Progress" avant "Done"

Action correcte:
  /project:backlog move task TASK-004 in-progress
  # ... travailler sur la tâche ...
  /project:backlog move task TASK-004 done
```

Pour `blocked`, afficher `Statut: in-progress → blocked`, le texte du blocage et comment débloquer (terminer la tâche bloquante, puis `/project:backlog move task TASK-005 in-progress`).

Exemples : `/project:backlog move task TASK-001 in-progress`, `... move task TASK-001 done`, `... move task TASK-001 blocked`, `... move task TASK-001 in-progress` (débloquer).

Métriques mises à jour à chaque déplacement : nombre de tâches par statut, heures estimées vs réelles, progression de l'US, progression du sprint, board Kanban.

## next story

`/project:backlog next story [--claim]`

- **--claim** (optionnel) : passe automatiquement la story en `in-progress`

1. **Charger** : lire `.bmad/sprint-status.yaml`, collecter les stories au statut `ready-for-dev`, les trier par priorité (si définie) ou par ID
2. **Vérifier les prérequis** de chaque story prête : aucune dépendance bloquante (toutes les stories `Depends on` sont `done` ou `review`, sinon indiquer lesquelles bloquent), points de story estimés, tâches décomposées, critères d'acceptation définis
3. **Sélectionner**, dans cet ordre : toutes les dépendances résolues, aucune dépendance bloquante, ID de story le plus bas (plus tôt dans le backlog), points de story les plus bas (les plus simples d'abord)
4. **Afficher** la story : ID et titre, points, EPIC, critères d'acceptation, liste des tâches, prérequis, dépendances, notes
5. **Réserver** (uniquement avec `--claim`) : même effet que `/project:backlog move story US-XXX in-progress` (gates, historique) : statut `in-progress`, `tdd_phase` à `red`, `current_task` sur la première tâche, entrée ajoutée à `history`
6. **Guider** : première tâche à traiter et rappel TDD

```
═══════════════════════════════════════════════════════
         Prochaine story prête pour le développement
═══════════════════════════════════════════════════════

📖 US-012: Implémenter la page de profil utilisateur
   Epic: EPIC-003 (Gestion des utilisateurs)
   Points: 5
   Priorité: High

Critères d'acceptation (3) :
□ AC1: L'utilisateur peut consulter les informations de son profil
□ AC2: L'utilisateur peut modifier son nom et son email
□ AC3: Les modifications sont validées avant l'enregistrement

Tâches (4) :
□ TASK-031 [BE] Créer l'endpoint API du profil
□ TASK-033 [FE] Créer le composant de profil

Prérequis :
✅ Aucune dépendance bloquante
✅ Points de story estimés
✅ Tâches décomposées
✅ Critères d'acceptation définis

Dépendances :
✅ US-001 (Page de connexion) — done

Pour commencer :
  /project:backlog move story US-012 in-progress
Ou utiliser : /project:backlog next story --claim
═══════════════════════════════════════════════════════
```

Quand aucune story n'est prête, afficher l'état du backlog (stories en backlog à affiner, en cours, bloquées) et des suggestions : affiner les stories du backlog (`/project:migrate --stories`), aider sur les stories en cours, débloquer une story bloquée (afficher son `blocked_reason`), voir le graphe de dépendances (`/project:report deps`), voir le sprint (`/workflow:status`) et vérifier la préparation des stories (`/gate:check backlog`).

Après avoir réservé une story, suivre le TDD : 🔴 RED (test en échec pour le premier AC/la première tâche), 🟢 GREEN (code minimal pour passer), 🔵 REFACTOR (nettoyer, les tests restent verts), puis répéter pour chaque tâche. `tdd_phase` dans `.bmad/sprint-status.yaml` suit la phase.

Exemples : `/project:backlog next story`, `/project:backlog next story --claim`.

## move story

`/project:backlog move story US-XXX <statut> ["raison"]`

- **US-ID** (obligatoire) ; **Statut** (obligatoire) : `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`, ou `sprint-N` (affecte la story au sprint N, p. ex. `sprint-2`)
- **raison** (obligatoire pour `blocked`) : stockée dans `blocked_reason`

```
backlog → ready-for-dev → in-progress → review → done
                              ↑            │
                              └────────────┘  (modifications demandées)
tout statut → blocked → previous_status (reprise)
```

| De | Vers | Autorisé |
|----|------|----------|
| backlog | ready-for-dev | ✅ |
| ready-for-dev | in-progress | ✅ |
| in-progress | review | ✅ |
| review | done | ✅ |
| review | in-progress | ✅ (modifications demandées) |
| tout | blocked | ✅ (raison obligatoire) |
| blocked | previous_status | ✅ (reprise) |
| in-progress | done | ❌ **Interdit** (passer par `review`) |

Processus :

1. **Valider la story** : lire `.bmad/sprint-status.yaml`, trouver la story par ID, obtenir son statut actuel
2. **Valider la transition** selon le tableau ci-dessus ; sinon afficher les transitions valides depuis le statut actuel
3. **Vérifier les gates** du statut cible ; une gate en échec bloque la transition et liste les actions requises :

| → Cible | Exigences de la gate |
|---------|----------------------|
| `ready-for-dev` | Critères d'acceptation définis, points de story estimés, tâches décomposées |
| `in-progress` | Aucune dépendance bloquante, développeur assigné (optionnel) |
| `review` | Toutes les tâches terminées, tests au vert (TDD green ou refactor), code poussé |
| `done` | Code relu, tous les AC validés, checklist DoD complète |
| `blocked` | `blocked_reason` fourni |

4. **Exécuter la transition** : tout s'écrit dans `.bmad/sprint-status.yaml` (source unique de vérité du statut, schéma dans `.claude/templates/project/sprint-status.md`) ; les fichiers Markdown US/EPIC ne portent que le contenu et ne reçoivent jamais de statut :
   1. Stocker `previous_status` dans `stories.<US>`
   2. Mettre à jour `stories.<US>.status`
   3. Renseigner les horodatages
   4. Mettre à jour `stories.<US>.tdd_phase` si applicable
   5. Ajouter une entrée à `stories.<US>.history` (`timestamp`, `from`, `to`, `by`, `reason`)
5. **Appliquer les effets de bord** : `→ in-progress` : `tdd_phase: red`, `current_task` = première tâche | `→ review` : `tdd_phase: refactor`, effacer `current_task` | `→ done` : effacer `tdd_phase`, enregistrer l'heure d'achèvement | `→ blocked` : stocker `blocked_reason` et `previous_status`
6. **Appliquer les règles de routage** : après chaque transition, évaluer `routing.auto_transitions` (voir `move story --auto` ci-dessous) afin d'enchaîner les transitions dépendantes

```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "All tasks complete"
```

Transition réussie :

```
📖 US-005: Authentification utilisateur

Statut : in-progress → review ✅

Vérification des gates :
✅ Toutes les tâches terminées (5/5)
✅ Tests au vert
✅ Code poussé

Historique mis à jour :
• 2026-01-29 10:00 - in-progress → review (manual)
• 2026-01-27 09:00 - ready-for-dev → in-progress
```

Gate en échec :

```
📖 US-005: Authentification utilisateur

Demandé : in-progress → review ❌

Gates en échec :
❌ Tâches incomplètes : 3/5
❌ La phase TDD est 'red' - les tests doivent d'abord passer

Actions requises :
1. Terminer les tâches restantes (TASK-015, TASK-016)
2. Passer le TDD en phase green : .bmad/sprint-status.yaml → US-005: tdd_phase: green

Puis réessayer : /project:backlog move story US-005 review
```

Transition invalide : afficher le statut actuel et le statut demandé, la raison (`Impossible de passer directement de 'in-progress' à 'done'`), les transitions valides depuis le statut actuel et la machine à états.

Cas particuliers :

- **Bloquer** : `/project:backlog move story US-003 blocked "En attente des identifiants API"` stocke la raison et conserve le statut précédent pour la reprise
- **Débloquer** : `/project:backlog move story US-003 in-progress` revient au statut précédent
- **Modifications demandées** (review) : `/project:backlog move story US-005 in-progress`
- **Affecter à un sprint** : `/project:backlog move story US-003 sprint-2` affecte la story au sprint 2, crée le dossier du sprint si nécessaire ; le statut de la story est conservé
- **Cascade vers les tâches** : `→ in-progress` laisse les tâches dans leur statut actuel (démarrées individuellement) ; `→ done` vérifie que toutes les tâches sont `done` et avertit sinon ; `→ blocked` passe toutes les tâches en cours en `blocked`

Prochaines étapes selon le statut cible : `→ in-progress` : `/workflow:implement --story US-XXX` | `→ review` : `/gate:check story` (valider la DoD) | `→ done` : `/project:backlog next story` (et `/workflow:review` quand le sprint est terminé) | `→ blocked` : résoudre le blocage, puis `/project:backlog move story US-XXX in-progress`.

### move story --auto

`/project:backlog move story --auto [--dry-run]`

Évalue les règles de routage et fait transiter les stories en conséquence (sans ID de story). **--dry-run** prévisualise les transitions sans les appliquer. Les mêmes règles sont aussi appliquées après chaque transition `move story` et, selon les réglages de `routing.auto_transitions`, dans le hook Stop, après l'achèvement d'une tâche et au démarrage de session.

1. **Charger** : lire `.bmad/sprint-status.yaml`, charger `routing.auto_transitions.rules`, récupérer toutes les stories
2. **Évaluer** chaque règle pour chaque story :

| Règle | `when` | De → Vers |
|-------|--------|-----------|
| `all_tasks_complete` | `tasks.completed == tasks.total && tasks.total > 0` | `in-progress` → `review` |
| `review_approved` | `review.approved == true` | `review` → `done` |
| `blocked_detection` | `blocked_reason != null` | `*` → `blocked` |
| `unblocked` | `blocked_reason == null && previous_status != null` | `blocked` → `previous_status` |

3. **Vérifier les prérequis** avant la transition automatique : exigences de gate du statut cible (comme pour `move story`), aucune règle en conflit, story non verrouillée manuellement
4. **Exécuter** (sauf `--dry-run`) : journaliser la transition, mettre à jour le statut, l'enregistrer dans `history` avec `by: "auto-route"`, appliquer les effets de bord (phase TDD, etc.)
5. **Rapporter** : règles évaluées, stories vérifiées, transitions effectuées, stories inchangées, erreurs ou avertissements

```
═══════════════════════════════════════════════════════
         Aperçu du routage automatique (DRY RUN)
═══════════════════════════════════════════════════════
Évaluation de 4 règles de routage sur 8 stories...

Transitions prévues :
📖 US-005: Authentification utilisateur
   Règle : all_tasks_complete
   in-progress → review
   Raison : 5/5 tâches terminées

📖 US-003: Intégration OAuth
   Règle : unblocked
   blocked → in-progress
   Raison : blocked_reason effacé

Résumé :
Règles évaluées : 4 | Stories vérifiées : 8
Transitions prévues : 2 | Aucun changement : 6

Relancer sans --dry-run pour appliquer les transitions.
═══════════════════════════════════════════════════════
```

Sans `--dry-run`, le rapport liste `✅ US-005: in-progress → review` avec la règle et les détails, puis `Transitions effectuées : N`. Quand rien n'est déclenché : `Aucune transition automatique nécessaire.` suivi des stories par statut.

Les règles personnalisées et les déclencheurs se configurent dans `.bmad/sprint-status.yaml` :

```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
    rules:
      - name: "review_timeout"
        description: "Signaler les stories en review depuis plus de 2 jours"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify
      - name: "priority_bump"
        description: "Notifier les stories prêtes à haute priorité"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

Prochaines étapes : `/project:backlog next story` (choisir la prochaine story routée), `/workflow:implement` (démarrer le développement).

Exemples : `/project:backlog move story US-005 review`, `/project:backlog move story US-003 blocked "En attente d'une API externe"`, `/project:backlog move story --auto --dry-run`, `/project:backlog move story --auto`.
