# Python-Architektur prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## MISSION

Führen Sie ein vollständiges Architektur-Audit des Python-Projekts gemäß den in den Projektregeln definierten Clean Architecture- und Hexagonal Architecture-Prinzipien durch.

### Schritt 1: Projektstruktur analysieren

Untersuchen Sie die Verzeichnisstruktur und identifizieren Sie:
- [ ] Vorhandensein von Domain/Application/Infrastructure/Presentation-Layern
- [ ] Klare Trennung zwischen Layern (keine invertierten Abhängigkeiten)
- [ ] Organisation der Module nach Geschäftsdomäne
- [ ] Package-Struktur konsistent mit Architekturregeln

**Referenz**: `rules/02-architecture.md` Abschnitte "Clean Architecture" und "Hexagonal Architecture"

### Schritt 2: Abhängigkeiten zwischen Layern überprüfen

Analysieren Sie Imports und Abhängigkeiten:
- [ ] Domain hängt von keinem anderen Layer ab
- [ ] Application hängt nur von Domain ab
- [ ] Infrastructure hängt nur von Domain und Application ab
- [ ] Presentation enthält keine Geschäftslogik
- [ ] Dependency Rule eingehalten (nur nach innen)

**Überprüfen**: Keine Imports von externen Layern in Domain/Application

### Schritt 3: Interfaces und Ports

Überprüfen Sie die Implementierung von Ports und Adaptern:
- [ ] Interfaces (Ports) in Domain/Application definiert
- [ ] Implementierungen (Adapter) in Infrastructure
- [ ] Verwendung von Dependency Injection
- [ ] Keine enge Kopplung mit externen Frameworks

**Referenz**: `rules/02-architecture.md` Abschnitt "Ports and Adapters"

### Schritt 4: Entities und Value Objects

Prüfen Sie Domain-Modellierung:
- [ ] Reichhaltige Entities mit gekapselter Geschäftslogik
- [ ] Unveränderliche Value Objects
- [ ] Ordnungsgemäß abgegrenzte Aggregate
- [ ] Domain Events falls zutreffend
- [ ] Keine Infrastructure-Logik in Entities

**Referenz**: `rules/02-architecture.md` Abschnitt "Domain Layer"

### Schritt 5: Services und Use Cases

Analysieren Sie die Organisation der Anwendungslogik:
- [ ] Use Cases/Application Services klar identifiziert
- [ ] Ein Use Case = Eine Geschäftsaktion
- [ ] Domain Services für komplexe Geschäftslogik
- [ ] Keine Geschäftslogik in Controllern/Handlern
- [ ] Transaktionen auf Application-Ebene verwaltet

**Referenz**: `rules/02-architecture.md` Abschnitt "Application Layer"

### Schritt 6: SOLID-Prinzipien

Überprüfen Sie die Anwendung der SOLID-Prinzipien:
- [ ] Single Responsibility: Eine Klasse = Ein Grund zur Änderung
- [ ] Open/Closed: Erweiterung durch Vererbung/Komposition, nicht Änderung
- [ ] Liskov Substitution: Subtypen sind substituierbar
- [ ] Interface Segregation: Spezifische und minimale Schnittstellen
- [ ] Dependency Inversion: Abhängigkeit von Abstraktionen

**Referenz**: `rules/04-solid-principles.md`

### Schritt 7: Bewertung berechnen

Punktevergabe (von 25):
- Struktur und Layer-Trennung: 6 Punkte
- Dependency-Einhaltung: 6 Punkte
- Ports und Adapter: 4 Punkte
- Domain-Modellierung: 4 Punkte
- Use Cases und Services: 3 Punkte
- SOLID-Prinzipien: 2 Punkte

## AUSGABEFORMAT

```
PYTHON-ARCHITEKTUR-AUDIT
================================

GESAMTBEWERTUNG: XX/25

STÄRKEN:
- [Liste der identifizierten positiven Punkte]

VERBESSERUNGEN:
- [Liste geringfügiger Verbesserungen]

KRITISCHE PROBLEME:
- [Liste schwerwiegender Architektumverletzungen]

DETAILS NACH KATEGORIE:

1. STRUKTUR UND LAYER (XX/6)
   Status: [Details der Struktur]

2. ABHÄNGIGKEITEN (XX/6)
   Status: [Abhängigkeitsanalyse]

3. PORTS UND ADAPTER (XX/4)
   Status: [Interface-Implementierung]

4. DOMAIN-MODELLIERUNG (XX/4)
   Status: [Qualität der Entities und VOs]

5. USE CASES (XX/3)
   Status: [Organisation der Anwendungslogik]

6. SOLID-PRINZIPIEN (XX/2)
   Status: [Anwendung der SOLID-Prinzipien]

TOP 3 PRIORITÄTS-AKTIONEN:
1. [Kritischste Aktion mit geschätzter Auswirkung]
2. [Zweite Prioritätsaktion]
3. [Dritte Prioritätsaktion]
```

## HINWEISE

- `grep`, `find` und Code-Analyse verwenden, um Verletzungen zu erkennen
- Konkrete Beispiele problematischer Dateien/Klassen bereitstellen
- Präzise Refactorings für jedes identifizierte Problem vorschlagen
- Aktionen nach Wartbarkeitsauswirkung priorisieren
