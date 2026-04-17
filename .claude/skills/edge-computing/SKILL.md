---
name: edge-computing
description: Cloudflare Workers, Deno Deploy, Vercel Edge Functions, edge patterns (geo-routing, caching). Use when implementing edge compute, CDN logic, or global low-latency APIs.
triggers:
  files: ["**/workers/**", "**/edge/**", "**/deno-deploy/**"]
  keywords: ["cloudflare workers", "deno deploy", "vercel edge", "edge functions", "edge compute", "cdn", "geo-routing", "edge caching"]
auto_suggest: true
---

# Edge Computing — Cloudflare Workers, Deno Deploy

Compute global faible latence, proche utilisateur.

## Platforms

**Cloudflare Workers** — V8, 300+ POPs, KV/Durable  
**Deno Deploy** — Deno, 30+ POPs, TypeScript  
**Vercel Edge** — V8, 20+ POPs, Next.js  
**Fastly Compute@Edge** — WASM, 70+ POPs

## Geo-Routing

```javascript
export default {
  async fetch(req) {
    const api = req.cf.country === 'US' ? 'us-api' : 'eu-api';
    return fetch(`https://${api}.example.com${req.url}`);
  }
};
```

## Edge Caching (KV)

```javascript
const key = new URL(req.url).pathname;
let cached = await env.KV.get(key);
if (cached) return new Response(cached, { headers: { 'X-Cache': 'HIT' } });
const resp = await fetch('https://origin.com' + key);
const body = await resp.text();
await env.KV.put(key, body, { expirationTtl: 3600 });
return new Response(body, { headers: { 'X-Cache': 'MISS' } });
```

## A/B Testing

```javascript
const variant = Math.random() < 0.5 ? 'A' : 'B';
resp.cookies.set('ab_test', variant);
```

## Bot Detection

```javascript
if (/bot|crawler/i.test(req.headers.get('User-Agent'))) {
  return new Response('Forbidden', { status: 403 });
}
```

## Durable Objects (Stateful)

```javascript
export class ChatRoom {
  async fetch(req) {
    const [client, server] = Object.values(new WebSocketPair());
    this.sessions.push(server); server.accept();
    server.on('message', e => this.broadcast(e.data));
    return new Response(null, { status: 101, webSocket: client });
  }
}
```

## Constraints

**CPU** 10-50ms → offload heavy  
**Memory** 128MB → streaming  
**No FS** → KV/R2

---

Voir `@.claude/skills/wasm/SKILL.md`
