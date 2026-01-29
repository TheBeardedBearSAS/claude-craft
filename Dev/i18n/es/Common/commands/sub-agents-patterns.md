# Patrones de Sub-Agentes

Guia para utilizar sub-agentes de manera efectiva en Claude Code para tareas paralelas y complejas.

## Tipos de Agentes

### 1. Agente Explore (Investigacion Rapida)
Utilice para exploracion rapida del codigo fuente y recopilacion de informacion.

**Cuando utilizarlo:**
- Buscar archivos por patron
- Buscar patrones de codigo especificos
- Responder preguntas sobre la organizacion del codigo fuente

### 2. Agente de Proposito General (Tareas Complejas)
Utilice para tareas de multiples pasos que requieren autonomia.

**Cuando utilizarlo:**
- Tareas que abarcan multiples archivos
- Sub-tareas independientes que pueden ejecutarse en paralelo
- Tareas que requieren juicio e iteracion

### 3. Agente Plan (Arquitectura)
Utilice para disenar estrategias de implementacion.

**Cuando utilizarlo:**
- Antes de implementar funcionalidades complejas
- Cuando existen multiples enfoques posibles
- Para decisiones arquitectonicas

## Patrones de Tareas Paralelas

### Patron 1: Investigacion Paralela
Lance multiples agentes Explore para diferentes aspectos.

### Patron 2: Actualizaciones Paralelas
Para actualizaciones de archivos independientes entre lenguajes/modulos.

### Patron 3: Verificaciones de Calidad Paralelas
Ejecute diferentes verificaciones de calidad simultaneamente.

## Agentes en Segundo Plano

Utilice `run_in_background: true` para tareas de larga duracion.

**Ideal para:**
- Suites de pruebas
- Procesos de build
- Migraciones grandes
- Pipelines de calidad

## Mejores Practicas

### Hacer
- Lanzar tareas independientes en paralelo
- Utilizar el agente Explore para busquedas rapidas
- Utilizar el modo en segundo plano para tareas largas
- Proporcionar prompts claros y detallados

### No Hacer
- Lanzar tareas dependientes en paralelo
- Utilizar agentes para lecturas simples de un solo archivo
- Olvidar verificar los resultados de los agentes en segundo plano
- Utilizar prompts vagos que requieran aclaracion

## Patrones de Coordinacion

### Secuencial con Puntos de Control
Para tareas que tienen dependencias.

### Fan-Out/Fan-In
Para trabajo paralelo con resultados combinados.
