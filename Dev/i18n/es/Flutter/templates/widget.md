# Plantillas de Widgets

## Stateless Widget

```dart
import 'package:flutter/material.dart';

/// Widget description
class MyWidget extends StatelessWidget {
  const MyWidget({
    super.key,
    required this.title,
    this.onTap,
  });

  final String title;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text(title),
    );
  }
}
```

## Stateful Widget

```dart
import 'package:flutter/material.dart';

/// Widget description
class MyStatefulWidget extends StatefulWidget {
  const MyStatefulWidget({
    super.key,
    required this.initialValue,
  });

  final int initialValue;

  @override
  State<MyStatefulWidget> createState() => _MyStatefulWidgetState();
}

class _MyStatefulWidgetState extends State<MyStatefulWidget> {
  late int _value;

  @override
  void initState() {
    super.initState();
    _value = widget.initialValue;
  }

  @override
  void dispose() {
    // Clean up
    super.dispose();
  }

  void _increment() {
    setState(() {
      _value++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Value: $_value'),
        ElevatedButton(
          onPressed: _increment,
          child: const Text('Increment'),
        ),
      ],
    );
  }
}
```

## Consumer Widget (BLoC)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class MyBlocWidget extends StatelessWidget {
  const MyBlocWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MyBloc, MyState>(
      builder: (context, state) {
        if (state is MyLoading) {
          return const CircularProgressIndicator();
        }

        if (state is MyError) {
          return Text('Error: ${state.message}');
        }

        if (state is MyLoaded) {
          return ListView.builder(
            itemCount: state.items.length,
            itemBuilder: (context, index) {
              return ListTile(
                title: Text(state.items[index].name),
              );
            },
          );
        }

        return const SizedBox();
      },
    );
  }
}
```
