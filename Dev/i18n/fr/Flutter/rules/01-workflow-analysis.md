# Workflow d'Analyse - Méthodologie Obligatoire Avant Codage

## Principe fondamental

**Règle d'or** : Ne JAMAIS commencer à coder sans avoir complété une analyse approfondie du contexte et des impacts.

Cette règle s'applique à :
- Ajout de nouvelles fonctionnalités
- Modifications de code existant
- Corrections de bugs
- Refactoring
- Optimisations de performances

---

## Phase 1 : Compréhension du besoin

### 1.1 Clarification de la demande

**Questions à se poser** :

```markdown
□ Quel est le besoin métier exact ?
□ Qui sont les utilisateurs finaux ?
□ Quel problème cette feature résout-elle ?
□ Quelles sont les contraintes (performance, sécurité, UX) ?
□ Y a-t-il des dépendances avec d'autres features ?
□ Quels sont les critères d'acceptance ?
```

**Exemple d'analyse** :

```
DEMANDE : "Ajouter un système de favoris pour les produits"

ANALYSE :
- Besoin métier : Permettre aux utilisateurs de sauvegarder leurs produits préférés
- Utilisateurs : Clients authentifiés ET non-authentifiés
- Problème résolu : Faciliter le ré-accès aux produits d'intérêt
- Contraintes :
  * Performance : Liste de favoris accessible hors ligne
  * Sécurité : Les favoris doivent être synchronisés entre devices
  * UX : Feedback immédiat (optimistic updates)
- Dépendances : Système d'authentification, API produits, stockage local
- Critères d'acceptance :
  1. Bouton "favori" sur chaque produit
  2. Persistance locale ET cloud
  3. Synchronisation à la connexion
  4. Page "Mes favoris" accessible
```

### 1.2 Analyse des cas d'usage

Identifier TOUS les scénarios :

```dart
// Exemples de cas d'usage pour les favoris
/*
USE CASES :
1. Utilisateur non connecté ajoute un favori
   → Stocker localement, proposer de créer un compte

2. Utilisateur connecté ajoute un favori
   → Stocker localement + sync avec backend

3. Utilisateur se connecte
   → Merger favoris locaux avec favoris cloud

4. Utilisateur supprime un favori
   → Supprimer localement + sync avec backend

5. Produit favori n'existe plus
   → Nettoyer automatiquement les favoris orphelins

6. Perte de connexion pendant l'ajout
   → Queue de sync pour retry ultérieur

7. Limite de favoris atteinte
   → Afficher message et proposer de supprimer
*/
```

---

## Phase 2 : Exploration du code existant

### 2.1 Cartographie du code

**Avant toute modification, explorer** :

```bash
# 1. Chercher les features similaires
grep -r "bookmark\|favorite\|like" lib/features/

# 2. Identifier les patterns existants
find lib/features -name "*_bloc.dart" | head -5

# 3. Trouver les repositories similaires
find lib/features -name "*_repository.dart"

# 4. Analyser la structure de données
grep -r "class.*Model" lib/features/*/data/models/

# 5. Vérifier les dépendances
grep -A 20 "dependencies:" pubspec.yaml
```

**Documenter les découvertes** :

```markdown
EXPLORATION DES PATTERNS EXISTANTS :

1. State Management :
   - Le projet utilise flutter_bloc
   - Pattern : Event → Bloc → State
   - Exemple : lib/features/auth/presentation/bloc/

2. Repository Pattern :
   - Interface dans domain/repositories/
   - Implémentation dans data/repositories/
   - Utilise dartz pour Either<Failure, Success>

3. Stockage local :
   - Utilise Hive pour cache
   - Box créés dans core/cache/cache_manager.dart

4. API :
   - Retrofit + Dio
   - Base client dans core/network/api_client.dart
```

### 2.2 Identification des dépendances

