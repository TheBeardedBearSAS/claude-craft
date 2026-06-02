# Checkliste: Neues Feature

## Phase 1: Analyse (PFLICHT)

### Den Bedarf verstehen

- [ ] **Ziel** klar definiert
  - Welche Funktionalität genau?
  - Welches Problem wird gelöst?
  - Was sind die Akzeptanzkriterien?

- [ ] **Geschäftlicher Kontext** verstanden
  - Welche geschäftliche Auswirkung?
  - Welche Benutzer sind betroffen?
  - Gibt es spezifische geschäftliche Einschränkungen?

- [ ] **Technische Anforderungen** identifiziert
  - Erforderliche Performance?
  - Skalierbarkeit?
  - Sicherheit?
  - Kompatibilität?

### Bestehenden Code erkunden

- [ ] **Ähnliche Muster** identifiziert
  ```bash
  rg "class.*Service" --type py
  rg "class.*Repository" --type py
  ```

- [ ] **Architektur** analysiert
  ```bash
  tree src/ -L 3 -I "__pycache__|*.pyc"
  ```

- [ ] **Projektstandards** verstanden
  - Namenskonventionen
  - Fehlerbehandlungsmuster
  - Teststruktur

### Auswirkungen identifizieren

- [ ] **Auswirkungsmatrix** erstellt
  - Welche Module sind betroffen?
  - Welche DB-Migrationen sind notwendig?
  - Welche API-Änderungen?

- [ ] **Abhängigkeiten** identifiziert
  - Module, die vom zu ändernden Code abhängen
  - Module, von denen der neue Code abhängt

### Die Lösung entwerfen

- [ ] **Architektur** definiert
  - Welche Schicht (Domain/Application/Infrastructure)?
  - Welche Klassen/Funktionen erstellen?
  - Welche Interfaces notwendig?

- [ ] **Datenfluss** dokumentiert
  - Wie fließen die Daten?
  - Welche Transformationen?

- [ ] **Technische Entscheidungen** begründet
  - Warum dieser Ansatz?
  - Welche Alternativen wurden berücksichtigt?

### Implementierung planen

- [ ] **Aufgaben** in atomare Schritte aufgeteilt
- [ ] **Reihenfolge** der Implementierung definiert
- [ ] **Schätzung** mit Puffer (20%) durchgeführt

### Risiken identifizieren

- [ ] **Risiken** identifiziert und bewertet
- [ ] **Mitigationen** geplant
- [ ] **Fallbacks** wenn möglich definiert

### Tests definieren

- [ ] **Teststrategie** definiert
  - Unit-Tests
  - Integrationstests
  - E2E-Tests
- [ ] **Zielabdeckung** definiert

Siehe `rules/01-workflow-analysis.md` für Details.

## Phase 2: Implementierung

### Domain-Schicht (falls zutreffend)

- [ ] **Entities** erstellt
  - [ ] Dataclass oder Python-Klasse
  - [ ] Validierung in `__post_init__`
  - [ ] Geschäftsmethoden
  - [ ] Gleichheit basierend auf ID
  - [ ] Vollständige Docstrings

- [ ] **Value Objects** erstellt
  - [ ] `frozen=True` (unveränderlich)
  - [ ] Strenge Validierung
  - [ ] Wertbasierte Gleichheit

- [ ] **Domain-Services** erstellt (falls notwendig)
  - [ ] Geschäftslogik mit mehreren Entities
  - [ ] Injizierte Abhängigkeiten
  - [ ] Keine Infrastrukturabhängigkeit

- [ ] **Repository-Interfaces** erstellt
  - [ ] Protocol in domain/repositories/
  - [ ] Dokumentierte Methoden

- [ ] **Domain-Exceptions** erstellt
  - [ ] Erben von DomainException
  - [ ] Klare Meldungen

### Application-Schicht

- [ ] **DTOs** erstellt
  - [ ] Pydantic BaseModel
  - [ ] from_entity() und to_dict() falls notwendig
  - [ ] Pydantic-Validierung

- [ ] **Commands** erstellt
  - [ ] Dataclass oder Pydantic
  - [ ] Alle Use-Case-Eingaben

