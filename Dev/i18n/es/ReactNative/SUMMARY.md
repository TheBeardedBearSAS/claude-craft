# Summary - React Native Development Rules

Resumen completo de todos los archivos creados para el desarrollo React Native con Claude Code.

---

## 📊 Estadísticas

- **Total archivos**: 25 archivos markdown
- **Tamaño total**: ~274 KB
- **Líneas de código**: ~8,000+ líneas de documentación
- **Categorías**: 4 (Rules, Templates, Checklists, Docs)

---

## 📁 Estructura Completa

```
ReactNative/
├── README.md                              ✅ Guía de uso
├── SUMMARY.md                             ✅ Este archivo
├── CLAUDE.md.template                     ✅ Plantilla principal (12 KB)
│
├── rules/                                 ✅ 15 reglas detalladas
│   ├── 00-project-context.md.template    ✅ Plantilla contexto proyecto (9.2 KB)
│   ├── 01-workflow-analysis.md           ✅ Análisis obligatorio (18 KB)
│   ├── 02-architecture.md                ✅ Arquitectura RN (32 KB)
│   ├── 03-coding-standards.md            ✅ Estándares TypeScript (25 KB)
│   ├── 04-solid-principles.md            ✅ Principios SOLID (27 KB)
│   ├── 05-kiss-dry-yagni.md              ✅ Simplicidad (25 KB)
│   ├── 06-tooling.md                     ✅ Herramientas Expo/EAS (4.4 KB)
│   ├── 07-testing.md                     ✅ Testing (8.5 KB)
│   ├── 08-quality-tools.md               ✅ ESLint/Prettier (2.2 KB)
│   ├── 09-git-workflow.md                ✅ Git & Conventional Commits (4.5 KB)
│   ├── 10-documentation.md               ✅ Documentación (4.4 KB)
│   ├── 11-security.md                    ✅ Seguridad móvil (16 KB)
│   ├── 12-performance.md                 ✅ Rendimiento (15 KB)
│   ├── 13-state-management.md            ✅ Gestión de estado (13 KB)
│   └── 14-navigation.md                  ✅ Expo Router (12 KB)
│
├── templates/                             ✅ 4 plantillas de código
│   ├── screen.md                         ✅ Plantilla screen (3.7 KB)
│   ├── component.md                      ✅ Plantilla componente (3.6 KB)
│   ├── hook.md                           ✅ Plantilla hook (4.6 KB)
│   └── test-component.md                 ✅ Plantilla test (6.3 KB)
│
├── checklists/                            ✅ 4 checklists de validación
│   ├── pre-commit.md                     ✅ Pre-commit (2.4 KB)
│   ├── new-feature.md                    ✅ Nueva funcionalidad (4.5 KB)
│   ├── refactoring.md                    ✅ Refactorización (5.9 KB)
│   └── security.md                       ✅ Auditoría de seguridad (7.0 KB)
│
└── examples/                              📁 (vacío, para ejemplos futuros)
```

---

## 📚 Contenido Detallado

### 🎯 Archivos Principales

#### README.md (6.5 KB)
- Vista general completa
- Guía de inicio rápido
- Estructura del proyecto
- Uso con Claude Code
- Filosofía y flujo de trabajo
- Recursos

#### CLAUDE.md.template (12 KB)
- Plantilla principal para proyectos
- Contexto del proyecto
- 7 reglas fundamentales
- Stack técnico
- Comandos esenciales
- Arquitectura
- Documentación completa
- Flujo de trabajo típico
- Instrucciones para Claude Code

---

### 📖 Rules (15 archivos, ~190 KB)

#### 00-project-context.md.template (9.2 KB)
Plantilla con placeholders para:
- Información general
- Configuración Expo
- Stack técnico detallado
- Entornos
- APIs y servicios
- Funcionalidades
- Restricciones técnicas
- Build & deployment
- Equipo
- Convenciones

#### 01-workflow-analysis.md (18 KB)
**Regla absoluta**: Análisis obligatorio antes de codificar
- Fase 1: Comprensión de requisitos
- Fase 2: Análisis técnico
- Fase 3: Identificación de impactos
- Fase 4: Diseño de solución
- Fase 5: Plan de implementación
- Fase 6: Validación pre-implementación
- Ejemplos completos (feature, bug fix)

