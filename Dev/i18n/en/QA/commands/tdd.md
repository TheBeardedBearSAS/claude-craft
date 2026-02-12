---
description: Bug Fix in TDD/BDD Mode
argument-hint: [arguments]
---

# Bug Fix in TDD/BDD Mode

You are a senior developer expert in TDD (Test-Driven Development) and BDD (Behavior-Driven Development). You must fix a bug strictly following the TDD/BDD methodology: first write a failing test reproducing the bug, then fix the code to make the test pass.

## Arguments
$ARGUMENTS

Arguments:
- Bug description or ticket link
- (Optional) Affected file or module

Example: `/common:fix-bug-tdd "User cannot log out"` or `/common:fix-bug-tdd #123`

## MISSION

### TDD/BDD Philosophy

```
RED → GREEN → REFACTOR

1. RED    : Write a failing test (reproduces the bug)
2. GREEN  : Write minimum code to make the test pass
3. REFACTOR : Improve code without breaking tests
```

### Step 1: Understand the Bug

#### Gather information
- Precise description of current behavior
- Expected behavior
- Reproduction steps
- Affected environment
- Available logs/stack traces

#### Questions to ask
1. What is the current behavior?
2. What should be the correct behavior?
3. When was the bug introduced? (git bisect if necessary)
4. What are the edge cases?
5. Are there existing tests that should have caught this bug?

### Step 2: RED - Write the Failing Test

#### BDD Format (Gherkin-style)

```gherkin
Feature: [Affected feature]
  As a [user type]
  I want [action]
  In order to [benefit]

  Scenario: [Bug case description]
    Given [context/initial state]
    When [action that triggers the bug]
    Then [expected behavior that currently doesn't occur]
```

#### Unit Test

```python
# Python - pytest
class TestBugFix:
    """
    Bug: [Short description]
    Ticket: #XXX

    Current behavior: [what happens]
    Expected behavior: [what should happen]
    """

    def test_should_[expected_behavior]_when_[condition](self):
        # Arrange - Prepare context
        # ...

        # Act - Execute action that causes the bug
        # ...

        # Assert - Verify expected behavior
        # This test MUST fail before the fix
        assert result == expected_value
```

```typescript
// TypeScript - Jest
describe('Bug #XXX: [Description]', () => {
  /**
   * Current behavior: [what happens]
   * Expected behavior: [what should happen]
   */
  it('should [expected behavior] when [condition]', () => {
    // Arrange
    const input = prepareTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert - This test MUST fail before the fix
    expect(result).toBe(expectedValue);
  });
});
```

```php
// PHP - PHPUnit
/**
 * @testdox Bug #XXX: [Bug description]
 */
class BugFixTest extends TestCase
{
    /**
     * Current behavior: [what happens]
     * Expected behavior: [what should happen]
     *
     * @test
     */
    public function it_should_expected_behavior_when_condition(): void
    {
        // Arrange
        $input = $this->prepareTestData();

        // Act
        $result = $this->service->methodUnderTest($input);

        // Assert - This test MUST fail before the fix
        $this->assertEquals($expectedValue, $result);
    }
}
```

```dart
// Dart - Flutter test
group('Bug #XXX: [Description]', () {
  /// Current behavior: [what happens]
  /// Expected behavior: [what should happen]
  test('should [expected behavior] when [condition]', () {
    // Arrange
    final input = prepareTestData();

    // Act
    final result = functionUnderTest(input);

    // Assert - This test MUST fail before the fix
    expect(result, equals(expectedValue));
  });
});
```

### Step 3: Verify the Test Fails

```bash
# Run specific test
# Python
pytest tests/test_bug_xxx.py -v

# JavaScript/TypeScript
npm test -- --testPathPattern="bug-xxx"

# PHP
./vendor/bin/phpunit --filter "it_should_expected_behavior"

# Flutter
flutter test test/bug_xxx_test.dart
```

**IMPORTANT**: The test MUST fail at this stage. If the test passes, it means:
- The test doesn't correctly reproduce the bug
- The bug has already been fixed
- The test is poorly written

### Step 4: GREEN - Fix the Bug (Minimum Code)

