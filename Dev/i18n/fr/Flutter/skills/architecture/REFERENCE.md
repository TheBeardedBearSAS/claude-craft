# Architecture Flutter - Clean Architecture & Best Practices

## Principe fondamental

L'architecture Flutter doit suivre les principes de **Clean Architecture** popularisés par Robert C. Martin (Uncle Bob), adaptés au contexte Flutter/Dart.

**Objectifs** :
- Séparation des responsabilités (Separation of Concerns)
- Testabilité maximale
- Indépendance des frameworks
- Indépendance de l'UI
- Indépendance de la base de données
- Maintenabilité et évolutivité

---

## Vue d'ensemble : Clean Architecture

### Les 3 couches principales

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
│  Dépend de : DOMAIN                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                             │
│  (Business Logic, Entities, Use Cases)                  │
│                                                         │
│  - Entities (modèles métier purs)                      │
│  - Use Cases (logique métier)                          │
│  - Repository Interfaces                               │
│                                                         │
│  Ne dépend de RIEN (couche la plus pure)               │
└─────────────────────────────────────────────────────────┘
                         ↑
┌─────────────────────────────────────────────────────────┐
│                       DATA                              │
│  (Data Sources, Repositories, Models)                   │
│                                                         │
│  - Models (sérialization)                              │
│  - Data Sources (Remote, Local)                        │
│  - Repository Implementations                          │
│                                                         │
│  Dépend de : DOMAIN (implémente interfaces)            │
└─────────────────────────────────────────────────────────┘
```

### Règle de dépendance

**CRUCIAL** : Les dépendances doivent toujours pointer vers l'intérieur.

```
PRESENTATION → DOMAIN ← DATA
     ↓                    ↑
  Dépend de          Dépend de
```

---

## Structure de dossiers complète

### Organisation recommandée

```
lib/
├── core/                           # Fonctionnalités partagées
│   ├── constants/                  # Constantes globales
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── storage_constants.dart
│   │
│   ├── errors/                     # Gestion des erreurs
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   │
│   ├── extensions/                 # Extensions Dart
│   │   ├── build_context_extension.dart
│   │   ├── date_time_extension.dart
│   │   └── string_extension.dart
│   │
│   ├── network/                    # Configuration réseau
│   │   ├── api_client.dart
│   │   ├── network_info.dart
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart
│   │       └── logging_interceptor.dart
│   │
│   ├── theme/                      # Thème de l'app
│   │   ├── app_theme.dart
│   │   ├── colors.dart
│   │   ├── text_styles.dart
│   │   └── dimensions.dart
│   │
│   ├── utils/                      # Utilitaires
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   └── helpers.dart
│   │
│   └── widgets/                    # Widgets réutilisables
│       ├── app_button.dart
│       ├── app_text_field.dart
│       ├── loading_indicator.dart
│       └── error_widget.dart
│
├── features/                       # Features métier
│   │
│   ├── authentication/             # Feature : Authentification
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
│   ├── products/                   # Feature : Produits
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
│   └── [other_features]/          # Autres features...
│
├── config/                         # Configuration
│   ├── routes/
│   │   ├── app_router.dart
│   │   └── route_names.dart
│   └── env/
│       ├── env.dart
│       └── env_config.dart
│
├── dependency_injection.dart       # Configuration DI (get_it/injectable)
└── main.dart                       # Point d'entrée
```

---

## Couche DOMAIN : Le Coeur Métier

### 1. Entities (Entités)

**Rôle** : Objets métier purs, sans logique de persistance ou présentation.

**Caractéristiques** :
- Immuables (préférer `@immutable` ou `@freezed`)
- Pas de dépendances externes
- Pas d'annotations JSON
- Équivalence basée sur le contenu (utiliser `Equatable`)

```dart
// lib/features/products/domain/entities/product.dart

import 'package:equatable/equatable.dart';

/// Représente un produit dans le domaine métier.
///
/// Cette classe est une entité pure sans dépendances externes.
class Product extends Equatable {
  /// Identifiant unique du produit
  final String id;

  /// Nom du produit
  final String name;

  /// Description détaillée
  final String description;

  /// Prix en centimes (évite problèmes float)
  final int priceInCents;

  /// URL de l'image principale
  final String imageUrl;

  /// Catégorie du produit
  final String category;

