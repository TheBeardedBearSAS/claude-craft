---
name: architect
description: Phase d'architecture systématique AVANT le code (TDD). Use when starting a new feature that touches multiple files, designing a new module, or making non-trivial architectural choices.
triggers:
  keywords: ["architect", "design", "new feature", "structure", "boundaries", "dependencies", "module design"]
auto_suggest: true
---

# Architect — Phase d'architecture avant TDD

Skill inspiré de [obra/superpowers](https://github.com/obra/superpowers). **Objectif :** produire une spec d'architecture avant d'écrire le moindre test ou ligne de code.

**Règle d'or :** si tu ne peux pas dessiner le diagramme, tu ne peux pas coder la feature.

## Quand utiliser

| Situation | Architect phase ? |
|-----------|-------------------|
| Bug 1 fichier | ❌ Non (go direct TDD) |
| Nouvelle feature < 3 fichiers | ⚠️ Court (10 min) |
| Nouvelle feature > 3 fichiers | ✅ Obligatoire |
| Nouveau module/bounded context | ✅ Obligatoire |
| Migration technique | ✅ Obligatoire |
| Intégration externe (API, MQ, DB) | ✅ Obligatoire |

## Processus en 5 étapes

### 1. Identifier les boundaries

Quelles **frontières** la feature touche-t-elle ?

- **Domain boundaries** — quels bounded contexts impliqués ?
- **Layer boundaries** — Presentation / Application / Domain / Infrastructure ?
- **Process boundaries** — sync HTTP / async queue / event-driven ?
- **Data boundaries** — quelles bases de données, quelles tables ?
- **Ownership boundaries** — quelle équipe owne quel morceau ?

**Output :** liste des frontières traversées.

### 2. Définir les contrats

Pour chaque frontière traversée, définir le **contrat** :

- **Inputs** : format, types, invariants, nullabilité
- **Outputs** : format, codes d'erreur, latence cible
- **Side effects** : écritures DB, events émis, appels externes
- **Idempotence** : le contrat est-il idempotent ?
- **Transactions** : atomique ? eventually consistent ?

**Output :** signatures de fonctions/endpoints + DTO.

### 3. Dessiner les dépendances

Qui dépend de quoi ? Dans quel sens ?

```
[HTTP Controller] ──▶ [Use Case] ──▶ [Domain Service]
                                          │
                                          ▼
                                     [Repository] (interface)
                                          │
                                          ▼
                        [Postgres Adapter] ─implements─▶
```

**Vérifier :**
- [ ] Pas de cycle (A → B → A)
- [ ] DIP respecté (domain ne dépend pas de l'infra)
- [ ] Pas plus de 3 niveaux d'appel entre entrée et côté métier

**Output :** diagramme (Mermaid, ASCII, ou texte structuré).

### 4. Lister les trade-offs

Pour chaque décision non évidente, documenter **pourquoi** ce choix :

| Décision | Alternative envisagée | Pourquoi ce choix |
|----------|----------------------|-------------------|
| Async via queue | Sync HTTP | Latence >500ms, pas critique immédiat |
| CQRS | CRUD simple | Ratio 20:1 lecture/écriture |
| Event sourcing | Store état | Besoin audit légal |

**Output :** ADR léger (3-5 bullets) — voir `.claude/rules/10-documentation.md` pour ADR formel si décision majeure.

### 5. Définir les tests d'architecture

**Avant TDD sur le comportement**, définir les tests d'architecture :

- Tests de dépendances (ArchUnit, Dephpend, deptrac)
- Tests de contrats (OpenAPI validation, contract tests)
- Tests de performance cibles (latence p99, throughput)
- Tests d'isolation multitenant si applicable

**Output :** liste de tests d'architecture à écrire en Phase TDD.

## Livrables

À la fin de la phase Architect, produire :

1. **Diagramme** dépendances (1 page max)
2. **Contrats** des frontières (signatures + DTO)
3. **ADR court** trade-offs principaux
4. **Liste de tests** d'architecture
5. **Découpage en tâches atomiques** (voir skill `atomic-tasks`)

Ce n'est qu'**après** qu'on rentre dans le TDD (Red/Green/Refactor).

## Anti-patterns

| Anti-pattern | Solution |
|--------------|----------|
| Coder directement sans diagramme | Dessiner AVANT, même 5 min suffisent |
| Architect phase > 2h sur feature simple | YAGNI — couper court |
| Contrats flous ("objet User") | Types stricts, tous les champs |
| Ignorer les trade-offs | ADR court obligatoire |
| Architecture en vase clos | Review par un pair ou subagent `@tech-lead` |

## Intégration Claude Craft

- **`/workflow:design`** — utilise ce skill par défaut
- **Agent `@tech-lead`** — peut produire l'output Architect
- **ADR formel** : voir `/common:architecture-decision`
- **Rule 04 SOLID** + **Rule 17 CQRS** + **Rule 14 Multitenant** — consulter selon contexte

## Ressources

- [obra/superpowers](https://github.com/obra/superpowers)
- Rule `.claude/rules/04-solid-principles.md`
- Rule `.claude/rules/10-documentation.md` (ADR)
- Skill `atomic-tasks`

---

**Date de dernière mise à jour :** 2026-04-15
**Version :** 1.0.0
