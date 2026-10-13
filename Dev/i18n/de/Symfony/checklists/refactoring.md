# Checkliste: Sicheres Refactoring

> **Code verbessern ohne zu brechen** - Refactoring mit Sicherheitsnetz
> Referenz: `.claude/rules/03-coding-standards.md`, `.claude/rules/04-testing-tdd.md`

## Was ist Refactoring?

**Refactoring =** Die interne Struktur des Codes verbessern **OHNE** sein externes Verhalten zu ändern

### ✅ Refactoring (OK)
- Eine Variable umbenennen für mehr Klarheit
- Eine Methode extrahieren zur Reduzierung der Komplexität
- Code verschieben für bessere Organisation
- Eine Bedingung vereinfachen
- Duplizierung eliminieren

### ❌ Kein Refactoring (das ist eine Feature/Fix)
- Ein neues Verhalten hinzufügen
- Einen Bug beheben
- Die Geschäftslogik ändern
- Die öffentliche API ändern

---

## Grundprinzip: Sicherheitsnetz

**VOR dem Refactoring:**
```bash
# 1. Sicherstellen, dass ALLE Tests bestehen
make test
# ✅ Alle Tests müssen grün sein

# 2. Stabilen Zustand committen
git commit -m "chore: stabiler Zustand vor Refactoring"
```

**WÄHREND des Refactorings:**
```bash
# Tests nach JEDER kleinen Änderung ausführen
make test
# ✅ Wenn rot → Änderung rückgängig machen
```

**NACH dem Refactoring:**
```bash
# Prüfen, dass sich nichts verhaltenstechnisch geändert hat
make test
# ✅ Alle Tests müssen immer noch bestehen
```

---

## Phase 1: Vorbereitung

### ✅ Stabiler Zustand verifiziert

**1. Alle Tests bestehen**
```bash
make test
```

**Erwartetes Ergebnis:**
```
✅ Unit-Tests: 45 bestanden
✅ Integrationstests: 12 bestanden
✅ Behat-Tests: 8 Szenarien bestanden
```

**Wenn Tests fehlschlagen:**
- ❌ NICHT refactoren
- 🔧 Zuerst Tests korrigieren
- ✅ Neu beginnen wenn alles grün ist

**2. Ausreichende Coverage**
```bash
make test-coverage
```

**Kriterium:**
- ✅ Coverage ≥ 80% für zu refactorenden Code
- ⚠️ Wenn < 80% → Tests VORHER hinzufügen

**Warum?** Tests sind das Sicherheitsnetz. Ohne Tests refactoren wir blind.

**3. Sicherheits-Commit**
```bash
git add .
git commit -m "chore: stabiler Zustand vor Refactoring

Alle Tests bestehen.
Coverage: 85%

Bereit für sicheres Refactoring.
"
```

---

## Phase 2: Analyse des zu refactorenden Codes

### ✅ "Code Smells" identifizieren

#### Code Smell 1: Zu lange Methode

**Symptom:**
- Methode > 20 Zeilen
- Macht mehrere Dinge
- Schwer zu verstehen

**Beispiel:**
```php
// ❌ Zu lange Methode (47 Zeilen)
public function createReservation(array $data): Reservation
{
    // Validierung
    if (empty($data['email'])) {
        throw new InvalidArgumentException('E-Mail erforderlich');
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('E-Mail ungültig');
    }
    if (empty($data['participants'])) {
        throw new InvalidArgumentException('Teilnehmer erforderlich');
    }

    // Séjour abrufen
    $sejour = $this->sejourRepository->find($data['sejour_id']);
    if (!$sejour) {
        throw new EntityNotFoundException('Aufenthalt nicht gefunden');
    }

    // Verfügbarkeit prüfen
    $nbParticipants = count($data['participants']);
    if ($sejour->getPlacesRestantes() < $nbParticipants) {
        throw new SejourCompletException('Nicht genug Plätze');
    }

    // Buchung erstellen
    $reservation = new Reservation();
    $reservation->setSejour($sejour);
    $reservation->setEmailContact($data['email']);
    $reservation->setTelephoneContact($data['telephone']);

    // Teilnehmer hinzufügen
    foreach ($data['participants'] as $participantData) {
        $participant = new Participant();
        $participant->setNom($participantData['nom']);
        $participant->setPrenom($participantData['prenom']);
        $participant->setDateNaissance(new \DateTimeImmutable($participantData['date_naissance']));
        $reservation->addParticipant($participant);
    }

    // Preis berechnen
    $prixBase = $sejour->getPrixTtc();
    $total = $prixBase->multiply($nbParticipants);
    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }
    $reservation->setMontantTotal($total);

    // Speichern
    $this->entityManager->persist($reservation);
    $this->entityManager->flush();

    return $reservation;
}
```

