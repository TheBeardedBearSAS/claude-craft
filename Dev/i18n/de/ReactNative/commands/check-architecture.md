---
description: React Native Architektur prüfen
argument-hint: [arguments]
---

# React Native Architektur prüfen

## Argumente

$ARGUMENTS

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Sie sind ein React Native Architektur-Audit-Experte. Ihre Aufgabe ist es, die architektonische Konformität des Projekts gemäß den in `.claude/rules/02-architecture.md` definierten Standards zu analysieren.

### Schritt 1: Struktur erkunden

1. Analysieren Sie die Root-Projektstruktur
2. Identifizieren Sie den Architekturtyp (Expo, React Native CLI, Expo Router)
3. Lokalisieren Sie Hauptordner: `src/`, `app/`, `components/`, etc.

### Schritt 2: Architektonische Konformität überprüfen

Führen Sie die folgenden Prüfungen durch und notieren Sie jedes Ergebnis:

#### 📁 Feature-basierte Struktur (8 Punkte)

Überprüfen Sie, ob das Projekt eine feature-basierte Organisation verwendet:

- [ ] **(2 Pkt.)** Struktur nach Features/Domains (z.B. `src/features/auth/`, `src/features/profile/`)
- [ ] **(2 Pkt.)** Jedes Feature enthält eigene Components, Hooks und Logik
- [ ] **(2 Pkt.)** Klare Trennung zwischen `features/` (Business) und `shared/` (Gemeinsam)
- [ ] **(2 Pkt.)** Konsistente Organisation über alle Features hinweg

**Zu prüfende Dateien:**
```bash
src/features/*/
src/shared/
app/(tabs)/
```

#### 🗂️ Ordnerorganisation (5 Punkte)

- [ ] **(1 Pkt.)** `components/` für wiederverwendbare Components
- [ ] **(1 Pkt.)** `hooks/` für Custom Hooks
- [ ] **(1 Pkt.)** `services/` oder `api/` für Netzwerk-Aufrufe
- [ ] **(1 Pkt.)** `utils/` oder `helpers/` für Hilfsfunktionen
- [ ] **(1 Pkt.)** `types/` oder `models/` für TypeScript-Definitionen

**Zu prüfende Dateien:**
```bash
src/components/
src/hooks/
src/services/
src/utils/
src/types/
```

#### 🚦 Expo Router / Navigation (4 Punkte)

Falls das Projekt Expo Router verwendet:

- [ ] **(1 Pkt.)** `app/`-Ordner im Root mit dateibasierter Routing-Struktur
- [ ] **(1 Pkt.)** Layouts definiert (`_layout.tsx`) für Navigation
- [ ] **(1 Pkt.)** Route-Organisation nach Gruppen `(tabs)`, `(stack)`, etc.
- [ ] **(1 Pkt.)** Navigation-Parameter-Typisierung

Falls React Navigation:

- [ ] **(1 Pkt.)** Zentralisierte Navigator-Konfiguration
- [ ] **(1 Pkt.)** Typen für Routen und Parameter
- [ ] **(1 Pkt.)** Deep Linking konfiguriert
- [ ] **(1 Pkt.)** Navigation Guards falls notwendig

**Zu prüfende Dateien:**
```bash
app/_layout.tsx
app/(tabs)/_layout.tsx
src/navigation/
```

#### 🔌 Geschichtete Architektur (4 Punkte)

- [ ] **(1 Pkt.)** Präsentation/Logik-Trennung (UI-Components vs. Container)
- [ ] **(1 Pkt.)** Service-Layer für Datenzugriff
- [ ] **(1 Pkt.)** Custom Hooks für wiederverwendbare Logik
- [ ] **(1 Pkt.)** Zentralisiertes State Management (Context, Zustand, Redux, etc.)

**Zu prüfende Dateien:**
```bash
src/hooks/
src/services/
src/store/ oder src/contexts/
```

#### 🎨 Assets-Organisation (4 Punkte)

