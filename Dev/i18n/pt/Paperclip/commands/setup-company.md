---
description: Bootstrap uma nova empresa Paperclip (onboarding + primeiro agente)
argument-hint: [company-name]
---

# Fazer Bootstrap de uma Nova Empresa Paperclip

## Argumentos

1. `company-name` (obrigatorio) — nome curto, descritivo (ex. "Acme Labs")

## MISSAO

Guiar um operador atraves do onboarding: instalar, criar a instancia, bootstrap da conta operador inicial, criar a empresa via UI, e executar o primeiro agente com o adapter `claude-local`.

> A CLI `paperclipai` real (v2026.529.0) **nao** expoe um comando `companies create`. Criacao de empresa acontece ou atraves do dashboard ou importando um pacote com `paperclipai company import`. Nao invente flags que nao existem — abra `paperclipai company --help` e siga o que esta la.

## Procedimento

### 1. Precondicoes

- [ ] Node.js 20+ e pnpm 9.15+ instalados
- [ ] PostgreSQL acessivel **OU** aceite o Postgres embedado para dev local
- [ ] Porta 3100 disponivel (ou defina `PORT`)

### 2. Instalar e fazer onboard

Caminho mais rapido:

```bash
npx paperclipai onboard --yes
```

Ou de um checkout:

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev
```

O dashboard padrao e `http://localhost:3100` (ou qualquer `PORT` que voce definir).

### 3. Verificacao diagnostica

```bash
paperclipai doctor
# ou, para tentar reparos automaticos:
paperclipai doctor --repair --yes
```

Corrija qualquer coisa reportada como falha rigorosa antes de prosseguir.

### 4. Fazer bootstrap do primeiro operador (CEO)

Dois caminhos estao disponiveis dependendo do contexto de implantacao:

**A — Reivindicacao via navegador (instancia privada / auto-hospedada nao reivindicada):** Se a instancia ainda nao foi reivindicada, navegue para `http://localhost:3100` em um navegador. Uma tela de primeira execucao deve aparecer, permitindo configurar a conta de administrador inicial diretamente. Use este caminho quando a instancia foi recentemente implantada e nao tem operador existente.

**B — Bootstrap CLI:** Execute o comando CLI para criar a conta operador inicial de forma programatica:

```bash
paperclipai auth-bootstrap-ceo
```

> **Qual caminho se aplica?** Se o dashboard redireciona para uma pagina de reivindicacao/configuracao no primeiro carregamento, use o caminho A. Se mostrar um formulario de login, use o caminho B (ou a instancia ja tem um operador). Consulte `docs.paperclip.ing` para o comportamento exato da sua versao.

Isso cria a conta operador inicial usada para entrar no dashboard. **Revogue ou rotacione** apos onboarding estar completo.

### 5. Criar a empresa

Nao ha comando CLI para criar uma empresa do zero. Dois caminhos suportados:

**A — Dashboard (recomendado para usuarios primeira vez):**
- Entre em `http://localhost:3100` com o operador bootstrap
- **Companies → New** → defina o nome "$1" e um slug URL

**B — Importar de um pacote preparado:**
```bash
paperclipai company import --target new --new-company-name "$1" path/to/company.pcpkg
```

De qualquer forma, anote o `companyId` retornado.

### 6. Listar empresas para confirmar

```bash
paperclipai company list
paperclipai company get --id <companyId>
```

### 7. Verificar disponibilidade de adapter

Paperclip envia com adapters built-in (observado v2026.529.0):
`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`.

Eles se registram no registro adapter server em boot. Use o dashboard (ou as rotas `/companies/:companyId/adapters/:type/...`) para confirmar que o que voce quer esta presente e respondendo.

### 8. Contratar o primeiro agente

Paperclip **nao** contrata agentes de um arquivo YAML via CLI (em v2026.529.0). Contrate um agente:

- **Via dashboard**: **Agents → Hire** com adapter `claude_local`, escolha um modelo, defina um orcamento, atribua um goal.
- **Via HTTP API**: `POST /companies/:companyId/agents` (autenticado). Campos: `adapterType`, config especifico adapter, metadata agente. Veja `server/src/routes/agents.ts` para o shape autoritativo.

Apos contratar, inspecione-o:

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
```

### 9. Inbox de aprovacoes

Teste as aprovacoes:

```bash
paperclipai approval list
# quando uma solicitacao esta pendente:
paperclipai approval approve --id <approvalId>
# ou reject / request-revision / comment
paperclipai approval reject --id <approvalId> --reason "<razao curta>"
```

### 10. Opcional — instalar um plugin

```bash
paperclipai plugin list
paperclipai plugin examples     # veja exemplos scaffolded
paperclipai plugin install <package>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
```

### 11. Atividade e auditoria

```bash
paperclipai activity list
# filtrar por empresa, intervalo datas, etc.
```

### 12. Documentar localmente

Crie um diretorio `.paperclip/` local ao repo com notas operador nao-secret:

```
.paperclip/
├── README.md           # quem entra, como o primeiro agente foi contratado
└── runbook.md          # kill-switch, plugin-disable, procedimentos export
```

Commite. **Nunca commite secrets, `.env`, ou o `BETTER_AUTH_SECRET`.**

## Checklist pos-setup

- [ ] Dashboard acessivel e operador CEO pode entrar
- [ ] `paperclipai doctor` totalmente verde
- [ ] Empresa visivel em `paperclipai company list`
- [ ] Adapter alvo (`claude_local` ou similar) registrado e respondendo
- [ ] Primeiro agente contratado e produzindo atividade
- [ ] Fluxo aprovacoes testado end-to-end
- [ ] `.paperclip/` commitado sem secrets

## Output

Reporte: ID empresa, adapter(s) disponiveis, ID primeiro agente, URL dashboard, e os comandos CLI exatos que funcionaram. Link para https://docs.paperclip.ing/foundation/quickstart para follow-ups.
