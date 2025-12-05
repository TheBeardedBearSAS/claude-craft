# Pre-Commit-Checkliste

## Code-Qualität

- [ ] Code formatiert mit `dart format`
- [ ] Keine `flutter analyze`-Warnungen
- [ ] Keine Kompilierungsfehler
- [ ] Alle Imports organisiert
- [ ] Kein unnötig auskommentierter Code
- [ ] Keine vergessenen `print()` oder `debugPrint()`
- [ ] Kein TODO ohne zugehöriges Ticket

## Tests

- [ ] Unit-Tests bestanden (`flutter test`)
- [ ] Widget-Tests bestanden
- [ ] Coverage > 80% für neue Dateien
- [ ] Keine übersprungenen Tests (`@Skip`)

## Dokumentation

- [ ] Dartdoc für neue öffentliche Klassen
- [ ] README aktualisiert falls erforderlich
- [ ] CHANGELOG aktualisiert
- [ ] Kommentare für komplexen Code

## Git

- [ ] Commit-Nachricht folgt Conventional Commits
- [ ] Keine sensiblen Dateien (.env, secrets)
- [ ] .gitignore aktuell
- [ ] Branch aktuell mit develop/main

## Architektur

- [ ] Clean Architecture eingehalten
- [ ] Abhängigkeiten in korrekter Richtung
- [ ] Keine Business-Logik in UI
- [ ] Wiederverwendbare Widgets extrahiert

## Performance

- [ ] const-Widgets verwendet
- [ ] Keine unnötigen Builds
- [ ] Bilder optimiert
- [ ] Korrekter async/await-Gebrauch

## Sicherheit

- [ ] Keine hardcodierten sensiblen Daten
- [ ] Benutzereingabe-Validierung
- [ ] Angemessene Berechtigungsbehandlung
