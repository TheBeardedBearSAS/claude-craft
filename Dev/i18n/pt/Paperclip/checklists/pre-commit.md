# Checklist Pre-Commit — Paperclip

## Validacao Rapida Antes de Cada Commit

### Qualidade de Codigo

- [ ] `pnpm format --check` passa
- [ ] `pnpm lint` passa (0 erros, 0 warnings)
- [ ] `pnpm typecheck` passa nos workspaces
- [ ] Sem `any`, sem `as any`, sem `// @ts-ignore`
- [ ] Sem `console.log` / `debugger` em codigo runtime
- [ ] Sem exports nao usados (execute `pnpm knip` localmente)

### Testes

- [ ] `pnpm test --changed` passa
- [ ] Nova feature → novo(s) teste(s) adicionado(s)
- [ ] Correcao bug → teste regressao adicionado
- [ ] Mudanca adapter → `contract.test.ts` ainda verde

### Governanca e Seguranca

- [ ] Sem decisao governanca adicionada a qualquer adapter (`adapters/**`)
- [ ] Toda nova mutacao DB emite um evento atividade
- [ ] Sem `companyId` vindo de corpo/query cliente
- [ ] Sem valor secret hard-coded
- [ ] Logs nao expoem secrets, tokens, ou corpos completos

### Build

- [ ] `pnpm build` sucesso
- [ ] Sem novos warnings deprecacao

### Documentacao

- [ ] Spec OpenAPI atualizada para rotas novas/mudadas
- [ ] README adapter atualizado se acoes suportadas mudaram
- [ ] Entrada CHANGELOG sob `## Unreleased`

### Git

- [ ] Mensagem commit segue Conventional Commits (`feat(adapters): …`, `fix(approvals): …`)
- [ ] Branch rebaseado em `main`
- [ ] Sem residuos `TODO: remove` ou declaracoes debug `console.log`
- [ ] `.env` nao esta staged

## Validacao Automatizada

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

## Comandos Rapidos

```bash
pnpm lint
pnpm lint --fix
pnpm typecheck
pnpm test --changed
pnpm format
pnpm audit --audit-level=high
```

## Problemas Comuns

### "Test requires a real DB" em CI
Use testcontainers ou suba Postgres no workflow — nunca mock o DB em testes integracao.

### "Adapter contract test fails"
Nao abaixe as expectativas da suite. Corrija o adapter. A suite E o contrato.

### "Activity log entry missing"
Adicione `this.activity.emit({ event: '<domain>.<action>', ... })` no service apos a mutacao bem-sucedida.

## Antes de Fazer Push

- [ ] Todos commits seguem Conventional Commits
- [ ] Branch rebaseado em `main`
- [ ] CI vai estar verde (lint + typecheck + test + build)
- [ ] Testes contrato adapter passam localmente para qualquer adapter tocado

## Notas

- Mantenha commits pequenos e focados
- Nunca pule hooks (`--no-verify`) — se um hook falha, corrija a causa
- Bugs governanca sao incidentes producao, nao warnings — trate com urgencia
