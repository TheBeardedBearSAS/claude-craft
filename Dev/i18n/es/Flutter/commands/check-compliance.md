---
description: Auditoría Completa de Conformidad Flutter
argument-hint: [arguments]
---

# Auditoría Completa de Conformidad Flutter

## Argumentos

$ARGUMENTS

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en Flutter encargado de realizar una auditoría completa de conformidad del proyecto. Esta auditoría evalúa 4 dimensiones críticas: Arquitectura, Calidad del Código, Tests y Seguridad.

### Paso 1: Preparación de la auditoría

- [ ] Identificar la estructura completa del proyecto Flutter
- [ ] Verificar la presencia de `pubspec.yaml`, `analysis_options.yaml`
- [ ] Localizar las carpetas: `lib/`, `test/`, `android/`, `ios/`
- [ ] Referenciar TODAS las reglas desde `/rules/`:
  - `02-architecture.md` - Clean Architecture
  - `03-coding-standards.md` - Effective Dart
  - `04-solid-principles.md` - SOLID
  - `05-kiss-dry-yagni.md` - Principios de simplicidad
  - `07-testing.md` - Estrategia de tests
  - `08-quality-tools.md` - Herramientas de calidad
  - `11-security.md` - Seguridad

### Paso 2: Ejecución de las 4 auditorías especializadas (100 puntos)

#### 2.1 🏗️ AUDITORÍA ARQUITECTURA (25 puntos)

Ejecutar el análisis de arquitectura completo verificando:

**Organización Clean Architecture (10 pts)**
- [ ] Domain Layer: Entidades y UseCases aislados
  - Verificar `lib/domain/entities/`, `lib/domain/usecases/`
  - Ninguna dependencia hacia data/presentation
- [ ] Data Layer: Repositories, DataSources, Models
  - Verificar `lib/data/repositories/`, `lib/data/datasources/`, `lib/data/models/`
  - Implementación de las interfaces domain
- [ ] Presentation Layer: UI, BLoCs/Providers
  - Verificar `lib/presentation/pages/`, `lib/presentation/widgets/`, `lib/presentation/blocs/`

**Inyección de dependencias (5 pts)**
- [ ] Container DI configurado (get_it, injectable, riverpod)
- [ ] Sin `new()` directo, todo inyectado vía constructor

**Separación de responsabilidades SOLID (5 pts)**
- [ ] Single Responsibility: Una clase = una responsabilidad
- [ ] Interface Segregation: Interfaces especializadas
- [ ] Dependency Inversion: Depende de abstracciones

**Estructura modular (5 pts)**
- [ ] Features aisladas por funcionalidad
- [ ] Core/Shared para utilidades comunes
- [ ] Sin acoplamiento entre features

**Score Arquitectura: XX/25**

---

#### 2.2 💎 AUDITORÍA CALIDAD DEL CÓDIGO (25 puntos)

Ejecutar el análisis de calidad del código:

**Convenciones Effective Dart (6 pts)**
- [ ] Clases/Enums: UpperCamelCase
- [ ] Variables/Métodos: lowerCamelCase
- [ ] Constantes: lowerCamelCase
- [ ] Archivos: snake_case
- [ ] Nombres descriptivos, sin abreviaciones crípticas

**Linting y análisis estático (7 pts)**
- [ ] `analysis_options.yaml` configurado estrictamente
- [ ] Ningún warning en `flutter analyze`
  ```bash
  docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter analyze
  ```
- [ ] Reglas `prefer_const_constructors`, `avoid_print` respetadas

**Principios KISS, DRY, YAGNI (6 pts)**
- [ ] KISS: Métodos < 50 líneas, lógica simple
- [ ] DRY: Sin duplicación, utilidades comunes
- [ ] YAGNI: Sin sobre-ingeniería

**Documentación (3 pts)**
- [ ] Clases públicas documentadas con `///`
- [ ] Métodos complejos comentados
- [ ] Sin código comentado en producción

**Gestión de errores (3 pts)**
- [ ] Try-catch apropiados con logging
- [ ] Tipos de error específicos
- [ ] Sin `print()` en producción

**Score Calidad Código: XX/25**

---

#### 2.3 🧪 AUDITORÍA TESTS (25 puntos)

Ejecutar el análisis de la cobertura de tests:

