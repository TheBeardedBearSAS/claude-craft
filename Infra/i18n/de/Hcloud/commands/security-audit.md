---
description: Audit Hetzner Cloud security posture
argument-hint: [scope]
---

# Hcloud Security Audit

Du bist ein Hetzner Cloud Sicherheitsspezialist. Du musst ein umfassendes Sicherheitsaudit der Hetzner Cloud Infrastruktur durchführen.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Umfang: firewall, ssh, network, tokens, certificates, full (Standard: full)

Beispiel: `/hcloud:security-audit scope:full`

## Plan-Modus

> **Plan-Modus ist bedingt.** Aktiviert sich automatisch, wenn der Umfang "full" ist, um den Audit-Plan vor der Durchführung zu präsentieren.

## MISSION

### Schritt 1: Umfangsdefinition

```
══════════════════════════════════════════════════════════════
HCLOUD SECURITY AUDIT
══════════════════════════════════════════════════════════════

Umfang: {firewall, ssh, network, tokens, certificates, full}

──────────────────────────────────────────────────────────────
AUDIT-UMFANG
──────────────────────────────────────────────────────────────

| Kategorie | Einbezogen | Gewichtung |
|-----------|-----------|------------|
| Firewalls | {ja/nein} | 25% |
| SSH & Zugriff | {ja/nein} | 20% |
| Netzwerkisolation | {ja/nein} | 20% |
| API-Tokens | {ja/nein} | 20% |
| TLS & Zertifikate | {ja/nein} | 15% |
```

### Schritt 2: Firewall-Audit

```
──────────────────────────────────────────────────────────────
FIREWALL-ANALYSE
──────────────────────────────────────────────────────────────

| Prüfung | Status | Details |
|---------|--------|---------|
| Alle Server haben Firewalls | {ja/nein} | {ungeschützte Server} |
| SSH auf bekannte IPs beschränkt | {ja/nein} | {offen für 0.0.0.0/0?} |
| DB-Ports nur privat | {ja/nein} | {exponierte Ports} |
| Label-Selektoren verwendet | {ja/nein} | {statisch vs dynamisch} |
| Deny-by-Default | {ja/nein} | {übermäßig permissive Regeln} |
| IPv6-Regeln stimmen mit IPv4 überein | {ja/nein} | {fehlende Regeln} |
```

Alle Firewalls scannen, Server ohne Firewall-Schutz finden und übermäßig permissive Regeln identifizieren.

### Schritt 3: SSH- & Zugriffs-Audit

```
──────────────────────────────────────────────────────────────
SSH- & ZUGRIFFSICHERHEIT
──────────────────────────────────────────────────────────────

| Prüfung | Status | Details |
|---------|--------|---------|
| SSH-Schlüssel-Algorithmus | {ed25519/rsa} | {Empfehlung} |
| Passwort-Auth deaktiviert | {ja/nein} | {cloud-init-Check} |
| fail2ban konfiguriert | {ja/nein} | {auf welchen Servern} |
| Root-Login-Richtlinie | {prohibit-password/yes/no} | {Einstellung} |
| SSH-Port | {22/benutzerdefiniert} | {Firewall-Schutz} |
| Schlüsselrotation | {geplant/keine} | {letzte Rotation} |
```

### Schritt 4: Netzwerkisolations-Audit

```
──────────────────────────────────────────────────────────────
NETZWERKISOLATION
──────────────────────────────────────────────────────────────

| Prüfung | Status | Details |
|---------|--------|---------|
| Privates Netzwerk verwendet | {ja/nein} | {Netzwerkname} |
| Subnetz-Segmentierung | {ja/nein} | {Web/App/Daten-Tiers} |
| DB hat keine öffentliche IP | {ja/nein} | {exponierte Datenbanken} |
| Bastion-Host-Pattern | {ja/nein} | {Zugriffsmethode} |
| Inter-Service via privates Netz | {ja/nein} | {öffentliche IP-Nutzung} |
```

### Schritt 5: API-Token-Audit

```
──────────────────────────────────────────────────────────────
API-TOKEN-SICHERHEIT
──────────────────────────────────────────────────────────────

| Prüfung | Status | Details |
|---------|--------|---------|
| Tokens pro Umgebung | {ja/nein} | {geteilte Tokens?} |
| Read-Only-Tokens für CI | {ja/nein} | {Umfang} |
| Token in CI-Secrets | {ja/nein} | {Speichermethode} |
| Token-Rotationszeitplan | {ja/nein} | {Häufigkeit} |
| Keine Tokens im Code | {ja/nein} | {geleakte Tokens} |
```

### Schritt 6: TLS- & Zertifikats-Audit

```
──────────────────────────────────────────────────────────────
TLS & ZERTIFIKATE
──────────────────────────────────────────────────────────────

| Prüfung | Status | Details |
|---------|--------|---------|
| TLS auf Load Balancer | {ja/nein} | {Protokoll} |
| Verwaltete Zertifikate | {ja/nein} | {automatische Verlängerung} |
| HTTP-Weiterleitung zu HTTPS | {ja/nein} | {konfiguriert} |
| Zertifikatsablauf | {ok/Warnung} | {verbleibende Tage} |
| Interner Traffic verschlüsselt | {ja/nein/privates-Netz} | {Methode} |
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
| Firewalls | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| SSH & Zugriff | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| Netzwerkisolation | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| API-Tokens | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| TLS & Zertifikate | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| **Gesamt** | **{x}/100** | **{Status}** |

──────────────────────────────────────────────────────────────
KRITISCHE BEFUNDE
──────────────────────────────────────────────────────────────

1. [ ] {kritischer Befund 1}
2. [ ] {kritischer Befund 2}

──────────────────────────────────────────────────────────────
EMPFEHLUNGEN
──────────────────────────────────────────────────────────────

Priorität 1 (Sofort):
- [ ] {Empfehlung}

Priorität 2 (Diesen Sprint):
- [ ] {Empfehlung}

Priorität 3 (Nächstes Quartal):
- [ ] {Empfehlung}
```
