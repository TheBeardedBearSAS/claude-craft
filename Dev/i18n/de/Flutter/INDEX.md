# Vollständiger Index - Flutter Development Rules

## Überblick

Vollständige Struktur der Flutter-Entwicklungsregeln für Claude Code, inspiriert von der Symfony-Struktur, aber an Flutter/Dart angepasst.

**Gesamt**: 26 Dateien
- 1 Haupt-CLAUDE.md.template
- 1 README-Benutzerhandbuch
- 14 Regeldateien (rules/)
- 5 Code-Vorlagen (templates/)
- 4 Checklisten (checklists/)
- 1 Index (diese Datei)

---

## Hauptdateien

### CLAUDE.md.template
Hauptdatei zum Kopieren in jedes Flutter-Projekt. Enthält:
- Projektkontext
- Grundlegende Regeln
- Obligatorischer Workflow
- Makefile-Befehle
- Anweisungen für Claude

### README.md
Vollständiges Benutzerhandbuch:
- Wie man ein neues Projekt initialisiert
- Empfohlene Struktur
- Entwicklungs-Workflow
- Tool-Konfiguration

---

## Rules (14 Dateien)

### 00-project-context.md.template
Projektkontextvorlage mit Platzhaltern:
- Projektübersicht
- Gesamtarchitektur
- Technologie-Stack
- Besonderheiten und Konventionen
- Zu ersetzende Variablen: {{PROJECT_NAME}}, {{TECH_STACK}}, etc.

### 01-workflow-analysis.md (27 KB)
Obligatorische Methodik vor dem Codieren:
- Phase 1: Anforderungsverständnis
- Phase 2: Erkundung des vorhandenen Codes
- Phase 3: Lösungsdesign
- Phase 4: Testplan
- Phase 5: Schätzung und Planung
- Phase 6: Post-Implementierungs-Review
- Analysevorlagen
- Konkrete Beispiele (Favoriten-Feature)

### 02-architecture.md (53 KB)
Clean Architecture für Flutter:
- Die 3 Schichten (Domain, Data, Presentation)
- Detaillierte Ordnerstruktur
- Entities, Repositories, Use Cases
- Models, DataSources
- Vollständiges BLoC-Muster
- Dependency Injection
- Vollständige Code-Beispiele

### 03-coding-standards.md (24 KB)
Dart/Flutter-Code-Standards:
- Namenskonventionen
- Formatierung und Stil
- Code-Organisation
- Flutter-Widgets (const, Extraktion)
- Typen und Inferenz
- Dokumentation (dartdoc)
- Dart-Erweiterungen
- Async/await
- Linter-Konfiguration

### 04-solid-principles.md (38 KB)
SOLID-Prinzipien mit Flutter-Beispielen:
- S - Single Responsibility Principle
- O - Open/Closed Principle
- L - Liskov Substitution Principle
- I - Interface Segregation Principle
- D - Dependency Inversion Principle
- Konkrete Beispiele für jedes Prinzip
- Widgets, BLoCs, Repositories
- Abhängigkeitsdiagramme

### 05-kiss-dry-yagni.md (30 KB)
Prinzipien der Einfachheit:
- KISS: Keep It Simple, Stupid
- DRY: Don't Repeat Yourself
- YAGNI: You Aren't Gonna Need It
- Beispiele für Überkomplexität vs. einfache Lösungen
- State Management angepasst an die Komplexität
- Wiederverwendbare Widgets
- Balance zwischen Prinzipien

### 06-tooling.md (10 KB)
Werkzeuge und Befehle:
- Wichtige Flutter-CLI
- Pub-Befehle
- Docker für Flutter
- Vollständiges Makefile
- FVM (Flutter Version Management)
- Nützliche Skripte
- CI/CD (GitHub Actions, GitLab CI)
- VS Code-Konfiguration
- DevTools

