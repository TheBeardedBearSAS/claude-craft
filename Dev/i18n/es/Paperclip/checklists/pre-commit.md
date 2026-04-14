# Checklist Pre-Commit — Paperclip

## Validación Rápida Antes de Cada Commit

### Calidad de Código

- [ ] `pnpm format --check` pasa
- [ ] `pnpm lint` pasa (0 errores, 0 advertencias)
- [ ] `pnpm typecheck` pasa a través de workspaces
- [ ] Sin `any`, sin `as any`, sin `// @ts-ignore`
- [ ] Sin `console.log` / `debugger` en código de runtime
- [ ] Sin exports sin usar (ejecutar `pnpm knip` localmente)

### Tests

- [ ] `pnpm test --changed` pasa
- [ ] Nueva funcionalidad → nuevo(s) test(s) agregado(s)
- [ ] Bug fix → test de regresión agregado
- [ ] Cambio de adaptador → `contract.test.ts` todavía verde

### Gobernanza y Seguridad

- [ ] Sin decisión de gobernanza agregada a ningún adaptador (`adapters/**`)
- [ ] Cada nueva mutación DB emite un evento de actividad
- [ ] Sin `companyId` viniendo del body/query del cliente
- [ ] Sin valor de secreto hard-coded
- [ ] Logs no exponen secretos, tokens, o bodies completos

### Build

- [ ] `pnpm build` tiene éxito
- [ ] Sin nuevas advertencias de deprecación

### Docs

- [ ] Especificación OpenAPI actualizada para rutas nuevas/cambiadas
- [ ] README de adaptador actualizado si las acciones soportadas cambiaron
- [ ] Entrada CHANGELOG bajo `## Unreleased`

### Git

- [ ] Mensaje de commit sigue Conventional Commits (`feat(adapters): …`, `fix(approvals): …`)
- [ ] Branch rebaseada en `main`
- [ ] Sin `TODO: remove` o statements debug `console.log` residuales
- [ ] `.env` no está staged

## Validación Automatizada

`package.json`:

```jsonc
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged",
    "commit-msg": "npx --no-install commitlint --edit \"$1\"",
    "pre-push": "pnpm typecheck && pnpm test --changed"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"],
    "*.{json,md,yaml,yml}": ["prettier --write"]
  }
}
```

## Comandos Rápidos

```bash
pnpm lint
pnpm lint --fix
pnpm typecheck
pnpm test --changed
pnpm format
pnpm audit --audit-level=high
```

## Problemas Comunes

### "Test requiere una DB real" en CI
Usar testcontainers o levantar Postgres en el workflow — nunca mockear la DB en tests de integración.

### "Test de contrato de adaptador falla"
No bajar las expectativas de la suite. Corregir el adaptador. La suite ES el contrato.

### "Entrada de log de actividad faltante"
Agregar `this.activity.emit({ event: '<domain>.<action>', ... })` en el servicio después de la mutación exitosa.

## Antes de Push

- [ ] Todos los commits siguen Conventional Commits
- [ ] Branch rebaseada en `main`
- [ ] CI estará verde (lint + typecheck + test + build)
- [ ] Tests de contrato de adaptador pasan localmente para cualquier adaptador tocado

## Notas

- Mantener commits pequeños y enfocados
- Nunca saltarse hooks (`--no-verify`) — si un hook falla, corregir la causa
- Bugs de gobernanza son incidentes de producción, no advertencias — tratarlos con urgencia
