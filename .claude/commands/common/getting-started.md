---
description: Interactive 10-minute guided tour for new Claude Craft users
argument-hint: (no arguments)
allowed-tools: Read, Glob, Bash, Grep
---

# /getting-started - Your First 10 Minutes with Claude Craft

Welcome! This wizard helps you discover Claude Craft's value in under 10 minutes.

200+ commands can feel overwhelming — let's find the 3 that matter most for YOUR project right now.

## Step 1: Detect Your Project Stack (30 seconds)

Scanning your project to identify the technology stack...

**Actions:**
1. Check for technology markers in root directory:
   - `package.json` → JavaScript/TypeScript (React, Angular, Vue.js, React Native)
   - `composer.json` → PHP (Symfony, Laravel)
   - `pyproject.toml` or `requirements.txt` → Python
   - `pubspec.yaml` → Flutter/Dart
   - `*.csproj` or `*.sln` → C# / .NET
   - `Cargo.toml` → Rust (Paperclip)
   - `go.mod` → Go
   - `mix.exs` → Elixir

2. For JavaScript/TypeScript projects, check dependencies to determine framework:
   - Look for `react`, `@angular/core`, `vue`, `react-native` in package.json dependencies

3. If multiple technology files found:
   - Ask user which stack to prioritize
   - Store the detected stack

**Output format:**

```
✓ Stack Detected: [Technology Name]

Your project uses [Technology]. Claude Craft has specialized commands and agents for this stack.
```

## Step 2: Propose 3 High-Impact Actions (1 minute)

Based on the detected stack, recommend 3 contextualized commands that provide immediate value.

### Stack to Commands Mapping

**Symfony / PHP:**
- `/symfony:check-architecture` — Verify Clean Architecture + DDD compliance
- `/symfony:check-testing` — Analyze test coverage and quality
- `/symfony:check-security` — OWASP Top 10:2025 security audit

**React:**
- `/react:check-code-quality` — TypeScript, ESLint, code standards
- `/react:accessibility-check` — WCAG compliance audit
- `/react:bundle-analyze` — Identify bundle size issues

**Python:**
- `/python:check-code-quality` — Ruff, type hints, PEP 8
- `/python:check-security` — Bandit security scan
- `/python:type-coverage` — MyPy/Pyright coverage analysis

**Flutter / Dart:**
- `/flutter:check-testing` — Test coverage and golden tests
- `/flutter:analyze-performance` — Widget rebuild analysis
- `/flutter:golden-update` — Update visual regression tests

**Vue.js:**
- `/vuejs:check-code-quality` — Composition API, TypeScript, ESLint
- `/vuejs:check-architecture` — Feature structure validation
- `/vuejs:check-security` — XSS, CSP, OWASP audit

**Laravel:**
- `/laravel:check-code-quality` — PSR-12, Pest 4, coding standards
- `/laravel:check-testing` — Test coverage with Pest
- `/laravel:check-security` — OWASP audit, Sanctum config

**Angular:**
- `/angular:check-code-quality` — Signals, standalone components, ESLint
- `/angular:check-architecture` — Module structure, dependency graph
- `/angular:check-security` — XSS protection, security headers

**React Native:**
- `/reactnative:check-code-quality` — TypeScript, ESLint, code patterns
- `/reactnative:check-architecture` — Feature structure, navigation
- `/reactnative:app-size` — Bundle size analysis

**C# / .NET:**
- `/csharp:check-architecture` — Clean Architecture + CQRS validation
- `/csharp:check-testing` — xUnit coverage and quality
- `/csharp:check-security` — OWASP audit for .NET

**PHP (standalone):**
- `/php:check-code-quality` — PSR-12, PHPStan Level 10
- `/php:check-testing` — Pest 4 test coverage
- `/php:check-security` — Security best practices

**Unknown/Multi-stack:**
- `/common:audit-freshness` — Check dependency updates and security
- `/common:pre-commit-check` — Quality gates before commits
- `/team:audit` — Full project audit (architecture, security, performance)

### Output Format

```
ℹ Recommended Quick Wins for [Technology]

Based on your stack, these 3 commands will give you immediate insights:

1. ✓ /[command-1] — [2-sentence explanation of value]
   Why now? [1 sentence on TTFV benefit]

2. ✓ /[command-2] — [2-sentence explanation of value]
   Why now? [1 sentence on TTFV benefit]

3. ✓ /[command-3] — [2-sentence explanation of value]
   Why now? [1 sentence on TTFV benefit]

Choose one to run (type the number 1-3), or skip to explore all 125 commands with /help
```

## Step 3: Execute with Pedagogical Commentary (5 minutes)

When user selects an action (1, 2, or 3):

### Before Execution

Explain the command in simple terms:

```
▶ Running /[selected-command]...

This command will:
- [What it does technically]
- [What insights you'll gain]
- [How it helps you improve code quality / security / architecture]

This is your first value from Claude Craft — let's see what we find.
```

### During Execution

Run the selected command with appropriate arguments (usually current directory).

### After Execution

Summarize results in accessible language:

```
✓ Analysis Complete

Key Findings:
- [Summarize top 3 findings in simple language]
- [Translate technical issues to actionable items]
- [Highlight quick wins vs. longer-term improvements]

Score: [X]/100 (if applicable)

What this means:
[2-3 sentences explaining the score and next steps in plain language]
```

