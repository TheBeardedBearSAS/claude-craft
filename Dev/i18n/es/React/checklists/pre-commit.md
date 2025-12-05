# Checklist: Pre-Commit React

## Verificaciones Automáticas (Husky + Lint-Staged)

### Formateo
- [ ] Prettier ejecutado en archivos staged
- [ ] Sin problemas de formateo
- [ ] Configuración de Prettier respetada (.prettierrc)

### Linting
- [ ] ESLint ejecutado sin errores
- [ ] Sin warnings críticos
- [ ] Reglas de ESLint respetadas
- [ ] Plugins React/TypeScript activos

### TypeScript
- [ ] Type-checking pasado (`tsc --noEmit`)
- [ ] Sin errores de TypeScript
- [ ] Sin uso de `any` injustificado
- [ ] Importaciones de tipos correctas

### Tests
- [ ] Tests afectados ejecutados
- [ ] Todos los tests pasando
- [ ] Sin tests saltados sin razón
- [ ] Cobertura mantenida o mejorada

## Verificaciones Manuales

### Código Limpio
- [ ] Sin `console.log()` olvidados
- [ ] Sin `debugger` statements
- [ ] Sin código comentado
- [ ] Sin código muerto/no usado
- [ ] Sin TODOs sin ticket asociado
- [ ] Sin FIXME sin explicación

### Imports y Dependencias
- [ ] Imports ordenados correctamente
- [ ] Sin imports no utilizados
- [ ] Path aliases usados (@/...)
- [ ] Sin dependencias circulares
- [ ] Imports agrupados por tipo

### Componentes React
- [ ] Nombres de componentes en PascalCase
- [ ] Props tipadas correctamente
- [ ] Default props definidos
- [ ] PropTypes removidos (usar TypeScript)
- [ ] Componentes funcionales (no clases)
- [ ] Hooks siguiendo reglas de React

### Estado y Efectos
- [ ] `useState` usado apropiadamente
- [ ] `useEffect` con dependencias correctas
- [ ] Limpieza en `useEffect` (si necesario)
- [ ] `useMemo` para cálculos costosos
- [ ] `useCallback` para funciones pasadas como props
- [ ] Sin state duplicado

### Performance
- [ ] `React.memo` usado para componentes pesados
- [ ] Keys únicas en listas
- [ ] Sin inline functions en render (si afecta performance)
- [ ] Sin inline objects/arrays en props
- [ ] Lazy loading implementado donde aplica

### Accesibilidad
- [ ] Elementos interactivos accesibles por teclado
- [ ] Alt text en imágenes
- [ ] Labels para inputs
- [ ] Roles ARIA apropiados
- [ ] Contraste de colores adecuado

### Seguridad
- [ ] Entrada de usuario validada
- [ ] Sin uso de `dangerouslySetInnerHTML` sin sanitizar
- [ ] Sin secretos hardcodeados
- [ ] Tokens no expuestos
- [ ] Variables de entorno usadas apropiadamente

### Tests
- [ ] Nuevas funcionalidades tienen tests
- [ ] Tests actualizados para cambios
- [ ] Tests con nombres descriptivos
- [ ] Mocking apropiado
- [ ] Sin aserciones comentadas

### Git
- [ ] Mensaje de commit claro y descriptivo
- [ ] Conventional Commits respetado
- [ ] Un propósito por commit
- [ ] Sin archivos sensibles (.env, credentials)
- [ ] .gitignore actualizado si necesario
- [ ] Sin archivos grandes/binarios innecesarios

### Documentación
- [ ] JSDoc actualizado para funciones públicas
- [ ] README actualizado si necesario
- [ ] CHANGELOG actualizado (si aplica)
- [ ] Comentarios añadidos para código complejo
- [ ] APIs documentadas

## Comandos Pre-Commit

```bash
# Formateo automático
npm run format

# Linting con auto-fix
npm run lint:fix

# Type checking
npm run type-check

# Tests unitarios
npm run test

# Verificación completa
npm run quality
```

## Git Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Documentación
- **style**: Formateo, punto y coma faltantes, etc.
- **refactor**: Refactorización de código
- **perf**: Mejora de rendimiento
- **test**: Añadir tests
- **build**: Cambios en el sistema de build
- **ci**: Cambios en CI/CD
- **chore**: Otros cambios (dependencias, etc.)

### Ejemplos
```bash
# Bueno ✅
feat(auth): add OAuth2 authentication flow
fix(validation): resolve email validation regex issue
docs(readme): update installation instructions

# Malo ❌
Added stuff
Fixed bug
Update
```

## Errores Comunes a Evitar

### TypeScript
- ❌ Uso de `any` sin justificación
- ❌ `@ts-ignore` sin comentario explicativo
- ❌ Type assertions con `as` innecesarios
- ❌ Optional chaining `?.` en lugar de verificación apropiada
- ❌ Non-null assertions `!` innecesarios

### React
- ❌ `useEffect` sin array de dependencias
- ❌ Mutación directa de estado
- ❌ Keys con índices en listas dinámicas
- ❌ Componentes definidos dentro de otros componentes
- ❌ Props drilling excesivo

### Imports
- ❌ Imports relativos largos (`../../../components`)
- ❌ Imports con extensión (`.tsx`, `.ts`)
- ❌ Imports desordenados
- ❌ Imports default y named mezclados incorrectamente

### Performance
- ❌ Re-renders innecesarios
- ❌ Objetos/arrays creados en cada render
- ❌ Funciones inline en props sin memoization
- ❌ Listas largas sin virtualización

### Seguridad
- ❌ Tokens en código fuente
- ❌ Variables de entorno committeadas
- ❌ Validación solo client-side
- ❌ `dangerouslySetInnerHTML` con datos de usuario

## Configuración de Husky

### Instalar Husky
```bash
npm install -D husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### .lintstagedrc.cjs
```javascript
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit'
  ],
  '*.{json,css,md}': ['prettier --write'],
  '*.{test,spec}.{ts,tsx}': ['vitest run --related']
};
```

## Checklist de Urgencia (1 minuto)

Para commits rápidos, verificar como mínimo:

1. ✅ Sin errores de TypeScript
2. ✅ Sin errores de ESLint
3. ✅ Sin `console.log` olvidados
4. ✅ Tests pasando
5. ✅ Build exitoso
6. ✅ Mensaje de commit claro

## Bypass Pre-Commit (Usar con Precaución)

```bash
# Saltar hooks (solo en casos excepcionales)
git commit --no-verify -m "mensaje"

# ⚠️ ADVERTENCIA: Usar solo para:
# - Commits de emergencia en producción
# - WIP commits en branch personal
# - Revert de commits problemáticos
```

---

**Regla de oro**: Si el pre-commit falla, ¡hay una razón! Corrige antes de committear.

**Versión**: 1.0
**Última actualización**: 2025-12-03
