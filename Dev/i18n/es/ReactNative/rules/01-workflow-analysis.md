# Análisis de Flujo de Trabajo - Análisis Obligatorio Antes de Programar

## Introducción

**REGLA ABSOLUTA**: Antes de cualquier modificación de código, se debe realizar una fase de análisis OBLIGATORIA. Esta regla es innegociable y garantiza la calidad del código producido.

---

## Principio Fundamental

> "Pensar Primero, Programar Después"

Cada intervención de código debe estar precedida por un análisis metódico para:
- Comprender el contexto
- Identificar impactos
- Anticipar problemas
- Elegir la mejor solución

---

## Fase 1: Comprensión de la Necesidad

### 1.1 Clarificación de la Solicitud

**Preguntas que hacer**:
- ¿Cuál es la necesidad exacta del usuario?
- ¿Qué problema estamos intentando resolver?
- ¿Cuáles son los criterios de aceptación?
- ¿Hay restricciones técnicas o de negocio?

**Acciones**:
```typescript
// ANTES de programar, documentar:
/**
 * NECESIDAD: [Descripción clara de la necesidad]
 * PROBLEMA: [Problema a resolver]
 * CRITERIOS: [Criterios de aceptación]
 * RESTRICCIONES: [Restricciones identificadas]
 */
```

### 1.2 Análisis del Contexto de Negocio

**Comprender**:
- El flujo de usuario impactado
- Reglas de negocio aplicables
- Impacto en la experiencia del usuario
- Casos de uso

**Ejemplo**:
```typescript
// Feature: Añadir sistema de favoritos
//
// CONTEXTO DE NEGOCIO:
// - El usuario debe poder marcar artículos como favoritos
// - Los favoritos deben ser accesibles sin conexión
// - Los favoritos se sincronizan entre dispositivos
// - Máximo 100 favoritos por usuario
//
// IMPACTO UX:
// - Ícono de corazón en cada artículo
// - Pantalla dedicada de favoritos
// - Feedback visual inmediato (actualización optimista)
```

---

## Fase 2: Análisis Técnico

### 2.1 Exploración del Código Existente

**Usar herramientas de búsqueda**:

```bash
# Buscar patrones similares
npx expo-search "patron-similar"

# Buscar implementación existente
grep -r "relatedFeature" src/

# Identificar dependencias
grep -r "import.*TargetComponent" src/
```

**Lista de verificación de exploración**:
- [ ] Componentes existentes reutilizables
- [ ] Hooks personalizados disponibles
- [ ] Servicios API ya implementados
- [ ] Gestión de estado en su lugar
- [ ] Patrones de navegación utilizados
- [ ] Estilos y tema consistentes

### 2.2 Análisis de Arquitectura

**Preguntas de arquitectura**:
- ¿Dónde encaja esta funcionalidad en la arquitectura?
- ¿Qué capas se ven impactadas? (UI, Lógica, Datos, Navegación)
- ¿Hay un patrón establecido que seguir?
- ¿Debería crear un nuevo módulo o extender el existente?

**Ejemplo de análisis**:
```typescript
// Feature: Sistema de favoritos
//
// CAPAS IMPACTADAS:
//
// 1. CAPA DE DATOS
//    - Nuevo store: stores/favorites.store.ts
//    - Servicio API: services/api/favorites.service.ts
//    - Almacenamiento: services/storage/favorites.storage.ts
//    - Tipos: types/Favorite.types.ts
//
// 2. CAPA DE LÓGICA
//    - Hook: hooks/useFavorites.ts
//    - Hook: hooks/useFavoriteToggle.ts
//    - Utilidades: utils/favorites.utils.ts
//
// 3. CAPA DE UI
//    - Componente: components/FavoriteButton.tsx
//    - Pantalla: screens/FavoritesScreen.tsx
//    - Ícono: components/ui/FavoriteIcon.tsx
//
// 4. NAVEGACIÓN
//    - Ruta: app/(tabs)/favorites.tsx
//    - Deep link: favorites/:id
```

### 2.3 Análisis de Dependencias

**Identificar**:
- Bibliotecas externas requeridas
- Dependencias internas (módulos, componentes)
- Posibles dependencias circulares
- Versiones compatibles

**Plantilla de análisis**:
```typescript
// DEPENDENCIAS REQUERIDAS:
//
// Nuevas bibliotecas:
// - @react-native-async-storage/async-storage (almacenamiento)
// - react-query (sincronización API)
//
// Módulos internos:
// - stores/user.store (para userId)
// - services/api/client (para llamadas API)
// - hooks/useAuth (para autenticación)
//
// Verificaciones:
// - Sin dependencia circular con features/articles
// - Compatible con arquitectura existente
```

