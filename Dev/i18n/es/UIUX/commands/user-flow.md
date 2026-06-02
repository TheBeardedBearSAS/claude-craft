---
description: Diseño de Flujo de Usuario
argument-hint: [arguments]
---

# Diseño de Flujo de Usuario

Eres un Experto UX/Ergonomía. Debes diseñar un flujo de usuario completo y optimizado.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre del flujo a diseñar
- (Opcional) Persona objetivo
- (Opcional) Restricciones específicas

Ejemplo: `/uiux:user-flow "Registro de usuario"` o `/uiux:user-flow "Checkout" persona:"Usuario móvil" restriccion:"< 30 segundos"`

## Modo Plan

> **El modo plan es recomendado.** Claude activa el modo plan para estructurar el enfoque, identificar dependencias y presentar una estrategia de generación antes de crear los artefactos.

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
> "{Lo que el negocio quiere conseguir}"

### Restricciones
- Tiempo máximo: {X segundos/minutos}
- Pasos máximos: {Y}
- Dispositivo: {restricciones técnicas}
- Sin conexión: Sí / No

──────────────────────────────────────────────────────────────
🗺️ RESUMEN GENERAL
──────────────────────────────────────────────────────────────

```
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│Inicio│───▶│Paso 1│───▶│Paso 2│───▶│Paso 3│───▶│ Fin  │
└──────┘    └──────┘    └──────┘    └──────┘    └──────┘
                │            │
                ▼            ▼
           ┌────────┐   ┌────────┐
           │Error A │   │Error B │
           └────────┘   └────────┘
```

──────────────────────────────────────────────────────────────
📋 FLUJO DETALLADO
──────────────────────────────────────────────────────────────

### Paso 0: Disparador

**Punto de entrada**: {Cómo llega el usuario}
- Vía: {menú / enlace / CTA / deep link}
- Estado previo: {autenticado / anónimo / datos existentes}
- Precondiciones: {lo que debe ser verdadero}

---

### Paso 1: {Nombre del paso}

**Pantalla**: {Nombre de pantalla}
**Objetivo**: {Lo que el usuario debe hacer}

#### Acciones disponibles
| Acción | Elemento UI | Resultado |
|--------|-------------|-----------|
| Principal | {botón/enlace} | Pasa al paso 2 |
| Secundaria | {botón/enlace} | {alternativa} |
| Terciaria | {enlace} | {otra opción} |

#### Datos requeridos
| Campo | Tipo | Validación | Requerido |
|-------|------|------------|-----------|
| {campo} | {tipo} | {reglas} | Sí/No |

#### Feedback del sistema
| Evento | Feedback | Tipo |
|--------|----------|------|
| Foco en input | {feedback} | Visual |
| Error de validación | {mensaje} | Inline |
| Éxito | {feedback} | Toast/inline |

#### Puntos de atención
- ⚠️ {fricción potencial}
- 💡 {oportunidad de mejora}

---

### Paso 2: {Nombre del paso}

{Misma estructura...}

---

### Paso N: Confirmación (Fin)

**Pantalla**: {Confirmación / Éxito}
**Estado final**: {Lo que se ha logrado}

#### Contenido
- Mensaje de éxito
- Resumen de la acción
- Próximos pasos sugeridos

#### Acciones siguientes
| Acción | Destino |
|--------|---------|
| CTA principal | {siguiente flujo} |
| Volver | {dashboard/lista} |
| Compartir | {si aplica} |

──────────────────────────────────────────────────────────────
⚠️ CAMINOS ALTERNATIVOS
──────────────────────────────────────────────────────────────

### Error: {Tipo de error}

**Disparador**: {Qué causa el error}
**Pantalla**: {Inline / Modal / Página dedicada}

#### Mensaje de error
```
Título: {Título claro}
Descripción: {Explicación del problema}
Acción: {Cómo resolverlo}
```

#### Opciones del usuario
- Reintentar: {comportamiento}
- Modificar: {volver al paso X}
- Abandonar: {¿se guarda el estado?}

---

### Abandono: Guardado del estado

**Comportamiento**:
- Borrador guardado automáticamente
- Duración de retención: {X días}
- Notificación de recordatorio: Sí / No

---

### Caso límite: {Descripción}

**Situación**: {Contexto particular}
**Comportamiento**: {Adaptación del flujo}

──────────────────────────────────────────────────────────────
📊 MÉTRICAS Y KPIs
──────────────────────────────────────────────────────────────

### Objetivos cuantitativos

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tiempo de completación | < {X} seg | Time-on-task |
| Tasa de completación | > {Y}% | Funnel analytics |
| Tasa de error | < {Z}% | Error rate |
| Número de clics | ≤ {N} | Click tracking |
| Puntuación de satisfacción | > {S}/5 | Encuesta post-tarea |

### Puntos de medición

| Paso | Evento a rastrear |
|------|-------------------|
| Entrada | `flow_started` |
| Paso 1 | `step_1_completed` |
| Paso 2 | `step_2_completed` |
| Éxito | `flow_completed` |
| Abandono | `flow_abandoned` con `last_step` |
| Error | `flow_error` con `error_type` |

──────────────────────────────────────────────────────────────
🧠 ERGONOMÍA
──────────────────────────────────────────────────────────────

### Carga cognitiva

| Paso | Complejidad | Justificación |
|------|-------------|---------------|
| 1 | Baja | {1-2 acciones simples} |
| 2 | Media | {formulario corto} |
| 3 | Baja | {solo confirmación} |

### Principios aplicados

| Principio | Aplicación |
|-----------|------------|
| Divulgación progresiva | {cómo} |
| Valores por defecto | {cuáles} |
| Validación inline | {cuándo} |
| Guardado automático | {frecuencia} |

──────────────────────────────────────────────────────────────
♿ ACCESIBILIDAD
──────────────────────────────────────────────────────────────

### Navegación por teclado
- Orden de tabulación: {secuencia lógica}
- Skip links: {si hay formulario largo}
- Gestión del foco: {al cambiar de paso}

### Lector de pantalla
- Anuncio de paso: "Paso X de Y"
- Errores: aria-live="assertive"
- Progreso: aria-describedby

### Tiempo
- Sin tiempo límite automático
- Si hay demora: extensible o desactivable

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDACIÓN
──────────────────────────────────────────────────────────────

### UX
- [ ] Objetivo del usuario claro
- [ ] Pasos mínimos necesarios
- [ ] Feedback en cada acción
- [ ] Caminos de error documentados
- [ ] Abandono con guardado

### Medibilidad
- [ ] KPIs definidos
- [ ] Eventos de seguimiento listados
- [ ] Objetivos cuantificados

### Accesibilidad
- [ ] Navegación por teclado
- [ ] Anuncios del lector de pantalla
- [ ] Sin límites de tiempo
```

### Paso 3: Validación

- Revisión con las partes interesadas (stakeholders)
- Prueba de usuario (mínimo 5 usuarios)
- Iteración basada en el feedback recibido
