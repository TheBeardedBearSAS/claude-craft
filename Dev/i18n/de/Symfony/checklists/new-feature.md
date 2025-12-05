# Checkliste: Neue Funktion

> **Vollständiger Prozess** zur Implementierung einer neuen Funktion
> Referenz: `.claude/rules/01-architecture-ddd.md`, `.claude/rules/04-testing-tdd.md`

## Überblick

```
1. ANALYSE (30 Min.)     → Template: .claude/templates/analysis.md
2. TDD RED (1 Std.)      → Template: .claude/templates/test-*.md
3. TDD GREEN (2 Std.)    → Templates: .claude/templates/*.md
4. TDD REFACTOR (1 Std.) → SOLID-Prinzipien
5. VALIDIERUNG (30 Min.) → Checkliste pre-commit
```

**Geschätzte Gesamtzeit:** 5 Stunden für eine mittlere Funktion

---

## Phase 1: Analyse vor der Implementierung

### ✅ Vollständige dokumentierte Analyse

**Template:** `.claude/templates/analysis.md`

```bash
# Analysedokument erstellen
vim docs/analysis/[YYYY-MM-DD]-[feature-name].md
```

**Erforderlicher Inhalt:**
- [ ] **Geschäftsziel** klar definiert
- [ ] **Akzeptanzkriterien** (3-5 testbare Kriterien)
- [ ] **Betroffene Dateien** (neu + geändert)
- [ ] **Identifizierte Auswirkungen:**
  - [ ] Breaking Changes (ja/nein + Details)
  - [ ] DB-Migration (ja/nein + Skript)
  - [ ] Performance (Benchmarks falls erforderlich)
  - [ ] DSGVO (personenbezogene Daten + Verschlüsselung)
- [ ] **Risiken + Minderungen** (Tabelle)
- [ ] **TDD-Ansatz** (Tests VORHER schreiben)
- [ ] **Validierung** (Team-Review)

**Konkretes Beispiel:**
```markdown
# Analyse: Einzelzimmerzuschlag für Buchungen

## Ziel
Einen Zuschlag von 30% auf den Gesamtpreis hinzufügen, wenn die Buchung
nur einen Teilnehmer enthält.

## Akzeptanzkriterien
- [ ] 1 Teilnehmer → Preis × 1.30
- [ ] 2+ Teilnehmer → kein Zuschlag
- [ ] Detailansicht in der Zusammenfassung
- [ ] Bestätigungs-E-Mail enthält Details

## Betroffene Dateien
Neu:
- tests/Unit/Service/PrixCalculatorServiceTest.php

Geändert:
- src/Service/PrixCalculatorService.php
- src/Entity/Reservation.php
- templates/emails/confirmation_client.html.twig

## Auswirkungen
- Breaking Changes: NEIN
- DB-Migration: NEIN
- Performance: OK (einfache Berechnung)
- DSGVO: NEIN (keine personenbezogenen Daten)

## TDD-Tests
1. it_applies_single_supplement_when_one_participant()
2. it_does_not_apply_supplement_when_multiple_participants()
3. it_calculates_correct_total_with_supplement()
```

**Validierung vor dem Fortfahren:**
- [ ] Analyse von mindestens 1 Person geprüft
- [ ] Technischer Ansatz validiert
- [ ] TDD-Tests definiert

---

## Phase 2: TDD - RED (Fehlschlagende Tests)

### ✅ Tests VOR der Implementierung geschrieben

**Templates:**
- `.claude/templates/test-unit.md`
- `.claude/templates/test-integration.md`
- `.claude/templates/test-behat.md`

### 2.1 Unit-Tests

```bash
# Test VOR dem Code erstellen
vim tests/Unit/Service/PrixCalculatorServiceTest.php
```

```php
<?php
// Test schlägt fehl (Klasse existiert noch nicht)

class PrixCalculatorServiceTest extends TestCase
{
    /** @test */
    public function it_applies_single_supplement_when_one_participant(): void
    {
        // ARRANGE
        $calculator = new PrixCalculatorService();
        $reservation = $this->createReservation(1); // 1 Teilnehmer

        // ACT
        $total = $calculator->calculate($reservation);

        // ASSERT
        $basePrice = 1000.00;
        $expectedWithSupplement = 1300.00; // +30%
        $this->assertEquals($expectedWithSupplement, $total->toEuros());
    }
}
```

