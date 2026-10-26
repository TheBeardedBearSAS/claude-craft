---
description: "Migration ponctuelle d'un backlog existant vers BMAD v6 (analyse, migration, complétion des stories, resynchronisation)"
argument-hint: "[--analyze|--dry-run|--resync|--stories] [--force]"
---

# Migrer le backlog

Migration ponctuelle d'un backlog existant vers l'organisation BMAD v6, avec `.bmad/sprint-status.yaml` comme source de vérité unique pour le statut des stories et des tâches (schéma : `.claude/templates/project/sprint-status.md`). Une seule commande couvre quatre modes : analyse, migration, complétion des champs manquants des stories et resynchronisation du contenu.

## Usage

| Invocation | Action | Remplace |
|------------|--------|----------|
| `/project:migrate --analyze` | Rapport uniquement : structure, scores INVEST, écarts BMAD v6. N'écrit rien | `analyze-backlog` |
| `/project:migrate` | Par défaut : migre le backlog et crée `.bmad/sprint-status.yaml` | `migrate-backlog` |
| `/project:migrate --stories [story-id]` | Complète les champs manquants des stories (tâches, CA, historique, INVEST) | `update-stories` |
| `/project:migrate --resync` | Réconcilie le contenu et les IDs entre le markdown et le YAML | `sync-backlog` |
| `--dry-run` | Prévisualisation uniquement, valable pour tous les modes | - |
| `--force` | Écrase les fichiers BMAD existants (mode migration) | - |

## Arguments

$ARGUMENTS (format : [--analyze|--dry-run|--resync|--stories] [--force])
- **--analyze** : mode analyse (lecture seule)
- **--stories** : `story-id` optionnel (ex. US-001) ; s'il est omis, toutes les stories sont traitées
- **--resync** : mode réconciliation
- **--dry-run** : affiche les changements prévus, n'écrit rien
- **--force** : écrase un `sprint-status.yaml` et des fichiers BMAD existants
- Les modes sont mutuellement exclusifs ; sans aucun d'eux, la migration par défaut s'exécute.

## Règles communes

- **Emplacement du backlog**, recherché dans l'ordre : `project-management/backlog/` (standard), `docs/backlog/`, `backlog/`, `.bmad/` (déjà migré).
- **Source de vérité unique** : le statut vit uniquement dans `.bmad/sprint-status.yaml`. Le markdown ne contient que le contenu (titre, description, CA, points, parents).
- **Statuts hérités** : la migration initiale est le SEUL moment où les statuts/emojis markdown hérités sont lus ; ils sont déplacés dans le YAML puis retirés du markdown. `--resync` et `--stories` ne copient jamais un statut depuis le markdown.
- **Plan mode obligatoire** pour la migration par défaut, `--stories` et `--resync` (hors `--dry-run`) : Claude analyse l'impact, propose un plan et attend votre validation avant toute modification.
- **Ordre conseillé** : `--analyze` d'abord, puis la migration, puis `--stories` ; utiliser `--resync` ensuite quand le contenu dérive.

## --analyze

Rapport uniquement, aucun fichier n'est modifié.

1. **Détecter** l'emplacement du backlog (voir règles communes).
2. **Identifier** les epics (`EPIC-*.md`, `epic*.md`), les user stories (`US-*.md`, `story*.md`), les tâches (`TASK-*.md` ou intégrées aux stories) et les fichiers d'index (`index.md`, `backlog.md`, `README.md`).
3. **Analyser** par fichier : ID, titre, statut hérité (🔴 To Do, 🟡 In Progress, 🟢 Done, ⏸️ Blocked), sprint, story points, parents (US → EPIC, TASK → US), nombre de CA, nombre de tâches et avancement.
4. **Score INVEST** par story (0-6) : Independent (aucune dépendance bloquante), Negotiable (a une description), Valuable (bénéfice énoncé), Estimable (a des points), Small (≤ 8 points), Testable (a des CA).
5. **Écarts BMAD v6** : suivi de la phase TDD, liste de tâches avec avancement, historique des statuts, affectation à un sprint, statut de validation des CA.
6. **Rapport** : résumé (compteurs), structure (arborescence), tableau INVEST, tableau des écarts de migration (champ / % de stories concernées / action), recommandations.

```
📊 Rapport d'analyse du backlog
Emplacement : project-management/backlog/ | Epics : {N} | Stories : {N} | Tâches : {N}

| Story  | Titre | INVEST | Manquant  |
|--------|-------|--------|-----------|
| US-001 | Login | 5/6    | Estimable |

Écarts de migration : tdd_phase 100% | tasks.list 60% | history 100%
Suite : /project:migrate
```

## Par défaut : migration

1. **Valider** : créer `.bmad/` si besoin ; avertir si `sprint-status.yaml` existe sans `--force` ; l'analyse devrait avoir été exécutée.
2. **Créer la structure** : `.bmad/sprint-status.yaml`, `batch-queue.yaml`, `gates/`, `hooks/`, `lib/`.
3. **Analyser** chaque story : métadonnées, CA (Gherkin), tâches liées, statut hérité, avancement.
4. **Convertir les statuts hérités** dans le YAML :

   | Origine | Statut BMAD v6 |
   |---------|----------------|
   | 🔴 To Do | backlog |
   | 🟡 In Progress | in-progress |
   | 🟢 Done | done |
   | ⏸️ Blocked | blocked |
   | Affectée à Sprint-X | ready-for-dev |

