# Sicherheit

## Überblick

Sicherheit hat **absolute Priorität**. Dieses Dokument stellt die allgemeinen Sicherheitsprinzipien vor, die für jedes Projekt gelten.

> **Hinweis:** Konsultieren Sie die technologiespezifischen Regeln für konkrete Implementierungen.

**Referenzen:**
- **OWASP Top 10:2025** (veröffentlicht November 2025)
- CWE/SANS Top 25
- SLSA 1.0

---

## Inhaltsverzeichnis

1. [OWASP Top 10:2025](#owasp-top-102025)
2. [Eingabevalidierung](#eingabevalidierung)
3. [Authentifizierung](#authentifizierung)
4. [Autorisierung](#autorisierung)
5. [Sensible Daten](#sensible-daten)
6. [Sicherheitsheader](#sicherheitsheader)
7. [Supply Chain](#supply-chain)
8. [Logging und Monitoring](#logging-und-monitoring)
9. [MCP- und Plugin-Sicherheit](#mcp--und-plugin-sicherheit)
10. [Checkliste](#checkliste)

---

## OWASP Top 10:2025

> **Quelle:** [OWASP Top 10:2025](https://owasp.org/Top10/2025/) — veröffentlicht November 2025.
> Wichtige Änderungen vs. 2021: SSRF in #1 konsolidiert, Supply Chain Failures neu als #6, Mishandling Exceptional Conditions neu als #7.

### 1. Broken Access Control (inkl. konsolidiertem SSRF)

```
RISIKO
- Zugriff auf Ressourcen ohne Überprüfung
- Vorhersehbare URLs (/admin, /user/123/edit)
- Manipulation von IDs in URLs
- SSRF: Vom Benutzer bereitgestellte URLs nicht validiert, Zugriff auf interne Ressourcen

SCHUTZ
- Berechtigungen bei JEDER Anfrage prüfen
- Nicht vorhersehbare Identifikatoren verwenden (UUID)
- Deny by Default
- SSRF: Whitelist erlaubter Ziele, strikte URL-Validierung
- Kein interner Netzwerkzugriff über Benutzereingaben
```

### 2. Cryptographic Failures

```
RISIKO
- Sensible Daten im Klartext
- Veraltete Algorithmen (MD5, SHA1, bcrypt in neuem Code)
- Schlüssel im Quellcode
- JWT mit schwachem Algorithmus (HS256, RS256)

SCHUTZ
- Sensible Daten im Ruhezustand verschlüsseln
- TLS 1.3 bei der Übertragung verwenden
- Passwort-Hashing: Argon2id (128 MiB RAM, t=3-5, p=1) — NIEMALS MD5/SHA1/bcrypt
- JWT: EdDSA (Ed25519) bevorzugt > ES256 > RS256
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

### 6. Software Supply Chain Failures (neu in 2025)

```
RISIKO
- Abhängigkeiten mit bekannten Schwachstellen
- Komponenten ohne verifizierbare Herkunft
- Nicht gesicherte CI/CD
- Nicht signierte Artefakte

SCHUTZ
- SLSA 1.0 Stufen 1-3 (verifizierbare Quellen, reproduzierbare Builds, Provenance)
- Automatisches SBOM (SPDX 3 oder CycloneDX) bei jedem Build
- Sigstore Keyless Signing (cosign) für Artefakte und Images
- Dependabot / Renovate mit CVE-Scanning (Trivy, Grype)
- Gepinnte Versionen für alle Abhängigkeiten (kein "latest")
```

### 7. Mishandling of Exceptional Conditions (neu in 2025)

```
RISIKO
- Stack Traces in der Produktion exponiert
- Nicht behandelte Ausnahmen leaken interne Daten
- Undefiniertes Verhalten bei fehlerhaften Eingaben

SCHUTZ
- Fehler protokollieren, niemals Stack Traces in der Produktion exponieren
- Globale Ausnahmehandler (Error Boundaries)
- Generische Fehlermeldungen auf der Client-Seite
- Fail Fast mit klaren Geschäftsfehlern
```

### 8. Authentication Failures

```
RISIKO
- Schwache Passwörter erlaubt
- Kein MFA
- Sitzungen, die nicht ablaufen
- Credential Stuffing möglich

SCHUTZ
- Richtlinie für starke Passwörter (min. 12 Zeichen)
- MFA für sensible Zugriffe
- Sitzungsablauf
- Rate Limiting beim Login
- Brute-Force-Erkennung
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

### 10. Data Integrity Failures

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

### Sanitization vs. Validierung

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
OWASP 2026 Regeln:
- Mindestens 12 Zeichen
- Großbuchstaben, Kleinbuchstaben, Ziffern, Sonderzeichen
- Nicht in Listen kompromittierter Passwörter
- Hash mit Argon2id (128 MiB RAM, t=3-5, p=1)
- NIEMALS MD5/SHA1/bcrypt in neuem Code
- Einzigartiges Salt pro Benutzer (von Argon2id verwaltet)

// GUT
hash = argon2id.hash(password, memory=131072, iterations=3, parallelism=1)

// SCHLECHT
hash = md5(password)
hash = sha1(password + "static_salt")
hash = bcrypt.hash(password, costFactor=12)  // Nicht in neuem Code verwenden
```

Quellen: [Argon2id OWASP 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)

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
OWASP 2026 Regeln:
- Algorithmus: EdDSA (Ed25519) bevorzugt > ES256 > RS256
- NIEMALS HS256 mit schwachem Secret
- Kurze Ablaufzeit (15 Min)
- Langlebiger Refresh Token (7 Tage) sicher gespeichert
- DPoP (RFC 9449) für sensible Tokens
- Signatur und Claims prüfen
- Keine sensiblen Daten im Payload speichern

// SCHLECHT
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// GUT
jwt.sign(payload, ed25519PrivateKey, {
  algorithm: "EdDSA",
  expiresIn: "15m"
})
```

Quellen: [JWT Best Practices 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449)

### Multi-Faktor-Authentifizierung (MFA)

```
Wann MFA aktivieren:
- Admin-Zugriff
- Sensible Operationen (Zahlung, Löschung)
- Passwortänderung
- Anmeldung von neuem Gerät

Methoden (nach Sicherheitsstufe):
- Hardware-Schlüssel (FIDO2/WebAuthn) — am sichersten
- TOTP (Google Authenticator, Authy)
- SMS (weniger sicher — wenn möglich vermeiden)
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
| **Geheim** | Passwörter, Schlüssel | Vault, Argon2id Hash |

### Speicherung

```
Passwörter:
  → Hash mit Argon2id (128 MiB RAM, t=3-5, p=1)
  → NIEMALS im Klartext
  → NIEMALS bcrypt/MD5/SHA1 in neuem Code

Personenbezogene Daten (DSGVO):
  → Verschlüsselung im Ruhezustand (AES-256-GCM)
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

### Obligatorische Header 2026

```http
# XSS-Schutz + CSP Level 3
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
X-Content-Type-Options: nosniff

# Clickjacking-Schutz
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Granulare Berechtigungen
Permissions-Policy: geolocation=(), camera=(), microphone=()

# Cross-Origin Isolation (2026 — obligatorisch)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

Quelle: [HTTP Security Headers 2026](https://thibautprobst.fr/en/posts/http-security-headers/)

### Content-Security-Policy (CSP) Level 3

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
  upgrade-insecure-requests;
```

### Cross-Origin-Header (neu in 2026)

| Header | Empfohlener Wert | Schutz |
|--------|-----------------|--------|
| **COOP** | `same-origin` | Isoliert den Browser-Kontext (Spectre) |
| **COEP** | `require-corp` | Aktiviert Cross-Origin Isolation |
| **CORP** | `same-origin` | Schützt Ressourcen vor Cross-Origin-Einbindung |
| **Permissions-Policy** | Granular pro Feature | Kontrolliert den Zugriff auf Browser-APIs |

---

## Supply Chain

> **Referenz:** [Supply Chain Security 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

### SLSA 1.0 (Supply-chain Levels for Software Artifacts)

| Stufe | Anforderungen | Auswirkung |
|-------|--------------|-----------|
| **Stufe 1** | Dokumentierte Build-Provenance | Grundlegende Rückverfolgbarkeit |
| **Stufe 2** | Build auf verifizierbarer Plattform, signiert | Resistenz gegen interne Kompromittierungen |
| **Stufe 3** | Reproduzierbarer Build, gehärtete Infrastruktur | Resistenz gegen Plattform-Kompromittierungen |

### SBOM (Software Bill of Materials)

```
Automatisch bei jedem Build generieren:
- Format SPDX 3 oder CycloneDX
- Alle direkten und transitiven Abhängigkeiten auflisten
- Versionen, Lizenzen, bekannte CVEs einbeziehen
- Im Artefakt-Registry veröffentlichen

Werkzeuge: syft, cdxgen, trivy --format cyclonedx
```

### Sigstore / cosign

```
Artefakte und Docker-Images signieren:
cosign sign --key cosign.key ghcr.io/org/image:tag
cosign verify --key cosign.pub ghcr.io/org/image:tag

Keyless Signing (empfohlen in CI/CD):
cosign sign --identity-token=$(cat $ACTIONS_ID_TOKEN_REQUEST_TOKEN) \
  ghcr.io/org/image:tag
```

### Supply Chain Checkliste

- [ ] SBOM automatisch generiert (SPDX 3 oder CycloneDX)
- [ ] Artefakte mit Sigstore/cosign signiert
- [ ] SLSA 1+ Provenance dokumentiert
- [ ] Abhängigkeiten mit gepinnten Versionen (Hash oder exakte Version)
- [ ] Automatisiertes CVE-Scanning (Trivy, Grype) bei jedem Build
- [ ] Dependabot / Renovate konfiguriert
- [ ] Abhängigkeitsprüfung vor dem Merge

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
- Vollständige Stack Traces in der Produktion
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

## MCP- und Plugin-Sicherheit

### Risiken von Drittanbieter-MCP-Servern

> **Warnung:** Sicherheitsforschung (Snyk, 2026) hat 76 bösartige Payloads in öffentlichen MCP-Server-Registern identifiziert. Unüberprüfte MCP-Server von Drittanbietern stellen ein erhebliches Risiko dar.

```
RISIKEN:
- Befehlsinjektion über MCP-Parameter
- Datenexfiltration (Dateien, Geheimnisse, Kontext)
- Ausführung beliebigen Codes auf dem Host-Rechner
- Privilegieneskalation über freigegebene Tools

SCHUTZ:
- Eigene MCP-Server bevorzugen
- Quellcode vor der Installation von Drittanbieter-Servern auditieren
- Berechtigungen einschränken (Tools-Allowlist)
- PreToolUse-Hook verwenden, um gefährliche Muster zu blockieren
```

### MCP/Plugin-Prüfungscheckliste

Vor der Installation eines MCP-Servers von Drittanbietern:

- [ ] Quellcode verfügbar und auditierbar
- [ ] Verifizierter Autor/Organisation
- [ ] Kein unbegründeter Netzwerkzugriff
- [ ] Kein Lesen sensibler Dateien (.env, Geheimnisse)
- [ ] Minimale Berechtigungen (Prinzip der geringsten Privilegien)
- [ ] Fixierte Version (nicht `latest`)
- [ ] Changelog und Sicherheitshistorie

### PreToolUse-Hook für Sicherheit

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

### CLAUDE.md vs. Hooks

| Mechanismus | Stärke | Verwendung |
|-------------|--------|------------|
| **CLAUDE.md** | Vorschlag | Richtlinien, Konventionen |
| **Rules** | Starker Vorschlag | Detaillierte Regeln |
| **Hooks** | Durchsetzung | Effektive Blockierung, automatische Validierung |

> **Regel:** CLAUDE.md = Vorschläge. Hooks = Anforderungen.
> Für kritische Sicherheitseinschränkungen Hooks verwenden, keine Textanweisungen.

---

## Checkliste

### Entwicklung

- [ ] Serverseitige Eingabevalidierung
- [ ] Parametrisierte Abfragen (keine SQL-Verkettung)
- [ ] Ausgabe-Escape (XSS-Prävention)
- [ ] Passwörter gehasht mit **Argon2id** (128 MiB, t=3-5, p=1)
- [ ] Sichere Sitzungen (httpOnly, secure, sameSite)
- [ ] Berechtigungsprüfung bei jeder Anfrage
- [ ] Secrets in Umgebungsvariablen oder Vault
- [ ] Abhängigkeiten auditiert (CVE-Scan)
- [ ] JWT mit EdDSA oder ES256 (niemals HS256)
- [ ] DPoP (RFC 9449) für sensible Tokens

### Konfiguration

- [ ] HTTPS aktiviert (TLS 1.3)
- [ ] Sicherheitsheader 2026 (CSP L3, HSTS, COOP, COEP, CORP, Permissions-Policy)
- [ ] Generische Fehlermeldungen in der Produktion
- [ ] Debug-Modus in der Produktion deaktiviert
- [ ] Rate Limiting aktiviert
- [ ] CORS strikt konfiguriert

### Supply Chain

- [ ] SBOM generiert (SPDX 3 oder CycloneDX)
- [ ] Artefakte signiert (Sigstore/cosign)
- [ ] SLSA 1+ Provenance dokumentiert
- [ ] Abhängigkeiten auf exakte Version gepinnt

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

- **OWASP Top 10:2025:** [owasp.org/Top10/2025/](https://owasp.org/Top10/2025/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)
- **Argon2id 2026:** [Vollständiger Leitfaden](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)
- **RFC 9449 DPoP:** [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc9449)
- **JWT Best Practices 2026:** [duendesoftware.com](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps)
- **HTTP Security Headers 2026:** [thibautprobst.fr](https://thibautprobst.fr/en/posts/http-security-headers/)
- **Supply Chain 2026:** [kawaldeepsingh.medium.com](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

---

**Letzte Aktualisierung:** 2026-06
**Version:** 1.2.0
**Autor:** The Bearded CTO