**Test ausführen (muss FEHLSCHLAGEN):**
```bash
make test-unit
# ❌ Class PrixCalculatorService not found (ERWARTET)
```

### 2.2 Integrationstests

```bash
vim tests/Integration/Controller/ReservationControllerTest.php
```

```php
/** @test */
public function it_calculates_price_with_single_supplement(): void
{
    // ARRANGE
    $client = static::createClient();
    $sejour = $this->createSejour(1000.00); // Basispreis

    // ACT
    $client->request('POST', '/api/reservation/create', [
        'sejour_id' => $sejour->getId(),
        'participants' => [
            ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
        ],
    ]);

    // ASSERT
    $response = json_decode($client->getResponse()->getContent(), true);
    $this->assertEquals(1300.00, $response['montant_total']);
}
```

### 2.3 BDD-Tests (Behat)

```bash
vim features/reservation_pricing.feature
```

```gherkin
Szenario: Einzelzimmerzuschlag für 1 Teilnehmer
  Angenommen ein Aufenthalt zu "1000.00" €
  Wenn ich mit "1" Teilnehmer buche
  Dann beträgt der Gesamtbetrag "1300.00 €"
  Und ich sehe die Details "Einzelzimmerzuschlag: +300.00 €"
```

**Alle Tests ausführen (müssen ALLE FEHLSCHLAGEN):**
```bash
make test
# ❌ Alle Tests schlagen fehl (ERWARTET - RED-Phase)
```

**Checkliste RED-Phase:**
- [ ] Unit-Tests geschrieben und schlagen fehl
- [ ] Integrationstests geschrieben und schlagen fehl
- [ ] Behat-Tests geschrieben und schlagen fehl
- [ ] Mindestens 3 Tests pro Funktion
- [ ] Tests decken nominale + Fehler-Fälle ab
- [ ] Tests committen (auch wenn sie fehlschlagen)

```bash
git add tests/ features/
git commit -m "test(reservation): füge Tests für Einzelzimmerzuschlag hinzu (RED)

TDD RED-Phase Tests für Einzelzimmerzuschlag-Funktion.
Alle Tests schlagen fehl, da die Implementierung noch nicht existiert.

- Unit-Tests: PrixCalculatorServiceTest
- Integrationstests: ReservationControllerTest
- BDD-Tests: reservation_pricing.feature

Ref: #42
"
```

---

## Phase 3: TDD - GREEN (Minimale Implementierung)

### ✅ Implementiere das absolute Minimum zum Bestehen der Tests

**Templates:**
- `.claude/templates/value-object.md`
- `.claude/templates/service.md`
- `.claude/templates/aggregate-root.md`

### 3.1 Geschäftslogik implementieren

```bash
# Service erstellen
vim src/Service/PrixCalculatorService.php
```

```php
<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Reservation;
use App\ValueObject\Money;

final readonly class PrixCalculatorService
{
    private const SUPPLEMENT_SINGLE_PERCENT = 30;

    public function calculate(Reservation $reservation): Money
    {
        $basePrice = $reservation->getSejour()->getPrixTtc();
        $nbParticipants = $reservation->getNbParticipants();

        $total = $basePrice->multiply($nbParticipants);

        // Einzelzimmerzuschlag bei nur 1 Teilnehmer
        if ($nbParticipants === 1) {
            $supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
            $total = $total->add($supplement);
        }

        return $total;
    }
}
```

### 3.2 In Aggregat integrieren

```bash
vim src/Entity/Reservation.php
```

```php
public function calculerMontantTotal(): void
{
    $calculator = new PrixCalculatorService(); // TODO: per Service injizieren
    $total = $calculator->calculate($this);
    $this->montantTotalCents = $total->toCents();
}
```

### 3.3 Tests ausführen (müssen BESTEHEN)

```bash
make test
# ✅ Alle Tests bestehen (GREEN-Phase)
```

**Wenn Tests fehlschlagen:**
- 🔧 Fehlschlagenden Test debuggen
- 🔧 Implementierung korrigieren
- 🔁 Erneut ausführen bis GREEN

**Checkliste GREEN-Phase:**
- [ ] Alle Unit-Tests bestehen
- [ ] Alle Integrationstests bestehen
- [ ] Alle Behat-Tests bestehen
- [ ] Minimale Implementierung (kein Over-Engineering)
- [ ] Kein toter Code
- [ ] Implementierung committen

