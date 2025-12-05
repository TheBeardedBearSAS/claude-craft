# Installation & Setup Guide

Installation and configuration guide for React Native rules for Claude Code.

---

## 🚀 Quick Start (5 minutes)

### Option 1: New React Native Project

```bash
# 1. Create Expo project
npx create-expo-app my-app --template blank-typescript
cd my-app

# 2. Create .claude folder
mkdir -p .claude

# 3. Copy CLAUDE.md template
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. (Optional) Copy all rules
cp -r /path/to/ReactNative/rules/ .claude/rules/
cp -r /path/to/ReactNative/templates/ .claude/templates/
cp -r /path/to/ReactNative/checklists/ .claude/checklists/

# 5. Customize .claude/CLAUDE.md
# Replace {{PROJECT_NAME}}, {{TECH_STACK}}, etc.
```

### Option 2: Existing Project

```bash
# 1. Go to project
cd my-existing-app

# 2. Create .claude folder (if it doesn't exist)
mkdir -p .claude

# 3. Copy template
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. Adapt progressively
# Start with CLAUDE.md, then add rules as needed
```

---

## 📋 CLAUDE.md Customization

Open `.claude/CLAUDE.md` and replace the placeholders:

### Required Placeholders

```markdown
{{PROJECT_NAME}}           → Project name (e.g., "MyAwesomeApp")
{{TECH_STACK}}             → Tech stack (e.g., "React Native, Expo, TypeScript")
{{PROJECT_DESCRIPTION}}    → Project description
{{GOAL_1}}                 → Goal 1
{{GOAL_2}}                 → Goal 2
{{GOAL_3}}                 → Goal 3
```

### Technical Placeholders

```markdown
{{REACT_NATIVE_VERSION}}   → React Native version (e.g., "0.73")
{{EXPO_SDK_VERSION}}       → Expo SDK version (e.g., "50")
{{TYPESCRIPT_VERSION}}     → TypeScript version (e.g., "5.3")
{{NODE_VERSION}}           → Node version (e.g., "18")
```

### API Placeholders

```markdown
{{DEV_API_URL}}            → Dev API URL
{{PROD_API_URL}}           → Production API URL
{{AUTH_METHOD}}            → Auth method (e.g., "JWT")
```

### Team Placeholders

```markdown
{{TECH_LEAD}}              → Tech lead name
{{PRODUCT_OWNER}}          → PO name
{{BACKEND_LEAD}}           → Backend lead name
{{SLACK_CHANNEL}}          → Slack channel
{{JIRA_PROJECT}}           → JIRA project
```

---

## 🎯 Configuration by Project Type

### Simple Project (MVP)

**Minimum recommended**:
```
.claude/
└── CLAUDE.md              # Customized template
```

**Essential rules to copy**:
- `01-workflow-analysis.md` - Mandatory analysis
- `02-architecture.md` - Architecture
- `03-coding-standards.md` - Standards

### Medium Project

**Recommended**:
```
.claude/
├── CLAUDE.md
├── rules/
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 07-testing.md
│   └── 11-security.md
└── checklists/
    └── pre-commit.md
```

### Complex / Enterprise Project

**Complete configuration**:
```
.claude/
├── CLAUDE.md
├── rules/                 # All 15 rules
├── templates/             # All templates
└── checklists/            # All checklists
```

---

## 🔧 Environment Configuration

### 1. Install Dependencies

```bash
# Core
npm install react-native expo

# Navigation
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# State Management
npm install @tanstack/react-query zustand react-native-mmkv

# Forms & Validation
npm install react-hook-form zod

# Dev Dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev typescript
npm install --save-dev eslint prettier
npm install --save-dev jest @testing-library/react-native
npm install --save-dev husky lint-staged
```

### 2. Configure TypeScript

```bash
# Generate tsconfig.json if it doesn't exist
npx tsc --init

# Or copy recommended config from rules/03-coding-standards.md
```

### 3. Configure ESLint

```bash
# Create .eslintrc.js
# Copy config from rules/08-quality-tools.md
```

### 4. Configure Prettier

```bash
# Create .prettierrc.js
# Copy config from rules/08-quality-tools.md
```

### 5. Configure Husky (Pre-commit)