- [ ] **Use Cases** erstellt
  - [ ] Eine Klasse pro Use Case
  - [ ] Abhängigkeiten über __init__ injiziert
  - [ ] execute()-Methode
  - [ ] Eingabevalidierung
  - [ ] Fehlerbehandlung
  - [ ] Gibt DTO zurück

### Infrastructure-Schicht

- [ ] **Datenbankmodelle** erstellt (falls neue Entity)
  - [ ] SQLAlchemy-Modell
  - [ ] Geeignete Spalten
  - [ ] Indizes falls notwendig
  - [ ] Relationen falls notwendig

- [ ] **Migrationen** erstellt
  ```bash
  make db-migrate msg="Migrationsbeschreibung"
  ```
  - [ ] Migration getestet (upgrade + downgrade)

- [ ] **Repositories** implementiert
  - [ ] Implementiert Domain-Interface
  - [ ] Entity <-> Modell-Konvertierung
  - [ ] Fehlerbehandlung
  - [ ] Rollback bei Fehler

- [ ] **API-Routen** erstellt
  - [ ] FastAPI-Router
  - [ ] Pydantic-Schemas
  - [ ] Dependency Injection
  - [ ] Geeignete Status-Codes
  - [ ] Fehlerbehandlung

- [ ] **Externe Services** integriert (falls notwendig)
  - [ ] Implementiert Domain-Interface
  - [ ] Retry-Logik
  - [ ] Timeout-Behandlung
  - [ ] Fehlerbehandlung

### Konfiguration

- [ ] **Dependency Injection** konfiguriert
  - [ ] Container aktualisiert
  - [ ] Factories erstellt
  - [ ] FastAPI-Abhängigkeiten erstellt

- [ ] **Umgebungsvariablen** hinzugefügt
  - [ ] Zu `.env.example` hinzugefügt
  - [ ] In README dokumentiert
  - [ ] Validierung mit Pydantic Settings

- [ ] **Konfiguration** aktualisiert
  - [ ] Config-Klasse aktualisiert
  - [ ] Standardwerte definiert

## Phase 3: Tests

### Unit-Tests

- [ ] **Domain-Schicht** getestet
  - [ ] Tests für jede Entity
  - [ ] Tests für jedes Value Object
  - [ ] Tests für jeden Service
  - [ ] Abdeckung > 95%

- [ ] **Application-Schicht** getestet
  - [ ] Tests für jeden Use Case
  - [ ] Mocks für Abhängigkeiten
  - [ ] Normalfälle + Randfälle
  - [ ] Abdeckung > 90%

- [ ] **Alle Unit-Tests** bestehen
  ```bash
  make test-unit
  ```

### Integrationstests

- [ ] **Repository** getestet
  - [ ] CRUD-Operationen
  - [ ] Suchmethoden
  - [ ] Mit echter DB (testcontainers)

- [ ] **API-Routen** getestet
  - [ ] Normalfälle
  - [ ] Fehler (400, 404, 409, 500)
  - [ ] Mit FastAPI TestClient

- [ ] **Alle Integrationstests** bestehen
  ```bash
  make test-integration
  ```

### E2E-Tests

- [ ] **Vollständige Abläufe** getestet
  - [ ] Happy Path
  - [ ] Kritische Fehlerfälle

- [ ] **Alle E2E-Tests** bestehen
  ```bash
  make test-e2e
  ```

### Abdeckung

- [ ] **Gesamtabdeckung** > 80%
  ```bash
  make test-cov
  ```
- [ ] **Domain-Abdeckung** > 95%
- [ ] **Application-Abdeckung** > 90%

## Phase 4: Qualität

### Code-Qualität

- [ ] **Linting** erfolgreich
  ```bash
  make lint
  ```

- [ ] **Formatierung** korrekt
  ```bash
  make format-check
  ```

- [ ] **Typprüfung** erfolgreich
  ```bash
  make type-check
  ```

- [ ] **Sicherheitsprüfung** erfolgreich
  ```bash
  make security-check
  ```

### Persönliches Code-Review

- [ ] **SOLID** eingehalten
  - [ ] Single Responsibility
  - [ ] Open/Closed
  - [ ] Liskov Substitution
  - [ ] Interface Segregation
  - [ ] Dependency Inversion