```bash
git add src/
git commit -m "feat(reservation): implementiere Einzelzimmerzuschlag (GREEN)

Minimale Implementierung zum Bestehen der TDD-Tests.

Logik:
- 1 Teilnehmer → Preis × 1.30
- 2+ Teilnehmer → kein Zuschlag

Tests: ✅ 8/8 bestanden

Ref: #42
"
```

---

## Phase 4: TDD - REFACTOR (Code-Verbesserung)

### ✅ Code verbessern ohne Verhalten zu ändern

**Anzuwendende Prinzipien:**
- SOLID (Single Responsibility, Open/Closed, etc.)
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Clean Code

### 4.1 Refactoring: Dependency Injection

**VORHER (starke Kopplung):**
```php
public function calculerMontantTotal(): void
{
    $calculator = new PrixCalculatorService(); // ❌ New in Methode
    $total = $calculator->calculate($this);
}
```

**NACHHER (Injection):**
```php
// Reservation.php
public function calculerMontantTotal(PrixCalculatorService $calculator): void
{
    $total = $calculator->calculate($this);
    $this->montantTotalCents = $total->toCents();
}

// ReservationService.php
public function __construct(
    private readonly PrixCalculatorService $calculator
) {}

public function createReservation(array $data): Reservation
{
    // ...
    $reservation->calculerMontantTotal($this->calculator);
}
```

### 4.2 Refactoring: Value Object extrahieren

**VORHER (Primitive Obsession):**
```php
private const SUPPLEMENT_SINGLE_PERCENT = 30;

$supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
```

**NACHHER (Value Object):**
```php
final readonly class SupplementRate
{
    public static function single(): self
    {
        return new self(30); // 30%
    }

    private function __construct(private int $percent) {}

    public function apply(Money $amount): Money
    {
        return $amount->multiply($this->percent / 100);
    }
}

// Verwendung
$supplement = SupplementRate::single()->apply($total);
```

### 4.3 Tests ausführen (müssen IMMER NOCH BESTEHEN)

```bash
make test
# ✅ Alle Tests bestehen (keine Regression)
```

**Checkliste REFACTOR-Phase:**
- [ ] Tests bestehen immer noch (keine Regression)
- [ ] Code lesbarer/wartbarer
- [ ] SOLID-Prinzipien beachtet
- [ ] Keine Duplizierung
- [ ] Aussagekräftige Namen (Methoden, Variablen)
- [ ] Reduzierte Komplexität
- [ ] PHPStan Level 8 OK
- [ ] Refactoring committen

```bash
git add src/
git commit -m "refactor(reservation): verbessere PrixCalculatorService (REFACTOR)

TDD-Refactoring ohne Verhaltensänderung:

- Dependency Injection (kein new)
- Extraktion Value Object SupplementRate
- Bessere Trennung der Verantwortlichkeiten

Tests: ✅ 8/8 bestanden (keine Regression)
PHPStan: Level 8 OK

Ref: #42
"
```

---

## Phase 5: Finale Validierung

### ✅ Vollständige Checkliste vor dem Merge

### 5.1 Code-Qualität

```bash
# PHPStan
make phpstan
# ✅ Level 8, 0 Fehler

# CS-Fixer
make cs-fix
# ✅ Code formatiert PSR-12

# Hadolint (wenn Dockerfile geändert)
make hadolint
# ✅ Keine Fehler
```

### 5.2 Vollständige Tests

```bash
# Alle Tests
make test
# ✅ Alle bestehen

# Coverage
make test-coverage
# ✅ Coverage ≥ 80%
```

**Coverage-Bericht prüfen:**
```bash
open build/coverage/index.html
```

- [ ] Neue Klassen/Methoden ≥ 80% abgedeckt
- [ ] Hauptzweige getestet
- [ ] Fehlerfälle getestet

### 5.3 Clean Architecture eingehalten

**Struktur prüfen:**
```
src/
├── Domain/               # Entities, Value Objects, Events
│   ├── Entity/
│   ├── ValueObject/
│   ├── Event/
│   └── Exception/
├── Application/          # Use Cases, Services
│   └── Service/
└── Infrastructure/       # Repositories, Controllers
    ├── Repository/
    └── Controller/
```

