# Definition of Done (DoD)

## General Checklist

A task is considered "Done" when ALL the following criteria are met:

### Code

- [ ] Code is written and follows project conventions
- [ ] Code compiles without errors or warnings
- [ ] Code has passed code review
- [ ] Code is merged into main branch
- [ ] Merge conflicts are resolved

### Tests

- [ ] Unit tests written and passing (coverage > 80%)
- [ ] Integration tests written and passing
- [ ] E2E tests passing (if applicable)
- [ ] Regression tests passing
- [ ] Manual tests performed and validated

### Documentation

- [ ] Technical documentation updated (if necessary)
- [ ] User documentation updated (if necessary)
- [ ] Comments in code for complex parts
- [ ] README updated if new setup required
- [ ] CHANGELOG updated

### Quality

- [ ] Static analysis passed (linter, type-checker)
- [ ] No technical debt introduced (or documented if unavoidable)
- [ ] Code review approved by at least 1 developer
- [ ] Performance verified (no degradation)
- [ ] Security verified (OWASP)

### Deployment

- [ ] CI/CD build passing
- [ ] Deployed to staging environment
- [ ] Tested in staging
- [ ] Production configuration ready
- [ ] Rollback plan documented (if applicable)

### Business Validation

- [ ] Acceptance criteria validated
- [ ] Demo to Product Owner (if applicable)
- [ ] Feedback integrated

---

## DoD by Task Type

### Bug Fix

- [ ] Bug reproduced and documented
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Non-regression test added
- [ ] Tested on affected environments

### New Feature

- [ ] User story understood and validated
- [ ] Design/UX validated (if applicable)
- [ ] Complete implementation
- [ ] Comprehensive tests
- [ ] Feature flag if necessary
- [ ] Analytics/tracking configured (if applicable)

### Refactoring

- [ ] Refactoring scope defined
- [ ] Existing tests still passing
- [ ] No behavior change
- [ ] Equal or better performance
- [ ] Thorough code review

### Technical Task

- [ ] Technical objective achieved
- [ ] Complete technical documentation
- [ ] Impact on other components verified
- [ ] Migration plan if necessary

---

## Exceptions

Exceptions to the DoD must be:
1. Documented in the ticket
2. Approved by the Tech Lead
3. Followed by a technical debt ticket

---

## Revision

This Definition of Done is reviewed at each sprint retrospective if necessary.

Last updated: YYYY-MM-DD
