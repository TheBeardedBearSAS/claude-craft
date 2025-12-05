# Analysis Workflow - Mandatory Methodology Before Coding

## Fundamental Principle

**Golden Rule**: NEVER start coding without having completed a thorough analysis of context and impacts.

This rule applies to:
- Adding new features
- Modifying existing code
- Bug fixes
- Refactoring
- Performance optimizations

---

## Phase 1: Understanding the Need

### 1.1 Request Clarification

**Questions to ask**:

```markdown
□ What is the exact business need?
□ Who are the end users?
□ What problem does this feature solve?
□ What are the constraints (performance, security, UX)?
□ Are there dependencies with other features?
□ What are the acceptance criteria?
```

**Analysis Example**:

```
REQUEST: "Add a favorites system for products"

ANALYSIS:
- Business need: Allow users to save their favorite products
- Users: Authenticated AND non-authenticated customers
- Problem solved: Facilitate re-access to products of interest
- Constraints:
  * Performance: Favorites list accessible offline
  * Security: Favorites must be synced between devices
  * UX: Immediate feedback (optimistic updates)
- Dependencies: Authentication system, Products API, local storage
- Acceptance criteria:
  1. "Favorite" button on each product
  2. Local AND cloud persistence
  3. Synchronization on login
  4. Accessible "My Favorites" page
```

### 1.2 Use Case Analysis

Identify ALL scenarios:

```dart
// Use case examples for favorites
/*
USE CASES:
1. Unauthenticated user adds a favorite
   → Store locally, suggest creating an account

2. Authenticated user adds a favorite
   → Store locally + sync with backend

3. User logs in
   → Merge local favorites with cloud favorites

4. User deletes a favorite
   → Delete locally + sync with backend

5. Favorite product no longer exists
   → Automatically clean up orphan favorites

6. Connection loss during addition
   → Sync queue for later retry

7. Favorites limit reached
   → Display message and suggest deletion
*/
```

---

## Phase 2: Exploring Existing Code

### 2.1 Code Mapping

**Before any modification, explore**:

```bash
# 1. Search for similar features
grep -r "bookmark\|favorite\|like" lib/features/

# 2. Identify existing patterns
find lib/features -name "*_bloc.dart" | head -5

# 3. Find similar repositories
find lib/features -name "*_repository.dart"

# 4. Analyze data structure
grep -r "class.*Model" lib/features/*/data/models/

# 5. Check dependencies
grep -A 20 "dependencies:" pubspec.yaml
```

**Document discoveries**:

```markdown
EXISTING PATTERNS EXPLORATION:

1. State Management:
   - Project uses flutter_bloc
   - Pattern: Event → Bloc → State
   - Example: lib/features/auth/presentation/bloc/

2. Repository Pattern:
   - Interface in domain/repositories/
   - Implementation in data/repositories/
   - Uses dartz for Either<Failure, Success>

3. Local Storage:
   - Uses Hive for cache
   - Boxes created in core/cache/cache_manager.dart

4. API:
   - Retrofit + Dio
   - Base client in core/network/api_client.dart
```

### 2.2 Dependency Identification

```dart
// Create a mental dependency diagram

/*
DEPENDENCY DIAGRAM FOR FAVORITES:

ProductDetailPage
    ↓
FavoriteButton (new widget)
    ↓
FavoriteBloc (new)
    ↓
ToggleFavoriteUseCase (new)
    ↓
FavoriteRepository (new)
    ↓
┌─────────────────┬─────────────────────┐
│                 │                     │
LocalDataSource   RemoteDataSource      SyncService
(Hive)           (API)                 (new)
    ↓                 ↓                     ↓
FavoriteBox      FavoriteApiClient     WorkManager
                                       (background sync)

EXISTING TO REUSE:
- NetworkInfo (check connection)
- CacheManager (Hive management)
- ApiClient (base Dio/Retrofit)
- AuthBloc (user ID to associate favorites)
*/
```

### 2.3 Impact Analysis

**Impact on existing code**:

