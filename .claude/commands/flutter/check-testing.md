---
description: Vérification Tests Flutter
argument-hint: [arguments]
---

# Vérification Tests Flutter

## Arguments

$ARGUMENTS

## MISSION

Tu es un expert Flutter chargé d'auditer la stratégie et la couverture de tests du projet.

### Étape 1 : Analyse de la configuration de tests

- [ ] Localiser le dossier `/test/` et sa structure
- [ ] Vérifier les dépendances de test dans `pubspec.yaml` (flutter_test, mockito, bloc_test)
- [ ] Référencer les règles depuis `/rules/07-testing.md`
- [ ] Référencer les outils depuis `/rules/08-quality-tools.md`
- [ ] Vérifier la configuration de couverture

### Étape 2 : Vérifications Tests (25 points)

#### 2.1 Couverture de tests (8 points)
- [ ] **Tests unitaires** présents pour la logique métier (0-3 pts)
  - Domain layer : Entities, UseCases
  - Data layer : Repositories, Models
  - Minimum 70% de couverture sur domain
- [ ] **Tests de widgets** pour les composants UI (0-3 pts)
  - Au moins les widgets critiques testés
  - Tests d'interaction utilisateur (tap, scroll, input)
- [ ] **Couverture globale** mesurée et > 60% (0-2 pts)
  - Exécuter : `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter test --coverage`
  - Analyser `coverage/lcov.info`

#### 2.2 Qualité des tests (7 points)
- [ ] **Pattern AAA** (Arrange-Act-Assert) respecté (0-2 pts)
  - Tests structurés et lisibles
  - Un test = un comportement
- [ ] **Tests isolés** avec mocks/stubs (0-2 pts)
  - Utilisation de mockito ou mocktail
  - Pas de dépendances externes (API, DB) dans les tests
- [ ] **Tests descriptifs** avec noms explicites (0-2 pts)
  - Format : `test('should return user when authentication succeeds')`
- [ ] **Pas de tests flaky** (instables) (0-1 pt)

#### 2.3 Types de tests (6 points)
- [ ] **Unit tests** : Logique pure (0-2 pts)
  - UseCases, Validators, Utils
  - Tests rapides (< 100ms par test)
- [ ] **Widget tests** : UI et interactions (0-2 pts)
  - `testWidgets()` pour composants
  - Pumping et événements simulés
- [ ] **Golden tests** : Tests visuels de régression (0-1 pt)
  - Snapshots de widgets critiques
- [ ] **Integration tests** : Flux complets (0-1 pt)
  - Tests end-to-end pour user stories critiques

#### 2.4 Mocks et fixtures (4 points)
- [ ] **Mocks propres** générés avec mockito/mocktail (0-2 pts)
  - Fichiers `*.mocks.dart` à jour
  - Commande : `flutter pub run build_runner build`
- [ ] **Fixtures/test data** organisés (0-2 pts)
  - Dossier `/test/fixtures/` avec JSON, données test
  - Réutilisables entre tests

### Étape 3 : Exécution des tests

```bash
# Lancer les tests avec couverture
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable sh -c "
  flutter test --coverage && \
  flutter test --reporter expanded
"
```

Analyser les résultats :
- [ ] Nombre total de tests
- [ ] Tests passés/échoués
- [ ] Couverture par fichier

### Étape 4 : Calcul du score

```
SCORE TESTING = Total des points / 25

Interprétation :
✅ 20-25 pts : Couverture excellente
⚠️ 15-19 pts : Couverture correcte, à compléter
⚠️ 10-14 pts : Couverture insuffisante
❌ 0-9 pts : Tests manquants ou inadéquats
```

### Étape 5 : Rapport détaillé

Génère un rapport avec :

#### 📊 SCORE TESTING : XX/25

#### ✅ Points forts
- Types de tests présents
- Bonne couverture détectée
- Exemples de tests bien écrits

#### ⚠️ Points d'attention
- Fichiers sans tests
- Couverture < 60%
- Tests manquants sur features critiques

#### ❌ Violations critiques
- Aucun test présent
- Tests flaky détectés
- Pas de mocks, dépendances externes

#### 📈 Statistiques de couverture

```
Domain Layer : XX% (objectif : 70%)
Data Layer : XX% (objectif : 60%)
Presentation Layer : XX% (objectif : 50%)
TOTAL : XX% (objectif : 60%)
```

#### 💡 Fichiers prioritaires à tester

1. `/lib/domain/usecases/authenticate_user.dart` - Logique critique
2. `/lib/presentation/pages/home_page.dart` - UI principale
3. `/lib/data/repositories/user_repository_impl.dart` - Data access

#### 🎯 TOP 3 ACTIONS PRIORITAIRES

1. **[PRIORITÉ HAUTE]** Ajouter tests unitaires pour les UseCases critiques (Impact : fiabilité)
2. **[PRIORITÉ MOYENNE]** Augmenter couverture à 60% minimum (Impact : confiance)
3. **[PRIORITÉ BASSE]** Ajouter golden tests pour widgets réutilisables (Impact : régression UI)

---

**Note** : Ce rapport se concentre uniquement sur les tests. Pour un audit complet, utilisez `/check-compliance`.
