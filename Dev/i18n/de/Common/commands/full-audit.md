# Vollständiges Multi-Technologie-Audit

Sie sind ein Code-Audit-Experte. Sie müssen ein vollständiges Compliance-Audit des Projekts durchführen, indem Sie vorhandene Technologien automatisch erkennen und entsprechende Regeln anwenden.

## Argumente
$ARGUMENTS

Falls keine Argumente angegeben, alle Technologien automatisch erkennen.

## MISSION

### Schritt 1: Technologie-Erkennung

Projekt scannen, um vorhandene Technologien zu identifizieren:

| Datei | Technologie |
|---------|-------------|
| `composer.json` + `symfony/*` | Symfony |
| `pubspec.yaml` + `flutter:` | Flutter |
| `pyproject.toml` oder `requirements.txt` | Python |
| `package.json` + `react` (ohne `react-native`) | React |
| `package.json` + `react-native` | React Native |

Für jede erkannte Technologie:
1. Regeln aus `.claude/rules/` laden
2. Spezifisches Audit anwenden

### Schritt 2: Audit nach Technologie

Für JEDE erkannte Technologie überprüfen:

#### Architektur (25 Punkte)
- [ ] Getrennte Schichten (Domain/Application/Infrastructure)
- [ ] Nach innen gerichtete Abhängigkeiten (zur Domain)
- [ ] Ordnerstruktur entspricht Konventionen
- [ ] Keine Framework-Kopplung in Domain
- [ ] Architektur-Patterns eingehalten

#### Code-Qualität (25 Punkte)
- [ ] Namensstandards eingehalten
- [ ] Linting/Analyze ohne kritische Fehler
- [ ] Type Hints/Annotations vorhanden
- [ ] Öffentliche Klassen dokumentiert
- [ ] Zyklomatische Komplexität < 10

#### Testing (25 Punkte)
- [ ] Coverage ≥ 80%
- [ ] Unit Tests für Domain
- [ ] Integrationstests vorhanden
- [ ] E2E/Widget Tests für UI
- [ ] Test-Pyramide eingehalten

#### Sicherheit (25 Punkte)
- [ ] Keine Secrets im Quellcode
- [ ] Input-Validierung bei allen Eingaben
- [ ] OWASP-Schutz (XSS, CSRF, Injection)
- [ ] Sensible Daten verschlüsselt
- [ ] Dependencies ohne bekannte Schwachstellen

### Schritt 3: Tools ausführen

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov

# React/React Native
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
```

### Schritt 4: Scores berechnen

Für jede Technologie berechnen:
- Architektur-Score: X/25
- Code-Qualität-Score: X/25
- Testing-Score: X/25
- Sicherheits-Score: X/25
- **Gesamt-Score: X/100**

### Schritt 5: Bericht generieren

```
══════════════════════════════════════════════════════════════
📊 MULTI-TECHNOLOGIE-AUDIT - Gesamt-Score: XX/100
══════════════════════════════════════════════════════════════

Erkannte Technologien: [Liste]
Datum: YYYY-MM-DD

──────────────────────────────────────────────────────────────
🔷 SYMFONY - Score: XX/100
──────────────────────────────────────────────────────────────

🏗️ Architektur (XX/25)
  ✅ Clean Architecture eingehalten
  ✅ CQRS korrekt implementiert
  ⚠️ 2 Services greifen direkt auf Repository zu

📝 Code-Qualität (XX/25)
  ✅ PHPStan Level 8 - 0 Fehler
  ✅ PSR-12 Konventionen eingehalten
  ⚠️ 5 Methoden > 20 Zeilen

🧪 Testing (XX/25)
  ✅ Coverage: 85%
  ✅ Domain Unit Tests
  ⚠️ Keine Panther E2E Tests

🔒 Sicherheit (XX/25)
  ✅ Keine Secrets im Code
  ✅ CSRF aktiviert
  ⚠️ Dependency mit geringfügigem CVE

──────────────────────────────────────────────────────────────
🔷 FLUTTER - Score: XX/100
──────────────────────────────────────────────────────────────

[Gleiche Struktur]

══════════════════════════════════════════════════════════════
📋 GLOBALE ZUSAMMENFASSUNG
══════════════════════════════════════════════════════════════

| Technologie | Architektur | Code | Tests | Sicherheit | Gesamt |
|-------------|--------------|------|-------|----------|-------|
| Symfony     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|
| Flutter     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|
| DURCHSCHNITT| XX/25        | XX/25| XX/25 | XX/25    | XX/100|

══════════════════════════════════════════════════════════════
🎯 TOP 5 PRIORITÄTS-AKTIONEN
══════════════════════════════════════════════════════════════

1. [KRITISCH] Aktion 1 Beschreibung
   → Auswirkung: +X Punkte | Aufwand: Niedrig/Mittel/Hoch

2. [HOCH] Aktion 2 Beschreibung
   → Auswirkung: +X Punkte | Aufwand: Niedrig/Mittel/Hoch

3. [MITTEL] Aktion 3 Beschreibung
   → Auswirkung: +X Punkte | Aufwand: Niedrig/Mittel/Hoch

4. [MITTEL] Aktion 4 Beschreibung
   → Auswirkung: +X Punkte | Aufwand: Niedrig/Mittel/Hoch

5. [NIEDRIG] Aktion 5 Beschreibung
   → Auswirkung: +X Punkte | Aufwand: Niedrig/Mittel/Hoch
```

## Bewertungsregeln

### Abzüge nach Kategorie

| Verstoß | Verlorene Punkte |
|-----------|---------------|
| Architektur-Pattern verletzt | -5 |
| Framework/Domain-Kopplung | -3 |
| Kritischer Linting-Fehler | -2 |
| Linting-Warnung | -1 |
| Methode > 30 Zeilen | -1 |
| Coverage < 80% | -5 |
| Keine Domain Unit Tests | -5 |
| Secret im Code | -10 |
| Kritische CVE-Schwachstelle | -10 |
| Hohe CVE-Schwachstelle | -5 |

### Qualitäts-Schwellenwerte

| Score | Bewertung |
|-------|------------|
| 90-100 | Ausgezeichnet |
| 75-89 | Gut |
| 60-74 | Akzeptabel |
| 40-59 | Verbesserungsbedarf |
| < 40 | Kritisch |
