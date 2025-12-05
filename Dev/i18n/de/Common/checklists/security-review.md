# Security Review Checkliste

## OWASP Top 10 (2021)

### A01:2021 - Broken Access Control

- [ ] Autorisierungsprüfung bei jedem Endpoint
- [ ] Kein direkter Objektzugriff per ID ohne Überprüfung
- [ ] CORS korrekt konfiguriert
- [ ] JWT-Tokens serverseitig validiert
- [ ] Prinzip der geringsten Privilegien angewendet
- [ ] Keine Privilege Escalation möglich

### A02:2021 - Cryptographic Failures

- [ ] Sensible Daten im Ruhezustand verschlüsselt
- [ ] Sensible Daten bei Übertragung verschlüsselt (HTTPS)
- [ ] Aktuelle Verschlüsselungsalgorithmen (kein MD5, SHA1)
- [ ] Verschlüsselungsschlüssel sicher gespeichert
- [ ] Passwörter mit bcrypt/argon2 gehasht
- [ ] Keine Secrets im Quellcode

### A03:2021 - Injection

- [ ] Parametrisierte SQL-Queries (Prepared Statements)
- [ ] Input-Validierung und -Bereinigung
- [ ] Output-Escaping (XSS)
- [ ] Keine dynamische Code-Evaluation
- [ ] LDAP/XML/OS-Injection überprüft
- [ ] HTTP-Header bereinigt

### A04:2021 - Insecure Design

- [ ] Threat Modeling durchgeführt
- [ ] Rate Limiting implementiert
- [ ] Ressourcenlimits definiert
- [ ] Sicher scheitern (keine Daten bei Fehler offengelegt)
- [ ] Defense in Depth angewendet

### A05:2021 - Security Misconfiguration

- [ ] Security-Header konfiguriert (CSP, HSTS, X-Frame-Options)
- [ ] Debug-Modus in Produktion deaktiviert
- [ ] Generische Fehler in Produktion (keine Stack Traces)
- [ ] Restriktive Dateiberechtigungen
- [ ] Ungenutzte Dienste deaktiviert
- [ ] Aktuelle Dependency-Versionen

### A06:2021 - Vulnerable Components

- [ ] Dependency-Audit durchgeführt (npm audit, safety check)
- [ ] Keine bekannten kritischen Schwachstellen
- [ ] Dependencies aktuell
- [ ] Package-Quellen überprüft
- [ ] Lockfile vorhanden und aktuell

### A07:2021 - Authentication Failures

- [ ] Robuste Passwort-Policy (12+ Zeichen, Komplexität)
- [ ] Brute-Force-Schutz
- [ ] MFA verfügbar/verpflichtend für Admins
- [ ] Session nach Logout invalidiert
- [ ] Tokens mit angemessener Ablaufzeit
- [ ] Keine Standard-Credentials

### A08:2021 - Software and Data Integrity Failures

- [ ] CI/CD-Pipeline-Integrität überprüft
- [ ] Package-Signaturen überprüft
- [ ] Keine unsichere Deserialisierung
- [ ] SRI (Subresource Integrity) für CDNs
- [ ] Sichere automatische Updates

### A09:2021 - Security Logging Failures

- [ ] Sicherheitsereignisse geloggt (Login, Fehler, Zugriff)
- [ ] Logs gegen Modifikation geschützt
- [ ] Keine sensiblen Daten in Logs
- [ ] Alerts bei verdächtigen Ereignissen
- [ ] Konforme Log-Aufbewahrung

### A10:2021 - Server-Side Request Forgery (SSRF)

- [ ] URLs serverseitig validiert
- [ ] Whitelist erlaubter Domains
- [ ] Kein Zugriff auf Cloud-Metadaten
- [ ] Kontrollierte DNS-Auflösung

---

## Checkliste nach Komponente

### API / Backend

- [ ] Authentifizierung bei allen sensiblen Endpoints
- [ ] Autorisierung überprüft (RBAC/ABAC)
- [ ] Strikte Input-Validierung
- [ ] Output-Encoding
- [ ] Rate Limiting pro IP/Benutzer
- [ ] Timeouts konfiguriert
- [ ] Restriktives CORS

### Datenbank

- [ ] Zugriff mit eingeschränktem Privilegien-Account
- [ ] Kein direkter Zugriff aus dem Internet
- [ ] Verschlüsselung sensibler Daten
- [ ] Verschlüsselte Backups
- [ ] Zugriffs-Audit aktiviert

### Frontend

- [ ] Content Security Policy (CSP)
- [ ] Bereinigung angezeigter Daten
- [ ] Keine Secrets im JS-Code
- [ ] HTTPS erzwungen
- [ ] Sichere Cookies (HttpOnly, Secure, SameSite)

### Mobile

- [ ] Certificate Pinning
- [ ] Sichere Speicherung (Keychain/Keystore)
- [ ] Keine sensiblen Daten im Klartext
- [ ] Anti-Tampering
- [ ] Code-Obfuskierung

### Infrastruktur

- [ ] Firewall konfiguriert
- [ ] Isoliertes VPC/Netzwerk
- [ ] Secrets in Vault (nicht in env vars)
- [ ] Zentralisierte Logs
- [ ] Sicherheits-Monitoring

---

## Sicherheitstests

### Automatisierte Tests

- [ ] SAST (statische Analyse) bestanden
- [ ] DAST (dynamische Analyse) bestanden
- [ ] Dependency-Scanning bestanden
- [ ] Container-Scanning bestanden (falls zutreffend)

### Manuelle Tests

- [ ] Penetrationstest (bei größerer Änderung)
- [ ] Sicherheits-Code-Review
- [ ] Testen gängiger Angriffsszenarien

---

## Sicherheitsdokumentation

- [ ] Sicherheitsrichtlinie dokumentiert
- [ ] Incident-Response-Prozess
- [ ] Sicherheitskontakt definiert
- [ ] Responsible Disclosure Policy

---

## Entscheidung

- [ ] ✅ **Genehmigt** - Keine Sicherheitsprobleme
- [ ] ⚠️ **Bedenken** - Punkte zu überprüfen/verbessern
- [ ] ❌ **Blockiert** - Kritische Schwachstellen zu beheben
