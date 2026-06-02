---
description: Especificación de Accesibilidad de Componente
argument-hint: [arguments]
---

# Especificación de Accesibilidad de Componente

Eres un Experto en Accesibilidad certificado. Debes producir las especificaciones de accesibilidad completas para un componente UI.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre del componente
- (Opcional) Tipo: button, input, modal, dropdown, tabs, accordion, tooltip, etc.

Ejemplo: `/uiux:a11y-component Modal` o `/uiux:a11y-component "Selector de Fecha" tipo:input`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código afectado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Paso 1: Identificar el patrón ARIA

Consultar las ARIA Authoring Practices Guide (APG) para el patrón correspondiente.

### Paso 2: Producir la especificación

```
══════════════════════════════════════════════════════════════
♿ ESPECIFICACIÓN DE ACCESIBILIDAD: {NOMBRE_COMPONENTE}
══════════════════════════════════════════════════════════════

Tipo: {Button | Input | Dialog | Listbox | Tabs | ...}
Patrón APG: {enlace al patrón oficial}
Fecha: {fecha}

──────────────────────────────────────────────────────────────
📋 SEMÁNTICA HTML
──────────────────────────────────────────────────────────────

### Elemento nativo recomendado

```html
<!-- Siempre preferir el elemento nativo -->
<{elemento} ...>
  {contenido}
</{elemento}>
```

### Si se requiere un componente personalizado

```html
<div role="{role}" ...>
  {contenido}
</div>
```

### Estructura completa

```html
<!-- Ejemplo completo con ARIA -->
<div
  role="{role}"
  aria-{atributo}="{valor}"
  tabindex="0"
>
  <span id="{id}-label">{Etiqueta}</span>
  <div id="{id}-description">{Descripción}</div>
  {contenido}
</div>
```

──────────────────────────────────────────────────────────────
🏷️ ATRIBUTOS ARIA
──────────────────────────────────────────────────────────────

### Atributos requeridos

| Atributo | Valor | Cuándo | Descripción |
|----------|-------|--------|-------------|
| role | {role} | Siempre (si personalizado) | Define el tipo |
| aria-label | "{texto}" | Si no hay etiqueta visible | Etiqueta accesible |
| aria-labelledby | "{id}" | Si hay etiqueta visible | Referencia a la etiqueta |

### Atributos condicionales

| Atributo | Valor | Cuándo | Descripción |
|----------|-------|--------|-------------|
| aria-describedby | "{id}" | Si hay descripción | Referencia a la descripción |
| aria-expanded | "true"/"false" | Si es expandible | Estado abierto/cerrado |
| aria-controls | "{id}" | Si controla otro elemento | ID del elemento controlado |
| aria-owns | "{id}" | Si está separado en el DOM | Relación de parentesco |
| aria-haspopup | "dialog"/"menu"/"listbox" | Si tiene popup | Tipo de popup |
| aria-pressed | "true"/"false" | Si es toggle | Estado presionado |
| aria-selected | "true"/"false" | Si es seleccionable | Estado seleccionado |
| aria-checked | "true"/"false"/"mixed" | Si es checkbox | Estado marcado |
| aria-disabled | "true" | Si está deshabilitado | Estado deshabilitado |
| aria-invalid | "true" | Si hay error | Estado inválido |
| aria-required | "true" | Si es obligatorio | Campo requerido |
| aria-busy | "true" | Si está cargando | En progreso |
| aria-live | "polite"/"assertive" | Si es dinámico | Anunciar cambio |
| aria-atomic | "true" | Con aria-live | Anunciar todo |

### Estados por interacción

| Estado | Atributos ARIA |
|--------|----------------|
| Por defecto | {atributos base} |
| Hover | Sin cambio ARIA |
| Foco | Sin cambio ARIA |
| Expandido | aria-expanded="true" |
| Contraído | aria-expanded="false" |
| Seleccionado | aria-selected="true" |
| Deshabilitado | aria-disabled="true" |
| Cargando | aria-busy="true" |
| Error | aria-invalid="true", aria-errormessage="{id}" |

──────────────────────────────────────────────────────────────
⌨️ NAVEGACIÓN POR TECLADO
──────────────────────────────────────────────────────────────

### Teclas principales

| Tecla | Acción | Detalle |
|-------|--------|---------|
| Tab | Foco en el componente | Entra al componente |
| Shift+Tab | Foco anterior | Sale del componente |
| Enter | Activar | Acción principal |
| Space | Activar (toggle) | Para botones toggle |
| Escape | Cerrar/Cancelar | Si popup/modal |
| ↑ Flecha arriba | Elemento anterior | Navegación en lista |
| ↓ Flecha abajo | Elemento siguiente | Navegación en lista |
| ← Flecha izquierda | Elemento anterior (horizontal) | Pestañas, slider |
| → Flecha derecha | Elemento siguiente (horizontal) | Pestañas, slider |
| Home | Primer elemento | Navegación rápida |
| End | Último elemento | Navegación rápida |

### Gestión del foco

| Situación | Comportamiento |
|-----------|----------------|
| Al abrir | Foco en {primer elemento enfocable} |
| Al cerrar | Foco vuelve a {elemento disparador} |
| Navegación interna | Roving tabindex O aria-activedescendant |
| Trampa de foco | {Sí para modal / No para desplegable} |

### Roving tabindex (si aplica)

```html
<!-- Solo un elemento enfocable a la vez -->
<div role="tablist">
  <button role="tab" tabindex="0" aria-selected="true">Pestaña 1</button>
  <button role="tab" tabindex="-1" aria-selected="false">Pestaña 2</button>
  <button role="tab" tabindex="-1" aria-selected="false">Pestaña 3</button>
