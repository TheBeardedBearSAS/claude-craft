---
description: Verificar Arquitectura de React Native
argument-hint: [arguments]
---

# Verificar Arquitectura de React Native

## Argumentos

$ARGUMENTS

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en auditoría de arquitectura React Native. Tu misión es analizar el cumplimiento arquitectónico del proyecto según los estándares definidos en `.claude/rules/02-architecture.md`.

### Paso 1: Explorar estructura

1. Analizar la estructura raíz del proyecto
2. Identificar el tipo de arquitectura (Expo, React Native CLI, Expo Router)
3. Localizar carpetas principales: `src/`, `app/`, `components/`, etc.

### Paso 2: Verificar cumplimiento arquitectónico

Realizar las siguientes verificaciones y anotar cada resultado:

#### 📁 Estructura Basada en Features (8 puntos)

Verificar si el proyecto utiliza organización basada en features:

- [ ] **(2 pts)** Estructura por features/dominios (ej: `src/features/auth/`, `src/features/profile/`)
- [ ] **(2 pts)** Cada feature contiene sus propios componentes, hooks y lógica
- [ ] **(2 pts)** Separación clara entre `features/` (negocio) y `shared/` (común)
- [ ] **(2 pts)** Organización consistente en todas las features

**Archivos a verificar:**
```bash
src/features/*/
src/shared/
app/(tabs)/
```

#### 🗂️ Organización de Carpetas (5 puntos)

- [ ] **(1 pt)** `components/` para componentes reutilizables
- [ ] **(1 pt)** `hooks/` para hooks personalizados
- [ ] **(1 pt)** `services/` o `api/` para llamadas de red
- [ ] **(1 pt)** `utils/` o `helpers/` para funciones utilitarias
- [ ] **(1 pt)** `types/` o `models/` para definiciones TypeScript

**Archivos a verificar:**
```bash
src/components/
src/hooks/
src/services/
src/utils/
src/types/
```

#### 🚦 Expo Router / Navegación (4 puntos)

Si el proyecto usa Expo Router:

- [ ] **(1 pt)** Carpeta `app/` en la raíz con estructura de enrutamiento basada en archivos
- [ ] **(1 pt)** Layouts definidos (`_layout.tsx`) para navegación
- [ ] **(1 pt)** Organización de rutas por grupos `(tabs)`, `(stack)`, etc.
- [ ] **(1 pt)** Tipado de parámetros de navegación

Si React Navigation:

- [ ] **(1 pt)** Configuración centralizada de navegadores
- [ ] **(1 pt)** Tipos para rutas y parámetros
- [ ] **(1 pt)** Deep linking configurado
- [ ] **(1 pt)** Guards de navegación si es necesario

**Archivos a verificar:**
```bash
app/_layout.tsx
app/(tabs)/_layout.tsx
src/navigation/
```

#### 🔌 Arquitectura por Capas (4 puntos)

- [ ] **(1 pt)** Separación presentación / lógica (componentes UI vs contenedores)
- [ ] **(1 pt)** Capa de servicio para acceso a datos
- [ ] **(1 pt)** Hooks personalizados para lógica reutilizable
- [ ] **(1 pt)** Gestión de estado centralizada (Context, Zustand, Redux, etc.)

**Archivos a verificar:**
```bash
src/hooks/
src/services/
src/store/ or src/contexts/
```

#### 🎨 Organización de Assets (4 puntos)

- [ ] **(1 pt)** Carpeta `assets/` estructurada (images, fonts, icons)
- [ ] **(1 pt)** Constantes usadas para rutas de assets
- [ ] **(1 pt)** Optimización de imágenes (WebP, dimensiones apropiadas)
- [ ] **(1 pt)** SVG mediante `react-native-svg` o equivalente

**Archivos a verificar:**
```bash
assets/
src/constants/assets.ts
```

### Paso 3: Reglas Específicas de React Native

Referencia: `.claude/rules/02-architecture.md`

Verificar los siguientes puntos:

#### ⚡ Performance y optimización

- [ ] Uso de `React.memo()` para componentes costosos
- [ ] Uso apropiado de `useMemo()` y `useCallback()`
- [ ] Sin lógica pesada en render
- [ ] FlatList/SectionList para listas largas (no ScrollView)

#### 🔄 Gestión de Estado

- [ ] Solución de gestión de estado claramente definida
- [ ] Estado local vs global bien separado
- [ ] Sin props drilling excesivo

#### 📱 Específicos de Mobile

- [ ] Gestión de SafeAreaView
- [ ] Soporte de código específico de plataforma cuando sea necesario
- [ ] Gestión de teclado (KeyboardAvoidingView)
- [ ] Gestión de permisos mobile

### Paso 4: Calcular puntuación

Sumar los puntos obtenidos para cada sección:

```
┌──────────────────────────────────┬─────────┬────────┐
│ Criterio                         │ Puntos  │ Estado │
├──────────────────────────────────┼─────────┼────────┤
│ Estructura Basada en Features    │ XX/8    │ ✅/⚠️/❌│
│ Organización de Carpetas         │ XX/5    │ ✅/⚠️/❌│
│ Expo Router / Navegación         │ XX/4    │ ✅/⚠️/❌│
│ Arquitectura por Capas           │ XX/4    │ ✅/⚠️/❌│
│ Organización de Assets           │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL ARQUITECTURA               │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Leyenda:**
- ✅ Excelente (≥ 20/25)
- ⚠️ Advertencia (15-19/25)
- ❌ Crítico (< 15/25)

### Paso 5: Informe detallado

## 📊 RESULTADOS DE AUDITORÍA DE ARQUITECTURA

### ✅ Fortalezas

Listar las buenas prácticas identificadas:
- [Práctica 1 con ejemplo de archivo]
- [Práctica 2 con ejemplo de archivo]

### ⚠️ Puntos de Mejora

Listar los problemas identificados por prioridad:

1. **[Problema 1]**
   - **Impacto:** Crítico/Alto/Medio
   - **Ubicación:** [Rutas de archivos]
   - **Recomendación:** [Acción concreta]

2. **[Problema 2]**
   - **Impacto:** Crítico/Alto/Medio
   - **Ubicación:** [Rutas de archivos]
   - **Recomendación:** [Acción concreta]

### 📈 Métricas de Arquitectura

- **Número de features:** XX
- **Profundidad máxima de carpetas:** XX niveles
- **Componentes compartidos:** XX
- **Hooks personalizados:** XX
- **Servicios API:** XX

### 🎯 TOP 3 ACCIONES PRIORITARIAS

#### 1. [ACCIÓN #1]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Detalle]
- **Archivos:** [Lista]

#### 2. [ACCIÓN #2]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Detalle]
- **Archivos:** [Lista]

#### 3. [ACCIÓN #3]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** Crítico/Alto/Medio
- **Descripción:** [Detalle]
- **Archivos:** [Lista]

---

## 📚 Referencias

- `.claude/rules/02-architecture.md` - Estándares de arquitectura
- `.claude/rules/14-navigation.md` - Estándares de navegación
- `.claude/rules/13-state-management.md` - Estándares de gestión de estado

---

**Puntuación final: XX/25**
