# Reglas de Desarrollo React TypeScript para Claude Code

## Descripción General

Esta carpeta contiene un conjunto completo de reglas, plantillas y checklists para el desarrollo React TypeScript con Claude Code. Estas reglas aseguran la coherencia, calidad y mantenibilidad del código en todos tus proyectos React.

## Estructura de la Carpeta

```
React/
├── CLAUDE.md.template          # Configuración principal (a copiar en tu proyecto)
├── README.md                   # Este archivo
│
├── rules/                      # Reglas de desarrollo detalladas
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
│   ├── 12-performance.md          # A crear
│   ├── 13-state-management.md     # A crear
│   └── 14-styling.md              # A crear
│
├── templates/                  # Plantillas de código
│   ├── component.md           # Plantilla componente React
│   ├── hook.md                # Plantilla hook personalizado
│   ├── context.md             # A crear
│   ├── test-component.md      # A crear
│   └── test-hook.md           # A crear
│
└── checklists/                # Checklists de validación
    ├── pre-commit.md          # Checklist antes del commit
    ├── new-feature.md         # Checklist nueva funcionalidad
    ├── refactoring.md         # A crear
    └── security.md            # A crear
```

## Uso

### 1. Inicializar un Nuevo Proyecto

1. **Copiar CLAUDE.md.template** en tu proyecto:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/CLAUDE.md
   ```

2. **Reemplazar los placeholders** en CLAUDE.md:
   - `{{PROJECT_NAME}}`: Nombre de tu proyecto
   - `{{TECH_STACK}}`: Stack técnico completo
   - `{{REACT_VERSION}}`: Versión de React
   - `{{TYPESCRIPT_VERSION}}`: Versión de TypeScript
   - `{{BUILD_TOOL}}`: Vite, Next.js, etc.
   - `{{PACKAGE_MANAGER}}`: pnpm, npm, yarn
   - Etc.

3. **Copiar rules/00-project-context.md.template**:
   ```bash
   cp rules/00-project-context.md.template /path/to/your/project/docs/project-context.md
   ```

4. **Rellenar el contexto del proyecto** con la información específica.

### 2. Configurar Claude Code

En tu proyecto, Claude Code leerá automáticamente el archivo `CLAUDE.md` y aplicará todas las reglas definidas.

### 3. Referenciar las Reglas

Cada archivo de reglas puede ser referenciado en el CLAUDE.md principal:

```markdown
**Referencia**: `rules/01-workflow-analysis.md`
```

Claude Code tendrá acceso a todas estas reglas para asistirte en el desarrollo.

## Reglas Principales

### 1. Flujo de Análisis (01-workflow-analysis.md)

**Antes de escribir código, SIEMPRE**:
- Analizar el código existente
- Comprender la necesidad
- Diseñar la solución
- Documentar las decisiones

### 2. Arquitectura (02-architecture.md)

- **Feature-based**: Organización por funcionalidad de negocio
- **Atomic Design**: Jerarquía atoms → molecules → organisms → templates
- **Container/Presenter**: Separación lógica/presentación
- **Hooks Personalizados**: Lógica reutilizable

### 3. Estándares de Código (03-coding-standards.md)

- **TypeScript Strict**: Modo estricto activado
- **ESLint**: Configuración estricta
- **Prettier**: Formateo automático
- **Convenciones**: Nomenclatura coherente

### 4. Principios SOLID (04-solid-principles.md)

Aplicación de los principios SOLID en React con ejemplos concretos.

### 5. KISS, DRY, YAGNI (05-kiss-dry-yagni.md)

- **KISS**: Simplicidad ante todo
- **DRY**: Evitar la duplicación inteligentemente
- **YAGNI**: Implementar únicamente lo necesario

### 6. Tooling (06-tooling.md)

Configuración completa de:
- Vite / Next.js
- pnpm / npm
- Docker + Makefile
- Build optimization

### 7. Tests (07-testing.md)

- **Pirámide de tests**: 70% unitarios, 20% integración, 10% E2E
- **Vitest**: Tests unitarios
- **React Testing Library**: Tests componentes
- **MSW**: Mock API
- **Playwright**: Tests E2E

### 8. Calidad (08-quality-tools.md)

- **ESLint**: Linting
- **Prettier**: Formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks
- **Commitlint**: Conventional commits

### 9. Git Workflow (09-git-workflow.md)

- **Git Flow**: Estrategia de branching
- **Conventional Commits**: Mensajes estandarizados
- **Pull Requests**: Flujo de revisión
- **Versioning**: Semantic versioning

### 10. Documentación (10-documentation.md)

- **JSDoc/TSDoc**: Documentación del código
- **Storybook**: Documentación de componentes
- **README**: Documentación del proyecto
- **Changelog**: Historial de versiones

### 11. Seguridad (11-security.md)

- **XSS Prevention**: Sanitización del HTML
- **CSRF Protection**: Tokens y validación
- **Input Validation**: Zod schemas
- **Authentication**: JWT, protected routes
- **Dependencies**: Auditoría regular

## Plantillas de Código

### Componente React (templates/component.md)

Plantilla completa para crear componentes React con:
- TypeScript
- Props tipadas
- JSDoc
- Tests
- Storybook

### Hook Personalizado (templates/hook.md)

Plantilla para crear hooks personalizados con:
- TypeScript
- Documentación
- Tests
- Ejemplos de uso

## Checklists

### Pre-Commit (checklists/pre-commit.md)

Checklist a verificar antes de cada commit:
- Code quality
- Tests
- Documentación
- Seguridad
- Git

### Nueva Funcionalidad (checklists/new-feature.md)

Flujo completo para implementar una nueva funcionalidad:
1. Análisis y planificación
2. Diseño técnico
3. Implementación
4. Tests
5. Calidad y rendimiento
6. Documentación
7. Revisión y merge
8. Despliegue y monitoreo

## Comandos Útiles

### Desarrollo

```bash
# Crear un nuevo proyecto React + TypeScript
npm create vite@latest my-app -- --template react-ts
cd my-app
pnpm install