**Refactoring: Methoden extrahieren**
```php
// ✅ Kurze und klare Methode (7 Zeilen)
public function createReservation(array $data): Reservation
{
    $this->validateData($data);

    $sejour = $this->findSejourOrFail($data['sejour_id']);
    $this->ensureAvailability($sejour, count($data['participants']));

    $reservation = $this->buildReservation($sejour, $data);
    $this->addParticipants($reservation, $data['participants']);
    $this->calculatePrice($reservation);

    $this->entityManager->persist($reservation);
    $this->entityManager->flush();

    return $reservation;
}

private function validateData(array $data): void
{
    // 5 Zeilen Validierung
}

private function findSejourOrFail(int $sejourId): Sejour
{
    // 3 Zeilen
}

private function ensureAvailability(Sejour $sejour, int $nbParticipants): void
{
    // 3 Zeilen
}

// etc.
```

#### Code Smell 2: Duplizierung (DRY-Verstoß)

**Symptom:**
- Gleicher Code mehrfach wiederholt
- Offensichtliches Copy/Paste

**Beispiel:**
```php
// ❌ Duplizierung
public function calculatePriceForSejour(Sejour $sejour, int $nbParticipants): Money
{
    $basePrice = $sejour->getPrixTtc();
    $total = $basePrice->multiply($nbParticipants);

    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }

    return $total;
}

public function calculatePriceForReservation(Reservation $reservation): Money
{
    $basePrice = $reservation->getSejour()->getPrixTtc();
    $nbParticipants = $reservation->getNbParticipants();
    $total = $basePrice->multiply($nbParticipants);

    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }

    return $total;
}
```

**Refactoring: Gemeinsame Logik extrahieren**
```php
// ✅ DRY (Don't Repeat Yourself)
public function calculatePriceForSejour(Sejour $sejour, int $nbParticipants): Money
{
    return $this->calculatePrice($sejour->getPrixTtc(), $nbParticipants);
}

public function calculatePriceForReservation(Reservation $reservation): Money
{
    return $this->calculatePrice(
        $reservation->getSejour()->getPrixTtc(),
        $reservation->getNbParticipants()
    );
}

private function calculatePrice(Money $basePrice, int $nbParticipants): Money
{
    $total = $basePrice->multiply($nbParticipants);

    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }

    return $total;
}
```

#### Code Smell 3: Hohe zyklomatische Komplexität

**Symptom:**
- Zu viele `if`, `else`, `switch`
- Schwer zu testen
- Schwer zu verstehen

**Beispiel:**
```php
// ❌ Zyklomatische Komplexität = 8 (zu hoch)
public function calculateDiscount(Reservation $reservation): Money
{
    $discount = Money::zero();

    if ($reservation->getCodePromo()) {
        $promo = $reservation->getCodePromo();

        if ($promo->getType() === 'percentage') {
            if ($promo->getPourcentage() > 0) {
                $discount = $reservation->getMontantTotal()->multiply($promo->getPourcentage() / 100);
            }
        } elseif ($promo->getType() === 'fixed') {
            if ($promo->getMontantFixe() > 0) {
                $discount = Money::fromEuros($promo->getMontantFixe());
            }
        } elseif ($promo->getType() === 'early_bird') {
            if ($reservation->getCreatedAt() < $promo->getDateLimite()) {
                $discount = $reservation->getMontantTotal()->multiply(0.10);
            }
        }
    }

    return $discount;
}
```

