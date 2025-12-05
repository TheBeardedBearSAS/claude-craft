# Checkliste für neue Features

Vollständiger Workflow für die Entwicklung eines neuen Features.

---

## Phase 1: Analyse (OBLIGATORISCH)

Siehe [01-workflow-analysis.md](../rules/01-workflow-analysis.md)

- [ ] Bedarf klar verstanden
- [ ] User Stories definiert
- [ ] Akzeptanzkriterien aufgelistet
- [ ] Technische Einschränkungen identifiziert
- [ ] Use Cases dokumentiert

---

## Phase 2: Design

### Architektur

- [ ] Betroffene Schichten identifiziert (Data, Logic, UI)
- [ ] Neue Dateien/Ordner geplant
- [ ] Externe Abhängigkeiten identifiziert
- [ ] Auswirkung auf bestehenden Code bewertet
- [ ] Design-Pattern ausgewählt (und gerechtfertigt)

### Datenmodellierung

- [ ] TypeScript-Typen definiert
- [ ] Interfaces erstellt
- [ ] DTOs definiert (falls API)
- [ ] Validierungsschemata (Zod) erstellt

### Technische Entscheidungen

- [ ] State Management ausgewählt (Query/Zustand/State)
- [ ] Navigationsstrategie definiert
- [ ] API-Endpunkte definiert
- [ ] Speicherstrategie definiert
- [ ] Performance berücksichtigt

---

## Phase 3: Setup

### Branch & Ticket

- [ ] Ticket/Issue erstellt
- [ ] Branch erstellt (`feature/feature-name`)
- [ ] Branch aktuell mit develop

### Abhängigkeiten

- [ ] Neue Abhängigkeiten installiert
- [ ] Kompatible Versionen überprüft
- [ ] `npx expo install --fix` ausgeführt

---

## Phase 4: Implementierung

### Bottom-Up Entwicklung

#### 1. Data Layer

- [ ] Types in `types/` erstellt
- [ ] API-Service in `services/api/` erstellt
- [ ] Storage-Service erstellt (falls erforderlich)
- [ ] Repository erstellt (falls komplexe Logik)
- [ ] Service-Tests geschrieben

#### 2. Logic Layer

- [ ] Custom Hooks in `hooks/` erstellt
- [ ] Store erstellt (falls globaler State)
- [ ] Business Logic implementiert
- [ ] Hook-Tests geschrieben

#### 3. UI-Komponenten

- [ ] Basis-UI-Komponenten erstellt
- [ ] Wiederverwendbare Komponenten erstellt
- [ ] Styles erstellt (StyleSheet)
- [ ] Komponententests geschrieben

#### 4. Screens

- [ ] Screen in `app/` erstellt (Expo Router)
- [ ] Navigation konfiguriert
- [ ] Komponentenintegration
- [ ] Screen-Tests geschrieben

#### 5. Integration

- [ ] Feature in App integriert
- [ ] Navigationsflüsse getestet
- [ ] Deep Links konfiguriert (falls erforderlich)
- [ ] E2E-Tests geschrieben

---

## Phase 5: Qualitätssicherung

### Code-Qualität

- [ ] ESLint: 0 Fehler, 0 Warnungen
- [ ] TypeScript: 0 Fehler (Strict Mode)
- [ ] Prettier: Code formatiert
- [ ] Selbst-Code-Review durchgeführt
- [ ] Refactoring angewendet falls notwendig

### Testing

- [ ] Unit Tests: Coverage > 80%
- [ ] Komponententests: Alle Szenarien
- [ ] Integrationstests: Happy Path + Fehler
- [ ] E2E Tests: Vollständige User Flows
- [ ] Tests bestehen lokal

### Performance

- [ ] Bundle-Größen-Auswirkung < 100kb
- [ ] Bilder optimiert
- [ ] FlatLists optimiert
- [ ] Animationen 60 FPS
- [ ] Memory Leaks geprüft
- [ ] Netzwerk-Calls optimiert

### Sicherheit

- [ ] Eingabevalidierung
- [ ] Sensible Daten gesichert
- [ ] API-Calls gesichert
- [ ] Keine exponierten Secrets
- [ ] Dependencies Audit sauber

### Accessibility

- [ ] Accessibility-Labels hinzugefügt
- [ ] Screenreader getestet
- [ ] Ausreichender Farbkontrast
- [ ] Touch-Targets 44x44+

---

## Phase 6: Dokumentation

- [ ] JSDoc für öffentliche Funktionen
- [ ] Kommentare für komplexe Logik
- [ ] README aktualisiert
- [ ] CHANGELOG aktualisiert
- [ ] ADR erstellt (falls wichtige Entscheidung)

---

## Phase 7: Manuelles Testen

### Funktional

- [ ] Happy Path getestet
- [ ] Edge Cases getestet
- [ ] Fehlerfälle getestet
- [ ] Offline-Verhalten getestet (falls zutreffend)

### Plattformen

- [ ] iOS getestet
- [ ] Android getestet
- [ ] Tablet getestet (falls unterstützt)
- [ ] Verschiedene Bildschirmgrößen

### UX

- [ ] Flüssige Animationen
- [ ] Klare Ladezustände
- [ ] Hilfreiche Fehlermeldungen
- [ ] Angemessenes Benutzer-Feedback

---

## Phase 8: Code Review

- [ ] Pull Request erstellt
- [ ] Klare Beschreibung mit Screenshots
- [ ] Reviewer zugewiesen
- [ ] CI/CD-Checks bestanden
- [ ] Feedback adressiert
- [ ] Von mindestens 1 Reviewer genehmigt

---

## Phase 9: Merge & Deploy

- [ ] Branch in develop gemergt
- [ ] Tests bestehen auf develop
- [ ] Deploy auf Staging
- [ ] Staging-Tests
- [ ] Produktions-Deploy (falls genehmigt)
- [ ] Post-Deploy-Monitoring

---

## Phase 10: Cleanup

- [ ] Feature-Branch gelöscht
- [ ] Lokale Branches bereinigt
- [ ] Ticket/Issue geschlossen
- [ ] Dokumentation finalisiert

---

## Post-Launch

- [ ] Metriken gesammelt
- [ ] Benutzer-Feedback erfasst
- [ ] Bugs/Issues triagiert
- [ ] Retrospektive (falls großes Feature)

---

**Vollständiger Workflow: Analyse → Design → Implementierung → QA → Review → Deploy → Monitor**