#### Principles
1. Write the MINIMUM code to make the test pass
2. Don't anticipate other cases
3. Don't refactor yet
4. Keep code simple

#### Process
1. Identify root cause
2. Implement minimal fix
3. Rerun the test
4. Ensure the test passes

```bash
# Rerun test after fix
# The test MUST now pass
```

### Step 5: Verify Non-Regression

```bash
# Run ALL existing tests
# Python
pytest

# JavaScript/TypeScript
npm test

# PHP
./vendor/bin/phpunit

# Flutter
flutter test

# ALL tests must pass
```

### Step 6: REFACTOR - Improve the Code

#### Refactoring Checklist
- [ ] Is the code readable?
- [ ] Is there duplication?
- [ ] Are names explicit?
- [ ] Does the function do one thing?
- [ ] Does the code respect project conventions?

#### After each modification
```bash
# Rerun tests after each refactoring
# Tests must always pass
```

### Step 7: Add Complementary Tests

#### Edge cases to cover
```python
class TestBugFixEdgeCases:
    """Complementary tests for edge cases."""

    def test_with_empty_input(self):
        """Verify behavior with empty input."""
        pass

    def test_with_null_input(self):
        """Verify behavior with null."""
        pass

    def test_with_maximum_values(self):
        """Verify behavior at limits."""
        pass

    def test_with_special_characters(self):
        """Verify behavior with special characters."""
        pass
```

### Step 8: Documentation

#### Comment in test
```python
def test_logout_clears_session_bug_123(self):
    """
    Regression test for bug #123.

    Problem: User session was not cleared on logout, allowing
             access to protected resources after logout.

    Root cause: Session.destroy() was not called in logout handler.

    Fix: Added Session.destroy() call before redirect.

    Date: 2024-01-15
    Author: developer@example.com
    """
```

#### Commit message
```
fix(auth): clear session on logout (#123)

- Add regression test for logout bug
- Call Session.destroy() in logout handler
- Verify session is cleared before redirect

Fixes #123
```

### Final Report

```
══════════════════════════════════════════════════════════════
🐛 BUG FIX REPORT - TDD/BDD
══════════════════════════════════════════════════════════════

Ticket: #XXX
Description: [Bug description]

──────────────────────────────────────────────────────────────
📋 ANALYSIS
──────────────────────────────────────────────────────────────

Current behavior:
[What was happening]

Expected behavior:
[What should happen]

Root cause:
[Why the bug occurred]

──────────────────────────────────────────────────────────────
🔴 TEST WRITTEN (RED)
──────────────────────────────────────────────────────────────

File: tests/test_xxx.py
Test: test_should_xxx_when_yyy

```python
def test_should_xxx_when_yyy(self):
    # ... test code
```

Initial result: ❌ FAIL
Message: AssertionError: expected X but got Y

──────────────────────────────────────────────────────────────
🟢 FIX (GREEN)
──────────────────────────────────────────────────────────────

Modified file: src/module/file.py
Lines: 45-52

```python
# Before
def problematic_function():
    # buggy code

# After
def problematic_function():
    # fixed code
```

Result after fix: ✅ PASS

──────────────────────────────────────────────────────────────
♻️ REFACTORING
──────────────────────────────────────────────────────────────

- [x] Code simplified
- [x] Variable renamed for clarity
- [x] Duplication removed

──────────────────────────────────────────────────────────────
✅ TESTS
──────────────────────────────────────────────────────────────

| Test | Status |
|------|--------|
| test_should_xxx_when_yyy (new) | ✅ |
| test_existing_1 | ✅ |
| test_existing_2 | ✅ |
| ... | ✅ |

Total: XX tests, 0 failures

──────────────────────────────────────────────────────────────
📝 COMMIT
──────────────────────────────────────────────────────────────

```
fix(module): short description (#XXX)

- Add regression test
- Fix root cause
- Add edge case tests

Fixes #XXX
```

──────────────────────────────────────────────────────────────
🎯 POST-FIX ACTIONS
──────────────────────────────────────────────────────────────

- [ ] PR created
- [ ] Code review requested
- [ ] Documentation updated
- [ ] Ticket closed
```
