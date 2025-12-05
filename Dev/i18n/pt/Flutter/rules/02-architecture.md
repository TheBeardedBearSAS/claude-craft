# Arquitetura Flutter - Clean Architecture & Melhores Práticas

## Princípio Central

A arquitetura Flutter deve seguir os princípios de **Clean Architecture** popularizados por Robert C. Martin (Uncle Bob), adaptados ao contexto Flutter/Dart.

**Objetivos**:
- Separação de Responsabilidades
- Máxima testabilidade
- Independência de framework
- Independência de UI
- Independência de banco de dados
- Manutenibilidade e escalabilidade

---

## Visão Geral: Clean Architecture

### As 3 Camadas Principais

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION                          │
│  (UI, Gerenciamento de Estado, Navegação)              │
│                                                         │
│  - Pages (Telas)                                        │
│  - Widgets                                              │
│  - BLoC / Riverpod / Provider                          │
│  - View Models                                          │
│                                                         │
│  Depende de: DOMAIN                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                             │
│  (Lógica de Negócio, Entidades, Casos de Uso)          │
│                                                         │
│  - Entities (modelos puros de negócio)                 │
│  - Use Cases (lógica de negócio)                       │
│  - Interfaces de Repository                            │
│                                                         │
│  Depende de NADA (camada mais pura)                    │
└─────────────────────────────────────────────────────────┘
                         ↑
┌─────────────────────────────────────────────────────────┐
│                       DATA                              │
│  (Fontes de Dados, Repositories, Models)               │
│                                                         │
│  - Models (serialização)                               │
│  - Data Sources (Remote, Local)                        │
│  - Implementações de Repository                        │
│                                                         │
│  Depende de: DOMAIN (implementa interfaces)            │
└─────────────────────────────────────────────────────────┘
```

### Regra de Dependência

**CRUCIAL**: As dependências devem sempre apontar para dentro.

```
PRESENTATION → DOMAIN ← DATA
     ↓                    ↑
  Depende de          Depende de
```

---

## Estrutura Completa de Pastas

### Organização Recomendada

```
lib/
├── core/                           # Funcionalidades compartilhadas
│   ├── constants/                  # Constantes globais
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── storage_constants.dart
│   │
│   ├── errors/                     # Tratamento de erros
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   │
│   ├── extensions/                 # Extensões Dart
│   │   ├── build_context_extension.dart
│   │   ├── date_time_extension.dart
│   │   └── string_extension.dart
│   │
│   ├── network/                    # Configuração de rede
│   │   ├── api_client.dart
│   │   ├── network_info.dart
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart
│   │       └── logging_interceptor.dart
│   │
│   ├── theme/                      # Tema do app
│   │   ├── app_theme.dart
│   │   ├── colors.dart
│   │   ├── text_styles.dart
│   │   └── dimensions.dart
│   │
│   ├── utils/                      # Utilitários
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   └── helpers.dart
│   │
│   └── widgets/                    # Widgets reutilizáveis
│       ├── app_button.dart
│       ├── app_text_field.dart
│       ├── loading_indicator.dart
│       └── error_widget.dart
│
├── features/                       # Funcionalidades de negócio
│   │
│   ├── authentication/             # Feature: Autenticação
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
│   ├── products/                   # Feature: Produtos
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
│   └── [other_features]/          # Outras features...
│
├── config/                         # Configuração
│   ├── routes/
│   │   ├── app_router.dart
│   │   └── route_names.dart
│   └── env/
│       ├── env.dart
│       └── env_config.dart
│
├── dependency_injection.dart       # Configuração de DI (get_it/injectable)
└── main.dart                       # Ponto de entrada
```

---

## Camada DOMAIN: O Núcleo do Negócio

### 1. Entities

**Papel**: Objetos puros de negócio, sem lógica de persistência ou apresentação.

**Características**:
- Imutáveis (prefira `@immutable` ou `@freezed`)
- Sem dependências externas
- Sem anotações JSON
- Igualdade baseada em conteúdo (use `Equatable`)

```dart
// lib/features/products/domain/entities/product.dart

import 'package:equatable/equatable.dart';

/// Representa um produto no domínio de negócio.
///
/// Esta classe é uma entidade pura sem dependências externas.
class Product extends Equatable {
  /// Identificador único do produto
  final String id;

  /// Nome do produto
  final String name;

