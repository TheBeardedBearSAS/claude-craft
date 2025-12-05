# Sicherheits-Audit-Checkliste

## Sensible Daten

- [ ] Tokens in flutter_secure_storage
- [ ] Keine Passwörter in SharedPreferences
- [ ] Keine hardcodierten Secrets
- [ ] .env in .gitignore
- [ ] Obfuskierung in Produktion aktiviert

## API & Netzwerk

- [ ] Nur HTTPS
- [ ] Certificate Pinning implementiert
- [ ] Timeouts konfiguriert
- [ ] Sichere Retry-Strategie
- [ ] Netzwerkfehlerbehandlung

## Authentifizierung

- [ ] Sichere JWT-Tokens
- [ ] Refresh-Token implementiert
- [ ] Sauberer Logout
- [ ] Session-Timeout
- [ ] Biometrie falls verfügbar

## Validierung

- [ ] Client-seitige Validierung
- [ ] Server-seitige Validierung
- [ ] Eingabe-Sanitisierung
- [ ] XSS-Prävention
- [ ] SQL-Injection-Prävention

## Berechtigungen

- [ ] Minimale Berechtigungen
- [ ] Anfrage zur richtigen Zeit
- [ ] Ablehnung behandeln
- [ ] Berechtigungs-Dokumentation

## Produktion

- [ ] ProGuard/R8 konfiguriert
- [ ] Symbols hochgeladen
- [ ] Produktions-Logs deaktiviert
- [ ] Error-Tracking konfiguriert
