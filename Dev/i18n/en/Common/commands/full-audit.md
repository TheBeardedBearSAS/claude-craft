---
description: Multi-Technology Complete Audit
argument-hint: [arguments]
---

# Multi-Technology Complete Audit

You are a code auditor expert. You must perform a complete compliance audit on the project, automatically detecting present technologies and applying corresponding rules.

## Arguments
$ARGUMENTS

If no arguments provided, automatically detect all technologies.

## MISSION

### Step 1: Technology Detection

Scan the project to identify present technologies:

| File | Technology |
|---------|-------------|
| `composer.json` + `symfony/*` | Symfony |
| `pubspec.yaml` + `flutter:` | Flutter |
| `pyproject.toml` or `requirements.txt` | Python |
| `package.json` + `react` (without `react-native`) | React |
| `package.json` + `react-native` | React Native |

For each detected technology:
1. Load rules from `.claude/rules/`
2. Apply specific audit

### Step 2: Audit by Technology

For EACH detected technology, verify:

#### Architecture (25 points)
- [ ] Separated layers (Domain/Application/Infrastructure)
- [ ] Inward-pointing dependencies (toward domain)
- [ ] Folder structure conforms to conventions
- [ ] No framework coupling in domain
- [ ] Architectural patterns respected

#### Code Quality (25 points)
- [ ] Naming standards respected
- [ ] Linting/Analyze without critical errors
- [ ] Type hints/annotations present
- [ ] Public classes documented
- [ ] Cyclomatic complexity < 10

#### Testing (25 points)
- [ ] Coverage ≥ 80%
- [ ] Unit tests for domain
- [ ] Integration tests present
- [ ] E2E/Widget tests for UI
- [ ] Test pyramid respected

#### Security (25 points)
- [ ] No secrets in source code
- [ ] Input validation on all inputs
- [ ] OWASP protections (XSS, CSRF, injection)
- [ ] Sensitive data encrypted
- [ ] Dependencies without known vulnerabilities

### Step 3: Execute Tools

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov

# React/React Native
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
```

### Step 4: Calculate Scores

For each technology, calculate:
- Architecture Score: X/25
- Code Quality Score: X/25
- Testing Score: X/25
- Security Score: X/25
- **Total Score: X/100**

### Step 5: Generate Report

```
══════════════════════════════════════════════════════════════
📊 MULTI-TECHNOLOGY AUDIT - Global Score: XX/100
══════════════════════════════════════════════════════════════

Detected technologies: [list]
Date: YYYY-MM-DD

──────────────────────────────────────────────────────────────
🔷 SYMFONY - Score: XX/100
──────────────────────────────────────────────────────────────

🏗️ Architecture (XX/25)
  ✅ Clean Architecture respected
  ✅ CQRS implemented correctly
  ⚠️ 2 services directly access Repository

📝 Code Quality (XX/25)
  ✅ PHPStan level 8 - 0 errors
  ✅ PSR-12 conventions respected
  ⚠️ 5 methods > 20 lines

🧪 Testing (XX/25)
  ✅ Coverage: 85%
  ✅ Domain unit tests
  ⚠️ No Panther E2E tests

🔒 Security (XX/25)
  ✅ No secrets in code
  ✅ CSRF enabled
  ⚠️ Dependency with minor CVE

──────────────────────────────────────────────────────────────
🔷 FLUTTER - Score: XX/100
──────────────────────────────────────────────────────────────

[Same structure]

══════════════════════════════════════════════════════════════
📋 GLOBAL SUMMARY
══════════════════════════════════════════════════════════════

| Technology | Architecture | Code | Tests | Security | Total |
|-------------|--------------|------|-------|----------|-------|
| Symfony     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|
| Flutter     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|
| AVERAGE     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|

══════════════════════════════════════════════════════════════
🎯 TOP 5 PRIORITY ACTIONS
══════════════════════════════════════════════════════════════

1. [CRITICAL] Action 1 description
   → Impact: +X points | Effort: Low/Medium/High

2. [HIGH] Action 2 description
   → Impact: +X points | Effort: Low/Medium/High

3. [MEDIUM] Action 3 description
   → Impact: +X points | Effort: Low/Medium/High

4. [MEDIUM] Action 4 description
   → Impact: +X points | Effort: Low/Medium/High

5. [LOW] Action 5 description
   → Impact: +X points | Effort: Low/Medium/High
```

## Scoring Rules

### Deductions by Category

| Violation | Points Lost |
|-----------|---------------|
| Architectural pattern violated | -5 |
| Framework/domain coupling | -3 |
| Critical linting error | -2 |
| Linting warning | -1 |
| Method > 30 lines | -1 |
| Coverage < 80% | -5 |
| No domain unit tests | -5 |
| Secret in code | -10 |
| Critical CVE vulnerability | -10 |
| High CVE vulnerability | -5 |

### Quality Thresholds

| Score | Assessment |
|-------|------------|
| 90-100 | Excellent |
| 75-89 | Good |
| 60-74 | Acceptable |
| 40-59 | Needs improvement |
| < 40 | Critical |