```dart
// Créer un diagramme mental des dépendances

/*
DIAGRAMME DE DÉPENDANCES POUR FAVORIS :

ProductDetailPage
    ↓
FavoriteButton (nouveau widget)
    ↓
FavoriteBloc (nouveau)
    ↓
ToggleFavoriteUseCase (nouveau)
    ↓
FavoriteRepository (nouveau)
    ↓
┌─────────────────┬─────────────────────┐
│                 │                     │
LocalDataSource   RemoteDataSource      SyncService
(Hive)           (API)                 (nouveau)
    ↓                 ↓                     ↓
FavoriteBox      FavoriteApiClient     WorkManager
                                       (background sync)

EXISTANT À RÉUTILISER :
- NetworkInfo (vérifier connexion)
- CacheManager (gestion Hive)
- ApiClient (base Dio/Retrofit)
- AuthBloc (user ID pour associer favoris)
*/
```

### 2.3 Analyse d'impact

**Impact sur le code existant** :

```markdown
FICHIERS À MODIFIER :

1. pubspec.yaml
   → Ajouter : workmanager (pour sync background)

2. lib/dependency_injection.dart
   → Enregistrer nouveaux services

3. lib/features/products/presentation/pages/product_detail_page.dart
   → Ajouter FavoriteButton

4. lib/features/products/data/models/product_model.dart
   → Ajouter champ `isFavorite` (optionnel, pour UI)

5. lib/core/navigation/app_router.dart
   → Ajouter route /favorites

NOUVEAUX FICHIERS À CRÉER :

lib/features/favorites/
├── data/
│   ├── datasources/
│   │   ├── favorite_local_datasource.dart
│   │   └── favorite_remote_datasource.dart
│   ├── models/
│   │   └── favorite_model.dart
│   └── repositories/
│       └── favorite_repository_impl.dart
├── domain/
│   ├── entities/
│   │   └── favorite.dart
│   ├── repositories/
│   │   └── favorite_repository.dart
│   └── usecases/
│       ├── add_favorite.dart
│       ├── remove_favorite.dart
│       ├── get_favorites.dart
│       └── sync_favorites.dart
└── presentation/
    ├── bloc/
    │   ├── favorite_bloc.dart
    │   ├── favorite_event.dart
    │   └── favorite_state.dart
    ├── pages/
    │   └── favorites_page.dart
    └── widgets/
        ├── favorite_button.dart
        └── favorite_list_item.dart
```

---

## Phase 3 : Conception de la solution

### 3.1 Architecture détaillée

**Définir chaque couche** :

