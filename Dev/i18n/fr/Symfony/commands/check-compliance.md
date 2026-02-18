---
description: Audit Complet de Conformité Symfony
argument-hint: [arguments]
---

# Audit Complet de Conformité Symfony

## Arguments

$ARGUMENTS : Chemin du projet Symfony à auditer (optionnel, par défaut : répertoire courant)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Tu es un auditeur expert Symfony chargé de réaliser un audit complet de conformité d'un projet Symfony.

### Étape 1 : Vérification du projet

1. Identifie le répertoire du projet à auditer
2. Vérifie qu'il s'agit bien d'un projet Symfony (présence de composer.json avec symfony/*)
3. Vérifie la version de Symfony utilisée

### Étape 2 : Audit Architecture (25 points)

Exécute l'audit d'architecture en vérifiant :

**Référence aux règles** : `.claude/rules/symfony-architecture.md`

- [ ] Structure des dossiers respecte Clean Architecture
- [ ] Séparation Domain / Application / Infrastructure
- [ ] Respect des principes DDD (Entities, Value Objects, Aggregates)
- [ ] Architecture Hexagonale (Ports & Adapters)
- [ ] Utilisation de Deptrac pour vérifier les dépendances
- [ ] Absence de couplage entre les couches
- [ ] Interfaces correctement définies pour les ports
- [ ] Use Cases / Application Services bien définis
- [ ] Repositories avec interfaces dans le domain
- [ ] DTOs pour les transferts de données

**Score Architecture** : ___/25 points

### Étape 3 : Audit Qualité du Code (25 points)

Exécute l'audit de qualité du code en vérifiant :

**Référence aux règles** : `.claude/rules/symfony-code-quality.md`

- [ ] Respect de PSR-12
- [ ] PHPStan niveau 9 sans erreur
- [ ] Type hints strict sur tous les paramètres et retours
- [ ] Déclaration `declare(strict_types=1)` dans tous les fichiers
- [ ] Pas de code mort (détecté par PHPStan)
- [ ] Pas de dépendances inutilisées
- [ ] Complexité cyclomatique < 10 par méthode
- [ ] Longueur des méthodes < 20 lignes
- [ ] Classes single responsibility
- [ ] Documentation PHPDoc complète et à jour

**Score Qualité du Code** : ___/25 points

### Étape 4 : Audit Testing (25 points)

Exécute l'audit des tests en vérifiant :

**Référence aux règles** : `.claude/rules/symfony-testing.md`

- [ ] Couverture de code ≥ 80%
- [ ] Tests unitaires pour le Domain
- [ ] Tests d'intégration pour l'Infrastructure
- [ ] Tests fonctionnels avec Behat ou Symfony WebTestCase
- [ ] Tests de mutation avec Infection (MSI ≥ 70%)
- [ ] Fixtures pour les tests
- [ ] Tests isolés (pas de dépendances entre tests)
- [ ] Base de données de test séparée
- [ ] Mocks et Stubs appropriés
- [ ] CI/CD avec exécution automatique des tests

**Score Testing** : ___/25 points

### Étape 5 : Audit Sécurité (25 points)

Exécute l'audit de sécurité en vérifiant :

**Référence aux règles** : `.claude/rules/symfony-security.md`

- [ ] Symfony Security Bundle correctement configuré
- [ ] OWASP Top 10 : Protection contre injection SQL
- [ ] OWASP Top 10 : Protection XSS
- [ ] OWASP Top 10 : Protection CSRF
- [ ] OWASP Top 10 : Authentification sécurisée
- [ ] OWASP Top 10 : Contrôle d'accès (Voters, ACL)
- [ ] RGPD : Consentement utilisateur
- [ ] RGPD : Droit à l'oubli implémenté
- [ ] RGPD : Export des données personnelles
- [ ] Secrets externalisés (pas dans le code)

**Score Sécurité** : ___/25 points

### Étape 6 : Calcul du Score Global

**SCORE GLOBAL** : ___/100 points

Interprétation :
- ✅ 90-100 : Excellent - Conformité exemplaire
- ✅ 75-89 : Bon - Quelques améliorations mineures
- ⚠️ 60-74 : Moyen - Améliorations nécessaires
- ⚠️ 40-59 : Insuffisant - Refactoring important requis
- ❌ 0-39 : Critique - Refonte complète nécessaire

### Étape 7 : Rapport Détaillé

Génère un rapport structuré avec :

```
=================================================
   AUDIT DE CONFORMITÉ SYMFONY
=================================================

📊 SCORE GLOBAL : ___/100

📐 Architecture        : ___/25 [✅|⚠️|❌]
🎯 Qualité du Code    : ___/25 [✅|⚠️|❌]
🧪 Testing            : ___/25 [✅|⚠️|❌]
🔒 Sécurité           : ___/25 [✅|⚠️|❌]

=================================================
   DÉTAILS PAR CATÉGORIE
=================================================

[Insérer les détails de chaque audit]

=================================================
   TOP 3 ACTIONS PRIORITAIRES
=================================================

1. [Action prioritaire #1 avec impact estimé]
2. [Action prioritaire #2 avec impact estimé]
3. [Action prioritaire #3 avec impact estimé]

=================================================
   RECOMMANDATIONS TECHNIQUES
=================================================

- [Recommandation technique spécifique]
- [Recommandation technique spécifique]
- [Recommandation technique spécifique]

=================================================
```

### Étape 8 : Commandes Docker pour Vérifications

Pour chaque vérification, utilise Docker pour s'abstraire de l'environnement local :

```bash
# PHPStan
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9

# PHP_CodeSniffer (PSR-12)
docker run --rm -v $(pwd):/project php:8.2-cli vendor/bin/phpcs --standard=PSR12 src/

# PHPUnit avec couverture
docker run --rm -v $(pwd):/app php:8.2-cli vendor/bin/phpunit --coverage-text --coverage-html=coverage

# Infection (mutation testing)
docker run --rm -v $(pwd):/app infection/infection --min-msi=70

# Deptrac
docker run --rm -v $(pwd):/app qossmic/deptrac analyse
```

## IMPORTANT

- Utilise TOUJOURS Docker pour les commandes afin de s'abstraire de l'environnement local
- Ne stocke JAMAIS de fichiers dans /tmp
- Fournis des exemples concrets de problèmes détectés
- Priorise les actions selon l'impact et l'effort
- Sois factuel et objectif dans l'évaluation
