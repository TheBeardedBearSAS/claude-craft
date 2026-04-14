# Checklist Nova Extensao — Paperclip

Uma "nova extensao" e ou um **adapter built-in** (runtime AI sob `packages/adapters/<name>/`) ou um **plugin** (feature, distribuido via `@paperclipai/plugin-sdk` e `create-paperclip-plugin`). Escolha um primeiro.

## 0. Decisao

- [ ] Confirme: isso e um novo runtime AI (**adapter**) ou uma feature (**plugin**)?
- [ ] Verifique os adapters Paperclip existentes (`claude-local`, `codex-local`, `cursor-local`, `gemini-local`, `opencode-local`, `openclaw-gateway`, `pi-local`) — talvez um ja se encaixe
- [ ] Escolha um nome kebab-case

---

## Trilha A — Plugin (mais comum)

### 1. Scaffold

```bash
npm create paperclip-plugin@latest
```

- [ ] Diretorio output contem `src/worker.ts`, `src/manifest.ts`, `tests/`
- [ ] `pnpm install` sucesso

### 2. Manifesto

- [ ] `id`, `name`, `version` definidos; `version` corresponde `package.json`
- [ ] `apiVersion: 1`
- [ ] `capabilities` declaradas **minimamente** (nao solicite amplamente `network`, `filesystem`, etc.)
- [ ] `categories` apropriadas
- [ ] `instanceConfigSchema` gerado de um schema Zod com `.describe(...)` claro em cada campo

### 3. Worker

- [ ] `definePlugin({ setup(ctx), onHealth })` export default
- [ ] `runWorker(plugin, import.meta.url)` presente
- [ ] `setup(ctx)` registra handlers sincronamente (sem await chamadas upstream durante setup)
- [ ] Eventos inscritos via `ctx.events.on(...)`
- [ ] Jobs registrados via `ctx.jobs.register(...)`
- [ ] Secrets resolvidos via `ctx.secrets.resolve(ref)` — sem chaves raw em codigo
- [ ] State persistido via `ctx.state` com escopo proprio (company / project / issue)
- [ ] Chamadas HTTP usam `ctx.http.fetch` (respeita capacidades e allowlist)

### 4. Testes

- [ ] `createTestHarness` de `@paperclipai/plugin-sdk/testing`
- [ ] Happy path coberto
- [ ] Caso falha handler evento coberto
- [ ] Health check retorna rapidamente

### 5. Instalar e verificar

```bash
paperclipai plugin install ./<plugin-name>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
paperclipai plugin list
```

- [ ] Plugin aparece saudavel no dashboard
- [ ] Eventos que ele escuta disparam seus handlers
- [ ] Uninstall nao deixa estado residual que nao deveria manter

### 6. Documentacao

- [ ] `README.md` lista: proposito, campos config, capacidades requeridas, eventos tratados, jobs expostos, limites conhecidos
- [ ] `CHANGELOG.md` comeca em `0.1.0`

---

## Trilha B — Adapter integrado (runtime AI)

Adicionar um adapter built-in significa contribuir para (ou fazer fork) Paperclip.

### 1. Pacote

- [ ] Nova pasta `packages/adapters/<name>/`
- [ ] `package.json` nomeado `@paperclipai/adapter-<name>`, no escopo `@paperclipai/*`
- [ ] Exports: `.`, `./server`, `./ui`, `./cli` (apenas os que voce implementa)

### 2. Entrada (`src/index.ts`)

- [ ] Exporta `type` (identificador wire estavel, ex. `<name>_local`)
- [ ] Exporta `label` (legivel humano)
- [ ] Exporta `models` (lista id + label)
- [ ] Exporta `agentConfigurationDoc` (markdown descrevendo todos campos precisamente)

### 3. Superficie server (`src/server/index.ts`)

- [ ] Codigo spawn + supervisao processo
- [ ] Tratamento timeout + graca SIGTERM
- [ ] Suporte estrategia workspace (`git_worktree` etc.)
- [ ] Env vars runtime Paperclip (`PAPERCLIP_WORKSPACE_*`, `PAPERCLIP_RUNTIME_*`) propagadas para o filho
- [ ] **Sem** verificacoes budget / aprovacao / permissao aqui — server possui isso

### 4. Registro

- [ ] Boot server registra o adapter via `registerServerAdapter(adapter)`
- [ ] Helpers lookup adapter existentes (`requireServerAdapter`, etc.) funcionam com ele

### 5. Superficies UI / CLI (opcional)

- [ ] `src/ui/index.ts` — pecas React para o formulario config adapter
- [ ] `src/cli/index.ts` — subcomandos sob `paperclipai` se o adapter precisa deles

### 6. Testes

- [ ] Testes unitarios para logica spawn / parse / env
- [ ] Adapter e exercitado end-to-end nos testes e2e do repo se relevante amplamente

### 7. Documentacao

- [ ] `agentConfigurationDoc` e completo e correto
- [ ] `CHANGELOG.md` comeca em `0.1.0`
- [ ] Entrada adicionada ao site docs Paperclip sob "Adapters"
