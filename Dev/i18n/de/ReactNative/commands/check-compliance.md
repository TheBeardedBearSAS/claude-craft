# Globale React Native Projekt-Compliance-Prüfung

## Argumente

$ARGUMENTS

## MISSION

Sie sind ein Experte für React Native Projekt-Compliance. Ihre Aufgabe ist es, ein vollständiges Audit durch Kombination der spezialisierten Audits zu orchestrieren: Architektur, Code-Qualität, Tests und Sicherheit.

Dieser Befehl aggregiert die Ergebnisse aus:
1. `/reactnative:check-architecture` (25 Punkte)
2. `/reactnative:check-code-quality` (25 Punkte)
3. `/reactnative:check-testing` (25 Punkte)
4. `/reactnative:check-security` (25 Punkte)

### Schritt 1: Die 4 spezialisierten Audits ausführen

Sequentiell ausführen (oder die auszuführenden Befehle anzeigen):

```bash
# 1. Architektur-Audit
/reactnative:check-architecture

# 2. Code-Qualitäts-Audit
/reactnative:check-code-quality

# 3. Test-Audit
/reactnative:check-testing

# 4. Sicherheits-Audit
/reactnative:check-security
```

### Schritt 2: Ergebnisse aggregieren

Punktzahlen aus jedem Audit sammeln:

```
┌─────────────────────────┬─────────┬─────────┬────────┐
│ Audit                   │ Punkte  │ Maximum │ Status │
├─────────────────────────┼─────────┼─────────┼────────┤
│ Architektur             │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Code-Qualität           │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Tests                   │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Sicherheit              │ XX/25   │ 25      │ ✅/⚠️/❌│
├─────────────────────────┼─────────┼─────────┼────────┤
│ GESAMT GLOBAL           │ XX/100  │ 100     │ ✅/⚠️/❌│
└─────────────────────────┴─────────┴─────────┴────────┘
```

**Legende:**
- ✅ Ausgezeichnet (≥ 80/100)
- ⚠️ Warnung (60-79/100)
- ❌ Kritisch (< 60/100)

### Schritt 3: Globale Bewertung

## 📊 GLOBALER COMPLIANCE-BERICHT

### 🎯 Gesamtpunktzahl: XX/100

**Bewertung:**
- 90-100: Produktionsreifes Projekt ✅
- 80-89: Gutes Projekt, kleine Verbesserungen ⚠️
- 70-79: Akzeptables Projekt, signifikante Verbesserungen erforderlich ⚠️
- 60-69: Problematisches Projekt, umfangreiche Verbesserungen erforderlich ❌
- < 60: Kritisches Projekt, Refactoring erforderlich ❌

### 📈 Detaillierte Bewertungen

#### 1. Architektur (XX/25)
- Feature-Based Struktur: XX/8
- Ordnerorganisation: XX/5
- Navigation: XX/4
- Schichtenarchitektur: XX/4
- Assets: XX/4

**Status:** [✅/⚠️/❌]
**Prioritätsm aßnahmen:** [Top 2-3]

#### 2. Code-Qualität (XX/25)
- TypeScript: XX/7
- ESLint: XX/6
- Prettier: XX/3
- SOLID: XX/4
- KISS/DRY/YAGNI: XX/5

**Status:** [✅/⚠️/❌]
**Prioritätsmaßnahmen:** [Top 2-3]

#### 3. Tests (XX/25)
- Jest-Konfiguration: XX/5
- Unit-Tests: XX/6
- Komponenten-Tests: XX/6
- Integrationstests: XX/4
- E2E-Tests: XX/4

**Status:** [✅/⚠️/❌]
**Prioritätsmaßnahmen:** [Top 2-3]

#### 4. Sicherheit (XX/25)
- Sensible Daten: XX/6
- API-Sicherheit: XX/5
- Code-Sicherheit: XX/5
- Authentifizierung: XX/5
- Plattform-Sicherheit: XX/4

**Status:** [✅/⚠️/❌]
**Prioritätsmaßnahmen:** [Top 2-3]

### 🚨 Kritische Probleme (Alle Audits)

Alle kritischen Probleme aus allen 4 Audits auflisten:

