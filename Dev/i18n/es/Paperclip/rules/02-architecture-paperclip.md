# Arquitectura Paperclip — Principios y Organización

> Fuente de verdad: https://docs.paperclip.ing/ y el repo en https://github.com/paperclipai/paperclip.
> Versión observada: v2026.403.0 (MIT, Abril 2026).

## Forma del Monorepo (observada en el repo)

```
paperclip/
├── server/                          # @paperclipai/server — Node.js + TS HTTP API
│   ├── src/
│   │   ├── routes/                  # Rutas HTTP (companies, agents, approvals, ...)
│   │   ├── adapters/                # Registro de adapters del lado del servidor + lookup
│   │   └── ...
│   └── vitest.config.ts
│
├── ui/                              # @paperclipai/ui — Panel React
│
├── cli/                             # paperclipai CLI (commander.js)
│   ├── src/
│   │   ├── commands/                # onboard, doctor, env, configure, ...
│   │   └── commands/client/         # company, agent, approval, activity, plugin, ...
│   └── esbuild.config.mjs
│
├── packages/
│   ├── shared/                      # @paperclipai/shared — tipos + schemas cross-cutting
│   ├── db/                          # @paperclipai/db — schema, migrations
│   ├── mcp-server/                  # @paperclipai/mcp-server
│   ├── adapter-utils/               # @paperclipai/adapter-utils — helpers para autores de adapters
│   ├── adapters/                    # Adapters integrados
│   │   ├── claude-local/            # @paperclipai/adapter-claude-local
│   │   ├── codex-local/
│   │   ├── cursor-local/
│   │   ├── gemini-local/
│   │   ├── opencode-local/
│   │   ├── openclaw-gateway/
│   │   └── pi-local/
│   └── plugins/
│       ├── sdk/                     # @paperclipai/plugin-sdk — SDK público para plugins externos
│       ├── create-paperclip-plugin/ # @paperclipai/create-paperclip-plugin — scaffolder
│       └── examples/                # plugin-hello-world-example, plugin-kitchen-sink-example, ...
│
├── tests/
│   ├── e2e/                         # Playwright
│   └── release-smoke/
│
├── docker/
├── scripts/
└── docs/                            # Sitio Mintlify
```

## Workspaces

El `package.json` raíz / `pnpm-workspace.yaml` define los workspaces. Cada paquete se publica bajo el scope `@paperclipai/*`. `packageManager` está fijado (`pnpm@9.15.x`).

## Capas

1. **Server** — HTTP API + lógica de gobernanza (presupuestos, aprobaciones, log de actividad, tenancy).
2. **UI** — Panel React. Renderiza, interactúa, nunca decide gobernanza.
3. **CLI** — Herramientas de operador (onboard, doctor, gestión de company/agent/approval). Los adapters pueden contribuir subcomandos CLI vía su export `./cli`.
4. **Packages** — Bibliotecas reutilizables: `shared` (tipos), `db` (schema), `adapter-utils`, `mcp-server`, y dos familias de extensión.
5. **Puntos de extensión** — Ver `12-adapter-protocol.md`:
   - **Adapters** (`packages/adapters/*`) — qué runtime de IA alimenta un agente
   - **Plugins** (`@paperclipai/plugin-sdk`, generados por `create-paperclip-plugin`) — características, integraciones, trabajos, slots de UI

## Dominios Centrales (rutas del servidor observadas)

- **Companies** (`/companies/...`) — límite de tenant
- **Agents** (`/agents`, `/companies/:companyId/agents`, `/agent-hires`) — trabajadores registrados
- **Approvals** (`/approvals/...`) — puertas human-in-the-loop
- **Activity** — auditoría append-only
- **Issues / Projects / Goals** — constructos de nivel de producto
- **Plugin** — gestión de plugins vía CLI (`paperclipai plugin ...`)

## Dirección de Dependencias

```
server ─► @paperclipai/shared
server ─► @paperclipai/db
ui     ─► @paperclipai/shared  (solo tipos)
plugins ─► @paperclipai/plugin-sdk ─► @paperclipai/shared
adapters (integrados) ─► @paperclipai/adapter-utils (opcional)
```

- `shared` es tipos puros y schemas. Sin imports de framework, sin clientes HTTP en runtime.
- UI nunca importa directamente de `server/`. Los tipos vienen de `shared`.
- Los plugins dependen solo del SDK (y opcionalmente adapter-utils si les importan los adapters).
- Los adapters (integrados) viven en su paquete; se registran en el registro del servidor al arrancar.

## Reglas Arquitectónicas

| Regla | Por qué |
|---|---|
| La gobernanza (presupuestos, aprobaciones, secrets, tenancy) es solo del servidor | Los adapters/plugins no pueden evadirla |
| Los adapters exponen `type`, `label`, `models`, `agentConfigurationDoc` | Contrato de cable estable para agentes |
| Los plugins usan `definePlugin({ setup(ctx) })` y declaran capacidades | Sandbox mediado por SDK |
| UI consume datos tipados de `shared` vía APIs del servidor | Sin acceso directo a DB |
| El log de actividad es append-only y se emite para cada mutación | Auditabilidad no negociable |
| Los enlaces de workspace se verifican antes de build/typecheck (`preflight:workspace-links`) | Previene deriva entre paquetes |

## Patrones Arquitectónicos

- **Monorepo modular** — un despliegue, límites forzados vía paquetes de workspace.
- **Log de actividad append-only** — cada mutación emite un evento; dashboards y plugins leen de él.
- **Schemas tipados en todas partes** — Zod en límites de config, tipos TS en todo.
- **JSON-RPC 2.0** — protocolo host ↔ plugin worker (ver `12-adapter-protocol.md`).
- **Registro de adapters** — mutable, con `registerServerAdapter` / `unregisterServerAdapter` / `requireServerAdapter`.

## Anti-Patrones

- Lógica de gobernanza en un plugin o adapter.
- UI calculando estado de presupuesto / aprobación en lugar de leer un flag calculado por el servidor.
- Adapter que reescribe una config de agente para saltar validación de plataforma.
- Plugin almacenando estado en un archivo en disco en lugar de `ctx.state`.
- Imports entre workspaces que evaden el export público del paquete.

## Checklist

- [ ] El nuevo paquete vive bajo `server/`, `ui/`, `cli/`, o `packages/*`
- [ ] Publicado bajo el scope `@paperclipai/*` (para nuevos paquetes públicos)
- [ ] `pnpm run preflight:workspace-links` pasa
- [ ] Sin lógica de gobernanza fuera de `server/`
- [ ] Evento de actividad emitido para cada mutación
- [ ] Tipos consumidos de `@paperclipai/shared` al cruzar límites de workspace

---

**Última actualización:** 2026-04 | **Versión:** 2.0.0 | **Autor:** The Bearded CTO
