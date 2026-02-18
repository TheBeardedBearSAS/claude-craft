---
description: Audit Complet de Conformité Flutter
argument-hint: [arguments]
---

# Audit Complet de Conformité Flutter

## Arguments

$ARGUMENTS

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Tu es un expert Flutter chargé de réaliser un audit complet de conformité du projet. Cet audit évalue 4 dimensions critiques : Architecture, Qualité du Code, Tests et Sécurité.

### Étape 1 : Préparation de l'audit

- [ ] Identifier la structure complète du projet Flutter
- [ ] Vérifier la présence de `pubspec.yaml`, `analysis_options.yaml`
- [ ] Localiser les dossiers : `lib/`, `test/`, `android/`, `ios/`
- [ ] Référencer TOUTES les règles depuis `/rules/` :
  - `02-architecture.md` - Clean Architecture
  - `03-coding-standards.md` - Effective Dart
  - `04-solid-principles.md` - SOLID
  - `05-kiss-dry-yagni.md` - Principes de simplicité
  - `07-testing.md` - Stratégie de tests
  - `08-quality-tools.md` - Outils qualité
  - `11-security.md` - Sécurité

### Étape 2 : Exécution des 4 audits spécialisés (100 points)

#### 2.1 🏗️ AUDIT ARCHITECTURE (25 points)

Exécuter l'analyse d'architecture complète en vérifiant :

**Organisation Clean Architecture (10 pts)**
- [ ] Domain Layer : Entités et UseCases isolés
  - Vérifier `lib/domain/entities/`, `lib/domain/usecases/`
  - Aucune dépendance vers data/presentation
- [ ] Data Layer : Repositories, DataSources, Models
  - Vérifier `lib/data/repositories/`, `lib/data/datasources/`, `lib/data/models/`
  - Implémentation des interfaces domain
- [ ] Presentation Layer : UI, BLoCs/Providers
  - Vérifier `lib/presentation/pages/`, `lib/presentation/widgets/`, `lib/presentation/blocs/`

**Injection de dépendances (5 pts)**
- [ ] Container DI configuré (get_it, injectable, riverpod)
- [ ] Pas de `new()` direct, tout injecté via constructeur

**Séparation des responsabilités SOLID (5 pts)**
- [ ] Single Responsibility : Une classe = une responsabilité
- [ ] Interface Segregation : Interfaces spécialisées
- [ ] Dependency Inversion : Dépend d'abstractions

**Structure modulaire (5 pts)**
- [ ] Features isolées par fonctionnalité
- [ ] Core/Shared pour utilitaires communs
- [ ] Pas de couplage entre features

**Score Architecture : XX/25**

---

#### 2.2 💎 AUDIT QUALITÉ DU CODE (25 points)

Exécuter l'analyse de qualité du code :

**Conventions Effective Dart (6 pts)**
- [ ] Classes/Enums : UpperCamelCase
- [ ] Variables/Méthodes : lowerCamelCase
- [ ] Constantes : lowerCamelCase
- [ ] Fichiers : snake_case
- [ ] Noms descriptifs, pas d'abréviations cryptiques

**Linting et analyse statique (7 pts)**
- [ ] `analysis_options.yaml` configuré strictement
- [ ] Aucun warning dans `flutter analyze`
  ```bash
  docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter analyze
  ```
- [ ] Règles `prefer_const_constructors`, `avoid_print` respectées

**Principes KISS, DRY, YAGNI (6 pts)**
- [ ] KISS : Méthodes < 50 lignes, logique simple
- [ ] DRY : Pas de duplication, utilitaires communs
- [ ] YAGNI : Pas de sur-ingénierie

**Documentation (3 pts)**
- [ ] Classes publiques documentées avec `///`
- [ ] Méthodes complexes commentées
- [ ] Pas de code commenté en production

**Gestion des erreurs (3 pts)**
- [ ] Try-catch appropriés avec logging
- [ ] Types d'erreur spécifiques
- [ ] Pas de `print()` en production

**Score Qualité Code : XX/25**

---

#### 2.3 🧪 AUDIT TESTS (25 points)

Exécuter l'analyse de la couverture de tests :

