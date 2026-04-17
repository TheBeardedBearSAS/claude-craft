# Multitenant — Quick Reference

Architecture multitenant avec isolation tiered pour servir plusieurs clients avec une seule instance applicative.

| Tier | Isolation | Coût | Cas d'usage |
|------|-----------|------|-------------|
| **Tier 1** | Shared schema avec `tenant_id` | Faible | Startups, petits clients |
| **Tier 2** | Dedicated schema par tenant | Moyen | SMB, clients sensibles |
| **Tier 3** | Dedicated DB par tenant | Élevé | Enterprise, compliance stricte |

**Principes clés :**
- ✅ Isolation stricte des données entre tenants (filtres SQL, schémas, DBs dédiées)
- ✅ RBAC/ABAC par tenant pour contrôle d'accès fin
- ✅ Field-level encryption pour données sensibles (Halite, Eloquent Casting)
- ✅ Tests d'isolation obligatoires (un tenant ne peut pas accéder aux données d'un autre)
- ✅ Migration automatisée entre tiers selon la croissance

> Détails complets, implémentations et checklists : `@.claude/skills/multitenant/SKILL.md`
