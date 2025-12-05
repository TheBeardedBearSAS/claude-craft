# Índice Completo - Reglas de Desarrollo Flutter

## Visión General

Estructura completa de reglas de desarrollo Flutter para Claude Code, inspirada en la estructura Symfony pero adaptada a Flutter/Dart.

**Total**: 26 archivos
- 1 CLAUDE.md.template principal
- 1 README guía de uso
- 14 archivos de reglas (rules/)
- 5 plantillas de código (templates/)
- 4 listas de verificación (checklists/)
- 1 índice (este archivo)

---

## Archivos Principales

### CLAUDE.md.template
Archivo principal para copiar en cada proyecto Flutter. Contiene:
- Contexto del proyecto
- Reglas fundamentales
- Flujo de trabajo obligatorio
- Comandos Makefile
- Instrucciones para Claude

### README.md
Guía de uso completa:
- Cómo inicializar un nuevo proyecto
- Estructura recomendada
- Flujo de trabajo de desarrollo
- Configuración de herramientas

---

## Reglas (14 archivos)

### 00-project-context.md.template
Plantilla de contexto del proyecto con placeholders:
- Visión general del proyecto
- Arquitectura global
- Stack tecnológico
- Especificidades y convenciones
- Variables a reemplazar: {{PROJECT_NAME}}, {{TECH_STACK}}, etc.

### 01-workflow-analysis.md (27 KB)
Metodología obligatoria antes de codificar:
- Fase 1: Comprensión de la necesidad
- Fase 2: Exploración del código existente
- Fase 3: Diseño de la solución
- Fase 4: Plan de pruebas
- Fase 5: Estimación y planificación
- Fase 6: Revisión post-implementación
- Plantillas de análisis
- Ejemplos concretos (feature favoritos)

### 02-architecture.md (53 KB)
Clean Architecture para Flutter:
- Las 3 capas (Domain, Data, Presentation)
- Estructura detallada de carpetas
- Entities, Repositories, Use Cases
- Models, DataSources
- Patrón BLoC completo
- Inyección de Dependencias
- Ejemplos de código completos

### 03-coding-standards.md (24 KB)
Estándares de código Dart/Flutter:
- Convenciones de nomenclatura
- Formato y estilo
- Organización del código
- Widgets Flutter (const, extracción)
- Tipos e inferencia
- Documentación (dartdoc)
- Extensiones Dart
- Async/await
- Configuración de linters

### 04-solid-principles.md (38 KB)
Principios SOLID con ejemplos Flutter:
- S - Principio de Responsabilidad Única
- O - Principio Abierto/Cerrado
- L - Principio de Sustitución de Liskov
- I - Principio de Segregación de Interfaces
- D - Principio de Inversión de Dependencias
- Ejemplos concretos para cada principio
- Widgets, BLoCs, repositorios
- Diagramas de dependencias

### 05-kiss-dry-yagni.md (30 KB)
Principios de simplicidad:
- KISS: Keep It Simple, Stupid
- DRY: Don't Repeat Yourself
- YAGNI: You Aren't Gonna Need It
- Ejemplos de sobre-complicación vs soluciones simples
- Gestión de estado adaptada a la complejidad
- Widgets reutilizables
- Equilibrio entre principios

### 06-tooling.md (10 KB)
Herramientas y comandos:
- Flutter CLI esenciales
- Comandos Pub
- Docker para Flutter
- Makefile completo
- FVM (Flutter Version Management)
- Scripts útiles
- CI/CD (GitHub Actions, GitLab CI)
- Configuración VS Code
- DevTools

### 07-testing.md (19 KB)
Estrategia de pruebas completa:
- Pirámide de pruebas (70% unit, 20% widget, 10% integration)
- Pruebas unitarias (entities, use cases, BLoCs)
- Pruebas de widgets
- Pruebas de integración
- Pruebas Golden
- Mocking con Mocktail
- Cobertura de pruebas
- Buenas prácticas (patrón AAA)

### 08-quality-tools.md
Herramientas de calidad:
- Dart Analyze
- DCM (Dart Code Metrics)
- Very Good Analysis
- Flutter Lints
- Reglas de lint personalizadas
- Integración CI/CD
- Targets Makefile

### 09-git-workflow.md
Flujo de trabajo Git:
- Conventional Commits
- Estrategia de ramas (GitFlow)
- Pre-commit hooks
- CI/CD
- Comandos Git útiles

### 10-documentation.md
Estándares de documentación:
- Formato Dartdoc
- Estructura README.md
- CHANGELOG.md
- Documentación API
- Ejemplos de documentación completa

### 11-security.md
Seguridad Flutter:
- flutter_secure_storage
- Gestión de API keys
- Variables de entorno
- Ofuscación
- HTTPS y certificate pinning
- Validación de entradas
- Autenticación (JWT)
- Permisos
- Lista de verificación de seguridad

### 12-performance.md
Optimización de rendimiento:
- widgets const
- Optimización de ListView
- Imágenes (caching, lazy loading)
- Evitar rebuilds
- Profiling con DevTools
- Lazy loading & code splitting
- Lista de verificación de rendimiento

### 13-state-management.md
Patrones de gestión de estado:
- Árbol de decisión (cuándo usar qué)
- StatefulWidget
- ValueNotifier
- Provider
- Riverpod (recomendado)
- BLoC (recomendado para apps complejas)
- Comparación de patrones
- Mejores prácticas
- Recomendaciones por tamaño de proyecto

---

## Plantillas (5 archivos)

