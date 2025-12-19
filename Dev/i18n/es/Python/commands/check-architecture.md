---
description: Verificar Arquitectura Python
argument-hint: [arguments]
---

# Verificar Arquitectura Python

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## MISIÓN

Realizar una auditoría completa de arquitectura del proyecto Python siguiendo los principios de Clean Architecture y Arquitectura Hexagonal definidos en las reglas del proyecto.

### Paso 1: Analizar Estructura del Proyecto

Examinar estructura de directorios e identificar:
- [ ] Presencia de capas Dominio/Aplicación/Infraestructura/Presentación
- [ ] Separación clara entre capas (sin dependencias invertidas)
- [ ] Organización de módulos por dominio de negocio
- [ ] Estructura de paquetes consistente con reglas de arquitectura

**Referencia**: `rules/02-architecture.md` secciones "Clean Architecture" y "Arquitectura Hexagonal"

### Paso 2: Verificar Dependencias Entre Capas

Analizar importaciones y dependencias:
- [ ] El dominio no depende de ninguna otra capa
- [ ] La aplicación depende solo del dominio
- [ ] La infraestructura depende solo del dominio y aplicación
- [ ] La presentación no contiene lógica de negocio
- [ ] Regla de dependencias respetada (solo hacia adentro)

**Verificar**: Sin importaciones de capas externas en Dominio/Aplicación

### Paso 3: Interfaces y Puertos

Verificar implementación de puertos y adaptadores:
- [ ] Interfaces (ports) definidas en Dominio/Aplicación
- [ ] Implementaciones (adapters) en Infraestructura
- [ ] Uso de inyección de dependencias
- [ ] Sin acoplamiento fuerte con frameworks externos

**Referencia**: `rules/02-architecture.md` sección "Ports and Adapters"

### Paso 4: Entidades y Value Objects

Verificar modelado de dominio:
- [ ] Entidades ricas con lógica de negocio encapsulada
- [ ] Value objects inmutables
- [ ] Agregados correctamente delimitados
- [ ] Domain Events si aplica
- [ ] Sin lógica de infraestructura en entidades

**Referencia**: `rules/02-architecture.md` sección "Capa de Dominio"

### Paso 5: Servicios y Casos de Uso

Analizar organización de lógica de aplicación:
- [ ] Casos de Uso/Servicios de Aplicación claramente identificados
- [ ] Un Caso de Uso = Una acción de negocio
- [ ] Servicios de Dominio para lógica de negocio compleja
- [ ] Sin lógica de negocio en controllers/handlers
- [ ] Transacciones gestionadas a nivel de Aplicación

**Referencia**: `rules/02-architecture.md` sección "Capa de Aplicación"

### Paso 6: Principios SOLID

Verificar aplicación de principios SOLID:
- [ ] Responsabilidad Única: Una clase = Una razón para cambiar
- [ ] Abierto/Cerrado: Extensión por herencia/composición, no modificación
- [ ] Sustitución de Liskov: Los subtipos son sustituibles
- [ ] Segregación de Interfaces: Interfaces específicas y mínimas
- [ ] Inversión de Dependencias: Dependencia de abstracciones

**Referencia**: `rules/04-solid-principles.md`

### Paso 7: Calcular Puntuación

Atribución de puntos (sobre 25):
- Estructura y separación de capas: 6 puntos
- Respeto de dependencias: 6 puntos
- Ports and Adapters: 4 puntos
- Modelado de dominio: 4 puntos
- Casos de Uso y Servicios: 3 puntos
- Principios SOLID: 2 puntos

## FORMATO DE SALIDA

```
AUDITORÍA DE ARQUITECTURA PYTHON
================================

PUNTUACIÓN GENERAL: XX/25

FORTALEZAS:
- [Lista de puntos positivos identificados]

MEJORAS:
- [Lista de mejoras menores]

PROBLEMAS CRÍTICOS:
- [Lista de violaciones graves de arquitectura]

DETALLES POR CATEGORÍA:

1. ESTRUCTURA Y CAPAS (XX/6)
   Estado: [Detalles de estructura]

2. DEPENDENCIAS (XX/6)
   Estado: [Análisis de dependencias]

3. PORTS AND ADAPTERS (XX/4)
   Estado: [Implementación de interfaces]

4. MODELADO DE DOMINIO (XX/4)
   Estado: [Calidad de entidades y VOs]

5. CASOS DE USO (XX/3)
   Estado: [Organización de lógica de aplicación]

6. PRINCIPIOS SOLID (XX/2)
   Estado: [Aplicación de principios SOLID]

TOP 3 ACCIONES PRIORITARIAS:
1. [Acción más crítica con impacto estimado]
2. [Segunda acción prioritaria]
3. [Tercera acción prioritaria]
```

## NOTAS

- Usar `grep`, `find` y análisis de código para detectar violaciones
- Proporcionar ejemplos concretos de archivos/clases problemáticas
- Sugerir refactorizaciones precisas para cada problema identificado
- Priorizar acciones según impacto en mantenibilidad
