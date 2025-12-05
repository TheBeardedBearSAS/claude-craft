# Flujo de Análisis - Metodología Obligatoria Antes de Programar

## Principio Fundamental

**Regla de Oro**: NUNCA comenzar a programar sin haber completado un análisis exhaustivo del contexto y los impactos.

Esta regla se aplica a:
- Agregar nuevas funcionalidades
- Modificar código existente
- Corrección de bugs
- Refactorización
- Optimizaciones de rendimiento

---

## Fase 1: Comprensión de la Necesidad

### 1.1 Clarificación de la Solicitud

**Preguntas que hacer**:

```markdown
□ ¿Cuál es la necesidad empresarial exacta?
□ ¿Quiénes son los usuarios finales?
□ ¿Qué problema resuelve esta funcionalidad?
□ ¿Cuáles son las restricciones (rendimiento, seguridad, UX)?
□ ¿Existen dependencias con otras funcionalidades?
□ ¿Cuáles son los criterios de aceptación?
```

**Ejemplo de Análisis**:

```
SOLICITUD: "Agregar un sistema de favoritos para productos"

ANÁLISIS:
- Necesidad empresarial: Permitir a los usuarios guardar sus productos favoritos
- Usuarios: Clientes autenticados Y no autenticados
- Problema resuelto: Facilitar el reacceso a productos de interés
- Restricciones:
  * Rendimiento: Lista de favoritos accesible offline
  * Seguridad: Los favoritos deben sincronizarse entre dispositivos
  * UX: Retroalimentación inmediata (actualizaciones optimistas)
- Dependencias: Sistema de autenticación, API de Productos, almacenamiento local
- Criterios de aceptación:
  1. Botón "Favorito" en cada producto
  2. Persistencia local Y en la nube
  3. Sincronización al iniciar sesión
  4. Página "Mis Favoritos" accesible
```

### 1.2 Análisis de Casos de Uso

Identificar TODOS los escenarios:

```dart
// Ejemplos de casos de uso para favoritos
/*
CASOS DE USO:
1. Usuario no autenticado agrega un favorito
   → Almacenar localmente, sugerir crear una cuenta

2. Usuario autenticado agrega un favorito
   → Almacenar localmente + sincronizar con backend

3. Usuario inicia sesión
   → Fusionar favoritos locales con favoritos en la nube

4. Usuario elimina un favorito
   → Eliminar localmente + sincronizar con backend

5. Producto favorito ya no existe
   → Limpiar automáticamente favoritos huérfanos

6. Pérdida de conexión durante la adición
   → Cola de sincronización para reintento posterior

7. Límite de favoritos alcanzado
   → Mostrar mensaje y sugerir eliminación
*/
```

---

## Fase 2: Exploración del Código Existente

### 2.1 Mapeo del Código

**Antes de cualquier modificación, explorar**:

```bash
# 1. Buscar funcionalidades similares
grep -r "bookmark\|favorite\|like" lib/features/

# 2. Identificar patrones existentes
find lib/features -name "*_bloc.dart" | head -5

# 3. Encontrar repositorios similares
find lib/features -name "*_repository.dart"

# 4. Analizar estructura de datos
grep -r "class.*Model" lib/features/*/data/models/

# 5. Verificar dependencias
grep -A 20 "dependencies:" pubspec.yaml
```

**Documentar descubrimientos**:

```markdown
EXPLORACIÓN DE PATRONES EXISTENTES:

1. Gestión de Estado:
   - El proyecto usa flutter_bloc
   - Patrón: Event → Bloc → State
   - Ejemplo: lib/features/auth/presentation/bloc/

2. Patrón Repository:
   - Interfaz en domain/repositories/
   - Implementación en data/repositories/
   - Usa dartz para Either<Failure, Success>

3. Almacenamiento Local:
   - Usa Hive para caché
   - Boxes creados en core/cache/cache_manager.dart

4. API:
   - Retrofit + Dio
   - Cliente base en core/network/api_client.dart
```

