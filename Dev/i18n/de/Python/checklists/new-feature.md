# Checkliste: Neues Feature

## Phase 1: Analyse (OBLIGATORISCH)

### Bedarf verstehen

- [ ] **Ziel** klar definiert
  - Welche Funktionalität genau?
  - Welches Problem wird gelöst?
  - Was sind die Akzeptanzkriterien?

- [ ] **Geschäftskontext** verstanden
  - Welche Geschäftsauswirkung?
  - Welche Benutzer betroffen?
  - Spezifische Geschäftsbeschränkungen?

- [ ] **Technische Einschränkungen** identifiziert
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

- [ ] **Impact-Matrix** erstellt
  - Welche Module betroffen?
  - Welche DB-Migrationen notwendig?
  - Welche API-Änderungen?

- [ ] **Abhängigkeiten** identifiziert
  - Module, die von zu änderndem Code abhängen
  - Module, von denen neuer Code abhängt

### Lösung entwerfen

- [ ] **Architektur** definiert
  - Welcher Layer (Domain/Application/Infrastructure)?
  - Welche Klassen/Funktionen zu erstellen?
  - Welche Interfaces notwendig?

- [ ] **Datenfluss** dokumentiert
  - Wie fließen Daten?
  - Welche Transformationen?

- [ ] **Technische Entscheidungen** begründet
  - Warum dieser Ansatz?
  - Welche Alternativen erwogen?

### Implementierung planen

- [ ] **Aufgaben** in atomare Schritte zerlegt
- [ ] **Reihenfolge** der Implementierung definiert
- [ ] **Schätzung** mit Puffer durchgeführt (20%)

### Risiken identifizieren

- [ ] **Risiken** identifiziert und bewertet
- [ ] **Mitigationen** geplant
- [ ] **Fallbacks** definiert wenn möglich

### Tests definieren

- [ ] **Teststrategie** definiert
  - Unit-Tests
  - Integrationstests
  - E2E-Tests
- [ ] **Ziel-Coverage** definiert

Siehe `rules/01-workflow-analysis.md` für Details.

## Phase 2: Implementierung

### Domain-Layer (Falls zutreffend)

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

- [ ] **Domain-Services** erstellt (falls erforderlich)
  - [ ] Multi-Entitäts-Geschäftslogik
  - [ ] Injizierte Abhängigkeiten
  - [ ] Keine Infrastructure-Abhängigkeit

- [ ] **Repository-Interfaces** erstellt
  - [ ] Protocol in domain/repositories/
  - [ ] Dokumentierte Methoden

- [ ] **Domain-Exceptions** erstellt
  - [ ] Von DomainException erben
  - [ ] Klare Meldungen

[... Rest der Phasen folgen dem gleichen Muster ...]

## Quick-Checkliste

### Mindestens erforderlich

- [ ] Vollständige Analyse durchgeführt
- [ ] Clean Architecture (Clean + SOLID)
- [ ] Tests geschrieben und bestanden (> 80% Coverage)
- [ ] `make quality` läuft durch
- [ ] Dokumentation aktualisiert
- [ ] Vollständige PR-Beschreibung

### Vor Merge

- [ ] Genehmigte Review
- [ ] CI läuft durch
- [ ] Keine Konflikte
- [ ] Commits squashen falls erforderlich

### Warnsignale

Wenn eines davon zutrifft, **NICHT MERGEN**:

- ❌ Analyse nicht durchgeführt
- ❌ Fehlende Tests
- ❌ Coverage < 80%
- ❌ Linting/Type-Fehler
- ❌ Fest codierte Geheimnisse
- ❌ Undokumentierte Breaking Changes
- ❌ Ungetestete DB-Migration
