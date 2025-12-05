# Checklist : Nouvelle Fonctionnalité

## Phase 1 : Analyse et Planification

### Compréhension du Besoin

- [ ] Clarifier l'objectif de la fonctionnalité
- [ ] Identifier les utilisateurs cibles
- [ ] Définir les critères d'acceptation
- [ ] Lister les contraintes techniques et métier
- [ ] Identifier les dépendances avec d'autres features

### Analyse de l'Existant

- [ ] Rechercher du code similaire dans le projet
- [ ] Identifier les composants réutilisables
- [ ] Vérifier les hooks existants
- [ ] Analyser les patterns architecturaux utilisés
- [ ] Comprendre la structure de state management

### Documentation de l'Analyse

- [ ] Créer un document d'analyse technique
- [ ] Documenter les décisions architecturales
- [ ] Lister les alternatives considérées
- [ ] Justifier les choix techniques
- [ ] Estimer la complexité et le temps

## Phase 2 : Design Technique

### Architecture

- [ ] Définir la structure des dossiers
- [ ] Identifier les composants à créer
- [ ] Définir les hooks custom nécessaires
- [ ] Planifier les services API
- [ ] Concevoir la gestion d'état

### Types TypeScript

- [ ] Définir les interfaces principales
- [ ] Créer les types métier
- [ ] Définir les props des composants
- [ ] Typer les retours de hooks
- [ ] Créer les schémas de validation (Zod)

### Exemple de Structure

```
features/new-feature/
├── components/
│   ├── FeatureList.tsx
│   ├── FeatureDetail.tsx
│   └── FeatureForm.tsx
├── hooks/
│   ├── useFeatureData.ts
│   └── useFeatureMutations.ts
├── services/
│   └── feature.service.ts
├── types/
│   └── feature.types.ts
├── utils/
│   └── featureHelpers.ts
└── index.ts
```

## Phase 3 : Implémentation

### Types et Schémas

- [ ] Créer les fichiers de types
- [ ] Définir les schémas de validation Zod
- [ ] Exporter les types
- [ ] Documenter les types complexes

### Services API

- [ ] Créer le service API
- [ ] Implémenter les méthodes CRUD
- [ ] Gérer les erreurs proprement
- [ ] Typer les requêtes et réponses
- [ ] Ajouter les tests du service

### Hooks Custom

- [ ] Créer les hooks de data fetching (React Query)
- [ ] Créer les hooks de mutations
- [ ] Créer les hooks de logique métier
- [ ] Documenter les hooks avec JSDoc
- [ ] Ajouter les tests des hooks

### Composants

#### Composants de Base

- [ ] Créer les composants Atoms si nécessaire
- [ ] Créer les composants Molecules si nécessaire
- [ ] Documenter avec JSDoc
- [ ] Ajouter les Stories Storybook
- [ ] Tester les composants

#### Composants Feature

- [ ] Créer les composants spécifiques
- [ ] Séparer Container/Presenter si complexe
- [ ] Implémenter la gestion d'état
- [ ] Gérer les états de chargement/erreur
- [ ] Optimiser les performances (memo, useMemo, useCallback)

### Intégration

- [ ] Intégrer dans le routing
- [ ] Ajouter aux menus/navigation si nécessaire
- [ ] Configurer les permissions si nécessaire
- [ ] Intégrer avec le state management global
- [ ] Tester l'intégration

## Phase 4 : Tests

### Tests Unitaires

- [ ] Tests des composants (React Testing Library)
- [ ] Tests des hooks (renderHook)
- [ ] Tests des services
- [ ] Tests des utilitaires
- [ ] Coverage > 80%

### Tests d'Intégration

- [ ] Tests du flux complet de la feature
- [ ] Tests des interactions entre composants
- [ ] Tests avec MSW (mock API)
- [ ] Tests des cas d'erreur

### Tests E2E

- [ ] Tests des parcours utilisateur critiques
- [ ] Tests sur différents navigateurs si nécessaire
- [ ] Tests responsive si applicable

## Phase 5 : Qualité et Performance

### Code Quality

- [ ] Linting passé sans erreur
- [ ] Formatting appliqué
- [ ] Type-check passé
- [ ] Pas de code dupliqué
- [ ] Respect des principes SOLID
- [ ] Respect de KISS/DRY/YAGNI

