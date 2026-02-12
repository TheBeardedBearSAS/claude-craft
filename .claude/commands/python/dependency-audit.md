---
description: Audit des Dépendances Python
argument-hint: [arguments]
---

# Audit des Dépendances Python

Tu es un expert sécurité Python. Tu dois auditer les dépendances du projet pour identifier les vulnérabilités, les packages obsolètes et les problèmes de licence.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Focus : security, outdated, licenses, all

Exemple : `/python:dependency-audit security` ou `/python:dependency-audit all`

## MISSION

### Étape 1 : Identifier la Configuration

```bash
# Fichiers de dépendances possibles
ls -la requirements*.txt pyproject.toml setup.py Pipfile poetry.lock

# Lister les dépendances installées
pip list --format=json
pip freeze
```

### Étape 2 : Audit de Sécurité

```bash
# Utiliser pip-audit (recommandé)
pip install pip-audit
pip-audit

# Ou safety (alternative)
pip install safety
safety check -r requirements.txt

# Ou avec pip natif (Python 3.12+)
pip audit
```

```python
# Script d'audit sécurité automatisé
import subprocess
import json
from dataclasses import dataclass
from typing import Optional


@dataclass
class Vulnerability:
    package: str
    version: str
    vulnerability_id: str
    severity: str
    description: str
    fixed_in: Optional[str]


def run_pip_audit() -> list[Vulnerability]:
    """Exécute pip-audit et parse les résultats."""
    result = subprocess.run(
        ["pip-audit", "--format=json"],
        capture_output=True,
        text=True,
    )

    vulnerabilities = []
    if result.stdout:
        data = json.loads(result.stdout)
        for vuln in data.get("vulnerabilities", []):
            vulnerabilities.append(Vulnerability(
                package=vuln["name"],
                version=vuln["version"],
                vulnerability_id=vuln["id"],
                severity=vuln.get("severity", "UNKNOWN"),
                description=vuln["description"],
                fixed_in=vuln.get("fix_versions", [None])[0],
            ))

    return vulnerabilities
```

### Étape 3 : Vérifier les Mises à Jour

```bash
# Packages obsolètes
pip list --outdated --format=json

# Avec pip-tools
pip install pip-tools
pip-compile --upgrade --dry-run

# Avec poetry
poetry show --outdated

# Avec pipenv
pipenv update --dry-run
```

```python
# Script de vérification des mises à jour
import subprocess
import json
from dataclasses import dataclass
from packaging import version as pkg_version


@dataclass
class OutdatedPackage:
    name: str
    current: str
    latest: str
    type: str  # major, minor, patch

    @property
    def is_major_update(self) -> bool:
        current = pkg_version.parse(self.current)
        latest = pkg_version.parse(self.latest)
        return latest.major > current.major


def get_outdated_packages() -> list[OutdatedPackage]:
    """Récupère les packages obsolètes."""
    result = subprocess.run(
        ["pip", "list", "--outdated", "--format=json"],
        capture_output=True,
        text=True,
    )

    packages = []
    if result.stdout:
        data = json.loads(result.stdout)
        for pkg in data:
            current = pkg_version.parse(pkg["version"])
            latest = pkg_version.parse(pkg["latest_version"])

            if latest.major > current.major:
                update_type = "major"
            elif latest.minor > current.minor:
                update_type = "minor"
            else:
                update_type = "patch"

            packages.append(OutdatedPackage(
                name=pkg["name"],
                current=pkg["version"],
                latest=pkg["latest_version"],
                type=update_type,
            ))

    return packages
```

### Étape 4 : Audit des Licences

```bash
# Installer pip-licenses
pip install pip-licenses

# Lister les licences
pip-licenses --format=markdown

# Filtrer les licences problématiques
pip-licenses --fail-on="GPL;AGPL"

# Export JSON
pip-licenses --format=json --output-file=licenses.json
```

```python
# Licences à surveiller
COPYLEFT_LICENSES = {
    "GPL-2.0",
    "GPL-3.0",
    "AGPL-3.0",
    "LGPL-2.1",
    "LGPL-3.0",
}

PERMISSIVE_LICENSES = {
    "MIT",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "Unlicense",
    "WTFPL",
}

UNKNOWN_LICENSES = {
    "UNKNOWN",
    "OSI Approved",
}
```

### Étape 5 : Analyse des Dépendances Transitives

```bash
# Arbre des dépendances
pip install pipdeptree
pipdeptree

# Format JSON
pipdeptree --json

# Dépendances inversées (qui utilise quoi)
pipdeptree --reverse --packages requests
```

### Étape 6 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
📦 AUDIT DÉPENDANCES PYTHON
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔒 VULNÉRABILITÉS DE SÉCURITÉ
──────────────────────────────────────────────────────────────

