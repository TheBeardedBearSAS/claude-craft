# Checklist Release

## Pré-Release (J-7 à J-1)

### Planning

- [ ] Date de release confirmée
- [ ] Scope de la release finalisé (features, fixes)
- [ ] Release notes rédigées
- [ ] Communication planifiée (interne + externe)
- [ ] Support informé des changements
- [ ] Documentation mise à jour

### Code

- [ ] Feature freeze respecté
- [ ] Toutes les PRs mergées
- [ ] Code review complètes
- [ ] Aucun TODO critique en suspens
- [ ] Branche release créée (si applicable)
- [ ] Version bumped (package.json, build.gradle, etc.)

### Tests

- [ ] Tests unitaires passants (100%)
- [ ] Tests d'intégration passants
- [ ] Tests E2E passants
- [ ] Tests de performance validés
- [ ] Tests de sécurité validés
- [ ] Tests de régression complets
- [ ] UAT (User Acceptance Testing) validé

### Infrastructure

- [ ] Environnement de production prêt
- [ ] Configuration de production vérifiée
- [ ] Scaling configuré si nécessaire
- [ ] Monitoring en place
- [ ] Alertes configurées
- [ ] Backups vérifiés

---

## Jour de Release (J-Day)

### Avant le Déploiement

- [ ] Team release briefée
- [ ] Channels de communication prêts (Slack, email)
- [ ] Rollback plan prêt et testé
- [ ] Fenêtre de maintenance communiquée (si applicable)
- [ ] Support en standby
- [ ] Base de données backupée

### Déploiement

- [ ] Déploiement en staging final OK
- [ ] Smoke tests en staging OK
- [ ] Tag de release créé
- [ ] Déploiement en production lancé
- [ ] Monitoring surveillé pendant le déploiement
- [ ] Smoke tests en production OK

### Vérification Post-Déploiement

- [ ] Application accessible
- [ ] Fonctionnalités critiques vérifiées
- [ ] Pas d'erreurs dans les logs
- [ ] Métriques de performance normales
- [ ] Pas d'alertes déclenchées
- [ ] Intégrations tierces fonctionnelles

---

## Post-Release (J+1 à J+7)

### Monitoring

- [ ] Taux d'erreur normal (< 0.1%)
- [ ] Temps de réponse acceptable
- [ ] Pas de dégradation de performance
- [ ] Feedback utilisateurs collecté
- [ ] Tickets support suivis

### Communication

- [ ] Release notes publiées
- [ ] Équipe interne informée
- [ ] Clients/utilisateurs notifiés
- [ ] Blog post / changelog mis à jour

### Documentation

- [ ] Documentation technique à jour
- [ ] Runbook mis à jour si nécessaire
- [ ] Post-mortem si incidents
- [ ] Leçons apprises documentées

### Cleanup

- [ ] Branches de release mergées/supprimées
- [ ] Feature flags nettoyés
- [ ] Environnements de test nettoyés
- [ ] Ressources temporaires supprimées

---

## Checklist Rollback

En cas de problème critique :

- [ ] Décision de rollback prise (critères définis à l'avance)
- [ ] Communication immédiate à l'équipe
- [ ] Rollback exécuté
- [ ] Vérification du rollback
- [ ] Communication aux utilisateurs
- [ ] Post-mortem planifié

### Critères de Rollback

- [ ] Taux d'erreur > 5%
- [ ] Fonctionnalité critique non fonctionnelle
- [ ] Perte de données détectée
- [ ] Faille de sécurité découverte
- [ ] Impact business majeur

---

## Types de Release

### Release Majeure (X.0.0)

- [ ] Tous les critères ci-dessus
- [ ] Communication marketing
- [ ] Training équipe support
- [ ] Migration guide si breaking changes
- [ ] Beta testing préalable

### Release Mineure (x.Y.0)

- [ ] Critères standard
- [ ] Release notes détaillées
- [ ] Notification aux utilisateurs

### Patch (x.y.Z)

- [ ] Tests ciblés sur le fix
- [ ] Déploiement rapide possible
- [ ] Communication si critique

### Hotfix

- [ ] Processus accéléré
- [ ] Tests minimaux mais essentiels
- [ ] Déploiement immédiat
- [ ] Post-mortem obligatoire

---

## Contacts d'Urgence

| Rôle | Nom | Contact |
|------|-----|---------|
| Release Manager | | |
| Tech Lead | | |
| DevOps | | |
| Support Lead | | |
| Product Owner | | |

---

## Historique des Releases

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| | | | |