**Refactoring: Strategy Pattern / Polymorphismus**
```php
// ✅ Reduzierte Komplexität + erweiterbar
interface PromoCodeStrategy
{
    public function calculateDiscount(Reservation $reservation): Money;
}

class PercentagePromo implements PromoCodeStrategy
{
    public function calculateDiscount(Reservation $reservation): Money
    {
        return $reservation->getMontantTotal()
            ->multiply($this->pourcentage / 100);
    }
}

class FixedPromo implements PromoCodeStrategy
{
    public function calculateDiscount(Reservation $reservation): Money
    {
        return Money::fromEuros($this->montantFixe);
    }
}

class EarlyBirdPromo implements PromoCodeStrategy
{
    public function calculateDiscount(Reservation $reservation): Money
    {
        if ($reservation->getCreatedAt() < $this->dateLimite) {
            return $reservation->getMontantTotal()->multiply(0.10);
        }
        return Money::zero();
    }
}

// Einfache Verwendung
public function calculateDiscount(Reservation $reservation): Money
{
    if (!$promo = $reservation->getCodePromo()) {
        return Money::zero();
    }

    return $promo->getStrategy()->calculateDiscount($reservation);
}
```

#### Code Smell 4: Primitive Obsession

**Symptom:**
- Verwendung primitiver Typen (int, string, float) statt Geschäftsobjekten
- Keine Validierung

**Beispiel:**
```php
// ❌ Primitive Obsession
class Reservation
{
    private string $email;
    private int $prixCents;

    public function setEmail(string $email): void
    {
        $this->email = $email; // Keine Validierung
    }

    public function setPrix(int $cents): void
    {
        $this->prixCents = $cents; // Kann negativ sein
    }
}
```

**Refactoring: Value Objects**
```php
// ✅ Value Objects mit Validierung
class Reservation
{
    private Email $email;
    private Money $prix;

    public function setEmail(Email $email): void
    {
        $this->email = $email; // Bereits validiert in Email::fromString()
    }

    public function setPrix(Money $prix): void
    {
        $this->prix = $prix; // Bereits validiert (nicht negativ)
    }
}
```

#### Code Smell 5: God Class

**Symptom:**
- Klasse die alles macht
- Zu viele Verantwortlichkeiten (SRP-Verstoß)
- > 300 Zeilen

**Beispiel:**
```php
// ❌ God Class (500 Zeilen)
class ReservationManager
{
    public function create() {}
    public function update() {}
    public function delete() {}
    public function sendEmail() {}
    public function generatePdf() {}
    public function calculatePrice() {}
    public function validateData() {}
    public function exportCsv() {}
    // ... 20 weitere Methoden
}
```

**Refactoring: Verantwortlichkeiten trennen**
```php
// ✅ Single Responsibility Principle
class ReservationService         // Buchungsverwaltung
class ReservationMailer          // E-Mail-Versand
class ReservationPdfGenerator    // PDF-Generierung
class PrixCalculatorService      // Preisberechnung
class ReservationValidator       // Validierung
class ReservationExporter        // CSV-Export
```

---

## Phase 3: Refactoring in kleinen Schritten

### ✅ Technik: Baby Steps

**Goldene Regel:** Eine einzige Änderung auf einmal + Tests grün

#### Schritt 1: Variable umbenennen

```bash
# VORHER
git status  # Sauber

# REFACTORING
vim src/Service/ReservationService.php
# $data in $reservationData umbenennen (klarer)

# TESTS
make test
# ✅ Alle bestehen

# COMMIT
git commit -m "refactor(reservation): benenne Variable data in reservationData um"
```

#### Schritt 2: Methode extrahieren

```bash
# REFACTORING
vim src/Service/ReservationService.php
# Validierung in validateReservationData() extrahieren

# TESTS
make test
# ✅ Alle bestehen

# COMMIT
git commit -m "refactor(reservation): extrahiere Methode validateReservationData"
```

#### Schritt 3: Methode verschieben

