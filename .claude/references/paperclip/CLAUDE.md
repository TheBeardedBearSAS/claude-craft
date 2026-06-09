# Paperclip 2026.529+ — Quick Reference

> **Status :** Reference set bootstrapped 2026-05-18 (audit ST-03). Promesse marketing de la table `--tech=paperclip` désormais tenue avec un minimum vital. Pull requests bienvenues pour enrichir.

## Versions requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| Paperclip | 2026.529.0+ | Two-layer architecture (control plane + adapters) |
| Node.js | 20+ LTS (22 LTS recommandé, testé en CI) | TypeScript natif |
| TypeScript | 5.7+ | Strict mode obligatoire |
| Vitest | 4.1+ | Tests unit + intégration |
| PostgreSQL | 15+ | RLS pour multi-tenant, JSONB pour audit trail |

## Philosophie : Governance-First

Paperclip impose deux invariants non-négociables :

1. **Séparation stricte control plane ↔ adapters.** Le control plane orchestre, applique les policies, écrit l'audit trail. Les adapters traduisent vers les API tierces. Aucun import croisé.
2. **Audit trail immuable.** Chaque opération significative doit produire une ligne d'audit signée et stockée hors du chemin chaud de l'application.

## Architecture two-layer

```
src/
├── control-plane/         # Orchestration, policies, audit, governance
│   ├── orchestrator/      # Use cases métier
│   ├── policy/            # Règles d'autorisation, validation
│   ├── audit/             # Audit trail writer
│   └── ports/             # Interfaces d'adapter (ce dont le CP a besoin)
│
├── adapters/              # Intégrations tierces (Stripe, Salesforce, etc.)
│   ├── stripe/
│   ├── salesforce/
│   └── shared/            # Helpers communs (backoff, retry, DLQ)
│
└── infra/                 # PostgreSQL, Redis, Vault, observability
```

**Règle d'or :** `control-plane/` ne contient aucun `import` qui chemine vers `adapters/*`. Le couplage va du registre d'adapter (résolu au runtime, par `tenantId` + `providerKey`).

## Patterns critiques

### 1. Idempotency keys

Chaque opération externe doit accepter une clé d'idempotency stable, persistée AVANT l'appel sortant. Replay = lookup, pas réexécution.

```typescript
const idempotencyKey = `charge:${tenantId}:${orderId}`;
const existing = await idempotencyStore.lookup(idempotencyKey);
if (existing) return existing.response;

const response = await adapter.createCharge(params);
await idempotencyStore.write(idempotencyKey, response, ttl: '7d');
return response;
```

### 2. Retry avec backoff exponentiel + DLQ

Tous les appels adapters doivent passer par un wrapper retry. Pas de retry inline ad-hoc.

```typescript
import { retry } from './adapters/shared/retry';

await retry(() => adapter.send(payload), {
  attempts: 5,
  backoff: 'exponential',
  jitter: true,
  onExhausted: (error) => dlq.publish({ payload, error }),
});
```

### 3. Audit trail signé

Chaque mutation produit une ligne JSONB signée stockée en append-only.

```typescript
await audit.record({
  tenantId,
  actor: ctx.user.id,
  action: 'charge.created',
  resource: { type: 'order', id: orderId },
  metadata: { amount, currency, providerKey },
  signature: await signer.sign({ ... }),
});
```

### 4. Multi-tenant isolation

- `tenant_id` propagé dans toutes les requêtes (`AsyncLocalStorage` ou paramètre explicite).
- PostgreSQL Row-Level Security (RLS) activé sur **toutes** les tables.
- Tests d'isolation obligatoires : un tenant A ne doit jamais lire les données de B.

```sql
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON charges
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

## Testing (Vitest 4.1+)

- **Unit** : control-plane et adapters testés séparément avec doubles.
- **Integration** : control-plane + vrai PostgreSQL (testcontainers).
- **Contract tests** : adapters vs vrais providers en environnement sandbox.
- **Multi-tenant isolation tests** : reproduction systématique de scénarios de leakage.
- **Mutation testing (Stryker)** : seuil minimal 70 % sur control-plane.

```bash
npm run test                 # unit
npm run test:integration     # avec testcontainers
npm run test:contract        # adapters vs providers sandbox
npm run test:mutation        # Stryker (Vitest 4 + control-plane scope)
```

## Sécurité

- Secrets dans Vault (HashiCorp / AWS Secrets Manager), **jamais** dans `.env` commit.
- Rotation automatique des credentials providers (Stripe, Salesforce…).
- Logs **scrubés** : pas de PAN, pas de tokens, pas de PII brute (cf. `rules/11-security.md`).
- OWASP API Top 10 :2023 review trimestrielle.

## Observability

- OpenTelemetry traces sur chaque appel adapter (tenantId en attribut).
- Logs structurés JSON (zod-validated).
- Metrics : `paperclip.adapter.duration`, `paperclip.idempotency.hit_ratio`, `paperclip.dlq.depth`.
- Dashboard Grafana minimum : taux d'erreur par adapter, latency p95, DLQ depth.

## Checklist rapide

- [ ] Aucun import `control-plane/* → adapters/*`
- [ ] Idempotency keys présentes sur toutes les mutations sortantes
- [ ] Retry wrapper unique (pas de retry inline)
- [ ] Audit trail signé pour chaque mutation
- [ ] PostgreSQL RLS actif sur toutes les tables tenant-scoped
- [ ] Tests d'isolation multi-tenant verts
- [ ] Mutation score Stryker ≥ 70 % sur control-plane
- [ ] Secrets dans Vault, rotation < 90 jours
- [ ] OpenTelemetry traces sur chaque adapter call

## Company Skills (v2026.529+)

Paperclip v529 introduit un catalogue de **Company Skills** : des capacités d'agent packagées et distribuables, alignées avec la philosophie governance-first.

### Concept

Un *skill* est une unité de compétence encapsulée qu'un agent peut acquérir au `hire`. Deux catégories :

| Catégorie | Description |
|-----------|-------------|
| **Bundled** | Inclus par défaut dans chaque agent (ex : audit trail writer, idempotency enforcer) |
| **Optional** | Activés explicitement selon le rôle de l'agent (ex : stripe-adapter-skill, salesforce-connector-skill) |

### Assignation via `desiredSkills`

Les skills sont déclarés lors du hire d'un agent, dans la configuration du control plane :

```typescript
const agent = await controlPlane.hire({
  role: 'payment-processor',
  tenantId,
  desiredSkills: [
    'idempotency-enforcer',   // bundled — activé explicitement
    'stripe-adapter-skill',   // optional — spécifique au provider
    'audit-trail-writer',     // bundled — toujours recommandé
  ],
});
```

Les skills bundled non déclarés dans `desiredSkills` restent désactivés pour limiter la surface d'attaque (principe du moindre privilège).

### Gouvernance

- Les skills disponibles dans le catalogue sont listés via la CLI Paperclip (commandes de gestion de l'instance, à consulter dans la documentation officielle de votre version).
- Les skills optionnels doivent être audités avant activation (cf. checklist sécurité ci-dessous).
- Chaque skill activé est tracé dans l'audit trail au moment du hire.

> **Note :** Les détails d'API CLI peuvent varier selon la build de votre instance Paperclip. Référez-vous à la documentation interne ou à votre vendor Paperclip pour les commandes exactes.

## Documentation complémentaire

- `project-context.md` — Contexte projet, conventions équipe
- (à enrichir) `architecture.md` — Schéma two-layer détaillé, ADRs
- (à enrichir) `testing.md` — Stratégie tests détaillée
- (à enrichir) `security.md` — Threat model + OWASP API Top 10
