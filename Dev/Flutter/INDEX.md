# Index Complet - Flutter Development Rules

## Vue d'ensemble

Structure complète de règles de développement Flutter pour Claude Code, inspirée de la structure Symfony mais adaptée à Flutter/Dart.

**Total** : 26 fichiers
- 1 CLAUDE.md.template principal
- 1 README guide d'utilisation
- 14 fichiers de règles (rules/)
- 5 templates de code (templates/)
- 4 checklists (checklists/)
- 1 index (ce fichier)

---

## Fichiers Principaux

### CLAUDE.md.template
Fichier principal à copier dans chaque projet Flutter. Contient :
- Contexte du projet
- Règles fondamentales
- Workflow obligatoire
- Commandes Makefile
- Instructions pour Claude

### README.md
Guide d'utilisation complet :
- Comment initialiser un nouveau projet
- Structure recommandée
- Workflow de développement
- Configuration des outils

---

## Rules (14 fichiers)

### 00-project-context.md.template
Template de contexte projet avec placeholders :
- Vue d'ensemble du projet
- Architecture globale
- Stack technologique
- Spécificités et conventions
- Variables à remplacer : {{PROJECT_NAME}}, {{TECH_STACK}}, etc.

### 01-workflow-analysis.md (27 KB)
Méthodologie obligatoire avant codage :
- Phase 1 : Compréhension du besoin
- Phase 2 : Exploration du code existant
- Phase 3 : Conception de la solution
- Phase 4 : Plan de test
- Phase 5 : Estimation et planification
- Phase 6 : Revue post-implémentation
- Templates d'analyse
- Exemples concrets (feature favoris)

### 02-architecture.md (53 KB)
Clean Architecture pour Flutter :
- Les 3 couches (Domain, Data, Presentation)
- Structure de dossiers détaillée
- Entities, Repositories, Use Cases
- Models, DataSources
- BLoC pattern complet
- Dependency Injection
- Exemples de code complets

### 03-coding-standards.md (24 KB)
Standards de code Dart/Flutter :
- Conventions de nommage
- Formatage et style
- Organisation du code
- Widgets Flutter (const, extraction)
- Types et inférence
- Documentation (dartdoc)
- Extensions Dart
- Async/await
- Configuration linters

### 04-solid-principles.md (38 KB)
Principes SOLID avec exemples Flutter :
- S - Single Responsibility Principle
- O - Open/Closed Principle
- L - Liskov Substitution Principle
- I - Interface Segregation Principle
- D - Dependency Inversion Principle
- Exemples concrets pour chaque principe
- Widgets, BLoCs, repositories
- Diagrammes de dépendances

### 05-kiss-dry-yagni.md (30 KB)
Principes de simplicité :
- KISS : Keep It Simple, Stupid
- DRY : Don't Repeat Yourself
- YAGNI : You Aren't Gonna Need It
- Exemples de sur-complexification vs solutions simples
- State management adapté à la complexité
- Widgets réutilisables
- Équilibre entre principes

### 06-tooling.md (10 KB)
Outils et commandes :
- Flutter CLI essentielles
- Pub commands
- Docker pour Flutter
- Makefile complet
- FVM (Flutter Version Management)
- Scripts utiles
- CI/CD (GitHub Actions, GitLab CI)
- VS Code configuration
- DevTools

### 07-testing.md (19 KB)
Stratégie de test complète :
- Pyramide de tests (70% unit, 20% widget, 10% integration)
- Unit tests (entities, use cases, BLoCs)
- Widget tests
- Integration tests
- Golden tests
- Mocking avec Mocktail
- Test coverage
- Bonnes pratiques (AAA pattern)

### 08-quality-tools.md
Outils de qualité :
- Dart Analyze
- DCM (Dart Code Metrics)
- Very Good Analysis
- Flutter Lints
- Custom lint rules
- CI/CD integration
- Makefile targets

### 09-git-workflow.md
Workflow Git :
- Conventional Commits
- Branch strategy (GitFlow)
- Pre-commit hooks
- CI/CD
- Commandes Git utiles

### 10-documentation.md
Standards de documentation :
- Dartdoc format
- README.md structure
- CHANGELOG.md
- API documentation
- Exemples de documentation complète

### 11-security.md
Sécurité Flutter :
- flutter_secure_storage
- Gestion API keys
- Variables d'environnement
- Obfuscation
- HTTPS et certificate pinning
- Validation des entrées
- Authentication (JWT)
- Permissions
- Checklist sécurité

### 12-performance.md
Optimisation des performances :
- const widgets
- ListView optimization
- Images (caching, lazy loading)
- Éviter rebuilds
- DevTools profiling
- Lazy loading & code splitting
- Checklist performance

### 13-state-management.md
Patterns de state management :
- Decision tree (quand utiliser quoi)
- StatefulWidget
- ValueNotifier
- Provider
- Riverpod (recommandé)
- BLoC (recommandé pour apps complexes)
- Comparaison des patterns
- Best practices
- Recommandations par taille de projet

---

## Templates (5 fichiers)

