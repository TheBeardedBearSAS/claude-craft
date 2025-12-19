---
description: Check Python Code Quality
argument-hint: [arguments]
---

# Check Python Code Quality

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## MISSION

Perform a complete code quality audit of the Python project by verifying PEP8 compliance, typing, readability, and best practices defined in project rules.

### Step 1: PEP8 Coding Standards

Verify Python conventions compliance:
- [ ] Naming: snake_case for functions/variables, PascalCase for classes
- [ ] Indentation: 4 spaces (no tabs)
- [ ] Line length: maximum 88 characters (Black)
- [ ] Imports: organized (stdlib, third-party, local) and sorted
- [ ] Spaces: around operators, after commas
- [ ] Docstrings: present for modules, classes, public functions

**Command**: Run `docker run --rm -v $(pwd):/app python:3.11 python -m flake8 /app --max-line-length=88`

**Reference**: `rules/03-coding-standards.md` section "PEP 8 Compliance"

### Step 2: Type Hints and MyPy

Check static typing usage:
- [ ] Type hints on all function parameters
- [ ] Type hints on return values
- [ ] Annotations for class attributes
- [ ] Use of `typing` for complex types (Optional, Union, List, Dict)
- [ ] No MyPy errors in strict mode

**Command**: Run `docker run --rm -v $(pwd):/app python:3.11 python -m mypy /app --strict`

**Reference**: `rules/03-coding-standards.md` section "Type Hints"

### Step 3: Linting with Ruff

Analyze code with Ruff (replaces Flake8, isort, pydocstyle):
- [ ] No unused imports
- [ ] No unused variables
- [ ] No dead code (unreachable code)
- [ ] Acceptable cyclomatic complexity (<10)
- [ ] Security rules respected (S-rules)

**Command**: Run `docker run --rm -v $(pwd):/app python:3.11 pip install ruff && ruff check /app`

**Reference**: `rules/06-tooling.md` section "Linting and Formatting"

### Step 4: Formatting with Black

Verify formatting consistency:
- [ ] Code formatted with Black
- [ ] Black configuration in pyproject.toml
- [ ] No differences after `black --check`
- [ ] Consistent line length (88 characters)

**Command**: Run `docker run --rm -v $(pwd):/app python:3.11 pip install black && black --check /app`

**Reference**: `rules/06-tooling.md` section "Code Formatting"

### Step 5: KISS, DRY, YAGNI Principles

Analyze code simplicity and clarity:
- [ ] Short functions (<20 lines ideally)
- [ ] No code duplication (DRY)
- [ ] No over-engineering (YAGNI)
- [ ] Explicit and self-documenting naming
- [ ] Single level of abstraction per function
- [ ] Early returns to reduce complexity

**Reference**: `rules/05-kiss-dry-yagni.md`

### Step 6: Comments and Documentation

Evaluate documentation quality:
- [ ] Google or NumPy style docstrings
- [ ] Comments only for "why", not "what"
- [ ] Complete README.md with setup and usage
- [ ] No commented code (use git)
- [ ] Documentation of important architectural decisions

**Reference**: `rules/03-coding-standards.md` section "Documentation"

### Step 7: Error Handling

Verify code robustness:
- [ ] Specific exceptions (not generic Exception)
- [ ] No silent `pass` in except
- [ ] Informative error messages
- [ ] User input validation
- [ ] Proper resource management (context managers)

**Reference**: `rules/03-coding-standards.md` section "Error Handling"

### Step 8: Calculate Score

Point attribution (out of 25):
- PEP8 and formatting: 5 points
- Type hints and MyPy: 5 points
- Ruff linting: 4 points
- KISS/DRY/YAGNI: 4 points
- Documentation: 4 points
- Error handling: 3 points

## OUTPUT FORMAT

```
PYTHON CODE QUALITY AUDIT
================================

OVERALL SCORE: XX/25

STRENGTHS:
- [List of good practices observed]

IMPROVEMENTS:
- [List of minor improvements]

CRITICAL ISSUES:
- [List of serious standards violations]

DETAILS BY CATEGORY:

1. PEP8 AND FORMATTING (XX/5)
   Status: [Python standards compliance]
   Flake8 Errors: XX
   Black Differences: XX files

2. TYPE HINTS (XX/5)
   Status: [Static typing coverage]
   MyPy Errors: XX
   Coverage: XX%

3. RUFF LINTING (XX/4)
   Status: [Code quality]
   Warnings: XX
   Unused Imports: XX
   Max Complexity: XX

4. KISS/DRY/YAGNI (XX/4)
   Status: [Simplicity and clarity]
   Functions >20 lines: XX
   Duplicated Code: XX instances

5. DOCUMENTATION (XX/4)
   Status: [Documentation quality]
   Missing Docstrings: XX
   Coverage: XX%

6. ERROR HANDLING (XX/3)
   Status: [Code robustness]
   Generic Exceptions: XX
   `except pass`: XX

TOP 3 PRIORITY ACTIONS:
1. [Most critical action to improve quality]
2. [Second priority action]
3. [Third priority action]
```

## NOTES

- Run all available linting tools in the project
- Use Docker to abstract from local environment
- Provide examples of problematic files/lines
- Suggest automatable corrections (pre-commit hooks)
- Prioritize quick wins (auto formatting) vs deep refactoring