5. **Phase TDD initiale** : 0 % de tâches terminées → `red` ; 1-99 % → `green` ; 100 % → `refactor` ou `done`.
6. **Générer `sprint-status.yaml`**, une entrée par story :

   ```yaml
   stories:
     US-001:
       title: "User login"
       status: "in-progress"
       previous_status: "ready-for-dev"
       tdd_phase: "red"
       current_task: "TASK-001"
       story_points: 5
       epic_id: "EPIC-001"
       tasks:
         total: 4
         completed: 2
         list:
           - { id: "TASK-001", title: "Backend auth endpoint", status: "in-progress", type: "BE" }
       acceptance_criteria: { total: 3, validated: 1 }
       history:
         - { timestamp: "2026-01-29T10:00:00Z", from: "backlog", to: "in-progress", by: "migration", reason: "BMAD v6 migration" }
   ```

7. **Sauvegarde** (hors `--dry-run`) : copier le backlog dans `.bmad/backup/` (horodaté) et consigner son emplacement.
8. **Appliquer** (hors `--dry-run`) : écrire le YAML, retirer les emojis/champs de statut des fichiers markdown, créer `.bmad/migration-log.md`.

Dry run : liste les fichiers qui seraient créés (ex. `.bmad/sprint-status.yaml`), le nombre de stories/tâches/CA qui seraient migrées, et se termine par « Run without --dry-run to apply changes. ».

Retour arrière : `tar -xzf .bmad/backup/backlog-*.tar.gz -C project-management/ && rm .bmad/sprint-status.yaml`.

Étapes suivantes : relire le YAML, lancer `/workflow:status`, renseigner les métadonnées du sprint (dates, objectifs), vérifier les quality gates avec `/gate:check all`.

## --stories

Complète les champs BMAD v6 manquants des stories existantes (toutes, ou une seule via `story-id`).

1. **Charger** `.bmad/sprint-status.yaml` et les fichiers de stories ; les comparer.
2. **Champs manquants** et valeurs par défaut :

   | Champ | Requis | Défaut si absent |
   |-------|--------|------------------|
   | tdd_phase | Oui | "red" si in-progress, "" sinon |
   | tasks.list / total / completed | Oui | Extraire de `## Tasks`, compter, compter les terminées |
   | current_task | Non | Première tâche in-progress |
   | history | Oui | Entrée initiale avec le statut courant (`by: "migrate"`) |
   | acceptance_criteria.total / validated | Oui | Compter dans la section CA / 0 |
   | story_points | Oui | Demander à l'utilisateur s'il manque |
   | epic_id | Non | Extraire du fichier |

3. **Analyser les tâches** du tableau `## Tasks` de la story et les **CA** des blocs Gherkin `### ACn:` pour alimenter `tasks.list` et `acceptance_criteria.list` (ids, titres). Les statuts de tâches et de CA ne vont dans le YAML que pour les entrées pas encore suivies ; un statut déjà présent dans le YAML n'est jamais écrasé par le markdown.
4. **INVEST** : ajouter `invest_score` (independent, negotiable, valuable, estimable, small, testable, total).
5. **Mettre à jour** `sprint-status.yaml` en fusionnant les champs ; ajouter éventuellement un commentaire de métadonnées aux fichiers de stories (`<!-- BMAD v6 Metadata … -->` avec `tdd_phase`, `invest_score`, `last_sync`).

Sortie : tableau des stories mises à jour (champs ajoutés, score INVEST), récapitulatif par champ (ajoutés / ignorés), avertissements (ex. « US-003 : story points manquants », « US-007 : aucun critère d'acceptation »), fichiers modifiés. Corriger ensuite les avertissements, puis lancer `/project:migrate --resync` et `/gate:check backlog`.

## --resync

Réconcilie le contenu et les IDs entre les fichiers markdown et le YAML. Le statut n'est jamais synchronisé : le YAML fait foi.

1. **Charger** les deux sources et construire une table de comparaison par ID de story.
2. **Détecter les écarts** de contenu : stories manquantes, titres, story points, listes de tâches, CA, affectation.
3. **Résoudre** : le YAML fait autorité pour le statut, la phase TDD, l'historique et l'état des tâches ; le markdown fait autorité pour les titres, descriptions, textes des CA et points. Demander à l'utilisateur quand les deux ont modifié le même champ de contenu.
4. **Fichiers → YAML** : ajouter les stories présentes uniquement dans les fichiers ; mettre à jour titres, points, listes de tâches et de CA.
5. **YAML → fichiers** : rafraîchir le commentaire de métadonnées (phase TDD, historique, score INVEST, horodatage de synchronisation) ; ne jamais écrire un statut dans le markdown.
6. **Orphelins** : dans le YAML mais pas dans les fichiers → marquer `archived` ou avertir ; dans les fichiers mais pas dans le YAML → ajouter au YAML (statut `backlog`).
7. **Horodatages** : `last_sync` dans le YAML et `<!-- last_sync: … -->` dans les fichiers de stories.

Sortie : changements fichiers → YAML, changements YAML → fichiers, conflits résolus, orphelins (archivés / ajoutés), heure de dernière synchronisation. Relire ensuite `git diff` et lancer `/workflow:status`.

Automatisation : un hook pre-commit peut exécuter `/project:migrate --resync` (`.bmad/hooks/pre-commit.sh`).

## Exemples

```
/project:migrate --analyze
/project:migrate --dry-run
/project:migrate
/project:migrate --force
/project:migrate --stories US-001
/project:migrate --stories --dry-run
/project:migrate --resync --dry-run
```
