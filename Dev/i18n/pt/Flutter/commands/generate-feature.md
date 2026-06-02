---
description: Geração de Feature Flutter Completa
argument-hint: [arguments]
---

# Geração de Feature Flutter Completa

Você é um desenvolvedor Flutter sênior. Você deve gerar uma feature completa seguindo a Clean Architecture com BLoC/Riverpod, incluindo todos os arquivos necessários e os testes.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome da feature (ex: `authentication`, `product_catalog`)
- (Opcional) Gerenciamento de estado (bloc, riverpod, cubit)

Exemplo: `/flutter:generate-feature authentication riverpod`

## Plan Mode

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## MISSÃO

### Etapa 1: Estrutura da Feature

```
lib/
└── features/
    └── {feature}/
        ├── data/
        │   ├── datasources/
        │   │   ├── {feature}_local_datasource.dart
        │   │   └── {feature}_remote_datasource.dart
        │   ├── models/
        │   │   └── {feature}_model.dart
        │   └── repositories/
        │       └── {feature}_repository_impl.dart
        ├── domain/
        │   ├── entities/
        │   │   └── {feature}_entity.dart
        │   ├── repositories/
        │   │   └── {feature}_repository.dart
        │   └── usecases/
        │       ├── get_{feature}.dart
        │       └── create_{feature}.dart
        └── presentation/
            ├── bloc/ (ou providers/)
            │   ├── {feature}_bloc.dart
            │   ├── {feature}_event.dart
            │   └── {feature}_state.dart
            ├── pages/
            │   ├── {feature}_page.dart
            │   └── {feature}_detail_page.dart
            └── widgets/
                ├── {feature}_list_item.dart
                └── {feature}_form.dart

test/
└── features/
    └── {feature}/
        ├── data/
        │   └── repositories/
        │       └── {feature}_repository_impl_test.dart
        ├── domain/
        │   └── usecases/
        │       └── get_{feature}_test.dart
        └── presentation/
            ├── bloc/
            │   └── {feature}_bloc_test.dart
            └── pages/
                └── {feature}_page_test.dart
```

### Etapa 2: Camada de Domínio

#### Entidade
```dart
// lib/features/{feature}/domain/entities/{feature}_entity.dart
import 'package:equatable/equatable.dart';

class {Feature}Entity extends Equatable {
  final String id;
  final String name;
  final String? description;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const {Feature}Entity({
    required this.id,
    required this.name,
    this.description,
    required this.createdAt,
    this.updatedAt,
  });

  @override
  List<Object?> get props => [id, name, description, createdAt, updatedAt];

  {Feature}Entity copyWith({
    String? id,
    String? name,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return {Feature}Entity(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
```

#### Interface do Repositório
```dart
// lib/features/{feature}/domain/repositories/{feature}_repository.dart
import 'package:dartz/dartz.dart';
import '../entities/{feature}_entity.dart';
import '../../../../core/error/failures.dart';

abstract class {Feature}Repository {
  Future<Either<Failure, List<{Feature}Entity>>> getAll();
  Future<Either<Failure, {Feature}Entity>> getById(String id);
  Future<Either<Failure, {Feature}Entity>> create({Feature}Entity entity);
  Future<Either<Failure, {Feature}Entity>> update({Feature}Entity entity);
  Future<Either<Failure, void>> delete(String id);
}
```

#### Casos de Uso
```dart
// lib/features/{feature}/domain/usecases/get_{feature}_list.dart
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/{feature}_entity.dart';
import '../repositories/{feature}_repository.dart';

class Get{Feature}List implements UseCase<List<{Feature}Entity>, NoParams> {
  final {Feature}Repository repository;

  Get{Feature}List(this.repository);

  @override
  Future<Either<Failure, List<{Feature}Entity>>> call(NoParams params) {
    return repository.getAll();
  }
}
```

### Etapa 3: Camada de Dados

#### Modelo
```dart
// lib/features/{feature}/data/models/{feature}_model.dart
import '../../domain/entities/{feature}_entity.dart';

class {Feature}Model extends {Feature}Entity {
  const {Feature}Model({
    required super.id,
    required super.name,
    super.description,
    required super.createdAt,
    super.updatedAt,
  });

  factory {Feature}Model.fromJson(Map<String, dynamic> json) {
    return {Feature}Model(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  factory {Feature}Model.fromEntity({Feature}Entity entity) {
    return {Feature}Model(
      id: entity.id,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }
}
```

