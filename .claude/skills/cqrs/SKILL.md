---
name: cqrs
description: CQRS - Command Query Responsibility Segregation. Use when implementing DDD patterns, separating read/write models, event sourcing, or building scalable architectures with heterogeneous performance requirements.
context: fork
triggers:
  files: ["**/Command*.php", "**/Query*.php", "**/Handler*.php", "**/Projector*.php", "**/ReadModel*.php", "**/WriteModel*.php"]
  keywords: ["cqrs", "command", "query", "event sourcing", "projection", "read model", "write model", "command handler", "query handler"]
auto_suggest: true
disable-model-invocation: true
---

# CQRS — Quick Reference

CQRS (Command Query Responsibility Segregation) sépare les opérations d'**écriture** et de **lecture** dans des modèles distincts. **N'est pas** par défaut — c'est une optimisation à activer quand le coût de la complexité est justifié.

## Quand utiliser

| Pertinent | Pas pertinent |
|-----------|---------------|
| Domaine métier complexe avec règles d'invariants riches | CRUD simple, domaine pauvre |
| Ratio lectures/écritures > 10× | Petits projets, équipe junior |
| Audit / compliance (Event Sourcing naturel) | Cohérence immédiate requise |
| Read models hétérogènes (mobile vs analytics vs back-office) | Modèle de données stable et unique |
| Scale différencié reads vs writes (replicas, cache, search) | Charge faible, monolithe modeste |

**Règle d'or :** commencer par une architecture classique. Migrer vers CQRS lorsqu'**au moins 2** des cas pertinents sont présents simultanément.

## Architecture en 30 secondes

```
[ User ]
   ↓
[ Command ]──────────▶ [ Write Model (Domain) ]
                              ↓ persist + emit
                       [ Event(s) ]
                              ↓
[ Query ] ◀───── [ Read Model (denormalised) ] ◀── projections
```

- **Command side** : modèle normalisé, focus invariants métier. Écrit, ne lit que ce qui est nécessaire à la validation.
- **Query side** : modèle dénormalisé, focus performance lecture. N'a pas de logique métier.
- **Projections** : transforment les events en read models. **Eventually consistent**.

## Trade-off central

| Bénéfice | Coût |
|----------|------|
| Scale indépendant lecture / écriture | Eventual consistency (≈ 50-500 ms latency typique) |
| Read models taillés pour chaque besoin | Plus de code à maintenir (2 modèles) |
| Event Sourcing devient facile à brancher | Debugging plus complexe (event flow) |
| Audit trail naturel | Migration tardive très coûteuse |

## Patterns associés (souvent ensemble)

- **Event Sourcing** : stocker la séquence d'events comme source de vérité, le write model est reconstruit en replay.
- **Saga / Process Manager** : orchestrer des transactions distribuées via events.
- **Outbox Pattern** : garantir l'atomicité publication event + write DB.
- **Materialized Views** : projections persistées en table dédiée pour query speed.

## Anti-patterns critiques

- ❌ CQRS sans cas d'usage clair → over-engineering, double charge cognitive.
- ❌ Read model qui exécute des règles métier → bug d'invariants à chaque projection.
- ❌ Projections synchrones → on perd le bénéfice scalability.
- ❌ Event Sourcing sans snapshots → replay de millions d'events au boot.
- ❌ Command qui retourne data complète → c'est une Query déguisée.

## Pour aller plus loin

> Implémentations Symfony / Laravel / .NET, Event Sourcing (Prooph, EventStoreDB), saga patterns, outbox, exemples concrets, migration progressive d'un CRUD vers CQRS, checklists par phase : voir `@.claude/skills/cqrs/REFERENCE.md`.