```bash
# REFACTORING
vim src/Validator/ReservationValidator.php
# validateReservationData() in dedizierte Klasse verschieben

# TESTS
make test
# ✅ Alle bestehen

# COMMIT
git commit -m "refactor(reservation): verschiebe Validierung zu ReservationValidator"
```

**Prinzip:** Jeder Commit = Code der kompiliert + Tests grün

---

## Phase 4: Häufige Refactoring-Patterns

### Pattern 1: Extract Method

**Wann:** Methode zu lang

```php
// VORHER
public function process(): void
{
    // 10 Zeilen Code A
    // 15 Zeilen Code B
    // 8 Zeilen Code C
}

// NACHHER
public function process(): void
{
    $this->doA();
    $this->doB();
    $this->doC();
}

private function doA(): void { /* 10 Zeilen */ }
private function doB(): void { /* 15 Zeilen */ }
private function doC(): void { /* 8 Zeilen */ }
```

### Pattern 2: Extract Class

**Wann:** Klasse mit zu vielen Verantwortlichkeiten

```php
// VORHER
class ReservationService
{
    public function create() {}
    public function sendEmail() {}
    public function generatePdf() {}
}

// NACHHER
class ReservationService { public function create() {} }
class ReservationMailer { public function sendEmail() {} }
class ReservationPdfGenerator { public function generatePdf() {} }
```

### Pattern 3: Replace Conditional with Polymorphism

**Wann:** Viele if/switch nach Typ

```php
// VORHER
public function calculate(Promo $promo): Money
{
    if ($promo->type === 'percentage') {
        return $this->calculatePercentage($promo);
    } elseif ($promo->type === 'fixed') {
        return $this->calculateFixed($promo);
    }
}

// NACHHER
interface PromoStrategy { public function calculate(): Money; }
class PercentagePromo implements PromoStrategy { /* ... */ }
class FixedPromo implements PromoStrategy { /* ... */ }

public function calculate(PromoStrategy $promo): Money
{
    return $promo->calculate();
}
```

### Pattern 4: Introduce Parameter Object

**Wann:** Zu viele Parameter (> 3)

```php
// VORHER
public function create(
    string $email,
    string $telephone,
    int $sejourId,
    array $participants,
    ?string $codePromo
): Reservation {}

// NACHHER
class ReservationData
{
    public function __construct(
        public readonly string $email,
        public readonly string $telephone,
        public readonly int $sejourId,
        public readonly array $participants,
        public readonly ?string $codePromo
    ) {}
}

public function create(ReservationData $data): Reservation {}
```

### Pattern 5: Replace Magic Number with Constant

**Wann:** "Magische" Zahlen im Code

```php
// VORHER
if ($nbParticipants === 1) {
    $supplement = $total->multiply(0.30);
}

// NACHHER
private const SUPPLEMENT_SINGLE_PERCENT = 30;

if ($nbParticipants === 1) {
    $supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
}
```

---

## Phase 5: Validierung nach dem Refactoring

### ✅ Vollständige Checkliste

#### 1. Tests immer noch grün

```bash
make test
```

**Kriterium:**
- ✅ Genau die gleiche Anzahl Tests bestanden wie vorher
- ✅ Keine Tests hinzugefügt/entfernt (außer begründet)
- ✅ Gleiche Coverage (oder besser)

**Wenn Tests fehlschlagen:**
- ❌ Refactoring hat das Verhalten geändert (BUG)
- 🔧 Korrigieren oder Refactoring rückgängig machen

#### 2. Performance nicht verschlechtert

```bash
# Einfacher Benchmark
time make test
```

**Kriterium:**
- ✅ Ähnliche Ausführungszeit (± 10%)
- ⚠️ Wenn > +20% → Untersuchen

**Für kritisches Refactoring:**
```bash
# Vor dem Refactoring
ab -n 1000 -c 10 https://atoll.local/api/reservation
# Requests per second: 150

# Nach dem Refactoring
ab -n 1000 -c 10 https://atoll.local/api/reservation
# Requests per second: 148  (OK, -1.3%)
```