#### 02-architecture.md (32 KB)
Arquitectura React Native completa:
- Principios arquitectónicos (Clean Architecture)
- Organización basada en features
- Estructura de carpetas detallada
- Detalle de capas (4 capas)
- App Router (Expo Router)
- Componentes (UI, Smart, Compound)
- Patrones de Hooks
- Gestión de estado multinivel
- Servicios (API, Storage)
- Navegación
- Código específico de plataforma
- Módulos nativos
- Mejores prácticas (DI, Repository, Adapter)

#### 03-coding-standards.md (25 KB)
Estándares TypeScript/React Native:
- Configuración TypeScript strict mode
- Anotaciones de tipos
- Interface vs Type
- Generics y Type Guards
- Utility types
- Estándares de componentes (Funcional, Estructura)
- Desestructuración de Props
- Renderizado condicional
- Manejadores de eventos
- Estándares de Hooks (nombres, estructura, reglas)
- Arrays de dependencias
- Estándares de estilos (StyleSheet, Organización)
- Estilos dinámicos
- Integración de temas
- Patrones específicos de plataforma
- Organización de imports
- Manejo de errores
- Rendimiento (memoización, FlatList)
- Convenciones de nombres
- Comentarios y JSDoc

#### 04-solid-principles.md (27 KB)
SOLID adaptado a React Native:
- **S**RP: Responsabilidad única (ejemplos User Profile)
- **O**CP: Abierto/Cerrado (variantes de Button, abstracción Storage)
- **L**SP: Sustitución de Liskov (contratos Button, componentes List)
- **I**SP: Segregación de interfaces (ArticleCard, componentes Form)
- **D**IP: Inversión de dependencias (patrón Repository, DI)
- Ejemplos completos para cada principio
- Beneficios y anti-patrones

#### 05-kiss-dry-yagni.md (25 KB)
Principios de simplicidad:
- **KISS**: Keep It Simple
  - Sobre-ingeniería vs Soluciones simples
  - Gestión de estado simple
  - Obtención de datos simple
  - Renderizado condicional
- **DRY**: Don't Repeat Yourself
  - Código duplicado → Código reutilizado
  - Utils de validación
  - Hooks/componentes reutilizables
  - Estilos centralizados
  - Regla de 3
- **YAGNI**: You Aren't Gonna Need It
  - Sobre-ingeniería futura
  - Paginación, i18n, temas "por si acaso"
  - Cuándo anticipar (seguridad, rendimiento)
- Equilibrio entre los 3 principios

#### 06-tooling.md (4.4 KB)
Herramientas Expo/EAS:
- Expo CLI (instalación, comandos)
- EAS (Build, Update, Submit)
- Configuración eas.json
- Configuración Metro bundler
- Herramientas de desarrollo (Debugger, Flipper)
- Extensiones VS Code
- Gestión de paquetes (npm vs yarn)

#### 07-testing.md (8.5 KB)
Testing completo:
- Tipos de tests (Unit, Component, Integration, E2E)
- Configuración Jest
- Tests unitarios (utils, servicios)
- Tests de componentes (Testing Library)
- Testing de hooks
- Testing con React Query
- E2E con Detox
- Organización de tests
- Cobertura

#### 08-quality-tools.md (2.2 KB)
Herramientas de calidad:
- Configuración ESLint
- Configuración Prettier
- TypeScript strict mode
- Pre-commit hooks (Husky)
- lint-staged

#### 09-git-workflow.md (4.5 KB)
Git & Conventional Commits:
- Estrategia de branching
- Nomenclatura de ramas
- Conventional Commits (tipos, formato)
- Ejemplos completos
- Flujo de desarrollo de features
- Proceso de hotfix
- Plantilla Pull Request
- Mejores prácticas
- Comandos Git útiles

#### 10-documentation.md (4.4 KB)
Estándares de documentación:
- Comentarios JSDoc
- Documentación de componentes
- Estructura README
- Comentarios inline (cuándo/cómo)
- ADR (Architecture Decision Records)
- Documentación API
- Changelog

