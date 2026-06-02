---
description: Verificación Completa de Conformidad de Symfony
argument-hint: [arguments]
---

# Verificación Completa de Conformidad de Symfony

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría de conformidad completa del proyecto Symfony orquestando las 4 verificaciones principales: Arquitectura, Calidad de Código, Pruebas y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

### Paso 1: Preparación de la Auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de los archivos de configuración (composer.json con symfony/*, .env)
- [ ] Listar los directorios principales (src/, tests/, config/, etc.)
- [ ] Identificar la estructura del proyecto y la versión de Symfony

**Nota**: Si se proporcionan $ARGUMENTS, usarlos como ruta del proyecto; en caso contrario, usar el directorio actual.

### Paso 2: Auditoría de Arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usar el comando slash `/symfony:check-architecture` o seguir manualmente los pasos de `check-architecture.md`

**Criterios Evaluados**:
- Estructura de Clean Architecture (6 pts)
- Separación Dominio/Aplicación/Infraestructura (6 pts)
- Arquitectura Hexagonal / Ports & Adapters (4 pts)
- Modelado DDD (Entidades, Value Objects, Agregados) (4 pts)
- Use Cases y Application Services (3 pts)
- Reglas de dependencia y Deptrac (2 pts)

**Referencia**: `check-architecture.md`

### Paso 3: Auditoría de Calidad de Código (25 puntos)

Ejecutar la verificación de calidad de código:

**Comando**: Usar el comando slash `/symfony:check-code-quality` o seguir manualmente los pasos de `check-code-quality.md`

**Criterios Evaluados**:
- Conformidad PSR-12 (5 pts)
- PHPStan nivel 9 (5 pts)
- Type hints estrictos y declare(strict_types=1) (4 pts)
- Principios KISS/DRY/YAGNI (4 pts)
- Documentación y PHPDoc (4 pts)
- Manejo de errores (3 pts)

**Referencia**: `check-code-quality.md`

### Paso 4: Auditoría de Pruebas (25 puntos)

Ejecutar la verificación de pruebas:

**Comando**: Usar el comando slash `/symfony:check-testing` o seguir manualmente los pasos de `check-testing.md`

**Criterios Evaluados**:
- Cobertura de código (7 pts)
- Pruebas unitarias del Dominio (6 pts)
- Pruebas de integración de Infraestructura (4 pts)
- Pruebas funcionales (WebTestCase/Behat) (3 pts)
- Pruebas de mutación con Infection (3 pts)
- Aislamiento de pruebas y fixtures (2 pts)

**Referencia**: `check-testing.md`

### Paso 5: Auditoría de Seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usar el comando slash `/symfony:check-security` o seguir manualmente los pasos de `check-security.md`

**Criterios Evaluados**:
- Configuración del Security Bundle de Symfony (6 pts)
- Protecciones OWASP Top 10 (5 pts)
- Gestión de secretos y credenciales (4 pts)
- Validación de entradas y CSRF (4 pts)
- Autenticación y Autorización (Voters) (3 pts)
- Vulnerabilidades de dependencias (2 pts)
- Conformidad GDPR (1 pt)

**Referencia**: `check-security.md`

### Paso 6: Consolidación y Puntuación Global

Calcular la puntuación global y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar las categorías críticas (<50%)
- [ ] Enumerar todos los problemas transversales críticos
- [ ] Priorizar las acciones por impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de Calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy Bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Refactorización importante necesaria
- 0-39: Crítico - Revisión completa necesaria

### Paso 7: Recomendaciones y Plan de Acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias principales en todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) para cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) para cada acción
- [ ] Proponer el orden de implementación
- [ ] Sugerir victorias rápidas (alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD SYMFONY - INFORME COMPLETO
=============================================

PUNTUACIÓN GLOBAL: XX/100

NIVEL DE CONFORMIDAD: [Excelente/Muy Bueno/Aceptable/Insuficiente/Crítico]

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
  • Estructura Clean Architecture     : XX/6
  • Separación de capas               : XX/6
  • Hexagonal / Ports & Adapters      : XX/4
  • Modelado DDD                      : XX/4
  • Use Cases                         : XX/3
  • Reglas de dependencia             : XX/2

Fortalezas:
- [Fortalezas de arquitectura]

Problemas:
- [Problemas de arquitectura]

[Secciones similares para Calidad de Código, Pruebas y Seguridad...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICO - [Acción #1]
   Categoría : [Arquitectura/Calidad/Pruebas/Seguridad]
   Impacto   : [Alto/Medio/Bajo]
   Esfuerzo  : [Alto/Medio/Bajo]
   Prioridad : INMEDIATA

   Descripción detallada:
   [Explicación del problema y solución propuesta]

   Archivos afectados:
   - [archivo:línea]

   Ejemplo de corrección:
   [Código o comando de corrección]

2. IMPORTANTE - [Acción #2]
   [Mismo formato...]

3. RECOMENDADA - [Acción #3]
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
mejorar la conformidad. Indicar si el proyecto está listo para producción,
requiere correcciones o necesita refactorización.]

Recomendación General: [Listo para producción / Correcciones menores /
Refactorización importante / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar las acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad
- Proponer correcciones automatizables (scripts, hooks de pre-commit)
- El informe debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones al contexto de negocio del proyecto