#### Implementação do Repositório
```dart
// lib/features/{feature}/data/repositories/{feature}_repository_impl.dart
import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/{feature}_entity.dart';
import '../../domain/repositories/{feature}_repository.dart';
import '../datasources/{feature}_local_datasource.dart';
import '../datasources/{feature}_remote_datasource.dart';
import '../models/{feature}_model.dart';

class {Feature}RepositoryImpl implements {Feature}Repository {
  final {Feature}RemoteDataSource remoteDataSource;
  final {Feature}LocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  {Feature}RepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, List<{Feature}Entity>>> getAll() async {
    if (await networkInfo.isConnected) {
      try {
        final remoteData = await remoteDataSource.getAll();
        await localDataSource.cacheAll(remoteData);
        return Right(remoteData);
      } on ServerException {
        return Left(ServerFailure());
      }
    } else {
      try {
        final localData = await localDataSource.getAll();
        return Right(localData);
      } on CacheException {
        return Left(CacheFailure());
      }
    }
  }

  // Outros métodos...
}
```

### Etapa 4: Camada de Apresentação (BLoC)

#### BLoC
```dart
// lib/features/{feature}/presentation/bloc/{feature}_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/{feature}_entity.dart';
import '../../domain/usecases/get_{feature}_list.dart';
import '../../../../core/usecases/usecase.dart';

part '{feature}_event.dart';
part '{feature}_state.dart';

class {Feature}Bloc extends Bloc<{Feature}Event, {Feature}State> {
  final Get{Feature}List get{Feature}List;

  {Feature}Bloc({required this.get{Feature}List}) : super(const {Feature}Initial()) {
    on<Load{Feature}List>(_onLoad{Feature}List);
    on<Refresh{Feature}List>(_onRefresh{Feature}List);
  }

  Future<void> _onLoad{Feature}List(
    Load{Feature}List event,
    Emitter<{Feature}State> emit,
  ) async {
    emit(const {Feature}Loading());

    final result = await get{Feature}List(NoParams());

    result.fold(
      (failure) => emit({Feature}Error(message: failure.message)),
      (data) => emit({Feature}Loaded(items: data)),
    );
  }

  Future<void> _onRefresh{Feature}List(
    Refresh{Feature}List event,
    Emitter<{Feature}State> emit,
  ) async {
    final result = await get{Feature}List(NoParams());

    result.fold(
      (failure) => emit({Feature}Error(message: failure.message)),
      (data) => emit({Feature}Loaded(items: data)),
    );
  }
}
```

#### Eventos
```dart
// lib/features/{feature}/presentation/bloc/{feature}_event.dart
part of '{feature}_bloc.dart';

abstract class {Feature}Event extends Equatable {
  const {Feature}Event();

  @override
  List<Object> get props => [];
}

class Load{Feature}List extends {Feature}Event {
  const Load{Feature}List();
}

class Refresh{Feature}List extends {Feature}Event {
  const Refresh{Feature}List();
}
```

#### Estados
```dart
// lib/features/{feature}/presentation/bloc/{feature}_state.dart
part of '{feature}_bloc.dart';

abstract class {Feature}State extends Equatable {
  const {Feature}State();

  @override
  List<Object?> get props => [];
}

class {Feature}Initial extends {Feature}State {
  const {Feature}Initial();
}

class {Feature}Loading extends {Feature}State {
  const {Feature}Loading();
}

class {Feature}Loaded extends {Feature}State {
  final List<{Feature}Entity> items;

  const {Feature}Loaded({required this.items});

  @override
  List<Object?> get props => [items];
}

class {Feature}Error extends {Feature}State {
  final String message;

  const {Feature}Error({required this.message});

  @override
  List<Object?> get props => [message];
}
```

### Etapa 5: Página