- [ ] **KISS, DRY, YAGNI** eingehalten
  - [ ] Einfache Lösung
  - [ ] Keine Duplikation
  - [ ] Kein unnötiger Code

- [ ] **Clean Architecture** eingehalten
  - [ ] Abhängigkeiten nach innen
  - [ ] Unabhängige Domain
  - [ ] Abstraktionen (Protocols)

- [ ] **Benennung** klar und konsistent
- [ ] **Docstrings** vollständig
- [ ] **Kommentare** nur für komplexe Logik
- [ ] **Toter Code** entfernt

## Phase 5: Dokumentation

- [ ] **API-Dokumentation** aktuell
  - [ ] Neue Endpunkte dokumentiert
  - [ ] Beispiele bereitgestellt
  - [ ] Klare Request/Response-Schemas

- [ ] **README** falls notwendig aktualisiert
  - [ ] Neue Features dokumentiert
  - [ ] Setup-Anweisungen aktuell

- [ ] **ADR** erstellt falls wichtige Architekturentscheidung
  ```markdown
  docs/adr/NNNN-beschreibung.md
  ```

- [ ] **Changelog** aktualisiert
  ```markdown
  ## [Unreleased]
  ### Added
  - Feature-Beschreibung
  ```

## Phase 6: Git & PR

### Commits

- [ ] **Commits** folgen den Conventional Commits
  ```
  feat(scope): add user notification system

  - Implement email notifications
  - Add SMS notification support
  - Create notification repository

  Closes #123
  ```

- [ ] **Atomare Commits**
  - Keine riesigen Commits
  - Ein Commit = eine logische Änderung

### Pull Request

- [ ] **Branch** korrekt benannt
  ```
  feature/user-notifications
  ```

- [ ] **PR-Beschreibung** vollständig
  ```markdown
  ## Zusammenfassung
  - Was
  - Warum
  - Wie

  ## Änderungen
  - Änderung 1
  - Änderung 2

  ## Tests
  - Wie getestet
  - Screenshots falls UI

  ## Checkliste
  - [x] Tests bestehen
  - [x] Docs aktualisiert
  ```

- [ ] **Tests** bestehen auf CI
- [ ] **Keine Konflikte** mit main
- [ ] **Self-Review** durchgeführt

## Phase 7: Deployment

### Vor dem Deployment

- [ ] **DB-Migration** bereit
  - [ ] Lokal getestet
  - [ ] Im Staging getestet
  - [ ] Rollback-Plan definiert

- [ ] **Umgebungsvariablen** dokumentiert
  - [ ] DevOps-Team informiert
  - [ ] Produktionswerte bereitgestellt

- [ ] **Feature-Flags** konfiguriert (falls zutreffend)
  - [ ] Feature standardmäßig deaktiviert
  - [ ] Rollout-Plan definiert

### Nach dem Deployment

- [ ] **Monitoring** eingerichtet
  - [ ] Logs überprüft
  - [ ] Metriken überprüft
  - [ ] Alerts konfiguriert

- [ ] **Smoke-Tests** durchgeführt
  - [ ] Feature in Produktion getestet
  - [ ] Keine sichtbaren Fehler

- [ ] **Rollback-Plan** bereit falls Problem

## Schnell-Checkliste

### Unverzichtbares Minimum

- [ ] Vollständige Analyse durchgeführt
- [ ] Saubere Architektur (Clean + SOLID)
- [ ] Tests geschrieben und bestehend (> 80% Abdeckung)
- [ ] `make quality` erfolgreich
- [ ] Dokumentation aktuell
- [ ] Vollständige PR-Beschreibung

### Vor dem Merge

- [ ] Genehmigtes Review
- [ ] CI erfolgreich
- [ ] Keine Konflikte
- [ ] Commits squashen falls notwendig

### Rote Flags

Falls einer dieser Punkte zutrifft, **NICHT MERGEN**:

- ❌ Analyse nicht durchgeführt
- ❌ Tests fehlen
- ❌ Abdeckung < 80%
- ❌ Linting-/Typfehler
- ❌ Hardcodierte Secrets
- ❌ Undokumentierte Breaking Changes
- ❌ Nicht getestete DB-Migration
