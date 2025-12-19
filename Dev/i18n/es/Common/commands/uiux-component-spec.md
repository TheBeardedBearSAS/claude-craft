---
description: Especificación Completa de Componente UI/UX/A11y
argument-hint: [arguments]
---

# Especificación Completa de Componente UI/UX/A11y

Eres el Orquestador UI/UX. Debes producir una especificación completa de componente involucrando a los 3 expertos: UX para el comportamiento, UI para lo visual, A11y para la accesibilidad.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre del componente a especificar
- (Opcional) Contexto de uso

Ejemplo: `/common:uiux-component-spec Button` o `/common:uiux-component-spec "Tarjeta de Viaje" contexto:"SaaS de Turismo"`

## MISIÓN

### Paso 1: Análisis UX (Experto UX)

Definir comportamiento y uso:
- Objetivo del componente
- Casos de uso principales
- Interacciones esperadas
- Estados funcionales

### Paso 2: Especificación UI (Experto UI)

Definir lo visual:
- Anatomía y estructura
- Variantes
- Estados visuales
- Tokens utilizados
- Responsive

### Paso 3: Especificación A11y (Experto A11y)

Definir accesibilidad:
- Semántica HTML
- Atributos ARIA
- Navegación por teclado
- Anuncios de lector de pantalla

### Paso 4: Síntesis

```
══════════════════════════════════════════════════════════════
📦 ESPECIFICACIÓN DE COMPONENTE: {NOMBRE}
══════════════════════════════════════════════════════════════

Categoría: Átomo | Molécula | Organismo
Fecha: {fecha}
Versión: 1.0

──────────────────────────────────────────────────────────────
🧠 COMPORTAMIENTO (UX)
──────────────────────────────────────────────────────────────

### Objetivo
{Descripción del rol y valor para el usuario}

### Casos de Uso
| Caso | Contexto | Comportamiento Esperado |
|------|----------|------------------------|
| Principal | {contexto} | {comportamiento} |
| Secundario | {contexto} | {comportamiento} |

### Estados Funcionales
| Estado | Disparador | Comportamiento |
|--------|------------|----------------|
| default | Inicial | {comportamiento} |
| loading | Acción en curso | {comportamiento} |
| success | Acción exitosa | {comportamiento} |
| error | Fallo | {comportamiento} |
| empty | Sin datos | {comportamiento} |

### Feedback al Usuario
| Acción | Feedback | Retardo |
|--------|----------|---------|
| Click | {feedback} | Inmediato |
| Hover | {feedback} | Inmediato |
| Submit | {feedback} | < 200ms |

──────────────────────────────────────────────────────────────
🎨 VISUAL (UI)
──────────────────────────────────────────────────────────────

### Anatomía
```
┌─────────────────────────────────┐
│ [Icono]  Label         [Acción] │
│         Descripción            │
└─────────────────────────────────┘
```

- **Slot 1**: {descripción}
- **Slot 2**: {descripción}

### Dimensiones
| Propiedad | Móvil | Tablet | Desktop |
|-----------|-------|--------|---------|
| min-width | {val} | {val} | {val} |
| height | {val} | {val} | {val} |
| padding | {val} | {val} | {val} |

### Variantes
| Variante | Uso | Diferencias Visuales |
|----------|-----|---------------------|
| primary | CTA principal | {tokens} |
| secondary | Acción secundaria | {tokens} |
| ghost | Acción terciaria | {tokens} |
| destructive | Eliminación | {tokens} |

### Estados Visuales
| Estado | Fondo | Borde | Texto | Otro |
|--------|-------|-------|-------|------|
| default | --color-{x} | --color-{x} | --color-{x} | |
| hover | --color-{x} | --color-{x} | --color-{x} | cursor: pointer |
| focus | --color-{x} | --color-{x} | --color-{x} | outline: 2px |
| active | --color-{x} | --color-{x} | --color-{x} | transform |
| disabled | --color-{x} | --color-{x} | --color-{x} | opacity: 0.5 |
| loading | --color-{x} | --color-{x} | --color-{x} | spinner |

### Micro-interacciones
| Disparador | Animación | Duración | Easing |
|------------|-----------|----------|--------|
| hover | {efecto} | 150ms | ease-out |
| click | {efecto} | 100ms | ease-in |
| focus | {efecto} | 0ms | - |

### Tokens Utilizados
```css
/* Colores */
--color-primary-500
--color-neutral-100
--color-error-500