### 07-testing.md (19 KB)
Vollständige Teststrategie:
- Testpyramide (70% Unit, 20% Widget, 10% Integration)
- Unit-Tests (Entities, Use Cases, BLoCs)
- Widget-Tests
- Integrationstests
- Golden-Tests
- Mocking mit Mocktail
- Test Coverage
- Best Practices (AAA-Muster)

### 08-quality-tools.md
Qualitätswerkzeuge:
- Dart Analyze
- DCM (Dart Code Metrics)
- Very Good Analysis
- Flutter Lints
- Benutzerdefinierte Lint-Regeln
- CI/CD-Integration
- Makefile-Targets

### 09-git-workflow.md
Git-Workflow:
- Conventional Commits
- Branch-Strategie (GitFlow)
- Pre-Commit-Hooks
- CI/CD
- Nützliche Git-Befehle

### 10-documentation.md
Dokumentationsstandards:
- Dartdoc-Format
- README.md-Struktur
- CHANGELOG.md
- API-Dokumentation
- Beispiele vollständiger Dokumentation

### 11-security.md
Flutter-Sicherheit:
- flutter_secure_storage
- API-Key-Verwaltung
- Umgebungsvariablen
- Obfuskierung
- HTTPS und Certificate Pinning
- Eingabevalidierung
- Authentifizierung (JWT)
- Berechtigungen
- Sicherheits-Checkliste

### 12-performance.md
Leistungsoptimierung:
- const Widgets
- ListView-Optimierung
- Bilder (Caching, Lazy Loading)
- Rebuilds vermeiden
- DevTools Profiling
- Lazy Loading & Code Splitting
- Performance-Checkliste

### 13-state-management.md
State-Management-Muster:
- Entscheidungsbaum (wann was verwenden)
- StatefulWidget
- ValueNotifier
- Provider
- Riverpod (empfohlen)
- BLoC (empfohlen für komplexe Apps)
- Vergleich der Muster
- Best Practices
- Empfehlungen nach Projektgröße

---

## Templates (5 Dateien)

### widget.md
Widget-Vorlagen:
- Stateless Widget
- Stateful Widget
- Consumer Widget (BLoC)

### bloc.md
Vollständige BLoC-Vorlage:
- Events
- States
- BLoC-Klasse

### repository.md
Repository-Vorlage:
- Interface (Domain-Schicht)
- Implementierung (Data-Schicht)

### test-widget.md
Widget-Test-Vorlage:
- Basis-Setup
- Anzeigetests
- Interaktionstests
- Aktualisierungstests

### test-unit.md
Unit-Test-Vorlage:
- Setup mit Mocks
- Erfolgstests
- Fehlertests
- Validierungstests

---

## Checklisten (4 Dateien)

### pre-commit.md
Checkliste vor Commit:
- Code-Qualität
- Tests
- Dokumentation
- Git
- Architektur
- Leistung
- Sicherheit

### new-feature.md
Checkliste für neue Feature:
- Analyse
- Domain-Schicht
- Data-Schicht
- Presentation-Schicht
- Integration
- Dokumentation
- Qualität

### refactoring.md
Checkliste für sicheres Refactoring:
- Vorbereitung
- Während des Refactorings
- Überprüfungen
- Vor dem Merge

### security.md
Checkliste für Sicherheitsaudit:
- Sensible Daten
- API & Netzwerk
- Authentifizierung
- Validierung
- Berechtigungen
- Produktion

---

## Statistiken

### Dateigrößen

