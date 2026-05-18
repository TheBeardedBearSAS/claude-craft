---
description: Audit Testing Symfony
argument-hint: [arguments]
model: haiku

---

# Audit Testing Symfony

## Arguments

$ARGUMENTS : Chemin du projet Symfony à auditer (optionnel, par défaut : répertoire courant)

## MISSION

Tu es un expert en tests logiciels chargé d'auditer la stratégie de test d'un projet Symfony : tests unitaires, d'intégration, fonctionnels, couverture de code et tests de mutation.

### Étape 1 : Vérification de l'Environnement de Test

1. Identifie le répertoire du projet
2. Vérifie la présence de PHPUnit dans composer.json
3. Vérifie la configuration de PHPUnit (phpunit.xml.dist)
4. Vérifie la présence du dossier tests/

**Référence aux règles** : `.claude/rules/symfony-testing.md`

### Étape 2 : Structure des Tests

Analyse la structure du dossier tests/ :

```bash
# Lister la structure des tests
docker run --rm -v $(pwd):/app php:8.2-cli find /app/tests -type d
```

#### Organisation des Tests (3 points)

- [ ] Dossier `tests/Unit/` pour tests unitaires
- [ ] Dossier `tests/Integration/` pour tests d'intégration
- [ ] Dossier `tests/Functional/` pour tests fonctionnels
- [ ] Structure miroir de src/ dans tests/
- [ ] Namespace correctement configuré
- [ ] Fixtures dans tests/Fixtures/
- [ ] Mocks dans tests/Mock/ ou inline
- [ ] Configuration de test séparée (config/packages/test/)
- [ ] Base de données de test séparée
- [ ] Tests isolés et indépendants

**Points obtenus** : ___/3

### Étape 3 : Tests Unitaires

Exécute les tests unitaires :

```bash
# Exécuter les tests unitaires uniquement
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit --testdox

# Compter les tests unitaires
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit --list-tests | wc -l
```

#### Tests Unitaires Domain (7 points)

- [ ] Tests pour toutes les Entities du Domain
- [ ] Tests pour tous les Value Objects
- [ ] Tests pour tous les Domain Services
- [ ] Tests pour les Use Cases / Application Services
- [ ] Pas de dépendances externes (BD, API, filesystem)
- [ ] Utilisation de mocks pour les dépendances
- [ ] Tests des cas limites et erreurs
- [ ] Tests des validations métier
- [ ] Fast feedback (< 1 seconde pour tous les tests unitaires)
- [ ] Couverture des tests unitaires > 90%

Nombre de tests unitaires : ___
Temps d'exécution : ___ secondes

**Points obtenus** : ___/7

### Étape 4 : Tests d'Intégration

Exécute les tests d'intégration :

```bash
# Exécuter les tests d'intégration
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Integration --testdox
```

#### Tests d'Intégration Infrastructure (5 points)