---

## Fase 3: Identificación de Impacto

### 3.1 Impacto en el Código Existente

**Analizar**:
- ¿Qué archivos se modificarán?
- ¿Qué componentes se verán impactados?
- ¿Hay cambios incompatibles?
- ¿Se verán afectados los tests existentes?

**Lista de verificación de impacto**:
```typescript
// IMPACTO EN CÓDIGO EXISTENTE:
//
// MODIFICACIONES:
// - screens/ArticleDetailScreen.tsx (añadir FavoriteButton)
// - components/ArticleCard.tsx (añadir ícono de favorito)
// - navigation/TabNavigator.tsx (añadir pestaña Favoritos)
//
// NUEVOS ARCHIVOS:
// - stores/favorites.store.ts
// - screens/FavoritesScreen.tsx
// - hooks/useFavorites.ts
//
// CAMBIOS INCOMPATIBLES: Ninguno
//
// TESTS A MODIFICAR:
// - ArticleCard.test.tsx (nuevos props)
// - ArticleDetailScreen.test.tsx (nuevo botón)
```

### 3.2 Impacto en el Rendimiento

**Considerar**:
- Impacto en el tamaño del bundle
- Rendimiento en tiempo de ejecución (FPS, memoria)
- Tamaño de assets
- Solicitudes de red adicionales
- Almacenamiento utilizado

**Ejemplo**:
```typescript
// ANÁLISIS DE RENDIMIENTO:
//
// TAMAÑO DEL BUNDLE:
// - Añadir react-query: +50kb (gzipped)
// - Nueva pantalla: ~15kb
// - TOTAL: +65kb (aceptable < 100kb)
//
// TIEMPO DE EJECUCIÓN:
// - Renderizar lista de favoritos: FlatList con windowSize optimizado
// - Almacenamiento: MMKV (ultra rápido)
// - Red: Actualizaciones optimistas (sin latencia percibida)
//
// ALMACENAMIENTO:
// - Máx 100 favoritos × 1kb = 100kb (insignificante)
```

### 3.3 Impacto UX/UI

**Evaluar**:
- Consistencia con el sistema de diseño
- Accesibilidad
- Responsive (tablet, teléfono)
- Animaciones y transiciones
- Feedback del usuario

**Lista de verificación UX**:
```typescript
// ANÁLISIS UX/UI:
//
// SISTEMA DE DISEÑO:
// - Usar theme.colors.primary para ícono activo
// - Usar componente Button existente
// - Animación: escala + feedback háptico
//
// ACCESIBILIDAD:
// - Etiqueta: "Añadir a favoritos" / "Eliminar de favoritos"
// - Compatible con lector de pantalla
// - Hit slop: mínimo 44x44
//
// RESPONSIVE:
// - Ícono adaptado para tablet (más grande)
// - Cuadrícula de favoritos: 2 columnas móvil, 3 tablet
//
// FEEDBACK:
// - Feedback háptico al alternar
// - Notificación toast en éxito
// - Animación del corazón
```

---

## Fase 4: Diseño de Solución

### 4.1 Selección de Enfoque

**Comparar opciones**:

```typescript
// ENFOQUE 1: Local First con sincronización
// PROS:
// - Funciona sin conexión
// - Rendimiento óptimo
// - UX fluida
// CONTRAS:
// - Complejidad de sincronización
// - Conflictos potenciales
//
// ENFOQUE 2: Solo API
// PROS:
// - Simple
// - Sin sincronización
// - Única fuente de verdad
// CONTRAS:
// - Requiere conexión
// - Latencia
//
// DECISIÓN: Enfoque 1 (Local First)
// RAZÓN: Mejor UX, funcionalidad offline crítica
```

### 4.2 Patrón de Diseño a Usar

**Identificar patrón apropiado**:

```typescript
// PATRONES APLICABLES:
//
// 1. GESTIÓN DE ESTADO: Zustand
//    - Store global para favoritos
//    - Persistir con MMKV
//
// 2. OBTENCIÓN DE DATOS: React Query
//    - Query favoritos con caché
//    - Mutation para alternar
//    - Actualizaciones optimistas
//
// 3. PATRÓN DE COMPONENTE: Compound Component
//    - FavoriteButton.Toggle
//    - FavoriteButton.Icon
//    - FavoriteButton.Count
//
// 4. PATRÓN DE HOOK: Custom Hook
//    - useFavorites() para datos
//    - useFavoriteToggle() para acción
```

