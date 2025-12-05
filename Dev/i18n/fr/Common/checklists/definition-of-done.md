# Definition of Done (DoD)

## Checklist Générale

Une tâche est considérée comme "Done" lorsque TOUS les critères suivants sont remplis :

### Code

- [ ] Le code est écrit et respecte les conventions du projet
- [ ] Le code compile sans erreurs ni warnings
- [ ] Le code a passé la revue de code
- [ ] Le code est mergé dans la branche principale
- [ ] Les conflits de merge sont résolus

### Tests

- [ ] Tests unitaires écrits et passants (couverture > 80%)
- [ ] Tests d'intégration écrits et passants
- [ ] Tests E2E passants (si applicable)
- [ ] Tests de régression passants
- [ ] Tests manuels effectués et validés

### Documentation

- [ ] Documentation technique mise à jour (si nécessaire)
- [ ] Documentation utilisateur mise à jour (si nécessaire)
- [ ] Commentaires dans le code pour les parties complexes
- [ ] README mis à jour si nouveau setup requis
- [ ] CHANGELOG mis à jour

### Qualité

- [ ] Analyse statique passée (linter, type-checker)
- [ ] Aucune dette technique introduite (ou documentée si inévitable)
- [ ] Code review approuvée par au moins 1 développeur
- [ ] Performance vérifiée (pas de dégradation)
- [ ] Sécurité vérifiée (OWASP)

### Déploiement

- [ ] Build CI/CD passant
- [ ] Déployé en environnement de staging
- [ ] Testé en staging
- [ ] Configuration de production prête
- [ ] Rollback plan documenté (si applicable)

### Validation Métier

- [ ] Critères d'acceptation validés
- [ ] Demo au Product Owner (si applicable)
- [ ] Feedback intégré

---

## DoD par Type de Tâche

### Bug Fix

- [ ] Bug reproduit et documenté
- [ ] Cause racine identifiée
- [ ] Fix implémenté
- [ ] Test de non-régression ajouté
- [ ] Testé sur les environnements concernés

### Nouvelle Fonctionnalité

- [ ] User story comprise et validée
- [ ] Design/UX validé (si applicable)
- [ ] Implémentation complète
- [ ] Tests complets
- [ ] Feature flag si nécessaire
- [ ] Analytics/tracking configuré (si applicable)

### Refactoring

- [ ] Scope du refactoring défini
- [ ] Tests existants toujours passants
- [ ] Pas de changement de comportement
- [ ] Performance égale ou meilleure
- [ ] Code review approfondie

### Tâche Technique

- [ ] Objectif technique atteint
- [ ] Documentation technique complète
- [ ] Impact sur les autres composants vérifié
- [ ] Migration plan si nécessaire

---

## Exceptions

Les exceptions à la DoD doivent être :
1. Documentées dans le ticket
2. Approuvées par le Tech Lead
3. Suivies d'un ticket de dette technique

---

## Révision

Cette Definition of Done est révisée à chaque rétrospective de sprint si nécessaire.

Dernière mise à jour : YYYY-MM-DD
