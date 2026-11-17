# React Native Development Rules for Claude Code

Règles de développement complètes pour React Native (TypeScript + Expo) destinées à Claude Code.

---

## 📁 Structure

```
ReactNative/
├── README.md                           # Ce fichier
├── CLAUDE.md.template                  # Template principal pour projets
├── rules/                              # Règles détaillées (15 fichiers)
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-performance.md
│   ├── 13-state-management.md
│   └── 14-navigation.md
├── templates/                          # Templates de code
│   ├── screen.md
│   ├── component.md
│   ├── hook.md
│   └── test-component.md
└── checklists/                         # Checklists de validation
    ├── pre-commit.md
    ├── new-feature.md
    ├── refactoring.md
    └── security.md
```

---

## 🚀 Quick Start

### Pour un Nouveau Projet

1. **Copier le template**:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/.claude/CLAUDE.md
   ```

2. **Customiser**:
   - Remplacer `{{PROJECT_NAME}}` par le nom du projet
   - Remplacer `{{TECH_STACK}}` par la stack technique
   - Remplir les informations spécifiques

3. **Copier les règles** (optionnel mais recommandé):
   ```bash
   cp -r rules/ /path/to/your/project/.claude/rules/
   cp -r templates/ /path/to/your/project/.claude/templates/
   cp -r checklists/ /path/to/your/project/.claude/checklists/
   ```

### Pour un Projet Existant

1. **Adapter progressivement**:
   - Commencer par CLAUDE.md
   - Ajouter les règles prioritaires
   - Intégrer les checklists
   - Adopter les templates

---

## 📚 Documentation

### Règles par Catégorie

#### Fondamentaux
- **00-project-context**: Template de contexte projet
- **01-workflow-analysis**: Processus d'analyse obligatoire
- **02-architecture**: Architecture React Native/Expo
- **03-coding-standards**: Standards TypeScript/React Native

#### Principes de Design
- **04-solid-principles**: SOLID adapté à React Native
- **05-kiss-dry-yagni**: Principes de simplicité

#### Outils & Qualité
- **06-tooling**: Expo CLI, EAS, Metro
- **07-testing**: Jest, Testing Library, Detox
- **08-quality-tools**: ESLint, Prettier, TypeScript
- **09-git-workflow**: Git & Conventional Commits
- **10-documentation**: Standards de documentation

#### Production
- **11-security**: Sécurité mobile (SecureStore, etc.)
- **12-performance**: Optimisations (Hermes, FlatList, etc.)
- **13-state-management**: React Query, Zustand, MMKV
- **14-navigation**: Expo Router

---

## 🎯 Règles Fondamentales

### RÈGLE #1: ANALYSE OBLIGATOIRE
**Avant tout code, analyse complète.**

Voir: [rules/01-workflow-analysis.md](./rules/01-workflow-analysis.md)

### RÈGLE #2: ARCHITECTURE FIRST
**Respecter l'architecture établie.**

Voir: [rules/02-architecture.md](./rules/02-architecture.md)

### RÈGLE #3: STANDARDS DE CODE
**TypeScript strict, ESLint, Prettier.**

Voir: [rules/03-coding-standards.md](./rules/03-coding-standards.md)

### RÈGLE #4: PRINCIPES SOLID
**Appliquer SOLID, KISS, DRY, YAGNI.**

Voir: [rules/04-solid-principles.md](./rules/04-solid-principles.md)

### RÈGLE #5: TESTS OBLIGATOIRES
**Coverage > 80%.**

Voir: [rules/07-testing.md](./rules/07-testing.md)

### RÈGLE #6: SÉCURITÉ
**Security by design.**

Voir: [rules/11-security.md](./rules/11-security.md)

### RÈGLE #7: PERFORMANCE
**60 FPS target.**

Voir: [rules/12-performance.md](./rules/12-performance.md)

---

## 📋 Templates

### Screen Component
Template complet pour créer un nouveau screen avec Expo Router.

Voir: [templates/screen.md](./templates/screen.md)

### Reusable Component
Template pour composant réutilisable avec types, styles, tests.

Voir: [templates/component.md](./templates/component.md)

### Custom Hook
Template pour custom hook avec React Query ou logique custom.

Voir: [templates/hook.md](./templates/hook.md)

### Component Test
Template complet de tests pour composants.

Voir: [templates/test-component.md](./templates/test-component.md)

---

## ✅ Checklists

### Pre-Commit
Validation avant chaque commit.

Voir: [checklists/pre-commit.md](./checklists/pre-commit.md)

**Points clés**:
- Code lint (0 errors)
- Tests passent
- Coverage maintenu
- Performance OK
- Security check

### New Feature
Workflow complet pour nouvelle feature.

Voir: [checklists/new-feature.md](./checklists/new-feature.md)

**Phases**:
1. Analysis
2. Design
3. Setup
4. Implementation (bottom-up)
5. Quality Assurance
6. Documentation
7. Manual Testing
8. Code Review
9. Merge & Deploy
10. Cleanup

### Refactoring
Processus sécurisé de refactoring.

Voir: [checklists/refactoring.md](./checklists/refactoring.md)

**Approche**:
- Tests avant
- Petits commits
- Tests continuellement
- Comportement préservé

### Security Audit
Audit de sécurité complet.

Voir: [checklists/security.md](./checklists/security.md)

**Domaines**:
- Sensitive data storage
- API security
- Input validation
- Authentication
- Dependencies

---

## 🛠 Stack Recommandée

### Core
- React Native
- Expo SDK
- TypeScript
- Node.js

### Navigation
- **Expo Router** (file-based routing)

### State Management
- **React Query** (server state)
- **Zustand** (global client state)
- **MMKV** (persistence)

### UI
- StyleSheet (native)
- Reanimated (animations)
- Gesture Handler

### Forms & Validation
- React Hook Form
- Zod

### Testing
- Jest
- React Native Testing Library
- Detox (E2E)

### Tools
- ESLint
- Prettier
- Husky
- EAS CLI

---

## 📖 Usage avec Claude Code

### Configuration Globale

Ajouter dans `~/.claude/CLAUDE.md`:

```markdown
# React Native Projects

