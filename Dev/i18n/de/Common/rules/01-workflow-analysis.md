# Obligatorischer Analyse-Workflow

## Grundprinzip

**VOR jeder Codeänderung (Feature, Bugfix, Refactoring) ist eine gründliche Analysephase OBLIGATORISCH.**

Diese Regel ist KRITISCH und NICHT VERHANDELBAR. Sie vermeidet:
- Regressionen
- Unerwartete Seiteneffekte
- Technische Schulden
- Bugs in der Produktion

---

## Prozess in 4 Schritten

### Schritt 1: Die Anforderung verstehen

**Zu stellende Fragen:**
1. Was ist das genaue Ziel?
2. Was sind die Akzeptanzkriterien?
3. Gibt es Einschränkungen (Leistung, Sicherheit, Compliance)?
4. Welche Auswirkung hat es auf den Benutzer?

**Aktionen:**
- Die Anforderung zur Validierung umformulieren
- Betroffene Use Cases identifizieren
- Übereinstimmung mit den Geschäftszielen prüfen

### Schritt 2: Bestehenden Code analysieren

**OBLIGATORISCH zu lesende Dateien:**
1. Die direkt von der Änderung betroffenen Dateien
2. Die abhängigen Dateien (die den geänderten Code verwenden)
3. Die bestehenden Tests (um das erwartete Verhalten zu verstehen)
4. Die Schema-Migrationen (bei Auswirkung auf die Datenbank)

**Aufmerksamkeitspunkte:**
- Werden Tests fehlschlagen?
- Gibt es andere Module, die von diesem Code abhängen?
- Entspricht der Code der Projektarchitektur?
- Gibt es sensible Daten?

### Schritt 3: Die Analyse dokumentieren

**Obligatorischer Inhalt:**

1. **Ziel**: Klare Beschreibung der Änderung
2. **Betroffene Dateien**: Vollständige Liste mit Begründung
3. **Auswirkungen**:
   - Breaking Changes: ja/nein
   - DB-Migration erforderlich: ja/nein
   - Leistungsauswirkung: ja/nein
   - Sensible Daten: ja/nein
4. **Risiken**: Liste + Gegenmaßnahmen
5. **Ansatz**: Implementierungsstrategie (TDD, schrittweises Refactoring, etc.)
6. **TDD-Tests**: Liste der VOR der Implementierung zu schreibenden Tests

**Beispiel:**

```markdown
## Analyse: Hinzufügen einer Benachrichtigungsfunktion

### Ziel
Eine E-Mail-Benachrichtigung bei der Erstellung einer Bestellung senden.

### Betroffene Dateien
- OrderService (Event-Dispatch hinzufügen)
- NotificationListener (neu)
- EmailService (vorhandene Nutzung)
- Unit-Tests für den Listener

### Auswirkungen
- Breaking Change: NEIN
- DB-Migration: NEIN
- Leistung: Gering (async empfohlen)
- Sensible Daten: Benutzer-E-Mail (bereits verwaltet)

### Risiken
1. E-Mail-Überlastung → Gegenmaßnahme: Async-Queue
2. E-Mail im Spam → Gegenmaßnahme: DKIM/SPF-Konfiguration

### Ansatz
1. TDD: Tests des Listeners schreiben
2. Listener implementieren
3. Event aus OrderService dispatchen
4. Integrations-Test

### TDD-Tests
1. test_should_send_email_on_order_created()
2. test_should_not_send_if_user_opted_out()
3. test_should_handle_email_failure_gracefully()
```

### Schritt 4: Validierung

**Entscheidungskriterien:**

| Auswirkung | Aktion |
|------------|--------|
| **Gering** (1 Datei, kein Breaking Change, < 1h) | Direkt fortfahren |
| **Mittel** (2-5 Dateien, DB-Migration, < 4h) | Mit dem Benutzer validieren |
| **Hoch** (> 5 Dateien, Breaking Changes, Architektur-Refactoring) | Detaillierte Planung + obligatorische Validierung |

**Validierungsfragen:**
- Entspricht der Ansatz der Projektarchitektur?
- Sind die TDD-Tests ausreichend?
- Gibt es eine einfachere Alternative (KISS)?
- Sind die Risiken akzeptabel?

---

## Zu vermeidende Anti-Patterns

### Codieren ohne bestehenden Code zu lesen

```
// SCHLECHT: Änderung ohne Verständnis der Auswirkung
function updateOrder(order) {
  order.status = "confirmed"  // Auswirkung auf andere Module?
}
```

### Abhängigkeiten ignorieren

```
// SCHLECHT: Änderung ohne zu prüfen, wer diese Methode verwendet
function getPrice() {
  return this.price * 0.8  // Wer ruft getPrice() auf?
}
```

### Tests vergessen

```
// SCHLECHT: Keine Prüfung der bestehenden Tests
// Wenn ich User ändere, welche Tests werden fehlschlagen?
```

### Sicherheit ignorieren

```
// SCHLECHT: Sensibles Feld ohne Schutz hinzufügen
class User {
  socialSecurityNumber: string  // Sensible Daten!
}
```

---

## Schnell-Checkliste

Vor jeder Änderung:

- [ ] Ich habe die Anforderung gelesen und verstanden
- [ ] Ich habe die betroffenen Dateien gelesen
- [ ] Ich habe die Abhängigkeiten identifiziert
- [ ] Ich habe die Analyse dokumentiert
- [ ] Ich habe die Risiken bewertet
- [ ] Ich habe die TDD-Tests definiert
- [ ] Ich habe den Ansatz validiert (bei mittlerer/hoher Auswirkung)
- [ ] Ich habe die Konformität mit Architektur + SOLID geprüft
- [ ] Ich habe die Sicherheit bei sensiblen Daten geprüft

---

## Visueller Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    ANFRAGE ERHALTEN                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             SCHRITT 1: VERSTEHEN                             │
│  - Genaues Ziel?                                             │
│  - Akzeptanzkriterien?                                       │
│  - Einschränkungen?                                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             SCHRITT 2: ANALYSIEREN                            │
│  - Betroffene Dateien lesen                                  │
│  - Abhängigkeiten identifizieren                             │
│  - Bestehende Tests prüfen                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             SCHRITT 3: DOKUMENTIEREN                          │
│  - Betroffene Dateien                                        │
│  - Risiken + Gegenmaßnahmen                                  │
│  - Zu schreibende TDD-Tests                                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             SCHRITT 4: VALIDIEREN                             │
│  - Geringe Auswirkung → Fortfahren                           │
│  - Mittlere/hohe Auswirkung → Validierung anfordern          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    IMPLEMENTIEREN                             │
│  1. Tests schreiben (RED)                                    │
│  2. Code implementieren (GREEN)                              │
│  3. Refactoring (REFACTOR)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Zugehörige Vorlagen

- `templates/analysis.md` - Detaillierte Analyse-Vorlage
- `checklists/new-feature.md` - Checkliste neues Feature
- `checklists/refactoring.md` - Checkliste Refactoring

---

**Datum der letzten Aktualisierung:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
