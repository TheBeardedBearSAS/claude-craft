# Sicherheits-Audit-Checkliste

Umfassendes Sicherheits-Audit für React Native Anwendung.

---

## 1. Speicherung sensibler Daten

### SecureStore / Keychain

- [ ] Tokens in SecureStore gespeichert (iOS Keychain / Android Keystore)
- [ ] Refresh Tokens gesichert
- [ ] API-Keys nicht exponiert
- [ ] Credentials niemals im Klartext
- [ ] Biometrische Schlüssel geschützt

### Code

- [ ] Keine hartkodierten Secrets
- [ ] Keine Tokens im Quellcode
- [ ] Keine Credentials in Logs
- [ ] `.env` in `.gitignore`
- [ ] Secrets in EAS Secrets (Produktion)

### Storage

- [ ] MMKV-Verschlüsselung aktiviert (sensible Daten)
- [ ] Keine PII in AsyncStorage
- [ ] Storage bei Logout geleert
- [ ] Backup verschlüsselt (iOS/Android)

---

## 2. API-Sicherheit

### Authentifizierung

- [ ] JWT-Tokens mit kurzer Ablaufzeit
- [ ] Refresh Token Mechanismus
- [ ] Token-Rotation implementiert
- [ ] Automatische Token-Aktualisierung
- [ ] Logout löscht alle Tokens

### HTTPS

- [ ] Alle API-Calls in HTTPS
- [ ] Kein HTTP in Produktion
- [ ] Certificate Pinning (falls kritisch)
- [ ] TLS 1.2+ minimum

### Headers

- [ ] Authorization Header vorhanden
- [ ] CSRF-Schutz (falls zutreffend)
- [ ] API-Version in Headers
- [ ] Request ID Tracking
- [ ] User-Agent vorhanden

### Request-Sicherheit

- [ ] Timeout konfiguriert (10s max)
- [ ] Retry-Logik mit Backoff
- [ ] Client-seitiges Rate Limiting
- [ ] Request-Validierung
- [ ] Response-Validierung

---

## 3. Eingabevalidierung

### Benutzereingabe

- [ ] Validierung mit Zod/Yup
- [ ] Sanitization vor Anzeige
- [ ] Max-Länge erzwungen
- [ ] Strikte Typprüfung
- [ ] Sichere Regex-Validierung

### Formulare

- [ ] E-Mail-Validierung
- [ ] Passwortstärke erzwungen
- [ ] Sonderzeichen behandelt
- [ ] SQL-Injection verhindert (Backend)
- [ ] XSS-Prävention

### URL/Deep Links

- [ ] URL-Validierung
- [ ] Deep Link Schema-Validierung
- [ ] Parameter-Sanitization
- [ ] Whitelist erlaubter Hosts
- [ ] Redirect-Validierung

---

## 4. Authentifizierung & Autorisierung

### Authentifizierung

- [ ] Sicherer Login-Flow
- [ ] Biometrische Authentifizierung (falls verfügbar)
- [ ] 2FA-Unterstützung (falls erforderlich)
- [ ] Sicheres Passwort-Reset
- [ ] Konto-Sperre nach Versuchen

### Autorisierung

- [ ] Rollenbasierte Zugriffskontrolle
- [ ] Berechtigungsprüfungen vor Aktionen
- [ ] Implementierung geschützter Routen
- [ ] API-Berechtigungen validiert
- [ ] Ressourcenbesitz überprüft

### Session-Management

- [ ] Session-Timeout konfiguriert
- [ ] Automatischer Logout bei Inaktivität
- [ ] Gleichzeitige Session-Verwaltung
- [ ] Session-Widerruf
- [ ] Sicheres Remember Me

---

## 5. Code-Sicherheit

### Abhängigkeiten

- [ ] `npm audit` sauber (0 Schwachstellen)
- [ ] Abhängigkeiten aktuell
- [ ] Keine verdächtigen Pakete
- [ ] Lock-Datei committed
- [ ] Regelmäßige Updates geplant

### Code-Qualität

- [ ] ESLint-Sicherheitsregeln
- [ ] TypeScript Strict Mode
- [ ] Keine `eval()` Verwendung
- [ ] Kein `dangerouslySetInnerHTML`
- [ ] Kein bösartiger obfuskierter Code

### Secrets-Management

- [ ] Umgebungsvariablen verwendet
- [ ] EAS Secrets für Produktion
- [ ] Config-Dateien gitignored
- [ ] Keine Secrets in Logs
- [ ] Secrets-Rotationsstrategie

---

## 6. Plattform-Sicherheit

### iOS

- [ ] Keychain-Zugriff konfiguriert
- [ ] NSAllowsArbitraryLoads = false
- [ ] SSL Pinning (falls kritisch)
- [ ] Screenshot-Prävention (falls sensibel)
- [ ] Touch ID / Face ID konfiguriert

### Android

- [ ] ProGuard / R8 aktiviert
- [ ] Network Security Config
- [ ] Certificate Pinning (falls kritisch)
- [ ] Screenshot-Prävention (falls sensibel)
- [ ] Fingerprint / Face konfiguriert

### Berechtigungen

- [ ] Minimale Berechtigungen
- [ ] Laufzeit-Berechtigungen behandelt
- [ ] Berechtigungs-Begründung angezeigt
- [ ] Verweigerte Berechtigungen behandelt
- [ ] Berechtigungen dokumentiert