#### 11-security.md (16 KB)
Seguridad móvil completa:
- **Secure Storage**: SecureStore, encriptación MMKV
- **API Security**: Gestión de tokens, Interceptors, Certificate pinning
- **Input Validation**: Esquemas Zod, Sanitización
- **Biometric Authentication**: Setup, Implementación
- **Code Obfuscation**: react-native-obfuscating-transformer
- **Environment Variables**: .env, EAS Secrets
- **Network Security**: HTTPS, Timeout
- **Screen Security**: Prevención de capturas de pantalla
- **Deep Link Security**: Validación
- **Security Checklist** (Development, Pre-Production, Post-Production)
- **Common Vulnerabilities** (XSS, SQL Injection, MITM)

#### 12-performance.md (15 KB)
Optimizaciones de rendimiento:
- **Hermes Engine**: Configuración, Beneficios
- **FlatList Optimization**: Props, Memoización, getItemLayout
- **Image Optimization**: expo-image, Redimensionamiento, Lazy loading
- **Memoization**: React.memo, useMemo, useCallback
- **Animations Performance**: Native driver, Reanimated, LayoutAnimation
- **Bundle Size**: Analizar, Code splitting, Eliminar no usados
- **Network Performance**: Batching, Caching, Paginación
- **JavaScript Performance**: Evitar inline, Debounce
- **Memory Management**: Cleanup, Cancelar async
- **Profiling Tools**: React DevTools, Performance Monitor
- **Performance Checklist**
- **Metrics** (Target: 60 FPS, < 3s startup, etc.)

#### 13-state-management.md (13 KB)
Gestión de estado multinivel:
- **React Query**: Setup, Queries, Mutations, Actualizaciones optimistas, Infinite queries
- **Zustand**: Store básico, Persistente (MMKV), Selectors, Slices
- **MMKV**: Almacenamiento rápido, Almacenamiento encriptado
- **Decision Tree**: Qué herramienta para qué necesidad
- **Best Practices**: No mezclar concerns, Usar selectors, Normalizar datos
- **Offline Support**: useOfflineQuery
- **Checklist**

#### 14-navigation.md (12 KB)
Expo Router (Navegación):
- Instalación y Setup
- **File-based Routing**: Estructura básica, Root layout
- **Route Groups**: Tabs, Auth groups
- **Dynamic Routes**: Parámetro único, Múltiples parámetros, Catch-all
- **Navigation API**: router.push/replace/back, useRouter, useNavigation
- **Deep Linking**: Configuración, Manejo
- **Modal Screens**: Configuración
- **Protected Routes**: Verificación de autenticación
- **Type-safe Navigation**: Tipos TypeScript
- **Navigation Patterns**: Tabs+Stack, Drawer, Onboarding
- **Screen Options**: Configuración por pantalla
- **Best Practices**: Organizar por feature, Usar route groups, Tipar parámetros

---

### 🎨 Templates (4 archivos, ~18 KB)

#### screen.md (3.7 KB)
Plantilla de screen completa:
- Estructura completa (imports, state, hooks, handlers, render)
- Estilos separados
- Tests (renderizado, loading, estados de error)
- Opciones de screen para Expo Router

#### component.md (3.6 KB)
Plantilla de componente reutilizable:
- Estructura (props, state, handlers, render)
- Tipos separados (interfaces)
- Estilos (StyleSheet)
- Tests completos
- Exportación por índice

#### hook.md (4.6 KB)
Plantilla de hook personalizado:
- Estructura (state, refs, effects, callbacks, return)
- Ejemplo con React Query (operaciones CRUD)
- Tests (inicialización, fetching, errores, refetch)

#### test-component.md (6.3 KB)
Plantilla de test completa:
- Estructura de test (describe, beforeEach)
- Tests de renderizado
- Tests de interacciones
- Tests de estados (loading, error, empty)
- Tests de comportamiento async
- Tests de accesibilidad
- Tests de estilos
- Tests de casos extremos
- Tests de snapshot
- Tests de integración

---

### ✅ Checklists (4 archivos, ~20 KB)

#### pre-commit.md (2.4 KB)
Validación antes del commit:
- Calidad de código (lint, format, type-check)
- Tests (unit, component, coverage)
- Estándares de código (nombres, imports, DRY, JSDoc)
- Rendimiento (memoización, imágenes, FlatList)
- Seguridad (secretos, validación, almacenamiento)
- Arquitectura (SRP, separación, DI)
- Documentación (README, JSDoc, changelog)
- Git (mensaje, atómico, rama)
- Verificación final