### 2.2 Identificación de Dependencias

```dart
// Crear un diagrama mental de dependencias

/*
DIAGRAMA DE DEPENDENCIAS PARA FAVORITOS:

ProductDetailPage
    ↓
FavoriteButton (nuevo widget)
    ↓
FavoriteBloc (nuevo)
    ↓
ToggleFavoriteUseCase (nuevo)
    ↓
FavoriteRepository (nuevo)
    ↓
┌─────────────────┬─────────────────────┐
│                 │                     │
LocalDataSource   RemoteDataSource      SyncService
(Hive)           (API)                 (nuevo)
    ↓                 ↓                     ↓
FavoriteBox      FavoriteApiClient     WorkManager
                                       (sincronización en segundo plano)

EXISTENTES PARA REUTILIZAR:
- NetworkInfo (verificar conexión)
- CacheManager (gestión de Hive)
- ApiClient (base Dio/Retrofit)
- AuthBloc (ID de usuario para asociar favoritos)
*/
```

### 2.3 Análisis de Impacto

**Impacto en código existente**:

```markdown
ARCHIVOS A MODIFICAR:

1. pubspec.yaml
   → Agregar: workmanager (para sincronización en segundo plano)

2. lib/dependency_injection.dart
   → Registrar nuevos servicios

3. lib/features/products/presentation/pages/product_detail_page.dart
   → Agregar FavoriteButton

4. lib/features/products/data/models/product_model.dart
   → Agregar campo `isFavorite` (opcional, para UI)

5. lib/core/navigation/app_router.dart
   → Agregar ruta /favorites

NUEVOS ARCHIVOS A CREAR:

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

## Fase 3: Diseño de la Solución

### 3.1 Arquitectura Detallada

**Definir cada capa**:

```dart
// ===== CAPA DOMAIN =====

// Entity: Representación empresarial pura
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

// Interfaz Repository: Contrato
abstract class FavoriteRepository {
  Future<Either<Failure, List<Favorite>>> getFavorites(String userId);
  Future<Either<Failure, void>> addFavorite(String userId, String productId);
  Future<Either<Failure, void>> removeFavorite(String favoriteId);
  Future<Either<Failure, void>> syncFavorites(String userId);
}

// Use Case: Lógica empresarial aislada
class AddFavorite {
  final FavoriteRepository repository;

  AddFavorite(this.repository);

  Future<Either<Failure, void>> call({
    required String userId,
    required String productId,
  }) async {
    // Validación empresarial
    if (userId.isEmpty || productId.isEmpty) {
      return Left(ValidationFailure('Parámetros inválidos'));
    }

    // Delegar al repositorio
    return await repository.addFavorite(userId, productId);
  }
}

// ===== CAPA DATA =====

// Model: Serialización/Deserialización
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

// Extensión para conversión Entity ↔ Model
extension FavoriteModelX on FavoriteModel {
  Favorite toEntity() => Favorite(
        id: id,
        userId: userId,
        productId: productId,
        createdAt: createdAt,
      );
}

// Interfaz DataSource
abstract class FavoriteLocalDataSource {
  Future<List<FavoriteModel>> getCachedFavorites(String userId);
  Future<void> cacheFavorite(FavoriteModel favorite);
  Future<void> removeFavorite(String favoriteId);
  Future<List<FavoriteModel>> getPendingSyncFavorites();
}

// Implementación
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

  // ... otros métodos
}

// Implementación del Repository: Orquestación
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

      // Siempre guardar localmente primero (offline-first)
      await localDataSource.cacheFavorite(favorite);

      // Intentar sincronizar con backend si hay conexión
      if (await networkInfo.isConnected) {
        try {
          await remoteDataSource.addFavorite(favorite);
        } catch (e) {
          // Marcar para sincronización posterior, no fallar
          await localDataSource.markForSync(favorite.id);
        }
      }

      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(e.toString()));
    }
  }

  // ... otros métodos
}

// ===== CAPA PRESENTATION =====

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

