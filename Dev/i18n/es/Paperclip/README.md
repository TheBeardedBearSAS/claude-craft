# Paperclip — Integración Claude-Craft

> **Paperclip**: orquestación de código abierto para empresas sin humanos.
> Docs: https://docs.paperclip.ing/ · Repo: https://github.com/paperclipai/paperclip · Licencia: MIT

Este directorio contiene las reglas, comandos, skills y plantillas de Claude-Craft para trabajar con Paperclip — tanto como **contribuidor** a un código base de Paperclip como **operador** usando Paperclip con Claude Code como adapter.

## Stack

| Herramienta | Versión |
|---|---|
| Node.js | 22+ LTS |
| TypeScript | 5.x (strict) |
| pnpm | 9.15+ |
| React | 19+ (web UI) |
| Vitest | 4.1+ |
| PostgreSQL | 15+ (o embebido para dev) |
| Paperclip | 2026.609.0+ |

## Qué hay aquí

```
Paperclip/
├── CLAUDE.md.template
├── README.md                   (este archivo)
├── rules/                      # 7 archivos de reglas (architecture, standards, tooling, testing, quality, security, adapter-protocol)
├── commands/                   # 8 slash commands (check-*, generate-*, setup-company)
├── templates/                  # Scaffolds de Adapter + agent-config
├── checklists/                 # pre-commit, new-feature, new-adapter
├── agents/                     # paperclip-reviewer
└── skills/                     # 6 skills bajo demanda
```

## Comandos

| Comando | Propósito |
|---|---|
| `/paperclip:check-compliance` | Auditoría completa (Arquitectura + Calidad + Tests + Seguridad + Protocolo de Adapter), puntuación /100 |
| `/paperclip:check-architecture` | División de dos capas + límites de módulos + cobertura de log de actividad |
| `/paperclip:check-code-quality` | Estrictez TypeScript, lint, complejidad, higiene de logging |
| `/paperclip:check-testing` | Cobertura, tests de contrato de adapter, aislamiento entre tenants |
| `/paperclip:check-security` | Tenancy, secrets, aprobaciones, presupuestos, canal de adapter firmado |
| `/paperclip:generate-adapter` | Generar scaffold de adapter (local / process / http) |
| `/paperclip:generate-agent-config` | Generar un `agent.yaml` con presupuesto + aprobaciones |
| `/paperclip:setup-company` | Inicializar una nueva empresa Paperclip de extremo a extremo |

## Instalación

### Vía Makefile (desde un checkout de claude-craft)

```bash
make install-paperclip TARGET=/path/to/my/paperclip-project RULES_LANG=en
```

### Vía script

```bash
./Dev/scripts/install-paperclip-rules.sh --lang=en /path/to/my/paperclip-project
```

### Flags

`--install` · `--update` · `--force` · `--preserve-config` · `--dry-run` · `--backup` · `--interactive` · `--lang=<en|fr|es|de|pt>`

## Invariantes de gobernanza (no negociables)

- Los adapters nunca mantienen estado de gobernanza (presupuestos, aprobaciones, permisos son solo del plano de control).
- Los presupuestos son límites estrictos. Las superaciones silenciosas nunca son aceptables.
- Las aprobaciones bloquean la ejecución del adapter hasta que el plano de control devuelve una decisión.
- Cada mutación de DB emite un evento de actividad. El log de actividad es append-only.
- `companyId` siempre deriva de la sesión autenticada.
- Los plugins declaran capacidades mínimas; el host rechaza llamadas fuera de alcance con `CapabilityDeniedError`.
- Los endpoints públicos corren detrás de TLS 1.3; autenticación de operador vía Better Auth con `BETTER_AUTH_SECRET` rotado.

## Enlaces

- Documentación Paperclip: https://docs.paperclip.ing/
- Repositorio Paperclip: https://github.com/paperclipai/paperclip
- Claude-Craft: https://github.com/TheBeardedBearSAS/claude-craft