### widget.md
Plantillas de widgets:
- Stateless Widget
- Stateful Widget
- Consumer Widget (BLoC)

### bloc.md
Plantilla BLoC completa:
- Events
- States
- Clase BLoC

### repository.md
Plantilla Repository:
- Interfaz (capa Domain)
- Implementación (capa Data)

### test-widget.md
Plantilla de pruebas de widgets:
- Configuración básica
- Pruebas de visualización
- Pruebas de interacciones
- Pruebas de actualización

### test-unit.md
Plantilla de pruebas unitarias:
- Configuración con mocks
- Pruebas de éxito
- Pruebas de error
- Pruebas de validación

---

## Listas de Verificación (4 archivos)

### pre-commit.md
Lista de verificación pre-commit:
- Calidad de código
- Pruebas
- Documentación
- Git
- Arquitectura
- Rendimiento
- Seguridad

### new-feature.md
Lista de verificación nueva funcionalidad:
- Análisis
- Capa Domain
- Capa Data
- Capa Presentation
- Integración
- Documentación
- Calidad

### refactoring.md
Lista de verificación refactorización segura:
- Preparación
- Durante la refactorización
- Verificaciones
- Antes del merge

### security.md
Lista de verificación auditoría de seguridad:
- Datos sensibles
- API & Red
- Autenticación
- Validación
- Permisos
- Producción

---

## Estadísticas

### Tamaño de archivos

| Archivo | Tamaño | Líneas aprox. |
|---------|--------|---------------|
| 01-workflow-analysis.md | 27 KB | ~800 |
| 02-architecture.md | 53 KB | ~1600 |
| 03-coding-standards.md | 24 KB | ~700 |
| 04-solid-principles.md | 38 KB | ~1200 |
| 05-kiss-dry-yagni.md | 30 KB | ~900 |
| 06-tooling.md | 10 KB | ~300 |
| 07-testing.md | 19 KB | ~600 |
| 08-quality-tools.md | ~5 KB | ~150 |
| 09-git-workflow.md | ~4 KB | ~120 |
| 10-documentation.md | ~5 KB | ~150 |
| 11-security.md | ~6 KB | ~180 |
| 12-performance.md | ~5 KB | ~150 |
| 13-state-management.md | ~7 KB | ~210 |
| **TOTAL Reglas** | **~233 KB** | **~7060 líneas** |

### Cobertura

**Temas cubiertos**:
- ✅ Arquitectura (Clean Architecture completa)
- ✅ Estándares de código (Effective Dart)
- ✅ Principios de diseño (SOLID, KISS, DRY, YAGNI)
- ✅ Pruebas (Unit, Widget, Integration, Golden)
- ✅ Herramientas (CLI, Docker, Makefile, CI/CD)
- ✅ Calidad (Analyze, Linters, Metrics)
- ✅ Flujo de trabajo Git (Conventional Commits, Branching)
- ✅ Documentación (Dartdoc, README, CHANGELOG)
- ✅ Seguridad (Storage, API keys, HTTPS, Auth)
- ✅ Rendimiento (Optimizaciones, Profiling)
- ✅ Gestión de estado (BLoC, Riverpod, Provider)
- ✅ Plantillas de código
- ✅ Listas de verificación prácticas

---

## Uso

### Para un nuevo proyecto

1. Copiar `CLAUDE.md.template` en `.claude/CLAUDE.md`
2. Copiar `rules/`, `templates/`, `checklists/` en `.claude/`
3. Personalizar con información del proyecto
4. Crear `Makefile` en la raíz
5. Configurar `analysis_options.yaml`
6. ¡Seguir las reglas!

### Para Claude Code

Leer `.claude/CLAUDE.md` al inicio de cada sesión para:
- Comprender la arquitectura del proyecto
- Conocer las convenciones
- Aplicar las mejores prácticas
- Usar las plantillas apropiadas
- Seguir las listas de verificación

---

## Comparación con Reglas Symfony

### Similitudes
- Estructura modular (rules/, templates/, checklists/)
- Flujo de trabajo de análisis obligatorio
- Principios SOLID
- Estrategia de pruebas
- Flujo de trabajo Git
- Estándares de documentación

### Especificidades Flutter
- Clean Architecture (en lugar de arquitectura Symfony)
- Composición de Widgets
- Gestión de estado (BLoC, Riverpod)
- Optimizaciones const
- Profiling con DevTools
- flutter_secure_storage
- Material Design / Cupertino

### Mejoras
- Plantillas de código más detalladas
- Más ejemplos
- Listas de verificación más completas
- Árboles de decisión (gestión de estado, arquitectura)
- Diagramas de dependencias

---

## Mantenimiento

### Actualización

Actualizar las reglas cuando:
- Nueva versión de Flutter/Dart
- Nuevas mejores prácticas
- Nuevos paquetes importantes
- Retroalimentación del proyecto

### Versionado

Formato: `MAJOR.MINOR.PATCH`
- MAJOR: Cambio de arquitectura o principios
- MINOR: Adición de reglas o plantillas
- PATCH: Correcciones y aclaraciones

**Versión actual**: 1.0.0

---

## Recursos Adicionales

### Documentación
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Paquetes Esenciales
- flutter_bloc: Gestión de estado
- riverpod: Gestión de estado
- freezed: Generación de código
- dartz: Programación funcional
- get_it: Inyección de dependencias
- dio: Cliente HTTP
- mocktail: Pruebas

---

**Creado el**: 2024-12-03
**Última actualización**: 2024-12-03
**Versión**: 1.0.0
**Autor**: Claude Code Assistant
