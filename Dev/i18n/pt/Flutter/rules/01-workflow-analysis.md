# Fluxo de Análise - Metodologia Obrigatória Antes de Codificar

## Princípio Fundamental

**Regra de Ouro**: NUNCA comece a codificar sem ter concluído uma análise completa do contexto e impactos.

Esta regra se aplica a:
- Adicionar novas funcionalidades
- Modificar código existente
- Correção de bugs
- Refatoração
- Otimizações de performance

---

## Fase 1: Compreensão da Necessidade

### 1.1 Esclarecimento da Solicitação

**Perguntas a fazer**:

```markdown
□ Qual é a necessidade de negócio exata?
□ Quem são os usuários finais?
□ Que problema esta funcionalidade resolve?
□ Quais são as restrições (performance, segurança, UX)?
□ Existem dependências com outras funcionalidades?
□ Quais são os critérios de aceitação?
```

**Exemplo de Análise**:

```
SOLICITAÇÃO: "Adicionar um sistema de favoritos para produtos"

ANÁLISE:
- Necessidade de negócio: Permitir que usuários salvem seus produtos favoritos
- Usuários: Clientes autenticados E não autenticados
- Problema resolvido: Facilitar re-acesso aos produtos de interesse
- Restrições:
  * Performance: Lista de favoritos acessível offline
  * Segurança: Favoritos devem sincronizar entre dispositivos
  * UX: Feedback imediato (atualizações otimistas)
- Dependências: Sistema de autenticação, API de Produtos, armazenamento local
- Critérios de aceitação:
  1. Botão "Favoritar" em cada produto
  2. Persistência local E em nuvem
  3. Sincronização no login
  4. Página "Meus Favoritos" acessível
```

### 1.2 Análise de Casos de Uso

Identificar TODOS os cenários:

```dart
// Exemplos de casos de uso para favoritos
/*
CASOS DE USO:
1. Usuário não autenticado adiciona um favorito
   → Armazenar localmente, sugerir criação de conta

2. Usuário autenticado adiciona um favorito
   → Armazenar localmente + sincronizar com backend

3. Usuário faz login
   → Mesclar favoritos locais com favoritos da nuvem

4. Usuário remove um favorito
   → Remover localmente + sincronizar com backend

5. Produto favoritado não existe mais
   → Limpar automaticamente favoritos órfãos

6. Perda de conexão durante adição
   → Fila de sincronização para tentar novamente depois

7. Limite de favoritos atingido
   → Exibir mensagem e sugerir exclusão
*/
```

---

## Fase 2: Exploração do Código Existente

### 2.1 Mapeamento do Código

**Antes de qualquer modificação, explore**:

```bash
# 1. Buscar funcionalidades similares
grep -r "bookmark\|favorite\|like" lib/features/

# 2. Identificar padrões existentes
find lib/features -name "*_bloc.dart" | head -5

# 3. Encontrar repositórios similares
find lib/features -name "*_repository.dart"

# 4. Analisar estrutura de dados
grep -r "class.*Model" lib/features/*/data/models/

# 5. Verificar dependências
grep -A 20 "dependencies:" pubspec.yaml
```

**Documentar descobertas**:

```markdown
EXPLORAÇÃO DE PADRÕES EXISTENTES:

1. Gerenciamento de Estado:
   - Projeto usa flutter_bloc
   - Padrão: Event → Bloc → State
   - Exemplo: lib/features/auth/presentation/bloc/

2. Padrão Repository:
   - Interface em domain/repositories/
   - Implementação em data/repositories/
   - Usa dartz para Either<Failure, Success>

3. Armazenamento Local:
   - Usa Hive para cache
   - Boxes criados em core/cache/cache_manager.dart

4. API:
   - Retrofit + Dio
   - Cliente base em core/network/api_client.dart
```

### 2.2 Identificação de Dependências