**Couverture (8 pts)**
- [ ] Tests unitaires pour domain/data (70% minimum)
- [ ] Tests de widgets pour UI critique
- [ ] Couverture globale > 60%
  ```bash
  docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter test --coverage
  ```

**Qualité des tests (7 pts)**
- [ ] Pattern AAA (Arrange-Act-Assert) respecté
- [ ] Tests isolés avec mocks (mockito/mocktail)
- [ ] Noms descriptifs explicites
- [ ] Pas de tests flaky

**Types de tests (6 pts)**
- [ ] Unit tests : Logique pure < 100ms
- [ ] Widget tests : UI et interactions
- [ ] Golden tests : Régression visuelle
- [ ] Integration tests : Flux end-to-end

**Mocks et fixtures (4 pts)**
- [ ] Mocks générés avec mockito (`*.mocks.dart`)
- [ ] Fixtures organisés dans `/test/fixtures/`

**Score Testing : XX/25**

---

#### 2.4 🔒 AUDIT SÉCURITÉ (25 points)

Exécuter l'analyse de sécurité :

**Gestion des secrets (8 pts)**
- [ ] **Aucun secret hardcodé** dans le code
  ```bash
  docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "grep -r -E '(api[_-]?key|token|password|secret)' lib/ --include='*.dart'"
  ```
- [ ] Variables d'environnement (.env avec flutter_dotenv)
- [ ] flutter_secure_storage pour tokens/credentials

**Communication réseau (6 pts)**
- [ ] HTTPS obligatoire (pas de `http://`)
  ```bash
  docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "grep -r 'http://' lib/ --include='*.dart'"
  ```
- [ ] Validation SSL/TLS, pas de `badCertificateCallback` qui accepte tout
- [ ] Timeouts configurés

**Données sensibles (5 pts)**
- [ ] Chiffrement données locales (flutter_secure_storage, encrypted Hive)
- [ ] Pas de logs sensibles (print, debugPrint)
- [ ] Obfuscation activée en release

**Permissions (3 pts)**
- [ ] Permissions minimales Android/iOS
- [ ] Validation des entrées utilisateur

**Dépendances (3 pts)**
- [ ] Packages à jour sans vulnérabilités
  ```bash
  docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub outdated
  ```
- [ ] Audit des packages tiers

**Score Sécurité : XX/25**

---

### Étape 3 : Calcul du score global

```
SCORE TOTAL = Architecture + Qualité + Tests + Sécurité

SCORE TOTAL : XX/100

Répartition :
- Architecture : XX/25
- Qualité Code : XX/25
- Tests : XX/25
- Sécurité : XX/25
```

**Interprétation :**
- ✅ 85-100 pts : Projet excellent, prêt pour production
- ✅ 70-84 pts : Projet solide, quelques améliorations mineures
- ⚠️ 50-69 pts : Projet correct, améliorations nécessaires
- ⚠️ 30-49 pts : Projet à risque, refactoring recommandé
- ❌ 0-29 pts : Projet critique, refonte majeure requise

### Étape 4 : Rapport exécutif consolidé

Génère un rapport exécutif avec :

---

## 📊 RAPPORT D'AUDIT DE CONFORMITÉ FLUTTER

### Score Global : XX/100

```
┌─────────────────────────────────────────────────┐
│ 🏗️  Architecture      : XX/25  [███████░░░]    │
│ 💎  Qualité du Code   : XX/25  [█████░░░░░]    │
│ 🧪  Tests             : XX/25  [████░░░░░░]    │
│ 🔒  Sécurité          : XX/25  [██████░░░░]    │
├─────────────────────────────────────────────────┤
│ 🎯  TOTAL             : XX/100 [█████░░░░░]    │
└─────────────────────────────────────────────────┘
```

### ✅ Points Forts du Projet

1. **Architecture** : [Décrire les points forts architecturaux]
2. **Qualité** : [Décrire les bonnes pratiques de code]
3. **Tests** : [Décrire la couverture et qualité tests]
4. **Sécurité** : [Décrire les mesures de sécurité en place]

### ⚠️ Axes d'Amélioration

#### Architecture
- [Lister les problèmes architecturaux avec impact et fichiers concernés]

