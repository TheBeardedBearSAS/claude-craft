# Checkliste für die Entwicklung neuer Features - React

## Vor dem Start

- [ ] Feature wurde mit dem Team diskutiert und validiert
- [ ] Technische Spezifikationen sind klar
- [ ] User Stories sind geschrieben und akzeptiert
- [ ] Design-Mockups sind verfügbar (falls zutreffend)
- [ ] API-Verträge sind definiert (falls zutreffend)

## Entwicklung

### Architektur

- [ ] Komponentenstruktur ist geplant
- [ ] Datenfluss ist definiert (Props, State, Context)
- [ ] State Management-Lösung ist gewählt (falls erforderlich)
- [ ] Ordnerstruktur respektiert die Projekt-Architektur

### Code

- [ ] Komponente folgt SOLID-Prinzipien
- [ ] Komponente ist in kleinere Komponenten aufgeteilt (falls erforderlich)
- [ ] Props sind ordnungsgemäß typisiert (TypeScript)
- [ ] Business-Logik ist von der Präsentation getrennt
- [ ] Custom Hooks sind für wiederverwendbare Logik erstellt
- [ ] Code ist ordnungsgemäß formatiert (Prettier)
- [ ] Code besteht Linting ohne Fehler (ESLint)

### State Management

- [ ] Wahl zwischen lokalem State und globalem State ist gerechtfertigt
- [ ] State ist normalisiert (keine Duplikation)
- [ ] State-Updates sind immutabel
- [ ] Side Effects werden korrekt behandelt (useEffect)

### Performance

- [ ] Komponenten sind bei Bedarf memoized (React.memo, useMemo, useCallback)
- [ ] Schwere Berechnungen sind optimiert
- [ ] Lazy Loading ist für große Komponenten implementiert
- [ ] Bilder sind optimiert
- [ ] API-Aufrufe sind bei Bedarf debounced/throttled

### Barrierefreiheit

- [ ] Semantisches HTML wird verwendet
- [ ] ARIA-Labels sind bei Bedarf vorhanden
- [ ] Tastaturnavigation funktioniert
- [ ] Farbkontrast ist ausreichend
- [ ] Mit Screenreader getestet (wenn möglich)

### Tests

- [ ] Unit-Tests sind geschrieben (Komponenten, Hooks)
- [ ] Testabdeckung ist ausreichend (>80%)
- [ ] Randfälle sind getestet
- [ ] Integrationstests sind geschrieben (falls erforderlich)
- [ ] E2E-Tests sind für kritische Flows geschrieben

### Sicherheit

- [ ] Benutzereingaben werden validiert und sanitiert
- [ ] Keine Secrets im Code
- [ ] XSS-Schwachstellen sind geprüft
- [ ] CSRF-Schutz ist implementiert (falls zutreffend)

### Dokumentation

- [ ] Komponente ist dokumentiert (JSDoc/TSDoc)
- [ ] Props sind dokumentiert
- [ ] Verwendungsbeispiele sind bereitgestellt
- [ ] README ist aktualisiert (falls erforderlich)
- [ ] Storybook-Story ist erstellt (falls zutreffend)

## Vor dem Commit

- [ ] Alle Tests bestehen (`npm test`)
- [ ] TypeScript kompiliert ohne Fehler (`npm run type-check`)
- [ ] Code ist formatiert (`npm run format`)
- [ ] Keine Linting-Fehler (`npm run lint`)
- [ ] Keine console.log oder debugger übrig
- [ ] Build funktioniert (`npm run build`)
- [ ] Änderungen lokal getestet
- [ ] Commit-Nachricht ist klar und folgt Konventionen

## Code Review

- [ ] PR hat eine klare Beschreibung
- [ ] Screenshots/GIFs sind bereitgestellt (bei UI-Änderungen)
- [ ] Zugehöriges Ticket ist referenziert
- [ ] Reviewer sind zugewiesen
- [ ] CI/CD-Pipeline läuft durch
- [ ] Änderungen von mindestens einem Reviewer genehmigt

## Nach dem Merge

- [ ] Feature auf Staging deployed
- [ ] Feature in Staging getestet
- [ ] Feature von Product Owner validiert
- [ ] Feature in Produktion deployed
- [ ] Produktions-Monitoring geprüft
- [ ] Dokumentation aktualisiert (falls erforderlich)

## Hinweise

- Diese Checkliste ist ein Leitfaden, passen Sie sie an Ihr Projekt an
- Einige Punkte sind möglicherweise nicht auf alle Features anwendbar
- Nutzen Sie Ihr Urteilsvermögen, um zu bestimmen, was wichtig ist
