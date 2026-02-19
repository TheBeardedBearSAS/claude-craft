---
description: Setup CI/CD pipeline for Ansible automation
argument-hint: <Platform> [ci-tool]
---

# Ansible Deploy Setup

Sie sind ein Ansible-Deployment-Spezialist. Sie mussen eine vollstandige CI/CD-Pipeline fur die Ansible-Playbook-Ausfuhrung konfigurieren.

## Argumente
$ARGUMENTS

Argumente:
- Plattformbeschreibung
- (Optional) CI-Tool: github-actions, gitlab-ci (Standard: github-actions)
- (Optional) Controller: awx, semaphore, none

Beispiel: `/ansible:deploy-setup "Web-Infrastruktur" ci:github-actions controller:awx`

## Plan-Modus

> **Plan-Modus ist obligatorisch.** Vor der Ausfuhrung aktiviert Claude den Plan-Modus, um das Projekt zu analysieren, eine Pipeline-Strategie vorzuschlagen und auf Validierung zu warten.

## AUFTRAG

### Schritt 1: Projekt analysieren

```
══════════════════════════════════════════════════════════════
ANSIBLE DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projekt: {name}

──────────────────────────────────────────────────────────────
STACK-ERKENNUNG
──────────────────────────────────────────────────────────────

| Komponente | Erkannt | Details |
|------------|---------|---------|
| Playbooks | {count} | {paths} |
| Rollen | {count} | {names} |
| Collections | {count} | {names} |
| Vault-Nutzung | {ja/nein} | {verschlusselte Dateien} |
| Inventories | {count} | {Umgebungen} |
| Molecule-Tests | {ja/nein} | {Szenarien} |
```

### Schritt 2: Pipeline entwerfen

```
──────────────────────────────────────────────────────────────
PIPELINE-STRATEGIE
──────────────────────────────────────────────────────────────

CI-Tool: {GitHub Actions / GitLab CI}
Controller: {AWX / Semaphore / Keiner}

Pipeline:
  Push / PR
    → Lint: ansible-lint + yamllint
    → Test: molecule converge + verify
    → Testlauf: ansible-playbook --check --diff
    → Deploy Staging: Playbook gegen Staging ausfuhren
    → Freigabe-Gate: Manuelle Freigabe fur Produktion
    → Deploy Prod: Playbook gegen Produktion ausfuhren

──────────────────────────────────────────────────────────────
STRATEGIEAUSWAHL
──────────────────────────────────────────────────────────────

| Stufe | Tool | Ausloser | Artefakte |
|-------|------|----------|-----------|
| Lint | ansible-lint | Bei Push/PR | Lint-Bericht |
| Test | Molecule | Bei Push/PR | Testergebnisse |
| Testlauf | ansible-playbook --check | Bei Merge auf main | Diff-Ausgabe |
| Deploy Staging | {Controller/direkt} | Bei Merge auf main | Lauf-Log |
| Deploy Prod | {Controller/direkt} | Manuelle Freigabe | Lauf-Log |
```

### Schritt 3: CI-Pipeline generieren

CI/CD-Konfigurationsdatei generieren:

Fur **GitHub Actions** (`.github/workflows/ansible.yml`):
- Ansible und Abhangigkeiten aus `requirements.yml` installieren
- `yamllint` und `ansible-lint` auf alle Playbooks und Rollen ausfuhren
- `molecule test` fur jede Rolle mit Testszenario ausfuhren
- `ansible-playbook --check --diff` fur Syntax- und Testlauf-Validierung ausfuhren
- Auf Staging bei Merge auf main deployen
- Auf Produktion mit manuellem Freigabe-Gate deployen
- GitHub Secrets fur Vault-Passwort und SSH-Schlussel verwenden

Fur **GitLab CI** (`.gitlab-ci.yml`):
- Stages verwenden: lint, test, deploy-staging, deploy-prod
- Ansible-Collections zwischen Laufen cachen
- Geschutzte Variablen fur Vault-Passwort und SSH-Schlussel verwenden

### Schritt 4: Controller-Konfiguration generieren

Falls Controller **AWX** ist:
- Organisations-, Projekt- und Inventory-Definitionen
- Jobvorlage fur jedes Playbook mit Survey-Variablen
- Workflow-Vorlage die Lint -> Deploy Staging -> Deploy Prod verkettet
- Credential-Typen fur Vault-Passwort, SSH-Schlussel und Cloud-Credentials

Falls Controller **Semaphore** ist:
- Projektkonfiguration mit Git-Repository
- Umgebungsdefinitionen pro Inventory
- Task-Vorlagen fur jedes Playbook
- Planungskonfiguration fur wiederkehrende Aufgaben

### Schritt 5: Execution Environment generieren

`execution-environment.yml` fur `ansible-builder` generieren:

```yaml
---
version: 3
dependencies:
  galaxy: requirements.yml
  python: requirements.txt
  system: bindep.txt
images:
  base_image:
    name: quay.io/ansible/ansible-runner:latest
additional_build_steps:
  append_final:
    - RUN pip3 install --upgrade pip
```

Dies gewahrleistet eine reproduzierbare Ausfuhrungsumgebung uber CI, AWX und Entwickler-Workstations hinweg.

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
SETUP-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|--------------|
| .github/workflows/ansible.yml | CI/CD-Pipeline |
| execution-environment.yml | Ansible Builder EE-Definition |
| .yamllint.yml | YAML-Lint-Konfiguration |
| .ansible-lint | Ansible-Lint-Konfiguration |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] AWX/Semaphore auf Controller-Host installieren (falls zutreffend)
2. [ ] Vault-Passwort in CI-Secrets speichern (ANSIBLE_VAULT_PASSWORD)
3. [ ] Privaten SSH-Schlussel in CI-Secrets speichern (ANSIBLE_SSH_KEY)
4. [ ] Pipeline End-to-End auf einem Feature-Branch testen
5. [ ] Monitoring und Benachrichtigung mit @ansible-quality einrichten
6. [ ] Sicherheitslage mit /ansible:security-audit auditieren
```
