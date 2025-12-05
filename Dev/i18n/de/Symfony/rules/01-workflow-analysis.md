# Verpflichtender Analyse-Workflow

## Grundprinzip

**VOR jeder Codeänderung (Feature, Bugfix, Refactoring) ist eine gründliche Analysephase VERPFLICHTEND.**

Diese Regel ist KRITISCH und NICHT VERHANDELBAR. Sie vermeidet:
- Regressionen
- Unerwartete Seiteneffekte
- Technische Schulden
- Bugs in der Produktion

## 4-Schritte-Prozess

### Schritt 1: Anforderung verstehen

**Zu stellende Fragen:**
1. Was ist das genaue Ziel?
2. Was sind die Akzeptanzkriterien?
3. Gibt es Einschränkungen (Performance, Sicherheit, DSGVO)?
4. Welche Auswirkungen hat es auf den Benutzer?

**Aktionen:**
- Anforderung neu formulieren zur Validierung
- Betroffene Use Cases identifizieren
- Ausrichtung an Business-Zielen prüfen (siehe `.claude/rules/00-project-context.md`)

### Schritt 2: Vorhandenen Code analysieren

**VERPFLICHTEND zu lesende Dateien:**
1. Dateien, die direkt von der Änderung betroffen sind
2. Abhängige Dateien (die den geänderten Code verwenden)
3. Vorhandene Tests (um erwartetes Verhalten zu verstehen)
4. Doctrine-Migrationen (bei Auswirkung auf DB-Schema)

**Tools:**
```bash
# Verwendung einer Klasse/Methode suchen
make console CMD="debug:container KlassenName"

# Abhängigkeiten analysieren
make phpstan
make deptrac

# Vorhandene Tests anzeigen
make test-coverage
```

**Achtungspunkte:**
- Werden Tests brechen?
- Gibt es andere Klassen, die von diesem Code abhängen?
- Respektiert der Code die Clean Architecture + DDD?
- Gibt es sensible Daten (DSGVO)?

### Schritt 3: Analyse dokumentieren

**Vorlage verwenden**: `.claude/templates/analysis.md`

**Verpflichtender Inhalt:**
1. **Ziel**: Klare Beschreibung der Änderung
2. **Betroffene Dateien**: Vollständige Liste mit Begründung
3. **Auswirkungen**:
   - Breaking Changes: ja/nein
   - DB-Migration erforderlich: ja/nein
   - Performance-Auswirkung: ja/nein
   - Sensible Daten: ja/nein
4. **Risiken**: Liste + Minderungen
5. **Ansatz**: Implementierungsstrategie (TDD, progressives Refactoring, etc.)
6. **TDD-Tests**: Liste der VOR der Implementierung zu schreibenden Tests

**Beispiel:**
```markdown
## Analyse: Verschlüsselung von Allergien und medizinischen Behandlungen (DSGVO)

### Ziel
Verschlüsselung der Felder `allergies` und `medicalTreatments` der Participant-Entity
für DSGVO-Konformität.

### Betroffene Dateien
- `src/Entity/Participant.php` (Verschlüsselungs-Annotations hinzufügen)
- `config/packages/doctrine.yaml` (Gedmo-Konfiguration)
- `src/Repository/ParticipantRepository.php` (Abfragen mit verschlüsselten Feldern)
- Doctrine-Migration (kein Schema-Änderung, transparente Verschlüsselung)

### Auswirkungen
- Breaking Change: NEIN (transparente Verschlüsselung)
- DB-Migration: NEIN (Doctrine verwaltet automatisch)
- Performance: Leichte Auswirkung (Ver-/Entschlüsselung) < 50ms
- Sensible Daten: JA (Grund für Verschlüsselung)

### Risiken
1. Verlust des Verschlüsselungsschlüssels → Minderung: Schlüssel-Backup in sicherem Vault
2. Performance bei LIKE-Abfragen auf verschlüsselten Feldern → Minderung: kein LIKE auf allergies

### Ansatz
1. gedmo/doctrine-extensions installieren
2. doctrine_encryption in services.yaml konfigurieren
3. TDD: Tests mit sensiblen Daten schreiben
4. Annotations auf Entity implementieren
5. Ver-/Entschlüsselung testen
6. Performance prüfen (< 50ms)

### TDD-Tests
1. test_should_encrypt_allergies_when_saved()
2. test_should_decrypt_allergies_when_loaded()
3. test_should_encrypt_medical_treatments()
4. test_should_find_participant_by_encrypted_field()
```

### Schritt 4: Validierung

**Entscheidungskriterien:**

| Auswirkung | Aktion |
|------------|--------|
| **Niedrig** (1 Datei, kein Breaking Change, < 1h) | Direkt fortfahren |
| **Mittel** (2-5 Dateien, DB-Migration, < 4h) | Mit Benutzer validieren |
| **Hoch** (> 5 Dateien, Breaking Changes, Architektur-Refactoring) | Detaillierte Planung + verpflichtende Validierung |

**Validierungsfragen:**
- Respektiert der Ansatz Clean Architecture + DDD?
- Sind die TDD-Tests ausreichend?
- Gibt es eine einfachere Alternative (KISS)?
- Sind die Risiken akzeptabel?

## Zu vermeidende Anti-Patterns

### ❌ Codieren ohne vorhandenen Code zu lesen

```php
// SCHLECHT: Änderung ohne Verständnis der Auswirkung
class ReservationController {
    public function create() {
        // Ich ändere direkt ohne vorhandenen Code zu lesen
        $reservation->setStatus('confirmed'); // ⚠️ Auswirkung?
    }
}
```

### ❌ Abhängigkeiten ignorieren

```php
// SCHLECHT: Änderung ohne Prüfung, wer diese Methode verwendet
class Sejour {
    public function getPrice(): float {
        // Ich ändere das Verhalten ohne Auswirkungsprüfung
        return $this->price * 0.8; // ⚠️ Wer ruft getPrice() auf?
    }
}
```

### ❌ Tests vergessen

```php
// SCHLECHT: Keine Prüfung vorhandener Tests
// Wenn ich Participant ändere, welche Tests werden brechen?
```

### ❌ DSGVO ignorieren

```php
// SCHLECHT: Sensibles Feld ohne Verschlüsselung hinzufügen
class Participant {
    private string $socialSecurityNumber; // ⚠️ DSGVO!
}
```

## Schnell-Checkliste

Vor jeder Änderung:

- [ ] Ich habe die Anforderung gelesen und verstanden
- [ ] Ich habe die betroffenen Dateien gelesen
- [ ] Ich habe die Abhängigkeiten identifiziert
- [ ] Ich habe die Analyse dokumentiert
- [ ] Ich habe die Risiken bewertet
- [ ] Ich habe die TDD-Tests definiert
- [ ] Ich habe den Ansatz validiert (bei mittlerer/hoher Auswirkung)
- [ ] Ich habe die Konformität mit Clean Architecture + SOLID geprüft
- [ ] Ich habe Sicherheit + DSGVO bei sensiblen Daten geprüft

## Zugehörige Vorlagen

- `.claude/templates/analysis.md` - Detaillierte Analyse-Vorlage
- `.claude/checklists/new-feature.md` - Checkliste für neues Feature
- `.claude/checklists/refactoring.md` - Refactoring-Checkliste
