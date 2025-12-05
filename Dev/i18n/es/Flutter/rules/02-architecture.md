# Arquitectura Flutter - Clean Architecture y Mejores Prácticas

## Principio Central

La arquitectura Flutter debe seguir los principios de **Clean Architecture** popularizados por Robert C. Martin (Uncle Bob), adaptados al contexto de Flutter/Dart.

**Objetivos**:
- Separación de Responsabilidades
- Testabilidad máxima
- Independencia del framework
- Independencia de la UI
- Independencia de la base de datos
- Mantenibilidad y escalabilidad

---

## Vista General: Clean Architecture

### Las 3 Capas Principales

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION                          │
│  (UI, Gestión de Estado, Navegación)                   │
│                                                         │
│  - Páginas (Screens)                                   │
│  - Widgets                                              │
│  - BLoC / Riverpod / Provider                          │
│  - View Models                                          │
│                                                         │
│  Depende de: DOMAIN                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                             │
│  (Lógica de Negocio, Entidades, Casos de Uso)         │
│                                                         │
│  - Entidades (modelos de negocio puros)               │
│  - Casos de Uso (lógica de negocio)                   │
│  - Interfaces de Repository                            │
│                                                         │
│  Depende de NADA (capa más pura)                      │
└─────────────────────────────────────────────────────────┘
                         ↑
┌─────────────────────────────────────────────────────────┐
│                       DATA                              │
│  (Fuentes de Datos, Repositories, Models)              │
│                                                         │
│  - Models (serialización)                              │
│  - Data Sources (Remote, Local)                        │
│  - Implementaciones de Repository                      │
│                                                         │
│  Depende de: DOMAIN (implementa interfaces)            │
└─────────────────────────────────────────────────────────┘
```

### Regla de Dependencia

**CRUCIAL**: Las dependencias siempre deben apuntar hacia adentro.

```
PRESENTATION → DOMAIN ← DATA
     ↓                    ↑
  Depende de          Depende de
```

---

## Estructura de Carpetas Completa

### Organización Recomendada

```
lib/
├── core/                           # Funcionalidad compartida
│   ├── constants/                  # Constantes globales
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── storage_constants.dart
│   │
│   ├── errors/                     # Manejo de errores
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   │
│   ├── extensions/                 # Extensiones de Dart
│   │   ├── build_context_extension.dart
│   │   ├── date_time_extension.dart
│   │   └── string_extension.dart
│   │
│   ├── network/                    # Configuración de red
│   │   ├── api_client.dart
│   │   ├── network_info.dart
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart
│   │       └── logging_interceptor.dart
│   │
│   ├── theme/                      # Tema de la app
│   │   ├── app_theme.dart
│   │   ├── colors.dart
│   │   ├── text_styles.dart
│   │   └── dimensions.dart
│   │
│   ├── utils/                      # Utilidades
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   └── helpers.dart
│   │
│   └── widgets/                    # Widgets reutilizables
│       ├── app_button.dart
│       ├── app_text_field.dart
│       ├── loading_indicator.dart
│       └── error_widget.dart
│
├── features/                       # Funcionalidades de negocio
│   │
│   ├── authentication/             # Feature: Autenticación
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
│   ├── products/                   # Feature: Productos
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
│   └── [other_features]/          # Otras funcionalidades...
│
├── config/                         # Configuración
│   ├── routes/
│   │   ├── app_router.dart
│   │   └── route_names.dart
│   └── env/
│       ├── env.dart
│       └── env_config.dart
│
├── dependency_injection.dart       # Configuración de DI (get_it/injectable)
└── main.dart                       # Punto de entrada
```

---

## Capa DOMAIN: El Núcleo del Negocio

### 1. Entidades

**Rol**: Objetos de negocio puros, sin lógica de persistencia o presentación.

**Características**:
- Inmutables (preferir `@immutable` o `@freezed`)
- Sin dependencias externas
- Sin anotaciones JSON
- Igualdad basada en contenido (usar `Equatable`)

```dart
// lib/features/products/domain/entities/product.dart

import 'package:equatable/equatable.dart';

/// Representa un producto en el dominio de negocio.
///
/// Esta clase es una entidad pura sin dependencias externas.
class Product extends Equatable {
  /// Identificador único del producto
  final String id;