```dart
// Criar um diagrama mental de dependências

/*
DIAGRAMA DE DEPENDÊNCIAS PARA FAVORITOS:

ProductDetailPage
    ↓
FavoriteButton (novo widget)
    ↓
FavoriteBloc (novo)
    ↓
ToggleFavoriteUseCase (novo)
    ↓
FavoriteRepository (novo)
    ↓
┌─────────────────┬─────────────────────┐
│                 │                     │
LocalDataSource   RemoteDataSource      SyncService
(Hive)           (API)                 (novo)
    ↓                 ↓                     ↓
FavoriteBox      FavoriteApiClient     WorkManager
                                       (sincronização em background)

EXISTENTE PARA REUTILIZAR:
- NetworkInfo (verificar conexão)
- CacheManager (gerenciamento Hive)
- ApiClient (base Dio/Retrofit)
- AuthBloc (ID do usuário para associar favoritos)
*/
```

### 2.3 Análise de Impacto

**Impacto no código existente**:

```markdown
ARQUIVOS A MODIFICAR:

1. pubspec.yaml
   → Adicionar: workmanager (para sincronização em background)

2. lib/dependency_injection.dart
   → Registrar novos serviços

3. lib/features/products/presentation/pages/product_detail_page.dart
   → Adicionar FavoriteButton

4. lib/features/products/data/models/product_model.dart
   → Adicionar campo `isFavorite` (opcional, para UI)

5. lib/core/navigation/app_router.dart
   → Adicionar rota /favorites

NOVOS ARQUIVOS A CRIAR:

lib/features/favorites/
├── data/
│   ├── datasources/
│   │   ├── favorite_local_datasource.dart
│   │   └── favorite_remote_datasource.dart
│   ├── models/
│   │   └── favorite_model.dart
│   └── repositories/
│       └── favorite_repository_impl.dart
├── domain/
│   ├── entities/
│   │   └── favorite.dart
│   ├── repositories/
│   │   └── favorite_repository.dart
│   └── usecases/
│       ├── add_favorite.dart
│       ├── remove_favorite.dart
│       ├── get_favorites.dart
│       └── sync_favorites.dart
└── presentation/
    ├── bloc/
    │   ├── favorite_bloc.dart
    │   ├── favorite_event.dart
    │   └── favorite_state.dart
    ├── pages/
    │   └── favorites_page.dart
    └── widgets/
        ├── favorite_button.dart
        └── favorite_list_item.dart
```

---

## Fase 3: Design da Solução

### 3.1 Arquitetura Detalhada

**Definir cada camada**:

