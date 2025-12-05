# Analyse-Workflow - Verpflichtende Methodologie vor dem Codieren

## Grundprinzip

**Goldene Regel**: Beginnen Sie NIE mit dem Codieren, ohne eine gründliche Analyse des Kontexts und der Auswirkungen abgeschlossen zu haben.

Diese Regel gilt für:
- Hinzufügen neuer Funktionen
- Änderung bestehenden Codes
- Fehlerbehebungen
- Refactoring
- Performance-Optimierungen

---

## Phase 1: Verstehen des Bedarfs

### 1.1 Anforderungsklärung

**Zu stellende Fragen**:

```markdown
□ Was ist der genaue Geschäftsbedarf?
□ Wer sind die Endnutzer?
□ Welches Problem löst diese Funktion?
□ Was sind die Einschränkungen (Performance, Sicherheit, UX)?
□ Gibt es Abhängigkeiten zu anderen Funktionen?
□ Was sind die Akzeptanzkriterien?
```

**Analyse-Beispiel**:

```
ANFRAGE: "Füge ein Favoritensystem für Produkte hinzu"

ANALYSE:
- Geschäftsbedarf: Benutzern ermöglichen, ihre Lieblingsprodukte zu speichern
- Nutzer: Authentifizierte UND nicht-authentifizierte Kunden
- Gelöstes Problem: Erleichterung des erneuten Zugriffs auf interessante Produkte
- Einschränkungen:
  * Performance: Favoritenliste offline verfügbar
  * Sicherheit: Favoriten müssen zwischen Geräten synchronisiert werden
  * UX: Sofortiges Feedback (optimistische Updates)
- Abhängigkeiten: Authentifizierungssystem, Produkte-API, lokaler Speicher
- Akzeptanzkriterien:
  1. "Favoriten"-Button bei jedem Produkt
  2. Lokale UND Cloud-Persistenz
  3. Synchronisierung bei Anmeldung
  4. Zugreifbare "Meine Favoriten"-Seite
```

### 1.2 Anwendungsfall-Analyse

Identifizieren Sie ALLE Szenarien:

```dart
// Anwendungsfälle für Favoriten
/*
ANWENDUNGSFÄLLE:
1. Nicht authentifizierter Benutzer fügt einen Favoriten hinzu
   → Lokal speichern, Kontoerstellung vorschlagen

2. Authentifizierter Benutzer fügt einen Favoriten hinzu
   → Lokal speichern + mit Backend synchronisieren

3. Benutzer meldet sich an
   → Lokale Favoriten mit Cloud-Favoriten zusammenführen

4. Benutzer löscht einen Favoriten
   → Lokal löschen + mit Backend synchronisieren

5. Favorisiertes Produkt existiert nicht mehr
   → Verwaiste Favoriten automatisch bereinigen

6. Verbindungsverlust während Hinzufügen
   → Sync-Warteschlange für späteren Wiederholungsversuch

7. Favoritenlimit erreicht
   → Nachricht anzeigen und Löschung vorschlagen
*/
```

---

## Phase 2: Erkundung des bestehenden Codes

### 2.1 Code-Mapping

**Vor jeder Änderung erkunden**:

```bash
# 1. Nach ähnlichen Funktionen suchen
grep -r "bookmark\|favorite\|like" lib/features/

# 2. Existierende Muster identifizieren
find lib/features -name "*_bloc.dart" | head -5

# 3. Ähnliche Repositories finden
find lib/features -name "*_repository.dart"

# 4. Datenstruktur analysieren
grep -r "class.*Model" lib/features/*/data/models/

# 5. Abhängigkeiten prüfen
grep -A 20 "dependencies:" pubspec.yaml
```

**Entdeckungen dokumentieren**:

```markdown
ERKUNDUNG EXISTIERENDER MUSTER:

1. State Management:
   - Projekt verwendet flutter_bloc
   - Muster: Event → Bloc → State
   - Beispiel: lib/features/auth/presentation/bloc/

2. Repository-Muster:
   - Interface in domain/repositories/
   - Implementation in data/repositories/
   - Verwendet dartz für Either<Failure, Success>

3. Lokaler Speicher:
   - Verwendet Hive für Cache
   - Boxes erstellt in core/cache/cache_manager.dart

4. API:
   - Retrofit + Dio
   - Base Client in core/network/api_client.dart
```

