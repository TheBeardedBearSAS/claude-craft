# Règles de Développement React TypeScript pour Claude Code

## Vue d'Ensemble

Ce dossier contient un ensemble complet de règles, templates et checklists pour le développement React TypeScript avec Claude Code. Ces règles assurent la cohérence, la qualité et la maintenabilité du code dans tous vos projets React.

## Structure du Dossier

```
React/
├── CLAUDE.md.template          # Configuration principale (à copier dans votre projet)
├── README.md                   # Ce fichier
│
├── rules/                      # Règles de développement détaillées
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
│   ├── 12-performance.md          # À créer
│   ├── 13-state-management.md     # À créer
│   └── 14-styling.md              # À créer
│
├── templates/                  # Templates de code
│   ├── component.md           # Template composant React
│   ├── hook.md                # Template hook custom
│   ├── context.md             # À créer
│   ├── test-component.md      # À créer
│   └── test-hook.md           # À créer
│
└── checklists/                # Checklists de validation
    ├── pre-commit.md          # Checklist avant commit
    ├── new-feature.md         # Checklist nouvelle feature
    ├── refactoring.md         # À créer
    └── security.md            # À créer
```

## Utilisation

### 1. Initialiser un Nouveau Projet

1. **Copier CLAUDE.md.template** dans votre projet :
   ```bash
   cp CLAUDE.md.template /path/to/your/project/CLAUDE.md
   ```

2. **Remplacer les placeholders** dans CLAUDE.md :
   - `{{PROJECT_NAME}}` : Nom de votre projet
   - `{{TECH_STACK}}` : Stack technique complète
   - `{{REACT_VERSION}}` : Version de React
   - `{{TYPESCRIPT_VERSION}}` : Version de TypeScript
   - `{{BUILD_TOOL}}` : Vite, Next.js, etc.
   - `{{PACKAGE_MANAGER}}` : pnpm, npm, yarn
   - Etc.

3. **Copier rules/00-project-context.md.template** :
   ```bash
   cp rules/00-project-context.md.template /path/to/your/project/docs/project-context.md
   ```

4. **Remplir le contexte du projet** avec les informations spécifiques.

### 2. Configurer Claude Code

Dans votre projet, Claude Code lira automatiquement le fichier `CLAUDE.md` et appliquera toutes les règles définies.

### 3. Référencer les Règles

Chaque fichier de règles peut être référencé dans le CLAUDE.md principal :

```markdown
**Référence** : `rules/01-workflow-analysis.md`
```

Claude Code aura accès à toutes ces règles pour vous assister dans le développement.

## Règles Principales

### 1. Workflow d'Analyse (01-workflow-analysis.md)

**Avant d'écrire du code, TOUJOURS** :
- Analyser le code existant
- Comprendre le besoin
- Concevoir la solution
- Documenter les décisions

### 2. Architecture (02-architecture.md)

- **Feature-based** : Organisation par fonctionnalité métier
- **Atomic Design** : Hiérarchie atoms → molecules → organisms → templates
- **Container/Presenter** : Séparation logique/présentation
- **Hooks Custom** : Logique réutilisable

### 3. Standards de Code (03-coding-standards.md)

- **TypeScript Strict** : Mode strict activé
- **ESLint** : Configuration stricte
- **Prettier** : Formatage automatique
- **Conventions** : Nommage cohérent

### 4. Principes SOLID (04-solid-principles.md)

Application des principes SOLID en React avec exemples concrets.

### 5. KISS, DRY, YAGNI (05-kiss-dry-yagni.md)

- **KISS** : Simplicité avant tout
- **DRY** : Éviter la duplication intelligemment
- **YAGNI** : Implémenter uniquement ce qui est nécessaire

### 6. Tooling (06-tooling.md)

Configuration complète de :
- Vite / Next.js
- pnpm / npm
- Docker + Makefile
- Build optimization

### 7. Tests (07-testing.md)