- [ ] **(1 Pkt.)** Strukturierter `assets/`-Ordner (Bilder, Schriften, Icons)
- [ ] **(1 Pkt.)** Konstanten für Asset-Pfade verwendet
- [ ] **(1 Pkt.)** Bildoptimierung (WebP, geeignete Dimensionen)
- [ ] **(1 Pkt.)** SVG über `react-native-svg` oder Äquivalent

**Zu prüfende Dateien:**
```bash
assets/
src/constants/assets.ts
```

### Schritt 3: React Native spezifische Regeln

Referenz: `.claude/rules/02-architecture.md`

Überprüfen Sie die folgenden Punkte:

#### ⚡ Performance und Optimierung

- [ ] Verwendung von `React.memo()` für teure Components
- [ ] Angemessene Verwendung von `useMemo()` und `useCallback()`
- [ ] Keine schwere Logik im Render
- [ ] FlatList/SectionList für lange Listen (nicht ScrollView)

#### 🔄 State Management

- [ ] State Management Lösung klar definiert
- [ ] Lokaler vs. globaler State gut getrennt
- [ ] Kein übermäßiges Props Drilling

#### 📱 Mobile-Spezifika

- [ ] SafeAreaView-Verwaltung
- [ ] Plattformspezifischer Code-Support bei Bedarf
- [ ] Tastaturverwaltung (KeyboardAvoidingView)
- [ ] Mobile-Berechtigungsverwaltung

### Schritt 4: Punktzahl berechnen

Zählen Sie die erhaltenen Punkte für jeden Abschnitt:

```
┌──────────────────────────────────┬─────────┬────────┐
│ Kriterium                        │ Punkte  │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Feature-basierte Struktur        │ XX/8    │ ✅/⚠️/❌│
│ Ordnerorganisation               │ XX/5    │ ✅/⚠️/❌│
│ Expo Router / Navigation         │ XX/4    │ ✅/⚠️/❌│
│ Geschichtete Architektur         │ XX/4    │ ✅/⚠️/❌│
│ Assets-Organisation              │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ ARCHITEKTUR GESAMT               │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legende:**
- ✅ Ausgezeichnet (≥ 20/25)
- ⚠️ Warnung (15-19/25)
- ❌ Kritisch (< 15/25)

### Schritt 5: Detaillierter Bericht

## 📊 ARCHITEKTUR-AUDIT-ERGEBNISSE

### ✅ Stärken

Listen Sie identifizierte gute Praktiken auf:
- [Praktik 1 mit Dateibeispiel]
- [Praktik 2 mit Dateibeispiel]

### ⚠️ Verbesserungspunkte

Listen Sie identifizierte Probleme nach Priorität auf:

1. **[Problem 1]**
   - **Auswirkung:** Kritisch/Hoch/Mittel
   - **Ort:** [Dateipfade]
   - **Empfehlung:** [Konkrete Aktion]

2. **[Problem 2]**
   - **Auswirkung:** Kritisch/Hoch/Mittel
   - **Ort:** [Dateipfade]
   - **Empfehlung:** [Konkrete Aktion]

### 📈 Architektur-Metriken

- **Anzahl der Features:** XX
- **Maximale Ordnertiefe:** XX Ebenen
- **Geteilte Components:** XX
- **Custom Hooks:** XX
- **API-Services:** XX

### 🎯 TOP 3 PRIORITÄTSAKTIONEN

#### 1. [AKTION #1]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Detail]
- **Dateien:** [Liste]

#### 2. [AKTION #2]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Detail]
- **Dateien:** [Liste]

#### 3. [AKTION #3]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Detail]
- **Dateien:** [Liste]

---

## 📚 Referenzen

- `.claude/rules/02-architecture.md` - Architektur-Standards
- `.claude/rules/14-navigation.md` - Navigation-Standards
- `.claude/rules/13-state-management.md` - State Management Standards

---

**Endpunktzahl: XX/25**
