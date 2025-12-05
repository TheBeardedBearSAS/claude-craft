# React Native Code-Qualitätsprüfung

## Argumente

$ARGUMENTS

## MISSION

Sie sind ein Experte für React Native Code-Qualitätsaudits. Ihre Aufgabe ist es, die Code-Konformität gemäß den in `.claude/rules/03-coding-standards.md`, `.claude/rules/04-solid-principles.md` und `.claude/rules/05-kiss-dry-yagni.md` definierten Standards zu analysieren.

### Schritt 1: Konfigurationsanalyse

1. Vorhandensein und Konfiguration von TypeScript überprüfen
2. Vorhandensein und Konfiguration von ESLint überprüfen
3. Vorhandensein und Konfiguration von Prettier überprüfen
4. Konfigurationsdateien in package.json analysieren

### Schritt 2: TypeScript-Überprüfung (7 Punkte)

TypeScript-Konfiguration überprüfen:

#### 🔧 tsconfig.json Konfiguration

- [ ] **(2 Pts)** `"strict": true` aktiviert
- [ ] **(1 Pt)** `"noImplicitAny": true`
- [ ] **(1 Pt)** `"strictNullChecks": true`
- [ ] **(1 Pt)** `"noUnusedLocals": true` und `"noUnusedParameters": true`
- [ ] **(1 Pt)** Pfad-Aliase konfiguriert (z.B. `@/components`, `@/utils`)
- [ ] **(1 Pt)** Korrekte Typen für React Native (`@types/react`, `@types/react-native`)

**Zu prüfende Dateien:**
```bash
tsconfig.json
package.json
```

#### 📝 TypeScript-Verwendung im Code

5-10 zufällige TypeScript-Dateien überprüfen:

- [ ] Kein `any` (außer begründete und dokumentierte Fälle)
- [ ] Gut definierte Interfaces/Types für Props
- [ ] Typen für Funktionen (Parameter und Rückgabe)
- [ ] Kein `@ts-ignore` oder `@ts-nocheck` (außer dokumentierte Ausnahmen)
- [ ] Verwendung von Generics wenn angebracht

**Zu prüfende Dateien:**
```bash
src/**/*.tsx
src/**/*.ts
```

### Schritt 3: ESLint-Überprüfung (6 Punkte)

#### 🔍 ESLint-Konfiguration

- [ ] **(2 Pts)** `.eslintrc.js` oder `.eslintrc.json` vorhanden und konfiguriert
- [ ] **(1 Pt)** Plugin `@react-native` oder Äquivalent konfiguriert
- [ ] **(1 Pt)** Plugin `@typescript-eslint` konfiguriert
- [ ] **(1 Pt)** React Hooks Regeln aktiviert (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)
- [ ] **(1 Pt)** ESLint-Skripte in package.json (`lint`, `lint:fix`)

**Zu prüfende Dateien:**
```bash
.eslintrc.js
.eslintrc.json
package.json
```

#### ⚠️ Überprüfung von ESLint-Fehlern

ESLint ausführen und Ergebnisse analysieren:

```bash
npm run lint
# oder
yarn lint
```

- [ ] 0 ESLint-Fehler
- [ ] < 10 ESLint-Warnungen
- [ ] Keine deaktivierten Regeln ohne Begründung

### Schritt 4: Prettier-Überprüfung (3 Punkte)

- [ ] **(1 Pt)** `.prettierrc` vorhanden mit konsistenter Konfiguration
- [ ] **(1 Pt)** ESLint + Prettier Integration (keine Konflikte)
- [ ] **(1 Pt)** Format-Skript in package.json

**Zu prüfende Dateien:**
```bash
.prettierrc
.prettierrc.js
.prettierrc.json
package.json
```

### Schritt 5: SOLID-Prinzipien (4 Punkte)

Referenz: `.claude/rules/04-solid-principles.md`

3-5 Hauptkomponenten oder Module analysieren:

- [ ] **(1 Pt)** **S - Single Responsibility**: Jede Komponente/Funktion hat eine einzige Verantwortung
- [ ] **(1 Pt)** **O - Open/Closed**: Erweiterungen möglich ohne Änderung bestehenden Codes
- [ ] **(1 Pt)** **L - Liskov Substitution**: Komponenten sind austauschbar
- [ ] **(1 Pt)** **D - Dependency Inversion**: Abhängigkeiten über Props/Injection, keine enge Kopplung

**Zu analysierende Dateien:**
```bash
src/components/**/*.tsx
src/features/**/*.tsx
src/hooks/**/*.ts
```

### Schritt 6: KISS, DRY, YAGNI-Prinzipien (5 Punkte)

Referenz: `.claude/rules/05-kiss-dry-yagni.md`

