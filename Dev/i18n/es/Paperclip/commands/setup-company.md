---
description: Bootstrapear una nueva compañía Paperclip (onboarding + primer agente)
argument-hint: [nombre-compañía]
---

# Bootstrapear Nueva Compañía Paperclip

## Argumentos

1. `company-name` (requerido) — nombre corto y descriptivo (ej. "Acme Labs")

## MISIÓN

Guiar a un operador a través del onboarding: instalar, crear la instancia, bootstrapear la cuenta de operador inicial, crear la compañía vía la UI, y ejecutar el primer agente con el adaptador `claude-local`.

> El CLI `paperclipai` real (v2026.529.0) **no** expone un comando `companies create`. La creación de compañía ocurre a través del dashboard o importando un paquete con `paperclipai company import`. No inventar flags que no existen — abrir `paperclipai company --help` y seguir lo que hay ahí.

## Procedimiento

### 1. Precondiciones

- [ ] Node.js 20+ y pnpm 9.15+ instalados
- [ ] PostgreSQL alcanzable **O** aceptar el Postgres embebido para dev local
- [ ] Puerto 3100 disponible (o establecer `PORT`)

### 2. Instalar y onboard

Ruta más rápida:

```bash
npx paperclipai onboard --yes
```

O desde un checkout:

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev
```

El dashboard por defecto es `http://localhost:3100` (o el `PORT` que hayas establecido).

### 3. Verificación diagnóstica

```bash
paperclipai doctor
# o, para intentar auto-reparaciones:
paperclipai doctor --repair --yes
```

Corregir cualquier cosa reportada como fallo duro antes de proceder.

### 4. Bootstrapear el primer operador (CEO)

```bash
paperclipai auth-bootstrap-ceo
```

Esto crea la cuenta de operador inicial usada para ingresar al dashboard. **Revocar o rotar** después de que el onboarding esté completo.

### 5. Crear la compañía

No hay comando CLI para crear una compañía desde cero. Dos rutas soportadas:

**A — Dashboard (recomendado para usuarios nuevos):**
- Ingresar en `http://localhost:3100` con el operador bootstrap
- **Companies → New** → establecer el nombre "$1" y un slug de URL

**B — Importar desde un paquete preparado:**
```bash
paperclipai company import --target new --new-company-name "$1" path/to/company.pcpkg
```

De cualquier manera, anotar el `companyId` devuelto.

### 6. Listar compañías para confirmar

```bash
paperclipai company list
paperclipai company get --id <companyId>
```

### 7. Verificar disponibilidad de adaptador

Paperclip envía con adaptadores built-in (observado v2026.529.0):
`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`.

Se registran a sí mismos en el registro de adaptadores del servidor al arranque. Usar el dashboard (o las rutas `/companies/:companyId/adapters/:type/...`) para confirmar que el que quieres está presente y respondiendo.

### 8. Contratar el primer agente

Paperclip **no** contrata agentes desde un archivo YAML vía CLI (en v2026.529.0). Contratar un agente:

- **Vía el dashboard**: **Agents → Hire** con adaptador `claude_local`, elegir un modelo, establecer un presupuesto, asignar un goal.
- **Vía la API HTTP**: `POST /companies/:companyId/agents` (autenticado). Campos: `adapterType`, config específico del adaptador, metadatos del agente. Ver `server/src/routes/agents.ts` para la forma autoritativa.

Después de contratar, inspeccionarlo:

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
```

### 9. Inbox de aprobaciones

Probar las aprobaciones:

```bash
paperclipai approval list
# cuando una solicitud está pendiente:
paperclipai approval approve --id <approvalId>
# o rechazar / solicitar-revisión / comentar
paperclipai approval reject --id <approvalId> --reason "<razón corta>"
```

### 10. Opcional — instalar un plugin

```bash
paperclipai plugin list
paperclipai plugin examples     # ver ejemplos scaffoldeados
paperclipai plugin install <paquete>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
```

### 11. Actividad y auditoría

```bash
paperclipai activity list
# filtrar por compañía, rango de fecha, etc.
```

### 12. Documentar localmente

Crear un directorio `.paperclip/` local del repo con notas de operador no-secretas:

```
.paperclip/
├── README.md           # quién ingresa, cómo se contrató el primer agente
└── runbook.md          # kill-switch, plugin-disable, procedimientos de exportación
```

Commitear. **Nunca commitear secretos, `.env`, o el `BETTER_AUTH_SECRET`.**

## Checklist post-setup

- [ ] Dashboard alcanzable y operador CEO puede ingresar
- [ ] `paperclipai doctor` completamente verde
- [ ] Compañía visible en `paperclipai company list`
- [ ] Adaptador objetivo (`claude_local` o similar) registrado y respondiendo
- [ ] Primer agente contratado y produciendo actividad
- [ ] Flujo de aprobaciones testeado end-to-end
- [ ] `.paperclip/` commiteado sin secretos

## Output

Reporte: ID de compañía, adaptador(es) disponibles, ID del primer agente, URL del dashboard, y los comandos CLI exactos que funcionaron. Link a https://docs.paperclip.ing/foundation/quickstart para seguimientos.
