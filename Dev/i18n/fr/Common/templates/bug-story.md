# {BUG_ID}: [BUG] {TITRE}

## Metadata

- **ID**: {BUG_ID}
- **Type**: bug
- **Source**: Recette {SESSION_ID}
- **Erreur source**: {ERROR_ID}
- **Severite**: {critical|high|medium|low}
- **Sprint**: {SPRINT}
- **Status**: backlog
- **Date**: {DATE}

## Description du Bug

**Comportement actuel**: {description affinee du comportement observe}

**Comportement attendu**: {description du comportement correct attendu}

## Etapes de Reproduction

1. {etape 1}
2. {etape 2}
3. {etape 3}

## Cause Racine

{analyse de la cause racine identifiee lors de l'affinage}

## Criteres d'Acceptance

### AC-1: Le bug ne se reproduit plus

```gherkin
GIVEN {contexte}
WHEN {action qui declenchait le bug}
THEN {comportement correct}
```

### AC-2: Test de regression passe

```gherkin
GIVEN le correctif est en place
WHEN la suite de regression est executee
THEN tous les tests passent
```

## Fichiers Concernes

- {fichier 1}
- {fichier 2}

## Captures d'Ecran

<!-- Screenshots de la session recette si disponibles -->
<!-- Chemin: .recette/sessions/{SESSION_ID}/screenshots/ -->

## Definition of Done

- [ ] Test RED ecrit (reproduit le bug)
- [ ] Correction GREEN appliquee
- [ ] Refactoring effectue
- [ ] Tests de regression generes
- [ ] Registre regression mis a jour
- [ ] Tous les tests passent
