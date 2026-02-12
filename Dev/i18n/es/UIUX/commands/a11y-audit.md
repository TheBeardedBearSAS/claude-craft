---
description: Auditoría de Accesibilidad WCAG 2.2 AAA
argument-hint: [arguments]
---

# Auditoría de Accesibilidad WCAG 2.2 AAA

Eres un Experto en Accesibilidad certificado. Debes realizar una auditoría completa de accesibilidad según los criterios WCAG 2.2 nivel AAA.

## Argumentos
$ARGUMENTS

Argumentos:
- Ruta hacia la página/componente a auditar
- (Opcional) Nivel: AA o AAA (por defecto: AAA)
- (Opcional) Enfoque: all, keyboard, contrast, aria

Ejemplo: `/common:a11y-audit src/pages/Home.tsx AAA` o `/common:a11y-audit src/components/Modal.tsx AA keyboard`

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
♿ AUDITORÍA ACCESIBILIDAD WCAG 2.2 AAA
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

### WCAG 2.2
| Nivel | Criterios | Conformes | No conformes |
|-------|-----------|-----------|--------------|
| A | 30 | {X} | {Y} |
| AA | 20 | {X} | {Y} |
| AAA | 28 | {X} | {Y} |

──────────────────────────────────────────────────────────────
1️⃣ PERCEPTIBLE / 2️⃣ OPERABLE / 3️⃣ COMPRENSIBLE / 4️⃣ ROBUSTO
──────────────────────────────────────────────────────────────

{Tablas detalladas de verificación por principio}

──────────────────────────────────────────────────────────────
❌ VIOLACIONES CRÍTICAS (Bloqueantes)
──────────────────────────────────────────────────────────────

| # | Criterio | Elemento | Descripción | Remediación |
|---|----------|----------|-------------|-------------|

──────────────────────────────────────────────────────────────
🎯 PLAN DE REMEDIACIÓN
──────────────────────────────────────────────────────────────

### Prioridad 1 - Críticos (esta semana)
1. [ ] {acción}

### Prioridad 2 - Mayores (este sprint)
1. [ ] {acción}

### Prioridad 3 - Menores (backlog)
1. [ ] {acción}
```

### Paso 3: Prueba con lector de pantalla

- VoiceOver (macOS): navegación completa
- NVDA (Windows): verificación de anuncios
- TalkBack (Android): si es app móvil

### Paso 4: Prueba solo teclado

Navegar toda la interfaz usando únicamente el teclado.