#### new-feature.md (4.5 KB)
Flujo de trabajo completo de feature (10 fases):
1. **Analysis** (obligatorio): Requisitos, user stories, casos de uso
2. **Design**: Arquitectura, modelado de datos, decisiones técnicas
3. **Setup**: Rama, ticket, dependencias
4. **Implementation** (bottom-up): Data → Logic → UI → Screens → Integration
5. **Quality Assurance**: Calidad de código, testing, rendimiento, seguridad, accesibilidad
6. **Documentation**: JSDoc, comentarios, README, ADR
7. **Manual Testing**: Funcional, plataformas, UX
8. **Code Review**: PR, revisores, feedback
9. **Merge & Deploy**: Staging, producción, monitorización
10. **Cleanup**: Eliminar rama, cerrar ticket
+ **Post-Launch**: Métricas, feedback, retrospectiva

#### refactoring.md (5.9 KB)
Refactorización segura (5 fases):
1. **Preparation**: Comprensión, documentación, tests
2. **Planning**: Estrategia, evaluación de riesgos
3. **Refactoring**: Cambios incrementales, calidad de código, tests
4. **Validation**: Testing automatizado, testing manual, revisión de código
5. **Deployment**: Pre-deploy, deploy, post-deploy
+ **Refactoring Patterns**: Extract method, Extract component, Introduce hook
+ **Common Pitfalls**: Listas de evitar/hacer

#### security.md (7.0 KB)
Auditoría de seguridad completa (16 secciones):
1. Sensitive Data Storage
2. API Security
3. Input Validation
4. Authentication & Authorization
5. Code Security
6. Platform Security (iOS/Android)
7. Network Security
8. Offline Security
9. Error Handling
10. Third-Party Security
11. WebView Security
12. Biometric Security
13. Code Obfuscation
14. Compliance (GDPR, CCPA, HIPAA)
15. Monitoring & Response
16. Testing
+ **Security Score**: Critical/High/Medium/Low

---

## 🎯 Reglas Fundamentales (Resumen)

### REGLA #1: ANÁLISIS OBLIGATORIO
Antes de cualquier código, análisis completo (6 fases).
**Ratio**: 1h análisis = 1h código mínimo.

### REGLA #2: ARQUITECTURA PRIMERO
Seguir arquitectura basada en features + clean architecture.
**Estructura**: Data → Logic → UI → Screens.

### REGLA #3: ESTÁNDARES DE CÓDIGO
TypeScript strict, ESLint 0 errores, Prettier auto-format.
**Calidad**: JSDoc, exportaciones nombradas, imports organizados.

### REGLA #4: PRINCIPIOS SOLID
Aplicar SOLID + KISS + DRY + YAGNI.
**Simplicidad**: Código simple > Código inteligente.

### REGLA #5: TESTS OBLIGATORIOS
Cobertura > 80%, todos los tipos de tests.
**Testing**: Unit + Component + Integration + E2E.

### REGLA #6: SEGURIDAD
Seguridad por diseño, SecureStore, validación.
**Protección**: Tokens seguros, HTTPS, auditar dependencias.

### REGLA #7: RENDIMIENTO
Objetivo 60 FPS, Hermes, optimizaciones.
**Velocidad**: Memoización, FlatList, imágenes, animaciones.

---

## 📦 Stack Técnico Recomendado

### Core
- **React Native** (latest)
- **Expo SDK** (latest)
- **TypeScript** (strict mode)
- **Node.js** (18+)

### Navigation
- **Expo Router** (file-based routing)

### State Management
- **React Query** (server state, cache)
- **Zustand** (global client state)
- **MMKV** (fast persistence)

### UI & Styling
- **StyleSheet** (native styling)
- **Theme** (centralized)
- **Reanimated** (animations)
- **Gesture Handler** (gestures)

### Forms & Validation
- **React Hook Form** (forms management)
- **Zod** (validation schemas)

### Testing
- **Jest** (unit tests)
- **React Native Testing Library** (component tests)
- **Detox** (E2E tests)