  /// Stock disponible
  final int stock;

  /// Date de création
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

  /// Retourne le prix formaté en euros
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  /// Indique si le produit est en stock
  bool get isInStock => stock > 0;

  /// Indique si le stock est faible (< 10)
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

**Alternative avec Freezed** (recommandé pour moins de boilerplate) :

```dart
// lib/features/products/domain/entities/product.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';

@freezed
class Product with _$Product {
  const Product._(); // Private constructor pour méthodes custom

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

  // Getters custom
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  bool get isInStock => stock > 0;
  bool get isLowStock => stock > 0 && stock < 10;
}
```

### 2. Repository Interfaces

**Rôle** : Contrats définissant comment accéder aux données, sans implémentation.

**Caractéristiques** :
- Abstract class ou interface pure
- Retourner `Either<Failure, Success>` (avec dartz) ou `Result<T>`
- Async avec `Future`
- Nommage : `[Entity]Repository`

```dart
// lib/features/products/domain/repositories/product_repository.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';

/// Interface pour accéder aux données produits.
///
/// Cette interface définit le contrat que doit respecter toute
/// implémentation concrète du repository produit.
abstract class ProductRepository {
  /// Récupère la liste de tous les produits.
  ///
  /// Retourne [Right<List<Product>>] en cas de succès,
  /// ou [Left<Failure>] en cas d'erreur.
  Future<Either<Failure, List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  /// Récupère un produit par son ID.
  ///
  /// Retourne [Right<Product>] si le produit existe,
  /// ou [Left<Failure>] si non trouvé ou erreur.
  Future<Either<Failure, Product>> getProductById(String id);

  /// Recherche des produits par nom ou description.
  ///
  /// [query] : Terme de recherche
  /// [category] : Filtre optionnel par catégorie
  Future<Either<Failure, List<Product>>> searchProducts({
    required String query,
    String? category,
  });

  /// Récupère les produits d'une catégorie spécifique.
  Future<Either<Failure, List<Product>>> getProductsByCategory(
    String category, {
    int page = 1,
    int limit = 20,
  });
}
```

**Alternative avec Result<T>** (sans dartz) :

```dart
// lib/core/utils/result.dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String error) = Failure<T>;
}

// Usage dans repository
abstract class ProductRepository {
  Future<Result<List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  Future<Result<Product>> getProductById(String id);
}
```

### 3. Use Cases (Cas d'utilisation)

**Rôle** : Encapsuler la logique métier pour une action spécifique.

**Principe** : Un Use Case = Une action métier

**Caractéristiques** :
- Une seule méthode publique : `call()`
- Prend le repository en injection de dépendance
- Contient validations et règles métier
- Nommage : Verbe à l'infinitif (GetProducts, CreateOrder, etc.)

```dart
// lib/features/products/domain/usecases/get_products.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';
import '../repositories/product_repository.dart';

/// Récupère la liste paginée des produits.
///
/// Ce use case gère la logique métier pour récupérer les produits,
/// incluant la validation des paramètres.
class GetProducts {
  final ProductRepository repository;

  GetProducts(this.repository);

  /// Exécute le use case.
  ///
  /// [page] : Numéro de page (commence à 1)
  /// [limit] : Nombre d'éléments par page (max 100)
  ///
  /// Retourne [Right<List<Product>>] en cas de succès,
  /// ou [Left<Failure>] en cas d'erreur.
  Future<Either<Failure, List<Product>>> call({
    int page = 1,
    int limit = 20,
  }) async {
    // Validation des paramètres métier
    if (page < 1) {
      return const Left(ValidationFailure('Page must be >= 1'));
    }

    if (limit < 1 || limit > 100) {
      return const Left(ValidationFailure('Limit must be between 1 and 100'));
    }

    // Délégation au repository
    return await repository.getProducts(page: page, limit: limit);
  }
}
```

**Use Case avec paramètres complexes** :

```dart
// lib/features/products/domain/usecases/search_products.dart

import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';
import '../repositories/product_repository.dart';

/// Paramètres pour la recherche de produits.
class SearchProductsParams extends Equatable {
  final String query;
  final String? category;
  final int? minPrice;
  final int? maxPrice;
  final bool inStockOnly;

  const SearchProductsParams({
    required this.query,
    this.category,
    this.minPrice,
    this.maxPrice,
    this.inStockOnly = false,
  });

  @override
  List<Object?> get props => [query, category, minPrice, maxPrice, inStockOnly];
}

/// Recherche des produits selon divers critères.
class SearchProducts {
  final ProductRepository repository;

  SearchProducts(this.repository);

  Future<Either<Failure, List<Product>>> call(
    SearchProductsParams params,
  ) async {
    // Validation
    if (params.query.trim().isEmpty) {
      return const Left(ValidationFailure('Query cannot be empty'));
    }

    if (params.query.length < 2) {
      return const Left(ValidationFailure('Query must be at least 2 characters'));
    }

    if (params.minPrice != null && params.maxPrice != null) {
      if (params.minPrice! > params.maxPrice!) {
        return const Left(
          ValidationFailure('Min price cannot be greater than max price'),
        );
      }
    }

    // Récupération des produits
    final result = await repository.searchProducts(
      query: params.query,
      category: params.category,
    );

    // Post-traitement (filtrage côté client si nécessaire)
    return result.fold(
      (failure) => Left(failure),
      (products) {
        var filtered = products;

        // Filtre par prix
        if (params.minPrice != null) {
          filtered = filtered
              .where((p) => p.priceInCents >= params.minPrice!)
              .toList();
        }

        if (params.maxPrice != null) {
          filtered = filtered
              .where((p) => p.priceInCents <= params.maxPrice!)
              .toList();
        }

        // Filtre stock
        if (params.inStockOnly) {
          filtered = filtered.where((p) => p.isInStock).toList();
        }

        return Right(filtered);
      },
    );
  }
}
```

---

## Couche DATA : Accès aux Données

### 1. Models (DTOs - Data Transfer Objects)

**Rôle** : Représentation des données pour sérialization/désérialisation.

**Caractéristiques** :
- Annotations JSON
- Méthodes `fromJson` / `toJson`
- Conversion vers/depuis Entity
- Peut contenir logique de mapping

```dart
// lib/features/products/data/models/product_model.dart

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/product.dart';

part 'product_model.freezed.dart';
part 'product_model.g.dart';

/// Modèle de données pour Product avec sérialization JSON.
@freezed
class ProductModel with _$ProductModel {
  const ProductModel._();

  const factory ProductModel({
    required String id,
    required String name,
    required String description,
    @JsonKey(name: 'price_cents') required int priceInCents,
    @JsonKey(name: 'image_url') required String imageUrl,
    required String category,
    required int stock,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _ProductModel;

  /// Désérialisation depuis JSON
  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);

  /// Conversion vers l'entité domain
  Product toEntity() {
    return Product(
      id: id,
      name: name,
      description: description,
      priceInCents: priceInCents,
      imageUrl: imageUrl,
      category: category,
      stock: stock,
      createdAt: createdAt,
    );
  }

  /// Création depuis l'entité domain
  factory ProductModel.fromEntity(Product product) {
    return ProductModel(
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      createdAt: product.createdAt,
    );
  }
}
```

**Gestion des valeurs nullables de l'API** :

```dart
// Cas où l'API peut renvoyer null
@freezed
class ProductModel with _$ProductModel {
  const ProductModel._();

  const factory ProductModel({
    required String id,
    required String name,
    String? description, // Nullable dans API
    @JsonKey(name: 'price_cents') required int priceInCents,
    @JsonKey(name: 'image_url') String? imageUrl, // Nullable dans API
    required String category,
    @Default(0) int stock, // Valeur par défaut
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);

  Product toEntity() {
    return Product(
      id: id,
      name: name,
      description: description ?? '', // Valeur par défaut pour entity
      priceInCents: priceInCents,
      imageUrl: imageUrl ?? 'assets/images/placeholder.png',
      category: category,
      stock: stock,
      createdAt: createdAt,
    );
  }
}
```

### 2. Data Sources

**Rôle** : Accès direct aux sources de données (API, BDD locale, cache).

**Types** :
- `RemoteDataSource` : API REST, GraphQL, etc.
- `LocalDataSource` : SQLite, Hive, SharedPreferences, etc.

#### Remote Data Source (API)

```dart
// lib/features/products/data/datasources/product_remote_datasource.dart

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/product_model.dart';

part 'product_remote_datasource.g.dart';

/// Source de données distante pour les produits (API).
@RestApi()
abstract class ProductRemoteDataSource {
  factory ProductRemoteDataSource(Dio dio, {String baseUrl}) =
      _ProductRemoteDataSource;

  /// Récupère la liste paginée des produits
  @GET('/products')
  Future<List<ProductModel>> getProducts({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  /// Récupère un produit par ID
  @GET('/products/{id}')
  Future<ProductModel> getProductById(@Path('id') String id);

  /// Recherche de produits
  @GET('/products/search')
  Future<List<ProductModel>> searchProducts({
    @Query('q') required String query,
    @Query('category') String? category,
  });

  /// Récupère produits par catégorie
  @GET('/products/category/{category}')
  Future<List<ProductModel>> getProductsByCategory(
    @Path('category') String category, {
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });
}
```

**Alternative sans Retrofit (Dio pur)** :

```dart
// lib/features/products/data/datasources/product_remote_datasource.dart

import 'package:dio/dio.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/product_model.dart';

/// Interface pour la source de données distante
abstract class ProductRemoteDataSource {
  Future<List<ProductModel>> getProducts({int page = 1, int limit = 20});
  Future<ProductModel> getProductById(String id);
  Future<List<ProductModel>> searchProducts({
    required String query,
    String? category,
  });
}

/// Implémentation avec Dio
class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final Dio dio;

  ProductRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<ProductModel>> getProducts({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await dio.get(
        '/products',
        queryParameters: {'page': page, 'limit': limit},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.map((json) => ProductModel.fromJson(json)).toList();
      } else {
        throw ServerException('Failed to load products');
      }
    } on DioException catch (e) {
      throw ServerException(_handleDioError(e));
    } catch (e) {
      throw ServerException('Unexpected error: $e');
    }
  }

  @override
  Future<ProductModel> getProductById(String id) async {
    try {
      final response = await dio.get('/products/$id');

      if (response.statusCode == 200) {
        return ProductModel.fromJson(response.data);
      } else {
        throw ServerException('Product not found');
      }
    } on DioException catch (e) {
      throw ServerException(_handleDioError(e));
    }
  }

  @override
  Future<List<ProductModel>> searchProducts({
    required String query,
    String? category,
  }) async {
    try {
      final response = await dio.get(
        '/products/search',
        queryParameters: {
          'q': query,
          if (category != null) 'category': category,
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.map((json) => ProductModel.fromJson(json)).toList();
      } else {
        throw ServerException('Search failed');
      }
    } on DioException catch (e) {
      throw ServerException(_handleDioError(e));
    }
  }

  String _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timeout';
      case DioExceptionType.badResponse:
        return 'Server error: ${e.response?.statusCode}';
      case DioExceptionType.cancel:
        return 'Request cancelled';
      default:
        return 'Network error';
    }
  }
}
```

#### Local Data Source (Cache)

```dart
// lib/features/products/data/datasources/product_local_datasource.dart

import 'package:hive/hive.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/product_model.dart';

/// Interface pour la source de données locale
abstract class ProductLocalDataSource {
  Future<List<ProductModel>> getCachedProducts();
  Future<void> cacheProducts(List<ProductModel> products);
  Future<ProductModel> getCachedProduct(String id);
  Future<void> cacheProduct(ProductModel product);
  Future<void> clearCache();
}

/// Implémentation avec Hive
class ProductLocalDataSourceImpl implements ProductLocalDataSource {
  final Box<ProductModel> productBox;

  ProductLocalDataSourceImpl({required this.productBox});

  @override
  Future<List<ProductModel>> getCachedProducts() async {
    try {
      return productBox.values.toList();
    } catch (e) {
      throw CacheException('Failed to get cached products: $e');
    }
  }

  @override
  Future<void> cacheProducts(List<ProductModel> products) async {
    try {
      // Clear et re-cache
      await productBox.clear();

      final Map<String, ProductModel> productMap = {
        for (var product in products) product.id: product
      };

      await productBox.putAll(productMap);
    } catch (e) {
      throw CacheException('Failed to cache products: $e');
    }
  }

  @override
  Future<ProductModel> getCachedProduct(String id) async {
    try {
      final product = productBox.get(id);

      if (product == null) {
        throw CacheException('Product not found in cache');
      }

      return product;
    } catch (e) {
      throw CacheException('Failed to get cached product: $e');
    }
  }

  @override
  Future<void> cacheProduct(ProductModel product) async {
    try {
      await productBox.put(product.id, product);
    } catch (e) {
      throw CacheException('Failed to cache product: $e');
    }
  }

  @override
  Future<void> clearCache() async {
    try {
      await productBox.clear();
    } catch (e) {
      throw CacheException('Failed to clear cache: $e');
    }
  }
}
```

### 3. Repository Implementation

**Rôle** : Orchestrer les data sources et implémenter l'interface du domain.

**Responsabilités** :
- Choisir entre remote/local selon contexte
- Gérer le cache
- Mapper les exceptions en Failures
- Convertir Models en Entities

```dart
// lib/features/products/data/repositories/product_repository_impl.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/product.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_local_datasource.dart';
import '../datasources/product_remote_datasource.dart';

/// Implémentation du repository produit.
///
/// Orchestre les sources de données remote et local,
/// gère le cache et les stratégies offline-first.
class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;
  final ProductLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  ProductRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  }) async {
    if (await networkInfo.isConnected) {
      // Online : récupérer depuis API et cacher
      try {
        final remoteProducts = await remoteDataSource.getProducts(
          page: page,
          limit: limit,
        );

        // Cache seulement la première page
        if (page == 1) {
          await localDataSource.cacheProducts(remoteProducts);
        }

        // Convertir models en entities
        final products = remoteProducts.map((model) => model.toEntity()).toList();

        return Right(products);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      } catch (e) {
        return Left(ServerFailure('Unexpected error: $e'));
      }
    } else {
      // Offline : récupérer depuis cache
      try {
        final cachedProducts = await localDataSource.getCachedProducts();

        if (cachedProducts.isEmpty) {
          return const Left(
            CacheFailure('No cached data available offline'),
          );
        }

        final products = cachedProducts.map((model) => model.toEntity()).toList();

        return Right(products);
      } on CacheException catch (e) {
        return Left(CacheFailure(e.message));
      }
    }
  }

  @override
  Future<Either<Failure, Product>> getProductById(String id) async {
    if (await networkInfo.isConnected) {
      try {
        final remoteProduct = await remoteDataSource.getProductById(id);

        // Cacher le produit
        await localDataSource.cacheProduct(remoteProduct);

        return Right(remoteProduct.toEntity());
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      }
    } else {
      try {
        final cachedProduct = await localDataSource.getCachedProduct(id);
        return Right(cachedProduct.toEntity());
      } on CacheException catch (e) {
        return Left(CacheFailure(e.message));
      }
    }
  }

  @override
  Future<Either<Failure, List<Product>>> searchProducts({
    required String query,
    String? category,
  }) async {
    // Recherche nécessite connexion
    if (!await networkInfo.isConnected) {
      return const Left(NetworkFailure('No internet connection'));
    }

    try {
      final results = await remoteDataSource.searchProducts(
        query: query,
        category: category,
      );

      final products = results.map((model) => model.toEntity()).toList();

      return Right(products);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, List<Product>>> getProductsByCategory(
    String category, {
    int page = 1,
    int limit = 20,
  }) async {
    if (await networkInfo.isConnected) {
      try {
        final remoteProducts = await remoteDataSource.getProductsByCategory(
          category,
          page: page,
          limit: limit,
        );

        final products = remoteProducts.map((model) => model.toEntity()).toList();

        return Right(products);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      }
    } else {
      // Fallback : filtrer cache local
      try {
        final cachedProducts = await localDataSource.getCachedProducts();

        final filteredProducts = cachedProducts
            .where((p) => p.category == category)
            .map((model) => model.toEntity())
            .toList();

        return Right(filteredProducts);
      } on CacheException catch (e) {
        return Left(CacheFailure(e.message));
      }
    }
  }
}
```

---

## Couche PRESENTATION : Interface Utilisateur

### 1. State Management avec BLoC

**Pattern BLoC (Business Logic Component)** :
- Séparer logique métier de l'UI
- Events → BLoC → States
- Testable facilement

#### Events

```dart
// lib/features/products/presentation/bloc/product_list/product_list_event.dart

import 'package:equatable/equatable.dart';

abstract class ProductListEvent extends Equatable {
  const ProductListEvent();

  @override
  List<Object?> get props => [];
}

/// Demande de chargement des produits
class LoadProducts extends ProductListEvent {
  final int page;

  const LoadProducts({this.page = 1});

  @override
  List<Object?> get props => [page];
}

/// Demande de rafraîchissement (pull-to-refresh)
class RefreshProducts extends ProductListEvent {
  const RefreshProducts();
}

/// Chargement de la page suivante (pagination)
class LoadMoreProducts extends ProductListEvent {
  const LoadMoreProducts();
}

/// Filtrage par catégorie
class FilterByCategory extends ProductListEvent {
  final String category;

  const FilterByCategory(this.category);

  @override
  List<Object?> get props => [category];
}

/// Recherche de produits
class SearchProducts extends ProductListEvent {
  final String query;

  const SearchProducts(this.query);

  @override
  List<Object?> get props => [query];
}
```

#### States

```dart
// lib/features/products/presentation/bloc/product_list/product_list_state.dart

import 'package:equatable/equatable.dart';
import '../../../domain/entities/product.dart';

abstract class ProductListState extends Equatable {
  const ProductListState();

  @override
  List<Object?> get props => [];
}

/// État initial
class ProductListInitial extends ProductListState {}

/// Chargement en cours
class ProductListLoading extends ProductListState {}

/// Produits chargés avec succès
class ProductListLoaded extends ProductListState {
  final List<Product> products;
  final int currentPage;
  final bool hasReachedMax;

  const ProductListLoaded({
    required this.products,
    this.currentPage = 1,
    this.hasReachedMax = false,
  });

  @override
  List<Object?> get props => [products, currentPage, hasReachedMax];

  /// CopyWith pour modifications
  ProductListLoaded copyWith({
    List<Product>? products,
    int? currentPage,
    bool? hasReachedMax,
  }) {
    return ProductListLoaded(
      products: products ?? this.products,
      currentPage: currentPage ?? this.currentPage,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
    );
  }
}

/// Chargement de plus de produits (pagination)
class ProductListLoadingMore extends ProductListState {
  final List<Product> currentProducts;

  const ProductListLoadingMore(this.currentProducts);

  @override
  List<Object?> get props => [currentProducts];
}

/// Erreur lors du chargement
class ProductListError extends ProductListState {
  final String message;

  const ProductListError(this.message);

  @override
  List<Object?> get props => [message];
}
```

#### BLoC

```dart
// lib/features/products/presentation/bloc/product_list/product_list_bloc.dart

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/get_products.dart';
import '../../../domain/usecases/search_products.dart';
import 'product_list_event.dart';
import 'product_list_state.dart';

class ProductListBloc extends Bloc<ProductListEvent, ProductListState> {
  final GetProducts getProducts;
  final SearchProducts searchProductsUseCase;

  ProductListBloc({
    required this.getProducts,
    required this.searchProductsUseCase,
  }) : super(ProductListInitial()) {
    on<LoadProducts>(_onLoadProducts);
    on<RefreshProducts>(_onRefreshProducts);
    on<LoadMoreProducts>(_onLoadMoreProducts);
    on<SearchProducts>(_onSearchProducts);
  }

  Future<void> _onLoadProducts(
    LoadProducts event,
    Emitter<ProductListState> emit,
  ) async {
    emit(ProductListLoading());

    final result = await getProducts(page: event.page, limit: 20);

    result.fold(
      (failure) => emit(ProductListError(failure.message)),
      (products) => emit(ProductListLoaded(
        products: products,
        currentPage: event.page,
        hasReachedMax: products.length < 20,
      )),
    );
  }

  Future<void> _onRefreshProducts(
    RefreshProducts event,
    Emitter<ProductListState> emit,
  ) async {
    // Recharger la première page
    final result = await getProducts(page: 1, limit: 20);

    result.fold(
      (failure) => emit(ProductListError(failure.message)),
      (products) => emit(ProductListLoaded(
        products: products,
        currentPage: 1,
        hasReachedMax: products.length < 20,
      )),
    );
  }

  Future<void> _onLoadMoreProducts(
    LoadMoreProducts event,
    Emitter<ProductListState> emit,
  ) async {
    final currentState = state;

    if (currentState is ProductListLoaded && !currentState.hasReachedMax) {
      // Indiquer qu'on charge plus
      emit(ProductListLoadingMore(currentState.products));

      final nextPage = currentState.currentPage + 1;
      final result = await getProducts(page: nextPage, limit: 20);

      result.fold(
        (failure) => emit(ProductListError(failure.message)),
        (newProducts) {
          // Fusionner avec produits existants
          final allProducts = List.of(currentState.products)
            ..addAll(newProducts);

          emit(ProductListLoaded(
            products: allProducts,
            currentPage: nextPage,
            hasReachedMax: newProducts.length < 20,
          ));
        },
      );
    }
  }

  Future<void> _onSearchProducts(
    SearchProducts event,
    Emitter<ProductListState> emit,
  ) async {
    emit(ProductListLoading());

    final result = await searchProductsUseCase(
      SearchProductsParams(query: event.query),
    );

    result.fold(
      (failure) => emit(ProductListError(failure.message)),
      (products) => emit(ProductListLoaded(
        products: products,
        currentPage: 1,
        hasReachedMax: true, // Pas de pagination pour recherche
      )),
    );
  }
}
```

### 2. Pages (Screens)

```dart
// lib/features/products/presentation/pages/product_list_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../dependency_injection.dart';
import '../bloc/product_list/product_list_bloc.dart';
import '../bloc/product_list/product_list_event.dart';
import '../bloc/product_list/product_list_state.dart';
import '../widgets/product_grid.dart';
import '../widgets/product_search_bar.dart';

class ProductListPage extends StatelessWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      // Créer le BLoC via DI
      create: (_) => getIt<ProductListBloc>()..add(const LoadProducts()),
      child: const ProductListView(),
    );
  }
}

class ProductListView extends StatefulWidget {
  const ProductListView({super.key});

  @override
  State<ProductListView> createState() => _ProductListViewState();
}

class _ProductListViewState extends State<ProductListView> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom) {
      context.read<ProductListBloc>().add(const LoadMoreProducts());
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: ProductSearchBar(
            onSearch: (query) {
              context.read<ProductListBloc>().add(SearchProducts(query));
            },
          ),
        ),
      ),
      body: BlocBuilder<ProductListBloc, ProductListState>(
        builder: (context, state) {
          if (state is ProductListLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is ProductListError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(state.message),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.read<ProductListBloc>().add(const LoadProducts());
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (state is ProductListLoaded || state is ProductListLoadingMore) {
            final products = state is ProductListLoaded
                ? state.products
                : (state as ProductListLoadingMore).currentProducts;

            return RefreshIndicator(
              onRefresh: () async {
                context.read<ProductListBloc>().add(const RefreshProducts());
                // Attendre la fin du refresh
                await context
                    .read<ProductListBloc>()
                    .stream
                    .firstWhere((s) => s is! ProductListLoading);
              },
              child: Column(
                children: [
                  Expanded(
                    child: ProductGrid(
                      products: products,
                      scrollController: _scrollController,
                    ),
                  ),
                  if (state is ProductListLoadingMore)
                    const Padding(
                      padding: EdgeInsets.all(8.0),
                      child: CircularProgressIndicator(),
                    ),
                ],
              ),
            );
          }

          return const Center(child: Text('No products'));
        },
      ),
    );
  }
}
```

### 3. Widgets réutilisables

```dart
// lib/features/products/presentation/widgets/product_card.dart

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../domain/entities/product.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
  });

  final Product product;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              child: Hero(
                tag: 'product-${product.id}',
                child: CachedNetworkImage(
                  imageUrl: product.imageUrl,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  placeholder: (context, url) => const Center(
                    child: CircularProgressIndicator(),
                  ),
                  errorWidget: (context, url, error) => const Icon(Icons.error),
                ),
              ),
            ),

            // Info
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: Theme.of(context).textTheme.titleMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.formattedPrice,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  if (product.isLowStock) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade100,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Only ${product.stock} left',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.orange.shade900,
                        ),
                      ),
                    ),
                  ],
                  if (!product.isInStock) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.red.shade100,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Out of stock',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.red.shade900,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Dependency Injection avec get_it

```dart
// lib/dependency_injection.dart

import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:hive/hive.dart';
import 'package:internet_connection_checker/internet_connection_checker.dart';

import 'core/network/api_client.dart';
import 'core/network/network_info.dart';
import 'features/products/data/datasources/product_local_datasource.dart';
import 'features/products/data/datasources/product_remote_datasource.dart';
import 'features/products/data/models/product_model.dart';
import 'features/products/data/repositories/product_repository_impl.dart';
import 'features/products/domain/repositories/product_repository.dart';
import 'features/products/domain/usecases/get_products.dart';
import 'features/products/domain/usecases/search_products.dart';
import 'features/products/presentation/bloc/product_list/product_list_bloc.dart';

final getIt = GetIt.instance;

/// Configure toutes les dépendances
Future<void> configureDependencies() async {
  // ===== CORE =====

  // Network
  getIt.registerLazySingleton<Dio>(() => createDio());
  getIt.registerLazySingleton<InternetConnectionChecker>(
    () => InternetConnectionChecker(),
  );
  getIt.registerLazySingleton<NetworkInfo>(
    () => NetworkInfoImpl(getIt()),
  );

  // ===== PRODUCTS FEATURE =====

  // Data Sources
  final productBox = await Hive.openBox<ProductModel>('products');

  getIt.registerLazySingleton<ProductLocalDataSource>(
    () => ProductLocalDataSourceImpl(productBox: productBox),
  );

  getIt.registerLazySingleton<ProductRemoteDataSource>(
    () => ProductRemoteDataSource(getIt<Dio>()),
  );

  // Repository
  getIt.registerLazySingleton<ProductRepository>(
    () => ProductRepositoryImpl(
      remoteDataSource: getIt(),
      localDataSource: getIt(),
      networkInfo: getIt(),
    ),
  );

  // Use Cases
  getIt.registerLazySingleton(() => GetProducts(getIt()));
  getIt.registerLazySingleton(() => SearchProducts(getIt()));

  // BLoC
  getIt.registerFactory(
    () => ProductListBloc(
      getProducts: getIt(),
      searchProductsUseCase: getIt(),
    ),
  );
}

Dio createDio() {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'https://api.example.com/v1',
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  // Interceptors
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
  ));

  return dio;
}
```

**Alternative avec injectable** (génération automatique) :

```dart
// pubspec.yaml
dependencies:
  get_it: ^7.6.4
  injectable: ^2.3.2

