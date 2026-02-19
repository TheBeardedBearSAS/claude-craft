---
description: Audit OpenTofu security posture
argument-hint: [Scope]
---

# OpenTofu Security Audit

Sie sind ein OpenTofu-Sicherheitsspezialist. Sie mussen ein umfassendes Sicherheitsaudit der IaC-Konfiguration durchfuhren.

## Arguments
$ARGUMENTS

Argumente:
- (Optional) Umfang: encryption, secrets, iam, policies, full (Standard: full)
- (Optional) Pfad zum Konfigurationsverzeichnis

Beispiel: `/opentofu:security-audit scope:full path:infra/`

## Plan Mode

> **Plan-Modus ist bedingt.** Wird automatisch aktiviert, wenn der Umfang "full" ist oder mehrere Umgebungen umfasst.

## MISSION

### Schritt 1: Umfangsdefinition

```
══════════════════════════════════════════════════════════════
OPENTOFU SECURITY AUDIT
══════════════════════════════════════════════════════════════

Umfang: {full / encryption / secrets / iam / policies}
Pfad: {Konfigurationspfad}

──────────────────────────────────────────────────────────────
AUDIT-UMFANG
──────────────────────────────────────────────────────────────
```

### Schritt 2: State-Verschlusselungs-Audit

```
──────────────────────────────────────────────────────────────
STATE-VERSCHLUSSELUNG
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| Native Verschlusselung (v1.7+) | {aktiviert/deaktiviert} | {Methode} |
| Backend-Verschlusselung | {aktiviert/deaktiviert} | {Typ} |
| Plan-Verschlusselung | {aktiviert/deaktiviert} | {Details} |
| Schlusselverwaltung | {KMS/PBKDF2/keine} | {Details} |
```

### Schritt 3: Secrets-Audit

```
──────────────────────────────────────────────────────────────
SECRET-VERWALTUNG
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| Hartcodierte Secrets | {Anzahl} | {Dateien} |
| Sensible Variablen | {%} | {fehlende Liste} |
| Ephemere Werte | {verwendet/nicht} | {v1.11+} |
| .tfvars im VCS | {ja/nein} | {Dateien} |
| CI/CD-Anmeldedaten | {OIDC/statisch} | {Details} |
```

### Schritt 4: IAM- & Zugriffs-Audit

```
──────────────────────────────────────────────────────────────
ZUGRIFFSSTEUERUNG
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| IAM Least Privilege | {ja/nein} | {ubermassig breite Policies} |
| State-Backend-ACL | {eingeschrankt/offen} | {Details} |
| CI/CD-Trennung | {Plan/Apply-Rollen} | {Details} |
| Manuelles Apply deaktiviert | {ja/nein} | {Details} |
```

### Schritt 5: Policy- & Compliance-Audit

```
──────────────────────────────────────────────────────────────
POLICY-DURCHSETZUNG
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| tfsec/checkov | {integriert/nein} | {Ergebnisse} |
| OPA-Policies | {ja/nein} | {Anzahl} |
| Provider-Lock-Datei | {committet/fehlt} | {Details} |
| Tag-Compliance | {erzwungen/nein} | {Details} |
```

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
SICHERHEITSAUDIT-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
BEWERTUNG
──────────────────────────────────────────────────────────────

| Kategorie | Bewertung | Status |
|-----------|-----------|--------|
| State-Verschlusselung | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| Secret-Verwaltung | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| Zugriffssteuerung | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| Policy-Durchsetzung | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| **Gesamt** | **{x}/100** | **{Status}** |

──────────────────────────────────────────────────────────────
KRITISCHE BEFUNDE
──────────────────────────────────────────────────────────────

1. [ ] {kritischer Befund 1}
2. [ ] {kritischer Befund 2}

──────────────────────────────────────────────────────────────
EMPFEHLUNGEN
──────────────────────────────────────────────────────────────

Prioritat 1 (Sofort):
- [ ] {Empfehlung}

Prioritat 2 (Diesen Sprint):
- [ ] {Empfehlung}

Prioritat 3 (Nachstes Quartal):
- [ ] {Empfehlung}
```
