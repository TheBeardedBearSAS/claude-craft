---
description: Voir et gerer le registre de tests de regression QA Recette
argument-hint: [--list|--stats|--check] [--status=<active|verified|obsolete>] [--source=<story-id>]
---

# QA Recette Regression - Registre de Tests de Regression

Voir et gerer le registre de tests de regression. Parcourir les tests enregistres, verifier les scores de stabilite et detecter les violations de la Regle d'Or. Implemente la **Regle d'Or** : Un bug corrige ne doit JAMAIS reapparaitre.

## Arguments

**$ARGUMENTS**

- `--list` : Lister tous les tests de regression du registre
- `--stats` : Afficher le score de stabilite et l'analyse de tendance
- `--check` : Executer les tests de regression et detecter les violations
- `--status=<status>` : Filtrer par statut (active, verified, obsolete)
- `--source=<id>` : Filtrer par story/sprint source (ex: US-001)
- `--trend` : Afficher les donnees de tendance historiques
- `--format=<type>` : Format de sortie (table, yaml, json) — defaut : table

## Fonctionnalites Cles

| Fonctionnalite | Description |
|----------------|-------------|
| **Parcours du Registre** | Lister tous les tests de regression avec metadonnees |
| **Score de Stabilite** | Score de 0-100 base sur le taux de reussite des tests |
| **Analyse de Tendance** | Tendance historique de la stabilite de regression |
| **Verification Regle d'Or** | Alerte sur les echecs de tests de regression |
| **Filtrage par Source** | Filtrer les tests par story ou sprint d'origine |
| **Gestion des Statuts** | Suivre les tests actifs, verifies et obsoletes |

## Processus

### 1. Chargement du Registre

```
┌─────────────────────────────────────────┐
│  1. load_registry()                     │
│     - Lire .recette/regression/         │
│       registry.yaml                     │
│     - Charger les metadonnees           │
│     - Appliquer les filtres             │
└─────────────────────────────────────────┘
```

### 2. Liste du Registre (--list)

```
┌──────────┬─────────────────────────────────┬──────────┬──────────────────────────────┬──────────┐
│ ID       │ Erreur                          │ Source   │ Chemin du Test               │ Statut   │
├──────────┼─────────────────────────────────┼──────────┼──────────────────────────────┼──────────┤
│ REG-001  │ Validation login non affichee   │ US-001   │ tests/Unit/Auth/LoginTest.php │ verified │
│ REG-002  │ Timeout API sur /api/users      │ US-001   │ tests/Func/Api/UsersTest.php  │ active   │
│ REG-003  │ Erreur calcul total panier      │ US-015   │ tests/Unit/Cart/TotalTest.php │ active   │
└──────────┴─────────────────────────────────┴──────────┴──────────────────────────────┴──────────┘
```

### 3. Score de Stabilite (--stats)

```
Score de Stabilite de Regression : 94/100

  Repartition :
    Tests actifs :    12
    Tests verifies :   8
    Tests obsoletes :  2
    Total :           22

  5 dernieres executions :
    ████████████████████  100% (2026-02-01)
    ████████████████░░░░   88% (2026-01-31)
    ████████████████████  100% (2026-01-30)
    ████████████████████  100% (2026-01-29)
    ██████████████░░░░░░   75% (2026-01-28)

  Tendance : ↑ En amelioration (+6 pts sur 5 executions)
```

### 4. Verification Regle d'Or (--check)

```
Verification Regle d'Or : 1 VIOLATION DETECTEE

  ⚠ REG-002 : Timeout API sur /api/users
    Source :  US-001
    Test :    tests/Functional/Api/UsersTest.php
    Statut :  EN ECHEC (passait le 2026-01-30)
    Action :  Bug reapparu — correction immediate requise

  ✓ REG-001 : Validation login — REUSSI
  ✓ REG-003 : Total panier — REUSSI
  ...

  Resume : 11/12 tests actifs reussis (91.7%)
```

## Sources de Donnees

| Source | Chemin | Description |
|--------|--------|-------------|
| Registre | `.recette/regression/registry.yaml` | Tous les tests de regression enregistres |
| Tests | `.recette/regression/tests/` | Fichiers de tests generes |
| Historique | `.recette/metrics/history.jsonl` | Donnees historiques d'execution |

## Exemples

```bash
# Lister tous les tests de regression
/qa:recette-regression --list

# Afficher le score de stabilite
/qa:recette-regression --stats

# Executer la verification de regression (detecter les violations)
/qa:recette-regression --check

# Filtrer par story source
/qa:recette-regression --list --source=US-001

# Filtrer par statut
/qa:recette-regression --list --status=active

# Afficher la tendance historique
/qa:recette-regression --stats --trend

# Sortie en JSON
/qa:recette-regression --list --format=json
```

## Structure de Sortie

```
.recette/regression/
├── registry.yaml          # Registre des tests de regression
└── tests/
    ├── Unit/              # Tests de regression unitaires
    ├── Functional/        # Tests de regression fonctionnels
    └── Behat/             # Features de regression Behat

.recette/metrics/
└── history.jsonl          # Donnees historiques pour l'analyse de tendance
```

## Commandes Associees

| Commande | Description |
|----------|-------------|
| `/qa:recette` | Executer les tests d'acceptance |
| `/qa:recette-fix` | Corriger les bugs d'une session |
| `/qa:recette-status` | Afficher le statut de session |
| `/qa:recette-report` | Generer un rapport |

## Messages d'Erreur

| Erreur | Solution |
|--------|----------|
| "Registre introuvable" | Executez `/qa:recette` d'abord pour generer un registre |
| "Aucun test de regression" | Aucune erreur detectee lors des executions precedentes |
| "Violation de la Regle d'Or" | Un bug est reapparu — executez `/qa:recette-fix` |
| "Fichier historique manquant" | Executez au moins 2 sessions recette pour les tendances |

## Bonnes Pratiques

1. **Verifiez regulierement** : Executez `--check` avant chaque deploiement
2. **Surveillez les tendances** : Utilisez `--stats --trend` pour suivre la stabilite
3. **Corrigez les violations immediatement** : Les violations indiquent des bugs reintroduits
4. **Nettoyez les tests obsoletes** : Marquez comme obsoletes les tests de fonctionnalites supprimees
5. **Filtrez par source** : Examinez les tests de regression par story pour une analyse ciblee

## Prochaine étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Lancer une nouvelle session de recette                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
