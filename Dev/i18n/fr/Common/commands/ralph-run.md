---
description: Executer Claude en boucle continue jusqu'a completion (Ralph Wiggum)
argument-hint: <description-tache> [--auto|--full]
---

# Ralph Run - Boucle Continue d'Agent IA

Executer Claude en boucle continue jusqu'a ce que la tache soit complete ou que les criteres de Definition of Done (DoD) soient remplis.

## Arguments

**$ARGUMENTS**

- `<description-tache>` : La tache a accomplir par Claude
- `--auto` : Detection automatique maximale, questions minimales
- `--full` : Mode complet avec toutes les verifications DoD

## Processus

### 1. Initialisation de Session

1. **Verifier les prerequis** :
   - Verifier que Claude est disponible
   - Rechercher la configuration `ralph.yml`
   - Initialiser le repertoire de session (`.ralph/`)

2. **Charger la configuration** :
   - Lire `ralph.yml` ou `.claude/ralph.yml`
   - Definir iterations max, timeouts, criteres DoD

### 2. Boucle Principale

```
┌─────────────────────────────────────────────────────────────┐
│  BOUCLE RALPH                                                │
│                                                              │
│  while (iterations < max && !DoD_valide) {                   │
│      1. Verifier le disjoncteur                              │
│      2. Invoquer Claude avec le prompt actuel                │
│      3. Traiter la sortie                                    │
│      4. Valider la Definition of Done                        │
│      5. Creer un checkpoint (commit git)                     │
│      6. Si DoD non valide, utiliser la reponse comme prompt  │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 3. Validation Definition of Done

Le systeme DoD valide la completion via plusieurs criteres :

| Validateur | Description |
|------------|-------------|
| `command` | Executer commande shell (tests, lint, build) |
| `output_contains` | Verifier pattern dans sortie Claude |
| `file_changed` | Verifier que des fichiers ont ete modifies |
| `hook` | Executer un hook Claude existant |
| `human` | Validation humaine interactive |

Exemple DoD dans `ralph.yml` :

```yaml
definition_of_done:
  checklist:
    - id: tests
      name: "Tous les tests passent"
      type: command
      command: "docker compose exec app npm test"
      required: true

    - id: completion
      name: "Claude signale la completion"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

### 4. Disjoncteur (Circuit Breaker)

Mecanisme de securite pour eviter les boucles infinies :

| Declencheur | Seuil | Action |
|-------------|-------|--------|
| Pas de changement fichiers | 3 iterations | Stop |
| Erreurs repetees | 5 iterations | Stop |
| Declin de sortie | 70% | Stop |
| Max iterations | 25 (defaut) | Stop |

### 5. Checkpointing

Des checkpoints Git sont crees apres chaque iteration pour :
- **Recuperation** : Restaurer un etat precedent si necessaire
- **Historique** : Suivre la progression a travers les iterations
- **Revue** : Inspecter ce qui a change a chaque etape

## Sortie

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Boucle Continue d'Agent IA            ║
╚════════════════════════════════════════════════════════════╝

✓ Session creee : ralph-1704067200-a1b2

ℹ Demarrage de la boucle Ralph...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteration 1 sur 25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Invocation de Claude...
ℹ Verification des criteres DoD...
  ✓ [tests] Tous les tests passent - OK
  ✓ [lint] Pas d'erreurs lint - OK
  ✓ [completion] Claude signale completion - OK

  Tous les criteres requis sont valides !

✓ DoD VALIDE

╔════════════════════════════════════════════════════════════╗
║     📊 Resume de la Session                                 ║
╚════════════════════════════════════════════════════════════╝

  ID de session :      ralph-1704067200-a1b2
  Iterations totales : 3
  Duree :              45s
  Statut DoD :         VALIDE
  Raison de sortie :   dod_complete
```

## Configuration

Creer `ralph.yml` a la racine du projet :

```yaml
version: "1.0"

session:
  max_iterations: 25
  timeout: 600000

circuit_breaker:
  enabled: true
  no_file_changes_threshold: 3

definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Bonnes Pratiques

1. **Description claire** : Fournir des taches specifiques et actionnables
2. **Configurer le DoD** : Definir les criteres de completion dans `ralph.yml`
3. **Utiliser TDD** : Ecrire les tests d'abord, laisser Ralph implementer
4. **Surveiller la progression** : Observer les sorties d'iteration
5. **Limites raisonnables** : Ajuster max_iterations selon la complexite

## Voir aussi

- `@ralph-conductor` - Agent pour l'orchestration Ralph
- `/common:fix-bug-tdd` - Correction de bugs en TDD
- `/project:sprint-dev` - Developpement sprint avec TDD