| Package | Version | CVE | Sévérité | Corrigé dans |
|---------|---------|-----|----------|--------------|
| requests | 2.25.0 | CVE-2023-32681 | HAUTE | 2.31.0 |
| urllib3 | 1.26.5 | CVE-2023-45803 | MOYENNE | 1.26.18 |
| pillow | 9.0.0 | CVE-2023-44271 | CRITIQUE | 10.0.1 |

⚠️ ACTIONS REQUISES :
1. `pip install requests>=2.31.0` (HAUTE priorité)
2. `pip install urllib3>=1.26.18` (MOYENNE priorité)
3. `pip install pillow>=10.0.1` (CRITIQUE priorité)

──────────────────────────────────────────────────────────────
📈 PACKAGES OBSOLÈTES
──────────────────────────────────────────────────────────────

### Mises à jour MAJEURES (Breaking changes possibles)
| Package | Actuel | Dernier | Changelog |
|---------|--------|---------|-----------|
| django | 3.2.23 | 5.0.1 | [Changelog](url) |
| pydantic | 1.10.13 | 2.5.3 | [Migration](url) |

### Mises à jour MINEURES (Recommandées)
| Package | Actuel | Dernier |
|---------|--------|---------|
| fastapi | 0.104.0 | 0.109.0 |
| sqlalchemy | 2.0.23 | 2.0.25 |

### Mises à jour PATCH (Sécurité/Bugfix)
| Package | Actuel | Dernier |
|---------|--------|---------|
| httpx | 0.26.0 | 0.26.1 |

──────────────────────────────────────────────────────────────
📜 LICENCES
──────────────────────────────────────────────────────────────

### Résumé
| Type | Nombre | Packages |
|------|--------|----------|
| MIT | 45 | requests, fastapi, ... |
| Apache-2.0 | 12 | google-cloud-*, ... |
| BSD-3-Clause | 8 | numpy, pandas, ... |
| GPL-3.0 | 2 | ⚠️ package-x, package-y |
| UNKNOWN | 1 | ❓ private-package |

### ⚠️ Licences Copyleft Détectées
Ces licences peuvent avoir des implications légales :

| Package | Licence | Impact |
|---------|---------|--------|
| package-x | GPL-3.0 | Code dérivé doit être GPL |
| package-y | AGPL-3.0 | Même pour SaaS |

**Recommandation** : Vérifier la compatibilité avec la licence du projet.

### ❓ Licences Non Identifiées
| Package | Licence déclarée |
|---------|------------------|
| private-package | UNKNOWN |

**Action** : Vérifier manuellement ces packages.

──────────────────────────────────────────────────────────────
🌳 ARBRE DES DÉPENDANCES
──────────────────────────────────────────────────────────────

fastapi==0.109.0
├── pydantic>=1.7.4
│   └── typing-extensions>=4.6.1
├── starlette>=0.35.0
│   └── anyio>=3.4.0
└── typing-extensions>=4.8.0

sqlalchemy==2.0.25
├── greenlet>=0.4.17
└── typing-extensions>=4.6.0

──────────────────────────────────────────────────────────────
📊 STATISTIQUES
──────────────────────────────────────────────────────────────

| Métrique | Valeur |
|----------|--------|
| Total packages | 87 |
| Direct | 23 |
| Transitifs | 64 |
| Vulnérabilités | 3 |
| Obsolètes | 15 |
| Licences OK | 82 |
| Licences à vérifier | 5 |

──────────────────────────────────────────────────────────────
🔧 COMMANDES DE CORRECTION
──────────────────────────────────────────────────────────────

# Corriger les vulnérabilités critiques
pip install --upgrade requests>=2.31.0 urllib3>=1.26.18 pillow>=10.0.1

# Mettre à jour les patches de sécurité
pip install --upgrade httpx

# Générer requirements.txt à jour
pip freeze > requirements.txt

# Ou avec pip-tools
pip-compile --upgrade requirements.in

──────────────────────────────────────────────────────────────
🎯 PRIORITÉS
──────────────────────────────────────────────────────────────

1. [ ] CRITIQUE : Corriger pillow (CVE-2023-44271)
2. [ ] HAUTE : Corriger requests (CVE-2023-32681)
3. [ ] MOYENNE : Corriger urllib3 (CVE-2023-45803)
4. [ ] Vérifier licences GPL (package-x, package-y)
5. [ ] Planifier migration pydantic v1 → v2
```

### Étape 7 : Configuration CI/CD

```yaml
# .github/workflows/dependency-audit.yml
name: Dependency Audit

on:
  schedule:
    - cron: '0 8 * * 1'  # Chaque lundi à 8h
  push:
    paths:
      - 'requirements*.txt'
      - 'pyproject.toml'
      - 'poetry.lock'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install pip-audit safety pip-licenses
          pip install -r requirements.txt

      - name: Security audit
        run: pip-audit --strict

      - name: License check
        run: pip-licenses --fail-on="GPL;AGPL"

      - name: Check outdated
        run: pip list --outdated
```

### Configuration Pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: pip-audit
        name: pip-audit
        entry: pip-audit
        language: system
        pass_filenames: false
        always_run: true
```
