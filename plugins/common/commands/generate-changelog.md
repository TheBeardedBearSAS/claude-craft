---
description: Automatic Changelog Generation
argument-hint: [arguments]
---

# Automatic Changelog Generation

You are a documentation assistant. You must analyze git commits and generate a formatted changelog following Conventional Commits and Keep a Changelog conventions.

## Arguments
$ARGUMENTS

Arguments:
- Target version (e.g., `1.2.0`)
- Since (previous tag, default: latest tag)

Example: `/common:generate-changelog 1.2.0 v1.1.0`

## MISSION

### Step 1: Retrieve Commits

```bash
# Identify latest tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# List commits since latest tag
if [ -z "$LAST_TAG" ]; then
    git log --pretty=format:"%H|%s|%an|%ad" --date=short
else
    git log ${LAST_TAG}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short
fi
```

### Step 2: Parse Commits (Conventional Commits)

Expected format: `type(scope): description`

| Type | Changelog Category |
|------|---------------------|
| feat | Added |
| fix | Fixed |
| docs | Documentation |
| style | (ignored) |
| refactor | Changed |
| perf | Performance |
| test | (ignored) |
| chore | (ignored) |
| build | Build |
| ci | (ignored) |
| revert | Removed |
| BREAKING CHANGE | Breaking Changes |

### Step 3: Analyze PRs (if available)

```bash
# Retrieve merged PRs
gh pr list --state merged --base main --json number,title,labels,author
```

### Step 4: Generate Changelog

Keep a Changelog format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [{VERSION}] - {DATE}

### Breaking Changes
- **{scope}**: {description} ({author}) - #{PR}

### Added
- **{scope}**: {description} ({author}) - #{PR}
- **{scope}**: {description} ({author}) - #{PR}

### Changed
- **{scope}**: {description} ({author}) - #{PR}

### Deprecated
- **{scope}**: {description} ({author}) - #{PR}

### Removed
- **{scope}**: {description} ({author}) - #{PR}

### Fixed
- **{scope}**: {description} ({author}) - #{PR}

### Security
- **{scope}**: {description} ({author}) - #{PR}

### Performance
- **{scope}**: {description} ({author}) - #{PR}

## [{PREVIOUS_VERSION}] - {DATE}
...

[Unreleased]: https://github.com/{owner}/{repo}/compare/v{VERSION}...HEAD
[{VERSION}]: https://github.com/{owner}/{repo}/compare/v{PREVIOUS_VERSION}...v{VERSION}
```

### Step 5: Output Example

```markdown
## [1.2.0] - 2024-01-15

### Breaking Changes
- **api**: Changed authentication from session to JWT (#123) - @john

### Added
- **auth**: Add OAuth2 social login support (#145) - @jane
- **users**: Add user profile picture upload (#142) - @john
- **dashboard**: Add real-time notifications (#138) - @alice

### Changed
- **api**: Upgrade API Platform to v3.2 (#150) - @bob
- **ui**: Migrate to TailwindCSS v3 (#148) - @jane

### Fixed
- **auth**: Fix password reset email not sending (#141) - @john
- **orders**: Fix calculation of total with discounts (#139) - @alice
- **mobile**: Fix crash on iOS 17 (#137) - @bob

### Security
- **deps**: Update symfony/http-kernel for CVE-2024-1234 (#146) - @security-bot

### Performance
- **api**: Add Redis caching for user sessions (#144) - @alice
- **db**: Optimize N+1 queries on orders list (#140) - @bob

---

**Full Changelog**: https://github.com/org/repo/compare/v1.1.0...v1.2.0

### Contributors
- @john (4 commits)
- @jane (3 commits)
- @alice (3 commits)
- @bob (3 commits)

### Statistics
- Commits: 13
- Files changed: 87
- Lines added: +2,345
- Lines removed: -876
```

### Step 6: Suggested Actions

```
══════════════════════════════════════════════════════════════
📝 CHANGELOG GENERATED
══════════════════════════════════════════════════════════════

Version: 1.2.0
Period: 2024-01-01 → 2024-01-15
Commits analyzed: 13

──────────────────────────────────────────────────────────────
📊 SUMMARY BY CATEGORY
──────────────────────────────────────────────────────────────

| Category | Count |
|-----------|--------|
| Added | 3 |
| Changed | 2 |
| Fixed | 3 |
| Security | 1 |
| Performance | 2 |
| Breaking | 1 |

──────────────────────────────────────────────────────────────
⚠️ ATTENTION POINTS
──────────────────────────────────────────────────────────────

1. ⚠️ BREAKING CHANGE detected - requires MAJOR version?
2. 🔒 1 security fix - mention in release notes
3. 📝 5 commits without conventional format (to improve)

──────────────────────────────────────────────────────────────
🎯 NEXT STEPS
──────────────────────────────────────────────────────────────

1. Verify and edit generated changelog
2. Create or update CHANGELOG.md file
3. Commit: git commit -am "docs: update changelog for v1.2.0"
4. Create tag: git tag -a v1.2.0 -m "Release v1.2.0"
```

## Associated Commands

```bash
# Save the changelog
# Content will be displayed, you can copy it to CHANGELOG.md

# Recommended tools for automation
# - git-cliff: https://github.com/orhun/git-cliff
# - conventional-changelog: https://github.com/conventional-changelog/conventional-changelog
# - release-please: https://github.com/googleapis/release-please
```

## Conventional Commits Reminder

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Standard types
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting (no code change)
refactor: Refactoring (no new feature or fix)
perf:     Performance improvement
test:     Add/modify tests
chore:    Maintenance (deps, config, etc.)
build:    Build system, external deps
ci:       CI/CD configuration
revert:   Revert previous commit

# Breaking change
feat!: description
# or
feat: description

BREAKING CHANGE: breaking change explanation
```