```dart
// ===== CAMADA DOMAIN =====

// Entity: Representação de negócio pura
class Favorite extends Equatable {
  final String id;
  final String userId;
  final String productId;
  final DateTime createdAt;

  const Favorite({
    required this.id,
    required this.userId,
    required this.productId,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, userId, productId, createdAt];
}

// Repository Interface: Contrato
abstract class FavoriteRepository {
  Future<Either<Failure, List<Favorite>>> getFavorites(String userId);
  Future<Either<Failure, void>> addFavorite(String userId, String productId);
  Future<Either<Failure, void>> removeFavorite(String favoriteId);
  Future<Either<Failure, void>> syncFavorites(String userId);
}

// Use Case: Lógica de negócio isolada
class AddFavorite {
  final FavoriteRepository repository;

  AddFavorite(this.repository);

  Future<Either<Failure, void>> call({
    required String userId,
    required String productId,
  }) async {
    // Validação de negócio
    if (userId.isEmpty || productId.isEmpty) {
      return Left(ValidationFailure('Parâmetros inválidos'));
    }

    // Delegar ao repositório
    return await repository.addFavorite(userId, productId);
  }
}

// ===== CAMADA DATA =====

// Model: Serialização/Desserialização
@freezed
class FavoriteModel with _$FavoriteModel {
  const factory FavoriteModel({
    required String id,
    required String userId,
    required String productId,
    required DateTime createdAt,
  }) = _FavoriteModel;

  factory FavoriteModel.fromJson(Map<String, dynamic> json) =>
      _$FavoriteModelFromJson(json);
}

// Extension para conversão Entity ↔ Model
extension FavoriteModelX on FavoriteModel {
  Favorite toEntity() => Favorite(
        id: id,
        userId: userId,
        productId: productId,
        createdAt: createdAt,
      );
}

// DataSource Interface
abstract class FavoriteLocalDataSource {
  Future<List<FavoriteModel>> getCachedFavorites(String userId);
  Future<void> cacheFavorite(FavoriteModel favorite);
  Future<void> removeFavorite(String favoriteId);
  Future<List<FavoriteModel>> getPendingSyncFavorites();
}

// Implementation
class FavoriteLocalDataSourceImpl implements FavoriteLocalDataSource {
  final Box<FavoriteModel> favoriteBox;

  FavoriteLocalDataSourceImpl(this.favoriteBox);

  @override
  Future<List<FavoriteModel>> getCachedFavorites(String userId) async {
    return favoriteBox.values
        .where((fav) => fav.userId == userId)
        .toList();
  }

  @override
  Future<void> cacheFavorite(FavoriteModel favorite) async {
    await favoriteBox.put(favorite.id, favorite);
  }

  // ... outros métodos
}

// Repository Implementation: Orquestração
class FavoriteRepositoryImpl implements FavoriteRepository {
  final FavoriteLocalDataSource localDataSource;
  final FavoriteRemoteDataSource remoteDataSource;
  final NetworkInfo networkInfo;

  FavoriteRepositoryImpl({
    required this.localDataSource,
    required this.remoteDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, void>> addFavorite(
    String userId,
    String productId,
  ) async {
    try {
      final favorite = FavoriteModel(
        id: const Uuid().v4(),
        userId: userId,
        productId: productId,
        createdAt: DateTime.now(),
      );

      // Sempre salvar localmente primeiro (offline-first)
      await localDataSource.cacheFavorite(favorite);

      // Tentar sincronizar com backend se conectado
      if (await networkInfo.isConnected) {
        try {
          await remoteDataSource.addFavorite(favorite);
        } catch (e) {
          // Marcar para sincronização posterior, não falhar
          await localDataSource.markForSync(favorite.id);
        }
      }

      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  // ... outros métodos
}

// ===== CAMADA PRESENTATION =====

// Events
abstract class FavoriteEvent extends Equatable {
  const FavoriteEvent();
}

class AddFavoritePressed extends FavoriteEvent {
  final String productId;

  const AddFavoritePressed(this.productId);

  @override
  List<Object?> get props => [productId];
}

// States
abstract class FavoriteState extends Equatable {
  const FavoriteState();
}

class FavoriteInitial extends FavoriteState {
  @override
  List<Object?> get props => [];
}

class FavoriteLoading extends FavoriteState {
  @override
  List<Object?> get props => [];
}

class FavoriteLoaded extends FavoriteState {
  final List<Favorite> favorites;

  const FavoriteLoaded(this.favorites);

  @override
  List<Object?> get props => [favorites];
}

// State Otimista (para feedback imediato)
class FavoriteOptimisticAdded extends FavoriteState {
  final String productId;

  const FavoriteOptimisticAdded(this.productId);

  @override
  List<Object?> get props => [productId];
}

// BLoC
class FavoriteBloc extends Bloc<FavoriteEvent, FavoriteState> {
  final AddFavorite addFavoriteUseCase;
  final RemoveFavorite removeFavoriteUseCase;
  final GetFavorites getFavoritesUseCase;
  final AuthBloc authBloc;

  FavoriteBloc({
    required this.addFavoriteUseCase,
    required this.removeFavoriteUseCase,
    required this.getFavoritesUseCase,
    required this.authBloc,
  }) : super(FavoriteInitial()) {
    on<AddFavoritePressed>(_onAddFavorite);
  }

  Future<void> _onAddFavorite(
    AddFavoritePressed event,
    Emitter<FavoriteState> emit,
  ) async {
    final userId = authBloc.state.user?.id;
    if (userId == null) return;

    // Atualização otimista para UI reativa
    emit(FavoriteOptimisticAdded(event.productId));

    final result = await addFavoriteUseCase(
      userId: userId,
      productId: event.productId,
    );

    result.fold(
      (failure) => emit(FavoriteError(failure.message)),
      (_) => add(const LoadFavorites()), // Recarregar lista
    );
  }
}

// Widget
class FavoriteButton extends StatelessWidget {
  const FavoriteButton({
    super.key,
    required this.productId,
    required this.isFavorite,
  });

  final String productId;
  final bool isFavorite;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FavoriteBloc, FavoriteState>(
      builder: (context, state) {
        // Tratar estado otimista
        final isOptimistic = state is FavoriteOptimisticAdded &&
            state.productId == productId;

        return IconButton(
          icon: Icon(
            isFavorite || isOptimistic
                ? Icons.favorite
                : Icons.favorite_border,
          ),
          color: isFavorite || isOptimistic ? Colors.red : null,
          onPressed: () {
            if (isFavorite) {
              context.read<FavoriteBloc>().add(
                    RemoveFavoritePressed(productId),
                  );
            } else {
              context.read<FavoriteBloc>().add(
                    AddFavoritePressed(productId),
                  );
            }
          },
        );
      },
    );
  }
}
```

