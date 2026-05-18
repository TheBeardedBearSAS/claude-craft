---
name: multitenant
description: Architecture multitenant avec approche tiered (Shared/Dedicated Schema/DB), RBAC/ABAC, field-level encryption. Use when working with multitenant applications, tenant isolation, data segregation.
context: fork
triggers:
  files: ["**/TenantFilter.php", "**/TenantScope.php", "**/middleware/Tenant*"]
  keywords: ["multitenant", "multi-tenant", "tenant", "isolation", "tenant_id", "schema", "RBAC", "ABAC", "field-level encryption"]
auto_suggest: true
disable-model-invocation: true
---

# Multitenant — Quick Reference

Servir plusieurs clients (tenants) sur la même base de code avec **isolation stricte** et un coût d'infra contrôlé.

## Trois tiers d'isolation

| Tier | Isolation | Coût | Cas d'usage |
|------|-----------|------|-------------|
| **Tier 1 — Shared schema** | colonne `tenant_id` partout, filtres SQL automatiques | Faible | Startups, free / petits clients |
| **Tier 2 — Dedicated schema** | un schéma PostgreSQL par tenant | Moyen | SMB, clients exigeants |
| **Tier 3 — Dedicated DB** | une base entière par tenant | Élevé | Enterprise, compliance stricte (HDS, FedRAMP) |

**Règle de migration** : commencer Tier 1, migrer un client en Tier 2/3 quand il représente > 20 % du revenu OU exige un SLA spécifique.

## Cinq invariants non-négociables

1. **`tenant_id` propagé à chaque requête** (AsyncLocalStorage / SecurityContext / middleware).
2. **PostgreSQL Row-Level Security (RLS) activé sur TOUTES les tables.** Filet de sécurité contre un oubli applicatif.
3. **Tests d'isolation obligatoires.** Tenant A ne doit jamais lire/écrire les données de B — y compris via tri, requête nuée, agrégat.
4. **Audit trail isolé par tenant.** Pas de log multi-tenant cross-référencé sans permission explicite.
5. **Field-level encryption** sur PII / secrets sensibles (Halite PHP, Eloquent Casts, libsodium).

## Pattern minimal — Shared schema + RLS

```sql
ALTER TABLE invoices ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

```php
// Symfony — middleware qui set la variable session pour RLS
$conn->executeStatement(
    'SET LOCAL app.tenant_id = :tid',
    ['tid' => $tenantId]
);
```

## Anti-patterns critiques

- ❌ Oublier le filtre `tenant_id` dans une requête raw → fuite cross-tenant.
- ❌ Cache Redis sans préfixe tenant → données de A retournées à B.
- ❌ Job worker async qui perd le `tenant_id` → impossible de retrouver le contexte.
- ❌ Signed URLs / tokens sans `tenant_id` dans le payload → utilisable cross-tenant.
- ❌ Field encryption avec une clé unique partagée → compromission = exposition totale (préférer keys per tenant).

## RBAC / ABAC

- **RBAC** : rôles globaux (`admin`, `member`, `viewer`) suffisent pour 80 % des cas.
- **ABAC** : passer à des policies (Casbin, Cerbos, OPA) quand les règles dépendent d'attributs (région, montant, statut).

## Pour aller plus loin

> Patterns détaillés par tier, migration tier 1 → tier 2 sans downtime, tests d'isolation (Pest + tenant fixtures), RBAC/ABAC, exemples Laravel + Symfony, checklists par phase : voir `@.claude/skills/multitenant/REFERENCE.md`.