**Architektur-Checkliste:**
- [ ] Domain hängt von NICHTS ab
- [ ] Application hängt nur von Domain ab
- [ ] Infrastructure hängt von Domain + Application ab
- [ ] Keine zirkuläre Kopplung
- [ ] Interfaces in Domain, Implementierungen in Infrastructure

### 5.4 SOLID eingehalten

#### Single Responsibility Principle
- [ ] Jede Klasse hat EINE einzige Verantwortung
- [ ] Jede Methode macht EINE einzige Sache

#### Open/Closed Principle
- [ ] Erweiterbar ohne bestehenden Code zu ändern
- [ ] Verwendet Interfaces/Abstract für Erweiterung

#### Liskov Substitution Principle
- [ ] Implementierungen halten Vertrag ein
- [ ] Keine Überraschungen in Unterklassen

#### Interface Segregation Principle
- [ ] Interfaces klein und fokussiert
- [ ] Keine "Catch-All"-Interfaces

#### Dependency Inversion Principle
- [ ] Hängt von Abstraktionen ab (Interfaces)
- [ ] Keine konkreten Abhängigkeiten

### 5.5 Dokumentation

- [ ] PHPDoc vollständig für öffentliche Methoden
- [ ] README.md aktualisiert (wenn öffentliche API)
- [ ] CHANGELOG.md aktualisiert
- [ ] ADR wenn wichtige architektonische Entscheidung

**PHPDoc-Beispiel:**
```php
/**
 * Berechnet den Gesamtpreis einer Buchung
 *
 * Wendet Geschäftsregeln an:
 * - Basispreis × Anzahl Teilnehmer
 * - Einzelzimmerzuschlag (+30%) bei nur 1 Teilnehmer
 * - Kostenpflichtige Optionen
 *
 * @param Reservation $reservation Zu berechnende Buchung
 * @return Money Gesamtbetrag inkl. MwSt.
 *
 * @throws ReservationInvalideException Wenn Buchung ohne Teilnehmer
 */
public function calculate(Reservation $reservation): Money
{
    // ...
}
```

### 5.6 Sicherheit & DSGVO

**Bei personenbezogenen Daten:**
- [ ] Verschlüsselung in DB (`doctrine-encrypt-bundle`)
- [ ] Strikte Input-Validierung
- [ ] Keine sensiblen Daten in Logs
- [ ] DSGVO-Einwilligung
- [ ] Definierte Aufbewahrungsdauer

**Bei API-Exposition:**
- [ ] Authentication/Authorization
- [ ] Rate Limiting
- [ ] Input-Validierung
- [ ] Output-Sanitization
- [ ] CORS konfiguriert

---

## Phase 6: Pull Request

### ✅ Qualitativ hochwertige PR erstellen

```bash
# Branch pushen
git push origin feature/supplement-single

# PR erstellen (via GitHub/GitLab)
```

**PR-Template:**
```markdown
## Beschreibung

Fügt einen Zuschlag von 30% auf den Gesamtpreis von Buchungen
mit nur einem Teilnehmer (Einzelzimmer) hinzu.

## Motivation

Angleichung an die Preispolitik der Partner-Hotels.

## Änderungen

- ✅ `PrixCalculatorService`: Berechnung des Zuschlags
- ✅ `Reservation::calculerMontantTotal()`: Verwendet den Service
- ✅ `SupplementRate` Value Object: Kapselung des Satzes
- ✅ E-Mail-Templates: Anzeige der Details

## Tests

- ✅ 8 Unit-Tests (100% Coverage)
- ✅ 3 Integrationstests
- ✅ 2 Behat-Szenarien

**Coverage:** 85% (+5%)

## Checkliste

- [x] Tests bestehen
- [x] PHPStan Level 8 OK
- [x] Code formatiert (PSR-12)
- [x] Dokumentation aktualisiert
- [x] Keine Breaking Changes
- [x] DB-Migration: N/A
- [x] DSGVO: N/A

## Screenshots

[Screenshots wenn UI]

## Closes

Closes #42
```

**PR-Checkliste:**
- [ ] Klarer und prägnanter Titel
- [ ] Vollständige Beschreibung
- [ ] Link zum Ticket/Issue
- [ ] Screenshots wenn UI
- [ ] Tests bestehen auf CI/CD
- [ ] Reviewer zugewiesen
- [ ] Passende Labels

---

## Vollständiges Beispiel: Funktion "Kostenpflichtige Optionen"

