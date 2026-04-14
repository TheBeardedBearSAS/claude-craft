---
description: Auditar Calidad de Código Paperclip
argument-hint: [ruta-proyecto]
---

# Auditar Calidad de Código Paperclip

## MISIÓN

Medir strictness de TypeScript, cumplimiento de lint, nomenclatura, complejidad e higiene de logging en un proyecto Paperclip.

## Procedimiento

### 1. Baseline de TypeScript

- [ ] `tsconfig.base.json` tiene `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- [ ] `pnpm typecheck` tiene éxito (sin errores de `tsc` a través de workspaces)
- [ ] Ningún tsconfig por paquete relaja el baseline

### 2. Patrones prohibidos

Grep y reportar:
- Anotaciones `: any`
- Casts `as any` / `as unknown as`
- `// @ts-ignore`, `// @ts-expect-error` sin un issue de GitHub vinculado en el mismo comentario de línea
- Aserciones non-null `!.` en valores devueltos por DB

### 3. Lint & format

- [ ] `pnpm lint` sale con 0, cero advertencias
- [ ] `pnpm format --check` reporta sin diff
- [ ] Configuración ESLint usa `strict-type-checked`
- [ ] Las reglas ESLint no-negociables de `rules/08-quality-tools.md` están habilitadas

### 4. Nomenclatura

Muestrear 20 archivos. Verificar:
- Archivos son kebab-case (`agent-service.ts`, no `AgentService.ts` ni `agent_service.ts`)
- Tipos son PascalCase
- Funciones / vars son camelCase
- Constantes son UPPER_SNAKE
- Variables de entorno leídas vía módulo de config parseado, con prefijo `PAPERCLIP_`

### 5. Complejidad cognitiva

Ejecutar `eslint-plugin-sonarjs` (o equivalente). Señalar cualquier función con complejidad cognitiva ≥ 10. Señalar cualquier archivo > 300 líneas.

### 6. Higiene de logging

- [ ] Logs usan un logger estructurado (pino o equivalente), nunca `console.log` en código de runtime
- [ ] Ningún campo cuyo nombre coincida con `/key|token|secret|password|authorization/i` es registrado como valor
- [ ] Sin logging completo de request body

### 7. Correctitud async

- [ ] `@typescript-eslint/no-floating-promises` = error, pasa
- [ ] Sin cadenas `.then()` (grep `.then(`)
- [ ] Todos los timeouts usan `AbortController`

### 8. Modelado de errores

- [ ] Servicios del servidor lanzan subclases de `DomainError`, no `Error` plano
- [ ] Cada error de dominio tiene un campo `code` estable
- [ ] Sin `throw` de strings o literales

## Output

Reporte Markdown con pasa/falla por sección, archivos/símbolos ofensores, severidad, y un puntaje /20 para `/paperclip:check-compliance`.
