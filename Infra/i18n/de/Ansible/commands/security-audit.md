---
description: Audit Ansible security posture
argument-hint: [scope]
---

# Ansible Security Audit

Sie sind ein Ansible-Sicherheitsspezialist. Sie mussen ein umfassendes Sicherheitsaudit des Ansible-Projekts durchfuhren.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Umfang: vault, ssh, become, secrets, lint, full (Standard: full)

Beispiel: `/ansible:security-audit scope:full`

## Plan-Modus

> **Plan-Modus ist bedingt.** Wird automatisch aktiviert, wenn der Umfang "full" ist, um den Auditplan vor der Durchfuhrung vorzustellen.

## AUFTRAG

### Schritt 1: Umfangsdefinition

```
══════════════════════════════════════════════════════════════
ANSIBLE SICHERHEITSAUDIT
══════════════════════════════════════════════════════════════

Umfang: {vault, ssh, become, secrets, lint, full}

──────────────────────────────────────────────────────────────
AUDIT-UMFANG
──────────────────────────────────────────────────────────────

| Kategorie | Einbezogen | Gewichtung |
|-----------|------------|------------|
| Vault | {ja/nein} | 25% |
| SSH | {ja/nein} | 20% |
| Privilege Escalation | {ja/nein} | 20% |
| Secrets-Verwaltung | {ja/nein} | 20% |
| Lint-Sicherheit | {ja/nein} | 15% |
```

### Schritt 2: Vault-Audit

```
──────────────────────────────────────────────────────────────
VAULT-ANALYSE
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| Vault-Dateien verschlusselt | {ja/nein/teilweise} | {gefundene Dateien} |
| Vault-ID-Strategie | {einzeln/mehrfach/keine} | {Vault-IDs} |
| Passwortverwaltung | {Datei/Umgebung/Eingabe} | {Methode} |
| Passwortdatei in .gitignore | {ja/nein} | {Pfad} |
| Klartext-Secrets in Variablen | {Anzahl} | {Dateien} |
| ansible-vault-Rekey-Plan | {ja/nein} | {Haufigkeit} |
```

Nach unverschlusselten Secrets scannen, Vault-Verschlusselung bei erwarteten Dateien verifizieren und ansible.cfg-Vault-Einstellungen prufen.

### Schritt 3: SSH-Audit

```
──────────────────────────────────────────────────────────────
SSH-SICHERHEIT
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| SSH-Schlusseltyp | {ed25519/rsa/dsa} | {Empfehlung} |
| Host-Key-Prufung | {aktiviert/deaktiviert} | {ansible.cfg-Einstellung} |
| ControlMaster | {aktiviert/deaktiviert} | {Multiplexing-Konfiguration} |
| Pipelining | {aktiviert/deaktiviert} | {ansible.cfg-Einstellung} |
| SSH-Agent-Forwarding | {aktiviert/deaktiviert} | {Risikobewertung} |
| ansible_ssh_common_args | {gesetzt/nicht gesetzt} | {Wert} |
```

### Schritt 4: Privilege-Escalation-Audit

```
──────────────────────────────────────────────────────────────
PRIVILEGE ESCALATION
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| become-Nutzungsmuster | {Play/Task/beides} | {Umfang} |
| become_method | {sudo/su/andere} | {Methode} |
| become_user-Umfang | {root/spezifisch} | {Benutzer} |
| NOPASSWD-sudoers | {ja/nein} | {Risikoniveau} |
| Task-Level-become | {Anzahl} | {Tasks mit become: true} |
| Minimale Berechtigungen | {ja/nein} | {uberprivilegierte Tasks} |
```

Nach Play-Level-become (breiter Umfang) scannen und Tasks identifizieren, die ohne Root laufen konnten.

### Schritt 5: Secrets-Management-Audit

```
──────────────────────────────────────────────────────────────
SECRETS-VERWALTUNG
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| Externe Secrets-Integration | {ja/nein} | {Tool: HashiCorp Vault, AWS SM} |
| no_log-Nutzung | {angemessen/fehlend} | {Tasks die Secrets offenlegen} |
| Sensible Variablenbenennung | {konsistent/inkonsistent} | {Konvention} |
| .gitignore-Abdeckung | {vollstandig/teilweise} | {fehlende Muster} |
| CI-Secrets-Speicherung | {sicher/offengelegt} | {Methode} |
| Secret-Rotation | {automatisiert/manuell/keine} | {Richtlinie} |
```

Tasks finden, die Secrets ohne `no_log` offenlegen konnten, und nach hartcodierten Secrets ausserhalb von Vault-Dateien suchen.

### Schritt 6: Lint-Sicherheitsaudit

```
──────────────────────────────────────────────────────────────
LINT-SICHERHEIT
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| ansible-lint Safety-Profil | {aktiviert/deaktiviert} | {Profilstufe} |
| FQCN-Nutzung | {vollstandig/teilweise} | {% Compliance} |
| Shell/Command-Ubermassnutzung | {Anzahl} | {Tasks die Shell verwenden} |
| Command changed_when | {gesetzt/fehlend} | {Tasks ohne changed_when} |
| Paket-Pinning | {ja/nein} | {ungepinnte Pakete} |
| Dateiberechtigungen | {explizit/Standard} | {Tasks ohne mode} |
```

`ansible-lint -p safety` ausfuhren und nach Shell/Command-Tasks ohne `changed_when` prufen.

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
| Vault | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| SSH | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| Privilege Escalation | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| Secrets-Verwaltung | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
| Lint-Sicherheit | {x}/100 | {bestanden/Warnung/fehlgeschlagen} |
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
