---
description: Verificar Testing de React Native
argument-hint: [arguments]
---

# Verificar Testing de React Native

## Argumentos

$ARGUMENTS

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en auditoría de testing de React Native. Tu misión es analizar la estrategia de pruebas y la cobertura de acuerdo con los estándares definidos en `.claude/rules/07-testing.md` y `.claude/rules/08-quality-tools.md`.

### Paso 1: Análisis de la configuración de pruebas

1. Verificar la presencia y configuración de Jest
2. Verificar la presencia y configuración de React Native Testing Library (RNTL)
3. Verificar la presencia y configuración de Detox (pruebas E2E)
4. Analizar los scripts de prueba en package.json

### Paso 2: Configuración de Jest (5 puntos)

#### 🧪 Archivos de configuración

- [ ] **(1 pt)** `jest.config.js` o configuración en package.json presente
- [ ] **(1 pt)** Preset de React Native configurado (`@react-native/jest-preset` o equivalente)
- [ ] **(1 pt)** Archivos de configuración definidos (`setupFilesAfterEnv`)
- [ ] **(1 pt)** Cobertura de código habilitada (coverage)
- [ ] **(1 pt)** Transformaciones configuradas para TypeScript y React Native

**Archivos a verificar:**
```bash
jest.config.js
jest.setup.js
package.json
```

#### 📊 Configuración de cobertura

