# Claude Code Checklists - Atoll Tourisme

> Checklists to ensure code quality and security

## Overview

This folder contains 4 essential checklists for the development workflow.

**Total:** 4 checklists | ~3700 lines of detailed procedures

---

## 📋 Checklist List

### 1. `pre-commit.md` - Before each commit
**Estimated time:** 2-5 minutes

**Usage:** BEFORE each `git commit`

**Automatic checks:**
- ✅ Tests pass (unit + integration + Behat)
- ✅ PHPStan level 8 (0 errors)
- ✅ CS-Fixer (PSR-12 formatted code)
- ✅ Hadolint (valid Dockerfile)
- ✅ Coverage ≥ 80%
- ✅ Conformant commit message (Conventional Commits)

**Quick command:**
```bash
make pre-commit && git commit
```

**Sections:**
1. Automated tests
2. Static analysis (PHPStan)
3. Coding Standards (PHP CS Fixer)
4. Docker (Hadolint)
5. Test coverage
6. Commit message (Conventional Commits)
7. Documentation (if applicable)
8. Security & GDPR (if personal data)

**When to use:**
- ✅ Before EVERY commit
- ✅ Continuous validation
- ✅ Avoid regressions

**Commit message examples:**
```bash
✅ feat(reservation): add single supplement for 1 participant
✅ fix(value-object): fix rounding in Money::multiply
✅ refactor(reservation): extract PrixCalculatorService
✅ test(reservation): add total price calculation tests

❌ "update code"  (too vague)
❌ "fix bug"      (which bug?)
❌ "WIP"          (don't commit WIP)
```

---

### 2. `new-feature.md` - New feature
**Estimated time:** 2h30 (small) to 10h (large)

**Usage:** Complete workflow to implement a new feature

**TDD Phases:**
```
1. ANALYSIS (30 min)    → Template: .claude/templates/analysis.md
2. TDD RED (1h)         → Templates: test-*.md
3. TDD GREEN (2h)       → Templates: service.md, value-object.md, etc.
4. TDD REFACTOR (1h)    → SOLID principles
5. VALIDATION (30 min)  → Pre-commit checklist
6. PULL REQUEST         → PR template
```

**Sections:**
1. **Phase 1:** Pre-implementation analysis
2. **Phase 2:** TDD RED (failing tests)
3. **Phase 3:** TDD GREEN (minimal implementation)
4. **Phase 4:** TDD REFACTOR (SOLID improvement)
5. **Phase 5:** Final validation (quality + tests)
6. **Phase 6:** Pull Request

**When to use:**
- ✅ New business feature
- ✅ New API endpoint
- ✅ New use case

**Complete example:** "Paid options" feature
- Analysis: 30 min
- TDD RED: 1h (12 tests written)
- TDD GREEN: 2h (implementation + DB migration)
- TDD REFACTOR: 1h (Value Objects + services)
- Validation: 30 min (PHPStan + coverage)
- **Total:** 5h

**Time by size:**
| Size | Files | Total time |
|--------|----------|-------------|
| Small | 1 file | 2h30 |
| Medium | 3-5 files | 5h |
| Large | 10+ files | 10h |

---

### 3. `refactoring.md` - Secure refactoring
**Estimated time:** 30 min to 4h

**Usage:** Improve code without breaking behavior

**Principle:** Safety net = Green tests

**Phases:**
1. **Preparation:** Stable state (green tests)
2. **Analysis:** Identify code smells
3. **Refactoring:** Baby steps
4. **Patterns:** Apply refactoring patterns
5. **Validation:** Tests always green + performance OK
6. **Commit:** Refactoring documentation

**Detected code smells:**
- ❌ Method too long (> 20 lines)
- ❌ Duplication (DRY violation)
- ❌ High cyclomatic complexity (> 5)
- ❌ Primitive Obsession
- ❌ God Class (> 300 lines)

**Refactoring patterns:**
1. Extract Method
2. Extract Class
3. Replace Conditional with Polymorphism
4. Introduce Parameter Object
5. Replace Magic Number with Constant

**When to use:**
- ✅ Complex code to simplify
- ✅ Detected duplication
- ✅ SOLID violation
- ✅ Reduce technical debt

**Golden rule:** One change at a time + green tests

**Workflow:**
```bash
# 1. Stable state
git commit -m "chore: stable state before refactoring"

# 2. Small change
vim src/Service/ReservationService.php
# Rename variable

# 3. Tests
make test  # ✅ Green

# 4. Commit
git commit -m "refactor: rename data variable"

# 5. Repeat (baby steps)
```

---

### 4. `security-rgpd.md` - Security & GDPR
**Estimated time:** 1-2h (complete audit)

**Usage:** Before each release + every 3 months

**Sections:**

#### Security (11 points)
1. Personal data protection (DB encryption)
2. User input validation
3. CSRF protection
4. XSS protection
5. SQL Injection protection
6. Security Headers (CSP, HSTS, etc.)
7. Authentication & Authorization
8. Security tests

#### GDPR (4 points)
8. Consent & Rights
9. Right to be forgotten (anonymization)
10. Data portability (JSON export)
11. Retention period (automatic cleanup)
12. Audit & Traceability (logs)

**Final checklist:**

**Security:**
- [ ] Sensitive data encrypted (`doctrine-encrypt-bundle`)
- [ ] Strict input validation (Symfony Forms + Constraints)
- [ ] CSRF enabled
- [ ] XSS protection (Twig autoescape)
- [ ] SQL Injection impossible (Doctrine ORM)
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] HTTPS enforced
- [ ] Hashed passwords (Bcrypt/Argon2)
- [ ] Rate limiting on login
- [ ] No committed secrets