Pour les projets React Native, suivre les règles:
/path/to/ReactNative/CLAUDE.md.template

Voir documentation complète:
/path/to/ReactNative/
```

### Configuration Par Projet

Dans le projet React Native:

```
my-react-native-app/
├── .claude/
│   ├── CLAUDE.md           # Copié de CLAUDE.md.template
│   ├── rules/              # (optionnel) Copié de rules/
│   ├── templates/          # (optionnel) Copié de templates/
│   └── checklists/         # (optionnel) Copié de checklists/
├── src/
├── app/
└── package.json
```

Claude Code lira automatiquement `.claude/CLAUDE.md`.

---

## 🎓 Philosophie

### Analyse First
**Think First, Code Later**

Toujours commencer par:
1. Comprendre le besoin
2. Analyser l'existant
3. Concevoir la solution
4. PUIS coder

### Architecture Matters
**Structure claire = Code maintenable**

- Feature-based organization
- Separation of concerns
- Clean architecture layers

### Quality Over Speed
**Un code de qualité fait gagner du temps**

- Tests dès le début
- Code review systématique
- Standards stricts
- Refactoring continu

### Security by Design
**La sécurité n'est pas une option**

- Tokens dans SecureStore
- Input validation
- HTTPS only
- Dependencies audit

### Performance First
**60 FPS target**

- Hermes engine
- Optimizations (memo, FlatList)
- Images optimized
- Native driver animations

---

## 🔄 Workflow Type

### Feature Development

```
Besoin reçu
    ↓
ANALYSE (obligatoire)
    ↓
Design & Planning
    ↓
Setup (branch, ticket)
    ↓
Implementation (bottom-up)
    ├── 1. Types
    ├── 2. Services
    ├── 3. Hooks
    ├── 4. Components
    ├── 5. Screens
    └── 6. Integration
    ↓
Tests
    ↓
Quality Check
    ↓
Documentation
    ↓
Code Review
    ↓
Merge & Deploy
    ↓
Monitor
```

---

## 📊 Métriques Qualité

### Targets

- **Code Coverage**: > 80%
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 errors (strict mode)
- **npm audit**: 0 vulnerabilities
- **Bundle Size**: < 10MB
- **Startup Time**: < 3s
- **FPS**: 60 constant

---

## 🤝 Contributing

Pour améliorer ces règles:

1. Fork / Clone
2. Créer branch (`feature/improvement`)
3. Modifier les règles
4. Tester avec un vrai projet
5. Documenter les changements
6. Pull Request

---

## 📄 License

MIT

---

## 👥 Auteurs

- **Créateur**: The Bearded Bear
- **Contributeurs**: Voir CONTRIBUTORS.md

---

## 🔗 Ressources

### Documentation Officielle
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Guides
- [React Query Docs](https://tanstack.com/query)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

### Best Practices
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-03

**Remember**: Ces règles sont des guides, pas des dogmes. Adaptez-les à votre contexte.
