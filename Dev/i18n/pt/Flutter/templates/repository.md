# Template de Repository

## Interface (Camada Domain)

```dart
import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/my_entity.dart';

abstract class MyRepository {
  Future<Either<Failure, List<MyEntity>>> getAll();
  Future<Either<Failure, MyEntity>> getById(String id);
  Future<Either<Failure, void>> create(MyEntity entity);
  Future<Either<Failure, void>> update(MyEntity entity);
  Future<Either<Failure, void>> delete(String id);
}
```

## Implementação (Camada Data)

```dart
import 'package:dartz/dartz.dart';
import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/my_entity.dart';
import '../../domain/repositories/my_repository.dart';
import '../datasources/my_local_datasource.dart';
import '../datasources/my_remote_datasource.dart';

class MyRepositoryImpl implements MyRepository {
  final MyRemoteDataSource remoteDataSource;
  final MyLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  MyRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, List<MyEntity>>> getAll() async {
    if (await networkInfo.isConnected) {
      try {
        final models = await remoteDataSource.getAll();
        await localDataSource.cacheAll(models);
        return Right(models.map((m) => m.toEntity()).toList());
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      }
    } else {
      try {
        final cached = await localDataSource.getCached();
        return Right(cached.map((m) => m.toEntity()).toList());
      } on CacheException catch (e) {
        return Left(CacheFailure(e.message));
      }
    }
  }

  @override
  Future<Either<Failure, MyEntity>> getById(String id) async {
    if (await networkInfo.isConnected) {
      try {
        final model = await remoteDataSource.getById(id);
        await localDataSource.cache(model);
        return Right(model.toEntity());
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      }
    } else {
      try {
        final cached = await localDataSource.getById(id);
        return Right(cached.toEntity());
      } on CacheException catch (e) {
        return Left(CacheFailure(e.message));
      }
    }
  }

  @override
  Future<Either<Failure, void>> create(MyEntity entity) async {
    try {
      await remoteDataSource.create(MyModel.fromEntity(entity));
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, void>> update(MyEntity entity) async {
    try {
      await remoteDataSource.update(MyModel.fromEntity(entity));
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      await remoteDataSource.delete(id);
      await localDataSource.delete(id);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }
}
```