#### 3. Komplexität reduziert

**Zu prüfende Metriken:**

```bash
# Zyklomatische Komplexität
docker compose exec php vendor/bin/phpmetrics src/
```

**Kriterium:**
- ✅ Durchschnittskomplexität ≤ 5
- ✅ Keine Methode > 10
- ✅ Klassen < 300 Zeilen

#### 4. SOLID eingehalten

**Checkliste:**
- [ ] **S**ingle Responsibility: Jede Klasse/Methode macht EINE Sache
- [ ] **O**pen/Closed: Erweiterbar ohne Änderung
- [ ] **L**iskov Substitution: Implementierungen halten Vertrag ein
- [ ] **I**nterface Segregation: Fokussierte Interfaces
- [ ] **D**ependency Inversion: Hängt von Abstraktionen ab

#### 5. Einfachheit (KISS)

**Fragen:**
- Ist der Code einfacher zu lesen?
- Würde ein Junior ihn leicht verstehen?
- Gibt es weniger Einrückungsebenen?
- Sind die Namen klarer?

**Wenn "nein" zu einer Frage → Refactoring überdenken**

#### 6. Code-Qualität

```bash
# PHPStan
make phpstan
# ✅ Level 8, 0 Fehler (oder weniger als vorher)

# CS-Fixer
make cs-fix
# ✅ Code formatiert

# Gesamtqualität
make quality
# ✅ Alles OK
```

---

## Phase 6: Commit & Dokumentation

### ✅ Refactoring-Commit

**Format:**
```bash
git commit -m "refactor([scope]): [Beschreibung]

[Details der Änderung]

[Vorteile]

Tests: ✅ [X]/[X] bestanden (keine Regression)
Performance: OK (±[Y]%)
Komplexität: [vorher] → [nachher]
"
```

**Beispiel:**
```bash
git commit -m "refactor(reservation): extrahiere PrixCalculatorService

Extraktion der Preisberechnungslogik in einen dedizierten Service.

Vorteile:
- Bessere Trennung der Verantwortlichkeiten (SRP)
- Wiederverwendbarer Code (DRY)
- Einfacher zu testen

Tests: ✅ 45/45 bestanden (keine Regression)
Performance: OK (-2%)
Komplexität: 8 → 3
"
```

### ✅ Refactoring-Dokumentation

**Bei wichtigem Refactoring → ADR (Architecture Decision Record)**

```markdown
# ADR-005: Extraktion PrixCalculatorService

## Status
Akzeptiert

## Kontext
Die Preisberechnung war an mehreren Stellen verteilt:
- ReservationService
- Reservation Entity
- Controller

Duplizierung und SRP-Verstoß.

## Entscheidung
Einen dedizierten PrixCalculatorService mit:
- Basispreisberechnung
- Einzelzimmerzuschlag
- Kostenpflichtige Optionen
- Promo-Code

## Konsequenzen

### Positiv
- Ein einziger Ort für Preislogik
- Einfach testbar
- Wiederverwendbar
- Vereinfachte Weiterentwicklung (neuer Zuschlagstyp, etc.)

### Negativ
- Zusätzliche Klasse (aber begründet)

## Erwogene Alternativen
1. In Reservation Entity behalten → Abgelehnt (zu viele Verantwortlichkeiten)
2. Statischer Helper → Abgelehnt (nicht injizierbar, nicht testbar)
```

---

## Vollständige Refactoring-Beispiele

### Beispiel 1: Validierung vereinfachen

**VORHER (15 Zeilen, Komplexität 5):**
```php
private function validateReservationData(array $data): void
{
    if (empty($data['email'])) {
        throw new InvalidArgumentException('E-Mail erforderlich');
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('E-Mail ungültig');
    }

    if (empty($data['participants'])) {
        throw new InvalidArgumentException('Teilnehmer erforderlich');
    }

    if (count($data['participants']) > 10) {
        throw new InvalidArgumentException('Maximal 10 Teilnehmer');
    }
}
```