dev_dependencies:
  injectable_generator: ^2.4.1
  build_runner: ^2.4.7

// lib/dependency_injection.dart
import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';

import 'dependency_injection.config.dart';

final getIt = GetIt.instance;

@InjectableInit()
Future<void> configureDependencies() async => getIt.init();

// Dans vos classes :
@lazySingleton
class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;
  final ProductLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  ProductRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  // ... implementation
}
```

---

## Récapitulatif des Responsabilités

```
┌─────────────────────────────────────────────────────────┐
│ PRESENTATION                                            │
├─────────────────────────────────────────────────────────┤
│ - Afficher l'UI                                         │
│ - Gérer les interactions utilisateur                   │
│ - Dispatcher des events au BLoC                        │
│ - Observer les states et rebuild l'UI                  │
│ - Navigation                                            │
│                                                         │
│ NE DOIT PAS :                                           │
│ - Contenir de la logique métier                        │
│ - Accéder directement aux data sources                 │
│ - Faire des appels HTTP                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DOMAIN                                                  │
├─────────────────────────────────────────────────────────┤
│ - Définir les entités métier                           │
│ - Encapsuler la logique métier dans les use cases     │
│ - Définir les contrats (interfaces)                    │
│ - Validations métier                                    │
│                                                         │
│ NE DOIT PAS :                                           │
│ - Dépendre de Flutter/Dart:ui                          │
│ - Connaître l'implémentation des repositories          │
│ - Gérer la sérialization JSON                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DATA                                                    │
├─────────────────────────────────────────────────────────┤
│ - Implémenter les repositories                         │
│ - Gérer les sources de données (API, BDD, Cache)      │
│ - Mapper les données (JSON ↔ Models ↔ Entities)       │
│ - Gérer le cache et la synchronisation                 │
│ - Transformer les exceptions en Failures               │
│                                                         │
│ NE DOIT PAS :                                           │
│ - Contenir de la logique métier                        │
│ - Connaître la couche présentation                     │
└─────────────────────────────────────────────────────────┘
```

---

*Cette architecture assure une séparation claire des responsabilités, facilite les tests, et permet une évolution progressive du code.*
