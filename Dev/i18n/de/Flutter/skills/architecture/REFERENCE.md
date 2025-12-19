# Flutter-Architektur - Clean Architecture & Best Practices

## Kernprinzip

Die Flutter-Architektur muss den **Clean Architecture**-Prinzipien folgen, die von Robert C. Martin (Uncle Bob) populär gemacht und an den Flutter/Dart-Kontext angepasst wurden.

**Ziele**:
- Separation of Concerns
- Maximale Testbarkeit
- Framework-Unabhängigkeit
- UI-Unabhängigkeit
- Datenbank-Unabhängigkeit
- Wartbarkeit und Skalierbarkeit

---

## Überblick: Clean Architecture

### Die 3 Hauptschichten

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION                          │
│  (UI, State Management, Navigation)                     │
│                                                         │
│  - Pages (Screens)                                      │
│  - Widgets                                              │
│  - BLoC / Riverpod / Provider                          │
│  - View Models                                          │
│                                                         │
│  Abhängig von: DOMAIN                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                             │
│  (Geschäftslogik, Entities, Use Cases)                 │
│                                                         │
│  - Entities (reine Geschäftsmodelle)                   │
│  - Use Cases (Geschäftslogik)                          │
│  - Repository Interfaces                               │
│                                                         │
│  Abhängig von NICHTS (reinste Schicht)                │
└─────────────────────────────────────────────────────────┘
                         ↑
┌─────────────────────────────────────────────────────────┐
│                       DATA                              │
│  (Datenquellen, Repositories, Models)                  │
│                                                         │
│  - Models (Serialisierung)                             │
│  - Data Sources (Remote, Local)                        │
│  - Repository Implementations                          │
│                                                         │
│  Abhängig von: DOMAIN (implementiert Interfaces)       │
└─────────────────────────────────────────────────────────┘
```

### Abhängigkeitsregel

**ENTSCHEIDEND**: Abhängigkeiten müssen immer nach innen zeigen.

```
PRESENTATION → DOMAIN ← DATA
     ↓                    ↑
  Abhängig von        Abhängig von
