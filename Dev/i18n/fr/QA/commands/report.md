---
description: Generer des rapports QA Recette a partir des donnees de session
argument-hint: --session=<session-id> [--format=<md|html|json>] [--output=<path>]
---

# QA Recette Report - Generation de Rapports

Genere des rapports detailles a partir des donnees de session QA Recette. Supporte plusieurs formats de sortie et la comparaison de sessions.

## Arguments

**$ARGUMENTS**

- `--session=<id>` : ID de session pour generer le rapport **[requis]**
- `--format=<type>` : Format de sortie (md, html, json) — defaut : md
- `--output=<path>` : Chemin de sortie personnalise (defaut : `.recette/reports/`)
- `--include-screenshots` : Integrer les captures d'ecran dans le rapport HTML
- `--compare=<id>` : Comparer avec une autre session pour un rapport de differences

## Fonctionnalites Cles

| Fonctionnalite | Description |
|----------------|-------------|
| **Multi-Format** | Generer des rapports Markdown, HTML ou JSON |
| **Comparaison de Sessions** | Comparer deux executions pour detecter les regressions |
| **Section Regle d'Or** | Section dediee a la conformite dans les rapports |
| **Integration de Captures** | Integrer les captures d'ecran d'erreurs dans les rapports HTML |
| **Tracabilite des Tests** | Tracabilite complete des AC aux resultats de tests |
| **Resume des Metriques** | Taux de reussite/echec, chronometrage, classification des erreurs |

## Processus

### 1. Collecte des Donnees

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Lire .recette/sessions/{id}/      │
│     - Charger state.yaml                │
│     - Charger fix-state.yaml si present │
│     - Collecter captures et logs        │
│     - Charger le registre de regression │
└─────────────────────────────────────────┘
```

### 2. Generation du Rapport

```
┌─────────────────────────────────────────┐
│  2. generate_report(format)             │
│     - Construire la section resume      │
│     - Construire les resultats de tests │
│     - Construire les details d'erreurs  │
│     - Construire les tests de regression│
│     - Construire la declaration Regle   │
│       d'Or                              │
│     - Appliquer le template de format   │
│     - Ecrire au chemin de sortie        │
└─────────────────────────────────────────┘
```

### 3. Mode Comparaison (--compare)

Compare deux sessions :

```
## Comparaison : REC-20260130-143022 vs REC-20260201-140000

| Metrique | Session 1 | Session 2 | Delta |
|----------|-----------|-----------|-------|
| Tests    | 15        | 15        | =     |
| Reussis  | 12        | 14        | +2    |
| Echoues  | 2         | 0         | -2    |
| Duree    | 14m 48s   | 12m 15s   | -2m 33s |

### Erreurs Resolues
- ERR-001 : Validation login — CORRIGE
- ERR-002 : Timeout API — CORRIGE

### Nouvelles Erreurs
(aucune)

### Statut de Regression
Aucune violation de la Regle d'Or detectee.
```

## Sources de Donnees

| Source | Chemin | Description |
|--------|--------|-------------|
| Etat de session | `.recette/sessions/{id}/state.yaml` | Resultats et progression |
| Etat de correction | `.recette/sessions/{id}/fix-state.yaml` | Statut des corrections |
| Captures d'ecran | `.recette/sessions/{id}/screenshots/` | Captures des erreurs |
| Logs | `.recette/sessions/{id}/logs/` | Logs d'execution |
| Registre | `.recette/regression/registry.yaml` | Registre de regression |
| Template | `Tools/Recette/templates/report.md.template` | Template de rapport |

## Exemples

```bash
# Generer un rapport Markdown (defaut)
/qa:recette-report --session=REC-20260130-143022

# Generer un rapport HTML avec captures
/qa:recette-report --session=REC-20260130-143022 --format=html --include-screenshots

# Generer un rapport JSON pour integration CI
/qa:recette-report --session=REC-20260130-143022 --format=json

# Chemin de sortie personnalise
/qa:recette-report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Comparer deux sessions
/qa:recette-report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

## Structure de Sortie

```
.recette/reports/
├── REC-20260130-143022-report.md       # Rapport Markdown
├── REC-20260130-143022-report.html     # Rapport HTML (si --format=html)
├── REC-20260130-143022-report.json     # Rapport JSON (si --format=json)
└── REC-20260201-vs-20260130-diff.md    # Rapport de comparaison (si --compare)
```

## Commandes Associees

| Commande | Description |
|----------|-------------|
| `/qa:recette` | Executer les tests d'acceptance |
| `/qa:recette-fix` | Corriger les bugs d'une session |
| `/qa:recette-status` | Afficher le statut de session |
| `/qa:recette-regression` | Voir les tests de regression |

## Messages d'Erreur

| Erreur | Solution |
|--------|----------|
| "Session introuvable" | Verifiez l'ID de session dans `.recette/sessions/` |
| "Aucun resultat de test" | La session n'a pas de tests completes pour le rapport |
| "Template introuvable" | Verifiez que `Tools/Recette/templates/` existe |
| "Session de comparaison introuvable" | Verifiez l'ID de la session de comparaison |

## Bonnes Pratiques

1. **Generez apres chaque execution** : Creez un rapport immediatement apres la recette
2. **Utilisez HTML pour les parties prenantes** : Le format HTML avec captures est ideal pour le partage
3. **Utilisez JSON pour la CI** : Integrez les rapports JSON dans votre pipeline CI/CD
4. **Comparez les executions** : Utilisez --compare pour suivre la progression entre iterations
5. **Archivez les rapports** : Conservez les rapports en controle de version pour la piste d'audit