| Datei | Größe | Ungef. Zeilen |
|-------|-------|---------------|
| 01-workflow-analysis.md | 27 KB | ~800 |
| 02-architecture.md | 53 KB | ~1600 |
| 03-coding-standards.md | 24 KB | ~700 |
| 04-solid-principles.md | 38 KB | ~1200 |
| 05-kiss-dry-yagni.md | 30 KB | ~900 |
| 06-tooling.md | 10 KB | ~300 |
| 07-testing.md | 19 KB | ~600 |
| 08-quality-tools.md | ~5 KB | ~150 |
| 09-git-workflow.md | ~4 KB | ~120 |
| 10-documentation.md | ~5 KB | ~150 |
| 11-security.md | ~6 KB | ~180 |
| 12-performance.md | ~5 KB | ~150 |
| 13-state-management.md | ~7 KB | ~210 |
| **GESAMT Rules** | **~233 KB** | **~7060 Zeilen** |

### Abdeckung

**Abgedeckte Themen**:
- ✅ Architektur (vollständige Clean Architecture)
- ✅ Coding-Standards (Effective Dart)
- ✅ Design-Prinzipien (SOLID, KISS, DRY, YAGNI)
- ✅ Testing (Unit, Widget, Integration, Golden)
- ✅ Tooling (CLI, Docker, Makefile, CI/CD)
- ✅ Qualität (Analyze, Linters, Metrics)
- ✅ Git-Workflow (Conventional Commits, Branching)
- ✅ Dokumentation (Dartdoc, README, CHANGELOG)
- ✅ Sicherheit (Storage, API-Keys, HTTPS, Auth)
- ✅ Leistung (Optimierungen, Profiling)
- ✅ State Management (BLoC, Riverpod, Provider)
- ✅ Code-Vorlagen
- ✅ Praktische Checklisten

---

## Verwendung

### Für ein neues Projekt

1. `CLAUDE.md.template` in `.claude/CLAUDE.md` kopieren
2. `rules/`, `templates/`, `checklists/` in `.claude/` kopieren
3. Mit Projektinformationen anpassen
4. `Makefile` im Stammverzeichnis erstellen
5. `analysis_options.yaml` konfigurieren
6. Regeln befolgen!

### Für Claude Code

`.claude/CLAUDE.md` zu Beginn jeder Sitzung lesen, um:
- Die Projektarchitektur zu verstehen
- Die Konventionen zu kennen
- Best Practices anzuwenden
- Geeignete Vorlagen zu verwenden
- Checklisten zu befolgen

---

## Vergleich mit Symfony Rules

### Ähnlichkeiten
- Modulare Struktur (rules/, templates/, checklists/)
- Obligatorischer Analyse-Workflow
- SOLID-Prinzipien
- Teststrategie
- Git-Workflow
- Dokumentationsstandards

### Flutter-Besonderheiten
- Clean Architecture (statt Symfony-Architektur)
- Widget-Komposition
- State Management (BLoC, Riverpod)
- const-Optimierungen
- DevTools-Profiling
- flutter_secure_storage
- Material Design / Cupertino

### Verbesserungen
- Detailliertere Code-Vorlagen
- Mehr Beispiele
- Vollständigere Checklisten
- Entscheidungsbäume (State Management, Architektur)
- Abhängigkeitsdiagramme

---

## Wartung

### Aktualisierung

Regeln aktualisieren bei:
- Neuer Flutter/Dart-Version
- Neuen Best Practices
- Neuen wichtigen Packages
- Projekt-Feedback

### Versionierung

Format: `MAJOR.MINOR.PATCH`
- MAJOR: Architektur- oder Prinzipienänderung
- MINOR: Hinzufügen von Regeln oder Vorlagen
- PATCH: Korrekturen und Klarstellungen

**Aktuelle Version**: 1.0.0

---

## Zusätzliche Ressourcen

### Dokumentation
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Wesentliche Packages
- flutter_bloc: State Management
- riverpod: State Management
- freezed: Code-Generierung
- dartz: Funktionale Programmierung
- get_it: Dependency Injection
- dio: HTTP-Client
- mocktail: Testing

---

**Erstellt am**: 2024-12-03
**Letzte Aktualisierung**: 2024-12-03
**Version**: 1.0.0
**Autor**: Claude Code Assistant
