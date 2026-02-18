---
description: Validate Tech Spec against quality gate (≥90%)
argument-hint: [techspec-file]
---

# Validate Tech Spec Gate

Validate a Technical Specification against the Tech Spec quality gate.
The Tech Spec must score at least 90% to pass.

## Arguments

$ARGUMENTS (format: [techspec-file])
- **techspec-file** (optional): Path to Tech Spec file. Default: `docs/tech-spec.md`

## Gate Criteria

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Architecture Overview | 12% | Yes | System design description |
| Architecture Diagram | 10% | Yes | Visual representation |
| Components | 12% | Yes | Module/service definitions |
| Data Model | 10% | Yes | Database/entity design |
| API Contracts | 10% | Yes | Endpoint specifications |
| Security | 12% | Yes | Auth and security measures |
| Performance | 8% | No | Performance requirements |
| Error Handling | 8% | No | Error strategy |
| Testing Strategy | 10% | Yes | Test approach |
| Deployment | 8% | No | CI/CD and release |

**Threshold: 90%**

## Process

### Step 1: Locate Tech Spec file

1. Use provided path or default `docs/tech-spec.md`
2. Verify file exists
3. Load content for analysis

### Step 2: Validate each criterion

For each criterion:
- Check for relevant sections and keywords
- Verify diagrams exist (mermaid, images)
- Validate technical depth

### Step 3: Calculate score

Score = sum of passed criterion weights

### Step 4: Generate report

Show detailed results with suggestions.

## Output Format

### Passing Tech Spec

```
═══════════════════════════════════════════════════════
          Tech Spec Quality Gate Validation
═══════════════════════════════════════════════════════

File: docs/tech-spec.md
Threshold: 90%

Validation Results:
──────────────────────────────────────────────────────
✅ Architecture Overview (12%)
   Found: Clean Architecture with 4 layers described

✅ Architecture Diagram (10%)
   Found: Mermaid diagram in "System Design" section

✅ Components (12%)
   Found: 6 components with responsibilities defined

✅ Data Model (10%)
   Found: Entity definitions with relationships

✅ API Contracts (10%)
   Found: REST endpoints with request/response schemas

✅ Security (12%)
   Found: JWT auth, RBAC, encryption at rest

✅ Performance (8%)
   Found: Latency targets, caching strategy

✅ Error Handling (8%)
   Found: Error codes, retry policies

✅ Testing Strategy (10%)
   Found: Unit, integration, e2e test plans

✅ Deployment (8%)
   Found: CI/CD pipeline, blue-green deployment

Score: 100/100 (100%)
──────────────────────────────────────────────────────

✅ TECH SPEC GATE PASSED

Ready to proceed to Backlog creation.
Next: /arch:handoff po
═══════════════════════════════════════════════════════
```

### Failing Tech Spec

```
═══════════════════════════════════════════════════════
          Tech Spec Quality Gate Validation
═══════════════════════════════════════════════════════

File: docs/tech-spec.md
Threshold: 90%

Validation Results:
──────────────────────────────────────────────────────
✅ Architecture Overview (12%)
❌ Architecture Diagram (10%)
   Missing: No diagram found (mermaid, PNG, SVG)
✅ Components (12%)
✅ Data Model (10%)
⚠️ API Contracts (10%)
   Partial: Endpoints listed but no schemas
❌ Security (12%)
   Missing: No authentication/authorization defined
✅ Performance (8%)
✅ Error Handling (8%)
✅ Testing Strategy (10%)
⚠️ Deployment (8%)
   Partial: CI mentioned but no CD strategy

Score: 68/100 (68%)
──────────────────────────────────────────────────────

❌ TECH SPEC GATE FAILED (need 90%, got 68%)

Required Actions:
──────────────────────────────────────────────────────
1. Add architecture diagram
   ```mermaid
   graph TB
     Client --> API[API Gateway]
     API --> Service[Business Logic]
     Service --> DB[(Database)]
   ```

2. Define security strategy
   - Authentication method (JWT, OAuth2)
   - Authorization model (RBAC, ABAC)
   - Data encryption approach

3. Complete API contracts with schemas
   - Request/response JSON schemas
   - Error response formats
   - Versioning strategy

4. Add deployment strategy
   - CI/CD pipeline stages
   - Environment promotion
   - Rollback procedures

Re-run after fixes: /gate:validate-techspec
═══════════════════════════════════════════════════════
```

## Example

```
/gate:validate-techspec
/gate:validate-techspec docs/auth-tech-spec.md
```

## Architecture Review

Consider creating an ADR for significant decisions:
```
/arch:adr "JWT vs Session-based authentication"
```

Gate configuration: `.bmad/gates/techspec-gate.yaml`

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  If PASS (≥ threshold):                                  ║
║  → /gate:validate-backlog                                ║
║    Validate the backlog                                  ║
║                                                          ║
║  If FAIL (< threshold):                                  ║
║  → Correct the tech spec issues                          ║
║  → /gate:validate-techspec (re-run after corrections)    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