/* Tipografía */
--font-size-sm
--font-weight-medium

/* Espaciado */
--spacing-2
--spacing-4

/* Otros */
--radius-md
--shadow-sm
--transition-fast
```

──────────────────────────────────────────────────────────────
♿ ACCESIBILIDAD (A11y)
──────────────────────────────────────────────────────────────

### Semántica HTML
```html
<button type="button" class="{componente}">
  <!-- Usar elemento nativo -->
</button>
```

### Atributos ARIA
| Atributo | Valor | Condición |
|----------|-------|-----------|
| aria-label | "{texto}" | Si solo icono |
| aria-describedby | "{id}" | Si descripción |
| aria-disabled | "true" | Si deshabilitado |
| aria-busy | "true" | Si cargando |

### Navegación por Teclado
| Tecla | Acción |
|-------|--------|
| Tab | Foco en el elemento |
| Enter | Activar |
| Space | Activar |
| Escape | Cancelar (si aplica) |

### Gestión del Foco
- **Foco inicial**: Automático vía tabindex
- **Estilo de foco**: outline 2px solid, offset 2px, ratio ≥ 3:1
- **Trap**: No aplica (no es modal)

### Contraste (AAA)
| Elemento | Ratio Requerido | Ratio Actual |
|----------|-----------------|--------------|
| Texto del label | ≥ 7:1 | ✅ {ratio} |
| Icono | ≥ 3:1 | ✅ {ratio} |
| Borde | ≥ 3:1 | ✅ {ratio} |

### Anuncios del Lector de Pantalla
| Momento | Anuncio |
|---------|---------|
| Foco | "{label}, botón" |
| Cargando | "Cargando" |
| Éxito | "Acción exitosa" |
| Error | "Error: {mensaje}" |

### Objetivo Táctil
- Tamaño mínimo: 44×44px ✅
- Espaciado: ≥ 8px ✅

──────────────────────────────────────────────────────────────
💻 IMPLEMENTACIÓN
──────────────────────────────────────────────────────────────

### Interfaz Props (TypeScript)
```typescript
interface {Componente}Props {
  /** Variante visual */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Estado deshabilitado */
  disabled?: boolean;
  /** Estado de carga */
  loading?: boolean;
  /** Icono izquierdo */
  leftIcon?: ReactNode;
  /** Icono derecho */
  rightIcon?: ReactNode;
  /** Handler de click */
  onClick?: () => void;
  /** Contenido */
  children: ReactNode;
}
```

### Ejemplo de Uso
```tsx
<Button
  variant="primary"
  size="md"
  leftIcon={<PlusIcon />}
  onClick={handleClick}
>
  Agregar
</Button>
```

──────────────────────────────────────────────────────────────
✅ CHECKLIST DE VALIDACIÓN
──────────────────────────────────────────────────────────────

### UX
- [ ] Objetivo claro definido
- [ ] Todos los estados funcionales documentados
- [ ] Feedback al usuario especificado

### UI
- [ ] Todas las variantes definidas
- [ ] Todos los estados visuales especificados
- [ ] Responsive documentado
- [ ] Solo tokens (sin hardcode)

### A11y
- [ ] Semántica HTML correcta
- [ ] ARIA mínimo y correcto
- [ ] Navegación por teclado completa
- [ ] Contrastes AAA verificados
- [ ] Objetivos táctiles ≥ 44px
```