```dart
// ===== DOMAIN LAYER =====

// Entity : Représentation métier pure
class Favorite extends Equatable {
  final String id;
  final String userId;
  final String productId;
  final DateTime createdAt;

  const Favorite({
    required this.id,
    required this.userId,
    required this.productId,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, userId, productId, createdAt];
}

// Repository Interface : Contrat
abstract class FavoriteRepository {
  Future<Either<Failure, List<Favorite>>> getFavorites(String userId);
  Future<Either<Failure, void>> addFavorite(String userId, String productId);
  Future<Either<Failure, void>> removeFavorite(String favoriteId);
  Future<Either<Failure, void>> syncFavorites(String userId);
}

// Use Case : Logique métier isolée
class AddFavorite {
  final FavoriteRepository repository;

  AddFavorite(this.repository);

  Future<Either<Failure, void>> call({
    required String userId,
    required String productId,
  }) async {
    // Validation métier
    if (userId.isEmpty || productId.isEmpty) {
      return Left(ValidationFailure('Invalid parameters'));
    }

    // Délégation au repository
    return await repository.addFavorite(userId, productId);
  }
}

// ===== DATA LAYER =====

// Model : Sérialization/Désérialisation
@freezed
class FavoriteModel with _$FavoriteModel {
  const factory FavoriteModel({
    required String id,
    required String userId,
    required String productId,
    required DateTime createdAt,
  }) = _FavoriteModel;

  factory FavoriteModel.fromJson(Map<String, dynamic> json) =>
      _$FavoriteModelFromJson(json);
}

// Extension pour conversion Entity ↔ Model
extension FavoriteModelX on FavoriteModel {
  Favorite toEntity() => Favorite(
        id: id,
        userId: userId,
        productId: productId,
        createdAt: createdAt,
      );
}

// DataSource Interface
abstract class FavoriteLocalDataSource {
  Future<List<FavoriteModel>> getCachedFavorites(String userId);
  Future<void> cacheFavorite(FavoriteModel favorite);
  Future<void> removeFavorite(String favoriteId);
  Future<List<FavoriteModel>> getPendingSyncFavorites();
}

// Implementation
class FavoriteLocalDataSourceImpl implements FavoriteLocalDataSource {
  final Box<FavoriteModel> favoriteBox;

  FavoriteLocalDataSourceImpl(this.favoriteBox);

  @override
  Future<List<FavoriteModel>> getCachedFavorites(String userId) async {
    return favoriteBox.values
        .where((fav) => fav.userId == userId)
        .toList();
  }

  @override
  Future<void> cacheFavorite(FavoriteModel favorite) async {
    await favoriteBox.put(favorite.id, favorite);
  }

  // ... autres méthodes
}

// Repository Implementation : Orchestration
class FavoriteRepositoryImpl implements FavoriteRepository {
  final FavoriteLocalDataSource localDataSource;
  final FavoriteRemoteDataSource remoteDataSource;
  final NetworkInfo networkInfo;

  FavoriteRepositoryImpl({
    required this.localDataSource,
    required this.remoteDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, void>> addFavorite(
    String userId,
    String productId,
  ) async {
    try {
      final favorite = FavoriteModel(
        id: const Uuid().v4(),
        userId: userId,
        productId: productId,
        createdAt: DateTime.now(),
      );

      // Toujours sauver localement d'abord (offline-first)
      await localDataSource.cacheFavorite(favorite);

      // Tenter sync avec backend si connecté
      if (await networkInfo.isConnected) {
        try {
          await remoteDataSource.addFavorite(favorite);
        } catch (e) {
          // Marquer pour sync ultérieur, ne pas échouer
          await localDataSource.markForSync(favorite.id);
        }
      }

      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  // ... autres méthodes
}

// ===== PRESENTATION LAYER =====

// Events
abstract class FavoriteEvent extends Equatable {
  const FavoriteEvent();
}

class AddFavoritePressed extends FavoriteEvent {
  final String productId;

  const AddFavoritePressed(this.productId);

  @override
  List<Object?> get props => [productId];
}

class RemoveFavoritePressed extends FavoriteEvent {
  final String favoriteId;

  const RemoveFavoritePressed(this.favoriteId);

  @override
  List<Object?> get props => [favoriteId];
}

class LoadFavorites extends FavoriteEvent {
  const LoadFavorites();

  @override
  List<Object?> get props => [];
}

// States
abstract class FavoriteState extends Equatable {
  const FavoriteState();
}

class FavoriteInitial extends FavoriteState {
  @override
  List<Object?> get props => [];
}

class FavoriteLoading extends FavoriteState {
  @override
  List<Object?> get props => [];
}

class FavoriteLoaded extends FavoriteState {
  final List<Favorite> favorites;

  const FavoriteLoaded(this.favorites);

  @override
  List<Object?> get props => [favorites];
}

class FavoriteError extends FavoriteState {
  final String message;

  const FavoriteError(this.message);

  @override
  List<Object?> get props => [message];
}

// Optimistic State (pour feedback immédiat)
class FavoriteOptimisticAdded extends FavoriteState {
  final String productId;

  const FavoriteOptimisticAdded(this.productId);

  @override
  List<Object?> get props => [productId];
}

// BLoC
class FavoriteBloc extends Bloc<FavoriteEvent, FavoriteState> {
  final AddFavorite addFavoriteUseCase;
  final RemoveFavorite removeFavoriteUseCase;
  final GetFavorites getFavoritesUseCase;
  final AuthBloc authBloc;

  FavoriteBloc({
    required this.addFavoriteUseCase,
    required this.removeFavoriteUseCase,
    required this.getFavoritesUseCase,
    required this.authBloc,
  }) : super(FavoriteInitial()) {
    on<AddFavoritePressed>(_onAddFavorite);
    on<RemoveFavoritePressed>(_onRemoveFavorite);
    on<LoadFavorites>(_onLoadFavorites);
  }

  Future<void> _onAddFavorite(
    AddFavoritePressed event,
    Emitter<FavoriteState> emit,
  ) async {
    final userId = authBloc.state.user?.id;
    if (userId == null) return;

    // Optimistic update pour UI réactive
    emit(FavoriteOptimisticAdded(event.productId));

    final result = await addFavoriteUseCase(
      userId: userId,
      productId: event.productId,
    );

    result.fold(
      (failure) => emit(FavoriteError(failure.message)),
      (_) => add(const LoadFavorites()), // Recharger la liste
    );
  }

  // ... autres handlers
}

// Widget
class FavoriteButton extends StatelessWidget {
  const FavoriteButton({
    super.key,
    required this.productId,
    required this.isFavorite,
  });

  final String productId;
  final bool isFavorite;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FavoriteBloc, FavoriteState>(
      builder: (context, state) {
        // Gérer l'état optimistic
        final isOptimistic = state is FavoriteOptimisticAdded &&
            state.productId == productId;

        return IconButton(
          icon: Icon(
            isFavorite || isOptimistic
                ? Icons.favorite
                : Icons.favorite_border,
          ),
          color: isFavorite || isOptimistic ? Colors.red : null,
          onPressed: () {
            if (isFavorite) {
              // Trouver le favoriteId et supprimer
              context.read<FavoriteBloc>().add(
                    RemoveFavoritePressed(productId),
                  );
            } else {
              context.read<FavoriteBloc>().add(
                    AddFavoritePressed(productId),
                  );
            }
          },
        );
      },
    );
  }
}
```

