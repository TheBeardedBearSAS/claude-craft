# Guía de Flujo de Trabajo Completo: De la Idea a Producción

Guía completa paso a paso para construir una aplicación completa con Claude Craft, desde la idea inicial hasta el despliegue en producción.

---

## Visión General

Esta guía te acompaña a través del ciclo de desarrollo completo:

1. **Ideación** - Definir tu visión del producto
2. **Requisitos** - Documentar lo que estás construyendo
3. **Arquitectura** - Diseñar la solución técnica
4. **Planificación** - Crear sprints accionables
5. **Desarrollo** - Implementar con TDD
6. **Calidad** - Validar y probar
7. **Despliegue** - Enviar a producción

---

## Fase 1: Ideación (5-10 minutos)

### Iniciar con BMAD

```bash
# Inicializar BMAD en tu proyecto
/bmad:init

# O iniciar un workflow
/workflow:init
```

### Definir la Visión

```
@pm Quiero construir una plataforma e-commerce para vender productos artesanales.
Características clave:
- Catálogo de productos con categorías
- Carrito de compras y checkout
- Autenticación de usuarios
- Gestión de pedidos
```

---

## Fase 2: Requisitos (15-30 minutos)

### Crear PRD

```
@pm Crea un Product Requirements Document
/gate:validate-prd docs/prd.md
```

---

## Fase 3: Arquitectura (20-45 minutes)

### Diseñar Arquitectura

```
@architect Diseña la arquitectura del sistema para la plataforma e-commerce
```

### Validar Especificación Técnica

```
/gate:validate-techspec docs/tech-spec.md
```

---

## Fase 4: Planificación (15-30 minutos)

### Crear Backlog

```
@po Crea user stories desde la especificación técnica
@sm Planifica el sprint 1
/gate:validate-sprint
```

---

## Fase 5: Desarrollo

### Ciclo TDD

```bash
# Obtener siguiente historia
/sprint:next-story --claim

# Implementar con TDD
@dev Implementa US-001 usando TDD

# 🔴 Rojo - Escribir test fallando
# 🟢 Verde - Implementar
# 🔵 Refactorizar

# Validar
/gate:validate-story US-001
/sprint:transition US-001 done
```

---

## Fase 6: Calidad

```bash
/symfony:check-architecture
/team:audit --sequential
/common:pre-commit-check
```

---

## Fase 7: Despliegue

```bash
/docker:compose-setup symfony postgresql redis
/docker:cicd-pipeline github-actions
/common:release-checklist
```

---

## Usando Ralph para Automatización

```bash
/common:ralph-run "Implementar autenticación de usuario con TDD"
```

---

## Secuencia de Comandos Completa

```bash
/bmad:init
@pm Crea el PRD
/gate:validate-prd docs/prd.md
@architect Crea la especificación técnica
/gate:validate-techspec docs/tech-spec.md
@po Crea las user stories
@sm Planifica el sprint 1
/sprint:next-story --claim
@dev Implementa con TDD
/gate:validate-story US-001
/team:audit --sequential
/common:release-checklist
```

---

## Consejos para el Éxito

1. **No saltes los Quality Gates**
2. **Usa los agentes colaborativamente** - Claude-Craft incluye **63 agentes** especializados
3. **TDD es no negociable**: 🔴 → 🟢 → 🔵
4. **Documenta las decisiones** con ADRs
5. **Revisiones regulares**: `/common:daily-standup`, `@{tech}-reviewer`
6. **Gestiona tu contexto**:
   - `/effort high` para tareas complejas, `/effort low` para lookups
   - `/context` para sugerencias de optimización del contexto
   - `/compact` proactivamente cuando el contexto supere el 70%
   - `/clear` entre tareas no relacionadas
   - `/loop` para tareas recurrentes (ej: `/loop 5m /common:pre-commit-check`)

---

## Ver También

- [Guía Práctica BMAD](../BMAD-PRACTICAL-GUIDE.md)
- [Guía Ralph Wiggum](../RALPH-GUIDE.md)
- [Referencia de Comandos](../COMMANDS.md)