  /// Nombre del producto
  final String name;

  /// Descripción detallada
  final String description;

  /// Precio en centavos (evita problemas de float)
  final int priceInCents;

  /// URL de la imagen principal
  final String imageUrl;

  /// Categoría del producto
  final String category;

  /// Stock disponible
  final int stock;

  /// Fecha de creación
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

  /// Retorna el precio formateado en euros
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  /// Indica si el producto está en stock
  bool get isInStock => stock > 0;

  /// Indica si el stock es bajo (< 10)
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

**Alternativa con Freezed** (recomendado para menos boilerplate):

```dart
// lib/features/products/domain/entities/product.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';

@freezed
class Product with _$Product {
  const Product._(); // Constructor privado para métodos personalizados

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

  // Getters personalizados
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  bool get isInStock => stock > 0;
  bool get isLowStock => stock > 0 && stock < 10;
}
```

### 2. Interfaces de Repository

**Rol**: Contratos que definen cómo acceder a los datos, sin implementación.

**Características**:
- Clase abstracta o interfaz pura
- Retornar `Either<Failure, Success>` (con dartz) o `Result<T>`
- Async con `Future`
- Nomenclatura: `[Entity]Repository`

```dart
// lib/features/products/domain/repositories/product_repository.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';

/// Interfaz para acceder a los datos de productos.
///
/// Esta interfaz define el contrato que cualquier
/// implementación concreta del repositorio de productos debe respetar.
abstract class ProductRepository {
  /// Recupera la lista de todos los productos.
  ///
  /// Retorna [Right<List<Product>>] en caso de éxito,
  /// o [Left<Failure>] en caso de error.
  Future<Either<Failure, List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  /// Recupera un producto por su ID.
  ///
  /// Retorna [Right<Product>] si el producto existe,
  /// o [Left<Failure>] si no se encuentra o hay error.
  Future<Either<Failure, Product>> getProductById(String id);

  /// Busca productos por nombre o descripción.
  ///
  /// [query]: Término de búsqueda
  /// [category]: Filtro opcional de categoría
  Future<Either<Failure, List<Product>>> searchProducts({
    required String query,
    String? category,
  });

  /// Recupera productos de una categoría específica.
  Future<Either<Failure, List<Product>>> getProductsByCategory(
    String category, {
    int page = 1,
    int limit = 20,
  });
}
```

**Alternativa con Result<T>** (sin dartz):

```dart
// lib/core/utils/result.dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String error) = Failure<T>;
}

// Uso en repository
abstract class ProductRepository {
  Future<Result<List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  Future<Result<Product>> getProductById(String id);
}
```

### 3. Casos de Uso

**Rol**: Encapsular lógica de negocio para una acción específica.

**Principio**: Un Caso de Uso = Una acción de negocio

**Características**:
- Único método público: `call()`
- Toma repository vía inyección de dependencias
- Contiene validaciones y reglas de negocio
- Nomenclatura: Verbo en infinitivo (GetProducts, CreateOrder, etc.)

```dart
// lib/features/products/domain/usecases/get_products.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';
import '../repositories/product_repository.dart';

/// Recupera la lista paginada de productos.
///
/// Este caso de uso maneja la lógica de negocio para recuperar productos,
/// incluyendo validación de parámetros.
class GetProducts {
  final ProductRepository repository;

  GetProducts(this.repository);

  /// Ejecuta el caso de uso.
  ///
  /// [page]: Número de página (comienza en 1)
  /// [limit]: Número de elementos por página (máx 100)
  ///
  /// Retorna [Right<List<Product>>] en caso de éxito,
  /// o [Left<Failure>] en caso de error.
  Future<Either<Failure, List<Product>>> call({
    int page = 1,
    int limit = 20,
  }) async {
    // Validación de parámetros de negocio
    if (page < 1) {
      return const Left(ValidationFailure('La página debe ser >= 1'));
    }

    if (limit < 1 || limit > 100) {
      return const Left(ValidationFailure('El límite debe estar entre 1 y 100'));
    }

    // Delegación al repositorio
    return await repository.getProducts(page: page, limit: limit);
  }
}
```

---

*Esta arquitectura asegura una clara separación de responsabilidades, facilita las pruebas y permite la evolución progresiva del código.*
