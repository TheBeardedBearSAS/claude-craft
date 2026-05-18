# Paperclip — Project Context

> **Status :** Bootstrapped 2026-05-18 (audit ST-03). Adapt to your project.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ LTS |
| Language | TypeScript 5.5+ (strict) |
| Framework | Paperclip 2026.403+ |
| Database | PostgreSQL 15+ (RLS, JSONB) |
| Cache / Queue | Redis 7+, BullMQ |
| Tests | Vitest 4.1+, testcontainers |
| Secrets | HashiCorp Vault or AWS Secrets Manager |
| Observability | OpenTelemetry, Grafana, Loki |

## Conventions équipe

### Naming

- Adapters : `adapters/<provider>/` (lowercase, kebab-case).
- Use cases (control plane) : `control-plane/orchestrator/<feature>.usecase.ts`.
- Ports : `control-plane/ports/<adapter>.port.ts` (interface only).

### Layout fichier

- 1 fichier = 1 export public.
- Fonctions pures par défaut. Effet de bord = explicite (`async`, `port`).
- Pas de classes utilitaires (préférer functions + dépendance injectée).

### Tests

- Suffix `.test.ts` (unit), `.spec.ts` (integration), `.contract.ts` (provider).
- AAA strict (Arrange, Act, Assert).
- Pas de mocks de PostgreSQL — utiliser testcontainers.

## Quality gates

- TypeScript strict, `noImplicitAny: true`, `strictNullChecks: true`.
- ESLint + `@typescript-eslint/recommended-type-checked`.
- Prettier appliqué via pre-commit.
- Mutation score Stryker ≥ 70 % sur `control-plane/`.
- Couverture branches ≥ 85 % global.

## Décisions architecturales notables (à compléter par projet)

- ADR-001 : Choix Paperclip vs Workato/Tray.io
- ADR-002 : Strategy idempotency keys (lookup vs write-through)
- ADR-003 : PostgreSQL RLS vs middleware filtering

## Critères de validation (DoD story Paperclip)

- [ ] Use case + port + adapter implémentés et testés
- [ ] Idempotency key ajoutée sur toute mutation sortante
- [ ] Audit trail enregistré dans la même transaction que la mutation locale
- [ ] Tests d'isolation multi-tenant verts (tenant A ne voit pas B)
- [ ] Migration PostgreSQL avec policy RLS
- [ ] Dashboard Grafana mis à jour (latency p95 + DLQ depth)
- [ ] Documentation user-facing à jour (CHANGELOG + release notes)