```

---

## Vollständige Ordnerstruktur

### Empfohlene Organisation

```
lib/
├── core/                           # Geteilte Funktionalität
│   ├── constants/                  # Globale Konstanten
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── storage_constants.dart
│   │
│   ├── errors/                     # Fehlerbehandlung
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   │
│   ├── extensions/                 # Dart Extensions
│   │   ├── build_context_extension.dart
│   │   ├── date_time_extension.dart
│   │   └── string_extension.dart
│   │
│   ├── network/                    # Netzwerkkonfiguration
│   │   ├── api_client.dart
│   │   ├── network_info.dart
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart
│   │       └── logging_interceptor.dart
│   │
│   ├── theme/                      # App-Theme
│   │   ├── app_theme.dart
│   │   ├── colors.dart
│   │   ├── text_styles.dart
│   │   └── dimensions.dart
│   │
│   ├── utils/                      # Utilities
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   └── helpers.dart
│   │
│   └── widgets/                    # Wiederverwendbare Widgets
│       ├── app_button.dart
│       ├── app_text_field.dart
│       ├── loading_indicator.dart
│       └── error_widget.dart
│
├── features/                       # Geschäftsfunktionen
│   │
│   ├── authentication/             # Feature: Authentifizierung
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── auth_local_datasource.dart
│   │   │   │   └── auth_remote_datasource.dart
│   │   │   ├── models/
│   │   │   │   ├── login_request_model.dart
│   │   │   │   ├── login_response_model.dart
│   │   │   │   └── user_model.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   │
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login.dart
│   │   │       ├── logout.dart
│   │   │       ├── register.dart
│   │   │       └── get_current_user.dart
│   │   │
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── auth_bloc.dart
│   │       │   ├── auth_event.dart
│   │       │   └── auth_state.dart
│   │       ├── pages/
│   │       │   ├── login_page.dart
│   │       │   └── register_page.dart
│   │       └── widgets/
│   │           ├── login_form.dart
│   │           └── social_login_buttons.dart
│   │
│   ├── products/                   # Feature: Produkte
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── product_local_datasource.dart
│   │   │   │   └── product_remote_datasource.dart
│   │   │   ├── models/
│   │   │   │   └── product_model.dart
│   │   │   └── repositories/
│   │   │       └── product_repository_impl.dart
│   │   │
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── product.dart
│   │   │   ├── repositories/
│   │   │   │   └── product_repository.dart
│   │   │   └── usecases/
│   │   │       ├── get_products.dart
│   │   │       ├── get_product_detail.dart
│   │   │       └── search_products.dart
│   │   │
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── product_list/
│   │       │   │   ├── product_list_bloc.dart
│   │       │   │   ├── product_list_event.dart
│   │       │   │   └── product_list_state.dart
│   │       │   └── product_detail/
│   │       │       ├── product_detail_bloc.dart
│   │       │       ├── product_detail_event.dart
│   │       │       └── product_detail_state.dart
│   │       ├── pages/
│   │       │   ├── product_list_page.dart
│   │       │   └── product_detail_page.dart
│   │       └── widgets/
│   │           ├── product_card.dart
│   │           ├── product_grid.dart
│   │           └── product_search_bar.dart
│   │
│   └── [other_features]/          # Andere Features...
│
├── config/                         # Konfiguration
│   ├── routes/
│   │   ├── app_router.dart
│   │   └── route_names.dart
│   └── env/
│       ├── env.dart
│       └── env_config.dart
│
├── dependency_injection.dart       # DI-Konfiguration (get_it/injectable)
└── main.dart                       # Entry Point
```

---

## DOMAIN Layer: Der Geschäftskern

### 1. Entities

**Rolle**: Reine Geschäftsobjekte, ohne Persistenz- oder Präsentationslogik.

**Eigenschaften**:
- Unveränderlich (prefer `@immutable` oder `@freezed`)
- Keine externen Abhängigkeiten
- Keine JSON-Annotationen
- Inhaltsbasierte Gleichheit (use `Equatable`)

```dart
// lib/features/products/domain/entities/product.dart

import 'package:equatable/equatable.dart';

/// Repräsentiert ein Produkt in der Geschäftsdomäne.
///
/// Diese Klasse ist eine reine Entity ohne externe Abhängigkeiten.
class Product extends Equatable {
  /// Eindeutiger Bezeichner des Produkts
  final String id;

  /// Produktname
  final String name;

  /// Detaillierte Beschreibung
  final String description;

  /// Preis in Cents (vermeidet Float-Probleme)
  final int priceInCents;

  /// Haupt-Bild-URL
  final String imageUrl;

  /// Produktkategorie
  final String category;

  /// Verfügbarer Bestand
  final int stock;

  /// Erstellungsdatum
  final DateTime createdAt;

  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.priceInCents,
    required this.imageUrl,
    required this.category,
    required this.stock,
    required this.createdAt,
  });

  /// Gibt den formatierten Preis in Euro zurück
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  /// Gibt an, ob das Produkt auf Lager ist
  bool get isInStock => stock > 0;

  /// Gibt an, ob der Bestand niedrig ist (< 10)
  bool get isLowStock => stock > 0 && stock < 10;

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        priceInCents,
        imageUrl,
        category,
        stock,
        createdAt,
      ];
}
```

**Alternative mit Freezed** (empfohlen für weniger Boilerplate):

```dart
// lib/features/products/domain/entities/product.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';

@freezed
class Product with _$Product {
  const Product._(); // Private Constructor für Custom-Methoden

  const factory Product({
    required String id,
    required String name,
    required String description,
    required int priceInCents,
    required String imageUrl,
    required String category,
    required int stock,
    required DateTime createdAt,
  }) = _Product;

