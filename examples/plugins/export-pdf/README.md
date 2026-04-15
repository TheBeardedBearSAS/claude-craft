# Plugin example — `export-pdf`

> **Status** : DRAFT scaffold P3-29.

Export audit reports to branded PDF.

## Exceptions permissions

Ce plugin déclare `exec: true` (requiert subprocess pour appeler `weasyprint` ou `pandoc`). **À installer uniquement en confiance** (warning CLI affiché).

## Configuration

```json
{
  "engine": "weasyprint | pandoc",
  "template": "./branding/audit-report.html",
  "output": "./reports/pdf/",
  "logo": "./branding/logo.png"
}
```

## Prérequis système

- `weasyprint` installé (Python) OU
- `pandoc` + LaTeX

Le plugin échoue explicitement si aucun des deux n'est trouvé (pas de fallback silencieux).

## Hooks

- `onReport` : capture le Markdown
- `afterAudit` : déclenche la conversion PDF

## Usage

```bash
claude-craft plugin install export-pdf
/team:audit --scope=phase-2
# → reports/pdf/audit-phase-2-2026-04-15.pdf généré automatiquement
```
