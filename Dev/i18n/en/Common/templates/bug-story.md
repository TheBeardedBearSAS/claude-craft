# {BUG_ID}: [BUG] {TITLE}

## Metadata

- **ID**: {BUG_ID}
- **Type**: bug
- **Source**: Recette {SESSION_ID}
- **Source Error**: {ERROR_ID}
- **Severity**: {critical|high|medium|low}
- **Sprint**: {SPRINT}
- **Status**: backlog
- **Date**: {DATE}

## Bug Description

**Actual behavior**: {refined description of observed behavior}

**Expected behavior**: {description of correct expected behavior}

## Reproduction Steps

1. {step 1}
2. {step 2}
3. {step 3}

## Root Cause

{root cause analysis identified during refinement}

## Acceptance Criteria

### AC-1: Bug no longer reproduces

```gherkin
GIVEN {context}
WHEN {action that triggered the bug}
THEN {correct behavior}
```

### AC-2: Regression test passes

```gherkin
GIVEN the fix is in place
WHEN the regression suite is executed
THEN all tests pass
```

## Affected Files

- {file 1}
- {file 2}

## Screenshots

<!-- Screenshots from the recette session if available -->
<!-- Path: .recette/sessions/{SESSION_ID}/screenshots/ -->

## Definition of Done

- [ ] RED test written (reproduces the bug)
- [ ] GREEN fix applied
- [ ] Refactoring done
- [ ] Regression tests generated
- [ ] Regression registry updated
- [ ] All tests pass