---

## 7. Netzwerk-Sicherheit

### Kommunikation

- [ ] Nur HTTPS
- [ ] Kein gemischter Inhalt
- [ ] Zertifikat-Validierung
- [ ] Pinning (hohe Sicherheit)
- [ ] Kein Klartext-Traffic

### Datenübertragung

- [ ] Sensible Daten verschlüsselt
- [ ] Keine Credentials in URL
- [ ] POST für sensible Daten
- [ ] Datei-Uploads gesichert
- [ ] Download-Validierung

---

## 8. Offline-Sicherheit

### Lokale Daten

- [ ] Sensible Daten verschlüsselt
- [ ] Cache-Invalidierung
- [ ] Alte Daten aufgeräumt
- [ ] Sichere Offline-Auth
- [ ] Sync-Konflikte behandelt

### Storage Cleanup

- [ ] Logout leert Cache
- [ ] Temp-Dateien gelöscht
- [ ] Bilder sicher gecacht
- [ ] Datenbank verschlüsselt
- [ ] Backup verschlüsselt

---

## 9. Fehlerbehandlung

### Fehlermeldungen

- [ ] Keine sensiblen Info in Fehlern
- [ ] Generische Fehler an Benutzer
- [ ] Detaillierte Logs nur serverseitig
- [ ] Stack Traces versteckt (Produktion)
- [ ] Error Tracking konfiguriert

### Logging

- [ ] Keine Credentials geloggt
- [ ] Keine PII geloggt
- [ ] Logs sanitized
- [ ] Log-Rotation konfiguriert
- [ ] Crash-Reports gesichert

---

## 10. Drittanbieter-Sicherheit

### SDKs

- [ ] SDKs von vertrauenswürdigen Quellen
- [ ] Datenschutzrichtlinien überprüft
- [ ] Datenaustausch dokumentiert
- [ ] Minimale Berechtigungen
- [ ] Analytics anonymisiert

### APIs

- [ ] Drittanbieter-APIs gesichert
- [ ] API-Keys in Secrets
- [ ] OAuth ordnungsgemäß implementiert
- [ ] Minimaler Scope
- [ ] Widerrufbare Tokens

---

## 11. WebView-Sicherheit (falls verwendet)

- [ ] Nur HTTPS
- [ ] JavaScript-Injection verhindert
- [ ] Dateizugriff eingeschränkt
- [ ] Content Security Policy
- [ ] Domain-Whitelist

---

## 12. Biometrische Sicherheit

- [ ] Fallback auf Passcode
- [ ] Enrollment überprüft
- [ ] Secure Element verwendet
- [ ] Biometrische Daten niemals gespeichert
- [ ] Datenschutz respektiert

---

## 13. Code-Obfuskierung (Produktion)

- [ ] Code obfuskiert (Hermes)
- [ ] Source Maps nicht enthalten
- [ ] Debug-Info entfernt
- [ ] Console Logs entfernt
- [ ] Dead Code eliminiert

---

## 14. Compliance

### GDPR (falls EU)

- [ ] Datenschutzerklärung
- [ ] Einwilligungsverwaltung
- [ ] Datenexport-Feature
- [ ] Datenlöschungs-Feature
- [ ] Cookie-Zustimmung

### CCPA (falls US/CA)

- [ ] Do Not Sell Option
- [ ] Datenoffenlegung
- [ ] Löschungsrechte
- [ ] Datenschutzhinweis

### HIPAA (falls Gesundheitsdaten)

- [ ] Verschlüsselung im Ruhezustand
- [ ] Verschlüsselung während Übertragung
- [ ] Zugriffskontrollen
- [ ] Audit-Logging
- [ ] BAA vorhanden

---

## 15. Monitoring & Response

### Monitoring

- [ ] Sicherheitsvorfälle verfolgt
- [ ] Anomalieerkennung
- [ ] Fehlgeschlagene Auth überwacht
- [ ] API-Missbrauch-Erkennung
- [ ] Performance-Monitoring

### Incident Response

- [ ] Response-Plan dokumentiert
- [ ] Kontaktliste aktualisiert
- [ ] Rollback-Verfahren
- [ ] Kommunikationsplan
- [ ] Post-Mortem-Prozess

---

## 16. Testing

### Sicherheitstests

- [ ] Penetrationstests durchgeführt
- [ ] OWASP Mobile Top 10 geprüft
- [ ] Man-in-the-Middle getestet
- [ ] Session Hijacking getestet
- [ ] SQL Injection getestet (Backend)

### Code-Analyse

- [ ] Statische Analyse durchgeführt
- [ ] Dynamische Analyse durchgeführt
- [ ] Dependency Scanning
- [ ] Secret Scanning
- [ ] Lizenz-Compliance

---

## Abschließende Prüfung

- [ ] Alle kritischen Punkte adressiert
- [ ] Hohe Schweregrade behoben
- [ ] Mittlere Schweregrade geplant
- [ ] Dokumentation aktualisiert
- [ ] Team geschult

---

## Sicherheits-Score

- **Kritisch**: ___ / ___ ✅
- **Hoch**: ___ / ___ ✅
- **Mittel**: ___ / ___ ⚠️
- **Niedrig**: ___ / ___ ℹ️

---

**Sicherheit ist kein Feature, sondern eine Anforderung.**

Bericht erstellt: {{DATE}}
Auditor: {{NAME}}
