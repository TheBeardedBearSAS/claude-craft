---
description: Tests d'acceptance automatises avec Claude in Chrome
argument-hint: --scope=<story|epic|sprint|task> --id=<target-id> [--resume|--record-gif|--dry-run]
---

# QA Recette - Tests d'Acceptance Automatises

Execute des tests d'acceptance automatises (recette) sur les applications web en utilisant Claude in Chrome pour l'automatisation navigateur. Ce systeme implemente la **Regle d'Or** : Un bug corrige ne doit JAMAIS reapparaitre.

## Arguments

**$ARGUMENTS**

- `--scope=<type>` : Perimetre de test (story, epic, sprint, task)
- `--id=<target-id>` : Identifiant cible (ex: US-001, EPIC-01, Sprint-3)
- `--resume=<session-id>` : Reprendre depuis une session precedente
- `--record-gif` : Enregistrer un GIF de l'execution
- `--dry-run` : Generer le plan sans executer les tests
- `--base-url=<url>` : Surcharger l'URL de base

## Fonctionnalites Cles

| Fonctionnalite | Description |
|----------------|-------------|
| **Plans Exhaustifs** | Genere des plans de test exhaustifs depuis les criteres d'acceptance |
| **Automatisation Navigateur** | Utilise Claude in Chrome pour des tests navigateur reels |
| **Reprise de Session** | Resume base sur des checkpoints pour les sessions interrompues |
| **Regle d'Or** | Generation automatique de tests de regression pour toutes les erreurs |
| **Documentation Vivante** | Maintient la documentation de test avec tracabilite |
| **Detection de Regressions** | Compare les executions pour detecter les regressions |

## Prerequis

1. **Extension Claude in Chrome** : Version 1.0.36 ou superieure
2. **Navigateur Chrome** : Ouvert avec l'extension active
3. **Claude Code** : Demarre avec le flag `--chrome` ou la commande `/chrome`

```bash
# Demarrer Claude Code avec support Chrome
claude --chrome

# Ou activer Chrome dans une session existante
/chrome
```

## Processus

### 1. Verification

La commande verifie d'abord que le MCP Chrome est disponible :

```
┌─────────────────────────────────────────┐
│  1. check_chrome_mcp()                  │
│     - MCP claude-in-chrome present ?    │
│     - Extension connectee ?             │
│     - Permissions site OK ?             │
└─────────────────────────────────────────┘
```

### 2. Generation du Plan de Test

Genere un plan de test complet couvrant :

| Categorie | Description |
|-----------|-------------|
| `acceptance_criteria_validation` | Tests pour chaque AC |
| `edge_cases` | Conditions limites |
| `error_scenarios` | Gestion des erreurs |
| `ui_ux_verification` | Coherence UI/UX |
| `performance_checks` | Temps de chargement |
| `security_basics` | XSS, CSRF, injection |

### 3. Execution des Tests

Chaque test est execute via Chrome :

```
Test TC-001
├── Etape 1: navigate → /login
├── Etape 2: type → #email = "user@test.com"
├── Etape 3: click → button[type='submit']
└── Assertions
    ├── url_matches → ^.*/dashboard$
    └── element_visible → .welcome-message
```

### 4. Erreur → Test → Regression

Quand une erreur est detectee :

```
1. Erreur detectee en recette
         │
         ▼
2. Classification (visual, interaction, validation, logic, security, API)
         │
         ▼
3. Generation de tests selon le type :
   - Logic/Validation → Test unitaire
   - API/Service → Test fonctionnel
   - Parcours utilisateur → Feature Behat
         │
         ▼
4. Ajout au registre de regression avec tag @regression
         │
         ▼
5. Correction du bug (workflow TDD)
         │
         ▼
6. Verification : tous les tests de regression passent
```

## Exemples Rapides