### 3.2 Gerenciamento de Casos Extremos

**Antecipar casos extremos**:

```dart
/*
CASOS EXTREMOS A TRATAR:

1. Duplo toque rápido no botão de favorito
   → Debounce ou desabilitar durante operação

2. Produto já está nos favoritos
   → Verificar antes de adicionar, retornar cedo

3. Limite de favoritos (ex: máximo 100)
   → Validar no cliente E no servidor

4. Exclusão de um produto que está nos favoritos
   → Exclusão suave ou limpeza automática

5. Mudança de conta
   → Limpar cache local de favoritos

6. Conflito de sincronização (modificação simultânea web + mobile)
   → Last-write-wins ou merge inteligente

7. Espaço insuficiente em disco para cache
   → Tratar exceção, sugerir limpeza
*/

// Exemplo: Debouncing para evitar duplo toque
class FavoriteButton extends StatefulWidget {
  // ... props

  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton> {
  bool _isProcessing = false;

  Future<void> _toggleFavorite() async {
    if (_isProcessing) return; // Ignorar se já em progresso

    setState(() => _isProcessing = true);

    // Executar ação
    if (widget.isFavorite) {
      context.read<FavoriteBloc>().add(
            RemoveFavoritePressed(widget.productId),
          );
    } else {
      context.read<FavoriteBloc>().add(
            AddFavoritePressed(widget.productId),
          );
    }

    // Desbloquear após delay
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(_isProcessing ? Icons.hourglass_empty : Icons.favorite),
      onPressed: _isProcessing ? null : _toggleFavorite,
    );
  }
}
```

---

## Fase 4: Plano de Testes

### 4.1 Estratégia de Testes

**Definir ANTES de codificar**:

```dart
/*
PLANO DE TESTES PARA FUNCIONALIDADE DE FAVORITOS:

┌─────────────────────────────────────────────────────────┐
│                  TESTES UNITÁRIOS                       │
├─────────────────────────────────────────────────────────┤
│ 1. UseCases                                             │
│    - AddFavorite: sucesso, erro de validação           │
│    - RemoveFavorite: sucesso, não encontrado            │
│    - GetFavorites: sucesso, lista vazia                 │
│                                                         │
│ 2. Repositories                                         │
│    - addFavorite: cenários online/offline              │
│    - sync: resolução de conflitos                      │
│    - estratégia de caching                              │
│                                                         │
│ 3. DataSources                                          │
│    - Local: operações CRUD                             │
│    - Remote: respostas da API, erros                   │
│                                                         │
│ 4. BLoC                                                 │
│    - Mapeamento Events → States                        │
│    - Atualizações otimistas                             │
│    - Tratamento de erros                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 TESTES DE WIDGET                        │
├─────────────────────────────────────────────────────────┤
│ 1. FavoriteButton                                       │
│    - Exibição correta (preenchido/contorno)            │
│    - Toque dispara evento correto                      │
│    - Desabilitado durante processamento                 │
│                                                         │
│ 2. FavoritesPage                                        │
│    - Lista vazia → placeholder                          │
│    - Lista preenchida → exibir itens                    │
│    - Pull-to-refresh funciona                           │
│    - Exclusão de item → diálogo de confirmação         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              TESTES DE INTEGRAÇÃO                       │
├─────────────────────────────────────────────────────────┤
│ 1. Fluxo E2E de Favoritos                              │
│    - Login → Navegar → Adicionar Favorito → Verificar  │
│    - Modo offline → Adicionar → Ficar online → Sync    │
│    - Logout → Login outra conta → Favoritos separados  │
└─────────────────────────────────────────────────────────┘
*/

// Exemplo: Teste unitário para UseCase
void main() {
  group('AddFavorite', () {
    late AddFavorite useCase;
    late MockFavoriteRepository mockRepository;

    setUp(() {
      mockRepository = MockFavoriteRepository();
      useCase = AddFavorite(mockRepository);
    });

    test('deve adicionar favorito com sucesso', () async {
      // Arrange
      when(() => mockRepository.addFavorite(any(), any()))
          .thenAnswer((_) async => const Right(null));

      // Act
      final result = await useCase(
        userId: 'user123',
        productId: 'prod456',
      );

      // Assert
      expect(result, const Right(null));
      verify(() => mockRepository.addFavorite('user123', 'prod456'))
          .called(1);
    });

    test('deve retornar ValidationFailure para userId vazio', () async {
      // Act
      final result = await useCase(
        userId: '',
        productId: 'prod456',
      );

      // Assert
      expect(result, isA<Left<Failure, void>>());
      verifyNever(() => mockRepository.addFavorite(any(), any()));
    });
  });
}
```

