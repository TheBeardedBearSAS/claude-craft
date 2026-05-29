# Cadre de suivi des signaux communautaires — 2026-05-10

## Vue d'ensemble

Le projet dispose d'une **infrastructure de feedback structurée** (templates, voting, roadmap) mais **pas de monitoring continu en place**. Ce document établit le cadre pour la recherche utilisateur permanente et identifie les signaux de conversion critiques.

---

## Infrastructure de feedback — État actuel

### 1. GitHub Issues (templates structurés)

| Template | Labels | Objectif | Utilisateurs cibles |
|----------|--------|----------|---------------------|
| 01-Doc fixes i18n ES | `good-first-issue`, `documentation` | Non-anglophone contributors | Équipes ES, startups LATAM |
| 02-Doc fixes i18n DE | `good-first-issue`, `documentation` | German-speaking teams | Équipes DE, startups EU |
| 03-Doc fixes i18n PT | `good-first-issue`, `documentation` | Portuguese-speaking teams | Équipes PT, startups BR |
| 04-Doc Add ADR | `documentation` | Architectural decision recording | Tech leads, architects |
| **05-Test Unit Missing** | **`good-first-issue`, `testing`** | **Coverage gaps** | **Junior engineers, learning path** |
| 06-Test Integration | `testing` | Integration coverage | QA engineers, platform teams |
| 07-Test Mutation | `testing` | True quality assurance | QA leads, DevEx teams |
| 08-Refactor Install | `refactor`, `developer-experience` | DX improvement | Teams adopting |
| 09-Refactor Lint | `refactor`, `code-quality` | Code hygiene | All teams |
| 10-Translation Partial | `i18n`, `good-first-issue` | i18n completeness | Multilingual contributors |
| **Feature Request** | **`enhancement`, `needs-triage`** | **Community voting** | **All users** |

