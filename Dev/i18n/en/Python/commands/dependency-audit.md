# Python Dependency Audit

You are a Python security expert. You must audit project dependencies to identify vulnerabilities, obsolete packages, and license issues.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Focus: security, outdated, licenses, all

Example: `/python:dependency-audit security` or `/python:dependency-audit all`

## MISSION

### Step 1: Identify Configuration

```bash
# Possible dependency files
ls -la requirements*.txt pyproject.toml setup.py Pipfile poetry.lock

# List installed dependencies
pip list --format=json
pip freeze
```

### Step 2: Security Audit

```bash
# Use pip-audit (recommended)
pip install pip-audit
pip-audit

# Or safety (alternative)
pip install safety
safety check -r requirements.txt

# Or with native pip (Python 3.12+)
pip audit
```

### Step 3: Check for Updates

```bash
# Obsolete packages
pip list --outdated --format=json

# With pip-tools
pip install pip-tools
pip-compile --upgrade --dry-run

# With poetry
poetry show --outdated

# With pipenv
pipenv update --dry-run
```

### Step 4: License Audit

```bash
# Install pip-licenses
pip install pip-licenses

# List licenses
pip-licenses --format=markdown

# Filter problematic licenses
pip-licenses --fail-on="GPL;AGPL"

# JSON export
pip-licenses --format=json --output-file=licenses.json
```

### Step 5: Transitive Dependency Analysis

```bash
# Dependency tree
pip install pipdeptree
pipdeptree

# JSON format
pipdeptree --json

# Reverse dependencies (who uses what)
pipdeptree --reverse --packages requests
```

### Step 6: Generate Report

```
══════════════════════════════════════════════════════════════
📦 PYTHON DEPENDENCY AUDIT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔒 SECURITY VULNERABILITIES
──────────────────────────────────────────────────────────────

| Package | Version | CVE | Severity | Fixed In |
|---------|---------|-----|----------|----------|
| requests | 2.25.0 | CVE-2023-32681 | HIGH | 2.31.0 |
| urllib3 | 1.26.5 | CVE-2023-45803 | MEDIUM | 1.26.18 |
| pillow | 9.0.0 | CVE-2023-44271 | CRITICAL | 10.0.1 |

⚠️ REQUIRED ACTIONS:
1. `pip install requests>=2.31.0` (HIGH priority)
2. `pip install urllib3>=1.26.18` (MEDIUM priority)
3. `pip install pillow>=10.0.1` (CRITICAL priority)

──────────────────────────────────────────────────────────────
📈 OBSOLETE PACKAGES
──────────────────────────────────────────────────────────────

### MAJOR Updates (Possible breaking changes)
| Package | Current | Latest | Changelog |
|---------|---------|--------|-----------|
| django | 3.2.23 | 5.0.1 | [Changelog](url) |
| pydantic | 1.10.13 | 2.5.3 | [Migration](url) |

### MINOR Updates (Recommended)
| Package | Current | Latest |
|---------|---------|--------|
| fastapi | 0.104.0 | 0.109.0 |
| sqlalchemy | 2.0.23 | 2.0.25 |

### PATCH Updates (Security/Bugfix)
| Package | Current | Latest |
|---------|---------|--------|
| httpx | 0.26.0 | 0.26.1 |

──────────────────────────────────────────────────────────────
📜 LICENSES
──────────────────────────────────────────────────────────────

### Summary
| Type | Count | Packages |
|------|-------|----------|
| MIT | 45 | requests, fastapi, ... |
| Apache-2.0 | 12 | google-cloud-*, ... |
| BSD-3-Clause | 8 | numpy, pandas, ... |
| GPL-3.0 | 2 | ⚠️ package-x, package-y |
| UNKNOWN | 1 | ❓ private-package |

### ⚠️ Detected Copyleft Licenses
These licenses may have legal implications:

| Package | License | Impact |
|---------|---------|--------|
| package-x | GPL-3.0 | Derived code must be GPL |
| package-y | AGPL-3.0 | Even for SaaS |

**Recommendation**: Verify compatibility with project license.

──────────────────────────────────────────────────────────────
📊 STATISTICS
──────────────────────────────────────────────────────────────

| Metric | Value |
|--------|-------|
| Total packages | 87 |
| Direct | 23 |
| Transitive | 64 |
| Vulnerabilities | 3 |
| Obsolete | 15 |
| Licenses OK | 82 |
| Licenses to verify | 5 |

──────────────────────────────────────────────────────────────
🔧 CORRECTION COMMANDS
──────────────────────────────────────────────────────────────

# Fix critical vulnerabilities
pip install --upgrade requests>=2.31.0 urllib3>=1.26.18 pillow>=10.0.1

# Update security patches
pip install --upgrade httpx

# Generate updated requirements.txt
pip freeze > requirements.txt

# Or with pip-tools
pip-compile --upgrade requirements.in

──────────────────────────────────────────────────────────────
🎯 PRIORITIES
──────────────────────────────────────────────────────────────

1. [ ] CRITICAL: Fix pillow (CVE-2023-44271)
2. [ ] HIGH: Fix requests (CVE-2023-32681)
3. [ ] MEDIUM: Fix urllib3 (CVE-2023-45803)
4. [ ] Verify GPL licenses (package-x, package-y)
5. [ ] Plan pydantic v1 → v2 migration
```
