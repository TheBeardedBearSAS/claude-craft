# Architecture Decision Record (ADR)

You are a senior software architect. You must create an Architecture Decision Record (ADR) to document an important technical decision.

## Arguments
$ARGUMENTS

Arguments:
- Decision title
- (Optional) ADR number

Example: `/common:architecture-decision "Choice of PostgreSQL for main database"`

## MISSION

### Step 1: Gather Information

Ask key questions:
1. What problem are we trying to solve?
2. What are the constraints?
3. What options have we considered?
4. Why this option over another?

### Step 2: Create the ADR File

Location: `docs/architecture/decisions/` or `docs/adr/`

Naming: `NNNN-title-in-kebab-case.md`

### Step 3: Write the ADR

ADR Template (Michael Nygard format):

```markdown
# ADR-{NNNN}: {Title}

**Date**: {YYYY-MM-DD}
**Status**: {Proposed | Accepted | Deprecated | Superseded by ADR-XXXX}
**Deciders**: {Names of people involved}

## Context

{Describe the forces at play, including technological, political,
social, and project-related forces. These forces are likely in tension,
and should be called out as such. The language in this section is
value-neutral - we are simply describing facts.}

### Current Situation

{Description of the current state of the system/project}

### Problem

{Clear description of the problem to solve}

### Constraints

- {Constraint 1}
- {Constraint 2}
- {Constraint 3}

## Options Considered

### Option 1: {Name}

{Description of the option}

**Advantages**:
- {Advantage 1}
- {Advantage 2}

**Disadvantages**:
- {Disadvantage 1}
- {Disadvantage 2}

**Estimated Effort**: {Low | Medium | High}

### Option 2: {Name}

{Description of the option}

**Advantages**:
- {Advantage 1}
- {Advantage 2}

**Disadvantages**:
- {Disadvantage 1}
- {Disadvantage 2}

**Estimated Effort**: {Low | Medium | High}

### Option 3: {Name}

{Description of the option}

**Advantages**:
- {Advantage 1}
- {Advantage 2}

**Disadvantages**:
- {Disadvantage 1}
- {Disadvantage 2}

**Estimated Effort**: {Low | Medium | High}

## Decision

{We have decided to use **Option X** because...}

### Justification

{Detailed explanation of why this option was chosen over
others. Include accepted trade-offs.}

## Consequences

### Positive

- {Positive consequence 1}
- {Positive consequence 2}

### Negative

- {Negative consequence 1}
- {Negative consequence 2}

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| {Risk 1} | Low/Medium/High | Low/Medium/High | {Action} |
| {Risk 2} | Low/Medium/High | Low/Medium/High | {Action} |

## Implementation Plan

### Phase 1: {Title}
- [ ] {Task 1}
- [ ] {Task 2}

### Phase 2: {Title}
- [ ] {Task 3}
- [ ] {Task 4}

## Success Metrics

- {Metric 1}: {Target value}
- {Metric 2}: {Target value}

## References

- {Link to documentation}
- {Link to comparison study}
- {Related ADRs}

---

## History

| Date | Action | By |
|------|--------|-----|
| {YYYY-MM-DD} | Created | {Name} |
| {YYYY-MM-DD} | Accepted | {Team} |
```

### Step 4: Complete ADR Example

