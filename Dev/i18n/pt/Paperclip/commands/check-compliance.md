---
description: Verificar Conformidade Completa Paperclip
argument-hint: [project-path]
---

# Verificar Conformidade Completa Paperclip

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto Paperclip a analisar)

## MISSÃO

Realizar uma auditoria completa de conformidade de um projeto Paperclip orquestrando as 4 verificações principais — Arquitetura, Qualidade de Código, Testes, Segurança — mais a verificação de **Protocolo de Adaptador** que é específica do Paperclip. Produzir um relatório consolidado com uma pontuação geral de 100 pontos.

### Passo 1: Preparação da Auditoria

- [ ] Identificar caminho do projeto (`$ARGUMENTS` ou dir atual)
- [ ] Confirmar que é um workspace Paperclip: verificar `server/`, `ui/`, `cli/`, `packages/` (com `adapters/`, `plugins/sdk/`), `pnpm-workspace.yaml`, e entradas `@paperclipai/*`
- [ ] Anotar versão do Paperclip (de `@paperclipai/plugin-sdk` instalado ou versão do CLI `paperclipai`)
- [ ] Listar adaptadores sob `packages/adapters/*` e quaisquer plugins sob `packages/plugins/examples/*` ou repositórios de plugins externos

### Passo 2: Auditoria de Arquitetura (25 pontos)

Invocar `/paperclip:check-architecture`.

Critérios avaliados:
- Separação de duas camadas (plano de controle vs adaptadores) — 6 pts
- Limites de módulos sob `server/src/modules/` — 5 pts
- Sem lógica de governança dentro de adaptadores — 6 pts
- Formato de `shared/types` (tipos puros, sem runtime) — 3 pts
- Log de atividades emitido em toda mutação — 3 pts
- Spec OpenAPI cobre toda rota — 2 pts

### Passo 3: Auditoria de Qualidade de Código (20 pontos)

Invocar `/paperclip:check-code-quality`.

Critérios avaliados:
- TypeScript strict + `noUncheckedIndexedAccess` — 5 pts
- Sem `any`, sem casts silenciosos — 4 pts
- Config flat ESLint + Prettier passa — 3 pts
- Convenções de nomenclatura (arquivos kebab, tipos PascalCase, etc.) — 3 pts
- Complexidade cognitiva < 10 por função — 3 pts
- Logs estruturados, sem vazamento de segredos em logs — 2 pts

### Passo 4: Auditoria de Testes (20 pontos)

Invocar `/paperclip:check-testing`.

Critérios avaliados:
- Cobertura ≥ 80% (linhas, funções, declarações) — 6 pts
- Testes de contrato de adaptador passam para todo adaptador enviado — 6 pts
- Testes de integração atingem um PostgreSQL real — 4 pts
- Sem `.only` / `.skip` em main — 2 pts
- Factories usadas sobre fixtures — 2 pts

### Passo 5: Auditoria de Segurança (20 pontos)

Invocar `/paperclip:check-security`.

Critérios avaliados:
- Todos os endpoints com escopo de tenant por `companyId` da sessão — 4 pts
- Segredos criptografados em repouso, redigidos em logs — 4 pts
- Portas de aprovação apenas no servidor, eventos append-only — 3 pts
- Orçamentos = limites rígidos (forçados em testes) — 3 pts
- Capacidades de plugin declaradas minimamente (sem `network` / `filesystem` com escopo excessivo) — 3 pts
- Cabeçalhos CSP + HSTS + COOP + CORP enviados — 2 pts
- `pnpm audit --audit-level=high` limpo — 1 pt

### Passo 6: Auditoria de Extensões (15 pontos)

Específico do Paperclip. Abrange tanto adaptadores built-in (`packages/adapters/*`) quanto plugins (`@paperclipai/plugin-sdk`).

Adaptadores built-in:
- Cada adaptador exporta `type`, `label`, `models`, `agentConfigurationDoc` — 3 pts
- `type` é estável entre versões (sem renomeação após agentes enviados) — 2 pts
- Registro no servidor via `registerServerAdapter(...)` — 2 pts
- Sem lógica de governança dentro do adaptador (sem matemática de budget / approval / permission) — 3 pts

Plugins:
- Manifesto declara capacidades mínimas necessárias — 2 pts
- Usa `ctx.secrets.resolve(ref)` em vez de chaves brutas — 2 pts
- Estado persistido via `ctx.state` (com escopo), não disco — 1 pt

### Passo 7: Relatório Consolidado

Produzir:

```
════════════════════════════════════════════════════════════════
📊 AUDITORIA DE CONFORMIDADE PAPERCLIP — {PROJECT}
════════════════════════════════════════════════════════════════

Arquitetura         : {NN}/25
Qualidade de Código : {NN}/20
Testes              : {NN}/20
Segurança           : {NN}/20
Protocolo Adaptador : {NN}/15
────────────────────────────────────────────────────────────────
TOTAL               : {NNN}/100   →   {Nota}

Escala de notas: A (≥ 90), B (≥ 80), C (≥ 70), D (≥ 60), F (< 60)
```

Para cada critério falhado, liste o arquivo / símbolo e uma correção de 1 linha. Não reescreva o código — exponha os problemas. Termine com as **5 principais prioridades de remediação** (maior impacto / menor esforço primeiro).

## Entregável

Um único relatório markdown. Sem falhas silenciosas. Se um passo não puder rodar (ex.: sem adaptadores no projeto), registre "N/A" e redistribua pontos proporcionalmente — note isto explicitamente no topo do relatório.
