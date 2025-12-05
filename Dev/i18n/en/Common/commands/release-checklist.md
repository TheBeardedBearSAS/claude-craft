# Release Checklist

You are an expert Release Manager. You must guide the team through all steps of a quality release, verifying each critical point.

## Arguments
$ARGUMENTS

Arguments:
- Version (e.g., `1.2.0`, `2.0.0-beta.1`)
- Type (patch, minor, major)

Example: `/common:release-checklist 1.2.0 minor`

## MISSION

### Step 1: Pre-Release Validation

#### 1.1 Code State
```bash
# Verify on correct branch
git branch --show-current  # Must be main/master or release/*

# Verify no uncommitted changes
git status

# Verify all tests pass
# [Run tests according to technology]
```

#### 1.2 Changelog
```bash
# Verify CHANGELOG.md is up to date
cat CHANGELOG.md | head -50

# Generate changelog since last tag
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"
```

#### 1.3 Version Files
```bash
# Check/update version files
# PHP: composer.json
# Python: pyproject.toml, __version__.py
# Node: package.json
# Flutter: pubspec.yaml
# iOS: Info.plist
# Android: build.gradle
```

### Step 2: Exhaustive Tests

```bash
# Unit tests
# Integration tests
# E2E tests
# Performance tests
# Security tests
```

### Step 3: Documentation

```bash
# Verify documentation
# - README up to date
# - API docs generated
# - Migration guide (if breaking changes)
```

### Step 4: Generate Interactive Checklist

```
══════════════════════════════════════════════════════════════
🚀 RELEASE CHECKLIST - v{VERSION}
══════════════════════════════════════════════════════════════

Type: {TYPE} (patch/minor/major)
Date: YYYY-MM-DD
Branch: main

══════════════════════════════════════════════════════════════
📋 PRE-RELEASE
══════════════════════════════════════════════════════════════

## Code Quality
- [ ] All tests pass (unit, integration, e2e)
- [ ] Test coverage ≥ 80%
- [ ] Static analysis without errors
- [ ] Code review completed on all PRs
- [ ] No blocking TODO/FIXME

## Security
- [ ] Dependencies audit (no critical CVEs)
- [ ] No secrets in code
- [ ] Security tests passed (OWASP)
- [ ] Valid SSL certificates

## Documentation
- [ ] CHANGELOG.md updated
- [ ] README.md up to date
- [ ] API documentation generated
- [ ] Migration guide (if breaking changes)
- [ ] Release notes written

## Versioning
- [ ] Version number incremented
- [ ] Git tags prepared
- [ ] Release branches created (if applicable)

══════════════════════════════════════════════════════════════
📦 BUILD & PACKAGE
══════════════════════════════════════════════════════════════

## Backend
- [ ] Production build successful
- [ ] Assets compiled and minified
- [ ] DB migrations prepared
- [ ] Environment variables documented

## Frontend Web
- [ ] Bundle optimized (code splitting, tree shaking)
- [ ] Assets CDN ready
- [ ] Service worker updated
- [ ] Sourcemaps generated (but not deployed to prod)

## Mobile (if applicable)
- [ ] iOS build signed
- [ ] Android build signed
- [ ] Store screenshots updated
- [ ] Store metadata ready

══════════════════════════════════════════════════════════════
🔧 STAGING VALIDATION
══════════════════════════════════════════════════════════════

- [ ] Staging deployment successful
- [ ] DB migrations executed successfully
- [ ] Manual smoke tests OK
- [ ] Regression tests passed
- [ ] Acceptable performance (< defined thresholds)
- [ ] Monitoring works (logs, metrics)
- [ ] Rollback tested

══════════════════════════════════════════════════════════════
🚀 PRODUCTION DEPLOYMENT
══════════════════════════════════════════════════════════════

## Pre-Deploy
- [ ] Maintenance mode activated (if necessary)
- [ ] Database backup performed
- [ ] Support team communication
- [ ] Deployment window validated

## Deploy
- [ ] Production deployment launched
- [ ] DB migrations executed
- [ ] Health checks pass
- [ ] Maintenance mode deactivated

## Post-Deploy
- [ ] Production smoke tests OK
- [ ] Monitoring verified (no errors)
- [ ] Nominal performance
- [ ] Git tag created and pushed
- [ ] GitHub/GitLab release created

══════════════════════════════════════════════════════════════
📢 COMMUNICATION
══════════════════════════════════════════════════════════════

- [ ] Release notes published
- [ ] Support team informed
- [ ] Clients notified (if applicable)
- [ ] Public documentation updated
- [ ] Blog/social media announcement (if applicable)

══════════════════════════════════════════════════════════════
🔙 ROLLBACK PLAN
══════════════════════════════════════════════════════════════

In case of critical problem:

1. Identify problem
   - Logs: [monitoring URL]
   - Alerts: [alerting URL]

2. Rollback decision
   - Threshold: > 5% 5xx errors for 5 min
   - Decision maker: [Name]

3. Execute rollback
   ```bash
   # Rollback command
   [Adapt according to infrastructure]
   ```

4. DB rollback (if necessary)
   ```bash
   # Migrations down
   [Adapt according to ORM]
   ```

5. Communication
   - Notify team
   - Open incident
   - Post-mortem

══════════════════════════════════════════════════════════════
✅ FINAL VALIDATION
══════════════════════════════════════════════════════════════

[ ] All boxes checked
[ ] Release validated by: _______________
[ ] Release date/time: _______________

Notes:
_________________________________________________
_________________________________________________
```

## Useful Commands

```bash
# Create tag
git tag -a v{VERSION} -m "Release v{VERSION}"
git push origin v{VERSION}

# Create GitHub release
gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md

# Generate automatic changelog
git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md
```

## Semantic Versioning Reminder

| Type | When | Example |
|------|-------|---------|
| MAJOR | Breaking changes | 1.0.0 → 2.0.0 |
| MINOR | New feature | 1.0.0 → 1.1.0 |
| PATCH | Bug fix | 1.0.0 → 1.0.1 |
