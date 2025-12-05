# Installation & Setup Guide

Guide d'installation et configuration des règles React Native pour Claude Code.

---

## 🚀 Quick Start (5 minutes)

### Option 1: Nouveau Projet React Native

```bash
# 1. Créer projet Expo
npx create-expo-app my-app --template blank-typescript
cd my-app

# 2. Créer dossier .claude
mkdir -p .claude

# 3. Copier template CLAUDE.md
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. (Optionnel) Copier toutes les règles
cp -r /path/to/ReactNative/rules/ .claude/rules/
cp -r /path/to/ReactNative/templates/ .claude/templates/
cp -r /path/to/ReactNative/checklists/ .claude/checklists/

# 5. Personnaliser .claude/CLAUDE.md
# Remplacer {{PROJECT_NAME}}, {{TECH_STACK}}, etc.
```

### Option 2: Projet Existant

```bash
# 1. Aller dans projet
cd my-existing-app

# 2. Créer dossier .claude (si n'existe pas)
mkdir -p .claude

# 3. Copier template
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. Adapter progressivement
# Commencer par CLAUDE.md, puis ajouter règles au besoin
```

---

## 📋 Personnalisation CLAUDE.md

Ouvrir `.claude/CLAUDE.md` et remplacer les placeholders:

### Placeholders Obligatoires

```markdown
{{PROJECT_NAME}}           → Nom du projet (ex: "MyAwesomeApp")
{{TECH_STACK}}             → Stack technique (ex: "React Native, Expo, TypeScript")
{{PROJECT_DESCRIPTION}}    → Description du projet
{{GOAL_1}}                 → Objectif 1
{{GOAL_2}}                 → Objectif 2
{{GOAL_3}}                 → Objectif 3
```

### Placeholders Techniques

```markdown
{{REACT_NATIVE_VERSION}}   → Version React Native (ex: "0.73")
{{EXPO_SDK_VERSION}}       → Version Expo SDK (ex: "50")
{{TYPESCRIPT_VERSION}}     → Version TypeScript (ex: "5.3")
{{NODE_VERSION}}           → Version Node (ex: "18")
```

### Placeholders API

```markdown
{{DEV_API_URL}}            → URL API dev
{{PROD_API_URL}}           → URL API production
{{AUTH_METHOD}}            → Méthode auth (ex: "JWT")
```

### Placeholders Équipe

```markdown
{{TECH_LEAD}}              → Tech lead name
{{PRODUCT_OWNER}}          → PO name
{{BACKEND_LEAD}}           → Backend lead name
{{SLACK_CHANNEL}}          → Slack channel
{{JIRA_PROJECT}}           → JIRA project
```

---

## 🎯 Configuration par Type de Projet

### Projet Simple (MVP)

**Minimum recommandé**:
```
.claude/
└── CLAUDE.md              # Template personnalisé
```

**Règles essentielles à copier**:
- `01-workflow-analysis.md` - Analyse obligatoire
- `02-architecture.md` - Architecture
- `03-coding-standards.md` - Standards

### Projet Moyen

**Recommandé**:
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

### Projet Complexe / Enterprise

**Configuration complète**:
```
.claude/
├── CLAUDE.md
├── rules/                 # Toutes les 15 règles
├── templates/             # Tous les templates
└── checklists/            # Toutes les checklists
```

---

## 🔧 Configuration Environnement

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
# Générer tsconfig.json si n'existe pas
npx tsc --init

# Ou copier config recommandée depuis rules/03-coding-standards.md
```

### 3. Configure ESLint

```bash
# Créer .eslintrc.js
# Copier config depuis rules/08-quality-tools.md
```

### 4. Configure Prettier

```bash
# Créer .prettierrc.js
# Copier config depuis rules/08-quality-tools.md
```

### 5. Configure Husky (Pre-commit)

```bash
# Install Husky
npm install --save-dev husky lint-staged
npx husky init

# Configure pre-commit hook
# Voir rules/08-quality-tools.md
```

---

## 📱 Configuration app.json

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

## 🧪 Vérification Installation

### Checklist

```bash
# 1. Structure
[ ] .claude/CLAUDE.md existe et est personnalisé
[ ] .claude/rules/ existe (si copié)
[ ] .claude/templates/ existe (si copié)
[ ] .claude/checklists/ existe (si copié)