**GDPR:**
- [ ] Published privacy policy
- [ ] Explicit consent (checkbox)
- [ ] Consent traceability (date, IP)
- [ ] Right to be forgotten implemented (CLI command)
- [ ] Data portability (JSON export)
- [ ] Defined retention period (max 3 years)
- [ ] Automatic cleanup (cron)
- [ ] Sensitive action logs
- [ ] Personal data encryption
- [ ] Documented breach procedure

**When to use:**
- ✅ Before major release
- ✅ Quarterly audit (every 3 months)
- ✅ After security incident
- ✅ New data collection

**Audit commands:**
```bash
# Composer vulnerabilities
composer audit

# Symfony security checker
symfony security:check

# Check DB encryption
docker compose exec db mysql -u root -p atoll
SELECT nom FROM participant LIMIT 1;
# Expected: "enc:def502000..." (encrypted)

# Test security headers
curl -I https://atoll-tourisme.com
# Expected: CSP, HSTS, X-Frame-Options, etc.
```

---

## 🎯 Recommended Workflow

### Daily Development

```bash
# 1. New feature
# Use: new-feature.md

# 2. Before each commit
# Use: pre-commit.md
make pre-commit && git commit

# 3. Refactoring if needed
# Use: refactoring.md

# 4. Security/GDPR audit (quarterly)
# Use: security-rgpd.md
```

### Complete Feature Workflow

```bash
# Step 1: Analysis (new-feature.md phase 1)
vim docs/analysis/2025-01-15-feature.md

# Step 2: TDD RED (new-feature.md phase 2)
vim tests/Unit/Service/MyServiceTest.php
make test  # ❌ Failed (expected)

# Step 3: TDD GREEN (new-feature.md phase 3)
vim src/Service/MyService.php
make test  # ✅ Passed

# Step 4: TDD REFACTOR (new-feature.md phase 4 + refactoring.md)
# Improve code (SOLID, DRY)
make test  # ✅ Still passed

# Step 5: Pre-commit (pre-commit.md)
make pre-commit  # ✅ All OK
git commit -m "feat(service): add MyService"

# Step 6: PR
git push origin feature/my-feature
# Create PR
```

---

## 📚 Cross-references

### Associated Templates
`.claude/templates/`:
- `analysis.md` → Used in `new-feature.md` phase 1
- `test-*.md` → Used in `new-feature.md` phases 2-3
- `service.md`, `value-object.md`, etc. → Used in `new-feature.md` phase 3

### Associated Rules
`.claude/rules/`:
- `01-architecture-ddd.md` → DDD Architecture
- `03-coding-standards.md` → Code standards
- `04-testing-tdd.md` → TDD strategy
- `07-security-rgpd.md` → Security and GDPR

---

## 💡 Usage Tips

### 1. Pre-commit: Automation

Create a Git hook:
```bash
# .git/hooks/pre-commit
#!/bin/bash
make pre-commit || exit 1
```

Or use Husky (npm):
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "make pre-commit"
    }
  }
}
```

### 2. New-feature: TDD Compliance

**DO NOT** code before tests:
```bash
# ❌ BAD
vim src/Service/MyService.php  # Code first
vim tests/Unit/Service/MyServiceTest.php  # Tests after

# ✅ GOOD
vim tests/Unit/Service/MyServiceTest.php  # Tests first (RED)
make test  # ❌ Failed
vim src/Service/MyService.php  # Code after (GREEN)
make test  # ✅ Passed
```

### 3. Refactoring: Baby Steps

**DO NOT** refactor everything at once:
```bash
# ❌ BAD (Big Bang)
# 3 days of refactoring
git commit -m "refactor: improve everything"  # 50 files

# ✅ GOOD (Baby Steps)
git commit -m "refactor: rename variable"  # 1 file
git commit -m "refactor: extract method"   # 1 file
git commit -m "refactor: move class"       # 2 files
```

### 4. Security-GDPR: Automation

Create a cron for GDPR cleanup:
```bash
# crontab -e
# GDPR cleanup every day at 2am
0 2 * * * cd /path/to/project && docker compose exec php bin/console app:gdpr:cleanup
```

---

## 📊 Statistics

| Checklist | Lines | Estimated time | Frequency |
|-----------|--------|--------------|-----------|
| pre-commit.md | 527 | 2-5 min | Each commit |
| new-feature.md | 765 | 2h30-10h | Each feature |
| refactoring.md | 975 | 30min-4h | As needed |
| security-rgpd.md | 920 | 1-2h | Quarterly |

**Total:** ~3700 lines of detailed procedures

---

## ⚠️ Points of Attention

### NEVER
- ❌ Commit without validated `pre-commit.md`
- ❌ Feature without analysis (`new-feature.md` phase 1)
- ❌ Refactoring without green tests
- ❌ Release without security/GDPR audit

### ALWAYS
- ✅ Run tests before commit
- ✅ PHPStan level 8 without errors
- ✅ Coverage ≥ 80%
- ✅ Conformant commit message (Conventional Commits)

---

## 🚀 Makefile Shortcuts

Add to `Makefile`:

```makefile
.PHONY: pre-commit
pre-commit: ## Pre-commit checklist
	@echo "🔍 Pre-commit validation..."
	@$(MAKE) phpstan
	@$(MAKE) cs-fix
	@$(MAKE) test
	@$(MAKE) test-coverage
	@echo "✅ Ready to commit!"

.PHONY: security-audit
security-audit: ## Security/GDPR audit
	@echo "🔒 Security audit..."
	composer audit
	symfony security:check
	@echo "📋 See checklist: .claude/checklists/security-rgpd.md"
```

Usage:
```bash
make pre-commit       # Before each commit
make security-audit   # Quarterly security audit
```

---

**Last update:** 2025-11-26
**Responsible:** Lead Dev
**Review frequency:** Monthly