**Signal pattern:** Issue templates reflect board's understanding of community pain points:
- i18n = non-English teams are adopting (signal: geographic expansion)
- Testing (unit, integration, mutation) = teams care about robustness (validates pain point #5)
- Install/DX = onboarding friction remains active (validates pain point #1)

### 2. Voting Mechanism (Roadmap)

**Threshold structure:**
- **Backlog** → **Voting** (10+ 👍 reactions on issue description)
- **Voting** → **In Progress** (25+ 👍 OR maintainer decision)
- **In Progress** → **Shipped** (linked to release in CHANGELOG)

**Current governance:**
- Monthly review (1st Monday, #announcements Discord)
- Quarterly phase transitions (audit gates)
- Maintainer veto allowed (security, KISS, maintenance)

### 3. Community Channels

| Canal | Purpose | Frequency |
|-------|---------|-----------|
| **GitHub Discussions** | Questions, ideas, help | Asynchronous, ongoing |
| **Discord Community** | Real-time chat, support, announcements | Daily during business hours |
| **GitHub Issues** | Structured feedback (templates) | Continuous |
| **CHANGELOG** | Public signal of shipping (validation) | Per release |
| **Blog/Content** | Expertise + demand generation | Sporadic (pending publication) |

---

## Roadmap items — Conversion mapping

### v8.2 (Q2 2026) — Critical for traction funnel

| Item | Status | Conversion relevance | Research signal |
|------|--------|---------------------|-----------------|
| **P2-11** | E2E Tests dockerisés | Medium | Testing maturity → audit sales |
| **P2-12** | Bash hardening + shellcheck CI | ✅ Done | Security signal for enterprise |
| **P2-13** | Mutation Testing Stryker | In progress | Testing maturity proof |
| **P2-14** | Refactor install DRY (23→3) | Medium | DX improvement (pain point #1) |
| **P2-15** | I18n parity website | ✅ Done | Geographic expansion signal |
| **P2-16** | SBOM + SLSA L2 | ✅ Done | Compliance/supply chain (enterprise trust) |
| **⭐ P2-17** | **3 showcases clients** | ✅ **Blocker for revenue** | **Case studies = proof of ROI (conversion requirement)** |
| **P2-18** | Roadmap publique + vote | ✅ Done | Transparency signal (governance) |
| **⭐ P2-19** | **2 co-maintainers** | ✅ **Sustainability** | **Growth signal (reduces bus factor, enables scaling)** |
| **⭐ P2-20** | **10 skills Anthropic marketplace** | High | **Monetization + discovery channel** |

**Key insight:** P2-17 (3 showcases) is the **critical blocker** for Phase 2 conversion funnel. Without real customer examples, teams cannot validate ROI claims. This directly blocks audit/formation sales.

---

## Data gaps — What researcher should monitor (NOT currently tracked)

### Gap 1: Issue voting counts
**Currently missing:** No export of voting reactions per issue.
**Why matters:** Tells us which pain points users care about most.
**Recommendation:** Set up weekly GitHub API scrape:
```bash
gh api repos/TheBeardedBearSAS/claude-craft/issues \
  --jq '.[] | {number, title, reactions: .reactions."+1"}' \
  | jq 'sort_by(.reactions) | reverse | .[0:10]'
```

### Gap 2: Discord sentiment + topic frequency
**Currently missing:** No transcript or topic tracking from Discord.
**Why matters:** Real-time signal of pain points, questions, frustrations.
**Recommendation:** Set up weekly Discord digest (via bot or manual):
- Count mentions by channel (troubleshooting, best-practices, architecture, showcase)
- Flag recurring pain points
- Track resolved vs. unresolved threads

### Gap 3: Discussions activity
**Currently missing:** No tracking of GitHub Discussions engagement.
**Why matters:** Indicates adoption depth (askers = potential customers).
**Recommendation:** Weekly count of:
- New discussions (by category)
- Resolved ratio
- Engagement rate (replies per discussion)

### Gap 4: External mentions
**Currently missing:** No tracking of blog posts, talks, Twitter/LinkedIn mentions.
**Why matters:** Signals market awareness, third-party validation.
**Recommendation:** Set up Google Alerts + tracking for:
- "claude-craft" mentions
- "BMAD" + "Claude Code" mentions
- Competitive mentions (SuperClaude, etc.)

### Gap 5: Conversion funnel metrics
**Currently missing:** No tracking from OSS → lead → audit booking → mission.
**Why matters:** Validates if research recommendations (blog, CTA, etc.) are actually converting.
**Recommendation:** Set up Linear CRM tracking:
- Audit booking leads (source: GitHub, blog, Discord, etc.)
- Conversion rate to formation
- Conversion rate to mission
- Average deal value by persona (CTO vs. tech lead vs. coach)

---

## Proposed weekly monitoring — Researcher role

**Cadence:** Every Monday (post Discord monthly review), publish **Weekly Community Signals Report** (5 min read).

**Structure:**
```
## Top issues by vote (new voting activity)
(GH API data)

## Hot topics in Discord
- Most mentioned pain points
- Resolved success stories (= content idea)
- Unresolved friction points

## Discussions engagement
- New questions (by category)
- Resolution rate
- Who's answering (volunteers, maintainers)

## External signals
- Blog mentions, talks, Twitter activity
- Competitive mentions
- Press/media coverage

## Conversion funnel status
- Audit leads this week (source breakdown)
- Booking rate from blog/CTA
- Community contributor → customer conversions

## Action items for next sprint
- Content ideas (from Discord pain points)
- Roadmap adjustment recommendations (from voting)
- Community support gaps (from unresolved discussions)
```

---

## Signaux de conversion — Mapping issues → revenue

### Pain point #1: Divergence conventions (Team scale-up)
**Issues to monitor:** 
- Feature requests mentioning "conventions", "consistency", "standards"
- GitHub Discussions questions about BMAD setup
- Discord #architecture discussions about team alignment

**Conversion signal:** Issues with 15+ votes on this topic = high demand for calibration service ($2-4K)

**Expected vote pattern:** P2-14 (Install refactor), P2-8 (Lint refactor) should see activity if pain is real

### Pain point #2: Rework in PR reviews
**Issues to monitor:**
- P2-13 (Mutation testing) voting activity
- Feature requests mentioning "test coverage", "quality gates"
- Discord #testing channel activity

**Conversion signal:** P2-13 reaching 25+ votes = strong demand for testing coaching

**Expected outcome:** Mutation testing integration validates pain point, justifies TDD coaching service

### Pain point #3: Observability / resilience (Persistent since 04-19)
**Issues to monitor:**
- Feature requests for `@observability-engineer` agent usage
- Discord #observability channel (if created)
- Discussions about SLO/SLI setup

**Conversion signal:** New issues in this domain = emerging demand for observability audit/consulting

**Expected outcome:** If observed, = new service line (SLO/SLI consulting, chaos engineering coaching)

### Pain point #4: MLOps (Persistent since 04-19)
**Issues to monitor:**
- Feature requests mentioning "ML pipeline", "model versioning", "feature store"
- Discussions from data science / ML teams
- Feature requests for `@mlops-engineer` agent enhancements

**Conversion signal:** 3+ issues with 10+ votes = viable market for MLOps consulting

**Expected outcome:** Dedicated MLOps formation track

---

## Governance of research findings

### Monthly sync (Discord #announcements, 1st Monday)
- Share top 3 pain points from voting
- Highlight community contributors
- Preview next phase priorities

### Quarterly phase review
- Present researcher findings to board
- Validate that roadmap reflects community signals
- Recommend service line prioritization based on demand

### Blog/content feedback loop
- Track engagement on published blog posts (via Plausible)
- Monitor resulting Discord/issue activity
- Validate content-to-lead conversion

---

## Immediate actions (this week)

1. **Set up GitHub API script** — export top 10 voted issues (running weekly)
2. **Create Discord #signals channel** — share weekly digest + coordinate community input
3. **Document P2-17 blockers** — identify what's needed for first 3 customer showcases
4. **Schedule content publication** — unblock blog post (pending board GO/NO GO)
5. **Install Plausible Analytics** — start capturing CTA click conversions

---

## Expected outcomes (next 90 days)

| Metric | Target | Success signal |
|--------|--------|-----------------|
| **Blog post published** | This week | URL + analytics tracking active |
| **Audit booking CTAs clicked** | 50+ (from blog + README) | Linear leads created |
| **First 3 customer showcases** | P2-17 completion | Case studies published |
| **Community contributors** | 5+ on good-first-issues | First GitHub contributions merged |
| **Formation bookings** | 2-3 audits → 1 booking | Conversion funnel validates |
| **Roadmap voting** | 25+ votes on top item | Clear community prioritization |

---

*Cadre proposé par researcher agent — Paperclip v2026.403.0*  
*À valider par board pour setup de monitoring continu*