### 4.2 Critérios de Qualidade

**Definir limiares aceitáveis**:

```yaml
# test_coverage_requirements.yaml
minimum_coverage:
  overall: 80%
  domain: 95%     # UseCases devem ser muito testados
  data: 85%       # Repositories e DataSources
  presentation: 70%  # BLoCs e Widgets

quality_gates:
  - no_flutter_lints_warnings: true
  - dart_analyze_clean: true
  - all_tests_pass: true
  - build_success: true
```

---

## Fase 5: Estimativa e Planejamento

### 5.1 Quebra de Tarefas

```markdown
TAREFAS PARA FUNCIONALIDADE DE FAVORITOS (estimativas):

1. Configuração inicial (1h)
   - Adicionar dependências (Hive, workmanager)
   - Configurar DI
   - Criar estrutura de pastas

2. Camada domain (2h)
   - Entity Favorite
   - Interface Repository
   - UseCases (Add, Remove, Get, Sync)

3. Camada data (4h)
   - Models com Freezed
   - Local DataSource (Hive)
   - Remote DataSource (API)
   - Implementação Repository
   - Testes unitários

4. Camada presentation (5h)
   - BLoC (Events, States, Logic)
   - Widget FavoriteButton
   - FavoritesPage
   - Testes de widget

5. Integração (3h)
   - Adicionar botão ao ProductDetailPage
   - Navegação para FavoritesPage
   - Sincronização em background
   - Testes de integração

6. Polimento & Correção de bugs (2h)
   - Animações
   - Mensagens de erro
   - Estados de loading
   - Casos extremos

TOTAL: ~17h (2-3 dias)
```

### 5.2 Checklist de Validação

```markdown
ANTES DE COMEÇAR:
□ Entendo a necessidade de negócio
□ Explorei o código existente
□ Identifiquei padrões a seguir
□ Desenhei a arquitetura completa
□ Antecipei casos extremos
□ Defini o plano de testes
□ Estimei as tarefas

DURANTE O DESENVOLVIMENTO:
□ Sigo a arquitetura definida
□ Escrevo testes junto com o código
□ Respeito convenções de nomenclatura
□ Documento código público
□ Faço commits regulares com mensagens claras

ANTES DO PUSH:
□ Todos os testes passam
□ Cobertura atende aos limiares
□ Dart analyze limpo
□ Código formatado (dart format)
□ Documentação atualizada
□ Changelog atualizado
```

---

## Fase 6: Revisão Pós-Implementação

### 6.1 Validação da Solução

**Após implementação, verificar**:

```markdown
CHECKLIST PÓS-DESENVOLVIMENTO:

FUNCIONAL:
□ Todos os casos de uso funcionam
□ Casos extremos são tratados
□ UX é suave (sem congelamentos)
□ Animações são fluidas
□ Mensagens de erro são claras

TÉCNICO:
□ Arquitetura respeitada (Clean Architecture)
□ Princípios SOLID aplicados
□ Código DRY (sem duplicação)
□ Performance aceitável (profiling feito)
□ Sem vazamentos de memória

QUALIDADE:
□ Cobertura de testes > limiares definidos
□ Documentação completa
□ Code review aprovado
□ Sem warnings ou deprecações

SEGURANÇA:
□ Sem dados sensíveis em texto claro
□ Validação no cliente E servidor
□ Gerenciamento seguro de tokens/credenciais
```

