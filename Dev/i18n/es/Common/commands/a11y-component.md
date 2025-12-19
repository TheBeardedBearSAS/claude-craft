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

Ejemplo: `/common:a11y-component Modal` o `/common:a11y-component "Selector de Fecha" tipo:input`

## MISIÓN

### Paso 1: Identificar el patrón ARIA

Consultar las ARIA Authoring Practices Guide (APG) para el patrón correspondiente.

### Paso 2: Producir la especificación

```
══════════════════════════════════════════════════════════════
♿ ESPECIFICACIÓN ACCESIBILIDAD: {NOMBRE_COMPONENTE}
══════════════════════════════════════════════════════════════

Tipo: {Button | Input | Dialog | Listbox | Tabs | ...}
Patrón APG: {enlace al patrón oficial}
Fecha: {fecha}

──────────────────────────────────────────────────────────────
📋 SEMÁNTICA HTML
──────────────────────────────────────────────────────────────

### Elemento nativo recomendado
```html
<!-- Siempre preferir elemento nativo -->
<{elemento} ...>
  {contenido}
</{elemento}>
```

### Estructura completa
```html
<!-- Ejemplo completo con ARIA -->
<div
  role="{role}"
  aria-{atributo}="{valor}"
  tabindex="0"
>
  <span id="{id}-label">{Label}</span>
  {contenido}
</div>
```

──────────────────────────────────────────────────────────────
🏷️ ATRIBUTOS ARIA
──────────────────────────────────────────────────────────────

### Atributos requeridos
| Atributo | Valor | Cuándo | Descripción |
|----------|-------|--------|-------------|
| role | {role} | Siempre (si custom) | Define el tipo |
| aria-label | "{texto}" | Si no hay label visible | Label accesible |

### Atributos condicionales
| Atributo | Valor | Cuándo | Descripción |
|----------|-------|--------|-------------|
| aria-expanded | "true"/"false" | Si expandible | Estado abierto/cerrado |
| aria-disabled | "true" | Si deshabilitado | Estado deshabilitado |

──────────────────────────────────────────────────────────────
⌨️ NAVEGACIÓN POR TECLADO
──────────────────────────────────────────────────────────────

| Tecla | Acción | Detalle |
|-------|--------|---------|
| Tab | Foco en el componente | Entra al componente |
| Enter | Activar | Acción principal |
| Space | Activar (toggle) | Para botones toggle |
| Escape | Cerrar/Cancelar | Si popup/modal |
| Flechas | Navegación interna | En listas |

──────────────────────────────────────────────────────────────
🔊 ANUNCIOS DEL LECTOR DE PANTALLA
──────────────────────────────────────────────────────────────

### Al entrar (foco)
```
"{Label}, {rol}, {estado}"
Ejemplos:
- "Enviar, botón"
- "Menú principal, menú, contraído"
```

### Durante interacción
| Acción | Anuncio |
|--------|---------|
| Expansión | "expandido" / "contraído" |
| Error | "Error: {mensaje}" |

──────────────────────────────────────────────────────────────
📐 OBJETIVOS TÁCTILES (WCAG 2.5.5 AAA)
──────────────────────────────────────────────────────────────

| Criterio | Valor | Estado |
|----------|-------|--------|
| Tamaño mínimo | 44 × 44 píxeles CSS | ✅/❌ |
| Espaciado entre objetivos | ≥ 8px | ✅/❌ |

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDACIÓN
──────────────────────────────────────────────────────────────

### Semántica
- [ ] Elemento HTML nativo usado si es posible
- [ ] Rol ARIA correcto si es custom
- [ ] Estructura DOM lógica

### ARIA
- [ ] Atributos requeridos presentes
- [ ] Sin sobre-ARIA (nativo > ARIA)

### Teclado
- [ ] Focusable (tabindex apropiado)
- [ ] Todas las acciones vía teclado
- [ ] Sin trampa de teclado
- [ ] Foco visible conforme

### Contraste
- [ ] Texto ≥ 7:1 (AAA)
- [ ] UI ≥ 3:1
```
