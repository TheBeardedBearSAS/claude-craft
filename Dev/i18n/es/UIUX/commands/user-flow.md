---
description: Diseño de Flujo de Usuario
argument-hint: [arguments]
---

# Diseño de Flujo de Usuario

Eres un Experto UX/Ergonomía. Debes diseñar un flujo de usuario (user flow) completo y optimizado.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre del flujo a diseñar
- (Opcional) Persona objetivo
- (Opcional) Restricciones específicas

Ejemplo: `/uiux:user-flow "Registro de usuario"` o `/uiux:user-flow "Checkout" persona:"Usuario móvil" restriccion:"< 30 segundos"`

## Modo Plan

> **El modo plan es recomendado.** Claude activa el modo plan para estructurar el enfoque, identificar dependencias y presentar una estrategia de generación antes de crear artefactos.

## MISIÓN

### Paso 1: Definir el contexto

- Objetivo del usuario
- Persona objetivo
- Contexto de uso (dispositivo, entorno)
- Restricciones de negocio

### Paso 2: Diseñar el flujo

```
══════════════════════════════════════════════════════════════
🧭 FLUJO DE USUARIO: {NOMBRE}
══════════════════════════════════════════════════════════════

Fecha: {fecha}
Versión: 1.0

──────────────────────────────────────────────────────────────
👤 CONTEXTO
──────────────────────────────────────────────────────────────

### Persona
| Atributo | Valor |
|----------|-------|
| Nombre | {persona} |
| Rol | {rol} |
| Nivel técnico | Principiante / Intermedio / Experto |
| Dispositivo principal | Móvil / Desktop / Ambos |
| Contexto | {entorno de uso} |

### Objetivo del usuario
> "{Lo que el usuario quiere lograr}"

### Objetivo de negocio
> "{Lo que el negocio quiere obtener}"

──────────────────────────────────────────────────────────────
📋 FLUJO DETALLADO
──────────────────────────────────────────────────────────────

### Paso 0: Disparador
**Punto de entrada**: {Cómo llega el usuario}

### Paso 1: {Nombre del paso}
**Pantalla**: {Nombre de pantalla}
**Objetivo**: {Lo que el usuario debe hacer}

#### Acciones disponibles
| Acción | Elemento UI | Resultado |
|--------|-------------|-----------|
| Principal | {botón/enlace} | Pasa al paso 2 |

#### Feedback del sistema
| Evento | Feedback | Tipo |
|--------|----------|------|
| Error validación | {mensaje} | Inline |

──────────────────────────────────────────────────────────────
📊 MÉTRICAS & KPIs
──────────────────────────────────────────────────────────────

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tiempo de completación | < {X} seg | Time-on-task |
| Tasa de completación | > {Y}% | Funnel analytics |
| Número de clics | ≤ {N} | Click tracking |

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDACIÓN
──────────────────────────────────────────────────────────────

### UX
- [ ] Objetivo de usuario claro
- [ ] Pasos mínimos necesarios
- [ ] Feedback en cada acción
- [ ] Caminos de error documentados

### Accesibilidad
- [ ] Navegación por teclado
- [ ] Anuncios SR
- [ ] Sin límites de tiempo
```

### Paso 3: Validación

- Revisión con stakeholders
- Prueba de usuario (5 usuarios mín)
- Iteración basada en feedback
