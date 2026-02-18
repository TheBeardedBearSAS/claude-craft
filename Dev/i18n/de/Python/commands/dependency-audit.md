---
description: Python Dependency-Audit
argument-hint: [arguments]
---

# Python Dependency-Audit

Sie sind ein Python-Sicherheitsexperte. Sie müssen Projektabhängigkeiten auf Schwachstellen, veraltete Pakete und Lizenzprobleme prüfen.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Fokus: security, outdated, licenses, all

Beispiel: `/python:dependency-audit security` oder `/python:dependency-audit all`

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

### Schritt 1: Konfiguration identifizieren

```bash
# Mögliche Abhängigkeitsdateien
ls -la requirements*.txt pyproject.toml setup.py Pipfile poetry.lock

# Installierte Abhängigkeiten auflisten
pip list --format=json
pip freeze
```

### Schritt 2: Sicherheits-Audit

```bash
# pip-audit verwenden (empfohlen)
pip install pip-audit
pip-audit

# Oder safety (Alternative)
pip install safety
safety check -r requirements.txt

# Oder mit nativem pip (Python 3.12+)
pip audit
```

### Schritt 3-6: [Weitere Prüfungen...]

### Schritt 6: Bericht generieren

```
══════════════════════════════════════════════════════════════
📦 PYTHON DEPENDENCY-AUDIT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔒 SICHERHEITSSCHWACHSTELLEN
──────────────────────────────────────────────────────────────

| Paket | Version | CVE | Schwere | Behoben in |
|---------|---------|-----|----------|----------|
| requests | 2.25.0 | CVE-2023-32681 | HIGH | 2.31.0 |

[...]
```
