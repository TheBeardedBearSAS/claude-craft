# Pull Request Template

## Beschreibung

<!-- Beschreiben Sie kurz die vorgenommenen Änderungen -->

## Art der Änderung

- [ ] 🐛 Bugfix (Non-Breaking Change, der ein Problem behebt)
- [ ] ✨ Neue Funktion (Non-Breaking Change, der Funktionalität hinzufügt)
- [ ] 💥 Breaking Change (Fix oder Feature, das bestehende Funktionalität nicht mehr wie erwartet funktionieren lässt)
- [ ] 📝 Dokumentation (nur Dokumentations-Update)
- [ ] 🔧 Konfiguration (Konfigurationsänderungen, CI/CD)
- [ ] ♻️ Refactoring (Codeänderung, die weder Feature hinzufügt noch Bug behebt)
- [ ] 🎨 Style (Formatierung, Whitespace, etc. - keine Codeänderung)
- [ ] ⚡ Performance (Änderung, die Performance verbessert)
- [ ] 🧪 Tests (Tests hinzufügen oder ändern)

## Zugehörige Tickets

<!-- Links zu zugehörigen Issues/Tickets -->
- Schließt #
- Bezieht sich auf #

## Vorgenommene Änderungen

<!-- Liste der Hauptänderungen -->
-
-
-

## Screenshots / Videos

<!-- Falls zutreffend, Screenshots oder Videos hinzufügen -->

| Vorher | Nachher |
|--------|-------|
|        |       |

## Checkliste

### Code-Qualität
- [ ] Mein Code folgt den Projektkonventionen
- [ ] Ich habe ein Self-Review meines Codes durchgeführt
- [ ] Ich habe meinen Code kommentiert, besonders in schwer verständlichen Bereichen
- [ ] Meine Änderungen erzeugen keine neuen Warnungen

### Tests
- [ ] Ich habe Tests hinzugefügt, die beweisen, dass mein Fix effektiv ist oder meine Funktion funktioniert
- [ ] Bestehende Unit Tests bestehen lokal
- [ ] Integrationstests bestehen

### Dokumentation
- [ ] Ich habe die Dokumentation bei Bedarf aktualisiert
- [ ] Ich habe das CHANGELOG falls zutreffend aktualisiert

### Sicherheit
- [ ] Ich habe überprüft, dass keine Sicherheitslücken eingeführt werden
- [ ] Keine sensiblen Daten werden in Logs oder Code offengelegt

### Performance
- [ ] Ich habe die Performance-Auswirkung berücksichtigt
- [ ] Keine N+1 Queries eingeführt
- [ ] Keine Memory Leaks eingeführt

## Wie zu testen

<!-- Anweisungen zum Testen der Änderungen -->
1.
2.
3.

## Hinweise für Reviewer

<!-- Wichtige Informationen für das Review -->

## Reviewer-Checkliste

- [ ] Code ist lesbar und gut strukturiert
- [ ] Geschäftslogik ist korrekt
- [ ] Edge Cases werden behandelt
- [ ] Tests sind relevant
- [ ] Kein unnötiger duplizierter Code
- [ ] Fehlermeldungen sind klar