```markdown
# ADR-0012: Choice of PostgreSQL for Main Database

**Date**: 2024-01-15
**Status**: Accepted
**Deciders**: John Doe (Tech Lead), Mary Smith (DBA), Peter Johnson (CTO)

## Context

### Current Situation

Our application currently uses MySQL 5.7 hosted on a dedicated server.
The database contains 50 tables, 10 million rows in the main table,
and handles 1000 queries/second at peak.

### Problem

1. MySQL 5.7 is reaching end-of-life (EOL)
2. Growing need for complex JSON queries
3. Limited full-text search capabilities
4. No native support for geospatial types

### Constraints

- Limited infrastructure budget
- Migration must be transparent to users
- Team familiar with MySQL, not with PostgreSQL
- Migration time: maximum 3 months

## Options Considered

### Option 1: Upgrade to MySQL 8.0

Stay on MySQL by upgrading to version 8.0.

**Advantages**:
- No schema migration
- Team already trained
- Minimal risk

**Disadvantages**:
- JSON queries still less performant
- No native French full-text search
- Less mature geospatial extension

**Estimated Effort**: Low

### Option 2: Migrate to PostgreSQL 16

Migrate to PostgreSQL with all modern features.

**Advantages**:
- Very performant JSONB
- Full-text search with French dictionaries
- PostGIS for geospatial
- Very active community
- Rich extensions (pg_trgm, uuid-ossp, etc.)

**Disadvantages**:
- Migration required
- Team training needed
- Minor SQL syntax changes

**Estimated Effort**: Medium

### Option 3: NoSQL Database (MongoDB)

Migrate to a document database for more flexibility.

**Advantages**:
- Flexible schema
- Good for native JSON
- Horizontal scalability

**Disadvantages**:
- Loss of relational constraints
- Massive code migration
- Complex transactions
- Untrained team

**Estimated Effort**: High

## Decision

We have decided to use **PostgreSQL 16** because:

### Justification

1. **JSON Performance**: PostgreSQL's JSONB outperforms MySQL for our
   use cases of storing user metadata.

2. **Full-text search**: Native French dictionary avoids installing
   Elasticsearch for search.

3. **PostGIS**: Our new geolocation features will be
   simpler to implement.

4. **Maturity**: PostgreSQL is the most advanced open-source RDBMS,
   with a very active community.

5. **Doctrine Compatibility**: Our ORM perfectly supports PostgreSQL.

## Consequences

### Positive

- JSON queries 3x faster (internal benchmark)
- Full-text search without additional infrastructure
- Native geospatial features
- Better support for data types (UUID, arrays, etc.)

### Negative

- 2 weeks of team training
- Data migration estimated at 4h downtime
- Some queries to adapt (LIMIT/OFFSET syntax)

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance regression | Low | Medium | Load tests before migration |
| Data loss | Very low | Critical | Backup + dry-run |
| Post-migration bugs | Medium | Low | 2-week stabilization period |

## Implementation Plan

### Phase 1: Preparation (Week 1-2)
- [x] PostgreSQL team training
- [x] Setup PostgreSQL dev environment
- [x] Adapt unit tests

### Phase 2: Code Migration (Week 3-4)
- [ ] Adapt native SQL queries
- [ ] Configure Doctrine for PostgreSQL
- [ ] Complete integration tests

### Phase 3: Data Migration (Week 5)
- [ ] pgloader migration script
- [ ] Dry-run on production copy
- [ ] Production migration (weekend)

### Phase 4: Stabilization (Week 6-8)
- [ ] Performance monitoring
- [ ] Bug fixes if any
- [ ] Documentation updated

## Success Metrics

- API response time: ≤ current (100ms P95)
- JSON queries: -50% execution time
- Post-migration uptime: 99.9%

## References

- [PostgreSQL vs MySQL JSON Benchmark](internal-wiki/benchmarks)
- [Doctrine Migration Guide](internal-wiki/migration-guide)
- ADR-0008: Choice of Doctrine ORM
```

### Step 5: Create ADR Index

```markdown
# Architecture Decision Records

This folder contains the project's ADRs.

## Index

| # | Title | Status | Date |
|---|-------|--------|------|
| [ADR-0001](0001-use-clean-architecture.md) | Adoption of Clean Architecture | Accepted | 2023-06-15 |
| [ADR-0012](0012-postgresql-database.md) | PostgreSQL Choice | Accepted | 2024-01-15 |
| [ADR-0013](0013-api-versioning.md) | API Versioning Strategy | Proposed | 2024-01-20 |

## Statuses

- **Proposed**: Under discussion
- **Accepted**: Decision validated
- **Deprecated**: No longer relevant
- **Superseded**: Replaced by another ADR
```

## Recommended Structure

```
docs/
└── architecture/
    └── decisions/
        ├── README.md           # ADR index
        ├── 0001-*.md
        ├── 0002-*.md
        └── templates/
            └── adr-template.md
```
