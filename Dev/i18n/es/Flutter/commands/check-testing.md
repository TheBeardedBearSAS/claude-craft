# Verificación Tests Flutter

## Argumentos

$ARGUMENTS

## MISIÓN

Eres un experto en Flutter encargado de auditar la estrategia y la cobertura de tests del proyecto.

### Paso 1: Análisis de la configuración de tests

- [ ] Localizar la carpeta `/test/` y su estructura
- [ ] Verificar las dependencias de test en `pubspec.yaml` (flutter_test, mockito, bloc_test)
- [ ] Referenciar las reglas desde `/rules/07-testing.md`
- [ ] Referenciar las herramientas desde `/rules/08-quality-tools.md`
- [ ] Verificar la configuración de cobertura

### Paso 2: Verificaciones Tests (25 puntos)

#### 2.1 Cobertura de tests (8 puntos)
- [ ] **Tests unitarios** presentes para la lógica de negocio (0-3 pts)
  - Domain layer: Entities, UseCases
  - Data layer: Repositories, Models
  - Mínimo 70% de cobertura en domain
- [ ] **Tests de widgets** para los componentes UI (0-3 pts)
  - Al menos los widgets críticos testeados
  - Tests de interacción del usuario (tap, scroll, input)
- [ ] **Cobertura global** medida y > 60% (0-2 pts)
  - Ejecutar: `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter test --coverage`
  - Analizar `coverage/lcov.info`

#### 2.2 Calidad de los tests (7 puntos)
- [ ] **Patrón AAA** (Arrange-Act-Assert) respetado (0-2 pts)
  - Tests estructurados y legibles
  - Un test = un comportamiento
- [ ] **Tests aislados** con mocks/stubs (0-2 pts)
  - Utilización de mockito o mocktail
  - Sin dependencias externas (API, DB) en los tests
- [ ] **Tests descriptivos** con nombres explícitos (0-2 pts)
  - Formato: `test('should return user when authentication succeeds')`
- [ ] **Sin tests flaky** (inestables) (0-1 pt)

#### 2.3 Tipos de tests (6 puntos)
- [ ] **Unit tests**: Lógica pura (0-2 pts)
  - UseCases, Validators, Utils
  - Tests rápidos (< 100ms por test)
- [ ] **Widget tests**: UI e interacciones (0-2 pts)
  - `testWidgets()` para componentes
  - Pumping y eventos simulados
- [ ] **Golden tests**: Tests visuales de regresión (0-1 pt)
  - Snapshots de widgets críticos
- [ ] **Integration tests**: Flujos completos (0-1 pt)
  - Tests end-to-end para user stories críticas

#### 2.4 Mocks y fixtures (4 puntos)
- [ ] **Mocks limpios** generados con mockito/mocktail (0-2 pts)
  - Archivos `*.mocks.dart` actualizados
  - Comando: `flutter pub run build_runner build`
- [ ] **Fixtures/test data** organizados (0-2 pts)
  - Carpeta `/test/fixtures/` con JSON, datos test
  - Reutilizables entre tests

### Paso 3: Ejecución de los tests

```bash
# Lanzar los tests con cobertura
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable sh -c "
  flutter test --coverage && \
  flutter test --reporter expanded
"
```

Analizar los resultados:
- [ ] Número total de tests
- [ ] Tests pasados/fallidos
- [ ] Cobertura por archivo

### Paso 4: Cálculo del score

```
SCORE TESTING = Total de puntos / 25

Interpretación:
✅ 20-25 pts: Cobertura excelente
⚠️ 15-19 pts: Cobertura correcta, a completar
⚠️ 10-14 pts: Cobertura insuficiente
❌ 0-9 pts: Tests faltantes o inadecuados
```

### Paso 5: Reporte detallado

Genera un reporte con:

#### 📊 SCORE TESTING: XX/25

#### ✅ Puntos fuertes
- Tipos de tests presentes
- Buena cobertura detectada
- Ejemplos de tests bien escritos

#### ⚠️ Puntos de atención
- Archivos sin tests
- Cobertura < 60%
- Tests faltantes en features críticas

#### ❌ Violaciones críticas
- Ningún test presente
- Tests flaky detectados
- Sin mocks, dependencias externas

#### 📈 Estadísticas de cobertura

```
Domain Layer: XX% (objetivo: 70%)
Data Layer: XX% (objetivo: 60%)
Presentation Layer: XX% (objetivo: 50%)
TOTAL: XX% (objetivo: 60%)
```

#### 💡 Archivos prioritarios a testear

1. `/lib/domain/usecases/authenticate_user.dart` - Lógica crítica
2. `/lib/presentation/pages/home_page.dart` - UI principal
3. `/lib/data/repositories/user_repository_impl.dart` - Acceso a datos

#### 🎯 TOP 3 ACCIONES PRIORITARIAS

1. **[PRIORIDAD ALTA]** Agregar tests unitarios para los UseCases críticos (Impacto: fiabilidad)
2. **[PRIORIDAD MEDIA]** Aumentar cobertura a 60% mínimo (Impacto: confianza)
3. **[PRIORIDAD BAJA]** Agregar golden tests para widgets reutilizables (Impacto: regresión UI)

---

**Nota**: Este reporte se concentra únicamente en los tests. Para una auditoría completa, utiliza `/check-compliance`.
