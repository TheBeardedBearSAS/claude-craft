---
description: Correction automatisee des bugs identifies par la QA Recette
argument-hint: --session=<session-id> [--dry-run|--skip-fix|--severity=<level>|--auto-commit]
---

# QA Recette Fix - Correction Automatisee des Bugs

Complement de `/qa:recette`. Lit un rapport/session de recette, affine chaque erreur pour la rendre exploitable, genere les documents de project management (stories BMAD, backlog, sprint), puis lance la correction TDD pour chaque bug. Implemente la **Regle d'Or** : Un bug corrige ne doit JAMAIS reapparaitre.

## Arguments

**$ARGUMENTS**

- `--session=<id>` : ID de session recette (ex: REC-20260130-143022) **[requis]**
- `--dry-run` : Affiner les erreurs et generer les documents BMAD sans corriger
- `--severity=<level>` : Filtrer par severite minimum (critical, high, medium, low)
- `--skip-fix` : Generer uniquement les documents, pas de correction TDD
- `--auto-commit` : Commit automatique apres chaque bug corrige

## Fonctionnalites Cles

| Fonctionnalite | Description |
|----------------|-------------|
| **Affinage des Erreurs** | Analyse la cause racine, reproduit via Chrome si disponible |
| **Groupement Intelligent** | Deduplique les erreurs par cause racine commune |
| **Documents BMAD** | Genere des bug stories, met a jour backlog et sprint |
| **Correction TDD** | Workflow RED → GREEN → REFACTOR pour chaque bug |
| **Tests de Regression** | Generation automatique et mise a jour du registre |
| **Suivi de Progression** | fix-state.yaml pour reprise et monitoring |

## Processus en 7 Phases

```
Session recette (.recette/sessions/{id}/)
        |
        v
  Phase 1: Charger la session et les erreurs
        |
        v
  Phase 2: Affiner les descriptions d'erreurs
        |     - Reproduire via Chrome si besoin
        |     - Identifier la cause racine
        |     - Classifier severite
        |
        v
  Phase 3: Grouper par cause racine
        |     - Deduplication
        |     - Priorisation
        |
        v
  Phase 4: Generer les documents BMAD
        |     - Bug stories (US-XXX-bug-YYY)
        |     - Mise a jour backlog
        |     - Mise a jour sprint-status.yaml
        |
        v
  Phase 5: Correction TDD par bug
        |     - RED: test qui reproduit le bug
        |     - GREEN: correction minimale
        |     - REFACTOR: amelioration
        |
        v
  Phase 6: Verification
        |     - Tous les tests passent
        |     - Tests de regression generes
        |     - Registre regression mis a jour
        |
        v
  Phase 7: Rapport de synthese
```

### Phase 1 : Chargement de la Session

```
┌─────────────────────────────────────────┐
│  1. load_session(session_id)            │
│     - Lire .recette/sessions/{id}/      │
│     - Charger state.yaml                │
│     - Extraire les erreurs (failed)     │
│     - Charger screenshots/logs associes │
└─────────────────────────────────────────┘
```

### Phase 2 : Affinage des Erreurs

Pour chaque erreur detectee :

1. Relire le screenshot/log de l'erreur dans la session
2. Si le Chrome MCP est disponible : reproduire l'erreur pour confirmer
3. Analyser le code source pour identifier la cause racine
4. Reformuler la description avec : comportement actuel, comportement attendu, fichiers concernes, cause racine supposee

**Matrice de severite :**

| Type erreur | Impact utilisateur | Frequence | Severite |
|-------------|-------------------|-----------|----------|
| security | Tout | Toute | critical |
| logic | Bloquant | Toute | critical |
| logic | Non-bloquant | Frequente | high |
| validation | Bloquant | Toute | high |
| validation | Non-bloquant | Rare | medium |
| interaction | Tout | Toute | high |
| visual | Degradation majeure | Toute | medium |
| visual | Cosmetique | Toute | low |
| api | Erreur 5xx | Toute | critical |
| api | Erreur 4xx inattendue | Toute | high |

### Phase 3 : Groupement par Cause Racine

Plusieurs erreurs de recette peuvent avoir la meme cause racine :

- Erreur de validation formulaire + erreur d'affichage message = meme composant de validation
- Erreur API sur 3 endpoints = meme middleware d'authentification

Le groupement cree **une seule bug story** par cause racine au lieu d'une par erreur.

### Phase 4 : Generation des Documents BMAD

Pour chaque bug groupe :

1. Generer la bug story depuis le template `bug-story.md`
2. Ajouter au `.bmad/sprint-status.yaml` avec status `ready-for-dev`
3. Si un sprint est actif : ajouter au sprint courant
4. Sinon : ajouter au backlog

### Phase 5 : Correction TDD

Pour chaque bug story (par ordre de severite) :

