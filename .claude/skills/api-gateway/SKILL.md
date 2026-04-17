---
name: api-gateway
description: API Gateway patterns (Kong, Traefik, AWS API Gateway) — rate limiting, auth, routing, versioning. Use when implementing API gateway, reverse proxy, or API management.
triggers:
  files: ["**/kong*", "**/traefik*", "**/gateway*", "**/nginx*"]
  keywords: ["api gateway", "kong", "traefik", "nginx", "rate limiting", "api management", "reverse proxy", "load balancer", "circuit breaker"]
auto_suggest: true
---

# API Gateway — Kong, Traefik, Patterns

API Gateway moderne pour routing, auth, rate limiting, observabilité.

## Responsabilités

| Fonction | Outils |
|----------|--------|
| **Routing** (path, header, canary) | Kong, Traefik, Nginx |
| **Auth** (JWT, OAuth2, API keys) | Kong plugins, Traefik middleware |
| **Rate Limiting** (per-user/IP) | Redis-backed counters |
| **Load Balancing** | HAProxy, Traefik |
| **Circuit Breaker** | Resilience4j, Istio |

## Stacks

**Kong** — Enterprise, plugins riches, K8s-native  
**Traefik** — Cloud-native, auto-discovery  
**AWS API Gateway** — Managed, serverless  
**Nginx** — Performance max, self-hosted  
**Envoy** — Service mesh (Istio), gRPC

## Kong Config

```yaml
services:
  - name: payment-api
    url: http://payment:8080
    routes: [{ paths: ["/api/payments"] }]
    plugins: [rate-limiting, jwt, prometheus]
```

## Traefik Config

```yaml
http:
  routers:
    payment:
      rule: "PathPrefix(`/api/payments`)"
      middlewares: [rate-limit, auth]
  middlewares:
    rate-limit:
      rateLimit: { average: 100, burst: 50 }
```

## Rate Limiting Algorithms

**Fixed Window** — Simple counter, bursty  
**Sliding Window** — Rolling counter, lissé  
**Token Bucket** — Flexible, burst toléré  
**Leaky Bucket** — Output constant, strict

---

Pour setup : `@devops-engineer`
