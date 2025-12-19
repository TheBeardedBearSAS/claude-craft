---
description: Test-Überprüfung
---

# Test-Überprüfung

Analysiere und verbessere die Test-Suite der React-Anwendung.

## Aufgabe

1. **Test-Coverage-Analyse**
   - Führe Coverage-Report aus
   - Identifiziere nicht getestete Code-Bereiche
   - Analysiere Coverage nach Typ (Zeilen, Branches, Funktionen)
   - Setze Coverage-Ziele (>80%)

2. **Unit-Tests**
   - Überprüfe Komponenten-Tests
   - Validiere Hook-Tests
   - Prüfe Utility-Functions-Tests
   - Bewerte Test-Qualität

3. **Integration-Tests**
   - Analysiere Feature-Tests
   - Überprüfe API-Integration-Tests
   - Validiere User-Flow-Tests
   - Prüfe State-Management-Tests

4. **E2E-Tests**
   - Überprüfe kritische User-Journeys
   - Validiere Playwright/Cypress-Setup
   - Prüfe Cross-Browser-Tests
   - Bewerte E2E-Coverage

5. **Test-Organisation**
   - Überprüfe Test-Struktur
   - Validiere Namenskonventionen
   - Prüfe Test-Patterns (AAA, Given-When-Then)
   - Bewerte Test-Lesbarkeit

6. **Mocking-Strategie**
   - Überprüfe MSW-Setup
   - Validiere Service-Mocks
   - Prüfe Component-Mocks
   - Bewerte Mock-Daten-Qualität

7. **Test-Performance**
   - Analysiere Test-Ausführungszeit
   - Identifiziere langsame Tests
   - Optimiere Test-Setup
   - Prüfe Parallelisierung

8. **Test-Wartbarkeit**
   - Identifiziere brüchige Tests
   - Überprüfe Test-Duplikation
   - Validiere Test-Utilities
   - Prüfe Test-Data-Factories

9. **Testing-Best-Practices**
   - Überprüfe Testing-Library-Queries
   - Validiere User-Event-Nutzung
   - Prüfe Accessibility-in-Tests
   - Bewerte Test-Isolation

10. **CI/CD-Integration**
    - Überprüfe Test-Pipeline
    - Validiere Pre-Commit-Hooks
    - Prüfe Coverage-Gates
    - Bewerte Test-Reporting

## Tests ausführen

```bash
# Alle Tests
npm test

# Mit Coverage
npm run test:coverage

# Watch-Mode
npm run test:watch

# E2E-Tests
npm run test:e2e

# Spezifische Tests
npm test -- ComponentName
```

## Test-Coverage-Ziele

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
});
```

## Test-Checkliste

```markdown
## Coverage
- [ ] Gesamt-Coverage: >80%
- [ ] Komponenten: >85%
- [ ] Hooks: >90%
- [ ] Utils: >95%
- [ ] Services: >85%

## Test-Typen
- [ ] Unit-Tests: Vollständig
- [ ] Integration-Tests: Kritische Flows
- [ ] E2E-Tests: Happy Paths
- [ ] Visual Regression: Wenn nötig

## Qualität
- [ ] Keine übersprungenen Tests
- [ ] Keine flaky Tests
- [ ] Aussagekräftige Namen
- [ ] AAA-Pattern befolgt

## Performance
- [ ] Test-Suite: <30 Sekunden
- [ ] Einzelner Test: <100ms
- [ ] E2E: <5 Minuten
- [ ] Parallelisierung aktiviert

## Wartbarkeit
- [ ] Test-Utilities genutzt
- [ ] Factories für Test-Daten
- [ ] Keine Test-Duplikation
- [ ] Klare Test-Organisation
```

## Zu liefern

1. Test-Coverage-Bericht mit Visualisierungen
2. Fehlende Tests identifiziert
3. Test-Verbesserungsvorschläge
4. Neue Test-Beispiele
5. Test-Performance-Optimierungen
6. Aktualisierte Testing-Dokumentation
