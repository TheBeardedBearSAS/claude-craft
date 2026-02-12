---
name: workflow-analyze
description: Execute the Analysis phase - research, exploration, and constraint identification
arguments:
  - name: focus
    description: Specific area to analyze (market, technical, competitors)
    required: false
---

# /workflow:analyze

## Mission

Execute the Analysis phase of the Enterprise workflow track. This phase focuses on research, exploration, and identifying constraints before detailed planning begins.

## When to Use

- **Enterprise track** projects
- New platforms or major initiatives
- When domain knowledge is limited
- Before committing to a technical approach

## Workflow

### Step 1: Analysis Setup

```
╔══════════════════════════════════════════════════════════╗
║            ANALYSIS PHASE - STARTING                      ║
╠══════════════════════════════════════════════════════════╣
║ Track: Enterprise                                         ║
║ Phase: 1 of 4 - Analysis                                  ║
║                                                           ║
║ Objectives:                                               ║
║ • Understand the problem domain                           ║
║ • Research existing solutions                             ║
║ • Identify technical constraints                          ║
║ • Document risks and opportunities                        ║
╚══════════════════════════════════════════════════════════╝
```

### Step 2: Research Areas

**Guided Research Questions:**

```
┌─────────────────────────────────────────────────────────┐
│ DOMAIN RESEARCH                                          │
├─────────────────────────────────────────────────────────┤
│ 1. What problem are we solving?                          │
│ 2. Who are the key stakeholders?                         │
│ 3. What are the business drivers?                        │
│ 4. What does success look like?                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MARKET RESEARCH                                          │
├─────────────────────────────────────────────────────────┤
│ 1. What existing solutions exist?                        │
│ 2. What are competitors doing?                           │
│ 3. What are industry best practices?                     │
│ 4. What are emerging trends?                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TECHNICAL RESEARCH                                       │
├─────────────────────────────────────────────────────────┤
│ 1. What technologies could we use?                       │
│ 2. What are the integration requirements?                │
│ 3. What are the scalability needs?                       │
│ 4. What security/compliance requirements exist?          │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Context7 Research (Optional)

If MCP Context7 is configured, use it for technical research:

```
Using Context7 MCP for up-to-date documentation...

Researching:
• Latest Stripe API best practices
• Current security standards for payment processing
• PCI DSS compliance requirements
```

### Step 4: Constraint Identification

Document constraints discovered:

```
╔══════════════════════════════════════════════════════════╗
║               CONSTRAINTS IDENTIFIED                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ TECHNICAL CONSTRAINTS:                                    ║
║ • Must integrate with existing Symfony 7.x backend        ║
║ • Database: PostgreSQL (existing, cannot change)          ║
║ • Must support mobile apps via existing API               ║
║                                                           ║
║ BUSINESS CONSTRAINTS:                                     ║
║ • Budget: Limited to existing team                        ║
║ • Timeline: MVP needed in Q2 2026                         ║
║ • Must maintain backward compatibility                    ║
║                                                           ║
║ REGULATORY CONSTRAINTS:                                   ║
║ • GDPR compliance required (EU users)                     ║
║ • PCI DSS for payment processing                          ║
║                                                           ║
║ RESOURCE CONSTRAINTS:                                     ║
║ • Team: 2 backend, 1 frontend developer                   ║
║ • No dedicated DevOps resource                            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 5: Risk & Opportunity Analysis

```
╔══════════════════════════════════════════════════════════╗
║            RISKS & OPPORTUNITIES                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ RISKS:                                                    ║
║ ┌─────────┬──────────┬────────────┬───────────────────┐  ║
║ │ Risk    │ Impact   │ Likelihood │ Mitigation        │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Stripe  │ High     │ Low        │ Fallback provider │  ║
║ │ downtime│          │            │                   │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Timeline│ Medium   │ Medium     │ MVP scope         │  ║
║ │ slip    │          │            │ reduction         │  ║
║ └─────────┴──────────┴────────────┴───────────────────┘  ║
║                                                           ║
║ OPPORTUNITIES:                                            ║
║ • Can leverage Stripe's new Payment Elements              ║
║ • Potential for subscription model expansion              ║
║ • Mobile payment (Apple Pay, Google Pay) ready            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 6: Generate Analysis Artifacts

Create analysis documents:

```
project-management/
└── analysis/
    ├── research-summary.md      # Key findings
    ├── constraints.md           # All identified constraints
    ├── risks-opportunities.md   # Risk register & opportunities
    └── technical-options.md     # Technology evaluation
```

### Step 7: Phase Completion

```
╔══════════════════════════════════════════════════════════╗
║            ANALYSIS PHASE COMPLETE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artifacts Created:                                        ║
║ ✅ research-summary.md                                    ║
║ ✅ constraints.md                                         ║
║ ✅ risks-opportunities.md                                 ║
║ ✅ technical-options.md                                   ║
║                                                           ║
║ Key Findings:                                             ║
║ • 4 technical constraints identified                      ║
║ • 3 business constraints identified                       ║
║ • 5 risks documented with mitigations                     ║
║ • 3 opportunities for consideration                       ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NEXT PHASE: Planning                                      ║
║ Command: /workflow:plan                                   ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ The analysis will inform PRD creation and architecture.   ║
╚══════════════════════════════════════════════════════════╝
```

## Agents Involved

- **research-assistant**: Technical research and documentation lookup
- **product-owner**: Business context and stakeholder analysis

## Output Files

| File | Purpose |
|------|---------|
| `analysis/research-summary.md` | Consolidated research findings |
| `analysis/constraints.md` | Technical, business, regulatory constraints |
| `analysis/risks-opportunities.md` | Risk register with mitigations |
| `analysis/technical-options.md` | Technology evaluation and recommendations |

## Related Commands

- `/workflow:init` - Initialize workflow (must run first)
- `/workflow:plan` - Next phase: Planning
- `/workflow:status` - Check progress
- `/common:research-context7` - Deep research with Context7 MCP