# Copiar las reglas
cp /path/to/React/CLAUDE.md.template ./CLAUDE.md
```

### Calidad

```bash
# Verificar todo
pnpm run quality

# Detalle
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build
```

## Archivos Restantes a Crear

Para completar este sistema de reglas, quedan por crear:

### Rules

- [ ] `12-performance.md`: Optimizaciones React (memo, lazy, code splitting)
- [ ] `13-state-management.md`: React Query, Zustand, Context API
- [ ] `14-styling.md`: Tailwind, CSS Modules, styled-components

### Templates

- [ ] `context.md`: Plantilla de Context Provider
- [ ] `test-component.md`: Plantilla de test componente
- [ ] `test-hook.md`: Plantilla de test hook

### Checklists

- [ ] `refactoring.md`: Checklist de refactoring seguro
- [ ] `security.md`: Auditoría de seguridad completa

## Contribución

Para mejorar estas reglas:

1. Crear una rama `feature/improve-react-rules`
2. Modificar los archivos de reglas
3. Probar en un proyecto real
4. Crear una Pull Request con las mejoras

## Recursos

### Documentación Oficial

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- TanStack Query: https://tanstack.com/query
- React Router: https://reactrouter.com

### Herramientas Recomendadas

- Vite: Build tool rápido
- pnpm: Gestor de paquetes eficiente
- Vitest: Testing framework rápido
- Playwright: Tests E2E
- Storybook: Documentación de componentes

## Licencia

Estas reglas se proporcionan "as-is" para uso con Claude Code.

## Soporte

Para preguntas o sugerencias:
- Crear una issue en el repositorio
- Consultar la documentación de Claude Code

---

**Última actualización**: 2025-12-03
**Versión**: 1.0.0
**Mantenedor**: TheBeardedCTO
