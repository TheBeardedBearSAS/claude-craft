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

### Schritt 3: Auf Updates prüfen

```bash
# Veraltete Pakete
pip list --outdated --format=json

# Mit pip-tools
pip install pip-tools
pip-compile --upgrade --dry-run

# Mit poetry
poetry show --outdated

# Mit pipenv
pipenv update --dry-run
```

### Schritt 4: Lizenz-Audit

```bash
# pip-licenses installieren
pip install pip-licenses

# Lizenzen auflisten
pip-licenses --format=markdown

# Problematische Lizenzen filtern
pip-licenses --fail-on="GPL;AGPL"

# JSON-Export
pip-licenses --format=json --output-file=licenses.json
```

### Schritt 5: Transitive Abhängigkeitsanalyse

```bash
# Abhängigkeitsbaum
pip install pipdeptree
pipdeptree

# JSON-Format
pipdeptree --json

# Umgekehrte Abhängigkeiten (wer nutzt was)
pipdeptree --reverse --packages requests
```

### Schritt 6: Bericht generieren

```
══════════════════════════════════════════════════════════════
📦 PYTHON DEPENDENCY-AUDIT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔒 SICHERHEITSSCHWACHSTELLEN
──────────────────────────────────────────────────────────────

| Paket    | Version | CVE              | Schwere  | Behoben in |
|----------|---------|------------------|----------|------------|
| requests | 2.25.0  | CVE-2023-32681   | HIGH     | 2.31.0     |
| urllib3  | 1.26.5  | CVE-2023-45803   | MEDIUM   | 1.26.18    |
| pillow   | 9.0.0   | CVE-2023-44271   | CRITICAL | 10.0.1     |

⚠️ ERFORDERLICHE MASSNAHMEN:
1. `pip install requests>=2.31.0` (Priorität: HIGH)
2. `pip install urllib3>=1.26.18` (Priorität: MEDIUM)
3. `pip install pillow>=10.0.1` (Priorität: CRITICAL)

──────────────────────────────────────────────────────────────
📈 VERALTETE PAKETE
──────────────────────────────────────────────────────────────

### MAJOR-Updates (Mögliche Breaking Changes)
| Paket    | Aktuell  | Neueste | Changelog     |
|----------|----------|---------|---------------|
| django   | 3.2.23   | 5.0.1   | [Changelog](url) |
| pydantic | 1.10.13  | 2.5.3   | [Migration](url) |

### MINOR-Updates (Empfohlen)
| Paket      | Aktuell  | Neueste  |
|------------|----------|----------|
| fastapi    | 0.104.0  | 0.109.0  |
| sqlalchemy | 2.0.23   | 2.0.25   |

### PATCH-Updates (Sicherheit/Bugfix)
| Paket | Aktuell | Neueste |
|-------|---------|---------|
| httpx | 0.26.0  | 0.26.1  |

──────────────────────────────────────────────────────────────
📜 LIZENZEN
──────────────────────────────────────────────────────────────

### Zusammenfassung
| Typ          | Anzahl | Pakete                     |
|--------------|--------|----------------------------|
| MIT          | 45     | requests, fastapi, ...     |
| Apache-2.0   | 12     | google-cloud-*, ...        |
| BSD-3-Clause | 8      | numpy, pandas, ...         |
| GPL-3.0      | 2      | ⚠️ package-x, package-y   |
| UNKNOWN      | 1      | ❓ private-package         |

### ⚠️ Erkannte Copyleft-Lizenzen
Diese Lizenzen können rechtliche Auswirkungen haben:

| Paket     | Lizenz  | Auswirkung                             |
|-----------|---------|----------------------------------------|
| package-x | GPL-3.0 | Abgeleiteter Code muss GPL sein        |
| package-y | AGPL-3.0| Auch für SaaS                          |

**Empfehlung**: Kompatibilität mit Projektlizenz prüfen.

──────────────────────────────────────────────────────────────
📊 STATISTIKEN
──────────────────────────────────────────────────────────────

| Metrik                | Wert |
|-----------------------|------|
| Gesamtpakete          | 87   |
| Direkt                | 23   |
| Transitiv             | 64   |
| Schwachstellen        | 3    |
| Veraltet              | 15   |
| Lizenzen OK           | 82   |
| Lizenzen zu prüfen    | 5    |

──────────────────────────────────────────────────────────────
🔧 KORREKTURBEFEHLE
──────────────────────────────────────────────────────────────

# Kritische Schwachstellen beheben
pip install --upgrade requests>=2.31.0 urllib3>=1.26.18 pillow>=10.0.1

# Sicherheits-Patches aktualisieren
pip install --upgrade httpx

# Aktualisierte requirements.txt generieren
pip freeze > requirements.txt

# Oder mit pip-tools
pip-compile --upgrade requirements.in

──────────────────────────────────────────────────────────────
🎯 PRIORITÄTEN
──────────────────────────────────────────────────────────────

1. [ ] KRITISCH: pillow beheben (CVE-2023-44271)
2. [ ] HIGH: requests beheben (CVE-2023-32681)
3. [ ] MEDIUM: urllib3 beheben (CVE-2023-45803)
4. [ ] GPL-Lizenzen prüfen (package-x, package-y)
5. [ ] Migration pydantic v1 → v2 planen
```
