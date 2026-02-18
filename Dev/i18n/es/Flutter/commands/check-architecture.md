---
description: Verificación Arquitectura Flutter
argument-hint: [arguments]
---

# Verificación Arquitectura Flutter

## Argumentos

$ARGUMENTS

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en Flutter encargado de auditar la arquitectura del proyecto según los principios de Clean Architecture.

### Paso 1: Análisis de la estructura del proyecto

- [ ] Identificar la estructura de carpetas del proyecto
- [ ] Localizar los archivos `pubspec.yaml` y `analysis_options.yaml`
- [ ] Referenciar las reglas desde `/rules/02-architecture.md`
- [ ] Referenciar los principios SOLID desde `/rules/04-solid-principles.md`

### Paso 2: Verificaciones Arquitectura (25 puntos)

#### 2.1 Organización en capas Clean Architecture (10 puntos)
- [ ] **Domain Layer**: Entidades y casos de uso aislados (0-4 pts)
  - Verificar `lib/domain/entities/` y `lib/domain/usecases/`
  - Ninguna dependencia hacia data o presentation
  - Entidades puras con lógica de negocio únicamente
- [ ] **Data Layer**: Repositories, DataSources, Models (0-3 pts)
  - Verificar `lib/data/repositories/`, `lib/data/datasources/`, `lib/data/models/`
  - Implementación de las interfaces del domain
  - Separación remote/local datasources
- [ ] **Presentation Layer**: UI, States, BLoCs/Providers (0-3 pts)
  - Verificar `lib/presentation/pages/`, `lib/presentation/widgets/`, `lib/presentation/blocs/`
  - Separación lógica UI/Business logic
  - Widgets reutilizables en `/widgets/common/`

#### 2.2 Inyección de dependencias (5 puntos)
- [ ] **Container DI** configurado (get_it, injectable, riverpod) (0-3 pts)
- [ ] **No new()** directo en los widgets (0-2 pts)
- [ ] Todas las dependencias inyectadas vía constructor

#### 2.3 Separación de responsabilidades (5 puntos)
- [ ] **Single Responsibility**: Una clase = una responsabilidad (0-2 pts)
- [ ] **Interface Segregation**: Interfaces pequeñas y especializadas (0-2 pts)
- [ ] **Dependency Inversion**: Depende de abstracciones, no implementaciones (0-1 pt)

#### 2.4 Estructura modular (5 puntos)
- [ ] **Features aisladas**: Código organizado por funcionalidad (0-2 pts)
- [ ] **Core/Shared**: Utilidades comunes separadas (0-2 pts)
- [ ] **Sin acoplamiento** entre features (0-1 pt)

### Paso 3: Cálculo del score

```
SCORE ARQUITECTURA = Total de puntos / 25

Interpretación:
✅ 20-25 pts: Arquitectura excelente
⚠️ 15-19 pts: Arquitectura correcta, mejoras recomendadas
⚠️ 10-14 pts: Arquitectura a mejorar
❌ 0-9 pts: Arquitectura problemática
```

### Paso 4: Reporte detallado

Genera un reporte con:

#### 📊 SCORE ARQUITECTURA: XX/25

#### ✅ Puntos fuertes
- Lista de buenas prácticas detectadas
- Ejemplos de código bien estructurado

#### ⚠️ Puntos de atención
- Violaciones detectadas con archivos y líneas
- Impacto en la mantenibilidad

#### ❌ Violaciones críticas
- Problemas arquitecturales mayores
- Acoplamiento fuerte, dependencias circulares

#### 🎯 TOP 3 ACCIONES PRIORITARIAS

1. **[PRIORIDAD ALTA]** Acción más importante con impacto y esfuerzo estimado
2. **[PRIORIDAD MEDIA]** Segunda acción con justificación
3. **[PRIORIDAD BAJA]** Tercera acción para mejora continua

---

**Nota**: Este reporte se concentra únicamente en la arquitectura. Para una auditoría completa, utiliza `/check-compliance`.