1. **[Kritisches Problem #1]**
   - **Audit:** Architektur/Code-Qualität/Tests/Sicherheit
   - **Auswirkung:** Kritisch
   - **Ort:** [Dateien]
   - **Massnahme:** [Sofortige Massnahme]

2. **[Kritisches Problem #2]**
   - **Audit:** Architektur/Code-Qualität/Tests/Sicherheit
   - **Auswirkung:** Kritisch
   - **Ort:** [Dateien]
   - **Massnahme:** [Sofortige Massnahme]

### ⚠️ Probleme mit hoher Priorität

Alle Probleme mit hoher Priorität auflisten:

1. **[Problem #1]**
   - **Audit:** [Name]
   - **Auswirkung:** Hoch
   - **Massnahme:** [Erforderliche Massnahme]

2. **[Problem #2]**
   - **Audit:** [Name]
   - **Auswirkung:** Hoch
   - **Massnahme:** [Erforderliche Massnahme]

### 🎯 GLOBALER MASSNAHMENPLAN

#### Phase 1: Sofort (Woche 1)
- [ ] [Kritische Massnahme #1]
- [ ] [Kritische Massnahme #2]
- [ ] [Kritische Massnahme #3]

#### Phase 2: Kurzfristig (Woche 2-4)
- [ ] [Hohe Priorität Massnahme #1]
- [ ] [Hohe Priorität Massnahme #2]
- [ ] [Hohe Priorität Massnahme #3]

#### Phase 3: Mittelfristig (Monat 2)
- [ ] [Mittlere Priorität Massnahme #1]
- [ ] [Mittlere Priorität Massnahme #2]
- [ ] [Mittlere Priorität Massnahme #3]

### 📊 Schlüsselmetriken

```
Projekt-Gesundheits-Dashboard
════════════════════════════

Code-Qualität
├─ ESLint-Fehler: XX
├─ TypeScript-Fehler: XX
├─ Code-Duplizierung: XX%
└─ Technische Schulden: XX Stunden

Tests
├─ Gesamt-Abdeckung: XX%
├─ Unit-Tests: XX bestanden / XX gesamt
├─ Komponenten-Tests: XX bestanden / XX gesamt
└─ E2E-Tests: XX bestanden / XX gesamt

Sicherheit
├─ Schwachstellen in Abhängigkeiten: XX
├─ Offengelegte Geheimnisse: XX
├─ Sicherheitswarnungen: XX
└─ OWASP-Probleme: XX

Architektur
├─ Features: XX
├─ Geteilte Komponenten: XX
├─ Benutzerdefinierte Hooks: XX
└─ Ordnertiefe: XX Ebenen
```

### 🏆 Stärken

5-10 allgemeine Stärken des Projekts auflisten:
- [Stärke 1]
- [Stärke 2]
- [Stärke 3]

### 🎓 Lernempfehlungen

Basierend auf identifizierten Lücken, Schulungs-/Lernempfehlungen für das Team:
- [Empfehlung 1: z.B. TypeScript Strict Mode Training]
- [Empfehlung 2: z.B. React Native Performance Workshop]
- [Empfehlung 3: z.B. Security Best Practices Kurs]

### 📚 Referenzen

- `.claude/rules/` - Alle Projektregeln
- [React Native Dokumentation](https://reactnative.dev/)
- [TypeScript Handbuch](https://www.typescriptlang.org/docs/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-top-10/)

---

## ✅ Compliance-Checkliste

Diese Checkliste für zukünftige Compliance-Prüfungen verwenden:

### Vor Produktions-Deployment
- [ ] Gesamtpunktzahl ≥ 80/100
- [ ] Keine kritischen Probleme
- [ ] Test-Abdeckung ≥ 70%
- [ ] 0 Sicherheitsschwachstellen (hoch/kritisch)
- [ ] 0 ESLint-Fehler
- [ ] 0 TypeScript-Fehler
- [ ] Alle Tests bestanden
- [ ] Dokumentation aktuell

---

**Gesamtpunktzahl: XX/100**
**Empfehlung: [Produktionsreif / Verbesserung erforderlich / Refactoring erforderlich]**