- [ ] **(2 Pts)** **KISS (Keep It Simple)**: Einfacher und lesbarer Code, keine Überentwicklung
- [ ] **(2 Pts)** **DRY (Don't Repeat Yourself)**: Keine Code-Duplizierung, Wiederverwendung über Hooks/Utils
- [ ] **(1 Pt)** **YAGNI (You Aren't Gonna Need It)**: Kein unbenutzter Code oder spekulative Features

Überprüfen:
- Duplizierte Funktionen die faktorisiert werden könnten
- Komplexe Logik die vereinfacht werden könnte
- Toter oder auskommentierter Code der entfernt werden sollte

**Zu analysierende Dateien:**
```bash
src/**/*.ts
src/**/*.tsx
```

### Schritt 7: React Native Code-Standards

Referenz: `.claude/rules/03-coding-standards.md`

#### 📱 Spezifische Best Practices

- [ ] Korrekte Verwendung von `StyleSheet.create()` (nicht überall inline Styles)
- [ ] Konstanten für Farben, Abstände, Typografie
- [ ] Funktionale Komponenten mit Hooks (keine Klassenkomponenten)
- [ ] Korrekte State-Verwaltung (useState, useReducer nach Bedarf)
- [ ] Verwendung von `useCallback` für Handler die als Props übergeben werden
- [ ] Verwendung von `useMemo` für teure Berechnungen

**Zu prüfende Dateien:**
```bash
src/components/**/*.tsx
src/theme/
src/constants/
```

### Schritt 8: Punktzahl berechnen

```
┌──────────────────────────────────┬─────────┬────────┐
│ Kriterium                        │ Punkte  │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ TypeScript-Konfiguration         │ XX/7    │ ✅/⚠️/❌│
│ ESLint                           │ XX/6    │ ✅/⚠️/❌│
│ Prettier                         │ XX/3    │ ✅/⚠️/❌│
│ SOLID-Prinzipien                 │ XX/4    │ ✅/⚠️/❌│
│ KISS, DRY, YAGNI                 │ XX/5    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ GESAMT CODE-QUALITÄT             │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legende:**
- ✅ Ausgezeichnet (≥ 20/25)
- ⚠️ Warnung (15-19/25)
- ❌ Kritisch (< 15/25)

### Schritt 9: Detaillierter Bericht

## 📊 ERGEBNISSE DES CODE-QUALITÄTS-AUDITS

### ✅ Stärken

Identifizierte gute Praktiken auflisten:
- [Praxis 1 mit Code-Beispiel]
- [Praxis 2 mit Code-Beispiel]

### ⚠️ Verbesserungspunkte

Identifizierte Probleme nach Priorität auflisten:

1. **[Problem 1]**
   - **Schweregrad:** Kritisch/Hoch/Mittel
   - **Ort:** [Betroffene Dateien]
   - **Beispiel:**
   ```typescript
   // Problematischer Code
   ```
   - **Empfehlung:**
   ```typescript
   // Korrigierter Code
   ```

2. **[Problem 2]**
   - **Schweregrad:** Kritisch/Hoch/Mittel
   - **Ort:** [Betroffene Dateien]
   - **Beispiel:**
   ```typescript
   // Problematischer Code
   ```
   - **Empfehlung:**
   ```typescript
   // Korrigierter Code
   ```

### 📈 Qualitätsmetriken

Folgende Metriken ausführen und berichten:

#### ESLint-Fehler
```bash
npm run lint
```
- **Fehler:** XX
- **Warnungen:** XX
- **Analysierte Dateien:** XX

#### Code-Komplexität

Falls SonarQube oder ein anderes Tool verfügbar:
- **Durchschnittliche zyklomatische Komplexität:** XX (Ziel: < 10)
- **Codezeilen:** XX
- **Duplizierung:** XX% (Ziel: < 5%)
- **Technische Schulden:** XX Stunden

#### TypeScript

- **Prozentsatz strenger Typisierung:** XX% (Ziel: 100%)
- **Verwendung von `any`:** XX Vorkommen (Ziel: 0)
- **TypeScript-Fehler:** XX (Ziel: 0)

### 🎯 TOP 3 PRIORITÄTS-MASSNAHMEN

#### 1. [MASSNAHME #1]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Problemdetail]
- **Lösung:** [Konkrete Massnahme]
- **Dateien:** [Dateiliste]
- **Beispiel:**
```typescript
// Vorher
[problematischer Code]

// Nachher
[korrigierter Code]
```

#### 2. [MASSNAHME #2]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Problemdetail]
- **Lösung:** [Konkrete Massnahme]
- **Dateien:** [Dateiliste]

#### 3. [MASSNAHME #3]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Problemdetail]
- **Lösung:** [Konkrete Massnahme]
- **Dateien:** [Dateiliste]

---

## 📚 Referenzen

- `.claude/rules/03-coding-standards.md` - Code-Standards
- `.claude/rules/04-solid-principles.md` - SOLID-Prinzipien
- `.claude/rules/05-kiss-dry-yagni.md` - KISS, DRY, YAGNI-Prinzipien
- `.claude/rules/06-tooling.md` - Tool-Konfiguration

---

**Endbewertung: XX/25**
