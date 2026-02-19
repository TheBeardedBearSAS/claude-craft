---
description: Setup CI/CD pipeline for OpenTofu
argument-hint: <Platform> [environments]
---

# OpenTofu Deploy Setup

Sie sind ein OpenTofu-Deployment-Spezialist. Sie mussen eine vollstandige CI/CD-Pipeline fur sicheres Infrastruktur-Deployment konfigurieren.

## Arguments
$ARGUMENTS

Argumente:
- CI/CD-Plattform (github-actions, gitlab-ci)
- (Optional) Umgebungen: dev,staging,prod
- (Optional) Genehmigungsstrategie: manual, auto-dev-manual-prod

Beispiel: `/opentofu:deploy-setup "github-actions" envs:dev,staging,prod approval:manual-prod`

## Plan Mode

> **Plan-Modus ist obligatorisch.** Vor der Ausfuhrung aktiviert Claude den Plan-Modus, um das Projekt zu analysieren, eine Deployment-Strategie vorzuschlagen und auf Validierung zu warten.

## MISSION

### Schritt 1: Projekt analysieren

```
══════════════════════════════════════════════════════════════
OPENTOFU DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projekt: {name}

──────────────────────────────────────────────────────────────
PROJEKTERKENNUNG
──────────────────────────────────────────────────────────────

| Komponente | Erkannt | Details |
|------------|---------|---------|
| OpenTofu-Version | {version} | versions.tf |
| Backend | {type} | {S3/GCS/Azure} |
| Umgebungen | {count} | {list} |
| State-Verschlusselung | {ja/nein} | {Methode} |
| Module | {count} | {list} |
```

### Schritt 2: Pipeline-Strategie entwerfen

```
──────────────────────────────────────────────────────────────
PIPELINE-STRATEGIE
──────────────────────────────────────────────────────────────

Plattform: {GitHub Actions / GitLab CI}
Genehmigung: {auto-dev / manual-staging / manual-prod}

Pipeline:
  PR geoeffnet
    -> Validieren (fmt, validate)
    -> Plan (pro Umgebung)
    -> PR mit Plan-Ausgabe kommentieren

  PR in main gemergt
    -> Plan (gespeichertes Artefakt)
    -> Apply dev (automatisch)
    -> Apply staging (automatisch/manuell)
    -> Apply prod (manuelle Genehmigung)
```

### Schritt 3: CI/CD-Pipeline generieren

Vollstandige Pipeline-Konfiguration generieren mit:
- OpenTofu-Setup-Schritt (`opentofu/setup-opentofu@v1`)
- Init-, Plan-, Apply-Stages
- Plan-Artefakt fur sicheres Apply
- PR-Kommentar mit Plan-Ausgabe
- Umgebungs-Genehmigungsgates
- OIDC-Authentifizierung (keine langlebigen Secrets)

### Schritt 4: Drift-Erkennung generieren

Geplanten Drift-Erkennungs-Workflow generieren:
- Cron-basierte Ausfuhrung (z.B. werktags morgens)
- Plan mit `-detailed-exitcode`
- Benachrichtigung bei erkanntem Drift

### Schritt 5: Rollback-Verfahren generieren

Rollback-Strategie dokumentieren:
- State-Versionierung und -Wiederherstellung
- Gezieltes Destroy fur neue Ressourcen
- Manuelle Interventionsverfahren

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
| .github/workflows/tofu-plan.yml | PR-Plan-Workflow |
| .github/workflows/tofu-apply.yml | Apply-Workflow |
| .github/workflows/tofu-drift.yml | Drift-Erkennung |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] OIDC-Provider im Cloud-Konto konfigurieren
2. [ ] IAM-Rollen fur Plan und Apply erstellen
3. [ ] GitHub-Umgebungsschutzregeln festlegen
4. [ ] Pipeline mit einer No-Op-Anderung testen
5. [ ] Monitoring mit Drift-Erkennung konfigurieren
```
