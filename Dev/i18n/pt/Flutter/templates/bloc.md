# Template de BLoC

## Event

```dart
import 'package:equatable/equatable.dart';

abstract class MyEvent extends Equatable {
  const MyEvent();

  @override
  List<Object?> get props => [];
}

class LoadData extends MyEvent {
  const LoadData();
}

class UpdateItem extends MyEvent {
  final String id;
  final String newValue;

  const UpdateItem({required this.id, required this.newValue});

  @override
  List<Object?> get props => [id, newValue];
}

class DeleteItem extends MyEvent {
  final String id;

  const DeleteItem(this.id);

  @override
  List<Object?> get props => [id];
}
```

## State

```dart
import 'package:equatable/equatable.dart';

abstract class MyState extends Equatable {
  const MyState();

  @override
  List<Object?> get props => [];
}

class MyInitial extends MyState {}

class MyLoading extends MyState {}

class MyLoaded extends MyState {
  final List<Item> items;

  const MyLoaded(this.items);

  @override
  List<Object?> get props => [items];
}

class MyError extends MyState {
  final String message;

  const MyError(this.message);

  @override
  List<Object?> get props => [message];
}
```

## BLoC

```dart
import 'package:flutter_bloc/flutter_bloc.dart';

class MyBloc extends Bloc<MyEvent, MyState> {
  final MyUseCase _useCase;

  MyBloc({required MyUseCase useCase})
      : _useCase = useCase,
        super(MyInitial()) {
    on<LoadData>(_onLoadData);
    on<UpdateItem>(_onUpdateItem);
    on<DeleteItem>(_onDeleteItem);
  }

  Future<void> _onLoadData(
    LoadData event,
    Emitter<MyState> emit,
  ) async {
    emit(MyLoading());

    final result = await _useCase.getData();

    result.fold(
      (failure) => emit(MyError(failure.message)),
      (items) => emit(MyLoaded(items)),
    );
  }

  Future<void> _onUpdateItem(
    UpdateItem event,
    Emitter<MyState> emit,
  ) async {
    // Implementação
  }

  Future<void> _onDeleteItem(
    DeleteItem event,
    Emitter<MyState> emit,
  ) async {
    // Implementação
  }
}
```
