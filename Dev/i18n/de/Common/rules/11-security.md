# Sicherheit

## Überblick

Sicherheit hat **absolute Priorität**. Dieses Dokument stellt die allgemeinen Sicherheitsprinzipien vor, die für jedes Projekt gelten.

> **Hinweis:** Konsultieren Sie die technologiespezifischen Regeln für konkrete Implementierungen.

**Referenzen:**
- OWASP Top 10
- CWE/SANS Top 25

---

## Inhaltsverzeichnis

1. [OWASP Top 10](#owasp-top-10)
2. [Eingabevalidierung](#eingabevalidierung)
3. [Authentifizierung](#authentifizierung)
4. [Autorisierung](#autorisierung)
5. [Sensible Daten](#sensible-daten)
6. [Sicherheitsheader](#sicherheitsheader)
7. [Logging und Monitoring](#logging-und-monitoring)
8. [MCP- & Plugin-Sicherheit](#mcp---plugin-sicherheit)
9. [Checkliste](#checkliste)

---

## OWASP Top 10

### 1. Broken Access Control

```
RISIKO
- Zugriff auf Ressourcen ohne Überprüfung
- Vorhersehbare URLs (/admin, /user/123/edit)
- Manipulation von IDs in URLs

SCHUTZ
- Berechtigungen bei JEDER Anfrage prüfen
- Nicht vorhersehbare Identifikatoren verwenden (UUID)
- Deny by Default
```

### 2. Cryptographic Failures

```
RISIKO
- Sensible Daten im Klartext
- Veraltete Algorithmen (MD5, SHA1)
- Schlüssel im Quellcode

SCHUTZ
- Sensible Daten im Ruhezustand verschlüsseln
- TLS 1.3 bei der Übertragung verwenden
- Moderne Algorithmen (bcrypt, Argon2, AES-256)
- Secrets in einem Vault (nicht im Code)
```

### 3. Injection

```
RISIKO
- SQL Injection
- Command Injection
- LDAP Injection

SCHUTZ
- Parametrisierte Abfragen (Prepared Statements)
- Validierung und Sanitization der Eingaben
- Prinzip der geringsten Berechtigung (DB)
- Escape der Ausgaben
```

### 4. Insecure Design

```
RISIKO
- Kein Threat Modeling
- Sensible Funktionen nicht geschützt
- Fehlendes Rate Limiting

SCHUTZ
- Threat Modeling ab dem Entwurf
- Security by Design
- Defense in Depth
- Rate Limiting
```

### 5. Security Misconfiguration

```
RISIKO
- Nicht geänderte Standardkonfigurationen
- Unnötige Funktionen aktiviert
- Ausführliche Fehlermeldungen
- Zu weitreichende Berechtigungen

SCHUTZ
- Härtung der Konfigurationen
- Nicht Benötigtes deaktivieren
- Generische Fehlermeldungen in der Produktion
- Prinzip der geringsten Berechtigung
```

### 6. Vulnerable Components

```
RISIKO
- Abhängigkeiten mit bekannten Schwachstellen
- Veraltete Komponenten
- Keine CVE-Verfolgung

SCHUTZ
- Regelmäßiges Audit der Abhängigkeiten
- Automatische Updates (Dependabot)
- SBOM (Software Bill of Materials)
```

### 7. Authentication Failures

```
RISIKO
- Schwache Passwörter erlaubt
- Kein MFA
- Sitzungen, die nicht ablaufen
- Credential Stuffing möglich

SCHUTZ
- Richtlinie für starke Passwörter
- MFA für sensible Zugriffe
- Sitzungsablauf
- Rate Limiting beim Login
- Brute-Force-Erkennung
```

### 8. Data Integrity Failures

```
RISIKO
- Nicht überprüfte Abhängigkeiten
- Nicht gesicherte CI/CD
- Nicht signierte Updates

SCHUTZ
- Signaturüberprüfung
- Gesicherte CI/CD
- Integritätsprüfungen (Checksums)
```

### 9. Logging & Monitoring Failures

```
RISIKO
- Keine Protokollierung von Sicherheitsereignissen
- Ungeschützte Logs
- Kein Alerting

SCHUTZ
- Sicherheitsereignisse protokollieren
- Logs schützen (eingeschränkter Zugriff)
- Alerting bei Anomalien
- Angemessene Aufbewahrungsfrist
```

### 10. SSRF (Server-Side Request Forgery)

```
RISIKO
- Nicht validierte vom Benutzer bereitgestellte URLs
- Zugriff auf interne Ressourcen

SCHUTZ
- Whitelist der erlaubten Ziele
- Strikte URL-Validierung
- Kein interner Netzwerkzugriff über Benutzereingaben
```

---

## Eingabevalidierung

### Goldene Regel

> **Vertrauen Sie niemals Benutzerdaten.**
> Serverseitig validieren, IMMER.

### Validierungstypen

| Typ | Beschreibung | Beispiel |
|-----|-------------|---------|
| **Whitelist** | Nur Erwartetes akzeptieren | `status in ["pending", "done"]` |
| **Typprüfung** | Typ prüfen | `typeof id === "number"` |
| **Format** | Format prüfen | `email.matches(EMAIL_REGEX)` |
| **Bereich** | Grenzen prüfen | `1 <= page <= 100` |
| **Länge** | Länge prüfen | `name.length <= 255` |

### Beispiele

```
// SCHLECHT - Keine Validierung
function getUser(id):
  return db.query("SELECT * FROM users WHERE id = " + id)

// GUT - Validierung + parametrisierte Abfrage
function getUser(id):
  if not isValidUUID(id):
    throw InvalidInput("Invalid user ID")

  return db.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  )
```

### Sanitization vs Validierung

```
Validierung: Ungültige Daten ablehnen
  → "abc" als numerische ID → FEHLER

Sanitization: Daten bereinigen
  → "<script>" in einem Namen → "script"

VALIDIERUNG (Ablehnen) gegenüber SANITIZATION (Transformieren) bevorzugen
```

---

## Authentifizierung

### Passwörter

```
Regeln:
- Mindestens 12 Zeichen
- Großbuchstaben, Kleinbuchstaben, Ziffern, Sonderzeichen
- Nicht in Listen kompromittierter Passwörter
- Hash mit bcrypt/Argon2 (NIEMALS MD5/SHA1)
- Einzigartiges Salt pro Benutzer

// GUT
hash = bcrypt.hash(password, costFactor=12)

// SCHLECHT
hash = md5(password)
hash = sha1(password + "static_salt")
```

### Sitzungen

```
Regeln:
- Kryptographisch sicheres zufälliges Token
- Serverseitige Speicherung (nicht in Cookies)
- Ablauf: 15-30 Min Inaktivität
- Erneuerung nach Login
- Ungültigmachung nach Logout

Session config:
  cookie:
    httpOnly: true     # Nicht per JS zugänglich
    secure: true       # Nur HTTPS
    sameSite: strict   # CSRF-Schutz
```

### JWT (falls verwendet)

```
Regeln:
- Algorithmus: RS256 oder ES256 (nicht HS256 mit schwachem Secret)
- Kurze Ablaufzeit (15 Min)
- Langlebiger Refresh Token (7 Tage) sicher gespeichert
- Signatur und Claims prüfen
- Keine sensiblen Daten im Payload speichern

// SCHLECHT
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// GUT
jwt.sign(payload, privateKey, {
  algorithm: "RS256",
  expiresIn: "15m"
})
```

### Multi-Faktor-Authentifizierung (MFA)

```
Wann MFA aktivieren:
- Admin-Zugriff
- Sensible Operationen (Zahlung, Löschung)
- Passwortänderung
- Anmeldung von neuem Gerät

Methoden:
- TOTP (Google Authenticator)
- SMS (weniger sicher)
- Hardware-Schlüssel (FIDO2)
```

---

## Autorisierung

### Prinzip der geringsten Berechtigung

```
Regel: Nur die NOTWENDIGEN Berechtigungen gewähren.

SCHLECHT
user.role = "admin"  # Zugriff auf alles

GUT
user.permissions = ["read:users", "write:orders"]
```

### RBAC (Role-Based Access Control)

```
Rollen:
- admin: Alle Berechtigungen
- manager: Benutzerverwaltung, Berichte lesen
- user: Zugriff auf eigene Daten

Überprüfung:
function deleteUser(userId, currentUser):
  if not currentUser.hasPermission("delete:users"):
    throw Forbidden("Permission denied")

  // ... Löschlogik
```

### Row-Level Security

```
Regel: Prüfen, ob der Benutzer Zugriff auf DIE spezifische Ressource hat.

// SCHLECHT - Prüft nur Authentifizierung
function getOrder(orderId):
  return db.find("orders", orderId)

// GUT - Prüft Zugehörigkeit
function getOrder(orderId, currentUser):
  order = db.find("orders", orderId)

  if order.userId != currentUser.id:
    throw Forbidden("Not your order")

  return order
```

---

## Sensible Daten

### Klassifizierung

| Kategorie | Beispiele | Schutz |
|-----------|----------|--------|
| **Öffentlich** | Produktname | Keiner |
| **Intern** | E-Mails | Eingeschränkter Zugriff |
| **Vertraulich** | Kundendaten | Verschlüsselung |
| **Geheim** | Passwörter, Schlüssel | Vault, Hash |

### Speicherung

```
Passwörter:
  → Hash mit bcrypt/Argon2
  → NIEMALS im Klartext

Personenbezogene Daten (DSGVO):
  → Verschlüsselung im Ruhezustand
  → Pseudonymisierung wenn möglich
  → Begrenzte Aufbewahrungsfrist

Secrets (API-Schlüssel, etc.):
  → Umgebungsvariablen
  → Vault (HashiCorp, AWS Secrets Manager)
  → NIEMALS im Quellcode
```

### Übertragung

```
Regeln:
- HTTPS obligatorisch (TLS 1.3)
- Gültige Zertifikate
- HSTS aktiviert
- Keine sensiblen Daten in URLs

// SCHLECHT
GET /api/users?password=secret123

// GUT
POST /api/auth
Body: { "password": "..." }
```

---

## Sicherheitsheader

### Empfohlene Header

```http
# XSS-Schutz
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block

# Clickjacking-Schutz
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Berechtigungen
Permissions-Policy: geolocation=(), camera=()
```

### Content-Security-Policy (CSP)

```http
# Restriktiv (empfohlen)
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' api.example.com;
  frame-ancestors 'none';
```

---

## Logging und Monitoring

### Zu protokollierende Ereignisse

```
ZU PROTOKOLLIEREN:
- Anmeldeversuche (Erfolg/Fehlschlag)
- Berechtigungsänderungen
- Zugriff auf sensible Daten
- Autorisierungsfehler
- Konfigurationsänderungen
- Datenexporte

NICHT ZU PROTOKOLLIEREN:
- Passwörter
- Tokens
- Vollständige personenbezogene Daten
- Kreditkartennummern
```

### Log-Format

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "WARN",
  "event": "login_failed",
  "user_id": "user_123",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "reason": "invalid_password",
    "attempts": 3
  }
}
```

### Alerting

```
Kritische Warnungen:
- 5+ fehlgeschlagene Logins auf demselben Konto
- Admin-Zugriff von neuer IP
- Berechtigungsänderung
- Serie von 500-Fehlern
- Abnormales Anfragevolumen
```

---

## MCP- & Plugin-Sicherheit

### Risiken von Drittanbieter-MCP-Servern

> **Warnung:** Sicherheitsforschung (Snyk, 2026) hat 76 boesartige Payloads in oeffentlichen MCP-Server-Registern identifiziert. Unueberprufte MCP-Server von Drittanbietern stellen ein erhebliches Risiko dar.

```
RISIKEN:
- Befehlsinjektion ueber MCP-Parameter
- Datenexfiltration (Dateien, Geheimnisse, Kontext)
- Ausfuehrung beliebigen Codes auf dem Host-Rechner
- Privilegieneskalation ueber freigegebene Tools

SCHUTZ:
- Eigene MCP-Server bevorzugen
- Quellcode vor der Installation von Drittanbieter-Servern auditieren
- Berechtigungen einschraenken (Tools-Allowlist)
- PreToolUse-Hook verwenden, um gefaehrliche Muster zu blockieren
```

### MCP/Plugin-Pruefungscheckliste

Vor der Installation eines MCP-Servers von Drittanbietern:

- [ ] Quellcode verfuegbar und auditierbar
- [ ] Verifizierter Autor/Organisation
- [ ] Kein unbegruendeter Netzwerkzugriff
- [ ] Kein Lesen sensibler Dateien (.env, Geheimnisse)
- [ ] Minimale Berechtigungen (Prinzip der geringsten Privilegien)
- [ ] Fixierte Version (nicht `latest`)
- [ ] Changelog und Sicherheitshistorie

### PreToolUse-Hook fuer Sicherheit

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "echo '$TOOL_INPUT' | grep -qE '(curl|wget).*\\.(sh|py|rb)' && echo 'BLOCKED: suspicious download' && exit 1 || exit 0"
      }
    ]
  }
}
```

### CLAUDE.md vs Hooks

| Mechanismus | Staerke | Verwendung |
|-------------|---------|------------|
| **CLAUDE.md** | Vorschlag | Richtlinien, Konventionen |
| **Rules** | Starker Vorschlag | Detaillierte Regeln |
| **Hooks** | Durchsetzung | Effektive Blockierung, automatische Validierung |

> **Regel:** CLAUDE.md = Vorschlaege. Hooks = Anforderungen.

---

## Checkliste

### Entwicklung

- [ ] Serverseitige Eingabevalidierung
- [ ] Parametrisierte Abfragen (keine SQL-Verkettung)
- [ ] Ausgabe-Escape (XSS-Prävention)
- [ ] Passwörter gehasht (bcrypt/Argon2)
- [ ] Sichere Sitzungen (httpOnly, secure, sameSite)
- [ ] Berechtigungsprüfung bei jeder Anfrage
- [ ] Secrets in Umgebungsvariablen
- [ ] Abhängigkeiten auditiert

### Konfiguration

- [ ] HTTPS aktiviert (TLS 1.3)
- [ ] Sicherheitsheader konfiguriert
- [ ] Generische Fehlermeldungen in der Produktion
- [ ] Debug-Modus in der Produktion deaktiviert
- [ ] Rate Limiting aktiviert
- [ ] CORS strikt konfiguriert

### Monitoring

- [ ] Protokollierung von Sicherheitsereignissen
- [ ] Alerting bei Anomalien
- [ ] Regelmäßiges Zugriffs-Audit
- [ ] Periodischer Schwachstellen-Scan

### Compliance (falls zutreffend)

- [ ] DSGVO: Einwilligung, Recht auf Vergessenwerden
- [ ] PCI-DSS: Zahlungsdaten
- [ ] HIPAA: Gesundheitsdaten
- [ ] SOC2: Sicherheitskontrollen

---

## Ressourcen

- **OWASP Top 10:** [owasp.org/Top10](https://owasp.org/Top10/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)

---

**Letzte Aktualisierung:** 2026-02
**Version:** 1.1.0
**Autor:** The Bearded CTO