### 2.2 Abhängigkeiten identifizieren

```dart
// Mentales Abhängigkeitsdiagramm erstellen

/*
ABHÄNGIGKEITSDIAGRAMM FÜR FAVORITEN:

ProductDetailPage
    ↓
FavoriteButton (neues Widget)
    ↓
FavoriteBloc (neu)
    ↓
ToggleFavoriteUseCase (neu)
    ↓
FavoriteRepository (neu)
    ↓
┌─────────────────┬─────────────────────┐
│                 │                     │
LocalDataSource   RemoteDataSource      SyncService
(Hive)           (API)                 (neu)
    ↓                 ↓                     ↓
FavoriteBox      FavoriteApiClient     WorkManager
                                       (Hintergrundsync)

EXISTIERENDES WIEDERVERWENDEN:
- NetworkInfo (Verbindung prüfen)
- CacheManager (Hive-Verwaltung)
- ApiClient (Basis Dio/Retrofit)
- AuthBloc (Benutzer-ID zur Zuordnung von Favoriten)
*/
```

### 2.3 Auswirkungsanalyse

**Auswirkungen auf bestehenden Code**:

```markdown
ZU ÄNDERNDE DATEIEN:

1. pubspec.yaml
   → Hinzufügen: workmanager (für Hintergrundsync)

2. lib/dependency_injection.dart
   → Neue Services registrieren

3. lib/features/products/presentation/pages/product_detail_page.dart
   → FavoriteButton hinzufügen

4. lib/features/products/data/models/product_model.dart
   → `isFavorite`-Feld hinzufügen (optional, für UI)

5. lib/core/navigation/app_router.dart
   → Route /favorites hinzufügen

NEU ZU ERSTELLENDE DATEIEN:

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

## Phase 3: Lösungsdesign

### 3.1 Detaillierte Architektur

**Jede Schicht definieren**:

```dart
// ===== DOMAIN LAYER =====

// Entity: Reine Geschäftsrepräsentation
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

// Repository Interface: Vertrag
abstract class FavoriteRepository {
  Future<Either<Failure, List<Favorite>>> getFavorites(String userId);
  Future<Either<Failure, void>> addFavorite(String userId, String productId);
  Future<Either<Failure, void>> removeFavorite(String favoriteId);
  Future<Either<Failure, void>> syncFavorites(String userId);
}

// Use Case: Isolierte Geschäftslogik
class AddFavorite {
  final FavoriteRepository repository;

  AddFavorite(this.repository);

  Future<Either<Failure, void>> call({
    required String userId,
    required String productId,
  }) async {
    // Geschäftsvalidierung
    if (userId.isEmpty || productId.isEmpty) {
      return Left(ValidationFailure('Ungültige Parameter'));
    }

    // An Repository delegieren
    return await repository.addFavorite(userId, productId);
  }
}

// ===== DATA LAYER =====

// Model: Serialisierung/Deserialisierung
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

// Extension für Entity ↔ Model Konvertierung
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

  // ... andere Methoden
}

// Repository Implementation: Orchestrierung
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

      // Immer zuerst lokal speichern (offline-first)
      await localDataSource.cacheFavorite(favorite);

      // Sync-Versuch mit Backend wenn verbunden
      if (await networkInfo.isConnected) {
        try {
          await remoteDataSource.addFavorite(favorite);
        } catch (e) {
          // Für späteren Sync markieren, nicht fehlschlagen
          await localDataSource.markForSync(favorite.id);
        }
      }

      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  // ... andere Methoden
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