### 3.2 Gestion des cas limites

**Anticiper les edge cases** :

```dart
/*
EDGE CASES À GÉRER :

1. Double-tap rapide sur bouton favori
   → Debounce ou désactiver pendant l'opération

2. Produit déjà en favoris
   → Vérifier avant d'ajouter, retourner early

3. Limite de favoris (ex: 100 max)
   → Valider côté client ET serveur

4. Suppression d'un produit qui est en favoris
   → Soft delete ou cleanup automatique

5. Changement de compte
   → Clear cache local des favoris

6. Sync conflict (modification simultanée web + mobile)
   → Last-write-wins ou merger intelligemment

7. Espace disque insuffisant pour cache
   → Gérer l'exception, proposer de nettoyer
*/

// Exemple : Debouncing pour éviter double-tap
class FavoriteButton extends StatefulWidget {
  // ... props

  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton> {
  bool _isProcessing = false;

  Future<void> _toggleFavorite() async {
    if (_isProcessing) return; // Ignorer si déjà en cours

    setState(() => _isProcessing = true);

    // Effectuer l'action
    if (widget.isFavorite) {
      context.read<FavoriteBloc>().add(
            RemoveFavoritePressed(widget.productId),
          );
    } else {
      context.read<FavoriteBloc>().add(
            AddFavoritePressed(widget.productId),
          );
    }

    // Débloquer après délai
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(_isProcessing ? Icons.hourglass_empty : Icons.favorite),
      onPressed: _isProcessing ? null : _toggleFavorite,
    );
  }
}
```

---

## Phase 4 : Plan de test

### 4.1 Stratégie de test

**Définir AVANT de coder** :

```dart
/*
PLAN DE TEST POUR FEATURE FAVORIS :

┌─────────────────────────────────────────────────────┐
│                  UNIT TESTS                         │
├─────────────────────────────────────────────────────┤
│ 1. UseCases                                         │
│    - AddFavorite : success, validation error        │
│    - RemoveFavorite : success, not found            │
│    - GetFavorites : success, empty list             │
│                                                     │
│ 2. Repositories                                     │
│    - addFavorite : online/offline scenarios        │
│    - sync : conflict resolution                    │
│    - caching strategy                              │
│                                                     │
│ 3. DataSources                                      │
│    - Local : CRUD operations                       │
│    - Remote : API responses, errors                │
│                                                     │
│ 4. BLoC                                             │
│    - Events → States mapping                       │
│    - Optimistic updates                            │
│    - Error handling                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 WIDGET TESTS                        │
├─────────────────────────────────────────────────────┤
│ 1. FavoriteButton                                   │
│    - Affichage correct (filled/outlined)           │
│    - Tap déclenche bon event                       │
│    - Disabled pendant processing                   │
│                                                     │
│ 2. FavoritesPage                                    │
│    - Liste vide → placeholder                      │
│    - Liste remplie → affichage items               │
│    - Pull-to-refresh fonctionne                    │
│    - Suppression item → confirmation dialog        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              INTEGRATION TESTS                      │
├─────────────────────────────────────────────────────┤
│ 1. E2E Favorite Flow                                │
│    - Login → Browse → Add Favorite → Check List    │
│    - Offline mode → Add → Go online → Sync         │
│    - Logout → Login autre compte → Favoris séparés │
└─────────────────────────────────────────────────────┘
*/

// Exemple : Unit test pour UseCase
void main() {
  group('AddFavorite', () {
    late AddFavorite useCase;
    late MockFavoriteRepository mockRepository;

    setUp(() {
      mockRepository = MockFavoriteRepository();
      useCase = AddFavorite(mockRepository);
    });

    test('should add favorite successfully', () async {
      // Arrange
      when(() => mockRepository.addFavorite(any(), any()))
          .thenAnswer((_) async => const Right(null));

      // Act
      final result = await useCase(
        userId: 'user123',
        productId: 'prod456',
      );

      // Assert
      expect(result, const Right(null));
      verify(() => mockRepository.addFavorite('user123', 'prod456'))
          .called(1);
    });

    test('should return ValidationFailure for empty userId', () async {
      // Act
      final result = await useCase(
        userId: '',
        productId: 'prod456',
      );

      // Assert
      expect(result, isA<Left<Failure, void>>());
      verifyNever(() => mockRepository.addFavorite(any(), any()));
    });
  });
}
```

