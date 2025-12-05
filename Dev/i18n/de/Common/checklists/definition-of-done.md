# Definition of Done (DoD)

## Allgemeine Checkliste

Eine Aufgabe gilt als "Erledigt", wenn ALLE folgenden Kriterien erfüllt sind:

### Code

- [ ] Code ist geschrieben und folgt Projektkonventionen
- [ ] Code kompiliert ohne Fehler oder Warnungen
- [ ] Code hat Code Review bestanden
- [ ] Code ist in den Main Branch gemergt
- [ ] Merge-Konflikte sind gelöst

### Tests

- [ ] Unit Tests geschrieben und bestanden (Coverage > 80%)
- [ ] Integrationstests geschrieben und bestanden
- [ ] E2E-Tests bestanden (falls zutreffend)
- [ ] Regressionstests bestanden
- [ ] Manuelle Tests durchgeführt und validiert

### Dokumentation

- [ ] Technische Dokumentation aktualisiert (falls notwendig)
- [ ] Benutzerdokumentation aktualisiert (falls notwendig)
- [ ] Kommentare im Code für komplexe Teile
- [ ] README aktualisiert falls neues Setup erforderlich
- [ ] CHANGELOG aktualisiert

### Qualität

- [ ] Statische Analyse bestanden (Linter, Type-Checker)
- [ ] Keine technische Schuld eingeführt (oder dokumentiert falls unvermeidbar)
- [ ] Code Review von mindestens 1 Entwickler genehmigt
- [ ] Performance überprüft (keine Verschlechterung)
- [ ] Sicherheit überprüft (OWASP)

### Deployment

- [ ] CI/CD Build erfolgreich
- [ ] In Staging-Umgebung deployt
- [ ] In Staging getestet
- [ ] Produktionskonfiguration bereit
- [ ] Rollback-Plan dokumentiert (falls zutreffend)

### Geschäftsvalidierung

- [ ] Akzeptanzkriterien validiert
- [ ] Demo für Product Owner (falls zutreffend)
- [ ] Feedback integriert

---

## DoD nach Aufgabentyp

### Bugfix

- [ ] Bug reproduziert und dokumentiert
- [ ] Grundursache identifiziert
- [ ] Fix implementiert
- [ ] Non-Regressions-Test hinzugefügt
- [ ] In betroffenen Umgebungen getestet

### Neue Funktion

- [ ] User Story verstanden und validiert
- [ ] Design/UX validiert (falls zutreffend)
- [ ] Vollständige Implementierung
- [ ] Umfassende Tests
- [ ] Feature Flag falls notwendig
- [ ] Analytics/Tracking konfiguriert (falls zutreffend)

### Refactoring

- [ ] Refactoring-Umfang definiert
- [ ] Bestehende Tests bestehen weiterhin
- [ ] Keine Verhaltensänderung
- [ ] Gleiche oder bessere Performance
- [ ] Gründliches Code Review

### Technische Aufgabe

- [ ] Technisches Ziel erreicht
- [ ] Vollständige technische Dokumentation
- [ ] Auswirkung auf andere Komponenten überprüft
- [ ] Migrationsplan falls notwendig

---

## Ausnahmen

Ausnahmen von der DoD müssen:
1. Im Ticket dokumentiert sein
2. Vom Tech Lead genehmigt werden
3. Von einem Technical Debt Ticket gefolgt werden

---

## Überarbeitung

Diese Definition of Done wird bei jeder Sprint-Retrospektive überprüft, falls notwendig.

Zuletzt aktualisiert: YYYY-MM-DD
