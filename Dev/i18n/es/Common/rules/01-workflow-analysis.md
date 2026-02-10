# Workflow de Analisis Obligatorio

## Principio Fundamental

**ANTES de cualquier modificacion de codigo (feature, bugfix, refactoring), una fase de analisis profundo es OBLIGATORIA.**

Esta regla es CRITICA y NO NEGOCIABLE. Evita:
- Las regresiones
- Los efectos secundarios inesperados
- La deuda tecnica
- Los bugs en produccion

---

## Proceso en 4 Pasos

### Paso 1: Comprender la Solicitud

**Preguntas a hacerse:**
1. Cual es el objetivo preciso?
2. Cuales son los criterios de aceptacion?
3. Existen restricciones (rendimiento, seguridad, conformidad)?
4. Cual es el impacto para el usuario?

**Acciones:**
- Reformular la solicitud para validacion
- Identificar los use cases involucrados
- Verificar la alineacion con los objetivos de negocio

### Paso 2: Analizar el Codigo Existente

**Archivos a leer OBLIGATORIAMENTE:**
1. Los archivos directamente afectados por la modificacion
2. Los archivos dependientes (que utilizan el codigo modificado)
3. Los tests existentes (para comprender el comportamiento esperado)
4. Las migraciones de esquema (si hay impacto en la base de datos)

**Puntos de vigilancia:**
- Hay tests que van a fallar?
- Hay otros modulos que dependen de este codigo?
- El codigo respeta la arquitectura del proyecto?
- Hay datos sensibles?

### Paso 3: Documentar el Analisis

**Contenido obligatorio:**

1. **Objetivo**: Descripcion clara de la modificacion
2. **Archivos impactados**: Lista exhaustiva con justificacion
3. **Impactos**:
   - Breaking changes: si/no
   - Migracion DB necesaria: si/no
   - Impacto en rendimiento: si/no
   - Datos sensibles: si/no
4. **Riesgos**: Lista + mitigaciones
5. **Enfoque**: Estrategia de implementacion (TDD, refactoring progresivo, etc.)
6. **Tests TDD**: Lista de tests a escribir ANTES de la implementacion

**Ejemplo:**

```markdown
## Analisis: Adicion de una funcionalidad de notificacion

### Objetivo
Enviar una notificacion por email al crear un pedido.

### Archivos impactados
- OrderService (agregar dispatch event)
- NotificationListener (nuevo)
- EmailService (uso existente)
- Tests unitarios para el listener

### Impactos
- Breaking change: NO
- Migracion DB: NO
- Rendimiento: Bajo (async recomendado)
- Datos sensibles: Email del usuario (ya gestionado)

### Riesgos
1. Sobrecarga de emails -> Mitigacion: cola async
2. Email en spam -> Mitigacion: configuracion DKIM/SPF

### Enfoque
1. TDD: escribir tests del listener
2. Implementar el listener
3. Despachar el evento desde OrderService
4. Probar integracion

### Tests TDD
1. test_should_send_email_on_order_created()
2. test_should_not_send_if_user_opted_out()
3. test_should_handle_email_failure_gracefully()
```

### Paso 4: Validacion

**Criterios de decision:**

| Impacto | Accion |
|---------|--------|
| **Bajo** (1 archivo, sin breaking change, < 1h) | Proceder directamente |
| **Medio** (2-5 archivos, migracion DB, < 4h) | Validar con el usuario |
| **Alto** (> 5 archivos, breaking changes, refactoring arq.) | Planificacion detallada + validacion obligatoria |

**Preguntas de validacion:**
- El enfoque respeta la arquitectura del proyecto?
- Los tests TDD son suficientes?
- Existe una alternativa mas simple (KISS)?
- Los riesgos son aceptables?

---

## Anti-Patterns a Evitar

### No codificar sin leer el codigo existente

```
// MALO: modificacion sin comprender el impacto
function updateOrder(order) {
  order.status = "confirmed"  // Impacto en otros modulos?
}
```

### No ignorar las dependencias

```
// MALO: modificacion sin verificar quien usa este metodo
function getPrice() {
  return this.price * 0.8  // Quien llama a getPrice()?
}
```

### No olvidar los tests

```
// MALO: sin verificacion de los tests existentes
// Si modifico User, que tests van a fallar?
```

### No ignorar la seguridad

```
// MALO: agregar un campo sensible sin proteccion
class User {
  socialSecurityNumber: string  // Datos sensibles!
}
```

---

## Checklist Rapido

Antes de cualquier modificacion:

- [ ] He leido y comprendido la solicitud
- [ ] He leido los archivos involucrados
- [ ] He identificado las dependencias
- [ ] He documentado el analisis
- [ ] He evaluado los riesgos
- [ ] He definido los tests TDD
- [ ] He validado el enfoque (si impacto medio/alto)
- [ ] He verificado la conformidad de arquitectura + SOLID
- [ ] He verificado la seguridad si hay datos sensibles

---

## Workflow Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    SOLICITUD RECIBIDA                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             PASO 1: COMPRENDER                               │
│  - Objetivo preciso?                                         │
│  - Criterios de aceptacion?                                  │
│  - Restricciones?                                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             PASO 2: ANALIZAR                                 │
│  - Leer los archivos involucrados                            │
│  - Identificar las dependencias                              │
│  - Verificar los tests existentes                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             PASO 3: DOCUMENTAR                               │
│  - Archivos impactados                                       │
│  - Riesgos + mitigaciones                                    │
│  - Tests TDD a escribir                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             PASO 4: VALIDAR                                  │
│  - Impacto bajo -> Proceder                                  │
│  - Impacto medio/alto -> Solicitar validacion                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    IMPLEMENTAR                               │
│  1. Escribir los tests (RED)                                 │
│  2. Implementar el codigo (GREEN)                            │
│  3. Refactorizar (REFACTOR)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Templates Asociados

- `templates/analysis.md` - Template de analisis detallado
- `checklists/new-feature.md` - Checklist nueva feature
- `checklists/refactoring.md` - Checklist refactoring

---

**Fecha de ultima actualizacion:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
