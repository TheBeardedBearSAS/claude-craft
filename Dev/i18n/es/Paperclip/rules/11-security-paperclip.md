# Seguridad — Paperclip

> Paperclip orquesta agentes que gastan tokens, llaman APIs externas, y actúan en nombre de una empresa. Las fallas de seguridad aquí son **fallas de gobernanza**: fugas silenciosas de presupuesto, acciones no autorizadas, secrets filtrados. Tratarlas en consecuencia.
>
> Stack observado: server + CLI + UI, **Better Auth** para autenticación, PostgreSQL para persistencia.

## Vista General del Modelo de Amenazas

| Activo | Amenazas primarias |
|---|---|
| Secrets de empresa (claves API, credenciales externas) | Exfiltración a través de logs, errores, o fugas de plugin |
| Presupuestos de tokens | Exceso silencioso, evasión de cumplimiento de plataforma |
| Puertas de aprobación | Evasión (agente ejecuta antes de que se resuelva la aprobación) |
| Log de actividad | Manipulación, eventos forjados |
| Tenancy (aislamiento por empresa) | Lecturas entre empresas en la misma instancia |
| Aislamiento de runtime de agente | Un proceso de agente rebelde escapando de su workspace |
| Plugins | Capacidades con alcance excesivo, exfil a través de HTTP declarado |

---

## OWASP Top 10 (2025) — Enfoque Paperclip

| # | Enfoque |
|---|---|
| 1 — Broken Access Control | Cada endpoint con alcance por `companyId` derivado de sesión. Capacidades de adapter / plugin forzadas del lado del host (`CapabilityDeniedError`). |
| 2 — Cryptographic Failures | Secrets cifrados en reposo con cifrado autenticado. TLS 1.3 para cualquier endpoint público. Contraseñas — si se usan — vía estrategia de hashing de Better Auth (clase argon2id). |
| 3 — Injection | Solo consultas parametrizadas. Validación Zod en límites (config, RPC, HTTP). Sin construcción de strings SQL crudos. |
| 4 — Insecure Design | Presupuestos forzados en dispatch, no del lado del cliente. Las aprobaciones son puertas síncronas. |
| 5 — Security Misconfiguration | Sin credenciales de admin por defecto. CSP + HSTS en la UI. |
| 6 — Software Supply Chain | Puerta `pnpm audit`, `packageManager` fijado (`pnpm@9.15.x`), `pnpm-lock.yaml` commiteado, `pnpm.patchedDependencies` documentado. |
| 7 — Mishandling Exceptions | Errores de dominio logueados como actividad. Stack traces nunca cruzan el límite de API en prod. |

---

## Autenticación — Better Auth

