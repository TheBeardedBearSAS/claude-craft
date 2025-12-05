# Workflow Git y Gestión de Versiones

## Estrategia de Branching - Git Flow

### Ramas Principales

```
main (producción)
  └── develop (integración)
      ├── feature/* (nuevas características)
      ├── fix/* (correcciones de bugs)
      ├── refactor/* (refactorización)
      └── hotfix/* (correcciones urgentes)
```

### Estructura de Ramas

#### 1. Main (Producción)

- **Propósito**: Código en producción
- **Protección**: Rama protegida, sin push directo
- **Merge**: Solo vía Pull Request desde `develop` o `hotfix/*`
- **Tags**: Todos los merges son etiquetados con una versión

```bash
# Merge desde develop
git checkout main
git merge --no-ff develop -m "Release v1.2.0"
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags
```

#### 2. Develop (Desarrollo)

- **Propósito**: Integración de características
- **Base**: Rama de inicio para todas las features
- **Protección**: Rama protegida, merge solo vía PR

#### 3. Ramas Feature

- **Nomenclatura**: `feature/TICKET-descripcion`
- **Base**: Creada desde `develop`
- **Merge**: Hacia `develop` vía Pull Request

```bash
# Crear rama feature
git checkout develop
git pull origin develop
git checkout -b feature/USER-123-add-login-form

# Trabajar en la característica
git add .
git commit -m "feat(auth): add login form component"

# Push de la rama
git push -u origin feature/USER-123-add-login-form

# Crear Pull Request en GitHub/GitLab
```

#### 4. Ramas Fix

- **Nomenclatura**: `fix/TICKET-descripcion`
- **Base**: Creada desde `develop`
- **Merge**: Hacia `develop` vía Pull Request

```bash
# Crear rama fix
git checkout develop
git pull origin develop
git checkout -b fix/BUG-456-fix-user-validation

# Corregir el bug
git add .
git commit -m "fix(validation): resolve email validation issue"

# Push y crear PR
git push -u origin fix/BUG-456-fix-user-validation
```

#### 5. Ramas Hotfix

- **Nomenclatura**: `hotfix/v1.2.1-descripcion`
- **Base**: Creada desde `main` (producción)
- **Merge**: Hacia `main` Y `develop`

```bash
# Crear rama hotfix
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1-critical-security-fix

# Aplicar hotfix
git add .
git commit -m "fix(security): patch XSS vulnerability"

# Merge a main
git checkout main
git merge --no-ff hotfix/v1.2.1-critical-security-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1 - Security patch"
git push origin main --tags

# Merge a develop
git checkout develop
git merge --no-ff hotfix/v1.2.1-critical-security-fix
git push origin develop

# Eliminar rama hotfix
git branch -d hotfix/v1.2.1-critical-security-fix
git push origin --delete hotfix/v1.2.1-critical-security-fix
```

#### 6. Ramas Refactor

- **Nomenclatura**: `refactor/descripcion`
- **Base**: Creada desde `develop`
- **Merge**: Hacia `develop` vía Pull Request

```bash
git checkout -b refactor/optimize-user-hooks
git commit -m "refactor(hooks): extract common user logic"
git push -u origin refactor/optimize-user-hooks
```

## Conventional Commits

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- **feat**: Nueva característica
- **fix**: Corrección de bug
- **docs**: Documentación
- **style**: Formateo, punto y comas faltantes, etc.
- **refactor**: Refactorización de código
- **perf**: Mejora de rendimiento
- **test**: Agregar tests
- **build**: Cambios en el sistema de build
- **ci**: Cambios en CI/CD
- **chore**: Otros cambios (dependencias, etc.)
- **revert**: Revertir commit anterior

### Scopes (Ejemplos)

- **auth**: Autenticación
- **user**: Gestión de usuarios
- **product**: Productos
- **api**: API
- **ui**: Interfaz de usuario
- **hooks**: Custom hooks
- **utils**: Utilidades
- **config**: Configuración

### Ejemplos de Commits

```bash
# Característica
feat(auth): add OAuth2 authentication flow

Implement Google and Facebook OAuth2 authentication.
- Add OAuth2 provider configuration
- Create authentication callback handlers
- Implement token exchange logic

Closes #USER-123

# Corrección
fix(validation): resolve email validation regex issue

The email regex was not accepting valid TLDs like .technology
Updated regex pattern to allow longer TLDs

Fixes #BUG-456

# Cambio Breaking
feat(api)!: change user API response structure

BREAKING CHANGE: User API now returns { data: User, meta: Metadata }
instead of just User object.

Migration guide:
- Update all API calls to access response.data
- Handle pagination with response.meta

Closes #API-789

# Refactorización
refactor(hooks): extract common data fetching logic

Extract useQuery patterns into reusable hooks to reduce code duplication

# Rendimiento
perf(list): implement virtual scrolling for large lists

Improve performance with react-window for lists > 100 items

# Documentación
docs(readme): add installation instructions

Add step-by-step installation guide for new developers

# Tests
test(auth): add unit tests for login component

Increase test coverage from 65% to 85%

# Build
build(deps): upgrade react to v18.3

# CI
ci(github): add automated E2E tests workflow

# Chore
chore(deps): update dependencies

# Revert
revert: feat(auth): add OAuth2 authentication flow

This reverts commit abc123def456.
Reason: OAuth2 integration causing production issues
```