**Cobertura (8 pts)**
- [ ] Tests unitarios para domain/data (70% mínimo)
- [ ] Tests de widgets para UI crítica
- [ ] Cobertura global > 60%
  ```bash
  docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter test --coverage
  ```

**Calidad de los tests (7 pts)**
- [ ] Patrón AAA (Arrange-Act-Assert) respetado
- [ ] Tests aislados con mocks (mockito/mocktail)
- [ ] Nombres descriptivos explícitos
- [ ] Sin tests flaky

**Tipos de tests (6 pts)**
- [ ] Unit tests: Lógica pura < 100ms
- [ ] Widget tests: UI e interacciones
- [ ] Golden tests: Regresión visual
- [ ] Integration tests: Flujos end-to-end

**Mocks y fixtures (4 pts)**
- [ ] Mocks generados con mockito (`*.mocks.dart`)
- [ ] Fixtures organizados en `/test/fixtures/`

**Score Testing: XX/25**

---

#### 2.4 🔒 AUDITORÍA SEGURIDAD (25 puntos)

Ejecutar el análisis de seguridad:

**Gestión de secrets (8 pts)**
- [ ] **Ningún secret hardcodeado** en el código
  ```bash
  docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "grep -r -E '(api[_-]?key|token|password|secret)' lib/ --include='*.dart'"
  ```
- [ ] Variables de entorno (.env con flutter_dotenv)
- [ ] flutter_secure_storage para tokens/credentials

**Comunicación red (6 pts)**
- [ ] HTTPS obligatorio (sin `http://`)
  ```bash
  docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "grep -r 'http://' lib/ --include='*.dart'"
  ```
- [ ] Validación SSL/TLS, sin `badCertificateCallback` que acepte todo
- [ ] Timeouts configurados

**Datos sensibles (5 pts)**
- [ ] Cifrado datos locales (flutter_secure_storage, encrypted Hive)
- [ ] Sin logs sensibles (print, debugPrint)
- [ ] Obfuscación activada en release

**Permisos (3 pts)**
- [ ] Permisos mínimos Android/iOS
- [ ] Validación de entradas del usuario

**Dependencias (3 pts)**
- [ ] Packages actualizados sin vulnerabilidades
  ```bash
  docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub outdated
  ```
- [ ] Auditoría de packages terceros

**Score Seguridad: XX/25**

---

### Paso 3: Cálculo del score global

```
SCORE TOTAL = Arquitectura + Calidad + Tests + Seguridad

SCORE TOTAL: XX/100

Distribución:
- Arquitectura: XX/25
- Calidad Código: XX/25
- Tests: XX/25
- Seguridad: XX/25
```

**Interpretación:**
- ✅ 85-100 pts: Proyecto excelente, listo para producción
- ✅ 70-84 pts: Proyecto sólido, algunas mejoras menores
- ⚠️ 50-69 pts: Proyecto correcto, mejoras necesarias
- ⚠️ 30-49 pts: Proyecto en riesgo, refactoring recomendado
- ❌ 0-29 pts: Proyecto crítico, refactorización mayor requerida

### Paso 4: Reporte ejecutivo consolidado

Genera un reporte ejecutivo con:

---

## 📊 REPORTE DE AUDITORÍA DE CONFORMIDAD FLUTTER

### Score Global: XX/100

```
┌─────────────────────────────────────────────────┐
│ 🏗️  Arquitectura      : XX/25  [███████░░░]    │
│ 💎  Calidad del Código: XX/25  [█████░░░░░]    │
│ 🧪  Tests             : XX/25  [████░░░░░░]    │
│ 🔒  Seguridad         : XX/25  [██████░░░░]    │
├─────────────────────────────────────────────────┤
│ 🎯  TOTAL             : XX/100 [█████░░░░░]    │
└─────────────────────────────────────────────────┘
```

### ✅ Puntos Fuertes del Proyecto

1. **Arquitectura**: [Describir los puntos fuertes arquitecturales]
2. **Calidad**: [Describir las buenas prácticas de código]
3. **Tests**: [Describir la cobertura y calidad tests]
4. **Seguridad**: [Describir las medidas de seguridad en lugar]

### ⚠️ Ejes de Mejora

#### Arquitectura
- [Listar los problemas arquitecturales con impacto y archivos concernidos]

#### Calidad del Código
- [Listar las violaciones de convenciones con ejemplos]

