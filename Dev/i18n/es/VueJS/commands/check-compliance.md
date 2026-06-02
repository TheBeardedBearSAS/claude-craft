---
description: Verificar el cumplimiento completo del proyecto Vue.js
argument-hint: [arguments]
---

# Verificar el Cumplimiento Completo de Vue.js

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría de cumplimiento completa del proyecto Vue.js orquestando las 4 verificaciones principales: Arquitectura, Calidad de Código, Pruebas y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

### Paso 1: Preparación de la Auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de los archivos de configuración (package.json, tsconfig.json, vite.config.ts)
- [ ] Listar los directorios principales (src/, tests/, public/, etc.)
- [ ] Identificar la estructura del proyecto y la versión de Vue.js

**Nota**: Si se proporciona $ARGUMENTS, usar como ruta del proyecto; en caso contrario, usar el directorio actual.

### Paso 2: Auditoría de Arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usar el slash command `/vuejs:check-architecture` o seguir manualmente los pasos de `check-architecture.md`

**Criterios Evaluados**:
- Organización de componentes y funcionalidades (6 pts)
- Estructura y reutilización de composables (6 pts)
- Arquitectura de los stores Pinia (4 pts)
- Configuración del router y lazy loading (4 pts)
- Separación del módulo compartido/common (3 pts)
- Reglas de dependencias y barrel exports (2 pts)

**Referencia**: `check-architecture.md`

### Paso 3: Auditoría de Calidad de Código (25 puntos)

Ejecutar la verificación de calidad de código:

**Comando**: Usar el slash command `/vuejs:check-code-quality` o seguir manualmente los pasos de `check-code-quality.md`

**Criterios Evaluados**:
- Modo estricto de TypeScript y seguridad de tipos (5 pts)
- Cumplimiento de ESLint y Prettier (5 pts)
- Uso de la Composition API y script setup (4 pts)
- Principios KISS/DRY/YAGNI (4 pts)
- Convenciones de nomenclatura (4 pts)
- Gestión de errores (3 pts)

**Referencia**: `check-code-quality.md`

### Paso 4: Auditoría de Pruebas (25 puntos)

Ejecutar la verificación de pruebas:

**Comando**: Usar el slash command `/vuejs:check-testing` o seguir manualmente los pasos de `check-testing.md`

**Criterios Evaluados**:
- Cobertura de código (7 pts)
- Pruebas unitarias de composables y stores (6 pts)
- Pruebas de componentes con Vue Test Utils (4 pts)
- Pruebas de integración (3 pts)
- Calidad de las pruebas y patrón AAA (3 pts)
- Organización de mocks y fixtures (2 pts)

**Referencia**: `check-testing.md`

### Paso 5: Auditoría de Seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usar el slash command `/vuejs:check-security` o seguir manualmente los pasos de `check-security.md`

**Criterios Evaluados**:
- Prevención de XSS (uso de v-html) (6 pts)
- Gestión de secretos y credenciales (5 pts)
- Validación y saneamiento de entradas (4 pts)
- Vulnerabilidades en dependencias (4 pts)
- Autenticación y guards de ruta (3 pts)
- Comunicación segura con la API (2 pts)
- Protección CSRF (1 pt)

**Referencia**: `check-security.md`

### Paso 6: Consolidación y Puntuación Global

Calcular la puntuación general y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar categorías críticas (<50%)
- [ ] Listar todos los problemas transversales críticos
- [ ] Priorizar acciones por impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de Calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy Bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Refactorización mayor requerida
- 0-39: Crítico - Revisión completa necesaria

### Paso 7: Recomendaciones y Plan de Acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias de todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) para cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) para cada acción
- [ ] Proponer el orden de implementación
- [ ] Sugerir victorias rápidas (alto impacto/bajo esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CUMPLIMIENTO VUE.JS - INFORME COMPLETO
=====================================================

PUNTUACIÓN GLOBAL: XX/100

NIVEL DE CUMPLIMIENTO: [Excelente/Muy Bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

ARQUITECTURA       : XX/25  [██████████░░░░░░░░░░] XX%
CALIDAD DE CÓDIGO  : XX/25  [██████████░░░░░░░░░░] XX%
PRUEBAS            : XX/25  [██████████░░░░░░░░░░] XX%
SEGURIDAD          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORTALEZAS GLOBALES:
1. [Fortaleza identificada en múltiples categorías]
2. [Otra fortaleza principal]
3. [Tercera fortaleza]

MEJORAS GLOBALES:
1. [Mejora transversal menor]
2. [Otra mejora recomendada]
3. [Tercera mejora]

PROBLEMAS CRÍTICOS:
1. [Problema crítico #1 - categoría afectada]
2. [Problema crítico #2 - categoría afectada]
3. [Problema crítico #3 - categoría afectada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALLES POR CATEGORÍA:

┌─────────────────────────────────────────────┐
│ ARQUITECTURA (XX/25)                        │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Organización de componentes y funcionalidades : XX/6
  • Estructura de composables                     : XX/6
  • Arquitectura de stores Pinia                  : XX/4
  • Router y lazy loading                         : XX/4
  • Separación del módulo compartido              : XX/3
  • Reglas de dependencias                        : XX/2

Fortalezas:
- [Fortalezas de arquitectura]

Problemas:
- [Problemas de arquitectura]

[Secciones similares para Calidad de Código, Pruebas y Seguridad...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICO - [Acción #1]
   Categoría  : [Arquitectura/Calidad/Pruebas/Seguridad]
   Impacto    : [Alto/Medio/Bajo]
   Esfuerzo   : [Alto/Medio/Bajo]
   Prioridad  : INMEDIATA

   Descripción detallada:
   [Explicación del problema y solución propuesta]

   Archivos afectados:
   - [archivo:línea]

   Ejemplo de corrección:
   [Código o comando de corrección]

2. IMPORTANTE - [Acción #2]
   [Mismo formato...]

3. RECOMENDADO - [Acción #3]
   [Mismo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VICTORIAS RÁPIDAS (Alto Impacto / Bajo Esfuerzo):

- [Victoria rápida #1] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida #2] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida #3] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN DE ACCIÓN RECOMENDADO:

SEMANA 1 (Inmediato):
- [ ] [Acción crítica #1]
- [ ] [Victoria rápida prioritaria]

SEMANAS 2-4 (Corto plazo):
- [ ] [Acción importante #2]
- [ ] [Otras victorias rápidas]

MESES 2-3 (Medio plazo):
- [ ] [Acción recomendada #3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo de resumen sobre el estado general del proyecto, las principales
fortalezas, las principales debilidades y la trayectoria recomendada para
mejorar el cumplimiento. Indicar si el proyecto está listo para producción,
requiere correcciones o necesita refactorización.]

Recomendación General: [Listo para producción / Correcciones menores /
Refactorización mayor / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la prioridad máxima
- Proponer correcciones automatizables (scripts, hooks pre-commit)
- El informe debe ser accionable, no meramente descriptivo
- Adaptar las recomendaciones al contexto de negocio del proyecto
