---
description: Verificar el cumplimiento completo de Laravel
argument-hint: [argumentos]
---

# Verificar el cumplimiento completo de Laravel

## Argumentos

$ARGUMENTS (opcional: ruta del proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría de cumplimiento completa del proyecto Laravel orquestando las 4 verificaciones principales: Arquitectura, Calidad del Código, Pruebas y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

### Paso 1: Preparación de la auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de archivos de configuración (composer.json con laravel/*, .env.example)
- [ ] Listar los directorios principales (app/, tests/, config/, routes/, etc.)
- [ ] Identificar la estructura del proyecto y la versión de Laravel

**Nota**: Si se proporciona $ARGUMENTS, usarlo como ruta del proyecto; de lo contrario, usar el directorio actual.

### Paso 2: Auditoría de Arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usar el comando slash `/laravel:check-architecture` o seguir manualmente los pasos en `check-architecture.md`

**Criterios evaluados**:
- Separación de capas de Arquitectura Limpia (6 pts)
- Estructura Domain/Application/Infrastructure (6 pts)
- Patrón Actions y controladores delgados (4 pts)
- Bindings de Service Provider (4 pts)
- Patrón Repository e interfaces (3 pts)
- Reglas de dependencias (2 pts)

**Referencia**: `check-architecture.md`

### Paso 3: Auditoría de Calidad del Código (25 puntos)

Ejecutar la verificación de calidad del código:

**Comando**: Usar el comando slash `/laravel:check-code-quality` o seguir manualmente los pasos en `check-code-quality.md`

**Criterios evaluados**:
- Cumplimiento de PSR-12 y Laravel Pint (5 pts)
- Análisis estático con PHPStan (5 pts)
- Funcionalidades modernas de PHP (enums, readonly, typed properties) (4 pts)
- Principios KISS/DRY/YAGNI (4 pts)
- Convenciones de nomenclatura (estándares de Laravel) (4 pts)
- Manejo de errores y logging (3 pts)

**Referencia**: `check-code-quality.md`

### Paso 4: Auditoría de Pruebas (25 puntos)

Ejecutar la verificación de pruebas:

**Comando**: Usar el comando slash `/laravel:check-testing` o seguir manualmente los pasos en `check-testing.md`

**Criterios evaluados**:
- Cobertura de código (7 pts)
- Pruebas unitarias para lógica de dominio (6 pts)
- Pruebas de funcionalidad para endpoints HTTP (4 pts)
- Uso de Pest PHP y calidad de pruebas (3 pts)
- Factories y seeders de base de datos (3 pts)
- Aislamiento de pruebas y mocking (2 pts)

**Referencia**: `check-testing.md`

### Paso 5: Auditoría de Seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usar el comando slash `/laravel:check-security` o seguir manualmente los pasos en `check-security.md`

**Criterios evaluados**:
- Protecciones OWASP Top 10 (6 pts)
- Gestión de secretos y credenciales (5 pts)
- Validación con Form Request (4 pts)
- Vulnerabilidades en dependencias (composer audit) (4 pts)
- Autenticación y Autorización (Policies) (3 pts)
- Configuración de CSRF y middlewares (2 pts)
- Prevención de inyección SQL (1 pt)

**Referencia**: `check-security.md`

### Paso 6: Consolidación y Puntuación Global

Calcular la puntuación general y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar categorías críticas (<50%)
- [ ] Listar todos los problemas transversales críticos
- [ ] Priorizar acciones por impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de calificación**:
- 90-100: Excelente — Proyecto de referencia
- 75-89: Muy Bueno — Algunas mejoras menores
- 60-74: Aceptable — Requiere mejoras
- 40-59: Insuficiente — Refactorización mayor necesaria
- 0-39: Crítico — Renovación completa necesaria

### Paso 7: Recomendaciones y Plan de Acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 principales acciones prioritarias en todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) para cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) para cada acción
- [ ] Proponer el orden de implementación
- [ ] Sugerir victorias rápidas (relación alto impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CUMPLIMIENTO LARAVEL - INFORME COMPLETO
=============================================

PUNTUACIÓN GLOBAL: XX/100

NIVEL DE CUMPLIMIENTO: [Excelente/Muy Bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

ARQUITECTURA       : XX/25  [██████████░░░░░░░░░░] XX%
CALIDAD DE CÓDIGO  : XX/25  [██████████░░░░░░░░░░] XX%
PRUEBAS            : XX/25  [██████████░░░░░░░░░░] XX%
SEGURIDAD          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORTALEZAS GENERALES:
1. [Fortaleza identificada en múltiples categorías]
2. [Otra fortaleza principal]
3. [Tercera fortaleza]

MEJORAS GENERALES:
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
  • Capas de Arquitectura Limpia    : XX/6
  • Estructura Domain/App/Infra     : XX/6
  • Actions y controladores delgados: XX/4
  • Bindings de Service Provider    : XX/4
  • Patrón Repository               : XX/3
  • Reglas de dependencias          : XX/2

Fortalezas:
- [Fortalezas de arquitectura]

Problemas:
- [Problemas de arquitectura]

[Secciones similares para Calidad del Código, Pruebas y Seguridad...]

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

[Párrafo de resumen sobre el estado general del proyecto, principales fortalezas,
principales debilidades y la trayectoria recomendada para mejorar
el cumplimiento. Indicar si el proyecto está listo para producción,
requiere correcciones o necesita refactorización.]

Recomendación General: [Listo para producción / Correcciones menores /
Refactorización mayor / Renovación necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar acciones basándose en la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad
- Proponer correcciones automatizables (scripts, hooks de pre-commit)
- El informe debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones al contexto de negocio del proyecto
