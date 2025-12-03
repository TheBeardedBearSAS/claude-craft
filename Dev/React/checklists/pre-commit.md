# Checklist Pre-Commit

## Code Quality

### Linting et Formatting

- [ ] Code formaté avec Prettier (`pnpm run format`)
- [ ] Aucune erreur ESLint (`pnpm run lint`)
- [ ] Aucun warning ESLint non justifié
- [ ] TypeScript compile sans erreur (`pnpm run type-check`)
- [ ] Aucun `console.log` oublié (sauf `console.error` et `console.warn`)
- [ ] Aucun code commenté non nécessaire
- [ ] Aucun TODO sans ticket associé

### Types TypeScript

- [ ] Tous les types sont explicites (pas de `any`)
- [ ] Les interfaces sont bien documentées
- [ ] Les types sont exportés si réutilisables
- [ ] Pas de `@ts-ignore` ou `@ts-nocheck` injustifiés
- [ ] Utilisation de `type` vs `interface` cohérente

### Imports

- [ ] Imports organisés (React, externes, internes, types, styles)
- [ ] Pas d'imports inutilisés
- [ ] Utilisation des alias de chemin (`@/` au lieu de `../../../`)
- [ ] Imports nommés plutôt que default (sauf pages/routes)

## Tests

### Coverage

- [ ] Tests unitaires pour les nouveaux composants
- [ ] Tests unitaires pour les nouveaux hooks
- [ ] Tests d'intégration pour les nouvelles features
- [ ] Tous les tests passent (`pnpm run test`)
- [ ] Coverage maintenu > 80% (`pnpm run test:coverage`)

### Qualité des Tests

- [ ] Tests suivent le pattern AAA (Arrange, Act, Assert)
- [ ] Tests testent le comportement, pas l'implémentation
- [ ] Pas de tests fragiles (dépendant du timing)
- [ ] Mocks utilisés seulement quand nécessaire
- [ ] Tests e2e pour les parcours critiques modifiés

## Documentation

### Code

- [ ] JSDoc/TSDoc pour les fonctions publiques
- [ ] Commentaires pour la logique complexe (le "pourquoi")
- [ ] Props des composants documentées
- [ ] Hooks documentés avec exemples
- [ ] README mis à jour si changement d'architecture

### Storybook

- [ ] Stories créées pour les nouveaux composants réutilisables
- [ ] Stories couvrent les différents états
- [ ] Props documentées dans Storybook

## Architecture et Design

### Composants

- [ ] Composants suivent Single Responsibility Principle
- [ ] Pas de composants > 200 lignes (sinon découper)
- [ ] Container/Presenter séparés si logique complexe
- [ ] Props typées avec TypeScript
- [ ] Pas de props drilling excessif (> 2 niveaux)

### Hooks

- [ ] Hooks custom pour la logique réutilisable
- [ ] Hooks respectent les rules of hooks
- [ ] Pas de logique métier dans les composants
- [ ] Dépendances des hooks correctes (exhaustive-deps)

### Performance

- [ ] Utilisation de `memo` pour composants purs lourds
- [ ] Utilisation de `useMemo` pour calculs coûteux
- [ ] Utilisation de `useCallback` pour callbacks passés aux enfants
- [ ] Lazy loading pour routes et composants lourds
- [ ] Images optimisées et lazy loadées

## Sécurité

### Validation

- [ ] Tous les inputs utilisateur validés (Zod)
- [ ] Sanitization du HTML utilisateur (DOMPurify)
- [ ] URLs externes nettoyées
- [ ] Pas de secrets hardcodés
- [ ] Variables d'environnement utilisées pour secrets

### XSS/CSRF

- [ ] Pas d'usage de `dangerouslySetInnerHTML` sans sanitization
- [ ] `rel="noopener noreferrer"` sur tous les liens externes
- [ ] CSRF tokens inclus dans les mutations
- [ ] Validation côté serveur en place (vérifier avec backend)

## Git

### Commits

- [ ] Message de commit suit Conventional Commits
- [ ] Format : `type(scope): subject`
- [ ] Types valides : feat, fix, docs, style, refactor, test, chore
- [ ] Sujet en impératif ("add" pas "added")
- [ ] Sujet < 72 caractères
- [ ] Body explique le "pourquoi" si nécessaire

### Branches

- [ ] Branch nommée correctement (`feature/`, `fix/`, etc.)
- [ ] Branch à jour avec `develop`
- [ ] Conflits résolus proprement
- [ ] Pas de fichiers non intentionnels committé

## Revue Personnelle

### Lisibilité

- [ ] Code facile à comprendre
- [ ] Nommage explicite (variables, fonctions, composants)
- [ ] Pas de "magic numbers" (utiliser des constantes)
- [ ] Structure logique et cohérente

### Maintenabilité

- [ ] Pas de duplication de code (DRY)
- [ ] Code modulaire et réutilisable
- [ ] Dépendances minimales
- [ ] Pas de sur-ingénierie (YAGNI)

### Best Practices

- [ ] Suit les patterns du projet
- [ ] Respect des conventions de nommage
- [ ] Pas de code mort
- [ ] Erreurs gérées proprement

## Build

### Production

- [ ] Build réussit (`pnpm run build`)
- [ ] Pas de warnings de build
- [ ] Bundle size raisonnable
- [ ] Preview fonctionne (`pnpm run preview`)

## Checklist Rapide (Minimum)

Pour les petits changements, au minimum :

- [ ] `pnpm run lint`
- [ ] `pnpm run type-check`
- [ ] `pnpm run test`
- [ ] Commit message valide
- [ ] Build réussit

## Auto-Review Questions

Pose-toi ces questions :

1. **Clarté** : Un nouveau développeur pourrait-il comprendre ce code ?
2. **Tests** : Ai-je testé tous les cas (nominal, erreur, edge cases) ?
3. **Performance** : Y a-t-il des optimisations évidentes manquées ?
4. **Sécurité** : Ai-je validé toutes les données utilisateur ?
5. **Maintenance** : Ce code sera-t-il facile à modifier dans 6 mois ?

## Avant de Push

```bash
# Script complet de vérification
pnpm run lint:fix        # Fix linting
pnpm run format          # Format code
pnpm run type-check      # Verify types
pnpm run test            # Run tests
pnpm run build           # Verify build
```

## Automatisation

Cette checklist est en partie automatisée par :

- **Husky** : Git hooks
- **lint-staged** : Lint des fichiers staged
- **Commitlint** : Validation des messages de commit
- **CI/CD** : Vérifications automatiques sur GitHub

Mais certains points nécessitent une vérification manuelle !
