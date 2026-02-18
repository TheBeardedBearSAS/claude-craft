---
description: Vollständiges Symfony-Konformitäts-Audit
argument-hint: [arguments]
---

# Vollständiges Symfony-Konformitäts-Audit

## Argumente

$ARGUMENTS : Pfad zum zu auditierenden Symfony-Projekt (optional, Standard: aktuelles Verzeichnis)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Du bist ein erfahrener Symfony-Auditor, der ein vollständiges Konformitäts-Audit eines Symfony-Projekts durchführt.

### Schritt 1: Projekt überprüfen

1. Zu auditierendes Projektverzeichnis identifizieren
2. Prüfen, ob es sich um ein Symfony-Projekt handelt (composer.json mit symfony/*)
3. Verwendete Symfony-Version prüfen

### Schritt 2: Architektur-Audit (25 Punkte)

Architektur-Audit durchführen und prüfen:

**Regelreferenz**: `.claude/rules/symfony-architecture.md`

- [ ] Ordnerstruktur entspricht Clean Architecture
- [ ] Trennung Domain / Application / Infrastructure
- [ ] Einhaltung von DDD-Prinzipien (Entities, Value Objects, Aggregates)
- [ ] Hexagonale Architektur (Ports & Adapters)
- [ ] Verwendung von Deptrac zur Abhängigkeitsprüfung
- [ ] Keine Kopplung zwischen Schichten
- [ ] Korrekt definierte Interfaces für Ports
- [ ] Gut definierte Use Cases / Application Services
- [ ] Repositories mit Interfaces in der Domain
- [ ] DTOs für Datentransfer

**Architektur-Score**: ___/25 Punkte

### Schritt 3: Code-Qualitäts-Audit (25 Punkte)

Code-Qualitäts-Audit durchführen und prüfen:

**Regelreferenz**: `.claude/rules/symfony-code-quality.md`

- [ ] Einhaltung von PSR-12
- [ ] PHPStan Level 9 ohne Fehler
- [ ] Strikte Type Hints auf allen Parametern und Rückgaben
- [ ] `declare(strict_types=1)` in allen Dateien
- [ ] Kein toter Code (von PHPStan erkannt)
- [ ] Keine ungenutzten Abhängigkeiten
- [ ] Zyklomatische Komplexität < 10 pro Methode
- [ ] Methodenlänge < 20 Zeilen
- [ ] Klassen mit Single Responsibility
- [ ] Vollständige und aktuelle PHPDoc-Dokumentation

**Code-Qualitäts-Score**: ___/25 Punkte

### Schritt 4: Test-Audit (25 Punkte)

Test-Audit durchführen und prüfen:

**Regelreferenz**: `.claude/rules/symfony-testing.md`

- [ ] Code-Abdeckung ≥ 80%
- [ ] Unit-Tests für Domain
- [ ] Integrationstests für Infrastructure
- [ ] Funktionale Tests mit Behat oder Symfony WebTestCase
- [ ] Mutation-Tests mit Infection (MSI ≥ 70%)
- [ ] Fixtures für Tests
- [ ] Isolierte Tests (keine gegenseitigen Abhängigkeiten)
- [ ] Separate Test-Datenbank
- [ ] Angemessene Mocks und Stubs
- [ ] CI/CD mit automatischer Testausführung

**Test-Score**: ___/25 Punkte

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheits-Audit durchführen und prüfen:

**Regelreferenz**: `.claude/rules/symfony-security.md`

- [ ] Symfony Security Bundle korrekt konfiguriert
- [ ] OWASP Top 10: Schutz gegen SQL-Injection
- [ ] OWASP Top 10: XSS-Schutz
- [ ] OWASP Top 10: CSRF-Schutz
- [ ] OWASP Top 10: Sichere Authentifizierung
- [ ] OWASP Top 10: Zugriffskontrolle (Voters, ACL)
- [ ] DSGVO: Benutzereinwilligung
- [ ] DSGVO: Implementiertes Recht auf Vergessenwerden
- [ ] DSGVO: Export persönlicher Daten
- [ ] Externalisierte Secrets (nicht im Code)

**Sicherheits-Score**: ___/25 Punkte

### Schritt 6: Gesamt-Score berechnen

**GESAMT-SCORE**: ___/100 Punkte

Interpretation:
- ✅ 90-100: Exzellent - Vorbildliche Konformität
- ✅ 75-89: Gut - Einige kleinere Verbesserungen
- ⚠️ 60-74: Mittel - Verbesserungen erforderlich
- ⚠️ 40-59: Unzureichend - Umfangreiches Refactoring erforderlich
- ❌ 0-39: Kritisch - Vollständige Überarbeitung notwendig

### Schritt 7: Detaillierter Bericht

Strukturierten Bericht erstellen mit:

```
=================================================
   SYMFONY-KONFORMITÄTS-AUDIT
=================================================

📊 GESAMT-SCORE: ___/100

📐 Architektur       : ___/25 [✅|⚠️|❌]
🎯 Code-Qualität     : ___/25 [✅|⚠️|❌]
🧪 Testing           : ___/25 [✅|⚠️|❌]
🔒 Sicherheit        : ___/25 [✅|⚠️|❌]

=================================================
   DETAILS PRO KATEGORIE
=================================================

[Details jedes Audits einfügen]

=================================================
   TOP 3 PRIORITÄTEN
=================================================

1. [Priorität #1 mit geschätzter Auswirkung]
2. [Priorität #2 mit geschätzter Auswirkung]
3. [Priorität #3 mit geschätzter Auswirkung]

=================================================
   TECHNISCHE EMPFEHLUNGEN
=================================================

- [Spezifische technische Empfehlung]
- [Spezifische technische Empfehlung]
- [Spezifische technische Empfehlung]

=================================================
```

### Schritt 8: Docker-Befehle für Überprüfungen

Für jede Überprüfung Docker verwenden, um sich von der lokalen Umgebung zu abstrahieren:

```bash
# PHPStan
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9

# PHP_CodeSniffer (PSR-12)
docker run --rm -v $(pwd):/project php:8.2-cli vendor/bin/phpcs --standard=PSR12 src/

# PHPUnit mit Abdeckung
docker run --rm -v $(pwd):/app php:8.2-cli vendor/bin/phpunit --coverage-text --coverage-html=coverage

# Infection (Mutation Testing)
docker run --rm -v $(pwd):/app infection/infection --min-msi=70

# Deptrac
docker run --rm -v $(pwd):/app qossmic/deptrac analyse
```

## WICHTIG

- IMMER Docker für Befehle verwenden, um sich von der lokalen Umgebung zu abstrahieren
- NIEMALS Dateien in /tmp speichern
- Konkrete Beispiele für erkannte Probleme liefern
- Maßnahmen nach Auswirkung und Aufwand priorisieren
- Objektiv und sachlich in der Bewertung sein