### 4.2 Critères de qualité

**Définir les seuils acceptables** :

```yaml
# test_coverage_requirements.yaml
minimum_coverage:
  overall: 80%
  domain: 95%     # UseCases doivent être très testés
  data: 85%       # Repositories et DataSources
  presentation: 70%  # BLoCs et Widgets

quality_gates:
  - no_flutter_lints_warnings: true
  - dart_analyze_clean: true
  - all_tests_pass: true
  - build_success: true
```

---

## Phase 5 : Estimation et planification

### 5.1 Décomposition en tâches

```markdown
TÂCHES POUR FEATURE FAVORIS (estimations) :

1. Setup initial (1h)
   - Ajouter dépendances (Hive, workmanager)
   - Configurer DI
   - Créer structure de dossiers

2. Domain layer (2h)
   - Entity Favorite
   - Repository interface
   - UseCases (Add, Remove, Get, Sync)

3. Data layer (4h)
   - Models avec Freezed
   - Local DataSource (Hive)
   - Remote DataSource (API)
   - Repository implementation
   - Tests unitaires

4. Presentation layer (5h)
   - BLoC (Events, States, Logic)
   - FavoriteButton widget
   - FavoritesPage
   - Widget tests

5. Intégration (3h)
   - Ajouter bouton dans ProductDetailPage
   - Navigation vers FavoritesPage
   - Background sync
   - Integration tests

6. Polish & Bug fixes (2h)
   - Animations
   - Error messages
   - Loading states
   - Edge cases

TOTAL : ~17h (2-3 jours)
```

### 5.2 Checklist de validation

```markdown
AVANT DE COMMENCER :
□ J'ai compris le besoin métier
□ J'ai exploré le code existant
□ J'ai identifié les patterns à suivre
□ J'ai conçu l'architecture complète
□ J'ai anticipé les edge cases
□ J'ai défini le plan de test
□ J'ai estimé les tâches

PENDANT LE DÉVELOPPEMENT :
□ Je suis l'architecture définie
□ J'écris les tests en parallèle du code
□ Je respecte les conventions de nommage
□ Je documente le code public
□ Je commite régulièrement avec messages clairs

AVANT DE PUSH :
□ Tous les tests passent
□ Coverage respecte les seuils
□ Dart analyze clean
□ Code formaté (dart format)
□ Documentation à jour
□ Changelog mis à jour
```

---

## Phase 6 : Revue post-implémentation

### 6.1 Validation de la solution

**Après l'implémentation, vérifier** :

```markdown
CHECKLIST POST-DEV :

FONCTIONNEL :
□ Tous les cas d'usage fonctionnent
□ Les edge cases sont gérés
□ L'UX est fluide (pas de freezes)
□ Les animations sont smooth
□ Les messages d'erreur sont clairs

TECHNIQUE :
□ Architecture respectée (Clean Architecture)
□ SOLID principles appliqués
□ Code DRY (pas de duplication)
□ Performance acceptable (profiling effectué)
□ Pas de memory leaks

QUALITÉ :
□ Tests coverage > seuils définis
□ Documentation complète
□ Code review approuvé
□ Pas de warnings ou deprecations

SÉCURITÉ :
□ Pas de données sensibles en clair
□ Validation côté client ET serveur
□ Gestion sécurisée des tokens/credentials
```

