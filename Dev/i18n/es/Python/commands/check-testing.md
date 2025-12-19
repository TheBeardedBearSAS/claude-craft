---
description: Verificar Pruebas Python
argument-hint: [arguments]
---

# Verificar Pruebas Python

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## MISIÓN

Realizar una auditoría completa de la estrategia de pruebas del proyecto Python verificando cobertura, calidad de pruebas y cumplimiento de mejores prácticas definidas en las reglas del proyecto.

### Paso 1: Estructura y Organización de Pruebas

Examinar organización de pruebas:
- [ ] Carpeta `tests/` en raíz del proyecto
- [ ] Estructura espejo del código fuente (tests/domain, tests/application, etc.)
- [ ] Archivos de prueba nombrados `test_*.py` o `*_test.py`
- [ ] Fixtures de pytest en `conftest.py`
- [ ] Separación de pruebas unit / integration / e2e

**Referencia**: `rules/07-testing.md` sección "Organización de Pruebas"

### Paso 2: Cobertura de Código

Medir cobertura de pruebas:
- [ ] Cobertura general ≥ 80%
- [ ] Cobertura Capa de Dominio ≥ 90%
- [ ] Cobertura Capa de Aplicación ≥ 85%
- [ ] Archivos críticos al 100%
- [ ] Configuración de cobertura en pyproject.toml

**Comando**: Ejecutar `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest pytest-cov && pytest /app --cov=/app --cov-report=term-missing"`

**Referencia**: `rules/07-testing.md` sección "Cobertura de Código"

### Paso 3: Pruebas Unitarias

Analizar calidad de pruebas unitarias:
- [ ] Pruebas aisladas (sin dependencias externas)
- [ ] Uso de mocks/stubs para dependencias
- [ ] Pruebas rápidas (<100ms por prueba)
- [ ] Una prueba = Un comportamiento
- [ ] Nomenclatura descriptiva: `test_should_X_when_Y`
- [ ] Patrón AAA (Arrange, Act, Assert)

**Referencia**: `rules/07-testing.md` sección "Pruebas Unitarias"

### Paso 4: Pruebas de Integración

Verificar pruebas de integración:
- [ ] Pruebas de interacciones entre componentes
- [ ] Pruebas de capa de Infraestructura (BD, API, etc.)
- [ ] Uso de bases de datos de prueba (fixtures)
- [ ] Limpieza después de cada prueba (teardown)
- [ ] Pruebas aisladas e independientes

**Referencia**: `rules/07-testing.md` sección "Pruebas de Integración"

### Paso 5: Aserciones y Calidad de Pruebas

Verificar calidad de aserciones:
- [ ] Aserciones explícitas y específicas
- [ ] Sin múltiples aserciones no relacionadas
- [ ] Mensajes de error claros
- [ ] Pruebas de casos extremos
- [ ] Pruebas de errores y excepciones
- [ ] Sin pruebas deshabilitadas sin razón (skip/xfail)

**Referencia**: `rules/07-testing.md` sección "Aserciones y Calidad de Pruebas"

### Paso 6: Fixtures y Parametrización

Evaluar uso de fixtures de pytest:
- [ ] Fixtures para setup/teardown común
- [ ] Ámbito apropiado (function, class, module, session)
- [ ] Parametrización con `@pytest.mark.parametrize`
- [ ] Factories para objetos de prueba complejos
- [ ] Sin duplicación en fixtures

**Referencia**: `rules/07-testing.md` sección "Fixtures de Pytest"

### Paso 7: Rendimiento y Ejecución

Analizar rendimiento de pruebas:
- [ ] Tiempo total de ejecución <30 segundos (pruebas unitarias)
- [ ] Pruebas paralelizables (pytest-xdist)
- [ ] Sin sleep() en pruebas
- [ ] Configuración de pytest en pyproject.toml
- [ ] CI/CD con ejecución automática de pruebas

**Comando**: Ejecutar `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest && pytest /app -v --duration=10"`

**Referencia**: `rules/07-testing.md` sección "Rendimiento de Pruebas"

### Paso 8: Test-Driven Development (TDD)

Verificar adopción de TDD:
- [ ] Pruebas escritas antes del código (si aplica)
- [ ] Ciclo Red-Green-Refactor
- [ ] Pruebas guiando el diseño
- [ ] Sin código sin probar en producción

**Referencia**: `rules/01-workflow-analysis.md` sección "Flujo de Trabajo TDD"

### Paso 9: Calcular Puntuación

Atribución de puntos (sobre 25):
- Cobertura de código: 7 puntos
- Pruebas unitarias: 6 puntos
- Pruebas de integración: 4 puntos
- Calidad de aserciones: 3 puntos
- Fixtures y organización: 3 puntos
- Rendimiento: 2 puntos

## FORMATO DE SALIDA

```
AUDITORÍA DE PRUEBAS PYTHON
================================

PUNTUACIÓN GENERAL: XX/25

FORTALEZAS:
- [Lista de buenas prácticas de pruebas observadas]

MEJORAS:
- [Lista de mejoras menores]

PROBLEMAS CRÍTICOS:
- [Lista de brechas críticas en pruebas]

DETALLES POR CATEGORÍA:

1. COBERTURA (XX/7)
   Estado: [Análisis de cobertura]
   Cobertura General: XX%
   Dominio: XX%
   Aplicación: XX%
   Infraestructura: XX%

2. PRUEBAS UNITARIAS (XX/6)
   Estado: [Calidad de pruebas unitarias]
   Número de Pruebas: XX
   Pruebas Aisladas: XX%
   Tiempo Promedio: XXms

3. PRUEBAS DE INTEGRACIÓN (XX/4)
   Estado: [Pruebas de integración]
   Número de Pruebas: XX
   Cobertura de Infraestructura: XX%

4. ASERCIONES (XX/3)
   Estado: [Calidad de aserciones]
   Aserciones Específicas: XX%
   Pruebas de Casos Extremos: XX

5. FIXTURES (XX/3)
   Estado: [Organización y fixtures]
   Fixtures Reutilizables: XX
   Pruebas Parametrizadas: XX

6. RENDIMIENTO (XX/2)
   Estado: [Rendimiento de pruebas]
   Tiempo Total: XXs
   Pruebas >1s: XX

TOP 3 ACCIONES PRIORITARIAS:
1. [Acción más crítica para mejorar pruebas]
2. [Segunda acción prioritaria]
3. [Tercera acción prioritaria]
```

## NOTAS

- Ejecutar pytest con cobertura para obtener métricas
- Usar Docker para abstraerse del entorno local
- Identificar archivos críticos sin pruebas
- Proponer pruebas faltantes para funcionalidades clave
- Sugerir mejoras concretas para pruebas existentes
- Priorizar pruebas según riesgo de negocio
