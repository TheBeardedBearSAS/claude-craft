---
description: Vérification Qualité du Code Flutter
argument-hint: [arguments]
---

# Vérification Qualité du Code Flutter

## Arguments

$ARGUMENTS

## MISSION

Tu es un expert Flutter chargé d'auditer la qualité du code selon Effective Dart et les meilleures pratiques.

### Étape 1 : Analyse du projet

- [ ] Identifier tous les fichiers Dart du projet
- [ ] Analyser le fichier `analysis_options.yaml`
- [ ] Référencer les règles depuis `/rules/03-coding-standards.md`
- [ ] Référencer les principes depuis `/rules/05-kiss-dry-yagni.md`
- [ ] Vérifier la configuration du linter

### Étape 2 : Vérifications Qualité du Code (25 points)

#### 2.1 Conventions de nommage Effective Dart (6 points)
- [ ] **Classes/Enums** : UpperCamelCase (0-1 pt)
  - Exemples : `UserProfile`, `AuthenticationState`
- [ ] **Variables/Méthodes** : lowerCamelCase (0-1 pt)
  - Exemples : `userName`, `fetchUserData()`
- [ ] **Constantes** : lowerCamelCase (0-1 pt)
  - Exemples : `maxRetries`, `defaultTimeout`
- [ ] **Fichiers** : snake_case (0-1 pt)
  - Exemples : `user_profile.dart`, `authentication_bloc.dart`
- [ ] **Packages** : snake_case (0-1 pt)
  - Vérifier `pubspec.yaml`
- [ ] **Noms descriptifs** : Éviter abréviations cryptiques (0-1 pt)

#### 2.2 Linting et analyse statique (7 points)
- [ ] **analysis_options.yaml** configuré avec règles strictes (0-2 pts)
  - Inclure `flutter_lints` ou `very_good_analysis`
  - Règles personnalisées activées
- [ ] **Aucun warning** dans `flutter analyze` (0-3 pts)
  - Exécuter : `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter analyze`
- [ ] **Aucune violation** de `prefer_const_constructors`, `unnecessary_null_in_if_null_operators` (0-2 pts)

#### 2.3 Principes KISS, DRY, YAGNI (6 points)
- [ ] **KISS (Keep It Simple)** : Méthodes < 50 lignes (0-2 pts)
  - Pas de logique complexe inutile
  - Un niveau d'abstraction par méthode
- [ ] **DRY (Don't Repeat Yourself)** : Pas de code dupliqué (0-2 pts)
  - Utilitaires communs dans `/core/utils/`
  - Widgets réutilisables extraits
- [ ] **YAGNI (You Ain't Gonna Need It)** : Pas de sur-ingénierie (0-2 pts)
  - Pas de code "au cas où"
  - Abstractions justifiées

#### 2.4 Documentation et commentaires (3 points)
- [ ] **Classes publiques** documentées avec `///` (0-1 pt)
- [ ] **Méthodes complexes** avec commentaires explicatifs (0-1 pt)
- [ ] **Pas de code commenté** en production (0-1 pt)
  - Utiliser git pour l'historique

#### 2.5 Gestion des erreurs (3 points)
- [ ] **Try-catch** appropriés avec logging (0-1 pt)
- [ ] **Types d'erreur** spécifiques (pas juste `catch (e)`) (0-1 pt)
- [ ] **Pas de print()** en production (utiliser logger) (0-1 pt)

### Étape 3 : Calcul du score

```
SCORE QUALITÉ CODE = Total des points / 25

Interprétation :
✅ 20-25 pts : Qualité excellente
⚠️ 15-19 pts : Qualité correcte, améliorations recommandées
⚠️ 10-14 pts : Qualité à améliorer
❌ 0-9 pts : Qualité problématique
```

### Étape 4 : Rapport détaillé

Génère un rapport avec :

#### 📊 SCORE QUALITÉ CODE : XX/25

#### ✅ Points forts
- Conventions bien respectées
- Exemples de code propre et lisible

#### ⚠️ Points d'attention
- Violations mineures détectées avec fichiers
- Suggestions d'amélioration

#### ❌ Violations critiques
- Problèmes de nommage
- Code dupliqué ou trop complexe
- Warnings non résolus

#### 📝 Exemples de code à améliorer

```dart
// ❌ Mauvais
var d = DateTime.now(); // Nom cryptique
void doStuff() { ... } // Trop vague

// ✅ Bon
final currentDate = DateTime.now();
void authenticateUser() { ... }
```

#### 🎯 TOP 3 ACTIONS PRIORITAIRES

1. **[PRIORITÉ HAUTE]** Résoudre les warnings de `flutter analyze` (Impact : maintenabilité)
2. **[PRIORITÉ MOYENNE]** Refactoriser les méthodes > 50 lignes (Impact : lisibilité)
3. **[PRIORITÉ BASSE]** Documenter les classes publiques manquantes (Impact : API)

---

**Note** : Ce rapport se concentre uniquement sur la qualité du code. Pour un audit complet, utilisez `/check-compliance`.
