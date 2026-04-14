---
description: Auditar Segurança Paperclip
argument-hint: [project-path]
---

# Auditar Segurança Paperclip

## MISSÃO

Revisar isolamento de tenancy, tratamento de segredos, portas de aprovação, aplicação de orçamento, canal de adaptador, cabeçalhos HTTP e cadeia de suprimentos.

## Procedimento

### 1. Isolamento de tenant

- [ ] Nenhum endpoint recebe `companyId` do corpo / query string do cliente — sempre deriva da sessão autenticada
- [ ] Toda query de repositório filtra por `companyId`
- [ ] Existe um teste de integração de isolamento cross-tenant por módulo
- [ ] Log de auditoria captura tentativas cross-tenant rejeitadas

Grep para padrões suspeitos: `req.body.companyId`, `req.query.companyId`, `WHERE company_id = $1` sem verificação de proveniência.

### 2. Segredos

- [ ] Coluna da tabela `secrets` usa criptografia autenticada (AES-256-GCM) com chave mestre de KMS ou env
- [ ] Segredos entregues aos adaptadores no momento da invocação, não no startup
- [ ] Nenhum valor secreto aparece em qualquer mensagem de log (scan regex de amostras de log armazenadas)
- [ ] `.env` não está no git; `.env.example` está
- [ ] Procedimento de rotação de chave de criptografia de segredos documentado (específico por ambiente, nunca reutilizado)

### 3. Portas de aprovação

- [ ] Decisões de aprovação vivem na tabela `approvals`, append-only (verifique com um trigger DB ou migration)
- [ ] Nenhum caminho de código permite que um adaptador execute uma ação com `requires_approval` antes que o plano de controle retorne `approved`
- [ ] Sem auto-aprovação (o agente requisitante não pode ser o aprovador)

### 4. Orçamentos (limites rígidos)

- [ ] Existe um teste que verifica que `BUDGET_EXCEEDED` é retornado quando um agente excede seu orçamento
- [ ] Nenhum caminho de código incrementa consumo além de `budgetTokens` silenciosamente
- [ ] Mudanças de orçamento emitem eventos de atividade

### 5. Sandbox de plugin & fronteiras de adaptador

- [ ] Todo plugin instalado declara apenas as capacidades que realmente precisa (revise o manifesto contra seu código)
- [ ] Chamadas `ctx.http` passam pelo cliente controlado pelo host (sem `fetch` / `axios` bruto contrabandeado)
- [ ] Valores de config de plugin vêm de `ctx.config.get()`; sem leituras de `process.env` em runtime
- [ ] Adaptadores não contêm lógica de governança — apenas spawn + supervisão
- [ ] Endpoints públicos rodam atrás de TLS 1.3 (termine em um proxy reverso se necessário)

### 6. Cabeçalhos HTTP (respostas da UI web)

Verifique cabeçalhos enviados:
- `Content-Security-Policy` (sem `unsafe-inline` para scripts)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Permissions-Policy` presente

### 7. Autenticação

- [ ] Senhas com hash Argon2id (128 MiB RAM, t=3, p=1)
- [ ] Cookies de sessão `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] JWT (se usado) — EdDSA / Ed25519, expiração de 15 minutos, DPoP em endpoints sensíveis

### 8. Cadeia de suprimentos

- [ ] `pnpm audit --audit-level=high` limpo
- [ ] `packageManager` fixado em `package.json`
- [ ] Lista de permissões `pnpm.onlyBuiltDependencies` presente
- [ ] Releases do SDK de adaptador assinadas com Sigstore (verifique com `cosign`)

### 9. Resposta a incidentes

- [ ] Kill switch de toda a empresa testado
- [ ] Revogação de adaptador invalida assinaturas imediatamente
- [ ] Exportação de auditoria por empresa disponível (JSON + manifesto assinado)

## Saída

Relatório markdown com passa/falha por seção, severidade (Blocker / Major / Minor), referências CVE onde relevante, e uma pontuação /20 para `/paperclip:check-compliance`.
