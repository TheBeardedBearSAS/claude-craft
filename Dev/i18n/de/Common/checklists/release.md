# Release-Checkliste

## Pre-Release (T-7 bis T-1)

### Planung

- [ ] Release-Datum bestätigt
- [ ] Release-Umfang finalisiert (Features, Fixes)
- [ ] Release Notes geschrieben
- [ ] Kommunikation geplant (intern + extern)
- [ ] Support über Änderungen informiert
- [ ] Dokumentation aktualisiert

### Code

- [ ] Feature Freeze eingehalten
- [ ] Alle PRs gemergt
- [ ] Vollständige Code Reviews
- [ ] Keine kritischen TODOs ausstehend
- [ ] Release-Branch erstellt (falls zutreffend)
- [ ] Version erhöht (package.json, build.gradle, etc.)

### Tests

- [ ] Unit Tests bestanden (100%)
- [ ] Integrationstests bestanden
- [ ] E2E-Tests bestanden
- [ ] Performance-Tests validiert
- [ ] Sicherheitstests validiert
- [ ] Vollständige Regressionstests
- [ ] UAT (User Acceptance Testing) validiert

### Infrastruktur

- [ ] Produktionsumgebung bereit
- [ ] Produktionskonfiguration überprüft
- [ ] Skalierung konfiguriert falls notwendig
- [ ] Monitoring eingerichtet
- [ ] Alerts konfiguriert
- [ ] Backups überprüft

---

## Release-Tag (T-Tag)

### Vor dem Deployment

- [ ] Release-Team gebrieft
- [ ] Kommunikationskanäle bereit (Slack, E-Mail)
- [ ] Rollback-Plan bereit und getestet
- [ ] Wartungsfenster kommuniziert (falls zutreffend)
- [ ] Support in Bereitschaft
- [ ] Datenbank gesichert

### Deployment

- [ ] Finales Staging-Deployment OK
- [ ] Smoke Tests in Staging OK
- [ ] Release-Tag erstellt
- [ ] Produktions-Deployment gestartet
- [ ] Monitoring während Deployment überwacht
- [ ] Smoke Tests in Produktion OK

### Post-Deployment-Überprüfung

- [ ] Anwendung erreichbar
- [ ] Kritische Funktionalitäten überprüft
- [ ] Keine Fehler in Logs
- [ ] Performance-Metriken normal
- [ ] Keine Alerts ausgelöst
- [ ] Drittanbieter-Integrationen funktionsfähig

---

## Post-Release (T+1 bis T+7)

### Monitoring

- [ ] Fehlerrate normal (< 0,1%)
- [ ] Antwortzeit akzeptabel
- [ ] Keine Performance-Verschlechterung
- [ ] Benutzer-Feedback gesammelt
- [ ] Support-Tickets verfolgt

### Kommunikation

- [ ] Release Notes veröffentlicht
- [ ] Internes Team informiert
- [ ] Kunden/Benutzer benachrichtigt
- [ ] Blog-Post / Changelog aktualisiert

### Dokumentation

- [ ] Technische Dokumentation aktuell
- [ ] Runbook aktualisiert falls notwendig
- [ ] Post-Mortem bei Vorfällen
- [ ] Lessons Learned dokumentiert

### Aufräumen

- [ ] Release-Branches gemergt/gelöscht
- [ ] Feature Flags aufgeräumt
- [ ] Testumgebungen aufgeräumt
- [ ] Temporäre Ressourcen gelöscht

---

## Rollback-Checkliste

Bei kritischem Problem:

- [ ] Rollback-Entscheidung getroffen (Kriterien vorab definiert)
- [ ] Sofortige Kommunikation an Team
- [ ] Rollback ausgeführt
- [ ] Rollback-Überprüfung
- [ ] Kommunikation an Benutzer
- [ ] Post-Mortem geplant

### Rollback-Kriterien

- [ ] Fehlerrate > 5%
- [ ] Kritische Funktionalität funktioniert nicht
- [ ] Datenverlust erkannt
- [ ] Sicherheitslücke entdeckt
- [ ] Große geschäftliche Auswirkung

---

## Release-Typen

### Major Release (X.0.0)

- [ ] Alle oben genannten Kriterien
- [ ] Marketing-Kommunikation
- [ ] Support-Team-Training
- [ ] Migrationsanleitung bei Breaking Changes
- [ ] Vorheriges Beta-Testing

### Minor Release (x.Y.0)

- [ ] Standard-Kriterien
- [ ] Detaillierte Release Notes
- [ ] Benutzer-Benachrichtigung

### Patch (x.y.Z)

- [ ] Gezielte Tests auf den Fix
- [ ] Schnelles Deployment möglich
- [ ] Kommunikation falls kritisch

### Hotfix

- [ ] Beschleunigter Prozess
- [ ] Minimale aber essenzielle Tests
- [ ] Sofortiges Deployment
- [ ] Verpflichtendes Post-Mortem

---

## Notfallkontakte

| Rolle | Name | Kontakt |
|------|------|---------|
| Release Manager | | |
| Tech Lead | | |
| DevOps | | |
| Support Lead | | |
| Product Owner | | |

---

## Release-Historie

| Version | Datum | Status | Notizen |
|---------|------|--------|-------|
| | | | |
