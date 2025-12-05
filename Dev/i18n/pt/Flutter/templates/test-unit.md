# Template de Teste Unitário

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dartz/dartz.dart';
import 'package:myapp/core/errors/failures.dart';
import 'package:myapp/features/my_feature/domain/entities/my_entity.dart';
import 'package:myapp/features/my_feature/domain/repositories/my_repository.dart';
import 'package:myapp/features/my_feature/domain/usecases/my_usecase.dart';

class MockMyRepository extends Mock implements MyRepository {}

void main() {
  late MyUseCase useCase;
  late MockMyRepository mockRepository;

  setUp(() {
    mockRepository = MockMyRepository();
    useCase = MyUseCase(mockRepository);
  });

  group('MyUseCase', () {
    const testEntity = MyEntity(id: '123', name: 'Test');

    test('should return entity when repository succeeds', () async {
      // Arrange
      when(() => mockRepository.getById('123'))
          .thenAnswer((_) async => const Right(testEntity));

      // Act
      final result = await useCase('123');

      // Assert
      expect(result, const Right(testEntity));
      verify(() => mockRepository.getById('123')).called(1);
      verifyNoMoreInteractions(mockRepository);
    });

    test('should return failure when repository fails', () async {
      // Arrange
      when(() => mockRepository.getById('123'))
          .thenAnswer((_) async => const Left(ServerFailure('Error')));

      // Act
      final result = await useCase('123');

      // Assert
      expect(result, const Left(ServerFailure('Error')));
      verify(() => mockRepository.getById('123')).called(1);
    });

    test('should return validation failure for empty id', () async {
      // Act
      final result = await useCase('');

      // Assert
      expect(result, isA<Left>());
      result.fold(
        (failure) => expect(failure, isA<ValidationFailure>()),
        (_) => fail('Should return failure'),
      );
      verifyNever(() => mockRepository.getById(any()));
    });
  });
}
```
