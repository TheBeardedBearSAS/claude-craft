---
description: Verificación Calidad del Código Flutter
argument-hint: [arguments]
---

# Verificación Calidad del Código Flutter

## Argumentos

$ARGUMENTS

## MISIÓN

Eres un experto en Flutter encargado de auditar la calidad del código según Effective Dart y las mejores prácticas.

### Paso 1: Análisis del proyecto

- [ ] Identificar todos los archivos Dart del proyecto
- [ ] Analizar el archivo `analysis_options.yaml`
- [ ] Referenciar las reglas desde `/rules/03-coding-standards.md`
- [ ] Referenciar los principios desde `/rules/05-kiss-dry-yagni.md`
- [ ] Verificar la configuración del linter

### Paso 2: Verificaciones Calidad del Código (25 puntos)

#### 2.1 Convenciones de nomenclatura Effective Dart (6 puntos)
- [ ] **Clases/Enums**: UpperCamelCase (0-1 pt)
  - Ejemplos: `UserProfile`, `AuthenticationState`
- [ ] **Variables/Métodos**: lowerCamelCase (0-1 pt)
  - Ejemplos: `userName`, `fetchUserData()`
- [ ] **Constantes**: lowerCamelCase (0-1 pt)
  - Ejemplos: `maxRetries`, `defaultTimeout`
- [ ] **Archivos**: snake_case (0-1 pt)
  - Ejemplos: `user_profile.dart`, `authentication_bloc.dart`
- [ ] **Packages**: snake_case (0-1 pt)
  - Verificar `pubspec.yaml`
- [ ] **Nombres descriptivos**: Evitar abreviaciones crípticas (0-1 pt)

#### 2.2 Linting y análisis estático (7 puntos)
- [ ] **analysis_options.yaml** configurado con reglas estrictas (0-2 pts)
  - Incluir `flutter_lints` o `very_good_analysis`
  - Reglas personalizadas activadas
- [ ] **Ningún warning** en `flutter analyze` (0-3 pts)
  - Ejecutar: `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter analyze`
- [ ] **Ninguna violación** de `prefer_const_constructors`, `unnecessary_null_in_if_null_operators` (0-2 pts)

#### 2.3 Principios KISS, DRY, YAGNI (6 puntos)
- [ ] **KISS (Keep It Simple)**: Métodos < 50 líneas (0-2 pts)
  - Sin lógica compleja innecesaria
  - Un nivel de abstracción por método
- [ ] **DRY (Don't Repeat Yourself)**: Sin código duplicado (0-2 pts)
  - Utilidades comunes en `/core/utils/`
  - Widgets reutilizables extraídos
- [ ] **YAGNI (You Ain't Gonna Need It)**: Sin sobre-ingeniería (0-2 pts)
  - Sin código "por si acaso"
  - Abstracciones justificadas

#### 2.4 Documentación y comentarios (3 puntos)
- [ ] **Clases públicas** documentadas con `///` (0-1 pt)
- [ ] **Métodos complejos** con comentarios explicativos (0-1 pt)
- [ ] **Sin código comentado** en producción (0-1 pt)
  - Utilizar git para el historial

#### 2.5 Gestión de errores (3 puntos)
- [ ] **Try-catch** apropiados con logging (0-1 pt)
- [ ] **Tipos de error** específicos (no solo `catch (e)`) (0-1 pt)
- [ ] **Sin print()** en producción (utilizar logger) (0-1 pt)

### Paso 3: Cálculo del score

```
SCORE CALIDAD CÓDIGO = Total de puntos / 25

Interpretación:
✅ 20-25 pts: Calidad excelente
⚠️ 15-19 pts: Calidad correcta, mejoras recomendadas
⚠️ 10-14 pts: Calidad a mejorar
❌ 0-9 pts: Calidad problemática
```

### Paso 4: Reporte detallado

Genera un reporte con:

#### 📊 SCORE CALIDAD CÓDIGO: XX/25

#### ✅ Puntos fuertes
- Convenciones bien respetadas
- Ejemplos de código limpio y legible

#### ⚠️ Puntos de atención
- Violaciones menores detectadas con archivos
- Sugerencias de mejora

#### ❌ Violaciones críticas
- Problemas de nomenclatura
- Código duplicado o demasiado complejo
- Warnings no resueltos

#### 📝 Ejemplos de código a mejorar

```dart
// ❌ Malo
var d = DateTime.now(); // Nombre críptico
void doStuff() { ... } // Demasiado vago

// ✅ Bueno
final currentDate = DateTime.now();
void authenticateUser() { ... }
```

#### 🎯 TOP 3 ACCIONES PRIORITARIAS

1. **[PRIORIDAD ALTA]** Resolver los warnings de `flutter analyze` (Impacto: mantenibilidad)
2. **[PRIORIDAD MEDIA]** Refactorizar métodos > 50 líneas (Impacto: legibilidad)
3. **[PRIORIDAD BAJA]** Documentar clases públicas faltantes (Impacto: API)

---

**Nota**: Este reporte se concentra únicamente en la calidad del código. Para una auditoría completa, utiliza `/check-compliance`.
