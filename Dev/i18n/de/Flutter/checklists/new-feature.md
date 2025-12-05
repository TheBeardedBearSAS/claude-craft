# Checkliste für neue Features

## Analyse

- [ ] Geschäftsbedarf geklärt
- [ ] Anwendungsfälle identifiziert
- [ ] Abhängigkeiten analysiert
- [ ] Architektur definiert
- [ ] Grenzfälle antizipiert

## Domain Layer

- [ ] Entity erstellt
- [ ] Repository-Interface definiert
- [ ] Use Cases implementiert
- [ ] Unit-Tests für Use Cases (> 90%)

## Data Layer

- [ ] Models mit Freezed/JsonSerializable
- [ ] Remote DataSource
- [ ] Local DataSource (falls Cache)
- [ ] Repository implementiert
- [ ] Unit-Tests für Repository (> 85%)

## Presentation Layer

- [ ] BLoC Events/States
- [ ] BLoC implementiert
- [ ] BLoC-Tests (> 85%)
- [ ] Pages/Screens erstellt
- [ ] Wiederverwendbare Widgets extrahiert
- [ ] Widget-Tests (> 70%)

## Integration

- [ ] Dependency Injection konfiguriert
- [ ] Navigation hinzugefügt
- [ ] Integrationstests geschrieben
- [ ] E2E-Flow getestet

## Dokumentation

- [ ] Vollständige Dartdoc
- [ ] README aktualisiert
- [ ] CHANGELOG aktualisiert
- [ ] Screenshots hinzugefügt (bei UI)

## Qualität

- [ ] flutter analyze sauber
- [ ] dart format angewendet
- [ ] Test-Coverage > Schwellenwerte
- [ ] Performance verifiziert
- [ ] Code-Review genehmigt