### widget.md
Templates de widgets :
- Stateless Widget
- Stateful Widget
- Consumer Widget (BLoC)

### bloc.md
Template BLoC complet :
- Events
- States
- BLoC class

### repository.md
Template Repository :
- Interface (Domain layer)
- Implementation (Data layer)

### test-widget.md
Template tests de widgets :
- Setup basique
- Tests d'affichage
- Tests d'interactions
- Tests de mise à jour

### test-unit.md
Template tests unitaires :
- Setup avec mocks
- Tests de succès
- Tests d'erreur
- Tests de validation

---

## Checklists (4 fichiers)

### pre-commit.md
Checklist avant commit :
- Code quality
- Tests
- Documentation
- Git
- Architecture
- Performance
- Sécurité

### new-feature.md
Checklist nouvelle feature :
- Analyse
- Domain layer
- Data layer
- Presentation layer
- Integration
- Documentation
- Quality

### refactoring.md
Checklist refactoring sécurisé :
- Préparation
- Pendant le refactoring
- Vérifications
- Avant merge

### security.md
Checklist audit sécurité :
- Données sensibles
- API & Network
- Authentication
- Validation
- Permissions
- Production

---

## Statistiques

### Taille des fichiers

| Fichier | Taille | Lignes approx. |
|---------|--------|----------------|
| 01-workflow-analysis.md | 27 KB | ~800 |
| 02-architecture.md | 53 KB | ~1600 |
| 03-coding-standards.md | 24 KB | ~700 |
| 04-solid-principles.md | 38 KB | ~1200 |
| 05-kiss-dry-yagni.md | 30 KB | ~900 |
| 06-tooling.md | 10 KB | ~300 |
| 07-testing.md | 19 KB | ~600 |
| 08-quality-tools.md | ~5 KB | ~150 |
| 09-git-workflow.md | ~4 KB | ~120 |
| 10-documentation.md | ~5 KB | ~150 |
| 11-security.md | ~6 KB | ~180 |
| 12-performance.md | ~5 KB | ~150 |
| 13-state-management.md | ~7 KB | ~210 |
| **TOTAL Rules** | **~233 KB** | **~7060 lignes** |

### Couverture

**Sujets couverts** :
- ✅ Architecture (Clean Architecture complète)
- ✅ Coding standards (Effective Dart)
- ✅ Principes de conception (SOLID, KISS, DRY, YAGNI)
- ✅ Testing (Unit, Widget, Integration, Golden)
- ✅ Tooling (CLI, Docker, Makefile, CI/CD)
- ✅ Quality (Analyze, Linters, Metrics)
- ✅ Git workflow (Conventional Commits, Branching)
- ✅ Documentation (Dartdoc, README, CHANGELOG)
- ✅ Sécurité (Storage, API keys, HTTPS, Auth)
- ✅ Performance (Optimisations, Profiling)
- ✅ State management (BLoC, Riverpod, Provider)
- ✅ Templates de code
- ✅ Checklists pratiques

---

## Utilisation

### Pour un nouveau projet

1. Copier `CLAUDE.md.template` dans `.claude/CLAUDE.md`
2. Copier `rules/`, `templates/`, `checklists/` dans `.claude/`
3. Personnaliser avec les infos du projet
4. Créer `Makefile` à la racine
5. Configurer `analysis_options.yaml`
6. Suivre les règles !

### Pour Claude Code

Lire `.claude/CLAUDE.md` au début de chaque session pour :
- Comprendre l'architecture du projet
- Connaître les conventions
- Appliquer les bonnes pratiques
- Utiliser les templates appropriés
- Suivre les checklists

---

## Comparaison avec Symfony Rules

### Similitudes
- Structure modulaire (rules/, templates/, checklists/)
- Workflow d'analyse obligatoire
- Principes SOLID
- Testing strategy
- Git workflow
- Documentation standards

### Spécificités Flutter
- Clean Architecture (au lieu de Symfony architecture)
- Widget composition
- State management (BLoC, Riverpod)
- const optimizations
- DevTools profiling
- flutter_secure_storage
- Material Design / Cupertino

### Améliorations
- Templates de code plus détaillés
- Exemples plus nombreux
- Checklists plus complètes
- Decision trees (state management, architecture)
- Diagrammes de dépendances

---

## Maintenance

### Mise à jour

Mettre à jour les règles quand :
- Nouvelle version de Flutter/Dart
- Nouvelles best practices
- Nouveaux packages importants
- Retours d'expérience du projet

### Versioning

Format : `MAJOR.MINOR.PATCH`
- MAJOR : Changement d'architecture ou de principes
- MINOR : Ajout de règles ou templates
- PATCH : Corrections et clarifications

**Version actuelle** : 1.0.0

---

## Ressources Complémentaires

### Documentation
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Packages Essentiels
- flutter_bloc : State management
- riverpod : State management
- freezed : Code generation
- dartz : Functional programming
- get_it : Dependency injection
- dio : HTTP client
- mocktail : Testing

---

**Créé le** : 2024-12-03
**Dernière mise à jour** : 2024-12-03
**Version** : 1.0.0
**Auteur** : Claude Code Assistant
