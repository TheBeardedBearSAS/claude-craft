---
description: Einen Paperclip-Agent-Hire-Payload entwerfen (für die API oder das Dashboard)
argument-hint: [agent-name]
---

# Einen Paperclip-Agent-Hire entwerfen

## Argumente

1. `agent-name` (erforderlich) — kebab-case-Label für den neuen Agent (z.B. `senior-coder`, `qa-bot`)

## MISSION

Einen wohlgeformten Payload für das Einstellen eines Paperclip-Agents produzieren. Paperclip (v2026.529.0) stellt Agents **nicht** aus einer `.yaml`-Datei via CLI ein — Hiring geschieht über das Dashboard oder `POST /companies/:companyId/agents`. Dieser Befehl entwirft den JSON-Payload und führt den Operator durch das Ausfüllen.

## Vorgehen

### 1. Eingaben sammeln (interaktiv)

In Reihenfolge fragen:
- Ziel-`companyId` (muss existieren — siehe `/paperclip:setup-company` oder `paperclipai company list`)
- `adapterType` — einer der registrierten Typen (z.B. `claude_local`, `codex_local`, `gemini_local`, `cursor_local`, `opencode_local`, `pi_local`). Das `agentConfigurationDoc` des gewählten Adapters sagt, welche Sub-Felder akzeptiert werden.
- Agent-Display-Name (`$1`)
- Rolle / Titel (z.B. "Senior TypeScript engineer")
- Zu assoziierendes Goal (optional; abrufen mit `paperclipai company get --id <companyId>`)
- Modell-ID (muss in der `models`-Liste des Adapters sein)
- Budget (Tokens, optional; eine **harte** Grenze setzen, wenn Enforcement gewünscht)
- Adapter-spezifische Konfiguration: `cwd`, `model`, `extraArgs`, `env`, `workspaceStrategy`, `timeoutSec`, `graceSec` und adapter-spezifische Flags (z.B. `dangerouslySkipPermissions` für `claude_local`)

### 2. Den Payload emittieren

```json
{
  "name": "{{AGENT_NAME}}",
  "displayName": "{{DISPLAY_NAME}}",
  "role": "{{ROLE}}",
  "goalId": "{{GOAL_ID_OR_NULL}}",
  "adapterType": "{{ADAPTER_TYPE}}",
  "adapterConfig": {
    "model": "{{MODEL_ID}}",
    "cwd": "{{CWD_OR_NULL}}",
    "timeoutSec": 900,
    "graceSec": 15,
    "extraArgs": [],
    "env": {},
    "workspaceStrategy": {
      "type": "git_worktree",
      "baseRef": "main"
    }
  },
  "budget": {
    "tokens": {{TOKEN_BUDGET_OR_NULL}}
  }
}
```

> **Die reale Form prüfen.** Vor dem POSTen `server/src/routes/agents.ts` (oder die OpenAPI-Spec, die von der Instanz bereitgestellt wird) öffnen, um das exakte Schema zu bestätigen — das Obige spiegelt wider, was bei v2026.529.0 beobachtet wurde, aber Feldnamen können sich entwickeln.

### 3. Einreichen

**A — Dashboard:** Die Felder in **Agents → Hire** einfügen und abschicken.

**B — API:**
```bash
paperclipai agent list                      # Bestätigen, dass die Company erreichbar ist
curl -X POST "http://localhost:3100/companies/<companyId>/agents" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session cookie from the dashboard>" \
  -d @./agent-hire.json
```

(Authentifizierung via Better-Auth-Session. Siehe `docs.paperclip.ing` für das von Ihrem Deployment verwendete Auth-Rezept.)

### 4. Verifizieren

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai activity list       # Nach 'agent.hired' suchen
```

## Checklist nach dem Entwurf

- [ ] `adapterType` matcht einen aktuell registrierten Adapter
- [ ] `model` existiert in der `models`-Liste dieses Adapters
- [ ] Budget als positive Ganzzahl gesetzt, wenn Enforcement gewünscht
- [ ] Adapter-spezifische Config läuft durch den eigenen Validator des Adapters (das Dashboard lehnt ab, falls nicht)
- [ ] Keine Secret-Werte inline — Secret-Refs verwenden, wo der Adapter sie unterstützt

## Ausgabe

Das entworfene JSON plus die exakten curl- + Dashboard-Anweisungen ausgeben. **Nicht** automatisch einreichen.
