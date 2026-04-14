---
description: Auditar Qualidade de Código Paperclip
argument-hint: [project-path]
---

# Auditar Qualidade de Código Paperclip

## MISSÃO

Medir rigor TypeScript, conformidade de lint, nomenclatura, complexidade e higiene de logging em um projeto Paperclip.

## Procedimento

### 1. Baseline TypeScript

- [ ] `tsconfig.base.json` tem `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- [ ] `pnpm typecheck` sucede (sem erros `tsc` entre workspaces)
- [ ] Nenhum tsconfig por pacote afrouxa a baseline

### 2. Padrões proibidos

Grep e relate:
- Anotações `: any`
- Casts `as any` / `as unknown as`
- `// @ts-ignore`, `// @ts-expect-error` sem uma issue GitHub linkada no mesmo comentário de linha
- Asserções non-null `!.` em valores retornados do DB

### 3. Lint & formatação

- [ ] `pnpm lint` sai com 0, zero avisos
- [ ] `pnpm format --check` relata nenhum diff
- [ ] Config ESLint usa `strict-type-checked`
- [ ] As regras ESLint não-negociáveis de `rules/08-quality-tools.md` estão habilitadas

### 4. Nomenclatura

Amostre 20 arquivos. Verifique:
- Arquivos são kebab-case (`agent-service.ts`, não `AgentService.ts` ou `agent_service.ts`)
- Tipos são PascalCase
- Funções / vars são camelCase
- Constantes são UPPER_SNAKE
- Vars de ambiente lidas via um módulo de config parseado, prefixadas `PAPERCLIP_`

### 5. Complexidade cognitiva

Execute `eslint-plugin-sonarjs` (ou equivalente). Marque qualquer função com complexidade cognitiva ≥ 10. Marque qualquer arquivo > 300 linhas.

### 6. Higiene de logging

- [ ] Logs usam um logger estruturado (pino ou equivalente), nunca `console.log` em código de runtime
- [ ] Nenhum campo cujo nome corresponda a `/key|token|secret|password|authorization/i` é logado como valor
- [ ] Sem logging de corpo de requisição completo

### 7. Correção de async

- [ ] `@typescript-eslint/no-floating-promises` = error, passa
- [ ] Sem cadeias `.then()` (grep `.then(`)
- [ ] Todos os timeouts usam `AbortController`

### 8. Modelagem de erros

- [ ] Serviços de servidor lançam subclasses `DomainError`, não `Error` simples
- [ ] Todo erro de domínio tem um campo `code` estável
- [ ] Sem `throw` de strings ou literais

## Saída

Relatório markdown com passa/falha por seção, arquivos/símbolos ofensores, severidade, e uma pontuação /20 para `/paperclip:check-compliance`.
