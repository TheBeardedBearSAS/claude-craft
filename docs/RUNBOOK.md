# Operations Runbook

This document provides procedures for common operations, incident response, and maintenance tasks for Claude Craft maintainers.

---

## Table of Contents

1. [Release Process](#release-process)
2. [Hotfix Workflow](#hotfix-workflow)
3. [Rollback Procedure](#rollback-procedure)
4. [Incident Response](#incident-response)
5. [Common Operations](#common-operations)

---

## Release Process

### Standard Release (Maximum 1 per week)

Claude Craft follows a maximum cadence of **1 release per week**. Exceptions are critical security fixes and documented regressions.

#### Pre-Release Checklist

1. **Version Bump**
   ```bash
   # Update version in package.json
   npm version [major|minor|patch]
   
   # For pre-release versions
   npm version premajor --preid=alpha  # 2.0.0-alpha.1
   npm version preminor --preid=beta   # 1.1.0-beta.1
   npm version prepatch --preid=rc     # 1.0.1-rc.1
   ```

2. **Update Documentation** (43+ files across 5 languages)
   - All `README.md` files (root + language-specific)
   - `CHANGELOG.md` with new version section
   - `docs/QUICKSTART.md` version references
   - Technology reference files in `.claude/references/`
   - Website content in `website/`
   - `LandingPage.vue` if applicable

3. **Run Tests and Quality Checks**
   ```bash
   npm test
   npm run lint:shell
   npm run lint:i18n
   make config-validate
   ```

4. **Commit Release Changes**
   ```bash
   git add .
   git commit -m "chore(release): bump version to X.Y.Z"
   ```

5. **Wait for CI to Pass**
   - NEVER create a tag before CI is green on the release commit
   - Verify all checks pass on GitHub Actions

6. **Create and Push Tag**
   ```bash
   git tag vX.Y.Z
   git push origin main
   git push origin vX.Y.Z
   ```

7. **CI Publishes Automatically**
   - CI workflow publishes to NPM automatically
   - Do NOT run `npm publish` manually
   - Verify publication on npmjs.com

### Pre-Release Strategy (SemVer)

Use pre-release versions for validation before production:

| Version | When | Example |
|---------|------|---------|
| **alpha** | Development initial, features incomplete | `2.0.0-alpha.1` |
| **beta** | Features complete, testing internal | `2.0.0-beta.1` |
| **rc** | Release Candidate, ready for production | `2.0.0-rc.1` |
| **stable** | Production | `2.0.0` |

**Workflow:**
```
feature/add-payment
  ├─ 2.0.0-alpha.1 (develop branch)
  ├─ 2.0.0-beta.1 (QA tests)
  ├─ 2.0.0-rc.1 (staging)
  └─ 2.0.0 (main → production)
```

---

## Hotfix Workflow

For critical bugs in production that cannot wait for the weekly release.

### When to Hotfix

- Critical security vulnerabilities (CVE)
- Documented regressions affecting users
- Installation breaking bugs

### Procedure

1. **Create Hotfix Branch from Tag**
   ```bash
   git checkout -b hotfix/vX.Y.Z+1 vX.Y.Z
   ```

2. **Apply Fix**
   ```bash
   # Make the minimal fix
   git add .
   git commit -m "fix: critical issue description"
   ```

3. **Test Thoroughly**
   ```bash
   npm test
   npm run lint:shell
   make dry-run-symfony TARGET=./test-output/test
   ```

4. **Bump Patch Version**
   ```bash
   npm version patch
   ```

5. **Merge to Main and Tag**
   ```bash
   git checkout main
   git merge --no-ff hotfix/vX.Y.Z+1
   git push origin main
   git tag vX.Y.Z+1
   git push origin vX.Y.Z+1
   ```

6. **CI Publishes Automatically**
   - Verify CI passes
   - Confirm NPM publication

---

## Rollback Procedure

If a published version has critical issues.

### Option 1: Publish a Fixed Version (Preferred)

```bash
# Fix the issue
npm version patch
git push origin main
git tag vX.Y.Z+1
git push origin vX.Y.Z+1
```

### Option 2: Deprecate Bad Version

```bash
# Deprecate the problematic version
npm deprecate @the-bearded-bear/claude-craft@X.Y.Z "Critical bug - use vX.Y.Z+1 instead"
```

### Option 3: Unpublish (Only within 72h)

```bash
# ONLY if published < 72h ago
npm unpublish @the-bearded-bear/claude-craft@X.Y.Z

# Then re-publish previous version with a new patch
git checkout vX.Y.Z-1
npm version patch
npm publish
```

**Note:** npm does not allow unpublishing after 72 hours.

---

## Incident Response

### Detection

- GitHub Issues with "bug" label
- NPM download anomalies
- CI failures on main branch
- User reports via email/Discord

### Triage

**Severity Levels:**

| Severity | Response Time | Example |
|----------|---------------|---------|
| **P0** | Immediate | Installation completely broken |
| **P1** | < 4h | Critical feature broken for all users |
| **P2** | < 24h | Feature broken for subset of users |
| **P3** | Next sprint | Minor bug, workaround exists |

### Response Procedure

1. **Acknowledge** (within severity SLA)
   - Comment on GitHub issue
   - Assign to maintainer

2. **Investigate**
   - Reproduce locally
   - Check CI logs
   - Review recent commits

3. **Fix**
   - Apply minimal fix
   - Follow hotfix workflow if critical
   - Test thoroughly

4. **Postmortem** (P0/P1 only)
   - Document root cause
   - Preventive measures
   - Add regression test

---

## Common Operations

### Update Dependencies

```bash
# Check for outdated dependencies
npm outdated

# Update to latest within semver range
npm update

# Update to latest breaking versions (careful!)
npm install <package>@latest

# Run tests after updates
npm test
npm run lint:shell
```

### Add New Technology Stack

1. **Create Directory Structure**
   ```bash
   for lang in en fr es de pt; do
     mkdir -p Dev/i18n/$lang/NewTech/{agents,commands,skills,templates,checklists}
   done
   mkdir -p .claude/references/newtech/
   ```

2. **Create Installation Script**
   ```bash
   cp Dev/scripts/install-symfony-rules.sh Dev/scripts/install-newtech-rules.sh
   # Edit script for new tech
   ```

3. **Add to Tech Registry**
   - Edit `cli/lib/tech-registry.js`
   - Add entry with `tier: 3` (community)

4. **Create Reference Documentation**
   - Add `.claude/references/newtech/CLAUDE.md`

5. **Update Makefile**
   ```makefile
   install-newtech:
       @./Dev/scripts/install-newtech-rules.sh
   ```

6. **Update Documentation**
   - Add to `CONTRIBUTING.md`
   - Add to `docs/TECHNOLOGIES.md`

### Add New Agent

1. **Create Agent File** in `Dev/i18n/en/Common/agents/`
   ```markdown
   ---
   name: agent-name
   description: Expert in [domain]. Use when [context].
   ---
   
   # Agent Name
   
   ## Identity
   ...
   ```

2. **Translate to All Languages** (`fr`, `es`, `de`, `pt`)

3. **Add to Installation Script** (`install-common-rules.sh`)

4. **Update Documentation** (`docs/AGENTS.md`)

### Add New Command

1. **Create Command File** in `Dev/i18n/en/{Tech}/commands/`
   ```markdown
   ---
   description: Brief description of what the command does
   argument-hint: <required-arg> [optional-arg]
   ---
   
   # Command Name
   ...
   ```

2. **Translate to All Languages**

3. **Add to Installation Script**

4. **Update Documentation** (`docs/COMMANDS.md`)

---

## Monitoring and Metrics

### Key Metrics to Track

- NPM downloads per week
- GitHub stars and forks
- Open issues vs closed issues
- Average time to close issues
- CI pass rate on main
- User reports on Discord/email

### Health Indicators

**Healthy:**
- CI pass rate > 95%
- Issue close time < 7 days
- Zero P0 incidents

**Needs Attention:**
- CI pass rate < 90%
- Issue backlog growing
- Frequent hotfixes

---

## Contact

- **Maintainer:** The Bearded CTO
- **Email:** flavien.metivier@gmail.com
- **Security:** security@thebearded-cto.com

---

**Last Updated:** 2026-04-17
**Version:** 1.0.0
