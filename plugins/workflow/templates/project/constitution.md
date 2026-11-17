# Project Constitution

## Document Information
| Field | Value |
|-------|-------|
| **Project** | {project_name} |
| **Version** | {version} |
| **Date** | {date} |
| **Author** | {author} |
| **Status** | Draft / Ratified |

---

## 1. Vision & Mission

### 1.1 Product Vision
{One-sentence vision statement}

### 1.2 Mission Statement
{What the product does, for whom, and why}

### 1.3 Non-Negotiable Objectives
- {objective_1}
- {objective_2}

---

## 2. Technical Constraints

### 2.1 Technology Stack
| Layer | Technology | Version | Locked |
|-------|-----------|---------|--------|
| {layer} | {tech} | {version} | Yes/No |

### 2.2 Architecture Pattern
- **Pattern**: {pattern} (e.g., Clean Architecture, Hexagonal, MVC)
- **Justification**: {why}

### 2.3 Infrastructure Constraints
- {constraint_1}
- {constraint_2}

---

## 3. Design Principles

### 3.1 Mandatory Patterns
| Pattern | Scope | Rationale |
|---------|-------|-----------|
| {pattern} | {where} | {why} |

### 3.2 Forbidden Patterns
| Anti-Pattern | Reason | Alternative |
|-------------|--------|-------------|
| {pattern} | {why_forbidden} | {use_instead} |

### 3.3 Code Standards
- {standard_1}
- {standard_2}

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance Targets
| Metric | Target | SLA |
|--------|--------|-----|
| {metric} | {target} | {sla} |

### 4.2 Security Requirements
- {security_req_1}
- {security_req_2}

### 4.3 Compliance
| Standard | Scope | Mandatory |
|----------|-------|-----------|
| {standard} | {scope} | Yes/No |

### 4.4 Availability & Reliability
- **Uptime Target**: {target}
- **RTO**: {rto}
- **RPO**: {rpo}

---

## 5. Boundaries

### 5.1 Explicit Exclusions
- {exclusion_1}
- {exclusion_2}

### 5.2 Integration Boundaries
| System | Direction | Protocol | Owned |
|--------|-----------|----------|-------|
| {system} | In/Out/Both | {protocol} | Yes/No |

### 5.3 Team Boundaries
- {boundary_1}

---

## 6. Amendment Process

Changes to this constitution require:
1. Written proposal with justification
2. Impact analysis on existing code and specs
3. Approval from {role}
4. Version bump and changelog entry

---

## Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {date} | {author} | Initial ratification |
