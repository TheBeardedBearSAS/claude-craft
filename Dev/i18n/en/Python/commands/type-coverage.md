---
description: Check Python Type Coverage
argument-hint: [arguments]
---

# Check Python Type Coverage

You are a Python expert. You must verify type annotation coverage in the project and identify untyped functions/methods.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Path to specific module
- (Optional) Minimum coverage threshold (e.g., `80`)

Example: `/python:type-coverage app/` or `/python:type-coverage app/api/ 90`

## MISSION

### Step 1: MyPy Configuration

[Show mypy configuration in pyproject.toml]

### Step 2: Launch Analysis

```bash
# Standard MyPy
mypy app/

# With coverage report
mypy app/ --txt-report type-coverage/

# HTML report
mypy app/ --html-report type-coverage-html/

# Progressive strict mode
mypy app/ --strict --warn-return-any
```

### Step 3: Coverage Analysis Script

[Python script to analyze type coverage using AST]

### Step 4: Typing Patterns

[Show patterns: TypeAlias, Generics, Protocols, Callable, Overload, etc.]

### Step 5: Generate Report

```
══════════════════════════════════════════════════════════════
📊 TYPE COVERAGE REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📈 GLOBAL SUMMARY
──────────────────────────────────────────────────────────────

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Global Coverage | 78.5% | 80% | ⚠️ |
| Total Functions | 245 | - | - |
| Fully Typed | 192 | - | - |
| Partially Typed | 38 | - | - |
| Untyped | 15 | - | - |

──────────────────────────────────────────────────────────────
📁 COVERAGE BY MODULE
──────────────────────────────────────────────────────────────

| Module | Functions | Typed | Coverage |
|--------|-----------|-------|----------|
| app/api/ | 45 | 45 | 100% ✅ |
| app/core/ | 32 | 30 | 93.8% ✅ |
| app/services/ | 58 | 52 | 89.7% ✅ |
| app/crud/ | 40 | 35 | 87.5% ✅ |
| app/models/ | 28 | 20 | 71.4% ⚠️ |
| app/utils/ | 42 | 10 | 23.8% ❌ |

──────────────────────────────────────────────────────────────
❌ UNTYPED FUNCTIONS
──────────────────────────────────────────────────────────────

### app/utils/helpers.py

| Line | Function | Missing |
|------|----------|---------|
| 15 | `parse_date` | return type |
| 28 | `format_currency` | param: amount, return |
| 45 | `slugify` | return type |
| 67 | `calculate_hash` | param: data |

──────────────────────────────────────────────────────────────
🔧 SUGGESTED CORRECTIONS
──────────────────────────────────────────────────────────────

### app/utils/helpers.py:15

```python
# Before
def parse_date(date_str):
    ...

# After
def parse_date(date_str: str) -> datetime | None:
    ...
```

──────────────────────────────────────────────────────────────
🎯 PRIORITIES
──────────────────────────────────────────────────────────────

1. [ ] Type app/utils/ (23.8% → 80%+)
2. [ ] Complete app/models/ (71.4% → 90%+)
3. [ ] Fix 23 mypy errors
4. [ ] Add mypy plugin for SQLAlchemy
5. [ ] Configure pre-commit hook mypy
```