```
┌──────────────────────────────────────────────┐
│  BUG-001 (critical)                          │
│                                              │
│  1. RED   : Ecrire test reproduisant le bug  │
│             → Executer → DOIT echouer        │
│                                              │
│  2. GREEN : Correction minimale du code      │
│             → Executer → DOIT passer         │
│             → Tous les tests → non-regression│
│                                              │
│  3. REFACTOR : Ameliorer si necessaire       │
│             → Generer test de regression     │
│             → Mettre a jour registre         │
│             → Mettre a jour fix-state.yaml   │
│                                              │
│  4. COMMIT (si --auto-commit)                │
│     fix({module}): {desc} [recette:{session}]│
└──────────────────────────────────────────────┘
```

**Types de tests generes selon la classification :**

| Type erreur | Test unitaire | Test fonctionnel | Feature Behat |
|-------------|:---:|:---:|:---:|
| logic | X | | |
| validation | X | X | |
| api | | X | |
| interaction | | | X |
| visual | | | X |
| security | X | X | |

### Phase 6 : Verification

1. Executer tous les tests du projet
2. Verifier que les tests de regression generes sont dans `.recette/regression/tests/`
3. Verifier que le registre `.recette/regression/registry.yaml` est a jour
4. Verifier que le fix-state.yaml reflete l'etat correct

### Phase 7 : Rapport de Synthese

Genere un rapport recapitulatif avec :

- Nombre total d'erreurs traitees
- Nombre de bugs groupes (apres deduplication)
- Corrections reussies / echouees / ignorees
- Tests de regression generes
- Commits effectues (si `--auto-commit`)

## Etat de Progression (fix-state.yaml)

```yaml
# .recette/sessions/{id}/fix-state.yaml
session_id: "REC-20260130-143022"
started_at: "2026-01-31T10:00:00"
status: "in-progress"  # pending | in-progress | completed | paused

errors:
  total: 8
  grouped: 5
  refined: 5
  fixed: 3
  skipped: 0
  remaining: 2

bugs:
  - id: "BUG-001"
    error_ids: ["ERR-001", "ERR-003"]
    severity: critical
    title: "Authentification echoue apres timeout session"
    story_id: "US-042-bug-001"
    status: "fixed"  # pending | refining | documented | fixing | fixed | skipped
    tdd_phase: "refactor"
    fix_commit: "abc1234"
    regression_test: "tests/Functional/Auth/SessionTimeoutTest.php"

  - id: "BUG-002"
    error_ids: ["ERR-002"]
    severity: high
    title: "Formulaire de contact n'affiche pas les erreurs"
    story_id: "US-042-bug-002"
    status: "fixing"
    tdd_phase: "green"
    fix_commit: null
    regression_test: null

current_bug: "BUG-002"
resume_from:
  bug_id: "BUG-002"
  phase: "green"
```

## Exemples

```bash
# Corriger tous les bugs d'une session recette
/qa:recette-fix --session=REC-20260130-143022

# Dry run : affiner et documenter sans corriger
/qa:recette-fix --session=REC-20260130-143022 --dry-run

# Corriger uniquement les bugs critiques et hauts
/qa:recette-fix --session=REC-20260130-143022 --severity=high

# Generer les documents BMAD sans lancer le TDD
/qa:recette-fix --session=REC-20260130-143022 --skip-fix

# Corriger avec commit automatique
/qa:recette-fix --session=REC-20260130-143022 --auto-commit
```

## Structure de Sortie

```
.recette/sessions/{session-id}/
├── state.yaml              # Etat de la session recette
├── fix-state.yaml          # Etat de progression des corrections
├── screenshots/            # Captures d'ecran des erreurs
└── logs/                   # Logs detailles

.bmad/stories/
├── US-042-bug-001.md       # Bug story BMAD
├── US-042-bug-002.md
└── ...

.recette/regression/
├── registry.yaml           # Registre mis a jour
└── tests/
    ├── Unit/
    ├── Functional/
    └── Behat/
```

## Commandes Associees

| Commande | Description |
|----------|-------------|
| `/qa:recette` | Executer les tests d'acceptance |
| `/qa:recette-status` | Afficher le statut de session |
| `/qa:recette-regression` | Voir les tests de regression |
| `/qa:recette-report` | Generer un rapport |

## Messages d'Erreur

| Erreur | Solution |
|--------|----------|
| "Session introuvable" | Verifiez l'ID de session dans `.recette/sessions/` |
| "Aucune erreur dans la session" | La session n'a pas d'erreurs a corriger |
| "Sprint-status.yaml introuvable" | Initialisez BMAD avec `/bmad:init` |
| "Test RED n'echoue pas" | Le bug n'est peut-etre plus present, verifier manuellement |

## Bonnes Pratiques

1. **Commencez par dry-run** : Verifiez les erreurs affinee et les documents avant correction
2. **Priorisez par severite** : Commencez par les bugs critiques
3. **Validez les groupements** : Verifiez que les erreurs groupees partagent bien la meme cause
4. **Revoyez les stories** : Verifiez les bug stories generees avant de lancer le TDD
5. **Utilisez auto-commit** : Pour garder un historique propre des corrections

## Prochaine étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Re-tester après les corrections                       ║
║                                                          ║
║  Voir aussi :                                            ║
║  • /qa:regression — Vérifier les tests de régression     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