```bash
# Install Husky
npm install --save-dev husky lint-staged
npx husky init

# Configure pre-commit hook
# See rules/08-quality-tools.md
```

---

## 📱 app.json Configuration

```json
{
  "expo": {
    "name": "{{PROJECT_NAME}}",
    "slug": "{{PROJECT_SLUG}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "myapp",
    "jsEngine": "hermes",
    "plugins": ["expo-router"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.company.myapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.company.myapp"
    }
  }
}
```

---

## 🧪 Installation Verification

### Checklist

```bash
# 1. Structure
[ ] .claude/CLAUDE.md exists and is customized
[ ] .claude/rules/ exists (if copied)
[ ] .claude/templates/ exists (if copied)
[ ] .claude/checklists/ exists (if copied)

# 2. Configuration
[ ] tsconfig.json configured (strict mode)
[ ] .eslintrc.js configured
[ ] .prettierrc.js configured
[ ] package.json scripts (lint, format, test)

# 3. Dependencies
[ ] React Native + Expo installed
[ ] TypeScript installed
[ ] ESLint + Prettier installed
[ ] Testing libraries installed

# 4. Git
[ ] .gitignore complete
[ ] Husky configured (optional)
[ ] Branch main/develop created

# 5. Tests
[ ] npm run lint works
[ ] npm run type-check works
[ ] npm test works
[ ] npx expo start works
```

### Test Commands

```bash
# Type checking
npm run type-check
# → Should pass without errors

# Linting
npm run lint
# → Should pass without errors

# Formatting check
npm run format:check
# → Should pass

# Tests
npm test
# → Should pass (if tests configured)

# Run app
npx expo start
# → Should start without errors
```

---

## 🎓 Team Training

### New Developer Onboarding

1. **Read README.md** (5 min)
2. **Read project's CLAUDE.md** (10 min)
3. **Read essential rules**:
   - 01-workflow-analysis.md (15 min)
   - 02-architecture.md (20 min)
   - 03-coding-standards.md (15 min)
4. **Explore templates** (10 min)
5. **Test workflow** with a small task (30 min)

**Total**: ~1h30

### Continuous Training

- **Weekly**: Review one rule as a team (15 min)
- **Sprint**: Retrospective on rules application
- **Monthly**: Update rules if necessary

---

## 🔄 Updates

### Check for New Versions

```bash
# Go to ReactNative source folder
cd /path/to/ReactNative

# Pull latest (if git repo)
git pull origin main

# Compare versions
diff .claude/CLAUDE.md CLAUDE.md.template
```

### Apply Updates

```bash
# Backup current
cp .claude/CLAUDE.md .claude/CLAUDE.md.backup

# Update rules
cp /path/to/ReactNative/rules/XX-rule.md .claude/rules/

# Merge changes
# Compare backup and new file
```

---

## 💡 Tips

### For Claude Code

Claude Code automatically detects `.claude/CLAUDE.md` in the project.

**No additional configuration needed!**

### For the Team

- **Commit `.claude/`** in git to share with team
- **Review rules** together regularly
- **Adapt** rules to project context
- **Document** specific decisions in CLAUDE.md

### Troubleshooting

**Claude doesn't see CLAUDE.md**:
- Check that file is at `.claude/CLAUDE.md`
- Check read permissions
- Restart Claude Code

**ESLint errors too strict**:
- Adapt `.eslintrc.js` to project
- Document exceptions in CLAUDE.md

**Tests fail**:
- Check Jest configuration
- Check necessary mocks
- See `rules/07-testing.md`

---

## 📞 Support

### Documentation
- README.md - Overview
- SUMMARY.md - Complete summary
- rules/ - Detailed rules

### Issues
If problem with rules:
1. Check SUMMARY.md
2. Read related rule
3. Adapt to context

---

## ✅ Complete Installation!

After following this guide, you should have:

✅ `.claude/` structure configured
✅ CLAUDE.md customized
✅ Rules copied (if complete option)
✅ Environment configured (TypeScript, ESLint, etc.)
✅ Dependencies installed
✅ Verification tests passed
✅ Team trained

**Ready to develop with quality!** 🚀

---

**Version**: 1.0.0
**Guide created on**: 2025-12-03