</div>
```

──────────────────────────────────────────────────────────────
🎯 FOCO VISIBLE
──────────────────────────────────────────────────────────────

### Estilo requerido (WCAG 2.4.11 AAA)

```css
.{componente}:focus-visible {
  /* Contorno visible */
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;

  /* Relación de contraste ≥ 3:1 */
  /* Área de foco ≥ perímetro visible */
}

/* Resetear para ratón */
.{componente}:focus:not(:focus-visible) {
  outline: none;
}
```

### Verificaciones

| Criterio | Valor | Estado |
|----------|-------|--------|
| Grosor del contorno | ≥ 2px | ✅ |
| Contraste del contorno | ≥ 3:1 | ✅ |
| Área visible | ≥ perímetro | ✅ |
| Visible sobre todos los fondos | Sí | ✅ |

──────────────────────────────────────────────────────────────
🔊 ANUNCIOS DEL LECTOR DE PANTALLA
──────────────────────────────────────────────────────────────

### Al recibir el foco

```
"{Etiqueta}, {rol}, {estado}"

Ejemplos:
- "Enviar, botón"
- "Menú principal, menú, contraído"
- "Nombre, campo de texto, requerido"
- "Boletín, casilla de verificación, no marcada"
```

### Durante la interacción

| Acción | Anuncio |
|--------|---------|
| Expansión | "expandido" / "contraído" |
| Selección | "seleccionado" |
| Toggle | "activado" / "desactivado" |
| Cargando | "Cargando" |
| Éxito | "{mensaje de éxito}" |
| Error | "Error: {mensaje}" |

### Contenido dinámico (aria-live)

```html
<!-- Notificaciones no urgentes (polite) -->
<div aria-live="polite" aria-atomic="true">
  {mensaje toast}
</div>

<!-- Notificaciones urgentes (errores) -->
<div aria-live="assertive" aria-atomic="true">
  {mensaje de error}
