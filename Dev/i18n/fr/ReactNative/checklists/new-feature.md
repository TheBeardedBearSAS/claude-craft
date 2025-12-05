# Checklist New Feature

Workflow complet pour développer une nouvelle fonctionnalité.

---

## Phase 1: Analysis (OBLIGATOIRE)

Voir [01-workflow-analysis.md](../rules/01-workflow-analysis.md)

- [ ] Besoin clairement compris
- [ ] User stories définies
- [ ] Critères d'acceptation listés
- [ ] Contraintes techniques identifiées
- [ ] Use cases documentés

---

## Phase 2: Design

### Architecture

- [ ] Layer impactés identifiés (Data, Logic, UI)
- [ ] Nouveaux fichiers/dossiers planifiés
- [ ] Dépendances externes identifiées
- [ ] Impact sur code existant évalué
- [ ] Pattern de design choisi (et justifié)

### Data Modeling

- [ ] Types TypeScript définis
- [ ] Interfaces créées
- [ ] DTOs définis (si API)
- [ ] Schémas validation (Zod) créés

### Technical Decisions

- [ ] State management choisi (Query/Zustand/State)
- [ ] Navigation strategy définie
- [ ] API endpoints définis
- [ ] Storage strategy définie
- [ ] Performance considérée

---

## Phase 3: Setup

### Branch & Ticket

- [ ] Ticket/Issue créé
- [ ] Branch créée (`feature/feature-name`)
- [ ] Branch à jour avec develop

### Dependencies

- [ ] Nouvelles dépendances installées
- [ ] Versions compatibles vérifiées
- [ ] `npx expo install --fix` exécuté

---

## Phase 4: Implementation

### Bottom-Up Development

#### 1. Data Layer

- [ ] Types créés dans `types/`
- [ ] Service API créé dans `services/api/`
- [ ] Service storage créé (si besoin)
- [ ] Repository créé (si logique complexe)
- [ ] Tests services écrits

#### 2. Logic Layer

- [ ] Custom hooks créés dans `hooks/`
- [ ] Store créé (si global state)
- [ ] Business logic implémentée
- [ ] Tests hooks écrits

#### 3. UI Components

- [ ] Composants UI de base créés
- [ ] Composants réutilisables créés
- [ ] Styles créés (StyleSheet)
- [ ] Tests composants écrits

#### 4. Screens

- [ ] Screen créé dans `app/` (Expo Router)
- [ ] Navigation configurée
- [ ] Intégration composants
- [ ] Tests screen écrits

#### 5. Integration

- [ ] Feature intégrée dans app
- [ ] Navigation flows testés
- [ ] Deep links configurés (si besoin)
- [ ] Tests E2E écrits

---

## Phase 5: Quality Assurance

### Code Quality

- [ ] ESLint: 0 errors, 0 warnings
- [ ] TypeScript: 0 errors (strict mode)
- [ ] Prettier: Code formaté
- [ ] Code review self-done
- [ ] Refactoring appliqué si nécessaire

### Testing

- [ ] Unit tests: Coverage > 80%
- [ ] Component tests: Tous scenarios
- [ ] Integration tests: Happy path + errors
- [ ] E2E tests: User flows complets
- [ ] Tests passent localement

### Performance

- [ ] Bundle size impact < 100kb
- [ ] Images optimisées
- [ ] FlatLists optimisées
- [ ] Animations 60 FPS
- [ ] Memory leaks vérifiés
- [ ] Network calls optimisés

### Security

- [ ] Input validation
- [ ] Données sensibles sécurisées
- [ ] API calls secured
- [ ] Pas de secrets exposés
- [ ] Dependencies audit clean

### Accessibility

- [ ] Labels accessibilité ajoutés
- [ ] Screen reader testé
- [ ] Contraste couleurs suffisant
- [ ] Touch targets 44x44+

---

## Phase 6: Documentation

- [ ] JSDoc pour fonctions publiques
- [ ] Commentaires pour logique complexe
- [ ] README mis à jour
- [ ] CHANGELOG mis à jour
- [ ] ADR créé (si décision importante)

---

## Phase 7: Manual Testing

### Fonctionnel

- [ ] Happy path testé
- [ ] Edge cases testés
- [ ] Error cases testés
- [ ] Offline behavior testé (si applicable)

### Platforms

- [ ] iOS testé
- [ ] Android testé
- [ ] Tablet testé (si supporté)
- [ ] Different screen sizes

### UX

- [ ] Animations fluides
- [ ] Loading states clairs
- [ ] Error messages utiles
- [ ] Feedback utilisateur approprié

---

## Phase 8: Code Review

- [ ] Pull Request créée
- [ ] Description claire avec screenshots
- [ ] Reviewers assignés
- [ ] CI/CD checks passent
- [ ] Feedback adressé
- [ ] Approved par au moins 1 reviewer

---

## Phase 9: Merge & Deploy

- [ ] Branch merged dans develop
- [ ] Tests passent sur develop
- [ ] Deploy sur staging
- [ ] Testing staging
- [ ] Deploy production (si approuvé)
- [ ] Monitoring post-deploy

---

## Phase 10: Cleanup

- [ ] Feature branch supprimée
- [ ] Local branches cleaned
- [ ] Ticket/Issue fermé
- [ ] Documentation finalisée

---

## Post-Launch

- [ ] Métriques collectées
- [ ] User feedback capturé
- [ ] Bugs/Issues triés
- [ ] Retrospective (si grosse feature)

---

**Workflow complet: Analysis → Design → Implementation → QA → Review → Deploy → Monitor**