  /// Descrição detalhada
  final String description;

  /// Preço em centavos (evita problemas com float)
  final int priceInCents;

  /// URL da imagem principal
  final String imageUrl;

  /// Categoria do produto
  final String category;

  /// Estoque disponível
  final int stock;

  /// Data de criação
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

  /// Retorna o preço formatado em euros
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  /// Indica se o produto está em estoque
  bool get isInStock => stock > 0;

  /// Indica se o estoque está baixo (< 10)
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

**Alternativa com Freezed** (recomendado para menos boilerplate):

```dart
// lib/features/products/domain/entities/product.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';

@freezed
class Product with _$Product {
  const Product._(); // Construtor privado para métodos customizados

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

  // Getters customizados
  String get formattedPrice {
    final euros = priceInCents / 100;
    return '${euros.toStringAsFixed(2)} €';
  }

  bool get isInStock => stock > 0;
  bool get isLowStock => stock > 0 && stock < 10;
}
```

### 2. Interfaces de Repository

**Papel**: Contratos definindo como acessar dados, sem implementação.

**Características**:
- Classe abstrata ou interface pura
- Retorna `Either<Failure, Success>` (com dartz) ou `Result<T>`
- Assíncrono com `Future`
- Nomenclatura: `[Entity]Repository`

```dart
// lib/features/products/domain/repositories/product_repository.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';

/// Interface para acessar dados de produtos.
///
/// Esta interface define o contrato que qualquer
/// implementação concreta do repositório de produtos deve respeitar.
abstract class ProductRepository {
  /// Recupera a lista de todos os produtos.
  ///
  /// Retorna [Right<List<Product>>] em caso de sucesso,
  /// ou [Left<Failure>] em caso de erro.
  Future<Either<Failure, List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  /// Recupera um produto pelo seu ID.
  ///
  /// Retorna [Right<Product>] se o produto existir,
  /// ou [Left<Failure>] se não encontrado ou erro.
  Future<Either<Failure, Product>> getProductById(String id);

  /// Busca produtos por nome ou descrição.
  ///
  /// [query]: Termo de busca
  /// [category]: Filtro opcional de categoria
  Future<Either<Failure, List<Product>>> searchProducts({
    required String query,
    String? category,
  });

  /// Recupera produtos de uma categoria específica.
  Future<Either<Failure, List<Product>>> getProductsByCategory(
    String category, {
    int page = 1,
    int limit = 20,
  });
}
```

**Alternativa com Result<T>** (sem dartz):

```dart
// lib/core/utils/result.dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String error) = Failure<T>;
}

// Uso no repository
abstract class ProductRepository {
  Future<Result<List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  });

  Future<Result<Product>> getProductById(String id);
}
```

### 3. Use Cases

**Papel**: Encapsular lógica de negócio para uma ação específica.

**Princípio**: Um Use Case = Uma ação de negócio

**Características**:
- Único método público: `call()`
- Recebe repository via injeção de dependência
- Contém validações e regras de negócio
- Nomenclatura: Verbo no infinitivo (GetProducts, CreateOrder, etc.)

```dart
// lib/features/products/domain/usecases/get_products.dart

import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';
import '../repositories/product_repository.dart';

/// Recupera a lista paginada de produtos.
///
/// Este use case gerencia a lógica de negócio para recuperar produtos,
/// incluindo validação de parâmetros.
class GetProducts {
  final ProductRepository repository;

  GetProducts(this.repository);

  /// Executa o use case.
  ///
  /// [page]: Número da página (começa em 1)
  /// [limit]: Número de itens por página (máx 100)
  ///
  /// Retorna [Right<List<Product>>] em caso de sucesso,
  /// ou [Left<Failure>] em caso de erro.
  Future<Either<Failure, List<Product>>> call({
    int page = 1,
    int limit = 20,
  }) async {
    // Validação de parâmetros de negócio
    if (page < 1) {
      return const Left(ValidationFailure('Página deve ser >= 1'));
    }

    if (limit < 1 || limit > 100) {
      return const Left(ValidationFailure('Limite deve estar entre 1 e 100'));
    }

    // Delegação ao repository
    return await repository.getProducts(page: page, limit: limit);
  }
}
```

---

*Esta arquitetura garante separação clara de responsabilidades, facilita testes e permite evolução progressiva do código.*