### 6.2 Lições Aprendidas

**Documentar para próxima vez**:

```markdown
# Post-Mortem: Funcionalidade de Favoritos

## O Que Funcionou Bem
- Clean Architecture: fácil adicionar novos casos de uso
- Offline-first: UX muito responsiva mesmo sem rede
- Testes: poucos bugs graças aos testes exaustivos

## Dificuldades Encontradas
- Conflitos de sincronização: lógica de merge mais complexa que esperado
- Performance: lista de 1000+ favoritos com lag → adicionada paginação
- Hive: migração de schema trabalhosa → usar Isar da próxima vez?

## Melhorias Futuras
- Adicionar busca/filtros na página de favoritos
- Agrupar favoritos por categorias
- Compartilhar lista de favoritos

## Métricas
- Tempo estimado: 17h
- Tempo real: 20h (+3h para casos extremos imprevistos)
- Testes: 87% de cobertura
- Bugs pós-lançamento: 2 (menores)
```

---

## Template de Análise de Funcionalidade

```markdown
# Análise: [NOME DA FUNCIONALIDADE]

## 1. Contexto

**Solicitação inicial**:
[Copiar solicitação exata]

**Necessidade de negócio**:
[Reformular necessidade em termos de negócio]

**Usuários afetados**:
[Quem vai usar esta funcionalidade?]

## 2. Casos de Uso

### Cenário principal
1. [Passo 1]
2. [Passo 2]
...

### Cenários alternativos
- [Caso alternativo 1]
- [Caso alternativo 2]

### Casos extremos
- [Caso extremo 1]
- [Caso extremo 2]

## 3. Exploração do Código

**Funcionalidades similares existentes**:
[Listar e analisar]

**Padrões a reutilizar**:
[Identificar padrões do projeto]

**Dependências**:
[Listar módulos/serviços necessários]

## 4. Arquitetura Proposta

```
[Diagrama ou descrição]
```

**Arquivos a criar**:
- [Lista]

**Arquivos a modificar**:
- [Lista]

## 5. Plano de Testes

**Testes unitários**:
- [Listar classes a testar]

**Testes de widget**:
- [Listar widgets a testar]

**Testes de integração**:
- [Fluxos E2E a testar]

## 6. Estimativa

**Complexidade**: Baixa / Média / Alta

**Tempo estimado**: [X horas/dias]

**Riscos identificados**:
- [Risco 1]
- [Risco 2]

## 7. Validação

□ Arquitetura validada pelo líder dev
□ UX/UI validada pelo designer
□ Impactos de segurança avaliados
□ Performance estimada aceitável
□ Plano de rollback definido
```

---

## Ferramentas Auxiliares de Análise

### Scripts Úteis

```bash
# analyze_feature.sh
# Ajuda a explorar código para nova funcionalidade

#!/bin/bash

FEATURE_NAME=$1

echo "🔍 Análise de funcionalidade: $FEATURE_NAME"

echo "\n📁 Funcionalidades similares:"
find lib/features -type d -maxdepth 1 | grep -i "$FEATURE_NAME"

echo "\n📄 Busca de padrões:"
grep -r "class.*Bloc" lib/features | head -5
grep -r "abstract class.*Repository" lib/features | head -5

echo "\n📦 Dependências atuais:"
grep "dependencies:" -A 30 pubspec.yaml

echo "\n🧪 Estrutura de testes:"
find test/features -name "*_test.dart" | head -10

echo "\n✅ Análise completa"
```

---

## Princípio de Precaução

**Quando em dúvida**:

1. **PARE** - Não codifique impulsivamente
2. **FAÇA PERGUNTAS** - Esclareça com product owner / líder dev
3. **EXPLORE** - Analise o código existente mais profundamente
4. **PROTÓTIPO** - Faça um spike técnico se incerto
5. **DOCUMENTE** - Compartilhe análise com o time

**Citação para lembrar**:

> "Horas de planejamento podem economizar semanas de codificação e depuração."
> — Desenvolvedor Anônimo

---

*Esta metodologia de análise deve ser aplicada sistematicamente para garantir qualidade, consistência e manutenibilidade do código.*
