---
description: React Native Testing überprüfen
argument-hint: [arguments]
---

# React Native Testing überprüfen

## Argumente

$ARGUMENTS

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Sie sind ein Experte für React Native Testing-Audits. Ihre Aufgabe ist es, die Teststrategie und -abdeckung gemäß den Standards in `.claude/rules/07-testing.md` und `.claude/rules/08-quality-tools.md` zu analysieren.

### Schritt 1: Testkonfigurationsanalyse

1. Jest-Vorhandensein und -Konfiguration überprüfen
2. React Native Testing Library (RNTL) Vorhandensein und -Konfiguration überprüfen
3. Detox (E2E-Tests) Vorhandensein und -Konfiguration überprüfen
4. Testskripte in package.json analysieren

### Schritt 2: Jest-Konfiguration (5 Punkte)

#### 🧪 Konfigurationsdateien

- [ ] **(1 Pkt)** `jest.config.js` oder Konfiguration in package.json vorhanden
- [ ] **(1 Pkt)** React Native Preset konfiguriert (`@react-native/jest-preset` oder Äquivalent)
- [ ] **(1 Pkt)** Setup-Dateien konfiguriert (`setupFilesAfterEnv`)
- [ ] **(1 Pkt)** Code-Coverage aktiviert (coverage)
- [ ] **(1 Pkt)** Transformationen für TypeScript und React Native konfiguriert

**Zu prüfende Dateien:**
```bash
jest.config.js
jest.setup.js
package.json
```

#### 📊 Coverage-Konfiguration

In `jest.config.js` überprüfen:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

- [ ] Coverage-Schwellenwerte definiert (≥ 80% empfohlen)
- [ ] Collect aus korrekten Ordnern (src/, app/)
- [ ] Geeignete Ausschlüsse (node_modules, __tests__, etc.)

### Schritt 3: Unit-Tests mit RNTL (8 Punkte)

Referenz: `.claude/rules/07-testing.md`

#### 📁 Testorganisation

- [ ] **(1 Pkt)** Tests zusammen mit Komponenten oder in `__tests__/`
- [ ] **(1 Pkt)** Namenskonvention: `*.test.tsx` oder `*.spec.tsx`
- [ ] **(1 Pkt)** AAA-Struktur (Arrange, Act, Assert) eingehalten

**Zu prüfende Dateien:**
```bash
src/**/__tests__/
src/**/*.test.tsx
src/**/*.spec.tsx
```

#### 🧩 Unit-Test-Qualität

5-10 Testdateien analysieren:

- [ ] **(1 Pkt)** Verwendung von `@testing-library/react-native` (render, fireEvent, waitFor)
- [ ] **(1 Pkt)** Isolierte Komponententests mit gemockten Props
- [ ] **(1 Pkt)** Custom Hooks Tests mit `@testing-library/react-hooks`
- [ ] **(1 Pkt)** Geeignete Mocks für native Module (AsyncStorage, etc.)
- [ ] **(1 Pkt)** Edge Cases und Error-Tests

**Beispiel eines guten Tests:**
```typescript
describe('LoginButton', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<LoginButton onPress={onPress} />);

    fireEvent.press(getByText('Login'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Schritt 4: Integrationstests (4 Punkte)

- [ ] **(1 Pkt)** Vollständige User-Flow-Tests
- [ ] **(1 Pkt)** Navigation zwischen Screens Tests
- [ ] **(1 Pkt)** Gemockte API-Aufrufe Tests
- [ ] **(1 Pkt)** State-Management-Tests (Context, Redux, Zustand)

**Zu prüfende Dateien:**
```bash
src/**/*.integration.test.tsx
__tests__/integration/
```

### Schritt 5: E2E-Tests mit Detox (4 Punkte)

#### 🤖 Detox-Konfiguration

- [ ] **(1 Pkt)** `.detoxrc.js` oder Detox-Konfiguration vorhanden
- [ ] **(1 Pkt)** Konfiguration für iOS und Android
- [ ] **(1 Pkt)** E2E-Testskripte in package.json (`test:e2e`)

**Zu prüfende Dateien:**
```bash
.detoxrc.js
.detoxrc.json
e2e/
package.json
```

#### 🎬 E2E-Tests

- [ ] **(1 Pkt)** Mindestens 3 kritische E2E-Szenarien getestet (Login, Hauptnavigation, Schlüsselaktion)

**Zu prüfende Dateien:**
```bash
e2e/**/*.e2e.ts
e2e/**/*.e2e.js
```

### Schritt 6: Testabdeckung (4 Punkte)

Coverage-Befehl ausführen:

```bash
npm run test -- --coverage
# oder
yarn test --coverage
```

Coverage-Report analysieren:

- [ ] **(1 Pkt)** Globale Abdeckung ≥ 80%
- [ ] **(1 Pkt)** Branch-Coverage ≥ 75%
- [ ] **(1 Pkt)** Kritische Komponenten zu 100% abgedeckt
- [ ] **(1 Pkt)** Coverage-Report generiert (coverage/lcov-report/)

**Zu prüfende Dateien:**
```bash
coverage/lcov-report/index.html
coverage/coverage-summary.json
```

### Schritt 7: Punktzahl berechnen

```
┌──────────────────────────────────┬─────────┬────────┐
│ Kriterium                        │ Punkte  │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Jest-Konfiguration               │ XX/5    │ ✅/⚠️/❌│
│ Unit-Tests (RNTL)                │ XX/8    │ ✅/⚠️/❌│
│ Integrationstests                │ XX/4    │ ✅/⚠️/❌│
│ E2E-Tests (Detox)                │ XX/4    │ ✅/⚠️/❌│
│ Code-Coverage                    │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TESTING GESAMT                   │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legende:**
- ✅ Ausgezeichnet (≥ 20/25)
- ⚠️ Warnung (15-19/25)
- ❌ Kritisch (< 15/25)

