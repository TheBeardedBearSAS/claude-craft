# Checklist Pre-Commit

Cette checklist doit être validée **avant chaque commit**.

---

## Code Quality

- [ ] Code lint avec 0 errors (`npm run lint`)
- [ ] Code formaté avec Prettier (`npm run format`)
- [ ] TypeScript compile sans erreurs (`npm run type-check`)
- [ ] Pas de `console.log` oublié (sauf logs intentionnels)
- [ ] Pas de `// TODO` ou `// FIXME` ajouté sans issue associée
- [ ] Pas de code commenté (supprimer ou créer issue)

---

## Tests

- [ ] Tests unitaires ajoutés pour nouvelle logique
- [ ] Tests composants ajoutés pour nouveau UI
- [ ] Tous les tests passent (`npm test`)
- [ ] Coverage maintenu ou amélioré
- [ ] Tests E2E mis à jour si nécessaire

---

## Code Standards

- [ ] Conventions de nommage respectées
- [ ] Imports organisés correctement
- [ ] Pas de duplication de code (DRY)
- [ ] Commentaires JSDoc pour fonctions publiques
- [ ] Types TypeScript complets (pas de `any`)
- [ ] Composants React.memo si nécessaire
- [ ] useCallback/useMemo utilisés correctement

---

## Performance

- [ ] Pas de calculs coûteux sans memoization
- [ ] Images optimisées (taille, format)
- [ ] FlatList optimisé (si applicable)
- [ ] Pas de inline functions dans renders
- [ ] Pas de inline styles objects
- [ ] Animations utilisent `useNativeDriver`

---

## Security

- [ ] Pas de secrets/tokens dans le code
- [ ] Input validation en place
- [ ] Données sensibles dans SecureStore
- [ ] API calls utilisent HTTPS
- [ ] Pas de vulnérabilités dependencies (`npm audit`)

---

## Architecture

- [ ] Respect de l'architecture établie
- [ ] Responsabilité unique (SRP)
- [ ] Séparation des concerns
- [ ] Pas de couplage fort
- [ ] Dependency injection utilisée

---

## Documentation

- [ ] README mis à jour si nécessaire
- [ ] JSDoc ajouté pour nouvelles APIs
- [ ] Commentaires pour logique complexe
- [ ] CHANGELOG mis à jour
- [ ] Types documentés

---

## Git

- [ ] Message de commit suit Conventional Commits
- [ ] Commit atomique (une seule fonctionnalité/fix)
- [ ] Pas de fichiers non pertinents commités
- [ ] .gitignore respecté
- [ ] Branch à jour avec main/develop

---

## Final Check

- [ ] Relecture du diff complet
- [ ] Fonctionnalité testée manuellement
- [ ] Pas de breaking changes non documentés
- [ ] Ready for code review

---

**Si tous les items sont cochés ✅ → Commit autorisé**
