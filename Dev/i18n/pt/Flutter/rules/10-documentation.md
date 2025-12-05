# Documentação Flutter

## Dartdoc

### Formato

```dart
/// Um resumo de linha única.
///
/// Descrição detalhada em múltiplas linhas.
/// Pode conter múltiplos parágrafos.
///
/// Exemplo:
/// ```dart
/// final user = User(
///   id: '123',
///   name: 'João',
/// );
/// ```
///
/// Veja também:
/// - [RelatedClass]
/// - [relatedMethod]
class User {
  /// O identificador único do usuário.
  final String id;

  /// O nome completo do usuário.
  final String name;

  /// Cria uma nova instância de [User].
  ///
  /// O parâmetro [id] deve ser único.
  /// O parâmetro [name] não pode estar vazio.
  ///
  /// Lança [ArgumentError] se [name] estiver vazio.
  User({
    required this.id,
    required this.name,
  }) : assert(name.isNotEmpty, 'Nome não pode estar vazio');

  /// Retorna o nome em maiúsculas.
  String get upperCaseName => name.toUpperCase();
}
```

### Gerar Documentação

```bash
# Gerar
dart doc

# Saída em doc/api/

# Publicar no pub.dev
flutter pub publish --dry-run
flutter pub publish
```

---

## README.md

```markdown
# Meu App Flutter

Descrição curta da aplicação.

## Screenshots

| Home | Perfil | Configurações |
|------|---------|----------|
| ![](screenshots/home.png) | ![](screenshots/profile.png) | ![](screenshots/settings.png) |

## Funcionalidades

- Autenticação (Email, Google, Apple)
- Catálogo de produtos com busca
- Carrinho de compras
- Integração de pagamento (Stripe)
- Notificações push
- Lista de desejos (em progresso)
- Compartilhamento social (planejado)

## Arquitetura

Este projeto segue Clean Architecture com BLoC para gerenciamento de estado.

```
lib/
  ├─ core/
  └─ features/
      └─ [feature]/
          ├─ data/
          ├─ domain/
          └─ presentation/
  └─ main.dart
```

## Começando

### Pré-requisitos

- Flutter 3.16.0 ou superior
- Dart 3.2.0 ou superior
- iOS 13+ / Android 6.0+

### Instalação

```bash
# Clonar
git clone https://github.com/user/repo.git

# Instalar dependências
cd repo
flutter pub get

# Gerar código
flutter pub run build_runner build

# Executar
flutter run
```

### Configuração

Criar `.env`:

```env
API_BASE_URL=https://api.example.com
API_KEY=sua_api_key
```

## Testes

```bash
# Todos os testes
flutter test

# Coverage
flutter test --coverage

# Testes de integração
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

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md)

## Licença

MIT License - veja [LICENSE](LICENSE)
```

---

## CHANGELOG.md

```markdown
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado
- Suporte a modo escuro

### Alterado
- Melhorada a performance da lista de produtos

## [1.1.0] - 2024-01-15

### Adicionado
- Google Sign-In
- Notificações push
- Filtragem de produtos por categoria

### Corrigido
- Carrinho não atualizava após adicionar item
- Crash no carregamento de imagens em conexões lentas

### Alterado
- Atualizado para Flutter 3.16.0
- Migrado para Material Design 3

## [1.0.0] - 2024-01-01

### Adicionado
- Lançamento inicial
- Autenticação por email
- Catálogo de produtos
- Carrinho de compras
- Integração de pagamento Stripe
```

---

## Documentação de API

```dart
/// Cliente API para interagir com o backend.
///
/// Esta classe fornece métodos para fazer requisições HTTP para a API.
/// Todos os métodos são async e retornam [Future].
///
/// Exemplo:
/// ```dart
/// final client = ApiClient(dio);
/// final users = await client.getUsers();
/// ```
class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  /// Busca todos os usuários da API.
  ///
  /// Retorna uma lista de [UserModel].
  ///
  /// Lança [ServerException] se a requisição falhar.
  Future<List<UserModel>> getUsers() async {
    // ...
  }
}
```

---

*Boa documentação facilita a colaboração e manutenção.*
