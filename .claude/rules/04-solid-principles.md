# Principes SOLID — Quick Reference

Les principes SOLID sont **obligatoires** pour tout le code du projet.

| Principe | Regle | Verification |
|----------|-------|-------------|
| **SRP** | 1 classe = 1 responsabilite. Methodes < 20 lignes. | Nommage clair, pas de "and/or" |
| **OCP** | Extension via interfaces/Strategy, pas modification. | Pas de switch/if sur types |
| **LSP** | Sous-types substituables. Pas de preconditions renforcees. | Contrats respectes |
| **ISP** | Interfaces < 5 methodes, segregees par client. | Pas de NotImplementedException |
| **DIP** | Dependre d'abstractions (interfaces dans le domaine). | Injection par constructeur |

**Architecture en couches :** Presentation → Application → Domain ← Infrastructure (DIP)

**Checklist :**
- [ ] Chaque classe a une seule responsabilite
- [ ] Nouvelles fonctionnalites par extension, pas modification
- [ ] Interfaces petites et focalisees
- [ ] Use cases dependent d'interfaces, pas d'implementations

> Details complets et exemples : `@.claude/references/base/solid-principles.md`
