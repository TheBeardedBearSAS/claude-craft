# Architecture Live Coding — Claude Craft

## Vue d'ensemble

Claude Craft Phase 4 (P4-40) introduit le **live coding / pair programming interactif** : un développeur code avec Claude, et des spectateurs (ou co-pilots) peuvent suivre en temps réel via un viewer web. Cas d'usage : formation, démo, debugging collaboratif, audit en direct.

---

## Table des matières

1. [Vision](#vision)
2. [Protocole WebSocket](#protocole-websocket)
3. [Events streamés](#events-streamés)
4. [Diff streaming](#diff-streaming)
5. [Sécurité](#sécurité)
6. [Persistence](#persistence)
7. [Viewer UI](#viewer-ui)
8. [Monétisation](#monétisation)
9. [Architecture technique](#architecture-technique)
10. [Diagramme séquence](#diagramme-séquence)

---

## Vision

### Cas d'usage

| Cas | Description |
|-----|-------------|
| **Formation** | Formateur code avec Claude, étudiants suivent en temps réel |
| **Démo produit** | Démo Claude Craft en live (conférences, webinars) |
| **Debugging collaboratif** | Dev partage session, collègue suit et suggère |
| **Audit en direct** | Auditeur observe exécution `/team:audit` en temps réel |
| **Pair programming** | Deux devs, un pilote (Claude + humain), un co-pilot (spectateur) |

### Experience utilisateur

```bash
# Dev A démarre une session live
claude-code --live

# Output :
# Live session started: https://live.claude-craft.dev/s/01J7XKQZ8M9N2P3Q4R5S6T
# Share this URL with viewers (read-only) or collaborators (read-write).
# Session expires after 30 minutes of inactivity.
```

**Viewer (browser) :**

```
┌─────────────────────────────────────────────────────────────────┐
│ Claude Craft Live — Session 01J7XKQZ8M9N2P3Q4R5S6T              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Timeline] ──●──────●────────●──────────●─────────────> Now   │
│             14:02  14:05    14:08      14:12                   │
│                                                                 │
│  [14:12:34] User: /team:audit --sequential                     │
│  [14:12:35] Agent: Analyzing project structure...              │
│  [14:12:37] Tool: Read (src/controllers/OrderController.php)   │
│  [14:12:38] Tool Result: 245 lines, 3 classes                  │
│  [14:12:40] Agent: Found 1 critical issue                      │
│                                                                 │
│  [Diff Panel]                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ src/controllers/OrderController.php                     │   │
│  │ - Line 42: if ($status == "confirmed")                  │   │
│  │ + Line 42: if ($status === "confirmed")  // Strict      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Filters: All | Commands | Tools | Diffs | Agent]             │
│  [Speed: 1x | 2x | 4x] [Replay from start]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Protocole WebSocket

### Architecture

```
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│   Claude CLI     │  WS ↔    │  Relay Server    │  WS ↔    │  Viewer(s)       │
│  (localhost)     │          │  (Hono + ws)     │          │  (browser)       │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

### Relay Server

**Stack :** Hono (Edge runtime, Cloudflare Workers ou Node.js) + `ws` (WebSocket)

**URL :** `wss://live.claude-craft.dev`

### Authentification

| Mode | Token | Durée | Permissions |
|------|-------|-------|-------------|
| **Spectateur** | Session token (JWT 4h) | 4h | Read-only events |
| **Co-pilot** | Collaboration token (JWT 4h) | 4h | Read-write (peut envoyer suggestions) |
| **Pilote** | CLI auth token (API key) | Session | Full control |

**JWT Claims :**

```json
{
  "sub": "user_01J7XKQZ8M9N2P3Q4R5S6T",
  "session_id": "01J7XKQZ8M9N2P3Q4R5S6T",
  "role": "viewer", // "viewer" | "co-pilot" | "pilot"
  "exp": 1713196800, // 4h
  "iat": 1713182400
}
```

### Session ID

Format : **ULID** (Universally Unique Lexicographically Sortable Identifier)

Exemple : `01J7XKQZ8M9N2P3Q4R5S6T`

**URL session :** `https://live.claude-craft.dev/s/01J7XKQZ8M9N2P3Q4R5S6T`

---

## Events streamés

### Format

Tous les events suivent le format JSON :

```json
{
  "type": "event_type",
  "timestamp": 1713182400000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": { ... }
}
```

### Types d'events

#### 1. `session.start`

```json
{
  "type": "session.start",
  "timestamp": 1713182400000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "user": "flavien.metivier@gmail.com",
    "stack": "symfony",
    "repository": "https://github.com/acme/api",
    "claudeModel": "claude-opus-4.6"
  }
}
```

#### 2. `command.issued`

```json
{
  "type": "command.issued",
  "timestamp": 1713182405000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "command": "/team:audit --sequential"
  }
}
```

#### 3. `agent.thinking` (optionnel)

Nécessite Claude extended thinking (disponible si modèle supporte).

```json
{
  "type": "agent.thinking",
  "timestamp": 1713182406000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "thoughts": "I need to analyze the project structure first to identify audit scope..."
  }
}
```

#### 4. `tool.use`

```json
{
  "type": "tool.use",
  "timestamp": 1713182407000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "tool": "Read",
    "input": {
      "file_path": "/home/user/project/src/controllers/OrderController.php",
      "summary": "Reading OrderController.php" // Résumé pour UI
    }
  }
}
```

#### 5. `tool.result`

```json
{
  "type": "tool.result",
  "timestamp": 1713182408000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "tool": "Read",
    "result": {
      "summary": "245 lines, 3 classes (OrderController, OrderService, OrderRepository)",
      "truncated": true // Si résultat > 10KB, tronquer
    }
  }
}
```

#### 6. `file.diff`

```json
{
  "type": "file.diff",
  "timestamp": 1713182410000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "file": "src/controllers/OrderController.php",
    "diff": "--- a/src/controllers/OrderController.php\n+++ b/src/controllers/OrderController.php\n@@ -42,1 +42,1 @@\n- if ($status == \"confirmed\")\n+ if ($status === \"confirmed\") // Strict comparison\n",
    "compressed": false // true si compression zstd activée
  }
}
```

#### 7. `agent.response`

```json
{
  "type": "agent.response",
  "timestamp": 1713182412000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "message": "I found 1 critical issue: non-strict comparison in OrderController.php line 42. I've applied a fix.",
    "summary": "1 issue fixed"
  }
}
```

#### 8. `session.end`

```json
{
  "type": "session.end",
  "timestamp": 1713184200000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "reason": "user_exit", // "user_exit" | "timeout" | "error"
    "duration_seconds": 1800
  }
}
```

---

## Diff streaming

### Principe

Les diffs peuvent être volumineux (100KB+ pour gros fichiers). Stratégies :

1. **Truncation** : Si diff > 50KB, envoyer résumé + lien téléchargement
2. **Chunk-based** : Envoyer diff en chunks de 10KB (streaming)
3. **Compression** : zstd pour diff > 10KB

### Chunk-based streaming

```json
// Event 1/3
{
  "type": "file.diff.chunk",
  "timestamp": 1713182410000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "file": "src/services/OrderService.php",
    "chunkIndex": 0,
    "totalChunks": 3,
    "data": "--- a/src/services/OrderService.php\n+++ b/src/services/OrderService.php\n..."
  }
}

// Event 2/3
{
  "type": "file.diff.chunk",
  "timestamp": 1713182410100,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "file": "src/services/OrderService.php",
    "chunkIndex": 1,
    "totalChunks": 3,
    "data": "..."
  }
}

// Event 3/3 (final)
{
  "type": "file.diff.chunk",
  "timestamp": 1713182410200,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "file": "src/services/OrderService.php",
    "chunkIndex": 2,
    "totalChunks": 3,
    "data": "...",
    "final": true
  }
}
```

### Compression (zstd)

```typescript
import { compress } from '@bokuweb/zstd-wasm';

async function compressDiff(diff: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(diff);
  return await compress(data, 10); // Niveau 10
}

// Event avec compression
{
  "type": "file.diff",
  "timestamp": 1713182410000,
  "sessionId": "01J7XKQZ8M9N2P3Q4R5S6T",
  "payload": {
    "file": "src/services/OrderService.php",
    "diff": "<base64-encoded-zstd-compressed-data>",
    "compressed": true,
    "originalSize": 102400, // 100KB
    "compressedSize": 12800  // 12.5KB (87.5% reduction)
  }
}
```

### Rendu incrémental (browser)

Utiliser `react-diff-viewer` avec streaming support :

```tsx
import ReactDiffViewer from 'react-diff-viewer-continued';

function DiffPanel({ sessionId }: { sessionId: string }) {
  const [chunks, setChunks] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    const ws = new WebSocket(`wss://live.claude-craft.dev/s/${sessionId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'file.diff.chunk') {
        const { file, chunkIndex, data: chunkData, final } = data.payload;

        setChunks((prev) => {
          const fileChunks = prev.get(file) || [];
          fileChunks[chunkIndex] = chunkData;

          if (final) {
            // Reconstruct full diff
            const fullDiff = fileChunks.join('');
            return new Map(prev).set(file, [fullDiff]);
          }

          return new Map(prev).set(file, fileChunks);
        });
      }
    };

    return () => ws.close();
  }, [sessionId]);

  return (
    <div>
      {Array.from(chunks.entries()).map(([file, chunkArray]) => {
        const diff = chunkArray.join('');
        const [oldCode, newCode] = parseDiff(diff);

        return (
          <div key={file}>
            <h3>{file}</h3>
            <ReactDiffViewer
              oldValue={oldCode}
              newValue={newCode}
              splitView={true}
              useDarkTheme={true}
            />
          </div>
        );
      })}
    </div>
  );
}
```

---

## Sécurité

### 1. Sanitization (secrets)

Redacter automatiquement les secrets avant streaming.

**Patterns détectés :**

| Type | Pattern | Replacement |
|------|---------|-------------|
| API Keys | `sk-[a-zA-Z0-9]{32,}` | `sk-***REDACTED***` |
| JWT | `eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.` | `***REDACTED_JWT***` |
| Passwords | `password["\']?\s*[:=]\s*["\']\w+["']` | `password: "***REDACTED***"` |
| PII (email) | `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` | `***@***.***` |
| Tokens | `AKIA[0-9A-Z]{16}` (AWS) | `AKIA***REDACTED***` |

**Implémentation :**

```typescript
function sanitizeOutput(text: string): string {
  return text
    .replace(/sk-[a-zA-Z0-9]{32,}/g, 'sk-***REDACTED***')
    .replace(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\./g, '***REDACTED_JWT***')
    .replace(/password["\']?\s*[:=]\s*["\']\w+["']/gi, 'password: "***REDACTED***"')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***')
    .replace(/AKIA[0-9A-Z]{16}/g, 'AKIA***REDACTED***');
}
```

### 2. Rate limiting

Limiter les events par session pour éviter DoS.

```typescript
const rateLimiters = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const limiter = rateLimiters.get(sessionId);

  if (!limiter || now > limiter.resetAt) {
    rateLimiters.set(sessionId, { count: 1, resetAt: now + 1000 }); // 1s window
    return true;
  }

  if (limiter.count >= 100) {
    return false; // Max 100 events/s
  }

  limiter.count++;
  return true;
}
```

### 3. Isolation (no replay cross-session)

Chaque session est isolée : un viewer ne peut pas accéder aux events d'une autre session.

```typescript
function validateSessionAccess(token: string, sessionId: string): boolean {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (decoded.session_id !== sessionId) {
    return false; // Token invalide pour cette session
  }

  return true;
}
```

### 4. Expiration (30min inactivité)

Session auto-close après 30 minutes sans events.

```typescript
const sessionTimers = new Map<string, NodeJS.Timeout>();

function updateSessionActivity(sessionId: string): void {
  // Clear existing timer
  const existingTimer = sessionTimers.get(sessionId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Set new timer (30 min)
  const newTimer = setTimeout(() => {
    closeSession(sessionId, 'timeout');
  }, 30 * 60 * 1000);

  sessionTimers.set(sessionId, newTimer);
}
```

---

## Persistence

### Opt-in

Par défaut, les sessions sont **éphémères** (RAM uniquement). L'utilisateur peut activer la persistence :

```bash
# Démarrer session avec persistence
claude-code --live --persist

# Output :
# Live session started (persistent): https://live.claude-craft.dev/s/01J7XKQZ8M9N2P3Q4R5S6T
# Events will be saved to S3 (replay available for 30 days).
```

### Stockage

**S3-compatible** (AWS S3, Cloudflare R2, MinIO)

Structure :

```
s3://claude-craft-live-sessions/
  <session-id>/
    metadata.json          # { sessionId, user, startedAt, endedAt, stack }
    events.jsonl           # Stream d'events (1 event/ligne)
    diffs/
      <file-hash>.diff     # Diffs volumineux (si > 50KB)
```

### Replay

```bash
# Viewer replay mode
https://live.claude-craft.dev/s/01J7XKQZ8M9N2P3Q4R5S6T?replay=true

# UI : timeline scrubber, play/pause, speed control
```

### Purge

Automatique après 30 jours (S3 lifecycle policy).

```typescript
// S3 lifecycle policy
{
  "Rules": [
    {
      "Id": "PurgeLiveSessions",
      "Status": "Enabled",
      "ExpirationInDays": 30,
      "Filter": {
        "Prefix": ""
      }
    }
  ]
}
```

---

## Viewer UI

### Features

| Feature | Description |
|---------|-------------|
| **Timeline** | Ligne temporelle avec markers (commandes, tools, diffs) |
| **Event list** | Liste chronologique des events, filtrable par type |
| **Diff panel** | Affichage side-by-side des diffs (react-diff-viewer) |
| **Filters** | All / Commands / Tools / Diffs / Agent messages |
| **Replay speed** | 1x / 2x / 4x |
| **Scrubber** | Jump to timestamp |
| **Search** | Recherche dans events (fichiers, texte) |

### Stack

| Layer | Technologie |
|-------|-------------|
| **Framework** | React 19.2 + TypeScript |
| **State** | Zustand |
| **WebSocket** | Native WebSocket API |
| **Diff viewer** | `react-diff-viewer-continued` |
| **UI** | Tailwind CSS + shadcn/ui |
| **Hosting** | Cloudflare Pages (Edge) |

### Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] Claude Craft Live    Session: 01J7XKQZ...  [Settings ⚙] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Timeline                                                       │
│  ──●────────●──────●─────────●────────────────────────> Now    │
│  14:02    14:05  14:08    14:12                                │
│                                                                 │
├───────────────────────────┬─────────────────────────────────────┤
│  Events (Left Panel)      │  Diff Panel (Right)                 │
│                           │                                     │
│  [Filters ▼]              │  src/controllers/OrderController.php│
│  ☑ All                    │  ┌──────────────────────────────┐   │
│  ☐ Commands               │  │ - if ($status == "confirmed")│   │
│  ☐ Tools                  │  │ + if ($status === "confirmed")   │
│  ☐ Diffs                  │  └──────────────────────────────┘   │
│  ☐ Agent                  │                                     │
│                           │  [Split View] [Unified View]        │
│  [14:12:34] User:         │                                     │
│  /team:audit              │                                     │
│                           │                                     │
│  [14:12:35] Agent:        │                                     │
│  Analyzing project...     │                                     │
│                           │                                     │
│  [14:12:37] Tool: Read    │                                     │
│  OrderController.php      │                                     │
│                           │                                     │
│  [14:12:40] Diff:         │                                     │
│  OrderController.php ▶    │                                     │
│                           │                                     │
│  [Speed: 1x ▼] [Replay ▶] │                                     │
│                           │                                     │
└───────────────────────────┴─────────────────────────────────────┘
```

---

## Monétisation

### Tiers

| Tier | Sessions/mois | Persistence | Prix |
|------|---------------|-------------|------|
| **Free** | 1 session | Non | $0 |
| **Pro** | Illimité | 30 jours | $29/mois |
| **Enterprise** | Illimité | 90 jours + analytics | Custom |

### Enterprise features

- **Analytics** : Dashboard (nombre sessions, durée moyenne, viewers max)
- **SSO** : SAML/OIDC integration
- **Custom domain** : `live.acme.com` au lieu de `live.claude-craft.dev`
- **Webhooks** : Notification Slack/Teams à la fin de session
- **Branded viewer** : Logo custom, couleurs

---

## Architecture technique

### Relay Server (Hono + ws)

```typescript
import { Hono } from 'hono';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

const app = new Hono();
const wss = new WebSocketServer({ noServer: true });

// Sessions actives
const sessions = new Map<string, Set<WebSocket>>();

// Upgrade HTTP → WebSocket
app.get('/s/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const token = c.req.query('token');

  // Valider token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { session_id: string };
    if (decoded.session_id !== sessionId) {
      return c.text('Unauthorized', 401);
    }
  } catch {
    return c.text('Invalid token', 401);
  }

  // Upgrade to WebSocket
  const upgrade = await c.req.raw.headers.get('upgrade');
  if (upgrade !== 'websocket') {
    return c.text('Expected WebSocket', 426);
  }

  // Handle WebSocket
  wss.handleUpgrade(c.req.raw, c.req.raw.socket, Buffer.alloc(0), (ws) => {
    // Ajouter client à la session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, new Set());
    }
    sessions.get(sessionId)!.add(ws);

    // Envoyer historique si replay
    const replay = c.req.query('replay') === 'true';
    if (replay) {
      sendHistoricalEvents(ws, sessionId);
    }

    ws.on('close', () => {
      sessions.get(sessionId)?.delete(ws);
    });
  });

  return c.text('Upgraded', 101);
});

// Endpoint CLI → broadcast event
app.post('/s/:sessionId/event', async (c) => {
  const sessionId = c.req.param('sessionId');
  const event = await c.req.json();

  // Valider CLI token
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !validateCliToken(authHeader)) {
    return c.text('Unauthorized', 401);
  }

  // Sanitize
  const sanitized = sanitizeEvent(event);

  // Rate limit
  if (!checkRateLimit(sessionId)) {
    return c.text('Rate limit exceeded', 429);
  }

  // Broadcast à tous les viewers
  const clients = sessions.get(sessionId);
  if (clients) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sanitized));
      }
    });
  }

  // Persist si opt-in
  if (event.persist) {
    await saveToPersistence(sessionId, sanitized);
  }

  return c.json({ ok: true });
});

export default app;
```

### CLI integration

```typescript
// claude-code/src/live-session.ts
import axios from 'axios';

export class LiveSession {
  private sessionId: string;
  private token: string;

  constructor(sessionId: string, token: string) {
    this.sessionId = sessionId;
    this.token = token;
  }

  async sendEvent(event: any): Promise<void> {
    await axios.post(
      `https://live.claude-craft.dev/s/${this.sessionId}/event`,
      event,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Hook dans le runner Claude Code
function onCommandIssued(command: string, liveSession?: LiveSession): void {
  if (liveSession) {
    liveSession.sendEvent({
      type: 'command.issued',
      timestamp: Date.now(),
      sessionId: liveSession.sessionId,
      payload: { command },
    });
  }
}

function onToolUse(tool: string, input: any, liveSession?: LiveSession): void {
  if (liveSession) {
    liveSession.sendEvent({
      type: 'tool.use',
      timestamp: Date.now(),
      sessionId: liveSession.sessionId,
      payload: {
        tool,
        input: {
          summary: summarizeToolInput(input),
        },
      },
    });
  }
}
```

---

## Diagramme séquence

```
┌─────────┐         ┌─────────────┐         ┌─────────────┐         ┌──────────┐
│ CLI     │         │ Relay Server│         │ Viewer (WS) │         │ S3       │
│ (pilot) │         │ (Hono + ws) │         │ (browser)   │         │(optional)│
└────┬────┘         └──────┬──────┘         └──────┬──────┘         └────┬─────┘
     │                     │                       │                     │
     │ POST /session/new   │                       │                     │
     ├────────────────────>│                       │                     │
     │ 201 { sessionId, token, url }               │                     │
     │<────────────────────┤                       │                     │
     │                     │                       │                     │
     │ (User shares URL)   │                       │                     │
     │                     │                       │                     │
     │                     │   GET /s/:id?token=   │                     │
     │                     │<──────────────────────┤                     │
     │                     │   101 Upgrade (WS)    │                     │
     │                     ├──────────────────────>│                     │
     │                     │                       │                     │
     │ POST /s/:id/event   │                       │                     │
     │ { type: "command.issued", payload: {...} }  │                     │
     ├────────────────────>│                       │                     │
     │                     │   WS: event JSON      │                     │
     │                     ├──────────────────────>│                     │
     │                     │   (if persist)        │                     │
     │                     │   PUT /s/:id/events.jsonl                   │
     │                     ├────────────────────────────────────────────>│
     │                     │                       │                     │
     │ POST /s/:id/event   │                       │                     │
     │ { type: "tool.use", payload: {...} }        │                     │
     ├────────────────────>│                       │                     │
     │                     │   WS: event JSON      │                     │
     │                     ├──────────────────────>│                     │
     │                     │                       │                     │
     │ POST /s/:id/event   │                       │                     │
     │ { type: "file.diff", payload: {...} }       │                     │
     ├────────────────────>│                       │                     │
     │                     │   WS: event JSON      │                     │
     │                     ├──────────────────────>│                     │
     │                     │                       │                     │
     │ (30 min inactivity) │                       │                     │
     │                     │   WS: session.end     │                     │
     │                     ├──────────────────────>│                     │
     │                     │   WS close            │                     │
     │                     ├──────────────────────>│                     │
     │                     │                       │                     │
     │                     │   PUT /s/:id/metadata.json                  │
     │                     ├────────────────────────────────────────────>│
     │                     │                       │                     │
```

---

## Références

### Collaboration patterns

- **Excalidraw** : [Architecture](https://blog.excalidraw.com/building-excalidraw-p2p-collaboration-feature/) — P2P collaboration, WebRTC fallback WebSocket
- **Replit Multiplayer** : [Docs](https://docs.replit.com/hosting/multiplayer) — Real-time collaborative coding
- **VS Code Live Share** : [Architecture](https://code.visualstudio.com/learn/collaboration/live-share) — Session sharing, read-only/read-write modes

### WebSocket scaling

- **Hono** : [Docs](https://hono.dev/) — Edge runtime (Cloudflare Workers, Deno Deploy)
- **ws** : [npm](https://www.npmjs.com/package/ws) — WebSocket library Node.js
- **Cloudflare Durable Objects** : [Docs](https://developers.cloudflare.com/durable-objects/) — Stateful WebSocket sessions (alternative Redis)

### Diff rendering

- **react-diff-viewer-continued** : [GitHub](https://github.com/aeolun/react-diff-viewer) — React component, split/unified view
- **diff** : [npm](https://www.npmjs.com/package/diff) — JS diff library (unified diff format)

### Compression

- **@bokuweb/zstd-wasm** : [npm](https://www.npmjs.com/package/@bokuweb/zstd-wasm) — Zstandard compression (WASM)

---

**Date de dernière mise à jour :** 2026-04-15  
**Version :** 1.0.0  
**Auteur :** The Bearded CTO