### Guías de Mensajes de Commit

#### Línea de Asunto

```bash
# ✅ Bueno
feat(auth): add login form validation

# ❌ Malo
Added some stuff

# ✅ Bueno - Imperativo
fix(api): resolve timeout issue

# ❌ Malo - Tiempo pasado
fixed the timeout issue

# ✅ Bueno - Conciso
refactor(hooks): simplify useAuth

# ❌ Malo - Demasiado largo
refactor(hooks): simplify the useAuth hook by extracting the validation logic and removing duplicate code
```

#### Cuerpo (Opcional pero Recomendado)

```bash
feat(user): add user profile editing

Implement complete user profile editing functionality including:
- Profile picture upload with preview
- Form validation using Zod
- Optimistic updates with React Query
- Error handling and rollback

The implementation follows the established patterns in the codebase
and includes comprehensive unit and integration tests.

Closes #USER-123
```

#### Footer

```bash
# Referenciar issues
Closes #123
Fixes #456
Resolves #789

# Múltiples issues
Closes #123, #456, #789

# Cambios breaking
BREAKING CHANGE: API response structure changed
```

## Workflow de Pull Request

### Crear un Pull Request

```bash
# 1. Asegurar que la rama esté actualizada
git checkout develop
git pull origin develop

# 2. Rebase de la rama feature
git checkout feature/USER-123-add-login-form
git rebase develop

# 3. Resolver conflictos si es necesario
# 4. Push de los cambios
git push origin feature/USER-123-add-login-form --force-with-lease

# 5. Crear PR en GitHub/GitLab
```

### Template de Pull Request

```markdown
## Descripción

Breve descripción de los cambios en este PR.

## Tipo de Cambio

- [ ] Corrección de bug (cambio que no rompe funcionalidad existente)
- [ ] Nueva característica (cambio que no rompe funcionalidad existente)
- [ ] Cambio breaking (corrección o característica que causa que funcionalidad existente no funcione como se esperaba)
- [ ] Este cambio requiere actualización de documentación

## Issues Relacionados

Closes #123
Related to #456

## Cambios Realizados

- Agregado flujo de autenticación de usuario
- Implementada validación de token JWT
- Creados formularios de login y registro
- Agregados tests unitarios para componentes de auth

## Screenshots (si aplica)

[Agregar screenshots aquí]

## Testing

### ¿Cómo Ha Sido Testeado?

- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Testing manual

### Configuración de Test

- Versión Node: 20.x
- Navegador: Chrome 120

## Checklist

- [ ] Mi código sigue el estilo de código de este proyecto
- [ ] He realizado una auto-revisión de mi propio código
- [ ] He comentado mi código, particularmente en áreas difíciles de entender
- [ ] He hecho los cambios correspondientes en la documentación
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban que mi corrección es efectiva o que mi característica funciona
- [ ] Tests unitarios nuevos y existentes pasan localmente con mis cambios
- [ ] Cualquier cambio dependiente ha sido fusionado y publicado

## Impacto en Rendimiento

- [ ] Sin impacto en rendimiento
- [ ] Mejora menor de rendimiento
- [ ] Mejora significativa de rendimiento
- [ ] Regresión de rendimiento (explicar por qué es aceptable)

## Consideraciones de Seguridad

- [ ] Sin impacto en seguridad
- [ ] Mejora de seguridad
- [ ] Posible preocupación de seguridad (explicada abajo)

## Notas Adicionales

Cualquier información adicional que los revisores deban saber.
```

### Proceso de Revisión de Código

#### Para el Revisor

```bash
# 1. Obtener la rama
git fetch origin
git checkout feature/USER-123-add-login-form

# 2. Probar localmente
pnpm install
pnpm dev

# 3. Verificar tests
pnpm test
pnpm lint
pnpm type-check

# 4. Revisar el código
# - Verificar calidad del código
# - Verificar tests
# - Verificar documentación
# - Testing manual

# 5. Aprobar o solicitar cambios
```

#### Checklist del Revisor

- [ ] El código sigue los estándares del proyecto
- [ ] Tests están completos y pasan
- [ ] Sin código duplicado
- [ ] Sin valores hardcodeados
- [ ] Documentación está actualizada
- [ ] Sin console.log restantes
- [ ] Rendimiento aceptable
- [ ] Seguridad respetada
- [ ] Accesibilidad respetada
- [ ] Diseño responsivo (si es UI)

