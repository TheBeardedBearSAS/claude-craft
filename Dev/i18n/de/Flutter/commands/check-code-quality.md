---
description: Flutter Codequalitäts-Prüfung
argument-hint: [arguments]
---

# Flutter Codequalitäts-Prüfung

## Argumente

$ARGUMENTS

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Du bist ein Flutter-Experte, der beauftragt ist, die Codequalität gemäß Effective Dart und Best Practices zu prüfen.

### Schritt 1: Projektanalyse

- [ ] Alle Dart-Dateien des Projekts identifizieren
- [ ] Datei `analysis_options.yaml` analysieren
- [ ] Regeln aus `/rules/03-coding-standards.md` referenzieren
- [ ] Prinzipien aus `/rules/05-kiss-dry-yagni.md` referenzieren
- [ ] Linter-Konfiguration prüfen

### Schritt 2: Codequalitäts-Prüfungen (25 Punkte)

#### 2.1 Effective Dart Namenskonventionen (6 Punkte)
- [ ] **Klassen/Enums**: UpperCamelCase (0-1 Pkt)
  - Beispiele: `UserProfile`, `AuthenticationState`
- [ ] **Variablen/Methoden**: lowerCamelCase (0-1 Pkt)
  - Beispiele: `userName`, `fetchUserData()`
- [ ] **Konstanten**: lowerCamelCase (0-1 Pkt)
  - Beispiele: `maxRetries`, `defaultTimeout`
- [ ] **Dateien**: snake_case (0-1 Pkt)
  - Beispiele: `user_profile.dart`, `authentication_bloc.dart`
- [ ] **Packages**: snake_case (0-1 Pkt)
  - `pubspec.yaml` prüfen
- [ ] **Beschreibende Namen**: Kryptische Abkürzungen vermeiden (0-1 Pkt)

#### 2.2 Linting und statische Analyse (7 Punkte)
- [ ] **analysis_options.yaml** mit strikten Regeln konfiguriert (0-2 Pkt)
  - `flutter_lints` oder `very_good_analysis` einbinden
  - Benutzerdefinierte Regeln aktiviert
- [ ] **Keine Warnings** in `flutter analyze` (0-3 Pkt)
  - Ausführen: `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter analyze`
- [ ] **Keine Verstöße** gegen `prefer_const_constructors`, `unnecessary_null_in_if_null_operators` (0-2 Pkt)

#### 2.3 KISS, DRY, YAGNI Prinzipien (6 Punkte)
- [ ] **KISS (Keep It Simple)**: Methoden < 50 Zeilen (0-2 Pkt)
  - Keine unnötige komplexe Logik
  - Eine Abstraktionsebene pro Methode
- [ ] **DRY (Don't Repeat Yourself)**: Kein duplizierter Code (0-2 Pkt)
  - Gemeinsame Utilities in `/core/utils/`
  - Wiederverwendbare Widgets extrahiert
- [ ] **YAGNI (You Ain't Gonna Need It)**: Keine Über-Engineering (0-2 Pkt)
  - Kein Code "für alle Fälle"
  - Gerechtfertigte Abstraktionen

#### 2.4 Dokumentation und Kommentare (3 Punkte)
- [ ] **Öffentliche Klassen** mit `///` dokumentiert (0-1 Pkt)
- [ ] **Komplexe Methoden** mit erklärenden Kommentaren (0-1 Pkt)
- [ ] **Kein auskommentierter Code** in Produktion (0-1 Pkt)
  - Git für Historie verwenden

#### 2.5 Fehlerbehandlung (3 Punkte)
- [ ] **Try-catch** angemessen mit Logging (0-1 Pkt)
- [ ] **Spezifische Fehlertypen** (nicht nur `catch (e)`) (0-1 Pkt)
- [ ] **Keine print()** in Produktion (Logger verwenden) (0-1 Pkt)

### Schritt 3: Punkteberechnung

```
CODEQUALITÄTS-SCORE = Summe der Punkte / 25

Interpretation:
✅ 20-25 Pkt: Exzellente Qualität
⚠️ 15-19 Pkt: Korrekte Qualität, Verbesserungen empfohlen
⚠️ 10-14 Pkt: Qualität zu verbessern
❌ 0-9 Pkt: Problematische Qualität
```

### Schritt 4: Detaillierter Bericht

Erstelle einen Bericht mit:

#### 📊 CODEQUALITÄTS-SCORE: XX/25

#### ✅ Stärken
- Gut beachtete Konventionen
- Beispiele für sauberen und lesbaren Code

#### ⚠️ Verbesserungspunkte
- Erkannte kleinere Verstöße mit Dateien
- Verbesserungsvorschläge

#### ❌ Kritische Verstöße
- Namensgebungsprobleme
- Duplizierter oder zu komplexer Code
- Ungelöste Warnings

#### 📝 Beispiele für zu verbessernden Code

```dart
// ❌ Schlecht
var d = DateTime.now(); // Kryptischer Name
void doStuff() { ... } // Zu vage

// ✅ Gut
final currentDate = DateTime.now();
void authenticateUser() { ... }
```

#### 🎯 TOP 3 PRIORITÄRE MASSNAHMEN

1. **[HOHE PRIORITÄT]** Warnings von `flutter analyze` beheben (Impact: Wartbarkeit)
2. **[MITTLERE PRIORITÄT]** Methoden > 50 Zeilen refactoren (Impact: Lesbarkeit)
3. **[NIEDRIGE PRIORITÄT]** Fehlende öffentliche Klassen dokumentieren (Impact: API)

---

**Hinweis**: Dieser Bericht konzentriert sich ausschließlich auf die Codequalität. Für ein vollständiges Audit verwenden Sie `/check-compliance`.
