# Code Review Checklist

## Before Starting the Review

- [ ] I have read the PR description
- [ ] I understand the objective of the changes
- [ ] I have checked the related tickets
- [ ] I have the necessary context to review

---

## Review Checklist

### 1. Design & Architecture

- [ ] Changes are consistent with existing architecture
- [ ] Responsibilities are well separated (SRP)
- [ ] No strong coupling introduced
- [ ] Abstractions are at the right level
- [ ] Patterns used are appropriate
- [ ] No over-engineering

### 2. Code Quality

#### Readability
- [ ] Code is easy to read and understand
- [ ] Variable/function names are explicit
- [ ] Functions do one thing
- [ ] Functions have a reasonable length (< 50 lines)
- [ ] Code is self-documented

#### Maintainability
- [ ] Code is easily modifiable
- [ ] No duplicated code
- [ ] Magic numbers are avoided (named constants)
- [ ] Dependencies are managed correctly

#### Standards
- [ ] Naming conventions are respected
- [ ] Formatting is correct (linter)
- [ ] Imports are organized
- [ ] No unnecessary commented code
- [ ] No TODO without associated ticket

### 3. Logic & Functionality

- [ ] Business logic is correct
- [ ] Edge cases are handled
- [ ] Boundary conditions are verified
- [ ] No obvious bugs
- [ ] Expected behavior is implemented

### 4. Error Handling

- [ ] Errors are handled appropriately
- [ ] Error messages are clear and useful
- [ ] Exceptions are used correctly
- [ ] Failure cases are covered
- [ ] Appropriate logging on error

### 5. Security

- [ ] No SQL injection possible
- [ ] No XSS possible
- [ ] No secrets in the code
- [ ] User input validation
- [ ] Authorization verified if necessary
- [ ] Sensitive data protected

### 6. Performance

- [ ] No N+1 queries
- [ ] No expensive operations in loops
- [ ] Indexes used correctly
- [ ] Appropriate caching
- [ ] No memory leaks
- [ ] Acceptable algorithmic complexity

### 7. Tests

- [ ] Unit tests present and relevant
- [ ] Tests cover nominal cases
- [ ] Tests cover error cases
- [ ] Tests are readable
- [ ] Tests are independent
- [ ] No flaky tests

### 8. Documentation

- [ ] Code self-documented or commented if complex
- [ ] API documented if public
- [ ] README updated if necessary
- [ ] Configuration changes documented

---

## Comment Types

### Blocking (❌)
Must be fixed before merge.
```
❌ This query can cause SQL injection
```

### Important (⚠️)
Should be fixed, unless justified.
```
⚠️ This function could benefit from extraction
```

### Suggestion (💡)
Possible improvement, not mandatory.
```
💡 We could simplify this condition
```

### Question (❓)
Request for clarification.
```
❓ Why this implementation choice?
```

### Positive (✅)
Positive feedback on the code.
```
✅ Good use of pattern here!
```

---

## Reviewer Best Practices

1. **Be constructive** - Criticize the code, not the person
2. **Be precise** - Give examples or suggestions
3. **Be respectful** - Use a benevolent tone
4. **Be responsive** - Respond quickly to discussions
5. **Be consistent** - Apply the same standards to everyone

## Author Best Practices

1. **Provide context** - Clear PR description
2. **Small PRs** - Easier to review
3. **Self-review** - Reread before requesting a review
4. **Respond to comments** - Don't ignore
5. **Learn** - Use feedback to improve

---

## Review Decision

- [ ] **Approved** - Ready to merge
- [ ] **Request changes** - Changes needed
- [ ] **Comment** - Questions or suggestions without blocking
