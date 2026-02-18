---
description: Bugfix im TDD/BDD-Modus
argument-hint: [arguments]
---

# Bugfix im TDD/BDD-Modus

Sie sind ein Senior-Entwickler mit Expertise in TDD (Test-Driven Development) und BDD (Behavior-Driven Development). Sie müssen einen Bug strikt nach der TDD/BDD-Methodologie beheben: Zuerst einen fehlschlagenden Test schreiben, der den Bug reproduziert, dann den Code beheben, damit der Test besteht.

## Argumente
$ARGUMENTS

Argumente:
- Bug-Beschreibung oder Ticket-Link
- (Optional) Betroffene Datei oder Modul

Beispiel: `/qa:tdd "Benutzer kann sich nicht abmelden"` oder `/qa:tdd #123`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## MISSION

### TDD/BDD-Philosophie

```
ROT → GRÜN → REFACTOR

1. ROT    : Fehlschlagenden Test schreiben (Bug reproduzieren)
2. GRÜN   : Minimalen Code schreiben, damit Test besteht
3. REFACTOR : Code verbessern ohne Tests zu brechen
```

### Schritt 1: Bug verstehen

#### Informationen sammeln
- Präzise Beschreibung des aktuellen Verhaltens
- Erwartetes Verhalten
- Reproduktionsschritte
- Betroffene Umgebung
- Verfügbare Logs/Stack Traces

#### Zu stellende Fragen
1. Was ist das aktuelle Verhalten?
2. Was sollte das korrekte Verhalten sein?
3. Wann wurde der Bug eingeführt? (git bisect falls notwendig)
4. Was sind die Edge Cases?
5. Gibt es bestehende Tests, die diesen Bug hätten erkennen sollen?

### Schritt 2: ROT - Fehlschlagenden Test schreiben

#### BDD-Format (Gherkin-Stil)

```gherkin
Feature: [Betroffene Funktion]
  Als [Benutzertyp]
  Möchte ich [Aktion]
  Um [Nutzen]

  Szenario: [Bug-Fall-Beschreibung]
    Gegeben sei [Kontext/Ausgangszustand]
    Wenn [Aktion, die Bug auslöst]
    Dann [erwartetes Verhalten, das aktuell nicht eintritt]
```

#### Unit Test

```python
# Python - pytest
class TestBugFix:
    """
    Bug: [Kurzbeschreibung]
    Ticket: #XXX

    Aktuelles Verhalten: [was passiert]
    Erwartetes Verhalten: [was passieren sollte]
    """

    def test_should_[erwartetes_verhalten]_when_[bedingung](self):
        # Arrange - Kontext vorbereiten
        # ...

        # Act - Aktion ausführen, die Bug verursacht
        # ...

        # Assert - Erwartetes Verhalten überprüfen
        # Dieser Test MUSS vor dem Fix fehlschlagen
        assert result == expected_value
```

```typescript
// TypeScript - Jest
describe('Bug #XXX: [Beschreibung]', () => {
  /**
   * Aktuelles Verhalten: [was passiert]
   * Erwartetes Verhalten: [was passieren sollte]
   */
  it('should [erwartetes verhalten] when [bedingung]', () => {
    // Arrange
    const input = prepareTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert - Dieser Test MUSS vor dem Fix fehlschlagen
    expect(result).toBe(expectedValue);
  });
});
```

```php
// PHP - PHPUnit
/**
 * @testdox Bug #XXX: [Bug-Beschreibung]
 */
class BugFixTest extends TestCase
{
    /**
     * Aktuelles Verhalten: [was passiert]
     * Erwartetes Verhalten: [was passieren sollte]
     *
     * @test
     */
    public function it_should_expected_behavior_when_condition(): void
    {
        // Arrange
        $input = $this->prepareTestData();

        // Act
        $result = $this->service->methodUnderTest($input);

        // Assert - Dieser Test MUSS vor dem Fix fehlschlagen
        $this->assertEquals($expectedValue, $result);
    }
}
```

```dart
// Dart - Flutter test
group('Bug #XXX: [Beschreibung]', () {
  /// Aktuelles Verhalten: [was passiert]
  /// Erwartetes Verhalten: [was passieren sollte]
  test('should [erwartetes verhalten] when [bedingung]', () {
    // Arrange
    final input = prepareTestData();

    // Act
    final result = functionUnderTest(input);

    // Assert - Dieser Test MUSS vor dem Fix fehlschlagen
    expect(result, equals(expectedValue));
  });
});
```

### Schritt 3: Test-Fehlschlag überprüfen

```bash
# Spezifischen Test ausführen
# Python
pytest tests/test_bug_xxx.py -v

# JavaScript/TypeScript
npm test -- --testPathPattern="bug-xxx"

# PHP
./vendor/bin/phpunit --filter "it_should_expected_behavior"

# Flutter
flutter test test/bug_xxx_test.dart
```

**WICHTIG**: Der Test MUSS in diesem Stadium fehlschlagen. Falls der Test besteht, bedeutet das:
- Der Test reproduziert den Bug nicht korrekt
- Der Bug wurde bereits behoben
- Der Test ist schlecht geschrieben

### Schritt 4: GRÜN - Bug beheben (Minimaler Code)