```markdown
FILES TO MODIFY:

1. pubspec.yaml
   → Add: workmanager (for background sync)

2. lib/dependency_injection.dart
   → Register new services

3. lib/features/products/presentation/pages/product_detail_page.dart
   → Add FavoriteButton

4. lib/features/products/data/models/product_model.dart
   → Add `isFavorite` field (optional, for UI)

5. lib/core/navigation/app_router.dart
   → Add route /favorites

NEW FILES TO CREATE:

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

## Phase 3: Solution Design

### 3.1 Detailed Architecture

**Define each layer**:

```dart
// ===== DOMAIN LAYER =====

// Entity: Pure business representation
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

// Repository Interface: Contract
abstract class FavoriteRepository {
  Future<Either<Failure, List<Favorite>>> getFavorites(String userId);
  Future<Either<Failure, void>> addFavorite(String userId, String productId);
  Future<Either<Failure, void>> removeFavorite(String favoriteId);
  Future<Either<Failure, void>> syncFavorites(String userId);
}

// Use Case: Isolated business logic
class AddFavorite {
  final FavoriteRepository repository;

  AddFavorite(this.repository);

  Future<Either<Failure, void>> call({
    required String userId,
    required String productId,
  }) async {
    // Business validation
    if (userId.isEmpty || productId.isEmpty) {
      return Left(ValidationFailure('Invalid parameters'));
    }

    // Delegate to repository
    return await repository.addFavorite(userId, productId);
  }
}

// ===== DATA LAYER =====

// Model: Serialization/Deserialization
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

// Extension for Entity ↔ Model conversion
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

  // ... other methods
}

// Repository Implementation: Orchestration
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

      // Always save locally first (offline-first)
      await localDataSource.cacheFavorite(favorite);

      // Attempt sync with backend if connected
      if (await networkInfo.isConnected) {
        try {
          await remoteDataSource.addFavorite(favorite);
        } catch (e) {
          // Mark for later sync, don't fail
          await localDataSource.markForSync(favorite.id);
        }
      }

      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  // ... other methods
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

// Optimistic State (for immediate feedback)
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
  }

  Future<void> _onAddFavorite(
    AddFavoritePressed event,
    Emitter<FavoriteState> emit,
  ) async {
    final userId = authBloc.state.user?.id;
    if (userId == null) return;

    // Optimistic update for reactive UI
    emit(FavoriteOptimisticAdded(event.productId));

    final result = await addFavoriteUseCase(
      userId: userId,
      productId: event.productId,
    );

    result.fold(
      (failure) => emit(FavoriteError(failure.message)),
      (_) => add(const LoadFavorites()), // Reload list
    );
  }
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
        // Handle optimistic state
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

### 3.2 Edge Case Management

**Anticipate edge cases**:

