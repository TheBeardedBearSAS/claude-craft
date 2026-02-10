# Mandatory Analysis Workflow

## Fundamental Principle

**BEFORE any code modification (feature, bugfix, refactoring), a thorough analysis phase is MANDATORY.**

This rule is CRITICAL and NON-NEGOTIABLE. It prevents:
- Regressions
- Unexpected side effects
- Technical debt
- Production bugs

---

## 4-Step Process

### Step 1: Understand the Request

**Questions to ask yourself:**
1. What is the precise objective?
2. What are the acceptance criteria?
3. Are there any constraints (performance, security, compliance)?
4. What is the user impact?

**Actions:**
- Rephrase the request for validation
- Identify the relevant use cases
- Verify alignment with business objectives

### Step 2: Analyze the Existing Code

**Files to read MANDATORILY:**
1. The files directly affected by the modification
2. The dependent files (that use the modified code)
3. The existing tests (to understand expected behavior)
4. The schema migrations (if there is a database impact)

**Points of vigilance:**
- Are there tests that will break?
- Are there other modules that depend on this code?
- Does the code comply with the project architecture?
- Is there any sensitive data involved?

### Step 3: Document the Analysis

**Mandatory content:**

1. **Objective**: Clear description of the modification
2. **Impacted files**: Exhaustive list with justification
3. **Impacts**:
   - Breaking changes: yes/no
   - DB migration needed: yes/no
   - Performance impact: yes/no
   - Sensitive data: yes/no
4. **Risks**: List + mitigations
5. **Approach**: Implementation strategy (TDD, progressive refactoring, etc.)
6. **TDD Tests**: List of tests to write BEFORE implementation

**Example:**

```markdown
## Analysis: Adding a notification feature

### Objective
Send an email notification when an order is created.

### Impacted files
- OrderService (add event dispatch)
- NotificationListener (new)
- EmailService (existing usage)
- Unit tests for the listener

### Impacts
- Breaking change: NO
- DB migration: NO
- Performance: Low (async recommended)
- Sensitive data: User email (already handled)

### Risks
1. Email overload -> Mitigation: async queue
2. Email in spam -> Mitigation: DKIM/SPF configuration

### Approach
1. TDD: write listener tests
2. Implement the listener
3. Dispatch the event from OrderService
4. Integration testing

### TDD Tests
1. test_should_send_email_on_order_created()
2. test_should_not_send_if_user_opted_out()
3. test_should_handle_email_failure_gracefully()
```

### Step 4: Validation

**Decision criteria:**

| Impact | Action |
|--------|--------|
| **Low** (1 file, no breaking change, < 1h) | Proceed directly |
| **Medium** (2-5 files, DB migration, < 4h) | Validate with the user |
| **High** (> 5 files, breaking changes, architecture refactoring) | Detailed planning + mandatory validation |

**Validation questions:**
- Does the approach comply with the project architecture?
- Are the TDD tests sufficient?
- Is there a simpler alternative (KISS)?
- Are the risks acceptable?

---

## Anti-Patterns to Avoid

### Do not code without reading existing code

```
// BAD: modification without understanding the impact
function updateOrder(order) {
  order.status = "confirmed"  // Warning: impact on other modules?
}
```

### Do not ignore dependencies

```
// BAD: modification without checking who uses this method
function getPrice() {
  return this.price * 0.8  // Warning: who calls getPrice()?
}
```

### Do not forget tests

```
// BAD: not checking existing tests
// If I modify User, which tests will break?
```

### Do not ignore security

```
// BAD: adding a sensitive field without protection
class User {
  socialSecurityNumber: string  // Warning: sensitive data!
}
```

---

## Quick Checklist

Before any modification:

- [ ] I have read and understood the request
- [ ] I have read the relevant files
- [ ] I have identified the dependencies
- [ ] I have documented the analysis
- [ ] I have assessed the risks
- [ ] I have defined the TDD tests
- [ ] I have validated the approach (if medium/high impact)
- [ ] I have verified architecture + SOLID compliance
- [ ] I have verified security if sensitive data is involved

---

## Visual Workflow

```
+-------------------------------------------------------------+
|                    REQUEST RECEIVED                           |
+-----------------------------+-------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|             STEP 1: UNDERSTAND                               |
|  - Precise objective?                                        |
|  - Acceptance criteria?                                      |
|  - Constraints?                                              |
+-----------------------------+-------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|             STEP 2: ANALYZE                                  |
|  - Read the relevant files                                   |
|  - Identify dependencies                                     |
|  - Check existing tests                                      |
+-----------------------------+-------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|             STEP 3: DOCUMENT                                 |
|  - Impacted files                                            |
|  - Risks + mitigations                                       |
|  - TDD tests to write                                        |
+-----------------------------+-------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|             STEP 4: VALIDATE                                 |
|  - Low impact -> Proceed                                     |
|  - Medium/high impact -> Request validation                  |
+-----------------------------+-------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    IMPLEMENT                                  |
|  1. Write the tests (RED)                                    |
|  2. Implement the code (GREEN)                               |
|  3. Refactor (REFACTOR)                                      |
+-------------------------------------------------------------+
```

---

## Associated Templates

- `templates/analysis.md` - Detailed analysis template
- `checklists/new-feature.md` - New feature checklist
- `checklists/refactoring.md` - Refactoring checklist

---

**Last updated:** 2025-01
**Version:** 1.0.0
**Author:** The Bearded CTO
