---
description: Multi-Technology Complete Audit
argument-hint: [arguments]
---

> **DEPRECATED v5.8** — For multi-technology projects, prefer `/common:team-audit` which runs audits in parallel using Agent Teams. This command remains available for single-technology projects or when `--sequential` execution is needed. Use `/common:team-audit --sequential` for sequential execution with the team-audit interface.

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

### Step 1.5: Prepare Isolated Output Directories

When **2 or more technologies** are detected, each audit agent MUST write its results to an isolated directory to prevent file write conflicts during parallel execution:

```
.audit-output/
  {technology}-{category}/
    result.json          # Structured audit result
    tool-output.log      # Raw tool output
```

For example, a Symfony + React project creates:
```
.audit-output/
  symfony-architecture/result.json
  symfony-code-quality/result.json
  symfony-testing/result.json
  symfony-security/result.json
  react-architecture/result.json
  react-code-quality/result.json
  react-testing/result.json
  react-security/result.json
```

Each `result.json` follows this schema:
```json
{
  "tech": "symfony",
  "category": "architecture",
  "score": 22,
  "max": 25,
  "findings": [
    {
      "severity": "warning",
      "file": "src/Controller/UserController.php",
      "message": "Direct repository access from controller",
      "rule": "clean-architecture-layer-violation"
    }
  ]
}
```

**Single-technology projects**: When only 1 technology is detected, isolation is not required. Results can be written directly without the `.audit-output/` directory structure.

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

### Step 3.5: Merge Audit Results

When using isolated output directories (2+ technologies), collect and merge all results before scoring:

1. **Read all `result.json` files** from `.audit-output/*/result.json`
2. **Group by technology**: Combine the 4 category results per technology
3. **Deduplicate findings**: Remove duplicate findings that appear across categories (e.g., a file flagged in both architecture and code quality)
4. **Resolve conflicts**: If the same file is scored differently by two categories, use the lower (more critical) score
5. **Produce merged result** for each technology with all 4 category scores

Merge can be done using the result aggregator script if available:
```bash
# If result-aggregator.sh is available
Tools/AgentTeams/lib/result-aggregator.sh \
  --input-dir .audit-output \
  --output-file .audit-output/merged-report.json
```

Or manually by reading each `result.json` and aggregating in memory.

**Single-technology projects**: Skip this step (no merge needed).

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
