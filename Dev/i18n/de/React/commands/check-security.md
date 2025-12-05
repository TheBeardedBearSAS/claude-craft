# Sicherheits-Überprüfung

Führe ein umfassendes Sicherheits-Audit der React-Anwendung durch.

## Aufgabe

1. **Schwachstellen-Scan**
   - Führe `npm audit` aus
   - Prüfe bekannte CVEs
   - Identifiziere veraltete Pakete
   - Nutze Snyk oder ähnliche Tools

2. **XSS-Prävention**
   - Überprüfe `dangerouslySetInnerHTML`-Nutzung
   - Validiere User-Input-Sanitization
   - Prüfe auf unsicheres HTML-Rendering
   - Teste mit DOMPurify

3. **CSRF-Schutz**
   - Überprüfe CSRF-Token-Implementation
   - Validiere SameSite-Cookie-Attribute
   - Prüfe API-Request-Header
   - Teste Cross-Origin-Requests

4. **Authentifizierung und Autorisierung**
   - Überprüfe Token-Storage (keine localStorage!)
   - Validiere JWT-Handling
   - Prüfe Protected Routes
   - Teste Session-Management

5. **Input-Validierung**
   - Überprüfe alle Formular-Inputs
   - Validiere Zod-Schema-Nutzung
   - Prüfe URL-Parameter-Sanitization
   - Teste mit bösartigen Inputs

6. **Content Security Policy**
   - Überprüfe CSP-Header
   - Validiere nonce-Nutzung für Inline-Scripts
   - Prüfe auf unsafe-inline/unsafe-eval
   - Teste CSP-Compliance

7. **Sichere Kommunikation**
   - Überprüfe HTTPS-Enforcement
   - Validiere API-Verschlüsselung
   - Prüfe Secure-Cookie-Flags
   - Teste CORS-Konfiguration

8. **Secrets-Management**
   - Suche nach hardcodierten Secrets
   - Überprüfe .env-Dateien
   - Validiere Umgebungsvariablen-Nutzung
   - Prüfe .gitignore

9. **Abhängigkeits-Sicherheit**
   - Analysiere Paket-Lizenzen
   - Überprüfe Subresource Integrity
   - Validiere npm-Registry-Quellen
   - Prüfe auf Typosquatting

10. **Sicherheits-Headers**
    - Überprüfe X-Frame-Options
    - Validiere X-Content-Type-Options
    - Prüfe Referrer-Policy
    - Teste Permissions-Policy

## Sicherheits-Tests durchführen

```bash
# Schwachstellen-Scan
npm audit
npm audit fix

# Erweiterte Sicherheitsprüfung
npx snyk test
npx snyk monitor

# Code-Scan
npx eslint . --ext .ts,.tsx

# Lizenz-Prüfung
npx license-checker --summary
```

## Sicherheits-Checkliste

```markdown
## Schwachstellen
- [ ] npm audit: 0 kritische/hohe Schwachstellen
- [ ] Alle Pakete aktuell
- [ ] Keine bekannten CVEs
- [ ] Snyk-Scan bestanden

## XSS-Schutz
- [ ] Keine unsicheren dangerouslySetInnerHTML
- [ ] DOMPurify für HTML-Sanitization
- [ ] Input-Validierung implementiert
- [ ] React escaping verifiziert

## CSRF-Schutz
- [ ] CSRF-Token implementiert
- [ ] SameSite-Cookies konfiguriert
- [ ] API-Headers validiert
- [ ] Double-Submit-Cookie-Pattern

## Authentifizierung
- [ ] HttpOnly-Cookies für Tokens
- [ ] JWT-Validierung implementiert
- [ ] Protected Routes konfiguriert
- [ ] Session-Timeout implementiert

## Input-Validierung
- [ ] Zod-Schemas für alle Forms
- [ ] URL-Parameter sanitisiert
- [ ] File-Upload-Validierung
- [ ] Rate Limiting implementiert

## Headers
- [ ] CSP konfiguriert
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] HTTPS erzwungen

## Secrets
- [ ] Keine hardcodierten Secrets
- [ ] .env in .gitignore
- [ ] Umgebungsvariablen genutzt
- [ ] Secrets rotiert
```

## Zu liefern

1. Sicherheits-Audit-Bericht
2. Schwachstellen-Liste mit Schweregrad
3. Sicherheits-Fix-Empfehlungen
4. Aktualisierter Sicherheits-Leitfaden
5. Penetrationstest-Ergebnisse
6. Compliance-Status (OWASP Top 10)
