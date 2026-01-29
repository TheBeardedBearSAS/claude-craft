---
description: Validar el PRD contra el quality gate (≥80%)
argument-hint: [archivo-prd]
---

# Validar Gate PRD

Validar un Documento de Requisitos del Producto contra el quality gate PRD.
El PRD debe obtener al menos 80% para aprobar.

## Argumentos

$ARGUMENTS (format: [archivo-prd])
- **archivo-prd** (opcional): Ruta hacia el archivo PRD. Por defecto: `docs/prd.md`

## Criterios del Gate

| Criterio | Peso | Requerido | Descripcion |
|----------|------|-----------|-------------|
| Declaracion del problema | 15% | Si | Articulacion clara del problema |
| Usuarios objetivo | 15% | Si | Audiencia/personas definidas |
| Objetivos | 15% | Si | Objetivos medibles |
| Metricas de exito | 15% | Si | KPIs y medidas |
| Alcance | 10% | Si | Lo que esta incluido/excluido |
| Resumen User Stories | 10% | Si | Lista de funcionalidades |
| Suposiciones | 10% | No | Suposiciones documentadas |
| Riesgos | 10% | No | Identificacion de riesgos |

**Umbral: 80%**

## Proceso

### Paso 1: Localizar el archivo PRD

1. Usar la ruta proporcionada o la predeterminada `docs/prd.md`
2. Verificar que el archivo existe
3. Cargar el contenido para analisis

### Paso 2: Validar cada criterio

Para cada criterio, verificar:
- El contenido existe con las palabras clave relevantes
- La seccion tiene una longitud de contenido minima
- Los elementos requeridos estan presentes

### Paso 3: Calcular la puntuacion

Calculo de la puntuacion:
- Cada criterio tiene un peso (porcentaje)
- Aprobar un criterio suma su peso a la puntuacion
- Puntuacion final = suma de los pesos aprobados

### Paso 4: Generar el informe

Mostrar:
- Resultados por criterio
- Puntuacion total y umbral
- Estado Aprobado/Fallido
- Sugerencias de mejora

## Formato de Salida

### PRD Validado

```
═══════════════════════════════════════════════════════
            Validacion Gate PRD
═══════════════════════════════════════════════════════

Archivo: docs/prd.md
Umbral: 80%

Resultados de Validacion:
──────────────────────────────────────────────────────
✅ Declaracion del problema (15%)
✅ Usuarios objetivo (15%)
✅ Objetivos (15%)
✅ Metricas de exito (15%)
✅ Alcance (10%)
✅ Resumen User Stories (10%)
✅ Suposiciones (10%)
⚠️ Riesgos (10%) - Parcial

Puntuacion: 90/100 (90%)
──────────────────────────────────────────────────────

✅ GATE PRD APROBADO

Listo para pasar a la fase Tech Spec.
Siguiente: /pm:handoff architect
═══════════════════════════════════════════════════════
```

### PRD Fallido

```
═══════════════════════════════════════════════════════
            Validacion Gate PRD
═══════════════════════════════════════════════════════

Archivo: docs/prd.md
Umbral: 80%

Puntuacion: 50/100 (50%)
──────────────────────────────────────────────────────

❌ GATE PRD FALLIDO (necesita 80%, obtuvo 50%)

Acciones Requeridas:
──────────────────────────────────────────────────────
1. Agregar objetivos medibles
2. Definir las metricas de exito y KPIs
3. Documentar las suposiciones
4. Agregar la evaluacion de riesgos

Relanzar despues de correcciones: /gate:validate-prd
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/gate:validate-prd
/gate:validate-prd docs/feature-prd.md
```
