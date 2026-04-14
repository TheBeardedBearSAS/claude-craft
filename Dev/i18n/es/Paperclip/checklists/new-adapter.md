# Checklist Nueva Extensión — Paperclip

Una "nueva extensión" es un **adaptador built-in** (runtime de IA bajo `packages/adapters/<name>/`) o un **plugin** (funcionalidad, distribuida vía `@paperclipai/plugin-sdk` y `create-paperclip-plugin`). Elige uno primero.

## 0. Decisión

- [ ] Confirmar: ¿es esto un nuevo runtime de IA (**adaptador**) o una funcionalidad (**plugin**)?
- [ ] Verificar los adaptadores Paperclip existentes (`claude-local`, `codex-local`, `cursor-local`, `gemini-local`, `opencode-local`, `openclaw-gateway`, `pi-local`) — tal vez uno ya encaja
- [ ] Elegir un nombre en kebab-case

---

## Track A — Plugin (más común)

### 1. Scaffold

```bash
npm create paperclip-plugin@latest
```

- [ ] Directorio de output contiene `src/worker.ts`, `src/manifest.ts`, `tests/`
- [ ] `pnpm install` tiene éxito

### 2. Manifiesto

- [ ] `id`, `name`, `version` establecidos; `version` coincide con `package.json`
- [ ] `apiVersion: 1`
- [ ] `capabilities` declaradas **mínimamente** (no solicitar ampliamente `network`, `filesystem`, etc.)
- [ ] `categories` apropiadas
- [ ] `instanceConfigSchema` generada desde un schema Zod con `.describe(...)` claro en cada campo

### 3. Worker

- [ ] `definePlugin({ setup(ctx), onHealth })` export predeterminado
- [ ] `runWorker(plugin, import.meta.url)` presente
- [ ] `setup(ctx)` registra handlers sincrónicamente (sin await a llamadas upstream durante setup)
- [ ] Eventos suscritos vía `ctx.events.on(...)`
- [ ] Jobs registrados vía `ctx.jobs.register(...)`
- [ ] Secretos resueltos vía `ctx.secrets.resolve(ref)` — sin keys raw en código
- [ ] Estado persistido vía `ctx.state` con scope apropiado (company / project / issue)
- [ ] Llamadas HTTP usan `ctx.http.fetch` (respeta capacidades y allowlist)

### 4. Tests

- [ ] `createTestHarness` de `@paperclipai/plugin-sdk/testing`
- [ ] Happy path cubierto
- [ ] Caso de fallo de handler de evento cubierto
- [ ] Health check retorna rápidamente

### 5. Instalar y verificar

```bash
paperclipai plugin install ./<plugin-name>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
paperclipai plugin list
```

- [ ] Plugin aparece saludable en el dashboard
- [ ] Eventos que escucha disparan sus handlers
- [ ] Desinstalación no deja estado residual que no debería mantener

### 6. Docs

- [ ] `README.md` lista: propósito, campos de config, capacidades requeridas, eventos manejados, jobs expuestos, límites conocidos
- [ ] `CHANGELOG.md` comienza en `0.1.0`

---

## Track B — Adaptador built-in (runtime de IA)

Agregar un adaptador built-in significa contribuir a (o forkear) Paperclip.

### 1. Paquete

- [ ] Nueva carpeta `packages/adapters/<name>/`
- [ ] `package.json` nombrado `@paperclipai/adapter-<name>`, en el scope `@paperclipai/*`
- [ ] Exports: `.`, `./server`, `./ui`, `./cli` (solo los que implementes)

### 2. Entrada (`src/index.ts`)

- [ ] Exporta `type` (identificador wire estable, ej. `<name>_local`)
- [ ] Exporta `label` (legible para humanos)
- [ ] Exporta `models` (lista de id + label)
- [ ] Exporta `agentConfigurationDoc` (markdown describiendo todos los campos con precisión)

### 3. Superficie de servidor (`src/server/index.ts`)

- [ ] Código de spawn + supervisar proceso
- [ ] Manejo de timeout + gracia SIGTERM
- [ ] Soporte de estrategia de workspace (`git_worktree` etc.)
- [ ] Variables de entorno de runtime de Paperclip (`PAPERCLIP_WORKSPACE_*`, `PAPERCLIP_RUNTIME_*`) propagadas al hijo
- [ ] **Sin** verificaciones de presupuesto / aprobación / permiso aquí — el servidor es dueño de eso

### 4. Registro

- [ ] Arranque del servidor registra el adaptador vía `registerServerAdapter(adapter)`
- [ ] Helpers de búsqueda de adaptador existentes (`requireServerAdapter`, etc.) funcionan con él

### 5. Superficies UI / CLI (opcionales)

- [ ] `src/ui/index.ts` — piezas React para el formulario de config del adaptador
- [ ] `src/cli/index.ts` — subcomandos bajo `paperclipai` si el adaptador los necesita

### 6. Tests

- [ ] Tests unitarios para lógica de spawn / parse / env
- [ ] Adaptador es ejercitado end-to-end en los tests e2e del repo si es ampliamente relevante

### 7. Docs

- [ ] `agentConfigurationDoc` es completo y correcto
- [ ] `CHANGELOG.md` comienza en `0.1.0`
- [ ] Entrada agregada al sitio de docs de Paperclip bajo "Adapters"
