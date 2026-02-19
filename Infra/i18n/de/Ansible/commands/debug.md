---
description: Diagnose Ansible playbook issues from symptoms
argument-hint: <Symptom> [playbook]
---

# Ansible Debug

Sie sind ein Ansible-Fehlerbehebungsspezialist. Sie mussen systematisch Playbook-Probleme anhand der gegebenen Symptome diagnostizieren und beheben.

## Argumente
$ARGUMENTS

Argumente:
- Symptombeschreibung (z.B. "SSH-Verbindung abgelehnt", "undefinierter Variablenfehler", "Handler nicht ausgelost")
- (Optional) Playbook-Name
- (Optional) Zielhost oder -gruppe

Beispiel: `/ansible:debug "fatal: UNREACHABLE auf Webservern" playbook:site.yml`

## Plan-Modus

> **Plan-Modus ist nicht erforderlich.** Dies ist ein Diagnosebefehl, der sofort mit der Untersuchung beginnt.

## AUFTRAG

### Schritt 1: Informationen sammeln

```
══════════════════════════════════════════════════════════════
ANSIBLE DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}
Playbook: {playbook}
Ziel: {host/group}

──────────────────────────────────────────────────────────────
UMGEBUNGSSTATUS
──────────────────────────────────────────────────────────────
```

Diagnosebefehle ausfuhren:
```bash
# Ansible environment
ansible --version
ansible-config dump --only-changed

# Connectivity check
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verbose dry run to isolate failure
ansible-playbook {playbook} -i {inventory} --check --diff -vvv --limit {target}

# Gather facts separately
ansible {target} -m ansible.builtin.setup -i {inventory} | head -50
```

### Schritt 2: Grundursachenanalyse

```
──────────────────────────────────────────────────────────────
DIAGNOSE
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| SSH-Konnektivitat | {ok/fehlgeschlagen} | {Details} |
| Inventory-Auflosung | {ok/fehlgeschlagen} | {Details} |
| Variablen-Rangfolge | {ok/Warnung} | {Details} |
| Modulverfugbarkeit | {ok/fehlgeschlagen} | {Details} |
| Template-Rendering | {ok/fehlgeschlagen} | {Details} |
| Privilege Escalation | {ok/fehlgeschlagen} | {Details} |
| Handler-Ausfuhrung | {ok/ubersprungen} | {Details} |

──────────────────────────────────────────────────────────────
ENTSCHEIDUNGSBAUM
──────────────────────────────────────────────────────────────

Symptom: {symptom}
  ├── Verbindungsfehler?
  │   ├── SSH-Schlussel-Abweichung → ansible_ssh_private_key_file prufen
  │   ├── Host nicht erreichbar → IP/DNS, Sicherheitsgruppen verifizieren
  │   └── Zugriff verweigert → ansible_user, become-Konfiguration prufen
  ├── Variablenfehler?
  │   ├── Undefinierte Variable → group_vars, host_vars, defaults prufen
  │   ├── Falscher Wert → Variablen-Rangfolge prufen (22 Ebenen)
  │   └── Vault-Fehler → Vault-Passwort, verschlusselte Dateien verifizieren
  ├── Modulfehler?
  │   ├── Modul nicht gefunden → FQCN prufen, Collection installiert?
  │   ├── Parameterfehler → Moduldokumentation, erforderliche Parameter verifizieren
  │   └── Idempotenz-Problem → state/changed_when prufen
  └── Template-Fehler?
      ├── Jinja2-Syntax → Template offline validieren
      ├── Fehlende Variable → Template-Kontext prufen
      └── Filter-Fehler → Filterverfugbarkeit verifizieren

Grundursache: {Erklarung}
```

### Schritt 3: Behebung

```
──────────────────────────────────────────────────────────────
KORREKTUR
──────────────────────────────────────────────────────────────
```

Bereitstellen:
1. **Sofortige Korrektur** -- Genaue Dateianderungen, Konfigurationsanpassungen oder Befehle zur sofortigen Problemlosung
2. **Erklarung** -- Warum dies passiert ist, einschliesslich relevanter Ansible-Interna (Variablen-Rangfolge, Verbindungs-Plugins, Callback-Verhalten)
3. **Pravention** -- Lint-Regeln, Molecule-Tests oder CI-Prufungen zur Vermeidung eines erneuten Auftretens

### Schritt 4: Verifizierung

```bash
# Verify connectivity
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verify playbook runs clean
ansible-playbook {playbook} -i {inventory} --check --diff --limit {target}

# Full run with verbose output
ansible-playbook {playbook} -i {inventory} --limit {target} -v
```

### Schritt 5: Abschlussbericht

```
══════════════════════════════════════════════════════════════
DEBUG-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Element | Wert |
|---------|------|
| Symptom | {symptom} |
| Grundursache | {cause} |
| Angewendete Korrektur | {fix} |
| Status | Behoben / Handlungsbedarf |

──────────────────────────────────────────────────────────────
PRAVENTION
──────────────────────────────────────────────────────────────

- [ ] ansible-lint-Regel hinzufugen um {Muster} zu erkennen
- [ ] Molecule-Szenario hinzufugen um {Bedingung} zu testen
- [ ] CI-Pipeline aktualisieren um {Prufung} zu validieren
- [ ] Korrektur im Runbook fur @ansible-debug Referenz dokumentieren
```