## Gestión de Conflictos

### Resolver Conflictos Durante Rebase

```bash
# 1. Iniciar el rebase
git checkout feature/my-feature
git rebase develop

# 2. Si hay conflicto, Git se detiene
# Editar archivos conflictivos

# 3. Marcar como resuelto
git add <archivos-resueltos>
git rebase --continue

# 4. Si hay demasiados conflictos, abortar
git rebase --abort

# 5. Push (force con lease)
git push --force-with-lease origin feature/my-feature
```

### Resolver Conflictos Durante Merge

```bash
# 1. Merge develop en feature
git checkout feature/my-feature
git merge develop

# 2. Resolver conflictos
# Editar archivos

# 3. Commit de la resolución
git add <archivos-resueltos>
git commit -m "merge: resolve conflicts with develop"

# 4. Push
git push origin feature/my-feature
```

## Git Hooks (Automatización)

### Hook Pre-commit

```bash
#!/bin/sh
# .husky/pre-commit

# Lint de archivos staged
npx lint-staged

# Verificación de tipos
npm run type-check

# Si todo pasa, el commit continúa
exit 0
```

### Hook Commit-msg

```bash
#!/bin/sh
# .husky/commit-msg

# Validar mensaje de commit
npx --no -- commitlint --edit ${1}
```

### Hook Pre-push

```bash
#!/bin/sh
# .husky/pre-push

# Ejecutar tests antes de push
npm run test:run

# Build para asegurar que no hay errores de build
npm run build

exit 0
```

## Versionado Semántico

### Formato: MAJOR.MINOR.PATCH

- **MAJOR**: Cambios breaking (1.0.0 → 2.0.0)
- **MINOR**: Nuevas características, compatible hacia atrás (1.0.0 → 1.1.0)
- **PATCH**: Correcciones de bugs (1.0.0 → 1.0.1)

### Ejemplos

```bash
# Release patch (corrección de bug)
git tag -a v1.0.1 -m "Fix: resolve user validation issue"

# Release minor (nueva característica)
git tag -a v1.1.0 -m "Feature: add dark mode support"

# Release major (cambio breaking)
git tag -a v2.0.0 -m "Breaking: new API structure"

# Push tags
git push origin --tags
```

### Changelog Automático

```bash
# Instalar standard-version
npm install -D standard-version

# Agregar a package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}

# Generar un release
npm run release
# Genera automáticamente:
# - Bump de versión en package.json
# - Git tag
# - CHANGELOG.md actualizado

git push --follow-tags origin main
```

## Mejores Prácticas de Git

### 1. Commits Atómicos

```bash
# ✅ Bueno - Commits separados
git commit -m "feat(auth): add login form"
git commit -m "test(auth): add login form tests"
git commit -m "docs(auth): document login flow"

# ❌ Malo - Todo en un commit
git commit -m "Add login feature with tests and docs"
```

### 2. Ramas Cortas

- Ramas feature: < 3 días
- Merge rápido y frecuente
- Evitar ramas de larga duración

### 3. Rebase vs Merge

```bash
# Rebase para ramas feature (historial lineal)
git checkout feature/my-feature
git rebase develop

# Merge para integrar en develop (preservar historial)
git checkout develop
git merge --no-ff feature/my-feature
```

### 4. Push Seguro con Force

```bash
# ❌ Peligroso
git push --force

# ✅ Seguro
git push --force-with-lease
```

### 5. Mantener develop y main Actualizados

```bash
# Sincronizar regularmente
git checkout develop
git pull origin develop

git checkout main
git pull origin main
```

## Gitignore

```gitignore
# Dependencias
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Producción
dist/
build/
.next/
out/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Variables de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Archivos temporales
*.log
tmp/
temp/

# Build info
.tsbuildinfo
```

## Alias Útiles de Git

```bash
# Agregar a ~/.gitconfig
[alias]
  # Status corto
  st = status -sb

  # Commit
  cm = commit -m
  ca = commit --amend

  # Checkout
  co = checkout
  cob = checkout -b

  # Branch
  br = branch
  brd = branch -d

  # Pull/Push
  pl = pull
  ps = push
  pf = push --force-with-lease

  # Log
  lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
  last = log -1 HEAD

  # Rebase
  rb = rebase
  rbc = rebase --continue
  rba = rebase --abort

  # Stash
  st = stash
  stp = stash pop

  # Deshacer
  undo = reset --soft HEAD^
  unstage = reset HEAD --
```

## Conclusión

Un buen workflow Git permite:

1. ✅ **Colaboración**: Trabajo en equipo fluido
2. ✅ **Calidad**: Revisión de código sistemática
3. ✅ **Trazabilidad**: Historial claro
4. ✅ **Seguridad**: Protección de ramas principales
5. ✅ **Automatización**: Hooks y CI/CD

**Regla de oro**: Commit frecuente, push regular, merge rápido.