## Step 4: Next Steps (1 minute)

Suggest concrete follow-up actions:

```
⚡ What's Next?

Choose your path:

A. Run another check
   ℹ /[remaining-command-1] — [brief description]
   ℹ /[remaining-command-2] — [brief description]

B. Fix a finding
   → Pick one issue from the report above
   → Ask me: "Help me fix [issue description]"
   → I'll guide you through TDD (Test-Driven Development)

C. Join the community
   → Questions? Join our Discord: https://discord.gg/claude-craft
   → See community guidelines: @COMMUNITY.md

📚 Resources:
- Full quickstart guide: @docs/QUICKSTART.md (section "First 10 Minutes")
- All 125 commands: /help
- Technology-specific guides: @.claude/references/[your-tech]/

✓ You've completed your first 10 minutes with Claude Craft!

Type /workflow:init when ready to start a feature with full BMAD workflow.
```

## Example Walkthrough

### User Types: `/getting-started`

**Step 1 Output:**
```
Scanning project for technology markers...

✓ Stack Detected: React

Your project uses React 19.x. Claude Craft has 15+ specialized commands for React development.
```

**Step 2 Output:**
```
ℹ Recommended Quick Wins for React

Based on your stack, these 3 commands will give you immediate insights:

1. ✓ /react:check-code-quality — Analyze TypeScript types, ESLint config, and coding standards
   Why now? Catches common mistakes early and enforces best practices across your team.

2. ✓ /react:accessibility-check — Audit WCAG 2.2 compliance and keyboard navigation
   Why now? 15% of users need accessibility features — find issues before users do.

3. ✓ /react:bundle-analyze — Identify large dependencies bloating your bundle
   Why now? Every 100KB costs users money and slows load time — quick wins here.

Choose one to run (type the number 1-3), or skip to explore all 125 commands with /help
```

**User Types: 1**

**Step 3 Output (Before):**
```
▶ Running /react:check-code-quality...

This command will:
- Scan your components for TypeScript best practices
- Check ESLint configuration and violations
- Verify React Hooks rules and component patterns

This is your first value from Claude Craft — let's see what we find.
```

**[Command executes]**

**Step 3 Output (After):**
```
✓ Analysis Complete

Key Findings:
- 23 components missing prop type definitions (quick fix with interfaces)
- ESLint configured but 47 warnings ignored with // eslint-disable
- 12% 'any' type usage (target is <5%)

Score: 68/100

What this means:
Your TypeScript setup is solid but needs refinement. Start by fixing the 23 missing prop types (easy wins), then tackle the ESLint warnings. The 'any' usage isn't critical but reducing it improves type safety.
```

**Step 4 Output:**
```
⚡ What's Next?

Choose your path:

A. Run another check
   ℹ /react:accessibility-check — WCAG compliance audit
   ℹ /react:bundle-analyze — Bundle size analysis

B. Fix a finding
   → Pick one issue from the report above
   → Ask me: "Help me fix missing prop types in UserProfile.tsx"
   → I'll guide you through TDD (Test-Driven Development)

C. Join the community
   → Questions? Join our Discord: https://discord.gg/claude-craft
   → See community guidelines: @COMMUNITY.md

📚 Resources:
- Full quickstart guide: @docs/QUICKSTART.md (section "First 10 Minutes")
- All 125 commands: /help
- React-specific guides: @.claude/references/react/CLAUDE.md

✓ You've completed your first 10 minutes with Claude Craft!

Type /workflow:init when ready to start a feature with full BMAD workflow.
```

## Implementation Notes

### Technology Detection Logic

Use Bash tool to check for files:

```bash
# Check for package.json
test -f package.json && echo "node"

# Check for composer.json
test -f composer.json && echo "php"

# Check for pyproject.toml or requirements.txt
(test -f pyproject.toml || test -f requirements.txt) && echo "python"

# And so on...
```

For JavaScript/TypeScript, parse package.json:

```bash
# Check React
grep -q '"react"' package.json && echo "react"

# Check Angular
grep -q '"@angular/core"' package.json && echo "angular"

# Check Vue
grep -q '"vue"' package.json && echo "vuejs"

# Check React Native
grep -q '"react-native"' package.json && echo "reactnative"
```

### User Interaction

The wizard must:
1. ✅ Be conversational and welcoming
2. ✅ Use symbols (✓, ℹ, ⚠, ✗) for visual clarity
3. ✅ Keep each step under 3 minutes
4. ✅ Explain technical concepts in simple language
5. ✅ Provide clear next actions
6. ✅ Link to resources for deeper learning

### Accessibility

Follow P1-06 accessibility standards:
- ✓ Use clear symbols with text labels
- ✓ No color-only indicators
- ✅ Plain language explanations
- ✅ Clear navigation between steps

## Success Criteria

User should:
- ✓ Understand what Claude Craft does (within 2 minutes)
- ✓ Get value from their first command (within 5 minutes)
- ✓ Know what to do next (clear paths A/B/C)
- ✓ Feel confident exploring further

Time to First Value (TTFV): **< 10 minutes total**
