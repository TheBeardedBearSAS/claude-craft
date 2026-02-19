---
description: Setup CI/CD pipeline for Hetzner Cloud deployments
argument-hint: <Platform> [ci-tool]
---

# Hcloud Deploy Setup

Du bist ein Hetzner Cloud Deployment-Spezialist. Du musst eine vollständige CI/CD-Pipeline für hcloud-basierte Infrastruktur-Deployments konfigurieren.

## Argumente
$ARGUMENTS

Argumente:
- Plattformbeschreibung
- (Optional) CI-Tool: github-actions, gitlab-ci (Standard: github-actions)
- (Optional) Strategie: blue-green, snapshot, rebuild (Standard: blue-green)

Beispiel: `/hcloud:deploy-setup "Web-Plattform" ci:github-actions strategy:blue-green`

## Plan-Modus

> **Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um das Projekt zu analysieren, eine Pipeline-Strategie vorzuschlagen und auf Validierung zu warten.

## MISSION

### Schritt 1: Projekt analysieren

```
══════════════════════════════════════════════════════════════
HCLOUD DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projekt: {name}

──────────────────────────────────────────────────────────────
INFRASTRUKTURERKENNUNG
──────────────────────────────────────────────────────────────

| Komponente | Erkannt | Details |
|------------|---------|---------|
| Server | {Anzahl} | {Typen, Standorte} |
| Netzwerke | {Anzahl} | {Namen, Subnetze} |
| Load Balancer | {Anzahl} | {Namen} |
| Firewalls | {Anzahl} | {Namen} |
| Volumes | {Anzahl} | {Größen} |
| Floating IPs | {Anzahl} | {zugewiesen/nicht zugewiesen} |
| Snapshots | {Anzahl} | {letztes Datum} |
```

### Schritt 2: Pipeline entwerfen

```
──────────────────────────────────────────────────────────────
PIPELINE-STRATEGIE
──────────────────────────────────────────────────────────────

CI-Tool: {GitHub Actions / GitLab CI}
Strategie: {Blue-Green / Snapshot / Rebuild}

Pipeline:
  Push / PR
    → Lint & Test (Anwendungscode)
    → Image bauen (Packer, optional)
    → Staging deployen (automatisch)
    → Smoke-Tests
    → Freigabe-Gate
    → Produktion deployen

──────────────────────────────────────────────────────────────
STRATEGIE-AUSWAHL
──────────────────────────────────────────────────────────────

| Stufe | Tool | Auslöser | Artefakte |
|-------|------|----------|-----------|
| Build | Packer / cloud-init | Bei Push | Snapshot-ID |
| Staging deployen | hcloud CLI | Bei Merge in main | Serverstatus |
| Smoke-Test | curl / Health Check | Nach Staging | Testbericht |
| Prod deployen | hcloud CLI | Manuelle Freigabe | Serverstatus |
```

### Schritt 3: CI-Pipeline generieren

CI/CD-Konfigurationsdatei generieren:

Für **GitHub Actions** (`.github/workflows/hcloud-deploy.yml`):
- hcloud CLI via `hetznercloud/setup-hcloud@v1` installieren
- Packer-Image bauen (optional) oder cloud-init verwenden
- Bei Merge in main auf Staging deployen
- Health Checks gegen Staging ausführen
- Mit manuellem Freigabe-Gate auf Produktion deployen
- Blue-Green: neuen Server erstellen, Floating IP wechseln, alten löschen
- GitHub Secrets für `HCLOUD_TOKEN` pro Umgebung verwenden

Für **GitLab CI** (`.gitlab-ci.yml`):
- Stages verwenden: build, deploy-staging, test, deploy-prod
- hcloud CLI via curl/pip installieren
- Protected Variables für HCLOUD_TOKEN verwenden

### Schritt 4: Deployment-Skripte generieren

Deployment-Hilfsskripte generieren:
- `scripts/deploy.sh` -- Haupt-Deployment-Skript mit hcloud CLI
- `scripts/rollback.sh` -- Rollback zum vorherigen Snapshot
- `scripts/health-check.sh` -- Deployment-Health verifizieren

### Schritt 5: Packer-Vorlage generieren (bei Image-basiertem Ansatz)

`hcloud.pkr.hcl` Packer-Vorlage zum Erstellen von Golden Images mit dem hcloud-Builder-Plugin generieren.

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
SETUP-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|-------------|
| .github/workflows/hcloud-deploy.yml | CI/CD-Pipeline |
| scripts/deploy.sh | Deployment-Skript |
| scripts/rollback.sh | Rollback-Skript |
| scripts/health-check.sh | Health-Check-Skript |
| hcloud.pkr.hcl | Packer-Vorlage (falls zutreffend) |
| cloud-init.yml | Server-Provisionierungsvorlage |

──────────────────────────────────────────────────────────────
NÄCHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] HCLOUD_TOKEN in CI-Secrets speichern (pro Umgebung)
2. [ ] Privaten SSH-Schlüssel in CI-Secrets speichern
3. [ ] Pipeline End-to-End auf einem Feature-Branch testen
4. [ ] Sicherheitslage mit /hcloud:security-audit auditieren
5. [ ] Kosten mit /hcloud:optimize optimieren
```
