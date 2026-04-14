# Herramientas de Calidad — Paperclip

Análisis estático, verificación de tipos, y puertas de CI que mantienen saludables las contribuciones a Paperclip.

## Herramientas Requeridas

| Herramienta | Propósito | Puerta |
|---|---|---|
| `tsc --noEmit` | Corrección de tipos | Falla CI en error |
| ESLint flat config | Lint (reglas tipadas) | Falla CI en error, advertencias permitidas ≤ 0 |
| Prettier | Formateo | Falla CI en diff |
| Vitest + v8 coverage | Tests + cobertura | Falla CI bajo umbrales |
| knip | Código muerto / exports sin usar | Advertir en CI, arreglar antes de release |
| `pnpm audit` (high/critical) | Deps vulnerables | Falla CI en high / critical |
| commitlint | Conventional Commits | Falla CI en commit malo |

Opcional pero recomendado: testing de mutación **Stryker** en módulos core (agents, approvals, costs) — puntaje de mutación objetivo ≥ 70%.

---

## Complejidad Cognitiva

Fuente: plugin SonarJS o `eslint-plugin-sonarjs`.

- Límite de función: **< 10** (advertir en 8).
- Límite de archivo: **< 200** (advertir en 150).

Sobre el límite → refactorizar, no silenciar.

---

## Trinquete de Estrictez TypeScript

El `tsconfig.base.json` base debe mantener estos ACTIVADOS:

```
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"exactOptionalPropertyTypes": true,
"noFallthroughCasesInSwitch": true,
"noImplicitReturns": true
```

El `tsconfig.json` por paquete puede estrechar más pero nunca aflojar.

---

## ESLint — Reglas No Negociables

```js
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  'no-restricted-syntax': ['error', {
    selector: "TSAsExpression[typeAnnotation.typeName.name='any']",
    message: 'No casts to any. Model the type properly.',
  }],
}
```

---

## Pipeline de CI

```yaml
- pnpm install --frozen-lockfile
- pnpm format --check           # Prettier
- pnpm lint                     # ESLint
- pnpm typecheck                # tsc --noEmit
- pnpm test --coverage          # Vitest
- pnpm build                    # Asegura que no haya rompimientos solo de build
- pnpm knip                     # Código muerto (advertir)
- pnpm audit --prod --audit-level=high
```

Cualquier paso fallido bloquea el merge. Sin "overrides" excepto vía un PR etiquetado `tech-debt` con un issue enlazado.

---

## Umbrales de Cobertura

Forzados en `vitest.config.ts`:

- Líneas: 80
- Funciones: 80
- Ramas: 75
- Sentencias: 80

Objetivo por módulo (más estricto): agents, approvals, costs, adapters → 90%.

---

## Higiene de Dependencias

- `pnpm up -iL` semanal (solo patch/minor sin revisión de PR).
- Bumps mayores = PR dedicado con notas de migración.
- Renovate o Dependabot configurado con PRs agrupados.
- Deriva de peer-dep rechazada (`pnpm install` debe estar limpio).

---

## Puerta de Release

Antes de cortar un release:

- [ ] `pnpm ci` verde en main para los últimos 10 commits
- [ ] Sin `TODO: remove before release` en el diff
- [ ] CHANGELOG actualizado (Keep a Changelog)
- [ ] Tests de contrato de adapter pasan para todos los adapters enviados
- [ ] `pnpm audit` limpio a nivel `high`
- [ ] Guía de migración escrita si hay migración de DB o ruptura de API

---

## Checklist

- [ ] Config flat de ESLint con strict-type-checked
- [ ] `tsc --noEmit` pasa a través de workspaces
- [ ] Umbrales de cobertura forzados en CI
- [ ] Reportes de knip resueltos antes del release
- [ ] `pnpm audit` verde en `high`
- [ ] Commitlint habilitado

---

**Última actualización:** 2026-04 | **Versión:** 1.0.0 | **Autor:** The Bearded CTO
