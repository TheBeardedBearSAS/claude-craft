# Análisis de Flujo de Trabajo

## Contexto del Proyecto

Antes de comenzar cualquier desarrollo, es crucial comprender:

1. **Arquitectura existente**
   - Estructura de carpetas
   - Patrones utilizados
   - Bibliotecas principales
   - Gestión de estado
   - Estrategia de enrutamiento

2. **Stack tecnológico**
   - React + TypeScript
   - Herramienta de construcción (Vite, Next.js, CRA)
   - Bibliotecas UI (Tailwind, MUI, styled-components)
   - Bibliotecas de estado (Context, Zustand, Redux Toolkit)
   - Framework de pruebas (Vitest, Jest, Playwright)

3. **Convenciones del equipo**
   - Guía de estilo de código
   - Patrones de nomenclatura
   - Estrategia de ramificación Git
   - Proceso de revisión de código
   - Estrategia de pruebas

## Análisis de Funcionalidad

### 1. Análisis de Requerimientos

**Preguntas a formular:**

- ¿Cuál es la necesidad comercial?
- ¿Quiénes son los usuarios objetivo?
- ¿Cuáles son los casos de uso principales?
- ¿Existen restricciones técnicas?
- ¿Existen requisitos de rendimiento?
- ¿Cuáles son los requisitos de accesibilidad?
- ¿Cuáles son las integraciones necesarias?

**Resultado esperado:**
- Especificaciones funcionales claras
- Historias de usuario validadas
- Criterios de aceptación definidos
- Casos extremos identificados

### 2. Análisis Técnico

#### Identificar Componentes

```typescript
// Ejemplo: Análisis de una funcionalidad de gestión de usuarios

/**
 * Componentes necesarios:
 * - UserList (contenedor)
 *   - UserListItem (presentacional)
 *   - UserListSkeleton (carga)
 *   - UserListEmpty (estado vacío)
 * - UserForm (formulario)
 *   - UserFormFields (campos)
 *   - UserFormActions (acciones)
 * - UserProfile (perfil)
 *   - UserAvatar (avatar)
 *   - UserDetails (detalles)
 */
```

#### Definir Flujo de Datos

```typescript
/**
 * Flujo de datos:
 * 1. Carga inicial
 *    API → React Query → Componente
 *
 * 2. Creación de usuario
 *    Formulario → Validación (Zod) → Mutation → Actualización de caché
 *
 * 3. Edición de usuario
 *    Formulario precargado → Validación → Mutation → Actualización optimista
 *
 * 4. Eliminación de usuario
 *    Confirmación → Mutation → Actualización de caché
 */
```

#### Gestión de Estado

```typescript
// Determinar qué estado es necesario

/**
 * Estado del Servidor (React Query):
 * - users (lista)
 * - user (detalle)
 * - userStats (estadísticas)
 *
 * Estado Local (useState):
 * - isModalOpen
 * - selectedUserId
 * - searchQuery
 * - filters
 *
 * Estado Global (Zustand/Context):
 * - currentUser (autenticación)
 * - theme (preferencias)
 * - notifications (UI)
 */
```

### 3. Análisis de Dependencias

```typescript
/**
 * Dependencias necesarias:
 *
 * Carga de datos:
 * - @tanstack/react-query
 * - axios o ky
 *
 * Formularios:
 * - react-hook-form
 * - zod
 *
 * UI:
 * - tailwindcss o @mui/material
 * - lucide-react (iconos)
 *
 * Utilidades:
 * - date-fns
 * - clsx/cn
 */
```

## División de Tareas

### Enfoque: Iterativo e Incremental

#### Fase 1: Setup e Infraestructura

```markdown
Tareas:
- [ ] Configurar rutas
- [ ] Definir tipos TypeScript
- [ ] Configurar React Query
- [ ] Crear servicios API
- [ ] Configurar validación (Zod schemas)
```

#### Fase 2: Componentes Base

```markdown
Tareas:
- [ ] Crear componentes de presentación (Button, Input, Card)
- [ ] Implementar skeleton loaders
- [ ] Crear componentes de estado vacío
- [ ] Implementar manejo de errores
```

#### Fase 3: Funcionalidad Principal

```markdown
Tareas:
- [ ] Implementar listado de usuarios
- [ ] Implementar creación de usuario
- [ ] Implementar edición de usuario
- [ ] Implementar eliminación de usuario
- [ ] Implementar búsqueda y filtros
```

#### Fase 4: Mejoras

```markdown
Tareas:
- [ ] Agregar paginación
- [ ] Agregar ordenación
- [ ] Implementar actualizaciones optimistas
- [ ] Agregar notificaciones toast
- [ ] Mejorar accesibilidad
```

#### Fase 5: Pruebas

```markdown
Tareas:
- [ ] Pruebas unitarias (componentes)
- [ ] Pruebas de integración (flujos)
- [ ] Pruebas E2E (escenarios críticos)
- [ ] Pruebas de accesibilidad
```

## Flujo de Trabajo Git

### Estrategia de Ramificación

