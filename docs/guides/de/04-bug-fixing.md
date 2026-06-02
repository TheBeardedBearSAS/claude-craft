# Leitfaden zur Fehlerbehebung

Dieser Leitfaden beschreibt den systematischen Ansatz zur Fehlerbehebung mit Claude-Craft – von der Diagnose bis zur Validierung.

---

## Inhaltsverzeichnis

1. [Workflow zur Fehlerbehebung](#workflow-zur-fehlerbehebung)
2. [Phase 1: Reproduzieren](#phase-1-reproduzieren)
3. [Phase 2: Diagnostizieren](#phase-2-diagnostizieren)
4. [Phase 3: Regressionstest schreiben](#phase-3-regressionstest-schreiben)
5. [Phase 4: Beheben](#phase-4-beheben)
6. [Phase 5: Validieren](#phase-5-validieren)
7. [Phase 6: Dokumentieren](#phase-6-dokumentieren)
8. [Hotfix-Verfahren](#hotfix-verfahren)
9. [Vollständiges Beispiel](#vollständiges-beispiel)

---

## Workflow zur Fehlerbehebung

Der systematische Ansatz zur Fehlerbehebung:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Reproduzieren│ --> │ 2. Diagnostizieren│ --> │ 3. Test     │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 6. Dokumentieren│ <-- │ 5. Validieren│ <-- │ 4. Beheben  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Warum dieser Ansatz?

1. **Erst reproduzieren**: Man kann nicht beheben, was man nicht sehen kann
2. **Test vor Korrektur**: Beweist, dass der Fehler existiert und behoben wurde
3. **Gründlich validieren**: Stellt sicher, dass keine Regression entsteht
4. **Dokumentieren**: Hilft, ähnliche Fehler zu vermeiden

---

## Phase 1: Reproduzieren

Bevor man mit der Behebung beginnt, muss der Fehler zuverlässig reproduziert werden.

### Informationen sammeln

Aus dem Fehlerbericht sammeln:
- Schritte zur Reproduktion
- Erwartetes Verhalten
- Tatsächliches Verhalten
- Umgebung (Version, Betriebssystem usw.)
- Fehlermeldungen/Protokolle
- Screenshots, falls zutreffend

### Reproduktionsumgebung erstellen

```bash
# Problematische Version auschecken
git checkout <commit-oder-tag>

# Identische Umgebung einrichten
make docker-up

# Mit exakten Schritten reproduzieren
```

### Reproduktion bestätigen

Lässt sich der Fehler konsistent auslösen?

- [ ] Fehler tritt mit den gemeldeten Schritten auf
- [ ] Fehler tritt in derselben Umgebung auf
- [ ] Fehler ist deterministisch (nicht zufällig)

### Wenn die Reproduktion nicht gelingt

```markdown
@research-assistant Hilf mir zu verstehen, warum dieser Fehler möglicherweise umgebungsspezifisch ist

Fehlerbericht:
- Benutzer sieht Fehler X beim Ausführen von Y
- Ich kann den Fehler lokal nicht reproduzieren
- Benutzer befindet sich in Umgebung Z

Mögliche Ursachen?
```

---

## Phase 2: Diagnostizieren

Die Grundursache des Fehlers finden.

### Analysebefehl verwenden

```bash
/common:analyze-bug "Benutzer können sich nach dem Passwort-Reset nicht mit richtigen Anmeldedaten anmelden"
```

Dieser Befehl wird:
1. Bereiche vorschlagen, die untersucht werden sollten
2. Mögliche Ursachen identifizieren
3. Debugging-Schritte empfehlen
4. Verwandte Codebereiche auflisten

### TDD-Coach für die Diagnose verwenden

```markdown
@tdd-coach Hilf mir, diesen Authentifizierungsfehler zu diagnostizieren

Symptome:
- Benutzer setzt Passwort erfolgreich zurück
- Neues Passwort wird gespeichert (in der Datenbank bestätigt)
- Anmeldung schlägt mit "Ungültige Anmeldedaten" fehl
- Altes Passwort funktioniert ebenfalls nicht

Was sollte ich untersuchen?
```

### Debugging-Techniken

#### Protokollierung hinzufügen

```php
// Temporäre Debug-Protokollierung
$this->logger->debug('Password verification', [
    'user_id' => $user->getId(),
    'stored_hash' => substr($user->getPasswordHash(), 0, 20) . '...',
    'verification_result' => $result,
]);
```

#### Datenbankzustand prüfen

```sql
-- Benutzerzustand nach Passwort-Reset prüfen
SELECT id, email, password_hash, updated_at
FROM users
WHERE email = 'user@example.com';
```

#### Ausführungspfad verfolgen

```php
// Stack-Trace an verdächtigen Stellen hinzufügen
debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
```

### Grundursache identifizieren

Häufige Kategorien:
- **Logikfehler**: Falsche Bedingung oder Berechnung
- **Zustandsfehler**: Falscher Datenzustand
- **Race Condition**: Zeitabhängiges Verhalten
- **Integrationsfehler**: Problem mit externem Dienst
- **Konfigurationsfehler**: Falsche Einstellungen

### Diagnose-Checkliste

- [ ] Fehler konsistent reproduziert
- [ ] Fehlerort identifiziert
- [ ] Grundursache verstanden
- [ ] Verwandte Codebereiche identifiziert
- [ ] Behebungsansatz festgelegt

---

## Phase 3: Regressionstest schreiben

Einen Test schreiben, der VOR der Korrektur fehlschlägt und NACH der Korrektur bestanden wird.

### Warum zuerst testen?

1. **Beweist, dass der Fehler existiert**: Test schlägt mit aktuellem Code fehl
2. **Beweist, dass die Korrektur funktioniert**: Test besteht nach der Korrektur
3. **Verhindert Regression**: Test erkennt künftige Regressionen
4. **Dokumentiert Verhalten**: Test beschreibt erwartetes Verhalten

### TDD-Coach verwenden

```markdown
@tdd-coach Hilf mir, einen Regressionstest für diesen Fehler zu schreiben

Fehler: Passwort-Reset aktualisiert den Passwort-Hash nicht korrekt

Erwartetes Verhalten:
- Benutzer beantragt Passwort-Reset
- Benutzer setzt neues Passwort
- Benutzer kann sich mit neuem Passwort anmelden

Tatsächliches Verhalten:
- Anmeldung schlägt nach Passwort-Reset fehl
```

### Beispiel für einen Regressionstest

```php
/**
 * @test
 * @see https://github.com/company/project/issues/123
 *
 * Bug: Benutzer konnten sich nach dem Passwort-Reset nicht anmelden
 * Grundursache: Passwort-Hash wurde nicht korrekt persistiert
 */
public function test_user_can_login_after_password_reset(): void
{
    // Arrange: Benutzer mit bekanntem Passwort erstellen
    $user = $this->createUser('user@example.com', 'old-password');

    // Act: Passwort zurücksetzen
    $this->passwordResetService->resetPassword($user, 'new-password');

    // Assert: Kann sich mit neuem Passwort anmelden
    $result = $this->authService->authenticate('user@example.com', 'new-password');

    $this->assertTrue($result->isSuccess());
    $this->assertNotNull($result->getToken());
}

/**
 * @test
 * Verwandt: Sicherstellen, dass altes Passwort nach Reset nicht mehr funktioniert
 */
public function test_old_password_fails_after_reset(): void
{
    $user = $this->createUser('user@example.com', 'old-password');

    $this->passwordResetService->resetPassword($user, 'new-password');

    $result = $this->authService->authenticate('user@example.com', 'old-password');

    $this->assertFalse($result->isSuccess());
}
```

### Checkliste für das Schreiben von Tests

- [ ] Test reproduziert den Fehler (schlägt vor Korrektur fehl)
- [ ] Test hat einen beschreibenden Namen
- [ ] Test referenziert die Issue-Nummer
- [ ] Test dokumentiert die Grundursache im Kommentar
- [ ] Verwandte Grenzfälle werden getestet

---

## Phase 4: Beheben

Die minimale Korrektur für den Fehler implementieren.

### Richtlinien für die Korrektur

1. **Minimale Änderung**: Nur den Fehler beheben, nicht refaktorieren
2. **Klare Absicht**: Code sollte zeigen, was falsch war
3. **Keine Nebenwirkungen**: Kein Ändern von unverknüpftem Verhalten
4. **Stil beibehalten**: Vorhandene Codemuster beibehalten

### Beispielkorrektur

```php
// VORHER (fehlerhaft)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    // Bug: persist/flush fehlt!
}

// NACHHER (behoben)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    $this->entityManager->persist($user);  // <-- Korrektur
    $this->entityManager->flush();          // <-- Korrektur
}
```

### Regressionstest ausführen

```bash
# Test sollte jetzt bestanden werden
make test-unit TEST=tests/Unit/PasswordResetTest.php

# Oder bestimmten Test ausführen
./vendor/bin/phpunit --filter test_user_can_login_after_password_reset
```

### Korrektur-Checkliste

- [ ] Regressionstest besteht jetzt
- [ ] Korrektur ist minimal und fokussiert
- [ ] Keine nicht zusammenhängenden Änderungen enthalten
- [ ] Codestil beibehalten

---

## Phase 5: Validieren

Sicherstellen, dass die Korrektur nichts anderes zerstört.

### Vollständige Test-Suite ausführen

```bash
# Alle Unit-Tests
make test-unit

# Alle Integrationstests
make test-integration

# Vollständige Test-Suite
make test
```

### Qualitätsprüfungen

```bash
# Codequalität (je nach Technologie)
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality

# Sicherheit (wenn die Korrektur sicherheitsrelevanten Code berührt)
/common:security-audit

# Vollständige Konformität
/symfony:check-compliance
```

### Manuelles Testen

Auch mit automatisierten Tests manuell überprüfen:

1. Originale Reproduktionsschritte des Fehlers ausführen
2. Bestätigen, dass der Fehler nicht mehr auftritt
3. Verwandte Funktionalität testen
4. Grenzfälle prüfen

### Reviewer-Agent verwenden

```markdown
@symfony-reviewer Überprüfe meine Fehlerkorrektur für Issue #123

Fehler: Benutzer konnten sich nach dem Passwort-Reset nicht anmelden
Korrektur: Fehlendes persist/flush in resetPassword() hinzugefügt

Geänderte Dateien:
- src/Application/Service/PasswordResetService.php
- tests/Unit/PasswordResetTest.php

Bitte prüfen:
1. Korrektur ist richtig und vollständig
2. Keine Nebenwirkungen
3. Testabdeckung ausreichend
```

### Validierungs-Checkliste

- [ ] Regressionstest besteht
- [ ] Alle vorhandenen Tests bestehen
- [ ] Statische Analyse besteht
- [ ] Manuelles Testen bestätigt die Korrektur
- [ ] Code-Review abgeschlossen

---

## Phase 6: Dokumentieren

Die Korrektur für künftige Referenz dokumentieren.

### Format der Commit-Nachricht

```
fix(auth): Login-Fehler nach Passwort-Reset beheben

Bug: Benutzer konnten sich nach dem Zurücksetzen ihres Passworts nicht anmelden
Grundursache: Passwort-Hash-Änderung wurde nicht in der Datenbank persistiert
Korrektur: persist()- und flush()-Aufrufe in PasswordResetService hinzugefügt

Closes #123

Test: test_user_can_login_after_password_reset
```

### Issue-Tracker aktualisieren

```markdown
## Lösung

**Grundursache:**
Die Methode `resetPassword()` in `PasswordResetService` hat den Passwort-Hash des Benutzers
im Speicher aktualisiert, aber die Änderung nicht in der Datenbank persistiert.

**Korrektur:**
`persist()`- und `flush()`-Aufrufe nach dem Setzen des neuen Passwort-Hashs hinzugefügt.

**Tests:**
- Regressionstest `test_user_can_login_after_password_reset` hinzugefügt
- Grenzfalltest `test_old_password_fails_after_reset` hinzugefügt

**Prävention:**
Erwägen, einen Punkt zur Code-Review-Checkliste für Persistenzoperationen hinzuzufügen.
```

### Wissensdatenbank-Eintrag (bei wiederkehrendem Muster)

```markdown
# Häufiger Fehler: Entity-Änderungen werden nicht persistiert

## Symptome
- Datenänderungen scheinen zu funktionieren (keine Fehler)
- Änderungen erscheinen nicht in der Datenbank
- Änderungen gehen nach Seitenaktualisierung verloren

## Grundursache
Fehlende `persist()`- und/oder `flush()`-Aufrufe in Doctrine.

## Korrektionsmuster
```php
$entity->setSomething($value);
$this->entityManager->persist($entity); // Nicht vergessen!
$this->entityManager->flush();
```

## Prävention
- Persistenzprüfung zur Code-Review-Checkliste hinzufügen
- Auto-Flush in Service-Basisklasse in Betracht ziehen
```

### Dokumentations-Checkliste

- [ ] Commit-Nachricht beschreibt Fehler und Korrektur
- [ ] Issue-Tracker mit Lösung aktualisiert
- [ ] Verwandte Dokumentation aktualisiert
- [ ] Wissensdatenbank-Eintrag bei wiederkehrendem Muster

---

## Hotfix-Verfahren

Für kritische Fehler in der Produktion.

### Hotfix-Workflow

```
1. Hotfix-Branch von Produktion erstellen
2. Minimale Korrektur anwenden
3. Gründlich testen
4. In Produktion deployen
5. Zurück in main mergen
```

### Schritt für Schritt

```bash
# 1. Hotfix-Branch erstellen
git checkout production
git checkout -b hotfix/issue-123-login-failure

# 2. Korrektur anwenden
# ... Änderungen vornehmen ...

# 3. Regressionstest schreiben
# ... Test hinzufügen ...

# 4. Verifizieren
make test
/symfony:check-compliance

# 5. Mit klarer Nachricht committen
git commit -m "fix(auth): Kritischen Login-Fehler nach Passwort-Reset beheben

HOTFIX für Produktionsproblem.
Grundursache: Passwort-Hash nach Reset nicht persistiert.

Closes #123"

# 6. PR zur Review erstellen
gh pr create --base production --title "HOTFIX: Login-Fehler nach Passwort-Reset"

# 7. Nach Merge deployen
# ... Deployment-Prozess ...

# 8. Zurück in main mergen
git checkout main
git merge hotfix/issue-123-login-failure
git push origin main
```

### Hotfix-Checkliste

- [ ] Hotfix-Branch von Produktion erstellt
- [ ] Nur minimale, fokussierte Korrektur
- [ ] Regressionstest hinzugefügt
- [ ] Alle Tests bestehen
- [ ] PR wurde überprüft und genehmigt
- [ ] In Produktion deployt
- [ ] In Produktion verifiziert
- [ ] Zurück in main gemergt

---

## Vollständiges Beispiel

Lassen Sie uns durch die Behebung eines echten Fehlers gehen.

### Fehlerbericht

```
Issue #456: Bestellsumme wird falsch berechnet

Reproduktionsschritte:
1. Artikel mit Preis $10.00, Menge 3 hinzufügen
2. Artikel mit Preis $5.50, Menge 2 hinzufügen
3. Warenkorb anzeigen

Erwartet: Gesamt = $41.00 (30 + 11)
Tatsächlich: Gesamt = $36.00

Umgebung: Produktion v2.3.1
Gemeldet von: Kundendienst
Priorität: Hoch
```

### Schritt 1: Reproduzieren

```php
// Schneller lokaler Test
$order = new Order();
$order->addItem(new Item('A', 10.00), 3);  // $30
$order->addItem(new Item('B', 5.50), 2);   // $11
echo $order->getTotal(); // Zeigt 36.00 – bestätigt!
```

### Schritt 2: Diagnostizieren

```markdown
@tdd-coach Hilf mir, den Fehler in der Bestellsummen-Berechnung zu finden

Die Summe sollte 41.00 sein, zeigt aber 36.00
Differenz ist 5.00, was genau dem Preis eines Artikels B entspricht

Hypothese: Menge für zweiten Artikel wird nicht berücksichtigt?
```

Untersuchung ergibt:

```php
// Fehler in Order::calculateTotal() gefunden
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // BUG: Verwendet 1 statt der tatsächlichen Artikelmenge!
        $total = $total->add($item->getPrice()->multiply(1));
    }
    return $total;
}
```

### Schritt 3: Regressionstest schreiben

```php
/**
 * @test
 * @see https://github.com/company/shop/issues/456
 *
 * Bug: Bestellsumme hat Artikelmengen ignoriert
 */
public function test_order_total_includes_all_quantities(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 3);  // $30
    $order->addItem($this->createItem(5.50), 2);   // $11

    $total = $order->calculateTotal();

    $this->assertEquals(41.00, $total->getAmount());
}

/**
 * @test
 * Grenzfall: Einzelner Artikel mit Menge > 1
 */
public function test_single_item_quantity_multiplied(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 5);

    $this->assertEquals(50.00, $order->calculateTotal()->getAmount());
}
```

Test ausführen – bestätigt, dass er fehlschlägt.

### Schritt 4: Beheben

```php
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // Korrigiert: Tatsächliche Menge aus dem Bestellartikel verwenden
        $total = $total->add(
            $item->getPrice()->multiply($item->getQuantity())
        );
    }
    return $total;
}
```

### Schritt 5: Validieren

```bash
# Regressionstest besteht
./vendor/bin/phpunit --filter test_order_total

# Alle Tests bestehen
make test

# Qualitätsprüfung
/symfony:check-compliance
# Score: 94/100 ✓
```

### Schritt 6: Dokumentieren

```bash
git commit -m "fix(order): Gesamtberechnung korrigieren, um Mengen zu berücksichtigen

Bug: Bestellsumme hat Artikelmengen ignoriert und immer 1 verwendet
Grundursache: Hartcodiertes multiply(1) statt multiply(quantity)
Korrektur: getQuantity() aus dem Bestellartikel in der Berechnung verwenden

Closes #456

Regressionstests hinzugefügt:
- test_order_total_includes_all_quantities
- test_single_item_quantity_multiplied"
```

---

## Tipps zur Fehlerprävention

1. **Zuerst Tests schreiben**: TDD verhindert viele Fehler
2. **Code-Review**: Frische Augen erkennen Probleme
3. **Statische Analyse**: Werkzeuge finden häufige Fehler
4. **Integrationstests**: Interaktionsfehler erkennen
5. **Produktion überwachen**: Probleme frühzeitig erkennen
6. **`/loop` verwenden**: Wiederkehrende Qualitätsprüfungen einrichten (z. B. `/loop 5m /common:pre-commit-check`)
7. **Erkenntnisse speichern**: `/memory` verwenden, um Fehlermuster über Sitzungen hinweg zu persistieren

---

[&larr; Feature-Entwicklung](03-feature-development.md) | [Werkzeug-Referenz &rarr;](05-tools-reference.md)
