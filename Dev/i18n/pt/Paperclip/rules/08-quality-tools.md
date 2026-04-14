# Ferramentas de Qualidade — Paperclip

Analise estatica, verificacao de tipos, e gates CI que mantem contribuicoes Paperclip saudaveis.

## Ferramentas Obrigatorias

| Ferramenta | Proposito | Gate |
|---|---|---|
| `tsc --noEmit` | Correcao de tipos | Falhar CI em erro |
| ESLint flat config | Lint (regras tipadas) | Falhar CI em erro, warnings permitidos ≤ 0 |
| Prettier | Formatacao | Falhar CI em diff |
| Vitest + v8 coverage | Testes + cobertura | Falhar CI abaixo dos thresholds |
| knip | Dead code / exports nao usados | Warn em CI, corrigir antes release |
| `pnpm audit` (high/critical) | Deps vulneraveis | Falhar CI em high / critical |
| commitlint | Conventional Commits | Falhar CI em commit ruim |

Opcional mas recomendado: **Stryker** mutation testing em modulos core (agents, approvals, costs) — meta mutation score ≥ 70%.

---

## Complexidade Cognitiva

Fonte: plugin SonarJS ou `eslint-plugin-sonarjs`.

- Limite funcao: **< 10** (warn em 8).
- Limite arquivo: **< 200** (warn em 150).

Acima do limite → refatorar, nao silenciar.

---

## Catraca de Rigor TypeScript

Baseline `tsconfig.base.json` deve manter estes ON:

```
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"exactOptionalPropertyTypes": true,
"noFallthroughCasesInSwitch": true,
"noImplicitReturns": true
```

`tsconfig.json` por pacote pode estreitar mais mas nunca afrouxar.

---

## ESLint — Regras Inegociaveis

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

## Pipeline CI

```yaml
- pnpm install --frozen-lockfile
- pnpm format --check           # Prettier
- pnpm lint                     # ESLint
- pnpm typecheck                # tsc --noEmit
- pnpm test --coverage          # Vitest
- pnpm build                    # Garante sem breakage apenas build
- pnpm knip                     # Dead code (warn)
- pnpm audit --prod --audit-level=high
```

Qualquer step falhando bloqueia merge. Sem "overrides" exceto via PR rotulado `tech-debt` com issue linkado.

---

## Thresholds de Cobertura

Forcado em `vitest.config.ts`:

- Lines: 80
- Functions: 80
- Branches: 75
- Statements: 80

Meta por modulo (mais estrito): agents, approvals, costs, adapters → 90%.

---

## Higiene de Dependencias

- `pnpm up -iL` semanalmente (patch/minor apenas sem PR review).
- Bumps major = PR dedicado com notas de migracao.
- Renovate ou Dependabot configurado com PRs agrupados.
- Drift peer-dep rejeitado (`pnpm install` deve estar limpo).

---

## Gate de Release

Antes de cortar um release:

- [ ] `pnpm ci` verde em main nos ultimos 10 commits
- [ ] Sem `TODO: remove before release` no diff
- [ ] CHANGELOG atualizado (Keep a Changelog)
- [ ] Testes de contrato adapter passam para todos adapters enviados
- [ ] `pnpm audit` limpo no nivel `high`
- [ ] Guia de migracao escrito se qualquer migracao DB ou break API

---

## Checklist

- [ ] ESLint flat config com strict-type-checked
- [ ] `tsc --noEmit` passa nos workspaces
- [ ] Thresholds de cobertura forcados em CI
- [ ] Relatorios knip resolvidos antes release
- [ ] `pnpm audit` verde em `high`
- [ ] Commitlint habilitado

---

**Ultima atualizacao:** 2026-04 | **Versao:** 1.0.0 | **Autor:** The Bearded CTO