# 2. Configuration
[ ] tsconfig.json configuré (strict mode)
[ ] .eslintrc.js configuré
[ ] .prettierrc.js configuré
[ ] package.json scripts (lint, format, test)

# 3. Dependencies
[ ] React Native + Expo installés
[ ] TypeScript installé
[ ] ESLint + Prettier installés
[ ] Testing libraries installées

# 4. Git
[ ] .gitignore complet
[ ] Husky configuré (optionnel)
[ ] Branch main/develop créées

# 5. Tests
[ ] npm run lint fonctionne
[ ] npm run type-check fonctionne
[ ] npm test fonctionne
[ ] npx expo start fonctionne
```

### Commandes Test

```bash
# Type checking
npm run type-check
# → Devrait passer sans erreur

# Linting
npm run lint
# → Devrait passer sans erreur

# Formatting check
npm run format:check
# → Devrait passer

# Tests
npm test
# → Devrait passer (si tests configurés)

# Run app
npx expo start
# → Devrait démarrer sans erreur
```

---

## 🎓 Formation Équipe

### Onboarding Nouveau Dev

1. **Lire README.md** (5 min)
2. **Lire CLAUDE.md** du projet (10 min)
3. **Lire règles essentielles**:
   - 01-workflow-analysis.md (15 min)
   - 02-architecture.md (20 min)
   - 03-coding-standards.md (15 min)
4. **Explorer templates** (10 min)
5. **Tester workflow** avec une petite tâche (30 min)

**Total**: ~1h30

### Formation Continue

- **Weekly**: Review d'une règle en équipe (15 min)
- **Sprint**: Retrospective sur application des règles
- **Monthly**: Update des règles si nécessaire

---

## 🔄 Mise à Jour

### Vérifier Nouvelles Versions

```bash
# Aller dans dossier ReactNative source
cd /path/to/ReactNative

# Pull latest (si git repo)
git pull origin main

# Comparer versions
diff .claude/CLAUDE.md CLAUDE.md.template
```

### Appliquer Updates

```bash
# Backup current
cp .claude/CLAUDE.md .claude/CLAUDE.md.backup

# Update rules
cp /path/to/ReactNative/rules/XX-rule.md .claude/rules/

# Merge changes
# Comparer backup et nouveau fichier
```

---

## 💡 Tips

### Pour Claude Code

Claude Code détecte automatiquement `.claude/CLAUDE.md` dans le projet.

**Pas besoin de configuration supplémentaire!**

### Pour l'Équipe

- **Commit `.claude/`** dans git pour partager avec équipe
- **Review règles** ensemble régulièrement
- **Adapter** les règles au contexte du projet
- **Documenter** les décisions spécifiques dans CLAUDE.md

### Troubleshooting

**Claude ne voit pas CLAUDE.md**:
- Vérifier que fichier est à `.claude/CLAUDE.md`
- Vérifier permissions de lecture
- Redémarrer Claude Code

**ESLint errors trop stricts**:
- Adapter `.eslintrc.js` au projet
- Documenter exceptions dans CLAUDE.md

**Tests fail**:
- Vérifier Jest configuration
- Vérifier mocks nécessaires
- Voir `rules/07-testing.md`

---

## 📞 Support

### Documentation
- README.md - Vue d'ensemble
- SUMMARY.md - Récapitulatif complet
- rules/ - Règles détaillées

### Issues
Si problème avec les règles:
1. Vérifier SUMMARY.md
2. Lire règle concernée
3. Adapter au contexte

---

## ✅ Installation Complète!

Après avoir suivi ce guide, vous devriez avoir:

✅ Structure `.claude/` configurée
✅ CLAUDE.md personnalisé
✅ Règles copiées (si option complète)
✅ Environment configuré (TypeScript, ESLint, etc.)
✅ Dependencies installées
✅ Verification tests passed
✅ Équipe formée

**Prêt à développer avec qualité!** 🚀

---

**Version**: 1.0.0
**Guide créé le**: 2025-12-03