```bash
# Ramas principales
main          # Código de producción
develop       # Integración de desarrollo

# Ramas de funcionalidad
feature/user-management
feature/user-profile
feature/user-settings

# Ramas de corrección
bugfix/fix-user-deletion
hotfix/critical-auth-issue

# Convención de nomenclatura
<type>/<descripción-breve>
```

### Flujo de Trabajo

```bash
# 1. Crear rama de funcionalidad
git checkout -b feature/user-management

# 2. Trabajo iterativo
git add .
git commit -m "feat(users): add user list component"
git push origin feature/user-management

# 3. Actualizar desde develop
git fetch origin
git rebase origin/develop

# 4. Crear Pull Request
# Usar GitHub CLI o interfaz web

# 5. Revisión de código
# Abordar comentarios de revisión

# 6. Merge a develop
# Después de la aprobación
```

### Mensajes de Commit

**Formato: Conventional Commits**

```bash
<type>(<scope>): <subject>

# Tipos
feat     # Nueva funcionalidad
fix      # Corrección de error
docs     # Documentación
style    # Formato (sin cambios de código)
refactor # Refactorización
test     # Agregar o modificar pruebas
chore    # Mantenimiento

# Ejemplos
feat(users): add user list with pagination
fix(auth): resolve token expiration issue
refactor(components): extract common Button component
test(users): add integration tests for user creation
docs(readme): update setup instructions
```

## Proceso de Revisión de Código

### Checklist del Autor

Antes de crear un PR:

- [ ] Código formateado (Prettier)
- [ ] Sin errores de linting (ESLint)
- [ ] Compilación de TypeScript sin errores
- [ ] Todas las pruebas pasan
- [ ] Cobertura de pruebas adecuada (>80%)
- [ ] Documentación actualizada
- [ ] Sin console.log o debuggers
- [ ] Mensajes de commit claros

### Checklist del Revisor

Durante la revisión:

- [ ] Código sigue los estándares del proyecto
- [ ] Lógica es clara y comprensible
- [ ] Sin duplicación de código
- [ ] Manejo de errores adecuado
- [ ] Rendimiento es aceptable
- [ ] Seguridad es considerada
- [ ] Accesibilidad es respetada
- [ ] Pruebas son relevantes

## Entornos

### Desarrollo Local

```bash
# Variables de entorno
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
VITE_LOG_LEVEL=debug
```

### Staging

```bash
# Variables de entorno
VITE_API_BASE_URL=https://api.staging.example.com
VITE_ENV=staging
VITE_LOG_LEVEL=info
```

### Producción

```bash
# Variables de entorno
VITE_API_BASE_URL=https://api.example.com
VITE_ENV=production
VITE_LOG_LEVEL=error
```

## Estrategia de Pruebas

### Pirámide de Pruebas

```
       /\
      /E2E\      10% - Pruebas de extremo a extremo (Playwright)
     /------\
    /  Int.  \   20% - Pruebas de integración (React Testing Library)
   /----------\
  /   Unit     \ 70% - Pruebas unitarias (Vitest)
 /--------------\
```

### Qué Probar

#### Pruebas Unitarias (70%)
- Componentes individuales
- Hooks personalizados
- Funciones de utilidad
- Helpers y transformadores
- Validaciones

#### Pruebas de Integración (20%)
- Flujos de usuario
- Formularios completos
- Interacciones de componentes
- Llamadas API (con MSW)

#### Pruebas E2E (10%)
- Flujos críticos (inicio de sesión, checkout)
- User journeys completos
- Regresión visual (opcional)

## Monitoreo y Depuración

### Herramientas de Desarrollo

```typescript
// React DevTools
// - Inspeccionar árbol de componentes
// - Perfilar rendimiento
// - Depurar estado

// Redux DevTools (si Redux)
// - Inspeccionar acciones
// - Viajar en el tiempo
// - Trazar cambios de estado

// React Query Devtools
// - Inspeccionar consultas
// - Ver caché
// - Forzar refetches
```

### Registro

```typescript
// Logging en desarrollo
if (import.meta.env.DEV) {
  console.log('User data:', userData);
}

// Logging estructurado en producción
import { logger } from '@/utils/logger';

logger.info('User logged in', { userId: user.id });
logger.error('API call failed', { error, endpoint });
```

## Checklist de Análisis Completo

Antes de comenzar a codificar, asegúrate de tener:

- [ ] Comprensión clara de los requisitos
- [ ] Stack técnico identificado
- [ ] Arquitectura definida
- [ ] Componentes mapeados
- [ ] Flujo de datos planificado
- [ ] Estado identificado
- [ ] Dependencias listadas
- [ ] Tareas divididas
- [ ] Estrategia de Git definida
- [ ] Proceso de revisión establecido
- [ ] Estrategia de pruebas planeada
- [ ] Entornos configurados

**Regla de oro**: Invierte tiempo en el análisis para ahorrar tiempo en el desarrollo.

El tiempo invertido en el análisis es tiempo ganado en el desarrollo y en mantenimiento futuro.
