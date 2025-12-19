---
description: Audit Architecture Symfony
argument-hint: [arguments]
---

# Audit Architecture Symfony

## Arguments

$ARGUMENTS : Chemin du projet Symfony à auditer (optionnel, par défaut : répertoire courant)

## MISSION

Tu es un architecte logiciel expert Symfony chargé d'auditer l'architecture d'un projet Symfony selon les principes de Clean Architecture, DDD et Architecture Hexagonale.

### Step 1 : Analysis de la Structure du Projet

1. Identifie le répertoire du projet
2. Analysis la structure des dossiers dans `src/`
3. Vérifie la présence de la structure attendue

**Référence aux règles** : `.claude/rules/symfony-architecture.md`

### Step 2 : Verification Clean Architecture

#### Structure des Couches (5 points)

- [ ] **Domain/** : Logique métier pure (Entities, Value Objects, Domain Services)
- [ ] **Application/** : Use Cases, Application Services, DTOs
- [ ] **Infrastructure/** : Implementations concrètes (Repositories, Controllers, Adapters)
- [ ] **Presentation/** ou UI : Controllers, Templates, API Resources
- [ ] Pas de dépendances inversées (Domain ne dépend de rien)

**Points obtained** : ___/5

#### Séparation des Responsabilités (5 points)

- [ ] Domain contient uniquement de la logique métier
- [ ] Application orchestre les Use Cases
- [ ] Infrastructure gère la persistance et les services externes
- [ ] Pas de logique métier dans les controllers
- [ ] Pas d'accès direct à Doctrine/ORM depuis les controllers

**Points obtained** : ___/5

### Step 3 : Verification Domain-Driven Design (DDD)

#### Entités et Value Objects (5 points)

- [ ] Entities avec identité clairement définie
- [ ] Value Objects immutables pour concepts métier
- [ ] Pas de getters/setters systématiques (Tell Don't Ask)
- [ ] Méthodes métier dans les Entities
- [ ] Validation dans le Domain (pas dans les formulaires uniquement)

**Points obtained** : ___/5

#### Aggregates et Repositories (5 points)

- [ ] Aggregates correctement définis avec Aggregate Root
- [ ] Interfaces de Repository dans le Domain
- [ ] Implementations de Repository dans Infrastructure
- [ ] Pas d'accès direct à l'ORM depuis le Domain
- [ ] Collections d'Aggregates manipulées via Repository

**Points obtained** : ___/5

### Step 4 : Verification Architecture Hexagonale

#### Ports (Interfaces) (2.5 points)

- [ ] Ports primaires (Application Services, Use Cases) définis
- [ ] Ports secondaires (Repository, Email, Logger) définis en interfaces
- [ ] Interfaces dans le Domain ou Application
- [ ] Pas de couplage aux frameworks dans les interfaces
- [ ] Nommage clair (ex: `UserRepositoryInterface`, `EmailSenderInterface`)

**Points obtained** : ___/2.5

#### Adapters (Implementations) (2.5 points)

- [ ] Adapters primaires : Controllers REST/GraphQL, CLI Commands
- [ ] Adapters secondaires : DoctrineRepository, SymfonyMailer, etc.
- [ ] Adapters dans le dossier Infrastructure
- [ ] Configuration via Dependency Injection
- [ ] Possibilité de remplacer un Adapter facilement

**Points obtained** : ___/2.5

### Step 5 : Verification avec Deptrac

Exécute Deptrac pour vérifier les dépendances entre couches :

```bash
# Vérifier si deptrac.yaml existe
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/deptrac.yaml && echo "✅ deptrac.yaml trouvé" || echo "❌ deptrac.yaml manquant"

# Exécuter Deptrac
docker run --rm -v $(pwd):/app qossmic/deptrac analyse
```

Configuration Deptrac attendue :

```yaml
deptrac:
  layers:
    - name: Domain
      collectors:
        - type: directory
          value: src/Domain/.*
    - name: Application
      collectors:
        - type: directory
          value: src/Application/.*
    - name: Infrastructure
      collectors:
        - type: directory
          value: src/Infrastructure/.*
  ruleset:
    Domain: []
    Application: [Domain]
    Infrastructure: [Domain, Application]
```

- [ ] deptrac.yaml présent et configuré
- [ ] Aucune violation de dépendance détectée
- [ ] Domain complètement isolé
- [ ] Application ne dépend que du Domain
- [ ] Infrastructure peut dépendre de Domain et Application

**Points obtained** : ___/5

### Step 6 : Calcul du Score Architecture

**SCORE ARCHITECTURE** : ___/25 points

Détails :
- Structure des Couches : ___/5
- Séparation des Responsabilités : ___/5
- Entités et Value Objects : ___/5
- Aggregates et Repositories : ___/5
- Ports (Interfaces) : ___/2.5
- Adapters (Implementations) : ___/2.5
- Deptrac : ___/5

### Step 7 : Rapport Détaillé

```
=================================================
   AUDIT ARCHITECTURE SYMFONY
=================================================

📊 SCORE : ___/25

📐 Structure des Couches              : ___/5  [✅|⚠️|❌]
🔄 Séparation des Responsabilités     : ___/5  [✅|⚠️|❌]
🎯 Entités et Value Objects           : ___/5  [✅|⚠️|❌]
📦 Aggregates et Repositories         : ___/5  [✅|⚠️|❌]
🔌 Ports (Interfaces)                 : ___/2.5 [✅|⚠️|❌]
🔧 Adapters (Implémentations)         : ___/2.5 [✅|⚠️|❌]
🔍 Deptrac (Vérification dépendances) : ___/5  [✅|⚠️|❌]

=================================================
   PROBLÈMES DÉTECTÉS
=================================================

[Liste des problèmes avec exemples de fichiers]

Exemples :
❌ src/Infrastructure/Repository/UserDoctrineRepository.php utilisé directement dans Controller
⚠️ src/Domain/Entity/User.php contient des annotations Doctrine
❌ Pas de séparation Domain/Application/Infrastructure
⚠️ Value Objects mutables détectés
❌ Deptrac n'est pas configuré

=================================================
   TOP 3 ACTIONS PRIORITAIRES
=================================================

1. 🎯 [ACTION PRIORITAIRE] - Restructurer le projet selon Clean Architecture
   Impact : ⭐⭐⭐⭐⭐ | Effort : 🔥🔥🔥🔥

2. 🎯 [ACTION PRIORITAIRE] - Créer les interfaces de Repository dans Domain
   Impact : ⭐⭐⭐⭐ | Effort : 🔥🔥

3. 🎯 [ACTION PRIORITAIRE] - Configurer et exécuter Deptrac
   Impact : ⭐⭐⭐ | Effort : 🔥

=================================================
   RECOMMANDATIONS
=================================================

Architecture :
- Créer une structure Domain/Application/Infrastructure/Presentation
- Déplacer la logique métier des Controllers vers des Use Cases
- Isoler complètement le Domain des frameworks

DDD :
- Transformer les entités anémiques en Rich Domain Models
- Créer des Value Objects pour les concepts métier (Email, Money, etc.)
- Définir clairement les Aggregates et leurs limites

Hexagonal :
- Créer des interfaces pour tous les services externes
- Implémenter les Adapters dans Infrastructure
- Utiliser l'injection de dépendances pour connecter Ports et Adapters

Outils :
- Installer et configurer Deptrac : composer require --dev qossmic/deptrac-shim
- Créer deptrac.yaml avec les règles de dépendances
- Intégrer Deptrac dans la CI/CD

=================================================
```

## Commands Docker Utiles

```bash
# Analyser la structure du projet
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -type d -maxdepth 2

# Vérifier les dépendances avec Deptrac
docker run --rm -v $(pwd):/app qossmic/deptrac analyse --no-progress

# Lister les classes par namespace
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*.php" -exec grep -l "namespace" {} \;

# Vérifier la présence d'annotations Doctrine dans Domain
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "@ORM" /app/src/Domain/ || echo "✅ Pas d'annotations ORM dans Domain"
```

## IMPORTANT

- Utilise TOUJOURS Docker pour les commandes
- Ne stocke JAMAIS de fichiers dans /tmp
- Fournis des exemples concrets de fichiers problématiques
- Suggère des refactorings progressifs et réalistes
