---
description: PHP Sicherheits-Audit
argument-hint: [argumente]
---

# PHP Sicherheits-Audit

## Argumente

$ARGUMENTS (optional: Pfad zum zu auditierenden PHP-Projekt, standardmäßig aktuelles Verzeichnis)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Sicherheitsaudit eines nativen PHP-Projekts basierend auf **OWASP Top 10:2025** (inkl. Software Supply Chain Failures und Mishandling of Exceptional Conditions), CWE/SANS Top 25 und SLSA 1.0. Erstellen Sie einen Report mit einer Bewertung von 25 Punkten und einem priorisierten Sanierungsplan.

**Referenzregeln**: `.claude/rules/php-security.md`

### Schritt 1: Dependency-Scan (4 Pkt.)

```bash
docker compose exec app composer audit
docker compose exec app composer outdated --direct
```

Optional (SBOM + CVE):

```bash
docker compose exec app trivy fs --scanners vuln,secret,config .
```

Prüfen:
- [ ] `composer audit` meldet 0 kritische / hohe Schwachstellen
- [ ] Alle direkten Abhängigkeiten auf exakte oder Caret-Bereiche gepinnt (kein `*`)
- [ ] Keine aufgegebenen Pakete
- [ ] SBOM generiert (SPDX 3 oder CycloneDX) und in CI eingecheckt
- [ ] Sigstore / Cosign Signing für Release-Artefakte konfiguriert (SLSA 1.0)

### Schritt 2: Injection — SQL, Command, LDAP, Header (5 Pkt.)

Nach gefährlichen Mustern scannen:

```bash
docker compose exec app grep -rn "PDO.*->query\|mysqli_query\|->prepare.*\$_" src/
docker compose exec app grep -rn "shell_exec\|passthru\|system\|exec\|popen" src/
```

Prüfen:
- [ ] 100% parametrisierte Queries — **keine String-Konkatenation in SQL**
- [ ] Befehlsausführung vermieden; falls erforderlich, `escapeshellarg()` + Whitelist
- [ ] HTTP-Header-Injection verhindert (kein rohes CR/LF in `header()`)
- [ ] LDAP-Filter escaped via `ldap_escape()`
- [ ] XML-Parser deaktivieren externe Entities (`libxml_disable_entity_loader(true)` / `LIBXML_NONET`)

### Schritt 3: Authentifizierung & Autorisierung (4 Pkt.)

- [ ] Passwörter gehasht mit **Argon2id** (OWASP 2026: 128 MiB RAM, t=3-5, p=1)
- [ ] `password_hash($p, PASSWORD_ARGON2ID)` verwendet; **kein MD5/SHA1/bcrypt in neuem Code**
- [ ] Minimale Passwortlänge ≥ 12 Zeichen
- [ ] Session-Cookies: `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Session-Ablauf 15–30 Minuten
- [ ] JWT: **EdDSA (Ed25519)** > ES256 > RS256; kurze Gültigkeit (15 Min)
- [ ] **DPoP (RFC 9449)** für sensible Tokens
- [ ] Berechtigungen bei jeder Anfrage geprüft (Deny-by-Default, nicht nur einmal beim Login)

**Erkennungsbefehl**:

```bash
docker compose exec app grep -rn "md5\|sha1\|password_hash.*BCRYPT" src/
```

### Schritt 4: Secrets & Kryptografie (4 Pkt.)

- [ ] Keine Secrets in Git-Historie (`gitleaks detect --log-opts='--all'` / `trufflehog`)
- [ ] Secrets aus Umgebungsvariablen oder einem Vault geladen (HashiCorp Vault, AWS Secrets Manager)
- [ ] TLS 1.3 erzwungen; TLS 1.2 nur bei Rückwärtskompatibilität erforderlich
- [ ] Zufallsgenerierung via `random_bytes()` / `random_int()` — **niemals `rand()`/`mt_rand()` für Sicherheit**
- [ ] Schlüsselrotationsstrategie dokumentiert
- [ ] Verschlüsselung im Ruhezustand für sensible Felder (z. B. `paragonie/halite` für Field-Level AEAD)

### Schritt 5: Input-Validierung & Output-Encoding (3 Pkt.)

- [ ] Alle Benutzereingaben serverseitig validiert (niemals Client-Validierung vertrauen)
- [ ] Value Objects erzwingen Invarianten in Konstruktoren
- [ ] HTML-Ausgabe escaped mit `htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`
- [ ] JSON-Ausgabe via `json_encode()` mit `JSON_THROW_ON_ERROR`
- [ ] Datei-Uploads: MIME-Sniffing, Größenlimit, zufälliger Name, außerhalb Web-Root

### Schritt 6: Security-Header & Konfiguration (3 Pkt.)

- [ ] `Content-Security-Policy` (Level 3) mit Nonces, kein `unsafe-inline`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` (oder CSP `frame-ancestors 'none'`)
- [ ] `Strict-Transport-Security` (HSTS, 1 Jahr min, Preload falls anwendbar)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Cross-Origin-Opener-Policy: same-origin` (COOP)
- [ ] `Cross-Origin-Embedder-Policy: require-corp` (COEP)
- [ ] `Cross-Origin-Resource-Policy` (CORP)
- [ ] `Permissions-Policy` granular
- [ ] `display_errors=Off`, `expose_php=Off` in Produktion
- [ ] Generische Fehlerseiten — **niemals Stack-Traces in Produktion leaken**

### Schritt 7: Logging & Supply Chain (2 Pkt.)

- [ ] Logs enthalten: Logins, Berechtigungsänderungen, sensible Datenzugriffe, Autorisierungsfehler
- [ ] Logs enthalten **niemals**: Passwörter, Tokens, vollständige PII, Stack-Traces in Prod
- [ ] Strukturierte Logs (JSON) mit Correlation-IDs
- [ ] SLSA 1.0 Level 1+ Provenance auf CI-Builds
- [ ] Dependabot / Renovate mit CVE-Scanning (Trivy, Grype)
- [ ] Reproduzierbare Builds bei Releases verifiziert

## OUTPUT-FORMAT

```
PHP SICHERHEITS-AUDIT — OWASP TOP 10:2025
==========================================

