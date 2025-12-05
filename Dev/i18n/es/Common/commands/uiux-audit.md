# Auditoría Completa UI/UX/Accesibilidad

Eres el Orquestador UI/UX. Debes realizar una auditoría completa de la interfaz involucrando secuencialmente a los 3 expertos: Accesibilidad, UX/Ergonomía, luego Diseño UI.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) URL o ruta de la página/componente a auditar
- (Opcional) Nivel WCAG: AA o AAA (por defecto: AAA)

Ejemplo: `/common:uiux-audit src/pages/Dashboard.tsx AAA`

## MISIÓN

### Paso 1: Auditoría de Accesibilidad (Experto A11y)

#### 1.1 Auditoría automatizada
```bash
# Ejecutar si está disponible
npx axe-cli {URL}
npx pa11y {URL}
# O verificar Lighthouse
```

#### 1.2 Verificación manual WCAG 2.2 AAA

**Perceptible**
- [ ] Imágenes con texto alt
- [ ] Estructura semántica (h1-h6, landmarks)
- [ ] Contraste ≥ 7:1 (AAA)
- [ ] Reflow a 320px

**Operable**
- [ ] Navegación completa por teclado
- [ ] Sin trampa de teclado
- [ ] Foco visible (≥ 2px)
- [ ] Objetivos táctiles ≥ 44px

**Comprensible**
- [ ] lang en html
- [ ] Labels en inputs
- [ ] Mensajes de error claros

**Robusto**
- [ ] ARIA correcto
- [ ] aria-live para dinámico

### Paso 2: Auditoría UX/Ergonomía (Experto UX)

#### 2.1 Heurísticas de Nielsen

| Heurística | Puntuación (1-5) | Observaciones |
|------------|------------------|---------------|
| Visibilidad del estado del sistema | | |
| Correspondencia con el mundo real | | |
| Control del usuario | | |
| Consistencia | | |
| Prevención de errores | | |
| Reconocimiento vs recuerdo | | |
| Flexibilidad | | |
| Minimalismo | | |
| Recuperación de errores | | |
| Ayuda | | |

#### 2.2 Análisis del journey

- Puntos de fricción identificados
- Carga cognitiva evaluada
- ¿Patrones de interacción consistentes?

### Paso 3: Auditoría de Diseño UI (Experto UI)

#### 3.1 Design System

- ¿Tokens consistentes?
- ¿Estados completos?
- ¿Responsive correcto?

#### 3.2 Consistencia visual

- ¿Tipografía uniforme?
- ¿Espaciado sistemático?
- ¿Iconografía consistente?

### Paso 4: Síntesis y Priorización

```
══════════════════════════════════════════════════════════════
🎨 INFORME DE AUDITORÍA UI/UX/A11Y
══════════════════════════════════════════════════════════════

Página/Componente: {nombre}
Fecha: {fecha}
Nivel objetivo: WCAG 2.2 AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 PUNTUACIONES GLOBALES
──────────────────────────────────────────────────────────────

| Dominio | Puntuación | Estado |
|---------|------------|--------|
| Accesibilidad | /100 | ✅/❌ |
| UX/Ergonomía | /100 | ✅/❌ |
| Diseño UI | /100 | ✅/❌ |
| **Global** | **/100** | |

Lighthouse:
| Performance | Accessibility | Best Practices | SEO |
|-------------|---------------|----------------|-----|
| /100 | /100 | /100 | /100 |

──────────────────────────────────────────────────────────────
❌ PROBLEMAS CRÍTICOS (Bloqueantes)
──────────────────────────────────────────────────────────────

### A11y
| # | Criterio WCAG | Descripción | Remediación |
|---|---------------|-------------|-------------|

### UX
| # | Heurística | Descripción | Remediación |
|---|------------|-------------|-------------|

### UI
| # | Aspecto | Descripción | Remediación |
|---|---------|-------------|-------------|

──────────────────────────────────────────────────────────────
⚠️ PROBLEMAS MAYORES (Importantes)
──────────────────────────────────────────────────────────────

{Tabla similar}

──────────────────────────────────────────────────────────────
ℹ️ MEJORAS SUGERIDAS
──────────────────────────────────────────────────────────────

{Tabla similar}

──────────────────────────────────────────────────────────────
✅ PUNTOS POSITIVOS
──────────────────────────────────────────────────────────────

- {buena práctica 1}
- {buena práctica 2}

──────────────────────────────────────────────────────────────
🎯 PLAN DE ACCIÓN PRIORIZADO
──────────────────────────────────────────────────────────────

### Prioridad 1 - Crítico (inmediato)
1. [ ] {acción}
2. [ ] {acción}

### Prioridad 2 - Mayor (esta semana)
1. [ ] {acción}
2. [ ] {acción}

### Prioridad 3 - Mejoras (backlog)
1. [ ] {acción}
2. [ ] {acción}

──────────────────────────────────────────────────────────────
📋 ARBITRAJES REALIZADOS
──────────────────────────────────────────────────────────────

En caso de conflicto entre recomendaciones:
1. Accesibilidad AAA (no negociable)
2. Lighthouse 100/100
3. UX sobre UI
4. Mobile-first
5. Consistencia del design system
```

## Reglas de Arbitraje

| Prioridad | Regla |
|-----------|-------|
| 1 | Accesibilidad AAA no negociable |
| 2 | Lighthouse 100/100 obligatorio |
| 3 | UX > Estética |
| 4 | Mobile-first |
| 5 | Consistencia del design system |
