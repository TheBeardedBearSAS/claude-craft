# Estándares de Código — Paperclip (TypeScript)

## Lenguaje y Versiones

| Ítem | Estándar |
|---|---|
| Node.js | 20+ (LTS) |
| TypeScript | 5.x |
| Gestor de paquetes | pnpm 9.15+ (monorepo workspace) |
| Sistema de módulos | Solo ESM (`"type": "module"`) |

---

## TypeScript

El modo estricto es **obligatorio**. `tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

**Prohibido:** `any`, casts `as unknown as X` sin un comentario explicando por qué, `// @ts-ignore`, `// @ts-expect-error` sin un issue enlazado.

**Requerido:** tipos de retorno explícitos en funciones exportadas, `readonly` en props / tipos de dominio, uniones discriminadas para tipos variantes.

---

## Nomenclatura

| Tipo | Convención | Ejemplo |
|---|---|---|
| Archivos | kebab-case | `agent-registry.ts`, `approval-service.ts` |
| Directorios | kebab-case | `src/modules/approvals/` |
| Tipos / Interfaces | PascalCase | `AgentConfig`, `HeartbeatPayload` |
| Componentes React | PascalCase (archivo + símbolo) | `OrgChart.tsx` exporta `OrgChart` |
| Funciones / variables | camelCase | `reportCost`, `isApproved` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_BUDGET_TOKENS`, `HEARTBEAT_INTERVAL_MS` |
| Vars de entorno | UPPER_SNAKE_CASE, prefijadas | `PAPERCLIP_DATABASE_URL`, `PAPERCLIP_SECRET_KEY` |
| Tablas DB | snake_case plural | `activity_log`, `agent_registrations` |
| Eventos de dominio | `PastTense` | `AgentHired`, `BudgetExceeded` |

**Sin prefijos/sufijos:** no escribir `IAgent` o `AgentType` — escribir `Agent`. Usar `Props`, `State`, `Result` como sufijos explícitos solo cuando clarifiquen (`LoginFormProps`, `AgentsQueryResult`).

---

## Archivos

- Se prefiere un export público por archivo. Un módulo puede exportar múltiples símbolos cuando forman una unidad cohesiva (ej. `agent-service.ts` exporta `AgentService` + sus DTOs).
- Longitud de archivo objetivo: **< 300 líneas**. Más allá de eso, dividir por responsabilidad.
- Orden dentro de un archivo:
  1. Imports (externos → internos → relativos)
  2. Tipos / interfaces
  3. Constantes
  4. Exports públicos
  5. Helpers privados

---

## Imports

- Imports absolutos dentro de un paquete usando alias de path de TS (`@/modules/...`).
- Imports relativos solo para archivos hermanos dentro de la misma carpeta.
- Sin archivos barrel (`index.ts`) excepto en límites de paquete — rompen el tree-shaking y la detección de dependencias circulares.
- Solo imports nombrados; sin exports por defecto excepto para componentes React requeridos por frameworks.

---

## Manejo de Errores

Dos estilos aceptados — elegir uno por módulo y mantener consistencia:

1. **`DomainError` lanzado** — preferido para servicios de servidor.
   ```ts
   export class BudgetExceededError extends DomainError {
     readonly code = 'BUDGET_EXCEEDED';
     constructor(public readonly agentId: string, public readonly limit: number) {
       super(`Agent ${agentId} exceeded budget (${limit} tokens)`);
     }
   }
   ```

2. **Tipo `Result<T, E>`** — preferido para código de adapter y rutas de borde donde lanzar cruza límites de proceso.

**Nunca:**
- Tragar errores con bloques `catch {}` vacíos.
- Lanzar strings u objetos planos.
- Re-envolver un error y perder el `cause` original (siempre pasar `{ cause: err }`).

---

## React (web UI)

- Solo componentes funcionales. Sin componentes de clase.
- Props tipados vía `readonly`, sin `React.FC`.
- Hooks nombrados `useX`, una responsabilidad cada uno.
- Derivar estado; no reflejarlo. Sin useState que duplique props o datos del servidor.
- Estado del servidor vive en React Query (o equivalente). Estado del cliente en un store mínimo (Zustand o contexto React).
- **UI es tonta**: sin decisiones de gobernanza en el navegador. Las verificaciones de aprobación, presupuesto y permisos van y vuelven al servidor.

---

## Async

- Solo `async`/`await`. Sin cadenas `.then()` crudas.
- Todos los límites async que pueden fallar devuelven errores tipados o lanzan `DomainError`.
- Sin promesas no manejadas — siempre `await`, `.catch`, o `void` (con comentario si es intencional).
- Timeouts son explícitos (`AbortController`); sin esperas indefinidas.

---

## Logging

- Logs JSON estructurados (pino o equivalente).
- Loguear **eventos**, no strings: `log.info({ agentId, event: 'agent.hired' })`.
- Nunca loguear secrets, claves API crudas, o cuerpos de request completos conteniendo PII.
- Cada mutación loguea un evento `activity_log` (nivel de dominio); los logs a nivel de OS son solo para diagnóstico.

---

## Configuración

- Toda config vía vars de entorno, cargadas a través de un parser tipado (zod) al arrancar.
- Sin lecturas de config en tiempo de request — inyectar la config resuelta.
- Paperclip inyecta `PAPERCLIP_WORKSPACE_*` y `PAPERCLIP_RUNTIME_*` en procesos de agentes generados para herramientas del lado del agente; mantener ese prefijo para cualquier var orientada a agentes que agregues.

### Vars de entorno canónicas (observadas en `.env.example`)

| Nombre | Propósito |
|---|---|
| `DATABASE_URL` | String de conexión PostgreSQL. Omitir → Postgres embebido (solo dev). |
| `PORT` | Puerto HTTP para el servidor (default `3100`). |
| `SERVE_UI` | `true` para que el servidor también sirva el bundle UI construido. |
| `BETTER_AUTH_SECRET` | Secret para [Better Auth](https://better-auth.com). **Debe rotarse por entorno.** |

La config de plugin / adapter vive **dentro** del paquete del plugin o adapter, no en env de nivel superior. Referenciar tus propias vars de entorno desde el `configSchema` (zod) de tu plugin en lugar de leer `process.env` en runtime.

---

## Linting y Formateo

- Config flat de ESLint (`eslint.config.js`) con `@typescript-eslint/strict-type-checked`.
- Prettier para formateo (sin `semi: false` — mantener punto y coma).
- Forzado en CI + hook pre-commit.

---

## Checklist

- [ ] `strict: true` + `noUncheckedIndexedAccess` activos
- [ ] Sin `any`, sin casts silenciosos
- [ ] Tipos de retorno explícitos en funciones exportadas
- [ ] Archivos kebab-case, tipos PascalCase, vars camelCase
- [ ] Una responsabilidad por archivo, < 300 líneas
- [ ] Logs estructurados, sin secrets en logs
- [ ] Todo async con await o explícitamente `void`
- [ ] ESLint + Prettier pasan

---

**Última actualización:** 2026-04 | **Versión:** 1.0.0 | **Autor:** The Bearded CTO
