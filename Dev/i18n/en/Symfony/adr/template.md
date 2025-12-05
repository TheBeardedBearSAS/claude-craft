# ADR-NNNN: [Short Decision Title]

**Status**: Proposed | Accepted | Deprecated | Superseded by [ADR-YYYY](YYYY-title.md)

**Date**: YYYY-MM-DD

**Deciders**: [List of people who made the decision]

**Tags**: `tag1`, `tag2`, `tag3`

---

## Context and Problem

[Describe the context and problem that requires an architectural decision. Use 2-3 paragraphs to explain:]
- What is the current situation?
- What problem are we facing?
- What are the constraints (technical, business, regulatory)?
- Why now? (urgency, opportunity)

## Options Considered

**Important**: Minimum 2 options must be documented to demonstrate comparative analysis.

### Option 1: [Option Name]

**Description**: [Short description of the option]

**Pros**:
- ✅ [Advantage 1]
- ✅ [Advantage 2]
- ✅ [Advantage 3]

**Cons**:
- ❌ [Disadvantage 1]
- ❌ [Disadvantage 2]
- ❌ [Disadvantage 3]

**Effort**: [Estimate: Low / Medium / High]

---

### Option 2: [Option Name]

**Description**: [Short description of the option]

**Pros**:
- ✅ [Advantage 1]
- ✅ [Advantage 2]

**Cons**:
- ❌ [Disadvantage 1]
- ❌ [Disadvantage 2]

**Effort**: [Estimate: Low / Medium / High]

---

### Option 3: [Option Name] (Optional)

**Description**: [Short description of the option]

**Pros**:
- ✅ [Advantage 1]

**Cons**:
- ❌ [Disadvantage 1]

**Effort**: [Estimate]

---

## Decision

**Chosen option**: [Name of chosen option]

**Justification**:

[Explain WHY this option was chosen. Use 2-4 paragraphs covering:]
- Why is this option superior to others?
- What criteria were decisive? (performance, maintainability, cost, compliance)
- What assumptions underlie this decision?
- How does this decision align with the overall vision/strategy?

**Decision criteria**:
1. [Criterion 1 and its importance]
2. [Criterion 2 and its importance]
3. [Criterion 3 and its importance]

---

## Consequences

### Positive ✅

- **[Positive consequence 1]**: [Explanation]
- **[Positive consequence 2]**: [Explanation]
- **[Positive consequence 3]**: [Explanation]

### Negative ⚠️

**Be honest**: Every decision has trade-offs. Document them clearly.

- **[Negative consequence 1]**: [Explanation + mitigation if possible]
- **[Negative consequence 2]**: [Explanation + mitigation if possible]
- **[Negative consequence 3]**: [Explanation + mitigation if possible]

### Identified Risks 🔴

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk description 1] | High/Medium/Low | High/Medium/Low | [Mitigation actions] |
| [Risk description 2] | High/Medium/Low | High/Medium/Low | [Mitigation actions] |

---

## Implementation

### Affected Files

**To create**:
- `path/to/file1.php` - [Description]
- `path/to/file2.yaml` - [Description]

**To modify**:
- `path/to/file3.php` - [What changes]
- `path/to/file4.yaml` - [What changes]

**To delete**:
- `path/to/old-file.php` - [Reason]

### Dependencies

**Composer**:
```bash
composer require vendor/package:^version
```

**NPM**:
```bash
npm install package@version
```

**Configuration**:
- Environment variable: `VARIABLE_NAME` (.env)
- Symfony service to configure
- Doctrine migration to create

### Code Example

```php
<?php
// Concrete example from the project (NOT generic)
namespace App\Infrastructure\...;

class ExampleImplementation
{
    public function exampleMethod(): void
    {
        // Concrete code showing usage
    }
}
```

**Usage**:
```php
// In an entity, service, etc.
$example = new ExampleImplementation();
$example->exampleMethod();
```

---

## Validation and Tests

### Acceptance Criteria

- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]

### Required Tests

**Unit tests**:
- `tests/Unit/...Test.php` - [What is tested]

**Integration tests**:
- `tests/Integration/...Test.php` - [What is tested]

**Functional tests**:
- `tests/Functional/...Test.php` - [What is tested]

### Success Metrics

| Metric | Before | Target | How to measure |
|--------|--------|--------|----------------|
| [Metric 1] | [Value] | [Value] | [Tool/Command] |
| [Metric 2] | [Value] | [Value] | [Tool/Command] |

---

## References

### Internal Rules
- [Rule `.claude/rules/XX-name.md`](./../rules/XX-name.md) - [Description]
- [Template `.claude/templates/name.md`](./../templates/name.md) - [Description]

### External Documentation
- [Documentation title](https://url.com) - [Description]
- [Relevant article/blog](https://url.com) - [Description]

### Related ADRs
- [ADR-XXXX: Title](XXXX-title.md) - [Relationship: depends on / replaces / complements]

### Source Code
- Implementation: `src/path/to/file.php:line`
- Tests: `tests/path/to/test.php:line`
- Configuration: `config/packages/package.yaml`

---

## Modification History

| Date | Author | Modification |
|------|--------|--------------|
| YYYY-MM-DD | [Name] | Initial creation |
| YYYY-MM-DD | [Name] | [Modification description] |

---

## Additional Notes

[Optional section for additional information that doesn't fit in previous sections:]
- Important discussions leading to the decision
- Additional historical context
- References to POCs or experiments
- Post-implementation feedback (to add after production deployment)
