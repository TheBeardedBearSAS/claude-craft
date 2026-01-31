# {BUG_ID}: [BUG] {TITEL}

## Metadata

- **ID**: {BUG_ID}
- **Typ**: bug
- **Quelle**: Recette {SESSION_ID}
- **Quellfehler**: {ERROR_ID}
- **Schweregrad**: {critical|high|medium|low}
- **Sprint**: {SPRINT}
- **Status**: backlog
- **Datum**: {DATE}

## Fehlerbeschreibung

**Aktuelles Verhalten**: {verfeinerte Beschreibung des beobachteten Verhaltens}

**Erwartetes Verhalten**: {Beschreibung des korrekten erwarteten Verhaltens}

## Reproduktionsschritte

1. {Schritt 1}
2. {Schritt 2}
3. {Schritt 3}

## Ursache

{Ursachenanalyse aus der Verfeinerung}

## Akzeptanzkriterien

### AC-1: Bug tritt nicht mehr auf

```gherkin
GIVEN {Kontext}
WHEN {Aktion die den Bug ausgeloest hat}
THEN {korrektes Verhalten}
```

### AC-2: Regressionstest besteht

```gherkin
GIVEN die Behebung ist vorhanden
WHEN die Regressions-Suite ausgefuehrt wird
THEN bestehen alle Tests
```

## Betroffene Dateien

- {Datei 1}
- {Datei 2}

## Screenshots

<!-- Screenshots aus der Recette-Sitzung wenn verfuegbar -->
<!-- Pfad: .recette/sessions/{SESSION_ID}/screenshots/ -->

## Definition of Done

- [ ] RED-Test geschrieben (reproduziert den Bug)
- [ ] GREEN-Behebung angewendet
- [ ] Refactoring durchgefuehrt
- [ ] Regressionstests generiert
- [ ] Regressionsregister aktualisiert
- [ ] Alle Tests bestehen