</div>
```

──────────────────────────────────────────────────────────────
📏 CONTRASTE (WCAG AAA)
──────────────────────────────────────────────────────────────

### Texto

| Tipo | Relación requerida | Verificación |
|------|--------------------|--------------|
| Texto normal (< 18px) | ≥ 7:1 | {color} / {fondo} = {relación} |
| Texto grande (≥ 18px o 14px negrita) | ≥ 4.5:1 | {color} / {fondo} = {relación} |

### Elementos UI

| Elemento | Relación requerida | Verificación |
|----------|--------------------|--------------|
| Bordes | ≥ 3:1 | {color} / {fondo} = {relación} |
| Iconos | ≥ 3:1 | {color} / {fondo} = {relación} |
| Contorno de foco | ≥ 3:1 | {color} / {fondo} = {relación} |

### Estados

| Estado | Verificación de contraste |
|--------|--------------------------|
| Por defecto | ✅ {relación} |
| Hover | ✅ {relación} |
| Foco | ✅ {relación} |
| Deshabilitado | ⚠️ No requerido pero recomendado |

──────────────────────────────────────────────────────────────
📐 OBJETIVOS TÁCTILES (WCAG 2.5.5 AAA)
──────────────────────────────────────────────────────────────

### Dimensiones mínimas

| Criterio | Valor | Estado |
|----------|-------|--------|
| Tamaño mínimo | 44 × 44 píxeles CSS | ✅/❌ |
| Espaciado entre objetivos | ≥ 8px | ✅/❌ |

### Implementación

```css
.{componente} {
  min-width: 44px;
  min-height: 44px;
  /* O padding para alcanzar 44px */
  padding: 10px 16px; /* si la altura del texto es ~24px */
}

/* Botones con icono */
.{componente}-icono {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

──────────────────────────────────────────────────────────────
🧪 PRUEBAS A REALIZAR
──────────────────────────────────────────────────────────────

### Automatizadas

- [ ] axe DevTools: 0 violaciones
- [ ] Lighthouse Accessibility: 100/100
- [ ] ESLint jsx-a11y: 0 errores

### Manuales

- [ ] Navegación completa por teclado
- [ ] Foco visible en cada paso
- [ ] Sin trampa de teclado
- [ ] Orden de foco lógico

### Lector de pantalla

- [ ] VoiceOver (macOS/iOS): anuncios correctos
- [ ] NVDA (Windows): navegación en listas/tablas
- [ ] TalkBack (Android): si es móvil

### Casos límite

- [ ] Zoom al 400%: sin pérdida de contenido
- [ ] Modo de alto contraste: visible
- [ ] Movimiento reducido: animaciones respetadas

──────────────────────────────────────────────────────────────
💻 EJEMPLO DE IMPLEMENTACIÓN
──────────────────────────────────────────────────────────────

```tsx
// {Componente}.tsx
import { forwardRef, useId } from 'react';

interface {Componente}Props {
  label: string;
  description?: string;
  disabled?: boolean;
  // ...otras props
}

export const {Componente} = forwardRef<HTML{Elemento}Element, {Componente}Props>(
  ({ label, description, disabled, ...props }, ref) => {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;

    return (
      <{elemento}
        ref={ref}
        id={id}
        role="{role}"
        aria-label={label}
        aria-describedby={descriptionId}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {/* Contenido */}

        {description && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </{elemento}>
    );
  }
);

{Componente}.displayName = '{Componente}';
```

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDACIÓN
──────────────────────────────────────────────────────────────

### Semántica
- [ ] Elemento HTML nativo usado si es posible
- [ ] Rol ARIA correcto si es personalizado
- [ ] Estructura DOM lógica

### ARIA
- [ ] Atributos requeridos presentes
- [ ] Atributos condicionales correctos
- [ ] Sin sobrecarga de ARIA (nativo > ARIA)

### Teclado
- [ ] Enfocable (tabindex apropiado)
- [ ] Todas las acciones disponibles por teclado
- [ ] Sin trampa de teclado
- [ ] Foco visible conforme

### Anuncios
- [ ] Etiqueta anunciada al recibir foco
- [ ] Estados anunciados al cambiar
- [ ] Errores con aria-live assertive

### Contraste
- [ ] Texto ≥ 7:1 (AAA)
- [ ] UI ≥ 3:1
- [ ] Foco ≥ 3:1

### Táctil
- [ ] Objetivos ≥ 44×44px
- [ ] Espaciado ≥ 8px
```
