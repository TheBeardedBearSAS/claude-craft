---
description: Comando: Verificación de Accesibilidad
---

# Comando: Verificación de Accesibilidad

Realiza una auditoría completa de accesibilidad de la aplicación React.

## Ejecución

```bash
npm run accessibility-check
```

## Acciones Automáticas

### 1. Análisis con axe-core

```bash
# Instalar herramientas
npm install -D @axe-core/react

# Ejecutar análisis
npm run dev
# axe-core reportará automáticamente en consola
```

### 2. Verificar con ESLint (jsx-a11y)

```bash
# Verificar reglas de accesibilidad
npx eslint . --ext .tsx,.ts --config .eslintrc.cjs --plugin jsx-a11y
```

### 3. Lighthouse Accessibility Audit

```bash
# Instalar Lighthouse
npm install -D lighthouse

# Ejecutar audit
npx lighthouse http://localhost:3000 --only-categories=accessibility --view
```

### 4. Tests Automatizados de Accesibilidad

```typescript
// accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { App } from './App';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

## Checklist Manual

### Navegación por Teclado
- [ ] Tab navega a través de todos los elementos interactivos
- [ ] Orden de Tab lógico
- [ ] Enter/Space activa botones
- [ ] Escape cierra modales
- [ ] Flechas navegan en listas/menús

### Focus Management
- [ ] Focus visible claramente
- [ ] Focus no queda atrapado
- [ ] Focus restaurado apropiadamente después de modales
- [ ] Skip links disponibles
- [ ] Focus styling personalizado (no remover outline sin reemplazar)

### ARIA
- [ ] Roles ARIA apropiados (`role="button"`, `role="dialog"`, etc.)
- [ ] Labels (`aria-label`, `aria-labelledby`)
- [ ] Descriptions (`aria-describedby`)
- [ ] Estados (`aria-expanded`, `aria-selected`, etc.)
- [ ] Properties (`aria-required`, `aria-invalid`, etc.)
- [ ] Live regions (`aria-live`, `aria-atomic`)

### Formularios
- [ ] Todos los inputs tienen `<label>` asociada
- [ ] Labels visibles (no solo placeholders)
- [ ] Mensajes de error vinculados con `aria-describedby`
- [ ] Campos requeridos indicados (`required` o `aria-required`)
- [ ] Instrucciones claras para campos complejos
- [ ] Validación en tiempo real accesible

### Contenido
- [ ] Imágenes tienen `alt` text descriptivo
- [ ] Imágenes decorativas tienen `alt=""` vacío
- [ ] Enlaces tienen texto descriptivo (no "click aquí")
- [ ] Headings en orden jerárquico (h1, h2, h3)
- [ ] Contenido estructurado semánticamente
- [ ] Idioma especificado (`lang` attribute)

### Colores y Contraste
- [ ] Contraste de texto suficiente (WCAG AA: 4.5:1)
- [ ] Contraste de elementos grandes (WCAG AA: 3:1)
- [ ] Información no solo por color
- [ ] Dark mode accesible
- [ ] Estados hover/focus visibles

### Multimedia
- [ ] Videos tienen subtítulos
- [ ] Audios tienen transcripciones
- [ ] Autoplay controlable
- [ ] Controles de media accesibles

### Interacciones Dinámicas
- [ ] Cambios de estado anunciados (aria-live)
- [ ] Loading states comunicados
- [ ] Errores anunciados a lectores de pantalla
- [ ] Confirmaciones comunicadas
- [ ] Timeouts evitados o extensibles

## Herramientas Recomendadas

### Extensiones de Navegador
- **axe DevTools** (Chrome/Firefox)
- **WAVE** (Web Accessibility Evaluation Tool)
- **Lighthouse** (Chrome DevTools)
- **ARIA DevTools**
- **Accessibility Insights**

### Lectores de Pantalla
- **NVDA** (Windows - Gratis)
- **JAWS** (Windows - Comercial)
- **VoiceOver** (macOS/iOS - Integrado)
- **TalkBack** (Android - Integrado)

### Testing
```bash
# Instalar dependencias de testing
npm install -D jest-axe @testing-library/jest-dom
npm install -D @axe-core/playwright  # Para Playwright E2E
```

## Configuración de axe-core en Desarrollo

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Agregar axe-core en desarrollo
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000, {});
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Tests E2E con Playwright

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have automatic accessibility violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('should navigate with keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocus = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(firstFocus);
  });
});
```