### Schritt 1: Analyse (30 Min.)

```markdown
# Analyse: Kostenpflichtige Optionen für Buchungen

## Ziel
Ermöglicht das Hinzufügen kostenpflichtiger Optionen (Versicherung, Gepäckzuschlag)
zu Buchungen.

## Akzeptanzkriterien
- [ ] Hinzufügen von Optionen über Formular
- [ ] Gesamtpreis enthält Optionen
- [ ] Bestätigungs-E-Mail listet Optionen auf
- [ ] Admin kann verfügbare Optionen verwalten

## Betroffene Dateien
Neu:
- src/Entity/OptionReservation.php
- src/Form/OptionType.php
- tests/Unit/Entity/OptionReservationTest.php

Geändert:
- src/Entity/Reservation.php (OneToMany-Beziehung)
- src/Service/PrixCalculatorService.php (Berechnung mit Optionen)
- templates/reservation/index.html.twig (Formular)

## DB-Migration
```sql
CREATE TABLE option_reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    prix_ttc_cents INT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE
);
```

## TDD-Tests
1. it_adds_option_to_reservation()
2. it_calculates_total_with_options()
3. it_removes_option_from_reservation()
```

### Schritt 2: TDD RED (1 Std.)

```bash
# Unit-Tests
vim tests/Unit/Entity/ReservationTest.php

# Integrationstests
vim tests/Integration/Service/ReservationServiceTest.php

# Behat-Tests
vim features/reservation_options.feature

# Ausführen (müssen fehlschlagen)
make test
# ❌ 12 Tests fehlgeschlagen (ERWARTET)

# Commit
git commit -m "test(reservation): füge Tests für kostenpflichtige Optionen hinzu (RED)"
```

### Schritt 3: TDD GREEN (2 Std.)

```bash
# Migration
docker compose exec php bin/console make:migration
vim migrations/Version20YYMMDDHHMMSS.php
docker compose exec php bin/console doctrine:migrations:migrate

# Entity
vim src/Entity/OptionReservation.php

# Beziehung
vim src/Entity/Reservation.php

# Service
vim src/Service/PrixCalculatorService.php

# Ausführen (müssen bestehen)
make test
# ✅ 12/12 Tests bestanden

# Commit
git commit -m "feat(reservation): implementiere kostenpflichtige Optionen (GREEN)"
```

### Schritt 4: TDD REFACTOR (1 Std.)

```bash
# Value Object extrahieren
vim src/ValueObject/OptionPrice.php

# Dependency Injection
vim src/Service/PrixCalculatorService.php

# Ausführen (müssen immer noch bestehen)
make test
# ✅ 12/12 Tests bestanden

# Commit
git commit -m "refactor(reservation): verbessere Optionsverwaltung (REFACTOR)"
```

### Schritt 5: Validierung (30 Min.)

```bash
# Qualität
make quality
# ✅ PHPStan + CS-Fixer OK

# Coverage
make test-coverage
# ✅ 88%

# Pre-Commit-Checkliste
make pre-commit
# ✅ Alles OK
```

### Schritt 6: PR

```bash
git push origin feature/options-payantes
# PR auf GitHub/GitLab erstellen
```

---

## Geschätzte Zeiten nach Funktionsgröße

| Größe | Analyse | TDD RED | TDD GREEN | REFACTOR | Validierung | Gesamt |
|--------|---------|---------|-----------|----------|------------|-------|
| **Klein** (1 Datei) | 15 Min. | 30 Min. | 1 Std. | 30 Min. | 15 Min. | **2:30 Std.** |
| **Mittel** (3-5 Dateien) | 30 Min. | 1 Std. | 2 Std. | 1 Std. | 30 Min. | **5 Std.** |
| **Groß** (10+ Dateien) | 1 Std. | 2 Std. | 4 Std. | 2 Std. | 1 Std. | **10 Std.** |

---

## Abschließende Checkliste

- [ ] Phase 1: Analyse dokumentiert und validiert
- [ ] Phase 2: Tests geschrieben (RED)
- [ ] Phase 3: Minimale Implementierung (GREEN)
- [ ] Phase 4: SOLID-Refactoring (REFACTOR)
- [ ] Phase 5: Vollständige Validierung (Qualität + Tests)
- [ ] Phase 6: PR erstellt und reviewed

**Wenn alle Kästchen markiert → MERGE!**
