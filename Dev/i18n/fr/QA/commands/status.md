---
description: "Afficher le statut et la progression des sessions QA Recette, ou générer des rapports (--report)"
argument-hint: "[--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>] [--report] [--format=<md|html|json>] [--output=<path>] [--compare=<id>]"
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
- `--report` : Mode rapport (ancien `/qa:status --report`) : générer un rapport à partir d'une session ; nécessite `--session=<id>`
- `--format=<type>` : avec `--report` : md, html, json (défaut : md)
- `--output=<path>` : avec `--report` : chemin de sortie personnalisé (défaut : `.recette/reports/`)
- `--include-screenshots` : avec `--report` : intégrer les captures d'écran dans le rapport HTML
- `--compare=<id>` : avec `--report` : comparer avec une autre session pour un différentiel de régression

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

## Utilisation

| Mode / option | Ce que cela fait | Remplace |
|---|---|---|
| `/qa:status --all` / `--session=<id>` | Lister les sessions ou afficher le détail d'une session | — |
| `/qa:status --report --session=<id>` | Générer un rapport Markdown/HTML/JSON (`--format`, `--output`, `--include-screenshots`) | `/qa:status --report` |
| `/qa:status --report --session=<id> --compare=<id>` | Comparer deux sessions pour détecter les régressions | `/qa:status --report --compare` |

## Mode Rapport (--report)

Génère des rapports détaillés à partir des données de session. Sortie multi-format (Markdown, HTML, JSON), section de conformité à la Golden Rule, intégration des captures d'écran, traçabilité des critères d'acceptation vers les tests et métriques de réussite/échec. Sans `--format`, le rapport est en Markdown.

### Processus du Rapport

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Read .recette/sessions/{id}/      │
│     - Load state.yaml                   │
│     - Load fix-state.yaml if present    │
│     - Collect screenshots and logs      │
│     - Load regression registry          │
├─────────────────────────────────────────┤
│  2. generate_report(format)             │
│     - Build summary, test results,      │
│       error details, regression tests   │
│     - Build Golden Rule statement       │
│     - Apply format template             │
│     - Write to output path              │
└─────────────────────────────────────────┘
```

### Structure du Rapport

```markdown
# QA Recette Report — REC-20260130-143022

## Summary
| Metric | Value |
|--------|-------|
| Session | REC-20260130-143022 |
| Scope | story → US-001 |
| Duration | 14m 48s |
| Passed / Failed / Skipped | 12 (80%) / 2 (13%) / 1 (7%) |

## Test Results
### Failed Tests (2)
- TC-008: Login validation error display ✗ (ERR-001)

## Error Details
### ERR-001: Login validation not displayed
- Type: visual · Severity: medium · Screenshot: screenshots/err-001.png

## Regression Tests Generated
| ID | Error | Test Type | Path |
|----|-------|-----------|------|
| REG-001 | ERR-001 | behat | features/auth/login_validation.feature |

## Golden Rule Compliance
All detected errors have generated regression tests.
Registry updated: .recette/regression/registry.yaml
```

### Comparaison (--compare)

Compare deux exécutions : écarts de métriques, erreurs résolues, nouvelles erreurs et violations de la Golden Rule.

```
## Comparison: REC-20260130-143022 vs REC-20260201-140000

| Metric | Session 1 | Session 2 | Delta |
|--------|-----------|-----------|-------|
| Passed | 12 | 14 | +2 |
| Failed | 2 | 0 | -2 |

### Resolved Errors / New Errors / Regression Status
```

### Sources de données du rapport

| Source | Chemin | Description |
|---|---|---|
| Registre | `.recette/regression/registry.yaml` | Registre des tests de régression |
| Modèle | `Tools/Recette/templates/report.md.template` | Modèle de rapport |

### Erreurs du rapport

| Erreur | Solution |
|---|---|
| "Template not found" | Vérifier que `Tools/Recette/templates/` existe |
| "Compare session not found" | Vérifier l'identifiant de la session à comparer |
| "No test results" | La session n'a aucun test terminé à rapporter |

### Exemples de Rapport

```bash
# Générer un rapport Markdown (par défaut)
/qa:status --report --session=REC-20260130-143022

# Générer un rapport HTML avec captures d'écran
/qa:status --report --session=REC-20260130-143022 --format=html --include-screenshots

# Générer un rapport JSON pour l'intégration CI
/qa:status --report --session=REC-20260130-143022 --format=json

# Chemin de sortie personnalisé
/qa:status --report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Comparer deux sessions
/qa:status --report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

### Structure de Sortie du Rapport

```
.recette/reports/
├── REC-20260130-143022-report.md       # Markdown report
├── REC-20260130-143022-report.html     # HTML report (if --format=html)
├── REC-20260130-143022-report.json     # JSON report (if --format=json)
└── REC-20260201-vs-20260130-diff.md    # Comparison report (if --compare)
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
/qa:status --all

# Afficher le statut detaille d'une session
/qa:status --session=REC-20260130-143022

# Filtrer les sessions en cours
/qa:status --all --status=running

# Filtrer par perimetre
/qa:status --all --scope=sprint

# Suivi en direct d'une session
/qa:status --session=REC-20260130-143022 --watch

# Sortie en YAML
/qa:status --session=REC-20260130-143022 --format=yaml

# Sortie en JSON (pour scripting)
/qa:status --all --format=json
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
| `/qa:fix` | Corriger les bugs d'une session |
| `/qa:regression` | Voir les tests de regression |
| `/qa:status --report` | Générer un rapport (`--report`) |

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

## Prochaine étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si la session a des échecs :                            ║
║  → /qa:fix                                               ║
║    Corriger les bugs identifiés                          ║
║                                                          ║
║  Si la session est terminée :                            ║
║  → /qa:status --report                                   ║
║    Générer le rapport de recette                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