- [ ] Tests pour tous les Repositories (avec base de données)
- [ ] Tests pour les Adapters externes (Email, API, etc.)
- [ ] Tests pour les Event Listeners / Subscribers
- [ ] Tests pour les Services avec dépendances Symfony
- [ ] Utilisation de base de données de test
- [ ] Rollback ou reset après chaque test
- [ ] Fixtures pour données de test
- [ ] Tests des transactions et contraintes BD
- [ ] Isolation des tests (pas d'ordre requis)
- [ ] Tests des cas d'erreur (connexion échouée, etc.)

Nombre de tests d'intégration : ___
Temps d'exécution : ___ secondes

**Points obtenus** : ___/5

### Étape 5 : Tests Fonctionnels

Exécute les tests fonctionnels :

```bash
# Exécuter les tests fonctionnels
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Functional --testdox

# Vérifier si Behat est installé
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/behat && echo "✅ Behat trouvé" || echo "⚠️ Behat manquant"
```

#### Tests Fonctionnels (5 points)

- [ ] Tests pour toutes les routes API/Web importantes
- [ ] Tests des controllers avec WebTestCase
- [ ] Tests des formulaires
- [ ] Tests des authentifications et autorisations
- [ ] Tests des workflows complets (parcours utilisateur)
- [ ] Tests avec Behat pour scénarios métier (optionnel)
- [ ] Tests des réponses HTTP (codes, headers, body)
- [ ] Tests des validations côté API
- [ ] Tests des cas d'erreur (404, 403, 500)
- [ ] Tests des redirections

Nombre de tests fonctionnels : ___
Tests Behat présents : [OUI|NON]

**Points obtenus** : ___/5

### Étape 6 : Couverture de Code

Génère le rapport de couverture :

```bash
# Générer la couverture de code (nécessite xdebug ou pcov)
docker run --rm -v $(pwd):/app php:8.2-cli php -d memory_limit=-1 /app/vendor/bin/phpunit --coverage-text --coverage-html=/app/var/coverage

# Afficher le résumé de couverture
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --coverage-text | grep "Lines:"
```

#### Couverture de Code (5 points)

- [ ] Couverture globale ≥ 80%
- [ ] Couverture Domain ≥ 90%
- [ ] Couverture Application ≥ 85%
- [ ] Couverture Infrastructure ≥ 70%
- [ ] Couverture des branches (conditionnelles) ≥ 75%
- [ ] Rapport de couverture généré (HTML)
- [ ] Exclusion explicite du code non testable
- [ ] Pas de code critique non couvert
- [ ] Tests des exceptions et cas d'erreur
- [ ] Configuration de couverture dans phpunit.xml

Couverture globale : ___%
Couverture Domain : ___%
Couverture Application : ___%
Couverture Infrastructure : ___%

**Points obtenus** : ___/5

Configuration PHPUnit attendue :

```xml
<coverage processUncoveredFiles="true">
    <include>
        <directory suffix=".php">src</directory>
    </include>
    <exclude>
        <directory>src/Kernel.php</directory>
        <directory>src/DataFixtures</directory>
    </exclude>
    <report>
        <html outputDirectory="var/coverage"/>
        <text outputFile="php://stdout" showUncoveredFiles="false"/>
    </report>
</coverage>
```

### Étape 7 : Tests de Mutation avec Infection

Exécute les tests de mutation :

```bash
# Vérifier si Infection est installé
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/infection && echo "✅ Infection trouvé" || echo "❌ Infection manquant"

# Exécuter Infection
docker run --rm -v $(pwd):/app infection/infection --min-msi=70 --min-covered-msi=80 --threads=4
```

#### Tests de Mutation (5 points)

- [ ] Infection installé et configuré
- [ ] MSI (Mutation Score Indicator) ≥ 70%
- [ ] Covered MSI ≥ 80%
- [ ] Tests détectent les mutations dans Domain
- [ ] Tests détectent les mutations dans Application
- [ ] Pas de mutants échappés dans le code critique
- [ ] Configuration infection.json présente
- [ ] Timeout configuré correctement
- [ ] Exclusions justifiées dans config
- [ ] Rapport de mutation généré

MSI : ___%
Covered MSI : ___%
Mutants tués : ___
Mutants échappés : ___

**Points obtenus** : ___/5

Configuration Infection attendue (infection.json) :

```json
{
    "source": {
        "directories": ["src"]
    },
    "logs": {
        "text": "var/infection.log",
        "html": "var/infection-report.html"
    },
    "mutators": {
        "@default": true
    },
    "minMsi": 70,
    "minCoveredMsi": 80
}
```

### Étape 8 : Calcul du Score Testing

**SCORE TESTING** : ___/25 points

Détails :
- Organisation des Tests : ___/3
- Tests Unitaires Domain : ___/7
- Tests d'Intégration Infrastructure : ___/5
- Tests Fonctionnels : ___/5
- Couverture de Code : ___/5
- Tests de Mutation : ___/5

### Étape 9 : Rapport Détaillé

```
=================================================
   AUDIT TESTING SYMFONY
=================================================

📊 SCORE : ___/25

📁 Organisation des Tests             : ___/3 [✅|⚠️|❌]
🎯 Tests Unitaires Domain             : ___/7 [✅|⚠️|❌]
🔌 Tests d'Intégration Infrastructure : ___/5 [✅|⚠️|❌]
🌐 Tests Fonctionnels                 : ___/5 [✅|⚠️|❌]
📊 Couverture de Code                 : ___/5 [✅|⚠️|❌]
🦠 Tests de Mutation                  : ___/5 [✅|⚠️|❌]

=================================================
   STATISTIQUES GLOBALES
=================================================

Nombre total de tests       : ___
Tests unitaires            : ___
Tests d'intégration        : ___
Tests fonctionnels         : ___
Tests Behat                : ___

Temps d'exécution total    : ___ secondes
Couverture globale         : ___%
MSI (Mutation Score)       : ___%

=================================================
   COUVERTURE PAR COUCHE
=================================================

Domain          : ___% [✅|⚠️|❌] (objectif: 90%)
Application     : ___% [✅|⚠️|❌] (objectif: 85%)
Infrastructure  : ___% [✅|⚠️|❌] (objectif: 70%)
Presentation    : ___% [✅|⚠️|❌] (objectif: 70%)

Fichiers sans couverture : ___
Méthodes sans couverture : ___
Lignes sans couverture   : ___

=================================================
   MUTATION TESTING
=================================================

MSI (Mutation Score)       : ___% [✅|⚠️|❌] (objectif: 70%)
Covered MSI                : ___% [✅|⚠️|❌] (objectif: 80%)

Mutants générés            : ___
Mutants tués              : ___ (détectés par les tests)
Mutants échappés          : ___ (non détectés)
Mutants timeout           : ___
Mutants erreurs           : ___

Fichiers avec mutants échappés critiques :
❌ src/Domain/Entity/Order.php - 3 mutants échappés
❌ src/Application/UseCase/CreateUser.php - 2 mutants échappés

=================================================
   PROBLÈMES DÉTECTÉS
=================================================

Tests Manquants :
❌ Pas de tests pour src/Domain/Entity/Invoice.php
❌ Pas de tests pour src/Application/UseCase/ProcessPayment.php
⚠️ Couverture faible pour src/Infrastructure/Repository/OrderRepository.php (45%)

Tests Lents :
⚠️ tests/Integration/RepositoryTest.php - 15s (optimiser avec fixtures)
⚠️ tests/Functional/ApiTest.php - 12s (utiliser client HTTP mocké)

Tests Flaky :
❌ tests/Integration/EmailServiceTest.php - échoue parfois
⚠️ tests/Functional/CheckoutTest.php - dépendant de l'ordre d'exécution

Configuration :
❌ Infection non installé
⚠️ Couverture de code non configurée dans phpunit.xml
❌ Base de données de test non séparée

=================================================
   TOP 3 ACTIONS PRIORITAIRES
=================================================

1. 🎯 [ACTION CRITIQUE] - Atteindre 80% de couverture de code
   Impact : ⭐⭐⭐⭐⭐ | Effort : 🔥🔥🔥🔥
   - Ajouter tests pour Invoice, ProcessPayment
   - Tester tous les cas d'erreur
   - Tester toutes les branches conditionnelles

2. 🎯 [ACTION IMPORTANTE] - Installer et configurer Infection
   Impact : ⭐⭐⭐⭐ | Effort : 🔥🔥
   Commande : composer require --dev infection/infection
   Viser MSI ≥ 70%

3. 🎯 [ACTION RECOMMANDÉE] - Séparer et optimiser les tests
   Impact : ⭐⭐⭐ | Effort : 🔥🔥
   - Séparer Unit/Integration/Functional
   - Utiliser base de données in-memory pour tests
   - Optimiser les fixtures

=================================================
   RECOMMANDATIONS
=================================================

Installation des outils :
```bash
composer require --dev phpunit/phpunit ^10.0
composer require --dev infection/infection
composer require --dev symfony/test-pack
composer require --dev behat/behat
composer require --dev friends-of-behat/symfony-extension
composer require --dev doctrine/doctrine-fixtures-bundle
```

Configuration phpunit.xml.dist :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true">
    <testsuites>
        <testsuite name="unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="integration">
            <directory>tests/Integration</directory>
        </testsuite>
        <testsuite name="functional">
            <directory>tests/Functional</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">src</directory>
        </include>
    </coverage>
</phpunit>
```

Bonnes pratiques :
- Utiliser des factories pour créer les objets de test
- Utiliser des builders pour les objets complexes
- Créer des assertions custom réutilisables
- Isoler les tests avec setUp/tearDown
- Utiliser des data providers pour tester plusieurs cas
- Mocker uniquement les dépendances externes
- Tester en premier le Happy Path, puis les cas d'erreur

CI/CD :
- Exécuter les tests à chaque commit
- Bloquer les merges si tests échouent
- Générer et publier les rapports de couverture
- Exécuter Infection sur les Pull Requests
- Alerter si la couverture diminue

=================================================
```

## Commandes Docker Utiles

```bash
# Exécuter tous les tests
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit

# Tests unitaires uniquement
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit

# Tests avec couverture
docker run --rm -v $(pwd):/app php:8.2-cli php -d xdebug.mode=coverage /app/vendor/bin/phpunit --coverage-text

# Infection (mutation testing)
docker run --rm -v $(pwd):/app infection/infection --threads=4 --min-msi=70

# Behat (tests BDD)
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/behat

# Lister tous les tests
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --list-tests

# Exécuter un test spécifique
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit/Domain/Entity/UserTest.php

# Tests avec sortie détaillée
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --testdox
```

## IMPORTANT

- Utilise TOUJOURS Docker pour les commandes
- Ne stocke JAMAIS de fichiers dans /tmp (utiliser var/ du projet)
- Fournis des statistiques précises
- Identifie les fichiers critiques sans tests
- Suggère des tests concrets à ajouter
