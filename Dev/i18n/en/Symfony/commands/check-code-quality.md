---
description: Audit Qualité du Code Symfony
argument-hint: [arguments]
---

# Audit Qualité du Code Symfony

## Arguments

$ARGUMENTS : Chemin du projet Symfony à auditer (optionnel, par défaut : répertoire courant)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Tu es un expert qualité logicielle chargé d'auditer la qualité du code d'un projet Symfony selon les standards PSR-12, PHPStan niveau 10 (PHPStan 2.x) et les meilleures pratiques PHP modernes.

### Step 1 : Verification de l'Environnement

1. Identifie le répertoire du projet
2. Vérifie la présence des outils de qualité dans composer.json
3. Vérifie la version de PHP utilisée

**Référence aux règles** : `.claude/rules/symfony-code-quality.md`

### Step 2 : Verification PSR-12

Exécute PHP_CodeSniffer pour vérifier le respect de PSR-12 :

```bash
# Vérifier si phpcs est installé
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/phpcs && echo "✅ phpcs trouvé" || echo "❌ phpcs manquant"

# Exécuter phpcs
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcs --standard=PSR12 src/ --report=summary
```

#### Standards PSR-12 (5 points)

- [ ] Indentation avec 4 espaces (pas de tabs)
- [ ] Longueur de ligne ≤ 120 caractères
- [ ] Accolades sur nouvelles lignes pour classes et méthodes
- [ ] Use statements triés alphabétiquement
- [ ] Pas d'espaces en fin de ligne
- [ ] Fichiers se terminent par une ligne vide
- [ ] Déclaration `declare(strict_types=1)` après le tag PHP
- [ ] Une classe par fichier
- [ ] Namespace correspond à l'arborescence
- [ ] Nommage camelCase pour méthodes, PascalCase pour classes

**Points obtained** : ___/5

### Step 3 : Analysis Statique avec PHPStan

Exécute PHPStan au niveau 10 :

```bash
# Vérifier si PHPStan est installé
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/phpstan && echo "✅ PHPStan trouvé" || echo "❌ PHPStan manquant"

# Exécuter PHPStan niveau 10
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=10 --error-format=table
```

#### PHPStan Niveau 10 (10 points)

- [ ] Aucune erreur PHPStan niveau 10
- [ ] Tous les types de retour déclarés
- [ ] Tous les paramètres typés
- [ ] Pas de mixed types
- [ ] Pas de code mort détecté
- [ ] Pas de variables non définies
- [ ] Pas de propriétés non définies
- [ ] Pas de méthodes non définies
- [ ] Générics correctement utilisés (templates PHPDoc)
- [ ] Nullabilité explicite (? ou union types)

**Points obtained** : ___/10

Configuration PHPStan attendue dans `phpstan.neon` :

```neon
parameters:
    level: 10
    phpVersion: 80500
    paths:
        - src
    excludePaths:
        - src/Kernel.php
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    reportUnmatchedIgnoredErrors: true
```

### Step 4 : Type Hints et Strict Types

Vérifie l'utilisation stricte des types :

```bash
# Vérifier declare(strict_types=1)
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "declare(strict_types=1)" /app/src --include="*.php" | wc -l

# Compter le nombre de fichiers PHP
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*.php" | wc -l

# Les deux nombres doivent être identiques
```

#### Type Hints Stricts (5 points)

- [ ] `declare(strict_types=1)` dans 100% des fichiers PHP
- [ ] Type hints sur tous les paramètres de méthodes publiques
- [ ] Type hints sur tous les retours de méthodes publiques
- [ ] Type hints sur toutes les propriétés de classe (PHP 7.4+)
- [ ] Utilisation des union types (PHP 8.0+) au lieu de mixed
- [ ] Pas de docblock @param/@return redondants avec les types natifs
- [ ] Utilisation de readonly pour propriétés immuables (PHP 8.1+)
- [ ] Pas de suppression d'erreurs avec @phpstan-ignore
- [ ] Types stricts dans les tableaux : array<string, int>
- [ ] Utilisation de never type pour méthodes qui ne retournent jamais (PHP 8.1+)

**Points obtained** : ___/5

### Step 5 : Complexité et Maintenabilité

Analysis la complexité du code :

```bash
# Installer phpmetrics si nécessaire
# Analyser la complexité
docker run --rm -v $(pwd):/app php:8.2-cli php -r "
require '/app/vendor/autoload.php';
// Analyse basique de complexité
"
```

#### Métriques de Code (3 points)

- [ ] Complexité cyclomatique moyenne < 5 par méthode
- [ ] Complexité cyclomatique max < 10 par méthode
- [ ] Longueur moyenne des méthodes < 15 lignes
- [ ] Longueur max des méthodes < 30 lignes
- [ ] Classes avec < 10 méthodes publiques
- [ ] Pas de méthodes avec plus de 5 paramètres
- [ ] Indice de maintenabilité > 70
- [ ] Couplage afférent/efférent équilibré
- [ ] Pas de classes "God Object" (> 500 lignes)
- [ ] Respect du principe Single Responsibility

**Points obtained** : ___/3

### Step 6 : Documentation et PHPDoc

Vérifie la qualité de la documentation :

```bash
# Vérifier les PHPDoc manquants
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=10 | grep -i "phpdoc"
```

#### Documentation (2 points)

- [ ] PHPDoc pour toutes les classes (description du rôle)
- [ ] PHPDoc pour toutes les méthodes publiques complexes
- [ ] @param avec description pour paramètres non évidents
- [ ] @return avec description pour retours complexes
- [ ] @throws pour toutes les exceptions
- [ ] PHPDoc à jour (pas de paramètres obsolètes)
- [ ] Pas de TODO/FIXME dans le code de production
- [ ] Exemples d'utilisation pour APIs publiques
- [ ] Génériques documentés : @template, @extends, @implements
- [ ] README.md avec documentation architecture

