# Principes SOLID — Quick Reference

Les principes SOLID sont **obligatoires** pour tout le code du projet.

| Principe | Regle | Verification |
|----------|-------|-------------|
| **SRP** | 1 classe = 1 responsabilite. Methodes : cible < 10 lignes, limite < 20 (voir règle 05). | Nommage clair, pas de "and/or" |
| **OCP** | Extension via interfaces/Strategy, pas modification. | Pas de switch/if sur types |
| **LSP** | Sous-types substituables. Pas de preconditions renforcees. | Contrats respectes |
| **ISP** | Interfaces segregees par client (heuristique interne : < 5 methodes). | Pas de NotImplementedException |
| **DIP** | Dependre d'abstractions (interfaces dans le domaine). | Injection par constructeur |

**Architecture en couches :** Presentation → Application → Domain ← Infrastructure (DIP)

## Architectures 2026 — alternatives pragmatiques

Clean Architecture stricte reste valide, mais **accepter des alternatives** quand pertinent :

| Pattern | Quand l'utiliser | Source |
|---------|------------------|--------|
| **Vertical Slice Architecture (VSA)** | Features isolees (ex: API endpoints CRUD), eviter la sur-abstraction par couches | [Bogard, Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/) |
| **Modular Monolith** | Fatigue microservices, un deploiement, modules decouples (Spring Modulith) ; combiner avec des **Vertical Slices par module** pour borner le contexte (humain comme agent IA) | [Spring Modulith](https://docs.spring.io/spring-modulith/reference/) |
| **Hexagonal + DDD** | Bounded contexts clairs, ports/adapters explicites | Classique |
| **Clean pragmatique** | Accepter DTOs/Shared Kernels traversant les couches | 2026 |

**Checklist :**
- [ ] Chaque classe a une seule responsabilite
- [ ] Nouvelles fonctionnalites par extension, pas modification
- [ ] Interfaces petites et focalisees
- [ ] Use cases dependent d'interfaces, pas d'implementations
- [ ] Pattern architectural choisi selon le contexte (Clean / VSA / Modular Monolith)

> Details complets et exemples : `@.claude/references/base/solid-principles.md`
