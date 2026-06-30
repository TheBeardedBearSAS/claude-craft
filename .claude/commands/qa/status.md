---
description: "Afficher le statut et la progression des sessions QA Recette"
argument-hint: "[--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>]"
---

# QA Recette Status - Statut et Progression des Sessions

Affiche le statut et la progression des sessions QA Recette. Consultez les details d'une session individuelle ou listez toutes les sessions avec filtrage.

## Arguments

**$ARGUMENTS**

- `--session=<id>` : Afficher le statut detaille d'une session specifique (ex: REC-20260130-143022)
- `--all` : Lister toutes les sessions avec resume
- `--scope=<type>` : Filtrer par perimetre (story, sprint)
- `--status=<status>` : Filtrer par statut (running, completed, paused, failed)
- `--format=<type>` : Format de sortie (table, yaml, json) — defaut : table
- `--watch` : Mode rafraichissement en direct (toutes les 5 secondes)

## Fonctionnalites Cles

| Fonctionnalite | Description |
|----------------|-------------|
| **Liste des Sessions** | Lister toutes les sessions avec statut, progression et dates |
| **Vue Detaillee** | Session unique avec repartition des tests, erreurs, chronometrage |
| **Barres de Progression** | Indicateurs visuels de progression pour les sessions en cours |
| **Filtrage** | Filtrer par perimetre, statut ou plage de dates |
| **Mode Direct** | Mode watch pour le suivi en temps reel |
| **Etat de Correction** | Affiche le statut fix-state.yaml si recette-fix a ete execute |

## Processus

### 1. Decouverte des Sessions

```
┌─────────────────────────────────────────┐
│  1. scan_sessions()                     │
│     - Lire .recette/sessions/           │
│     - Charger state.yaml par session    │
│     - Charger fix-state.yaml si present │
│     - Appliquer les filtres             │
└─────────────────────────────────────────┘
```

### 2. Liste des Sessions (--all)

Affiche un tableau recapitulatif :

```
┌──────────────────────┬────────┬──────────┬───────────┬──────────┬────────────┐
│ ID Session           │ Scope  │ Cible    │ Statut    │ Progres  │ Date       │
├──────────────────────┼────────┼──────────┼───────────┼──────────┼────────────┤
│ REC-20260130-143022  │ story  │ US-001   │ completed │ 15/15    │ 2026-01-30 │
│ REC-20260131-091500  │ sprint │ Sprint-3 │ paused    │ 8/23     │ 2026-01-31 │
│ REC-20260201-140000  │ story  │ US-005   │ running   │ 3/10     │ 2026-02-01 │
└──────────────────────┴────────┴──────────┴───────────┴──────────┴────────────┘
```

### 3. Detail d'une Session (--session=<id>)

Affiche les informations completes :

```
Session:  REC-20260130-143022
Statut:   completed
Scope:    story → US-001
Debut:    2026-01-30 14:30:22
Fin:      2026-01-30 14:45:10
Duree:    14m 48s

Tests:
  Total:   15
  Reussis: 12  ████████████░░░  80%
  Echoues:  2  ██░░░░░░░░░░░░░  13%
  Ignores:  1  █░░░░░░░░░░░░░░   7%

Erreurs:
  - ERR-001: Validation formulaire login non affichee (visual)
  - ERR-002: Timeout API sur /api/users (api)

Tests de Regression Generes: 3
Etat de Correction: completed (2/2 bugs corriges)
```

## Sources de Donnees

| Source | Chemin | Description |
|--------|--------|-------------|
| Etat de session | `.recette/sessions/{id}/state.yaml` | Progression et resultats des tests |
| Etat de correction | `.recette/sessions/{id}/fix-state.yaml` | Progression des corrections |
| Captures d'ecran | `.recette/sessions/{id}/screenshots/` | Captures des erreurs |
| Logs | `.recette/sessions/{id}/logs/` | Logs d'execution detailles |

## Exemples

```bash
# Lister toutes les sessions
/qa:recette-status --all

# Afficher le statut detaille d'une session
/qa:recette-status --session=REC-20260130-143022

# Filtrer les sessions en cours
/qa:recette-status --all --status=running

# Filtrer par perimetre
/qa:recette-status --all --scope=sprint

# Suivi en direct d'une session
/qa:recette-status --session=REC-20260130-143022 --watch

# Sortie en YAML
/qa:recette-status --session=REC-20260130-143022 --format=yaml

# Sortie en JSON (pour scripting)
/qa:recette-status --all --format=json
```

## Structure de Sortie

```
.recette/
├── sessions/
│   ├── REC-20260130-143022/
│   │   ├── state.yaml          # Etat de session (lu par cette commande)
│   │   ├── fix-state.yaml      # Progression corrections (si recette-fix execute)
│   │   ├── screenshots/
│   │   ├── checkpoints/
│   │   └── logs/
│   └── REC-20260131-091500/
│       ├── state.yaml
│       └── ...
```

## Commandes Associees

| Commande | Description |
|----------|-------------|
| `/qa:recette` | Executer les tests d'acceptance |
| `/qa:recette-fix` | Corriger les bugs d'une session |
| `/qa:recette-regression` | Voir les tests de regression |
| `/qa:recette-report` | Generer un rapport |

## Messages d'Erreur

| Erreur | Solution |
|--------|----------|
| "Aucune session trouvee" | Executez `/qa:recette` d'abord pour creer une session |
| "Session introuvable" | Verifiez l'ID de session dans `.recette/sessions/` |
| "Aucune session correspondant au filtre" | Ajustez les criteres de filtrage |

## Bonnes Pratiques

1. **Utilisez --all d'abord** : Obtenez une vue d'ensemble avant de plonger dans une session
2. **Surveillez avec --watch** : Utilisez le mode direct pour les sessions en cours
3. **Verifiez l'etat de correction** : Confirmez que les bugs ont ete corriges apres recette-fix
4. **Utilisez JSON pour l'automatisation** : Dirigez la sortie JSON vers d'autres outils
5. **Filtrez par statut** : Concentrez-vous sur les sessions en pause/echec qui necessitent attention