**Points obtained** : ___/2

### Step 7 : Calcul du Score Qualité du Code

**SCORE QUALITÉ DU CODE** : ___/25 points

Détails :
- Standards PSR-12 : ___/5
- PHPStan Niveau 10 : ___/10
- Type Hints Stricts : ___/5
- Métriques de Code : ___/3
- Documentation : ___/2

### Step 8 : Rapport Détaillé

```
=================================================
   AUDIT QUALITÉ DU CODE SYMFONY
=================================================

📊 SCORE : ___/25

📏 Standards PSR-12        : ___/5  [✅|⚠️|❌]
🔍 PHPStan Niveau 10       : ___/10 [✅|⚠️|❌]
🏷️  Type Hints Stricts      : ___/5  [✅|⚠️|❌]
📊 Métriques de Code       : ___/3  [✅|⚠️|❌]
📝 Documentation           : ___/2  [✅|⚠️|❌]

=================================================
   ERREURS PSR-12 DÉTECTÉES
=================================================

[Nombre total d'erreurs] : ___

Exemples :
❌ src/Controller/UserController.php:45 - Ligne trop longue (145 caractères)
❌ src/Domain/Entity/Order.php:12 - Accolade mal placée
⚠️ src/Application/Service/EmailService.php - Use statements non triés

=================================================
   ERREURS PHPSTAN DÉTECTÉES
=================================================

[Nombre total d'erreurs] : ___

Exemples :
❌ src/Domain/Entity/User.php:32 - Type de retour manquant
❌ src/Application/UseCase/CreateOrder.php:45 - Paramètre $data n'est pas typé
⚠️ src/Infrastructure/Repository/UserRepository.php:78 - Property $entityManager a le type mixed

=================================================
   TYPE HINTS MANQUANTS
=================================================

Fichiers sans declare(strict_types=1) : ___
Méthodes sans type de retour : ___
Paramètres sans type : ___
Propriétés sans type : ___

Exemples :
❌ src/Application/Service/OrderService.php:15 - Pas de declare(strict_types=1)
❌ src/Domain/ValueObject/Email.php:23 - Méthode getValue() sans type de retour
⚠️ src/Infrastructure/Adapter/EmailAdapter.php:34 - Propriété $mailer non typée

=================================================
   COMPLEXITÉ EXCESSIVE
=================================================

Méthodes avec complexité > 10 : ___

Exemples :
❌ src/Application/UseCase/ProcessOrder.php:execute() - Complexité 15
⚠️ src/Domain/Service/PriceCalculator.php:calculate() - Complexité 12
⚠️ src/Controller/ApiController.php:handleRequest() - 95 lignes

=================================================
   TOP 3 ACTIONS PRIORITAIRES
=================================================

1. 🎯 [ACTION CRITIQUE] - Corriger les erreurs PHPStan niveau 10
   Impact : ⭐⭐⭐⭐⭐ | Effort : 🔥🔥🔥
   Commande : docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=10

2. 🎯 [ACTION IMPORTANTE] - Ajouter declare(strict_types=1) partout
   Impact : ⭐⭐⭐⭐ | Effort : 🔥
   Script : find src -name "*.php" -exec sed -i '2i\\declare(strict_types=1);' {} \;

3. 🎯 [ACTION RECOMMANDÉE] - Formatter le code selon PSR-12
   Impact : ⭐⭐⭐ | Effort : 🔥
   Commande : docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcbf --standard=PSR12 src/

=================================================
   RECOMMANDATIONS
=================================================

Outils à installer :
```bash
composer require --dev phpstan/phpstan ^1.10
composer require --dev phpstan/phpstan-symfony
composer require --dev phpstan/phpstan-doctrine
composer require --dev squizlabs/php_codesniffer ^3.7
composer require --dev friendsofphp/php-cs-fixer ^3.0
```

Configuration PHP CS Fixer (.php-cs-fixer.php) :
```php
<?php
return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true,
        'strict_param' => true,
        'array_syntax' => ['syntax' => 'short'],
        'declare_strict_types' => true,
    ])
    ->setFinder(
        PhpCsFixer\Finder::create()->in(__DIR__ . '/src')
    );
```

CI/CD :
- Ajouter PHPStan dans le pipeline
- Bloquer les merges si PHPStan échoue
- Exécuter PHP CS Fixer en mode check
- Générer des rapports de qualité

=================================================
```

## Commands Docker Utiles

```bash
# Vérifier PSR-12
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcs --standard=PSR12 src/ --report=summary

# Corriger automatiquement PSR-12
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcbf --standard=PSR12 src/

# PHPStan niveau 10
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=10 --error-format=table

# Générer une baseline PHPStan (pour projets legacy)
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=10 --generate-baseline

# PHP CS Fixer
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/php-cs-fixer fix src --dry-run --diff

# Vérifier declare(strict_types=1) partout
docker run --rm -v $(pwd):/app php:8.2-cli sh -c 'for f in $(find /app/src -name "*.php"); do grep -q "declare(strict_types=1)" "$f" || echo "❌ Manquant: $f"; done'
```

## IMPORTANT

- Utilise TOUJOURS Docker pour les commandes
- Ne stocke JAMAIS de fichiers dans /tmp
- Fournis des exemples concrets avec numéros de ligne
- Priorise les corrections automatisables
- Distingue les erreurs critiques des warnings