#### Qualité du Code
- [Lister les violations de conventions avec exemples]

#### Tests
- [Lister les manques de couverture avec pourcentages]

#### Sécurité
- [Lister les vulnérabilités potentielles avec criticité]

### ❌ Violations Critiques (Bloquantes)

**PRIORITÉ MAXIMALE - À corriger immédiatement :**

1. **[SÉCURITÉ]** Secrets hardcodés détectés
   - `lib/config/api_config.dart:5` : API key en clair
   - Impact : Exposition de credentials
   - Action : Migrer vers .env immédiatement

2. **[ARCHITECTURE]** Couplage fort entre layers
   - Domain dépend de Data
   - Impact : Impossible de tester, non maintenable
   - Action : Inverser les dépendances avec interfaces

3. **[TESTS]** Aucun test présent
   - 0% de couverture
   - Impact : Aucune garantie de non-régression
   - Action : Créer tests unitaires pour UseCases

### 📈 Métriques Détaillées

#### Analyse Statique
```bash
flutter analyze : XX warnings, XX errors
flutter pub outdated : XX packages à mettre à jour
```

#### Couverture de Tests
```
Domain Layer : XX%
Data Layer : XX%
Presentation Layer : XX%
TOTAL : XX%
```

#### Sécurité
```
Secrets hardcodés : XX détectés
Endpoints HTTP : XX détectés
Packages vulnérables : XX détectés
```

### 🎯 TOP 3 ACTIONS PRIORITAIRES

#### 1. [PRIORITÉ CRITIQUE] - Impact Sécurité/Architecture
**Action** : [Description précise de l'action]
- **Pourquoi** : [Justification avec impact business/technique]
- **Comment** : [Étapes concrètes de mise en œuvre]
- **Effort estimé** : [XS/S/M/L/XL]
- **Impact** : [Critique/Haut/Moyen/Faible]
- **Fichiers concernés** : [Liste des fichiers]

#### 2. [PRIORITÉ HAUTE] - Impact Qualité/Tests
**Action** : [Description précise de l'action]
- **Pourquoi** : [Justification]
- **Comment** : [Étapes concrètes]
- **Effort estimé** : [XS/S/M/L/XL]
- **Impact** : [Critique/Haut/Moyen/Faible]
- **Fichiers concernés** : [Liste des fichiers]

#### 3. [PRIORITÉ MOYENNE] - Impact Maintenance
**Action** : [Description précise de l'action]
- **Pourquoi** : [Justification]
- **Comment** : [Étapes concrètes]
- **Effort estimé** : [XS/S/M/L/XL]
- **Impact** : [Critique/Haut/Moyen/Faible]
- **Fichiers concernés** : [Liste des fichiers]

### 📋 Plan d'Action Recommandé

**Phase 1 - Urgence (Cette semaine)**
- [ ] Corriger les violations critiques de sécurité
- [ ] Résoudre les problèmes architecturaux bloquants
- [ ] Créer les tests pour la logique critique

**Phase 2 - Court terme (Ce mois)**
- [ ] Améliorer la couverture de tests à 60%
- [ ] Refactoriser les violations de qualité de code
- [ ] Mettre à jour les packages vulnérables

**Phase 3 - Moyen terme (Ce trimestre)**
- [ ] Finaliser l'architecture Clean complète
- [ ] Atteindre 80% de couverture de tests
- [ ] Implémenter toutes les best practices de sécurité

---

### 🔍 Commandes Utiles pour Suivi

```bash
# Vérifier la qualité
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter analyze

# Lancer les tests avec couverture
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter test --coverage

# Vérifier les secrets
docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "grep -r -E '(api[_-]?key|token|password)' lib/"

# Mettre à jour les dépendances
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub upgrade
```

---

**📝 Note** : Pour des audits ciblés, utilisez les commandes spécialisées :
- `/check-architecture` - Audit architecture uniquement
- `/check-code-quality` - Audit qualité de code uniquement
- `/check-testing` - Audit tests uniquement
- `/check-security` - Audit sécurité uniquement

**Date de l'audit** : [Date du jour]
**Version Flutter** : [Détecter depuis `flutter --version`]
**Auditeur** : Claude (Expert Flutter)
