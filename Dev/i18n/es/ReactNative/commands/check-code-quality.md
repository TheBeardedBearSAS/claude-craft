---
description: Verificar Calidad de Código de React Native
argument-hint: [arguments]
---

# Verificar Calidad de Código de React Native

## Argumentos

$ARGUMENTS

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en auditoría de calidad de código React Native. Tu misión es analizar el cumplimiento del código según los estándares definidos en `.claude/rules/03-coding-standards.md`, `.claude/rules/04-solid-principles.md` y `.claude/rules/05-kiss-dry-yagni.md`.

### Paso 1: Análisis de configuración

1. Verificar presencia y configuración de TypeScript
2. Verificar presencia y configuración de ESLint
3. Verificar presencia y configuración de Prettier
4. Analizar archivos de configuración package.json

### Paso 2: Verificación de TypeScript (7 puntos)

Verificar configuración de TypeScript:

#### 🔧 Configuración tsconfig.json

- [ ] **(2 pts)** `"strict": true` habilitado
- [ ] **(1 pt)** `"noImplicitAny": true`
- [ ] **(1 pt)** `"strictNullChecks": true`
- [ ] **(1 pt)** `"noUnusedLocals": true` y `"noUnusedParameters": true`
- [ ] **(1 pt)** Alias de rutas configurados (ej: `@/components`, `@/utils`)
- [ ] **(1 pt)** Tipos correctos para React Native (`@types/react`, `@types/react-native`)

**Archivos a verificar:**
```bash
tsconfig.json
package.json
```

#### 📝 Uso de TypeScript en el Código

Verificar 5-10 archivos TypeScript aleatorios:

- [ ] Sin `any` (excepto casos justificados y documentados)
- [ ] Interfaces/Types bien definidos para props
- [ ] Tipos para funciones (params y return)
- [ ] Sin `@ts-ignore` o `@ts-nocheck` (excepto excepciones documentadas)
- [ ] Uso de genéricos cuando sea apropiado

**Archivos a verificar:**
```bash
src/**/*.tsx
src/**/*.ts
```

### Paso 3: Verificación de ESLint (6 puntos)

#### 🔍 Configuración de ESLint

- [ ] **(2 pts)** `.eslintrc.js` o `.eslintrc.json` presente y configurado
- [ ] **(1 pt)** Plugin `@react-native` o equivalente configurado
- [ ] **(1 pt)** Plugin `@typescript-eslint` configurado
- [ ] **(1 pt)** Reglas de React Hooks habilitadas (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)
- [ ] **(1 pt)** Scripts ESLint en package.json (`lint`, `lint:fix`)

**Archivos a verificar:**
```bash
.eslintrc.js
.eslintrc.json
package.json
```

#### ⚠️ Verificación de Errores ESLint

Ejecutar ESLint y analizar resultados:

```bash
npm run lint
# o
yarn lint
```

- [ ] 0 errores ESLint
- [ ] < 10 advertencias ESLint
- [ ] Sin reglas deshabilitadas sin justificación

### Paso 4: Verificación de Prettier (3 puntos)

- [ ] **(1 pt)** `.prettierrc` presente con configuración consistente
- [ ] **(1 pt)** Integración ESLint + Prettier (sin conflictos)
- [ ] **(1 pt)** Script de formato en package.json

**Archivos a verificar:**
```bash
.prettierrc
.prettierrc.js
.prettierrc.json
package.json
```

### Paso 5: Principios SOLID (4 puntos)

Referencia: `.claude/rules/04-solid-principles.md`

Analizar 3-5 componentes o módulos principales:

- [ ] **(1 pt)** **S - Single Responsibility**: Cada componente/función tiene una sola responsabilidad
- [ ] **(1 pt)** **O - Open/Closed**: Extensiones posibles sin modificar código existente
- [ ] **(1 pt)** **L - Liskov Substitution**: Los componentes son intercambiables
- [ ] **(1 pt)** **D - Dependency Inversion**: Dependencias vía props/inyección, sin acoplamiento fuerte

**Archivos a analizar:**
```bash
src/components/**/*.tsx
src/features/**/*.tsx
src/hooks/**/*.ts
```

### Paso 6: Principios KISS, DRY, YAGNI (5 puntos)

Referencia: `.claude/rules/05-kiss-dry-yagni.md`

