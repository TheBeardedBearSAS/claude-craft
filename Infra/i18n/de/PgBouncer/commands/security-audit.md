---
description: Audit PgBouncer security posture
argument-hint: [scope]
---

# PgBouncer Sicherheitsaudit

Du bist ein PgBouncer-Sicherheitsspezialist. Du musst ein umfassendes Sicherheitsaudit des PgBouncer-Deployments durchfuehren.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Scope: auth, tls, access, admin, network, full (Standard: full)

Beispiel: `/pgbouncer:security-audit scope:full`

## Plan-Modus

> **Plan-Modus ist bedingt.** Wird automatisch aktiviert, wenn der Scope "full" ist, um den Auditplan vor der Durchfuehrung zu praesentieren.

## MISSION

### Schritt 1: Scope-Definition

```
══════════════════════════════════════════════════════════════
PGBOUNCER SICHERHEITSAUDIT
══════════════════════════════════════════════════════════════

Scope: {auth, tls, access, admin, network, full}

──────────────────────────────────────────────────────────────
AUDIT-UMFANG
──────────────────────────────────────────────────────────────

| Kategorie | Enthalten | Gewichtung |
|-----------|-----------|------------|
| Authentifizierung | {ja/nein} | 25% |
| TLS-Verschluesselung | {ja/nein} | 25% |
| Zugriffskontrolle | {ja/nein} | 20% |
| Admin-Sicherheit | {ja/nein} | 15% |
| Netzwerksicherheit | {ja/nein} | 15% |
```

### Schritt 2: Authentifizierungsaudit

```
──────────────────────────────────────────────────────────────
AUTHENTIFIZIERUNG
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| auth_type | {scram/md5/trust} | {empfehlung} |
| auth_file-Berechtigungen | {0600/andere} | {eigentuemer} |
| auth_query verwendet | {ja/nein} | {funktionsname} |
| auth_hba_file | {ja/nein} | {regelanzahl} |
| Passwortstaerke | {stark/schwach} | {richtlinie} |
| Zugangsdaten-Rotation | {geplant/keine} | {haeufigkeit} |
```

### Schritt 3: TLS-Audit

```
──────────────────────────────────────────────────────────────
TLS-VERSCHLUESSELUNG
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| Client-TLS-Modus | {require/prefer/disable} | {einstellung} |
| Server-TLS-Modus | {verify-full/require/disable} | {einstellung} |
| TLS-Protokollversion | {1.3/1.2/1.1} | {empfehlung} |
| Zertifikatgueltigkeit | {gueltig/ablaufend/abgelaufen} | {verbleibende tage} |
| Schluessel-Berechtigungen | {0600/andere} | {eigentuemer} |
| Cipher-Staerke | {HIGH/MEDIUM/LOW} | {cipher-liste} |
```

### Schritt 4: Zugriffskontrollaudit

```
──────────────────────────────────────────────────────────────
ZUGRIFFSKONTROLLE
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| auth_hba_file konfiguriert | {ja/nein} | {pfad} |
| IP-basierte Einschraenkungen | {ja/nein} | {regeln} |
| Benutzerspezifische Connection-Limits | {ja/nein} | {max_user_connections} |
| Datenbankspezifische Connection-Limits | {ja/nein} | {max_db_connections} |
| Wildcard-Datenbankzugriff | {eingeschraenkt/offen} | {konfiguration} |
```

### Schritt 5: Admin-Sicherheitsaudit

```
──────────────────────────────────────────────────────────────
ADMIN-SICHERHEIT
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| admin_users eingeschraenkt | {ja/nein} | {benutzer} |
| stats_users eingeschraenkt | {ja/nein} | {benutzer} |
| Admin nur auf localhost | {ja/nein} | {listen_addr} |
| Admin-Passwortstaerke | {stark/schwach} | {bewertung} |
| Verbindungs-Logging aktiviert | {ja/nein} | {einstellung} |
```

### Schritt 6: Netzwerksicherheitsaudit

```
──────────────────────────────────────────────────────────────
NETZWERKSICHERHEIT
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| listen_addr eingeschraenkt | {ja/nein} | {interfaces} |
| Firewall auf Port 6432 | {ja/nein} | {regeln} |
| Unix-Socket verfuegbar | {ja/nein} | {berechtigungen} |
| Prozess laeuft als Nicht-Root | {ja/nein} | {benutzer} |
| Konfigurationsdatei-Berechtigungen | {0600/andere} | {eigentuemer} |
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
| Authentifizierung | {x}/100 | {bestanden/warnung/fehler} |
| TLS-Verschluesselung | {x}/100 | {bestanden/warnung/fehler} |
| Zugriffskontrolle | {x}/100 | {bestanden/warnung/fehler} |
| Admin-Sicherheit | {x}/100 | {bestanden/warnung/fehler} |
| Netzwerksicherheit | {x}/100 | {bestanden/warnung/fehler} |
| **Gesamt** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
KRITISCHE BEFUNDE
──────────────────────────────────────────────────────────────

1. [ ] {kritischer befund 1}
2. [ ] {kritischer befund 2}

──────────────────────────────────────────────────────────────
EMPFEHLUNGEN
──────────────────────────────────────────────────────────────

Prioritaet 1 (Sofort):
- [ ] {empfehlung}

Prioritaet 2 (Diesen Sprint):
- [ ] {empfehlung}

Prioritaet 3 (Naechstes Quartal):
- [ ] {empfehlung}
```