```dart
// lib/features/{feature}/presentation/pages/{feature}_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/{feature}_bloc.dart';
import '../widgets/{feature}_list_item.dart';

class {Feature}Page extends StatelessWidget {
  const {Feature}Page({super.key});

  static const routeName = '/{feature}';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('{Feature}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<{Feature}Bloc>().add(const Refresh{Feature}List());
            },
          ),
        ],
      ),
      body: BlocBuilder<{Feature}Bloc, {Feature}State>(
        builder: (context, state) {
          return switch (state) {
            {Feature}Initial() => const Center(
                child: Text('Pressione refresh'),
              ),
            {Feature}Loading() => const Center(
                child: CircularProgressIndicator(),
              ),
            {Feature}Loaded(:final items) => items.isEmpty
                ? const Center(child: Text('Nenhum item'))
                : RefreshIndicator(
                    onRefresh: () async {
                      context
                          .read<{Feature}Bloc>()
                          .add(const Refresh{Feature}List());
                    },
                    child: ListView.builder(
                      itemCount: items.length,
                      itemBuilder: (context, index) {
                        return {Feature}ListItem(item: items[index]);
                      },
                    ),
                  ),
            {Feature}Error(:final message) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Erro: $message'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        context
                            .read<{Feature}Bloc>()
                            .add(const Load{Feature}List());
                      },
                      child: const Text('Tentar novamente'),
                    ),
                  ],
                ),
              ),
          };
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navegação para criação
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

### Etapa 6: Testes

```dart
// test/features/{feature}/presentation/bloc/{feature}_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockGet{Feature}List extends Mock implements Get{Feature}List {}

void main() {
  late {Feature}Bloc bloc;
  late MockGet{Feature}List mockGet{Feature}List;

  setUp(() {
    mockGet{Feature}List = MockGet{Feature}List();
    bloc = {Feature}Bloc(get{Feature}List: mockGet{Feature}List);
  });

  tearDown(() {
    bloc.close();
  });

  test('initial state should be {Feature}Initial', () {
    expect(bloc.state, const {Feature}Initial());
  });

  blocTest<{Feature}Bloc, {Feature}State>(
    'emits [Loading, Loaded] when Load{Feature}List is added successfully',
    build: () {
      when(() => mockGet{Feature}List(any()))
          .thenAnswer((_) async => const Right([]));
      return bloc;
    },
    act: (bloc) => bloc.add(const Load{Feature}List()),
    expect: () => [
      const {Feature}Loading(),
      const {Feature}Loaded(items: []),
    ],
  );

  blocTest<{Feature}Bloc, {Feature}State>(
    'emits [Loading, Error] when Load{Feature}List fails',
    build: () {
      when(() => mockGet{Feature}List(any()))
          .thenAnswer((_) async => Left(ServerFailure()));
      return bloc;
    },
    act: (bloc) => bloc.add(const Load{Feature}List()),
    expect: () => [
      const {Feature}Loading(),
      isA<{Feature}Error>(),
    ],
  );
}
```

### Etapa 7: Resumo

```
══════════════════════════════════════════════════════════════
✅ FEATURE GERADA - {feature}
══════════════════════════════════════════════════════════════

📁 Arquivos criados:

Camada de Domínio (4 arquivos):
- lib/features/{feature}/domain/entities/{feature}_entity.dart
- lib/features/{feature}/domain/repositories/{feature}_repository.dart
- lib/features/{feature}/domain/usecases/get_{feature}_list.dart
- lib/features/{feature}/domain/usecases/create_{feature}.dart

Camada de Dados (4 arquivos):
- lib/features/{feature}/data/models/{feature}_model.dart
- lib/features/{feature}/data/repositories/{feature}_repository_impl.dart
- lib/features/{feature}/data/datasources/{feature}_remote_datasource.dart
- lib/features/{feature}/data/datasources/{feature}_local_datasource.dart

Camada de Apresentação (6 arquivos):
- lib/features/{feature}/presentation/bloc/{feature}_bloc.dart
- lib/features/{feature}/presentation/bloc/{feature}_event.dart
- lib/features/{feature}/presentation/bloc/{feature}_state.dart
- lib/features/{feature}/presentation/pages/{feature}_page.dart
- lib/features/{feature}/presentation/widgets/{feature}_list_item.dart
- lib/features/{feature}/presentation/widgets/{feature}_form.dart

Testes (4 arquivos):
- test/features/{feature}/domain/usecases/get_{feature}_list_test.dart
- test/features/{feature}/data/repositories/{feature}_repository_impl_test.dart
- test/features/{feature}/presentation/bloc/{feature}_bloc_test.dart
- test/features/{feature}/presentation/pages/{feature}_page_test.dart

🔧 Próximas etapas:
1. Configurar a injeção de dependências (get_it/riverpod)
2. Adicionar as rotas
3. Implementar os datasources
4. Executar os testes: flutter test
```
