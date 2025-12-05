# Plantilla de Test de Widget

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:myapp/features/my_feature/presentation/widgets/my_widget.dart';

void main() {
  group('MyWidget', () {
    testWidgets('should display expected UI', (tester) async {
      // Arrange
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: MyWidget(title: 'Test'),
          ),
        ),
      );

      // Assert
      expect(find.text('Test'), findsOneWidget);
      expect(find.byType(MyWidget), findsOneWidget);
    });

    testWidgets('should call callback when tapped', (tester) async {
      // Arrange
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: MyWidget(
              title: 'Test',
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      // Act
      await tester.tap(find.byType(MyWidget));
      await tester.pump();

      // Assert
      expect(tapped, isTrue);
    });

    testWidgets('should update when property changes', (tester) async {
      // Arrange
      await tester.pumpWidget(
        const MaterialApp(
          home: MyWidget(title: 'Initial'),
        ),
      );

      expect(find.text('Initial'), findsOneWidget);

      // Act
      await tester.pumpWidget(
        const MaterialApp(
          home: MyWidget(title: 'Updated'),
        ),
      );

      // Assert
      expect(find.text('Initial'), findsNothing);
      expect(find.text('Updated'), findsOneWidget);
    });
  });
}
```