```bash
# Tester une story specifique
/qa:recette --scope=story --id=US-001

# Tester toutes les stories d'un sprint
/qa:recette --scope=sprint --id=Sprint-3

# Dry run pour voir le plan de test
/qa:recette --scope=story --id=US-001 --dry-run

# Reprendre une session interrompue
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022

# Enregistrer l'execution en GIF
/qa:recette --scope=story --id=US-001 --record-gif
```

## Reprise de Session

Les sessions sont sauvegardees apres chaque test :

```yaml
# .recette/sessions/{session-id}/state.yaml
session:
  id: "REC-20260130-143022"
  status: "paused"

progress:
  current_test_index: 5
  tests:
    total: 15
    passed: 4
    failed: 1
    pending: 10

recovery:
  resumable: true
  resume_from:
    test_id: "TC-005"
    step_index: 0
```

Pour reprendre :

```bash
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022
```

## Registre de Regression

Toutes les erreurs detectees sont tracees :

```yaml
# .recette/regression/registry.yaml
entries:
  - id: "REG-001"
    error_id: "ERR-001"
    source:
      scope: "story"
      target_id: "US-001"
    generated_tests:
      - type: "unit"
        path: "tests/Unit/Auth/LoginErrorTest.php"
      - type: "behat"
        path: "features/auth/login_error.feature"
    fix:
      status: "verified"
```

## Structure de Sortie

```
.recette/
├── plans/              # Plans de test (YAML)
│   └── story-US-001-plan.yaml
├── sessions/           # Etats de session
│   └── REC-20260130-143022/
│       ├── state.yaml
│       ├── screenshots/
│       ├── checkpoints/
│       └── logs/
├── regression/         # Suite de regression
│   ├── registry.yaml
│   └── tests/
│       ├── Unit/
│       ├── Functional/
│       └── Behat/
├── metrics/            # Donnees historiques
│   └── history.jsonl
└── reports/            # Rapports generes
    └── REC-20260130-143022-report.md
```

## Commandes Associees

| Commande | Description |
|----------|-------------|
| `/qa:recette-fix` | Corriger les bugs d'une session |
| `/qa:recette-status` | Afficher le statut de session |
| `/qa:recette-regression` | Voir les tests de regression |
| `/qa:recette-report` | Generer un rapport |
| `/qa:validate` | Valider les AC d'une story |
| `/qa:automate` | Creer des tests automatises |

## Capacites Chrome

| Categorie | Actions |
|-----------|---------|
| **Navigation** | navigate, back, forward, refresh |
| **Interaction** | click, type, fill_form, scroll, hover |
| **Lecture** | Etat DOM, texte element, attributs |
| **Debug** | Logs console, requetes reseau, erreurs |
| **Capture** | Screenshot, enregistrement GIF |

## Messages d'Erreur

| Erreur | Solution |
|--------|----------|
| "MCP non detecte" | Executez `claude --chrome` ou `/chrome` |
| "Extension non connectee" | Ouvrez Chrome, verifiez l'extension |
| "Permission requise" | Autorisez l'extension sur le domaine |
| "Version obsolete" | Mettez a jour l'extension Chrome vers v1.0.36+ |

## Bonnes Pratiques

1. **Commencez par dry-run** : Verifiez le plan de test avant execution
2. **Utilisez des scopes specifiques** : Testez les stories individuellement pour un meilleur suivi
3. **Examinez les regressions** : Consultez `.recette/regression/` apres chaque execution
4. **Activez l'enregistrement GIF** : Pour debugger les echecs complexes
5. **Maintenez l'URL de base** : Configurez dans le plan pour des tests coherents

## Prochaine étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si des bugs ont été trouvés :                           ║
║  → /qa:fix                                               ║
║    Correction automatisée des bugs                       ║
║  → /qa:tdd                                               ║
║    Correction avec approche TDD                          ║
║                                                          ║
║  Si tous les tests passent :                             ║
║  → /qa:report                                            ║
║    Générer le rapport de recette                         ║
║  → /sprint:transition done                               ║
║    Marquer la story comme terminée                       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