### 6.2 Leçons apprises

**Documenter pour la prochaine fois** :

```markdown
# Post-Mortem : Feature Favoris

## Ce qui a bien fonctionné
- Architecture Clean : facile d'ajouter de nouveaux use cases
- Offline-first : UX très réactive même sans réseau
- Tests : peu de bugs grâce aux tests exhaustifs

## Difficultés rencontrées
- Sync conflicts : logique de merge plus complexe que prévu
- Performance : liste de 1000+ favoris lag → ajouté pagination
- Hive : migration schéma fastidieuse → utiliser Isar next time ?

## Améliorations futures
- Ajouter recherche/filtres dans page favoris
- Grouper favoris par catégories
- Partager liste de favoris

## Métriques
- Temps estimé : 17h
- Temps réel : 20h (+3h pour edge cases imprévus)
- Tests : 87% coverage
- Bugs post-release : 2 (mineurs)
```

---

## Templates de documentation d'analyse

### Template : Analyse de Feature

```markdown
# Analyse : [NOM DE LA FEATURE]

## 1. Contexte

**Demande initiale** :
[Copier la demande exacte]

**Besoin métier** :
[Reformuler le besoin en termes métier]

**Utilisateurs concernés** :
[Qui va utiliser cette feature ?]

## 2. Cas d'usage

### Scénario principal
1. [Étape 1]
2. [Étape 2]
...

### Scénarios alternatifs
- [Cas alternatif 1]
- [Cas alternatif 2]

### Edge cases
- [Edge case 1]
- [Edge case 2]

## 3. Exploration du code

**Features similaires existantes** :
[Lister et analyser]

**Patterns à réutiliser** :
[Identifier les patterns du projet]

**Dépendances** :
[Lister les modules/services nécessaires]

## 4. Architecture proposée

```
[Diagramme ou description]
```

**Fichiers à créer** :
- [Liste]

**Fichiers à modifier** :
- [Liste]

## 5. Plan de test

**Unit tests** :
- [Liste des classes à tester]

**Widget tests** :
- [Liste des widgets à tester]

**Integration tests** :
- [Flows E2E à tester]

## 6. Estimation

**Complexité** : Faible / Moyenne / Élevée

**Temps estimé** : [X heures/jours]

**Risques identifiés** :
- [Risque 1]
- [Risque 2]

## 7. Validation

□ Architecture validée par lead dev
□ UX/UI validée par designer
□ Impacts sécurité évalués
□ Performance estimée acceptable
□ Plan de rollback défini
```

---

## Outils d'aide à l'analyse

### Scripts utiles

```bash
# analyze_feature.sh
# Aide à explorer le code pour une nouvelle feature

#!/bin/bash

FEATURE_NAME=$1

echo "🔍 Analyse de la feature: $FEATURE_NAME"

echo "\n📁 Features similaires :"
find lib/features -type d -maxdepth 1 | grep -i "$FEATURE_NAME"

echo "\n📄 Recherche de patterns :"
grep -r "class.*Bloc" lib/features | head -5
grep -r "abstract class.*Repository" lib/features | head -5

echo "\n📦 Dépendances actuelles :"
grep "dependencies:" -A 30 pubspec.yaml

echo "\n🧪 Structure de tests :"
find test/features -name "*_test.dart" | head -10

echo "\n✅ Analyse terminée"
```

---

## Principe de précaution

**En cas de doute** :

1. **STOP** - Ne pas coder impulsivement
2. **POSER DES QUESTIONS** - Clarifier avec le product owner / lead dev
3. **EXPLORER** - Analyser le code existant plus en profondeur
4. **PROTOTYPER** - Faire un spike technique si incertain
5. **DOCUMENTER** - Partager l'analyse avec l'équipe

**Citation à retenir** :

> "Hours of planning can save weeks of coding and debugging."
> — Anonymous Developer

---

*Cette méthodologie d'analyse doit être appliquée systématiquement pour garantir qualité, cohérence et maintenabilité du code.*
