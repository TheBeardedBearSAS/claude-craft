# CQRS — Quick Reference

CQRS sépare les opérations de lecture (Query) et d'écriture (Command) dans des modèles distincts.

| Quand utiliser | Quand NE PAS utiliser |
|----------------|----------------------|
| Domaine complexe, 95% lectures | CRUD simple, domaine pauvre |
| Audit/compliance (Event Sourcing) | Petit projet, équipe junior |
| Scalabilité hétérogène (read replicas) | Cohérence immédiate requise |

**Architecture :** Command Side (write model normalisé) → Event → Query Side (read model dénormalisé, projections)

**Trade-off clé :** Eventual consistency contre scalabilité indépendante lecture/écriture.

**Règle d'or :** CQRS est une optimisation. Commencer par architecture classique, migrer si le problème justifie la complexité.

> Détails complets, implémentations et checklists : `@.claude/skills/cqrs/SKILL.md`