// Estado Optimista (para retroalimentación inmediata)
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

    // Actualización optimista para UI reactiva
    emit(FavoriteOptimisticAdded(event.productId));

    final result = await addFavoriteUseCase(
      userId: userId,
      productId: event.productId,
    );

    result.fold(
      (failure) => emit(FavoriteError(failure.message)),
      (_) => add(const LoadFavorites()), // Recargar lista
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
        // Manejar estado optimista
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

### 3.2 Gestión de Casos Límite

**Anticipar casos límite**:

```dart
/*
CASOS LÍMITE A MANEJAR:

1. Doble toque rápido en botón de favorito
   → Debounce o deshabilitar durante operación

2. Producto ya en favoritos
   → Verificar antes de agregar, retornar temprano

3. Límite de favoritos (ej: 100 máx)
   → Validar lado cliente Y servidor

4. Eliminación de un producto que está en favoritos
   → Soft delete o limpieza automática

5. Cambio de cuenta
   → Limpiar caché local de favoritos

6. Conflicto de sincronización (modificación simultánea web + móvil)
   → Last-write-wins o fusión inteligente

7. Espacio en disco insuficiente para caché
   → Manejar excepción, sugerir limpieza
*/

// Ejemplo: Debouncing para evitar doble toque
class FavoriteButton extends StatefulWidget {
  // ... props

  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton> {
  bool _isProcessing = false;

  Future<void> _toggleFavorite() async {
    if (_isProcessing) return; // Ignorar si ya está en progreso

    setState(() => _isProcessing = true);

    // Realizar acción
    if (widget.isFavorite) {
      context.read<FavoriteBloc>().add(
            RemoveFavoritePressed(widget.productId),
          );
    } else {
      context.read<FavoriteBloc>().add(
            AddFavoritePressed(widget.productId),
          );
    }

    // Desbloquear después de un delay
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

## Fase 4: Plan de Pruebas

### 4.1 Estrategia de Testing

**Definir ANTES de programar**:

```dart
/*
PLAN DE PRUEBAS PARA FUNCIONALIDAD DE FAVORITOS:

┌─────────────────────────────────────────────────────────┐
│                  PRUEBAS UNITARIAS                      │
├─────────────────────────────────────────────────────────┤
│ 1. UseCases                                             │
│    - AddFavorite: éxito, error de validación          │
│    - RemoveFavorite: éxito, no encontrado              │
│    - GetFavorites: éxito, lista vacía                  │
│                                                         │
│ 2. Repositories                                         │
│    - addFavorite: escenarios online/offline           │
│    - sync: resolución de conflictos                    │
│    - estrategia de caché                               │
│                                                         │
│ 3. DataSources                                          │
│    - Local: operaciones CRUD                           │
│    - Remote: respuestas API, errores                   │
│                                                         │
│ 4. BLoC                                                 │
│    - Mapeo Events → States                             │
│    - Actualizaciones optimistas                        │
│    - Manejo de errores                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 PRUEBAS DE WIDGET                       │
├─────────────────────────────────────────────────────────┤
│ 1. FavoriteButton                                       │
│    - Visualización correcta (lleno/contorno)          │
│    - Toque dispara evento correcto                     │
│    - Deshabilitado durante procesamiento               │
│                                                         │
│ 2. FavoritesPage                                        │
│    - Lista vacía → placeholder                         │
│    - Lista llena → mostrar elementos                   │
│    - Pull-to-refresh funciona                          │
│    - Eliminación de elemento → diálogo confirmación    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              PRUEBAS DE INTEGRACIÓN                     │
├─────────────────────────────────────────────────────────┤
│ 1. Flujo E2E Favorito                                   │
│    - Login → Navegar → Agregar Favorito → Verificar    │
│    - Modo offline → Agregar → Conectar → Sincronizar   │
│    - Logout → Login otra cuenta → Favoritos separados  │
└─────────────────────────────────────────────────────────┘
*/

// Ejemplo: Prueba unitaria para UseCase
void main() {
  group('AddFavorite', () {
    late AddFavorite useCase;
    late MockFavoriteRepository mockRepository;

    setUp(() {
      mockRepository = MockFavoriteRepository();
      useCase = AddFavorite(mockRepository);
    });

    test('debe agregar favorito exitosamente', () async {
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

    test('debe retornar ValidationFailure para userId vacío', () async {
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

### 4.2 Criterios de Calidad

**Definir umbrales aceptables**:

```yaml
# test_coverage_requirements.yaml
minimum_coverage:
  overall: 80%
  domain: 95%     # UseCases deben estar fuertemente probados
  data: 85%       # Repositories y DataSources
  presentation: 70%  # BLoCs y Widgets

quality_gates:
  - no_flutter_lints_warnings: true
  - dart_analyze_clean: true
  - all_tests_pass: true
  - build_success: true
```

---

## Fase 5: Estimación y Planificación

### 5.1 Desglose de Tareas

```markdown
TAREAS PARA FUNCIONALIDAD DE FAVORITOS (estimaciones):

1. Configuración inicial (1h)
   - Agregar dependencias (Hive, workmanager)
   - Configurar DI
   - Crear estructura de carpetas

2. Capa domain (2h)
   - Entity Favorite
   - Interfaz Repository
   - UseCases (Add, Remove, Get, Sync)

3. Capa data (4h)
   - Models con Freezed
   - Local DataSource (Hive)
   - Remote DataSource (API)
   - Implementación Repository
   - Pruebas unitarias

4. Capa presentation (5h)
   - BLoC (Events, States, Lógica)
   - Widget FavoriteButton
   - FavoritesPage
   - Pruebas de widget

5. Integración (3h)
   - Agregar botón a ProductDetailPage
   - Navegación a FavoritesPage
   - Sincronización en segundo plano
   - Pruebas de integración

6. Pulido y corrección de bugs (2h)
   - Animaciones
   - Mensajes de error
   - Estados de carga
   - Casos límite

TOTAL: ~17h (2-3 días)
```

### 5.2 Checklist de Validación

```markdown
ANTES DE COMENZAR:
□ Comprendo la necesidad empresarial
□ Exploré el código existente
□ Identifiqué patrones a seguir
□ Diseñé la arquitectura completa
□ Anticipé casos límite
□ Definí el plan de pruebas
□ Estimé las tareas

DURANTE EL DESARROLLO:
□ Sigo la arquitectura definida
□ Escribo pruebas junto al código
□ Respeto convenciones de nombres
□ Documento código público
□ Hago commits regulares con mensajes claros

ANTES DE PUSH:
□ Todas las pruebas pasan
□ Cobertura cumple umbrales
□ Dart analyze limpio
□ Código formateado (dart format)
□ Documentación actualizada
□ Changelog actualizado
```

---

## Fase 6: Revisión Post-Implementación

### 6.1 Validación de la Solución

**Después de la implementación, verificar**:

```markdown
CHECKLIST POST-DEV:

FUNCIONAL:
□ Todos los casos de uso funcionan
□ Casos límite manejados
□ UX es fluida (sin congelamientos)
□ Animaciones son suaves
□ Mensajes de error son claros

TÉCNICO:
□ Arquitectura respetada (Clean Architecture)
□ Principios SOLID aplicados
□ Código DRY (sin duplicación)
□ Rendimiento aceptable (profiling hecho)
□ Sin fugas de memoria

CALIDAD:
□ Cobertura de pruebas > umbrales definidos
□ Documentación completa
□ Code review aprobado
□ Sin warnings o deprecaciones

SEGURIDAD:
□ Sin datos sensibles en texto claro
□ Validación en cliente Y servidor
□ Gestión segura de tokens/credenciales
```

### 6.2 Lecciones Aprendidas

**Documentar para la próxima vez**:

```markdown
# Post-Mortem: Funcionalidad de Favoritos

## Lo que Funcionó Bien
- Clean Architecture: fácil agregar nuevos casos de uso
- Offline-first: UX muy reactiva incluso sin red
- Pruebas: pocos bugs gracias a pruebas exhaustivas

## Dificultades Encontradas
- Conflictos de sincronización: lógica de fusión más compleja de lo esperado
- Rendimiento: lista de 1000+ favoritos se ralentiza → agregada paginación
- Hive: migración de esquema tediosa → ¿usar Isar la próxima vez?

## Mejoras Futuras
- Agregar búsqueda/filtros en página de favoritos
- Agrupar favoritos por categorías
- Compartir lista de favoritos

## Métricas
- Tiempo estimado: 17h
- Tiempo real: 20h (+3h por casos límite imprevistos)
- Pruebas: 87% de cobertura
- Bugs post-release: 2 (menores)
```

---

## Plantilla de Análisis de Funcionalidad

```markdown
# Análisis: [NOMBRE DE LA FUNCIONALIDAD]

## 1. Contexto

**Solicitud inicial**:
[Copiar solicitud exacta]

**Necesidad empresarial**:
[Reformular necesidad en términos empresariales]

**Usuarios concernidos**:
[¿Quién usará esta funcionalidad?]

## 2. Casos de Uso

### Escenario principal
1. [Paso 1]
2. [Paso 2]
...

### Escenarios alternativos
- [Caso alternativo 1]
- [Caso alternativo 2]

### Casos límite
- [Caso límite 1]
- [Caso límite 2]

## 3. Exploración del Código

**Funcionalidades similares existentes**:
[Listar y analizar]

**Patrones para reutilizar**:
[Identificar patrones del proyecto]

**Dependencias**:
[Listar módulos/servicios necesarios]

## 4. Arquitectura Propuesta

```
[Diagrama o descripción]
```

**Archivos a crear**:
- [Lista]

**Archivos a modificar**:
- [Lista]

## 5. Plan de Pruebas

**Pruebas unitarias**:
- [Listar clases a probar]

**Pruebas de widget**:
- [Listar widgets a probar]

**Pruebas de integración**:
- [Flujos E2E a probar]

## 6. Estimación

**Complejidad**: Baja / Media / Alta

**Tiempo estimado**: [X horas/días]

**Riesgos identificados**:
- [Riesgo 1]
- [Riesgo 2]

## 7. Validación

□ Arquitectura validada por lead dev
□ UX/UI validada por diseñador
□ Impactos de seguridad evaluados
□ Rendimiento estimado aceptable
□ Plan de rollback definido
```

---

## Herramientas de Ayuda al Análisis

### Scripts Útiles

```bash
# analyze_feature.sh
# Ayuda a explorar el código para una nueva funcionalidad

#!/bin/bash

FEATURE_NAME=$1

echo "🔍 Análisis de funcionalidad: $FEATURE_NAME"

echo "\n📁 Funcionalidades similares:"
find lib/features -type d -maxdepth 1 | grep -i "$FEATURE_NAME"

echo "\n📄 Búsqueda de patrones:"
grep -r "class.*Bloc" lib/features | head -5
grep -r "abstract class.*Repository" lib/features | head -5

echo "\n📦 Dependencias actuales:"
grep "dependencies:" -A 30 pubspec.yaml

echo "\n🧪 Estructura de pruebas:"
find test/features -name "*_test.dart" | head -10

echo "\n✅ Análisis completo"
```

---

## Principio de Precaución

**Cuando haya dudas**:

1. **DETENER** - No programar impulsivamente
2. **HACER PREGUNTAS** - Aclarar con product owner / lead dev
3. **EXPLORAR** - Analizar el código existente más profundamente
4. **PROTOTIPAR** - Hacer un spike técnico si hay incertidumbre
5. **DOCUMENTAR** - Compartir análisis con el equipo

**Cita para recordar**:

> "Horas de planificación pueden ahorrar semanas de programación y depuración."
> — Desarrollador Anónimo

---

*Esta metodología de análisis debe aplicarse sistemáticamente para garantizar la calidad, consistencia y mantenibilidad del código.*