### Schritt 8: Detaillierter Bericht

## 📊 TESTING-AUDIT-ERGEBNISSE

### ✅ Stärken

Identifizierte gute Praktiken auflisten:
- [Praktik 1 mit Testbeispiel]
- [Praktik 2 mit Testbeispiel]

### ⚠️ Verbesserungspunkte

Identifizierte Probleme nach Priorität auflisten:

1. **[Problem 1]**
   - **Schweregrad:** Kritisch/Hoch/Mittel
   - **Ort:** [Ungetestete Dateien/Komponenten]
   - **Auswirkung:** [Regressionsrisiko]
   - **Empfehlung:** [Zu ergreifende Maßnahmen]

2. **[Problem 2]**
   - **Schweregrad:** Kritisch/Hoch/Mittel
   - **Ort:** [Ungetestete Dateien/Komponenten]
   - **Auswirkung:** [Regressionsrisiko]
   - **Empfehlung:** [Zu ergreifende Maßnahmen]

### 📈 Testing-Metriken

#### Code-Coverage

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Typ             │ Zeilen   │ Branches │ Funktionen│ Statements│
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Global          │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Components      │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Hooks           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Utils           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Services        │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘
```

#### Teststatistiken

- **Gesamtzahl Tests:** XX
  - Unit-Tests: XX
  - Integrationstests: XX
  - E2E-Tests: XX
- **Tests bestanden:** XX
- **Tests fehlgeschlagen:** XX
- **Gesamtausführungszeit:** XX Sekunden
- **Tests/Code-Verhältnis:** XX Tests für YY Codezeilen

#### Komponenten ohne Tests

Kritische ungetestete Komponenten auflisten:
1. `[Pfad/Komponente]` - [Kritikalitätsgrund]
2. `[Pfad/Komponente]` - [Kritikalitätsgrund]
3. `[Pfad/Komponente]` - [Kritikalitätsgrund]

#### Getestete kritische Features

- [ ] Authentifizierung (Login, Logout, Refresh Token)
- [ ] Hauptnavigation
- [ ] Kritische Formulare
- [ ] Haupt-API-Aufrufe
- [ ] Fehlerbehandlung
- [ ] Ladezustände
- [ ] Offline-Verwaltung

### 🎯 TOP 3 PRIORITÄTSAKTIONEN

#### 1. [AKTION #1]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Komponenten/Features mit Priorität zu testen]
- **Aktuelle Abdeckung:** XX%
- **Zielabdeckung:** YY%
- **Betroffene Dateien:**
  - `[datei1]` (Abdeckung: XX%)
  - `[datei2]` (Abdeckung: XX%)
- **Hinzuzufügende Beispieltests:**
```typescript
describe('[Komponente]', () => {
  it('should [Verhalten]', () => {
    // Zu implementierender Test
  });
});
```

#### 2. [AKTION #2]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Testkonfiguration oder Verbesserung]
- **Betroffene Dateien:** [Liste]

#### 3. [AKTION #3]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** Kritisch/Hoch/Mittel
- **Beschreibung:** [Hinzuzufügende E2E- oder Integrationstests]
- **Abzudeckende Szenarien:**
  - [Szenario 1]
  - [Szenario 2]

---

## 🚀 Empfehlungen

### Quick Wins (Niedriger Aufwand, hohe Auswirkung)
- [Schnelle Verbesserung 1]
- [Schnelle Verbesserung 2]

### Investitionen (Mittlerer/hoher Aufwand, hohe Auswirkung)
- [Strukturelle Verbesserung 1]
- [Strukturelle Verbesserung 2]

### Zu übernehmende Best Practices
- Tests parallel zum Code schreiben (TDD)
- Mindestens 80% Abdeckung anstreben
- Edge Cases und Fehler testen
- Tests mit Code aktuell halten
- Snapshots sparsam verwenden

---

## 📚 Referenzen

- `.claude/rules/07-testing.md` - Testing-Standards
- `.claude/rules/08-quality-tools.md` - Quality-Tools
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)

---

**Endpunktzahl: XX/25**