### 4.3 Estructura de Datos

**Definir tipos**:

```typescript
// TIPOS DEFINIDOS:

// Entidad de Favorito
interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
  syncedAt?: Date;
  localOnly?: boolean; // Para favoritos no sincronizados aún
}

// Respuesta de API
interface FavoritesResponse {
  favorites: Favorite[];
  total: number;
}

// Estado del Store
interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  addFavorite: (articleId: string) => Promise<void>;
  removeFavorite: (articleId: string) => Promise<void>;
  isFavorite: (articleId: string) => boolean;
  sync: () => Promise<void>;
}
```

---

## Fase 5: Plan de Implementación

### 5.1 Desglose de Tareas

**Crear plan detallado**:

```typescript
// PLAN DE IMPLEMENTACIÓN:
//
// PASO 1: Tipos e Interfaces
// - Crear types/Favorite.types.ts
// - Definir interfaces
// Duración: 30min
//
// PASO 2: Capa de Almacenamiento
// - Implementar favorites.storage.ts
// - Tests de almacenamiento
// Duración: 1h
//
// PASO 3: Servicio API
// - Implementar favorites.service.ts
// - Mock respuestas de API
// Duración: 1h
//
// PASO 4: Store
// - Crear favorites.store.ts
// - Implementar acciones
// - Tests de store
// Duración: 2h
//
// PASO 5: Hooks
// - Crear useFavorites
// - Crear useFavoriteToggle
// - Tests de hooks
// Duración: 1h30
//
// PASO 6: Componentes UI
// - FavoriteButton
// - FavoriteIcon
// - Tests de componentes
// Duración: 2h
//
// PASO 7: Pantalla
// - FavoritesScreen
// - Configuración de navegación
// - Tests de pantalla
// Duración: 2h
//
// PASO 8: Integración
// - Integrar en ArticleCard
// - Integrar en ArticleDetail
// - Tests E2E
// Duración: 2h
//
// TOTAL: ~12h
```

### 5.2 Orden de Implementación

**Regla**: Siempre de abajo hacia arriba

```typescript
// ORDEN DE IMPLEMENTACIÓN:
//
// 1. Fundamentos (Capa de Datos)
//    ↓
// 2. Servicios y Almacenamiento
//    ↓
// 3. Gestión de Estado
//    ↓
// 4. Lógica de Negocio (Hooks)
//    ↓
// 5. Componentes UI (tontos)
//    ↓
// 6. Componentes UI (inteligentes)
//    ↓
// 7. Pantallas
//    ↓
// 8. Navegación e Integración
//    ↓
// 9. Tests E2E
```

### 5.3 Identificación de Riesgos

**Anticipar problemas**:

```typescript
// RIESGOS IDENTIFICADOS:
//
// RIESGO 1: Conflictos de sincronización
// - Impacto: Alto
// - Probabilidad: Media
// - Mitigación: Resolución basada en timestamp, último escrito gana
//
// RIESGO 2: Límite de 100 favoritos
// - Impacto: Medio
// - Probabilidad: Baja
// - Mitigación: Advertencia UI en 90 favoritos, eliminar más antiguo
//
// RIESGO 3: Rendimiento de lista de favoritos
// - Impacto: Medio
// - Probabilidad: Baja
// - Mitigación: FlatList virtualizada, paginación
//
// RIESGO 4: Espacio de almacenamiento
// - Impacto: Bajo
// - Probabilidad: Muy baja
// - Mitigación: Limpieza de favoritos antiguos sincronizados
```

---

## Fase 6: Validación Pre-Implementación

### 6.1 Lista de Verificación de Validación

**Antes de programar, verificar**:

```typescript
// LISTA DE VERIFICACIÓN DE VALIDACIÓN:
//
// ANÁLISIS:
// ✓ Necesidad claramente comprendida
// ✓ Contexto de negocio analizado
// ✓ Arquitectura estudiada
// ✓ Dependencias identificadas
// ✓ Impactos evaluados
//
// DISEÑO:
// ✓ Solución elegida y justificada
// ✓ Patrones identificados
// ✓ Tipos definidos
// ✓ Plan de implementación creado
//
// RIESGOS:
// ✓ Riesgos identificados
// ✓ Mitigaciones planificadas
//
// CALIDAD:
// ✓ Tests planificados
// ✓ Rendimiento considerado
// ✓ Accesibilidad provista
// ✓ Documentación preparada
//
// LISTO PARA PROGRAMAR: SÍ ✓
```

### 6.2 Revisión de Diseño

**Puntos de revisión**:

```typescript
// PREGUNTAS DE REVISIÓN:
//
// 1. ¿Es la solución KISS (Keep It Simple)?
//    → Sí, patrón estándar React Query + Zustand
//
// 2. ¿Respeta DRY?
//    → Sí, hooks reutilizables
//
// 3. ¿Sigue SOLID?
//    → Sí, responsabilidades separadas
//
// 4. ¿Es testeable?
//    → Sí, cada capa independiente
//
// 5. ¿Es performante?
//    → Sí, actualizaciones optimistas, FlatList
//
// 6. ¿Es mantenible?
//    → Sí, código claro, bien tipado, documentado
//
// 7. ¿Respeta la arquitectura?
//    → Sí, sigue patrones establecidos
//
// VALIDACIÓN: APROBADO ✓
```

---

## Fase 7: Documentación del Análisis

### 7.1 Plantilla de Documentación

**Crear un ADR (Architecture Decision Record)**:

```markdown
# ADR-XXX: Sistema de Favoritos

## Estado
Propuesto

## Contexto
Los usuarios necesitan marcar artículos como favoritos
para accederlos rápidamente, incluso sin conexión.

## Decisión
Implementación de un sistema de favoritos con:
- Enfoque local-first (almacenamiento MMKV)
- Sincronización en segundo plano (React Query)
- Actualizaciones optimistas (UX fluida)
- Límite: 100 favoritos por usuario

## Consecuencias

### Positivas
- Funciona sin conexión
- Rendimiento óptimo
- UX fluida
- Sincronización automática

### Negativas
- Complejidad de sincronización
- Gestión de conflictos
- Almacenamiento local requerido

## Alternativas Consideradas
1. Solo API: Rechazado (requiere conexión)
2. AsyncStorage: Rechazado (rendimiento)

## Notas de Implementación
- Store: Zustand con persistencia MMKV
- API: React Query con actualizaciones optimistas
- Límite: Advertencia UI en 90 favoritos
```

### 7.2 Documentación en Línea

**En el código, documentar decisiones**:

```typescript
/**
 * Store de Favoritos
 *
 * DECISIONES:
 * - Zustand para gestión de estado (simple, performante)
 * - MMKV para persistencia (ultra rápido)
 * - Actualizaciones optimistas (mejor UX)
 *
 * LÍMITES:
 * - Máx 100 favoritos por usuario
 * - Sincronización cada 5min en segundo plano
 *
 * @see ADR-XXX para detalles de arquitectura
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Implementación
    }),
    {
      name: 'favorites',
      storage: createMMKVStorage(),
    }
  )
);
```

---

## Ejemplos Completos

### Ejemplo 1: Añadir una Funcionalidad Compleja

```typescript
// ========================================
// ANÁLISIS: Feature "Notificaciones Push"
// ========================================

// FASE 1: COMPRENSIÓN
// -----------------------
// NECESIDAD: Recibir notificaciones push para nuevos artículos
// CRITERIOS:
// - Notificaciones en iOS y Android
// - Opt-in (permiso del usuario)
// - Notificaciones silenciosas para sincronización de datos
// - Deep links a artículos

// FASE 2: ANÁLISIS TÉCNICO
// ---------------------------
// EXPLORACIÓN:
// - Expo Notifications ya instalado
// - Servicio push: FCM (Firebase Cloud Messaging)
// - Deep linking: Compatible con Expo Router
//
// ARQUITECTURA:
// - Servicio: services/notifications/push.service.ts
// - Store: stores/notifications.store.ts
// - Hook: hooks/useNotifications.ts
// - Provider: providers/NotificationsProvider.tsx

// FASE 3: IMPACTOS
// ----------------
// CÓDIGO:
// - Nuevo módulo notifications/
// - Modificar App.tsx (provider)
// - Actualizar app.json (config)
//
// RENDIMIENTO:
// - Bundle: +80kb (expo-notifications)
// - Tarea en segundo plano: Impacto mínimo
//
// UX:
// - Prompt de permiso (iOS/Android)
// - Actualización de pantalla de configuración
// - Toast para notificaciones recibidas

// FASE 4: DISEÑO
// -------------------
// ENFOQUE: Native Expo Notifications
// PATRÓN: Provider + Hook
// TIPOS:
interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: {
    type: 'article' | 'system';
    articleId?: string;
  };
}

// FASE 5: PLAN
// -------------
// 1. Configurar Firebase (2h)
// 2. Config app.json (30min)
// 3. Servicio de notificaciones (2h)
// 4. Store + Hook (1h30)
// 5. Provider (1h)
// 6. UI de configuración (2h)
// 7. Deep links (1h)
// 8. Tests (2h)
// TOTAL: 12h

// FASE 6: VALIDACIÓN
// -------------------
// ✓ Análisis completo
// ✓ Solución validada
// ✓ Plan detallado
// ✓ Riesgos identificados
// → LISTO PARA PROGRAMAR
```

