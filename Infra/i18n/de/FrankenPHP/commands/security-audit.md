---
description: Audit FrankenPHP security posture
argument-hint: [scope]
---

# FrankenPHP Sicherheitsaudit

Du bist ein FrankenPHP-Sicherheitsspezialist. Du musst ein umfassendes Sicherheitsaudit des FrankenPHP-Deployments durchfuehren.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Umfang: tls, headers, caddyfile, container, php, admin, full (Standard: full)

Beispiel: `/frankenphp:security-audit scope:full`

## Plan-Modus

> **Plan-Modus ist bedingt.** Wird automatisch aktiviert, wenn der Umfang "full" ist, um den Auditplan vor der Ausfuehrung zu praesentieren.

## MISSION

### Schritt 1: Umfangsdefinition

```
══════════════════════════════════════════════════════════════
FRANKENPHP SICHERHEITSAUDIT
══════════════════════════════════════════════════════════════

Umfang: {tls, headers, caddyfile, container, php, admin, full}

──────────────────────────────────────────────────────────────
AUDIT-UMFANG
──────────────────────────────────────────────────────────────

| Kategorie | Enthalten | Gewichtung |
|-----------|-----------|------------|
| TLS-Konfiguration | {ja/nein} | 25% |
| Sicherheitsheader | {ja/nein} | 20% |
| Caddyfile-Haertung | {ja/nein} | 20% |
| Container-Sicherheit | {ja/nein} | 15% |
| PHP-Haertung | {ja/nein} | 10% |
| Admin API | {ja/nein} | 10% |
```

### Schritt 2: TLS-Audit

```
──────────────────────────────────────────────────────────────
TLS-KONFIGURATION
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| Auto-HTTPS aktiviert | {ja/nein/Proxy} | {Konfiguration} |
| TLS-Protokollversion | {1.3/1.2} | {Empfehlung} |
| HSTS-Header | {gesetzt/fehlt} | {max-age, Preload} |
| Zertifikatgueltigkeit | {gueltig/laeuft ab/abgelaufen} | {verbleibende Tage} |
| HTTP/3 aktiviert | {ja/nein} | {UDP 443-Status} |
| ECH-Unterstuetzung | {ja/nein} | {v1.6+-Feature} |
| PQC-Unterstuetzung | {ja/nein} | {v1.6+-Feature} |
```

### Schritt 3: Sicherheitsheader-Audit

```
──────────────────────────────────────────────────────────────
SICHERHEITSHEADER
──────────────────────────────────────────────────────────────

| Header | Status | Wert |
|--------|--------|------|
| Strict-Transport-Security | {gesetzt/fehlt} | {Wert} |
| X-Content-Type-Options | {gesetzt/fehlt} | {Wert} |
| X-Frame-Options | {gesetzt/fehlt} | {Wert} |
| Content-Security-Policy | {gesetzt/fehlt} | {Wert} |
| Referrer-Policy | {gesetzt/fehlt} | {Wert} |
| Permissions-Policy | {gesetzt/fehlt} | {Wert} |
| Server-Header entfernt | {ja/nein} | {Wert} |
```

### Schritt 4: Caddyfile-Audit

```
──────────────────────────────────────────────────────────────
CADDYFILE-HAERTUNG
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| Rate Limiting konfiguriert | {ja/nein} | {Limits} |
| IP-Filterung (falls noetig) | {ja/nein} | {Regeln} |
| Debug-Endpunkte deaktiviert | {ja/nein} | {Pfade} |
| Fehlerseiten angepasst | {ja/nein} | {kein Info-Leak} |
| Secrets via Env-Vars | {ja/nein} | {nicht hartcodiert} |
```

### Schritt 5: Container-Audit

```
──────────────────────────────────────────────────────────────
CONTAINER-SICHERHEIT
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| Non-Root-Benutzer | {ja/nein} | {Benutzer} |
| Minimale Capabilities | {ja/nein} | {Capabilities} |
| Read-Only-Dateisystem | {ja/nein} | {beschreibbare Pfade} |
| Keine Secrets in Layern | {ja/nein} | {Bewertung} |
| Image-Schwachstellenscan | {bestanden/fehlgeschlagen} | {CVE-Anzahl} |
```

### Schritt 6: PHP-Audit

```
──────────────────────────────────────────────────────────────
PHP-SICHERHEIT
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| disable_functions | {gesetzt/leer} | {Funktionen} |
| open_basedir | {gesetzt/leer} | {Pfade} |
| expose_php | {off/on} | {Empfehlung} |
| Session-Cookies sicher | {ja/nein} | {httpOnly, secure, sameSite} |
| allow_url_include | {off/on} | {Empfehlung} |
```

### Schritt 7: Abschlussbericht

```
══════════════════════════════════════════════════════════════
SICHERHEITSAUDIT-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
BEWERTUNG
──────────────────────────────────────────────────────────────

| Kategorie | Punktzahl | Status |
|-----------|-----------|--------|
| TLS-Konfiguration | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| Sicherheitsheader | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| Caddyfile-Haertung | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| Container-Sicherheit | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| PHP-Haertung | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| Admin API | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| **Gesamt** | **{x}/100** | **{Status}** |

──────────────────────────────────────────────────────────────
KRITISCHE BEFUNDE
──────────────────────────────────────────────────────────────

1. [ ] {Kritischer Befund 1}
2. [ ] {Kritischer Befund 2}

──────────────────────────────────────────────────────────────
EMPFEHLUNGEN
──────────────────────────────────────────────────────────────

Prioritaet 1 (Sofort):
- [ ] {Empfehlung}

Prioritaet 2 (Dieser Sprint):
- [ ] {Empfehlung}

Prioritaet 3 (Naechstes Quartal):
- [ ] {Empfehlung}
```
