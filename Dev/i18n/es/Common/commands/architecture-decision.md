---
description: Registro de Decisión de Arquitectura (ADR)
argument-hint: [arguments]
---

# Registro de Decisión de Arquitectura (ADR)

Eres un arquitecto de software senior. Debes crear un Registro de Decisión de Arquitectura (ADR) para documentar una decisión técnica importante.

## Argumentos
$ARGUMENTS

Argumentos:
- Título de la decisión
- (Opcional) Número de ADR

Ejemplo: `/common:architecture-decision "Elección de PostgreSQL para base de datos principal"`

## MISIÓN

### Paso 1: Recopilar Información

Hacer preguntas clave:
1. ¿Qué problema estamos tratando de resolver?
2. ¿Cuáles son las restricciones?
3. ¿Qué opciones hemos considerado?
4. ¿Por qué esta opción sobre otra?

### Paso 2: Crear el Archivo ADR

Ubicación: `docs/architecture/decisions/` o `docs/adr/`

Nomenclatura: `NNNN-titulo-en-kebab-case.md`

### Paso 3: Escribir el ADR

Plantilla ADR (formato Michael Nygard):

```markdown
# ADR-{NNNN}: {Título}

**Fecha**: {AAAA-MM-DD}
**Estado**: {Propuesto | Aceptado | Obsoleto | Reemplazado por ADR-XXXX}
**Decisores**: {Nombres de las personas involucradas}

## Contexto

{Describir las fuerzas en juego, incluyendo fuerzas tecnológicas, políticas,
sociales y relacionadas con el proyecto. Estas fuerzas probablemente están en tensión,
y deben ser señaladas como tales. El lenguaje en esta sección es
neutral - simplemente describimos los hechos.}

### Situación Actual

{Descripción del estado actual del sistema/proyecto}

### Problema

{Descripción clara del problema a resolver}

### Restricciones

- {Restricción 1}
- {Restricción 2}
- {Restricción 3}

## Opciones Consideradas

### Opción 1: {Nombre}

{Descripción de la opción}

**Ventajas**:
- {Ventaja 1}
- {Ventaja 2}

**Desventajas**:
- {Desventaja 1}
- {Desventaja 2}

**Esfuerzo Estimado**: {Bajo | Medio | Alto}

### Opción 2: {Nombre}

{Descripción de la opción}

**Ventajas**:
- {Ventaja 1}
- {Ventaja 2}

**Desventajas**:
- {Desventaja 1}
- {Desventaja 2}

**Esfuerzo Estimado**: {Bajo | Medio | Alto}

### Opción 3: {Nombre}

{Descripción de la opción}

**Ventajas**:
- {Ventaja 1}
- {Ventaja 2}

**Desventajas**:
- {Desventaja 1}
- {Desventaja 2}

**Esfuerzo Estimado**: {Bajo | Medio | Alto}

## Decisión

{Hemos decidido usar **Opción X** porque...}

### Justificación

{Explicación detallada de por qué se eligió esta opción sobre
otras. Incluir compensaciones aceptadas.}

## Consecuencias

### Positivas

- {Consecuencia positiva 1}
- {Consecuencia positiva 2}

### Negativas

- {Consecuencia negativa 1}
- {Consecuencia negativa 2}

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|------|-------------|--------|------------|
| {Riesgo 1} | Bajo/Medio/Alto | Bajo/Medio/Alto | {Acción} |
| {Riesgo 2} | Bajo/Medio/Alto | Bajo/Medio/Alto | {Acción} |

## Plan de Implementación

### Fase 1: {Título}
- [ ] {Tarea 1}
- [ ] {Tarea 2}

### Fase 2: {Título}
- [ ] {Tarea 3}
- [ ] {Tarea 4}

## Métricas de Éxito

- {Métrica 1}: {Valor objetivo}
- {Métrica 2}: {Valor objetivo}

## Referencias

- {Enlace a documentación}
- {Enlace a estudio comparativo}
- {ADRs relacionados}

---

## Historial

| Fecha | Acción | Por |
|------|--------|-----|
| {AAAA-MM-DD} | Creado | {Nombre} |
| {AAAA-MM-DD} | Aceptado | {Equipo} |
```

### Paso 4: Ejemplo Completo de ADR