### Ejemplo 2: Corrección de Bug

```typescript
// ========================================
// ANÁLISIS: Bug "Imágenes no en caché"
// ========================================

// FASE 1: COMPRENSIÓN
// -----------------------
// PROBLEMA: Las imágenes se recargan en cada visita
// SÍNTOMAS:
// - Parpadeo al hacer scroll
// - Alto consumo de datos
// - Rendimiento degradado
//
// REPRODUCCIÓN:
// 1. Hacer scroll en lista de artículos
// 2. Navegar a otro lugar
// 3. Regresar a lista
// 4. Las imágenes se recargan

// FASE 2: INVESTIGACIÓN
// ----------------------
// CÓDIGO ACTUAL:
<Image source={{ uri: article.imageUrl }} />

// PROBLEMA IDENTIFICADO:
// - Sin caché configurado
// - Caché predeterminado de Image de react-native débil
//
// SOLUCIONES POSIBLES:
// 1. expo-image (nuevo, performante)
// 2. react-native-fast-image (probado)
// 3. Caché manual con FileSystem

// FASE 3: IMPACTOS
// ----------------
// CAMBIO:
// - Reemplazar Image con expo-image
// - Migración ~50 archivos
//
// RENDIMIENTO:
// - Bundle: +40kb
// - Caché en disco: ~100MB máx
// - Mejora de FPS: +15-20%

// FASE 4: DECISIÓN
// -----------------
// ELECCIÓN: expo-image
// RAZÓN:
// - Integración nativa con Expo
// - Caché automático
// - Soporte de Blurhash
// - Mejor rendimiento

// FASE 5: PLAN
// -------------
// 1. Instalar expo-image (15min)
// 2. Crear componente CachedImage (30min)
// 3. Migración Image → CachedImage (2h)
// 4. Tests (1h)
// 5. Validación de rendimiento (30min)
// TOTAL: 4h15

// FASE 6: VALIDACIÓN
// -------------------
// ✓ Causa raíz identificada
// ✓ Solución probada
// ✓ Plan de migración claro
// → LISTO PARA CORREGIR
```

---

## Anti-Patrones a Evitar

### ❌ Programar Sin Analizar

```typescript
// MAL: Programar directamente
const handleFavorite = () => {
  // Programo sin pensar...
  fetch('/api/favorites', { ... });
};

// BIEN: Analizar luego programar
// 1. Analizar: ¿Necesita sincronización offline?
// 2. Diseñar: React Query + actualización optimista
// 3. Programar:
const { mutate } = useMutation({
  mutationFn: addFavorite,
  onMutate: optimisticUpdate,
});
```

### ❌ Ignorar Código Existente

```typescript
// MAL: Recrear lo que existe
const MyCustomButton = () => { ... };

// BIEN: Reutilizar
import { Button } from '@/components/ui/Button';
```

### ❌ Sobre-Ingeniería

```typescript
// MAL: Complejidad innecesaria
class FavoriteManager extends AbstractManager
  implements IFavoriteService, IObservable { ... }

// BIEN: Simple y efectivo
export function useFavorites() { ... }
```

---

## Lista de Verificación Final

**Antes de cada intervención de código**:

```typescript
// LISTA DE VERIFICACIÓN DE ANÁLISIS PRE-CÓDIGO
//
// □ Necesidad claramente definida
// □ Contexto de negocio comprendido
// □ Código existente explorado
// □ Arquitectura analizada
// □ Dependencias identificadas
// □ Impactos evaluados
// □ Solución diseñada
// □ Patrón elegido
// □ Tipos definidos
// □ Plan detallado creado
// □ Riesgos identificados
// □ Tests planificados
// □ Documentación preparada
//
// SI TODO MARCADO → PROGRAMAR
// SINO → CONTINUAR ANÁLISIS
```

---

## Conclusión

El análisis pre-código NO es una pérdida de tiempo, es una INVERSIÓN que:

- **Evita errores costosos**
- **Garantiza calidad del código**
- **Acelera el desarrollo** (menos refactorización)
- **Facilita el mantenimiento**
- **Mejora la colaboración**

> "Horas de análisis ahorran días de debugging"

---

**Regla de oro**: Dedicar tanto tiempo analizando como programando (ratio 1:1 mínimo).
