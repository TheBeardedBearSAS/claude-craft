# Bug Fixing Guide

This guide covers the systematic approach to fixing bugs using Claude-Craft, from diagnosis to validation.

---

## Table of Contents

1. [Bug Fixing Workflow](#bug-fixing-workflow)
2. [Phase 1: Reproduce](#phase-1-reproduce)
3. [Phase 2: Diagnose](#phase-2-diagnose)
4. [Phase 3: Write Regression Test](#phase-3-write-regression-test)
5. [Phase 4: Fix](#phase-4-fix)
6. [Phase 5: Validate](#phase-5-validate)
7. [Phase 6: Document](#phase-6-document)
8. [Hotfix Procedures](#hotfix-procedures)
9. [Complete Example](#complete-example)

---

## Bug Fixing Workflow

The systematic approach to fixing bugs:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Reproduce│ --> │ 2. Diagnose │ --> │ 3. Test     │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 6. Document │ <-- │ 5. Validate │ <-- │ 4. Fix      │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Why This Approach?

1. **Reproduce first**: Can't fix what you can't see
2. **Test before fix**: Proves the bug exists and is fixed
3. **Validate thoroughly**: Ensures no regression
4. **Document**: Helps prevent similar bugs

---

## Phase 1: Reproduce

Before fixing, consistently reproduce the bug.

### Gather Information

Collect from bug report:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (version, OS, etc.)
- Error messages/logs
- Screenshots if applicable

### Create Reproduction Environment

```bash
# Check out the problematic version
git checkout <commit-or-tag>

# Set up identical environment
make docker-up

# Reproduce with exact steps
```

### Verify Reproduction

Can you trigger the bug consistently?

- [ ] Bug occurs with reported steps
- [ ] Bug occurs in same environment
- [ ] Bug is deterministic (not random)

### If You Can't Reproduce

```markdown
@research-assistant Help me understand why this bug might be environment-specific

Bug report:
- User sees error X when doing Y
- I cannot reproduce locally
- User is on environment Z

Possible causes?
```

---

## Phase 2: Diagnose

Find the root cause of the bug.

### Using Analysis Command

```bash
/common:analyze-bug "Users cannot login with correct credentials after password reset"
```

This command will:
1. Suggest areas to investigate
2. Identify potential causes
3. Recommend debugging steps
4. List related code areas

### Using TDD Coach for Diagnosis

```markdown
@tdd-coach Help me diagnose this authentication bug

Symptoms:
- User resets password successfully
- New password is saved (confirmed in DB)
- Login fails with "invalid credentials"
- Old password also doesn't work

What should I investigate?
```

### Debugging Techniques

#### Add Logging

```php
// Temporary debug logging
$this->logger->debug('Password verification', [
    'user_id' => $user->getId(),
    'stored_hash' => substr($user->getPasswordHash(), 0, 20) . '...',
    'verification_result' => $result,
]);
```

#### Inspect Database State

```sql
-- Check user state after password reset
SELECT id, email, password_hash, updated_at
FROM users
WHERE email = 'user@example.com';
```

#### Trace Execution Path

```php
// Add stack trace at suspicious points
debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
```

### Identify Root Cause

Common categories:
- **Logic error**: Wrong condition or calculation
- **State error**: Incorrect data state
- **Race condition**: Timing-dependent behavior
- **Integration error**: External service issue
- **Configuration error**: Wrong settings

### Diagnosis Checklist

- [ ] Bug consistently reproduced
- [ ] Error location identified
- [ ] Root cause understood
- [ ] Related code areas identified
- [ ] Fix approach determined

---

## Phase 3: Write Regression Test

Write a test that fails BEFORE the fix and passes AFTER.

### Why Test First?

1. **Proves bug exists**: Test fails with current code
2. **Proves fix works**: Test passes after fix
3. **Prevents regression**: Test catches future breaks
4. **Documents behavior**: Test describes expected behavior

### Using TDD Coach

```markdown
@tdd-coach Help me write a regression test for this bug

Bug: Password reset doesn't update the password hash correctly

Expected behavior:
- User requests password reset
- User sets new password
- User can login with new password

Actual behavior:
- Login fails after password reset
```

### Example Regression Test

```php
/**
 * @test
 * @see https://github.com/company/project/issues/123
 *
 * Bug: Users could not login after password reset
 * Root cause: Password hash was not persisted correctly
 */
public function test_user_can_login_after_password_reset(): void
{
    // Arrange: Create user with known password
    $user = $this->createUser('user@example.com', 'old-password');

    // Act: Reset password
    $this->passwordResetService->resetPassword($user, 'new-password');

    // Assert: Can login with new password
    $result = $this->authService->authenticate('user@example.com', 'new-password');

    $this->assertTrue($result->isSuccess());
    $this->assertNotNull($result->getToken());
}

/**
 * @test
 * Related: Ensure old password no longer works
 */
public function test_old_password_fails_after_reset(): void
{
    $user = $this->createUser('user@example.com', 'old-password');

    $this->passwordResetService->resetPassword($user, 'new-password');

    $result = $this->authService->authenticate('user@example.com', 'old-password');

    $this->assertFalse($result->isSuccess());
}
```

### Test Writing Checklist

- [ ] Test reproduces the bug (fails before fix)
- [ ] Test has descriptive name
- [ ] Test references issue number
- [ ] Test documents root cause in comment
- [ ] Related edge cases tested

---

## Phase 4: Fix

Implement the minimal fix for the bug.

### Fix Guidelines

1. **Minimal change**: Fix only the bug, don't refactor
2. **Clear intent**: Code should show what was wrong
3. **No side effects**: Don't change unrelated behavior
4. **Maintain style**: Match existing code patterns

### Example Fix

```php
// BEFORE (buggy)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    // Bug: Missing persist/flush!
}

// AFTER (fixed)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    $this->entityManager->persist($user);  // <-- Fix
    $this->entityManager->flush();          // <-- Fix
}
```

### Run the Regression Test

```bash
# Test should now pass
make test-unit TEST=tests/Unit/PasswordResetTest.php

# Or run specific test
./vendor/bin/phpunit --filter test_user_can_login_after_password_reset
```

### Fix Checklist

- [ ] Regression test now passes
- [ ] Fix is minimal and focused
- [ ] No unrelated changes included
- [ ] Code style maintained

---

## Phase 5: Validate

Ensure the fix doesn't break anything else.

### Run Full Test Suite

```bash
# All unit tests
make test-unit

# All integration tests
make test-integration

# Full test suite
make test
```

### Quality Checks

```bash
# Code quality (per technology)
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality

# Security (if fix touches sensitive code)
/common:security-audit

# Full compliance
/symfony:check-compliance
```

### Manual Testing

Even with automated tests, verify manually:

1. Follow original bug reproduction steps
2. Verify bug no longer occurs
3. Test related functionality
4. Check edge cases

### Using Reviewer Agent

```markdown
@symfony-reviewer Review my bug fix for issue #123

Bug: Users couldn't login after password reset
Fix: Added missing persist/flush in resetPassword()

Changed files:
- src/Application/Service/PasswordResetService.php
- tests/Unit/PasswordResetTest.php

Please check:
1. Fix is correct and complete
2. No side effects
3. Test coverage adequate
```

### Validation Checklist

- [ ] Regression test passes
- [ ] All existing tests pass
- [ ] Static analysis passes
- [ ] Manual testing confirms fix
- [ ] Code review completed

---

## Phase 6: Document

Document the fix for future reference.

### Commit Message Format

```
fix(auth): resolve login failure after password reset

Bug: Users could not login after resetting their password
Root cause: Password hash change was not persisted to database
Fix: Added persist() and flush() calls in PasswordResetService

Closes #123

Test: test_user_can_login_after_password_reset
```

### Update Issue Tracker

```markdown
## Resolution

**Root Cause:**
The `resetPassword()` method in `PasswordResetService` was updating the user's
password hash in memory but not persisting the change to the database.

**Fix:**
Added `persist()` and `flush()` calls after setting the new password hash.

**Testing:**
- Added regression test `test_user_can_login_after_password_reset`
- Added edge case test `test_old_password_fails_after_reset`

**Prevention:**
Consider adding a code review checklist item for persistence operations.
```

### Knowledge Base Entry (if recurring pattern)

```markdown
# Common Bug: Entity Changes Not Persisted

## Symptoms
- Data changes appear to work (no errors)
- Changes don't appear in database
- Changes lost after refresh

## Root Cause
Missing `persist()` and/or `flush()` calls in Doctrine.

## Fix Pattern
```php
$entity->setSomething($value);
$this->entityManager->persist($entity); // Don't forget!
$this->entityManager->flush();
```

## Prevention
- Add persistence check to code review checklist
- Consider auto-flush in service base class
```

### Documentation Checklist

- [ ] Commit message describes bug and fix
- [ ] Issue tracker updated with resolution
- [ ] Related documentation updated
- [ ] Knowledge base entry if pattern

---

## Hotfix Procedures

For critical bugs in production.

### Hotfix Workflow

```
1. Create hotfix branch from production
2. Apply minimal fix
3. Test thoroughly
4. Deploy to production
5. Merge back to main
```

### Step-by-Step

```bash
# 1. Create hotfix branch
git checkout production
git checkout -b hotfix/issue-123-login-failure

# 2. Apply fix
# ... make changes ...

# 3. Write regression test
# ... add test ...

# 4. Verify
make test
/symfony:check-compliance

# 5. Commit with clear message
git commit -m "fix(auth): resolve critical login failure after password reset

HOTFIX for production issue.
Root cause: Password hash not persisted after reset.

Closes #123"

# 6. Create PR for review
gh pr create --base production --title "HOTFIX: Login failure after password reset"

# 7. After merge, deploy
# ... deployment process ...

# 8. Merge back to main
git checkout main
git merge hotfix/issue-123-login-failure
git push origin main
```

### Hotfix Checklist

- [ ] Hotfix branch from production
- [ ] Minimal, focused fix only
- [ ] Regression test added
- [ ] All tests passing
- [ ] PR reviewed and approved
- [ ] Deployed to production
- [ ] Verified in production
- [ ] Merged back to main

---

## Complete Example

Let's walk through fixing a real bug.

### Bug Report

```
Issue #456: Order total calculated incorrectly

Steps to reproduce:
1. Add item with price $10.00, quantity 3
2. Add item with price $5.50, quantity 2
3. View cart

Expected: Total = $41.00 (30 + 11)
Actual: Total = $36.00

Environment: Production v2.3.1
Reported by: Customer support
Priority: High
```

### Step 1: Reproduce

```php
// Quick local test
$order = new Order();
$order->addItem(new Item('A', 10.00), 3);  // $30
$order->addItem(new Item('B', 5.50), 2);   // $11
echo $order->getTotal(); // Shows 36.00 - confirmed!
```

### Step 2: Diagnose

```markdown
@tdd-coach Help me find the bug in order total calculation

The total should be 41.00 but shows 36.00
Difference is 5.00, which is exactly one of item B's price

Hypothesis: quantity for second item not being counted?
```

Investigation reveals:

```php
// Bug found in Order::calculateTotal()
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // BUG: Using 1 instead of item quantity!
        $total = $total->add($item->getPrice()->multiply(1));
    }
    return $total;
}
```

### Step 3: Write Regression Test

```php
/**
 * @test
 * @see https://github.com/company/shop/issues/456
 *
 * Bug: Order total ignored item quantities
 */
public function test_order_total_includes_all_quantities(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 3);  // $30
    $order->addItem($this->createItem(5.50), 2);   // $11

    $total = $order->calculateTotal();

    $this->assertEquals(41.00, $total->getAmount());
}

/**
 * @test
 * Edge case: single item with quantity > 1
 */
public function test_single_item_quantity_multiplied(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 5);

    $this->assertEquals(50.00, $order->calculateTotal()->getAmount());
}
```

Run test - confirms it fails.

### Step 4: Fix

```php
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // Fixed: Use actual quantity from order item
        $total = $total->add(
            $item->getPrice()->multiply($item->getQuantity())
        );
    }
    return $total;
}
```

### Step 5: Validate

```bash
# Regression test passes
./vendor/bin/phpunit --filter test_order_total

# All tests pass
make test

# Quality check
/symfony:check-compliance
# Score: 94/100 ✓
```

### Step 6: Document

```bash
git commit -m "fix(order): correct total calculation to include quantities

Bug: Order total was ignoring item quantities, always using 1
Root cause: Hardcoded multiply(1) instead of multiply(quantity)
Fix: Use getQuantity() from order item in calculation

Closes #456

Regression tests added:
- test_order_total_includes_all_quantities
- test_single_item_quantity_multiplied"
```

---

## Bug Prevention Tips

1. **Write tests first**: TDD prevents many bugs
2. **Code review**: Fresh eyes catch issues
3. **Static analysis**: Tools find common errors
4. **Integration tests**: Catch interaction bugs
5. **Monitor production**: Catch issues early
6. **Use `/loop`**: Set up recurring quality checks (e.g., `/loop 5m /common:pre-commit-check`)
7. **Save learnings**: Use `/memory` to persist bug patterns across sessions

---

[&larr; Feature Development](03-feature-development.md) | [Tools Reference &rarr;](05-tools-reference.md)