// Optimistischer State (für sofortiges Feedback)
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

    // Optimistisches Update für reaktive UI
    emit(FavoriteOptimisticAdded(event.productId));

    final result = await addFavoriteUseCase(
      userId: userId,
      productId: event.productId,
    );

    result.fold(
      (failure) => emit(FavoriteError(failure.message)),
      (_) => add(const LoadFavorites()), // Liste neu laden
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
        // Optimistischen State behandeln
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

**Edge Cases antizipieren**:

```dart
/*
ZU BEHANDELNDE EDGE CASES:

1. Schnelles Doppeltippen auf Favoriten-Button
   → Debounce oder während Operation deaktivieren

2. Produkt bereits in Favoriten
   → Vor Hinzufügen prüfen, früh zurückkehren

3. Favoritenlimit (z.B. max. 100)
   → Client UND Serverseite validieren

4. Löschung eines Produkts das in Favoriten ist
   → Soft Delete oder automatische Bereinigung

5. Kontowechsel
   → Lokalen Favoriten-Cache löschen

6. Sync-Konflikt (gleichzeitige Web + Mobile Änderung)
   → Last-write-wins oder intelligentes Mergen

7. Unzureichender Festplattenspeicher für Cache
   → Exception behandeln, Bereinigung vorschlagen
*/

// Beispiel: Debouncing um Doppeltippen zu vermeiden
class FavoriteButton extends StatefulWidget {
  // ... props

  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton> {
  bool _isProcessing = false;

  Future<void> _toggleFavorite() async {
    if (_isProcessing) return; // Ignorieren wenn bereits läuft

    setState(() => _isProcessing = true);

    // Aktion durchführen
    if (widget.isFavorite) {
      context.read<FavoriteBloc>().add(
            RemoveFavoritePressed(widget.productId),
          );
    } else {
      context.read<FavoriteBloc>().add(
            AddFavoritePressed(widget.productId),
          );
    }

    // Nach Verzögerung entsperren
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

## Phase 4: Testplan

### 4.1 Teststrategie

**VORHER definieren**:

```dart
/*
TESTPLAN FÜR FAVORITEN-FUNKTION:

┌─────────────────────────────────────────────────────────┐
│                  UNIT TESTS                             │
├─────────────────────────────────────────────────────────┤
│ 1. UseCases                                             │
│    - AddFavorite: Erfolg, Validierungsfehler          │
│    - RemoveFavorite: Erfolg, nicht gefunden           │
│    - GetFavorites: Erfolg, leere Liste                │
│                                                         │
│ 2. Repositories                                         │
│    - addFavorite: Online/Offline Szenarien            │
│    - sync: Konfliktauflösung                          │
│    - Caching-Strategie                                │
│                                                         │
│ 3. DataSources                                          │
│    - Local: CRUD Operationen                          │
│    - Remote: API Antworten, Fehler                    │
│                                                         │
│ 4. BLoC                                                 │
│    - Events → States Mapping                           │
│    - Optimistische Updates                            │
│    - Fehlerbehandlung                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 WIDGET TESTS                            │
├─────────────────────────────────────────────────────────┤
│ 1. FavoriteButton                                       │
│    - Korrekte Anzeige (gefüllt/umrandet)              │
│    - Tippen löst korrektes Event aus                  │
│    - Während Verarbeitung deaktiviert                  │
│                                                         │
│ 2. FavoritesPage                                        │
│    - Leere Liste → Platzhalter                         │
│    - Gefüllte Liste → Elemente anzeigen               │
│    - Pull-to-refresh funktioniert                      │
│    - Element-Löschung → Bestätigungsdialog             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              INTEGRATION TESTS                          │
├─────────────────────────────────────────────────────────┤
│ 1. E2E Favoriten-Flow                                   │
│    - Login → Durchsuchen → Favorit hinzufügen → Liste prüfen │
│    - Offline-Modus → Hinzufügen → Online → Sync         │
│    - Abmelden → Anderes Konto anmelden → Separate Favoriten │
└─────────────────────────────────────────────────────────┘
*/

// Beispiel: Unit-Test für UseCase
void main() {
  group('AddFavorite', () {
    late AddFavorite useCase;
    late MockFavoriteRepository mockRepository;

    setUp(() {
      mockRepository = MockFavoriteRepository();
      useCase = AddFavorite(mockRepository);
    });

    test('sollte Favorit erfolgreich hinzufügen', () async {
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

    test('sollte ValidationFailure für leere userId zurückgeben', () async {
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

### 4.2 Qualitätskriterien

**Akzeptable Schwellenwerte definieren**:

```yaml
# test_coverage_requirements.yaml
minimum_coverage:
  overall: 80%
  domain: 95%     # UseCases müssen stark getestet sein
  data: 85%       # Repositories und DataSources
  presentation: 70%  # BLoCs und Widgets

quality_gates:
  - no_flutter_lints_warnings: true
  - dart_analyze_clean: true
  - all_tests_pass: true
  - build_success: true
```

---

## Phase 5: Schätzung und Planung

### 5.1 Aufgabengliederung

```markdown
AUFGABEN FÜR FAVORITEN-FUNKTION (Schätzungen):

1. Initiales Setup (1h)
   - Abhängigkeiten hinzufügen (Hive, workmanager)
   - DI konfigurieren
   - Ordnerstruktur erstellen

2. Domain Layer (2h)
   - Favorite Entity
   - Repository Interface
   - UseCases (Add, Remove, Get, Sync)

3. Data Layer (4h)
   - Models mit Freezed
   - Local DataSource (Hive)
   - Remote DataSource (API)
   - Repository Implementation
   - Unit Tests

4. Presentation Layer (5h)
   - BLoC (Events, States, Logic)
   - FavoriteButton Widget
   - FavoritesPage
   - Widget Tests

5. Integration (3h)
   - Button zu ProductDetailPage hinzufügen
   - Navigation zu FavoritesPage
   - Hintergrundsync
   - Integration Tests

6. Feinschliff & Bugfixes (2h)
   - Animationen
   - Fehlermeldungen
   - Loading States
   - Edge Cases

GESAMT: ~17h (2-3 Tage)
```

### 5.2 Validierungs-Checkliste

```markdown
VOR DEM START:
□ Ich verstehe den Geschäftsbedarf
□ Ich habe bestehenden Code erkundet
□ Ich habe zu folgende Muster identifiziert
□ Ich habe die komplette Architektur entworfen
□ Ich habe Edge Cases antizipiert
□ Ich habe den Testplan definiert
□ Ich habe Aufgaben geschätzt

WÄHREND DER ENTWICKLUNG:
□ Ich folge der definierten Architektur
□ Ich schreibe Tests parallel zum Code
□ Ich respektiere Namenskonventionen
□ Ich dokumentiere öffentlichen Code
□ Ich committe regelmäßig mit klaren Nachrichten

VOR DEM PUSH:
□ Alle Tests bestehen
□ Coverage erfüllt Schwellenwerte
□ Dart analyze clean
□ Code formatiert (dart format)
□ Dokumentation aktuell
□ Changelog aktualisiert
```

---

## Phase 6: Post-Implementierungs-Review

### 6.1 Lösungsvalidierung

**Nach der Implementierung verifizieren**:

```markdown
POST-DEV CHECKLISTE:

FUNKTIONAL:
□ Alle Anwendungsfälle funktionieren
□ Edge Cases werden behandelt
□ UX ist flüssig (keine Freezes)
□ Animationen sind smooth
□ Fehlermeldungen sind klar

TECHNISCH:
□ Architektur respektiert (Clean Architecture)
□ SOLID-Prinzipien angewendet
□ DRY-Code (keine Duplikation)
□ Akzeptable Performance (Profiling durchgeführt)
□ Keine Memory Leaks

QUALITÄT:
□ Testabdeckung > definierte Schwellenwerte
□ Vollständige Dokumentation
□ Code Review genehmigt
□ Keine Warnungen oder Deprecations

SICHERHEIT:
□ Keine sensiblen Daten im Klartext
□ Validierung auf Client UND Server Seite
□ Sichere Token/Credentials Verwaltung
```

### 6.2 Lessons Learned

**Für das nächste Mal dokumentieren**:

```markdown
# Post-Mortem: Favoriten-Funktion

## Was gut funktioniert hat
- Clean Architecture: einfach neue Use Cases hinzuzufügen
- Offline-first: sehr responsive UX auch ohne Netzwerk
- Tests: wenige Bugs dank erschöpfender Tests

## Aufgetretene Schwierigkeiten
- Sync-Konflikte: Merge-Logik komplexer als erwartet
- Performance: Liste mit 1000+ Favoriten laggt → Paginierung hinzugefügt
- Hive: Schema-Migration mühsam → nächstes Mal Isar verwenden?

## Zukünftige Verbesserungen
- Suche/Filter in Favoritenseite hinzufügen
- Favoriten nach Kategorien gruppieren
- Favoritenliste teilen

## Metriken
- Geschätzte Zeit: 17h
- Tatsächliche Zeit: 20h (+3h für unvorhergesehene Edge Cases)
- Tests: 87% Abdeckung
- Post-Release Bugs: 2 (geringfügig)
```

---

## Funktionsanalyse-Vorlage

```markdown
# Analyse: [FUNKTIONSNAME]

## 1. Kontext

**Ursprüngliche Anfrage**:
[Exakte Anfrage kopieren]

**Geschäftsbedarf**:
[Bedarf in Geschäftstermini reformulieren]

**Betroffene Nutzer**:
[Wer wird diese Funktion nutzen?]

## 2. Anwendungsfälle

### Hauptszenario
1. [Schritt 1]
2. [Schritt 2]
...

### Alternative Szenarien
- [Alternativfall 1]
- [Alternativfall 2]

### Edge Cases
- [Edge Case 1]
- [Edge Case 2]

## 3. Code-Erkundung

**Existierende ähnliche Funktionen**:
[Auflisten und analysieren]

**Wiederzuverwendende Muster**:
[Projektmuster identifizieren]

**Abhängigkeiten**:
[Notwendige Module/Services auflisten]

## 4. Vorgeschlagene Architektur

```
[Diagramm oder Beschreibung]
```

**Zu erstellende Dateien**:
- [Liste]

**Zu ändernde Dateien**:
- [Liste]

## 5. Testplan

**Unit Tests**:
- [Zu testende Klassen auflisten]

**Widget Tests**:
- [Zu testende Widgets auflisten]

**Integration Tests**:
- [Zu testende E2E-Flows auflisten]

## 6. Schätzung

**Komplexität**: Niedrig / Mittel / Hoch

**Geschätzte Zeit**: [X Stunden/Tage]

**Identifizierte Risiken**:
- [Risiko 1]
- [Risiko 2]

## 7. Validierung

□ Architektur vom Lead Dev validiert
□ UX/UI vom Designer validiert
□ Sicherheitsauswirkungen bewertet
□ Geschätzte Performance akzeptabel
□ Rollback-Plan definiert
```

---

## Analyse-Hilfswerkzeuge

### Nützliche Scripts

```bash
# analyze_feature.sh
# Hilft beim Erkunden von Code für neue Funktion

#!/bin/bash

FEATURE_NAME=$1

echo "🔍 Funktionsanalyse: $FEATURE_NAME"

echo "\n📁 Ähnliche Funktionen:"
find lib/features -type d -maxdepth 1 | grep -i "$FEATURE_NAME"

echo "\n📄 Mustersuche:"
grep -r "class.*Bloc" lib/features | head -5
grep -r "abstract class.*Repository" lib/features | head -5

echo "\n📦 Aktuelle Abhängigkeiten:"
grep "dependencies:" -A 30 pubspec.yaml

echo "\n🧪 Teststruktur:"
find test/features -name "*_test.dart" | head -10

echo "\n✅ Analyse abgeschlossen"
```

---

## Vorsichtsprinzip

**Im Zweifelsfall**:

1. **STOP** - Nicht impulsiv codieren
2. **FRAGEN STELLEN** - Mit Product Owner / Lead Dev klären
3. **ERKUNDEN** - Bestehenden Code tiefergehend analysieren
4. **PROTOTYP** - Technischen Spike durchführen wenn unsicher
5. **DOKUMENTIEREN** - Analyse mit Team teilen

**Zu behaltendes Zitat**:

> "Stunden der Planung können Wochen des Codierens und Debuggens sparen."
> — Anonymer Entwickler

---

*Diese Analyse-Methodologie muss systematisch angewendet werden, um Qualität, Konsistenz und Code-Wartbarkeit sicherzustellen.*