SCORE: XX/25
SCHWEREGRAD: [Kritisch / Hoch / Mittel / Niedrig]

DEPENDENCY-SCAN (X/4)
  composer audit: N kritisch, N hoch
  Aufgegebene Pakete: N
  SBOM vorhanden: ja/nein

INJECTION (X/5)
  Nicht-parametrisiertes SQL: N
  Gefährliche Befehlsaufrufe: N
  XXE-Risiko: ja/nein

AUTH & AUTORISIERUNG (X/4)
  Schwache Hashes (MD5/SHA1/bcrypt): N
  Fehlende Berechtigungsprüfungen: N
  JWT-Algorithmus: [EdDSA/ES256/RS256/none]

SECRETS & KRYPTO (X/4)
  Secrets in Historie: N
  Schwache RNG-Verwendung: N

INPUT / OUTPUT (X/3)
  Fehlende Validierung: N
  Unescapte Ausgabe: N

HEADER & CONFIG (X/3)
  Fehlende CSP / HSTS / COOP: N
  display_errors leckt: ja/nein

LOGGING & SUPPLY CHAIN (X/2)
  PII in Logs: N
  SLSA-Level: [0/1/2/3]

TOP 3 KRITISCHE AKTIONEN:
1. [KRITISCH] MD5-Hashes durch Argon2id ersetzen
   Dateien: src/Infrastructure/Auth/...:zeile
   Impact: HOCH — Aufwand: MITTEL
2. [...]
3. [...]

QUICK WINS:
- `composer audit` in CI ausführen (0 Aufwand)
- `declare(strict_types=1);` überall hinzufügen (durch Rector erzwungen)
- HSTS in Produktion aktivieren (1 Zeile Konfiguration)

SANIERUNGSFAHRPLAN:
Woche 1  — Alle composer audit KRITISCHEN CVEs patchen
Woche 2  — Argon2id-Migration + JWT-Algorithmus-Rotation
Monat 2 — SBOM + Sigstore-Signing + SLSA Level 2
```

## WICHTIGE HINWEISE

- **Sicherheitsprobleme haben IMMER höchste Priorität** — sie übertrumpfen architektonische Bedenken
- Docker für alle Scans verwenden; **niemals** echte Secrets in Scan-Output leaken
- OWASP Top 10:2025 konsolidiert SSRF in Broken Access Control
- **Mishandling Exceptional Conditions** (neu 2025): ein Produktions-Stack-Trace ist eine Disclosure-Schwachstelle
- Supply Chain (neu 2025): Artefakte mit Sigstore/Cosign signieren, SBOM bei jedem Build generieren
- Dieses Audit bei jedem größeren Dependency-Bump und vierteljährlich im Steady State erneut ausführen