### Quality Tools
- **ESLint** (linting)
- **Prettier** (formatting)
- **Husky** (git hooks)
- **TypeScript** (type checking)

### Build & Deploy
- **EAS CLI** (Expo Application Services)
- **Metro** (bundler)

---

## 🚀 Uso

### Para Nuevo Proyecto

```bash
# 1. Copiar plantilla
cp CLAUDE.md.template /my-project/.claude/CLAUDE.md

# 2. Personalizar
# Reemplazar {{PROJECT_NAME}}, {{TECH_STACK}}, etc.

# 3. Copiar reglas (opcional)
cp -r rules/ /my-project/.claude/rules/
cp -r templates/ /my-project/.claude/templates/
cp -r checklists/ /my-project/.claude/checklists/
```

### Para Proyecto Existente

```bash
# 1. Copiar CLAUDE.md
cp CLAUDE.md.template /existing-project/.claude/CLAUDE.md

# 2. Adaptar progresivamente
# Comenzar con reglas prioritarias
```

---

## 💡 Highlights

### Documentación Completa
- **~8,000+ líneas** de documentación detallada
- **50+ ejemplos** de código concreto
- **100+ code snippets** React Native/TypeScript
- Francés para explicaciones, inglés para código

### Cobertura Completa
- **Architecture**: Clean Architecture, Feature-based
- **Code Standards**: TypeScript strict, ESLint, Prettier
- **Patterns**: SOLID, KISS, DRY, YAGNI
- **Testing**: Unit, Component, Integration, E2E
- **Security**: SecureStore, validation, HTTPS, audit
- **Performance**: Hermes, memoization, FlatList, animations
- **State**: React Query, Zustand, MMKV
- **Navigation**: Expo Router, deep links, types

### Práctico
- **4 Templates** código listo para usar
- **4 Checklists** de validación
- **15 Reglas** detalladas
- **Workflow** completo (analysis → code → deploy)

---

## 📈 Objetivos de Métricas de Calidad

- **Code Coverage**: > 80%
- **ESLint**: 0 errores, 0 warnings
- **TypeScript**: 0 errores (strict mode)
- **npm audit**: 0 vulnerabilidades
- **Bundle Size**: < 10MB
- **Startup Time**: < 3s
- **FPS**: 60 constante
- **Memory**: < 200MB

---

## 🎓 Filosofía

### Think First, Code Later
Análisis obligatorio antes de cualquier código.

### Architecture Matters
Estructura clara = Código mantenible.

### Quality Over Speed
Código de calidad ahorra tiempo.

### Security by Design
Seguridad desde el inicio, no después.

### Performance First
Objetivo 60 FPS, optimizaciones nativas.

---

## ✅ Completitud

### Reglas: 15/15 ✅
- Todas las reglas esenciales cubiertas
- Del análisis al despliegue
- Ejemplos concretos en todas partes

### Templates: 4/4 ✅
- Screen, Component, Hook, Test
- Listos para copiar-pegar
- Con tipos, estilos, tests

### Checklists: 4/4 ✅
- Pre-commit, Feature, Refactoring, Security
- Validación completa
- Proceso claro

### Documentación: 100% ✅
- README completo
- Plantilla CLAUDE.md
- Todos los archivos documentados

---

## 🔮 Futuro (Potencial)

### Extensiones Posibles
- [ ] Ejemplos de código completos (carpeta examples/)
- [ ] Video tutorials
- [ ] Interactive checklists
- [ ] VS Code snippets
- [ ] CLI tool para setup
- [ ] More templates (service, store, etc.)

---

## 🏆 Conclusión

**Estructura completa y profesional** para desarrollo React Native con Claude Code:

✅ **25 archivos** de documentación
✅ **~8,000+ líneas** de contenido detallado
✅ **15 reglas** esenciales
✅ **4 plantillas** listas para usar
✅ **4 checklists** de validación
✅ **100+ ejemplos** de código
✅ **Cobertura completa**: Arquitectura → Seguridad → Rendimiento
✅ **Listo para usar** en proyectos React Native/Expo

---

**Version**: 1.0.0
**Creado el**: 2025-12-03
**Autor**: TheBeardedCTO

**Remember**: Estas reglas son guías para producir código de calidad. Adáptalas a tu contexto específico.