#### Prinzipien
1. MINIMALEN Code schreiben, damit Test besteht
2. Keine anderen Fälle antizipieren
3. Noch nicht refactorn
4. Code einfach halten

#### Prozess
1. Grundursache identifizieren
2. Minimalen Fix implementieren
3. Test erneut ausführen
4. Sicherstellen, dass Test besteht

```bash
# Test nach Fix erneut ausführen
# Der Test MUSS jetzt bestehen
```

### Schritt 5: Nicht-Regression überprüfen

```bash
# ALLE bestehenden Tests ausführen
# Python
pytest

# JavaScript/TypeScript
npm test

# PHP
./vendor/bin/phpunit

# Flutter
flutter test

# ALLE Tests müssen bestehen
```

### Schritt 6: REFACTOR - Code verbessern

#### Refactoring-Checkliste
- [ ] Ist der Code lesbar?
- [ ] Gibt es Duplikation?
- [ ] Sind Namen aussagekräftig?
- [ ] Tut die Funktion nur eine Sache?
- [ ] Respektiert der Code Projektkonventionen?

#### Nach jeder Änderung
```bash
# Tests nach jedem Refactoring erneut ausführen
# Tests müssen immer bestehen
```

### Schritt 7: Ergänzende Tests hinzufügen

#### Abzudeckende Edge Cases
```python
class TestBugFixEdgeCases:
    """Ergänzende Tests für Edge Cases."""

    def test_with_empty_input(self):
        """Verhalten mit leerer Eingabe überprüfen."""
        pass

    def test_with_null_input(self):
        """Verhalten mit null überprüfen."""
        pass

    def test_with_maximum_values(self):
        """Verhalten an Grenzen überprüfen."""
        pass

    def test_with_special_characters(self):
        """Verhalten mit Sonderzeichen überprüfen."""
        pass
```

### Schritt 8: Dokumentation

#### Kommentar im Test
```python
def test_logout_clears_session_bug_123(self):
    """
    Regressionstest für Bug #123.

    Problem: Benutzersession wurde beim Logout nicht gelöscht, was
             Zugriff auf geschützte Ressourcen nach Logout ermöglichte.

    Grundursache: Session.destroy() wurde im Logout-Handler nicht aufgerufen.

    Fix: Session.destroy()-Aufruf vor Redirect hinzugefügt.

    Datum: 2024-01-15
    Autor: developer@example.com
    """
```

#### Commit-Nachricht
```
fix(auth): session beim logout löschen (#123)

- Regressionstest für Logout-Bug hinzufügen
- Session.destroy() im Logout-Handler aufrufen
- Überprüfen, dass Session vor Redirect gelöscht wird

Fixes #123
```

### Abschlussbericht

```
══════════════════════════════════════════════════════════════
🐛 BUGFIX-BERICHT - TDD/BDD
══════════════════════════════════════════════════════════════

Ticket: #XXX
Beschreibung: [Bug-Beschreibung]

──────────────────────────────────────────────────────────────
📋 ANALYSE
──────────────────────────────────────────────────────────────

Aktuelles Verhalten:
[Was passierte]

Erwartetes Verhalten:
[Was passieren sollte]

Grundursache:
[Warum der Bug auftrat]

──────────────────────────────────────────────────────────────
🔴 TEST GESCHRIEBEN (ROT)
──────────────────────────────────────────────────────────────

Datei: tests/test_xxx.py
Test: test_should_xxx_when_yyy

```python
def test_should_xxx_when_yyy(self):
    # ... Test-Code
```

Erstes Ergebnis: ❌ FAIL
Nachricht: AssertionError: expected X but got Y

──────────────────────────────────────────────────────────────
🟢 FIX (GRÜN)
──────────────────────────────────────────────────────────────

Geänderte Datei: src/module/file.py
Zeilen: 45-52

```python
# Vorher
def problematic_function():
    # fehlerhafter Code

# Nachher
def problematic_function():
    # korrigierter Code
```

Ergebnis nach Fix: ✅ PASS

──────────────────────────────────────────────────────────────
♻️ REFACTORING
──────────────────────────────────────────────────────────────

- [x] Code vereinfacht
- [x] Variable zur Klarheit umbenannt
- [x] Duplikation entfernt

──────────────────────────────────────────────────────────────
✅ TESTS
──────────────────────────────────────────────────────────────

| Test | Status |
|------|--------|
| test_should_xxx_when_yyy (neu) | ✅ |
| test_existing_1 | ✅ |
| test_existing_2 | ✅ |
| ... | ✅ |

Gesamt: XX Tests, 0 Fehler

──────────────────────────────────────────────────────────────
📝 COMMIT
──────────────────────────────────────────────────────────────

```
fix(module): kurze beschreibung (#XXX)

- Regressionstest hinzufügen
- Grundursache beheben
- Edge-Case-Tests hinzufügen

Fixes #XXX
```

──────────────────────────────────────────────────────────────
🎯 POST-FIX-AKTIONEN
──────────────────────────────────────────────────────────────

- [ ] PR erstellt
- [ ] Code Review angefordert
- [ ] Dokumentation aktualisiert
- [ ] Ticket geschlossen
```

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                   NÄCHSTER SCHRITT                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Nach Korrekturen erneut testen                        ║
║                                                          ║
║  Siehe auch:                                             ║
║  • /common:pre-commit-check — Vor dem Commit validieren  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