## Niveles de Conformidad WCAG

### Level A (Básico)
- Elementos esenciales de accesibilidad
- Mínimo legal en muchas jurisdicciones
- Debe cumplirse

### Level AA (Estándar)
- Elimina barreras significativas
- Recomendado para todos los sitios
- Objetivo estándar de la industria

### Level AAA (Avanzado)
- Máxima accesibilidad
- Difícil de alcanzar completamente
- Aspiracional

## Problemas Comunes y Soluciones

### 1. Falta de Text Alternativo
```tsx
// ❌ Mal
<img src="profile.jpg" />

// ✅ Bien
<img src="profile.jpg" alt="Foto de perfil de John Doe" />

// ✅ Bien (imagen decorativa)
<img src="decoration.jpg" alt="" role="presentation" />
```

### 2. Botones No Accesibles
```tsx
// ❌ Mal
<div onClick={handleClick}>Click me</div>

// ✅ Bien
<button onClick={handleClick}>Click me</button>

// ✅ Bien (si debe ser div)
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### 3. Form Labels Faltantes
```tsx
// ❌ Mal
<input type="text" placeholder="Email" />

// ✅ Bien
<label htmlFor="email">Email</label>
<input type="text" id="email" />

// ✅ Bien (label visual oculto)
<label htmlFor="search" className="sr-only">Search</label>
<input type="text" id="search" placeholder="Search..." />
```

### 4. Contraste Insuficiente
```css
/* ❌ Mal - Contraste 2.5:1 */
.text {
  color: #767676;
  background: #ffffff;
}

/* ✅ Bien - Contraste 4.6:1 */
.text {
  color: #595959;
  background: #ffffff;
}
```

### 5. Focus No Visible
```css
/* ❌ Mal */
*:focus {
  outline: none;
}

/* ✅ Bien */
*:focus-visible {
  outline: 2px solid #4A90E2;
  outline-offset: 2px;
}
```

## Script de Auditoría Completa

```bash
#!/bin/bash
# audit-accessibility.sh

echo "🔍 Iniciando auditoría de accesibilidad..."

# 1. Verificar ESLint jsx-a11y
echo "\n📋 Verificando reglas ESLint..."
npx eslint . --ext .tsx,.ts

# 2. Ejecutar tests de accesibilidad
echo "\n🧪 Ejecutando tests..."
npm run test -- accessibility

# 3. Lighthouse audit
echo "\n💡 Ejecutando Lighthouse..."
npx lighthouse http://localhost:3000 \
  --only-categories=accessibility \
  --output=html \
  --output-path=./accessibility-report.html

# 4. Análisis con Pa11y
echo "\n🎯 Ejecutando Pa11y..."
npx pa11y http://localhost:3000

echo "\n✅ Auditoría completada!"
echo "📊 Ver reporte: ./accessibility-report.html"
```

## Recursos

### Documentación
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility](https://react.dev/learn/accessibility)

### Testing
- [axe-core](https://github.com/dequelabs/axe-core)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Testing Library](https://testing-library.com/docs/queries/byrole/)

### Herramientas
- [Accessible Color Palette Builder](https://toolness.github.io/accessible-color-matrix/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)

---

**Objetivo**: Alcanzar WCAG 2.1 Level AA como mínimo

**Frecuencia**: Verificar en cada feature nueva y antes de cada release

**Versión**: 1.0
**Última actualización**: 2025-12-03