- La autenticación de usuario es manejada por [Better Auth](https://better-auth.com). Configurar un `BETTER_AUTH_SECRET` fuerte (al menos 32 bytes de entropía) por entorno. **Nunca** reusar secrets entre entornos.
- Sesiones: cookies HTTP-only, `Secure`, `SameSite=Strict` en producción. Expiración idle + absoluta según defaults de Better Auth — ajustar si es necesario.
- Bootstrap de CEO: `paperclipai auth-bootstrap-ceo` crea el operador inicial. Revocar después del onboarding.

---

## Secrets

- Los secrets viven en un store dedicado y son referenciados por **referencia de secret** (`secretRef`) en configs, no por valor.
- Los plugins / adapters nunca ven valores de secret crudos — llaman a `ctx.secrets.resolve(ref)` (plugins) o dependen de env inyectado en runtime (adapters para procesos de agentes).
- Redacción de logs: cualquier campo cuya clave coincida con `/key|token|secret|password|authorization|cookie/i` es redactado antes de loguear.
- Nunca commitear archivos `.env`. Solo `.env.example`.

---

## Puertas de Aprobación

- Los registros de aprobación son entidades de dominio de primera clase (rutas `/approvals`).
- Una acción de agente que requiere aprobación **debe** esperar una decisión de plataforma. El servidor es el árbitro.
- Las decisiones de aprobación son eventos append-only; sin actualización in-place en una aprobación decidida.
- Sin auto-aprobación (el agente que solicita nunca es el aprobador).
- Los plugins pueden reaccionar a eventos de aprobación vía `ctx.events.on("approval.decided", ...)` pero no pueden decidir aprobaciones ellos mismos.

---

## Presupuestos

- Los presupuestos son **límites estrictos** forzados por el servidor en dispatch.
- Cuando se alcanza un presupuesto, el servidor rechaza la siguiente acción con un error de dominio. Los adapters ven el error; no calculan la verificación.
- Cada evento de costo se persiste y es visible en el log de actividad y el dashboard.

---

## Tenancy

- Cada recurso tiene alcance por `companyId`. Los endpoints derivan `companyId` de la sesión o path URL (`/companies/:companyId/...`), **nunca** de un cuerpo de cliente confiable.
- Las lecturas entre empresas son rechazadas y logueadas.
- Los plugins reciben entidades con alcance a la empresa para la cual están autorizados.

---

## Plugins — Capacidades

- Los plugins declaran capacidades requeridas en el manifiesto (`PaperclipPluginCapability`).
- El host fuerza las capacidades. Capacidad faltante → `CapabilityDeniedError` en tiempo de llamada.
- Solo solicitar las capacidades que necesites. Solicitar `network` o `filesystem` ampliamente es una bandera roja en revisión.

---

## Headers de Seguridad HTTP (UI)

Enviar en respuestas de UI:

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

Ajustar fuentes script/style de CSP si la UI requiere CDNs específicos; de lo contrario mantener solo `'self'`.

---

## Supply Chain

- `pnpm install --frozen-lockfile` en CI.
- `pnpm audit --audit-level=high` en CI; fallar el build en high / critical.
- `packageManager` fijado en `package.json`.
- `pnpm.patchedDependencies` mantenido en sincronía con `patches/` y revisado cuando cambia el paquete base.
- Considerar generación de SBOM (CycloneDX) y firma Sigstore de paquetes publicados (`@paperclipai/plugin-sdk`, paquetes de adapter).

---

## Logging y Auditoría

- **Sí loguear** (como eventos de actividad estructurados): contratación de agentes, aprobaciones, cambios de presupuesto, eventos de costo, instalaciones/upgrades de plugins, escrituras de secrets (solo metadata, nunca valores).
- **Nunca loguear**: valores de secrets, cuerpos de request completos que contienen secrets, tokens de sesión completos.
- El log de actividad es append-only. Forzarlo en la capa de DB si es posible (triggers, permisos).

---

## Respuesta a Incidentes

- **Kill switch por empresa** — pausar todos los agentes para esa empresa (visible en CLI + UI).
- **Deshabilitar plugin** — `paperclipai plugin disable <id>` detiene un plugin con mal comportamiento sin desinstalarlo.
- **Export de auditoría** — export por empresa de actividad + aprobaciones + costos para revisión post-incidente.

---

## Checklist

- [ ] Todos los endpoints con alcance por `companyId` desde sesión o path — nunca desde cuerpo del cliente
- [ ] `BETTER_AUTH_SECRET` único por entorno, ≥ 32 bytes de entropía
- [ ] Secrets nunca logueados, accedidos a través de `ctx.secrets.resolve(ref)` (plugins)
- [ ] Puertas de aprobación forzadas solo del lado del servidor
- [ ] Los presupuestos son límites estrictos (test de CI fuerza denegación en límite)
- [ ] Manifiesto de plugin declara solo las capacidades que realmente necesita
- [ ] Headers CSP + HSTS + COOP + CORP enviados en UI
- [ ] `pnpm audit` `high` limpio
- [ ] Log de actividad append-only, forzado por DB donde sea posible
- [ ] Kill switch + deshabilitar plugin testeado

## Notas de actualización: cambios incompatibles (2026.916.0 a 2026.1012.0)

Verificado con las notas de versión oficiales de GitHub (paperclipai/paperclip).

- **2026.916.0**: las APIs de agente ya no devuelven credenciales en texto plano (los bindings `plain` se redactan: usar `secretRef`, nunca releer secretos); se eliminan los "cheap model profiles" (la migración `0236` borra los `modelProfiles` almacenados); `X-Forwarded-Host` solo se respeta cuando el par inmediato pasa `TRUST_PROXY` (definirlo detrás de un reverse proxy; si no, se usa la cabecera `Host` sin procesar); se elimina la opción de conexión REST legacy de Anthropic (las conexiones de herramientas REST se validan como REST).
- **2026.1001.0**: se retira el broker Composio legacy (sin migración automática; reemplazo: Composio Connect tras el flag `enableMcpAggregators`). Los harnesses de ejecución pasan a **full auto por defecto**: ACPX/Claude `approve-all`, OpenCode `allow`, Codex `never` (sin pausas de aprobación). Para conservar las puertas de aprobación del proveedor, definir explícitamente un modo restrictivo por agente: `acpxPermissionMode` (`approve-paperclip`, `approve-reads` o `deny-all`) u `opencodePermissionMode` (`ask` o `deny`). Las aprobaciones gobernadas de Paperclip siguen aplicándose.
- **2026.1005.0**: `PAPERCLIP_CLOUD_UI_SNIPPET` / `PAPERCLIP_CLOUD_UI_SNIPPET_B64` ya no inyectan HTML (migrar la integración a una contribución de UI de plugin); una @-mención en un comentario de tarea es solo contexto y ya no lanza un run (solo lo hacen la asignación explícita o las solicitudes de revisión).
- **2026.1012.0**: los locks de restauración de workspace son ahora locks de archivo SQLite bajo `<instance root>/locks/directory-merge/`: detener todos los procesos antiguos de servidor y worker antes de actualizar o revertir; los tool grants con selectores desconocidos o restricciones mal formadas ahora deniegan el acceso (revisar los grants personalizados).

---

**Última actualización:** 2026-04 | **Versión:** 2.0.0 | **Autor:** The Bearded CTO
