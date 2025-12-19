---
description: Flutter Architektur-Prüfung
argument-hint: [arguments]
---

# Flutter Architektur-Prüfung

## Argumente

$ARGUMENTS

## MISSION

Du bist ein Flutter-Experte, der beauftragt ist, die Projektarchitektur gemäß den Prinzipien der Clean Architecture zu prüfen.

### Schritt 1: Analyse der Projektstruktur

- [ ] Ordnerstruktur des Projekts identifizieren
- [ ] Dateien `pubspec.yaml` und `analysis_options.yaml` lokalisieren
- [ ] Regeln aus `/rules/02-architecture.md` referenzieren
- [ ] SOLID-Prinzipien aus `/rules/04-solid-principles.md` referenzieren

### Schritt 2: Architektur-Prüfungen (25 Punkte)

#### 2.1 Organisation in Clean Architecture Layern (10 Punkte)
- [ ] **Domain Layer**: Isolierte Entities und Use Cases (0-4 Pkt)
  - `lib/domain/entities/` und `lib/domain/usecases/` prüfen
  - Keine Abhängigkeiten zu data oder presentation
  - Reine Entities nur mit Geschäftslogik
- [ ] **Data Layer**: Repositories, DataSources, Models (0-3 Pkt)
  - `lib/data/repositories/`, `lib/data/datasources/`, `lib/data/models/` prüfen
  - Implementierung der Domain-Interfaces
  - Trennung remote/local datasources
- [ ] **Presentation Layer**: UI, States, BLoCs/Providers (0-3 Pkt)
  - `lib/presentation/pages/`, `lib/presentation/widgets/`, `lib/presentation/blocs/` prüfen
  - Trennung UI/Business Logic
  - Wiederverwendbare Widgets in `/widgets/common/`

#### 2.2 Dependency Injection (5 Punkte)
- [ ] **DI Container** konfiguriert (get_it, injectable, riverpod) (0-3 Pkt)
- [ ] **Kein direktes new()** in Widgets (0-2 Pkt)
- [ ] Alle Abhängigkeiten über Konstruktor injiziert

#### 2.3 Verantwortungstrennung (5 Punkte)
- [ ] **Single Responsibility**: Eine Klasse = eine Verantwortung (0-2 Pkt)
- [ ] **Interface Segregation**: Kleine und spezialisierte Interfaces (0-2 Pkt)
- [ ] **Dependency Inversion**: Abhängig von Abstraktionen, nicht Implementierungen (0-1 Pkt)

#### 2.4 Modulare Struktur (5 Punkte)
- [ ] **Isolierte Features**: Code nach Funktionalität organisiert (0-2 Pkt)
- [ ] **Core/Shared**: Gemeinsame Utilities getrennt (0-2 Pkt)
- [ ] **Keine Kopplung** zwischen Features (0-1 Pkt)

### Schritt 3: Punkteberechnung

```
ARCHITEKTUR-SCORE = Summe der Punkte / 25

Interpretation:
✅ 20-25 Pkt: Exzellente Architektur
⚠️ 15-19 Pkt: Korrekte Architektur, Verbesserungen empfohlen
⚠️ 10-14 Pkt: Architektur zu verbessern
❌ 0-9 Pkt: Problematische Architektur
```

### Schritt 4: Detaillierter Bericht

Erstelle einen Bericht mit:

#### 📊 ARCHITEKTUR-SCORE: XX/25

#### ✅ Stärken
- Liste erkannter Best Practices
- Beispiele für gut strukturierten Code

#### ⚠️ Verbesserungspunkte
- Erkannte Verstöße mit Dateien und Zeilen
- Auswirkungen auf Wartbarkeit

#### ❌ Kritische Verstöße
- Größere Architekturprobleme
- Starke Kopplung, zirkuläre Abhängigkeiten

#### 🎯 TOP 3 PRIORITÄRE MASSNAHMEN

1. **[HOHE PRIORITÄT]** Wichtigste Maßnahme mit geschätztem Aufwand und Impact
2. **[MITTLERE PRIORITÄT]** Zweite Maßnahme mit Begründung
3. **[NIEDRIGE PRIORITÄT]** Dritte Maßnahme für kontinuierliche Verbesserung

---

**Hinweis**: Dieser Bericht konzentriert sich ausschließlich auf die Architektur. Für ein vollständiges Audit verwenden Sie `/check-compliance`.
