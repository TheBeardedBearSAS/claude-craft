# React Native Development Rules for Claude Code

Reglas de desarrollo completas para React Native (TypeScript + Expo) destinadas a Claude Code.

---

## 📁 Estructura

```
ReactNative/
├── README.md                           # Este archivo
├── CLAUDE.md.template                  # Template principal para proyectos
├── rules/                              # Reglas detalladas (15 archivos)
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-performance.md
│   ├── 13-state-management.md
│   └── 14-navigation.md
├── templates/                          # Templates de código
│   ├── screen.md
│   ├── component.md
│   ├── hook.md
│   └── test-component.md
└── checklists/                         # Checklists de validación
    ├── pre-commit.md
    ├── new-feature.md
    ├── refactoring.md
    └── security.md
```

---

## 🚀 Quick Start

### Para un Nuevo Proyecto

1. **Copiar el template**:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/.claude/CLAUDE.md
   ```

2. **Personalizar**:
   - Reemplazar `{{PROJECT_NAME}}` por el nombre del proyecto
   - Reemplazar `{{TECH_STACK}}` por el stack tecnológico
   - Completar la información específica

3. **Copiar las reglas** (opcional pero recomendado):
   ```bash
   cp -r rules/ /path/to/your/project/.claude/rules/
   cp -r templates/ /path/to/your/project/.claude/templates/
   cp -r checklists/ /path/to/your/project/.claude/checklists/
   ```

### Para un Proyecto Existente

1. **Adaptar progresivamente**:
   - Comenzar por CLAUDE.md
   - Añadir las reglas prioritarias
   - Integrar los checklists
   - Adoptar los templates

---

## 📚 Documentación

### Reglas por Categoría

#### Fundamentos
- **00-project-context**: Template de contexto del proyecto
- **01-workflow-analysis**: Proceso de análisis obligatorio
- **02-architecture**: Arquitectura React Native/Expo
- **03-coding-standards**: Estándares TypeScript/React Native

#### Principios de Diseño
- **04-solid-principles**: SOLID adaptado a React Native
- **05-kiss-dry-yagni**: Principios de simplicidad

#### Herramientas y Calidad
- **06-tooling**: Expo CLI, EAS, Metro
- **07-testing**: Jest, Testing Library, Detox
- **08-quality-tools**: ESLint, Prettier, TypeScript
- **09-git-workflow**: Git & Conventional Commits
- **10-documentation**: Estándares de documentación

#### Producción
- **11-security**: Seguridad móvil (SecureStore, etc.)
- **12-performance**: Optimizaciones (Hermes, FlatList, etc.)
- **13-state-management**: React Query, Zustand, MMKV
- **14-navigation**: Expo Router

---

## 🎯 Reglas Fundamentales

### REGLA #1: ANÁLISIS OBLIGATORIO
**Antes de cualquier código, análisis completo.**

Ver: [rules/01-workflow-analysis.md](./rules/01-workflow-analysis.md)

### REGLA #2: ARCHITECTURE FIRST
**Respetar la arquitectura establecida.**

Ver: [rules/02-architecture.md](./rules/02-architecture.md)

### REGLA #3: ESTÁNDARES DE CÓDIGO
**TypeScript strict, ESLint, Prettier.**

Ver: [rules/03-coding-standards.md](./rules/03-coding-standards.md)

### REGLA #4: PRINCIPIOS SOLID
**Aplicar SOLID, KISS, DRY, YAGNI.**

Ver: [rules/04-solid-principles.md](./rules/04-solid-principles.md)

### REGLA #5: TESTS OBLIGATORIOS
**Coverage > 80%.**

Ver: [rules/07-testing.md](./rules/07-testing.md)

### REGLA #6: SEGURIDAD
**Security by design.**

Ver: [rules/11-security.md](./rules/11-security.md)

### REGLA #7: RENDIMIENTO
**60 FPS target.**

Ver: [rules/12-performance.md](./rules/12-performance.md)

---

## 📋 Templates

### Screen Component
Template completo para crear una nueva pantalla con Expo Router.

Ver: [templates/screen.md](./templates/screen.md)

### Reusable Component
Template para componente reutilizable con tipos, estilos, tests.

Ver: [templates/component.md](./templates/component.md)

### Custom Hook
Template para custom hook con React Query o lógica personalizada.

Ver: [templates/hook.md](./templates/hook.md)

### Component Test
Template completo de tests para componentes.

Ver: [templates/test-component.md](./templates/test-component.md)

---

## ✅ Checklists

### Pre-Commit
Validación antes de cada commit.

Ver: [checklists/pre-commit.md](./checklists/pre-commit.md)

**Puntos clave**:
- Code lint (0 errors)
- Tests pasan
- Coverage mantenido
- Performance OK
- Security check

### New Feature
Workflow completo para nueva funcionalidad.

Ver: [checklists/new-feature.md](./checklists/new-feature.md)

**Fases**:
1. Analysis
2. Design
3. Setup
4. Implementation (bottom-up)
5. Quality Assurance
6. Documentation
7. Manual Testing
8. Code Review
9. Merge & Deploy
10. Cleanup

### Refactoring
Proceso seguro de refactoring.

Ver: [checklists/refactoring.md](./checklists/refactoring.md)

**Enfoque**:
- Tests antes
- Commits pequeños
- Tests continuamente
- Comportamiento preservado

### Security Audit
Auditoría de seguridad completa.

Ver: [checklists/security.md](./checklists/security.md)

**Áreas**:
- Sensitive data storage
- API security
- Input validation
- Authentication
- Dependencies

---

## 🛠 Stack Recomendado

### Core
- React Native
- Expo SDK
- TypeScript
- Node.js

### Navigation
- **Expo Router** (file-based routing)

### State Management
- **React Query** (server state)
- **Zustand** (global client state)
- **MMKV** (persistence)

### UI
- StyleSheet (native)
- Reanimated (animations)
- Gesture Handler

### Forms & Validation
- React Hook Form
- Zod

### Testing
- Jest
- React Native Testing Library
- Detox (E2E)

### Tools
- ESLint
- Prettier
- Husky
- EAS CLI

---

## 📖 Uso con Claude Code

### Configuración Global

Añadir en `~/.claude/CLAUDE.md`:

```markdown
# React Native Projects