Verificar en `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

- [ ] Umbrales de cobertura definidos (≥ 80% recomendado)
- [ ] Recopilación desde las carpetas correctas (src/, app/)
- [ ] Exclusiones apropiadas (node_modules, __tests__, etc.)

### Paso 3: Pruebas Unitarias con RNTL (8 puntos)

Referencia: `.claude/rules/07-testing.md`

#### 📁 Organización de pruebas

- [ ] **(1 pt)** Pruebas colocadas junto a los componentes o en `__tests__/`
- [ ] **(1 pt)** Convención de nomenclatura: `*.test.tsx` o `*.spec.tsx`
- [ ] **(1 pt)** Estructura AAA (Arrange, Act, Assert) respetada

**Archivos a verificar:**
```bash
src/**/__tests__/
src/**/*.test.tsx
src/**/*.spec.tsx
```

#### 🧩 Calidad de las pruebas unitarias

Analizar entre 5 y 10 archivos de prueba:

- [ ] **(1 pt)** Uso de `@testing-library/react-native` (render, fireEvent, waitFor)
- [ ] **(1 pt)** Pruebas de componentes aisladas con props simuladas
- [ ] **(1 pt)** Pruebas de hooks personalizados con `@testing-library/react-hooks`
- [ ] **(1 pt)** Mocks apropiados para módulos nativos (AsyncStorage, etc.)
- [ ] **(1 pt)** Pruebas de casos límite y errores

**Ejemplo de buena prueba:**
```typescript
describe('LoginButton', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<LoginButton onPress={onPress} />);

    fireEvent.press(getByText('Login'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Paso 4: Pruebas de Integración (4 puntos)

- [ ] **(1 pt)** Pruebas de flujos de usuario completos
- [ ] **(1 pt)** Pruebas de navegación entre pantallas
- [ ] **(1 pt)** Pruebas de llamadas a API simuladas
- [ ] **(1 pt)** Pruebas de gestión del estado (Context, Redux, Zustand)

**Archivos a verificar:**
```bash
src/**/*.integration.test.tsx
__tests__/integration/
```

### Paso 5: Pruebas E2E con Detox (4 puntos)

#### 🤖 Configuración de Detox

- [ ] **(1 pt)** `.detoxrc.js` o configuración de Detox presente
- [ ] **(1 pt)** Configuración para iOS y Android
- [ ] **(1 pt)** Scripts de prueba E2E en package.json (`test:e2e`)

**Archivos a verificar:**
```bash
.detoxrc.js
.detoxrc.json
e2e/
package.json
```

#### 🎬 Pruebas E2E

- [ ] **(1 pt)** Al menos 3 escenarios E2E críticos probados (inicio de sesión, navegación principal, acción clave)

**Archivos a verificar:**
```bash
e2e/**/*.e2e.ts
e2e/**/*.e2e.js
```

### Paso 6: Cobertura de Pruebas (4 puntos)

Ejecutar el comando de cobertura:

```bash
npm run test -- --coverage
# o
yarn test --coverage
```

Analizar el informe de cobertura:

- [ ] **(1 pt)** Cobertura global ≥ 80%
- [ ] **(1 pt)** Cobertura de ramas ≥ 75%
- [ ] **(1 pt)** Componentes críticos cubiertos al 100%
- [ ] **(1 pt)** Informe de cobertura generado (coverage/lcov-report/)

**Archivos a verificar:**
```bash
coverage/lcov-report/index.html
coverage/coverage-summary.json
```

### Paso 7: Calcular la puntuación

```
┌──────────────────────────────────┬─────────┬────────┐
│ Criterio                         │ Puntos  │ Estado │
├──────────────────────────────────┼─────────┼────────┤
│ Configuración de Jest            │ XX/5    │ ✅/⚠️/❌│
│ Pruebas Unitarias (RNTL)         │ XX/8    │ ✅/⚠️/❌│
│ Pruebas de Integración           │ XX/4    │ ✅/⚠️/❌│
│ Pruebas E2E (Detox)              │ XX/4    │ ✅/⚠️/❌│
│ Cobertura de Código              │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL TESTING                    │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Leyenda:**
- ✅ Excelente (≥ 20/25)
- ⚠️ Advertencia (15-19/25)
- ❌ Crítico (< 15/25)

### Paso 8: Informe detallado

## 📊 RESULTADOS DE LA AUDITORÍA DE TESTING

### ✅ Fortalezas

Enumerar las buenas prácticas identificadas:
- [Práctica 1 con ejemplo de prueba]
- [Práctica 2 con ejemplo de prueba]

### ⚠️ Puntos de Mejora

Enumerar los problemas identificados por prioridad:

1. **[Problema 1]**
   - **Gravedad:** Crítica/Alta/Media
   - **Ubicación:** [Archivos/componentes sin pruebas]
   - **Impacto:** [Riesgo de regresión]
   - **Recomendación:** [Acciones a tomar]

2. **[Problema 2]**
   - **Gravedad:** Crítica/Alta/Media
   - **Ubicación:** [Archivos/componentes sin pruebas]
   - **Impacto:** [Riesgo de regresión]
   - **Recomendación:** [Acciones a tomar]

### 📈 Métricas de Testing

#### Cobertura de código

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Tipo            │ Líneas   │ Ramas    │ Funciones│ Sentencias│
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Global          │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Componentes     │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Hooks           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Utils           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Servicios       │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘
```

#### Estadísticas de pruebas

- **Número total de pruebas:** XX
  - Pruebas unitarias: XX
  - Pruebas de integración: XX
  - Pruebas E2E: XX
- **Pruebas aprobadas:** XX
- **Pruebas fallidas:** XX
- **Tiempo total de ejecución:** XX segundos
- **Ratio pruebas/código:** XX pruebas para YY líneas de código

#### Componentes sin pruebas

Enumerar los componentes críticos sin pruebas:
1. `[Ruta/Componente]` - [Razón de criticidad]
2. `[Ruta/Componente]` - [Razón de criticidad]
3. `[Ruta/Componente]` - [Razón de criticidad]

#### Funcionalidades críticas probadas

- [ ] Autenticación (login, logout, refresh token)
- [ ] Navegación principal
- [ ] Formularios críticos
- [ ] Llamadas principales a la API
- [ ] Manejo de errores
- [ ] Estados de carga
- [ ] Gestión offline

### 🎯 TOP 3 ACCIONES PRIORITARIAS

#### 1. [ACCIÓN #1]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Componentes/funcionalidades a probar con prioridad]
- **Cobertura actual:** XX%
- **Cobertura objetivo:** YY%
- **Archivos afectados:**
  - `[archivo1]` (cobertura: XX%)
  - `[archivo2]` (cobertura: XX%)
- **Ejemplo de pruebas a añadir:**
```typescript
describe('[Componente]', () => {
  it('should [comportamiento]', () => {
    // Prueba a implementar
  });
});
```

#### 2. [ACCIÓN #2]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Configuración o mejora de pruebas]
- **Archivos afectados:** [Lista]

#### 3. [ACCIÓN #3]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Pruebas E2E o de integración a añadir]
- **Escenarios a cubrir:**
  - [Escenario 1]
  - [Escenario 2]

---

## 🚀 Recomendaciones

### Victorias Rápidas (Bajo esfuerzo, alto impacto)
- [Mejora rápida 1]
- [Mejora rápida 2]

### Inversiones (Esfuerzo medio/alto, alto impacto)
- [Mejora estructural 1]
- [Mejora estructural 2]

### Buenas prácticas a adoptar
- Escribir pruebas junto al código (TDD)
- Apuntar a una cobertura mínima del 80%
- Probar casos límite y errores
- Mantener las pruebas actualizadas con el código
- Usar snapshots con moderación

---

## 📚 Referencias

- `.claude/rules/07-testing.md` - Estándares de testing
- `.claude/rules/08-quality-tools.md` - Herramientas de calidad
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)

---

**Puntuación final: XX/25**
