---
description: Auditar Cobertura e Qualidade de Testes Paperclip
argument-hint: [project-path]
---

# Auditar Testes Paperclip

## MISSÃO

Verificar cobertura de testes, testes de contrato de adaptador, formato de testes de integração e higiene de testes.

## Procedimento

### 1. Baseline

- [ ] Vitest configurado na raiz do workspace
- [ ] Limiares de cobertura ≥ 80 (linhas, funções, declarações), ≥ 75 (branches)
- [ ] `pnpm test --coverage` completa e respeita os limiares

### 2. Cobertura por área

Execute cobertura, depois relate por área:
- `server/src/modules/agents/` : meta ≥ 90%
- `server/src/modules/approvals/` : meta ≥ 90%
- `server/src/modules/costs/` : meta ≥ 90%
- `adapters/**` : meta ≥ 85%
- Outros módulos do servidor: ≥ 80%
- `ui/` : ≥ 70%

Liste qualquer arquivo abaixo de sua meta com uma nota de 1 linha sobre o que não está coberto.

### 3. Testes de extensões

Adaptadores built-in (`packages/adapters/*`):
- [ ] Testes unitários cobrem spawn / parse / wiring de env
- [ ] `type`, `label`, `models`, `agentConfigurationDoc` são cobertos por um teste de exportações
- [ ] Testes E2E existem para pelo menos o adaptador padrão

Plugins:
- [ ] Testes usam `createTestHarness` de `@paperclipai/plugin-sdk/testing`
- [ ] Caminho feliz + um caminho de falha por handler

### 4. Testes de integração

- [ ] Pelo menos um teste de integração por módulo do servidor
- [ ] Testes de integração conectam a um PostgreSQL **real** (testcontainers ou DB descartável), não um mock
- [ ] Cada teste possui seus dados (transações + rollback, ou truncate entre testes)
- [ ] Um teste de **isolamento cross-tenant** existe por módulo (prove que um usuário da empresa A não pode ler dados da empresa B)

### 5. E2E

- [ ] Suite Playwright cobre: login de operador, contratar um agente, fluxo de aprovação, dashboard de custos, registro de adaptador
- [ ] E2E roda contra um bundle web construído, não o servidor dev

### 6. Higiene

Grep e falhe em:
- `.only(` em qualquer arquivo de teste em `main`
- `.skip(` em qualquer arquivo de teste em `main` (sem uma issue linkada)
- `setTimeout` em testes sem `vi.useFakeTimers()`
- Fixtures mutáveis compartilhados entre testes
- Arquivos de snapshot (`__snapshots__`) mais antigos que 180 dias sem uma nota

### 7. Regressões de correção de bugs

Escolha os últimos 5 commits `fix:`. Para cada um, verifique se um teste correspondente foi adicionado ou modificado. Relate commits que não o fizeram.

## Saída

Relatório markdown com passa/falha por seção, arquivos não cobertos, adaptadores falhando, e uma pontuação /20 para `/paperclip:check-compliance`.