**NACHHER (3 Zeilen, Komplexität 1):**
```php
private function validateReservationData(array $data): void
{
    Assert::email($data['email'] ?? null, 'E-Mail ungültig');
    Assert::notEmpty($data['participants'], 'Teilnehmer erforderlich');
    Assert::maxCount($data['participants'], 10, 'Maximal 10 Teilnehmer');
}
```

**Commit:**
```bash
git commit -m "refactor(reservation): verwende Assert für Validierung

Ersetzt if/throw durch webmozart/assert für mehr Klarheit.

Komplexität: 5 → 1
Zeilen: 15 → 3
"
```

### Beispiel 2: Value Object extrahieren

**VORHER:**
```php
class Reservation
{
    private int $montantTotalCents;

    public function setMontantTotal(int $cents): void
    {
        $this->montantTotalCents = $cents;
    }

    public function getMontantTotal(): float
    {
        return $this->montantTotalCents / 100;
    }
}
```

**NACHHER:**
```php
class Reservation
{
    private Money $montantTotal;

    public function setMontantTotal(Money $montant): void
    {
        $this->montantTotal = $montant;
    }

    public function getMontantTotal(): Money
    {
        return $this->montantTotal;
    }
}
```

**Commit:**
```bash
git commit -m "refactor(reservation): ersetze int durch Money VO

Extraktion Value Object Money um:
- Float-Berechnungsfehler zu vermeiden
- Automatische Validierung (nicht negativ)
- Monetäre Logik zu kapseln

Tests: ✅ 45/45 bestanden
"
```

---

## Abschließende Checkliste

Vor dem Merge des Refactorings:

- [ ] Alle Tests bestehen (gleiche Anzahl wie vorher)
- [ ] Performance nicht verschlechtert (< +10%)
- [ ] Komplexität reduziert (Metrik gemessen)
- [ ] Code einfacher (KISS)
- [ ] SOLID eingehalten
- [ ] PHPStan Level 8 OK
- [ ] Code formatiert (PER-CS 3.0)
- [ ] Atomare Commits (1 Änderung = 1 Commit)
- [ ] Klare Commit-Nachricht
- [ ] Dokumentation bei größerem Refactoring (ADR)
- [ ] Review durchgeführt

**Wenn alle Kästchen markiert → MERGE!**

---

## Zu vermeidende Anti-Patterns

### ❌ "Big Bang"-Refactoring

```bash
# ❌ SCHLECHT
# 3 Tage Refactoring ohne Commit
# Dann 1 großer Commit mit 50 geänderten Dateien
git commit -m "refactor: verbessere gesamten Code"
```

**Warum das schlecht ist:**
- Unmöglich zu reviewen
- Hohes Regressionsrisiko
- Schwer zurückzurollen
- Verlust der Historie

```bash
# ✅ GUT
# Atomare Commits
git commit -m "refactor: benenne Variable data um"
git commit -m "refactor: extrahiere Methode validateData"
git commit -m "refactor: verschiebe Validierung zu dedizierter Klasse"
```

### ❌ Refactoring ohne Tests

```bash
# ❌ SCHLECHT
make test
# ❌ 5 Tests fehlgeschlagen

# Man refactored trotzdem...
```

**Konsequenz:** Risiko Code zu brechen ohne es zu merken

```bash
# ✅ GUT
make test
# ❌ 5 Tests fehlgeschlagen

# 1. Tests korrigieren
# 2. DANN refactoren
```

### ❌ Refactoring und Feature mischen

```bash
# ❌ SCHLECHT
git commit -m "feat: füge kostenpflichtige Optionen hinzu + refactor pricing"
```

**Konsequenz:** Wenn Feature abgelehnt wird, verlieren wir das Refactoring

```bash
# ✅ GUT
git commit -m "refactor: extrahiere PrixCalculatorService"
git commit -m "feat: füge kostenpflichtige Optionen hinzu"
```

---

**Geschätzte Zeit eines Refactorings:** 30 Min. - 4 Std. je nach Umfang

**Regel:** Wenn > 4 Std. → In mehrere kleinere Refactorings aufteilen