### Performance

- [ ] Optimisations de rendering (memo)
- [ ] Code splitting si nécessaire
- [ ] Images optimisées
- [ ] Lazy loading implémenté
- [ ] Bundle size vérifié

### Sécurité

- [ ] Inputs validés (Zod)
- [ ] HTML sanitized si nécessaire
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Pas de secrets exposés

### Accessibilité

- [ ] Sémantique HTML correcte
- [ ] Labels et ARIA si nécessaire
- [ ] Navigation au clavier
- [ ] Contraste suffisant
- [ ] Screen reader friendly

## Phase 6 : Documentation

### Code

- [ ] JSDoc sur fonctions publiques
- [ ] Commentaires pour logique complexe
- [ ] Props documentées
- [ ] Hooks documentés

### Storybook

- [ ] Stories pour composants réutilisables
- [ ] Documentation des variants
- [ ] Exemples d'usage

### Projet

- [ ] README mis à jour si nécessaire
- [ ] Documentation technique créée
- [ ] API reference mise à jour
- [ ] CHANGELOG mis à jour

## Phase 7 : Review et Merge

### Pre-Review

- [ ] Self-review du code
- [ ] Vérification de la checklist pre-commit
- [ ] Build réussit
- [ ] Tests passent tous
- [ ] Branch à jour avec develop

### Pull Request

- [ ] PR créée avec template rempli
- [ ] Description claire et complète
- [ ] Screenshots/GIFs si UI
- [ ] Linked aux issues/tickets
- [ ] Labels appropriés

### Code Review

- [ ] Review par au moins 1 personne
- [ ] Commentaires adressés
- [ ] Approbation obtenue
- [ ] CI/CD passé

### Merge

- [ ] Conflits résolus si nécessaire
- [ ] Squash commits si nécessaire
- [ ] Message de merge clair
- [ ] Merge dans develop

## Phase 8 : Déploiement et Monitoring

### Déploiement Staging

- [ ] Feature déployée en staging
- [ ] Tests manuels en staging
- [ ] Tests de non-régression
- [ ] Validation par Product Owner si nécessaire

### Monitoring

- [ ] Logs vérifiés
- [ ] Pas d'erreurs en production
- [ ] Performance acceptable
- [ ] Analytics configurés si nécessaire

### Communication

- [ ] Équipe informée du déploiement
- [ ] Documentation partagée
- [ ] Demo si feature majeure
- [ ] Release notes mises à jour

## Checklist Rapide

Pour référence rapide, les étapes essentielles :

### Analyse

- [ ] Analyser l'existant
- [ ] Concevoir la solution
- [ ] Documenter les décisions

### Dev

- [ ] Types TypeScript
- [ ] Services API
- [ ] Hooks custom
- [ ] Composants
- [ ] Tests > 80%

### Quality

- [ ] Lint + Format + Type-check
- [ ] Performance optimisée
- [ ] Sécurité vérifiée
- [ ] Documentation complète

### Merge

- [ ] PR créée et reviewée
- [ ] Tests passent
- [ ] Build réussit
- [ ] Merge et deploy

## Questions à se Poser

1. **Ai-je réutilisé au maximum le code existant ?**
2. **La solution est-elle la plus simple possible (KISS) ?**
3. **Ai-je évité la duplication (DRY) ?**
4. **N'ai-je implémenté que ce qui est nécessaire (YAGNI) ?**
5. **Les tests couvrent-ils tous les cas ?**
6. **La feature est-elle performante ?**
7. **La feature est-elle sécurisée ?**
8. **La documentation est-elle complète ?**
9. **Un nouveau développeur pourrait-il comprendre et maintenir ce code ?**

## Estimation de Temps

Pour estimer le temps, compter :

- **Analyse** : 10-15% du temps total
- **Design** : 10-15%
- **Développement** : 40-50%
- **Tests** : 15-20%
- **Documentation** : 5-10%
- **Review et ajustements** : 10-15%

Exemple : Feature de 10h
- Analyse : 1-1.5h
- Design : 1-1.5h
- Dev : 4-5h
- Tests : 1.5-2h
- Docs : 0.5-1h
- Review : 1-1.5h