Para proyectos React Native, seguir las reglas:
/path/to/ReactNative/CLAUDE.md.template

Ver documentación completa:
/path/to/ReactNative/
```

### Configuración Por Proyecto

En el proyecto React Native:

```
my-react-native-app/
├── .claude/
│   ├── CLAUDE.md           # Copiado de CLAUDE.md.template
│   ├── rules/              # (opcional) Copiado de rules/
│   ├── templates/          # (opcional) Copiado de templates/
│   └── checklists/         # (opcional) Copiado de checklists/
├── src/
├── app/
└── package.json
```

Claude Code leerá automáticamente `.claude/CLAUDE.md`.

---

## 🎓 Filosofía

### Análisis Primero
**Think First, Code Later**

Siempre comenzar por:
1. Comprender la necesidad
2. Analizar lo existente
3. Diseñar la solución
4. LUEGO codificar

### Architecture Matters
**Estructura clara = Código mantenible**

- Feature-based organization
- Separation of concerns
- Clean architecture layers

### Quality Over Speed
**Un código de calidad ahorra tiempo**

- Tests desde el principio
- Code review sistemático
- Estándares estrictos
- Refactoring continuo

### Security by Design
**La seguridad no es una opción**

- Tokens en SecureStore
- Input validation
- HTTPS only
- Dependencies audit

### Performance First
**60 FPS target**

- Hermes engine
- Optimizations (memo, FlatList)
- Images optimized
- Native driver animations

---

## 🔄 Workflow Típico

### Feature Development

```
Requisito recibido
    ↓
ANÁLISIS (obligatorio)
    ↓
Design & Planning
    ↓
Setup (branch, ticket)
    ↓
Implementation (bottom-up)
    ├── 1. Types
    ├── 2. Services
    ├── 3. Hooks
    ├── 4. Components
    ├── 5. Screens
    └── 6. Integration
    ↓
Tests
    ↓
Quality Check
    ↓
Documentation
    ↓
Code Review
    ↓
Merge & Deploy
    ↓
Monitor
```

---

## 📊 Métricas de Calidad

### Objetivos

- **Code Coverage**: > 80%
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 errors (strict mode)
- **npm audit**: 0 vulnerabilities
- **Bundle Size**: < 10MB
- **Startup Time**: < 3s
- **FPS**: 60 constante

---

## 🤝 Contributing

Para mejorar estas reglas:

1. Fork / Clone
2. Crear branch (`feature/improvement`)
3. Modificar las reglas
4. Probar con un proyecto real
5. Documentar los cambios
6. Pull Request

---

## 📄 License

MIT

---

## 👥 Autores

- **Creador**: TheBeardedCTO
- **Contribuidores**: Ver CONTRIBUTORS.md

---

## 🔗 Recursos

### Documentación Oficial
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Guías
- [React Query Docs](https://tanstack.com/query)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

### Best Practices
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-03

**Remember**: Estas reglas son guías, no dogmas. Adáptalas a tu contexto.
