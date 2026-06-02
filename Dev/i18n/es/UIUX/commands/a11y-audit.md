---
description: Auditoría de Accesibilidad WCAG 2.2 AAA
argument-hint: [argumentos]
---

# Auditoría de Accesibilidad WCAG 2.2 AAA

Eres un Experto en Accesibilidad certificado. Debes realizar una auditoría completa de accesibilidad según los criterios WCAG 2.2 nivel AAA.

## Argumentos
$ARGUMENTS

Argumentos:
- Ruta hacia la página/componente a auditar
- (Opcional) Nivel: AA o AAA (por defecto: AAA)
- (Opcional) Enfoque: all, keyboard, contrast, aria

Ejemplo: `/uiux:a11y-audit src/pages/Home.tsx AAA` o `/uiux:a11y-audit src/components/Modal.tsx AA keyboard`

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

### Paso 1: Auditoría automatizada

```bash
# Ejecutar herramientas automatizadas
npx axe-cli {URL}
npx pa11y {URL} --standard WCAG2AAA
npx lighthouse {URL} --only-categories=accessibility

# Verificar puntuación Lighthouse
# Objetivo: 100/100 en las 4 categorías
```

### Paso 2: Auditoría manual WCAG 2.2

```
══════════════════════════════════════════════════════════════
♿ AUDITORÍA DE ACCESIBILIDAD WCAG 2.2 AAA
══════════════════════════════════════════════════════════════

Página/Componente: {nombre}
Fecha: {fecha}
Auditor: Claude (Experto A11y)
Nivel objetivo: AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 PUNTUACIONES
──────────────────────────────────────────────────────────────

### Lighthouse
| Categoría | Puntuación | Objetivo | Estado |
|-----------|------------|----------|--------|
| Performance | /100 | 100 | ✅/❌ |
| Accessibility | /100 | 100 | ✅/❌ |
| Best Practices | /100 | 100 | ✅/❌ |
| SEO | /100 | 100 | ✅/❌ |

### WCAG 2.2
| Nivel | Criterios | Conformes | No conformes |
|-------|-----------|-----------|--------------|
| A | 30 | {X} | {Y} |
| AA | 20 | {X} | {Y} |
| AAA | 28 | {X} | {Y} |

──────────────────────────────────────────────────────────────
1️⃣ PERCEPTIBLE
──────────────────────────────────────────────────────────────

### 1.1 Alternativas Textuales

#### 1.1.1 Contenido No Textual (A)
| Elemento | Texto alternativo | Estado | Acción |
|----------|-------------------|--------|--------|
| img.logo | "Logo {nombre}" | ✅ | - |
| img.hero | "" (ausente) | ❌ | Añadir alt descriptivo |
| img.icon | aria-hidden="true" | ✅ | - |

### 1.3 Adaptable

#### 1.3.1 Información y Relaciones (A)
| Verificación | Estado | Detalle |
|--------------|--------|---------|
| Estructura de encabezados | ✅/❌ | h1 → h2 → h3 secuencial |
| Landmarks ARIA | ✅/❌ | header, nav, main, footer |
| Listas semánticas | ✅/❌ | ul/ol/dl apropiados |
| Tablas | ✅/❌ | th, scope, caption |
| Formularios | ✅/❌ | label + fieldset/legend |

### 1.4 Distinguible

#### 1.4.3 Contraste Mínimo (AA) / 1.4.6 Contraste Mejorado (AAA)
| Elemento | Colores | Ratio | Requerido | Estado |
|----------|---------|-------|-----------|--------|
| Texto del cuerpo | #333 / #fff | 12.6:1 | 7:1 | ✅ |
| Texto atenuado | #666 / #fff | 5.7:1 | 7:1 | ❌ |
| Botón primario | #fff / #3B82F6 | 4.5:1 | 4.5:1 | ✅ |
| Placeholder | #9CA3AF / #fff | 2.9:1 | 4.5:1 | ❌ |

#### 1.4.10 Reflow (AA)
| Test | Estado | Problema |
|------|--------|----------|
| Ancho 320px | ✅/❌ | {¿desplazamiento horizontal?} |
| Zoom 400% | ✅/❌ | {¿contenido recortado?} |

#### 1.4.11 Contraste de Componentes No Textuales (AA)
| Elemento UI | Ratio | Estado |
|-------------|-------|--------|
| Borde del input | 3:1 | ✅/❌ |
| Borde del botón | 3:1 | ✅/❌ |
| Ícono de acción | 3:1 | ✅/❌ |
| Anillo de foco | 3:1 | ✅/❌ |

──────────────────────────────────────────────────────────────
2️⃣ OPERABLE
──────────────────────────────────────────────────────────────

### 2.1 Accesible por Teclado

#### 2.1.1 Teclado (A) / 2.1.3 Teclado Sin Excepción (AAA)
| Elemento | Tab | Enter | Escape | Flechas | Estado |
|----------|-----|-------|--------|---------|--------|
| Links | ✅ | ✅ | - | - | ✅ |
| Botones | ✅ | ✅ | - | - | ✅ |
| Inputs | ✅ | ✅ | - | - | ✅ |
| Dropdown | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modal | ✅ | ✅ | ✅ | - | ✅ |
| div personalizado | ❌ | ❌ | - | - | ❌ |

#### 2.1.2 Sin Trampa de Teclado (A)
| Zona | Entrada | Salida | Estado |
|------|---------|--------|--------|
| Modal | Trampa de foco OK | Escape OK | ✅ |
| Dropdown | Tab OK | Tab/Escape OK | ✅ |
| Barra lateral | Tab OK | Tab OK | ✅ |

### 2.4 Navegable

#### 2.4.1 Omisión de Bloques (A)
| Enlace de salto | Destino | Estado |
|-----------------|---------|--------|
| "Saltar al contenido" | #main-content | ✅/❌ |
| "Saltar a la navegación" | #nav | ✅/❌ |

#### 2.4.3 Orden del Foco (A)
| Secuencia | Esperado | Actual | Estado |
|-----------|----------|--------|--------|
| 1 | Enlace de salto | Enlace de salto | ✅ |
| 2 | Logo | Logo | ✅ |
| 3 | Ítem nav 1 | Ítem nav 1 | ✅ |
| ... | ... | ... | ... |

#### 2.4.7 Foco Visible (AA) / 2.4.11 Foco Mejorado (AA)
| Elemento | Contorno | Offset | Ratio | Estado |
|----------|----------|--------|-------|--------|
| Links | 2px solid | 2px | 3:1 | ✅ |
| Botones | 2px solid | 2px | 3:1 | ✅ |
| Inputs | 2px solid | 0 | 3:1 | ✅ |
| Tarjetas | ❌ | - | - | ❌ |

#### 2.5.5 Tamaño del Objetivo (AAA)
| Elemento | Tamaño | Mínimo requerido | Estado |
|----------|--------|------------------|--------|
| Botones | 44×40px | 44×44px | ❌ |
| Links de menú | 120×48px | 44×44px | ✅ |
| Botones de ícono | 32×32px | 44×44px | ❌ |
| Checkboxes | 24×24px | 44×44px | ❌ |

──────────────────────────────────────────────────────────────
3️⃣ COMPRENSIBLE
──────────────────────────────────────────────────────────────

### 3.1 Legible

#### 3.1.1 Idioma de la Página (A)
```html
<html lang="es"> <!-- ✅ Presente -->
```

#### 3.1.2 Idioma de las Partes (AA)
| Elemento | Idioma | attr lang | Estado |
|----------|--------|-----------|--------|
| Cita en inglés | Inglés | ❌ | ❌ |
| Término técnico | Inglés | ❌ | ⚠️ |

### 3.3 Asistencia en la Entrada

#### 3.3.1 Identificación de Errores (A)
| Campo | Mensaje de error | En texto | Estado |
|-------|-----------------|---------|--------|
| Email | "Email inválido" | ✅ | ✅ |
| Contraseña | Solo borde rojo | ❌ | ❌ |

#### 3.3.2 Etiquetas o Instrucciones (A)
| Input | Etiqueta | Asociación | Estado |
|-------|----------|------------|--------|
| Email | "Email" | htmlFor OK | ✅ |
| Búsqueda | ❌ | Sin etiqueta | ❌ |
| Teléfono | Solo placeholder | Sin etiqueta | ❌ |

──────────────────────────────────────────────────────────────
4️⃣ ROBUSTO
──────────────────────────────────────────────────────────────

### 4.1.2 Nombre, Rol, Valor (A)
| Componente | role | aria-* | Estado |
|------------|------|--------|--------|
| Modal | dialog | aria-modal, aria-labelledby | ✅ |
| Dropdown | listbox | aria-expanded, aria-activedescendant | ✅ |
| Pestañas | tablist/tab | aria-selected, aria-controls | ❌ |
| Acordeón | - | aria-expanded | ❌ |

### 4.1.3 Mensajes de Estado (AA)
| Mensaje | aria-live | aria-atomic | Estado |
|---------|-----------|-------------|--------|
| Toast éxito | polite | true | ✅ |
| Toast error | assertive | true | ✅ |
| Carga | polite | false | ❌ |
| Errores de formulario | assertive | - | ❌ |

──────────────────────────────────────────────────────────────
❌ VIOLACIONES CRÍTICAS (Bloqueantes)
──────────────────────────────────────────────────────────────

| # | Criterio | Elemento | Descripción | Remediación |
|---|----------|----------|-------------|-------------|
| 1 | 1.4.6 | .text-muted | Contraste 5.7:1 < 7:1 | color: #595959 |
| 2 | 2.5.5 | .btn-icon | Tamaño 32px < 44px | min-width: 44px |
| 3 | 3.3.2 | input[type="search"] | Sin etiqueta | Añadir label |

──────────────────────────────────────────────────────────────
⚠️ VIOLACIONES MAYORES
──────────────────────────────────────────────────────────────

| # | Criterio | Elemento | Descripción | Remediación |
|---|----------|----------|-------------|-------------|
| 4 | 2.1.1 | .card-clickable | div no enfocable | Usar button |
| 5 | 4.1.2 | .tabs | ARIA incorrecto | Añadir role="tablist" |

──────────────────────────────────────────────────────────────
ℹ️ VIOLACIONES MENORES
──────────────────────────────────────────────────────────────

| # | Criterio | Elemento | Descripción | Remediación |
|---|----------|----------|-------------|-------------|
| 6 | 3.1.2 | blockquote | Texto EN sin lang | lang="en" |

──────────────────────────────────────────────────────────────
✅ PUNTOS CONFORMES DESTACABLES
──────────────────────────────────────────────────────────────

- Estructura semántica correcta (encabezados, landmarks)
- Enlace de salto presente y funcional
- Trampa de foco correcta en modales
- Mensajes de error en texto claro

──────────────────────────────────────────────────────────────
🎯 PLAN DE REMEDIACIÓN
──────────────────────────────────────────────────────────────

### Prioridad 1 - Críticos (esta semana)
1. [ ] Corregir contraste de .text-muted → #595959
2. [ ] Ampliar los objetivos táctiles a mínimo 44px
3. [ ] Añadir etiquetas a los inputs sin label

### Prioridad 2 - Mayores (este sprint)
4. [ ] Reemplazar divs clicables por button
5. [ ] Corregir ARIA en el componente de pestañas
6. [ ] Añadir aria-live en los estados de carga

### Prioridad 3 - Menores (backlog)
7. [ ] Añadir lang="en" en texto en inglés
```

### Paso 3: Prueba con lector de pantalla

- VoiceOver (macOS): navegación completa
- NVDA (Windows): verificación de anuncios
- TalkBack (Android): si es aplicación móvil

### Paso 4: Prueba solo con teclado

Navegar toda la interfaz usando únicamente el teclado.