- **Pyramide des tests** : 70% unitaires, 20% intégration, 10% E2E
- **Vitest** : Tests unitaires
- **React Testing Library** : Tests composants
- **MSW** : Mock API
- **Playwright** : Tests E2E

### 8. Qualité (08-quality-tools.md)

- **ESLint** : Linting
- **Prettier** : Formatting
- **TypeScript** : Type checking
- **Husky** : Git hooks
- **Commitlint** : Conventional commits

### 9. Git Workflow (09-git-workflow.md)

- **Git Flow** : Stratégie de branching
- **Conventional Commits** : Messages standardisés
- **Pull Requests** : Workflow de review
- **Versioning** : Semantic versioning

### 10. Documentation (10-documentation.md)

- **JSDoc/TSDoc** : Documentation du code
- **Storybook** : Documentation des composants
- **README** : Documentation du projet
- **Changelog** : Historique des versions

### 11. Sécurité (11-security.md)

- **XSS Prevention** : Sanitization du HTML
- **CSRF Protection** : Tokens et validation
- **Input Validation** : Zod schemas
- **Authentication** : JWT, protected routes
- **Dependencies** : Audit régulier

## Templates de Code

### Composant React (templates/component.md)

Template complet pour créer des composants React avec :
- TypeScript
- Props typées
- JSDoc
- Tests
- Storybook

### Hook Custom (templates/hook.md)

Template pour créer des hooks custom avec :
- TypeScript
- Documentation
- Tests
- Exemples d'usage

## Checklists

### Pre-Commit (checklists/pre-commit.md)

Checklist à vérifier avant chaque commit :
- Code quality
- Tests
- Documentation
- Sécurité
- Git

### Nouvelle Feature (checklists/new-feature.md)

Workflow complet pour implémenter une nouvelle fonctionnalité :
1. Analyse et planification
2. Design technique
3. Implémentation
4. Tests
5. Qualité et performance
6. Documentation
7. Review et merge
8. Déploiement et monitoring

## Commandes Utiles

### Développement

```bash
# Créer un nouveau projet React + TypeScript
npm create vite@latest my-app -- --template react-ts
cd my-app
pnpm install

# Copier les règles
cp /path/to/React/CLAUDE.md.template ./CLAUDE.md
```

### Qualité

```bash
# Vérifier tout
pnpm run quality

# Détail
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build
```

## Fichiers Restants à Créer

Pour compléter ce système de règles, il reste à créer :

### Rules

- [ ] `12-performance.md` : Optimisations React (memo, lazy, code splitting)
- [ ] `13-state-management.md` : React Query, Zustand, Context API
- [ ] `14-styling.md` : Tailwind, CSS Modules, styled-components

### Templates

- [ ] `context.md` : Template de Context Provider
- [ ] `test-component.md` : Template de test composant
- [ ] `test-hook.md` : Template de test hook

### Checklists

- [ ] `refactoring.md` : Checklist de refactoring sécurisé
- [ ] `security.md` : Audit de sécurité complet

## Contribution

Pour améliorer ces règles :

1. Créer une branche `feature/improve-react-rules`
2. Modifier les fichiers de règles
3. Tester sur un projet réel
4. Créer une Pull Request avec les améliorations

## Ressources

### Documentation Officielle

- React : https://react.dev
- TypeScript : https://www.typescriptlang.org
- Vite : https://vitejs.dev
- TanStack Query : https://tanstack.com/query
- React Router : https://reactrouter.com

### Outils Recommandés

- Vite : Build tool rapide
- pnpm : Gestionnaire de paquets performant
- Vitest : Testing framework rapide
- Playwright : Tests E2E
- Storybook : Documentation des composants

## Licence

Ces règles sont fournies "as-is" pour utilisation avec Claude Code.

## Support

Pour questions ou suggestions :
- Créer une issue dans le repository
- Consulter la documentation Claude Code

---

**Dernière mise à jour** : 2025-12-03
**Version** : 1.0.0
**Mainteneur** : TheBeardedCTO
