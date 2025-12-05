# Documentation Flutter

## Dartdoc

### Format

```dart
/// Une ligne de résumé.
///
/// Description plus détaillée sur plusieurs lignes.
/// Peut contenir plusieurs paragraphes.
///
/// Exemple:
/// ```dart
/// final user = User(
///   id: '123',
///   name: 'John',
/// );
/// ```
///
/// See also:
/// - [RelatedClass]
/// - [relatedMethod]
class User {
  /// L'identifiant unique de l'utilisateur.
  final String id;

  /// Le nom complet de l'utilisateur.
  final String name;

  /// Crée une nouvelle instance de [User].
  ///
  /// Le paramètre [id] doit être unique.
  /// Le paramètre [name] ne peut pas être vide.
  ///
  /// Throws [ArgumentError] si [name] est vide.
  User({
    required this.id,
    required this.name,
  }) : assert(name.isNotEmpty, 'Name cannot be empty');

  /// Retourne le nom en majuscules.
  String get upperCaseName => name.toUpperCase();
}
```

### Générer la documentation

```bash
# Générer
dart doc

# Output dans doc/api/

# Publier sur pub.dev
flutter pub publish --dry-run
flutter pub publish
```

---

## README.md

```markdown
# Mon App Flutter

Description courte de l'application.

## Screenshots

| Home | Profile | Settings |
|------|---------|----------|
| ![](screenshots/home.png) | ![](screenshots/profile.png) | ![](screenshots/settings.png) |

## Features

- ✅ Authentication (Email, Google, Apple)
- ✅ Product catalog with search
- ✅ Shopping cart
- ✅ Payment integration (Stripe)
- ✅ Push notifications
- 🚧 Wishlist (in progress)
- 📅 Social sharing (planned)

## Architecture

Ce projet suit Clean Architecture avec BLoC pour le state management.

```
lib/
├── core/
├── features/
│   └── [feature]/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── main.dart
```

## Getting Started

### Prerequisites

- Flutter 3.16.0 ou supérieur
- Dart 3.2.0 ou supérieur
- iOS 13+ / Android 6.0+

### Installation

```bash
# Clone
git clone https://github.com/user/repo.git

# Install dependencies
cd repo
flutter pub get

# Generate code
flutter pub run build_runner build

# Run
flutter run
```

### Configuration

Créer `.env`:

```env
API_BASE_URL=https://api.example.com
API_KEY=your_api_key
```

## Testing

```bash
# All tests
flutter test

# Coverage
flutter test --coverage

# Integration tests
flutter test integration_test/
```

## Build

```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

## Contributing

Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT License - voir [LICENSE](LICENSE)
```

---

## CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dark mode support

### Changed
- Improved performance of product list

## [1.1.0] - 2024-01-15

### Added
- Google Sign-In
- Push notifications
- Product filtering by category

### Fixed
- Cart not updating after adding item
- Image loading crash on slow connections

### Changed
- Updated to Flutter 3.16.0
- Migrated to Material Design 3

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Email authentication
- Product catalog
- Shopping cart
- Stripe payment integration
```

---

## API Documentation

```dart
/// API client for interacting with the backend.
///
/// This class provides methods to make HTTP requests to the API.
/// All methods are async and return [Future].
///
/// Example:
/// ```dart
/// final client = ApiClient(dio);
/// final users = await client.getUsers();
/// ```
class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  /// Fetches all users from the API.
  ///
  /// Returns a list of [UserModel].
  ///
  /// Throws [ServerException] if the request fails.
  Future<List<UserModel>> getUsers() async {
    // ...
  }
}
```

---

*Une bonne documentation facilite la collaboration et la maintenance.*