#### Tests
- [Listar las faltas de cobertura con porcentajes]

#### Seguridad
- [Listar las vulnerabilidades potenciales con criticidad]

### ❌ Violaciones Críticas (Bloqueantes)

**PRIORIDAD MÁXIMA - A corregir inmediatamente:**

1. **[SEGURIDAD]** Secrets hardcodeados detectados
   - `lib/config/api_config.dart:5`: API key en claro
   - Impacto: Exposición de credenciales
   - Acción: Migrar hacia .env inmediatamente

2. **[ARQUITECTURA]** Acoplamiento fuerte entre layers
   - Domain depende de Data
   - Impacto: Imposible testear, no mantenible
   - Acción: Invertir las dependencias con interfaces

3. **[TESTS]** Ningún test presente
   - 0% de cobertura
   - Impacto: Ninguna garantía de no-regresión
   - Acción: Crear tests unitarios para UseCases

### 📈 Métricas Detalladas

#### Análisis Estático
```bash
flutter analyze: XX warnings, XX errors
flutter pub outdated: XX packages a actualizar
```

#### Cobertura de Tests
```
Domain Layer: XX%
Data Layer: XX%
Presentation Layer: XX%
TOTAL: XX%
```

#### Seguridad
```
Secrets hardcodeados: XX detectados
Endpoints HTTP: XX detectados
Packages vulnerables: XX detectados
```

### 🎯 TOP 3 ACCIONES PRIORITARIAS

#### 1. [PRIORIDAD CRÍTICA] - Impacto Seguridad/Arquitectura
**Acción**: [Descripción precisa de la acción]
- **Por qué**: [Justificación con impacto business/técnico]
- **Cómo**: [Pasos concretos de implementación]
- **Esfuerzo estimado**: [XS/S/M/L/XL]
- **Impacto**: [Crítico/Alto/Medio/Bajo]
- **Archivos concernidos**: [Lista de archivos]

#### 2. [PRIORIDAD ALTA] - Impacto Calidad/Tests
**Acción**: [Descripción precisa de la acción]
- **Por qué**: [Justificación]
- **Cómo**: [Pasos concretos]
- **Esfuerzo estimado**: [XS/S/M/L/XL]
- **Impacto**: [Crítico/Alto/Medio/Bajo]
- **Archivos concernidos**: [Lista de archivos]

#### 3. [PRIORIDAD MEDIA] - Impacto Mantenimiento
**Acción**: [Descripción precisa de la acción]
- **Por qué**: [Justificación]
- **Cómo**: [Pasos concretos]
- **Esfuerzo estimado**: [XS/S/M/L/XL]
- **Impacto**: [Crítico/Alto/Medio/Bajo]
- **Archivos concernidos**: [Lista de archivos]

### 📋 Plan de Acción Recomendado

**Fase 1 - Urgencia (Esta semana)**
- [ ] Corregir las violaciones críticas de seguridad
- [ ] Resolver los problemas arquitecturales bloqueantes
- [ ] Crear los tests para la lógica crítica

**Fase 2 - Corto plazo (Este mes)**
- [ ] Mejorar la cobertura de tests a 60%
- [ ] Refactorizar las violaciones de calidad de código
- [ ] Actualizar los packages vulnerables

**Fase 3 - Medio plazo (Este trimestre)**
- [ ] Finalizar la arquitectura Clean completa
- [ ] Alcanzar 80% de cobertura de tests
- [ ] Implementar todas las best practices de seguridad

---

### 🔍 Comandos Útiles para Seguimiento

```bash
# Verificar la calidad
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter analyze

# Lanzar los tests con cobertura
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter test --coverage

# Verificar los secrets
docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "grep -r -E '(api[_-]?key|token|password)' lib/"

# Actualizar las dependencias
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub upgrade
```

---

**📝 Nota**: Para auditorías focalizadas, utiliza los comandos especializados:
- `/check-architecture` - Auditoría arquitectura únicamente
- `/check-code-quality` - Auditoría calidad de código únicamente
- `/check-testing` - Auditoría tests únicamente
- `/check-security` - Auditoría seguridad únicamente

**Fecha de la auditoría**: [Fecha del día]
**Versión Flutter**: [Detectar desde `flutter --version`]
**Auditor**: Claude (Experto Flutter)