```dart
/*
EDGE CASES TO HANDLE:

1. Rapid double-tap on favorite button
   → Debounce or disable during operation

2. Product already in favorites
   → Check before adding, return early

3. Favorites limit (e.g., 100 max)
   → Validate client AND server side

4. Deletion of a product that's in favorites
   → Soft delete or automatic cleanup

5. Account change
   → Clear local favorites cache

6. Sync conflict (simultaneous web + mobile modification)
   → Last-write-wins or intelligent merge

7. Insufficient disk space for cache
   → Handle exception, suggest cleanup
*/

// Example: Debouncing to avoid double-tap
class FavoriteButton extends StatefulWidget {
  // ... props

  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton> {
  bool _isProcessing = false;

  Future<void> _toggleFavorite() async {
    if (_isProcessing) return; // Ignore if already in progress

    setState(() => _isProcessing = true);

    // Perform action
    if (widget.isFavorite) {
      context.read<FavoriteBloc>().add(
            RemoveFavoritePressed(widget.productId),
          );
    } else {
      context.read<FavoriteBloc>().add(
            AddFavoritePressed(widget.productId),
          );
    }

    // Unblock after delay
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

## Phase 4: Test Plan

### 4.1 Testing Strategy

**Define BEFORE coding**:

```dart
/*
TEST PLAN FOR FAVORITES FEATURE:

┌─────────────────────────────────────────────────────────┐
│                  UNIT TESTS                             │
├─────────────────────────────────────────────────────────┤
│ 1. UseCases                                             │
│    - AddFavorite: success, validation error            │
│    - RemoveFavorite: success, not found                │
│    - GetFavorites: success, empty list                 │
│                                                         │
│ 2. Repositories                                         │
│    - addFavorite: online/offline scenarios            │
│    - sync: conflict resolution                        │
│    - caching strategy                                  │
│                                                         │
│ 3. DataSources                                          │
│    - Local: CRUD operations                           │
│    - Remote: API responses, errors                    │
│                                                         │
│ 4. BLoC                                                 │
│    - Events → States mapping                           │
│    - Optimistic updates                                │
│    - Error handling                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 WIDGET TESTS                            │
├─────────────────────────────────────────────────────────┤
│ 1. FavoriteButton                                       │
│    - Correct display (filled/outlined)                 │
│    - Tap triggers correct event                        │
│    - Disabled during processing                        │
│                                                         │
│ 2. FavoritesPage                                        │
│    - Empty list → placeholder                          │
│    - Filled list → display items                       │
│    - Pull-to-refresh works                             │
│    - Item deletion → confirmation dialog               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              INTEGRATION TESTS                          │
├─────────────────────────────────────────────────────────┤
│ 1. E2E Favorite Flow                                    │
│    - Login → Browse → Add Favorite → Check List        │
│    - Offline mode → Add → Go online → Sync             │
│    - Logout → Login other account → Separate favorites │
└─────────────────────────────────────────────────────────┘
*/

// Example: Unit test for UseCase
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

### 4.2 Quality Criteria

**Define acceptable thresholds**:

```yaml
# test_coverage_requirements.yaml
minimum_coverage:
  overall: 80%
  domain: 95%     # UseCases must be heavily tested
  data: 85%       # Repositories and DataSources
  presentation: 70%  # BLoCs and Widgets

quality_gates:
  - no_flutter_lints_warnings: true
  - dart_analyze_clean: true
  - all_tests_pass: true
  - build_success: true
```

---

## Phase 5: Estimation and Planning

### 5.1 Task Breakdown

```markdown
TASKS FOR FAVORITES FEATURE (estimates):

1. Initial setup (1h)
   - Add dependencies (Hive, workmanager)
   - Configure DI
   - Create folder structure

2. Domain layer (2h)
   - Favorite Entity
   - Repository interface
   - UseCases (Add, Remove, Get, Sync)

3. Data layer (4h)
   - Models with Freezed
   - Local DataSource (Hive)
   - Remote DataSource (API)
   - Repository implementation
   - Unit tests

4. Presentation layer (5h)
   - BLoC (Events, States, Logic)
   - FavoriteButton widget
   - FavoritesPage
   - Widget tests

5. Integration (3h)
   - Add button to ProductDetailPage
   - Navigation to FavoritesPage
   - Background sync
   - Integration tests

6. Polish & Bug fixes (2h)
   - Animations
   - Error messages
   - Loading states
   - Edge cases

TOTAL: ~17h (2-3 days)
```

### 5.2 Validation Checklist

```markdown
BEFORE STARTING:
□ I understand the business need
□ I explored existing code
□ I identified patterns to follow
□ I designed the complete architecture
□ I anticipated edge cases
□ I defined the test plan
□ I estimated tasks

DURING DEVELOPMENT:
□ I follow the defined architecture
□ I write tests alongside code
□ I respect naming conventions
□ I document public code
□ I commit regularly with clear messages

BEFORE PUSH:
□ All tests pass
□ Coverage meets thresholds
□ Dart analyze clean
□ Code formatted (dart format)
□ Documentation up to date
□ Changelog updated
```

---

## Phase 6: Post-Implementation Review

### 6.1 Solution Validation

**After implementation, verify**:

```markdown
POST-DEV CHECKLIST:

FUNCTIONAL:
□ All use cases work
□ Edge cases are handled
□ UX is smooth (no freezes)
□ Animations are smooth
□ Error messages are clear

TECHNICAL:
□ Architecture respected (Clean Architecture)
□ SOLID principles applied
□ DRY code (no duplication)
□ Acceptable performance (profiling done)
□ No memory leaks

QUALITY:
□ Test coverage > defined thresholds
□ Complete documentation
□ Code review approved
□ No warnings or deprecations

SECURITY:
□ No sensitive data in clear text
□ Validation on client AND server side
□ Secure token/credentials management
```

### 6.2 Lessons Learned

**Document for next time**:

```markdown
# Post-Mortem: Favorites Feature

## What Worked Well
- Clean Architecture: easy to add new use cases
- Offline-first: very responsive UX even without network
- Tests: few bugs thanks to exhaustive tests

## Difficulties Encountered
- Sync conflicts: merge logic more complex than expected
- Performance: list of 1000+ favorites lags → added pagination
- Hive: schema migration tedious → use Isar next time?

## Future Improvements
- Add search/filters in favorites page
- Group favorites by categories
- Share favorites list

## Metrics
- Estimated time: 17h
- Actual time: 20h (+3h for unforeseen edge cases)
- Tests: 87% coverage
- Post-release bugs: 2 (minor)
```

---

## Feature Analysis Template

```markdown
# Analysis: [FEATURE NAME]

## 1. Context

**Initial request**:
[Copy exact request]

**Business need**:
[Reformulate need in business terms]

**Concerned users**:
[Who will use this feature?]

## 2. Use Cases

### Main scenario
1. [Step 1]
2. [Step 2]
...

### Alternative scenarios
- [Alternative case 1]
- [Alternative case 2]

### Edge cases
- [Edge case 1]
- [Edge case 2]

## 3. Code Exploration

**Existing similar features**:
[List and analyze]

**Patterns to reuse**:
[Identify project patterns]

**Dependencies**:
[List necessary modules/services]

## 4. Proposed Architecture

```
[Diagram or description]
```

**Files to create**:
- [List]

**Files to modify**:
- [List]

## 5. Test Plan

**Unit tests**:
- [List classes to test]

**Widget tests**:
- [List widgets to test]

**Integration tests**:
- [E2E flows to test]

## 6. Estimation

**Complexity**: Low / Medium / High

**Estimated time**: [X hours/days]

**Identified risks**:
- [Risk 1]
- [Risk 2]

## 7. Validation

□ Architecture validated by lead dev
□ UX/UI validated by designer
□ Security impacts evaluated
□ Estimated performance acceptable
□ Rollback plan defined
```

---

## Analysis Helper Tools

### Useful Scripts

```bash
# analyze_feature.sh
# Helps explore code for a new feature

#!/bin/bash

FEATURE_NAME=$1

echo "🔍 Feature analysis: $FEATURE_NAME"

echo "\n📁 Similar features:"
find lib/features -type d -maxdepth 1 | grep -i "$FEATURE_NAME"

echo "\n📄 Pattern search:"
grep -r "class.*Bloc" lib/features | head -5
grep -r "abstract class.*Repository" lib/features | head -5

echo "\n📦 Current dependencies:"
grep "dependencies:" -A 30 pubspec.yaml

echo "\n🧪 Test structure:"
find test/features -name "*_test.dart" | head -10

echo "\n✅ Analysis complete"
```

---

## Precautionary Principle

**When in doubt**:

1. **STOP** - Don't code impulsively
2. **ASK QUESTIONS** - Clarify with product owner / lead dev
3. **EXPLORE** - Analyze existing code more deeply
4. **PROTOTYPE** - Do a technical spike if uncertain
5. **DOCUMENT** - Share analysis with team

**Quote to remember**:

> "Hours of planning can save weeks of coding and debugging."
> — Anonymous Developer

---

*This analysis methodology must be applied systematically to ensure quality, consistency, and code maintainability.*