  // Custom Getter
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  bool get isInStock => stock > 0;
  bool get isLowStock => stock > 0 && stock < 10;
}
```

### 2. Repository Interfaces

**Rolle**: Verträge die definieren, wie auf Daten zugegriffen wird, ohne Implementierung.

**Eigenschaften**:
- Abstrakte Klasse oder reines Interface
- Rückgabe `Either<Failure, Success>` (mit dartz) oder `Result<T>`
- Async mit `Future`
- Benennung: `[Entity]Repository`

```dart
// lib/features/products/domain/repositories/product_repository.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';

/// Interface für den Zugriff auf Produktdaten.
///
/// Dieses Interface definiert den Vertrag, den jede
/// konkrete Implementierung des Produkt-Repositories erfüllen muss.
abstract class ProductRepository {
  /// Ruft die Liste aller Produkte ab.
  ///
  /// Gibt [Right<List<Product>>] bei Erfolg zurück,
  /// oder [Left<Failure>] bei Fehler.
  Future<Either<Failure, List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  /// Ruft ein Produkt anhand seiner ID ab.
  ///
  /// Gibt [Right<Product>] zurück, wenn das Produkt existiert,
  /// oder [Left<Failure>] wenn nicht gefunden oder Fehler.
  Future<Either<Failure, Product>> getProductById(String id);

  /// Sucht Produkte nach Name oder Beschreibung.
  ///
  /// [query]: Suchbegriff
  /// [category]: Optionaler Kategoriefilter
  Future<Either<Failure, List<Product>>> searchProducts({
    required String query,
    String? category,
  });

  /// Ruft Produkte aus einer bestimmten Kategorie ab.
  Future<Either<Failure, List<Product>>> getProductsByCategory(
    String category, {
    int page = 1,
    int limit = 20,
  });
}
```

**Alternative mit Result<T>** (ohne dartz):

```dart
// lib/core/utils/result.dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String error) = Failure<T>;
}

// Verwendung im Repository
abstract class ProductRepository {
  Future<Result<List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  Future<Result<Product>> getProductById(String id);
}
```

### 3. Use Cases

**Rolle**: Kapseln die Geschäftslogik für eine spezifische Aktion.

**Prinzip**: Ein Use Case = Eine Geschäftsaktion

**Eigenschaften**:
- Einzelne öffentliche Methode: `call()`
- Nimmt Repository via Dependency Injection
- Enthält Validierungen und Geschäftsregeln
- Benennung: Verb im Infinitiv (GetProducts, CreateOrder, etc.)

```dart
// lib/features/products/domain/usecases/get_products.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';
import '../repositories/product_repository.dart';

/// Ruft die paginierte Liste der Produkte ab.
///
/// Dieser Use Case behandelt die Geschäftslogik für den Abruf von Produkten,
/// einschließlich Parametervalidierung.
class GetProducts {
  final ProductRepository repository;

  GetProducts(this.repository);

  /// Führt den Use Case aus.
  ///
  /// [page]: Seitennummer (beginnt bei 1)
  /// [limit]: Anzahl der Elemente pro Seite (max 100)
  ///
  /// Gibt [Right<List<Product>>] bei Erfolg zurück,
  /// oder [Left<Failure>] bei Fehler.
  Future<Either<Failure, List<Product>>> call({
    int page = 1,
    int limit = 20,
  }) async {
    // Geschäftsparametervalidierung
    if (page < 1) {
      return const Left(ValidationFailure('Seite muss >= 1 sein'));
    }

    if (limit < 1 || limit > 100) {
      return const Left(ValidationFailure('Limit muss zwischen 1 und 100 liegen'));
    }

    // Delegation an Repository
    return await repository.getProducts(page: page, limit: limit);
  }
}
```

---

*Diese Architektur gewährleistet eine klare Trennung der Verantwortlichkeiten, erleichtert das Testen und ermöglicht eine progressive Code-Evolution.*