```markdown
# ADR-0012: Elección de PostgreSQL para Base de Datos Principal

**Fecha**: 2024-01-15
**Estado**: Aceptado
**Decisores**: John Doe (Tech Lead), Mary Smith (DBA), Peter Johnson (CTO)

## Contexto

### Situación Actual

Nuestra aplicación actualmente usa MySQL 5.7 alojado en un servidor dedicado.
La base de datos contiene 50 tablas, 10 millones de filas en la tabla principal,
y maneja 1000 consultas/segundo en picos.

### Problema

1. MySQL 5.7 está llegando al fin de vida útil (EOL)
2. Necesidad creciente de consultas JSON complejas
3. Capacidades limitadas de búsqueda de texto completo
4. Sin soporte nativo para tipos geoespaciales

### Restricciones

- Presupuesto de infraestructura limitado
- La migración debe ser transparente para los usuarios
- Equipo familiarizado con MySQL, no con PostgreSQL
- Tiempo de migración: máximo 3 meses

## Opciones Consideradas

### Opción 1: Actualizar a MySQL 8.0

Permanecer en MySQL actualizando a la versión 8.0.

**Ventajas**:
- Sin migración de esquema
- Equipo ya capacitado
- Riesgo mínimo

**Desventajas**:
- Consultas JSON aún menos eficientes
- Sin búsqueda de texto completo en francés nativa
- Extensión geoespacial menos madura

**Esfuerzo Estimado**: Bajo

### Opción 2: Migrar a PostgreSQL 16

Migrar a PostgreSQL con todas las funciones modernas.

**Ventajas**:
- JSONB muy eficiente
- Búsqueda de texto completo con diccionarios en francés
- PostGIS para geoespacial
- Comunidad muy activa
- Extensiones ricas (pg_trgm, uuid-ossp, etc.)

**Desventajas**:
- Migración requerida
- Capacitación del equipo necesaria
- Cambios menores en sintaxis SQL

**Esfuerzo Estimado**: Medio

### Opción 3: Base de Datos NoSQL (MongoDB)

Migrar a una base de datos de documentos para más flexibilidad.

**Ventajas**:
- Esquema flexible
- Bueno para JSON nativo
- Escalabilidad horizontal

**Desventajas**:
- Pérdida de restricciones relacionales
- Migración masiva de código
- Transacciones complejas
- Equipo no capacitado

**Esfuerzo Estimado**: Alto

## Decisión

Hemos decidido usar **PostgreSQL 16** porque:

### Justificación

1. **Rendimiento JSON**: El JSONB de PostgreSQL supera a MySQL para nuestros
   casos de uso de almacenamiento de metadatos de usuario.

2. **Búsqueda de texto completo**: El diccionario nativo en francés evita instalar
   Elasticsearch para búsqueda.

3. **PostGIS**: Nuestras nuevas funciones de geolocalización serán
   más simples de implementar.

4. **Madurez**: PostgreSQL es el RDBMS de código abierto más avanzado,
   con una comunidad muy activa.

5. **Compatibilidad con Doctrine**: Nuestro ORM soporta perfectamente PostgreSQL.

## Consecuencias

### Positivas

- Consultas JSON 3x más rápidas (benchmark interno)
- Búsqueda de texto completo sin infraestructura adicional
- Funciones geoespaciales nativas
- Mejor soporte para tipos de datos (UUID, arrays, etc.)

### Negativas

- 2 semanas de capacitación del equipo
- Migración de datos estimada en 4h de tiempo de inactividad
- Algunas consultas a adaptar (sintaxis LIMIT/OFFSET)

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|------|-------------|--------|------------|
| Regresión de rendimiento | Baja | Medio | Pruebas de carga antes de migración |
| Pérdida de datos | Muy baja | Crítico | Backup + ensayo general |
| Bugs post-migración | Media | Bajo | Período de estabilización de 2 semanas |

## Plan de Implementación

### Fase 1: Preparación (Semana 1-2)
- [x] Capacitación del equipo en PostgreSQL
- [x] Configurar entorno dev PostgreSQL
- [x] Adaptar pruebas unitarias

### Fase 2: Migración de Código (Semana 3-4)
- [ ] Adaptar consultas SQL nativas
- [ ] Configurar Doctrine para PostgreSQL
- [ ] Completar pruebas de integración

### Fase 3: Migración de Datos (Semana 5)
- [ ] Script de migración pgloader
- [ ] Ensayo general en copia de producción
- [ ] Migración de producción (fin de semana)

### Fase 4: Estabilización (Semana 6-8)
- [ ] Monitoreo de rendimiento
- [ ] Corrección de bugs si los hay
- [ ] Documentación actualizada

## Métricas de Éxito

- Tiempo de respuesta API: ≤ actual (100ms P95)
- Consultas JSON: -50% tiempo de ejecución
- Tiempo de actividad post-migración: 99.9%

## Referencias

- [Benchmark PostgreSQL vs MySQL JSON](internal-wiki/benchmarks)
- [Guía de Migración Doctrine](internal-wiki/migration-guide)
- ADR-0008: Elección de ORM Doctrine
```

### Paso 5: Crear Índice de ADR

```markdown
# Registros de Decisión de Arquitectura

Esta carpeta contiene los ADRs del proyecto.

## Índice

| # | Título | Estado | Fecha |
|---|-------|--------|------|
| [ADR-0001](0001-use-clean-architecture.md) | Adopción de Arquitectura Limpia | Aceptado | 2023-06-15 |
| [ADR-0012](0012-postgresql-database.md) | Elección de PostgreSQL | Aceptado | 2024-01-15 |
| [ADR-0013](0013-api-versioning.md) | Estrategia de Versionado de API | Propuesto | 2024-01-20 |

## Estados

- **Propuesto**: En discusión
- **Aceptado**: Decisión validada
- **Obsoleto**: Ya no es relevante
- **Reemplazado**: Reemplazado por otro ADR
```

## Estructura Recomendada

```
docs/
└── architecture/
    └── decisions/
        ├── README.md           # Índice de ADR
        ├── 0001-*.md
        ├── 0002-*.md
        └── templates/
            └── adr-template.md
```
