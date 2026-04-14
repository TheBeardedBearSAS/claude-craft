# Seguranca — Paperclip

> Paperclip orquestra agentes que gastam tokens, chamam APIs externas, e agem em nome de uma empresa. Falhas de seguranca aqui sao **falhas de governanca**: drenos silenciosos de orcamento, acoes nao autorizadas, secrets vazados. Trate-os adequadamente.
>
> Stack observado: server + CLI + UI, **Better Auth** para autenticacao, PostgreSQL para persistencia.

## Visao Geral do Modelo de Ameacas

| Ativo | Ameacas primarias |
|---|---|
| Company secrets (API keys, credenciais externas) | Exfiltracao atraves de logs, erros, ou vazamentos de plugin |
| Token budgets | Overrun silencioso, bypass da aplicacao de plataforma |
| Approval gates | Bypass (agente executa antes da aprovacao resolver) |
| Activity log | Adulteracao, eventos forjados |
| Tenancy (isolamento por empresa) | Leituras cross-company na mesma instancia |
| Agent runtime isolation | Um processo de agente desonesto escapando seu workspace |
| Plugins | Capacidades over-scoped, exfil atraves de HTTP declarado |

---

## OWASP Top 10 (2025) — Foco Paperclip

| # | Foco |
|---|---|
| 1 — Broken Access Control | Todo endpoint escopado por `companyId` derivado da sessao. Capacidades adapter / plugin forcadas host-side (`CapabilityDeniedError`). |
| 2 — Cryptographic Failures | Secrets criptografados em repouso com criptografia autenticada. TLS 1.3 para qualquer endpoint publico. Senhas — se usadas — via estrategia de hashing Better Auth (classe argon2id). |
| 3 — Injection | Queries parametrizadas apenas. Validacao Zod nos limites (config, RPC, HTTP). Sem construcao raw SQL string. |
| 4 — Insecure Design | Orcamentos forcados em dispatch, nao client-side. Aprovacoes sao gates sincronos. |
| 5 — Security Misconfiguration | Sem credenciais admin default. CSP + HSTS na UI. |
| 6 — Software Supply Chain | Gate `pnpm audit`, `packageManager` fixo (`pnpm@9.15.x`), `pnpm-lock.yaml` commitado, `pnpm.patchedDependencies` documentado. |
| 7 — Mishandling Exceptions | Erros de dominio logados como atividade. Stack traces nunca cruzam limite API em prod. |

---

## Autenticacao — Better Auth

- Autenticacao user-facing e tratada por [Better Auth](https://better-auth.com). Configure um `BETTER_AUTH_SECRET` forte (pelo menos 32 bytes de entropia) por ambiente. **Nunca** reutilize secrets entre ambientes.
- Sessoes: cookies HTTP-only, `Secure`, `SameSite=Strict` em producao. Expiracao idle + absoluta por defaults Better Auth — aperte se necessario.
- Bootstrap CEO: `paperclipai auth-bootstrap-ceo` cria o operador inicial. Revogue apos onboarding.

---

## Secrets

- Secrets vivem em um store dedicado e sao referenciados por **secret reference** (`secretRef`) em configs, nao por valor.
- Plugins / adapters nunca veem valores secret raw — eles chamam `ctx.secrets.resolve(ref)` (plugins) ou dependem de env runtime-injected (adapters para processos de agente).
- Redacao de log: qualquer campo cuja chave corresponda `/key|token|secret|password|authorization|cookie/i` e redactado antes de logar.
- Nunca commite arquivos `.env`. `.env.example` apenas.

---

## Gates de Aprovacao

- Registros de aprovacao sao entidades de dominio first-class (rotas `/approvals`).
- Uma acao de agente que requer aprovacao **deve** esperar por uma decisao de plataforma. O server e o arbitro.
- Decisoes de aprovacao sao eventos append-only; sem update-in-place em uma aprovacao decidida.
- Sem auto-aprovacao (o agente solicitante nunca e o aprovador).
- Plugins podem reagir a eventos de aprovacao via `ctx.events.on("approval.decided", ...)` mas nao podem decidir aprovacoes eles mesmos.

---

## Orcamentos

- Orcamentos sao **limites rigidos** forcados pelo server em dispatch.
- Quando um orcamento e atingido, o server rejeita a proxima acao com um erro de dominio. Adapters veem o erro; eles nao computam a verificacao.
- Todo evento de custo e persistido e visivel no activity log e dashboard.

---

## Tenancy

- Todo recurso e escopado por `companyId`. Endpoints derivam `companyId` da sessao ou path URL (`/companies/:companyId/...`), **nunca** de um corpo cliente confiavel.
- Leituras cross-company sao rejeitadas e logadas.
- Plugins recebem entidades escopadas para a empresa para qual estao autorizados.

---

## Plugins — Capacidades

- Plugins declaram capacidades requeridas no manifesto (`PaperclipPluginCapability`).
- O host forca capacidades. Faltando uma capacidade → `CapabilityDeniedError` em tempo de chamada.
- Solicite apenas as capacidades que voce precisa. Solicitar `network` ou `filesystem` amplamente e uma bandeira vermelha em revisao.

---

## Headers de Seguranca HTTP (UI)

Envie nas respostas UI:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

Ajuste fontes script/style CSP se a UI requer CDNs especificos; caso contrario mantenha `'self'` apenas.

---

## Cadeia de Suprimentos

- `pnpm install --frozen-lockfile` em CI.
- `pnpm audit --audit-level=high` em CI; falhar o build em high / critical.
- `packageManager` fixo em `package.json`.
- `pnpm.patchedDependencies` mantido em sincronia com `patches/` e revisado quando o pacote base muda.
- Considere geracao SBOM (CycloneDX) e assinatura Sigstore de pacotes publicados (`@paperclipai/plugin-sdk`, pacotes adapter).

---

## Logging e Auditoria

- **Logue** (como eventos de atividade estruturados): contratacao de agentes, aprovacoes, mudancas de orcamento, eventos de custo, instalacoes/upgrades de plugin, escritas secret (apenas metadata, nunca valores).
- **Nunca logue**: valores secret, corpos de request completos que contem secrets, tokens de sessao completos.
- Activity log e append-only. Force no layer DB se possivel (triggers, permissoes).

---

## Resposta a Incidentes

- **Kill switch por empresa** — pause todos agentes para essa empresa (surfaced em CLI + UI).
- **Plugin disable** — `paperclipai plugin disable <id>` para um plugin com mau comportamento sem desinstala-lo.
- **Audit export** — exportacao por empresa de atividade + aprovacoes + custos para revisao pos-incidente.

---

## Checklist

- [ ] Todos endpoints escopados por `companyId` de sessao ou path — nunca de corpo cliente
- [ ] `BETTER_AUTH_SECRET` unico por ambiente, ≥ 32 bytes entropia
- [ ] Secrets nunca logados, acessados atraves `ctx.secrets.resolve(ref)` (plugins)
- [ ] Approval gates forcados server-side apenas
- [ ] Orcamentos sao limites rigidos (teste CI forca negacao no limite)
- [ ] Manifesto plugin declara apenas as capacidades que realmente precisa
- [ ] Headers CSP + HSTS + COOP + CORP enviados na UI
- [ ] `pnpm audit` `high` limpo
- [ ] Activity log append-only, forcado DB onde possivel
- [ ] Kill switch + plugin disable testados

---

**Ultima atualizacao:** 2026-04 | **Versao:** 2.0.0 | **Autor:** The Bearded CTO
