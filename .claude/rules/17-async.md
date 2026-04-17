# Async-First — Quick Reference

Architecture async-first pour améliorer la réactivité en déchargeant les traitements longs vers des workers en arrière-plan.

**Principes clés :**
- ✅ Requêtes HTTP < 200ms (toute opération > 200ms doit être async)
- ✅ Idempotence obligatoire (messages peuvent être rejoués)
- ✅ Retry policy + Dead Letter Queue (3 retries, backoff exponentiel)
- ✅ Competing consumers (4-8 workers en parallèle pour throughput)
- ✅ Lifecycle tracking (logging, metrics, alerting)

**Frameworks :** Symfony Messenger, Laravel Queue, Ecotone (framework-agnostic)

**Patterns avancés :** Idempotency keys, retry strategies, DLQ, lifecycle events

> Détails complets, exemples et checklists : `@.claude/skills/async/SKILL.md`
