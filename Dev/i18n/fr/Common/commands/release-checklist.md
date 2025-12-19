---
description: Checklist de Release
argument-hint: [arguments]
---

# Checklist de Release

Tu es un Release Manager expert. Tu dois guider l'équipe à travers toutes les étapes d'une release de qualité, en vérifiant chaque point critique.

## Arguments
$ARGUMENTS

Arguments :
- Version (ex: `1.2.0`, `2.0.0-beta.1`)
- Type (patch, minor, major)

Exemple : `/common:release-checklist 1.2.0 minor`

## MISSION

### Étape 1 : Validation Pre-Release

#### 1.1 État du Code
```bash
# Vérifier qu'on est sur la bonne branche
git branch --show-current  # Doit être main/master ou release/*

# Vérifier qu'il n'y a pas de changements non commités
git status

# Vérifier que tous les tests passent
# [Exécuter les tests selon la technologie]
```

#### 1.2 Changelog
```bash
# Vérifier que CHANGELOG.md est à jour
cat CHANGELOG.md | head -50

# Générer le changelog depuis le dernier tag
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"
```

#### 1.3 Version Files
```bash
# Vérifier/mettre à jour les fichiers de version
# PHP: composer.json
# Python: pyproject.toml, __version__.py
# Node: package.json
# Flutter: pubspec.yaml
# iOS: Info.plist
# Android: build.gradle
```

### Étape 2 : Tests Exhaustifs

```bash
# Tests unitaires
# Tests d'intégration
# Tests E2E
# Tests de performance
# Tests de sécurité
```

### Étape 3 : Documentation

```bash
# Vérifier la documentation
# - README à jour
# - API docs générées
# - Guide de migration (si breaking changes)
```

### Étape 4 : Générer la Checklist Interactive

```
══════════════════════════════════════════════════════════════
🚀 RELEASE CHECKLIST - v{VERSION}
══════════════════════════════════════════════════════════════

Type : {TYPE} (patch/minor/major)
Date : YYYY-MM-DD
Branche : main

══════════════════════════════════════════════════════════════
📋 PRE-RELEASE
══════════════════════════════════════════════════════════════

## Code Quality
- [ ] Tous les tests passent (unit, integration, e2e)
- [ ] Couverture de tests ≥ 80%
- [ ] Analyse statique sans erreurs
- [ ] Code review complétée sur tous les PRs
- [ ] Pas de TODO/FIXME bloquants

## Sécurité
- [ ] Audit des dépendances (pas de CVE critiques)
- [ ] Pas de secrets dans le code
- [ ] Tests de sécurité passés (OWASP)
- [ ] Certificats SSL valides

## Documentation
- [ ] CHANGELOG.md mis à jour
- [ ] README.md à jour
- [ ] Documentation API générée
- [ ] Guide de migration (si breaking changes)
- [ ] Notes de release rédigées

## Versioning
- [ ] Numéro de version incrémenté
- [ ] Tags git préparés
- [ ] Branches release créées (si applicable)

══════════════════════════════════════════════════════════════
📦 BUILD & PACKAGE
══════════════════════════════════════════════════════════════

## Backend
- [ ] Build production réussi
- [ ] Assets compilés et minifiés
- [ ] Migrations DB préparées
- [ ] Variables d'environnement documentées

## Frontend Web
- [ ] Bundle optimisé (code splitting, tree shaking)
- [ ] Assets CDN ready
- [ ] Service worker mis à jour
- [ ] Sourcemaps générés (mais pas déployés en prod)

## Mobile (si applicable)
- [ ] Build iOS signé
- [ ] Build Android signé
- [ ] Screenshots store mis à jour
- [ ] Métadonnées store prêtes

══════════════════════════════════════════════════════════════
🔧 STAGING VALIDATION
══════════════════════════════════════════════════════════════

- [ ] Déploiement staging réussi
- [ ] Migrations DB exécutées avec succès
- [ ] Smoke tests manuels OK
- [ ] Tests de régression passés
- [ ] Performance acceptable (< seuils définis)
- [ ] Monitoring fonctionne (logs, métriques)
- [ ] Rollback testé

══════════════════════════════════════════════════════════════
🚀 PRODUCTION DEPLOYMENT
══════════════════════════════════════════════════════════════

## Pre-Deploy
- [ ] Maintenance mode activé (si nécessaire)
- [ ] Backup base de données effectué
- [ ] Communication équipe support
- [ ] Créneau de déploiement validé

## Deploy
- [ ] Déploiement production lancé
- [ ] Migrations DB exécutées
- [ ] Health checks passent
- [ ] Maintenance mode désactivé

## Post-Deploy
- [ ] Smoke tests production OK
- [ ] Monitoring vérifié (pas d'erreurs)
- [ ] Performance nominale
- [ ] Tag git créé et pushé
- [ ] Release GitHub/GitLab créée

══════════════════════════════════════════════════════════════
📢 COMMUNICATION
══════════════════════════════════════════════════════════════

- [ ] Notes de release publiées
- [ ] Équipe support informée
- [ ] Clients notifiés (si applicable)
- [ ] Documentation publique mise à jour
- [ ] Annonce blog/réseaux sociaux (si applicable)

══════════════════════════════════════════════════════════════
🔙 ROLLBACK PLAN
══════════════════════════════════════════════════════════════

En cas de problème critique :

1. Identifier le problème
   - Logs : [URL monitoring]
   - Alertes : [URL alerting]

2. Décision rollback
   - Seuil : > 5% erreurs 5xx pendant 5 min
   - Décideur : [Nom]

3. Exécuter rollback
   ```bash
   # Commande de rollback
   [Adapter selon l'infra]
   ```

4. Rollback DB (si nécessaire)
   ```bash
   # Migrations down
   [Adapter selon l'ORM]
   ```

5. Communication
   - Notifier l'équipe
   - Ouvrir incident
   - Post-mortem

══════════════════════════════════════════════════════════════
✅ VALIDATION FINALE
══════════════════════════════════════════════════════════════

[ ] Toutes les cases sont cochées
[ ] Release validée par : _______________
[ ] Date/heure de release : _______________

Notes :
_________________________________________________
_________________________________________________
```

## Commandes Utiles

```bash
# Créer le tag
git tag -a v{VERSION} -m "Release v{VERSION}"
git push origin v{VERSION}

# Créer la release GitHub
gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md

# Générer changelog automatique
git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md
```

## Sémantic Versioning Rappel

| Type | Quand | Exemple |
|------|-------|---------|
| MAJOR | Breaking changes | 1.0.0 → 2.0.0 |
| MINOR | Nouvelle fonctionnalité | 1.0.0 → 1.1.0 |
| PATCH | Bug fix | 1.0.0 → 1.0.1 |