- [ ] **(2 pts)** **KISS (Keep It Simple)**: Código simple y legible, sin sobre-ingeniería
- [ ] **(2 pts)** **DRY (Don't Repeat Yourself)**: Sin duplicación de código, reutilización vía hooks/utils
- [ ] **(1 pt)** **YAGNI (You Aren't Gonna Need It)**: Sin código no utilizado o features especulativas

Verificar:
- Funciones duplicadas que podrían factorizarse
- Lógica compleja que podría simplificarse
- Código muerto o comentado que debería eliminarse

**Archivos a analizar:**
```bash
src/**/*.ts
src/**/*.tsx
```

### Paso 7: Estándares de Código React Native

Referencia: `.claude/rules/03-coding-standards.md`

#### 📱 Mejores Prácticas Específicas

- [ ] Uso correcto de `StyleSheet.create()` (no estilos inline en todas partes)
- [ ] Constantes para colores, espaciado, tipografía
- [ ] Componentes funcionales con hooks (sin componentes de clase)
- [ ] Gestión de estado correcta (useState, useReducer según necesidad)
- [ ] Uso de `useCallback` para handlers pasados como props
- [ ] Uso de `useMemo` para cálculos costosos

**Archivos a verificar:**
```bash
src/components/**/*.tsx
src/theme/
src/constants/
```

### Paso 8: Calcular puntuación

```
┌──────────────────────────────────┬─────────┬────────┐
│ Criterio                         │ Puntos  │ Estado │
├──────────────────────────────────┼─────────┼────────┤
│ Configuración TypeScript         │ XX/7    │ ✅/⚠️/❌│
│ ESLint                           │ XX/6    │ ✅/⚠️/❌│
│ Prettier                         │ XX/3    │ ✅/⚠️/❌│
│ Principios SOLID                 │ XX/4    │ ✅/⚠️/❌│
│ KISS, DRY, YAGNI                 │ XX/5    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL CALIDAD DE CÓDIGO          │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Leyenda:**
- ✅ Excelente (≥ 20/25)
- ⚠️ Advertencia (15-19/25)
- ❌ Crítico (< 15/25)

### Paso 9: Informe detallado

## 📊 RESULTADOS DE AUDITORÍA DE CALIDAD DE CÓDIGO

### ✅ Fortalezas

Listar las buenas prácticas identificadas:
- [Práctica 1 con ejemplo de código]
- [Práctica 2 con ejemplo de código]

### ⚠️ Puntos de Mejora

Listar los problemas identificados por prioridad:

1. **[Problema 1]**
   - **Severidad:** Crítico/Alto/Medio
   - **Ubicación:** [Archivos afectados]
   - **Ejemplo:**
   ```typescript
   // Código problemático
   ```
   - **Recomendación:**
   ```typescript
   // Código corregido
   ```

2. **[Problema 2]**
   - **Severidad:** Crítico/Alto/Medio
   - **Ubicación:** [Archivos afectados]
   - **Ejemplo:**
   ```typescript
   // Código problemático
   ```
   - **Recomendación:**
   ```typescript
   // Código corregido
   ```

### 📈 Métricas de Calidad

Ejecutar y reportar las siguientes métricas:

#### Errores ESLint
```bash
npm run lint
```
- **Errores:** XX
- **Advertencias:** XX
- **Archivos analizados:** XX

#### Complejidad del Código

Si SonarQube u otra herramienta está disponible:
- **Complejidad ciclomática promedio:** XX (objetivo: < 10)
- **Líneas de código:** XX
- **Duplicación:** XX% (objetivo: < 5%)
- **Deuda técnica:** XX horas

#### TypeScript

- **Porcentaje de tipado estricto:** XX% (objetivo: 100%)
- **Uso de `any`:** XX ocurrencias (objetivo: 0)
- **Errores TypeScript:** XX (objetivo: 0)

### 🎯 TOP 3 ACCIONES PRIORITARIAS

#### 1. [ACCIÓN #1]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Detalle del problema]
- **Solución:** [Acción concreta]
- **Archivos:** [Lista de archivos]
- **Ejemplo:**
```typescript
// Antes
[código problemático]

// Después
[código corregido]
```

#### 2. [ACCIÓN #2]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Detalle del problema]
- **Solución:** [Acción concreta]
- **Archivos:** [Lista de archivos]

#### 3. [ACCIÓN #3]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Detalle del problema]
- **Solución:** [Acción concreta]
- **Archivos:** [Lista de archivos]

---

## 📚 Referencias

- `.claude/rules/03-coding-standards.md` - Estándares de código
- `.claude/rules/04-solid-principles.md` - Principios SOLID
- `.claude/rules/05-kiss-dry-yagni.md` - Principios KISS, DRY, YAGNI
- `.claude/rules/06-tooling.md` - Configuración de herramientas

---

**Puntuación final: XX/25**
