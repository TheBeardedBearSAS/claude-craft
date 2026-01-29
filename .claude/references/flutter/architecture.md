# Flutter Architecture - Clean Architecture & Best Practices

## Core Principle

Flutter architecture must follow **Clean Architecture** principles popularized by Robert C. Martin (Uncle Bob), adapted to the Flutter/Dart context.

**Objectives**:
- Separation of Concerns
- Maximum testability
- Framework independence
- UI independence
- Database independence
- Maintainability and scalability

---

## Overview: Clean Architecture

### The 3 Main Layers

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
│  Depends on: DOMAIN                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                             │
│  (Business Logic, Entities, Use Cases)                  │
│                                                         │
│  - Entities (pure business models)                     │
│  - Use Cases (business logic)                          │
│  - Repository Interfaces                               │
│                                                         │
│  Depends on NOTHING (purest layer)                     │
└─────────────────────────────────────────────────────────┘
                         ↑
┌─────────────────────────────────────────────────────────┐
│                       DATA                              │
│  (Data Sources, Repositories, Models)                   │
│                                                         │
│  - Models (serialization)                              │
│  - Data Sources (Remote, Local)                        │
│  - Repository Implementations                          │
│                                                         │
│  Depends on: DOMAIN (implements interfaces)            │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rule

**CRUCIAL**: Dependencies must always point inward.

```
PRESENTATION → DOMAIN ← DATA
     ↓                    ↑
  Depends on          Depends on
```

---

## Complete Folder Structure

### Recommended Organization

```
lib/
├── core/                           # Shared functionality
│   ├── constants/                  # Global constants
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── storage_constants.dart
│   │
│   ├── errors/                     # Error handling
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   │
│   ├── extensions/                 # Dart extensions
│   │   ├── build_context_extension.dart
│   │   ├── date_time_extension.dart
│   │   └── string_extension.dart
│   │
│   ├── network/                    # Network configuration
│   │   ├── api_client.dart
│   │   ├── network_info.dart
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart
│   │       └── logging_interceptor.dart
│   │
│   ├── theme/                      # App theme
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
│   └── widgets/                    # Reusable widgets
│       ├── app_button.dart
│       ├── app_text_field.dart
│       ├── loading_indicator.dart
│       └── error_widget.dart
│
├── features/                       # Business features
│   │
│   ├── authentication/             # Feature: Authentication
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
│   ├── products/                   # Feature: Products
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
│   └── [other_features]/          # Other features...
│
├── config/                         # Configuration
│   ├── routes/
│   │   ├── app_router.dart
│   │   └── route_names.dart
│   └── env/
│       ├── env.dart
│       └── env_config.dart
│
├── dependency_injection.dart       # DI Configuration (get_it/injectable)
└── main.dart                       # Entry point
```

---

## DOMAIN Layer: The Business Core

### 1. Entities

**Role**: Pure business objects, without persistence or presentation logic.

**Characteristics**:
- Immutable (prefer `@immutable` or `@freezed`)
- No external dependencies
- No JSON annotations
- Content-based equality (use `Equatable`)

```dart
// lib/features/products/domain/entities/product.dart

import 'package:equatable/equatable.dart';

/// Represents a product in the business domain.
///
/// This class is a pure entity with no external dependencies.
class Product extends Equatable {
  /// Unique identifier of the product
  final String id;

  /// Product name
  final String name;

  /// Detailed description
  final String description;

  /// Price in cents (avoids float issues)
  final int priceInCents;

  /// Main image URL
  final String imageUrl;

  /// Product category
  final String category;

  /// Available stock
  final int stock;

  /// Creation date
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

  /// Returns the formatted price in euros
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  /// Indicates if the product is in stock
  bool get isInStock => stock > 0;

  /// Indicates if stock is low (< 10)
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

**Alternative with Freezed** (recommended for less boilerplate):

```dart
// lib/features/products/domain/entities/product.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';

@freezed
class Product with _$Product {
  const Product._(); // Private constructor for custom methods

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

  // Custom getters
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  bool get isInStock => stock > 0;
  bool get isLowStock => stock > 0 && stock < 10;
}
```

### 2. Repository Interfaces

**Role**: Contracts defining how to access data, without implementation.

**Characteristics**:
- Abstract class or pure interface
- Return `Either<Failure, Success>` (with dartz) or `Result<T>`
- Async with `Future`
- Naming: `[Entity]Repository`

```dart
// lib/features/products/domain/repositories/product_repository.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';

/// Interface for accessing product data.
///
/// This interface defines the contract that any
/// concrete implementation of the product repository must respect.
abstract class ProductRepository {
  /// Retrieves the list of all products.
  ///
  /// Returns [Right<List<Product>>] on success,
  /// or [Left<Failure>] on error.
  Future<Either<Failure, List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  /// Retrieves a product by its ID.
  ///
  /// Returns [Right<Product>] if the product exists,
  /// or [Left<Failure>] if not found or error.
  Future<Either<Failure, Product>> getProductById(String id);

  /// Searches products by name or description.
  ///
  /// [query]: Search term
  /// [category]: Optional category filter
  Future<Either<Failure, List<Product>>> searchProducts({
    required String query,
    String? category,
  });

  /// Retrieves products from a specific category.
  Future<Either<Failure, List<Product>>> getProductsByCategory(
    String category, {
    int page = 1,
    int limit = 20,
  });
}
```

**Alternative with Result<T>** (without dartz):

```dart
// lib/core/utils/result.dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String error) = Failure<T>;
}

// Usage in repository
abstract class ProductRepository {
  Future<Result<List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  Future<Result<Product>> getProductById(String id);
}
```

### 3. Use Cases

**Role**: Encapsulate business logic for a specific action.

**Principle**: One Use Case = One business action

**Characteristics**:
- Single public method: `call()`
- Takes repository via dependency injection
- Contains validations and business rules
- Naming: Verb in infinitive (GetProducts, CreateOrder, etc.)

```dart
// lib/features/products/domain/usecases/get_products.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';
import '../repositories/product_repository.dart';

/// Retrieves the paginated list of products.
///
/// This use case handles the business logic for retrieving products,
/// including parameter validation.
class GetProducts {
  final ProductRepository repository;

  GetProducts(this.repository);

  /// Executes the use case.
  ///
  /// [page]: Page number (starts at 1)
  /// [limit]: Number of items per page (max 100)
  ///
  /// Returns [Right<List<Product>>] on success,
  /// or [Left<Failure>] on error.
  Future<Either<Failure, List<Product>>> call({
    int page = 1,
    int limit = 20,
  }) async {
    // Business parameter validation
    if (page < 1) {
      return const Left(ValidationFailure('Page must be >= 1'));
    }

    if (limit < 1 || limit > 100) {
      return const Left(ValidationFailure('Limit must be between 1 and 100'));
    }

    // Delegation to repository
    return await repository.getProducts(page: page, limit: limit);
  }
}
```

---

*This architecture ensures clear separation of responsibilities, facilitates testing, and allows for progressive code evolution.*
